'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const filterState = require('../web/filterzustand.js');

assert.doesNotMatch(fs.readFileSync('web/menue.js', 'utf8'), /seite:\s*'questfinder'/,
	'the standalone finder must not be a main-menu destination');
assert.doesNotMatch(fs.readFileSync('php/src/Shell.php', 'utf8'), /\['questfinder',\s*\$app\('questfinder'\)/,
	'the PHP family menu must not expose the finder');
const finderStyles = fs.readFileSync('web/gemeinsam.css', 'utf8');
const finderTemplate = fs.readFileSync('php/templates/app/aufgabenfinder.twig', 'utf8');
assert.match(finderTemplate, /class="seite-text gs-seite" data-seite="questfinder"/,
	'the quest finder must use the full-width text-page shell like the item browser');
assert.match(finderStyles, /--offen:\s*var\(--llb-palette-f0a63c\)/);
assert.match(finderStyles, /--fertig:\s*var\(--llb-palette-7fbb72\)/);
assert.match(finderStyles, /--laufend:\s*var\(--llb-palette-7fa6c9\)/);

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
	const events = {};
	let reads = 0, reloads = 0;
	let character = imported ? { quests: ['DONE0001'], deeds: [], level: '20',
		laufend: { RUN00001: [] }, importMeta: {quests:true} } : null;
	const window = {
		MQL_REPLACED: {},
		addEventListener: (name, listener) => { events[name] = listener; },
		MQL_SPEICHER: {
			aktiv: () => { reads++; return character; },
			manuelleStatus: () => assert.fail('row predicates must not read local storage'),
			status: () => assert.fail('prerequisites must not read local storage')
		},
		MQL_FILTERADAPTER: { codec: (fields, defaults) => ({fields,defaults}), client: options => options },
		MQL_FILTER_UI: { mount: (root, options) => { captured = options; return {setCharacterContext: () => { reloads++; }}; } }
	};
	const document = {
		documentElement: { lang: 'de' },
		createElement: fakeElement
	};
  const context = {
		window, document, location: { origin: 'https://example.test', pathname: '/de/aufgabenfinder/' },
		URL, Set, Array, String, Number, Object, Math, JSON
	};
	vm.runInNewContext(fs.readFileSync('web/sortierung.js', 'utf8'), context);
	context.MQL_SORT = window.MQL_SORT;
	vm.runInNewContext(fs.readFileSync('web/karten-aufgabenfilter.js', 'utf8'), context);
	const root = {};
	const quests = [
		/* `tp` is the theme path (stable key + label); `f` carries the map path,
		 * exactly as the build writes it. */
		{i:'CLASS001',n:'Klassenaufgabe',th:'class',
			tp:[['theme:class','Klassenaufgaben'],['category:37','Jäger']],
			f:['Eriador','Breeland','Archet'],r:'Eriador',z:'Breeland',l:5},
		{i:'ORIGIN01',n:'Herkunftsaufgabe',th:'origin',
			tp:[['theme:origin','Herkunftsaufgaben'],['category:210','Hobbit']],
			f:['Eriador','Breeland','Archet'],r:'Eriador',z:'Breeland',l:5},
		{i:'BOARD001',n:'Brettaufgabe',a:'Auftrag',r:'Eriador',z:'Breeland',l:5},
		{i:'DONE0001',n:'Erledigt',r:'Eriador',z:'Breeland',l:5},
		{i:'RUN00001',n:'Läuft',r:'Eriador',z:'Breeland',l:5},
		{i:'OPEN0001',n:'Offen',r:'Eriador',z:'Breeland',l:5},
		{i:'GREAT001',n:'Aufgabe am Großen Fluss',r:'Rohan',z:'Der Große Fluss',l:75},
		{i:'EAST0001',n:'Aufgabe in der Steppe',r:'Rohan',z:'Die Steppe',l:75}
	];
	window.MQL_KARTEN_AUFGABENFILTER.mount(root, quests, () => {});
	return { config: captured.config, adapter: captured.adapter, reads: () => reads, reloads: () => reloads,
		setCharacter: (next) => { character = next; events['mql-status'](); } };
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
assert.deepEqual(Array.from(groups.class.options, option => option.value), ['category:37'],
	'class values are the client keys, so a link survives a language switch');
assert.deepEqual(Array.from(groups.class.options, option => option.label), ['Jäger']);
assert.deepEqual(Array.from(groups.origin.options, option => option.value), ['category:210']);
assert.deepEqual(Array.from(groups.origin.options, option => option.label), ['Hobbit']);
assert.equal(groups.status.available(), false, 'no progress filter without known quest status');
assert.deepEqual(Array.from(groups.status.options, option => option.value), ['all']);
assert.equal(filterState.normalize(unimported.config, {filters:{status:'done'}}, null).state.filters.status, 'all',
	'a saved progress filter cannot hide results when progress is unknown');
assert.ok(groups.status.options.every(option => option.keepVisible), 'empty status choices stay visible');

const state = filters => ({ q:'', filters:Object.assign({
	topic:[], class:[], origin:[], geography:[], flag:[], level:{min:null,max:null}, status:'all'
}, filters) });
const rows = unimported.adapter.rows;
assert.equal(unimported.adapter.matches(rows[0], state({class:['category:37']})), true);
assert.equal(unimported.adapter.matches(rows[0], state({class:['category:99']})), false,
	'another class key does not match');
assert.equal(unimported.adapter.matches(rows[3], state({class:['category:37']})), false,
	'a quest without a class path never matches the class filter');
assert.equal(unimported.adapter.matches(rows[0], Object.assign(state({}), {q:'KLASSENAUFGABE'})), true,
	'search remains case-insensitive with the prepared search index');
assert.equal(unimported.adapter.matches(rows[1], state({origin:['category:210']})), true);
assert.equal(unimported.adapter.matches(rows[2], state({topic:['board']})), true);
assert.equal(unimported.adapter.matches(rows[2], state({topic:['board'],origin:['category:210']})), false);
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
const geographyFacets = unimported.adapter.facets(rows, state({topic:['class'],class:['category:37']})).geography;
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
assert.deepEqual(Array.from(importedGroups.status.options, option => option.value), ['all', 'open', 'running', 'done', 'machbar']);
assert.deepEqual(Array.from(importedGroups.status.options, option => option.label), ['Alle', 'Nicht begonnen', 'Begonnen', 'Erledigt', 'Voraussetzungen erfüllt']);
assert.equal(filterState.normalize(imported.config, {filters:{status:'unset'}}, null).state.filters.status, 'all',
	'the former unset filter falls back to all');
const importedRows = imported.adapter.rows;
const importedState = status => state({status});
assert.equal(imported.adapter.matches(importedRows[3], importedState('done')), true);
assert.equal(imported.adapter.matches(importedRows[4], importedState('open')), false);
assert.equal(imported.adapter.matches(importedRows[4], importedState('running')), true);
assert.equal(imported.adapter.matches(importedRows[5], importedState('open')), true);
const importedTarget = fakeElement('ol');
imported.adapter.renderResults({payload:[importedRows[3], importedRows[4], importedRows[5]]}, importedTarget);
const statuses = Array.from(importedTarget.children, row => row.children[0].children[1].className);
assert.match(statuses[0], /questfinder-status-done/);
assert.match(statuses[1], /questfinder-status-running/);
assert.match(statuses[2], /questfinder-status-open/);

assert.equal(imported.adapter.matches({...importedRows[5], v:['DONE0001']}, importedState('machbar')), true);
assert.equal(imported.adapter.matches({...importedRows[5], v:['MISSING1']}, importedState('machbar')), false);
assert.equal(imported.adapter.matches({...importedRows[5], e:['DONE0001']}, importedState('open')), false);
assert.equal(imported.adapter.matches({...importedRows[5], mp:1}, importedState('all')), true);
assert.equal(imported.adapter.matches({...importedRows[5], mp:1}, importedState('open')), false);
assert.equal(imported.adapter.matches({...importedRows[5], mp:1}, importedState('machbar')), false);
imported.adapter.facets(importedRows, importedState('machbar'));
assert.equal(imported.reads(), 1, 'all progress facets share one character snapshot');
imported.setCharacter({quests:['DONE0001'], manuell:{quests:{OPEN0001:'fertig'}}});
assert.equal(imported.adapter.matches(importedRows[5], importedState('done')), true, 'status event invalidates cached states');
assert.equal(imported.adapter.matches({...importedRows[0], v:['OPEN0001']}, importedState('machbar')), true);
assert.equal(imported.reads(), 2);
assert.equal(imported.reloads(), 1);
unimported.setCharacter({manuell:{quests:{OPEN0001:'fertig'}}});
assert.equal(groups.status.available(), true, 'a manual status enables progress filters without a page reload');
assert.ok(!groups.status.options.some(option => option.value === 'machbar'), 'manual progress alone does not establish quest availability');
assert.equal(unimported.adapter.matches(rows[5], state({status:'done'})), true);
assert.equal(unimported.adapter.matches(rows[3], state({status:'open'})), false, 'unmarked quests stay unknown with manual-only progress');
unimported.setCharacter({manuell:{quests:{}}});
assert.equal(groups.status.available(), false, 'clearing the last manual state hides the progress filters');

let manualProfile = null, writes = 0;
const statusDocument = {
	documentElement: {lang:'de'},
	createElement(tag) {
		return Object.assign(fakeElement(tag), {
			dataset:{}, classList:{add(){}, remove(){}, toggle(){}}, setAttribute(){}, events:{},
			addEventListener(name, fn) { this.events[name] = fn; }
		});
	}
};
const statusContext = {
	document:statusDocument, Event, dispatchEvent() {},
	MQL_SPEICHER:{
		aktiv: () => manualProfile,
		aktiviereManuell: () => { manualProfile = {}; },
		status: () => 'offen',
		manuelleStatus: () => manualProfile?.status,
		setzeStatus: (_art, _id, value) => { writes++; manualProfile.status = value; }
	}
};
vm.runInNewContext(fs.readFileSync('web/status.js', 'utf8'), statusContext);
const control = statusContext.MQL_STATUS_UI.create('quests', '700005C0', null, 'questfinder', null);
const choice = control.children[1];
assert.equal(choice.children[0].textContent, 'Kein Status');
assert.equal(choice.children[0].disabled, true);
assert.equal(choice.children[1].textContent, '· Nicht begonnen');
assert.equal(choice.children[2].textContent, '◐ Begonnen');
assert.equal(choice.value, '');
assert.equal(manualProfile, null, 'rendering must not create a manual profile');
choice.value = 'fertig';
choice.events.change();
assert.equal(writes, 1);
assert.equal(choice.value, 'fertig');

console.log('Aufgabenfinder: Themen, getrennte Filter und Fortschritt ok');
