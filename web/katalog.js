/* Optional enhancement only: static content and links work without JavaScript. */
(function () {
    'use strict';
    var header = document.querySelector('.kopf');
    var button = document.querySelector('.menue-knopf');
    if (button && header) {
        button.addEventListener('click', function () {
            button.setAttribute('aria-expanded', String(header.classList.toggle('menue-offen')));
        });
    }
    // Back links to a list carry the filters this browser last used there.
    // Only links without a query are touched, so shared links keep their state.
    (function () {
        var memory = window.MQL_FILTER;
        if (!memory) { return; }
        // On a list page nothing is decorated: its own reset and pagination
        // links must keep working, and the list itself restores its state.
        if (document.querySelector('.sets-browser')) { return; }
        var lists = {
            gegenstandssuche: 'gegenstaende',
            auftraggeber: 'auftraggeber',
            'quest-giver': 'auftraggeber',
            'donneur-de-quete': 'auftraggeber',
            // Same script, same markup, own memory key each (see auftraggeber.js).
            fraktion: 'fraktion',
            faction: 'fraktion',
            landmarke: 'landmarke',
            landmark: 'landmarke',
            site: 'landmarke',
            handwerk: 'rezepte'
        };
        // Detail pages still link to the old application addresses.
        var legacy = { 'handwerk.html': 'rezepte', 'gegenstaende.html': 'gegenstaende' };
        Array.prototype.forEach.call(document.querySelectorAll('a[href]'), function (link) {
            var url;
            try { url = new URL(link.href, window.location.href); } catch (fehler) { return; }
            if (url.origin !== window.location.origin) { return; }
            var parts = url.pathname.split('/').filter(Boolean);
            var area = lists[parts[1]] || legacy[parts[parts.length - 1]];
            if (!area) { return; }
            var lang = /^[a-z]{2}$/.test(parts[0] || '') ? parts[0] : (url.searchParams.get('lang') || 'de');
            // A real query on the link wins; "?lang=de" is not a filter.
            var own = new URLSearchParams(url.search);
            own.delete('lang');
            if (own.toString()) { return; }
            var query = memory.read(area, lang);
            if (!query) { return; }
            if (legacy[parts[parts.length - 1]]) {
                link.href = url.pathname + '?lang=' + lang + '&' + query + url.hash;
            } else {
                link.href = url.pathname + '?' + query + url.hash;
            }
        });
    })();
    var store = window.MQL_SPEICHER;
    if (!store) { return; }
    // Faction page: the character's own standing, only when ruf was imported.
    (function () {
        var feld = document.getElementById('fraktion-ruf');
        if (!feld) { return; }
        var aktiv = store.aktiv();
        if (!aktiv || store.kennt('reputation') !== true) { return; }
        var id = feld.getAttribute('data-fraktion');
        var eintrag = (aktiv.ruf || []).filter(function (zeile) { return String(zeile[0]).toUpperCase() === id.toUpperCase(); })[0];
        if (!eintrag) { return; }
        var stufe = feld.getAttribute('data-stufe') || 'Stufe';
        var ruf = feld.getAttribute('data-ruf') || 'Ruf';
        var punkte = eintrag[2] === null || eintrag[2] === undefined
            ? '–' : Number(eintrag[2]).toLocaleString(document.documentElement.lang || 'de');
        feld.textContent = aktiv.name + ' · ' + stufe + ' ' + eintrag[1] + ' · ' + punkte + ' ' + ruf;
        feld.hidden = false;
    })();
    var texts = JSON.parse(document.body.getAttribute('data-katalog-texte'));
    var select = document.getElementById('katalog-charakter');
    var status = document.getElementById('katalog-status');
    var characters = store.alle();
    function render() {
        if (!status) { return; }
        var active = store.aktiv();
        if (!active) { status.hidden = true; return; }
        var id = status.getAttribute('data-id');
        var art = status.getAttribute('data-kind') === 'recipe' ? 'recipes'
            : (status.getAttribute('data-kind') === 'd' ? 'deeds' : 'quests');
        // Unknown data is not the same as "not completed".
        if (store.kennt && store.kennt(art) !== true) { status.hidden = true; return; }
        status.hidden = false;
        if (status.getAttribute('data-kind') === 'recipe') {
            var known = (active.rezepte || []).indexOf(id) !== -1;
            var profession = status.getAttribute('data-profession');
            var own = active.handwerk && Object.prototype.hasOwnProperty.call(active.handwerk, profession);
            status.setAttribute('data-done', String(known));
            status.textContent = (known ? '✓ ' + texts.known : !(active.rezepte || []).length ? texts.recipe_unknown :
                !own ? '– ' + texts.foreign : '○ ' + texts.recipe_missing) + ' · ' + active.name;
            return;
        }
        var ids = status.getAttribute('data-kind') === 'd' ? active.deeds : active.quests;
        var done = (ids || []).indexOf(id) !== -1;
        var running = active.laufend && Object.prototype.hasOwnProperty.call(active.laufend, id);
        status.setAttribute('data-done', String(done));
        status.textContent = (done ? '✓ ' + texts.status_done : '○ ' + (running ? texts.status_running : texts.status_unknown)) + ' · ' + active.name;
    }
    if (select && characters.length) {
        var empty = document.createElement('option');
        empty.value = ''; empty.textContent = texts.none; select.appendChild(empty);
        var active = store.aktiv();
        characters.forEach(function (character) {
            var option = document.createElement('option');
            option.value = character.key;
            option.textContent = character.name + (character.server ? ' · ' + character.server : '');
            option.selected = !!active && active.key === character.key;
            select.appendChild(option);
        });
        select.parentElement.hidden = false;
        select.addEventListener('change', function () { store.setzeAktiv(select.value || null); render(); });
    }
    render();
})();

/* Source lists (landmark quests, title/virtue awards): search, completion marks
 * and a short count. A row is only marked when its own data type was imported;
 * an unknown type stays neutral instead of reading as "not completed". */
(function () {
	'use strict';
	var listen = Array.prototype.slice.call(document.querySelectorAll('[data-quellen-liste]'));
	if (!listen.length) { return; }
	var store = window.MQL_SPEICHER;
	var texte = {};
	try { texte = JSON.parse(document.body.getAttribute('data-katalog-texte')) || {}; } catch (fehler) {}
	var zeilen = [];
	listen.forEach(function (liste) {
		zeilen = zeilen.concat(Array.prototype.slice.call(liste.querySelectorAll('li')));
	});
	var suche = document.querySelector('[data-quellen-suche]');
	var stand = document.querySelector('[data-quellen-stand]');
	var sprache = document.documentElement.lang || 'de';

	function art(url) {
		var teile = String(url || '').split('/').filter(Boolean);
		var segment = teile[1] || '';
		if (['aufgabe', 'quest', 'quete'].indexOf(segment) >= 0) { return 'quests'; }
		if (['tat', 'deed', 'prouesse'].indexOf(segment) >= 0) { return 'deeds'; }
		return null;
	}

	function ids(artName) {
		var aktiv = store && store.aktiv();
		if (!aktiv) { return null; }
		if (store.kennt && store.kennt(artName) !== true) { return null; }
		var quelle = artName === 'deeds' ? aktiv.deeds : aktiv.quests;
		var aus = {};
		(quelle || []).forEach(function (id) { aus[String(id).toUpperCase()] = true; });
		return aus;
	}

	var quests = ids('quests');
	var deeds = ids('deeds');
	var bekannt = 0, fertig = 0;

	zeilen.forEach(function (zeile) {
		var url = zeile.getAttribute('data-url') || '';
		var artName = zeile.getAttribute('data-kind') === 'd' ? 'deeds'
			: (zeile.getAttribute('data-kind') === 'q' ? 'quests' : art(url));
		var kennung = String(url || '').split('/').filter(Boolean).pop() || '';
		var tabelle = artName === 'deeds' ? deeds : quests;
		if (artName && tabelle) {
			var getan = !!tabelle[kennung.toUpperCase()];
			bekannt += 1;
			if (getan) { fertig += 1; }
			var marke = document.createElement('span');
			marke.className = 'quellen-marke' + (getan ? ' fertig' : '');
			marke.setAttribute('aria-hidden', 'true');
			marke.title = getan ? (texte.status_done || '') : (texte.status_unknown || '');
			marke.textContent = getan ? '✓' : '○';
			zeile.insertBefore(marke, zeile.firstChild);
		} else {
			var platz = document.createElement('span');
			platz.className = 'quellen-marke';
			platz.setAttribute('aria-hidden', 'true');
			zeile.insertBefore(platz, zeile.firstChild);
		}
		zeile.classList.add('quellen-zeile');
	});

	if (stand) {
		stand.textContent = bekannt
			? fertig + ' ' + (texte.status_done || '') + ' · ' + (bekannt - fertig) + ' ' + (texte.status_unknown || '')
			: '';
		stand.hidden = !bekannt;
	}

	if (suche) {
		suche.addEventListener('input', function () {
			var begriff = suche.value.trim().toLocaleLowerCase(sprache);
			zeilen.forEach(function (zeile) {
				zeile.hidden = begriff !== '' && zeile.textContent.toLocaleLowerCase(sprache).indexOf(begriff) < 0;
			});
		});
	}
})();
