'use strict';
/* Item page: values of scalable items and the class requirement.
 *
 *   node tests/browser_gegenstand_werte.js http://127.0.0.1:8817
 *
 * The Shagâni bow carries 525 and 765 DPS at its own level and needs level 150,
 * Beorning only. A level-123 hunter must not read those numbers as his own.
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const base = (process.argv[2] || process.env.LLB_URL || 'http://127.0.0.1:8817').replace(/\/$/, '');

const SPRACHEN = [
	{ lang: 'de', pfad: '/de/gegenstand/7006D725/', note: 'Werte auf Höchststufe: Gegenstandsstufe 525.', klasse: 'Beorning', bezeichnung: 'Nur für Klasse' },
	{ lang: 'en', pfad: '/en/item/7006D725/', note: 'Stats at maximum level: item level 525.', klasse: 'Beorning', bezeichnung: 'Class' },
	{ lang: 'fr', pfad: '/fr/objet/7006D725/', note: 'Valeurs au niveau maximal : niveau d’objet 525.', klasse: 'Beorning', bezeichnung: 'Classe' },
];

(async () => {
	const browser = await chromium.launch();
	try {
		for (const sprache of SPRACHEN) {
			const context = await browser.newContext({ viewport: { width: 1180, height: 950 } });
			await context.route(/googletagmanager|google-analytics|goatcounter|gc\.zgo\.at/, (r) => r.abort());
			const page = await context.newPage();
			const fehler = [];
			page.on('pageerror', (e) => fehler.push(e.message));

			await page.goto(base + sprache.pfad, { waitUntil: 'networkidle' });
			const werte = page.locator('.katalog-werteflaeche');
			const text = await werte.innerText();
			assert.ok(text.includes(sprache.note), sprache.lang + ': Stufenbezug der Werte fehlt');
			assert.ok(text.includes(sprache.klasse), sprache.lang + ': Klassenanforderung fehlt');
			assert.match(text, /765/, sprache.lang + ': DPS des Stücks fehlt');
			assert.match(text, /525/, sprache.lang + ': Gegenstandsstufe fehlt');

			assert.deepEqual(fehler, [], sprache.lang + ': JavaScript-Fehler: ' + fehler.join(' | '));
			await context.close();
			console.log(sprache.lang + ': Werte auf Höchststufe und Klassenanforderung ok');
		}

		/* A non-scalable item carries no such note: its values are its values. */
		const context = await browser.newContext({ viewport: { width: 1180, height: 800 } });
		await context.route(/googletagmanager|google-analytics|goatcounter|gc\.zgo\.at/, (r) => r.abort());
		const page = await context.newPage();
		await page.goto(base + '/de/gegenstand/7005BCDA/', { waitUntil: 'networkidle' });
		const text = await page.locator('.katalog-werteflaeche').innerText();
		assert.equal(/Werte auf Höchststufe/.test(text), false,
			'nicht skalierbares Stück trägt den Höchststufen-Hinweis');
		await context.close();
		console.log('de: nicht skalierbares Stück ohne Höchststufen-Hinweis ok');
	} finally {
		await browser.close();
	}
})().catch((error) => { console.error(error); process.exitCode = 1; });
