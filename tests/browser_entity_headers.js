'use strict';
/* Entity pages: the breadcrumb ends with the open entity and the head shows
 * its type icon (an item shows the concrete game image instead). Section
 * headings read as sections, not as fine print.
 *
 * Usage: node tests/browser_entity_headers.js [http://127.0.0.1:8813]
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const basis = (process.argv[2] || 'http://127.0.0.1:8813').replace(/\/$/, '');
const seiten = [
	['/de/gebiet/268437634/', 'Nordhöhen'],
	['/de/region/268437557/', 'Eriador'],
	['/de/aufgabe/70075D00/', 'Roburgúl'],
	['/de/tat/7001F0DC/', 'Böse Festungen'],
	['/de/gegenstand/70001B7E/', 'Zwergenstahl'],
	['/de/rezept/70005795/', 'Polierte'],
	['/de/set/7000FAE9/', 'Reihenwächters'],
	['/de/auftraggeber/70047262/', 'Thorin'],
	['/de/fraktion/70057CC8/', 'Gundabad'],
	['/de/landmarke/70047384/', 'Carchost'],
	['/de/titel/70006369/', 'Gondor'],
	['/de/tugend/268440448/', 'Disziplin']
];

(async () => {
	const browser = await chromium.launch({ channel: 'chrome' });
	try {
		for (const [breite, hoehe] of [[1280, 900], [390, 844]]) {
			const page = await browser.newPage({ viewport: { width: breite, height: hoehe } });
			const errors = [];
			page.on('pageerror', (e) => errors.push(e.message));
			for (const [pfad, name] of seiten) {
				await page.goto(basis + pfad, { waitUntil: 'networkidle' });
				const stand = await page.evaluate(() => {
					const pfad = document.querySelector('.katalog-pfad');
					const h1 = document.querySelector('main h1');
					return {
						pfad: pfad ? pfad.innerText.replace(/\s+/g, ' ') : '',
						/* Titelzeile trägt die gemeinsame Icon-Kachel. */
						icon: document.querySelectorAll('main .katalog-titelzeile .mql-row-icon svg, main h1 svg.symbol').length,
						bild: document.querySelectorAll('main .katalog-titelzeile .mql-row-icon img, main h1 img.symbol-gross').length,
						h2: [...document.querySelectorAll('.katalog-abschnitt > h2')]
							.map((e) => getComputedStyle(e).fontSize + '/' + getComputedStyle(e).textTransform),
						overflow: document.documentElement.scrollWidth > innerWidth,
						titel: h1 ? h1.innerText.trim() : ''
					};
				});
				/* Der Pfad nennt den Weg (Bereich, Gebiet), der Titel die Entität. */
				assert.ok(stand.pfad.startsWith('Startseite'), 'Brotkrumen fehlen: ' + pfad + ' → ' + stand.pfad);
				assert.ok(stand.titel.includes(name), 'Titel fehlt: ' + pfad);
				/* Items und Rezepte tragen das Spielbild, alle anderen ihr Symbol. */
				if (pfad.startsWith('/de/gegenstand/') || pfad.startsWith('/de/rezept/')) {
					assert.ok(stand.bild > 0, 'Spielbild fehlt: ' + pfad);
				} else {
					assert.ok(stand.icon > 0, 'Entitätsicon fehlt: ' + pfad);
				}
				for (const h of stand.h2) {
					assert.equal(h, '20px/none', 'Abschnittsgröße in ' + pfad + ': ' + h);
				}
				assert.equal(stand.overflow, false, 'Überbreite: ' + pfad);
			}
			assert.deepEqual(errors, []);
			console.log(breite + 'px: ' + seiten.length + ' Entitätstypen mit Pfad, Icon und Abschnittsgröße ok');
			await page.close();
		}
		// The map frame of an area page must not stay empty.
		const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
		await page.goto(basis + '/de/gebiet/268437634/', { waitUntil: 'networkidle' });
		const bild = await page.evaluate(() => {
			const img = document.querySelector('.llb-karte img, .katalog-karte-gross img');
			return img ? { fertig: img.complete, breite: img.naturalWidth } : null;
		});
		assert.ok(bild && bild.fertig && bild.breite > 0, 'Gebietskarte lädt nicht');
		await page.close();
	} finally {
		await browser.close();
	}
})().catch((e) => { console.error(e); process.exitCode = 1; });
