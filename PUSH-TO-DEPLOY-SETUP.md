# Push-to-Deploy Setup (Option B) — ERG Training Quiz

Goal: Jim pushes code and it goes live automatically, **without ever opening cPanel**.

How it works: the live app at `/home/elkriver/nodeapps/erg_quiz` is a git checkout. Jim adds the **server** as a git remote and pushes to it over SSH. cPanel updates the files in place, and a small hook restarts the Node app. One `git push` = live.

```
Jim's computer  ──git push live main──▶  cPanel server (SSH)
                                          ├─ updates app files
                                          └─ restarts the Node app  ──▶ live
```

**Server SSH push URL (the "live" remote):**
```
ssh://elkriver@elkriverguns.com/home/elkriver/nodeapps/erg_quiz
```

> Note: this also sidesteps a connectivity quirk we hit — the server currently can't reliably *pull* from GitHub, but pushing *to* the server works fine, so Option B is the more reliable path anyway.

---

## ⚠️ One access decision for Eric first

Authorizing Jim's SSH key on the `elkriver` cPanel account gives him **SSH/shell access to the entire account** — not just the quiz, but the live WordPress store and all its files. Options, most to least access:

- **(a) Authorize Jim's key on the elkriver account** — simplest, but broad access. Fine if you trust Jim with the whole account (he built the app).
- **(b) Keep deploys with you/Claude (Option A)** — Jim pushes to GitHub, you or Claude run the one-line deploy. No server access for Jim.
- **(c) Separate cPanel account for Jim** — most isolation, but the app would need to move; more work.

The steps below assume **(a)**. If you'd rather not grant full account access, say so and we'll use (b).

---

## One-time setup

### Step 1 — Jim generates an SSH key (his computer)
```
ssh-keygen -t ed25519 -C "jim-erg-quiz" -f ~/.ssh/erg_quiz_deploy
```
(Press Enter through the prompts; a passphrase is optional.) This makes two files:
- `~/.ssh/erg_quiz_deploy` (private — Jim keeps this, never shares it)
- `~/.ssh/erg_quiz_deploy.pub` (public — Jim sends this to Eric)

Jim copies the **public** key text:
```
cat ~/.ssh/erg_quiz_deploy.pub
```
…and sends that one line to Eric.

### Step 2 — Eric authorizes the public key (cPanel)
cPanel → **SSH Access** → **Manage SSH Keys** → **Import Key**:
- Paste Jim's public key into the "Public Key" box (leave private key blank), give it a name like `jim-erg-quiz`, Import.
- Back on Manage SSH Keys, find the key → **Manage** → **Authorize**.

*(Claude can drive this part for you in cPanel once you have Jim's public key — just paste it into the chat.)*

### Step 3 — Enable auto-restart on push (one time, via SSH or cPanel Terminal)
So a push restarts the app automatically, add a tiny hook on the server. In cPanel → **Terminal** (or via SSH), run:
```
mkdir -p ~/nodeapps/erg_quiz/tmp
cat > ~/nodeapps/erg_quiz/.git/hooks/post-receive <<'EOF'
#!/bin/bash
touch /home/elkriver/nodeapps/erg_quiz/tmp/restart.txt
EOF
chmod +x ~/nodeapps/erg_quiz/.git/hooks/post-receive
git -C ~/nodeapps/erg_quiz config receive.denyCurrentBranch updateInstead
```
What this does: `updateInstead` lets a push update the checked-out files; the `post-receive` hook touches `restart.txt`, which makes Passenger reload the app. (The repo's `.cpanel.yml` does the same restart if you ever deploy from the cPanel UI instead.)

### Step 4 — Jim adds the remote and tests (his computer)
From his local `erg-quiz` folder:
```
git remote add live ssh://elkriver@elkriverguns.com/home/elkriver/nodeapps/erg_quiz
# tell SSH which key to use for this host (one time):
#   add to ~/.ssh/config:
#   Host elkriverguns.com
#     IdentityFile ~/.ssh/erg_quiz_deploy
git push live main
```
Then load https://training.elkriverguns.com to confirm the change is live.

---

## Daily workflow for Jim (after setup)
```
# make changes with Claude, then:
git add -A && git commit -m "describe the change"
git push            # to GitHub (history / source of truth)
git push live main  # to the server  →  goes live automatically
```
That's it — no cPanel.

**The one exception:** if Jim adds a new npm package (changes `package.json`), the server needs an `npm install`, which is one click in cPanel's Node.js app (or a Terminal command). Code, question, and UI changes don't need it. The doc tells Jim to flag dependency changes.

---

## What still needs to happen
1. **Eric decides** the access approach (a/b/c above).
2. **Jim sends his public key** → Eric (or Claude) authorizes it (Step 2).
3. **Step 3 hook** is added once (Eric, Claude, or Jim via Terminal).
4. **Jim test-pushes** (Step 4).

Until a key is authorized, this can't be completed or tested — there's nothing to push *with* yet.
