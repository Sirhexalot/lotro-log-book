"""One tab bar for the whole site.

Every page that switches content between views uses the same component
(`components/reiter.twig` + `reiter.css` + `reiter.js`). These checks keep a
page from growing its own tab markup or its own tab styling again: that is how
the item page, the instance page, the class page, the area page, companion,
spielstand and handwerk drifted apart before.
"""
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATES = ROOT / 'php' / 'templates'
COMPONENT = TEMPLATES / 'components' / 'reiter.twig'

# Page -> the macro call that must appear there.
SEITEN = {
    'entity/item.twig': "reiter.reiter('item'",
    'instances/detail.twig': "reiter.reiter('instanz'",
    'app/klassen.twig': "reiter.reiter('klassen'",
    'app/companion.twig': "reiter.reiter('companion'",
    'app/spielstand.twig': "reiter.reiter('ordner'",
    'app/handwerk.twig': "reiter.reiter('handwerk'",
}


class ReiterComponentTest(unittest.TestCase):
    def test_only_the_component_declares_a_tablist(self):
        for datei in TEMPLATES.rglob('*.twig'):
            if datei == COMPONENT:
                continue
            text = datei.read_text(encoding='utf-8')
            self.assertNotIn('role="tablist"', text, str(datei))
            self.assertNotIn("role='tablist'", text, str(datei))

    def test_every_page_with_tabs_uses_the_component(self):
        for name, needle in SEITEN.items():
            text = (TEMPLATES / name).read_text(encoding='utf-8')
            self.assertIn("import 'components/reiter.twig'", text, name)
            self.assertIn(needle, text, name)
            self.assertNotIn('data-hw=', text, name)
            self.assertNotIn('data-item-tab=', text, name)
            self.assertNotIn('data-instance-tab=', text, name)

    def test_styles_and_script_load_on_every_page(self):
        shell = (ROOT / 'php' / 'src' / 'Shell.php').read_text(encoding='utf-8')
        self.assertIn("assetTag('reiter.css')", shell)
        katalog = (TEMPLATES / 'layout.twig').read_text(encoding='utf-8')
        app = (TEMPLATES / 'app' / 'layout.twig').read_text(encoding='utf-8')
        for text, name in ((katalog, 'layout.twig'), (app, 'app/layout.twig')):
            self.assertIn('/reiter.js?v=', text, name)
        self.assertIn('/reiter.css?v=', app)

    def test_no_page_keeps_its_own_tab_style(self):
        for datei, alt in (('web/katalog.css', '.katalog-reiter'),
                           ('web/klassen.css', '.klassen-reiter'),
                           ('web/style.css', '.reiter {')):
            self.assertNotIn(alt, (ROOT / datei).read_text(encoding='utf-8'), datei)

    def test_counts_are_optional(self):
        twig = COMPONENT.read_text(encoding='utf-8')
        self.assertIn('eintrag.zahl|default(0) > 0', twig)


if __name__ == '__main__':
    unittest.main()
