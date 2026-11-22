/* Shared list-name ordering. Leading punctuation stays in the display name. */
(function (root) {
	'use strict';
	var extra = { 'ß':'ss', 'æ':'ae', 'œ':'oe', 'ø':'o', 'ł':'l', 'ð':'d', 'þ':'t' };
	var cache = new Map();
	function key(value) {
		var written = String(value == null ? '' : value);
		if (cache.has(written)) { return cache.get(written); }
		var text = written
			.replace(/^[^\p{L}\p{N}]+/u, '').toLowerCase();
		text = text.replace(/[ßæœøłðþ]/g, function (c) { return extra[c] || c; });
		text = text.normalize('NFKD').replace(/\p{M}/gu, '');
		cache.set(written, text);
		return text;
	}
	function compare(a, b) {
		var x = key(a), y = key(b);
		var xp = x.match(/\d+|\D+/g) || [], yp = y.match(/\d+|\D+/g) || [];
		for (var i = 0; i < Math.min(xp.length, yp.length); i += 1) {
			var xd = /^\d+$/.test(xp[i]), yd = /^\d+$/.test(yp[i]);
			var n = xd && yd ? (BigInt(xp[i]) < BigInt(yp[i]) ? -1 : BigInt(xp[i]) > BigInt(yp[i]) ? 1 : 0)
				: (xp[i] < yp[i] ? -1 : xp[i] > yp[i] ? 1 : 0);
			if (n) { return n; }
		}
		if (xp.length !== yp.length) { return xp.length < yp.length ? -1 : 1; }
		var as = String(a == null ? '' : a), bs = String(b == null ? '' : b);
		return as < bs ? -1 : as > bs ? 1 : 0;
	}
	root.MQL_SORT = { key: key, compare: compare };
}(window));
