/* Shared server-list bootstrap. Existing GET forms remain the no-JS source. */
(function () {
	'use strict';
	var root=document.querySelector('.sets-browser[data-filter-schema="1"]');
	if(!root){return;}
	var A=window.MQL_FILTERADAPTER, core=window.MQL_FILTERZUSTAND;
	var lang=document.documentElement.lang || 'de', form=root.querySelector('.sets-form'), area=root.dataset.filterArea;
	var words={
		de:['Suchen','Filter','Schließen','Sortierung','Zurücksetzen','Weitere anzeigen','%s Sets','%s Treffer anzeigen','Lade …','Ergebnisse nicht aktualisiert.','Erneut versuchen','Als Seite öffnen','Ungültiger Stufenbereich','Von','Bis'],
		en:['Search','Filters','Close','Sort','Reset','Show more','%s sets','Show %s results','Loading …','Results not updated.','Try again','Open page','Invalid level range','From','To'],
		fr:['Chercher','Filtres','Fermer','Tri','Réinitialiser','Afficher davantage','%s ensembles','Afficher %s résultats','Chargement …','Résultats non actualisés.','Réessayer','Ouvrir la page','Plage de niveaux incorrecte','De','À']
	}[lang];
	var labels={};['search','filter','close','sort','reset','more','count','show','loading','error','retry','fallback','invalidRange','min','max'].forEach(function(k,i){labels[k]=words[i];});
	labels.count=root.dataset.filterCountLabel || labels.count;
	function groupsFrom(container){
		var groups=[], map=new Map();
		function option(input){var label=input.closest('label'),small=label.querySelector('small');return {value:input.value,label:label.querySelector('span').textContent,count:small?Number(small.textContent):undefined};}
		container.querySelectorAll('.sets-filters input[type=checkbox]').forEach(function(input){
			var id=input.name.replace(/\[\]$/,''),field=input.closest('fieldset'),legend=field&&field.querySelector('legend');
			if(!map.has(id)){var group={id:id,kind:input.name.endsWith('[]')?'multi':'boolean',label:legend?legend.textContent:option(input).label,options:[]};map.set(id,group);groups.push(group);}
			var group=map.get(id),o=option(input);if(!group.options.some(function(v){return v.value===o.value;})){group.options.push(o);}
		});
		var region=map.get('region'),land=map.get('area');
		if(region && land){
			land.nestedOnly=true;
			var placed=new Set();
			container.querySelectorAll('.giver-zweig').forEach(function(branch){
				var parent=region.options.find(function(o){return o.value===branch.dataset.region;});if(!parent){return;}
				parent.children=Array.from(branch.querySelectorAll('input[name="area[]"]')).map(function(input){placed.add(input.value);return Object.assign(option(input),{groupId:'area'});});
			});
			land.options.filter(function(o){return !placed.has(o.value);}).forEach(function(o){region.options.push(Object.assign({},o,{groupId:'area'}));});
		}
		var number=container.querySelector('.sets-filters input[type=number]');
		if(number){var title=number.closest('fieldset').querySelector('legend').textContent;groups.push({id:'level',kind:'range',label:title,max:999,rangeLabel:function(r){return title+' '+(r.min===null?'…':r.min)+'–'+(r.max===null?'…':r.max);}});}
		groups.forEach(function(g){
			if(g.kind==='boolean'){g.label=({de:'Auswahl',en:'Options',fr:'Options'})[lang];}
			if(g.id==='cluster'||g.id==='tier'){g.initialOpen=false;}
		});
		return groups;
	}
	var config={area:area,lang:lang,rootUrl:form.action,labels:labels,search:{submit:'enter'},groups:groupsFrom(root),pagination:{kind:'page',size:30},
		defaults:function(){var filters={};config.groups.forEach(function(g){filters[g.id]=g.kind==='range'?{min:null,max:null}:g.kind==='boolean'?false:[];});return {q:'',filters:filters,sort:'name',pagination:{kind:'page',page:1}};}};
	var sortLinks=Array.from(root.querySelectorAll('.sets-sort a'));
	if(sortLinks.length){config.sort={options:sortLinks.map(function(a){return {value:new URL(a.href).searchParams.get('sort')||'name',label:a.textContent};})};}
	var fields=[{param:'q',path:['q']},{param:'page',path:['pagination','page'],type:'number',omit:1}];
	config.groups.forEach(function(g){if(g.kind==='range'){
		var names=Array.from(form.querySelectorAll('input[type=number]')).map(function(n){return n.name;});
		fields.push({param:names[0],path:['filters','level','min'],type:'number'},{param:names[1],path:['filters','level','max'],type:'number'});
	}else{fields.push({param:g.id,path:['filters',g.id],type:g.kind==='boolean'?'boolean':'multi'});}});
	if(config.sort){fields.push({param:'sort',path:['sort'],omit:'name'});}
	config.urlCodec=A.codec(fields,config.defaults);
	function readModel(container,url){
		var fresh=groupsFrom(container),facets={};
		config.groups.forEach(function(g){if(g.options){facets[g.id]=g.options.map(function(o){return {value:o.value,count:0};});}});
		// Merge known choices to retain selected zero-count options between responses.
		fresh.forEach(function(group){
			var known=config.groups.find(function(g){return g.id===group.id;});
			if(known && group.options){
				group.options.forEach(function(o){var i=known.options.findIndex(function(k){return k.value===o.value&&k.groupId===o.groupId;});if(i<0){known.options.push(o);}else{known.options[i]=o;}});
				facets[group.id]=known.options.map(function(o){var found=group.options.find(function(f){return f.value===o.value;});return {value:o.value,count:found?found.count:0};});
			}
		});
		var state=core.decode(config,url).state;
		var next=container.querySelector('.sets-pagination a:last-child');
		var hasMore=next && Number(new URL(next.href,url).searchParams.get('page'))>state.pagination.page;
		container.querySelectorAll('.sets-pagination a').forEach(function(a){a.dataset.filterPage=new URL(a.getAttribute('href'),url).searchParams.get('page')||'1';});
		var count=container.querySelector('.sets-count');if(count){count.remove();}
		var oldSort=container.querySelector('.sets-sort');if(oldSort){oldSort.remove();}
		return {state:state,total:Number(container.dataset.filterTotal),facets:facets,pagination:{kind:'page',page:state.pagination.page,hasMore:!!hasMore},capabilities:{personal:{}}};
	}
	var adapter=A.server({area:area,url:form.action,codec:config.urlCodec,readModel:readModel});
	window.MQL_SERVER_FILTER=window.MQL_FILTER_UI.mount(root,{config:config,adapter:adapter});
})();
