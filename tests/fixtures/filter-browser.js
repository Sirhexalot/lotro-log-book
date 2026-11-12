/* Synthetic public records shared by client/server browser adapter tests. */
(function (root) {
	'use strict';
	var A = root.MQL_FILTERADAPTER || require('../../web/filteradapter.js');
	var names = {
		de:['Suchen','Filter','Schließen','Sortierung','Zurücksetzen','Weitere anzeigen','%s Treffer','%s Treffer anzeigen','Lade …','Ergebnisse nicht aktualisiert.','Erneut versuchen','Als Seite öffnen','Ungültiger Stufenbereich','Von','Bis'],
		en:['Search','Filters','Close','Sort','Reset','Show more','%s results','Show %s results','Loading …','Results not updated.','Try again','Open page','Invalid level range','From','To'],
		fr:['Chercher','Filtres','Fermer','Tri','Réinitialiser','Afficher davantage','%s résultats','Afficher %s résultats','Chargement …','Résultats non actualisés.','Réessayer','Ouvrir la page','Plage de niveaux incorrecte','De','À']
	};
	var keys = ['search','filter','close','sort','reset','more','count','show','loading','error','retry','fallback','invalidRange','min','max'];
	var rows = [
		{id:'A',name:'Alpha',quality:'3',level:10}, {id:'B',name:'Beta',quality:'4',level:20},
		{id:'C',name:'Gamma',quality:'3',level:20}, {id:'D',name:'Delta',quality:'3',level:null},
		{id:'E',name:'Epsilon',quality:'4',level:30}
	];
	function make(lang,mode,origin) {
		var labels = {}; keys.forEach(function (k,i) { labels[k] = names[lang][i]; });
		var config = {
			area:mode==='server'?'sets':'gegenstaende',lang:lang,mode:mode,rootUrl:origin+'/'+lang+'/'+mode+'/',labels:labels,
			search:{submit:mode==='server'?'enter':'debounce',debounceMs:200},
			groups:[{id:'quality',kind:'multi',label:'Quality',options:[{value:'3',label:'Rare'},{value:'4',label:'Incomparable'}]},
				{id:'level',kind:'range',label:'Level',rangeLabel:function (r) { return 'Level '+r.min+'–'+r.max; }}],
			sort:{options:[{value:'name',label:'Name'},{value:'level',label:'Level'}],default:'name'},
			pagination:{kind:mode==='server'?'page':'limit',size:2},
			defaults:function () { return {q:'',filters:{quality:[],level:{min:null,max:null}},sort:'name',pagination:mode==='server'?{kind:'page',page:1}:{kind:'limit',limit:2}}; }
		};
		config.urlCodec = A.codec([
			{param:'q',path:['q']},{param:'quality',path:['filters','quality'],type:'multi'},
			{param:'from',path:['filters','level','min'],type:'number'}, {param:'to',path:['filters','level','max'],type:'number'},
			{param:'sort',path:['sort'],omit:'name'},
			{param:'page',path:['pagination','page'],type:'number',omit:1}
		].filter(function (f) { return mode==='server' || f.param!=='page'; }),config.defaults);
		var adapter = A.client({rows:rows.concat([rows[0]]),id:function (r) { return r.id; },size:2,
			matches:function (r,s,skip) {
				return (!s.q || r.name.toLowerCase().includes(s.q.toLowerCase())) &&
					(skip==='quality' || !s.filters.quality.length || s.filters.quality.includes(r.quality)) &&
					(skip==='level' || ((s.filters.level.min===null && s.filters.level.max===null) ||
						(r.level!==null && (s.filters.level.min===null || r.level>=s.filters.level.min) && (s.filters.level.max===null || r.level<=s.filters.level.max))));
			},
			compare:function (a,b,sort) { return (sort==='level' ? (a.level===null?Infinity:a.level)-(b.level===null?Infinity:b.level) : 0) || a.name.localeCompare(b.name); },
			facets:function (all,s) {
				var self=this;
				return {quality:['3','4'].map(function (v) { return {value:v,count:all.filter(function (r) { return r.quality===v && self.matches(r,s,'quality'); }).length}; })};
			},
			renderResults:function (r,target) {
				target.replaceChildren(); r.payload.forEach(function (row) { var li=document.createElement('p');li.dataset.id=row.id;li.textContent=row.name;target.appendChild(li); });
			}
		});
		return {config:config,adapter:adapter,rows:rows};
	}
	var api={make:make}; if(typeof module!=='undefined' && module.exports){module.exports=api;}else{root.FILTER_FIXTURE=api;}
})(typeof window!=='undefined'?window:globalThis);
