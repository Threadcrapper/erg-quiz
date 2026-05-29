**Subject:** ERG training quiz is live — here's how to make updates

Hey Jim,

The training quiz is live: **https://training.elkriverguns.com** (sent you the link by text too). It's running on our cPanel server and pulls its code from a GitHub repo, so you can make changes and push them live yourself.

**The repo:** https://github.com/Threadcrapper/erg-quiz

**To get going with Claude (since you've already got Claude running):**

Just point your Claude at the repo and let it do the setup. Tell it something like:

> "Clone https://github.com/Threadcrapper/erg-quiz.git, open the folder, and read CLAUDE.md — that's my full briefing for working on this app."

1. Clone the repo: `git clone https://github.com/Threadcrapper/erg-quiz.git`
2. Open that `erg-quiz` folder in your Claude session.
3. There's a **CLAUDE.md** in the folder — Claude reads it automatically and it has the full picture: what the app is, where the questions live, how to make changes, and how to push them live. Then just tell Claude what you want (e.g. "add 5 questions to the Shotguns module" or "bump the pass mark to 80%") and it'll handle the edits and the commit/push. Your Claude can also do the SSH key step below for you.

**Daily flow is basically:** describe the change to Claude → it edits and commits → push to GitHub → push to the server → it's live. No cPanel needed.

**One setup step I need from you:** to let you push straight to the live server, I need to authorize an SSH key for you. Please generate one and send me the **public** half:

```
ssh-keygen -t ed25519 -C "jim-erg-quiz" -f ~/.ssh/erg_quiz_deploy
cat ~/.ssh/erg_quiz_deploy.pub
```

Send me that `ssh-ed25519 ...` line (the .pub one — keep the private one to yourself) and I'll authorize it. The full push-to-deploy steps are in **PUSH-TO-DEPLOY-SETUP.md** in the repo. Until that's set up, send me changes and I'll deploy them.

A couple of notes:
- The repo also has **SECURITY-HARDENING-FOR-JIM.md** — a punch list for tightening up the admin side when you get a chance (the admin PIN is still your default `4473`). Nothing urgent, but worth a look before we push the link out widely.
- Don't worry about `data/scores.json` — that's live employee data and lives only on the server.

Appreciate you building this — looks great. Let me know if you hit any snags.

Eric
