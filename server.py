#!/usr/bin/env python3
"""Statische Dateien aus diesem Ordner + POST /api/claude -> Proxy zu Anthropic.

Das Modell wird im JSON-Body vom Client gesetzt (index.html: z. B. claude-sonnet-4-5).
"""

import json
import urllib.error
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

PORT = 8765
ROOT = Path(__file__).resolve().parent
ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages"
# Gesamtes JSON inkl. Base64-PDF/Bild: unterhalb typischer API-Grenze halten
MAX_BODY_BYTES = 40 * 1024 * 1024


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def _normalized_path(self) -> str:
        path = self.path.split("?", 1)[0].split("#", 1)[0]
        if len(path) > 1 and path.endswith("/"):
            path = path[:-1]
        return path

    def _send_cors(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header(
            "Access-Control-Allow-Headers",
            "Content-Type, x-api-key, anthropic-version",
        )
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")

    def do_OPTIONS(self) -> None:
        if self._normalized_path() == "/api/claude":
            self.send_response(204)
            self._send_cors()
            self.end_headers()
        else:
            self.send_error(404, "Not Found")

    def do_POST(self) -> None:
        if self._normalized_path() != "/api/claude":
            self.send_error(404, "Not Found")
            return
        self._proxy_to_anthropic()

    def _json_proxy_error(self, status: int, message: str) -> None:
        body = json.dumps(
            {"error": {"type": "proxy_error", "message": message}},
            ensure_ascii=False,
        ).encode("utf-8")
        self.send_response(status)
        self._send_cors()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _proxy_to_anthropic(self) -> None:
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self._json_proxy_error(400, "Ungültiger Content-Length-Header.")
            return

        if length <= 0:
            self._json_proxy_error(400, "Leerer Request-Body.")
            return
        if length > MAX_BODY_BYTES:
            self._json_proxy_error(413, "Anfrage zu groß (max. ca. 40 MB).")
            return

        payload = self.rfile.read(length)
        if len(payload) != length:
            self._json_proxy_error(400, "Body konnte nicht vollständig gelesen werden.")
            return

        api_key = (self.headers.get("x-api-key") or "").strip()
        if not api_key:
            self._json_proxy_error(400, "Header x-api-key fehlt.")
            return

        anthropic_version = self.headers.get("anthropic-version") or "2023-06-01"
        # Body parsen und neu serialisieren: vermeidet kaputtes/partielles JSON vom Client
        # und garantiert UTF-8 + gültige Struktur vor dem Weiterleiten.
        try:
            body_obj = json.loads(payload.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as e:
            self._json_proxy_error(400, f"Ungültiges JSON im Request-Body: {e}")
            return

        payload_out = json.dumps(body_obj, ensure_ascii=False).encode("utf-8")

        upstream = urllib.request.Request(
            ANTHROPIC_MESSAGES_URL,
            data=payload_out,
            method="POST",
            headers={
                "Content-Type": "application/json",
                "x-api-key": api_key,
                "anthropic-version": anthropic_version,
            },
        )

        try:
            with urllib.request.urlopen(upstream, timeout=600) as resp:
                resp_body = resp.read()
                self.send_response(resp.status)
                self._send_cors()
                ct = resp.headers.get("Content-Type") or "application/json"
                self.send_header("Content-Type", ct)
                self.send_header("Content-Length", str(len(resp_body)))
                self.end_headers()
                self.wfile.write(resp_body)
        except urllib.error.HTTPError as e:
            err_body = e.read()
            self.send_response(e.code)
            self._send_cors()
            ct = e.headers.get("Content-Type") or "application/json"
            self.send_header("Content-Type", ct)
            self.send_header("Content-Length", str(len(err_body)))
            self.end_headers()
            self.wfile.write(err_body)
        except urllib.error.URLError as e:
            reason = e.reason if e.reason else str(e)
            self._json_proxy_error(502, f"Verbindung zu api.anthropic.com fehlgeschlagen: {reason}")
        except TimeoutError:
            self._json_proxy_error(504, "Zeitüberschreitung beim Aufruf der API.")
        except Exception as e:
            self._json_proxy_error(502, str(e))

    def log_message(self, format, *args) -> None:
        print(f"[{self.log_date_time_string()}] {args[0]} {args[1]} {args[2]}")


def main() -> None:
    with ThreadingHTTPServer(("127.0.0.1", PORT), Handler) as httpd:
        print(f"BehördenKlar: http://127.0.0.1:{PORT}/index.html")
        print(f"API-Proxy:    POST http://127.0.0.1:{PORT}/api/claude")
        print("Beenden: Strg+C")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer beendet.")


if __name__ == "__main__":
    main()
