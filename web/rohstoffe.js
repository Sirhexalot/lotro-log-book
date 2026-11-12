/* Crafting resources: what a profession gathers at each tier, and where those
 * spots lie. Data: vorkommen-<language>.js (build_vorkommen.py), the same file
 * the map's resource layer uses. Names and tier titles come from referenz.js.
 */
(function () {
	'use strict';
	if (window.MQL_HANDWERK_FILTER) { return; }

	var t = window.MQL_T || function (key) { return key; };
	var ersetze = window.MQL_ERSETZE || function (muster) { return String(muster); };
	var sprache = window.MQL_SPRACHE || 'de';
	var ziel = document.getElementById('rohstoffe-liste');
	if (!ziel) { return; }

	var REIHE = ['PROSPECTOR', 'FORESTER', 'SCHOLAR', 'COOK'];
	var FARBE = { PROSPECTOR: '#c48a3c', FORESTER: '#6f9f55', SCHOLAR: '#8b7fc4', COOK: '#c9a63f' };
	var berufe = (window.MQL_REFERENZ || {}).berufe || {};
	var daten = null;
	var beruf = '';
	// Default to the character's own professions; the checkbox opens the rest.
	var aktiv = window.MQL_SPEICHER && window.MQL_SPEICHER.aktiv ? window.MQL_SPEICHER.aktiv() : null;
	var eigene = aktiv && aktiv.handwerk ? Object.keys(aktiv.handwerk) : [];
	var alle = !eigene.length;
	var kartenName = {};
	var orte = {};

	function eltern(tag, inhalt) {
		var node = document.createElement(tag);
		if (inhalt != null) { node.textContent = inhalt; }
		return node;
	}
	function text(wert) { return wert ? (wert[sprache] || wert.en || '') : ''; }
	function zahl(wert) { return Number(wert).toLocaleString(t('locale')); }
	function berufName(schluessel) { return text((berufe[schluessel] || {}).n) || schluessel; }
	function stufenName(schluessel, stufe) {
		var liste = (berufe[schluessel] || {}).s || [];
		for (var i = 0; i < liste.length; i += 1) {
			if (liste[i].t === stufe) { return text(liste[i].k) || text(liste[i].m); }
		}
		return '';
	}

	/** Per resource kind the game areas it appears in, each with its map. */
	function vorbereiten() {
		kartenName = {};
		(daten.g || []).forEach(function (gebiet) { kartenName[gebiet[0]] = gebiet; });
		orte = {};
		(daten.m || []).forEach(function (gebiet) {
			var eintrag = kartenName[gebiet[0]];
			if (!eintrag) { return; }
			gebiet[1].forEach(function (paar) {
				if (!orte[paar[0]]) { orte[paar[0]] = []; }
				orte[paar[0]].push([eintrag[1], eintrag[2], paar[1]]);
			});
		});
	}

	function vorhandeneBerufe() {
		var da = {};
		(daten.k || []).forEach(function (eintrag) { da[eintrag[2]] = true; });
		var reihe = REIHE.filter(function (schluessel) { return da[schluessel]; });
		if (!alle && eigene.length) {
			var meine = reihe.filter(function (schluessel) { return eigene.indexOf(schluessel) >= 0; });
			// Professions that gather nothing would leave the tab empty.
			if (meine.length) { return meine; }
		}
		return reihe;
	}

	function karteLink(sorte, karte) {
		return '/' + sprache + '/' + ({ de: 'karte', en: 'map', fr: 'carte' }[sprache] || 'map') + '/?vorkommen=' + encodeURIComponent(sorte) +
			'&vorkarte=' + encodeURIComponent(karte);
	}

	function gebiete(sorte, nummer) {
		var liste = (orte[nummer] || []).slice().sort(function (a, b) { return b[2] - a[2]; });
		var feld = eltern('td', null);
		feld.className = 'roh-gebiete';
		if (!liste.length) {
			feld.textContent = '–';
			return feld;
		}
		liste.forEach(function (eintrag, i) {
			if (i) { feld.appendChild(document.createTextNode(', ')); }
			var link = eltern('a', eintrag[0]);
			link.href = karteLink(sorte, eintrag[1]);
			link.title = t('hw_roh_karte');
			feld.appendChild(link);
			feld.appendChild(eltern('span', ' (' + zahl(eintrag[2]) + ')'));
		});
		return feld;
	}

	function tabelle(schluessel, stufe, sorten) {
		var rahmen = eltern('div', null);
		rahmen.className = 'tabellen-rahmen';
		var tabelle = eltern('table', null);
		tabelle.className = 'tabelle roh-tabelle';
		var kopf = eltern('tr', null);
		['hw_roh_sorte', 'hw_roh_fundstellen', 'hw_roh_gebiet'].forEach(function (spalte) {
			var th = eltern('th', t(spalte));
			if (spalte !== 'hw_roh_sorte') { th.className = 'zahl'; }
			kopf.appendChild(th);
		});
		var thead = eltern('thead', null);
		thead.appendChild(kopf);
		tabelle.appendChild(thead);
		var tbody = eltern('tbody', null);
		var gesamt = 0;
		sorten.forEach(function (eintrag) {
			var nummer = eintrag[0];
			var sorte = eintrag[1];
			var anzahl = (orte[nummer] || []).reduce(function (summe, gebiet) { return summe + gebiet[2]; }, 0);
			gesamt += anzahl;
			var tr = eltern('tr', null);
			tr.dataset.kennung = (daten.k[nummer] || [])[0] || '';
			var name = eltern('td', null);
			var farbe = eltern('i', null);
			farbe.className = 'roh-farbe';
			farbe.style.background = FARBE[schluessel] || '#c48a3c';
			name.appendChild(farbe);
			name.appendChild(eltern('span', sorte));
			tr.appendChild(name);
			var menge = eltern('td', anzahl ? zahl(anzahl) : '–');
			menge.className = 'zahl';
			tr.appendChild(menge);
			tr.appendChild(gebiete((daten.k[nummer] || [])[0], nummer));
			tbody.appendChild(tr);
		});
		tabelle.appendChild(tbody);
		rahmen.appendChild(tabelle);
		return { rahmen: rahmen, gesamt: gesamt };
	}

	function zeichne() {
		ziel.textContent = '';
		if (!daten) { return; }
		var reihe = vorhandeneBerufe();
		if (!beruf || reihe.indexOf(beruf) < 0) { beruf = reihe[0] || ''; }

		if (eigene.length) {
			var kopf = eltern('div', null);
			kopf.className = 'rezept-zeile-kopf';
			var ueberschrift = eltern('h3', t('hw_berufe'));
			ueberschrift.className = 'rezept-ueberschrift';
			kopf.appendChild(ueberschrift);
			var feld = eltern('label', null);
			feld.className = 'rezept-haken';
			var haken = eltern('input', null);
			haken.type = 'checkbox';
			haken.checked = alle;
			haken.addEventListener('change', function () {
				alle = haken.checked;
				beruf = '';
				zeichne();
			});
			feld.appendChild(haken);
			feld.appendChild(eltern('span', t('hw_alle_berufe')));
			kopf.appendChild(feld);
			ziel.appendChild(kopf);
		}

		var leiste = eltern('div', null);
		leiste.className = 'rezept-berufe';
		reihe.forEach(function (schluessel) {
			var knopf = eltern('button', berufName(schluessel));
			knopf.type = 'button';
			knopf.className = 'rezept-knopf';
			knopf.setAttribute('aria-pressed', String(schluessel === beruf));
			var punkt = eltern('i', null);
			punkt.style.background = FARBE[schluessel] || '#c48a3c';
			knopf.insertBefore(punkt, knopf.firstChild);
			knopf.addEventListener('click', function () {
				beruf = schluessel;
				zeichne();
			});
			leiste.appendChild(knopf);
		});
		ziel.appendChild(leiste);

		if (!beruf) {
			ziel.appendChild(eltern('p', t('hw_roh_keine')));
			return;
		}
		if (beruf === 'COOK') { kochZutaten(); return; }

		// Group by tier, ascending; within a tier alphabetical by name.
		var stufen = {};
		daten.k.forEach(function (eintrag, nummer) {
			if (eintrag[2] !== beruf) { return; }
			if (!stufen[eintrag[3]]) { stufen[eintrag[3]] = []; }
			stufen[eintrag[3]].push([nummer, eintrag[1]]);
		});
		var nummern = Object.keys(stufen).map(Number).sort(function (a, b) { return a - b; });
		if (!nummern.length) {
			ziel.appendChild(eltern('p', t('hw_roh_keine')));
			return;
		}
		function anzahlVon(eintrag) {
			return (orte[eintrag[0]] || []).reduce(function (summe, gebiet) { return summe + gebiet[2]; }, 0);
		}
		function stufenTitel(stufe) {
			var titel = eltern('h3', null);
			titel.className = 'rezept-ueberschrift';
			titel.textContent = ersetze(t('hw_roh_stufe'), [stufe]) +
				(stufenName(beruf, stufe) ? ' · ' + stufenName(beruf, stufe) : '');
			return titel;
		}
		var gesamt = 0;
		nummern.forEach(function (stufe) {
			gesamt += stufen[stufe].reduce(function (summe, eintrag) {
				return summe + anzahlVon(eintrag);
			}, 0);
		});
		// No placements recorded for these resource kinds.
		if (!gesamt) {
			nummern.forEach(function (stufe) {
				ziel.appendChild(stufenTitel(stufe));
				var liste = eltern('p', null);
				liste.className = 'roh-ohne';
				liste.textContent = stufen[stufe]
					.sort(function (a, b) { return a[1].localeCompare(b[1], t('locale')); })
					.map(function (eintrag) { return eintrag[1]; }).join(' · ');
				ziel.appendChild(liste);
			});
			var ohne = eltern('p', t('hw_roh_keine'));
			ohne.className = 'schwach';
			ziel.appendChild(ohne);
			return;
		}
		nummern.forEach(function (stufe) {
			ziel.appendChild(stufenTitel(stufe));
			ziel.appendChild(tabelle(beruf, stufe, stufen[stufe].sort(function (a, b) {
				return a[1].localeCompare(b[1], t('locale'));
			})).rahmen);
		});
	}

	/** Recipe ingredients, not the incomplete gathering-node list. A tier means
	 * first use in a cooking recipe, never an invented gathering tier. */
	function kochZutaten() {
		var texte = {
			de: ['Zutaten nach ihrer ersten Verwendung in Kochrezepten. Auch Zwischenprodukte und Sonderzutaten sind enthalten.', 'Herstellbar: ', 'Keine Herkunft in den vorhandenen Daten belegt.'],
			en: ['Ingredients by their first use in cooking recipes. Includes intermediate products and special ingredients.', 'Crafted by: ', 'No sources recorded in the available data.'],
			fr: ['Ingrédients classés selon leur première utilisation en cuisine. Produits intermédiaires et ingrédients spéciaux inclus.', 'Fabrication : ', 'Aucune source attestée dans les données disponibles.']
		}[sprache];
		var rezepte = (window.MQL_REZEPTE || {}).r || [];
		var zutaten = {}, herstellung = {};
		rezepte.forEach(function (r) {
			[r[18], r[19]].filter(Boolean).forEach(function (id) {
				if (!herstellung[id]) { herstellung[id] = []; }
				if (!herstellung[id].some(function (alt) { return alt[10] === r[10]; })) { herstellung[id].push(r); }
			});
			if (r[9] !== 'COOK') { return; }
			(r[6] || []).forEach(function (z) {
				if (!z[3]) { return; }
				var alt = zutaten[z[3]];
				if (!alt || r[11] < alt.stufe) { zutaten[z[3]] = { id: z[3], name: z[0], stufe: r[11] }; }
			});
		});
		var hinweis = eltern('p', texte[0]);
		hinweis.className = 'schwach'; ziel.appendChild(hinweis);
		var stufe = null, liste;
		Object.keys(zutaten).map(function (id) { return zutaten[id]; }).sort(function (a, b) {
			return a.stufe - b.stufe || a.name.localeCompare(b.name, t('locale'));
		}).forEach(function (z) {
			if (stufe !== z.stufe) {
				stufe = z.stufe;
				var titel = eltern('h3', ersetze(t('hw_roh_stufe'), [stufe]) + ' · ' + stufenName('COOK', stufe));
				titel.className = 'rezept-ueberschrift'; ziel.appendChild(titel);
				liste = eltern('ul'); liste.className = 'koch-zutaten'; ziel.appendChild(liste);
			}
			var li = eltern('li'); li.dataset.zutat = z.id;
			var url = '/' + sprache + '/' + ({ de: 'gegenstand', en: 'item', fr: 'objet' }[sprache]) + '/' + z.id + '/';
			var link = eltern('a', z.name); link.href = url; li.appendChild(link);
			var quellen = herstellung[z.id] || [];
			if (quellen.length) {
				var quelle = eltern('div', texte[1]); quelle.className = 'schwach';
				quellen.forEach(function (r, i) {
					if (i) { quelle.appendChild(document.createTextNode(', ')); }
					var a = eltern('a', r[3] + ' · ' + r[0]);
					a.href = '/' + sprache + '/' + ({ de: 'rezept', en: 'recipe', fr: 'recette' }[sprache]) + '/' + r[10] + '/';
					quelle.appendChild(a);
				});
				li.appendChild(quelle);
			}
			if (window.MQL_ZUTATEN_HERKUNFT) { li.appendChild(window.MQL_ZUTATEN_HERKUNFT(url)); }
			else if (!quellen.length) { li.appendChild(eltern('div', texte[2])); }
			liste.appendChild(li);
		});
	}

	/** A link from the map names one kind: show its profession and mark the row. */
	function zeigeSorte(kennung) {
		var treffer = (daten.k || []).filter(function (eintrag) { return eintrag[0] === kennung; })[0];
		if (!treffer) { return; }
		beruf = treffer[2];
		if (eigene.indexOf(beruf) < 0) { alle = true; }
		zeichne();
		var zeilen = ziel.querySelectorAll('.roh-tabelle tbody tr');
		for (var i = 0; i < zeilen.length; i += 1) {
			if (zeilen[i].dataset.kennung === treffer[0]) {
				zeilen[i].classList.add('hervor');
				zeilen[i].scrollIntoView({ block: 'center' });
				return;
			}
		}
	}

	window.MQL_ROHSTOFFE_ZEICHNEN = function () {
		daten = window.MQL_VORKOMMEN;
		if (!daten || !daten.k) { return; }
		vorbereiten();
		var begriff = '';
		try { begriff = new URLSearchParams(window.location.search).get('rohstoff') || ''; } catch (fehler) { begriff = ''; }
		if (begriff) { zeigeSorte(begriff); } else { zeichne(); }
	};
})();
