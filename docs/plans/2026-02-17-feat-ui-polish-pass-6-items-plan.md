---
title: "feat: UI polish pass — 6 items"
type: feat
date: 2026-02-17
brainstorm: docs/brainstorms/2026-02-17-ui-polish-pass-brainstorm.md
---

# UI Polish Pass — 6 Items

## Overview

Cohesive UX/UI polish pass implementing 6 items from the features pipeline. All changes reinforce the "playful-confident" identity. Changes span CSS (`css/style.css`), HTML (`index.html`), and JS (`js/app.js`).

**Implementation order:** Items 1, 5, 6, 2 are CSS-only and independent — do them first. Item 3 requires HTML restructuring. Item 4 (info modal) is the largest and touches all three files.

## Items

### Item 1: `.dev` TLD — Gold accent at 15% opacity

**Files:** `css/style.css:276-291`

**Change:** Replace `color: var(--muted)` with `color: var(--accent)`, and change `.logo-tld.visible` from `opacity: 1` to `opacity: 0.15`.

```css
/* css/style.css:276 */
.logo-tld {
  color: var(--accent);          /* was: var(--muted) */
  /* ... rest unchanged ... */
}

/* css/style.css:289 */
.logo-tld.visible {
  opacity: 0.15;                 /* was: 1 */
}
```

**Light mode override:** `#8A7008` at 15% on `#F5F3EE` is near-invisible. Add a light mode override with higher opacity:

```css
:root.light .logo-tld.visible {
  opacity: 0.25;
}
```

**Gotcha:** Boot animation adds `.visible` via JS (`js/app.js:872`). No JS change needed — the class toggle still works, just the CSS target value changes.

---

### Item 2: Mobile password overflow — Smaller font at 480px

**Files:** `css/style.css:895-898`

**Change:** Reduce the existing mobile font size from `0.9375rem` (15px) to `0.8125rem` (13px). Fine-tune on real devices — if 13px is too small, try `0.875rem` (14px).

```css
/* css/style.css:895 — inside @media (max-width: 480px) */
.password-value {
  font-size: 0.8125rem;          /* was: 0.9375rem */
  letter-spacing: 1px;
}
```

**Test with:** "Super Strong" (32 chars) and "Easy to Remember" decorated mode (30+ chars) on a 320px viewport. Characters like `l`/`1`/`0`/`O` must remain distinguishable.

**No light mode override needed** — font size is theme-independent.

---

### Item 3: Shortcut badge — Inline with row title

**Files:** `index.html` (all 5 password rows), `css/style.css:382-393, 453-485`

#### HTML restructuring

Move `<kbd>` from `.row-top` into `.row-header`, as a sibling of `.row-label`. Restructure `.row-header` to have a title line (label + badge) and a tagline below it.

**Standard row (rows 1, 3, 4, 5):**

```html
<!-- Before -->
<div class="row-top">
  <div class="row-header">
    <span class="row-label">STRONG RANDOM</span>
    <span class="row-tagline">Best for most websites</span>
  </div>
  <kbd class="shortcut-badge" aria-hidden="true" title="Press 1 to copy">1</kbd>
</div>

<!-- After -->
<div class="row-top">
  <div class="row-header">
    <div class="row-title-line">
      <span class="row-label">STRONG RANDOM</span>
      <kbd class="shortcut-badge" aria-hidden="true" title="Press 1 to copy">1</kbd>
    </div>
    <span class="row-tagline">Best for most websites</span>
  </div>
</div>
```

**Passphrase row (row 2) — badge inline with label, pill pushed right:**

```html
<!-- After -->
<div class="row-top">
  <div class="row-header">
    <div class="row-title-line">
      <span class="row-label">EASY TO REMEMBER</span>
      <kbd class="shortcut-badge" aria-hidden="true" title="Press 2 to copy">2</kbd>
    </div>
    <span class="row-tagline">Memorize in minutes, strong enough for real use</span>
  </div>
  <div class="mode-toggle" role="radiogroup" aria-label="Passphrase mode">
    <button class="mode-option" role="radio" aria-checked="false" data-mode="plain">plain</button>
    <button class="mode-option active" role="radio" aria-checked="true" data-mode="decorated">decorated</button>
  </div>
</div>
```

#### CSS changes

```css
/* New: title line as horizontal flex */
.row-title-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* .row-header stays flex-direction: column (unchanged) */
/* .shortcut-badge stays as-is — just moves in DOM */
/* .shortcut-badge tooltip (::after) still works — positioned absolute relative to badge */
```

**Mobile:** Badge is `display: none` at 480px and on `hover: none` devices. The `.row-title-line` flex container gracefully collapses to just the label when the badge is hidden. No phantom gaps because the badge has no margin, only the flex gap which disappears with the hidden child.

**No JS changes needed** — the badge has no JS event listeners (it is `aria-hidden`, decorative).

---

### Item 4: Info button + security-promises modal

**Files:** `index.html`, `css/style.css`, `js/app.js`

This is the largest item. Implementation details below.

#### 4a. Info button in header

Add a new `btn-info` between the mask and theme buttons in `.header-actions` (`index.html:23-44`):

```html
<div class="header-actions">
  <button class="btn-icon btn-mask" aria-label="Hide passwords" aria-pressed="false">
    <!-- ... existing eye icons ... -->
  </button>
  <button class="btn-icon btn-info" aria-label="About this site">
    <svg class="icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <circle cx="10" cy="10" r="8"/>
      <path d="M10 9v5M10 6.5v.01"/>
    </svg>
  </button>
  <button class="btn-icon btn-theme" aria-label="Switch to light mode">
    <!-- ... existing sun/moon icons ... -->
  </button>
</div>
```

**Button placement rationale:** Between mask and theme groups the functional toggles (mask, theme) on the outside with the info action in the middle. Tab order: mask -> info -> theme.

**Mobile touch target:** Inherits existing `@media (max-width: 480px) .header-actions .btn-icon { width: 44px; height: 44px; }` rule at `css/style.css:914-917`. Three 44px buttons + gaps + padding = ~148px. Logo at mobile size ~160px. With 24px body padding per side, usable width is 272px on 320px screens — **this will overflow**. The `.site-header` has `flex-wrap: wrap` so the actions pill wraps below the logo gracefully. If the wrap looks awkward, reduce header button size to `40px` at 480px.

#### 4b. Modal HTML

Place the modal as a direct child of `<body>`, after `</footer>` and before the `<script>` tags. This avoids stacking context issues with `<main>`.

```html
<div class="info-modal" role="dialog" aria-modal="true" aria-labelledby="info-modal-title" hidden>
  <div class="info-backdrop"></div>
  <div class="info-card">
    <div class="info-card-header">
      <h2 id="info-modal-title">How mkpw works</h2>
      <button class="btn-icon btn-info-close" aria-label="Close">
        <svg class="icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M5 5l10 10M15 5L5 15"/>
        </svg>
      </button>
    </div>
    <ul class="info-promises">
      <li>Passwords are generated <strong>entirely in your browser</strong> using cryptographic randomness</li>
      <li><strong>No server</strong> is involved — this page works offline</li>
      <li>Nothing is <strong>saved, logged, or cached</strong> — close the tab and it's gone</li>
      <li><strong>No cookies</strong>, no localStorage, no analytics — zero tracking</li>
      <li><strong>Open source</strong> and MIT-licensed</li>
    </ul>
    <p class="info-footer-note">
      <a href="https://github.com" target="_blank" rel="noopener">View source on GitHub</a>
    </p>
  </div>
</div>
```

#### 4c. Modal CSS

Add a new `/* --- Info Modal --- */` section in `css/style.css`, before the footer section:

```css
/* --- Info Modal --- */
.info-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.info-modal.visible {
  opacity: 1;
}

.info-modal[hidden] {
  display: none;
}

.info-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
}

.info-card {
  position: relative;
  background: var(--surface);
  border: 1px solid var(--accent);
  border-radius: 8px;
  padding: 24px;
  max-width: 420px;
  width: 100%;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  box-shadow: 0 0 60px rgba(232, 197, 71, 0.1);
}

.info-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.info-card-header h2 {
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 500;
  color: var(--text);
  margin: 0;
}

.info-promises {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-promises li {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  color: var(--text);
  line-height: 1.5;
  padding-left: 20px;
  position: relative;
}

.info-promises li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  width: 6px;
  height: 6px;
  background: var(--accent);
  border-radius: 50%;
}

.info-promises strong {
  color: var(--accent);
}

.info-footer-note {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.8125rem;
}

.info-footer-note a {
  color: var(--muted);
  text-decoration: none;
  transition: color 0.15s;
}

.info-footer-note a:hover {
  color: var(--accent);
}

.btn-info-close:focus-visible {
  box-shadow: 0 0 0 2px var(--accent);
}
```

**Light mode overrides:**

```css
:root.light .info-backdrop {
  background: rgba(0, 0, 0, 0.3);
}

:root.light .info-card {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
}

:root.light .info-footer-note {
  border-top-color: rgba(0, 0, 0, 0.08);
}
```

**Reduced motion:** Add to the existing `prefers-reduced-motion` media query block:

```css
@media (prefers-reduced-motion: reduce) {
  .info-modal {
    transition-duration: 0.01ms;
  }
}
```

#### 4d. Modal JS

Add a new `// Info Modal` section in `js/app.js`, after the Theme Toggle section. All code must be ES5-compatible.

**Core logic:**

```javascript
// ============================================
// Info Modal
// ============================================

var infoBtn = document.querySelector('.btn-info');
var infoModal = document.querySelector('.info-modal');
var infoBackdrop = infoModal.querySelector('.info-backdrop');
var infoCloseBtn = infoModal.querySelector('.btn-info-close');
var modalOpen = false;

function openInfoModal() {
  modalOpen = true;
  infoModal.removeAttribute('hidden');
  // Force reflow for transition
  infoModal.offsetHeight; // eslint-disable-line no-unused-expressions
  infoModal.classList.add('visible');
  document.body.style.overflow = 'hidden';
  // Set inert on main content for screen readers
  document.querySelector('main').setAttribute('aria-hidden', 'true');
  document.querySelector('footer').setAttribute('aria-hidden', 'true');
  // Focus the close button
  infoCloseBtn.focus();
}

function closeInfoModal() {
  modalOpen = false;
  infoModal.classList.remove('visible');
  document.body.style.overflow = '';
  document.querySelector('main').removeAttribute('aria-hidden');
  document.querySelector('footer').removeAttribute('aria-hidden');
  // After transition, hide
  setTimeout(function () {
    if (!modalOpen) {
      infoModal.setAttribute('hidden', '');
    }
  }, 200);
  // Return focus to info button
  infoBtn.focus();
}

// Focus trap (ES5-compatible)
function trapFocus(e) {
  if (!modalOpen) return;
  var focusable = Array.prototype.slice.call(
    infoModal.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
  );
  if (focusable.length === 0) return;
  var first = focusable[0];
  var last = focusable[focusable.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

infoBtn.addEventListener('click', openInfoModal);
infoBackdrop.addEventListener('click', closeInfoModal);
infoCloseBtn.addEventListener('click', closeInfoModal);

infoModal.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    e.stopPropagation();
    closeInfoModal();
    return;
  }
  if (e.key === 'Tab') {
    trapFocus(e);
  }
});
```

**Keyboard shortcut guard** — Add `modalOpen` check to the global keydown handler (`js/app.js:1154`):

```javascript
// At the top of the existing keydown handler, add:
if (modalOpen) return;
```

---

### Item 5: Golden line gaps — 8px separators

**Files:** `css/style.css:338-340`

**Change:** Increase `margin-top` from `2px` to `8px`.

```css
/* css/style.css:338 */
.password-row + .password-row {
  margin-top: 8px;              /* was: 2px */
}
```

Starting with `8px` (4x current). If it feels too tight, bump to `10px`. If rows feel disconnected, dial back. The gold `border-left` visually connects the rows, so the gap reads as intentional rhythm rather than separation.

**No light mode override needed** — layout-only change.

---

### Item 6: Slogan typography — Monospace gold with glow

**Files:** `css/style.css:320-327`

**Change:** Replace the existing `.slogan` styles:

```css
/* css/style.css:320 */
.slogan {
  font-family: var(--font-mono);               /* was: var(--font-sans) */
  font-size: 0.75rem;                           /* was: 0.8125rem */
  color: rgba(232, 197, 71, 0.35);              /* was: var(--muted) */
  letter-spacing: 0.5px;
  text-shadow: 0 0 20px rgba(232, 197, 71, 0.1);
  margin-top: 8px;
  min-height: 1.4em;
  flex-basis: 100%;
}
```

**Light mode override** — add in the light mode section:

```css
:root.light .slogan {
  color: rgba(138, 112, 8, 0.35);
  text-shadow: none;
}
```

**Why `text-shadow: none` in light mode?** Gold glow on a light background reads as a smudge, not a glow. Removing it keeps the slogan clean.

**Gotcha (from brainstorm):** The alpha is baked into `color` (not the CSS `opacity` property) because the slogan JS engines (`animateSloganScramble`, `animateSloganTypewriter`, `animateSloganFade` at `js/app.js:1397-1527`) animate `opacity` between `0` and `1`. Using CSS `opacity: 0.35` would be overridden to `1` on every animation cycle.

**JetBrains Mono is wider than Space Grotesk.** Longest slogans (50+ chars) may wrap to 2 lines on mobile. This is acceptable — `.slogan` already has `min-height: 1.4em` and `flex-basis: 100%`. No overflow handling needed.

**Reduced motion:** The slogan animations are already disabled when `prefers-reduced-motion: reduce`. The new CSS styles (font, color, shadow) are not animations and apply regardless.

---

## Acceptance Criteria

### Per-item

- [x] **Item 1:** `.dev` fades to gold at 15% opacity during boot. Visible in both dark and light mode.
- [x] **Item 2:** Passwords do not overflow at 320px viewport width. Characters remain distinguishable.
- [x] **Item 3:** Badge sits inline with label text. Passphrase row shows badge+label left, pill right. Badge hidden on mobile/touch. No layout breakage.
- [x] **Item 4:** Info button opens modal. Modal dismisses via ESC, backdrop click, and X button. Focus trapped inside modal. Focus returns to info button on close. Keyboard shortcuts suppressed while modal is open. Screen reader announces dialog.
- [x] **Item 5:** Rows separated by 8px gaps. Visual rhythm feels intentional, not broken.
- [x] **Item 6:** Slogan in JetBrains Mono, gold at 35% alpha, with glow in dark mode. No glow in light mode. Animation engines still work correctly.

### Cross-cutting

- [x] All changes work in both dark and light mode
- [x] All changes respect `prefers-reduced-motion: reduce`
- [x] Mobile layout (320px-480px) does not overflow horizontally
- [x] All interactive elements have proper ARIA attributes
- [x] Focus indicators visible on all new interactive elements
- [x] No regression in existing copy/regenerate/mask/theme functionality

## Dependencies & Risks

**Risk: Header overflow on very small screens (320px)** — Three 44px buttons + gaps + padding = ~148px, which exceeds usable width on 320px screens. The `.site-header` has `flex-wrap: wrap` so the actions pill wraps below the logo. If the wrap looks awkward, reduce header button size to `40px` at 480px.

**Risk: Item 3 HTML restructuring** — Moving the badge into a new `.row-title-line` wrapper changes the DOM for all 5 rows. If any JS queries the badge by traversing from `.row-top`, it will break. The badge is `aria-hidden` with no JS listeners, so this should be safe — but verify.

**Risk: Slogan wrapping** — JetBrains Mono is ~15% wider than Space Grotesk. Long slogans may now wrap on mobile. This is cosmetic, not a bug.

## References

- Brainstorm: `docs/brainstorms/2026-02-17-ui-polish-pass-brainstorm.md`
- Mockups: `docs/mockups/dev-tld-options.html`, `docs/mockups/slogan-options.html`
- Prior plan (9 a11y fixes): `docs/plans/2026-02-17-fix-ux-ui-review-9-fixes-plan.md`
- Key files: `index.html`, `css/style.css`, `js/app.js`
