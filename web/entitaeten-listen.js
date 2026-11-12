/* Compose existing type adapters with an immutable parent relation.
 *
 * A detail page supplies its related IDs; the listed type supplies the same
 * list, filters, search, sorting, result rendering and pagination as its public
 * catalogue. The relation itself is never a filter the user can clear. */
(function () {
	'use strict';
	var dataNode=document.getElementById('related-lists');if(!dataNode){return;}
	var lists=JSON.parse(dataNode.textContent),lang=document.documentElement.lang;
	var labels={de:{q:'Aufgaben',d:'Taten',i:'Gegenstände',recipe:'Rezepte'},en:{q:'Quests',d:'Deeds',i:'Items',recipe:'Recipes'},fr:{q:'Quêtes',d:'Prouesses',i:'Objets',recipe:'Recettes'}}[lang];
	// Owner first, then what it awards or consumes; never the JSON key order.
	var ORDER=['q','d','i','recipe'];
	var area=document.getElementById('gebiet-buehne');
	var source=document.querySelector('[data-quellen-liste]');
	var host=area||(source&&source.closest('section'))||document.querySelector('.giver-quests');
	if(!host){return;}
	var controller=null,active='',queue=Promise.resolve();
	var types=Object.keys(lists).filter(function(k){return ORDER.includes(k);})
		.sort(function(a,b){return ORDER.indexOf(a)-ORDER.indexOf(b);});if(!types.length){return;}

	// The server-rendered list stays the no-JS fallback. With tabs its headings
	// describe the replaced server list, so they move there too; a single list
	// keeps its section heading above the filter.
	var fallback=document.createElement('div');fallback.dataset.filterFallback='';
	Array.from(host.children).forEach(function(n){
		if(!area&&/^H[12]$/.test(n.tagName)){return;}
		fallback.appendChild(n);
	});host.appendChild(fallback);

	var tablist=document.createElement('div');tablist.className='gebiet-reiter';tablist.setAttribute('role','tablist');
	tablist.setAttribute('aria-label',host.querySelector('h2')?.textContent||document.querySelector('h1')?.textContent||'');
	var root=document.createElement('div');root.className='related-list';root.id='related-panel';root.setAttribute('role','tabpanel');
	types.forEach(function(type){
		var b=document.createElement('button');b.type='button';b.id='related-tab-'+type;b.className='gebiet-tab';
		b.setAttribute('role','tab');b.setAttribute('aria-controls',root.id);b.dataset.relatedType=type;
		b.textContent=labels[type]+' ('+lists[type].rows.length.toLocaleString(lang)+')';
		b.addEventListener('click',function(){var u=new URL(location.href);u.hash=type;history.pushState(null,'',u);refresh();});
		tablist.appendChild(b);
	});
	if(types.length>1){host.appendChild(tablist);}else{root.removeAttribute('role');root.removeAttribute('aria-labelledby');}
	host.appendChild(root);

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

	function refresh(){
		queue=queue.then(async function(){
			if(controller){await controller.destroy();controller=null;}
			active=typeFromUrl();root.replaceChildren();
			var target=document.createElement(active==='recipe'?'div':'ul');
			target.className='related-results';target.dataset.filterResults='';root.appendChild(target);
			var setup=active==='recipe'
				? window.MQL_RECIPE_FILTER.create({rows:lists.recipe.rows,area:'context',renderer:window.MQL_RECIPE_RESULTS})
				: active==='i' ? window.MQL_ITEM_FILTER_SETUP(lists.i.index,{area:'context'})
				: window.MQL_TASK_FILTER_SETUP(lists[active].rows,active);
			Array.from(tablist.children).forEach(function(b){
				var selected=b.dataset.relatedType===active;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;
			});
			if(types.length>1){root.setAttribute('aria-labelledby','related-tab-'+active);}
			controller=window.MQL_FILTER_UI.mount(root,contextual(setup,active));
			window.MQL_RELATED_FILTER=controller;
			await controller.ready;fallback.hidden=true;
			// A relation without any distinguishing filter shows the list alone
			// instead of an empty filter column and an empty mobile dialog.
			if(!root.querySelector('.filter-group')){
				root.querySelectorAll('.filter-open,.filter-home').forEach(function(n){n.hidden=true;});
			}
		}).catch(function(e){console.error(e);fallback.hidden=false;});
		return queue;
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
