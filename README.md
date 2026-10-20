# ExamGoEasy Landing Page (v2, Premium)

A "Coming Soon" landing page for **ExamGoEasy (EGE)** with a live countdown to launch.

- **Launch date:** 15 February 2027, 12:00 AM IST (14 Feb 2027, 18:30 UTC)
- **Version:** 2 (premium redesign). Version 1 was a bright blue-purple style with particles and floating objects.
- **Style:** Premium Light, inspired by what Stripe, Linear and Vercel do: calm, precise, lots of white space, quiet motion.
- **Built with:** plain HTML, CSS and JavaScript. No framework, no libraries, no build step.
- **Last updated:** 20 October 2026

---

## 1. Why v2 looks different (research summary)

Before the redesign we read about 70 pages on 2026 design trends, premium sites, coming-soon pages, edtech sites and animation speed. The main lessons we used:

1. **Premium = restraint.** Fewer elements, steady spacing, clear type sizes, few colors, small well-timed motion.
2. **Light headline weight.** Stripe-style light headlines feel confident without shouting. v1 was too heavy.
3. **Navy instead of black**, tinted blue shadows, thin hairline borders, a little noise texture on gradients.
4. **Show the product early.** The hero now has a realistic exam screen.
5. **Bento grid** for features (6 tiles of different sizes).
6. **A coming-soon page has one job:** collect emails. The email box is now in the hero, with only one field.
7. **Trust matters in edtech:** honest FAQ, clear audience, product preview labelled as a preview.
8. **Motion rules:** animate only `transform` and `opacity`, keep it short, support "reduce motion", keep the page fast.

---

## 2. Files

| File | What it does |
|---|---|
| `index.html` | Page structure and all the text |
| `style.css` | Colors, fonts, layout, animations, mobile design |
| `script.js` | Countdown, scroll effects, hover effects, email forms |
| `README.md` | This guide |

Keep all files in the **same folder**.

---

## 3. How to run

1. Open the folder in VS Code.
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click `index.html` and choose **Open with Live Server**.

Opening `index.html` by double-click may stop the internet-time check, so use Live Server or real hosting. The page needs internet for the countdown and for the Google Font (Inter).

---

## 4. Page sections (top to bottom)

1. **Progress bar + navbar:** thin line at the very top that fills while scrolling. Sticky glass navbar with links and a "Get early access" button.
2. **Hero:** "Launching 15 February 2027" pill, light-weight headline, short text, **email box**, **countdown**, and a large **product preview** (mock exam screen).
3. **Audience strip:** "Being built for" schools, coaching institutes, universities, companies.
4. **The problem:** editorial layout. Sticky title on the left, 4 numbered problems on the right.
5. **What we are building (bento grid):** 6 tiles with small animations.
6. **How it will work:** 3 steps (Create, Conduct, Check).
7. **FAQ:** 5 questions in simple open/close rows.
8. **Join section:** dark navy section with the second email box.
9. **Footer:** logo and copyright. The year updates by itself.

---

## 5. Design system

### Colors (in `style.css`, at the top, under `:root`)

Three core colors plus neutrals. Do not add more colors unless needed.

| Name | Code | Used for |
|---|---|---|
| `--navy` | `#0b1030` | Text, headings, logo box, join section (used instead of pure black) |
| `--accent` | `#5b4bff` | Violet-blue. Buttons, links, highlights, numbers, active states |
| `--bg` | `#f8fafd` | Page background (soft off-white, not pure white) |
| `--surface` | `#ffffff` | Cards, product window, form |
| `--tint` | `#eef0ff` | Light violet background for chips and answered questions |
| `--text-2` | `#4b5578` | Normal body text |
| `--text-3` | `#7c86a8` | Small and quiet text, labels |
| `--line` | `rgba(11,16,48,.08)` | Thin hairline borders |
| `--ok` | `#12b76a` | Green for "live" dot, tick marks, sample score |

Extra colors used in small places:
- Hero glow orbs: violet `rgba(91,75,255,.30)`, sky blue `rgba(120,170,255,.34)`, lavender `rgba(196,170,255,.28)`
- "Review" question color: `#fff4d6` (soft yellow) with `#a15c00` text
- Footer: `#070a22`

**To change the brand color:** edit `--accent`. Also search for `91, 75, 255` and `91,75,255` in `style.css` and `script.js` (glow, shadows, orbs) and change them to the new color's RGB.

### Shadows (blue-tinted, layered)
- `--shadow-sm`, `--shadow-md`, `--shadow-lg` for small, medium and large depth. They use `rgba(50,50,93,...)` so shadows look cool and soft, not grey.

### Font
**Inter** from Google Fonts (weights 300 to 700), loaded in the `<head>` of `index.html`.
- Headlines: **weight 300 (light)**, tight letter spacing (`-0.04em`), sizes fluid with `clamp()`.
- Highlighted headline words: weight 400 with a violet gradient.
- Body: weight 400, line height 1.65.
- Small labels: uppercase, wide letter spacing, weight 600.

### Shape and spacing
- Radius: `--r-sm` 10px, `--r-md` 16px, `--r-lg` 24px. Buttons and form are fully round.
- Page width: max 1160px, centered, 20px side space on small screens.
- Section spacing: `--section-y` = 96px to 160px (fluid). White space is intentional.
- Icons: one style only (thin 1.6px line icons, inline SVG). No emoji.

### Texture
- Hero has a very light **noise texture** (SVG turbulence, 7% opacity) and faint **vertical grid lines** that fade out. Both are in `.hero__bg`.

---

## 6. Motion and interactions (everything that moves)

**Rule used:** only `transform` and `opacity` are animated. Most motion is short and calm. One big reveal in the hero.

### Always on
| Effect | Where | What it does |
|---|---|---|
| Headline text reveal | `.hero__title` | Lines slide up from a mask |
| Shining gradient text | `.hero__title em` | Slow light moving across "for everyone involved." |
| Glow orbs | `.orb` | 3 soft blurred circles drifting slowly (20s loop) |
| Pulsing green dot | `.dot` | In the launch pill |
| Floating chips | `.chip--a`, `.chip--b` | "Checked automatically" and "Sample score 92%" float beside the product preview |
| Mock exam timer | `#mock-timer` | Counts down in the preview. For looks only |
| Countdown digit drop | `.cd__cell strong.tick` | Number drops in when it changes |

### On scroll
| Effect | Where | What it does |
|---|---|---|
| Progress bar | `#progress` | Thin line at the top fills as you scroll |
| Navbar glass | `.nav.scrolled` | Becomes frosted glass after scrolling 20px |
| Product tilt | `.product` | Preview starts tilted back and flattens as it comes to the middle of the screen (`--p` variable) |
| Reveal on scroll | `.reveal` | Items fade and slide up when they enter the screen, with a small stagger |

### On hover (desktop only)
| Effect | Where | What it does |
|---|---|---|
| Cursor glow | `#glow` | Very soft violet light follows the mouse |
| Magnetic buttons | `[data-magnetic]` | Buttons move slightly toward the mouse |
| Tile spotlight | `.tile` | Soft light follows the mouse inside each bento tile, and the tile lifts a little |
| Nav underline | `.nav__links a` | Thin line slides in under the link |

### Inside the bento tiles (small looping animations)
| Tile | Animation |
|---|---|
| Create an exam in minutes | Question rows slide in one by one, "Add question" button pulses |
| Automatic checking | Green ticks pop in one by one |
| Built-in timer | Ring fills up |
| Clear reports | Bars grow (marked "Sample data") |
| Fair and secure exams | Shield with soft ripples |
| Easy for every student | "Aa" in three sizes |

### Speed and accessibility
- No animation libraries. The whole JS file is small.
- Scroll work uses one `requestAnimationFrame` loop, and listeners are passive.
- If the visitor turned on **"reduce motion"** on their device, all animations stop, content shows normally, the cursor glow is hidden, and the preview does not tilt.
- Hover effects are skipped on touch screens.
- "Skip to content" link, visible focus rings, `aria-hidden` on decorative parts, `role="timer"` on the countdown.

---

## 7. Countdown: how it works

The countdown does **not** use the laptop or phone clock.

1. When the page opens, `script.js` asks internet time servers for the real UTC time.
2. It saves that time and then counts forward using `performance.now()`. This timer does not change if the user edits their device date or time.
3. It checks the internet time again every **2 minutes**, and also when the tab becomes active again after sleep.
4. It adds half of the network delay to be more exact.

**Time servers (tried in this order):**
1. `worldtimeapi.org`
2. `timeapi.io`
3. `worldclockapi.com`

**If all servers fail** (no internet, or the network blocks them): numbers show `--`, the note says "Could not get internet time. Retrying...", and it retries every 10 seconds. It never falls back to the device clock.

**When the countdown reaches zero:** boxes show `00` and the note says "We are live!". Change this in `render()`.

**To change the launch date:** edit this line at the top of `script.js`. Months start from 0 (January = 0, February = 1). The time is in UTC, so subtract 5 hours 30 minutes from IST.

```js
var LAUNCH_UTC_MS = Date.UTC(2027, 1, 14, 18, 30, 0);
```

Also update "15 February 2027" in `index.html` (hero pill, FAQ, join section, meta tags) and in the note text inside `script.js`.

---

## 8. Email forms

- There are two forms: one in the hero and one in the join section. Both use the class `js-form`. Only the email field is asked, because more fields reduce sign-ups.
- The email format is checked, and a message appears under the form.
- **Right now emails are only saved in the visitor's own browser** (`localStorage`, key `ege_waitlist`). This is for testing only. You will not receive them.
- **To collect real emails:** put your form link in `FORM_ENDPOINT` at the top of `script.js` (Formspree, Google Apps Script, or your own API). The page sends `{ "email": "...", "source": "examgoeasy-landing" }` as JSON.
- **Waitlist counter:** set `WAITLIST_COUNT` in `script.js` to a real number to show "X people are already on the list" in the join section. It stays hidden while the value is 0. Only use a real number.

---

## 9. Honest content rules

- The product is not live. Text says "building", "will", "plan". Do not change it to claim features that do not exist yet.
- The exam screen is labelled **"Product preview. The final design may change."**
- The score (92%) and the bar chart are labelled as **sample** data.
- The FAQ says pricing is not final. Update it when you decide.

---

## 10. How to change common things

| I want to... | Do this |
|---|---|
| Change text | Edit `index.html` |
| Change brand color | Edit `--accent` in `style.css`, plus the `91, 75, 255` values |
| Change launch date | Edit `LAUNCH_UTC_MS` in `script.js`, plus the visible date text |
| Slow down the glow orbs | Increase `20s` in `.orb` animation in `style.css` |
| Remove the cursor glow | Delete `<div class="cursor-glow" ...>` in `index.html` |
| Remove a floating chip | Delete its `<div class="chip ...">` in `index.html` |
| Change a bento tile | Edit its `<article class="tile ...">` in `index.html` |
| Change bento layout | Edit `grid-template-areas` in `.bento` in `style.css` |
| Add an FAQ question | Copy one `<details>` row in the FAQ section |
| Add your real logo | Replace `.logo__mark` (the "E" box) in `index.html` with an `<img>` |
| Replace the preview with a real screenshot | Replace the content inside `#product-card` with an `<img>` |
| Collect real emails | Set `FORM_ENDPOINT` in `script.js` |

---

## 11. Mobile design

- **Under 980px:** problem section becomes one column, bento becomes 2 columns, nav shows only the button.
- **Under 720px:** product preview hides the question list and the floating chips, bento is 1 column, steps stack, countdown fills the width, and the email form stacks vertically.

---

## 12. Things not done yet (ideas for later)

- Real logo and EGE brand colors
- Real email collection (see section 8)
- Real product screenshots when the product is ready
- Real waitlist number
- Pages for pricing, contact and privacy policy
- Favicon and a social share image (Open Graph image)
- Hindi version of the page
- A U.S. version of the text for the B2B market
- Real customer proof (logos, quotes) once it exists
- Optional: smooth scroll with **Lenis** and scroll animations with **GSAP**. They look more cinematic but add about 150 KB and can hurt speed, so they were left out on purpose
- Optional: a dark version of the page (Linear style)
- Test on real phones and with Lighthouse (speed and accessibility score)

---

## 13. Version history

- **v1 (20 Oct 2026):** Clean Light Modern, blue and purple, particles, floating exam objects, 4 equal cards.
- **v2 (20 Oct 2026):** Premium redesign. Navy and violet, light headlines, product preview in the hero, bento grid, editorial problem section, FAQ, hero email box, refined countdown, quieter and faster motion.
