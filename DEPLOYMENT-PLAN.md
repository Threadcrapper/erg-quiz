# ERG Training Quiz — Review & Deployment Plan

_Prepared for Eric • May 29, 2026_

## 1. What Jim sent

A self-contained **employee training quiz** built specifically for Elk River Guns, based on the Product Knowledge & Safety Handbook (the full training manual PDF ships with it).

- **168 questions** across 14 modules: Firearms Fundamentals, Handguns, Hunting Rifles, Modern Sporting Rifles, Shotguns, Suppressors & NFA, Ammunition, Optics/Lights/Lasers, Accessories, Customer Service & Sales Skills, Legal & Compliance, Caliber Quick-Reference, Glossary, and Safe Handling in the Store.
- Mixed formats (multiple choice, true/false, fill-in), shuffled each attempt, instant feedback with an explanation after every question.
- **70% pass threshold** (configurable).
- Scores saved to the server **and** the browser (offline fallback), with per-employee history.
- **Admin dashboard** behind a PIN (`4473`): view all scores, pass/fail stats, export to CSV for records, delete entries.

**Verdict:** Content quality is strong and the explanations are accurate and store-relevant. The app is sound and I confirmed it runs cleanly (boots, serves the quiz, records scores, PIN auth works). The only real question is *how to host it*, because it is a Node.js app, not a WordPress page.

## 2. The core constraint

This is a **Node.js / Express** application. Our site (elkriverguns.com) runs on **WordPress**, and standard WordPress hosting **cannot run Node**. So this cannot simply be dropped into the existing site or a subdomain pointed at the same server. It has to run somewhere that supports Node, and employees reach it by a separate URL (which we can still link from the site menu).

## 3. Hosting options & trade-offs

### Option A — Public subdomain (e.g. training.elkriverguns.com)
Host on a Node-friendly platform (Render or Railway), point a DNS record at it.

- **Pros:** Staff can take it from anywhere — phones, home, back office. Always available. Centralized score records. Looks professional.
- **Cons:** Small monthly cost (~$0–7). Needs two hardening steps before going public (login + persistent data — see §5). DNS change required.
- **Best when:** You want staff to train on their own time/devices and keep compliance records in one place.

### Option B — In-store only (one computer over Wi-Fi)
Run `node server.js` on a single always-on store computer; staff hit `http://<that-PC-IP>:3000` from phones/tablets on store Wi-Fi.

- **Pros:** Zero hosting cost. Nothing exposed to the internet, so the thin security is a non-issue. Works today, as-is.
- **Cons:** Only works inside the store. That computer must stay on and not change IP. No remote access. Scores live only on that machine (back them up).
- **Best when:** Training happens on-site and you don't want a recurring bill or remote access.

### Option C — Decide later
I've laid out the trade-offs above; once you pick A or B I'll execute the matching steps below.

**My recommendation:** If remote access and centralized records matter, go **Option A on Render** with the two hardening fixes. If it's purely in-store and you want zero cost/zero exposure, **Option B** works out of the box.

## 4. Step-by-step — Option A (public subdomain on Render)

1. Push the `erg_quiz` folder to a private GitHub repo (it's already inside the ERG git repo, so I can split it out or we use a subfolder deploy).
2. In Render: **New → Web Service**, connect the repo.
   - Build command: `npm install`
   - Start command: `node server.js`
   - Environment: add `ADMIN_PIN` (set something stronger than 4473) and let Render set `PORT`.
3. Add a **persistent disk** mounted at `/data` and point `DATA_FILE` there so scores survive restarts/redeploys (see §5).
4. Render gives a URL like `erg-quiz.onrender.com`. Confirm it works.
5. **DNS:** add a CNAME `training` → the Render target in the elkriverguns.com DNS, then add the custom domain in Render (it auto-issues SSL).
6. Add a menu link/bookmark from the staff area of the site to `https://training.elkriverguns.com`.

_Railway is an equally easy alternative; same shape (connect repo, set start command, add a volume)._

## 5. Hardening to do before public exposure (Option A only)

These are small code changes; Jim's README flags them too.

1. **Stronger admin auth.** The admin PIN is a single shared 4-digit code passed in the URL. Bump it to a longer value via the `ADMIN_PIN` env var at minimum. Better: add a simple login gate over the whole app so only staff can reach it.
2. **Persistent score storage.** On Render/Railway free tiers the filesystem is **ephemeral** — `data/scores.json` can be wiped on redeploy/restart. Mount a persistent volume and point the data file at it, or move scores to a small managed database. Important if these records are kept for compliance.
3. **Employee data is plain text.** Names + results sit in plain JSON. Fine internally; just don't expose it publicly without item 1.

For **Option B (in-store)**, none of these are urgent since nothing is internet-facing — just change the PIN and back up `data/scores.json` periodically.

## 6. Recommended next steps

- You pick **A** or **B**.
- If **A**: I'll make the two hardening edits (env-driven PIN + persistent data path), prep the repo, and write you the exact Render + DNS click-path. (I can't create the Render account or change DNS for you, but I'll hand you a copy-paste runbook.)
- If **B**: I'll write a one-page "how to start it on the store PC + find the IP + back up scores" sheet, and optionally set it up to auto-start.

---
_App verified running locally on Node 22: server boots, serves the quiz and all 168 questions, score POST returns success, admin PIN returns 200 / wrong PIN returns 401._
