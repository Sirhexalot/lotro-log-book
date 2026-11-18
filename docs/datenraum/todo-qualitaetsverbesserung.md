# TODO: Datenqualität anhand des LOTRO-Datenraumaudits verbessern

**Projekt:** LOTRO Log Book, ausschließlich Website  
**Stand:** 17. November 2026  
**Status:** priorisierte Arbeitsgrundlage; noch keine Codeänderung beauftragt  
**Auditgrundlage:** [`lotro-datenraum.md`](lotro-datenraum.md) und die dort
verlinkten Belege

## Ziel

Die Website soll belegte Spielinformationen korrekt und nachvollziehbar
darstellen, ohne Unterschiede durch Datenverdichtung zu verlieren oder
unbekannte Werte als sichere Spielaussagen auszugeben.

Das Audit ist ein laufender, quellengebundener Teilstand. Es ist keine
Freigabe, sämtliche Daten neu zu erzeugen oder jede ungeklärte Property
fachlich zu interpretieren.

## Prioritäten und Abnahmekriterien

### 1. Informationsverluste bei Gegenständen und Rezepten erhalten

- [ ] Für Bindung getrennte Werte für `BIND_ON_ACQUIRE` und
  `BOUND_TO_ACCOUNT_ON_ACQUIRE` vorsehen. Bestehende Seiten und kompakte
  Felder dürfen bis zur Umstellung weiterlaufen.
- [ ] Rezeptvarianten vollständig mit ihrer jeweiligen Zutaten- und
  Ergebniszuordnung abbilden.
- [ ] Ergebnisvergleich und Ausgabe berücksichtigen Item-ID, Menge und
  Ergebnisstufe.
- [ ] Regressionstests belegen, dass keine Varianten durch Gruppierung oder
  Deduplizierung verschwinden.

**Abnahme:** Testfälle umfassen die dokumentierten Fälle aus
`lotro-datenraum-semantik-pruefung.json`; gezählte Bestände ändern sich nicht
unerklärt. Bestehende IDs, URLs und bisherige Detailseiten bleiben erhalten.

### 2. Fehlend, null, ungelöst und berechnet auseinanderhalten

- [ ] Für Daten, bei denen die Herkunft bekannt ist, unterscheiden:
  expliziter Wert (einschließlich `0`), fehlender Quellwert,
  fehlgeschlagene Referenz-/Tabellenauflösung und berechneter Wert.
- [ ] Unaufgelöste Werte nicht stillschweigend als 0, false, „kostenlos“,
  „keine Voraussetzung“ oder „keine Quelle“ darstellen.
- [ ] Pro betroffenem Feld dokumentieren, ob der Unterschied bis zur
  öffentlichen Seite relevant ist; keine bedeutungslosen Leeranzeigen
  hinzufügen.

**Abnahme:** Tests prüfen sowohl den Roh-/Zwischenwert als auch die
Darstellung und stellen sicher, dass ein Lookup-Fallback nicht als
bewiesener Spielwert ausgegeben wird.

### 3. Beziehungen und Voraussetzungen nicht übervereinfachen

- [ ] Auftraggeber, Händler und Tauscher als Rollen mit belegten Zieltypen
  modellieren, nicht als Synonyme für einen einzigen NPC-Datensatz.
- [ ] Aufgaben-/Tatvoraussetzungen nur dann als Machbarkeit auswerten, wenn
  Operator, Status und UND-/ODER-Struktur erhalten und unterstützt sind.
- [ ] Unaufgelöste Referenzen mit Quellfeld, ID und geprüftem Zielraum
  protokollieren, statt sie kommentarlos zu verwerfen.
- [ ] Karten, Kartengeometrie, Gebiet, Bild, Marker und Platzierung getrennt
  halten; gemischte `parentId`-Zielräume nicht zu einem Kartenbaum zwingen.

**Abnahme:** Referenztests prüfen Quellfeld, Zieltyp und ID; Bedingungstests
prüfen verschachtelte UND-/ODER-Fälle sowie unbekannte Operatoren.
Unbekannte Semantik bleibt als unbekannt markiert.

### 4. Vorhandene Qualitätssicherung ausbauen

- [ ] Quelle → erzeugter Datenbestand → Seitenmodell als getrennte
  Prüfschritte ausweisen.
- [ ] Für neue bestätigte Regeln automatisierte Regressionen ergänzen.
- [ ] Mehrsprachigkeit über stabile IDs und Beziehungen prüfen; Übersetzungen
  nicht aus gleich großen Beständen ableiten.
- [ ] Kleine Browserabnahme nur für tatsächlich geänderte Oberflächen und in
  DE/EN/FR durchführen.

**Abnahme:** Der Prüfbericht nennt Eingangsdaten, Exportstand, ausgeführte
Tests und bekannte Grenzen. Eine erfolgreiche Teilprüfung wird nicht als
vollständige semantische Freigabe bezeichnet.

## Reihenfolge

1. Das Quell-/Zwischenmodell für Gegenstandsbindung und Rezeptvarianten
   konkretisieren.
2. Pipeline und Regressionstests ändern; erst danach betroffene Ansichten
   umstellen.
3. Unbekannt-/Null-/Lookup-Status anhand konkreter Felder ergänzen.
4. Bedingungs- und Referenzprüfung erweitern.
5. Nur bestätigte weitere Semantikbereiche einzeln übernehmen.

## Grenzen und Nicht-Ziele

- Keine Änderung an `MagicQuestLog`, Spielinstallation, Charakterdateien oder
  veröffentlichtem Bestand.
- Kein pauschaler Neubau aller Website-Daten und keine ungeprüfte
  Veröffentlichung.
- Keine Ableitung von Spielserver-Verfügbarkeit allein aus Client-DAT- oder
  Companion-Daten.
- Keine Interpretation ungeklärter Effekte, Wahrscheinlichkeiten oder
  Bedingungen als bestätigte Spielregel.
- Das technische Auditmaterial bleibt unter `docs/datenraum/`; dieses TODO
  priorisiert mögliche Folgearbeit, führt sie aber nicht selbst aus.
