# Product Spec — mkpw.dev

> Instant password generator. One page, client-side, zero tracking.

## Overview

mkpw is a single-page static web application that generates cryptographically secure passwords in the browser. No backend, no accounts, no analytics scripts, no network requests after page load. The entire tool is one HTML file, one CSS file, one JS file, and a wordlist.

**License:** MIT (2026)

---

## Architecture

```
index.html          — single page, all markup
css/style.css       — all styles, design tokens, animations
js/app.js           — all logic (IIFE, ~1,900 lines, vanilla JS)
js/wordlist.js      — Curated wordlist (4,096 words, 12.0 bits/word)
fonts/              — 4 self-hosted woff2 fonts (no external CDN)
```

No build step. No bundler. No framework. No dependencies. The app ships as raw static files served from Cloudflare Pages with security headers via `_headers` and per-asset-type cache control (see `docs/plans/2026-02-19-feat-cloudflare-pages-deployment-plan.md`).

---

## Cryptographic Foundation

All randomness comes from the Web Crypto API (`crypto.getRandomValues`).

### `randomInt(max)`
Unbiased random integer in `[0, max)` using rejection sampling on `Uint32Array`. Prevents modulo bias by discarding values above the largest multiple of `max` that fits in 32 bits.

### `shuffle(arr)`
Fisher-Yates shuffle using `randomInt`. Used to distribute required characters uniformly after seeding.

---

## Password Archetypes

Five preset generators appear as rows on the page. Each has a name, tagline (smaller muted text describing when to use it), keyboard shortcut badge (with `title="Press N to copy"` hover tooltip), copy button, and regenerate button. The name and shortcut badge are wrapped together in a `.row-title-line` flex container, which sits inside `.row-header` (flex column) alongside the `.row-tagline`. The `.row-header` is inside `.row-top`.

| # | Name | Tagline | Length | Character Pool | Pool Size | Constraints |
|---|------|---------|--------|---------------|-----------|-------------|
| 1 | **Works with Most Sites** | 18 chars — letters, digits & symbols | 18 | `A-Z a-z 0-9 !@#$%^&*-_` | 72 | Starts with letter; no 3+ consecutive identical chars; no sequential runs (abc, cba) |
| 2 | **If You Need to Remember It** | Secure string a human can remember | variable | Story password system (see below) | combinatorial | 7 schemas, 4 pattern overlays, SFW toggle |
| 3 | **No Special Characters** | 22 chars — for sites that reject symbols | 22 | `A-Z a-z 0-9` | 62 | No 2+ consecutive identical chars |
| 4 | **If Character Limit Is Short** | 12 chars — letters, digits & symbols | 12 | `A-Z a-z 0-9 !@#$%^&*-_` | 72 | Starts with letter |
| 5 | **Maximum Security** | 32 chars — every printable character | 32 | Full printable ASCII (codes 33–126) | 94 | Requires at least one uppercase, lowercase, digit, and non-alphanumeric |

### Generation Algorithm (`generateFromPool`)

Used by archetypes 1, 3, 4, and 5 (not archetype 2, which uses the story password system):

1. Seed one character from each required character class (guarantees representation).
2. Fill remaining length from the full pool.
3. Fisher-Yates shuffle the entire array.
4. Validate against constraints (starts-with-letter, consecutive, sequential).
5. Retry up to 100 times on constraint failure, then return best effort.

### Character Constants

Symbol characters are organized into three strictly cumulative tiers that partition all 32 non-alphanumeric printable ASCII characters (codes 33–126):

| Tier | Characters | Count | Cumulative Total |
|------|-----------|-------|-----------------|
| 1 (Safe) | `!@#$%^&*-_` | 10 | 10 |
| 2 (More) | `+.=?~(){}[]` | 11 | 21 |
| 3 (Full) | `"'`\\/\|:;<>,` | 11 | 32 |

`SYMBOLS_SAFE` (Tier 1) is the default symbol pool used by Works with Most Sites, If Character Limit Is Short, and the DIY default. `FULL_ASCII` (codes 33–126, 94 chars) is used by Maximum Security.

### If You Need to Remember It (Story Password) Generation

Archetype 2 uses a story-based password system that generates sentence-like hyphen-separated passwords from NLP-style lexicon pools.

- **Wordlist:** Curated wordlist (4,096 words, 12.0 bits/word), loaded synchronously via `<script src="js/wordlist.js">` before `app.js`. The wordlist is set as a `\n`-delimited string on `window.WORDLIST`, split at runtime into an array. Filtered from EFF Large, EFF Short, and BIP39 sources for 4-7 character common English words.
- The passphrase row shows "loading..." in the HTML as its default state; this is replaced immediately when JS initializes.

#### Token Slot Types

| Slot | Role | Pool Source |
|------|------|-------------|
| `X` | Actor (name/role) | `MIXED_ACTOR_WORDS` (global names + creature/role words + extended occupations/animals) or `GLOBAL_NAME_WORDS` only |
| `V` | Verb (3rd person singular) | `VERB_WORDS` — inferred from root candidates via suffix heuristics, then conjugated |
| `R` | Relation/preposition | `RELATION_WORDS` — curated list of 26 prepositions |
| `A` | Adjective | `ADJECTIVE_WORDS` with 78% vivid bias from `ADJECTIVE_VIVID_WORDS` subset |
| `O` | Object noun | `OBJECT_WORDS` with 72% vivid bias from `OBJECT_VIVID_WORDS` subset |
| `T` | Twist/adverb | `TWIST_WORDS` — `-ly` adverb forms + curated seeds (used only by `six` pattern) |

#### Schemas (7 total)

One schema is randomly selected per generation. Each defines a word ordering for the 5-word base form and 6-word extended form:

| Schema | Base Order | 6-Word Order | Actor Pool |
|--------|-----------|-------------|------------|
| `scene-a` | `X-V-R-A-O` | `X-V-R-A-O-T` | mixed |
| `scene-b` | `A-O-V-R-X` | `A-O-V-R-X-T` | mixed |
| `scene-c` | `X-V-O-R-A` | `X-V-O-R-A-T` | mixed |
| `scene-d` | `O-V-R-X-A` | `O-V-R-X-A-T` | mixed |
| `scene-e` | `A-X-V-R-O` | `A-X-V-R-O-T` | mixed |
| `scene-f` | `X-V-R-A-O` | `X-V-R-A-O-T` | names only |
| `scene-g` | `O-R-A-X-V` | `O-R-A-X-V-T` | mixed |

#### Pattern Overlays (4 total)

One pattern is randomly selected per generation, adding numeric or structural variety:

| Pattern | Effect | Entropy Contribution |
|---------|--------|---------------------|
| `ordinal` | Injects `NNth` (10–99 with proper suffix) before the `O` token | ~6.49 bits |
| `year` | Appends `in-YYYY` where YYYY is in [1901..2099] | ~7.64 bits |
| `time` | Prepends `At-HH:MM-` in 24h format, 30-minute increments (48 slots) | ~5.58 bits |
| `six` | No digits; uses the 6-word variant with `T` slot | 0 (offset by extra word) |

#### Formatting

- Hyphen-separated tokens.
- `X` (actor) is always title-cased in output.
- Final punctuation is randomly `!` or `?`.
- Examples: `Nico-juggles-under-fuzzy-toaster!`, `At-14:30-squishy-rocket-drifts-near-Priya?`, `turnip-hops-beside-Omar-cozy-gleefully!`

#### Lexicon Architecture

Slot pools are built at runtime from the base wordlist using suffix heuristics and curated seed lists:

- **`STORY_BASE_WORDS`**: Cleaned from the 4,096-word wordlist — ASCII-only, 3–10 chars, stopwords and SFW-excluded words removed.
- **`VERB_WORDS`**: Verb root candidates (seed list + heuristic detection via inflection forms like `-ing`, `-ed`), converted to 3rd-person singular. Hard-block list prevents noun misclassification.
- **`ADJECTIVE_WORDS`**: Seed-driven + suffix detection (`-ful`, `-less`, `-ous`, `-ish`, and adverb-pair `X`/`Xly` heuristic). Boring-word and verb-form guards applied.
- **`OBJECT_WORDS`**: Concrete nouns via exclusion — abstract suffixes (`-tion`, `-ness`, etc.), bland words, verb forms, adjectives all filtered out. Dynamic pool capped at 900 via deterministic FNV-1a hash ordering.
- **`TWIST_WORDS`**: `-ly` adverb forms from seed list + base wordlist inference.

**Vivid bias:** To increase delight without collapsing diversity, `ADJECTIVE_VIVID_WORDS` and `OBJECT_VIVID_WORDS` are charm-first subsets. Generation uses probabilistic bias: adjectives 78% vivid, objects 72% vivid.

**Deterministic cap:** `capWordPool()` uses FNV-1a hash ordering and slices to a target cap. This keeps pool sizes stable and reproducible.

**Global names pool:** Short names (≤5 chars, ASCII transliterated) curated across 23 geographic origins: Spanish/Portuguese, Indian, Italian, Arabic, Greek, German, Russian, Ukrainian, Hungarian, French, Turkish, Persian, Polish, Czech/Slovak, Romanian, Hebrew, Japanese (romanized), Korean (romanized), Chinese (pinyin), Vietnamese, Indonesian/Malay, Filipino, East African/Swahili.

#### SFW Toggle

A compact `<button>` (`.sfw-toggle`) in the `.row-top` of the If You Need to Remember It row, after `.row-header`, using `role="switch"` with `aria-checked`. Pill-shaped (`border-radius: 12px`), monospace font at `0.6875rem`.

- **SFW on (default):** `.sfw-toggle.active` — no line-through, `opacity: 0.8`, `border-color: var(--muted)`. Normal generation from clean pools.
- **SFW off:** `text-decoration: line-through`, `opacity: 0.5`. Guaranteed profanity injection into one random slot (`A`, `O`, `V`, or `T`) via `injectProfanity()`.

State is stored in `storyState.sfw` (`'on'`/`'off'`). Toggling SFW regenerates the password. Default: SFW on.

Keyboard shortcuts are disabled when focus is on `role="switch"` elements (in addition to `role="radio"`).

#### Entropy (Approximate)

Using current pool sizes and including schema/pattern/punctuation randomness:
- 5-word story core (mixed actors): ~39 bits before pattern overhead.
- With system overhead (schema × pattern × punctuation): ~+6 bits.
- Example rough totals: no-digit route ~45 bits, year route ~53 bits.

---

## "Assemble Your Own" (DIY) Section

Contained in a card with `background: rgba(46, 46, 82, 0.25)`, `border-radius: 8px`, `border: 1px solid rgba(255, 255, 255, 0.04)`, and `padding: 24px` (16px on mobile). Light mode uses `rgba(0,0,0,0.04)` background. A custom password builder with:

### Controls
- **Length slider:** Range `4`–`128`, default `16`. Updates `<output>` readout and `aria-valuetext` on input. The track shows a gold accent fill from the left edge to the thumb position via a JS-driven `linear-gradient` background, updated on input, toggle change, theme change, and init.
- **Character toggle pills** (ARIA `role="switch"`):

| Pill | Label | Characters (cumulative) | Default |
|------|-------|------------------------|---------|
| A-Z | `A-Z` | `ABCDEFGHIJKLMNOPQRSTUVWXYZ` | on |
| a-z | `a-z` | `abcdefghijklmnopqrstuvwxyz` | on |
| 0-9 | `0-9` | `0123456789` | on |
| Tier 1 | `!@#$%^&*-_` | `!@#$%^&*-_` (10 chars) | on |
| Tier 2 | `More symbols` | Tier 1 + `+.=?~(){}[]` (21 chars) | off |
| Tier 3 | `Full ASCII` | Tier 1 + Tier 2 + `"'\`\\/\|:;<>,` (32 chars) | off |

Symbol tiers are strictly cumulative: enabling Tier 2 auto-enables Tier 1; enabling Tier 3 auto-enables Tiers 1 and 2. Disabling Tier 1 auto-disables Tiers 2 and 3. Disabling Tier 2 auto-disables Tier 3 but leaves Tier 1 on. The three character-class pills (A-Z, a-z, 0-9) remain independent. Default DIY pool size = 72 (62 alphanumeric + 10 safe symbols).

> **Note:** The Tier 3 "Full ASCII" pill label refers to all 32 symbol characters across the three cumulative tiers — not the 94-char printable ASCII set used by the Maximum Security archetype.

### DIY Generation

DIY passwords are generated directly from a de-duplicated character pool (not via `generateFromPool`). Each character is independently and uniformly selected from the unique pool using `randomInt`. No seeding or constraint validation is applied.

### Constraints
- At least one charset must remain enabled. Attempting to disable the last one triggers a shake animation and screen reader announcement.
- If password length is less than the number of enabled charsets, it auto-adjusts upward.

### Entropy Display
Displayed below the DIY password output in a `.diy-entropy` element. Format: `~N bits · 10B guesses/s = ~T (offline GPU attack)` where N is `round(length × log₂(poolSize))` and T is the human-readable time derived from `2^N / 10¹⁰`. Uses the de-duplicated pool size for accuracy. When entropy is high enough that `Math.pow(2, N)` overflows to `Infinity`, displays "longer than the age of the universe". The element has `aria-live="polite"` and `aria-atomic="true"` for screen reader announcements on parameter changes. Preset archetype rows show no entropy or strength information.

---

## Interaction Design

### Copy to Clipboard
- **Primary:** `navigator.clipboard.writeText` (async API).
- **Fallback:** Hidden `<textarea>` + `document.execCommand('copy')` for older browsers.
- Clicking the password text OR the copy icon button triggers copy.
- On success: checkmark icon, row `.copy-glow` animation (gold box-shadow pulse, all character spans get `brightness(1.4)` boost — suppressed when masked), audio tick, haptic vibration (8ms), favicon flashes to checkmark for 1.5s.
- On failure: X icon, password text is auto-selected for manual Ctrl+C, screen reader announces failure instructions.

### Regenerate
- Per-row refresh button regenerates that archetype with scramble animation.
- `regenerateAll()` staggers all 5 rows at 120ms intervals.

### Keyboard Shortcuts
- `1`–`5`: Copy password #1–5 to clipboard.
- `Shift+1`–`5` (i.e., `!@#$%`): Regenerate password #1–5.
- Disabled when focus is on `<input>`, `<textarea>`, `<select>`, `role="switch"`, or `role="radio"` elements.
- Disabled while the info modal is open (`modalOpen` guard at top of keydown handler).

### Pro Tip Banner
Shows once per session after first successful copy (desktop/hover devices only). Reads: "Press 1-5 to copy, Shift+1-5 to regenerate". Auto-dismisses after 5 seconds. Clicking dismisses immediately with fade-out animation.

### Mask Toggle
A single eye icon button (`.btn-mask`) in the header toggles password visibility for all rows and the DIY output simultaneously.

- **Default state:** Unmasked (eye open icon, `aria-pressed="false"`).
- **Masked state:** All `.password-value` elements get `color: transparent; text-shadow: 0 0 8px var(--muted)` — characters are invisible but layout is preserved behind a uniform blur. Light mode uses `text-shadow: 0 0 10px rgba(42, 42, 46, 0.45)`. Eye closed icon shown, `aria-pressed="true"`.
- **Copy while masked:** Works unchanged — `copyToClipboard` reads from the `passwords[]` array, not DOM text. The copy glow box-shadow animation still fires, but the per-span brightness boost is suppressed (stays `filter: none`).
- **Exceptions:** "loading..." text for the story password row is NOT blurred when masked (`.masked .password-value.loading` preserves `color: var(--muted)`).
- **Screen reader privacy:** When masked, all `.password-value` elements get `aria-label="Password hidden"`. On unmask, real password text is restored to `aria-label`.
- **Keyboard shortcuts:** `1`–`5` copy and `Shift+1`–`5` regenerate continue to work while masked.

### Info Modal
A "How mkpw works" modal (`.info-modal`) opened by the `.btn-info` header button. Placed as a direct child of `<body>` (after `</footer>`, before `<script>`) to avoid stacking context issues.

- **Structure:** `.info-modal` (fixed overlay, `z-index: 1000`) contains `.info-backdrop` (click-to-dismiss, `backdrop-filter: blur(6px)`) and `.info-card` (content). Card has `border: none`, `border-radius: 12px`, `max-width: 420px`, subtle ring shadow (`0 0 0 1px rgba(255,255,255,0.05)`).
- **Content:** Hero title `> mkpw` in logo font, tagline "Everything happens in your browser. Nothing leaves.", 4 info items with colored left borders (using syntax colors: gold, teal, coral, warm-gold), and a "View source →" link. Each info item has a label and description.

  | # | Label | Description | Border Color |
  |---|-------|-------------|-------------|
  | 1 | Client-side | Generated with cryptographic randomness. No server involved. Works offline. | `--syntax-upper` |
  | 2 | Zero tracking | No cookies, no localStorage, no analytics. Nothing. | `--syntax-digit` |
  | 3 | Nothing stored | Close the tab and it's like you were never here. | `--syntax-symbol` |
  | 4 | Open source | MIT-licensed. Every line on GitHub. | `--syntax-lower` |

- **Open/close:** `hidden` attribute + `.visible` class with `opacity` transition (0.25s). Opening removes `hidden`, forces reflow, adds `.visible`. Info items stagger-animate in (0.35s each, 0.05s increments). Closing removes `.visible`, then re-adds `hidden` after 200ms timeout.
- **Body scroll lock:** `document.body.style.overflow = 'hidden'` while open.
- **Accessibility:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby="info-modal-title"`. Main and footer set to `aria-hidden="true"` while modal is open. Focus moves to close button on open, returns to info button on close.
- **Focus trap:** Vanilla JS focus trap on Tab/Shift+Tab within modal's focusable elements (`a[href]`, `button:not([disabled])`, `[tabindex]:not([tabindex="-1"])`).
- **Keyboard:** Escape closes modal (with `stopPropagation`). All password keyboard shortcuts (`1`–`5`, `Shift+1`–`5`) are suppressed while modal is open via `modalOpen` guard.
- **Light mode:** Softer backdrop (`rgba(0,0,0,0.25)`), card background `#FFFFFF`, standard box-shadow with `rgba(0,0,0,0.06)` ring and `rgba(0,0,0,0.15)` drop.

---

## Visual Design

### Theme
Dark/light mode with a toggle button in the header. Always starts in dark mode (no persistence). Dark: background `#1A1A2E`, surface `#2E2E52`, accent gold `#E8C547`. Light: background `#F5F3EE`, surface `#E2DFD8`, accent gold `#9B7D0A`. All colors defined as CSS custom properties on `:root` (dark) and `:root.light` (light). Light mode syntax colors are darkened variants that pass WCAG AA contrast against the light background. Logo glow effects use embossed drop-shadow style in light mode (white highlight + colored directional shadow, replacing the omnidirectional glow). Toggling updates `meta[name="theme-color"]` and regenerates the favicon with theme-appropriate colors. Body has `transition: background-color 0.2s, color 0.2s` for smooth switching.

### Typography
| Role | Font | Weight | Source |
|------|------|--------|--------|
| Passwords / mono UI | JetBrains Mono | 200 (passwords), 400 (UI) | Self-hosted woff2 |
| UI labels / body | Space Grotesk | 400–500 | Self-hosted woff2 |
| Logo | IBM Plex Mono | 600 | Self-hosted woff2 |

All fonts use `font-display: swap` and are preloaded via `<link rel="preload">`. Password values (`.password-value`) use `font-weight: 200` (thin) for a privacy-conscious lighter appearance.

### Syntax Highlighting
Each password character is wrapped in a `<span>` with a class determining its color:

| Class | Matches | Dark Mode | Light Mode |
|-------|---------|-----------|------------|
| `syn-u` | Uppercase `A-Z` | `#E8C547` (gold) | `#9B7D0A` |
| `syn-l` | Lowercase `a-z` | `#C49030` (warm gold) | `#8A6510` |
| `syn-d` | Digits `0-9` | `#7EC8C8` (teal) | `#1A7F7F` |
| `syn-s` | Symbols | `#E87B6B` (coral) | `#B5422E` |

**Password privacy opacity:** Within `.password-value`, all syntax colors are rendered at 58% alpha (e.g., `rgba(232, 197, 71, 0.58)` for `syn-u`) to reduce shoulder-surfing contrast. On narrow mobile (≤430px), full-opacity syntax colors are restored to compensate for small text size, and font-weight reverts to 400.

**Story password highlighting:** Story passwords are rendered through the standard `renderHighlighted` function — each character gets its syntax class based on character type. Hyphens, digits, and punctuation render as `syn-d` or `syn-s` respectively.

### Logo
- Format: `> mkpw.dev` — the `>` prompt is muted, the `.dev` TLD uses `color: var(--accent)` at 30% opacity (25% in light mode), the four letters get syntax-colored glow.
- Each letter of "mkpw" gets a different syntax color (`syn-u`, `syn-d`, `syn-s`, `syn-l`) with triple-layered text-shadow glow (dark mode only; light mode uses embossed drop-shadow instead).
- Multi-color radial-gradient glow backdrop behind the logo brand (light mode uses a linear gradient shifted below text).
- `.dev` suffix fades in during boot sequence. A rotating slogan displays below the logo (see Slogan Rotation).

### Header Actions
Three icon buttons grouped in a `.header-actions` pill-shaped container (`background: var(--surface)`, `border-radius: 20px`, `padding: 3px`), right-aligned in the flex header. Light mode uses `rgba(0,0,0,0.05)` background. Tab order: mask → info → theme.
- **Mask toggle** (`.btn-mask`): Eye icon toggles all passwords between visible and blurred. See Mask Toggle section.
- **Info button** (`.btn-info`): Circle-i icon opens the info modal. See Info Modal section.
- **Theme toggle** (`.btn-theme`): Sun/moon icon switches between dark and light mode. See Theme section.

### Footer
Trust statement ("Generated in your browser. Nothing sent to any server. Ever.") preceded by a lock icon (inline SVG padlock). Separated from main content by a `border-top: 1px solid var(--surface)` with `padding: 40px 16px 48px`. Source link and license below.

### Password Rows
Each row's `.row-top` contains a `.row-header` (flex column with a `.row-title-line` containing `.row-label` + `.shortcut-badge`, and a `.row-tagline` below), plus optional controls (e.g., the SFW toggle on If You Need to Remember It). The `.row-title-line` is a horizontal flex container (`display: flex; align-items: center; gap: 8px`) that places the shortcut badge inline with the label text. The tagline uses `font-size: 0.6875rem`, `color: var(--muted)`, `font-weight: 400`, `opacity: 0.5` at rest (fades to `opacity: 1` on row hover).

Password rows have a permanent `border-left: 2px solid var(--accent)` with `border-radius: 0 4px 4px 0`, `padding: 16px 10px 16px 16px`, and a `14px` margin-top gap between adjacent rows (no gradient divider). On hover, a subtle golden background glow appears via `background-color: var(--accent-glow)` with a `0.3s ease` transition. No hover effect on touch devices (naturally invisible since no hover events fire). The copy glow animation (`.copy-glow`) uses a separate `box-shadow` and is independent from the hover state.

### Row Action Buttons
Copy and refresh buttons (`.row-actions .btn-icon`) have a visible resting state: `background: rgba(46, 46, 82, 0.5)` with `border: 1px solid rgba(255, 255, 255, 0.04)`. On hover, they elevate to full `var(--surface)` background. Light mode uses `rgba(0,0,0,0.04)` background with `rgba(0,0,0,0.06)` border.

### Password Font Size
Password value font size uses `clamp(0.875rem, 2.2vw, 1.125rem)` — scaling from 14px to 18px based on viewport width.

---

## Animations

All animations respect `prefers-reduced-motion: reduce`. When reduced motion is active, all transitions collapse to 0.01ms and content renders instantly.

### Boot Sequence
1. Logo appears with cursor blink, "mkpw" scramble-resolves.
2. Logo letters cascade to syntax colors (60ms stagger per letter).
3. `.dev` TLD fades in (150ms delay before row cascade).
4. Password rows cascade in (80ms stagger), each with scramble animation.
5. DIY section reveals; DIY password renders with entropy display.
6. Slogan fades in (0.5s opacity transition), rotation starts.

### Scramble Animation
Characters resolve left-to-right over 350ms at 30ms intervals. During animation, random characters from `A-Za-z0-9!@#$%*&` fill unresolved positions. Element gets `opacity: 0.7` during scramble. After resolution, syntax highlighting is applied.

### Slogan Typography & Rotation
The slogan (`.slogan`) uses JetBrains Mono at `0.75rem` with gold color at 48% alpha (`rgba(232, 197, 71, 0.48)`), `letter-spacing: 0.5px`, and a subtle `text-shadow: 0 0 20px rgba(232, 197, 71, 0.12)` glow in dark mode. Light mode uses `rgba(155, 125, 10, 0.55)` with a lighter text-shadow (`0 0 12px rgba(155, 125, 10, 0.08)`). The alpha is baked into `color` (not CSS `opacity`) because the slogan animation engine animates `opacity` between 0 and 1.

Rotates every 10 seconds using a fade animation: 200ms fade-out, text swap, 300ms fade-in.

Pauses when page is hidden (`visibilitychange`), resumes on return with an immediate new slogan.

### Slogan Content
101 hand-written taglines with a developer/privacy tone. Examples: "client-side or it didn't happen.", "cat /dev/urandom for the rest of us.", "Math, not promises." No consecutive repeats (rejection sampling on index).

---

## Accessibility

- All interactive elements have `aria-label` attributes.
- Password values have `aria-label` set to plain text (spans are `aria-hidden="true"`).
- Toggle pills use `role="switch"` with `aria-checked`.
- SFW toggle uses `role="switch"` with `aria-checked` and `aria-label="SFW vocabulary filter"`.
- Length slider has `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext`.
- Screen reader announcements via `aria-live="polite"` region (`.sr-announcer`), cleared and set via `requestAnimationFrame` to ensure AT picks up changes.
- Entropy display has `aria-live="polite"` and `aria-atomic="true"` for live updates.
- Slogan `aria-live="off"` (decorative, not announced).
- Focus-visible rings via `box-shadow: 0 0 0 2px var(--accent)` on all interactive elements (uses box-shadow instead of outline for smoother rendering).
- Keyboard navigation: toggle pills respond to Enter and Space.
- Info modal: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`. Focus trapped inside modal while open. Main/footer set to `aria-hidden="true"` during modal. Focus returns to trigger button on close.

---

## Responsive Design

### Mobile (≤ 480px)
- Reduced top padding.
- Keyboard shortcut badges hidden (`.shortcut-badge { display: none }`). The `.row-title-line` flex container gracefully collapses to just the label.
- Password font shrinks to `0.75rem` (12px) with `0px` letter-spacing.
- Action buttons increase to 44px (icons to 18px) for touch target compliance.
- Header action buttons (mask, info, theme) remain visible at 44px. Three buttons fit within the `.header-actions` pill; `.site-header` has `flex-wrap: wrap` so the actions pill wraps below the logo on very narrow screens.
- SFW toggle font shrinks to `0.625rem`.

### Narrow Mobile (≤ 430px)
- Password font adjusts to `0.8125rem` (13px) with `font-weight: 400` (regular, not thin) and `0px` letter-spacing.
- Syntax colors restored to full opacity (overriding the 58% alpha used at larger widths) to prevent compounding illegibility with smaller text.

### Touch Devices (`hover: none`)
- Shortcut badges hidden.
- Row hover background glow naturally invisible (no hover events on touch).

---

## Favicon

- Default: "mk" on top line, "pw" on bottom line, rendered on a 64x64 canvas with IBM Plex Mono 600. Font size auto-fitted (starts at 44px, decrements until both 2-char rows fit within padding). Uses theme-appropriate colors (dark: syntax colors on `#1A1A2E`; light: darkened syntax colors on `#F5F3EE`). Generated after `document.fonts.ready`. Regenerated on theme toggle.
- Copy flash: Checkmark `✓` centered (single character takes the else branch), theme-aware colors, reverts after 1.5 seconds.

---

## Audio & Haptics

- **Audio tick on copy:** Triangle wave oscillator at 1800Hz, 40ms duration, gain ramps from 0.08 to 0.001. AudioContext created lazily on first use.
- **Haptic on copy:** `navigator.vibrate(8)` (single 8ms pulse).
- **Haptic on regenerate:** `navigator.vibrate([6, 30, 6])` (double-tap pattern).
- All disabled when `prefers-reduced-motion: reduce` is active.

---

## Security Posture

### Client-Side
- Zero network requests after page load. No `fetch`, no `XMLHttpRequest`, no tracking pixels.
- No `localStorage`, `sessionStorage`, `IndexedDB`, or cookies. Zero persistence.
- All randomness from `crypto.getRandomValues` (CSPRNG).
- No `eval`, no inline scripts, no dynamic code execution.
- CSP enforced via `<meta http-equiv="Content-Security-Policy">` in the HTML: `default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:`.

### Server-Side (Cloudflare Pages `_headers`)
- `Content-Security-Policy`: `default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; connect-src 'none'; form-action 'none'; frame-ancestors 'none'; base-uri 'none'`
- `Strict-Transport-Security`: 2-year max-age with HSTS preload (`.dev` TLD already in preload list).
- `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Permissions-Policy` disabling all device APIs, `X-DNS-Prefetch-Control: off`.
- `Cross-Origin-Opener-Policy: same-origin`. No COEP — no cross-origin isolation needs.
- `Cross-Origin-Resource-Policy: same-origin` on fonts (defense-in-depth).
- Cache: fonts immutable 1 year, CSS/JS 1 day, HTML 5 minutes with must-revalidate. Cloudflare edge cache purges on deploy.

---

## File Inventory

| File | Size | Purpose |
|------|------|---------|
| `index.html` | 360 lines | All markup — header with action buttons, 5 archetype rows (with taglines and SFW toggle), DIY section, footer with lock icon, info modal |
| `css/style.css` | 1,194 lines | Design tokens (dark + light), layout, mask styles, SFW toggle, info modal, animations, responsive breakpoints |
| `js/app.js` | 1,906 lines | All application logic incl. story password system, lexicon builders, SFW/profanity, mask toggle, theme toggle, info modal, cumulative tier enforcement, entropy display (IIFE, vanilla JS — ES2015+ APIs, `var`-style declarations) |
| `js/wordlist.js` | ~4 lines | Curated wordlist (4,096 words as `\n`-delimited string, 12.0 bits/word) |
| `fonts/*.woff2` | 4 files | IBM Plex Mono SemiBold, JetBrains Mono (Regular + Thin), Space Grotesk (Latin subset) |
| `LICENSE` | MIT | |

---

## What It Doesn't Have (By Design)

- No backend / API
- No user accounts or authentication
- No analytics or telemetry (client-side)
- No cookies, localStorage, or any persistence
- No external dependencies or CDN requests
- No build system, bundler, or transpiler
- No framework (React, Vue, etc.)
- No npm packages in the client bundle
- No service worker or offline caching (yet)
- No theme persistence (always starts dark; toggle resets on reload)
- No password strength meter (DIY section shows entropy bits + attack model estimate)
- No password history or "recently generated" feature
