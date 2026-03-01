import express from 'express';
import { WebSocketServer } from 'ws';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const PORT = 3001;

app.use(express.static('public'));
app.use(express.json({ limit: '50mb' })); // Increase payload limit

// Store review results
let latestReview = null;

app.get('/api/reviews/latest', (req, res) => {
  res.json(latestReview || { issues: [], summary: {} });
});

app.post('/api/reviews', (req, res) => {
  latestReview = req.body;
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({ type: 'update', data: latestReview }));
    }
  });
  res.json({ success: true });
});

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>AI Code Review Dashboard - Motilal Oswal</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; }
    .header { background: #1976d2; color: white; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
    .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); cursor: pointer; transition: transform 0.2s; }
    .card:hover { transform: translateY(-2px); }
    .card.active { border: 2px solid #1976d2; }
    .critical { border-left: 4px solid #f44336; }
    .high { border-left: 4px solid #ff9800; }
    .medium { border-left: 4px solid #2196f3; }
    .low { border-left: 4px solid #9e9e9e; }
    .count { font-size: 32px; font-weight: bold; margin: 10px 0; }
    .tabs { display: flex; gap: 10px; margin: 20px 0; border-bottom: 2px solid #ddd; }
    .tab { padding: 10px 20px; cursor: pointer; border: none; background: none; font-size: 16px; }
    .tab.active { border-bottom: 3px solid #1976d2; color: #1976d2; font-weight: bold; }
    .issue { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #ccc; }
    .issue-title { font-weight: bold; margin-bottom: 5px; }
    .issue-meta { color: #666; font-size: 14px; margin: 5px 0; }
    .suggestion { background: #e8f5e9; padding: 10px; margin-top: 10px; border-radius: 4px; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <div class="container">
      <h1>🤖 AI Code Review Dashboard</h1>
      <p>Motilal Oswal AMC - Real-time Code Quality Monitoring</p>
    </div>
  </div>
  
  <div class="container">
    <div class="summary" id="summary"></div>
    <div class="tabs">
      <button class="tab active" onclick="filterIssues('all')">All Issues</button>
      <button class="tab" onclick="filterIssues('critical')">Critical</button>
      <button class="tab" onclick="filterIssues('high')">High</button>
      <button class="tab" onclick="filterIssues('medium')">Medium</button>
      <button class="tab" onclick="filterIssues('low')">Low</button>
    </div>
    <div id="issues"></div>
  </div>

  <script>
    let allIssues = [];
    let currentFilter = 'all';
    const ws = new WebSocket('ws://localhost:${PORT}');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'update') {
        renderDashboard(data.data);
      }
    };

    async function loadLatest() {
      const res = await fetch('/api/reviews/latest');
      const data = await res.json();
      renderDashboard(data);
    }

    function filterIssues(severity) {
      currentFilter = severity;
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      event.target.classList.add('active');
      
      const filtered = severity === 'all' ? allIssues : allIssues.filter(i => i.severity === severity);
      renderIssues(filtered);
    }

    function renderDashboard(data) {
      const { summary = {}, issues = [] } = data;
      allIssues = issues;
      
      document.getElementById('summary').innerHTML = \`
        <div class="card critical" onclick="filterIssues('critical')">
          <div>Critical</div>
          <div class="count">\${summary.critical || 0}</div>
        </div>
        <div class="card high" onclick="filterIssues('high')">
          <div>High</div>
          <div class="count">\${summary.high || 0}</div>
        </div>
        <div class="card medium" onclick="filterIssues('medium')">
          <div>Medium</div>
          <div class="count">\${summary.medium || 0}</div>
        </div>
        <div class="card low" onclick="filterIssues('low')">
          <div>Low</div>
          <div class="count">\${summary.low || 0}</div>
        </div>
      \`;

      renderIssues(currentFilter === 'all' ? issues : issues.filter(i => i.severity === currentFilter));
    }

    function renderIssues(issues) {
      document.getElementById('issues').innerHTML = issues.length ? issues.map(issue => \`
        <div class="issue \${issue.severity}">
          <div class="issue-title">
            <span class="badge" style="background: \${getBadgeColor(issue.severity)}; color: white;">
              \${issue.severity.toUpperCase()}
            </span>
            \${issue.title}
          </div>
          <div class="issue-meta">📁 \${issue.file}:\${issue.line}</div>
          <div>\${issue.description}</div>
          \${issue.suggestion ? \`<div class="suggestion">💡 <strong>Suggestion:</strong> \${issue.suggestion}</div>\` : ''}
        </div>
      \`).join('') : '<p style="text-align:center; padding:40px; color:#999;">No issues found</p>';
    }

    function getBadgeColor(severity) {
      const colors = { critical: '#f44336', high: '#ff9800', medium: '#2196f3', low: '#9e9e9e' };
      return colors[severity] || '#ccc';
    }

    loadLatest();
  </script>
</body>
</html>
  `);
});

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Dashboard running at http://localhost:${PORT}\n`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected to dashboard');
});
