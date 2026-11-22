/* The map's catalogue-wide quest finder on the shared filter UI. */
(function () {
	'use strict';
	var labels = {
		de: { search:'Aufgaben suchen', placeholder:'Aufgabe, Auftraggeber oder Gebiet', filter:'Filter', close:'Schließen', sort:'Sortierung', reset:'Zurücksetzen', more:'Weitere anzeigen', count:'%s Aufgaben', show:'%s Treffer anzeigen', loading:'Lade …', error:'Ergebnisse nicht aktualisiert.', retry:'Erneut versuchen', fallback:'Als Seite öffnen', invalidRange:'Ungültiger Bereich', min:'Von', max:'Bis', topic:'Thema', class:'Klasse', origin:'Herkunft', geography:'Region und Gebiet', flags:'Merkmale', level:'Stufe', status:'Fortschritt', all:'alle', open:'offen', done:'erledigt', machbar:'annehmbar', running:'läuft', unknown:'Kein Import', excluded:'Nicht im Journal', name:'Name', daily:'täglich', repeat:'wiederholbar', group:'Gruppe', small:'kleine Gemeinschaft', fellowship:'große Gemeinschaft', instance:'Instanz', scaling:'skaliert mit Stufe', task:'Aufgabenbrett', noResults:'Keine passenden Aufgaben gefunden.' },
		en: { search:'Search quests', placeholder:'Quest, giver or area', filter:'Filters', close:'Close', sort:'Sort', reset:'Reset', more:'Show more', count:'%s quests', show:'Show %s results', loading:'Loading …', error:'Results not updated.', retry:'Try again', fallback:'Open page', invalidRange:'Invalid range', min:'From', max:'To', topic:'Topic', class:'Class', origin:'Origin', geography:'Region and area', flags:'Properties', level:'Level', status:'Progress', all:'all', open:'open', done:'done', machbar:'available', running:'in progress', unknown:'No import', excluded:'Not in journal', name:'Name', daily:'daily', repeat:'repeatable', group:'Group', small:'small fellowship', fellowship:'fellowship', instance:'instance', scaling:'scales with level', task:'Task board', noResults:'No matching quests found.' },
		fr: { search:'Chercher des quêtes', placeholder:'Quête, donneur ou pays', filter:'Filtres', close:'Fermer', sort:'Tri', reset:'Réinitialiser', more:'Afficher davantage', count:'%s quêtes', show:'Afficher %s résultats', loading:'Chargement …', error:'Résultats non actualisés.', retry:'Réessayer', fallback:'Ouvrir la page', invalidRange:'Plage incorrecte', min:'De', max:'À', topic:'Thème', class:'Classe', origin:'Origine', geography:'Région et pays', flags:'Caractéristiques', level:'Niveau', status:'Progression', all:'toutes', open:'à faire', done:'terminées', machbar:'disponibles', running:'en cours', unknown:'Non importée', excluded:'Absent du journal', name:'Nom', daily:'quotidienne', repeat:'répétable', group:'Groupe', small:'petite communauté', fellowship:'communauté', instance:'instance', scaling:'évolue avec le niveau', task:'Tableau des tâches', noResults:'Aucune quête correspondante.' }
	};
	var topicNames = {
		de: {epic:'Epische Geschichte',class:'Klassenaufgaben',origin:'Herkunftsaufgaben',festivals:'Feste und Ereignisse',missions:'Missionen',instances:'Instanzen und Schlachten',craft:'Handwerk',board:'Aufgabenbrett',other:'Weitere Aufgaben'},
		en: {epic:'Epic Story',class:'Class quests',origin:'Origin quests',festivals:'Festivals and events',missions:'Missions',instances:'Instances and battles',craft:'Crafting',board:'Task board',other:'Other quests'},
		fr: {epic:'Histoire épique',class:'Quêtes de classe',origin:'Quêtes d’origine',festivals:'Fêtes et événements',missions:'Missions',instances:'Instances et batailles',craft:'Artisanat',board:'Tableau des tâches',other:'Autres quêtes'}
	};
	function fold(value) {
		return String(value == null ? '' : value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').toLocaleLowerCase();
	}
	function mount(root, quests, selectQuest) {
		var lang = document.documentElement.lang, w = labels[lang] || labels.de, topics = topicNames[lang] || topicNames.de;
		var progressFallback = {
			de:{progress:'Fortschritt',all:'Alle',open:'Nicht begonnen',running:'Begonnen',done:'Erledigt',available:'Voraussetzungen erfüllt'},
			en:{progress:'Progress',all:'All',open:'Not started',running:'In progress',done:'Completed',available:'Requirements met'},
			fr:{progress:'Progression',all:'Toutes',open:'Non commencée',running:'En cours',done:'Terminée',available:'Conditions remplies'}
		};
		var progress = window.MQL_STATUS_UI?.words?.(lang) || progressFallback[lang] || progressFallback.de;
		var boardValue = {de:'Auftrag',en:'Task',fr:'Tâche'}[lang] || 'Task';
		var classMarker = 'themeClass', originMarker = 'themeOrigin';
		var classValues = Array.from(new Set(quests.filter(function (q) {
			return q.th === 'class' && q.f && q.f[0] === classMarker;
		}).map(function (q) { return q.f[1]; }).filter(Boolean))).sort(MQL_SORT.compare);
		var originValues = Array.from(new Set(quests.filter(function (q) {
			return q.th === 'origin' && q.f && q.f[0] === originMarker;
		}).map(function (q) { return q.f[1]; }).filter(Boolean))).sort(MQL_SORT.compare);
		var replaced = window.MQL_REPLACED || {}, store = window.MQL_SPEICHER;
		var known, manual, hasQuestProgress, hasMachbar, laufend, characterLevel, progressCache;
		var searchIndex = new Map(), searchQuery = null, searchNeedle = '';
		quests.forEach(function (q) {
			searchIndex.set(q, fold([q.n,q.i,q.g,q.r,q.z,q.u].join(' ')));
		});
		function currentId(id) { id = String(id || '').toUpperCase(); return replaced[id] || id; }
		function refreshProgress() {
			// Facet counting visits the same rows repeatedly. Never read and parse
			// the entire local character store from inside a row predicate.
			var character = store && store.aktiv();
			var questIds = character && character.quests || [];
			known = new Set(questIds.concat(character && character.deeds || []).map(currentId));
			manual = character && character.manuell && character.manuell.quests || {};
			laufend = character && character.laufend || {};
			characterLevel = Number(character && character.level) || 0;
			hasMachbar = character?.importMeta?.quests ?? (questIds.length > 0);
			hasQuestProgress = hasMachbar || !!Object.keys(laufend).length
				|| !!(Object.keys(manual).length && quests.some(function (q) { return manualStatus(q.i); }));
			progressCache = new Map();
		}
		function manualStatus(id) {
			var key = currentId(id);
			return Object.prototype.hasOwnProperty.call(manual, key) ? manual[key] : null;
		}
		function completed(id) {
			return known.has(currentId(id)) || manualStatus(id) === 'fertig';
		}
		refreshProgress();
		// The filter tree mirrors the map hierarchy: region → area → sub-area.
		// Labels come from the catalogue path (`f`), which is built from the game
		// maps. The map view and the finder therefore show the same levels.
		var geoTree = {};
		quests.forEach(function (q) {
			var path = q.f && q.f.length && q.f[0] === q.r ? q.f : [q.r, q.z || q.u];
			var labels = path.filter(function (name) {
				return name && !/^karte\s+\d+/i.test(name);
			});
			if (!labels.length || !labels[0]) { return; }
			var region = labels[0];
			var node = geoTree[region] || (geoTree[region] = { label: region, children: {} });
			labels.slice(1).forEach(function (name) {
				node.children[name] = node.children[name] || { label: name, children: {} };
				node = node.children[name];
			});
		});
		var regions = Object.keys(geoTree).sort(MQL_SORT.compare);
		// Deep tree labels repeat their group ("Ost-Rohan: Die Steppe"). The
		// heading already names the group, so the option keeps the short name.
		function geoLabel(name) {
			// Map labels repeat their group as a prefix ("Ost-Rohan: Die Steppe").
			// The branch above already carries that name.
			return name.replace(/^[^:]{2,32}:\s+/, '');
		}
		function geoKinder(node, region, path, tiefe, area) {
			return Object.keys(node.children).sort(MQL_SORT.compare).map(function (name) {
				var kind = node.children[name];
				var next = Object.assign({}, path);
				var nextArea = area || name;
				if (tiefe === 1) { next.area = name; } else { next.teil = (next.teil ? next.teil + ' › ' : '') + name; }
				var option = { path: next, label: geoLabel(name) };
				var kinder = geoKinder(kind, region, next, tiefe + 1, nextArea);
				if (kinder.length) { option.children = kinder; }
				return option;
			});
		}
		var geoOptions = regions.map(function (region) {
			var path = { region: region };
			return { path: path, label: region, children: geoKinder(geoTree[region], region, path, 1, '') };
		});
		function validPath(path) {
			var node = path && geoTree[path.region];
			if (!node) { return false; }
			if (!path.area) { return true; }
			node = node.children[path.area];
			if (!node) { return false; }
			if (!path.teil) { return true; }
			return path.teil.split(' › ').every(function (teil) {
				node = node.children[teil];
				return !!node;
			});
		}
		function pathLabel(path) {
			return path.region + (path.area ? ' › ' + path.area : '') + (path.teil ? ' › ' + path.teil : '');
		}
		var topicOptions = Object.keys(topics).filter(function (key) {
			return key === 'board'
				? quests.some(function (q) { return q.a === boardValue; })
				: quests.some(function (q) { return q.th === key; });
		}).map(function (key) { return {value:key,label:topics[key]}; });
		var groups = [
			{id:'topic',kind:'multi',label:w.topic,initialOpen:true,options:topicOptions},
			{id:'class',kind:'multi',label:w.class,options:classValues.map(function (value) { return {value:value,label:value}; })},
			{id:'origin',kind:'multi',label:w.origin,options:originValues.map(function (value) { return {value:value,label:value}; })},
			{id:'geography',kind:'tree',label:w.geography,options:geoOptions,validatePath:validPath,pathLabel:pathLabel,exclusivePaths:true},
			{id:'flag',kind:'multi',label:w.flags,options:[
				{value:'daily',label:w.daily},{value:'repeat',label:w.repeat},{value:'group',label:w.group},
				{value:'small',label:w.small},{value:'fellowship',label:w.fellowship},{value:'instance',label:w.instance},{value:'scaling',label:w.scaling}
			]},
			{id:'level',kind:'range',label:w.level,min:0,max:150,rangeLabel:function (value) {
				return w.level + ' ' + (value.min === null ? '0' : value.min) + '–' + (value.max === null ? '∞' : value.max);
			}}
		];
		function statusOptions() {
			var options = [{value:'all',label:progress.all,keepVisible:true}];
			if (hasQuestProgress) {
				['open','running','done'].forEach(function (key) {
					options.push({value:key,label:progress[key],keepVisible:true});
				});
			}
			if (hasMachbar) { options.push({value:'machbar',label:progress.available,keepVisible:true}); }
			return options;
		}
		var statusGroup = {id:'status',kind:'single',label:progress.progress,available:function () { return hasQuestProgress; },options:statusOptions()};
		var groupsById = {};
		groups.forEach(function (group) { groupsById[group.id] = group; });
		groups = [statusGroup,groupsById.level,groupsById.geography,groupsById.topic,
			groupsById.class,groupsById.origin,groupsById.flag];
		var defaults = function () {
			var filters = {topic:[],class:[],origin:[],geography:[],flag:[],level:{min:null,max:null}};
			filters.status = 'all';
			return {q:'',filters:filters,sort:'name',pagination:{kind:'limit',limit:30}};
		};
		var fields = [{param:'q',path:['q']},{param:'sort',path:['sort'],omit:'name'}];
		groups.forEach(function (group) {
			if (group.kind === 'range') {
				fields.push({param:'von',path:['filters',group.id,'min'],type:'number'},{param:'bis',path:['filters',group.id,'max'],type:'number'});
			} else if (group.kind === 'tree') {
				fields.push({param:'gebiet',path:['filters',group.id],type:'multi',encode:function (v) { return v.map(JSON.stringify); },decode:function (v) { return v.map(function (x) { try { return JSON.parse(x); } catch (e) { return null; } }).filter(Boolean); }});
			} else {
				fields.push({param:group.id,path:['filters',group.id],type:group.kind === 'boolean' ? 'boolean' : group.kind === 'single' ? 'text' : 'multi',omit:group.kind === 'boolean' ? false : group.kind === 'single' ? 'all' : undefined});
			}
		});
		var config = {
			area:'karten-aufgabenfinder',lang:lang,labels:Object.assign({},w),rootUrl:location.origin+location.pathname,groups:groups,
			search:{submit:'debounce',debounceMs:180},
			sort:{options:[{value:'name',label:w.name},{value:'level',label:w.level}]},
			pagination:{kind:'limit',size:30},
			defaults:defaults,
			urlCodec:window.MQL_FILTERADAPTER.codec(fields,defaults)
		};
		function rowFlags(q) {
			var flags=[];
			if (q.dy) { flags.push('daily'); } if (q.rp) { flags.push('repeat'); }
			if (q.gr) { flags.push('group'); flags.push(Number(q.gr) === 1 ? 'small' : 'fellowship'); }
			if (q.ix) { flags.push('instance'); } if (q.ls) { flags.push('scaling'); }
			return flags;
		}
		function progressState(row) {
			if (!progressCache.has(row)) { progressCache.set(row, computeProgress(row)); }
			return progressCache.get(row);
		}
		function computeProgress(row) {
			var manual = manualStatus(row.i);
			if (manual) { return manual === 'fertig' ? 'done' : manual === 'laufend' ? 'running' : 'open'; }
			if (known.has(currentId(row.i))) { return 'done'; }
			if (!hasQuestProgress) { return 'unknown'; }
			if (row.x === 1 || row.mp === 1) { return 'excluded'; }
			if (row.e && row.e.some(function (id) { return completed(id); })) { return 'excluded'; }
			if (laufend[row.i]) { return 'running'; }
			return hasMachbar ? 'open' : 'unknown';
		}
		function machbar(row) {
			if (!hasQuestProgress || progressState(row) !== 'open' || row.vb || row.x === 1 || row.mp === 1 ||
				(row.e && row.e.some(function (id) { return completed(id); }))) { return false; }
			if (characterLevel && row.vl && row.vl > characterLevel) { return false; }
			if (row.v && !row.v.every(function (id) { return completed(id); })) { return false; }
			if (row.vo && !row.vo.some(function (id) { return completed(id); })) { return false; }
			return true;
		}
		function matchesGroup(row,group,value) {
				if (group.id === 'topic') {
					return !value.length || value.some(function (topic) {
						return topic === 'board' ? row.a === boardValue : topic === (row.th || '');
					});
				}
				if (group.id === 'class') {
					return !value.length || (row.th === 'class' && row.f && row.f[0] === classMarker && value.indexOf(row.f[1]) >= 0);
				}
				if (group.id === 'origin') {
					return !value.length || (row.th === 'origin' && row.f && row.f[0] === originMarker && value.indexOf(row.f[1]) >= 0);
				}
				if (group.id === 'geography') {
					return !value.length || value.some(function (path) {
						if (path.region !== row.r) { return false; }
						var labels = row.f && row.f.length && row.f[0] === row.r ? row.f : [];
						if (path.area && path.area !== (labels[1] || row.z || row.u)) { return false; }
						if (!path.teil) { return true; }
						var rest = labels.slice(2).join(' › ');
						return rest === path.teil || rest.indexOf(path.teil + ' › ') === 0;
					});
				}
				if (group.id === 'flag') {
					var selected = value || [], sizes = selected.filter(function (x) { return x === 'small' || x === 'fellowship'; });
					var other = selected.filter(function (x) { return x !== 'small' && x !== 'fellowship'; });
					var flags = rowFlags(row);
					return (!sizes.length || sizes.some(function (x) { return flags.includes(x); })) && other.every(function (x) { return flags.includes(x); });
				}
				if (group.id === 'level') {
					var n = Number(row.l);
					return (value.min === null && value.max === null) || (Number.isFinite(n) && (value.min === null || n >= value.min) && (value.max === null || n <= value.max));
				}
				if (group.id === 'status') {
					if (value === 'all') { return true; }
					if (value === 'done') { return progressState(row) === 'done'; }
					if (value === 'open') { return progressState(row) === 'open'; }
					if (value === 'running') { return progressState(row) === 'running'; }
					return value === 'machbar' && hasMachbar && machbar(row);
				}
				return true;
		}
		function matches(row,state,skipGroup) {
			if (state.q) {
				if (state.q !== searchQuery) { searchQuery = state.q; searchNeedle = fold(state.q); }
				if (!searchIndex.get(row).includes(searchNeedle)) { return false; }
			}
			return groups.every(function (group) {
				return group.id === skipGroup || matchesGroup(row,group,state.filters[group.id]);
			});
		}
		var adapter = window.MQL_FILTERADAPTER.client({
			rows:quests,id:function (q) { return String(q.i); },matches:matches,
			compare:function (a,b,sort) { return (sort === 'level' ? (Number(a.l)||Infinity)-(Number(b.l)||Infinity) : 0) || MQL_SORT.compare(a.n,b.n) || String(a.i).localeCompare(String(b.i)); },
			facets:function (all,state) {
				var result={};
				groups.forEach(function (group) {
					if (!group.options) { return; }
					var options = [];
					function collect(items) {
						items.forEach(function (option) {
							options.push(option);
							if (option.children) { collect(option.children); }
						});
					}
					collect(group.options);
					var candidates = all.filter(function (row) { return matches(row,state,group.id); });
					result[group.id]=options.map(function (option) {
						var value = group.kind === 'tree' ? option.path : option.value;
						return {value:value,count:candidates.filter(function (row) {
							return matchesGroup(row,group,group.kind === 'single' ? value : [value]);
						}).length};
					});
				});
				return result;
			},
		renderResults:function (result,target) {
			target.replaceChildren();
			var rowUI=window.MQL_TREFFERZEILE;
			if(rowUI){
				rowUI.header(target,{progress:true,levelHeading:rowUI.words.questLevel});
				if(!hasMachbar){rowUI.help(target,rowUI.words.noProgress);}
			}
			if (!result.payload.length) {
				var empty=document.createElement('li'); empty.className='finder-keine-treffer'; empty.textContent=w.noResults;
					target.appendChild(empty); return;
				}
				var counts={};
				result.payload.forEach(function (q) { counts[q.n]=(counts[q.n]||0)+1; });
				result.payload.forEach(function (q) {
					if(rowUI){
						var stand=progressState(q);
						var control=window.MQL_STATUS_UI&&window.MQL_STATUS_UI.create('quests',q.i,null,'questfinder',
							{done:'fertig',running:'laufend',open:'offen'}[stand]||null);
						var meta=[q.g,q.z||q.r,q.a===boardValue?w.task:''].filter(Boolean).join(' · ');
						var values=q.l?[{label:rowUI.words.questLevel,value:q.l}]:[];
						target.appendChild(rowUI.row(target,{
							// Older cached catalogue builds can contain an orphaned chapter separator.
							icon:'aufgabe',name:q.n.replace(/^\.\s+/, ''),meta:meta,values:values,progress:control,levelHeading:rowUI.words.questLevel,
							onActivate:function(){selectQuest(q);}
						}));
						return;
					}
					var li=document.createElement('li'),button=document.createElement('button'),name=document.createElement('strong'),meta=document.createElement('small'),status=document.createElement('span');
					button.type='button';button.className='finder-treffer';name.textContent=q.n;
					var stand=progressState(q);
					status.className='questfinder-status questfinder-status-'+stand;
					status.textContent={done:'✓ '+progress.done,open:'● '+progress.open,running:'◒ '+progress.running,unknown:'○ '+w.unknown,excluded:'– '+w.excluded}[stand];
					var rewardCount = Array.isArray(q.rw) ? q.rw.length : 0;
					var details=[q.l?w.level+' '+q.l:'',q.a===boardValue?w.task:'',q.g||(counts[q.n]>1?w.name+' · '+q.i:''),rewardCount ? ((window.MQL_T && window.MQL_T('belohnungen')) || 'Belohnungen')+' '+rewardCount:''].filter(Boolean);
					meta.textContent=details.join(' · ');
					var control=window.MQL_STATUS_UI&&window.MQL_STATUS_UI.create('quests',q.i,null,'questfinder',
						{done:'fertig',running:'laufend',open:'offen'}[stand] || null);
					button.append(name);
					if (!control) { button.append(status); }
					button.append(meta);
					button.addEventListener('click',function () { selectQuest(q); });
					li.appendChild(button);
					if (control) {
						control.addEventListener('click',function (event) { event.stopPropagation(); });
						li.appendChild(control);
					}
					target.appendChild(li);
				});
			}
		});
		var controller=window.MQL_FILTER_UI.mount(root,{config:config,adapter:adapter});
		if (window.addEventListener) {
			window.addEventListener('mql-status', function () {
				refreshProgress();
				statusGroup.options = statusOptions();
				if (controller && controller.setCharacterContext) { controller.setCharacterContext(null); }
			});
		}
		return controller;
	}
	window.MQL_KARTEN_AUFGABENFILTER={mount:mount,topics:topicNames};
})();
