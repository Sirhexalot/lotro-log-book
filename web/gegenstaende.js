/* Item browser: one search field, facets on the left, results on the right.
 *
 * Data comes from gegenstaende-<sprache>.js (build_gegenstandssuche.py): every
 * item with name, symbol, category, quality, slot, type, class and level.
 * Nothing here invents values; unknown stays empty and is only offered when it
 * occurs. The groups are the game's own words (Geschmeide, Ring, Kopf …).
 */
(function () {
	'use strict';

	var T = window.MQL_T || function (schluessel) { return schluessel; };
	var sprache = window.MQL_SPRACHE || 'de';
	var SEGMENT = { de: 'gegenstand', en: 'item', fr: 'objet' }[sprache] || 'gegenstand';

	var formular = document.getElementById('gs-suche');
	var feld = document.getElementById('gs-feld');
	var filterFeld = document.getElementById('gs-filter');
	var filterKnopf = document.getElementById('gs-filter-knopf');
	var liste = document.getElementById('gs-ergebnis');
	var stand = document.getElementById('gs-stand');
	var mehr = document.getElementById('gs-mehr');
	if (!formular || !filterFeld || !liste) { return; }

	/* A filter is a path through the tree: every level the user opened adds one
	 * condition. "Leichte Rüstung › Füße" therefore stays one branch and does
	 * not also tick feet in medium and heavy armour. */
	var S = { q: '', pfade: [], qual: [], von: null, bis: null, sichtbar: 50 };
	var daten = null;

	var FELD = { kat: 3, qual: 4, platz: 5, art: 6, stufe: 7, klasse: 8, gattung: 9 };
	/* The order people look for, not the alphabet: armour from light to heavy,
	 * weapons from the main hand outwards. Everything else stays alphabetical. */
	var REIHENFOLGE = {
		art: ['LIGHT', 'MEDIUM', 'HEAVY', 'SHIELD', 'HEAVY_SHIELD', 'WARDEN_SHIELD'],
		platz: ['MAIN_HAND', 'EITHER_HAND', 'RANGED_ITEM', 'OFF_HAND', 'CLASS_SLOT', 'BRIDLE']
	};
	var BAUM_OFFEN = {};
	var BAUM_MEHR = {};

	function falten(text) {
		return String(text || '').toLowerCase()
			.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss');
	}
	function eltern(tag, text) {
		var knoten = document.createElement(tag);
		if (text !== undefined && text !== null) { knoten.textContent = text; }
		return knoten;
	}
	function zahl(text, werte) {
		if (!werte || !werte.length) { return String(text); }
		var i = 0;
		return String(text).replace(/%s/g, function () {
			var wert = werte[i]; i += 1;
			return wert === undefined ? '' : wert;
		});
	}

	/* --- Filter ------------------------------------------------------- */

	function begriffe() {
		return falten(S.q).split(/\s+/).filter(Boolean);
	}

	function pfadPasst(pfad, z) {
		for (var name in pfad) {
			if (!Object.prototype.hasOwnProperty.call(pfad, name)) { continue; }
			if (pfad[name] !== z[FELD[name]]) { return false; }
		}
		return true;
	}

	function pfadSchluessel(pfad) {
		return Object.keys(pfad).sort().map(function (name) {
			return name + ':' + pfad[name];
		}).join('|');
	}

	function pfadGleich(a, b) {
		return pfadSchluessel(a) === pfadSchluessel(b);
	}

	function pfadGewaehlt(pfad) {
		return S.pfade.some(function (gewaehlt) { return pfadGleich(gewaehlt, pfad); });
	}

	/** True when the selected path lies inside this branch. */
	function pfadEnthaelt(zweig, pfad) {
		for (var name in zweig) {
			if (!Object.prototype.hasOwnProperty.call(zweig, name)) { continue; }
			if (zweig[name] !== pfad[name]) { return false; }
		}
		return true;
	}

	function pfadUmschalten(pfad, an) {
		var stelle = -1;
		S.pfade.forEach(function (gewaehlt, nummer) {
			if (pfadGleich(gewaehlt, pfad)) { stelle = nummer; }
		});
		if (an && stelle < 0) { S.pfade.push(pfad); }
		if (!an && stelle >= 0) { S.pfade.splice(stelle, 1); }
		S.sichtbar = 50;
		zeichnen();
	}

	function passt(z, ohne) {
		if (ohne !== 'qual' && S.qual.length && S.qual.indexOf(z[4]) < 0) { return false; }
		if (ohne !== 'stufe' && (S.von !== null || S.bis !== null)) {
			var stufe = z[7] || 0;
			if (S.von !== null && stufe < S.von) { return false; }
			if (S.bis !== null && (stufe === 0 || stufe > S.bis)) { return false; }
		}
		if (ohne !== 'baum' && S.pfade.length) {
			var trifft = S.pfade.some(function (pfad) { return pfadPasst(pfad, z); });
			if (!trifft) { return false; }
		}
		var woerter = begriffe();
		if (woerter.length) {
			var name = falten(z[1]);
			var kennung = String(z[0]).toLowerCase();
			for (var i = 0; i < woerter.length; i += 1) {
				if (name.indexOf(woerter[i]) < 0 && kennung.indexOf(woerter[i]) < 0) { return false; }
			}
		}
		return true;
	}

	function auswahl(dimension) {
		var zaehler = {};
		var kleinste = Infinity, groesste = 0;
		daten.e.forEach(function (z) {
			if (!passt(z, dimension)) { return; }
			var schluessel = z[FELD[dimension]];
			zaehler[schluessel] = (zaehler[schluessel] || 0) + 1;
			if (dimension === 'stufe') {
				kleinste = Math.min(kleinste, z[7]);
				groesste = Math.max(groesste, z[7]);
			}
		});
		return { zaehler: zaehler, kleinste: kleinste, groesste: groesste };
	}

	/* --- Anzeige ------------------------------------------------------ */

	function beschriftung(dimension, wert) {
		if (dimension === 'kat') { return (daten.kat[wert] || ''); }
		if (dimension === 'qual') { return T('gs_qual_' + wert); }
		var text = (daten[dimension] || [])[wert] || '';
		// Der Client kennt eine Klasse ohne Namen ("Undef"); solche Gegenstände
		// sollen nicht stillschweigend aus dem Baum fallen.
		if (dimension === 'klasse' && wert >= 0 && !text.trim()) { return T('gs_kat_ohne'); }
		return text;
	}

	function knopf(haken, text, anzahl, umschalten) {
		var zeile = eltern('label', null);
		zeile.className = 'gs-option';
		var box = eltern('input', null);
		box.type = 'checkbox';
		box.checked = haken;
		box.addEventListener('change', function () { umschalten(box.checked); });
		zeile.appendChild(box);
		zeile.appendChild(eltern('span', text));
		if (anzahl !== null) {
			var zahlFeld = eltern('span', String(anzahl));
			zahlFeld.className = 'gs-anzahl';
			zeile.appendChild(zahlFeld);
		}
		return zeile;
	}

	function gruppe(titel, eintraege) {
		if (!eintraege.length) { return null; }
		var block = eltern('section', null);
		block.className = 'gs-gruppe';
		block.appendChild(eltern('h2', titel));
		var listeDer = eltern('div', null);
		listeDer.className = 'gs-optionen';
		// Enough values to see the shape of the facet without endless lists, and
		// a chosen value is never hidden behind "show more".
		var grenze = 12;
		function gewaehlt(eintrag) {
			var haken = eintrag.zeichen.querySelector('input');
			return Boolean(haken && haken.checked);
		}
		function zeige(offen) {
			var versteckt = 0;
			eintraege.forEach(function (eintrag, nummer) {
				var sichtbar = offen || nummer < grenze || gewaehlt(eintrag);
				eintrag.zeichen.hidden = !sichtbar;
				if (!sichtbar) { versteckt += 1; }
			});
			return versteckt;
		}
		eintraege.forEach(function (eintrag) { listeDer.appendChild(eintrag.zeichen); });
		var versteckt = zeige(false);
		if (versteckt > 0) {
			var rest = eltern('button', null);
			rest.type = 'button';
			rest.className = 'gs-mehr-optionen';
			var offen = false;
			var zahl = versteckt;
			function beschriften() {
				rest.textContent = offen ? '− ' + T('gs_weniger')
					: '+ ' + zahl + ' ' + T('gs_mehr');
			}
			beschriften();
			rest.addEventListener('click', function () {
				offen = !offen;
				zahl = zeige(offen);
				beschriften();
			});
			listeDer.appendChild(rest);
		}
		block.appendChild(listeDer);
		return block;
	}

	function optionen(dimension, werte) {
		var erlaubt = S[dimension];
		var gefunden = werte.zaehler;
		var schluessel = Object.keys(gefunden).map(Number)
			.filter(function (wert) { return beschriftung(dimension, wert).trim() !== ''; });
		// Chosen values stay visible even when the current rest empties them.
		erlaubt.forEach(function (wert) {
			if (schluessel.indexOf(wert) < 0 && beschriftung(dimension, wert).trim() !== '') {
				schluessel.push(wert);
			}
		});
		schluessel.sort(function (a, b) { return a - b; });
		return schluessel.map(function (wert) {
			var anzahl = gefunden[wert] || 0;
			var zeichen = knopf(erlaubt.indexOf(wert) >= 0,
				beschriftung(dimension, wert), anzahl || null, function (an) {
					var stelle = S[dimension].indexOf(wert);
					if (an && stelle < 0) { S[dimension].push(wert); }
					if (!an && stelle >= 0) { S[dimension].splice(stelle, 1); }
					S.sichtbar = 50;
					zeichnen();
				});
			return { wert: wert, anzahl: anzahl, zeichen: zeichen };
		});
	}

	/* --- Kategoriebaum ------------------------------------------------ */

	/* Wie im Auktionshaus: erst die Art des Gegenstands, darunter die nächste
	 * sinnvolle Frage. Welche Ebenen das sind, sagt die Art selbst – Rüstung
	 * fragt nach der Rüstungsart, Waffen nach der Hand, Schmuck nach Ring,
	 * Armband, Ohrring …, und Sonstiges nach der Gegenstandsklasse des Clients. */
	function baumEbenen(katWert) {
		var schluessel = (daten.katKey || [])[katWert] || '';
		if (schluessel === 'ARMOUR') { return ['art', 'platz']; }
		if (schluessel === 'WEAPON' || schluessel === 'LEGENDARY_WEAPON') { return ['platz', 'art']; }
		if (schluessel === 'JEWELLERY') { return ['gattung']; }
		if (schluessel === 'LEGENDARY_ITEM') { return ['platz']; }
		if (schluessel === 'ITEM') { return ['klasse']; }
		return [];
	}

	function reihenfolge(dimension, a, b) {
		var rang = REIHENFOLGE[dimension] || [];
		var schluessel = daten[dimension + 'Key'] || [];
		var ia = rang.indexOf(schluessel[a]);
		var ib = rang.indexOf(schluessel[b]);
		if (ia >= 0 || ib >= 0) {
			if (ia < 0) { ia = rang.length; }
			if (ib < 0) { ib = rang.length; }
			if (ia !== ib) { return ia - ib; }
		}
		return beschriftung(dimension, a).localeCompare(beschriftung(dimension, b), sprache);
	}

	/** Entries that carry a label on this level – no empty knots. */
	function hatWerte(menge, dimension) {
		return menge.some(function (z) {
			return beschriftung(dimension, z[FELD[dimension]]).trim() !== '';
		});
	}

	function baumKnoten(block, tiefe, text, anzahl, pfad, hatKinder, offen) {
		var zeile = eltern('div', null);
		zeile.className = 'gs-knoten gs-tiefe-' + tiefe;
		var schluessel = pfadSchluessel(pfad);
		if (hatKinder) {
			var pfeil = eltern('button', offen ? '▾' : '▸');
			pfeil.type = 'button';
			pfeil.className = 'gs-pfeil';
			pfeil.setAttribute('aria-expanded', offen ? 'true' : 'false');
			pfeil.setAttribute('aria-label', text);
			pfeil.addEventListener('click', function () {
				BAUM_OFFEN[schluessel] = !offen;
				filterZeichnen();
			});
			zeile.appendChild(pfeil);
		} else {
			var platzhalter = eltern('span', '');
			platzhalter.className = 'gs-pfeil gs-pfeil-leer';
			zeile.appendChild(platzhalter);
		}
		zeile.appendChild(knopf(pfadGewaehlt(pfad), text, anzahl || null, function (an) {
			pfadUmschalten(pfad, an);
		}));
		block.appendChild(zeile);
	}

	function istOffen(pfad) {
		var schluessel = pfadSchluessel(pfad);
		if (BAUM_OFFEN[schluessel] !== undefined) { return BAUM_OFFEN[schluessel]; }
		// Ein gesetzter Filter muss seinen Zweig aufklappen, sonst ist der Haken
		// unsichtbar und der Filter scheint wirkungslos.
		return S.pfade.some(function (gewaehlt) { return pfadEnthaelt(pfad, gewaehlt); });
	}

	function baumZweig(block, pfad, ebenen, tiefe, menge) {
		var dimension = ebenen[0];
		var rest = ebenen.slice(1);
		var gruppen = {}, reihe = [];
		menge.forEach(function (z) {
			var wert = z[FELD[dimension]];
			if (beschriftung(dimension, wert).trim() === '') { return; }
			if (!Object.prototype.hasOwnProperty.call(gruppen, wert)) {
				gruppen[wert] = 0;
				reihe.push(wert);
			}
			gruppen[wert] += 1;
		});
		if (dimension === 'klasse') {
			// The long tail of item classes is not worth opening by default;
			// the frequent ones come first.
			reihe.sort(function (a, b) {
				return gruppen[b] - gruppen[a]
					|| beschriftung('klasse', a).localeCompare(beschriftung('klasse', b), sprache);
			});
		} else {
			reihe.sort(function (a, b) { return reihenfolge(dimension, a, b); });
		}

		var grenze = dimension === 'klasse' ? 12 : reihe.length;
		var schluessel = pfadSchluessel(pfad);
		var alle = Boolean(BAUM_MEHR[schluessel]);
		var zeigen = alle ? reihe : reihe.slice(0, grenze);

		zeigen.forEach(function (wert) {
			var unterpfad = {};
			Object.keys(pfad).forEach(function (name) { unterpfad[name] = pfad[name]; });
			unterpfad[dimension] = wert;
			var untermenge = menge.filter(function (z) { return z[FELD[dimension]] === wert; });
			var kinder = rest.length > 0 && hatWerte(untermenge, rest[0]);
			var offen = kinder && istOffen(unterpfad);
			baumKnoten(block, tiefe, beschriftung(dimension, wert), gruppen[wert],
				unterpfad, kinder, offen);
			if (offen) { baumZweig(block, unterpfad, rest, tiefe + 1, untermenge); }
		});

		if (!alle && reihe.length > grenze) {
			var weitere = eltern('button', null);
			weitere.type = 'button';
			weitere.className = 'gs-mehr-optionen';
			weitere.textContent = '+ ' + (reihe.length - grenze) + ' ' + T('gs_mehr');
			weitere.addEventListener('click', function () {
				BAUM_MEHR[schluessel] = true;
				filterZeichnen();
			});
			var huelle = eltern('div', null);
			huelle.className = 'gs-knoten gs-tiefe-' + tiefe;
			var platzhalter = eltern('span', '');
			platzhalter.className = 'gs-pfeil gs-pfeil-leer';
			huelle.appendChild(platzhalter);
			huelle.appendChild(weitere);
			block.appendChild(huelle);
		}
	}

	function kategorieBaum() {
		var block = eltern('section', null);
		block.className = 'gs-gruppe gs-baum';
		block.appendChild(eltern('h2', T('gs_kategorie')));

		// Die Baumebenen selbst filtern hier nicht, sonst stünde nach dem ersten
		// Haken jeder Nachbar auf 0.
		var menge = daten.e.filter(function (z) { return passt(z, 'baum'); });
		var zaehler = {};
		menge.forEach(function (z) {
			zaehler[z[3]] = (zaehler[z[3]] || 0) + 1;
		});

		var kats = Object.keys(zaehler).map(Number)
			.filter(function (wert) { return beschriftung('kat', wert).trim() !== ''; });
		kats.sort(function (a, b) { return zaehler[b] - zaehler[a]; });
		if (!kats.length) { return null; }

		kats.forEach(function (katWert) {
			var untermenge = menge.filter(function (z) { return z[3] === katWert; });
			var ebenen = baumEbenen(katWert);
			var pfad = { kat: katWert };
			var kinder = ebenen.length > 0 && hatWerte(untermenge, ebenen[0]);
			var offen = kinder && istOffen(pfad);
			baumKnoten(block, 0, beschriftung('kat', katWert), untermenge.length,
				pfad, kinder, offen);
			if (offen) { baumZweig(block, pfad, ebenen, 1, untermenge); }
		});
		return block;
	}

	function stufenFeld(werte) {
		if (!isFinite(werte.kleinste) || werte.groesste <= 0) { return null; }
		var block = eltern('section', null);
		block.className = 'gs-gruppe gs-stufenbereich';
		block.appendChild(eltern('h2', T('gs_stufe')));
		var zeile = eltern('p', null);
		function zahlfeld(wert, platzhalter, setzen) {
			var eingabe = eltern('input', null);
			eingabe.type = 'number';
			eingabe.min = '0';
			eingabe.max = String(werte.groesste);
			eingabe.placeholder = platzhalter;
			eingabe.value = wert === null ? '' : String(wert);
			eingabe.addEventListener('change', function () {
				var roh = eingabe.value.trim();
				var neu = roh === '' ? null : Math.max(0, parseInt(roh, 10) || 0);
				setzen(neu);
				S.sichtbar = 50;
				zeichnen();
			});
			return eingabe;
		}
		zeile.appendChild(eltern('span', T('gs_von')));
		zeile.appendChild(zahlfeld(S.von, String(werte.kleinste), function (neu) { S.von = neu; }));
		zeile.appendChild(eltern('span', T('gs_bis')));
		zeile.appendChild(zahlfeld(S.bis, String(werte.groesste), function (neu) { S.bis = neu; }));
		block.appendChild(zeile);
		return block;
	}

	function filterZeichnen() {
		filterFeld.textContent = '';
		var kopf = eltern('div', null);
		kopf.className = 'gs-filter-kopf';
		kopf.appendChild(eltern('strong', T('gs_filter')));
		var zurueck = eltern('button', T('gs_reset'));
		zurueck.type = 'button';
		zurueck.className = 'gs-reset';
		zurueck.addEventListener('click', function () {
			S.pfade = []; S.qual = []; S.von = null; S.bis = null;
			S.sichtbar = 50;
			zeichnen();
		});
		kopf.appendChild(zurueck);
		filterFeld.appendChild(kopf);

		var teile = [
			kategorieBaum(),
			gruppe(T('gs_qualitaet'), optionen('qual', auswahl('qual')))
		];
		var stufen = auswahl('stufe');
		if (stufen.kleinste !== Infinity && stufen.groesste > 0) {
			teile.push(stufenFeld(stufen));
		}
		teile.forEach(function (teil) { if (teil) { filterFeld.appendChild(teil); } });
	}

	function ergebnisZeichnen() {
		var treffer = daten.e.filter(function (z) { return passt(z, null); });
		liste.textContent = '';
		var menge = treffer.length;
		stand.textContent = menge === 1 ? T('gs_eins')
			: zahl(T('gs_viele'), [menge.toLocaleString(sprache)]);
		if (!menge) {
			var leer = eltern('li', T('gs_keine'));
			leer.className = 'gs-leer';
			liste.appendChild(leer);
			mehr.hidden = true;
			return;
		}
		var grenze = Math.min(S.sichtbar, menge);
		for (var i = 0; i < grenze; i += 1) {
			liste.appendChild(zeileFuer(treffer[i]));
		}
		mehr.hidden = menge <= grenze;
		if (!mehr.hidden) {
			mehr.textContent = T('gs_mehr') + ' (' + (menge - grenze) + ')';
		}
	}

	function zeileFuer(z) {
		var eintrag = eltern('li', null);
		var link = eltern('a', null);
		link.className = 'gs-zeile';
		link.href = '/' + sprache + '/' + SEGMENT + '/' + z[0] + '/';
		if (z[2]) {
			var bild = eltern('img', null);
			bild.className = 'symbol';
			bild.alt = '';
			bild.width = 22;
			bild.height = 22;
			bild.loading = 'lazy';
			bild.src = '/bild/items/' + z[2] + '.webp';
			bild.addEventListener('error', function () { bild.hidden = true; });
			link.appendChild(bild);
		}
		var name = eltern('span', z[1]);
		name.className = 'gs-name q' + (z[4] || 0);
		link.appendChild(name);
		var teile = [];
		if (z[3] >= 0) { teile.push(daten.kat[z[3]]); }
		if (z[4]) { teile.push(T('gs_qual_' + z[4])); }
		if (z[6] >= 0) {
			teile.push(daten.art[z[6]]);
			if (z[5] >= 0) { teile.push(daten.platz[z[5]]); }
		} else if (z[9] >= 0) {
			// Schmuck: "Ring" sagt dasselbe wie der Platz "Finger".
			teile.push(daten.gattung[z[9]]);
		} else if (z[8] >= 0) {
			teile.push(daten.klasse[z[8]]);
		} else if (z[5] >= 0) {
			teile.push(daten.platz[z[5]]);
		}
		if (z[7]) { teile.push(T('gs_stufe') + ' ' + z[7]); }
		if (teile.length) {
			var meta = eltern('span', teile.join(' · '));
			meta.className = 'gs-meta';
			link.appendChild(meta);
		}
		eintrag.appendChild(link);
		return eintrag;
	}

	/* --- Adresse ------------------------------------------------------ */

	var BAUM_EBENEN = ['kat', 'art', 'platz', 'klasse', 'gattung'];

	/** A value as a stable key ("ARMOUR", "HEAD", "37"), never a label. */
	function schluesselWert(dimension, wert) {
		var schluessel = (daten[dimension + 'Key'] || [])[wert];
		return schluessel === undefined ? String(wert) : String(schluessel);
	}

	/** A filter value in the address: a stable key, or an index in older links. */
	function wertFuer(dimension, roh) {
		if (roh === '') { return null; }
		var schluessel = daten[dimension + 'Key'] || [];
		var stelle = schluessel.indexOf(roh.toUpperCase());
		if (stelle >= 0) { return stelle; }
		// Item class and equipment category are identified by their client code;
		// for those, a bare number is a key, never a position.
		if (dimension === 'klasse' || dimension === 'gattung') { return null; }
		if (/^\d+$/.test(roh)) {
			var nummer = parseInt(roh, 10);
			if (nummer >= 0 && nummer < (daten[dimension] || []).length) { return nummer; }
		}
		return null;
	}

	function adresseSchreiben() {
		var parameter = new URLSearchParams();
		if (S.q) { parameter.set('q', S.q); }
		if (S.pfade.length === 1) {
			var pfad = S.pfade[0];
			BAUM_EBENEN.forEach(function (name) {
				if (pfad[name] === undefined) { return; }
				parameter.set(name, schluesselWert(name, pfad[name]));
			});
		} else if (S.pfade.length > 1) {
			S.pfade.forEach(function (pfad) {
				parameter.append('k', Object.keys(pfad).sort().map(function (name) {
					return name + ':' + schluesselWert(name, pfad[name]);
				}).join('|'));
			});
		}
		if (S.qual.length) { parameter.set('qual', S.qual.join(',')); }
		if (S.von !== null) { parameter.set('von', String(S.von)); }
		if (S.bis !== null) { parameter.set('bis', String(S.bis)); }
		try {
			window.history.replaceState(null, '', window.location.pathname + '?' + parameter.toString());
		} catch (fehler) { /* a file:// page may refuse */ }
	}

	function adresseLesen() {
		var parameter;
		try { parameter = new URLSearchParams(window.location.search); } catch (fehler) { return; }
		S.q = parameter.get('q') || '';
		S.pfade = [];

		// Several branches ("Leichte Rüstung › Füße" and "Schwere Rüstung › Füße").
		parameter.getAll('k').forEach(function (roh) {
			var pfad = {};
			roh.split('|').forEach(function (teil) {
				var trenner = teil.indexOf(':');
				if (trenner < 0) { return; }
				var name = teil.slice(0, trenner);
				if (BAUM_EBENEN.indexOf(name) < 0) { return; }
				var wert = wertFuer(name, teil.slice(trenner + 1));
				if (wert !== null) { pfad[name] = wert; }
			});
			if (Object.keys(pfad).length) { S.pfade.push(pfad); }
		});
		// One branch as plain parameters, the form older links use.
		if (!S.pfade.length) {
			var einzeln = {};
			BAUM_EBENEN.forEach(function (name) {
				var roh = parameter.get(name);
				if (!roh) { return; }
				var wert = wertFuer(name, roh.trim());
				if (wert !== null) { einzeln[name] = wert; }
			});
			if (Object.keys(einzeln).length) { S.pfade.push(einzeln); }
		}

		var qual = parameter.get('qual') || '';
		S.qual = qual.split(',').map(function (teil) {
			var wert = parseInt(teil.trim(), 10);
			return isNaN(wert) ? null : wert;
		}).filter(function (wert) { return wert !== null; });

		var von = parseInt(parameter.get('von'), 10);
		var bis = parseInt(parameter.get('bis'), 10);
		S.von = isNaN(von) ? null : von;
		S.bis = isNaN(bis) ? null : bis;
		if (S.q) { feld.value = S.q; }
	}

	function aktiveFilter() {
		return S.pfade.length + S.qual.length
			+ ((S.von !== null || S.bis !== null) ? 1 : 0);
	}

	function zeichnen() {
		if (filterKnopf) {
			var anzahl = aktiveFilter();
			filterKnopf.textContent = T('gs_filter') + (anzahl ? ' · ' + anzahl : '');
		}
		filterZeichnen();
		ergebnisZeichnen();
		adresseSchreiben();
	}

	/* --- Start -------------------------------------------------------- */

	formular.addEventListener('submit', function (ereignis) {
		ereignis.preventDefault();
		S.q = feld.value.trim();
		S.sichtbar = 50;
		zeichnen();
	});
	var uhr = null;
	feld.addEventListener('input', function () {
		window.clearTimeout(uhr);
		uhr = window.setTimeout(function () {
			S.q = feld.value.trim();
			S.sichtbar = 50;
			zeichnen();
		}, 160);
	});
	if (filterKnopf) {
		// On a phone the results come first; the facets wait behind the button.
		try {
			if (window.matchMedia && window.matchMedia('(max-width: 900px)').matches) {
				filterFeld.hidden = true;
			}
		} catch (fehler) { /* old browser: leave it open */ }
		filterKnopf.addEventListener('click', function () {
			var offen = filterFeld.hidden;
			filterFeld.hidden = !offen;
			filterKnopf.setAttribute('aria-expanded', String(offen));
		});
	}
	mehr.addEventListener('click', function () {
		S.sichtbar += 50;
		ergebnisZeichnen();
	});

	window.MQL_GEGENSTAENDE_ZEICHNEN = function () {
		daten = window.MQL_GEGENSTAENDE;
		if (!daten || !daten.e || !daten.e.length) {
			stand.textContent = T('gs_keine');
			return;
		}
		adresseLesen();
		zeichnen();
	};
})();
