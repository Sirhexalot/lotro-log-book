"""Render English documentation with Mermaid diagrams to one PDF.

The Markdown stays the source. Pandoc turns it into HTML, Mermaid renders the
```mermaid blocks in the browser, and headless Chrome prints the result.

Usage:
    python3 tools/build_doc_pdf.py docs/datenraum/entity-model.md \
            --ziel output/llb-entity-model-2026-11-22.pdf
    python3 tools/build_doc_pdf.py docs/arc42/*.md --titel "arc42" --ziel ...

Nothing is uploaded and no game data is copied; only the given Markdown files
and their diagrams end up in the PDF.
"""
import argparse
import datetime
import pathlib
import shutil
import subprocess
import sys
import tempfile
import urllib.request

REPO = pathlib.Path(__file__).resolve().parent.parent
CACHE = pathlib.Path.home() / '.cache' / 'llb-docs'
MERMAID_URL = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js'
CHROME = pathlib.Path('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')

SHELL = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>__TITLE__</title>
<style>
  @page { size: A4; margin: 18mm 16mm 20mm 16mm; }
  :root { --ink:#1d1d1f; --muted:#5f5f66; --line:#d9d9de; --accent:#8a6a1f; }
  body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
         font-size: 10.5pt; line-height: 1.5; color: var(--ink); }
  h1 { font-size: 20pt; margin: 0 0 .6em; border-bottom: 2px solid var(--accent);
       padding-bottom: .25em; break-before: page; }
  h1:first-of-type { break-before: avoid; }
  h2 { font-size: 14pt; margin: 1.4em 0 .5em; }
  h3 { font-size: 11.5pt; margin: 1.2em 0 .4em; }
  p, li { orphans: 2; widows: 2; }
  table { border-collapse: collapse; width: 100%; margin: .8em 0 1.2em;
          font-size: 8.8pt; break-inside: auto; }
  thead { display: table-header-group; }
  th, td { border-bottom: 1px solid var(--line); padding: 4px 6px; text-align: left;
           vertical-align: top; }
  th { background: #f4f1ea; font-weight: 600; }
  tr { break-inside: avoid; }
  code { font-family: Menlo, monospace; font-size: 8.6pt; background: #f4f1ea;
         padding: 1px 3px; border-radius: 2px; }
  pre { background: #f7f5f0; padding: 8px 10px; border-radius: 3px; overflow-x: auto;
        break-inside: avoid; }
  pre code { background: none; padding: 0; }
  pre.mermaid { background: #fff; text-align: center; }
  blockquote { margin: 1em 0; padding-left: 1em; border-left: 3px solid var(--line);
               color: var(--muted); }
  a { color: #274a7a; text-decoration: none; }
  .meta { color: var(--muted); font-size: 9pt; margin-bottom: 1.5em; }
</style>
</head>
<body>
__BODY__
<script>__MERMAID__</script>
<script>
  mermaid.initialize({ startOnLoad: true, theme: 'neutral',
    flowchart: { htmlLabels: true }, er: { useMaxWidth: true },
    themeVariables: { fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' } });
</script>
</body>
</html>
"""


def mermaid_js() -> str:
    CACHE.mkdir(parents=True, exist_ok=True)
    target = CACHE / 'mermaid.min.js'
    if not target.exists():
        print('downloading mermaid once …', file=sys.stderr)
        urllib.request.urlretrieve(MERMAID_URL, target)
    return target.read_text()


def html_body(files, title):
    screens = []
    body = subprocess.run(
        ['pandoc', '-f', 'gfm', '-t', 'html5', '--no-highlight', *map(str, files)],
        capture_output=True, text=True, check=True).stdout
    # Mermaid blocks arrive as <pre class="mermaid"><code>…</code></pre>.
    body = body.replace('<pre class="mermaid"><code>', '<pre class="mermaid">')
    body = body.replace('</code></pre>\n</body', '</pre>\n</body>')
    body = body.replace('</code></pre>', '</pre>')
    stamp = ('Generated ' + datetime.date.today().strftime('%d.%m.%Y') + ' · sources: '
             + ', '.join(p.name for p in files))
    return f'<p class="meta">{stamp}</p>\n' + body


def build(files, target, title):
    if not shutil.which('pandoc'):
        sys.exit('pandoc is missing')
    if not CHROME.exists():
        sys.exit(f'Chrome not found at {CHROME}')
    target = pathlib.Path(target)
    target.parent.mkdir(parents=True, exist_ok=True)
    html = (SHELL.replace('__TITLE__', title)
                 .replace('__BODY__', html_body(files, title))
                 .replace('__MERMAID__', mermaid_js()))
    with tempfile.TemporaryDirectory() as tmp:
        page = pathlib.Path(tmp) / 'doc.html'
        page.write_text(html)
        subprocess.run([
            str(CHROME), '--headless=new', '--disable-gpu', '--no-pdf-header-footer',
            '--virtual-time-budget=20000', '--run-all-compositor-stages-before-draw',
            f'--print-to-pdf={target.resolve()}', page.as_uri(),
        ], check=True, capture_output=True)
    print(f'{target} · {target.stat().st_size // 1024} KB')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('files', nargs='+', help='English Markdown files, in order')
    parser.add_argument('--ziel', required=True, help='target PDF path')
    parser.add_argument('--titel', default='LOTRO Log Book')
    args = parser.parse_args()
    paths = [pathlib.Path(f) if pathlib.Path(f).is_absolute() else REPO / f
             for f in args.files]
    for p in paths:
        if not p.exists():
            sys.exit(f'missing: {p}')
    build(paths, args.ziel, args.titel)
