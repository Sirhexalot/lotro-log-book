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

    def test_framed_section_is_one_component(self):
        """Catalogue pages and the map panel must not get their own surfaces."""
        css = read('web/flaeche.css')
        self.assertIn('.llb-flaeche {', css)
        for token in ('--llb-flaechen-innen', '--llb-flaechen-rand',
                      '--llb-flaechen-radius', '--llb-flaechen-ton'):
            self.assertIn(token, css)
        # One heading, one gap and one lighter tone for rewards/values.
        self.assertIn('--llb-flaechen-abstand: 12px', css)
        self.assertIn('[data-ton="hell"]', css)
        self.assertIn('.llb-flaeche > :is(h2, h3, h4)', css)
        self.assertIn('font-size: var(--text-abschnitt)', css)
        self.assertNotIn('data-dichte', css)
        self.assertNotIn('data-dichte', read('web/app.js'))
        makro = read('php/templates/components/flaeche.twig')
        self.assertIn('{% macro flaeche(', makro)
        self.assertIn('caller()', makro)
        # Loaded by the catalogue shell and by the map application.
        self.assertIn("assetTag('flaeche.css')", read('php/src/Shell.php'))
        self.assertIn('flaeche.css', read('php/templates/app/karte.twig'))
        self.assertIn("'detail-abschnitt llb-flaeche'", read('web/app.js'))
        # The tab panel belongs to the tab component, not to a single page.
        self.assertIn('.llb-reiter ~ [role="tabpanel"]', read('web/reiter.css'))
        self.assertNotIn('.item-bezugsreiter > [role="tabpanel"] {', read('web/katalog.css'))

    def test_fact_grid_is_one_component(self):
        """Label/value facts look the same on catalogue pages and in the panel."""
        css = read('web/fakten.css')
        self.assertIn('.llb-fakten {', css)
        self.assertIn('grid-template-columns: auto minmax(0, 1fr)', css)
        self.assertIn('[data-dichte="kompakt"]', css)
        self.assertIn("'llb-fakten'", read('web/app.js'))
        self.assertIn("fakten.dataset.dichte = 'kompakt'", read('web/app.js'))
        self.assertIn("assetTag('fakten.css')", read('php/src/Shell.php'))
        self.assertIn('fakten.css', read('php/templates/app/karte.twig'))
        for page in ('php/templates/entity/quest.twig', 'php/templates/entity/deed.twig',
                     'php/templates/entity/recipe.twig'):
            text = read(page)
            self.assertIn('llb-fakten', text, page)
            self.assertNotIn('katalog-fakten', text, page)
        for page in ('web/katalog.css', 'web/style.css'):
            self.assertNotIn('.katalog-fakten', read(page), page)
            self.assertNotIn('.detail-fakten', read(page), page)

    def test_icon_tile_is_one_component(self):
        """Rows, detail head and rewards share one tile frame and size scale."""
        css = read('web/kachel.css')
        self.assertIn('.llb-kachel,', css)
        self.assertIn('width: var(--llb-kachel, 64px)', css)
        self.assertIn('--llb-kachel: 54px', css)
        self.assertIn('object-fit: contain', css)
        for page in ('web/filter-ui.css', 'web/style.css'):
            text = read(page)
            self.assertNotIn('width:64px; height:64px', text, page)
            self.assertNotIn('width: 54px; height: 54px', text, page)
        self.assertIn("assetTag('kachel.css')", read('php/src/Shell.php'))
        # Result rows are built by shared scripts on every app page, so the tile
        # belongs to the shared app layout, not to a single page.
        layout = read('php/templates/app/layout.twig')
        self.assertIn('kachel.css', layout)
        self.assertNotIn('kachel.css', read('php/templates/app/karte.twig'))
        for page in ('php/templates/app/aufgabenfinder.twig',
                     'php/templates/app/gegenstandssuche.twig',
                     'php/templates/app/belohnungen.twig',
                     'php/templates/app/handwerk.twig',
                     'php/templates/app/klassen.twig'):
            self.assertNotIn('kachel.css', read(page), page)
        # Reward rows use the same tile as every result row.
        belohnungen = read('web/belohnungen.js')
        self.assertIn("'bl-symbol mql-row-icon mql-row-icon-entity'", belohnungen)
        be_css = read('web/belohnungen.css')
        self.assertIn('grid-template-columns:64px', be_css)
        self.assertIn('grid-template-columns: 54px', be_css)

    def test_muted_note_is_one_component(self):
        """Quiet hints and intros share one class instead of three page rules."""
        css = read('web/hinweis.css')
        self.assertIn('.llb-hinweis { color: var(--schwach); }', css)
        self.assertIn('[data-groesse="klein"]', css)
        self.assertIn('[data-groesse="bedienung"]', css)
        self.assertIn("'llb-hinweis'", read('web/app.js'))
        self.assertIn("lageText.dataset.groesse = 'klein'", read('web/app.js'))
        self.assertIn("assetTag('hinweis.css')", read('php/src/Shell.php'))
        self.assertIn('hinweis.css', read('php/templates/app/karte.twig'))
        for page in ('web/katalog.css', 'web/style.css'):
            self.assertNotIn('.katalog-hinweis', read(page), page)
            self.assertNotIn('.katalog-marken', read(page), page)
            self.assertNotIn('.detail-lage', read(page), page)
        for source in ('php/templates', 'build_katalogseiten.py', 'build_aufgaben.py',
                       'build_taten.py', 'build_gegenstaende.py'):
            path = ROOT / source
            files = path.rglob('*.twig') if path.is_dir() else [path]
            for file in files:
                self.assertNotIn('katalog-hinweis', file.read_text(encoding='utf-8'), str(file))

    def test_action_button_and_row_are_one_component(self):
        css = read('web/knopf.css')
        self.assertIn('.llb-knopf {', css)
        self.assertIn('[data-groesse="klein"]', css)
        self.assertIn('.llb-aktionen {', css)
        self.assertIn('[data-dichte="kompakt"]', css)
        self.assertIn('background: var(--fläche-hell)', css)
        self.assertIn("'llb-aktionen'", read('web/app.js'))
        self.assertIn("'llb-knopf'", read('web/app.js'))
        self.assertIn("assetTag('knopf.css')", read('php/src/Shell.php'))
        self.assertIn('knopf.css', read('php/templates/app/layout.twig'))
        for page in ('web/katalog.css', 'web/style.css'):
            text = read(page)
            self.assertNotIn('.katalog-knopf', text, page)
            self.assertNotIn('.katalog-aktionen', text, page)
        for source in ('php/templates', 'build_katalogseiten.py', 'build_aufgaben.py',
                       'build_taten.py', 'build_gegenstaende.py'):
            path = ROOT / source
            files = path.rglob('*.twig') if path.is_dir() else [path]
            for file in files:
                text = file.read_text(encoding='utf-8')
                self.assertNotIn('katalog-knopf', text, str(file))
                self.assertNotIn('katalog-aktionen', text, str(file))

    def test_map_cut_is_one_component(self):
        """Quest, deed, giver, vendor, landmark and area build one figure."""
        css = read('web/karte.css')
        self.assertIn('.llb-karte {', css)
        self.assertIn('aspect-ratio: 4 / 3', css)
        self.assertIn('.llb-karte-pin {', css)
        self.assertIn('[data-groesse="gross"]', css)
        makro = read('php/templates/components/karte.twig')
        self.assertIn('{% macro karte(', makro)
        self.assertIn('llb-karte-pin', makro)
        self.assertIn("assetTag('karte.css')", read('php/src/Shell.php'))
        for page in ('php/templates/entity/quest.twig', 'php/templates/entity/deed.twig',
                     'php/templates/entity/landmarke.twig', 'php/templates/entity/area.twig',
                     'php/templates/givers/detail.twig', 'php/templates/vendors/detail.twig'):
            text = read(page)
            self.assertIn('karte.karte(', text, page)
            self.assertNotIn('class="katalog-ort"', text, page)
            self.assertNotIn('class="katalog-pin"', text, page)
        for page in ('web/katalog.css', 'web/style.css'):
            text = read(page)
            self.assertNotIn('.katalog-ort ', text, page)
            self.assertNotIn('.katalog-pin', text, page)
            self.assertNotIn('.katalog-karte-gross', text, page)

    def test_popover_is_one_component(self):
        """Note filter, resources and the full legend share panel and behaviour."""
        css = read('web/klappe.css')
        self.assertIn('.llb-klappe-feld {', css)
        self.assertIn('box-shadow: 0 4px 14px', css)
        self.assertIn('.llb-klappe-feld[hidden]', css)
        js = read('web/klappe.js')
        self.assertIn('window.MQL_KLAPPE', js)
        self.assertIn('aria-expanded', js)
        self.assertIn("ereignis.key !== 'Escape'", js)
        app = read('web/app.js')
        self.assertEqual(app.count('window.MQL_KLAPPE.bind('), 3, 'notes, resources and legend')
        template = read('php/templates/app/karte.twig')
        self.assertEqual(template.count('llb-klappe-feld'), 3)
        self.assertIn('klappe.css', template)
        self.assertIn('klappe.js', template)
        for page in ('web/style.css',):
            text = read(page)
            self.assertNotIn('background: var(--fläche); border: 1px solid var(--rand); padding: 6px', text, page)

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
        self.assertIn('.entity-detail-place .llb-karte { max-width: none; }', css)

    def test_detail_and_item_surfaces(self):
        grid = read('php/templates/entity/_detail_grid.twig')
        item = read('php/templates/entity/item.twig')
        item_group = read('php/templates/entity/_item_group.twig')
        quest = read('php/templates/entity/quest.twig')
        self.assertIn('entity-detail-grid', grid)
        self.assertIn('data-item-task-direct', item_group)
        self.assertIn('result.heading', item_group)
        self.assertIn("include('entity/_detail_grid.twig')", quest)

    def test_map_detail_panel_has_labelled_facts_and_sections(self):
        js = read('web/app.js')
        for needle in ('llb-fakten', 'detail-fortschritt', 'detail-abschnitt',
                       'detail_was_tun', 'detail_ziele_karte', 'questNachId'):
            self.assertIn(needle, js)
        self.assertIn('Object.keys(questNachId).forEach', js)

    def test_map_panel_has_one_label_per_section(self):
        """Objectives are one disclosure, progress one label, actions last."""
        js = read('web/app.js')
        self.assertIn("'ziele-kopf'", js)
        self.assertIn("'detail-ziele-inhalt'", js)
        self.assertIn("abschnitt('detail-aktionen')", js)
        # Choice rewards use the shared reward row, not a bare symbol.
        self.assertIn("wahlListe.className = 'detail-reward-liste'", js)
        self.assertIn("wahlBild.className = 'detail-reward-symbol'", js)
        # The panel's progress control has no duplicate label.
        self.assertIn("quest.i, null, 'panel')", js)
        self.assertIn("context === 'panel'", read('web/status.js'))
        css = read('web/style.css')
        self.assertIn('.ziele-kopf', css)
        self.assertIn('.detail-aktionen .llb-aktionen { margin: 0; }', css)
        self.assertNotIn('.ziele-schalter', css)

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

    def test_class_tabs_use_the_shared_component(self):
        css = read('web/klassen.css')
        # The panel surface comes from reiter.css; a page copy would double-frame.
        self.assertNotIn('.klassen-katalog [role="tabpanel"]', css)
        self.assertIn('.llb-reiter ~ [role="tabpanel"]', read('web/reiter.css'))
        twig = read('php/templates/app/klassen.twig')
        self.assertIn("reiter.reiter('klassen'", twig)
        self.assertNotIn('klassen-reiter', twig)
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
        self.assertIn("reiter.reiter('handwerk'", twig)
        self.assertNotIn('data-hw=', twig)
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
