'use strict';
/* Area and region pages: Aufgaben, Taten and Gegenstände are real tabs.
 *
 * Each tab searches and filters the complete member list of the area, not just
 * the rendered first page. Completion comes from a synthetic character.
 *
 * Usage: node tests/browser_area_tabs.js [http://127.0.0.1:8813]
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const basis = (process.argv[2] || 'http://127.0.0.1:8813').replace(/\/$/, '');
const seiten = ['/de/gebiet/268437634/', '/en/area/268437634/', '/fr/zone/268437634/'];

(async () => {
	const browser = await chromium.launch({ channel: 'chrome' });
	try {
		for (const [breite, hoehe] of [[1280, 1000], [390, 900]]) {
			const page = await browser.newPage({ viewport: { width: breite, height: hoehe } });
			const errors = [];
			page.on('pageerror', (e) => errors.push(e.message));
			for (const pfad of seiten) {
				await page.goto(basis + pfad, { waitUntil: 'networkidle' });
				const stand = await page.evaluate(() => ({
					reiter: [...document.querySelectorAll('[data-gebiet-tab]')]
						.map((b) => b.getAttribute('data-gebiet-tab')),
					gewaehlt: document.querySelector('[aria-selected="true"]')?.getAttribute('data-gebiet-tab'),
					zeilen: document.querySelectorAll('#gebiet-liste li').length,
					mehr: !document.querySelector('#gebiet-mehr')?.hidden,
					ueberlauf: document.documentElement.scrollWidth > innerWidth
				}));
				assert.deepEqual(stand.reiter, ['q', 'd', 'i'], 'Reiter in ' + pfad);
				assert.equal(stand.gewaehlt, 'q', 'Startreiter in ' + pfad);
				assert.equal(stand.zeilen, 50, 'erste Ladung in ' + pfad);
				assert.ok(stand.mehr, 'Weitere anzeigen in ' + pfad);
				assert.equal(stand.ueberlauf, false, 'Überbreite in ' + pfad);

				// A name beyond the rendered first fifty must still be found.
				await page.fill('#gebiet-suche', 'Olnathron');
				const treffer = await page.$$eval('#gebiet-liste a', (as) => as.map((a) => a.textContent));
				assert.ok(treffer.some((t) => t.includes('Olnathron')), 'Suche im ganzen Gebiet: ' + pfad);

				// The tab survives a reload through the hash.
				await page.click('[data-gebiet-tab="d"]');
				assert.equal(await page.evaluate(() => location.hash), '#d');
				await page.reload({ waitUntil: 'networkidle' });
				assert.equal(await page.evaluate(() => document.querySelector('[aria-selected="true"]')?.getAttribute('data-gebiet-tab')), 'd');
			}
			assert.deepEqual(errors, []);
			console.log(breite + 'px: Reiter, Suche über den Auszug hinaus und Hash ok');
			await page.close();
		}

		// Completion filter with a synthetic character, never real data.
		const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
		await page.addInitScript(() => {
			localStorage.setItem('mql.charaktere', JSON.stringify({
				aktiv: 'audit',
				liste: { audit: { key: 'audit', name: 'Audit', server: 'Test', level: '100',
					quests: ['70001857'], deeds: [], rezepte: [], handwerk: {}, ruf: [] } }
			}));
		});
		await page.goto(basis + '/de/gebiet/268437634/', { waitUntil: 'networkidle' });
		const stand = await page.evaluate(() => ({
			stand: document.querySelector('#gebiet-stand')?.textContent,
			anzahl: document.querySelector('#gebiet-anzahl')?.textContent,
			haken: !document.querySelector('#gebiet-haken')?.hidden,
			marken: [...document.querySelectorAll('.gebiet-marke')].slice(0, 2).map((e) => e.textContent)
		}));
		assert.match(stand.stand, /Audit/);
		assert.match(stand.anzahl, /1 Erledigt/);
		assert.equal(stand.haken, true);
		assert.deepEqual(stand.marken, ['✓', '○']);
		await page.check('#gebiet-nur-offen');
		const offen = await page.$$eval('#gebiet-liste a', (as) => as.map((a) => a.textContent));
		assert.ok(!offen.includes('Abstumpfen des Speers'), 'erledigter Eintrag bleibt im Offen-Filter');
		assert.ok(offen.length > 0);
		await page.close();
	} finally {
		await browser.close();
	}
})().catch((e) => { console.error(e); process.exitCode = 1; });
