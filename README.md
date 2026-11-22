# PrismoraWebs

Cinematic monochrome portfolio for PrismoraWebs, running on **Cloudflare Workers**.

* Public site: `/` · Rooms: `/work/<slug>` · Legal hub: `/legal`
* Legal documents: `/privacy-policy`, `/terms-and-conditions`, `/cookie-policy`, `/refund-policy`, `/disclaimer`, `/accessibility`
* **Private admin: `/control-of-the-website`** (server-side login, edits go live for everyone)
* Contact form -> your inbox through **SMTP** (Gmail or any provider)

## How it is secured
* Admin login requires **3-factor credentials**:
  1. **Admin Email** (`ADMIN_EMAIL`, default `prismorawebs@gmail.com`).
  2. **Admin Password** (`ADMIN_PASSWORD`, secret passphrase).
  3. **Time-Based Clock Security Code**: 4-digit code matching the current 24-hour clock time (HHMM, e.g. 09:59 → `0959`, 18:49 → `1849`). Automatically syncs with your clock with minute-drift grace period.
* Login: constant-time checks on all credentials, 5 tries / 15 min / IP, signed **15-day** `HttpOnly; Secure; SameSite=Strict` session cookie (or until manual sign-out).
* Every write needs the session cookie **and** a same-origin custom header (CSRF protection).
* Strict Content-Security-Policy, HSTS, `X-Frame-Options: DENY`, `nosniff`, no-referrer-downgrade, permissions policy.
* Admin page is `noindex` and never cached. The old `/admin` URL returns 404.
* Contact form: honeypot, minimum-time check, 5 messages / hour / IP, size limits, header-injection protection.
* SMTP can be configured directly inside the Admin Panel UI (saved to database), eliminating the need to set Cloudflare Worker environment variables manually.
* Multi-recipient support: `CONTACT_TO` allows multiple Gmail/email recipients separated by commas or semicolons to receive website enquiries simultaneously.

## Files
```
wrangler.jsonc    Worker config (assets + KV binding "CONTENT")
src/worker.js     API, auth, security headers
src/smtp.js       SMTP client (Cloudflare TCP sockets)
public/           the website (index.html, style.css, app.js, admin.js, content.js, favicons)
test/             SMTP test (npm test)
```

## Deploy (GitHub -> Cloudflare)
1. Push this repo to GitHub (keep the folders).
2. Cloudflare -> Workers & Pages -> Create -> **Import a repository**.
   Name `prismorawebs`, build command empty, deploy command `npx wrangler deploy`.
   The KV namespace is created automatically on first deploy.
3. Worker -> **Settings -> Variables and Secrets** -> add these as **Secret**:

| Name | Value |
|---|---|
| `ADMIN_PASSWORD` | a long passphrase (14+ chars) |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `465` (or `587`) |
| `SMTP_USER` | `prismorawebs@gmail.com` |
| `SMTP_PASS` | Gmail **App password** (16 chars) |
| `CONTACT_TO` | where enquiries arrive (optional, defaults to SMTP_USER) |
| `SMTP_FROM_NAME` | optional, default `PrismoraWebs` |

   Gmail app password: turn on 2-Step Verification, then https://myaccount.google.com/apppasswords
4. Worker -> Settings -> Domains & Routes -> Add -> **Custom domain** -> `prismora.space`.
5. Open `https://prismora.space/control-of-the-website`, sign in, then *Email (SMTP) & security* -> **Send test email**.

## Local development
**Termux / phone / any computer with Node 20+ (no install needed):**
```
cp .dev.vars.example .dev.vars   # then edit it: nano .dev.vars
npm run local                    # http://localhost:8788  (admin: /control-of-the-website)
```
This runs the same Worker code in plain Node.js. Admin edits are saved in `.local-kv.json` (git-ignored).

**With Wrangler (laptop only; not supported on Termux):**
```
npm install
npm run dev
```
`npm test` runs the SMTP client test.


## The doors and 3D rooms
Below the About section there is a wall of doors ("Magic happens behind the doors"). **Each door = one website.**
* Desktop: hover a door -> its lamp lights and the description floats beside it until you click -> the door opens and you enter.
* Phone: first tap lights the lamp and shows the description, second tap enters.
* Inside (`/work/<slug>`) is an interactive 3D room for that one website: drag to look around, scroll/pinch to zoom,
  click the framed screenshot or the laptop for full screen, click the lamp to switch the light, use the bottom bar to jump to
  Screen / About / Functions / Stack / Exit.
* Edit everything in the admin under **Doors & rooms**: name, plate text, colour, hover bullets, description, functions, tech stack,
  facts, live link and the **website photo** (upload; it is resized and stored in Cloudflare KV). Add or delete doors freely
  (even down to one). The `slug` is the page address.


## Editing the hero background and the "humans"
Admin -> **Hero**: background colour, optional second colour (gradient), background image upload, darkness overlay (0–80),
text colour (dark/light) and show/hide the silhouette. Upload a **Person image** (a transparent PNG cut-out works best) to replace the silhouette.
Admin -> **About**: upload a photo for each founder (shown next to their name) and an optional **Spotlight image** that replaces the glowing figure.
Admin -> **Team (the humans)**: portrait cards for the three founders (photo, role, bio).
Uploaded images are resized in the browser and stored in Cloudflare KV; they are served from `/api/image/...`.


### Hero team photo + Minecraft name tags
The hero shows the team photo (`public/hero-team.webp`, white background converted to transparency so it blends with any hero colour).
Hover a person (desktop) or tap a person (phone) to see a Minecraft-style tag above their head with name, role and a short description.
Edit it in Admin -> Hero -> **People**: name, role, description, and where the tag/hover area sits (percent of the image).
To use another photo, upload it under **Person image** (transparent PNG/WebP works best) and adjust **People** positions + **Person image width ÷ height**.


## Light / dark theme: the pull-cord lamp
A brass lamp hangs in the top-right corner. Drag its cord down (or tap it on a phone) and the whole site switches between light and dark.
The cord is a real Verlet rope simulation (gravity, damping, bending stiffness and a spring-loaded pull chain) in `public/lamp.js`;
the lamp clicks, the bulb goes on/off and the choice is remembered in the browser. Keyboard users get a hidden "Switch theme" button.
All dark-theme colours live at the end of `public/style.css` (`html[data-theme=dark] ...`).

## Featured websites (warped cards)
Replaces the old "Meet the humans" section. A curved/warped card carousel built on `<canvas>`; every card is one of the websites from
**Doors & rooms** (photo or generated preview). Drag or use the arrows; click the centre card (or "Enter the room") to open that website's 3D room.
Edit the heading/hint under Admin -> Featured websites.

## Home page sections (all editable in the admin)
Hero · About (2D animated) · Doors (3D rooms) · Journey · Marquee · Why us · Featured websites · Stats · How we work · Packages ·
Reviews (hidden until you add real ones) · Toolkit · Services · FAQ · Call to action · Footer.
All project sections use ONE list: Admin -> **Doors & rooms**. Add your real websites there (name, link, description, functions,
tech, photo) and they appear in the doors, the featured carousel and as their own 3D room. The first entry is SlayerNodes — add its
live link, description and a screenshot.

## SEO and site files (generated by the Worker)
`/robots.txt`, `/sitemap.xml` (includes every room), `/.well-known/security.txt`, `/humans.txt`, canonical + Open Graph/Twitter tags,
JSON-LD (Organization, WebSite, FAQ) and a real `404` status for unknown URLs. The admin URL is never listed anywhere
(it is `noindex` and not in robots.txt).
After going live, add the site in Google Search Console and submit `https://prismora.space/sitemap.xml`.

## Legal documents
Privacy, Terms, Cookies, Refund & Cancellation, Disclaimer and Accessibility are linked from the footer and from `/legal`.
They are general templates — have a lawyer review them. Edit them in the admin under **Legal pages**.

## Editing text
Either use the admin panel (saved in KV, live immediately) or edit `public/content.js` and push.
Admin edits override `content.js` for the parts you change; "Discard"/delete the KV key to fall back.

## Legal pages
The Privacy Policy, Terms and Cookie Policy are general templates. Have a lawyer review them for your situation.
