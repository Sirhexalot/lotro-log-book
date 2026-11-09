"""Check every generated entity page and link without making web requests."""
import argparse
from html import unescape
import json
from pathlib import Path
import re
from urllib.parse import urlsplit
from xml.etree import ElementTree as ET
from build_katalogseiten import BASE, output_path
from build_sitemaps import NS


def verify(target):
    target = Path(target)
    paths = json.loads((target / 'katalog-manifest.json').read_text())['pages']
    known = set(paths)
    if len(paths) != len(known):
        raise ValueError('Duplicate page URLs')
    links = 0
    for url in paths:
        file = output_path(target, url)
        text = file.read_text(encoding='utf-8')
        canonical = re.findall(r'<link rel="canonical" href="([^"]+)">', text)
        if canonical != [BASE + url]:
            raise ValueError('Wrong canonical: ' + url)
        # Item pages carry a quality class on the heading (q1…q5), so match the
        # tag with or without attributes.
        if len(re.findall(r'<h1[\s>]', text)) != 1:
            raise ValueError('Missing/duplicate heading: ' + url)
        if re.search(r'<details\b[^>]*\bopen\b', text):
            raise ValueError('Objectives exposed: ' + url)
        for href in re.findall(r'<a\b[^>]*\bhref="([^"]+)"|<link rel="alternate" hreflang="[^"]+" href="([^"]+)"', text):
            value = unescape(href[0] or href[1])
            if value.startswith(BASE):
                value = value[len(BASE):]
            parts = urlsplit(value)
            if parts.scheme or parts.netloc:
                continue
            path = parts.path
            if path.endswith('/'):
                if path not in known:
                    raise ValueError('Broken entity link: %s -> %s' % (url, value))
            elif not (target / path.lstrip('/')).is_file():
                raise ValueError('Broken app link: %s -> %s' % (url, value))
            links += 1
    index = ET.parse(target / 'sitemap.xml')
    if index.getroot().tag != '{%s}sitemapindex' % NS:
        raise ValueError('Root is not a sitemap index')
    indexed = []
    sections = [node.text for node in index.iter('{%s}loc' % NS)]
    for section in sections:
        xml = ET.parse(target / section.removeprefix(BASE).lstrip('/'))
        if xml.getroot().tag != '{%s}urlset' % NS:
            raise ValueError('Invalid section sitemap: ' + section)
        urls = [node.text for node in xml.iter('{%s}loc' % NS)]
        if len(urls) > 50000:
            raise ValueError('Section exceeds URL limit: ' + section)
        indexed += urls
    if len(indexed) != len(set(indexed)):
        raise ValueError('Duplicate sitemap entries')
    if not {BASE + path for path in paths}.issubset(set(indexed)):
        raise ValueError('Missing entity pages in sitemaps')
    print('PASS: %d pages, %d links, %d sitemap sections' % (len(paths), links, len(sections)))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('target', type=Path)
    verify(parser.parse_args().target)
