"""Local HTTP/1.0 preview including the entity rewrites and real custom 404."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit
from build_katalogseiten import output_path


class Handler(SimpleHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def translate_path(self, path):
        path = unquote(urlsplit(path).path)
        if path.endswith('/') and path.startswith(('/de/', '/en/', '/fr/')):
            candidate = output_path(Path(self.directory), path).resolve()
            if candidate.is_file() and candidate.is_relative_to(Path(self.directory).resolve()):
                return str(candidate)
        return super().translate_path(path)

    def send_error(self, code, message=None, explain=None):
        file = Path(self.directory) / '404.html'
        if code != 404 or not file.is_file():
            return super().send_error(code, message, explain)
        data = file.read_bytes()
        self.send_response(404)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        if self.command != 'HEAD':
            self.wfile.write(data)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('directory', type=lambda value: str(Path(value).resolve()))
    parser.add_argument('--port', type=int, default=8806)
    options = parser.parse_args()
    ThreadingHTTPServer(('127.0.0.1', options.port), partial(Handler, directory=options.directory)).serve_forever()
