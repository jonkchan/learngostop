# Go-Stop Guide

A printable, two-page cheat sheet for **Go-Stop (고스톱)**, the Korean hwatu flower-card game. Live at [learngostop.com](https://learngostop.com).

- **Page 1 – The Cards:** a short history, the four card types, all 12 months and their cards, and a legend of the special sets.
- **Page 2 – How to Play:** setup and dealing, a turn step by step, special plays, scoring, Go or Stop, and penalties.

Open the site and use the **Print** button (or your browser's print) to get exactly two US Letter pages.

## Development

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

Built with Next.js (App Router) and Tailwind CSS v4.

| Path | What's there |
| --- | --- |
| `lib/deck.ts` | The 48-card deck: each month's name, color and cards |
| `components/CardsPage.tsx` | Page 1 |
| `components/RulesPage.tsx` | Page 2, including the scoring and special-play tables |
| `components/Sheet.tsx` | The letter-size page frame and shared pieces |
| `lib/site.ts` | Site URL, title and description used for SEO and the QR code |

The site URL defaults to `https://learngostop.com`; override it with `NEXT_PUBLIC_SITE_URL`.

### Korean font

The serif font is Noto Serif KR cut down to only the characters the site uses (`app/fonts/NotoSerifKR-subset.woff2`, ~60 KB instead of several hundred). **After adding Korean text, regenerate it**, or new syllables will show in a fallback font:

```bash
pip install fonttools brotli
python3 scripts/subset-font.py
```

## Credits

- **Card art** (`public/cards/`): hwatu card illustrations by [Spenĉjo](https://commons.wikimedia.org/wiki/User:Spen%C4%89jo) on [Wikimedia Commons](https://commons.wikimedia.org/wiki/Category:Hwatu), licensed [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Renamed to `MM-N.svg` (month, position) and optimized with [SVGO](https://github.com/svg/svgo) to shrink the files; the artwork itself is unchanged.
- **Month icons** (`public/months/`): by Sem for [Fuda Wiki](https://fudawiki.org/en/meta/copyright), licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Renumbered to hwatu month order (November = paulownia, December = willow).
- **Serif font** (`app/fonts/`): [Noto Serif KR](https://fonts.google.com/noto/specimen/Noto+Serif+KR) by Google, licensed [SIL Open Font License 1.1](https://openfontlicense.org). Subset to the characters the site uses.
