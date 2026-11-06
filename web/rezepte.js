/* Recipe browser for the crafting page. Data: rezepte-<language>.js. */
(function () {
	'use strict';
	var t = window.MQL_T || function (key) { return key; };
	var ziel = document.getElementById('rezepte');
	if (!ziel) { return; }

	var grenze = 200;
	var daten = [];
	var beruf = '';

	var kopf = document.createElement('div');
	kopf.className = 'kopf-zeile rezept-zeile';
	var suche = document.createElement('input');
	suche.type = 'search';
	suche.id = 'rezept-suche';
	suche.setAttribute('placeholder', t('hw_rezept_suche'));
	suche.setAttribute('aria-label', t('hw_rezept_suche'));
	var auswahl = document.createElement('select');
	auswahl.id = 'rezept-beruf';
	auswahl.setAttribute('aria-label', t('hw_beruf'));
	var anzahl = document.createElement('span');
	anzahl.className = 'stufe-klein';
	anzahl.id = 'rezept-anzahl';
	anzahl.setAttribute('role', 'status');
	kopf.appendChild(suche);
	kopf.appendChild(auswahl);
	kopf.appendChild(anzahl);
	ziel.appendChild(kopf);

	var rahmen = document.createElement('div');
	rahmen.className = 'tabellen-rahmen';
	var tabelle = document.createElement('table');
	tabelle.className = 'tabelle';
	tabelle.id = 'rezept-tabelle';
	tabelle.innerHTML = '<thead><tr>' +
		'<th>' + t('hw_ergebnis') + '</th>' +
		'<th>' + t('hw_beruf') + '</th>' +
		'<th>' + t('hw_zutaten') + '</th>' +
		'<th>' + t('hw_kritisch') + '</th>' +
		'</tr></thead>';
	var koerper = document.createElement('tbody');
	tabelle.appendChild(koerper);
	rahmen.appendChild(tabelle);
	ziel.appendChild(rahmen);
	var mehr = document.createElement('p');
	mehr.className = 'schwach';
	mehr.hidden = true;
	ziel.appendChild(mehr);

	function zeile(wert) {
		var tr = document.createElement('tr');
		var name = document.createElement('td');
		name.className = 'q' + (wert[1] || 0);
		name.textContent = wert[0];
		if (wert[2]) {
			var stufe = document.createElement('span');
			stufe.className = 'bl-stufe';
			stufe.textContent = ' · ' + t('stufe') + ' ' + wert[2];
			name.appendChild(stufe);
		}
		tr.appendChild(name);
		var berufZelle = document.createElement('td');
		berufZelle.textContent = [wert[3], wert[4]].filter(Boolean).join(' · ');
		tr.appendChild(berufZelle);
		var zutaten = document.createElement('td');
		zutaten.textContent = wert[6].map(function (teil) {
			return (teil[1] > 1 ? teil[1] + ' × ' : '') + teil[0];
		}).join(', ');
		if (wert[7] && wert[7].length) {
			var optional = document.createElement('div');
			optional.className = 'schwach';
			optional.textContent = t('hw_optional') + ': ' + wert[7].map(function (teil) {
				return (teil[1] > 1 ? teil[1] + ' × ' : '') + teil[0];
			}).join(', ');
			zutaten.appendChild(optional);
		}
		tr.appendChild(zutaten);
		var kritisch = document.createElement('td');
		kritisch.textContent = wert[8] && wert[8] !== wert[0] ? wert[8] : '';
		tr.appendChild(kritisch);
		return tr;
	}

	function zeichne() {
		var text = (suche.value || '').trim().toLowerCase();
		var treffer = daten.filter(function (wert) {
			if (beruf && wert[3] !== beruf) { return false; }
			if (!text) { return true; }
			var heu = wert[0] + ' ' + wert[3] + ' ' + wert[4] + ' ' + wert[5] + ' ' +
				wert[6].map(function (teil) { return teil[0]; }).join(' ');
			return heu.toLowerCase().indexOf(text) >= 0;
		});
		koerper.textContent = '';
		treffer.slice(0, grenze).forEach(function (wert) { koerper.appendChild(zeile(wert)); });
		if (!treffer.length) {
			var leer = document.createElement('tr');
			var zelle = document.createElement('td');
			zelle.colSpan = 4;
			zelle.className = 'leer-tabelle';
			zelle.textContent = t('bl_keine');
			leer.appendChild(zelle);
			koerper.appendChild(leer);
		}
		anzahl.textContent = window.MQL_ERSETZE(t('bl_anzahl'), [treffer.length]);
		mehr.hidden = treffer.length <= grenze;
		mehr.textContent = window.MQL_ERSETZE(t('bl_mehr'), [treffer.length - grenze]);
	}

	function berufe() {
		var namen = [];
		daten.forEach(function (wert) { if (wert[3] && namen.indexOf(wert[3]) < 0) { namen.push(wert[3]); } });
		namen.sort();
		var alle = document.createElement('option');
		alle.value = '';
		alle.textContent = t('hw_alle_berufe');
		auswahl.appendChild(alle);
		namen.forEach(function (name) {
			var option = document.createElement('option');
			option.value = name;
			option.textContent = name;
			auswahl.appendChild(option);
		});
	}

	window.MQL_REZEPTE_ZEICHNEN = function () {
		if (!window.MQL_REZEPTE || !window.MQL_REZEPTE.r) { return; }
		daten = window.MQL_REZEPTE.r;
		berufe();
		suche.addEventListener('input', zeichne);
		auswahl.addEventListener('change', function () { beruf = auswahl.value; zeichne(); });
		zeichne();
	};
	if (window.MQL_REZEPTE) { window.MQL_REZEPTE_ZEICHNEN(); }
})();
