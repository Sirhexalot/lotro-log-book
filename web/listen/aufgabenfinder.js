/* Quest finder definition: the order of the left column, sorting, paging.
 *
 * Data only. Predicates, facets, labels and the row live in
 * karten-aufgabenfilter.js.
 */
(function () {
	'use strict';
	window.MQL_LISTEN = window.MQL_LISTEN || {};
	window.MQL_LISTEN.aufgabenfinder = {
		bereich: 'aufgabenfinder',
		entitaet: 'q',
		filter: ['status', 'level', 'geography', 'topic', 'class', 'origin', 'flag'],
		spalten: ['name', 'level', 'progress'],
		sortierung: {standard: 'name', erlaubt: ['name', 'level'], ersteRichtung: {name: 'asc', level: 'asc'}},
		blaettern: {art: 'scroll', groesse: 50}
	};
})();
