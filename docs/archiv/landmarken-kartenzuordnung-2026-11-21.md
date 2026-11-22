# Landmarks without world position: map assignment

Test record 21.11.2026. The occasion was the empty page of **Kankras Höhle**
(`70056DD7`): the catalogue listed the place without a position, although the own
client export contains four points for it.

## Finding

- Of 2.809 named landmarks, 226 had no position in the catalogue.
- For **178** of them `did-positions-2026-11-03/positions.jsonl` contains
  positions, but only on content layers (`layer` not equal to 0), not on the
  world position. The generator so far took over exclusively the world position.
- For the remaining **48** the export contains no position entry at all.
- Separately from that, 70 landmarks with world position coordinates had no map,
  because their point lies outside all map frames of the same game region.

## Cross-check with LotroCompanion

Compared with state `9b404ffacb096c9c9b354e428e671e4bc78db9e5` of
[`LotroCompanion/lotro-data`](https://github.com/LotroCompanion/lotro-data):

- `lore/landmarks.xml` and `lore/labels/de/landmarks.xml`: IDs as well as German
  and English names of all checked landmarks agree.
- `lore/parchmentMaps.xml`: The maps in question and their
  game regions are confirmed, among them Shelob's Lair (`268453438`) under
  Morgul Vale (`268453364`) in region 4.
- `lore/dungeons.xml`: Individual dungeons with the same name partly carry their own
  positions; these do not agree with the landmark points and were
  not used as a replacement.
- The Companion landmark list itself contains **no coordinates**. The
  points come from the own client export; Companion verifies name, map
  and region, not the pin.

## Adopted rule

`tools/build_landmarken.py` now also uses content layers, but only
restrainedly:

1. A world position still takes precedence and keeps its previous
   behaviour.
2. Without a world position the points of all content layers are collected
   (instance copies are dropped).
3. A map is only set when **one** map holds all points: either
   as the only shared map or as the only deepest map of all points.
   A pure continent/region overview does not count.
4. Otherwise the coordinates remain without map and without pin.

## Result

- 75 landmarks newly receive a pin; the number of landmarks with a map
  rises from 2.513 to **2.588**.
- 2.761 landmarks have a position, 48 none.
- 221 landmarks stand without a landscape in the list (previously 296).
- Existing pins do not change.

Assigned maps:

| Map | Count | Landmarks (DE) |
| --- | ---: | --- |
| Angmar (`268437615`) | 24 | Aughaire, Búth Luikh, Búth Sánkhas, Faelbenns Bollwerk, Iorelens Lager, Mittleres Bollwerk von Aughaire, Morroval-Lager, Nord-Bollwerk, Nördliches Bollwerk, Nördliches Bollwerk von Aughaire, Nördlichstes Bollwerk, Ork-Lager, Rammas Deluon, Süd-Bollwerk, Südliches Bollwerk, Südliches Bollwerk von Aughaire, Tor der Schatten, Tor der Schatten, Tor von Aughaire, Uruk-Lager, Zauberin der Feigheit[n], Zauberin der Schmerzen[n], Zauberin der Verzweiflung[n], Zauberin des Schreckens[n] |
| The Angle of Mitheithel (`268453878`) | 7 | Die Bruinenfurt, Eitheldir, Feste Waeren, Gaerond, Glynafon, Tham Lumren, Tornhad |
| Anfalas (`268454314`) | 4 | Barad Faen, Echad Lendir, Khatsûr, Lond Cirion |
| Frostbluff (`268445611`) | 4 | Eissee-Festung, Gackerland, Gackerland-Feste, Moserwald-Turm |
| Ring of Isengard (`268447023`) | 4 | Die Tiefen von Isengart, Kriegsmaschinen, Morflaks Kommando, Wachhaus |
| Ered Luin (`268437576`) | 3 | Das Rostige Tor, Gondamon, Noglond |
| Havens of Belfalas (`268450778`) | 3 | Amon Corch, Makham Hosh, Makham Jurrar |
| Isengard Depths (`268447022`) | 3 | Fâshs Kommando, Isengart (Oberfläche), Verliese |
| Hatokáli Fells (`268455152`) | 2 | Kutímus Haus, Roz Káskrauz |
| Azanulbizar, T.A. 2799 (`268453555`) | 1 | Muru Azog |
| Beacon Hills (`268451270`) | 1 | Firienwald |
| Bree (`268437716`) | 1 | Der verfallene Hof |
| Caras Galadhon (`268443779`) | 1 | Galadriels Garten |
| Cardolan (`268454004`) | 1 | Calarphel |
| Clovengap (`268453656`) | 1 | Nâtatharr |
| Grimbeorn's House (`268450898`) | 1 | Beorninghús |
| Imhûlar (`268454623`) | 1 | Gräber von Esh-kimâkhi |
| King's Gondor Belfalas (`268454241`) | 1 | Tadrent |
| Lothlórien (`268442330`) | 1 | Die Saervig |
| Lower Lebennin (King's Gondor) (`268454138`) | 1 | Orlachs Schlucht |
| Minas Tirith (`268451105`) | 1 | Die Geschlossene Tür von Fen Hollen |
| Mirkwood (`268443855`) | 1 | Die dunkle Lücke |
| Misty Mountains (`268437691`) | 1 | Hrimbarg |
| Northern Mirkwood (`268452526`) | 1 | Alte Seitentür |
| Shelob's Lair (`268453438`) | 1 | Kankras Höhle |
| The Old Forest (`268441569`) | 1 | Zornwald |
| The Shield Isles (`268454306`) | 1 | Ghar Jâdam |
| The Shire (`268437678`) | 1 | Buckelstadt |
| Urash Dâr (`268454627`) | 1 | Khûn Sagaz |
| Wildermore (`268449335`) | 1 | Drû Vádokan |

## Remained without a map

Of the 178 landmarks with content layer points, 103 remain without a pin:

- **53** lie in several equally ranked maps; none is verifiably the
  right one. Among them **Kaserne** (`7002A6EA`) and **Küche** (`7002A6ED`), whose
  points spread over **Isengard Depths** and the flooded variant.
  A landmark has only one location in the data model; a split over two
  maps would be a schema change.
- **49** have at least one point outside all map frames of their
  game region, predominantly interiors (e.g. Kammer von Mazarbul,
  Die Einundzwanzigste Halle).
- **1** has as its only shared map just the continent overview Eriador
  (**Zauberin des Zweifels[n]**, `7000FC21`). Its two points lie in
  Bree-land/Lone-Lands and in Angmar; a pin on Eriador would be without meaning.

The coordinates of these landmarks remain in the dataset, but without a map and
without a pin. A later extension could permit several verified locations per landmark;
that is not part of this state.
