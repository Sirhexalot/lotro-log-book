# 12. Glossary

| Term | Meaning in this project |
|---|---|
| **Derived relation** | Edge or aggregation computed during the build from source data; not an independent source record. |
| **Asset** | Shipped static file such as JavaScript, CSS, image or map shard. |
| **Browser state** | Locally stored selection or character data; not automatically part of the server catalogue. |
| **Build** | Upstream processing that produces source data, catalogues, indices or release artefacts. |
| **Companion import** | Local reading of supported Companion files in the browser. |
| **DAT export** | Source data obtained from LOTRO game resources outside the website request, from which catalogues are built. |
| **Detail relation** | Set of connected entries shown on an entity page with a fixed reference to the owner page. |
| **Entity** | Domain-identified catalogue entry such as quest, deed, item or area. |
| **ID** | Stable technical identifier independent of name and language. |
| **Canonical URL** | Preferred public address with language path, entity segment and stable ID. |
| **Catalogue** | Language-related inventory of entries and relationships, prepared for display and search. |
| **Web catalogue** | Localised data files under `web/` used by the browser code. |
| **PHP data (`phpdata`)** | JSON files, indices, list and page models prepared for PHP delivery. |
| **Shard** | Small JSON file that contains part of the entries; the bucket is determined for entity identifiers from `md5(ID)[:2]`. |
| **Page model** | Data prepared during the build that Twig outputs for a specific entity page. |
| **Application page** | Interactive browser surface rendered by PHP/Twig with the shared shell. |
| **Catalogue/entity page** | Server-side rendered overview or detail page for a catalogue entry. |
| **Release** | Assembled directory of program, prepared data and assets, intended for upload. |
| **Working tree** | Files of the local checkout including uncommitted changes; not necessarily identical with commit or live release. |
| **Read model** | Data format prepared for a display or delivery purpose, e.g. index or page model. |
| **Manifest** | Release description with files, components and integrity information. |
| **Relation** | Directed or typed relationship between catalogue entries; not synonymous with a mere text reference or map position. |
| **Status unknown** | No sufficient import information for „erledigt“, „offen“ or „gelernt“; not equal to zero or "no". |
| **Twig** | Server-side template system that renders PHP contexts into HTML. |
