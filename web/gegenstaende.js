/* Item browser: one search field, facets on the left, results on the right.
 *
 * Data comes from gegenstaende-<sprache>.js (build_gegenstandssuche.py): every
 * item with name, symbol, category, quality, slot, type and level. Nothing here
 * invents values; unknown stays "ohne Angabe" and is only offered when it occurs.
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

	var S = { q: '', kat: [], qual: [], platz: [], art: [], von: null, bis: null, sichtbar: 50 };
	var daten = null;

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

	function passt(z, ohne) {
		if (ohne !== 'kat' && S.kat.length && S.kat.indexOf(z[3]) < 0) { return false; }
		if (ohne !== 'qual' && S.qual.length && S.qual.indexOf(z[4]) < 0) { return false; }
		if (ohne !== 'platz' && S.platz.length && S.platz.indexOf(z[5]) < 0) { return false; }
		if (ohne !== 'art' && S.art.length && S.art.indexOf(z[6]) < 0) { return false; }
		if (ohne !== 'stufe' && (S.von !== null || S.bis !== null)) {
			var stufe = z[7] || 0;
			if (S.von !== null && stufe < S.von) { return false; }
			if (S.bis !== null && (stufe === 0 || stufe > S.bis)) { return false; }
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
			var schluessel = z[{ kat: 3, qual: 4, platz: 5, art: 6, stufe: 7 }[dimension]];
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
		if (dimension === 'kat') {
			if (wert === -1) { return T('gs_kat_ohne'); }
			return (daten.kat[wert] || '');
		}
		if (dimension === 'qual') { return T('gs_qual_' + wert); }
		if (dimension === 'platz') { return daten.platz[wert] || ''; }
		return daten.art[wert] || '';
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
		var grenze = 8;
		eintraege.forEach(function (eintrag, nummer) {
			if (nummer >= grenze) { eintrag.zeichen.hidden = true; }
			listeDer.appendChild(eintrag.zeichen);
		});
		if (eintraege.length > grenze) {
			var rest = eltern('button', null);
			rest.type = 'button';
			rest.className = 'gs-mehr-optionen';
			var offen = false;
			function beschriften() {
				rest.textContent = offen ? '− ' + T('gs_weniger')
					: '+ ' + (eintraege.length - grenze) + ' ' + T('gs_mehr');
			}
			beschriften();
			rest.addEventListener('click', function () {
				offen = !offen;
				eintraege.forEach(function (eintrag, nummer) {
					if (nummer >= grenze) { eintrag.zeichen.hidden = !offen; }
				});
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
			S.kat = []; S.qual = []; S.platz = []; S.art = []; S.von = null; S.bis = null;
			S.sichtbar = 50;
			zeichnen();
		});
		kopf.appendChild(zurueck);
		filterFeld.appendChild(kopf);

		var teile = [
			gruppe(T('gs_kategorie'), optionen('kat', auswahl('kat'))),
			gruppe(T('gs_qualitaet'), optionen('qual', auswahl('qual'))),
			gruppe(T('gs_platz'), optionen('platz', auswahl('platz'))),
			gruppe(T('gs_art'), optionen('art', auswahl('art')))
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
		if (z[5] >= 0) { teile.push(daten.platz[z[5]]); }
		if (z[6] >= 0) { teile.push(daten.art[z[6]]); }
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

	function adresseSchreiben() {
		var parameter = new URLSearchParams();
		if (S.q) { parameter.set('q', S.q); }
		['kat', 'qual', 'platz', 'art'].forEach(function (name) {
			if (S[name].length) { parameter.set(name, S[name].join(',')); }
		});
		if (S.von !== null) { parameter.set('von', String(S.von)); }
		if (S.bis !== null) { parameter.set('bis', String(S.bis)); }
		try {
			window.history.replaceState(null, '', window.location.pathname + '?' + parameter.toString());
		} catch (fehler) { /* a file:// page may refuse */ }
	}

	/** A filter value in the address: a number, or a stable key from a
	 * catalogue page ("ARMOUR", "HEAD", "LIGHT"). Labels are never parsed. */
	function wertFuer(dimension, roh, kategorien) {
		if (roh === '') { return null; }
		var zahlWert = parseInt(roh, 10);
		if (!isNaN(zahlWert) && String(zahlWert) === roh) { return zahlWert; }
		if (dimension === 'kat') {
			var stelle = (daten.katKey || []).indexOf(roh.toUpperCase());
			return stelle < 0 ? null : stelle;
		}
		var schluessel = dimension === 'platz' ? 'platzKey' : dimension === 'art' ? 'artKey' : null;
		if (!schluessel) { return null; }
		var index = (daten[schluessel] || []).indexOf(roh.toUpperCase());
		return index < 0 ? null : index;
	}

	function adresseLesen() {
		var parameter;
		try { parameter = new URLSearchParams(window.location.search); } catch (fehler) { return; }
		S.q = parameter.get('q') || '';
		var desKatalogs = daten.kat || [];   // labels, used for the katKey lookup
		['kat', 'qual', 'platz', 'art'].forEach(function (name) {
			var roh = parameter.get(name) || '';
			S[name] = roh.split(',').map(function (teil) {
				return wertFuer(name, teil.trim(), desKatalogs);
			}).filter(function (wert) { return wert !== null; });
		});
		var von = parseInt(parameter.get('von'), 10);
		var bis = parseInt(parameter.get('bis'), 10);
		S.von = isNaN(von) ? null : von;
		S.bis = isNaN(bis) ? null : bis;
		if (S.q) { feld.value = S.q; }
	}

	function aktiveFilter() {
		return S.kat.length + S.qual.length + S.platz.length + S.art.length
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
