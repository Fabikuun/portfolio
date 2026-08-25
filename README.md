# Portfolio

**[fabikuun.github.io/portfolio](https://fabikuun.github.io/portfolio/)**

The source for my personal site. Three projects, what I actually did on each,
and a short section about how I work.

---

## Built with nothing

No React, no Tailwind, no bundler, no `node_modules`. Clone it, open `index.html`,
and it runs — there is no install step and no build step.

That was a deliberate choice, and it wasn't free. A framework hands you focus states,
motion preferences and accessible markup for nothing; doing it by hand meant learning
what those actually are:

- **Works without JavaScript.** Every animated class is added at runtime, so with
  scripts blocked the page renders in full — it just skips the entrance.
- **Respects `prefers-reduced-motion`** and `prefers-reduced-transparency`.
- **Colour contrast is measured, not guessed.** Where a value sits close to the
  WCAG AA threshold, the measured ratio is in a comment beside it.
- **Responsive by construction.** Type, spacing, radius and layout are driven by
  `clamp()` and `min()`, so there are no device-width breakpoints to maintain.
- **One image, three widths, two formats.** The browser downloads exactly one —
  usually a 40 KB WebP.

What it buys me: nothing here breaks because a package updated. It will still
open in five years.

---

## Stack

`HTML` · `CSS` · `JavaScript` — and that's the whole list.

| | |
|---|---|
| `index.html` | All content, as real HTML — not assembled by JavaScript |
| `style.css` | All styling. Design tokens are at the top in `:root` |
| `script.js` | Scroll reveals, cursor dot, progress rail, mobile menu |
| `images/` | Portrait in WebP and JPEG, three widths each |
| `404.html` | Served by GitHub Pages for unknown URLs |

Hosted on GitHub Pages, deployed by pushing to `main`.

---

## Running it locally

```bash
git clone https://github.com/Fabikuun/portfolio.git
```

Then open `index.html`. That genuinely is the whole process.

To serve it the way GitHub Pages does:

```bash
python -m http.server 8000
```

---

## Contact

[GitHub](https://github.com/Fabikuun) · [LinkedIn](https://www.linkedin.com/in/fabianmahdi-iut/)
