/* Epic story list: instance rows fold into their chapter, session replays of an
 * interlude are no second row, and a prologue says it is no book progress.
 *
 * Run against a local preview:
 *   LLB_URL=http://127.0.0.1:8914 NODE_PATH=<global node_modules> node tests/browser_epik.js
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const BASE = process.env.LLB_URL || 'http://127.0.0.1:8914';
const START = '/de/karte/#section-%7CWeitere%20Inhalte/group-%7CWeitere%20Inhalte%7CEpische%20Geschichte';

(async () => {
	const browser = await chromium.launch({headless: true});
	try {
		const page = await browser.newPage({viewport: {width: 1500, height: 1000}});
		await page.goto(BASE + START);
		await page.waitForSelector('#liste li');
		const total = await page.locator('#liste-titel').textContent();
		assert.match(total, /Epische Geschichte · \d+ · Stufe/);
		const counted = Number(total.match(/· (\d+) ·/)[1]);
		assert.ok(counted > 1200 && counted < 1551, total);

		// Book 1: twelve chapters plus the foreword, no separate instance rows.
		await page.getByRole('button', {name: /^Band I › Buch 1: Aufruhr/}).click();
		await page.waitForTimeout(400);
		const book = await page.locator('#liste-titel').textContent();
		assert.match(book, /· 13 ·/, book);
		assert.equal(await page.locator('#liste li [data-artikel], #liste li .qname').filter({hasText: '^Instanz:'}).count(), 0);
		assert.ok(await page.locator('#liste li .instanz-teil').count() >= 3, 'instance note on the chapter');

		// A prologue explains itself and keeps no instance row.
		await page.getByRole('button', {name: /^Band I › Prolog/}).click();
		await page.waitForTimeout(400);
		const hint = page.locator('#liste li.listen-hinweis');
		assert.equal(await hint.count(), 1);
		assert.match(await hint.textContent(), /Einstieg/);
		assert.equal(await page.getByText('^Instanz:', {exact: false}).count(), 0);

		// Interludes: one row per story, the replay is folded away.
		await page.getByRole('button', {name: /^Band III › Zwischenspiel/}).click();
		await page.waitForTimeout(400);
		assert.match(await page.locator('#liste-titel').textContent(), /· 8 ·/);
		const names = await page.locator('#liste li .qname').evaluateAll(rows => rows.map(r => r.firstChild.textContent));
		assert.equal(names.length, 8);
		assert.equal(names.filter(name => name.startsWith('Zwischenspiel:')).length, 0, names.join(' | '));
		assert.equal(new Set(names).size, names.length - 1, 'only the two Halros variants share a title');

		await page.close();
		console.log('epic story: instance folding, interlude rows and prologue note OK');
	} finally {
		await browser.close();
	}
})().catch(error => { console.error(error); process.exitCode = 1; });
