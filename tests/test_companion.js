/* Unit tests for web/companion.js, without any game data.
 * Run: node tests/test_companion.js
 */
'use strict';
const assert = require('assert');
const path = require('path');
const zlib = require('zlib');
const C = require(path.join(__dirname, '..', 'web', 'companion.js'));

// Ids: decimal in Companion, eight hex digits in the game and the catalog.
assert.strictEqual(C.hexId('1879048198'), '70000006');
assert.strictEqual(C.hexId('1879339155'), '70047093');
assert.strictEqual(C.hexId('12'), '0000000C');
for (const bad of ['', 'abc', '-1', '1.5', '4294967296', '0']) {
	assert.strictEqual(C.hexId(bad), null, 'rejects ' + bad);
}

const summary = '<?xml version="1.0" encoding="UTF-8"?><character id="021B0000000019F4" name="Feldobar" server="Meriadoc" account="Sirhexalot" subscription="SECRET" class="Hunter" race="hobbit" sex="MALE" level="123" importDate="1793686744053"/>';
const quests = '<?xml version="1.0" encoding="UTF-8"?><questsStatus>\n' +
	'<questStatus key="1879048198" name="Mit allen &quot;Mitteln&quot;" state="COMPLETED"/>\n' +
	'<questStatus key="1879048202" name="Laufend" state="UNDERWAY"/>\n' +
	'<questStatus key="1879339006" name="Wiederholbar" state="UNDERWAY" completionCount="2"/>\n' +
	'<questStatus key="1879048198" name="Doppelt" state="COMPLETED"/>\n' +
	'<questStatus key="nonsense" state="COMPLETED"/>\n' +
	'</questsStatus>';
const deeds = '<?xml version="1.0" encoding="UTF-8"?><deedsStatus>\n' +
	'<deedStatus key="1879051515" name="Laufende Tat" state="UNDERWAY">\n' +
	'<objectiveStatus index="1" state="COMPLETED">\n<conditionStatus index="0" state="COMPLETED" count="1"/>\n</objectiveStatus>\n' +
	'</deedStatus>\n' +
	'<deedStatus key="1879051516" name="Fertige Tat" state="COMPLETED"/>\n' +
	'</deedsStatus>';

const who = C.summary(summary);
assert.deepStrictEqual([who.name, who.server, who.account, who.klasse, who.level], ['Feldobar', 'Meriadoc', 'Sirhexalot', 'Hunter', '123']);
assert.strictEqual(C.summary('<account name="x"/>'), null, 'an account summary is not a character');

const q = C.finished(quests, 'questStatus');
assert.deepStrictEqual(q.ids, ['70000006', '70046FFE'], 'completed and repeatable, no duplicates, no garbage');
assert.strictEqual(q.underway, 1);
const d = C.finished(deeds, 'deedStatus');
assert.deepStrictEqual(d.ids, ['70000CFC'], 'nested objective states must not count: ' + d.ids);

const entry = C.character({ summary, quests, deeds });
assert.strictEqual(entry.key, 'Sirhexalot|Meriadoc|Feldobar');
assert.strictEqual(entry.date, '2026-11-03');
assert.ok(!JSON.stringify(entry).includes('SECRET'), 'the subscription id must never be kept');
assert.strictEqual(C.character({ summary, quests: '', deeds: '' }), null, 'nothing finished is not a usable import');

// Plugin data file: the client's own layout, ids sorted, nothing else.
const text = C.pluginData(entry);
assert.ok(text.startsWith('return \r\n{'), 'client layout');
assert.ok(text.includes('["character"] = "Feldobar"'));
assert.ok(text.includes('["70000006"] = true') && text.includes('["70000CFC"] = true'));
assert.ok(!/= true,\r\n\t\}/.test(text), 'no trailing comma before the closing brace');
assert.ok(!text.includes('SECRET') && !text.includes('Sirhexalot'), 'no account data in the file');

// Paths: one import per character, one name list per account and server.
const other = Object.assign({}, entry, { key: 'Sirhexalot|Meriadoc|Meri', name: 'Meri' });
const third = Object.assign({}, entry, { key: 'Sirhexalot|Landroval|Lan', name: 'Lan', server: 'Landroval' });
const broken = Object.assign({}, entry, { key: 'x', name: 'Bad Name' });
const files = C.pluginFiles([entry, other, third, broken]);
const paths = files.map((f) => f.path).sort();
assert.deepStrictEqual(paths, [
	'Sirhexalot/Landroval/AllCharacters/MagicQuestLog_Characters.plugindata',
	'Sirhexalot/Landroval/AllCharacters/MagicQuestLog_Import_Lan.plugindata',
	'Sirhexalot/Meriadoc/AllCharacters/MagicQuestLog_Characters.plugindata',
	'Sirhexalot/Meriadoc/AllCharacters/MagicQuestLog_Import_Feldobar.plugindata',
	'Sirhexalot/Meriadoc/AllCharacters/MagicQuestLog_Import_Meri.plugindata',
]);
const index = files.find((f) => f.path === 'Sirhexalot/Meriadoc/AllCharacters/MagicQuestLog_Characters.plugindata').text;
assert.ok(index.includes('["Feldobar"] = true,') && index.includes('["Meri"] = true\r\n}'), index);

// Grouping picked files: the account summary.xml is not a character.
const groups = C.groupFiles([
	{ path: 'characters/toon-00000/summary.xml' }, { path: 'characters/toon-00000/questsStatus.xml' },
	{ path: 'characters/toon-00000/inventory.xml' },
	{ path: 'characters/toon-00001/summary.xml' },
	{ path: 'accounts/account-00000/summary.xml' },
]);
assert.strictEqual(groups.length, 1, 'only complete character folders');

// Zip: valid, readable, every file intact.
const archive = Buffer.from(C.zip(files));
const tmp = require('fs').mkdtempSync(path.join(require('os').tmpdir(), 'mqlzip-'));
require('fs').writeFileSync(path.join(tmp, 'a.zip'), archive);
const listing = require('child_process').execFileSync('unzip', ['-l', path.join(tmp, 'a.zip')]).toString();
for (const p of paths) { assert.ok(listing.includes(p), 'zip holds ' + p); }
require('child_process').execFileSync('unzip', ['-q', '-o', path.join(tmp, 'a.zip'), '-d', tmp]);
const back = require('fs').readFileSync(path.join(tmp, files[0].path), 'utf8');
assert.strictEqual(back, files[0].text, 'zip content unchanged');
assert.strictEqual(C.crc32(Buffer.from('123456789')), 0xCBF43926, 'crc32 check value');

// Running counters: objective and condition numbers as the game counts them.
const laufend = C.finished(deeds, 'deedStatus').running;
assert.deepStrictEqual(laufend['70000CFB'], [[1, 0, 1, 1]], 'running deed with its condition');
const zwei = C.conditions('<objectiveStatus index="2" state="UNDERWAY">' +
	'<conditionStatus index="0" state="UNDERWAY" count="44"/>' +
	'<conditionStatus index="1" state="COMPLETED"/></objectiveStatus>');
assert.deepStrictEqual(zwei, [[2, 0, 0, 44], [2, 1, 1, null]], 'count when present, null otherwise');

// Reputation and crafting, as LOTRO Companion writes them (ISO-8859-1, ids only).
const ruf = C.reputation('<?xml version="1.0" encoding="ISO-8859-1"?><reputation>' +
	'<faction id="1879091345" currentTier="6" currentReputation="81050"><level tier="1" date="0"/></faction>' +
	'<faction id="bad" currentTier="3"/>' +
	'<faction id="1879413167"><level tier="1" date="0"/><level tier="4" date="0"/></faction></reputation>');
assert.deepStrictEqual(ruf, [['7000A891', 6, 81050], ['700591AF', 4, null]], JSON.stringify(ruf));
const handwerk = C.crafting('<crafting name="X"><profession id="WOODWORKER">' +
	'<knownRecipe id="1879066786"/>' +
	'<level tier="2"><proficiency xp="280" completed="true" completionDate="0"/><mastery xp="10" completed="false"/></level>' +
	'<level tier="1"><proficiency xp="200" completed="true"/><mastery xp="400" completed="true"/></level>' +
	'</profession><profession id="lower"><level tier="1"/></profession></crafting>');
assert.deepStrictEqual(handwerk, { WOODWORKER: [[1, 200, 1, 400, 1], [2, 280, 1, 10, 0]] }, JSON.stringify(handwerk));

// readCharacters on file-like items.
C.readCharacters([
	{ path: 'characters/toon-00000/summary.xml', read: async () => summary },
	{ path: 'characters/toon-00000/questsStatus.xml', read: async () => quests },
	{ path: 'characters/toon-00000/deedsStatus.xml', read: async () => deeds },
	{ path: 'characters/toon-00000/reputation.xml', read: async () => '<faction id="1879091345" currentTier="6" currentReputation="81050"/>' },
	{ path: 'characters/toon-00000/crafting.xml', read: async () => '<profession id="COOK"><level tier="1"><proficiency xp="5" completed="false"/><mastery xp="0" completed="false"/></level></profession>' },
]).then((result) => {
	assert.strictEqual(result.characters.length, 1);
	const c = result.characters[0];
	assert.strictEqual(c.name, 'Feldobar');
	assert.deepStrictEqual(c.ruf, [['7000A891', 6, 81050]]);
	assert.deepStrictEqual(c.handwerk, { COOK: [[1, 5, 0, 0, 0]] });
	assert.ok(c.laufend['70000CFB'], 'running deed kept');
	console.log('PASS: companion.js unit tests (ids, top level only, repeatables, running counters, reputation, crafting, no account data, paths, zip)');
}).catch((error) => { console.error(error); process.exit(1); });
