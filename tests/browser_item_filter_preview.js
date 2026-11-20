/* Real-index visual/layout regression. Run tools/filter_vorschau.py first. */
'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.LLB_ITEM_PREVIEW || 'http://127.0.0.1:8924';
(async()=>{
	const browser=await chromium.launch();
	try {
		for(const lang of ['de','en','fr']) {
			const context=await browser.newContext(), page=await context.newPage();
			const errors=[];page.on('pageerror',e=>errors.push(String(e)));
			await page.goto(base+'/gegenstaende.html?lang='+lang,{waitUntil:'domcontentloaded'});
			await page.waitForFunction(()=>window.MQL_ITEM_FILTER&&!document.querySelector('[data-filter-results]').hasAttribute('aria-busy'));
			for(const width of [390,768,901,1280,1440]) {
				await page.setViewportSize({width,height:900});
				assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
				assert.equal(await page.locator('.filter-result-toolbar select').evaluate(n=>{const r=n.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;}),true);
			}
			// Each category occurs exactly once; no duplicate checkbox + expansion caption.
			assert.equal(await page.locator('.filter-panel').evaluate(n=>{
				const cat=n.querySelector('details');
				return Array.from(cat.querySelectorAll(':scope > details > summary')).every(s=>s.querySelectorAll('label').length===1);
			}),true);
			assert.equal(await page.locator('#gs-ergebnis .gs-name').count(),50);
			assert.equal(await page.locator('#gs-ergebnis .gs-meta').count(),50);
			assert.equal(await page.locator('#gs-ergebnis .symbol').count(),50);
			if(lang==='de') {
				const longName=page.locator('.filter-option>span').filter({hasText:/^Legendärer Gegenstand$/});
				assert.equal(await longName.evaluate(n=>n.getBoundingClientRect().height<=parseFloat(getComputedStyle(n).lineHeight)+1),true);
			}
			assert.equal(await page.locator('.filter-group-heading').first().evaluate(n=>getComputedStyle(n).backgroundColor==='rgba(0, 0, 0, 0)'&&getComputedStyle(n.parentElement).borderTopStyle==='solid'),true);
			// Content geometry, not merely presence/overflow: same axes across groups.
			assert.deepEqual(await page.evaluate(()=>{
				const failures=[], rect=n=>n.getBoundingClientRect(), near=(a,b)=>Math.abs(a-b)<=1;
				const visible=n=>n.checkVisibility();
				const rows=Array.from(document.querySelectorAll('.filter-option')).filter(n=>visible(n)&&n.style.getPropertyValue('--depth')==='0');
				const reference=rows[0];
				for(const row of rows){
					for(const selector of ['input','span','small']){
						const a=rect(row.querySelector(selector)),b=rect(reference.querySelector(selector));
						if(!near(selector==='small'?a.right:a.left,selector==='small'?b.right:b.left)){failures.push('column '+selector);}
					}
					const input=rect(row.querySelector('input')),text=rect(row.querySelector('span'));
					if(!near(input.y+input.height/2,text.y+text.height/2)){failures.push('checkbox center');}
					const summary=row.closest('summary');
					if(summary){const arrow=rect(summary.querySelector('svg'));if(!near(arrow.y+arrow.height/2,input.y+input.height/2)){failures.push('arrow center');}}
				}
				const first=document.querySelector('#gs-ergebnis li'), title=rect(first.querySelector('.gs-name')),meta=rect(first.querySelector('.gs-meta'));
				const list=rect(document.querySelector('.filter-results-home')),header=rect(document.querySelector('.filter-result-header'));
				if(!near(title.left,meta.left)){failures.push('result text');}
				if(!near(list.top-header.bottom,16)){failures.push('result gap');}
				if(!near(rect(document.querySelector('.filter-result-toolbar')).left,list.left)){failures.push('count edge');}
				// Deliberately wrap a label: controls stay on its first text line.
				const span=reference.querySelector('span'),original=span.textContent;
				span.textContent='Ein sehr langer mehrzeiliger Filtername für die Ausrichtungsprüfung';
				window.dispatchEvent(new Event('resize'));
				const c=rect(reference.querySelector('input')),range=document.createRange();
				range.selectNodeContents(span);
				const firstLine=range.getClientRects()[0];
				if(!reference.classList.contains('filter-option-wrapped')||!near(c.y+c.height/2,firstLine.y+firstLine.height/2)){failures.push('multiline first-line alignment');}
				span.textContent=original;window.dispatchEvent(new Event('resize'));
				return failures;
			}),[]);
			// Facet optimization must preserve the independent category counts.
			assert.equal(await page.evaluate(()=>{
				const rows=MQL_GEGENSTAENDE.e;
				const labels=Array.from(document.querySelectorAll('.filter-panel>div>details:first-child input[type=checkbox]'));
				return MQL_GEGENSTAENDE.kat.every((name,i)=>{
					const input=labels.find(n=>n.dataset.filterKey==='tree:'+JSON.stringify({kat:MQL_GEGENSTAENDE.katKey[i]}));
					return input && input.closest('label').querySelector('small').textContent===rows.filter(r=>r[3]===i).length.toLocaleString(document.documentElement.lang);
				});
			}),true);
			await page.setViewportSize({width:390,height:844});await page.locator('.filter-open').click();
			await page.locator('dialog input[type=checkbox]').first().check();
			await page.waitForFunction(()=>!document.querySelector('[data-filter-results]').hasAttribute('aria-busy'));
			assert.equal((await page.evaluate(()=>MQL_ITEM_FILTER.getState())).filters.tree.length,1);
			await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('dialog').open);
			assert.deepEqual(errors,[]);await context.close();
			console.log(lang+': real item index, layout, unique categories, result metadata and mobile selection passed');
		}
	} finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
