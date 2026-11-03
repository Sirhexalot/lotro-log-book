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
    name: c.name, server: c.server, account: c.account, quests: c.quests, deeds: c.deeds })),
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
        assert ids == set(character['quests']) | set(character['deeds']), 'ids lost on the way'
        assert imported.date and re.match(r'^\d{4}-\d{2}-\d{2}$', imported.date), imported.date
        other = lua.eval('MagicQuestLog.Characters.LoadImport("Someoneelse")')
        assert other is None, 'another name must not read this file'

        index = path.parent / 'MagicQuestLog_Characters.plugindata'
        listed = lua.eval('assert(loadstring(...))()', index.read_text(encoding='utf-8'))
        assert listed[character['name']] is True, 'character missing from the name list'

    print('PASS: %d character(s) from the real Companion folder reach the plugin intact; %d files'
          % (len(result['characters']), len(result['files'])))
    return 0


if __name__ == '__main__':
    sys.exit(main())
