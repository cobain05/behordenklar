/**
 * Vercel Serverless Function: POST /api/claude
 * Proxies JSON requests to https://api.anthropic.com/v1/messages
 * (same role as server.py for local development).
 * Default model if the client omits `model`: claude-haiku-4-5-20251001 (matches index.html).
 */

const DEFAULT_ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";
const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";
const MAX_BODY_BYTES = 40 * 1024 * 1024;

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

function sendJsonError(res, status, message) {
  setCors(res);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ error: { type: "proxy_error", message: message } }));
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

  var payloadOut = JSON.stringify(bodyObj);
  var payloadBytes = Buffer.byteLength(payloadOut, "utf8");
  if (payloadBytes > MAX_BODY_BYTES) {
    return sendJsonError(res, 413, "Anfrage zu groß (max. ca. 40 MB).");
  }
  if (payloadBytes <= 0) {
    return sendJsonError(res, 400, "Leerer Request-Body.");
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
