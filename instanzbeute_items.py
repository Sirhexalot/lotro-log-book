"""Allow only positively evidenced chest items into the otherwise curated index."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
LOOT = ROOT / 'daten' / 'instanz-beute.json'


def lade_beute(path=LOOT):
    return json.loads(path.read_text(encoding='utf-8')) if path.is_file() else {}


def truhen_ids(audit):
    pools = audit.get('pools') or []
    used = {row['pool'] for instance in (audit.get('instanzen') or {}).values()
            for row in instance.get('beute', []) if isinstance(row.get('pool'), int)
            and 0 <= row['pool'] < len(pools)}
    return {item['i'] for pos in used for item in pools[pos] if item.get('i') and item.get('p', 0) > 0}


def beute_ergaenzen(items, roh, ids):
    """Keep existing records intact; add new loot items with actual client data."""
    return items | {
        ident: {'n': row['n'], 'ic': row.get('ic'), 'q': row.get('q'),
                'l': row.get('l'), 'kat': row.get('c'), 'instanztruhe_neu': True}
        for ident in sorted(ids - items.keys()) if (row := roh.get(ident)) and row.get('n')
    }
