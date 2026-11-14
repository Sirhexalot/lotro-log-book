'use strict';
// Isolated browser storage; run against the local PHP preview.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://127.0.0.1:8927';

(async () => {
	const browser = await chromium.launch();
	try {
		for (const [lang, route] of [['de', 'abenteuer'], ['en', 'adventure'], ['fr', 'aventure']]) {
			for (const imported of [false, true]) {
				const context = await browser.newContext();
				await context.route(/googletagmanager|google-analytics|goatcounter/, r => r.abort());
				if (imported) {
					await context.addInitScript(() => localStorage.setItem('mql.charaktere', JSON.stringify({
						aktiv: 'audit', liste: {audit: {key: 'audit', name: 'Audit', server: 'Test', level: '50',
							quests: [], deeds: [], rezepte: [], handwerk: {}, ruf: [],
							importMeta: {quests: true, deeds: true, crafting: true, recipes: true, reputation: true}}}
					})));
				}
				const page = await context.newPage();
				await page.goto(`${base}/${lang}/${route}/`, {waitUntil: 'networkidle'});
				await page.waitForFunction(() => window.MQL_ABENTEUER_KARTE && window.MQL_ABENTEUER_STAND);
				await page.locator('details').evaluateAll(nodes => nodes.forEach(n => { n.open = true; }));
				const text = await page.locator('main').innerText();
				assert.doesNotMatch(text, /keine Zusage|not a promise|garantie en jeu|Unbekannt ist|Unknown does not|Inconnu ne signifie|im Import erfasst|none recorded|aucune encore enregistrée|Nichts hindert|Nothing stops|Rien ne vous empêche/);
				assert.equal(await page.locator('[data-gebiet-stand]').evaluateAll(nodes => nodes.some(n => /nicht erfasst|not recorded|non enregistré/.test(n.textContent))), false);
				await page.locator('[data-region="268453621"]').click();
				await page.locator('.region-liste [data-welt-gebiet]').first().click();
				for (const count of [0, 1, 46]) {
					await page.evaluate(count => {
						window.MQL_ABENTEUER_STAND.areas.forEach(a => { a.ready_ids = Array(count).fill('audit'); });
						window.dispatchEvent(new Event('mql:abenteuer'));
					}, count);
					const body = page.locator('[data-vorschau-text]');
					assert.equal(await body.textContent(), count === 0 ? '' : count === 1
						? {de: '1 nächste Aufgabe', en: '1 next quest', fr: '1 prochaine quête'}[lang]
						: {de: '46 nächste Aufgaben', en: '46 next quests', fr: '46 prochaines quêtes'}[lang]);
					assert.equal(await body.isVisible(), count > 0);
				}
				await page.setViewportSize({width: 390, height: 900});
				assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
				await context.close();
				console.log(`${lang}: ${imported ? 'imported' : 'no import'}, expanded details, 0/1/46 next quests, mobile OK`);
			}
		}
	} finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
