/* Character progress for server-filtered result rows; no character data leaves the browser. */
(function () {
	'use strict';
	var store = window.MQL_SPEICHER;
	if (!store) { return; }
	var lang = document.documentElement.lang || 'de';
	var words = {
		de: { rank: 'Rufstufe', points: 'Ruf' },
		en: { rank: 'Reputation rank', points: 'Reputation' },
		fr: { rank: 'Rang de réputation', points: 'Réputation' }
	}[lang] || { rank: 'Reputation rank', points: 'Reputation' };

	function render() {
		var active = store.aktiv && store.aktiv();
		var known = !!(active && store.kennt && store.kennt('reputation') === true);
		var rows = Array.from(document.querySelectorAll('[data-progress-kind="reputation"]'));
		var any = false;
		rows.forEach(function (row) {
			var value = row.querySelector('[data-reputation-value]');
			var id = String(row.dataset.progressId || '').toUpperCase();
			var entry = known && (active.ruf || []).find(function (r) { return String(r[0]).toUpperCase() === id; });
			var hasEntry = !!entry && entry[1] !== null && entry[1] !== undefined;
			row.classList.toggle('mql-row-no-progress', !hasEntry);
			if (value) {
				value.hidden = !hasEntry;
				value.parentElement.hidden = !hasEntry;
				var text = hasEntry ? words.rank + ' ' + entry[1] : '';
				if (value.textContent !== text) { value.textContent = text; }
			}
			if (hasEntry) { any = true; }
		});
		document.querySelectorAll('[data-progress-heading="reputation"]').forEach(function (header) {
			header.hidden = !any;
			header.previousElementSibling.hidden = any;
		});
	}

	render();
	document.addEventListener('mql:characterchange', render);
	document.addEventListener('change', function (event) {
		if (event.target.id === 'katalog-charakter') { render(); }
	});
	document.addEventListener('mql:filter-rendered', render);
	document.addEventListener('mql:filterchange', render);
	window.addEventListener('mql-status', render);
	window.addEventListener('storage', function (event) {
		if (!event.key || event.key === 'mql.charaktere') { render(); }
	});
})();
