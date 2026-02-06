# CLAUDE.md

This file provides context for AI assistants working on this repository.

## Project Overview

Personal portfolio website for Tanya Gupta, a Product Manager. The site features a distinctive **LinkedIn Mode / UNHINGED Mode** toggle that switches all content between corporate-polished copy and candid PM humor. Hosted on GitHub Pages at `tannybuoy.github.io`.

## Tech Stack

- **HTML5** (semantic, accessible markup)
- **CSS3** with CSS Custom Properties for theming
- **Vanilla JavaScript** (ES5-compatible, no transpilation)
- **No build system** — pure static site, no npm/webpack/bundler
- **No package manager** — all libraries vendored in `/lib/`
- **Hosting** — GitHub Pages (auto-deploys on push to main)

## Directory Structure

```
/
├── index.html              # Main portfolio page (primary entry point)
├── blog.html               # Secondary blog page (uses legacy template)
├── css/
│   ├── portfolio.css       # Main stylesheet (active, custom)
│   ├── style.css           # Legacy template stylesheet (used by blog.html)
│   └── style-*.css         # Legacy color variants (unused by index.html)
├── js/
│   ├── portfolio.js        # Main JS — toggle, interactions, easter eggs
│   └── main.js             # Legacy jQuery script (used by blog.html)
├── lib/                    # Vendored third-party libraries (Bootstrap, jQuery, etc.)
├── img/                    # Images and assets
├── contactform/            # Contact form JS (no backend — PHP not included)
└── *.pdf                   # Resume, certifications, project docs
```

## Key Files

| File | Purpose |
|------|---------|
| `index.html` | Main portfolio — all sections, dual-mode content, navigation |
| `css/portfolio.css` | Complete custom stylesheet with CSS variable theming |
| `js/portfolio.js` | All interactivity: mode toggle, hamburger menu, scroll effects, easter eggs |
| `blog.html` | Legacy template page — uses `style-red.css` + `main.js` |
| `js/main.js` | Legacy jQuery-based script for blog page |

## Architecture & Patterns

### Dual-Mode Toggle System

The core feature is a LinkedIn/UNHINGED mode switch. It works via:

1. **CSS class on `<body>`**: `body.unhinged` activates UNHINGED mode
2. **CSS Custom Properties**: `:root` defines LinkedIn defaults; `body.unhinged` overrides them
3. **Dual content spans**: Every text element has both versions:
   ```html
   <span class="text-linkedin">Professional text</span>
   <span class="text-unhinged">Unhinged text</span>
   ```
4. **CSS visibility**: `.text-unhinged` is hidden by default; `body.unhinged .text-unhinged` shows it (and hides `.text-linkedin`)
5. **localStorage persistence**: Mode saved under key `pm-portfolio-mode`

### JavaScript Patterns

- **IIFE wrapper** — `(function() { 'use strict'; ... })();`
- **ES5 syntax** — `var`, `for` loops, no arrow functions (browser compatibility)
- **DOM caching** — Elements grabbed once at top of IIFE
- **Throttled scroll handlers** — Custom `throttle()` utility
- **Graceful degradation** — `try/catch` around localStorage calls

### CSS Conventions

- CSS Custom Properties for all colors, spacing, shadows, typography
- Mobile-first responsive design with breakpoints at **1024px**, **768px**, **480px**
- `clamp()` for fluid typography
- Transitions on interactive elements
- `prefers-reduced-motion` and `prefers-color-scheme` media query support
- Print styles included

### Accessibility

- Semantic HTML5 elements (`<nav>`, `<section>`, `<footer>`)
- ARIA attributes: `role="switch"`, `aria-checked`, `aria-expanded`, `aria-label`, `aria-live`
- Screen reader announcements on mode change
- Keyboard-navigable
- Focus-visible styles

## Easter Eggs

- **Toggle counter**: After 6 mode toggles, a toast notification appears
- **Konami code**: `Up Up Down Down Left Right Left Right B A` triggers "Maximum Unhinged Mode" (screen shake, tilted cards)
- **Random PM quotes**: UNHINGED footer shows a random satirical PM quote on each toggle

## Development Workflow

### Making Changes

1. Edit HTML/CSS/JS files directly — no build step required
2. Open `index.html` in a browser to preview (or use a local server)
3. Test both LinkedIn and UNHINGED modes after any content or style change
4. Test responsive behavior at mobile (480px), tablet (768px), and desktop widths

### Adding New Content

- **New section**: Add `<section>` in `index.html` with both `.text-linkedin` and `.text-unhinged` spans for all user-visible text
- **New project card**: Follow existing `.project-card` structure in the projects grid (currently capped at 4 cards)
- **New skill**: Add a `.skill-item` div inside `.skills-grid`

### CSS Changes

- Use existing CSS Custom Properties from `:root` — don't hardcode colors
- If adding UNHINGED-specific styling, put overrides under `body.unhinged` selector
- Follow the existing section-based organization in `portfolio.css`

### JavaScript Changes

- Add code inside the existing IIFE in `portfolio.js`
- Use ES5 syntax for compatibility (no `let`/`const`, no arrow functions, no template literals)
- Cache DOM elements at the top of the IIFE
- Throttle any scroll or resize handlers

## Git Conventions

- Feature branches with PRs merged to main
- Descriptive commit messages focused on what changed and why
- PRs used for all changes (even small ones)

## What NOT to Modify

- `/lib/` — Vendored third-party libraries; don't edit these files
- `blog.html`, `js/main.js`, `style.css`, `style-*.css` — Legacy template files; the active site uses `index.html` + `portfolio.css` + `portfolio.js`
- PDF files in root — Personal documents, not part of the site build

## Testing Checklist

Since there is no automated testing, manually verify:

- [ ] LinkedIn mode renders correctly (default state)
- [ ] UNHINGED mode renders correctly (toggle on)
- [ ] Toggle persists across page reload (localStorage)
- [ ] Mobile hamburger menu opens/closes properly
- [ ] Smooth scroll works for all nav links
- [ ] Back-to-top button appears on scroll
- [ ] All contact links point to correct URLs
- [ ] Responsive layout at 480px, 768px, 1024px+ breakpoints
- [ ] Accessibility: keyboard navigation, screen reader announcements
