/* Standalone quest finder page. A row opens the quest's detail page: that is
 * the entity the row names. The map is one click away from there ("Auf der
 * Karte öffnen"), so a finder row never skips the page that explains it. */
(function () {
	'use strict';
	var root = document.getElementById('aufgabenfinder');
	if (!root || !window.MQL_KARTEN_AUFGABENFILTER || !Array.isArray(window.MQL_QUESTS)) { return; }
	var lang = document.documentElement.lang || 'de';
	var page = {de:'/de/aufgabe/',en:'/en/quest/',fr:'/fr/quete/'}[lang] || '/de/aufgabe/';
	window.MQL_KARTEN_AUFGABENFILTER.mount(root, window.MQL_QUESTS, function (quest) {
		window.location.assign(page + encodeURIComponent(quest.i) + '/');
	});
})();
