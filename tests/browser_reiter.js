'use strict';
/* One tab bar everywhere: item, instance, class, area, companion, handwerk.
 *
 * The same component must switch the same way on every page: one selected
 * tab, exactly one visible panel, arrow keys moving the selection, and no
 * overflow on a phone. Run against the local PHP preview:
 *
 *   node tests/browser_reiter.js http://127.0.0.1:8817
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const basis = (process.argv[2] || 'http://127.0.0.1:8817').replace(/\/$/, '');

const seiten = [
	/* Woher, Wofür and the barterer tab. The barter source of a crafted item
	   sits on the recipe, so an item needs all three of its own for this row. */
	{ pfad: '/de/gegenstand/70003979/', reiter: 3 },
	{ pfad: '/de/instanz/7001A78B/', reiter: 3 },
	{ pfad: '/de/klassen/', reiter: 3 },
	{ pfad: '/de/gebiet/268437576/', reiter: 3 },
	{ pfad: '/de/handwerk/rezepte/', reiter: 2 },
	{ pfad: '/de/companion/', reiter: 2 },
	{ pfad: '/de/spielstand/', reiter: 2 }
];

async function zustand(page) {
	return page.evaluate(() => {
		const bars = [...document.querySelectorAll('.llb-reiter')];
		const gewaehlt = bars.map((bar) => [...bar.querySelectorAll('[data-reiter-knopf]')]
			.find((b) => b.getAttribute('aria-selected') === 'true')?.dataset.reiterKnopf || null);
		/* Tabs may share one panel (area pages re-render it), so count panels. */
		const sichtbar = bars.map((bar) => [...new Set([...bar.querySelectorAll('[data-reiter-knopf]')]
			.map((b) => b.getAttribute('aria-controls')))]
			.filter((id) => {
				const panel = document.getElementById(id);
				return panel && !panel.hidden;
			}));
		/* The panel of the selected tab must read as a panel, not as loose text. */
		const gewaehltBtn = document.querySelector('.llb-reiter [aria-selected="true"]');
		const panel = gewaehltBtn && document.getElementById(gewaehltBtn.getAttribute('aria-controls'));
		const stil = panel ? getComputedStyle(panel) : null;
		return { bars: bars.length, gewaehlt, sichtbar,
			panelRand: stil ? stil.borderTopWidth : null,
			panelFlaeche: stil ? stil.backgroundColor : null,
			seite: getComputedStyle(document.body).backgroundColor,
			ueberlauf: document.documentElement.scrollWidth > innerWidth + 1 };
	});
}

(async () => {
	const browser = await chromium.launch({ channel: 'chrome' });
	try {
		for (const [breite, hoehe] of [[1280, 1000], [390, 900]]) {
			const page = await browser.newPage({ viewport: { width: breite, height: hoehe } });
			const fehler = [];
			page.on('pageerror', (e) => fehler.push(e.message));
			for (const { pfad, reiter } of seiten) {
				await page.goto(basis + pfad, { waitUntil: 'load' });
				await page.waitForFunction(() => window.MQL_REITER);
				/* The import guide keeps its tabs inside a closed <details>. */
				await page.evaluate(() => document.querySelectorAll('details')
					.forEach((d) => { if (d.querySelector('.llb-reiter')) { d.open = true; } }));
				const vorher = await zustand(page);
				assert.equal(vorher.bars, 1, 'eine Reiterleiste in ' + pfad);
				assert.equal(await page.locator('.llb-reiter [data-reiter-knopf]').count(), reiter, 'Reiter in ' + pfad);
				assert.ok(vorher.gewaehlt[0], 'ein gewählter Reiter in ' + pfad);
				assert.equal(vorher.sichtbar[0].length, 1, 'genau ein sichtbares Panel in ' + pfad);
				assert.equal(vorher.sichtbar[0][0], await page.evaluate(() => document.querySelector('.llb-reiter [aria-selected="true"]').getAttribute('aria-controls')),
					'sichtbares Panel gehört zum Reiter in ' + pfad);
				assert.equal(vorher.panelRand, '1px', 'Panel ohne Rahmen in ' + pfad);
				assert.notEqual(vorher.panelFlaeche, 'rgba(0, 0, 0, 0)', 'Panel ohne Fläche in ' + pfad);
				assert.notEqual(vorher.panelFlaeche, vorher.seite, 'Panel hebt sich nicht ab in ' + pfad);
				assert.equal(vorher.ueberlauf, false, 'Überbreite in ' + pfad);

				// The last tab switches, and only its panel stays open.
				const letzter = await page.locator('.llb-reiter [data-reiter-knopf]').last().getAttribute('data-reiter-knopf');
				if (letzter !== vorher.gewaehlt[0]) {
					await page.locator('.llb-reiter [data-reiter-knopf]').last().click();
					await page.waitForFunction((key) => document.querySelector('.llb-reiter [data-reiter-knopf="' + key + '"]')
						.getAttribute('aria-selected') === 'true', letzter);
					const nachher = await zustand(page);
					assert.deepEqual(nachher.gewaehlt, [letzter], 'Wechsel in ' + pfad);
					assert.equal(nachher.sichtbar[0].length, 1, 'Panel nach Wechsel in ' + pfad);
					assert.equal(nachher.sichtbar[0][0], await page.evaluate((key) => document.querySelector('.llb-reiter [data-reiter-knopf="' + key + '"]').getAttribute('aria-controls'), letzter),
						'Panel gehört zum neuen Reiter in ' + pfad);
				}

				// Arrow keys move selection and focus together.
				const erste = await page.locator('.llb-reiter [data-reiter-knopf]').first().getAttribute('data-reiter-knopf');
				await page.locator('.llb-reiter [data-reiter-knopf="' + erste + '"]').focus();
				await page.keyboard.press('ArrowRight');
				const zweite = await page.evaluate(() => document.activeElement?.dataset.reiterKnopf || null);
				assert.notEqual(zweite, erste, 'Pfeiltaste wechselt in ' + pfad);
				assert.equal(await page.evaluate(() => document.activeElement.getAttribute('aria-selected')), 'true',
					'Fokus und Auswahl zusammen in ' + pfad);
			}
			assert.deepEqual(fehler, [], 'Seitenfehler bei ' + breite + 'px');
			await page.close();
		}

		// Light theme: the active tab must not keep a dark-only colour.
		const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
		await page.goto(basis + '/de/instanz/7001A78B/', { waitUntil: 'load' });
		await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
		const farben = await page.evaluate(() => {
			const aktiv = document.querySelector('.llb-reiter [aria-selected="true"]');
			const ruhend = document.querySelector('.llb-reiter [aria-selected="false"]');
			return { aktiv: getComputedStyle(aktiv).color, ruhend: getComputedStyle(ruhend).color,
				flaeche: getComputedStyle(aktiv).backgroundColor };
		});
		assert.notEqual(farben.aktiv, farben.ruhend, 'aktiver Reiter hebt sich ab');
		assert.ok(!/^rgb\(25, 21, 15\)$/.test(farben.aktiv), 'aktiver Reiter nicht dunkel auf dunkel');
		await page.close();
		console.log('Reiter: ein Baustein auf allen Seiten, Tastatur und helles Design ok');
	} finally {
		await browser.close();
	}
})().catch((error) => { console.error(error); process.exitCode = 1; });
