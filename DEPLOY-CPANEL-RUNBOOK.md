# ERG Training Quiz — cPanel Deployment Runbook

_Reseller account · elkriverguns · target: `training.elkriverguns.com`_

We're hosting it on your own reseller account using cPanel's **Setup Node.js App** (the Node.js page in your screenshot). No Render/Railway, no monthly fee. The score file lives on real disk, so records persist. Total time ~15 minutes.

**Source repo:** `https://github.com/Threadcrapper/erg-quiz.git` — we'll clone it straight into cPanel so future updates are just `git pull` + Restart. (A `erg_quiz_deploy.zip` is also in this folder as a manual fallback — see the bottom of this doc.)

---

## Step 1 — Create the subdomain

1. cPanel → **Domains** (or **Subdomains**) → **Create A New Domain** / **Create Subdomain**.
2. Subdomain: `training`  →  Domain: `elkriverguns.com`  →  full name `training.elkriverguns.com`.
3. Let it set the default document root (e.g. `/home/USER/training.elkriverguns.com`). Note the path — you'll point the Node app at the subdomain in Step 3, so the exact docroot doesn't matter much.
4. Save.

## Step 2 — Clone the repo via Git Version Control

1. cPanel → **Git™ Version Control** → **Create**.
2. **Clone a Repository:** toggle on.
   - **Clone URL:** `https://github.com/Threadcrapper/erg-quiz.git`
   - **Repository Path:** `nodeapps/erg_quiz` (keeps app code outside `public_html`).
   - **Repository Name:** `erg-quiz`
3. **Create**. cPanel clones the repo into `nodeapps/erg_quiz`.
   - _Private repo?_ The clone needs read access. Either make the repo public (it's just quiz content, no secrets), or add a deploy key / use an HTTPS token in the clone URL. Easiest for now: a public repo.
   - _No internet clone allowed on the plan?_ Fall back to the zip method at the bottom of this doc.

**To update the app later:** Git Version Control → **Manage** → **Pull (or Deploy) HEAD Commit**, then Restart the Node app (Step 4). No re-uploading.

## Step 3 — Create the Node.js application

1. cPanel → **Node.js** (the page from your screenshot) → **CREATE APPLICATION**.
2. Fill in:
   - **Node.js version:** newest LTS offered (18, 20, or 22 — any is fine).
   - **Application mode:** `Production`.
   - **Application root:** `nodeapps/erg_quiz` (relative to home — the folder from Step 2).
   - **Application URL:** select `training.elkriverguns.com` (leave the path blank).
   - **Application startup file:** `server.js`
3. **Create**. cPanel builds a virtual environment and an Application Manager entry.

## Step 4 — Install dependencies & start

1. On the app's detail page, click **Run NPM Install** (reads `package.json`, installs Express). Wait for it to finish.
2. Click **Restart** (or Start).
3. Status should show **running**.

## Step 5 — SSL + verify

1. cPanel → **SSL/TLS Status** → run **AutoSSL** on `training.elkriverguns.com` (usually auto-issues a free Let's Encrypt cert within a few minutes).
2. Visit **https://training.elkriverguns.com**.
3. Quick smoke test:
   - Quiz loads, modules list shows 14 modules.
   - Take a module, finish it — you get a score.
   - Admin: the gear/admin button, PIN `4473`, shows the score you just recorded.

That's it — it's live.

---

## Notes & gotchas

- **Scores persist.** They write to `nodeapps/erg_quiz/data/scores.json` on your disk — not wiped by restarts (this is the advantage over the free cloud tiers). Your daily cPanel backups cover it.
- **Static files 404?** If the quiz page itself loads blank or assets 404, set the **subdomain's document root** to `nodeapps/erg_quiz/public` (Subdomains → manage), then restart the app. Express normally serves its own static files, so this is only a fallback.
- **"Cannot find module express"?** You skipped Step 4 — run **NPM Install** again, then Restart.
- **Wrong Node version error?** Switch the version dropdown to another LTS and Restart. The app only needs Node ≥16.
- **Admin PIN.** Left as Jim's default `4473` per your call — leave security for him to tighten. (When he's ready: it's a one-line change in `server.js`, or set an `ADMIN_PIN` environment variable in the Node.js app's Environment Variables section — no redeploy needed.)
- **Updating the app later.** In the repo, commit + push a change; then in cPanel Git Version Control → **Manage** → **Pull/Deploy HEAD**, and **Restart** the Node app. `data/scores.json` is gitignored, so pulls never touch live records.
- **Link it for staff.** Once verified, add a menu item / bookmark to `https://training.elkriverguns.com`, or just share the URL.

---

## Fallback: manual zip upload (if Git clone isn't available)

If the plan won't clone from GitHub (no outbound Git, or you'd rather not make the repo public):

1. cPanel → **File Manager** → create `nodeapps/erg_quiz`.
2. Upload `erg_quiz_deploy.zip` (in this folder) → **Extract** so `server.js`, `package.json`, `public/`, etc. sit directly in `nodeapps/erg_quiz`. Delete the zip.
3. Continue from **Step 3** above.

To update later with this method: re-upload changed files and **Restart**. Don't overwrite `data/scores.json`.
