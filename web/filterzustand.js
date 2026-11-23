/* Pure filter state. URL codecs and predicates belong to each adapter. */
(function (root) {
	'use strict';
	function copy(value) { return JSON.parse(JSON.stringify(value)); }
	/** Sort keys a list offers: its column keys or its select options. */
	/** Every selectable value of a group, including nested options that name it
	 *  through `groupId` (the area leaves of a geography tree). */
	function groupOptions(config, group) {
		var out = (group.options || []).slice();
		function walk(list) {
			(list || []).forEach(function (option) {
				if (option.groupId === group.id && !out.some(function (o) { return o.value === option.value; })) {
					out.push(option);
				}
				if (option.children) { walk(option.children); }
			});
		}
		(config.groups || []).forEach(function (g) { walk(g.options); });
		return out;
	}
	function sortKeys(config) {
		if (!config.sort) { return []; }
		if (config.sort.keys) { return config.sort.keys; }
		return (config.sort.options || []).map(function (o) { return o.value; });
	}
	function enthaeltPfad(ober, unter) {
		return Object.keys(ober).every(function (key) {
			return Object.prototype.hasOwnProperty.call(unter,key) && unter[key] === ober[key];
		});
	}
	function normalize(config, candidate, context) {
		var state = copy(config.defaults(context)), notices = [];
		candidate = candidate || {};
		state.q = typeof candidate.q === 'string' ? Array.from(candidate.q.trim()).slice(0, 200).join('') : state.q;
		(config.groups || []).forEach(function (group) {
			if (group.available && !group.available(context)) { return; }
			var value = (candidate.filters || {})[group.id];
			if (value === undefined) { return; }
			if (group.kind === 'range') {
				var range = {}, valid = true;
				if (!value || typeof value !== 'object' || Array.isArray(value)) {
					notices.push({groupId: group.id, code: 'invalid-range'}); return;
				}
				['min', 'max'].forEach(function (key) {
					var n = value && value[key];
					if (n === '' || n === null || n === undefined) { range[key] = null; return; }
					if (typeof n !== 'number' || !Number.isSafeInteger(n) || n < 0 ||
					(group.min !== undefined && n < group.min) || (group.max !== undefined && n > group.max)) { valid = false; }
					range[key] = n;
				});
				if (range.min !== null && range.max !== null && range.min > range.max) { valid = false; }
				if (valid) { state.filters[group.id] = range; }
				else { notices.push({groupId: group.id, code: 'invalid-range'}); }
			} else {
				var options = group.kind === 'multi' ? groupOptions(config, group) : (group.options || []);
				if (group.kind === 'multi') {
					state.filters[group.id] = options.map(function (o) { return o.value; }).filter(function (v) {
						return Array.isArray(value) && value.indexOf(v) >= 0;
					});
				} else if (group.kind === 'tree') {
					var seen = {};
					state.filters[group.id] = [];
					(Array.isArray(value) ? value : []).forEach(function (path) {
						// Adapter validates complete paths against its game-key index.
						if (!path || typeof path !== 'object' || Array.isArray(path) || !group.validatePath || !group.validatePath(path)) { return; }
						var sorted = {};
						Object.keys(path).sort().forEach(function (k) {
							if (k !== '__proto__' && k !== 'constructor' && k !== 'prototype') { sorted[k] = path[k]; }
						});
						var key = JSON.stringify(sorted);
						if (!seen[key]) { state.filters[group.id].push(sorted); seen[key] = true; }
					});
					if (group.exclusivePaths) {
						var paths = state.filters[group.id];
						state.filters[group.id] = paths.filter(function (path) {
							return !paths.some(function (other) {
								return other !== path && Object.keys(other).length > Object.keys(path).length &&
									enthaeltPfad(path,other);
							});
						});
					}
				} else if (group.kind === 'boolean') {
					state.filters[group.id] = value === true;
				} else if (options.some(function (o) { return o.value === value; })) {
					state.filters[group.id] = value;
				}
			}
		});
		var keys = sortKeys(config);
		if (keys.indexOf(candidate.sort) >= 0) { state.sort = candidate.sort; }
		if (candidate.sortDir === 'asc' || candidate.sortDir === 'desc') { state.sortDir = candidate.sortDir; }
		// Only lists that sort by column carry a direction; the older select
		// keeps its single ascending order and its state shape.
		else if (state.sortDir === undefined && config.sort && (config.sort.keys || config.sort.ersteRichtung)) { state.sortDir = 'asc'; }
		var p = candidate.pagination;
		if (p && p.kind === state.pagination.kind) {
			var key = p.kind === 'page' ? 'page' : p.kind === 'limit' ? 'limit' : null;
			if (key && Number.isSafeInteger(p[key]) && p[key] > 0) { state.pagination[key] = p[key]; }
		}
		return {state: state, notices: notices};
	}
	function reduce(config, state, action, context) {
		if (action.type === 'reset') { return normalize(config, {}, context); }
		var next = copy(state);
		if (action.type === 'searchSubmit' || action.type === 'searchInput') { next.q = action.value; }
		else if (action.type === 'sort') {
			// A select sends its value, a table head sends key and direction.
			if (action.value && typeof action.value === 'object') {
				next.sort = action.value.key;
				next.sortDir = action.value.dir === 'desc' ? 'desc' : 'asc';
			} else { next.sort = action.value; next.sortDir = 'asc'; }
		}
		else if (action.type === 'sortToggle') {
			var sortKey = action.key, available = sortKeys(config);
			if (available.indexOf(sortKey) < 0) { throw new Error('Unknown sort key'); }
			if (next.sort === sortKey) { next.sortDir = next.sortDir === 'asc' ? 'desc' : 'asc'; }
			else {
				next.sort = sortKey;
				next.sortDir = ((config.sort.ersteRichtung || {})[sortKey]) || 'asc';
			}
		}
		else if (action.type === 'setValues' || action.type === 'setRange') {
			if (!(config.groups || []).some(function (g) { return g.id === action.groupId; })) { throw new Error('Unknown filter group'); }
			next.filters[action.groupId] = action.value;
		}
		else if (action.type === 'togglePath') {
			var group = config.groups.find(function (g) { return g.id === action.groupId && g.kind === 'tree'; });
			if (!group) { throw new Error('Unknown tree group'); }
			function key(p) { return JSON.stringify(Object.keys(p).sort().map(function (k) { return [k,p[k]]; })); }
			var paths = next.filters[group.id], found = paths.some(function (p) { return key(p) === key(action.path); });
			if (found) {
				next.filters[group.id] = paths.filter(function (p) { return key(p) !== key(action.path); });
			} else if (group.exclusivePaths || group.exclusiveRoot) {
				// A new branch replaces its own ancestors/descendants. With
				// exclusiveRoot it also replaces every branch of another
				// top-level category, while sibling branches of the same
				// category stay OR-linked.
				var root = group.exclusiveRoot;
				next.filters[group.id] = paths.filter(function (p) {
					if (root && p[root] !== action.path[root]) { return false; }
					return !enthaeltPfad(p,action.path) && !enthaeltPfad(action.path,p);
				}).concat([action.path]);
			} else {
				next.filters[group.id] = paths.concat([action.path]);
			}
		}
		else if (action.type === 'removeChip') {
			var chip = chips(config, state, context).find(function (c) { return c.id === action.id; });
			return chip ? reduce(config, state, chip.action, context) : {state:copy(state),notices:[]};
		}
		else if (action.type === 'more') { next.pagination.limit += config.pagination.size; }
		else if (action.type === 'page') { next.pagination.page = action.value; }
		else { throw new Error('Unknown filter action: ' + action.type); }
		if (action.type !== 'more' && action.type !== 'page') { next.pagination = copy(config.defaults(context).pagination); }
		var result = normalize(config, next, context);
		// Invalid edits never replace the last valid result state.
		if (result.notices.length) { result.state = copy(state); }
		return result;
	}
	function chips(config, state, context) {
		var out = [];
		(config.groups || []).forEach(function (group) {
			var value = state.filters[group.id];
			function add(key, label, replacement, isDefault) {
				out.push({id: group.id + ':' + key, groupId: group.id, label: label,
					isDefault: isDefault === true,
					action: {type: group.kind === 'range' ? 'setRange' : 'setValues', groupId: group.id, value: replacement}});
			}
			if (group.kind === 'multi' || group.kind === 'tree') {
				var options = group.kind === 'multi' ? groupOptions(config, group) : (group.options || []);
				(value || []).forEach(function (v, i) {
					var option = options.find(function (o) { return o.value === v; });
					var label = group.kind === 'tree' ? group.pathLabel(v) : (option.chipLabel || option.label);
					add(JSON.stringify(v), label, value.filter(function (_, n) { return n !== i; }));
				});
			} else if (group.kind === 'range' && (value.min !== null || value.max !== null)) {
				add('range', group.rangeLabel(value), {min:null,max:null});
			} else if (group.kind === 'boolean' && value) {
				add('true', group.label, false);
			} else if (group.kind === 'single') {
				// A single choice is always shown, including its neutral default:
				// otherwise the same control produced a chip for one value and none
				// for another. The default chip is a state label, not a reset.
				var selected = group.options.find(function (o) { return o.value === value; });
				var standard = config.defaults(context).filters[group.id];
				if (selected) { add(String(value), selected.label, standard, value === standard); }
			}
		});
		return out;
	}
	function decode(config, url, context) {
		var decoded = config.urlCodec.decode(new URL(url.href));
		var result = normalize(config, decoded.state, context);
		result.explicit = decoded.explicit === true;
		return result;
	}
	function encode(config, state, url) {
		var result = config.urlCodec.encode(copy(state), new URL(url.href));
		if (result.origin !== url.origin || result.pathname !== url.pathname) {
			throw new Error('Filter codec must preserve origin and pathname');
		}
		return result;
	}
	var api = {normalize: normalize, reduce: reduce, chips: chips, decode: decode, encode: encode};
	if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
	else { root.MQL_FILTERZUSTAND = api; }
})(typeof window !== 'undefined' ? window : globalThis);
