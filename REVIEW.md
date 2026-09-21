# Code review — Khondokar Yuvraz portfolio

**Scope:** `index.html` (874 lines), `styles.css` (816), `script.js` (102).
**Ground rule followed:** nothing you can *see or read* was changed — no copy, layout, colour, spacing, animation or asset path. The refreshed files are drop-in replacements. Everything that would change the look or content is listed in section 2 and left untouched.

Not verified: I had no browser in my environment and the images/fonts weren't uploaded, so I checked equivalence by parsing the DOM and diffing every CSS rule rather than by screenshot. Open the page once before deploying.

---

## 1. Applied (invisible to visitors)

**Bugs fixed**
| # | File | Issue | Fix |
|---|------|-------|-----|
| 1 | index.html | AGI card had `data-category="industry"`; filter compares with `"Industry"`, so the card **vanished** when "Industrial Conglomerates" was selected | Corrected the value |
| 2 | index.html | Stray `</div>` closing About; missing `</div>` closing the Testimonials `.wrap` (browser silently repaired both) | DOM is now well-formed (verified by parser) |
| 3 | script.js | Theme applied at the bottom of `<body>` → dark-mode users saw a light **flash** on every load | Tiny inline script in `<head>` sets `data-theme` before first paint |
| 4 | script.js | On a non-JSON error response, `response.json()` threw and the user saw "Network error" (misleading) | Parse is guarded; real failure message is shown |
| 5 | script.js | After one success, later errors kept the green success colour | Colour reset on error |
| 6 | script.js | File header said "contact form mailto"; it's Formspree | Comment corrected |
| 7 | index.html | Favicon data-URI had raw `<`, `>` and a space | Percent-encoded |

**Accessibility (no visual effect)**
- Duplicated marquee sets (28 logos) are `aria-hidden` with empty `alt`, so screen readers no longer read every brand twice (one duplicate also had the wrong alt, "EDOTCO" on Aftab).
- Decorative SVGs get `aria-hidden`; `<nav>` labelled; mobile menu button exposes `aria-expanded`/`aria-controls`; form status is an `aria-live` region; `autocomplete` on name/email.

**Performance**: `loading="lazy"` on badges and testimonial avatars (they were the only below-the-fold images without it).

**Maintainability**
- 14 inline-style blocks (≈70 attributes incl. 56 on marquee logos) moved to CSS classes with **identical values**.
- Inline `<script>` for project filters merged into `script.js`; one IIFE, null-guarded, no globals.
- Scroll-reveal now toggles classes (`.reveal` / `.is-visible`) instead of writing inline styles.
- CSS: removed dead rules (`.brand .mark`, `.monogram`, `.ledger-top`, `.icon-btn`, `.hero-socials`, `.cert-note`, `.proj-card .client`, `.brand-chip .x`, all `body.dark …` selectors — the JS only ever sets `[data-theme]`), unused variables, duplicate keyframes, and every unnecessary `!important` (specificity already won). Two undefined-variable fallbacks (`--primary-color`, `--accent`) collapsed to `--brass`. Formatted consistently; system-font fallback added after Inter.
- Bare `&` escaped to `&amp;`.

---

## 2. Found but NOT changed — needs your decision

### High
1. **Asset-path casing will break on Linux hosting** (GitHub Pages, Netlify, Vercel). The same folder is referenced as `./brands/normal/…`, `./Brands/normal/…` and `./Brands/dark/…`; the DigiGO card uses `./brands/normaL/Digigo.png` while the marquee uses `DigiGO.png`. It works on Windows/macOS only by accident. Pick one casing (lower-case is standard) and rename the folder/files to match. Dark-mode files named `grayscale-image (8).png` are also fragile — rename to `edotco-dark.png` etc.
2. **Testimonials — content problems.**
   - Nafiz Nihan and Sazzadur Sohag have **word-for-word identical text**, and it refers to "Yuvraz *Khandakar*" (elsewhere *Khondokar*). One of them is a copy-paste placeholder; a recruiter comparing them will notice.
   - Tahmina Tahrim Esty's role line repeats "IT Project Manager" twice (company missing).
3. **Certifications section**
   - Every Credly tile still carries `badge-tile--template`, which renders them at **55 % opacity** (its own comment says to delete that class).
   - "Communications Specialist" and "Fundamentals Training" point to the **same Credly URL** (`…9fe40432…`).
   - "Data Science with Simplilearn" appears **twice** (same image; one links to a Coursera URL).
   - Several cards use `<a href="#" target="_blank">` — they open a new tab of the same page. Use `<div>` where there is no credential link.
4. **Broken/generic links:** contact-section LinkedIn → `https://www.linkedin.com/` (the hero uses your real profile); Twitter/X → `https://twitter.com/`. `mailto:` links have `target="_blank"` (can leave an empty tab).

### Medium
5. **Mobile layout bugs** (the desktop layout is fine):
   - Services grid is 3 columns on phones — its 1-column media query is defeated by the inline style that used to be there.
   - `.cert-grid` is a fixed 4 columns at every width.
   - Philosophy cards: 3 columns with 3 rem numerals at 375 px.
   - Hero stats: `3 × minmax(120px)` + gaps exceeds a 375 px screen and `.hero { overflow:hidden }` clips the third stat.
   Ready-made fixes are in a **commented block at the bottom of `styles.css`** — uncomment to opt in.
6. **Section numbers and order disagree:** DOM order is About 01 → Services **04** → Projects **03** → Experience **02** → Certs 05 → Testimonials 06. Mobile menu order differs from the desktop nav, and Testimonials isn't in either.
7. **Card hover-lift never works.** The reveal script forced `transform: translateY(0)` inline, which beat `:hover { transform }` on project, service, badge, cert, quote and education cards (and replaced their own transitions). I preserved this behaviour deliberately. To restore the intended hover: in `initScrollReveal`, remove `reveal`/`is-visible` from the element on `transitionend`.
8. **Marquee never pauses on hover** — a `!important` rule cancelled the pause. I kept the net behaviour. A moving element with no pause control fails WCAG 2.2.2; consider re-enabling pause on hover/focus.
9. **Contrast:** `--stone` (#8C8574) on the light paper is **2.98 : 1** (2.68 : 1 on raised cards); it's used for 12–13 px text (dates, labels, GPA). AA needs 4.5 : 1. Dark theme passes (5.95 : 1).

### Low / roadmap
- Add `og:*`/Twitter-card tags, `theme-color`, canonical URL and JSON-LD `Person` — this is a personal-brand page and currently previews poorly when shared.
- Add `width`/`height` to images to stop layout shift; consider self-hosting the three font families (fewer third-party hops, better privacy).
- Formspree: add a hidden `_gotcha` honeypot field for spam.
- Email and phone are in plain text and get scraped; acceptable for a portfolio, but be aware.
- Add a skip-to-content link.
- Architecture: the page is 100 % hand-duplicated markup (28 marquee chips, 10 project cards, 12 credentials, 6 quotes). Moving those to a small data file + template (Eleventy/Astro, or a ~20-line JS renderer) would remove the class of copy-paste errors above (#2, #3, and the casing bug in #1).
