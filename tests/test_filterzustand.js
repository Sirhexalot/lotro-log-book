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
console.log('Filter state: normalization, validation, branch deduplication, reset and pagination passed.');
