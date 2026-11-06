/* Search across quests, deeds, titles, items and recipes. Data:
 * suche-<language>.js (build_suche.py), one compact row per entry. */
(function () {
	'use strict';
	var t = window.MQL_T || function (key) { return key; };
	var ersetze = window.MQL_ERSETZE || function (muster) { return String(muster); };
	var sprache = window.MQL_SPRACHE || 'de';
	var feld = document.getElementById('su-feld');
	if (!feld) { return; }
	var liste = document.getElementById('su-liste');
	var anzahl = document.getElementById('su-anzahl');
	var hinweis = document.getElementById('su-hinweis');

	var ARTEN = [
		['q', 'su_aufgaben'], ['d', 'su_taten'], ['t', 'su_titel_tab'],
		['g', 'su_gegenstaende'], ['r', 'su_rezepte']
	];
	var geoeffnet = {};
	var daten = [];

	function falten(text) {
		return String(text).toLowerCase()
			.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	}

	function eltern(tag, text) {
		var node = document.createElement(tag);
		if (text != null) { node.textContent = text; }
		return node;
	}

	function zielFuer(art, id, name) {
		if (art === 'q') { return 'index.html?lang=' + sprache + '&id=' + id; }
		if (art === 'd') { return 'index.html?art=taten&lang=' + sprache + '&id=' + id; }
		if (art === 'g') { return 'gegenstand.html?id=' + id + '&lang=' + sprache; }
		if (art === 't') { return 'belohnungen.html?lang=' + sprache + '&tab=t&q=' + encodeURIComponent(name); }
		return 'handwerk.html?lang=' + sprache + '&q=' + encodeURIComponent(name) + '#rezepte';
	}

	function zeile(art, id, name, kontext, stufe) {
		var a = eltern('a');
		a.className = 'su-zeile q' + (art === 'g' ? '' : '');
		a.href = zielFuer(art, id, name);
		a.appendChild(eltern('span', name));
		var teile = [kontext, stufe ? t('stufe') + ' ' + stufe : ''].filter(Boolean).join(' · ');
		if (teile) {
			var zusatz = eltern('span', teile);
			zusatz.className = 'su-zusatz';
			a.appendChild(zusatz);
		}
		liste.appendChild(a);
	}

	function zeichne() {
		var roh = feld.value.trim();
		var begriff = falten(roh);
		liste.textContent = '';
		hinweis.hidden = begriff.length >= 2;
		anzahl.textContent = '';
		if (begriff.length < 2) { return; }
		var treffer = daten.filter(function (row) {
			return falten(row[2]).indexOf(begriff) >= 0 ||
				(row[3] && falten(row[3]).indexOf(begriff) >= 0);
		});
		if (!treffer.length) {
			anzahl.textContent = '';
			liste.appendChild(eltern('p', t('su_keine')));
			return;
		}
		anzahl.textContent = ersetze(t('su_anzahl'), [treffer.length]);
		ARTEN.forEach(function (paar) {
			var art = paar[0];
			var eigene = treffer.filter(function (row) { return row[0] === art; });
			if (!eigene.length) { return; }
			var block = eltern('section');
			block.className = 'su-gruppe';
			block.appendChild(eltern('h3', t(paar[1]) + ' (' + eigene.length + ')'));
			var offen = geoeffnet[art] || eigene.length <= 10;
			var grenze = offen ? Math.min(eigene.length, 300) : 10;
			eigene.slice(0, grenze).forEach(function (row) {
				zeile(row[0], row[1], row[2], row[3], row[4]);
			});
			if (eigene.length > 10) {
				var knopf = eltern('button', offen
					? t('su_weniger')
					: ersetze(t('su_alle'), [eigene.length]));
				knopf.type = 'button';
				knopf.className = 'knopf sekundaer su-mehr';
				knopf.addEventListener('click', function () {
					geoeffnet[art] = !offen;
					zeichne();
				});
				block.appendChild(knopf);
			}
			liste.appendChild(block);
		});
	}

	window.MQL_SUCHE_ZEICHNEN = function () {
		daten = window.MQL_SUCHE || [];
		var parameter = new URLSearchParams(window.location.search);
		var q = parameter.get('q') || '';
		if (q) { feld.value = q; }
		zeichne();
		feld.focus();
	};
	if (window.MQL_SUCHE) { window.MQL_SUCHE_ZEICHNEN(); }
	feld.addEventListener('input', function () { geoeffnet = {}; zeichne(); });
})();
