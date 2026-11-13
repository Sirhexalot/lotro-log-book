/* One active shared filter controller for crafting tabs. Character data stays local. */
(function () {
	'use strict';
	var A=window.MQL_FILTERADAPTER, recipeRows=[], recipeRenderer, resources=null, controller=null;
	var lang=window.MQL_SPRACHE || 'de', T=window.MQL_T || function(k){return k;};
	var refs=(window.MQL_REFERENZ || {}).berufe || {}, activeTab='', queue=Promise.resolve(), tabStates={};
	var geographyNode=document.getElementById('craft-geography');
	var geography=geographyNode?JSON.parse(geographyNode.textContent):{};
	var params=['q','beruf','stufe','kategorie','sort','eigene','lernstand','fehlend','quelle','optional','gebiet','region','landschaft','rohstoff'];
	function parents(mapId){
		var id=String(mapId),seen=new Set(),region=null,landscape=null;
		while(geography[id]&&!seen.has(id)){
			seen.add(id);var map=geography[id];
			if(map.tier===2&&!landscape){landscape={id:id,name:map.name};}
			if(map.tier===1){region={id:id,name:map.name};break;}
			id=String(map.parent);
		}
		var unknown=({de:'Ohne Zuordnung',en:'Unassigned',fr:'Sans attribution'})[lang];
		return {region:region||{id:'unknown',name:unknown},landscape:landscape||{id:String(mapId),name:geography[String(mapId)]&&geography[String(mapId)].name||unknown}};
	}
	var words={
		de:['Suchen','Filter','Schließen','Sortierung','Zurücksetzen','Weitere anzeigen','%s Einträge','%s Treffer anzeigen','Lade …','Ergebnisse nicht aktualisiert.','Erneut versuchen','Als Seite öffnen','Ungültiger Bereich','Von','Bis','Beruf','Handwerksstufe','Kategorie','Nur eigene Berufe','Lernstand','Alle','Gelernt','Nicht gelernt','Quelle','Sammelvorkommen','Herstellbar','Unbekannt','Optionale Zutaten einschließen','Fundgebiet','Name','Materialien und Zutaten','Herkunft unbekannt – kein Fundort aus Namensähnlichkeit abgeleitet.','Persönlicher Lernstand: Ohne vollständigen Rezeptnachweis sind nur gelernte Rezepte sicher erkennbar.'],
		en:['Search','Filters','Close','Sort','Reset','Show more','%s entries','Show %s results','Loading …','Results not updated.','Try again','Open page','Invalid range','From','To','Profession','Crafting tier','Category','Only my professions','Learning status','All','Learned','Not learned','Source','Gathering nodes','Craftable','Unknown','Include optional ingredients','Gathering area','Name','Materials and ingredients','Source unknown – no location inferred from similar names.','Personal learning status: Without complete recipe evidence, only learned recipes are certain.'],
		fr:['Chercher','Filtres','Fermer','Tri','Réinitialiser','Afficher davantage','%s entrées','Afficher %s résultats','Chargement …','Résultats non actualisés.','Réessayer','Ouvrir la page','Plage incorrecte','De','À','Métier','Niveau d’artisanat','Catégorie','Mes métiers uniquement','Apprentissage','Tous','Appris','Non appris','Source','Gisements','Fabrication','Inconnue','Inclure les ingrédients facultatifs','Zone de récolte','Nom','Matériaux et ingrédients','Source inconnue – aucun emplacement déduit de noms similaires.','Apprentissage : sans preuve complète des recettes, seules les recettes apprises sont certaines.']
	}[lang];
	function name(o){return o && (o[lang]||o.en)||'';}
	function profession(key){return name((refs[key]||{}).n)||key;}
	function character(){return window.MQL_SPEICHER&&window.MQL_SPEICHER.aktiv?window.MQL_SPEICHER.aktiv():null;}
	function own(c){return Object.keys(c&&c.handwerk||{}).filter(function(k){return c.handwerk[k]&&c.handwerk[k].length;});}
	function complete(c){return !!(c&&c.importMeta&&c.importMeta.datasets&&c.importMeta.datasets.recipes&&c.importMeta.datasets.recipes.status==='complete');}
	function text(tag,s){var n=document.createElement(tag);n.textContent=s;return n;}
	function url(kind,id){return '/'+lang+'/'+({item:{de:'gegenstand',en:'item',fr:'objet'},recipe:{de:'rezept',en:'recipe',fr:'recette'}}[kind][lang])+'/'+id+'/';}
	function multi(id,label,values){return {id:id,kind:'multi',label:label,options:Array.from(new Set(values.filter(function(v){return v!=='';}))).sort(function(a,b){return String(a).localeCompare(String(b),lang,{numeric:true});}).map(function(v){return {value:String(v),label:id==='beruf'?profession(v):String(v)};})};}
	function materialRows(){
		var items=new Map(),producers=new Map();
		recipeRows.forEach(function(r){[r[18],r[19]].filter(Boolean).forEach(function(id){if(!producers.has(id)){producers.set(id,[]);}producers.get(id).push(r);});
			[r[6]||[],r[7]||[]].forEach(function(list,optional){list.forEach(function(z){if(!z[3]){return;}if(!items.has(z[3])){items.set(z[3],{id:z[3],name:z[0],uses:[],kind:'item'});}items.get(z[3]).uses.push({profession:r[9],tier:String(r[11]),optional:!!optional});});});});
		var rows=Array.from(items.values());rows.forEach(function(r){r.producers=producers.get(r.id)||[];r.source=r.producers.length?'crafted':'unknown';r.areas=[];});
		/* Gathering nodes are keyed by their own resource id, the ingredients by
		   item id. The only shared handle is the name, exactly as the item pages
		   connect both. Keying by list index found nothing and read as "source
		   unknown" even though the item page shows the areas. */
		var locations=new Map();
		if(resources){
			var nameOf=new Map();
			(resources.k||[]).forEach(function(k){nameOf.set(String(k[0]),k[1]);});
			var areasById=new Map();
			(resources.g||[]).forEach(function(g){areasById.set(String(g[0]),g);});
			(resources.m||[]).forEach(function(map){
				var area=areasById.get(String(map[0]));
				if(!area){return;}
				map[1].forEach(function(pair){
					var name=nameOf.get(String(pair[0]));
					if(!name){return;}
					if(!locations.has(name)){locations.set(name,[]);}
					var known=locations.get(name).find(function(a){return a.id===String(area[0]);});
					if(known){known.count+=pair[1];return;}
					locations.get(name).push({id:String(area[0]),name:area[1],map:area[2],count:pair[1],resource:String(pair[0])});
				});
			});
			/* The recorded item -> gathering family link wins; the name is no
			   evidence and never produces a place. */
			var families=resources.zu||{};
			// The place table keys its pairs by the position in 'k', zero-based.
			var positionOf=new Map();
			(resources.k||[]).forEach(function(k,i){positionOf.set(String(k[0]),i);});
			function familiesFor(list){
				var out=[];
				(list||[]).forEach(function(spalte){
					var artId=String(spalte[0]), position=positionOf.get(artId);
					if(position===undefined){return;}
					var areas=[];
					(resources.m||[]).forEach(function(map){
						var area=(resources.g||[]).find(function(g){return String(g[0])===String(map[0]);});
						if(!area){return;}
						map[1].forEach(function(pair){
							if(Number(pair[0])!==position){return;}
							var known=areas.find(function(a){return a.id===String(area[0]);});
							if(known){known.count+=pair[1];return;}
							areas.push({id:String(area[0]),name:area[1],map:area[2],count:pair[1],resource:artId});
						});
					});
					areas.sort(function(a,b){return b.count-a.count;});
					out.push({name:String(spalte[1]||''), profession:String(spalte[2]||''), tier:spalte[3], areas:areas});
				});
				return out;
			}
			rows.forEach(function(r){
				r.families=familiesFor(families[String(r.id)]).filter(function(f){return f.areas.length;});
				r.areas=[];
				r.families.forEach(function(f){r.areas=r.areas.concat(f.areas);});
				if(r.areas.length){r.source='gather';}
			});
			(resources.k||[]).forEach(function(k){
				if(rows.some(function(r){return r.name===k[1];})){return;}
				var areas=locations.get(k[1])||[];
				if(!areas.length){return;}
				rows.push({id:'resource:'+k[0],resource:k[0],name:k[1],uses:[{profession:k[2],tier:String(k[3]),optional:false}],kind:'resource',source:'gather',areas:areas,producers:[]});
			});
		}
		return rows;
	}
	function make(tab,settings){
		settings=settings||{};
		var recipeRows=settings.rows||window.MQL_CRAFT_RECIPE_ROWS||[], recipeRenderer=settings.renderer;
		var c=character(),mine=own(c),known=new Set(c&&c.rezepte||[]),isRecipe=tab==='rezepte',isMaterial=tab==='rohstoffe';
		var rows=isRecipe?recipeRows.map(function(r){return {id:r[10],name:r[0],raw:r,uses:[{profession:r[9],tier:String(r[11]),optional:false}],category:r[5]};}):isMaterial?materialRows():Object.keys(refs).map(function(k){return {id:k,name:profession(k),uses:[{profession:k,tier:'',optional:false}]};});
		var groups=[multi('beruf',words[15],rows.flatMap(function(r){return r.uses.map(function(u){return u.profession;});}))];
		groups.push({id:'eigene',kind:'boolean',label:words[18],available:function(){return mine.length>0;}});
		if(tab!=='berufe'){groups.push(multi('stufe',words[16],rows.flatMap(function(r){return r.uses.map(function(u){return u.tier;});})));}
		if(isRecipe){groups.push(multi('kategorie',words[17],rows.map(function(r){return r.category;})));groups.push({id:'lernstand',kind:'single',label:words[19],options:[{value:'alle',label:words[20]}].concat(known.size||complete(c)?[{value:'gelernt',label:words[21]}]:[]).concat(complete(c)?[{value:'nicht-gelernt',label:words[22]}]:[])});}
		if(isMaterial){groups.push({id:'quelle',kind:'multi',label:words[23],options:[{value:'gather',label:words[24]},{value:'crafted',label:words[25]},{value:'unknown',label:words[26]}]},
				{id:'optional',kind:'boolean',label:words[27]});
			var regions=new Map(),landscapes=new Map(),zones=new Map();
			rows.forEach(function(r){r.areas.forEach(function(a){
				var p=parents(a.map);a.region=p.region.id;a.landscape=p.landscape.id;
				if(!regions.has(a.region)){regions.set(a.region,{value:a.region,label:p.region.name,children:[]});}
				if(!landscapes.has(a.landscape)){var landscape={value:a.landscape,label:p.landscape.name,groupId:'landschaft',children:[]};landscapes.set(a.landscape,landscape);regions.get(a.region).children.push(landscape);}
				if(!zones.has(a.id)){var zone={value:a.id,label:a.name,groupId:'gebiet'};zones.set(a.id,zone);landscapes.get(a.landscape).children.push(zone);}
			});});
			function sorted(options){return Array.from(options).sort(function(a,b){return a.label.localeCompare(b.label,lang);});}
			landscapes.forEach(function(l){l.children=sorted(l.children);});regions.forEach(function(r){r.children=sorted(r.children);});
			groups.push({id:'region',kind:'multi',label:words[28],options:sorted(regions.values())},
				{id:'landschaft',kind:'multi',label:words[28],nestedOnly:true,options:sorted(landscapes.values())},
				{id:'gebiet',kind:'multi',label:words[28],nestedOnly:true,options:sorted(zones.values())});
		}
		var labels={};['search','filter','close','sort','reset','more','count','show','loading','error','retry','fallback','invalidRange','min','max'].forEach(function(k,i){labels[k]=words[i];});
		var config={area:settings.area||(isRecipe?'rezepte':isMaterial?'rohstoffe':'berufe'),lang:lang,rootUrl:location.origin+location.pathname,labels:labels,search:{submit:'debounce',debounceMs:200},groups:groups,
			sort:{options:[{value:'name',label:words[29]}].concat(tab==='berufe'?[]:[{value:'tier',label:words[16]}]).concat(isRecipe?[{value:'stufe',label:({de:'Gegenstandsstufe',en:'Item level',fr:'Niveau d’objet'})[lang]}]:[])},pagination:{kind:'limit',size:50},
			defaults:function(){var f={};groups.forEach(function(g){f[g.id]=g.kind==='boolean'?false:g.kind==='single'?'alle':[];});f.eigene=!settings.area&&mine.length>0;return {q:'',filters:f,sort:'name',pagination:{kind:'limit',limit:50}};}};
		var fields=[{param:'q',path:['q']},{param:'sort',path:['sort'],omit:'name'}];
		groups.forEach(function(g){fields.push({param:g.id,path:['filters',g.id],type:g.kind==='boolean'?'boolean':g.kind==='single'?'text':'multi',omit:g.kind==='single'?'alle':undefined,encode:g.id==='eigene'?function(v){return v?'1':'0';}:undefined});});
		var codec=A.codec(fields,config.defaults,['#'+tab]);
		config.urlCodec={decode:function(u){
			var parsed=codec.decode(u);
			if(u.searchParams.get('fehlend')==='1'&&isRecipe&&complete(c)){parsed.state.filters.lernstand='nicht-gelernt';}
			if(isMaterial&&u.searchParams.has('rohstoff')){var node=rows.find(function(r){return r.resource===u.searchParams.get('rohstoff');});if(node){parsed.state.q=node.name;}}
			if(settings.area){parsed.explicit=true;}
			if(parsed.state.filters.beruf.length&&parsed.state.filters.beruf.some(function(k){return !mine.includes(k);})){parsed.state.filters.eigene=false;}
			return parsed;
		},encode:function(s,u){u=codec.encode(s,u);u.searchParams.delete('fehlend');if(!settings.area){u.hash=tab;}return u;}};
		function matches(r,s,skip){var f=s.filters;
			return (!s.q||[r.name,r.id,isRecipe?r.raw[6].map(function(z){return z[0];}).join(' '):''].join(' ').toLocaleLowerCase().includes(s.q.toLocaleLowerCase()))&&
				r.uses.some(function(u){return (skip==='beruf'||!f.beruf.length||f.beruf.includes(u.profession))&&(skip==='stufe'||!f.stufe||!f.stufe.length||f.stufe.includes(u.tier))&&(skip==='eigene'||!f.eigene||!mine.length||mine.includes(u.profession))&&(!isMaterial||skip==='optional'||f.optional||!u.optional);})&&
				(!isRecipe||((skip==='kategorie'||!f.kategorie.length||f.kategorie.includes(r.category))&&(skip==='lernstand'||f.lernstand==='alle'||(f.lernstand==='gelernt'?known.has(r.id):!known.has(r.id)))))&&
				(!isMaterial||((skip==='quelle'||!f.quelle.length||f.quelle.includes(r.source))&&
					((!f.gebiet.length&&!f.region.length&&!f.landschaft.length)||r.areas.some(function(a){
						return (skip==='gebiet'||!f.gebiet.length||f.gebiet.includes(a.id))&&(skip==='region'||!f.region.length||f.region.includes(a.region))&&(skip==='landschaft'||!f.landschaft.length||f.landschaft.includes(a.landscape));
					})))) ;
		}
		var adapter=A.client({rows:rows,id:function(r){return r.id;},matches:matches,compare:function(a,b,sort){return (sort==='stufe'?(a.raw[2]||Infinity)-(b.raw[2]||Infinity):sort==='tier'?Math.min.apply(null,a.uses.map(function(u){return Number(u.tier)||Infinity;}))-Math.min.apply(null,b.uses.map(function(u){return Number(u.tier)||Infinity;})):0)||a.name.localeCompare(b.name,lang)||a.id.localeCompare(b.id);},
			facets:function(all,s){var out={};groups.forEach(function(g){if(g.kind==='multi'||g.kind==='single'){out[g.id]=g.options.map(function(o){var candidate=JSON.parse(JSON.stringify(s));candidate.filters[g.id]=g.kind==='multi'?[o.value]:o.value;return {value:o.value,count:all.filter(function(r){return matches(r,candidate);}).length};});}});return out;},
			renderResults:function(result,target){target.replaceChildren();
				if(isRecipe&&recipeRenderer){target.appendChild(recipeRenderer(result.payload.map(function(r){return r.raw;})));return;}
				result.payload.forEach(function(r){var section=document.createElement('section');section.className='filter-craft-row';
					var title=document.createElement('h3');
					if(r.kind!=='resource'&&r.id){var titelLink=text('a',r.name);titelLink.href=url('item',r.id);title.appendChild(titelLink);}else{title.appendChild(text('span',r.name));}
					section.appendChild(title);
					if(tab==='berufe'){
						var info=refs[r.id],progress=c&&c.handwerk&&c.handwerk[r.id];
						(info.s||[]).forEach(function(tier){var line=text('p',String(tier.t)+' · '+name(tier.k)+' / '+name(tier.m));var row=progress&&progress.find(function(p){return p[0]===tier.t;});if(row){line.appendChild(text('span',' · '+row[1]+' / '+row[3]+' XP'));}section.appendChild(line);});
					}else if(r.kind==='resource'){
						r.areas.forEach(function(a){var link=text('a',a.name+' ('+a.count.toLocaleString(lang)+')');link.href='/'+lang+'/'+({de:'karte',en:'map',fr:'carte'})[lang]+'/?vorkommen='+encodeURIComponent(r.resource)+'&vorkarte='+a.map;section.appendChild(link);section.appendChild(document.createTextNode(' · '));});
					}else{section.appendChild(text('p',r.uses.filter(function(u){return result.state.filters.optional||!u.optional;}).map(function(u){return profession(u.profession)+' · '+u.tier;}).filter(function(v,i,a){return a.indexOf(v)===i;}).join(' / ')));
						(r.families||[]).forEach(function(f){
							var fund=text('p',(f.name?f.name+' · ':'')+words[28]+': ');
							f.areas.slice(0,3).forEach(function(a,i){if(i){fund.appendChild(document.createTextNode(' · '));}var alink=text('a',a.name+' ('+a.count.toLocaleString(lang)+')');alink.href='/'+lang+'/'+({de:'karte',en:'map',fr:'carte'})[lang]+'/?vorkommen='+encodeURIComponent(a.resource)+'&vorkarte='+a.map;fund.appendChild(alink);});section.appendChild(fund);
						});
						r.producers.forEach(function(p){var a=text('a',p[0]+' · '+p[3]);a.href=url('recipe',p[10]);section.appendChild(a);section.appendChild(document.createTextNode(' · '));});if(!r.producers.length&&!(r.areas&&r.areas.length)){section.appendChild(text('p',words[31]));}}
					target.appendChild(section);
				});if(!result.total){target.appendChild(text('p',T('hw_keine_rezepte')));}
			}});
		return {config:config,adapter:adapter};
	}
	// The exact same recipe configuration and predicates serve contextual lists.
	window.MQL_RECIPE_FILTER={create:function(settings){return make('rezepte',settings);}};
	if(!document.getElementById('hw-reiter')){return;}
	function tabFromUrl(){return /#(berufe|rohstoffe|rezepte)$/.test(location.hash)?location.hash.slice(1):'rezepte';}
	function refresh(tab,navigate){
		queue=queue.then(async function(){
			if(controller){tabStates[activeTab]=controller.getState();await controller.destroy();controller=null;}
			if(navigate){var u=new URL(location.href);var shared={};['beruf','beruf[]','stufe','stufe[]','eigene'].forEach(function(k){if(u.searchParams.has(k)){shared[k]=u.searchParams.getAll(k);}});params.forEach(function(k){u.searchParams.delete(k);u.searchParams.delete(k+'[]');});Object.keys(shared).forEach(function(k){shared[k].forEach(function(v){u.searchParams.append(k,v);});});if(tabStates[tab]&&tabStates[tab].q){u.searchParams.set('q',tabStates[tab].q);}u.hash=tab;history.pushState(null,'',u);}
			activeTab=tab;document.querySelectorAll('[data-hw]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.hw===tab));});
			['berufe','rezepte','rohstoffe'].forEach(function(key){document.getElementById('hw-'+key).hidden=key!==tab;});
			var host=document.getElementById(tab==='berufe'?'berufe':tab==='rezepte'?'rezepte-liste':'rohstoffe-liste');host.replaceChildren();
			if(tab==='rezepte'&&!recipeRows.length||tab==='rohstoffe'&&!resources){host.appendChild(text('p',words[8]));return;}
			if(tab==='rezepte'){host.appendChild(text('p',words[32]));}
			var target=document.createElement('div');target.dataset.filterResults='';host.appendChild(target);
			var setup=make(tab,{rows:recipeRows,renderer:recipeRenderer});controller=window.MQL_FILTER_UI.mount(host,setup);window.MQL_CRAFT_FILTER=controller;await controller.ready;
		});return queue;
	}
	window.MQL_HANDWERK_FILTER={recipes:function(rows,renderer){recipeRows=rows;recipeRenderer=renderer;return refresh(tabFromUrl(),false);}};
	window.MQL_ROHSTOFFE_ZEICHNEN=function(){resources=window.MQL_VORKOMMEN;return refresh(tabFromUrl(),false);};
	document.querySelectorAll('[data-hw]').forEach(function(b){b.addEventListener('click',function(){refresh(b.dataset.hw,true);});});
	window.addEventListener('popstate',function(){if(tabFromUrl()!==activeTab){refresh(tabFromUrl(),false);}});
	window.addEventListener('storage',function(e){if(e.key==='mql.charaktere'){refresh(tabFromUrl(),false);}});
	document.addEventListener('mql:characterchange',function(){refresh(tabFromUrl(),false);});
	refresh(tabFromUrl(),false);
	if(window.MQL_VORKOMMEN){window.MQL_ROHSTOFFE_ZEICHNEN();}
})();
