'use strict';
/* Remaining entity details: source lists, item type, recipe critical result.
 *
 * Usage: node tests/browser_entity_sources.js [http://127.0.0.1:8813]
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const basis = (process.argv[2] || 'http://127.0.0.1:8813').replace(/\/$/, '');

(async () => {
	const browser = await chromium.launch({ channel: 'chrome' });
	try {
		const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
		const errors = [];
		page.on('pageerror', (e) => errors.push(e.message));
		await page.addInitScript(() => localStorage.setItem('mql.charaktere', JSON.stringify({
			aktiv: 'audit',
			liste: { audit: { key: 'audit', name: 'Audit', server: 'Test',
				quests: ['70047A58'], deeds: [], rezepte: [], handwerk: {}, ruf: [['70057CC8', 4, 1234]],
				importMeta: { quests: true, deeds: false, crafting: false, recipes: false, reputation: true } } }
		})));

		// Landmark: complete quest list with search and marks.
		await page.goto(basis + '/de/landmarke/70047384/', { waitUntil: 'networkidle' });
		const landmark = await page.evaluate(() => ({
			marken: document.querySelectorAll('.quellen-marke').length,
			fertig: document.querySelectorAll('.quellen-marke.fertig').length,
			suche: !!document.querySelector('[data-quellen-suche]')
		}));
		assert.ok(landmark.marken > 0, 'Landmarke ohne Marken');
		assert.ok(landmark.fertig >= 1, 'Landmarke ohne erledigten Nachweis');
		assert.ok(landmark.suche, 'Landmarke ohne Suche');

		// Title: short list, still marked, no search clutter.
		await page.goto(basis + '/de/titel/70006369/', { waitUntil: 'networkidle' });
		assert.ok(await page.locator('.quellen-marke').count() > 0, 'Titel ohne Marken');

		// Virtue: deed sources stay neutral because deeds were not imported.
		await page.goto(basis + '/de/tugend/268440448/', { waitUntil: 'networkidle' });
		assert.equal(await page.locator('.quellen-marke.fertig').count(), 0, 'Tatmarke ohne Tatdaten');

		// Faction: marks and own standing, both from the imported types.
		await page.goto(basis + '/de/fraktion/70057CC8/', { waitUntil: 'networkidle' });
		assert.ok(await page.locator('.quellen-marke').count() > 0, 'Fraktion ohne Marken');
		assert.match(await page.locator('#fraktion-ruf').innerText(), /Audit/);

		// Item: type line and search over the usage list.
		await page.goto(basis + '/de/gegenstand/70001B7E/', { waitUntil: 'networkidle' });
		assert.equal(await page.locator('.katalog-art .symbol').count(), 1, 'Gegenstandsart ohne Icon');
		assert.equal(await page.locator('[data-quellen-suche]').count(), 1, 'Verwendungsliste ohne Suche');

		// Recipe: critical result links to its own item page.
		await page.goto(basis + '/de/rezept/70005795/', { waitUntil: 'networkidle' });
		assert.equal(await page.locator('a[href="/de/gegenstand/70005797/"]').count(), 1, 'Kritischer Erfolg ohne Itemlink');

		// Set: both jumps exist and reach their sections.
		await page.goto(basis + '/de/set/7000FAE9/', { waitUntil: 'networkidle' });
		assert.equal(await page.locator('a[href="#setteile"]').count(), 1);
		assert.equal(await page.locator('a[href="#setboni"]').count(), 1);
		assert.equal(await page.locator('#setteile').count(), 1);
		assert.equal(await page.locator('#setboni').count(), 1);

		assert.deepEqual(errors, []);
		console.log('Quellenlisten, Gegenstandsart, kritischer Erfolg und Set-Sprünge ok');
		await page.close();
	} finally {
		await browser.close();
	}
})().catch((e) => { console.error(e); process.exitCode = 1; });
