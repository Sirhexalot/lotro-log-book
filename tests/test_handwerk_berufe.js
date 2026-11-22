'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
class Element {
	constructor(tag) { this.tag = tag; this.children = []; this.dataset = {}; this.style = {}; }
	appendChild(child) { this.children.push(child); return child; }
	insertBefore(child) { this.children.unshift(child); }
	setAttribute() {}
	addEventListener(name, fn) { this[name] = fn; }
	set textContent(text) { this.text = text; this.children = []; }
	get textContent() { return (this.text || '') + this.children.map(x => x.textContent).join(''); }
}
function run(file, active) {
	const nodes = { berufe: new Element('div'), hinweis: new Element('p'), 'rohstoffe-liste': new Element('div') };
	const window = { MQL_SPRACHE: 'de', MQL_T: k => k === 'locale' ? 'de' : k,
		MQL_SPEICHER: { aktiv: () => active } };
	const context = vm.createContext({window, document: {
		documentElement: new Element('html'),
		getElementById: id => nodes[id], createElement: tag => new Element(tag),
		createTextNode: text => { const el = new Element('text'); el.textContent = text; return el; }
	}, getComputedStyle: () => ({getPropertyValue: () => ''}),
	URLSearchParams, location: { search: '' }});
	for (const data of ['sortierung.js', 'referenz.js', 'rezepte-de.js', 'vorkommen-de.js', file]) {
		vm.runInContext(fs.readFileSync(path.join(root, 'web', data), 'utf8'), context);
	}
	// The page gets MQL_SORT as a global; in the sandbox it lives on window.
	context.MQL_SORT = window.MQL_SORT;
	return {nodes, window};
}
function all(el) { return [el].concat(el.children.flatMap(all)); }
for (const active of [null, {handwerk: {}}, {handwerk: {COOK: []}}]) {
	const {nodes} = run('handwerk.js', active);
	assert.equal(all(nodes.berufe).filter(x => x.tag === 'section').length, 0);
	assert.equal(all(nodes.berufe).filter(x => x.tag === 'input').length, 0);
}
{
	const {nodes} = run('handwerk.js', {handwerk: {COOK: [[1, 0, false, 0, false]]}});
	assert.equal(all(nodes.berufe).filter(x => x.tag === 'section').length, 1);
	assert.equal(all(nodes.berufe).filter(x => x.tag === 'input').length, 0);
}
{
	const {nodes, window} = run('rohstoffe.js', {handwerk: {COOK: [[1, 0, false, 0, false]]}});
	window.MQL_ROHSTOFFE_ZEICHNEN();
	const ingredients = all(nodes['rohstoffe-liste']).filter(x => x.dataset.zutat);
	const expected = new Set(window.MQL_REZEPTE.r.filter(r => r[9] === 'COOK').flatMap(r => r[6].map(z => z[3])).filter(Boolean));
	assert.equal(ingredients.length, expected.size);
	assert.ok(ingredients.length > 300);
	assert.equal(new Set(ingredients.map(x => x.dataset.zutat)).size, ingredients.length);
	assert.ok(all(nodes['rohstoffe-liste']).some(x => x.href && x.href.includes('/de/rezept/')));
	assert.ok(!nodes['rohstoffe-liste'].textContent.includes('hw_roh_anbau'));
	assert.equal(all(nodes['rohstoffe-liste']).filter(x => x.tag === 'input').length, 1);
}
console.log('Handwerk: imported professions only; complete, deduplicated cooking ingredients and recipe sources passed.');
