/* Instance detail tabs use the standard quest adapter, filter UI and result rows. */
(function () {
	'use strict';
	var QUESTS = 'aufgaben', REWARDS = 'aufgabenbelohnungen', LOOT = 'truhenbeute';

	function overlaps(span, min, max) {
		return !!span.length && (max == null || span[0] <= max) && (min == null || span[span.length - 1] >= min);
	}
	function matchingConditions(row, filters, skip) {
		var level = filters.level, tier = filters.tier, players = filters.players;
		return row.conditions.filter(function (c) {
			return (skip === 'level' || (level.min == null && level.max == null) || overlaps(c.level, level.min, level.max))
				&& (skip === 'tier' || !tier.length || tier.some(function (t) { return overlaps(c.tier, +t, +t); }))
				&& (skip === 'players' || !players.length || players.some(function (n) { return overlaps(c.players, +n, +n); }));
		});
	}
	function chanceText(conditions, lang) {
		var format = new Intl.NumberFormat(lang, {style:'percent', maximumFractionDigits:3});
		return Array.from(new Set(conditions.flatMap(function (c) { return c.chances; })))
			.sort(function (a,b) { return b-a; }).map(function (p) {
				var text = format.format(p);
				return lang === 'de' ? text.replace(/\s*%$/, '\u00a0%') : text;
			}).join(' / ');
	}
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = {matchingConditions:matchingConditions, chanceText:chanceText};
		return;
	}

	var host = document.querySelector('[data-instance-lists]'), data = document.getElementById('instance-list-data');
	if (!host || !data || !window.MQL_FILTER_UI || !window.MQL_TASK_FILTER_SETUP) { return; }
	var lists = JSON.parse(data.textContent), lang = document.documentElement.lang;
	var w = {
		de: {loot:'Beute suchen', rewards:'Belohnung suchen', level:'Instanzstufe', tier:'Schwierigkeit', players:'Gruppengröße', name:'Name', chance:'Chance je Truhe', quest:'Aufgabe', empty:'Keine passenden Gegenstände gefunden.'},
		en: {loot:'Search loot', rewards:'Search rewards', level:'Instance level', tier:'Difficulty', players:'Group size', name:'Name', chance:'Chance per chest', quest:'Quest', empty:'No matching items found.'},
		fr: {loot:'Chercher du butin', rewards:'Chercher une récompense', level:'Niveau de l’instance', tier:'Difficulté', players:'Taille du groupe', name:'Nom', chance:'Chance par coffre', quest:'Quête', empty:'Aucun objet correspondant.'}
	}[lang];
	var A = window.MQL_FILTERADAPTER, rowsUI = window.MQL_TREFFERZEILE;
	var tabHost = host.querySelector('.llb-reiter');
	var panels = Array.from(host.querySelectorAll('[data-instance-panel]'));
	var filterLimit = Number(document.querySelector('main').dataset.relatedFilterLimit);
	var active, controller, queue = Promise.resolve();

	function contextual(setup, key) {
		var codec = setup.config.urlCodec, prefix = key + '.';
		setup.config.area = 'instance-' + key + '-' + location.pathname.split('/').filter(Boolean).pop();
		setup.config.urlCodec = {
			decode:function (url) {
				var u = new URL(url); u.search = '';
				url.searchParams.forEach(function (v,k) {
					if (k.startsWith(prefix)) { u.searchParams.append(k.slice(prefix.length),v); }
				});
				var parsed = codec.decode(u); parsed.explicit = true; return parsed;
			},
			encode:function (state,url) {
				var u = new URL(url); u.search = ''; codec.encode(state,u);
				Array.from(url.searchParams.keys()).forEach(function (k) {
					if (k.startsWith(prefix)) { url.searchParams.delete(k); }
				});
				u.searchParams.forEach(function (v,k) { url.searchParams.append(prefix+k,v); });
				return url;
			}
		};
		return setup;
	}

	function itemSetup(key) {
		var loot = key === LOOT, rows = lists[key], groups = [];
		var labels = window.MQL_TASK_FILTER_SETUP([], 'q').config.labels;
		labels.placeholder = loot ? w.loot : w.rewards;
		function options(id, format) {
			var values = new Set();
			rows.forEach(function (row) {
				row.conditions.forEach(function (c) {
					for (var n = c[id][0]; n <= c[id][c[id].length-1]; n++) { values.add(n); }
				});
			});
			return Array.from(values).sort(function (a,b) { return a-b; }).map(function (n) {
				return {value:String(n), label:format(n)};
			});
		}
		if (loot) {
			var tiers = options('tier',function (n) { return 'T'+n; });
			var sizes = options('players',String);
			groups.push({id:'level', kind:'range', label:w.level, min:1,
				rangeLabel:function (r) { return w.level+' '+(r.min ?? '…')+'–'+(r.max ?? '…'); }});
			if (tiers.length > 1) { groups.push({id:'tier', kind:'multi', label:w.tier, options:tiers}); }
			if (sizes.length > 1) { groups.push({id:'players', kind:'multi', label:w.players, options:sizes}); }
		}
		function defaults() {
			return {q:'', filters:loot ? {level:{min:null,max:null},tier:[],players:[]} : {},
				sort:'name', pagination:{kind:'limit',limit:30}};
		}
		var fields = [{param:'q',path:['q']}, {param:'n',path:['pagination','limit'],type:'number',omit:30}];
		if (loot) {
			fields.push({param:'von',path:['filters','level','min'],type:'number'}, {param:'bis',path:['filters','level','max'],type:'number'});
			groups.filter(function (g) { return g.kind === 'multi'; }).forEach(function (g) {
				fields.push({param:g.id,path:['filters',g.id],type:'multi'});
			});
		}
		var config = {area:key, lang:lang, labels:labels, groups:groups, rootUrl:location.pathname,
			search:{submit:'debounce',debounceMs:200}, pagination:{kind:'limit',size:30},
			urlCodec:A.codec(fields,defaults), defaults:defaults};
		function searchMatches(row,q) {
			return !q || (row.name + ' ' + (loot ? row.id : row.quest)).toLocaleLowerCase(lang).includes(q.toLocaleLowerCase(lang));
		}
		var adapter = A.client({
			rows:rows, size:30, id:function (r) { return r.id; },
			matches:function (r,s) { return searchMatches(r,s.q) && (!loot || !!matchingConditions(r,s.filters).length); },
			compare:function (a,b) { return a.name.localeCompare(b.name,lang) || (a.quest || '').localeCompare(b.quest || '',lang); },
			facets:function (all,s) {
				var facets = {};
				groups.filter(function (g) { return g.kind === 'multi'; }).forEach(function (g) {
					var relevant = all.filter(function (r) { return searchMatches(r,s.q); })
						.map(function (r) { return matchingConditions(r,s.filters,g.id); });
					facets[g.id] = g.options.map(function (o) {
						return {value:o.value,count:relevant.filter(function (cs) {
							return cs.some(function (c) { return overlaps(c[g.id],+o.value,+o.value); });
						}).length};
					});
				});
				return facets;
			},
			renderResults:function (r,target) {
				target.replaceChildren();
				var heading = loot ? w.chance : w.quest;
				if (!r.payload.length) {
					var empty = document.createElement('li'); empty.textContent = w.empty;
					target.appendChild(empty); return;
				}
				rowsUI.header(target,{levelHeading:heading});
				r.payload.forEach(function (item) {
					var row = rowsUI.row(target,{href:item.url,name:item.name,meta:item.meta,
						icon:loot ? 'gegenstand' : item.icon,image:item.image,levelHeading:heading,
						values:[{label:heading,value:loot ? chanceText(matchingConditions(item,r.state.filters),lang) : item.quest}]});
					if (!loot) {
						var link = document.createElement('a'); link.href = item.quest_url; link.textContent = item.quest;
						row.querySelector('.mql-row-value b').replaceWith(link);
					}
					target.appendChild(row);
				});
			}
		});
		config.sort = {options:[{value:'name',label:w.name}]};
		return {config:config,adapter:adapter};
	}

	function wanted() {
		return panels.find(function (panel) { return '#'+panel.id === location.hash; }) || panels[0];
	}
	function show(key, force) {
		queue = queue.then(async function () {
			if (active === key && !force) { return; }
			if (controller) { await controller.destroy(); controller = null; }
			active = key;
			var panel = panels.find(function (p) { return p.id === key; }) || panels[0];
			var root = panel.querySelector('[data-instance-list]');
			var setup = contextual(key === QUESTS ? window.MQL_TASK_FILTER_SETUP(lists[key], 'q') : itemSetup(key),key);
			if (key === LOOT || lists[key].length > filterLimit) {
				controller = window.MQL_FILTER_UI.mount(root,setup);
				await controller.ready;
			} else {
				var result = await setup.adapter.load(setup.config.defaults(),{signal:new AbortController().signal});
				setup.adapter.renderResults(result,root.querySelector('[data-filter-results]'));
			}
		}).catch(function (e) { console.error(e); });
	}

	panels.forEach(function (p) { p.tabIndex = 0; });
	if (tabHost && window.MQL_REITER) {
		window.MQL_REITER.mount(tabHost, {
			aktiv: wanted().id, hash: true, verlauf: true,
			onShow: function (key) { show(key); }
		});
	} else {
		/* Without the shared tab bar every section stays visible. */
		show(wanted().id, true);
	}
	function refreshQuests() {
		if (active === QUESTS) { show(QUESTS, true); }
	}
	document.addEventListener('mql:characterchange',refreshQuests);
	document.addEventListener('change',function (e) {
		if (e.target.id === 'katalog-charakter') { refreshQuests(); }
	});
	window.addEventListener('mql-status',refreshQuests);
})();
