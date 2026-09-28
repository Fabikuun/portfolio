# Fabian Mahdi

The source for my personal website, live at https://fabikuun.github.io/portfolio/

It covers my projects, education, the tools I work with, a bit about what I do outside of code, and a way to contact me.

## Projects on the site

- FableOps, a two-player co-op game in Java and libGDX that runs over a LAN. Three of us made it for a lab course, and I wrote the networking. [Demo video](https://youtu.be/o09a2ESUpiE), [repository](https://github.com/sadiaaurthy/NOX-SYNC).
- A URL shortener in Spring Boot, with click tracking and QR codes. [Live site](https://url-shortener-9mqs.onrender.com), [repository](https://github.com/Fabikuun/url-shortener).
- A hotel management system in C++, a terminal booking app from an OOP course. [Repository](https://github.com/ArefinMahim/Project_403).

## How it's built

Plain HTML, CSS and JavaScript, without a framework, build step or npm packages, so `index.html` opens straight in a browser.

The typeface is [Schibsted Grotesk](https://github.com/schibsted/schibsted-grotesk). The font file is in this repo, so the site doesn't request anything from Google or any other outside server.

- All the content is in the HTML, so the page can be read with JavaScript turned off. JavaScript adds the scroll animations, the mobile menu, the marker for the section you're reading, and the email form.
- Animations switch off if your device is set to reduce motion.
- Font sizes and spacing scale with the screen using `clamp()`, plus a few breakpoints for phones.
- Photos come in WebP with a JPEG fallback, in several sizes, so phones don't download the big versions.
- Each section has its own dark colour with a soft glow in a brighter shade. Every text colour was checked against WCAG AA at the brightest part of that glow.
- The nav, the mobile menu, the parts-list button and the email panel are liquid glass: a light blur, a rim lit from the top left and a soft shadow. A glass lens in the nav slides to the section you're reading. In Chrome, Edge and other Chromium browsers the glass also bends what passes behind its edges.
- Browsers that can't blur get solid glass, and so does anyone who has turned on reduced transparency or increased contrast.
- Every newer CSS feature has a fallback, so the layout holds all the way back to iOS 12 Safari and Firefox 52. Browsers too old for variable fonts get the system font, so headings stay properly bold.
- It prints in black on white.

## Files

| File | What's in it |
|---|---|
| `index.html` | All the page content |
| `style.css` | All the styles. Colours, font sizes and spacing are variables at the top |
| `script.js` | Scroll animations, mobile menu, section marker, glass refraction, email form |
| `images/` | My photo, my desk and the school logos |
| `fonts/` | Schibsted Grotesk and its licence (SIL Open Font License) |
| `404.html` | The page shown for broken links |
| `MAINTENANCE.md` | My notes on how to add or change things |

## Running it locally

```bash
git clone https://github.com/Fabikuun/portfolio.git
```

Open `index.html` in a browser. To serve it the way GitHub Pages does:

```bash
python -m http.server 8000
```

Then go to `http://localhost:8000`.

## Deploying

GitHub Pages serves the `main` branch. After a push, the site updates in about a minute.

## Contact

I'm on [GitHub](https://github.com/Fabikuun), [LinkedIn](https://www.linkedin.com/in/fabianmahdi-iut/) and [Discord](https://discord.com/users/729978334590664705).
