'use strict';
/* Language without a language path: browser list wins, chosen language wins
 * over the browser, English is the fallback.
 *
 * Usage: node tests/browser_sprache.js [http://127.0.0.1:8813]
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const basis = (process.argv[2] || 'http://127.0.0.1:8813').replace(/\/$/, '');

async function start(browser, locale) {
	const context = await browser.newContext({ locale });
	const page = await context.newPage();
	await page.goto(basis + '/start.html', { waitUntil: 'networkidle' });
	return { context, page };
}

(async () => {
	const browser = await chromium.launch({ channel: 'chrome' });
	try {
		for (const [locale, ziel] of [['de-DE', '/de/'], ['fr-FR', '/fr/'], ['en-US', '/en/'],
			['nl-NL', '/en/'], ['it-IT', '/en/'], ['fr-CA', '/fr/']]) {
			const { context, page } = await start(browser, locale);
			assert.equal(new URL(page.url()).pathname, ziel, locale + ' landet falsch');
			await context.close();
		}

		// A language path in the link always wins, even for another browser.
		const fr = await start(browser, 'fr-FR');
		await fr.page.goto(basis + '/de/aufgabe/70075D00/', { waitUntil: 'networkidle' });
		assert.equal(new URL(fr.page.url()).pathname, '/de/aufgabe/70075D00/');
		assert.equal(await fr.page.evaluate(() => document.documentElement.lang), 'de');
		await fr.context.close();

		// A deliberate choice in the footer sticks for the next visit to "/".
		const wahl = await start(browser, 'fr-FR');
		await wahl.page.locator('footer a[hreflang="de"]').first().click();
		await wahl.page.waitForLoadState('networkidle');
		assert.equal(new URL(wahl.page.url()).pathname, '/de/');
		const cookie = await wahl.context.cookies();
		assert.ok(cookie.some((c) => c.name === 'llb_sprache' && c.value === 'de'), 'Sprachcookie fehlt');

		await wahl.page.goto(basis + '/start.html', { waitUntil: 'networkidle' });
		assert.equal(new URL(wahl.page.url()).pathname, '/de/', 'gewählte Sprache schlägt den Browser');
		await wahl.context.close();

		console.log('Spracherkennung: Browserliste, Sprachpfad und gewählte Sprache ok');
	} finally {
		await browser.close();
	}
})().catch((e) => { console.error(e); process.exitCode = 1; });
