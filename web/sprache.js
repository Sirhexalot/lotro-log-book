/* Language selection and loading of the matching data.
 *
 * Order: the language path segment beats ?lang=, which beats the stored
 * choice, which beats navigator.language; otherwise English. The choice stays in localStorage under
 * `mql.sprache`. Only the one data file is loaded, not both.
 *
 * Switching language: append ?lang=en to the address (the buttons do that).
 */
(function () {
	'use strict';

	var ERLAUBT = ['de', 'en', 'fr'];
	var VORGABE = 'en';

	// Start pages exist once per language (start-en.html …): their language is fixed.
	var seiteArt = document.body.getAttribute('data-seite') || '';
	var feste = seiteArt === 'start' ? document.documentElement.getAttribute('lang') : null;

	function waehle() {
		if (ERLAUBT.indexOf(feste) >= 0) { return feste; }
		// Language in the path wins: /de/karte/ is German, whatever was stored.
		var ausPfad = String(window.location.pathname || '').split('/')[1] || '';
		if (ERLAUBT.indexOf(ausPfad) >= 0) { return ausPfad; }
		var ausAdresse = null;
		try {
			ausAdresse = new URLSearchParams(window.location.search).get('lang');
		} catch (fehler) { ausAdresse = null; }
		if (ERLAUBT.indexOf(ausAdresse) >= 0) { return ausAdresse; }

		var gespeichert = null;
		try { gespeichert = window.localStorage.getItem('mql.sprache'); }
		catch (fehler) { gespeichert = null; }
		if (ERLAUBT.indexOf(gespeichert) >= 0) { return gespeichert; }

		var system = String(navigator.language || '').slice(0, 2).toLowerCase();
		return ERLAUBT.indexOf(system) >= 0 ? system : VORGABE;
	}

	var sprache = waehle();
	window.MQL_SPRACHE = sprache;
	try { window.localStorage.setItem('mql.sprache', sprache); } catch (fehler) {}

	var texte = (window.MQL_TEXTE || {})[sprache] || (window.MQL_TEXTE || {}).de || {};
	// Legal pages share the same language controls as the app.
	if (!document.querySelector('.sprachen')) {
		var kopf = document.querySelector('.kopf-innen') || document.querySelector('.kopf');
		if (kopf) {
			var sprachen = document.createElement('nav');
			sprachen.className = 'sprachen';
			ERLAUBT.forEach(function (lang) {
				var knopf = document.createElement('button');
				knopf.type = 'button'; knopf.dataset.lang = lang; knopf.textContent = lang.toUpperCase();
				sprachen.appendChild(knopf);
			});
			kopf.appendChild(sprachen);
		}
	}

	// The map shows quests at /de/karte/, deeds at /de/karte/taten/. Older links
	// still say ?art=taten, so both count. Texts that differ for deeds carry the
	// suffix _taten and win in that mode.
	var TATEN = ['taten', 'deeds', 'prouesses'];
	var art = 'aufgaben';
	try {
		var pfad = String(window.location.pathname || '').replace(/\/+$/, '').split('/');
		var letzter = pfad[pfad.length - 1] || '';
		if (TATEN.indexOf(letzter) >= 0
				|| new URLSearchParams(window.location.search).get('art') === 'taten') {
			art = 'taten';
		}
	} catch (fehler) { art = 'aufgaben'; }
	window.MQL_ART = art;

	// Canonical link into the map app, with one record preselected. Both link
	// lists below the map and every catalogue page use this, so the deed mode
	// stays a path instead of the old "?art=taten".
	var KARTEN_SEGMENT = { de: 'karte', en: 'map', fr: 'carte' };
	var TATEN_SEGMENT = { de: 'taten', en: 'deeds', fr: 'prouesses' };
	window.MQL_KARTE_LINK = function (art, id) {
		var pfad = '/' + sprache + '/' + (KARTEN_SEGMENT[sprache] || 'karte') + '/';
		if (art === 'd') { pfad += (TATEN_SEGMENT[sprache] || 'taten') + '/'; }
		return id ? pfad + '?id=' + encodeURIComponent(id) : pfad;
	};

	function t(schluessel) {
		var wert = art === 'taten' && texte[schluessel + '_taten'] !== undefined
			? texte[schluessel + '_taten'] : texte[schluessel];
		if (wert === undefined) { return schluessel; }
		return String(wert);
	}
	window.MQL_T = t;

	function ersetze(muster, werte) {
		var i = 0;
		return String(muster).replace(/%s/g, function () {
			var wert = werte[i]; i += 1;
			return wert === undefined ? '' : wert;
		});
	}
	window.MQL_ERSETZE = ersetze;

	document.documentElement.lang = sprache;
	// The title comes from the page itself (server-rendered since the catalogue
	// moved to PHP); only views that change content set their own below.

	document.querySelectorAll('[data-t]').forEach(function (element) {
		element.textContent = t(element.getAttribute('data-t'));
	});
	// Our own texts with a little markup (links, lists, code). Never game or user data.
	document.querySelectorAll('[data-t-html]').forEach(function (element) {
		element.innerHTML = t(element.getAttribute('data-t-html'));
	});
	document.querySelectorAll('[data-t-ph]').forEach(function (element) {
		element.setAttribute('placeholder', t(element.getAttribute('data-t-ph')));
	});
	// One pattern for every page: "<content> – LOTRO Log Book". The map names its
	// content, so quests and deeds no longer share the game's name as a title.
	var seitentitel = { gegenstaende: 'gs_titel', spielstand: 'sp_titel', ruf: 'ru_titel', handwerk: 'hw_titel',
		belohnungen: 'bl_titel', plugin: 'pl_titel', companion: 'cp_titel',
		karte: 'titel_karte' }[seiteArt];
	if (document.body.dataset.recht === 'datenschutz') { seitentitel = 'ds_titel'; }
	// Deeds bring their own, complete title; appending the suffix again gave
	// "Taten – LOTRO Log Book – LOTRO Log Book".
	if (seiteArt === 'karte' && art === 'taten') {
		document.title = t('titel_taten');
	} else if (seitentitel) {
		document.title = t(seitentitel) + ' – LOTRO Log Book';
	}
	var attribute = [
		['.menue', 'aria-label', 'nav_menu'], ['.sprachen', 'aria-label', 'nav_sprache'],
		['#baum', 'aria-label', 'gebiete'], ['#filter', 'aria-label', 'nav_filter'],
		['#landschaft-orte', 'aria-label', 'nav_karten'],
		['#legende-mehr', 'title', 'legende_mehr'],
		['#legende-mehr', 'aria-label', 'legende_mehr'],
		['#zuklappen', 'title', 'alles_zuklappen'], ['#zum-baum', 'title', 'zurueck_gebiete']
	];
	attribute.forEach(function (a) {
		var element = document.querySelector(a[0]);
		if (element) { element.setAttribute(a[1], t(a[2])); }
	});
	// A deliberate language choice must survive the next visit to "/", where
	// the server would otherwise follow the browser again. It is a functional
	// cookie, not tracking.
	function merkeSprache(ziel) {
		try {
			document.cookie = 'llb_sprache=' + encodeURIComponent(ziel) + ';path=/;max-age=31536000;samesite=lax';
		} catch (fehler) { /* cookies blocked */ }
		try { window.localStorage.setItem('mql.sprache', ziel); } catch (fehler) {}
	}
	document.querySelectorAll('[data-lang]').forEach(function (knopf) {
		knopf.setAttribute('aria-pressed', String(knopf.getAttribute('data-lang') === sprache));
		knopf.addEventListener('click', function () {
			var ziel = knopf.getAttribute('data-lang');
			merkeSprache(ziel);
			if (seiteArt === 'start') {
				window.location.href = ziel === 'en' ? 'start-en.html' : (ziel === 'fr' ? 'start-fr.html' : 'start.html');
				return;
			}
			var adresse = new URL(window.location.href);
			adresse.searchParams.set('lang', ziel);
			window.location.href = adresse.toString();
		});
	});
	// The footer's language links are plain /de|en|fr/ addresses; a click on one
	// is a deliberate choice as well. Delegated, because a filter response may
	// replace the footer.
	document.addEventListener('click', function (ereignis) {
		var link = ereignis.target && ereignis.target.closest ? ereignis.target.closest('a[hreflang]') : null;
		if (!link) { return; }
		var ziel = String(link.getAttribute('hreflang') || '').toLowerCase();
		if (['de', 'en', 'fr'].indexOf(ziel) >= 0) { merkeSprache(ziel); }
	});


	function lade(src, dann) {
		var skript = document.createElement('script');
		skript.src = src;
		skript.onload = dann;
		skript.onerror = function () {
			var weg = document.querySelector('.lader');
			if (weg) { weg.parentNode.removeChild(weg); }
			var hinweis = document.getElementById('hinweis');
			if (hinweis) { hinweis.textContent = t('keine_daten'); }
		};
		document.body.appendChild(skript);
	}

	// These files do not depend on one another. Loading them together removes
	// one full network round trip from the map's critical startup path. The app
	// itself is still loaded only after both data files are available.
	function ladeParallel(quellen, dann) {
		var offen = quellen.length;
		var fehlgeschlagen = false;
		function fehler() {
			if (fehlgeschlagen) { return; }
			fehlgeschlagen = true;
			var weg = document.querySelector('.lader');
			if (weg) { weg.parentNode.removeChild(weg); }
			var hinweis = document.getElementById('hinweis');
			if (hinweis) { hinweis.textContent = t('keine_daten'); }
		}
		quellen.forEach(function (quelle) {
			var skript = document.createElement('script');
			skript.src = quelle;
			skript.onload = function () {
				if (fehlgeschlagen) { return; }
				offen -= 1;
				if (!offen) { dann(); }
			};
			skript.onerror = fehler;
			document.body.appendChild(skript);
		});
	}

	var stempel = function () { return '?v=' + (window.MQL_STAND || '0'); };

	// Pages with their own data file: the reward index, the recipe browser and
	// a single item (which reads the same reward index).
	var seite = document.body.getAttribute('data-seite');
	if (seite === 'suche') {
		lade('stand.js?t=' + Date.now(), function () {
			lade('suche-' + sprache + '.js' + stempel(), function () {
				if (window.MQL_SUCHE_ZEICHNEN) { window.MQL_SUCHE_ZEICHNEN(); }
			});
		});
		return;
	}
	if (seite === 'gegenstaende') {
		lade('stand.js?t=' + Date.now(), function () {
			lade('gegenstaende-' + sprache + '.js' + stempel(), function () {
				if (window.MQL_GEGENSTAENDE_ZEICHNEN) { window.MQL_GEGENSTAENDE_ZEICHNEN(); }
			});
		});
		return;
	}
	if (seite === 'belohnungen' || seite === 'handwerk' || seite === 'gegenstand') {
		lade('stand.js?t=' + Date.now(), function () {
			var datei = (seite === 'handwerk' ? 'rezepte-' : 'belohnungen-') + sprache + '.js';
			lade(datei + stempel(), function () {
				if (seite === 'belohnungen' && window.MQL_BELOHNUNGEN_ZEICHNEN) { window.MQL_BELOHNUNGEN_ZEICHNEN(); }
				if (seite === 'gegenstand' && window.MQL_GEGENSTAND_ZEICHNEN) { window.MQL_GEGENSTAND_ZEICHNEN(); }
				if (seite !== 'handwerk') { return; }
				if (window.MQL_REZEPTE_ZEICHNEN) { window.MQL_REZEPTE_ZEICHNEN(); }
				// The resource tab shares the map layer's data file.
				lade('vorkommen-' + sprache + '.js' + stempel(), function () {
					if (window.MQL_ROHSTOFFE_ZEICHNEN) { window.MQL_ROHSTOFFE_ZEICHNEN(); }
				});
			});
		});
		return;
	}

	// Only the map loads the large data files; the progress page needs none.
	if (seite !== 'karte') { return; }

	// Loading indicator until the map is drawn: the data file takes a few seconds
	// on the first visit, after that it comes from the browser cache.
	var lader = document.createElement('div');
	lader.className = 'lader';
	lader.setAttribute('role', 'status');
	var kreis = document.createElement('span');
	kreis.className = 'lader-kreis';
	var ladeText = document.createElement('span');
	ladeText.textContent = t(art === 'taten' ? 'lade_taten' : 'lade_aufgaben');
	lader.appendChild(kreis);
	lader.appendChild(ladeText);
	document.body.appendChild(lader);
	function fertig() {
		lader.classList.add('weg');
		setTimeout(function () { if (lader.parentNode) { lader.parentNode.removeChild(lader); } }, 400);
	}

	// stand.js first and without cache: it holds the stamp of the last build.
	lade('stand.js?t=' + Date.now(), function () {
		var initial = art === 'taten' ? 'daten-taten-' + sprache : 'karten-kurz-' + sprache;
		lade(initial + '.js' + stempel(), function () {
			ladeText.textContent = t('lade_karte');
			// The shared landscape list lets both catalogues show the same
			// navigation; a missing file leaves the tree as the entries built it.
			ladeParallel([
				'gebiete-' + sprache + '.js' + stempel(),
				'fortschritt.js' + stempel()
			], function () {
				lade('app.js' + stempel(), function () {
					// The app draws in the same task; one frame later the page stands.
					requestAnimationFrame(function () { requestAnimationFrame(fertig); });
				});
			});
		});
	});
})();
