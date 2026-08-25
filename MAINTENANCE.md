# Maintenance notes

Notes to myself for editing this site. Lives in the repo so it's backed up and
visible in the file list, but GitHub only renders `README.md` on the landing
page — so this doesn't show up there.

---

## Ground rules

Four things that are easy to break without noticing.

**1. JavaScript only adds motion.**
Every animated class (`.tile`, `.in`, `.splitw`) is added by `script.js` at runtime.
With scripts off, nothing is hidden — the page just appears without the entrance.
If I ever write something that starts invisible *in the CSS*, that guarantee is gone.

**2. Opacity values are load-bearing.**
Several sit just above the WCAG AA contrast threshold, with the measured ratio in a
comment beside them, e.g. `opacity: 0.7; /* 6.2:1 — 0.55 measured 3.9:1 and failed AA */`.
If I darken a section background, re-measure the text on it. Don't eyeball it.

**3. Everything is a token.**
Colours, spacing, radius and type sizes live in `:root` at the top of `style.css`.
Change the token, not the usage. If I'm about to type a raw `px` or `rgba()` into a
rule, there's probably already a token for it.

**4. The site URL appears in four places.**
`<link rel="canonical">`, the Open Graph tags, `sitemap.xml`, and `robots.txt`.
`404.html` also uses absolute paths (`/portfolio/…`) because it gets served from
arbitrary URLs. Change one, change all of them.

---

## Add a project

Copy one whole `<article class="project-row">` block in `index.html` and edit it.
**No CSS changes needed** — rows alternate sides automatically via `nth-child(even)`.

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
    <p class="project-cat">Language · Framework · Kind of thing</p>
    <h3>Project name</h3>
    <p class="project-desc">
      What it does, and what I specifically built. Concrete over impressive.
    </p>
    <div class="reflection">
      <span class="reflection-label">The hard part</span>
      <p>The thing that didn't work first, or the decision I'd change.</p>
    </div>
    <div class="project-links">
      <a href="https://github.com/…" target="_blank" rel="noopener noreferrer">Repo →</a>
    </div>
  </div>
</article>
```

**Keep the reflection block.** It's the part that reads like an engineer rather than
a feature list, and it's the reason the cards work at all.

**Order by strength, not by date.** Most people read two entries and leave.

**Past four or five projects, split the list.** Keep the best few as full rows, and
drop the rest into a compact one-liner list underneath:

```html
<h3 class="skills-sub">Also built</h3>
<ul class="project-compact">
  <li>
    <a href="https://github.com/…">Project name</a>
    <span>Java · Spring Boot</span>
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
  border-top: 1px solid var(--hairline-strong);
}
.project-compact a { font-weight: 800; font-size: var(--fs-body-sm); }
.project-compact a:hover { color: var(--green); }
.project-compact span { font-size: var(--fs-label); color: rgba(250, 250, 250, 0.55); }
@media (max-width: 600px) { .project-compact li { grid-template-columns: 1fr; gap: 4px; } }
```

Ten equally-weighted rows makes the best one count for less. That's the whole reason
for the split.

## Remove a project

Delete its `<article>`. Then check:
- The **Skills** section — `.proof-where` lines name projects ("FableOps · URL Shortener").
- The **Ask me about** cards — some reference specific projects.
- The meta description in `<head>`, which names all three.

---

## Add an achievement

There's no achievements section yet. If one is worth adding, **don't invent a new
component** — reuse the education card, which is already the right shape for
"a thing with a title, a line of detail, and a status".

Add a section between Education and Beyond Code:

```html
<section id="achievements" class="block block-dark">
  <div class="block-inner">
    <p class="eyebrow">Ch. 05 — Achievements</p>
    <h2 class="big-heading">Worth mentioning</h2>
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
2. **Renumber the chapter eyebrows below it** — they run Ch. 01–06 in order.
3. Pick a `block-*` class that doesn't sit next to the same colour twice.

**One honest test before adding anything here:** would a stranger understand why it
mattered without me explaining? A course certificate usually fails that test. A
placement in something competitive usually passes it. An empty or thin achievements
section is worse than none — it invites the question "is that all?".

---

## Edit education

One card in `#education`. To add a second, duplicate `.edu-card` — the section has
room. Keep the tag text short (`In progress`, a year, `Completed`).

Don't add school or college. Once university is listed, pre-university education
stops carrying information for a technical reader and just pushes the projects
further down.

---

## Replace the portrait

Six files in `images/` — three widths, two formats. To swap the photo, regenerate all
six at 340 / 680 / 1020 px wide, as both `.webp` and `.jpg`.

```python
from PIL import Image
im = Image.open('new-photo.jpg').convert('RGB')
for w in (340, 680, 1020):
    r = im.resize((w, round(w * im.size[1] / im.size[0])), Image.LANCZOS)
    r.save(f'images/profile-{w}.jpg', quality=82, optimize=True, progressive=True)
    r.save(f'images/profile-{w}.webp', quality=80, method=6)
```

Then check two things in `style.css`:
- `.portrait { aspect-ratio: 3 / 4 }` — matches a portrait source. Change if the new
  photo is a different shape.
- `.portrait img { object-position: 46% 18% }` — keeps the face in frame when the
  square crop kicks in under 820px. Re-tune for a new photo.

Never commit the original camera file. PNG is the wrong format for a photograph —
the 257 KB PNG this started as became a 40 KB WebP.

---

## Deploy

```bash
git add -A && git commit -m "…" && git push
```

GitHub Pages rebuilds on push to `main`; it takes 30–60 seconds. Watch the **Actions**
tab for *pages build and deployment*.

**Then hard-refresh — `Ctrl+Shift+R`.** Pages serves `Cache-Control: max-age=600`, so
a normal reload can show a ten-minute-old stylesheet and make a change look like it
didn't deploy. This has already fooled me once.

---

## Checks worth running before a push

- Resize to 320px wide — nothing should scroll sideways.
- Zoom to 200% — text should reflow, not clip.
- Tab through the page — focus rings visible on every link and button.
- Load `/portfolio/nonsense` — should be the styled 404, not GitHub's grey one.
- DevTools console — should be empty.
