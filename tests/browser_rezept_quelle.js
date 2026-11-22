/* A crafted item names its recipe; the recipe page names its own sources.
 *
 * Run against the local PHP preview:
 *   python3 tools/lokalserver.py
 *   NODE_PATH=/opt/homebrew/lib/node_modules node tests/browser_rezept_quelle.js
 */
'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.LLB_FILTER_PHP || 'http://127.0.0.1:8817';

(async () => {
	const browser = await chromium.launch();
	try {
		for (const [lang, item, recipe, words] of [
			['de', 'gegenstand', 'rezept', {
				craft: /Herstellung/, result: /Ergebnisse/,
				variant: 'Armbrust die Täler',
				sources: ['Drechslerbücher', 'Quartiermeisterin'],
				noBarter: /Tauschhändler/
			}],
			['en', 'item', 'recipe', {
				craft: /Crafting/, result: /Results/,
				variant: 'Crossbow of the Vales',
				sources: ['Woodworking Bookshelf', 'Quartermaster'],
				noBarter: /Barterers/
			}],
			['fr', 'objet', 'recette', {
				craft: /Fabrication/, result: /Résultats/,
				variant: 'Arbalète du Val',
				sources: ['Etagère de livres de menuiserie', 'Intendante'],
				noBarter: /Troc/
			}]
		]) {
			const context = await browser.newContext();
			await context.route(/googletagmanager|google-analytics|goatcounter/, r => r.abort());
			const page = await context.newPage();
			const errors = [];
			page.on('pageerror', e => errors.push(String(e)));

			await page.goto(`${base}/${lang}/${item}/70052A0F/`, { waitUntil: 'domcontentloaded' });
			const itemText = await page.locator('main').innerText();
			assert.match(itemText, words.craft, 'item names its recipe');
			assert.doesNotMatch(itemText, words.noBarter, 'recipe source is not an item source');

			await page.goto(`${base}/${lang}/${recipe}/700529FC/`, { waitUntil: 'domcontentloaded' });
			const recipeText = await page.locator('main').innerText();
			assert.match(recipeText, words.result, 'recipe lists all results');
			assert.ok(recipeText.includes(words.variant), 'variant result is listed');
			for (const name of words.sources) {
				assert.ok(recipeText.includes(name), name + ' is listed as a recipe source');
			}
			for (const id of ['70020870', '70053663']) {
				assert.equal(await page.locator(`main a[href*="${id}/"]`).count(), 1, id + ' source link');
			}
			for (const id of ['70052A0A', '700529EE', '70052A0F', '70052A13']) {
				assert.equal(await page.locator(`main a[href*="${id}/"]`).count(), 1, id + ' result link');
			}
			assert.deepEqual(errors, []);
			console.log(`${lang}: item names the recipe, recipe lists variants and its sources`);
			await context.close();
		}
	} finally {
		await browser.close();
	}
})().catch(error => { console.error(error); process.exitCode = 1; });
