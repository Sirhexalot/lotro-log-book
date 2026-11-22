/* Advisor page: the character's gear, bags and vault from the local import.
 *
 * Nothing is computed here beyond what the import proves: slots, items, their
 * own values and the dates the files carry. Recommendations follow in a later
 * step and need the catalogue; this page never guesses one.
 */
(function () {
	'use strict';

	var t = window.MQL_T || function (k) { return k; };
	var speicher = window.MQL_SPEICHER;
	var sprache = window.MQL_SPRACHE || 'de';

	function el(id) { return document.getElementById(id); }
	function text(id, wert) { var feld = el(id); if (feld) { feld.textContent = wert == null ? '' : String(wert); } }
	function zeige(id, sichtbar) { var feld = el(id); if (feld) { feld.hidden = !sichtbar; } }

	/* Slot names the client uses, in the order the game shows them. Left and
	   right of the character, then the weapon row underneath. */
	var LINKS = ['HEAD', 'SHOULDER', 'BACK', 'BREAST', 'HANDS', 'LEGS', 'FEET'];
	var RECHTS = ['LEFT_EAR', 'RIGHT_EAR', 'NECK', 'LEFT_WRIST', 'RIGHT_WRIST',
		'LEFT_FINGER', 'RIGHT_FINGER', 'POCKET'];
	var UNTEN = ['MAIN_MELEE', 'OTHER_MELEE', 'RANGED', 'TOOL', 'CLASS_ITEM', 'BRIDLE'];

	var PLATZ = {
		HEAD: ['Kopf', 'Head', 'Tête'], SHOULDER: ['Schultern', 'Shoulders', 'Épaules'],
		BACK: ['Rücken', 'Back', 'Dos'], BREAST: ['Brust', 'Chest', 'Torse'],
		HANDS: ['Hände', 'Hands', 'Mains'], LEGS: ['Beine', 'Legs', 'Jambes'],
		FEET: ['Füße', 'Feet', 'Pieds'],
		LEFT_EAR: ['Ohrring links', 'Ear left', 'Oreille gauche'],
		RIGHT_EAR: ['Ohrring rechts', 'Ear right', 'Oreille droite'],
		NECK: ['Hals', 'Neck', 'Cou'], LEFT_WRIST: ['Armband links', 'Wrist left', 'Poignet gauche'],
		RIGHT_WRIST: ['Armband rechts', 'Wrist right', 'Poignet droit'],
		LEFT_FINGER: ['Ring links', 'Ring left', 'Bague gauche'],
		RIGHT_FINGER: ['Ring rechts', 'Ring right', 'Bague droite'],
		POCKET: ['Tasche', 'Pocket', 'Poche'],
		MAIN_MELEE: ['Haupthand', 'Main hand', 'Main principale'],
		OTHER_MELEE: ['Nebenhand', 'Off hand', 'Main secondaire'],
		RANGED: ['Fernkampf', 'Ranged', 'Distance'], TOOL: ['Werkzeug', 'Tool', 'Outil'],
		CLASS_ITEM: ['Klassengegenstand', 'Class item', 'Objet de classe'],
		BRIDLE: ['Reittier', 'Mount', 'Monture']
	};
	var SYMBOL = {
		HEAD: '♜', SHOULDER: '◆', BACK: '◩', BREAST: '⬟', HANDS: '✦', LEGS: '║', FEET: '▰',
		LEFT_EAR: '◌', RIGHT_EAR: '◌', NECK: '♢', LEFT_WRIST: '◇', RIGHT_WRIST: '◇',
		LEFT_FINGER: '○', RIGHT_FINGER: '○', POCKET: '▣',
		MAIN_MELEE: '†', OTHER_MELEE: '⬠', RANGED: '➶', TOOL: '⚒', CLASS_ITEM: '✧', BRIDLE: '⌁'
	};
	var WERT = {
		MORALE: ['Moral', 'Morale', 'Moral'], POWER: ['Kraft', 'Power', 'Énergie'],
		ARMOUR: ['Rüstung', 'Armour', 'Armure'], MIGHT: ['Macht', 'Might', 'Puissance'],
		AGILITY: ['Beweglichkeit', 'Agility', 'Agilité'], VITALITY: ['Vitalität', 'Vitality', 'Vitalité'],
		WILL: ['Willenskraft', 'Will', 'Volonté'], FATE: ['Schicksal', 'Fate', 'Destin'],
		CRITICAL_RATING: ['Kritischer Trefferwert', 'Critical rating', 'Score critique'],
		PHYSICAL_MASTERY: ['Physische Beherrschung', 'Physical mastery', 'Maîtrise physique'],
		TACTICAL_MASTERY: ['Taktische Beherrschung', 'Tactical mastery', 'Maîtrise tactique'],
		FINESSE: ['Finesse', 'Finesse', 'Finesse'], RESISTANCE: ['Widerstand', 'Resistance', 'Résistance'],
		PARRY_PERCENTAGE: ['Parieren', 'Parry', 'Parade'], EVADE: ['Ausweichen', 'Evade', 'Esquive'],
		BLOCK: ['Blocken', 'Block', 'Blocage'], ICMR: ['Moral regeneration', 'Morale regeneration', 'Régénération de moral']
	};

	function platzName(key) {
		var satz = PLATZ[key];
		if (!satz) { return key; }
		return satz[{ de: 0, en: 1, fr: 2 }[sprache] || 0];
	}
	function wertName(key) {
		var satz = WERT[key];
		if (!satz) { return key.replace(/_/g, ' ').toLowerCase(); }
		return satz[{ de: 0, en: 1, fr: 2 }[sprache] || 0];
	}
	function zahl(wert) {
		var n = Number(wert);
		if (!isFinite(n)) { return String(wert); }
		return n.toLocaleString({ de: 'de-DE', en: 'en-GB', fr: 'fr-FR' }[sprache] || 'de-DE');
	}
	function datum(stamp) {
		var n = Number(stamp);
		if (!isFinite(n) || n <= 0) { return ''; }
		var d = new Date(n);
		return d.toLocaleDateString({ de: 'de-DE', en: 'en-GB', fr: 'fr-FR' }[sprache] || 'de-DE');
	}
	/* Names may carry the client's escape for typographic quotes. */
	function sauber(name) {
		return String(name || '').replace(/\\q([^\\]*)\\q/g, '„$1“').replace(/\\/g, '').replace(/\s+/g, ' ').trim();
	}

	// --- Which set is on screen ------------------------------------------------
	var lager = 'Taschen';
	var charakter = null;
	var katalogPromise = null;
	var gewaehlterPlatz = null;
	var aktuelleAusrustung = null;

	// Die Erkennungsbasis kennt jedes Stück, auch eines ohne Quelle. Sie wird in
	// kleinen Teilen geladen: eine Teilladung trägt rund 37 Gegenstände.
	var erkennung = null;
	var erkennungTeile = {};
	var erkennungStand = {};
	var umschmieden = null;
	var skalierung = null;
	var letzterPlatz = null;

	function eigeneVersion() {
		var quelle = Array.prototype.find.call(document.scripts, function (geladen) {
			return geladen.src.indexOf('/ratgeber.js') >= 0;
		});
		var version = quelle && new URL(quelle.src).searchParams.get('v');
		return version ? '?v=' + encodeURIComponent(version) : '';
	}

	function ladeTeil(pfad) {
		if (!erkennungTeile[pfad]) {
			erkennungTeile[pfad] = new Promise(function (resolve) {
				var script = document.createElement('script');
				script.src = pfad + eigeneVersion();
				script.onload = resolve;
				// Fehlt eine Teilladung, bleibt der Platz ohne Bezugsstufe; das
				// ist besser als eine geratene Zahl.
				script.onerror = resolve;
				document.head.appendChild(script);
			});
		}
		return erkennungTeile[pfad];
	}

	/** Angaben zu einer Kennung, aus der Erkennungsbasis. */
	function ladeErkennung(ids) {
		var teile = {};
		ids.forEach(function (id) {
			if (id) { teile[id.slice(5, 8)] = true; }
		});
		var ladungen = Object.keys(teile).map(function (teil) {
			return ladeTeil('/erkennung/' + sprache + '/' + teil + '.js');
		});
		return Promise.all(ladungen).then(function () {
			erkennung = window.MQL_ERKENNUNG || {};
			var gefunden = {};
			ids.forEach(function (id) {
				if (id && erkennung[id.slice(5, 8)]) { gefunden[id] = erkennung[id.slice(5, 8)][id] || null; }
			});
			return gefunden;
		});
	}

	function ladeSkalierung() {
		if (window.MQL_SKALIERUNG) { return Promise.resolve(window.MQL_SKALIERUNG); }
		if (!skalierung) {
			skalierung = new Promise(function (resolve) {
				var script = document.createElement('script');
				script.src = '/skalierung.js' + eigeneVersion();
				script.onload = function () { resolve(window.MQL_SKALIERUNG || null); };
				script.onerror = function () { resolve(null); };
				document.head.appendChild(script);
			});
		}
		return skalierung;
	}

	/**
	 * Die Stufe, die ein Stück für diesen Charakter wirklich hat.
	 *
	 * Katalogware trägt ihre Gegenstandsstufe; skalierbare Stücke tragen die
	 * Obergrenze. Ohne die Kurve des Clients wäre „474“ bei Stufe 123 eine
	 * Behauptung von +72, wo tatsächlich 408 steht.
	 */
	function wirksameStufe(row, stufe) {
		var tabelle = window.MQL_SKALIERUNG;
		var index = row[18];
		if (!tabelle || !tabelle.kurven || index === undefined || index < 0) {
			return Number(row[7]) || 0;
		}
		var kurve = tabelle.kurven[index] || [], wert = null;
		for (var i = 0; i < kurve.length; i++) {
			if (kurve[i][0] <= stufe) { wert = kurve[i][1]; }
			else { break; }
		}
		return wert === null ? (Number(row[7]) || 0) : wert;
	}

	function ladeUmschmieden() {
		if (window.MQL_UMSCHMIEDEN) { return Promise.resolve(window.MQL_UMSCHMIEDEN); }
		if (!umschmieden) {
			umschmieden = new Promise(function (resolve) {
				var script = document.createElement('script');
				script.src = '/umschmieden.js' + eigeneVersion();
				script.onload = function () { resolve(window.MQL_UMSCHMIEDEN || null); };
				script.onerror = function () { resolve(null); };
				document.head.appendChild(script);
			});
		}
		return umschmieden;
	}

	var KATALOG_PLATZ = {
		HEAD: ['HEAD'], SHOULDER: ['SHOULDER'], BACK: ['BACK'], BREAST: ['CHEST'],
		HANDS: ['HAND'], LEGS: ['LEGS'], FEET: ['FEET'],
		LEFT_EAR: ['EAR'], RIGHT_EAR: ['EAR'], NECK: ['NECK'],
		LEFT_WRIST: ['WRIST'], RIGHT_WRIST: ['WRIST'],
		LEFT_FINGER: ['FINGER'], RIGHT_FINGER: ['FINGER'], POCKET: ['POCKET'],
		// Ein Dolch steht im Client als EITHER_HAND: er passt in beide Hände.
		MAIN_MELEE: ['MAIN_HAND', 'EITHER_HAND'],
		OTHER_MELEE: ['OFF_HAND', 'EITHER_HAND'], RANGED: ['RANGED_ITEM'],
		TOOL: ['TOOL'], CLASS_ITEM: ['CLASS_SLOT'], BRIDLE: ['BRIDLE']
	};

	function aktiverCharakter() {
		if (!speicher) { return null; }
		return speicher.aktiv() || null;
	}

	// --- Gear sheet ------------------------------------------------------------
	function zeichneSpalte(ziel, schluessel, plaetze) {
		ziel.textContent = '';
		plaetze.forEach(function (key) {
			var eintrag = (charakter.gear.slots || []).filter(function (s) { return s[0] === key; })[0];
			var knopf = document.createElement('button');
			knopf.type = 'button';
			knopf.className = 'rat-platz';
			knopf.dataset.platz = key;
			knopf.setAttribute('aria-label', platzName(key) + (eintrag && eintrag[2] ? ': ' + eintrag[2] : ''));
			if (eintrag && eintrag[1]) { knopf.classList.add('belegt'); }
			var symbol = document.createElement('span');
			symbol.className = 'rat-symbol';
			symbol.setAttribute('aria-hidden', 'true');
			symbol.textContent = SYMBOL[key] || '◇';
			knopf.appendChild(symbol);
			var name = document.createElement('span');
			name.className = 'rat-platzname';
			name.textContent = platzName(key);
			knopf.appendChild(name);
			knopf.addEventListener('click', function () { zeigePlatz(key, eintrag, knopf); });
			ziel.appendChild(knopf);
		});
	}

	function zeigePlatz(key, eintrag, knopf) {
		gewaehlterPlatz = key;
		aktuelleAusrustung = eintrag;
		letzterPlatz = {key: key, eintrag: eintrag, knopf: knopf};
		document.querySelectorAll('.rat-platz').forEach(function (b) {
			b.setAttribute('aria-pressed', String(b === knopf));
		});
		text('rat-detail-titel', platzName(key));
		text('rat-detail-text', eintrag && eintrag[2] ? sauber(eintrag[2]) : t('rat_platz_leer'));
		var werte = el('rat-detail-werte');
		werte.textContent = '';
		var muster = el('rat-detail-muster');
		muster.textContent = '';
		zeige('rat-kandidaten', false);
		text('rat-kandidaten-liste', '');
		var vorschlagsknopf = el('rat-kandidaten-knopf');
		if (vorschlagsknopf) {
			vorschlagsknopf.textContent = t('rat_kandidaten_knopf');
			vorschlagsknopf.hidden = !KATALOG_PLATZ[key];
		}
		if (!eintrag || !eintrag[1]) { return; }
		/* Die Gegenstandsstufe fehlt im Spielstand oft; sie steht dann in der
		   Erkennungsbasis. Die Herkunft wird genannt, damit keine Zahl als
		   Messwert aus dem Spiel gelesen wird, die nur ein Referenzwert ist. */
		var bezugswert = bezug(eintrag[1], eintrag, null);
		if (bezugswert.level) {
			var stufe = document.createElement('p');
			stufe.className = 'rat-quiet';
			stufe.textContent = t('rat_itemstufe') + ' ' + zahl(bezugswert.level) +
				(bezugswert.stufeQuelle === 'referenz' ? ' ' + t('rat_stufe_referenz') : '');
			werte.appendChild(stufe);
		}
		if (eintrag[4]) {
			var dps = document.createElement('p');
			dps.className = 'rat-quiet';
			dps.textContent = 'DPS ' + zahl(Math.round(Number(eintrag[4])));
			werte.appendChild(dps);
		}
		if (eintrag[6] && eintrag[6].length) {
			var kopf = document.createElement('h4');
			kopf.textContent = t('rat_werte');
			werte.appendChild(kopf);
			var liste = document.createElement('ul');
			liste.className = 'rat-werte';
			eintrag[6].forEach(function (paar) {
				var li = document.createElement('li');
				li.textContent = wertName(paar[0]) + ' +' + zahl(paar[1]);
				liste.appendChild(li);
			});
			werte.appendChild(liste);
		}
		if (eintrag[7] && eintrag[7].length) {
			var mkopf = document.createElement('h4');
			mkopf.textContent = t('rat_muster');
			muster.appendChild(mkopf);
			var mliste = document.createElement('ul');
			mliste.className = 'rat-werte';
			eintrag[7].forEach(function (paar) {
				var li = document.createElement('li');
				li.textContent = sauber(paar[0]) + (paar[1] ? ' · ' + zahl(paar[1]) : '');
				mliste.appendChild(li);
			});
			muster.appendChild(mliste);
		}
	}

	function ladeGegenstandskatalog() {
		if (window.MQL_GEGENSTAENDE) { return Promise.resolve(window.MQL_GEGENSTAENDE); }
		if (!katalogPromise) {
			katalogPromise = new Promise(function (resolve, reject) {
				var script = document.createElement('script');
				var eigeneQuelle = Array.prototype.find.call(document.scripts, function (geladen) {
					return geladen.src.indexOf('/ratgeber.js') >= 0;
				});
				var version = eigeneQuelle && new URL(eigeneQuelle.src).searchParams.get('v');
				script.src = '/gegenstaende-' + sprache + '.js' +
					(version ? '?v=' + encodeURIComponent(version) : '');
				script.onload = function () {
					if (window.MQL_GEGENSTAENDE) { resolve(window.MQL_GEGENSTAENDE); }
					else { reject(new Error('Gegenstandskatalog fehlt')); }
				};
				script.onerror = reject;
				document.head.appendChild(script);
			});
		}
		return katalogPromise;
	}

	/** Bezugsangaben eines getragenen Stücks: Spielstand, dann Referenz. */
	function bezug(id, eintrag, daten) {
		var ref = {id: id, level: 0, stufeQuelle: '', kat: '', slot: '', at: '', wt: '', sc: false};
		var erkannt = erkennungStand[id] || null;
		var zeile = daten && daten.e ? daten.e.filter(function (r) { return r[0] === id; })[0] : null;
		if (eintrag && Number(eintrag[3])) {
			ref.level = Number(eintrag[3]);
			ref.stufeQuelle = 'import';
		} else if (erkannt && Number(erkannt.l)) {
			ref.level = Number(erkannt.l);
			ref.stufeQuelle = 'referenz';
		} else if (zeile && Number(zeile[7])) {
			ref.level = Number(zeile[7]);
			ref.stufeQuelle = 'referenz';
		}
		/* Der Katalog kennt unsere sieben Gruppen (Schmuck ist dort „Geschmeide“),
		   die Erkennung die Client-Art (Schmuck steht dort unter „Sonstiges“).
		   Für den Vergleich gilt der Katalog; die Erkennung füllt nur, was fehlt. */
		if (zeile) {
			ref.kat = daten.katKey[zeile[3]] || '';
			ref.slot = zeile[5] >= 0 ? (daten.platzKey[zeile[5]] || '') : '';
			ref.at = zeile[12] || '';
			ref.wt = zeile[13] || '';
			ref.sc = !!zeile[16];
		}
		if (erkannt) {
			if (!ref.kat) { ref.kat = erkannt.kat || ''; }
			if (!ref.slot) { ref.slot = erkannt.slot || ''; }
			if (!ref.at) { ref.at = erkannt.at || ''; }
			if (!ref.wt) { ref.wt = erkannt.wt || ''; }
			ref.sc = ref.sc || !!erkannt.sc;
		}
		return ref;
	}

	var SCHMUCK_PLAETZE = ['FINGER', 'EAR', 'WRIST', 'NECK', 'POCKET'];

	/**
	 * Womit ein Stück verglichen wird.
	 *
	 * Der Client führt Schmuck unter „Sonstiges“; im Katalog ist es
	 * „Geschmeide“. Der Platz entscheidet, welche Gruppe gilt.
	 */
	function vergleichsart(ref) {
		if (['ARMOUR', 'WEAPON', 'LEGENDARY_WEAPON', 'LEGENDARY_WEAPON2'].indexOf(ref.kat) >= 0) {
			return ref.kat;
		}
		if (SCHMUCK_PLAETZE.indexOf(ref.slot) >= 0) { return 'JEWELLERY'; }
		return ref.kat || '';
	}


	/** Passt die Art des Katalogeintrags zu der des getragenen Stücks? */
	function artPasst(row, daten, ref) {
		var art = vergleichsart(ref);
		if (art === 'ARMOUR') {
			if (daten.katKey[row[3]] !== 'ARMOUR') { return false; }
			return !(ref.at && row[12] && row[12] !== ref.at);
		}
		if (art === 'WEAPON' || art === 'LEGENDARY_WEAPON' || art === 'LEGENDARY_WEAPON2') {
			return daten.katKey[row[3]] === 'WEAPON';
		}
		return !art || daten.katKey[row[3]] === art;
	}

	/** Mehrere Klassen oder Völker stehen durch Semikolon getrennt im Katalog. */
	function passtZu(wert, eigen) {
		if (!wert) { return true; }
		var eigenes = String(eigen || '').toLowerCase();
		if (!eigenes) { return false; }
		return String(wert).toLowerCase().split(/[;,]/).some(function (teil) {
			return teil.trim() === eigenes;
		});
	}

	/**
	 * Die Auswahl für einen Platz, getrennt von der Darstellung.
	 *
	 * `kandidaten` sind tragbar und besser als die Bezugsstufe. `gesperrt` sind
	 * besser, aber noch nicht tragbar – zu hohe Mindeststufe, andere Klasse oder
	 * anderes Volk. Beide Listen sind nach wirksamer Gegenstandsstufe sortiert.
	 */
	function waehleKandidaten(daten, ref, stufe, plaetze) {
		var kandidaten = [], gesperrt = [], gesehen = {}, gesehenSperr = {};
		daten.e.forEach(function (row) {
			if (row[5] < 0 || plaetze.indexOf(daten.platzKey[row[5]]) < 0) { return; }
			// Ohne Mindeststufe ist keine Tragevoraussetzung belegt: kein Vorschlag.
			if (!row[14]) { return; }
			if (!artPasst(row, daten, ref)) { return; }
			var wirksam = wirksameStufe(row, stufe);
			var eignung = window.MQL_EIGNUNG && window.MQL_EIGNUNG.zeile(row,
				{stufe: stufe, klasse: charakter.klasse || '', volk: charakter.race || ''});
			var gruende = [];
			if (row[14] && row[14] > stufe) { gruende.push(['stufe', row[14]]); }
			if (row[10] && !passtZu(row[10], charakter.klasse)) { gruende.push(['klasse', row[10]]); }
			if (row[11] && !passtZu(row[11], charakter.race)) { gruende.push(['volk', row[11]]); }
			if (!gruende.length && eignung && eignung.code === 'zu-hoch' && row[14]) {
				gruende.push(['stufe', row[14]]);
			}
			var schluessel = sauber(row[1]) + '|' + wirksam;
			if (gruende.length) {
				// Gesperrt zählt nur, wenn das Stück ohne das Hindernis besser wäre.
				if (!ref.level || wirksam <= ref.level) { return; }
				// Eine Zeile je Art, Stufe und Klasse: die Katalogfamilien
				// unterscheiden sich nur im Beinamen und würden die Liste füllen.
				var gruppe = row[6] + '|' + wirksam + '|' + (row[10] || '');
				if (gesehenSperr[gruppe]) { return; }
				gesehenSperr[gruppe] = true;
				gesperrt.push({row: row, wirksam: wirksam, gruende: gruende,
					nieTragbar: gruende.some(function (grund) { return grund[0] !== 'stufe'; })});
				return;
			}
			if (eignung && ['falsch', 'zu-hoch', 'unklar'].indexOf(eignung.code) >= 0) { return; }
			// Die Bezugsstufe entscheidet: ein Stück mit 402 schlägt keins mit 400.
			if (ref.level && wirksam <= ref.level) { return; }
			if (gesehen[schluessel]) { return; }
			gesehen[schluessel] = true;
			kandidaten.push(row);
		});
		function reihenfolge(a, b) {
			var links = a.wirksam || wirksameStufe(a, stufe);
			var rechts = b.wirksam || wirksameStufe(b, stufe);
			return rechts - links ||
				(Number((b.row || b)[14]) || 0) - (Number((a.row || a)[14]) || 0) ||
				String((a.row || a)[1]).localeCompare(String((b.row || b)[1]), sprache);
		}
		kandidaten.sort(reihenfolge);
		// Stücke einer fremden Klasse oder eines fremden Volkes passen nie; sie
		// stehen nur dann da, wenn es sonst nichts Höheres gibt.
		var spaeter = gesperrt.filter(function (eintrag) { return !eintrag.nieTragbar; });
		if (spaeter.length) { gesperrt = spaeter; }
		// Gesperrtes nach Stärke, bei Gleichstand die früher erreichbare Stufe.
		gesperrt.sort(function (a, b) {
			return b.wirksam - a.wirksam ||
				(Number(a.row[14]) || 0) - (Number(b.row[14]) || 0) ||
				String(a.row[1]).localeCompare(String(b.row[1]), sprache);
		});
		return {kandidaten: kandidaten, gesperrt: gesperrt};
	}

	/** „Höher, aber noch nicht tragbar“: was der Katalog bietet und warum es wartet. */
	function zeigeGesperrt(daten, ref, stufe) {
		var abschnitt = el('rat-kandidaten-gesperrt');
		var liste = el('rat-gesperrt-liste');
		if (!abschnitt || !liste) { return; }
		var rowUI = window.MQL_TREFFERZEILE;
		var auswahl = waehleKandidaten(daten, ref, stufe,
			KATALOG_PLATZ[gewaehlterPlatz] || []).gesperrt.slice(0, 5);
		liste.textContent = '';
		if (!auswahl.length || !rowUI) { abschnitt.hidden = true; return; }
		abschnitt.hidden = false;
		text('rat-gesperrt-titel', t('rat_gesperrt_titel'));
		text('rat-gesperrt-hinweis', t('rat_gesperrt_hinweis'));
		rowUI.header(liste, {progress: false, levelHeading: rowUI.words.itemLevel});
		auswahl.forEach(function (eintrag) {
			var row = eintrag.row, meta = [];
			eintrag.gruende.forEach(function (grund) {
				if (grund[0] === 'stufe') {
					meta.push(t('rat_mindeststufe') + ' ' + zahl(grund[1]));
				} else if (grund[0] === 'klasse') {
					meta.push(t('rat_gesperrt_klasse').replace('{klasse}', grund[1]));
				} else {
					meta.push(t('rat_gesperrt_volk').replace('{volk}', grund[1]));
				}
			});
			if (row[18] >= 0) { meta.push(t('rat_skaliert').replace('{stufe}', zahl(stufe))); }
			liste.appendChild(rowUI.row(liste, {
				href: '/' + sprache + '/gegenstand/' + row[0] + '/',
				image: row[2] || null,
				icon: 'gegenstand',
				name: sauber(row[1]),
				meta: meta.filter(Boolean).join(' · '),
				levelHeading: rowUI.words.itemLevel,
				values: [{label: rowUI.words.itemLevel, value: zahl(eintrag.wirksam)}],
				eignung: null,
				progress: null
			}));
		});
	}

	/** Legendäre Waffen vergleicht man nicht mit Katalogware, sondern über das Umschmieden. */
	function zeigeUmschmieden(ref, liste, hinweis) {
		ladeUmschmieden().then(function (tabelle) {
			if (!tabelle || !tabelle.stufen) {
				text('rat-kandidaten-titel', t('rat_umschmieden_titel'));
				text('rat-kandidaten-hinweis', t('rat_umschmieden_keins'));
				return;
			}
			var naechste = null;
			for (var i = 0; i < tabelle.stufen.length; i++) {
				var punkt = tabelle.stufen[i];
				if (punkt[1] > (ref.level || 0)) { naechste = punkt; break; }
			}
			text('rat-kandidaten-titel', t('rat_umschmieden_titel'));
			if (!naechste) {
				text('rat-kandidaten-hinweis', t('rat_umschmieden_keins'));
				return;
			}
			text('rat-kandidaten-hinweis', t('rat_umschmieden_text')
				.replace('{stufe}', zahl(naechste[0])).replace('{il}', zahl(naechste[1])));
			liste.textContent = '';
		});
	}

	function zeigeKandidaten() {
		var bereich = el('rat-kandidaten');
		var liste = el('rat-kandidaten-liste');
		if (!bereich || !liste || !gewaehlterPlatz || !charakter) { return; }
		bereich.hidden = false;
		text('rat-kandidaten-hinweis', t('rat_kandidaten_laden'));
		liste.textContent = '';
		var gesperrt = el('rat-kandidaten-gesperrt');
		if (gesperrt) { gesperrt.hidden = true; }
		var aktuell = aktuelleAusrustung;
		Promise.all([ladeGegenstandskatalog(), ladeSkalierung()]).then(function (geladen) {
			var daten = geladen[0];
			/* The full catalogue loads only after the player asks for candidates. */
			if (!bereich.isConnected || bereich.hidden || !charakter) { return; }
			var ref = bezug(aktuell && aktuell[1], aktuell, daten);
			var stufe = Number(charakter.level) || 0;
			if (ref.kat === 'LEGENDARY_WEAPON' || ref.kat === 'LEGENDARY_WEAPON2') {
				text('rat-kandidaten-titel', t('rat_umschmieden_titel'));
				zeigeUmschmieden(ref, liste, 'rat-kandidaten-hinweis');
				// Höhere Katalogware gibt es trotzdem; sie wird genannt, nicht verschwiegen.
				zeigeGesperrt(daten, ref, stufe);
				return;
			}
			text('rat-kandidaten-titel', t(ref.level
				? 'rat_kandidaten_titel' : 'rat_kandidaten_titel_platz'));
			var erlaubtePlaetze = KATALOG_PLATZ[gewaehlterPlatz] || [];
			var kandidaten = waehleKandidaten(daten, ref, stufe, erlaubtePlaetze).kandidaten;
			var gesamt = kandidaten.length;
			kandidaten = kandidaten.slice(0, 8);
			/* Die Zeilen kommen aus demselben Baustein wie jede andere Liste:
			 * Symbolkachel, Name, Meta-Zeile, Stufenspalte, Eignungs-Chip. */
			var rowUI = window.MQL_TREFFERZEILE;
			liste.textContent = '';
			if (!kandidaten.length) {
				text('rat-kandidaten-anzahl', '');
				text('rat-kandidaten-hinweis', t(!ref.level ? 'rat_kandidaten_ohne_stand'
					: (ref.stufeQuelle === 'import' ? 'rat_kandidaten_ohne' : 'rat_kandidaten_ohne_ref')));
				// Auch ohne Vorschlag bleibt sichtbar, was der Katalog Höheres hat.
				zeigeGesperrt(daten, ref, stufe);
				return;
			}
			text('rat-kandidaten-hinweis', t(ref.level ? 'rat_kandidaten_hinweis'
				: 'rat_kandidaten_ohne_vergleich'));
			zeigeGesperrt(daten, ref, stufe);
			text('rat-kandidaten-anzahl', t('rat_kandidaten_anzahl')
				.replace('{gezeigt}', zahl(kandidaten.length))
				.replace('{gesamt}', zahl(gesamt)));
			if (!rowUI) { return; }
			rowUI.header(liste, {progress: false, levelHeading: rowUI.words.itemLevel});
			kandidaten.forEach(function (row) {
				var wirksam = wirksameStufe(row, stufe);
				var meta = [];
				// Art bzw. Gattung aus den Beschriftungen des Katalogs.
				if (row[6] >= 0 && daten.art[row[6]]) { meta.push(daten.art[row[6]]); }
				if (row[9] >= 0 && daten.gattung[row[9]]) { meta.push(daten.gattung[row[9]]); }
				if (row[4]) { meta.push(t('gs_qual_' + row[4])); }
				if (row[18] >= 0) { meta.push(t('rat_skaliert').replace('{stufe}', zahl(stufe))); }
				if (row[14]) { meta.push(t('rat_mindeststufe') + ' ' + zahl(row[14])); }
				if (ref.level && wirksam > ref.level) {
					meta.push('+' + zahl(wirksam - ref.level) + ' ' + t('rat_zur_bezugsstufe'));
				}
				/* Kein Eignungs-Chip: er misst den Abstand der Mindeststufe und würde
				 * ein skaliertes Stück mit Stufe 411 als „überholt“ beschriften,
				 * obwohl es die Bezugsstufe schlägt. Hier zählt die Stufe. */
				liste.appendChild(rowUI.row(liste, {
					href: '/' + sprache + '/gegenstand/' + row[0] + '/',
					image: row[2] || null,
					icon: 'gegenstand',
					name: sauber(row[1]),
					meta: meta.filter(Boolean).join(' · '),
					levelHeading: rowUI.words.itemLevel,
					values: [{label: rowUI.words.itemLevel, value: zahl(wirksam)}],
					eignung: null,
					progress: null
				}));
			});
		}).catch(function () {
			text('rat-kandidaten-hinweis', t('rat_kandidaten_ohne_stand'));
		});
	}

	function zeichneAusruestung() {
		var vorhanden = !!(charakter && charakter.gear && charakter.gear.slots && charakter.gear.slots.length);
		zeige('rat-blatt', vorhanden);
		zeige('rat-gear-hinweis', !vorhanden);
		if (!vorhanden) { text('rat-gear-hinweis', t('rat_nicht_importiert')); return; }
		zeichneSpalte(el('rat-spalte-links'), 'links', LINKS);
		zeichneSpalte(el('rat-spalte-rechts'), 'rechts', RECHTS);
		zeichneSpalte(el('rat-spalte-unten'), 'unten', UNTEN);
		var erster = document.querySelector('.rat-platz');
		if (erster) { erster.click(); }
		/* Angaben zu den getragenen Stücken kommen aus der Erkennungsbasis, in
		   Teilladungen und erst nach dem ersten Bild. */
		var ids = (charakter.gear.slots || []).map(function (z) { return z[1]; }).filter(Boolean);
		if (!ids.length) { return; }
		ladeErkennung(ids).then(function (gefunden) {
			erkennungStand = gefunden || {};
			if (letzterPlatz) { zeigePlatz(letzterPlatz.key, letzterPlatz.eintrag, letzterPlatz.knopf); }
		});
	}

	// --- Bags and vault --------------------------------------------------------
	/* Both sets are stored compactly and differently: a bag row is
	   [id, name, count, bound], a vault row [chest, id, name, count]. The page
	   works on one shape, so the difference stays in this one place. */
	function lagerDaten() {
		if (lager === 'Taschen' && charakter.bags) {
			return { reihen: (charakter.bags.items || []).map(function (z) {
					return { fach: '', id: z[0], name: z[1], anzahl: z[2], bound: z[3] };
				}), max: charakter.bags.max };
		}
		if (lager === 'Bank' && charakter.bank) {
			return { reihen: (charakter.bank.chests || []).map(function (z) {
					return { fach: z[0], id: z[1], name: z[2], anzahl: z[3], bound: null };
				}), max: charakter.bank.max };
		}
		return null;
	}

	function zeichneLager() {
		var knoepfe = el('rat-lager');
		knoepfe.textContent = '';
		[['Taschen', 'rat_taschen'], ['Bank', 'rat_bank'], ['Gemeinsam', 'rat_gemeinsam']].forEach(function (paar) {
			var b = document.createElement('button');
			b.type = 'button';
			b.className = 'rat-lagerknopf';
			b.textContent = t(paar[1]);
			b.setAttribute('aria-pressed', String(lager === paar[0]));
			b.addEventListener('click', function () { lager = paar[0]; zeichneLager(); });
			knoepfe.appendChild(b);
		});
		var daten = lagerDaten();
		var hinweis = '';
		if (lager === 'Gemeinsam') {
			hinweis = t('rat_gemeinsam_nicht');
		} else if (lager === 'Bank' && !charakter.importMeta.bank) {
			hinweis = t('rat_bank_nicht');
		} else if (lager === 'Taschen' && !charakter.importMeta.bags) {
			hinweis = t('rat_taschen_nicht');
		} else if (daten && !daten.reihen.length) {
			hinweis = lager === 'Bank' ? t('rat_bank_leer') : t('rat_taschen_leer');
		}
		text('rat-lager-hinweis', hinweis);
		zeige('rat-lager-hinweis', !!hinweis);
		zeichneListe();
	}

	function zeichneListe() {
		var ziel = el('rat-liste');
		ziel.textContent = '';
		var suchfeld = el('rat-suche-feld');
		var begriff = (suchfeld && suchfeld.value || '').trim().toLowerCase();
		var daten = lagerDaten();
		var reihen = daten ? daten.reihen.slice() : [];
		if (begriff) {
			reihen = reihen.filter(function (r) { return sauber(r.name).toLowerCase().indexOf(begriff) >= 0
				|| String(r.id).toLowerCase().indexOf(begriff) >= 0; });
		}
		reihen.sort(function (a, b) { return sauber(a.name).localeCompare(sauber(b.name), sprache); });
		text('rat-treffer', reihen.length
			? zahl(reihen.length) + ' ' + (reihen.length === 1 ? t('rat_treffer') : t('rat_treffer_mehr'))
			: '');
		zeige('rat-leer', !!begriff && !reihen.length);
		text('rat-leer', t('rat_kein_treffer'));
		reihen.slice(0, 400).forEach(function (r) {
			var li = document.createElement('li');
			li.className = 'rat-stueck';
			var symbol = document.createElement('span');
			symbol.className = 'rat-symbol rat-symbol-klein';
			symbol.setAttribute('aria-hidden', 'true');
			symbol.textContent = '▣';
			li.appendChild(symbol);
			var name = document.createElement('span');
			name.className = 'rat-stueckname';
			name.textContent = sauber(r.name);
			li.appendChild(name);
			var extra = [];
			if (r.fach) { extra.push(r.fach); }
			if (Number(r.anzahl) > 1) { extra.push(t('rat_menge') + ' ' + zahl(r.anzahl)); }
			var klein = document.createElement('span');
			klein.className = 'rat-quiet';
			klein.textContent = extra.join(' · ');
			li.appendChild(klein);
			ziel.appendChild(li);
		});
	}

	// --- Page ------------------------------------------------------------------
	/* Companion stores class and race as keys ("Hunter", "hobbit"); the client
	   names live in klassen-<sprache>.js. A key without a translation stays. */
	function eigenname(art, key) {
		var daten = window.MQL_KLASSEN;
		if (!daten || !key) { return key || ''; }
		var satz = daten[art] && daten[art][key];
		return satz && satz.names ? (satz.names[sprache] || satz.names.en || key) : key;
	}
	function kurz() {
		var klasse = eigenname('classes', charakter.klasse);
		var volk = eigenname('races', charakter.race);
		return [klasse, volk].filter(Boolean).join(' · ');
	}

	function zeichne() {
		charakter = aktiverCharakter();
		text('rat-titel', t('rat_titel'));
		text('rat-einleitung', t('rat_einleitung'));
		text('rat-ohne-text', t('rat_ohne'));
		var knopf = el('rat-import');
		if (knopf) { knopf.textContent = t('rat_ohne_knopf'); }
		if (!charakter) {
			zeige('rat-ohne', true);
			zeige('rat-inhalt', false);
			return;
		}
		zeige('rat-ohne', false);
		zeige('rat-inhalt', true);
		text('rat-name', [charakter.name, charakter.server].filter(Boolean).join(' · '));
		text('rat-klasse', [kurz(), charakter.level ? t('stufe') + ' ' + charakter.level : ''].filter(Boolean).join(' · '));
		var staende = [];
		if (charakter.date) { staende.push(charakter.date); }
		if (charakter.gear && charakter.gear.stamp) { staende.push(t('rat_stand') + ' ' + datum(charakter.gear.stamp)); }
		text('rat-stand', staende.join(' · '));
		text('rat-lokal', t('rat_hinweis_lokal'));
		text('rat-weiter-titel', t('rat_weiter_titel'));
		text('rat-weiter-text', t('rat_weiter_text'));
		text('rat-wege-epik', t('rat_weiter_epik'));
		text('rat-wege-epik-text', t('rat_weiter_epik_text'));
		text('rat-wege-taten', t('rat_weiter_taten'));
		text('rat-wege-taten-text', t('rat_weiter_taten_text'));
		text('rat-wege-aufgaben', t('rat_weiter_aufgaben'));
		text('rat-wege-aufgaben-text', t('rat_weiter_aufgaben_text'));
		text('rat-weiter-offen', t('rat_weiter_offen'));
		var label = el('rat-suche-label');
		if (label) { label.textContent = t('rat_suche'); }
		if (el('rat-suche-feld')) { el('rat-suche-feld').placeholder = t('rat_suche'); }
		zeichneAusruestung();
		zeichneLager();
		montiereReiter();
	}

	/* The shared tab bar: one panel visible, the rest hidden. */
	function montiereReiter() {
		var leiste = document.querySelector('.llb-reiter');
		if (!leiste || !window.MQL_REITER) { return; }
		window.MQL_REITER.mount(leiste, {
			onShow: function (wahl) {
				document.querySelectorAll('.rat-flaeche').forEach(function (p) {
					p.hidden = p.id !== 'rat-panel-' + wahl;
				});
			}
		});
	}

	function start() {
		zeichne();
		var vorschlagsknopf = el('rat-kandidaten-knopf');
		if (vorschlagsknopf) { vorschlagsknopf.addEventListener('click', zeigeKandidaten); }
		var feld = el('rat-suche-feld');
		if (feld) { feld.addEventListener('input', zeichneListe); }
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', start);
	} else {
		start();
	}
})();
