/* Eignungsfarbe: Grenzen, Sperren und "nicht beurteilbar".
 *
 * Run without a browser:
 *   node tests/test_eignung.js
 *
 * The thresholds are the ones agreed on 22.11.2026: green up to 10 levels
 * below the character, yellow 11–14, grey from 15; red wins over grey; a
 * scalable item above the character is not judgeable, nor is one above the
 * game's level cap. Kind 1 tests the rules, kind 2 the real catalogue rows.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.join(__dirname, '..');

function element() {
	return {
		children: [], attrs: {}, className: '', textContent: '',
		setAttribute(key, value) { this.attrs[key] = String(value); },
		getAttribute(key) { return Object.hasOwn(this.attrs, key) ? this.attrs[key] : null; },
		appendChild(child) { this.children.push(child); return child; },
		insertBefore(child) { this.children.unshift(child); return child; },
		removeChild(child) { this.children = this.children.filter(row => row !== child); },
		querySelector() { return null; },
		remove() {},
		get firstChild() { return this.children[0] || null; },
		get lastChild() { return this.children[this.children.length - 1] || null; }
	};
}

global.window = global;
global.document = {
	readyState: 'complete',
	documentElement: {lang: 'de'},
	createElement: () => element(),
	createTextNode: text => ({nodeType: 3, textContent: text}),
	querySelectorAll: () => [],
	addEventListener() {}
};
global.MQL_SPRACHE = 'de';

let character = {level: '123', klasse: 'Hunter', race: 'hobbit'};
global.MQL_SPEICHER = {aktiv: () => character};

for (const file of ['web/klassen-proficiency.js', 'web/eignung.js']) {
	// eslint-disable-next-line no-eval
	eval(fs.readFileSync(path.join(ROOT, file), 'utf8'));
}

const E = global.MQL_EIGNUNG;
const state = req => (E.ton(req, E.charakter()) || {}).code;

function check(name, req, want) {
	assert.equal(state(req), want, `${name}: ${JSON.stringify(req)}`);
}

// --- thresholds ---------------------------------------------------------
check('gap 0 is green', {ml: 123}, 'passt');
check('gap 10 is green', {ml: 113}, 'passt');
check('gap 11 is yellow', {ml: 112}, 'aelter');
check('gap 14 is yellow', {ml: 109}, 'aelter');
check('gap 15 is grey', {ml: 108}, 'ueberholt');

// --- hard blocks --------------------------------------------------------
check('class requirement blocks', {ml: 120, rk: 'Guardian'}, 'falsch');
check('shared class requirement passes', {ml: 120, rk: 'Warden;Hunter'}, 'passt');
check('heavy armour on a hunter', {ml: 120, at: 'HEAVY'}, 'falsch');
check('shield on a hunter', {ml: 120, at: 'SHIELD'}, 'falsch');
check('light armour on a hunter', {ml: 120, at: 'LIGHT'}, 'passt');
check('crossbow is a hunter weapon', {ml: 120, wt: 'CROSSBOW'}, 'passt');
check('staff is not', {ml: 120, wt: 'STAFF'}, 'falsch');
check('wrong race', {ml: 120, rr: 'elf'}, 'falsch');
check('red wins over grey', {ml: 40, at: 'HEAVY'}, 'falsch');

// --- not judgeable ------------------------------------------------------
assert.equal(state({}), undefined, 'nothing known means no chip');
assert.equal(state([]), undefined, 'PHP sends an empty set as []');
check('class known but no level', {rk: 'Hunter'}, 'unklar');
check('above the level cap', {ml: 282}, 'unklar');
check('scalable above the character', {ml: 130, sc: 1}, 'unklar');
check('scalable below stays coloured', {ml: 120, sc: 1}, 'passt');

// --- warning only on green ---------------------------------------------
check('further requirement at green', {ml: 121, ex: 1}, 'achtung');
check('further requirement at grey', {ml: 100, ex: 1}, 'ueberholt');

character = {level: '5', klasse: 'Hunter', race: 'hobbit'};
check('proficiency level counts (crossbow from 7)', {ml: 1, wt: 'CROSSBOW'}, 'falsch');
character = {level: '123', klasse: '', race: ''};
check('class unknown warns', {ml: 120}, 'achtung');
check('level still counts without a class', {ml: 130}, 'zu-hoch');
character = {level: '123', klasse: 'Hunter', race: 'hobbit'};
assert.equal(E.ton({ml: 120}, null), null, 'no character means no colour');

// --- both key shapes ----------------------------------------------------
check('short keys', {ml: 120}, 'passt');
check('long keys from PHP', {min: 120, klasse: '', armour: 'LIGHT'}, 'passt');
check('long keys, wrong armour', {min: 120, armour: 'HEAVY'}, 'falsch');
check('long keys, scalable above', {min: 130, scalable: 1}, 'unklar');

// --- catalogue rows -----------------------------------------------------
// Positional row: 10 class, 11 race, 12 armour, 13 weapon, 14 min, 15 extra, 16 scalable.
const row = [0, 'x', 0, 0, 0, 0, 0, 388, 0, 0, '', '', '', 'CROSSBOW', 120, false, true];
assert.equal(E.zeile(row, E.charakter()).code, 'passt', 'catalogue row is judged by min level');
assert.equal(E.zeile(row, E.charakter()).title, 'Mindeststufe 120 · passt zu Stufe 123');
row[14] = 130;
assert.equal(E.zeile(row, E.charakter()).code, 'unklar', 'scalable row above the character');

console.log('eignung: thresholds, blocks, not-judgeable and catalogue rows passed');
