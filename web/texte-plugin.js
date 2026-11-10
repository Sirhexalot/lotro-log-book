/* Texts of the plugin page, in three languages. Merged into window.MQL_TEXTE
 * by texte.js. Only our own wording; markup is trusted.
 */
(function () {
	'use strict';
	var COMPANION = '<a href="https://sourceforge.net/projects/lotrocompanion/" target="_blank" rel="noopener">LOTRO Companion</a>';

	var zusatz = {
		de: {
			pl_titel: 'Plugin fürs Spiel',
			pl_einleitung: 'Dein Logbuch darf mit auf die Reise: Magic Quest Log zeigt Aufgaben, Taten und deinen Fortschritt direkt in LOTRO. Das Plugin ist eine freiwillige Ergänzung. Diese Website kannst du auch ohne nutzen.',
			pl_was: '<li>Finde Aufgaben nach Landschaft und die epische Geschichte nach Band und Buch. Auch Feste, Handwerk, Instanzen und Missionen sind dabei.</li>' +
				'<li>Beschreibung, Schritte und Ziele – die Ziele erst nach einem Klick, damit nichts verraten wird.</li>' +
				'<li>Dein Fortschritt je Charakter, oben rechts im Fenster umschaltbar.</li>' +
				'<li>Zeige bekannte Standorte mit einem Klick in MoorMap an.</li>',
			pl_download_titel: '1. Herunterladen',
			pl_download: 'Das Plugin liegt bei LOTROInterface, kostenlos und ohne Anmeldung. Nimm die aktuelle Version.',
			pl_download_knopf: 'Magic Quest Log bei LOTROInterface',
			pl_install_titel: '2. Installieren',
			pl_install: '<li>Zip entpacken, sodass <code>MagicQuestLog</code> als Ordner in <code>Dokumente\\The Lord of the Rings Online\\Plugins</code> liegt.</li>' +
				'<li>Im Spiel <code>/zusatzmodule refresh</code> – im englischen Client heißt der Befehl <code>/plugins refresh</code>.</li>' +
				'<li>Mit <code>/mql</code> öffnen.</li>',
			pl_neustart: 'Wenn du das Plugin entladen hast, starte LOTRO neu, bevor du es wieder lädst.',
			pl_fortschritt_titel: '3. Fortschritt übernehmen',
			pl_fortschritt: 'Importiere zuerst deinen Spielstand auf der <a data-ziel="spielstand.html" href="/de/spielstand/">Importseite</a>. Speichere ihn dann mit einem der Knöpfe unten für das Plugin. Öffne anschließend das Fenster von Magic Quest Log im Spiel. Du siehst deinen Fortschritt und kannst oben rechts zwischen deinen Charakteren wechseln. Für einen aktualisierten Spielstand musst du LOTRO nicht neu starten.',
			pl_schreiben: 'In den LOTRO-Ordner schreiben',
			pl_zip: 'Als Zip herunterladen',
			pl_hinweis: 'Dein Browser kann nicht direkt in einen Ordner schreiben (das können Chrome und Edge). Lade das Zip herunter und entpacke es <strong>in</strong> den Ordner <code>PluginData</code>: Es enthält schon die richtigen Unterordner.',
			pl_plugindata: 'Der Ordner „PluginData“ liegt hier (beim Schreiben genau diesen wählen):',
			pl_plugin_windows_path: 'Dokumente\\The Lord of the Rings Online\\PluginData',
			pl_zip_fertig: 'Zip mit %s Datei(en) erstellt. In den Ordner PluginData entpacken.',
			pl_geschrieben: '%s Datei(en) geschrieben. Im Spiel das Fenster von Magic Quest Log öffnen.',
			pl_falscher_ordner: 'Im Ordner „%s“ fehlt der Kontoordner %s. Bitte genau den Ordner PluginData wählen, und das Spiel muss auf diesem Rechner schon einmal mit dem Konto gelaufen sein.',
			pl_schreiben_fehler: 'Schreiben nicht möglich. Lade stattdessen die ZIP-Datei herunter.',
			pl_nichts: 'Für die Übernahme ins Plugin fehlen Charakter, Konto oder Server. Importiere zuerst deinen Spielstand aus Companion.',
			pl_ohne: 'Noch kein Charakter im Browser:',
			pl_weiter: 'Mehr zum Plugin'
		},
		en: {
			pl_titel: 'Plugin for the game',
			pl_einleitung: 'Take your log book on the road: Magic Quest Log shows quests, deeds and your progress inside LOTRO. The plugin is an optional companion. You can use this website without it.',
			pl_was: '<li>Find quests by region and follow the epic story by volume and book. Festivals, crafting, instances and missions are included too.</li>' +
				'<li>Description, steps and objectives – objectives only after a click, so nothing is given away.</li>' +
				'<li>Your progress per character, switched at the top right of the window.</li>' +
				'<li>Show known locations in MoorMap with a click.</li>',
			pl_download_titel: '1. Download',
			pl_download: 'The plugin lives on LOTROInterface, free and without an account. Take the current version.',
			pl_download_knopf: 'Magic Quest Log on LOTROInterface',
			pl_install_titel: '2. Install',
			pl_install: '<li>Unpack the zip so that <code>MagicQuestLog</code> sits as a folder inside <code>Documents\\The Lord of the Rings Online\\Plugins</code>.</li>' +
				'<li>In the game, <code>/plugins refresh</code>.</li>' +
				'<li>Open it with <code>/mql</code>.</li>',
			pl_neustart: 'If you have unloaded the plugin, restart LOTRO before loading it again.',
			pl_fortschritt_titel: '3. Hand over your progress',
			pl_fortschritt: 'First import your progress on the <a data-ziel="spielstand.html" href="/en/progress/">import page</a>. Then use one of the buttons below to save it for the plugin. Open Magic Quest Log in game to see your progress and switch characters at the top right. Updating your progress does not require restarting LOTRO.',
			pl_schreiben: 'Write into the LOTRO folder',
			pl_zip: 'Download as zip',
			pl_hinweis: 'Your browser cannot write into a folder directly (Chrome and Edge can). Download the zip and unpack it <strong>into</strong> the <code>PluginData</code> folder: it already contains the right subfolders.',
			pl_plugindata: 'The "PluginData" folder is here (choose exactly this one when writing):',
			pl_plugin_windows_path: 'Documents\\The Lord of the Rings Online\\PluginData',
			pl_zip_fertig: 'Zip with %s file(s) created. Unpack it into the PluginData folder.',
			pl_geschrieben: '%s file(s) written. In the game, open the Magic Quest Log window.',
			pl_falscher_ordner: 'The folder "%s" has no account folder %s. Please choose exactly the PluginData folder; the game must have run with that account on this computer before.',
			pl_schreiben_fehler: 'Could not write. Use the zip instead.',
			pl_nichts: 'A character, account or server is missing for the plugin. Import your progress from Companion first.',
			pl_ohne: 'No character in this browser yet:',
			pl_weiter: 'More about the plugin'
		},
		fr: {
			pl_titel: 'Plugin pour le jeu',
			pl_einleitung: 'Emportez votre journal en voyage : Magic Quest Log affiche quêtes, prouesses et progression directement dans LOTRO. Ce plugin est un compagnon facultatif. Vous pouvez utiliser le site sans lui.',
			pl_was: '<li>Retrouvez les quêtes par région et suivez l’histoire épique par volume et par livre. Fêtes, artisanat, instances et missions sont aussi au rendez-vous.</li>' +
				'<li>Description, étapes et objectifs – les objectifs seulement après un clic, pour ne rien dévoiler.</li>' +
				'<li>Votre progression par personnage, à changer en haut à droite de la fenêtre.</li>' +
				'<li>Affichez les lieux connus dans MoorMap en un clic.</li>',
			pl_download_titel: '1. Télécharger',
			pl_download: 'Le plugin se trouve sur LOTROInterface, gratuitement et sans compte. Prenez la version actuelle.',
			pl_download_knopf: 'Magic Quest Log sur LOTROInterface',
			pl_install_titel: '2. Installer',
			pl_install: '<li>Décompressez le zip pour que <code>MagicQuestLog</code> soit un dossier dans <code>Documents\\The Lord of the Rings Online\\Plugins</code>.</li>' +
				'<li>Dans le jeu : <code>/plugins refresh</code>.</li>' +
				'<li>Ouvrez-le avec <code>/mql</code>.</li>',
			pl_neustart: 'Si vous avez déchargé le plugin, redémarrez LOTRO avant de le charger à nouveau.',
			pl_fortschritt_titel: '3. Transmettre la progression',
			pl_fortschritt: 'Importez d’abord votre progression sur la <a data-ziel="spielstand.html" href="/fr/progression/">page d’import</a>. Utilisez ensuite un des boutons ci-dessous pour l’enregistrer pour le plugin. Ouvrez Magic Quest Log en jeu pour voir votre progression et changer de personnage en haut à droite. Une mise à jour de votre progression ne demande pas de redémarrer LOTRO.',
			pl_schreiben: 'Écrire dans le dossier de LOTRO',
			pl_zip: 'Télécharger en zip',
			pl_hinweis: 'Votre navigateur ne peut pas écrire directement dans un dossier (Chrome et Edge le peuvent). Téléchargez le zip et décompressez-le <strong>dans</strong> le dossier <code>PluginData</code> : il contient déjà les bons sous-dossiers.',
			pl_plugindata: 'Le dossier « PluginData » se trouve ici (choisir exactement celui-ci) :',
			pl_plugin_windows_path: 'Documents\\The Lord of the Rings Online\\PluginData',
			pl_zip_fertig: 'Zip de %s fichier(s) créé. À décompresser dans le dossier PluginData.',
			pl_geschrieben: '%s fichier(s) écrit(s). Dans le jeu, ouvrez la fenêtre de Magic Quest Log.',
			pl_falscher_ordner: 'Le dossier « %s » ne contient pas le dossier de compte %s. Choisissez exactement le dossier PluginData ; le jeu doit déjà avoir tourné avec ce compte sur cet ordinateur.',
			pl_schreiben_fehler: 'Écriture impossible. Utilisez le zip.',
			pl_nichts: 'Il manque un personnage, un compte ou un serveur pour le plugin. Importez d’abord votre progression depuis Companion.',
			pl_ohne: 'Aucun personnage dans ce navigateur :',
			pl_weiter: 'En savoir plus sur le plugin'
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
