// app.js
// started this as a quick weekend project, got carried away

let filter = 'all';
let query = '';
let expanded = null;
const bootTime = Date.now();

const STATUS_LABELS = { ok: 'Operational', issues: 'Degraded', down: 'Major Outage', investigating: 'Investigating' };
const STATUS_CLASSES = { ok: 'status-ok', issues: 'status-issues', down: 'status-down', investigating: 'status-investigating' };
const BAR_COLORS = { ok: '#639922', issues: '#BA7517', down: '#E24B4A', investigating: '#378ADD' };

function barColor(s) { return BAR_COLORS[s] || '#639922'; }

function sparkColor(val, status) {
  if (!val) return 'var(--border-light)';
  return val <= 1 ? barColor(status) + '88' : barColor(status);
}

function fmt(n) {
  return n >= 1000 ? (Math.round(n / 100) / 10) + 'k' : String(n);
}

function setFilter(f, el) {
  filter = f;
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  render();
}

function filterServices() {
  query = document.getElementById('search-input').value.toLowerCase();
  render();
}

function toggleExpand(id) {
  expanded = expanded === id ? null : id;
  render();
}

function reportIssue(e, url) {
  e.stopPropagation();
  window.open(url, '_blank', 'noopener');
}

function buildCard(svc) {
  const open = expanded === svc.id;
  const maxH = Math.max(...svc.history, 1);

  const sparks = svc.history.map(v => {
    const h = Math.max(3, Math.round((v / maxH) * 28));
    return `<div class="spark-bar" style="height:${h}px;background:${sparkColor(v, svc.status)};"></div>`;
  }).join('');

  const reportItems = svc.issues.length
    ? svc.issues.map(i => `
        <div class="issue-item">
          <div class="issue-dot" style="background:${barColor(svc.status)};"></div>
          <span>${i}</span>
        </div>`).join('')
    : `<div class="issue-item" style="color:var(--text-tertiary);">nothing filed yet</div>`;

  // timeline coloring — green=clean, amber=a few reports, red=lots
  const tl = svc.history.map(v => {
    const bg = !v ? '#639922' : v <= 2 ? '#BA7517' : '#E24B4A';
    return `<div class="tl-seg" style="background:${bg};"></div>`;
  }).join('');

  const issueUrl = svc.issueUrl || 'https://github.com';

  // don't show fake numbers until we have real data
  const configured = !!GITHUB_REPO;
  const countLabel = !configured
    ? '<span class="report-zero">—</span>'
    : svc.reports === 0
      ? '<span class="report-zero">no reports</span>'
      : `<span class="report-count">${fmt(svc.reports)} report${svc.reports === 1 ? '' : 's'}</span>`;

  const subLine = configured
    ? `${svc.uptime}% uptime &middot; ${countLabel}`
    : countLabel;

  // TODO: add ago-time to each report item ("3h ago" etc)
  return `
    <div class="service-card${open ? ' expanded' : ''}" id="card-${svc.id}">
      <div class="service-top" onclick="toggleExpand(${svc.id})">
        <div class="service-icon" style="background:${svc.color}22;color:${svc.color};">${svc.icon}</div>
        <div class="service-info">
          <div class="service-name">${svc.name}</div>
          <div class="service-sub">${subLine}</div>
        </div>
        <div class="service-right">
          <span class="status-badge ${STATUS_CLASSES[svc.status] || 'status-ok'}">${STATUS_LABELS[svc.status] || svc.status}</span>
          <span class="chevron${open ? ' open' : ''}">&#9662;</span>
        </div>
      </div>

      <div class="spark-row">
        <div class="spark-bars">${sparks}</div>
        <div class="spark-label">24h activity</div>
      </div>

      <div class="detail-panel${open ? ' open' : ''}">
        <div class="detail-top">
          <div class="detail-section">
            <h4>Open reports</h4>
            ${reportItems}
          </div>
          <div class="detail-section">
            <h4>Something broken?</h4>
            <p class="report-explainer">File a GitHub issue — it shows up here as a live report. Takes ~30 seconds.</p>
            <button class="report-btn" onclick="reportIssue(event, '${issueUrl}')">+ report issue</button>
            ${GITHUB_REPO ? `<a class="issues-link" href="https://github.com/${GITHUB_REPO}/issues?q=label%3A${svc.label}" target="_blank" rel="noopener">all reports on GitHub ↗</a>` : ''}
          </div>
        </div>
        <div class="timeline-section">
          <h4>last 24h</h4>
          <div class="timeline-bar">${tl}</div>
          <div class="tl-label"><span>24h ago</span><span>now</span></div>
        </div>
      </div>
    </div>`;
}

function render() {
  const visible = services.filter(s => {
    const matchesFilter = filter === 'all' || filter === s.category || filter === s.status;
    return matchesFilter && s.name.toLowerCase().includes(query);
  });

  // worst status first
  visible.sort((a, b) => {
    const rank = { down: 0, issues: 1, investigating: 2, ok: 3 };
    return rank[a.status] - rank[b.status];
  });

  // hide summary numbers too if not configured
  const configured = !!GITHUB_REPO;
  document.getElementById('count-ok').textContent = configured ? services.filter(s => s.status === 'ok').length : '—';
  document.getElementById('count-issues').textContent = configured ? services.filter(s => s.status !== 'ok').length : '—';
  document.getElementById('count-reports').textContent = configured ? services.reduce((n, s) => n + s.reports, 0).toLocaleString() : '—';

  const list = document.getElementById('services-list');
  list.innerHTML = visible.length
    ? visible.map(buildCard).join('')
    : `<div class="empty-state">nothing matches that filter</div>`;
}

// updates the "N minutes ago" text — runs every 30s which is fine
// (could do every 60s tbh but whatever)
function startClock() {
  const el = document.getElementById('updated-time');
  setInterval(() => {
    const mins = Math.floor((Date.now() - bootTime) / 60000);
    el.textContent = mins < 1 ? 'just now' : `${mins}m ago`;
  }, 30000);
}

startClock();
