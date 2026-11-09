/* Travel planner: from any point to the nearest stable-master and on through the
 * network. Data: reise-<sprache>.js (build_reise.py from the game files).
 *
 * No durations and no kilometres: the game data carries prices, minimum levels
 * and requirements, but no riding time. What the player needs to know is which
 * way to go, not how long a horse takes.
 *
 * The right side is a map stage: Middle-earth while nothing is planned, then
 * the game maps of the route with a marker at every stop. No lines are drawn –
 * we know where the stables are, not which path a horse takes.
 */
(function () {
	'use strict';

	var t = window.MQL_T || function (key) { return key; };
	var sprache = window.MQL_SPRACHE || 'de';
	var formular = document.getElementById('reise-formular');
	if (!formular) { return; }

	var feldVon = document.getElementById('reise-von');
	var feldNach = document.getElementById('reise-nach');
	var listeVon = document.getElementById('reise-von-liste');
	var listeNach = document.getElementById('reise-nach-liste');
	var ergebnis = document.getElementById('reise-ergebnis');
	var klassenFeld = document.getElementById('reise-klasse');
	var portListe = document.getElementById('reise-ports');
	var seite = document.getElementById('reise');
	var buehne = document.getElementById('reise-karten');
	var weltBild = document.getElementById('reise-welt');

	// Map images live under karten/<sprache>/ on the site, under webp/<sprache>/
	// in a local checkout – the same rule the map page uses.
	var BILDPFAD = (window.MQL_BILD_PFAD || '../webp/{sprache}/').replace('{sprache}', sprache);

	var stationen = [];
	var nachId = {};
	var kanten = {};
	var skills = [];
	var karten = {};
	var kartenListe = [];
	var gewaehlt = { von: null, nach: null };

	function normal(text) {
		return String(text == null ? '' : text)
			.toLowerCase()
			.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
			.replace(/ß/g, 'ss')
			.trim();
	}

	function eltern(tag, text, klasse) {
		var knoten = document.createElement(tag);
		if (text != null) { knoten.textContent = text; }
		if (klasse) { knoten.className = klasse; }
		return knoten;
	}

	function silber(kupfer) {
		if (kupfer == null) { return null; }
		var wert = kupfer / 100;
		return (Math.round(wert * 100) / 100).toLocaleString(t('locale'), {
			minimumFractionDigits: wert < 100 ? 2 : 0, maximumFractionDigits: 2 }) + ' ' + t('reise_silber');
	}

	/* --- Eingabe ------------------------------------------------------- */

	/** Coordinates as the game prints them: "5.8S, 105.1W" or a whole /loc line. */
	function koordinaten(text) {
		var treffer = String(text).match(/(\d{1,3}(?:[.,]\d+)?)\s*([NSEWnsew])/g);
		if (!treffer || treffer.length < 2) { return null; }
		var zahlen = treffer.slice(0, 2).map(function (stueck) {
			var teile = /(\d{1,3}(?:[.,]\d+)?)\s*([NSEWnsew])/.exec(stueck);
			return { wert: parseFloat(teile[1].replace(',', '.')), richtung: teile[2].toUpperCase() };
		});
		var lat = zahlen[0].richtung === 'S' ? -zahlen[0].wert : zahlen[0].wert;
		var lon = zahlen[1].richtung === 'W' ? -zahlen[1].wert : zahlen[1].wert;
		return { lat: lat, lon: lon };
	}

	function orteSuchen(text, grenze) {
		var suche = normal(text);
		if (suche.length < 2) { return []; }
		var treffer = [];
		for (var i = 0; i < stationen.length; i += 1) {
			var ort = stationen[i];
			var name = normal(ort.n);
			var gebiet = normal(ort.gebiet);
			var rang = name === suche ? 0 : name.indexOf(suche) === 0 ? 1
				: name.indexOf(suche) >= 0 ? 2 : gebiet.indexOf(suche) >= 0 ? 3 : -1;
			if (rang >= 0) { treffer.push({ ort: ort, rang: rang }); }
		}
		treffer.sort(function (a, b) {
			return a.rang - b.rang || a.ort.n.localeCompare(b.ort.n, t('locale'));
		});
		return treffer.slice(0, grenze || 8).map(function (e) { return e.ort; });
	}

	function naechsteStation(lat, lon) {
		var land = null, landAbstand = Infinity, bestes = null, abstand = Infinity;
		for (var i = 0; i < stationen.length; i += 1) {
			var ort = stationen[i];
			var d = (ort.lat - lat) * (ort.lat - lat) + (ort.lon - lon) * (ort.lon - lon);
			if (d < abstand) { abstand = d; bestes = ort; }
			// A dock only sells boat trips; on foot it is rarely the way to go.
			if (!ort.wasser && d < landAbstand) { landAbstand = d; land = ort; }
		}
		return land || bestes;
	}

	/** What the user typed, as a station or as a free position. */
	function deuten(feld, liste, schluessel) {
		var merker = gewaehlt[schluessel];
		if (merker && normal(merker.n) === normal(feld.value)) {
			return { ort: merker };
		}
		gewaehlt[schluessel] = null;
		var text = feld.value.trim();
		if (!text) { return null; }
		var funke = koordinaten(text);
		if (funke) { return funke; }
		var treffer = orteSuchen(text, 8);
		// A name typed exactly means that stable, even when other places only
		// contain it ("Bree" must not become "Bree-land Homesteads").
		var genau = treffer.filter(function (ort) { return normal(ort.n) === normal(text); });
		if (genau.length === 1) { return { ort: genau[0] }; }
		if (treffer.length === 1) { return { ort: treffer[0] }; }
		if (treffer.length > 1) { return { unklar: treffer }; }
		return { unbekannt: true };
	}

	function vorschlaegeZeigen(feld, liste, schluessel) {
		var treffer = orteSuchen(feld.value, 8);
		liste.textContent = '';
		feld.setAttribute('aria-expanded', 'false');
		if (!treffer.length) { liste.hidden = true; return; }
		treffer.forEach(function (ort) {
			var punkt = eltern('li');
			punkt.setAttribute('role', 'presentation');
			var knopf = eltern('button');
			knopf.type = 'button';
			knopf.setAttribute('role', 'option');
			knopf.appendChild(eltern('span', ort.n));
			if (ort.gebiet) { knopf.appendChild(eltern('small', ort.gebiet)); }
			// pointerdown, not click: the field keeps the focus and the list does
			// not close before the choice is read (mouse, pen and touch alike).
			knopf.addEventListener('pointerdown', function (ereignis) {
				ereignis.preventDefault();
				feld.value = ort.n;
				gewaehlt[schluessel] = ort;
				liste.hidden = true;
				feld.setAttribute('aria-expanded', 'false');
				feld.focus();
			});
			punkt.appendChild(knopf);
			liste.appendChild(punkt);
		});
		liste.hidden = false;
		feld.setAttribute('aria-expanded', 'true');
	}

	function binde(feld, liste, schluessel) {
		var aktiv = -1;
		function knoepfe() {
			return Array.prototype.slice.call(liste.querySelectorAll('button'));
		}
		function markiere(nummer) {
			var alle = knoepfe();
			alle.forEach(function (knopf, stelle) {
				knopf.classList.toggle('ist-aktiv', stelle === nummer);
			});
			aktiv = nummer;
			if (nummer >= 0 && alle[nummer]) { alle[nummer].scrollIntoView({ block: 'nearest' }); }
		}
		function waehlen(knopf) {
			if (!knopf) { return; }
			feld.value = knopf.querySelector('span').textContent;
			var ort = orteSuchen(feld.value, 8).filter(function (k) {
				return normal(k.n) === normal(feld.value);
			})[0] || null;
			gewaehlt[schluessel] = ort;
			liste.hidden = true;
			feld.setAttribute('aria-expanded', 'false');
			markiere(-1);
		}
		feld.addEventListener('input', function () {
			vorschlaegeZeigen(feld, liste, schluessel);
			markiere(-1);
		});
		feld.addEventListener('focus', function () {
			vorschlaegeZeigen(feld, liste, schluessel);
			markiere(-1);
		});
		feld.addEventListener('blur', function () {
			setTimeout(function () {
				liste.hidden = true;
				feld.setAttribute('aria-expanded', 'false');
			}, 150);
		});
		feld.addEventListener('keydown', function (ereignis) {
			if (ereignis.key === 'Escape') {
				liste.hidden = true;
				feld.setAttribute('aria-expanded', 'false');
				markiere(-1);
				return;
			}
			if (ereignis.key !== 'ArrowDown' && ereignis.key !== 'ArrowUp') {
				if (ereignis.key === 'Enter' && aktiv >= 0) {
					ereignis.preventDefault();
					waehlen(knoepfe()[aktiv]);
				}
				return;
			}
			var alle = knoepfe();
			if (!alle.length) { vorschlaegeZeigen(feld, liste, schluessel); alle = knoepfe(); }
			if (!alle.length) { return; }
			ereignis.preventDefault();
			var naechste = ereignis.key === 'ArrowDown'
				? (aktiv + 1) % alle.length
				: (aktiv <= 0 ? alle.length - 1 : aktiv - 1);
			markiere(naechste);
		});
	}

	/* --- Rechnen -------------------------------------------------------- */

	/** Shortest chain of stable-masters; hops count, price breaks ties. */
	function route(vonId, nachId, nurLangsam) {
		var abstand = {}, vorher = {}, offen = [vonId], fertig = {};
		abstand[vonId] = 0;
		while (offen.length) {
			offen.sort(function (a, b) { return abstand[a] - abstand[b]; });
			var jetzt = offen.shift();
			if (jetzt === nachId) { break; }
			if (fertig[jetzt]) { continue; }
			fertig[jetzt] = true;
			var kantenHier = kanten[jetzt] || [];
			for (var i = 0; i < kantenHier.length; i += 1) {
				var kante = kantenHier[i];
				if (nurLangsam && kante.schnell) { continue; }
				// Fewest legs wins; the price only breaks ties.
				var neu = abstand[jetzt] + 1 + (kante.kosten || 0) / 5000;
				if (abstand[kante.nach] === undefined || neu < abstand[kante.nach]) {
					abstand[kante.nach] = neu;
					vorher[kante.nach] = kante;
					offen.push(kante.nach);
				}
			}
		}
		if (abstand[nachId] === undefined) { return null; }
		var kette = [], schritt = vorher[nachId];
		while (schritt) {
			kette.unshift(schritt);
			schritt = vorher[schritt.von];
		}
		return kette;
	}

	function summe(kette) {
		var preis = 0, stufe = 0, schnell = 0;
		kette.forEach(function (kante) {
			preis += kante.kosten || 0;
			stufe = Math.max(stufe, kante.stufe || 0);
			if (kante.schnell) { schnell += 1; }
		});
		return { preis: preis, stufe: stufe, schnell: schnell };
	}

	/* --- Ausgabe -------------------------------------------------------- */

	function ergebnisLeeren() {
		ergebnis.textContent = '';
		if (buehne) { buehne.textContent = ''; buehne.hidden = true; }
		if (seite) { seite.removeAttribute('data-geplant'); }
	}

	function fehlerText(text) {
		ergebnisLeeren();
		ergebnis.appendChild(eltern('p', text, 'reise-fehler'));
	}

	function rolleText(art) {
		if (art === 'start') { return t('reise_karte_start'); }
		if (art === 'ziel') { return t('reise_karte_ziel'); }
		return t('reise_karte_umstieg');
	}

	function zeigeDeutung(feld, deutung) {
		if (!deutung) { return null; }
		if (deutung.ort) { return deutung.ort; }
		if (deutung.unbekannt) {
			fehlerText(t('reise_unbekannt') + ' (' + feld.value.trim() + ')');
			return null;
		}
		fehlerText(t('reise_mehrdeutig'));
		return null;
	}

	function vonName(id) {
		return nachId[id] ? nachId[id].n : id;
	}

	/** One leg list, used for the planned route and for the way without swift travel. */
	function ketteListe(kette) {
		var liste = eltern('ol', null, 'reise-kette');
		kette.forEach(function (kante, nummer) {
			var punkt = eltern('li', null, 'reise-schritt');
			punkt.appendChild(eltern('span', String(nummer + 1), 'reise-schritt-nr'));
			var text = eltern('span', null, 'reise-schritt-text');
			text.appendChild(document.createTextNode(vonName(kante.von)));
			text.appendChild(eltern('span', '→', 'pfeil'));
			text.appendChild(document.createTextNode(vonName(kante.nach)));
			punkt.appendChild(text);
			var angaben = eltern('span', null, 'reise-schritt-meta');
			angaben.appendChild(eltern('span', kante.schnell ? t('reise_schnell') : t('reise_langsam'),
				'art ' + (kante.schnell ? 'schnell' : 'langsam')));
			if (kante.kosten != null) { angaben.appendChild(eltern('span', silber(kante.kosten))); }
			if (kante.stufe) { angaben.appendChild(eltern('span', t('reise_stufe') + ' ' + kante.stufe)); }
			if (kante.quest) { angaben.appendChild(eltern('span', t('reise_quest_bedingung'))); }
			if (kante.ruf) { angaben.appendChild(eltern('span', t('reise_ruf_bedingung'))); }
			punkt.appendChild(angaben);
			liste.appendChild(punkt);
		});
		return liste;
	}

	/* --- Karten --------------------------------------------------------- */

	function prozent(wert, von, bis) {
		if (bis === von) { return 50; }
		return Math.max(0, Math.min(100, (wert - von) / (bis - von) * 100));
	}

	/** One map card with a marker for every stop that lies on it. */
	function karteKnoten(gruppe) {
		var karte = gruppe.karte;
		var bild = eltern('figure', null, 'reise-karte');
		var rahmen = eltern('div', null, 'reise-karte-bild');
		var bildFeld = eltern('img');
		bildFeld.loading = 'lazy';
		bildFeld.decoding = 'async';
		bildFeld.alt = '';
		bildFeld.src = BILDPFAD + karte.bild;
		rahmen.appendChild(bildFeld);

		gruppe.orte.forEach(function (eintrag) {
			var marker = eltern('span', eintrag.nr == null ? '' : String(eintrag.nr), 'reise-marker');
			marker.setAttribute('data-art', eintrag.art);
			marker.style.setProperty('--x', prozent(eintrag.ort.lon, karte.w, karte.o).toFixed(2) + '%');
			// CSS counts from the top, the map's frame from the south.
			marker.style.setProperty('--y', (100 - prozent(eintrag.ort.lat, karte.s, karte.no)).toFixed(2) + '%');
			marker.title = eintrag.ort.n + ' – ' + rolleText(eintrag.art);
			rahmen.appendChild(marker);
		});
		bild.appendChild(rahmen);

		var fuss = eltern('figcaption');
		fuss.appendChild(eltern('strong', karte.nm || t('reise_karte')));
		var liste = eltern('ul', null, 'reise-karte-liste');
		gruppe.orte.forEach(function (eintrag) {
			var punkt = eltern('li');
			var nummer = eltern('span', eintrag.nr == null ? '●' : String(eintrag.nr), 'nr');
			punkt.appendChild(nummer);
			punkt.appendChild(eltern('span', eintrag.ort.n));
			punkt.appendChild(eltern('span', rolleText(eintrag.art), 'rolle'));
			liste.appendChild(punkt);
		});
		fuss.appendChild(liste);
		bild.appendChild(fuss);
		return bild;
	}

	/** The maps of the route, in the order the stops reach them. */
	function kartenZeigen(orte) {
		if (!buehne) { return; }
		buehne.textContent = '';
		var gruppen = [], nachKarte = {};
		orte.forEach(function (eintrag) {
			var karte = karten[eintrag.ort.karte];
			if (!karte) { return; }
			var gruppe = nachKarte[karte.i];
			if (!gruppe) {
				gruppe = nachKarte[karte.i] = { karte: karte, orte: [] };
				gruppen.push(gruppe);
			}
			gruppe.orte.push(eintrag);
		});
		if (!gruppen.length) {
			buehne.appendChild(eltern('p', t('reise_karte_ohne'), 'reise-karten-leer'));
		} else {
			gruppen.forEach(function (gruppe) { buehne.appendChild(karteKnoten(gruppe)); });
		}
		buehne.hidden = false;
		if (seite) { seite.setAttribute('data-geplant', '1'); }
	}

	function zeigeWeg(start, ziel) {
		var vonOrt = start.ort || naechsteStation(start.lat, start.lon);
		var nachOrt = ziel.ort || naechsteStation(ziel.lat, ziel.lon);
		if (!vonOrt || !nachOrt) { fehlerText(t('reise_kein_weg')); return; }

		var kette = route(vonOrt.id, nachOrt.id, false);
		var langsam = route(vonOrt.id, nachOrt.id, true);
		var charakter = window.MQL_SPEICHER && window.MQL_SPEICHER.aktiv ? window.MQL_SPEICHER.aktiv() : null;
		var meineStufe = charakter && charakter.level ? Number(charakter.level) : 0;
		ergebnisLeeren();
		ergebnis.appendChild(eltern('h3', t('reise_ergebnis')));

		if (!start.ort) {
			ergebnis.appendChild(eltern('p', t('reise_naechster') + ': ' + vonOrt.n + ' (' + t('reise_zu_fuss') + ')', 'reise-hinweis'));
		}
		if (!ziel.ort) {
			ergebnis.appendChild(eltern('p', t('reise_ziel_station') + ': ' + nachOrt.n, 'reise-hinweis'));
		}

		if (vonOrt.id === nachOrt.id) {
			ergebnis.appendChild(eltern('p', t('reise_schon_da') + ' (' + vonOrt.n + ')', 'reise-hinweis'));
			return;
		}
		if (!kette) {
			ergebnis.appendChild(eltern('p', t('reise_kein_weg'), 'reise-fehler'));
			return;
		}

		ergebnis.appendChild(ketteListe(kette));

		var zahlen = summe(kette);
		var fuss = eltern('p', null, 'reise-summe');
		fuss.appendChild(eltern('span', kette.length + ' ' + t('reise_schritte')));
		if (zahlen.preis) { fuss.appendChild(eltern('span', t('reise_kosten') + ': ' + silber(zahlen.preis))); }
		if (zahlen.stufe) {
			var stufenText = t('reise_stufe') + ' ' + zahlen.stufe;
			if (meineStufe && meineStufe < zahlen.stufe) {
				stufenText += ' – ' + t('reise_stufe_fehlt');
			}
			fuss.appendChild(eltern('span', stufenText));
		}
		fuss.appendChild(eltern('span', zahlen.schnell === kette.length ? t('reise_alle_schnell')
			: zahlen.schnell ? t('reise_teils_schnell') : t('reise_nur_langsam')));
		ergebnis.appendChild(fuss);

		if (langsam && langsam.length !== kette.length) {
			// The way without swift travel, folded away: the planner already
			// computed it, only the count was shown.
			var langsamZahlen = summe(langsam);
			var umweg = eltern('details', null, 'reise-umweg');
			var griff = eltern('summary');
			var umwegText = langsam.length + ' ' + t('reise_schritte');
			if (langsamZahlen.preis) { umwegText += ' · ' + silber(langsamZahlen.preis); }
			griff.appendChild(document.createTextNode(t('reise_ohne_schnell') + ' (' + umwegText + ')'));
			umweg.appendChild(griff);
			umweg.appendChild(eltern('p', t('reise_ohne_schnell_hinweis'), 'reise-hinweis'));
			umweg.appendChild(ketteListe(langsam));
			ergebnis.appendChild(umweg);
		}

		var port = klassenPort(nachOrt.id);
		if (port) {
			ergebnis.appendChild(eltern('p', t('reise_port_direkt') + ': ' + port.n, 'reise-hinweis'));
		}

		// Stops in travel order: the departure carries no number, every arrival
		// carries the step that led to it.
		var orte = [{ ort: vonOrt, art: 'start', nr: null }];
		kette.forEach(function (kante, nummer) {
			orte.push({
				ort: nachId[kante.nach],
				art: nummer === kette.length - 1 ? 'ziel' : 'umstieg',
				nr: nummer + 1
			});
		});
		kartenZeigen(orte);
	}

	/** The class skill that leads straight to this stable, if the class has one. */
	function klassenPort(zielId) {
		var art = klassenArt();
		if (!art) { return null; }
		for (var i = 0; i < skills.length; i += 1) {
			if (skills[i].art === art && skills[i].knoten === zielId) { return skills[i]; }
		}
		return null;
	}

	function klassenArt() {
		var wahl = klassenFeld && klassenFeld.value;
		if (wahl === 'guide' || wahl === 'muster') { return wahl; }
		return null;
	}

	function zeigePorts() {
		if (!portListe) { return; }
		portListe.textContent = '';
		var art = klassenArt();
		var passend = skills.filter(function (s) { return s.art === art; });
		if (!art || !passend.length) {
			portListe.appendChild(eltern('li', t(art ? 'reise_klasse_leer' : 'reise_klasse_keine'), 'schwach'));
			return;
		}
		passend.forEach(function (s) {
			var punkt = eltern('li');
			punkt.appendChild(document.createTextNode(s.n));
			if (s.knoten && nachId[s.knoten]) {
				punkt.appendChild(eltern('span', ' → ' + nachId[s.knoten].n, 'schwach'));
			}
			portListe.appendChild(punkt);
		});
	}

	/* --- Zusammenbau ---------------------------------------------------- */

	function auswerten(ereignis) {
		if (ereignis) { ereignis.preventDefault(); }
		var start = deuten(feldVon, listeVon, 'von');
		if (!start) {
			// Reached from a quest link: the destination is known, the position is
			// not. Say where the target is and ask for the start instead of shouting.
			var nurZiel = deuten(feldNach, listeNach, 'nach');
			if (nurZiel && (nurZiel.ort || nurZiel.lat !== undefined)) {
				var zielOrt = nurZiel.ort || naechsteStation(nurZiel.lat, nurZiel.lon);
				ergebnisLeeren();
				ergebnis.appendChild(eltern('h3', t('reise_ergebnis')));
				ergebnis.appendChild(eltern('p', t('reise_ziel_ist') + ': ' + (zielOrt ? zielOrt.n : ''),
					'reise-hinweis'));
				ergebnis.appendChild(eltern('p', t('reise_start_fehlt')));
				// The destination alone is worth a map: it answers "where is that?".
				if (zielOrt) { kartenZeigen([{ ort: zielOrt, art: 'ziel', nr: null }]); }
				return;
			}
			if (!ergebnis.textContent) { fehlerText(t('reise_start_fehlt')); }
			return;
		}
		var ziel = deuten(feldNach, listeNach, 'nach');
		if (!ziel) { if (!ergebnis.textContent) { fehlerText(t('reise_ziel_fehlt')); } return; }
		if (!start.ort && start.lat === undefined) { zeigeDeutung(feldVon, start); return; }
		if (!ziel.ort && !ziel.lat && !ziel.lon) { zeigeDeutung(feldNach, ziel); return; }
		zeigeWeg(start, ziel);
	}

	function beispiel() {
		var michel = null, udun = null;
		stationen.forEach(function (ort) {
			if (!michel && /michel|michelbinge|michel delving/i.test(ort.n)) { michel = ort; }
			if (!udun && /ud..n.*br..ckenkopf|ud..n foothold/i.test(ort.n)) { udun = ort; }
		});
		if (michel && udun) {
			feldVon.value = michel.n; gewaehlt.von = michel;
			feldNach.value = udun.n; gewaehlt.nach = udun;
			auswerten();
		}
	}

	function starte(daten) {
		stationen = daten.knoten.slice();
		skills = daten.skills || [];
		kartenListe = daten.karten || [];
		karten = {};
		kartenListe.forEach(function (karte) { karten[karte.i] = karte; });

		// The background before the first route: Middle-earth itself.
		var welt = kartenListe.filter(function (karte) { return karte.welt; })[0];
		if (weltBild && welt) {
			weltBild.src = BILDPFAD + welt.bild;
			weltBild.alt = '';
		}

		nachId = {};
		kanten = {};
		stationen.forEach(function (ort) {
			nachId[ort.id] = ort;
			kanten[ort.id] = [];
		});
		daten.strecken.forEach(function (kante) {
			// Two records can share a name at different spots; a hop onto the same
			// name is no help to the player and only pads the list.
			if (nachId[kante.von] && nachId[kante.nach]
				&& nachId[kante.von].n === nachId[kante.nach].n) { return; }
			if (!kanten[kante.von]) { kanten[kante.von] = []; }
			kanten[kante.von].push(kante);
		});
		binde(feldVon, listeVon, 'von');
		binde(feldNach, listeNach, 'nach');
		formular.addEventListener('submit', auswerten);
		var tauschen = document.getElementById('reise-tauschen');
		if (tauschen) {
			tauschen.title = t('reise_tauschen');
			tauschen.addEventListener('click', function () {
				var a = feldVon.value, b = feldNach.value;
				var ga = gewaehlt.von, gb = gewaehlt.nach;
				feldVon.value = b; feldNach.value = a;
				gewaehlt.von = gb; gewaehlt.nach = ga;
				if (a || b) { auswerten(); }
			});
		}
		var knopf = document.getElementById('reise-beispiel');
		if (knopf) { knopf.title = t('reise_beispiel'); knopf.addEventListener('click', beispiel); }

		// A loaded character suggests its class.
		var charakter = window.MQL_SPEICHER && window.MQL_SPEICHER.aktiv ? window.MQL_SPEICHER.aktiv() : null;
		if (klassenFeld) {
			[['', t('reise_klasse_keine')], ['guide', t('reise_klasse_guide')], ['muster', t('reise_klasse_muster')]]
				.forEach(function (paar) {
					var option = document.createElement('option');
					option.value = paar[0]; option.textContent = paar[1];
					klassenFeld.appendChild(option);
				});
			if (charakter && /j.ger|hunter/i.test(charakter.klasse || '')) { klassenFeld.value = 'guide'; }
			if (charakter && /w.chter|warden/i.test(charakter.klasse || '')) { klassenFeld.value = 'muster'; }
			klassenFeld.addEventListener('change', function () {
				zeigePorts();
				// Only a shown route needs a new class note; empty fields should not
				// turn into an error just because the class changed.
				if (feldVon.value.trim() || feldNach.value.trim()) { auswerten(); }
			});
		}
		zeigePorts();

		// A destination may come from the catalogue: ?nach=31.2S,68.4W or &nach=<name>.
		var adresse = new URLSearchParams(window.location.search);
		if (adresse.get('von')) { feldVon.value = adresse.get('von'); }
		if (adresse.get('nach')) { feldNach.value = adresse.get('nach'); }
		if (adresse.get('von') || adresse.get('nach')) { auswerten(); }
	}

	var skript = document.createElement('script');
	skript.src = 'reise-' + sprache + '.js?v=' + (window.MQL_STAND || '0');
	skript.onload = function () {
		if (window.MQL_REISE) { starte(window.MQL_REISE); }
		else { fehlerText(t('keine_daten')); }
	};
	skript.onerror = function () { fehlerText(t('keine_daten')); };
	document.body.appendChild(skript);
})();
