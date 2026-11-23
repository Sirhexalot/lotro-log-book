/* Result table and column sorting on the real item index.
 * Run tools/filter_vorschau.py first (default http://127.0.0.1:8924). */
'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.LLB_ITEM_PREVIEW || 'http://127.0.0.1:8924';

async function bereit(page) {
	await page.waitForFunction(() => window.MQL_ITEM_FILTER &&
		!document.querySelector('[data-filter-results]').hasAttribute('aria-busy'));
}

async function zahlen(page) {
	return page.$$eval('#gs-ergebnis tbody tr td.llb-zahl',
		(tds) => tds.map((td) => Number(td.textContent.trim()) || 0));
}

function sortiert(werte, richtung) {
	const leer = werte.findIndex((wert) => !wert);
	const sichtbar = leer < 0 ? werte : werte.slice(0, leer);
	const nullen = leer < 0 ? [] : werte.slice(leer);
	const erwartet = [...sichtbar].sort((a, b) => richtung === 'asc' ? a - b : b - a);
	return nullen.every((wert) => !wert) &&
		JSON.stringify(sichtbar) === JSON.stringify(erwartet);
}

(async () => {
	const browser = await chromium.launch();
	try {
		const context = await browser.newContext();
		const page = await context.newPage();
		const errors = [];
		page.on('pageerror', (e) => errors.push(String(e)));

		await page.goto(base + '/gegenstaende.html?lang=de', {waitUntil: 'domcontentloaded'});
		await bereit(page);

		// One table, two column heads and 50 rows; the old sort select is gone.
		assert.equal(await page.locator('#gs-ergebnis table[role="table"]').count(), 1);
		assert.equal(await page.locator('#gs-ergebnis th[role="columnheader"]').count(), 2);
		assert.equal(await page.locator('#gs-ergebnis tbody tr').count(), 50);
		assert.equal(await page.locator('#gs-ergebnis .gs-name').count(), 50);
		assert.equal(await page.locator('#gs-ergebnis .gs-meta').count(), 50);
		assert.equal(await page.locator('.filter-result-toolbar select').isHidden(), true);
		assert.equal(await page.locator('#gs-ergebnis th').first().getAttribute('aria-sort'), 'ascending');

		// The item level lives in the name cell; the minimum level is the column.
		const meta = await page.locator('#gs-ergebnis .gs-meta').first().textContent();
		assert.ok(meta.includes('Gegenstandsstufe'), meta);

		// First click on the minimum level sorts ascending and names the address.
		await page.locator('#gs-ergebnis th button[data-sort-key="mindeststufe"]').click();
		await bereit(page);
		assert.equal(await page.locator('#gs-ergebnis th').nth(1).getAttribute('aria-sort'), 'ascending');
		assert.ok(sortiert(await zahlen(page), 'asc'), 'ascending order');
		assert.match(page.url(), /[?&]sort=mindeststufe(&|$)/);

		// Second click turns the direction.
		await page.locator('#gs-ergebnis th button[data-sort-key="mindeststufe"]').click();
		await bereit(page);
		assert.equal(await page.locator('#gs-ergebnis th').nth(1).getAttribute('aria-sort'), 'descending');
		assert.ok(sortiert(await zahlen(page), 'desc'), 'descending order');
		assert.match(page.url(), /[?&]sort=-mindeststufe(&|$)/);

		// An old link to the item level reads as the wear requirement.
		await page.goto(base + '/gegenstaende.html?lang=de&sort=stufe', {waitUntil: 'domcontentloaded'});
		await bereit(page);
		assert.equal(await page.locator('#gs-ergebnis th').nth(1).getAttribute('aria-sort'), 'ascending');
		await page.goto(base + '/gegenstaende.html?lang=de&sort=stufe-ab', {waitUntil: 'domcontentloaded'});
		await bereit(page);
		assert.equal(await page.locator('#gs-ergebnis th').nth(1).getAttribute('aria-sort'), 'descending');

		// A fresh list starts at the name again.
		await page.goto(base + '/gegenstaende.html?lang=de', {waitUntil: 'domcontentloaded'});
		await bereit(page);
		assert.equal(await page.locator('#gs-ergebnis th').first().getAttribute('aria-sort'), 'ascending');

		// The table keeps its semantics at every width.
		for (const width of [390, 768, 1280]) {
			await page.setViewportSize({width, height: 900});
			assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
			assert.equal(await page.getByRole('table').count(), 1);
			assert.equal(await page.getByRole('columnheader').count(), 2);
		}

		// Scrolling to the end loads the next block without a page control.
		await page.setViewportSize({width: 1280, height: 900});
		await page.goto(base + '/gegenstaende.html?lang=de', {waitUntil: 'domcontentloaded'});
		await bereit(page);
		assert.equal(await page.locator('#gs-ergebnis tbody tr').count(), 50);
		await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
		await page.waitForFunction(() => document.querySelectorAll('#gs-ergebnis tbody tr').length > 50);
		assert.equal(await page.locator('#gs-mehr').isHidden(), true);

		assert.deepEqual(errors, []);
		await context.close();
		console.log('Item table: head, direction, address, mobile semantics and scrolling passed.');
	} finally {
		await browser.close();
	}
})();
