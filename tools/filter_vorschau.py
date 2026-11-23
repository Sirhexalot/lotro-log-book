"""Local-only item filter preview. Does not modify or build production pages."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
import argparse
import hashlib
import re

WEB = Path(__file__).resolve().parents[1] / 'web'


class Handler(SimpleHTTPRequestHandler):
    protocol_version = 'HTTP/1.0'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WEB), **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, max-age=0')
        super().end_headers()

    def do_GET(self):
        if urlsplit(self.path).path in ('/', '/gegenstaende.html'):
            html = (WEB / 'gegenstaende.html').read_text()
            scripts = ''.join('<script src="%s.js"></script>' % name for name in
                              ('sortierung', 'filterzustand', 'filteradapter', 'filter-ui',
                               'treffer-zeile', 'treffer-tabelle', 'listen/gegenstaende', 'gegenstaende-filter'))
            html = html.replace('<script src="gegenstaende.js"></script>', scripts)
            html = html.replace('</head>', '<link rel="stylesheet" href="filter-ui.css"></head>')
            def version(match):
                filename = match.group(2)
                file = WEB / filename
                digest = hashlib.sha256(file.read_bytes()).hexdigest()[:12] if file.is_file() else 'missing'
                return match.group(1) + filename + '?preview=' + digest + match.group(3)
            html = re.sub(r'((?:src|href)=")([a-z0-9-]+\.(?:js|css))(\")', version, html)
            html = html.replace('<main class="gs">', '<main class="gs"><p style="color:var(--gold);font-size:.875rem">Lokaler Filtertest · Stand 2 · neue Kategorien und Ergebniszeilen</p>')
            data = html.encode()
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        super().do_GET()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8924)
    args = parser.parse_args()
    ThreadingHTTPServer(('127.0.0.1', args.port), Handler).serve_forever()
