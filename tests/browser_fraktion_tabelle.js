'use strict';
/* Faction browser on the PHP filter model: table, sortable head, place tree,
 * "with reputation sources" and the personal reputation column.
 *
 *   node tests/browser_fraktion_tabelle.js http://127.0.0.1:8817
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const base = (process.argv[2] || process.env.LLB_URL || 'http://127.0.0.1:8817').replace(/\/$/, '');
const SPRACHEN = [
	{ lang: 'de', pfad: '/de/fraktion/', mit: 'Mit Rufquellen' },
	{ lang: 'en', pfad: '/en/faction/', mit: 'With reputation sources' },
	{ lang: 'fr', pfad: '/fr/faction/', mit: 'Avec des sources de réputation' },
];

async function sortiere(page) {
	await page.evaluate(() => document.querySelector('.filter-ui table.llb-tabelle thead [data-sort-key]').click());
}

(async () => {
	const browser = await chromium.launch();
	try {
		for (const sprache of SPRACHEN) {
			const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
			await context.route(/googletagmanager|google-analytics|goatcounter|gc\.zgo\.at/, (r) => r.abort());
			const page = await context.newPage();
			const fehler = [];
			page.on('pageerror', (e) => fehler.push(e.message));

			await page.goto(base + sprache.pfad, { waitUntil: 'networkidle' });
			await page.waitForSelector('.filter-ui table.llb-tabelle tbody tr');

			const model = await page.evaluate(() => JSON.parse(
				document.querySelector('.sets-browser script[data-filter-model]').textContent));
			assert.deepEqual(model.definition.groups.map((g) => g.id), ['region', 'area', 'mit'], sprache.lang + ': Gruppen');
			assert.equal(model.definition.columns[0].sortierung, 'name', sprache.lang + ': Namensspalte');
			assert.equal(model.definition.pagination.kind, 'page', sprache.lang + ': Seitenmodus');

			assert.equal(await page.locator('.filter-ui table.llb-tabelle thead th').count(), 2, sprache.lang + ': Spalten');
			assert.equal(await page.locator('.filter-ui table.llb-tabelle thead th').first().getAttribute('aria-sort'), 'ascending', sprache.lang + ': Ausgangsrichtung');
			// Without reputation data the progress column stays hidden.
			assert.equal(await page.locator('.filter-ui table.llb-tabelle thead th').nth(1).isHidden(), true, sprache.lang + ': leere Fortschrittsspalte');
			assert.equal(await page.locator('.filter-ui table.llb-tabelle tbody tr').count(), 30, sprache.lang + ': 30 pro Seite');

			await sortiere(page);
			await page.waitForFunction(() => document.querySelector('.filter-ui table.llb-tabelle thead th')?.getAttribute('aria-sort') === 'descending');
			assert.match(page.url(), /[?&]sort=-name(&|#|$)/, sprache.lang + ': Sortieradresse');

			const gruppe = page.locator('.filter-ui details.filter-group').filter({ hasText: sprache.mit }).first();
			assert.equal(await gruppe.count(), 1, sprache.lang + ': Gruppe ohne Rufquellen');
			await gruppe.locator('input').check();
			await page.waitForFunction(() => new URL(location.href).searchParams.get('mit') === '1');
			assert.match(await page.locator('.filter-result-toolbar [role=status]').innerText(), /\d/, sprache.lang + ': Zähler');

			assert.deepEqual(fehler, [], sprache.lang + ': JavaScript-Fehler: ' + fehler.join(' | '));
			await context.close();
			console.log(sprache.lang + ': Fraktionen, Filtermodel, Tabelle, Sortierung und Rufquellenfilter ok');
		}

		/* Imported reputation: the column appears with the rank and points. */
		const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
		await context.route(/googletagmanager|google-analytics|goatcounter|gc\.zgo\.at/, (r) => r.abort());
		const page = await context.newPage();
		await page.goto(base + '/de/fraktion/', { waitUntil: 'domcontentloaded' });
		await page.waitForSelector('.filter-ui tbody a.gs-zeile');
		const href = await page.locator('.filter-ui tbody a.gs-zeile').first().getAttribute('href');
		const id = href.split('/').filter(Boolean).pop();
		await page.evaluate((id) => localStorage.setItem('mql.charaktere', JSON.stringify({
			aktiv: 'T|T|T', liste: {'T|T|T': {key: 'T|T|T', name: 'Test', server: 'T',
				quests: [], deeds: [], rezepte: [], handwerk: {}, ruf: [[id, 5, 4000]],
				importMeta: {reputation: true}}}
		})), id);
		await page.reload({ waitUntil: 'networkidle' });
		await page.waitForSelector('.filter-ui table.llb-tabelle tbody tr');
		assert.equal(await page.locator('.filter-ui table.llb-tabelle thead th').nth(1).isVisible(), true, 'Fortschrittsspalte mit Import');
		const werte = await page.locator('[data-reputation-value]').evaluateAll((ns) =>
			ns.filter((n) => !n.hidden).map((n) => n.textContent));
		assert.ok(werte.some((wert) => /Rufstufe 5/.test(wert)), 'Rufstufe fehlt: ' + werte.join(' | '));
		await context.close();
		console.log('Import: Fortschrittsspalte, Rufstufe und Punkte erscheinen');

		/* Without JavaScript the head is a link and the server sorts. */
		const nojs = await browser.newContext({ javaScriptEnabled: false });
		const plain = await nojs.newPage();
		await plain.goto(base + '/de/fraktion/', { waitUntil: 'domcontentloaded' });
		assert.equal(await plain.locator('table.llb-tabelle tbody tr').count(), 30);
		await plain.locator('table.llb-tabelle thead a[data-sort-key]').click();
		await plain.waitForLoadState('domcontentloaded');
		assert.equal(await plain.locator('table.llb-tabelle thead th').first().getAttribute('aria-sort'), 'descending');
		assert.match(plain.url(), /sort=-name/);
		await nojs.close();
		console.log('ohne JavaScript: Kopf ist ein Link, der Server sortiert');
	} finally {
		await browser.close();
	}
})().catch((error) => { console.error(error); process.exitCode = 1; });
