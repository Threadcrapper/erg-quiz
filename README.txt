══════════════════════════════════════════════════════════
  ERG Training Quiz — Setup & Deployment Guide
  Elk River Guns — Product Knowledge & Safety Handbook
══════════════════════════════════════════════════════════

WHAT'S INCLUDED
───────────────
  server.js          — Web server (Node.js / Express)
  package.json       — Dependencies
  public/
    index.html       — Complete quiz application (single page)
    questions.js     — All 168 quiz questions (14 modules × 12 each)
  data/
    scores.json      — Employee score database (auto-created)

QUICK START (Local Network — recommended for store use)
───────────────────────────────────────────────────────
1. Install Node.js from https://nodejs.org  (LTS version)

2. Open a terminal / command prompt in this folder and run:
     npm install
     node server.js

3. The server will display:
     http://localhost:3000

4. On the same computer: open http://localhost:3000 in any browser.

5. Other devices on the same Wi-Fi (employees' phones/tablets):
   Find this computer's IP address (e.g., 192.168.1.50) and visit:
     http://192.168.1.50:3000

ADMIN ACCESS
────────────
  Default admin PIN:  4473   (a nod to ATF Form 4473)

  To change it, open server.js and edit line:
    const ADMIN_PIN = process.env.ADMIN_PIN || '4473';

  Or set an environment variable before starting:
    ADMIN_PIN=9876 node server.js

  Admin features:
    • View all employee scores with filters
    • See overall pass/fail statistics
    • Export scores to CSV (for records/compliance)
    • Delete individual records
    • 70% is passing threshold (configurable in index.html)

HOSTING ON A WEB SERVER (for remote access)
───────────────────────────────────────────
  Popular free/low-cost options:

  Railway (railway.app) — easiest:
    1. Create account at railway.app
    2. New Project → Deploy from GitHub (or upload files)
    3. Add PORT environment variable if prompted
    4. Your app gets a public URL

  Render (render.com):
    1. New Web Service → connect your repo
    2. Build command: npm install
    3. Start command: node server.js

  DigitalOcean / VPS:
    1. Upload files via SFTP
    2. Run: npm install && node server.js
    3. Use PM2 for auto-restart: npm install -g pm2 && pm2 start server.js

QUIZ FEATURES
─────────────
  • 14 modules + appendices, 12 questions each (168 total)
  • Question types: Multiple Choice, True/False, Complete the Sentence
  • Questions shuffled randomly each attempt
  • Instant feedback with explanation after each answer
  • Pass threshold: 70%
  • Score saved to server AND local browser (offline fallback)
  • Review all answers after quiz completion
  • Per-employee history tracked in browser

SECURITY NOTE
─────────────
  This app uses a simple PIN for admin access. For a production
  deployment with sensitive employee data, consider adding proper
  user authentication. The score data is stored in plain JSON.

SUPPORT
───────
  Questions? The app was built specifically for Elk River Guns.
  Questions are based on the Product Knowledge & Safety Handbook.
══════════════════════════════════════════════════════════
