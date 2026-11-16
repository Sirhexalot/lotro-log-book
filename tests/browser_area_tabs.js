'use strict';
/* Area and region pages: Aufgaben, Taten and Gegenstände are real tabs.
 *
 * The tabs reuse the public list adapters with the area as their fixed
 * context, so search and filters cover the whole member list of the area, not
 * just the rendered first page. Completion comes from a synthetic character.
 *
 * Usage: node tests/browser_area_tabs.js [http://127.0.0.1:8813]
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const basis = (process.argv[2] || 'http://127.0.0.1:8813').replace(/\/$/, '');
const seiten = ['/de/gebiet/268437634/', '/en/area/268437634/', '/fr/zone/268437634/'];

async function bereit(page, type) {
	await page.waitForFunction((art) => window.MQL_RELATED_FILTER
		&& (!art || window.MQL_RELATED_FILTER.config.area.startsWith('related-' + art))
		&& document.querySelector('.filter-result-toolbar [role=status]')?.textContent.match(/\d/), type);
}

(async () => {
	const browser = await chromium.launch({ channel: 'chrome' });
	try {
		for (const [breite, hoehe] of [[1280, 1000], [390, 900]]) {
			const page = await browser.newPage({ viewport: { width: breite, height: hoehe } });
			const errors = [];
			page.on('pageerror', (e) => errors.push(e.message));
			for (const pfad of seiten) {
				await page.goto(basis + pfad, { waitUntil: 'networkidle' });
				await bereit(page, 'q');
				const stand = await page.evaluate(() => ({
					reiter: [...document.querySelectorAll('[data-related-type]')]
						.map((b) => b.getAttribute('data-related-type')),
					gewaehlt: document.querySelector('[aria-selected="true"]')?.getAttribute('data-related-type'),
					zeilen: document.querySelectorAll('.related-results > li').length,
					mehr: !document.querySelector('.filter-results-home > button')?.hidden,
					ueberlauf: document.documentElement.scrollWidth > innerWidth
				}));
				assert.deepEqual(stand.reiter, ['q', 'd', 'i'], 'Reiter in ' + pfad);
				assert.equal(stand.gewaehlt, 'q', 'Startreiter in ' + pfad);
				assert.equal(stand.zeilen, 50, 'erste Ladung in ' + pfad);
				assert.ok(stand.mehr, 'Weitere anzeigen in ' + pfad);
				assert.equal(stand.ueberlauf, false, 'Überbreite in ' + pfad);

				// A name beyond the rendered first fifty must still be found.
				const spaet = await page.evaluate(() => JSON.parse(document.getElementById('related-lists').textContent).q.rows[55].name);
				await page.fill('.filter-ui input[type=search]', spaet);
				await page.waitForFunction((name) => window.MQL_RELATED_FILTER.getState().q === name, spaet);
				await page.waitForFunction(() => document.querySelectorAll('.related-results a').length > 0);
				const treffer = await page.$$eval('.related-results a', (as) => as.map((a) => a.textContent));
				assert.ok(treffer.some((t) => t.includes(spaet)), 'Suche im ganzen Gebiet: ' + pfad);

				// The tab survives a reload through the hash.
				await page.click('[data-related-type="d"]');
				await bereit(page, 'd');
				assert.equal(await page.evaluate(() => location.hash), '#d');
				assert.equal(await page.evaluate(() => window.MQL_RELATED_FILTER.getState().q), '', 'Suchtext bleibt im Reiter');
				await page.reload({ waitUntil: 'networkidle' });
				await bereit(page, 'd');
				assert.equal(await page.evaluate(() => document.querySelector('[aria-selected="true"]')?.getAttribute('data-related-type')), 'd');
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
		await bereit(page, 'q');
		const stand = await page.evaluate(() => ({
			anzahl: document.querySelector('.filter-result-toolbar [role=status]')?.textContent,
			filter: document.querySelectorAll('.filter-group-single').length,
			marken: [...document.querySelectorAll('.related-symbol')].slice(0, 1).map((e) => e.textContent.trim())
		}));
		const expectedCount = await page.evaluate(() =>
			JSON.parse(document.getElementById('related-lists').textContent).q.rows.length);
		assert.match(stand.anzahl, new RegExp(String(expectedCount)));
		assert.equal(stand.filter, 1, 'Abschlussfilter fehlt');
		assert.deepEqual(stand.marken, ['✓']);

		await page.locator('.filter-group-single label', { hasText: /Nicht als erledigt importiert/ }).first().click();
		await page.waitForFunction(() => window.MQL_RELATED_FILTER.getState().filters.status === 'rest');
		const offen = await page.$$eval('.related-results a', (as) => as.map((a) => a.textContent));
		assert.ok(!offen.includes('Abstumpfen des Speers'), 'erledigter Eintrag bleibt im Offen-Filter');
		assert.ok(offen.length > 0);

		await page.locator('.filter-group-single label', { hasText: /^Erledigt/ }).first().click();
		await page.waitForFunction(() => window.MQL_RELATED_FILTER.getState().filters.status === 'done');
		const erledigt = await page.$$eval('.related-results a', (as) => as.map((a) => a.textContent));
		assert.ok(erledigt.length === 1 && erledigt[0].includes('Abstumpfen des Speers'), 'Erledigt-Filter: ' + erledigt.join(' | '));
		await page.close();
	} finally {
		await browser.close();
	}
})().catch((e) => { console.error(e); process.exitCode = 1; });
