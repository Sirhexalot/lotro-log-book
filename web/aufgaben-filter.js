/* Shared quest and deed lists. The parent page resolves the relation; the list,
   filters, search, sorting and result rows are the catalogue's own.
 *
 * The client's quest category ("Auenland", "Hauptmann", "Ruf") mixes areas,
 * classes and story kinds, so it is no filter. What actually separates quests
 * are their recorded properties: daily, repeatable, group, instance and
 * scaling. Deeds additionally have their own kind and reward. */
(function () {
	'use strict';

	var WORDS = {
		de: {
			search: 'Suchen', placeholder: 'Aufgabe oder Tat suchen', placeholder_q: 'Aufgabe suchen', placeholder_d: 'Tat suchen', filter: 'Filter', close: 'Schließen', sort: 'Sortierung', reset: 'Zurücksetzen',
			more: 'Weitere anzeigen', count: '%s Einträge', show: '%s Treffer anzeigen', loading: 'Lade …',
			error: 'Ergebnisse nicht aktualisiert.', retry: 'Erneut versuchen', fallback: 'Als Seite öffnen',
			invalidRange: 'Ungültiger Bereich', min: 'Von', max: 'Bis',
			flag: 'Merkmale', geography: 'Region und Gebiet', region: 'Region', area: 'Gebiet', level: 'Stufe', status: 'Abschluss',
			all: 'Alle', done: 'Erledigt', rest: 'Nicht als erledigt importiert',
			name: 'Name', kind: 'Art', reward: 'Belohnung', points: 'LOTRO-Punkte', virtue: 'Tugend', title: 'Titel',
			item: 'Gegenstand', doneMark: 'Erledigt',
			dy: 'täglich', rp: 'wiederholbar', gr: 'Gruppe', gr1: 'kleine Gemeinschaft', gr2: 'große Gemeinschaft', tb: 'Aufgabenbrett', ix: 'Instanz', ls: 'skaliert mit Stufe'
		},
		en: {
			search: 'Search', placeholder: 'Search quest or deed', placeholder_q: 'Search quests', placeholder_d: 'Search deeds', filter: 'Filters', close: 'Close', sort: 'Sort', reset: 'Reset',
			more: 'Show more', count: '%s entries', show: 'Show %s results', loading: 'Loading …',
			error: 'Results not updated.', retry: 'Try again', fallback: 'Open page',
			invalidRange: 'Invalid range', min: 'From', max: 'To',
			flag: 'Properties', geography: 'Region and area', region: 'Region', area: 'Area', level: 'Level', status: 'Completion',
			all: 'All', done: 'Completed', rest: 'Not imported as completed',
			name: 'Name', kind: 'Type', reward: 'Reward', points: 'LOTRO Points', virtue: 'Virtue', title: 'Title',
			item: 'Item', doneMark: 'Completed',
			dy: 'daily', rp: 'repeatable', gr: 'group', gr1: 'small fellowship', gr2: 'fellowship', tb: 'task board', ix: 'instance', ls: 'scales with level'
		},
		fr: {
			search: 'Chercher', placeholder: 'Chercher une quête ou une prouesse', placeholder_q: 'Chercher des quêtes', placeholder_d: 'Chercher une prouesse', filter: 'Filtres', close: 'Fermer', sort: 'Tri', reset: 'Réinitialiser',
			more: 'Afficher davantage', count: '%s entrées', show: 'Afficher %s résultats', loading: 'Chargement …',
			error: 'Résultats non actualisés.', retry: 'Réessayer', fallback: 'Ouvrir la page',
			invalidRange: 'Plage incorrecte', min: 'De', max: 'À',
			flag: 'Caractéristiques', geography: 'Région et pays', region: 'Région', area: 'Pays', level: 'Niveau', status: 'Achèvement',
			all: 'Tous', done: 'Terminé', rest: 'Non importé comme terminé',
			name: 'Nom', kind: 'Type', reward: 'Récompense', points: 'Points LOTRO', virtue: 'Vertu', title: 'Titre',
			item: 'Objet', doneMark: 'Terminé',
			dy: 'quotidienne', rp: 'répétable', gr: 'groupe', gr1: 'petite communauté', gr2: 'communauté', tb: 'tableau des tâches', ix: 'instance', ls: 'évolue avec le niveau'
		}
	};
	var SEGMENT = {
		q: { de: 'aufgabe', en: 'quest', fr: 'quete' },
		d: { de: 'tat', en: 'deed', fr: 'prouesse' }
	};

	window.MQL_TASK_FILTER_SETUP = function (rows, kind) {
		var lang = document.documentElement.lang, A = window.MQL_FILTERADAPTER, w = WORDS[lang] || WORDS.de;
		var labels = {};
		['search', 'filter', 'close', 'sort', 'reset', 'more', 'count', 'show', 'loading', 'error',
			'retry', 'fallback', 'invalidRange', 'min', 'max', 'placeholder'].forEach(function (key) { labels[key] = w[key]; });
		// A deed-only list searches deeds, not "quest or deed".
		labels.placeholder = (kind === 'd' ? w.placeholder_d : w.placeholder_q) || w.placeholder;

		var character = window.MQL_SPEICHER && window.MQL_SPEICHER.aktiv();
		var dataset = kind === 'd' ? 'deeds' : 'quests';
		var known = new Set((character && character[dataset]) || []);
		var store = window.MQL_SPEICHER;
		function status(row) {
			if (store && store.status) { return store.status(dataset, row.id); }
			return known.has(row.id) ? 'fertig' : null;
		}
		var meta = (character && character.importMeta) || {};
		var evidence = meta.datasets && meta.datasets[dataset];
		// "Not imported as completed" speaks about the import, not about
		// availability, so it needs a status file or at least positive entries.
		var hasStatus = known.size > 0 || (character && store && rows.some(function (row) { return status(row) !== null; })) || (evidence ? evidence.status !== 'unknown'
			: (dataset === 'deeds' ? meta.deeds : meta.quests) === true);

		/* A filter that cannot separate anything is noise: a group needs at least
		   two values in this relation, a range at least two distinct levels. */
		function multi(id, label, values) {
			var distinct = Array.from(new Set(values.filter(Boolean)))
				.sort(function (a, b) { return a.localeCompare(b, lang); });
			if (distinct.length < 2) { return null; }
			return { id: id, kind: 'multi', label: label,
				options: distinct.map(function (value) { return { value: value, label: value }; }) };
		}

		var groups = [];
		if (kind === 'd') {
			var types = multi('type', w.kind, rows.map(function (r) { return r.type; }));
			if (types) { groups.push(types); }
			var rewards = new Set();
			rows.forEach(function (r) { r.rewards.forEach(function (key) { rewards.add(key); }); });
			var rewardsAvailable = [{ value: 'points', label: w.points }]
				.concat(rewards.has('v') ? [{ value: 'v', label: w.virtue }] : [])
				.concat(rewards.has('t') ? [{ value: 't', label: w.title }] : [])
				.concat(rewards.has('i') ? [{ value: 'i', label: w.item }] : []);
			if (rewardsAvailable.length > 1 || rows.some(function (r) { return r.points > 0; })) {
				groups.push({ id: 'reward', kind: 'multi', label: w.reward, options: rewardsAvailable });
			}
		} else {
			var present = new Set();
			rows.forEach(function (r) { r.flags.forEach(function (key) { present.add(key); }); });
			var flags = Array.from(present)
				.sort(function (a, b) { return w[a].localeCompare(w[b], lang); })
				.map(function (key) { return { value: key, label: w[key] }; });
			if (flags.length > 1) {
				groups.push({ id: 'flag', kind: 'multi', label: w.flag, options: flags });
			}
		}
		var regions = Array.from(new Set(rows.map(function (r) { return r.region; }).filter(Boolean)))
			.sort(function (a, b) { return a.localeCompare(b, lang); });
		var geographyMap = {};
		regions.forEach(function (regionName) {
			geographyMap[regionName] = Array.from(new Set(rows.filter(function (r) {
				return r.region === regionName;
			}).map(function (r) { return r.area; }).filter(function (areaName) {
				return areaName && !/^karte\s+\d+/i.test(areaName);
			}))).sort(function (a, b) { return a.localeCompare(b, lang); });
		});
		var geography = regions.length ? {
			id: 'geography', kind: 'tree', label: w.geography,
			options: regions.map(function (regionName) {
				return {
					path: { region: regionName }, label: regionName,
					children: geographyMap[regionName].map(function (areaName) {
						return { path: { region: regionName, area: areaName }, label: areaName };
					})
				};
			}),
			validatePath: function (path) {
				return !!(path && geographyMap[path.region]
					&& (!path.area || geographyMap[path.region].indexOf(path.area) >= 0));
			},
			pathLabel: function (path) {
				return path.region + (path.area ? ' › ' + path.area : '');
			},
			exclusivePaths: true
		} : null;
		if (geography) { groups.push(geography); }
		var levels = new Set(rows.map(function (r) { return r.level; }).filter(function (v) { return v !== null; }));
		if (levels.size > 1) { groups.push({ id: 'level', kind: 'range', label: w.level }); }
		if (hasStatus) {
			groups.push({ id: 'status', kind: 'single', label: w.status,
				options: [{ value: 'all', label: w.all }, { value: 'done', label: w.done }, { value: 'rest', label: w.rest }] });
		}

		var filters = {};
		groups.forEach(function (g) {
			filters[g.id] = g.kind === 'single' ? 'all' : g.kind === 'range' ? { min: null, max: null } : [];
		});
		var config = {
			area: kind === 'd' ? 'taten' : 'aufgaben', lang: lang, labels: labels,
			rootUrl: location.origin + location.pathname, groups: groups,
			search: { submit: 'debounce', debounceMs: 200 },
			sort: { options: [{ value: 'name', label: w.name }, { value: 'level', label: w.level }] },
			pagination: { kind: 'limit', size: 50 },
			defaults: function () {
				return { q: '', filters: JSON.parse(JSON.stringify(filters)), sort: 'name',
					pagination: { kind: 'limit', limit: 50 } };
			}
		};

		var fields = [{ param: 'q', path: ['q'] }, { param: 'sort', path: ['sort'], omit: 'name' }];
		groups.forEach(function (g) {
			if (g.kind === 'range') {
				fields.push({ param: 'von', path: ['filters', g.id, 'min'], type: 'number' },
					{ param: 'bis', path: ['filters', g.id, 'max'], type: 'number' });
			} else if (g.kind === 'tree') {
				fields.push({ param: 'gebiet', path: ['filters', g.id], type: 'multi',
					encode: function (value) { return value.map(JSON.stringify); },
					decode: function (value) {
						return value.map(function (entry) {
							try { return JSON.parse(entry); } catch (error) { return null; }
						}).filter(Boolean);
					}
				});
			} else {
				fields.push({ param: g.id, path: ['filters', g.id],
					type: g.kind === 'single' ? 'text' : 'multi', omit: g.kind === 'single' ? 'all' : undefined });
			}
		});
		config.urlCodec = A.codec(fields, config.defaults);

		function searchable(row) {
			return [row.name, row.id, row.type].concat(row.flags.map(function (key) { return w[key]; }))
				.join(' ').toLocaleLowerCase(lang);
		}
		function matches(row, state, skip) {
			if (state.q && !searchable(row).includes(state.q.toLocaleLowerCase(lang))) { return false; }
			return groups.every(function (g) {
				if (skip === g.id) { return true; }
				var value = state.filters[g.id];
				if (g.id === 'level') {
					return (value.min === null && value.max === null)
						|| (row.level !== null && (value.min === null || row.level >= value.min)
							&& (value.max === null || row.level <= value.max));
				}
				if (g.id === 'geography') {
					return !value.length || value.some(function (path) {
						return path.region === row.region
							&& (!path.area || path.area === row.area);
					});
				}
				if (g.id === 'status') {
					return value === 'all' || (value === 'done' ? status(row) === 'fertig' : status(row) !== 'fertig');
				}
				if (g.id === 'reward') {
					return !value.length || value.some(function (key) {
						return key === 'points' ? row.points > 0 : row.rewards.includes(key);
					});
				}
				if (g.id === 'flag') {
					// Other properties must all hold. The two fellowship sizes are
					// alternatives: choosing both means "any fellowship", choosing
					// one means only that size.
					var sizes = value.filter(function (key) {
						return key === 'gr1' || key === 'gr2';
					});
					var rest = value.filter(function (key) {
						return key !== 'gr1' && key !== 'gr2';
					});
					if (sizes.length && !sizes.some(function (key) {
						return row.flags.includes(key);
					})) { return false; }
					return rest.every(function (key) { return row.flags.includes(key); });
				}
				return !value.length || value.includes(row[g.id]);
			});
		}

		var adapter = A.client({
			rows: rows,
			id: function (row) { return row.id; },
			matches: matches,
			compare: function (a, b, sort) {
				return (sort === 'level' ? (a.level || Infinity) - (b.level || Infinity) : 0)
					|| a.name.localeCompare(b.name, lang) || a.id.localeCompare(b.id);
			},
			facets: function (all, state) {
				var facets = {};
				groups.forEach(function (g) {
					if (!g.options) { return; }
					var options = [];
					function collect(items) {
						items.forEach(function (option) {
							options.push(option);
							if (option.children) { collect(option.children); }
						});
					}
					collect(g.options);
					facets[g.id] = options.map(function (option) {
						var candidate = JSON.parse(JSON.stringify(state));
						var value = g.kind === 'tree' ? option.path : option.value;
						candidate.filters[g.id] = g.kind === 'single' ? value : [value];
						return { value: value, count: all.filter(function (row) { return matches(row, candidate); }).length };
					});
				});
				return facets;
			},
			renderResults: function (result, target) {
				target.replaceChildren();
				var symbols = document.getElementById('related-list-symbols');
				var symbol = symbols && JSON.parse(symbols.textContent)[kind];
				// Only what differs inside this relation belongs in the row.
				var showRegion = !!geography, showArea = !!geography;
				result.payload.forEach(function (row) {
					var line = document.createElement('li'), link = document.createElement('a');
					var mark = document.createElement('span'), body = document.createElement('span'), meta = document.createElement('small');
					link.className = 'related-result';
					link.href = '/' + lang + '/' + SEGMENT[kind][lang] + '/' + row.id + '/';
					var rowStatus = status(row);
					mark.className = 'related-symbol' + (rowStatus === 'fertig' ? ' fertig' : '');
					if (symbol) {
						// Only the server's established Lucide SVG, never game or user text.
						var template = document.createElement('template');
						template.innerHTML = symbol;
						mark.appendChild(template.content.cloneNode(true));
					}
					body.textContent = row.name;
					meta.textContent = [row.type, row.level ? w.level + ' ' + row.level : '']
						.concat(row.flags.map(function (key) { return w[key]; }))
						.concat([showRegion ? row.region : '', showArea ? row.area : ''])
						.filter(Boolean).join(' · ');
					body.appendChild(meta);
					link.append(mark, body);
					line.appendChild(link);
					var control = window.MQL_STATUS_UI && window.MQL_STATUS_UI.create(dataset, row.id);
					if (control) {
						control.addEventListener('click', function (event) { event.stopPropagation(); });
						line.appendChild(control);
					}
					target.appendChild(line);
				});
			}
		});
		return { config: config, adapter: adapter };
	};
})();
