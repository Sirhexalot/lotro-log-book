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

// readCharacters on file-like items.
C.readCharacters([
	{ path: 'characters/toon-00000/summary.xml', read: async () => summary },
	{ path: 'characters/toon-00000/questsStatus.xml', read: async () => quests },
	{ path: 'characters/toon-00000/deedsStatus.xml', read: async () => deeds },
]).then((result) => {
	assert.strictEqual(result.characters.length, 1);
	assert.strictEqual(result.characters[0].name, 'Feldobar');
	console.log('PASS: companion.js unit tests (ids, top level only, repeatables, no account data, paths, zip)');
}).catch((error) => { console.error(error); process.exit(1); });
