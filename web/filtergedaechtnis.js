/* Remembers the last filter state of a list in this browser.
 *
 * Only the query string is stored, never character data. A detail page uses it
 * to lead back to the filtered list; a list opened without parameters reads it
 * back. The address always wins: a shared or typed link is not overwritten.
 */
(function () {
	'use strict';

	var PREFIX = 'mql.filter.';

	function key(area, lang) {
		return PREFIX + area + '.' + (lang || 'de');
	}

	function read(area, lang) {
		try {
			var raw = window.localStorage.getItem(key(area, lang));
			if (!raw) { return ''; }
			var data = JSON.parse(raw);
			return data && typeof data.q === 'string' ? data.q : '';
		} catch (fehler) {
			return '';
		}
	}

	function write(area, lang, query) {
		try {
			if (query) {
				window.localStorage.setItem(key(area, lang), JSON.stringify({ q: query }));
			} else {
				window.localStorage.removeItem(key(area, lang));
			}
		} catch (fehler) { /* private mode or quota: the list still works */ }
	}

	function clear(area, lang) {
		write(area, lang, '');
	}

	window.MQL_FILTER = { read: read, write: write, clear: clear, key: key };
})();
