/* Vendor page: the where/what tabs, the place picker and the barter filter.
 *
 * The barter list reuses the shared filter UI: the offers arrive as compact
 * rows (goods id, list, price), the item facts come from the item index the
 * page already loads. That keeps 1,188 offers at about 40 KB of payload and
 * shows the rows in the same look as the item finder. */
(function () {
	'use strict';

	var lang = document.documentElement.lang || 'de';
	var seg = { de: 'gegenstand', en: 'item', fr: 'objet' }[lang] || 'gegenstand';
	var T = window.MQL_T || function (key) { return key; };
	var extra = {
		de: ['Schließen', '%s Treffer anzeigen', 'Ergebnisse nicht aktualisiert.', 'Erneut versuchen',
			'Als Seite öffnen', 'Ungültiger Stufenbereich', 'Tauschliste'],
		en: ['Close', 'Show %s results', 'Results not updated.', 'Try again', 'Open page',
			'Invalid level range', 'Barter list'],
		fr: ['Fermer', 'Afficher %s résultats', 'Résultats non actualisés.', 'Réessayer',
			'Ouvrir la page', 'Plage de niveaux incorrecte', 'Liste de troc']
	}[lang] || [];

	function fold(text) {
		return String(text || '').toLowerCase().normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss');
	}

	/* ---- tabs ------------------------------------------------------------ */

	function tabs() {
		var host = document.querySelector('.vendor-reiter .llb-reiter');
		if (host && window.MQL_REITER) {
			window.MQL_REITER.mount(host, { aktiv: 'was', hash: false });
		}
	}

	/* ---- place picker ----------------------------------------------------- */

	function orte() {
		var bild = document.getElementById('vendor-karte-bild');
		var pin = document.getElementById('vendor-karte-pin');
		var knopfreihe = document.querySelectorAll('.vendor-orte .ort-zeile');
		Array.prototype.forEach.call(knopfreihe, function (knopf) {
			knopf.addEventListener('click', function () {
				var datei = knopf.getAttribute('data-bild');
				if (bild && datei) {
					bild.src = '/karten/' + lang + '/' + datei.replace(/\.png$/, '.webp');
				}
				if (pin) {
					var x = knopf.getAttribute('data-pin-x');
					var y = knopf.getAttribute('data-pin-y');
					if (x === '' || y === '') { pin.hidden = true; }
					else {
						pin.hidden = false;
						pin.style.left = x + '%';
						pin.style.top = y + '%';
					}
				}
				Array.prototype.forEach.call(document.querySelectorAll('.vendor-orte li'), function (li) {
					li.classList.remove('ist-aktiv');
				});
				var li = knopf.closest('li');
				if (li) { li.classList.add('ist-aktiv'); }
			});
		});
	}

	/* ---- barter filter ---------------------------------------------------- */

	function tausch() {
		var root = document.querySelector('[data-tausch-root]');
		var quelle = document.getElementById('tausch-daten');
		var index = window.MQL_GEGENSTAENDE;
		if (!root || !quelle || !index || !window.MQL_FILTER_UI || !window.MQL_FILTERADAPTER) { return; }
		var daten;
		try { daten = JSON.parse(quelle.textContent); } catch (e) { return; }
		var nachId = new Map();
		(index.e || []).forEach(function (row) { nachId.set(row[0], row); });

		/* Eine Zeile je Gegenstand: Preise und Tauschlisten sammeln sich daran. */
		var rows = [], jeWare = new Map();
		(daten.waren || []).forEach(function (ware) {
			var row = nachId.get(ware[0]);
			if (!row) { return; }
			var eintrag = jeWare.get(ware[0]);
			if (!eintrag) {
				eintrag = {
					id: ware[0], name: row[1], icon: row[2] || null, quality: row[4] || 0,
					level: row[7] || 0, minLevel: row[14] || 0, liste: [], preise: []
				};
				jeWare.set(ware[0], eintrag);
				rows.push(eintrag);
			}
			if (eintrag.preise.indexOf(ware[2]) < 0) { eintrag.preise.push(ware[2]); }
			if (eintrag.liste.indexOf(ware[1]) < 0) { eintrag.liste.push(ware[1]); }
		});
		if (!rows.length) { return; }

		var listen = (daten.listen || []).map(function (name, i) {
			return { value: i, label: name || '–' };
		});

		function matches(row, s, skip) {
			var level = s.filters.level || { min: null, max: null };
			var quality = s.filters.quality || [];
			var liste = s.filters.liste || [];
			if (skip !== 'level' && (level.min !== null || level.max !== null)) {
				if (!(row.level > 0)) { return false; }
				if (level.min !== null && row.level < level.min) { return false; }
				if (level.max !== null && row.level > level.max) { return false; }
			}
			if (skip !== 'quality' && quality.length && quality.indexOf(row.quality) < 0) { return false; }
			if (skip !== 'liste' && liste.length && !row.liste.some(function (i) { return liste.indexOf(i) >= 0; })) { return false; }
			if (skip !== 'q' && s.q) {
				var worte = fold(s.q).split(/\s+/).filter(Boolean);
				var name = fold(row.name) + '\n' + fold(row.id);
				if (!worte.every(function (w) { return name.indexOf(w) >= 0; })) { return false; }
			}
			return true;
		}

		function compare(a, b, sort) {
			if (sort === 'itemLevel') {
				var la = a.level || Infinity, lb = b.level || Infinity;
				if (la !== lb) { return la - lb; }
			}
			if (window.MQL_SORT && window.MQL_SORT.compare) { return window.MQL_SORT.compare(a.name, b.name); }
			return a.name.localeCompare(b.name, lang) || a.id.localeCompare(b.id);
		}

		function facets(rows, s) {
			var quality = [0, 0, 0, 0, 0, 0];
			var liste = (daten.listen || []).map(function () { return 0; });
			rows.forEach(function (row) {
				if (matches(row, s, 'quality') && quality[row.quality] !== undefined) { quality[row.quality]++; }
				if (matches(row, s, 'liste')) { row.liste.forEach(function (i) { if (liste[i] !== undefined) { liste[i]++; } }); }
			});
			return {
				quality: quality.map(function (count, value) { return { value: value, count: count }; }),
				liste: liste.map(function (count, value) { return { value: value, count: count }; })
			};
		}

		function renderResults(result, target) {
			target.replaceChildren();
			var ui = window.MQL_TREFFERZEILE;
			if (ui) { ui.header(target, { progress: false, levelHeading: ui.words.itemLevel }); }
			result.payload.forEach(function (row) {
				var preis = row.preise.join(' · ');
				var meta = [preis, T('gs_qual_' + row.quality)].filter(Boolean).join(' · ');
				if (ui) {
					target.appendChild(ui.row(target, {
						image: row.icon, icon: 'gegenstand', name: row.name,
						href: '/' + lang + '/' + seg + '/' + row.id + '/',
						meta: meta, levelHeading: ui.words.itemLevel,
						values: row.level > 0 ? [{ label: ui.words.itemLevel, value: row.level }] : [],
						progress: null
					}));
					return;
				}
				var li = document.createElement('li');
				var a = document.createElement('a');
				a.className = 'gs-zeile';
				a.href = '/' + lang + '/' + seg + '/' + row.id + '/';
				if (row.icon) {
					var bild = document.createElement('img');
					bild.className = 'symbol';
					bild.width = 26; bild.height = 26; bild.alt = ''; bild.loading = 'lazy';
					bild.src = '/bild/items/' + row.icon + '.webp';
					bild.addEventListener('error', function () { bild.hidden = true; });
					a.appendChild(bild);
				}
				var name = document.createElement('span');
				name.className = 'gs-name q' + row.quality;
				name.textContent = row.name;
				a.appendChild(name);
				var text = document.createElement('span');
				text.className = 'gs-meta';
				text.textContent = meta;
				a.appendChild(text);
				li.appendChild(a);
				target.appendChild(li);
			});
			if (!result.total) {
				var leer = document.createElement('li');
				leer.className = 'gs-leer';
				leer.textContent = T('gs_keine');
				target.appendChild(leer);
			}
		}

		var defaults = function () {
			return {
				q: '', filters: { level: { min: null, max: null }, quality: [], liste: [] },
				sort: 'name', pagination: { kind: 'limit', limit: 50 }
			};
		};
		var labels = {
			search: T('gs_suchen'), filter: T('gs_filter'), close: extra[0], sort: T('gs_sort'),
			reset: T('gs_reset'), more: T('gs_mehr'), count: T('gs_viele'), show: extra[1],
			loading: T('gs_lade'), error: extra[2], retry: extra[3], fallback: extra[4],
			invalidRange: extra[5], min: T('gs_von'), max: T('gs_bis'),
			placeholder: T('gs_platzhalter')
		};
		var config = {
			area: root.getAttribute('data-filter-area') || 'haendler-tausch',
			lang: lang,
			rootUrl: location.origin + location.pathname,
			labels: labels,
			search: { submit: 'debounce', debounceMs: 200 },
			groups: [
				{ id: 'level', kind: 'range', label: T('gs_stufe'), min: 0, max: 2000,
					rangeLabel: function (bereich) {
						return T('gs_stufe') + ' ' + (bereich.min === null ? '…' : bereich.min)
							+ '–' + (bereich.max === null ? '…' : bereich.max);
					} },
				{ id: 'quality', kind: 'multi', label: T('gs_qualitaet'),
					options: [0, 1, 2, 3, 4, 5].map(function (v) { return { value: v, label: T('gs_qual_' + v) }; }) },
				{ id: 'liste', kind: 'multi', label: extra[6], options: listen }
			],
			sort: { options: [{ value: 'name', label: T('gs_sort_name') },
				{ value: 'itemLevel', label: T('gs_sort_stufe') }] },
			pagination: { kind: 'limit', size: 50 },
			defaults: defaults
		};
		var codec = window.MQL_FILTERADAPTER.codec([
			{ param: 'q', path: ['q'] },
			{ param: 'tvon', path: ['filters', 'level', 'min'], type: 'number' },
			{ param: 'tbis', path: ['filters', 'level', 'max'], type: 'number' },
			{ param: 'tqual', path: ['filters', 'quality'], type: 'csv' },
			{ param: 'tliste', path: ['filters', 'liste'], type: 'csv' },
			{ param: 'sort', path: ['sort'],
				decode: function (v) { return v === 'stufe' ? 'itemLevel' : 'name'; },
				encode: function (v) { return v === 'itemLevel' ? 'stufe' : null; } }
		], defaults);
		config.urlCodec = codec;

		var adapter = window.MQL_FILTERADAPTER.client({
			rows: rows,
			id: function (row) { return row.id; },
			matches: matches,
			compare: compare,
			facets: facets,
			renderResults: renderResults
		});
		var liste = root.querySelector('[data-filter-results]');
		if (!liste) { return; }
		liste.setAttribute('data-filter-results', '');
		window.MQL_FILTER_UI.mount(root, { config: config, adapter: adapter });
	}

	function start() {
		tabs();
		orte();
		tausch();
	}

	if (document.readyState === 'complete') { start(); }
	else { window.addEventListener('load', start); }
})();
