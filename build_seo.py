"""Static SEO foundation; entity pages and query-language variants follow later."""
from html import escape
from pathlib import Path
import re
from build_sitemaps import write as write_sitemap

BASE = 'https://llb.sirhexalot.de'
PAGES = {
    'index.html': ('Aufgaben und Karten', 'Finde Aufgaben und Taten in LOTRO nach Landschaft und Gebiet. Sieh Auftraggeber auf der Karte und blende Ziele nur auf Wunsch ein.'),
    'start.html': ('Dein Begleiter durch Mittelerde', 'Finde deine nächste Aufgabe, vollende Taten und entdecke Ausrüstung und Rezepte für deine Abenteuer in Der Herr der Ringe Online. Mit deinem Spielstand.'),
    'start-en.html': ('Your companion through Middle-earth', 'Find your next quest, finish deeds and discover gear and recipes for your adventures in The Lord of the Rings Online. Keep track with your own progress.'),
    'start-fr.html': ('Votre compagnon en Terre du Milieu', 'Trouvez votre prochaine quête, accomplissez des prouesses et découvrez équipements et recettes pour vos aventures dans LOTRO. Suivez votre progression.'),
    'spielstand.html': ('Spielstand importieren', 'Importiere deinen LOTRO-Companion-Spielstand und finde fehlende Aufgaben, Taten und Rezepte. Deine Charakterdaten bleiben in deinem Browser.'),
    'companion.html': ('LOTRO Companion', 'So liest du deinen Charakter mit LOTRO Companion aus und übernimmst den Fortschritt in LOTRO Log Book.'),
    'plugin.html': ('Plugin fürs Spiel', 'Nimm dein Logbuch mit ins Spiel: Magic Quest Log zeigt Aufgaben, Taten und deinen Fortschritt direkt in LOTRO. Mit Anleitung zum Installieren.'),
    'reise.html': ('Reise', 'Plane deinen Weg durch Mittelerde. Finde Stallmeister und Verbindungen mit Preisen und Mindeststufen, Schnellreise und Reisefertigkeiten deiner Klasse.'),
    'ruf.html': ('Ruf und Fraktionen', 'Finde LOTRO-Fraktionen und Aufgaben mit Rufbelohnungen. Mit importiertem Spielstand siehst du deinen eigenen Ruf-Fortschritt.'),
    'handwerk.html': ('Handwerk und Rezepte', 'Finde Rezepte nach Beruf und Handwerksstufe. Schau nach, was du herstellen kannst und welche Zutaten du brauchst.'),
    'gegenstaende.html': ('Gegenstandssuche', 'Finde Waffen, Rüstungen und andere Gegenstände nach Name, Stufe und Seltenheit.'),
    'belohnungen.html': ('Belohnungen', 'Welcher Gegenstand fehlt dir noch? Finde die Aufgaben und Taten, die ihn in LOTRO als Belohnung vergeben – mit Stufe und Fundort.'),
    'gegenstand.html': ('Gegenstand', 'Schlage die Werte von LOTRO-Gegenständen nach und finde heraus, mit welchen Aufgaben und Taten du sie bekommst.'),
    'suche.html': ('Suche', 'Durchsuche Aufgaben, Taten, Gegenstände und Rezepte in LOTRO Log Book.'),
    'impressum.html': ('Impressum', 'Impressum und Kontakt für LOTRO Log Book.'),
    'datenschutz.html': ('Datenschutz', 'Informationen zum Datenschutz und zur Verarbeitung von Daten in LOTRO Log Book.'),
}

GAME_TERM = {'de': 'HdRO', 'en': 'LOTRO', 'fr': 'SdAO'}

APP_TRANSLATIONS = {
    'en': {
        'spielstand.html': ('Import progress', 'Import your characters from LOTRO Companion to track quests, deeds and recipes. Your characters stay in your browser.'),
        'companion.html': ('LOTRO Companion', 'Use LOTRO Companion to export your characters and bring their progress into LOTRO Log Book.'),
        'plugin.html': ('In-game plugin', 'Install Magic Quest Log to see quests, deeds and your progress while you play LOTRO.'),
        'reise.html': ('Travel planner', 'Plan your ride through Middle-earth. Find stable-masters, swift travel, fares and class travel skills.'),
        'ruf.html': ('Reputation', 'Find quests and deeds that earn reputation. Import your progress to see your standing with each faction.'),
        'handwerk.html': ('Crafting and recipes', 'Find recipes by profession and crafting tier. See what you can make and which ingredients you need.'),
        'gegenstaende.html': ('Item search', 'Find weapons, armour and other items by name, level and rarity.'),
        'belohnungen.html': ('Rewards', 'Find the quests and deeds that reward the gear you’re looking for.'),
        'suche.html': ('Search', 'Look up LOTRO quests, deeds, items and recipes in one search.'),
        'impressum.html': ('Legal notice', 'Legal notice and contact details for LOTRO Log Book.'),
        'datenschutz.html': ('Privacy policy', 'How LOTRO Log Book handles your data.'),
    },
    'fr': {
        'spielstand.html': ('Importer la progression', 'Importez vos personnages depuis LOTRO Companion pour suivre quêtes, prouesses et recettes. Vos personnages restent dans votre navigateur.'),
        'companion.html': ('LOTRO Companion', 'Exportez vos personnages avec LOTRO Companion pour retrouver leur progression dans LOTRO Log Book.'),
        'plugin.html': ('Plugin en jeu', 'Installez Magic Quest Log pour retrouver vos quêtes, vos prouesses et votre progression en jeu.'),
        'reise.html': ('Planifier un voyage', 'Préparez votre trajet en Terre du Milieu : maîtres d’écurie, voyages rapides, tarifs et compétences de voyage.'),
        'ruf.html': ('Réputation', 'Trouvez les quêtes et les prouesses qui rapportent de la réputation. Importez votre progression pour retrouver votre rang auprès de chaque faction.'),
        'handwerk.html': ('Artisanat et recettes', 'Trouvez des recettes par métier et par palier. Voyez ce que vous pouvez fabriquer et de quels ingrédients vous avez besoin.'),
        'gegenstaende.html': ('Recherche d’objets', 'Trouvez des armes, des armures et d’autres objets par nom, niveau et rareté.'),
        'belohnungen.html': ('Récompenses', 'Retrouvez les quêtes et les prouesses qui donnent l’équipement que vous cherchez.'),
        'suche.html': ('Recherche', 'Retrouvez les quêtes, les prouesses, les objets et les recettes de SdAO.'),
        'impressum.html': ('Mentions légales', 'Mentions légales et coordonnées de LOTRO Log Book.'),
        'datenschutz.html': ('Confidentialité', 'Comment LOTRO Log Book traite vos données.'),
    },
}


def localized_page(name, title, description, lang):
    """Use the abbreviation players search for in each language."""
    if name in APP_TRANSLATIONS.get(lang, {}):
        return APP_TRANSLATIONS[lang][name]
    term = GAME_TERM[lang]
    pattern = r'\bLOTRO\b(?! (?:Log Book|Companion))'
    title = re.sub(pattern, term, title)
    description = re.sub(pattern, term, description)
    if name == 'index.html':
        title = {'de': 'HdRO Aufgaben und Karten',
                 'en': 'LOTRO quests and maps',
                 'fr': 'Quêtes et cartes de SdAO'}[lang]
    elif name == 'start.html':
        title = 'Dein HdRO-Begleiter durch Mittelerde'
    elif name == 'start-en.html':
        title = 'Your LOTRO companion through Middle-earth'
    elif name == 'start-fr.html':
        title = 'Votre compagnon SdAO en Terre du Milieu'
    return title, description


def preview_images(ziel):
    """Use our existing map illustration, not a fabricated game screenshot."""
    from PIL import Image, ImageDraw, ImageFont, ImageOps
    fonts = [Path('/System/Library/Fonts/Supplemental'), Path('/usr/share/fonts/truetype/dejavu')]

    def font(size, serif=False):
        names = ('Georgia.ttf', 'DejaVuSerif.ttf') if serif else ('Arial.ttf', 'DejaVuSans.ttf')
        for folder in fonts:
            for name in names:
                if (folder / name).exists():
                    return ImageFont.truetype(str(folder / name), size)
        return ImageFont.load_default(size=size)

    subtitles = {'de': 'Aufgaben, Taten und dein Fortschritt in Mittelerde',
                 'en': 'Quests, deeds and your progress in Middle-earth',
                 'fr': 'Quêtes, prouesses et progression en Terre du Milieu'}
    for lang, subtitle in subtitles.items():
        source = ziel / 'bild' / ('start.jpg' if lang == 'de' else 'start-' + lang + '.jpg')
        image = ImageOps.fit(Image.open(source).convert('RGB'), (1200, 630)).convert('RGBA')
        overlay = Image.new('RGBA', image.size)
        draw = ImageDraw.Draw(overlay)
        for y in range(630):
            alpha = int(30 + 215 * max(0, min(1, (y - 180) / 350)))
            draw.line((0, y, 1200, y), fill=(15, 22, 20, alpha))
        image = Image.alpha_composite(image, overlay)
        draw = ImageDraw.Draw(image)
        draw.rectangle((52, 355, 112, 360), fill='#d9b965')
        draw.text((48, 382), 'LOTRO Log Book', font=font(67, True), fill='#f4e8c8')
        draw.text((52, 477), subtitle, font=font(30), fill='#f4e8c8')
        draw.text((52, 563), 'llb.sirhexalot.de', font=font(24), fill='#d9b965')
        draw.text((947, 563), 'DE / EN / FR', font=font(22), fill='#d9b965')
        image.convert('RGB').save(ziel / 'bild' / ('vorschau-' + lang + '.jpg'), quality=90, optimize=True)


def build(ziel):
    ziel = Path(ziel)
    preview_images(ziel)
    for name, (title, description) in PAGES.items():
        path = ziel / name
        text = path.read_text(encoding='utf-8')
        lang = 'en' if name == 'start-en.html' else 'fr' if name == 'start-fr.html' else 'de'
        title, description = localized_page(name, title, description, lang)
        url = BASE + '/' + name
        text = re.sub(r'<meta\s+name="description"[^>]*>\s*', '', text)
        image = BASE + '/bild/vorschau-' + lang + '.jpg'
        tags = {'description': description, 'twitter:card': 'summary_large_image'}
        lines = ['<meta name="%s" content="%s">' % (k, escape(v, quote=True)) for k, v in tags.items()]
        og = {'og:type': 'website', 'og:site_name': 'LOTRO Log Book',
              'og:title': title + ' – LOTRO Log Book', 'og:description': description,
              'og:url': url, 'og:locale': {'de': 'de_DE', 'en': 'en_US', 'fr': 'fr_FR'}[lang],
              'og:image': image, 'og:image:type': 'image/jpeg',
              'og:image:width': '1200', 'og:image:height': '630',
              'og:image:alt': {'de': 'LOTRO Log Book – Breeland-Karte mit Aufgabenmarkierungen',
                               'en': 'LOTRO Log Book – Bree-land map with quest markers',
                               'fr': 'LOTRO Log Book – carte du Pays de Bree et repères de quêtes'}[lang]}
        lines += ['<meta property="%s" content="%s">' % (k, escape(v, quote=True)) for k, v in og.items()]
        lines += ['<meta name="twitter:image" content="%s">' % image,
                  '<meta name="twitter:image:alt" content="%s">' % escape(og['og:image:alt'], quote=True)]
        # Do not collapse entity IDs, deed variants or query languages onto the
        # German empty shell. Their canonical URLs need dedicated HTML later.
        if name.startswith('start') or name in ('impressum.html', 'datenschutz.html', 'reise.html'):
            lines.append('<link rel="canonical" href="%s">' % url)
        if name.startswith('start'):
            for language, page in [('de', 'start.html'), ('en', 'start-en.html'), ('fr', 'start-fr.html'), ('x-default', 'start.html')]:
                lines.append('<link rel="alternate" hreflang="%s" href="%s/%s">' % (language, BASE, page))
        text = text.replace('</head>', '\n'.join(lines) + '\n</head>', 1)
        path.write_text(text, encoding='utf-8')
    # No empty entity shells, searches or invented lastmod dates.
    write_sitemap(ziel, 'sitemap-seiten.xml', ['/' + name for name in PAGES if name not in ('gegenstand.html', 'suche.html')])
    write_sitemap(ziel, 'sitemap.xml', ['/sitemap-seiten.xml'], index=True)
    (ziel / 'robots.txt').write_text('User-agent: *\nAllow: /\n\nSitemap: %s/sitemap.xml\n' % BASE, encoding='utf-8')
