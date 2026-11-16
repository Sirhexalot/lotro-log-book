/* Anonymous site counters: no character data is sent to the server. */
(function (root) {
	'use strict';

	var lang = (document.documentElement.getAttribute('lang') || 'de').toLowerCase();
	var words = {
		de: { active: '%s Gefährten sind gerade unterwegs', imports: '%s Gefährten bereits importiert' },
		en: { active: '%s companions are travelling now', imports: '%s companions imported so far' },
		fr: { active: '%s compagnons sont actuellement en route', imports: '%s compagnons déjà importés' }
	}[lang] || null;
	if (!words || !window.fetch) { return; }

	function zeigen(data) {
		if (!data || typeof data.active !== 'number' || typeof data.imports !== 'number') { return; }
		Array.prototype.forEach.call(document.querySelectorAll('[data-statistik-aktiv]'), function (feld) {
			var number = data.active.toLocaleString(lang);
			var label = words.active.replace('%s', number);
			var aktivText = feld.querySelector('[data-statistik-aktiv-text]') || feld;
			aktivText.textContent = label;
			feld.hidden = false;
		});
		Array.prototype.forEach.call(document.querySelectorAll('[data-statistik-importe]'), function (feld) {
			feld.textContent = words.imports.replace('%s', data.imports.toLocaleString(lang));
			feld.hidden = false;
		});
	}

	function senden(aktion, eventId) {
		return root.fetch('/api/statistik', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'same-origin',
			body: JSON.stringify({ action: aktion, event: eventId || '' }),
			keepalive: true
		}).then(function (antwort) {
			return antwort.ok ? antwort.json() : null;
		}).then(zeigen).catch(function () { /* statistics are optional */ });
	}

	root.LLB_STATISTIK = {
		import: function () {
			var eventId = String(Date.now()) + '-' + Math.random();
			return senden('import', eventId);
		}
	};
	senden('heartbeat');
	root.setInterval(function () { senden('heartbeat'); }, 60000);
})(window);
