/* Item client adapter, shared by the application and the isolated preview. */
(function () {
	'use strict';
	var controller;
	window.MQL_ITEM_FILTER_SETUP = function (data, settings) {
		settings=settings||{};
		var lang = window.MQL_SPRACHE || document.documentElement.lang || 'de', T = window.MQL_T;
		if (!data || !data.e) { return; }
		if (settings.ids && settings.ids.length) {
			var erlaubt = new Set(settings.ids);
			data = Object.assign({}, data, {e: data.e.filter(function (row) { return erlaubt.has(row[0]); })});
		}
		var A = window.MQL_FILTERADAPTER, fields = {kat:3,art:6,platz:5,klasse:8,gattung:9};
		var chestIds=new Set(data.instanceChest||[]), sourceLabels={
			de:['Quelle','Instanztruhe'],en:['Source','Instance chest'],fr:['Source','Coffre d’instance']
		}[lang];
		var showSource=chestIds.size>0&&(!settings.area||settings.area==='gegenstaende');
		function key(dim,index) { return String(data[dim+'Key'][index]); }
		function label(dim,value) { var i=data[dim+'Key'].indexOf(value); return data[dim][i] || T('gs_kat_ohne'); }
		function levels(cat) {
			return cat==='ARMOUR'?['art','platz']:['WEAPON','LEGENDARY_WEAPON'].includes(cat)?['platz','art']:cat==='JEWELLERY'?['gattung']:cat==='ITEM'?['klasse']:cat==='LEGENDARY_ITEM'?['platz']:[];
		}
		function matchesPath(row,path) { return Object.keys(path).every(function (dim) { return key(dim,row[fields[dim]])===path[dim]; }); }
		var paths = new Set();
		function tree(rows,dims,path) {
			if (!dims.length) { return []; }
			var dim=dims[0], values=Array.from(new Set(rows.map(function (r) { return r[fields[dim]]; }).filter(function (v) { return v>=0; })));
			return values.sort(function (a,b) { return label(dim,key(dim,a)).localeCompare(label(dim,key(dim,b)),lang); }).map(function (v) {
				var p=Object.assign({},path);p[dim]=key(dim,v);
				var sorted={};Object.keys(p).sort().forEach(function (k) { sorted[k]=p[k]; });paths.add(JSON.stringify(sorted));
				var children=tree(rows.filter(function (r) { return r[fields[dim]]===v; }),dims.slice(1),sorted);
				return {value:JSON.stringify(sorted),path:sorted,label:label(dim,p[dim]),children:children.length?children:undefined};
			});
		}
		var nodes=tree(data.e,['kat'],{});
		nodes.forEach(function (n) { n.children=tree(data.e.filter(function (r) { return matchesPath(r,n.path); }),levels(n.path.kat),n.path); });
		var extra={
			de:['Schließen','%s Treffer anzeigen','Ergebnisse nicht aktualisiert.','Erneut versuchen','Als Seite öffnen','Ungültiger Stufenbereich','Gegenstandsstufe'],
			en:['Close','Show %s results','Results not updated.','Try again','Open page','Invalid level range','Item level'],
			fr:['Fermer','Afficher %s résultats','Résultats non actualisés.','Réessayer','Ouvrir la page','Plage de niveaux incorrecte','Niveau d’objet']
		}[lang];
		var labels={search:T('gs_suchen'),filter:T('gs_filter'),close:extra[0],sort:T('gs_sort'),reset:T('gs_reset'),more:T('gs_mehr'),count:T('gs_viele'),show:extra[1],loading:T('gs_lade'),error:extra[2],retry:extra[3],fallback:extra[4],invalidRange:extra[5],min:T('gs_von'),max:T('gs_bis'),placeholder:T('gs_platzhalter')};
		var config={area:settings.area||'gegenstaende',lang:lang,rootUrl:location.origin+location.pathname,labels:labels,search:{submit:'debounce',debounceMs:200},
			groups:[{id:'tree',kind:'tree',label:T('gs_kategorie'),options:nodes,validatePath:function (p) { return paths.has(JSON.stringify(p,Object.keys(p).sort())); },pathLabel:function (p) { return ['kat','art','platz','klasse','gattung'].filter(function (k) { return p[k]!==undefined; }).map(function (k) { return label(k,p[k]); }).join(' › '); }},
				{id:'quality',kind:'multi',label:T('gs_qualitaet'),options:[0,1,2,3,4,5].map(function (v) { return {value:v,label:T('gs_qual_'+v)}; })},
				{id:'level',kind:'range',label:extra[6],rangeLabel:function (r) { return extra[6]+' '+(r.min===null?'…':r.min)+'–'+(r.max===null?'…':r.max); }}],
			sort:{options:[{value:'name',label:T('gs_sort_name')},{value:'itemLevel',label:extra[6]}]},pagination:{kind:'limit',size:50},
			defaults:function () { return {q:'',filters:{tree:[],quality:[],level:{min:null,max:null},source:[]},sort:'name',pagination:{kind:'limit',limit:50}}; }};
		if(showSource){config.groups.push({id:'source',kind:'multi',label:sourceLabels[0],
			options:[{value:'instanztruhe',label:sourceLabels[1]}]});}
		var codecFields=[{param:'q',path:['q']},{param:'qual',path:['filters','quality'],type:'csv'},
			{param:'von',path:['filters','level','min'],type:'number'},{param:'bis',path:['filters','level','max'],type:'number'},
			{param:'sort',path:['sort'],omit:'name',decode:function (v) { return v==='stufe'?'itemLevel':'name'; },encode:function (v) { return v==='itemLevel'?'stufe':null; }}];
		if(showSource){codecFields.push({param:'quelle',path:['filters','source'],
			decode:function (v) { return [v]; },encode:function (v) { return v[0]||null; }});}
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
		function matches(row,s,skip){return (skip==='tree'||!s.filters.tree.length||s.filters.tree.some(function(p){return matchesPath(row,p);})) &&
			(skip==='source'||!(s.filters.source||[]).length||chestIds.has(row[0])) &&
			(skip==='quality'||!s.filters.quality.length||s.filters.quality.includes(row[4])) &&
			(skip==='level'||(s.filters.level.min===null&&s.filters.level.max===null)||(row[7]>0&&(s.filters.level.min===null||row[7]>=s.filters.level.min)&&(s.filters.level.max===null||row[7]<=s.filters.level.max))) &&
			searchMatches(row,s.q);}
		var adapter=A.client({rows:data.e,id:function(r){return r[0];},matches:matches,
			compare:function(a,b,sort){return (sort==='itemLevel'?(a[7]||Infinity)-(b[7]||Infinity):0)||a[1].localeCompare(b[1],lang)||a[0].localeCompare(b[0]);},
			facets:function(rows,s){
				var counts=new Map(),qualityCounts=[0,0,0,0,0,0],chestCount=0;
				rows.forEach(function(row){
					if(matches(row,s,'tree')){rowBranches.get(row[0]).forEach(function(id){counts.set(id,(counts.get(id)||0)+1);});}
					if(matches(row,s,'quality')){qualityCounts[row[4]]++;}
					if(showSource&&chestIds.has(row[0])&&matches(row,s,'source')){chestCount++;}
				});
				return {tree:Array.from(branchIndex,function(pair){return {value:pair[1],count:counts.get(pair[0])||0};}),quality:qualityCounts.map(function(count,value){return {value:value,count:count};}),
					source:showSource?[{value:'instanztruhe',count:chestCount}]:[]};
			},renderResults:function(r,target){
				target.replaceChildren();
				var rowUI=window.MQL_TREFFERZEILE;
				if(rowUI){rowUI.header(target,{progress:false,levelHeading:rowUI.words.itemLevel});}
				r.payload.forEach(function(row){
					if(rowUI){
						var parts=[label('kat',key('kat',row[3])),T('gs_qual_'+row[4])];
						['art','gattung','klasse','platz'].forEach(function(dim){if(row[fields[dim]]>=0){parts.push(label(dim,key(dim,row[fields[dim]])));}});
						target.appendChild(rowUI.row(target,{
							image:row[2],icon:'gegenstand',name:row[1],
							href:'/'+lang+'/'+({de:'gegenstand',en:'item',fr:'objet'}[lang])+'/'+row[0]+'/',
							meta:parts.filter(Boolean).join(' · '),
							levelHeading:rowUI.words.itemLevel,
							values:row[7]>0?[{label:rowUI.words.itemLevel,value:row[7]}]:[],
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
					if(row[7]>0){parts.push(extra[6]+' '+row[7]);}
					var meta=document.createElement('span');meta.className='gs-meta';meta.textContent=parts.join(' · ');a.appendChild(meta);
					li.appendChild(a);target.appendChild(li);
				});
				if(!r.total){var empty=document.createElement('li');empty.className='gs-leer';empty.textContent=T('gs_keine');target.appendChild(empty);}
			}
		});
		return {config:config,adapter:adapter};
	};
	window.MQL_GEGENSTAENDE_ZEICHNEN = function () {
		var main=document.querySelector('main.gs,[data-item-filter-root]');
		if(controller||!main||!window.MQL_GEGENSTAENDE){return;}
		var ids=(main.dataset.itemIds||'').split(',').filter(Boolean);
		var setup=window.MQL_ITEM_FILTER_SETUP(window.MQL_GEGENSTAENDE,{area:ids.length?'haendler':'gegenstaende',ids:ids});
		var list=main.querySelector('#gs-ergebnis');list.dataset.filterResults='';
		main.appendChild(list);main.querySelector('.gs-raster').remove();main.querySelector('#gs-suche').remove();
		controller=window.MQL_FILTER_UI.mount(main,setup);window.MQL_ITEM_FILTER=controller;
	};
	// The dynamically loaded index may finish before this local controller script.
	if (window.MQL_GEGENSTAENDE) { window.MQL_GEGENSTAENDE_ZEICHNEN(); }
})();
