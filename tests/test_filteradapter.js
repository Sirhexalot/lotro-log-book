'use strict';
const assert=require('node:assert/strict'), vm=require('node:vm'),fs=require('node:fs');
const adapters=require('../web/filteradapter.js');
const defaults=()=>({q:'',filters:{classes:[],range:{min:null,max:null},only:false},sort:'name',pagination:{kind:'page',page:1}});
const codec=adapters.codec([
	{param:'q',path:['q']}, {param:'class',path:['filters','classes'],type:'multi'},
	{param:'from',path:['filters','range','min'],type:'number'}, {param:'to',path:['filters','range','max'],type:'number'},
	{param:'only',path:['filters','only'],type:'boolean'}, {param:'page',path:['pagination','page'],type:'number',omit:1}
],defaults,['#recipes']);
assert.deepEqual(codec.decode(new URL('https://test/de/set/?class[0]=HUNTER&class[1]=GUARDIAN')).state.filters.classes,['HUNTER','GUARDIAN']);
assert.deepEqual(codec.decode(new URL('https://test/de/set/?class[]=HUNTER&class[]=GUARDIAN')).state.filters.classes,['HUNTER','GUARDIAN']);
assert.equal(codec.decode(new URL('https://test/de/set/?q=')).explicit,true);
assert.equal(codec.decode(new URL('https://test/de/set/?tracking=foo')).explicit,false);
assert.equal(codec.decode(new URL('https://test/de/set/#recipes')).explicit,true);
const source=new URL('https://test/de/set/?tracking=foo&class[0]=OLD#recipes');
const state=defaults();state.filters.classes=['HUNTER'];state.filters.range.min=20;state.filters.only=true;
const encoded=codec.encode(state,new URL(source));
assert.equal(encoded.searchParams.has('class[0]'),false);
assert.deepEqual(codec.decode(encoded).state,state);
assert.equal(encoded.searchParams.get('tracking'),'foo');
assert.equal(encoded.hash,'#recipes');
assert.equal(Number.isNaN(codec.decode(new URL('https://test/?from=20oops')).state.filters.range.min),true);
// Persistence versioning keeps old read() consumers working without migration writes.
const store=new Map(), sandbox={window:{localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)}}};
vm.runInNewContext(fs.readFileSync(require.resolve('../web/filtergedaechtnis.js'),'utf8'),sandbox);
const memory=sandbox.window.MQL_FILTER;
store.set(memory.key('sets','de'),JSON.stringify({q:'class[]=HUNTER'}));
assert.equal(memory.readState('sets','de').version,1);
memory.write('sets','de','q=bow');
assert.equal(JSON.parse(store.get(memory.key('sets','de'))).v,2);
assert.equal(memory.read('sets','de'),'q=bow');
assert.equal(memory.readState('fraktion','de'),null);
assert.equal(memory.readState('sets','en'),null);
store.set(memory.key('sets','de'),JSON.stringify({v:99,q:'bad'}));
assert.equal(memory.readState('sets','de'),null);
memory.clear('sets','de');assert.equal(memory.read('sets','de'),'');
assert.throws(()=>memory.readState('','de'),/area/);
sandbox.window.localStorage.getItem=()=>{throw Error('blocked');};
assert.equal(memory.readState('sets','de'),null);
(async()=>{
	const adapter=adapters.client({rows:[{id:1},{id:1},{id:2}],id:r=>r.id,size:1,matches:()=>true,compare:(a,b)=>a.id-b.id,facets:()=>({}),renderResults:()=>{}});
	const result=await adapter.load({pagination:{kind:'page',page:99}},{});
	assert.equal(result.total,2);assert.equal(result.pagination.page,2);assert.equal(result.payload[0].id,2);
	const abort=new AbortController();abort.abort();
	await assert.rejects(adapter.load({pagination:{kind:'limit',limit:1}},{signal:abort.signal}),{name:'AbortError'});
	console.log('Filter adapters/codecs/persistence passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
