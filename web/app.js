/* Map view for Magic Quest Log.
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
	var listeMehr = document.getElementById('liste-mehr');
	var buehne = document.getElementById('buehne');
	var welt = document.getElementById('welt');
	var bild = document.getElementById('bild');
	var marker = document.getElementById('marker');
	var hinweis = document.getElementById('hinweis');
	var legende = document.getElementById('legende');
	var detail = document.getElementById('detail');
	var zurueck = document.getElementById('zurueck');
	var filterLeiste = document.getElementById('filter');
	var zuklappen = document.getElementById('zuklappen');

	var ANSICHT_JE_SEITE = 200;

	// Catalogue rooms without geography get a readable name.
	var ABSCHNITTE = (window.MQL_TEXTE && window.MQL_TEXTE[sprache] &&
		window.MQL_TEXTE[sprache].abschnitte) || {};

	// --- Progress ------------------------------------------------------
	var fertig = {};
	fortschritt.ids.forEach(function (id) { fertig[id] = true; });
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
		return 'offen';
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
	function besteKarte(eintraege, gebiet) {
		var kandidaten = {};
		eintraege.forEach(function (quest) {
			if (!quest.t.length) { return; }
			var index = quest.t[0][0];
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
		for (var i = 0; i < quest.t.length; i += 1) {
			var ziel = quest.t[i];
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

	function zeichneAst(knoten) {
		var wrapper = eltern('div', null);
		wrapper.className = 'ast tiefe' + knoten.tiefe;

		var zahlen = zaehle(knoten.quests);
		var blatt = knoten.reihenfolge.length === 0;
		var hatPunkte = knoten.quests.some(function (quest) { return quest.t.length > 0; });
		var knopf = eltern('button', null);
		knopf.className = (blatt ? 'zweig blatt' : 'zweig') +
			(hatPunkte ? '' : ' ohne-punkte');
		if (!hatPunkte) { knopf.title = t('ohne_punkte'); }
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
			// Selecting expands when needed – but never collapses.
			if (!blatt && offen[knoten.schluessel] !== true) {
				offen[knoten.schluessel] = true;
				wrapper.classList.add('offen');
				pfeil.textContent = '▾';
			}
			waehleKnoten(knoten);
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
			window.history.replaceState(null, '', adresse.toString());
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

	function waehleKnoten(knoten) {
		zustand.knoten = knoten;
		merkeAdresse(knoten);
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

	function aktualisiereStand() {
		if (!zustand.karte) { stand.textContent = t('kein_gebiet'); return; }
		var zahlen = zustand.knoten ? zaehle(zustand.knoten.quests) : zaehle([]);
		var text = zustand.karte.name;
		if (zustand.knoten) { text += ' · ' + zustand.knoten.name; }
		text += ' · ' + zahlen.gesamt + ' ' +
			(zahlen.gesamt === 1 ? t('aufgabe') : t('aufgaben_mehrzahl'));
		if (hatFortschritt) {
			text += ' · ' + zahlen.erledigt + ' ' + t('erledigt');
			if (zahlen.gesamt) {
				text += ' (' + Math.round(zahlen.erledigt / zahlen.gesamt * 100) + ' %)';
			}
		}
		var hier = 0;
		zustand.treffer.forEach(function (quest) {
			if (zielAuf(quest, zustand.karte)) { hier += 1; }
		});
		if (hier !== zahlen.gesamt) {
			text += ' · ' + ersetze(t('davon_karte'), [hier]);
		}
		stand.textContent = text;
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
			if (!gezaehlt(quest)) { dot.classList.add('nicht-gezaehlt'); }
			if (zustand.auswahl && zustand.auswahl.i === quest.i) {
				dot.classList.add('aktiv');
			}
			dot.style.left = (treffer.punkt.x * 100) + '%';
			dot.style.top = (treffer.punkt.y * 100) + '%';
			dot.title = quest.n + (quest.l ? ' (' + t('stufe') + ' ' + quest.l + ')' : '') +
				(zustandVon(quest) === 'sitzung' ? ' – ' + t('sitzungsspiel') :
					(zustandVon(quest) === 'ausgeschlossen' ? ' – ' + t('nicht_moeglich') :
						(fertig[quest.i] ? t('erledigt_suffix') : '')));
			dot.addEventListener('click', function (ereignis) {
				ereignis.stopPropagation();
				waehle(quest);
			});
			marker.appendChild(dot);
		});

		if (zustand.auswahl && karte.rahmen !== 'unklar') {
			zustand.auswahl.t.forEach(function (ziel) {
				if (ziel[0] !== karte.idx) { return; }
				var punkt = anteil(karte, ziel[1], ziel[2]);
				if (!punkt) { return; }
				var ring = eltern('div', null);
				ring.className = 'schritt nummer';
				ring.dataset.n = ziel[3];
				ring.style.left = (punkt.x * 100) + '%';
				ring.style.top = (punkt.y * 100) + '%';
				marker.appendChild(ring);
			});
		}
	}

	// --- List ----------------------------------------------------------
	var zeilen = {};

	function zeigeListe(titel, eintraege) {
		zustand.treffer = eintraege;
		listeTitel.textContent = titel;
		liste.textContent = '';
		zeilen = {};
		eintraege.slice(0, zustand.sichtbar).forEach(function (quest) {
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
			zeile.appendChild(eltern('span', quest.n));
			if (lage === 'sitzung' || lage === 'ausgeschlossen') {
				var vermerk = eltern('span', lage === 'sitzung' ? t('sitzungsspiel') : t('nicht_moeglich'));
				vermerk.className = 'vermerk';
				zeile.appendChild(vermerk);
			}
			if (quest.l) {
				var stufe = eltern('span', t('stufe') + ' ' + quest.l);
				stufe.className = 'stufe';
				zeile.appendChild(stufe);
			}
			if (!quest.t.length) {
				var ohne = eltern('span', t('ohne_ziel_kurz'));
				ohne.className = 'ohneziel';
				zeile.appendChild(ohne);
			}
			zeile.addEventListener('click', function () { waehle(quest); });
			liste.appendChild(zeile);
			zeilen[quest.i] = zeile;
		});
		listeMehr.hidden = eintraege.length <= zustand.sichtbar;
		listeMehr.textContent = ersetze(t('mehr'),
			[eintraege.length - zustand.sichtbar]);
	}

	/** Progress filter over a quest list. */
	function gefiltert(eintraege) {
		if (zustand.filter === 'offen') {
			// "Open" means the character can still do it.
			return eintraege.filter(function (quest) { return zustandVon(quest) === 'offen'; });
		}
		if (zustand.filter === 'erledigt') {
			return eintraege.filter(function (quest) { return fertig[quest.i] === true; });
		}
		return eintraege;
	}

	function zeichneListe() {
		var begriff = falten(suche.value.trim());
		var titel, quelle;
		if (begriff !== '') {
			quelle = quests.filter(function (quest) {
				return falten(quest.n).indexOf(begriff) >= 0;
			});
			quelle.sort(function (a, b) { return a.n.localeCompare(b.n, t('locale')); });
			titel = t('suchtreffer');
		} else if (zustand.knoten) {
			quelle = zustand.knoten.quests;
			titel = zustand.knoten.name;
		} else {
			zeigeListe(t('aufgaben'), []);
			zeichneMarker();
			return;
		}
		var listeGefiltert = gefiltert(quelle);
		var zusatz = zustand.filter === 'alle' ? '' :
			' · ' + (zustand.filter === 'offen' ? t('filter_offen') : t('filter_erledigt'));
		zeigeListe(titel + ' · ' + listeGefiltert.length + zusatz, listeGefiltert);
		zeichneMarker();
	}

	// --- Detail --------------------------------------------------------
	function zeichneDetail() {
		detail.textContent = '';
		var quest = zustand.auswahl;
		if (!quest) {
			var leer = eltern('p', t('detail_leer'));
			leer.className = 'leer';
			detail.appendChild(leer);
			return;
		}
		detail.appendChild(eltern('h2', quest.n));
		var kennung = [];
		if (quest.l) { kennung.push(t('stufe') + ' ' + quest.l); }
		if (quest.z) { kennung.push(ABSCHNITTE[quest.z] || quest.z); }
		if (quest.u) { kennung.push(quest.u); }
		if (quest.r && quest.r !== quest.z) { kennung.push(quest.r); }
		kennung.push(quest.t.length ?
			quest.t.length + ' ' + (quest.t.length === 1 ? t('ziel') : t('ziele')) :
			t('ohne_ziel_kurz'));
		var lage = zustandVon(quest);
		if (hatFortschritt) {
			if (lage === 'fertig') { kennung.push(t('erledigt')); }
			else if (lage === 'sitzung') { kennung.push(t('sitzungsspiel')); }
			else if (lage === 'ausgeschlossen') { kennung.push(t('nicht_moeglich')); }
			else { kennung.push(t('filter_offen')); }
		}
		var zeile = eltern('div', kennung.join(' · '));
		zeile.className = 'kennung';
		detail.appendChild(zeile);

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

		if (!quest.t.length) {
			var hinweisOhne = eltern('p', t('kein_ziel'));
			hinweisOhne.className = 'leer';
			detail.appendChild(hinweisOhne);
		}
		var hier = zielAuf(quest, zustand.karte);
		if (!hier && quest.t.length) {
			var andere = karteNachIndex[quest.t[0][0]];
			if (andere) {
				var wechseln = eltern('button', ersetze(t('zeigen'), [andere.name]));
				wechseln.className = 'wechseln';
				wechseln.addEventListener('click', function () {
					var knoten = zustand.knoten;
					zeigeKarte(andere.idx);
					zustand.knoten = knoten;
					zustand.auswahl = quest;
					zeichneListe();
					zeichneMarker();
					zeichneDetail();
					aktualisiereStand();
					var punkt = zielAuf(quest, zustand.karte);
					if (punkt) { zentriere(punkt.ziel[1], punkt.ziel[2]); }
				});
				detail.appendChild(wechseln);
			}
		}

		if (quest.d) {
			var text = eltern('p', quest.d);
			text.className = 'text';
			detail.appendChild(text);
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
				schritt[2].forEach(function (ziel) {
					var li = eltern('li', ziel[0]);
					if (ziel[1]) {
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
	// A click in the list does not change the map. Anyone who wants another
	// map gets a button for it in the detail panel.
	function waehle(quest) {
		zustand.auswahl = quest;
		zeichneListe();
		zeichneMarker();
		zeichneDetail();
		var treffer = zielAuf(quest, zustand.karte);
		if (treffer) { zentriere(treffer.ziel[1], treffer.ziel[2]); }
		markiereZeile(quest.i);
	}

	function markiereZeile(id) {
		Object.keys(zeilen).forEach(function (index) {
			zeilen[index].classList.toggle('aktiv', index === id);
		});
	}

	function zentriere(lat, lon) {
		if (!zustand.karte) { return; }
		if (zustand.skala <= 1) { return; }
		var punkt = anteil(zustand.karte, lat, lon);
		if (!punkt) { return; }
		var breite = buehne.clientWidth;
		var hoehe = buehne.clientHeight;
		setzeAnsicht(zustand.skala,
			breite / 2 - punkt.x * breite * zustand.skala,
			hoehe / 2 - punkt.y * hoehe * zustand.skala);
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

	function setzeAnsicht(skala, x, y) {
		zustand.skala = Math.min(8, Math.max(1, skala));
		zustand.x = x;
		zustand.y = y;
		welt.style.transform = 'translate(' + zustand.x + 'px,' + zustand.y + 'px) scale(' +
			zustand.skala + ')';
		// Step numbers only when zoomed in: unzoomed they overlap
		// and become unreadable strings of characters.
		buehne.classList.toggle('zoom', zustand.skala > 1.05);
	}

	buehne.addEventListener('wheel', function (ereignis) {
		ereignis.preventDefault();
		var rahmen = buehne.getBoundingClientRect();
		var px = ereignis.clientX - rahmen.left;
		var py = ereignis.clientY - rahmen.top;
		var neu = zustand.skala * Math.exp(-ereignis.deltaY * 0.0015);
		neu = Math.min(8, Math.max(1, neu));
		var faktor = neu / zustand.skala;
		setzeAnsicht(neu, px - (px - zustand.x) * faktor, py - (py - zustand.y) * faktor);
	}, { passive: false });

	var zieht = null;
	buehne.addEventListener('pointerdown', function (ereignis) {
		if (ereignis.button !== 0) { return; }
		if (ereignis.target && ereignis.target.closest && ereignis.target.closest('.punkt')) {
			return;
		}
		zieht = { x: ereignis.clientX, y: ereignis.clientY, tx: zustand.x, ty: zustand.y };
		buehne.classList.add('zieht');
		buehne.setPointerCapture(ereignis.pointerId);
	});
	buehne.addEventListener('pointermove', function (ereignis) {
		if (!zieht) { return; }
		setzeAnsicht(zustand.skala,
			zieht.tx + (ereignis.clientX - zieht.x),
			zieht.ty + (ereignis.clientY - zieht.y));
	});
	buehne.addEventListener('pointerup', function () { zieht = null; buehne.classList.remove('zieht'); });
	buehne.addEventListener('pointercancel', function () { zieht = null; buehne.classList.remove('zieht'); });

	zurueck.addEventListener('click', function () { setzeAnsicht(1, 0, 0); });

	window.addEventListener('resize', function () {
		passeAn();
		setzeAnsicht(zustand.skala, zustand.x, zustand.y);
	});

	// --- Input ---------------------------------------------------------
	var suchlauf = null;
	suche.addEventListener('input', function () {
		window.clearTimeout(suchlauf);
		suchlauf = window.setTimeout(function () {
			zustand.sichtbar = ANSICHT_JE_SEITE;
			zeichneListe();
		}, 120);
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

	listeMehr.addEventListener('click', function () {
		zustand.sichtbar += ANSICHT_JE_SEITE;
		zeigeListe(listeTitel.textContent, zustand.treffer);
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

	legende.hidden = !hatFortschritt;
	baueBaum();

	var start = knotenAusAdresse();
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
	waehleKnoten(start);
})();
