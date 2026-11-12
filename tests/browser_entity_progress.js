'use strict';
/* Personal state on entity pages must follow the imported data type, not just
 * "a character exists". A giver with no quest file must not read "0 of n";
 * a faction shows its standing only when reputation was imported; an area
 * offers the completion filter only for the data type it really has.
 *
 * Usage: node tests/browser_entity_progress.js [http://127.0.0.1:8813]
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const basis = (process.argv[2] || 'http://127.0.0.1:8813').replace(/\/$/, '');

function char(meta, extra = {}) {
	return {
		aktiv: 'audit',
		liste: { audit: Object.assign({
			key: 'audit', name: 'Audit', server: 'Test', level: '100',
			quests: [], deeds: [], rezepte: [], handwerk: {}, ruf: [], importMeta: meta
		}, extra) }
	};
}

(async () => {
	const browser = await chromium.launch({ channel: 'chrome' });
	try {
		// Quest file read, zero completions: a real empty state with the filter.
		let page = await browser.newPage();
		await page.addInitScript((c) => localStorage.setItem('mql.charaktere', JSON.stringify(c)),
			char({ quests: true, deeds: true, crafting: true, recipes: true, reputation: true }));
		await page.goto(basis + '/de/auftraggeber/70047262/', { waitUntil: 'networkidle' });
		assert.equal(await page.locator('.giver-hide').isHidden(), false, 'Filter fehlt bei leerem Import');
		assert.match(await page.locator('.giver-progress').innerText(), /0 von 26/);

		// Search over the complete quest list of this giver.
		await page.fill('#giver-suche', 'Vertrauen');
		const sichtbar = await page.$$eval('.giver-list li', (ls) => ls.filter((l) => !l.hidden).length);
		assert.ok(sichtbar > 0 && sichtbar < 26, 'Suche filtert nicht: ' + sichtbar);
		await page.close();

		// Old backup without flags, no positive quests: nothing is claimed.
		page = await browser.newPage();
		await page.addInitScript((c) => localStorage.setItem('mql.charaktere', JSON.stringify(c)),
			char(undefined, { ruf: [['70057CC8', 4, 1234]] }));
		await page.goto(basis + '/de/auftraggeber/70047262/', { waitUntil: 'networkidle' });
		assert.equal(await page.locator('.giver-hide').isHidden(), true, 'Filter ohne Questdaten sichtbar');
		assert.equal(await page.locator('.giver-progress').isHidden(), true, '0 von n ohne Questdaten');

		// Faction: own standing appears, because ruf is imported.
		await page.goto(basis + '/de/fraktion/70057CC8/', { waitUntil: 'networkidle' });
		const ruf = await page.locator('#fraktion-ruf').innerText();
		assert.match(ruf, /Audit/);
		assert.match(ruf, /1\.234/);
		await page.close();

		// Area: quests imported, deeds not — filter only on Aufgaben.
		page = await browser.newPage();
		await page.addInitScript((c) => localStorage.setItem('mql.charaktere', JSON.stringify(c)),
			char({ quests: true, deeds: false, crafting: false, recipes: false, reputation: false },
				{ quests: ['70001857'] }));
		await page.goto(basis + '/de/gebiet/268437634/', { waitUntil: 'networkidle' });
		assert.equal(await page.locator('#gebiet-haken').isHidden(), false, 'Aufgabenfilter fehlt');
		await page.click('[data-gebiet-tab="d"]');
		assert.equal(await page.locator('#gebiet-haken').isHidden(), true, 'Tatenfilter ohne Tatendaten');
		await page.close();
		console.log('Entitäten-Fortschritt: Datenart, Suche und Rufstand ok');
	} finally {
		await browser.close();
	}
})().catch((e) => { console.error(e); process.exitCode = 1; });
