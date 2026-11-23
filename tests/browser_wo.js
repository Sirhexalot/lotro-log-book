'use strict';
/* Places: the component on the detail pages, the compact list in a source.
 *
 * Since 23.11.2026 there is one rule on detail pages: exactly one place is a
 * block, two or more are the picker. A source list inside an item or recipe
 * names its places compactly, without a map — the map belongs to the pages
 * where the place is the subject.
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

/** Rows of the compact source list: name, coordinates, both actions. */
const leseQuelle = (root) => root.evaluateAll((lis) => lis.map((li) => {
	const metas = [...li.querySelectorAll('.wo-ort-meta')].map((m) => m.textContent.trim());
	return {
		name: li.querySelector('.wo-ort-name').textContent.replace(/\s+/g, ' ').trim(),
		coords: metas.length ? metas[metas.length - 1] : '',
		hrefs: [...li.querySelectorAll('.wo-ort-aktionen a')].map((a) => a.getAttribute('href')),
	};
}));

/** Rows of the place picker on a detail page. */
const leseZeilen = (root) => root.evaluateAll((lis) => lis.map((li) => {
	const metas = [...li.querySelectorAll('.ort-meta')].map((m) => m.textContent.trim());
	return {
		name: li.querySelector('.ort-name').textContent.replace(/\s+/g, ' ').trim(),
		coords: metas.length ? metas[metas.length - 1] : '',
		hrefs: [...li.querySelectorAll('.ort-aktionen a')].map((a) => a.getAttribute('href')),
	};
}));

(async () => {
	const browser = await chromium.launch();
	try {
		const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
		await context.route(/googletagmanager|google-analytics|goatcounter|gc\.zgo\.at/, (r) => r.abort());
		const page = await context.newPage();
		const fehler = [];
		page.on('pageerror', (e) => fehler.push(e.message));

		/* A filtered source list never carries "Wo": hundreds of vendors behind
		   a filter would repeat it in every row. */
		await open(page, '/de/gegenstand/700005D1/');
		const gefiltert = page.locator('[data-vendor-filter-group]');
		assert.equal(await gefiltert.count(), 1, 'Gefilterte Händlergruppe fehlt');
		assert.equal(await gefiltert.locator('.wo-liste').count(), 0,
			'"Wo" in einer gefilterten Quellenliste');

		/* A vendor source row names no place of its own: the vendor page carries
		   its location, and every row would only repeat it. */
		await open(page, '/de/gegenstand/70056590/');
		const barterTab = page.locator('[data-reiter-knopf="barter"]');
		if (await barterTab.count()) {
			await barterTab.click();
			await page.waitForTimeout(400);
		}
		assert.equal(await page.locator('#item-tab-barter .wo-liste').count(), 0,
			'Ortsangabe in einer Händlerquelle');

		/* A short source list names its places compactly: name, coordinates and
		   both actions, without a map of its own. */
		await open(page, '/de/rezept/7001C145/');
		await page.waitForSelector('.wo-liste', { state: 'attached' });
		const rezeptWo = page.locator('.wo-liste:visible').filter({ has: page.locator('a[href*="haendler="]') }).first();
		await rezeptWo.locator('summary').click();
		const rezeptOrte = await leseQuelle(rezeptWo.locator('li.wo-ort'));
		assert.ok(rezeptOrte.length > 0, 'Kurze Rezeptquelle ohne Standort');
		assert.ok(rezeptOrte.every((ort) => ort.hrefs.some((href) => href && href.includes('haendler='))),
			'Händlerstandort ohne Kartenlink');
		assert.equal(await rezeptWo.locator('.llb-karte').count(), 0, 'Karte in einer Rezeptquelle');

		/* The same place as the vendor page: same coordinates, same actions. */
		const haendlerId = (rezeptOrte[0].hrefs.find((href) => href.includes('haendler=')).match(/haendler=([0-9A-F]+)/) || [])[1];
		assert.ok(haendlerId, 'Quelle ohne Händlerkennung');
		await open(page, '/de/haendler/' + haendlerId + '/');
		const woTab = page.locator('[data-reiter-knopf="wo"]');
		if (await woTab.count()) { await woTab.click(); await page.waitForTimeout(400); }
		const seite = await leseZeilen(page.locator('.llb-ort-wahl-liste li'));
		if (seite.length) {
			assert.ok(seite.some((ort) => ort.coords === rezeptOrte[0].coords),
				'Quellenliste und Händlerseite zeigen nicht denselben Ort');
		}

		/* Detail pages: one place is a block, several are the picker. */
		await open(page, '/de/auftraggeber/700757CF/');
		assert.equal(await page.locator('.llb-ort:not(.llb-ort-wahl)').count(), 1, 'Einzelner Ort ohne Block');
		assert.equal(await page.locator('.llb-ort-wahl').count(), 0, 'Einzelner Ort als Ortswahl');

		await open(page, '/de/auftraggeber/70062287/');
		assert.equal(await page.locator('.llb-ort-wahl').count(), 1, 'Mehrere Orte ohne Ortswahl');
		assert.ok(await page.locator('.llb-ort-wahl .llb-karte').count(), 'Ortswahl ohne Karte');

		await open(page, '/de/haendler/700563B1/');
		/* The vendor page starts on its goods; the places sit in the "Wo" tab. */
		await page.click('[data-reiter-knopf="wo"]');
		const bild = page.locator('[data-ort-bild]').first();
		if (await page.locator('.llb-ort-wahl-liste button.ort-zeile').count() > 1) {
			const vorher = await bild.getAttribute('src');
			await page.locator('.llb-ort-wahl-liste button.ort-zeile').nth(1).click();
			assert.notEqual(await bild.getAttribute('src'), vorher, 'Ortswahl schaltet die Karte nicht');
		}

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
			'Quellenliste drückt die Seite mobil auseinander');

		assert.deepEqual(fehler, [], 'JavaScript-Fehler: ' + fehler.join(' | '));
		await context.close();
		console.log('Orte: Detailseiten Block/Ortswahl, Quellen kompakt ohne Karte, Kartenpunkte ok');
	} finally {
		await browser.close();
	}
})().catch((error) => { console.error(error); process.exitCode = 1; });
