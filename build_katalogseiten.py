"""Crawlable entity pages from the shipped catalogue, without changing app URLs."""
from collections import defaultdict
import threading
import time
from html import escape
import hashlib
import json
from pathlib import Path
import re
from urllib.parse import urlencode
from build_sitemaps import add_sections

BASE = 'https://llb.sirhexalot.de'
PILOT = 268441569  # The Old Forest, a game map ID shared by all languages.

# Which menu family an entity belongs to (see README, navigation).
# Item level (l) is not one thing in the data: for consumables it holds a
# duration or a count. Quality is the reliable axis.
GUETE = {'COMMON': 1, 'UNCOMMON': 2, 'RARE': 3, 'INCOMPARABLE': 4, 'LEGENDARY': 5}
GUETE_SLUG = {1: {'de': 'gewoehnlich', 'en': 'common', 'fr': 'commun'},
              2: {'de': 'ungewoehnlich', 'en': 'uncommon', 'fr': 'peu-commun'},
              3: {'de': 'selten', 'en': 'rare', 'fr': 'rare'},
              4: {'de': 'unvergleichlich', 'en': 'incomparable', 'fr': 'incomparable'},
              5: {'de': 'legendaer', 'en': 'legendary', 'fr': 'legendaire'}}
ARTEN = {'ARMOUR': {'de': 'ruestung', 'en': 'armour', 'fr': 'armure'},
         'WEAPON': {'de': 'waffe', 'en': 'weapon', 'fr': 'arme'},
         'ITEM': {'de': 'sonstiges', 'en': 'other', 'fr': 'divers'},
         '': {'de': 'ohne-art', 'en': 'no-type', 'fr': 'sans-type'}}
FAMILIE = {'q': 'welt', 'd': 'welt', 'area': 'welt', 'region': 'welt', 'catalog': 'welt',
           'l': 'welt',
           'i': 'gegenstaende', 'recipe': 'gegenstaende', 'p': 'gegenstaende',
           'title': 'erfolge', 'virtue': 'erfolge', 'f': 'erfolge'}
LANGS = ('de', 'en', 'fr')
PAGE_SIZE = 200
WORDS = {
    'de': dict(q='aufgabe', d='tat', i='gegenstand', area='gebiet', region='region', catalog='katalog',
        qlabel='Aufgabe', dlabel='Tat', ilabel='Gegenstand', qlist='Aufgaben', dlist='Taten',
        ilist='Gegenstände', arealist='Gebiete', regionlist='Regionen', cataloglabel='Katalog', map='Auf der Karte öffnen',
        area_map='Gebiet auf der Karte öffnen', giver='Auftraggeber', level='Stufe',
        location='Standort', rewards='Belohnungen', choice='Zur Auswahl', title='Titel',
        f='fraktion', flabel='Fraktion', flist='Fraktionen', tiers='Stufen',
        rep_sources='Wodurch du Ruf bekommst', no_rep_sources='Rufquellen sind für diese Fraktion nicht bekannt.',
        no_landmark_quests='Zu dieser Landmarke ist keine Aufgabe belegt.',
        l='landmarke', llabel='Landmarke', llist='Landmarken', landmark_here='Aufgaben hier',
        virtue='Tugend', trait='Trait / Fertigkeit', emote='Emote', requirements='Voraussetzungen',
        one='Mindestens eine dieser Aufgaben', extra='Prüfe im Spiel, ob du weitere Bedingungen erfüllst, etwa Klasse, Volk oder Ruf.',
        objectives='Ziele und Schritte einblenden', description='Beschreibung', sources='Quellen',
        item_open='In der Belohnungsübersicht öffnen', armour='Rüstung', damage='Schaden',
        speed='Tempo', bound='Gebunden', free='Nicht gebunden', daily='Täglich', repeat='Wiederholbar',
        points='LOTRO-Punkte', home='Startseite', search='Suche', import_='Importieren',
        plugin='Plugin fürs Spiel', reputation='Ruf', crafting='Handwerk', privacy='Datenschutz',
        legal='Impressum', menu='Menü öffnen', none='Ohne Spielstand',
        route='Wie komme ich hierhin?',
        pilot='Erkunde den Alten Wald. Weitere Landschaften findest du auf der Karte.',
        no_position='Wo du diese Aufgabe annehmen kannst, ist noch nicht bekannt.',
                crafted_by='Herstellbar durch', used_in='Wofür', used_count='In %s Rezepten verlangt.',
        occurrences='Vorkommen', slot='Ausstattung', category='Art', no_source='Wo du das bekommst, ist noch nicht bekannt.',
        item_lonely='Wo du diesen Gegenstand bekommst und wofür du ihn brauchst, ist noch nicht bekannt.', more_in_list='… und %s weitere.',
        item_search='Suchen und filtern nach Name, Kategorie und Seltenheit',
        min_level='Benötigt Stufe', item_level='Gegenstandsstufe',
        browse='Weiterstöbern', browse_link='Gleicher Platz, gleiche Art',
        browse_text='Dieselbe Ausrüstungsart und derselbe Platz, mit allen Filtern der Suche.',
chain='Aufgabenfolge', previous='Davor', next='Danach', back='Zum Gebiet',
        item_intro='Schlage Werte nach und finde heraus, wo du diesen Gegenstand bekommst.',
        status_done='Erledigt', status_unknown='Nicht als erledigt importiert', status_running='In Arbeit'),
    'en': dict(q='quest', d='deed', i='item', area='area', region='region', catalog='catalogue',
        qlabel='Quest', dlabel='Deed', ilabel='Item', qlist='Quests', dlist='Deeds',
        ilist='Items', arealist='Areas', regionlist='Regions', cataloglabel='Catalogue', map='Open on the map',
        area_map='Open area on the map', giver='Quest giver', level='Level',
        location='Location', rewards='Rewards', choice='Choose one', title='Title',
        f='faction', flabel='Faction', flist='Factions', tiers='Tiers',
        rep_sources='How to earn reputation', no_rep_sources='No reputation sources are known for this faction.',
        no_landmark_quests='No quest is recorded for this landmark.',
        l='landmark', llabel='Landmark', llist='Landmarks', landmark_here='Quests here',
        virtue='Virtue', trait='Trait / skill', emote='Emote', requirements='Requirements',
        one='At least one of these quests', extra='Check in game for other requirements, such as class, race or reputation.',
        objectives='Show objectives and steps', description='Description', sources='Sources',
        item_open='Open in the rewards index', armour='Armour', damage='Damage',
        speed='Speed', bound='Bound', free='Not bound', daily='Daily', repeat='Repeatable',
        points='LOTRO Points', home='Home', search='Search', import_='Import',
        plugin='In-game plugin', reputation='Reputation', crafting='Crafting', privacy='Privacy',
        legal='Legal notice', menu='Open menu', none='Without progress',
        route='How do I get here?',
        pilot='Explore the Old Forest. Find more lands on the map.',
        no_position='Where to pick up this quest is not yet known.',
                crafted_by='Crafted by', used_in='Used for', used_count='Required by %s recipes.',
        occurrences='Resources', slot='Slot', category='Type', no_source='Where to get this is not yet known.',
        item_lonely='Where to get this item and what it is used for are not yet known.', more_in_list='… and %s more.',
        item_search='Search and filter by name, category and quality',
        min_level='Requires level', item_level='Item level',
        browse='Browse on', browse_link='Same slot, same type',
        browse_text='The same armour type and slot, with every filter of the search.',
chain='Quest chain', previous='Previous', next='Next', back='Back to area',
        item_intro='Look up stats and find out where to get this item.',
        status_done='Completed', status_unknown='Not imported as completed', status_running='In progress'),
    'fr': dict(q='quete', d='prouesse', i='objet', area='zone', region='region', catalog='catalogue',
        qlabel='Quête', dlabel='Prouesse', ilabel='Objet', qlist='Quêtes', dlist='Prouesses',
        ilist='Objets', arealist='Zones', regionlist='Régions', cataloglabel='Catalogue', map='Voir sur la carte',
        area_map='Voir la zone sur la carte', giver='Donneur de quête', level='Niveau',
        location='Position', rewards='Récompenses', choice='Au choix', title='Titre',
        f='faction', flabel='Faction', flist='Factions', tiers='Paliers',
        rep_sources='Comment gagner de la réputation', no_rep_sources='Aucune source de réputation n’est connue pour cette faction.',
        no_landmark_quests='Aucune quête n’est attestée pour ce site.',
        l='site', llabel='Site', llist='Sites', landmark_here='Quêtes ici',
        virtue='Vertu', trait='Trait / compétence', emote='Emote', requirements='Conditions',
        one='Au moins une de ces quêtes', extra='Vérifiez en jeu les autres conditions, comme la classe, la race ou la réputation.',
        objectives='Afficher les objectifs et les étapes', description='Description', sources='Sources',
        item_open='Voir dans l’index des récompenses', armour='Armure', damage='Dégâts',
        speed='Vitesse', bound='Lié', free='Non lié', daily='Quotidienne', repeat='Répétable',
        points='Points LOTRO', home='Accueil', search='Recherche', import_='Importer',
        plugin='Plugin en jeu', reputation='Réputation', crafting='Artisanat', privacy='Confidentialité',
        legal='Mentions légales', menu='Ouvrir le menu', none='Sans progression',
        route='Comment y aller ?',
        pilot='Explorez la Vieille Forêt. Retrouvez les autres régions sur la carte.',
        no_position='Le lieu où prendre cette quête n’est pas encore connu.',
                crafted_by='Fabriqué par', used_in='Utilisé pour', used_count='Demandé dans %s recettes.',
        occurrences='Ressources', slot='Emplacement', category='Type', no_source='On ne sait pas encore où l’obtenir.',
        item_lonely='On ne sait pas encore où obtenir cet objet ni à quoi il sert.', more_in_list='… et %s autres.',
        item_search='Rechercher et filtrer par nom, catégorie et rareté',
        min_level='Niveau requis', item_level='Niveau d’objet',
        browse='Continuer', browse_link='Même emplacement, même type',
        browse_text='Le même type d’armure et le même emplacement, avec tous les filtres de la recherche.',
chain='Suite de quêtes', previous='Précédente', next='Suivante', back='Retour à la zone',
        item_intro='Consultez les caractéristiques et découvrez où obtenir cet objet.',
        status_done='Terminé', status_unknown='Non importé comme terminé', status_running='En cours'),
}

EXTRA = {
    'de': dict(menue_karte='Aufgaben', menue_taten='Taten', menue_reise='Reise', menue_gegenstaende='Gegenstände', menue_handwerk='Handwerk', menue_berufe='Berufe', menue_titel='Titel', menue_tugenden='Tugenden', menue_ruf='Ruf', menue_fortschritt='Fortschritt', menue_plugin='Plugin fürs Spiel',
        menue_landmarken='Landmarken', menue_fraktionen='Fraktionen', d_landmarken='Sehenswürdigkeiten mit ihren Aufgaben', d_fraktionen='Ruf, Stufen und Quellen',
        title='titel', virtue='tugend', titlelist='Titel', virtuelist='Tugenden', titlelabel='Titel', virtuelabel='Tugend',
        gendered='Die Form richtet sich nach dem Geschlecht des Charakters.', ranked='Der vollständige Titel enthält Rang und Namen des Charakters.', availability='Der Katalog belegt die Quelle, nicht ob der Titel heute noch erreichbar ist.',
        menue_meine_berufe='Meine Berufe', menue_mein_ruf='Mein Ruf', menue_belohnungen='Belohnungen', familie_welt='Welt', familie_gegenstaende='Gegenstände', familie_erfolge='Erfolge', familie_charakter='Charakter',
        p='beruf', recipe='rezept', craft='handwerk', plist='Berufe', recipelist='Rezepte', craftlist='Handwerk',
        plabel='Beruf', recipelabel='Rezept', tier='Handwerksstufe', category='Kategorie', ingredients='Zutaten',
        optional='Optionale Zutaten', critical='Kritischer Erfolg', chance='Kritische Chance', time='Herstellungszeit',
        overview='Wohin zieht es dich als Nächstes? Stöbere nach Aufgaben und Taten oder finde etwas für deine Ausrüstung und dein Handwerk.',
        excerpt='Hier steht ein Auszug. Die vollständige Gebietsauswahl findest du auf der Karte.',
        page='Seite', prevpage='Vorherige Seite', nextpage='Nächste Seite', known='Bekannt', foreign='Fremder Beruf',
        recipe_unknown='Rezept-Lernstand nicht importiert', recipe_missing='Rezept nicht gelernt',
        binding='Bindung', area_label='Gebiet',
        place='Ort', required_by='Wird vorausgesetzt von', prefix='Voraussetzung für',
        sure='Sicher', no_next='keine Folgeaufgabe bekannt', same_giver_label='Gleicher Auftraggeber',
        kat_armour='Rüstung', kat_weapon='Waffe', kat_item='Sonstiges', qualityslug='qualitaet', filterlabel='Einschränken',
        quality='Qualität', guete_1='gewöhnlich', guete_2='ungewöhnlich', guete_3='selten',
        d_karte='Aufgaben finden, Geschichten folgen', d_taten='Entdecken, bezwingen, Taten vollenden',
        d_reise='Dein Weg durch Mittelerde', d_gegenstand='Werte und Fundorte nachschlagen',
        d_handwerk='Rezepte, Zutaten und Rohstoffe', d_beruf='Vom Lehrling zum Meister',
        d_titel='Wie du dir einen Namen machst', d_tugend='Was deine Tugenden stärkt',
        d_ruf='Bei wem du Ansehen gewinnst', d_fortschritt='Deine Abenteuer im Überblick',
        d_meine_berufe='Dein Lernstand', d_mein_ruf='Dein Ruf',
        guete_4='unvergleichlich', guete_5='legendär',
        same_place_label='Am selben Ort', deeds_none='keine zugehörige Tat bekannt',
        occurrences='Vorkommen im Gebiet', steps_label='Schritte',
        excludes='Schließt sich aus mit', more_from='Weitere Aufgaben von %s', points_count='%s Zielpunkte',
        deed_type='Tat-Art', wofuer='Wofür', more_deeds='Weitere Taten in %s', same_kind='Gleiche Art',
        values='Werte', variants='Ausprägungen', variants_count='%s Ausprägungen',
        variant_note='Diese Gegenstände heißen gleich, unterscheiden sich aber in Stufe und Werten. Achte darauf, welche Ausführung du suchst.',
        scalable='Skaliert mit der Stufe', damage_type='Schadensart', bound_acquire='Beim Erhalt gebunden',
        bound_equip='Beim Ausrüsten gebunden', set_members='Set-Teile', set_bonus='Set-Bonus',
        required_class='Nur für Klasse', essence_slots='Essenz-Slots', unique='Einzigartig',
        vendor='Bei Händlern erhältlich',
        steps_count='%s Schritte', steps_one='1 Schritt', rewards_count='%s Belohnungen',
        rewards_one='1 Belohnung', maps_count='%s Karten',
        deed_no_position='Für diese Tat ist kein Zielort bekannt.'),
    'en': dict(menue_karte='Quests', menue_taten='Deeds', menue_reise='Travel', menue_gegenstaende='Items', menue_handwerk='Crafting', menue_berufe='Professions', menue_titel='Titles', menue_tugenden='Virtues', menue_ruf='Reputation', menue_fortschritt='Progress', menue_plugin='In-game plugin',
        menue_landmarken='Landmarks', menue_fraktionen='Factions', d_landmarken='Sights and the quests there', d_fraktionen='Reputation, tiers and sources',
        title='title', virtue='virtue', titlelist='Titles', virtuelist='Virtues', titlelabel='Title', virtuelabel='Virtue',
        gendered='The wording follows the gender of the character.', ranked='The full title also contains the rank and name of the character.', availability='The catalogue records the source, not whether the title is still obtainable today.',
        menue_meine_berufe='My professions', menue_mein_ruf='My reputation', menue_belohnungen='Rewards', familie_welt='World', familie_gegenstaende='Items', familie_erfolge='Rewards', familie_charakter='Character',
        p='profession', recipe='recipe', craft='crafting', plist='Professions', recipelist='Recipes', craftlist='Crafting',
        plabel='Profession', recipelabel='Recipe', tier='Crafting tier', category='Category', ingredients='Ingredients',
        optional='Optional ingredients', critical='Critical success', chance='Critical chance', time='Crafting time',
        overview='Where will you head next? Browse quests and deeds, or find something for your gear and crafting.',
        excerpt='This is an excerpt. Open the map for the full area selection.',
        page='Page', prevpage='Previous page', nextpage='Next page', known='Known', foreign='Other profession',
        recipe_unknown='Recipe knowledge not imported', recipe_missing='Recipe not learned',
        binding='Binding', area_label='Area',
        place='Location', required_by='Required by', prefix='Required for',
        sure='Guaranteed', no_next='no follow-up quest known', same_giver_label='Same quest giver',
        kat_armour='Armour', kat_weapon='Weapon', kat_item='Other', qualityslug='quality', filterlabel='Narrow down',
        quality='Quality', guete_1='common', guete_2='uncommon', guete_3='rare',
        d_karte='Find quests, follow stories', d_taten='Explore, slay and complete deeds',
        d_reise='Your way across Middle-earth', d_gegenstand='Look up stats and where to find items',
        d_handwerk='Recipes, ingredients and resources', d_beruf='From apprentice to master',
        d_titel='Make a name for yourself', d_tugend='Find what strengthens your virtues',
        d_ruf='Earn the trust of the factions', d_fortschritt='Keep track of your adventures',
        d_meine_berufe='Your own skill', d_mein_ruf='Your own standing',
        guete_4='incomparable', guete_5='legendary',
        same_place_label='At the same spot', deeds_none='no related deed known',
        occurrences='Resources in the area', steps_label='Steps',
        excludes='Excludes', more_from='More quests from %s', points_count='%s objective points',
        deed_type='Deed type', wofuer='Rewards', more_deeds='More deeds in %s', same_kind='Same type',
        values='Values', variants='Variants', variants_count='%s variants',
        variant_note='These items share a name but differ in level and stats. Check which version you are looking for.',
        scalable='Scales with level', damage_type='Damage type', bound_acquire='Bound on acquire',
        bound_equip='Bound on equip', set_members='Set pieces', set_bonus='Set bonus',
        required_class='Class only', essence_slots='Essence slots', unique='Unique',
        vendor='Available from vendors',
        steps_count='%s steps', steps_one='1 step', rewards_count='%s rewards',
        rewards_one='1 reward', maps_count='%s maps',
        deed_no_position='No objective location is known for this deed.'),
    'fr': dict(menue_karte='Quêtes', menue_taten='Prouesses', menue_reise='Voyage', menue_gegenstaende='Objets', menue_handwerk='Artisanat', menue_berufe='Métiers', menue_titel='Titres', menue_tugenden='Vertus', menue_ruf='Réputation', menue_fortschritt='Progression', menue_plugin='Plugin en jeu',
        menue_landmarken='Sites', menue_fraktionen='Factions', d_landmarken='Sites et leurs quêtes', d_fraktionen='Réputation, paliers et sources',
        title='titre', virtue='vertu', titlelist='Titres', virtuelist='Vertus', titlelabel='Titre', virtuelabel='Vertu',
        gendered='La forme dépend du genre du personnage.', ranked='Le titre complet contient aussi le rang et le nom du personnage.', availability='Le catalogue atteste la source, pas si le titre est encore obtenable aujourd’hui.',
        menue_meine_berufe='Mes métiers', menue_mein_ruf='Ma réputation', menue_belohnungen='Récompenses', familie_welt='Monde', familie_gegenstaende='Objets', familie_erfolge='Récompenses', familie_charakter='Personnage',
        p='metier', recipe='recette', craft='artisanat', plist='Métiers', recipelist='Recettes', craftlist='Artisanat',
        plabel='Métier', recipelabel='Recette', tier='Niveau d’artisanat', category='Catégorie', ingredients='Ingrédients',
        optional='Ingrédients facultatifs', critical='Réussite critique', chance='Chance de critique', time='Temps de fabrication',
        overview='Quelle sera votre prochaine étape ? Parcourez les quêtes et prouesses, ou trouvez de quoi vous équiper et exercer vos métiers.',
        excerpt='Ceci est un extrait. Ouvrez la carte pour la sélection complète de la zone.',
        page='Page', prevpage='Page précédente', nextpage='Page suivante', known='Connu', foreign='Autre métier',
        recipe_unknown='Recettes connues non importées', recipe_missing='Recette non apprise',
        binding='Lien', area_label='Zone',
        place='Lieu', required_by='Requis par', prefix='Requis pour',
        sure='Assuré', no_next='aucune quête suivante connue', same_giver_label='Même donneur de quête',
        kat_armour='Armure', kat_weapon='Arme', kat_item='Divers', qualityslug='qualite', filterlabel='Affiner',
        quality='Qualité', guete_1='commun', guete_2='peu commun', guete_3='rare',
        d_karte='Trouver des quêtes, suivre les histoires', d_taten='Explorer, vaincre, accomplir des prouesses',
        d_reise='Votre chemin en Terre du Milieu', d_gegenstand='Caractéristiques et lieux où trouver les objets',
        d_handwerk='Recettes, ingrédients et ressources', d_beruf='De l’apprentissage à la maîtrise',
        d_titel='Comment vous faire un nom', d_tugend='Ce qui renforce vos vertus',
        d_ruf='Gagner la confiance des factions', d_fortschritt='Vos aventures en un coup d’œil',
        d_meine_berufe='Vos apprentissages', d_mein_ruf='Votre réputation',
        guete_4='incomparable', guete_5='légendaire',
        same_place_label='Au même endroit', deeds_none='aucune prouesse associée connue',
        occurrences='Ressources de la zone', steps_label='Étapes',
        excludes='Exclut', more_from='Autres quêtes de %s', points_count='%s points d’objectif',
        deed_type='Type de prouesse', wofuer='Récompenses', more_deeds='Autres prouesses en %s', same_kind='Même type',
        values='Valeurs', variants='Variantes', variants_count='%s variantes',
        variant_note='Ces objets portent le même nom, mais leurs niveaux et caractéristiques diffèrent. Vérifiez quelle version vous recherchez.',
        scalable='Évolue avec le niveau', damage_type='Type de dégâts', bound_acquire='Lié à l’obtention',
        bound_equip='Lié à l’équipement', set_members='Pièces d’ensemble', set_bonus='Bonus d’ensemble',
        required_class='Réservé à la classe', essence_slots='Emplacements d’essence', unique='Unique',
        vendor='Disponible chez les marchands',
        steps_count='%s étapes', steps_one='1 étape', rewards_count='%s récompenses',
        rewards_one='1 récompense', maps_count='%s cartes',
        deed_no_position='Aucun lieu d’objectif n’est connu pour cette prouesse.'),
}
for _lang in LANGS:
    WORDS[_lang].update(EXTRA[_lang])


def output_path(target, url):
    """Flat detail files; .htaccess preserves the public directory-style URLs."""
    parts = url.strip('/').split('/')
    if len(parts) >= 3:
        return Path(target).joinpath(*parts[:-1], parts[-1] + '.html')
    return Path(target).joinpath(*parts, 'index.html')


def page_route(lang, kind, number):
    base = route(lang, kind)
    return base if number == 1 else base + 'seite/%d/' % number


def read_assignment(path, variable):
    text = Path(path).read_text(encoding='utf-8')
    match = re.search(r'window\.' + re.escape(variable) + r'\s*=\s*', text)
    if not match:
        raise ValueError('%s: missing %s' % (path, variable))
    return json.JSONDecoder().raw_decode(text[match.end():])[0]


def route(lang, kind, identifier=None):
    # IDs are catalogue keys, not display names. Never generate paths from names.
    segment = WORDS[lang][kind]
    pattern = r'[A-Z][A-Z_]*' if kind == 'p' else r'[0-9A-Fa-f]+'
    if identifier is not None and not re.fullmatch(pattern, str(identifier)):
        raise ValueError('Invalid catalogue ID: %s' % identifier)
    return '/%s/%s/%s' % (lang, segment, str(identifier) + '/' if identifier is not None else '')


def old_link(lang, kind, identifier):
    if kind in ('p', 'recipe', 'craft'):
        return '/handwerk.html?lang=' + lang
    params = {'lang': lang, 'id': str(identifier)}
    if kind == 'd':
        params['art'] = 'taten'
    return ('/gegenstand.html?' if kind == 'i' else '/index.html?') + urlencode(params)


def a(url, text, **attrs):
    attributes = ''.join(' %s="%s"' % (key.rstrip('_').replace('_', '-'), escape(str(value), quote=True)) for key, value in attrs.items())
    return '<a href="%s"%s>%s</a>' % (escape(url, quote=True), attributes, escape(str(text)))


def paragraph(text, cls=''):
    return '<p%s>%s</p>' % (' class="%s"' % cls if cls else '', escape(str(text)))


def section(title, body):
    return '<section><h2>%s</h2>%s</section>' % (escape(title), body)


def load_model(source, lang, pilot=False):
    quests = read_assignment(source / ('daten-%s.js' % lang), 'MQL_QUESTS')
    deeds = read_assignment(source / ('daten-taten-%s.js' % lang), 'MQL_QUESTS')
    maps = read_assignment(source / ('daten-%s.js' % lang), 'MQL_KARTEN')
    selected = {kind: {q['i']: q for q in rows if not pilot or PILOT in q.get('fk', [])}
                for kind, rows in [('q', quests), ('d', deeds)]}
    # One item namespace for the whole site (build_items.py). Equipment, reward
    # items and crafting items share the same IDs, so links never guess.
    sammlung = Path(__file__).resolve().parent / 'daten' / 'items.json'
    if not sammlung.is_file():
        raise SystemExit('MISSING %s (run build_items.py)' % sammlung)
    alle_items = json.loads(sammlung.read_text(encoding='utf-8'))['items']
    if pilot:
        erlaubt = set(selected['q']) | set(selected['d'])
        selected['i'] = {iid: e for iid, e in alle_items.items()
                         if any(q[1] in erlaubt for q in e['quellen'])}
    else:
        selected['i'] = alle_items
    recipes = read_assignment(source / ('rezepte-%s.js' % lang), 'MQL_REZEPTE')['r']
    professions = read_assignment(source / 'referenz.js', 'MQL_REFERENZ')['berufe']
    selected['recipe'] = {row[10]: row for row in recipes} if not pilot else {}
    for art, datei in (('title', 'titel.json'), ('virtue', 'tugenden.json')):
        quelle = Path(__file__).resolve().parent / 'daten' / datei
        if not quelle.is_file():
            raise SystemExit('MISSING %s (run build_titel.py)' % quelle)
        eintraege = json.loads(quelle.read_text(encoding='utf-8'))['eintraege']
        # A handful of titles have no name in any language. Without this they
        # turn into empty bullets in the list and pages with an empty heading.
        eintraege = {key: value for key, value in eintraege.items()
                     if (value['n'].get(lang) or value['n'].get('en') or '').strip()}
        selected[art] = {} if pilot else eintraege
    selected['p'] = {key: entry for key, entry in professions.items() if any(row[9] == key for row in recipes)} if not pilot else {}
    used = {PILOT, 268437653, 268437557} if pilot else {m['idx'] for m in maps}
    selected['area'] = {str(m['idx']): m for m in maps if m['idx'] in used and m.get('tier') != 1}
    selected['region'] = {str(m['idx']): m for m in maps if m['idx'] in used and m.get('tier') == 1}
    return dict(selected=selected, all={'q': {q['i']: q for q in quests},
                                     'd': {q['i']: q for q in deeds}},
                maps={m['idx']: m for m in maps}, pilot=pilot)


class Renderer:
    def __init__(self, target, lang, models):
        self.target, self.lang, self.models = target, lang, models
        self.w = WORDS[lang]
        self.model = models[lang]
        self.selected = self.model['selected']
        self.paths = []
        self.asset_tags = []
        for asset in ('style.css', 'gemeinsam.css', 'katalog.css'):
            digest = hashlib.sha256((target / asset).read_bytes()).hexdigest()[:10]
            self.asset_tags.append('<link rel="stylesheet" href="/%s?v=%s">' % (asset, digest))
        self.scripts = '\n'.join('<script src="/%s?v=%s" defer></script>' % (
            asset, hashlib.sha256((target / asset).read_bytes()).hexdigest()[:10]) for asset in ('speicher.js', 'katalog.js'))
        app = (target / 'index.html').read_text(encoding='utf-8')
        self.tracking = '\n'.join(script for script in re.findall(r'<script\b[^>]*>.*?</script>', app, re.S)
                                  if 'gtm.start' in script or 'data-goatcounter=' in script)
        self.members = {kind: defaultdict(list) for kind in ('q', 'd', 'i')}
        for kind in ('q', 'd'):
            for key, entry in self.selected[kind].items():
                for mapid in set(entry.get('fk', [])):
                    self.members[kind][mapid].append((key, entry))
        for key, item in self.selected['i'].items():
            mapids = set()
            for src in item['quellen']:
                entry = self.selected.get(src[0], {}).get(src[1])
                if entry:
                    mapids.update(entry.get('fk', []))
            for mapid in mapids:
                self.members['i'][mapid].append((key, item))
        # Names are only a fallback where the game itself gives no ID (a reward
        # line, an ingredient). Ambiguous names are never linked.
        self.by_name = defaultdict(set)
        for iid, item in self.selected['i'].items():
            for name in item['n'].values():
                if name:
                    self.by_name[self.sauber(name)].add(iid)

    def familie_reiter(self, familie, kind):
        """Same second header line as menue.js builds, for the generated pages."""
        w, lang = self.w, self.lang
        reiter = [
            ('welt', [('q', route(lang, 'q'), w['menue_karte']),
                      ('d', '/index.html?art=taten&lang=' + lang, w['menue_taten']),
                      ('reise', '/reise.html?lang=' + lang, w['menue_reise'])]),
            ('gegenstaende', [('i', route(lang, 'i'), w['menue_gegenstaende']),
                              ('craft', '/handwerk.html?lang=' + lang, w['menue_handwerk']),
                              ('p', route(lang, 'p'), w['menue_berufe'])]),
            ('erfolge', [('title', route(lang, 'title'), w['menue_titel']),
                         ('virtue', route(lang, 'virtue'), w['menue_tugenden']),
                         ('ruf', '/ruf.html?lang=' + lang, w['menue_ruf'])]),
            ('charakter', [('spielstand', '/spielstand.html?lang=' + lang, w['menue_fortschritt']),
                           ('p', route(lang, 'p'), w['menue_meine_berufe']),
                           ('ruf', '/ruf.html?lang=' + lang, w['menue_mein_ruf'])]),
        ]
        for name, punkte in reiter:
            if name != familie:
                continue
            return ''.join(a(href, text, **({'aria_current': 'page'} if art == kind else {}))
                           for art, href, text in punkte)
        return ''

    def familie_ziel(self, familie):
        if familie == 'gegenstaende':
            return route(self.lang, 'i')
        if familie == 'erfolge':
            return '/belohnungen.html?lang=' + self.lang
        if familie == 'charakter':
            return '/spielstand.html?lang=' + self.lang
        return '/index.html?lang=' + self.lang

    # Lucide icons, ISC (see web/symbole-NOTICE.txt). Inline, because the build
    # copies no new asset files and an inline icon also works from disk.
    SYMBOLE = {
        'aufgabe': '<path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/>'
                   '<path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/>',
        'tat': '<path d="M10 14.66V17a1 1 0 0 1-1 1 2 2 0 0 0-2 2v2"/>'
               '<path d="M14 14.66V17a1 1 0 0 0 1 1 2 2 0 0 1 2 2v2"/>'
               '<path d="M17.916 10H19.5A2.5 2.5 0 0 0 22 7.5V5a1 1 0 0 0-1-1h-3"/><path d="M4 22h16"/>'
               '<path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/>'
               '<path d="M6.084 10H4.5A2.5 2.5 0 0 1 2 7.5V5a1 1 0 0 1 1-1h3"/>',
        'gegenstand': '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/>'
                      '<path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/>',
        'rezept': '<path d="M12 5v16"/><path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z"/>',
        'gebiet': '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>',
        'region': '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
        'beruf': '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
        'titel': '<path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/>',
        'tugend': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
        'vorkommen': '<path d="M17 3a2 2 0 0 1 1.6.8l3 4a2 2 0 0 1 .013 2.382l-7.99 10.986a2 2 0 0 1-3.247 0l-7.99-10.986A2 2 0 0 1 2.4 7.8l2.998-3.997A2 2 0 0 1 7 3z"/><path d="M2 9h20"/><path d="M10.5 3 8 9l4 13 4-13-2.5-6"/>',
        'fraktion': '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
        'landmarke': '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    }

    def entitaetssymbol(self, art):
        pfad = self.SYMBOLE.get(art) if art else None
        if not pfad:
            return ''
        return ('<svg class="symbol" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
                'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">%s</svg>' % pfad)

    @staticmethod
    def symbol(symbol, gross=False):
        """Client symbol, one file per symbol ID and language-neutral.

        Missing symbols (fields and a few special items) leave nothing behind
        instead of a broken image.
        """
        if not symbol:
            return ''
        size = 32 if gross else 22
        # No lazy loading: an icon is a few KB and belongs with its row.
        return '<img class="symbol%s" src="/bild/items/%s.webp" alt="" width="%d" height="%d" decoding="async">' % (
            ' symbol-gross' if gross else '', escape(str(symbol)), size, size)

    @staticmethod
    def sauber(text):
        text = re.sub(r'\[[A-Za-z]{1,4}\]', '', str(text or ''))
        return text.strip().casefold()

    def item_link(self, name, label=None):
        """Link to an item page when the name maps to exactly one item."""
        ids = self.by_name.get(self.sauber(name), set())
        if len(ids) != 1:
            return None
        return self.link('i', next(iter(ids)), label if label is not None else name)

    def link(self, kind, identifier, label):
        url = route(self.lang, kind, identifier) if identifier in self.selected.get(kind, {}) else old_link(self.lang, kind, identifier)
        return a(url, label)

    @staticmethod
    def klarer_name(text):
        """Item names still carry export markers: \\q for quotes, [n]/[i] tags."""
        text = str(text or '').replace('\\q', '"')
        text = re.sub(r'\[[A-Za-z]{1,4}\]', '', text)
        return re.sub(r'\s{2,}', ' ', text).strip()

    def name(self, kind, value):
        if kind in ('i', 'title', 'virtue'):
            return self.klarer_name(value['n'].get(self.lang) or value['n'].get('en') or '')
        if kind == 'recipe':
            return value[0]
        if kind == 'p':
            return value['n'].get(self.lang) or value['n'].get('en') or value['id']
        return value['name'] if kind in ('area', 'region') else value['n']

    def list_entries(self, kind, rows=None):
        rows = sorted(self.selected[kind].items() if rows is None else rows, key=lambda row: self.name(kind, row[1]).casefold())
        def eintrag(key, value):
            symbol = self.symbol(value.get('ic')) if kind == 'i' else ''
            return '<li>%s%s</li>' % (symbol, self.link(kind, key, self.name(kind, value)))
        return '<ul class="katalog-liste">' + ''.join(eintrag(key, value) for key, value in rows) + '</ul>'

    def write(self, kind, identifier, title, description, content, page=1, symbol=None, icon=None,
              aktionen='', url=None, alternates=None, kopf_oben='', kopf_klasse=''):
        w, lang = self.w, self.lang
        if url is None:
            url = page_route(lang, kind, page) if identifier is None else route(lang, kind, identifier)
        head = ['<meta name="description" content="%s">' % escape(description, quote=True),
                '<link rel="canonical" href="%s%s">' % (BASE, url)]
        if alternates:
            for other, adresse in alternates.items():
                head.append('<link rel="alternate" hreflang="%s" href="%s%s">' % (other, BASE, adresse))
        else:
            for other in LANGS:
                if identifier is None or identifier in self.models[other]['selected'].get(kind, {}):
                    head.append('<link rel="alternate" hreflang="%s" href="%s%s">' % (other, BASE,
                        page_route(other, kind, page) if identifier is None else route(other, kind, identifier)))
        for key, value in {'og:type': 'website', 'og:site_name': 'LOTRO Log Book',
                           'og:title': title + ' – LOTRO Log Book', 'og:description': description,
                           'og:url': BASE + url, 'og:locale': {'de': 'de_DE', 'en': 'en_US', 'fr': 'fr_FR'}[lang],
                           'og:image': BASE + '/bild/vorschau-%s.jpg' % lang,
                           'og:image:width': '1200', 'og:image:height': '630',
                           'og:image:alt': {'de': 'Breeland-Karte mit Aufgabenmarkierungen',
                                            'en': 'Bree-land map with quest markers',
                                            'fr': 'Carte du Pays de Bree avec repères de quêtes'}[lang]}.items():
            head.append('<meta property="%s" content="%s">' % (key, escape(value, quote=True)))
        head.append('<meta name="twitter:card" content="summary_large_image">')
        # Use the existing site's tracking configuration, never character data.
        head.append(self.tracking)
        head.extend(self.asset_tags)
        # The family row, same as menue.js builds for the app pages.
        # Families carry their tabs as a flyout, same as menue.js in the app.
        fam = [
            ('welt', '/index.html?lang=' + lang, w['familie_welt'],
             [('q', '/index.html?lang=' + lang, w['menue_karte'], w['d_karte']),
              ('d', '/index.html?art=taten&lang=' + lang, w['menue_taten'], w['d_taten']),
              ('reise', '/reise.html?lang=' + lang, w['menue_reise'], w['d_reise'])]),
            ('gegenstaende', '/gegenstaende.html?lang=' + lang, w['familie_gegenstaende'],
             [('i', '/gegenstaende.html?lang=' + lang, w['menue_gegenstaende'], w['d_gegenstand']),
              ('craft', '/handwerk.html?lang=' + lang, w['menue_handwerk'], w['d_handwerk']),
              ('p', route(lang, 'p'), w['menue_berufe'], w['d_beruf'])]),
            ('erfolge', '/belohnungen.html?lang=' + lang, w['familie_erfolge'],
             [('title', route(lang, 'title'), w['menue_titel'], w['d_titel']),
              ('virtue', route(lang, 'virtue'), w['menue_tugenden'], w['d_tugend']),
              ('ruf', '/ruf.html?lang=' + lang, w['menue_ruf'], w['d_ruf'])]),
            ('charakter', '/spielstand.html?lang=' + lang, w['familie_charakter'],
             [('spielstand', '/spielstand.html?lang=' + lang, w['menue_fortschritt'], w['d_fortschritt']),
              ('p', route(lang, 'p'), w['menue_meine_berufe'], w['d_meine_berufe']),
              ('ruf', '/ruf.html?lang=' + lang, w['menue_mein_ruf'], w['d_mein_ruf'])]),
        ]
        nav = []
        for schluessel, ziel, text, reiter in fam:
            flieger = ''.join(
                '<a href="%s"%s%s><strong>%s</strong><span>%s</span></a>' % (
                    escape(href, quote=True),
                    ' class="selbst"' if href == ziel else '',
                    ' aria-current="page"' if art == kind else '', escape(titel), escape(desc))
                for art, href, titel, desc in reiter)
            nav.append('<span class="familie-feld"><a href="%s"%s>%s</a>'
                       '<span class="familie-flieger">%s</span></span>' % (
                           escape(ziel, quote=True),
                           ' aria-current="page"' if FAMILIE.get(kind) == schluessel else '',
                           escape(text), flieger))
        start = '/start' + ('-' + lang if lang != 'de' else '') + '.html'
        languages = ' · '.join(a(page_route(other, kind, page) if identifier is None else route(other, kind, identifier), other.upper(), hreflang=other, lang=other) for other in LANGS
                               if identifier is None or identifier in self.models[other]['selected'].get(kind, {}))
        # Breadcrumbs follow the menu: family → type → place → entry.
        familie = FAMILIE.get(kind, 'welt')
        crumbs = a(start, w['home']) + ' › ' + a(self.familie_ziel(familie), w['familie_' + familie])
        # "Gegenstände › Gegenstände" said nothing twice; keep the family only.
        if kind != 'catalog' and w[kind + 'list'] != w['familie_' + familie]:
            crumbs += ' › ' + a(route(lang, kind), w[kind + 'list'])
        entry = self.selected.get(kind, {}).get(identifier)
        if entry and kind in ('q', 'd'):
            for mapid in entry.get('fk', []):
                mapentry = self.model['maps'].get(mapid)
                mapkind = 'region' if mapentry and mapentry.get('tier') == 1 else 'area'
                mapname = (mapentry or {}).get('name') or ''
                # "Karte 268…" is a technical file name, not a place.
                if re.fullmatch(r'Karte \d+', mapname):
                    continue
                if mapname and str(mapid) in self.selected[mapkind]:
                    crumbs += ' › ' + a(route(lang, mapkind, mapid), mapname)
        if entry and kind == 'recipe':
            crumbs += ' › ' + self.link('p', entry[9], self.name('p', self.selected['p'][entry[9]]))
        status = '<p id="katalog-status" hidden data-id="%s" data-kind="%s" data-profession="%s"></p>' % (
            escape(str(identifier)), kind, entry[9] if kind == 'recipe' and entry else '') if kind in ('q', 'd', 'recipe') and identifier is not None else ''
        config = escape(json.dumps({key: w[key] for key in ('status_done', 'status_unknown', 'status_running', 'none', 'known', 'foreign', 'recipe_unknown', 'recipe_missing')}, ensure_ascii=False), quote=True)
        html = '''<!doctype html>
<html lang="%s"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>%s – LOTRO Log Book</title>%s<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<noscript><style>.kopf .menue,.kopf .charakter{display:flex}.menue-knopf{display:none}</style></noscript>
</head><body class="seite-text katalog-seite" data-art="%s" data-katalog-texte="%s">
<header class="kopf"><div class="kopf-innen">
<a class="katalog-marke" href="%s">LOTRO Log Book</a>
<a class="suchen-knopf" href="/suche.html?lang=%s">%s</a>
<button class="menue-knopf" type="button" aria-label="%s" aria-controls="menue" aria-expanded="false">☰</button>
<nav class="menue" id="menue">%s%s</nav>

<div class="charakter"><label class="charakterwahl" hidden><select id="katalog-charakter" aria-label="%s"></select></label>%s</div>
</div></header>
<main class="katalog-inhalt"><nav aria-label="Breadcrumb" class="katalog-pfad">%s</nav>
<article><div class="katalog-kopf">%s<h1%s>%s%s%s</h1>%s</div>%s%s</article></main>
<footer><p>%s · %s</p><nav aria-label="Languages">%s</nav></footer>
%s
</body></html>''' % (lang, escape(title), '\n'.join(head), kind, config, start, lang, w['search'], w['menu'],
            ' '.join(nav), '',
            w['none'], a('/spielstand.html?lang=' + lang, w['import_'], class_='importieren'),
            crumbs, kopf_oben, (' class="%s"' % kopf_klasse) if kopf_klasse else '',
            self.entitaetssymbol(icon), self.symbol(symbol, gross=True), escape(title),
            aktionen, status, content,
            a('/impressum.html?lang=' + lang, w['legal']), a('/datenschutz.html?lang=' + lang, w['privacy']), languages, self.scripts)
        path = output_path(self.target, url)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(html, encoding='utf-8')
        _FORTSCHRITT['seiten'] += 1
        self.paths.append(url)

    def reise_link(self, kind, q):
        """Straight to the travel planner with this quest's position as target."""
        punkt = q.get('gt') or (q['t'][0] if q.get('t') else None)
        if not punkt:
            return ''
        _, lat, lon = punkt[:3]
        text = '%.1f%s %.1f%s' % (abs(lat), 'S' if lat < 0 else 'N', abs(lon), 'W' if lon < 0 else 'E')
        ziel = urlencode({'lang': self.lang, 'nach': text})
        return a('/reise.html?' + ziel, self.w['route'], class_='katalog-link')

    def quest(self, kind, q):
        # Deeds only: quest pages live in build_aufgaben.py.
        w = self.w
        facts = [(w['level'], q.get('l')), (w['giver'], q.get('g')),
                 (w['area_label'], ' › '.join(q.get('f', [])))]
        if q.get('gt'):
            _, lat, lon = q['gt'][:3]
            coords = '%.1f°%s, %.1f°%s' % (abs(lat), 'S' if lat < 0 else 'N', abs(lon), 'W' if lon < 0 else 'E')
            facts.append((w['location'], coords))
        if q.get('lp'):
            facts.append((w['points'], str(q['lp'])))
        body = '<p class="katalog-aktionen">%s %s</p>' % (
            a(old_link(self.lang, kind, q['i']), w['map'], class_='katalog-knopf'),
            self.reise_link(kind, q))
        body += '<dl class="katalog-fakten">' + ''.join('<dt>%s</dt><dd>%s</dd>' % (escape(k), escape(str(v))) for k, v in facts if v) + '</dl>'
        if kind == 'q' and not q.get('gt'):
            body += paragraph(w['no_position'], 'leer')
        if q.get('dy'):
            body += paragraph(w['daily'])
        if q.get('rp') == -1:
            body += paragraph(w['repeat'])
        if q.get('d'):
            body += section(w['description'], paragraph(q['d'], 'katalog-text'))
        rewards, choices = [], []
        for reward in q.get('rw', []):
            rkind, name = reward[:2]
            text = escape(name)
            if rkind in ('i', 'c'):
                verweis = self.item_link(name)
                if verweis:
                    text = verweis
                if len(reward) > 4 and reward[4] > 1:
                    text = str(reward[4]) + ' × ' + text
            else:
                text = escape(w.get({'t': 'title', 'v': 'virtue', 'tr': 'trait', 'e': 'emote'}.get(rkind), w['rewards'])) + ': ' + text
            (choices if rkind == 'c' else rewards).append('<li>%s</li>' % text)
        if rewards or choices:
            body += section(w['rewards'], ('<ul>%s</ul>' % ''.join(rewards) if rewards else '') +
                ('<h3>%s</h3><ul>%s</ul>' % (w['choice'], ''.join(choices)) if choices else ''))
        conditions = []
        if q.get('vl'):
            conditions.append('<li>%s %s</li>' % (w['level'], q['vl']))
        for key in ('v', 'vo'):
            links = [self.link('q', ident, self.model['all']['q'][ident]['n']) for ident in q.get(key, []) if ident in self.model['all']['q']]
            if links:
                conditions.append('<li>%s%s</li>' % (escape(w['one']) + ': ' if key == 'vo' else '', ' · '.join(links)))
        if q.get('vb'):
            conditions.append('<li>%s</li>' % w['extra'])
        if conditions:
            body += section(w['requirements'], '<ul>%s</ul>' % ''.join(conditions))
        chain = []
        for label, ids in [(w['previous'], q.get('pq', [])), (w['next'], [q['nq']] if q.get('nq') else [])]:
            for ident in ids:
                other = self.model['all'][kind].get(ident)
                if other:
                    chain.append('<li>%s: %s</li>' % (label, self.link(kind, ident, other['n'])))
        if chain:
            body += section(w['chain'], '<ul>%s</ul>' % ''.join(chain))
        if q.get('s'):
            steps = []
            for step in q['s']:
                parts = ''.join(paragraph(text, 'katalog-text') for text in step[1])
                parts += '<ul>%s</ul>' % ''.join('<li>%s</li>' % escape(obj[0]) for obj in step[2])
                steps.append('<li>%s</li>' % parts)
            body += '<details class="katalog-ziele" data-nosnippet><summary>%s</summary><ol>%s</ol></details>' % (w['objectives'], ''.join(steps))
        description = '%s: %s. %s. %s.' % (w[kind + 'label'], q['n'], ' › '.join(q.get('f', [])), w['map'])
        self.write(kind, q['i'], q['n'], description, body, icon='tat')

    def gegenstandslisten(self):
        """Item sub-indexes: one per category and per ten levels, paginated."""
        w = self.w
        gruppen = []
        for art in ('ARMOUR', 'WEAPON', 'ITEM', ''):
            zeilen = [(k, v) for k, v in self.selected['i'].items() if (v.get('kat') or '') == art]
            if not zeilen or (art == '' and gruppen):
                continue
            titel = w.get('kat_' + art.lower()) if art else w['ilist']
            gruppen.append(({o: route(o, 'i') + ARTEN[art][o] + '/' for o in LANGS}, titel, zeilen))
        gueten = defaultdict(list)
        for k, v in self.selected['i'].items():
            wert = GUETE.get(str(v.get('q'))) or int(v.get('q') or 0)
            if wert:
                gueten[wert].append((k, v))
        for wert in sorted(gueten):
            gruppen.append(({o: route(o, 'i') + WORDS[o]['qualityslug'] + '/' + GUETE_SLUG[wert][o] + '/'
                             for o in LANGS}, w.get('guete_%d' % wert) or str(wert), gueten[wert]))
        # Both at once: one page per category and quality.
        for art in ('ARMOUR', 'WEAPON', 'ITEM'):
            for wert in sorted(gueten):
                zeilen = [(k, v) for k, v in gueten[wert] if (v.get('kat') or '') == art]
                if not zeilen:
                    continue
                titel = '%s · %s' % (w.get('kat_' + art.lower()) or art, w.get('guete_%d' % wert) or str(wert))
                gruppen.append(({o: route(o, 'i') + ARTEN[art][o] + '/' + WORDS[o]['qualityslug'] + '/'
                                 + GUETE_SLUG[wert][o] + '/' for o in LANGS}, titel, zeilen))
        for pfade, titel, zeilen in gruppen:
            zeilen.sort(key=lambda r: self.name('i', r[1]).casefold())
            seiten = max(1, (len(zeilen) + PAGE_SIZE - 1) // PAGE_SIZE)
            for nummer in range(1, seiten + 1):
                teil = zeilen[(nummer - 1) * PAGE_SIZE:nummer * PAGE_SIZE]
                inhalt = self.list_entries('i', teil)
                if seiten > 1:
                    nav = []
                    if nummer > 1:
                        nav.append(a(pfade[self.lang] + ('seite/%d/' % (nummer - 1) if nummer > 2 else ''),
                                     w['prevpage']))
                    nav.append('%s %d / %d' % (w['page'], nummer, seiten))
                    if nummer < seiten:
                        nav.append(a(pfade[self.lang] + 'seite/%d/' % (nummer + 1), w['nextpage']))
                    inhalt += '<nav class="katalog-seiten">%s</nav>' % ' · '.join(nav)
                adressen = {o: pfade[o] if nummer == 1 else pfade[o] + 'seite/%d/' % nummer
                            for o in LANGS}
                ziel = adressen[self.lang]
                self.write('i', None, titel, '%s: %s' % (w['ilist'], titel), inhalt,
                           icon='gegenstand', url=ziel, alternates=adressen)

    def item(self, item):
        w = self.w
        name = self.name('i', item)
        ident = next((k for k, v in self.selected['i'].items() if v is item), None)
        werte = item.get('w') or {}
        fakten = []
        if item.get('l'):
            fakten.append((w['level'], item['l']))
        if item.get('kat'):
            fakten.append((w['category'], w.get('kat_' + str(item['kat']).lower(), item['kat'])))
        if item.get('slot'):
            fakten.append((w['slot'], w.get('slot_' + str(item['slot']).lower(), item['slot'])))
        if item.get('b') is not None:
            fakten.append((w['binding'], w['bound'] if item['b'] else w['free']))
        for feld, label in (('armour', w['armour']), ('dps', 'DPS'), ('damage', w['damage']), ('speed', w['speed'])):
            if werte.get(feld):
                fakten.append((label, werte[feld]))
        body = '<dl class="katalog-fakten">' + ''.join(
            '<dt>%s</dt><dd>%s</dd>' % (escape(str(k)), escape(str(v))) for k, v in fakten) + '</dl>'

        quellen = []
        for art, qid, qname, zone, region in item['quellen']:
            quellen.append('<li>%s%s</li>' % (self.link(art, qid, qname),
                ' · ' + escape(' › '.join(filter(None, [region, zone]))) if zone or region else ''))
        if quellen:
            body += section(w['sources'], '<ul>%s</ul>' % ''.join(quellen))
        else:
            body += section(w['sources'], '<p class="leer">%s</p>' % w['no_source'])

        herstellbar = [self.link('recipe', rid, self.selected['recipe'][rid][0])
                       for rid in item['rezepte'] if rid in self.selected['recipe']]
        if herstellbar:
            body += section(w['crafted_by'], '<ul>%s</ul>' % ''.join('<li>%s</li>' % x for x in herstellbar))

        zutaten = [self.link('recipe', rid, self.selected['recipe'][rid][0])
                   for rid in item['zutat'] if rid in self.selected['recipe']]
        if zutaten:
            body += section(w['used_in'], '<p>%s</p><ul>%s</ul>' % (
                w['used_count'].replace('%s', str(len(zutaten))),
                ''.join('<li>%s</li>' % x for x in zutaten[:50])))
            if len(zutaten) > 50:
                body += paragraph(w['more_in_list'].replace('%s', str(len(zutaten))), 'katalog-hinweis')

        if item.get('vor'):
            body += section(w['occurrences'], '<ul>%s</ul>' % ''.join(
                '<li>%s · %s</li>' % (escape(v[1]), escape(str(v[2] or ''))) for v in item['vor']))

        if not quellen and not herstellbar and not zutaten:
            body += paragraph(w['item_lonely'], 'katalog-hinweis')
        self.write('i', ident, name, '%s: %s. %s' % (w['ilabel'], name, w['item_intro']), body,
                   symbol=item.get('ic'))

    def build(self):
        # Quest, deed and item pages live in build_aufgaben.py,
        # build_taten.py and build_gegenstaende.py; this class keeps the rest.
        w = self.w
        for art in ('title', 'virtue'):
            for ident, eintrag in self.selected[art].items():
                self.ehre(art, eintrag, ident)
        for recipe in self.selected['recipe'].values():
            self.recipe(recipe)
        for key, profession in self.selected['p'].items():
            rows = [(ident, row) for ident, row in self.selected['recipe'].items() if row[9] == key]
            body = '<p>%s</p>' % a(old_link(self.lang, 'p', key), w['craftlist'])
            tiers = sorted({row[11] for _, row in rows})
            for tier in tiers:
                group = [(ident, row) for ident, row in rows if row[11] == tier]
                body += section(group[0][1][4], self.list_entries('recipe', group))
            self.write('p', key, self.name('p', profession), w['overview'], body)
        intro = paragraph(w['pilot'] if self.model['pilot'] else w['overview'], 'katalog-hinweis')
        for kind in ('q', 'd', 'i', 'area', 'region', 'p', 'recipe', 'title', 'virtue'):
            rows = sorted(self.selected[kind].items(), key=lambda row: self.name(kind, row[1]).casefold())
            count = max(1, (len(rows) + PAGE_SIZE - 1) // PAGE_SIZE)
            for number in range(1, count + 1):
                body = intro + self.list_entries(kind, rows[(number - 1) * PAGE_SIZE:number * PAGE_SIZE])
                if kind == 'i' and number == 1:
                    # The searchable browser is the way in; this page stays as the
                    # plain, crawlable list of every item.
                    body = ('<p class="katalog-hinweis">%s</p>'
                            % a('/gegenstaende.html?lang=' + self.lang, w['item_search'])) + body
                pages = []
                if number > 1:
                    pages.append(a(page_route(self.lang, kind, number - 1), w['prevpage']))
                pages.append('%s %d / %d' % (w['page'], number, count))
                if number < count:
                    pages.append(a(page_route(self.lang, kind, number + 1), w['nextpage']))
                body += '<nav class="katalog-seiten">%s</nav>' % ' · '.join(pages)
                title = w[kind + 'list'] + (' – %s %d' % (w['page'], number) if number > 1 else '')
                self.write(kind, None, title, w['overview'], body, page=number)
        for kind in ('area', 'region'):
            for ident, area in self.selected[kind].items():
                body = '<p>%s</p>' % a('/index.html?lang=' + self.lang + '#map-' + ident, w['area_map'])
                parent = self.model['maps'].get(area.get('eltern'))
                if parent:
                    pkind = 'region' if parent.get('tier') == 1 else 'area'
                    if str(parent['idx']) in self.selected[pkind]:
                        body += paragraph('') + self.link(pkind, str(parent['idx']), parent['name'])
                children = [(str(m['idx']), m) for m in self.selected['area'].values() if m.get('eltern') == area['idx']]
                if children:
                    body += section(w['arealist'], self.list_entries('area', children))
                for ekind in ('q', 'd', 'i'):
                    rows = self.members[ekind][area['idx']]
                    if rows:
                        body += section('%s (%d)' % (w[ekind + 'list'], len(rows)), self.list_entries(ekind,
                            sorted(rows, key=lambda row: self.name(ekind, row[1]).casefold())[:PAGE_SIZE]))
                        if len(rows) > PAGE_SIZE:
                            body += paragraph(w['excerpt'], 'katalog-hinweis')
                self.write(kind, ident, area['name'], '%s: %s – LOTRO Log Book.' % (w['cataloglabel'], area['name']), body)
        self.gegenstandslisten()
        craft = intro + section(w['plist'], self.list_entries('p')) + '<p>%s</p>' % a(route(self.lang, 'recipe'), w['recipelist'])
        self.write('craft', None, w['craftlist'], w['overview'], craft)
        self.write('catalog', None, w['cataloglabel'], w['overview'], intro + '<ul>' + ''.join(
            '<li>%s</li>' % a(route(self.lang, kind), w[kind + 'list']) for kind in ('q', 'd', 'i', 'area', 'region', 'p', 'recipe', 'craft')) + '</ul>')
        return self.paths

    def ehre(self, art, eintrag, ident):
        """Title or virtue page: what it is, where it comes from, and its limits."""
        w = self.w
        name = eintrag['n'].get(self.lang) or eintrag['n'].get('en') or ''
        quellen_sprache = eintrag['q'].get(self.lang) or eintrag['q'].get('en') or []
        quellen = []
        for art_q, qid, qname, zone, region, sorte in quellen_sprache:
            zusatz = ' · '.join(filter(None, [sorte, region, zone]))
            quellen.append('<li>%s%s</li>' % (self.link(art_q, qid, qname),
                                              ' · ' + escape(zusatz) if zusatz else ''))
        body = section(w['sources'], '<ul>%s</ul>' % ''.join(quellen))
        if re.search(r'\bRANK\b|\bNAME\b|\bSURNAME\b', name):
            body += paragraph(w['ranked'], 'katalog-hinweis')
        self.write(art, ident, name, '%s: %s' % (w[art + 'label'], name), body,
                   icon='titel' if art == 'title' else 'tugend')

    def recipe(self, row):
        w = self.w
        body = '<dl class="katalog-fakten"><dt>%s</dt><dd>%s</dd><dt>%s</dt><dd>%s</dd><dt>%s</dt><dd>%s</dd></dl>' % (
            w['plabel'], self.link('p', row[9], row[3]), w['tier'], escape(row[4]), w['category'], escape(row[5]))
        if row[2]:
            body += paragraph(w['level'] + ' ' + str(row[2]))
        body += section(w['ingredients'], '<ul>' + ''.join(
            '<li>%s%s × %s</li>' % (self.symbol(part[2] if len(part) > 2 else None), part[1],
                                    self.item_link(part[0]) or escape(part[0])) for part in row[6]) + '</ul>')
        if row[7]:
            body += section(w['optional'], '<ul>' + ''.join('<li>%s%s × %s%s</li>' % (
                self.symbol(part[3] if len(part) > 3 else None), part[1],
                self.item_link(part[0]) or escape(part[0]),
                ' (%s %%)' % round(part[2] * 100, 2) if len(part) > 2 and part[2] else '') for part in row[7]) + '</ul>')
        if row[8]:
            body += section(w['critical'], '<p>%s%s</p>' % (
                self.symbol(row[17] if len(row) > 17 else None), escape(row[8])))
        if len(row) > 12 and row[12]:
            body += paragraph(w['chance'] + ': ' + str(row[12]) + ' %')
        if len(row) > 13 and row[13]:
            body += paragraph(w['time'] + ': ' + str(row[13]) + ' s')
        body += '<p>%s</p>' % a(old_link(self.lang, 'recipe', row[10]), w['craftlist'])
        self.write('recipe', row[10], row[0], '%s: %s. %s · %s.' % (w['recipelabel'], row[0], row[3], row[4]), body,
                   icon='rezept', symbol=row[16] if len(row) > 16 else None)


def _jetzt():
    print('[%s] ' % time.strftime('%H:%M:%S'), end='', flush=True)


# Pages actually written in this run, plus the part being written. Counting files
# on disk said nothing: the folder still holds the previous build.
_FORTSCHRITT = {'seiten': 0, 'teil': ''}


class _Puls(threading.Thread):
    """Print a heartbeat while a long part runs, so the build never looks stuck."""

    def __init__(self, target):
        super().__init__(daemon=True)
        self.ziel = Path(target)
        self._stopp = threading.Event()
        self.start_zeit = time.time()

    def run(self):
        while not self._stopp.wait(20):
            print('[%s] … %d min · %s Seiten in diesem Lauf · %s'
                  % (time.strftime('%H:%M:%S'), int((time.time() - self.start_zeit) / 60),
                     '{:,}'.format(_FORTSCHRITT['seiten']).replace(',', '.'),
                     _FORTSCHRITT['teil'] or 'Start'),
                  flush=True)

    def stopp(self):
        self._stopp.set()


def _teil(name, arbeit):
    _fortschritt_teil(name)
    _jetzt()
    print('%s …' % name, flush=True)
    beginn = time.time()
    pfade = arbeit()
    _jetzt()
    print('%s: %d Seiten (%.1f s)' % (name, len(pfade), time.time() - beginn), flush=True)
    return pfade


def _abschluss(target, paths):
    """Start-page link, sitemaps and manifest. Safe to call on its own."""
    from build_sitemaps import add_sections, write
    target = Path(target)
    for lang in LANGS:
        page = target / ('start.html' if lang == 'de' else 'start-' + lang + '.html')
        if not page.is_file():
            continue
        text = page.read_text(encoding='utf-8')
        link = '<p data-katalog-einstieg>%s</p>' % a(route(lang, 'catalog'), WORDS[lang]['cataloglabel'])
        if 'data-katalog-einstieg' in text:
            text = re.sub(r'<p data-katalog-einstieg>.*?</p>', link, text, flags=re.S)
        else:
            text = text.replace('</main>', link + '\n</main>', 1)
        page.write_text(text, encoding='utf-8')
    if not (target / 'sitemap.xml').is_file():
        # A standalone run starts without build_seo.py; keep the stable index.
        write(target, 'sitemap.xml', ['/sitemap-seiten.xml'], index=True)
    GRENZE = 45000
    sections = defaultdict(list)
    for path in paths:
        lang, kind = path.strip('/').split('/')[:2]
        sections['/%s/%s/sitemap.xml' % (lang, kind)].append(path)
    aufgeteilt = {}
    for name, urls in sections.items():
        if len(urls) <= GRENZE:
            aufgeteilt[name] = urls
            continue
        for nummer, start in enumerate(range(0, len(urls), GRENZE), 1):
            aufgeteilt[name.replace('.xml', '-%d.xml' % nummer)] = urls[start:start + GRENZE]
    add_sections(target, aufgeteilt)
    (target / 'katalog-manifest.json').write_text(
        json.dumps({'pages': paths, 'flat': True}, ensure_ascii=False), encoding='utf-8')
    print('static catalogue: %d pages (DE/EN/FR)' % len(paths), flush=True)
    return paths


def _fortschritt_teil(name):
    _FORTSCHRITT['teil'] = name


def build(target, source=None, pilot=False):
    target = Path(target)
    source = Path(source) if source else target
    _FORTSCHRITT['seiten'] = 0
    _FORTSCHRITT['teil'] = ''
    _jetzt()
    print('lese Katalogdaten …', flush=True)
    models = {lang: load_model(source, lang, pilot=pilot) for lang in LANGS}
    _jetzt()
    print('Daten gelesen', flush=True)
    for kind in ('q', 'd', 'i', 'recipe', 'p', 'area', 'region'):
        ids = [set(models[lang]['selected'][kind]) for lang in LANGS]
        if not all(ids[0] == other for other in ids[1:]):
            raise ValueError('Catalogue IDs differ between languages: ' + kind)
    for asset in ('katalog.css', 'katalog.js'):
        (target / asset).write_bytes((Path(__file__).parent / 'web' / asset).read_bytes())
    from build_aufgaben import pages as aufgabenseiten
    from build_taten import pages as tatenseiten
    from build_gegenstaende import pages as gegenstandsseiten
    puls = _Puls(target)
    puls.start()
    try:
        paths = _teil('Aufgaben', lambda: aufgabenseiten(target, models))
        paths += _teil('Taten', lambda: tatenseiten(target, models))
        paths += _teil('Gegenstände', lambda: gegenstandsseiten(target, models))
        for lang in LANGS:
            paths += _teil('Übrige Seiten %s' % lang.upper(),
                           lambda lang=lang: Renderer(target, lang, models).build())
    finally:
        puls.stopp()
    _abschluss(target, paths)
    return paths
