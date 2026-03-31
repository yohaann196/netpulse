/**
 * app.js — Netpulse application logic
 */

/* ── State ── */
let activeFilter = 'all';
let searchQuery  = '';
let expandedId   = null;
const startTime  = Date.now();

/* ── Helpers ── */
function statusLabel(s) {
  const map = { ok: 'Operational', issues: 'Degraded', down: 'Major Outage', investigating: 'Investigating' };
  return map[s] || s;
}

function statusClass(s) {
  const map = { ok: 'status-ok', issues: 'status-issues', down: 'status-down', investigating: 'status-investigating' };
  return map[s] || 'status-ok';
}

function barColor(s) {
  const map = { ok: '#639922', issues: '#BA7517', down: '#E24B4A', investigating: '#378ADD' };
  return map[s] || '#639922';
}

function sparkColor(val, status) {
  if (val === 0) return 'var(--border-light)';
  if (val <= 2)  return barColor(status) + '88';
  return barColor(status);
}

function fmtReports(n) {
  return n >= 1000 ? (Math.round(n / 100) / 10) + 'k' : String(n);
}

/* ── Filter / search ── */
function setFilter(f, el) {
  activeFilter = f;
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  render();
}

function filterServices() {
  searchQuery = document.getElementById('search-input').value.toLowerCase();
  render();
}

function toggleExpand(id) {
  expandedId = (expandedId === id) ? null : id;
  render();
}

/* ── Build service card HTML ── */
function buildCard(s) {
  const isExp = expandedId === s.id;
  const maxH   = Math.max(...s.history, 1);

  /* spark bars */
  const sparks = s.history.map(v => {
    const h = Math.max(4, Math.round((v / maxH) * 28));
    return `<div class="spark-bar" style="height:${h}px;background:${sparkColor(v, s.status)};"></div>`;
  }).join('');

  /* region rows */
  const maxPct   = Math.max(...s.regions.map(r => r.pct), 1);
  const regionRows = s.regions.map(r => {
    const fillW = Math.round((r.pct / maxPct) * 100);
    return `
      <div class="region-row">
        <div class="region-name" title="${r.r}">${r.r}</div>
        <div class="region-bar-wrap">
          <div class="region-bar-bg">
            <div class="region-bar-fill" style="width:${fillW}%;background:${barColor(s.status)};"></div>
          </div>
          <div class="region-pct">${r.pct}%</div>
        </div>
      </div>`;
  }).join('');

  /* issue items */
  const issueItems = s.issues.length
    ? s.issues.map(i => `
        <div class="issue-item">
          <div class="issue-dot" style="background:${barColor(s.status)};"></div>
          <span>${i}</span>
        </div>`).join('')
    : `<div class="issue-item" style="color:var(--text-tertiary);">No issues reported</div>`;

  /* 24-hour timeline */
  const tlSegs = s.history.map(v => {
    const bg = v === 0 ? '#639922' : v <= 3 ? '#BA7517' : '#E24B4A';
    return `<div class="tl-seg" style="background:${bg};"></div>`;
  }).join('');

  return `
    <div class="service-card${isExp ? ' expanded' : ''}" id="card-${s.id}">
      <div class="service-top" onclick="toggleExpand(${s.id})">
        <div class="service-icon" style="background:${s.color}22;color:${s.color};">${s.icon}</div>
        <div class="service-info">
          <div class="service-name">${s.name}</div>
          <div class="service-sub">${s.uptime}% uptime &middot; ${s.reports.toLocaleString()} reports</div>
        </div>
        <div class="service-right">
          <div class="report-count">&uarr;${fmtReports(s.reports)}</div>
          <span class="status-badge ${statusClass(s.status)}">${statusLabel(s.status)}</span>
          <span class="chevron${isExp ? ' open' : ''}">&#9662;</span>
        </div>
      </div>

      <div class="spark-row">
        <div class="spark-bars">${sparks}</div>
        <div class="spark-label">24h</div>
      </div>

      <div class="detail-panel${isExp ? ' open' : ''}">
        <div class="detail-sections">
          <div class="detail-section">
            <h4>Reports by region</h4>
            ${regionRows}
          </div>
          <div class="detail-section">
            <h4>Known issues</h4>
            ${issueItems}
          </div>
        </div>
        <div class="timeline-section">
          <h4>24-hour status timeline</h4>
          <div class="timeline-bar">${tlSegs}</div>
          <div class="tl-label"><span>24h ago</span><span>now</span></div>
        </div>
      </div>
    </div>`;
}

/* ── Main render ── */
function render() {
  /* filter */
  const filtered = services.filter(s => {
    const matchFilter = activeFilter === 'all' ||
                        activeFilter === s.category ||
                        activeFilter === s.status;
    const matchSearch = s.name.toLowerCase().includes(searchQuery);
    return matchFilter && matchSearch;
  });

  /* sort: down → issues → investigating → ok */
  const order = { down: 0, issues: 1, investigating: 2, ok: 3 };
  filtered.sort((a, b) => order[a.status] - order[b.status]);

  /* summary counters */
  const countOk      = services.filter(s => s.status === 'ok').length;
  const countIssues  = services.filter(s => s.status !== 'ok').length;
  const totalReports = services.reduce((sum, s) => sum + s.reports, 0);

  document.getElementById('count-ok').textContent      = countOk;
  document.getElementById('count-issues').textContent  = countIssues;
  document.getElementById('count-reports').textContent = totalReports.toLocaleString();

  /* render cards */
  const list = document.getElementById('services-list');
  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty-state">No services match your filter.</div>`;
  } else {
    list.innerHTML = filtered.map(buildCard).join('');
  }
}

/* ── Live clock ── */
function startClock() {
  const el = document.getElementById('updated-time');
  setInterval(() => {
    const mins = Math.floor((Date.now() - startTime) / 60000);
    el.textContent = mins === 0 ? 'updated just now' : `updated ${mins}m ago`;
  }, 30000);
}

/* ── Boot ── */
render();
startClock();
