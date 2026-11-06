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
	var bekannt = {};
	var meineBerufe = {};

	function charakter() {
		var speicher = window.MQL_SPEICHER;
		var aktiv = speicher && speicher.aktiv ? speicher.aktiv() : null;
		if (!aktiv) { return; }
		(aktiv.rezepte || []).forEach(function (id) { bekannt[id] = true; });
		Object.keys(aktiv.handwerk || {}).forEach(function (key) { meineBerufe[key] = true; });
	}

	// --- controls ---------------------------------------------------------
	var steuerung = document.createElement('div');
	steuerung.className = 'rezept-steuerung';
	var sucheFeld = document.createElement('input');
	sucheFeld.type = 'search';
	sucheFeld.id = 'rezept-suche';
	sucheFeld.setAttribute('placeholder', t('hw_rezept_suche'));
	sucheFeld.setAttribute('aria-label', t('hw_rezept_suche'));
	var fehlendFeld = document.createElement('label');
	fehlendFeld.className = 'rezept-nurfehlend';
	var fehlendHaken = document.createElement('input');
	fehlendHaken.type = 'checkbox';
	fehlendFeld.appendChild(fehlendHaken);
	fehlendFeld.appendChild(eltern('span', t('hw_nur_fehlen')));
	var anzahl = document.createElement('span');
	anzahl.className = 'stufe-klein';
	anzahl.id = 'rezept-anzahl';
	anzahl.setAttribute('role', 'status');
	steuerung.appendChild(sucheFeld);
	steuerung.appendChild(fehlendFeld);
	steuerung.appendChild(anzahl);
	ziel.appendChild(steuerung);

	var berufZeile = document.createElement('div');
	berufZeile.className = 'rezept-berufe';
	berufZeile.id = 'rezept-berufe';
	ziel.appendChild(berufZeile);
	var stufenZeile = document.createElement('div');
	stufenZeile.className = 'rezept-stufen';
	stufenZeile.id = 'rezept-stufen';
	ziel.appendChild(stufenZeile);

	var inhalt = document.createElement('div');
	inhalt.id = 'rezept-inhalt';
	ziel.appendChild(inhalt);
	var mehr = document.createElement('p');
	mehr.className = 'schwach';
	mehr.hidden = true;
	ziel.appendChild(mehr);

	function eltern(tag, text) {
		var node = document.createElement(tag);
		if (text != null) { node.textContent = text; }
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
		if (!Object.keys(bekannt).length) { return null; }
		var zeichen = eltern('span', istBekannt(wert) ? '✓' : (istMeinBeruf(wert) ? '○' : '–'));
		zeichen.className = 'rezept-stand ' + (istBekannt(wert) ? 'bekannt' : (istMeinBeruf(wert) ? 'fehlt' : 'fremd'));
		zeichen.title = istBekannt(wert) ? t('hw_bekannt')
			: (istMeinBeruf(wert) ? t('hw_fehlt') : t('hw_fremder_beruf'));
		return zeichen;
	}

	function zeile(wert, mitBeruf) {
		var tr = document.createElement('tr');
		var name = document.createElement('td');
		name.className = 'q' + (wert[1] || 0);
		var zeichen = marker(wert);
		if (zeichen) { name.appendChild(zeichen); }
		name.appendChild(document.createTextNode(wert[0]));
		if (wert[2]) {
			var stufeText = eltern('span', ' · ' + t('stufe') + ' ' + wert[2]);
			stufeText.className = 'bl-stufe';
			name.appendChild(stufeText);
		}
		tr.appendChild(name);
		if (mitBeruf) {
			var beruf = eltern('td', [wert[3], wert[4]].filter(Boolean).join(' · '));
			beruf.className = 'rezept-beruf';
			tr.appendChild(beruf);
		}
		var zutaten = eltern('td');
		zutaten.textContent = wert[6].map(function (teil) {
			return (teil[1] > 1 ? teil[1] + ' × ' : '') + teil[0];
		}).join(', ');
		if (wert[7] && wert[7].length) {
			var optional = eltern('div', t('hw_optional') + ': ' + wert[7].map(function (teil) {
				return (teil[1] > 1 ? teil[1] + ' × ' : '') + teil[0];
			}).join(', '));
			optional.className = 'schwach';
			zutaten.appendChild(optional);
		}
		tr.appendChild(zutaten);
		var kritisch = eltern('td', wert[8] && wert[8] !== wert[0] ? wert[8] : '');
		tr.appendChild(kritisch);
		return tr;
	}

	function tabelle(zeilen, mitBeruf) {
		var rahmen = eltern('div');
		rahmen.className = 'tabellen-rahmen';
		var tabelle = eltern('table');
		tabelle.className = 'tabelle';
		var kopf = eltern('thead');
		var kopfZeile = eltern('tr');
		[['hw_ergebnis'], mitBeruf ? ['hw_beruf'] : null, ['hw_zutaten'], ['hw_kritisch']]
			.filter(Boolean).forEach(function (spalte) {
				kopfZeile.appendChild(eltern('th', t(spalte[0])));
			});
		kopf.appendChild(kopfZeile);
		tabelle.appendChild(kopf);
		var koerper = eltern('tbody');
		zeilen.forEach(function (wert) { koerper.appendChild(zeile(wert, mitBeruf)); });
		tabelle.appendChild(koerper);
		rahmen.appendChild(tabelle);
		return rahmen;
	}

	// --- views ------------------------------------------------------------
	/** Keep the visible selection in step with `prof`; the row is built once. */
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
		if (!prof && liste.length) {
			var eigen = liste.filter(function (name) { return meineBerufe[namen[name].key]; });
			// Start with the craft the character actually uses most.
			eigen.sort(function (a, b) { return namen[b].bekannt - namen[a].bekannt; });
			prof = eigen.length ? eigen[0] : liste[0];
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
		if (!liste.length) { stufenZeile.textContent = ''; return; }
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

	function zaehle(zeilen) {
		var bekanntAnzahl = zeilen.filter(istBekannt).length;
		if (nurFehlende) {
			anzahl.textContent = window.MQL_ERSETZE(t('hw_fehlende'), [zeilen.length]);
		} else if (!Object.keys(bekannt).length) {
			anzahl.textContent = window.MQL_ERSETZE(t('bl_anzahl'), [zeilen.length]);
		} else {
			anzahl.textContent = window.MQL_ERSETZE(t('hw_stand'), [bekanntAnzahl, zeilen.length]);
		}
	}

	function zeigeBaum() {
		stufenZeile.hidden = false;
		stufenListe();
		var zeilen = daten.filter(function (wert) {
			return wert[3] === prof && wert[4] === stufe && passt(wert);
		});
		inhalt.textContent = '';
		if (!zeilen.length) {
			inhalt.appendChild(eltern('p', t('hw_keine_rezepte')));
			anzahl.textContent = '';
			return;
		}
		var gruppen = {};
		var reihenfolge = [];
		zeilen.forEach(function (wert) {
			var name = wert[5] || '';
			if (!gruppen[name]) { gruppen[name] = []; reihenfolge.push(name); }
			gruppen[name].push(wert);
		});
		reihenfolge.forEach(function (name) {
			if (name) {
				var ueberschrift = eltern('h3', name);
				inhalt.appendChild(ueberschrift);
			}
			inhalt.appendChild(tabelle(gruppen[name], false));
		});
		zaehle(zeilen);
		mehr.hidden = true;
	}

	function zeigeSuche() {
		stufenZeile.hidden = true;
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
			return;
		}
		inhalt.appendChild(tabelle(zeilen.slice(0, grenze), true));
		zaehle(zeilen);
		mehr.hidden = zeilen.length <= grenze;
		mehr.textContent = window.MQL_ERSETZE(t('bl_mehr'), [zeilen.length - grenze]);
	}

	function zeichne() {
		if (!daten.length) { return; }
		if (suche) { zeigeSuche(); } else { zeigeBaum(); }
	}

	sucheFeld.addEventListener('input', function () { suche = sucheFeld.value.trim(); zeichne(); });
	fehlendHaken.addEventListener('change', function () { nurFehlende = fehlendHaken.checked; zeichne(); });

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
		berufsListe();
		zeichne();
	};
	if (window.MQL_REZEPTE) { window.MQL_REZEPTE_ZEICHNEN(); }
})();
