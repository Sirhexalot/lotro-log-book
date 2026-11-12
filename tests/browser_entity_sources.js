'use strict';
/* Entity detail lists reuse the public list adapters with a fixed context.
 *
 * A landmark, title, virtue, faction or item page must offer the same list,
 * filter and search as the standalone catalogue, only restricted to the entity
 * in question. Marks appear only when that data type was imported.
 *
 * Usage: node tests/browser_entity_sources.js [http://127.0.0.1:8813]
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const basis = (process.argv[2] || 'http://127.0.0.1:8813').replace(/\/$/, '');

async function bereit(page, area) {
	await page.waitForFunction((teil) => window.MQL_RELATED_FILTER
		&& (!teil || window.MQL_RELATED_FILTER.config.area.startsWith(teil))
		&& document.querySelector('.filter-result-toolbar [role=status]')?.textContent.match(/\d/), area);
}

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

		// Landmark: its quests as a real list with the quest filters.
		await page.goto(basis + '/de/landmarke/70047384/', { waitUntil: 'networkidle' });
		await bereit(page, 'related-q');
		// All eight quests share region and area, so those groups are gone; what
		// separates them is the quest property, never the mixed quest category.
		assert.deepEqual(await page.$$eval('.filter-group', (gs) => gs.map((g) => g.dataset.key)), ['flag', 'status']);
		assert.equal(await page.locator('.filter-group-multi').count(), 1, 'Merkmalsfilter in der Landmarke');
		assert.equal(await page.locator('.filter-ui input[type=search]').count(), 1, 'Suche in der Landmarke');
		assert.ok(await page.locator('.related-symbol.fertig').count() > 0, 'Landmarke ohne erledigten Nachweis');
		assert.equal(await page.locator('.related-results').evaluate((n) => n.classList.contains('related-results')), true);

		// Title: the awarding quests, complete with search.
		await page.goto(basis + '/de/titel/70006369/', { waitUntil: 'networkidle' });
		await bereit(page);
		assert.ok(await page.locator('.related-results > li').count() > 0, 'Titel ohne Quellen');

		// Virtue: deed sources stay unmarked because deeds were not imported.
		await page.goto(basis + '/de/tugend/268440448/', { waitUntil: 'networkidle' });
		await bereit(page, 'related-d');
		assert.ok(await page.locator('.related-results > li').count() > 0, 'Tugend ohne Quellen');
		assert.equal(await page.locator('.related-symbol.fertig').count(), 0, 'Tatmarke ohne Tatdaten');

		// Faction: two source tabs (quests, deeds) and the own standing.
		await page.goto(basis + '/de/fraktion/70057CC8/', { waitUntil: 'networkidle' });
		await bereit(page);
		assert.deepEqual(await page.$$eval('[data-related-type]', (bs) => bs.map((b) => b.dataset.relatedType)), ['q', 'd']);
		assert.match(await page.locator('#fraktion-ruf').innerText(), /Audit/);

		// Item: type line, whole usage list in the recipe adapter, no ownership.
		await page.goto(basis + '/de/gegenstand/70001B7E/', { waitUntil: 'networkidle' });
		await bereit(page, 'related-recipe');
		assert.equal(await page.locator('.katalog-art .symbol').count(), 1, 'Gegenstandsart ohne Icon');
		assert.match(await page.locator('.filter-result-toolbar').innerText(), /95/);
		assert.equal(await page.locator('.related-results tbody tr').count(), 50);
		assert.equal(await page.locator('.related-symbol').count(), 0, 'Besitzstatus auf der Gegenstandsseite');

		// Recipe: critical result links to its own item page.
		await page.goto(basis + '/de/rezept/70005795/', { waitUntil: 'networkidle' });
		assert.equal(await page.locator('a[href="/de/gegenstand/70005797/"]').count(), 1, 'Kritischer Erfolg ohne Itemlink');
		assert.equal(await page.locator('.filter-ui').count(), 0, 'Rezept ohne eingebettete Liste');

		// Set: both jumps exist and reach their sections.
		await page.goto(basis + '/de/set/7000FAE9/', { waitUntil: 'networkidle' });
		assert.equal(await page.locator('a[href="#setteile"]').count(), 1);
		assert.equal(await page.locator('a[href="#setboni"]').count(), 1);
		assert.equal(await page.locator('#setteile').count(), 1);
		assert.equal(await page.locator('#setboni').count(), 1);

		assert.deepEqual(errors, []);
		console.log('Quellenlisten als gemeinsame Filter, Gegenstandsart, kritischer Erfolg und Set-Sprünge ok');
		await page.close();
	} finally {
		await browser.close();
	}
})().catch((e) => { console.error(e); process.exitCode = 1; });
