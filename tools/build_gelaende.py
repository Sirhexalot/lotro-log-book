#!/usr/bin/env python3
"""Read client radar tiles, build a shared tiled terrain pyramid and coverage.

Generated files stay outside the checkout. No remote map service is used.
Usage: python3 tools/build_gelaende.py [--prepare-only] [--skip-export]
"""
import argparse
import hashlib
import json
import math
import subprocess
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from PIL import Image

REPO = Path(__file__).resolve().parents[1]
CLIENT = Path.home() / 'Applications/The Lord of the Rings Online.app/Contents/SharedSupport/prefix/drive_c/Program Files (x86)/StandingStoneGames/Der Herr der Ringe Online'
LIB = Path.home() / 'Applications/LOTRO-Companion-Test/LotRO Companion/app/lib'
CACHE = Path.home() / '.cache/llb-terrain'

def maps_read(path):
    return json.JSONDecoder().raw_decode(path.read_text().split('window.MQL_KARTEN = ', 1)[1])[0]

def block_range(area):
    values = [area.get(k) for k in ('west', 'south', 'east', 'north')]
    if area.get('rahmen') == 'unklar' or not area.get('bounds') or not area.get('mr'):
        return None
    if not all(isinstance(v, (float, int)) and math.isfinite(v) for v in values):
        return None
    west, south, east, north = values
    if east <= west or north <= south:
        return None
    # PositionDecoder uses 160-unit blocks, 0.005 display units per unit,
    # with origin offsets 29360 (EW) and 24880 (NS). Float edges are snapped.
    snap = lambda n: round(n) if abs(n-round(n)) < .0001 else n
    x0, x1 = math.floor(snap((west+146.8)/.8)), math.ceil(snap((east+146.8)/.8))
    y0, y1 = math.floor(snap((south+124.4)/.8)), math.ceil(snap((north+124.4)/.8))
    if min(x0,y0) < 0 or max(x1,y1) > 256:
        return None
    return x0, y0, x1, y1

def requested(areas, frames=()):
    result = set()
    for area in areas:
        bounds = block_range(area)
        if bounds:
            x0,y0,x1,y1 = bounds
            result.update((area['mr'],x,y) for x in range(x0,x1) for y in range(y0,y1))
    for region, frame in frames:
        x0,x1 = math.floor((frame[0]+146.8)/.8), math.ceil((frame[2]+146.8)/.8)
        y0,y1 = math.floor((frame[3]+124.4)/.8), math.ceil((frame[1]+124.4)/.8)
        if min(x0,y0) < 0 or max(x1,y1) > 256:
            continue
        result.update((region,x,y) for x in range(x0,x1) for y in range(y0,y1))
    return sorted(result)

def read_tiles(path):
    result = {}
    for line in path.read_text().splitlines():
        try:
            row = json.loads(line)
        except json.JSONDecodeError:
            raise SystemExit('Incomplete tile manifest; inspect before resuming: ' + str(path))
        result[row['key']] = row
    return list(result.values())

def overview_entry(area, areas, base=None):
    """Terrain frame from actual child coverage, never from parchment pixels."""
    # Only named direct landscape children. Deep descendants may be detached
    # dungeons or battle versions stored elsewhere in the same coordinate grid.
    candidates=[a for a in areas if a.get('mr')==area.get('mr') and a.get('eltern')==area['idx']
                and not a.get('unbenannt') and a.get('name','')!='Karte '+str(a['idx']) and block_range(a)]
    def touches(a,b):
        return not (a['east']+1.6<b['west'] or b['east']+1.6<a['west']
                    or a['north']+1.6<b['south'] or b['north']+1.6<a['south'])
    components=[]
    remaining=list(candidates)
    while remaining:
        group=[remaining.pop()];changed=True
        while changed:
            changed=False
            for candidate in remaining[:]:
                if any(touches(candidate,item) for item in group):
                    group.append(candidate);remaining.remove(candidate);changed=True
        components.append(group)
    def weight(group):
        return sum((a['east']-a['west'])*(a['north']-a['south']) for a in group)
    children=max(components,key=weight,default=[])
    wanted=set()
    for child in children:
        x0,y0,x1,y1=block_range(child)
        wanted.update((area['mr'],x,y) for x in range(x0,x1) for y in range(y0,y1))
    if not wanted:return None
    x0,y0=min(x for _,x,y in wanted),min(y for _,x,y in wanted)
    x1,y1=max(x for _,x,y in wanted)+1,max(y for _,x,y in wanted)+1
    # Coverage is only known after the export; without it the frame still names
    # the whole area of its children, and those blocks are exported as well.
    treffer=len(wanted & base) if base is not None else len(wanted)
    return dict(region=area['mr'],frame=[-146.8+x0*.8,-124.4+y1*.8,-146.8+x1*.8,-124.4+y0*.8],
                overview=True,derivedFrom=[a['idx'] for a in children],
                separateMaps=[a['idx'] for a in candidates if a not in children],
                tiles=treffer,total=(x1-x0)*(y1-y0))

def pyramid(raw, public, version, rows):
    levels = defaultdict(dict)
    available = [r for r in rows if r['available']]
    def convert(row):
        if (row['width'],row['height']) != (200,200):
            raise ValueError('Unexpected radar tile dimensions: ' + str(row))
        relative = f'{version}/r{row["region"]}/0/{row["y"]}_{row["x"]}.webp'
        target = public / relative
        target.parent.mkdir(parents=True,exist_ok=True)
        if not target.exists():
            with Image.open(raw / f'r{row["region"]}/{row["y"]}_{row["x"]}.png') as image:
                image.save(target,'WEBP',quality=90,method=4)
        return row['region'],row['x'],row['y']
    with ThreadPoolExecutor(max_workers=4) as pool:
        for region,x,y in pool.map(convert,available):
            levels[region].setdefault(0,set()).add((x,y))
    for region in sorted(levels):
        for level in range(1,9):
            previous = levels[region][level-1]
            parents = {(x//2,y//2) for x,y in previous}
            for x,y in sorted(parents):
                target = public / f'{version}/r{region}/{level}/{y}_{x}.webp'
                if not target.exists():
                    target.parent.mkdir(parents=True,exist_ok=True)
                    image = Image.new('RGBA',(400,400))
                    for dx in range(2):
                        for dy in range(2):
                            cx,cy=x*2+dx,y*2+dy
                            if (cx,cy) in previous:
                                with Image.open(public / f'{version}/r{region}/{level-1}/{cy}_{cx}.webp') as child:
                                    image.paste(child.convert('RGBA'),(dx*200,(1-dy)*200))
                    image.resize((200,200),Image.Resampling.LANCZOS).save(target,'WEBP',quality=90,method=4)
            levels[region][level]=parents
        print('Pyramid region',region,'base tiles',len(levels[region][0]),flush=True)
    return levels

def thumbnails(public,version,coverage,levels):
    for ident,entry in coverage.items():
        west,north,east,south=entry['frame']
        level=max(0,min(8,math.ceil(math.log2(max((east-west)*250/400,(north-south)*250/300,1)))))
        factor=2**level;size=.8*factor
        x0,x1=math.floor((west+146.8)/size),math.ceil((east+146.8)/size)
        y0,y1=math.floor((south+124.4)/size),math.ceil((north+124.4)/size)
        image=Image.new('RGBA',((x1-x0)*200,(y1-y0)*200))
        present=levels[entry['region']][level]
        for x in range(x0,x1):
            for y in range(y0,y1):
                if (x,y) in present:
                    with Image.open(public/f'{version}/r{entry["region"]}/{level}/{y}_{x}.webp') as tile:
                        image.paste(tile.convert('RGBA'),((x-x0)*200,(y1-1-y)*200))
        px=250/factor
        extent=((west-(-146.8+x0*size))*px,((-124.4+y1*size)-north)*px,
                (east-(-146.8+x0*size))*px,((-124.4+y1*size)-south)*px)
        scale=min(400/(east-west),300/(north-south))
        width=max(1,round((east-west)*scale));height=max(1,round((north-south)*scale))
        crop=image.transform((width,height),Image.Transform.EXTENT,extent,Image.Resampling.BICUBIC)
        result=Image.new('RGB',(400,300),'#111610');result.paste(crop,((400-width)//2,(300-height)//2),crop.getchannel('A'))
        relative=f'{version}/thumb/{ident}.webp';target=public/relative;target.parent.mkdir(parents=True,exist_ok=True)
        result.save(target,'WEBP',quality=90,method=4)
        entry['thumbnail']=relative

def runs(points):
    """Tile positions as horizontal runs: [y, x0, x1] instead of one name each.

    The full list was 678 kB (177 kB gzipped) on every map load. Runs keep the
    same information in a few kilobytes, because a region's tiles lie in rows.
    """
    je_zeile={}
    for x,y in points:
        je_zeile.setdefault(y,[]).append(x)
    ergebnis=[]
    for y in sorted(je_zeile):
        xs=sorted(je_zeile[y]);start=vorher=xs[0]
        for x in xs[1:]:
            if x==vorher+1:
                vorher=x;continue
            ergebnis.append([y,start,vorher]);start=vorher=x
        ergebnis.append([y,start,vorher])
    return ergebnis


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--client',type=Path,default=CLIENT)
    parser.add_argument('--lib',type=Path,default=LIB)
    parser.add_argument('--cache',type=Path,default=CACHE)
    parser.add_argument('--prepare-only',action='store_true')
    parser.add_argument('--skip-export',action='store_true')
    args=parser.parse_args()
    areas=maps_read(REPO/'web/daten-de.js')
    stamps=[(p.name,p.stat().st_size,p.stat().st_mtime_ns) for p in sorted(args.client.glob('*.dat'))]
    if not stamps:raise SystemExit('No client DAT files found')
    version=hashlib.sha256(json.dumps([2,stamps]).encode()).hexdigest()[:12]
    work=args.cache/version;raw=work/'raw';raw.mkdir(parents=True,exist_ok=True)
    # Overview frames are known before the export (from their children's frames),
    # so their blocks are exported too; otherwise the region overviews showed
    # rectangular gaps that no child frame had asked for (14.11.2026).
    uebersichten={}
    for area in areas:
        if area.get('rahmen')=='unklar':
            info=overview_entry(area,areas)
            if info:uebersichten[str(area['idx'])]=info
    requests=requested(areas,[(info['region'],info['frame']) for info in uebersichten.values()]);tsv=work/'requests.tsv'
    tsv.write_text(''.join(f'{r}\t{x}\t{y}\n' for r,x,y in requests))
    print('Maps:',len(areas),'requested blocks:',len(requests),'version:',version,flush=True)
    (work/'source.json').write_text(json.dumps(dict(client=str(args.client),files=stamps,version=version),indent=2))
    if args.prepare_only:return
    if not args.skip_export:
        classes=work/'classes';classes.mkdir(exist_ok=True)
        subprocess.run(['javac','--release','8','-cp',str(args.lib/'*'),'-d',str(classes),str(REPO/'tools/ExportTerrain.java')],check=True)
        subprocess.run(['java','-Djava.awt.headless=true','-Xmx2g','-cp',str(classes)+':'+str(args.lib/'*'),'ExportTerrain',str(args.client),str(raw),str(tsv)],check=True)
    rows=read_tiles(raw/'tiles.jsonl')
    if len(rows)!=len(requests):raise SystemExit('Export not complete')
    public=args.cache/'public';public.mkdir(exist_ok=True)
    levels=pyramid(raw,public,version,rows)
    base={(r['region'],r['x'],r['y']) for r in rows if r['available']}
    coverage={};summary=[]
    for area in areas:
        bounds=block_range(area)
        if not bounds:
            info=dict(uebersichten[str(area['idx'])]) if str(area['idx']) in uebersichten else None
            if info:
                region=info['region']
                x0,x1=math.floor((info['frame'][0]+146.8)/.8),math.ceil((info['frame'][2]+146.8)/.8)
                y0,y1=math.floor((info['frame'][3]+124.4)/.8),math.ceil((info['frame'][1]+124.4)/.8)
                if min(x0,y0) < 0 or max(x1,y1) > 256:
                    info=None
                else:
                    info['tiles']=sum((region,x,y) in base for x in range(x0,x1) for y in range(y0,y1))
            if info and info['tiles']:
                coverage[str(area['idx'])]=info
                summary.append(dict(id=area['idx'],name=area['name'],available=True,**info))
            else:
                summary.append(dict(id=area['idx'],name=area['name'],available=False,reason='unusable-frame'))
            continue
        x0,y0,x1,y1=bounds
        count=sum((area['mr'],x,y) in base for x in range(x0,x1) for y in range(y0,y1))
        total=(x1-x0)*(y1-y0)
        info=dict(region=area['mr'],frame=[area[k] for k in ('west','north','east','south')],tiles=count,total=total)
        # Some game frames deliberately include undeveloped/empty terrain.
        # Do not fabricate replacement imagery for absent blocks.
        if count:coverage[str(area['idx'])]=info
        summary.append(dict(id=area['idx'],name=area['name'],available=bool(count),**info))
    thumbnails(public,version,coverage,levels)
    # Only what the browser needs: region, frame, overview and thumbnail flag.
    # Counts and derivation stay in coverage.json.
    kurz={}
    for ident,entry in coverage.items():
        kurz[ident]=[entry['region'],*entry['frame'],
                     1 if entry.get('overview') else 0,
                     1 if entry.get('thumbnail') else 0]
    manifest=dict(schema=2,version=version,tileSize=200,origin=[-146.8,-124.4],blockSize=.8,
                  resourceMaps=sorted(p.stem for p in (REPO/'web/vorkommen').glob('*.js') if p.stem.isdigit()),
                  maps=kurz,regions={str(r):{str(z):runs(points) for z,points in zs.items()} for r,zs in levels.items()})
    temporary=public/'manifest.json.part';temporary.write_text(json.dumps(manifest,separators=(',',':')))
    temporary.replace(public/'manifest.json')
    (args.cache/'coverage.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2))
    print('Available maps:',len(coverage),'/',len(areas),'public:',public,flush=True)

if __name__=='__main__':main()
