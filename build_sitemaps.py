"""Sitemaps derived from generated pages, not hand-maintained URL lists."""
from pathlib import Path
from xml.etree import ElementTree as ET

BASE = 'https://llb.sirhexalot.de'
NS = 'http://www.sitemaps.org/schemas/sitemap/0.9'
ET.register_namespace('', NS)


def write(target, relative, paths, index=False):
    paths = sorted(set(paths))
    if len(paths) > 50000:
        raise ValueError('Sitemap needs splitting: ' + relative)
    root = ET.Element('{%s}%s' % (NS, 'sitemapindex' if index else 'urlset'))
    for path in paths:
        if not path.startswith('/') or path.startswith('//'):
            raise ValueError('Expected root-relative sitemap path: ' + path)
        entry = ET.SubElement(root, '{%s}%s' % (NS, 'sitemap' if index else 'url'))
        ET.SubElement(entry, '{%s}loc' % NS).text = BASE + path
    output = Path(target) / relative.lstrip('/')
    output.parent.mkdir(parents=True, exist_ok=True)
    data = ET.tostring(root, encoding='utf-8', xml_declaration=True)
    if len(data) > 50 * 1024 * 1024:
        raise ValueError('Sitemap exceeds 50 MB: ' + relative)
    output.write_bytes(data)


def add_sections(target, sections):
    """Keep the stable root URL and rebuild each generated section."""
    target = Path(target)
    tree = ET.parse(target / 'sitemap.xml')
    if tree.getroot().tag != '{%s}sitemapindex' % NS:
        raise ValueError('Expected a sitemap index from build_seo.py')
    files = {node.text.removeprefix(BASE) for node in tree.getroot().iter('{%s}loc' % NS)}
    for path, urls in sections.items():
        write(target, path, urls)
        files.add(path)
    write(target, 'sitemap.xml', files, index=True)
