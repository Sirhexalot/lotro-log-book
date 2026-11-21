'use strict';
/* Jede Entität: Listendarstellung, Detailseite und (wo vorhanden) Karte.
 *
 * Geprüft wird in beiden Designs (dunkel und hell) und auf zwei Breiten:
 * - Listen: Zeilen, Icon-Kachel in der richtigen Größe, einfache Trennlinie,
 *   Spaltenkopf, kein waagerechter Überlauf.
 * - Details: Titel, Typ, Reiter mit Zähler, genau ein sichtbares Panel,
 *   Panel-Fläche mit Rahmen und abgerundeter Ecke unter dem Reiter, Icons in
 *   der Kachel, kein Überlauf.
 *
 *   node tests/browser_entitaeten_matrix.js http://127.0.0.1:8817
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const base = process.argv[2] || 'http://127.0.0.1:8817';
const matrix = JSON.parse(fs.readFileSync(path.join(__dirname, 'entitaeten_matrix.json'), 'utf8'));

async function listePruefen(page, entity, breite) {
	const antwort = await page.goto(base + entity.list, { waitUntil: 'load' });
	assert.equal(antwort.status(), 200, entity.kind + ' Liste');
	const zeilen = page.locator(entity.row);
	await zeilen.first().waitFor({ timeout: 20000 });
	assert.ok(await zeilen.count() > 0, entity.kind + ' Liste ohne Zeilen');
	if (entity.row === '.mql-row') {
		const erste = zeilen.first();
		const rahmen = await erste.evaluate((row) => ({
			oben: getComputedStyle(row).borderTopWidth,
			unten: getComputedStyle(row).borderBottomWidth,
		}));
		assert.ok(!(rahmen.oben === '1px' && rahmen.unten === '1px'), entity.kind + ': doppelte Trennlinie');
		const kachel = erste.locator('.mql-row-icon').first();
		assert.equal(await kachel.count(), 1, entity.kind + ': Icon fehlt');
		const box = await kachel.boundingBox();
		assert.ok(box, entity.kind + ': Icon nicht sichtbar');
		assert.equal(Math.round(box.width), breite > 700 ? 64 : 54, entity.kind + ': Icon-Größe');
		/* A header only exists where a row carries a value column. */
		if (await page.locator('.mql-row-value').count()) {
			assert.ok(await page.locator('.mql-row-heading').count() > 0, entity.kind + ': Spaltenkopf fehlt');
		}
	}
	assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false,
		entity.kind + ': Liste läuft über (' + breite + 'px)');
}

async function detailPruefen(page, entity, breite) {
	const antwort = await page.goto(base + entity.detail, { waitUntil: 'load' });
	assert.equal(antwort.status(), 200, entity.kind + ' Detail');
	assert.ok((await page.locator('.katalog-kopf h1').innerText()).trim(), entity.kind + ': Titel fehlt');
	assert.ok((await page.locator('.katalog-art').innerText()).trim(), entity.kind + ': Entitätstyp fehlt');

	const leisten = page.locator('.llb-reiter');
	const anzahl = await leisten.count();
	if (anzahl) {
		assert.equal(anzahl, 1, entity.kind + ': mehr als eine Reiterleiste');
		const reiter = await leisten.locator('[data-reiter-knopf]').evaluateAll((knoepfe) => knoepfe.map((k) => ({
			key: k.dataset.reiterKnopf,
			text: k.textContent.trim().replace(/\s+/g, ' '),
			zahl: k.querySelector('.llb-reiter-zahl')?.textContent?.trim() || null,
			gewaehlt: k.getAttribute('aria-selected') === 'true',
		})));
		assert.ok(reiter.length >= 2, entity.kind + ': Reiterleiste mit einem Reiter');
		assert.equal(reiter.filter((r) => r.gewaehlt).length, 1, entity.kind + ': nicht genau ein gewählter Reiter');
		for (const r of reiter) {
			assert.ok(r.zahl && Number(r.zahl.replace(/\./g, '')) > 0, entity.kind + ': Reiter "' + r.text + '" ohne Zähler');
		}
		const zustand = await page.evaluate(() => {
			const offen = [...document.querySelectorAll('[role="tabpanel"]')].filter((p) => !p.hidden);
			const panel = offen[0];
			const stil = panel ? getComputedStyle(panel) : null;
			return {
				panels: offen.length,
				rahmen: stil ? stil.borderTopWidth : null,
				flaeche: stil ? stil.backgroundColor : null,
				seite: getComputedStyle(document.body).backgroundColor,
				ecke: stil ? stil.borderTopLeftRadius : null,
			};
		});
		assert.equal(zustand.panels, 1, entity.kind + ': nicht genau ein sichtbares Panel');
		assert.equal(zustand.rahmen, '1px', entity.kind + ': Panel ohne Rahmen');
		assert.notEqual(zustand.flaeche, 'rgba(0, 0, 0, 0)', entity.kind + ': Panel ohne Fläche');
		assert.notEqual(zustand.flaeche, zustand.seite, entity.kind + ': Panel hebt sich nicht ab');
		assert.equal(zustand.ecke, '0px', entity.kind + ': Panel-Ecke unter dem Reiter nicht bündig');
	}

	/* Fakten: Label und Wert müssen unterscheidbar sein, der Wert lesbar. */
	const fakten = page.locator('.llb-fakten').first();
	if (await fakten.count()) {
		const farben = await fakten.evaluate((dl) => {
			const dt = dl.querySelector('dt'), dd = dl.querySelector('dd');
			return dt && dd ? { label: getComputedStyle(dt).color, wert: getComputedStyle(dd).color } : null;
		});
		assert.ok(farben, entity.kind + ': Fakten ohne Label/Wert');
		assert.notEqual(farben.label, farben.wert, entity.kind + ': Fakten-Label und Wert gleich');
	}

	/* Hinweis: gedämpfte Farbe, nie die normale Textfarbe. */
	const hinweis = page.locator('.llb-hinweis').first();
	if (await hinweis.count()) {
		const farben = await hinweis.evaluate((node) => ({
			hinweis: getComputedStyle(node).color,
			text: getComputedStyle(document.body).color,
		}));
		assert.notEqual(farben.hinweis, farben.text, entity.kind + ': Hinweis nicht gedämpft');
	}

	const kacheln = page.locator('.mql-row-icon');
	if (await kacheln.count()) {
		const box = await kacheln.first().boundingBox();
		assert.ok(box, entity.kind + ': Detail-Icon nicht sichtbar');
		assert.equal(Math.round(box.width), breite > 700 ? 64 : 54, entity.kind + ': Detail-Icon-Größe');
	}
	assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false,
		entity.kind + ': Detail läuft über (' + breite + 'px)');
}

(async () => {
	const browser = await chromium.launch({ channel: 'chrome' });
	const fehler = {};
	try {
		for (const design of ['dark', 'light']) {
			const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
			const page = await context.newPage();
			await page.addInitScript((wert) => {
				try { localStorage.setItem('mql.theme', wert); } catch (fehler) { /* egal */ }
			}, design);
			const jsFehler = [];
			page.on('pageerror', (e) => jsFehler.push(design + ': ' + e.message));
			for (const entity of matrix.entities) {
				if (entity.list) {
					await page.setViewportSize({ width: 1280, height: 900 });
					await listePruefen(page, entity, 1280);
					await page.setViewportSize({ width: 390, height: 844 });
					await listePruefen(page, entity, 390);
				}
				if (entity.detail) {
					await page.setViewportSize({ width: 1280, height: 900 });
					await detailPruefen(page, entity, 1280);
					await page.setViewportSize({ width: 390, height: 844 });
					await detailPruefen(page, entity, 390);
				}
			}
			fehler[design] = jsFehler;
			await context.close();
		}
		assert.deepEqual(fehler.dark, [], 'JS-Fehler dunkel: ' + fehler.dark.join(' | '));
		assert.deepEqual(fehler.light, [], 'JS-Fehler hell: ' + fehler.light.join(' | '));
		console.log('Entitätenmatrix: ' + matrix.entities.length + ' Entitäten in dunkel und hell, Desktop und Handy geprüft');
	} finally {
		await browser.close();
	}
})().catch((error) => { console.error(error); process.exitCode = 1; });
