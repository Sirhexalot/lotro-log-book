/* Reward index: virtues, titles and items, grouped by deed type, region and
 * area. Data: belohnungen-<language>.js (build_belohnungen.py). */
(function () {
	'use strict';
	var t = window.MQL_T || function (key) { return key; };
	var sprache = window.MQL_SPRACHE || 'de';
	var liste = document.getElementById('bl-liste');
	var suche = document.getElementById('bl-suche');
	var anzahl = document.getElementById('bl-anzahl');
	var mehr = document.getElementById('bl-mehr');
	var typWahl = document.getElementById('bl-art');
	var regionWahl = document.getElementById('bl-region');
	if (!liste) { return; }

	var art = 'v';
	var grenze = { v: 30, t: 60, g: 100 };
	var daten = null;
	var typ = '', region = '';
	var typeOrder = [];

	function quellenZahl(n) {
		return n + ' ' + t(n === 1 ? 'bl_quelle' : 'bl_quellen');
	}

	function eltern(tag, text) {
		var node = document.createElement(tag);
		if (text != null) { node.textContent = text; }
		return node;
	}

	// --- source grouping --------------------------------------------------
	/** Sources as type → region → area, each area with a name/level table. */
	function quelleBaum(quellen) {
		var baum = document.createElement('div');
		baum.className = 'bl-baum';
		var nachArt = {};
		quellen.forEach(function (q) { (nachArt[q[5]] = nachArt[q[5]] || []).push(q); });
		var arten = Object.keys(nachArt).sort(function (a, b) {
			var ia = typeOrder.indexOf(a), ib = typeOrder.indexOf(b);
			return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
		});
		arten.forEach(function (artName) {
			var eintraege = nachArt[artName];
			var block = eltern('section');
			block.className = 'bl-art';
			var kopf = eltern('h4', artName + ' (' + eintraege.length + ')');
			block.appendChild(kopf);
			var nachRegion = {};
			eintraege.forEach(function (q) { (nachRegion[q[4] || '—'] = nachRegion[q[4] || '—'] || []).push(q); });
			Object.keys(nachRegion).sort().forEach(function (regName) {
				var reg = eltern('div');
				reg.className = 'bl-region';
				if (regName && regName !== '—') { reg.appendChild(eltern('h5', regName)); }
				var nachZone = {};
				nachRegion[regName].forEach(function (q) { (nachZone[q[3] || '—'] = nachZone[q[3] || '—'] || []).push(q); });
				Object.keys(nachZone).sort().forEach(function (zone) {
					var gruppe = eltern('div');
					gruppe.className = 'bl-zone';
					if (zone && zone !== '—') { gruppe.appendChild(eltern('h6', zone)); }
					var tabelle = eltern('table');
					tabelle.className = 'tabelle bl-quellen';
					var koerper = eltern('tbody');
					nachZone[zone]
						.sort(function (a, b) { return a[2].localeCompare(b[2]); })
						.forEach(function (q) {
							var tr = eltern('tr');
							var name = eltern('td');
							var link = eltern('a', q[2]);
							link.href = q[0] === 'd'
								? 'index.html?art=taten&lang=' + sprache + '&id=' + q[1]
								: 'index.html?lang=' + sprache + '&id=' + q[1];
							name.appendChild(link);
							tr.appendChild(name);
							var stufe = eltern('td', q[6] ? t('stufe') + ' ' + q[6] : '');
							stufe.className = 'zahl bl-lvl';
							tr.appendChild(stufe);
							koerper.appendChild(tr);
						});
					tabelle.appendChild(koerper);
					gruppe.appendChild(tabelle);
					reg.appendChild(gruppe);
				});
				block.appendChild(reg);
			});
			// Long type blocks start collapsed.
			if (eintraege.length > 10) {
				var details = eltern('details');
				details.appendChild(eltern('summary', artName + ' (' + eintraege.length + ')'));
				kopf.remove();
				details.appendChild(block);
				baum.appendChild(details);
			} else {
				baum.appendChild(block);
			}
		});
		return baum;
	}

	function passtQuelle(q) {
		return (!typ || q[5] === typ) && (!region || q[4] === region);
	}

	function quellenVon(quellen) {
		return (quellen || []).filter(passtQuelle);
	}

	function trifftName(name, quellen) {
		if (!suche.value.trim()) { return true; }
		var text = suche.value.trim().toLowerCase();
		if (name.toLowerCase().indexOf(text) >= 0) { return true; }
		return quellen.some(function (q) { return q[2].toLowerCase().indexOf(text) >= 0; });
	}

	// --- views ------------------------------------------------------------
	function zeigeTugenden() {
		var eintraege = daten.v.filter(function (eintrag) {
			return trifftName(eintrag[0], eintrag[1]) && quellenVon(eintrag[1]).length;
		});
		eintraege.slice(0, grenze.v).forEach(function (eintrag) {
			var karte = eltern('section');
			karte.className = 'bl-karte';
			var kopf = eltern('div');
			kopf.className = 'bl-karte-kopf';
			kopf.appendChild(eltern('h3', eintrag[0]));
			var zahl = eltern('span', quellenZahl(quellenVon(eintrag[1]).length));
			zahl.className = 'bl-zahl';
			kopf.appendChild(zahl);
			karte.appendChild(kopf);
			karte.appendChild(quelleBaum(quellenVon(eintrag[1])));
			liste.appendChild(karte);
		});
		zaehle(eintraege.length, grenze.v);
	}

	function zeigeTitel() {
		var eintraege = daten.t.filter(function (eintrag) {
			return trifftName(eintrag[0], eintrag[1]) && quellenVon(eintrag[1]).length;
		});
		eintraege.slice(0, grenze.t).forEach(function (eintrag) {
			var quellen = quellenVon(eintrag[1]);
			var details = eltern('details');
			details.className = 'bl-titel';
			var summary = eltern('summary');
			summary.appendChild(eltern('span', eintrag[0]));
			var zahl = eltern('span', quellenZahl(quellen.length));
			zahl.className = 'bl-zahl';
			summary.appendChild(zahl);
			details.appendChild(summary);
			var inhalt = eltern('div');
			inhalt.className = 'bl-titel-inhalt';
			var gefuellt = false;
			details.addEventListener('toggle', function () {
				if (!gefuellt && details.open) {
					inhalt.appendChild(quelleBaum(quellen));
					gefuellt = true;
				}
			});
			details.appendChild(inhalt);
			liste.appendChild(details);
		});
		zaehle(eintraege.length, grenze.t);
	}

	function zeigeGegenstaende() {
		var eintraege = daten.g.filter(function (eintrag) {
			return trifftName(eintrag[1], eintrag[5]) && quellenVon(eintrag[5]).length;
		});
		var rahmen = eltern('div');
		rahmen.className = 'tabellen-rahmen';
		var tabelle = eltern('table');
		tabelle.className = 'tabelle bl-gegenstaende';
		tabelle.innerHTML = '<thead><tr><th>' + t('bl_gegenstand') + '</th><th>' +
			t('stufe') + '</th><th>' + t('bl_quellen') + '</th></tr></thead>';
		var koerper = eltern('tbody');
		eintraege.slice(0, grenze.g).forEach(function (eintrag) {
			var quellen = quellenVon(eintrag[5]);
			var tr = eltern('tr');
			tr.className = 'bl-zeile';
			var name = eltern('td', eintrag[1]);
			name.className = 'q' + (eintrag[2] || 0);
			tr.appendChild(name);
			tr.appendChild(eltern('td', eintrag[3] || ''));
			var anzahlZelle = eltern('td', quellenZahl(quellen.length));
			anzahlZelle.className = 'zahl';
			tr.appendChild(anzahlZelle);
			koerper.appendChild(tr);
			var detail = eltern('tr');
			detail.className = 'bl-detail';
			detail.hidden = true;
			var zelle = eltern('td');
			zelle.colSpan = 3;
			var gefuellt = false;
			tr.addEventListener('click', function () {
				if (!gefuellt) {
					zelle.appendChild(quelleBaum(quellen));
					gefuellt = true;
				}
				detail.hidden = !detail.hidden;
				tr.classList.toggle('offen', !detail.hidden);
			});
			detail.appendChild(zelle);
			koerper.appendChild(detail);
		});
		tabelle.appendChild(koerper);
		rahmen.appendChild(tabelle);
		liste.appendChild(rahmen);
		zaehle(eintraege.length, grenze.g);
	}

	function zaehle(gesamt, grenzeWert) {
		anzahl.textContent = window.MQL_ERSETZE(t(gesamt === 1 ? 'bl_eintrag' : 'bl_anzahl'), [gesamt]);
		mehr.hidden = gesamt <= grenzeWert;
		mehr.textContent = gesamt > grenzeWert
			? window.MQL_ERSETZE(t('bl_mehr'), [gesamt - grenzeWert]) : '';
	}

	function zeichne() {
		if (!daten) { return; }
		liste.textContent = '';
		if (art === 'v') { zeigeTugenden(); }
		else if (art === 't') { zeigeTitel(); }
		else { zeigeGegenstaende(); }
		if (!liste.children.length) {
			var leer = eltern('p', t('bl_keine'));
			leer.className = 'leer-tabelle';
			liste.appendChild(leer);
			anzahl.textContent = '';
			mehr.hidden = true;
		}
	}

	// --- controls ---------------------------------------------------------
	function optionen() {
		var arten = {}, regionen = {};
		daten.v.forEach(function (eintrag) { eintrag[1].forEach(sammle); });
		daten.t.forEach(function (eintrag) { eintrag[1].forEach(sammle); });
		daten.g.forEach(function (eintrag) { eintrag[5].forEach(sammle); });
		function sammle(q) {
			if (q[5]) { arten[q[5]] = true; }
			if (q[4]) { regionen[q[4]] = true; }
		}
		var sortiert = typeOrder.filter(function (name) { return arten[name]; });
		Object.keys(arten).forEach(function (name) {
			if (sortiert.indexOf(name) < 0) { sortiert.push(name); }
		});
		sortiert.forEach(function (name) {
			var option = eltern('option', name);
			option.value = name;
			typWahl.appendChild(option);
		});
		Object.keys(regionen).sort().forEach(function (name) {
			var option = eltern('option', name);
			option.value = name;
			regionWahl.appendChild(option);
		});
	}

	document.querySelectorAll('[data-bl]').forEach(function (knopf) {
		knopf.addEventListener('click', function () {
			art = knopf.getAttribute('data-bl');
			document.querySelectorAll('[data-bl]').forEach(function (anderer) {
				anderer.setAttribute('aria-pressed', String(anderer === knopf));
			});
			zeichne();
		});
	});
	if (suche) { suche.addEventListener('input', zeichne); }
	if (typWahl) { typWahl.addEventListener('change', function () { typ = typWahl.value; zeichne(); }); }
	if (regionWahl) { regionWahl.addEventListener('change', function () { region = regionWahl.value; zeichne(); }); }

	window.MQL_BELOHNUNGEN_ZEICHNEN = function () {
		if (!window.MQL_BELOHNUNGEN) { return; }
		daten = window.MQL_BELOHNUNGEN;
		typeOrder = daten.o || [];
		if (typWahl) { typWahl.setAttribute('aria-label', t('bl_art')); }
		if (regionWahl) { regionWahl.setAttribute('aria-label', t('bl_region')); }
		optionen();
		zeichne();
	};
	if (window.MQL_BELOHNUNGEN) { window.MQL_BELOHNUNGEN_ZEICHNEN(); }
})();
