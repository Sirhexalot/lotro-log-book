'use strict';
const{chromium}=require('playwright'),assert=require('node:assert/strict');
const base=process.env.LLB_FILTER_PHP||'http://127.0.0.1:8927';
async function ready(p){await p.waitForSelector('.filter-ui');await p.waitForFunction(()=>!document.querySelector('.filter-ui [data-filter-results]').hasAttribute('aria-busy'));}
(async()=>{const b=await chromium.launch();try{
	for(const [lang,set,craft]of[['de','set','handwerk/rezepte'],['en','set','crafting/recipes'],['fr','ensemble','artisanat/recettes']]){
		const context=await b.newContext(),p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(String(e)));
		await p.goto(base+'/'+lang+'/'+set+'/',{waitUntil:'domcontentloaded'});await ready(p);
		const armour=await p.evaluate(()=>MQL_SERVER_FILTER.config.groups.find(g=>g.id==='armour').options[0].value);
		await p.evaluate(()=>MQL_SERVER_FILTER.dispatch({type:'setValues',groupId:'category',value:['WEAPON']}));await ready(p);
		assert.equal(await p.locator('.filter-group[data-key=armour]').count(),0,'Empty armour group must disappear');
		await p.evaluate(v=>MQL_SERVER_FILTER.dispatch({type:'setValues',groupId:'armour',value:[v]}),armour);await ready(p);
		assert.equal(await p.locator('.filter-group[data-key=armour]').count(),1,'Active zero-result group stays removable');
		await p.goto(base+'/'+lang+'/'+craft+'/#rohstoffe',{waitUntil:'domcontentloaded'});await ready(p);
		assert.ok(await p.evaluate(()=>MQL_CRAFT_FILTER.config.groups.find(g=>g.id==='region').options.length>1));
		await p.evaluate(()=>MQL_CRAFT_FILTER.dispatch({type:'setValues',groupId:'quelle',value:['gather']}));await ready(p);
		const branch=p.locator('.filter-group[data-key=region]>.filter-branch').first();
		await branch.locator(':scope>summary>.filter-arrow').click();
		const landscape=branch.locator(':scope>.filter-branch').first();
		assert.equal(await landscape.locator(':scope>summary input').isVisible(),true);
		await landscape.locator(':scope>summary input').check();await ready(p);
		assert.equal((await p.evaluate(()=>MQL_CRAFT_FILTER.getState())).filters.landschaft.length,1);
		await p.reload();await ready(p);assert.equal((await p.evaluate(()=>MQL_CRAFT_FILTER.getState())).filters.landschaft.length,1);
		await p.setViewportSize({width:390,height:844});await p.locator('.filter-open').click();
		assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
		assert.deepEqual(errors,[]);await context.close();console.log(lang+': empty-group retention and region/landscape hierarchy passed');
	}
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
