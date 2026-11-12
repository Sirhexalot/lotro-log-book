/* Real PHP reference adapters. Start local PHP server, set LLB_FILTER_PHP. */
'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const base=process.env.LLB_FILTER_PHP || 'http://127.0.0.1:8927';
(async()=>{
	const browser=await chromium.launch();
	try {
		for(const [lang,item,set] of [['de','gegenstandssuche','set'],['en','item-search','set'],['fr','recherche-objets','ensemble']]){
			const context=await browser.newContext(),page=await context.newPage(),errors=[];
			page.on('pageerror',e=>errors.push(String(e)));
			for(const kind of [item,set]){
				await page.goto(base+'/'+lang+'/'+kind+'/',{waitUntil:'domcontentloaded'});
				await page.waitForSelector('.filter-ui');
				await page.waitForFunction(()=>!document.querySelector('[data-filter-results]').hasAttribute('aria-busy'));
				assert.equal(await page.locator('.filter-error').isVisible(),false);
				for(const width of [390,901,1440]){
					await page.setViewportSize({width,height:900});
					assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
				}
				if(kind===set){
					const before=await page.locator('.filter-result-toolbar').innerText();
					await page.locator('.filter-panel input[type=checkbox]').first().check();
					await page.waitForFunction(()=>!document.querySelector('[data-filter-results]').hasAttribute('aria-busy'));
					assert.equal(await page.locator('.filter-error').isVisible(),false);
					assert.notEqual(await page.locator('.filter-result-toolbar').innerText(),before);
					await page.reload();await page.waitForSelector('.filter-ui');
					await page.waitForFunction(()=>!document.querySelector('[data-filter-results]').hasAttribute('aria-busy'));
					assert.equal(await page.locator('.filter-panel input:checked').count(),1);
				}
				await page.setViewportSize({width:390,height:844});await page.locator('.filter-open').click();
				await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('dialog').open);
			}
			assert.deepEqual(errors,[]);await context.close();console.log(lang+': PHP items/sets, filters, reload, responsive shell and dialog passed');
		}
		const context=await browser.newContext({javaScriptEnabled:false}),page=await context.newPage();
		await page.goto(base+'/de/set/');assert.equal(await page.locator('.sets-form').isVisible(),true);
		await page.locator('#set-query').fill('Gondor');await page.locator('.sets-search button').click();
		await page.waitForURL('**/*q=Gondor*');assert.ok(await page.locator('.sets-list li').count());await context.close();
	}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
