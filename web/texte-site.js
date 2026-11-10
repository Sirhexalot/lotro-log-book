/* Shared page labels and the concise privacy notice. Own text, never user data. */
(function () {
	'use strict';
	var texte = {
		de: {
			menue_sets: 'Sets', d_sets: 'Zusammengehörige Ausrüstung und ihre Setboni',
			menue_auftraggeber: 'Auftraggeber', d_auftraggeber: 'Wer welche Aufgaben vergibt',
			menue_landmarken: 'Landmarken', d_landmarken: 'Sehenswürdigkeiten mit ihren Aufgaben',
			menue_fraktionen: 'Fraktionen', d_fraktionen: 'Ruf, Stufen und Quellen',
			hw_filter: 'Filter', hw_zuruecksetzen: 'Zurücksetzen', hw_kategorie: 'Kategorie', hw_alle_kategorien: 'Alle Kategorien', hw_mehr: 'Weitere Rezepte', hw_weitere_angaben: 'Weitere Angaben', hw_sort: 'Sortierung', hw_sort_name: 'Name', hw_sort_stufe: 'Stufe',
			nav_menu: 'Menü', nav_sprache: 'Sprache', nav_filter: 'Fortschritt filtern', nav_karten: 'Karten',
			footer_recht: 'Impressum', footer_datenschutz: 'Datenschutz',
			ds_titel: 'Datenschutz', ds_verantwortlich: 'Verantwortlicher',
			ds_kontakt: 'Adrian Schmolzi, Happurger Straße 62, 90482 Nürnberg, Deutschland. Kontakt: <a href="mailto:llb@sirhexalot.de">llb@sirhexalot.de</a>.',
			ds_lokal_titel: 'Import und Einstellungen',
			ds_lokal: 'Importierte Charakterdaten und Einstellungen werden lokal im Browser gespeichert und nicht an unseren Server oder GoatCounter übertragen. Du kannst Charaktere auf der Importseite und alle gespeicherten Daten über die Browsereinstellungen löschen. Die Speicherung dient den von dir gewählten Funktionen (§ 25 Abs. 2 Nr. 2 TDDDG).',
			ds_host_titel: 'Bereitstellung der Website',
			ds_host: 'Hoster ist Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, Deutschland. Für Betrieb und Sicherheit verarbeitet der Hoster IP-Adresse, Zeitpunkt, angeforderte Seite und Browserangaben. Nach Angaben von Hetzner werden IP-Adressen in Webhosting-Protokollen anonymisiert; die voreingestellte Löschfrist beträgt sieben Tage und ist konfigurierbar. <a href="https://docs.hetzner.com/general/company-and-policy/data-protection-at-hetzner/">Informationen des Hosters</a>. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.',
			ds_stat_titel: 'Besuchsstatistik',
			ds_stat: 'Für die Besuchsstatistik verbindet sich dein Browser mit gc.zgo.at und sirhexalot.goatcounter.com (GoatCounter, Martin Tournoij, Irland; Server in Deutschland und Finnland). Erfasst werden Aufrufe, Verweisquellen, Browser, System, Sprache, Bildschirmbreite und Land. Keine Cookies, keine Verknüpfung mit Charakterdaten. Laut Anbieter bleiben IP-Adresse und vollständige Browserkennung zur Besuchserkennung höchstens acht Stunden im Arbeitsspeicher, nicht dauerhaft in der Datenbank. Zweck: Auswertung der Seitennutzung. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO. <a href="https://www.goatcounter.com/help/privacy">Datenschutz bei GoatCounter</a>. Zusätzlich lädt die Seite den Google Tag Manager (Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland), der Zugriffe mit Google Analytics auswertet. Dabei werden Cookies gesetzt (unter anderem _ga) und Nutzungsdaten an Google übertragen, auch in Drittländer. Du kannst diese Cookies jederzeit in deinen Browsereinstellungen löschen oder blockieren. <a href="https://policies.google.com/privacy">Datenschutz bei Google</a>.',
			ds_rechte_titel: 'Deine Rechte',
			ds_rechte: 'Du hast nach Maßgabe der DSGVO das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung und Datenübertragbarkeit. Gegen eine Verarbeitung auf Grundlage berechtigter Interessen kannst du aus Gründen deiner besonderen Situation Widerspruch einlegen. Wende dich dazu an die Kontaktadresse oben. Du kannst dich außerdem bei einer Datenschutzaufsichtsbehörde beschweren, etwa beim <a href="https://www.lda.bayern.de/">Bayerischen Landesamt für Datenschutzaufsicht</a>.',
			ds_stand: 'Stand: 6. November 2026'
		},
		en: {
			menue_sets: 'Sets', d_sets: 'Matching equipment and its set bonuses',
			menue_auftraggeber: 'Quest givers', d_auftraggeber: 'Who gives which quests',
			menue_landmarken: 'Landmarks', d_landmarken: 'Sights and the quests there',
			menue_fraktionen: 'Factions', d_fraktionen: 'Reputation, tiers and sources',
			hw_filter: 'Filters', hw_zuruecksetzen: 'Reset', hw_kategorie: 'Category', hw_alle_kategorien: 'All categories', hw_mehr: 'More recipes', hw_weitere_angaben: 'More details', hw_sort: 'Sort', hw_sort_name: 'Name', hw_sort_stufe: 'Level',
			nav_menu: 'Menu', nav_sprache: 'Language', nav_filter: 'Filter progress', nav_karten: 'Maps',
			footer_recht: 'Legal notice', footer_datenschutz: 'Privacy',
			ds_titel: 'Privacy', ds_verantwortlich: 'Controller',
			ds_kontakt: 'Adrian Schmolzi, Happurger Straße 62, 90482 Nürnberg, Germany. Contact: <a href="mailto:llb@sirhexalot.de">llb@sirhexalot.de</a>.',
			ds_lokal_titel: 'Imports and settings',
			ds_lokal: 'Imported character data and settings are stored locally in your browser and are not sent to our server or GoatCounter. Remove characters on the import page or delete all stored data in your browser settings. This storage supports the features you choose to use (§ 25(2) no. 2 TDDDG).',
			ds_host_titel: 'Website hosting',
			ds_host: 'The hosting provider is Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, Germany. For operation and security, the provider processes IP addresses, request times, requested pages and browser information. According to Hetzner, IP addresses in web hosting logs are anonymised; the default retention period is seven days and can be configured. <a href="https://docs.hetzner.com/general/company-and-policy/data-protection-at-hetzner/">Hosting provider’s information</a>. Legal basis: Art. 6(1)(f) GDPR.',
			ds_stat_titel: 'Visitor statistics',
			ds_stat: 'For visitor statistics, your browser connects to gc.zgo.at and sirhexalot.goatcounter.com (GoatCounter, Martin Tournoij, Ireland; servers in Germany and Finland). It records views, referrers, browsers, systems, languages, screen widths and countries. No cookies or links to character data. According to the provider, IP addresses and full browser identifiers remain in memory for at most eight hours to recognise repeat visits, not permanently in the database. Purpose: understanding website use. Legal basis: Art. 6(1)(f) GDPR. <a href="https://www.goatcounter.com/help/privacy">GoatCounter privacy policy</a>. The page also loads Google Tag Manager (Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland), which measures visits with Google Analytics. This sets cookies (including _ga) and sends usage data to Google, also to third countries. You can delete or block these cookies in your browser settings. <a href="https://policies.google.com/privacy">Google privacy policy</a>.',
			ds_rechte_titel: 'Your rights',
			ds_rechte: 'Subject to the GDPR, you have rights of access, rectification, erasure, restriction of processing and data portability. You may object to processing based on legitimate interests on grounds relating to your particular situation. Contact the address above to exercise these rights. You may also complain to a data protection authority, such as the <a href="https://www.lda.bayern.de/en/">Bavarian State Office for Data Protection Supervision</a>.',
			ds_stand: 'Last updated: 6 November 2026'
		},
		fr: {
			menue_sets: 'Ensembles', d_sets: 'Les pièces assorties et leurs bonus d’ensemble',
			menue_auftraggeber: 'Donneurs de quête', d_auftraggeber: 'Qui donne quelles quêtes',
			menue_landmarken: 'Sites', d_landmarken: 'Sites et leurs quêtes',
			menue_fraktionen: 'Factions', d_fraktionen: 'Réputation, paliers et sources',
			hw_filter: 'Filtres', hw_zuruecksetzen: 'Réinitialiser', hw_kategorie: 'Catégorie', hw_alle_kategorien: 'Toutes les catégories', hw_mehr: 'Autres recettes', hw_weitere_angaben: 'Autres informations', hw_sort: 'Tri', hw_sort_name: 'Nom', hw_sort_stufe: 'Niveau',
			nav_menu: 'Menu', nav_sprache: 'Langue', nav_filter: 'Filtrer la progression', nav_karten: 'Cartes',
			footer_recht: 'Mentions légales', footer_datenschutz: 'Confidentialité',
			ds_titel: 'Confidentialité', ds_verantwortlich: 'Responsable du traitement',
			ds_kontakt: 'Adrian Schmolzi, Happurger Straße 62, 90482 Nürnberg, Allemagne. Contact : <a href="mailto:llb@sirhexalot.de">llb@sirhexalot.de</a>.',
			ds_lokal_titel: 'Import et paramètres',
			ds_lokal: 'Les données de personnages importées et les paramètres sont enregistrés localement dans votre navigateur, sans être transmis à notre serveur ni à GoatCounter. Vous pouvez supprimer les personnages sur la page d’import ou effacer toutes les données dans les paramètres du navigateur. Ce stockage permet les fonctions que vous choisissez d’utiliser (§ 25, al. 2, n° 2 TDDDG).',
			ds_host_titel: 'Hébergement du site',
			ds_host: 'L’hébergeur est Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, Allemagne. Pour le fonctionnement et la sécurité du site, il traite l’adresse IP, l’heure, la page demandée et des informations sur le navigateur. Selon Hetzner, les adresses IP des journaux d’hébergement web sont anonymisées ; la durée de conservation par défaut est de sept jours et peut être configurée. <a href="https://docs.hetzner.com/general/company-and-policy/data-protection-at-hetzner/">Informations de l’hébergeur</a>. Base juridique : art. 6, par. 1, point f du RGPD.',
			ds_stat_titel: 'Statistiques de fréquentation',
			ds_stat: 'Pour les statistiques, votre navigateur se connecte à gc.zgo.at et sirhexalot.goatcounter.com (GoatCounter, Martin Tournoij, Irlande ; serveurs en Allemagne et en Finlande). Le service relève les visites, leurs sources, le navigateur, le système, la langue, la largeur d’écran et le pays. Aucun cookie ni rapprochement avec les données des personnages. Selon le fournisseur, l’adresse IP et l’identifiant complet du navigateur restent en mémoire au maximum huit heures pour reconnaître les visites répétées, sans conservation durable en base de données. Finalité : analyse de l’utilisation du site. Base juridique : art. 6, par. 1, point f du RGPD. <a href="https://www.goatcounter.com/help/privacy">Confidentialité chez GoatCounter</a>. La page charge en outre Google Tag Manager (Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irlande), qui mesure les visites avec Google Analytics. Des cookies sont déposés (dont _ga) et des données d’utilisation sont transmises à Google, y compris vers des pays tiers. Vous pouvez supprimer ou bloquer ces cookies dans les réglages de votre navigateur. <a href="https://policies.google.com/privacy">Confidentialité chez Google</a>.',
			ds_rechte_titel: 'Vos droits',
			ds_rechte: 'Dans les conditions prévues par le RGPD, vous disposez de droits d’accès, de rectification, d’effacement, de limitation du traitement et de portabilité. Vous pouvez vous opposer à un traitement fondé sur l’intérêt légitime pour des raisons tenant à votre situation particulière. Pour exercer ces droits, utilisez les coordonnées ci-dessus. Vous pouvez aussi saisir une autorité de contrôle, notamment l’<a href="https://www.lda.bayern.de/en/">autorité bavaroise de contrôle de la protection des données</a>.',
			ds_stand: 'Mise à jour : 6 novembre 2026'
		}
	};
	Object.keys(texte).forEach(function (lang) { Object.assign(window.MQL_TEXTE[lang], texte[lang]); });
})();
