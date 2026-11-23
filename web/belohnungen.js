/* Reward browser: items from deeds and quests, on the shared result table.
 * The list definition in web/listen/belohnungen.js owns order, labels, columns,
 * sorting and paging; this file owns the predicates, the facets and the rows. */
(function () {
	'use strict';
	var T = window.MQL_T || function (key) { return key; };
	var lang = window.MQL_SPRACHE || 'de';
	var main = document.getElementById('belohnungen');
	if (!main || !window.MQL_FILTER_UI || !window.MQL_FILTERADAPTER) { return; }
	var controller;
	var L = (window.MQL_LISTEN || {}).belohnungen || null;
	var EIGN = window.MQL_EIGNUNG || null;

	function node(tag, text) {
		var element = document.createElement(tag);
		if (text !== undefined) { element.textContent = text; }
		return element;
	}
	function sourcePath(source) {
		return source[7] || [];
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
			options.sort(function (a, b) { return MQL_SORT.compare(a.label, b.label); });
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
		function beschriftung(id, fallback) {
			var treffer = null;
			if (L && L.filter) { L.filter.forEach(function (def) { if (def.id === id) { treffer = def; } }); }
			return treffer && treffer.labelKey ? T(treffer.labelKey) : fallback;
		}
		var eignungW = EIGN ? EIGN.woerter : null;
		var eignungOptionen = eignungW ? [
			{value: 'passt', label: eignungW.chipPasst}, {value: 'achtung', label: eignungW.chipAchtung},
			{value: 'aelter', label: eignungW.chipAelter}, {value: 'ueberholt', label: eignungW.chipUeberholt},
			{value: 'zu-hoch', label: eignungW.chipZuHoch}, {value: 'falsch', label: eignungW.chipFalsch},
			{value: 'unklar', label: eignungW.chipUnklar}
		] : [];
		var zeigeEignung = eignungOptionen.length > 0 && !!(EIGN && EIGN.charakter());
		var qualityOptions = [0, 1, 2, 3, 4, 5].map(function (value) {
			return {value: value, label: T('gs_qual_' + value)};
		});
		var gruppen = {
			art: {id: 'art', kind: 'multi', label: beschriftung('art', T('bl_tatart')), options: typeValues},
			geo: {id: 'geo', kind: 'tree', label: beschriftung('geo', T('bl_region_gebiet')), options: tree,
				exclusivePaths: true, validatePath: function (path) {
					return Array.isArray(path.geo) && geoKeys.has(JSON.stringify(path.geo));
				}, pathLabel: function (path) {
					var labels = [], ids = path.geo || [];
					ids.forEach(function (id, index) {
						var pair = allGeoPaths.get(JSON.stringify(ids.slice(0, index + 1)));
						if (pair && pair[index]) { labels.push(pair[index][1]); }
					});
					return labels.join(' › ');
				}},
			quality: {id: 'quality', kind: 'multi', label: beschriftung('quality', T('gs_qualitaet')), options: qualityOptions},
			eignung: zeigeEignung ? {id: 'eignung', kind: 'multi', label: beschriftung('eignung', T('gs_eignung')), options: eignungOptionen} : null
		};
		var reihenfolge = L && L.filter ? L.filter : [{id: 'art'}, {id: 'geo'}, {id: 'quality'}, {id: 'eignung'}];
		var groups = reihenfolge.map(function (def) { return gruppen[def.id] || null; }).filter(Boolean);
		var groesse = (L && L.blaettern && L.blaettern.groesse) || 50;
		var config = {
			area: 'belohnungen', lang: lang, rootUrl: location.origin + location.pathname,
			labels: {
				search: T('gs_suchen'), filter: T('gs_filter'), close: extra.close,
				sort: T('gs_sort'), reset: T('gs_reset'), more: T('gs_mehr'),
				count: T('bl_anzahl'), show: extra.show,
				loading: T('gs_lade'), error: extra.error, retry: extra.retry, fallback: extra.fallback,
				min: T('gs_von'), max: T('gs_bis'), placeholder: T('bl_suche')
			},
			groups: groups,
			// One sortable column: the table head sorts, no select.
			sort: {keys: ['name'], ersteRichtung: {name: 'asc'}, options: []},
			pagination: {kind: 'limit', size: groesse},
			defaults: function () {
				return {q: '', filters: {art: [], geo: [], quality: [], eignung: []}, sort: 'name', sortDir: 'asc',
					pagination: {kind: 'limit', limit: groesse}};
			}
		};
		// Deed kinds are labels, not numbers: a "csv" field would parse them to
		// NaN and silently drop the filter on reload. Suitability values are
		// words too.
		var baseCodec = A.codec([
			{param: 'q', path: ['q']},
			{param: 'art', path: ['filters', 'art'], type: 'multi'},
			{param: 'qual', path: ['filters', 'quality'], type: 'csv'},
			{param: 'eig', path: ['filters', 'eignung'],
				decode: function (wert) { return String(wert).split(',').filter(Boolean); },
				encode: function (werte) { return werte && werte.length ? werte.join(',') : null; }}
		], config.defaults);
		config.urlCodec = {
			decode: function (url) {
				var parsed = baseCodec.decode(url);
				parsed.state.filters.geo = url.searchParams.getAll('gebiet').map(function (raw) {
					return {geo: raw.split('>').filter(Boolean)};
				});
				if (url.searchParams.has('gebiet')) { parsed.explicit = true; }
				// One sortable column; only the direction can differ from the default.
				var sort = url.searchParams.get('sort');
				if (sort === 'name' || sort === '-name') {
					parsed.state.sort = 'name';
					parsed.state.sortDir = sort === '-name' ? 'desc' : 'asc';
					parsed.explicit = true;
				}
				return parsed;
			},
			encode: function (state, url) {
				url = baseCodec.encode(state, url);
				url.searchParams.delete('gebiet');
				url.searchParams.delete('sort');
				(state.filters.geo || []).forEach(function (path) {
					url.searchParams.append('gebiet', (path.geo || []).join('>'));
				});
				if (state.sortDir === 'desc') { url.searchParams.set('sort', '-name'); }
				return url;
			}
		};
		function pathMatches(row, selected) {
			return row.geo.some(function (path) {
				return selected.geo.every(function (id, index) { return path[index] === id; });
			});
		}
		function einstufung(row, charakter) {
			return EIGN && zeigeEignung ? EIGN.ton(row.raw[7], charakter) : null;
		}
		function matches(row, state, skip) {
			var filters = state.filters, charakter = EIGN ? EIGN.charakter() : null;
			var eignung = filters.eignung || [];
			var stand = eignung.length && charakter ? einstufung(row, charakter) : null;
			return (!state.q || row.search.indexOf(state.q.toLocaleLowerCase()) >= 0) &&
				(skip === 'art' || !filters.art.length || row.sources.some(function (source) { return filters.art.indexOf(source[5]) >= 0; })) &&
				(skip === 'geo' || !filters.geo.length || filters.geo.some(function (path) { return pathMatches(row, path); })) &&
				(skip === 'quality' || !filters.quality.length || filters.quality.indexOf(row.raw[2]) >= 0) &&
				(skip === 'eignung' || !eignung.length || !!(stand && eignung.indexOf(stand.code) >= 0)) &&
				row.sources.length > 0;
		}
		function facets(rowsToCount, state) {
			var charakter = EIGN ? EIGN.charakter() : null;
			var artRows = rowsToCount.filter(function (row) { return matches(row, state, 'art'); });
			var geoRows = rowsToCount.filter(function (row) { return matches(row, state, 'geo'); });
			var qualityRows = rowsToCount.filter(function (row) { return matches(row, state, 'quality'); });
			var eignungRows = rowsToCount.filter(function (row) { return matches(row, state, 'eignung'); });
			var geoFacets = [];
			allGeoPaths.forEach(function (path, key) {
				var value = {geo: JSON.parse(key)};
				geoFacets.push({value: value, count: geoRows.filter(function (row) { return pathMatches(row, value); }).length});
			});
			return {
				art: typeValues.map(function (option) {
					return {value: option.value, count: artRows.filter(function (row) {
						return row.sources.some(function (source) { return source[5] === option.value; });
					}).length};
				}),
				geo: geoFacets,
				quality: qualityOptions.map(function (option) {
					return {value: option.value, count: qualityRows.filter(function (row) { return row.raw[2] === option.value; }).length};
				}),
				eignung: zeigeEignung ? eignungOptionen.map(function (option) {
					return {value: option.value, count: eignungRows.filter(function (row) {
						var stand = einstufung(row, charakter);
						return stand && stand.code === option.value;
					}).length};
				}) : []
			};
		}
		function zeileFuer(row) {
			var link = node('a');
			link.className = 'gs-zeile';
			link.href = '/' + lang + '/' +
				({de: 'gegenstand', en: 'item', fr: 'objet'}[lang] || 'gegenstand') + '/' + row.raw[0] + '/';
			var icon = node('span');
			// Same icon tile as every result row; the reward type only tints the symbol.
			icon.className = 'bl-symbol mql-row-icon mql-row-icon-entity';
			icon.innerHTML = window.MQL_SYMBOL ? window.MQL_SYMBOL('gegenstand', 'bl-symbol-svg') : '';
			link.appendChild(icon);
			var name = node('span', row.name);
			name.className = 'gs-name q' + (row.raw[2] || 0);
			link.appendChild(name);
			var meta = node('span');
			meta.className = 'gs-meta';
			var teile = [];
			if (row.raw[3] > 0) { teile.push(T('gs_gegenstandsstufe') + ' ' + row.raw[3]); }
			meta.textContent = teile.join(' · ');
			if (meta.textContent) { link.appendChild(meta); }
			var stand = einstufung(row, EIGN ? EIGN.charakter() : null);
			if (stand) {
				var marke = node('span');
				marke.className = 'mql-row-eignung';
				marke.appendChild(EIGN.chip(stand));
				link.appendChild(marke);
			}
			return link;
		}
		var adapter = A.client({
			rows: rows, id: function (row) { return row.id; }, matches: matches, facets: facets,
			compare: function (a, b, sort, dir) {
				var c = MQL_SORT.compare(a.name, b.name) || a.id.localeCompare(b.id);
				return dir === 'desc' ? -c : c;
			},
			renderResults: function (result, target) {
				target.replaceChildren();
				var spalten = [{label: T('gs_sort_name'), sortierung: 'name'}];
				if (!window.MQL_TABELLE) { return; }
				var bau = window.MQL_TABELLE.bauen(target, spalten, {key: result.state.sort, dir: result.state.sortDir});
				if (!result.total) {
					var leer = document.createElement('tr'); leer.setAttribute('role', 'row');
					var zelle = document.createElement('td'); zelle.setAttribute('role', 'cell');
					zelle.textContent = T('bl_keine'); leer.appendChild(zelle); bau.koerper.appendChild(leer);
					return;
				}
				result.payload.forEach(function (row) {
					bau.koerper.appendChild(window.MQL_TABELLE.zeile(spalten, [zeileFuer(row)]));
				});
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
