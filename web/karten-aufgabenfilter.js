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
		var boardValue = {de:'Auftrag',en:'Task',fr:'Tâche'}[lang] || 'Task';
		var classMarker = 'themeClass', originMarker = 'themeOrigin';
		var classValues = Array.from(new Set(quests.filter(function (q) {
			return q.th === 'class' && q.f && q.f[0] === classMarker;
		}).map(function (q) { return q.f[1]; }).filter(Boolean))).sort(function (a,b) { return a.localeCompare(b,lang); });
		var originValues = Array.from(new Set(quests.filter(function (q) {
			return q.th === 'origin' && q.f && q.f[0] === originMarker;
		}).map(function (q) { return q.f[1]; }).filter(Boolean))).sort(function (a,b) { return a.localeCompare(b,lang); });
		var replaced = window.MQL_REPLACED || {};
		var known = new Set(), character = window.MQL_SPEICHER && window.MQL_SPEICHER.aktiv();
		function currentId(id) { id = String(id || '').toUpperCase(); return replaced[id] || id; }
		var questIds = character ? (character.quests || []) : [];
		var progressIds = character ? questIds.concat(character.deeds || []) : [];
		progressIds.forEach(function (id) { known.add(currentId(id)); });
		var hasQuestProgress = !!(character && window.MQL_SPEICHER &&
			(window.MQL_SPEICHER.kennt('quests') === true || questIds.length > 0));
		var hasMachbar = hasQuestProgress;
		var laufend = character && character.laufend || {};
		var characterLevel = Number(character && character.level) || 0;
		var regions = Array.from(new Set(quests.map(function (q) { return q.r; }).filter(Boolean))).sort(function (a,b) { return a.localeCompare(b,lang); });
		var geoMap = {};
		regions.forEach(function (region) {
			geoMap[region] = Array.from(new Set(quests.filter(function (q) { return q.r === region; })
				.map(function (q) { return q.z || q.u; }).filter(function (area) { return area && !/^karte\s+\d+/i.test(area); }))).sort(function (a,b) { return a.localeCompare(b,lang); });
		});
		var geoOptions = regions.map(function (region) {
			var path = {region:region};
			return {path:path,label:region,children:geoMap[region].map(function (area) {
				return {path:{region:region,area:area},label:area};
			})};
		});
		function validPath(path) {
			return !!(path && geoMap[path.region] && (!path.area || geoMap[path.region].indexOf(path.area) >= 0));
		}
		function pathLabel(path) { return path.region + (path.area ? ' › ' + path.area : ''); }
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
		var statusGroup = {id:'status',kind:'single',label:w.status,options:[
			{value:'all',label:w.all,keepVisible:true},{value:'open',label:w.open,keepVisible:true},{value:'done',label:w.done,keepVisible:true}
		].concat(hasMachbar ? [{value:'machbar',label:w.machbar,keepVisible:true}] : [])};
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
			if (known.has(currentId(row.i))) { return 'done'; }
			if (!hasQuestProgress) { return 'unknown'; }
			if (row.x === 1 || row.mp === 1) { return 'excluded'; }
			if (row.e && row.e.some(function (id) { return known.has(currentId(id)); })) { return 'excluded'; }
			if (laufend[row.i]) { return 'running'; }
			return 'open';
		}
		function machbar(row) {
			if (!hasQuestProgress || progressState(row) !== 'open' || row.vb) { return false; }
			if (characterLevel && row.vl && row.vl > characterLevel) { return false; }
			if (row.v && !row.v.every(function (id) { return known.has(currentId(id)); })) { return false; }
			if (row.vo && !row.vo.some(function (id) { return known.has(currentId(id)); })) { return false; }
			return true;
		}
		function matches(row,state) {
			if (state.q && !fold([row.n,row.i,row.g,row.r,row.z,row.u].join(' ')).includes(fold(state.q))) { return false; }
			return groups.every(function (group) {
				var value = state.filters[group.id];
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
					return !value.length || value.some(function (path) { return path.region === row.r && (!path.area || path.area === (row.z || row.u)); });
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
					if (value === 'open') { return progressState(row) === 'open' || progressState(row) === 'running'; }
					return value === 'machbar' && hasMachbar && machbar(row);
				}
				return true;
			});
		}
		var adapter = window.MQL_FILTERADAPTER.client({
			rows:quests,id:function (q) { return String(q.i); },matches:matches,
			compare:function (a,b,sort) { return (sort === 'level' ? (Number(a.l)||Infinity)-(Number(b.l)||Infinity) : 0) || a.n.localeCompare(b.n,lang) || String(a.i).localeCompare(String(b.i)); },
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
					result[group.id]=options.map(function (option) {
						var value = group.kind === 'tree' ? option.path : option.value;
						var candidate=JSON.parse(JSON.stringify(state));
						candidate.filters[group.id]=group.kind==='single'?value:[value];
						return {value:value,count:all.filter(function (q) { return matches(q,candidate); }).length};
					});
				});
				return result;
			},
		renderResults:function (result,target) {
			target.replaceChildren();
			if (!result.payload.length) {
				var empty=document.createElement('li'); empty.className='finder-keine-treffer'; empty.textContent=w.noResults;
					target.appendChild(empty); return;
				}
				var counts={};
				result.payload.forEach(function (q) { counts[q.n]=(counts[q.n]||0)+1; });
				result.payload.forEach(function (q) {
					var li=document.createElement('li'),button=document.createElement('button'),name=document.createElement('strong'),meta=document.createElement('small'),status=document.createElement('span');
					button.type='button';button.className='finder-treffer';name.textContent=q.n;
					var stand=progressState(q);
					status.className='questfinder-status questfinder-status-'+stand;
					status.textContent={done:'✓ '+w.done,open:'● '+w.open,running:'◒ '+w.running,unknown:'○ '+w.unknown,excluded:'– '+w.excluded}[stand];
					var details=[q.l?w.level+' '+q.l:'',q.a===boardValue?w.task:'',q.g||(counts[q.n]>1?w.name+' · '+q.i:'')].filter(Boolean);
					meta.textContent=details.join(' · ');button.append(name,status,meta);button.addEventListener('click',function () { selectQuest(q); });li.appendChild(button);target.appendChild(li);
				});
			}
		});
		var controller=window.MQL_FILTER_UI.mount(root,{config:config,adapter:adapter});
		return controller;
	}
	window.MQL_KARTEN_AUFGABENFILTER={mount:mount,topics:topicNames};
})();
