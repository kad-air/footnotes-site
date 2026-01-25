# Footnotes Landing Page

A static website for the Footnotes iOS app, hosted on GitHub Pages at `footnotes.keithadair.com`.

## What This Site Does

1. **Landing Page** (`/`) - Promotes the Footnotes iOS app with features, how it works, and App Store download link
2. **Quest Gallery** (`/quests/`) - Displays cards for 10 legacy quests that can be opened directly in the iOS app via deep links

## About the Footnotes iOS App

Footnotes is an iOS app that turns your daily walks into literary adventures. Users:
- Choose a journey based on a book/story
- Walk in their real neighborhood
- Unlock story waypoints as they hit distance milestones via HealthKit step tracking
- Experience the narrative as they progress through the journey

The app is **iOS only** (iPhone, Apple Watch). No Android version exists.

---

## Deep Linking

The iOS app registers the custom URL scheme `footnotes://` and handles import URLs.

### Deep Link Format

```
footnotes://import?url=<encoded-journey-file-url>
```

### Example

```javascript
const fileUrl = 'https://footnotes.keithadair.com/journeys/lotr_shire_to_bree.journey';
const deepLink = `footnotes://import?url=${encodeURIComponent(fileUrl)}`;
// Result: footnotes://import?url=https%3A%2F%2Ffootnotes.keithadair.com%2Fjourneys%2Flotr_shire_to_bree.journey
```

### How It Works

1. User taps a quest card button on iOS Safari
2. Browser navigates to `footnotes://import?url=...`
3. iOS intercepts the custom URL scheme and opens the Footnotes app
4. The app downloads the `.journey` file from the URL
5. The app parses the Markdown and adds the journey to the user's library
6. Success alert is shown to the user

### Fallback Behavior

If the app isn't installed, the deep link silently fails. The website should:
1. Attempt the deep link
2. Wait ~2.5 seconds
3. If page is still visible (app didn't open), show App Store prompt

---

## Journey File Format

Journey files use Markdown with the `.journey` extension. The iOS app parses this format.

### Structure

```markdown
# Journey Title

**Description:** A short description of the journey (1-2 sentences)
**Category:** Category Name (used for grouping in the app)
**Color:** #RRGGBB (hex color for the journey's theme)
**Character:** Character Name (the protagonist)
**ID:** unique_id (lowercase with underscores, must be unique)

---

## Waypoints

### Waypoint Name
[emoji] latitude, longitude
[emoji] distance_in_meters (optional - distance to NEXT waypoint)

The story text for this waypoint. This is displayed to the user
when they reach this location on their journey. Can be multiple
paragraphs.

---

### Next Waypoint Name
[emoji] latitude, longitude

Another waypoint's story text...

---
```

### Parsing Rules

- **Title**: First `# ` line
- **Metadata**: Lines starting with `**Key:**` followed by value
- **Waypoints section**: Begins after `## Waypoints`
- **Each waypoint**: Starts with `### Waypoint Name`
- **Coordinates**: Line containing `[emoji] lat, lon` (typically latitude, longitude as decimals)
- **Distance**: Optional line with `[emoji] Xm` or `[emoji] XXXXm` (meters to next waypoint)
- **Story text**: Everything else until next `---` or `###`

---

## Quest Data (10 Legacy Quests)

### Middle-earth (Lord of the Rings)

| File | ID | Title | Description | Color | Character | Waypoints |
|------|-----|-------|-------------|-------|-----------|-----------|
| `lotr_shire_to_bree.journey` | `lotr` | The Shire to Bree | A dangerous journey through the Old Forest to the Prancing Pony. | #00FF00 | Frodo | 12 |
| `rivendell.journey` | `rivendell` | Bree to Rivendell | The Flight to the Ford. Escape the Nazgul and find refuge in the Last Homely House. | #0000FF | Aragorn | 7 |
| `moria.journey` | `moria` | The Mines of Moria | Journey through the dark heart of the mountain, from the West Gate to the Golden Wood. | #808080 | Gandalf | 6 |

### Wizarding World (Harry Potter)

| File | ID | Title | Description | Color | Character | Waypoints |
|------|-----|-------|-------------|-------|-----------|-----------|
| `potter_hogwarts_express.journey` | `potter` | The Hogwarts Express | A magical journey from King's Cross to the castle in the Highlands. | #800080 | Harry | 15 |
| `diagon_alley.journey` | `diagon` | Privet Drive to Platform 9 3/4 | An eleven-year-old's first steps into the wizarding world. | #FFFF00 | Harry | 11 |
| `hogsmeade.journey` | `hogsmeade` | Hogwarts to Hogsmeade | A weekend stroll to the wizarding village for butterbeer and sweets. | #FFA500 | Hermione | 12 |

### Panem (Hunger Games)

| File | ID | Title | Description | Color | Character | Waypoints |
|------|-----|-------|-------------|-------|-----------|-----------|
| `hunger_games_74th.journey` | `74th_arena` | The 74th Hunger Games | Survival in the woods. From the bloodbath at the Cornucopia to the final showdown. | #FF0000 | Katniss | 6 |
| `hunger_games_mockingjay.journey` | `mockingjay_march` | Mockingjay: The Final March | The Star Squad's final mission. Navigate the pods and traps of the Capitol on foot. | #FFA500 | Katniss | 6 |

### le Carre's Cold War

| File | ID | Title | Description | Color | Character | Waypoints |
|------|-----|-------|-------------|-------|-----------|-----------|
| `lecarre_circus.journey` | `lecarre1` | The Spy Who Came In: The Circus | Leamas returns to London and begins his degradation. | #0000FF | Leamas | 6 |
| `smiley_london.journey` | `smiley` | Smiley's London | A contemplative walk through George Smiley's city, from Chelsea to Hampstead. | #8B4513 | Smiley | 12 |

---

## CSS Design System

### Colors

```css
:root {
  /* App colors */
  --color-primary: #007AFF;        /* iOS system blue */
  --color-background: #F2F2F7;     /* iOS system background */
  --color-surface: #FFFFFF;        /* Card/surface background */
  --color-text: #1C1C1E;           /* Primary text */
  --color-text-secondary: #8E8E93; /* Secondary text */

  /* Category accent colors (from journey files) */
  --color-middle-earth: #00FF00;   /* Green */
  --color-wizarding: #800080;      /* Purple */
  --color-panem: #FF0000;          /* Red */
  --color-lecarre: #0000FF;        /* Blue */
}
```

### Responsive Breakpoints

```css
/* Mobile first (default): < 768px */
/* Tablet: 768px - 1023px */
/* Desktop: >= 1024px */

@media (min-width: 768px) { /* tablet */ }
@media (min-width: 1024px) { /* desktop */ }
```

### Mobile (iPhone) Requirements

- Minimum touch target: 44x44px
- Minimum body text: 16px (prevents iOS zoom on input focus)
- Safe area insets: Use `env(safe-area-inset-*)` for notch/home indicator
- Full-width cards on mobile with comfortable padding (16px)

### Typography

```css
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 16px;
  line-height: 1.5;
}

h1 { font-size: 2rem; font-weight: 700; }
h2 { font-size: 1.5rem; font-weight: 600; }
h3 { font-size: 1.25rem; font-weight: 600; }
```

---

## Platform Detection

### Detecting iOS

```javascript
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}
```

### UI Behavior

**On iOS:**
- Quest card buttons: "Open in Footnotes" (active, triggers deep link)
- Show App Store badge prominently

**On Non-iOS (Android, Desktop):**
- Quest card buttons: "iOS Only" (disabled/muted styling)
- Show banner: "Footnotes is currently available for iPhone only"
- Optionally show "Get notified" email signup for future Android release

---

## File Structure

```
footnotes-site/
├── index.html              # Landing page
├── quests/
│   └── index.html          # Quest gallery page
├── journeys/               # Journey files served for download
│   ├── lotr_shire_to_bree.journey
│   ├── potter_hogwarts_express.journey
│   ├── diagon_alley.journey
│   ├── hogsmeade.journey
│   ├── lecarre_circus.journey
│   ├── smiley_london.journey
│   ├── rivendell.journey
│   ├── moria.journey
│   ├── hunger_games_mockingjay.journey
│   └── hunger_games_74th.journey
├── css/
│   └── styles.css          # Mobile-first responsive styles
├── js/
│   └── main.js             # Platform detection + deep links
├── assets/
│   └── (app icon, badges, images)
├── CNAME                   # Custom domain: footnotes.keithadair.com
└── README.md               # This file
```

---

## Development

### Local Testing

Open HTML files directly in a browser:
```bash
open index.html
open quests/index.html
```

### Responsive Testing

Use Chrome DevTools device emulation:
1. Open DevTools (Cmd+Option+I)
2. Toggle device toolbar (Cmd+Shift+M)
3. Test: iPhone SE, iPhone 14 Pro, iPad, Desktop

### Deep Link Testing

Deep links only work on actual iOS devices with the Footnotes app installed:
1. Deploy to GitHub Pages (or use ngrok for local testing)
2. Open the site on an iPhone in Safari
3. Tap a quest card
4. Verify the app opens and imports the journey

---

## Deployment

### GitHub Pages Setup

1. Push code to the `main` branch of `github.com/kad-air/footnotes-site`
2. Go to repo Settings > Pages
3. Source: Deploy from branch `main`, folder `/ (root)`
4. Custom domain: `footnotes.keithadair.com`
5. Enforce HTTPS: Yes (enable after DNS propagates)

### DNS Configuration (DigitalOcean)

Add a CNAME record:
```
Type: CNAME
Hostname: footnotes
Value: kad-air.github.io.
TTL: 3600
```

### Verification

After deployment:
```bash
# Check DNS propagation
dig footnotes.keithadair.com

# Should return GitHub Pages IPs or CNAME to kad-air.github.io
```

---

## App Store Information

- **App Name**: Footnotes
- **App Store URL**: (Add when available)
- **Bundle ID**: (Used for universal links if needed in future)

---

## Adding New Quests

1. Create a new `.journey` file following the format above
2. Place it in the `journeys/` directory
3. Add a new card in `quests/index.html` with:
   - Title, description, category from the journey file
   - Color accent matching the `**Color:**` value
   - Button with `onclick="openQuest('filename.journey')"`
4. Update this README's quest data table

---

## Notes

- Journey files are served as static files; GitHub Pages handles them as `application/octet-stream` which works fine for the iOS app
- The iOS app doesn't validate Content-Type, it just reads the bytes as UTF-8
- All coordinates in journey files are real-world locations (used for map display in the app)
- The `**ID:**` field must be unique across all journeys in a user's library
