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
 *   "Unklar": keine Mindeststufe oder über der Spielgrenze
 */
(function () {
	'use strict';

	var SPRACHE = window.MQL_SPRACHE || document.documentElement.lang || 'de';
	var PROF = window.MQL_KLASSEN_PROFICIENCY || {};
	/* Höchste Stufe im Spiel; darüber steht nichts Erreichbares im Katalog. */
	var SPIELGRENZE = 160;
	var GRUEN_BIS = 10;
	var GRAU_AB = 15;
	/* Was „jetzt tragbar“ heißt, entscheidet das Set-Urteil (teile()). */
	var IST_JETZT = {passt: 1, achtung: 1, aelter: 1, ueberholt: 1};
	var TEIL_GRUND = {volk: 'teilVolk', ruestung: 'teilRuestung', waffe: 'teilWaffe'};

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
			chipUnklar: 'Unklar',
			teil: 'Passt · {n} von {m}', teilTitel: '{n} von {m} Teilen passen jetzt · {grund}',
			alle: 'Alle {m} Teile passen zu Stufe {stufe}',
			alleAchtung: 'Alle {m} Teile tragbar · weitere Voraussetzung (Ruf, Tugend, Effekt oder Handwerk)',
			alleStufe: 'Alle {m} Teile tragbar · {text}',
			zuHochAlle: 'Kein Teil jetzt tragbar · {grund}',
			keinTeil: 'Kein Teil für deine Klasse oder Rüstungsart · {grund}',
			stueckTeil: 'Teil', stueckTeile: 'Teile', abStufe: 'ab Stufe {ml}',
			stufeUnklar: 'Stufe unklar', mitVoraussetzung: 'mit weiterer Voraussetzung',
			teilVolk: 'nicht für dein Volk',
			teilRuestung: 'in einer Rüstungsart, die deine Klasse nicht trägt',
			teilWaffe: 'mit einer Waffenart, die deine Klasse nicht führt',
			teilAllgemein: 'nicht tragbar',
			teileSkaliert: 'Die Teile skalieren über deiner Stufe; ihr Wert ist hier nicht bestimmbar.'
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
			chipUnklar: 'Unclear',
			teil: 'Fits · {n} of {m}', teilTitel: '{n} of {m} pieces fit now · {grund}',
			alle: 'All {m} pieces fit level {stufe}',
			alleAchtung: 'All {m} pieces wearable · further requirement (reputation, virtue, effect or craft)',
			alleStufe: 'All {m} pieces wearable · {text}',
			zuHochAlle: 'No piece wearable yet · {grund}',
			keinTeil: 'No piece for your class or armour type · {grund}',
			stueckTeil: 'piece', stueckTeile: 'pieces', abStufe: 'from level {ml}',
			stufeUnklar: 'level unclear', mitVoraussetzung: 'with a further requirement',
			teilVolk: 'not for your race',
			teilRuestung: 'in an armour type your class does not wear',
			teilWaffe: 'with a weapon type your class does not use',
			teilAllgemein: 'not wearable',
			teileSkaliert: 'The pieces scale above your level; their value cannot be judged here.'
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
			chipUnklar: 'Incertain',
			teil: 'Convient · {n} sur {m}', teilTitel: '{n} pièces sur {m} conviennent maintenant · {grund}',
			alle: 'Les {m} pièces conviennent au niveau {stufe}',
			alleAchtung: 'Les {m} pièces portables · condition supplémentaire (réputation, vertu, effet ou métier)',
			alleStufe: 'Les {m} pièces portables · {text}',
			zuHochAlle: 'Aucune pièce portable pour l’instant · {grund}',
			keinTeil: 'Aucune pièce pour votre classe ou type d’armure · {grund}',
			stueckTeil: 'pièce', stueckTeile: 'pièces', abStufe: 'à partir du niveau {ml}',
			stufeUnklar: 'niveau incertain', mitVoraussetzung: 'avec une condition supplémentaire',
			teilVolk: 'pas pour votre race',
			teilRuestung: 'd’un type d’armure que votre classe ne porte pas',
			teilWaffe: 'd’un type d’arme que votre classe n’utilise pas',
			teilAllgemein: 'non portable',
			teileSkaliert: 'Les pièces évoluent au-dessus de votre niveau ; leur valeur ne peut pas être déterminée ici.'
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

	/**
	 * Eignung eines ganzen Sets aus seinen Setteilen.
	 *
	 * Die Teile tragen eigene Anforderungen (Gruppe wie in
	 * `tools/eignung_teile.py`: Mindeststufe, Klasse, Volk, Rüstungs- und
	 * Waffenart, weitere Voraussetzung, skalierbar, Anzahl). Ein einzelnes Wort
	 * wäre bei einem Set gelogen: Es kann halb tragbar sein. Deshalb nennt der
	 * Chip Wort und Anteil („Passt · 3 von 6“), und die Farbe folgt dem, was
	 * jetzt geht — grün, sobald mindestens ein Teil passt, rot nur, wenn kein
	 * Teil jetzt tragbar ist.
	 *
	 * Regeln (22.11.2026 mit dem Nutzer festgelegt):
	 *   alle Teile tragbar   Wort des stärksten Teils (Passt / Älter / Überholt)
	 *   einige tragbar       „Passt · n von m“, Tooltip nennt die fehlenden
	 *   kein Teil tragbar    „Zu hoch“ (nur Stufe) vor „Nicht für dich“ (Klasse)
	 *   nur skalierbar       „Unklar“
	 */
	function teile(liste, ch) {
		if (!Array.isArray(liste) || !liste.length || !ch) { return null; }
		var gruppen = [], gesamt = 0, jetzt = 0;
		liste.forEach(function (eintrag) {
			var anzahl = Math.max(1, Math.round(Number(eintrag[7]) || 1));
			var eignung = ton({ml: eintrag[0], rk: eintrag[1], rr: eintrag[2],
				at: eintrag[3], wt: eintrag[4], ex: eintrag[5], sc: eintrag[6]}, ch);
			if (!eignung) { return; }
			gesamt += anzahl;
			if (IST_JETZT[eignung.code]) { jetzt += anzahl; }
			gruppen.push({eignung: eignung, anzahl: anzahl, ml: zahl(eintrag[0])});
		});
		if (!gesamt) { return null; }
		function grund(gruppe) {
			var code = gruppe.eignung.code;
			if (code === 'zu-hoch') { return fuellen(w.abStufe, {ml: gruppe.ml}); }
			if (code === 'achtung') { return w.mitVoraussetzung; }
			if (code === 'unklar') { return w.stufeUnklar; }
			var schluessel = gruppe.eignung.grund;
			if (schluessel === 'klasse') { return gruppe.eignung.text; }
			return w[TEIL_GRUND[schluessel]] || w.teilAllgemein;
		}
		function gruende(auswahl) {
			return auswahl.map(function (gruppe) {
				return stueck(gruppe.anzahl) + ' ' + grund(gruppe);
			}).join(' · ');
		}
		var offen = gruppen.filter(function (gruppe) { return !IST_JETZT[gruppe.eignung.code]; });
		if (!offen.length) {
			/* Alle Teile tragbar: das stärkste Teil bestimmt das Wort, denn ein
			 * Set beurteilt man an dem Teil, das man zuletzt anlegen kann. */
			var staerkstes = gruppen.slice().sort(function (a, b) { return b.ml - a.ml; })[0];
			var achtung = gruppen.filter(function (gruppe) {
				return gruppe.eignung.code === 'achtung'; })[0];
			if (achtung) {
				return ergebnis('achtung', 'voraussetzung', w.achtung,
					fuellen(w.alleAchtung, {m: gesamt}));
			}
			if (staerkstes.eignung.code === 'passt') {
				return ergebnis('passt', '', fuellen(w.passt, {stufe: ch.stufe}),
					fuellen(w.alle, {m: gesamt, stufe: ch.stufe}));
			}
			return ergebnis(staerkstes.eignung.code, staerkstes.eignung.grund,
				staerkstes.eignung.text,
				fuellen(w.alleStufe, {m: gesamt, text: staerkstes.eignung.text}));
		}
		if (jetzt) {
			var teil = ergebnis('passt', 'teilweise', fuellen(w.passt, {stufe: ch.stufe}),
				fuellen(w.teilTitel, {n: jetzt, m: gesamt, grund: gruende(offen)}));
			teil.label = fuellen(w.teil, {n: jetzt, m: gesamt});
			return teil;
		}
		var zuHoch = gruppen.filter(function (gruppe) {
			return gruppe.eignung.code === 'zu-hoch'; });
		if (zuHoch.length) {
			return ergebnis('zu-hoch', '', w.zuHoch,
				fuellen(w.zuHochAlle, {grund: gruende(gruppen)}));
		}
		if (gruppen.some(function (gruppe) { return gruppe.eignung.code === 'falsch'; })) {
			return ergebnis('falsch', '', w.chipFalsch,
				fuellen(w.keinTeil, {grund: gruende(gruppen)}));
		}
		return ergebnis('unklar', 'skaliert', w.chipUnklar, w.teileSkaliert);
	}

	function stueck(anzahl) {
		return anzahl + ' ' + (anzahl === 1 ? w.stueckTeil : w.stueckTeile);
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
		/* The inserted nodes are remembered so that a character switch can take
		 * them away again, separator included. */
		var knoten = [];
		function leer() { var t = document.createTextNode(' '); knoten.push(t); return t; }
		function trenner() { var t = document.createTextNode(' · '); knoten.push(t); return t; }
		if (el.classList && el.classList.contains('katalog-gabe')) {
			el.appendChild(leer());
			el.appendChild(marke);
		} else if (eltern.classList && eltern.classList.contains('katalog-metazeile')) {
			/* A meta line joins its parts with " · ": the chip goes in front of
			 * the level and brings the separator with it. */
			eltern.insertBefore(marke, el);
			eltern.insertBefore(trenner(), el);
		} else if (eltern.classList && eltern.classList.contains('set-card-meta')) {
			eltern.appendChild(leer());
			eltern.appendChild(marke);
		} else {
			eltern.insertBefore(marke, el.nextSibling);
			eltern.insertBefore(leer(), marke);
		}
		knoten.push(marke);
		el.__eignungChip = marke;
		el.__eignungKnoten = knoten;
		return eignung;
	}

	/** Set-Chip in ein bereitgestelltes Fach (Zeile, Set-Kopf) setzen. */
	function legeTeile(el, liste, ch) {
		if (!el || el.__eignungChip) { return null; }
		var eignung = teile(liste, ch || charakter());
		if (!eignung) { return null; }
		var marke = chip(eignung);
		el.appendChild(marke);
		el.__eignungChip = marke;
		el.__eignungKnoten = [marke];
		return eignung;
	}

	/** Die Teileliste aus dem Datenattribut; kaputtes JSON gibt kein Urteil. */
	function teileVon(el) {
		try {
			var liste = JSON.parse(el.getAttribute('data-eignung-teile') || '[]');
			return Array.isArray(liste) ? liste : null;
		} catch (error) {
			return null;
		}
	}

	/** Alle Elemente mit Datenattributen bekommen ihren Chip; auch später geladene. */
	function faerbeSeite(wurzel) {
		var ch = charakter();
		var bereich = wurzel || document;
		bereich.querySelectorAll('[data-eignung-min]').forEach(function (el) {
			lege(el, anforderungen(el), ch);
		});
		bereich.querySelectorAll('[data-eignung-teile]').forEach(function (el) {
			legeTeile(el, teileVon(el), ch);
		});
	}

	/** Der Charakter hat gewechselt: alle eigenen Chips neu rechnen. */
	function neuFaerben() {
		document.querySelectorAll('[data-eignung-min], [data-eignung-teile]').forEach(function (el) {
			(el.__eignungKnoten || []).forEach(function (knoten) {
				if (knoten.parentNode) { knoten.parentNode.removeChild(knoten); }
			});
			delete el.__eignungKnoten;
			delete el.__eignungChip;
		});
		faerbeSeite();
	}

	window.MQL_EIGNUNG = {
		grenzen: {gruen: GRUEN_BIS, grau: GRAU_AB, spiel: SPIELGRENZE},
		woerter: w,
		charakter: charakter,
		ton: ton,
		zeile: zeile,
		teile: teile,
		lege: lege,
		legeTeile: legeTeile,
		faerbeSeite: faerbeSeite,
		neuFaerben: neuFaerben,
		chip: chip
	};

	/* Listen tauschen ihre Zeilen aus (Filter) oder wechseln den Charakter;
	 * beides braucht frische Chips, ohne dass jede Liste es selbst aufruft. */
	document.addEventListener('mql:filterchange', function () { faerbeSeite(); });
	document.addEventListener('mql:characterchange', neuFaerben);
	document.addEventListener('change', function (event) {
		if (event.target && event.target.id === 'katalog-charakter') { neuFaerben(); }
	});

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', function () { faerbeSeite(); });
	} else {
		faerbeSeite();
	}
})();
