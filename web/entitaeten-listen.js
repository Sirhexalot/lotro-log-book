/* Compose existing type adapters with an immutable parent relation.
 *
 * A detail page supplies its related IDs; the listed type supplies the same
 * list, filters, search, sorting, result rendering and pagination as its public
 * catalogue. The relation itself is never a filter the user can clear. */
(function () {
	'use strict';
	var dataNode=document.getElementById('related-lists');if(!dataNode){return;}
	var lists=JSON.parse(dataNode.textContent),lang=document.documentElement.lang;
	var labels={de:{q:'Aufgaben',d:'Taten',i:'Gegenstände',recipe:'Rezepte',recipe_made:'Herstellung',vendor:'Händler'},en:{q:'Quests',d:'Deeds',i:'Items',recipe:'Recipes',recipe_made:'Crafting',vendor:'Vendors'},fr:{q:'Quêtes',d:'Prouesses',i:'Objets',recipe:'Recettes',recipe_made:'Fabrication',vendor:'Marchands'}}[lang];
	// Owner first, then what it awards or consumes; never the JSON key order.
	var ORDER=['q','d','i','recipe','recipe_made','vendor'];
	var area=document.getElementById('gebiet-buehne');
	var source=document.querySelector('[data-quellen-liste]');
	var host=area||(source&&source.closest('section'))||document.querySelector('.giver-quests');
	// A page may carry only group-level relations (e.g. an item's crafting
	// list). Then there is no tab panel, but the group mounts still run.
	var hasPanel=!!host;
	var filterLimit=Number((document.querySelector('.katalog-inhalt')||document.body).getAttribute('data-related-filter-limit'))||5;
	var needsFilter=function(count){return count>filterLimit;};
	window.MQL_RELATED_FILTER_LIMIT=filterLimit;
	window.MQL_RELATED_NEEDS_FILTER=needsFilter;
	var controller=null,active='',queue=Promise.resolve();
	var types=Object.keys(lists).filter(function(k){return ORDER.includes(k)&&k!=='vendor'&&k!=='recipe_made';})
		.sort(function(a,b){return ORDER.indexOf(a)-ORDER.indexOf(b);});
	// The tab panel exists only where a relation list has a host section.
	// Pages with just group-level relations (an item's crafting list) keep
	// their article untouched and mount those groups separately below.
	var hasTabs=hasPanel&&types.length>0;

	// The server-rendered list stays the no-JS fallback. With tabs its headings
	// describe the replaced server list, so they move there too; a single list
	// keeps its section heading above the filter.
	var fallback=document.createElement('div');fallback.dataset.filterFallback='';
	var tablist=document.createElement('div');tablist.className='gebiet-reiter';tablist.setAttribute('role','tablist');
	var root=document.createElement('div');root.className='related-list';root.id='related-panel';root.setAttribute('role','tabpanel');
	if(hasTabs){
		Array.from(host.children).forEach(function(n){
			if(!area&&/^H[12]$/.test(n.tagName)){return;}
			fallback.appendChild(n);
		});host.appendChild(fallback);
		tablist.setAttribute('aria-label',host.querySelector('h2')?.textContent||document.querySelector('h1')?.textContent||'');
		types.forEach(function(type){
			var b=document.createElement('button');b.type='button';b.id='related-tab-'+type;b.className='gebiet-tab';
			b.setAttribute('role','tab');b.setAttribute('aria-controls',root.id);b.dataset.relatedType=type;
			b.textContent=labels[type]+' ('+lists[type].rows.length.toLocaleString(lang)+')';
			b.addEventListener('click',function(){var u=new URL(location.href);u.hash=type;history.pushState(null,'',u);refresh();});
			tablist.appendChild(b);
		});
		if(types.length>1){host.appendChild(tablist);}else{root.removeAttribute('role');root.removeAttribute('aria-labelledby');}
		host.appendChild(root);
	}else{
		root.removeAttribute('role');
	}

	function typeFromUrl(){return types.includes(location.hash.slice(1))?location.hash.slice(1):types[0];}

	/* Every tab writes prefixed parameters only. The parent path and the other
	   tabs' state therefore survive reset, reload and back/forward unchanged. */
	function contextual(setup,type){
		var codec=setup.config.urlCodec;
		setup.config.area='related-'+type+'-'+location.pathname.split('/').filter(Boolean).join('-');
		setup.config.urlCodec={
			decode:function(url){
				var inner=new URL(url);inner.search='';inner.hash='';
				url.searchParams.forEach(function(v,k){if(k.startsWith(type+'.')){inner.searchParams.append(k.slice(type.length+1),v);}});
				var parsed=codec.decode(inner);parsed.explicit=true;return parsed;
			},
			encode:function(state,url){
				var inner=new URL(url);inner.search='';inner.hash='';inner=codec.encode(state,inner);
				Array.from(url.searchParams.keys()).forEach(function(k){if(k.startsWith(type+'.')){url.searchParams.delete(k);}});
				inner.searchParams.forEach(function(v,k){url.searchParams.append(type+'.'+k,v);});
				return url;
			}
		};
		return setup;
	}
	function vendorSetup(data,barterOnly){
		var A=window.MQL_FILTERADAPTER;
		var rows=data.rows, labels=data.labels||{}, regionLabels=labels.region||{}, areaLabels=labels.area||{}, areaRegion=labels.area_region||{};
		var entityWord=barterOnly
			? {de:'Tauschhändler',fr:'Marchands troqueurs',en:'Barterers'}[lang]
			: {de:'Händler',fr:'Marchands',en:'Vendors'}[lang];
		var typeLabels=barterOnly
			? {barter:lang==='de'?'Tauschhändler':lang==='fr'?'Marchand troqueur':'Barterer'}
			: {vendor:'Normaler Händler',both:'Tauschhändler'}[lang==='de'?'de':lang==='fr'?'fr':'en'];
		var regionOptions=Object.keys(regionLabels).map(function(id){return {path:{region:String(id)},label:regionLabels[id],children:[]};});
		var byRegion={};regionOptions.forEach(function(o){byRegion[o.path.region]=o;});
		Object.keys(areaLabels).forEach(function(id){
			var region=areaRegion[id], parent=byRegion[String(region)];
			if(parent){parent.children.push({path:{region:String(region),area:String(id)},label:areaLabels[id],groupId:'location'});}
		});
		var config={area:'vendors',lang:lang,rootUrl:location.origin+location.pathname,
			labels:{search:(lang==='de'?entityWord+' suchen':lang==='fr'?'Chercher '+entityWord.toLowerCase():'Search for '+entityWord.toLowerCase()),
				placeholder:(lang==='de'?entityWord+' suchen':lang==='fr'?'Chercher '+entityWord.toLowerCase():'Search for '+entityWord.toLowerCase()),
				filter:lang==='de'?'Filter':lang==='fr'?'Filtres':'Filters',close:lang==='de'?'Schließen':lang==='fr'?'Fermer':'Close',
				sort:lang==='fr'?'Tri':'Sortierung',reset:lang==='de'?'Zurücksetzen':lang==='fr'?'Réinitialiser':'Reset',
				more:lang==='de'?'Weitere anzeigen':lang==='fr'?'Afficher davantage':'Show more',
				count:lang==='de'?'%s '+entityWord:lang==='fr'?'%s '+entityWord.toLowerCase():'%s '+entityWord,
				show:lang==='de'?'%s Treffer anzeigen':lang==='fr'?'Afficher %s résultats':'Show %s results',
				loading:lang==='de'?'Lade …':lang==='fr'?'Chargement …':'Loading …',
				error:lang==='de'?'Ergebnisse nicht aktualisiert.':lang==='fr'?'Résultats non actualisés.':'Results not updated.',
				retry:lang==='de'?'Erneut versuchen':lang==='fr'?'Réessayer':'Try again',
				fallback:lang==='de'?'Als Seite öffnen':lang==='fr'?'Ouvrir la page':'Open page'},
			search:{submit:'enter'},
			groups:barterOnly ? [] : [
				{id:'location',kind:'tree',label:lang==='de'?'Region und Landschaft':lang==='fr'?'Région et pays':'Region and landscape',
					options:regionOptions,exclusivePaths:true,
					validatePath:function(path){return !!path.region&&(!path.area||String(areaRegion[path.area])===String(path.region));},
					pathLabel:function(path){return path.area?(regionLabels[path.region]+' · '+areaLabels[path.area]):regionLabels[path.region];}},
				{id:'type',kind:'multi',label:lang==='de'?'Art':lang==='fr'?'Type':'Type',
					options:Object.keys(typeLabels).map(function(v){return {value:v,label:typeLabels[v]};})}
			],
			sort:{options:[{value:'name',label:'Name'}]},
			pagination:{kind:'page',size:30},
			defaults:function(){return {q:'',filters:{location:[],type:[]},sort:'name',pagination:{kind:'page',page:1}};}};
		config.urlCodec={
			decode:function(u){
				var regions=[],areas=[],q=u.searchParams.get('q')||'',types=[];
				u.searchParams.forEach(function(v,k){if(k==='vendor.type[]'||k==='type[]'){types.push(v);}
					if(k==='vendor.region[]'||k==='region[]'){regions.push(String(v));}
					if(k==='vendor.area[]'||k==='area[]'){areas.push(String(v));}});
				var paths=regions.map(function(v){return {region:v};});
				areas.forEach(function(v){var r=String(areaRegion[v]||'');if(r){paths.push({region:r,area:v});}});
				var page=Number(u.searchParams.get('vendor.page')||u.searchParams.get('page')||1);
				return {state:{q:q,filters:{location:paths,type:types},sort:'name',pagination:{kind:'page',page:page>0?page:1}},explicit:Boolean(q||paths.length||types.length||page>1)};
			},
			encode:function(s,u){
				['q','region[]','area[]','type[]','page'].forEach(function(k){u.searchParams.delete(k);});
				if(s.q)u.searchParams.set('q',s.q);
				(s.filters.location||[]).forEach(function(path){if(path.area)u.searchParams.append('area[]',path.area);else u.searchParams.append('region[]',path.region);});
				(s.filters.type||[]).forEach(function(v){u.searchParams.append('type[]',v);});
				if(s.pagination.page>1)u.searchParams.set('page',String(s.pagination.page));
				return u;
			}};
		var adapter=A.client({rows:rows,size:30,id:function(r){return r.id;},
			matches:function(r,s,skip){
				var name=r.name.toLocaleLowerCase(lang), location=s.filters.location||[];
				var locationMatch=!location.length||location.some(function(path){
					return (r.regions||[]).map(String).includes(String(path.region)) &&
						(!path.area||(r.areas||[]).map(String).includes(String(path.area)));});
				return (!s.q||name.includes(s.q.toLocaleLowerCase(lang))) &&
					(skip==='location'||locationMatch) &&
					(skip==='type'||!s.filters.type.length||s.filters.type.includes(r.type));
			},
			compare:function(a,b){return a.name.localeCompare(b.name,lang)||a.id.localeCompare(b.id);},
			facets:function(all,s){
				var locationRows=all.filter(function(r){return (!s.q||r.name.toLocaleLowerCase(lang).includes(s.q.toLocaleLowerCase(lang))) &&
					(!s.filters.type.length||s.filters.type.includes(r.type));});
				var typeRows=all.filter(function(r){return (!s.q||r.name.toLocaleLowerCase(lang).includes(s.q.toLocaleLowerCase(lang))) &&
					(!s.filters.location.length||s.filters.location.some(function(p){return (r.regions||[]).map(String).includes(String(p.region))&&(!p.area||(r.areas||[]).map(String).includes(String(p.area)));}));});
				var paths=[];
				Object.keys(regionLabels).forEach(function(id){paths.push({value:{region:String(id)},count:locationRows.filter(function(r){return (r.regions||[]).map(String).includes(String(id));}).length});});
				Object.keys(areaLabels).forEach(function(id){var region=String(areaRegion[id]||'');if(region){paths.push({value:{region:region,area:String(id)},count:locationRows.filter(function(r){return (r.areas||[]).map(String).includes(String(id));}).length});}});
				return {location:paths,type:Object.keys(typeLabels).map(function(v){return {value:v,count:typeRows.filter(function(r){return r.type===v;}).length};})};
			},
			renderResults:function(result,target){
				target.replaceChildren();
				result.payload.forEach(function(r){var li=document.createElement('li'),a=document.createElement(r.url?'a':'span');if(r.url){a.href=r.url;}a.className='sets-zeile';
					var preview=document.createElement('span');preview.className='sets-preview';var strong=document.createElement('strong');strong.textContent=r.name;preview.appendChild(strong);
					var names=[];(r.areas||[]).slice(0,3).forEach(function(id){var n=areaLabels[String(id)]||regionLabels[String(id)];if(n&&names.indexOf(n)<0)names.push(n);});
					var metaText=names.join(' · ')||r.extra||'';if(r.count>0)metaText+=(metaText?' · ':'')+r.count;
					var meta=document.createElement('span');meta.className='sets-meta';meta.textContent=metaText;a.append(preview,meta);li.appendChild(a);target.appendChild(li);});
				var nav=document.createElement('nav');nav.className='sets-pagination';nav.setAttribute('aria-label',entityWord);
				if(result.pagination.page>1){var prev=document.createElement('a');prev.href='#';prev.dataset.filterPage=String(result.pagination.page-1);prev.textContent='‹ '+(lang==='de'?'Zurück':lang==='fr'?'Précédent':'Previous');nav.appendChild(prev);}
				var label=document.createElement('span');label.textContent=(lang==='de'?'Seite ':lang==='fr'?'Page ':'Page ')+result.pagination.page+' '+(lang==='de'?'von':lang==='fr'?'sur':'of')+' '+result.pagination.pages;nav.appendChild(label);
				if(result.pagination.page<result.pagination.pages){var next=document.createElement('a');next.href='#';next.dataset.filterPage=String(result.pagination.page+1);next.textContent=(lang==='de'?'Weiter':lang==='fr'?'Suivant':'Next')+' ›';nav.appendChild(next);}
				target.appendChild(nav);
			}});
		return {config:config,adapter:adapter};
	}

	function refresh(){
		if(!hasTabs){return queue;}
		queue=queue.then(async function(){
			if(controller){await controller.destroy();controller=null;}
			active=typeFromUrl();root.replaceChildren();
			var target=document.createElement(active==='recipe'?'div':'ul');
			target.className='related-results';target.dataset.filterResults='';root.appendChild(target);
			var setup=active==='recipe'
				? window.MQL_RECIPE_FILTER.create({rows:lists.recipe.rows,area:'context',renderer:window.MQL_RECIPE_CONTEXT_RESULTS})
				: active==='i' ? window.MQL_ITEM_FILTER_SETUP(lists.i.index,{area:'context'})
				: active==='vendor' ? vendorSetup(lists.vendor.rows)
				: window.MQL_TASK_FILTER_SETUP(lists[active].rows,active);
			Array.from(tablist.children).forEach(function(b){
				var selected=b.dataset.relatedType===active;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;
			});
			if(types.length>1){root.setAttribute('aria-labelledby','related-tab-'+active);}
			setup=contextual(setup,active);
			if(!needsFilter(lists[active].rows.length)){
				var result=await setup.adapter.load(setup.config.defaults(),{signal:new AbortController().signal});
				setup.adapter.renderResults(result,target);
				window.MQL_RELATED_FILTER=null;
				fallback.hidden=true;
				return;
			}
			controller=window.MQL_FILTER_UI.mount(root,setup);
			window.MQL_RELATED_FILTER=controller;
			if (window.addEventListener) {
				window.addEventListener('mql-status', function () {
					if (controller && controller.reload) { controller.reload(); }
				});
			}
			await controller.ready;fallback.hidden=true;
			// A relation without any distinguishing filter shows the list alone
			// instead of an empty filter column and an empty mobile dialog.
			if(!root.querySelector('.filter-group')){
				root.querySelectorAll('.filter-open,.filter-home').forEach(function(n){n.hidden=true;});
			}
		}).catch(function(e){console.error(e);fallback.hidden=false;});
		return queue;
	}
	if(lists.vendor){
		var vendorGroup=document.querySelector('[data-vendor-filter-group]');
		if(vendorGroup&&needsFilter(lists.vendor.rows.length)){
			var vendorFallback=document.createElement('div');vendorFallback.dataset.filterFallback='';
			Array.from(vendorGroup.children).forEach(function(n){if(n.tagName!=='H3'){vendorFallback.appendChild(n);}});
			vendorGroup.appendChild(vendorFallback);
			var vendorRoot=document.createElement('div');vendorRoot.className='related-list';vendorRoot.id='vendor-related-panel';
			var vendorTarget=document.createElement('ul');vendorTarget.className='related-results';vendorTarget.dataset.filterResults='';vendorRoot.appendChild(vendorTarget);vendorGroup.appendChild(vendorRoot);
			var vendorFilterSetup=contextual(vendorSetup(lists.vendor),'vendor');
			window.MQL_FILTER_UI.mount(vendorRoot,vendorFilterSetup).ready.then(function(){vendorFallback.hidden=true;});
		}
	}
	if(lists.barter){
		var barterGroup=document.querySelector('[data-barter-filter-group]');
		if(barterGroup&&needsFilter(lists.barter.rows.length)){
			var barterFallback=document.createElement('div');barterFallback.dataset.filterFallback='';
			Array.from(barterGroup.children).forEach(function(n){if(n.tagName!=='H3'){barterFallback.appendChild(n);}});
			barterGroup.appendChild(barterFallback);
			var barterRoot=document.createElement('div');barterRoot.className='related-list';barterRoot.id='barter-related-panel';
			var barterTarget=document.createElement('ul');barterTarget.className='related-results';barterTarget.dataset.filterResults='';barterRoot.appendChild(barterTarget);barterGroup.appendChild(barterRoot);
			var barterFilterSetup=contextual(vendorSetup(lists.barter,true),'barter');
			window.MQL_FILTER_UI.mount(barterRoot,barterFilterSetup).ready.then(function(){barterFallback.hidden=true;});
		}
	}
	// "Herstellung": recipes that produce this item. Same recipe row as the
	// catalogue, mounted in its own group so it never mixes with "Wofür".
	if(lists.recipe_made&&window.MQL_RECIPE_FILTER){
		var madeGroup=document.querySelector('[data-recipe-filter-group]');
		if(madeGroup&&needsFilter(lists.recipe_made.rows.length)){
			var madeFallback=document.createElement('div');madeFallback.dataset.filterFallback='';
			Array.from(madeGroup.children).forEach(function(n){if(n.tagName!=='H3'){madeFallback.appendChild(n);}});
			madeGroup.appendChild(madeFallback);
			var madeRoot=document.createElement('div');madeRoot.className='related-list';madeRoot.id='recipe-made-panel';
			var madeTarget=document.createElement('div');madeTarget.className='related-results';madeTarget.dataset.filterResults='';madeRoot.appendChild(madeTarget);madeGroup.appendChild(madeRoot);
			var madeSetup=contextual(window.MQL_RECIPE_FILTER.create({rows:lists.recipe_made.rows,area:'context',renderer:window.MQL_RECIPE_CONTEXT_RESULTS}),'recipe_made');
			window.MQL_FILTER_UI.mount(madeRoot,madeSetup).ready.then(function(){madeFallback.hidden=true;});
		}
	}

	tablist.addEventListener('keydown',function(e){
		if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){return;}
		e.preventDefault();
		var at=types.indexOf(active);
		var next=e.key==='Home'?0:e.key==='End'?types.length-1:(at+(e.key==='ArrowRight'?1:-1)+types.length)%types.length;
		tablist.children[next].click();tablist.children[next].focus();
	});
	window.addEventListener('hashchange',refresh);
	window.addEventListener('popstate',function(){if(typeFromUrl()!==active){refresh();}});
	window.addEventListener('storage',function(e){if(e.key==='mql.charaktere'){refresh();}});
	document.addEventListener('mql:characterchange',refresh);
	document.addEventListener('change',function(e){if(e.target.id==='katalog-charakter'){refresh();}});
	refresh();
})();
