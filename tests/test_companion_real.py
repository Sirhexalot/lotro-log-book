"""Integration test: LOTRO Companion's real files -> companion.js -> the plugin.

Runs the browser converter (web/companion.js, in Node) on a real Companion data
folder, then hands every written plugin data file to Magic Quest Log's own
Characters.lua in Lua 5.1, the way the game does. Also checks the counts against
the plugin's catalogs.

Needs: node, the plugin repository next to this one (with its .venv for lupa) and a
Companion data folder. Without the folder the test is skipped, not failed.

Run:
    ../MagicQuestLog/.venv/bin/python tests/test_companion_real.py [<companion data/characters>]
"""
from pathlib import Path
import json
import os
import re
import subprocess
import sys
import tempfile

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
PLUGIN = ROOT.parent / 'MagicQuestLog' / 'plugin' / 'MagicQuestLog'
DEFAULT = Path.home() / ('Applications/The Lord of the Rings Online.app/Contents/SharedSupport/'
                         'prefix/drive_c/users/Wineskin/.lotrocompanion/data/characters')

NODE = r'''
const C = require(process.argv[2]);
const fs = require('fs'), path = require('path');
const root = process.argv[3], out = process.argv[4];
const items = [];
(function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) { walk(full); continue; }
    items.push({ path: path.relative(path.dirname(root), full), read: async () => fs.readFileSync(full, 'utf8') });
  }
})(root);
C.readCharacters(items).then((result) => {
  const files = C.pluginFiles(result.characters);
  for (const f of files) {
    const target = path.join(out, f.path);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, f.text);
  }
  console.log(JSON.stringify({ characters: result.characters.map((c) => ({
    name: c.name, server: c.server, account: c.account, quests: c.quests, deeds: c.deeds,
    laufend: c.laufend, ruf: c.ruf, handwerk: c.handwerk })),
    files: files.map((f) => f.path) }));
});
'''


def main():
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT
    if not source.is_dir():
        print('SKIP: no Companion folder at %s' % source)
        return 0
    from lupa.lua51 import LuaRuntime

    out = Path(tempfile.mkdtemp(prefix='mql-companion-'))
    script = out / 'run.js'
    script.write_text(NODE, encoding='utf-8')
    result = json.loads(subprocess.check_output(
        ['node', str(script), str(ROOT / 'web' / 'companion.js'), str(source), str(out / 'PluginData')]))
    assert result['characters'], 'no character read'

    catalog = {}
    for kind in ('Quests', 'Deeds'):
        text = (PLUGIN / 'Data' / ('%s_de.lua' % kind)).read_text(encoding='utf-8')
        catalog[kind] = set(re.findall(r'\["id"\]="([0-9A-F]{8})"', text))

    for character in result['characters']:
        quests = set(character['quests']) & catalog['Quests']
        deeds = set(character['deeds']) & catalog['Deeds']
        print('  %s (%s): %d quests, %d deeds finished in the catalog'
              % (character['name'], character['server'], len(quests), len(deeds)))
        assert len(quests) > 0, 'no quest of %s is in the catalog' % character['name']

        # The plugin side: the game's PluginData.Load parses the file as Lua and
        # returns the table; Characters.lua must accept it for this character only.
        path = out / 'PluginData' / character['account'] / character['server'] / 'AllCharacters' / (
            'MagicQuestLog_Import_%s.plugindata' % character['name'])
        assert path.is_file(), 'missing ' + str(path)
        lua = LuaRuntime(unpack_returned_tuples=True)
        lua.execute('Turbine = { DataScope = { Server = 3, Character = 2 } }')
        lua.globals().fileText = path.read_text(encoding='utf-8')
        lua.execute('''
            local chunk = assert(loadstring(fileText));
            stored = { ["MagicQuestLog_Import_''' + character['name'] + '''"] = chunk() };
            Turbine.PluginData = {
              Load = function(scope, key) return stored[key]; end,
              Save = function() return true; end,
            };
        ''')
        lua.execute((PLUGIN / 'Characters.lua').read_text(encoding='utf-8'))
        imported = lua.eval('MagicQuestLog.Characters.LoadImport("%s")' % character['name'])
        assert imported is not None, 'the plugin rejected the import of ' + character['name']
        ids = set(imported.completed.keys())
        # Running counters and the level reach the plugin as well.
        running = imported.running
        counted = sum(1 for _ in running.keys())
        assert counted == len(character['laufend']), 'running entries %d vs %d' % (counted, len(character['laufend']))
        assert imported.level is not None and int(imported.level) > 0, 'level must reach the plugin'
        print('  %s: %d running entries and level %s read by the plugin' % (character['name'], counted, imported.level))
        assert ids == set(character['quests']) | set(character['deeds']), 'ids lost on the way'
        assert imported.date and re.match(r'^\d{4}-\d{2}-\d{2}$', imported.date), imported.date
        other = lua.eval('MagicQuestLog.Characters.LoadImport("Someoneelse")')
        assert other is None, 'another name must not read this file'

        index = path.parent / 'MagicQuestLog_Characters.plugindata'
        listed = lua.eval('assert(loadstring(...))()', index.read_text(encoding='utf-8'))
        assert listed[character['name']] is True, 'character missing from the name list'

    # Running counters must land on a goal of the catalogue with the same objective
    # and condition number, and never exceed that goal's total.
    goals = {}
    for kind in ('Quests', 'Deeds'):
        lua = LuaRuntime()
        lua.execute((PLUGIN / 'Data' / ('%s_de.lua' % kind)).read_text(encoding='utf-8'))
        for record in lua.globals().MagicQuestLog.Data[kind.lower() + '_de'].values():
            for step in record.s.values():
                for goal in step.g.values():
                    goals[(record.id, str(step.i), goal.k)] = goal.c
    for character in result['characters']:
        matched = above = 0
        for ident, rows in character['laufend'].items():
            for objective, condition, done, count in rows:
                key = (ident, str(objective), condition)
                if key in goals and goals[key] and count is not None:
                    matched += 1
                    if count > goals[key]:
                        above += 1
        assert matched > 0, 'no running counter matched a catalogue goal'
        assert above == 0, '%d counters above their goal total: wrong numbering' % above
        print('  %s: %d running entries, %d counters matched to a goal with a total, none above it'
              % (character['name'], len(character['laufend']), matched))

    # Reputation and crafting resolve against the reference data from our own DAT export.
    referenz_text = (ROOT / 'web' / 'referenz.js').read_text(encoding='utf-8')
    referenz = json.loads(referenz_text.split('= ', 1)[1].rstrip().rstrip(';'))
    for character in result['characters']:
        unknown = [row[0] for row in character['ruf'] if row[0] not in referenz['fraktionen']]
        assert not unknown, 'factions without a name: %s' % unknown[:5]
        for faction, tier, points in character['ruf']:
            info = referenz['fraktionen'][faction]
            assert info['min'] <= tier <= info['max'], 'tier out of range for %s' % faction
            assert str(tier) in info['s'], 'no name for tier %s of %s' % (tier, faction)
        for profession, tiers in character['handwerk'].items():
            assert profession in referenz['berufe'], 'unknown profession ' + profession
            known = {stufe['t'] for stufe in referenz['berufe'][profession]['s']}
            assert all(row[0] in known or row[0] == 0 for row in tiers), 'unknown tier in ' + profession
        print('  %s: %d factions and %d professions, every one named in DE/EN/FR'
              % (character['name'], len(character['ruf']), len(character['handwerk'])))

    print('PASS: %d character(s) from the real Companion folder reach the plugin intact; %d files'
          % (len(result['characters']), len(result['files'])))
    return 0


if __name__ == '__main__':
    sys.exit(main())
