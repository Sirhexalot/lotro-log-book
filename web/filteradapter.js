/* Public data adapters and URL codecs. No character data is serialized. */
(function (root) {
	'use strict';
	function abort(signal) { if (signal && signal.aborted) { var e = new Error('Aborted'); e.name = 'AbortError'; throw e; } }
	function codec(fields, defaults, hashNames) {
		var owned = fields.map(function (f) { return f.param; });
		function isOwned(name) { return owned.indexOf(name.replace(/\[(?:\d*)\]$/, '')) >= 0; }
		function values(params, name) {
			var out = [];
			params.forEach(function (v, k) { if (k === name || k.replace(/\[(?:\d*)\]$/, '') === name) { out.push(v); } });
			return out;
		}
		return {
			ownedParams: owned,
			decode: function (url) {
				var state = defaults(), explicit = (hashNames || []).indexOf(url.hash) >= 0;
				url.searchParams.forEach(function (_, k) { if (isOwned(k)) { explicit = true; } });
				fields.forEach(function (f) {
					var raw = values(url.searchParams, f.param);
					if (!raw.length) { return; }
					var value;
					if (f.type === 'multi') { value = raw; }
					else if (f.type === 'csv') { value = raw[0].split(',').map(Number); }
					else if (f.type === 'boolean') { value = raw[0] === '1'; }
					else if (f.type === 'number') { value = /^\d+$/.test(raw[0]) ? Number(raw[0]) : NaN; }
					else { value = raw[0]; }
					if (f.decode) { value = f.decode(value); }
					var target = state;
					f.path.slice(0,-1).forEach(function (k) { target = target[k]; });
					target[f.path[f.path.length-1]] = value;
				});
				return {state:state, explicit:explicit};
			},
			encode: function (state, url) {
				Array.from(url.searchParams.keys()).forEach(function (k) { if (isOwned(k)) { url.searchParams.delete(k); } });
				fields.forEach(function (f) {
					var value = state;
					f.path.forEach(function (k) { value = value[k]; });
					if (f.encode) { value = f.encode(value); }
					if (value === null || value === undefined || value === '' || value === false || value === f.omit) { return; }
					if (f.type === 'multi') { value.forEach(function (v) { url.searchParams.append(f.param + '[]', String(v)); }); }
					else if (f.type === 'csv') { if (value.length) { url.searchParams.set(f.param, value.join(',')); } }
					else { url.searchParams.set(f.param, value === true ? '1' : String(value)); }
				});
				return url;
			}
		};
	}
	function client(options) {
		return {
			load: async function (state, context) {
				abort(context.signal);
				// Deduplicate before filtering, facets and pagination.
				var seen = new Set(), rows = options.rows.filter(function (row) {
					var id = options.id(row); if (seen.has(id)) { return false; } seen.add(id); return true;
				});
				var selected = rows.filter(function (row) { return options.matches(row, state, null, context.characterContext); });
				selected.sort(function (a,b) { return options.compare(a,b,state.sort,state.sortDir); });
				var facets = options.facets(rows, state, context.characterContext);
				var pagination = Object.assign({}, state.pagination), start = 0, end = selected.length;
				if (pagination.kind === 'limit') { end = pagination.limit; }
				if (pagination.kind === 'page') {
					pagination.pages = Math.max(1, Math.ceil(selected.length/options.size));
					pagination.page = Math.min(pagination.page, pagination.pages);
					start = (pagination.page-1)*options.size; end = start+options.size;
				}
				pagination.hasMore = end < selected.length;
				abort(context.signal);
				return {state: Object.assign({},state,{pagination:pagination}), total:selected.length, facets:facets,
					pagination:pagination, capabilities:{personal:{}}, payload:selected.slice(start,end)};
			},
			renderResults: options.renderResults
		};
	}
	function server(options) {
		return {
			load: async function (state, context) {
				var base = new URL(options.url), url = options.codec.encode(state, new URL(base.href));
				if (base.origin !== location.origin || url.origin !== base.origin || url.pathname !== base.pathname) { throw new Error('Invalid filter endpoint'); }
				// The codec is the public parameter allowlist; context never enters this request.
				var response = await fetch(url.href, {signal:context.signal, credentials:'omit', redirect:'error'});
				if (!response.ok) { throw new Error('HTTP ' + response.status); }
				var doc = new DOMParser().parseFromString(await response.text(), 'text/html');
				abort(context.signal);
				var containers = doc.querySelectorAll('[data-filter-schema="1"]');
				if (containers.length !== 1 || containers[0].getAttribute('data-filter-area') !== options.area) { throw new Error('Invalid filter area/schema'); }
				var container = containers[0], models = container.querySelectorAll('script[type="application/json"][data-filter-model]');
				var fragments = container.querySelectorAll('[data-filter-results]');
				if ((!options.readModel && models.length !== 1) || fragments.length !== 1) { throw new Error('Missing filter model/results'); }
				var result = options.readModel ? options.readModel(container, new URL(response.url)) : JSON.parse(models[0].textContent);
				if (!result || !Number.isSafeInteger(result.total) || result.total < 0 || !result.state || !result.facets || !result.pagination) { throw new Error('Invalid filter model'); }
				if (options.validate && !options.validate(result)) { throw new Error('Invalid filter response'); }
				// Detached nodes; scripts from the response must never execute.
				fragments[0].querySelectorAll('script').forEach(function (s) { s.remove(); });
				result.payload = {fragment:fragments[0], document:doc};
				return result;
			},
			renderResults: function (result, target) {
				target.replaceChildren.apply(target, Array.from(result.payload.fragment.childNodes));
				var doc = result.payload.document;
				['link[rel="canonical"]','meta[name="robots"]','meta[property="og:url"]'].forEach(function (s) {
					var old = document.head.querySelector(s), fresh = doc.head.querySelector(s);
					if (old) { old.remove(); } if (fresh) { document.head.appendChild(fresh); }
				});
				document.head.querySelectorAll('link[rel="alternate"]').forEach(function (n) { n.remove(); });
				doc.head.querySelectorAll('link[rel="alternate"]').forEach(function (n) { document.head.appendChild(n); });
				var footer = document.querySelector('footer nav'), freshFooter = doc.querySelector('footer nav');
				if (footer && freshFooter) { footer.replaceWith(freshFooter); }
			}
		};
	}
	var api = {codec:codec,client:client,server:server};
	if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
	else { root.MQL_FILTERADAPTER = api; }
})(typeof window !== 'undefined' ? window : globalThis);
