/* Characters and their progress, kept in this browser only.
 *
 * localStorage "mql.charaktere": { aktiv: key or null, liste: { key: entry } }
 * An entry is what companion.js reads from LOTRO Companion: name, server, account,
 * class, race, level, date, the finished quest and deed ids, the counters of
 * unfinished ones ("laufend"), reputation ("ruf") and crafting tiers ("handwerk"). Nothing leaves the
 * browser; "Sicherung" downloads it as a file and loads it back.
 *
 * Before 0.2.0 the map kept a single Progress.lua under "mql.fortschritt". That is
 * taken over once as a character of its own and then removed.
 */
(function (root) {
	'use strict';

	var SCHLUESSEL = 'mql.charaktere';
	var ALT = 'mql.fortschritt';

	function lies() {
		var daten = null;
		try { daten = JSON.parse(root.localStorage.getItem(SCHLUESSEL) || 'null'); }
		catch (fehler) { daten = null; }
		if (!daten || typeof daten !== 'object' || !daten.liste) { daten = { aktiv: null, liste: {} }; }
		return daten;
	}

	function schreibe(daten) {
		try {
			root.localStorage.setItem(SCHLUESSEL, JSON.stringify(daten));
			return true;
		} catch (fehler) { return false; }
	}

	function sauber(eintrag) {
		var hex = /^[0-9A-F]{8}$/;
		function ids(liste) {
			return (Array.isArray(liste) ? liste : []).map(function (id) { return String(id).toUpperCase(); })
				.filter(function (id) { return hex.test(id); });
		}
		function zahl(wert) { var n = Number(wert); return isFinite(n) ? n : 0; }
		// Running counters: { id: [[objective, condition, done, count|null], …] }
		function laufend(quelle) {
			var aus = {};
			Object.keys(quelle && typeof quelle === 'object' ? quelle : {}).forEach(function (id) {
				var schluessel = String(id).toUpperCase();
				if (!hex.test(schluessel) || !Array.isArray(quelle[id])) { return; }
				aus[schluessel] = quelle[id].filter(Array.isArray).map(function (z) {
					return [zahl(z[0]), zahl(z[1]), z[2] ? 1 : 0, z[3] === null || z[3] === undefined ? null : zahl(z[3])];
				});
			});
			return aus;
		}
		function ruf(quelle) {
			return (Array.isArray(quelle) ? quelle : []).filter(function (z) {
				return Array.isArray(z) && hex.test(String(z[0]).toUpperCase());
			}).map(function (z) { return [String(z[0]).toUpperCase(), zahl(z[1]), z[2] === null || z[2] === undefined ? null : zahl(z[2])]; });
		}
		function handwerk(quelle) {
			var aus = {};
			Object.keys(quelle && typeof quelle === 'object' ? quelle : {}).forEach(function (beruf) {
				if (!/^[A-Z]+$/.test(beruf) || !Array.isArray(quelle[beruf])) { return; }
				aus[beruf] = quelle[beruf].filter(Array.isArray).map(function (z) {
					return [zahl(z[0]), zahl(z[1]), z[2] ? 1 : 0, zahl(z[3]), z[4] ? 1 : 0];
				});
			});
			return aus;
		}
		if (!eintrag || typeof eintrag.name !== 'string' || !eintrag.name) { return null; }
		return {
			key: String(eintrag.key || [eintrag.account || '', eintrag.server || '', eintrag.name].join('|')),
			name: eintrag.name, server: String(eintrag.server || ''), account: String(eintrag.account || ''),
			klasse: String(eintrag.klasse || ''), race: String(eintrag.race || ''), level: String(eintrag.level || ''),
			date: String(eintrag.date || ''), quests: ids(eintrag.quests), deeds: ids(eintrag.deeds),
			rezepte: ids(eintrag.rezepte),
			laufend: laufend(eintrag.laufend), ruf: ruf(eintrag.ruf), handwerk: handwerk(eintrag.handwerk)
		};
	}

	// One-time move of the old single progress file.
	(function uebernimmAlt() {
		var alt = null;
		try { alt = JSON.parse(root.localStorage.getItem(ALT) || 'null'); } catch (fehler) { alt = null; }
		if (!alt || !alt.ids || !alt.ids.length) { return; }
		var daten = lies();
		var eintrag = sauber({ name: alt.character || 'Progress.lua', date: alt.date, quests: alt.ids });
		if (eintrag && !daten.liste[eintrag.key]) {
			daten.liste[eintrag.key] = eintrag;
			if (!daten.aktiv) { daten.aktiv = eintrag.key; }
			schreibe(daten);
		}
		try { root.localStorage.removeItem(ALT); } catch (fehler) {}
	})();

	var api = {
		/** All characters, sorted by server and name. */
		alle: function () {
			var liste = lies().liste;
			return Object.keys(liste).map(function (key) { return liste[key]; })
				.sort(function (a, b) { return (a.server + '|' + a.name).localeCompare(b.server + '|' + b.name); });
		},
		aktiv: function () {
			var daten = lies();
			return daten.aktiv && daten.liste[daten.aktiv] ? daten.liste[daten.aktiv] : null;
		},
		setzeAktiv: function (key) {
			var daten = lies();
			daten.aktiv = key && daten.liste[key] ? key : null;
			return schreibe(daten);
		},
		/** Add or update characters; an existing one is replaced, never doubled. */
		uebernimm: function (liste) {
			var daten = lies(), neu = 0, aktualisiert = 0;
			(liste || []).forEach(function (roh) {
				var eintrag = sauber(roh);
				if (!eintrag) { return; }
				if (daten.liste[eintrag.key]) { aktualisiert += 1; } else { neu += 1; }
				daten.liste[eintrag.key] = eintrag;
				if (!daten.aktiv) { daten.aktiv = eintrag.key; }
			});
			return { ok: schreibe(daten), neu: neu, aktualisiert: aktualisiert };
		},
		entferne: function (key) {
			var daten = lies();
			delete daten.liste[key];
			if (daten.aktiv === key) {
				var rest = Object.keys(daten.liste);
				daten.aktiv = rest.length ? rest[0] : null;
			}
			return schreibe(daten);
		},
		/** Finished ids of the active character, quests and deeds together. */
		aktiveIds: function () {
			var eintrag = api.aktiv();
			return eintrag ? eintrag.quests.concat(eintrag.deeds) : [];
		},
		sicherung: function () {
			var daten = lies();
			return JSON.stringify({ format: 'magic-quest-log-progress', version: 1,
				aktiv: daten.aktiv, charaktere: api.alle() }, null, 1);
		},
		/** Load a backup. Returns the number of characters, or -1 for a wrong file. */
		ladeSicherung: function (text) {
			var inhalt = null;
			try { inhalt = JSON.parse(text); } catch (fehler) { return -1; }
			if (!inhalt || inhalt.format !== 'magic-quest-log-progress' || !Array.isArray(inhalt.charaktere)) {
				return -1;
			}
			var ergebnis = api.uebernimm(inhalt.charaktere);
			if (inhalt.aktiv) { api.setzeAktiv(inhalt.aktiv); }
			return ergebnis.neu + ergebnis.aktualisiert;
		}
	};
	root.MQL_SPEICHER = api;
})(this);
