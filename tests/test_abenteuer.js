'use strict';
const assert = require('node:assert/strict');
const advisor = require('../web/abenteuer-logik.js');

const catalogue = () => ({
	packs: [
		{ id: 'base', order: 0, free: true, level_min: 1, level_max: 50, reviewed: true },
		{ id: 'moria', order: 1, level_min: 49, level_max: 60, reviewed: true },
		{ id: 'later', order: 2, level_min: 130, level_max: 140, reviewed: false }
	],
	areas: [
		{ id: 'bree', pack: 'base', order: 0, name: 'Bree-land', reviewed: true, level_min: 10, level_max: 20 },
		{ id: 'eregion', pack: 'moria', order: 1, name: 'Eregion', reviewed: true, level_min: 48, level_max: 53 },
		{ id: 'moria', pack: 'moria', order: 2, name: 'Moria', reviewed: true, level_min: 50, level_max: 60 }
	],
	quests: [
		{ i: '00000001', area: 'bree', l: '10' },
		{ i: '00000005', area: 'bree', l: '12' },
		{ i: '00000002', area: 'eregion', l: '48' },
		{ i: '00000003', area: 'eregion', l: '49', v: ['00000002'] },
		{ i: '00000004', area: 'moria', l: '50' }
	]
});
const character = { quests: ['00000001'], level: '60' };
const settings = { packs: { moria: 'owned' } };

let result = advisor.analyse(catalogue(), character, settings);
assert.equal(result.status, 'ready');
// Older unfinished content comes first: the base game, not the newest pack.
assert.equal(result.hints.finish.id, 'base');
assert.equal(result.hints.level.id, 'moria');
assert.equal(result.packs[0].id, 'base');
assert.equal(result.packs[0].coverage, 1 / 2);
assert.equal(result.packs[1].state, 'unrecorded');
assert.equal(result.packs[0].level_fit, 'below');
assert.equal(result.packs[1].level_fit, 'fits');
assert.notEqual(result.hints.finish.id, result.hints.level.id, 'hints must differ');

// Level fit reads from the character, not from the quests.
let c = catalogue();
result = advisor.analyse(c, { quests: ['00000002'], level: 20 }, settings);
assert.equal(result.packs[1].level_fit, 'above');
assert.equal(result.hints.level.id, 'base');
assert.equal(result.hints.finish, null);

// The next step is the earliest area with a quest whose known prerequisites hold.
c = catalogue();
result = advisor.analyse(c, { quests: [], level: 60 }, settings);
assert.equal(result.areas[1].ready_ids.join(','), '00000002');
assert.equal(result.areas[1].total, 2);
assert.equal(result.packs[1].next_area, 'eregion');
// Base game is free; ownership never has to be entered for it.
assert.equal(result.packs[0].access, 'available');
// A pack without verified assignment shows no percentage and no suggestion.
assert.equal(result.packs[2].coverage, null);
assert.equal(result.packs[2].reviewed, false);

// Missing ownership removes a pack from the suggestions, not from the list.
c = catalogue();
result = advisor.analyse(c, character, { packs: { moria: 'missing' } });
assert.equal(result.hints.finish.id, 'base');
assert.equal(result.hints.level, null);
assert.equal(result.packs[1].access, 'missing');
assert.equal(result.packs.length, 3);
// The base game is free; marking it missing does not lock it away.
assert.equal(advisor.analyse(c, character, { packs: { base: 'missing' } }).packs[0].access, 'available');

// Repeatables, sessions, instances and technical entries are not counted.
c = catalogue();
for (const [i, flags] of [{ rp: -1 }, { rp: 5 }, { dy: 1 }, { x: 1 }, { ix: 1 }, { technical: true }].entries()) {
	c.quests.push(Object.assign({ i: 'EXCLUDE' + i, area: 'moria', l: '50' }, flags));
}
assert.equal(advisor.analyse(c, character, settings).packs[1].total, 3);

// Mutually exclusive alternatives: a recorded completion wins, otherwise the
// dead end leaves the denominator.
c = catalogue();
c.quests.find(q => q.i === '00000002').e = ['00000001'];
assert.equal(advisor.analyse(c, character, settings).areas[1].total, 1);
assert.equal(advisor.analyse(c, { quests: ['00000001', '00000002'], level: 60 }, settings).areas[1].total, 2);

// Weighted aggregate: sum tasks, not average area percentages.
c = catalogue();
result = advisor.analyse(c, { quests: ['00000002'], level: 60 }, settings);
assert.equal(result.packs[1].coverage, 1 / 3);
assert.equal(result.areas[1].coverage, 1 / 2);
assert.equal(result.packs[1].state, 'started');

// A quest outside every area is a data error, not a silent zero.
c = catalogue();
c.quests.push({ i: 'ORPHAN', area: 'nowhere', l: '10' });
assert.throws(() => advisor.analyse(c, character, settings), /Unassigned quest/);
c = catalogue();
c.areas.push({ id: 'bree', pack: 'base' });
assert.throws(() => advisor.analyse(c, character, settings), /Invalid area/);

assert.equal(advisor.access({ id: 'moria' }, { packs: {}, vip: 'active' }), 'unknown');
assert.equal(advisor.access({ id: 'moria', vip_included: true }, { packs: {}, vip: 'active' }), 'temporary');

// Account settings stay independent; failures must not overwrite character data.
const store = new Map([['mql.charaktere', 'unchanged']]);
globalThis.localStorage = { getItem: k => store.get(k) || null, setItem: (k, v) => store.set(k, v) };
assert.equal(advisor.write('', settings, ['moria']), false);
assert.equal(advisor.write('account-a', settings, ['moria']), true);
assert.equal(advisor.write('account-b', { packs: { moria: 'missing', unknown: 'owned' } }, ['moria']), true);
assert.equal(advisor.read('account-a').packs.moria, 'owned');
assert.equal(advisor.read('account-b').packs.moria, 'missing');
assert.equal(advisor.read('account-b').packs.unknown, undefined);
assert.equal(store.get('mql.charaktere'), 'unchanged');
globalThis.localStorage.setItem = () => { throw new Error('Quota'); };
assert.equal(advisor.write('account-a', settings, ['moria']), false);
delete globalThis.localStorage;

console.log('Adventure advisor: all assertions passed.');
