"""A set page renders every kind of piece, also one without item data.

`set_viewmodel.set_pages` keeps a member with an item page but without
catalogue data as a link with `card: null`. The detail template read the rarity
class from that card, so those sets answered 500. This page test holds the
three member shapes together: full card, link without card, unresolved name.
"""
import hashlib
import json
import os
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SET_ID = '7006D9C0'


def card(**values):
    """The key set `set_viewmodel` always delivers, empty by default."""
    keys = ('chips', 'armour', 'values', 'bonuses', 'scale', 'symbol',
            'head_class', 'required_class')
    return {key: None for key in keys} | values


@unittest.skipUnless(shutil.which('php'), 'PHP required')
class SetPageTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = Path(tempfile.mkdtemp(prefix='llb-set-seite-'))
        subprocess.run(['python3', 'tools/build_php_labels.py',
                        '--ziel', str(cls.tmp / 'labels.json')],
                       cwd=ROOT, check=True, capture_output=True)
        shard = hashlib.md5(SET_ID.encode()).hexdigest()[:2]
        members = [
            {'id': '7006D9C1', 'name': 'Armkette des Windsehers',
             'url': '/de/gegenstand/7006D9C1/', 'count': 1, 'missing': False,
             'card': card(head_class='q4', symbol='1234',
                          values=[{'label': 'Rüstung', 'value': '12'}])},
            # Item page exists, catalogue data does not: link without card.
            {'id': '7006D9C2', 'name': 'Shagâni-Buch des verhüllenden Sandes',
             'url': '/de/gegenstand/7006D9C2/', 'count': 1, 'missing': False,
             'card': None},
            {'id': '', 'name': 'Unbekanntes Teil', 'url': None,
             'count': 2, 'missing': True, 'card': None},
        ]
        for lang in ('de', 'en', 'fr'):
            entity = {'entities': {SET_ID: {'id': SET_ID, 'name': 'x'}}}
            folder = cls.tmp / lang / 'set'
            folder.mkdir(parents=True)
            (folder / (shard + '.json')).write_text(
                json.dumps(entity, ensure_ascii=False), encoding='utf-8')
            page = {'entities': {SET_ID: {
                'id': SET_ID, 'name': 'Insignien des Verhüllten Jägers',
                'parts': 4, 'members': members, 'available_parts': 1,
                # Wear requirements of the pieces for the chip in the set head.
                'teile': [[120, 'Hunter', '', '', '', 0, 0, 2],
                          [135, 'Hunter', '', '', '', 0, 0, 2]],
                'bonuses': [{'pieces': 2, 'valid': True,
                             'texts': ['+10 Willenskraft'], 'pending': []}],
                'seo': {'title': 'Insignien des Verhüllten Jägers',
                        'description': 'Set'},
            }}}
            folder = cls.tmp / lang / 'page-set'
            folder.mkdir(parents=True)
            (folder / (shard + '.json')).write_text(
                json.dumps(page, ensure_ascii=False), encoding='utf-8')
            # The list needs its own index: filters, facets and the browser data.
            index = {'schema': 1, 'lang': lang,
                     'labels': {'class': {'Hunter': 'Jäger'}, 'armour': {},
                                'category': {'JEWELLERY': 'Geschmeide'}},
                     'sets': [{
                         'id': SET_ID, 'name': 'Insignien des Verhüllten Jägers',
                         'parts': 4, 'available_parts': 1, 'icons': [],
                         'members': [{'id': '7006D9C1', 'available': True,
                                      'name': 'Armkette des Windsehers',
                                      'category': 'JEWELLERY', 'armour': None,
                                      'class': 'Hunter', 'classes': ['Hunter'],
                                      'class_known': True, 'min_level': 120}]}]}
            (cls.tmp / lang / 'sets-index.json').write_text(
                json.dumps(index, ensure_ascii=False), encoding='utf-8')

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.tmp, ignore_errors=True)

    def render(self, url):
        env = dict(os.environ)
        env['LLB_ROOT'] = str(ROOT)
        env['LLB_DATA'] = str(self.tmp)
        env['LLB_WEB'] = str(ROOT / 'web')
        env['LLB_VENDOR'] = str(ROOT / 'vendor')
        env['LLB_CACHE'] = str(self.tmp / 'twig')
        script = ('require getenv("LLB_VENDOR")."/autoload.php";'
                  '$_SERVER["REQUEST_URI"]=' + json.dumps(url) + ';'
                  # The PHP CLI fills no superglobals: the query belongs to $_GET,
                  # otherwise a filtered list would look unfiltered in the test.
                  '$_GET=[];parse_str((string)parse_url($_SERVER["REQUEST_URI"],PHP_URL_QUERY),$_GET);'
                  'require ' + json.dumps(str(ROOT / 'php/public/index.php')) + ';')
        result = subprocess.run(['php', '-d', 'opcache.enable_cli=0', '-r', script],
                                cwd=ROOT, capture_output=True, text=True, env=env)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertNotIn('Interner Fehler', result.stdout)
        self.assertNotIn('Frodo sucht den Weg', result.stdout)
        return result.stdout

    def test_piece_without_item_data_keeps_its_link(self):
        html = self.render('/de/set/%s/' % SET_ID)
        self.assertEqual(html.count('<article class="set-card'), 3)
        # The complete piece keeps icon, rarity class and values.
        self.assertIn('<a class="q4" href="/de/gegenstand/7006D9C1/">', html)
        self.assertIn('/bild/items/1234.webp', html)
        # A piece with an item page but without data stays a link, no invented
        # rarity colour and no values.
        row = html.split('Shagâni-Buch des verhüllenden Sandes')[0]
        self.assertIn('<a href="/de/gegenstand/7006D9C2/">', row)
        self.assertNotIn('class=""', row)
        # A name without any item page stays plain text and counts its rows.
        self.assertIn('Unbekanntes Teil <span class="set-card-count">· 2×</span>', html)

    def test_all_three_languages_render(self):
        for url in ('/de/set/%s/', '/en/set/%s/', '/fr/ensemble/%s/'):
            html = self.render(url % SET_ID)
            self.assertIn('Insignien des Verhüllten Jägers', html, url)
            self.assertIn('+10 Willenskraft', html, url)

    def test_set_head_carries_wear_requirements(self):
        """The chip in the set head is computed in the browser from `teile`."""
        html = self.render('/de/set/%s/' % SET_ID)
        kopf = html.split('class="set-kopf"')[1].split('</p>')[0]
        self.assertIn('data-eignung-teile=', kopf)
        # Twig escapes the JSON for the attribute; the values stay readable.
        self.assertIn('120,', kopf)
        self.assertIn('135,', kopf)
        self.assertIn('&#x5B;', kopf)

    def test_list_hands_filter_and_suitability_to_the_browser(self):
        """The list filters in the browser; the GET form stays the fallback."""
        for lang, route in (('de', 'set'), ('en', 'set'), ('fr', 'ensemble')):
            html = self.render('/%s/%s/' % (lang, route))
            self.assertIn('data-set-browser', html, lang)
            self.assertIn('data-set-texte=', html, lang)
            self.assertIn('data-filter-results', html, lang)
            self.assertIn('data-filter-fallback', html, lang)
            # The old server adapter must not mount a second filter shell.
            self.assertNotIn('data-filter-schema', html, lang)
            self.assertIn('/sets-%s.js' % lang, html, lang)
            self.assertIn('/sets-filter.js', html, lang)
            # The suitability group appears only with a character; its texts
            # travel escaped in the browser data of the page.
            self.assertIn('eignung', html, lang)

    def test_suitability_value_stays_in_the_address(self):
        """The browser judges; the server keeps the value for crawler hygiene."""
        html = self.render('/de/set/?eig=passt,bogus')
        self.assertIn('<meta name="robots" content="noindex,follow">', html)
        self.assertIn('eig=passt', html)
        self.assertNotIn('bogus', html)
        offen = self.render('/de/set/')
        self.assertNotIn('noindex', offen)


if __name__ == '__main__':
    unittest.main()
