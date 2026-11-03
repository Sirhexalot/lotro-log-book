/* Reputation page: the active character's standing with every faction, from
 * LOTRO Companion's reputation.xml. Names and tier names come from our own DAT
 * export (referenz.js). Nothing is estimated: without thresholds in the data the
 * bar shows the tier reached, not points to the next tier.
 */
(function () {
	'use strict';

	var t = window.MQL_T || function (schluessel) { return schluessel; };
	var ersetze = window.MQL_ERSETZE || function (muster) { return String(muster); };
	var sprache = window.MQL_SPRACHE || 'de';
	var referenz = (window.MQL_REFERENZ || {}).fraktionen || {};
	var aktiv = window.MQL_SPEICHER && window.MQL_SPEICHER.aktiv();

	function el(id) { return document.getElementById(id); }
	function text(wert) { return wert ? (wert[sprache] || wert.en || '') : ''; }

	var hinweis = el('hinweis');
	if (!aktiv) {
		hinweis.innerHTML = t('ohne_charakter');
		el('steuerung').hidden = true;
		el('tabelle').hidden = true;
		return;
	}
	if (!aktiv.ruf || !aktiv.ruf.length) {
		hinweis.textContent = t('ru_keine_daten');
		el('steuerung').hidden = true;
		el('tabelle').hidden = true;
		return;
	}

	var zeilen = aktiv.ruf.map(function (eintrag) {
		var info = referenz[eintrag[0]] || null;
		var hoechste = info && info.max ? info.max : null;
		return {
			id: eintrag[0], stufe: eintrag[1], punkte: eintrag[2],
			name: info ? text(info.n) : eintrag[0],
			stufenName: info && info.s && info.s[String(eintrag[1])] ? text(info.s[String(eintrag[1])]) : String(eintrag[1]),
			min: info && info.min ? info.min : 1,
			max: hoechste,
			start: info ? info.start : null,
			bekannt: !!info
		};
	}).sort(function (a, b) { return a.name.localeCompare(b.name, t('locale')); });

	function begonnen(zeile) {
		return (zeile.punkte || 0) > 0 || (zeile.start !== null && zeile.stufe !== zeile.start);
	}

	function zeichne() {
		var such = el('filter').value.trim().toLowerCase();
		var nur = el('nur-begonnen').checked;
		var ziel = el('zeilen');
		ziel.textContent = '';
		var gezeigt = 0, oben = 0;
		zeilen.forEach(function (zeile) {
			if (nur && !begonnen(zeile)) { return; }
			if (such && zeile.name.toLowerCase().indexOf(such) < 0) { return; }
			gezeigt += 1;
			var ganz = zeile.max !== null && zeile.stufe >= zeile.max;
			if (ganz) { oben += 1; }
			var tr = document.createElement('tr');
			var name = document.createElement('td');
			name.textContent = zeile.name;
			var stufe = document.createElement('td');
			stufe.textContent = zeile.stufenName;
			stufe.className = 'stufe-name';
			var balkenZelle = document.createElement('td');
			if (zeile.max !== null) {
				var reihe = document.createElement('div');
				reihe.className = 'balken-zeile';
				var balken = document.createElement('div');
				balken.className = 'balken' + (ganz ? '' : ' teil');
				var fuellung = document.createElement('span');
				var spanne = Math.max(1, zeile.max - zeile.min);
				fuellung.style.width = Math.round(Math.max(0, zeile.stufe - zeile.min) / spanne * 100) + '%';
				balken.appendChild(fuellung);
				var klein = document.createElement('span');
				klein.className = 'stufe-klein';
				klein.textContent = ganz ? t('ru_hoechste') : ersetze(t('ru_stufe_von'), [zeile.stufe, zeile.max]);
				reihe.appendChild(balken);
				reihe.appendChild(klein);
				balkenZelle.appendChild(reihe);
			}
			var punkte = document.createElement('td');
			punkte.className = 'zahl';
			punkte.textContent = zeile.punkte === null ? '–' : zeile.punkte.toLocaleString(t('locale'));
			tr.appendChild(name);
			tr.appendChild(stufe);
			tr.appendChild(balkenZelle);
			tr.appendChild(punkte);
			ziel.appendChild(tr);
		});
		el('anzahl').textContent = ersetze(t('ru_anzahl'), [gezeigt, oben]);
	}

	el('filter').addEventListener('input', zeichne);
	el('nur-begonnen').addEventListener('change', zeichne);
	zeichne();
})();
