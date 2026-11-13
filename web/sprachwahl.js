/* Remembers a deliberate language choice, on every page.
 *
 * The catalogue pages and the application pages carry their language links in
 * different places, and only the application pages loaded `sprache.js`. The
 * functional cookie therefore belongs in its own file that every page loads:
 * a click on a language link is a choice, a shared link is not.
 */
(function () {
	'use strict';
	var ERLAUBT = ['de', 'en', 'fr'];
	function merke(ziel) {
		if (ERLAUBT.indexOf(ziel) < 0) { return; }
		try {
			document.cookie = 'llb_sprache=' + ziel + ';path=/;max-age=31536000;samesite=lax';
		} catch (fehler) { /* cookies blocked */ }
		try { window.localStorage.setItem('mql.sprache', ziel); } catch (fehler) {}
	}
	// Capture phase: the click is recorded before the browser follows the link.
	document.addEventListener('click', function (ereignis) {
		var ziel = ereignis.target;
		if (!ziel || !ziel.closest) { return; }
		var link = ziel.closest('a[hreflang]');
		if (link) {
			merke(String(link.getAttribute('hreflang') || '').toLowerCase());
			return;
		}
		var knopf = ziel.closest('[data-lang]');
		if (knopf) { merke(String(knopf.getAttribute('data-lang') || '').toLowerCase()); }
	}, true);
})();
