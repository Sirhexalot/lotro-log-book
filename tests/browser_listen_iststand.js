'use strict';
/* Listen- und Detaildarstellung: eine Trennlinie, große Icons, gleiche Sprünge.
 * Browser-Prüfskript (Playwright), kein Unit-Test:
 *   node tests/browser_listen_iststand.js http://127.0.0.1:8817
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://127.0.0.1:8817';

(async () => {
	const browser = await chromium.launch({ channel: 'chrome' });
	try {
		const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

		await page.goto(base + '/de/gegenstandssuche/', { waitUntil: 'load' });
		await page.locator('#gs-ergebnis tbody tr td').first().waitFor();
		const border = await page.locator('#gs-ergebnis tbody tr td').first().evaluate(cell => ({
			top: getComputedStyle(cell).borderTopWidth,
			bottom: getComputedStyle(cell).borderBottomWidth,
		}));
		assert.ok((border.top === '1px') !== (border.bottom === '1px'), 'Ergebniszeile hat doppelte Trennlinien');
		assert.equal(Math.round((await page.locator('.mql-row-icon').first().boundingBox()).width), 64);

		await page.goto(base + '/de/aufgabe/70000003/', { waitUntil: 'load' });
		const reward = page.locator('.katalog-gabe .mql-row-icon').first();
		await reward.waitFor();
		assert.equal(Math.round((await reward.boundingBox()).width), 64, 'Belohnungsicon ist zu klein');
		/* Die Kachel ist 64 px; das Bild füllt 75 % ihrer Innenfläche (48 minus
		 * Rahmen). Geprüft wird das Verhältnis, nicht ein runder Pixelwert. */
		const kachelBreite = (await reward.boundingBox()).width;
		const bildBreite = (await reward.locator('img').boundingBox()).width;
		assert.equal(Math.round(kachelBreite), 64, 'Belohnungskachel ist ' + kachelBreite + ' px');
		assert.ok(bildBreite / kachelBreite > 0.7 && bildBreite / kachelBreite < 0.78,
			'Belohnungsbild füllt ' + Math.round(bildBreite / kachelBreite * 100) + ' % der Kachel');

		await page.goto(base + '/de/karte/', { waitUntil: 'load' });
		await page.locator('.landschaft-spruenge a').first().waitFor();
		const jumpStyles = await page.locator('.landschaft-spruenge a').evaluateAll(nodes => nodes.map(node => {
			const style = getComputedStyle(node);
			return [style.borderTopStyle, style.padding, style.fontSize].join('|');
		}));
		assert.equal(new Set(jumpStyles).size, 1, 'Sprungmarken sehen unterschiedlich aus');
		const groupBorder = await page.locator('.landschaft-kachel[data-gebietgruppe]').first()
			.evaluate(node => getComputedStyle(node).borderTopWidth);
		assert.equal(groupBorder, '0px', 'Gruppenkarte hat einen farbigen Oberrand');

		await page.goto(base + '/de/handwerk/rezepte/', { waitUntil: 'load' });
		await page.locator('[data-reiter-knopf]').first().waitFor();
		assert.equal(await page.locator('[data-reiter-knopf]').count(), 2, 'Handwerk hat zwei Reiter');
		assert.equal(await page.locator('[data-reiter-knopf="rezepte"]').getAttribute('aria-selected'), 'true');
		console.log('Listen-Iststand: Trennlinien, Icons, Sprungmarken und Handwerk ok');
	} finally {
		await browser.close();
	}
})().catch(error => { console.error(error); process.exitCode = 1; });
