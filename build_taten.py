#!/usr/bin/env python3
"""Deed pages, generated on their own.

A deed layout change should not rebuild the whole catalogue. These pages live
in their own generator; the catalogue builder calls into here, so a normal
build still produces every page.

The layout follows the quest pages: Beschreibung · Ort · Woher · Wofür ·
Zusammenhang, trophy before the title, objectives behind a closed <details>.
Deeds have no quest giver and no belegt chain, so "Woher" names the deed type
and category, and "Zusammenhang" only links other deeds in the same area or of
the same kind.

    python3 build_taten.py --ziel ~/.cache/llb-gesamt
    python3 build_taten.py --sprache de --ziel ~/.cache/llb-gesamt
"""
import argparse
import json
import re
import shutil
from pathlib import Path

import build_katalogseiten as katalog

HIER = Path(__file__).resolve().parent
EXPORT = Path('/Users/adrian/Documents/07_Hobbys/Lotro/Companion-Test/source-exporter'
              '/full-dat-en-de-fr-2026-11-03/deeds.json')

# Accomplishment_Category from the client export. Everything else is an
# honest "other deed" instead of a guessed label.
TYPEN = {
    1: {'de': 'Entdecker', 'en': 'Explorer', 'fr': 'Explorateur'},
    11: {'de': 'Aufgabentat', 'en': 'Quest deed', 'fr': 'Prouesse de quête'},
    20: {'de': 'Bezwinger', 'en': 'Slayer', 'fr': 'Vainqueur'},
    33: {'de': 'Kunde', 'en': 'Lore', 'fr': 'Savoir'},
    34: {'de': 'Kunde', 'en': 'Lore', 'fr': 'Savoir'},
}
ANDERE = {'de': 'Weitere Tat', 'en': 'Other deed', 'fr': 'Autre prouesse'}
_KATEGORIEN = None


def kategorien():
    """Deed ID -> Accomplishment_Category, read once for all languages."""
    global _KATEGORIEN
    if _KATEGORIEN is None:
        _KATEGORIEN = {}
        if EXPORT.is_file():
            for row in json.loads(EXPORT.read_text(encoding='utf-8')):
                _KATEGORIEN[str(row.get('id')).upper()] = (row.get('properties') or {}).get(
                    'Accomplishment_Category')
    return _KATEGORIEN


class Renderer(katalog.Renderer):
    """Deed pages only; the shell comes from the catalogue renderer."""

    def __init__(self, target, lang, models):
        super().__init__(target, lang, models)
        self._gebiet_index = None
        self._art_index = None

    def build(self):
        for deed in self.selected['d'].values():
            self.deed(deed)
        return self.paths

    # --- helpers --------------------------------------------------------
    def gebiet(self, deed):
        """Named path only; "Karte 268…" is a technical map name, not a place."""
        return [part for part in deed.get('f') or []
                if part and not re.fullmatch(r'Karte \d+', str(part))]

    def typ(self, deed):
        category = kategorien().get(str(deed.get('i')).upper())
        return TYPEN.get(category, ANDERE)[self.lang]

    def karten(self, deed):
        return sorted({point[0] for point in deed.get('t') or []})

    def chips(self, deed):
        w = self.w
        gebiet = self.gebiet(deed)
        chips = []
        if deed.get('l'):
            chips.append('%s %s' % (w['level'], deed['l']))
        if gebiet:
            chips.append(' · '.join(gebiet[-2:]))
        chips.append(self.typ(deed))
        if deed.get('s'):
            chips.append(w['steps_one'] if len(deed['s']) == 1 else w['steps_count'] % len(deed['s']))
        if deed.get('rw'):
            chips.append(w['rewards_one'] if len(deed['rw']) == 1 else w['rewards_count'] % len(deed['rw']))
        if deed.get('lp'):
            chips.append('%s %s' % (w['points'], deed['lp']))
        return '<p class="katalog-chips">%s</p>' % ''.join(
            '<span class="katalog-chip">%s</span>' % katalog.escape(chip) for chip in chips)

    def item_for(self, name):
        ids = self.by_name.get(self.sauber(name), set())
        return next(iter(ids)) if len(ids) == 1 else None

    def item_symbol(self, item_id):
        return (self.selected['i'].get(item_id) or {}).get('ic') if item_id else None

    def gabe(self, art, name, menge=0, kennung=''):
        if art in ('i', 'c'):
            item_id = str(kennung).upper() if kennung else self.item_for(name)
            text = katalog.escape(name)
            if item_id:
                text = self.symbol(self.item_symbol(item_id)) + self.link('i', item_id, name)
            if menge and menge > 1:
                text = str(menge) + ' × ' + text
            return '<div class="katalog-gabe">%s</div>' % text
        if art == 't':
            return ('<div class="katalog-gabe">%s<span><span class="katalog-gabe-art">%s</span> %s</span></div>' % (
                self.entitaetssymbol('titel'), katalog.escape(self.w['titlelabel']), katalog.escape(name)))
        if art == 'v':
            return ('<div class="katalog-gabe">%s<span><span class="katalog-gabe-art">%s</span> %s</span></div>' % (
                self.entitaetssymbol('tugend'), katalog.escape(self.w['virtuelabel']), katalog.escape(name)))
        label = {'tr': self.w['trait'], 'e': self.w['emote']}.get(art, self.w['rewards'])
        return '<div class="katalog-gabe"><span class="katalog-gabe-art">%s</span> %s</div>' % (
            katalog.escape(label), katalog.escape(name))

    # --- sections -------------------------------------------------------
    def ort(self, deed):
        w = self.w
        punkte = deed.get('t') or []
        if not punkte:
            # Nothing to place and nothing to link: no empty "Ort" section.
            return ''
        karten = self.karten(deed)
        inhalt = ''
        # A single recorded point gets the map cut with a pin, exactly like a
        # quest giver. Many points get the map and a count, never a fake route.
        if len(karten) == 1:
            karte = self.model['maps'].get(str(karten[0])) or self.model['maps'].get(karten[0])
            if len(punkte) == 1 and karte and all(karte.get(k) is not None for k in ('north', 'south', 'west', 'east')):
                breite = karte['east'] - karte['west']
                hoehe = karte['north'] - karte['south']
                if breite > 0 and hoehe > 0:
                    _, lat, lon = punkte[0][:3]
                    x = min(100.0, max(0.0, (lon - karte['west']) / breite * 100))
                    y = min(100.0, max(0.0, (karte['north'] - lat) / hoehe * 100))
                    inhalt += ('<figure class="katalog-ort"><img src="/karten/%s/%s.webp" alt="" '
                               'width="320" height="240" loading="lazy" decoding="async">'
                               '<i class="katalog-pin" style="left:%.1f%%;top:%.1f%%"></i></figure>'
                               % (self.lang, karten[0], x, y))
            if len(punkte) == 1:
                _, lat, lon = punkte[0][:3]
                inhalt += katalog.paragraph('%.1f°%s, %.1f°%s' % (
                    abs(lat), 'S' if lat < 0 else 'N', abs(lon), 'W' if lon < 0 else 'E'), 'katalog-hinweis')
            else:
                inhalt += katalog.paragraph(w['points_count'].replace('%s', str(len(punkte))), 'katalog-hinweis')
        else:
            inhalt += katalog.paragraph('%s · %s' % (
                w['points_count'].replace('%s', str(len(punkte))),
                w['maps_count'].replace('%s', str(len(karten)))), 'katalog-hinweis')
        return katalog.section(w['place'], inhalt)

    def woher(self, deed):
        w = self.w
        fakten = [(w['deed_type'], self.typ(deed))]
        if deed.get('a'):
            fakten.append((w['category'], deed['a']))
        gebiet = self.gebiet(deed)
        if gebiet:
            fakten.append((w['area_label'], ' › '.join(gebiet)))
        inhalt = '<dl class="katalog-fakten">%s</dl>' % ''.join(
            '<dt>%s</dt><dd>%s</dd>' % (katalog.escape(str(k)), katalog.escape(str(v)))
            for k, v in fakten if v)
        return katalog.section({'de': 'Woher', 'en': 'Where from', 'fr': 'Provenance'}[self.lang], inhalt)

    def wofuer(self, deed):
        w = self.w
        fest, wahl = [], []
        for reward in deed.get('rw') or []:
            art, name = reward[0], reward[1]
            menge = reward[4] if len(reward) > 4 else 0
            kennung = reward[6] if len(reward) > 6 else ''
            (wahl if art == 'c' else fest).append(self.gabe(art, name, menge, kennung))
        if deed.get('lp'):
            fest.append('<div class="katalog-gabe"><span class="katalog-gabe-art">%s</span> %s</div>' % (
                katalog.escape(w['points']), deed['lp']))
        inhalt = ''
        if fest:
            inhalt += '<div class="katalog-gaben">%s</div>' % ''.join(fest)
        if wahl:
            inhalt += '<h3>%s</h3><div class="katalog-gaben">%s</div>' % (w['choice'], ''.join(wahl))
        if not inhalt:
            return ''
        return katalog.section(w['wofuer'], inhalt)

    def zusammenhang(self, deed):
        if self._gebiet_index is None:
            self._gebiet_index, self._art_index = {}, {}
            for other in self.model['all'].get('d', {}).values():
                gebiet = self.gebiet(other)
                if gebiet:
                    self._gebiet_index.setdefault(gebiet[-1], []).append(other)
                if other.get('a'):
                    self._art_index.setdefault(other['a'], []).append(other)
        w = self.w
        gebiet = self.gebiet(deed)
        inhalt = ''
        if gebiet and gebiet[-1] not in ('Ohne Gebiet', 'Weitere Inhalte'):
            andere = [q for q in self._gebiet_index.get(gebiet[-1], []) if q['i'] != deed['i']]
            if andere:
                inhalt += '<h3>%s · %s</h3><ul>%s</ul>' % (
                    katalog.escape(w['more_deeds'] % gebiet[-1]), len(andere),
                    ''.join('<li>%s</li>' % self.link('d', q['i'], q['n']) for q in andere[:8]))
                if len(andere) > 8:
                    inhalt += katalog.paragraph(w['more_in_list'].replace('%s', str(len(andere) - 8)),
                                                'katalog-hinweis')
        if deed.get('a') and deed['a'] not in ('Allgemein',):
            andere = [q for q in self._art_index.get(deed['a'], []) if q['i'] != deed['i']]
            if andere:
                inhalt += '<h3>%s · %s</h3><ul>%s</ul>' % (
                    katalog.escape(w['same_kind']), len(andere),
                    ''.join('<li>%s</li>' % self.link('d', q['i'], q['n']) for q in andere[:6]))
                if len(andere) > 6:
                    inhalt += katalog.paragraph(w['more_in_list'].replace('%s', str(len(andere) - 6)),
                                                'katalog-hinweis')
        if not inhalt:
            return ''
        return katalog.section({'de': 'Zusammenhang', 'en': 'Context', 'fr': 'Contexte'}[self.lang], inhalt)

    def deed(self, deed):
        w = self.w
        body = self.chips(deed)
        body += '<p class="katalog-aktionen">%s</p>' % katalog.a(
            katalog.old_link(self.lang, 'd', deed['i']), w['map'], class_='katalog-knopf')
        if deed.get('d'):
            body += katalog.section(w['description'], katalog.paragraph(deed['d'], 'katalog-text'))
        body += self.ort(deed)
        body += self.woher(deed)
        body += self.wofuer(deed)
        body += self.zusammenhang(deed)
        if deed.get('s'):
            schritte = []
            for schritt in deed['s']:
                parts = ''.join(katalog.paragraph(text, 'katalog-text') for text in schritt[1])
                parts += '<ul>%s</ul>' % ''.join('<li>%s</li>' % katalog.escape(ziel[0])
                                                 for ziel in schritt[2])
                schritte.append('<li>%s</li>' % parts)
            body += ('<details class="katalog-ziele" data-nosnippet><summary>%s</summary>'
                     '<ol>%s</ol></details>' % (w['objectives'], ''.join(schritte)))
        beschreibung = '%s: %s. %s. %s.' % (w['dlabel'], deed['n'],
                                            ' › '.join(self.gebiet(deed)), w['map'])
        self.write('d', deed['i'], deed['n'], beschreibung, body, icon='tat')


def pages(target, models):
    """Called by build_katalogseiten.build(): deed pages for every language."""
    pfade = []
    for lang in katalog.LANGS:
        pfade += Renderer(Path(target), lang, models).build()
    return pfade


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--sprache', choices=katalog.LANGS, default=None)
    parser.add_argument('--ziel', type=Path, default=None)
    optionen = parser.parse_args()
    ziel = optionen.ziel or Path(__file__).resolve().parent / 'dist-web'
    # Only the shared stylesheet, never the catalogue or its indexes.
    shutil.copy2(HIER / 'web' / 'katalog.css', ziel / 'katalog.css')
    models = {lang: katalog.load_model(ziel, lang) for lang in katalog.LANGS}
    if optionen.sprache:
        pfade = Renderer(ziel, optionen.sprache, models).build()
    else:
        pfade = pages(ziel, models)
    print('%d Tatenseiten' % len(pfade))


if __name__ == '__main__':
    main()
