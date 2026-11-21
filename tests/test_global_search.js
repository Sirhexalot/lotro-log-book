'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function element(tag) {
	const children = [];
	let text = '';
	return {
		tagName: tag,
		children,
		className: '',
		href: '',
		type: '',
		hidden: false,
		addEventListener() {},
		append(...nodes) { children.push(...nodes); },
		appendChild(node) { children.push(node); },
		set textContent(value) { text = String(value); children.length = 0; },
		get textContent() { return text || children.map(node => node.textContent || '').join(''); }
	};
}

const nodes = Object.fromEntries(['su-feld', 'su-liste', 'su-anzahl', 'su-hinweis'].map(id => [id, element(id)]));
nodes['su-feld'].value = 'searchable';
nodes['su-feld'].focus = () => {};
const kinds = ['q', 'd', 'g', 'r', 't', 'v', 's', 'n', 'l', 'f'];
const renderedKinds = new Set();
const window = {
	MQL_SUCHE: kinds.map((kind, index) => [kind, String(index), 'searchable ' + kind, '', '']),
	location: {search: ''},
	MQL_T: key => key,
	MQL_TREFFERZEILE: {
		searchRow(target, options) {
			renderedKinds.add(options.kind);
			return {textContent:options.name};
		}
	},
	addEventListener() {}
};
const document = {
	getElementById: id => nodes[id],
	createElement: element,
	createTextNode: text => ({textContent: String(text)})
};
const context = {window, document, URLSearchParams, String, Array, Object, Math};
vm.runInNewContext(fs.readFileSync('web/suche.js', 'utf8'), context);

function allText(node) {
	return (node.textContent || '') + (node.children || []).map(allText).join('');
}
const rendered = allText(nodes['su-liste']);
for (const kind of kinds) {
	assert.ok(rendered.includes(kind), 'global search keeps results for type ' + kind);
	assert.ok(renderedKinds.has(kind), 'global search uses the shared list row for type ' + kind);
}

const app = fs.readFileSync('web/app.js', 'utf8');
assert.match(app, /var SUCHARTEN = \['q','d','g','r','t','v','s','n','l','f'\]/,
	'the map header search covers every global-index type');
assert.match(app, /list\.appendChild\(window\.MQL_TREFFERZEILE\.searchRow/,
	'the map header search inserts each shared result row into its list');
const logbookTexts = fs.readFileSync('web/texte-logbuch.js', 'utf8');
for (const caption of ['Im LOTRO Log Book suchen', 'Search LOTRO Log Book', 'Rechercher dans LOTRO Log Book']) {
	assert.ok(logbookTexts.includes(caption), 'search caption is translated: ' + caption);
}
assert.match(fs.readFileSync('php/templates/app/suche.twig', 'utf8'), /filter-ui\.css/);
assert.match(fs.readFileSync('php/templates/app/suche.twig', 'utf8'), /treffer-zeile\.js/);
assert.match(fs.readFileSync('php/templates/app/suche.twig', 'utf8'), /<\/div>\s*<p class="suche-anzahl" id="su-anzahl"/,
	'the hit count sits below the full-width search field');
assert.match(fs.readFileSync('php/templates/app/karte.twig', 'utf8'), /filter-ui\.css/);

console.log('Global search: all indexed entity types and captions ok');
