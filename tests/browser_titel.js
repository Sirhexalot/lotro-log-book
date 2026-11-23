'use strict';
/* Titles: client catalogue, title kind filter, the shared result table and
 * pages without a source.
 *
 *   node tests/browser_titel.js http://127.0.0.1:8817
 *
 * The filter values are localised (like the deed kinds), so the English list
 * uses "Crafting" where German says "Handwerk". The list is the reference for
 * the server-side filter model: the definition is written by PHP and read by
 * filter-server.js, the head sorts in place and stays a link without JS.
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const base = (process.argv[2] || process.env.LLB_URL || 'http://127.0.0.1:8817').replace(/\/$/, '');

const SPRACHEN = [
	{ lang: 'de', pfad: '/de/titel/', filter: 'Titelart', handwerk: 'Handwerk', entwurf: 'Tat' },
	{ lang: 'en', pfad: '/en/title/', filter: 'Title kind', handwerk: 'Crafting', entwurf: 'Deed' },
	{ lang: 'fr', pfad: '/fr/titre/', filter: 'Type de titre', handwerk: 'Artisanat', entwurf: 'Prouesse' },
];

async function sortiere(page) {
	await page.evaluate(() => {
		document.querySelector('.filter-ui table.llb-tabelle thead [data-sort-key]').click();
	});
}

(async () => {
	const browser = await chromium.launch();
	try {
		for (const sprache of SPRACHEN) {
			const context = await browser.newContext({ viewport: { width: 1180, height: 900 } });
			await context.route(/googletagmanager|google-analytics|goatcounter|gc\.zgo\.at/, (r) => r.abort());
			const page = await context.newPage();
			const fehler = [];
			page.on('pageerror', (e) => fehler.push(e.message));

			await page.goto(base + sprache.pfad, { waitUntil: 'networkidle' });
			await page.waitForSelector('.filter-ui table.llb-tabelle tbody tr');
			const zahl = (await page.locator('.filter-result-toolbar [role=status]').first().innerText()).replace(/[^0-9]/g, '');
			assert.ok(Number(zahl) > 3000, sprache.lang + ': Titelkatalog zu klein: ' + zahl);

			/* The server writes the definition; the shell reads it. */
			const model = await page.evaluate(() => {
				const script = document.querySelector('.sets-browser script[data-filter-model]');
				return script ? JSON.parse(script.textContent) : null;
			});
			assert.ok(model && model.definition, sprache.lang + ': Filtermodel fehlt');
			assert.deepEqual(model.definition.groups.map((g) => g.id),
				['region', 'area', 'kind', 'cat', 'art'], sprache.lang + ': Gruppenreihenfolge');
			assert.equal(model.definition.columns[0].sortierung, 'name', sprache.lang + ': Namensspalte');

			/* One table, one sortable head, the active direction in the head. */
			assert.equal(await page.locator('.filter-ui table.llb-tabelle').count(), 1, sprache.lang + ': Tabelle');
			assert.equal(await page.locator('.filter-ui table.llb-tabelle thead th').count(), 1, sprache.lang + ': eine Spalte');
			assert.equal(await page.locator('.filter-ui table.llb-tabelle thead th').getAttribute('aria-sort'), 'ascending', sprache.lang + ': Ausgangsrichtung');
			assert.equal(await page.locator('.filter-ui table.llb-tabelle tbody tr').count(), 30, sprache.lang + ': 30 pro Seite');

			/* Clicking the head sorts in place and names the address. */
			await sortiere(page);
			await page.waitForFunction(() => document.querySelector('.filter-ui table.llb-tabelle thead th')?.getAttribute('aria-sort') === 'descending');
			assert.match(page.url(), /[?&]sort=-name(&|#|$)/, sprache.lang + ': Sortieradresse');
			await sortiere(page);
			await page.waitForFunction(() => document.querySelector('.filter-ui table.llb-tabelle thead th')?.getAttribute('aria-sort') === 'ascending');
			assert.doesNotMatch(page.url(), /sort=-name/, sprache.lang + ': Rückrichtung');

			/* The title kind is its own group; the deed kind keeps its name. */
			const gruppe = page.locator('.filter-ui details.filter-group').filter({ hasText: sprache.filter }).first();
			assert.equal(await gruppe.count(), 1, sprache.lang + ': Filtergruppe Titelkatalog fehlt');

			/* A title without a quest or deed: filtering by its kind still finds it. */
			const handwerk = gruppe.locator('label').filter({ hasText: sprache.handwerk }).first();
			await handwerk.locator('input').check();
			await page.waitForFunction(
				(erwartet) => document.querySelector('.filter-result-toolbar [role=status]')?.textContent.includes(erwartet),
				'328', { timeout: 20000 });
			const zeilen = await page.locator('.filter-ui .gs-meta').allInnerTexts();
			assert.ok(zeilen.length, sprache.lang + ': keine Zeilen nach dem Filter');
			// A few crafting titles are also awarded by a deed; those rows name
			// the source instead of the kind. Every row says one of the two.
			assert.ok(zeilen.every((zeile) => zeile.trim() !== ''),
				sprache.lang + ': Zeile ohne Angabe');
			assert.ok(zeilen.some((zeile) => zeile.includes(sprache.handwerk)),
				sprache.lang + ': keine Zeile mit der Titelart ' + sprache.handwerk);

			/* One page without a source never shows an empty source heading. */
			await page.goto(base + sprache.pfad + '70001A6A/', { waitUntil: 'networkidle' });
			assert.equal(await page.locator('h2').filter({ hasText: /Quellen|Sources|Sources/ }).count(), 0,
				sprache.lang + ': leere Quellen-Überschrift');
			assert.equal((await page.locator('.katalog-chip').first().innerText()).trim(), sprache.handwerk,
				sprache.lang + ': Titelart fehlt auf der Seite');

			/* A title that a deed awards keeps its source list. */
			await page.goto(base + sprache.pfad + '70005D97/', { waitUntil: 'networkidle' });
			assert.ok(await page.locator('.quellen-liste li').count() > 0,
				sprache.lang + ': Quellen einer verliehenen Tat fehlen');

			/* Mobile: one column, no horizontal overflow. */
			await page.setViewportSize({ width: 390, height: 844 });
			await page.goto(base + sprache.pfad, { waitUntil: 'networkidle' });
			await page.waitForSelector('.filter-ui table.llb-tabelle tbody tr');
			assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false,
				sprache.lang + ': Titelliste läuft mobil seitlich über');

			assert.deepEqual(fehler, [], sprache.lang + ': JavaScript-Fehler: ' + fehler.join(' | '));
			await context.close();
			console.log(sprache.lang + ': Titelkatalog, Filtermodel, Tabelle, Sortierung und Seiten ohne Quelle ok');
		}

		/* Without JavaScript the head is a link and the server sorts. */
		const context = await browser.newContext({ javaScriptEnabled: false });
		const page = await context.newPage();
		await page.goto(base + '/de/titel/', { waitUntil: 'domcontentloaded' });
		assert.equal(await page.locator('table.llb-tabelle tbody tr').count(), 30);
		await page.locator('table.llb-tabelle thead a[data-sort-key]').click();
		await page.waitForLoadState('domcontentloaded');
		assert.equal(await page.locator('table.llb-tabelle thead th').getAttribute('aria-sort'), 'descending');
		assert.match(page.url(), /sort=-name/);
		await context.close();
		console.log('ohne JavaScript: Kopf ist ein Link, der Server sortiert');
	} finally {
		await browser.close();
	}
})().catch((error) => { console.error(error); process.exitCode = 1; });
