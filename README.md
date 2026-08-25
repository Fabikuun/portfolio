# Portfolio

**[fabikuun.github.io/portfolio](https://fabikuun.github.io/portfolio/)**

My portfolio. Three projects, what I actually did on each of them, and one honest
paragraph about how I work. No percentage bars, no invented metrics.

---

## Why there's no framework

There's no React here, no Tailwind, no build step, no `node_modules`. You clone this
and open `index.html` and it runs.

That was a deliberate choice and it did cost me something. A framework hands you focus
states, motion preferences and accessible markup for free; doing it by hand meant I had
to learn what those actually are. The scroll animations respect `prefers-reduced-motion`
because I wrote that branch myself. The contrast values are measured rather than guessed —
where a colour was borderline, the measurement is sitting in a comment next to it.

What I get in return: nothing here breaks because a package updated. In two years this
will still open.

---

## Running it locally

Double-click `index.html`. That genuinely is the whole process.

If you want it served the way GitHub Pages serves it:

```bash
python -m http.server 8000
```

Or the Live Server extension in VS Code — right-click `index.html` → *Open with Live Server*.

---

## What's in here

| | |
|---|---|
| `index.html` | Every word of content, as real HTML — not rendered by JavaScript |
| `style.css` | All styling. Design tokens live at the top in `:root` |
| `script.js` | Scroll reveals, the cursor dot, the progress rail, the mobile menu |
| `images/` | Portrait at three widths, WebP with JPEG fallbacks |
| `404.html` | GitHub Pages serves this for any URL that doesn't exist |

---

## Things worth knowing before editing

**JavaScript only adds motion.** Every animated class is applied by JS at runtime, so with
scripts disabled nothing is hidden — the page just appears without the entrance. If you add
something that starts invisible in CSS, you've broken that guarantee.

**The scroll reveal has a deliberate failure mode.** There's a 4.5-second safety net in
`revealOnce()`, but it only fires if something *already on screen* hasn't appeared — which
means the observer is broken. It won't blanket-reveal the page, because that would mean
everything below the fold finishes animating before you scroll to it. I made that mistake
once already.

**Colour opacity values are load-bearing.** Several sit just above the AA contrast threshold
with the measurement written beside them. If you darken a section background, re-check the
text on it rather than assuming it still passes.

**The site URL appears in three places.** `<link rel="canonical">`, the Open Graph and
Twitter tags, and `sitemap.xml`. `404.html` also uses absolute paths, since it gets served
from arbitrary URLs. Change one, change all of them.

---

## Adding a project

Copy one `<article class="project-row">` block in `index.html` and edit it. No CSS changes
needed — rows alternate sides automatically via `nth-child(even)`.

Two rules for future me:

- **Order by strength, not by date.** Most people read two entries and leave.
- **Past four or five projects, split the list.** Keep the best few as full rows and drop
  the rest into a compact one-line list. Ten equally-weighted rows makes the best one
  count for less.

---

## Deploying

Push to `main`. GitHub Pages picks it up — Settings → Pages → Source: `main` / `(root)`.

There's no pipeline, nothing to configure and nothing that can fail at build time,
because there is no build.
