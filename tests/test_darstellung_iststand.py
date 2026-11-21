"""Guards for the documented presentation contract (arc42 5.10/8).

These checks do not replace the browser tests. They keep the shared grid,
surface, row, filter and map-detail rules from silently disappearing when
templates or styles are rewritten.
"""
import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]


def read(path):
    return (ROOT / path).read_text(encoding='utf-8')


class DarstellungIststandTest(unittest.TestCase):
    def test_shared_grid_and_surface_tokens(self):
        css = read('web/gemeinsam.css')
        self.assertIn('--llb-raster: repeat(12, minmax(0, 1fr))', css)
        self.assertIn('--llb-flaechen-ton', css)
        self.assertIn('.llb-raster', css)

    def test_result_rows_align_icon_left_and_progress_right(self):
        css = read('web/filter-ui.css')
        self.assertIn('padding:9px 0', css)
        self.assertIn('justify-self:end', css)
        self.assertIn('padding-inline-start:8px', css)
        self.assertIn('input[type=number]', css)
        self.assertIn('color-scheme: inherit', css)

    def test_detail_grid_uses_seven_five_and_full_place(self):
        css = read('web/katalog.css')
        self.assertIn('span 7', css)
        self.assertIn('span 5', css)
        self.assertIn('.entity-detail-place .katalog-ort { max-width: none; }', css)

    def test_detail_and_item_surfaces(self):
        grid = read('php/templates/entity/_detail_grid.twig')
        item = read('php/templates/entity/item.twig')
        quest = read('php/templates/entity/quest.twig')
        self.assertIn('entity-detail-grid', grid)
        self.assertIn('data-item-task-direct', item)
        self.assertIn('result.heading', item)
        self.assertIn("include('entity/_detail_grid.twig')", quest)

    def test_map_detail_panel_has_labelled_facts_and_sections(self):
        js = read('web/app.js')
        for needle in ('detail-fakten', 'detail-fortschritt', 'detail-abschnitt',
                       'detail_was_tun', 'detail_ziele_karte', 'questNachId'):
            self.assertIn(needle, js)
        self.assertIn('Object.keys(questNachId).forEach', js)

    def test_overview_reuses_loaded_tree_without_fetch(self):
        js = read('web/app.js')
        start = js.index('function gruppenKarten')
        end = js.index('function sprungZiel', start)
        block = js[start:end]
        self.assertIn('MQL_GEBIETE', read('web/app.js'))
        self.assertIn('knotenFuerKarte', block)
        self.assertNotIn('fetch(', block)
        for needle in ("'sprung-gruppe'", 'groupCard', 'zeichneKachel', "themenTitel.id = 'themen'"):
            self.assertIn(needle, js)

    def test_class_tabs_share_the_item_surface(self):
        css = read('web/klassen.css')
        self.assertIn('background: var(--llb-flaechen-ton)', css)
        self.assertIn('.klassen-katalog [role="tabpanel"]', css)
        twig = read('php/templates/app/klassen.twig')
        self.assertIn('klassen-reiter katalog-reiter', twig)
    def test_lists_use_one_separator_and_large_icons(self):
        css = read('web/filter-ui.css')
        self.assertIn('> li:is(.mql-row, .mql-row-heading) { border-bottom: 0; }', css)
        quest = read('php/templates/entity/quest.twig')
        self.assertIn('mql-row-icon mql-row-icon-item', quest)
        self.assertIn('width="48"', quest)

    def test_overview_jumps_and_cards_are_uniform(self):
        css = read('web/landschaft.css')
        self.assertNotIn('a.sprung-gruppe', css)
        self.assertNotIn('border-top: 3px solid #83a276', css)
        self.assertNotIn('border-top: 3px solid #7eb6c6', css)
        self.assertNotIn('border-top: 3px solid #c5a56b', css)

    def test_crafting_browser_hides_profession_tab(self):
        twig = read('php/templates/app/handwerk.twig')
        self.assertRegex(twig, r'data-hw="berufe"[^>]*hidden')
        self.assertRegex(twig, r'data-hw="rezepte" aria-pressed="true"')
        self.assertIn('<section id="hw-berufe" hidden>', twig)

    def test_deep_filter_tree_keeps_its_hierarchy(self):
        css = read('web/filter-ui.css')
        self.assertIn('--filter-indent:18px', css)
        self.assertIn('.filter-branch .filter-branch::before', css)
        js = read('web/karten-aufgabenfilter.js')
        self.assertIn('geoLabel', js)
        self.assertIn("replace(/^[^:]{2,32}:", js)

    def test_local_preview_has_one_fixed_port(self):
        script = read('tools/lokalserver.py')
        self.assertIn('PORT = 8817', script)
        self.assertIn("PHP_CLI_SERVER_WORKERS", script)
        self.assertIn('Kein zweiter Server', script)


if __name__ == '__main__':
    unittest.main()
