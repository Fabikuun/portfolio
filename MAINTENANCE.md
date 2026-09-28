# Notes for editing this site

These notes live in the repo so they're backed up. GitHub only shows `README.md` on the
repo's front page, so this file doesn't appear there.

## Ground rules

Four things that are easy to break without noticing.

1. JavaScript only adds motion. The classes that hide and reveal things (`.tile`, `.in`)
   are added by `script.js`, so with scripts off, or if the script fails to load,
   nothing is hidden. If I ever hide something with a class that's in the HTML from the
   start, that guarantee is gone.
2. Text colours are measured. Every text colour passes WCAG AA on its section: 4.5:1
   for normal text, and 3:1 for the chapter numbers, which count as large text. The
   closest ones have the measured ratio in a comment beside them in `style.css`. If I
   change a section colour, a glow or a text opacity, I measure again at the brightest
   point of the glow, since that's where contrast is lowest.
3. The main colours, spacing, radius and type sizes are tokens in `:root` at the top of
   `style.css`. Changing a token changes every place that uses it, so I check the list
   before adding a new value.
4. The site URL appears in four places: `<link rel="canonical">`, the Open Graph tags,
   `sitemap.xml` and `robots.txt`. `404.html` also uses absolute paths (`/portfolio/…`)
   because GitHub serves it from whatever URL was broken. If one changes, all of them
   change.

## Section colours

Each section's class sets its ground colour, its glow and the colour of its chapter
number. The glows alternate corners down the page.

| Class | Ground | Accent | Used on |
|---|---|---|---|
| `block-hero` | `#121212` with a green glow | muted white | Hero, Contact, 404 |
| `block-teal` | `#0C2A38` | sky `#2BB0D9` | About |
| `block-plum` | `#241038` | lavender `#A78BFA` | Education |
| `block-dark` | `#181818` | green `#1DB954` | Projects, Setup |
| `block-ochre` | `#2A1E08` | gold `#FFC942` | Skills |
| `block-forest` | `#0E2417` | green `#1ED760` | Elsewhere |

## Glass

Glass is only on things that float over the page or act as controls: the nav bar, the
phone menu, the parts-list button and the email panel. It's built from tokens at the top
of `style.css`:

- `--glass-bar` and `--glass-sheet` are the tints. They keep nav text at 4.5:1 or more
  even with pure white behind the glass, so don't make them lighter without measuring.
- `--glass-edge` is the rim light, `--glass-depth` the shadow, `--glass-filter` the blur.
- Browsers that can't blur, and anyone with reduced transparency or increased contrast
  turned on, get the same tokens set to solid glass. Changing a token covers all of them.

Only the nav bar and phone menu have a blur, because things move behind them. The button
and email panel sit on a flat ground, where a blur would cost something and show nothing.

The lens that marks the current section follows the nav's `href`s, so a new nav link
gets it automatically. The edge bending is `initRefraction()` in `script.js`: it only runs
in Chromium browsers, and it switches itself off on devices under 4GB of memory and when
reduced motion, reduced transparency or increased contrast is on.

## Browser support

The baseline is any browser with CSS variables: iOS 12 Safari, Firefox 52, old Edge.
To keep it that way:

- Fluid sizes use `clamp()` only inside the `@supports` block at the top. The plain
  values above it are what older browsers get.
- Any line using `env()` or `max()` comes after a plain line for the same property.
- Rows that wrap are spaced with margins, since older Safari has no flex `gap`.
  Grid `gap` is fine.
- Physical properties (`padding-top`, `margin-left`) instead of `padding-block` or
  `inset`.
- Hover styles go inside `@media (hover: hover)`, or a tap on a phone leaves them stuck.
- `script.js` stays plain ES5: `var`, `function`, no arrow functions or template strings.

## Writing

Before publishing new text, I check it against Wikipedia's
[Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing).
The ones that are easiest to slip into:

- Words like delve, pivotal, crucial, showcase, highlight, vibrant, seamless or robust.
- "Serves as" or "stands as" where "is" would do.
- "Not just X, but Y", "it's not X, it's Y" and "Y rather than X".
- Lists of three added for rhythm when there aren't really three things.
- Em dashes, bold lead-ins, title case headings and curly quotes.
- Sentences that end in "-ing" phrases about why something matters.

## Add a project

Copy a whole `<article class="project-row">` block in `index.html` and edit it. The CSS
needs no changes, because rows alternate sides on their own with `nth-child(even)`.

```html
<article class="project-row">
  <div class="project-media">
    <div class="spec-panel">
      <div class="spec-row"><span class="spec-key">Stack</span><span class="spec-val">…</span></div>
      <div class="spec-row"><span class="spec-key">…</span><span class="spec-val">…</span></div>
      <div class="spec-row"><span class="spec-key">Status</span><span class="spec-val">…</span></div>
    </div>
  </div>
  <div class="project-body">
    <h3>Project name</h3>
    <p class="project-desc">
      What it does, and what I specifically built. Concrete over impressive.
    </p>
    <div class="reflection">
      <span class="reflection-label">The hard part</span>
      <p>The thing that didn't work first, or the decision I'd change.</p>
    </div>
    <div class="project-links">
      <a href="https://github.com/…" target="_blank" rel="noopener noreferrer">Repository</a>
    </div>
  </div>
</article>
```

Keep the reflection block. It says what was hard or what I'd change, and that tells a
reader more than a feature list does.

Put the strongest project first. Most people read two entries and leave.

Past four or five projects, split the list. Keep the best few as full rows and move the
rest into a short list underneath:

```html
<h3 class="skills-sub">Also built</h3>
<ul class="project-compact">
  <li>
    <a href="https://github.com/…">Project name</a>
    <span>Java, Spring Boot</span>
    <span>2026</span>
  </li>
</ul>
```

```css
.project-compact { list-style: none; margin-top: 8px; }
.project-compact li {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 20px;
  align-items: baseline;
  padding: 16px 0;
  border-top: 1px solid rgba(250, 250, 250, 0.1);
}
.project-compact a { font-weight: 700; }
.project-compact a:hover { color: var(--green); }
.project-compact span { font-size: var(--fs-small); color: rgba(250, 250, 250, 0.6); }
@media (max-width: 600px) { .project-compact li { grid-template-columns: 1fr; gap: 4px; } }
```

Ten rows of equal weight make the best one count for less, which is the reason for the
split.

## Remove a project

Delete its `<article>`, then check two other places:

- The Skills section, where the `.proof-where` lines name projects ("FableOps, URL Shortener").
- The meta description in `<head>`, which names all three.

## Add an achievement

There's no achievements section yet. If one is worth adding, reuse the note card from the
Elsewhere section instead of building a new component.

Add it as its own section, for example between Skills and Elsewhere:

```html
<section id="achievements" class="block block-dark">
  <div class="block-inner">
    <h2 class="big-heading"><span class="chapter" aria-hidden="true">05</span><span>Worth mentioning</span></h2>
    <div class="note-grid">
      <div class="note-card">
        <span class="note-label">Where and when</span>
        <p>What it was, and what I actually did to get it.</p>
      </div>
    </div>
  </div>
</section>
```

Then:

1. Add `<li><a href="#achievements">Achievements</a></li>` to the nav.
2. Add a matching `.nav ul.open li:nth-child(8)` delay in `style.css`, so the new link
   animates in the mobile menu like the others.
3. Renumber the chapter numbers below it. They run 01–07 in order.
4. Pick a section class from the table above that differs from the sections on either side.

One test before adding anything here: would a stranger understand why it mattered without
me explaining? A course certificate usually fails that test, and a placement in something
competitive usually passes it. A thin achievements section is worse than none, because it
makes people wonder whether that's all there is.

## Edit education

Each entry is an `<li class="edu-row">` inside `.edu-timeline`. Copy one and change the
years, school name, qualification and tag. Newest goes first. Keep the tag short
(`In progress`, `Completed`).

Logos go in `images/` as a square 192px `.webp`, with a `.png` copy. The `alt` stays empty
because the school name is written right next to the logo.

## Update the parts list

The PC parts are in `#setup`, inside a `<details>` so they stay hidden until someone opens
them. Each part is one `.spec-row`. Use the full official product name.

## Typeface

`fonts/schibsted-grotesk.woff2` is the Latin subset of the variable font, weights 400 to
900, from Google Fonts. It's only switched on inside
`@supports (font-variation-settings: normal)`, so old browsers use the system font and its
real bold. Keep `fonts/OFL.txt` next to it, because the licence requires it to travel with
the font.

## Replace the portrait

There are six files in `images/`: three widths in two formats. To swap the photo,
regenerate all six at 340, 680 and 1020px wide, as both `.webp` and `.jpg`.

```python
from PIL import Image
im = Image.open('new-photo.jpg').convert('RGB')
for w in (340, 680, 1020):
    r = im.resize((w, round(w * im.size[1] / im.size[0])), Image.LANCZOS)
    r.save(f'images/profile-{w}.jpg', quality=82, optimize=True, progressive=True)
    r.save(f'images/profile-{w}.webp', quality=80, method=6)
```

Then check two things in `style.css`:

- `.portrait { aspect-ratio: 3 / 4 }` matches a portrait photo. Change it if the new one
  is a different shape.
- `.portrait img { object-position: 46% 18% }` keeps the face in frame when the photo is
  cropped square under 820px. Re-tune it for a new photo.

Never commit the original camera file. Photos belong in WebP or JPEG: the 257 KB PNG this
started as became a 40 KB WebP.

## Deploy

```bash
git add -A && git commit -m "…" && git push
```

GitHub Pages rebuilds on every push to `main`, which takes 30 to 60 seconds. The Actions
tab shows the "pages build and deployment" run.

Then hard-refresh with `Ctrl+Shift+R`. Pages serves `Cache-Control: max-age=600`, so a
normal reload can show a ten-minute-old stylesheet and make a change look like it didn't
deploy. This has already fooled me once.

## Checks worth running before a push

- Resize to 320px wide. Nothing should scroll sideways.
- Zoom to 200%. Text should reflow without clipping.
- Tab through the page. Every link and button should show a focus ring.
- Load `/portfolio/nonsense`. It should show the styled 404 page.
- Open the DevTools console. It should be empty.
- Look at it in Safari or Firefox as well as Chrome. Apart from the edge bending, which
  is Chromium only, the glass should look the same.
