/* Quest and deed list definition: group order, columns, sorting, paging.
 *
 * Data only. Predicates, facets and comparators stay in aufgaben-filter.js; the
 * labels stay in its language table. The allowed filter groups are named in
 * docs/datenraum/lotro-datenraum-entitaeten.json.
 */
(function () {
	'use strict';
	window.MQL_LISTEN = window.MQL_LISTEN || {};
	window.MQL_LISTEN.aufgaben = {
		bereich: 'aufgaben',
		entitaet: 'q',
		quests: {
			// Completion, level, place, then what only a quest can answer.
			filter: ['status', 'level', 'geography', 'flag'],
			spalten: ['name', 'level', 'progress'],
			sortierung: {standard: 'name', erlaubt: ['name', 'level'], ersteRichtung: {name: 'asc', level: 'asc'}},
			blaettern: {art: 'scroll', groesse: 50}
		},
		deeds: {
			filter: ['status', 'level', 'geography', 'type', 'reward'],
			spalten: ['name', 'level', 'progress'],
			sortierung: {standard: 'name', erlaubt: ['name', 'level'], ersteRichtung: {name: 'asc', level: 'asc'}},
			blaettern: {art: 'scroll', groesse: 50}
		}
	};
})();
