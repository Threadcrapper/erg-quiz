# CLAUDE.md — ERG Training Quiz (context for Claude)

If you're Claude working with Jim on this repo: this file is your full briefing. Read it first.

## What this is
An employee training quiz for Elk River Guns, built by Jim. It's a small Node.js / Express app: a single-page quiz (168 questions across 14 modules) with instant feedback, a 70% pass threshold, and a PIN-protected admin dashboard that records scores and exports CSV.

- **Live site:** https://training.elkriverguns.com
- **GitHub:** https://github.com/Threadcrapper/erg-quiz (public)
- **Admin:** the admin/gear option on the site, PIN `4473` (slated to change — see Security below)

## How it's hosted (so you understand the deploy path)
- Runs on a cPanel server as a Node.js app (Passenger) at `/home/elkriver/nodeapps/erg_quiz`, Node 20, production mode.
- The live folder is a **git checkout** of this repo, so deploying = getting commits onto the server.
- DNS is on **Cloudflare**. Important quirk: the server currently can't reliably *pull* from GitHub, so the deploy path is **pushing directly to the server** over SSH (see Deploying below), not a server-side pull.

## Repo layout
- `public/questions.js` — all 168 quiz questions. **This is the file you'll edit most.** Each question is an object with `type` (`mc`/`tf`/`fill`), `q`, `options`, `correct`, `explanation`. Modules are objects with `id`, `title`, `subtitle`, `questions[]`.
- `public/index.html` — the quiz app itself: UI, scoring logic, and `PASS_THRESHOLD` (currently 70).
- `server.js` — the Express server + score/admin API (`/api/scores`, `/api/export`). Admin PIN read from `ADMIN_PIN` env var, falling back to `4473`.
- `data/scores.json` — **live employee scores. Do NOT edit or commit it.** It's gitignored and exists only on the server.
- `.cpanel.yml` — restarts the app on a cPanel deploy.
- Docs: `HANDOVER-FOR-JIM.md`, `PUSH-TO-DEPLOY-SETUP.md`, `SECURITY-HARDENING-FOR-JIM.md`.

## Making changes (the normal loop)
1. Jim describes a change (e.g. "add 5 questions to the Shotguns module", "make the pass mark 80%", "reword question 3 in Optics").
2. You edit the relevant file (`public/questions.js` for questions, `public/index.html` for UI/threshold).
3. Keep the existing data shapes exactly — the quiz breaks if a question object is malformed. After editing `questions.js`, sanity-check it's valid JS (no trailing commas breaking it, every question has `correct` and `explanation`).
4. Commit and push (see below).

## Committing & pushing
```
git add -A
git commit -m "describe the change"
git push            # to GitHub (history / source of truth)
git push live main  # to the server  ->  goes live automatically
```
- `origin` = GitHub. `live` = the cPanel server (set up per PUSH-TO-DEPLOY-SETUP.md).
- If `git push` to GitHub asks for credentials, Jim may need a Personal Access Token or `gh auth login` — help him set that up.
- If the `live` remote isn't set up yet, follow **PUSH-TO-DEPLOY-SETUP.md** (Jim generates an SSH key, Eric authorizes it). Until then, deploys go through Eric.

## Deploying — what "goes live" means
Pushing to `live` updates the files on the server and restarts the Node app, so the change is live at https://training.elkriverguns.com within a second or two. Always verify by loading that URL after a deploy.

**One exception:** if you add or change an npm dependency (`package.json`), the server needs an `npm install`, which is one click in cPanel's "Setup Node.js App" (or a Terminal command). Tell Jim whenever a change adds a dependency so he doesn't get a broken deploy. For question/wording/UI/scoring changes, no install is needed.

## Don't
- Don't touch `data/scores.json` (live records).
- Don't commit secrets. The repo is **public** — no real PINs, tokens, or passwords in committed files. Use environment variables on the server instead.

## Security hardening (see SECURITY-HARDENING-FOR-JIM.md)
The app is usable as-is but the admin side is lightly protected. Priorities:
1. Change the admin PIN via an `ADMIN_PIN` environment variable in cPanel (since `4473` is visible in the public repo).
2. Stop passing the PIN in the URL (`?pin=`) — move it to a header/session.
3. Replace the shared PIN with real login (or a cPanel Directory Privacy password as a stopgap).
Lower priority: `helmet` headers, input validation/sanitization on `employeeName`, force HTTPS, rate-limit the login. These are all code changes you can make with Jim.

## If you're unsure
Ask Jim. And if something about the hosting/deploy seems off, the three docs above have the details; this file is the summary.
