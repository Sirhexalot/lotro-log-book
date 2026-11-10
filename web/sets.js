/* Progressive enhancement only: the GET form also works without JavaScript. */
(function () {
	'use strict';
	var filters = document.querySelector('.sets-filters');
	if (!filters) { return; }
	var mobile = window.matchMedia('(max-width: 900px)');
	function resize() { filters.open = !mobile.matches; }
	resize();
	mobile.addEventListener('change', resize);
	if (!window.fetch || !window.AbortController) { return; }
	var pending;
	function formUrl(form) {
		var url = new URL(form.action, location.href);
		url.search = '';
		new FormData(form).forEach(function (value, name) {
			if (value !== '') { url.searchParams.append(name, value); }
		});
		return url;
	}

	function metadata(doc) {
		['link[rel="canonical"]', 'meta[name="robots"]', 'meta[property="og:url"]'].forEach(function (selector) {
			var old = document.head.querySelector(selector);
			var fresh = doc.head.querySelector(selector);
			if (old && fresh) { old.replaceWith(fresh); }
			else if (old) { old.remove(); }
			else if (fresh) { document.head.appendChild(fresh); }
		});
		document.head.querySelectorAll('link[rel="alternate"]').forEach(function (link) { link.remove(); });
		doc.head.querySelectorAll('link[rel="alternate"]').forEach(function (link) { document.head.appendChild(link); });
		var footer = document.querySelector('footer nav');
		var freshFooter = doc.querySelector('footer nav');
		if (footer && freshFooter) { footer.replaceWith(freshFooter); }
	}

	async function update(url, push) {
		if (pending) { pending.abort(); }
		var request = new AbortController();
		pending = request;
		var form = document.querySelector('.sets-form');
		form.setAttribute('aria-busy', 'true');
		try {
			var response = await fetch(url.href, { signal: request.signal, credentials: 'omit' });
			if (!response.ok) { throw new Error('HTTP ' + response.status); }
			var doc = new DOMParser().parseFromString(await response.text(), 'text/html');
			if (request.signal.aborted || pending !== request) { return; }
			var fresh = doc.querySelector('.sets-form');
			if (!fresh) { throw new Error('Missing set list'); }
			// Read the UI state now: the user may have moved focus or opened the
			// mobile filter while the request was in flight.
			var active = document.activeElement;
			var name = active && form.contains(active) ? active.name : '';
			var value = active && active.value;
			var open = filters.open;
			form.replaceWith(fresh);
			filters = fresh.querySelector('.sets-filters');
			filters.open = open;
			bind();
			metadata(doc);
			// Other filters (the quest-giver tree) keep their own state outside
			// the replaced markup and need to know when to re-apply it.
			document.dispatchEvent(new CustomEvent('mql:filterbrowser'));
			if (push) { history.pushState(null, '', url.pathname + url.search); }
			if (name) {
				var focus = Array.from(fresh.elements).find(function (el) { return el.name === name && el.value === value; });
				if (focus) { focus.focus({ preventScroll: true }); }
			}
		} catch (error) {
			if (!request.signal.aborted && pending === request) { location.assign(url.href); }
		} finally {
			if (pending === request) { pending = null; form.removeAttribute('aria-busy'); }
		}
	}

	function bind() {
		var form = document.querySelector('.sets-form');
		var apply = form.querySelector('.sets-filter-actions button');
		if (apply) { apply.hidden = true; }
		form.addEventListener('submit', function () { if (pending) { pending.abort(); } });
		form.addEventListener('change', function (event) {
			if (event.target.matches('input[type="checkbox"], input[type="number"]') && form.reportValidity()) {
				update(formUrl(form), true);
			}
		});
	}
	bind();
	window.addEventListener('popstate', function () { update(new URL(location.href), false); });
})();
