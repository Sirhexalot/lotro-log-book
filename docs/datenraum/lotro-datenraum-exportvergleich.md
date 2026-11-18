# Verdichtete Exporte: Properties, ID-Referenzen und Datenverluste

Geprüft werden die gespeicherten historischen Exporte gegen die aktive lokale Companion-Lore. Unterschiede beweisen ohne gemeinsamen Quellzeitpunkt keinen Spiel-/Decoderfehler. Alle offenen Werte und Feldabweichungen stehen vollständig in `lotro-datenraum-exportvergleich.json`.

## Vollständige Struktur der geprüften kompakten Bestände

## items

| Propertypfad (`<id>` = dynamischer Schlüssel) | Typen/Vorkommen |
| --- | --- |
| `$.items.<id>` | dict: 152088 |
| `$.items.<id>.ar` | int: 152088 |
| `$.items.<id>.at` | str: 152088 |
| `$.items.<id>.b` | int: 152088 |
| `$.items.<id>.c` | str: 152088 |
| `$.items.<id>.d` | dict: 62499 |
| `$.items.<id>.d.de` | str: 62499 |
| `$.items.<id>.d.en` | str: 62499 |
| `$.items.<id>.d.fr` | str: 62499 |
| `$.items.<id>.dmg` | float: 22918, int: 129170 |
| `$.items.<id>.dps` | float: 22918, int: 129170 |
| `$.items.<id>.dt` | str: 152088 |
| `$.items.<id>.es` | int: 8633 |
| `$.items.<id>.ic` | int: 152088 |
| `$.items.<id>.l` | int: 152088 |
| `$.items.<id>.m` | list: 152088 |
| `$.items.<id>.m[]` | list: 183918 |
| `$.items.<id>.m[][]` | int: 367836 |
| `$.items.<id>.ml` | int: 149602, null: 2486 |
| `$.items.<id>.n` | dict: 152088 |
| `$.items.<id>.n.de` | str: 152088 |
| `$.items.<id>.n.en` | str: 152088 |
| `$.items.<id>.n.fr` | str: 152088 |
| `$.items.<id>.q` | null: 2823, str: 149265 |
| `$.items.<id>.rc` | str: 31345 |
| `$.items.<id>.rp` | str: 6630 |
| `$.items.<id>.s` | str: 152088 |
| `$.items.<id>.set` | str: 11159 |
| `$.items.<id>.sm` | int: 29743 |
| `$.items.<id>.spd` | float: 152088 |
| `$.items.<id>.sx` | int: 8808 |
| `$.items.<id>.u` | int: 152088 |
| `$.items.<id>.wt` | str: 152088 |
| `$.items.<id>.x` | int: 152088 |
| `$.items.<id>.xl` | int: 15112 |
| `$.manifest` | dict: 1 |
| `$.manifest.created_utc` | str: 1 |
| `$.manifest.inventory` | str: 1 |
| `$.manifest.item_ids` | int: 1 |
| `$.manifest.languages` | list: 1 |
| `$.manifest.languages[]` | str: 3 |
| `$.manifest.lore` | str: 1 |
| `$.manifest.written` | int: 1 |
| `$.sets.<id>` | dict: 2223 |
| `$.sets.<id>.b` | list: 2223 |
| `$.sets.<id>.b[]` | list: 4371 |
| `$.sets.<id>.b[][]` | int: 4371, list: 4371 |
| `$.sets.<id>.b[][][]` | list: 1742 |
| `$.sets.<id>.b[][][][]` | str: 3484 |
| `$.sets.<id>.i` | list: 2223 |
| `$.sets.<id>.i[]` | str: 11159 |
| `$.sets.<id>.l` | int: 2123, null: 100 |
| `$.sets.<id>.n` | dict: 2223 |
| `$.sets.<id>.n.de` | str: 2223 |
| `$.sets.<id>.n.en` | str: 2223 |
| `$.sets.<id>.n.fr` | str: 2223 |
| `$.sets.<id>.x` | int: 2160, null: 63 |
| `$.stats.de.<id>` | list: 5301 |
| `$.stats.de.<id>[]` | bool: 5301, str: 5301 |
| `$.stats.en.<id>` | list: 5342 |
| `$.stats.en.<id>[]` | bool: 5342, str: 5342 |
| `$.stats.fr.<id>` | list: 5301 |
| `$.stats.fr.<id>[]` | bool: 5301, str: 5301 |

## rewards

| Propertypfad (`<id>` = dynamischer Schlüssel) | Typen/Vorkommen |
| --- | --- |
| `$.emotes.<id>` | dict: 18 |
| `$.emotes.<id>.n` | dict: 18 |
| `$.emotes.<id>.n.de` | str: 18 |
| `$.emotes.<id>.n.en` | str: 18 |
| `$.emotes.<id>.n.fr` | str: 18 |
| `$.items.<id>` | dict: 6901 |
| `$.items.<id>.b` | int: 6177 |
| `$.items.<id>.l` | int: 6901 |
| `$.items.<id>.n` | dict: 6901 |
| `$.items.<id>.n.de` | str: 6901 |
| `$.items.<id>.n.en` | str: 6901 |
| `$.items.<id>.n.fr` | str: 6901 |
| `$.items.<id>.q` | int: 6893 |
| `$.manifest` | dict: 1 |
| `$.manifest.backend` | str: 1 |
| `$.manifest.created_utc` | str: 1 |
| `$.manifest.emotes` | int: 1 |
| `$.manifest.export` | str: 1 |
| `$.manifest.items` | int: 1 |
| `$.manifest.languages` | list: 1 |
| `$.manifest.languages[]` | str: 3 |
| `$.manifest.reward_tables` | int: 1 |
| `$.manifest.schema` | int: 1 |
| `$.manifest.source_archives` | list: 1 |
| `$.manifest.source_archives[]` | dict: 26 |
| `$.manifest.source_archives[].file` | str: 26 |
| `$.manifest.source_archives[].size` | int: 26 |
| `$.manifest.titles` | int: 1 |
| `$.manifest.traits` | int: 1 |
| `$.manifest.virtue_names_source` | str: 1 |
| `$.manifest.virtues` | int: 1 |
| `$.tables.<id>` | dict: 8081 |
| `$.tables.<id>.choice` | list: 1660 |
| `$.tables.<id>.choice[]` | list: 5631 |
| `$.tables.<id>.choice[][]` | int: 5631, str: 5631 |
| `$.tables.<id>.emotes` | list: 15 |
| `$.tables.<id>.emotes[]` | int: 20 |
| `$.tables.<id>.fixed` | list: 6039 |
| `$.tables.<id>.fixed[]` | list: 9498 |
| `$.tables.<id>.fixed[][]` | int: 9498, str: 9498 |
| `$.tables.<id>.titles` | list: 2524 |
| `$.tables.<id>.titles[]` | str: 2551 |
| `$.tables.<id>.traits` | list: 258 |
| `$.tables.<id>.traits[]` | str: 252 |
| `$.tables.<id>.virtues` | list: 565 |
| `$.tables.<id>.virtues[]` | list: 704 |
| `$.tables.<id>.virtues[][]` | int: 1408 |
| `$.titles.<id>` | dict: 2545 |
| `$.titles.<id>.n` | dict: 2545 |
| `$.titles.<id>.n.de` | str: 2545 |
| `$.titles.<id>.n.en` | str: 2545 |
| `$.titles.<id>.n.fr` | str: 2545 |
| `$.traits.<id>` | dict: 204 |
| `$.traits.<id>.n` | dict: 204 |
| `$.traits.<id>.n.de` | str: 204 |
| `$.traits.<id>.n.en` | str: 204 |
| `$.traits.<id>.n.fr` | str: 204 |
| `$.virtues.<id>` | dict: 20 |
| `$.virtues.<id>.n` | dict: 20 |
| `$.virtues.<id>.n.de` | str: 20 |
| `$.virtues.<id>.n.en` | str: 20 |
| `$.virtues.<id>.n.fr` | str: 20 |

## recipes

| Propertypfad (`<id>` = dynamischer Schlüssel) | Typen/Vorkommen |
| --- | --- |
| `$.categories.<id>` | dict: 513 |
| `$.categories.<id>.de` | str: 513 |
| `$.categories.<id>.en` | str: 513 |
| `$.categories.<id>.fr` | str: 513 |
| `$.items.<id>` | dict: 9198 |
| `$.items.<id>.b` | int: 485 |
| `$.items.<id>.l` | int: 9041 |
| `$.items.<id>.n` | dict: 9198 |
| `$.items.<id>.n.de` | str: 9198 |
| `$.items.<id>.n.en` | str: 9198 |
| `$.items.<id>.n.fr` | str: 9198 |
| `$.items.<id>.q` | int: 9041 |
| `$.manifest` | dict: 1 |
| `$.manifest.backend` | str: 1 |
| `$.manifest.created_utc` | str: 1 |
| `$.manifest.export` | str: 1 |
| `$.manifest.items` | int: 1 |
| `$.manifest.label_source` | str: 1 |
| `$.manifest.languages` | list: 1 |
| `$.manifest.languages[]` | str: 3 |
| `$.manifest.recipes` | int: 1 |
| `$.manifest.schema` | int: 1 |
| `$.professions.<id>` | dict: 17 |
| `$.professions.<id>.de` | str: 17 |
| `$.professions.<id>.en` | str: 17 |
| `$.professions.<id>.fr` | str: 17 |
| `$.recipes` | list: 1 |
| `$.recipes[]` | dict: 7924 |
| `$.recipes[].c` | int: 7924 |
| `$.recipes[].ch` | float: 4557 |
| `$.recipes[].cr` | list: 4557 |
| `$.recipes[].cr[]` | int: 4557, str: 4557 |
| `$.recipes[].i` | list: 7924 |
| `$.recipes[].i[]` | list: 20810 |
| `$.recipes[].i[][]` | int: 20810, str: 20810 |
| `$.recipes[].id` | str: 7924 |
| `$.recipes[].o` | list: 4102 |
| `$.recipes[].o[]` | list: 8197 |
| `$.recipes[].o[][]` | float: 8197, int: 8197, str: 8197 |
| `$.recipes[].p` | str: 7924 |
| `$.recipes[].r` | list: 7924 |
| `$.recipes[].r[]` | int: 7924, str: 7924 |
| `$.recipes[].t` | int: 7815 |
| `$.recipes[].ti` | float: 7924 |
| `$.tiers.<id>` | dict: 17 |
| `$.tiers.<id>.de` | str: 17 |
| `$.tiers.<id>.en` | str: 17 |
| `$.tiers.<id>.fr` | str: 17 |

## recipe-sources

| Propertypfad (`<id>` = dynamischer Schlüssel) | Typen/Vorkommen |
| --- | --- |
| `$.created_utc` | str: 1 |
| `$.recipes_with_source` | int: 1 |
| `$.sources.<id>` | list: 4230 |
| `$.sources.<id>[]` | dict: 23701 |
| `$.sources.<id>[].art` | str: 23701 |
| `$.sources.<id>[].gebiet` | str: 23701 |
| `$.sources.<id>[].id` | str: 23701 |
| `$.sources.<id>[].name` | str: 23701 |
| `$.sources.<id>[].titel` | str: 23701 |

## ID-Prüfungen

| Beziehung | Vorkommen | Aufgelöst | Offen | Eindeutig offen |
| --- | --- | --- | --- | --- |
| Itemexport-ID → Companion-Item | 152088 | 152088 | 0 | 0 |
| Companion-Item → Itemexport-ID (Abdeckung) | 152100 | 152088 | 12 | 12 |
| Setexport-ID → Companion-Set | 2223 | 2223 | 0 | 0 |
| Itemexport.set → Setexport-ID | 11159 | 11159 | 0 | 0 |
| Setexport.i[] → Itemexport-ID | 11159 | 11159 | 0 | 0 |
| Rezeptexport.id → Companion-Rezept | 7924 | 7924 | 0 | 0 |
| Rezeptexport.p → exportierter Beruf | 7924 | 7924 | 0 | 0 |
| Rezeptexport.t → exportierte Stufe | 7815 | 7815 | 0 | 0 |
| Rezeptexport.c → exportierte Kategorie | 7924 | 7924 | 0 | 0 |
| Rezept.r → Rezept-Itembestand | 7924 | 7924 | 0 | 0 |
| Rezept.r → vollständiger Itemexport | 7924 | 7924 | 0 | 0 |
| Rezept.cr → Rezept-Itembestand | 4557 | 4557 | 0 | 0 |
| Rezept.cr → vollständiger Itemexport | 4557 | 4557 | 0 | 0 |
| Rezept.i → Rezept-Itembestand | 20810 | 20810 | 0 | 0 |
| Rezept.i → vollständiger Itemexport | 20810 | 20810 | 0 | 0 |
| Rezept.o → Rezept-Itembestand | 8197 | 8197 | 0 | 0 |
| Rezept.o → vollständiger Itemexport | 8197 | 8197 | 0 | 0 |
| Belohnung.fixed → exportierter items-Bestand | 9498 | 9498 | 0 | 0 |
| Belohnung.choice → exportierter items-Bestand | 5631 | 5631 | 0 | 0 |
| Belohnung.titles → exportierter titles-Bestand | 2551 | 2551 | 0 | 0 |
| Belohnung.traits → exportierter traits-Bestand | 252 | 252 | 0 | 0 |
| Belohnung.virtues → exportierter virtues-Bestand | 704 | 660 | 44 | 44 |
| Belohnung.emotes → exportierter emotes-Bestand | 20 | 20 | 0 | 0 |
| Rezeptquellen-Schlüssel → exportierte Rezept-ID | 4230 | 4224 | 6 | 6 |

## Feldvergleich Gegenstandsexport ↔ Companion

Verglichen werden ausschließlich auf beiden Seiten tatsächlich vorhandene Felder. Nicht verglichene Werte gelten nicht als identisch. Die Mindeststufe wird wegen der dokumentierten Fallbacklogik nicht als direktes Gleichheitsfeld behandelt.

| Kompaktfeld | Companion-Attribut | Verglichen | Identisch | Abweichend |
| --- | --- | --- | --- | --- |
| q | quality | 149265 | 149265 | 0 |
| l | level | 149591 | 149591 | 0 |
| c | category | 152088 | 152088 | 0 |
| s | slot | 90792 | 90792 | 0 |
| at | armourType | 41194 | 41194 | 0 |
| wt | weaponType | 22918 | 22918 | 0 |
| dt | damageType | 22918 | 22918 | 0 |
| rc | requiredClass | 31345 | 31345 | 0 |
| rp | requiredProfession | 6630 | 6630 | 0 |

## Set-Mitgliedschaft

0 Gegenstands-IDs sind im Companion-Bestand mehreren Sets zugeordnet. Die kompakte Itemstruktur besitzt nur einen skalaren `set`-Wert; sie kann diese Relation nicht verlustfrei abbilden. Die Set-Mitgliederlisten sind die maßgebliche vollständige Gegenrichtung im geprüften Datenstand. 0 ausgegebene Item-Set-Zuordnungen widersprechen der Mitgliedsliste.

## Klassifikation der offenen Referenzen

- Alle 12 im Itemexport fehlenden Companion-IDs haben im geprüften Companion-Stand einen leeren Namen (12 tatsächlich geprüft). Das allein beweist nicht die genaue Ursache ihres Fehlens im historischen DAT-Export.
- 44 verschiedene Referenzen aus `tables[].virtues` fehlen im kompakten Tugendkatalog. Ihre tatsächlichen Stats-Labels stehen vollständig im JSON. Kein Join über gleichnamige Tugenden und keine stillschweigende Interpretation dieser Stats als reguläre Tugendobjekte.
- 6 Rezeptquellen-Schlüssel fehlen im Rezeptexport; 1 davon existieren im Companion-Rezeptbestand. Damit sind getrennte Exportfilter/-zeitstände zu prüfen, nicht automatisch die Quellreferenzen zu löschen.

## Aufgaben/Taten → verdichtete Belohnungstabellen

Der Exporter filtert Tabellen ohne für ihn nutzbare Belohnungsarten. Fehlender Tabellenschlüssel im kompakten Export beweist deshalb keine kaputte DAT-Referenz.

| Quelle | Tabellenverweise | Kompakt auflösbar | Nicht enthalten |
| --- | --- | --- | --- |
| quests.json | 14252 | 10440 | 3812 |
| deeds.json | 5534 | 4452 | 1082 |

## Nachgewiesene Code-Transformationen (nicht mit Rohdaten verwechseln)

- `export_rewards.py:export`: feste/wählbare Titel werden in derselben Liste zusammengeführt; dasselbe gilt für Emotes. Ohne Rohtabellen ist die ursprüngliche Auswahlrolle nicht rekonstruierbar.
- `export_items.py:main`: Item-IDs stammen aus `items.xml`, nicht aus einer vollständigen Neubestimmung aller Item-Klassen. Set-Zuordnung überschreibt bei Mehrfachmitgliedschaft den vorigen skalaren Wert.
- `export_items.py:compact`: Bindung 0/1/2, Mindeststufen-Fallbacks, 0-/Leerstring-Defaults sowie Kurvenberechnung sind Transformationen.
- `export_recipes.py:export`: Rezept ohne aufgelöstes Ergebnis oder ohne aufgelöste Zutaten wird verworfen; fehlende Mengen können zu 1 werden.

## Reproduktion

`python3 lotro_datenraum_exportvergleich.py`. Kein Clientzugriff und keine Schreiboperation außerhalb des Planordners. SHA-256 sämtlicher hier verwendeter Eingaben im JSON-Beleg.
