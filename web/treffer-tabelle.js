/* Shared result table for filter-backed lists.
 *
 * The heading row is the table head: every sortable column carries its key,
 * the renderer marks the active direction with aria-sort, and the filter shell
 * delegates a click to the sort action. Rows stay a list of cells; the caller
 * supplies the content of each cell.
 */
(function () {
	'use strict';

	function knoten(tag, className, text) {
		var element = document.createElement(tag);
		if (className) { element.className = className; }
		if (text !== undefined && text !== null) { element.textContent = text; }
		return element;
	}

	function bauen(ziel, spalten, sort) {
		ziel.replaceChildren();
		var tabelle = knoten('table', 'llb-tabelle');
		tabelle.setAttribute('role', 'table');
		var kopf = knoten('thead');
		kopf.setAttribute('role', 'rowgroup');
		var kopfzeile = knoten('tr');
		kopfzeile.setAttribute('role', 'row');
		spalten.forEach(function (spalte) {
			var zelle = knoten('th');
			zelle.setAttribute('role', 'columnheader');
			zelle.scope = 'col';
			if (spalte.zahl) { zelle.className = 'llb-zahl'; }
			if (spalte.breite) { zelle.style.width = spalte.breite; }
			if (spalte.sortierung) {
				var aktiv = sort && sort.key === spalte.sortierung;
				zelle.setAttribute('aria-sort', aktiv ? (sort.dir === 'desc' ? 'descending' : 'ascending') : 'none');
				var knopf = knoten('button');
				knopf.type = 'button';
				knopf.dataset.sortKey = spalte.sortierung;
				knopf.appendChild(document.createTextNode(spalte.label));
				var pfeil = knoten('span', 'llb-sort-pfeil', aktiv ? (sort.dir === 'desc' ? '↓' : '↑') : '↕');
				pfeil.setAttribute('aria-hidden', 'true');
				knopf.appendChild(pfeil);
				zelle.appendChild(knopf);
			} else {
				zelle.textContent = spalte.label;
			}
			kopfzeile.appendChild(zelle);
		});
		kopf.appendChild(kopfzeile);
		tabelle.appendChild(kopf);
		var koerper = knoten('tbody');
		koerper.setAttribute('role', 'rowgroup');
		tabelle.appendChild(koerper);
		ziel.appendChild(tabelle);
		return {tabelle: tabelle, koerper: koerper};
	}

	function zeile(spalten, zellen) {
		var reihe = knoten('tr');
		reihe.setAttribute('role', 'row');
		spalten.forEach(function (spalte, nummer) {
			var zelle = knoten('td');
			zelle.setAttribute('role', 'cell');
			if (spalte.zahl) { zelle.className = 'llb-zahl'; }
			if (spalte.breite) { zelle.style.width = spalte.breite; }
			var inhalt = zellen[nummer];
			if (inhalt && inhalt.nodeType) { zelle.appendChild(inhalt); }
			else { zelle.textContent = inhalt === undefined || inhalt === null ? '' : String(inhalt); }
			reihe.appendChild(zelle);
		});
		return reihe;
	}

	window.MQL_TABELLE = {bauen: bauen, zeile: zeile};
})();
