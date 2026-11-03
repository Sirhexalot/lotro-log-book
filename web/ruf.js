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
		offenesFenster = null;
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
			tr.className = 'klickbar';
			tr.title = t('ru_klick');
			tr.addEventListener('click', function () { zeigeQuellen(zeile, tr); });
			ziel.appendChild(tr);
		});
		el('anzahl').textContent = ersetze(t('ru_anzahl'), [gezeigt, oben]);
	}

	// --- Where to get reputation: opens under a faction on click --------
	// ruf-quellen-<language>.js lists per faction the quests and deeds that give
	// reputation with it. Loaded on first use; same build stamp as this script.
	var quellen = null, offenesFenster = null;
	var fertigeIds = {};
	(aktiv.quests || []).concat(aktiv.deeds || []).forEach(function (id) { fertigeIds[id] = true; });
	function ladeQuellen(dann) {
		if (quellen) { dann(); return; }
		var eigenes = document.querySelector('script[src*="ruf.js"]');
		var stempel = eigenes && eigenes.src.indexOf('?') >= 0 ? eigenes.src.slice(eigenes.src.indexOf('?')) : '';
		var skript = document.createElement('script');
		skript.src = 'ruf-quellen-' + sprache + '.js' + stempel;
		skript.onload = function () { quellen = window.MQL_RUF_QUELLEN || {}; dann(); };
		skript.onerror = function () { quellen = {}; dann(); };
		document.body.appendChild(skript);
	}
	function zeigeQuellen(zeile, tr) {
		if (offenesFenster) { offenesFenster.parentNode.removeChild(offenesFenster); }
		if (offenesFenster && offenesFenster.dataset.id === zeile.id) { offenesFenster = null; return; }
		ladeQuellen(function () {
			var liste = quellen[zeile.id] || [];
			var offeneListe = liste.filter(function (q) { return !fertigeIds[q[0]]; });
			var fenster = document.createElement('tr');
			fenster.className = 'quellen';
			fenster.dataset.id = zeile.id;
			var td = document.createElement('td');
			td.colSpan = 4;
			var kopf = document.createElement('p');
			kopf.className = 'stufe-klein';
			kopf.textContent = liste.length
				? ersetze(t('ru_quellen'), [offeneListe.length, liste.length])
				: t('ru_keine_quellen');
			td.appendChild(kopf);
			if (offeneListe.length) {
				var ul = document.createElement('ul');
				offeneListe.slice(0, 200).forEach(function (q) {
					var li = document.createElement('li');
					var a = document.createElement('a');
					a.href = 'index.html?' + (q[3] === 't' ? 'art=taten&' : '') + 'lang=' + sprache + '&id=' + q[0];
					a.textContent = q[1];
					li.appendChild(a);
					var info = document.createElement('span');
					info.className = 'stufe-klein';
					info.textContent = ' ' + [q[3] === 't' ? t('ru_tat') : t('ru_aufgabe'),
						q[2] ? t('hw_stufe') + ' ' + q[2] : '', q[5],
						q[4] >= 1 && q[4] <= 6 ? new Array(q[4] + 1).join('▮') : ''].filter(Boolean).join(' · ');
					li.appendChild(info);
					ul.appendChild(li);
				});
				td.appendChild(ul);
				if (offeneListe.length > 200) {
					var mehr = document.createElement('p');
					mehr.className = 'stufe-klein';
					mehr.textContent = ersetze(t('ru_weitere'), [offeneListe.length - 200]);
					td.appendChild(mehr);
				}
			}
			fenster.appendChild(td);
			tr.parentNode.insertBefore(fenster, tr.nextSibling);
			offenesFenster = fenster;
		});
	}

	el('filter').addEventListener('input', zeichne);
	el('nur-begonnen').addEventListener('change', zeichne);
	zeichne();
})();
