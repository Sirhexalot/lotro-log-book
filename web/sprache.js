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

	function waehle() {
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

	function t(schluessel) {
		var wert = texte[schluessel];
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
	document.title = t('titel');

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
	document.querySelectorAll('[data-lang]').forEach(function (knopf) {
		knopf.setAttribute('aria-pressed', String(knopf.getAttribute('data-lang') === sprache));
		knopf.addEventListener('click', function () {
			var ziel = knopf.getAttribute('data-lang');
			try { window.localStorage.setItem('mql.sprache', ziel); } catch (fehler) {}
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
			var hinweis = document.getElementById('hinweis');
			if (hinweis) { hinweis.textContent = t('keine_daten'); }
		};
		document.body.appendChild(skript);
	}

	var stil = document.querySelector('link[rel="stylesheet"]');
	var stempel = function () { return '?v=' + (window.MQL_STAND || '0'); };

	// Only the map loads the large data files; the progress page needs none.
	if (document.body.getAttribute('data-seite') !== 'karte') { return; }

	// stand.js first and without cache: it holds the stamp of the last build.
	lade('stand.js?t=' + Date.now(), function () {
		lade('daten-' + sprache + '.js' + stempel(), function () {
			if (stil) { stil.href = stil.getAttribute('href').split('?')[0] + stempel(); }
			lade('fortschritt.js' + stempel(), function () {
				lade('app.js' + stempel());
			});
		});
	});
})();
