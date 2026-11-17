/* Real local PHP rollout: server catalogues and all three crafting tabs. */
'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const base=process.env.LLB_FILTER_PHP || 'http://127.0.0.1:8927';
const routes={de:['auftraggeber','landmarke','fraktion','instanz','handwerk/rezepte'],en:['quest-giver','landmark','faction','instance','crafting/recipes'],fr:['donneur-de-quete','site','faction','instance','artisanat/recettes']};
async function ready(p){await p.waitForSelector('.filter-ui');await p.waitForFunction(()=>document.querySelector('.filter-ui [data-filter-results]')&&!document.querySelector('.filter-ui [data-filter-results]').hasAttribute('aria-busy'));}
(async()=>{
	const browser=await chromium.launch();let pages=0;
	try{
		for(const lang of Object.keys(routes)){
			for(const route of routes[lang].slice(0,4)){
				const context=await browser.newContext(),p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(String(e)));
				await p.goto(base+'/'+lang+'/'+route+'/',{waitUntil:'domcontentloaded'});await ready(p);
				assert.equal(await p.locator('.filter-error').isVisible(),false);
				for(const width of [360,390,768,901,1440]){await p.setViewportSize({width,height:900});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
				await p.locator('.filter-panel input[type=checkbox]:visible').first().check();await ready(p);
				assert.equal(await p.locator('.filter-error').isVisible(),false);assert.ok(await p.locator('.filter-chips button').count());
				const selected=await p.evaluate(()=>MQL_SERVER_FILTER.getState().filters);
				await p.reload();await ready(p);assert.deepEqual(await p.evaluate(()=>MQL_SERVER_FILTER.getState().filters),selected);
				await p.locator('.filter-panel > button').click();await ready(p);assert.equal(await p.locator('.filter-chips button').count(),0);
				await p.evaluate(()=>MQL_SERVER_FILTER.dispatch({type:'searchSubmit',value:'zzzz-no-match'}));await ready(p);
				assert.equal(await p.locator('.filter-error').isVisible(),false);
				assert.equal(await p.evaluate(()=>MQL_SERVER_FILTER.getState().q),'zzzz-no-match');
				await p.goBack();await p.waitForFunction(()=>MQL_SERVER_FILTER.getState().q==='');await ready(p);
				await p.goForward();await p.waitForFunction(()=>MQL_SERVER_FILTER.getState().q==='zzzz-no-match');await ready(p);
				await p.locator('.filter-panel > button').click();await ready(p);
				if(route===routes[lang][0]||route===routes[lang][1]||route===routes[lang][2]){
					const branch=p.locator('.filter-branch').first();
					if(await branch.count()){
						await branch.locator(':scope > summary > svg').click();
						const child=branch.locator('input').filter({visible:true}).nth(1);
						if(await child.count()){await child.check();await ready(p);assert.equal((await p.evaluate(()=>MQL_SERVER_FILTER.getState())).filters.area.length,1);}
					}
				}
				await p.setViewportSize({width:390,height:844});await p.locator('.filter-open').click();await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.querySelector('dialog').open);
				assert.deepEqual(errors,[]);await context.close();pages++;
				const nojs=await browser.newContext({javaScriptEnabled:false}),plain=await nojs.newPage();await plain.goto(base+'/'+lang+'/'+route+'/');
				await plain.locator('.sets-search input').fill('zzzz-no-match');await plain.locator('.sets-search button').click();await plain.waitForURL('**/*q=zzzz-no-match*');
				assert.equal(await plain.locator('.sets-browser').getAttribute('data-filter-total'),'0');await nojs.close();
			}
			const context=await browser.newContext(),p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(String(e)));
			await p.goto(base+'/'+lang+'/'+routes[lang][4]+'/',{waitUntil:'domcontentloaded'});await ready(p);
			for(const tab of ['rezepte','rohstoffe','berufe']){
				await p.locator('[data-hw="'+tab+'"]').click();await p.waitForFunction(t=>location.hash==='#'+t,tab);await ready(p);
				assert.equal(await p.locator('.filter-ui').count(),1);
				if(tab==='rohstoffe'){
					const resourceGroups=await p.evaluate(()=>MQL_CRAFT_FILTER.config.groups.map(g=>g.id));
					assert.ok(resourceGroups.includes('aktuell'),'resource filter has current-tier limit');
					assert.ok(resourceGroups.includes('gemeistert'),'resource filter has mastered-tier exclusion');
				}
				for(const width of [390,901,1440]){await p.setViewportSize({width,height:900});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
				await p.locator('.filter-panel input[type=checkbox]').first().check();await ready(p);assert.ok(await p.locator('.filter-chips button').count());
				const selected=await p.evaluate(()=>MQL_CRAFT_FILTER.getState().filters);
				await p.reload();await ready(p);assert.equal(new URL(p.url()).hash,'#'+tab);assert.deepEqual(await p.evaluate(()=>MQL_CRAFT_FILTER.getState().filters),selected);
				await p.setViewportSize({width:390,height:844});await p.locator('.filter-open').click();await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.querySelector('dialog').open);
				pages++;
			}
			assert.deepEqual(errors,[]);await context.close();console.log(lang+': server catalogues + crafting tabs passed');
		}
		// Legacy positive recipe knowledge is retained without inventing negatives.
		const context=await browser.newContext(),p=await context.newPage();
		await p.goto(base+'/de/handwerk/rezepte/',{waitUntil:'domcontentloaded'});await ready(p);
		await p.evaluate(()=>{
			const recipe=MQL_REZEPTE.r.find(r=>r[9]==='COOK');
			localStorage.setItem('mql.charaktere',JSON.stringify({aktiv:'T|T|T',liste:{'T|T|T':{key:'T|T|T',name:'Test',server:'T',quests:[],deeds:[],rezepte:[recipe[10]],handwerk:{COOK:[[1,1,0,0,0]]}}}}));
		});
		await p.goto(base+'/de/handwerk/rezepte/?eigene=1#rezepte',{waitUntil:'domcontentloaded'});await ready(p);
		assert.equal(await p.evaluate(()=>MQL_CRAFT_FILTER.getState().filters.eigene),true);
		assert.equal(await p.locator('.filter-panel input').evaluateAll(ns=>ns.some(n=>n.dataset.filterKey==='lernstand:"nicht-gelernt"')),false);
		await p.evaluate(()=>MQL_CRAFT_FILTER.dispatch({type:'setValues',groupId:'eigene',value:false}));
		await p.reload();await ready(p);assert.equal(await p.evaluate(()=>MQL_CRAFT_FILTER.getState().filters.eigene),false);
		await context.close();
		console.log(pages+' real-page/tab combinations passed, plus no-JS server search.');
	}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
