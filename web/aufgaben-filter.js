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
			flag: 'Merkmale', geography: 'Region und Landschaft', region: 'Region', area: 'Gebiet', level: 'Stufe', levelDesc: 'Stufe absteigend', status: 'Abschluss',
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
			flag: 'Properties', geography: 'Region and landscape', region: 'Region', area: 'Area', level: 'Level', levelDesc: 'Level descending', status: 'Completion',
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
			flag: 'Caractéristiques', geography: 'Région et zone', region: 'Région', area: 'Zone', level: 'Niveau', levelDesc: 'Niveau décroissant', status: 'Achèvement',
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

	window.MQL_TASK_FILTER_SETUP = function (rows, kind, options) {
		options = options || {};
		var lang = document.documentElement.lang, A = window.MQL_FILTERADAPTER, w = WORDS[lang] || WORDS.de;
		var L = (window.MQL_LISTEN || {}).aufgaben || null;
		var liste = L ? (kind === 'd' ? L.deeds : L.quests) : null;
		var progress = window.MQL_STATUS_UI?.words?.(lang) || {progress:'Fortschritt',all:'Alle',open:'Nicht begonnen',running:'Begonnen',done:'Erledigt'};
		var labels = {};
		['search', 'filter', 'close', 'sort', 'reset', 'more', 'count', 'show', 'loading', 'error',
			'retry', 'fallback', 'invalidRange', 'min', 'max', 'placeholder'].forEach(function (key) { labels[key] = w[key]; });
		// A deed-only list searches deeds, not "quest or deed".
		labels.placeholder = (kind === 'd' ? w.placeholder_d : w.placeholder_q) || w.placeholder;
		if (options.countLabel) { labels.count = options.countLabel; }

		var character = window.MQL_SPEICHER && window.MQL_SPEICHER.aktiv();
		var dataset = kind === 'd' ? 'deeds' : 'quests';
		var known = new Set((character && character[dataset]) || []);
		var store = window.MQL_SPEICHER;
		var snapshot = store && store.statusSnapshot && store.statusSnapshot(dataset, character);
		function status(row) {
			if (snapshot) { return snapshot(row.id); }
			if (store && store.status) { return store.status(dataset, row.id); }
			return known.has(row.id) ? 'fertig' : null;
		}
		var meta = (character && character.importMeta) || {};
		// Same rule as the recipe lists: the import flag of the file counts, an
		// optional dataset marker may confirm it.
		var evidence = meta.datasets && meta.datasets[dataset];
		var hasImportedStatus = meta[dataset] === true ||
			!!(evidence && evidence.status && evidence.status !== 'unknown');
		var hasStatus = known.size > 0 || hasImportedStatus || !!(character && store && rows.some(function (row) { return status(row) !== null; }));

		/* A filter that cannot separate anything is noise: a group needs at least
		   two values in this relation, a range at least two distinct levels. */
		function multi(id, label, values) {
			var distinct = Array.from(new Set(values.filter(Boolean)))
				.sort(MQL_SORT.compare);
			if (distinct.length < 2) { return null; }
			return { id: id, kind: 'multi', label: label,
				options: distinct.map(function (value) { return { value: value, label: value }; }) };
		}

		/* Visible order: completion, level, region and landscape, then what only
		   this relation can answer (deeds: kind and reward, quests: properties).
		   The groups are built first and appended last for that order. */
		var groups = [], kindGroups = [];
		if (kind === 'd') {
			var types = multi('type', w.kind, rows.map(function (r) { return r.type; }));
			if (types) { kindGroups.push(types); }
			var rewards = new Set();
			rows.forEach(function (r) { r.rewards.forEach(function (key) { rewards.add(key); }); });
			var rewardsAvailable = [{ value: 'points', label: w.points }]
				.concat(rewards.has('v') ? [{ value: 'v', label: w.virtue }] : [])
				.concat(rewards.has('t') ? [{ value: 't', label: w.title }] : [])
				.concat(rewards.has('i') ? [{ value: 'i', label: w.item }] : []);
			if (rewardsAvailable.length > 1 || rows.some(function (r) { return r.points > 0; })) {
				kindGroups.push({ id: 'reward', kind: 'multi', label: w.reward, options: rewardsAvailable });
			}
		} else {
			var present = new Set();
			rows.forEach(function (r) { r.flags.forEach(function (key) { present.add(key); }); });
			var flags = Array.from(present)
				.sort(function (a, b) { return MQL_SORT.compare(w[a], w[b]); })
				.map(function (key) { return { value: key, label: w[key] }; });
			if (flags.length > 1) {
				kindGroups.push({ id: 'flag', kind: 'multi', label: w.flag, options: flags });
			}
		}
		var regions = Array.from(new Set(rows.map(function (r) { return r.region; }).filter(Boolean)))
			.sort(MQL_SORT.compare);
		var geographyMap = {};
		regions.forEach(function (regionName) {
			geographyMap[regionName] = Array.from(new Set(rows.filter(function (r) {
				return r.region === regionName;
			}).map(function (r) { return r.area; }).filter(function (areaName) {
				return areaName && !/^karte\s+\d+/i.test(areaName);
			}))).sort(MQL_SORT.compare);
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
		var levels = new Set(rows.map(function (r) { return r.level; }).filter(function (v) { return v !== null; }));
		if (options.level !== false && levels.size > 1) {
			groups.push({id: 'level', kind: 'range', label: w.level,
				rangeLabel: function (r) { return w.level+' '+(r.min ?? '…')+'–'+(r.max ?? '…'); }});
		}
		if (geography) { groups.push(geography); }
		groups = groups.concat(kindGroups);
		groups.unshift({ id: 'status', kind: 'single', label: progress.progress,
				available: function () { return hasStatus; },
				options: ['all', 'open', 'running', 'done'].map(function (key) {
					return {value:key,label:progress[key],keepVisible:true};
				}) });
		// The definition owns the visible order; an id it does not name is dropped.
		if (liste && liste.filter) {
			var nachId = {};
			groups.forEach(function (group) { nachId[group.id] = group; });
			groups = liste.filter.map(function (id) { return nachId[id]; }).filter(Boolean);
		}

		var filters = {};
		groups.forEach(function (g) {
			filters[g.id] = g.kind === 'single' ? 'all' : g.kind === 'range' ? { min: null, max: null } : [];
		});
		var sortErlaubt = (liste && liste.sortierung && liste.sortierung.erlaubt) || ['name', 'level'];
		var ersteRichtung = (liste && liste.sortierung && liste.sortierung.ersteRichtung) || {name: 'asc', level: 'asc'};
		var sortStandard = (liste && liste.sortierung && liste.sortierung.standard) || 'name';
		var groesse = (liste && liste.blaettern && liste.blaettern.groesse) || 50;
		/* The column head sends key and direction; `levelDesc` is the old
		 * select value and stays readable for bookmarks. */
		var sortVorgabe = (function () {
			if (options.defaultSort === 'levelDesc') { return { key: 'level', dir: 'desc' }; }
			if (options.defaultSort === 'level') { return { key: 'level', dir: 'asc' }; }
			return { key: sortStandard, dir: ersteRichtung[sortStandard] || 'asc' };
		})();
		function sortLesen(roh) {
			if (roh === 'levelDesc') { return { key: 'level', dir: 'desc' }; }
			if (roh === 'level' || roh === 'name') { return { key: roh, dir: 'asc' }; }
			var dir = roh.charAt(0) === '-' ? 'desc' : 'asc', key = dir === 'desc' ? roh.slice(1) : roh;
			return key === 'name' || key === 'level' ? { key: key, dir: dir } : null;
		}
		var config = {
			area: kind === 'd' ? 'taten' : 'aufgaben', lang: lang, labels: labels,
			rootUrl: location.origin + location.pathname, groups: groups,
			search: { submit: 'debounce', debounceMs: 200 },
			sort: { keys: sortErlaubt, ersteRichtung: ersteRichtung, options: [] },
			pagination: { kind: 'limit', size: groesse },
			defaults: function () {
				return { q: '', filters: JSON.parse(JSON.stringify(filters)),
					sort: sortVorgabe.key, sortDir: sortVorgabe.dir,
					pagination: { kind: 'limit', limit: groesse } };
			}
		};

		var fields = [{ param: 'q', path: ['q'] }];
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
		var baseCodec = A.codec(fields, config.defaults);
		config.urlCodec = {
			decode: function (url) {
				var parsed = baseCodec.decode(url);
				var roh = url.searchParams.get('sort');
				if (roh) {
					var gelesen = sortLesen(roh);
					if (gelesen) { parsed.state.sort = gelesen.key; parsed.state.sortDir = gelesen.dir; }
					parsed.explicit = true;
				}
				return parsed;
			},
			encode: function (state, url) {
				url = baseCodec.encode(state, url);
				url.searchParams.delete('sort');
				if (state.sort !== sortVorgabe.key || state.sortDir !== sortVorgabe.dir) {
					url.searchParams.set('sort', (state.sortDir === 'desc' ? '-' : '') + state.sort);
				}
				return url;
			}
		};

		var searchIndex = new Map(), searchQuery = null, searchNeedle = '';
		rows.forEach(function (row) {
			searchIndex.set(row, [row.name, row.id, row.type].concat(row.flags.map(function (key) { return w[key]; }))
				.join(' ').toLocaleLowerCase(lang));
		});
		function matchesGroup(row, g, value) {
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
					return value === 'all' || status(row) === {open:'offen',running:'laufend',done:'fertig'}[value];
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
		}
		function matches(row, state, skip) {
			if (state.q) {
				if (state.q !== searchQuery) { searchQuery = state.q; searchNeedle = state.q.toLocaleLowerCase(lang); }
				if (!searchIndex.get(row).includes(searchNeedle)) { return false; }
			}
			return groups.every(function (g) {
				return skip === g.id || matchesGroup(row, g, state.filters[g.id]);
			});
		}

		var adapter = A.client({
			rows: rows,
			id: function (row) { return row.id; },
			matches: matches,
			compare: function (a, b, sort, dir) {
				var richtung = dir === 'desc' ? -1 : 1;
				if (sort === 'level') {
					var al = a.level === null || a.level === undefined ? 0 : a.level;
					var bl = b.level === null || b.level === undefined ? 0 : b.level;
					if (!al && bl) { return 1; }
					if (al && !bl) { return -1; }
					if (al !== bl) { return (al - bl) * richtung; }
					return MQL_SORT.compare(a.name, b.name) || a.id.localeCompare(b.id);
				}
				return (MQL_SORT.compare(a.name, b.name) || a.id.localeCompare(b.id)) * richtung;
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
					var candidates = all.filter(function (row) { return matches(row, state, g.id); });
					facets[g.id] = options.map(function (option) {
						var value = g.kind === 'tree' ? option.path : option.value;
						var selected = g.kind === 'single' ? value : [value];
						return { value: value, count: candidates.filter(function (row) { return matchesGroup(row, g, selected); }).length };
					});
				});
				return facets;
			},
			renderResults: function (result, target) {
				target.replaceChildren();
				var rowUI = window.MQL_TREFFERZEILE, TBL = window.MQL_TABELLE;
				if (!TBL || !rowUI) { return; }
				var levelHeading = kind === 'q' ? rowUI.words.questLevel : rowUI.words.deedLevel;
				var spalten = [
					{label: w.name, sortierung: 'name'},
					{label: levelHeading, sortierung: 'level', zahl: true}
				];
				if (hasStatus) { spalten.push({label: progress.progress}); }
				var bau = TBL.bauen(target, spalten, {key: result.state.sort, dir: result.state.sortDir});
				if (!hasImportedStatus) {
					var help = document.createElement('p');
					help.className = 'mql-row-help';
					help.appendChild(document.createTextNode(rowUI.words.noProgress + ' '));
					var weiter = document.createElement('a');
					weiter.href = '/' + lang + '/' + (lang === 'fr' ? 'progression' : lang === 'en' ? 'progress' : 'spielstand') + '/';
					weiter.textContent = rowUI.words.import;
					help.appendChild(weiter);
					target.insertBefore(help, bau.tabelle);
				}
				if (!result.payload.length) {
					if (options.emptyLabel) {
						var leer = document.createElement('tr'); leer.setAttribute('role', 'row');
						var zelle = document.createElement('td'); zelle.setAttribute('role', 'cell');
						zelle.colSpan = spalten.length; zelle.textContent = options.emptyLabel;
						leer.appendChild(zelle); bau.koerper.appendChild(leer);
					}
					return;
				}
				var showRegion = !!geography, showArea = !!geography;
				result.payload.forEach(function (row) {
					var link = document.createElement('a');
					link.className = 'gs-zeile';
					link.href = '/' + lang + '/' + SEGMENT[kind][lang] + '/' + row.id + '/';
					link.appendChild(rowUI.entityIcon(kind === 'q' ? 'aufgabe' : 'tat'));
					var titel = document.createElement('span');
					titel.className = 'gs-name';
					titel.textContent = kind === 'q' ? row.name.replace(/^\.\s+/, '') : row.name;
					link.appendChild(titel);
					var metaParts = [row.type].concat(row.flags.map(function (key) { return w[key]; }));
					if (geography) { metaParts.push(row.region, row.area); }
					var metaText = metaParts.filter(Boolean).join(' · ');
					if (metaText) {
						var meta = document.createElement('span');
						meta.className = 'gs-meta'; meta.textContent = metaText; link.appendChild(meta);
					}
					var zellen = [link, row.level ? String(row.level) : ''];
					if (hasStatus) {
						var huelle = document.createElement('span');
						huelle.className = 'mql-row-progress';
						var control = window.MQL_STATUS_UI && window.MQL_STATUS_UI.create(
							dataset, row.id, null, 'questfinder', status(row));
						if (control) { huelle.appendChild(control); }
						zellen.push(huelle);
					}
					bau.koerper.appendChild(TBL.zeile(spalten, zellen));
				});
			}
		});
		var load = adapter.load;
		adapter.load = function (state, context) {
			if (store && store.statusSnapshot) {
				var active = store.aktiv();
				snapshot = store.statusSnapshot(dataset, active);
				var imported = active && active.importMeta || {};
				var source = imported.datasets && imported.datasets[dataset];
				hasImportedStatus = source ? source.status !== 'unknown' : imported[dataset] === true;
				hasStatus = hasImportedStatus || !!(active && rows.some(function (row) { return snapshot(row.id) != null; }));
			}
			return load(state, context);
		};
		return { config: config, adapter: adapter };
	};
})();
