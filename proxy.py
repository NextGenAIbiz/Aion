#!/usr/bin/env python3
"""
Aion local proxy  —  stdlib only, no pip required.
───────────────────────────────────────────────────
Browsers allow  http://localhost  from  https://  pages (it's a "secure context"),
so this proxy bridges the Mixed Content gap without any HTTPS certificate setup.

  GitHub Pages (https)
    └─► http://localhost:9443   ← this script
          └─► http://10.161.112.104:3000   ← your LLM server

The Aion tools auto-detect when a proxy is needed and silently reroute through
http://localhost:9443, so you keep using your real API URL in Settings.

Usage:
  python proxy.py                         # default target: http://10.161.112.104:3000
  python proxy.py http://HOST:PORT        # custom target
"""

import sys
import http.server
import http.client
import urllib.parse
from socketserver import ThreadingMixIn

# ── Config ────────────────────────────────────────────────────────────────────
TARGET = sys.argv[1].rstrip('/') if len(sys.argv) > 1 else 'http://10.161.112.104:3000'
PORT   = 9443
HOST   = 'localhost'

CORS_HEADERS = [
    ('Access-Control-Allow-Origin',  '*'),
    ('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'),
    ('Access-Control-Allow-Headers', 'Content-Type, Authorization'),
]

# Hop-by-hop headers — must not be forwarded
NO_FORWARD = {
    'host', 'connection', 'transfer-encoding', 'te',
    'trailers', 'upgrade', 'keep-alive', 'proxy-connection',
}


# ── Request handler ───────────────────────────────────────────────────────────
class ProxyHandler(http.server.BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        """Handle CORS preflight requests."""
        self.send_response(204)
        for k, v in CORS_HEADERS:
            self.send_header(k, v)
        self.send_header('Content-Length', '0')
        self.end_headers()

    def do_GET(self):  self._forward('GET')
    def do_POST(self): self._forward('POST')

    def _forward(self, method):
        parsed = urllib.parse.urlparse(TARGET)

        # Read request body
        length = int(self.headers.get('Content-Length') or 0)
        body   = self.rfile.read(length) if length else None

        # Build forwarded headers (strip hop-by-hop)
        headers = {k: v for k, v in self.headers.items()
                   if k.lower() not in NO_FORWARD}
        headers['Host'] = parsed.netloc

        try:
            ConnClass = (http.client.HTTPSConnection if parsed.scheme == 'https'
                         else http.client.HTTPConnection)
            conn = ConnClass(parsed.netloc, timeout=120)
            conn.request(method, self.path, body=body, headers=headers)
            resp = conn.getresponse()

            # ── Forward status + headers ──────────────────────────────────────
            self.send_response(resp.status)
            for k, v in resp.getheaders():
                if k.lower() not in NO_FORWARD | {'content-length'}:
                    self.send_header(k, v)
            for k, v in CORS_HEADERS:
                self.send_header(k, v)
            self.end_headers()

            # ── Stream response chunks (needed for SSE token streaming) ───────
            while True:
                chunk = resp.read(4096)
                if not chunk:
                    break
                try:
                    self.wfile.write(chunk)
                    self.wfile.flush()
                except (BrokenPipeError, ConnectionResetError):
                    break

            conn.close()

        except ConnectionRefusedError:
            self._send_error(503, f'API server unreachable: {TARGET}\n'
                                  f'Make sure your LLM server is running.')
        except OSError as e:
            self._send_error(503, f'Network error reaching {TARGET}: {e}')
        except Exception as e:
            self._send_error(502, f'Proxy error: {e}')

    def _send_error(self, code, msg):
        body = msg.encode()
        self.send_response(code)
        for k, v in CORS_HEADERS:
            self.send_header(k, v)
        self.send_header('Content-Type', 'text/plain')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        try:
            self.wfile.write(body)
        except Exception:
            pass

    def log_message(self, fmt, *args):
        print(f'  {fmt % args}')


class ThreadedHTTPServer(ThreadingMixIn, http.server.HTTPServer):
    """Handle each request in its own thread (needed for concurrent streaming)."""
    daemon_threads = True


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == '__main__':
    server = ThreadedHTTPServer((HOST, PORT), ProxyHandler)

    print()
    print('  Aion proxy')
    print(f'  Listening : http://{HOST}:{PORT}')
    print(f'  Target    : {TARGET}')
    print()
    print(f'  In Aion \u2699\uFE0F Settings, enter your real URL as-is:')
    print(f'    {TARGET}/v1')
    print(f'  The tools auto-route via proxy when running on GitHub Pages.')
    print()
    print('  Ctrl+C to stop.')
    print()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n  Proxy stopped.')
