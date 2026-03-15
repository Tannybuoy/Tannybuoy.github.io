# Tanya Gupta — Product Manager Portfolio

Personal portfolio website featuring a distinctive **LinkedIn Mode / UNHINGED Mode** toggle that switches all content between corporate-polished copy and candid PM humor.

**Live site:** [tannybuoy.github.io](https://tannybuoy.github.io)

## Features

- **Dual-mode toggle** — switch between professional LinkedIn Mode and irreverent UNHINGED Mode with a single click; preference persists via localStorage
- **Multi-page portfolio** — home, about, writings, and detailed project case studies
- **Project case studies** — in-depth pages for Danfoss, Harley-Davidson, MP1T, and Teams Chat
- **LEVIOSA 2048** — a custom 2048 game (easter egg / side project)
- **Easter eggs** — Konami code, toggle counter toast, random PM quotes
- **Responsive design** — mobile-first layout with breakpoints at 480px, 768px, and 1024px
- **Accessibility** — semantic HTML5, ARIA attributes, keyboard navigation, screen reader support

## Tech Stack

- HTML5, CSS3 (Custom Properties), Vanilla JavaScript (ES5)
- No build system or package manager — pure static site
- Third-party libraries vendored in `/lib/`
- Hosted on GitHub Pages (auto-deploys on push to `main`)

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Landing page with hero, projects grid, and contact |
| About | `about.html` | Product philosophy, approach, and background |
| Writings | `writings.html` | Articles and posts on product management |
| LEVIOSA 2048 | `game.html` | Custom 2048 game |
| Project: Danfoss | `projects/danfoss.html` | Danfoss case study |
| Project: Harley-Davidson | `projects/harley-davidson.html` | Harley-Davidson case study |
| Project: MP1T | `projects/danfoss-mp1.html` | Danfoss MP1T case study |
| Project: Teams Chat | `projects/teams-chat.html` | Microsoft Teams Chat case study |

## Local Development

No build step required. Open `index.html` in a browser or use any local server:

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .
```

## License

Theme originally based on [DevFolio](https://bootstrapmade.com/devfolio-bootstrap-portfolio-html-template/) by BootstrapMade. Heavily customized.
