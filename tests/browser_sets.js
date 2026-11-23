/* Set list: suitability chips and the suitability filter in the browser.
 *
 * Run against the local PHP preview:
 *   python3 tools/lokalserver.py
 *   NODE_PATH=/opt/homebrew/lib/node_modules node tests/browser_sets.js
 *
 * The set list filters in the browser because the suitability depends on the
 * imported character. This check keeps the four promises:
 *   - without an import there is no chip and no suitability group,
 *   - with a level-123 hunter every row carries a chip,
 *   - a half-wearable set names its share („Passt · 3 von 6“),
 *   - `eig` in the address and in the filter panel agree, and the set page
 *     shows the same verdict in its head.
 */
'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const base = (process.argv[2] || process.env.LLB_URL || 'http://127.0.0.1:8817').replace(/\/$/, '');
const SPRACHEN = [
	{lang: 'de', pfad: '/de/set/', teil: /Passt · \d+ von \d+/, suche: 'Verblasste beständige Kraft', detail: '/de/set/70069275/'},
	{lang: 'en', pfad: '/en/set/', teil: /Fits · \d+ of \d+/, suche: 'Faded Enduring Power', detail: '/en/set/70069275/'},
	{lang: 'fr', pfad: '/fr/ensemble/', teil: /Convient · \d+ sur \d+/, suche: 'Puissance persistante estompée', detail: '/fr/ensemble/70069275/'},
];

function charakter() {
	localStorage.setItem('mql.charaktere', JSON.stringify({
		aktiv: 'audit',
		liste: {audit: {key: 'audit', name: 'Audit', server: 'Test', level: '123',
			klasse: 'Hunter', race: 'hobbit', quests: [], deeds: [], rezepte: [],
			handwerk: {}, ruf: []}}
	}));
}

async function neueSeite(browser, mitCharakter, breite) {
	const context = await browser.newContext({viewport: {width: breite || 1280, height: 1000}});
	await context.route(/googletagmanager|google-analytics|goatcounter|gc\.zgo\.at/, r => r.abort());
	const page = await context.newPage();
	const fehler = [];
	page.on('pageerror', e => fehler.push(e.message));
	if (mitCharakter) { await page.addInitScript(charakter); }
	return {context, page, fehler};
}

async function bereit(page) {
	await page.waitForSelector('.sets-list .mql-row', {state: 'attached'});
	await page.waitForFunction(() => document.querySelector('[data-set-browser]')?.dataset.setMounted === '1');
}

(async () => {
	const browser = await chromium.launch();
	try {
		/* Without an import: no chip, no suitability group, full list. */
		{
			const {context, page, fehler} = await neueSeite(browser, false);
			await page.goto(base + '/de/set/', {waitUntil: 'networkidle'});
			await bereit(page);
			await page.waitForTimeout(300);
			assert.equal(await page.locator('.sets-list .eignung-chip').count(), 0, 'Chip ohne Spielstand');
			assert.equal(await page.locator('details[data-key="eignung"]').count(), 0, 'Eignungsgruppe ohne Spielstand');
			assert.match(await page.locator('.filter-result-toolbar [role=status]').innerText(), /2\.218/);
			assert.deepEqual(fehler, []);
			await context.close();
			console.log('de: ohne Spielstand kein Chip und keine Eignungsgruppe');
		}

		for (const sprache of SPRACHEN) {
			const {context, page, fehler} = await neueSeite(browser, true);
			await page.goto(base + sprache.pfad, {waitUntil: 'networkidle'});
			await bereit(page);
			await page.waitForTimeout(400);

			const zeilen = await page.locator('.sets-list .mql-row').count();
			const chips = await page.locator('.sets-list .eignung-chip').count();
			assert.equal(zeilen, 30, sprache.lang + ': Seite zeigt 30 Sets');
			assert.equal(chips, 30, sprache.lang + ': jede Zeile trägt einen Chip');
			assert.equal(await page.locator('details[data-key="eignung"]').count(), 1,
				sprache.lang + ': Eignungsgruppe fehlt');
			const titel = await page.locator('.sets-list .eignung-chip').first().getAttribute('title');
			assert.ok(titel && titel.length > 8, sprache.lang + ': Chip ohne Begründung');
			assert.deepEqual(fehler, [], sprache.lang + ': JavaScript-Fehler');

			/* A half-wearable set names its share: search it by name. */
			await page.fill('.filter-toolbar input[type=search]', sprache.suche);
			await page.press('.filter-toolbar input[type=search]', 'Enter');
			await page.waitForTimeout(500);
			const teilChips = await page.locator('.sets-list .eignung-chip').evaluateAll(
				ns => ns.map(n => n.textContent));
			assert.ok(teilChips.some(text => sprache.teil.test(text)),
				sprache.lang + ': Anteil am Set fehlt (' + teilChips.join(' | ') + ')');

			/* The same verdict in the set head, from the piece requirements. */
			await page.goto(base + sprache.detail, {waitUntil: 'networkidle'});
			await page.waitForSelector('.set-detail .set-eignung .eignung-chip');
			const kopf = await page.locator('.set-detail .set-eignung .eignung-chip').innerText();
			assert.match(kopf, sprache.teil, sprache.lang + ': Set-Kopf ohne Anteil');
			await context.close();
			console.log(sprache.lang + ': Chips, Anteil und Set-Kopf ok');
		}

		/* The suitability filter: in the address, in the panel, and removable. */
		{
			const {context, page, fehler} = await neueSeite(browser, true);
			await page.goto(base + '/de/set/?eig=passt', {waitUntil: 'networkidle'});
			await bereit(page);
			await page.waitForTimeout(400);
			const zahl = await page.locator('.filter-result-toolbar [role=status]').innerText();
			const gesamt = Number((zahl.match(/[\d.]+/) || ['0'])[0].replace(/\./g, ''));
			assert.ok(gesamt > 0 && gesamt < 2218, 'eig=passt filtert: ' + zahl);
			const codes = await page.locator('.sets-list .eignung-chip').evaluateAll(
				ns => ns.map(n => n.getAttribute('data-eignung')));
			assert.ok(codes.every(code => code === 'passt'), 'nur passende Sets: ' + codes.join(','));
			assert.equal(await page.locator('.filter-chips button').first().innerText(), 'Passt ×');

			await page.locator('input[data-filter-key=\'eignung:"zu-hoch"\']').check();
			await page.waitForTimeout(600);
			assert.match(page.url(), /eig=passt%2Czu-hoch/);
			const erweitert = await page.locator('.filter-result-toolbar [role=status]').innerText();
			assert.notEqual(erweitert, zahl, 'Zu hoch erhöht die Trefferzahl');

			await page.locator('.filter-chips button').first().click();
			await page.waitForTimeout(600);
			const nurZuHoch = await page.locator('.sets-list .eignung-chip').evaluateAll(
				ns => ns.map(n => n.getAttribute('data-eignung')));
			assert.ok(nurZuHoch.every(code => code === 'zu-hoch'), 'nur „Zu hoch“ übrig');
			assert.deepEqual(fehler, []);
			await context.close();
			console.log('de: Eignungsfilter in Adresse, Panel und Chip ok');
		}

		/* Phone: the filters open in the dialog, suitability included. */
		{
			const {context, page, fehler} = await neueSeite(browser, true, 390);
			await page.goto(base + '/de/set/', {waitUntil: 'networkidle'});
			await bereit(page);
			await page.locator('.filter-open').click();
			await page.waitForTimeout(300);
			assert.equal(await page.locator('dialog.filter-dialog details[data-key="eignung"]').count(), 1,
				'Eignungsgruppe im Filterdialog');
			const breite = await page.evaluate(() => document.documentElement.scrollWidth);
			assert.ok(breite <= 400, 'kein Querlauf auf dem Telefon: ' + breite);
			assert.deepEqual(fehler, []);
			await context.close();
			console.log('mobil: Filterdialog mit Eignung ok');
		}

		/* Switching the character recomputes counts and chips, nothing else. */
		{
			const context = await browser.newContext({viewport: {width: 1280, height: 1000}});
			await context.route(/googletagmanager|google-analytics|goatcounter|gc\.zgo\.at/, r => r.abort());
			const page = await context.newPage();
			const fehler = [];
			page.on('pageerror', e => fehler.push(e.message));
			await page.addInitScript(() => {
				localStorage.setItem('mql.charaktere', JSON.stringify({
					aktiv: 'hoch',
					liste: {
						hoch: {key: 'hoch', name: 'Hoch', server: 'Test', level: '123', klasse: 'Hunter',
							race: 'hobbit', quests: [], deeds: [], rezepte: [], handwerk: {}, ruf: []},
						niedrig: {key: 'niedrig', name: 'Niedrig', server: 'Test', level: '10', klasse: 'Hunter',
							race: 'hobbit', quests: [], deeds: [], rezepte: [], handwerk: {}, ruf: []}
					}}));
			});
			await page.goto(base + '/de/set/', {waitUntil: 'networkidle'});
			await bereit(page);
			await page.waitForTimeout(400);
			const hoch = await page.locator('details[data-key="eignung"]').innerText();
			await page.selectOption('#katalog-charakter', {value: 'niedrig'});
			await page.waitForTimeout(900);
			const niedrig = await page.locator('details[data-key="eignung"]').innerText();
			assert.notEqual(niedrig, hoch, 'der Charakterwechsel ändert die Zählung');
			assert.match(hoch, /Passt/);
			assert.doesNotMatch(niedrig, /Passt \|\s*\d+\s*\|\s*Ueberholt/);
			const codes = await page.locator('.sets-list .eignung-chip').evaluateAll(
				ns => ns.map(n => n.getAttribute('data-eignung')));
			assert.ok(codes.length > 0, 'Chips nach dem Wechsel vorhanden');
			assert.deepEqual(fehler, []);
			await context.close();
			console.log('de: Charakterwechsel rechnet Zählung und Chips neu');
		}
	} finally {
		await browser.close();
	}
})().catch(error => { console.error(error); process.exitCode = 1; });
