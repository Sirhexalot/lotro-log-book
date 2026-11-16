'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const filterState = require('../web/filterzustand.js');

assert.doesNotMatch(fs.readFileSync('web/menue.js', 'utf8'), /seite:\s*'questfinder'/,
	'the standalone finder must not be a main-menu destination');
assert.doesNotMatch(fs.readFileSync('php/src/Shell.php', 'utf8'), /\['questfinder',\s*\$app\('questfinder'\)/,
	'the PHP family menu must not expose the finder');
const finderStyles = fs.readFileSync('web/gegenstaende.css', 'utf8');
const finderTemplate = fs.readFileSync('php/templates/app/aufgabenfinder.twig', 'utf8');
assert.match(finderTemplate, /class="seite-text gs-seite" data-seite="questfinder"/,
	'the quest finder must use the full-width text-page shell like the item browser');
assert.match(finderStyles, /--offen:\s*#f0a63c/);
assert.match(finderStyles, /--fertig:\s*#7fbb72/);
assert.match(finderStyles, /--laufend:\s*#7fa6c9/);

function fakeElement(tag) {
	return {
		tagName: tag,
		children: [],
		className: '',
		textContent: '',
		append(...children) { this.children.push(...children); },
		appendChild(child) { this.children.push(child); },
		addEventListener() {},
		replaceChildren(...children) { this.children = children; }
	};
}

function finder(imported) {
	let captured;
	const window = {
		MQL_REPLACED: {},
		MQL_SPEICHER: imported ? {
			aktiv: () => ({ quests: ['DONE0001'], deeds: [], level: '20', laufend: { RUN00001: [] } }),
			kennt: () => true
		} : { aktiv: () => null, kennt: () => false },
		MQL_FILTERADAPTER: { codec: (fields, defaults) => ({fields,defaults}), client: options => options },
		MQL_FILTER_UI: { mount: (root, options) => { captured = options; return {}; } }
	};
	const document = {
		documentElement: { lang: 'de' },
		createElement: fakeElement
	};
	const context = {
		window, document, location: { origin: 'https://example.test', pathname: '/de/aufgabenfinder/' },
		URL, Set, Array, String, Number, Object, Math, JSON
	};
	vm.runInNewContext(fs.readFileSync('web/karten-aufgabenfilter.js', 'utf8'), context);
	const root = {};
	const quests = [
		{i:'CLASS001',n:'Klassenaufgabe',th:'class',f:['themeClass','Jäger'],r:'Eriador',z:'Breeland',l:5},
		{i:'ORIGIN01',n:'Herkunftsaufgabe',th:'origin',f:['themeOrigin','Hobbit'],r:'Eriador',z:'Breeland',l:5},
		{i:'BOARD001',n:'Brettaufgabe',a:'Auftrag',r:'Eriador',z:'Breeland',l:5},
		{i:'DONE0001',n:'Erledigt',r:'Eriador',z:'Breeland',l:5},
		{i:'RUN00001',n:'Läuft',r:'Eriador',z:'Breeland',l:5},
		{i:'OPEN0001',n:'Offen',r:'Eriador',z:'Breeland',l:5},
		{i:'GREAT001',n:'Aufgabe am Großen Fluss',r:'Rohan',z:'Der Große Fluss',l:75},
		{i:'EAST0001',n:'Aufgabe in der Steppe',r:'Rohan',z:'Die Steppe',l:75}
	];
	window.MQL_KARTEN_AUFGABENFILTER.mount(root, quests, () => {});
	return { config: captured.config, adapter: captured.adapter };
}

const unimported = finder(false);
const groups = Object.fromEntries(unimported.config.groups.map(group => [group.id, group]));
assert.deepEqual(Array.from(unimported.config.groups, group => group.id),
	['status','level','geography','topic','class','origin','flag']);
assert.ok(groups.topic, 'topic filter exists');
assert.ok(groups.class, 'class is an independent filter group');
assert.ok(groups.origin, 'origin is an independent filter group');
assert.ok(groups.status, 'progress is a filter group');
assert.equal(groups.board, undefined, 'task board is not a separate filter group');
assert.deepEqual(Array.from(groups.topic.options, option => option.value), ['class', 'origin', 'board']);
assert.deepEqual(Array.from(groups.class.options, option => option.value), ['Jäger']);
assert.deepEqual(Array.from(groups.origin.options, option => option.value), ['Hobbit']);
assert.deepEqual(Array.from(groups.status.options, option => option.value), ['all', 'open', 'done']);
assert.ok(groups.status.options.every(option => option.keepVisible), 'empty status choices stay visible');

const state = filters => ({ q:'', filters:Object.assign({
	topic:[], class:[], origin:[], geography:[], flag:[], level:{min:null,max:null}, status:'all'
}, filters) });
const rows = unimported.adapter.rows;
assert.equal(unimported.adapter.matches(rows[0], state({class:['Jäger']})), true);
assert.equal(unimported.adapter.matches(rows[1], state({origin:['Hobbit']})), true);
assert.equal(unimported.adapter.matches(rows[2], state({topic:['board']})), true);
assert.equal(unimported.adapter.matches(rows[2], state({topic:['board'],origin:['Hobbit']})), false);
assert.equal(unimported.adapter.matches(rows[5], state({status:'open'})), false,
	'no imported progress must not classify every quest as open');
let geographyState = filterState.normalize(unimported.config, {}, null).state;
geographyState = filterState.reduce(unimported.config, geographyState,
	{type:'togglePath',groupId:'geography',path:{region:'Rohan'}}, null).state;
geographyState = filterState.reduce(unimported.config, geographyState,
	{type:'togglePath',groupId:'geography',path:{region:'Rohan',area:'Der Große Fluss'}}, null).state;
assert.deepEqual(JSON.parse(JSON.stringify(geographyState.filters.geography)),
	[{region:'Rohan',area:'Der Große Fluss'}],
	'choosing a sub-area replaces its broader selected region');
assert.equal(unimported.adapter.matches(rows[6], geographyState), true);
assert.equal(unimported.adapter.matches(rows[7], geographyState), false);
const geographyFacets = unimported.adapter.facets(rows, state({topic:['class'],class:['Jäger']})).geography;
const facetCount = path => geographyFacets.find(facet => JSON.stringify(facet.value) === JSON.stringify(path)).count;
assert.equal(facetCount({region:'Eriador'}), 1,
	'regions without matches under the active topic and class filters have zero facet counts');
assert.equal(facetCount({region:'Rohan'}), 0);
assert.equal(facetCount({region:'Eriador',area:'Breeland'}), 1,
	'child areas receive their own path-based facet counts');

const target = fakeElement('ol');
unimported.adapter.renderResults({payload:[rows[5]]}, target);
assert.match(target.children[0].children[0].children[1].className, /questfinder-status-unknown/);

const imported = finder(true);
const importedGroups = Object.fromEntries(imported.config.groups.map(group => [group.id, group]));
assert.deepEqual(Array.from(importedGroups.status.options, option => option.value), ['all', 'open', 'done', 'machbar']);
const importedRows = imported.adapter.rows;
const importedState = status => state({status});
assert.equal(imported.adapter.matches(importedRows[3], importedState('done')), true);
assert.equal(imported.adapter.matches(importedRows[4], importedState('open')), true);
assert.equal(imported.adapter.matches(importedRows[5], importedState('open')), true);
const importedTarget = fakeElement('ol');
imported.adapter.renderResults({payload:[importedRows[3], importedRows[4], importedRows[5]]}, importedTarget);
const statuses = Array.from(importedTarget.children, row => row.children[0].children[1].className);
assert.match(statuses[0], /questfinder-status-done/);
assert.match(statuses[1], /questfinder-status-running/);
assert.match(statuses[2], /questfinder-status-open/);

console.log('Aufgabenfinder: Themen, getrennte Filter und Fortschritt ok');
