"""Buckets and base types for the recipe categories.

The client knows 513 flat recipe categories ("Light Armour (Level 40)",
"Light Armour (Guild)", "Light Armour (Lossoth)", …). The website groups them
for the filter into three levels:

    bucket        → base type        → exact category
    Rüstung       → Leichte Rüstung  → Gilde

The bucket is a content decision, so the English client name of every base type
is listed here explicitly. A base type that is not listed is reported by the
build and lands in the last bucket; nothing is guessed from a translated name.

Base type and leaf label are derived from the name the client shows in the
respective language: the base type is the name without its trailing qualifier,
the leaf label is the qualifier itself. The key of a base type comes from the
English name, so the tree is the same in every language; its label is the
localised wording the client uses for most categories of that base type.
"""

import collections
import html
import re
import unicodedata

SPRACHEN = ('de', 'en', 'fr')

# Order matters: it is the order of the filter. The last bucket catches every
# base type that is not listed above.
BUENDEL = (
    ('ruestung', {'de': 'Rüstung', 'en': 'Armour', 'fr': 'Armure'}, (
        'Armour',
        'Light Armour', 'Medium Armour', 'Heavy Armour',
        'Gundabad Light Armour', 'Gundabad Medium Armour', 'Gundabad Heavy Armour',
        'Ithil Light Armour', 'Ithil Medium Armour', 'Ithil Heavy Armour',
        'Madáshi Light Armour', 'Madáshi Medium Armour', 'Madáshi Heavy Armour',
        'Umbari Light Armour', 'Umbari Medium Armour', 'Umbari Heavy Armour',
    )),
    ('waffen', {'de': 'Waffen', 'en': 'Weapons', 'fr': 'Armes'}, (
        'Weapons', 'Melee Weapons', 'Ranged Weapons', 'Swords',
        'Burglar Throwing Weapons',
        'Gundabad Melee Weapons', 'Gundabad Ranged Weapons',
        'Ithil Melee Weapons', 'Ithil Ranged Weapons',
        'Madáshi Melee Weapons', 'Madáshi Ranged Weapons',
        'Umbari Melee Weapons', 'Umbari Ranged Weapons',
    )),
    ('legendaer', {'de': 'Legendäres', 'en': 'Legendary items',
                   'fr': 'Objets légendaires'}, (
        'Legendary Beorning Carvings', 'Legendary Beorning Weapons',
        'Legendary Bridles',
        'Legendary Burglar Tools', 'Legendary Burglar Weapons',
        'Legendary Captain Emblems', 'Legendary Captain Weapons',
        'Legendary Champion Runes', 'Legendary Champion Weapons',
        'Legendary Guardian Belts', 'Legendary Guardian Weapons',
        'Legendary Hunter Weapons',
        'Legendary Lore-master Books', 'Legendary Lore-master Weapons',
        'Legendary Minstrel Songbooks', 'Legendary Minstrel Weapons',
        'Legendary Rune-keeper Rune-bags', 'Legendary Rune-keeper Weapons',
        'Legendary Warden Weapons',
    )),
    ('schmuck', {'de': 'Schmuck und Kleidung', 'en': 'Jewellery and clothing',
                 'fr': 'Bijoux et vêtements'}, (
        'Jewellery',
        'Gundabad Jewellery', 'Ithil Jewellery', 'Madáshi Jewellery',
        'Umbari Jewellery',
        'Luck-stone Equipment', 'Adornment', 'Clothing',
    )),
    ('schilde', {'de': 'Schilde, Umhänge und Taschen',
                 'en': 'Shields, cloaks and pockets',
                 'fr': 'Boucliers, capes et poches'}, (
        'Shields', 'Cloaks', 'Pocket', 'Quivers', 'Packs',
    )),
    ('verbrauch', {'de': 'Essen, Trinken, Tränke',
                   'en': 'Food, drink, potions',
                   'fr': 'Nourriture, boissons, potions'}, (
        'Battle Lore', 'Beverages', 'Consumables', 'Cooked Food', 'Dyes',
        'Fine Drinks',
        'Fortifying Food', 'Potions', 'Strong Drinks', 'Trail Food', 'Trailfood',
    )),
    ('material', {'de': 'Rohstoffe und Verarbeitung',
                  'en': 'Materials and processing',
                  'fr': 'Matériaux et transformation'}, (
        'Compost', 'Components', 'Crafting Expertise', 'Crafting Journals',
        'Crafting Lore', 'Crops', 'Examination', 'Extract', 'Fish Preparation',
        'Flowers', 'Gemstones',
        'Grains', 'Hops', 'Ingredients', 'Leather', 'Pipe-weed', 'Processing',
        'Refining', 'Research', 'Smelting', 'Textile', 'Vegetables', 'Wood',
    )),
    ('essenzen', {'de': 'Essenzen und Filigran',
                  'en': 'Essences and traceries',
                  'fr': 'Essences et joyaux'}, (
        'Essences', 'Wild Essences', 'Traceries', 'Crafted Traceries & Relics',
        'Luck-stone Components',
    )),
    ('klasse', {'de': 'Klassengegenstände', 'en': 'Class items',
                'fr': 'Objets de classe'}, (
        'Brawler Belt Buckles',
        'Burglar Signals', 'Burglar Tricks', 'Burglar Tools',
        'Captain Armaments', 'Captain Crests', 'Captain Pennants',
        'Captain Tonics',
        'Champion Horns', 'Champion Potions', 'Champion Runes',
        'Guardian/Warden Shield-spikes',
        'Hunter Books', 'Hunter Bow Chants', 'Hunter Potions', 'Hunter/Warden Oils',
        'Lore-master Books', 'Lore-master Brooch', 'Lore-master Parables',
        'Lore-master Pet Food', 'Lore-master Talismans',
        'Rune-keeper Chisels', 'Rune-keeper Parchments',
        'Rune-keeper Rune-satchels', 'Rune-keeper Rune-stones',
        'Rune-keeper Rune-tools',
        'Equipable Class Items', 'Guardian Tactics', 'Lore-master Amulets',
        'Mariner Satchels', 'Trap Parts',
        'Warden Battle Hymns', 'Warden Carvings',
        'Gundabad Carvings', 'Ithil Warden Carvings', 'Mûrai Carvings',
        'Umbari Carvings',
    )),
    ('werkzeug', {'de': 'Werkzeuge', 'en': 'Tools', 'fr': 'Outils'}, (
        'Crafting Tools', 'Tools', 'Luck-stone Tools',
        'Camp-fire', 'Repair Station', 'Fishing Rods',
    )),
    ('einrichtung', {'de': 'Haus und Einrichtung', 'en': 'Housing',
                     'fr': 'Logement'}, (
        'Housing Items', 'Decorations', 'Paints',
    )),
    ('musik', {'de': 'Musik und Instrumente', 'en': 'Music and instruments',
               'fr': 'Musique et instruments'}, (
        'Instruments', 'Minstrel Instruments', 'Minstrel Lute Strings',
        'Minstrel Sheet Music',
    )),
    ('gilde', {'de': 'Gilden und Feste', 'en': 'Guilds and festivals',
               'fr': 'Guildes et fêtes'}, (
        "Cook's Guild", "Jeweller's Guild", "Metalsmith's Guild",
        "Scholar's Guild", "Tailor's Guild", "Weaponsmith's Guild",
        "Woodworker's Guild",
        'Council of the North', 'Elves of Rivendell', 'Host of the West',
        'Men of Bree', 'Rangers of Esteldín', 'The Mathom Society',
        'The Wardens of Annúminas', "Thorin's Hall",
        'Event', 'Festival Items', 'Hobnanigans', 'Wedding Festival',
    )),
    ('sonstiges', {'de': 'Aufgaben und Sonstiges', 'en': 'Quests and other',
                   'fr': 'Quêtes et divers'}, (
        'Obsolete Item Conversion', 'Quest', 'Tokens',
    )),
)

REST = BUENDEL[-1][0]

# The client has one unqualified category next to the qualified ones of the same
# base type ("Leichte Rüstung" beside "Leichte Rüstung (Stufe 40)"). Inside the
# branch the base type already names it, so the leaf needs its own word.
OHNE_ZUSATZ = {'de': 'Allgemein', 'en': 'General', 'fr': 'Général'}

# A base type must belong to exactly one bucket; a second mention would make
# the filter ambiguous and is a mistake in the table above.
_BUENDEL_VON = {}
for _schluessel, _namen, _basen in BUENDEL:
    for _basis in _basen:
        if _basis in _BUENDEL_VON:
            raise ValueError('Grundart doppelt zugeordnet: %s' % _basis)
        _BUENDEL_VON[_basis] = _schluessel

# " - Level 100", " - Stufe 100", " - niveau 100" at the end of a name.
_STUFE_AM_ENDE = re.compile(r'\s*-\s*(?:Stufe|Level|niveau)\s*\d+\s*$', re.I)
# The client's qualifier in brackets, also without a space before it.
_KLAMMER_AM_ENDE = re.compile(r'\s*\(([^()]*)\)\s*$')


def buendel(englisch):
    """Bucket key for the English client name of a base type."""
    return _BUENDEL_VON.get((englisch or '').strip(), REST)


def anzeigename(eintrag, sprache):
    """The category name as the website shows it.

    The client export keeps HTML entities in one English category
    ("Crafted Traceries &amp; Relics"); the page shows the decoded name.
    """
    texte = eintrag or {}
    roh = texte.get(sprache) or texte.get('en') or ''
    return re.sub(r'\s+', ' ', html.unescape(roh)).strip()


def teile(name):
    """Base type and qualifier of a category name as the client shows it.

    >>> teile('Leichte Rüstung (Stufe 40)')
    ('Leichte Rüstung', 'Stufe 40')
    >>> teile('Leichte Rüstung - (Stufe 50)')
    ('Leichte Rüstung', 'Stufe 50')
    >>> teile('Legendäres Zaumzeug - Stufe 100')
    ('Legendäres Zaumzeug', 'Stufe 100')
    >>> teile('Leichte Rüstung')
    ('Leichte Rüstung', '')
    """
    roh = re.sub(r'\s+', ' ', html.unescape(name or '')).strip()
    treffer = _STUFE_AM_ENDE.search(roh)
    if treffer:
        return roh[:treffer.start()].strip().rstrip('-').strip(), \
            roh[treffer.start():].strip().lstrip('-').strip()
    treffer = _KLAMMER_AM_ENDE.search(roh)
    if treffer:
        return roh[:treffer.start()].strip().rstrip('-').strip(), \
            treffer.group(1).strip()
    return roh, ''


def basis(name):
    """The base type of a category name."""
    return teile(name)[0]


_UMLAUTE = str.maketrans({'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss',
                          'Ä': 'Ae', 'Ö': 'Oe', 'Ü': 'Ue'})


def kennung(text):
    """A URL-safe key for a localised base type name."""
    text = (text or '').translate(_UMLAUTE)
    text = unicodedata.normalize('NFKD', text)
    text = ''.join(zeichen for zeichen in text
                   if not unicodedata.combining(zeichen))
    text = re.sub(r'[^A-Za-z0-9]+', '-', text).strip('-').lower()
    return text or 'ohne'


def unbekannt(englische_namen):
    """Base types the table does not know yet, for the build report."""
    return sorted({(name or '').strip() for name in englische_namen
                   if (name or '').strip()
                   and (name or '').strip() not in _BUENDEL_VON})


def baum(kategorien, sprache):
    """Filter tree data for one language.

    `kategorien` is the export's category table (id → {de, en, fr}). Returns
    `(buendel, eintraege, hinweise)`: the buckets in filter order as
    `[key, label]`, one entry per localised category name as
    `[bucket, base key, base type, leaf label]`, and remarks for the build.

    The base key comes from the English base type, so the same branch means the
    same thing in every language. The label is the localised base type used by
    most categories: the French client writes "Armure légère (Niveau 20)" but
    "Armures légères (Guilde)" – one branch, not two.
    """
    gruppen, gesehen = {}, set()
    for eintrag in (kategorien or {}).values():
        englisch = (eintrag.get('en') or '').strip()
        name = anzeigename(eintrag, sprache)
        # The export holds the same category twice under two ids.
        if not name or name in gesehen:
            continue
        gesehen.add(name)
        gruppen.setdefault(basis(englisch), []).append((name, teile(name)))

    eintraege, hinweise = {}, []
    for englisch, liste in gruppen.items():
        labels = collections.Counter(base for _name, (base, _blatt) in liste)
        # The most used wording wins; on a tie the shorter one.
        label = max(labels, key=lambda text: (labels[text], -len(text), text))
        blatt_zaehler = collections.Counter(blatt or name for name, (_base, blatt) in liste)
        for name, (_base, blatt) in liste:
            if blatt:
                leaf = blatt
            elif len(liste) > 1:
                # The unqualified category of a base type that also has
                # qualified ones; the branch already names the base type.
                leaf = OHNE_ZUSATZ[sprache]
            else:
                leaf = label
            # Two categories of one base must stay distinguishable.
            if blatt_zaehler[blatt or name] > 1:
                leaf = name
                hinweise.append('%s: doppeltes Blatt, voller Name' % name)
            eintraege[name] = [buendel(englisch), kennung(englisch), label, leaf]
    buendel_liste = [[schluessel, namen.get(sprache) or namen['en']]
                     for schluessel, namen, _basen in BUENDEL]
    return buendel_liste, eintraege, hinweise
