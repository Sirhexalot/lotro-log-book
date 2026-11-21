'use strict';
/* Klappe: ein Panel, das sein Knopf öffnet, Escape und ein Klick außerhalb
 * schließen; der Fokus kehrt zum Knopf zurück.
 *
 *   node tests/browser_klappe.js http://127.0.0.1:8817
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const base = (process.argv[2] || 'http://127.0.0.1:8817').replace(/\/$/, '');

(async () => {
	const browser = await chromium.launch({ channel: 'chrome' });
	try {
		for (const design of ['dark', 'light']) {
			const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
			const page = await context.newPage();
			const fehler = [];
			page.on('pageerror', (e) => fehler.push(design + ': ' + e.message));
			await page.addInitScript((wert) => {
				try { localStorage.setItem('mql.theme', wert); } catch (e) { /* egal */ }
			}, design);

			await page.goto(base + '/de/karte/', { waitUntil: 'load' });
			/* Die Kartenwerkzeuge erscheinen erst mit einer geöffneten Landschaft. */
			const karte = page.locator('#landschaften button').filter({ hasText: /^Breeland/ }).first();
			await karte.waitFor({ timeout: 20000 });
			await karte.click();
			await page.waitForFunction(() => document.querySelectorAll('#liste li .qname').length > 0, null, { timeout: 20000 });
			const knopf = page.locator('#notizen-knopf');
			const feld = page.locator('#notizen-feld');
			await knopf.waitFor({ timeout: 20000 });

			assert.equal(await feld.isHidden(), true, design + ': Panel startet offen');
			assert.equal(await knopf.getAttribute('aria-expanded'), 'false', design + ': aria-expanded startet falsch');

			await knopf.click();
			assert.equal(await feld.isVisible(), true, design + ': Panel öffnet nicht');
			assert.equal(await knopf.getAttribute('aria-expanded'), 'true', design + ': aria-expanded beim Öffnen');

			const stil = await feld.evaluate((node) => {
				const s = getComputedStyle(node);
				return { rahmen: s.borderTopWidth, flaeche: s.backgroundColor };
			});
			assert.equal(stil.rahmen, '1px', design + ': Panel ohne Rahmen');
			assert.notEqual(stil.flaeche, 'rgba(0, 0, 0, 0)', design + ': Panel ohne Fläche');

			await page.keyboard.press('Escape');
			assert.equal(await feld.isHidden(), true, design + ': Escape schließt nicht');
			assert.equal(await page.evaluate(() => document.activeElement?.id), 'notizen-knopf',
				design + ': Fokus kehrt nicht zum Knopf zurück');

			await knopf.click();
			assert.equal(await feld.isVisible(), true, design + ': zweites Öffnen');
			await page.locator('#liste-titel').click({ position: { x: 2, y: 2 } });
			assert.equal(await feld.isHidden(), true, design + ': Klick außerhalb schließt nicht');

			assert.deepEqual(fehler, [], 'JS-Fehler: ' + fehler.join(' | '));
			await context.close();
		}
		console.log('Klappe: Öffnen, Escape, Klick außerhalb und Fokus in dunkel und hell geprüft');
	} finally {
		await browser.close();
	}
})().catch((error) => { console.error(error); process.exitCode = 1; });
