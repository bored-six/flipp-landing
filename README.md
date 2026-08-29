# Flipp — landing page

Marketing site for **Flipp**, an offline-first study app that turns the notes you
already wrote into a real exam paper.

It is a deliberately plain static site: three files, no framework, no build step,
no dependencies. `index.html`, `styles.css`, `script.js`.

## Design

The page borrows its materials directly from the app's own design tokens
(`src/theme/tokens.ts` in the Flipp repo) rather than inventing a second brand:

| Token | Value |
|---|---|
| Paper ground | `#FAF3E1` |
| Ink | `#27362B` |
| Accent (hero green) | `#5FD184` |
| Gold (streaks) | `#AC761C` |
| Coral (margin rule) | `#C24E38` |

**The page is a single light theme on purpose.** It does not follow
`prefers-color-scheme`. The warm paper is Flipp's identity and this page is a
first impression, so it stays paper for everyone; dark mode is a reading-comfort
feature and it belongs inside the app, which has its own. `:root` also declares
`color-scheme: light` so a visitor on a dark OS does not get auto-darkened
scrollbars or a dark canvas behind the page.

Type is the app's own trio — Patrick Hand for handwriting, Baloo 2 for headings,
Nunito for body copy. Every icon is a hand-built duotone SVG in the sprite at the
top of `index.html`; there is no icon font and no emoji anywhere on the page.

Two rules carried over from the app and worth keeping:

- **The mode cartridges sit on fixed pastel washes**, so text on them uses the
  cartridge's own `--ink` and never the page's text colour — the wash is the
  mode's identity, not a surface that follows the theme. (Same rule as the app,
  where a themed colour came out white-on-mint at night.)
- **Reduced motion is honoured properly** — all animation and the scroll reveal are
  switched off, not shortened.

## Run it

Any static server will do:

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>.

## Deploy

Deployed on Vercel as a static site — no build command, no output directory.
Pushing to `main` ships it.

## Honesty notes

The page makes no claim that cannot be checked in the app's source: there is no
account system, no analytics, no ad SDK and no payment code in Flipp, which is why
the page says so plainly. There are no store badges, invented review counts or
testimonials, and the roadmap line (browser today, Android in progress, iOS not a
current target) reflects the actual state of the project.
