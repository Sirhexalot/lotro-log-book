/* The place component's behaviour: one map, a list of places, a row switches
 * the map. The markup comes from `components/ort.twig`, the look from
 * `ort.css`. A page never binds a place block itself.
 *
 * Several pickers may stand on one page (an item with several sources), so
 * every hook lives inside its own `[data-ort-karte]` container and nothing
 * uses an id. Without JavaScript the first map stays and every row is
 * readable; the rows are links and text, never buttons without a script. */
(function () {
	'use strict';

	function bild(host) { return host.querySelector('[data-ort-bild]'); }
	function pin(host) { return host.querySelector('[data-ort-pin]'); }

	function zeige(host, knopf) {
		var datei = knopf.getAttribute('data-bild');
		var karte = bild(host);
		if (karte && datei) {
			var lang = document.documentElement.lang || 'de';
			karte.src = '/karten/' + lang + '/' + datei.replace(/\.png$/, '.webp');
		}
		var marke = pin(host);
		if (marke) {
			var x = knopf.getAttribute('data-pin-x');
			var y = knopf.getAttribute('data-pin-y');
			if (x === '' || y === '' || x === null || y === null) {
				marke.hidden = true;
			} else {
				marke.hidden = false;
				marke.style.left = x + '%';
				marke.style.top = y + '%';
			}
		}
		host.querySelectorAll('.ist-aktiv').forEach(function (zeile) {
			zeile.classList.remove('ist-aktiv');
		});
		var zeile = knopf.closest('li');
		if (zeile) { zeile.classList.add('ist-aktiv'); }
	}

	function bind(host) {
		host.querySelectorAll('button.ort-zeile').forEach(function (knopf) {
			knopf.addEventListener('click', function () { zeige(host, knopf); });
		});
	}

	function start() {
		document.querySelectorAll('[data-ort-karte]').forEach(bind);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', start);
	} else {
		start();
	}

	window.MQL_ORT = { bind: bind, zeige: zeige };
})();
