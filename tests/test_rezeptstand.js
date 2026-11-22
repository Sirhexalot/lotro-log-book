/* Recipe progress: the import flag decides whether missing recipes count as
 * "not learned". A complete import must not show the "partial data" hint. */
'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

function element(tag) {
	return {
		tag, className: '', textContent: '', children: [],
		appendChild(child) { this.children.push(child); },
		setAttribute() {}, classList: { add() {}, remove() {}, toggle() {} }
	};
}
const sandbox = {
	document: {
		documentElement: { lang: 'de' },
		createElement: element,
		createTextNode(text) { return { text }; },
		getElementById() { return null; },
		querySelector() { return null; },
		addEventListener() {}
	},
	window: {},
	Event: function () {}
};
sandbox.window = sandbox;
vm.runInNewContext(fs.readFileSync('web/treffer-zeile.js', 'utf8'), sandbox);
const ui = sandbox.MQL_TREFFERZEILE;
const words = ui.words;

function withCharacter(character) {
	sandbox.MQL_SPEICHER = { aktiv: () => character };
}
function rowText(node) {
	return node.children.map(part => part.textContent || part.text || '').join('');
}

// No character: offer the import, claim nothing.
withCharacter(null);
assert.equal(ui.recipeHasProgressData(), false);
assert.equal(ui.recipeProgress('A'), null);
assert.equal(ui.recipeHelp(), words.recipeProgress);

// An old backup with recipes but without the file flag stays cautious.
withCharacter({ rezepte: ['A'], importMeta: {} });
assert.equal(ui.recipeHasProgressData(), true);
assert.equal(ui.recipeHelp(), words.partialRecipes, 'old import keeps the partial hint');
assert.equal(ui.recipeProgress('B'), null, 'unknown completeness never says "not learned"');

// The Companion import read the recipe file: no hint, missing means not learned.
withCharacter({ rezepte: ['A'], importMeta: { recipes: true } });
assert.equal(ui.recipeHelp(), '', 'complete import shows no hint');
assert.equal(rowText(ui.recipeProgress('A')), '✓' + words.learned);
assert.equal(rowText(ui.recipeProgress('B')), '·' + words.notLearned);

// A complete but empty list still counts as complete.
withCharacter({ rezepte: [], importMeta: { recipes: true } });
assert.equal(ui.recipeHasProgressData(), true);
assert.equal(ui.recipeHelp(), '');
assert.equal(rowText(ui.recipeProgress('A')), '·' + words.notLearned);

// A dataset marker remains accepted if an importer writes one.
withCharacter({ rezepte: [], importMeta: { datasets: { recipes: { status: 'complete' } } } });
assert.equal(ui.recipeHelp(), '');
assert.equal(rowText(ui.recipeProgress('A')), '·' + words.notLearned);

// English keeps its own words.
sandbox.document.documentElement.lang = 'en';
vm.runInNewContext(fs.readFileSync('web/treffer-zeile.js', 'utf8'), sandbox);
const en = sandbox.MQL_TREFFERZEILE;
withCharacter({ rezepte: ['A'], importMeta: { recipes: true } });
assert.equal(en.recipeHelp(), '');
assert.match(rowText(en.recipeProgress('B')), /Not learned$/);

console.log('Rezeptstand: Importkennzeichnung, Teilhinweis und "Nicht gelernt" ok');
