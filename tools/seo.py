"""Titel und Description je Seite, an einer Stelle und nach einer Regel.

Vorher entstanden beide Texte an vier Stellen: im Seitenlayout, in jeder
View-Funktion von `php_viewmodel.py`, in `Sets.php` und in `Givers.php`. Jede
Stelle hatte ihren eigenen Satzbau, keine kannte eine Längengrenze, und
fehlende Angaben wurden zu leeren oder doppelten Texten.

Hier stehen die Regeln an einem Ort:

* Der Titel ist Name zuerst, dann eine Einordnung, dann die Marke. Den Kern
  bauen die Funktionen, die Marke hängt das Layout an. Passt die Einordnung
  nicht mehr in 43 Zeichen, fällt sie weg — nie der Name, nie die Marke.
* Die Description hat höchstens 155 Zeichen und drei Bausteine: was die Seite
  ist, ein konkreter Fakt, ein Nutzen. Sie wiederholt die Marke nicht.
* Jeder Text wird an Wortgrenzen gekürzt. Fällt ein Fakt weg, bleibt der
  Satz davor stehen; ein Platzhalter kommt nie hinein.
* Zahlen, Ein- und Mehrzahl und die französische Doppelpunkt-Spation kommen
  aus einer Tabelle, nicht aus jeder View-Funktion.
* `dedupe()` sorgt dafür, dass zwei Seiten desselben Typs nicht denselben
  Text tragen. Es greift erst, wenn die Fakten zweier Einträge wirklich
  gleich sind.

Die Funktionen bekommen fertige Werte, keine Rohsätze: die Viewmodels kennen
die Sprache, die Namen und die Verweise bereits.
"""
from __future__ import annotations

import re

# 60 Zeichen passen in eine Suchergebniszeile; die Marke belegt 17 davon.
CORE_MAX = 43
BRAND = 'LOTRO Log Book'
DESC_MAX = 155

_SPACE = re.compile(r'\s+')


def clean(text) -> str:
    """Ein Wert, wie er in einem Meta-Text stehen darf."""
    return _SPACE.sub(' ', str(text or '')).strip()


def num(value, lang: str) -> str:
    """Tausenderpunkte je Sprache, damit „3.200“ nicht als „3,200“ endet."""
    try:
        number = int(value)
    except (TypeError, ValueError):
        return clean(value)
    groups = '{:,}'.format(number).replace(',', '\x00')
    separator = {'de': '.', 'en': ',', 'fr': '\u202f'}.get(lang, '.')
    return groups.replace('\x00', separator)


# Zählwörter: eine Form für eins, eine für alles andere.
NOUNS = {
    'de': {'quest': ('Aufgabe', 'Aufgaben'), 'deed': ('Tat', 'Taten'),
           'item': ('Gegenstand', 'Gegenstände'), 'step': ('Schritt', 'Schritte'),
           'reward': ('Belohnung', 'Belohnungen'), 'tier': ('Rufstufe', 'Rufstufen'),
           'source': ('Rufquelle', 'Rufquellen'), 'part': ('Teil', 'Teile'),
           'ingredient': ('Zutat', 'Zutaten'), 'recipe': ('Rezept', 'Rezepte'),
           'entry': ('Eintrag', 'Einträge'), 'area': ('Gebiet', 'Gebiete'),
           'place': ('Ort', 'Orte')},
    'en': {'quest': ('quest', 'quests'), 'deed': ('deed', 'deeds'),
           'item': ('item', 'items'), 'step': ('step', 'steps'),
           'reward': ('reward', 'rewards'), 'tier': ('reputation tier', 'reputation tiers'),
           'source': ('source', 'sources'), 'part': ('piece', 'pieces'),
           'ingredient': ('ingredient', 'ingredients'), 'recipe': ('recipe', 'recipes'),
           'entry': ('entry', 'entries'), 'area': ('area', 'areas'),
           'place': ('place', 'places')},
    'fr': {'quest': ('quête', 'quêtes'), 'deed': ('prouesse', 'prouesses'),
           'item': ('objet', 'objets'), 'step': ('étape', 'étapes'),
           'reward': ('récompense', 'récompenses'), 'tier': ('palier', 'paliers'),
           'source': ('source', 'sources'), 'part': ('pièce', 'pièces'),
           'ingredient': ('ingrédient', 'ingrédients'), 'recipe': ('recette', 'recettes'),
           'entry': ('entrée', 'entrées'), 'area': ('région', 'régions'),
           'place': ('lieu', 'lieux')},
}

# Französisch setzt vor den Doppelpunkt ein schmales Leerzeichen.
COLON = {'de': ': ', 'en': ': ', 'fr': ' : '}


def count(lang: str, value, key: str) -> str:
    """„4 Schritte“, „1 Schritt“, „3,200 quests“ — mit der Zahl der Sprache."""
    one, many = NOUNS.get(lang, NOUNS['de'])[key]
    try:
        number = int(value)
    except (TypeError, ValueError):
        return clean(value)
    return '%s %s' % (num(number, lang), one if number == 1 else many)


def fit(text: str, limit: int) -> str:
    """An der letzten Wortgrenze kürzen, nie mitten im Wort."""
    text = clean(text)
    if len(text) <= limit:
        return text
    cut = text[:limit].rsplit(' ', 1)[0].rstrip(' ,;:–-·')
    return cut + '…'


def title(name, *qualifiers) -> str:
    """Name zuerst; die erste Einordnung, die noch passt, kommt mit."""
    name = clean(name)
    if not name:
        return clean(qualifiers[0]) if qualifiers else BRAND
    for qualifier in qualifiers:
        qualifier = clean(qualifier)
        if not qualifier:
            continue
        candidate = '%s – %s' % (name, qualifier)
        if len(candidate) <= CORE_MAX:
            return candidate
    return name


def desc(*parts) -> str:
    """Sätze aneinanderhängen, was nicht mehr passt bleibt weg."""
    kept, total = [], 0
    for part in parts:
        part = clean(part)
        if not part:
            continue
        extra = len(part) + (1 if kept else 0)
        if total + extra > DESC_MAX:
            continue
        kept.append(part)
        total += extra
    return fit(' '.join(kept), DESC_MAX)


def trail(parts) -> str:
    """Die letzten beiden Stufen eines Gebietswegs, z. B. „Eriador › Angmar“."""
    rows = [clean(part) for part in (parts or []) if clean(part)]
    return ' › '.join(rows[-2:])


def level_span(low, high, lang: str) -> str:
    """„Stufe 14–32“, oder nur eine Zahl, wenn beide gleich sind.

    Kleingeschrieben für Englisch und Französisch: der Ausdruck steht mitten
    im Satz („6 quests, level 1–65“), nur das deutsche „Stufe“ ist ein Nomen.
    """
    low, high = clean(low), clean(high)
    if not low and not high:
        return ''
    label = {'de': 'Stufe', 'en': 'level', 'fr': 'niveau'}[lang]
    if not low or not high or str(low) == str(high):
        return '%s %s' % (label, low or high)
    return '%s %s–%s' % (label, low, high)


# --- die Texte je Art ---------------------------------------------------

# Jede Art liefert denselben Bauplan: Typ und Name, dann Fakten, dann der
# Nutzen. Das hält die Texte vergleichbar und macht sie ohne Satzbau-Risiko
# (kein „in die Trollhöhen“) eindeutig.
TYPE = {
    'de': {'q': 'Aufgabe', 'd': 'Tat', 'i': 'Gegenstand', 'recipe': 'Rezept',
           'title': 'Titel', 'virtue': 'Tugend', 'f': 'Fraktion', 'l': 'Landmarke',
           'area': 'Gebiet', 'region': 'Region', 'set': 'Set', 'giver': 'Auftraggeber',
           'p': 'Handwerk'},
    'en': {'q': 'Quest', 'd': 'Deed', 'i': 'Item', 'recipe': 'Recipe',
           'title': 'Title', 'virtue': 'Virtue', 'f': 'Faction', 'l': 'Landmark',
           'area': 'Area', 'region': 'Region', 'set': 'Set', 'giver': 'Quest giver',
           'p': 'Crafting'},
    'fr': {'q': 'Quête', 'd': 'Prouesse', 'i': 'Objet', 'recipe': 'Recette',
           'title': 'Titre', 'virtue': 'Vertu', 'f': 'Faction', 'l': 'Lieu remarquable',
           'area': 'Région', 'region': 'Contrée', 'set': 'Ensemble',
           'giver': 'Donneur de quête', 'p': 'Artisanat'},
}

# Einordnung im Titel, wenn sie noch in die 43 Zeichen passt.
BADGE = {
    'de': {'q': 'Aufgabe', 'd': 'Tat', 'i': '', 'recipe': 'Rezept', 'title': 'Titel',
           'virtue': 'Tugend', 'f': 'Fraktion', 'l': 'Landmarke', 'area': 'Gebiet',
           'region': 'Region', 'set': 'Set', 'giver': 'Auftraggeber', 'p': 'Handwerk'},
    'en': {'q': 'Quest', 'd': 'Deed', 'i': '', 'recipe': 'Recipe', 'title': 'Title',
           'virtue': 'Virtue', 'f': 'Faction', 'l': 'Landmark', 'area': 'Area',
           'region': 'Region', 'set': 'Set', 'giver': 'Quest giver', 'p': 'Crafting'},
    'fr': {'q': 'Quête', 'd': 'Prouesse', 'i': '', 'recipe': 'Recette', 'title': 'Titre',
           'virtue': 'Vertu', 'f': 'Faction', 'l': 'Lieu remarquable', 'area': 'Région',
           'region': 'Contrée', 'set': 'Ensemble', 'giver': 'Donneur de quête',
           'p': 'Artisanat'},
}

CLOSING = {
    'de': {'q': 'Ziele und Ort auf der Karte.',
           'd': 'Ziele und Ort auf der Karte.',
           'i': 'Werte und Sets im Überblick.',
           'recipe': 'Zutaten und kritische Herstellung.',
           'title': 'Mit allen Taten, die ihn vergeben.',
           'virtue': 'Mit allen Taten, die sie vergeben.',
           'f': 'Rufstufen und Quellen im Blick.',
           'l': 'Position und Aufgaben in der Nähe.',
           'area': 'Mit Karte und Auftraggebern.',
           'region': 'Mit Karte und Auftraggebern.',
           'set': 'Setboni und Fundorte im Überblick.',
           'giver': 'Standort, Karte und alle Aufgaben.',
           'p': 'Zutaten und kritische Herstellung.'},
    'en': {'q': 'Objectives and the place on the map.',
           'd': 'Objectives and the place on the map.',
           'i': 'Stats and sets at a glance.',
           'recipe': 'Ingredients and critical crafting.',
           'title': 'With every deed that awards it.',
           'virtue': 'With every deed that awards it.',
           'f': 'Reputation tiers and sources at a glance.',
           'l': 'Position and nearby quests.',
           'area': 'With map and quest givers.',
           'region': 'With map and quest givers.',
           'set': 'Set bonuses and sources at a glance.',
           'giver': 'Location, map and every quest.',
           'p': 'Ingredients and critical crafting.'},
    'fr': {'q': 'Objectifs et lieu sur la carte.',
           'd': 'Objectifs et lieu sur la carte.',
           'i': 'Statistiques et ensembles.',
           'recipe': 'Ingrédients et fabrication critique.',
           'title': 'Avec toutes les prouesses qui le donnent.',
           'virtue': 'Avec toutes les prouesses qui la donnent.',
           'f': 'Paliers et sources en un coup d’œil.',
           'l': 'Position et quêtes à proximité.',
           'area': 'Avec carte et donneurs de quête.',
           'region': 'Avec carte et donneurs de quête.',
           'set': 'Bonus et sources en un coup d’œil.',
           'giver': 'Lieu, carte et toutes les quêtes.',
           'p': 'Ingrédients et fabrication critique.'},
}

# Der längere Nutzen-Satz für Seiten ohne einen einzigen belegten Fakt.
THIN = {
    'de': {'i': 'Werte, Fundorte und Sets im Überblick.',
           'l': 'Position auf der Karte und Aufgaben in der Nähe.'},
    'en': {'i': 'Stats, sources and sets at a glance.',
           'l': 'Position on the map and quests nearby.'},
    'fr': {'i': 'Statistiques, sources et ensembles en un coup d’œil.',
           'l': 'Position sur la carte et quêtes à proximité.'},
}


def _type(lang: str, kind: str) -> str:
    return TYPE.get(lang, TYPE['de']).get(kind) or TYPE['de'].get(kind, '')


def _badge(lang: str, kind: str) -> str:
    return BADGE.get(lang, BADGE['de']).get(kind) or ''


def _closing(lang: str, kind: str, thin: bool = False) -> str:
    # These facts are supplied by the caller; do not promise absent sections.
    if kind in ('i', 'title', 'virtue', 'l', 'set'):
        return ''
    if thin:
        return THIN.get(lang, THIN['de']).get(kind) or _closing(lang, kind)
    return CLOSING.get(lang, CLOSING['de']).get(kind, '')


def _head(lang: str, kind: str, name: str) -> str:
    """„Aufgabe: Prolog: Die Weisheit der Drosseln.“ — Typ, dann Name."""
    return '%s%s%s.' % (_type(lang, kind), COLON.get(lang, ': '), clean(name))


# --- je Art -------------------------------------------------------------

def quest(lang: str, *, name: str, area: str = '', level='', giver: str = '',
          steps: int = 0, rewards: int = 0) -> dict:
    where = trail([area]) if area else ''
    place = ', '.join(part for part in (
        where, ('%s %s' % ({'de': 'Stufe', 'en': 'level', 'fr': 'niveau'}[lang], level))
        if level else '') if part)
    facts = [place + '.'] if place else []
    if giver:
        facts.append('%s%s%s.' % ({'de': 'Auftraggeber', 'en': 'Quest giver',
                                   'fr': 'Donneur de quête'}[lang],
                                  COLON.get(lang, ': '), giver))
    if steps:
        facts.append(count(lang, steps, 'step') + '.')
    if rewards:
        facts.append(count(lang, rewards, 'reward') + '.')
    return {
        'title': title(name, _badge(lang, 'q'), where),
        'description': desc(_head(lang, 'q', name), *facts, _closing(lang, 'q')),
    }


def deed(lang: str, *, name: str, area: str = '', kind: str = '', level='',
         steps: int = 0) -> dict:
    where = trail([area]) if area else ''
    facts = []
    if where or level:
        facts.append(', '.join(part for part in (
            where, ('%s %s' % ({'de': 'Stufe', 'en': 'level', 'fr': 'niveau'}[lang], level))
            if level else '') if part) + '.')
    if kind:
        facts.append(kind + '.')
    if steps:
        facts.append(count(lang, steps, 'step') + '.')
    return {
        'title': title(name, _badge(lang, 'd'), where),
        'description': desc(_head(lang, 'd', name), *facts, _closing(lang, 'd')),
    }


def item(lang: str, *, name: str, quality: str = '', category: str = '',
         level='', source: str = '') -> dict:
    facts = []
    if quality and level:
        facts.append('%s, %s %s.' % (quality, {'de': 'Stufe', 'en': 'level',
                                               'fr': 'niveau'}[lang], level))
    elif quality:
        facts.append(quality + '.')
    elif level:
        facts.append('%s %s.' % ({'de': 'Stufe', 'en': 'Level', 'fr': 'Niveau'}[lang], level))
    if category:
        facts.append(category + '.')
    if source:
        facts.append('%s%s%s.' % ({'de': 'Fundort', 'en': 'Source', 'fr': 'Source'}[lang],
                                  COLON.get(lang, ': '), source))
    return {
        'title': title(name, quality, _type(lang, 'i')),
        'description': desc(_head(lang, 'i', name), *facts,
                            _closing(lang, 'i', thin=not facts)),
    }


def recipe(lang: str, *, name: str, profession: str = '', tier: str = '',
           level='', ingredients: int = 0) -> dict:
    facts = []
    if profession or tier:
        facts.append(', '.join(part for part in (profession, tier) if part) + '.')
    if level:
        facts.append('%s %s.' % ({'de': 'Stufe', 'en': 'Level', 'fr': 'Niveau'}[lang], level))
    if ingredients:
        facts.append(count(lang, ingredients, 'ingredient') + '.')
    return {
        'title': title(name, _badge(lang, 'recipe'),
                       {'de': 'für %s', 'en': 'for %s', 'fr': 'pour %s'}[lang] % profession
                       if profession else ''),
        'description': desc(_head(lang, 'recipe', name), *facts, _closing(lang, 'recipe')),
    }


def honor(lang: str, *, name: str, art: str, sources: list) -> dict:
    """Titel und Tugend teilen sich den Aufbau: Name, Quellen, Nutzen."""
    total = len(sources)
    facts = []
    if total:
        first = clean((sources[0] or {}).get('text') or '')
        if lang == 'de':
            base = 'Erhältlich durch „%s“.' % first if first else ''
        elif lang == 'en':
            base = 'Earned through “%s”.' % first if first else ''
        else:
            base = 'Obtenu avec « %s ».' % first if first else ''
        facts.append(base)
    return {
        'title': title(name, _badge(lang, art)),
        'description': desc(_head(lang, art, name), *facts, _closing(lang, art)),
    }


def faction(lang: str, *, name: str, tiers: int = 0, sources: int = 0) -> dict:
    facts = []
    if tiers:
        facts.append(count(lang, tiers, 'tier') + '.')
    if sources:
        facts.append(count(lang, sources, 'source') + '.')
    return {
        'title': title(name, _badge(lang, 'f')),
        'description': desc(_head(lang, 'f', name), *facts, _closing(lang, 'f')),
    }


def landmark(lang: str, *, name: str, area: str = '', region: str = '',
             quests: int = 0) -> dict:
    where = trail([region, area])
    facts = []
    if where:
        facts.append(where + '.')
    if quests:
        facts.append({'de': '%s führen dorthin.' % count(lang, quests, 'quest'),
                      'en': '%s lead there.' % count(lang, quests, 'quest'),
                      'fr': '%s y mènent.' % count(lang, quests, 'quest')}[lang])
    return {
        'title': title(name, _badge(lang, 'l'), where),
        'description': desc(_head(lang, 'l', name), *facts,
                            _closing(lang, 'l', thin=not facts)),
    }


def area(lang: str, *, name: str, parent: str = '', quests: int = 0,
         deeds: int = 0, items: int = 0) -> dict:
    head = ('%s %s %s%s%s.' % (_type(lang, 'area'),
                               {'de': 'in', 'en': 'in', 'fr': 'en'}[lang], parent,
                               COLON.get(lang, ': '), name)) if parent \
        else _head(lang, 'area', name)
    facts = []
    counts = [count(lang, value, key) for value, key in
              ((quests, 'quest'), (deeds, 'deed'), (items, 'item')) if value]
    if counts:
        facts.append(', '.join(counts) + '.')
    return {
        'title': title(name, _badge(lang, 'area'),
                       ('%s %s' % ({'de': 'in', 'en': 'in', 'fr': 'en'}[lang], parent))
                       if parent else ''),
        'description': desc(head, *facts, _closing(lang, 'area')),
    }


def region(lang: str, *, name: str, areas: int = 0, quests: int = 0, deeds: int = 0) -> dict:
    facts = []
    counts = [count(lang, value, key) for value, key in
              ((areas, 'area'), (quests, 'quest'), (deeds, 'deed')) if value]
    if counts:
        facts.append(', '.join(counts) + '.')
    return {
        'title': title(name, _badge(lang, 'region')),
        'description': desc(_head(lang, 'region', name), *facts, _closing(lang, 'region')),
    }


def set_(lang: str, *, name: str, parts: int = 0, first: str = '') -> dict:
    facts = []
    if parts and first:
        facts.append({'de': '%s, darunter „%s“.' % (count(lang, parts, 'part'), first),
                      'en': '%s, including “%s”.' % (count(lang, parts, 'part'), first),
                      'fr': '%s, dont « %s ».' % (count(lang, parts, 'part'), first)}[lang])
    elif parts:
        facts.append(count(lang, parts, 'part') + '.')
    return {
        'title': title(name, _badge(lang, 'set')),
        'description': desc(_head(lang, 'set', name), *facts, _closing(lang, 'set')),
    }


def giver(lang: str, *, name: str, place: str = '', quests: int = 0,
          low='', high='') -> dict:
    facts = [place + '.'] if place else []
    parts = []
    if quests:
        parts.append(count(lang, quests, 'quest'))
    span = level_span(low, high, lang) if (low or high) else ''
    if span:
        parts.append(span)
    if parts:
        facts.append(', '.join(parts) + '.')
    return {
        'title': title(name, _badge(lang, 'giver'), place),
        'description': desc(_head(lang, 'giver', name), *facts, _closing(lang, 'giver')),
    }


def profession(lang: str, *, name: str, recipes: int = 0, low='', high='') -> dict:
    facts = []
    if recipes:
        span = level_span(low, high, lang) if (low or high) else ''
        facts.append(count(lang, recipes, 'recipe') + (', %s.' % span if span else '.'))
    return {
        'title': title(name, _badge(lang, 'p')),
        'description': desc(_head(lang, 'p', name), *facts, _closing(lang, 'p')),
    }


def listpage(lang: str, *, label: str, page: int, pages: int, entries: int,
             kind: str) -> dict:
    """Eine Übersichtsseite; die Folgeseiten unterscheiden sich im Text."""
    if not entries:
        # Handwerk und Katalog listen Abschnitte, keine Einträge.
        hub = {
            'craft': {'de': 'Alle Berufe mit Rezepten, Zutaten und Stufen.',
                      'en': 'Every profession with recipes, ingredients and tiers.',
                      'fr': 'Tous les métiers avec recettes, ingrédients et paliers.'},
            'catalog': {'de': 'Alle Bereiche: Aufgaben, Taten, Gegenstände und Handwerk.',
                        'en': 'Every section: quests, deeds, items and crafting.',
                        'fr': 'Toutes les sections : quêtes, prouesses, objets et artisanat.'},
        }.get(kind, {lang: ''})
        return {'title': label, 'description': desc('%s.' % label, hub.get(lang, ''))}
    position = ''
    if page > 1:
        position = {'de': ', Seite %s von %s' % (page, pages),
                    'en': ', page %s of %s' % (page, pages),
                    'fr': ', page %s sur %s' % (page, pages)}[lang]
    detail = ''
    return {
        'title': '%s – %s %s' % (label, {'de': 'Seite', 'en': 'Page', 'fr': 'Page'}[lang], page) if page > 1 else label,
        'description': desc('%s%s%s%s%s.' % (label, COLON.get(lang, ': '),
                                             count(lang, entries, 'entry'),
                                             detail, position)),
    }


# --- Eindeutigkeit ------------------------------------------------------

# Fällt zweimal derselbe Text an, ist der nächste Unterschied gefragt. Diese
# Reihenfolge liest sich wie ein Zusatz, nicht wie eine Notlösung.
_ALT = {
    'i': lambda page: [row.get('text') for row in (page.get('sources') or [])[1:4]],
    'title': lambda page: [row.get('text') for row in (page.get('sources') or [])[1:4]],
    'virtue': lambda page: [row.get('text') for row in (page.get('sources') or [])[1:4]],
    'l': lambda page: [row.get('text') for row in (page.get('quests') or [])[:2]],
    'set': lambda page: [row.get('name') for row in (page.get('members') or [])[1:3]],
    'recipe': lambda page: [row.get('text') for row in (page.get('ingredients') or [])[:3]],
    'giver': lambda page: [row.get('name') for row in (page.get('quests') or [])[:2]],
    'area': lambda page: [row.get('text') for row in (page.get('children') or [])[:2]],
    'region': lambda page: [row.get('text') for row in (page.get('children') or [])[:2]],
    'f': lambda page: [row.get('text') for group in (page.get('groups') or [])
                       for row in (group.get('entries') or [])[:2]],
    'p': lambda page: [row.get('text') for group in (page.get('groups') or [])
                       for row in (group.get('entries') or [])[:2]],
}


def dedupe(lang: str, kind: str, pages: dict) -> int:
    """Gleiche Descriptions innerhalb einer Art auflösen.

    Die Texte tragen den Namen und die Fakten schon; ein Rest bleibt nur, wenn
    zwei Einträge wirklich gleich heißen. Dann kommt ein weiterer vorhandener
    Spielinhalt dazu. Ohne sinnvollen Zusatz bleibt der Text gleich.
    Gibt die Zahl der geänderten Seiten zurück.
    """
    seen: dict[str, str] = {}
    changed = 0
    alts = _ALT.get(kind)
    for ident, page in pages.items():
        block = page.get('seo')
        if not block or not block.get('description'):
            continue
        text = block['description']
        key = text.casefold()
        if key not in seen:
            seen[key] = ident
            continue
        candidates = []
        if alts:
            candidates.extend(value for value in alts(page) if clean(value))
        # Equal descriptions are fine when no useful distinguishing fact exists.
        for candidate in candidates:
            extra = clean(candidate)
            if not extra or extra.casefold() in key:
                continue
            # Platz für den Zusatz schaffen, statt ihn abzuschneiden: erst der
            # Text auf das Restmaß, dann der Zusatz.
            room = DESC_MAX - len(extra) - 3
            base = fit(text, room).rstrip('… .')
            proposal = '%s · %s.' % (base, extra)
            if proposal.casefold() in seen:
                continue
            block['description'] = proposal
            seen[proposal.casefold()] = ident
            changed += 1
            break
    return changed
