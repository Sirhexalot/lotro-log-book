'use strict';
/* Schadensart im Gegenstandsfinder: eigener Filter, Waffen-Zweig unverändert.
 *
 *   node tests/browser_schadensart.js http://127.0.0.1:8817
 *
 * The check pins what a data change must not break: seven categories, the same
 * tree shape, the damage types of the game, a selection that narrows the list,
 * an address that survives a reload and a reset that brings everything back.
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const base = (process.argv[2] || process.env.LLB_URL || 'http://127.0.0.1:8817').replace(/\/$/, '');
const seiten = [['de', '/de/gegenstandssuche/'], ['en', '/en/item-search/'],
	['fr', '/fr/recherche-objets/']];
const zuruecksetzen = { de: 'Filter zurücksetzen', en: 'Clear filters', fr: 'Réinitialiser les filtres' };

(async () => {
	const browser = await chromium.launch({ channel: 'chrome' });
	try {
		for (const [lang, pfad] of seiten) {
			const context = await browser.newContext({ viewport: { width: 1280, height: 950 } });
			const page = await context.newPage();
			const fehler = [];
			page.on('pageerror', (e) => fehler.push(String(e)));
			const bereit = () => page.waitForFunction(
				() => window.MQL_ITEM_FILTER && !document.querySelector('[data-filter-results]').hasAttribute('aria-busy'),
				{ timeout: 60000 });

			await page.goto(base + pfad, { waitUntil: 'load' });
			await bereit();

			/* Categories and the tree stay as they were; the damage type is an
			 * additional group, not a third level under the weapons. */
			const kategorien = await page.evaluate(() => MQL_GEGENSTAENDE.kat.length);
			assert.equal(kategorien, 7, lang + ': Kategorien verändert');
			const baumKategorien = await page.evaluate(() => Array.from(
				document.querySelectorAll('input[data-filter-key^="tree:"]')).filter((n) => {
				try { return Object.keys(JSON.parse(n.dataset.filterKey.slice(5))).join() === 'kat'; }
				catch (e) { return false; }
			}).length);
			assert.equal(baumKategorien, 7, lang + ': Kategoriebaum verändert');

			const arten = await page.evaluate(() => MQL_GEGENSTAENDE.schadenKey);
			assert.ok(arten.length >= 8, lang + ': zu wenige Schadensarten');
			assert.equal(await page.evaluate(() => Array.from(
				document.querySelectorAll('input[data-filter-key^="schaden:"]')).length),
			arten.length, lang + ': Filter bietet nicht alle Arten an');

			/* Every candidate is a weapon, and every weapon carries a type. */
			const daten = await page.evaluate(() => {
				const rows = MQL_GEGENSTAENDE.e, waffen = new Set(['WEAPON', 'LEGENDARY_WEAPON']);
				return {
					waffenOhne: rows.filter((r) => waffen.has(MQL_GEGENSTAENDE.katKey[r[3]]) && r[17] < 0).length,
					andereMit: rows.filter((r) => !waffen.has(MQL_GEGENSTAENDE.katKey[r[3]]) && r[17] >= 0).length
				};
			});
			assert.equal(daten.waffenOhne, 0, lang + ': Waffe ohne Schadensart');
			assert.equal(daten.andereMit, 0, lang + ': Nichtwaffe mit Schadensart');

			/* A selection narrows the list to exactly those rows. */
			await page.evaluate(() => {
				const feld = Array.from(document.querySelectorAll('input[type=checkbox]'))
					.find((n) => n.dataset.filterKey === 'schaden:"FIRE"');
				feld.click();
			});
			await bereit();
			assert.deepEqual(await page.evaluate(() => MQL_ITEM_FILTER.getState().filters.schaden),
				['FIRE'], lang + ': Auswahl nicht gesetzt');
			const falsch = await page.evaluate(() => {
				const rows = MQL_GEGENSTAENDE.e, keys = MQL_GEGENSTAENDE.schadenKey;
				const erlaubt = new Set(rows.filter((r) => r[17] >= 0 && keys[r[17]] === 'FIRE')
					.map((r) => r[0]));
				return Array.from(document.querySelectorAll('#gs-ergebnis a'))
					.map((a) => (a.getAttribute('href').match(/([0-9A-F]{8})/) || [])[1])
					.filter((id) => id && !erlaubt.has(id));
			});
			assert.deepEqual(falsch, [], lang + ': Treffer ohne diese Schadensart');

			/* The address carries the filter and survives a reload. */
			assert.match(page.url(), /schaden=FIRE/, lang + ': Adresse ohne Filter');
			await page.reload({ waitUntil: 'load' });
			await bereit();
			assert.deepEqual(await page.evaluate(() => MQL_ITEM_FILTER.getState().filters.schaden),
				['FIRE'], lang + ': Filter nach dem Neuladen weg');

			/* Reset clears it; the whole catalogue is back. */
			await page.getByRole('button', { name: zuruecksetzen[lang] }).first().click();
			await bereit();
			assert.deepEqual(await page.evaluate(() => MQL_ITEM_FILTER.getState().filters.schaden),
				[], lang + ': Zurücksetzen lässt die Schadensart stehen');

			/* Mobile: the filter opens and stays inside the screen. */
			await page.setViewportSize({ width: 390, height: 844 });
			assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
				false, lang + ': Finder läuft mobil seitlich über');

			assert.deepEqual(fehler, [], lang + ': JavaScript-Fehler: ' + fehler.join(' | '));
			console.log(lang + ': Schadensart-Filter ok, ' + kategorien + ' Kategorien, ' +
				arten.length + ' Arten');
			await context.close();
		}
	} finally {
		await browser.close();
	}
})().catch((error) => { console.error(error); process.exitCode = 1; });
