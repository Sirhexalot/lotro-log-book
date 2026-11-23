/* Item search definition: what the list asks, what it shows, how it sorts.
 *
 * Data only. Predicates, facets and comparators stay in gegenstaende-filter.js;
 * the allowed filter groups stay in docs/datenraum/lotro-datenraum-entitaeten.json.
 * Labels are translation keys, not texts, so DE/EN/FR stay in texte-logbuch.js.
 */
(function () {
	'use strict';
	window.MQL_LISTEN = window.MQL_LISTEN || {};
	window.MQL_LISTEN.gegenstaende = {
		bereich: 'gegenstaende',
		entitaet: 'i',
		// Left column, top to bottom. The category tree stays first: it is the
		// way through 77.000 rows, suitability follows as the "fits me" question.
		filter: [
			{id: 'tree', labelKey: 'gs_kategorie'},
			{id: 'eignung', labelKey: 'gs_eignung'},
			{id: 'level', labelKey: 'gs_gegenstandsstufe'},
			{id: 'minLevel', labelKey: 'gs_mindeststufe'},
			{id: 'source', labelKey: 'gs_quelle'},
			{id: 'schaden', labelKey: 'gs_schaden'},
			{id: 'quality', labelKey: 'gs_qualitaet'}
		],
		// Table head and row: name with its label line, then the wear requirement.
		// The item level is strength and stays in the name cell, not in a column.
		spalten: [
			{id: 'name', labelKey: 'gs_sort_name', sortierung: 'name'},
			{id: 'mindeststufe', labelKey: 'gs_mindeststufe', sortierung: 'mindeststufe', zahl: true}
		],
		sortierung: {
			standard: 'name',
			erlaubt: ['name', 'mindeststufe'],
			richtung: 'beide',
			ersteRichtung: {name: 'asc', mindeststufe: 'asc'}
		},
		blaettern: {art: 'scroll', groesse: 50}
	};
})();
