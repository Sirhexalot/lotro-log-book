"""Quest pages, generated on their own.

A layout change to quests should not rebuild the whole catalogue. These pages
moved out of `build_katalogseiten.py` into their own generator; the catalogue
builder calls into here, so a normal build still produces every page.

Layout: title with the entity icon and the actions on one line, facts as chips,
then Beschreibung · Ort · Woher · Wofür · Zusammenhang. No "Details" block;
objectives stay behind a closed <details>.

    python3 build_aufgaben.py                         # all languages into the build
    python3 build_aufgaben.py --sprache de --ziel X   # one language, own target
"""
import argparse
from pathlib import Path

from urllib.parse import quote_plus

import build_katalogseiten as katalog


def abschnitt(titel, inhalt):
    if not inhalt:
        return ''
    return '<section class="katalog-abschnitt"><h2>%s</h2>%s</section>' % (
        katalog.escape(titel), inhalt)


class Renderer(katalog.Renderer):
    """Quest pages only; the shell comes from the catalogue renderer."""

    def __init__(self, target, lang, models):
        super().__init__(target, lang, models)
        self._voraussetzer = None
        self._geber = None
        self._ort = None

    def build(self):
        for quest in self.selected['q'].values():
            self.quest('q', quest)
        return self.paths

    # --- indexes once per language ---------------------------------------
    def voraussetzer(self):
        """Quest ID -> quests that name it as a requirement (reverse of v)."""
        if self._voraussetzer is None:
            self._voraussetzer = {}
            for quest in self.model['all']['q'].values():
                for ident in quest.get('v') or []:
                    self._voraussetzer.setdefault(ident, []).append(quest)
        return self._voraussetzer

    def gleicher_geber(self, quest):
        if self._geber is None:
            self._geber = {}
            for other in self.model['all']['q'].values():
                if other.get('g'):
                    self._geber.setdefault(other['g'], []).append(other)
        return [q for q in self._geber.get(quest.get('g') or '', []) if q['i'] != quest['i']]

    def selber_ort(self, quest):
        """Quests whose giver stands at exactly the same coordinates."""
        punkt = quest.get('gt')
        if not punkt:
            return []
        if self._ort is None:
            self._ort = {}
            for other in self.model['all']['q'].values():
                ort = other.get('gt')
                if ort:
                    self._ort.setdefault((ort[0], round(ort[1], 3), round(ort[2], 3)), []).append(other)
        return [q for q in self._ort.get((punkt[0], round(punkt[1], 3), round(punkt[2], 3)), [])
                if q['i'] != quest['i']]

    # --- building blocks --------------------------------------------------
    def chips(self, quest):
        w = self.w
        werte = []
        if quest.get('l'):
            werte.append('%s %s%s' % (w['level'], quest['l'], ' *' if quest.get('ls') else ''))
        if quest.get('f'):
            werte.append(' › '.join(quest['f']))
        if quest.get('g'):
            werte.append(quest['g'])
        if quest.get('s'):
            werte.append('%s %s' % (len(quest['s']), w['steps_label']))
        if quest.get('rw'):
            werte.append('%s %s' % (len(quest['rw']), w['rewards']))
        if quest.get('dy'):
            werte.append(w['daily'])
        if quest.get('rp') == -1:
            werte.append(w['repeat'])
        if quest.get('lp'):
            werte.append('%s %s' % (w['points'], quest['lp']))
        return '<p class="katalog-chips">%s</p>' % ''.join(
            '<span class="katalog-chip">%s</span>' % katalog.escape(wert) for wert in werte)

    def ort(self, quest):
        w = self.w
        punkt = quest.get('gt')
        ziele = quest.get('t') or []
        if not punkt:
            if not ziele:
                return ''
            # No sentence about the missing giver position: the two ways to the
            # place are what matters here, and they work without it.
            inhalt = '<p class="katalog-aktionen">%s %s</p>' % (
                katalog.a(katalog.old_link(self.lang, 'q', quest['i']), w['map'], class_='katalog-knopf'),
                self.reise_link('q', quest))
            return abschnitt(w['place'], inhalt)
        karte = self.model['maps'].get(punkt[0])
        bild = ''
        if karte and all(karte.get(k) is not None for k in ('north', 'south', 'west', 'east')):
            breite = karte['east'] - karte['west']
            hoehe = karte['north'] - karte['south']
            if breite > 0 and hoehe > 0:
                x = min(100.0, max(0.0, (punkt[2] - karte['west']) / breite * 100))
                y = min(100.0, max(0.0, (karte['north'] - punkt[1]) / hoehe * 100))
                bild = ('<a class="katalog-ortlink" href="/index.html?lang=%s&id=%s">'
                        '<figure class="katalog-ort"><img src="/karten/%s/%s.webp" alt="" '
                        'width="320" height="240" loading="lazy" decoding="async">'
                        '<i class="katalog-pin" style="left:%.1f%%;top:%.1f%%"></i></figure></a>'
                        % (self.lang, quest['i'], self.lang, punkt[0], x, y))
        zeile = '%.1f°%s, %.1f°%s' % (abs(punkt[1]), 'S' if punkt[1] < 0 else 'N',
                                      abs(punkt[2]), 'W' if punkt[2] < 0 else 'E')
        if ziele and len(ziele) > 1:
            zeile += ' · ' + katalog.escape(w['points_count'].replace('%s', str(len(ziele))))
        if karte:
            zeile += ' · ' + katalog.a('/index.html?lang=' + self.lang + '&id=' + quest['i'],
                                       karte['name'])
            zeile += ' · ' + katalog.a('/index.html?vorkarte=%s&lang=%s' % (punkt[0], self.lang),
                                       w['occurrences'])
        zeilen = ['<p class="katalog-hinweis">%s</p>' % zeile]
        # The two ways to the place belong in this section, not at the top.
        zeilen.append('<p class="katalog-aktionen">%s %s</p>' % (
            katalog.a(katalog.old_link(self.lang, 'q', quest['i']), w['map'], class_='katalog-knopf'),
            self.reise_link('q', quest)))
        return abschnitt(w['place'], '<div class="katalog-ort-flex">%s<div>%s</div></div>'
                         % (bild, ''.join(zeilen)))

    def woher(self, quest):
        w = self.w
        fakten = []
        if quest.get('g'):
            # No NPC pages yet: the search lists what belongs to this name.
            suche = '/suche.html?lang=%s&q=%s' % (self.lang, quote_plus(quest['g']))
            fakten.append((w['giver'], katalog.a(suche, quest['g'])))
        if quest.get('f'):
            fakten.append((w['area_label'], ' › '.join(self.pfad_links(quest))))
        inhalt = ''
        if fakten:
            inhalt += '<dl class="katalog-fakten">%s</dl>' % ''.join(
                '<dt>%s</dt><dd>%s</dd>' % paar for paar in fakten)
        bedingungen = []
        if quest.get('vl'):
            bedingungen.append('<li>%s %s</li>' % (w['level'], quest['vl']))
        for key in ('v', 'vo'):
            links = [self.link('q', ident, self.model['all']['q'][ident]['n'])
                     for ident in quest.get(key, []) if ident in self.model['all']['q']]
            if links:
                bedingungen.append('<li>%s%s</li>' % (
                    katalog.escape(w['one']) + ': ' if key == 'vo' else '', ' · '.join(links)))
        if quest.get('vb'):
            bedingungen.append('<li>%s</li>' % w['extra'])
        if bedingungen:
            inhalt += '<h3>%s</h3><ul>%s</ul>' % (katalog.escape(w['requirements']),
                                                  ''.join(bedingungen))
        titel = {'de': 'Woher', 'en': 'Where from', 'fr': 'Provenance'}[self.lang]
        return abschnitt(titel, inhalt)

    def pfad_links(self, quest):
        """Region and area as catalogue links; anything deeper stays text."""
        fk = quest.get('fk') or []
        aus = []
        for nummer, name in enumerate(quest.get('f') or []):
            if nummer == 0 and fk and str(fk[0]) in self.selected.get('region', {}):
                aus.append(self.link('region', str(fk[0]), name))
            elif nummer == 1 and len(fk) > 1 and str(fk[1]) in self.selected.get('area', {}):
                aus.append(self.link('area', str(fk[1]), name))
            else:
                aus.append(katalog.escape(name))
        return aus

    def gabe(self, reward):
        """One reward line: symbol, linked name, amount."""
        art, name = reward[0], reward[1]
        kennung = reward[6] if len(reward) > 6 else ''
        menge = reward[4] if len(reward) > 4 else 0
        text = katalog.escape(name)
        if art in ('i', 'c'):
            eintrag = self.selected['i'].get(kennung) or {}
            bild = self.symbol(eintrag.get('ic'))
            if kennung:
                text = self.link('i', kennung, name) if kennung in self.selected['i'] else text
            else:
                text = self.item_link(name) or text
            if menge and menge > 1:
                text = '%d × %s' % (menge, text)
            return '<div class="katalog-gabe">%s<span>%s</span></div>' % (bild, text)
        return '<div class="katalog-gabe">%s<span>%s</span></div>' % (
            self.entitaetssymbol({'t': 'titel', 'v': 'tugend'}.get(art, 'titel')), text)

    def wofuer(self, quest):
        w = self.w
        fest = [r for r in quest.get('rw', []) if r[0] == 'i']
        wahl = [r for r in quest.get('rw', []) if r[0] == 'c']
        merk = [r for r in quest.get('rw', []) if r[0] not in ('i', 'c')]
        spalten = []
        if fest:
            spalten.append('<div class="katalog-geben"><div class="katalog-geben-art">%s</div>%s</div>'
                           % (katalog.escape(w['sure']), ''.join(self.gabe(r) for r in fest)))
        if wahl:
            spalten.append('<div class="katalog-geben"><div class="katalog-geben-art">%s</div>%s</div>'
                           % (katalog.escape(w['choice']), ''.join(self.gabe(r) for r in wahl)))
        for art, label in (('t', w.get('titlelabel')), ('v', w.get('virtuelabel')),
                           ('tr', w.get('trait')), ('e', w.get('emote'))):
            gruppe = [r for r in merk if r[0] == art]
            if gruppe:
                spalten.append('<div class="katalog-geben"><div class="katalog-geben-art">%s</div>%s</div>'
                               % (katalog.escape(label or w['rewards']),
                                  ''.join(self.gabe(r) for r in gruppe)))
        inhalt = '<div class="katalog-gaben">%s</div>' % ''.join(spalten) if spalten else ''
        braucht = self.voraussetzer().get(quest['i'], [])
        if braucht:
            inhalt += '<h3>%s</h3><ul>%s</ul>' % (katalog.escape(w['required_by']), ''.join(
                '<li>%s</li>' % self.link('q', other['i'], other['n']) for other in braucht[:12]))
            if len(braucht) > 12:
                inhalt += katalog.paragraph(w['more_in_list'].replace('%s', str(len(braucht) - 12)),
                                            'katalog-hinweis')
        return abschnitt(w['rewards'], inhalt)

    def zusammenhang(self, quest):
        w = self.w
        links = []
        for ident in quest.get('pq', []):
            other = self.model['all']['q'].get(ident)
            if other:
                links.append((w['previous'], self.link('q', ident, other['n'])))
        for ident in [quest['nq']] if quest.get('nq') else []:
            other = self.model['all']['q'].get(ident)
            if other:
                links.append((w['next'], self.link('q', ident, other['n'])))
        # No placeholder row for a missing successor: a line that only says
        # "nothing recorded" says nothing on every page it appears.
        braucht = self.voraussetzer().get(quest['i'], [])
        if braucht:
            links.append((w['required_by'], '%d %s' % (len(braucht), w['qlist'])))
        alternativen = [self.link('q', ident, self.model['all']['q'][ident]['n'])
                        for ident in quest.get('e', []) if ident in self.model['all']['q']]
        if alternativen:
            links.append((w['excludes'], ' · '.join(alternativen)))
        andere = self.gleicher_geber(quest)
        if quest.get('g') and andere:
            links.append((w['same_giver_label'], '%d %s %s' % (len(andere), w['qlist'],
                                                               katalog.escape(quest['g']))))
        nachbarn = self.selber_ort(quest)
        if nachbarn:
            links.append((w['same_place_label'], '%d %s' % (len(nachbarn), w['qlist'])))
        # A "Taten" row was printed on every quest page and could never become a
        # link; the catalogue records no quest-to-deed connection.
        if not links:
            return ''
        mitte = (len(links) + 1) // 2
        spalten = [teil for teil in (links[:mitte], links[mitte:]) if teil]
        inhalt = '<div class="katalog-zwei">%s</div>' % ''.join(
            '<dl class="katalog-fakten">%s</dl>' % ''.join(
                '<dt>%s</dt><dd>%s</dd>' % (katalog.escape(a), b)
                for a, b in teil)
            for teil in spalten)
        titel = {'de': 'Zusammenhang', 'en': 'Context', 'fr': 'Contexte'}[self.lang]
        return abschnitt(titel, inhalt)

    def quest(self, kind, quest):
        if kind != 'q':
            raise ValueError('build_aufgaben renders quests only: ' + kind)
        w, lang = self.w, self.lang
        body = self.chips(quest)
        if quest.get('d'):
            body += abschnitt(w['description'], katalog.paragraph(quest['d'], 'katalog-text'))
        body += self.ort(quest)
        body += self.woher(quest)
        body += self.wofuer(quest)
        body += self.zusammenhang(quest)
        if quest.get('s'):
            schritte = []
            for schritt in quest['s']:
                text = ''.join(katalog.paragraph(absatz, 'katalog-text') for absatz in schritt[1])
                text += '<ul>%s</ul>' % ''.join('<li>%s</li>' % katalog.escape(ziel[0])
                                                for ziel in schritt[2])
                schritte.append('<li>%s</li>' % text)
            body += ('<details class="katalog-ziele" data-nosnippet><summary>%s</summary>'
                     '<ol>%s</ol></details>' % (w['objectives'], ''.join(schritte)))
        beschreibung = '%s: %s. %s. %s.' % (w['qlabel'], quest['n'],
                                            ' › '.join(quest.get('f', [])), w['map'])
        self.write('q', quest['i'], quest['n'], beschreibung, body, icon='aufgabe')


def pages(target, models):
    """Called by build_katalogseiten.build(): quest pages for every language."""
    pfade = []
    for lang in katalog.LANGS:
        pfade += Renderer(Path(target), lang, models).build()
    return pfade


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--sprache', choices=katalog.LANGS, default=None)
    parser.add_argument('--ziel', type=Path, default=Path(__file__).resolve().parent / 'dist-web')
    optionen = parser.parse_args()
    ziel = optionen.ziel
    models = {lang: katalog.load_model(ziel, lang) for lang in katalog.LANGS}
    if optionen.sprache:
        pfade = Renderer(ziel, optionen.sprache, models).build()
    else:
        pfade = pages(ziel, models)
    print('%d Aufgabenseiten' % len(pfade))


if __name__ == '__main__':
    main()
