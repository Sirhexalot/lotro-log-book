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
	function kartenVorschau(karte) {
		return webpOrdner + 'thumb/' + karte.bild.replace(/\.png$/i, '.webp');
	}

	var karten = window.MQL_KARTEN || [];
	var quests = window.MQL_QUESTS || [];
	var vollstaendig = false;
	var vollstaendigLader = null;
	function ladeVollstaendig(callback) {
		if (vollstaendig) { callback(); return; }
		if (vollstaendigLader) { vollstaendigLader.push(callback); return; }
		vollstaendigLader = [callback];
		var script = document.createElement('script');
		script.src = (window.MQL_ART === 'taten' ? 'daten-taten-' : 'daten-') + sprache + '.js';
		script.onload = function () {
			var voll = window.MQL_QUESTS || [];
			var nachId = {};
			voll.forEach(function (quest) { nachId[quest.i] = quest; });
			quests.forEach(function (quest) {
				if (nachId[quest.i]) { Object.assign(quest, nachId[quest]); }
			});
			// Area shards carry their own objects; they need the full record too,
			// otherwise a selected row keeps an empty description and no steps.
			Object.keys(questNachId).forEach(function (id) {
				if (nachId[id]) { mergeDetails(questNachId[id], nachId[id]); }
			});
			vollstaendig = true;
			var wartende = vollstaendigLader; vollstaendigLader = null;
			wartende.forEach(function (fertig) { fertig(); });
		};
		script.onerror = function () {
			var wartende = vollstaendigLader; vollstaendigLader = null;
			wartende.forEach(function (fertig) {
				fertig(new Error('Questdaten konnten nicht geladen werden.'));
			});
		};
		document.head.appendChild(script);
	}
	// Everything the detail pane needs beyond the compact map entry (description,
	// steps, complete objectives) lives in one small shard per map or region.
	// The 22 MB catalogue is only the fallback for an old deployment.
	var detailGeladen = {};
	var detailLader = {};
	function detailDatei(quest) {
		var karten = (quest && quest.fk) || [];
		if (karten.length) { return 'detail-map-' + karten[karten.length - 1] + '.js'; }
		var labels = (quest && quest.f) || [];
		var region = labels[0] || (quest && quest.r) || '';
		var datei = window.MQL_SHARD_REGION && window.MQL_SHARD_REGION[region];
		return datei ? 'detail-' + datei : null;
	}
	function hatDetails(quest) {
		if (vollstaendig) { return true; }
		var datei = detailDatei(quest);
		return !!(datei && detailGeladen[datei]);
	}
	/** Merge a lazily loaded detail record without deleting known values.
	 *
	 * The detail and region shards carry fields such as an empty `t` list. A plain
	 * Object.assign would then wipe the place the map already knows, and the map
	 * stops following the selection. An empty list or string is therefore treated
	 * as "no new information", never as a correction.
	 */
	function mergeDetails(ziel, quelle) {
		if (!quelle) { return ziel; }
		Object.keys(quelle).forEach(function (feld) {
			var wert = quelle[feld];
			if (wert === null || wert === undefined || wert === '') { return; }
			if (Array.isArray(wert) && !wert.length) { return; }
			ziel[feld] = wert;
		});
		return ziel;
	}

	function ladeDetails(quest, callback) {
		var datei = detailDatei(quest);
		if (!datei || detailGeladen[datei]) { callback(); return; }
		if (detailLader[datei]) { detailLader[datei].push(callback); return; }
		detailLader[datei] = [callback];
		var artOrdner = window.MQL_ART === 'taten' ? 'taten' : 'aufgaben';
		var script = document.createElement('script');
		script.src = 'karten-daten/' + artOrdner + '/' + sprache + '/' + datei +
			'?v=' + (window.MQL_STAND || '0');
		script.onload = function () {
			var rows = window.MQL_GEBIETS_DETAILS || {};
			delete window.MQL_GEBIETS_DETAILS;
			Object.keys(rows).forEach(function (id) {
				if (questNachId[id]) { mergeDetails(questNachId[id], rows[id]); }
			});
			detailGeladen[datei] = true;
			var wartende = detailLader[datei]; delete detailLader[datei];
			wartende.forEach(function (fertig) { fertig(); });
		};
		script.onerror = function () {
			var wartende = detailLader[datei]; delete detailLader[datei];
			ladeVollstaendig(function () {
				wartende.forEach(function (fertig) { fertig(); });
			});
		};
		document.head.appendChild(script);
	}
	// Progress: the character chosen in the menu (loaded on the progress page,
	// kept in this browser). A local build may also carry a built-in file; it is
	// only used while no character is chosen.
	var eingebaut = window.MQL_FORTSCHRITT || { ids: [] };
	var speicher = window.MQL_SPEICHER;
	var fortschritt = { ids: speicher ? speicher.aktiveIds() : [] };
	if (!fortschritt.ids.length && !(speicher && speicher.aktiv()) && (eingebaut.ids || []).length) {
		fortschritt = { ids: eingebaut.ids };
	}
	// Old duplicate deed ids count for their replacement.
	var ersetzt = window.MQL_REPLACED || {};
	fortschritt.ids = fortschritt.ids.map(function (id) { return ersetzt[id] || id; });
	var zusammenfassungNachPfad = {};
	var zusammenfassungNachKarte = {};
	(window.MQL_KARTEN_SUMMARY || []).forEach(function (quest) {
		if (ersetzt[quest.i] || !quest.f || !quest.f.length) { return; }
		var schluessel = '';
		quest.f.forEach(function (label) {
			schluessel += '|' + label;
			(zusammenfassungNachPfad[schluessel] ||
				(zusammenfassungNachPfad[schluessel] = [])).push(quest);
		});
		// A flat tab (the shared landscape list puts every sub-area one level
		// below the landscape) has no catalogue path, but it always has its map.
		(quest.fk || []).forEach(function (kennung) {
			if (kennung == null) { return; }
			(zusammenfassungNachKarte[String(kennung)] ||
				(zusammenfassungNachKarte[String(kennung)] = [])).push(quest);
		});
	});

	var suche = document.getElementById('suche');
	var baum = document.getElementById('baum');
	var liste = document.getElementById('liste');
	var listeTitel = document.getElementById('liste-titel');
	var buehne = document.getElementById('buehne');
	var welt = document.getElementById('welt');
	var bild = document.getElementById('bild');
	var marker = document.getElementById('marker');
	var gelaende = null;
	var hinweis = document.getElementById('hinweis');
	var legende = document.getElementById('legende');
	var legendeMehr = document.getElementById('legende-mehr');
	var legendeVoll = document.getElementById('legende-voll');
	var legendeKlappe = null;
	var detail = document.getElementById('detail');
	var kartenBreadcrumb = document.getElementById('karten-breadcrumb');
	var filterLeiste = document.getElementById('filter');
	var filterKnopf = document.getElementById('filter-knopf');
	var filterAnzahl = document.getElementById('filter-anzahl');
	var filterZuruecksetzen = document.getElementById('filter-zuruecksetzen');
	var filterMobil = window.matchMedia('(max-width: 1000px)');
	var aufgabenSuche = document.getElementById('aufgaben-suche');
	var zuklappen = document.getElementById('zuklappen');

	/* On a phone the lower bar carries view and zoom, so the overlay above the
	   map stays one row with the filters. The nodes themselves only change
	   parents, which keeps the references and listeners of gelaende.js valid. */
	var kartenKopf = document.querySelector('.kartenkopf');
	var kartenKopfRechts = document.querySelector('.kartenkopf-rechts');
	var kartenLeiste = document.querySelector('.kartenleiste');
	function ordneKartenwerkzeuge() {
		if (!kartenKopf || !kartenKopfRechts || !kartenLeiste) { return; }
		var ziel = filterMobil.matches ? kartenLeiste : kartenKopf;
		if (kartenKopfRechts.parentElement !== ziel) { ziel.appendChild(kartenKopfRechts); }
	}
	ordneKartenwerkzeuge();
	filterMobil.addEventListener('change', function () {
		ordneKartenwerkzeuge();
		legendeNeuMessen();
	});

	var ANSICHT_JE_SEITE = 200;

	// Special views own their data, list and map rules. The map app only asks
	// them; it knows nothing about their internals.
	var SONDER = [];
	if (window.MQL_EPIK_ANSICHT) { SONDER.push(window.MQL_EPIK_ANSICHT); }
	function sonderFuer(knoten) {
		for (var index = 0; index < SONDER.length; index += 1) {
			if (SONDER[index].passt && SONDER[index].passt(knoten)) { return SONDER[index]; }
		}
		return null;
	}

	// Catalogue rooms without geography get a readable name.
	var ABSCHNITTE = (window.MQL_TEXTE && window.MQL_TEXTE[sprache] &&
		window.MQL_TEXTE[sprache].abschnitte) || {};

	// --- Progress ------------------------------------------------------
	var fertig = {};
	fortschritt.ids.forEach(function (id) { fertig[id] = true; });
	var aktiverCharakter = speicher && speicher.aktiv();
	var laufend = (aktiverCharakter && aktiverCharakter.laufend) || {};
	var hatFortschritt = fortschritt.ids.length > 0;
	function aktualisiereEffektivenStatus() {
		aktiverCharakter = speicher && speicher.aktiv();
		fertig = {};
		fortschritt.ids.forEach(function (id) { fertig[id] = true; });
		laufend = Object.assign({}, aktiverCharakter && aktiverCharakter.laufend);
		if (!speicher || !speicher.manuelleStatus) { return; }
		['quests', 'deeds'].forEach(function (art) {
			var manuell = (aktiverCharakter && aktiverCharakter.manuell && aktiverCharakter.manuell[art]) || {};
			Object.keys(manuell).forEach(function (id) {
				if (manuell[id] === 'fertig') { fertig[id] = true; delete laufend[id]; }
				else if (manuell[id] === 'laufend') { delete fertig[id]; if (!laufend[id]) { laufend[id] = []; } }
				else { delete fertig[id]; delete laufend[id]; }
			});
		});
	}
	aktualisiereEffektivenStatus();

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
		var manuell = speicher && speicher.manuelleStatus && speicher.manuelleStatus(loesung ? 'deeds' : 'quests', quest.i);
		if (manuell) { return manuell; }
		if (fertig[quest.i] === true) { return 'fertig'; }
		if (quest.x === 1) { return 'sitzung'; }
		// Monster play: fought as a creep, never in a normal journal.
		if (quest.mp === 1) { return 'monster'; }
		if (hatFortschritt && quest.e) {
			for (var index = 0; index < quest.e.length; index += 1) {
				if (fertig[quest.e[index]] === true) { return 'ausgeschlossen'; }
			}
		}
		if (laufend[quest.i]) { return 'laufend'; }
		return 'offen';
	}

	// "Open" is the default for catalogue counts, not evidence of progress.
	function listenStatus(lage, quest) {
		if (lage === 'fertig' || lage === 'laufend') { return lage; }
		if (lage !== 'offen') { return null; }
		var art = loesung ? 'deeds' : 'quests';
		var profil = aktiverCharakter;
		var manuell = profil && profil.manuell && profil.manuell[art];
		return (manuell && manuell[quest.i] === 'offen') || standImportiert(art) ||
			(!profil && hatFortschritt) ? 'offen' : null;
	}
	function standImportiert(art) {
		var profil = aktiverCharakter;
		if (!profil) { return false; }
		return profil.importMeta?.[art] ?? !!profil[art]?.length;
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
		// An instance row of an old story section is a part of its chapter, not a
		// task of its own: the chapter decides whether the step is done.
		if (quest.z === 'story' && quest.ie) { return false; }
		return zustand !== 'sitzung' && zustand !== 'ausgeschlossen' && zustand !== 'monster';
	}

	// --- State ---------------------------------------------------------
	function leseKartenfilter() {
		try {
			var daten = JSON.parse(window.localStorage.getItem('mql.kartenfilter.' + sprache) || 'null');
			if (!daten || typeof daten !== 'object') { return {}; }
			return daten;
		} catch (fehler) { return {}; }
	}
	function speichereKartenfilter() {
		try {
			window.localStorage.setItem('mql.kartenfilter.' + sprache, JSON.stringify({
				v: 1, filter: zustand.filter, belohnung: zustand.belohnung, q: zustand.q
			}));
		} catch (fehler) { /* private mode or quota: the list still works */ }
	}
	var gespeicherterFilter = leseKartenfilter();
	var zustand = {
		knoten: null,
		filter: ['alle', 'offen', 'laufend', 'erledigt', 'machbar'].indexOf(gespeicherterFilter.filter) >= 0 ? gespeicherterFilter.filter : 'alle',
		belohnung: window.MQL_ART === 'taten' && ['alle', 'tugend', 'titel', 'punkte'].indexOf(gespeicherterFilter.belohnung) >= 0 ? gespeicherterFilter.belohnung : 'alle',
		q: typeof gespeicherterFilter.q === 'string' ? gespeicherterFilter.q : '',
		karte: null,
		auswahl: null,
		treffer: [],
		sichtbar: ANSICHT_JE_SEITE,
		skala: 1,
		x: 0,
		y: 0
	};

	var karteNachIndex = {};
	var lesbareKartennamen = {};
	karten.forEach(function (karte) { karteNachIndex[karte.idx] = karte; });

	// Breadcrumb of the map app: the landscape overview first, then the area
	// path of the shown list. Every step is a link, so the list column no longer
	// needs its own "all landscapes" button or a second path line.
	var kartenPfad = document.querySelector('.karten-pfad');
	function zeichneKartenBreadcrumb() {
		if (!kartenBreadcrumb) { return; }
		if (kartenPfad) { kartenPfad.hidden = false; }
		var uebersicht = (typeof ltexte === 'object' && ltexte && ltexte[3]) || t('gebiete');
		var glieder = [{ text: uebersicht, uebersicht: true }];
		var knoten = (typeof haupt !== 'undefined' && haupt &&
			haupt.classList.contains('landschaft-start')) ? null : zustand.knoten;
		if (knoten && knoten.schluessel) {
			var pfad = '';
			knoten.schluessel.split('|').filter(Boolean).forEach(function (name) {
				pfad += '|' + name;
				glieder.push({ text: lesbareKartennamen[name] || name, schluessel: pfad });
			});
		}
		// Long story paths would push the current place out of sight: keep the
		// overview, a gap marker and the last three steps.
		var sichtbar = glieder.length > 4 ? [glieder[0], null].concat(glieder.slice(-3)) : glieder;
		var aktuell = glieder[glieder.length - 1];
		kartenBreadcrumb.textContent = '';
		sichtbar.forEach(function (glied, nummer) {
			if (nummer) {
				var trenner = eltern('span', ' › ');
				trenner.className = 'trenner';
				trenner.setAttribute('aria-hidden', 'true');
				kartenBreadcrumb.appendChild(trenner);
			}
			if (!glied) { kartenBreadcrumb.appendChild(eltern('span', '…')); return; }
			if (glied === aktuell) {
				var jetzt = eltern('span', glied.text);
				jetzt.setAttribute('aria-current', 'page');
				kartenBreadcrumb.appendChild(jetzt);
				return;
			}
			var link = eltern('a', glied.text);
			link.href = '#';
			link.addEventListener('click', function (ereignis) {
				ereignis.preventDefault();
				if (glied.uebersicht) { landschaftUebersicht(); return; }
				var ziel = findeKnoten(WURZEL, glied.schluessel);
				if (!ziel) { return; }
				// A region is the step above its landscapes: go to the overview and
				// leave the reader at that region instead of a stray region list.
				if (ziel.tiefe === 1 && !istThemenWurzel(ziel)) {
					landschaftUebersicht();
					window.requestAnimationFrame(function () {
						var gruppe = Array.prototype.find.call(
							document.querySelectorAll('.landschaft-gruppe h3'),
							function (kopf) { return kopf.textContent.trim() === ziel.name; });
						if (gruppe) { gruppe.scrollIntoView({ block: 'start' }); }
					});
					return;
				}
				waehleKnoten(ziel, true);
			});
			kartenBreadcrumb.appendChild(link);
		});
	}
	var questNachId = {};
	quests.forEach(function (quest) { questNachId[quest.i] = quest; });
	// Chapter id → the instance rows that belong to it (built when first needed).
	var instanzenJeKapitel = null;
	function instanzenVon(kapitelId) {
		if (!instanzenJeKapitel) {
			instanzenJeKapitel = {};
			quests.forEach(function (quest) {
				if (!quest.ie) { return; }
				(instanzenJeKapitel[quest.ie] || (instanzenJeKapitel[quest.ie] = [])).push(quest);
			});
		}
		return instanzenJeKapitel[kapitelId] || [];
	}
	// A session play that only retells a story step which has its own quest row
	// (the interludes): the step is already there, so the replay is no second row.
	var sitzungsdubletten = null;
	function sitzungsdublette(quest) {
		if (quest.x !== 1 || quest.z !== 'story') { return false; }
		if (!sitzungsdubletten) {
			sitzungsdubletten = {};
			quests.forEach(function (anderer) {
				if (anderer.x === 1 || anderer.z !== 'story') { return; }
				sitzungsdubletten[(anderer.a || '') + '|' + storyKern(anderer.n)] = true;
			});
		}
		return sitzungsdubletten[(quest.a || '') + '|' + storyKern(quest.n)] === true;
	}
	function storyKern(name) {
		return String(name || '')
			.replace(/^\s*\d+\.\s*/, '')
			.replace(/^\s*(?:Zwischenspiel|Interlude|Interlude\s*:)\s*:?\s*/i, '')
			.trim()
			.toLowerCase();
	}

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
		if (questNachId[quest.i]) { return; }
		quests.push(quest);
		questNachId[quest.i] = quest;
		var knoten = WURZEL;
		knoten.quests.push(quest);
		labels.forEach(function (label, index) {
			var schluessel = knoten.schluessel + '|' + label;
			var kind = knoten.kinder[schluessel];
			if (!kind) {
				kind = { schluessel: schluessel, name: label, tiefe: index + 1,
					quests: [], eigene: [], kinder: {}, reihenfolge: [], karte: null };
				knoten.kinder[schluessel] = kind;
				knoten.reihenfolge.push(kind);
			}
			kind.quests.push(quest);
			// The map of this level (the tree follows the game's maps), if it has one.
			if (quest.fk && quest.fk[index] != null && karteNachIndex[quest.fk[index]]) { kind.karte = quest.fk[index]; }
			knoten = kind;
		});
		(knoten.eigene || (knoten.eigene = [])).push(quest);
		quest.knoten = knoten;
	}

	function sortiere(knoten) {
		knoten.reihenfolge.sort(function (a, b) {
			return MQL_SORT.compare(a.name, b.name);
		});
		knoten.quests.sort(function (a, b) { return MQL_SORT.compare(a.n, b.n); });
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

	// --- One landscape navigation for quests and deeds ------------------
	// The two catalogues file their entries at different depths: quests reach
	// down to Bree and Archet, most deeds stop at the landscape. Building the
	// tree only from the loaded entries made the deed overview shorter than the
	// quest overview (28 landscapes were missing) and gave some landscapes a
	// different set of map tabs (Adrian, 13.11.2026). The shared list comes from
	// tools/build_gebiete.py out of both catalogues; missing landscapes and map
	// tabs are added here with no entries, so a landscape without deeds stays
	// visible and simply counts zero.
	(function gleicheGebieteAn() {
		var liste = window.MQL_GEBIETE;
		if (!liste || !liste.regionen) { return; }
		/** The node for a map id, preferring one that already carries entries. */
		function mitKarte(knoten, kennung, tief) {
			var treffer = null;
			function suche(ast) {
				if (ast.karte != null && Number(ast.karte) === Number(kennung)) {
					var tiefe = (ast.schluessel || '').split('|').length;
					var tiefeTreffer = treffer ? (treffer.schluessel || '').split('|').length : -1;
					var anzahl = (ast.quests || []).length;
					var anzahlTreffer = treffer ? (treffer.quests || []).length : -1;
					if (!treffer || (anzahl > 0) !== (anzahlTreffer > 0) ||
						((anzahl > 0) === (anzahlTreffer > 0) && (tiefe > tiefeTreffer ||
							(tiefe === tiefeTreffer && anzahl > anzahlTreffer)))) {
						treffer = ast;
					}
				}
				if (tief) { ast.reihenfolge.forEach(suche); }
			}
			suche(knoten);
			return treffer;
		}
		function mitName(knoten, name) {
			for (var i = 0; i < knoten.reihenfolge.length; i += 1) {
				if (knoten.reihenfolge[i].name === name) { return knoten.reihenfolge[i]; }
			}
			return null;
		}
		function neu(elternKnoten, name, karte) {
			var schluessel = elternKnoten.schluessel + '|' + name;
			var kind = { schluessel: schluessel, name: name, tiefe: elternKnoten.tiefe + 1,
				quests: [], eigene: [], kinder: {}, reihenfolge: [], karte: karte == null ? null : karte };
			elternKnoten.kinder[schluessel] = kind;
			elternKnoten.reihenfolge.push(kind);
			return kind;
		}
		liste.regionen.forEach(function (region) {
			var regionKnoten = mitName(WURZEL, region.name) || neu(WURZEL, region.name, null);
			(region.gebiete || []).forEach(function (gebiet) {
				var knoten = (gebiet.karte != null ? mitKarte(regionKnoten, gebiet.karte, true) : null) ||
					mitName(regionKnoten, gebiet.name) || neu(regionKnoten, gebiet.name, gebiet.karte);
				if (knoten.karte == null && gebiet.karte != null) { knoten.karte = gebiet.karte; }
				(gebiet.unter || []).forEach(function (unter) {
					// Some sub-areas sit one level deeper in the game (Isengart under
					// Nan Curunír, Das Eisenloch under Pforte von Rohan). Their node
					// already exists. A flat copy next to the landscape had no entries
					// and showed 0/0 until its shard happened to load.
					var bereits = mitKarte(knoten, unter[0], true);
					if (bereits) {
						if (bereits.karte == null) { bereits.karte = unter[0]; }
						return;
					}
					var vorhanden = mitName(knoten, unter[1]);
					if (vorhanden) {
						if (vorhanden.karte == null) { vorhanden.karte = unter[0]; }
						return;
					}
					neu(knoten, unter[1], unter[0]);
				});
			});
		});
		sortiere(WURZEL);
	})();

	// "Alte Geschichten" has its own authored maps, outside the landscape list
	// built from MQL_GEBIETE. Add a separate map branch without changing each
	// quest's ordinary geographic path.
	var alteGeschichtenKarten = {};
	(function ergaenzeAlteGeschichten() {
		var passendeKarten = karten.filter(function (karte) {
			return ['Alte Geschichten','Tales of Yore','Contes des temps jadis'].indexOf(karte.region) >= 0;
		});
		if (!passendeKarten.length) { return; }
		var titel = passendeKarten[0].region;
		passendeKarten.forEach(function (karte) { alteGeschichtenKarten[Number(karte.idx)] = titel; });
		var wurzel = WURZEL.reihenfolge.find(function (knoten) { return knoten.name === titel; });
		if (!wurzel) {
			var wurzelSchluessel = '|' + titel;
			wurzel = {schluessel:wurzelSchluessel,name:titel,tiefe:1,quests:[],eigene:[],kinder:{},reihenfolge:[],karte:null};
			WURZEL.kinder[wurzelSchluessel] = wurzel;
			WURZEL.reihenfolge.push(wurzel);
		}
		passendeKarten.forEach(function (karte) {
			var id = Number(karte.idx), schluessel = wurzel.schluessel + '|' + karte.name;
			var passend = quests.filter(function (quest) {
				return (quest.fk || []).some(function (mapId) { return Number(mapId) === id; });
			});
			// Nud-melek, 1981 T.A. has no quest and no deed in the client. The map
			// is authored scenery: as a list entry it would open an empty list and
			// a map without dots. It keeps its node, so a hash or direct link still
			// resolves, but the tree hides it. Landscape areas keep the older rule
			// (visible, count 0), because there quests and deeds are two views of
			// the same area.
			var bekannt = (zusammenfassungNachKarte[String(id)] || []).concat(passend);
			var leer = !bekannt.length;
			var knoten = {schluessel:schluessel,name:karte.name,tiefe:2,quests:passend,eigene:passend.slice(),
				kinder:{},reihenfolge:[],karte:id,versteckt:leer};
			wurzel.kinder[schluessel] = knoten;
			wurzel.reihenfolge.push(knoten);
		});
		sortiere(wurzel);
	})();

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
	function zaehlEintraege(knoten) {
		if (!knoten) { return []; }
		// A special view counts what it shows, not the summary of the map data.
		if (knoten.eigeneZaehlung) { return knoten.quests || []; }
		var nachPfad = zusammenfassungNachPfad[knoten.schluessel];
		if (nachPfad) { return nachPfad; }
		// Areas that the game nests deeper than the shared list shows (Isengart
		// under Nan Curunír, Das Eisenloch under Pforte von Rohan) keep their map
		// id. Counting by map fills their tab before any shard is loaded.
		if (knoten.karte != null) {
			var nachKarte = zusammenfassungNachKarte[String(knoten.karte)];
			if (nachKarte) { return nachKarte; }
		}
		return knoten.quests || [];
	}

	/**
	 * Choose the map for a region.
	 *
	 * What matters is how many of the region's objectives really lie on the
	 * map. The name only counts as a bonus, the map's depth only as a
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
		return zieleOffen && quest != null && zustand.auswahl === quest;
	}
	function orte(quest) {
		if (zeigtZiele(quest) && quest.t.length) { return quest.t; }
		if (quest.gt) { return [[quest.gt[0], quest.gt[1], quest.gt[2], '']]; }
		// No known giver place (every deed, some quests): one hollow dot at the first
		// objective marks the area it is in; the other objectives and the steps
		// come with "show objectives". Deeds borrow the place of a quest they ask
		// for (hz), or of a matching enemy (h), so they appear at all.
		if (quest.t.length) { return [quest.t[0]]; }
		if (quest.hz && quest.hz.length) { return [quest.hz[0]]; }
		return quest.h && quest.h.length ? [quest.h[0]] : [];
	}

	function besteKarte(eintraege, gebiet) {
		var kandidaten = {};
		eintraege.forEach(function (quest) {
			var eigene = orte(quest);
			if (!eigene.length) { return; }
			var index = eigene[0][0];
			// The map itself and its parents in the game's map tree: a parent
			// now shows its sub-maps' points and may cover the area best.
			var gesehen = {};
			while (karteNachIndex[index] && !gesehen[index]) {
				gesehen[index] = true;
				kandidaten[index] = true;
				var naechste = karteNachIndex[index].eltern;
				if (!karteNachIndex[naechste] || karteNachIndex[naechste].mr !== karteNachIndex[index].mr) { break; }
				index = naechste;
			}
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
			// Equal counts: the more detailed map wins, so a parent
			// such as Eriador only wins when it really shows more of the area.
			var wert = punkte * 1000 +
				((gesucht !== '' && name === gesucht) ? 100 : 0) + (karte.tier || 0);
			if (besterWert === null || wert > besterWert) { besterWert = wert; bester = index; }
		});
		return bester === null ? null : Number(bester);
	}

	// --- Projection ----------------------------------------------------
	function ansichtsKarte(karte) { return gelaende ? gelaende.frame(karte) : karte; }
	function anteil(karte, lat, lon) {
		karte = ansichtsKarte(karte);
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

	/**
	 * Does this map show a place recorded on map `index`? Its own map always; any
	 * other map of the same game region when the point lies inside its frame
	 * (not pinned to the edge). So Breeland also shows what lies in Bree or Archet.
	 */
	function zeigtOrt(karte, ziel) {
		karte = ansichtsKarte(karte);
		if (ziel[0] === karte.idx) { return anteil(karte, ziel[1], ziel[2]); }
		// An overview whose frame does not fit its sub-maps shows only its own dots.
		if (karte.eigen) { return null; }
		var eigene = karteNachIndex[ziel[0]];
		if (!eigene || eigene.mr == null || eigene.mr !== karte.mr) { return null; }
		var punkt = anteil(karte, ziel[1], ziel[2]);
		if (!punkt) { return null; }
		var nx = (ziel[2] - karte.west) / (karte.east - karte.west);
		var ny = (karte.north - ziel[1]) / (karte.north - karte.south);
		return (nx >= 0 && nx <= 1 && ny >= 0 && ny <= 1) ? punkt : null;
	}

	/** First objective of a quest on this map, or null. */
	function zielAuf(quest, karte) {
		karte = ansichtsKarte(karte);
		if (!karte || karte.rahmen === 'unklar') { return null; }
		var eigene = orte(quest);
		for (var i = 0; i < eigene.length; i += 1) {
			var ziel = eigene[i];
			var punkt = zeigtOrt(karte, ziel);
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
		// An authored map without a single entry stays reachable by its address
		// (hash, direct link) but does not appear as a dead end in the tree.
		if (knoten.versteckt) { wrapper.hidden = true; }

		var zahlen = zaehle(zaehlEintraege(knoten));
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
		var spanne = stufenSpanne(zaehlEintraege(knoten));
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
				// A map with entries of its own opens like a place; a pure group
				// (Gondor, East Rohan) shows its overview.
				if (knoten.karte == null || !(knoten.eigene || []).length) {
					zeigeRegion(knoten);
					return;
				}
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

	/** The deepest area that shows this map — a link from the crafting page. */
	function knotenMitKarte(knoten, kennung) {
		for (var i = 0; i < knoten.reihenfolge.length; i += 1) {
			var treffer = knotenMitKarte(knoten.reihenfolge[i], kennung);
			if (treffer) { return treffer; }
		}
		return (knoten !== WURZEL && knoten.karte === kennung) ? knoten : null;
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
		if (!pfadZeile) { return; }
		var teile = (knoten.schluessel || '').split('|').filter(function (teil) { return teil !== ''; });
		teile.pop();
		pfadZeile.textContent = teile.map(function (name) { return lesbareKartennamen[name] || name; }).join(' › ');
	}

	var geladeneGebietsShards = {};
	var gebietsLader = {};
	// Four at a time: a landscape with twelve sub-areas waited for twelve round
	// trips one after another before its tabs showed their counters.
	var SHARD_GLEICHZEITIG = 4;
	function ladeGebietsDaten(knoten, fertig) {
		if (!knoten || knoten === WURZEL) { fertig(); return; }
		var dateien = [], gesehen = {};
		function add(datei) {
			if (datei && !gesehen[datei] && !geladeneGebietsShards[datei]) {
				gesehen[datei] = true; dateien.push(datei);
			}
		}
		function mapsUnterhalb(ast) {
			// Overview maps such as the Dunland overview have no entries of their
			// own and therefore no shard; the start file names the existing ones.
			if (ast.karte != null && (!window.MQL_SHARD_MAPS ||
				window.MQL_SHARD_MAPS.indexOf(String(ast.karte)) >= 0)) {
				add('map-' + ast.karte + '.js');
			}
			ast.reihenfolge.forEach(mapsUnterhalb);
		}
		mapsUnterhalb(knoten);
		var teile = knoten.schluessel.split('|').filter(function (teil) { return teil !== ''; });
		var region = teile[0];
		var regionDatei = window.MQL_SHARD_REGION && window.MQL_SHARD_REGION[region];
		if (regionDatei) { add(regionDatei); }
		if (!dateien.length) { fertig(); return; }
		var offen = dateien.length;
		var naechste = 0;
		var laufen = 0;
		function abschluss() {
			sortiere(WURZEL);
			instanzenJeKapitel = null;
			fertig();
		}
		function erledigt() {
			laufen -= 1;
			offen -= 1;
			if (!offen) { abschluss(); return; }
			starte();
		}
		function hole(datei) {
			if (gebietsLader[datei]) {
				gebietsLader[datei].push(erledigt);
				return;
			}
			gebietsLader[datei] = [erledigt];
			var skript = document.createElement('script');
			var artOrdner = window.MQL_ART === 'taten' ? 'taten' : 'aufgaben';
			skript.src = 'karten-daten/' + artOrdner + '/' + sprache + '/' + datei +
				'?v=' + (window.MQL_STAND || '0');
			skript.onload = function () {
				var rows = window.MQL_GEBIETS_DATEN || [];
				delete window.MQL_GEBIETS_DATEN;
				geladeneGebietsShards[datei] = true;
				var wartende = gebietsLader[datei]; delete gebietsLader[datei];
				rows.forEach(function (quest) {
					var labels = quest.f && quest.f.length ? quest.f : (function () {
						var zone = quest.z || t('ohne_zuordnung');
						var gebiet = ABSCHNITTE[zone] || zone;
						var regionName = quest.r || ABSCHNITTE[zone] || t('ohne_obergebiet');
						var gebaut = [regionName];
						if (gebiet !== regionName) { gebaut.push(gebiet); }
						if (quest.u) { gebaut.push(quest.u); }
						return gebaut;
					})();
					eintragen(labels, quest);
				});
				wartende.forEach(function (callback) { callback(); });
			};
			skript.onerror = function () {
				var wartende = gebietsLader[datei]; delete gebietsLader[datei];
				wartende.forEach(function (callback) { callback(); });
			};
			document.head.appendChild(skript);
		}
		function starte() {
			while (laufen < SHARD_GLEICHZEITIG && naechste < dateien.length) {
				var datei = dateien[naechste]; naechste += 1; laufen += 1;
				hole(datei);
			}
		}
		starte();
	}

	/** The map a node opens on. A node's own map wins; a special view names its
	 * map itself, otherwise the best map of its entries is used. */
	function karteFuerKnoten(knoten) {
		if (knoten.karte != null && karteNachIndex[knoten.karte]) { return knoten.karte; }
		var sonder = sonderFuer(knoten);
		if (sonder && sonder.karte) {
			var index = sonder.karte();
			if (index != null && karteNachIndex[index]) { return index; }
		}
		return besteKarte(knoten.quests, knoten.name);
	}

	function waehleKnotenSofort(knoten, alsListe, ohneVerlauf) {
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
		var index = karteFuerKnoten(knoten);
		zustand.gebietsKarte = index;
		// A special view may pin a map mode (terrain) for itself without touching
		// the stored view of the other pages.
		var sonder = sonderFuer(knoten);
		SONDER.forEach(function (ansicht) {
			if (ansicht !== sonder && ansicht.verlasse) { ansicht.verlasse(); }
		});
		if (gelaende) {
			gelaende.setView(sonder && sonder.ansicht ? sonder.ansicht() : null);
		}
		if (index != null) {
			zeigeKarte(index);
		} else {
			zustand.karte = null;
			if (gelaende) { gelaende.clear(); }
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

	function waehleKnoten(knoten, alsListe, ohneVerlauf) {
		// A special view brings its own entries; the map shard loader must not
		// pour area data into its node.
		if (!knoten || knoten === WURZEL || knoten.gebietsDatenGeladen || sonderFuer(knoten)) {
			waehleKnotenSofort(knoten, alsListe, ohneVerlauf);
			return;
		}
		zustand.knoten = knoten;
		zustand.auswahl = null;
		zeigePfad(knoten);
		if (alsListe) { zeigeNav('liste'); }
		listeTitel.textContent = knoten.name;
		liste.textContent = '';
		var hinweis = eltern('li', t('lade_karte'));
		hinweis.className = 'listen-hinweis';
		liste.appendChild(hinweis);
		ladeGebietsDaten(knoten, function () {
			knoten.gebietsDatenGeladen = true;
			waehleKnotenSofort(knoten, alsListe, ohneVerlauf);
		});
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
			if (!gelaende || !gelaende.active()) { buehne.classList.add('keinbild'); }
		};
		bild.src = webp;
		if (gelaende) { gelaende.setMap(karte); }
		zeichneKartenBreadcrumb();
		zeichneMarker();
		zeichneDetail();
		kartenStufe();
	}

	// Keep the return button in sync; the redundant map/count caption is gone.
	/** Level range of the map on screen, from the same 25–75 % band as the tree.
	 * Without a chosen area (a link straight to a map) the deepest area that
	 * shows this map supplies it (08.11.2026). */
	function kartenStufe() {
		var feld = document.getElementById('karte-stufe');
		if (!feld) { return; }
		var text = '';
		if (zustand.karte) {
			var knoten = zustand.knoten;
			if (!knoten || knoten === WURZEL || zustand.suchliste) {
				knoten = knotenMitKarte(WURZEL, zustand.karte.idx);
			}
			if (knoten && knoten !== WURZEL) { text = stufenSpanne(zaehlEintraege(knoten)); }
		}
		feld.textContent = text;
		feld.hidden = !text;
	}

	function aktualisiereStand() {
		zeigeZurueck();
		kartenStufe();
	}


	// --- Marker --------------------------------------------------------
	function zeichneMarker() {
		marker.textContent = '';
		if (!zustand.karte) { return; }
		var karte = ansichtsKarte(zustand.karte);

		// Several quests at the same place used to be laid on top of each other: only
		// the topmost could be clicked and the count never matched the list
		// (07.11.2026: up to 55 in the Shire). One marker per place, with a count.
		// Quests on the same spot (within a few pixels) become one marker with a
		// count. Markers that would still overlap are nudged a little apart, so each
		// one stays clickable instead of hiding under the other (07.11.2026).
		var breite = marker.clientWidth || 720;
		var hoehe = marker.clientHeight || 480;
		var stellen = [];
		zustand.treffer.forEach(function (quest) {
			var treffer = zielAuf(quest, karte);
			if (!treffer) { return; }
			var px = treffer.punkt.x * breite;
			var py = treffer.punkt.y * hoehe;
			var nah = null;
			for (var i = 0; i < stellen.length; i += 1) {
				var s = stellen[i];
				if (Math.abs(s.x - px) <= 8 && Math.abs(s.y - py) <= 8) { nah = s; break; }
			}
			if (!nah) {
				nah = { x: px, y: py, quests: [] };
				stellen.push(nah);
			}
			nah.quests.push(quest);
		});
		var gesetzt = [];
		var schuebe = [[0, 0], [16, -6], [-16, 6], [16, 12], [-16, -12], [0, 20], [0, -20]];
		stellen.forEach(function (stelle) {
			var platz = schuebe[0];
			for (var versuch = 0; versuch < schuebe.length; versuch += 1) {
				var p = schuebe[versuch];
				var frei = true;
				for (var i = 0; i < gesetzt.length; i += 1) {
					if (Math.abs(gesetzt[i][0] - (stelle.x + p[0])) < 22 &&
						Math.abs(gesetzt[i][1] - (stelle.y + p[1])) < 22) { frei = false; break; }
				}
				if (frei) { platz = p; break; }
			}
			stelle.platz = [stelle.x + platz[0], stelle.y + platz[1]];
			gesetzt.push(stelle.platz);
		});
		markerVon = {};
		stellen.forEach(function (stelle) {
			var mehrfach = stelle.quests.length > 1;
			var erledigtHier = stelle.quests.filter(function (quest) { return fertig[quest.i]; }).length;
			var fertigAlle = erledigtHier === stelle.quests.length;
			var laufendEiner = stelle.quests.some(function (quest) { return laufend[quest.i] && !fertig[quest.i]; });
			var dot = eltern('div', mehrfach ? String(stelle.quests.length) : '');
			dot.className = 'punkt' + (mehrfach ? ' stapel' : '');
			var nurQuestgeber = stelle.quests.every(function (quest) {
				return !!quest.gt && !zeigtZiele(quest);
			});
			if (nurQuestgeber) { dot.classList.add('questgeber'); }
			if (fertigAlle) { dot.classList.add('fertig'); }
			// A pile with some of its quests done would otherwise look untouched.
			else if (erledigtHier > 0) { dot.classList.add('teils'); }
			else if (laufendEiner) { dot.classList.add('laufend'); }
			if (!stelle.quests.some(gezaehlt)) { dot.classList.add('nicht-gezaehlt'); }
			// A dot only means "objective" when the quest has no known giver place.
			if (!mehrfach && !stelle.quests[0].gt && !zeigtZiele(stelle.quests[0])) {
				dot.classList.add('zielort');
			}
			if (zustand.auswahl && stelle.quests.some(function (quest) { return quest.i === zustand.auswahl.i; })) {
				dot.classList.add('aktiv');
			}
			dot.style.left = stelle.platz[0] + 'px';
			dot.style.top = stelle.platz[1] + 'px';
			dot.title = mehrfach
				? ersetze(t('haufen_titel'), [stelle.quests.length]) + '\n' + stelle.quests.slice(0, 8).map(function (q) { return '· ' + q.n; }).join('\n')
				: stelle.quests[0].n + (stelle.quests[0].l ? ' (' + t('stufe') + ' ' + stufeText(stelle.quests[0]) + ')' : '') +
					(zustandVon(stelle.quests[0]) === 'sitzung' ? ' – ' + t('sitzungsspiel') :
					 zustandVon(stelle.quests[0]) === 'monster' ? ' – ' + t('monsterspiel') :
						(zustandVon(stelle.quests[0]) === 'ausgeschlossen' ? ' – ' + t('nicht_moeglich') :
							(fertig[stelle.quests[0].i] ? t('erledigt_suffix') : '')));
			stelle.quests.forEach(function (quest) { markerVon[quest.i] = dot; });
			dot.addEventListener('mouseenter', function () { hebeZeilen(stelle.quests, true); });
			dot.addEventListener('mouseleave', function () { hebeZeilen(stelle.quests, false); });
			dot.addEventListener('click', function (ereignis) {
				ereignis.stopPropagation();
				if (mehrfach) { zeigeHaufen(dot, stelle.quests); return; }
				schliesseHaufen();
				waehle(stelle.quests[0]);
			});
			marker.appendChild(dot);
		});
		schliesseHaufen();

		var ringe = 0;
		if (zustand.auswahl && zeigtZiele(zustand.auswahl) && karte.rahmen !== 'unklar') {
			zustand.auswahl.t.forEach(function (ziel) {
				var punkt = zeigtOrt(karte, ziel);
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
		// Hints are places, not objectives, so they show without "Ziele einblenden":
		// enemy placements (h) and the places of the quests a deed asks for (hz).
		// They are NOT exact objective rings. Group nearby screen points, anchored
		// at a real placement (never a centroid or a claimed area hull).
		if (zustand.auswahl && karte.rahmen !== 'unklar') {
			var gruppen = {};
			var hinweise = (zustand.auswahl.h || []).map(function (ort) { return { ort: ort, art: 'h' }; })
				.concat((zustand.auswahl.hz || []).map(function (ort) { return { ort: ort, art: 'hz' }; }));
			hinweise.forEach(function (hinweis) {
				var punkt = zeigtOrt(karte, hinweis.ort);
				if (!punkt) { return; }
				var key = Math.floor(punkt.x * breite / 36) + ':' + Math.floor(punkt.y * hoehe / 36);
				if (!gruppen[key]) { gruppen[key] = { punkt: punkt, ort: hinweis.ort, anzahl: 0, art: hinweis.art }; }
				gruppen[key].anzahl += 1;
			});
			Object.keys(gruppen).forEach(function (key) {
				var gruppe = gruppen[key];
				var zeichen = eltern('div', gruppe.anzahl > 1 ? String(gruppe.anzahl) : '');
				zeichen.className = gruppe.art === 'hz' ? 'hinweispunkt' : 'jagdpunkt';
				zeichen.title = (gruppe.art === 'hz' ? t('aufgabenorte') : t('jagdorte')) +
					' · ' + gruppe.anzahl + '\n' +
					koordinatenText(gruppe.ort[1], gruppe.ort[2]) + '\n' +
					t(gruppe.art === 'hz' ? 'aufgabenorte_hinweis' : 'jagd_hinweis');
				zeichen.style.left = (gruppe.punkt.x * 100) + '%';
				zeichen.style.top = (gruppe.punkt.y * 100) + '%';
				marker.appendChild(zeichen);
			});
		}
		zeigeLegende(ringe > 0, stellen.length > 0,
			zustand.treffer.some(function (q) { return q.h && q.h.length; }),
			zustand.treffer.some(function (q) { return q.hz && q.hz.length; }));
		zeichneNotizen();
		zeichneVorkommen();
	}

	// --- Dots, stacks and the list: one gesture on either side ------------
	var markerVon = {};
	var haufenFeld = null;

	function hebeZeilen(quests, an) {
		quests.forEach(function (quest) {
			var zeile = zeilen[quest.i];
			if (zeile) { zeile.classList.toggle('hervor', an); }
		});
	}

	function schliesseHaufen() {
		if (haufenFeld && haufenFeld.parentNode) { haufenFeld.parentNode.removeChild(haufenFeld); }
		haufenFeld = null;
	}

	/** Several quests on one spot: a short list to pick from, right at the dot.
	 * It hangs on the marker layer, not inside the dot: the dot scales on hover and
	 * would blow the list up with it. */
	function zeigeHaufen(dot, quests) {
		schliesseHaufen();
		var feld = eltern('div', null);
		feld.className = 'haufen';
		// Fixed to the viewport: the map stage clips its overflow, and a list inside
		// it would be cut off at the map's edge.
		var stelle = dot.getBoundingClientRect();
		feld.style.left = Math.round(stelle.right + 8) + 'px';
		feld.style.top = Math.round(stelle.top) + 'px';
		feld.appendChild(eltern('p', ersetze(t('haufen_titel'), [quests.length])));
		quests.forEach(function (quest) {
			var knopf = eltern('button', (fertig[quest.i] ? '✓ ' : '') + quest.n);
			knopf.type = 'button';
			if (fertig[quest.i]) { knopf.classList.add('fertig'); }
			knopf.addEventListener('click', function (ereignis) {
				ereignis.stopPropagation();
				schliesseHaufen();
				waehle(quest);
			});
			feld.appendChild(knopf);
		});
		document.body.appendChild(feld);
		// Keep it on screen: flip left above the map's right edge, up near the bottom.
		var masse = feld.getBoundingClientRect();
		if (masse.right > window.innerWidth - 8) {
			feld.style.left = Math.max(8, Math.round(stelle.left - masse.width - 8)) + 'px';
		}
		if (masse.bottom > window.innerHeight - 8) {
			feld.style.top = Math.max(8, Math.round(window.innerHeight - masse.height - 8)) + 'px';
		}
		haufenFeld = feld;
	}

	document.addEventListener('click', function () { schliesseHaufen(); });
	document.addEventListener('keydown', function (ereignis) {
		if (ereignis.key === 'Escape') { schliesseHaufen(); }
	});

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


	function notizBild(code) { return 'notizen/lesbar/' + code + '.png?v=' + (window.MQL_STAND || '0'); }
	function merkeNotizen() {
		try { window.localStorage.setItem('mql.notizen', JSON.stringify(notizenAn)); } catch (fehler) { /* private mode */ }
	}
	function ladeNotizen(fertig) {
		if (notizen) { fertig(); return; }
		var skript = document.createElement('script');
		skript.src = 'notizen-' + sprache + '.js?v=' + (window.MQL_STAND || '0');
		skript.onload = function () { notizen = window.MQL_NOTIZEN || { k: [], p: [] }; fertig(); };
		// Without this the list stayed on "Lade …" forever when the data file
		// was missing (404 answers no onload).
		skript.onerror = function () { notizen = { k: [], p: [] }; fertig(); };
		document.head.appendChild(skript);
	}
	function zeichneNotizListe() {
		notizenListe.textContent = '';
		if (!notizen.k.length) {
			notizenListe.appendChild(eltern('li', t('notizen_leer')));
			return;
		}
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
		var karte = ansichtsKarte(zustand.karte);
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
		window.MQL_KLAPPE.bind(notizenKnopf, notizenFeld, {
			vorOeffnen: function () {
				if (!notizen) {
					notizenListe.textContent = '';
					notizenListe.appendChild(eltern('li', t('notizen_lade')));
				}
				ladeNotizen(function () { zeichneNotizListe(); zeichneNotizen(); });
			}
		});
		document.getElementById('notizen-alle').addEventListener('click', function () { if (notizen) { alleNotizen(true); } });
		document.getElementById('notizen-keine').addEventListener('click', function () { if (notizen) { alleNotizen(false); } });
		// A choice from an earlier visit draws at once.
		if (Object.keys(notizenAn).some(function (code) { return notizenAn[code]; })) {
			ladeNotizen(zeichneNotizen);
		}
	}

	// "Questgeber anzeigen": the quest dots, on by default as in the game.
	var geberSchalter = document.getElementById('geber-schalter');
	if (geberSchalter) {
		if (loesung) {
			geberSchalter.hidden = true;
		} else {
			geberSchalter.addEventListener('click', function () {
				var sichtbar = geberSchalter.getAttribute('aria-pressed') !== 'true';
				geberSchalter.setAttribute('aria-pressed', sichtbar ? 'true' : 'false');
				marker.classList.toggle('ohne-geber', !sichtbar);
			});
		}
	}

	function koordinatenText(lat, lon) {
		return Math.abs(lat).toFixed(1) + (lat < 0 ? 'S' : 'N') + ', ' +
			Math.abs(lon).toFixed(1) + (lon < 0 ? 'W' : (sprache === 'de' ? 'O' : 'E'));
	}
	// --- Vorkommen: crafting resources from the game's own placements -----
	// Category 50 ("Crafting Resource") in the client's map notes: the spots
	// where ore, wood and scholar finds can stand. One spot carries two to six
	// variants, so a dot says "one of these can be here", never "this one is
	// here now". Counts and names live in vorkommen-<sprache>.js, the points of
	// one map in vorkommen/<map>.js and load when the layer is first used.
	var vorkommen = null, vorkWahl = {}, vorkKarten = {}, vorkLaeuft = {};
	var vorkBild = null, vorkTip = null, vorkStellen = [];
	var vorkLinkKarte = 0, vorkLinkAktiv = false, vorkGespeicherteWahl = null;
	try {
		var vorkAdresse = new URLSearchParams(window.location.search);
		vorkLinkKarte = parseInt(vorkAdresse.get('vorkarte'), 10) || 0;
	} catch (fehler) { vorkLinkKarte = 0; }
	var VORK_BERUFE = ['PROSPECTOR', 'FORESTER', 'SCHOLAR', 'COOK'];
	var VORK_TEXT = { PROSPECTOR: 'vorkommen_erz', FORESTER: 'vorkommen_holz',
		SCHOLAR: 'vorkommen_gelehrte', COOK: 'vorkommen_anbau' };
	var vorkKnopf = document.getElementById('vorkommen-knopf');
	var vorkFeld = document.getElementById('vorkommen-feld');
	var vorkListe = document.getElementById('vorkommen-liste');
	// Whether anything was saved decides the start, not what it contains: a
	// stored choice of "nothing" must stay off after a reload (13.11.2026).
	// Keep the map quiet unless the player has explicitly enabled resources.
	var vorkGespeichert = null;
	try { vorkGespeichert = window.localStorage.getItem('mql.vorkommen'); } catch (fehler) { vorkGespeichert = null; }
	if (vorkGespeichert === null) {
		VORK_BERUFE.forEach(function (beruf) { vorkWahl[beruf] = ''; });
	} else {
		try {
			var vorkAlt = JSON.parse(vorkGespeichert) || {};
			vorkWahl = vorkAlt.wahl || {};
			// Older browsers kept on/off per trade; carry that over.
			if (vorkAlt.an) {
				Object.keys(vorkAlt.an).forEach(function (beruf) {
					if (vorkAlt.an[beruf] && !vorkWahl[beruf]) { vorkWahl[beruf] = '*'; }
				});
			}
		} catch (fehler) { vorkWahl = {}; }
	}
	vorkGespeicherteWahl = JSON.parse(JSON.stringify(vorkWahl));

	function vorkMerken() {
		try {
			window.localStorage.setItem('mql.vorkommen',
				JSON.stringify({ wahl: vorkWahl }));
		} catch (fehler) { /* private mode */ }
	}
	function vorkFarbe(beruf) {
		var token = '--beruf-' + String(beruf || '').toLowerCase();
		var rootStyle = getComputedStyle(document.documentElement);
		return rootStyle.getPropertyValue(token).trim()
			|| rootStyle.getPropertyValue('--beruf-standard').trim();
	}
	function vorkTypen() { return (vorkommen && vorkommen.k) || []; }
	function vorkAnzahl() {
		var zahl = 0;
		Object.keys(vorkWahl).forEach(function (beruf) { if (vorkWahl[beruf]) { zahl += 1; } });
		return zahl;
	}
	/** Type numbers the layer shows: per trade either nothing, all or one kind. */
	function vorkErlaubt() {
		var erlaubt = {};
		VORK_BERUFE.forEach(function (beruf) {
			var wahl = vorkWahl[beruf] || '';
			if (!wahl) { return; }
			vorkTypen().forEach(function (typ, nummer) {
				if (typ[2] !== beruf) { return; }
				if (wahl === '*' || typ[0] === wahl) { erlaubt[nummer] = true; }
			});
		});
		return erlaubt;
	}

	function ladeVorkommen(fertig) {
		if (vorkommen) { fertig(); return; }
		var skript = document.createElement('script');
		skript.src = 'vorkommen-' + sprache + '.js?v=' + (window.MQL_STAND || '0');
		skript.onload = function () {
			vorkommen = window.MQL_VORKOMMEN || { k: [], m: [], n: [] };
			fertig();
		};
		skript.onerror = function () {
			vorkommen = { k: [], m: [], n: [] };
			fertig();
		};
		document.head.appendChild(skript);
	}

	/** Points of one map; a missing file simply means "no spots here". */
	function ladeVorkKarte(kennung, fertig) {
		if (gelaende && gelaende.hasResources(kennung) === undefined) {
			gelaende.ready.then(function () { ladeVorkKarte(kennung, fertig); }); return;
		}
		if (gelaende && gelaende.hasResources(kennung) === false) { vorkKarten[kennung] = []; fertig(); return; }
		if (vorkKarten[kennung] || vorkLaeuft[kennung]) {
			if (vorkKarten[kennung]) { fertig(); }
			return;
		}
		vorkLaeuft[kennung] = true;
		var skript = document.createElement('script');
		skript.src = 'vorkommen/' + kennung + '.js?v=' + (window.MQL_STAND || '0');
		skript.onload = function () {
			vorkKarten[kennung] = window.MQL_VORKOMMEN_KARTE || [];
			vorkLaeuft[kennung] = false;
			fertig();
		};
		skript.onerror = function () {
			vorkKarten[kennung] = [];
			vorkLaeuft[kennung] = false;
			fertig();
		};
		document.head.appendChild(skript);
	}

	/** Types that actually appear somewhere; the cook's crops never do. */
	function vorkMitPunkten() {
		var da = {};
		(vorkommen && vorkommen.m || []).forEach(function (karte) {
			karte[1].forEach(function (paar) { da[paar[0]] = true; });
		});
		return da;
	}

	function vorkBaueListe() {
		vorkListe.textContent = '';
		var mit = vorkMitPunkten();
		var berufe = [];
		['PROSPECTOR', 'FORESTER', 'SCHOLAR', 'COOK'].forEach(function (beruf) {
			vorkTypen().some(function (typ, nummer) {
				if (typ[2] === beruf && mit[nummer]) { berufe.push(beruf); return true; }
				return false;
			});
		});
		// One line per trade, each with its own kind. Every line starts empty:
		// the layer only draws what the player asked for.
		berufe.forEach(function (beruf) {
			var feld = eltern('label', null);
			feld.className = 'vorkommen-zeile';
			var farbe = eltern('i', null);
			farbe.style.background = vorkFarbe(beruf);
			feld.appendChild(farbe);
			feld.appendChild(eltern('span', t(VORK_TEXT[beruf] || 'vorkommen')));
			var wahl = eltern('select', null);
			wahl.setAttribute('aria-label', t(VORK_TEXT[beruf] || 'vorkommen'));
			var nichts = eltern('option', t('vorkommen_nichts'));
			nichts.value = '';
			wahl.appendChild(nichts);
			var alle = eltern('option', t('vorkommen_alle_sorten'));
			alle.value = '*';
			wahl.appendChild(alle);
			vorkTypen().forEach(function (typ, nummer) {
				if (typ[2] !== beruf || !mit[nummer]) { return; }
				var eintrag = eltern('option', typ[1]);
				eintrag.value = typ[0];
				wahl.appendChild(eintrag);
			});
			wahl.value = vorkWahl[beruf] || '';
			wahl.addEventListener('change', function () {
				vorkLinkAktiv = false;
				vorkWahl[beruf] = wahl.value;
				vorkMerken();
				zeichneMarker();
			});
			feld.appendChild(wahl);
			vorkListe.appendChild(feld);
		});
	}

	function vorkEbeneBauen() {
		if (vorkBild) { return vorkBild; }
		vorkBild = eltern('canvas', null);
		vorkBild.className = 'vorkommen-ebene';
		marker.parentNode.insertBefore(vorkBild, marker);
		vorkBild.addEventListener('click', function (ereignis) {
			ereignis.stopPropagation();
			vorkZeigeTip(ereignis, vorkNaechster(ereignis));
		});
		return vorkBild;
	}

	function vorkNaechster(ereignis) {
		var rahmen = vorkBild.getBoundingClientRect();
		var faktor = gelaende ? gelaende.scale() : 1;
		var x = (ereignis.clientX - rahmen.left) / faktor, y = (ereignis.clientY - rahmen.top) / faktor;
		var beste = null, abstand = 100;
		vorkStellen.forEach(function (stelle) {
			var d = (stelle.x - x) * (stelle.x - x) + (stelle.y - y) * (stelle.y - y);
			if (d < abstand) { abstand = d; beste = stelle; }
		});
		return beste;
	}

	function vorkSchliesseTip() {
		if (vorkTip && vorkTip.parentNode) { vorkTip.parentNode.removeChild(vorkTip); }
		vorkTip = null;
	}

	function vorkZeigeTip(ereignis, stelle) {
		vorkSchliesseTip();
		if (!stelle) { return; }
		var feld = eltern('div', null);
		feld.className = 'vorkommen-tip';
		feld.appendChild(eltern('p', t('vorkommen_titel')));
		var liste = eltern('ul', null);
		stelle.typen.forEach(function (nummer) {
			var typ = vorkTypen()[nummer];
			if (!typ) { return; }
			var zeile = eltern('li', null);
			var farbe = eltern('i', null);
			farbe.style.background = vorkFarbe(typ[2]);
			zeile.appendChild(farbe);
			zeile.appendChild(eltern('span', typ[1]));
			liste.appendChild(zeile);
		});
		feld.appendChild(liste);
		var ort = eltern('p', null);
		ort.className = 'klein';
		ort.textContent = koordinatenText(stelle.lat, stelle.lon);
		feld.appendChild(ort);
		if (stelle.typen.length === 1) {
			var link = eltern('a', t('vorkommen_handwerk'));
			link.href = 'handwerk.html?rohstoff=' + encodeURIComponent(vorkTypen()[stelle.typen[0]][0]) + '#rohstoffe';
			feld.appendChild(link);
		}
		feld.style.left = Math.min(ereignis.clientX + 10, window.innerWidth - 310) + 'px';
		feld.style.top = Math.max(8, Math.min(ereignis.clientY + 10, window.innerHeight - 220)) + 'px';
		document.body.appendChild(feld);
		vorkTip = feld;
	}

	/** One legend entry for the whole layer: its swatch carries every chosen
	 * profession colour, the switch panel names them. One entry per profession
	 * pushed the bar into new lines and the map jumped (08.11.2026). */
	function vorkLegendeSetzen(erlaubt) {
		var feld = document.getElementById('legende-vorkommen');
		var knopf = document.getElementById('vorkommen');
		if (knopf) { knopf.classList.toggle('an', !!erlaubt); }
		if (!feld) { return; }
		feld.textContent = '';
		if (!erlaubt) { feld.hidden = true; pruefeLegendenbreite(); return; }
		var berufe = [];
		vorkTypen().forEach(function (typ, nummer) {
			if (erlaubt[nummer] && berufe.indexOf(typ[2]) < 0) { berufe.push(typ[2]); }
		});
		if (!berufe.length) { feld.hidden = true; pruefeLegendenbreite(); return; }
		var punkt = eltern('i', null);
		punkt.className = 'vorkommen-farbe';
		punkt.style.background = berufe.length > 1
			? 'conic-gradient(' + berufe.map(function (beruf, nummer) {
				return vorkFarbe(beruf) + ' ' + Math.round(nummer * 100 / berufe.length) + '% ' +
					Math.round((nummer + 1) * 100 / berufe.length) + '%';
			}).join(', ') + ')'
			: vorkFarbe(berufe[0]);
		feld.appendChild(punkt);
		feld.appendChild(eltern('span', t('legende_vorkommen')));
		feld.hidden = false;
		legende.hidden = false;
		pruefeLegendenbreite();
	}

	function zeichneVorkommen() {
		var bild = vorkEbeneBauen();
		var karte = zustand.karte;
		if (vorkLinkAktiv && (!karte || Number(karte.idx) !== vorkLinkKarte)) {
			vorkWahl = JSON.parse(JSON.stringify(vorkGespeicherteWahl || {}));
			vorkLinkAktiv = false;
			if (vorkommen) { vorkBaueListe(); }
		}
		var aktiv = vorkommen && karte && vorkAnzahl();
		bild.style.pointerEvents = aktiv ? 'auto' : 'none';
		if (!aktiv) { bild.width = 1; bild.height = 1; vorkStellen = []; vorkSchliesseTip(); vorkLegendeSetzen(null); return; }
		var breite = marker.clientWidth;
		var hoehe = marker.clientHeight;
		var zoom = gelaende ? gelaende.scale() : 1;
		var dpr = Math.min((window.devicePixelRatio || 1) * zoom, Math.sqrt(12000000 / Math.max(1, breite * hoehe)));
		bild.width = Math.max(1, Math.round(breite * dpr));
		bild.height = Math.max(1, Math.round(hoehe * dpr));
		var strich = bild.getContext('2d');
		strich.setTransform(dpr, 0, 0, dpr, 0, 0);
		strich.clearRect(0, 0, breite, hoehe);
		vorkStellen = [];
		vorkSchliesseTip();
		if (!vorkKarten[karte.idx]) {
			ladeVorkKarte(karte.idx, function () { zeichneVorkommen(); });
			return;
		}
		var erlaubt = vorkErlaubt();
		var punkte = vorkKarten[karte.idx] || [];
		var gezeichnet = 0;
		punkte.forEach(function (punkt) {
			var typen = [];
			for (var i = 0; i < punkt[2].length; i += 1) {
				if (erlaubt[punkt[2][i]]) { typen.push(punkt[2][i]); }
			}
			if (!typen.length) { return; }
			var stelle = anteil(karte, punkt[0], punkt[1]);
			if (!stelle) { return; }
			var x = stelle.x * breite, y = stelle.y * hoehe;
			var beruf = (vorkTypen()[typen[0]] || [])[2];
			// A dark rim keeps a dot readable on parchment and under quest dots.
			strich.fillStyle = getComputedStyle(document.documentElement)
				.getPropertyValue('--vorkommen-umriss').trim();
			strich.fillRect(x - 3/zoom, y - 3/zoom, 6/zoom, 6/zoom);
			strich.fillStyle = vorkFarbe(beruf);
			strich.fillRect(x - 2/zoom, y - 2/zoom, 4/zoom, 4/zoom);
			vorkStellen.push({ x: x, y: y, lat: punkt[0], lon: punkt[1], typen: typen });
			gezeichnet += 1;
		});
		vorkLegendeSetzen(erlaubt);
	}

	if (vorkKnopf) {
		window.MQL_KLAPPE.bind(vorkKnopf, vorkFeld, {
			vorOeffnen: function () {
				if (!vorkommen) {
					vorkListe.textContent = '';
					vorkListe.appendChild(eltern('li', t('vorkommen_lade')));
				}
				ladeVorkommen(function () { vorkBaueListe(); zeichneVorkommen(); });
			}
		});
		document.getElementById('vorkommen-alle').addEventListener('click', function () {
			if (!vorkommen) { return; }
			vorkLinkAktiv = false;
			VORK_BERUFE.forEach(function (beruf) { vorkWahl[beruf] = '*'; });
			vorkMerken();
			vorkBaueListe();
			zeichneMarker();
		});
		document.getElementById('vorkommen-keine').addEventListener('click', function () {
			if (!vorkommen) { return; }
			vorkLinkAktiv = false;
			VORK_BERUFE.forEach(function (beruf) { vorkWahl[beruf] = ''; });
			vorkMerken();
			vorkBaueListe();
			zeichneMarker();
		});
		document.addEventListener('click', function (ereignis) {
			if (vorkTip && !vorkTip.contains(ereignis.target)) { vorkSchliesseTip(); }
		});
		window.addEventListener('resize', function () { zeichneVorkommen(); });
		// On phones the map column is hidden behind the Liste/Karte switch: the
		// canvas is 0 px wide until it appears, so watch the map's own size.
		if (window.ResizeObserver) {
			new ResizeObserver(function () { zeichneVorkommen(); }).observe(marker);
		}
		// A choice from an earlier visit draws at once, a link may name one kind.
		try {
			var gewaehlt = new URLSearchParams(window.location.search).get('vorkommen');
			if (gewaehlt) {
				ladeVorkommen(function () {
					var typ = vorkTypen().filter(function (eintrag) { return eintrag[0] === gewaehlt; })[0];
					if (typ) {
						vorkWahl[typ[2]] = typ[0];
						vorkLinkAktiv = !!vorkLinkKarte && !!zustand.karte &&
							Number(zustand.karte.idx) === vorkLinkKarte;
					}
					// A resource link controls this visit only. Manual changes in
					// the panel still go through vorkMerken() and remain a preference.
					vorkBaueListe();
					zeichneVorkommen();
				});
			} else if (vorkAnzahl()) {
				ladeVorkommen(function () { vorkBaueListe(); zeichneVorkommen(); });
			}
		} catch (fehler) { /* no URLSearchParams */ }
	}

	// Coordinate under the mouse, written like the game ("30.9S, 55.9W").
	var koordinate = document.getElementById('koordinate');
	if (koordinate) {
		welt.addEventListener('mousemove', function (ereignis) {
			var karte = ansichtsKarte(zustand.karte);
			if (!karte || karte.rahmen === 'unklar') { koordinate.textContent = ''; return; }
			var rahmen = welt.getBoundingClientRect();
			var nx = (ereignis.clientX - rahmen.left) / rahmen.width;
			var ny = (ereignis.clientY - rahmen.top) / rahmen.height;
			var lat = karte.north - ny * (karte.north - karte.south);
			var lon = karte.west + nx * (karte.east - karte.west);
			koordinate.textContent = koordinatenText(lat, lon);
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

	/** Smallest related game map containing all explicitly requested places. */
	function karteFuerOrte(orte, fallback) {
		if (!orte.length) { return karteNachIndex[fallback] ? fallback : null; }
		function flaeche(m) { return (m.east - m.west) * (m.north - m.south); }
		function vorfahr(id, ziel) {
			var gesehen = {};
			while (karteNachIndex[id] && !gesehen[id]) {
				if (id === ziel) { return true; }
				gesehen[id] = true; id = karteNachIndex[id].eltern;
			}
			return false;
		}
		var kandidaten = karten.filter(function (m) {
			if (m.rahmen === 'unklar' || !(m.east > m.west) || !(m.north > m.south)) { return false; }
			return orte.every(function (p) {
				var original = karteNachIndex[p[0]];
				if (!original || original.mr == null || original.mr !== m.mr) { return false; }
				if (m.idx !== original.idx && (m.eigen || !(
					vorfahr(m.idx, original.idx) || vorfahr(original.idx, m.idx)))) { return false; }
				return p[1] >= m.south && p[1] <= m.north && p[2] >= m.west && p[2] <= m.east;
			});
		});
		kandidaten.sort(function (a, b) {
			return flaeche(a) - flaeche(b) ||
				Number(b.idx === orte[0][0]) - Number(a.idx === orte[0][0]) || a.idx - b.idx;
		});
		return kandidaten.length ? kandidaten[0].idx : (karteNachIndex[fallback] ? fallback : null);
	}

	/** Follow the giver or revealed objectives without replacing the list. */
	function folgeKarte(quest) {
		var ausgewaehlt = karteFuerOrte(orte(quest), zustand.gebietsKarte);
		if (ausgewaehlt != null) {
			if (!zustand.karte || zustand.karte.idx !== ausgewaehlt) {
				zeigeKarte(ausgewaehlt);
				zustand.auswahl = quest;
			}
			if (landschaftBereich) { landschaftReiter(); }
		}
	}

	// Back to the area's own map after following a quest onto a detail map.
	var zurueck = document.getElementById('gebietskarte');
	function zeigeZurueck() {
		if (!zurueck) { return; }
		var gebiet = karteNachIndex[zustand.gebietsKarte];
		var sichtbar = !!(gebiet && zustand.karte && zustand.karte.idx !== gebiet.idx);
		zurueck.hidden = !sichtbar;
		if (sichtbar) { zurueck.textContent = ersetze(t('zur_gebietskarte'), [gebiet.name]); }
	}
	if (zurueck) {
		zurueck.addEventListener('click', function () {
			var auswahl = zustand.auswahl, knoten = zustand.knoten;
			zeigeKarte(zustand.gebietsKarte);
			zustand.knoten = knoten;
			zustand.auswahl = auswahl;
			if (landschaftBereich) { landschaftReiter(); }
			zeichneMarker();
			zeichneDetail();
			aktualisiereStand();
		});
	}

	/** The legend is one line: entries that do not fit are left out and "?" opens
	 * all of them above the bar. The bar never grows, so the map keeps its size
	 * instead of being rescaled on every toggle (08.11.2026). */
	function pruefeLegendenbreite() {
		if (!legende) { return; }
		var kinder = Array.prototype.slice.call(legende.children);
		kinder.forEach(function (kind) { kind.classList.remove('zu-breit'); });
		/* On a phone the row shows no legend at all: everything lives in the "?"
		   panel, so there is nothing to measure and nothing to drop. */
		if (legende.hidden || legende.offsetParent === null) {
			if (legendeMehr) { legendeMehr.classList.toggle('aus', legende.hidden); }
			if (legendeKlappe) { legendeKlappe.schliessen(); }
			return;
		}
		// Measure against the row, not against the legend itself: the legend is a
		// shrinking flex item, so its own width follows what is left after entries
		// were hidden. That made the "?" appear although nothing was cut off
		// (14.11.2026).
		var zeile = legende.parentElement;
		var platz = legende.clientWidth;
		if (zeile) {
			var stil = window.getComputedStyle(zeile);
			var luecke = parseFloat(stil.columnGap) || parseFloat(stil.gap) || 6;
			platz = zeile.clientWidth;
			Array.prototype.forEach.call(zeile.children, function (kind) {
				if (kind === legende || kind.hidden) { return; }
				platz -= kind.getBoundingClientRect().width + luecke;
			});
			platz -= luecke;
		}
		var genutzt = 0;
		var ueber = false;
		kinder.forEach(function (kind) {
			if (kind.hidden) { return; }
			if (!ueber) {
				var breite = kind.getBoundingClientRect().width;
				var naechste = genutzt + (genutzt ? luecke : 0) + breite;
				if (naechste <= platz) { genutzt = naechste; return; }
				ueber = true;
			}
			kind.classList.add('zu-breit');
		});
		if (legendeMehr) { legendeMehr.classList.toggle('aus', !ueber); }
		if (!ueber && legendeKlappe) { legendeKlappe.schliessen(); }
	}

	// First paint measures before the three columns have their final width; a
	// single late look and a watcher on the row keep the "?" honest.
	var legendeWartet = false;
	function legendeNeuMessen() {
		if (legendeWartet) { return; }
		legendeWartet = true;
		window.requestAnimationFrame(function () { legendeWartet = false; pruefeLegendenbreite(); });
	}
	if (legende && legende.parentElement && window.ResizeObserver) {
		new ResizeObserver(legendeNeuMessen).observe(legende.parentElement);
	}

	/** Everything the legend explains, wrapped, as a panel. On the narrowest
	 * phones the bar drops the level text; it opens here instead of vanishing. */
	function fuellLegendeVoll() {
		if (!legendeVoll || !legende) { return; }
		legendeVoll.textContent = '';
		var stufe = document.getElementById('karte-stufe');
		if (stufe && stufe.offsetParent === null && stufe.textContent.trim()) {
			var zeile = document.createElement('span');
			zeile.className = 'legende-eintrag';
			zeile.textContent = stufe.textContent;
			legendeVoll.appendChild(zeile);
		}
		legende.querySelectorAll('.legende-eintrag, .legende-fortschritt').forEach(function (eintrag) {
			if (eintrag.hidden) { return; }
			var kopie = eintrag.cloneNode(true);
			kopie.removeAttribute('id');
			kopie.classList.remove('zu-breit');
			kopie.querySelectorAll('[id]').forEach(function (teil) { teil.removeAttribute('id'); });
			legendeVoll.appendChild(kopie);
		});
	}

	if (legendeMehr && legendeVoll) {
		legendeKlappe = window.MQL_KLAPPE.bind(legendeMehr, legendeVoll, {
			vorOeffnen: fuellLegendeVoll,
			// The panel sits in the bar next to the button, not inside a wrapper.
			rahmen: legendeMehr.parentElement
		});
	}

	/** Legend: what every shape on the map means. Always visible while the map has
	 * dots, because the shapes are not self-explanatory (07.11.2026). */
	function zeigeLegende(mitRingen, mitPunkten, mitJagd, mitHinweis) {
		if (!legende) { return; }
		document.getElementById('legende-ziele').hidden = !mitRingen;
		var jagd = document.getElementById('legende-jagd');
		if (jagd) { jagd.hidden = !mitJagd; }
		var hinweis = document.getElementById('legende-aufgabenort');
		if (hinweis) { hinweis.hidden = !mitHinweis; }
		var laufend = document.getElementById('legende-laufend');
		if (laufend) { laufend.hidden = !hatFortschritt; }
		var teils = document.getElementById('legende-teils');
		if (teils) { teils.hidden = !hatFortschritt; }
		legende.querySelectorAll('.legende-fortschritt').forEach(function (eintrag) {
			eintrag.hidden = !hatFortschritt;
		});
		legende.hidden = !mitPunkten && !mitRingen && !mitJagd && !mitHinweis;
		legendeNeuMessen();
	}

	// --- List ----------------------------------------------------------
	var zeilen = {};

	var zu = {};  // folded list sections of the shown area

	/** Right-hand pane for a region: its areas with level range and counts. */
	function zeigeRegion(knoten) {
		zustand.auswahl = null;
		detail.textContent = '';
		detail.appendChild(eltern('h2', knoten.name));
		var z = zaehle(zaehlEintraege(knoten));
		var kopf = eltern('div', ersetze(t('region_kopf'), [knoten.reihenfolge.length, zahl(z.erledigt, z.gesamt)]));
		kopf.className = 'kennung';
		detail.appendChild(kopf);
		var ul = eltern('ul', null);
		ul.className = 'gebietsliste';
		knoten.reihenfolge.forEach(function (kind) {
			var kz = zaehle(zaehlEintraege(kind));
			var li = eltern('li', null);
			li.appendChild(eltern('span', kind.name));
			var info = eltern('span', [stufenSpanne(zaehlEintraege(kind)), zahl(kz.erledigt, kz.gesamt)].filter(Boolean).join(' · '));
			info.className = 'stufe';
			li.appendChild(info);
			li.addEventListener('click', function () { waehleKnoten(kind, true); });
			ul.appendChild(li);
		});
		detail.appendChild(ul);
	}

	function zeigeListeIn(ziel, titel, eintraege, abschnittPrefix) {
		abschnittPrefix = abschnittPrefix || '';
		if (ziel === liste) {
			zustand.treffer = eintraege;
			listeTitel.textContent = titel;
		}
		ziel.textContent = '';
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
			if (ax === ay) {
				if (inhaltsAuswahl && x.z === 'story' && y.z === 'story') {
					// Numbered interludes ("4. Zwischenspiel …") follow that number.
					var nx = /^\s*(\d+)\./.exec(x.n), ny = /^\s*(\d+)\./.exec(y.n);
					if (nx && ny && nx[1] !== ny[1]) { return Number(nx[1]) - Number(ny[1]); }
					var muster = /(?:Kapitel|Chapter|Chapitre)\s+(\d+(?:\.\d+)*)/i;
					var kx = x.n.match(muster), ky = y.n.match(muster);
					function rang(q, k) { return /prolog|vorwort|foreword|avant-propos/i.test(q.n) ? -1 : k ? 0 : /epilog|nachwort|afterword|épilogue/i.test(q.n) ? 2 : 1; }
					var rx = rang(x, kx), ry = rang(y, ky);
					if (rx !== ry) { return rx - ry; }
					if (kx && ky) { return MQL_SORT.compare(kx[1], ky[1]); }
				}
				return 0;
			}
			if (reihe[ax] !== reihe[ay]) { return reihe[ax] - reihe[ay]; }
			return MQL_SORT.compare(ax, ay);
		});
		// Only the main list feeds the map; a nested book list must not replace
		// the markers of the whole topic.
		if (ziel === liste) { zustand.treffer = nachAbschnitt; }
		var mitAbschnitten = Object.keys(reihe).length > 1 && !zustand.suchliste;
		var jeAbschnitt = {};
		nachAbschnitt.forEach(function (quest) {
			jeAbschnitt[quest.a || ''] = (jeAbschnitt[quest.a || ''] || 0) + 1;
		});
		// Sections start folded; one that is alone stays open.
		var abschnittZahl = Object.keys(jeAbschnitt).length;
		Object.keys(jeAbschnitt).forEach(function (name) {
			if (zu[abschnittPrefix + name] === undefined) { zu[abschnittPrefix + name] = abschnittZahl > 1; }
		});
		// Places on this map (Bree, Archet … on Bree-land) lead to their own list.
		var hier = zustand.knoten;
		if (ziel === liste && hier && !zustand.suchliste && hier.reihenfolge && hier.reihenfolge.length && hier.eigene) {
			hier.reihenfolge.forEach(function (kind) {
				// An authored map without entries stays reachable by address, not
				// as a dead end in the list.
				if (kind.versteckt) { return; }
				var ort = eltern('li', null);
				ort.className = 'unterkarte';
				ort.appendChild(eltern('span', '▸ ' + kind.name));
				var kz = zaehle(zaehlEintraege(kind));
				var zahlOrt = eltern('span', zahl(kz.erledigt, kz.gesamt));
				zahlOrt.className = 'stufe';
				ort.appendChild(zahlOrt);
				ort.addEventListener('click', function () { waehleKnoten(kind, true); });
				ziel.appendChild(ort);
			});
		}
		// A prologue chain is the introduction to a book, not a part of its progress.
		// Saying so keeps the rows honest; the entries themselves stay reachable.
		if (zustand.knoten &&
			/prolog|vorwort|introduction|prologue/i.test(zustand.knoten.name || '')) {
			var hinweis = eltern('li', null);
			hinweis.className = 'listen-hinweis schwach';
			hinweis.textContent = t('prolog_hinweis');
			ziel.appendChild(hinweis);
		}
		var letzter = null;
		nachAbschnitt.slice(0, ziel === liste ? zustand.sichtbar : nachAbschnitt.length).forEach(function (quest) {
			var abschnitt = quest.a || '';
			if (mitAbschnitten && abschnitt !== letzter) {
				letzter = abschnitt;
				var kopf = eltern('li', null);
				kopf.className = 'abschnitt' + (zu[abschnittPrefix + abschnitt] ? ' zu' : '');
				kopf.appendChild(eltern('span', (zu[abschnittPrefix + abschnitt] ? '▸ ' : '▾ ') +
					(abschnitt === '' ? t('allgemein') : abschnitt)));
				var zahlKopf = eltern('span', String(jeAbschnitt[abschnitt]));
				zahlKopf.className = 'stufe';
				kopf.appendChild(zahlKopf);
				kopf.addEventListener('click', function () {
					zu[abschnittPrefix + abschnitt] = !zu[abschnittPrefix + abschnitt];
					zeigeListeIn(ziel, titel, eintraege, abschnittPrefix);
				});
				ziel.appendChild(kopf);
			}
			if (mitAbschnitten && zu[abschnittPrefix + abschnitt]) { return; }
			var zeile = eltern('li', null);
			var lage = zustandVon(quest);
			var erledigt = lage === 'fertig';
			zeile.classList.add(erledigt ? 'erledigt' : 'offen');
			if (lage === 'sitzung' || lage === 'ausgeschlossen' || lage === 'monster') {
				// Not counted: dim it and say why, but keep the row (the quest exists).
				zeile.classList.remove('offen');
				zeile.classList.add('nicht-gezaehlt');
			}
			if (zustand.auswahl && zustand.auswahl.i === quest.i) {
				zeile.classList.add('aktiv');
			}
			var standSymbol = { fertig: ['✓', 'filter_erledigt'], laufend: ['◐', 'filter_laufend'], offen: ['○', 'filter_offen'] }[listenStatus(lage, quest)];
			if (standSymbol) {
				var marke = eltern('span', standSymbol[0]);
				marke.className = 'listen-status status-' + lage;
				marke.setAttribute('aria-hidden', 'true');
				marke.title = t(standSymbol[1]);
				zeile.appendChild(marke);
				var standText = eltern('span', t(standSymbol[1]) + ': ');
				standText.className = 'visuell-versteckt';
				zeile.appendChild(standText);
			}
			var questName = eltern('span', quest.n);
			questName.className = 'qname';
			if (quest.g && doppelt[quest.n]) {
				var geber = eltern('span', quest.g);
				geber.className = 'geber';
				questName.appendChild(geber);
			}
			zeile.appendChild(questName);
			if (quest.z === 'story' && !quest.ie) {
				var instanzen = instanzenVon(quest.i);
				if (instanzen.length) {
					var teile = instanzen.map(function (eintrag) {
						var name = eintrag.n.replace(/^(?:Instanz|Instance)\s*:\s*/i, '');
						// Same title as the chapter: the word alone says it.
						return quest.n.toLowerCase().indexOf(name.toLowerCase()) >= 0 ? '' : name;
					}).filter(Boolean);
					var teil = eltern('span', t('mit_instanz') + (teile.length ? ': ' + teile.join(' · ') : ''));
					teil.className = 'vermerk instanz-teil';
					questName.appendChild(teil);
				}
			}
			if (lage === 'sitzung' || lage === 'ausgeschlossen' || lage === 'monster') {
				var vermerk = eltern('span', lage === 'sitzung' ? t('sitzungsspiel')
					: lage === 'monster' ? t('monsterspiel') : t('nicht_moeglich'));
				vermerk.className = 'vermerk';
				questName.appendChild(vermerk);
			}
			if (lage === 'laufend') {
				zeile.classList.add('laufend');
				var stand = eltern('span', laufText(quest));
				stand.className = 'laufstand';
				questName.appendChild(stand);
			}
			zeile.addEventListener('click', function () { waehle(quest); });
			zeile.addEventListener('mouseenter', function () {
				var punkt = markerVon[quest.i];
				if (punkt) { punkt.classList.add('hervor'); }
			});
			zeile.addEventListener('mouseleave', function () {
				var punkt = markerVon[quest.i];
				if (punkt) { punkt.classList.remove('hervor'); }
			});
			ziel.appendChild(zeile);
			zeilen[quest.i] = zeile;
		});

	}
	function zeigeListe(titel, eintraege) {
		zeigeListeIn(liste, titel, eintraege, '');
	}


	/**
	 * Can the active character take this now, as far as the data says? Open, not
	 * ruled out, level reached, every required quest completed (v), one of the
	 * alternatives completed (vo), and nothing we cannot check (vb: class, race,
	 * faction …). Without a level in the progress, the level is not checked.
	 */
	var charakterStufe = Number(aktiverCharakter && aktiverCharakter.level) || 0;
	var machbarFeld = document.getElementById('filter-machbar');
	var fortschrittFeld = document.getElementById('kartenfilter-status');
	function aufgabenstandImportiert() {
		return !loesung && standImportiert('quests');
	}
	function aktualisiereFilterOptionen() {
		var art = loesung ? 'deeds' : 'quests';
		var profil = aktiverCharakter;
		var sichtbar = (!profil && hatFortschritt) || standImportiert(art) ||
			(!loesung && Object.keys(profil?.laufend || {}).length > 0) ||
			Object.keys(profil?.manuell?.[art] || {}).length > 0;
		var kannFiltern = aufgabenstandImportiert();
		machbarFeld.hidden = !kannFiltern;
		machbarFeld.querySelector('input').disabled = !kannFiltern;
		fortschrittFeld.hidden = !sichtbar;
		fortschrittFeld.disabled = !sichtbar;
		filterKnopf.hidden = !sichtbar && !loesung;
		if (!sichtbar || (zustand.filter === 'machbar' && !kannFiltern)) { zustand.filter = 'alle'; }
	}
	// Deeds can be narrowed to their reward; quests do not offer this.
	var belohnungsFeld = document.getElementById('belohnungsfilter-feld');
	var belohnungsWahl = document.getElementById('belohnungsfilter');
	if (belohnungsFeld && belohnungsWahl && window.MQL_ART === 'taten') {
		belohnungsFeld.hidden = false;
		belohnungsWahl.value = zustand.belohnung;
		belohnungsWahl.addEventListener('change', function () {
			zustand.belohnung = belohnungsWahl.value;
			kartenfilterAnwenden();
		});
	}
	function machbar(quest) {
		if (listenStatus(zustandVon(quest), quest) !== 'offen' || quest.vb || quest.x === 1 || quest.mp === 1 ||
			(quest.e && quest.e.some(function (id) { return fertig[id] === true; }))) { return false; }
		if (charakterStufe && quest.vl && quest.vl > charakterStufe) { return false; }
		if (quest.v && !quest.v.every(function (id) { return fertig[id] === true; })) { return false; }
		if (quest.vo && !quest.vo.some(function (id) { return fertig[id] === true; })) { return false; }
		return true;
	}

	/** Deed list can be narrowed to what a deed actually grants. */
	function belohnungPasst(quest) {
		if (zustand.belohnung === 'alle') { return true; }
		if (zustand.belohnung === 'punkte') { return Number(quest.lp) > 0; }
		var arten = (quest.rw || []).map(function (eintrag) { return eintrag[0]; });
		return arten.indexOf(zustand.belohnung === 'tugend' ? 'v' : 't') >= 0;
	}

	/** Progress filter over a quest list. */
	function gefiltert(eintraege) {
		// An epic instance row belongs to its chapter; the chapter stands for it.
		eintraege = eintraege.filter(function (quest) {
			return !(quest.z === 'story' && quest.ie) && !sitzungsdublette(quest);
		});
		if (window.MQL_ART === 'taten' && zustand.belohnung !== 'alle') {
			eintraege = eintraege.filter(belohnungPasst);
		}
		if (zustand.filter === 'machbar') {
			eintraege = eintraege.filter(machbar);
		} else if (zustand.filter === 'offen') {
			eintraege = eintraege.filter(function (quest) {
				return listenStatus(zustandVon(quest), quest) === 'offen';
			});
		} else if (zustand.filter === 'laufend') {
			eintraege = eintraege.filter(function (quest) { return zustandVon(quest) === 'laufend'; });
		} else if (zustand.filter === 'erledigt') {
			eintraege = eintraege.filter(function (quest) { return fertig[quest.i] === true; });
		}
		var begriff = falten(zustand.q || '');
		if (begriff) {
			eintraege = eintraege.filter(function (quest) {
				return falten([quest.n, quest.g].filter(Boolean).join(' ')).indexOf(begriff) >= 0;
			});
		}
		return eintraege;
	}

	function aktualisiereFilterAnzeige() {
		var anzahl = Number(zustand.filter !== 'alle') + Number(zustand.belohnung !== 'alle');
		filterAnzahl.textContent = anzahl ? '· ' + anzahl : '';
		filterAnzahl.hidden = !anzahl;
		filterKnopf.classList.toggle('aktiv', anzahl > 0);
		filterZuruecksetzen.hidden = !anzahl;
		filterLeiste.querySelectorAll('input[name="kartenfortschritt"]').forEach(function (wahl) {
			wahl.checked = wahl.value === zustand.filter;
		});
		aktualisiereFilterZahlen();
	}

	/**
	 * Numbers beside the progress options, counted like the finder's facets: the
	 * search and the reward filter narrow the base, the progress filter itself
	 * does not, so a chosen state keeps its number after selecting it. Without
	 * imported progress only the total is a fact; the states stay unnumbered.
	 */
	/** Facet counts over a list: all entries, plus the states when progress is
	 * imported. The chosen progress filter itself does not narrow the base. */
	function zaehleListe(liste) {
		var werte = { alle: liste.length };
		if (hatFortschritt) {
			werte.offen = werte.laufend = werte.erledigt = werte.machbar = 0;
			liste.forEach(function (quest) {
				var lage = zustandVon(quest);
				if (listenStatus(lage, quest) === 'offen') { werte.offen += 1; }
				if (lage === 'laufend') { werte.laufend += 1; }
				if (fertig[quest.i] === true) { werte.erledigt += 1; }
				if (machbar(quest)) { werte.machbar += 1; }
			});
		}
		return werte;
	}

	function aktualisiereFilterZahlen() {
		var felder = filterLeiste.querySelectorAll('[data-filterzahl]');
		if (!felder.length) { return; }
		var anzeigen = function (werte) {
			felder.forEach(function (feld) {
				var wert = werte[feld.dataset.filterzahl];
				feld.textContent = wert == null ? '' : String(wert);
				feld.hidden = wert == null;
			});
		};
		if (!zustand.knoten) { anzeigen({}); return; }
		var sonder = sonderFuer(zustand.knoten);
		if (sonder && sonder.zahlen) { anzeigen(sonder.zahlen()); return; }
		var alt = zustand.filter;
		zustand.filter = 'alle';
		var liste = gefiltert(listeVon(zustand.knoten));
		zustand.filter = alt;
		anzeigen(zaehleListe(liste));
	}

	/** What a special view may use from the map app. */
	function sonderHost() {
		return {
			liste: liste,
			buehne: buehne,
			titel: function (text) { listeTitel.textContent = text; },
			filtere: function (rows, ohneFortschritt) {
				var alt = zustand.filter;
				if (ohneFortschritt) { zustand.filter = 'alle'; }
				var ergebnis = gefiltert(rows);
				zustand.filter = alt;
				return ergebnis;
			},
			zaehle: zaehleListe,
			fortschritt: function (rows) {
				var z = zaehle(rows);
				return { erledigt: z.erledigt, gesamt: z.gesamt };
			},
			status: function (quest) {
				var lage = zustandVon(quest);
				return { lage: lage, status: listenStatus(lage, quest),
					nichtGezahlt: !gezaehlt(quest) };
			},
			aktiv: function (id) {
				return !!(zustand.auswahl && zustand.auswahl.i === id);
			},
			merkeZeile: function (id, zeile) { zeilen[id] = zeile; },
			gewaehlt: function () { return zustand.auswahl; },
			waehle: function (quest) { waehle(quest); },
			setzeTreffer: function (rows) { zustand.treffer = rows; },
			zeichneMarker: zeichneMarker,
			merke: function (quest) { questNachId[quest.i] = quest; },
			suche: function () { return zustand.q || ''; },
			// Whether anything other than the full list is asked for. The epic view
			// narrows its tree with it, so a progress filter works like a search.
			filterAktiv: function () {
				if ((zustand.q || '').trim()) { return true; }
				if (zustand.filter !== 'alle') { return true; }
				return window.MQL_ART === 'taten' && zustand.belohnung !== 'alle';
			}
		};
	}

	function kartenfilterAnwenden() {
		zustand.sichtbar = ANSICHT_JE_SEITE;
		speichereKartenfilter();
		aktualisiereFilterAnzeige();
		zeichneListe();
		aktualisiereStand();
	}

	/** What a node's list shows: a map with places below it lists only what lies
	 * on this map itself; its places are their own nodes. */
	function listeVon(knoten) {
		if (knoten.reihenfolge && knoten.reihenfolge.length && knoten.eigene && !zustand.suchliste) { return knoten.eigene; }
		return knoten.quests;
	}

	function zeichneListe() {
		var titel, quelle;
		if (zustand.knoten) {
			quelle = listeVon(zustand.knoten);
			titel = zustand.knoten.name;
		} else {
			zeigeListe(t('aufgaben'), []);
			zeichneMarker();
			aktualisiereFilterZahlen();
			return;
		}
		var sonder = sonderFuer(zustand.knoten);
		if (sonder && !zustand.suchliste) {
			sonder.montiere(sonderHost());
			sonder.zeichneListe();
			listeTitel.classList.add('als-link');
			listeTitel.setAttribute('role', 'link');
			listeTitel.tabIndex = 0;
			zeichneKartenBreadcrumb();
			zeichneMarker();
			aktualisiereFilterZahlen();
			return;
		}
		listeTitel.classList.remove('als-link');
		listeTitel.removeAttribute('role');
		listeTitel.removeAttribute('tabindex');
		listeTitel.removeAttribute('title');
		var listeGefiltert = gefiltert(quelle);
		// Counts, level ranges and the active filter belong to the tool row and
		// the detail pane; the list header stays the plain location name.
		zeigeListe(titel, listeGefiltert);
		zeichneKartenBreadcrumb();
		zeichneMarker();
		aktualisiereFilterZahlen();
	}

	// --- Detail --------------------------------------------------------
	// --- Entity icons, item pictures and reverse links -------------------
	// One Lucide icon per entity, inline: the build copies no new asset file,
	// and an inline icon also shows when the page is opened from disk.
	var SYMBOL = {
		aufgabe: '<path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/>' +
			'<path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/>',
		tat: '<path d="M10 14.66V17a1 1 0 0 1-1 1 2 2 0 0 0-2 2v2"/>' +
			'<path d="M14 14.66V17a1 1 0 0 0 1 1 2 2 0 0 1 2 2v2"/>' +
			'<path d="M17.916 10H19.5A2.5 2.5 0 0 0 22 7.5V5a1 1 0 0 0-1-1h-3"/><path d="M4 22h16"/>' +
			'<path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/>' +
			'<path d="M6.084 10H4.5A2.5 2.5 0 0 1 2 7.5V5a1 1 0 0 1 1-1h3"/>'
	};
	var GEGENSTAND_SEGMENT = { de: 'gegenstand', en: 'item', fr: 'objet' };

	function symbol(art, klasse) {
		var rahmen = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		rahmen.setAttribute('viewBox', '0 0 24 24');
		rahmen.setAttribute('fill', 'none');
		rahmen.setAttribute('stroke', 'currentColor');
		rahmen.setAttribute('stroke-width', '2');
		rahmen.setAttribute('stroke-linecap', 'round');
		rahmen.setAttribute('stroke-linejoin', 'round');
		rahmen.setAttribute('aria-hidden', 'true');
		rahmen.setAttribute('class', klasse || 'entitaet-symbol');
		rahmen.innerHTML = SYMBOL[art] || SYMBOL.aufgabe;
		return rahmen;
	}

	/** Item picture from the DAT export; a missing file leaves no empty frame. */
	// referenz.js carries item id -> symbol id. It is 1,3 MB, so the map page
	// loads it only when a reward with a picture is shown for the first time.
	var referenzLaeuft = false;
	function ladeReferenz(dann) {
		if (window.MQL_REFERENZ || referenzLaeuft) { return; }
		referenzLaeuft = true;
		var skript = document.createElement('script');
		skript.src = 'referenz.js?v=' + (window.MQL_STAND || '0');
		skript.onload = function () { referenzLaeuft = false; dann(); };
		skript.onerror = function () { referenzLaeuft = false; };
		document.head.appendChild(skript);
	}

	function symbolBild(kennung) {
		var bild = eltern('img', null);
		bild.className = 'gegenstand-symbol';
		bild.alt = '';
		bild.loading = 'eager';
		// Files are named after the symbol id; referenz.js carries the mapping.
		var symbole = (window.MQL_REFERENZ || {}).symbole || {};
		// Item IDs are not symbol IDs. The detail redraw fills this after loading.
		if (!symbole[kennung]) { bild.hidden = true; return bild; }
		bild.src = 'bild/items/' + symbole[kennung] + '.webp?v=' + (window.MQL_STAND || '0');
		bild.addEventListener('error', function () {
			if (bild.parentNode) { bild.parentNode.removeChild(bild); }
		});
		return bild;
	}

	function gegenstandLink(kennung, inhalt, klasse) {
		var a = eltern('a', inhalt);
		a.className = klasse || '';
		// Root-relative like the catalogue: /de/gegenstand/<id>/ (the language
		// segment was missing, so the link went nowhere).
		a.href = '/' + sprache + '/' + (GEGENSTAND_SEGMENT[sprache] || 'gegenstand') +
			'/' + kennung + '/';
		return a;
	}

	// Which quests name this one as a requirement. Built once from the loaded
	// catalogue, so no extra file and no extra request.
	var voraussetzer = null;
	function baueVoraussetzer() {
		if (voraussetzer) { return voraussetzer; }
		voraussetzer = {};
		quests.forEach(function (andere) {
			(andere.v || []).forEach(function (id) {
				if (!voraussetzer[id]) { voraussetzer[id] = []; }
				voraussetzer[id].push(andere);
			});
		});
		return voraussetzer;
	}

	function zeichneDetail() {
		detail.textContent = '';
		var quest = zustand.auswahl;
		if (!quest) {
			if (zustand.knoten && zustand.knoten !== WURZEL) {
				var k = zustand.knoten;
				detail.appendChild(eltern('h2', k.name));
				var spanneText = stufenSpanne(zaehlEintraege(k));
				if (spanneText) {
					var unter = eltern('div', spanneText);
					unter.className = 'kennung';
					detail.appendChild(unter);
				}
				var z = zaehle(zaehlEintraege(k));
				var werte = [[t('detail_gesamt'), z.gesamt]];
				if (hatFortschritt) {
					var nOffen = 0, nLauf = 0, nAnn = 0;
					k.quests.forEach(function (q) {
						if (!gezaehlt(q)) { return; }
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

		var lage = zustandVon(quest);

		/** One framed section; the body is where the content goes. */
		function abschnitt(klasse, titelText) {
			var box = eltern('section', null);
			box.className = 'detail-abschnitt llb-flaeche' + (klasse ? ' ' + klasse : '');
			if (titelText) {
				var kopf = eltern('h3', titelText);
				box.appendChild(kopf);
			}
			detail.appendChild(box);
			return box;
		}

		function gebietssprung(name, karte, klasse) {
			var knoten = karte != null ? knotenMitKarte(WURZEL, karte) : null;
			if (!knoten) { return document.createTextNode(name); }
			var a = eltern('a', name);
			a.href = '#';
			a.className = klasse || 'gebietsprung';
			a.addEventListener('click', function (ereignis) {
				ereignis.preventDefault();
				waehleKnoten(knoten, true, true);
			});
			return a;
		}

		// --- Head: type, title, icon ------------------------------------
		var kopf = eltern('header', null);
		kopf.className = 'detail-kopf';
		var art = eltern('p', t(loesung ? 'ru_tat' : 'ru_aufgabe'));
		art.className = 'detail-art';
		kopf.appendChild(art);
		var titel = eltern('div', null);
		titel.className = 'detail-titel';
		var bild = eltern('span', null);
		bild.className = 'detail-symbol';
		bild.setAttribute('aria-hidden', 'true');
		bild.appendChild(symbol(loesung ? 'tat' : 'aufgabe'));
		titel.appendChild(bild);
		titel.appendChild(eltern('h2', quest.n));
		kopf.appendChild(titel);
		detail.appendChild(kopf);

		// --- Facts: labels, not a run-on line ---------------------------
		var fakten = eltern('dl', null);
		fakten.className = 'llb-fakten';
		fakten.dataset.dichte = 'kompakt';
		function faktum(label, inhalt) {
			fakten.appendChild(eltern('dt', label));
			var wert = eltern('dd', null);
			if (inhalt == null || inhalt === '') { return; }
			if (typeof inhalt === 'string' || typeof inhalt === 'number') {
				wert.textContent = String(inhalt);
			} else {
				wert.appendChild(inhalt);
			}
			fakten.appendChild(wert);
		}
		if (quest.l) {
			faktum(t('stufe'), stufeText(quest) + (quest.ls ? ' · ' + t('mitwachsend') : ''));
		}
		if (quest.g) {
			if (quest.gi) {
				var geberLink = eltern('a', quest.g);
				geberLink.href = '/' + sprache + '/' +
					({ de: 'auftraggeber', en: 'quest-giver', fr: 'donneur-de-quete' }[sprache] || 'auftraggeber') +
					'/' + quest.gi + '/';
				geberLink.className = 'detail-geber';
				faktum(t('detail_auftraggeber'), geberLink);
			} else {
				faktum(t('detail_auftraggeber'), quest.g);
			}
		}
		var gebiet = quest.z ? (ABSCHNITTE[quest.z] || quest.z) : (quest.f && quest.f.length ? quest.f[quest.f.length - 1] : '');
		if (gebiet) {
			faktum(t('detail_gebiet'), gebietssprung(gebiet, quest.fk ? quest.fk[quest.fk.length - 1] : null));
		}
		if (quest.r && quest.r !== quest.z) {
			faktum(t('detail_region'), gebietssprung(quest.r, quest.fk ? quest.fk[0] : null));
		}
		if (quest.a) { faktum(t('bl_art'), quest.a); }
		if (quest.lp) { faktum(t('belohnung_punkte'), String(quest.lp)); }
		var zielAnzahl = 0;
		(quest.s || []).forEach(function (schritt) { zielAnzahl += (schritt[2] || []).length; });
		if (zielAnzahl) { faktum(t('ziele'), String(zielAnzahl)); }
		detail.appendChild(fakten);

		var marken = [];
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

		// --- Progress: the only place that names the state ---------------
		var fortschrittZeile = eltern('div', null);
		fortschrittZeile.className = 'detail-fortschritt';
		fortschrittZeile.appendChild(eltern('span', t('detail_fortschritt')));
		// A prologue chain has no status: it never counts towards a book's progress.
		var status = !quest.pr && window.MQL_STATUS_UI && window.MQL_STATUS_UI.create(
			loesung ? 'deeds' : 'quests', quest.i, null, 'panel');
		if (status) {
			status.addEventListener('click', function (event) { event.stopPropagation(); });
			fortschrittZeile.appendChild(status);
		}
		var lageHinweis = quest.pr ? t('prolog_hinweis')
			: lage === 'sitzung' ? t('sitzungsspiel')
			: lage === 'monster' ? t('monster_hinweis')
			: lage === 'ausgeschlossen' ? t('nicht_moeglich') : '';
		if (lageHinweis) {
			var lageText = eltern('span', lageHinweis);
			lageText.className = 'llb-hinweis';
			lageText.dataset.groesse = 'klein';
			fortschrittZeile.appendChild(lageText);
		}
		detail.appendChild(fortschrittZeile);

		// --- Description -------------------------------------------------
		if (quest.d) {
			var beschreibung = abschnitt('detail-beschreibung', t('detail_beschreibung'));
			var text = eltern('p', quest.d);
			text.className = 'text';
			beschreibung.appendChild(text);
		}

		// --- What to do: steps and objectives ----------------------------
		if ((quest.s || []).length || (quest.v || quest.vo || quest.vl || quest.vb)) {
			// requirements get their own section below
		}
		if ((quest.s || []).length) {
			var zielBox = abschnitt('detail-ziele');
			var zielKopf = eltern('button', null);
			zielKopf.type = 'button';
			zielKopf.className = 'ziele-kopf';
			zielKopf.setAttribute('aria-expanded', String(zieleOffen));
			zielKopf.setAttribute('aria-controls', 'detail-ziele-inhalt');
			zielKopf.setAttribute('aria-label', t('detail_was_tun') + (zielAnzahl ? ' (' + zielAnzahl + ')' : ''));
			zielKopf.appendChild(eltern('span', t('detail_was_tun')));
			if (zielAnzahl) {
				var zielZahl = eltern('span', '(' + zielAnzahl + ')');
				zielZahl.className = 'ziele-anzahl';
				zielKopf.appendChild(zielZahl);
			}
			zielKopf.addEventListener('click', function () { setzeZiele(!zieleOffen); });
			zielBox.appendChild(zielKopf);
			var zielInhalt = eltern('div', null);
			zielInhalt.id = 'detail-ziele-inhalt';
			zielInhalt.className = 'ziele-inhalt';
			zielInhalt.hidden = !zieleOffen;
			zielBox.appendChild(zielInhalt);
				(quest.s || []).forEach(function (schritt) {
					var block = eltern('div', null);
					block.className = 'detail-schritt';
					schritt[1].forEach(function (absatz) {
						var p = eltern('p', absatz);
						p.className = 'text';
						block.appendChild(p);
					});
					if (schritt[2].length) {
						var ul = eltern('ol', null);
						ul.className = 'detail-ziele-liste';
						var stand = lage === 'laufend' ? lauf(quest) : null;
						schritt[2].forEach(function (ziel) {
							var li = eltern('li', ziel[0]);
							var z = stand && ziel[2] >= 0 ? stand.zaehler(schritt[0], ziel[2]) : null;
							if (z && z[2]) {
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
						// The coordinates belong to the step; they are not a link per goal.
						var punkte = [], gesehen = {};
						quest.t.forEach(function (ort) {
							if (String(ort[3]) !== String(schritt[0])) { return; }
							var karte = karteNachIndex[ort[0]];
							var zeile = (karte ? karte.name + ' · ' : '') + koordinatenText(ort[1], ort[2]);
							if (!gesehen[zeile]) { gesehen[zeile] = true; punkte.push(zeile); }
						});
						if (punkte.length) {
							var ortsliste = eltern('div', null);
							ortsliste.className = 'zielorte';
							punkte.forEach(function (zeile) { ortsliste.appendChild(eltern('p', zeile)); });
							block.appendChild(ortsliste);
						}
					}
					[['h', 'jagdorte', 'jagd_hinweis'], ['hz', 'aufgabenorte', 'aufgabenorte_hinweis']].forEach(function (art2) {
						var jagd = (quest[art2[0]] || []).filter(function (ort) { return String(ort[3]) === String(schritt[0]); });
						if (!jagd.length) { return; }
						var hinweis = eltern('div', null);
						hinweis.className = 'zielorte jagdhinweis';
						hinweis.appendChild(eltern('h4', t(art2[1])));
						hinweis.appendChild(eltern('p', t(art2[2])));
						var karten = {};
						jagd.forEach(function (ort) { karten[ort[0]] = (karten[ort[0]] || 0) + 1; });
						Object.keys(karten).forEach(function (id) {
							var knopf = eltern('button', (karteNachIndex[id] ? karteNachIndex[id].name : '') + ' · ' + karten[id]);
							knopf.type = 'button';
							knopf.addEventListener('click', function () {
								var knoten = zustand.knoten;
								zeigeKarte(Number(id));
								zustand.knoten = knoten;
								zustand.auswahl = quest;
								zeichneMarker(); zeichneDetail();
							});
							hinweis.appendChild(knopf);
						});
						block.appendChild(hinweis);
					});
					zielInhalt.appendChild(block);
				});
		}

		// --- Rewards -----------------------------------------------------
		if (!window.MQL_REFERENZ && (quest.rw || []).some(function (r) { return r[6]; })) {
			ladeReferenz(function () { zeichneDetail(); });
		}
		if ((quest.rw || []).length) {
			var belohnung = abschnitt('detail-belohnungen', t('belohnungen'));
			// Same lighter ground as the rewards section on catalogue pages.
			belohnung.dataset.ton = 'hell';
			var liste = null, auswahl = [];
			quest.rw.forEach(function (eintrag) {
				var art3 = eintrag[0], name = eintrag[1], kennung = eintrag[6];
				var beschriftung = (eintrag[4] > 1 ? eintrag[4] + ' × ' : '') + name;
				if (art3 === 'i' || art3 === 'c') {
					if (!liste) { liste = eltern('ul', null); liste.className = 'detail-reward-liste'; belohnung.appendChild(liste); }
					var zeile = eltern('li', null);
					zeile.className = 'q' + (eintrag[2] || 0);
					if (kennung) {
						var bild = eltern('span', null);
						bild.className = 'detail-reward-symbol';
						bild.appendChild(symbolBild(kennung));
						zeile.appendChild(bild);
					}
					var stueck = eltern('span', null);
					stueck.className = 'detail-reward-text';
					stueck.appendChild(kennung ? gegenstandLink(kennung, beschriftung) : document.createTextNode(beschriftung));
					if (eintrag[3]) {
						var stufe = eltern('span', '· ' + t('stufe') + ' ' + eintrag[3]);
						stufe.className = 'stufe';
						stueck.appendChild(stufe);
					}
					zeile.appendChild(stueck);
					if (art3 === 'c') { auswahl.push(eintrag); zeile.remove(); return; }
					liste.appendChild(zeile);
					return;
				}
				if (!liste) { liste = eltern('ul', null); liste.className = 'detail-reward-liste'; belohnung.appendChild(liste); }
				var merkmal = eltern('li', t({ t: 'belohnung_titel', v: 'belohnung_tugend',
					tr: 'belohnung_fertigkeit', e: 'belohnung_emote' }[art3] || 'belohnung_unbekannt') + ': ' + name);
				merkmal.className = 'merkmal';
				liste.appendChild(merkmal);
			});
			if (auswahl.length) {
				var wahl = eltern('div', null);
				wahl.className = 'auswahl';
				wahl.appendChild(eltern('strong', t('auswahl') + ': '));
				var wahlListe = eltern('ul', null);
				// Choice rewards use the same row as fixed rewards: tile, name,
				// level. The quality sits on the row, so the link inherits it.
				wahlListe.className = 'detail-reward-liste';
				auswahl.forEach(function (eintrag) {
					var wahlZeile = eltern('li', null);
					wahlZeile.className = 'q' + (eintrag[2] || 0);
					var kennung = eintrag[6];
					var beschriftung = (eintrag[4] > 1 ? eintrag[4] + ' × ' : '') + eintrag[1];
					if (kennung) {
						var wahlBild = eltern('span', null);
						wahlBild.className = 'detail-reward-symbol';
						wahlBild.appendChild(symbolBild(kennung));
						wahlZeile.appendChild(wahlBild);
					}
					var stueck = eltern('span', null);
					stueck.className = 'detail-reward-text';
					stueck.appendChild(kennung ? gegenstandLink(kennung, beschriftung) : document.createTextNode(beschriftung));
					if (eintrag[3]) {
						var wahlStufe = eltern('span', '· ' + t('stufe') + ' ' + eintrag[3]);
						wahlStufe.className = 'stufe';
						stueck.appendChild(wahlStufe);
					}
					wahlZeile.appendChild(stueck);
					wahlListe.appendChild(wahlZeile);
				});
				wahl.appendChild(wahlListe);
				belohnung.appendChild(wahl);
			}
		}

		// --- Prerequisites ----------------------------------------------
		if (quest.v || quest.vo || quest.vl || quest.vb) {
			var bedingungen = abschnitt('detail-voraussetzungen', t('voraussetzungen'));
			var ul2 = eltern('ul', null);
			ul2.className = 'detail-bedingungen';
			function punkt(text, ok) {
				var li = eltern('li', null);
				var zeichen = eltern('span', ok === null ? '·' : (ok ? '✓' : '○'));
				zeichen.className = 'zeichen' + (ok ? ' ok' : '');
				li.appendChild(zeichen);
				li.appendChild(document.createTextNode(' ' + text));
				ul2.appendChild(li);
				return li;
			}
			function aufgabe(id, vorsilbe) {
				var andere = questNachId[id];
				if (!andere) { return; }
				var li = punkt((vorsilbe || '') + andere.n, hatFortschritt ? fertig[id] === true : null);
				li.classList.add('sprung');
				li.addEventListener('click', function () { waehle(andere); });
				mitVorschau(li, andere);
			}
			if (quest.vl) { punkt(t('stufe') + ' ' + quest.vl, charakterStufe ? charakterStufe >= quest.vl : null); }
			(quest.v || []).forEach(function (id) { aufgabe(id); });
			(quest.vo || []).forEach(function (id) { aufgabe(id, t('eine_davon') + ' '); });
			if (ul2.children.length) { bedingungen.appendChild(ul2); }
		}

		// --- Chain -------------------------------------------------------
		var davor = [], davorGesehen = {};
		(quest.pq || []).forEach(function (id) {
			var andere = questNachId[id];
			if (andere && !davorGesehen[andere.i]) { davorGesehen[andere.i] = true; davor.push(andere); }
		});
		var danach = quest.nq ? questNachId[quest.nq] : null;
		if (davor.length || danach) {
			var kette = abschnitt('detail-kette', t('kette'));
			var kl = eltern('ul', null);
			kl.className = 'detail-kette-liste';
			function glied(andere, pfeil) {
				var li = eltern('li', null);
				var zeichen = eltern('span', pfeil);
				zeichen.className = 'zeichen' + (fertig[andere.i] ? ' ok' : '');
				li.appendChild(zeichen);
				li.appendChild(document.createTextNode(' ' + andere.n + (fertig[andere.i] ? ' ✓' : '')));
				li.classList.add('sprung');
				li.addEventListener('click', function () { waehle(andere); });
				kl.appendChild(li);
				return li;
			}
			davor.forEach(function (andere, nummer) {
				var li = glied(andere, nummer === 0 ? '←' : '↰');
				mitVorschau(li, andere);
			});
			if (danach) { var liDanach = glied(danach, '→'); mitVorschau(liDanach, danach); }
			kette.appendChild(kl);
		}

		// --- What requires this entry ------------------------------------
		var braucht = loesung ? [] : (baueVoraussetzer()[quest.i] || []);
		if (braucht.length) {
			var folge = abschnitt('detail-folge', t('noetig_fuer'));
			var fl = eltern('ul', null);
			fl.className = 'detail-bedingungen';
			braucht.slice(0, 8).forEach(function (andere) {
				var li = eltern('li', null);
				var zeichen = eltern('span', '→');
				zeichen.className = 'zeichen';
				li.appendChild(zeichen);
				li.appendChild(document.createTextNode(' ' + andere.n));
				li.classList.add('sprung');
				li.addEventListener('click', function () { waehle(andere); });
				fl.appendChild(li);
			});
			if (braucht.length > 8) { fl.appendChild(eltern('li', '… ' + (braucht.length - 8))); }
			folge.appendChild(fl);
		}

		// --- Where the recorded objectives lie ---------------------------
		if (quest.t && quest.t.length) {
			var kartenZeile = eltern('div', null);
			kartenZeile.className = 'llb-aktionen detail-kartenaktion';
			kartenZeile.dataset.dichte = 'kompakt';
			var kartenKnopf = eltern('button', t('detail_ziele_karte'));
			kartenKnopf.type = 'button';
			kartenKnopf.className = 'llb-knopf';
			kartenKnopf.dataset.groesse = 'klein';
			kartenKnopf.addEventListener('click', function () {
				var knoten = zustand.knoten;
				zeigeKarte(Number(quest.t[0][0]));
				zustand.knoten = knoten;
				zustand.auswahl = quest;
				zeichneMarker(); zeichneDetail();
				if (window.MQL_MOBIL) { window.MQL_MOBIL.zeige('karte'); }
			});
			kartenZeile.appendChild(kartenKnopf);
			if (typeof zielBox !== 'undefined' && zielBox) { zielBox.appendChild(kartenZeile); }
			else { detail.appendChild(kartenZeile); }
		}

		if (lage === 'monster') {
			hinweis.textContent = t('monster_hinweis');
			hinweis.hidden = false;
		} else if (lage === 'sitzung') {
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

		if (!orte(quest).length && !(quest.h && quest.h.length) && !(quest.hz && quest.hz.length)) {
			var hinweisOhne = eltern('p', t(zeigtZiele(quest) || loesung ? 'kein_ziel' : 'kein_geberort'));
			hinweisOhne.className = 'leer';
			detail.appendChild(hinweisOhne);
		}

		// --- Actions: the last surface of the panel ---------------------
		var aktionenBox = abschnitt('detail-aktionen');
		var aktionen = eltern('div', null);
		aktionen.className = 'llb-aktionen';
		var segment = {'q': {'de': 'aufgabe', 'en': 'quest', 'fr': 'quete'},
			'd': {'de': 'tat', 'en': 'deed', 'fr': 'prouesse'}}[loesung ? 'd' : 'q'][sprache];
		var gross = eltern('a', t('ganze_seite') + ' →');
		gross.className = 'llb-knopf';
		gross.dataset.groesse = 'klein';
		gross.href = '/' + sprache + '/' + segment + '/' + quest.i + '/';
		aktionen.appendChild(gross);
		var punkt = quest.gt || (quest.t && quest.t[0]);
		if (punkt) {
			var reise = eltern('a', t('hin_reise'));
			reise.href = 'reise.html?lang=' + sprache + '&nach=' +
				encodeURIComponent(koordinatenText(punkt[1], punkt[2]));
			aktionen.appendChild(reise);
		}
		aktionenBox.appendChild(aktionen);

		// The compact map payload has no description; the detail shard does.
		// Without a shard for this entry there is nothing to reload.
		if (!hatDetails(quest) && detailDatei(quest)) {
			ladeDetails(quest, function () {
				if (zustand.auswahl && zustand.auswahl.i === quest.i) { zeichneDetail(); }
			});
		}
	}

	// --- Preview flyout --------------------------------------------------
	// A small map cut and the first line of the description for a linked quest,
	// so a chain can be read without leaving the current entry.
	var vorschau = null, vorschauZeit = null;

	function schliesseVorschau(spaeter) {
		if (vorschauZeit) { clearTimeout(vorschauZeit); vorschauZeit = null; }
		if (spaeter) {
			vorschauZeit = setTimeout(function () { schliesseVorschau(); }, 180);
			return;
		}
		if (vorschau && vorschau.parentNode) { vorschau.parentNode.removeChild(vorschau); }
		vorschau = null;
	}

	function zeigeVorschau(quest, anker) {
		schliesseVorschau();
		if (!quest) { return; }
		var feld = eltern('div', null);
		feld.className = 'vorschau';
		feld.appendChild(eltern('strong', quest.n));
		var zeile = [];
		if (quest.l) { zeile.push(t('stufe') + ' ' + stufeText(quest)); }
		if (quest.f && quest.f.length) { zeile.push(quest.f[quest.f.length - 1]); }
		if (zeile.length) {
			var klein = eltern('div', zeile.join(' · '));
			klein.className = 'vorschau-zeile';
			feld.appendChild(klein);
		}
		var punkt = quest.gt || (quest.t && quest.t[0]);
		var karte = punkt ? karteNachIndex[punkt[0]] : null;
		if (karte && karte.bild) {
			var rahmen = eltern('div', null);
			rahmen.className = 'vorschau-karte';
			var bild = eltern('img', null);
			bild.alt = '';
			bild.loading = 'lazy';
			bild.src = webpOrdner + karte.bild.replace(/\.png$/i, '.webp');
			rahmen.appendChild(bild);
			var stelle = anteil(karte, punkt[1], punkt[2]);
			if (stelle) {
				var pin = eltern('i', null);
				pin.className = 'vorschau-pin';
				pin.style.left = (stelle.x * 100) + '%';
				pin.style.top = (stelle.y * 100) + '%';
				rahmen.appendChild(pin);
			}
			feld.appendChild(rahmen);
		}
		if (quest.d) {
			var text = quest.d.replace(/\s+/g, ' ').trim();
			feld.appendChild(eltern('p', text.length > 150 ? text.slice(0, 147) + '…' : text));
		}
		document.body.appendChild(feld);
		var masse = feld.getBoundingClientRect();
		var platz = anker.getBoundingClientRect();
		var links = Math.min(window.innerWidth - masse.width - 10, Math.max(10, platz.left - masse.width - 12));
		var oben = Math.min(window.innerHeight - masse.height - 10, Math.max(10, platz.top));
		feld.style.left = links + 'px';
		feld.style.top = oben + 'px';
		feld.addEventListener('mouseenter', function () { schliesseVorschau(); });
		feld.addEventListener('mouseleave', function () { schliesseVorschau(true); });
		vorschau = feld;
	}

	/** Attach the preview to a linked entry (chain, requirements). */
	function mitVorschau(li, andere) {
		li.addEventListener('mouseenter', function () { zeigeVorschau(andere, li); });
		li.addEventListener('mouseleave', function () { schliesseVorschau(true); });
		li.addEventListener('focus', function () { zeigeVorschau(andere, li); });
		li.addEventListener('blur', function () { schliesseVorschau(); });
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
		// A view with a folded tree opens the path to the chosen quest, so a
		// dot on the map and its row stay in step.
		var sonder = sonderFuer(zustand.knoten);
		if (sonder && typeof sonder.zeige === 'function') { sonder.zeige(quest); }
		zeichneMarker();
		zeichneDetail();
		aktualisiereStand();
		markiereZeile(quest.i);
		if (window.MQL_MOBIL) { window.MQL_MOBIL.zeige('details'); }
		if (!hatDetails(quest)) {
			ladeDetails(quest, function () {
				zeichneDetail();
				zeichneListe();
				zeichneMarker();
			});
		}
	}

	window.addEventListener('mql-status', function () {
		aktualisiereEffektivenStatus();
		aktualisiereFilterOptionen();
		aktualisiereFilterAnzeige();
		if (filterKnopf.hidden && filterLeiste.open) { filterLeiste.close(); }
		zeichneListe();
		zeichneMarker();
		zeichneDetail();
		aktualisiereStand();
	});

	function markiereZeile(id) {
		Object.keys(zeilen).forEach(function (index) {
			zeilen[index].classList.toggle('aktiv', index === id);
		});
		// A dot on the map often selects a row far down the list; without this the
		// list looks as if nothing happened (07.11.2026).
		if (id != null && zeilen[id]) {
			try { zeilen[id].scrollIntoView({ block: 'nearest' }); } catch (fehler) {}
		}
	}



	// --- View ----------------------------------------------------------
	// The images are 1024x768, so 4:3. If the image is stretched to the
	// window width, the map distorts and the dots look shifted.
	// Hence: image always in its own aspect ratio, centred, with a margin.
	var BILD_SEITE = 4 / 3;

	function passeAn() {
		var rahmen = buehne.getBoundingClientRect();
		var breite = rahmen.width;
		var hoehe = rahmen.height;
		if (!breite || !hoehe) { return; }
		var ansicht = ansichtsKarte(zustand.karte);
		var seite = gelaende && gelaende.active() && ansicht ? (ansicht.east-ansicht.west)/(ansicht.north-ansicht.south) : BILD_SEITE;
		var bildBreite = Math.min(breite, hoehe * seite);
		var bildHoehe = bildBreite / seite;
		welt.style.width = bildBreite + 'px';
		welt.style.height = bildHoehe + 'px';
		welt.style.left = ((breite - bildBreite) / 2) + 'px';
		welt.style.top = ((hoehe - bildHoehe) / 2) + 'px';
		if (gelaende) { gelaende.layout(); }
	}

	// The map controller owns zoom and pan in both map views.
	function setzeAnsicht() {
		if (gelaende) { gelaende.layout(); return; }
		zustand.skala = 1; zustand.x = 0; zustand.y = 0;
		welt.style.transform = 'none';
	}

	window.addEventListener('resize', function () {
		planeKartenLayout();
	});
	// Navigation and legends can change the available height without a window
	// resize. Keep the image and all marker layers inside the actual map stage.
	var kartenLayoutWartet = false;
	function planeKartenLayout() {
		if (kartenLayoutWartet) { return; }
		kartenLayoutWartet = true;
		window.requestAnimationFrame(function () {
			kartenLayoutWartet = false;
			passeAn();
			setzeAnsicht(zustand.skala, zustand.x, zustand.y);
			zeichneMarker();
			legendeNeuMessen();
		});
	}
	if (window.ResizeObserver) {
		var kartenGroesse = new ResizeObserver(planeKartenLayout);
		kartenGroesse.observe(buehne);
	}

	// --- Input ---------------------------------------------------------
	// --- Search over everything (header) ------------------------------
	// The header searches areas, this page's entries and the complete catalogue.
	// Enter opens the full result list.
	var suchergebnis = document.getElementById('suchergebnis');
	var suchlauf = null;
	var alleKnoten = [];
	(function sammle(knoten) {
		knoten.reihenfolge.forEach(function (kind) { alleKnoten.push(kind); sammle(kind); });
	})(WURZEL);
	var gebietSuchindex = null, eintragsSuchindex = null;
	function baueLokalenSuchindex() {
		if (gebietSuchindex) { return; }
		gebietSuchindex = alleKnoten.map(function (k) { return {knoten:k,text:falten(k.name)}; });
		eintragsSuchindex = quests.map(function (q) { return {quest:q,text:falten(q.n)}; });
	}

	// The complete index is loaded on first search; its folded text is prepared once.
	var vollSuche = null, vollLaden = null, vollFehler = false;
	var SEGMENT = {
		gegenstand: { de: 'gegenstand', en: 'item', fr: 'objet' },
		titel: { de: 'titel', en: 'title', fr: 'titre' },
		tugend: { de: 'tugend', en: 'virtue', fr: 'vertu' }
	};
	var ART_LABEL = { q: 'su_aufgaben', d: 'su_taten', g: 'su_gegenstaende',
		r: 'su_rezepte', t: 'su_titel_tab', v: 'menue_tugenden',
		s: 'menue_sets', n: 'menue_auftraggeber', l: 'menue_landmarken', f: 'menue_fraktionen' };
	var SUCHARTEN = ['q','d','g','r','t','v','s','n','l','f'];
	var ART_SYMBOL = { q: 'aufgabe', d: 'tat', g: 'gegenstand',
		r: 'rezept', t: 'titel', v: 'tugend', s: 'gegenstand',
		n: 'auftraggeber', l: 'landmarke', f: 'fraktion', gebiet: 'gebiet' };

	function ladeVollSuche(dann) {
		if (vollSuche || vollFehler) { dann(); return; }
		if (vollLaden) { vollLaden.push(dann); return; }
		vollLaden = [dann];
		var skript = document.createElement('script');
		skript.src = 'suche-' + sprache + '.js?v=' + (window.MQL_STAND || '0');
		skript.onload = function () {
			vollSuche = (window.MQL_SUCHE || []).map(function (row) {
				return row.concat([falten(row[2] + ' ' + (row[3] || ''))]);
			});
			var wartend = vollLaden; vollLaden = null;
			wartend.forEach(function (f) { f(); });
		};
		skript.onerror = function () { vollFehler = true; vollLaden = null; };
		document.body.appendChild(skript);
	}

	function suchtreffer(begriff) {
		baueLokalenSuchindex();
		var gebiete = gebietSuchindex.filter(function (eintrag) { return eintrag.text.indexOf(begriff) >= 0; })
			.map(function (eintrag) { return eintrag.knoten; });
		var eintraege = eintragsSuchindex.filter(function (eintrag) { return eintrag.text.indexOf(begriff) >= 0; })
			.map(function (eintrag) { return eintrag.quest; });
		eintraege.sort(function (a, b) { return MQL_SORT.compare(a.n, b.n); });
		return { gebiete: gebiete, eintraege: eintraege };
	}

	function volleTreffer(begriff) {
		var gruppen = {};
		SUCHARTEN.forEach(function (art) { gruppen[art] = []; });
		if (!vollSuche) { return gruppen; }
		vollSuche.forEach(function (row) {
			if (row[5].indexOf(begriff) >= 0 && gruppen[row[0]]) { gruppen[row[0]].push(row); }
		});
		return gruppen;
	}

	function zielFuer(art, id, name) {
		if (art === 'q' || art === 'd') { return window.MQL_KARTE_LINK(art, id); }
		if (art === 'g' && id) { return '/' + sprache + '/' + SEGMENT.gegenstand[sprache] + '/' + id + '/'; }
		if (art === 't' && id) { return '/' + sprache + '/' + SEGMENT.titel[sprache] + '/' + id + '/'; }
		if (art === 'v' && id) { return '/' + sprache + '/' + SEGMENT.tugend[sprache] + '/' + id + '/'; }
		if (art === 's' && id) { return '/' + sprache + '/' + (sprache === 'fr' ? 'ensemble' : 'set') + '/' + id + '/'; }
		if (art === 'n' && id) {
			return '/' + sprache + '/' + ({de:'auftraggeber',en:'quest-giver',fr:'donneur-de-quete'})[sprache] + '/' + id + '/';
		}
		if (art === 'l' && id) {
			return '/' + sprache + '/' + ({de:'landmarke',en:'landmark',fr:'site'})[sprache] + '/' + id + '/';
		}
		if (art === 'f' && id) {
			return '/' + sprache + '/' + ({de:'fraktion',en:'faction',fr:'faction'})[sprache] + '/' + id + '/';
		}
		// Titles and virtues have their own catalogue lists; the reward browser
		// no longer carries them. Without an ID the search stays in that list.
		if (art === 't') {
			return '/' + sprache + '/' + SEGMENT.titel[sprache] + '/?q=' + encodeURIComponent(name);
		}
		if (art === 'v') {
			return '/' + sprache + '/' + SEGMENT.tugend[sprache] + '/';
		}
		return 'handwerk.html?lang=' + sprache + '&q=' + encodeURIComponent(name) + '#rezepte';
	}

	function oeffneTreffer(row) {
		var art = row[0], id = row[1], name = row[2];
		if (art !== 'q' && art !== 'd') { window.location.href = zielFuer(art, id, name); return; }
		var q = null;
		for (var i = 0; i < quests.length; i += 1) { if (quests[i].i === id) { q = quests[i]; break; } }
		if (!q) { window.location.href = zielFuer(art, id, name); return; }
		var ziel = q.knoten && q.knoten !== WURZEL ? q.knoten : null;
		if (ziel) {
			waehleKnoten(ziel, true);
			zustand.sichtbar = Math.max(zustand.sichtbar, ziel.quests.indexOf(q) + 1);
		}
		waehle(q);
		if (zeilen[q.i]) { zeilen[q.i].scrollIntoView({ block: 'center' }); }
	}

	function schliesseSuche() { suchergebnis.hidden = true; }

	function zeigeSuche() {
		var roh = suche.value.trim();
		var begriff = falten(roh);
		suchergebnis.textContent = '';
		if (begriff.length < 2) { schliesseSuche(); return; }
		var treffer = suchtreffer(begriff);

		function symbol(art) {
			return window.MQL_SYMBOL ? window.MQL_SYMBOL(ART_SYMBOL[art] || 'gebiet') : '';
		}
		function gruppe(art, titelText, anzahl) {
			var h = eltern('div');
			h.className = 'such-gruppe';
			var zeichen = eltern('span');
			zeichen.className = 'such-gruppe-symbol';
			zeichen.innerHTML = symbol(art);
			h.appendChild(zeichen);
			h.appendChild(document.createTextNode(titelText + ' · ' + anzahl));
			suchergebnis.appendChild(h);
			var list = document.createElement('ul');
			list.className = 'mql-row-list such-resultate';
			suchergebnis.appendChild(list);
			return list;
		}
		function zeile(art, text, zusatz, aktion, target, record) {
			if (art !== 'gebiet' && art !== 'region' && window.MQL_TREFFERZEILE &&
					window.MQL_TREFFERZEILE.searchRow && record) {
				var progress = (art === 'q' || art === 'd') && window.MQL_STATUS_UI
					? window.MQL_STATUS_UI.create(art === 'q' ? 'quests' : 'deeds', record.id, null, art === 'q' ? 'quest' : 'deed', null)
					: null;
				var list = target || suchergebnis;
				list.appendChild(window.MQL_TREFFERZEILE.searchRow(list, {
					kind:art, id:record.id, name:text, meta:record.meta || zusatz || '',
					level:record.level, progress:progress, progressColumn:!!progress,
					onActivate:function () { schliesseSuche(); aktion(); }
				}));
				return;
			}
			var b = eltern('button', null);
			b.type = 'button';
			b.className = 'such-zeile';
			var haupt = eltern('span');
			haupt.className = 'such-haupt';
			var zeichen = eltern('span');
			zeichen.className = 'such-symbol';
			zeichen.innerHTML = symbol(art);
			haupt.appendChild(zeichen);
			haupt.appendChild(eltern('span', text));
			b.appendChild(haupt);
			if (zusatz) { var z = eltern('span', zusatz); z.className = 'such-zusatz'; b.appendChild(z); }
			b.addEventListener('click', function () { schliesseSuche(); aktion(); });
			var container = target || suchergebnis;
			if (container.tagName === 'UL') {
				var item = document.createElement('li');
				item.appendChild(b);
				container.appendChild(item);
			} else { container.appendChild(b); }
		}
		function mehr(art, anzahl, begriffstext) {
			var link = document.createElement('a');
			link.className = 'such-mehr';
			link.href = 'suche.html?lang=' + sprache + '&q=' + encodeURIComponent(begriffstext);
			link.textContent = ersetze(t('suche_alle'), [anzahl]);
			suchergebnis.appendChild(link);
		}

		if (treffer.gebiete.length) {
			var gebietsListe = gruppe('gebiet', t('gebiete'), treffer.gebiete.length);
			treffer.gebiete.slice(0, 4).forEach(function (k) {
				var teile = k.schluessel.split('|').filter(Boolean); teile.pop();
				zeile(k.tiefe === 1 ? 'region' : 'gebiet', k.name, teile.join(' › '), function () {
					markiereBaum();
					waehleKnoten(k, true);
				}, gebietsListe);
			});
		}

		if (!vollSuche) {
			var art = window.MQL_ART === 'taten' ? 'd' : 'q';
			if (treffer.eintraege.length) {
				var lokaleListe = gruppe(art, t(ART_LABEL[art]), treffer.eintraege.length);
				treffer.eintraege.slice(0, 8).forEach(function (q) {
					var meta = q.knoten && q.knoten !== WURZEL ? q.knoten.name : '';
					zeile(art, q.n, meta, function () {
						var ziel = q.knoten && q.knoten !== WURZEL ? q.knoten : null;
						if (ziel) {
							waehleKnoten(ziel, true);
							zustand.sichtbar = Math.max(zustand.sichtbar, ziel.quests.indexOf(q) + 1);
						}
						waehle(q);
						if (zeilen[q.i]) { zeilen[q.i].scrollIntoView({ block: 'center' }); }
					}, lokaleListe, {id:q.i,level:q.l,meta:meta});
				});
				if (treffer.eintraege.length > 8) { mehr(art, treffer.eintraege.length, roh); }
			}
			var laden = eltern('div', t('suche_laedt'));
			laden.className = 'such-laden';
			suchergebnis.appendChild(laden);
			ladeVollSuche(function () {
				if (!suchergebnis.hidden && suche.value.trim().length >= 2) { zeigeSuche(); }
			});
		} else {
			var rows = volleTreffer(begriff);
			var gefunden = 0;
			SUCHARTEN.forEach(function (art) {
				var eigene = rows[art];
				if (!eigene.length) { return; }
				gefunden += eigene.length;
				var trefferListe = gruppe(art, t(ART_LABEL[art]), eigene.length);
				eigene.slice(0, 4).forEach(function (row) {
					var meta = ['q','d','r'].includes(art) ? row[3] : '';
					zeile(art, row[2], meta, function () { oeffneTreffer(row); }, trefferListe,
						{id:row[1],meta:meta,level:['q','d','g','r'].includes(art)?row[4]:null});
				});
				if (eigene.length > 4) { mehr(art, eigene.length, roh); }
			});
			if (!gefunden && !treffer.gebiete.length) {
				suchergebnis.appendChild(eltern('p', t('su_keine')));
			}
		}

		var alle = document.createElement('a');
		alle.className = 'such-andere';
		alle.href = 'suche.html?lang=' + sprache + '&q=' + encodeURIComponent(roh);
		alle.textContent = t('suche_alle_seite');
		suchergebnis.appendChild(alle);
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
			var begriff = suche.value.trim();
			if (begriff.length >= 2) {
				schliesseSuche();
				window.location.href = 'suche.html?lang=' + sprache + '&q=' + encodeURIComponent(begriff);
			}
		}
	});
	document.addEventListener('click', function (ereignis) {
		if (!ereignis.target.closest || !ereignis.target.closest('.globalsuche')) { schliesseSuche(); }
		if (filterLeiste.open && !filterMobil.matches &&
			(!ereignis.target.closest || !ereignis.target.closest('.listenwerkzeuge'))) {
			filterLeiste.close();
		}
	});
	document.addEventListener('keydown', function (ereignis) {
		if (ereignis.key === 'Escape' && filterLeiste.open && !filterMobil.matches) {
			filterLeiste.close();
			filterKnopf.focus();
		}
	});

	var zurueckKnopf = document.getElementById('zum-baum');
	if (zurueckKnopf) {
		zurueckKnopf.addEventListener('click', function () {
			// Step back only over entries this page added, never off the site.
			if (eigeneSchritte > 0) { window.history.back(); }
			else { zeigeNav('baum'); }
		});
	}
	window.addEventListener('popstate', function (ereignis) {
		var ziel = ereignis.state && ereignis.state.mqlListe;
		eigeneSchritte = Math.max(0, eigeneSchritte - 1);
		if (ziel && knoepfe[ziel]) {
			waehleKnoten(findeKnoten(WURZEL, ziel), true, true);
		} else {
			zeigeNav('baum');
		}
	});

	filterLeiste.addEventListener('change', function (ereignis) {
		if (ereignis.target.name !== 'kartenfortschritt') { return; }
		zustand.filter = ereignis.target.value;
		kartenfilterAnwenden();
	});
	function filterSchliessen() {
		filterLeiste.close();
		filterKnopf.focus();
	}
	filterLeiste.addEventListener('close', function () {
		filterKnopf.setAttribute('aria-expanded', String(filterLeiste.open));
	});
	filterLeiste.addEventListener('click', function (ereignis) {
		if (!filterMobil.matches || ereignis.target !== filterLeiste) { return; }
		var rand = filterLeiste.getBoundingClientRect();
		if (ereignis.clientY < rand.top || ereignis.clientY > rand.bottom) { filterSchliessen(); }
	});
	filterMobil.addEventListener('change', function () {
		if (filterLeiste.open) { filterSchliessen(); }
	});
	filterKnopf.addEventListener('click', function () {
		if (filterLeiste.open) { filterSchliessen(); return; }
		if (filterMobil.matches) { filterLeiste.showModal(); }
		else { filterLeiste.show(); }
		filterKnopf.setAttribute('aria-expanded', 'true');
		var wahl = filterLeiste.querySelector('input[name="kartenfortschritt"]:checked:not(:disabled)') || belohnungsWahl;
		if (wahl) { wahl.focus(); }
	});
	document.getElementById('kartenfilter-schliessen').addEventListener('click', filterSchliessen);
	document.getElementById('kartenfilter-fertig').addEventListener('click', filterSchliessen);
	function kartenfilterZuruecksetzen() {
		zustand.filter = 'alle';
		zustand.belohnung = 'alle';
		zustand.q = '';
		aufgabenSuche.value = '';
		if (belohnungsWahl) { belohnungsWahl.value = 'alle'; }
		kartenfilterAnwenden();
	}
	document.getElementById('kartenfilter-reset').addEventListener('click', kartenfilterZuruecksetzen);
	filterZuruecksetzen.addEventListener('click', function () {
		kartenfilterZuruecksetzen();
		filterSchliessen();
	});
	aktualisiereFilterOptionen();
	aufgabenSuche.value = zustand.q;
	// The cross is compact; the tooltip says what it removes.
	filterZuruecksetzen.title = t('filter_zuruecksetzen');
	// The deeds view searches deeds, not "quest or giver".
	if (window.MQL_ART === 'taten') {
		aufgabenSuche.setAttribute('placeholder', t('taten_suche_platzhalter'));
		aufgabenSuche.setAttribute('aria-label', t('taten_suchen'));
		var suchFeld = document.querySelector('.aufgaben-suche .visuell-versteckt');
		if (suchFeld) { suchFeld.textContent = t('taten_suchen'); }
	}
	aufgabenSuche.addEventListener('input', function () {
		zustand.q = aufgabenSuche.value.trim();
		zustand.sichtbar = ANSICHT_JE_SEITE;
		speichereKartenfilter();
		aktualisiereFilterAnzeige();
		zeichneListe();
		aktualisiereStand();
	});
	aktualisiereFilterAnzeige();

	zuklappen.addEventListener('click', function () {
		Object.keys(offen).forEach(function (schluessel) { offen[schluessel] = false; });
		baueBaum();
		markiereBaum(true);
	});

	// The list grows while scrolling instead of a "more" button.
	liste.addEventListener('scroll', function () {
		// A special view renders its whole list; generic paging would flatten it.
		if (sonderFuer(zustand.knoten)) { return; }
		if (zustand.sichtbar >= zustand.treffer.length) { return; }
		if (liste.scrollTop + liste.clientHeight < liste.scrollHeight - 200) { return; }
		zustand.sichtbar += ANSICHT_JE_SEITE;
		var oben = liste.scrollTop;
		zeigeListe(listeTitel.textContent, zustand.treffer);
		liste.scrollTop = oben;
	});

	// The title of a special view opens that view itself, so its address is
	// reachable again from any state inside it.
	(function () {
		function oeffne() {
			var sonder = sonderFuer(zustand.knoten);
			if (sonder && sonder.adresse) { window.location.assign(sonder.adresse()); }
		}
		listeTitel.addEventListener('click', oeffne);
		listeTitel.addEventListener('keydown', function (ereignis) {
			if (ereignis.key === 'Enter' || ereignis.key === ' ') {
				ereignis.preventDefault();
				oeffne();
			}
		});
	})();

	// --- Start ---------------------------------------------------------
	// Landscape-first navigation reuses the catalogue, progress and details.
	var landschaftAktiv = true;
	var landschaftBereich = null;
	var landschaftStart = document.getElementById('landschaften');
	var landschaftOrte = document.getElementById('landschaft-orte');
	var haupt = document.querySelector('main');
	// Keep a generous list by default, with a persistent, keyboard-accessible grip.
	var listenTrenner = eltern('div'); listenTrenner.className = 'listen-trenner';
	listenTrenner.tabIndex = 0; listenTrenner.setAttribute('role', 'separator');
	listenTrenner.setAttribute('aria-orientation', 'vertical');
	listenTrenner.setAttribute('aria-controls', 'nav');
	listenTrenner.title = sprache === 'de' ? 'Aufgabenliste breiter ziehen · Doppelklick: Standardbreite' : sprache === 'fr' ? 'Élargir la liste · Double-clic : largeur par défaut' : 'Drag to resize the list · Double-click: default width';
	listenTrenner.setAttribute('aria-label', listenTrenner.title);
	document.getElementById('nav').appendChild(listenTrenner);
	function listenGrenze() {
		return Math.max(280, Math.min(650, haupt.clientWidth - (window.innerWidth > 1240 ? 690 : window.innerWidth > 1000 ? 630 : 270)));
	}
	function listenMass() {
		listenTrenner.setAttribute('aria-valuemin', '280');
		listenTrenner.setAttribute('aria-valuemax', String(listenGrenze()));
		listenTrenner.setAttribute('aria-valuenow', String(Math.round(document.getElementById('nav').getBoundingClientRect().width)));
	}
	function listenBreite(wert) {
		wert = Math.max(280, Math.min(listenGrenze(), wert));
		haupt.style.setProperty('--listenbreite', wert + 'px'); listenMass();
		try { localStorage.setItem('llb.preview.listenbreite', String(wert)); } catch (e) {}
	}
	try { var gespeichert = Number(localStorage.getItem('llb.preview.listenbreite')); if (gespeichert >= 280 && gespeichert <= 650) { haupt.style.setProperty('--listenbreite', gespeichert + 'px'); } } catch (e) {}
	listenTrenner.onpointerdown = function (event) {
		if (event.button !== 0) { return; }
		event.preventDefault(); listenTrenner.setPointerCapture(event.pointerId);
		document.body.classList.add('liste-ziehen');
	};
	listenTrenner.onpointermove = function (event) {
		if (listenTrenner.hasPointerCapture(event.pointerId)) { listenBreite(event.clientX - haupt.getBoundingClientRect().left); }
	};
	listenTrenner.onlostpointercapture = function () { document.body.classList.remove('liste-ziehen'); };
	listenTrenner.onpointerup = listenTrenner.onpointercancel = function (event) {
		if (listenTrenner.hasPointerCapture(event.pointerId)) { listenTrenner.releasePointerCapture(event.pointerId); }
	};
	listenTrenner.onkeydown = function (event) {
		var breite = document.getElementById('nav').getBoundingClientRect().width;
		if (event.key === 'ArrowLeft') { breite -= event.shiftKey ? 50 : 10; }
		else if (event.key === 'ArrowRight') { breite += event.shiftKey ? 50 : 10; }
		else if (event.key === 'Home') { breite = 280; }
		else if (event.key === 'End') { breite = listenGrenze(); }
		else { return; }
		event.preventDefault(); listenBreite(breite);
	};
	listenTrenner.ondblclick = function () {
		haupt.style.removeProperty('--listenbreite');
		try { localStorage.removeItem('llb.preview.listenbreite'); } catch (e) {}
		listenMass();
	};
	window.addEventListener('resize', listenMass);
	var ltexte = {
		de: ['Wohin möchtest du reisen?', '', 'Gebiet oder Region suchen', 'Alle Landschaften', '', 'Gebietskarte', '', 'Weitere Inhalte'],
		en: ['Where would you like to go?', '', 'Search area or region', 'All landscapes', '', 'Landscape map', '', 'Other content'],
		fr: ['Où veux-tu aller ?', '', 'Chercher un lieu ou une région', 'Toutes les régions', '', 'Carte de la région', '', 'Autres contenus']
	}[sprache] || [];
	var landschaften = [];
	// Unnamed game-map variants are not separate landscapes. Give them an honest
	// UI label, retaining their IDs, projections and original catalogue keys.
	var varianten = {};
	function technischerName(name) { return /^(?:Karte|Map|Carte)\s+\d+$/.test(name || ''); }
	karten.forEach(function (karte) { karte.unbenannt = technischerName(karte.name); });
	karten.forEach(function (karte) {
		if (!karte.unbenannt) { return; }
		var vorlage = karten.find(function (k) { return k.bild_id === karte.bild_id && !k.unbenannt; });
		var basis = vorlage || karteNachIndex[karte.eltern];
		var name = basis && !technischerName(basis.name) ? basis.name : '';
		var gruppe = String(vorlage ? vorlage.idx : karte.eltern || 'andere');
		varianten[gruppe] = (varianten[gruppe] || 0) + 1;
		var zusatz = (sprache === 'de' ? 'Kartenvariante ' : sprache === 'fr' ? 'Variante de carte ' : 'Map variant ') + varianten[gruppe];
		lesbareKartennamen[karte.name] = (name ? name + ' · ' : '') + zusatz;
		karte.name = lesbareKartennamen[karte.name];
	});
	function kartennamenImBaum(knoten) {
		if (lesbareKartennamen[knoten.name]) { knoten.name = lesbareKartennamen[knoten.name]; }
		knoten.reihenfolge.forEach(kartennamenImBaum);
	}
	kartennamenImBaum(WURZEL);
	var inhaltsGruppen = {};
	var inhaltsAuswahl = null;
	function inhaltsKinder(knoten) {
		if (knoten.reihenfolge.length) { return knoten.reihenfolge; }
		if (inhaltsGruppen[knoten.schluessel]) { return inhaltsGruppen[knoten.schluessel]; }
		if (!knoten.quests.some(function (q) { return q.z === 'story'; })) { return []; }
		var gruppen = {};
		knoten.quests.forEach(function (q) {
			var kapitel = q.n.match(/^(?:Kapitel|Chapter|Chapitre)\s+(\d+)(?:[.:]|\b)/i);
			var name = q.a || (kapitel ? (sprache === 'de' ? 'Kapitel ' : sprache === 'fr' ? 'Chapitre ' : 'Chapter ') + kapitel[1] : t('allgemein'));
			if (!gruppen[name]) { gruppen[name] = { name: name, schluessel: knoten.schluessel + '|' + name, quests: [], reihenfolge: [], kinder: {}, karte: null }; }
			gruppen[name].quests.push(q);
		});
		var kinder = Object.keys(gruppen).map(function (name) { return gruppen[name]; });
		function ordnung(name) {
			if (/prolog/i.test(name)) { return -1; }
			var m = name.match(/(?:Buch|Book|Livre|Kapitel|Chapter|Chapitre)\s+(\d+|[IVXLCDM]+)\b/i);
			if (!m) { return 999; }
			if (/^\d+$/.test(m[1])) { return Number(m[1]); }
			var n = 0, vorher = 0, werte = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
			m[1].toUpperCase().split('').reverse().forEach(function (c) { var w = werte[c]; n += w < vorher ? -w : w; vorher = Math.max(vorher, w); }); return n;
		}
		kinder.sort(function (a,b) { return ordnung(a.name) - ordnung(b.name) || MQL_SORT.compare(a.name, b.name); });
		inhaltsGruppen[knoten.schluessel] = kinder.length > 1 ? kinder : [];
		return inhaltsGruppen[knoten.schluessel];
	}
	WURZEL.reihenfolge.forEach(function (region) {
		// "Weitere Inhalte" is a subject catalogue, not a geographic destination.
		// Those quests are available on the standalone quest finder page.
		if (region.name === ABSCHNITTE.more || region.name === ltexte[7] || istThemenWurzel(region)) { return; }
		if (!region.reihenfolge.some(function (gebiet) { return gebiet.karte != null; })) {
			return;
		}
		region.reihenfolge.forEach(function (gebiet) {
			// A map listed under "Alte Geschichten" must not also appear in
			// its ordinary geographic region.
			if (alteGeschichtenKarten[Number(gebiet.karte)] &&
				region.name !== alteGeschichtenKarten[Number(gebiet.karte)]) { return; }
			landschaften.push({ knoten: gebiet, region: region.name,
				karte: gebiet.karte != null ? gebiet.karte : besteKarte(gebiet.quests, gebiet.name) });
		});
		if (!region.reihenfolge.length) { landschaften.push({ knoten: region, region: ltexte[7], karte: region.karte }); }
	});
	// Presentation-only grouping: keep map IDs, parent paths and catalogue
	// records intact while giving a few oversized/over-prefixed regions clearer
	// cards. The source config is generated with the shared quest/deed geography.
	var gebietsAnzeige = window.MQL_GEBIETE && window.MQL_GEBIETE.anzeige || {};
	function knotenFuerKarte(knoten, ident) {
		if (knoten.karte != null && Number(knoten.karte) === Number(ident)) { return knoten; }
		for (var i = 0; i < (knoten.reihenfolge || []).length; i += 1) {
			var treffer = knotenFuerKarte(knoten.reihenfolge[i], ident);
			if (treffer) { return treffer; }
		}
		return null;
	}
	(gebietsAnzeige.promote || []).forEach(function (regel) {
		var uebersicht = landschaften.filter(function (e) {
			return Number(e.karte) === Number(regel.from);
		})[0];
		if (!uebersicht) { return; }
		var promoted = [];
		(regel.maps || []).forEach(function (id) {
			var knoten = knotenFuerKarte(uebersicht.knoten, id);
			if (!knoten || promoted.some(function (e) { return e.knoten === knoten; })) { return; }
			promoted.push({ knoten: knoten, region: uebersicht.region, karte: Number(id),
				promoted: true, sourceParent: Number(regel.from),
				anzeigeGruppe: regel.group ? { id: regel.group, label: regel.label } : null });
		});
		if (!promoted.length) { return; }
		// The overview map remains a real, reachable card. Its node keeps its
		// children and entries: the tab bar and the list need both. Promoted
		// child cards count their own subtrees.
		uebersicht.showOverviewLink = true;
		landschaften = landschaften.concat(promoted);
	});
	function gruppenMetadaten(ident) {
		for (var i = 0; i < (gebietsAnzeige.groups || []).length; i += 1) {
			var gruppe = gebietsAnzeige.groups[i];
			if ((gruppe.maps || []).some(function (map) { return Number(map) === Number(ident); })) {
				return gruppe;
			}
		}
		return null;
	}
	landschaften.forEach(function (e) {
		e.anzeigeGruppe = gruppenMetadaten(e.karte);
	});
	var gebuendelt = [];
	landschaften.forEach(function (e) {
		var karte = karteNachIndex[e.karte];
		if (!karte || !Object.prototype.hasOwnProperty.call(lesbareKartennamen, e.knoten.schluessel.split('|').pop())) { return; }
		var ziel = landschaften.find(function (anderer) {
			var k = karteNachIndex[anderer.karte];
			return anderer !== e && anderer.region === e.region && k && k.bild_id === karte.bild_id &&
				!Object.prototype.hasOwnProperty.call(lesbareKartennamen, anderer.knoten.schluessel.split('|').pop());
		});
		if (!ziel) { return; }
		if (!ziel.varianten) {
			ziel.varianten = true;
			ziel.knoten = Object.assign({}, ziel.knoten, { quests: ziel.knoten.quests.slice(), reihenfolge: ziel.knoten.reihenfolge.slice() });
		}
		var vorhanden = {}; ziel.knoten.quests.forEach(function (q) { vorhanden[q.i] = true; });
		e.knoten.quests.forEach(function (q) { if (!vorhanden[q.i]) { ziel.knoten.quests.push(q); vorhanden[q.i] = true; } });
		ziel.knoten.reihenfolge.push(e.knoten); gebuendelt.push(e);
	});
	landschaften = landschaften.filter(function (e) { return gebuendelt.indexOf(e) < 0; });
	// Every card in the map overview must open an actual map.
	landschaften = landschaften.filter(function (e) { return e.karte != null; });
	var restName = sprache === 'de' ? 'Weitere Aufgaben' : sprache === 'fr' ? 'Autres quêtes' : 'Other quests';
	function istThemenWurzel(knoten) {
		if (!knoten.quests.length) { return false; }
		var thema = knoten.quests[0].th;
		return !!thema && knoten.quests.every(function (quest) {
			return quest.th === thema && quest.f && quest.f[0] === knoten.name;
		});
	}
	landschaften.forEach(function (e) {
		e.rest = e.knoten.name === ABSCHNITTE.other;
		if (e.rest) { e.knoten.name = restName; }
	});
	var regionSortierung = ['Eriador', 'Rhovanion', 'Rohan', 'Gondor', 'Mordor', 'Haradwaith', 'Rhûn',
		'Alte Geschichten', 'Tales of Yore', 'Contes des temps jadis'];
	landschaften.sort(function (a,b) {
		if ((a.region === ltexte[7]) !== (b.region === ltexte[7])) { return a.region === ltexte[7] ? 1 : -1; }
		var ra = regionSortierung.indexOf(a.region), rb = regionSortierung.indexOf(b.region);
		var regionVergleich = (ra < 0 ? 99 : ra) - (rb < 0 ? 99 : rb) || MQL_SORT.compare(a.region, b.region);
		if (regionVergleich) { return regionVergleich; }
		var ga = a.anzeigeGruppe, gb = b.anzeigeGruppe;
		if (ga && gb && ga.id !== gb.id) {
			return (gebietsAnzeige.groups || []).findIndex(function (g) { return g.id === ga.id; }) -
				(gebietsAnzeige.groups || []).findIndex(function (g) { return g.id === gb.id; });
		}
		if (ga && !gb) { return 1; }
		if (!ga && gb) { return -1; }
		return MQL_SORT.compare(a.knoten.name, b.knoten.name);
	});
	function landschaftSlug(eintrag) {
		// Game map IDs survive language changes; no English names are guessed.
		return (eintrag.karte != null ? 'map-' + eintrag.karte : 'section-' + encodeURIComponent(eintrag.knoten.schluessel));
	}
	function landschaftFinde(knoten) {
		function enthaelt(k) { return k.schluessel === knoten.schluessel || k.reihenfolge.some(enthaelt); }
		return landschaften.find(function (e) { return enthaelt(e.knoten); });
	}
	function landschaftAdresse(eintrag, ort, ersetzen) {
		var url = new URL(window.location.href);
		url.searchParams.delete('gebiet'); url.searchParams.delete('id');
		url.hash = eintrag ? landschaftSlug(eintrag) + (ort != null && ort !== eintrag.karte ? '/' + ort : '') : '';
		window.history[ersetzen ? 'replaceState' : 'pushState']({ landschaft: true }, '', url);
	}
	var vorschauBeobachter = window.IntersectionObserver ? new IntersectionObserver(function (eintraege) {
		eintraege.forEach(function (eintrag) {
			if (!eintrag.isIntersecting) { return; }
			vorschauBeobachter.unobserve(eintrag.target);
			ladeKartenVorschau(eintrag.target);
		});
	}, { rootMargin: '300px 0px' }) : null;
	function ladeKartenVorschau(img) {
		if (img.dataset.geladen || !img.dataset.vorschau) { return; }
		img.dataset.geladen = '1';
		delete img.dataset.spielVersucht;
		delete img.dataset.pngVersucht;
		img.src = img.dataset.vorschau;
	}
	function beobachteKartenVorschau(img) {
		if (vorschauBeobachter) { vorschauBeobachter.observe(img); }
		else { ladeKartenVorschau(img); }
	}
	var abmeldenUebersichtAnsicht = null;
	function aktualisiereKartenVorschauen() {
		document.querySelectorAll('.landschaft-kachel[data-karte] img').forEach(function (img) {
			var karte = karteNachIndex[img.closest('[data-karte]').dataset.karte];
			if (!karte) { return; }
			var quelle = gelaende && gelaende.thumbnail(karte) || kartenVorschau(karte);
			img.dataset.vorschau = quelle;
			if (img.dataset.geladen && img.getAttribute('src') !== quelle) {
				delete img.dataset.spielVersucht;
				delete img.dataset.pngVersucht;
				img.src = quelle;
			} else if (!img.dataset.geladen) {
				beobachteKartenVorschau(img);
			}
		});
	}
	function landschaftUebersicht(ohneVerlauf) {
		if (abmeldenUebersichtAnsicht) { abmeldenUebersichtAnsicht(); abmeldenUebersichtAnsicht = null; }
		landschaftBereich = null;
		haupt.classList.add('landschaft-start'); landschaftStart.hidden = false;
		listeTitel.classList.remove('als-link');
		listeTitel.removeAttribute('role');
		listeTitel.removeAttribute('tabindex');
		listeTitel.removeAttribute('title');
		zeichneKartenBreadcrumb();
		landschaftAdresse(null, null, !!ohneVerlauf);
		landschaftStart.textContent = '';
		var kopf = eltern('div'); kopf.className = 'aufgaben-einstieg-kopf';
		kopf.appendChild(eltern('h2', ltexte[0]));
		var viewWords = window.MQL_GELAENDE && window.MQL_GELAENDE.words(sprache);
		if (viewWords && window.MQL_GELAENDE.subscribePreference) {
			var viewControls = eltern('div'); viewControls.className = 'kartenansicht landschaft-ansicht';
			viewControls.setAttribute('role', 'group'); viewControls.setAttribute('aria-label', viewWords[2]);
			var terrainChoice = eltern('button', viewWords[0]); terrainChoice.type = 'button';
			var gameChoice = eltern('button', viewWords[1]); gameChoice.type = 'button';
			terrainChoice.dataset.kartenansicht = 'gelaende'; gameChoice.dataset.kartenansicht = 'karte';
			viewControls.append(terrainChoice, gameChoice);
			abmeldenUebersichtAnsicht = window.MQL_GELAENDE.subscribePreference(function (mode) {
				terrainChoice.setAttribute('aria-pressed', String(mode === 'gelaende'));
				gameChoice.setAttribute('aria-pressed', String(mode === 'karte'));
			});
			terrainChoice.addEventListener('click', function () { window.MQL_GELAENDE.setPreference('gelaende'); });
			gameChoice.addEventListener('click', function () { window.MQL_GELAENDE.setPreference('karte'); });
			kopf.appendChild(viewControls);
		}
		// The deeds view gets the deed finder, never the quest finder.
		var tatenFinder = window.MQL_ART === 'taten';
		var finder = eltern('a', (tatenFinder ? {
			de:'Alle Taten im Finder →',en:'All deeds in the finder →',fr:'Toutes les prouesses dans le moteur de recherche →'
		} : {
			de:'Alle Aufgaben im Finder →',en:'All quests in the finder →',fr:'Toutes les quêtes dans le moteur de recherche →'
		})[sprache] || '');
		finder.className = 'llb-knopf';
		finder.dataset.art = 'haupt';
		finder.dataset.groesse = 'gross';
		finder.href = (tatenFinder ? {
			de:'/de/tat/',en:'/en/deed/',fr:'/fr/prouesse/'
		} : {
			de:'/de/aufgabenfinder/',en:'/en/quest-finder/',fr:'/fr/recherche-quetes/'
		})[sprache] || '/de/tat/';
		kopf.appendChild(finder); landschaftStart.appendChild(kopf);
		var einstieg = eltern('div'); einstieg.className = 'aufgaben-einstieg';
		einstieg.appendChild(eltern('p', (tatenFinder ? {
			de:'Wähle ein Gebiet für die Karte oder filtere alle Taten im Finder.',
			en:'Choose an area to open its map, or filter all deeds in the finder.',
			fr:'Choisissez une région pour ouvrir sa carte ou filtrez toutes les prouesses dans le moteur de recherche.'
		} : {
			de:'Wähle ein Gebiet für die Karte oder suche Aufgaben direkt nach Thema.',
			en:'Choose an area to open its map, or find quests by topic.',
			fr:'Choisissez une région pour ouvrir sa carte ou cherchez des quêtes par thème.'
		})[sprache] || ''));
		landschaftStart.appendChild(einstieg);

		var werkzeuge = eltern('div'); werkzeuge.className = 'landschaft-werkzeuge'; landschaftStart.appendChild(werkzeuge);
		var landschaftSuche = eltern('label'); landschaftSuche.className = 'landschaft-suche-label';
		var eingabe = eltern('input'); eingabe.type = 'search'; eingabe.placeholder = ltexte[2]; eingabe.setAttribute('aria-label', ltexte[2]); eingabe.className = 'landschaft-suche'; landschaftSuche.appendChild(eingabe);
		werkzeuge.appendChild(landschaftSuche);
		var spruenge = eltern('nav'); spruenge.className = 'landschaft-spruenge'; spruenge.setAttribute('aria-label', t('gebiete')); landschaftStart.appendChild(spruenge);
		var gruppen = eltern('div'); landschaftStart.appendChild(gruppen);
		var themenTitel = eltern('h3', {de:'Weitere Inhalte',en:'Other content',fr:'Autres contenus'}[sprache] || 'Other content');
		themenTitel.className = 'aufgaben-themen-titel';
		themenTitel.id = 'themen';
		var themen = eltern('section'); themen.className = 'aufgaben-themen';
		var themenTexte = {
			de:{epic:['Epische Geschichte','Bände, Bücher und Kapitel','In der Kartenansicht öffnen'],class:['Klassenaufgaben','Aufgaben mit einer belegten Klassenbindung','Im Finder suchen'],origin:['Herkunftsaufgaben','Aufgaben mit einer belegten Herkunftsbindung','Im Finder suchen'],festivals:['Feste und Ereignisse','Zeitlich gebundene und saisonale Aufgaben','Im Finder suchen'],missions:['Missionen','Missionen und ihre Aufgaben','Im Finder suchen'],instances:['Instanzen und Schlachten','Aufgaben aus Instanzen und Schlachten','Im Finder suchen'],craft:['Handwerk','Aufgaben rund ums Handwerk','Im Finder suchen'],board:['Aufgabenbrett','Aufgaben vom Aufgabenbrett','Im Finder suchen'],other:['Weitere Aufgaben','Weitere belegte Aufgaben','Im Finder suchen']},
			en:{epic:['Epic Story','Volumes, books and chapters','Open in the map'],class:['Class quests','Quests explicitly tied to a class','Find in quest finder'],origin:['Origin quests','Quests explicitly tied to an origin','Find in quest finder'],festivals:['Festivals and events','Seasonal and event quests','Find in quest finder'],missions:['Missions','Missions and their quests','Find in quest finder'],instances:['Instances and battles','Quests from instances and battles','Find in quest finder'],craft:['Crafting','Quests about crafting','Find in quest finder'],board:['Task board','Quests from the task board','Find in quest finder'],other:['Other quests','Other documented quests','Find in quest finder']},
			fr:{epic:['Histoire épique','Volumes, livres et chapitres','Ouvrir sur la carte'],class:['Quêtes de classe','Quêtes explicitement liées à une classe','Chercher dans le moteur'],origin:['Quêtes d’origine','Quêtes explicitement liées à une origine','Chercher dans le moteur'],festivals:['Fêtes et événements','Quêtes saisonnières et événementielles','Chercher dans le moteur'],missions:['Missions','Missions et leurs quêtes','Chercher dans le moteur'],instances:['Instances et batailles','Quêtes d’instances et de batailles','Chercher dans le moteur'],craft:['Artisanat','Quêtes liées à l’artisanat','Chercher dans le moteur'],board:['Tableau des tâches','Quêtes du tableau des tâches','Chercher dans le moteur'],other:['Autres quêtes','Autres quêtes documentées','Chercher dans le moteur']}
		}[sprache] || {};
		var finderBase = ({de:'/de/aufgabenfinder/',en:'/en/quest-finder/',fr:'/fr/recherche-quetes/'}[sprache] || '/de/aufgabenfinder/');
		['epic','class','origin','festivals','missions','instances','craft','board','other'].forEach(function (key) {
			var boardValue = {de:'Auftrag',en:'Task',fr:'Tâche'}[sprache] || 'Task';
			// The compact start metadata knows every topic. The loaded entries are
			// only one area's shard, so they must not decide which topics exist.
			var quelle = (window.MQL_KARTEN_SUMMARY && window.MQL_KARTEN_SUMMARY.length)
				? window.MQL_KARTEN_SUMMARY : quests;
			var vorhanden = key === 'board'
				? quelle.some(function (q) { return q.a === boardValue; })
				: quelle.some(function (q) { return q.th === key; });
			if (!vorhanden || !themenTexte[key]) { return; }
			var link = eltern('a'); link.className = 'aufgaben-thema';
			link.appendChild(eltern('strong',themenTexte[key][0]));
			link.appendChild(eltern('small',themenTexte[key][1]));
			link.appendChild(eltern('span',themenTexte[key][2]));
			if (key === 'epic') {
				var epikName = {de:'Epische Geschichte',en:'Epic Story',fr:'Histoire épique'}[sprache] || 'Epic Story';
				var root = WURZEL.reihenfolge.find(function (knoten) {
					return istThemenWurzel(knoten) && knoten.quests.some(function (q) { return q.th === 'epic'; });
				});
				var karteUrl = new URL(({de:'/de/karte/',en:'/en/map/',fr:'/fr/carte/'}[sprache] || '/de/karte/'),window.location.origin);
				if (root) { karteUrl.searchParams.set('gebiet',root.schluessel.replace(/^\|/,'')); }
				else if ((window.MQL_KARTEN_SUMMARY || []).some(function (row) { return row.th === 'epic'; })) {
					karteUrl.searchParams.set('gebiet',epikName);
				}
				link.href = karteUrl.pathname + karteUrl.search;
			} else {
				link.href = finderBase + '?topic=' + encodeURIComponent(key);
			}
			themen.appendChild(link);
		});
		// An empty heading would promise content that is not there.
		if (themen.childElementCount) { landschaftStart.append(themenTitel,themen); }
		function zeichnen() {
			gruppen.textContent = ''; spruenge.textContent = ''; var nachRegion = {};
			var sichtbareGruppen = {};
			var gruppenFertig = {};
			var uebersichtGerendert = {};
			// Groups are their own jump targets; remember where their region chip sits.
			var sprungNach = {};
			/** All maps of an overview group, including its named sub-areas. */
			function gruppenKarten(gruppe, eintrag) {
				var gefunden = [], gesehen = {}, wurzeln = [];
				// Dunland's overview node holds all its maps; other groups list them.
				var uebersicht = eintrag && eintrag.sourceParent ? knotenFuerKarte(WURZEL, eintrag.sourceParent) : null;
				if (uebersicht) {
					gesehen[Number(uebersicht.karte)] = true;
					wurzeln = uebersicht.reihenfolge || [];
				} else {
					(gruppe.maps || []).forEach(function (id) {
						var knoten = knotenFuerKarte(WURZEL, id);
						if (knoten) { wurzeln.push(knoten); }
					});
				}
				wurzeln.forEach(function (knoten) {
					(function sammle(k) {
						if (k.karte != null && !gesehen[Number(k.karte)]) {
							gesehen[Number(k.karte)] = true;
							gefunden.push({ name: k.name, karte: Number(k.karte), knoten: k });
						}
						(k.reihenfolge || []).forEach(sammle);
					})(knoten);
				});
				return gefunden.sort(function (a, b) { return MQL_SORT.compare(a.name, b.name); });
			}
			function sprungZiel(link, ziel, titel) {
				link.href = '#' + ziel.id;
				link.onclick = function (event) {
					event.preventDefault(); ziel.scrollIntoView({ block: 'start' });
					if (titel) { titel.focus({ preventScroll: true }); }
				};
			}
			var rest = eltern('section'); rest.className = 'landschaft-rest landschaft-gruppe';
			var restBox = eltern('div'); restBox.className = 'landschaft-kacheln'; rest.appendChild(restBox);
			/** One landscape card; groups build these for all their maps. */
			function zeichneKachel(e, box) {
			// The Dunland overview has no entries of its own. Keep its map
			// reachable from the group heading, not as an empty landscape card.
			var knopf = eltern('button'); knopf.className = 'landschaft-kachel'; knopf.dataset.landschaft = landschaftSlug(e);
			var karte = karteNachIndex[e.karte];
			if (karte) { knopf.dataset.karte = karte.idx; }
			if (e.promoted) { knopf.dataset.gebietgruppe = 'dunland'; }
			else if (e.anzeigeGruppe) { knopf.dataset.gebietgruppe = e.anzeigeGruppe.id; }
			var platzhalter = eltern('span'); platzhalter.className = 'landschaft-bild-leer'; platzhalter.setAttribute('aria-hidden', 'true');
			if (karte) {
				var img = eltern('img');
				img.loading = 'lazy'; img.decoding = 'async'; img.width = 320; img.height = 240; img.alt = '';
				var vorschau = (gelaende && gelaende.thumbnail(karte)) || kartenVorschau(karte);
				var spielBild = webpOrdner + karte.bild.replace(/\.png$/i, '.webp');
				img.dataset.vorschau = vorschau;
				img.onerror = function () {
					if (this.getAttribute('src') !== spielBild && !this.dataset.spielVersucht) {
						this.dataset.spielVersucht = '1'; this.src = spielBild;
					} else if (!this.dataset.pngVersucht) {
						this.dataset.pngVersucht = '1'; this.src = bildOrdner + karte.bild;
					} else { this.replaceWith(platzhalter); }
				};
				beobachteKartenVorschau(img);
				knopf.appendChild(img);
			}
			else { knopf.appendChild(platzhalter); }
			var inhalt = eltern('span'); inhalt.className = 'inhalt'; inhalt.appendChild(eltern('strong', e.knoten.name));
			if (e.showOverviewLink) {
				inhalt.appendChild(eltern('small', {
					de:'Übersichtskarte · Gebiete einzeln darunter',
					en:'Overview map · areas listed separately below',
					fr:'Carte générale · zones détaillées ci-dessous'
				}[sprache] || ''));
			}
			inhalt.appendChild(eltern('small', stufenSpanne(zaehlEintraege(e.knoten))));
			var z = zaehle(zaehlEintraege(e.knoten));
			inhalt.appendChild(eltern('small', zahl(z.erledigt, z.gesamt) + ' ' + t('aufgaben')));
			if (hatFortschritt) { var p = eltern('progress'); p.max = z.gesamt || 1; p.value = z.erledigt; inhalt.appendChild(p); }
			knopf.appendChild(inhalt); knopf.onclick = function () { landschaftOeffnen(e); };
			var kachel = eltern('div'); kachel.className = 'landschaft-mit-orten'; kachel.appendChild(knopf);
			var untergebiete = eltern('nav'); untergebiete.className = 'landschaft-untergebiete'; untergebiete.setAttribute('aria-label', e.knoten.name);
			if (!e.groupCard) {
				function unterorte(knoten) {
					knoten.reihenfolge.forEach(function (kind) {
						if (kind.karte != null && kind.karte !== e.karte) {
							var link = eltern('a', kind.name); link.href = '#' + landschaftSlug(e) + '/' + kind.karte;
							link.onclick = function (event) { event.preventDefault(); landschaftOeffnen(e, kind.karte); };
							untergebiete.appendChild(link);
						}
						unterorte(kind);
					});
				}
				if (e.showOverviewLink) {
					// Promoted maps have their own cards. Avoid listing them again
					// as links under the overview card.
				} else if (e.karte == null) {
					inhaltsKinder(e.knoten).forEach(function (kind) {
						var ziel = 'group-' + encodeURIComponent(kind.schluessel);
						var link = eltern('a', kind.name); link.href = '#' + landschaftSlug(e) + '/' + ziel;
						link.onclick = function (event) { event.preventDefault(); landschaftOeffnen(e, ziel); };
						untergebiete.appendChild(link);
					});
				} else { unterorte(e.knoten); }
				if (untergebiete.childElementCount) { kachel.appendChild(untergebiete); }
			}
			box.appendChild(kachel);
			}

			var suchbegriff = falten(eingabe.value);
			landschaften.forEach(function (e) {
				var treffer = falten(e.knoten.name + ' ' + e.region).indexOf(suchbegriff) >= 0;
				var gruppenKartenTreffer = false;
				// Group cards have searchable child maps. Check them before
				// discarding a non-matching overview (e.g. Isengart in Dunland).
				if (!treffer && suchbegriff && e.anzeigeGruppe) {
					var suchGruppe = (gebietsAnzeige.groups || []).find(function (g) {
						return g.id === e.anzeigeGruppe.id;
					});
					gruppenKartenTreffer = !!suchGruppe && gruppenKarten(suchGruppe, e).some(function (ort) {
						return falten(ort.name + ' ' + e.region).indexOf(suchbegriff) >= 0;
					});
				}
				if (suchbegriff && !treffer && !gruppenKartenTreffer) { return; }
				var box = e.rest ? restBox : nachRegion[e.region];
				if (!box) {
					var s = eltern('section'); s.className = 'landschaft-gruppe'; s.id = 'region-' + Object.keys(nachRegion).length;
					var titel = eltern('h3', e.region); titel.tabIndex = -1; s.appendChild(titel);
					var sprung = eltern('a', e.region); sprung.href = '#' + s.id;
					// Region jumps scroll this view, not the landscape routing hash.
					sprung.onclick = function (event) { event.preventDefault(); s.scrollIntoView({ block: 'start' }); titel.focus({ preventScroll: true }); };
					spruenge.appendChild(sprung);
					sprungNach[e.region] = sprung;
					box = eltern('div'); box.className = 'landschaft-kacheln'; s.appendChild(box); gruppen.appendChild(s); nachRegion[e.region] = box;
				}
				if (e.anzeigeGruppe) {
					var gruppenId = e.region + '|' + e.anzeigeGruppe.id;
					if (!sichtbareGruppen[gruppenId]) {
						var kurz = e.anzeigeGruppe.label.replace(/^Aperçu du\s+/i, '').replace(/\s*[-–]?\s*(Überblick|Overview|Vue d[’']ensemble)\s*$/i, '').trim() || e.anzeigeGruppe.label;
						var gruppenKopf = eltern('h4', kurz);
						gruppenKopf.className = 'landschaft-kachelgruppe';
						gruppenKopf.dataset.gebietgruppe = e.anzeigeGruppe.id;
						gruppenKopf.id = 'gruppe-' + e.anzeigeGruppe.id;
						box.appendChild(gruppenKopf);
						// Rohan already has one region jump; East/West remain visual
						// card groups, but do not add two more jump marks.
						if (e.anzeigeGruppe.id !== 'east-rohan' && e.anzeigeGruppe.id !== 'west-rohan') {
							var gruppenSprung = eltern('a', kurz);
							gruppenSprung.className = 'sprung-gruppe';
							sprungZiel(gruppenSprung, gruppenKopf, gruppenKopf);
							var vor = sprungNach[e.region];
							if (vor && vor.parentNode) { spruenge.insertBefore(gruppenSprung, vor.nextSibling); sprungNach[e.region] = gruppenSprung; }
							else { spruenge.appendChild(gruppenSprung); }
						}
						var gruppe = (gebietsAnzeige.groups || []).find(function (g) { return g.id === e.anzeigeGruppe.id; });
						if (gruppe) {
							var orte = gruppenKarten(gruppe, e);
							var uebersicht = e.sourceParent ? landschaften.find(function (x) { return x.showOverviewLink; }) : null;
							if (uebersicht && (!suchbegriff ||
								falten(uebersicht.knoten.name + ' ' + e.region).indexOf(suchbegriff) >= 0)) {
								uebersichtGerendert[String(uebersicht.karte)] = true;
								zeichneKachel(uebersicht, box);
							}
							orte.forEach(function (ort) {
								if (falten(ort.name + ' ' + e.region).indexOf(suchbegriff) < 0) { return; }
								zeichneKachel({ knoten: ort.knoten, region: e.region, karte: ort.karte,
									anzeigeGruppe: e.anzeigeGruppe, groupCard: true,
									showOverviewLink: ort.uebersicht === true }, box);
							});
						}
						sichtbareGruppen[gruppenId] = true;
						gruppenFertig[gruppenId] = true;
					}
				}
				if (e.anzeigeGruppe && gruppenFertig[e.region + '|' + e.anzeigeGruppe.id]) { return; }
				if (e.showOverviewLink) { return; }
				zeichneKachel(e, box);
			});
			if (restBox.childElementCount) { gruppen.appendChild(rest); }
			if (themen.childElementCount) {
				var themenSprung = eltern('a', themenTitel.textContent);
				themenSprung.className = 'sprung-themen';
				sprungZiel(themenSprung, themenTitel, themenTitel);
				spruenge.appendChild(themenSprung);
			}
		}
		eingabe.oninput = zeichnen; zeichnen();
	}
	function landschaftReiter() {
		landschaftOrte.textContent = '';
		if (!landschaftBereich) { return; }
		if (landschaftBereich.karte == null) { inhaltsReiter(); return; }
		var kopf = eltern('div'); kopf.className = 'landschaft-orte-kopf';
		kopf.appendChild(eltern('strong', landschaftBereich.knoten.name));
		var erklaerung = eltern('span'); kopf.appendChild(erklaerung); landschaftOrte.appendChild(kopf);
		var auswahl = eltern('div'); auswahl.className = 'landschaft-orte-auswahl'; landschaftOrte.appendChild(auswahl);
		var kartenSet = {};
		function sammeln(k) {
			if (k.karte != null) {
				var id = String(k.karte), bisher = kartenSet[id];
				var tiefe = (k.schluessel || '').split('|').length;
				var bisherTiefe = bisher ? (bisher.schluessel || '').split('|').length : -1;
				var aufgaben = (k.quests || []).length, bisherAufgaben = bisher ? (bisher.quests || []).length : -1;
				if (!bisher || (aufgaben > 0) !== (bisherAufgaben > 0) ||
					((aufgaben > 0) === (bisherAufgaben > 0) && (tiefe > bisherTiefe ||
						(tiefe === bisherTiefe && aufgaben > bisherAufgaben)))) {
					kartenSet[id] = k;
				}
			}
			k.reihenfolge.forEach(sammeln);
		}
		sammeln(landschaftBereich.knoten);
		Object.keys(kartenSet).forEach(function (id) {
			var passend = kartenKnoten(id);
			if (passend && (passend.quests || []).length > (kartenSet[id].quests || []).length) {
				kartenSet[id] = passend;
			}
			var passendeAufgaben = kartenAufgaben(id);
			if (passendeAufgaben.length > (kartenSet[id].quests || []).length) {
				kartenSet[id] = kartenAnsichtsknoten(id, passendeAufgaben, landschaftBereich.knoten);
			}
		});
		if (landschaftBereich.karte != null) { kartenSet[landschaftBereich.karte] = landschaftBereich.knoten; }
		if (zustand.karte && !kartenSet[zustand.karte.idx]) {
			kartenSet[zustand.karte.idx] = { name: zustand.karte.name, quests: [] };
		}
		var anzahlOrte = Object.keys(kartenSet).filter(function (id) { return Number(id) !== landschaftBereich.karte; }).length;
		erklaerung.textContent = sprache === 'de' ? 'Gebietskarte und ' + anzahlOrte + ' Untergebiete' : sprache === 'fr' ? 'Carte de la région et ' + anzahlOrte + ' sous-régions' : 'Landscape map and ' + anzahlOrte + ' sub-areas';
		Object.keys(kartenSet).sort(function (a,b) { return (Number(a) === landschaftBereich.karte ? -1 : Number(b) === landschaftBereich.karte ? 1 : MQL_SORT.compare(kartenSet[a].name, kartenSet[b].name)); }).forEach(function (id) {
			var istGebiet = Number(id) === landschaftBereich.karte;
			var name = istGebiet ? (sprache === 'de' ? 'Ganz ' : sprache === 'fr' ? 'Toute la région : ' : 'All of ') + landschaftBereich.knoten.name : kartenSet[id].name;
			var knopf = eltern('button'); knopf.appendChild(eltern('span', name));
			var zaehler = zaehle(zaehlEintraege(kartenSet[id]));
			var zahlText = eltern('small', zahl(zaehler.erledigt, zaehler.gesamt)); knopf.appendChild(zahlText);
			knopf.title = name + ' · ' + zahl(zaehler.erledigt, zaehler.gesamt) + ' ' + t('aufgaben');
			knopf.setAttribute('aria-pressed', String(zustand.karte && zustand.karte.idx === Number(id)));
			knopf.onclick = function () { landschaftOeffnen(landschaftBereich, Number(id)); };
			auswahl.appendChild(knopf);
		});
	}
	function kartenKnoten(kennung) {
		var teil = null;
		function finden(k) {
			if (Number(k.karte) === Number(kennung)) {
				var tiefe = (k.schluessel || '').split('|').length;
				var teilTiefe = teil ? (teil.schluessel || '').split('|').length : -1;
				var anzahl = (k.quests || []).length, teilAnzahl = teil ? (teil.quests || []).length : -1;
				if (!teil || (anzahl > 0) !== (teilAnzahl > 0) ||
					((anzahl > 0) === (teilAnzahl > 0) && (tiefe > teilTiefe ||
						(tiefe === teilTiefe && anzahl > teilAnzahl)))) { teil = k; }
			}
			k.reihenfolge.forEach(finden);
		}
		finden(WURZEL);
		return teil;
	}
	function kartenAufgaben(kennung) {
		return quests.filter(function (quest) {
			return (quest.fk || []).some(function (id) { return Number(id) === Number(kennung); });
		});
	}
	function kartenAnsichtsknoten(kennung, eintraege, elternKnoten) {
		var karte = karteNachIndex[kennung] || {};
		return {
			schluessel: (elternKnoten.schluessel || '') + '|' + (karte.name || ''),
			name: karte.name || '', tiefe: (elternKnoten.tiefe || 0) + 1,
			quests: eintraege, eigene: eintraege, kinder: {}, reihenfolge: [],
			karte: Number(kennung),
		};
	}
	function inhaltsReiter() {
		var e = landschaftBereich;
		var kopf = eltern('div'); kopf.className = 'landschaft-orte-kopf'; kopf.appendChild(eltern('strong', e.knoten.name)); landschaftOrte.appendChild(kopf);
		function zeile(knoten, aktiv) {
			var auswahl = eltern('div'); auswahl.className = 'landschaft-orte-auswahl inhalts-auswahl';
			[knoten].concat(inhaltsKinder(knoten)).forEach(function (kind, index) {
				var name = kind.name;
				if (knoten !== e.knoten) { name = name.replace(/^.*?,\s*((?:Buch|Book|Livre)\s+)/i, '$1').replace(/^.*?:\s*(Prolog(?:ue)?)/i, '$1'); }
				var knopf = eltern('button'); knopf.appendChild(eltern('span', index ? name : (sprache === 'de' ? 'Alle: ' : sprache === 'fr' ? 'Tout : ' : 'All: ') + knoten.name));
				var z = zaehle(zaehlEintraege(kind)); knopf.appendChild(eltern('small', zahl(z.erledigt, z.gesamt)));
				knopf.setAttribute('aria-pressed', String(kind === aktiv));
				knopf.onclick = function () { landschaftOeffnen(e, 'group-' + encodeURIComponent(kind.schluessel)); };
				auswahl.appendChild(knopf);
			});
			landschaftOrte.appendChild(auswahl);
		}
		var auswahl = inhaltsAuswahl || e.knoten;
		var elternKnoten = inhaltsKinder(e.knoten).find(function (k) { return auswahl.schluessel === k.schluessel || auswahl.schluessel.indexOf(k.schluessel + '|') === 0; });
		zeile(e.knoten, elternKnoten || auswahl);
		if (elternKnoten && inhaltsKinder(elternKnoten).length) { zeile(elternKnoten, auswahl); }
	}
	var waehleKnotenAlt = waehleKnoten;
	waehleKnoten = function (knoten, alsListe, ohneVerlauf) {
		var e = landschaftFinde(knoten);
		if (e) {
			var ort = knoten === e.knoten ? null : e.karte == null ? 'group-' + encodeURIComponent(knoten.schluessel) : knoten.karte;
			landschaftOeffnen(e, ort, ohneVerlauf);
		}
		else {
			haupt.classList.remove('landschaft-start'); landschaftStart.hidden = true;
			waehleKnotenAlt(knoten, true, true);
		}
	};
	var landschaftAuftrag = 0;
	// ?id=<quest id> names an entry, not a landscape. Its area is known from the
	// compact start metadata; select it once the shards are here.
	var auswahlNachLaden = null;
	function landschaftOeffnen(e, ort, ohneVerlauf) {
		if (abmeldenUebersichtAnsicht) { abmeldenUebersichtAnsicht(); abmeldenUebersichtAnsicht = null; }
		landschaftBereich = e; haupt.classList.remove('landschaft-start'); landschaftStart.hidden = true;
		listenMass();
		var auftrag = ++landschaftAuftrag;
		function zeichne() {
			// A later click (or a hash change) wins over a slow shard load.
			if (auftrag !== landschaftAuftrag) { return; }
			var teil = null;
			function finden(k) {
				if (Number(k.karte) === Number(ort)) {
					var tiefe = (k.schluessel || '').split('|').length;
					var teilTiefe = teil ? (teil.schluessel || '').split('|').length : -1;
					var anzahl = (k.quests || []).length, teilAnzahl = teil ? (teil.quests || []).length : -1;
					if (!teil || (anzahl > 0) !== (teilAnzahl > 0) ||
						((anzahl > 0) === (teilAnzahl > 0) && (tiefe > teilTiefe ||
							(tiefe === teilTiefe && anzahl > teilAnzahl)))) { teil = k; }
				}
				k.reihenfolge.forEach(finden);
			}
			inhaltsAuswahl = null;
			if (typeof ort === 'string' && ort.indexOf('group-') === 0) {
				var schluessel; try { schluessel = decodeURIComponent(ort.slice(6)); } catch (err) { schluessel = ''; }
				var moegliche = [e.knoten].concat(inhaltsKinder(e.knoten));
				moegliche.slice().forEach(function (k) { if (k !== e.knoten) { moegliche = moegliche.concat(inhaltsKinder(k)); } });
				teil = moegliche.find(function (k) { return k.schluessel === schluessel; }) || null;
				inhaltsAuswahl = teil;
			} else {
				// A card without entries of its own (a story map such as Besieged
				// Mordor) still has a list: the entries on its map.
				if (ort == null && e.knoten.karte != null && !(e.knoten.quests || []).length) {
					ort = e.knoten.karte;
				}
			}
			if (ort != null) {
				finden(e.knoten);
				var globales = kartenKnoten(ort);
				if (globales && (globales.quests || []).length > (teil && teil.quests || []).length) {
					teil = globales;
				}
				var passendeAufgaben = kartenAufgaben(ort);
				if (passendeAufgaben.length > (teil && teil.quests || []).length) {
					teil = kartenAnsichtsknoten(ort, passendeAufgaben, e.knoten);
				}
			}
			waehleKnotenAlt(teil || e.knoten, true, true);
			// Landscape lists include their child locations, not just direct entries.
			zustand.suchliste = true; zeichneListe(); zeichneMarker(); aktualisiereStand();
			if (ort != null && karteNachIndex[ort]) { zeigeKarte(ort); zeichneMarker(); }
			landschaftReiter();
			if (!ohneVerlauf) { landschaftAdresse(e, ort); }
			try { localStorage.setItem('llb.preview.letztesGebiet', landschaftSlug(e)); } catch (err) {}
			if (auswahlNachLaden) {
				var kennung = auswahlNachLaden; auswahlNachLaden = null;
				var eintrag = questNachId[kennung];
				if (eintrag) {
					zustand.sichtbar = Math.max(zustand.sichtbar, e.knoten.quests.indexOf(eintrag) + 1);
					waehle(eintrag);
					if (zeilen[eintrag.i]) { zeilen[eintrag.i].scrollIntoView({ block: 'center' }); }
				}
			}
		}
		// Tabs, progress and the selected area need the landscape's shards. Draw
		// once they are here; before, every deeper sub-area sat at 0/0.
		if (e.knoten === WURZEL || e.knoten.gebietsDatenGeladen) { zeichne(); return; }
		listeTitel.textContent = e.knoten.name;
		liste.textContent = '';
		var ladehinweis = eltern('li', t('lade_karte'));
		ladehinweis.className = 'listen-hinweis';
		liste.appendChild(ladehinweis);
		ladeGebietsDaten(e.knoten, function () {
			e.knoten.gebietsDatenGeladen = true;
			zeichne();
		});
	}
	function landschaftAusAdresse() {
		var hash = window.location.hash.slice(1).split('/');
		var e = landschaften.find(function (e) { return landschaftSlug(e) === hash[0]; });
		if (!e && /^map-\d+$/.test(hash[0])) {
			var index = Number(hash[0].slice(4));
			// A map ID alone names its group map too: the landscape that carries
			// the parent map loads the shards below it, including this one. The
			// parent chain can skip unnamed maps, so walk it up to the card.
			var karte = karteNachIndex[index];
			var oben = karte ? Number(karte.eltern) : 0;
			for (var tiefe = 0; karte && tiefe < 8 && !e; tiefe += 1) {
				e = landschaften.find(function (x) { return Number(x.karte) === oben; }) || null;
				karte = karteNachIndex[oben];
				oben = karte ? Number(karte.eltern) : 0;
			}
			if (!e) {
				function hatKarte(k) { return k.karte === index || k.reihenfolge.some(hatKarte); }
				e = landschaften.find(function (e) { return hatKarte(e.knoten); });
			}
			if (e && !hash[1]) { hash[1] = String(index); }
		}
		if (e) { landschaftOeffnen(e, hash[1] ? (hash[1].indexOf('group-') === 0 ? hash[1] : Number(hash[1])) : null, true); }
		else { landschaftUebersicht(true); }
	}
	window.addEventListener('popstate', function () { landschaftAusAdresse(); });
	window.addEventListener('hashchange', landschaftAusAdresse);
	var altZurueck = document.getElementById('zum-baum');
	if (altZurueck) {
		var neuZurueck = altZurueck.cloneNode(true); altZurueck.replaceWith(neuZurueck);
		neuZurueck.textContent = '‹ ' + ltexte[3]; neuZurueck.onclick = function () { landschaftUebersicht(); };
	}
	if (window.MQL_GELAENDE) {
		gelaende = window.MQL_GELAENDE.create({ world:welt, stage:buehne, image:bild, language:sprache,
			onChange:function () {
				if (gelaende && gelaende.active()) { hinweis.textContent = ''; }
				passeAn(); zeichneMarker();
				aktualisiereKartenVorschauen();
			},
			onView:function () { schliesseHaufen(); if (zustand.karte) { zeichneVorkommen(); } }
		});
	}
	if (!karten.length) {
		haupt.classList.remove('karte-laedt');
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
	function starteAnsicht() {
	var gewuenscht = null;
	try {
		gewuenscht = questNachId[(new URLSearchParams(window.location.search).get('id') || '').toUpperCase()] || null;
	} catch (fehler) { gewuenscht = null; }
	// The compact start carries no entries. A link that names only an id finds
	// its area through the start metadata; the entry is selected once the
	// area's shard has arrived.
	var wunschStart = null;
	if (!gewuenscht) {
		var wunschId = '';
		try { wunschId = (new URLSearchParams(window.location.search).get('id') || '').toUpperCase(); } catch (fehler) { wunschId = ''; }
		if (wunschId) {
			var zeile = (window.MQL_KARTEN_SUMMARY || []).find(function (row) { return row.i === wunschId; }) || null;
			var pfadTeile = zeile && zeile.f ? zeile.f : [];
			if (pfadTeile.length >= 2) {
				wunschStart = findeKnoten(WURZEL, '|' + pfadTeile[0] + '|' + pfadTeile[1]);
				if (wunschStart) { auswahlNachLaden = wunschId; }
			}
		}
	}
	var start = (gewuenscht && gewuenscht.knoten && gewuenscht.knoten !== WURZEL ? gewuenscht.knoten : null) ||
		wunschStart || knotenAusAdresse();
	// A resource link from the crafting page names the map to open.
	var wunschkarte = 0;
	try { wunschkarte = parseInt(new URLSearchParams(window.location.search).get('vorkarte'), 10) || 0; } catch (fehler) { wunschkarte = 0; }
	if (!start && wunschkarte) { start = knotenMitKarte(WURZEL, wunschkarte); }
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
	var mitAdresse = !!gewuenscht || !!auswahlNachLaden || !!knotenAusAdresse() || !!wunschkarte;
	// A hash link already names its landscape. Starting the default area as well
	// let its late shards overwrite the linked list (Breeland above Isengart).
	var hashOeffnet = !!window.location.hash && !gewuenscht;
	if (!hashOeffnet && (mitAdresse || window.location.hash)) { waehleKnoten(start, mitAdresse, true); }
	try { window.history.replaceState(mitAdresse ? { mqlListe: start.schluessel } : null, '', window.location.href); } catch (fehler) {}
	var vorgabeSuche = '';
	try { vorgabeSuche = new URLSearchParams(window.location.search).get('suche') || ''; } catch (fehler) {}
	if (vorgabeSuche) { suche.value = vorgabeSuche; zeigeSuche(); suche.focus(); }
	if (gewuenscht) {
		zustand.sichtbar = Math.max(zustand.sichtbar, start.quests.indexOf(gewuenscht) + 1);
		waehle(gewuenscht);
		if (zeilen[gewuenscht.i]) { zeilen[gewuenscht.i].scrollIntoView({ block: 'center' }); }
	}
	if (hashOeffnet) { landschaftAusAdresse(); }
	else if (!mitAdresse && !vorgabeSuche) { landschaftUebersicht(true); }
	haupt.classList.remove('karte-laedt');
	}

	// A special view brings its own node. Its data loads before the tree is
	// built when the address names it; the map app does not inspect it.
	function ergaenzeSonderansichten() {
		SONDER.forEach(function (ansicht) {
			if (!ansicht.knoten) { return; }
			var eigener = ansicht.knoten();
			if (!eigener) { return; }
			var vorhanden = findeKnoten(WURZEL, eigener.schluessel);
			if (vorhanden) {
				vorhanden.quests = eigener.quests;
				vorhanden.eigeneZaehlung = true;
				return;
			}
			WURZEL.kinder[eigener.schluessel] = eigener;
			WURZEL.reihenfolge.push(eigener);
		});
		sortiere(WURZEL);
	}
	function starteMitSonderansichten() {
		var zuLaden = SONDER.filter(function (ansicht) {
			return ansicht.brauchtDaten && ansicht.brauchtDaten();
		});
		if (zuLaden.length) {
			zuLaden[0].laden(function () {
				ergaenzeSonderansichten();
				baueBaum();
				starteAnsicht();
			}, function () { starteAnsicht(); });
			return;
		}
		ergaenzeSonderansichten();
		starteAnsicht();
	}
	starteMitSonderansichten();
})();
