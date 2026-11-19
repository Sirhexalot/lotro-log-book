# Entitätenvertrag: UI-Abgleich zum Bearbeiten

- **Status:** offen; dieser Audit beschreibt Soll und Ist, noch keine Produktänderung
- **Verbindliche Regeln:** [`AGENTS.md`](../../AGENTS.md), Abschnitt „Navigation, Karte und Darstellung“, und [`lotro-datenraum-entitaeten.json`](../datenraum/lotro-datenraum-entitaeten.json)
- **Ist-Übersicht:** [`arc42`, Abschnitt 5.9](../arc42/README.md#L280)
- **Arbeitsgrenze:** Code und JSON-Vertrag bleiben unverändert, bis die Umsetzung beauftragt ist.

## So ist die Liste zu bearbeiten

Jeder Eintrag ist nach **Entität** und darunter nach konkretem **UI-Auftritt** sortiert. „Auftritt“ meint genau die sichtbare Ausprägung: etwa Trefferzeile im Finder, Detailseiten-Relation oder Liste auf einer Karte. Die Dateilinks führen möglichst direkt zum verantwortlichen Template/Modul. Pro Auftritt sind festzulegen:

1. welche Felder genau sichtbar sein dürfen;
2. welche davon nur Filter-/Suchwerte oder Zähler sind;
3. welche Filter, Sortierung und Pagination die UI bietet;
4. wie fehlende Daten und nicht verlinkbare Ziele behandelt werden;
5. welcher Test genau diese UI-Ausprägung absichert.

Abweichungen, die bereits im Code bestätigt sind, stehen mit **KORRIGIEREN**. Noch nicht vollständig gegen jede Ausprägung geprüfte Stellen stehen mit **ABGLEICHEN** – sie sind keine behaupteten Fehler.

## Gemeinsame Vorgaben für alle Ausprägungen

- [ ] Die Katalogidentität bleibt eine stabile ID; Namen sind Anzeige-/Suchtext, kein Ersatzschlüssel.
- [ ] Ein Relationseintrag bleibt im Elternkontext. Reset darf nicht die Elternrelation entfernen.
- [ ] Bis 5 Einträge direkt, ab 6 die vorgesehene Filterkomponente – **außer** die konkrete Liste ist im Vertrag ausdrücklich `direct`.
- [ ] Fehlender Status bleibt unbekannt/neutral, niemals automatisch „erledigt“, „offen“, „verfügbar“ oder 0 %.
- [ ] Kein Link aus einem mehrdeutigen Namen erraten. Nicht auflösbare Einträge erhalten die im jeweiligen Vertrag bestimmte Text-/Auslassungsdarstellung.
- [ ] Sichtbare Listenzeile und Detailinhalt getrennt halten; ein Vertragseintrag muss je Oberfläche gelten, nicht pauschal für alle Auftrittsorte.
- [ ] `component` muss die genaue Komponente nennen. `direct` bedeutet: direkte Fachliste auch bei mehr als fünf Elementen.

## Aufgabe (`q`)

Vertrag: [`q` im Entitätenvertrag](../datenraum/lotro-datenraum-entitaeten.json#L14)

| UI-Auftritt | Code/Element | Ist laut Code | Soll/Änderung |
|---|---|---|---|
| Öffentlicher Aufgabenindex | [`entity/list.twig`](../../php/templates/entity/list.twig#L14), Indexmodell in `tools/build_php_data.py` | Alphabetische, crawlbare Linkliste; Name und optional Symbol. Kein Finder mit Aufgabenfacetten. | [ ] Als eigene Ausprägung „Katalogindex“ im Vertrag führen; nicht mit Aufgabenfinder-Zeile gleichsetzen. Sichtbare Felder und Seitenumfang konkret festhalten. |
| Aufgabenfinder – Treffer | [`app/aufgabenfinder.twig`](../../php/templates/app/aufgabenfinder.twig#L1), [`aufgabenfinder.js`](../../web/aufgabenfinder.js#L1), [`aufgaben-filter.js`](../../web/aufgaben-filter.js#L257) | Name, Symbol, Typ-/Merkmals-/Stufen-/Gebietsmeta und Fortschrittssteuerung. Filter: Thema, Klasse, Herkunft, Region/Gebiet, Merkmale, Stufe, Status; dynamische Gruppen entfallen, wenn sie keine Auswahl unterscheiden. Name/Stufe sortierbar; initial 30, dann weitere. | [ ] Zeilenfeldliste auf genau diese Ausprägung beziehen. Entscheiden, ob `flags` in der Ergebniszeile zulässige Einordnung sind: sie werden gerendert, stehen aber nicht in `q.zeilenfelder`. Filtergruppen, dynamische Auslassung, Sortierung und 30er-Limit im Vertrag nennen. |
| Karte – Aufgabenliste | [`app.js`](../../web/app.js#L1), [`karten-aufgabenfilter.js`](../../web/karten-aufgabenfilter.js#L1) | Aufgabenzeilen im Kartenkontext mit Status, kompakter Metazeile und Auswahlverhalten; Daten stufenweise nachgeladen. | [ ] Kartenzeile getrennt vom Finder dokumentieren: erlaubte Felder, Statusdarstellung, Filter-/Sortierung, Nachladen und fehlender Ort. |
| Aufgabendetail | [`entity/quest.twig`](../../php/templates/entity/quest.twig#L6), [`php_viewmodel.py`](../../tools/php_viewmodel.py#L250) | Name, optionale Chips/Beschreibung, belegter Ort, Auftraggeber-/Voraussetzungs-/Belohnungsbereiche, eingeklappte Ziele. `required_by` wird als `related_quests` aufgelöst. | [ ] `required_by`, Belohnungen und Zusammenhang jeweils als getrennten Auftritt abnehmen. „Belohnungen“ sind direkte Rewarddarstellung, nicht die Relationsfilterkomponente. |
| Aufgaben als Quellen-/Relationsliste | [`RelatedLists.php`](../../php/src/RelatedLists.php#L16), [`entitaeten-listen.js`](../../web/entitaeten-listen.js#L31) | Gemeinsamer Aufgabenadapter; Zeilenrenderer kann Typ, Stufe, Merkmale, Region/Gebiet und Status ausgeben. | [ ] Merkmalsmeta mit der Entscheidung zur Finder-Zeile synchronisieren. 5/6-Grenze, Kontext-Reset und Quellen ohne gültige URL testen. |

## Tat (`d`)

Vertrag: [`d` im Entitätenvertrag](../datenraum/lotro-datenraum-entitaeten.json#L67)

| UI-Auftritt | Code/Element | Ist laut Code | Soll/Änderung |
|---|---|---|---|
| Öffentlicher Tatenindex | [`entity/list.twig`](../../php/templates/entity/list.twig#L8), [`taten-index.js`](../../web/taten-index.js#L1) | Crawlbare alphabetische Serverliste bleibt im HTML verborgen; sichtbar ist der clientseitige Filter. Filtertreffer enthalten Symbol, Name, Tatart, Stufe, Gebiet, Merkmale und Status. Anfang 50, „Weitere anzeigen“. | [ ] Index-Ausprägung getrennt vom Detailkontext beschreiben; konkrete Ergebnisfelder/Filter-/Sortierregeln im Vertrag festhalten. Merkmalsmeta ist ebenso wie bei Aufgaben nicht in `d.zeilenfelder` benannt. |
| Karte – Tatenmodus | [`app.js`](../../web/app.js#L1), [`karten-aufgabenfilter.js`](../../web/karten-aufgabenfilter.js#L1) | Kartenliste mit Tatart und belegtem Status; gemeinsame Gebiets-/Landschaftsnavigation mit Aufgaben. | [ ] Taten-Kartenzeile, Filtergruppen und Ladeverhalten als eigene Ausprägung festhalten. |
| Tatdetail | [`entity/deed.twig`](../../php/templates/entity/deed.twig#L6), [`php_viewmodel.py`](../../tools/php_viewmodel.py#L450) | Art-Chips, Beschreibung, Kartenaktion/Ort, Fakten, feste und wählbare Belohnungen, eingeklappte Ziele; Zusammenhangsliste. | [ ] „Zusammenhang“ einzeln spezifizieren: welche Datensätze hineinkommen, wie Kontext fixiert wird, welche Spalten die Zeile hat. |
| Taten als Relations-/Quellenzeile | [`RelatedLists.php`](../../php/src/RelatedLists.php#L24), [`entitaeten-listen.js`](../../web/entitaeten-listen.js#L173) | Gemeinsamer Aufgaben-/Tatenfilter mit Ergebnisfeldern inkl. Merkmale. | [ ] Entscheidung zu `flags` wie bei `q`; Schwellwert 5/6 und Linkauflösung absichern. |

## Gegenstand (`i`)

Vertrag: [`i` im Entitätenvertrag](../datenraum/lotro-datenraum-entitaeten.json#L106)

| UI-Auftritt | Code/Element | Ist laut Code | Soll/Änderung |
|---|---|---|---|
| Gegenstandssuche – Treffer | [`gegenstandssuche.twig`](../../php/templates/app/gegenstandssuche.twig#L1), [`gegenstaende-filter.js`](../../web/gegenstaende-filter.js#L5) | Symbol, Name, Kategorie, Seltenheit, Kategorie-Unterwerte wie Art/Platz/Klasse/Gattung und positiver Gegenstandsstufenwert. Filter: dynamischer Kategorienbaum, Seltenheit, Stufenbereich; Name/Stufe sortierbar; 50 plus weitere. | [ ] Der Vertrag nennt nur `symbol/name/seltenheit/stufe/art`; genau klären, welche Unterwerte als `art` zählen und welche sichtbare Meta zusätzlich erlaubt ist. Suche und Filterwerte nicht als sichtbare Zeilenfelder missverstehen. |
| Öffentlicher Itemkatalog | [`entity/list.twig`](../../php/templates/entity/list.twig#L14) | Schlichte alphabetische Linkliste, optional Symbol; Verweis auf Gegenstandssuche. | [ ] Als eigene Ausprägung dokumentieren; keine Gleichsetzung mit dem reicheren Treffer der Gegenstandssuche. |
| Itemdetail – Beschreibung/Werte | [`entity/item.twig`](../../php/templates/entity/item.twig#L4) | Kopf, Qualitäts-/Artchips, Beschreibung, Werte/Stats, Set-/Variantenblock, sofern vorhanden. | [ ] Abgrenzung zur Listenzeile prüfen; fehlende Werte/Setdaten bleiben ausgeblendet. |
| Itemdetail – „Woher“ Aufgaben/Taten | [`entity/item.twig`](../../php/templates/entity/item.twig#L23), [`item-task-filter.js`](../../web/item-task-filter.js#L7) | Template wechselt ab 6 in einen Filtercontainer. JS mountet erst bei mehr als 10; bei 6–10 bleibt der Fallback stehen. | **KORRIGIEREN:** gemeinsame Grenze bei 5 halten. Testfälle 5, 6, 10, 11 für beide Quelltypen `q`/`d`; Filterstatus mit und ohne Import. |
| Itemdetail – „Wofür“ (als Zutat verwendet) | [`entity/item.twig`](../../php/templates/entity/item.twig#L30) | Bis 5 direkte Rezeptlinks. Ab 6 lokale Suche plus Rollenwahl normal/optional; keine gemeinsame Filter-UI, Sortierauswahl oder Pagination. | **KORRIGIEREN:** Vertrag `used_in=component` mit der vorgesehenen gemeinsamen Rezeptlistenkomponente erfüllen. Rollenfilter erhalten, wenn im Adapter möglich. Ergebnisfelder, Sortierung, Pagination, URL-Präfix und Reset wie Rezeptliste testen. |
| Itemdetail – „Herstellung“ | [`php_viewmodel.py`](../../tools/php_viewmodel.py#L1097), [`entity/item.twig`](../../php/templates/entity/item.twig#L24), [`entitaeten-listen.js`](../../web/entitaeten-listen.js#L237) | Eigene Relation `recipe_made`; ab 6 gemeinsamer Rezeptfilter, getrennt von `used_in`. | [ ] Prüfen, dass die getrennte Richtung, normaler/kritischer Erfolg und Rollenangabe in Zeile/Filter erhalten bleiben. |
| Itemdetail – Händler/Tauschquellen | [`php_viewmodel.py`](../../tools/php_viewmodel.py#L1112), [`entity/item.twig`](../../php/templates/entity/item.twig#L24), [`entitaeten-listen.js`](../../web/entitaeten-listen.js#L78) | Händler und Tauschquellen als getrennte Gruppen; Händler ab 6 gemeinsame Ort/Typ-/Suche-Komponente, Tausch mit eigenem Adapter ohne Ortsfacetten. Tauschzeilen können unlinked bleiben. | [ ] Vertrag `where_vendors` und `where_plain` auf diese exakten Gruppen abbilden; klären, ob `where_plain` auch Sammelressourcen umfasst. Textfallback und fehlende IDs testen. |
| Itemdetail – Sammelressourcen, Varianten, Set | [`php_viewmodel.py`](../../tools/php_viewmodel.py#L1083), [`entity/item.twig`](../../php/templates/entity/item.twig#L4) | Varianten und Set sind getrennte Blöcke; Sammelressourcen enthalten Art/ Beruf/Stufe und Fundgebiete mit Karte-Links. | [ ] Diese sichtbaren Beziehungen fehlen als eigene, eindeutig benannte Auftritte im Vertrag. Entscheiden, ob eigener Relationstyp oder separater Datenraum; je Gruppe Zeile, Filter und Ortsfallback festlegen. |
| Händlerdetail – Itemangebot | [`vendors/detail.twig`](../../php/templates/vendors/detail.twig#L15), [`gegenstaende-filter.js`](../../web/gegenstaende-filter.js#L5) | Bis 5 direkte Itemzeilen; ab 6 Gegenstandssuche-Adapter mit Such-/Kategoriefiltern, Sortierung und Seitenfenster. | [ ] Als Item-Ausprägung im Händlerkontext dokumentieren; testen, dass Händler-ID als fester Kontext erhalten bleibt. |
| Setdetail – Itemteile | [`sets/detail.twig`](../../php/templates/sets/detail.twig#L6) | Setteilkarten mit Itemname, ggf. Symbol, Chips, erforderlicher Klasse, Rüstung, Werten/Boni; fehlende Itemseite bleibt unlinked und nach Namen gruppiert. | [ ] Nicht als schlichte Item-Listenzeile behandeln. Sichtbare Setdetailfelder als eigene Karte spezifizieren. |
| Aufgaben-/Tatbelohnung | [`entity/quest.twig`](../../php/templates/entity/quest.twig#L11), [`entity/deed.twig`](../../php/templates/entity/deed.twig#L13), [`entity/reward.twig`](../../php/templates/entity/reward.twig#L1) | Belohnungsart, Name, Menge soweit größer als 1, Symbol; Link nur bei aufgelöstem Ziel. | [ ] Feste/wählbare Belohnung als eigene Ausgabeform sichern; keine Verfügbarkeit aus Belohnungsangabe ableiten. |

## Rezept (`recipe`)

Vertrag: [`recipe` im Entitätenvertrag](../datenraum/lotro-datenraum-entitaeten.json#L171)

| UI-Auftritt | Code/Element | Ist laut Code | Soll/Änderung |
|---|---|---|---|
| Handwerk – Rezepttreffer | [`app/handwerk.twig`](../../php/templates/app/handwerk.twig#L1), [`handwerk-filter.js`](../../web/handwerk-filter.js#L132), [`rezepte.js`](../../web/rezepte.js#L1) | Tabellenzeile mit Rezeptname, Beruf/Stufe/Kategorie und Lernstand nach Tabellen-/Gruppenkontext; Name führt zum Detail. Filter Beruf, Tier/Stufe, Kategorie, Lernstand; ggf. eigene Berufe; Sortierung Name/Tier/Gegenstandsstufe; 50 plus weitere. | [ ] Zeilenfelder und Filter je Handwerks-Reiter konkret spezifizieren. Lernstand nur bei ausreichendem Importbeleg; fehlend bleibt unbekannt. |
| Itemdetail – `used_in` und `recipe_made` | Siehe [`entity/item.twig`](../../php/templates/entity/item.twig#L30) und [`entitaeten-listen.js`](../../web/entitaeten-listen.js#L180) | Zwei Richtungen; `recipe_made` nutzt gemeinsame Komponente, `used_in` derzeit lokale Suche/Rollenwahl. | **KORRIGIEREN:** gemeinsamer Adapter muss in beiden Richtungen dieselbe Rezeptzeilen-/Sortier-/Paginationregel verwenden; Richtung als fester Kontext erhalten. |
| Rezeptdetail – Zutaten | [`entity/recipe.twig`](../../php/templates/entity/recipe.twig#L5) | Zutaten und optionale Zutaten als direkte Listen mit Menge, ggf. Symbol/Chance; Itemlink nur bei vorhandener Zielseite. | [ ] Vertrag führt `ingredients` ausdrücklich als `direct`: so beibehalten. Herkunftsschalter nur bei belegter Antwort; Menge/Rolle/Chance gehören hierher, nicht in Rezepttrefferzeile. |
| Rezeptdetail – Ergebnis/Beruf | [`entity/recipe.twig`](../../php/templates/entity/recipe.twig#L5), [`entity/profession.twig`](../../php/templates/entity/profession.twig#L5) | Beruf, Tier, Kategorie, ggf. Gegenstandsstufe, kritisches Ergebnis und Rezeptparameter. | [ ] Ergebnislink nur bei aufgelöster Item-ID; fehlende kritische ID als Text. Beruf führt in die Handwerksanwendung, nicht auf eine Beruf-Detailseite. |

## Beruf (`p`)

Vertrag: [`p`/Beruf im Entitätenvertrag](../datenraum/lotro-datenraum-entitaeten.json)

| UI-Auftritt | Code/Element | Ist laut Code | Soll/Änderung |
|---|---|---|---|
| Handwerk – Berufsreiter | [`app/handwerk.twig`](../../php/templates/app/handwerk.twig#L1), [`handwerk-filter.js`](../../web/handwerk-filter.js#L132) | Berufsname und je nach lokalem Spielstand bekannte Stufen-/XP-Zeilen. Filter Beruf und „eigene“ nur mit Charakter; Sortierung Name, 50 plus weitere. | [ ] Konkrete Zeilenfelder und persönliche Statusgrundlage je Reiter im Vertrag ausweisen. Ohne Import keine Fortschrittswerte anzeigen. |
| Rezeptdetail – Beruflink | [`entity/recipe.twig`](../../php/templates/entity/recipe.twig#L6) | Berufsname verlinkt in Handwerk/Rezepte, keine Berufdetailseite. | [ ] Im Vertrag ausdrücklich als Navigationslink statt Beruf-Detailentität führen; alte Beruf-URL nicht als Listenauftritt dokumentieren. |

## Set (`set`)

Vertrag: [`set` im Entitätenvertrag](../datenraum/lotro-datenraum-entitaeten.json#L211)

| UI-Auftritt | Code/Element | Ist laut Code | Soll/Änderung |
|---|---|---|---|
| Setbrowser – Treffer | [`sets/list.twig`](../../php/templates/sets/list.twig#L17), [`Sets.php`](../../php/src/Sets.php#L154) | Mehrere Itemicons, Setname, Teilezahl, aggregierte Klasse/Rüstungsart. Filter: Suche Set-/Itemnamen, Klasse, Ausrüstungsart, Rüstung, Charakterstufe von/bis. Alle Bedingungen müssen am selben verfügbaren Teil erfüllt sein. Name/ID sortiert; 30 pro Seite. | **ABGLEICHEN:** Vertrag erlaubt `symbol/name/stufe`, nennt aber Teilezahl und Klassen-/Rüstungsmeta nicht. Entscheiden, ob die Metadaten als zulässige Einordnung ergänzt werden oder aus der Zeile verschwinden. |
| Setdetail – Setteile | [`sets/detail.twig`](../../php/templates/sets/detail.twig#L3), [`set_viewmodel.py`](../../tools/set_viewmodel.py#L8) | Karten mit Name, Symbol, Chips, Klasse/Rüstung/Werten/Boni; fehlende Itemseiten bleiben Text, identische ungelöste Namen werden gezählt gruppiert. | [ ] `members=direct` ist ausdrücklich; keine Filterumschaltung erzwingen. Kartenfelder und gruppierte Fallbackzeile einzeln im Vertrag als Detaildarstellung beschreiben. |
| Setdetail – Boni | [`sets/detail.twig`](../../php/templates/sets/detail.twig#L22) | Schwelle und vorhandene Bonuszeilen, unklare/fehlende Daten gemäß Datenmodell. | [ ] Nicht in Trefferzeilen ziehen; nur belegte Schwellen/Wirkungen anzeigen. |
| Itemdetail – Setzugehörigkeit | [`entity/item.twig`](../../php/templates/entity/item.twig#L4), [`php_viewmodel.py`](../../tools/php_viewmodel.py#L1137) | Setkopf, Teile und Boni als Itemdetailblock, falls eine Set-ID auflösbar ist. | [ ] Als eigene Item-Detailausprägung aufführen; Setlink nur mit auflösbarer Setseite. |

## Auftraggeber (`giver`)

Vertrag: [`giver` im Entitätenvertrag](../datenraum/lotro-datenraum-entitaeten.json#L242)

| UI-Auftritt | Code/Element | Ist laut Code | Soll/Änderung |
|---|---|---|---|
| Auftraggeberbrowser – Treffer | [`givers/list.twig`](../../php/templates/givers/list.twig#L38), [`Givers.php`](../../php/src/Givers.php#L276) | Name plus Meta: Art, Titel, bis zu drei Orte, Stufenspanne, Aufgabenanzahl; 30 pro Seite. Suche, Region/Landschaftsbaum, Art, Stufenbereich, Merkmale; Name/Stufe sortierbar. | **ABGLEICHEN:** Vertragszeile nennt Symbol/Name/Art/Gebiet/Stufe, Code zeigt Titel und Aufgabenanzahl, aber kein Symbol. Festlegen, welche Felder erlaubt sind, dann beidseitig angleichen. |
| Auftraggeberdetail – Standort | [`givers/detail.twig`](../../php/templates/givers/detail.twig#L19) | Belegte Karten/Pins, Koordinaten, Gebietsweg und Routenlink. Fehlende Bild-/Ortsdaten werden weggelassen. | [ ] Standortkarte als Detailblock getrennt von Treffer-Meta spezifizieren; keine Koordinate oder Karte ergänzen, wenn nicht vorhanden. |
| Auftraggeberdetail – Aufgaben | [`givers/detail.twig`](../../php/templates/givers/detail.twig#L32), [`Givers.php`](../../php/src/Givers.php#L379) | Alle zugeordneten Aufgaben als Name, Stufe, Gebiet und Chips; clientseitige Suche, Fortschrittsanzeige, „Erledigte ausblenden“. | [ ] Status/Importgrenzen, Suchumfang, Sortierung und fehlende Quest-IDs im Vertrag konkretisieren. Relation ist im Detailkontext fix. |
| Aufgabenseite – Auftraggeberlink | [`entity/quest.twig`](../../php/templates/entity/quest.twig#L10), [`php_viewmodel.py`](../../tools/php_viewmodel.py#L250) | Einzelner aufgelöster Auftraggeberlink; mehrere Quellzuordnungen bleiben im Datenmodell erhalten. | [ ] Vertrag soll kenntlich machen, dass Detailseite nicht notwendigerweise alle Auftraggeber als Liste zeigt. |

## Händler (`vendor`)

Vertrag: [`vendor` im Entitätenvertrag](../datenraum/lotro-datenraum-entitaeten.json#L275)

| UI-Auftritt | Code/Element | Ist laut Code | Soll/Änderung |
|---|---|---|---|
| Händlerbrowser – Treffer | [`vendors/list.twig`](../../php/templates/vendors/list.twig#L36), [`Vendors.php`](../../php/src/Vendors.php#L1) | Name plus Meta aus Art, Orten und Warenanzahl; Filter Suche, Region/Landschaft, Typ und Stufenbereich laut Browser; Name/ID, 30 je Seite. | [ ] Vertragsfelder `symbol/name/art/gebiet/anzahl` mit konkreter Ausgabe vergleichen; keine unsichtbaren Felder als sichtbare Zeile deklarieren. |
| Händlerdetail – Standorte | [`vendors/detail.twig`](../../php/templates/vendors/detail.twig#L8) | Pro Platz Karte/Pin, Ortsweg, Koordinaten und Karten-/Routenaktion, nur wenn verfügbar. | [ ] Detailausprägung dokumentieren; Regionstext ohne passenden Bildrahmen darf nicht zum erfundenen Pin werden. |
| Händlerdetail – Waren | [`vendors/detail.twig`](../../php/templates/vendors/detail.twig#L15), [`gegenstaende-filter.js`](../../web/gegenstaende-filter.js#L5) | Bis 5 einfache Itemzeilen; ab 6 Gegenstandsfilter, Sortierung Name/Stufe und 50 plus weitere. | [ ] Vertragsrelation `items=component` mit derselben Itemzeile/Filtersemantik wie Gegenstandssuche vergleichen; Händler bleibt fester Kontext. |
| Itemdetail – Händlerquelle | [`entity/item.twig`](../../php/templates/entity/item.twig#L24), [`entitaeten-listen.js`](../../web/entitaeten-listen.js#L78) | Händlername mit Link; ab 6 Suche, Ort und Händlertyp in gemeinsamer Komponente. | [ ] Vertrag `where_vendors` auf diese konkrete Variante beziehen; unbekannte Händler-ID nicht als URL ausgeben. |

## Titel (`title`)

Vertrag: [`title` im Entitätenvertrag](../datenraum/lotro-datenraum-entitaeten.json#L306)

| UI-Auftritt | Code/Element | Ist laut Code | Soll/Änderung |
|---|---|---|---|
| Titelbrowser – Treffer | [`titles/list.twig`](../../php/templates/titles/list.twig#L44), [`Titles.php`](../../php/src/Titles.php#L187) | Titelname plus Meta aus Quelle/Herkunft und abgeleiteten Orten/Quellenzahl; Suche, Aufgabe/Tat-Herkunft, Tatart, Region/Landschaft; Name/ID, 30 pro Seite. | [ ] Vertragsfelder `name/quelle` und Filter `geografie/art/herkunft` pro Browserausprägung definieren; Meta und Quellenzahl konkret erlauben oder entfernen. |
| Titeldetail – Quellen | [`entity/title.twig`](../../php/templates/entity/title.twig#L5), [`entitaeten-listen.js`](../../web/entitaeten-listen.js#L31) | Quellenname plus optionaler Zusatz; Link bei gültiger URL, sonst Text. Große Gruppen können nach Aufgaben/Taten getrennt gefiltert werden. | [ ] Testen: gemischte Quelltypen, gültige/fehlende Links, 5/6-Grenze, Zusatztext, Kontext-Reset. |
| Belohnungsbrowser | [`app/belohnungen.twig`](../../php/templates/app/belohnungen.twig#L1), [`belohnungen.js`](../../web/belohnungen.js#L1) | Aktueller Browser führt Gegenstände, nicht Titel; Titelrewarddaten dienen anderen Katalog-/Suchprozessen. | [ ] Im Vertrag festhalten, dass Rewarddaten nicht gleich öffentliche Titel-Trefferliste sind. |

## Tugend (`virtue`)

Vertrag: [`virtue` im Entitätenvertrag](../datenraum/lotro-datenraum-entitaeten.json#L335)

| UI-Auftritt | Code/Element | Ist laut Code | Soll/Änderung |
|---|---|---|---|
| Tugenddetail – Quellen | [`entity/virtue.twig`](../../php/templates/entity/virtue.twig#L5), [`entitaeten-listen.js`](../../web/entitaeten-listen.js#L31) | Tugendname und Quellenzeilen mit optionalem Zusatz; gültige URL wird Link, andernfalls Klartext. Große Quelllisten nutzen Aufgaben-/Tatenfilter, soweit Relationsmodell vorhanden ist. | [ ] Quelle, Zusatz und Linkfallback je Quelltyp festlegen; 5/6-Grenze und Renderfallback testen. |
| Aufgabe/Tat – Tugendbelohnung | [`entity/reward.twig`](../../php/templates/entity/reward.twig#L1), [`entity/quest.twig`](../../php/templates/entity/quest.twig#L11) | Tugend kann als Belohnungsangabe erscheinen; eigener Link nur bei auflösbarer Zielseite. | [ ] Belohnungsdarstellung von Tugend-Quellenliste trennen. |
| Ruf-/Belohnungsanwendung | [`app/belohnungen.twig`](../../php/templates/app/belohnungen.twig#L1), [`belohnungen.js`](../../web/belohnungen.js#L1) | Belohnungsbrowser filtert aktuell Gegenstände; Tugenden sind keine Treffer in diesem Browser. | [ ] Vertrag soll diesen Nicht-Auftritt explizit vom Detail-/Rewarddatenraum abgrenzen. |

## Fraktion (`f`)

Vertrag: [`f` im Entitätenvertrag](../datenraum/lotro-datenraum-entitaeten.json#L362)

| UI-Auftritt | Code/Element | Ist laut Code | Soll/Änderung |
|---|---|---|---|
| Fraktionsbrowser – Treffer | [`factions/list.twig`](../../php/templates/factions/list.twig#L37), [`Factions.php`](../../php/src/Factions.php#L167) | Name plus aus Rufquellen abgeleitete Orte; Suche, Region/Landschaft und „mit Rufquellen“; Name/ID, 30 pro Seite. | [ ] Vertrag `symbol/name/gebiet` mit echter Zeile vergleichen; im Template ist kein Symbol sichtbar. Filter „Quellen“ ist boolesch, keine Quelltyp-Facette. |
| Fraktionsdetail – Rang und Quellen | [`entity/fraktion.twig`](../../php/templates/entity/fraktion.twig#L7), [`entitaeten-listen.js`](../../web/entitaeten-listen.js#L31) | Beschreibung, Rangstufen, getrennte Aufgaben-/Tatenquellgruppen mit Stufe/Stärke/Ort-Zusatz; eigener Ruf bleibt Charakterzustand. | [ ] Je Quelltyp Felder, Filteradapter, Schwelle und Fallback prüfen; Rangliste ist direkte Detaildarstellung. |
| Rufanwendung – Charakterstand | [`app/ruf.twig`](../../php/templates/app/ruf.twig#L1), [`ruf.js`](../../web/ruf.js#L1) | Lokaler importierter Ruf; unbekannte Punkte als „–“, Stufenfortschritt nur auf belegten Daten. | [ ] Nicht mit statischer Fraktionsliste/Detailseite vermischen; Vertragsgrenze zwischen Katalog und Charakterdaten benennen. |

## Landmarke (`l`)

Vertrag: [`l` im Entitätenvertrag](../datenraum/lotro-datenraum-entitaeten.json#L392)

| UI-Auftritt | Code/Element | Ist laut Code | Soll/Änderung |
|---|---|---|---|
| Landmarkenbrowser – Treffer | [`landmarks/list.twig`](../../php/templates/landmarks/list.twig#L37), [`Landmarks.php`](../../php/src/Landmarks.php#L1) | Name plus Gebiet/Region und Aufgabenanzahl; Filter Suche, Region/Landschaft, „mit Aufgaben“; Name/ID, 30 pro Seite. | [ ] Vertragsfelder `name/gebiet/aufgaben` passen grundsätzlich; je Feld sichtbar vs Filter/Zähler markieren. „Ohne Landschaft“ separat dokumentieren. |
| Landmarkendetail – Ort | [`entity/landmarke.twig`](../../php/templates/entity/landmarke.twig#L5) | Karte/Pin, Koordinaten, Karten-/Regionslink und Kartenaktion nur bei vorhandener Position. | [ ] Fehlt Position: Ortsblock/Pin entfällt; das als Pflicht-Fallback testen. |
| Landmarkendetail – Aufgaben | [`entity/landmarke.twig`](../../php/templates/entity/landmarke.twig#L13), [`entitaeten-listen.js`](../../web/entitaeten-listen.js#L31) | Zugeordnete Aufgabenlinks; große Liste kann gemeinsamen Aufgabenfilter einsetzen. | [ ] `targets` nicht als exakten Abschlussort ausgeben; Linkauflösung und Schwelle 5/6 absichern. |

## Gebiet (`area`)

Vertrag: [`area` im Entitätenvertrag](../datenraum/lotro-datenraum-entitaeten.json#L421)

| UI-Auftritt | Code/Element | Ist laut Code | Soll/Änderung |
|---|---|---|---|
| Gebietsdetail – Geografie | [`entity/area.twig`](../../php/templates/entity/area.twig#L7) | Gebietsname/-karte, Kartenapp-Aktion, Elternregion und direkte Untergebiete. | [ ] Kinderliste separat von Entitäts-Relationsliste erfassen; nur existierende Karten-/Gebietslinks. |
| Gebietsdetail – Inhaltstabs | [`entity/area.twig`](../../php/templates/entity/area.twig#L14), [`RelatedLists.php`](../../php/src/RelatedLists.php#L33), [`entitaeten-listen.js`](../../web/entitaeten-listen.js#L31) | Tabs Aufgabe → Tat → Gegenstand mit Anzahlen; bis 5 direkte Links, ab 6 typabhängige gemeinsame Filterkomponente. Elterngebiet bleibt Kontext. | [ ] Pro Tab exakte Zeilenfelder, tatsächlich aktive Filtergruppen, Sortierung und Seitenfenster dokumentieren. Prüfen, ob Gegenstände nach abgeleiteten Quellenorten klar markiert sind. |
| Karte/Abenteuer – Gebiet | [`abenteuer.twig`](../../php/templates/app/abenteuer.twig#L1), [`abenteuer.js`](../../web/abenteuer.js#L1), [`abenteuer-logik.js`](../../web/abenteuer-logik.js#L1) | Gebiet als Karteneintrag/-punkt oder regionale Gebietsliste mit persönlichem Fortschritt/Stufenpassung, falls Datenbasis vorhanden. | [ ] Diese Ausprägung getrennt von der PHP-Gebietsdetailseite spezifizieren; fehlende Position/Importwerte bleiben leer statt geschätzt. |

## Region (`region`)

Vertrag: [`region` im Entitätenvertrag](../datenraum/lotro-datenraum-entitaeten.json#L452)

| UI-Auftritt | Code/Element | Ist laut Code | Soll/Änderung |
|---|---|---|---|
| Regionsdetail – Untergebiete | [`entity/area.twig`](../../php/templates/entity/area.twig#L7) (Template für Gebiet und Region) | Name/Karte, Eltern-/Kindkontext und direkte Untergebiete soweit vorhanden. | [ ] Prüfen, welche Felder für Regionen tatsächlich erzeugt werden und im selben Template bedingt entfallen; nicht pauschal Gebietsfelder übernehmen. |
| Regionsdetail – aggregierter Inhalt | [`entity/area.twig`](../../php/templates/entity/area.twig#L14), [`RelatedLists.php`](../../php/src/RelatedLists.php#L33) | Aufgaben/Taten/Gegenstände aus Regionsmitgliedern, getrennte Tabs und je Typ eigener Adapter. | [ ] Aggregationsregel und Region als unveränderlichen Filterkontext ausdrücklich festhalten; Gebiet und Region nicht als direkte `fk`-Kante verwechseln. |
| Abenteuer – Region | [`abenteuer.twig`](../../php/templates/app/abenteuer.twig#L1), [`abenteuer.js`](../../web/abenteuer.js#L1) | Region als Kartenübersicht mit Gebietsmarken; Fortschrittsring nur mit Import, Punkt nur bei belegter Kartenverknüpfung. | [ ] Als eigene App-Ausprägung führen; keine allgemeine Filterbrowserregel auf Kartenpunkte übertragen. |

## Instanz (Finder-Ausprägung, keine Katalog-Detailentität)

Code: [`instances/list.twig`](../../php/templates/instances/list.twig#L1), [`Instances.php`](../../php/src/Instances.php#L90)

| UI-Auftritt | Ist laut Code | Soll/Änderung |
|---|---|---|
| Instanzfinder – Ergebniszeile | Name, Gruppe/Cluster und belegte Metadaten; keine Instanz-Detailseite und kein automatischer Aufgabenlink. Suche, Cluster, Art, Stufenbereich, Gruppengröße, Schwierigkeit; gruppierte Ausgabe, 200 je Seite. | [ ] Als eigenständige Browserentität im Vertrag führen oder ausdrücklich außerhalb des 13-Entitätenkatalogs markieren. Sichtbare Metadaten und Fälle ohne Stufe/Gruppe je Feld prüfen. |

## Abweichungen mit bestätigtem Korrekturbedarf

- [ ] **Item-Aufgaben-/Tatquellen:** Schwelle 6/11 vereinheitlichen (Item, EAV-01).
- [ ] **Item „Wofür“:** gemeinsame Rezeptkomponente statt lokalem Such-/Rollenfilter ohne Sortierung/Pagination (Item/Rezept, EAV-02).
- [ ] **Aufgaben-/Tatenzeile:** `flags` in Finder-/Relationstreffer konkret vertraglich erlauben oder aus der sichtbaren Zeile entfernen (Aufgabe/Tat, EAV-03).
- [ ] **Setbrowserzeile:** Teilezahl sowie Klassen-/Rüstungsmeta gegen erlaubte Vertragsfelder entscheiden (Set, EAV-04).
- [ ] **Auftraggeberbrowserzeile:** Titel/Aufgabenanzahl und fehlendes Symbol mit Vertragsfeldern abgleichen (Auftraggeber, EAV-05).

## Querschnittliche Prüflücken

- [ ] `tests/test_entitaeten_vertrag.py` prüft aktuell Entitätsmenge, Sprachsegmente, erlaubte Relationstypen, Listenstatusvokabular und einige verbotene Zeileninhalte. Es prüft nicht, ob jede konkrete UI-Ausprägung exakt ihre Vertragsfelder rendert.
- [ ] Pro Tabellenzeile oben einen Test festlegen: DOM-Felder, Linkziele/Fallback, Filterzustand, Sortierung/Pagination und 5/6-Grenze.
- [ ] Für Filterzustand je Oberfläche URL, gespeichertes Filtergedächtnis, Reset, Zurück/Vor, Tabs und festen Elternkontext prüfen.
- [ ] Mit und ohne Charakterimport testen; Charakterdaten bleiben lokal und dürfen nicht als Server-/Katalogrelation behandelt werden.
- [ ] DE/EN/FR, Desktop/Mobil sowie JavaScript- und Serverfallback für jede geänderte Ausprägung abnehmen.
- [ ] Nach Umsetzung die Ist-Matrix in arc42 und den Entitätenvertrag synchronisieren; erst dann diese Checkliste schließen.

## Nicht als Abweichung werten

- `recipe.ingredients` und `set.members` tragen im Vertrag ausdrücklich den Status `direct`. Ihre direkte Detaildarstellung auch bei mehr als fünf Elementen ist daher kein Schwellenfehler.
- Ein Eintrag ohne auflösbare Ziel-ID darf als nicht verlinkter Text erscheinen, wenn genau dieser Fallback im Vertrag für die Ausprägung festgelegt ist.
- Eine öffentliche Indexliste darf weniger Felder als ein Finder zeigen. Dafür müssen Index und Finder im Vertrag als unterschiedliche UI-Auftritte modelliert sein.
