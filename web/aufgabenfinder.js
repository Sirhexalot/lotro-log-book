/* Standalone quest finder page. Quest selection continues in the map app. */
(function () {
	'use strict';
	var root = document.getElementById('aufgabenfinder');
	if (!root || !window.MQL_KARTEN_AUFGABENFILTER || !Array.isArray(window.MQL_QUESTS)) { return; }
	var mapPath = {de:'/de/karte/',en:'/en/map/',fr:'/fr/carte/'}[document.documentElement.lang] || '/de/karte/';
	window.MQL_KARTEN_AUFGABENFILTER.mount(root, window.MQL_QUESTS, function (quest) {
		window.location.assign(mapPath + '?id=' + encodeURIComponent(quest.i));
	});
})();
