/* Use existing translations without starting an application page controller. */
(function () {
	'use strict';
	var lang=document.documentElement.lang, words=(window.MQL_TEXTE||{})[lang]||{};
	window.MQL_SPRACHE=lang;
	window.MQL_T=function(key){return words[key]===undefined?key:String(words[key]);};
	window.MQL_ERSETZE=function(pattern,values){var i=0;return String(pattern).replace(/%s/g,function(){var value=values[i++];return value===undefined?'':String(value);});};
})();
