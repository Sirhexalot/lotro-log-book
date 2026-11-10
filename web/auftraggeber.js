/* Imported progress on a quest-giver page: mark completed quests, count them,
 * and offer hiding them. Without an imported character nothing is claimed.
 * Also works on catalogue pages, where the character switch does not reload.
 *
 * The filter tree (region → landscape) is expanded here: without JavaScript
 * every branch stays open, so the filter remains usable.
 */
(function () {
	'use strict';

	var offen = {};

	function baum() {
		var tree = document.querySelector('.giver-tree');
		if (!tree) { return; }
		Array.prototype.forEach.call(tree.querySelectorAll('.giver-zweig'), function (zweig) {
			var kinder = zweig.querySelector('.giver-kinder');
			var pfeil = zweig.querySelector('.giver-pfeil');
			if (!kinder || !pfeil) { return; }
			var schluessel = zweig.getAttribute('data-region');
			var gewaehlt = !!zweig.querySelector('input:checked');
			if (offen[schluessel] === undefined) { offen[schluessel] = gewaehlt; }
			var sichtbar = offen[schluessel] || gewaehlt;
			kinder.hidden = !sichtbar;
			pfeil.textContent = sichtbar ? '▾' : '▸';
			pfeil.setAttribute('aria-expanded', sichtbar ? 'true' : 'false');
		});
	}

	document.addEventListener('click', function (event) {
		var pfeil = event.target && event.target.closest ? event.target.closest('.giver-pfeil') : null;
		if (!pfeil) { return; }
		var zweig = pfeil.closest('.giver-zweig');
		if (!zweig) { return; }
		event.preventDefault();
		var schluessel = zweig.getAttribute('data-region');
		offen[schluessel] = !offen[schluessel];
		baum();
	});
	// sets.js replaces the whole form after filtering; the open branches are
	// kept in this script, not in the replaced markup.
	document.addEventListener('mql:filterbrowser', baum);
	baum();

	// The list remembers its filters, so a detail page can lead back to them.
	var merker = window.MQL_FILTER;
	var baumFeld = document.querySelector('.giver-tree');
	if (merker && baumFeld) {
		var sprache = (window.location.pathname.split('/')[1] || 'de');
		var merken = function () {
			if (window.location.search) {
				merker.write('auftraggeber', sprache, window.location.search.slice(1));
			}
		};
		merken();
		document.addEventListener('mql:filterbrowser', function () {
			// sets.js may write the address after this event; read it afterwards.
			window.setTimeout(merken, 0);
		});
		var zurueck = document.querySelector('.sets-filter-actions a');
		if (zurueck) {
			zurueck.addEventListener('click', function () {
				merker.clear('auftraggeber', sprache);
			});
		}
		if (!window.location.search) {
			var gespeichert = merker.read('auftraggeber', sprache);
			if (gespeichert) {
				window.location.replace(window.location.pathname + '?' + gespeichert);
			}
		}
	}

	var box = document.querySelector('.giver-quests');
	if (!box) { return; }
	var list = box.querySelector('.giver-list');
	var progress = box.querySelector('.giver-progress');
	var toggle = box.querySelector('.giver-hide');
	var rows = Array.prototype.slice.call(list ? list.querySelectorAll('li[data-quest]') : []);

	function fill(template, done, total) {
		var parts = String(template || '').split('%s');
		return parts[0] + done + (parts[1] || '') + total + (parts[2] || '');
	}

	function render() {
		var store = window.MQL_SPEICHER;
		var aktiv = store && store.aktiv ? store.aktiv() : null;
		var done = {};
		if (aktiv && aktiv.quests) {
			aktiv.quests.forEach(function (id) { done[String(id).toUpperCase()] = true; });
		}
		var count = 0;
		rows.forEach(function (row) {
			var finished = !!done[String(row.getAttribute('data-quest')).toUpperCase()];
			if (finished) { count += 1; }
			row.setAttribute('data-state', finished ? 'done' : 'open');
			var state = row.querySelector('.giver-state');
			if (state) {
				// Without an imported character there is no state to show; a
				// column of dots would only pretend otherwise.
				state.textContent = finished ? '✓' : '·';
				state.title = finished ? box.getAttribute('data-done-label') : box.getAttribute('data-open-label');
				state.hidden = !aktiv;
			}
		});
		if (progress) {
			progress.textContent = aktiv
				? fill(box.getAttribute('data-progress'), count, rows.length)
				: (box.getAttribute('data-unknown') || '');
			progress.hidden = false;
		}
		if (toggle) {
			toggle.hidden = !aktiv;
			if (!aktiv) {
				var input = toggle.querySelector('input');
				if (input) { input.checked = false; }
				box.classList.remove('giver-hide-done');
			}
		}
	}

	if (toggle) {
		toggle.addEventListener('change', function (event) {
			box.classList.toggle('giver-hide-done', event.target.checked);
		});
	}
	document.addEventListener('change', function (event) {
		if (event.target && event.target.id === 'katalog-charakter') { render(); }
	});
	window.addEventListener('storage', function (event) {
		if (event.key === 'mql.charaktere') { render(); }
	});
	render();
})();
