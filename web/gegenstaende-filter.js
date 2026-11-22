/* Item client adapter, shared by the application and the isolated preview. */
(function () {
	'use strict';
	var controller;
	window.MQL_ITEM_FILTER_SETUP = function (data, settings) {
		settings=settings||{};
		var lang = window.MQL_SPRACHE || document.documentElement.lang || 'de', T = window.MQL_T;
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
		var chestIds=new Set(data.instanceChest||[]), sourceLabels={
			de:['Quelle','Instanztruhe'],en:['Source','Instance chest'],fr:['Source','Coffre d’instance']
		}[lang];
		/* Schadensart steht nur bei Waffen im Client-Katalog. Sie bekommt einen
		 * eigenen Filter statt einer dritten Ebene im Waffen-Zweig: sonst hinge
		 * jede Waffenart an jeder Schadensart, und der Baum wüchse um ein
		 * Vielfaches. Die Zeile trägt den Index in `schaden`, Position 17. */
		var schadenListe=data.schaden||[], schadenKeys=data.schadenKey||[];
		function schadenVon(row){var i=row[17];return (i===undefined||i<0)?null:(schadenKeys[i]||null);}
		function schadenName(code){var i=schadenKeys.indexOf(code);return i>=0?(schadenListe[i]||code):code;}
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
			de:['Schließen','%s Treffer anzeigen','Ergebnisse nicht aktualisiert.','Erneut versuchen','Als Seite öffnen','Ungültiger Stufenbereich','Gegenstandsstufe','Mindeststufe','Gegenstandsstufe absteigend','Eignung'],
			en:['Close','Show %s results','Results not updated.','Try again','Open page','Invalid level range','Item level','Minimum level','Item level, descending','Suitability'],
			fr:['Fermer','Afficher %s résultats','Résultats non actualisés.','Réessayer','Ouvrir la page','Plage de niveaux incorrecte','Niveau d’objet','Niveau minimum','Niveau d’objet décroissant','Compatibilité']
		}[lang];
		var labels={search:T('gs_suchen'),filter:T('gs_filter'),close:extra[0],sort:T('gs_sort'),reset:T('gs_reset'),more:T('gs_mehr'),count:settings.countLabel||T('gs_viele'),show:extra[1],loading:T('gs_lade'),error:extra[2],retry:extra[3],fallback:extra[4],invalidRange:extra[5],min:T('gs_von'),max:T('gs_bis'),placeholder:T('gs_platzhalter')};
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
		/* Reihenfolge nach der Frage, die ein Spieler zuerst stellt: Was ist es,
		 * passt es mir, wie stark ist es, was verlangt es, woher kommt es.
		 * Die Seltenheit steht zuletzt: sie hängt an der Stufe und sagt am
		 * wenigsten Neues. */
		var groups=[
			{id:'tree',kind:'tree',label:T('gs_kategorie'),exclusiveRoot:'kat',options:nodes,validatePath:function (p) { return paths.has(JSON.stringify(p,Object.keys(p).sort())); },pathLabel:function (p) { return ['kat','art','platz','buendel','klasse','gattung'].filter(function (k) { return p[k]!==undefined; }).map(function (k) { return label(k,p[k]); }).join(' › '); }}];
		if(zeigeEignung){groups.push({id:'eignung',kind:'multi',label:extra[9],options:eignungOptionen});}
		// The class profile already fixes the character level above the list;
		// there the level ranges would be a second, contradicting control.
		if (settings.levelGroups !== false) {
			groups.push({id:'level',kind:'range',label:extra[6],rangeLabel:rangeLabel(extra[6])},
				{id:'minLevel',kind:'range',label:extra[7],rangeLabel:rangeLabel(extra[7])});
		}
		if(showSource){groups.push({id:'source',kind:'multi',label:sourceLabels[0],
			options:[{value:'instanztruhe',label:sourceLabels[1]}]});}
		if(zeigeSchaden){groups.push({id:'schaden',kind:'multi',label:T('gs_schaden'),options:schadenOptionen});}
		groups.push({id:'quality',kind:'multi',label:T('gs_qualitaet'),options:[0,1,2,3,4,5].map(function (v) { return {value:v,label:T('gs_qual_'+v)}; })});
		function defaults() {
			var filters={tree:[],quality:[],source:[],eignung:[],schaden:[]};
			if (settings.levelGroups !== false) {
				filters.minLevel={min:null,max:null}; filters.level={min:null,max:null};
			}
			return {q:'',filters:filters,sort:settings.defaultSort||'name',pagination:{kind:'limit',limit:50}};
		}
		var sortOptions=[{value:'name',label:T('gs_sort_name')},{value:'itemLevel',label:extra[6]}];
		if (settings.descendingSort) { sortOptions.push({value:'itemLevelDesc',label:extra[8]}); }
		var config={area:settings.area||'gegenstaende',lang:lang,rootUrl:location.origin+location.pathname,labels:labels,search:{submit:'debounce',debounceMs:200},
			groups:groups,sort:{options:sortOptions},pagination:{kind:'limit',size:50},
			defaults:defaults};
		var codecFields=[{param:'q',path:['q']},{param:'qual',path:['filters','quality'],type:'csv'}];
		if (settings.levelGroups !== false) {
			codecFields.push({param:'mvon',path:['filters','minLevel','min'],type:'number'},
				{param:'mbis',path:['filters','minLevel','max'],type:'number'},
				{param:'von',path:['filters','level','min'],type:'number'},
				{param:'bis',path:['filters','level','max'],type:'number'});
		}
		codecFields.push({param:'sort',path:['sort'],
			decode:function (v) { return v==='stufe'?'itemLevel':v==='stufe-ab'?'itemLevelDesc':'name'; },
			encode:function (v) {
				if (v===(settings.defaultSort||'name')) { return null; }
				return v==='itemLevel'?'stufe':v==='itemLevelDesc'?'stufe-ab':'name';
			}});
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
		function readValue(dim,value) {
			if (data[dim+'Key'].includes(value)) { return value; }
			if (!['klasse','gattung'].includes(dim) && /^\d+$/.test(value) && data[dim+'Key'][Number(value)]!==undefined) { return key(dim,Number(value)); }
			return value;
		}
		config.urlCodec={decode:function (url) {
			var parsed=baseCodec.decode(url), branches=url.searchParams.getAll('k');
			if (!branches.length) { var p={};Object.keys(fields).forEach(function (d) { if(url.searchParams.has(d)){p[d]=readValue(d,url.searchParams.get(d));parsed.explicit=true;} });if(Object.keys(p).length){branches=[Object.keys(p).map(function(d){return d+':'+p[d];}).join('|')];} }
			parsed.state.filters.tree=branches.map(function (raw) { var p={};raw.split('|').forEach(function (part) { var i=part.indexOf(':'),d=part.slice(0,i);if(i>0 && Object.hasOwn(fields,d)){p[d]=readValue(d,part.slice(i+1));} });return p; });
			if(settings.area||url.searchParams.has('k')){parsed.explicit=true;}return parsed;
		},encode:function (state,url) {
			url=baseCodec.encode(state,url);url.searchParams.delete('k');Object.keys(fields).forEach(function(d){url.searchParams.delete(d);});
			if(state.filters.tree.length===1){Object.keys(state.filters.tree[0]).forEach(function(d){url.searchParams.set(d,state.filters.tree[0][d]);});}
			else{state.filters.tree.forEach(function(p){url.searchParams.append('k',Object.keys(p).sort().map(function(d){return d+':'+p[d];}).join('|'));});}return url;
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
		function compare(a,b,sort){
			if (sort==='itemLevel') {
				var la=a[7]||Infinity, lb=b[7]||Infinity;
				if (la!==lb) { return la-lb; }
				var ma=a[14]||Infinity, mb=b[14]||Infinity;
				if (ma!==mb) { return ma-mb; }
			} else if (sort==='itemLevelDesc') {
				var da=a[7]||0, db=b[7]||0;
				if (da!==db) { return db-da; }
				var dm=a[14]||0, dmb=b[14]||0;
				if (dm!==dmb) { return dmb-dm; }
			}
			return MQL_SORT.compare(a[1],b[1])||a[0].localeCompare(b[0]);
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
				var rowUI=window.MQL_TREFFERZEILE,EIGN=window.MQL_EIGNUNG;
				if(rowUI){rowUI.header(target,{progress:false,levelHeading:rowUI.words.itemLevel});}
				r.payload.forEach(function(row){
					if(rowUI){
						var parts=[label('kat',key('kat',row[3])),T('gs_qual_'+row[4])];
						['art','gattung','klasse','platz'].forEach(function(dim){if(row[fields[dim]]>=0){parts.push(label(dim,key(dim,row[fields[dim]])));}});
						if(row[14]>0&&row[14]!==row[7]){parts.push(extra[7]+' '+row[14]);}
						target.appendChild(rowUI.row(target,{
							image:row[2],icon:'gegenstand',name:row[1],
							href:'/'+lang+'/'+({de:'gegenstand',en:'item',fr:'objet'}[lang])+'/'+row[0]+'/',
							meta:parts.filter(Boolean).join(' · '),
							levelHeading:rowUI.words.itemLevel,
							values:row[7]>0?[{label:rowUI.words.itemLevel,value:row[7]}]:[],
							eignung:EIGN?eignungVon(row):null,
							progress:null
						}));
						return;
					}
					var li=document.createElement('li'),a=document.createElement('a');a.className='gs-zeile';
					a.href=(location.pathname.endsWith('.html')?'https://llb.sirhexalot.de':'')+'/'+lang+'/'+({de:'gegenstand',en:'item',fr:'objet'}[lang])+'/'+row[0]+'/';
					var icon=document.createElement('img');icon.className='symbol';icon.width=26;icon.height=26;icon.alt='';icon.loading='lazy';
					if(row[2]){icon.src='https://llb.sirhexalot.de/bild/items/'+row[2]+'.webp';}else{icon.style.visibility='hidden';}
					icon.addEventListener('error',function(){icon.style.visibility='hidden';});a.appendChild(icon);
					var name=document.createElement('span');name.className='gs-name q'+row[4];name.textContent=row[1];a.appendChild(name);
					var parts=[label('kat',key('kat',row[3])),T('gs_qual_'+row[4])];
					['art','gattung','klasse','platz'].forEach(function(dim){if(row[fields[dim]]>=0){parts.push(label(dim,key(dim,row[fields[dim]])));}});
					var meta=document.createElement('span');meta.className='gs-meta';
					if(row[7]>0){parts.push(extra[6]+' '+row[7]);}
					if(row[14]>0&&row[14]!==row[7]){parts.push(extra[7]+' '+row[14]);}
					meta.textContent=parts.join(' · ');a.appendChild(meta);
					li.appendChild(a);target.appendChild(li);
				});
				if(!r.total){var empty=document.createElement('li');empty.className='gs-leer';empty.textContent=settings.emptyLabel||T('gs_keine');target.appendChild(empty);}
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
