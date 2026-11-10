"""Render-ready set records. Reuse item models; never calculate stats twice."""
SEGMENT = {'de': 'set', 'en': 'set', 'fr': 'ensemble'}
ITEM = {'de': 'gegenstand', 'en': 'item', 'fr': 'objet'}


def set_pages(source, lang, item_pages):
    pages = {}
    for sid, entry in source['sets'].items():
        if not entry['listable']:
            continue
        members = []
        for member in entry['members']:
            card = item_pages.get(member['id']) if member['available'] else None
            card = dict(card) if card else None
            if card:
                card['required_class'] = member['class_labels'].get(lang) or None
            members.append({
                'id': member['id'], 'name': member['name'][lang],
                'url': '/%s/%s/%s/' % (lang, ITEM[lang], member['id']) if card else None,
                'card': {key: card.get(key) for key in (
                    'chips', 'armour', 'values', 'bonuses', 'scale', 'symbol',
                    'head_class', 'required_class')} if card else None,
            })
        bonuses = []
        for group in entry['bonuses']:
            texts, pending = [], []
            for bonus in group['entries']:
                if bonus['display_ready']:
                    text = bonus['display'][lang]
                    if text not in texts:
                        texts.append(text)
                else:
                    label = bonus['labels'].get(lang) or ''
                    pending.append({'label': label, 'scaling': bonus['mode'] == 'scaling'})
            bonuses.append({'pieces': group['pieces'], 'valid': group['valid_threshold'],
                            'texts': texts, 'pending': pending})
        pages[sid] = {'id': sid, 'name': entry['name'][lang], 'members': members,
                      'bonuses': bonuses, 'parts': len(members),
                      'available_parts': sum(bool(m['card']) for m in members)}
    return pages


def link_items(item_pages, source, lang):
    """Replace the legacy, misleading set-level range by the real set link."""
    by_item = {}
    for sid, entry in source['sets'].items():
        if entry['listable']:
            for member in entry['members']:
                by_item.setdefault(member['id'], []).append((sid, entry))
    for iid, page in item_pages.items():
        choices = by_item.get(iid, [])
        page['set_links'] = [{'text': entry['name'][lang],
                              'url': '/%s/%s/%s/' % (lang, SEGMENT[lang], sid)}
                             for sid, entry in choices]
        if page.get('set'):
            # Full members and bonuses now live on their own set page. Remove
            # the old incomplete mini-renderer, including level 515–154.
            page['set'] = None
