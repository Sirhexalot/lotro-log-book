/* Ingredient provenance on demand. Reuse the server-rendered item sources:
 * one item request after opening, never a catalogue download or name guess.
 * No character data is read, sent, or included in these requests. */
(function () {
	'use strict';
	var lang = document.documentElement.lang || 'de';
	var texte = {
		de: ['Wo bekomme ich das?', 'Lade Herkunft …', '', 'Herkunft konnte nicht geladen werden. Schließe und öffne den Hinweis, um es erneut zu versuchen.', 'Die Rohstoffe an diesen Stellen wechseln.'],
		en: ['Where can I get this?', 'Loading sources …', '', 'Could not load sources. Close and reopen to try again.', 'The resources at these spots change.'],
		fr: ['Où en trouver ?', 'Chargement des sources…', '', 'Impossible de charger les sources. Fermez et rouvrez pour réessayer.', 'Les ressources à ces endroits changent.']
	};
	var t = texte[lang] || texte.en;
	var cache = new Map();
	function sources(href) {
		var url = new URL(href, location.href);
		if (url.origin !== location.origin) { return Promise.reject(new Error('origin')); }
		if (!cache.has(url.href)) {
			cache.set(url.href, fetch(url.href, { credentials: 'omit' }).then(function (response) {
				if (!response.ok) { throw new Error('HTTP ' + response.status); }
				return response.text();
			}).then(function (html) {
				var doc = new DOMParser().parseFromString(html, 'text/html');
				return Array.from(doc.querySelectorAll('[data-zutaten-quelle]'));
			}).catch(function (error) { cache.delete(url.href); throw error; }));
		}
		return cache.get(url.href);
	}
	function hinweis(href) {
		var details = document.createElement('details');
		details.className = 'zutaten-herkunft';
		var summary = document.createElement('summary');
		summary.textContent = t[0];
		details.appendChild(summary);
		var content = document.createElement('div');
		details.appendChild(content);
		var geladen = false, laedt = false;
		details.addEventListener('toggle', function () {
			if (!details.open || geladen || laedt) { return; }
			laedt = true; content.textContent = t[1];
			content.setAttribute('role', 'status');
			sources(href).then(function (sections) {
				content.textContent = sections.length ? '' : t[2];
				sections.forEach(function (section) {
					var copy = section.cloneNode(true);
					copy.querySelectorAll('h2').forEach(function (heading) {
						var smaller = document.createElement('h4');
						smaller.textContent = heading.textContent; heading.replaceWith(smaller);
					});
					content.appendChild(copy);
				});
				if (content.querySelector('a[href*="vorkommen="]')) {
					var note = document.createElement('p'); note.className = 'schwach';
					note.textContent = t[4]; content.appendChild(note);
				}
				geladen = true;
			}).catch(function () { content.textContent = t[3]; }).finally(function () { laedt = false; });
		});
		return details;
	}
	window.MQL_ZUTATEN_HERKUNFT = hinweis;
	document.querySelectorAll('a[data-zutat]').forEach(function (link) {
		link.parentNode.appendChild(hinweis(link.href));
	});
})();
