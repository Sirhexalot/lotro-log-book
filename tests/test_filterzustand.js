'use strict';
const assert = require('node:assert/strict');
const api = require('../web/filterzustand.js');
const config = {
	groups: [
		{id:'quality',kind:'multi',options:[{value:3,label:'Rare'},{value:4,label:'Incomparable'}]},
		{id:'level',kind:'range',rangeLabel:v => `Level ${v.min}–${v.max}`},
		{id:'tree',kind:'tree',pathLabel:p => p.art,validatePath:p => p && p.kat === 'ARMOUR' && ['LIGHT','HEAVY'].includes(p.art)}
	],
	sort:{options:[{value:'name'},{value:'itemLevel'}]},
	pagination:{size:50},
	defaults:() => ({q:'',filters:{quality:[],level:{min:null,max:null},tree:[]},sort:'name',pagination:{kind:'limit',limit:50}})
};
const initial = config.defaults();
let result = api.normalize(config,{filters:{quality:[4,3,3,99]}});
assert.deepEqual(result.state.filters.quality,[3,4]);
assert.deepEqual(initial,config.defaults());
result = api.reduce(config,initial,{type:'setRange',groupId:'level',value:{min:30,max:10}});
assert.deepEqual(result.state,initial);
assert.equal(result.notices[0].code,'invalid-range');
for (const invalid of [NaN,Infinity,-1,1.5,'10']) {
	assert.equal(api.normalize(config,{filters:{level:{min:invalid,max:null}}}).notices.length,1);
}
const paths = [{kat:'ARMOUR',art:'LIGHT'},{art:'LIGHT',kat:'ARMOUR'},{kat:'ARMOUR',art:'HEAVY'}];
assert.equal(api.normalize(config,{filters:{tree:paths}}).state.filters.tree.length,2);
let more = api.reduce(config,initial,{type:'more'}).state;
assert.equal(more.pagination.limit,100);
assert.equal(api.reduce(config,more,{type:'searchSubmit',value:'  Alpha  '}).state.pagination.limit,50);
assert.equal(api.reduce(config,more,{type:'searchSubmit',value:'  Alpha  '}).state.q,'Alpha');
assert.deepEqual(api.reduce(config,more,{type:'reset'}).state,initial);
assert.equal(api.normalize(config,{q:'😀'.repeat(201)}).state.q.length,400);
const selected = api.normalize(config,{filters:{quality:[3,4],tree:paths,level:{min:10,max:20}}}).state;
const chips = api.chips(config,selected);
assert.equal(chips.length,5);
assert.equal(api.reduce(config,selected,chips[0].action).state.filters.quality.length,1);
assert.equal(api.reduce(config,selected,chips[3].action).state.filters.tree.length,1);
// A nested leaf belongs to its own group through `groupId`; validation and
// chips must find it there, not only in the flat option list.
const nested = {
	groups: [
		{id:'region',kind:'multi',options:[{value:'r1',label:'Rohan',children:[
			{value:'a1',label:'Die Norhofen',groupId:'area'}]}]},
		{id:'area',kind:'multi',options:[]}
	],
	pagination:{size:50},
	defaults:() => ({q:'',filters:{region:[],area:[]},sort:'name',pagination:{kind:'limit',limit:50}})
};
assert.deepEqual(api.normalize(nested,{filters:{area:['a1']}}).state.filters.area,['a1']);
const nestedChips = api.chips(nested,{q:'',filters:{region:[],area:['a1']}});
assert.equal(nestedChips[0].label,'Die Norhofen');
// A single choice shows a chip for every value, including its neutral default;
// only a non-default chip can be removed.
const single = {
	groups: [{id:'status',kind:'single',options:[{value:'alle',label:'Alle'},{value:'offen',label:'Offen'}]}],
	pagination: {size:50},
	defaults: () => ({q:'',filters:{status:'alle'},sort:'name',pagination:{kind:'limit',limit:50}})
};
const atDefault = api.chips(single,{q:'',filters:{status:'alle'}});
assert.equal(atDefault.length,1);
assert.equal(atDefault[0].label,'Alle');
assert.equal(atDefault[0].isDefault,true);
const changed = api.chips(single,{q:'',filters:{status:'offen'}});
assert.equal(changed.length,1);
assert.equal(changed[0].isDefault,false);
assert.equal(api.reduce(single,{q:'',filters:{status:'offen'}},changed[0].action).state.filters.status,'alle');

config.urlCodec = {
	decode:url => ({state:{q:url.searchParams.get('q') || ''},explicit:url.searchParams.has('q')}),
	encode:(state,url) => { url.searchParams.set('q',state.q); return url; }
};
const url = new URL('https://example.test/de/items/?tracking=x#section');
assert.equal(api.decode(config,url).explicit,false);
assert.equal(api.decode(config,new URL('?q=',url)).explicit,true);
const encoded = api.encode(config,selected,url);
assert.equal(encoded.hash,'#section');
assert.equal(encoded.searchParams.get('tracking'),'x');
assert.equal(url.searchParams.has('q'),false);
config.urlCodec.encode = () => new URL('https://other.test/');
assert.throws(() => api.encode(config,selected,url),/preserve origin/);

// One top-level category at a time: a branch of another category replaces the
// previous one, while sibling branches of the same category stay OR-linked.
const rootConfig = {
	groups: [{id:'tree',kind:'tree',exclusiveRoot:'kat',pathLabel:p => p.art,
		validatePath:p => !!(p && p.kat)}],
	pagination: {size:50},
	defaults: () => ({q:'',filters:{tree:[]},sort:'name',pagination:{kind:'limit',limit:50}})
};
let rootState = rootConfig.defaults();
rootState = api.reduce(rootConfig,rootState,{type:'togglePath',groupId:'tree',path:{kat:'ARMOUR',art:'MEDIUM'}}).state;
rootState = api.reduce(rootConfig,rootState,{type:'togglePath',groupId:'tree',path:{kat:'WEAPON',art:'BOW'}}).state;
assert.equal(rootState.filters.tree.length,1);
assert.equal(rootState.filters.tree[0].kat,'WEAPON');
rootState = api.reduce(rootConfig,rootState,{type:'togglePath',groupId:'tree',path:{kat:'WEAPON',art:'SWORD'}}).state;
assert.equal(rootState.filters.tree.length,2,'sibling branches of one category stay OR-linked');
rootState = api.reduce(rootConfig,rootState,{type:'togglePath',groupId:'tree',path:{kat:'WEAPON'}}).state;
assert.equal(rootState.filters.tree.length,1,'a parent replaces its children');
assert.equal(rootState.filters.tree[0].art,undefined);

// Nested options keep one value per level in its own group (crafting category
// tree: bucket → base type → category). A chip names the exact category even
// when the tree shows only its qualifier.
const baum = {
	groups: [
		{id:'ziel',kind:'multi',options:[{value:'ruestung',label:'Rüstung',children:[
			{value:'leichte-ruestung',label:'Leichte Rüstung',groupId:'grund'}]}]},
		{id:'grund',kind:'multi',nestedOnly:true,options:[{value:'leichte-ruestung',label:'Leichte Rüstung',children:[
			{value:'Leichte Rüstung (Gilde)',label:'Gilde',chipLabel:'Leichte Rüstung (Gilde)',groupId:'kategorie'}]}]},
		{id:'kategorie',kind:'multi',nestedOnly:true,options:[
			{value:'Leichte Rüstung (Gilde)',label:'Gilde',chipLabel:'Leichte Rüstung (Gilde)'}]}
	],
	pagination: {size:50},
	defaults: () => ({q:'',filters:{ziel:[],grund:[],kategorie:[]},sort:'name',pagination:{kind:'limit',limit:50}})
};
const baumState = api.normalize(baum,{filters:{ziel:['ruestung'],grund:['leichte-ruestung'],
	kategorie:['Leichte Rüstung (Gilde)','Unbekannt']}}).state;
assert.deepEqual(baumState.filters.ziel,['ruestung']);
assert.deepEqual(baumState.filters.grund,['leichte-ruestung']);
assert.deepEqual(baumState.filters.kategorie,['Leichte Rüstung (Gilde)']);
assert.deepEqual(api.chips(baum,baumState).map(chip => chip.label),
	['Rüstung','Leichte Rüstung','Leichte Rüstung (Gilde)']);
const ohneBlatt = api.reduce(baum,baumState,api.chips(baum,baumState)[2].action).state;
assert.deepEqual(ohneBlatt.filters.kategorie,[]);

// Sorting by column carries a key and a direction; a select sends only the key.
const directed = {
	groups: [],
	sort: {keys:['name','level'], ersteRichtung:{level:'desc'}},
	pagination: {size:50},
	defaults: () => ({q:'',filters:{},sort:'name',sortDir:'asc',pagination:{kind:'limit',limit:50}})
};
let sorted = api.normalize(directed,{});
assert.deepEqual([sorted.state.sort,sorted.state.sortDir],['name','asc']);
sorted = api.reduce(directed,sorted.state,{type:'sortToggle',key:'level'});
assert.deepEqual([sorted.state.sort,sorted.state.sortDir],['level','desc']);
sorted = api.reduce(directed,sorted.state,{type:'sortToggle',key:'level'});
assert.deepEqual([sorted.state.sort,sorted.state.sortDir],['level','asc']);
sorted = api.reduce(directed,sorted.state,{type:'sortToggle',key:'name'});
assert.deepEqual([sorted.state.sort,sorted.state.sortDir],['name','asc']);
assert.equal(api.normalize(directed,{sort:'unbekannt',sortDir:'desc'}).state.sort,'name');
assert.equal(api.normalize(directed,{sort:'level',sortDir:'desc'}).state.sortDir,'desc');
assert.equal(api.normalize(directed,{sort:'level',sortDir:'quer'}).state.sortDir,'asc');
assert.throws(() => api.reduce(directed,sorted.state,{type:'sortToggle',key:'rarity'}));
assert.equal(api.reduce(directed,sorted.state,{type:'sort',value:'level'}).state.sortDir,'asc');
assert.equal(api.reduce(directed,sorted.state,{type:'sort',value:{key:'level',dir:'desc'}}).state.sortDir,'desc');
// A list without column sorting keeps its old state shape (no direction field).
assert.equal('sortDir' in api.normalize(config,{}).state,false);

console.log('Filter state: normalization, validation, branch deduplication, reset and pagination passed.');
