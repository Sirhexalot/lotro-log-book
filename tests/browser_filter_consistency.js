/* Isolated synthetic browser suite. Starts/stops its own HTTP fixture server.
 * NODE_PATH=/opt/homebrew/lib/node_modules node tests/browser_filter_consistency.js
 * No production character storage, hosting or generated catalogue is touched. */
'use strict';
const http=require('node:http'), fs=require('node:fs'), path=require('node:path'), os=require('node:os'), assert=require('node:assert/strict');
const {chromium}=require('playwright');
const fixtures=require('./fixtures/filter-browser.js');
const core=require('../web/filterzustand.js');
const root=path.resolve(__dirname,'..');
let origin, browser, faults={mode:'',delay:0}, requests=[];
const artifacts=process.env.LLB_FILTER_ARTIFACTS || path.join(os.homedir(),'.cache','llb-filter-browser-tests');
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const server=http.createServer(async(req,res)=>{
	try {
		const url=new URL(req.url,origin);
		if(url.pathname.startsWith('/web/') || url.pathname==='/tests/fixtures/filter-browser.js'){
			const file=path.join(root,url.pathname); res.setHeader('Content-Type',file.endsWith('.css')?'text/css':'application/javascript');res.end(fs.readFileSync(file));return;
		}
		const [,lang,mode]=url.pathname.split('/');
		if(!['de','en','fr'].includes(lang)){res.writeHead(404);res.end();return;}
		const fixture=fixtures.make(lang,mode,origin), parsed=core.decode(fixture.config,url);
		const result=await fixture.adapter.load(parsed.state,{});
		const fragment=result.payload.map(r=>`<p data-id="${r.id}">${r.name}</p>`).join('')+
			(result.pagination.hasMore && mode==='server'?`<a data-filter-page="${result.pagination.page+1}" href="?page=${result.pagination.page+1}">Next</a>`:'');
		delete result.payload;
		requests.push(url.search);
		if(faults.delay){await new Promise(r=>setTimeout(r,faults.delay));}
		if(faults.mode==='http'){res.writeHead(500);res.end('error');return;}
		let model=JSON.stringify(result).replaceAll('<','\\u003c');
		if(faults.mode==='model'){model='{}';}
		const area=faults.mode==='area'?'wrong':fixture.config.area;
		res.setHeader('Content-Type','text/html');
		res.end(`<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="/web/filter-ui.css"><link rel="canonical" href="${escape(url.href)}"><style>body{background:#15202f;color:#eee;font:16px Verdana;margin:12px}*{box-sizing:border-box}</style></head><body>
		<main data-filter-area="${area}" data-filter-schema="1"><form data-filter-fallback method="get"><input name="q"><button>Search</button></form><section data-filter-results>${fragment}</section><script type="application/json" data-filter-model>${model}</script></main>
		<script src="/web/filterzustand.js"></script><script src="/web/filtergedaechtnis.js"></script><script src="/web/filteradapter.js"></script><script src="/web/filter-ui.js"></script><script src="/tests/fixtures/filter-browser.js"></script>
		<script>var f=FILTER_FIXTURE.make('${lang}','${mode}',location.origin);if('${mode}'==='server'){f.adapter=MQL_FILTERADAPTER.server({url:f.config.rootUrl,codec:f.config.urlCodec,area:f.config.area});}window.controller=MQL_FILTER_UI.mount(document.querySelector('main'),{config:f.config,adapter:f.adapter});window.fixture=f;</script></body></html>`);
	}catch(e){res.writeHead(500);res.end(String(e));}
});
async function settled(page){await page.waitForFunction(()=>document.querySelector('[data-filter-results]')?.getAttribute('aria-busy')!=='true' && !!window.controller);}
async function total(page,n){await page.waitForFunction(n=>document.querySelector('.filter-result-toolbar [role=status]')?.textContent.includes(String(n)),n);}
(async()=>{
	await new Promise(r=>server.listen(0,'127.0.0.1',r));origin='http://127.0.0.1:'+server.address().port;
	browser=await chromium.launch();let checks=0;
	for(const lang of ['de','en','fr'])for(const mode of ['client','server']){
		const context=await browser.newContext(), page=await context.newPage(), errors=[];page.on('pageerror',e=>errors.push(String(e)));
		await page.goto(origin+'/'+lang+'/'+mode+'/');await settled(page);await total(page,5);
		// Client deduplication; overall count never equals only visible page size.
		assert.equal(await page.locator('[data-filter-results] p').count(),2);
		await page.locator('.filter-panel input[type=checkbox]').first().check();await total(page,3);
		assert.equal((await page.evaluate(()=>controller.getState())).filters.quality.length,1);
		await page.locator('.filter-panel input[type=checkbox]').nth(1).check();await total(page,5);
		await page.locator('.filter-chips button').first().click();await total(page,2);
		await page.locator('.filter-panel > button').click();await total(page,5);
		await page.evaluate(()=>controller.dispatch({type:'setRange',groupId:'level',value:{min:20,max:30}}));await total(page,3);
		await page.evaluate(()=>controller.dispatch({type:'setRange',groupId:'level',value:{min:30,max:10}}));
		assert.equal(await page.locator('.filter-error').isVisible(),true);
		assert.equal((await page.evaluate(()=>controller.getState())).filters.level.min,20);
		await page.locator('.filter-panel > button').click();await total(page,5);
		// Reload restores selection and explicit empty query defeats memory.
		await page.locator('.filter-panel input[type=checkbox]').first().check();await total(page,3);
		await page.reload();await settled(page);await total(page,3);
		await page.goto(origin+'/'+lang+'/'+mode+'/?q=');await settled(page);await total(page,5);
		await page.evaluate(()=>localStorage.setItem('mql.filter.auftraggeber.'+document.documentElement.lang,JSON.stringify({q:'q=foreign'})));
		await page.reload();await settled(page);await total(page,5);
		for(const width of [360,390,430,768,900,901,1000,1001,1280,1440]){
			await page.setViewportSize({width,height:844});
			assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
			if(width<=900){
				await page.locator('.filter-open').click();await page.waitForFunction(()=>document.querySelector('dialog').open);
				await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('dialog').open);
				assert.equal(await page.locator('.filter-open').evaluate(n=>document.activeElement===n),true);
			}
			checks++;
		}
		await page.setViewportSize({width:390,height:844});
		await page.locator('.filter-open').click();
		await page.locator('dialog input[type=checkbox]').first().check();await total(page,3);
		await page.goBack();await page.waitForFunction(()=>!document.querySelector('dialog').open);await total(page,3);
		await page.goBack();await total(page,5);
		await page.goForward();await total(page,3);assert.equal(await page.locator('dialog').evaluate(n=>n.open),false);
		// Real keyboard focus remains inside the modal, body scroll is restored.
		await page.locator('.filter-open').click();
		for(let tab=0;tab<15;tab++){
			await page.keyboard.press('Tab');
			assert.equal(await page.evaluate(()=>document.querySelector('dialog').contains(document.activeElement)),true);
		}
		assert.equal(await page.evaluate(()=>document.body.style.overflow),'hidden');
		await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('dialog').open);
		assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
		await page.setViewportSize({width:844,height:390});
		await page.locator('.filter-open').click();
		assert.equal(await page.locator('dialog footer button').isVisible(),true);
		if(lang==='de'){
			fs.mkdirSync(artifacts,{recursive:true});
			await page.screenshot({path:path.join(artifacts,mode+'-landscape.png')});
		}
		await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('dialog').open);
		await page.setViewportSize({width:1280,height:900});
		if(lang==='de'){await page.screenshot({path:path.join(artifacts,mode+'-desktop.png')});}
		// No duplicate listeners or remounts after repeated rendering.
		await page.evaluate(()=>{window.changes=0;document.querySelector('main').addEventListener('mql:filterchange',()=>window.changes++);});
		for(let i=0;i<10;i++)await page.evaluate(()=>controller.dispatch({type:'reset'}));
		assert.equal(await page.evaluate(()=>window.changes),10);
		assert.equal(await page.evaluate(()=>MQL_FILTER_UI.mount(document.querySelector('main'),{config:fixture.config,adapter:fixture.adapter})===controller),true);
		if(mode==='server'){
			for(const fault of ['http','model','area']){
				faults.mode=fault;
				await page.evaluate(()=>controller.dispatch({type:'searchSubmit',value:'Alpha'}));
				assert.equal(await page.locator('.filter-error').isVisible(),true);
				assert.ok(await page.locator('[data-filter-results] p').count());
				faults.mode='';await page.locator('.filter-error button').click();await settled(page);
			}
			assert.ok(requests.every(q=>!q.includes('character')));
			// Older response must not replace a newer result even if cancellation races.
			await page.route('**/'+lang+'/server/**',async route=>{
				if(new URL(route.request().url()).searchParams.get('q')==='Slow'){
					const response=await route.fetch();await new Promise(r=>setTimeout(r,250));
					await route.fulfill({response}).catch(()=>{});
				}else await route.continue();
			});
			await page.evaluate(async()=>{
				const slow=controller.dispatch({type:'searchSubmit',value:'Slow'});
				await controller.dispatch({type:'searchSubmit',value:'Gamma'});await slow;
			});
			await total(page,1);assert.equal(await page.locator('[data-filter-results] p').innerText(),'Gamma');
			await page.unrouteAll({behavior:'wait'});
		}
		// Destroy while a dialog is open removes its UI-history marker and restores fallback.
		await page.setViewportSize({width:390,height:844});await page.locator('.filter-open').click();
		await page.evaluate(()=>controller.destroy());
		assert.equal(await page.locator('.filter-ui').count(),0);
		assert.equal(await page.locator('[data-filter-fallback]').isVisible(),true);
		assert.equal(await page.evaluate(()=>Boolean(history.state?.mqlFilterDialog)),false);
		await page.evaluate(()=>{window.controller=MQL_FILTER_UI.mount(document.querySelector('main'),{config:fixture.config,adapter:fixture.adapter});return controller.ready;});
		assert.equal(await page.locator('.filter-ui').count(),1);
		assert.deepEqual(errors,[]);await context.close();
	}
	const nojs=await browser.newContext({javaScriptEnabled:false}), p=await nojs.newPage();
	await p.goto(origin+'/de/server/');assert.equal(await p.locator('[data-filter-fallback]').isVisible(),true);
	await p.locator('[data-filter-fallback] input').fill('Alpha');await p.locator('[data-filter-fallback] button').click();
	await p.waitForURL('**/?q=Alpha');assert.equal(await p.locator('[data-filter-results] p').innerText(),'Alpha');
	await nojs.close();
	console.log(`Shared filter browser suite passed: DE/EN/FR, client/server, ${checks} viewport combinations, dialog/history, filters/reset/URLs and transport errors.`);
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.close();});
