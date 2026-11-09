/* Texts of the Companion guide page, in three languages. Merged into
 * window.MQL_TEXTE by texte.js. Only our own wording; markup is trusted.
 */
(function () {
	'use strict';
	var COMPANION = '<a href="https://sourceforge.net/projects/lotrocompanion/" target="_blank" rel="noopener">LOTRO Companion</a>';

	var zusatz = {
		de: {
			cp_titel: 'Spielstand mit LOTRO Companion auslesen',
			cp_einleitung: 'Damit dein Logbuch weiß, welche Abenteuer hinter dir liegen, brauchst du Hilfe von LOTRO Companion. Das kostenlose Programm übernimmt Aufgaben, Taten, Ruf und Handwerk aus dem laufenden Spiel. Hier geht es Schritt für Schritt zu deinem Spielstand.',
			cp_brauchst: '<li>' + COMPANION + ' – kostenlos, kein Konto nötig.</li>' +
				'<li>LOTRO läuft, und dein Charakter steht <strong>in der Welt</strong>. Im Charakterauswahl-Bildschirm liest Companion nichts.</li>' +
				'<li>Zeit: der erste Durchlauf dauert ein paar Minuten, später deutlich weniger.</li>',
			cp_schritt1: '1. Companion starten',
			cp_windows: '<li>Das Zip entpacken und <code>LotRO Companion.exe</code> starten.</li>',
			cp_mac: '<li>Lade die Windows-Version von Companion herunter und entpacke die ZIP-Datei. Lege den entpackten Ordner unter dem Namen <code>LotRO Companion</code> in <code>Programme</code> ab. Du kannst auch den Ordner <code>Programme</code> in deinem Benutzerordner verwenden.</li>' +
				'<li>Zum Starten nutzt Companion deine LOTRO-Installation. Klicke unten auf <strong>„Befehl kopieren“</strong>. Drücke <strong>⌘ Leertaste</strong>, suche nach <strong>Terminal</strong> und öffne es mit Return.</li>' +
				'<li>Füge den Befehl mit <strong>⌘V</strong> ein und drücke Return. Companion startet. Du brauchst den Befehl nicht anzupassen.</li>',
			cp_mac_warnung: 'Nimm für den Spielstand den Knopf „Importieren von HdRO…“ unter Sonstiges (englisch: „Import from LOTRO…“). Der ähnlich benannte Knopf „Import a character…“ in der Charakterliste kann Companion auf dem Mac blockieren. Falls das passiert, beende Companion im Dock und starte es erneut.',
			cp_kopieren: 'Befehl kopieren',
			cp_kopiert: 'Kopiert ✓',
			cp_schritt2: '2. Beim ersten Mal: LOTRO finden',
			cp_pfad: 'Companion muss wissen, wo LOTRO installiert ist. Meist findet es das Spiel selbst. Prüfe unter <strong>Sonstiges → Einstellungen</strong> den angegebenen LOTRO-Ordner. Falls er nicht stimmt, wähle den Ordner <code>The Lord of the Rings Online</code> aus und bestätige mit OK.',
			cp_schritt3: '3. Den Charakter auslesen',
			cp_auslesen: '<li>In LOTRO mit dem Charakter die Welt betreten.</li>' +
				'<li>In Companion unter <strong>Sonstiges</strong> auf <strong>„Importieren von HdRO…“</strong> klicken – in der englischen Oberfläche heißt der Knopf <em>Import from LOTRO…</em>.</li>' +
				'<li>Im Fenster <strong>Refresh</strong>, dann <strong>Start</strong>.</li>' +
				'<li>Warten, bis dort <em>Import finished!</em> steht. Bei vielen Taten dauert das einen Moment.</li>',
			cp_bild1: 'Sonstiges in Companion: der Stiefel mit dem grünen Pfeil öffnet den Import.',
			cp_admin: 'Passiert bei <em>Start</em> nichts: Companion einmal mit Rechtsklick → <em>Als Administrator ausführen</em> starten.',
			cp_schritt4: '4. Deinen Spielstand finden',
			cp_dateien: 'Dein Spielstand liegt jetzt im Companion-Ordner <code>characters</code>. Diesen wählst du gleich auf der Importseite aus. Hier findest du ihn:',
			cp_pfad_windows: 'Windows: <code>%USERPROFILE%\\.lotrocompanion\\data\\characters</code>',
			cp_pfad_mac: 'Auf dem Mac: Drücke im Fenster zur Ordnerauswahl <strong>⌘⇧G</strong>, füge diese Adresse ein und drücke Return. Bestätige anschließend die Auswahl: <code>~/Applications/The Lord of the Rings Online.app/Contents/SharedSupport/prefix/drive_c/users/Wineskin/.lotrocompanion/data/characters</code>',
			cp_schritt5: '5. Zurück zur Importseite',
			cp_import: 'Auf der <a data-ziel="spielstand.html" href="spielstand.html?lang=de">Importseite</a> den Ordner <code>characters</code> wählen. Dein Fortschritt liegt danach nur in deinem Browser; nichts wird hochgeladen.',
			cp_mehrere: 'Du reist mit mehreren Charakteren durch Mittelerde? Melde dich nacheinander mit jedem im Spiel an und wiederhole Schritt 3. Wähle danach den Ordner auf der Importseite erneut aus. Bekannte Charaktere werden aktualisiert, nicht doppelt angelegt.',
			cp_wiederholen: 'Neuer Stand: Schritt 3 wiederholen und den Ordner erneut laden. Beim Spielen erkennt das Plugin Abschlüsse zusätzlich selbst.',
			cp_fragen: 'Wenn es klemmt',
			cp_faq: '<details><summary>Mein Charakter fehlt in Companion.</summary><p>Melde dich mit diesem Charakter im Spiel an und betrete die Welt. Wiederhole dann Schritt 3 in Companion.</p></details>' +
				'<details><summary>Start tut nichts.</summary><p>Companion einmal als Administrator starten. Unter Windows: Rechtsklick auf das Programm → <em>Als Administrator ausführen</em>.</p></details>' +
				'<details><summary>Auf dem Mac reagiert Companion nicht mehr.</summary><p>Dann wurde „Import a character…“ benutzt. Companion im Dock beenden und über den Befehl neu starten.</p></details>' +
				'<details><summary>Die Zahlen weichen vom Spiel ab.</summary><p>Sitzungsspiele zählt das Spiel nie als erledigt; von zwei Aufgaben, die sich ausschließen, ist nur eine möglich. Beides erklärt die <a data-ziel="spielstand.html" href="spielstand.html?lang=de">Importseite</a> genauer.</p></details>',
			cp_weiter: 'Zur Importseite'
		},
		en: {
			cp_titel: 'Read your progress with LOTRO Companion',
			cp_einleitung: 'To bring your adventures into the log book, you need a little help from LOTRO Companion. This free program reads quests, deeds, reputation and crafting while the game is running. Follow the steps below to get your progress ready.',
			cp_brauchst: '<li>' + COMPANION + ' – free, no account needed.</li>' +
				'<li>LOTRO is running and your character is <strong>in the world</strong>. Companion reads nothing on the character selection screen.</li>' +
				'<li>Time: the first run takes a few minutes, later ones are much quicker.</li>',
			cp_schritt1: '1. Start Companion',
			cp_windows: '<li>Unpack the zip and start <code>LotRO Companion.exe</code>.</li>',
			cp_mac: '<li>Download the Windows version of Companion and unpack the ZIP file. Name the unpacked folder <code>LotRO Companion</code> and place it in <code>Applications</code>. You can also use the <code>Applications</code> folder inside your home folder.</li>' +
				'<li>Companion uses your LOTRO installation to start. Click <strong>“Copy command”</strong> below. Press <strong>⌘ Space</strong>, search for <strong>Terminal</strong> and press Return to open it.</li>' +
				'<li>Paste the command with <strong>⌘V</strong> and press Return. Companion starts. You do not need to edit the command.</li>',
			cp_mac_warnung: 'Use “Import from LOTRO…” under Misc for your progress. The similarly named “Import a character…” button in the character list can make Companion stop responding on a Mac. If that happens, quit it from the Dock and start it again.',
			cp_kopieren: 'Copy command',
			cp_kopiert: 'Copied ✓',
			cp_schritt2: '2. First time only: find LOTRO',
			cp_pfad: 'Companion needs to know where LOTRO is installed. It usually finds the game by itself. Check the LOTRO folder under <strong>Misc → Settings</strong>. If it is wrong, select the <code>The Lord of the Rings Online</code> folder and confirm with OK.',
			cp_schritt3: '3. Read the character',
			cp_auslesen: '<li>Enter the world in LOTRO with your character.</li>' +
				'<li>In Companion, click <strong>“Import from LOTRO…”</strong> under <strong>Misc</strong> (German interface: <em>Importieren von HdRO…</em>).</li>' +
				'<li>In that window press <strong>Refresh</strong>, then <strong>Start</strong>.</li>' +
				'<li>Wait until it says <em>Import finished!</em>. With many deeds that takes a moment.</li>',
			cp_bild1: 'The Sonstiges (Misc) box in Companion: the boot with the green arrow opens the import.',
			cp_admin: 'If nothing happens on <em>Start</em>: start Companion once with right-click → <em>Run as administrator</em>.',
			cp_schritt4: '4. Find your progress',
			cp_dateien: 'Your progress is now in Companion’s <code>characters</code> folder. This is the folder to select on the import page. Find it here:',
			cp_pfad_windows: 'Windows: <code>%USERPROFILE%\\.lotrocompanion\\data\\characters</code>',
			cp_pfad_mac: 'On a Mac: in the folder selection window, press <strong>⌘⇧G</strong>, paste this address and press Return. Then confirm your selection: <code>~/Applications/The Lord of the Rings Online.app/Contents/SharedSupport/prefix/drive_c/users/Wineskin/.lotrocompanion/data/characters</code>',
			cp_schritt5: '5. Back to the import page',
			cp_import: 'Choose the <code>characters</code> folder on the <a data-ziel="spielstand.html" href="spielstand.html?lang=en">import page</a>. Your progress then stays in your browser only; nothing is uploaded.',
			cp_mehrere: 'Travelling through Middle-earth with more than one character? Log in with each one in turn and repeat step 3. Then select the folder again on the import page. Existing characters are updated, not added twice.',
			cp_wiederholen: 'New progress: repeat step 3 and load the folder again. While you play, the plugin also notices completions by itself.',
			cp_fragen: 'If something is stuck',
			cp_faq: '<details><summary>My character is missing in Companion.</summary><p>Log into the game with that character and enter the world. Then repeat step 3 in Companion.</p></details>' +
				'<details><summary>Start does nothing.</summary><p>Run Companion as administrator once. On Windows: right-click the program → <em>Run as administrator</em>.</p></details>' +
				'<details><summary>On a Mac Companion stops responding.</summary><p>That means “Import a character…” was used. Quit Companion from the Dock and start it again with the command.</p></details>' +
				'<details><summary>The numbers differ from the game.</summary><p>The game never records session plays as completed, and of two mutually exclusive quests only one is possible. The <a data-ziel="spielstand.html" href="spielstand.html?lang=en">import page</a> explains both in more detail.</p></details>',
			cp_weiter: 'To the import page'
		},
		fr: {
			cp_titel: 'Lire la progression avec LOTRO Companion',
			cp_einleitung: 'Pour retrouver vos aventures dans le journal, il vous faut un peu d’aide de LOTRO Companion. Ce logiciel gratuit lit les quêtes, prouesses, réputations et métiers pendant que le jeu est lancé. Suivez les étapes pour préparer votre progression.',
			cp_brauchst: '<li>' + COMPANION + ' – gratuit, sans compte.</li>' +
				'<li>LOTRO est lancé et votre personnage se trouve <strong>dans le monde</strong>. Companion ne lit rien sur l’écran de sélection des personnages.</li>' +
				'<li>Durée : la première fois quelques minutes, ensuite beaucoup moins.</li>',
			cp_schritt1: '1. Lancer Companion',
			cp_windows: '<li>Décompressez le zip et lancez <code>LotRO Companion.exe</code>.</li>',
			cp_mac: '<li>Téléchargez la version Windows de Companion et décompressez le fichier ZIP. Nommez le dossier obtenu <code>LotRO Companion</code> et placez-le dans <code>Applications</code>. Vous pouvez aussi utiliser le dossier <code>Applications</code> de votre dossier personnel.</li>' +
				'<li>Companion utilise votre installation de LOTRO pour démarrer. Cliquez ci-dessous sur <strong>« Copier la commande »</strong>. Appuyez sur <strong>⌘ Espace</strong>, cherchez <strong>Terminal</strong> et ouvrez-le avec Entrée.</li>' +
				'<li>Collez la commande avec <strong>⌘V</strong> et appuyez sur Entrée. Companion démarre. Vous n’avez pas besoin de modifier la commande.</li>',
			cp_mac_warnung: 'Pour votre progression, utilisez « Import from LOTRO… » sous Divers. Le bouton au nom proche « Import a character… » dans la liste des personnages peut bloquer Companion sur Mac. Si cela arrive, quittez Companion depuis le Dock, puis relancez-le.',
			cp_kopieren: 'Copier la commande',
			cp_kopiert: 'Copié ✓',
			cp_schritt2: '2. La première fois : trouver LOTRO',
			cp_pfad: 'Companion doit savoir où LOTRO est installé. Il trouve généralement le jeu tout seul. Vérifiez le dossier de LOTRO sous <strong>Divers → Réglages</strong>. S’il est incorrect, choisissez le dossier <code>The Lord of the Rings Online</code> et validez avec OK.',
			cp_schritt3: '3. Lire le personnage',
			cp_auslesen: '<li>Entrez dans le monde dans LOTRO avec votre personnage.</li>' +
				'<li>Dans Companion, cliquez sur <strong>« Import from LOTRO… »</strong> sous <strong>Divers</strong> (interface allemande : <em>Importieren von HdRO…</em>).</li>' +
				'<li>Dans la fenêtre : <strong>Refresh</strong>, puis <strong>Start</strong>.</li>' +
				'<li>Attendez <em>Import finished!</em>. Avec beaucoup de prouesses, cela prend un moment.</li>',
			cp_bild1: 'La zone Sonstiges (Divers) dans Companion : la botte à la flèche verte ouvre l’import.',
			cp_admin: 'Si <em>Start</em> ne fait rien : lancez Companion une fois avec clic droit → <em>Exécuter en tant qu’administrateur</em>.',
			cp_schritt4: '4. Retrouver votre progression',
			cp_dateien: 'Votre progression se trouve maintenant dans le dossier <code>characters</code> de Companion. C’est ce dossier que vous choisirez sur la page d’import. Voici où le trouver :',
			cp_pfad_windows: 'Windows : <code>%USERPROFILE%\\.lotrocompanion\\data\\characters</code>',
			cp_pfad_mac: 'Sur Mac : dans la fenêtre de sélection du dossier, appuyez sur <strong>⌘⇧G</strong>, collez cette adresse et appuyez sur Entrée. Confirmez ensuite votre choix : <code>~/Applications/The Lord of the Rings Online.app/Contents/SharedSupport/prefix/drive_c/users/Wineskin/.lotrocompanion/data/characters</code>',
			cp_schritt5: '5. Retour à la page d’import',
			cp_import: 'Choisissez le dossier <code>characters</code> sur la <a data-ziel="spielstand.html" href="spielstand.html?lang=fr">page d’import</a>. Votre progression reste ensuite dans votre navigateur ; rien n’est envoyé.',
			cp_mehrere: 'Vous parcourez la Terre du Milieu avec plusieurs personnages ? Connectez-vous avec chacun à tour de rôle et répétez l’étape 3. Choisissez ensuite à nouveau le dossier sur la page d’import. Les personnages connus sont mis à jour, sans être ajoutés deux fois.',
			cp_wiederholen: 'Nouvelle progression : répétez l’étape 3 et rechargez le dossier. En jouant, le plugin remarque aussi les accomplissements.',
			cp_fragen: 'Si cela bloque',
			cp_faq: '<details><summary>Mon personnage manque dans Companion.</summary><p>Connectez-vous avec ce personnage en jeu et entrez dans le monde. Répétez ensuite l’étape 3 dans Companion.</p></details>' +
				'<details><summary>Start ne fait rien.</summary><p>Lancez Companion une fois en tant qu’administrateur. Sous Windows : clic droit sur le programme → <em>Exécuter en tant qu’administrateur</em>.</p></details>' +
				'<details><summary>Sur Mac, Companion ne répond plus.</summary><p>« Import a character… » a été utilisé. Quittez Companion depuis le Dock et relancez-le avec la commande.</p></details>' +
				'<details><summary>Les chiffres diffèrent du jeu.</summary><p>Le jeu n’enregistre jamais les jeux de session comme terminés, et sur deux quêtes exclusives une seule est possible. La <a data-ziel="spielstand.html" href="spielstand.html?lang=fr">page d’import</a> explique les deux cas.</p></details>',
			cp_weiter: 'Vers la page d’import'
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
