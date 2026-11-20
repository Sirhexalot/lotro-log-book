'use strict';
/* Gesamtkartenübersicht: Sprungmarken, Gruppen-Gebiete und lokales Budget.
 * Browser-Prüfskript (Playwright), kein Unit-Test:
 *   node tests/browser_kartenuebersicht.js http://127.0.0.1:8814
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://127.0.0.1:8814';

(async () => {
	const browser = await chromium.launch({ channel: 'chrome' });
	try {
		const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
		const errors = [];
		page.on('pageerror', error => errors.push(error.message));
		await page.goto(base + '/de/karte/', { waitUntil: 'load' });
		await page.locator('.landschaft-spruenge a').first().waitFor();
		const jumps = await page.locator('.landschaft-spruenge a').allTextContents();
		for (const label of ['Eriador', 'Dunland', 'Ost-Rohan', 'West-Rohan', 'Weitere Inhalte']) {
			assert.ok(jumps.some(text => text.includes(label)), 'Sprungmarke fehlt: ' + label);
		}
		const dunland = await page.locator('.landschaft-gruppeorte').first().locator('a').allTextContents();
		assert.ok(dunland.length >= 7, 'Dunland zeigt nicht alle Gebiete');
		assert.ok(dunland.some(text => text.startsWith('Isengart')), 'Isengart fehlt in der Gebietszeile');

		await page.locator('.landschaft-gruppeorte a').filter({ hasText: /^Isengart/ }).first().click();
		await page.waitForFunction(() => location.hash === '#map-268446985');
		assert.equal(await page.locator('#liste-titel, #listen-titel').first().textContent(), 'Isengart');

		await page.goto(base + '/de/karte/', { waitUntil: 'load' });
		await page.locator('.landschaft-suche').waitFor();
		const before = await page.evaluate(() => performance.getEntriesByType('resource').length);
		const budget = await page.evaluate(() => {
			const input = document.querySelector('.landschaft-suche');
			const measure = value => {
				const start = performance.now();
				input.value = value;
				input.dispatchEvent(new Event('input', { bubbles: true }));
				return performance.now() - start;
			};
			const empty = measure('');
			const search = measure('Dunland');
			measure('');
			return { empty, search };
		});
		const after = await page.evaluate(() => performance.getEntriesByType('resource').length);
		assert.equal(after, before, 'Suche löst zusätzliche Netzwerkrequests aus');
		assert.ok(budget.empty < 20, 'Übersichtsaufbau zu langsam: ' + budget.empty);
		assert.ok(budget.search < 5, 'Suche zu langsam: ' + budget.search);

		await page.setViewportSize({ width: 390, height: 844 });
		await page.reload({ waitUntil: 'load' });
		await page.locator('.landschaft-suche').waitFor();
		assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false,
			'Übersicht läuft mobil seitlich über');
		assert.deepEqual(errors, [], 'JavaScript-Fehler: ' + errors.join(' | '));
		console.log('Kartenübersicht: Sprungmarken, Gebietszeilen, Karte und Budget ok');
	} finally {
		await browser.close();
	}
})().catch(error => { console.error(error); process.exitCode = 1; });
