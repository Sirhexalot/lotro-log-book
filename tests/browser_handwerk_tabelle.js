/* Crafting lists on the shared result table: head, direction, address, sticky
 * filter, materials and the recipe progress column.
 * Run tools/lokalserver.py first (default http://127.0.0.1:8817). */
'use strict';
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const base = process.argv[2] || 'http://127.0.0.1:8817';

async function bereit(page, host) {
	await page.waitForFunction((selector) => {
		const target = document.querySelector(selector + ' [data-filter-results]');
		return window.MQL_CRAFT_FILTER && target && !target.hasAttribute('aria-busy') &&
			target.querySelector('table.llb-tabelle tbody tr');
	}, host);
}

function kopf(page, host) {
	return page.locator(host + ' table.llb-tabelle thead th');
}

/* A table inside the horizontally scrollable result box: Playwright's
 * scroll-into-view can move the head between measuring and clicking. */
async function sortiere(page, host, key) {
	await page.evaluate((args) => {
		const knopf = [...document.querySelectorAll(args.host + ' th button')]
			.find((button) => button.dataset.sortKey === args.key);
		knopf.click();
	}, {host, key});
}

async function stufen(page) {
	return page.$$eval('#rezepte-liste tbody tr td:nth-child(4)',
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
		const context = await browser.newContext({viewport: {width: 1280, height: 900}});
		const page = await context.newPage();
		const errors = [];
		page.on('pageerror', (e) => errors.push(String(e)));

		await page.goto(base + '/de/handwerk/rezepte/', {waitUntil: 'domcontentloaded'});
		await bereit(page, '#rezepte-liste');

		// One table, four heads, the old sort select gone.
		assert.equal(await page.locator('#rezepte-liste table[role="table"]').count(), 1);
		assert.equal(await kopf(page, '#rezepte-liste').count(), 4);
		assert.equal(await page.locator('#rezepte-liste tbody tr').count(), 50);
		assert.equal(await page.locator('.filter-result-toolbar select').isHidden(), true);
		assert.deepEqual(await kopf(page, '#rezepte-liste').allInnerTexts(),
			['Ergebnis\n↑', 'Beruf', 'Handwerksstufe\n↕', 'Gegenstandsstufe\n↕']);
		assert.equal(await kopf(page, '#rezepte-liste').first().getAttribute('aria-sort'), 'ascending');

		// The result level sorts, both directions and with its address.
		await sortiere(page, '#rezepte-liste', 'stufe');
		await bereit(page, '#rezepte-liste');
		assert.equal(await kopf(page, '#rezepte-liste').nth(3).getAttribute('aria-sort'), 'ascending');
		assert.ok(sortiert(await stufen(page), 'asc'), 'result level ascending');
		assert.match(page.url(), /[?&]sort=stufe(&|#|$)/);
		await sortiere(page, '#rezepte-liste', 'stufe');
		await bereit(page, '#rezepte-liste');
		assert.equal(await kopf(page, '#rezepte-liste').nth(3).getAttribute('aria-sort'), 'descending');
		assert.ok(sortiert(await stufen(page), 'desc'), 'result level descending');
		assert.match(page.url(), /[?&]sort=-stufe(&|#|$)/);

		// The crafting tier is its own sort key; the head names the direction.
		await sortiere(page, '#rezepte-liste', 'tier');
		await bereit(page, '#rezepte-liste');
		assert.equal(await kopf(page, '#rezepte-liste').nth(2).getAttribute('aria-sort'), 'ascending');
		assert.match(page.url(), /[?&]sort=tier(&|#|$)/);
		await sortiere(page, '#rezepte-liste', 'tier');
		await bereit(page, '#rezepte-liste');
		assert.equal(await kopf(page, '#rezepte-liste').nth(2).getAttribute('aria-sort'), 'descending');
		assert.match(page.url(), /[?&]sort=-tier(&|#|$)/);

		// The filter column stays visible while the result scrolls.
		const filter = page.locator('#rezepte-liste .filter-home').first();
		if (await filter.count()) {
			await page.evaluate(() => window.scrollTo(0, 900));
			await page.waitForTimeout(150);
			const box = await filter.boundingBox();
			const kopfBox = await page.locator('.kopf').boundingBox();
			assert.ok(box && box.y >= (kopfBox ? kopfBox.height - 2 : 0), 'filter column stays below the header');
		}

		// An old address reads the result level as before.
		await page.goto(base + '/de/handwerk/rezepte/?sort=stufe', {waitUntil: 'domcontentloaded'});
		await bereit(page, '#rezepte-liste');
		assert.equal(await kopf(page, '#rezepte-liste').nth(3).getAttribute('aria-sort'), 'ascending');

		// Scrolling loads the next block without a page control.
		await page.goto(base + '/de/handwerk/rezepte/', {waitUntil: 'domcontentloaded'});
		await bereit(page, '#rezepte-liste');
		await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
		for (let i = 0; i < 10 && await page.locator('#rezepte-liste tbody tr').count() <= 50; i++) {
			await page.waitForTimeout(300);
			await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
		}
		assert.ok(await page.locator('#rezepte-liste tbody tr').count() > 50, 'the next block loads on scroll');

		// The raw materials tab uses the same table; spots stay behind a fold.
		await page.goto(base + '/de/handwerk/rezepte/#rohstoffe', {waitUntil: 'domcontentloaded'});
		await bereit(page, '#rohstoffe-liste');
		assert.equal(await kopf(page, '#rohstoffe-liste').count(), 4);
		assert.deepEqual(await kopf(page, '#rohstoffe-liste').allInnerTexts(),
			['Sorte\n↑', 'Beruf', 'Handwerksstufe\n↕', 'Fundstellen']);
		assert.equal(await kopf(page, '#rohstoffe-liste').nth(3).getAttribute('aria-sort'), null);
		assert.ok(await page.locator('#rohstoffe-liste details').count() > 0, 'gathering spots stay available');
		await sortiere(page, '#rohstoffe-liste', 'tier');
		await bereit(page, '#rohstoffe-liste');
		assert.match(page.url(), /[?&]sort=tier(&|#|$)/);

		// With imported recipe data the knowledge becomes its own column.
		const recipeId = await page.evaluate(() => (window.MQL_REZEPTE.r[0] || [])[10]);
		await context.addInitScript((id) => {
			// One learned recipe; the complete import marks the rest as missing.
			localStorage.setItem('mql.charaktere', JSON.stringify({
				aktiv: 'T|T|T',
				liste: {'T|T|T': {key: 'T|T|T', name: 'Test', server: 'T', quests: [], deeds: [],
					rezepte: [id], handwerk: {COOK: [[1, 1, 0, 0, 0]]},
					importMeta: {recipes: true}}}
			}));
		}, recipeId);
		await page.goto(base + '/de/handwerk/rezepte/', {waitUntil: 'domcontentloaded'});
		await bereit(page, '#rezepte-liste');
		assert.equal(await kopf(page, '#rezepte-liste').count(), 5);
		assert.equal((await kopf(page, '#rezepte-liste').last().innerText()).trim(), 'Dein Fortschritt');
		assert.equal((await kopf(page, '#rezepte-liste').last().getAttribute('aria-sort')), null);

		// The table keeps its semantics at every width.
		for (const width of [390, 768, 1280]) {
			await page.setViewportSize({width, height: 900});
			assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
			assert.equal(await page.getByRole('table').count(), 1);
			assert.equal(await page.getByRole('columnheader').count(), 5);
		}

		assert.deepEqual(errors, []);
		await context.close();
		console.log('Crafting table: head, direction, address, materials, progress, mobile and scrolling passed.');
	} finally {
		await browser.close();
	}
})();
