/* Progress page: read LOTRO Companion's folder, list the characters, write the
 * plugin files, back up and restore. Everything happens in this browser.
 */
(function () {
	'use strict';

	var t = window.MQL_T || function (schluessel) { return schluessel; };
	var ersetze = window.MQL_ERSETZE || function (muster) { return String(muster); };
	var speicher = window.MQL_SPEICHER;
	var companion = window.MQL_COMPANION;
	var sprache = window.MQL_SPRACHE || 'de';

	function el(id) { return document.getElementById(id); }

	function melde(ziel, text, art) {
		var feld = el(ziel);
		feld.textContent = text || '';
		feld.className = 'meldung' + (art ? ' ' + art : '');
	}

	// --- Windows / macOS tabs, remembered ---------------------------------
	var system = /Mac/i.test(navigator.platform || navigator.userAgent) ? 'mac' : 'windows';
	try { system = window.localStorage.getItem('mql.system') || system; } catch (fehler) {}
	function zeigeSystem(wahl) {
		system = wahl;
		try { window.localStorage.setItem('mql.system', wahl); } catch (fehler) {}
		document.querySelectorAll('[data-reiter]').forEach(function (knopf) {
			knopf.setAttribute('aria-pressed', String(knopf.getAttribute('data-reiter') === wahl));
		});
		document.querySelectorAll('[data-inhalt]').forEach(function (block) {
			block.hidden = block.getAttribute('data-inhalt') !== wahl;
		});
	}
	document.querySelectorAll('[data-reiter]').forEach(function (knopf) {
		knopf.addEventListener('click', function () { zeigeSystem(knopf.getAttribute('data-reiter')); });
	});
	zeigeSystem(system);

	// --- Character table ----------------------------------------------------
	function zahl(wert) { return Number(wert).toLocaleString(t('locale')); }

	function zeichneTabelle() {
		var zeilen = el('zeilen');
		zeilen.textContent = '';
		var alle = speicher.alle();
		var aktiv = speicher.aktiv();
		if (!alle.length) {
			var leer = document.createElement('tr');
			var zelle = document.createElement('td');
			zelle.colSpan = 8;
			zelle.className = 'leer-tabelle';
			zelle.textContent = t('sp_keine');
			leer.appendChild(zelle);
			zeilen.appendChild(leer);
		}
		alle.forEach(function (eintrag) {
			var zeile = document.createElement('tr');
			if (aktiv && aktiv.key === eintrag.key) { zeile.className = 'aktiv'; }
			[[eintrag.name], [eintrag.server], [eintrag.klasse], [eintrag.level, 'zahl'],
				[zahl(eintrag.quests.length), 'zahl'], [zahl(eintrag.deeds.length), 'zahl'], [eintrag.date]]
				.forEach(function (paar) {
					var zelle = document.createElement('td');
					zelle.textContent = paar[0] || '';
					if (paar[1]) { zelle.className = paar[1]; }
					zeile.appendChild(zelle);
				});
			var aktionen = document.createElement('td');
			var waehlen = document.createElement('button');
			waehlen.type = 'button';
			waehlen.textContent = aktiv && aktiv.key === eintrag.key ? t('sp_aktiv') : t('sp_waehlen');
			waehlen.disabled = !!(aktiv && aktiv.key === eintrag.key);
			waehlen.addEventListener('click', function () {
				speicher.setzeAktiv(eintrag.key);
				window.location.reload();
			});
			var karte = document.createElement('button');
			karte.type = 'button';
			karte.textContent = t('sp_karte');
			karte.addEventListener('click', function () {
				speicher.setzeAktiv(eintrag.key);
				window.location.href = '/index.html?lang=' + sprache;
			});
			var weg = document.createElement('button');
			weg.type = 'button';
			weg.textContent = t('sp_entfernen');
			weg.addEventListener('click', function () {
				if (!window.confirm(ersetze(t('sp_entfernen_frage'), [eintrag.name]))) { return; }
				speicher.entferne(eintrag.key);
				window.location.reload();
			});
			aktionen.appendChild(waehlen);
			aktionen.appendChild(karte);
			aktionen.appendChild(weg);
			zeile.appendChild(aktionen);
			zeilen.appendChild(zeile);
		});
		var leer2 = !alle.length;
		el('charaktere').hidden = leer2;
		el('import-fertig').hidden = leer2;
		el('sicherung').hidden = leer2;
		el('sicherung').disabled = leer2;
	}

	el('fertig-karte').addEventListener('click', function () {
		window.location.href = '/index.html?lang=' + sprache;
	});

	// --- Reading Companion's folder ------------------------------------------
	function ausDateiliste(liste) {
		return Array.prototype.map.call(liste, function (datei) {
			return {
				path: datei.webkitRelativePath || datei.name,
				read: function () { return datei.text(); }
			};
		});
	}

	/** Counts imports for Google Analytics through the GTM container; no names, no IDs. */
	function meldeImport(anzahl, art) {
		window.dataLayer = window.dataLayer || [];
		window.dataLayer.push({ event: 'charakter_import', anzahl: anzahl, art: art });
	}

	function verarbeite(eintraege) {
		melde('meldung', t('sp_lese'), '');
		companion.readCharacters(eintraege).then(function (ergebnis) {
			if (!ergebnis.characters.length) {
				melde('meldung', t('sp_nichts'), 'fehler');
				return;
			}
			var stand = speicher.uebernimm(ergebnis.characters);
			if (!stand.ok) {
				melde('meldung', t('sp_speicher_voll'), 'fehler');
				return;
			}
			meldeImport(ergebnis.characters.length, 'companion');
			var namen = ergebnis.characters.map(function (c) { return c.name; }).join(', ');
			melde('meldung', ersetze(t('sp_gelesen'), [ergebnis.characters.length, namen]), 'gut');
			window.setTimeout(function () { window.location.reload(); }, 900);
		}).catch(function () {
			melde('meldung', t('sp_nichts'), 'fehler');
		});
	}

	el('ordner-waehlen').addEventListener('click', function () { el('ordner').click(); });
	el('ordner').addEventListener('change', function () {
		var liste = el('ordner').files;
		if (liste && liste.length) { verarbeite(ausDateiliste(liste)); }
	});

	// Drag and drop of a folder: walk it with the entry API.
	function sammle(eintrag, pfad, ziel) {
		return new Promise(function (fertig) {
			if (eintrag.isFile) {
				var name = eintrag.name;
				if (!/^(summary|questsStatus|deedsStatus|reputation|crafting)\.xml$/.test(name)) { fertig(); return; }
				ziel.push({
					path: pfad + name,
					read: function () {
						return new Promise(function (gut, schlecht) {
							eintrag.file(function (datei) { datei.text().then(gut, schlecht); }, schlecht);
						});
					}
				});
				fertig();
				return;
			}
			var leser = eintrag.createReader();
			var alle = [];
			(function weiter() {
				leser.readEntries(function (teil) {
					if (!teil.length) {
						Promise.all(alle.map(function (kind) {
							return sammle(kind, pfad + eintrag.name + '/', ziel);
						})).then(function () { fertig(); });
						return;
					}
					alle = alle.concat(Array.prototype.slice.call(teil));
					weiter();
				}, function () { fertig(); });
			})();
		});
	}

	var ablage = el('ablage');
	ablage.addEventListener('dragover', function (ereignis) {
		ereignis.preventDefault();
		ablage.classList.add('ueber');
	});
	ablage.addEventListener('dragleave', function () { ablage.classList.remove('ueber'); });
	ablage.addEventListener('drop', function (ereignis) {
		ereignis.preventDefault();
		ablage.classList.remove('ueber');
		var items = ereignis.dataTransfer && ereignis.dataTransfer.items;
		if (!items) { return; }
		var ziel = [];
		var wurzeln = [];
		Array.prototype.forEach.call(items, function (item) {
			var eintrag = item.webkitGetAsEntry && item.webkitGetAsEntry();
			if (eintrag) { wurzeln.push(eintrag); }
		});
		Promise.all(wurzeln.map(function (eintrag) { return sammle(eintrag, '', ziel); }))
			.then(function () { verarbeite(ziel); });
	});

	// The plugin's own page (plugin.html) writes the files Magic Quest Log reads;
	// this page only keeps the progress in the browser and backs it up.

	function speichereDatei(name, inhalt, typ) {
		var blob = new Blob([inhalt], { type: typ });
		var link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = name;
		document.body.appendChild(link);
		link.click();
		window.setTimeout(function () { URL.revokeObjectURL(link.href); link.remove(); }, 1000);
	}

	// --- Backup ---------------------------------------------------------------
	el('sicherung').addEventListener('click', function () {
		var heute = new Date().toISOString().slice(0, 10);
		speichereDatei('MagicQuestLog-Spielstand-' + heute + '.json', speicher.sicherung(), 'application/json');
		melde('meldung-sicherung', t('sp_sicherung_fertig'), 'gut');
	});
	el('sicherung-laden').addEventListener('click', function () { el('sicherung-datei').click(); });
	el('sicherung-datei').addEventListener('change', function () {
		var datei = el('sicherung-datei').files[0];
		if (!datei) { return; }
		datei.text().then(function (text) {
			var anzahl = speicher.ladeSicherung(text);
			if (anzahl < 0) { melde('meldung-sicherung', t('sp_sicherung_falsch'), 'fehler'); return; }
			if (anzahl > 0) { meldeImport(anzahl, 'sicherung'); }
			melde('meldung-sicherung', ersetze(t('sp_sicherung_geladen'), [anzahl]), 'gut');
			window.setTimeout(function () { window.location.reload(); }, 900);
		});
	});

	zeichneTabelle();
})();
