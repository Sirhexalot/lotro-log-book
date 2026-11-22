/* Händlerliste: „Ware für meine Stufe“ aus dem lokalen Spielstand.
 *
 * Die Stufe steht im Browser, nicht auf dem Server. Der Verweis trägt sie als
 * ?stufe=123 in die Adresse; dort filtert und zählt der Server über alle
 * Händler, und filter-server.js behält die Zahl bei jeder weiteren Auswahl.
 */
(function () {
	'use strict';

	function start() {
		var bereich = document.getElementById('vendor-level-field');
		var verweis = document.getElementById('vendor-level-link');
		if (!bereich || !verweis) { return; }

		var speicher = window.MQL_SPEICHER;
		var charakter = speicher && speicher.aktiv ? speicher.aktiv() : null;
		var stufe = charakter && Number(charakter.level) > 0
			? Math.floor(Number(charakter.level)) : 0;
		/* Ohne Spielstand keine Stufe: der Verweis bleibt verborgen, die Liste
		   zeigt weiter alle Händler. */
		if (!stufe) { return; }

		var adresse = new URL(location.href);
		adresse.searchParams.set('stufe', String(stufe));
		adresse.hash = '';
		verweis.href = adresse.pathname + '?' + adresse.searchParams.toString();
		verweis.textContent = (bereich.getAttribute('data-vorlage') || 'Ware für Stufe %s')
			.replace('%s', String(stufe));
		bereich.hidden = false;
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', start);
	} else {
		start();
	}
	/* Dieses Skript steht vor speicher.js im Dokument; nach „load“ ist der
	   Spielstand sicher da. */
	window.addEventListener('load', start);
})();
