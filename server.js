const express = require('express');
const fs      = require('fs');
const path    = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Configuration ─────────────────────────────────────────────────────────────
const ADMIN_PIN  = process.env.ADMIN_PIN  || '4473';   // change via env var or here
const DATA_FILE  = path.join(__dirname, 'data', 'scores.json');
const PORT       = process.env.PORT || 3000;

// ── Helpers ───────────────────────────────────────────────────────────────────
function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');
}

function loadScores() {
  ensureDataDir();
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return []; }
}

function saveScores(scores) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(scores, null, 2));
}

// ── Routes ────────────────────────────────────────────────────────────────────

// POST /api/scores  — save a completed quiz result
app.post('/api/scores', (req, res) => {
  const { employeeName, moduleId, moduleTitle, score, totalQuestions, passed, timestamp, answers } = req.body;
  if (!employeeName || !moduleId || score === undefined || !totalQuestions) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const scores = loadScores();
  const entry  = {
    id:            Date.now(),
    employeeName:  employeeName.trim(),
    moduleId,
    moduleTitle,
    score:         Number(score),
    totalQuestions:Number(totalQuestions),
    percentage:    Math.round((score / totalQuestions) * 100),
    passed:        !!passed,
    timestamp:     timestamp || new Date().toISOString(),
    answers:       answers || []
  };
  scores.push(entry);
  saveScores(scores);
  res.json({ success: true, entry });
});

// GET /api/scores?pin=XXXX  — get ALL scores (admin only)
app.get('/api/scores', (req, res) => {
  if (req.query.pin !== ADMIN_PIN) {
    return res.status(401).json({ error: 'Invalid PIN' });
  }
  res.json(loadScores());
});

// GET /api/scores/employee/:name  — get scores for one employee (no PIN needed)
app.get('/api/scores/employee/:name', (req, res) => {
  const scores = loadScores();
  const name   = decodeURIComponent(req.params.name).toLowerCase();
  res.json(scores.filter(s => s.employeeName.toLowerCase() === name));
});

// DELETE /api/scores/:id?pin=XXXX  — delete a single score record (admin)
app.delete('/api/scores/:id', (req, res) => {
  if (req.query.pin !== ADMIN_PIN) {
    return res.status(401).json({ error: 'Invalid PIN' });
  }
  const id     = Number(req.params.id);
  const scores = loadScores().filter(s => s.id !== id);
  saveScores(scores);
  res.json({ success: true });
});

// GET /api/export?pin=XXXX  — export all scores as CSV
app.get('/api/export', (req, res) => {
  if (req.query.pin !== ADMIN_PIN) {
    return res.status(401).json({ error: 'Invalid PIN' });
  }
  const scores = loadScores();
  const header = 'Employee,Module,Score,Total,Percent,Passed,Date\n';
  const rows   = scores.map(s =>
    `"${s.employeeName}","${s.moduleTitle}",${s.score},${s.totalQuestions},${s.percentage}%,${s.passed ? 'Yes' : 'No'},"${new Date(s.timestamp).toLocaleString()}"`
  ).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="erg_quiz_scores.csv"');
  res.send(header + rows);
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  ╔══════════════════════════════════════════════╗`);
  console.log(`  ║   ERG Training Quiz — Server Running         ║`);
  console.log(`  ║   http://localhost:${PORT}                       ║`);
  console.log(`  ║   Admin PIN: ${ADMIN_PIN}  (set ADMIN_PIN env var)  ║`);
  console.log(`  ╚══════════════════════════════════════════════╝\n`);
});
