# Portfolio

My personal website, live at **https://fabikuun.github.io/portfolio/**

It covers my projects, education, the tools I work with, a bit about what I do outside of code, and a way to contact me.

## Projects on the site

- **FableOps**: a two-player co-op game in Java and libGDX, played over a LAN. I wrote the networking.
- **URL Shortener**: a Spring Boot app with click tracking and QR codes. [Live](https://url-shortener-9mqs.onrender.com) · [Repo](https://github.com/Fabikuun/url-shortener)
- **Hotel Management System**: a C++ terminal booking system from an OOP course.

## How it's built

Plain HTML, CSS and JavaScript. There's no framework, no build step and no npm packages, so `index.html` opens straight in a browser.

The typeface is [Schibsted Grotesk](https://github.com/schibsted/schibsted-grotesk), a variable font hosted in this repo rather than loaded from Google, so the site makes no third-party requests.

- All the content is written in the HTML, so it's readable with JavaScript turned off. JavaScript adds the animations, the mobile menu and the email form.
- Animations switch off if your device is set to reduce motion.
- Font sizes and spacing scale with the screen using `clamp()`, plus a few breakpoints for phones.
- Photos come in WebP with a JPEG fallback, in several sizes, so phones don't download the big versions.
- Colour contrast was checked against WCAG AA.
- The nav, mobile menu and email panel use a frosted glass look, with a solid fallback for browsers that can't blur and for anyone who has reduced transparency turned on.
- Browsers too old for variable fonts get the system font instead, so headings stay properly bold.

## Files

| File | What's in it |
|---|---|
| `index.html` | All the page content |
| `style.css` | All the styles. Colours, font sizes and spacing are variables at the top |
| `script.js` | Scroll animations, cursor dot, progress bar, mobile menu, email form |
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

[GitHub](https://github.com/Fabikuun) · [LinkedIn](https://www.linkedin.com/in/fabianmahdi-iut/)
