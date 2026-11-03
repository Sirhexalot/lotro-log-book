/* Crafting page: per profession every tier with proficiency and mastery, from
 * LOTRO Companion's crafting.xml. Profession names, tier titles and the
 * experience each tier needs come from our own DAT export (referenz.js).
 */
(function () {
	'use strict';

	var t = window.MQL_T || function (schluessel) { return schluessel; };
	var ersetze = window.MQL_ERSETZE || function (muster) { return String(muster); };
	var sprache = window.MQL_SPRACHE || 'de';
	var berufe = (window.MQL_REFERENZ || {}).berufe || {};
	var aktiv = window.MQL_SPEICHER && window.MQL_SPEICHER.aktiv();

	function el(id) { return document.getElementById(id); }
	function text(wert) { return wert ? (wert[sprache] || wert.en || '') : ''; }
	function zahl(wert) { return Number(wert).toLocaleString(t('locale')); }

	var hinweis = el('hinweis');
	if (!aktiv) { hinweis.innerHTML = t('ohne_charakter'); return; }
	var handwerk = aktiv.handwerk || {};
	var schluessel = Object.keys(handwerk);
	if (!schluessel.length) { hinweis.textContent = t('hw_keine_daten'); return; }

	schluessel.sort(function (a, b) {
		return text((berufe[a] || {}).n || { en: a }).localeCompare(text((berufe[b] || {}).n || { en: b }), t('locale'));
	});

	var ziel = el('berufe');
	schluessel.forEach(function (beruf) {
		var info = berufe[beruf] || { n: { en: beruf }, s: [] };
		var stufenInfo = {};
		(info.s || []).forEach(function (stufe) { stufenInfo[stufe.t] = stufe; });
		var block = document.createElement('section');
		block.className = 'beruf';
		var titel = document.createElement('h3');
		titel.textContent = text(info.n) || beruf;
		block.appendChild(titel);

		// The first tier (0 is the untrained start) whose proficiency or mastery is
		// not finished is what comes next.
		var naechste = null;
		handwerk[beruf].forEach(function (zeile) {
			if (naechste || zeile[0] < 1) { return; }
			if (!zeile[2]) { naechste = { stufe: zeile[0], teil: 'k' }; }
			else if (!zeile[4]) { naechste = { stufe: zeile[0], teil: 'm' }; }
		});
		var hinweisZeile = document.createElement('p');
		hinweisZeile.className = 'naechste';
		if (naechste) {
			var inf = stufenInfo[naechste.stufe] || {};
			var name = text(naechste.teil === 'k' ? inf.k : inf.m) || (t('hw_stufe') + ' ' + naechste.stufe);
			hinweisZeile.textContent = ersetze(t('hw_naechste'), [name + ' (' +
				(naechste.teil === 'k' ? t('hw_koennen') : t('hw_meister')) + ')']);
		} else {
			hinweisZeile.textContent = t('hw_fertig');
		}
		block.appendChild(hinweisZeile);

		var rahmen = document.createElement('div');
		rahmen.className = 'tabellen-rahmen';
		var tabelle = document.createElement('table');
		tabelle.className = 'tabelle';
		var kopf = document.createElement('tr');
		['hw_stufe', null, 'hw_koennen', null, 'hw_meister'].forEach(function (k) {
			var th = document.createElement('th');
			th.textContent = k ? t(k) : '';
			kopf.appendChild(th);
		});
		var thead = document.createElement('thead');
		thead.appendChild(kopf);
		tabelle.appendChild(thead);
		var tbody = document.createElement('tbody');

		function zelle(fertig, xp, deckel, titelText) {
			var haken = document.createElement('td');
			var inhalt = document.createElement('td');
			if (fertig) {
				haken.className = 'haken-zelle fertig';
				haken.textContent = '✓';
				inhalt.textContent = titelText;
			} else if (xp > 0) {
				haken.className = 'haken-zelle teil';
				haken.textContent = '◐';
				var reihe = document.createElement('div');
				reihe.className = 'balken-zeile';
				var name = document.createElement('span');
				name.textContent = titelText;
				var balken = document.createElement('div');
				balken.className = 'balken teil';
				var fuellung = document.createElement('span');
				fuellung.style.width = (deckel ? Math.min(100, Math.round(xp / deckel * 100)) : 0) + '%';
				balken.appendChild(fuellung);
				var klein = document.createElement('span');
				klein.className = 'stufe-klein';
				klein.textContent = deckel ? ersetze(t('hw_xp'), [zahl(xp), zahl(deckel)]) : zahl(xp);
				reihe.appendChild(name);
				reihe.appendChild(balken);
				reihe.appendChild(klein);
				inhalt.appendChild(reihe);
			} else {
				haken.className = 'haken-zelle offen';
				haken.textContent = '○';
				inhalt.textContent = titelText;
				inhalt.className = 'stufe-klein';
			}
			return [haken, inhalt];
		}

		handwerk[beruf].forEach(function (zeile) {
			if (zeile[0] < 1) { return; }
			var inf = stufenInfo[zeile[0]] || {};
			var tr = document.createElement('tr');
			var nummer = document.createElement('td');
			nummer.textContent = zeile[0];
			nummer.className = 'zahl';
			tr.appendChild(nummer);
			zelle(zeile[2], zeile[1], inf.kxp, text(inf.k)).forEach(function (td) { tr.appendChild(td); });
			zelle(zeile[4], zeile[3], inf.mxp, text(inf.m)).forEach(function (td) { tr.appendChild(td); });
			tbody.appendChild(tr);
		});
		tabelle.appendChild(tbody);
		rahmen.appendChild(tabelle);
		block.appendChild(rahmen);
		ziel.appendChild(block);
	});
})();
