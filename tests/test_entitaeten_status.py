"""Checks of the entity status run: address list, verdict and report.

The long run against a real server is started on its own
(`python3 tools/pruefe_entitaeten.py`); these tests stay fast and touch only a
throwaway server on the loopback interface.
"""
import sys
import tempfile
import threading
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
import pruefe_entitaeten as pe


ABSCHNITTE = {
    '/de/aufgabe/sitemap.xml': ['/de/aufgabe/70000003/', '/de/aufgabe/70075D00/'],
    '/de/gegenstand/sitemap-1.xml': ['/de/gegenstand/70001B7E/'],
    '/en/item/sitemap-1.xml': ['/en/item/70001B7E/'],
    '/fr/objet/sitemap-1.xml': ['/fr/objet/70001B7E/'],
    '/sitemap-seiten.xml': ['/de/', '/de/karte/'],
}


class Auswahl(unittest.TestCase):
    def test_liest_jede_adresse_genau_einmal(self):
        urls, verfuegbar = pe.auswahl(ABSCHNITTE)
        self.assertEqual(len(urls), len(set(urls)))
        self.assertEqual(verfuegbar, 7)
        self.assertEqual(urls, sorted(urls))

    def test_filtert_sprache_und_art(self):
        urls, _ = pe.auswahl(ABSCHNITTE, sprachen=('en',))
        self.assertEqual(urls, ['/en/item/70001B7E/'])
        urls, _ = pe.auswahl(ABSCHNITTE, arten={'aufgabe'})
        self.assertEqual(len(urls), 2)
        # Die Listenseite einer Art trägt keine zweite Pfadstufe und fällt
        # damit aus dem Artenfilter, bleibt aber ohne Filter enthalten.
        urls, _ = pe.auswahl(ABSCHNITTE, arten={'karte'})
        self.assertEqual(urls, ['/de/karte/'])

    def test_stichprobe_ist_reproduzierbar_und_bleibt_im_bestand(self):
        erste, _ = pe.auswahl(ABSCHNITTE, stichprobe=3)
        zweite, _ = pe.auswahl(ABSCHNITTE, stichprobe=3)
        self.assertEqual(erste, zweite)
        self.assertEqual(len(erste), 3)
        self.assertTrue(set(erste).issubset({u for v in ABSCHNITTE.values() for u in v}))
        alles, _ = pe.auswahl(ABSCHNITTE, stichprobe=99)
        self.assertEqual(len(alles), 7)

    def test_gruppe_und_sprache_und_art(self):
        self.assertEqual(pe.gruppe('/de/gegenstand/70001B7E/'), '/de/gegenstand')
        self.assertEqual(pe.gruppe('/de/'), '/de')
        self.assertEqual(pe.sprache_der('/fr/objet/70001B7E/'), 'fr')
        self.assertEqual(pe.art_der('/fr/objet/70001B7E/'), 'objet')
        self.assertEqual(pe.art_der('/de/'), '')


class Bewertung(unittest.TestCase):
    def test_200_mit_ueberschrift_ist_gut(self):
        self.assertIsNone(pe.bewerte(200, b'<html><h1>Alter Wald</h1></html>'))

    def test_fehlerstatus_ist_befund(self):
        self.assertEqual(pe.bewerte(500, b'Interner Fehler'), 'Status 500')
        self.assertEqual(pe.bewerte(404, b''), 'Status 404')
        self.assertEqual(pe.bewerte(301, b''), 'Weiterleitung 301')
        self.assertEqual(pe.bewerte(0, b'Connection refused'), 'Keine Antwort')

    def test_fehlertext_und_fehlende_ueberschrift(self):
        self.assertEqual(pe.bewerte(200, b'<p>Interner Fehler</p>'),
                         'Fehlertext im Rumpf')
        self.assertEqual(pe.bewerte(200, b'<main>ohne</main>'),
                         'Ohne Überschrift (h1)')


class Server(BaseHTTPRequestHandler):
    """A miniature site: one good page, one redirect, one broken page.

    `/de/zickig/` fails once and answers afterwards, so the retry is checkable.
    """

    einmalig: set = set()

    def do_GET(self):
        antworten = {
            '/de/': (200, b'<html><h1>Start</h1></html>'),
            '/de/gut/': (200, b'<html><h1>Alter Wald</h1></html>'),
            '/de/kaputt/': (500, b'Interner Fehler'),
            '/de/leer/': (200, b'<main>keine Ueberschrift</main>'),
        }
        if self.path == '/de/zickig/' and self.path not in Server.einmalig:
            Server.einmalig.add(self.path)
            antworten['/de/zickig/'] = (404, b'')
        else:
            antworten['/de/zickig/'] = (200, b'<html><h1>Da</h1></html>')
        if self.path == '/de/weiter/':
            self.send_response(301)
            self.send_header('Location', '/de/gut/')
            self.end_headers()
            return
        status, rumpf = antworten.get(self.path, (404, b''))
        self.send_response(status)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(rumpf)))
        self.end_headers()
        self.wfile.write(rumpf)

    def log_message(self, *args):
        pass


class Lauf(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(('127.0.0.1', 0), Server)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.basis = 'http://127.0.0.1:%d' % cls.server.server_port

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def test_gute_seite_holt_200(self):
        status, rumpf = pe.hole('/de/gut/', self.basis, 5)
        self.assertEqual(status, 200)
        self.assertIsNone(pe.bewerte(status, rumpf))

    def test_weiterleitung_wird_nicht_verfolgt(self):
        status, _ = pe.hole('/de/weiter/', self.basis, 5)
        self.assertEqual(status, 301)
        self.assertEqual(pe.bewerte(status, b''), 'Weiterleitung 301')

    def test_lauf_sammelt_nur_die_kaputten_adressen(self):
        urls = ['/de/gut/', '/de/kaputt/', '/de/weiter/', '/de/leer/', '/de/fehlt/']
        fehler, wiederholt = pe.pruefe(urls, self.basis, 2, 5, schritt=1000)
        self.assertEqual(wiederholt, [])
        self.assertEqual(sorted(fehler), sorted([
            ('/de/kaputt/', 'Status 500'),
            ('/de/weiter/', 'Weiterleitung 301'),
            ('/de/leer/', 'Ohne Überschrift (h1)'),
            ('/de/fehlt/', 'Status 404'),
        ]))
        bilanz = dict((name, (geprueft, kaputt)) for name, geprueft, kaputt
                      in pe.bilanz(urls, fehler))
        self.assertEqual(bilanz['/de/gut'], (1, 0))
        self.assertEqual(bilanz['/de/kaputt'], (1, 1))

    def test_wiederholung_heilt_einen_schluckauf(self):
        Server.einmalig.clear()
        fehler, wiederholt = pe.pruefe(['/de/zickig/'], self.basis, 1, 5,
                                       schritt=1000, wiederholungen=1)
        self.assertEqual(fehler, [])
        self.assertEqual(wiederholt, ['/de/zickig/'])

    def test_ohne_wiederholung_zaehlt_der_schluckauf(self):
        Server.einmalig.clear()
        fehler, wiederholt = pe.pruefe(['/de/zickig/'], self.basis, 1, 5,
                                       schritt=1000, wiederholungen=0)
        self.assertEqual(fehler, [('/de/zickig/', 'Status 404')])
        self.assertEqual(wiederholt, [])

    def test_datenstand_erkennt_einen_neubau(self):
        with tempfile.TemporaryDirectory() as ordner:
            datei = Path(ordner) / 'sitemaps.json'
            datei.write_text('{"sections": {}}', encoding='utf-8')
            vorher = pe.datenstand(Path(ordner))
            datei.write_text('{"sections": {"a": []}}', encoding='utf-8')
            self.assertNotEqual(pe.datenstand(Path(ordner)), vorher)

    def test_bericht_nennt_adresse_und_grund(self):
        with tempfile.TemporaryDirectory() as ordner:
            pfad = Path(ordner) / 'fehler.txt'
            pe.fehlerbericht(pfad, self.basis, 3, [('/de/kaputt/', 'Status 500')])
            text = pfad.read_text(encoding='utf-8')
        self.assertIn('# 3 Adressen geprüft, 1 Fehler', text)
        self.assertIn('/de/kaputt/ Status 500', text)


if __name__ == '__main__':
    unittest.main()
