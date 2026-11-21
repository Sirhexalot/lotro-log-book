'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const base=process.env.LLB_TERRAIN_PHP||'http://127.0.0.1:8847';
const output=path.join(os.homedir(),'.cache/llb-terrain/browser');fs.mkdirSync(output,{recursive:true});
async function ready(page){
  await page.waitForFunction(()=>document.querySelector('#kartenansicht')&&!document.querySelector('#kartenansicht').hidden);
  await page.waitForFunction(()=>document.querySelector('#welt').dataset.karte);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}
async function open(page,lang,route,id){
  await page.goto(`${base}/${lang}/${route}/?vorkarte=${id}`,{waitUntil:'networkidle'});
  await ready(page);
  await page.waitForFunction(wanted=>document.querySelector('#welt')?.dataset.karte===String(wanted),id);
}
async function mode(page){return page.locator('#welt').getAttribute('data-kartenansicht');}
(async()=>{
  const browser=await chromium.launch();const results=[];
  try{
    for(const [lang,route] of [['de','karte'],['en','map'],['fr','carte']]){
      for(const width of [1440,390]){
        const context=await browser.newContext({viewport:{width,height:1000}}),p=await context.newPage(),errors=[];
        await context.addInitScript(()=>{
          if(sessionStorage.getItem('browser-test-seeded'))return;
          sessionStorage.setItem('browser-test-seeded','yes');
          localStorage.setItem('mql.kartenansicht','gelaende');
          localStorage.setItem('mql.vorkommen','{"wahl":{"PROSPECTOR":"*"}}');
          localStorage.setItem('mql.notizen','{"kept":true}');
          localStorage.setItem('mql.charaktere','{"kept":true}');
        });
        p.on('pageerror',e=>errors.push(e.message));
        p.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push(r.status()+' '+r.url());});
        await open(p,lang,route,268437716);
        if(width<1000)await p.locator('#mobil-reiter [data-pane="karte"]').click();
        await p.locator('#kartenansicht').waitFor({state:'visible'});
        assert.equal(await mode(p),'karte');
        assert.equal(await p.evaluate(()=>localStorage.getItem('mql.vorkommen')),'{"wahl":{}}');
        assert.equal(await p.evaluate(()=>localStorage.getItem('mql.notizen')),'{"kept":true}');
        assert.equal(await p.evaluate(()=>localStorage.getItem('mql.charaktere')),'{"kept":true}');
        assert.equal(await p.locator('#welt').getAttribute('data-karte'),'268437716');
        assert.equal(await p.locator('.gelaende-kacheln img').count(),0);
        assert.equal(await p.evaluate(()=>document.querySelector('.vorkommen-ebene').style.pointerEvents),'none');
        assert.equal(await p.locator('.terrain-test-ui').count(),0);
        const initial=await p.locator('#liste').textContent();
        await p.waitForFunction(()=>{
          const stage=document.querySelector('#buehne')?.getBoundingClientRect();
          const dots=[...document.querySelectorAll('#marker .punkt')];
          return stage?.width>100&&dots.some(dot=>dot.getBoundingClientRect().width>0);
        });
        const markerWidth=()=>p.locator('#marker .punkt').evaluateAll(dots=>
          Math.max(0,...dots.map(dot=>dot.getBoundingClientRect().width)));
        const gameDotBefore=await markerWidth();
        assert.ok(gameDotBefore>0,'game-map markers should be visible before zooming');
        await p.locator('[data-zoom="in"]').click();await p.waitForTimeout(100);
        assert.ok(Number(await p.locator('#gelaende-zoom').getAttribute('data-scale'))>1);
        const gameDotAfter=await markerWidth();
        assert.ok(Math.abs(gameDotBefore-gameDotAfter)<.2,`game-map marker scaled ${gameDotBefore} -> ${gameDotAfter}`);
        const gameTransform=await p.locator('#welt').evaluate(e=>e.style.transform);
        assert.notEqual(gameTransform,'none');
        const gameStage=await p.locator('#buehne').boundingBox();
        await p.mouse.move(gameStage.x+10,gameStage.y+gameStage.height*.7);await p.mouse.down();
        await p.mouse.move(gameStage.x+45,gameStage.y+gameStage.height*.7+15,{steps:4});await p.mouse.up();
        assert.notEqual(await p.locator('#welt').evaluate(e=>e.style.transform),gameTransform);
        await p.locator('[data-zoom="fit"]').click();
        assert.equal(await p.locator('#welt').evaluate(e=>e.style.transform).then(s=>s.replace(/\s/g,'')),'translate(0px,0px)scale(1)');
        await p.locator('[data-kartenansicht="gelaende"]').click();
        await p.locator('.gelaende-kacheln img').first().waitFor({state:'attached'});
        assert.equal(await mode(p),'gelaende');
        await p.locator('[data-kartenansicht="karte"]').click();
        assert.equal(await mode(p),'karte');assert.equal(await p.locator('#liste').textContent(),initial);
        await p.reload({waitUntil:'networkidle'});await ready(p);
        assert.equal(await mode(p),'karte');
        await open(p,lang,route,268437719);assert.equal(await mode(p),'karte');
        await open(p,lang,route,268437716);
        if(width<1000)await p.locator('#mobil-reiter [data-pane="karte"]').click();
        await p.locator('[data-kartenansicht="gelaende"]').click();
        await p.reload({waitUntil:'networkidle'});await ready(p);assert.equal(await mode(p),'gelaende');
        if(width<1000)await p.locator('#mobil-reiter [data-pane="karte"]').click();
        const dot=p.locator('#marker .punkt').first();
        await p.mouse.move(0,0);await p.waitForTimeout(100);
        const before=await dot.evaluate(e=>e.getBoundingClientRect().width);
        await p.locator('[data-zoom="in"]').click();await p.waitForTimeout(100);
        const after=await dot.evaluate(e=>e.getBoundingClientRect().width);
        assert.ok(Math.abs(before-after)<.2,`marker scaled ${before} -> ${after}`);
        assert.ok(Number(await p.locator('#gelaende-zoom').getAttribute('data-scale'))>1);
        const stage=await p.locator('#buehne').boundingBox(),transform=await p.locator('#welt').evaluate(e=>e.style.transform);
        await p.mouse.move(stage.x+10,stage.y+stage.height*.7);await p.mouse.down();
        await p.mouse.move(stage.x+45,stage.y+stage.height*.7+15,{steps:4});await p.mouse.up();
        assert.notEqual(await p.locator('#welt').evaluate(e=>e.style.transform),transform);
        await p.locator('[data-zoom="fit"]').click();
        await p.locator('#vorkommen-knopf').click();
        await p.locator('#vorkommen-liste select').first().waitFor();
        await p.locator('#vorkommen-alle').click();
        await p.waitForFunction(()=>document.querySelector('.vorkommen-ebene')?.style.pointerEvents==='auto');
        await p.locator('[data-kartenansicht="karte"]').click();
        const resource=await p.evaluate(()=>{
          const world=document.querySelector('#welt'),r=world.getBoundingClientRect(),stage=document.querySelector('#buehne').getBoundingClientRect();
          const map=window.MQL_KARTEN.find(m=>String(m.idx)===world.dataset.karte);
          for(const point of window.MQL_VORKOMMEN_KARTE||[]){
            const x=r.left+(point[1]-map.west)/(map.east-map.west)*r.width,y=r.top+(map.north-point[0])/(map.north-map.south)*r.height;
            if(x>stage.left+5&&x<stage.right-5&&y>stage.top+5&&y<stage.bottom-5&&document.elementFromPoint(x,y)?.classList.contains('vorkommen-ebene'))return {x,y};
          }return null;
        });
        assert.ok(resource,'No visible resource point found for click test');
        await p.mouse.click(resource.x,resource.y);await p.locator('.vorkommen-tip').waitFor({state:'visible'});
        await p.mouse.click(5,5);
        await p.screenshot({path:path.join(output,`${lang}-${width}.png`)});
        assert.deepEqual(errors,[]);
        results.push(`${lang} ${width}px: default, preference/reload/navigation, marker size, zoom, drag, toolbar OK`);
        await context.close();
      }
    }
    for(const route of ['karte/','karte/taten/']){
      const context=await browser.newContext({viewport:{width:1280,height:900}}),p=await context.newPage(),errors=[];
      p.on('pageerror',e=>errors.push(e.message));
      p.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400&&!r.url().includes('/thumb/'))errors.push(r.status()+' '+r.url());});
      await p.goto(`${base}/de/${route}`,{waitUntil:'networkidle'});
      await p.waitForFunction(()=>document.querySelector('.landschaft-ansicht button'));
      const overview=p.locator('.landschaft-ansicht');
      assert.equal(await overview.getAttribute('aria-label'),'Kartenansicht');
      await overview.locator('[data-kartenansicht="gelaende"]').click();
      assert.equal(await p.evaluate(()=>localStorage.getItem('mql.kartenansicht')),'gelaende');
      assert.equal(await overview.locator('[data-kartenansicht="gelaende"]').getAttribute('aria-pressed'),'true');
      await p.waitForTimeout(800);
      assert.ok(await p.locator('.landschaft-kachel img').evaluateAll(images=>images.some(image=>image.complete&&image.naturalWidth>0)),'Overview should show loaded previews or their game-map fallback');
      await overview.locator('[data-kartenansicht="karte"]').click();
      assert.equal(await p.evaluate(()=>localStorage.getItem('mql.kartenansicht')),'karte');
      assert.equal(await overview.locator('[data-kartenansicht="karte"]').getAttribute('aria-pressed'),'true');
      assert.deepEqual(errors,[]);
      results.push(`${route}: overview view switch follows and persists shared preference`);
      await context.close();
    }
    const context=await browser.newContext({viewport:{width:1440,height:1000}}),p=await context.newPage(),sampleErrors=[];
    p.on('pageerror',e=>sampleErrors.push(e.message));p.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)sampleErrors.push(r.status()+' '+r.url());});
    // 268450901 is an overview map with an unknown frame and is not selectable
    // as a terrain-backed child map; keep it out of this terrain availability set.
    const samples=[268437716,268450763,268454362,268455274,268453555,268442341];
    for(const id of samples){
      await open(p,'de','karte',id);
      const actual=await p.locator('#welt').getAttribute('data-karte');
      assert.equal(actual,String(id),`Requested map ${id}, showed ${actual}`);
       assert.equal(await mode(p),'karte');
      assert.equal(await p.locator('.gelaende-kacheln img').evaluateAll(nodes=>nodes.filter(n=>n.complete&&!n.naturalWidth).length),0);
      results.push(`map ${id}: terrain available`);
    }
    await p.evaluate(()=>localStorage.setItem('mql.kartenansicht','gelaende'));
    await open(p,'de','karte',268453438);
    assert.equal(await mode(p),'karte');assert.equal(await p.evaluate(()=>localStorage.getItem('mql.kartenansicht')),'gelaende');
    await open(p,'de','karte',268437716);assert.equal(await mode(p),'gelaende');
    assert.deepEqual(sampleErrors,[]);
    await p.goto(`${base}/de/karte/`,{waitUntil:'networkidle'});
    await p.locator('.landschaft-kachel').first().waitFor();
    await p.waitForFunction(()=>[...document.querySelectorAll('.landschaft-kachel img')].some(i=>(i.getAttribute('src')||'').startsWith('/gelaende/')));
    const cards=await p.locator('.landschaft-mit-orten').evaluateAll(nodes=>nodes.map(n=>({top:n.offsetTop,height:n.offsetHeight})));
    const heights=[...new Set(cards.map(c=>c.height))];assert.ok(heights.length>1,'All grid rows have a shared global height');
    const groups=new Map();for(const card of cards){if(!groups.has(card.top))groups.set(card.top,new Set());groups.get(card.top).add(card.height);}
    assert.ok([...groups.values()].every(s=>s.size===1),'Cards within a row should share its tallest height');
    /* Jede Kachel hat ein Bild oder einen leeren Platz; wie viele leer sind,
     * hängt am Geländebau, nicht an der Oberfläche. */
    const kacheln=await p.locator('.landschaft-kachel').count();
    const placeholders=await p.locator('.landschaft-bild-leer').count();
    const bilder=await p.locator('.landschaft-kachel img').count();
    assert.equal(placeholders+bilder,kacheln,'Kachel ohne Bild oder Platzhalter');
    assert.ok(!await p.locator('#landschaften').textContent().then(s=>s.includes('Für diesen Ort ist noch keine Karte verfügbar')));
    await p.screenshot({path:path.join(output,'overview.png')});
    results.push('unsupported map preserves preference; overview row heights and empty image slots OK');
    // Resource layer: a choice of "nothing" must survive a reload.
     await open(p,'de','karte',268437716);
     assert.equal(await p.evaluate(()=>localStorage.getItem('mql.vorkommen')),'{"wahl":{}}');
     await p.evaluate(()=>{localStorage.setItem('mql.notizen','{"kept":true}');localStorage.setItem('mql.charaktere','{"kept":true}');});
     await p.locator('#vorkommen-knopf').click();
    await p.locator('#vorkommen-liste input, #vorkommen-liste select').first().waitFor();
    await p.locator('#vorkommen-keine').click();
    await p.waitForTimeout(300);
    await p.reload({waitUntil:'networkidle'});await ready(p);
    assert.equal(await p.evaluate(()=>document.querySelector('.vorkommen-ebene').style.pointerEvents),'none');
    await p.locator('#vorkommen-knopf').click();
     await p.locator('#vorkommen-alle').click();
     await p.waitForTimeout(300);
     await p.reload({waitUntil:'networkidle'});await ready(p);
     assert.equal(await p.evaluate(()=>document.querySelector('.vorkommen-ebene').style.pointerEvents),'auto');
     await p.evaluate(()=>localStorage.setItem('mql.notizen','{"kept":true}'));
     await p.reload({waitUntil:'networkidle'});await ready(p);
     assert.equal(await p.evaluate(()=>localStorage.getItem('mql.notizen')),'{"kept":true}');
     assert.equal(await p.evaluate(()=>localStorage.getItem('mql.kartenansicht')),'gelaende');
     results.push('one-time migration defaults resources off; other settings and later choices survive reload');
     const deepLinkType=await p.evaluate(()=>window.MQL_VORKOMMEN.k[0][0]);
     await open(p,'de','karte',268437716);
     await p.goto(`${base}/de/karte/?vorkarte=268437716&vorkommen=${encodeURIComponent(deepLinkType)}`,{waitUntil:'networkidle'});
     await ready(p);
     await p.waitForFunction(()=>document.querySelector('.vorkommen-ebene')?.style.pointerEvents==='auto');
     assert.equal(await p.evaluate(()=>localStorage.getItem('mql.kartenansicht')),'gelaende');
     results.push('explicit resource deep link activates its requested resource after migration');
    // Legend: the "?" only appears when an entry was really cut off.
    const legend = await browser.newContext({viewport: {width: 1900, height: 1000}});
    const lp = await legend.newPage();
    await open(lp, 'de', 'karte', 268437653);
    assert.equal(await lp.evaluate(() => getComputedStyle(document.querySelector('#legende-mehr')).visibility), 'hidden');
    await lp.setViewportSize({width: 1200, height: 1000});
    await lp.waitForTimeout(500);
    const cut = await lp.evaluate(() => ({
      visible: getComputedStyle(document.querySelector('#legende-mehr')).visibility !== 'hidden',
      shown: [...document.querySelectorAll('#legende > *')].filter(e => !e.hidden && !e.classList.contains('zu-breit')).length,
      total: [...document.querySelectorAll('#legende > *')].filter(e => !e.hidden).length,
    }));
    assert.ok(cut.visible && cut.shown < cut.total, JSON.stringify(cut));
    await lp.locator('#legende-mehr').click();
    assert.ok(await lp.locator('#legende-voll > *').count() > cut.shown);
    await legend.close();
    results.push('legend "?" hidden when everything fits and complete when shown');
    await context.close();
    // Simulate an image failure: use the game map without changing preference.
    const failure=await browser.newContext(),fp=await failure.newPage();
    await fp.route('**/gelaende/*/r*/**',r=>r.fulfill({status:404,body:''}));
     await open(fp,'de','karte',268437716);await fp.waitForFunction(()=>document.querySelector('#welt').dataset.kartenansicht==='karte');
     assert.equal(await fp.evaluate(()=>localStorage.getItem('mql.kartenansicht')),'karte');
     await fp.locator('[data-zoom="in"]').click();
     assert.ok(Number(await fp.locator('#gelaende-zoom').getAttribute('data-scale'))>1);
    await failure.close();results.push('tile load failure falls back without overwriting preference');
    const retina=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:2}),rp=await retina.newPage();
    await open(rp,'de','karte',268437716);
    const retinaSources=await rp.locator('.gelaende-kacheln img').evaluateAll(nodes=>nodes.map(n=>n.src));
    assert.ok(retinaSources.some(src=>src.includes('/r1/0/')),'Retina view should load native-detail tiles');
    await retina.close();results.push('retina DPR=2 loads native detail instead of undersampling');
    console.log(results.join('\n'));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
