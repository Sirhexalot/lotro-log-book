'use strict';
/* Navigation and breadcrumbs, desktop and phone.
 *
 * A family is a group: clicking it opens its pages and never navigates. Every
 * page is visible on a phone, including the one that shares the family's name.
 * Usage: node tests/browser_navigation.js [http://127.0.0.1:8817]
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const basis = (process.argv[2] || 'http://127.0.0.1:8817').replace(/\/$/, '');
const seiten = ['/de/karte/', '/de/karte/taten/', '/de/handwerk/rezepte/', '/de/instanz/',
	'/de/set/', '/de/gegenstandssuche/', '/de/auftraggeber/', '/de/fraktion/',
	'/de/belohnungen/', '/de/abenteuer/', '/en/crafting/recipes/', '/fr/carte/prouesses/'];
const ziele = (feld) => feld.locator('.familie-flieger a strong')
	.evaluateAll((as) => as.filter((a) => a.getClientRects().length).map((a) => a.textContent.trim()));

(async () => {
	const browser = await chromium.launch({ channel: 'chrome' });
	try {
		for (const [breite, hoehe] of [[1280, 900], [390, 844]]) {
			const page = await browser.newPage({ viewport: { width: breite, height: hoehe } });
			const errors = [];
			page.on('pageerror', (e) => errors.push(e.message));
			for (const pfad of seiten) {
				await page.goto(basis + pfad, { waitUntil: 'networkidle' });
				assert.equal(await page.locator('#menue .familie-knopf').count(), 4, 'Familien: ' + pfad);
				// No entry is hidden just because it repeats the family's name.
				assert.equal(await page.locator('#menue a.selbst').count(), 0, 'versteckte Ziele: ' + pfad);
				// The family is not a link.
				assert.equal(await page.locator('#menue .familie-feld > a').count(), 0, 'Familiengruppe verlinkt: ' + pfad);
				if (breite < 1000) {
					await page.click('.menue-knopf');
					const fams = page.locator('#menue .familie-feld');
					const gruppe = pfad.startsWith('/de/gegenstand') || pfad.startsWith('/de/handwerk')
						|| pfad.startsWith('/de/set') || pfad.startsWith('/en/crafting') || pfad.startsWith('/fr/artisanat')
						? 1 : 0;
					if (await fams.nth(gruppe).locator('.familie-knopf').getAttribute('aria-expanded') !== 'true') {
						await fams.nth(gruppe).locator('.familie-knopf').click();
					}
					const sichtbar = await ziele(fams.nth(gruppe));
					assert.ok(sichtbar.length >= 3, 'Gruppe zeigt ihre Seiten: ' + pfad);
				} else {
					const knopf = page.locator('#menue .familie-feld').nth(1).locator('.familie-knopf');
					await knopf.click();
					assert.equal(await knopf.getAttribute('aria-expanded'), 'true', 'öffnet: ' + pfad);
					await page.keyboard.press('Escape');
					assert.equal(await knopf.getAttribute('aria-expanded'), 'false', 'Escape: ' + pfad);
				}
			}
			// Breadcrumb: application pages and entity pages, family as text.
			await page.goto(basis + '/de/handwerk/rezepte/', { waitUntil: 'networkidle' });
			const pfadText = (await page.locator('.huelle-pfad .katalog-pfad').innerText()).replace(/\s+/g, ' ');
			assert.equal(pfadText, 'Startseite › Gegenstände › Handwerk');
			assert.equal(await page.locator('.huelle-pfad .katalog-pfad a').count(), 1, 'nur Startseite verlinkt');
			await page.goto(basis + '/de/tat/7003E49A/', { waitUntil: 'networkidle' });
			assert.equal(await page.locator('.katalog-pfad a[href="/de/karte/"]').count(), 0, 'Familie ist Text');
			assert.deepEqual(errors, []);
			console.log(breite + 'px: ' + seiten.length + ' Seiten, Navigation und Breadcrumb ok');
			await page.close();
		}
	} finally {
		await browser.close();
	}
})().catch((e) => { console.error(e); process.exitCode = 1; });
