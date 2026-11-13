import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('gelaende_builder',ROOT/'tools/build_gelaende.py')
builder=importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)

class TerrainBuildTests(unittest.TestCase):
    def area(self,**changes):
        row=dict(idx=1,mr=1,rahmen='spiel',bounds=True,west=-54.633327,east=-47.80666,north=-28.08,south=-33.2,eltern=None)
        row.update(changes)
        return row

    def test_bree_is_exactly_63_blocks(self):
        self.assertEqual(builder.block_range(self.area()),(115,114,124,121))
        self.assertEqual(len(builder.requested([self.area()])),63)

    def test_duplicates_do_not_double_export(self):
        self.assertEqual(len(builder.requested([self.area(),self.area(idx=2)])),63)

    def test_region_identity_is_preserved(self):
        rows=builder.requested([self.area(),self.area(idx=2,mr=2)])
        self.assertEqual(len(rows),126)

    def test_unsafe_frames_are_rejected(self):
        for changes in [dict(rahmen='unklar'),dict(bounds=False),dict(west=float('nan')),dict(east=-60),dict(west=-150),dict(mr=0)]:
            self.assertIsNone(builder.block_range(self.area(**changes)))

    def test_overview_only_uses_same_region_descendants(self):
        overview=self.area(idx=10,rahmen='unklar')
        child=self.area(idx=11,eltern=10)
        alien=self.area(idx=12,eltern=10,mr=2)
        unrelated=self.area(idx=13)
        result=builder.overview_entry(overview,[overview,child,alien,unrelated],{(1,118,117),(2,118,117)})
        self.assertTrue(result['overview'])
        self.assertEqual(result['derivedFrom'],[11])
        self.assertEqual(result['tiles'],1)

    def test_pyramid_keeps_north_up_and_missing_quadrants_transparent(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);raw=root/'raw';(raw/'r1').mkdir(parents=True)
            rows=[]
            for x,y,color in [(0,1,'red'),(0,0,'blue')]:
                Image.new('RGB',(200,200),color).save(raw/f'r1/{y}_{x}.png')
                rows.append(dict(region=1,x=x,y=y,width=200,height=200,available=True))
            levels=builder.pyramid(raw,root/'public','abcdef123456',rows)
            self.assertEqual(levels[1][1],{(0,0)})
            image=Image.open(root/'public/abcdef123456/r1/1/0_0.webp').convert('RGBA')
            self.assertGreater(image.getpixel((25,25))[0],200)
            self.assertGreater(image.getpixel((25,175))[2],200)
            self.assertEqual(image.getpixel((175,100))[3],0)

    def test_detached_and_deep_maps_do_not_expand_regional_overview(self):
        overview=self.area(idx=10,rahmen='unklar')
        main=self.area(idx=11,eltern=10)
        detached=self.area(idx=12,eltern=10,west=-140,east=-139,north=50,south=49)
        dungeon=self.area(idx=13,eltern=11,west=-130,east=-129,north=40,south=39)
        result=builder.overview_entry(overview,[overview,main,detached,dungeon],{(1,118,117),(1,9,217)})
        self.assertEqual(result['derivedFrom'],[11])
        self.assertEqual(result['separateMaps'],[12])

if __name__=='__main__':unittest.main()
