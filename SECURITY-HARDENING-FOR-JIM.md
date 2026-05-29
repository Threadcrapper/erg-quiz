# ERG Training Quiz — Security Hardening Guide (for Jim)

The quiz is live at `https://training.elkriverguns.com`, hosted on our cPanel Node.js (Passenger) setup. To get it online fast we left it as-is. This is the punch list to tighten it up, **roughly in priority order**. Items 1–3 are the ones that matter; the rest are nice-to-haves.

The repo is **public** (github.com/Threadcrapper/erg-quiz), so two rules going forward:
- **Never commit a real PIN, password, or token.** Use environment variables (see #1).
- Assume anyone can read `server.js`, so security can't depend on anything hidden in the code.

---

## 1. Change the admin PIN — and get it out of the source code (do this first)

Right now the PIN is hardcoded with a default:

```js
const ADMIN_PIN = process.env.ADMIN_PIN || '4473';
```

Because the repo is public, `4473` is visible to anyone. The fix needs **no code change** — set an environment variable in cPanel so the default is never used:

1. cPanel → **Setup Node.js App** → open the `erg-quiz` app → **Detail**.
2. Under **Environment variables**, add: `ADMIN_PIN` = _(a longer value, e.g. 8+ digits or a passphrase)_.
3. **Save**, then **Restart** the app.

The running app now uses your private value; the `4473` in the code is irrelevant. Do **not** edit the PIN in `server.js` and commit it — that just publishes the new PIN.

## 2. Stop sending the PIN in the URL

The admin routes take the PIN as a query string:

```
GET  /api/scores?pin=XXXX
GET  /api/export?pin=XXXX
DELETE /api/scores/:id?pin=XXXX
```

Query strings get written to server access logs, browser history, and proxy logs — so the admin secret leaks even over HTTPS. Move it to a request **header** (e.g. `x-admin-pin`) or, better, a real session (see #3). Update `index.html`'s fetch calls to match. Minimal version:

```js
// server.js — read from header instead of query
const pin = req.get('x-admin-pin');
if (pin !== ADMIN_PIN) return res.status(401).json({ error: 'Invalid PIN' });
```

## 3. Replace the shared PIN with real auth (the proper fix)

A single shared 4-digit PIN with no rate limiting is brute-forceable in seconds (10,000 combos). Two levels of fix, pick based on effort:

- **Quick:** add brute-force protection — an `express-rate-limit` on the admin routes (e.g. 5 attempts / 15 min per IP) plus a longer PIN. Buys real time against guessing.
- **Proper:** add a login with per-user accounts and server-side sessions (e.g. `express-session` + bcrypt-hashed passwords, or put the whole app behind cPanel's **Directory Privacy** / HTTP Basic Auth as a zero-code stopgap). Then the admin dashboard requires logging in, not a shared secret.

The fastest real-world win with zero code: in cPanel, enable **Directory Privacy** (or a Passenger auth rule) on the subdomain so the whole site prompts for a username/password — good enough while the proper login is built.

## 4. Add basic HTTP hardening

- **Security headers:** add `helmet` (`npm i helmet`, then `app.use(helmet())`). One line, sets sane defaults.
- **Force HTTPS:** AutoSSL issues the cert; add a redirect so `http://` → `https://` (or enforce it in cPanel).
- **Rate-limit the score POST** too (`/api/scores`) so nobody can spam fake results.

## 5. Validate and sanitize input

`POST /api/scores` trusts the client for `employeeName`, `score`, `passed`, etc. Anyone can POST arbitrary results. At minimum:
- Cap/validate field types and lengths (e.g. `employeeName` ≤ 60 chars, `score` an integer within range).
- Strip HTML from `employeeName` before storing/rendering to avoid stored-XSS in the admin view.
- Consider computing pass/fail server-side from a server-held answer key rather than trusting the client's `passed` flag.

## 6. Protect the score data (it's employee PII)

Scores live in `data/scores.json` (employee names + results).
- Make sure the file isn't web-reachable — it sits in the app root, not the public docroot, so it shouldn't be; confirm `https://training.elkriverguns.com/data/scores.json` returns 404.
- It's gitignored, so it won't be published — keep it that way.
- For more than a handful of records, move to SQLite or a small DB; JSON gets racy under concurrent writes.
- Confirm cPanel daily backups include it, or add an export routine.

## 7. Housekeeping

- `npm audit` and bump dependencies (Express is pinned at `^4.18.2`).
- Add a `.env.example` documenting `ADMIN_PIN` and `PORT` (without real values).
- Set `NODE_ENV=production` (the cPanel app's "Application mode" → Production already does this).

---

### Summary for "good enough, fast"
If Jim only has 30 minutes: do **#1** (env-var PIN), turn on cPanel **Directory Privacy** on the subdomain (#3 stopgap), and confirm `data/scores.json` isn't web-accessible (#6). That closes the real exposure; the rest can follow.
