/* One active shared filter controller for crafting tabs. Character data stays local. */
(function () {
	'use strict';
	var A=window.MQL_FILTERADAPTER, recipeRows=[], recipeRenderer, resources=null, controller=null;
	var lang=window.MQL_SPRACHE || 'de', T=window.MQL_T || function(k){return k;};
	var L=(window.MQL_LISTEN||{}).handwerk||null;
	var refs=(window.MQL_REFERENZ || {}).berufe || {}, activeTab='', queue=Promise.resolve(), tabStates={};
	var geographyNode=document.getElementById('craft-geography');
	var geography=geographyNode?JSON.parse(geographyNode.textContent):{};
	// Pure gathering nodes carry no item image; the page hands over the
	// established Lucide symbol for them.
	var symbolsNode=document.getElementById('craft-symbols');
	var symbols=symbolsNode?JSON.parse(symbolsNode.textContent):{};
	var params=['q','beruf','stufe','kategorie','sort','eigene','lernstand','fehlend','gebiet','region','landschaft','rohstoff'];
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
		de:['Suchen','Filter','Schließen','Sortierung','Zurücksetzen','Weitere anzeigen','%s Einträge','%s Treffer anzeigen','Lade …','Ergebnisse konnten nicht geladen werden.','Erneut versuchen','Als Seite öffnen','Ungültiger Bereich','Von','Bis','Beruf','Handwerksstufe','Kategorie','Nur eigene Berufe','Lernstand','Alle','Gelernt','Nicht gelernt','Quelle','Sammelvorkommen','Herstellbar','Ohne Bezugsquelle','Optionale Zutaten einschließen','Fundgebiet','Name','Bis zur aktuellen Handwerksstufe','Gemeisterte Stufen ausblenden','Grundart'],
		en:['Search','Filters','Close','Sort','Reset','Show more','%s entries','Show %s results','Loading …','Couldn’t load results.','Try again','Open page','Invalid range','From','To','Profession','Crafting tier','Category','Only my professions','Learning status','All','Learned','Not learned','Source','Gathering nodes','Craftable','No source listed','Include optional ingredients','Gathering area','Name','Up to my current crafting tier','Hide mastered tiers','Base type'],
		fr:['Chercher','Filtres','Fermer','Tri','Réinitialiser','Afficher davantage','%s entrées','Afficher %s résultats','Chargement …','Impossible d’afficher les résultats.','Réessayer','Ouvrir la page','Plage incorrecte','De','À','Métier','Palier d’artisanat','Catégorie','Mes métiers uniquement','Apprentissage','Tous','Appris','Non appris','Source','Gisements','Fabrication','Sans source indiquée','Inclure les ingrédients facultatifs','Zone de récolte','Nom','Jusqu’à mon palier actuel','Masquer les paliers maîtrisés','Type de base']
	}[lang];
	function name(o){return o && (o[lang]||o.en)||'';}
	function profession(key){return name((refs[key]||{}).n)||key;}
	function character(){return window.MQL_SPEICHER&&window.MQL_SPEICHER.aktiv?window.MQL_SPEICHER.aktiv():null;}
	function setIntro(tab){
		var intro=document.getElementById('hw-einleitung');
		if(!intro){return;}
		var key={berufe:'hw_text',rezepte:'hw_rezepte_text',rohstoffe:'hw_rohstoffe_text'}[tab]||'hw_text';
		intro.textContent=T(key);
	}
	function own(c){return Object.keys(c&&c.handwerk||{}).filter(function(k){return c.handwerk[k]&&c.handwerk[k].length;});}
	/* The Companion import marks the recipe file with `importMeta.recipes`;
	   without it an old backup stays conservative about missing recipes. */
	function complete(c){
		var meta=c&&c.importMeta||{}, dataset=meta.datasets&&meta.datasets.recipes;
		return !!((dataset&&dataset.status==='complete')||meta.recipes===true);
	}
	function text(tag,s){var n=document.createElement(tag);n.textContent=s;return n;}
	function url(kind,id){return '/'+lang+'/'+({item:{de:'gegenstand',en:'item',fr:'objet'},recipe:{de:'rezept',en:'recipe',fr:'recette'}}[kind][lang])+'/'+id+'/';}
	/* Tier numbers become the game's own names (Lehrling, Geselle …). The
	   recipe rows carry both, so the label never invents one. */
	var tierNames=new Map();
	function merkeStufen(rows){
		(rows||[]).forEach(function(r){var nr=String(r[11]);if(nr&&r[4]&&!tierNames.has(nr)){tierNames.set(nr,r[4]);}});
	}
	// In the filter an unrecorded tier needs a word; in a row it stays silent.
	function tierLabel(tier){var key=String(tier);if(key===''||key==='0'){return ({de:'Ohne Stufenangabe',en:'Without a crafting tier',fr:'Sans palier'})[lang];}return tierNames.get(key)||key;}
	function tierText(tier){var key=String(tier);if(key===''||key==='0'){return '';}return tierNames.get(key)||key;}
	function multi(id,label,values){return {id:id,kind:'multi',label:label,options:Array.from(new Set(values.filter(function(v){return v!=='';}))).sort(function(a,b){return MQL_SORT.compare(String(a),String(b));}).map(function(v){return {value:String(v),label:id==='beruf'?profession(v):id==='stufe'?tierLabel(v):String(v)};})};}
	/* The client's recipe categories are flat names with a qualifier:
	   "Leichte Rüstung (Stufe 40)", "… (Gilde)", "… (Lossoth)". The build hands
	   over bucket and base type per name, so the filter shows the three levels
	   the crafting panel itself uses. A base type with a single category needs
	   no level of its own and becomes a leaf of its bucket. */
	function kategorieBaum(rows){
		var proBuendel=new Map();
		rows.forEach(function(r){
			if(!r.buendel){return;}
			if(!proBuendel.has(r.buendel)){proBuendel.set(r.buendel,new Map());}
			var typen=proBuendel.get(r.buendel);
			if(!typen.has(r.grund)){typen.set(r.grund,{label:r.grundName,blaetter:new Map(),n:0});}
			var typ=typen.get(r.grund);
			typ.n+=1;
			// One entry per category, not per recipe.
			typ.blaetter.set(r.category,{value:r.category,label:r.blatt||r.category,chipLabel:r.category,groupId:'kategorie'});
		});
		var namen=new Map(((window.MQL_REZEPTE||{}).b||[]).map(function(p){return [p[0],p[1]];}));
		var reihenfolge=Array.from(namen.keys()).concat(Array.from(proBuendel.keys()).filter(function(k){return !namen.has(k);}));
		var ziel=[],grund=[],kategorie=[];
		reihenfolge.forEach(function(bk){
			var typen=proBuendel.get(bk);
			if(!typen){return;}
			var zweige=[];
			// The base type with the most recipes first, the way the item search
			// orders its categories; the leaves below stay alphabetical.
			Array.from(typen.keys()).sort(function(a,b){return typen.get(b).n-typen.get(a).n||MQL_SORT.compare(typen.get(a).label,typen.get(b).label);}).forEach(function(tk){
				var typ=typen.get(tk);
				var blaetter=Array.from(typ.blaetter.values()).sort(function(a,b){return MQL_SORT.compare(a.label,b.label);});
				kategorie.push.apply(kategorie,blaetter);
				// A base type with one category needs no level of its own; it takes
				// the base type's name instead of its lone qualifier.
				if(blaetter.length===1){if(blaetter[0].label!==typ.label){blaetter[0].label=typ.label;}zweige.push(blaetter[0]);return;}
				var knoten={value:tk,label:typ.label,children:blaetter,groupId:'grund'};
				grund.push(knoten);zweige.push(knoten);
			});
			ziel.push({value:bk,label:namen.get(bk)||bk,children:zweige});
		});
		return {ziel:ziel,grund:grund,kategorie:kategorie};
	}
	function materialRows(){
		var items=new Map(),producers=new Map();
		merkeStufen(recipeRows);
		recipeRows.forEach(function(r){[r[18],r[19]].filter(Boolean).forEach(function(id){if(!producers.has(id)){producers.set(id,[]);}producers.get(id).push(r);});
			// A few optional ingredients carry the icon id where the item id
			// belongs. Without an item id there is no page to link and no
			// evidence which item it is, so the entry stays out of the list.
			[r[6]||[],r[7]||[]].forEach(function(list,optional){list.forEach(function(z){if(!z[3]||typeof z[3]!=='string'){return;}if(!items.has(z[3])){items.set(z[3],{id:z[3],name:z[0],symbol:z[2],uses:[],kind:'item'});}items.get(z[3]).uses.push({profession:r[9],tier:String(r[11]),optional:!!optional});});});});
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
		var def=L?L[tab]:null;
		var recipeRows=settings.rows||window.MQL_CRAFT_RECIPE_ROWS||[], recipeRenderer=settings.renderer;
		var c=character(),mine=own(c),known=new Set(c&&c.rezepte||[]),isRecipe=tab==='rezepte',isMaterial=tab==='rohstoffe';
		if(isRecipe){merkeStufen(recipeRows);}
		var kategorieDaten=(window.MQL_REZEPTE||{}).k||{};
		var rows=isRecipe?recipeRows.map(function(r){
			var info=kategorieDaten[r[5]]||[];
			return {id:r[10],name:r[0],raw:r,uses:[{profession:r[9],tier:String(r[11]),optional:false}],category:r[5],
				buendel:info[0]||'',grund:info[1]||'',grundName:info[2]||r[5],blatt:info[3]||''};
		}):isMaterial?materialRows():Object.keys(refs).map(function(k){return {id:k,name:profession(k),uses:[{profession:k,tier:'',optional:false}]};});
		var groups=[multi('beruf',words[15],rows.flatMap(function(r){return r.uses.map(function(u){return u.profession;});}))];
		groups.push({id:'eigene',kind:'boolean',label:words[18],available:function(){return mine.length>0;}});
		if(tab!=='berufe'){groups.push(multi('stufe',words[16],rows.flatMap(function(r){return r.uses.map(function(u){return u.tier;});})));}
		if(isRecipe){var baum=kategorieBaum(rows);
			// Contextual lists on detail pages carry their rows from the page and
			// not the generated tree; there the category stays one flat group.
			if(baum.ziel.length){groups.push({id:'ziel',kind:'multi',label:words[17],options:baum.ziel},
				{id:'grund',kind:'multi',label:words[32],nestedOnly:true,options:baum.grund},
				{id:'kategorie',kind:'multi',label:words[17],nestedOnly:true,options:baum.kategorie});}
			else{groups.push(multi('kategorie',words[17],rows.map(function(r){return r.category;})));}
			groups.push({id:'lernstand',kind:'single',label:words[19],options:[{value:'alle',label:words[20]}].concat(known.size||complete(c)?[{value:'gelernt',label:words[21]}]:[]).concat(complete(c)?[{value:'nicht-gelernt',label:words[22]}]:[])});}
		if(isMaterial){
			var regions=new Map(),landscapes=new Map(),zones=new Map();
			rows.forEach(function(r){r.areas.forEach(function(a){
				var p=parents(a.map);a.region=p.region.id;a.landscape=p.landscape.id;
				if(!regions.has(a.region)){regions.set(a.region,{value:a.region,label:p.region.name,children:[]});}
				if(!landscapes.has(a.landscape)){var landscape={value:a.landscape,label:p.landscape.name,groupId:'landschaft',children:[]};landscapes.set(a.landscape,landscape);regions.get(a.region).children.push(landscape);}
				if(!zones.has(a.id)){var zone={value:a.id,label:a.name,groupId:'gebiet'};zones.set(a.id,zone);landscapes.get(a.landscape).children.push(zone);}
			});});
			function sorted(options){return Array.from(options).sort(function(a,b){return MQL_SORT.compare(a.label,b.label);});}
			landscapes.forEach(function(l){l.children=sorted(l.children);});regions.forEach(function(r){r.children=sorted(r.children);});
			groups.push({id:'region',kind:'multi',label:words[28],options:sorted(regions.values())},
				{id:'landschaft',kind:'multi',label:words[28],nestedOnly:true,options:sorted(landscapes.values())},
				{id:'gebiet',kind:'multi',label:words[28],nestedOnly:true,options:sorted(zones.values())});
		}
		if (def && def.filter) {
			var nachId = {};
			groups.forEach(function (group) { nachId[group.id] = group; });
			groups = def.filter.map(function (id) { return nachId[id]; }).filter(Boolean);
		}
		var sortErlaubt = (def && def.sortierung && def.sortierung.erlaubt) || ['name'];
		var ersteRichtung = (def && def.sortierung && def.sortierung.ersteRichtung) || {name:'asc'};
		var sortStandard = (def && def.sortierung && def.sortierung.standard) || 'name';
		var groesse = (def && def.blaettern && def.blaettern.groesse) || 50;
		var labels={};['search','filter','close','sort','reset','more','count','show','loading','error','retry','fallback','invalidRange','min','max'].forEach(function(k,i){labels[k]=words[i];});
		// Without a placeholder the search field renders as an empty box.
		labels.placeholder={de:'Beruf, Rezept oder Rohstoff suchen',en:'Search profession, recipe or resource',fr:'Chercher un métier, une recette ou une ressource'}[lang];
		// Detail-page relation lists keep the row and its sort select; the
		// crafting page itself has no select, because its column heads sort.
		var sortOptionen=settings.area&&def&&def.spalten?def.spalten.filter(function(s){return s.sortierung;}).map(function(s){return {value:s.sortierung,label:T(s.labelKey||s.sortierung)};}):[];
		var config={area:settings.area||(isRecipe?'rezepte':isMaterial?'rohstoffe':'berufe'),lang:lang,rootUrl:location.origin+location.pathname,labels:labels,search:{submit:'debounce',debounceMs:200},groups:groups,
			sort:{keys:sortErlaubt,ersteRichtung:ersteRichtung,options:sortOptionen},pagination:{kind:'limit',size:groesse},
			defaults:function(){var f={};groups.forEach(function(g){f[g.id]=g.kind==='boolean'?false:g.kind==='single'?'alle':[];});f.eigene=!settings.area&&mine.length>0;return {q:'',filters:f,sort:sortStandard,sortDir:ersteRichtung[sortStandard]||'asc',pagination:{kind:'limit',limit:groesse}};}};
		var fields=[{param:'q',path:['q']}];
		groups.forEach(function(g){fields.push({param:g.id,path:['filters',g.id],type:g.kind==='boolean'?'boolean':g.kind==='single'?'text':'multi',omit:g.kind==='single'?'alle':undefined,encode:g.id==='eigene'?function(v){return v?'1':null;}:undefined});});
		var baseCodec=A.codec(fields,config.defaults,['#'+tab]);
		function sortLesen(roh){
			var dir=roh.charAt(0)==='-'?'desc':'asc', key=dir==='desc'?roh.slice(1):roh;
			return sortErlaubt.indexOf(key)>=0?{key:key,dir:dir}:null;
		}
		config.urlCodec={decode:function(u){
			var parsed=baseCodec.decode(u);
			var roh=u.searchParams.get('sort');
			if(roh){var gelesen=sortLesen(roh);if(gelesen){parsed.state.sort=gelesen.key;parsed.state.sortDir=gelesen.dir;}parsed.explicit=true;}
			if(u.searchParams.get('fehlend')==='1'&&isRecipe&&complete(c)){parsed.state.filters.lernstand='nicht-gelernt';}
			if(isMaterial&&u.searchParams.has('rohstoff')){var node=rows.find(function(r){return r.resource===u.searchParams.get('rohstoff');});if(node){parsed.state.q=node.name;}}
			if(settings.area){parsed.explicit=true;}
			if(parsed.state.filters.beruf.length&&parsed.state.filters.beruf.some(function(k){return !mine.includes(k);})){parsed.state.filters.eigene=false;}
			return parsed;
		},encode:function(s,u){u=baseCodec.encode(s,u);u.searchParams.delete('sort');if(s.sort!==sortStandard||s.sortDir==='desc'){u.searchParams.set('sort',(s.sortDir==='desc'?'-':'')+s.sort);}['fehlend','quelle','optional','aktuell','gemeistert'].forEach(function(k){u.searchParams.delete(k);});if(!settings.area){u.hash=tab;}return u;}};
		var searchIndex=new Map(),searchQuery=null,searchNeedle='';
		rows.forEach(function(r){searchIndex.set(r,[r.name,r.id,isRecipe?r.raw[6].map(function(z){return z[0];}).join(' '):''].join(' ').toLocaleLowerCase(lang));});
		function matches(r,s,skip){var f=s.filters;
			if(s.q){if(s.q!==searchQuery){searchQuery=s.q;searchNeedle=s.q.toLocaleLowerCase(lang);}if(!searchIndex.get(r).includes(searchNeedle)){return false;}}
			return r.uses.some(function(u){return (skip==='beruf'||!f.beruf.length||f.beruf.includes(u.profession))&&(skip==='stufe'||!f.stufe||!f.stufe.length||f.stufe.includes(u.tier))&&(skip==='eigene'||!f.eigene||!mine.length||mine.includes(u.profession));})&&
				(!isRecipe||((skip==='ziel'||!f.ziel||!f.ziel.length||f.ziel.indexOf(r.buendel)>=0)&&
					(skip==='grund'||!f.grund||!f.grund.length||f.grund.indexOf(r.grund)>=0)&&
					(skip==='kategorie'||!f.kategorie.length||f.kategorie.indexOf(r.category)>=0)&&
					(skip==='lernstand'||f.lernstand==='alle'||(f.lernstand==='gelernt'?known.has(r.id):!known.has(r.id)))))&&
				(!isMaterial||((!f.gebiet.length&&!f.region.length&&!f.landschaft.length)||r.areas.some(function(a){
						return (skip==='gebiet'||!f.gebiet.length||f.gebiet.includes(a.id))&&(skip==='region'||!f.region.length||f.region.includes(a.region))&&(skip==='landschaft'||!f.landschaft.length||f.landschaft.includes(a.landscape));
					}))) ;
		}
		var adapter=A.client({rows:rows,id:function(r){return r.id;},matches:matches,compare:function(a,b,sort,dir){
			var richtung=dir==='desc'?-1:1;
			var nenner=MQL_SORT.compare(a.name,b.name)||String(a.id).localeCompare(String(b.id));
			if(sort==='stufe'){
				var sa=a.raw&&a.raw[2]||0,sb=b.raw&&b.raw[2]||0;
				if(!sa&&sb){return 1;} if(sa&&!sb){return -1;}
				if(sa!==sb){return (sa-sb)*richtung;}
				return nenner;
			}
			if(sort==='tier'){
				var ta=Math.min.apply(null,a.uses.map(function(u){return Number(u.tier)||0;})),
					tb=Math.min.apply(null,b.uses.map(function(u){return Number(u.tier)||0;}));
				if(!ta&&tb){return 1;} if(ta&&!tb){return -1;}
				if(ta!==tb){return (ta-tb)*richtung;}
				return nenner;
			}
			return nenner*richtung;
		},
			facets:function(all,s){
				var out={},baumIds=['ziel','grund','kategorie'];
				// Each of the three levels counts from a base set in which its own
				// selection is cleared – the same rule as every other facet.
				if(isRecipe){baumIds.forEach(function(id){
					var gruppe=groups.find(function(g){return g.id===id;});
					if(!gruppe){return;}
					var rest=JSON.parse(JSON.stringify(s));rest.filters[id]=[];
					var zaehler={};
					all.forEach(function(r){if(!matches(r,rest)){return;}var wert=id==='ziel'?r.buendel:id==='grund'?r.grund:r.category;if(wert){zaehler[wert]=(zaehler[wert]||0)+1;}});
					out[id]=(gruppe.options||[]).map(function(o){return {value:o.value,count:zaehler[o.value]||0};});
				});}
				groups.forEach(function(g){if((g.kind==='multi'||g.kind==='single')&&baumIds.indexOf(g.id)<0){out[g.id]=g.options.map(function(o){var candidate=JSON.parse(JSON.stringify(s));candidate.filters[g.id]=g.kind==='multi'?[o.value]:o.value;return {value:o.value,count:all.filter(function(r){return matches(r,candidate);}).length};});}});return out;},
			renderResults:function(result,target){target.replaceChildren();
				// Detail-page relation lists keep the shared row; only the crafting
				// page itself shows the table with its own head.
				if(isRecipe&&recipeRenderer&&settings.area){target.appendChild(recipeRenderer(result.payload.map(function(r){return r.raw;})));return;}
				if((isRecipe||isMaterial)&&window.MQL_TABELLE){
					var tabelle=window.MQL_TABELLE,ui=window.MQL_TREFFERZEILE;
					var fortschritt=isRecipe&&ui&&ui.recipeHasProgressData&&ui.recipeHasProgressData();
					if(isRecipe&&ui&&ui.recipeHelp){var hilfe=ui.recipeHelp();if(hilfe){
						var hinweis=text('p',hilfe+' ');hinweis.className='llb-hinweis';
						var importLink=text('a',ui.words.import);
						importLink.href='/'+lang+'/'+({de:'spielstand',en:'progress',fr:'progression'})[lang]+'/';
						hinweis.appendChild(importLink);target.appendChild(hinweis);
					}}
					var spalten=((def&&def.spalten)||[]).map(function(s){
						return {label:T(s.labelKey||s.id),sortierung:s.sortierung,zahl:s.zahl,breite:s.breite};
					});
					if(fortschritt){spalten.push({label:ui.words.progress,breite:'16ch'});}
					var bau=tabelle.bauen(target,spalten,{key:result.state.sort,dir:result.state.sortDir});
					if(!result.total){
						var leer=document.createElement('tr');leer.setAttribute('role','row');
						var zelle=document.createElement('td');zelle.setAttribute('role','cell');zelle.colSpan=spalten.length;
						zelle.textContent=T(isRecipe?'hw_keine_rezepte':'hw_roh_auswahl');leer.appendChild(zelle);bau.koerper.appendChild(leer);return;
					}
					result.payload.forEach(function(r){
						var a=document.createElement('a');a.className='gs-zeile';
						if(isRecipe){a.href=url('recipe',r.id);}else if(r.kind!=='resource'){a.href=url('item',r.id);}
						var zeichen=null;
						if(isRecipe&&r.raw&&r.raw[16]&&ui){zeichen=ui.itemIcon(r.raw[16],'rezept');}
						else if(r.symbol&&ui){zeichen=ui.itemIcon(r.symbol,'gegenstand');}
						else if(r.kind==='resource'&&symbols.vorkommen){zeichen=document.createElement('span');zeichen.className='mql-row-icon';zeichen.innerHTML=symbols.vorkommen;}
						if(zeichen){a.appendChild(zeichen);}
						var bezeichnung=text('span',r.name);bezeichnung.className='gs-name'+(isRecipe?' q'+((r.raw&&r.raw[1])||0):'');
						a.appendChild(bezeichnung);
						var professions=Array.from(new Set(r.uses.map(function(u){return profession(u.profession);}).filter(Boolean))).join(' · ');
						var tiers=Array.from(new Set(r.uses.map(function(u){return tierText(u.tier);}).filter(Boolean))).join(' · ');
						var zellen=[a,professions,tiers];
						if(isRecipe){
							zellen.push(r.raw&&r.raw[2]?String(r.raw[2]):'');
							if(fortschritt){zellen.push(ui.recipeProgress(r.id)||'');}
						}else{
							var areas=(r.areas||[]).slice().sort(function(x,y){return y.count-x.count;});
							if(r.kind==='resource'&&areas.length){
								var details=document.createElement('details');details.className='handwerk-rohstoff-orte';
								details.appendChild(text('summary',T('hw_roh_gebiet')+' ('+areas.length+')'));
								areas.forEach(function(area){
									var link=text('a',area.name+' ('+area.count.toLocaleString(lang)+')');
									link.href='/'+lang+'/'+({de:'karte',en:'map',fr:'carte'})[lang]+'/?vorkommen='+encodeURIComponent(r.resource)+'&vorkarte='+encodeURIComponent(area.map);
									details.appendChild(link);
								});
								zellen.push(details);
							}else{zellen.push('');}
						}
						bau.koerper.appendChild(tabelle.zeile(spalten,zellen));
					});
					return;
				}
				result.payload.forEach(function(r){var section=document.createElement('section');section.className='filter-craft-row';
					var title=document.createElement('h3');
					if(r.symbol){var bildchen=document.createElement('img');bildchen.className='symbol';bildchen.src='/bild/items/'+r.symbol+'.webp';bildchen.alt='';bildchen.width=22;bildchen.height=22;bildchen.loading='lazy';bildchen.decoding='async';title.appendChild(bildchen);}
					else if(r.kind==='resource'&&symbols.vorkommen){var marke=document.createElement('span');marke.className='symbol symbol-svg';marke.innerHTML=symbols.vorkommen;title.appendChild(marke);}
					if(r.kind!=='resource'&&r.id){var titelLink=text('a',r.name);titelLink.href=url('item',r.id);title.appendChild(titelLink);}else{title.appendChild(text('span',r.name));}
					section.appendChild(title);
					if(tab==='berufe'){
						var info=refs[r.id],progress=c&&c.handwerk&&c.handwerk[r.id];
						(info.s||[]).forEach(function(tier){var line=text('p',String(tier.t)+' · '+name(tier.k)+' / '+name(tier.m));var row=progress&&progress.find(function(p){return p[0]===tier.t;});if(row){line.appendChild(text('span',' · '+row[1]+' / '+row[3]+' XP'));}section.appendChild(line);});
					}else if(r.kind==='resource'){
						r.areas.forEach(function(a){var link=text('a',a.name+' ('+a.count.toLocaleString(lang)+')');link.href='/'+lang+'/'+({de:'karte',en:'map',fr:'carte'})[lang]+'/?vorkommen='+encodeURIComponent(r.resource)+'&vorkarte='+a.map;section.appendChild(link);section.appendChild(document.createTextNode(' · '));});
					}else{section.appendChild(text('p',r.uses.map(function(u){var stufe=tierText(u.tier);return profession(u.profession)+(stufe?' · '+stufe:'');}).filter(function(v,i,a){return a.indexOf(v)===i;}).join(' / ')));
						(r.families||[]).forEach(function(f){
							var fund=text('p',(f.name?f.name+' · ':'')+words[28]+': ');
							f.areas.slice(0,3).forEach(function(a,i){if(i){fund.appendChild(document.createTextNode(' · '));}var alink=text('a',a.name+' ('+a.count.toLocaleString(lang)+')');alink.href='/'+lang+'/'+({de:'karte',en:'map',fr:'carte'})[lang]+'/?vorkommen='+encodeURIComponent(a.resource)+'&vorkarte='+a.map;fund.appendChild(alink);});section.appendChild(fund);
						});
						if(r.producers.length){
							var gruppen=new Map();
							r.producers.forEach(function(p){if(!gruppen.has(p[0])){gruppen.set(p[0],{url:url('recipe',p[10]),berufe:[]});}var e=gruppen.get(p[0]);if(p[3]&&e.berufe.indexOf(p[3])<0){e.berufe.push(p[3]);}});
							var zeile=text('p',words[25]+': ');
							var erst=true;
							gruppen.forEach(function(e,name){if(!erst){zeile.appendChild(document.createTextNode(' · '));}erst=false;var a=text('a',name+(e.berufe.length?' ('+e.berufe.join(', ')+')':''));a.href=e.url;zeile.appendChild(a);});
							section.appendChild(zeile);
						}}
					target.appendChild(section);
				});if(!result.total){target.appendChild(text('p',T('hw_keine_rezepte')));}
			}});
		return {config:config,adapter:adapter};
	}
	// The exact same recipe configuration and predicates serve contextual lists.
	window.MQL_RECIPE_FILTER={create:function(settings){return make('rezepte',settings);}};
	/* Only the crafting page has these hosts; other pages carry a tab bar too. */
	if(!document.getElementById('rezepte-liste')||!document.querySelector('.llb-reiter')){return;}
	function tabFromUrl(){return /#(berufe|rohstoffe|rezepte)$/.test(location.hash)?location.hash.slice(1):'rezepte';}
	function refresh(tab,navigate){
		queue=queue.then(async function(){
			if(controller){tabStates[activeTab]=controller.getState();await controller.destroy();controller=null;}
			activeTab=tab;
			setIntro(tab);
			/* Both badges count what the tabs hold, not what a filter leaves over;
			 * the inactive tab must show its number before it is opened. */
			if(reiter){
				if(recipeRows.length){reiter.zahl('rezepte',recipeRows.length);}
				if(resources){reiter.zahl('rohstoffe',materialRows().length);}
			}
			var host=document.getElementById(tab==='berufe'?'berufe':tab==='rezepte'?'rezepte-liste':'rohstoffe-liste');host.replaceChildren();
			if(tab==='rezepte'&&!recipeRows.length||tab==='rohstoffe'&&!resources){host.appendChild(text('p',words[8]));return;}
			var c=character(), meta=c&&c.importMeta;
			if(tab==='rezepte'&&meta&&meta.crafting===true&&meta.recipes===false&&!complete(c)){
				var hint=text('p',T('hw_ohne_rezepte'));hint.className='schwach';host.appendChild(hint);
			}
			var target=document.createElement('div');target.dataset.filterResults='';host.appendChild(target);
			var setup=make(tab,{rows:recipeRows,renderer:recipeRenderer});controller=window.MQL_FILTER_UI.mount(host,setup);window.MQL_CRAFT_FILTER=controller;await controller.ready;
		});return queue;
	}
	window.MQL_HANDWERK_FILTER={recipes:function(rows,renderer){recipeRows=rows;recipeRenderer=renderer;return refresh(tabFromUrl(),false);}};
	window.MQL_ROHSTOFFE_ZEICHNEN=function(){resources=window.MQL_VORKOMMEN;return refresh(tabFromUrl(),false);};
	var reiterHost=document.querySelector('.llb-reiter'), reiter=null;
	if(reiterHost&&window.MQL_REITER){
		reiter=window.MQL_REITER.mount(reiterHost,{aktiv:tabFromUrl(),hash:true,verlauf:true,onShow:function(tab){refresh(tab);}});
	}else{
		refresh(tabFromUrl(),false);
	}
	window.addEventListener('storage',function(e){if(e.key==='mql.charaktere'){refresh(tabFromUrl(),false);}});
	document.addEventListener('mql:characterchange',function(){refresh(tabFromUrl(),false);});
	if(window.MQL_VORKOMMEN){window.MQL_ROHSTOFFE_ZEICHNEN();}
})();
