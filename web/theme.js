/* Shared light/dark mode control for PHP and legacy static pages. */
(function () {
	'use strict';
	var root = document.documentElement;
	var current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
	var lang = (document.documentElement.lang || 'de').slice(0, 2);
	var words = {
		de: { light: 'Hell', dark: 'Dunkel', label: 'Darstellung wechseln' },
		en: { light: 'Light', dark: 'Dark', label: 'Change appearance' },
		fr: { light: 'Clair', dark: 'Sombre', label: 'Changer l’apparence' }
	}[lang] || { light: 'Light', dark: 'Dark', label: 'Change appearance' };

	function apply(theme) {
		current = theme === 'light' ? 'light' : 'dark';
		root.setAttribute('data-theme', current);
		root.style.colorScheme = current;
		try { window.localStorage.setItem('mql.theme', current); } catch (_) {}
		if (button) {
			button.textContent = (current === 'light' ? '☀ ' + words.light : '☾ ' + words.dark);
			button.setAttribute('aria-pressed', String(current === 'light'));
			button.setAttribute('aria-label', words.label + ': ' + words[current]);
		}
	}

	var header = document.querySelector('.kopf .charakter') ||
		document.querySelector('.kopf-innen') || document.querySelector('.kopf');
	if (!header) { return; }
	var button = document.createElement('button');
	button.type = 'button';
	button.className = 'theme-toggle';
	button.addEventListener('click', function () { apply(current === 'dark' ? 'light' : 'dark'); });
	header.appendChild(button);
	apply(current);
})();
