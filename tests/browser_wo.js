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

		/* Item: a vendor source lists all mapped places behind "Wo". */
		await open(page, '/de/gegenstand/7000EFC8/');
		await page.waitForSelector('.wo-liste', { state: 'attached' });
		const vendorWo = page.locator('.wo-liste:visible').first();
		await vendorWo.locator('summary').click();
		const vendorLinks = await vendorWo.locator('a').evaluateAll((as) => as.map((a) => a.href));
		assert.ok(vendorLinks.length > 0, 'Händlerquelle ohne Standort');
		assert.ok(vendorLinks.every((href) => /[?&]haendler=/.test(href) && /[?&]vorkarte=/.test(href)),
			'Händler-Standortlink ohne haendler/vorkarte');

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
		await open(page, '/de/gegenstand/7000EFC8/');
		assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false,
			'Wо-Liste drückt die Seite mobil auseinander');

		assert.deepEqual(fehler, [], 'JavaScript-Fehler: ' + fehler.join(' | '));
		await context.close();
		console.log('Wo-Links: Händlerquellen, Rezeptquellen, Landmarken- und Auftraggeberpunkt ok');
	} finally {
		await browser.close();
	}
})().catch((error) => { console.error(error); process.exitCode = 1; });
