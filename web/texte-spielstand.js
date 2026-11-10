/* Texts of the progress page and the menu, in three languages. Merged into
 * window.MQL_TEXTE by texte.js. Only our own wording; markup is trusted.
 */
(function () {
	'use strict';
	var DEEDTRACKER = '<a href="https://www.lotrointerface.com/downloads/info1139-DeedTracker.html" target="_blank" rel="noopener">Deed Tracker</a>';
	var COMPANION = '<a href="https://sourceforge.net/projects/lotrocompanion/" target="_blank" rel="noopener">LOTRO Companion</a>';
	var PLUGIN = '<a href="https://www.lotrointerface.com/downloads/info1346-MagicQuestLog.html" target="_blank" rel="noopener">Magic Quest Log</a>';

	var zusatz = {
		de: {
			menue_karte: 'Aufgaben',
			menue_spielstand: 'Spielstand importieren',
			menue_plugin: 'Plugin fürs Spiel',
			menue_import_kurz: 'Importieren',
			alter_import: 'Spielstand importiert am',
			alter_heute: 'heute', alter_gestern: 'gestern', alter_vor_tagen: 'vor %s Tagen',
			alter_unbekannt: 'Kein Importdatum gespeichert',
			menue_suche_kurz: 'Suchen',
			charakter: 'Charakter',
			ohne_spielstand: 'ohne Spielstand',
			kein_charakter: 'noch keiner geladen',
			sp_titel: 'Spielstand importieren',
			sp_einleitung: 'Sieh, welche Aufgaben und Taten dein Charakter schon abgeschlossen hat.',
			sp_hilfe_companion: 'Noch keinen Charakter mit Companion ausgelesen? <a data-ziel="companion.html" href="/de/companion/">So geht’s.</a>',
			sp_ordner_hilfe: 'Wo finde ich den Ordner?',
			sp_verwalten: 'Charaktere verwalten',
			sp_voraussetzungen: 'Du brauchst ' + COMPANION + ' (kostenlos), um deinen Spielstand einzulesen. Das Plugin ' + PLUGIN + ' ist für die Website <strong>nicht erforderlich</strong>.',
			sp_datenschutz: 'Deine Charakterdaten bleiben auf deinem Rechner und werden nicht hochgeladen. <a href="/datenschutz.html?lang=de">Datenschutz</a>',
			sp_schritt1: '1. Charakter in LOTRO Companion importieren',
			sp_companion: 'Mit dem kostenlosen ' + COMPANION + ' übernimmst du deinen Fortschritt aus dem laufenden Spiel. Danach kannst du Companion wieder schließen und wie gewohnt weiterspielen.',
			sp_companion_link: 'Du nutzt Companion zum ersten Mal? Die <a data-ziel="companion.html" href="/de/companion/">ausführliche Anleitung</a> hilft dir beim Einrichten und bei Fragen. Die Kurzfassung findest du hier:',
			sp_windows: '<li>LOTRO starten und mit dem Charakter <strong>die Welt betreten</strong>.</li>' +
				'<li>LOTRO Companion starten.</li>' +
				'<li>Oben unter <strong>Sonstiges</strong> das Symbol <strong>„Import from LOTRO…“</strong> anklicken.</li>' +
				'<li>Im Fenster <strong>Refresh</strong>, dann <strong>Start</strong>. Nach kurzer Zeit steht dort <em>Import finished!</em></li>' +
				'<li>Klappt „Start“ nicht: Companion einmal mit Rechtsklick → <em>Als Administrator ausführen</em> starten.</li>',
			sp_mac: '<li>Lade die Windows-Version von Companion herunter und entpacke die ZIP-Datei. Lege den entpackten Ordner unter dem Namen <code>LotRO Companion</code> in <code>Programme</code> ab. Du kannst auch den Ordner <code>Programme</code> in deinem Benutzerordner verwenden.</li>' +
				'<li>LOTRO starten und mit dem Charakter <strong>die Welt betreten</strong>.</li>' +
				'<li>Zum Starten braucht Companion auf dem Mac einen kleinen Umweg. Klicke auf <strong>„Befehl kopieren“</strong> unter dem Kasten. Öffne mit <strong>⌘ Leertaste</strong> die Suche, tippe <strong>Terminal</strong> und drücke Return. Füge den Befehl mit <strong>⌘V</strong> ein und drücke noch einmal Return. Damit startest du Companion mithilfe deiner LOTRO-Installation.</li>' +
				'<li>Klicke in Companion unter <strong>Sonstiges</strong> auf <strong>„Importieren von HdRO…“</strong> (englisch: <em>Import from LOTRO…</em>), dann auf <strong>Refresh</strong> und <strong>Start</strong>. Warte auf <em>Import finished!</em>. Danach geht es unten bei Schritt 2 weiter.</li>',
			sp_mac_warnung: 'Nimm für den Spielstand den Knopf „Importieren von HdRO…“ unter Sonstiges. Der ähnlich benannte Knopf „Import a character…“ in der Charakterliste kann Companion auf dem Mac blockieren. Falls das passiert, beende Companion im Dock und starte es erneut.',
			sp_kopieren: 'Befehl kopieren',
			sp_kopiert: 'Kopiert ✓',
			sp_schritt2: '2. Companion-Spielstand importieren',
			sp_laden: 'Wähle den Ordner <code>characters</code> von Companion oder ziehe ihn in das Feld. Vorhandene Charaktere werden aktualisiert.',
			sp_ordner_windows: 'Ordner unter Windows (in die Adresszeile des Auswahlfensters einfügen):',
			sp_ordner_mac: 'Klicke auf „Companion-Ordner auswählen“. Drücke im Auswahlfenster ⌘⇧G, füge diese Ordneradresse ein und drücke Return. Bestätige dann die Auswahl:',
			sp_ablage: 'Oder den Ordner „characters“ hierher ziehen',
			sp_ordner_waehlen: 'Companion-Ordner auswählen',
			sp_lese: 'Lese …',
			sp_gelesen: '%s Charakter(e) gelesen: %s',
			sp_nichts: 'Kein Companion-Spielstand gefunden. Wähle den Ordner „characters“. Falls du deinen Charakter noch nicht mit Companion ausgelesen hast, hilft dir die Anleitung unter „So geht’s“.',
			sp_speicher_voll: 'Dein Spielstand konnte nicht gespeichert werden. Versuche es in einem normalen statt einem privaten Browserfenster. Möglicherweise ist auch der Browserspeicher voll.',
			sp_schritt3: 'Deine Charaktere',
			sp_spalte_name: 'Name', sp_spalte_server: 'Server', sp_spalte_klasse: 'Klasse', sp_spalte_stufe: 'Stufe',
			sp_spalte_aufgaben: 'Aufgaben', sp_spalte_taten: 'Taten', sp_spalte_stand: 'Stand vom',
			sp_keine: 'Noch kein Charakter geladen.',
			sp_fertig: 'Dein Logbuch ist auf dem neuesten Stand. Wähle oben deinen Charakter und schau bei Aufgaben, Taten oder Handwerk nach deinen nächsten Zielen. Die folgenden Schritte sind freiwillig.',
			sp_zur_karte: 'Zur Karte',
			sp_aktiv: 'aktiv', sp_waehlen: 'wählen', sp_karte: 'auf der Karte', sp_entfernen: 'entfernen',
			sp_entfernen_frage: '%s aus diesem Browser entfernen?',
			sp_schritt4: 'Optional: Plugin fürs Spiel',
			sp_plugin_kurz: 'Du nutzt ' + PLUGIN + ' im Spiel? Dann kannst du deinen importierten Fortschritt auch dorthin übernehmen. Für das Logbuch auf dieser Website brauchst du das Plugin nicht.',
			sp_zum_plugin: 'Plugin einrichten',
			sp_schritt5: 'Sicherung',
			sp_sichern: 'Hier kannst du deine Charaktere als Datei sichern oder eine vorhandene Sicherung laden.',
			sp_sicherung: 'Sicherung herunterladen',
			sp_sicherung_laden: 'Sicherung laden …',
			sp_sicherung_fertig: 'Sicherung gespeichert.',
			sp_sicherung_geladen: '%s Charakter(e) aus der Sicherung übernommen.',
			sp_sicherung_falsch: 'Das ist keine Sicherung dieser Seite.',
			sp_fragen: 'Häufige Fragen',
			sp_faq: '<details><summary>Mein Charakter fehlt in der Liste.</summary><p>Er muss erst in LOTRO Companion importiert sein. Dann den Ordner hier erneut laden.</p></details>' +
				'<details><summary>Im Plugin fehlt ein Charakter.</summary><p>Das Plugin zeigt die Charaktere des Kontos und Servers, auf dem du gerade spielst. Charaktere anderer Server erscheinen, wenn du dort spielst. Wie der Stand ins Plugin kommt, steht unter <a data-ziel="plugin.html" href="/de/plugin/">Plugin fürs Spiel</a>.</p></details>' +
				'<details><summary>Die Zahlen weichen vom Spiel ab.</summary><p>Sitzungsspiele zeichnet das Spiel nie als erledigt auf, und von zwei Aufgaben, die sich ausschließen, ist nur eine möglich. Beide zählen hier nicht mit. Wiederholbare Aufträge zählen, sobald sie einmal erledigt sind.</p></details>' +
				'<details><summary>Wie aktualisiere ich meinen Fortschritt?</summary><p>Importiere den aktuellen Stand erneut in Companion und lade den Ordner hier erneut. Damit ist die Website aktualisiert. Nur wenn du auch Magic Quest Log nutzt, übernimmst du den Stand zusätzlich ins Plugin. Beim Spielen erkennt das Plugin Abschlüsse selbst.</p></details>' +
				'<details><summary>Ich sammle vor allem Taten.</summary><p>Dafür gibt es ' + DEEDTRACKER + ' von b414213562: ein ausgereiftes Plugin nur für Taten, mit LOTRO-Punkten, Tugend-Erfahrung und gleichnamigen Taten. Magic Quest Log ist vor allem für Aufgaben gedacht; beide vertragen sich.</p></details>'
		},
		en: {
			menue_karte: 'Quests',
			menue_spielstand: 'Import progress',
			menue_plugin: 'Plugin for the game',
			menue_import_kurz: 'Import',
			alter_import: 'Progress imported on',
			alter_heute: 'today', alter_gestern: 'yesterday', alter_vor_tagen: '%s days ago',
			alter_unbekannt: 'No import date stored',
			menue_suche_kurz: 'Search',
			charakter: 'Character',
			ohne_spielstand: 'no progress',
			kein_charakter: 'none loaded yet',
			sp_titel: 'Import progress',
			sp_einleitung: 'See which quests and deeds your character has already completed.',
			sp_hilfe_companion: 'Haven’t read your character with Companion yet? <a data-ziel="companion.html" href="/en/companion/">Here’s how.</a>',
			sp_ordner_hilfe: 'Where can I find the folder?',
			sp_verwalten: 'Manage characters',
			sp_voraussetzungen: 'You need ' + COMPANION + ' (free) to read your progress from the game. The ' + PLUGIN + ' plugin is <strong>not required</strong> for this website.',
			sp_datenschutz: 'Your character data stays on your computer and is not uploaded. <a href="/datenschutz.html?lang=en">Privacy</a>',
			sp_schritt1: '1. Import your character in LOTRO Companion',
			sp_companion: 'The free ' + COMPANION + ' reads your progress while the game is running. Once that is done, you can close Companion and carry on playing as usual.',
			sp_companion_link: 'New to Companion? The <a data-ziel="companion.html" href="/en/companion/">full guide</a> helps with setup and common questions. Here are the short steps:',
			sp_windows: '<li>Start LOTRO and <strong>enter the world</strong> with your character.</li>' +
				'<li>Start LOTRO Companion.</li>' +
				'<li>Under <strong>Misc</strong> at the top, click the <strong>"Import from LOTRO…"</strong> icon.</li>' +
				'<li>In that window press <strong>Refresh</strong>, then <strong>Start</strong>. Shortly after it says <em>Import finished!</em></li>' +
				'<li>If "Start" does nothing: start Companion once with right-click → <em>Run as administrator</em>.</li>',
			sp_mac: '<li>Download the Windows version of Companion and unpack the ZIP file. Name the unpacked folder <code>LotRO Companion</code> and place it in <code>Applications</code>. You can also use the <code>Applications</code> folder inside your home folder.</li>' +
				'<li>Start LOTRO and <strong>enter the world</strong> with your character.</li>' +
				'<li>Starting Companion on a Mac takes an extra step. Click <strong>“Copy command”</strong> below the box. Press <strong>⌘ Space</strong>, search for <strong>Terminal</strong> and press Return. Paste the command with <strong>⌘V</strong> and press Return again. This starts Companion using your LOTRO installation.</li>' +
				'<li>In Companion, under <strong>Misc</strong>, click <strong>“Import from LOTRO…”</strong>, then <strong>Refresh</strong> and <strong>Start</strong>. Wait for <em>Import finished!</em>, then continue with step 2 below.</li>',
			sp_mac_warnung: 'Use “Import from LOTRO…” under Misc for your progress. The similarly named “Import a character…” button in the character list can make Companion stop responding on a Mac. If that happens, quit it from the Dock and start it again.',
			sp_kopieren: 'Copy command',
			sp_kopiert: 'Copied ✓',
			sp_schritt2: '2. Import Companion progress',
			sp_laden: 'Choose Companion’s <code>characters</code> folder or drag it into the area below. Existing characters will be updated.',
			sp_ordner_windows: 'Folder on Windows (paste it into the address bar of the picker):',
			sp_ordner_mac: 'Click “Select Companion folder”. In the folder window, press ⌘⇧G, paste this folder address and press Return. Then confirm your selection:',
			sp_ablage: 'Or drop the “characters” folder here',
			sp_ordner_waehlen: 'Select Companion folder',
			sp_lese: 'Reading …',
			sp_gelesen: '%s character(s) read: %s',
			sp_nichts: 'No Companion progress found. Choose the “characters” folder. If you haven’t read your character with Companion yet, follow the “Here’s how” guide.',
			sp_speicher_voll: 'Your progress could not be saved. Try a regular browser window instead of a private one. Your browser storage may also be full.',
			sp_schritt3: 'Your characters',
			sp_spalte_name: 'Name', sp_spalte_server: 'Server', sp_spalte_klasse: 'Class', sp_spalte_stufe: 'Level',
			sp_spalte_aufgaben: 'Quests', sp_spalte_taten: 'Deeds', sp_spalte_stand: 'As of',
			sp_keine: 'No character loaded yet.',
			sp_fertig: 'Your log book is up to date. Choose your character above and look for your next goal under Quests, Deeds or Crafting. The steps below are optional.',
			sp_zur_karte: 'Go to the map',
			sp_aktiv: 'active', sp_waehlen: 'choose', sp_karte: 'on the map', sp_entfernen: 'remove',
			sp_entfernen_frage: 'Remove %s from this browser?',
			sp_schritt4: 'Optional: plugin for the game',
			sp_plugin_kurz: 'Using ' + PLUGIN + ' in game? You can send your imported progress there, too. You do not need the plugin to use this website.',
			sp_zum_plugin: 'Set up the plugin',
			sp_schritt5: 'Backup',
			sp_sichern: 'Save your characters to a backup file or load an existing backup here.',
			sp_sicherung: 'Download backup',
			sp_sicherung_laden: 'Load backup …',
			sp_sicherung_fertig: 'Backup saved.',
			sp_sicherung_geladen: '%s character(s) taken from the backup.',
			sp_sicherung_falsch: 'This is not a backup of this page.',
			sp_fragen: 'Questions',
			sp_faq: '<details><summary>My character is missing from the list.</summary><p>It has to be imported in LOTRO Companion first. Then load the folder here again.</p></details>' +
				'<details><summary>A character is missing in the plugin.</summary><p>The plugin shows the characters of the account and server you are playing on. Characters of other servers appear when you play there. How your progress gets into the plugin is described under <a data-ziel="plugin.html" href="/en/plugin/">plugin for the game</a>.</p></details>' +
				'<details><summary>The numbers differ from the game.</summary><p>The game does not record session plays as completed. A quest ruled out by completing an alternative is also excluded from the total. Repeatable quests count after their first completion.</p></details>' +
				'<details><summary>How do I update my progress?</summary><p>Import the current progress in Companion again, then load the folder here again. That updates the website. Only if you also use Magic Quest Log do you need to export the progress to the plugin as well. While you play, the plugin notices completions by itself.</p></details>' +
				'<details><summary>I mostly collect deeds.</summary><p>Then have a look at ' + DEEDTRACKER + ' by b414213562: a mature plugin just for deeds, with LOTRO points, virtue experience and identically named deeds. Magic Quest Log is mainly about quests; both work side by side.</p></details>'
		},
		fr: {
			menue_karte: 'Quêtes',
			menue_spielstand: 'Importer la progression',
			menue_plugin: 'Plugin pour le jeu',
			menue_import_kurz: 'Importer',
			alter_import: 'Progression importée le',
			alter_heute: 'aujourd’hui', alter_gestern: 'hier', alter_vor_tagen: 'il y a %s jours',
			alter_unbekannt: 'Aucune date d’import enregistrée',
			menue_suche_kurz: 'Rechercher',
			charakter: 'Personnage',
			ohne_spielstand: 'sans progression',
			kein_charakter: 'aucun chargé',
			sp_titel: 'Importer la progression',
			sp_einleitung: 'Retrouvez les quêtes et prouesses que votre personnage a déjà accomplies.',
			sp_hilfe_companion: 'Vous n’avez pas encore récupéré votre personnage avec Companion ? <a data-ziel="companion.html" href="/fr/companion/">Voici comment faire.</a>',
			sp_ordner_hilfe: 'Où trouver le dossier ?',
			sp_verwalten: 'Gérer les personnages',
			sp_voraussetzungen: 'Vous avez besoin de ' + COMPANION + ' (gratuit) pour lire votre progression dans le jeu. Le plugin ' + PLUGIN + ' <strong>n’est pas nécessaire</strong> pour ce site.',
			sp_datenschutz: 'Les données de vos personnages restent sur votre ordinateur et ne sont pas envoyées au site. <a href="/datenschutz.html?lang=fr">Confidentialité</a>',
			sp_schritt1: '1. Importer le personnage dans LOTRO Companion',
			sp_companion: 'Le logiciel gratuit ' + COMPANION + ' lit votre progression pendant que le jeu est lancé. Vous pouvez ensuite fermer Companion et continuer à jouer comme d’habitude.',
			sp_companion_link: 'Vous découvrez Companion ? Le <a data-ziel="companion.html" href="/fr/companion/">guide complet</a> vous accompagne pour l’installation et les questions fréquentes. Voici les étapes en bref :',
			sp_windows: '<li>Lancer LOTRO et <strong>entrer dans le monde</strong> avec le personnage.</li>' +
				'<li>Lancer LOTRO Companion.</li>' +
				'<li>Sous <strong>Divers</strong>, cliquer sur l\'icône <strong>« Import from LOTRO… »</strong>.</li>' +
				'<li>Dans la fenêtre : <strong>Refresh</strong>, puis <strong>Start</strong>. Peu après s\'affiche <em>Import finished!</em></li>' +
				'<li>Si « Start » ne fait rien : lancer Companion une fois avec clic droit → <em>Exécuter en tant qu\'administrateur</em>.</li>',
			sp_mac: '<li>Téléchargez la version Windows de Companion et décompressez le fichier ZIP. Nommez le dossier obtenu <code>LotRO Companion</code> et placez-le dans <code>Applications</code>. Vous pouvez aussi utiliser le dossier <code>Applications</code> de votre dossier personnel.</li>' +
				'<li>Lancer LOTRO et <strong>entrer dans le monde</strong> avec le personnage.</li>' +
				'<li>Sur Mac, démarrer Companion demande une étape supplémentaire. Cliquez sur <strong>« Copier la commande »</strong> sous le cadre. Appuyez sur <strong>⌘ Espace</strong>, cherchez <strong>Terminal</strong> et appuyez sur Entrée. Collez la commande avec <strong>⌘V</strong>, puis appuyez à nouveau sur Entrée. Companion démarre ainsi à l’aide de votre installation de LOTRO.</li>' +
				'<li>Dans Companion, sous <strong>Divers</strong>, cliquez sur <strong>« Import from LOTRO… »</strong>, puis <strong>Refresh</strong> et <strong>Start</strong>. Attendez <em>Import finished!</em>, puis passez à l’étape 2 ci-dessous.</li>',
			sp_mac_warnung: 'Pour votre progression, utilisez « Import from LOTRO… » sous Divers. Le bouton au nom proche « Import a character… » dans la liste des personnages peut bloquer Companion sur Mac. Si cela arrive, quittez Companion depuis le Dock, puis relancez-le.',
			sp_kopieren: 'Copier la commande',
			sp_kopiert: 'Copié ✓',
			sp_schritt2: '2. Importer la progression Companion',
			sp_laden: 'Choisissez le dossier <code>characters</code> de Companion ou glissez-le dans la zone ci-dessous. Les personnages déjà présents seront mis à jour.',
			sp_ordner_windows: 'Dossier sous Windows (à coller dans la barre d\'adresse du sélecteur) :',
			sp_ordner_mac: 'Cliquez sur « Choisir le dossier Companion ». Dans la fenêtre de sélection, appuyez sur ⌘⇧G, collez cette adresse de dossier et appuyez sur Entrée. Confirmez ensuite votre choix :',
			sp_ablage: 'Ou glissez le dossier « characters » ici',
			sp_ordner_waehlen: 'Choisir le dossier Companion',
			sp_lese: 'Lecture …',
			sp_gelesen: '%s personnage(s) lu(s) : %s',
			sp_nichts: 'Aucune progression Companion trouvée. Choisissez le dossier « characters ». Si vous n’avez pas encore récupéré votre personnage avec Companion, suivez le guide « Voici comment faire ».',
			sp_speicher_voll: 'Votre progression n’a pas pu être enregistrée. Essayez une fenêtre normale plutôt qu’une fenêtre privée. Le stockage de votre navigateur est peut-être aussi plein.',
			sp_schritt3: 'Vos personnages',
			sp_spalte_name: 'Nom', sp_spalte_server: 'Serveur', sp_spalte_klasse: 'Classe', sp_spalte_stufe: 'Niveau',
			sp_spalte_aufgaben: 'Quêtes', sp_spalte_taten: 'Prouesses', sp_spalte_stand: 'Date',
			sp_keine: 'Aucun personnage chargé.',
			sp_fertig: 'Votre journal est à jour. Choisissez votre personnage en haut et cherchez votre prochain objectif dans Quêtes, Prouesses ou Artisanat. Les étapes suivantes sont facultatives.',
			sp_zur_karte: 'Voir la carte',
			sp_aktiv: 'actif', sp_waehlen: 'choisir', sp_karte: 'sur la carte', sp_entfernen: 'supprimer',
			sp_entfernen_frage: 'Supprimer %s de ce navigateur ?',
			sp_schritt4: 'Facultatif : plugin pour le jeu',
			sp_plugin_kurz: 'Vous utilisez ' + PLUGIN + ' en jeu ? Vous pouvez aussi y transmettre votre progression importée. Le plugin n’est pas nécessaire pour utiliser ce site.',
			sp_zum_plugin: 'Configurer le plugin',
			sp_schritt5: 'Sauvegarde',
			sp_sichern: 'Enregistrez vos personnages dans un fichier de sauvegarde ou chargez une sauvegarde existante ici.',
			sp_sicherung: 'Télécharger la sauvegarde',
			sp_sicherung_laden: 'Charger une sauvegarde …',
			sp_sicherung_fertig: 'Sauvegarde enregistrée.',
			sp_sicherung_geladen: '%s personnage(s) repris de la sauvegarde.',
			sp_sicherung_falsch: 'Ce n\'est pas une sauvegarde de cette page.',
			sp_fragen: 'Questions fréquentes',
			sp_faq: '<details><summary>Mon personnage n\'apparaît pas.</summary><p>Il doit d\'abord être importé dans LOTRO Companion. Rechargez ensuite le dossier ici.</p></details>' +
				'<details><summary>Un personnage manque dans le plugin.</summary><p>Le plugin affiche les personnages du compte et du serveur sur lequel vous jouez. Ceux d\'autres serveurs apparaissent quand vous y jouez. La marche à suivre se trouve sous <a data-ziel="plugin.html" href="/fr/plugin/">Plugin pour le jeu</a>.</p></details>' +
				'<details><summary>Les chiffres diffèrent du jeu.</summary><p>Les jeux de session ne sont pas enregistrés comme terminés. Une quête exclue par l’accomplissement d’une autre n’entre pas non plus dans le total. Les quêtes répétables comptent après leur premier accomplissement.</p></details>' +
				'<details><summary>Comment mettre à jour ma progression ?</summary><p>Réimportez la progression actuelle dans Companion, puis rechargez le dossier ici. Le site est alors à jour. Si vous utilisez aussi Magic Quest Log, transmettez également la progression au plugin. En jouant, le plugin remarque lui-même les quêtes terminées.</p></details>' +
				'<details><summary>Je collectionne surtout les prouesses.</summary><p>Voyez alors ' + DEEDTRACKER + ' de b414213562 : un plugin éprouvé uniquement pour les prouesses, avec points LOTRO, expérience de vertu et prouesses homonymes. Magic Quest Log vise surtout les quêtes ; les deux cohabitent.</p></details>'
		}
	};

	var texte = window.MQL_TEXTE || {};
	Object.keys(zusatz).forEach(function (sprache) {
		texte[sprache] = texte[sprache] || {};
		Object.keys(zusatz[sprache]).forEach(function (schluessel) {
			texte[sprache][schluessel] = zusatz[sprache][schluessel];
		});
	});
	window.MQL_TEXTE = texte;
})();
