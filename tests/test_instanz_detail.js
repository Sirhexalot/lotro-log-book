const assert = require('node:assert/strict');
const {matchingConditions, chanceText} = require('../web/instanz-detail.js');

const a = {level:[50,59], tier:[1,1], players:[1,3], chances:[0.175]};
const b = {level:[85,85], tier:[2,3], players:[12,12], chances:[0.25,0.0625]};
const c = {level:[85,85], tier:[2,2], players:[12,12], chances:[0.25]};
const loot = {conditions:[a,b,c]};
const filter = (level = {min:null,max:null}, tier = [], players = []) => ({level,tier,players});
assert.deepEqual(matchingConditions(loot, filter({min:85,max:85},['1'],['12'])), []);
assert.deepEqual(matchingConditions(loot, filter({min:85,max:85},['2'],['6'])), []);
assert.deepEqual(matchingConditions(loot, filter({min:59,max:59},['1'],['2'])), [a]);
assert.deepEqual(matchingConditions(loot, filter({min:60,max:84})), []);
assert.deepEqual(matchingConditions(loot, filter({min:85,max:85},['1','2'],['12'])), [b,c]);
assert.deepEqual(matchingConditions(loot, filter({min:85,max:85},['1'],['12']), 'tier'), [b,c]);
assert.equal(chanceText([b,c], 'en'), '25% / 6.25%');
assert.equal(chanceText([b,c], 'de'), '25\u00a0% / 6,25\u00a0%');
assert.equal(chanceText([b,c], 'fr'), '25\u00a0% / 6,25\u00a0%');
console.log('Instanzbeute: gemeinsame Bedingungen, Facetten und Chancen geprüft');
