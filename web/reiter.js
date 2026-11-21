/* One tab bar for every page. The markup comes from
 * `php/templates/components/reiter.twig`, the look from `reiter.css`.
 *
 * A page mounts the bar and says what happens on a switch; it never touches
 * aria state, panel visibility or keyboard handling itself. That keeps the
 * item, instance, class, area, companion and handwerk tabs identical. */
(function () {
	'use strict';

	function knoepfe(host) {
		return Array.from(host.querySelectorAll('[data-reiter-knopf]'));
	}

	function panelOf(button) {
		var id = button.getAttribute('aria-controls');
		return id ? document.getElementById(id) : null;
	}

	function sichtbar(button) {
		return !button.hidden;
	}

	window.MQL_REITER = {
		/* host: the element carrying the bar; optionen:
		 *   aktiv     key to start on (default: the marked one, else the first)
		 *   hash      read and write location.hash
		 *   onShow    function (key) after every switch, including the first
		 *   verlauf   push a history entry instead of replacing it */
		mount: function (host, optionen) {
			optionen = optionen || {};
			var liste = knoepfe(host);
			if (!liste.length) { return null; }
			/* A page may ship the bar hidden so no-JS visitors see every
			 * section; the first switch makes it visible. */
			host.hidden = false;
			var aktiv = null;

			function key(button) { return button.getAttribute('data-reiter-knopf'); }

			function ausHash() {
				if (!optionen.hash) { return null; }
				var wunsch = decodeURIComponent(location.hash.slice(1));
				return liste.some(function (b) { return key(b) === wunsch; }) ? wunsch : null;
			}

			function waehlen(wunsch, still) {
				var ziel = liste.filter(function (b) { return key(b) === wunsch; })[0];
				if (!ziel || (!still && wunsch === aktiv)) { return; }
				aktiv = wunsch;
				liste.forEach(function (button) {
					var gewaehlt = button === ziel;
					button.setAttribute('aria-selected', String(gewaehlt));
					button.tabIndex = gewaehlt ? 0 : -1;
				});
				/* Tabs may share one panel (area pages re-render it), so hide by
				 * panel id rather than by tab. */
				var offen = panelOf(ziel);
				liste.forEach(function (button) {
					var panel = panelOf(button);
					if (panel && panel !== offen) { panel.hidden = true; }
				});
				if (offen) { offen.hidden = false; }
				if (optionen.hash && !still) {
					var adresse = new URL(location.href);
					adresse.hash = wunsch;
					try {
						if (optionen.verlauf) { history.pushState(null, '', adresse); }
						else { history.replaceState(null, '', adresse); }
					} catch (fehler) { /* file:// */ }
				}
				if (optionen.onShow) { optionen.onShow(wunsch); }
			}

			liste.forEach(function (button, index) {
				button.addEventListener('click', function () { waehlen(key(button)); });
				button.addEventListener('keydown', function (ereignis) {
					if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(ereignis.key)) { return; }
					ereignis.preventDefault();
					var nutzbar = liste.filter(sichtbar);
					var stelle = nutzbar.indexOf(button);
					var naechster = ereignis.key === 'Home' ? 0
						: ereignis.key === 'End' ? nutzbar.length - 1
						: (stelle + (ereignis.key === 'ArrowRight' ? 1 : -1) + nutzbar.length) % nutzbar.length;
					nutzbar[naechster].focus();
					waehlen(key(nutzbar[naechster]));
				});
			});

			if (optionen.hash) {
				/* pushState entries only fire popstate, plain hashes only
				 * hashchange; both must bring the matching tab back. */
				function ausVerlauf() {
					var wunsch = ausHash();
					if (wunsch) { waehlen(wunsch); }
				}
				window.addEventListener('hashchange', ausVerlauf);
				window.addEventListener('popstate', ausVerlauf);
			}

			var start = optionen.aktiv || ausHash()
				|| (liste.filter(function (b) { return b.getAttribute('aria-selected') === 'true'; })[0]
					&& key(liste.filter(function (b) { return b.getAttribute('aria-selected') === 'true'; })[0]))
				|| key(liste.filter(sichtbar)[0] || liste[0]);
			waehlen(start, true);

			return { waehlen: waehlen, aktuell: function () { return aktiv; } };
		}
	};
}());
