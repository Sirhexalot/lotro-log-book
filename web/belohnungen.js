/* Reward index: virtues, titles and items with the entries that grant them.
 * Data comes from belohnungen-<language>.js, written by build_belohnungen.py. */
(function () {
	'use strict';
	var t = window.MQL_T || function (key) { return key; };
	var sprache = window.MQL_SPRACHE || 'de';
	var liste = document.getElementById('bl-liste');
	var suche = document.getElementById('bl-suche');
	var anzahl = document.getElementById('bl-anzahl');
	var mehr = document.getElementById('bl-mehr');
	if (!liste) { return; }

	var art = 'v';
	var grenze = 300;

	function eintrag(art, text) {
		var node = document.createElement('li');
		node.className = 'bl-eintrag' + (art === 'g' ? ' q' + (text[2] || 0) : '');
		var kopf = document.createElement('div');
		kopf.className = 'bl-name';
		kopf.textContent = art === 'g' ? text[1] : text[0];
		if (art === 'g' && text[2]) {
			var stufe = document.createElement('span');
			stufe.className = 'bl-stufe';
			stufe.textContent = ' · ' + t('stufe') + ' ' + (text[3] || 1);
			kopf.appendChild(stufe);
		}
		node.appendChild(kopf);
		var quellen = art === 'g' ? text[5] : text[1];
		if (quellen && quellen.length) {
			var zeile = document.createElement('div');
			zeile.className = 'bl-quellen';
			quellen.forEach(function (quelle, index) {
				if (index) { zeile.appendChild(document.createTextNode(' · ')); }
				var link = document.createElement('a');
				link.href = quelle[0] === 'd'
					? 'index.html?art=taten&lang=' + sprache + '&id=' + quelle[1]
					: 'index.html?lang=' + sprache + '&id=' + quelle[1];
				link.textContent = quelle[2] + (quelle[3] ? ' (' + quelle[3] + ')' : '');
				zeile.appendChild(link);
			});
			node.appendChild(zeile);
		}
		return node;
	}

	function gefiltert(daten) {
		var text = (suche.value || '').trim().toLowerCase();
		if (!text) { return daten; }
		return daten.filter(function (eintrag) {
			var quellen = art === 'g' ? eintrag[5] : eintrag[1];
			var haystack = (art === 'g' ? eintrag[1] : eintrag[0]) + ' ' +
				(quellen || []).map(function (q) { return q[2]; }).join(' ');
			return haystack.toLowerCase().indexOf(text) >= 0;
		});
	}

	function zeichne() {
		var daten = (window.MQL_BELOHNUNGEN || {})[art];
		if (!daten) {
			anzahl.textContent = t('fehlt');
			return;
		}
		var treffer = gefiltert(daten);
		anzahl.textContent = window.MQL_ERSETZE(t('bl_anzahl'), [treffer.length]);
		liste.textContent = '';
		treffer.slice(0, grenze).forEach(function (eintragDaten) {
			liste.appendChild(eintrag(art, eintragDaten));
		});
		if (!treffer.length) {
			var leer = document.createElement('li');
			leer.className = 'leer-tabelle';
			leer.textContent = t('bl_keine');
			liste.appendChild(leer);
		}
		mehr.hidden = treffer.length <= grenze;
		mehr.textContent = window.MQL_ERSETZE(t('bl_mehr'), [treffer.length - grenze]);
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

	// sprache.js loads the data after this script; it calls back into here.
	window.MQL_BELOHNUNGEN_ZEICHNEN = zeichne;
	if (window.MQL_BELOHNUNGEN) { zeichne(); }
})();
