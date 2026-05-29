# ERG Training Quiz — cPanel Deployment Runbook

_Reseller account · elkriverguns · target: `training.elkriverguns.com`_

We're hosting it on your own reseller account using cPanel's **Setup Node.js App** (the Node.js page in your screenshot). No Render/Railway, no monthly fee. The score file lives on real disk, so records persist. Total time ~15 minutes.

**Deliverable to upload:** `erg_quiz_deploy.zip` (in this folder — clean app, no node_modules).

---

## Step 1 — Create the subdomain

1. cPanel → **Domains** (or **Subdomains**) → **Create A New Domain** / **Create Subdomain**.
2. Subdomain: `training`  →  Domain: `elkriverguns.com`  →  full name `training.elkriverguns.com`.
3. Let it set the default document root (e.g. `/home/USER/training.elkriverguns.com`). Note the path — you'll point the Node app at the subdomain in Step 3, so the exact docroot doesn't matter much.
4. Save.

## Step 2 — Upload the app files

1. cPanel → **File Manager**. Go to your home directory and create a folder for the app, e.g. `nodeapps/erg_quiz` (keep app code **outside** `public_html` so source isn't web-served directly).
2. Upload `erg_quiz_deploy.zip` into `nodeapps/erg_quiz`.
3. Select it → **Extract**. You should end up with `server.js`, `package.json`, `package-lock.json`, `public/`, and `data/scores.json` directly inside `nodeapps/erg_quiz`.
4. Delete the zip after extracting.

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
- **Updating the app later.** Replace files in `nodeapps/erg_quiz` (re-upload changed files), then click **Restart**. Don't overwrite `data/scores.json` or you'll wipe records.
- **Link it for staff.** Once verified, add a menu item / bookmark to `https://training.elkriverguns.com`, or just share the URL.

---

## Optional: deploy via Git instead of zip

If you'd rather Jim push updates from a repo, cPanel → **Git Version Control** can clone a repo into the app root and you `git pull` + Restart to update. We'd put the quiz in its own small repo first. The zip route above is faster for getting it live today; Git is nicer for ongoing updates. Say the word and I'll stage the standalone repo.
