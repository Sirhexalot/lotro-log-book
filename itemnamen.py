#!/usr/bin/env python3
"""Item names from the client export, made readable.

The DAT renderer leaves its markup in the strings: `${PLAYERNAME:…|…}` choices,
`\\q` quote markers, `[n]`/`[mp]` tags and occasional broken leftovers. The
game shows a clean name, so every place that displays an item name cleans it the
same way – the item catalogue, the search list and the PHP data build.

Nothing here guesses wording: a choice takes its first (male) variant, exactly
as the plugin and the reward builder already do, and the quote marks follow the
language's typography.
"""
import re

# Typographic pairs per language. German item strings are the only ones that
# still carry the `\q` marker, but the pair is defined for all three.
QUOTES = {
    'de': ('\u201e', '\u201c'),          # „ … “
    'en': ('\u201c', '\u201d'),          # “ … ”
    'fr': ('\u00ab\u00a0', '\u00a0\u00bb'),  # « … »
}

TAG = re.compile(r'\[[^\]]{0,8}\]')       # complete tag: [n], [mp], [n=ps], []
TAG_REST = re.compile(r'\[[A-Za-z]{0,4}$')  # export cut the closing bracket
CHOICE = re.compile(r'\$\{[A-Za-z_]+:([^}]*)\}')
PLACEHOLDER = re.compile(r'\$\{[A-Za-z_]+\}')


def sauberer_name(text, sprache='de'):
    """One item name without export markup.

    `${PLAYERNAME:a|b}` becomes `a`; where the export forgot a space around the
    placeholder it is added, because two words would otherwise run together
    ("Gantelets de tueurde trolls", "Grèvesdu Tueur de dragon").
    """
    text = str(text or '').replace('\u00a0', ' ')

    def wahl(treffer):
        gewaehlt = TAG.sub('', treffer.group(1).split('|')[0]).strip()
        davor = treffer.string[treffer.start() - 1:treffer.start()]
        danach = treffer.string[treffer.end():treffer.end() + 1]
        if gewaehlt and davor.isalpha() and gewaehlt[0].isalpha():
            gewaehlt = ' ' + gewaehlt
        if gewaehlt and danach.isalpha() and gewaehlt[-1].isalpha():
            gewaehlt += ' '
        return gewaehlt

    text = CHOICE.sub(wahl, text)
    text = PLACEHOLDER.sub('', text)
    text = TAG.sub('', text)
    text = TAG_REST.sub('', text)

    offen, zu = QUOTES.get(sprache, QUOTES['de'])
    aus = []
    naechste_offen = True
    i = 0
    while i < len(text):
        zeichen = text[i]
        # \q is the marker; a lone backslash before a letter is the same marker
        # with its q lost in the export ("\Essenz …", "\Stechen\q").
        if zeichen == '\\' and i + 1 < len(text) and text[i + 1].isalpha():
            folge = text[i + 1]
            if folge == 'n':                     # line break inside the string
                aus.append(' ')
                i += 2
                continue
            aus.append(offen if naechste_offen else zu)
            naechste_offen = not naechste_offen
            i += 2 if folge == 'q' else 1
            continue
        aus.append(zeichen)
        i += 1

    text = ''.join(aus)
    # Anything left in square brackets is broken markup, not part of the name.
    text = text.replace('[', '').replace(']', '')
    return re.sub(r'\s{2,}', ' ', text).strip()


def saubere_namen(namen):
    """A {language: name} map, cleaned in place for the given languages."""
    if not isinstance(namen, dict):
        return {}
    for sprache in list(namen):
        namen[sprache] = sauberer_name(namen.get(sprache), sprache)
    return namen
