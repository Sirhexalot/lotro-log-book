# Landblock place resolution beyond vendors

Completed: 23.11.2026.

`tools/zonen.py` resolves the client's landblock area and dungeon by region,
block coordinates and cell. `build_auftraggeber.py` and
`tools/build_landmarken.py` now carry those fields into the place data and use
the shared resolver. Place names and region/territory chains are localised in
DE/EN/FR. A room picture and pin are included only if the client's own
basemap frame contains the recorded coordinates.

Map-less interior coordinates are not world coordinates: quest givers and
landmarks therefore have no map or travel action there. Places with landscape
maps retain their map-derived hierarchy. The shared
`tools/hole_innenkarten.py` exporter now finds room pictures used by vendors,
quest givers and landmarks.

Current generated counts: quest givers have 5,654 positions, of which 1,184
map-less positions have a name and 920 have a room picture; landmarks have
2,761 positioned objects, of which 249 map-less objects have a name and 104
have a room picture. These counts describe this local data build, not a
permanent client-data guarantee.
