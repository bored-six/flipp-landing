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

## Interactive parts

Three, all vanilla JS in `script.js`, all degrading to readable static content
when JS is off (`html.js` guards the reveal; see below):

- **The try-it panel** (`#try`) — a cut-down copy of the app's `noteParser`
  rules: `Term: meaning` becomes multiple choice when the subject offers enough
  other terms to borrow wrong answers from and identification when it does not,
  "X are A, B and C" becomes enumeration, a sentence with a number becomes
  fill-in-the-blank, and anything else factual becomes true or false. It runs
  entirely in the page — the panel says "nothing is sent anywhere" and that is
  literally true, which is the point.
- **The screenshot gallery** (`#screens`) — the real screens from
  `img/shots/`, preloaded on init so switching never flashes an empty phone.
- **The mastery slider** — drag to add notes to a subject and watch the
  percentage fall while the number you can answer stays at 36. That is the
  section's whole argument, made draggable instead of asserted.

The screenshots are genuine captures of the app running, resized to 780px wide.
The section says so explicitly, so they must never be replaced with mockups
without changing that line.

## Run it

Any static server will do:

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>.

## Deploy

Deployed on Vercel as a static site — no build command, no output directory.
Pushing to `main` ships it.

The site answers on two addresses:

| | |
|---|---|
| **https://flipphq.vercel.app** | the one to share, and the `canonical` |
| https://flipp-landing-nine.vercel.app | Vercel's auto-generated original, kept alive so links already sent still work |

Both point at the same production deployment. `og:url` and `og:image` are
absolute against the `flipphq` address, because most platforms will not resolve
a relative image when generating a share preview.

## Honesty notes

The page makes no claim that cannot be checked in the app's source: there is no
account system, no analytics, no ad SDK and no payment code in Flipp, which is why
the page says so plainly.

**Nib changed what is true here, and the page was corrected for it.** Flipp now
has exactly one server — `api/nib.ts`, a proxy that exists so the Gemini key never
ships inside the app — and pressing *Read these with Nib* sends that page of notes
to it. So the page no longer says "nothing leaves the phone", "Flipp has no server
of its own" or "entirely offline"; it says studying runs on the device and names
Nib as the single exception, including that Google may use free-tier data to
improve their models. That wording mirrors the app's own privacy card in
`src/app/settings.tsx`, which is the source of truth. **If the app's network
behaviour changes again, these claims must be re-checked before shipping.** There are no store badges, invented review counts or
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
