'use strict';
/* The four remaining server lists on the PHP filter model and shared table:
 * landmarks, vendors, instances, quest givers.
 *
 *   node tests/browser_serverlisten_tabelle.js http://127.0.0.1:8817
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const base = (process.argv[2] || process.env.LLB_URL || 'http://127.0.0.1:8817').replace(/\/$/, '');

const LISTEN = [
	{name: 'Landmarken', pfad: '/de/landmarke/', area: 'landmarke',
		groups: ['region', 'area', 'mit'], head: 1},
	{name: 'Händler', pfad: '/de/haendler/', area: 'haendler',
		groups: ['region', 'area', 'type', 'level'], head: 2},
	{name: 'Instanzen', pfad: '/de/instanz/', area: 'instanzen',
		groups: ['cluster', 'art', 'level', 'spieler', 'tier'], head: 1},
	{name: 'Auftraggeber', pfad: '/de/auftraggeber/', area: 'auftraggeber',
		groups: ['region', 'area', 'kind', 'level', 'tag'], head: 2},
];

async function sortiere(page) {
	await page.evaluate(() => document.querySelector('.filter-ui table.llb-tabelle thead [data-sort-key]').click());
}

(async () => {
	const browser = await chromium.launch();
	try {
		for (const liste of LISTEN) {
			const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
			await context.route(/googletagmanager|google-analytics|goatcounter|gc\.zgo\.at/, (r) => r.abort());
			const page = await context.newPage();
			const fehler = [];
			page.on('pageerror', (e) => fehler.push(e.message));

			await page.goto(base + liste.pfad, { waitUntil: 'networkidle' });
			await page.waitForSelector('.filter-ui table.llb-tabelle tbody tr');

			const model = await page.evaluate(() => JSON.parse(
				document.querySelector('.sets-browser script[data-filter-model]').textContent));
			assert.equal(model.definition.area, liste.area, liste.name + ': Bereich');
			assert.deepEqual(model.definition.groups.map((g) => g.id), liste.groups, liste.name + ': Gruppen');
			assert.equal(model.definition.pagination.kind, 'page', liste.name + ': Seitenmodus');

			assert.equal(await page.locator('.filter-ui table.llb-tabelle thead th').count(), liste.head, liste.name + ': Spalten');
			assert.equal(await page.locator('.filter-ui table.llb-tabelle thead th').first().getAttribute('aria-sort'), 'ascending', liste.name + ': Ausgangsrichtung');
			assert.ok(await page.locator('.filter-ui table.llb-tabelle tbody tr').count() >= 30, liste.name + ': Zeilen');

			await sortiere(page);
			await page.waitForFunction(() => document.querySelector('.filter-ui table.llb-tabelle thead th')?.getAttribute('aria-sort') === 'descending');
			assert.match(page.url(), /[?&]sort=-name(&|#|$)/, liste.name + ': Sortieradresse');

			const filter = page.locator('.filter-ui .filter-option input').first();
			assert.equal(await filter.count(), 1, liste.name + ': erster Filter');
			await filter.check();
			await page.waitForTimeout(900);
			const selected = await page.evaluate(() => {
				const filters = window.MQL_SERVER_FILTER.getState().filters;
				return Object.values(filters).some((value) => Array.isArray(value) ? value.length > 0
					: value && typeof value === 'object' ? value.min !== null || value.max !== null : value === true);
			});
			assert.ok(selected, liste.name + ': Filter nicht gesetzt');
			assert.match(await page.locator('.filter-result-toolbar [role=status]').innerText(), /\d/, liste.name + ': Zähler');

			await page.setViewportSize({ width: 390, height: 844 });
			assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, liste.name + ': Mobilbreite');

			assert.deepEqual(fehler, [], liste.name + ': JavaScript-Fehler: ' + fehler.join(' | '));
			await context.close();
			console.log(liste.name + ': Filtermodel, Tabelle, Sortierung, Filter und Mobilansicht ok');
		}

		/* Without JavaScript the head is a link and the server sorts. */
		for (const liste of [LISTEN[0], LISTEN[3]]) {
			const context = await browser.newContext({ javaScriptEnabled: false });
			const page = await context.newPage();
			await page.goto(base + liste.pfad, { waitUntil: 'domcontentloaded' });
			assert.ok(await page.locator('table.llb-tabelle tbody tr').count() >= 30, liste.name + ': no-JS Zeilen');
			await page.locator('table.llb-tabelle thead a[data-sort-key]').first().click();
			await page.waitForLoadState('domcontentloaded');
			assert.equal(await page.locator('table.llb-tabelle thead th').first().getAttribute('aria-sort'), 'descending', liste.name + ': no-JS Richtung');
			assert.match(page.url(), /sort=-name/, liste.name + ': no-JS Adresse');
			await context.close();
		}
		console.log('ohne JavaScript: Kopf ist ein Link, der Server sortiert');
	} finally {
		await browser.close();
	}
})().catch((error) => { console.error(error); process.exitCode = 1; });
