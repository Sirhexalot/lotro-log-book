/* Travel planner: from any point to the nearest stable-master and on through the
 * network. Data: reise-<sprache>.js (build_reise.py from the game files).
 *
 * No durations and no kilometres: the game data carries prices, minimum levels
 * and requirements, but no riding time. What the player needs to know is which
 * way to go, not how long a horse takes.
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

	var stationen = [];
	var nachId = {};
	var kanten = {};
	var skills = [];
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
		var treffer = orteSuchen(text, 2);
		if (treffer.length === 1) { return { ort: treffer[0] }; }
		if (treffer.length > 1) { return { unklar: treffer }; }
		return { unbekannt: true };
	}

	function vorschlaegeZeigen(feld, liste, schluessel) {
		var treffer = orteSuchen(feld.value, 8);
		liste.textContent = '';
		if (!treffer.length) { liste.hidden = true; return; }
		treffer.forEach(function (ort) {
			var punkt = eltern('li');
			var knopf = eltern('button');
			knopf.type = 'button';
			knopf.appendChild(eltern('span', ort.n));
			if (ort.gebiet) { knopf.appendChild(eltern('small', ort.gebiet)); }
			knopf.addEventListener('mousedown', function (ereignis) {
				ereignis.preventDefault();
				feld.value = ort.n;
				gewaehlt[schluessel] = ort;
				liste.hidden = true;
				feld.focus();
			});
			punkt.appendChild(knopf);
			liste.appendChild(punkt);
		});
		liste.hidden = false;
	}

	function binde(feld, liste, schluessel) {
		feld.addEventListener('input', function () { vorschlaegeZeigen(feld, liste, schluessel); });
		feld.addEventListener('focus', function () { vorschlaegeZeigen(feld, liste, schluessel); });
		feld.addEventListener('blur', function () { setTimeout(function () { liste.hidden = true; }, 150); });
		feld.addEventListener('keydown', function (ereignis) {
			if (ereignis.key !== 'Escape') { return; }
			liste.hidden = true;
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

	function fehlerText(text) {
		ergebnis.textContent = '';
		ergebnis.appendChild(eltern('p', text, 'reise-fehler'));
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

	/** One leg list, used for the planned route and for the way without swift travel. */
	function ketteListe(kette) {
		var liste = eltern('ol', null, 'reise-kette');
		kette.forEach(function (kante) {
			var punkt = eltern('li');
			punkt.appendChild(eltern('span', vonName(kante.von), 'station'));
			punkt.appendChild(document.createTextNode(' → '));
			punkt.appendChild(eltern('span', vonName(kante.nach), 'station'));
			var art = eltern('span', kante.schnell ? t('reise_schnell') : t('reise_langsam'),
				'art ' + (kante.schnell ? 'schnell' : 'langsam'));
			punkt.appendChild(art);
			var angaben = [];
			if (kante.kosten != null) { angaben.push(silber(kante.kosten)); }
			if (kante.stufe) { angaben.push(t('reise_stufe') + ' ' + kante.stufe); }
			if (kante.quest) { angaben.push(t('reise_quest_bedingung')); }
			if (kante.ruf) { angaben.push(t('reise_ruf_bedingung')); }
			if (angaben.length) { punkt.appendChild(eltern('span', angaben.join(' · '), 'preis')); }
			liste.appendChild(punkt);
		});
		return liste;
	}

	function zeigeWeg(start, ziel) {
		var vonOrt = start.ort || naechsteStation(start.lat, start.lon);
		var nachOrt = ziel.ort || naechsteStation(ziel.lat, ziel.lon);
		if (!vonOrt || !nachOrt) { fehlerText(t('reise_kein_weg')); return; }

		var kette = route(vonOrt.id, nachOrt.id, false);
		var langsam = route(vonOrt.id, nachOrt.id, true);
		var charakter = window.MQL_SPEICHER && window.MQL_SPEICHER.aktiv ? window.MQL_SPEICHER.aktiv() : null;
		var meineStufe = charakter && charakter.level ? Number(charakter.level) : 0;
		ergebnis.textContent = '';
		var kopf = eltern('h3', t('reise_ergebnis'));
		ergebnis.appendChild(kopf);

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
	}

	function vonName(id) {
		return nachId[id] ? nachId[id].n : id;
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
				ergebnis.textContent = '';
				ergebnis.appendChild(eltern('h3', t('reise_ergebnis')));
				ergebnis.appendChild(eltern('p', t('reise_ziel_ist') + ': ' + (zielOrt ? zielOrt.n : ''),
					'reise-hinweis'));
				ergebnis.appendChild(eltern('p', t('reise_start_fehlt')));
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
			klassenFeld.addEventListener('change', function () { zeigePorts(); auswerten(); });
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
