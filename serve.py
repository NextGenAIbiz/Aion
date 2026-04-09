"""Minimal static file server — stdlib only, no pip install needed.

Usage:
    python serve.py

Opens http://localhost:8080 automatically.
"""

import http.server
import os
import threading
import webbrowser

PORT = 8080

# Always serve from the directory this file lives in
os.chdir(os.path.dirname(os.path.abspath(__file__)))


class _Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        # Print only non-200 requests to keep output clean
        if args[1] != "200":
            super().log_message(fmt, *args)


if __name__ == "__main__":
    url = f"http://localhost:{PORT}"
    print(f"  Aion  ->  {url}")
    print("  Press Ctrl+C to stop.\n")
    threading.Timer(0.4, lambda: webbrowser.open(url)).start()
    with http.server.HTTPServer(("", PORT), _Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n  Server stopped.")
