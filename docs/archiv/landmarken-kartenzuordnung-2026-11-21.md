# Landmarken ohne Weltlage: Kartenzuordnung

Prüfstand 21.11.2026. Anlass war die leere Seite von **Kankras Höhle**
(`70056DD7`): Der Katalog führte den Ort ohne Position, obwohl der eigene
Client-Export vier Punkte dafür enthält.

## Befund

- Von 2.809 benannten Landmarken hatten 226 keine Position im Katalog.
- Für **178** davon enthält `did-positions-2026-11-03/positions.jsonl`
  Positionen, aber nur auf Inhalts-Ebenen (`layer` ungleich 0), nicht auf der
  Weltlage. Der Generator übernahm bisher ausschließlich die Weltlage.
- Für die übrigen **48** enthält der Export gar keinen Positionseintrag.
- Getrennt davon hatten 70 Landmarken mit Weltlage-Koordinaten keine Karte,
  weil ihr Punkt außerhalb aller Kartenrahmen derselben Spielregion liegt.

## Gegenprüfung mit LotroCompanion

Verglichen mit dem Stand `9b404ffacb096c9c9b354e428e671e4bc78db9e5` von
[`LotroCompanion/lotro-data`](https://github.com/LotroCompanion/lotro-data):

- `lore/landmarks.xml` und `lore/labels/de/landmarks.xml`: IDs sowie deutsche
  und englische Namen aller geprüften Landmarken stimmen überein.
- `lore/parchmentMaps.xml`: Die in Frage kommenden Karten und ihre
  Spielregionen sind bestätigt, darunter Shelob's Lair (`268453438`) unter
  Morgul Vale (`268453364`) in Region 4.
- `lore/dungeons.xml`: Einzelne namensgleiche Dungeons tragen teils eigene
  Positionen; diese stimmen nicht mit den Landmarkenpunkten überein und wurden
  nicht als Ersatz verwendet.
- Die Companion-Landmarkenliste enthält selbst **keine Koordinaten**. Die
  Punkte stammen aus dem eigenen Client-Export; Companion belegt Name, Karte
  und Region, nicht den Pin.

## Übernommene Regel

`tools/build_landmarken.py` nutzt jetzt auch Inhalts-Ebenen, aber nur
zurückhaltend:

1. Eine Weltlage-Position hat weiterhin Vorrang und behält ihr bisheriges
   Verhalten.
2. Ohne Weltlage-Position werden die Punkte aller Inhalts-Ebenen gesammelt
   (Instanzkopien entfallen).
3. Eine Karte wird nur gesetzt, wenn **eine** Karte alle Punkte hält: entweder
   als einzige gemeinsame Karte oder als einzige tiefste Karte aller Punkte.
   Eine reine Kontinent-/Regionsübersicht zählt nicht.
4. Sonst bleiben die Koordinaten ohne Karte und ohne Pin erhalten.

## Ergebnis

- 75 Landmarken erhalten neu einen Pin; die Zahl der Landmarken mit Karte
  steigt von 2.513 auf **2.588**.
- 2.761 Landmarken haben eine Position, 48 keine.
- 221 Landmarken stehen ohne Landschaft in der Liste (vorher 296).
- Bestehende Pins ändern sich nicht.

Zugeordnete Karten:

| Karte | Zahl | Landmarken (DE) |
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

## Ohne Karte geblieben

Von den 178 Landmarken mit Inhalts-Ebenen-Punkten bleiben 103 ohne Pin:

- **53** liegen in mehreren gleichrangigen Karten; keine ist belegbar die
  richtige. Darunter **Kaserne** (`7002A6EA`) und **Küche** (`7002A6ED`), deren
  Punkte sich auf **Isengard Depths** und die überflutete Variante verteilen.
  Eine Landmarke hat im Datenmodell nur einen Ort; eine Aufteilung auf zwei
  Karten wäre eine Schemaänderung.
- **49** haben mindestens einen Punkt außerhalb aller Kartenrahmen ihrer
  Spielregion, überwiegend Innenräume (z. B. Kammer von Mazarbul,
  Die Einundzwanzigste Halle).
- **1** hat als einzige gemeinsame Karte nur die Kontinentübersicht Eriador
  (**Zauberin des Zweifels[n]**, `7000FC21`). Ihre beiden Punkte liegen in
  Bree-land/Lone-Lands und in Angmar; ein Pin auf Eriador wäre ohne Aussage.

Die Koordinaten dieser Landmarken bleiben im Datensatz, aber ohne Karte und
ohne Pin. Eine spätere Erweiterung könnte je Landmarke mehrere belegte Orte
zulassen; das ist nicht Teil dieses Stands.
