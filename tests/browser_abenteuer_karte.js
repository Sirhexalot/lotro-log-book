/* Run against a local PHP preview: LLB_ADVENTURE_URL=http://127.0.0.1:8854
 * NODE_PATH=<global node_modules> node tests/browser_abenteuer_karte.js
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

(async () => {
	const browser = await chromium.launch({headless: true});
	try {
		for (const [lang, route] of [['de', 'abenteuer'], ['en', 'adventure'], ['fr', 'aventure']]) {
			const page = await browser.newPage({viewport: {width: 1440, height: 1000}});
			await page.goto(`${process.env.LLB_ADVENTURE_URL || 'http://127.0.0.1:8854'}/${lang}/${route}/`);
			await page.waitForFunction(() => window.MQL_ABENTEUER_KARTE && window.MQL_ABENTEUER_STAND);
			await page.locator('[data-region="268453621"]').click();
			assert.equal(await page.locator('#hinweise').isVisible(), false);
			assert.equal(await page.locator('.abenteuer-kopf .dach').count(), 0);
			assert.equal(await page.locator('.abenteuer-ansicht button').count(), 2);
			assert.equal(await page.locator('.abenteuer-ansicht-wort').count(), 0);
			const dot = page.locator('.region-punkt:not(.sammel)').first();
			assert.equal(await dot.textContent(), '–');
			const map = await page.locator('.region-karte').boundingBox();
			const list = await page.locator('.region-liste').boundingBox();
			assert.ok(list.x >= map.x + map.width, 'list beside the map');
			await page.evaluate(() => {
				window.MQL_ABENTEUER_STAND.areas.forEach(area => { area.coverage = .12; });
				window.dispatchEvent(new Event('mql:abenteuer'));
			});
			assert.equal(await dot.textContent(), '12%');
			await page.evaluate(() => {
				const rows = window.MQL_ABENTEUER_STAND.areas.filter(a => String(a.region) === '268453621');
				rows[0].coverage = .8;
				rows[1].coverage = 0;
				rows[2].coverage = null;
				window.dispatchEvent(new Event('mql:abenteuer'));
			});
			const progress = await page.locator('.region-liste [data-welt-gebiet]').evaluateAll(buttons => buttons.map(b => {
				const row = window.MQL_ABENTEUER_STAND.areas.find(a => a.id === b.dataset.weltGebiet);
				return row.coverage;
			}));
			assert.equal(progress[0], 0);
			assert.equal(progress[progress.length - 1], null);
			assert.equal(await page.locator('.region-punkt[aria-pressed="true"]').count(), 0);
			await page.locator('[data-gebiet-sort="name"]').click();
			const names = await page.locator('.region-liste .wg-name').allTextContents();
			assert.deepEqual(names, names.slice().sort((a, b) => a.localeCompare(b, lang, {numeric: true})));
			assert.equal(await page.locator('.region-punkt[aria-pressed="true"]').count(), 0);
			for (const id of ['268449767', '268449752']) {
				await page.locator(`.region-punkt[data-welt-gebiet="${id}"]`).click();
				assert.equal(await page.locator('.region-liste [data-welt-gebiet]').count(), 1);
				assert.equal(await page.locator('.region-liste [data-welt-gebiet]').getAttribute('data-welt-gebiet'), id);
				await page.locator('.cluster-kopf button').click();
				assert.ok(await page.locator('.region-liste [data-welt-gebiet]').count() > 2);
			}
			const group = page.locator('.region-punkt.sammel').first();
			assert.notEqual(await group.evaluate(e => getComputedStyle(e).backgroundColor), await dot.evaluate(e => getComputedStyle(e).backgroundColor));
			await group.click();
			assert.equal(await page.locator('.region-liste [data-welt-gebiet]').count(), Number(await group.textContent()));
			await page.locator('.cluster-kopf button').click();
			await page.locator('.region-liste [data-welt-gebiet]').nth(1).click();
			assert.equal(await page.locator('#hinweise').isVisible(), false);
			await page.setViewportSize({width: 390, height: 900});
			const mobileMap = await page.locator('.region-karte').boundingBox();
			const mobileList = await page.locator('.region-liste').boundingBox();
			assert.ok(mobileList.y >= mobileMap.y + mobileMap.height, 'mobile list below map');
			assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
			await page.locator('[data-zurueck]').click();
			assert.equal(await page.locator('#hinweise').getAttribute('hidden'), null);
			await page.reload();
			assert.equal(await page.locator('[data-gebiet-sort="name"]').getAttribute('aria-pressed'), 'true');
			await page.close();
			console.log(`${lang}: list layout, percentages, unknown progress and recommendations OK`);
		}
	} finally {
		await browser.close();
	}
})().catch(error => { console.error(error); process.exitCode = 1; });
