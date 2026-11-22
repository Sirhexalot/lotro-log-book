"""Title kinds from the client, in the three languages of the website.

`titles.xml` carries a raw English category per title ("Crafting", "Kinship",
"Slayer Deed - Beast", …). The client does not translate that field, so the
filter needs words of our own. The slayer variants share one label: in the game
the genus belongs to the deed that awards the title, not to the title itself.

The keys stay the English client keys; only the display text is ours. Titles
without a listed kind get no filter entry and no line on the page — an unknown
kind is not shown as "other".
"""

KINDS = {
    'Deed': {'de': 'Tat', 'en': 'Deed', 'fr': 'Prouesse'},
    'Quest': {'de': 'Aufgabe', 'en': 'Quest', 'fr': 'Quête'},
    'Crafting': {'de': 'Handwerk', 'en': 'Crafting', 'fr': 'Artisanat'},
    'Event': {'de': 'Event', 'en': 'Event', 'fr': 'Événement'},
    'Social': {'de': 'Soziales', 'en': 'Social', 'fr': 'Social'},
    'Kinship': {'de': 'Sippe', 'en': 'Kinship', 'fr': 'Confrérie'},
    'Hobby': {'de': 'Hobby', 'en': 'Hobby', 'fr': 'Loisir'},
    'Skirmish': {'de': 'Scharmützel', 'en': 'Skirmish', 'fr': 'Escarmouche'},
    'Heritage': {'de': 'Herkunft', 'en': 'Heritage', 'fr': 'Héritage'},
    'Slayer Deed': {'de': 'Bezwinger', 'en': 'Slayer', 'fr': 'Vainqueur'},
}

SPRACHEN = ('de', 'en', 'fr')


def kind_key(category: str) -> str:
    """The filter key for a client category; '' when it has no label."""
    category = (category or '').strip()
    if category.startswith('Slayer Deed'):
        return 'Slayer Deed'
    return category if category in KINDS else ''


def label(category: str, lang: str) -> str:
    key = kind_key(category)
    return KINDS.get(key, {}).get(lang, '') if key else ''
