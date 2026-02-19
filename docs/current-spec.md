# Product Spec — mkpw.dev

> Instant password generator. One page, client-side, zero tracking.

## Overview

mkpw is a single-page static web application that generates cryptographically secure passwords in the browser. No backend, no accounts, no analytics scripts, no network requests after page load. The entire tool is one HTML file, one CSS file, one JS file, and a lazy-loaded wordlist.

**License:** MIT (2026)

---

## Architecture

```
index.html          — single page, all markup
css/style.css       — all styles, design tokens, animations
js/app.js           — all logic (IIFE, ~1,770 lines, vanilla JS)
js/wordlist.js      — Curated wordlist (4,096 words, 12.0 bits/word), lazy-loaded
fonts/              — 4 self-hosted woff2 fonts (no external CDN)
```

No build step. No bundler. No framework. No dependencies. The app ships as raw static files served from a Cloudflare Worker that adds security headers and cache control (see `docs/deployment-plan.md`).

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
| 1 | **Strong & Universal** | Compatible with majority of websites | 18 | `A-Z a-z 0-9 !@#$%^&*-_` | 72 | Starts with letter; no 3+ consecutive identical chars; no sequential runs (abc, cba) |
| 2 | **Strong but Memorable** | Passwords you'll actually remember | variable | Curated wordlist (4,096 words) | 12.0 bits/word | Dual-mode passphrase (see below); no duplicate words |
| 3 | **No Symbols** | Letters & numbers only — for picky websites | 22 | `A-Z a-z 0-9` | 62 | No 2+ consecutive identical chars |
| 4 | **Short but Mighty** | Max strength in ≤16 characters | 12 | `A-Z a-z 0-9 !@#$%^&*-_` | 72 | Starts with letter |
| 5 | **Super Strong** | Extra long — for API keys & encryption | 32 | Full printable ASCII (codes 33–126) | 94 | Requires at least one uppercase, lowercase, digit, and non-alphanumeric |

### Generation Algorithm (`generateFromPool`)

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

`SYMBOLS_SAFE` (Tier 1) is the default symbol pool used by Strong & Universal, Short but Mighty, and the passphrase decorator. `FULL_ASCII` (codes 33–126, 94 chars) is used by Super Strong.

### Strong but Memorable (Passphrase) Generation

- Wordlist: Curated wordlist (4,096 words, 12.0 bits/word), loaded as a `\n`-delimited string on `window.WORDLIST`, split at runtime into an array. Filtered from EFF Large, EFF Short, and BIP39 sources for 4-7 character common English words.
- Each generation produces 4 unique random words (no duplicates within a single password, enforced via a `used` set with max-attempts guard), 1 random digit (0–9), and 1 random symbol from `SYMBOLS_SAFE`.
- Wordlist is lazy-loaded via a dynamically injected `<script>` tag. The passphrase row shows "loading..." until the script fires `onload`.

#### Dual-Mode System

State is stored in a `passphraseState` object (`words`, `digit`, `symbol`, `mode`, `recipe`) that persists across mode toggles.

**Plain mode:** Title-cased words, hyphen-separated. No digit, no symbol. Example: `Maple-Storm-Fox-Belt`.

**Decorated mode (default):** The same 4 words rendered with a randomly generated recipe:
- **Separator:** One of `-`, `.`, `_` (chosen randomly per generation).
- **Capitalization:** Each word independently title-cased or lowercase, constrained so at least one is capitalized and at least one is lowercase.
- **Digit attachment:** The digit attaches to a randomly chosen word as either a prefix or suffix.
- **Symbol attachment:** The symbol attaches to a randomly chosen word as either a prefix or suffix.
- **Co-location order:** When digit and symbol attach to the same word on the same side, their relative order is random (`digitFirst` flag).

Examples (same words: maple, storm, fox, belt; digit 7; symbol !): `maple7-Storm-!fox-belt`, `Maple.storm7.fox.belt!`

#### Mode Toggle (Segmented Control)

A compact segmented control (`.mode-toggle`) in the `.row-top` of the Strong but Memorable row, after `.row-header`. Two buttons — **plain** and **decorated** — in monospace font at `0.6875rem`, pill-shaped border (`border-radius: 999px`). Active segment: `background: var(--surface)`, `color: var(--accent)`. Inactive: `color: var(--muted)`.

Uses `role="radiogroup"` with `role="radio"` on each option, `aria-checked` state, and arrow-key navigation (left/right/up/down). Toggling mode re-renders without regenerating words. The regenerate button picks entirely new words, digit, symbol, and recipe.

Keyboard shortcuts are disabled when focus is on `role="radio"` elements (in addition to `role="switch"`).

---

## "Assemble Your Own" (DIY) Section

Contained in a card with `background: rgba(46, 46, 82, 0.25)`, `border-radius: 8px`, `border: 1px solid rgba(255, 255, 255, 0.04)`, and `padding: 24px` (16px on mobile). Light mode uses `rgba(0,0,0,0.03)` background. A custom password builder with:

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
- On success: checkmark icon, row `.copy-glow` animation (gold box-shadow pulse, all character spans flash white — suppressed when masked), audio tick, haptic vibration (8ms), favicon flashes to checkmark for 1.5s.
- On failure: X icon, password text is auto-selected for manual Ctrl+C, screen reader announces failure instructions.

### Regenerate
- Per-row refresh button regenerates that archetype with scramble animation.
- `regenerateAll()` staggers all 5 rows at 120ms intervals.

### Keyboard Shortcuts
- `1`–`5`: Copy password #1–5 to clipboard.
- `Shift+1`–`5` (i.e., `!@#$%`): Regenerate password #1–5.
- Disabled when focus is on `<input>`, `<textarea>`, `<select>`, `role="switch"`, or `role="radio"` elements.
- Disabled while the info modal is open (`modalOpen` guard at top of keydown handler).

### Shake to Regenerate
Android-only (non-iOS, no permission prompt). Listens to `devicemotion` events. Threshold: acceleration delta > 15. Debounced at 2 seconds. Calls `regenerateAll()` + haptic feedback.

### Pro Tip Banner
Shows once per session after first successful copy (desktop/hover devices only). Reads: "Press 1-5 to copy, Shift+1-5 to regenerate". Auto-dismisses after 5 seconds. Clicking dismisses immediately with fade-out animation.

### Mask Toggle
A single eye icon button (`.btn-mask`) in the header toggles password visibility for all rows and the DIY output simultaneously.

- **Default state:** Unmasked (eye open icon, `aria-pressed="false"`).
- **Masked state:** All `.password-value` elements get `color: transparent; text-shadow: 0 0 8px var(--muted)` — characters are invisible but layout is preserved behind a uniform blur. Eye closed icon shown, `aria-pressed="true"`.
- **Copy while masked:** Works unchanged — `copyToClipboard` reads from the `passwords[]` array, not DOM text. The copy glow box-shadow animation still fires, but the per-span white color flash is suppressed (stays transparent).
- **Exceptions:** "loading..." text for passphrase and the em-dash empty placeholder are NOT blurred when masked.
- **Screen reader privacy:** When masked, all `.password-value` elements get `aria-label="Password hidden"`. On unmask, real password text is restored to `aria-label`.
- **Keyboard shortcuts:** `1`–`5` copy and `Shift+1`–`5` regenerate continue to work while masked.

### Info Modal
A "How mkpw works" modal (`.info-modal`) opened by the `.btn-info` header button. Placed as a direct child of `<body>` (after `</footer>`, before `<script>`) to avoid stacking context issues.

- **Structure:** `.info-modal` (fixed overlay, `z-index: 1000`) contains `.info-backdrop` (click-to-dismiss) and `.info-card` (content). Card has `border: 1px solid var(--accent)`, `max-width: 420px`, gold box-shadow glow in dark mode.
- **Content:** Title "How mkpw works", 5 security promise list items with gold dot bullets and `<strong>` highlights in accent color, and a "View source on GitHub" link.
- **Open/close:** `hidden` attribute + `.visible` class with `opacity` transition (0.2s). Opening removes `hidden`, forces reflow, adds `.visible`. Closing removes `.visible`, then re-adds `hidden` after 200ms timeout.
- **Body scroll lock:** `document.body.style.overflow = 'hidden'` while open.
- **Accessibility:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby="info-modal-title"`. Main and footer set to `aria-hidden="true"` while modal is open. Focus moves to close button on open, returns to info button on close.
- **Focus trap:** ES5-compatible focus trap on Tab/Shift+Tab within modal's focusable elements (`a[href]`, `button:not([disabled])`, `[tabindex]:not([tabindex="-1"])`).
- **Keyboard:** Escape closes modal (with `stopPropagation`). All password keyboard shortcuts (`1`–`5`, `Shift+1`–`5`) are suppressed while modal is open via `modalOpen` guard.
- **Light mode:** Softer backdrop (`rgba(0,0,0,0.3)`), standard box-shadow, `rgba(0,0,0,0.08)` footer border.

---

## Visual Design

### Theme
Dark/light mode with a toggle button in the header. Always starts in dark mode (no persistence). Dark: background `#1A1A2E`, surface `#2E2E52`, accent gold `#E8C547`. Light: background `#F5F3EE`, surface `#E8E6E0`, accent gold `#B8960A`. All colors defined as CSS custom properties on `:root` (dark) and `:root.light` (light). Light mode syntax colors are darkened variants that pass WCAG AA contrast against the light background. Logo glow effects are reduced to 40% opacity in light mode, and logo text-shadows are removed. Toggling updates `meta[name="theme-color"]` and regenerates the favicon with theme-appropriate colors. Body has `transition: background-color 0.2s, color 0.2s` for smooth switching.

### Typography
| Role | Font | Weight | Source |
|------|------|--------|--------|
| Passwords / mono UI | JetBrains Mono | 400 | Self-hosted woff2 |
| UI labels / body | Space Grotesk | 400–500 | Self-hosted woff2 |
| Logo | IBM Plex Mono | 600 | Self-hosted woff2 |

All fonts use `font-display: swap` and are preloaded via `<link rel="preload">`.

### Syntax Highlighting
Each password character is wrapped in a `<span>` with a class determining its color:

| Class | Matches | Color |
|-------|---------|-------|
| `syn-u` | Uppercase `A-Z` | Dark: `#E8C547` (gold) / Light: `#B8960A` |
| `syn-l` | Lowercase `a-z` | Dark: `#D4A843` (warm gold) / Light: `#9A7E08` |
| `syn-d` | Digits `0-9` | Dark: `#7EC8C8` (teal) / Light: `#1A8C8C` |
| `syn-s` | Symbols | Dark: `#E87B6B` (coral) / Light: `#C4453A` |

**Plain mode passphrase:** Alternates between `syn-u` and `syn-l` per word, with hyphens and digits in `syn-d` (same as legacy behavior).

**Decorated mode passphrase:** Highlighting is built from the recipe data (not by parsing the rendered string). Word characters use alternating `syn-u`/`syn-l` by word index, separators and digits use `syn-d`, symbols use `syn-s`. Attachments (digit/symbol prefix or suffix) are placed as distinct spans with their correct class.

### Logo
- Format: `> mkpw.dev` — the `>` prompt is muted, the `.dev` TLD uses `color: var(--accent)` at 15% opacity (25% in light mode), the four letters get syntax-colored glow.
- Each letter of "mkpw" gets a different syntax color with triple-layered text-shadow glow (dark mode only; light mode uses embossed drop-shadow instead).
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
Each row's `.row-top` contains a `.row-header` (flex column with a `.row-title-line` containing `.row-label` + `.shortcut-badge`, and a `.row-tagline` below), plus optional controls (e.g., the mode toggle on Strong but Memorable). The `.row-title-line` is a horizontal flex container (`display: flex; align-items: center; gap: 8px`) that places the shortcut badge inline with the label text. The tagline uses `font-size: 0.75rem`, `color: var(--muted)`, `font-weight: 400`.

Password rows have a permanent `border-left: 2px solid var(--accent)` with `border-radius: 0 4px 4px 0`, `padding: 16px 0 16px 16px`, and an `8px` margin-top gap between adjacent rows (no gradient divider). On hover, a subtle golden background glow appears via `background-color: var(--accent-glow)` with a `0.3s ease` transition. No hover effect on touch devices (naturally invisible since no hover events fire). The copy glow animation (`.copy-glow`) uses a separate `box-shadow` and is independent from the hover state.

### Row Action Buttons
Copy and refresh buttons (`.row-actions .btn-icon`) have a visible resting state: `background: rgba(46, 46, 82, 0.5)` with `border: 1px solid rgba(255, 255, 255, 0.04)`. On hover, they elevate to full `var(--surface)` background. Light mode uses `rgba(0,0,0,0.04)` background with `rgba(0,0,0,0.06)` border.

### Freshness Timer
After 60 seconds without interaction, a password row's text desaturates to 85% (`filter: saturate(0.85)`) over a 5-second CSS transition. Regenerating or copying resets the timer.

---

## Animations

All animations respect `prefers-reduced-motion: reduce`. When reduced motion is active, all transitions collapse to 0.01ms and content renders instantly.

### Boot Sequence
1. Logo appears with cursor blink, "mkpw" scramble-resolves.
2. Logo letters cascade to syntax colors (60ms stagger per letter).
3. `.dev` TLD fades in (250ms delay before row cascade).
4. Password rows cascade in (120ms stagger), each with scramble animation.
5. DIY section reveals; DIY password renders with entropy display.
6. Slogan fades in, rotation starts.

### Scramble Animation
Characters resolve left-to-right over 350ms at 30ms intervals. During animation, random characters from `A-Za-z0-9!@#$%*&` fill unresolved positions. Element gets `opacity: 0.7` during scramble. After resolution, syntax highlighting is applied.

### Slogan Typography & Rotation
The slogan (`.slogan`) uses JetBrains Mono at `0.75rem` with gold color at 35% alpha (`rgba(232, 197, 71, 0.35)`), `letter-spacing: 0.5px`, and a subtle `text-shadow: 0 0 20px rgba(232, 197, 71, 0.1)` glow in dark mode. Light mode uses `rgba(138, 112, 8, 0.35)` with no text-shadow (glow reads as smudge on light backgrounds). The alpha is baked into `color` (not CSS `opacity`) because the slogan animation engines animate `opacity` between 0 and 1.

Rotates every 10 seconds. Three animation engines chosen at random:
- **Scramble:** Per-character resolve with stagger.
- **Typewriter:** Left-to-right at 45ms/char with block cursor `\u258C`, cursor lingers 800ms.
- **Fade:** 200ms fade-out, text swap, 300ms fade-in.

Pauses when page is hidden (`visibilitychange`), resumes on return.

### Slogan Content
102 hand-written taglines with a developer/privacy tone. Examples: "client-side or it didn't happen.", "cat /dev/urandom for the rest of us.", "Math, not promises." No consecutive repeats (rejection sampling on index).

---

## Accessibility

- All interactive elements have `aria-label` attributes.
- Password values have `aria-label` set to plain text (spans are `aria-hidden="true"`).
- Toggle pills use `role="switch"` with `aria-checked`.
- Passphrase mode toggle uses `role="radiogroup"` with `role="radio"` buttons and `aria-checked`. Supports arrow-key navigation.
- Length slider has `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext`.
- Screen reader announcements via `aria-live="polite"` region (`.sr-announcer`), cleared and set via `requestAnimationFrame` to ensure AT picks up changes.
- Entropy display has `aria-live="polite"` and `aria-atomic="true"` for live updates.
- Slogan `aria-live="off"` (decorative, not announced).
- Focus-visible rings via `box-shadow: 0 0 0 2px var(--accent)` on all interactive elements (uses box-shadow instead of outline for smoother rendering).
- Keyboard navigation: toggle pills respond to Enter and Space; mode toggle responds to arrow keys.
- Info modal: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`. Focus trapped inside modal while open. Main/footer set to `aria-hidden="true"` during modal. Focus returns to trigger button on close.

---

## Responsive Design

### Mobile (< 480px)
- Reduced top padding.
- Keyboard shortcut badges hidden (`.shortcut-badge { display: none }`). The `.row-title-line` flex container gracefully collapses to just the label.
- Password font shrinks to `0.8125rem` (13px) with `1px` letter-spacing.
- Action buttons stay inline with password text at reduced 32px size (icons shrink to 16px).
- Header action buttons (mask, info, theme) remain visible. Three 44px buttons fit within the `.header-actions` pill; `.site-header` has `flex-wrap: wrap` so the actions pill wraps below the logo on very narrow screens (320px).

### Touch Devices (`hover: none`)
- Shortcut badges hidden.
- Row hover background glow naturally invisible (no hover events on touch).

---

## Favicon

- Default: "mk" on top line, "pw" on bottom line, rendered on a 64x64 canvas with IBM Plex Mono 600 at 22px. Uses theme-appropriate colors (dark: gold on `#1A1A2E`; light: `#B8960A` on `#F5F3EE`). Generated after `document.fonts.ready`. Regenerated on theme toggle.
- Copy flash: Checkmark `\u2713` centered (single character takes the else branch), theme-aware colors, reverts after 1.5 seconds.

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

### Server-Side (Cloudflare Worker — planned)
- `Content-Security-Policy`: `default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; connect-src 'none'; form-action 'none'; frame-ancestors 'none'; base-uri 'none'`
- `Strict-Transport-Security`: 2-year max-age with HSTS preload.
- `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Permissions-Policy` disabling all device APIs.
- `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Embedder-Policy: require-corp`.
- Cache: fonts/CSS/JS immutable 1 year, wordlist 7 days, HTML 5 minutes with must-revalidate.

---

## File Inventory

| File | Size | Purpose |
|------|------|---------|
| `index.html` | 349 lines | All markup — header with action buttons, 5 archetype rows (with taglines and mode toggle), DIY section, footer with lock icon, info modal |
| `css/style.css` | 1,079 lines | Design tokens (dark + light), layout, mask styles, segmented control, info modal, animations, responsive breakpoints |
| `js/app.js` | 1,766 lines | All application logic incl. passphrase dual-mode, mask toggle, theme toggle, info modal, cumulative tier enforcement, entropy display (IIFE, vanilla ES5-compatible JS) |
| `js/wordlist.js` | ~2 lines | Curated wordlist (4,096 words as `\n`-delimited string, 12.0 bits/word) |
| `fonts/*.woff2` | 3 files | IBM Plex Mono SemiBold, JetBrains Mono, Space Grotesk (Latin subset) |
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
