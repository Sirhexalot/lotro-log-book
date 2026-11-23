'use strict';
/* Where-source links: every mapped vendor place, and the one temporary map
 * point for landmarks and quest givers.
 *
 *   node tests/browser_wo.js http://127.0.0.1:8817
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const base = (process.argv[2] || process.env.LLB_URL || 'http://127.0.0.1:8817').replace(/\/$/, '');

async function open(page, path) {
	await page.goto(base + path, { waitUntil: 'domcontentloaded' });
	await page.waitForTimeout(1200);
}

(async () => {
	const browser = await chromium.launch();
	try {
		const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
		await context.route(/googletagmanager|google-analytics|goatcounter|gc\.zgo\.at/, (r) => r.abort());
		const page = await context.newPage();
		const fehler = [];
		page.on('pageerror', (e) => fehler.push(e.message));

		/* A source list with filters never carries "Wo": the item page of a
		   widely traded commodity lists 333 vendors behind a filter. */
		await open(page, '/de/gegenstand/700005D1/');
		await page.waitForSelector('[data-filter-results]');
		assert.equal(await page.locator('.wo-liste').count(), 0,
			'"Wo" in der gefilterten Händlerliste');

		/* A short source list shows the same places as the vendor page: same
		   names, same coordinates, both actions. */
		await open(page, '/de/gegenstand/7004A052/');
		await page.waitForSelector('.wo-liste', { state: 'attached' });
		const sourceWo = page.locator('.wo-liste:visible').first();
		await sourceWo.locator('summary').click();
		const leseOrte = (root) => root.evaluateAll((lis) => lis.map((li) => {
			const metas = [...li.querySelectorAll('.wo-ort-meta, .ort-meta')].map((m) => m.textContent.trim());
			return {
				name: li.querySelector('.wo-ort-name, .ort-name').textContent.replace(/\s+/g, ' ').trim(),
				coords: metas.length ? metas[metas.length - 1] : '',
				hrefs: [...li.querySelectorAll('.wo-ort-aktionen a, .ort-aktionen a')].map((a) => a.getAttribute('href')),
			};
		}));
		const quelle = await leseOrte(sourceWo.locator('li.wo-ort'));
		assert.ok(quelle.length > 1, 'Kurze Quelle ohne Standorte');
		assert.ok(quelle.every((ort) => ort.hrefs.some((href) => href && href.includes('haendler='))),
			'Händlerstandort ohne Kartenlink');
		await open(page, '/de/haendler/7004C01A/');
		const seite = await leseOrte(page.locator('.vendor-orte li'));
		assert.deepEqual(quelle, seite, 'Quellenliste und Händlerseite zeigen nicht dieselben Orte');

		/* Item: the barter tab uses the same list. */
		await open(page, '/de/gegenstand/7002B017/');
		const barterTab = page.locator('[data-reiter-knopf="barter"]');
		if (await barterTab.count()) {
			await barterTab.click();
			await page.waitForTimeout(400);
			assert.ok(await page.locator('.wo-liste:visible').count() > 0, 'Tauschhändler ohne Wo-Liste');
			assert.ok((await page.locator('.wo-liste:visible a').first().getAttribute('href')).includes('haendler='),
				'Tauschhändlerlink ohne haendler');
		}
		/* Recipe: its vendor sources offer the same places. */
		await open(page, '/de/rezept/70004E7E/');
		await page.waitForSelector('.wo-liste');
		assert.ok((await page.locator('.wo-liste:visible a').first().getAttribute('href')).includes('haendler='),
			'Rezeptquelle ohne Händlerkarte');

		/* The vendor list itself deliberately has no map action. */
		await open(page, '/de/haendler/');
		assert.equal(await page.locator('.wo-liste').count(), 0, 'Wo-Liste in der Händlerliste');

		/* Landmark: one point on its map. */
		await open(page, '/de/landmarke/7005B460/');
		const landmarkLink = page.locator('.llb-aktionen a').filter({ hasText: /Karte/ }).first();
		const landmarkHref = await landmarkLink.getAttribute('href');
		assert.match(landmarkHref, /[?&]punkt=/);
		assert.match(landmarkHref, /[?&]vorkarte=/);
		await page.goto(base + landmarkHref, { waitUntil: 'networkidle' });
		await page.waitForTimeout(1000);
		assert.equal(await page.locator('.ortspunkt').count(), 1, 'Landmarkenpunkt fehlt');
		assert.ok((await page.locator('.ortspunkt-label').innerText()).length > 0, 'Landmarkenpunkt ohne Name');

		/* Quest giver: the existing "show on map" now marks the giver. */
		await open(page, '/de/auftraggeber/70047E45/');
		const giverHref = await page.locator('.llb-aktionen a').filter({ hasText: /Karte/ }).first().getAttribute('href');
		assert.match(giverHref, /[?&]punkt=/);
		await page.goto(base + giverHref, { waitUntil: 'networkidle' });
		await page.waitForTimeout(1000);
		assert.equal(await page.locator('.ortspunkt').count(), 1, 'Auftraggeberpunkt fehlt');

		/* A plain map has no temporary point. */
		await page.goto(base + '/de/karte/#map-268437678', { waitUntil: 'networkidle' });
		await page.waitForTimeout(800);
		assert.equal(await page.locator('.ortspunkt').count(), 0, 'Punkt ohne punkt-Parameter');

		await page.setViewportSize({ width: 390, height: 844 });
		await open(page, '/de/gegenstand/7004A052/');
		assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false,
			'Wо-Liste drückt die Seite mobil auseinander');

		assert.deepEqual(fehler, [], 'JavaScript-Fehler: ' + fehler.join(' | '));
		await context.close();
		console.log('Wo-Links: kurze Quellen wie die Händlerseite, keine in Filterlisten, Kartenpunkte ok');
	} finally {
		await browser.close();
	}
})().catch((error) => { console.error(error); process.exitCode = 1; });
