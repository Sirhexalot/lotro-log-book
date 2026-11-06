/* Recipe browser: profession → tier → category, with the character's known
 * recipes from the Companion import. Data: rezepte-<language>.js. */
(function () {
	'use strict';
	var t = window.MQL_T || function (key) { return key; };
	var ziel = document.getElementById('rezepte-liste');
	if (!ziel) { return; }

	var grenze = 250;
	var daten = [];
	var prof = '';
	var stufe = '';
	var suche = '';
	var nurFehlende = false;
	var alleBerufe = false;
	var bekannt = {};
	var meineBerufe = {};

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
		if (nurFehlende) { return istMeinBeruf(wert) && !istBekannt(wert); }
		return true;
	}

	function marker(wert) {
		if (!hatSpielstand()) { return null; }
		var zeichen = eltern('span', istBekannt(wert) ? '✓' : (istMeinBeruf(wert) ? '○' : '–'));
		zeichen.className = 'rezept-stand ' + (istBekannt(wert) ? 'bekannt' : (istMeinBeruf(wert) ? 'fehlt' : 'fremd'));
		zeichen.title = istBekannt(wert) ? t('hw_bekannt')
			: (istMeinBeruf(wert) ? t('hw_fehlt') : t('hw_fremder_beruf'));
		return zeichen;
	}

	function menge(teil) {
		return (teil[1] > 1 ? teil[1] + ' × ' : '') + teil[0];
	}

	/** One recipe row: result, ingredients (optional and critical below), profession. */
	function zeile(wert, optionen) {
		var tr = document.createElement('tr');
		var name = document.createElement('td');
		name.className = 'q' + (wert[1] || 0);
		var zeichen = marker(wert);
		if (zeichen) { name.appendChild(zeichen); }
		name.appendChild(document.createTextNode(wert[0]));
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
		zutaten.appendChild(document.createTextNode(wert[6].map(menge).join(', ')));
		if (wert[7] && wert[7].length) {
			var optional = eltern('div', t('hw_optional') + ': ' + wert[7].map(menge).join(', '));
			optional.className = 'schwach';
			zutaten.appendChild(optional);
		}
		if (wert[8] && wert[8] !== wert[0]) {
			var kritisch = eltern('div', t('hw_kritisch_kurz') + ': ' + wert[8]);
			kritisch.className = 'rezept-kritisch';
			zutaten.appendChild(kritisch);
		}
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

	function zaehle(zeilen) {
		var bekanntAnzahl = zeilen.filter(istBekannt).length;
		if (nurFehlende) {
			anzahl.textContent = window.MQL_ERSETZE(t('hw_fehlende'), [zeilen.length]);
		} else if (!hatSpielstand()) {
			anzahl.textContent = window.MQL_ERSETZE(t('bl_anzahl'), [zeilen.length]);
		} else {
			anzahl.textContent = window.MQL_ERSETZE(t('hw_stand'), [bekanntAnzahl, zeilen.length]);
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
		anzahl = eltern('span');
		anzahl.className = 'stufe-klein';
		anzahl.id = 'rezept-anzahl';
		anzahl.setAttribute('role', 'status');
		steuerung.appendChild(anzahl);
		ziel.appendChild(steuerung);

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
		ziel.appendChild(berufKopf);

		berufZeile = eltern('div');
		berufZeile.className = 'rezept-berufe';
		berufZeile.id = 'rezept-berufe';
		ziel.appendChild(berufZeile);

		// Only a loaded character knows which recipes it already knows.
		if (hatSpielstand()) {
			fehlendFeld = eltern('label');
			fehlendFeld.className = 'rezept-filter';
			fehlendHaken = eltern('input');
			fehlendHaken.type = 'checkbox';
			fehlendFeld.appendChild(fehlendHaken);
			var filterText = eltern('span');
			filterText.className = 'rezept-filter-text';
			filterText.appendChild(eltern('span', t('hw_nur_fehlen')));
			var filterHinweis = eltern('span', t('hw_nur_fehlen_hint'));
			filterHinweis.className = 'schwach';
			filterText.appendChild(filterHinweis);
			fehlendFeld.appendChild(filterText);
		}

		stufenKopf = ueberschrift(t('hw_stufen'));
		ziel.appendChild(stufenKopf);
		stufenZeile = eltern('div');
		stufenZeile.className = 'rezept-stufen';
		stufenZeile.id = 'rezept-stufen';
		ziel.appendChild(stufenZeile);
		if (fehlendFeld) { ziel.appendChild(fehlendFeld); }

		inhalt = eltern('div');
		inhalt.id = 'rezept-inhalt';
		ziel.appendChild(inhalt);
		mehr = eltern('p');
		mehr.className = 'schwach';
		mehr.hidden = true;
		ziel.appendChild(mehr);

		sucheFeld.addEventListener('input', function () { suche = sucheFeld.value.trim(); zeichne(); });
		if (fehlendHaken) {
			fehlendHaken.addEventListener('change', function () {
				nurFehlende = fehlendHaken.checked;
				if (nurFehlende) {
					alleBerufe = false;
					alleHaken.checked = false;
					alleFeld.hidden = true;
					// Only the character's own professions can be missing anything.
					if (!istMeinBerufName(prof)) { prof = ''; }
				} else {
					alleFeld.hidden = false;
				}
				berufsListe();
				zeichne();
			});
		}
		if (alleHaken) {
			alleHaken.addEventListener('change', function () {
				alleBerufe = alleHaken.checked;
				if (!istMeinBerufName(prof)) { prof = ''; }
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
			eintrag.n += 1;
			if (istBekannt(wert)) { eintrag.bekannt += 1; }
		});
		var liste = Object.keys(namen).sort();
		// With a character, show only its professions unless "all" was asked for.
		if (hatSpielstand() && (nurFehlende || !alleBerufe)) {
			var eigene = liste.filter(function (name) { return meineBerufe[namen[name].key]; });
			if (eigene.length) { liste = eigene; }
		}
		if (!prof || liste.indexOf(prof) < 0) {
			// Start with the craft the character actually uses most.
			var sortiert = liste.slice().sort(function (a, b) { return namen[b].bekannt - namen[a].bekannt; });
			prof = sortiert.length ? sortiert[0] : '';
		}
		berufZeile.textContent = '';
		liste.forEach(function (name) {
			var eintrag = namen[name];
			var knopf = eltern('button', name + ' (' + eintrag.n + ')');
			knopf.type = 'button';
			knopf.className = 'rezept-knopf' + (name === prof ? ' aktiv' : '');
			knopf.setAttribute('aria-pressed', String(name === prof));
			knopf.setAttribute('data-prof', name);
			knopf.addEventListener('click', function () {
				prof = name;
				stufe = '';
				markiereBeruf();
				zeichne();
			});
			berufZeile.appendChild(knopf);
		});
	}

	function stufenListe() {
		var namen = {};
		daten.forEach(function (wert) {
			if (wert[3] !== prof || !wert[4]) { return; }
			var eintrag = namen[wert[4]] || (namen[wert[4]] = { n: 0, order: 999 });
			eintrag.n += 1;
			eintrag.order = Math.min(eintrag.order, wert[11] || 999);
		});
		var liste = Object.keys(namen).sort(function (a, b) { return namen[a].order - namen[b].order; });
		if (!liste.length) { stufenZeile.textContent = ''; stufenKopf.hidden = true; return; }
		stufenKopf.hidden = false;
		if (!stufe || !namen[stufe]) {
			stufe = liste[0];
		}
		stufenZeile.textContent = '';
		liste.forEach(function (name) {
			var knopf = eltern('button', name + ' (' + namen[name].n + ')');
			knopf.type = 'button';
			knopf.className = 'rezept-knopf' + (name === stufe ? ' aktiv' : '');
			knopf.setAttribute('aria-pressed', String(name === stufe));
			knopf.addEventListener('click', function () {
				stufe = name;
				zeichne();
			});
			stufenZeile.appendChild(knopf);
		});
	}

	function zeigeBaum() {
		stufenZeile.hidden = false;
		stufenKopf.hidden = false;
		stufenListe();
		var zeilen = daten.filter(function (wert) {
			return wert[3] === prof && wert[4] === stufe && passt(wert);
		});
		inhalt.textContent = '';
		if (!zeilen.length) {
			inhalt.appendChild(eltern('p', t('hw_keine_rezepte')));
			anzahl.textContent = '';
			mehr.hidden = true;
			return;
		}
		inhalt.appendChild(tabelle(nachKategorie(zeilen), { mitBeruf: false, mitStufe: false }));
		zaehle(zeilen);
		mehr.hidden = true;
	}

	/** All recipes the character is still missing, across every tier. */
	function zeigeFehlende() {
		stufenZeile.hidden = true;
		stufenKopf.hidden = true;
		var alle = daten.filter(function (wert) {
			return wert[3] === prof && istMeinBeruf(wert) && !istBekannt(wert);
		});
		inhalt.textContent = '';
		if (!alle.length) {
			inhalt.appendChild(eltern('p', t('hw_nichts_fehlt')));
			anzahl.textContent = '';
			mehr.hidden = true;
			return;
		}
		var zeilen = alle.slice(0, grenze);
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
		inhalt.appendChild(tabelle(gruppen, { mitBeruf: false, mitStufe: false }));
		zaehle(alle);
		mehr.hidden = alle.length <= grenze;
		mehr.textContent = window.MQL_ERSETZE(t('bl_mehr'), [alle.length - grenze]);
	}

	function zeigeSuche() {
		stufenZeile.hidden = true;
		stufenKopf.hidden = true;
		var text = suche.toLowerCase();
		var zeilen = daten.filter(function (wert) {
			if (!passt(wert)) { return false; }
			var heu = wert[0] + ' ' + wert[3] + ' ' + wert[4] + ' ' + wert[5] + ' ' +
				wert[6].map(function (teil) { return teil[0]; }).join(' ');
			return heu.toLowerCase().indexOf(text) >= 0;
		});
		inhalt.textContent = '';
		if (!zeilen.length) {
			inhalt.appendChild(eltern('p', t('bl_keine')));
			anzahl.textContent = '';
			mehr.hidden = true;
			return;
		}
		inhalt.appendChild(tabelle([{ name: '', zeilen: zeilen.slice(0, grenze) }],
			{ mitBeruf: true, mitStufe: true }));
		zaehle(zeilen);
		mehr.hidden = zeilen.length <= grenze;
		mehr.textContent = window.MQL_ERSETZE(t('bl_mehr'), [zeilen.length - grenze]);
	}

	function zeichne() {
		if (!daten.length) { return; }
		if (suche) { zeigeSuche(); } else if (nurFehlende) { zeigeFehlende(); } else { zeigeBaum(); }
	}

	// --- tabs -------------------------------------------------------------
	function reiter(wahl) {
		document.querySelectorAll('[data-hw]').forEach(function (knopf) {
			knopf.setAttribute('aria-pressed', String(knopf.getAttribute('data-hw') === wahl));
		});
		var berufe = document.getElementById('hw-berufe');
		var rezepte = document.getElementById('hw-rezepte');
		if (berufe) { berufe.hidden = wahl !== 'berufe'; }
		if (rezepte) { rezepte.hidden = wahl !== 'rezepte'; }
	}
	document.querySelectorAll('[data-hw]').forEach(function (knopf) {
		knopf.addEventListener('click', function () {
			var wahl = knopf.getAttribute('data-hw');
			reiter(wahl);
			if (wahl === 'rezepte' && location.hash !== '#rezepte') {
				try { history.replaceState(null, '', '#rezepte'); } catch (fehler) { /* file:// */ }
			}
		});
	});
	if (/rezepte/.test(location.hash) || /reiter=rezepte/.test(location.search)) { reiter('rezepte'); }

	// --- start ------------------------------------------------------------
	window.MQL_REZEPTE_ZEICHNEN = function () {
		if (!window.MQL_REZEPTE || !window.MQL_REZEPTE.r) { return; }
		daten = window.MQL_REZEPTE.r;
		charakter();
		baueSteuerung();
		berufsListe();
		zeichne();
	};
	if (window.MQL_REZEPTE) { window.MQL_REZEPTE_ZEICHNEN(); }
})();
