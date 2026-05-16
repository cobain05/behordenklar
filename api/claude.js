/**
 * Vercel Serverless Function: POST /api/claude
 * Proxies JSON requests to https://api.anthropic.com/v1/messages
 * (same role as server.py for local development).
 * Default model if the client omits `model`: claude-haiku-4-5-20251001 (matches index.html).
 */

const DEFAULT_ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";
const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";
const MAX_BODY_BYTES = 60 * 1024 * 1024;
const MAX_FILE_BYTES = 32 * 1024 * 1024;
const ALLOWED_FILE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "pdf"]);
const INVALID_FILE_TYPE_MESSAGE =
  "Bitte lade nur Dateien im Format JPG, JPEG, PNG, WEBP oder PDF hoch.";
const FILE_TOO_LARGE_MESSAGE = "Eine Datei ist zu groß. Bitte lade nur Dateien bis maximal 32 MB hoch.";
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MESSAGE =
  "Du hast in dieser Stunde bereits 5 Briefe analysiert. Bitte warte eine Stunde und versuche es erneut.";
const rateLimitBuckets = new Map();

function headerValue(req, name) {
  var v = req.headers[name.toLowerCase()];
  if (Array.isArray(v)) {
    return (v[0] || "").toString();
  }
  return (v || "").toString();
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, anthropic-version");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
}

function sendJsonError(res, status, message, type, extra) {
  setCors(res);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  var error = Object.assign({ type: type || "proxy_error", message: message }, extra || {});
  res.end(JSON.stringify({ error: error }));
}

function getClientIp(req) {
  var forwarded = headerValue(req, "x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return (
    headerValue(req, "x-real-ip") ||
    headerValue(req, "cf-connecting-ip") ||
    (req.socket && req.socket.remoteAddress) ||
    "unknown"
  ).toString();
}

function checkRateLimit(ip) {
  var now = Date.now();
  var bucket = rateLimitBuckets.get(ip);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateLimitBuckets.set(ip, bucket);
  }

  // Opportunistic cleanup keeps long-lived serverless instances bounded.
  rateLimitBuckets.forEach(function (entry, key) {
    if (now >= entry.resetAt) {
      rateLimitBuckets.delete(key);
    }
  });

  if (bucket.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

function fileExtension(name) {
  var base = String(name || "").split(/[\\/]/).pop();
  var i = base.lastIndexOf(".");
  return i >= 0 ? base.slice(i + 1).toLowerCase() : "";
}

function countBase64Attachments(bodyObj) {
  var count = 0;
  var messages = Array.isArray(bodyObj && bodyObj.messages) ? bodyObj.messages : [];
  messages.forEach(function (message) {
    var content = Array.isArray(message && message.content) ? message.content : [];
    content.forEach(function (part) {
      var source = part && part.source;
      if (source && source.type === "base64") {
        count += 1;
      }
    });
  });
  return count;
}

function validateUploadedFiles(bodyObj) {
  var attachmentCount = countBase64Attachments(bodyObj);
  if (!attachmentCount) {
    return null;
  }

  var files = Array.isArray(bodyObj._bk_files) ? bodyObj._bk_files : [];
  if (files.length < attachmentCount) {
    return {
      code: "invalid_file_type",
      message: INVALID_FILE_TYPE_MESSAGE,
    };
  }

  for (var i = 0; i < files.length; i += 1) {
    var file = files[i] || {};
    var ext = fileExtension(file.name);
    var size = Number(file.size);
    if (!ALLOWED_FILE_EXTENSIONS.has(ext)) {
      return {
        code: "invalid_file_type",
        message: INVALID_FILE_TYPE_MESSAGE,
      };
    }
    if (!Number.isFinite(size) || size < 0 || size > MAX_FILE_BYTES) {
      return {
        code: "file_too_large",
        message: FILE_TOO_LARGE_MESSAGE,
      };
    }
  }

  return null;
}

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== "POST") {
    return sendJsonError(res, 405, "Method not allowed");
  }

  var apiKey = (process.env.ANTHROPIC_API_KEY || "").trim();
  if (!apiKey) {
    return sendJsonError(
      res,
      503,
      "Server-Konfiguration: Umgebungsvariable ANTHROPIC_API_KEY ist nicht gesetzt."
    );
  }

  var anthropicVersion = headerValue(req, "anthropic-version").trim() || "2023-06-01";

  var bodyObj;
  try {
    if (req.body == null) {
      return sendJsonError(res, 400, "Leerer Request-Body.");
    }
    if (typeof req.body === "string") {
      bodyObj = JSON.parse(req.body);
    } else if (Buffer.isBuffer(req.body)) {
      bodyObj = JSON.parse(req.body.toString("utf8"));
    } else if (typeof req.body === "object") {
      bodyObj = req.body;
    } else {
      return sendJsonError(res, 400, "Ungültiger Request-Body.");
    }
  } catch (e) {
    return sendJsonError(res, 400, "Ungültiges JSON im Request-Body.");
  }

  if (!bodyObj.model || String(bodyObj.model).trim() === "") {
    bodyObj.model = DEFAULT_ANTHROPIC_MODEL;
  }

  var fileValidationError = validateUploadedFiles(bodyObj);
  if (fileValidationError) {
    return sendJsonError(res, 400, fileValidationError.message, "file_validation", {
      code: fileValidationError.code,
    });
  }
  delete bodyObj._bk_files;

  var payloadOut = JSON.stringify(bodyObj);
  var payloadBytes = Buffer.byteLength(payloadOut, "utf8");
  if (payloadBytes > MAX_BODY_BYTES) {
    return sendJsonError(res, 413, "Anfrage zu groß.");
  }
  if (payloadBytes <= 0) {
    return sendJsonError(res, 400, "Leerer Request-Body.");
  }

  var clientIp = getClientIp(req);
  var rateLimit = checkRateLimit(clientIp);
  if (!rateLimit.allowed) {
    setCors(res);
    res.setHeader("Retry-After", String(rateLimit.retryAfterSeconds));
    return sendJsonError(res, 429, RATE_LIMIT_MESSAGE, "rate_limit");
  }

  try {
    var upstream = await fetch(ANTHROPIC_MESSAGES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": anthropicVersion,
      },
      body: payloadOut,
    });

    var respBody = await upstream.text();
    var ct = upstream.headers.get("content-type") || "application/json";

    res.statusCode = upstream.status;
    res.setHeader("Content-Type", ct);
    res.setHeader("Content-Length", Buffer.byteLength(respBody, "utf8"));
    res.end(respBody);
  } catch (e) {
    var msg = e && e.message ? e.message : String(e);
    return sendJsonError(res, 502, "Verbindung zu api.anthropic.com fehlgeschlagen: " + msg);
  }
};
