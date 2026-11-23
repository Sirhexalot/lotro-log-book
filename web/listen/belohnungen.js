/* Reward list definition: source questions first, then the item questions.
 *
 * Data only. Predicates, facets and comparators stay in belohnungen.js; the
 * allowed filter groups stay in docs/datenraum/lotro-datenraum-entitaeten.json.
 */
(function () {
	'use strict';
	window.MQL_LISTEN = window.MQL_LISTEN || {};
	window.MQL_LISTEN.belohnungen = {
		bereich: 'belohnungen',
		entitaet: 'i',
		filter: [
			{id: 'art', labelKey: 'bl_tatart'},
			{id: 'geo', labelKey: 'bl_region_gebiet'},
			{id: 'quality', labelKey: 'gs_qualitaet'},
			{id: 'eignung', labelKey: 'gs_eignung'}
		],
		// One column: the reward is an item, its level stays in the name cell.
		spalten: [
			{id: 'name', labelKey: 'gs_sort_name', sortierung: 'name'}
		],
		sortierung: {
			standard: 'name',
			erlaubt: ['name'],
			richtung: 'auf',
			ersteRichtung: {name: 'asc'}
		},
		blaettern: {art: 'scroll', groesse: 50}
	};
})();
