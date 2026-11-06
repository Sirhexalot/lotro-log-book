/* One item from the reward index: what it is and where it comes from.
 * Data: belohnungen-<language>.js (build_belohnungen.py). */
(function () {
	'use strict';
	var t = window.MQL_T || function (key) { return key; };
	var sprache = window.MQL_SPRACHE || 'de';
	var nameEl = document.getElementById('gs-name');
	if (!nameEl) { return; }
	var meta = document.getElementById('gs-meta');
	var ziel = document.getElementById('gs-quellen');
	var leer = document.getElementById('gs-leer');
	var zurueck = document.getElementById('gs-zurueck');
	if (zurueck) { zurueck.href = 'belohnungen.html?lang=' + sprache; }

	function eltern(tag, text) {
		var node = document.createElement(tag);
		if (text != null) { node.textContent = text; }
		return node;
	}

	/** Sources as type → region → area, one table per area. */
	function quelleBaum(quellen) {
		var baum = eltern('div');
		baum.className = 'bl-baum';
		var nachArt = {};
		quellen.forEach(function (q) { (nachArt[q[5]] = nachArt[q[5]] || []).push(q); });
		Object.keys(nachArt).forEach(function (artName) {
			var block = eltern('section');
			block.className = 'bl-art';
			block.appendChild(eltern('h4', artName + ' (' + nachArt[artName].length + ')'));
			var nachRegion = {};
			nachArt[artName].forEach(function (q) { (nachRegion[q[4] || '—'] = nachRegion[q[4] || '—'] || []).push(q); });
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
						.sort(function (a, b) { return a[2].localeCompare(b[2], t('locale')); })
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
			baum.appendChild(block);
		});
		return baum;
	}

	function zeichne() {
		var parameter = new URLSearchParams(window.location.search);
		var id = (parameter.get('id') || '').toUpperCase();
		var daten = (window.MQL_BELOHNUNGEN || {}).g || [];
		var eintrag = null;
		for (var i = 0; i < daten.length; i += 1) {
			if (String(daten[i][0]).toUpperCase() === id) { eintrag = daten[i]; break; }
		}
		if (!eintrag) {
			nameEl.textContent = t('gs_nicht_gefunden');
			meta.hidden = true;
			leer.hidden = true;
			return;
		}
		nameEl.textContent = eintrag[1];
		nameEl.className = 'q' + (eintrag[2] || 0);
		document.title = eintrag[1] + ' – LOTRO Log Book';
		var teile = [];
		if (eintrag[3]) { teile.push(t('stufe') + ' ' + eintrag[3]); }
		teile.push(eintrag[4] ? t('gs_gebunden') : t('gs_frei'));
		meta.textContent = teile.join(' · ');
		if (!eintrag[5] || !eintrag[5].length) { leer.hidden = false; return; }
		ziel.appendChild(quelleBaum(eintrag[5]));
	}

	window.MQL_GEGENSTAND_ZEICHNEN = zeichne;
	if (window.MQL_BELOHNUNGEN) { zeichne(); }
})();
