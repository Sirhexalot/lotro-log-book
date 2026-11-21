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
		for (const label of ['Eriador', 'Dunland', 'Rohan', 'Weitere Inhalte']) {
			assert.ok(jumps.some(text => text.includes(label)), 'Sprungmarke fehlt: ' + label);
		}
		assert.equal(jumps.some(text => /Ost-Rohan|West-Rohan|East Rohan|West Rohan|Rohan oriental|Rohan occidental/.test(text)), false,
			'Ost- oder West-Rohan hat eine eigene Sprungmarke');
		assert.ok(await page.locator('#gruppe-east-rohan').count(), 'Ost-Rohan-Gruppe fehlt');
		assert.ok(await page.locator('#gruppe-west-rohan').count(), 'West-Rohan-Gruppe fehlt');
		const dunland = await page.evaluate(() => {
			const head = document.getElementById('gruppe-dunland');
			const cards = [...head.parentElement.children].filter(node => node.classList.contains('landschaft-mit-orten'));
			const start = cards.findIndex(node => node.textContent.includes('Übersichtskarte'));
			return cards.slice(start).filter(node => node.querySelector('img')).map(node => node.querySelector('strong')?.textContent || '');
		});
		assert.ok(dunland.length >= 8, 'Dunland zeigt nicht alle Gebiete als Karten: ' + dunland.join(', '));
		assert.ok(dunland.includes('Isengart'), 'Isengart fehlt in den Dunland-Karten');

		for (const path of ['/de/karte/', '/de/karte/taten/']) {
			await page.goto(base + path, { waitUntil: 'load' });
			const search = page.locator('.landschaft-suche');
			await search.waitFor();
			await search.fill('Isengart');
			const matches = await page.locator('.landschaft-kachel:visible strong').allTextContents();
			assert.ok(matches.includes('Isengart'), 'Isengart-Suche findet die Karte nicht: ' + path);
			await page.locator('.landschaft-kachel').filter({ hasText: /^Isengart/ }).first().click();
			await page.waitForFunction(() => location.hash === '#map-268446985');
		}

		await page.goto(base + '/de/karte/', { waitUntil: 'load' });
		await page.locator('.landschaft-kachel').filter({ hasText: /^Isengart/ }).first().click();
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
