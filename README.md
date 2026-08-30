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
testimonials, and the roadmap line (Android APK and browser today, iOS not a
current target) reflects the actual state of the project.

## The Android download

The **Download for Android** buttons serve the APK itself:

```
https://github.com/bored-six/flipp-landing/releases/download/v1.0.0/flipp-1.0.0.apk
```

**The APK is a GitHub Release asset and is deliberately not in this repo.** It is
95.7 MB — GitHub hard-blocks files over 100 MB, warns over 50 MB, and anything
committed stays in history forever, so every future build would add another
~95 MB to every clone. Release assets have a 2 GB limit, are CDN-backed, cost no
Vercel bandwidth, and GitHub already serves them with
`Content-Type: application/vnd.android.package-archive` and
`Content-Disposition: attachment`, so the browser downloads rather than displays.
`.gitignore` blocks `*.apk` and `*.aab` to keep it that way.

A second link points at the EAS build page, which shows a QR code — that is the
only sensible route for someone on a laptop, since a 95 MB APK on a computer is
no use without a way to move it across.

### Publishing a new build

```bash
gh release create vX.Y.Z path/to/flipp-X.Y.Z.apk --repo bored-six/flipp-landing
```

Then update the download URL in `index.html` (nav, hero, closing CTA, footer) and
the version and size in the hero note. Keep the note about Android asking you to
confirm the install — it is the first thing a sideloading visitor hits, and
without it the prompt reads as the app being broken.
