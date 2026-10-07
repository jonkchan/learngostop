#!/usr/bin/env python3
"""
Builds app/fonts/NotoSerifKR-subset.woff2: Noto Serif KR cut down to just the characters the site uses.

The full font is ~24 MB (Google Fonts serves it as ~100 slices, and the page pulled 15 of them, ~620 KB).
The site only uses a few dozen Korean syllables, so a subset is a few dozen KB.

Re-run after adding Korean text with new syllables (otherwise they show in a fallback serif):

    pip install fonttools brotli
    python3 scripts/subset-font.py
"""

import pathlib
import urllib.request

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC_URL = "https://github.com/google/fonts/raw/main/ofl/notoserifkr/NotoSerifKR%5Bwght%5D.ttf"
CACHE = ROOT / "node_modules" / ".cache" / "NotoSerifKR[wght].ttf"
OUT = ROOT / "app" / "fonts" / "NotoSerifKR-subset.woff2"

# Every character in the source, plus all of printable ASCII, Latin-1 and common punctuation,
# so English text set in the serif (headings, numbers) never falls back either.
text = "".join(p.read_text(encoding="utf-8") for d in ("app", "components", "lib") for p in (ROOT / d).rglob("*.ts*"))
chars = set(text) | {chr(c) for c in range(0x20, 0x7F)} | {chr(c) for c in range(0xA0, 0x100)}
chars |= set("‐‑–—‘’‚“”„•…′″‹›€™←↑→↓×")
hangul = sorted(c for c in chars if "가" <= c <= "힣")

if not CACHE.exists():
    CACHE.parent.mkdir(parents=True, exist_ok=True)
    print(f"downloading {SRC_URL}")
    urllib.request.urlretrieve(SRC_URL, CACHE)

font = TTFont(CACHE)  # variable font: the whole weight axis (200–900) is kept

opts = subset.Options()
opts.flavor = "woff2"
opts.name_IDs = ["*"]
opts.notdef_outline = True
sub = subset.Subsetter(opts)
sub.populate(unicodes=[ord(c) for c in chars])
sub.subset(font)
OUT.parent.mkdir(parents=True, exist_ok=True)
font.flavor = "woff2"
font.save(OUT)
print(f"{OUT.relative_to(ROOT)}: {OUT.stat().st_size // 1024} KB, {len(hangul)} Hangul syllables: {''.join(hangul)}")
