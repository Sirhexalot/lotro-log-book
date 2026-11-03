/* Map of the LOTRO Log Book.
 *
 * Display only: data from daten.js and fortschritt.js (build_daten.py),
 * images from ../Karten/. Nothing is fetched, estimated or invented.
 *
 * Tree from the catalogue path: parent region -> region -> sub-region.
 */
(function () {
	'use strict';

	var t = window.MQL_T || function (schluessel) { return schluessel; };
	var ersetze = window.MQL_ERSETZE || function (muster) { return String(muster); };
	var sprache = window.MQL_SPRACHE || 'de';
	var bildOrdner = '../Karten' + (sprache === 'de' ? '/' : '_' + sprache + '/');
	// WebP is about 90 % smaller. Locally it lives under webp/<sprache>/, on the
	// website under karten/<sprache>/ – hence the {sprache} placeholder.
	var webpMuster = window.MQL_BILD_PFAD || '../webp/{sprache}/';
	var webpOrdner = webpMuster.replace('{sprache}', sprache);

	var karten = window.MQL_KARTEN || [];
	var quests = window.MQL_QUESTS || [];
	// Progress: the character chosen in the menu (loaded on the progress page,
	// kept in this browser). A local build may also carry a built-in file; it is
	// only used while no character is chosen.
	var eingebaut = window.MQL_FORTSCHRITT || { ids: [] };
	var speicher = window.MQL_SPEICHER;
	var fortschritt = { ids: speicher ? speicher.aktiveIds() : [] };
	if (!fortschritt.ids.length && !(speicher && speicher.aktiv()) && (eingebaut.ids || []).length) {
		fortschritt = { ids: eingebaut.ids };
	}

	var suche = document.getElementById('suche');
	var stand = document.getElementById('stand');
	var baum = document.getElementById('baum');
	var liste = document.getElementById('liste');
	var listeTitel = document.getElementById('liste-titel');
	var buehne = document.getElementById('buehne');
	var welt = document.getElementById('welt');
	var bild = document.getElementById('bild');
	var marker = document.getElementById('marker');
	var hinweis = document.getElementById('hinweis');
	var legende = document.getElementById('legende');
	var detail = document.getElementById('detail');
	var filterLeiste = document.getElementById('filter');
	var zuklappen = document.getElementById('zuklappen');

	var ANSICHT_JE_SEITE = 200;

	// Catalogue rooms without geography get a readable name.
	var ABSCHNITTE = (window.MQL_TEXTE && window.MQL_TEXTE[sprache] &&
		window.MQL_TEXTE[sprache].abschnitte) || {};

	// --- Progress ------------------------------------------------------
	var fertig = {};
	fortschritt.ids.forEach(function (id) { fertig[id] = true; });
	var aktiverCharakter = speicher && speicher.aktiv();
	var laufend = (aktiverCharakter && aktiverCharakter.laufend) || {};
	var hatFortschritt = fortschritt.ids.length > 0;

	/**
	 * What this quest means for a character.
	 *
	 * Same rule as the plugin: a session play is never written to the journal, and
	 * of two quests that rule each other out only one can be taken. Neither is
	 * counted, so a finished alternative cannot leave a row "open" for ever.
	 * A finished entry always counts, even where the game data claims both sides of
	 * a pair are exclusive.
	 */
	function zustandVon(quest) {
		if (fertig[quest.i] === true) { return 'fertig'; }
		if (quest.x === 1) { return 'sitzung'; }
		if (hatFortschritt && quest.e) {
			for (var index = 0; index < quest.e.length; index += 1) {
				if (fertig[quest.e[index]] === true) { return 'ausgeschlossen'; }
			}
		}
		if (laufend[quest.i]) { return 'laufend'; }
		return 'offen';
	}

	/**
	 * Running counters of an unfinished entry, as LOTRO Companion recorded them:
	 * rows of [objective, condition, done, count]. "teile" counts sub-goals done
	 * of those recorded; "zaehler" finds the count for one goal of the catalogue,
	 * matched by objective index and condition number (never by text).
	 */
	function lauf(quest) {
		var zeilen = laufend[quest.i];
		if (!zeilen) { return null; }
		var fertigTeile = 0;
		zeilen.forEach(function (zeile) { if (zeile[2]) { fertigTeile += 1; } });
		return {
			teile: fertigTeile, gesamt: zeilen.length,
			zaehler: function (schritt, bedingung) {
				for (var i = 0; i < zeilen.length; i += 1) {
					if (String(zeilen[i][0]) === String(schritt) && zeilen[i][1] === bedingung) { return zeilen[i]; }
				}
				return null;
			}
		};
	}

	/** Short progress text for a running entry: the first real counter, else sub-goals. */
	function laufText(quest) {
		var stand = lauf(quest);
		if (!stand) { return ''; }
		var text = '';
		(quest.s || []).some(function (schritt) {
			return schritt[2].some(function (ziel) {
				var z = ziel[1] > 1 && ziel[2] >= 0 ? stand.zaehler(schritt[0], ziel[2]) : null;
				if (z && z[3] !== null && !z[2]) { text = Math.min(z[3], ziel[1]) + '/' + ziel[1]; return true; }
				return false;
			});
		});
		return text || ersetze(t('teilziele'), [stand.teile, stand.gesamt]);
	}

	function gezaehlt(quest) {
		var zustand = zustandVon(quest);
		return zustand !== 'sitzung' && zustand !== 'ausgeschlossen';
	}

	// --- State ---------------------------------------------------------
	var zustand = {
		knoten: null,
		filter: 'alle',
		karte: null,
		auswahl: null,
		treffer: [],
		sichtbar: ANSICHT_JE_SEITE,
		skala: 1,
		x: 0,
		y: 0
	};

	var karteNachIndex = {};
	karten.forEach(function (karte) { karteNachIndex[karte.idx] = karte; });
	var questNachId = {};
	quests.forEach(function (quest) { questNachId[quest.i] = quest; });

	// --- Text ----------------------------------------------------------
	var FALTEN = [
		[/[ÄäÀàÁáÂâÃãÅå]/g, 'a'], [/[ÖöÔôÓóÒò]/g, 'o'], [/[ÜüÛûÙùÚú]/g, 'u'],
		[/[ÉéÈèÊêËë]/g, 'e'], [/[ÎîÏïÍíÌì]/g, 'i'], [/[Çç]/g, 'c'],
		[/[ßẞ]/g, 'ss'], [/[Œœ]/g, 'oe'], [/[Ææ]/g, 'ae'], [/[Ññ]/g, 'n']
	];

	function falten(text) {
		text = String(text == null ? '' : text);
		FALTEN.forEach(function (paar) { text = text.replace(paar[0], paar[1]); });
		return text.toLowerCase();
	}

	function eltern(element, text) {
		var node = document.createElement(element);
		if (text != null) { node.textContent = text; }
		return node;
	}

	function zahl(erledigt, gesamt) {
		if (!hatFortschritt) { return String(gesamt); }
		return erledigt + '/' + gesamt;
	}

	// --- Tree from the catalogue path ----------------------------------
	var WURZEL = { schluessel: '', name: '', tiefe: 0, quests: [], kinder: {}, reihenfolge: [] };

	function eintragen(labels, quest) {
		var knoten = WURZEL;
		knoten.quests.push(quest);
		labels.forEach(function (label, index) {
			var schluessel = knoten.schluessel + '|' + label;
			var kind = knoten.kinder[schluessel];
			if (!kind) {
				kind = { schluessel: schluessel, name: label, tiefe: index + 1,
					quests: [], kinder: {}, reihenfolge: [] };
				knoten.kinder[schluessel] = kind;
				knoten.reihenfolge.push(kind);
			}
			kind.quests.push(quest);
			knoten = kind;
		});
		quest.knoten = knoten;
	}

	function sortiere(knoten) {
		knoten.reihenfolge.sort(function (a, b) {
			return a.name.localeCompare(b.name, t('locale'));
		});
		knoten.quests.sort(function (a, b) { return a.n.localeCompare(b.n, t('locale')); });
		knoten.reihenfolge.forEach(sortiere);
	}

	quests.forEach(function (quest) {
		// All quests go into the tree, even without a target. They count as in
		// the plugin and appear in the list; they just get no dot.
		// The catalogue supplies the whole path as names (section, book,
		// book group or parent region, region, sub-region). If it is missing,
		// the path is built from the individual fields.
		var labels = quest.f && quest.f.length ? quest.f : (function () {
			var zone = quest.z || t('ohne_zuordnung');
			var gebiet = ABSCHNITTE[zone] || zone;
			var region = quest.r || ABSCHNITTE[zone] || t('ohne_obergebiet');
			var gebaut = [region];
			if (gebiet !== region) { gebaut.push(gebiet); }
			if (quest.u) { gebaut.push(quest.u); }
			return gebaut;
		})();
		eintragen(labels, quest);
	});
	sortiere(WURZEL);

	function zaehle(eintraege) {
		// Only what a character can still do is counted (see zustandVon).
		var erledigt = 0, gesamt = 0;
		eintraege.forEach(function (quest) {
			if (!gezaehlt(quest)) { return; }
			gesamt += 1;
			if (fertig[quest.i]) { erledigt += 1; }
		});
		return { gesamt: gesamt, erledigt: erledigt };
	}

	/**
	 * Choose the map for a region.
	 *
	 * What matters is how many of the region's objectives really lie on the
	 * map. The name only counts as a bonus, the MoorMap level only as a
	 * tiebreaker. Before, a city map with the same name won (Minas Tirith,
	 * Pelargir) with not a single objective on it – the map stayed empty.
	 */
	// --- Spoilers: quest givers by default, objectives per quest --------
	// The map shows where a quest is picked up. Its objectives, rings and steps
	// show only for the selected quest after "Ziele einblenden", and fold again
	// with the next one. Deeds have no giver: they always show their objectives.
	var loesung = window.MQL_ART === 'taten';
	var zieleOffen = false;
	function zeigtZiele(quest) {
		return loesung || (zieleOffen && quest != null && zustand.auswahl === quest);
	}
	function orte(quest) {
		if (zeigtZiele(quest)) { return quest.t; }
		return quest.gt ? [[quest.gt[0], quest.gt[1], quest.gt[2], '']] : [];
	}

	function besteKarte(eintraege, gebiet) {
		var kandidaten = {};
		eintraege.forEach(function (quest) {
			var eigene = orte(quest);
			if (!eigene.length) { return; }
			var index = eigene[0][0];
			if (karteNachIndex[index]) { kandidaten[index] = true; }
		});
		var gesucht = falten(gebiet || '').replace(/[^a-z0-9]/g, '');
		var bester = null, besterWert = null;
		Object.keys(kandidaten).forEach(function (index) {
			var karte = karteNachIndex[index];
			var name = falten(karte.name || '').replace(/[^a-z0-9]/g, '');
			var punkte = 0;
			eintraege.forEach(function (quest) {
				if (zielAuf(quest, karte)) { punkte += 1; }
			});
			var wert = punkte * 1000 +
				((gesucht !== '' && name === gesucht) ? 100 : 0) - (karte.tier || 9);
			if (besterWert === null || wert > besterWert) { besterWert = wert; bester = index; }
		});
		return bester === null ? null : Number(bester);
	}

	// --- Projection ----------------------------------------------------
	function anteil(karte, lat, lon) {
		var breite = karte.east - karte.west;
		var hoehe = karte.north - karte.south;
		if (!(breite > 0) || !(hoehe > 0)) { return null; }
		var nx = (lon - karte.west) / breite;
		var ny = (karte.north - lat) / hoehe;
		// Just outside (up to 6 %) is pinned to the edge instead of dropped:
		// an objective slightly beyond the map border should stay visible,
		// but not land in the middle of the map.
		if (nx < -0.06 || nx > 1.06 || ny < -0.06 || ny > 1.06) { return null; }
		return { x: Math.min(1, Math.max(0, nx)), y: Math.min(1, Math.max(0, ny)) };
	}

	/** First objective of a quest on this map, or null. */
	function zielAuf(quest, karte) {
		if (!karte || karte.rahmen === 'unklar') { return null; }
		var eigene = orte(quest);
		for (var i = 0; i < eigene.length; i += 1) {
			var ziel = eigene[i];
			if (ziel[0] !== karte.idx) { continue; }
			var punkt = anteil(karte, ziel[1], ziel[2]);
			if (punkt) { return { punkt: punkt, ziel: ziel }; }
		}
		return null;
	}

	// --- Draw tree -----------------------------------------------------
	var offen = {};
	var knoepfe = {};

	function baueBaum() {
		baum.textContent = '';
		knoepfe = {};
		WURZEL.reihenfolge.forEach(function (ast) {
			baum.appendChild(zeichneAst(ast));
		});
		WURZEL.reihenfolge.forEach(function (ast) {
			if (offen[ast.schluessel] === undefined) { offen[ast.schluessel] = false; }
		});
	}

	/**
	 * Level range of a node, from the levels of its own quests: the middle
	 * half (25th to 75th percentile), so a few low or high stray quests do
	 * not stretch it. Shown only with at least five quests that have a level.
	 */
	/** "5", or "~" / "~100" when the level follows the character. */
	function stufeText(quest) {
		if (!quest.ls) { return String(quest.l); }
		return Number(quest.l) > 1 ? '~' + quest.l : '~';
	}

	function stufenSpanne(eintraege) {
		var stufen = [], mitwachsend = 0;
		eintraege.forEach(function (quest) {
			if (quest.ls) { mitwachsend += 1; } else if (quest.l > 0) { stufen.push(quest.l); }
		});
		// Mostly content that grows with the character: say so instead of a range.
		if (mitwachsend >= 5 && mitwachsend >= stufen.length) { return t('stufe') + ' ~'; }
		if (stufen.length < 5) { return ''; }
		stufen.sort(function (a, b) { return a - b; });
		var unten = stufen[Math.floor((stufen.length - 1) * 0.25)];
		var oben = stufen[Math.ceil((stufen.length - 1) * 0.75)];
		return t('stufe') + ' ' + (unten === oben ? unten : unten + '–' + oben);
	}

	function zeichneAst(knoten) {
		var wrapper = eltern('div', null);
		wrapper.className = 'ast tiefe' + knoten.tiefe;

		var zahlen = zaehle(knoten.quests);
		var blatt = knoten.reihenfolge.length === 0;
		var hatPunkte = knoten.quests.some(function (quest) { return orte(quest).length > 0; });
		var knopf = eltern('button', null);
		knopf.className = (blatt ? 'zweig blatt' : 'zweig') +
			'';
		knopf.dataset.key = knoten.schluessel;
		knopf.title = ersetze(t('baum_titel'),
			[knoten.name, zahlen.erledigt, zahlen.gesamt]);

		// The arrow only expands and collapses, the row itself selects. Before,
		// every click toggled both, so the tree jumped under the pointer.
		var pfeil = eltern('span', blatt ? '' : (offen[knoten.schluessel] ? '▾' : '▸'));
		pfeil.className = 'pfeil';
		knopf.appendChild(pfeil);

		var name = eltern('span', knoten.name);
		name.className = 'name';
		// Level range under the name for areas (second level) only; elsewhere
		// it would double the tree's length, so there it is in the tooltip.
		var spanne = stufenSpanne(knoten.quests);
		if (spanne) {
			if (knoten.tiefe === 2) {
				var bereich = eltern('span', spanne);
				bereich.className = 'bereich';
				name.appendChild(bereich);
			}
			knopf.title += ' · ' + spanne;
		}
		knopf.appendChild(name);

		var zaehler = eltern('span', zahl(zahlen.erledigt, zahlen.gesamt));
		zaehler.className = 'zahl';
		knopf.appendChild(zaehler);

		// Progress as a green underline: length = share of completed
		// quests in this row (including all children). Without a progress
		// file there are no numbers and therefore no line.
		if (hatFortschritt && zahlen.gesamt) {
			var leiste = eltern('span', null);
			leiste.className = 'fortschritt';
			var balken = eltern('span', null);
			balken.className = 'balken';
			balken.style.width = (zahlen.erledigt / zahlen.gesamt * 100) + '%';
			leiste.appendChild(balken);
			knopf.appendChild(leiste);
		}

		if (!blatt) {
			pfeil.addEventListener('click', function (ereignis) {
				ereignis.stopPropagation();
				offen[knoten.schluessel] = !offen[knoten.schluessel];
				wrapper.classList.toggle('offen', offen[knoten.schluessel]);
				pfeil.textContent = offen[knoten.schluessel] ? '▾' : '▸';
			});
		}

		knopf.addEventListener('click', function () {
			// A region only opens and closes; its overview shows on the right. An
			// area (no children) opens its list.
			if (!blatt) {
				offen[knoten.schluessel] = !offen[knoten.schluessel];
				wrapper.classList.toggle('offen', offen[knoten.schluessel]);
				pfeil.textContent = offen[knoten.schluessel] ? '▾' : '▸';
				zeigeRegion(knoten);
				return;
			}
			waehleKnoten(knoten, true);
		});
		wrapper.appendChild(knopf);
		knoepfe[knoten.schluessel] = knopf;

		if (!blatt) {
			var ul = eltern('ul', null);
			ul.className = 'kinder';
			knoten.reihenfolge.forEach(function (kind) {
				var li = eltern('li', null);
				li.appendChild(zeichneAst(kind));
				ul.appendChild(li);
			});
			wrapper.appendChild(ul);
			wrapper.classList.toggle('offen', offen[knoten.schluessel] === true);
		}
		return wrapper;
	}

	function markiereBaum(ohneAufklappen) {
		Object.keys(knoepfe).forEach(function (schluessel) {
			knoepfe[schluessel].classList.toggle('aktiv',
				zustand.knoten != null && zustand.knoten.schluessel === schluessel);
		});
		if (!zustand.knoten || ohneAufklappen === true) { return; }
		var knopf = knoepfe[zustand.knoten.schluessel];
		if (!knopf) { return; }
		// Expand the parents so the entry is visible – without scrolling
		// the tree away under the pointer.
		var huelle = knopf.closest('.ast');
		while (huelle) {
			huelle.classList.add('offen');
			var zweig = huelle.querySelector('.zweig');
			if (zweig && zweig.dataset.key) { offen[zweig.dataset.key] = true; }
			var pfeil = zweig ? zweig.querySelector('.pfeil') : null;
			if (pfeil && pfeil.textContent === '▸') { pfeil.textContent = '▾'; }
			huelle = huelle.parentElement ? huelle.parentElement.closest('.ast') : null;
		}
	}

	// --- Select node ---------------------------------------------------
	function merkeAdresse(knoten) {
		try {
			var adresse = new URL(window.location.href);
			if (knoten && knoten.schluessel) {
				adresse.searchParams.set('gebiet',
					knoten.schluessel.replace(/^\|/, ''));
			} else {
				adresse.searchParams.delete('gebiet');
			}
			window.history.replaceState(window.history.state, '', adresse.toString());
		} catch (fehler) {}
	}

	function knotenAusAdresse() {
		var pfad = null;
		try {
			pfad = new URLSearchParams(window.location.search).get('gebiet');
		} catch (fehler) { return null; }
		if (!pfad) { return null; }
		var schluessel = '|' + pfad;
		if (!knoepfe[schluessel]) { return null; }
		return findeKnoten(WURZEL, schluessel);
	}

	function findeKnoten(knoten, schluessel) {
		if (knoten.schluessel === schluessel) { return knoten; }
		for (var i = 0; i < knoten.reihenfolge.length; i += 1) {
			var treffer = findeKnoten(knoten.reihenfolge[i], schluessel);
			if (treffer) { return treffer; }
		}
		return null;
	}

	// --- Navigation column: tree or list ---------------------------------
	// One column shows either the area tree or the list of the chosen area,
	// with the path back. The browser's back button returns to the tree.
	var navSpalte = document.getElementById('nav');
	var eigeneSchritte = 0;  // history entries this page pushed itself
	var pfadZeile = document.getElementById('pfad');
	function zeigeNav(modus) {
		navSpalte.classList.toggle('liste-offen', modus === 'liste');
		if (modus === 'baum') { markiereBaum(); }
	}
	function zeigePfad(knoten) {
		var teile = (knoten.schluessel || '').split('|').filter(function (teil) { return teil !== ''; });
		teile.pop();
		pfadZeile.textContent = teile.join(' › ');
	}

	function waehleKnoten(knoten, alsListe, ohneVerlauf) {
		zustand.knoten = knoten;
		zu = {};
		zustand.suchliste = knoten.schluessel === '';
		merkeAdresse(knoten);
		zeigePfad(knoten);
		if (alsListe) {
			zeigeNav('liste');
			if (!ohneVerlauf) {
				try {
					window.history.pushState({ mqlListe: knoten.schluessel }, '', window.location.href);
					eigeneSchritte += 1;
				} catch (fehler) {}
			}
		}
		zustand.auswahl = null;
		zustand.sichtbar = ANSICHT_JE_SEITE;
		var index = besteKarte(knoten.quests, knoten.name);
		if (index != null) {
			zeigeKarte(index);
		} else {
			zustand.karte = null;
			marker.textContent = '';
			buehne.classList.add('keinbild');
			hinweis.textContent = t('keine_karte');
			bild.removeAttribute('src');
		}
		zeichneListe();
		aktualisiereStand();
		markiereBaum();
		zeichneDetail();
	}

	function zeigeKarte(index) {
		var karte = karteNachIndex[index];
		if (!karte) { return; }
		zustand.karte = karte;
		zustand.auswahl = null;
		passeAn();
		setzeAnsicht(1, 0, 0);

		buehne.classList.remove('keinbild');
		hinweis.textContent = '';
		var stempel = '?v=' + (window.MQL_STAND || '0');
		var webp = webpOrdner + karte.bild.replace(/\.png$/i, '.webp') + stempel;
		var png = bildOrdner + karte.bild + stempel;
		bild.onerror = function () {
			if (bild.getAttribute('src') !== png) {
				bild.src = png;
				return;
			}
			buehne.classList.add('keinbild');
			hinweis.textContent = t('kein_bild');
		};
		bild.src = webp;
		if (karte.rahmen === 'unklar') {
			hinweis.textContent = t('rahmen_unklar');
		}
		zeichneMarker();
		zeichneDetail();
	}

	// The bar under the map names the map and how many entries of the list lie
	// on it; counts per area are in the detail column.
	function aktualisiereStand() {
		if (!zustand.karte) { stand.textContent = ''; return; }
		var hier = 0, alle = 0;
		zustand.treffer.forEach(function (quest) {
			if (!gezaehlt(quest)) { return; }
			alle += 1;
			if (zielAuf(quest, zustand.karte)) { hier += 1; }
		});
		stand.textContent = ersetze(t('karte_stand'), [zustand.karte.name, hier, alle]);
	}


	// --- Marker --------------------------------------------------------
	function zeichneMarker() {
		marker.textContent = '';
		if (!zustand.karte) { return; }
		var karte = zustand.karte;

		zustand.treffer.forEach(function (quest) {
			var treffer = zielAuf(quest, karte);
			if (!treffer) { return; }
			var dot = eltern('div', null);
			dot.className = 'punkt';
			if (fertig[quest.i]) { dot.classList.add('fertig'); }
			if (laufend[quest.i] && !fertig[quest.i]) { dot.classList.add('laufend'); }
			if (!gezaehlt(quest)) { dot.classList.add('nicht-gezaehlt'); }
			if (zustand.auswahl && zustand.auswahl.i === quest.i) {
				dot.classList.add('aktiv');
			}
			dot.style.left = (treffer.punkt.x * 100) + '%';
			dot.style.top = (treffer.punkt.y * 100) + '%';
			dot.title = quest.n + (quest.l ? ' (' + t('stufe') + ' ' + stufeText(quest) + ')' : '') +
				(zustandVon(quest) === 'sitzung' ? ' – ' + t('sitzungsspiel') :
					(zustandVon(quest) === 'ausgeschlossen' ? ' – ' + t('nicht_moeglich') :
						(fertig[quest.i] ? t('erledigt_suffix') : '')));
			dot.addEventListener('click', function (ereignis) {
				ereignis.stopPropagation();
				waehle(quest);
			});
			marker.appendChild(dot);
		});

		var ringe = 0;
		if (zustand.auswahl && zeigtZiele(zustand.auswahl) && karte.rahmen !== 'unklar') {
			zustand.auswahl.t.forEach(function (ziel) {
				if (ziel[0] !== karte.idx) { return; }
				var punkt = anteil(karte, ziel[1], ziel[2]);
				if (!punkt) { return; }
				ringe += 1;
				var ring = eltern('div', null);
				ring.className = 'schritt nummer';
				ring.dataset.n = ziel[3];
				ring.title = ersetze(t('schritt_n'), [ziel[3]]);
				ring.style.left = (punkt.x * 100) + '%';
				ring.style.top = (punkt.y * 100) + '%';
				marker.appendChild(ring);
			});
		}
		zeigeLegende(ringe > 0);
		zeichneNotizen();
	}

	// --- Filter/Notizen: map notes as in the game's world map -----------
	// Vendors, stable-masters, mailboxes … from our own DAT export, the same
	// categories and icons as the game's filter list. All off by default; the
	// choice is kept in this browser. The data file loads on first use.
	var notizen = null, notizenAn = {};
	try { notizenAn = JSON.parse(window.localStorage.getItem('mql.notizen') || '{}') || {}; } catch (fehler) { notizenAn = {}; }
	var notizenKnopf = document.getElementById('notizen-knopf');
	var notizenFeld = document.getElementById('notizen-feld');
	var notizenListe = document.getElementById('notizen-liste');
	var notizenEbene = eltern('div', null);
	notizenEbene.className = 'notizen-ebene';
	marker.parentNode.insertBefore(notizenEbene, marker);

	function notizBild(code) { return 'notizen/' + code + '.png?v=' + (window.MQL_STAND || '0'); }
	function merkeNotizen() {
		try { window.localStorage.setItem('mql.notizen', JSON.stringify(notizenAn)); } catch (fehler) { /* private mode */ }
	}
	function ladeNotizen(fertig) {
		if (notizen) { fertig(); return; }
		var skript = document.createElement('script');
		skript.src = 'notizen-' + sprache + '.js?v=' + (window.MQL_STAND || '0');
		skript.onload = function () { notizen = window.MQL_NOTIZEN || { k: [], p: [] }; fertig(); };
		document.head.appendChild(skript);
	}
	function zeichneNotizListe() {
		notizenListe.textContent = '';
		notizen.k.forEach(function (art) {
			var zeile = eltern('li', null);
			var feld = eltern('label', null);
			var bildchen = eltern('img', null);
			bildchen.src = notizBild(art[0]);
			bildchen.alt = '';
			var haken = eltern('input', null);
			haken.type = 'checkbox';
			haken.checked = !!notizenAn[art[0]];
			haken.addEventListener('change', function () {
				notizenAn[art[0]] = haken.checked;
				merkeNotizen();
				zeichneNotizen();
			});
			feld.appendChild(bildchen);
			feld.appendChild(eltern('span', art[1]));
			feld.appendChild(haken);
			zeile.appendChild(feld);
			notizenListe.appendChild(zeile);
		});
	}
	function alleNotizen(an) {
		notizen.k.forEach(function (art) { notizenAn[art[0]] = an; });
		merkeNotizen();
		zeichneNotizListe();
		zeichneNotizen();
	}
	function zeichneNotizen() {
		notizenEbene.textContent = '';
		var karte = zustand.karte;
		if (!notizen || !karte || karte.rahmen === 'unklar') { return; }
		// Things at one spot share one icon place; the tooltip names them all.
		var stellen = {};
		notizen.p.forEach(function (ding) {
			if (ding[0] !== karte.idx || !notizenAn[ding[3]]) { return; }
			var punkt = anteil(karte, ding[1], ding[2]);
			if (!punkt) { return; }
			var schluessel = ding[1] + ',' + ding[2];
			var stelle = stellen[schluessel];
			if (!stelle) {
				stelle = stellen[schluessel] = { punkt: punkt, codes: [], zeilen: [] };
			}
			if (stelle.codes.indexOf(ding[3]) < 0) { stelle.codes.push(ding[3]); }
			var zeile = ding[4] + (ding[5] && ding[5] !== ding[4] ? ' · ' + ding[5] : '');
			if (stelle.zeilen.indexOf(zeile) < 0) { stelle.zeilen.push(zeile); }
		});
		Object.keys(stellen).forEach(function (schluessel) {
			var stelle = stellen[schluessel];
			stelle.codes.forEach(function (code, nummer) {
				var symbol = eltern('img', null);
				symbol.className = 'notiz';
				symbol.src = notizBild(code);
				symbol.alt = '';
				symbol.title = stelle.zeilen.join('\n');
				symbol.style.left = 'calc(' + (stelle.punkt.x * 100) + '% + ' + (nummer * 5) + 'px)';
				symbol.style.top = 'calc(' + (stelle.punkt.y * 100) + '% - ' + (nummer * 5) + 'px)';
				notizenEbene.appendChild(symbol);
			});
		});
	}
	if (notizenKnopf) {
		notizenKnopf.addEventListener('click', function () {
			var auf = notizenFeld.hidden;
			notizenFeld.hidden = !auf;
			notizenKnopf.setAttribute('aria-expanded', String(auf));
			if (auf) {
				if (!notizen) {
					notizenListe.textContent = '';
					notizenListe.appendChild(eltern('li', t('notizen_lade')));
				}
				ladeNotizen(function () { zeichneNotizListe(); zeichneNotizen(); });
			}
		});
		document.getElementById('notizen-alle').addEventListener('click', function () { if (notizen) { alleNotizen(true); } });
		document.getElementById('notizen-keine').addEventListener('click', function () { if (notizen) { alleNotizen(false); } });
		document.addEventListener('click', function (ereignis) {
			if (!notizenFeld.hidden && !document.getElementById('notizen').contains(ereignis.target)) {
				notizenFeld.hidden = true;
				notizenKnopf.setAttribute('aria-expanded', 'false');
			}
		});
		// A choice from an earlier visit draws at once.
		if (Object.keys(notizenAn).some(function (code) { return notizenAn[code]; })) {
			ladeNotizen(zeichneNotizen);
		}
	}

	// "Aufgabenführer anzeigen": the quest dots, on by default as in the game.
	var geberSchalter = document.getElementById('geber-schalter');
	if (geberSchalter) {
		geberSchalter.addEventListener('change', function () {
			marker.classList.toggle('ohne-geber', !geberSchalter.checked);
		});
	}

	// Coordinate under the mouse, written like the game ("30.9S, 55.9W").
	var koordinate = document.getElementById('koordinate');
	if (koordinate) {
		welt.addEventListener('mousemove', function (ereignis) {
			var karte = zustand.karte;
			if (!karte || karte.rahmen === 'unklar') { koordinate.textContent = ''; return; }
			var rahmen = welt.getBoundingClientRect();
			var nx = (ereignis.clientX - rahmen.left) / rahmen.width;
			var ny = (ereignis.clientY - rahmen.top) / rahmen.height;
			var lat = karte.north - ny * (karte.north - karte.south);
			var lon = karte.west + nx * (karte.east - karte.west);
			koordinate.textContent = Math.abs(lat).toFixed(1) + (lat < 0 ? 'S' : 'N') + ', ' +
				Math.abs(lon).toFixed(1) + (lon < 0 ? 'W' : (sprache === 'de' ? 'O' : 'E'));
		});
		welt.addEventListener('mouseleave', function () { koordinate.textContent = ''; });
	}

	/** Fold the selected quest's objectives in or out; the map follows. */
	function setzeZiele(an) {
		zieleOffen = an;
		var quest = zustand.auswahl;
		if (quest) { folgeKarte(quest); }
		zeichneListe();
		zeichneMarker();
		zeichneDetail();
		aktualisiereStand();
	}

	/** Show the map of a quest's first place (giver, or objective when shown). */
	function folgeKarte(quest) {
		var erster = orte(quest)[0];
		if (!erster || !karteNachIndex[erster[0]]) { return; }
		if (zustand.karte && zustand.karte.idx === erster[0]) { return; }
		var knoten = zustand.knoten;
		zeigeKarte(erster[0]);
		zustand.knoten = knoten;
		zustand.auswahl = quest;
	}

	/** Legend: progress colours with a character loaded, rings while a quest is selected. */
	function zeigeLegende(mitRingen) {
		document.getElementById('legende-ziele').hidden = !mitRingen;
		legende.querySelectorAll('.legende-fortschritt').forEach(function (eintrag) {
			eintrag.hidden = !hatFortschritt;
		});
		legende.hidden = !hatFortschritt && !mitRingen;
	}

	// --- List ----------------------------------------------------------
	var zeilen = {};

	var zu = {};  // folded list sections of the shown area

	/** Right-hand pane for a region: its areas with level range and counts. */
	function zeigeRegion(knoten) {
		zustand.auswahl = null;
		detail.textContent = '';
		detail.appendChild(eltern('h2', knoten.name));
		var z = zaehle(knoten.quests);
		var kopf = eltern('div', ersetze(t('region_kopf'), [knoten.reihenfolge.length, zahl(z.erledigt, z.gesamt)]));
		kopf.className = 'kennung';
		detail.appendChild(kopf);
		var ul = eltern('ul', null);
		ul.className = 'gebietsliste';
		knoten.reihenfolge.forEach(function (kind) {
			var kz = zaehle(kind.quests);
			var li = eltern('li', null);
			li.appendChild(eltern('span', kind.name));
			var info = eltern('span', [stufenSpanne(kind.quests), zahl(kz.erledigt, kz.gesamt)].filter(Boolean).join(' · '));
			info.className = 'stufe';
			li.appendChild(info);
			li.addEventListener('click', function () { waehleKnoten(kind, true); });
			ul.appendChild(li);
		});
		detail.appendChild(ul);
	}

	function zeigeListe(titel, eintraege) {
		zustand.treffer = eintraege;
		listeTitel.textContent = titel;
		liste.textContent = '';
		zeilen = {};
		// Names that occur more than once in this list get their quest giver
		// beside them, so "Abgetragen" from two givers can be told apart.
		var anzahl = {}, doppelt = {};
		eintraege.forEach(function (quest) { anzahl[quest.n] = (anzahl[quest.n] || 0) + 1; });
		Object.keys(anzahl).forEach(function (name) { if (anzahl[name] > 1) { doppelt[name] = true; } });
		// Sections: the area itself ("general") first, then sub-areas, then quest
		// groups, each with a header that folds it. Entries keep their order inside.
		var reihe = { '': 0 };
		eintraege.forEach(function (quest) {
			var name = quest.a || '';
			if (!(name in reihe)) { reihe[name] = quest.ak ? 1 : 2; }
		});
		var nachAbschnitt = eintraege.slice().sort(function (x, y) {
			var ax = x.a || '', ay = y.a || '';
			if (ax === ay) { return 0; }
			if (reihe[ax] !== reihe[ay]) { return reihe[ax] - reihe[ay]; }
			return ax.localeCompare(ay, t('locale'), { numeric: true });
		});
		zustand.treffer = nachAbschnitt;
		var mitAbschnitten = Object.keys(reihe).length > 1 && !zustand.suchliste;
		var jeAbschnitt = {};
		nachAbschnitt.forEach(function (quest) {
			jeAbschnitt[quest.a || ''] = (jeAbschnitt[quest.a || ''] || 0) + 1;
		});
		// Sections start folded; one that is alone stays open.
		var abschnittZahl = Object.keys(jeAbschnitt).length;
		Object.keys(jeAbschnitt).forEach(function (name) {
			if (zu[name] === undefined) { zu[name] = abschnittZahl > 1; }
		});
		var letzter = null;
		nachAbschnitt.slice(0, zustand.sichtbar).forEach(function (quest) {
			var abschnitt = quest.a || '';
			if (mitAbschnitten && abschnitt !== letzter) {
				letzter = abschnitt;
				var kopf = eltern('li', null);
				kopf.className = 'abschnitt' + (zu[abschnitt] ? ' zu' : '');
				kopf.appendChild(eltern('span', (zu[abschnitt] ? '▸ ' : '▾ ') +
					(abschnitt === '' ? t('allgemein') : abschnitt)));
				var zahlKopf = eltern('span', String(jeAbschnitt[abschnitt]));
				zahlKopf.className = 'stufe';
				kopf.appendChild(zahlKopf);
				kopf.addEventListener('click', function () {
					zu[abschnitt] = !zu[abschnitt];
					zeigeListe(listeTitel.textContent, eintraege);
				});
				liste.appendChild(kopf);
			}
			if (mitAbschnitten && zu[abschnitt]) { return; }
			var zeile = eltern('li', null);
			var lage = zustandVon(quest);
			var erledigt = lage === 'fertig';
			zeile.classList.add(erledigt ? 'erledigt' : 'offen');
			if (lage === 'sitzung' || lage === 'ausgeschlossen') {
				// Not counted: dim it and say why, but keep the row (the quest exists).
				zeile.classList.remove('offen');
				zeile.classList.add('nicht-gezaehlt');
			}
			if (zustand.auswahl && zustand.auswahl.i === quest.i) {
				zeile.classList.add('aktiv');
			}
			var haken = eltern('span', erledigt ? '✓' : (lage === 'offen' ? '·' : ''));
			haken.className = 'haken';
			zeile.appendChild(haken);
			var questName = eltern('span', quest.n);
			questName.className = 'qname';
			if (quest.g && doppelt[quest.n]) {
				var geber = eltern('span', quest.g);
				geber.className = 'geber';
				questName.appendChild(geber);
			}
			zeile.appendChild(questName);
			if (lage === 'sitzung' || lage === 'ausgeschlossen') {
				var vermerk = eltern('span', lage === 'sitzung' ? t('sitzungsspiel') : t('nicht_moeglich'));
				vermerk.className = 'vermerk';
				questName.appendChild(vermerk);
			}
			if (lage === 'laufend') {
				zeile.classList.add('laufend');
				haken.textContent = '◐';
				var stand = eltern('span', laufText(quest));
				stand.className = 'laufstand';
				questName.appendChild(stand);
			}
			if (quest.l) {
				var stufe = eltern('span', t('stufe') + ' ' + stufeText(quest));
				if (quest.ls) { stufe.title = t('mitwachsend'); }
				stufe.className = 'stufe';
				zeile.appendChild(stufe);
			}
			zeile.addEventListener('click', function () { waehle(quest); });
			liste.appendChild(zeile);
			zeilen[quest.i] = zeile;
		});

	}

	/**
	 * Can the active character take this now, as far as the data says? Open, not
	 * ruled out, level reached, every required quest completed (v), one of the
	 * alternatives completed (vo), and nothing we cannot check (vb: class, race,
	 * faction …). Without a level in the progress, the level is not checked.
	 */
	var charakterStufe = Number(aktiverCharakter && aktiverCharakter.level) || 0;
	// Requirements exist for quests only, and need a character's progress.
	var machbarKnopf = document.getElementById('filter-machbar');
	if (machbarKnopf && (window.MQL_ART === 'taten' || !hatFortschritt)) { machbarKnopf.hidden = true; }
	function machbar(quest) {
		if (zustandVon(quest) !== 'offen' || quest.vb) { return false; }
		if (charakterStufe && quest.vl && quest.vl > charakterStufe) { return false; }
		if (quest.v && !quest.v.every(function (id) { return fertig[id] === true; })) { return false; }
		if (quest.vo && !quest.vo.some(function (id) { return fertig[id] === true; })) { return false; }
		return true;
	}

	/** Progress filter over a quest list. */
	function gefiltert(eintraege) {
		if (zustand.filter === 'machbar') {
			return eintraege.filter(machbar);
		}
		if (zustand.filter === 'offen') {
			// "Open" means the character can still do it.
			return eintraege.filter(function (quest) {
				var lage = zustandVon(quest);
				return lage === 'offen' || lage === 'laufend';
			});
		}
		if (zustand.filter === 'erledigt') {
			return eintraege.filter(function (quest) { return fertig[quest.i] === true; });
		}
		return eintraege;
	}

	function zeichneListe() {
		var titel, quelle;
		if (zustand.knoten) {
			quelle = zustand.knoten.quests;
			titel = zustand.knoten.name;
		} else {
			zeigeListe(t('aufgaben'), []);
			zeichneMarker();
			return;
		}
		var listeGefiltert = gefiltert(quelle);
		var zusatz = zustand.filter === 'alle' ? '' : ' · ' + t('filter_' + zustand.filter);
		var gezaehlt = listeGefiltert.filter(function (quest) {
			var lage = zustandVon(quest);
			return lage !== 'sitzung' && lage !== 'ausgeschlossen';
		}).length;
		zeigeListe(titel + ' · ' + gezaehlt + zusatz, listeGefiltert);
		zeichneMarker();
	}

	// --- Detail --------------------------------------------------------
	function zeichneDetail() {
		detail.textContent = '';
		var quest = zustand.auswahl;
		if (!quest) {
			if (zustand.knoten && zustand.knoten !== WURZEL) {
				var k = zustand.knoten;
				detail.appendChild(eltern('h2', k.name));
				var spanneText = stufenSpanne(k.quests);
				if (spanneText) {
					var unter = eltern('div', spanneText);
					unter.className = 'kennung';
					detail.appendChild(unter);
				}
				var z = zaehle(k.quests);
				var werte = [[t('detail_gesamt'), z.gesamt]];
				if (hatFortschritt) {
					var nOffen = 0, nLauf = 0, nAnn = 0;
					k.quests.forEach(function (q) {
						var lage = zustandVon(q);
						if (lage === 'offen') { nOffen += 1; }
						if (lage === 'laufend') { nLauf += 1; }
						if (window.MQL_ART !== 'taten' && machbar(q)) { nAnn += 1; }
					});
					werte.push([t('legende_erledigt'), z.erledigt], [t('legende_offen'), nOffen], [t('in_arbeit'), nLauf]);
					if (window.MQL_ART !== 'taten') { werte.push([t('filter_machbar'), nAnn]); }
				}
				var tabelle = eltern('dl', null);
				tabelle.className = 'uebersicht';
				werte.forEach(function (paar) {
					tabelle.appendChild(eltern('dt', paar[0]));
					tabelle.appendChild(eltern('dd', String(paar[1])));
				});
				detail.appendChild(tabelle);
			}
			var leer = eltern('p', zustand.knoten ? t('detail_waehlen') : t('detail_leer'));
			leer.className = 'leer';
			detail.appendChild(leer);
			return;
		}
		detail.appendChild(eltern('h2', quest.n));
		var kennung = [];
		if (quest.l) { kennung.push(t('stufe') + ' ' + stufeText(quest) + (quest.ls ? ' (' + t('mitwachsend') + ')' : '')); }
		if (quest.g) { kennung.push(ersetze(t('auftraggeber'), [quest.g])); }
		if (quest.z) { kennung.push(ABSCHNITTE[quest.z] || quest.z); }
		if (quest.u) { kennung.push(quest.u); }
		if (quest.r && quest.r !== quest.z) { kennung.push(quest.r); }
		if (zeigtZiele(quest)) {
			kennung.push(quest.t.length ?
				quest.t.length + ' ' + (quest.t.length === 1 ? t('ziel') : t('ziele')) :
				t('ohne_ziel_kurz'));
		}
		var lage = zustandVon(quest);
		if (hatFortschritt) {
			if (lage === 'fertig') { kennung.push(t('erledigt')); }
			else if (lage === 'sitzung') { kennung.push(t('sitzungsspiel')); }
			else if (lage === 'ausgeschlossen') { kennung.push(t('nicht_moeglich')); }
			else if (lage === 'laufend') { kennung.push(t('in_arbeit') + ' · ' + laufText(quest)); }
			else if (machbar(quest)) { kennung.push(t('machbar_jetzt')); }
			else { kennung.push(t('filter_offen')); }
		}
		if (orte(quest).some(function (ziel) { return ziel[4] === 1; })) { kennung.push(t('auf_grosser_karte')); }
		
		var zeile = eltern('div', kennung.join(' · '));
		zeile.className = 'kennung';
		detail.appendChild(zeile);

		// Facts from the game data as small tags.
		var marken = [];
		if (quest.lp) { marken.push(ersetze(t('marke_lp'), [quest.lp])); }
		if (quest.dy) { marken.push(t('marke_taeglich')); }
		if (quest.rp === -1) { marken.push(t('marke_wiederholbar')); }
		else if (quest.rp > 1) { marken.push(ersetze(t('marke_bis'), [quest.rp])); }
		if (quest.gr === 2) { marken.push(t('marke_gruppe')); }
		else if (quest.gr === 1) { marken.push(t('marke_kleingruppe')); }
		if (quest.ix) { marken.push(t('marke_instanz')); }
		if (quest.tl) { marken.push(ersetze(t('marke_zeit'), [quest.tl >= 120 ? Math.round(quest.tl / 60) + ' min' : quest.tl + ' s'])); }
		if (marken.length) {
			var markenZeile = eltern('div', null);
			markenZeile.className = 'marken';
			marken.forEach(function (text) {
				var m = eltern('span', text);
				m.className = 'marke';
				markenZeile.appendChild(m);
			});
			detail.appendChild(markenZeile);
		}

		// Quest chain: what leads here and what comes next, each clickable.
		var davor = (quest.pq || []).map(function (id) { return questNachId[id]; }).filter(Boolean);
		var danach = quest.nq ? questNachId[quest.nq] : null;
		if (davor.length || danach) {
			var kette = eltern('div', null);
			kette.className = 'bedingungen';
			kette.appendChild(eltern('h3', t('kette')));
			var kl = eltern('ul', null);
			function glied(andere, pfeil) {
				var li = eltern('li', null);
				var zeichen = eltern('span', pfeil);
				zeichen.className = 'zeichen' + (fertig[andere.i] ? ' ok' : '');
				li.appendChild(zeichen);
				li.appendChild(document.createTextNode(' ' + andere.n + (fertig[andere.i] ? ' ✓' : '')));
				li.classList.add('sprung');
				li.addEventListener('click', function () { waehle(andere); });
				kl.appendChild(li);
			}
			davor.forEach(function (andere) { glied(andere, '←'); });
			if (danach) { glied(danach, '→'); }
			kette.appendChild(kl);
			detail.appendChild(kette);
		}

		// Requirements, each with its state for the active character.
		if (quest.v || quest.vo || quest.vl || quest.vb) {
			var bedingungen = eltern('div', null);
			bedingungen.className = 'bedingungen';
			bedingungen.appendChild(eltern('h3', t('voraussetzungen')));
			var ul = eltern('ul', null);
			function punkt(text, ok) {
				var li = eltern('li', null);
				var zeichen = eltern('span', ok === null ? '·' : (ok ? '✓' : '○'));
				zeichen.className = 'zeichen' + (ok ? ' ok' : '');
				li.appendChild(zeichen);
				li.appendChild(document.createTextNode(' ' + text));
				ul.appendChild(li);
				return li;
			}
			function aufgabe(id, vorsilbe) {
				var andere = questNachId[id];
				if (!andere) { return; }  // outside the catalogue: says nothing useful
				var li = punkt((vorsilbe || '') + (andere ? andere.n : t('unbekannte_aufgabe')),
					hatFortschritt ? fertig[id] === true : null);
				if (andere) {
					li.classList.add('sprung');
					li.addEventListener('click', function () { waehle(andere); });
				}
			}
			if (quest.vl) { punkt(t('stufe') + ' ' + quest.vl, charakterStufe ? charakterStufe >= quest.vl : null); }
			(quest.v || []).forEach(function (id) { aufgabe(id); });
			(quest.vo || []).forEach(function (id) { aufgabe(id, t('eine_davon') + ' '); });
			if (quest.vb) { punkt(t('weitere_bedingung'), null); }
			bedingungen.appendChild(ul);
			if (ul.children.length) { detail.appendChild(bedingungen); }
		}

		// Why an entry is not counted. Same wording as the plugin.
		if (lage === 'sitzung') {
			var sitzungHinweis = eltern('p', t('sitzung_hinweis'));
			sitzungHinweis.className = 'vermerk-text';
			detail.appendChild(sitzungHinweis);
		}
		if (lage === 'ausgeschlossen') {
			var sperre = '';
			for (var index = 0; index < quest.e.length; index += 1) {
				var andere = questNachId[quest.e[index]];
				if (andere && fertig[andere.i]) { sperre = andere.n; break; }
			}
			var sperrHinweis = eltern('p', ersetze(t('ausgeschlossen_hinweis'), [sperre]));
			sperrHinweis.className = 'vermerk-text';
			detail.appendChild(sperrHinweis);
		}

		if (!orte(quest).length) {
			var hinweisOhne = eltern('p', t(zeigtZiele(quest) ? 'kein_ziel' : 'kein_geberort'));
			hinweisOhne.className = 'leer';
			detail.appendChild(hinweisOhne);
		}

		if (quest.d) {
			var text = eltern('p', quest.d);
			text.className = 'text';
			detail.appendChild(text);
		}

		// One line under the description folds this quest's objectives in or out.
		if (!loesung && (quest.s || []).length) {
			var schalter = eltern('button', (zieleOffen ? '▾ ' + t('ziele_aus') : '▸ ' + t('ziele_ein')) +
				(quest.t.length ? ' (' + quest.t.length + ')' : ''));
			schalter.className = 'ziele-schalter';
			schalter.setAttribute('aria-expanded', String(zieleOffen));
			schalter.addEventListener('click', function () { setzeZiele(!zieleOffen); });
			detail.appendChild(schalter);
			if (!zieleOffen) { return; }
		}
		(quest.s || []).forEach(function (schritt) {
			var block = eltern('div', null);
			schritt[1].forEach(function (absatz) {
				var p = eltern('p', absatz);
				p.className = 'text';
				block.appendChild(p);
			});
			if (schritt[2].length) {
				var ul = eltern('ul', null);
				var stand = lage === 'laufend' ? lauf(quest) : null;
				schritt[2].forEach(function (ziel) {
					var li = eltern('li', ziel[0]);
					var z = stand && ziel[2] >= 0 ? stand.zaehler(schritt[0], ziel[2]) : null;
					if (z && z[2]) {
						// Done according to LOTRO Companion.
						li.classList.add('ziel-fertig');
						li.appendChild(document.createTextNode(' '));
						var ok = eltern('span', '✓');
						ok.className = 'zahl';
						li.appendChild(ok);
					} else if (z && z[3] !== null && ziel[1] > 1) {
						var wert = Math.min(z[3], ziel[1]);
						li.appendChild(document.createTextNode(' '));
						var zahlText = eltern('span', '(' + wert + '/' + ziel[1] + ')');
						zahlText.className = 'zahl';
						li.appendChild(zahlText);
						var leiste = eltern('span', null);
						leiste.className = 'zielbalken';
						var balken = eltern('span', null);
						balken.style.width = Math.round(wert / ziel[1] * 100) + '%';
						leiste.appendChild(balken);
						li.appendChild(leiste);
					} else if (ziel[1]) {
						li.appendChild(document.createTextNode(' '));
						var anzahl = eltern('span', '(' + ziel[1] + ')');
						anzahl.className = 'zahl';
						li.appendChild(anzahl);
					}
					ul.appendChild(li);
				});
				block.appendChild(ul);
			}
			detail.appendChild(block);
		});
	}

	// --- Selection -----------------------------------------------------
	// A click shows the map where the quest is picked up (Adrian, 03.11.); its
	// objectives start folded, and its list section opens.
	function waehle(quest) {
		zustand.auswahl = quest;
		zieleOffen = false;
		if (quest.a !== undefined || zu[quest.a || ''] !== undefined) { zu[quest.a || ''] = false; }
		folgeKarte(quest);
		zeichneListe();
		zeichneMarker();
		zeichneDetail();
		markiereZeile(quest.i);
	}

	function markiereZeile(id) {
		Object.keys(zeilen).forEach(function (index) {
			zeilen[index].classList.toggle('aktiv', index === id);
		});
	}



	// --- View ----------------------------------------------------------
	// The images are 1024x768, so 4:3. If the image is stretched to the
	// window width, the map distorts and the dots look shifted.
	// Hence: image always in its own aspect ratio, centred, with a margin.
	var BILD_SEITE = 4 / 3;

	function passeAn() {
		var breite = buehne.clientWidth;
		var hoehe = buehne.clientHeight;
		if (!breite || !hoehe) { return; }
		var bildBreite = Math.min(breite, hoehe * BILD_SEITE);
		var bildHoehe = bildBreite / BILD_SEITE;
		welt.style.width = bildBreite + 'px';
		welt.style.height = bildHoehe + 'px';
		welt.style.left = Math.round((breite - bildBreite) / 2) + 'px';
		welt.style.top = Math.round((hoehe - bildHoehe) / 2) + 'px';
	}

	// The map stands still: no zoom and no dragging (Adrian, 03.11.).
	function setzeAnsicht() {
		zustand.skala = 1; zustand.x = 0; zustand.y = 0;
		welt.style.transform = 'none';
	}

	window.addEventListener('resize', function () {
		passeAn();
		setzeAnsicht(zustand.skala, zustand.x, zustand.y);
	});

	// --- Input ---------------------------------------------------------
	// --- Search over everything (header) ------------------------------
	// Areas and entries of this page (quests, or deeds with ?art=taten) as you
	// type; a result opens its area and selects it. Enter shows all matches as
	// a list. The other kind is one link away.
	var suchergebnis = document.getElementById('suchergebnis');
	var suchlauf = null;
	var alleKnoten = [];
	(function sammle(knoten) {
		knoten.reihenfolge.forEach(function (kind) { alleKnoten.push(kind); sammle(kind); });
	})(WURZEL);

	function suchtreffer(begriff) {
		var gebiete = alleKnoten.filter(function (k) { return falten(k.name).indexOf(begriff) >= 0; });
		var eintraege = quests.filter(function (q) { return falten(q.n).indexOf(begriff) >= 0; });
		eintraege.sort(function (a, b) { return a.n.localeCompare(b.n, t('locale')); });
		return { gebiete: gebiete, eintraege: eintraege };
	}

	function trefferListe(begriff, eintraege) {
		var knoten = { schluessel: '', name: ersetze(t('suche_ergebnis'), [suche.value.trim()]),
			tiefe: 0, quests: eintraege, kinder: {}, reihenfolge: [] };
		waehleKnoten(knoten, true);
	}

	function schliesseSuche() { suchergebnis.hidden = true; }

	function zeigeSuche() {
		var roh = suche.value.trim();
		var begriff = falten(roh);
		suchergebnis.textContent = '';
		if (begriff.length < 2) { schliesseSuche(); return; }
		var treffer = suchtreffer(begriff);
		function gruppe(titelText, anzahl) {
			var h = eltern('div', titelText + ' · ' + anzahl);
			h.className = 'such-gruppe';
			suchergebnis.appendChild(h);
		}
		function zeile(text, zusatz, aktion) {
			var b = eltern('button', null);
			b.type = 'button';
			b.className = 'such-zeile';
			b.appendChild(eltern('span', text));
			if (zusatz) { var z = eltern('span', zusatz); z.className = 'such-zusatz'; b.appendChild(z); }
			b.addEventListener('click', function () { schliesseSuche(); aktion(); });
			suchergebnis.appendChild(b);
		}
		if (treffer.gebiete.length) {
			gruppe(t('gebiete'), treffer.gebiete.length);
			treffer.gebiete.slice(0, 6).forEach(function (k) {
				var teile = k.schluessel.split('|').filter(Boolean); teile.pop();
				zeile(k.name, teile.join(' › '), function () {
					markiereBaum();
					waehleKnoten(k, true);
				});
			});
		}
		gruppe(t('aufgaben'), treffer.eintraege.length);
		treffer.eintraege.slice(0, 8).forEach(function (q) {
			zeile(q.n, [q.l ? t('stufe') + ' ' + stufeText(q) : '', q.knoten && q.knoten !== WURZEL ? q.knoten.name : ''].filter(Boolean).join(' · '), function () {
				var ziel = q.knoten && q.knoten !== WURZEL ? q.knoten : null;
				if (ziel) {
					waehleKnoten(ziel, true);
					zustand.sichtbar = Math.max(zustand.sichtbar, ziel.quests.indexOf(q) + 1);
				}
				waehle(q);
				if (zeilen[q.i]) { zeilen[q.i].scrollIntoView({ block: 'center' }); }
			});
		});
		if (treffer.eintraege.length > 8) {
			zeile(ersetze(t('suche_alle'), [treffer.eintraege.length]), '', function () {
				trefferListe(begriff, treffer.eintraege);
			});
		}
		var andere = document.createElement('a');
		andere.className = 'such-andere';
		andere.href = 'index.html?' + (window.MQL_ART === 'taten' ? '' : 'art=taten&') + 'lang=' + sprache +
			'&suche=' + encodeURIComponent(roh);
		andere.textContent = t(window.MQL_ART === 'taten' ? 'suche_in_aufgaben' : 'suche_in_taten');
		suchergebnis.appendChild(andere);
		suchergebnis.hidden = false;
	}

	suche.addEventListener('input', function () {
		window.clearTimeout(suchlauf);
		suchlauf = window.setTimeout(zeigeSuche, 120);
	});
	suche.addEventListener('focus', function () { if (suche.value.trim().length >= 2) { zeigeSuche(); } });
	suche.addEventListener('keydown', function (ereignis) {
		if (ereignis.key === 'Escape') { schliesseSuche(); suche.blur(); }
		if (ereignis.key === 'Enter') {
			var begriff = falten(suche.value.trim());
			if (begriff.length >= 2) { schliesseSuche(); trefferListe(begriff, suchtreffer(begriff).eintraege); }
		}
	});
	document.addEventListener('click', function (ereignis) {
		if (!ereignis.target.closest || !ereignis.target.closest('.globalsuche')) { schliesseSuche(); }
	});

	document.getElementById('zum-baum').addEventListener('click', function () {
		// Step back only over entries this page added, never off the site.
		if (eigeneSchritte > 0) { window.history.back(); }
		else { zeigeNav('baum'); }
	});
	window.addEventListener('popstate', function (ereignis) {
		var ziel = ereignis.state && ereignis.state.mqlListe;
		eigeneSchritte = Math.max(0, eigeneSchritte - 1);
		if (ziel && knoepfe[ziel]) {
			waehleKnoten(findeKnoten(WURZEL, ziel), true, true);
		} else {
			zeigeNav('baum');
		}
	});

	filterLeiste.addEventListener('click', function (ereignis) {
		var knopf = ereignis.target.closest ? ereignis.target.closest('button[data-filter]') : null;
		if (!knopf) { return; }
		zustand.filter = knopf.dataset.filter;
		zustand.sichtbar = ANSICHT_JE_SEITE;
		Array.prototype.forEach.call(filterLeiste.children, function (kind) {
			kind.setAttribute('aria-pressed', String(kind === knopf));
		});
		zeichneListe();
		aktualisiereStand();
	});

	zuklappen.addEventListener('click', function () {
		Object.keys(offen).forEach(function (schluessel) { offen[schluessel] = false; });
		baueBaum();
		markiereBaum(true);
	});

	// The list grows while scrolling instead of a "more" button.
	liste.addEventListener('scroll', function () {
		if (zustand.sichtbar >= zustand.treffer.length) { return; }
		if (liste.scrollTop + liste.clientHeight < liste.scrollHeight - 200) { return; }
		zustand.sichtbar += ANSICHT_JE_SEITE;
		var oben = liste.scrollTop;
		zeigeListe(listeTitel.textContent, zustand.treffer);
		liste.scrollTop = oben;
	});

	// --- Start ---------------------------------------------------------
	if (!karten.length || !quests.length) {
		hinweis.textContent = t('keine_daten');
		detail.textContent = '';
		var fehlt = eltern('p', t('fehlt'));
		fehlt.className = 'leer';
		detail.appendChild(fehlt);
		return;
	}

	zeigeLegende(false);
	baueBaum();

	// --- Area search over the tree --------------------------------------
	// Shows matching areas with their parents; a match's children stay
	// visible. Typing expands, clearing returns to the tree as it was.
	var gebietsuche = document.getElementById('gebietsuche');
	function filtereBaum() {
		var begriff = falten(gebietsuche.value.trim());
		function geh(knoten, elternTreffer) {
			var treffer = begriff !== '' && falten(knoten.name).indexOf(begriff) >= 0;
			var kindTreffer = false;
			knoten.reihenfolge.forEach(function (kind) {
				if (geh(kind, elternTreffer || treffer)) { kindTreffer = true; }
			});
			var knopf = knoepfe[knoten.schluessel];
			var huelle = knopf ? knopf.closest('.ast') : null;
			if (huelle) {
				huelle.hidden = begriff !== '' && !treffer && !kindTreffer && !elternTreffer;
				var aufklappen = begriff !== '' ? kindTreffer : offen[knoten.schluessel] === true;
				if (knoten.reihenfolge.length) {
					huelle.classList.toggle('offen', aufklappen);
					var pfeil = knopf.querySelector('.pfeil');
					if (pfeil) { pfeil.textContent = aufklappen ? '▾' : '▸'; }
				}
				knopf.classList.toggle('treffer', treffer);
			}
			return treffer || kindTreffer;
		}
		WURZEL.reihenfolge.forEach(function (ast) { geh(ast, false); });
	}
	gebietsuche.addEventListener('input', filtereBaum);

	// ?id=<quest id> (from the reputation page): open its area and select it.
	var gewuenscht = null;
	try {
		gewuenscht = questNachId[(new URLSearchParams(window.location.search).get('id') || '').toUpperCase()] || null;
	} catch (fehler) { gewuenscht = null; }
	var start = gewuenscht && gewuenscht.knoten && gewuenscht.knoten !== WURZEL ? gewuenscht.knoten : knotenAusAdresse();
	WURZEL.reihenfolge.forEach(function (ast) {
		if (start) { return; }
		ast.reihenfolge.forEach(function (gebiet) {
			if (start) { return; }
			if (gebiet.name === t('startgebiet')) { start = gebiet; }
		});
	});
	if (!start) {
		var groesster = 0;
		WURZEL.reihenfolge.forEach(function (ast) {
			ast.reihenfolge.forEach(function (gebiet) {
				if (gebiet.quests.length > groesster) { groesster = gebiet.quests.length; start = gebiet; }
			});
		});
	}
	if (!start) { start = WURZEL; }
	// Expand the path to the start
	var teile = start.schluessel.split('|').filter(function (teil) { return teil !== ''; });
	var pfad = '';
	teile.forEach(function (teil) {
		pfad += '|' + teil;
		offen[pfad] = true;
	});
	baueBaum();
	var mitAdresse = !!gewuenscht || !!knotenAusAdresse();
	waehleKnoten(start, mitAdresse, true);
	try { window.history.replaceState(mitAdresse ? { mqlListe: start.schluessel } : null, '', window.location.href); } catch (fehler) {}
	var vorgabeSuche = '';
	try { vorgabeSuche = new URLSearchParams(window.location.search).get('suche') || ''; } catch (fehler) {}
	if (vorgabeSuche) { suche.value = vorgabeSuche; zeigeSuche(); suche.focus(); }
	if (gewuenscht) {
		zustand.sichtbar = Math.max(zustand.sichtbar, start.quests.indexOf(gewuenscht) + 1);
		waehle(gewuenscht);
		if (zeilen[gewuenscht.i]) { zeilen[gewuenscht.i].scrollIntoView({ block: 'center' }); }
	}
})();
