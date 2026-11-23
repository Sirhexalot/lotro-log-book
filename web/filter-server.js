/* Shared server-list bootstrap. Existing GET forms remain the no-JS source.
 *
 * A migrated list writes its definition and the current response into
 * `<script type="application/json" data-filter-model>`; the filter is built
 * from that model. Lists without a model keep the older scan of the form and
 * of the fetched markup until they are migrated one by one.
 */
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

	/* The inline model of this response, or null on a non-migrated list. */
	function modelFrom(container){
		var script=container.querySelector('script[type="application/json"][data-filter-model]');
		if(!script){return null;}
		try{return JSON.parse(script.textContent);}catch(e){return null;}
	}

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
			if(g.id==='cluster'||g.id==='tier'){g.initialOpen=false;}
		});
		return groups;
	}

	function defaultFilters(groups){
		var filters={};
		groups.forEach(function(g){
			filters[g.id]=g.kind==='range'?{min:null,max:null}
				:g.kind==='boolean'?false
				:g.kind==='single'?(g.defaultValue||'alle'):[];
		});
		return filters;
	}

	/* Eine Stufe, die nicht aus diesem Filter stammt (etwa „Ware für meine
	   Stufe“ aus dem Spielstand), bleibt beim Filtern in der Adresse. Ohne sie
	   würde jede Änderung den Filter stillschweigend aufheben. */
	var stufeStart=Number(new URL(location.href).searchParams.get('stufe'))||null;

	var inline=modelFrom(root), config;
	if(inline && inline.definition){
		var definition=inline.definition;
		if(definition.countLabel){labels.count=definition.countLabel;}
		config={area:definition.area||area,lang:definition.lang||lang,rootUrl:form.action,labels:labels,
			search:{submit:'enter'},groups:definition.groups||[],
			sort:definition.sort||{standard:'name',keys:['name'],ersteRichtung:{name:'asc'},options:[]},
			pagination:definition.pagination||{kind:'page',size:30},
			defaults:function(){
				var filters=defaultFilters(config.groups);
				if(stufeStart){filters.stufe=stufeStart;}
				var first=config.sort.standard||'name';
				return {q:'',filters:filters,sort:first,
					sortDir:((config.sort.ersteRichtung||{})[first])||'asc',
					pagination:{kind:'page',page:1}};
			}};
	}else{
		var formGroups=groupsFrom(root);
		var numbers=Array.from(form.querySelectorAll('input[type=number]')).map(function(n){return n.name;});
		var levelGroup=formGroups.find(function(g){return g.id==='level';});
		if(levelGroup){levelGroup.paramMin=numbers[0];levelGroup.paramMax=numbers[1];}
		config={area:area,lang:lang,rootUrl:form.action,labels:labels,search:{submit:'enter'},groups:formGroups,
			pagination:{kind:'page',size:30},
			defaults:function(){
				var filters=defaultFilters(config.groups);
				if(stufeStart){filters.stufe=stufeStart;}
				return {q:'',filters:filters,sort:'name',
					sortDir:'asc',pagination:{kind:'page',page:1}};
			}};
		var sortLinks=Array.from(root.querySelectorAll('.sets-sort a'));
		if(sortLinks.length){config.sort={standard:'name',keys:sortLinks.map(function(a){return new URL(a.href).searchParams.get('sort')||'name';}),ersteRichtung:{},options:sortLinks.map(function(a){return {value:new URL(a.href).searchParams.get('sort')||'name',label:a.textContent};})};}
	}

	var fields=[{param:'q',path:['q']},{param:'page',path:['pagination','page'],type:'number',omit:1}];
	if(stufeStart){fields.push({param:'stufe',path:['filters','stufe'],type:'number'});}
	config.groups.forEach(function(g){
		if(g.kind==='range'){
			fields.push({param:g.paramMin,path:['filters',g.id,'min'],type:'number'},
				{param:g.paramMax,path:['filters',g.id,'max'],type:'number'});
		}else{
			fields.push({param:g.id,path:['filters',g.id],
				type:g.kind==='boolean'?'boolean':g.kind==='single'?'text':'multi',
				omit:g.kind==='single'?(g.defaultValue||'alle'):undefined});
		}
	});
	var baseCodec=A.codec(fields,config.defaults);
	config.urlCodec={
		decode:function(url){
			var parsed=baseCodec.decode(url);
			var raw=url.searchParams.get('sort');
			if(raw){
				var dir=raw.charAt(0)==='-'?'desc':'asc', key=dir==='desc'?raw.slice(1):raw;
				if(((config.sort&&config.sort.keys)||[]).indexOf(key)>=0){parsed.state.sort=key;parsed.state.sortDir=dir;}
				parsed.explicit=true;
			}
			return parsed;
		},
		encode:function(state,url){
			url=baseCodec.encode(state,url);
			url.searchParams.delete('sort');
			var first=(config.sort&&config.sort.standard)||'name';
			if(state.sort!==first||state.sortDir==='desc'){
				url.searchParams.set('sort',(state.sortDir==='desc'?'-':'')+state.sort);
			}
			return url;
		}
	};

	function readModel(container,url){
		var model=modelFrom(container);
		if(model){
			// The response may add an option that had no count before; keep the
			// panel in step with the definition the server just wrote.
			(model.definition&&model.definition.groups||[]).forEach(function(fresh){
				var known=config.groups.find(function(g){return g.id===fresh.id;});
				if(!known){config.groups.push(fresh);return;}
				known.label=fresh.label;known.kind=fresh.kind;known.options=fresh.options;
				if(fresh.nestedOnly){known.nestedOnly=true;}
			});
			var fragment=container.querySelector('[data-filter-results]');
			if(fragment){
				// The shared shell owns count, sort and pagination chrome.
				fragment.querySelectorAll('.sets-count,.sets-sort').forEach(function(n){n.remove();});
				fragment.querySelectorAll('.sets-pagination a').forEach(function(a){
					a.dataset.filterPage=new URL(a.getAttribute('href'),url).searchParams.get('page')||'1';
				});
			}
			return model;
		}
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
