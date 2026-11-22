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

		/* Every topic stays in "Weitere Inhalte", also after a visit to an area:
		   the loaded shard of one area must not decide which topics exist. */
		const themen = await page.locator('.aufgaben-thema strong').allTextContents();
		assert.equal(themen.length, 9, 'Weitere Inhalte unvollständig: ' + themen.join(', '));
		assert.ok(themen.includes('Handwerk'), 'Handwerk fehlt in Weitere Inhalte');
		await page.locator('.landschaft-kachel').filter({ hasText: /^Breeland/ }).first().click();
		await page.waitForFunction(() => location.hash === '#map-268437653');
		await page.locator('.karten-pfad a').first().click();
		await page.waitForTimeout(1500);
		assert.deepEqual(await page.locator('.aufgaben-thema strong').allTextContents(), themen,
			'Weitere Inhalte verliert Themen nach dem Gebietsbesuch');

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
		/* Lazy previews may still arrive; wait until the count stays put, else the
		   budget below measures the tail of the page load instead of the search. */
		await page.waitForFunction(() => {
			const anzahl = performance.getEntriesByType('resource').length;
			if (window.__ruhig === anzahl) { return true; }
			window.__ruhig = anzahl;
			return false;
		}, null, { polling: 300, timeout: 15000 });
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
		/* Alte Geschichten: eine Karte ohne einen einzigen Eintrag ist eine
		   Sackgasse und steht nicht in der Liste; ihr Direktlink lebt weiter. */
		await page.setViewportSize({ width: 1280, height: 900 });
		await page.goto(base + '/de/karte/?gebiet=Alte+Geschichten', { waitUntil: 'load' });
		await page.waitForTimeout(1200);
		const alte = await page.evaluate(() => ({
			namen: [...document.querySelectorAll('#liste li')].map(li => li.textContent),
			baum: [...document.querySelectorAll('#baum .ast')]
				.filter(e => /Nud-melek/.test(e.textContent) && e.offsetParent !== null).length }));
		assert.ok(alte.namen.some(text => /Azanulbizar/.test(text)), 'Alte Geschichten ohne Azanulbizar');
		assert.ok(alte.namen.some(text => /Belagertes Mordor/.test(text)), 'Alte Geschichten ohne Belagertes Mordor');
		assert.equal(alte.namen.some(text => /Nud-melek/.test(text)), false,
			'leere Karte steht in der Liste');
		assert.equal(alte.baum, 0, 'leere Karte steht im Baum');
		await page.goto(base + '/de/karte/#map-268453582', { waitUntil: 'load' });
		await page.waitForTimeout(1500);
		assert.match(await page.evaluate(() => document.getElementById('bild').getAttribute('src') || ''),
			/268453582/, 'Direktlink auf die leere Karte führt nirgends hin');

		assert.deepEqual(errors, [], 'JavaScript-Fehler: ' + errors.join(' | '));
		console.log('Kartenübersicht: Sprungmarken, Gebietszeilen, Karte und Budget ok');
	} finally {
		await browser.close();
	}
})().catch(error => { console.error(error); process.exitCode = 1; });
