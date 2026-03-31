// app.js

let filter = 'all';
let query  = '';
let expanded = null;
let liveServices = SERVICES.map(blankService);
const startedAt = Date.now();

const STATUS_TEXT  = { ok:'Operational', issues:'Degraded', down:'Major Outage', investigating:'Investigating' };
const STATUS_CLASS = { ok:'s-ok', issues:'s-issues', down:'s-down', investigating:'s-investigating' };
const DOT_COLOR    = { ok:'#639922', issues:'#BA7517', down:'#E24B4A', investigating:'#378ADD' };

function dotColor(s)   { return DOT_COLOR[s]    || '#888'; }
function sparkFade(v, s) {
  if (!v) return 'var(--border)';
  return v <= 1 ? dotColor(s) + '66' : dotColor(s);
}
function fmtN(n) { return n >= 1000 ? (Math.round(n / 100) / 10) + 'k' : String(n); }

function blankService(s) {
  return { ...s, status:'ok', reports:0, uptime:null, issues:[], history:Array(24).fill(0), issueUrl:makeIssueUrl(s) };
}

function makeIssueUrl(svc) {
  if (!GITHUB_REPO) return `https://github.com`;
  const t = encodeURIComponent(`[${svc.name}] outage report`);
  const b = encodeURIComponent(`**Service:** ${svc.name}\n**Time:** ${new Date().toUTCString()}\n\n**What's happening?**\n\n`);
  return `https://github.com/${GITHUB_REPO}/issues/new?title=${t}&body=${b}&labels=${encodeURIComponent(svc.label)}`;
}

function toStatus(n) {
  if (!n)      return 'ok';
  if (n <= 3)  return 'issues';
  return 'down';
}

function crunch(svc, rawIssues) {
  const open = rawIssues.filter(i => i.state === 'open');
  const status = toStatus(open.length);

  const titles = open.slice(0, 4).map(i => {
    const t = i.title.replace(/^\[.+?\]\s*/, '');
    return t.length > 65 ? t.slice(0, 62) + '…' : t;
  });

  const now = Date.now();
  const hist = Array(24).fill(0);
  rawIssues.forEach(i => {
    const hrs = (now - new Date(i.created_at).getTime()) / 3_600_000;
    if (hrs < 24) hist[23 - Math.min(23, Math.floor(hrs))]++;
  });

  return {
    ...svc,
    status,
    reports: open.length,
    uptime: null, // we don't fake this
    issues: titles,
    history: hist,
    issueUrl: makeIssueUrl(svc),
  };
}

// ── rendering ────────────────────────────────────────────────────────────────

function card(svc) {
  const isOpen = expanded === svc.id;
  const configured = !!GITHUB_REPO;
  const maxH = Math.max(...svc.history, 1);

  const sparks = svc.history.map(v => {
    const h = Math.max(3, Math.round((v / maxH) * 26));
    return `<div class="spark-bar" style="height:${h}px;background:${sparkFade(v, svc.status)};"></div>`;
  }).join('');

  const reportLines = svc.issues.length
    ? svc.issues.map(t => `<div class="report-line"><span class="report-dot" style="background:${dotColor(svc.status)};"></span>${t}</div>`).join('')
    : `<div class="report-line muted">no open reports</div>`;

  const tl = svc.history.map(v => {
    const c = !v ? '#639922' : v <= 2 ? '#BA7517' : '#E24B4A';
    return `<div class="tl-seg" style="background:${c};"></div>`;
  }).join('');

  const countText = !configured
    ? '<span class="muted">—</span>'
    : svc.reports === 0
      ? '<span class="muted">no reports</span>'
      : `${fmtN(svc.reports)} report${svc.reports === 1 ? '' : 's'}`;

  return `<div class="card${isOpen ? ' open' : ''}" id="c${svc.id}">
    <div class="card-top" onclick="toggle(${svc.id})">
      <div class="svc-icon" style="background:${svc.color}1a;color:${svc.color};">${svc.icon}</div>
      <div class="svc-meta">
        <div class="svc-name">${svc.name}</div>
        <div class="svc-sub">${countText}</div>
      </div>
      <div class="card-right">
        <span class="badge ${STATUS_CLASS[svc.status] || 's-ok'}">${STATUS_TEXT[svc.status] || svc.status}</span>
        <span class="chevron${isOpen ? ' flip' : ''}">›</span>
      </div>
    </div>
    <div class="sparks">${sparks}<span class="spark-label">24h</span></div>
    <div class="detail${isOpen ? ' visible' : ''}">
      <div class="detail-cols">
        <div>
          <div class="col-head">open reports</div>
          ${reportLines}
        </div>
        <div>
          <div class="col-head">seen something?</div>
          <p class="hint">File a GitHub issue — it shows up here in real time.</p>
          <button class="report-btn" onclick="openReport(event,'${svc.issueUrl}')">+ report issue</button>
          ${configured ? `<a class="gh-link" href="https://github.com/${GITHUB_REPO}/issues?q=label%3A${encodeURIComponent(svc.label)}" target="_blank" rel="noopener">all reports ↗</a>` : ''}
        </div>
      </div>
      <div class="tl-wrap">
        <div class="col-head">last 24 hours</div>
        <div class="tl">${tl}</div>
        <div class="tl-ends"><span>24h ago</span><span>now</span></div>
      </div>
    </div>
  </div>`;
}

function render() {
  const configured = !!GITHUB_REPO;

  const visible = liveServices.filter(s => {
    const fm = filter === 'all' || filter === s.category || filter === s.status;
    return fm && s.name.toLowerCase().includes(query);
  });

  const rank = { down:0, issues:1, investigating:2, ok:3 };
  visible.sort((a, b) => rank[a.status] - rank[b.status]);

  document.getElementById('s-ok').textContent      = configured ? liveServices.filter(s => s.status === 'ok').length : '—';
  document.getElementById('s-issues').textContent  = configured ? liveServices.filter(s => s.status !== 'ok').length : '—';
  document.getElementById('s-reports').textContent = configured ? liveServices.reduce((n, s) => n + s.reports, 0).toLocaleString() : '—';

  document.getElementById('service-list').innerHTML = visible.length
    ? visible.map(card).join('')
    : '<div class="empty">nothing matches</div>';
}

// ── interactions ─────────────────────────────────────────────────────────────

function toggle(id)        { expanded = expanded === id ? null : id; render(); }
function openReport(e, url){ e.stopPropagation(); window.open(url, '_blank', 'noopener'); }

function setFilter(f, el) {
  filter = f;
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  render();
}

function onSearch() {
  query = document.getElementById('search').value.toLowerCase().trim();
  render();
}

// ── data loading ─────────────────────────────────────────────────────────────

function banner(msg, type) {
  let el = document.getElementById('banner');
  if (!el) {
    el = document.createElement('div');
    el.id = 'banner';
    const ref = document.getElementById('filters');
    ref.parentNode.insertBefore(el, ref);
  }
  el.className = `banner banner-${type}`;
  el.innerHTML = msg;
}
function clearBanner() { document.getElementById('banner')?.remove(); }

async function boot() {
  // wire up suggest link in footer
  if (GITHUB_REPO) {
    const t = encodeURIComponent('Service suggestion');
    const b = encodeURIComponent('**Service name:**\n**Website:**\n**Category:** (social / streaming / gaming / cloud / developer / finance / ai)\n\n**Why add it?**\n');
    document.getElementById('suggest-link').href =
      `https://github.com/${GITHUB_REPO}/issues/new?title=${t}&body=${b}&labels=service-request`;
  }

  if (!GITHUB_REPO) {
    banner('Set <code>GITHUB_REPO</code> in services.js to load live reports.', 'info');
    render();
    return;
  }

  banner('Loading reports…', 'loading');

  try {
    // github REST API allows CORS on public repos, no proxy needed
    // rate limit: 60 unauthenticated req/hr per IP — totally fine here
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/issues?state=all&per_page=100&sort=created&direction=desc`,
      { headers: { Accept: 'application/vnd.github.v3+json' } }
    );

    if (res.status === 404) throw new Error(`repo "${GITHUB_REPO}" not found or not public`);
    if (!res.ok)            throw new Error(`GitHub API: HTTP ${res.status}`);

    const all = await res.json();

    liveServices = SERVICES.map(svc => {
      const mine = all.filter(i => i.labels.some(l => l.name === svc.label));
      return crunch(svc, mine);
    });

    clearBanner();
  } catch (err) {
    console.error('[netpulse]', err.message);
    banner(`couldn't reach GitHub: ${err.message}`, 'error');
    liveServices = SERVICES.map(blankService);
  }

  render();
  tick();
}

// update the "N min ago" clock
function tick() {
  const el = document.getElementById('last-updated');
  if (!el) return;
  const mins = Math.floor((Date.now() - startedAt) / 60_000);
  el.textContent = mins < 1 ? 'just now' : `${mins}m ago`;
  setTimeout(tick, 30_000);
}
