/* Plugin page: write the files Magic Quest Log reads into the game's PluginData
 * folder, or download them as a zip. The characters come from this browser, so
 * nothing is uploaded here either.
 */
(function () {
	'use strict';

	var t = window.MQL_T || function (schluessel) { return schluessel; };
	var ersetze = window.MQL_ERSETZE || function (muster) { return String(muster); };
	var speicher = window.MQL_SPEICHER;
	var companion = window.MQL_COMPANION;

	function el(id) { return document.getElementById(id); }

	function melde(text, art) {
		var feld = el('meldung-plugin');
		feld.textContent = text || '';
		feld.className = 'meldung' + (art ? ' ' + art : '');
	}

	function speichereDatei(name, inhalt, typ) {
		var blob = new Blob([inhalt], { type: typ });
		var link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = name;
		document.body.appendChild(link);
		link.click();
		window.setTimeout(function () { URL.revokeObjectURL(link.href); link.remove(); }, 1000);
	}

	var alle = speicher ? speicher.alle() : [];
	var leer = !alle.length;
	var direkt = typeof window.showDirectoryPicker === 'function';

	el('ohne-charakter').hidden = !leer;
	el('schreiben').hidden = !direkt;
	el('schreiben-hinweis').hidden = direkt;
	el('schreiben').disabled = leer;
	el('zip').disabled = leer;

	function dateien() {
		var liste = companion.pluginFiles(alle);
		if (!liste.length) { melde(t('pl_nichts'), 'fehler'); }
		return liste;
	}

	el('zip').addEventListener('click', function () {
		var liste = dateien();
		if (!liste.length) { return; }
		speichereDatei('MagicQuestLog-PluginData.zip', companion.zip(liste), 'application/zip');
		melde(ersetze(t('pl_zip_fertig'), [liste.length]), 'gut');
	});

	function schreibeIn(ordner, pfad, text) {
		var teile = pfad.split('/');
		var name = teile.pop();
		return teile.reduce(function (weiter, teil) {
			return weiter.then(function (aktuell) { return aktuell.getDirectoryHandle(teil, { create: true }); });
		}, Promise.resolve(ordner)).then(function (ziel) {
			return ziel.getFileHandle(name, { create: true });
		}).then(function (datei) {
			return datei.createWritable();
		}).then(function (schreiber) {
			return schreiber.write(text).then(function () { return schreiber.close(); });
		});
	}

	el('schreiben').addEventListener('click', function () {
		var liste = dateien();
		if (!liste.length) { return; }
		window.showDirectoryPicker({ id: 'mql-plugindata', mode: 'readwrite' }).then(function (ordner) {
			// The account folders must already exist: the game creates them. A wrong
			// folder (e.g. "Plugins") would otherwise get a stray account tree.
			var konten = {};
			liste.forEach(function (datei) { konten[datei.path.split('/')[0]] = true; });
			return Promise.all(Object.keys(konten).map(function (konto) {
				return ordner.getDirectoryHandle(konto).then(function () { return null; }, function () { return konto; });
			})).then(function (fehlend) {
				fehlend = fehlend.filter(Boolean);
				if (fehlend.length) {
					melde(ersetze(t('pl_falscher_ordner'), [ordner.name, fehlend.join(', ')]), 'fehler');
					return;
				}
				return liste.reduce(function (weiter, datei) {
					return weiter.then(function () { return schreibeIn(ordner, datei.path, datei.text); });
				}, Promise.resolve()).then(function () {
					melde(ersetze(t('pl_geschrieben'), [liste.length]), 'gut');
				});
			});
		}).catch(function (fehler) {
			if (fehler && fehler.name === 'AbortError') { return; }
			melde(t('pl_schreiben_fehler'), 'fehler');
		});
	});
})();
