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
- `css/styles.css` — All styles, mobile-first with breakpoints at 768px (tablet) and 1024px (desktop)
- `js/main.js` — Platform detection (`isIOS()`), deep link handling (`openQuest()`), carousel, distance toggle (mi/km via localStorage)
- `journeys/*.journey` — Markdown files parsed by the iOS app (metadata + waypoints with coordinates and story text)
- `build/index.html` — Journey builder tool (separate single-file app)

## Key Patterns

**Deep linking flow:** User taps quest card → `openQuest(filename)` builds `footnotes://import?url=<encoded-url>` → iOS opens app → if page still visible after 2.5s, show App Store modal.

**Platform behavior:** On iOS, quest buttons trigger deep links. On non-iOS, buttons show "iOS Only" (disabled). iOS notice banner is hidden on iOS devices.

**CSS design:** Warm literary theme (saddle brown `#8B4513`, cream `#FFFCF7`). Category accent colors: Middle-earth green, Wizarding purple, Panem red, le Carré blue, King red. Uses CSS custom properties for spacing (`--space-xs` through `--space-3xl`). Typography: Georgia serif for headings, system sans-serif for body.

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
2. Add a card in `quests/index.html` with `onclick="openQuest('your_quest.journey')"`
3. Update `README.md` quest data table
