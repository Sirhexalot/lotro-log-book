/* Recipe browser: profession → tier → category, with the character's known
 * recipes from the Companion import. Data: rezepte-<language>.js. */
(function () {
	'use strict';
	var t = window.MQL_T || function (key) { return key; };
	var sprache = window.MQL_SPRACHE || 'de';
	var ziel = document.getElementById('rezepte-liste');
	if (!ziel) { return; }

	var grenze = 250;
	var daten = [];
	var prof = '';
	var stufe = '';
	var suche = '';
	var stufeGewaehlt = false;
	var nurFehlende = false;
	var alleBerufe = true;
	var kategorie = '';
	var sort = '';
	var kategorieFeld, filter, filterKnopf, sortFeld;
	var bekannt = {};
	var meineBerufe = {};

	var SEGMENT = {
		gegenstand: { de: 'gegenstand', en: 'item', fr: 'objet' },
		rezept: { de: 'rezept', en: 'recipe', fr: 'recette' }
	};

	function itemUrl(id) {
		return id ? '/' + sprache + '/' + SEGMENT.gegenstand[sprache] + '/' + id + '/' : '';
	}

	function recipeUrl(id) {
		return id ? '/' + sprache + '/' + SEGMENT.rezept[sprache] + '/' + id + '/' : '';
	}

	var steuerung, sucheFeld, fehlendFeld, fehlendHaken, alleFeld, alleHaken;
	var anzahl, berufZeile, stufenKopf, stufenZeile, inhalt, mehr;

	function charakter() {
		var speicher = window.MQL_SPEICHER;
		var aktiv = speicher && speicher.aktiv ? speicher.aktiv() : null;
		if (!aktiv) { return; }
		(aktiv.rezepte || []).forEach(function (id) { bekannt[id] = true; });
		Object.keys(aktiv.handwerk || {}).forEach(function (key) { meineBerufe[key] = true; });
	}

	/** True once a character with crafting data is loaded. */
	function hatSpielstand() {
		return Object.keys(meineBerufe).length > 0;
	}

	/** True when the import also brought the recipes the character knows. */
	function hatRezepte() {
		return Object.keys(bekannt).length > 0;
	}

	function eltern(tag, text) {
		var node = document.createElement(tag);
		if (text != null) { node.textContent = text; }
		return node;
	}

	/** Small label above a row of buttons. */
	function ueberschrift(text) {
		var node = eltern('h3', text);
		node.className = 'rezept-ueberschrift';
		return node;
	}

	// --- helpers ----------------------------------------------------------
	function art(wert) { return wert[9] || ''; }
	function id(wert) { return wert[10] || ''; }
	function istBekannt(wert) { return bekannt[id(wert)] === true; }
	function istMeinBeruf(wert) { return meineBerufe[art(wert)] === true; }
	function passt(wert) {
		return !nurFehlende || !istBekannt(wert);
	}
	function filterPasst(wert, ohne) {
		var text = suche.toLocaleLowerCase();
		return (ohne === 'beruf' || !prof || wert[3] === prof)
			&& (ohne === 'stufe' || !stufe || wert[4] === stufe)
			&& (ohne === 'kategorie' || !kategorie || wert[5] === kategorie)
			&& (alleBerufe || !hatSpielstand() || istMeinBeruf(wert)) && passt(wert)
			&& (!text || [wert[0], wert[3], wert[4], wert[5], wert[6].map(function (z) { return z[0]; }).join(' ')].join(' ').toLocaleLowerCase().indexOf(text) >= 0);
	}

	function marker(wert) {
		if (!hatRezepte()) { return null; }
		var zeichen = eltern('span', istBekannt(wert) ? '✓' : (istMeinBeruf(wert) ? '○' : '–'));
		zeichen.className = 'rezept-stand ' + (istBekannt(wert) ? 'bekannt' : (istMeinBeruf(wert) ? 'fehlt' : 'fremd'));
		zeichen.title = istBekannt(wert) ? t('hw_bekannt')
			: (istMeinBeruf(wert) ? t('hw_fehlt') : t('hw_fremder_beruf'));
		return zeichen;
	}

	function menge(teil) {
		return (teil[1] > 1 ? teil[1] + ' × ' : '') + teil[0];
	}

	/** The client's 32×32 symbol, one file per symbol ID and language-neutral. */
	function bild(symbol) {
		if (!symbol) { return null; }
		var img = eltern('img');
		img.className = 'symbol';
		img.src = '/bild/items/' + symbol + '.webp';
		img.alt = '';
		img.width = 22;
		img.height = 22;
		img.loading = 'lazy';
		img.decoding = 'async';
		return img;
	}

	/** Ingredients keep their symbol beside the name, not in a separate column. */
	function zutat(teil) {
		var id = teil[3] || '';
		var stueck = eltern(id ? 'a' : 'span');
		stueck.className = 'zutat';
		if (id) { stueck.href = itemUrl(id); }
		var symbol = bild(teil[2]);
		if (symbol) { stueck.appendChild(symbol); }
		stueck.appendChild(document.createTextNode(menge(teil)));
		return stueck;
	}

	function zutatenZeile(teile, zusatz) {
		var zeile = eltern('span');
		zeile.className = 'zutaten-zeile';
		teile.forEach(function (teil, nummer) {
			if (nummer) { zeile.appendChild(document.createTextNode(', ')); }
			var stueck = eltern('span');
			stueck.className = 'zutat-mit-herkunft';
			stueck.appendChild(zutat(teil));
			if (teil[3] && window.MQL_ZUTATEN_HERKUNFT) {
				stueck.appendChild(window.MQL_ZUTATEN_HERKUNFT(itemUrl(teil[3])));
			}
			zeile.appendChild(stueck);
		});
		if (zusatz) { zeile.appendChild(document.createTextNode(zusatz)); }
		return zeile;
	}

	/** One recipe row: result, ingredients (optional and critical below), profession. */
	function zeile(wert, optionen) {
		var tr = document.createElement('tr');
		var name = document.createElement('td');
		name.className = 'q' + (wert[1] || 0);
		var zeichen = marker(wert);
		if (zeichen) { name.appendChild(zeichen); }
		var ergebnis = bild(wert[16]);
		if (ergebnis) { name.appendChild(ergebnis); }
		var ergebnisLink = eltern(wert[18] ? 'a' : 'span', wert[0]);
		if (wert[18]) { ergebnisLink.href = itemUrl(wert[18]); }
		name.appendChild(ergebnisLink);
		if (optionen.mitStufe && wert[2]) {
			var stufeText = eltern('span', ' · ' + t('stufe') + ' ' + wert[2]);
			stufeText.className = 'bl-stufe';
			name.appendChild(stufeText);
		}
		tr.appendChild(name);
		if (optionen.mitBeruf) {
			var beruf = eltern('td', [wert[3], wert[4]].filter(Boolean).join(' · '));
			beruf.className = 'rezept-beruf';
			tr.appendChild(beruf);
		}
		var zutaten = eltern('td');
		zutaten.className = 'rezept-zutaten';
		zutaten.appendChild(zutatenZeile(wert[6]));
		var extra = eltern('details');
		extra.appendChild(eltern('summary', t('hw_weitere_angaben')));
		if (wert[7] && wert[7].length) {
			var optional = eltern('div');
			optional.className = 'schwach';
			optional.appendChild(document.createTextNode(t('hw_optional') + ': '));
			wert[7].forEach(function (teil, nummer) {
				if (nummer) { optional.appendChild(document.createTextNode(', ')); }
				var stueck = eltern('span');
				stueck.className = 'zutat';
				var symbol = bild(teil[3]);
				if (symbol) { stueck.appendChild(symbol); }
				var optionalLink = eltern(teil[4] ? 'a' : 'span', menge(teil) +
					(teil[2] ? ' (' + Math.round(teil[2] * 100) + ' %)' : ''));
				if (teil[4]) { optionalLink.href = itemUrl(teil[4]); }
				stueck.appendChild(optionalLink);
				if (teil[4] && window.MQL_ZUTATEN_HERKUNFT) {
					stueck.appendChild(window.MQL_ZUTATEN_HERKUNFT(itemUrl(teil[4])));
				}
				optional.appendChild(stueck);
			});
			extra.appendChild(optional);
		}
		if (wert[8] && wert[8] !== wert[0]) {
			var kritisch = eltern('div');
			kritisch.className = 'rezept-kritisch';
			kritisch.appendChild(document.createTextNode(t('hw_kritisch_kurz') + ': '));
			var symbol = bild(wert[17]);
			if (symbol) { kritisch.appendChild(symbol); }
			var kritischLink = eltern(wert[19] ? 'a' : 'span', wert[8]);
			if (wert[19]) { kritischLink.href = itemUrl(wert[19]); }
			kritisch.appendChild(kritischLink);
			extra.appendChild(kritisch);
		}
		var meta = [];
		if (wert[12]) { meta.push(t('hw_kritisch_kurz') + ' ' + wert[12] + ' %'); }
		if (wert[13]) { meta.push(wert[13] + ' s'); }
		if (meta.length) {
			var angaben = eltern('div', meta.join(' · '));
			angaben.className = 'schwach rezept-meta';
			extra.appendChild(angaben);
		}
		var detail = eltern('div');
		detail.className = 'rezept-detail';
		var detailLink = eltern('a', t('hw_rezept_details'));
		detailLink.href = recipeUrl(wert[10]);
		detail.appendChild(detailLink);
		if (extra.children.length > 1) { zutaten.appendChild(extra); }
		zutaten.appendChild(detail);
		tr.appendChild(zutaten);
		return tr;
	}

	/** One table whose sections are group rows, so the header appears once. */
	function tabelle(gruppen, optionen) {
		var rahmen = eltern('div');
		rahmen.className = 'tabellen-rahmen';
		var tabelle = eltern('table');
		tabelle.className = 'tabelle rezept-tabelle';
		var kopf = eltern('thead');
		var kopfZeile = eltern('tr');
		[['hw_ergebnis'], optionen.mitBeruf ? ['hw_beruf'] : null, ['hw_zutaten']]
			.filter(Boolean).forEach(function (spalte) {
				kopfZeile.appendChild(eltern('th', t(spalte[0])));
			});
		kopf.appendChild(kopfZeile);
		tabelle.appendChild(kopf);
		var spalten = optionen.mitBeruf ? 3 : 2;
		gruppen.forEach(function (gruppe) {
			var koerper = eltern('tbody');
			if (gruppe.name) {
				var kopfZeileGruppe = eltern('tr');
				kopfZeileGruppe.className = gruppe.klasse || 'rezept-gruppe';
				var zelle = eltern('th', gruppe.name);
				zelle.colSpan = spalten;
				kopfZeileGruppe.appendChild(zelle);
				koerper.appendChild(kopfZeileGruppe);
			}
			gruppe.zeilen.forEach(function (wert) { koerper.appendChild(zeile(wert, optionen)); });
			tabelle.appendChild(koerper);
		});
		rahmen.appendChild(tabelle);
		return rahmen;
	}

	function nachKategorie(zeilen) {
		var gruppen = {}, reihenfolge = [];
		zeilen.forEach(function (wert) {
			var name = wert[5] || '';
			if (!gruppen[name]) { gruppen[name] = []; reihenfolge.push(name); }
			gruppen[name].push(wert);
		});
		return reihenfolge.map(function (name) { return { name: name, zeilen: gruppen[name] }; });
	}

	/** Numbers for the current selection: filtered count against its total. */
	function zaehle(gezeigt, gesamt, bekannt) {
		if (nurFehlende) {
			anzahl.textContent = window.MQL_ERSETZE(t('hw_fehlende_von'), [gezeigt, gesamt]);
		} else if (!hatRezepte()) {
			anzahl.textContent = window.MQL_ERSETZE(t('bl_anzahl'), [gesamt]);
		} else {
			anzahl.textContent = window.MQL_ERSETZE(t('hw_stand'), [bekannt, gesamt]);
		}
	}

	// --- controls ---------------------------------------------------------
	function baueSteuerung() {
		ziel.textContent = '';
		steuerung = eltern('div');
		steuerung.className = 'rezept-steuerung';
		sucheFeld = eltern('input');
		sucheFeld.type = 'search';
		sucheFeld.id = 'rezept-suche';
		sucheFeld.setAttribute('placeholder', t('hw_rezept_suche'));
		sucheFeld.setAttribute('aria-label', t('hw_rezept_suche'));
		steuerung.appendChild(sucheFeld);
		// Without known recipes the filter could not hide anything; say so.
		if (hatSpielstand() && !hatRezepte()) {
			var ohneRezepte = eltern('p', t('hw_ohne_rezepte'));
			ohneRezepte.className = 'schwach';
			ziel.appendChild(ohneRezepte);
		}
		anzahl = eltern('span');
		anzahl.className = 'stufe-klein';
		anzahl.id = 'rezept-anzahl';
		anzahl.setAttribute('role', 'status');
		steuerung.appendChild(anzahl);
		ziel.appendChild(steuerung);
		var raster = eltern('div');
		raster.className = 'hw-raster';
		filter = eltern('aside');
		filter.className = 'hw-filter';
		filter.id = 'rezept-filter';
		filterKnopf = eltern('button', t('hw_filter'));
		filterKnopf.type = 'button';
		filterKnopf.className = 'hw-filter-knopf';
		filterKnopf.setAttribute('aria-expanded', 'false');
		filterKnopf.setAttribute('aria-controls', 'rezept-filter');
		filterKnopf.addEventListener('click', function () {
			var offen = filterKnopf.getAttribute('aria-expanded') !== 'true';
			filterKnopf.setAttribute('aria-expanded', String(offen));
			filter.classList.toggle('offen', offen);
		});
		ziel.appendChild(filterKnopf);
		ziel.appendChild(raster);
		raster.appendChild(filter);
		var treffer = eltern('div');
		treffer.className = 'hw-treffer';
		raster.appendChild(treffer);
		var reset = eltern('button', t('hw_zuruecksetzen'));
		reset.type = 'button';
		reset.addEventListener('click', function () {
			prof = ''; stufe = ''; kategorie = ''; suche = ''; nurFehlende = false;
			alleBerufe = true; sort = ''; sucheFeld.value = '';
			if (sortFeld) { sortFeld.value = 'name'; }
			if (alleHaken) { alleHaken.checked = true; }
			if (fehlendHaken) { fehlendHaken.checked = false; }
			if (window.MQL_FILTER) { window.MQL_FILTER.clear('rezepte', sprache); }
			grenze = 100; berufsListe(); zeichne();
		});
		filter.appendChild(reset);

		var berufKopf = eltern('div');
		berufKopf.className = 'rezept-zeile-kopf';
		berufKopf.appendChild(ueberschrift(t('hw_berufe')));
		if (hatSpielstand()) {
			alleFeld = eltern('label');
			alleFeld.className = 'rezept-haken';
			alleHaken = eltern('input');
			alleHaken.type = 'checkbox';
			alleFeld.appendChild(alleHaken);
			alleFeld.appendChild(eltern('span', t('hw_alle_berufe')));
			berufKopf.appendChild(alleFeld);
		}
		filter.appendChild(berufKopf);

		berufZeile = eltern('div');
		berufZeile.className = 'rezept-berufe';
		berufZeile.id = 'rezept-berufe';
		filter.appendChild(berufZeile);

		// Only without known recipes the filter would hide nothing.
		if (hatRezepte()) {
			fehlendFeld = eltern('label');
			fehlendFeld.className = 'rezept-filter';
			fehlendHaken = eltern('input');
			fehlendHaken.type = 'checkbox';
			fehlendFeld.appendChild(fehlendHaken);
			var filterText = eltern('span');
			filterText.className = 'rezept-filter-text';
			filterText.appendChild(eltern('span', t('hw_nur_fehlen')));
			fehlendFeld.appendChild(filterText);
		}

		stufenKopf = ueberschrift(t('hw_stufen'));
		filter.appendChild(stufenKopf);
		stufenZeile = eltern('div');
		stufenZeile.className = 'rezept-stufen';
		stufenZeile.id = 'rezept-stufen';
		filter.appendChild(stufenZeile);
		filter.appendChild(ueberschrift(t('hw_kategorie')));
		kategorieFeld = eltern('select');
		kategorieFeld.setAttribute('aria-label', t('hw_kategorie'));
		kategorieFeld.id = 'rezept-kategorie';
		kategorieFeld.addEventListener('change', function () { kategorie = kategorieFeld.value; grenze = 100; zeichne(); });
		filter.appendChild(kategorieFeld);
		if (fehlendFeld) { filter.appendChild(fehlendFeld); }

		var sortZeile = eltern('div');
		sortZeile.className = 'rezept-sortierung';
		var sortLabel = eltern('label', t('hw_sort'));
		sortLabel.htmlFor = 'rezept-sort';
		sortZeile.appendChild(sortLabel);
		sortFeld = eltern('select');
		sortFeld.id = 'rezept-sort';
		[['name', t('hw_sort_name')], ['stufe', t('hw_sort_stufe')]].forEach(function (paar) {
			var option = eltern('option', paar[1]);
			option.value = paar[0];
			sortFeld.appendChild(option);
		});
		sortFeld.addEventListener('change', function () {
			sort = sortFeld.value === 'stufe' ? 'stufe' : '';
			grenze = 100;
			zeichne();
		});
		sortZeile.appendChild(sortFeld);
		treffer.appendChild(sortZeile);

		inhalt = eltern('div');
		inhalt.id = 'rezept-inhalt';
		treffer.appendChild(inhalt);
		mehr = eltern('button', t('hw_mehr'));
		mehr.type = 'button';
		mehr.addEventListener('click', function () { grenze += 100; zeichne(); });
		mehr.hidden = true;
		treffer.appendChild(mehr);

		sucheFeld.addEventListener('input', function () { suche = sucheFeld.value.trim(); grenze = 100; zeichne(); });
		if (fehlendHaken) {
			fehlendHaken.addEventListener('change', function () {
				// Filter only: the chosen profession and tier stay as they are.
				nurFehlende = fehlendHaken.checked;
				zeichne();
			});
		}
		if (alleHaken) {
			alleHaken.addEventListener('change', function () {
				alleBerufe = alleHaken.checked;
				if (!alleBerufe && !istMeinBerufName(prof)) { prof = ''; }
				berufsListe();
				zeichne();
			});
		}
	}

	function istMeinBerufName(name) {
		return !name || daten.some(function (wert) { return wert[3] === name && istMeinBeruf(wert); });
	}

	// --- views ------------------------------------------------------------
	/** Keep the visible selection in step with `prof`; the row is built anew. */
	function markiereBeruf() {
		Array.prototype.forEach.call(berufZeile.children, function (knopf) {
			var aktiv = knopf.getAttribute('data-prof') === prof;
			knopf.classList.toggle('aktiv', aktiv);
			knopf.setAttribute('aria-pressed', String(aktiv));
		});
	}

	function berufsListe() {
		var namen = {};
		daten.forEach(function (wert) {
			if (!wert[3]) { return; }
			var eintrag = namen[wert[3]] || (namen[wert[3]] = { n: 0, bekannt: 0, key: art(wert) });
			if (filterPasst(wert, 'beruf')) { eintrag.n += 1; }
			if (istBekannt(wert)) { eintrag.bekannt += 1; }
		});
		var liste = Object.keys(namen).sort();
		// With a character, show only its professions unless "all" was asked for.
		if (hatSpielstand() && !alleBerufe) {
			var eigene = liste.filter(function (name) { return meineBerufe[namen[name].key]; });
			if (eigene.length) { liste = eigene; }
		}
		berufZeile.textContent = '';
		var alle = eltern('button', t('hw_alle_berufe'));
		alle.type = 'button';
		alle.setAttribute('data-prof', '');
		alle.addEventListener('click', function () { prof = ''; zeichne(); });
		berufZeile.appendChild(alle);
		liste.forEach(function (name) {
			var eintrag = namen[name];
			var knopf = eltern('button', name + ' (' + eintrag.n + ')');
			knopf.type = 'button';
			knopf.className = 'rezept-knopf' + (name === prof ? ' aktiv' : '');
			knopf.setAttribute('aria-pressed', String(name === prof));
			knopf.setAttribute('data-prof', name);
			knopf.addEventListener('click', function () {
				prof = name;
				markiereBeruf();
				zeichne();
			});
			berufZeile.appendChild(knopf);
		});
	}

	function stufenListe() {
		var namen = {}, gesamt = 0;
		daten.forEach(function (wert) {
			if (filterPasst(wert, 'stufe')) { gesamt += 1; }
			if ((prof && wert[3] !== prof) || !wert[4]) { return; }
			var eintrag = namen[wert[4]] || (namen[wert[4]] = { n: 0, order: 999 });
			if (filterPasst(wert, 'stufe')) { eintrag.n += 1; }
			eintrag.order = Math.min(eintrag.order, wert[11] || 999);
		});
		var liste = Object.keys(namen).sort(function (a, b) { return namen[a].order - namen[b].order; });
		if (!liste.length) { stufenZeile.textContent = ''; stufenKopf.hidden = true; return; }
		stufenKopf.hidden = false;
		// Start on the first tier; "all tiers" is a choice, not the default.
		stufenZeile.textContent = '';
		var alle = eltern('button', t('hw_alle_stufen') + ' (' + gesamt + ')');
		alle.type = 'button';
		alle.className = 'rezept-knopf' + (stufe === '' ? ' aktiv' : '');
		alle.setAttribute('aria-pressed', String(stufe === ''));
		alle.addEventListener('click', function () { stufe = ''; stufeGewaehlt = true; zeichne(); });
		stufenZeile.appendChild(alle);
		liste.forEach(function (name) {
			var knopf = eltern('button', name + ' (' + namen[name].n + ')');
			knopf.type = 'button';
			knopf.className = 'rezept-knopf' + (name === stufe ? ' aktiv' : '');
			knopf.setAttribute('aria-pressed', String(name === stufe));
			knopf.addEventListener('click', function () {
				stufe = name;
				stufeGewaehlt = true;
				zeichne();
			});
			stufenZeile.appendChild(knopf);
		});
	}

	function zeigeBaum() {
		stufenZeile.hidden = false;
		stufenKopf.hidden = false;
		stufenListe();
		var basis = daten.filter(function (wert) {
			return wert[3] === prof && (!stufe || wert[4] === stufe);
		});
		var zeilen = basis.filter(passt);
		var bekannt = basis.filter(istBekannt).length;
		inhalt.textContent = '';
		if (!zeilen.length) {
			inhalt.appendChild(eltern('p', nurFehlende ? t('hw_nichts_fehlt') : t('hw_keine_rezepte')));
			if (basis.length) { zaehle(0, basis.length, bekannt); } else { anzahl.textContent = ''; }
			mehr.hidden = true;
			return;
		}
		var sichtbar = zeilen.slice(0, grenze);
		var gruppen = stufe ? nachKategorie(sichtbar) : nachStufeUndKategorie(sichtbar);
		// In a tier where nothing is known the filter cannot remove a row; say why.
		if (nurFehlende && zeilen.length === basis.length) {
			var erklärung = eltern('p', t('hw_nichts_ausgeblendet'));
			erklärung.className = 'schwach';
			inhalt.appendChild(erklärung);
		}
		inhalt.appendChild(tabelle(gruppen, { mitBeruf: false, mitStufe: false }));
		zaehle(zeilen.length, basis.length, bekannt);
		mehr.hidden = zeilen.length <= grenze;
		mehr.textContent = zeilen.length > grenze
			? window.MQL_ERSETZE(t('bl_mehr'), [zeilen.length - grenze]) : '';
	}

	/** Tier headings with their categories, for the view across all tiers. */
	function nachStufeUndKategorie(zeilen) {
		var nachStufe = {};
		zeilen.forEach(function (wert) {
			var name = wert[4] || '';
			if (!nachStufe[name]) { nachStufe[name] = { order: wert[11] || 999, zeilen: [] }; }
			nachStufe[name].order = Math.min(nachStufe[name].order, wert[11] || 999);
			nachStufe[name].zeilen.push(wert);
		});
		var gruppen = [];
		Object.keys(nachStufe)
			.sort(function (a, b) { return nachStufe[a].order - nachStufe[b].order; })
			.forEach(function (name) {
				if (name) { gruppen.push({ name: name, zeilen: [], klasse: 'rezept-stufe' }); }
				nachKategorie(nachStufe[name].zeilen).forEach(function (gruppe) { gruppen.push(gruppe); });
			});
		return gruppen;
	}

	function zeigeSuche() {
		stufenZeile.hidden = true;
		stufenKopf.hidden = true;
		var text = suche.toLowerCase();
		var basis = daten.filter(function (wert) {
			var heu = wert[0] + ' ' + wert[3] + ' ' + wert[4] + ' ' + wert[5] + ' ' +
				wert[6].map(function (teil) { return teil[0]; }).join(' ');
			return heu.toLowerCase().indexOf(text) >= 0;
		});
		var zeilen = basis.filter(passt);
		inhalt.textContent = '';
		if (!zeilen.length) {
			inhalt.appendChild(eltern('p', t('bl_keine')));
			if (basis.length) {
				zaehle(0, basis.length, basis.filter(istBekannt).length);
			} else {
				anzahl.textContent = '';
			}
			mehr.hidden = true;
			return;
		}
		inhalt.appendChild(tabelle([{ name: '', zeilen: zeilen.slice(0, grenze) }],
			{ mitBeruf: true, mitStufe: true }));
		zaehle(zeilen.length, basis.length, basis.filter(istBekannt).length);
		mehr.hidden = zeilen.length <= grenze;
		mehr.textContent = window.MQL_ERSETZE(t('bl_mehr'), [zeilen.length - grenze]);
	}

	function zeichne() {
		if (!daten.length) { return; }
		berufsListe();
		markiereBeruf();
		stufenListe();
		var text = suche.toLocaleLowerCase();
		var basis = daten.filter(function (wert) {
			return (!prof || wert[3] === prof) && (!stufe || wert[4] === stufe)
				&& (alleBerufe || !hatSpielstand() || istMeinBeruf(wert))
				&& (!text || [wert[0], wert[3], wert[4], wert[5], wert[6].map(function (z) { return z[0]; }).join(' ')].join(' ').toLocaleLowerCase().indexOf(text) >= 0);
		});
		var kategorien = {};
		basis.forEach(function (wert) { if (wert[5]) { kategorien[wert[5]] = (kategorien[wert[5]] || 0) + 1; } });
		kategorieFeld.textContent = '';
		var alle = eltern('option', t('hw_alle_kategorien')); alle.value = ''; kategorieFeld.appendChild(alle);
		if (kategorie && !kategorien[kategorie]) { kategorien[kategorie] = 0; }
		Object.keys(kategorien).sort().forEach(function (name) {
			var option = eltern('option', name + ' (' + kategorien[name] + ')');
			option.value = name; kategorieFeld.appendChild(option);
		});
		kategorieFeld.value = kategorie;
		basis = basis.filter(function (wert) { return !kategorie || wert[5] === kategorie; });
		var zeilen = basis.filter(passt);
		zeilen.sort(function (a, b) {
			if (sort === 'stufe') {
				var la = a[2] || 0, lb = b[2] || 0;
				if (!la && lb) { return 1; }
				if (la && !lb) { return -1; }
				if (la !== lb) { return la - lb; }
			}
			return String(a[0]).localeCompare(String(b[0]), sprache);
		});
		if (sortFeld) { sortFeld.value = sort || 'name'; }
		inhalt.textContent = '';
		if (zeilen.length) { inhalt.appendChild(tabelle([{name: '', zeilen: zeilen.slice(0, grenze)}], {mitBeruf: true, mitStufe: true})); }
		else { inhalt.appendChild(eltern('p', t('hw_keine_rezepte'))); }
		anzahl.textContent = window.MQL_ERSETZE(t('bl_anzahl'), [zeilen.length]);
		mehr.hidden = zeilen.length <= grenze;
		mehr.textContent = t('hw_mehr');
		var url = new URL(location.href);
		var beruf = daten.find(function (wert) { return wert[3] === prof; });
		var tier = daten.find(function (wert) { return wert[4] === stufe; });
		[['beruf', beruf ? art(beruf) : ''], ['stufe', stufe && tier ? tier[11] : ''], ['kategorie', kategorie], ['q', suche], ['fehlend', nurFehlende ? '1' : ''], ['eigene', !alleBerufe ? '1' : ''], ['sort', sort]].forEach(function (paar) {
			if (paar[1] !== '') { url.searchParams.set(paar[0], paar[1]); } else { url.searchParams.delete(paar[0]); }
		});
		history.replaceState(null, '', url);
		if (window.MQL_FILTER) {
			window.MQL_FILTER.write('rezepte', sprache, url.search.replace(/^\?/, ''));
		}
	}

	// --- tabs -------------------------------------------------------------
	function reiter(wahl) {
		document.querySelectorAll('[data-hw]').forEach(function (knopf) {
			knopf.setAttribute('aria-pressed', String(knopf.getAttribute('data-hw') === wahl));
		});
		var berufe = document.getElementById('hw-berufe');
		var rezepte = document.getElementById('hw-rezepte');
		var rohstoffe = document.getElementById('hw-rohstoffe');
		if (berufe) { berufe.hidden = wahl !== 'berufe'; }
		if (rezepte) { rezepte.hidden = wahl !== 'rezepte'; }
		if (rohstoffe) { rohstoffe.hidden = wahl !== 'rohstoffe'; }
	}
	document.querySelectorAll('[data-hw]').forEach(function (knopf) {
		knopf.addEventListener('click', function () {
			var wahl = knopf.getAttribute('data-hw');
			reiter(wahl);
			try { history.replaceState(null, '', '#' + wahl); } catch (fehler) { /* file:// */ }
			if (wahl === 'rezepte' && location.hash !== '#rezepte') {
				try { history.replaceState(null, '', '#rezepte'); } catch (fehler) { /* file:// */ }
			}
			if (wahl === 'rohstoffe' && location.hash !== '#rohstoffe') {
				try { history.replaceState(null, '', '#rohstoffe'); } catch (fehler) { /* file:// */ }
			}
		});
	});
	if (/rezepte/.test(location.hash) || /reiter=rezepte/.test(location.search)) { reiter('rezepte'); }
	if (/rohstoffe/.test(location.hash) || /reiter=rohstoffe/.test(location.search)) { reiter('rohstoffe'); }

	// --- start ------------------------------------------------------------
	window.MQL_REZEPTE_ZEICHNEN = function () {
		if (!window.MQL_REZEPTE || !window.MQL_REZEPTE.r) { return; }
		daten = window.MQL_REZEPTE.r;
		charakter();
		// A bare page returns to the last recipe filters used in this browser.
		if (window.MQL_FILTER && !location.search) {
			var gespeichert = window.MQL_FILTER.read('rezepte', sprache);
			if (gespeichert) {
				try { history.replaceState(null, '', location.pathname + '?' + gespeichert + location.hash); }
				catch (fehler) { /* file:// */ }
			}
		}
		var parameter = new URLSearchParams(location.search);
		var berufWahl = daten.find(function (wert) { return art(wert) === parameter.get('beruf'); });
		prof = berufWahl ? berufWahl[3] : '';
		var stufenWahl = daten.find(function (wert) { return String(wert[11]) === parameter.get('stufe'); });
		stufe = stufenWahl ? stufenWahl[4] : '';
		kategorie = parameter.get('kategorie') || '';
		sort = parameter.get('sort') === 'stufe' ? 'stufe' : '';
		nurFehlende = parameter.get('fehlend') === '1' && hatRezepte();
		alleBerufe = parameter.has('eigene') ? parameter.get('eigene') !== '1' : (!hatSpielstand() || !!prof);
		grenze = 100;
		baueSteuerung();
		if (alleHaken) { alleHaken.checked = alleBerufe; }
		if (fehlendHaken) { fehlendHaken.checked = nurFehlende; }
		berufsListe();
		// A link from the search page opens the recipe already searched for.
		var begriff = new URLSearchParams(window.location.search).get('q');
		if (begriff) {
			suche = begriff;
			if (sucheFeld) { sucheFeld.value = begriff; }
		}
		zeichne();
		reiter(/rohstoffe/.test(location.hash) ? 'rohstoffe' : /berufe/.test(location.hash) ? 'berufe' : 'rezepte');
	};
	if (window.MQL_REZEPTE) { window.MQL_REZEPTE_ZEICHNEN(); }
})();
