'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const character = {quests:['70000001'], laufend:{'70000003':[]}, importMeta:{quests:true}};
let reads = 0;
const context = {
	URLSearchParams, document:{documentElement:{lang:'de'}},
	location:{origin:'https://example.test', pathname:'/de/klassen/'},
	localStorage:{getItem(key) {
		if (key !== 'mql.charaktere') { return null; }
		reads++;
		return JSON.stringify({aktiv:'test', liste:{test:character}});
	}}
};
context.window = context;
vm.createContext(context);
for (const file of ['sortierung', 'speicher', 'filteradapter', 'aufgaben-filter']) {
	vm.runInContext(fs.readFileSync(`web/${file}.js`, 'utf8'), context);
}

(async () => {
	reads = 0;
	const rows = Array.from({length:1000}, (_, index) => ({
		id:String(70000001 + index), name:`Aufgabe ${index}`, level:10,
		type:'', flags:[], rewards:[], region:'Eriador', area:`Gebiet ${index % 10}`
	}));
	const {config, adapter} = context.MQL_TASK_FILTER_SETUP(rows, 'q');
	const state = config.defaults();
	state.filters.status = 'done';
	let result = await adapter.load(state, {});
	assert.equal(result.total, 1);
	assert.equal(result.payload[0].id, '70000001');
	assert.equal(reads, 1, 'setup reads the character once and the store keeps it for the load');
	result = await adapter.load(state, {});
	assert.equal(result.total, 1);
	assert.equal(reads, 1, 'the cached character is reused, not read per row');
	console.log('Aufgaben-/Tatenfilter: ein Spielstandzugriff, kein Zugriff pro Zeile');
})().catch(error => { console.error(error); process.exitCode = 1; });
