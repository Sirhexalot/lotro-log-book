# LOTRO Log Book – Architekturdokumentation nach arc42

[Zur Dokumentationsübersicht](../README.md) · [Offizielle arc42-Übersicht](https://arc42.de/overview/)

- **Dokumentationsstand:** 20.11.2026
- **Geltungsbereich:** Repository `lotro-log-book` einschließlich Website, Datenaufbereitung, Tests und Release-Werkzeugen.
- **Leitlinie:** Diese Dokumentation beschreibt den im Code und in der Laufzeit belegbaren Stand. Bei Widersprüchen ist die Dokumentation zu korrigieren; sie begründet keine Änderung am Verhalten. Eine gewünschte Verhaltensänderung braucht einen eigenen Auftrag.

## Quellenstatus und Abgrenzung

Die Aussagen unten wurden gegen die genannten Dateien im Checkout geprüft. Das Repository enthält zum Dokumentationszeitpunkt zahlreiche nicht eingecheckte Änderungen. Diese Dokumentation beschreibt daher den **vorliegenden Arbeitsbaum**, nicht automatisch den letzten Commit oder die Live-Version. Bei betrieblichen Fragen sind Release-Build und Live-Verhalten zusätzlich zu prüfen.

Vorhandene README- und `docs/`-Dateien dienen als Fundstellen und Kontext, nicht als Beleg dafür, dass ein Verhalten noch gilt. Alte Zahlen und datierte Prüfstände werden nicht als aktuelle Systemwerte übernommen. Wo der Codepfad noch nicht vollständig nachvollzogen wurde, steht das ausdrücklich dabei.

Das separate Repository `MagicQuestLog` und Werkzeuge aus `Companion-Test` sind externe Daten- bzw. Build-Abhängigkeiten. Sie gehören nicht zum Änderungsumfang dieses Repositories. Ihr tatsächlicher Einfluss wird dort benannt, wo der Website-Code sie aufruft oder erzeugte Dateien von ihnen einliest.

---

## Kapitel

1. [Einführung und Ziele](01-einfuehrung-und-ziele.md)
2. [Randbedingungen](02-randbedingungen.md)
3. [Kontextabgrenzung](03-kontext-und-abgrenzung.md)
4. [Lösungsstrategie](04-loesungsstrategie.md)
5. [Bausteinsicht](05-bausteinsicht.md)
6. [Laufzeitsicht](06-laufzeitsicht.md)
7. [Verteilungssicht](07-verteilungssicht.md)
8. [Querschnittliche Konzepte](08-querschnittliche-konzepte.md)
9. [Architekturentscheidungen](09-architekturentscheidungen.md)
10. [Qualitätsanforderungen und Prüfungen](10-qualitaetsanforderungen.md)
11. [Risiken und technische Schulden](11-risiken-und-technische-schulden.md)
12. [Glossar](12-glossar.md)

---

## Pflegehinweis

Änderungen an dieser Dokumentation sollen sich auf nachprüfbare Implementierung stützen. Bei jeder Änderung sind die jeweils genannten Quelldateien erneut zu prüfen. Wenn Code und diese Dokumentation auseinanderlaufen, ist zuerst der Widerspruch festzuhalten; die Dokumentation wird an den bestätigten Code angepasst. Anforderungen oder gewünschte Architekturänderungen werden nicht allein aus einer veralteten Dokumentationsaussage abgeleitet.
