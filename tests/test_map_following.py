"""Exercise the actual JS helpers without needing a browser or a full build."""
import shutil
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


@unittest.skipUnless(shutil.which('node'), 'node required')
class MapFollowingTests(unittest.TestCase):
    def test_map_selection_and_symbol_identity(self):
        script = r'''
const fs = require('fs'), vm = require('vm'), assert = require('assert');
const app = fs.readFileSync('web/app.js','utf8');
const start = app.indexOf('\tfunction karteFuerOrte(');
const helper = app.slice(start,app.indexOf('\n\t/**',start));
const base={north:10,south:0,east:10,west:0,mr:1,rahmen:'spiel'};
const karten=[{...base,idx:1},{...base,idx:2,eltern:1,north:5,east:5},
 {...base,idx:3,eltern:1,south:5,west:5},
 {...base,idx:4,mr:2,north:2,east:2},
 {...base,idx:5,eltern:1,rahmen:'unklar',north:2,east:2}];
const c={karten,karteNachIndex:Object.fromEntries(karten.map(m=>[m.idx,m])),
 window:{MQL_REFERENZ:{symbole:{'700007D9':1090524300}}},sprache:'de',
 eltern:()=>({addEventListener:()=>{}})};
vm.createContext(c);vm.runInContext(helper,c);
assert.equal(c.karteFuerOrte([[1,1,1]],1),2);
assert.equal(c.karteFuerOrte([[2,1,1],[3,8,8]],1),1);
assert.equal(c.karteFuerOrte([],null),null);
assert.equal(c.karteFuerOrte([[1,20,20]],1),1);
c.karteNachIndex[1].eltern=2;
assert.equal(c.karteFuerOrte([[2,1,1]],1),2);
const symbolStart=app.indexOf('\tfunction symbolBild(');
vm.runInContext(app.slice(symbolStart,app.indexOf('\n\tfunction gegenstandLink',symbolStart)),c);
assert(c.symbolBild('700007D9').src.includes('/1090524300.webp'));
const missing=c.symbolBild('UNKNOWN');assert(missing.hidden);assert(!missing.src);
assert(!app.includes('if (window.location.hash) { landschaftAusAdresse(); }'));
'''
        subprocess.run(['node', '-e', script], cwd=ROOT, check=True,
                       capture_output=True, text=True)
