#!/usr/bin/env python3
"""Update the vendored Matomo DeviceDetector bot regexes."""

from __future__ import annotations

import re
import urllib.request
from pathlib import Path

SOURCE = (
    "https://raw.githubusercontent.com/matomo-org/device-detector/"
    "master/regexes/bots.yml"
)
TARGET = Path(__file__).resolve().parents[1] / "php/src/MatomoBots.php"


def main() -> None:
    text = urllib.request.urlopen(SOURCE, timeout=30).read().decode("utf-8")
    patterns = []
    for line in text.splitlines():
        match = re.fullmatch(r"- regex: ['\"](.*)['\"]", line)
        if match:
            patterns.append(match.group(1).replace("\\'", "'"))
    if not patterns:
        raise SystemExit("No bot regexes found")

    lines = [
        "<?php",
        "",
        "declare(strict_types=1);",
        "",
        "namespace Llb;",
        "",
        "/** Generated from Matomo DeviceDetector bots.yml. */",
        "final class MatomoBots",
        "{",
        "    /** @var list<string> */",
        "    private const PATTERNS = [",
    ]
    def php_quote(value: str) -> str:
        return "'" + value.replace("\\", "\\\\").replace("'", "\\'") + "'"

    lines.extend("        " + php_quote(pattern) + "," for pattern in patterns)
    lines.extend(
        [
            "    ];",
            "",
            "    public static function matches(string $userAgent): bool",
            "    {",
            "        foreach (self::PATTERNS as $pattern) {",
            "            $pattern = str_replace('~', '\\\\~', $pattern);",
            "            if (@preg_match('~' . $pattern . '~i', $userAgent) === 1) {",
            "                return true;",
            "            }",
            "        }",
            "        return false;",
            "    }",
            "}",
            "",
        ]
    )
    TARGET.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {len(patterns)} Matomo bot patterns to {TARGET}")


if __name__ == "__main__":
    main()
