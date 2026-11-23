/* Crafting definition: the order of the filter groups, columns, sorting, paging.
 *
 * Data only. Predicates, facets, labels and the rows stay in
 * handwerk-filter.js. The professions entry mirrors the retired tab; the
 * visible page starts at recipes, and the personal profession overview is not
 * a filter list.
 */
(function () {
	'use strict';
	window.MQL_LISTEN = window.MQL_LISTEN || {};
	window.MQL_LISTEN.handwerk = {
		rezepte: {
			filter: ['beruf', 'eigene', 'stufe', 'ziel', 'grund', 'kategorie', 'lernstand'],
			// One head: the result, then what classifies it. Ingredients and the
			// critical success stay on the recipe page.
			spalten: [
				{id: 'name', labelKey: 'hw_ergebnis', sortierung: 'name'},
				{id: 'beruf', labelKey: 'hw_beruf', breite: '14ch'},
				{id: 'tier', labelKey: 'hw_handwerksstufe', sortierung: 'tier', breite: '17ch'},
				{id: 'stufe', labelKey: 'gs_gegenstandsstufe', sortierung: 'stufe', breite: '20ch', zahl: true}
			],
			sortierung: {standard: 'name', erlaubt: ['name', 'tier', 'stufe'],
				ersteRichtung: {name: 'asc', tier: 'asc', stufe: 'asc'}},
			blaettern: {art: 'scroll', groesse: 50}
		},
		rohstoffe: {
			filter: ['beruf', 'eigene', 'stufe', 'region', 'landschaft', 'gebiet'],
			spalten: [
				{id: 'name', labelKey: 'hw_roh_sorte', sortierung: 'name'},
				{id: 'beruf', labelKey: 'hw_beruf', breite: '14ch'},
				{id: 'tier', labelKey: 'hw_handwerksstufe', sortierung: 'tier', breite: '17ch'},
				{id: 'fundstellen', labelKey: 'hw_roh_fundstellen', breite: '16ch'}
			],
			sortierung: {standard: 'name', erlaubt: ['name', 'tier'],
				ersteRichtung: {name: 'asc', tier: 'asc'}},
			blaettern: {art: 'scroll', groesse: 50}
		},
		berufe: {
			filter: ['beruf', 'eigene'],
			spalten: [{id: 'name', labelKey: 'hw_beruf', sortierung: 'name'}],
			sortierung: {standard: 'name', erlaubt: ['name'], ersteRichtung: {name: 'asc'}},
			blaettern: {art: 'scroll', groesse: 50}
		}
	};
})();
