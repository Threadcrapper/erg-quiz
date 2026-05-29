# ERG Training Quiz — Handover for Jim

Hey Jim — your quiz is **live at https://training.elkriverguns.com**. It's hosted on our cPanel server and pulls its code from your GitHub repo. This doc covers three things:

1. Connecting Claude to the repo so you can make changes
2. The security hardening plan
3. How to push updates live — without ever touching cPanel

---

## The setup, in one picture

```
You + Claude  →  edit code  →  push to GitHub  →  (deploy)  →  live at training.elkriverguns.com
              (on your computer)   Threadcrapper/erg-quiz                cPanel Node.js app
```

- **GitHub repo:** https://github.com/Threadcrapper/erg-quiz  (public)
- **Live URL:** https://training.elkriverguns.com
- **Admin dashboard:** same URL, click the admin/gear option, PIN `4473` (change this — see hardening)
- The server runs Node 20, app lives at `/home/elkriver/nodeapps/erg_quiz`, and the live site auto-restarts when you deploy (the included `.cpanel.yml` handles that).

---

## 1. Connect Claude to the repo

You'll use Claude (the desktop app's Cowork mode, or Claude Code) with the repo on your computer. One-time setup:

1. **Install git** if you don't have it, and make sure you can push to GitHub. Easiest auth: install the **GitHub CLI** (`gh`) and run `gh auth login`, or set up an SSH key / Personal Access Token. (If you get "Permission denied (publickey)" or a password prompt, that's an auth setup step — Claude can walk you through it.)
2. **Clone the repo** to a folder on your computer:
   ```
   git clone https://github.com/Threadcrapper/erg-quiz.git
   ```
3. **Open that folder in Claude** — in the desktop app, start a Cowork session and select the `erg-quiz` folder. Claude can now read and edit every file (questions, server, the quiz page).
4. From then on, just tell Claude what you want, e.g. *"add 5 new questions to the Shotguns module"* or *"change the pass threshold to 80%."* Claude edits the files, and you can have it commit and push for you:
   - *"commit these changes and push to GitHub"*

That's the whole loop on your end: describe → Claude edits → push.

**Where things live in the repo:**
- `public/questions.js` — all 168 quiz questions (this is what you'll edit most)
- `public/index.html` — the quiz app itself (UI, scoring, pass threshold)
- `server.js` — the small web server + admin/score API
- `data/scores.json` — live employee scores (do NOT edit; it's ignored by git and lives only on the server)

---

## 2. Security hardening plan

Right now the app uses Jim's original default admin PIN (`4473`), and since the repo is public, that PIN is visible in `server.js`. The full punch list is in **`SECURITY-HARDENING-FOR-JIM.md`** in the repo. The three that matter, in order:

1. **Change the admin PIN — without editing code.** Set an environment variable on the server so the public `4473` is never used. (This is the one server-side thing worth doing; Eric or Claude can set the `ADMIN_PIN` variable in the cPanel Node.js app in 30 seconds — no code change, no redeploy.)
2. **Stop sending the PIN in the URL** (`?pin=XXXX` leaks into logs) — move it to a request header or a real session. This is a code change you can make with Claude.
3. **Replace the shared PIN with real login** — or, as a zero-code stopgap, put the whole site behind a cPanel "Directory Privacy" password.

Lower priority (all code changes you can do with Claude): add `helmet` security headers, validate/sanitize the `employeeName` and score fields, force HTTPS, and rate-limit the login. See the hardening doc for specifics.

You don't have to do these to use the app — it works today. But do #1 before you share the link widely.

---

## 3. Pushing updates live — without cPanel

The app's code on the server is a **git checkout** of your repo. So an update is two moves: **push to GitHub**, then **deploy** (pull onto the server + restart). You never need to open the cPanel interface for either. Pick whichever fits you:

### Option A — Ask Claude to deploy (simplest)
After Claude pushes your changes to GitHub, just say:
> *"deploy the update to the live site"*

Claude does the server side for you (pulls the new commit and restarts the app). You stay in the chat the whole time — no cPanel navigation. *(This needs Claude to have access to the cPanel login or SSH; Eric can set that up once.)*

### Option B — Push-to-deploy (fully automatic, one-time setup)
We can wire it so that **pushing to a server remote auto-deploys** — no deploy step at all. The repo already includes a `.cpanel.yml` that restarts the app on deploy. To enable it, Eric does a one-time setup: add an SSH key for you to the cPanel server and give you the server's git remote URL. After that your workflow is just:
```
git push                # to GitHub, for history
git push live main      # to the server → auto-pulls + restarts
```
Ask Claude to *"set up push-to-deploy for the cPanel git remote"* with Eric's help and it'll configure it.

### What actually happens on deploy
A deploy pulls your latest commit into `/home/elkriver/nodeapps/erg_quiz` and touches `tmp/restart.txt`, which reloads the Node app. Live employee scores (`data/scores.json`) are never touched — they're outside git.

> ⚠️ **One caveat:** if you ever add a new npm package (change `package.json`), that needs an `npm install` on the server, which is one extra step in cPanel. For everything else — new questions, wording, the quiz UI, scoring rules — the push/deploy loop above is all you need. Just tell Claude if you've added a dependency and it'll flag it.

---

## TL;DR for day-to-day
1. Open the `erg-quiz` folder in Claude.
2. Describe the change → Claude edits → *"commit and push."*
3. *"deploy the update"* (Option A) — or it's automatic if push-to-deploy is set up (Option B).
4. Check https://training.elkriverguns.com.

Questions on any of this — ask Claude, it has the full context of how this is wired.
