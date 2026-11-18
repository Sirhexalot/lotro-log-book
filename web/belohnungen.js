/* Reward browser: compact results with the shared filter shell. */
(function () {
	'use strict';
	var T = window.MQL_T || function (key) { return key; };
	var lang = window.MQL_SPRACHE || 'de';
	var main = document.getElementById('belohnungen');
	if (!main || !window.MQL_FILTER_UI || !window.MQL_FILTERADAPTER) { return; }
	var controller;

	function node(tag, text) {
		var element = document.createElement(tag);
		if (text !== undefined) { element.textContent = text; }
		return element;
	}
	function sourcePath(source) {
		return source[7] || [];
	}
	/* Only reward items live here. Titles and virtues have their own catalogue
	 * pages in the Erfolge menu, and duplicating them produced two lists of the
	 * same 2.500 entries. */
	function renderRow(row) {
		var li = node('li');
		var article = node('article');
		article.className = 'bl-ergebnis-zeile bl-art-g';
		var icon = node('span');
		icon.className = 'symbol symbol-svg bl-symbol';
		icon.innerHTML = window.MQL_SYMBOL ? window.MQL_SYMBOL('gegenstand', 'bl-symbol-svg') : '';
		article.appendChild(icon);
		var heading = node('div');
		heading.className = 'bl-ergebnis-kopf';
		var name = node('a', row.name);
		name.className = 'bl-name q' + (row.raw[2] || 0);
		name.href = '/' + lang + '/' +
			({de: 'gegenstand', en: 'item', fr: 'objet'}[lang] || 'gegenstand') + '/' +
			encodeURIComponent(row.raw[0]) + '/';
		heading.appendChild(name);
		var meta = [T('bl_gegenstaende')];
		if (row.raw[3]) { meta.push(T('stufe') + ' ' + row.raw[3]); }
		var metadata = node('span', meta.join(' · '));
		metadata.className = 'bl-meta';
		heading.appendChild(metadata);
		article.appendChild(heading);
		li.appendChild(article);
		return li;
	}

	function makeGeoTree(rows) {
		var roots = [];
		var known = new Map();
		function add(path, depth, parent) {
			if (depth >= path.length) { return; }
			var pair = path[depth], id = String(pair[0]);
			var key = (parent ? parent.key + '/' : '') + id;
			var option = known.get(key);
			if (!option) {
				var pathIds = (parent ? parent.pathIds : []).concat([id]);
				var pathObject = {geo: pathIds};
				option = {path: pathObject, label: pair[1], children: [], pathIds: pathIds, key: key};
				known.set(key, option);
				(parent ? parent.children : roots).push(option);
			}
			add(path, depth + 1, option);
		}
		rows.forEach(function (row) {
			row.sources.forEach(function (source) { add(sourcePath(source), 0, null); });
		});
		function clean(options) {
			options.sort(function (a, b) { return a.label.localeCompare(b.label, lang); });
			options.forEach(function (option) {
				if (!option.children.length) { delete option.children; }
				else { clean(option.children); }
				delete option.pathIds; delete option.key;
			});
		}
		clean(roots);
		return roots;
	}

	window.MQL_BELOHNUNGEN_ZEICHNEN = function () {
		if (controller || !window.MQL_BELOHNUNGEN) { return; }
		var data = window.MQL_BELOHNUNGEN, rows = [], allGeoPaths = new Map();
		function add(raw, name, sources) {
			sources = sources || [];
			var geo = [];
			sources.forEach(function (source) {
				var path = sourcePath(source);
				for (var length = 1; length <= path.length; length++) {
					var ids = path.slice(0, length).map(function (pair) { return String(pair[0]); });
					var key = JSON.stringify(ids);
					if (!allGeoPaths.has(key)) { allGeoPaths.set(key, path.slice(0, length)); }
					if (length === path.length && !geo.some(function (p) { return JSON.stringify(p) === key; })) {
						geo.push(ids);
					}
				}
			});
			rows.push({
				id: 'g:' + raw[0], raw: raw, name: name, sources: sources, geo: geo,
				search: (name + '\n' + sources.map(function (source) { return source[2]; }).join('\n')).toLocaleLowerCase()
			});
		}
		data.g.forEach(function (row) { add(row, row[1], row[5]); });

		var typeValues = [];
		(data.o || []).forEach(function (label) {
			if (!typeValues.some(function (value) { return value.label === label; })) {
				typeValues.push({value: label, label: label});
			}
		});
		var tree = makeGeoTree(rows);
		var geoKeys = new Set(Array.from(allGeoPaths.keys()));
		var A = window.MQL_FILTERADAPTER;
		var extra = {
			de: {close: 'Schließen', show: '%s Treffer anzeigen', error: 'Ergebnisse nicht aktualisiert.', retry: 'Erneut versuchen', fallback: 'Als Seite öffnen'},
			en: {close: 'Close', show: 'Show %s results', error: 'Results not updated.', retry: 'Try again', fallback: 'Open page'},
			fr: {close: 'Fermer', show: 'Afficher %s résultats', error: 'Résultats non actualisés.', retry: 'Réessayer', fallback: 'Ouvrir la page'}
		}[lang] || {};
		var config = {
			area: 'belohnungen', lang: lang, rootUrl: location.origin + location.pathname,
			labels: {
				search: T('gs_suchen'), filter: T('gs_filter'), close: extra.close,
				sort: T('gs_sort'), reset: T('gs_reset'), more: T('gs_mehr'),
				count: T('bl_anzahl'), show: extra.show,
				loading: T('gs_lade'), error: extra.error, retry: extra.retry, fallback: extra.fallback,
				min: T('gs_von'), max: T('gs_bis'), placeholder: T('bl_suche')
			},
			groups: [
				{id: 'art', kind: 'multi', label: T('bl_art'), options: typeValues},
				{id: 'geo', kind: 'tree', label: T('bl_region_gebiet'), options: tree,
					exclusivePaths: true, validatePath: function (path) {
						return Array.isArray(path.geo) && geoKeys.has(JSON.stringify(path.geo));
					}, pathLabel: function (path) {
						var labels = [], ids = path.geo || [];
						ids.forEach(function (id, index) {
							var pair = allGeoPaths.get(JSON.stringify(ids.slice(0, index + 1)));
							if (pair && pair[index]) { labels.push(pair[index][1]); }
						});
						return labels.join(' › ');
					}}
			],
			pagination: {kind: 'limit', size: 50},
			defaults: function () {
				return {q: '', filters: {art: [], geo: []},
					pagination: {kind: 'limit', limit: 50}};
			}
		};
		// Deed kinds are labels, not numbers: a "csv" field would parse them to
		// NaN and silently drop the filter on reload.
		var baseCodec = A.codec([
			{param: 'q', path: ['q']},
			{param: 'art', path: ['filters', 'art'], type: 'multi'}
		], config.defaults);
		config.urlCodec = {
			decode: function (url) {
				var parsed = baseCodec.decode(url);
				parsed.state.filters.geo = url.searchParams.getAll('gebiet').map(function (raw) {
					return {geo: raw.split('>').filter(Boolean)};
				});
				if (url.searchParams.has('gebiet')) { parsed.explicit = true; }
				return parsed;
			},
			encode: function (state, url) {
				url = baseCodec.encode(state, url);
				url.searchParams.delete('gebiet');
				(state.filters.geo || []).forEach(function (path) {
					url.searchParams.append('gebiet', (path.geo || []).join('>'));
				});
				return url;
			}
		};
		function pathMatches(row, selected) {
			return row.geo.some(function (path) {
				return selected.geo.every(function (id, index) { return path[index] === id; });
			});
		}
		function matches(row, state, skip) {
			var filters = state.filters;
			return (!state.q || row.search.indexOf(state.q.toLocaleLowerCase()) >= 0) &&
				(skip !== 'art' && filters.art.length ? row.sources.some(function (source) { return filters.art.indexOf(source[5]) >= 0; }) : true) &&
				(skip !== 'geo' && filters.geo.length ? filters.geo.some(function (path) { return pathMatches(row, path); }) : true) &&
				row.sources.length > 0;
		}
		function facets(rowsToCount, state) {
			function count(group, value) {
				var candidate = {q: state.q, filters: JSON.parse(JSON.stringify(state.filters))};
				return rowsToCount.filter(function (row) {
					if (group === 'art') { candidate.filters.art = [value]; }
					if (group === 'geo') { candidate.filters.geo = [value]; }
					return matches(row, candidate);
				}).length;
			}
			var geoFacets = [];
			allGeoPaths.forEach(function (path, key) {
				geoFacets.push({value: {geo: JSON.parse(key)}, count: count('geo', {geo: JSON.parse(key)})});
			});
			return {
				art: typeValues.map(function (option) { return {value: option.value, count: count('art', option.value)}; }),
				geo: geoFacets
			};
		}
		var adapter = A.client({
			rows: rows, id: function (row) { return row.id; }, matches: matches, facets: facets,
			compare: function (a, b) { return a.name.localeCompare(b.name, lang) || a.id.localeCompare(b.id); },
			renderResults: function (result, target) {
				target.replaceChildren();
				result.payload.forEach(function (row) { target.appendChild(renderRow(row)); });
				if (!result.total) {
					var empty = node('li', T('bl_keine')); empty.className = 'gs-leer'; target.appendChild(empty);
				}
			}
		});
		var target = document.getElementById('bl-ergebnis');
		target.dataset.filterResults = '';
		main.appendChild(target);
		main.querySelector('.gs-raster').remove();
		main.querySelector('#bl-suche').remove();
		controller = window.MQL_FILTER_UI.mount(main, {config: config, adapter: adapter});
		window.MQL_BELOHNUNGEN_FILTER = controller;
	};
	if (window.MQL_BELOHNUNGEN) { window.MQL_BELOHNUNGEN_ZEICHNEN(); }
}());
