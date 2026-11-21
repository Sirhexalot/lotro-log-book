/* Apply the saved theme before stylesheets paint. Dark is the backwards-
 * compatible default; theme.js adds the control after the page has loaded. */
(function () {
	'use strict';
	var theme = 'dark';
	try {
		var saved = window.localStorage.getItem('mql.theme');
		if (saved === 'light' || saved === 'dark') { theme = saved; }
	} catch (_) {}
	document.documentElement.setAttribute('data-theme', theme);
	document.documentElement.style.colorScheme = theme;
})();
