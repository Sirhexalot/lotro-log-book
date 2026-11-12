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
			search: 'Suchen', filter: 'Filter', close: 'Schließen', sort: 'Sortierung', reset: 'Zurücksetzen',
			more: 'Weitere anzeigen', count: '%s Einträge', show: '%s Treffer anzeigen', loading: 'Lade …',
			error: 'Ergebnisse nicht aktualisiert.', retry: 'Erneut versuchen', fallback: 'Als Seite öffnen',
			invalidRange: 'Ungültiger Bereich', min: 'Von', max: 'Bis',
			flag: 'Merkmale', region: 'Region', area: 'Gebiet', level: 'Stufe', status: 'Abschluss',
			all: 'Alle', done: 'Erledigt', rest: 'Nicht als erledigt importiert',
			name: 'Name', kind: 'Art', reward: 'Belohnung', points: 'LOTRO-Punkte', virtue: 'Tugend', title: 'Titel',
			item: 'Gegenstand', doneMark: 'Erledigt',
			dy: 'täglich', rp: 'wiederholbar', gr: 'Gruppe', ix: 'Instanz', ls: 'skaliert mit Stufe'
		},
		en: {
			search: 'Search', filter: 'Filters', close: 'Close', sort: 'Sort', reset: 'Reset',
			more: 'Show more', count: '%s entries', show: 'Show %s results', loading: 'Loading …',
			error: 'Results not updated.', retry: 'Try again', fallback: 'Open page',
			invalidRange: 'Invalid range', min: 'From', max: 'To',
			flag: 'Properties', region: 'Region', area: 'Area', level: 'Level', status: 'Completion',
			all: 'All', done: 'Completed', rest: 'Not imported as completed',
			name: 'Name', kind: 'Type', reward: 'Reward', points: 'LOTRO Points', virtue: 'Virtue', title: 'Title',
			item: 'Item', doneMark: 'Completed',
			dy: 'daily', rp: 'repeatable', gr: 'group', ix: 'instance', ls: 'scales with level'
		},
		fr: {
			search: 'Chercher', filter: 'Filtres', close: 'Fermer', sort: 'Tri', reset: 'Réinitialiser',
			more: 'Afficher davantage', count: '%s entrées', show: 'Afficher %s résultats', loading: 'Chargement …',
			error: 'Résultats non actualisés.', retry: 'Réessayer', fallback: 'Ouvrir la page',
			invalidRange: 'Plage incorrecte', min: 'De', max: 'À',
			flag: 'Caractéristiques', region: 'Région', area: 'Pays', level: 'Niveau', status: 'Achèvement',
			all: 'Tous', done: 'Terminé', rest: 'Non importé comme terminé',
			name: 'Nom', kind: 'Type', reward: 'Récompense', points: 'Points LOTRO', virtue: 'Vertu', title: 'Titre',
			item: 'Objet', doneMark: 'Terminé',
			dy: 'quotidienne', rp: 'répétable', gr: 'groupe', ix: 'instance', ls: 'évolue avec le niveau'
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
			'retry', 'fallback', 'invalidRange', 'min', 'max'].forEach(function (key) { labels[key] = w[key]; });

		var character = window.MQL_SPEICHER && window.MQL_SPEICHER.aktiv();
		var dataset = kind === 'd' ? 'deeds' : 'quests';
		var known = new Set((character && character[dataset]) || []);
		var meta = (character && character.importMeta) || {};
		var evidence = meta.datasets && meta.datasets[dataset];
		// "Not imported as completed" speaks about the import, not about
		// availability, so it needs a status file or at least positive entries.
		var hasStatus = known.size > 0 || (evidence ? evidence.status !== 'unknown'
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
			groups.push(multi('type', w.kind, rows.map(function (r) { return r.type; })));
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
		var region = multi('region', w.region, rows.map(function (r) { return r.region; }));
		if (region) { groups.push(region); }
		var area = multi('area', w.area, rows.map(function (r) { return r.area; }));
		if (area) { groups.push(area); }
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
				if (g.id === 'status') {
					return value === 'all' || (value === 'done' ? known.has(row.id) : !known.has(row.id));
				}
				if (g.id === 'reward') {
					return !value.length || value.some(function (key) {
						return key === 'points' ? row.points > 0 : row.rewards.includes(key);
					});
				}
				if (g.id === 'flag') {
					// Every chosen property must hold: "täglich" and "Gruppe" together.
					return !value.length || value.every(function (key) { return row.flags.includes(key); });
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
					facets[g.id] = g.options.map(function (option) {
						var candidate = JSON.parse(JSON.stringify(state));
						candidate.filters[g.id] = g.kind === 'single' ? option.value : [option.value];
						return { value: option.value, count: all.filter(function (row) { return matches(row, candidate); }).length };
					});
				});
				return facets;
			},
			renderResults: function (result, target) {
				target.replaceChildren();
				var symbols = document.getElementById('related-list-symbols');
				var symbol = symbols && JSON.parse(symbols.textContent)[kind];
				// Only what differs inside this relation belongs in the row.
				var showRegion = !!region, showArea = !!area;
				result.payload.forEach(function (row) {
					var line = document.createElement('li'), link = document.createElement('a');
					var mark = document.createElement('span'), body = document.createElement('span'), meta = document.createElement('small');
					link.className = 'related-result';
					link.href = '/' + lang + '/' + SEGMENT[kind][lang] + '/' + row.id + '/';
					mark.className = 'related-symbol' + (known.has(row.id) ? ' fertig' : '');
					if (known.has(row.id)) {
						mark.textContent = '✓';
						mark.setAttribute('aria-label', w.doneMark);
					} else if (symbol) {
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
					link.append(mark, body); line.appendChild(link); target.appendChild(line);
				});
			}
		});
		return { config: config, adapter: adapter };
	};
})();
