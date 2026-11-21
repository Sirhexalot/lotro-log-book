/* Optional enhancement only: static content and links work without JavaScript. */
(function () {
    'use strict';
    var header = document.querySelector('.kopf');
    var button = document.querySelector('.menue-knopf');
    if (button && header) {
        function closeMenu() {
            header.classList.remove('menue-offen');
            button.setAttribute('aria-expanded', 'false');
            if (window.MQL_FAMILIENMENUE) { window.MQL_FAMILIENMENUE.schliesseAlle(null); }
        }
        button.addEventListener('click', function () {
            if (header.classList.contains('menue-offen')) { closeMenu(); }
            else {
                header.classList.add('menue-offen');
                button.setAttribute('aria-expanded', 'true');
            }
        });
        document.addEventListener('keydown', function (event) {
            if (event.key !== 'Escape' || !header.classList.contains('menue-offen')) { return; }
            closeMenu();
            button.focus();
        });
    }
    var feedback = document.querySelector('.entity-feedback-link');
    if (feedback) {
        feedback.addEventListener('click', function () {
            var name = document.querySelector('main h1');
            var context = {
                url: window.location.href,
                type: document.body.getAttribute('data-art') || '',
                id: document.body.getAttribute('data-entity-id') || '',
                name: name ? name.textContent.trim().slice(0, 180) : '',
                viewport: window.innerWidth + 'x' + window.innerHeight
            };
            try { window.sessionStorage.setItem('llb.feedback.context', JSON.stringify(context)); } catch (_) {}
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
    var ersetzt = window.MQL_REPLACED || {};
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
        var id = status.getAttribute('data-id');
        var art = status.getAttribute('data-kind') === 'recipe' ? 'recipes'
            : (status.getAttribute('data-kind') === 'd' ? 'deeds' : 'quests');
        if (!active && art === 'recipes') { status.hidden = true; return; }
        // Unknown data is not the same as "not completed".
        if (active && store.status && !store.status(art, id) && art === 'recipes') { status.hidden = true; return; }
        if (active && !store.status && store.kennt && store.kennt(art) !== true && art === 'recipes') { status.hidden = true; return; }
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
        var control = window.MQL_STATUS_UI && window.MQL_STATUS_UI.create(
            art, id, render, art === 'deeds' ? 'deed' : art === 'quests' ? 'quest' : null);
        status.replaceChildren();
        if (control) { status.appendChild(control); }
        status.hidden = !control;
    }
    if (select) {
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

/* Source lists (landmark quests, title/virtue awards) are rendered by the
 * shared filter component (entitaeten-listen.js) with their own adapter, so
 * search, filters, completion marks and pagination are the same as in the
 * public catalogues. Only the faction's own standing is left here. */
