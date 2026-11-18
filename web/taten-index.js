/* Filter browser on the alphabetical deed index (/de/tat/ and its siblings).
 *
 * The filter column is the only thing shown here: the paginated server list
 * sits in a hidden container in the source, so search engines still see every
 * deed and the page never flips from list to filter on screen. */
(function () {
	'use strict';
	var root = document.getElementById('taten-index');
	if (!root || !window.MQL_INDEX_ROWS || !window.MQL_TASK_FILTER_SETUP || !window.MQL_FILTER_UI) { return; }
	var rows = window.MQL_INDEX_ROWS.rows || [];
	if (rows.length < 2) { return; }
	window.MQL_FILTER_UI.mount(root, window.MQL_TASK_FILTER_SETUP(rows, 'd'));
}());