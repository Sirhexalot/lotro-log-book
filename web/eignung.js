/* Eignung eines Gegenstands für den importierten Charakter.
 *
 * Der Name trägt die Seltenheitsfarbe wie im Spiel. Die Eignung bekommt eine
 * eigene Kodierung als Chip neben der Zahl ("Passt", "Überholt", "Nicht für
 * dich", "Unklar" …). Die Stufe selbst bleibt neutral; sie ist Stärke, nicht
 * Tragevoraussetzung. Bezug ist immer die Mindeststufe: ein Stufe-123-Charakter
 * trägt Mindeststufe 120 bei Gegenstandsstufe 388.
 *
 * Regeln (22.11.2026 mit dem Nutzer festgelegt):
 *   grün    Abstand 0–10 Stufen        gelb   11–14        grau   ab 15
 *   rot     falsche Klasse/Rüstung/Waffe/Volk oder Mindeststufe zu hoch
 *   "Passt, aber prüfen" nur bei Grün: weitere Voraussetzung oder unbekannte Klasse
 *   "Unklar": keine Mindeststufe, über der Spielgrenze, skalierbar über dir
 */
(function () {
	'use strict';

	var SPRACHE = window.MQL_SPRACHE || document.documentElement.lang || 'de';
	var PROF = window.MQL_KLASSEN_PROFICIENCY || {};
	/* Höchste Stufe im Spiel; darüber steht nichts Erreichbares im Katalog. */
	var SPIELGRENZE = 160;
	var GRUEN_BIS = 10;
	var GRAU_AB = 15;

	var W = {
		de: {
			passt: 'passt zu Stufe {stufe}', achtung: 'Voraussetzung prüfen',
			klasseUnbekannt: 'Klasse unbekannt', aelter: '{abstand} Stufen älter',
			ueberholt: '{abstand} Stufen überholt', zuHoch: '{n} Stufen zu hoch',
			nurKlasse: 'nur für {klassen}', volk: 'Volk passt nicht',
			ruestung: 'Rüstungsart passt nicht', waffe: 'Waffenart passt nicht',
			ohne: 'keine Mindeststufe', grenze: 'über der Spielgrenze',
			skaliert: 'Stufe unklar',
			titelPasst: 'Mindeststufe {ml} · passt zu Stufe {stufe}',
			titelAchtung: 'Mindeststufe {ml} · weitere Voraussetzung (Ruf, Tugend, Effekt oder Handwerk)',
			titelKlasseUnbekannt: 'Der Import nennt keine Klasse; geprüft ist nur die Stufe.',
			titelFalschKlasse: 'Mindeststufe {ml} · deine Klasse darf den Gegenstand nicht tragen',
			titelFalschRuestung: 'Mindeststufe {ml} · deine Klasse trägt diese Rüstungsart nicht',
			titelFalschWaffe: 'Mindeststufe {ml} · deine Klasse führt diese Waffenart nicht',
			titelZuHoch: 'Mindeststufe {ml} · dein Charakter ist Stufe {stufe}',
			titelStufe: 'Mindeststufe {ml} · {text}',
			titelFalschVolk: 'Mindeststufe {ml} · dein Volk darf den Gegenstand nicht tragen',
			titelOhne: 'Der Katalog nennt keine Mindeststufe.',
			titelGrenze: 'Mindeststufe {ml} liegt über der höchsten Spielstufe {grenze}.',
			titelSkaliert: 'Skalierbarer Gegenstand; die passende Ausbaustufe fehlt im Katalog.',
			chipPasst: 'Passt', chipAchtung: 'Passt, aber prüfen', chipAelter: 'Älter',
			chipUeberholt: 'Überholt', chipZuHoch: 'Zu hoch', chipFalsch: 'Nicht für dich',
			chipUnklar: 'Unklar'
		},
		en: {
			passt: 'fits level {stufe}', achtung: 'check requirement',
			klasseUnbekannt: 'class unknown', aelter: '{abstand} levels older',
			ueberholt: '{abstand} levels outdated', zuHoch: '{n} levels too high',
			nurKlasse: 'only for {klassen}', volk: 'wrong race',
			ruestung: 'armour type not available', waffe: 'weapon type not available',
			ohne: 'no minimum level', grenze: 'above the game’s level cap',
			skaliert: 'level unclear',
			titelPasst: 'Minimum level {ml} · fits level {stufe}',
			titelAchtung: 'Minimum level {ml} · further requirement (reputation, virtue, effect or craft)',
			titelKlasseUnbekannt: 'The import names no class; only the level is checked.',
			titelFalschKlasse: 'Minimum level {ml} · your class cannot wear this',
			titelFalschRuestung: 'Minimum level {ml} · your class does not use this armour type',
			titelFalschWaffe: 'Minimum level {ml} · your class does not use this weapon type',
			titelZuHoch: 'Minimum level {ml} · your character is level {stufe}',
			titelStufe: 'Minimum level {ml} · {text}',
			titelFalschVolk: 'Minimum level {ml} · your race cannot wear this',
			titelOhne: 'The catalogue names no minimum level.',
			titelGrenze: 'Minimum level {ml} is above the game’s highest level {grenze}.',
			titelSkaliert: 'Scalable item; the matching scale step is missing from the catalogue.',
			chipPasst: 'Fits', chipAchtung: 'Fits, check', chipAelter: 'Older',
			chipUeberholt: 'Outdated', chipZuHoch: 'Too high', chipFalsch: 'Not for you',
			chipUnklar: 'Unclear'
		},
		fr: {
			passt: 'convient au niveau {stufe}', achtung: 'vérifier la condition',
			klasseUnbekannt: 'classe inconnue', aelter: '{abstand} niveaux de moins',
			ueberholt: '{abstand} niveaux dépassés', zuHoch: '{n} niveaux de trop',
			nurKlasse: 'seulement pour {klassen}', volk: 'race incompatible',
			ruestung: 'type d’armure indisponible', waffe: 'type d’arme indisponible',
			ohne: 'aucun niveau minimum', grenze: 'au-delà du niveau maximal',
			skaliert: 'niveau incertain',
			titelPasst: 'Niveau minimum {ml} · convient au niveau {stufe}',
			titelAchtung: 'Niveau minimum {ml} · condition supplémentaire (réputation, vertu, effet ou métier)',
			titelKlasseUnbekannt: 'L’import n’indique aucune classe ; seul le niveau est vérifié.',
			titelFalschKlasse: 'Niveau minimum {ml} · votre classe ne peut pas le porter',
			titelFalschRuestung: 'Niveau minimum {ml} · votre classe n’utilise pas ce type d’armure',
			titelFalschWaffe: 'Niveau minimum {ml} · votre classe n’utilise pas ce type d’arme',
			titelZuHoch: 'Niveau minimum {ml} · votre personnage est niveau {stufe}',
			titelStufe: 'Niveau minimum {ml} · {text}',
			titelFalschVolk: 'Niveau minimum {ml} · votre race ne peut pas le porter',
			titelOhne: 'Le catalogue n’indique aucun niveau minimum.',
			titelGrenze: 'Le niveau minimum {ml} dépasse le niveau maximal {grenze}.',
			titelSkaliert: 'Objet évolutif ; le palier correspondant manque au catalogue.',
			chipPasst: 'Convient', chipAchtung: 'Convient, à vérifier', chipAelter: 'Ancien',
			chipUeberholt: 'Dépassé', chipZuHoch: 'Trop haut', chipFalsch: 'Pas pour vous',
			chipUnklar: 'Incertain'
		}
	};
	var w = W[SPRACHE] || W.de;

	function fuellen(text, werte) {
		return String(text).replace(/\{([a-z]+)\}/g, function (ganz, name) {
			var wert = werte[name];
			return wert === undefined || wert === null ? ganz : String(wert);
		});
	}
	function klassenName(schluessel) {
		var eintrag = PROF[schluessel];
		var namen = eintrag && eintrag.n;
		return (namen && (namen[SPRACHE] || namen.en)) || schluessel;
	}
	function erlaubt(tabelle, art, stufe) {
		var lernstufe = tabelle && tabelle[art];
		return !!lernstufe && lernstufe <= stufe;
	}
	function zahl(wert) {
		var n = Number(wert);
		return isFinite(n) && n > 0 ? Math.floor(n) : 0;
	}

	/** Der importierte Charakter, oder null. Ohne Stufe gibt es keine Eignung. */
	function charakter() {
		var speicher = window.MQL_SPEICHER;
		var eintrag = speicher && speicher.aktiv && speicher.aktiv();
		if (!eintrag) { return null; }
		var stufe = zahl(eintrag.level);
		if (!stufe) { return null; }
		return {stufe: stufe, klasse: String(eintrag.klasse || ''), volk: String(eintrag.race || '')};
	}

	var CHIP = {
		'passt': 'chipPasst', 'achtung': 'chipAchtung', 'aelter': 'chipAelter',
		'ueberholt': 'chipUeberholt', 'zu-hoch': 'chipZuHoch', 'falsch': 'chipFalsch',
		'unklar': 'chipUnklar'
	};
	function ergebnis(code, grund, texte, titel) {
		return {code: code, grund: grund, text: texte || '', title: titel || '',
			label: w[CHIP[code]] || ''};
	}

	/**
	 * Zwei Schreibweisen, eine Prüfung: der Katalog und die Generatoren tragen
	 * kurze Schlüssel (ml, rk, at …), die PHP-Seiten liefern sprechende
	 * (min, klasse, armour …).
	 */
	function normalisiere(req) {
		/* PHP encodes an empty requirements set as `[]`; an array would also
		 * answer `req.at` with Array.prototype.at. */
		if (!req || typeof req !== 'object' || Array.isArray(req)) { return {}; }
		if (req.ml !== undefined || req.rk !== undefined || req.at !== undefined ||
			req.wt !== undefined || req.ex !== undefined || req.sc !== undefined) {
			return req;
		}
		if (req.min === undefined && req.klasse === undefined && req.armour === undefined) {
			return req;
		}
		return {ml: req.min, rk: req.klasse, rr: req.volk, at: req.armour,
			wt: req.waffe, ex: req.extra, sc: req.scalable};
	}

	/**
	 * Voraussetzungen eines Gegenstands gegen einen Charakter.
	 * Liefert null, wenn kein Charakter da ist: dann bleibt die Stufe ungefärbt.
	 */
	function ton(req, ch) {
		if (!ch) { return null; }
		req = normalisiere(req);
		var ml = zahl(req.ml);
		if (!ml) {
			/* Nothing known at all is no state to show: loot containers, virtue
			 * tokens and other non-equipment simply carry no requirement. */
			if (!req.rk && !req.rr && !req.at && !req.wt) { return null; }
			return ergebnis('unklar', 'ohne', w.ohne, w.titelOhne);
		}
		if (ml > SPIELGRENZE) {
			return ergebnis('unklar', 'grenze', w.grenze,
				fuellen(w.titelGrenze, {ml: ml, grenze: SPIELGRENZE}));
		}
		if (req.rk) {
			var klassen = String(req.rk).split(';').filter(Boolean);
			if (klassen.length && ch.klasse && klassen.indexOf(ch.klasse) < 0) {
				var namen = klassen.map(klassenName).join(', ');
				return ergebnis('falsch', 'klasse', fuellen(w.nurKlasse, {klassen: namen}),
					fuellen(w.titelFalschKlasse, {ml: ml}));
			}
		}
		if (req.rr && ch.volk && String(req.rr).toLowerCase() !== ch.volk.toLowerCase()) {
			return ergebnis('falsch', 'volk', w.volk, fuellen(w.titelFalschVolk, {ml: ml}));
		}
		var prof = PROF[ch.klasse];
		if (prof && req.at && !erlaubt(prof.a, req.at, ch.stufe)) {
			return ergebnis('falsch', 'ruestung', w.ruestung,
				fuellen(w.titelFalschRuestung, {ml: ml}));
		}
		if (prof && req.wt && !erlaubt(prof.w, req.wt, ch.stufe)) {
			return ergebnis('falsch', 'waffe', w.waffe,
				fuellen(w.titelFalschWaffe, {ml: ml}));
		}
		/* Erst die harten Sperren, dann die Skalierung: ein Gegenstand für eine
		 * fremde Klasse bleibt „nicht für dich“, auch wenn er über dir skaliert. */
		if (req.sc && ml > ch.stufe) {
			return ergebnis('unklar', 'skaliert', w.skaliert, w.titelSkaliert);
		}
		if (ml > ch.stufe) {
			return ergebnis('zu-hoch', '', fuellen(w.zuHoch, {n: ml - ch.stufe}),
				fuellen(w.titelZuHoch, {ml: ml, stufe: ch.stufe}));
		}
		var abstand = ch.stufe - ml;
		var code = abstand <= GRUEN_BIS ? 'passt' : abstand < GRAU_AB ? 'aelter' : 'ueberholt';
		if (code === 'passt') {
			if (req.ex) {
				return ergebnis('achtung', 'voraussetzung', w.achtung,
					fuellen(w.titelAchtung, {ml: ml}));
			}
			if (!ch.klasse) {
				return ergebnis('achtung', 'klasse-unbekannt', w.klasseUnbekannt,
					w.titelKlasseUnbekannt);
			}
			return ergebnis('passt', '', fuellen(w.passt, {stufe: ch.stufe}),
				fuellen(w.titelPasst, {ml: ml, stufe: ch.stufe}));
		}
		var text = fuellen(code === 'aelter' ? w.aelter : w.ueberholt, {abstand: abstand});
		return ergebnis(code, '', text, fuellen(w.titelStufe, {ml: ml, text: text}));
	}

	/** Voraussetzungen aus einer Zeile des Gegenstandskatalogs (Position 10–16). */
	function zeile(row, ch) {
		if (!row) { return null; }
		return ton({
			ml: row[14], rk: row[10], rr: row[11], at: row[12], wt: row[13],
			ex: row[15] ? 1 : 0, sc: row[16] ? 1 : 0
		}, ch);
	}

	function anforderungen(el) {
		return {
			ml: Number(el.getAttribute('data-eignung-min')) || 0,
			rk: el.getAttribute('data-eignung-klasse') || '',
			rr: el.getAttribute('data-eignung-volk') || '',
			at: el.getAttribute('data-eignung-armour') || '',
			wt: el.getAttribute('data-eignung-waffe') || '',
			ex: el.getAttribute('data-eignung-extra') === '1' ? 1 : 0,
			sc: el.getAttribute('data-eignung-scalable') === '1' ? 1 : 0
		};
	}

	/** Der Zustand als Chip: das Wort trägt die Aussage, die Farbe nur den Ton. */
	function chip(eignung) {
		var el = document.createElement('span');
		el.className = 'eignung-chip';
		if (!eignung) { return el; }
		el.setAttribute('data-eignung', eignung.code);
		if (eignung.title) { el.setAttribute('title', eignung.title); }
		el.textContent = eignung.label;
		return el;
	}

	/**
	 * Setzt den Chip neben eine serverseitig gerenderte Stufe oder in eine Gabe.
	 * Die Stufe selbst bleibt neutral: sie ist Stärke, nicht Tragevoraussetzung.
	 */
	function lege(el, req, ch) {
		if (!el || el.__eignungChip) { return null; }
		var eignung = ton(req, ch || charakter());
		if (!eignung) { return null; }
		var marke = chip(eignung);
		var eltern = el.parentNode;
		if (!eltern) { return null; }
		if (el.classList && el.classList.contains('katalog-gabe')) {
			el.appendChild(document.createTextNode(' '));
			el.appendChild(marke);
		} else if (eltern.classList && eltern.classList.contains('katalog-metazeile')) {
			/* A meta line joins its parts with " · ": the chip goes in front of
			 * the level and brings the separator with it. */
			eltern.insertBefore(marke, el);
			eltern.insertBefore(document.createTextNode(' · '), el);
		} else if (eltern.classList && eltern.classList.contains('set-card-meta')) {
			eltern.appendChild(document.createTextNode(' '));
			eltern.appendChild(marke);
		} else {
			eltern.insertBefore(marke, el.nextSibling);
			eltern.insertBefore(document.createTextNode(' '), marke);
		}
		el.__eignungChip = marke;
		return eignung;
	}

	/** Alle Elemente mit Datenattributen bekommen ihren Chip; auch später geladene. */
	function faerbeSeite(wurzel) {
		var ch = charakter();
		(wurzel || document).querySelectorAll('[data-eignung-min]').forEach(function (el) {
			lege(el, anforderungen(el), ch);
		});
	}

	window.MQL_EIGNUNG = {
		grenzen: {gruen: GRUEN_BIS, grau: GRAU_AB, spiel: SPIELGRENZE},
		woerter: w,
		charakter: charakter,
		ton: ton,
		zeile: zeile,
		lege: lege,
		faerbeSeite: faerbeSeite,
		chip: chip
	};

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', function () { faerbeSeite(); });
	} else {
		faerbeSeite();
	}
})();
