/* Every catalogue entity that has a list page appears in the menu, in both
 * renderers. The server menu (Shell.php) and the client menu (menue.js) are
 * separate files; one of them losing an entry hid the vendors for a while. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');

const menue = fs.readFileSync(path.join(root, 'web/menue.js'), 'utf8');
const shell = fs.readFileSync(path.join(root, 'php/src/Shell.php'), 'utf8');

// The entities with their own list page and their path segments.
const eintraege = [
	{ key: 'vendor', texte: 'menue_haendler', href: '/de/haendler/' },
	{ key: 'giver', texte: 'menue_auftraggeber', href: '/de/auftraggeber/' },
	{ key: 'set', texte: 'menue_sets', href: '/de/set/' },
];

for (const eintrag of eintraege) {
	assert.match(shell, new RegExp("\\['" + eintrag.key + "'"), 'Shell.php ohne ' + eintrag.key);
}

// The client menu must know the segment, the entry and its label.
const context = { window: {} };
vm.createContext(context);
for (const file of ['texte.js', 'texte-logbuch.js']) {
	vm.runInContext(fs.readFileSync(path.join(root, 'web', file), 'utf8'), context);
}
const texte = context.window.MQL_TEXTE;
for (const lang of ['de', 'en', 'fr']) {
	assert.ok(texte[lang][eintraege[0].texte], lang + ': menue_haendler fehlt');
	assert.ok(texte[lang]['d_haendler'], lang + ': d_haendler fehlt');
}

assert.match(menue, /vendor:\s*'(haendler|vendor|marchand)'/, 'Segment für Händler fehlt');
assert.match(menue, /seite:\s*'vendor'[^}]*pfad\('vendor'\)/, 'Menüeintrag Händler fehlt');
assert.match(menue, /vendor:\s*'gegenstaende'/, 'Händler ist keiner Familie zugeordnet');
assert.match(menue, /seite:\s*'giver'|seite:\s*'auftraggeber'/, 'Auftraggeber fehlt im Clientmenü');
console.log('Menü: Server- und Clientmenü führen dieselben Entitäten.');
