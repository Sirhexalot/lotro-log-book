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
