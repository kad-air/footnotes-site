# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Footnotes is a static website (GitHub Pages) for the Footnotes iOS walking/literary adventure app. The site has two pages: a landing page (`/`) and a quest gallery (`/quests/`). It serves `.journey` files that the iOS app imports via deep links (`footnotes://import?url=...`).

Hosted at `footnotes.keithadair.com`. No build step, no dependencies — pure HTML/CSS/JS.

## Development

**Dev server:** `python3 -m http.server 8080` (configured in `.claude/launch.json` as `footnotes-site`)

**Deployment:** Push to `main` → GitHub Pages auto-deploys from root.

**Deep link testing:** Only works on iOS devices with the app installed. The fallback modal appears after 2.5s if the app doesn't open.

## Architecture

- `index.html` — Landing page (hero, features, screenshot carousel, built-in journeys list)
- `quests/index.html` — Quest gallery with category cards and deep link buttons
- `css/site.css` — Styles for the two marketing pages (landing + quest gallery), mobile-first with breakpoints at 768px (tablet) and 1024px (desktop). Loads Fraunces + Newsreader from Google Fonts with serif fallbacks.
- `css/styles.css` — Legacy stylesheet still used by `build/` and `debug/`. Do not load it on the marketing pages.
- `assets/topo.svg` — Generated topographic contour texture used as a hero/CTA background
- `js/main.js` — Platform detection (`isIOS()`), deep link handling (`openQuest()`), carousel, distance toggle (mi/km via localStorage), quest preview modal, world filter chips, gallery stats, scroll reveal
- `journeys/*.journey` — Markdown files parsed by the iOS app (metadata + waypoints with coordinates and story text)
- `build/index.html` — Journey builder tool (separate single-file app)

## Key Patterns

**Deep linking flow:** User taps quest card → `openQuest(filename)` builds `footnotes://import?url=<encoded-url>` → iOS opens app → if page still visible after 2.5s, show App Store modal.

**Platform behavior:** On iOS, quest buttons trigger deep links. On non-iOS, buttons show "iOS Only" (disabled). iOS notice banner is hidden on iOS devices.

**CSS design (marketing pages, `css/site.css`):** Parchment-and-ink literary theme (leather brown `--c-primary`, parchment `--c-bg`, gold foil `--c-gold`), with a dark "lamp-lit study" palette under `prefers-color-scheme: dark` and `html[data-theme="dark"]`. World accent colors are exposed as `--c-middle-earth`, `--c-wizarding`, `--c-panem`, `--c-lecarre`, `--c-king` and applied per card via `[data-world]` → `--world`. Spacing tokens `--sp-1` … `--sp-9`. Typography: Fraunces (display), Newsreader (body), system sans for UI labels.

**Quest gallery data:** Each `.quest-card` carries `data-world` and `data-waypoints`; `.quest-distance` carries `data-km`. `main.js` derives the header stats (quests, worlds, waypoints, total distance) and the italic length label on each card from those attributes, so keep them accurate when adding quests.

**Distance toggle:** Miles/km preference stored in `localStorage('distance-unit')`. `updateAllDistances()` converts all displayed values.

## Journey File Format

```markdown
# Title
**Description:** ...
**Category:** ...
**Color:** #RRGGBB
**Character:** ...
**ID:** unique_id
**Theme:** epic|adventure|mystery (optional)

---

## Waypoints

### Waypoint Name
📍 latitude, longitude
📏 distanceInMeters

Story text...

---
```

## Adding a New Quest

1. Create `journeys/your_quest.journey` following the format above
2. Add a card in `quests/index.html` (copy an existing `.quest-card`, set `data-world`, `data-waypoints`, `data-km`, and the two `onclick` filenames). New worlds also need a `.world` section, a filter chip, and a `--c-*` color + `[data-world]` rule in `css/site.css`.
3. Update `README.md` quest data table
