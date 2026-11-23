/* Item client adapter, shared by the application, the class profile and the
 * related lists. The definition in web/listen/gegenstaende.js owns the order of
 * the filter groups, the labels, the columns, the sort keys and the paging; this
 * file owns the predicates, the facets, the comparators and the row content. */
(function () {
	'use strict';
	var controller;
	var L = (window.MQL_LISTEN || {}).gegenstaende || null;
	window.MQL_ITEM_FILTER_SETUP = function (data, settings) {
		settings=settings||{};
		var lang = window.MQL_SPRACHE || document.documentElement.lang || 'de', T = window.MQL_T || function (key) { return key; };
		if (!data || !data.e) { return; }
		// An explicit id list also means "none" when it is empty; the class
		// profile uses that to show its empty state instead of the whole index.
		if (Array.isArray(settings.ids)) {
			var erlaubt = new Set(settings.ids);
			data = Object.assign({}, data, {e: data.e.filter(function (row) { return erlaubt.has(row[0]); })});
		}
		var A = window.MQL_FILTERADAPTER, fields = {kat:3,art:6,platz:5,klasse:8,gattung:9,buendel:19};
		// The class profile colours by its own selection above the list, not by
		// the imported character; every other list uses the imported one.
		function eignungsCharakter(){return typeof settings.eignung==='function'?settings.eignung():(window.MQL_EIGNUNG?window.MQL_EIGNUNG.charakter():null);}
		var chestIds=new Set(data.instanceChest||[]);
		/* Schadensart steht nur bei Waffen im Client-Katalog. Sie bekommt einen
		 * eigenen Filter statt einer dritten Ebene im Waffen-Zweig: sonst hinge
		 * jede Waffenart an jeder Schadensart, und der Baum wüchse um ein
		 * Vielfaches. Die Zeile trägt den Index in `schaden`, Position 17. */
		var schadenListe=data.schaden||[], schadenKeys=data.schadenKey||[];
		function schadenVon(row){var i=row[17];return (i===undefined||i<0)?null:(schadenKeys[i]||null);}
		var schadenOptionen=[];
		if(schadenKeys.length){
			var vorhanden=new Set();
			data.e.forEach(function(row){var code=schadenVon(row);if(code){vorhanden.add(code);}});
			schadenOptionen=schadenKeys.map(function(code,index){return {value:code,label:schadenListe[index]};})
				.filter(function(option){return vorhanden.has(option.value);});
		}
		var zeigeSchaden=schadenOptionen.length>0;
		var showSource=chestIds.size>0&&(!settings.area||settings.area==='gegenstaende');
		function key(dim,index) { return String(data[dim+'Key'][index]); }
		function label(dim,value) { var i=data[dim+'Key'].indexOf(value); return data[dim][i] || T('gs_kat_ohne'); }
		function levels(cat) {
			return cat==='ARMOUR'?['art','platz']:['WEAPON','LEGENDARY_WEAPON'].includes(cat)?['platz','art']:cat==='JEWELLERY'?['gattung']:cat==='ITEM'?['buendel','klasse']:cat==='LEGENDARY_ITEM'?['platz']:[];
		}
		function matchesPath(row,path) { return Object.keys(path).every(function (dim) { return key(dim,row[fields[dim]])===path[dim]; }); }
		var paths = new Set();
		function tree(rows,dims,path) {
			if (!dims.length) { return []; }
			var dim=dims[0], values=Array.from(new Set(rows.map(function (r) { return r[fields[dim]]; }).filter(function (v) { return v>=0; })));
			return values.sort(function (a,b) { return MQL_SORT.compare(label(dim,key(dim,a)),label(dim,key(dim,b))); }).map(function (v) {
				var p=Object.assign({},path);p[dim]=key(dim,v);
				var sorted={};Object.keys(p).sort().forEach(function (k) { sorted[k]=p[k]; });paths.add(JSON.stringify(sorted));
				var children=tree(rows.filter(function (r) { return r[fields[dim]]===v; }),dims.slice(1),sorted);
				return {value:JSON.stringify(sorted),path:sorted,label:label(dim,p[dim]),children:children.length?children:undefined};
			});
		}
		var nodes=tree(data.e,['kat'],{});
		nodes.forEach(function (n) { n.children=tree(data.e.filter(function (r) { return matchesPath(r,n.path); }),levels(n.path.kat),n.path); });
		var extra={
			de:{close:'Schließen',show:'%s Treffer anzeigen',error:'Ergebnisse nicht aktualisiert.',retry:'Erneut versuchen',fallback:'Als Seite öffnen',invalidRange:'Ungültiger Stufenbereich'},
			en:{close:'Close',show:'Show %s results',error:'Results not updated.',retry:'Try again',fallback:'Open page',invalidRange:'Invalid level range'},
			fr:{close:'Fermer',show:'Afficher %s résultats',error:'Résultats non actualisés.',retry:'Réessayer',fallback:'Ouvrir la page',invalidRange:'Plage de niveaux incorrecte'}
		}[lang];
		var labels={search:T('gs_suchen'),filter:T('gs_filter'),close:extra.close,sort:T('gs_sort'),reset:T('gs_reset'),more:T('gs_mehr'),count:settings.countLabel||T('gs_viele'),show:extra.show,loading:T('gs_lade'),error:extra.error,retry:extra.retry,fallback:extra.fallback,invalidRange:extra.invalidRange,min:T('gs_von'),max:T('gs_bis'),placeholder:T('gs_platzhalter')};
		function rangeLabel(prefix) {
			return function (range) {
				return prefix+' '+(range.min===null?'…':range.min)+'–'+(range.max===null?'…':range.max);
			};
		}
		/* Suitability is computed per row from the same profile the lists colour
		 * with; without a character there is no facet and no chip. */
		var eignungsStand, eignungsCache=new Map();
		function eignungVon(row){
			var key=row[0];
			if(!eignungsCache.has(key)){
				if(eignungsStand===undefined){eignungsStand=eignungsCharakter();}
				eignungsCache.set(key, eignungsStand&&window.MQL_EIGNUNG?window.MQL_EIGNUNG.zeile(row,eignungsStand):null);
			}
			return eignungsCache.get(key);
		}
		var EIGNW=window.MQL_EIGNUNG?window.MQL_EIGNUNG.woerter:null;
		var eignungOptionen=EIGNW?[
			{value:'passt',label:EIGNW.chipPasst},{value:'achtung',label:EIGNW.chipAchtung},
			{value:'aelter',label:EIGNW.chipAelter},{value:'ueberholt',label:EIGNW.chipUeberholt},
			{value:'zu-hoch',label:EIGNW.chipZuHoch},{value:'falsch',label:EIGNW.chipFalsch},
			{value:'unklar',label:EIGNW.chipUnklar}]:[];
		var zeigeEignung=eignungOptionen.length>0&&!!eignungsCharakter();
		/* Order and labels come from the definition; a group the data cannot
		 * answer simply does not exist. */
		function beschriftung(id, fallback) {
			var treffer=null;
			if (L && L.filter) { L.filter.forEach(function (def) { if (def.id===id) { treffer=def; } }); }
			return treffer && treffer.labelKey ? T(treffer.labelKey) : fallback;
		}
		var gruppen={
			tree:{id:'tree',kind:'tree',label:beschriftung('tree',T('gs_kategorie')),exclusiveRoot:'kat',options:nodes,
				validatePath:function (p) { return paths.has(JSON.stringify(p,Object.keys(p).sort())); },
				pathLabel:function (p) { return ['kat','art','platz','buendel','klasse','gattung'].filter(function (k) { return p[k]!==undefined; }).map(function (k) { return label(k,p[k]); }).join(' › '); }},
			eignung:zeigeEignung?{id:'eignung',kind:'multi',label:beschriftung('eignung',T('gs_eignung')),options:eignungOptionen}:null,
			// The class profile already fixes the character level above the list;
			// there the level ranges would be a second, contradicting control.
			level:settings.levelGroups!==false?{id:'level',kind:'range',label:beschriftung('level',T('gs_gegenstandsstufe')),rangeLabel:rangeLabel(beschriftung('level',T('gs_gegenstandsstufe')))}:null,
			minLevel:settings.levelGroups!==false?{id:'minLevel',kind:'range',label:beschriftung('minLevel',T('gs_mindeststufe')),rangeLabel:rangeLabel(beschriftung('minLevel',T('gs_mindeststufe')))}:null,
			source:showSource?{id:'source',kind:'multi',label:beschriftung('source',T('gs_quelle')),options:[{value:'instanztruhe',label:T('gs_instanztruhe')}]}:null,
			schaden:zeigeSchaden?{id:'schaden',kind:'multi',label:beschriftung('schaden',T('gs_schaden')),options:schadenOptionen}:null,
			quality:{id:'quality',kind:'multi',label:beschriftung('quality',T('gs_qualitaet')),options:[0,1,2,3,4,5].map(function (v) { return {value:v,label:T('gs_qual_'+v)}; })}
		};
		var reihenfolge=L&&L.filter?L.filter:[{id:'tree'},{id:'eignung'},{id:'level'},{id:'minLevel'},{id:'source'},{id:'schaden'},{id:'quality'}];
		var groups=reihenfolge.map(function (def) { return gruppen[def.id]||null; }).filter(Boolean);
		/* The class profile asks for its own default and keeps its descending
		 * order; the item list itself starts with the definition's default. */
		var vorgabe=(function () {
			var roh=settings.defaultSort;
			if (roh==='itemLevelDesc'||roh==='levelDesc') { return {key:'mindeststufe',dir:'desc'}; }
			if (roh==='itemLevel'||roh==='stufe') { return {key:'mindeststufe',dir:'asc'}; }
			if (roh==='name') { return {key:'name',dir:'asc'}; }
			var standard=(L&&L.sortierung&&L.sortierung.standard)||'name';
			return {key:standard,dir:(L&&L.sortierung&&L.sortierung.ersteRichtung&&L.sortierung.ersteRichtung[standard])||'asc'};
		})();
		var sortKeys=(L&&L.sortierung&&L.sortierung.erlaubt)||['name','mindeststufe'];
		var ersteRichtung=(L&&L.sortierung&&L.sortierung.ersteRichtung)||{name:'asc',mindeststufe:'asc'};
		var groesse=(L&&L.blaettern&&L.blaettern.groesse)||50;
		function defaults() {
			var filters={tree:[],quality:[],source:[],eignung:[],schaden:[]};
			if (settings.levelGroups !== false) {
				filters.minLevel={min:null,max:null}; filters.level={min:null,max:null};
			}
			return {q:'',filters:filters,sort:vorgabe.key,sortDir:vorgabe.dir,pagination:{kind:'limit',limit:groesse}};
		}
		var config={area:settings.area||'gegenstaende',lang:lang,rootUrl:location.origin+location.pathname,labels:labels,search:{submit:'debounce',debounceMs:200},
			groups:groups,sort:{keys:sortKeys,ersteRichtung:ersteRichtung,options:[]},pagination:{kind:'limit',size:groesse},
			defaults:defaults};
		var codecFields=[{param:'q',path:['q']},{param:'qual',path:['filters','quality'],type:'csv'}];
		if (settings.levelGroups !== false) {
			codecFields.push({param:'mvon',path:['filters','minLevel','min'],type:'number'},
				{param:'mbis',path:['filters','minLevel','max'],type:'number'},
				{param:'von',path:['filters','level','min'],type:'number'},
				{param:'bis',path:['filters','level','max'],type:'number'});
		}
		/* Eignungswerte sind Wörter, keine Zahlen: der gemeinsame Codec würde
		   `csv` in Zahlen wandeln und `eig=passt` verlieren. */
		if(zeigeEignung){codecFields.push({param:'eig',path:['filters','eignung'],
			decode:function (wert) { return String(wert).split(',').filter(Boolean); },
			encode:function (werte) { return werte && werte.length ? werte.join(',') : null; }});}
		if(showSource){codecFields.push({param:'quelle',path:['filters','source'],
			decode:function (v) { return [v]; },encode:function (v) { return v[0]||null; }});}
		if(zeigeSchaden){codecFields.push({param:'schaden',path:['filters','schaden'],
			decode:function (v) { return String(v).split(',').filter(Boolean); },
			encode:function (v) { return (v&&v.length)?v.join(','):null; }});}
		var baseCodec=A.codec(codecFields,config.defaults);
		/* A sort value in the address is a stable key and a direction:
		 * `sort=mindeststufe`, `sort=-mindeststufe`. Older links carried the
		 * item level; they are read as the wear requirement it replaced. */
		function sortLesen(roh) {
			if (roh==='stufe') { return {key:'mindeststufe',dir:'asc'}; }
			if (roh==='stufe-ab'||roh==='itemLevelDesc') { return {key:'mindeststufe',dir:'desc'}; }
			var dir=roh.charAt(0)==='-'?'desc':'asc', name=dir==='desc'?roh.slice(1):roh;
			return sortKeys.indexOf(name)>=0?{key:name,dir:dir}:null;
		}
		function readValue(dim,value) {
			if (data[dim+'Key'].includes(value)) { return value; }
			if (!['klasse','gattung'].includes(dim) && /^\d+$/.test(value) && data[dim+'Key'][Number(value)]!==undefined) { return key(dim,Number(value)); }
			return value;
		}
		config.urlCodec={decode:function (url) {
			var parsed=baseCodec.decode(url), branches=url.searchParams.getAll('k');
			if (!branches.length) { var p={};Object.keys(fields).forEach(function (d) { if(url.searchParams.has(d)){p[d]=readValue(d,url.searchParams.get(d));parsed.explicit=true;} });if(Object.keys(p).length){branches=[Object.keys(p).map(function(d){return d+':'+p[d];}).join('|')];} }
			parsed.state.filters.tree=branches.map(function (raw) { var p={};raw.split('|').forEach(function (part) { var i=part.indexOf(':'),d=part.slice(0,i);if(i>0 && Object.hasOwn(fields,d)){p[d]=readValue(d,part.slice(i+1));} });return p; });
			var sortRoh=url.searchParams.get('sort');
			if (sortRoh) {
				var gelesen=sortLesen(sortRoh);
				if (gelesen) { parsed.state.sort=gelesen.key; parsed.state.sortDir=gelesen.dir; }
				parsed.explicit=true;
			}
			if(settings.area||url.searchParams.has('k')){parsed.explicit=true;}return parsed;
		},encode:function (state,url) {
			url=baseCodec.encode(state,url);url.searchParams.delete('k');url.searchParams.delete('sort');Object.keys(fields).forEach(function(d){url.searchParams.delete(d);});
			if(state.filters.tree.length===1){Object.keys(state.filters.tree[0]).forEach(function(d){url.searchParams.set(d,state.filters.tree[0][d]);});}
			else{state.filters.tree.forEach(function(p){url.searchParams.append('k',Object.keys(p).sort().map(function(d){return d+':'+p[d];}).join('|'));});}
			if (state.sort!==vorgabe.key || state.sortDir!==vorgabe.dir) {
				url.searchParams.set('sort',(state.sortDir==='desc'?'-':'')+state.sort);
			}
			return url;
		}};
		function fold(s){return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');}
		// Normalize names once, not for every facet option on every redraw.
		var searchIndex=new Map(), rowBranches=new Map(), branchIndex=new Map();
		function branchKey(p){return JSON.stringify(p,Object.keys(p).sort());}
		function indexBranches(options){options.forEach(function(o){branchIndex.set(branchKey(o.path),o.path);if(o.children){indexBranches(o.children);}});}indexBranches(nodes);
		data.e.forEach(function(row){
			searchIndex.set(row[0],fold(row[1])+'\n'+fold(row[0]));
			var path={},branches=[];
			['kat'].concat(levels(key('kat',row[3]))).forEach(function(dim){
				if(row[fields[dim]]<0){return;}
				path[dim]=key(dim,row[fields[dim]]);var id=branchKey(path);
				if(branchIndex.has(id)){branches.push(id);}
			});
			rowBranches.set(row[0],branches);
		});
		var lastQuery=null,words=[];
		function searchMatches(row,q){if(q!==lastQuery){lastQuery=q;words=fold(q).split(/\s+/).filter(Boolean);}var name=searchIndex.get(row[0]);return words.every(function(w){return name.includes(w);});}
		function matches(row,s,skip){
			var quality=s.filters.quality, source=s.filters.source, level=s.filters.level, minLevel=s.filters.minLevel;
			var eignung=s.filters.eignung||[], schaden=s.filters.schaden||[];
			var stand=eignung.length?eignungVon(row):null;
			return (skip==='eignung'||!eignung.length||!!(stand&&eignung.indexOf(stand.code)>=0)) &&
				(skip==='schaden'||!schaden.length||schaden.indexOf(schadenVon(row))>=0) &&
				(skip==='tree'||!s.filters.tree.length||s.filters.tree.some(function(p){return matchesPath(row,p);})) &&
				(skip==='source'||!(source||[]).length||chestIds.has(row[0])) &&
				(skip==='quality'||!quality.length||quality.includes(row[4])) &&
				(skip==='minLevel'||!minLevel||(minLevel.min===null&&minLevel.max===null)||((row[14]||0)>=(minLevel.min===null?-Infinity:minLevel.min)&&(row[14]||0)<=(minLevel.max===null?Infinity:minLevel.max))) &&
				(skip==='level'||!level||(level.min===null&&level.max===null)||(row[7]>0&&(level.min===null||row[7]>=level.min)&&(level.max===null||row[7]<=level.max))) &&
				searchMatches(row,s.q);
		}
		/* Minimum level is the wear requirement; the item level is strength and
		 * no longer sorts. An unknown requirement stays last in both directions. */
		function compare(a,b,sort,dir){
			var richtung=dir==='desc'?-1:1;
			if (sort==='mindeststufe') {
				var ma=a[14]||0, mb=b[14]||0;
				if(!ma&&mb){return 1;}
				if(ma&&!mb){return -1;}
				if(ma!==mb){return (ma-mb)*richtung;}
				return MQL_SORT.compare(a[1],b[1])||a[0].localeCompare(b[0]);
			}
			return (MQL_SORT.compare(a[1],b[1])||a[0].localeCompare(b[0]))*richtung;
		}
		var adapter=A.client({rows:data.e,id:function(r){return r[0];},matches:matches,
			compare:compare,
			facets:function(rows,s){
				var counts=new Map(),qualityCounts=[0,0,0,0,0,0],chestCount=0,eignungCounts={},schadenCounts={};
				rows.forEach(function(row){
					if(matches(row,s,'tree')){rowBranches.get(row[0]).forEach(function(id){counts.set(id,(counts.get(id)||0)+1);});}
					if(matches(row,s,'quality')){qualityCounts[row[4]]++;}
					if(showSource&&chestIds.has(row[0])&&matches(row,s,'source')){chestCount++;}
					if(zeigeSchaden&&matches(row,s,'schaden')){
						var schadensart=schadenVon(row);
						if(schadensart){schadenCounts[schadensart]=(schadenCounts[schadensart]||0)+1;}
					}
					if(zeigeEignung&&matches(row,s,'eignung')){
						var stand=eignungVon(row);
						if(stand){eignungCounts[stand.code]=(eignungCounts[stand.code]||0)+1;}
					}
				});
				return {tree:Array.from(branchIndex,function(pair){return {value:pair[1],count:counts.get(pair[0])||0};}),quality:qualityCounts.map(function(count,value){return {value:value,count:count};}),
					source:showSource?[{value:'instanztruhe',count:chestCount}]:[],
					eignung:zeigeEignung?eignungOptionen.map(function(o){return {value:o.value,count:eignungCounts[o.value]||0};}):[],
					schaden:zeigeSchaden?schadenOptionen.map(function(o){return {value:o.value,count:schadenCounts[o.value]||0};}):[]};
			},renderResults:function(r,target){
				target.replaceChildren();
				var tabelle=window.MQL_TABELLE,EIGN=window.MQL_EIGNUNG;
				var spalten=(L&&L.spalten)||[{id:'name',labelKey:'gs_sort_name',sortierung:'name'},{id:'mindeststufe',labelKey:'gs_mindeststufe',sortierung:'mindeststufe',zahl:true}];
				var sichtbar=spalten.map(function(s){return {label:T(s.labelKey||s.id),sortierung:s.sortierung,zahl:s.zahl};});
				if(!tabelle){return;}
				var bau=tabelle.bauen(target,sichtbar,{key:r.state.sort,dir:r.state.sortDir});
				if(!r.total){
					var leer=document.createElement('tr');leer.setAttribute('role','row');
					var zelle=document.createElement('td');zelle.setAttribute('role','cell');zelle.colSpan=sichtbar.length;
					zelle.className='gs-leer';zelle.textContent=settings.emptyLabel||T('gs_keine');leer.appendChild(zelle);bau.koerper.appendChild(leer);return;
				}
				r.payload.forEach(function(row){
					var a=document.createElement('a');a.className='gs-zeile';
					a.href='/'+lang+'/'+({de:'gegenstand',en:'item',fr:'objet'}[lang])+'/'+row[0]+'/';
					var zeichen=window.MQL_TREFFERZEILE&&window.MQL_TREFFERZEILE.itemIcon
						?window.MQL_TREFFERZEILE.itemIcon(row[2],'gegenstand'):null;
					if(zeichen){a.appendChild(zeichen);}
					else if(row[2]){
						var bild=document.createElement('img');bild.className='symbol';bild.alt='';bild.width=22;bild.height=22;bild.loading='lazy';
						bild.src='/bild/items/'+row[2]+'.webp';
						bild.addEventListener('error',function(){bild.hidden=true;});
						a.appendChild(bild);
					}
					var name=document.createElement('span');name.className='gs-name q'+(row[4]||0);name.textContent=row[1];a.appendChild(name);
					var teile=[label('kat',key('kat',row[3])),T('gs_qual_'+row[4])];
					['art','gattung','klasse','platz'].forEach(function(dim){if(row[fields[dim]]>=0){teile.push(label(dim,key(dim,row[fields[dim]])));}});
					if(row[7]>0){teile.push(T('gs_gegenstandsstufe')+' '+row[7]);}
					var meta=document.createElement('span');meta.className='gs-meta';meta.textContent=teile.filter(Boolean).join(' · ');a.appendChild(meta);
					var stand=EIGN?eignungVon(row):null;
					if(stand){var marke=document.createElement('span');marke.className='mql-row-eignung';marke.appendChild(EIGN.chip(stand));a.appendChild(marke);}
					bau.koerper.appendChild(tabelle.zeile(sichtbar,[a,row[14]>0?String(row[14]):'']));
				});
			}
		});
		return {config:config,adapter:adapter};
	};
	window.MQL_GEGENSTAENDE_ZEICHNEN = function () {
		if(!window.MQL_GEGENSTAENDE||!window.MQL_FILTER_UI){return;}
		/* A page may carry two lists (sold goods and barter): each root mounts
		 * itself, with its own id set and its own remembered filter state. */
		Array.prototype.forEach.call(document.querySelectorAll('main.gs,[data-item-filter-root]'),function (main) {
			if(main.dataset.filterMounted==='1'){return;}
			var ids=(main.dataset.itemIds||'').split(',').filter(Boolean);
			var setup=window.MQL_ITEM_FILTER_SETUP(window.MQL_GEGENSTAENDE,{area:main.dataset.filterArea||(ids.length?'haendler':'gegenstaende'),ids:ids.length?ids:null});
			if(!setup){return;}
			var list=main.querySelector('[data-filter-results]')||main.querySelector('#gs-ergebnis');
			if(!list){return;}
			list.dataset.filterResults='';
			main.appendChild(list);
			var raster=main.querySelector('.gs-raster');if(raster){raster.remove();}
			var suche=main.querySelector('#gs-suche');if(suche){suche.remove();}
			main.dataset.filterMounted='1';
			controller=window.MQL_FILTER_UI.mount(main,setup);window.MQL_ITEM_FILTER=controller;
		});
	};
	// The dynamically loaded index may finish before this local controller script.
	if (window.MQL_GEGENSTAENDE) { window.MQL_GEGENSTAENDE_ZEICHNEN(); }
})();
