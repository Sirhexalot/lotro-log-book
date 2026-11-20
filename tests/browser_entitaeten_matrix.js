'use strict';
/* Jede Entität: Listendarstellung und Detailseite.
 * Browser-Prüfskript (Playwright), kein Unit-Test:
 *   node tests/browser_entitaeten_matrix.js http://127.0.0.1:8817
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://127.0.0.1:8817';
const matrix = JSON.parse(fs.readFileSync(path.join(__dirname, 'entitaeten_matrix.json'), 'utf8'));

(async () => {
	const browser = await chromium.launch({ channel: 'chrome' });
	try {
		const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
		const errors = [];
		page.on('pageerror', error => errors.push(error.message));
		for (const entity of matrix.entities) {
			if (entity.list) {
				const response = await page.goto(base + entity.list, { waitUntil: 'load' });
				assert.equal(response.status(), 200, entity.kind + ' Liste');
				const rows = page.locator(entity.row);
				await rows.first().waitFor({ timeout: 15000 });
				assert.ok(await rows.count() > 0, entity.kind + ' Liste ohne Zeilen');
				if (entity.row === '.mql-row') {
					const first = rows.first();
					const border = await first.evaluate(row => ({
						top: getComputedStyle(row).borderTopWidth,
						bottom: getComputedStyle(row).borderBottomWidth,
					}));
					assert.ok(!(border.top === '1px' && border.bottom === '1px'), entity.kind + ': doppelte Trennlinie');
					const icons = await first.locator('.mql-row-icon').count();
					assert.equal(icons, 1, entity.kind + ': Icon fehlt');
					const iconBox = await first.locator('.mql-row-icon').first().boundingBox();
					assert.ok(iconBox, entity.kind + ': Icon nicht sichtbar');
					assert.equal(Math.round(iconBox.width), 64, entity.kind + ': Icon nicht 64 px');
					assert.ok(await page.locator('.mql-row-heading').count() > 0, entity.kind + ': Spaltenkopf fehlt');
				}
			}
			if (entity.detail) {
				const response = await page.goto(base + entity.detail, { waitUntil: 'load' });
				assert.equal(response.status(), 200, entity.kind + ' Detail');
				assert.ok((await page.locator('.katalog-kopf h1').innerText()).trim(), entity.kind + ': Titel fehlt');
				assert.ok((await page.locator('.katalog-art').innerText()).trim(), entity.kind + ': Entitätstyp fehlt');
				assert.ok(await page.locator('article').count() > 0, entity.kind + ': Inhalt fehlt');
				await page.setViewportSize({ width: 390, height: 844 });
				assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false,
					entity.kind + ': Detail läuft mobil über');
				await page.setViewportSize({ width: 1280, height: 900 });
			}
		}
		assert.deepEqual(errors, [], 'JavaScript-Fehler: ' + errors.join(' | '));
		console.log('Entitätenmatrix: ' + matrix.entities.length + ' Auftritte geprüft');
	} finally {
		await browser.close();
	}
})().catch(error => { console.error(error); process.exitCode = 1; });
