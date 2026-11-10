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
    var texts = JSON.parse(document.body.getAttribute('data-katalog-texte'));
    var select = document.getElementById('katalog-charakter');
    var status = document.getElementById('katalog-status');
    var characters = store.alle();
    function render() {
        if (!status) { return; }
        var active = store.aktiv();
        status.hidden = !active;
        if (!active) { return; }
        var id = status.getAttribute('data-id');
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
