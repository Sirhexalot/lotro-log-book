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
			menue_karte: 'Quests',
			menue_spielstand: 'Spielstand importieren',
			charakter: 'Charakter',
			ohne_spielstand: 'ohne Spielstand',
			kein_charakter: 'noch keiner geladen',
			sp_titel: 'Spielstand importieren',
			sp_einleitung: 'Importiere deinen Fortschritt aus ' + COMPANION + ' für die Karte und das Plugin ' + PLUGIN + '. Mehrere Charaktere wechselst du anschließend oben im Menü.',
			sp_datenschutz: 'Die Charakterdateien werden lokal verarbeitet. <a href="datenschutz.html?lang=de">Datenschutz</a>',
			sp_schritt1: '1. Charakter in LOTRO Companion importieren',
			sp_companion: 'LOTRO Companion liest den aktuellen Stand deines Charakters aus dem laufenden Spiel. Für diesen Import benötigst du ' + COMPANION + ' (kostenlos). Beim Spielen muss Companion nicht geöffnet bleiben.',
			sp_windows: '<li>LOTRO starten und mit dem Charakter <strong>die Welt betreten</strong>.</li>' +
				'<li>LOTRO Companion starten.</li>' +
				'<li>Oben unter <strong>Sonstiges</strong> das Symbol <strong>„Import from LOTRO…“</strong> anklicken.</li>' +
				'<li>Im Fenster <strong>Refresh</strong>, dann <strong>Start</strong>. Nach kurzer Zeit steht dort <em>Import finished!</em></li>' +
				'<li>Klappt „Start“ nicht: Companion einmal mit Rechtsklick → <em>Als Administrator ausführen</em> starten.</li>',
			sp_mac: '<li>Companion (die Windows-Version) herunterladen und als Ordner <code>LotRO Companion</code> nach <code>Programme</code> oder in deinen eigenen Ordner <code>Programme</code> legen.</li>' +
				'<li>LOTRO starten und mit dem Charakter <strong>die Welt betreten</strong>.</li>' +
				'<li>Das Programm <em>Terminal</em> öffnen, den Befehl unten einfügen und Return drücken. Companion startet im selben Umfeld wie das Spiel.</li>' +
				'<li>Unter <strong>Sonstiges</strong> das Symbol <strong>„Import from LOTRO…“</strong>, dann <strong>Refresh</strong> und <strong>Start</strong>.</li>',
			sp_mac_warnung: 'Achtung: Nicht den Knopf „Import a character…“ in der Charakterliste nehmen. Der öffnet ein Dateifenster, das auf dem Mac unsichtbar bleibt, und Companion reagiert dann nicht mehr. In dem Fall Companion im Dock beenden und neu starten.',
			sp_kopieren: 'Befehl kopieren',
			sp_kopiert: 'Kopiert ✓',
			sp_schritt2: '2. Companion-Spielstand importieren',
			sp_laden: 'Wähle den Ordner <code>characters</code> von Companion oder ziehe ihn in das Feld. Vorhandene Charaktere werden aktualisiert.',
			sp_ordner_windows: 'Ordner unter Windows (in die Adresszeile des Auswahlfensters einfügen):',
			sp_ordner_mac: 'Ordner auf dem Mac (versteckt; im Auswahlfenster ⌘⇧G drücken und einfügen):',
			sp_ablage: 'Ordner „characters“ hierher ziehen',
			sp_ordner_waehlen: 'Companion-Ordner auswählen',
			sp_lese: 'Lese …',
			sp_gelesen: '%s Charakter(e) gelesen: %s',
			sp_nichts: 'In diesem Ordner wurde kein Charakter von LOTRO Companion gefunden. Gesucht wird ein Ordner mit summary.xml und questsStatus.xml.',
			sp_speicher_voll: 'Der Browser hat das Speichern abgelehnt (privates Fenster oder voller Speicher).',
			sp_schritt3: '3. Deine Charaktere',
			sp_spalte_name: 'Name', sp_spalte_server: 'Server', sp_spalte_klasse: 'Klasse', sp_spalte_stufe: 'Stufe',
			sp_spalte_aufgaben: 'Aufgaben', sp_spalte_taten: 'Taten', sp_spalte_stand: 'Stand vom',
			sp_keine: 'Noch kein Charakter geladen.',
			sp_aktiv: 'aktiv', sp_waehlen: 'wählen', sp_karte: 'auf der Karte', sp_entfernen: 'entfernen',
			sp_entfernen_frage: '%s aus diesem Browser entfernen?',
			sp_schritt4: '4. Ins Plugin übernehmen',
			sp_plugin: 'Das Plugin liest für jeden Charakter eine kleine Datei im Ordner <code>PluginData</code> des Spiels. Danach zeigt es oben rechts einen Knopf zum Wechseln zwischen deinen Charakteren. Neue Daten liest es, sobald du das Fenster öffnest; ein Neustart ist nicht nötig.',
			sp_schreiben: 'In den LOTRO-Ordner schreiben',
			sp_zip: 'Als Zip herunterladen',
			sp_schreiben_hinweis: 'Dein Browser kann nicht direkt in einen Ordner schreiben (das können Chrome und Edge). Lade das Zip herunter und entpacke es <strong>in</strong> den Ordner <code>PluginData</code>: Es enthält schon die richtigen Unterordner.',
			sp_plugindata: 'Der Ordner „PluginData“ liegt hier (beim Schreiben genau diesen wählen):',
			sp_plugin_windows_path: 'Dokumente\\The Lord of the Rings Online\\PluginData',
			sp_zip_fertig: 'Zip mit %s Datei(en) erstellt. In den Ordner PluginData entpacken.',
			sp_geschrieben: '%s Datei(en) geschrieben. Im Spiel das Fenster von Magic Quest Log öffnen.',
			sp_falscher_ordner: 'Im Ordner „%s“ fehlt der Kontoordner %s. Bitte genau den Ordner PluginData wählen, und das Spiel muss auf diesem Rechner schon einmal mit dem Konto gelaufen sein.',
			sp_schreiben_fehler: 'Schreiben nicht möglich. Lade stattdessen die ZIP-Datei herunter.',
			sp_nichts_fuer_plugin: 'Kein Charakter mit Konto und Server geladen.',
			sp_schritt5: '5. Sichern',
			sp_sichern: 'Eine Sicherung enthält die importierten Charaktere. Du kannst sie auf einem anderen Rechner oder nach dem Löschen der Browserdaten wieder laden.',
			sp_sicherung: 'Sicherung herunterladen',
			sp_sicherung_laden: 'Sicherung laden …',
			sp_sicherung_fertig: 'Sicherung gespeichert.',
			sp_sicherung_geladen: '%s Charakter(e) aus der Sicherung übernommen.',
			sp_sicherung_falsch: 'Das ist keine Sicherung dieser Seite.',
			sp_fragen: 'Häufige Fragen',
			sp_faq: '<details><summary>Mein Charakter fehlt in der Liste.</summary><p>Er muss erst in LOTRO Companion importiert sein. Dann den Ordner hier erneut laden.</p></details>' +
				'<details><summary>Im Plugin fehlt ein Charakter.</summary><p>Das Plugin zeigt die Charaktere des Kontos und Servers, auf dem du gerade spielst. Charaktere anderer Server erscheinen, wenn du dort spielst.</p></details>' +
				'<details><summary>Die Zahlen weichen vom Spiel ab.</summary><p>Sitzungsspiele zeichnet das Spiel nie als erledigt auf, und von zwei Aufgaben, die sich ausschließen, ist nur eine möglich. Beide zählen hier nicht mit. Wiederholbare Aufträge zählen, sobald sie einmal erledigt sind.</p></details>' +
				'<details><summary>Wie aktualisiere ich meinen Fortschritt?</summary><p>Beim Spielen erkennt das Plugin Abschlüsse selbst. Für den vollen Stand: in Companion erneut importieren, den Ordner hier erneut laden, wieder ins Plugin übernehmen.</p></details>' +
				'<details><summary>Ich sammle vor allem Taten.</summary><p>Dafür gibt es ' + DEEDTRACKER + ' von b414213562: ein ausgereiftes Plugin nur für Taten, mit LOTRO-Punkten, Tugend-Erfahrung und gleichnamigen Taten. Magic Quest Log ist vor allem für Aufgaben gedacht; beide vertragen sich.</p></details>'
		},
		en: {
			menue_karte: 'Quests',
			menue_spielstand: 'Import progress',
			charakter: 'Character',
			ohne_spielstand: 'no progress',
			kein_charakter: 'none loaded yet',
			sp_titel: 'Import progress',
			sp_einleitung: 'Import your progress from ' + COMPANION + ' for the map and the ' + PLUGIN + ' plugin. Switch between imported characters in the menu above.',
			sp_datenschutz: 'Character files are processed locally. <a href="datenschutz.html?lang=en">Privacy</a>',
			sp_schritt1: '1. Import your character in LOTRO Companion',
			sp_companion: 'LOTRO Companion reads your character’s current progress from the running game. This import requires ' + COMPANION + ' (free). Companion does not need to stay open while you play.',
			sp_windows: '<li>Start LOTRO and <strong>enter the world</strong> with your character.</li>' +
				'<li>Start LOTRO Companion.</li>' +
				'<li>Under <strong>Misc</strong> at the top, click the <strong>"Import from LOTRO…"</strong> icon.</li>' +
				'<li>In that window press <strong>Refresh</strong>, then <strong>Start</strong>. Shortly after it says <em>Import finished!</em></li>' +
				'<li>If "Start" does nothing: start Companion once with right-click → <em>Run as administrator</em>.</li>',
			sp_mac: '<li>Download Companion (the Windows version) and put the folder <code>LotRO Companion</code> into <code>Applications</code> or your own <code>Applications</code> folder.</li>' +
				'<li>Start LOTRO and <strong>enter the world</strong> with your character.</li>' +
				'<li>Open <em>Terminal</em>, paste the command below and press Return. Companion starts in the same environment as the game.</li>' +
				'<li>Under <strong>Misc</strong>, click <strong>"Import from LOTRO…"</strong>, then <strong>Refresh</strong> and <strong>Start</strong>.</li>',
			sp_mac_warnung: 'Careful: do not use "Import a character…" in the character list. It opens a file window that stays invisible on a Mac, and Companion stops responding. If that happens, quit Companion from the Dock and start it again.',
			sp_kopieren: 'Copy command',
			sp_kopiert: 'Copied ✓',
			sp_schritt2: '2. Import Companion progress',
			sp_laden: 'Choose Companion’s <code>characters</code> folder or drag it into the area below. Existing characters will be updated.',
			sp_ordner_windows: 'Folder on Windows (paste it into the address bar of the picker):',
			sp_ordner_mac: 'Folder on a Mac (hidden; press ⌘⇧G in the picker and paste):',
			sp_ablage: 'Drop the "characters" folder here',
			sp_ordner_waehlen: 'Select Companion folder',
			sp_lese: 'Reading …',
			sp_gelesen: '%s character(s) read: %s',
			sp_nichts: 'No LOTRO Companion character was found in this folder. A folder with summary.xml and questsStatus.xml is expected.',
			sp_speicher_voll: 'The browser refused to store it (private window or storage full).',
			sp_schritt3: '3. Your characters',
			sp_spalte_name: 'Name', sp_spalte_server: 'Server', sp_spalte_klasse: 'Class', sp_spalte_stufe: 'Level',
			sp_spalte_aufgaben: 'Quests', sp_spalte_taten: 'Deeds', sp_spalte_stand: 'As of',
			sp_keine: 'No character loaded yet.',
			sp_aktiv: 'active', sp_waehlen: 'choose', sp_karte: 'on the map', sp_entfernen: 'remove',
			sp_entfernen_frage: 'Remove %s from this browser?',
			sp_schritt4: '4. Export to the plugin',
			sp_plugin: 'The plugin reads one small file per character from the game\'s <code>PluginData</code> folder. It then shows a button at the top right to switch between your characters. New data is read when you open the window; no restart needed.',
			sp_schreiben: 'Write into the LOTRO folder',
			sp_zip: 'Download as zip',
			sp_schreiben_hinweis: 'Your browser cannot write into a folder directly (Chrome and Edge can). Download the zip and unpack it <strong>into</strong> the <code>PluginData</code> folder: it already contains the right subfolders.',
			sp_plugindata: 'The "PluginData" folder is here (choose exactly this one when writing):',
			sp_plugin_windows_path: 'Documents\\The Lord of the Rings Online\\PluginData',
			sp_zip_fertig: 'Zip with %s file(s) created. Unpack it into the PluginData folder.',
			sp_geschrieben: '%s file(s) written. In the game, open the Magic Quest Log window.',
			sp_falscher_ordner: 'The folder "%s" has no account folder %s. Please choose exactly the PluginData folder; the game must have run with that account on this computer before.',
			sp_schreiben_fehler: 'Could not write. Use the zip instead.',
			sp_nichts_fuer_plugin: 'No character with account and server loaded.',
			sp_schritt5: '5. Back up',
			sp_sichern: 'A backup contains your imported characters. Restore it on another computer or after clearing your browser data.',
			sp_sicherung: 'Download backup',
			sp_sicherung_laden: 'Load backup …',
			sp_sicherung_fertig: 'Backup saved.',
			sp_sicherung_geladen: '%s character(s) taken from the backup.',
			sp_sicherung_falsch: 'This is not a backup of this page.',
			sp_fragen: 'Questions',
			sp_faq: '<details><summary>My character is missing from the list.</summary><p>It has to be imported in LOTRO Companion first. Then load the folder here again.</p></details>' +
				'<details><summary>A character is missing in the plugin.</summary><p>The plugin shows the characters of the account and server you are playing on. Characters of other servers appear when you play there.</p></details>' +
				'<details><summary>The numbers differ from the game.</summary><p>The game does not record session plays as completed. A quest ruled out by completing an alternative is also excluded from the total. Repeatable quests count after their first completion.</p></details>' +
				'<details><summary>How do I update my progress?</summary><p>While you play, the plugin notices completions by itself. For the full picture: import again in Companion, load the folder here again, hand it to the plugin again.</p></details>' +
				'<details><summary>I mostly collect deeds.</summary><p>Then have a look at ' + DEEDTRACKER + ' by b414213562: a mature plugin just for deeds, with LOTRO points, virtue experience and identically named deeds. Magic Quest Log is mainly about quests; both work side by side.</p></details>'
		},
		fr: {
			menue_karte: 'Quêtes',
			menue_spielstand: 'Importer la progression',
			charakter: 'Personnage',
			ohne_spielstand: 'sans progression',
			kein_charakter: 'aucun chargé',
			sp_titel: 'Importer la progression',
			sp_einleitung: 'Importez votre progression depuis ' + COMPANION + ' pour la carte et le plugin ' + PLUGIN + '. Passez ensuite d’un personnage importé à l’autre dans le menu.',
			sp_datenschutz: 'Les fichiers des personnages sont traités localement. <a href="datenschutz.html?lang=fr">Confidentialité</a>',
			sp_schritt1: '1. Importer le personnage dans LOTRO Companion',
			sp_companion: 'LOTRO Companion lit la progression actuelle de votre personnage dans le jeu en cours. Cet import nécessite ' + COMPANION + ' (gratuit). Companion n’a pas besoin de rester ouvert pendant que vous jouez.',
			sp_windows: '<li>Lancer LOTRO et <strong>entrer dans le monde</strong> avec le personnage.</li>' +
				'<li>Lancer LOTRO Companion.</li>' +
				'<li>Sous <strong>Divers</strong>, cliquer sur l\'icône <strong>« Import from LOTRO… »</strong>.</li>' +
				'<li>Dans la fenêtre : <strong>Refresh</strong>, puis <strong>Start</strong>. Peu après s\'affiche <em>Import finished!</em></li>' +
				'<li>Si « Start » ne fait rien : lancer Companion une fois avec clic droit → <em>Exécuter en tant qu\'administrateur</em>.</li>',
			sp_mac: '<li>Télécharger Companion (la version Windows) et placer le dossier <code>LotRO Companion</code> dans <code>Applications</code> ou dans votre propre dossier <code>Applications</code>.</li>' +
				'<li>Lancer LOTRO et <strong>entrer dans le monde</strong> avec le personnage.</li>' +
				'<li>Ouvrir <em>Terminal</em>, coller la commande ci-dessous et appuyer sur Entrée. Companion démarre dans le même environnement que le jeu.</li>' +
				'<li>Sous <strong>Divers</strong>, cliquer sur <strong>« Import from LOTRO… »</strong>, puis <strong>Refresh</strong> et <strong>Start</strong>.</li>',
			sp_mac_warnung: 'Attention : ne pas utiliser « Import a character… » dans la liste des personnages. Il ouvre une fenêtre de fichiers invisible sur Mac, et Companion ne répond plus. Dans ce cas, quitter Companion depuis le Dock et le relancer.',
			sp_kopieren: 'Copier la commande',
			sp_kopiert: 'Copié ✓',
			sp_schritt2: '2. Importer la progression Companion',
			sp_laden: 'Choisissez le dossier <code>characters</code> de Companion ou glissez-le dans la zone ci-dessous. Les personnages déjà présents seront mis à jour.',
			sp_ordner_windows: 'Dossier sous Windows (à coller dans la barre d\'adresse du sélecteur) :',
			sp_ordner_mac: 'Dossier sur Mac (masqué ; dans le sélecteur, ⌘⇧G puis coller) :',
			sp_ablage: 'Glisser le dossier « characters » ici',
			sp_ordner_waehlen: 'Choisir le dossier Companion',
			sp_lese: 'Lecture …',
			sp_gelesen: '%s personnage(s) lu(s) : %s',
			sp_nichts: 'Aucun personnage de LOTRO Companion trouvé dans ce dossier. Un dossier avec summary.xml et questsStatus.xml est attendu.',
			sp_speicher_voll: 'Le navigateur a refusé l\'enregistrement (fenêtre privée ou stockage plein).',
			sp_schritt3: '3. Vos personnages',
			sp_spalte_name: 'Nom', sp_spalte_server: 'Serveur', sp_spalte_klasse: 'Classe', sp_spalte_stufe: 'Niveau',
			sp_spalte_aufgaben: 'Quêtes', sp_spalte_taten: 'Prouesses', sp_spalte_stand: 'Date',
			sp_keine: 'Aucun personnage chargé.',
			sp_aktiv: 'actif', sp_waehlen: 'choisir', sp_karte: 'sur la carte', sp_entfernen: 'supprimer',
			sp_entfernen_frage: 'Supprimer %s de ce navigateur ?',
			sp_schritt4: '4. Transmettre au plugin',
			sp_plugin: 'Le plugin lit un petit fichier par personnage dans le dossier <code>PluginData</code> du jeu. Il affiche ensuite un bouton en haut à droite pour passer d\'un personnage à l\'autre. Les nouvelles données sont lues à l\'ouverture de la fenêtre ; pas besoin de redémarrer.',
			sp_schreiben: 'Écrire dans le dossier de LOTRO',
			sp_zip: 'Télécharger en zip',
			sp_schreiben_hinweis: 'Votre navigateur ne peut pas écrire directement dans un dossier (Chrome et Edge le peuvent). Téléchargez le zip et décompressez-le <strong>dans</strong> le dossier <code>PluginData</code> : il contient déjà les bons sous-dossiers.',
			sp_plugindata: 'Le dossier « PluginData » se trouve ici (choisir exactement celui-ci) :',
			sp_plugin_windows_path: 'Documents\\The Lord of the Rings Online\\PluginData',
			sp_zip_fertig: 'Zip de %s fichier(s) créé. À décompresser dans le dossier PluginData.',
			sp_geschrieben: '%s fichier(s) écrit(s). Dans le jeu, ouvrez la fenêtre de Magic Quest Log.',
			sp_falscher_ordner: 'Le dossier « %s » ne contient pas le dossier de compte %s. Choisissez exactement le dossier PluginData ; le jeu doit déjà avoir tourné avec ce compte sur cet ordinateur.',
			sp_schreiben_fehler: 'Écriture impossible. Utilisez le zip.',
			sp_nichts_fuer_plugin: 'Aucun personnage avec compte et serveur chargé.',
			sp_schritt5: '5. Sauvegarder',
			sp_sichern: 'Une sauvegarde contient vos personnages importés. Vous pouvez la restaurer sur un autre ordinateur ou après avoir effacé les données du navigateur.',
			sp_sicherung: 'Télécharger la sauvegarde',
			sp_sicherung_laden: 'Charger une sauvegarde …',
			sp_sicherung_fertig: 'Sauvegarde enregistrée.',
			sp_sicherung_geladen: '%s personnage(s) repris de la sauvegarde.',
			sp_sicherung_falsch: 'Ce n\'est pas une sauvegarde de cette page.',
			sp_fragen: 'Questions fréquentes',
			sp_faq: '<details><summary>Mon personnage n\'apparaît pas.</summary><p>Il doit d\'abord être importé dans LOTRO Companion. Rechargez ensuite le dossier ici.</p></details>' +
				'<details><summary>Un personnage manque dans le plugin.</summary><p>Le plugin affiche les personnages du compte et du serveur sur lequel vous jouez. Ceux d\'autres serveurs apparaissent quand vous y jouez.</p></details>' +
				'<details><summary>Les chiffres diffèrent du jeu.</summary><p>Les jeux de session ne sont pas enregistrés comme terminés. Une quête exclue par l’accomplissement d’une autre n’entre pas non plus dans le total. Les quêtes répétables comptent après leur premier accomplissement.</p></details>' +
				'<details><summary>Comment mettre à jour ma progression ?</summary><p>En jouant, le plugin remarque lui-même les quêtes terminées. Pour l\'état complet : réimporter dans Companion, recharger le dossier ici, retransmettre au plugin.</p></details>' +
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
