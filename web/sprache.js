/* Language selection and loading of the matching data.
 *
 * Order: ?lang=… beats the stored choice, which beats
 * navigator.language; otherwise English. The choice stays in localStorage under
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

	// The map shows quests, or deeds with ?art=taten. Texts that differ for deeds
	// carry the suffix _taten and win in that mode.
	var art = 'aufgaben';
	try {
		art = new URLSearchParams(window.location.search).get('art') === 'taten' ? 'taten' : 'aufgaben';
	} catch (fehler) { art = 'aufgaben'; }
	window.MQL_ART = art;

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
	// Start and legal pages keep their own title.
	if (seiteArt !== 'start' && seiteArt !== 'recht') { document.title = t('titel'); }

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
	var seitentitel = { spielstand: 'sp_titel', ruf: 'ru_titel', handwerk: 'hw_titel',
		belohnungen: 'bl_titel' }[seiteArt];
	if (document.body.dataset.recht === 'datenschutz') { seitentitel = 'ds_titel'; }
	if (seitentitel) { document.title = t(seitentitel) + ' – LOTRO Log Book'; }
	var attribute = [
		['.menue', 'aria-label', 'nav_menu'], ['.sprachen', 'aria-label', 'nav_sprache'],
		['#baum', 'aria-label', 'gebiete'], ['#filter', 'aria-label', 'nav_filter'],
		['#landschaft-orte', 'aria-label', 'nav_karten'],
		['#zuklappen', 'title', 'alles_zuklappen'], ['#zum-baum', 'title', 'zurueck_gebiete']
	];
	attribute.forEach(function (a) {
		var element = document.querySelector(a[0]);
		if (element) { element.setAttribute(a[1], t(a[2])); }
	});
	document.querySelectorAll('[data-lang]').forEach(function (knopf) {
		knopf.setAttribute('aria-pressed', String(knopf.getAttribute('data-lang') === sprache));
		knopf.addEventListener('click', function () {
			var ziel = knopf.getAttribute('data-lang');
			try { window.localStorage.setItem('mql.sprache', ziel); } catch (fehler) {}
			if (seiteArt === 'start') {
				window.location.href = ziel === 'en' ? 'start-en.html' : (ziel === 'fr' ? 'start-fr.html' : 'start.html');
				return;
			}
			var adresse = new URL(window.location.href);
			adresse.searchParams.set('lang', ziel);
			window.location.href = adresse.toString();
		});
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

	var stil = document.querySelector('link[rel="stylesheet"]');
	var stempel = function () { return '?v=' + (window.MQL_STAND || '0'); };

	// Pages with their own data file: the reward index and the recipe browser.
	var seite = document.body.getAttribute('data-seite');
	if (seite === 'belohnungen' || seite === 'handwerk') {
		lade('stand.js?t=' + Date.now(), function () {
			var datei = (seite === 'belohnungen' ? 'belohnungen-' : 'rezepte-') + sprache + '.js';
			lade(datei + stempel(), function () {
				if (seite === 'belohnungen' && window.MQL_BELOHNUNGEN_ZEICHNEN) { window.MQL_BELOHNUNGEN_ZEICHNEN(); }
				if (seite === 'handwerk' && window.MQL_REZEPTE_ZEICHNEN) { window.MQL_REZEPTE_ZEICHNEN(); }
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
		lade('daten-' + (art === 'taten' ? 'taten-' : '') + sprache + '.js' + stempel(), function () {
			if (stil) { stil.href = stil.getAttribute('href').split('?')[0] + stempel(); }
			ladeText.textContent = t('lade_karte');
			lade('fortschritt.js' + stempel(), function () {
				lade('app.js' + stempel(), function () {
					// The app draws in the same task; one frame later the page stands.
					requestAnimationFrame(function () { requestAnimationFrame(fertig); });
				});
			});
		});
	});
})();
