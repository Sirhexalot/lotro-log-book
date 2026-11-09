#!/usr/bin/env python3
"""Item pages, generated on their own.

A layout change to items should not rebuild the whole catalogue. These pages
live in their own generator; the catalogue builder calls into here, so a normal
build still produces every page.

The page follows the entity order: Kurz (symbol, name, chips, description,
values) · Woher · Wofür · Ausprägungen · Zusammenhang. A missing description is
omitted, not replaced by filler text.

    python3 build_gegenstaende.py --ziel ~/.cache/llb-gesamt
    python3 build_gegenstaende.py --sprache de --ziel ~/.cache/llb-gesamt
"""
import argparse
import json
import shutil
from collections import defaultdict
from pathlib import Path

import build_katalogseiten as katalog

HIER = Path(__file__).resolve().parent
DATEN = HIER / 'daten'
DETAILS_DATEI = DATEN / 'gegenstand-details.json'
SETS_DATEI = DATEN / 'gegenstand-sets.json'
LABELS_DATEI = DATEN / 'gegenstand-stat-labels.json'
TYPEN_DATEI = DATEN / 'gegenstand-typen.json'

QUALITY = {'COMMON': 1, 'UNCOMMON': 2, 'RARE': 3, 'INCOMPARABLE': 4, 'LEGENDARY': 5}
QUALITY_BY_NUMBER = {1: 'LEGENDARY', 2: 'RARE', 3: 'INCOMPARABLE', 4: 'UNCOMMON', 5: 'COMMON'}
_DETAILS = _SETS = _LABELS = _TYPEN = None


def daten():
    """Load the lookup files once, not once per language."""
    global _DETAILS, _SETS, _LABELS, _TYPEN
    if _DETAILS is None:
        _DETAILS = json.loads(DETAILS_DATEI.read_text(encoding='utf-8')).get('items') or {}
        _SETS = json.loads(SETS_DATEI.read_text(encoding='utf-8')).get('sets') or {}
        _LABELS = json.loads(LABELS_DATEI.read_text(encoding='utf-8'))
        _TYPEN = json.loads(TYPEN_DATEI.read_text(encoding='utf-8'))
    return _DETAILS, _SETS, _LABELS, _TYPEN


BONI_DATEI = Path('/Users/adrian/Documents/07_Hobbys/Lotro/Companion-Test/source-exporter'
                   '/items-stats-2026-11-08/items-stats.json')


class Renderer(katalog.Renderer):
    """Item pages only; the shell comes from the catalogue renderer."""

    def __init__(self, target, lang, models):
        super().__init__(target, lang, models)
        self._varianten = None
        self.details, self.sets, self.labels, self.typen = daten()
        vorkommen_datei = target / ('vorkommen-%s.js' % lang)
        referenz_datei = target / 'referenz.js'
        self.vorkommen = (katalog.read_assignment(vorkommen_datei, 'MQL_VORKOMMEN')
                          if vorkommen_datei.is_file() else {'k': [], 'g': [], 'm': []})
        self.referenz = (katalog.read_assignment(referenz_datei, 'MQL_REFERENZ')
                         if referenz_datei.is_file() else {'berufe': {}})
        self.orte = self.orte_bauen()
        # vorkommen/m uses the 1-based position in vorkommen/k, not the art ID.
        self.vorkommen_index = {str(row[0]): nummer for nummer, row in enumerate(
            self.vorkommen.get('k') or [], 1)}
        self.vorkommen_name = {str(row[0]): row[1] for row in self.vorkommen.get('k') or []}
        # Stat bonuses from export_item_stats.py; empty when the export is missing.
        self.boni, self.boni_namen = {}, {}
        if BONI_DATEI.is_file():
            roh = json.loads(BONI_DATEI.read_text(encoding='utf-8'))
            self.boni = roh.get('items') or {}
            self.boni_namen = (roh.get('labels') or {}).get(self.lang) or {}

    def build(self):
        for item in self.selected['i'].values():
            self.item_page(item)
        return self.paths

    # --- helpers --------------------------------------------------------
    def orte_bauen(self):
        """Resource kind -> [area name, map ID, count], from the map data."""
        gebiete = {str(row[0]): row for row in self.vorkommen.get('g') or []}
        orte = defaultdict(list)
        for area_id, paare in self.vorkommen.get('m') or []:
            gebiet = gebiete.get(str(area_id))
            if not gebiet:
                continue
            for paar in paare:
                if not paar:
                    continue
                orte[str(paar[0])].append([gebiet[1], gebiet[2], paar[1] if len(paar) > 1 else 0])
        return orte

    def beruf_name(self, key):
        eintrag = (self.referenz.get('berufe') or {}).get(key) or {}
        return self.text(eintrag.get('n')) or key or ''

    def stufen_name(self, beruf, stufe):
        eintrag = (self.referenz.get('berufe') or {}).get(beruf) or {}
        for teil in eintrag.get('s') or []:
            if teil.get('t') == stufe:
                return self.text(teil.get('k')) or self.text(teil.get('m')) or ''
        return ''

    def text(self, value):
        if isinstance(value, dict):
            return value.get(self.lang) or value.get('en') or value.get('de') or ''
        return str(value or '')

    def label(self, section, key):
        return ((self.typen.get(section) or {}).get(self.lang) or {}).get(key, key or '')

    def quality(self, item, details):
        value = (details or {}).get('quality') or item.get('q')
        if isinstance(value, int):
            value = QUALITY_BY_NUMBER.get(value)
        return value or ''

    def stat_name(self, stat_id):
        entry = (self.labels.get(self.lang) or {}).get(str(stat_id))
        if isinstance(entry, list) and entry:
            return str(entry[0]), bool(entry[1])
        return str(stat_id), False

    def varianten_index(self):
        if self._varianten is None:
            self._varianten = defaultdict(list)
            for iid, entry in self.model['all'].get('i', {}).items():
                for name in (entry.get('n') or {}).values():
                    if name:
                        self._varianten[self.sauber(name)].append((iid, entry))
        return self._varianten

    def variants(self, item, ident):
        name = self.name('i', item)
        return [(iid, entry) for iid, entry in self.varianten_index().get(self.sauber(name), [])
                if iid != ident]

    def chips(self, item, details, ident):
        w = self.w
        chips = []
        quality = self.quality(item, details)
        if quality:
            chips.append(('q%d' % QUALITY.get(quality, 0), self.label('quality', quality)))
        min_level = (details or {}).get('minLevel')
        if min_level:
            chips.append(('', '%s %s' % (w['min_level'], min_level)))
        if item.get('l') and item['l'] != min_level:
            chips.append(('', '%s %s' % (w['item_level'], item['l'])))
        # Slot, armour/weapon type and category are already the eyebrow above the
        # heading; repeating them as chips made the row say everything twice.
        binding = (details or {}).get('binding')
        if binding == 1:
            chips.append(('', w['bound_acquire']))
        elif binding == 2:
            chips.append(('', w['bound_equip']))
        if (details or {}).get('scalable'):
            chips.append(('', w['scalable']))
        if (details or {}).get('unique'):
            chips.append(('', w['unique']))
        if (details or {}).get('essenceSlots'):
            chips.append(('', '%s %s' % (w['essence_slots'], details['essenceSlots'])))
        anzahl = len(self.variants(item, ident)) + 1
        if anzahl > 1:
            chips.append(('', w['variants_count'] % anzahl))
        if not chips:
            return ''
        return '<p class="katalog-chips">%s</p>' % ''.join(
            '<span class="katalog-chip%s">%s</span>' % (' ' + cls if cls else '', katalog.escape(text))
            for cls, text in chips)

    def werte(self, item, details, ident=None):
        """Every recorded value, without duplicates and without invented numbers.

        The equipment export carries armour, damage and stat ids; the bonus export
        carries further stat bonuses. The old code only used the bonus export when
        the equipment export had nothing at all, so bonuses went missing.
        """
        w = self.w
        werte = item.get('w') or {}
        armour = (details or {}).get('armour') or werte.get('armour')
        dps = (details or {}).get('dps') or werte.get('dps')
        damage = (details or {}).get('damage') or werte.get('damage')
        speed = (details or {}).get('speed') or werte.get('speed')
        damage_type = (details or {}).get('damageType') or werte.get('damageType')
        grund, gesehen = [], set()
        if dps:
            grund.append(('DPS', dps))
        if damage:
            grund.append((w['damage'], damage))
        if speed:
            grund.append((w['speed'], speed))
        if damage_type:
            grund.append((w['damage_type'], damage_type))
        zeilen = []
        for stat_id, value in (details or {}).get('stats') or []:
            if not value:
                continue
            name, percent = self.stat_name(stat_id)
            gesehen.add(name.casefold())
            zeilen.append((name, ('%s %%' % value) if percent else value))
        # The bonus export repeats some of these; only unknown names are new.
        for schluessel, wert in (self.boni.get(ident) or {}).get('s') or []:
            if schluessel == 'ARMOUR':
                continue
            name = self.boni_namen.get(schluessel) or schluessel
            if name.casefold() in gesehen:
                continue
            gesehen.add(name.casefold())
            zeilen.append((name, wert if wert is not None else None))
        scale = (details or {}).get('scale')
        if not armour and not grund and not zeilen and not scale:
            return ''
        inhalt = ''
        if armour or grund or zeilen:
            if armour:
                inhalt += ('<p class="katalog-grundwert"><span>%s</span><b>%s</b></p>'
                           % (katalog.escape(w['armour']), katalog.escape(str(armour))))
            if grund:
                inhalt += '<dl class="katalog-fakten katalog-werte">%s</dl>' % ''.join(
                    '<dt>%s</dt><dd>%s</dd>' % (katalog.escape(str(k)), katalog.escape(str(v)))
                    for k, v in grund)
            if zeilen:
                inhalt += '<ul class="katalog-boni">%s</ul>' % ''.join(
                    '<li><b>%s</b><span>%s</span></li>' % (
                        katalog.escape(('+' + str(v)) if isinstance(v, (int, float)) and v else (str(v) if v is not None else '–')),
                        katalog.escape(str(k)))
                    for k, v in zeilen)
        if scale and scale[0]:
            inhalt += katalog.paragraph('%s %s' % (w['scalable'], scale[0]), 'katalog-hinweis')
        return katalog.section(w['values'], inhalt)

    def vorkommen_abschnitt(self, item):
        w = self.w
        vor = item.get('vor') or []
        if not vor:
            return ''
        gesehen, zeilen = set(), []
        for art_id, name, beruf, stufe in vor:
            name = self.vorkommen_name.get(str(art_id), name)
            schluessel = (str(name), str(beruf), stufe)
            if schluessel in gesehen:
                continue
            gesehen.add(schluessel)
            teile = [self.beruf_name(beruf), '%s %s' % (w['level'], stufe) if stufe else '']
            kopf = '<strong>%s</strong>' % katalog.escape(str(name))
            if any(teile):
                kopf += ' <span class="katalog-gabe-art">%s</span>' % katalog.escape(
                    ' · '.join(part for part in teile if part))
            index = self.vorkommen_index.get(str(art_id))
            orte = sorted(self.orte.get(str(index), []), key=lambda row: -(row[2] or 0))
            links = []
            for ort, karte, anzahl in orte[:6]:
                links.append('%s (%s)' % (
                    katalog.a('/index.html?vorkommen=%s&vorkarte=%s' % (art_id, karte), ort),
                    anzahl))
            if links:
                kopf += '<br><span class="schwach">%s</span>' % ', '.join(links)
            else:
                kopf += '<br><span class="schwach">%s</span>' % katalog.escape(
                    {'de': 'Hier sind noch keine Fundstellen bekannt.', 'en': 'No gathering spots are known here yet.',
                     'fr': 'Aucun lieu de récolte n’est encore connu ici.'}[self.lang])
            zeilen.append('<li>%s</li>' % kopf)
        return katalog.section({'de': 'Vorkommen', 'en': 'Resources', 'fr': 'Ressources'}[self.lang],
                               '<ul>%s</ul>' % ''.join(zeilen))

    def woher(self, item, details):
        w = self.w
        quellen = []
        for art, qid, qname, zone, region in item.get('quellen') or []:
            quellen.append('<li>%s%s</li>' % (self.link(art, qid, qname),
                ' · ' + katalog.escape(' › '.join(filter(None, [region, zone]))) if zone or region else ''))
        rezepte = [self.link('recipe', rid, self.selected['recipe'][rid][0])
                   for rid in item.get('rezepte') or [] if rid in self.selected['recipe']]
        vendor = bool((details or {}).get('vendors'))
        inhalt = ''
        if quellen:
            inhalt += '<ul>%s</ul>' % ''.join(quellen)
        if rezepte:
            inhalt += '<h3>%s</h3><ul>%s</ul>' % (w['crafted_by'], ''.join('<li>%s</li>' % x for x in rezepte))
        if vendor:
            inhalt += katalog.paragraph(w['vendor'], 'katalog-hinweis')
        if not inhalt:
            # "No source recorded" on thousands of pages said nothing; the
            # section only appears when there is something behind it.
            return ''
        return katalog.section({'de': 'Woher', 'en': 'Where from', 'fr': 'Provenance'}[self.lang], inhalt)

    def wofuer(self, item):
        w = self.w
        zutaten = [self.link('recipe', rid, self.selected['recipe'][rid][0])
                   for rid in item.get('zutat') or [] if rid in self.selected['recipe']]
        if not zutaten:
            return ''
        inhalt = katalog.paragraph(w['used_count'].replace('%s', str(len(zutaten))))
        inhalt += '<ul>%s</ul>' % ''.join('<li>%s</li>' % x for x in zutaten[:50])
        if len(zutaten) > 50:
            inhalt += katalog.paragraph(w['more_in_list'].replace('%s', str(len(zutaten) - 50)),
                                        'katalog-hinweis')
        return katalog.section({'de': 'Wofür', 'en': 'Used for', 'fr': 'Utilisation'}[self.lang], inhalt)

    def auspraegungen(self, item, ident):
        w = self.w
        andere = self.variants(item, ident)
        if not andere:
            return ''
        nach_stufe = defaultdict(list)
        for iid, entry in andere:
            nach_stufe[entry.get('l') or 0].append((iid, entry))
        chips = []
        for stufe in sorted(nach_stufe):
            iid, _ = nach_stufe[stufe][0]
            aktiv = ' aktiv' if item.get('l') == stufe else ''
            chips.append('<a class="katalog-chip%s" href="%s">%s %s</a>' % (
                aktiv, katalog.escape(katalog.route(self.lang, 'i', iid)),
                katalog.escape(w['level']), stufe or '?'))
        inhalt = katalog.paragraph(w['variants_count'] % (len(andere) + 1))
        inhalt += '<p class="katalog-chips">%s</p>' % ''.join(chips)
        inhalt += katalog.paragraph(w['variant_note'], 'katalog-hinweis')
        return katalog.section(w['variants'], inhalt)

    def zusammenhang(self, item, details):
        w = self.w
        inhalt = ''
        set_id = (details or {}).get('set')
        setdaten = self.sets.get(str(set_id or ''))
        if setdaten:
            name = self.text(setdaten.get('name'))
            stufe = setdaten.get('level') or 0
            bis = setdaten.get('maxLevel') or 0
            kopf = name
            if stufe:
                kopf += ' · %s %s%s' % (w['level'], stufe, ('–%s' % bis) if bis and bis != stufe else '')
            inhalt += '<h3>%s</h3><p>%s</p>' % (w['set_members'], katalog.escape(kopf))
            glieder = []
            for iid in setdaten.get('items') or []:
                entry = self.model['all'].get('i', {}).get(iid)
                if entry:
                    glieder.append('<li>%s</li>' % self.link('i', iid, self.name('i', entry)))
                elif iid in self.details:
                    glieder.append('<li>%s</li>' % katalog.escape(self.text(self.details[iid].get('name'))))
            if glieder:
                inhalt += '<ul>%s</ul>' % ''.join(glieder)
            bonis = []
            for anzahl, stats in setdaten.get('bonuses') or []:
                werte = []
                for stat_id, value in stats:
                    label, percent = self.stat_name(stat_id)
                    werte.append('%s %s%s' % (label, value, ' %' if percent else ''))
                bonis.append('<li>%s %s: %s</li>' % (anzahl, w['set_members'], ', '.join(werte)))
            if bonis:
                inhalt += '<h3>%s</h3><ul>%s</ul>' % (w['set_bonus'], ''.join(bonis))
        klasse = (details or {}).get('requiredClass')
        if klasse:
            inhalt += katalog.paragraph('%s: %s' % (w['required_class'], katalog.escape(klasse)))
        if not inhalt:
            return ''
        return katalog.section({'de': 'Zusammenhang', 'en': 'Context', 'fr': 'Contexte'}[self.lang], inhalt)

    def beschreibung(self, details):
        text = (details or {}).get('description')
        if isinstance(text, dict):
            text = text.get(self.lang) or text.get('en') or text.get('de')
        text = (text or '').strip()
        if not text:
            return ''
        return katalog.section(self.w['description'], katalog.paragraph(text, 'katalog-text'))

    def weiterstoebern(self, item, details):
        """Straight into the browser with the same slot and armour type."""
        w = self.w
        kat = ((details or {}).get('category') or item.get('kat') or '').upper()
        if kat not in ('ARMOUR', 'WEAPON'):
            return ''
        platz = (details or {}).get('slot') or item.get('slot') or ''
        if not platz:
            return ''
        parameter = 'lang=%s&kat=%s&platz=%s' % (self.lang, kat, platz)
        return katalog.section(w['browse'], '<p>%s</p><p>%s</p>' % (
            katalog.escape(w['browse_text']),
            katalog.a('/gegenstaende.html?' + parameter, w['browse_link'], class_='katalog-knopf')))

    def item_page(self, item):
        w = self.w
        ident = next((k for k, v in self.selected['i'].items() if v is item), None)
        details = self.details.get(ident) or {}
        name = self.name('i', item)
        eyebrow = ' · '.join(filter(None, [
            self.label('slot', (details or {}).get('slot') or item.get('slot') or ''),
            self.label('armour' if (details or {}).get('kind') == 'a' else 'weapon',
                       (details or {}).get('subtype') or item.get('sub') or '')]))
        kopf_oben = ('<p class="katalog-augenbraue">%s</p>' % katalog.escape(eyebrow)) if eyebrow else ''
        qualitaet = QUALITY.get(self.quality(item, details), 0)
        body = self.chips(item, details, ident)
        body += self.beschreibung(details)
        body += self.werte(item, details, ident)
        body += self.vorkommen_abschnitt(item)
        body += self.woher(item, details)
        body += self.wofuer(item)
        body += self.auspraegungen(item, ident)
        body += self.zusammenhang(item, details)
        body += self.weiterstoebern(item, details)
        self.write('i', ident, name, '%s: %s. %s' % (w['ilabel'], name, w['item_intro']),
                   body, symbol=item.get('ic'),
                   kopf_oben=kopf_oben, kopf_klasse='q%d' % qualitaet if qualitaet else '')


def pages(target, models):
    """Called by build_katalogseiten.build(): item pages for every language."""
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
    print('%d Gegenstandsseiten' % len(pfade))


if __name__ == '__main__':
    main()
