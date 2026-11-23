'use strict';
/* Händlerliste: Spalte „ab Stufe“ und Filter „Ware für Stufe X“.
 *
 *   node tests/browser_haendler_stufe.js http://127.0.0.1:8817
 *
 * The import is synthesised (level 123). The filter must reach the server as a
 * number, otherwise counts and pages would be wrong.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');

const base = (process.argv[2] || process.env.LLB_URL || 'http://127.0.0.1:8817').replace(/\/$/, '');
const STUFE = 123;

const SUMMARY = `<?xml version="1.0" encoding="UTF-8"?>
<character name="Stufenprobe" server="Testserver" account="Testkonto" class="Hunter" race="hobbit" level="${STUFE}" importDate="1795366744469"/>`;

const QUESTS = `<?xml version="1.0" encoding="UTF-8"?>
<questsStatus>
	<questStatus key="1879048193" name="Auftrag der Probe" state="COMPLETED" completionCount="1"/>
</questsStatus>`;

(async () => {
	const ordner = fs.mkdtempSync(path.join(os.tmpdir(), 'llb-haendler-'));
	const toon = path.join(ordner, 'characters', 'toon-00003');
	fs.mkdirSync(toon, { recursive: true });
	fs.writeFileSync(path.join(toon, 'summary.xml'), SUMMARY);
	fs.writeFileSync(path.join(toon, 'questsStatus.xml'), QUESTS);

	const browser = await chromium.launch({ channel: 'chrome' });
	try {
		/* Ohne Import bleibt das Feld unsichtbar, die Spalte steht trotzdem. */
		const ohne = await browser.newContext({ viewport: { width: 1280, height: 950 } });
		const seite = await ohne.newPage();
		await seite.goto(base + '/de/haendler/', { waitUntil: 'load' });
		await seite.waitForSelector('.filter-ui table.llb-tabelle tbody tr');
		assert.equal(await seite.evaluate(() => document.getElementById('vendor-level-field').hidden), true,
			'Stufenfilter ohne Import sichtbar');
		assert.equal(await seite.evaluate(() => Array.from(document.querySelectorAll('.filter-ui thead th'))
			.map((th) => th.textContent.replace(/[↕↑↓]/g, '').trim()).join('|')), 'Name|Ware ab Stufe',
			'Kopfzeile ohne Stufenspalte');
		const ohneWert = await seite.locator('.filter-ui tbody td.llb-zahl').first().textContent();
		assert.match(ohneWert, /^\d+/, 'Zeile ohne „Ware ab Stufe“');
		await ohne.close();

		const context = await browser.newContext({ viewport: { width: 1280, height: 950 } });
		const page = await context.newPage();
		const fehler = [];
		page.on('pageerror', (e) => fehler.push(String(e)));

		await page.goto(base + '/de/spielstand/', { waitUntil: 'load' });
		await page.setInputFiles('#ordner', ordner);
		await page.waitForTimeout(3500);

		await page.goto(base + '/de/haendler/', { waitUntil: 'load' });
		await page.waitForSelector('.filter-ui table.llb-tabelle tbody tr');
		await page.waitForFunction(() => Number((document.querySelector('.filter-result-toolbar [role=status]')?.textContent || '').replace(/\D/g, '')) > 1000);
		assert.equal(await page.evaluate(() => document.getElementById('vendor-level-field').hidden), false,
			'Stufenfilter mit Import versteckt');
		assert.match(await page.locator('#vendor-level-link').textContent(), new RegExp(String(STUFE)),
			'Beschriftung nennt die Stufe nicht');
		const gesamt = Number((await page.locator('.filter-result-toolbar [role=status]').textContent()).replace(/\D/g, ''));
		assert.ok(gesamt > 1000, 'Gesamtzahl unerwartet: ' + gesamt);

		/* Verweis folgen: die Stufe muss in der Adresse landen. */
		await page.click('#vendor-level-link');
		await page.waitForLoadState('load');
		await page.waitForFunction(() => Number((document.querySelector('.filter-result-toolbar [role=status]')?.textContent || '').replace(/\D/g, '')) > 0);
		assert.match(page.url(), new RegExp('[?&]stufe=' + STUFE), 'Stufe fehlt in der Adresse: ' + page.url());
		const gefiltert = Number((await page.locator('.filter-result-toolbar [role=status]').textContent()).replace(/\D/g, ''));
		assert.ok(gefiltert > 0, 'Filter liefert nichts');
		assert.ok(gefiltert < gesamt, 'Filter grenzt nicht ein: ' + gefiltert + ' von ' + gesamt);

		/* Jede sichtbare Zeile bietet Ware, die höchstens die eigene Stufe verlangt. */
		const stufen = await page.$$eval('.filter-ui tbody td.llb-zahl', (nodes) => nodes.map((n) => {
			const treffer = n.textContent.match(/(\d+)/);
			return treffer ? Number(treffer[1]) : null;
		}));
		assert.ok(stufen.length > 0, 'keine Zeilen nach dem Filtern');
		stufen.forEach((stufe) => assert.ok(stufe !== null && stufe <= STUFE,
			'Zeile mit Ware ab höherer Stufe: ' + stufe));

		/* Die Stufe bleibt bei jeder weiteren Auswahl in der Adresse. */
		const erstesFach = page.locator('.filter-ui input[type=checkbox]').first();
		if (await erstesFach.count()) {
			await erstesFach.check();
			await page.waitForFunction(() => !document.querySelector('[data-filter-results]')
				?.closest('.sets-browser')?.querySelector('.sets-form[aria-busy]'), { timeout: 20000 }).catch(() => {});
			await page.waitForTimeout(1200);
			assert.match(page.url(), new RegExp('[?&]stufe=' + STUFE),
				'Stufe fiel bei einer weiteren Auswahl weg: ' + page.url());
		}

		/* Zurücksetzen bringt den vollen Bestand. Der Server-Verweis allein
		   würde den gemerkten Filter im Browser wiederherstellen; die
		   gemeinsame Schaltfläche leert ihn. */
		await page.locator('.filter-panel button').last().click();
		await page.waitForFunction(() => !document.querySelector('.filter-chips button'));
		await Promise.all([
			page.waitForURL('**/de/haendler/'),
			page.locator('.sets-turn a').last().click(),
		]);
		await page.waitForFunction((total) => Number((document.querySelector('.filter-result-toolbar [role=status]')?.textContent || '').replace(/\D/g, '')) === total, gesamt);
		assert.equal(Number((await page.locator('.filter-result-toolbar [role=status]').textContent()).replace(/\D/g, '')), gesamt,
			'Zurücksetzen stellt den Bestand nicht her');

		await page.setViewportSize({ width: 390, height: 844 });
		assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false,
			'Händlerliste läuft mobil seitlich über');

		assert.deepEqual(fehler, [], 'JavaScript-Fehler: ' + fehler.join(' | '));
		console.log('Händler-Stufe: Spalte, Filter ' + gefiltert + ' von ' + gesamt + ' und Zurücksetzen ok');
		await context.close();
	} finally {
		await browser.close();
		fs.rmSync(ordner, { recursive: true, force: true });
	}
})().catch((error) => { console.error(error); process.exitCode = 1; });
