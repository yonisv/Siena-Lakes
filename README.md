# Siena Lakes — Landscape Enhancement Tour

An interactive, click-through tour of the Yellowstone Landscape enhancement plan for Siena Lakes (Naples North). Built as a companion to the live presentation deck — browse all 39 plants across the 6 planting zones, or run the auto-advancing Tour Mode to drive it live in a meeting.

**Live structure:**
- Home — menu of all 6 zones + "Start Tour" button
- Zone pages — photo grid for each zone's plants (click any plant for a larger detail view)
- Conclusion — recap of all 6 zones and the "cohesive design" message

No build step, no backend, no dependencies — just static HTML/CSS/JS.

## How to host this on GitHub Pages (free)

1. **Create a new repository** on GitHub (e.g. `siena-lakes-tour`). Public repos get free Pages hosting.
2. **Upload these files** to the repo, keeping the folder structure exactly as-is:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `data.js`
   - `images/` (the whole folder, all 39 `.jpg` files)

   Easiest way: on the repo page, click **Add file → Upload files**, drag in everything (including the `images` folder), then commit.

3. **Turn on Pages:**
   - Go to the repo's **Settings → Pages**
   - Under "Build and deployment," set **Source** to `Deploy from a branch`
   - Set **Branch** to `main` (or `master`) and folder to `/ (root)`
   - Click **Save**

4. **Wait about 1 minute**, then refresh that Settings → Pages screen — GitHub will show your live URL, something like:
   `https://yourusername.github.io/siena-lakes-tour/`

That link is shareable with anyone — no login needed, works on phone or desktop.

## Editing later

- **Plant data, text, specs:** edit `data.js` — it's a plain list of zones and plants, easy to read and change.
- **Photos:** replace any file in `images/` (keep the same filename, or update the `img:` field in `data.js` to match a new filename).
- **Colors/fonts:** all in `styles.css` at the top (`:root` variables) — change `--navy` / `--green` to update the whole site at once.
- **Tour Mode timing:** the `TOUR_SECONDS` constant at the top of `app.js` controls how many seconds each zone stays on screen before auto-advancing.
