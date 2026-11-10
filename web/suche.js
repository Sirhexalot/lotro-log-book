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
		['q', 'su_aufgaben'], ['d', 'su_taten'], ['g', 'su_gegenstaende'],
		['r', 'su_rezepte'], ['t', 'su_titel_tab'], ['v', 'menue_tugenden'], ['s', 'menue_sets'],
		['n', 'menue_auftraggeber']
	];
	var SYMBOL = { q: 'aufgabe', d: 'tat', g: 'gegenstand',
		r: 'rezept', t: 'titel', v: 'tugend', s: 'gegenstand', n: 'auftraggeber' };
	var ART_TEXT = {
		armour: { de: 'Rüstung', en: 'Armour', fr: 'Armure' },
		weapon: { de: 'Waffe', en: 'Weapon', fr: 'Arme' },
		jewellery: { de: 'Schmuck', en: 'Jewellery', fr: 'Bijoux' }
	};
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

	// Every item type now shares one namespace and one page per item.
	var GEGENSTAND = { de: 'gegenstand', en: 'item', fr: 'objet' }[sprache] || 'gegenstand';
	var TITEL = { de: 'titel', en: 'title', fr: 'titre' }[sprache] || 'titel';
	var TUGEND = { de: 'tugend', en: 'virtue', fr: 'vertu' }[sprache] || 'tugend';
	// Same language paths as the router; a hit leads straight to the page that
	// answers it instead of a 301 from an old flat address.
	var KARTE = { de: 'karte', en: 'map', fr: 'carte' }[sprache] || 'karte';
	var TATEN = { de: 'karte/taten', en: 'map/deeds', fr: 'carte/prouesses' }[sprache] || 'karte/taten';
	var BELOHNUNGEN = { de: 'belohnungen', en: 'rewards', fr: 'recompenses' }[sprache] || 'belohnungen';
	var HANDWERK = { de: 'handwerk/rezepte', en: 'crafting/recipes',
		fr: 'artisanat/recettes' }[sprache] || 'handwerk/rezepte';

	function zielFuer(art, id, name) {
		if (art === 's' && id) { return '/' + sprache + '/' + (sprache === 'fr' ? 'ensemble' : 'set') + '/' + id + '/'; }
		if (art === 'n' && id) {
			var giver = { de: 'auftraggeber', en: 'quest-giver', fr: 'donneur-de-quete' }[sprache];
			return '/' + sprache + '/' + giver + '/' + id + '/';
		}
		if (art === 'q') { return '/' + sprache + '/' + KARTE + '/?id=' + id; }
		if (art === 'd') { return '/' + sprache + '/' + TATEN + '/?id=' + id; }
		if (art === 'g' && id) { return '/' + sprache + '/' + GEGENSTAND + '/' + id + '/'; }
		if (art === 't' && id) { return '/' + sprache + '/' + TITEL + '/' + id + '/'; }
		if (art === 'v' && id) { return '/' + sprache + '/' + TUGEND + '/' + id + '/'; }
		if (art === 't' || art === 'v') { return '/' + sprache + '/' + BELOHNUNGEN + '/?tab=t&q=' + encodeURIComponent(name); }
		return '/' + sprache + '/' + HANDWERK + '/?q=' + encodeURIComponent(name) + '#rezepte';
	}

	function zeichen(art) {
		var span = eltern('span');
		span.className = 'su-symbol';
		if (window.MQL_SYMBOL) { span.innerHTML = window.MQL_SYMBOL(SYMBOL[art] || 'gebiet'); }
		return span;
	}

	function zeile(art, id, name, kontext, stufe, ziel) {
		var a = eltern('a');
		a.className = 'su-zeile';
		a.href = zielFuer(art, id, name);
		var haupt = eltern('span');
		haupt.className = 'su-haupt';
		haupt.appendChild(zeichen(art));
		haupt.appendChild(eltern('span', name));
		a.appendChild(haupt);
		if (art === 'g' && ART_TEXT[kontext]) { kontext = ART_TEXT[kontext][sprache] || kontext; }
		var teile = [kontext, stufe ? t('stufe') + ' ' + stufe : ''].filter(Boolean).join(' · ');
		if (teile) {
			var zusatz = eltern('span', teile);
			zusatz.className = 'su-zusatz';
			a.appendChild(zusatz);
		}
		(ziel || liste).appendChild(a);
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
			var kopf = eltern('h3');
			kopf.appendChild(zeichen(art));
			kopf.appendChild(eltern('span', t(paar[1]) + ' (' + eigene.length + ')'));
			block.appendChild(kopf);
			var offen = geoeffnet[art] || eigene.length <= 10;
			var grenze = offen ? Math.min(eigene.length, 300) : 10;
			eigene.slice(0, grenze).forEach(function (row) {
				zeile(row[0], row[1], row[2], row[3], row[4], block);
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
