/* Shared quest/deed lists. Parent relations are resolved before this adapter. */
(function () {
	'use strict';
	window.MQL_TASK_FILTER_SETUP = function(rows, kind) {
		var lang=document.documentElement.lang, A=window.MQL_FILTERADAPTER;
		var w={de:['Suchen','Filter','Schließen','Sortierung','Zurücksetzen','Weitere anzeigen','%s Einträge','%s Treffer anzeigen','Lade …','Ergebnisse nicht aktualisiert.','Erneut versuchen','Als Seite öffnen','Ungültiger Bereich','Von','Bis','Kategorie','Region','Gebiet','Stufe','Abschluss','Alle','Erledigt','Nicht als erledigt importiert','Name','Art','Belohnung','LOTRO-Punkte','Tugend','Titel'],
			en:['Search','Filters','Close','Sort','Reset','Show more','%s entries','Show %s results','Loading …','Results not updated.','Try again','Open page','Invalid range','From','To','Category','Region','Area','Level','Completion','All','Completed','Not imported as completed','Name','Type','Reward','LOTRO Points','Virtue','Title'],
			fr:['Chercher','Filtres','Fermer','Tri','Réinitialiser','Afficher davantage','%s entrées','Afficher %s résultats','Chargement …','Résultats non actualisés.','Réessayer','Ouvrir la page','Plage incorrecte','De','À','Catégorie','Région','Pays','Niveau','Achèvement','Tous','Terminé','Non importé comme terminé','Nom','Type','Récompense','Points LOTRO','Vertu','Titre']}[lang];
		var labels={};['search','filter','close','sort','reset','more','count','show','loading','error','retry','fallback','invalidRange','min','max'].forEach(function(k,i){labels[k]=w[i];});
		var c=window.MQL_SPEICHER&&window.MQL_SPEICHER.aktiv(), dataset=kind==='d'?'deeds':'quests';
		var known=new Set(c&&c[dataset]||[]);
		var meta=c&&c.importMeta||{}, ds=meta.datasets&&meta.datasets[dataset];
		// "Not imported as completed" is a statement about the import, not about
		// availability, so it needs an imported status file or positive entries.
		var belegt=known.size>0||(ds?ds.status!=='unknown':(dataset==='deeds'?meta.deeds:meta.quests)===true);
		/* A filter that cannot separate anything is noise: a group needs at least
		   two values in this relation, a range at least two distinct levels. */
		function multi(id,label){
			var values=Array.from(new Set(rows.map(function(r){return r[id];}).filter(Boolean)))
				.sort(function(a,b){return a.localeCompare(b,lang);});
			if(values.length<2){return null;}
			return {id:id,kind:'multi',label:label,options:values.map(function(v){return {value:v,label:v};})};
		}
		var groups=[multi('category',w[15]),multi('region',w[16]),multi('area',w[17])];
		var levels=new Set(rows.map(function(r){return r.level;}).filter(function(v){return v!==null;}));
		if(levels.size>1){groups.push({id:'level',kind:'range',label:w[18]});}
		if(kind==='d'){
			groups.unshift(multi('type',w[24]));
			var rewards=new Set();
			rows.forEach(function(r){r.rewards.forEach(function(x){rewards.add(x);});});
			groups.push({id:'reward',kind:'multi',label:w[25],options:[{value:'points',label:w[26]}]
				.concat(rewards.has('v')?[{value:'v',label:w[27]}]:[])
				.concat(rewards.has('t')?[{value:'t',label:w[28]}]:[])});
		}
		groups=groups.filter(Boolean);
		// "Rest" claims only "not imported as completed" — the same wording the
		// pages use — never that a quest is still open or available.
		if(belegt){groups.push({id:'status',kind:'single',label:w[19],options:[{value:'all',label:w[20]},{value:'done',label:w[21]},{value:'rest',label:w[22]}]});}
		var config={area:kind==='d'?'taten':'aufgaben',lang:lang,labels:labels,rootUrl:location.origin+location.pathname,groups:groups,search:{submit:'debounce',debounceMs:200},sort:{options:[{value:'name',label:w[23]},{value:'level',label:w[18]}]},pagination:{kind:'limit',size:50},defaults:function(){var filters={};groups.forEach(function(g){filters[g.id]=g.kind==='single'?'all':g.kind==='range'?{min:null,max:null}:[];});return {q:'',filters:filters,sort:'name',pagination:{kind:'limit',limit:50}};}};
		var fields=[{param:'q',path:['q']},{param:'sort',path:['sort'],omit:'name'}];
		groups.forEach(function(g){
			if(g.kind==='range'){
				fields.push({param:'von',path:['filters',g.id,'min'],type:'number'},
					{param:'bis',path:['filters',g.id,'max'],type:'number'});
			}else{
				fields.push({param:g.id,path:['filters',g.id],type:g.kind==='single'?'text':'multi',omit:g.kind==='single'?'all':undefined});
			}
		});
		config.urlCodec=A.codec(fields,config.defaults);
		function matches(r,s,skip){return (!s.q||[r.name,r.id].join(' ').toLocaleLowerCase(lang).includes(s.q.toLocaleLowerCase(lang)))&&groups.every(function(g){if(skip===g.id){return true;}var v=s.filters[g.id];if(g.id==='level'){return (v.min===null&&v.max===null)||(r.level!==null&&(v.min===null||r.level>=v.min)&&(v.max===null||r.level<=v.max));}if(g.id==='status'){return v==='all'||(v==='done'?known.has(r.id):!known.has(r.id));}if(g.id==='reward'){return !v.length||v.some(function(x){return x==='points'?r.points>0:r.rewards.includes(x);});}return !v.length||v.includes(r[g.id]);});}
		var adapter=A.client({
			rows:rows,id:function(r){return r.id;},matches:matches,
			compare:function(a,b,sort){return (sort==='level'?(a.level||Infinity)-(b.level||Infinity):0)||a.name.localeCompare(b.name,lang)||a.id.localeCompare(b.id);},
			facets:function(all,s){
				var facets={};
				groups.filter(function(g){return g.options;}).forEach(function(g){
					facets[g.id]=g.options.map(function(o){
						var candidate=JSON.parse(JSON.stringify(s));candidate.filters[g.id]=g.kind==='single'?o.value:[o.value];
						return {value:o.value,count:all.filter(function(r){return matches(r,candidate);}).length};
					});
				});return facets;
			},
			renderResults:function(result,target){
				target.replaceChildren();
				var symbols=document.getElementById('related-list-symbols');
				var symbol=symbols&&JSON.parse(symbols.textContent)[kind];
				result.payload.forEach(function(r){
					var row=document.createElement('li'),a=document.createElement('a'),mark=document.createElement('span'),body=document.createElement('span'),meta=document.createElement('small');
					a.className='related-result';a.href='/'+lang+'/'+(kind==='d'?{de:'tat',en:'deed',fr:'prouesse'}:{de:'aufgabe',en:'quest',fr:'quete'})[lang]+'/'+r.id+'/';
					mark.className='related-symbol'+(known.has(r.id)?' fertig':'');
					if(known.has(r.id)){mark.textContent='✓';mark.setAttribute('aria-label',w[21]);}
					else if(symbol){
						// Only the server's established Lucide SVG, never game/user text.
						var template=document.createElement('template');template.innerHTML=symbol;mark.appendChild(template.content.cloneNode(true));
					}
					body.textContent=r.name;meta.textContent=[r.type,r.category,r.level?w[18]+' '+r.level:'',r.region,r.area].filter(Boolean).join(' · ');
					body.appendChild(meta);a.append(mark,body);row.appendChild(a);target.appendChild(row);
				});
			}
		});
		return {config:config,adapter:adapter};
	};
})();
