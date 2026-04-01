// app.js

let filter = 'all';
let query = '';
let expanded = null;
let live = SERVICES.map(blank);
const t0 = Date.now();

const LABELS = { ok:'Operational', issues:'Degraded', down:'Major Outage', investigating:'Investigating' };
const CLASSES = { ok:'s-ok', issues:'s-issues', down:'s-down', investigating:'s-investigating' };
const COLORS = { ok:'#639922', issues:'#BA7517', down:'#E24B4A', investigating:'#378ADD' };

const dc = s => COLORS[s] || '#888';
const dim = (v, s) => !v ? 'var(--border)' : v <= 1 ? dc(s) + '66' : dc(s);
const fmt = n => n >= 1000 ? (Math.round(n / 100) / 10) + 'k' : String(n);

function blank(s) {
  return { ...s, status: 'ok', reports: 0, issues: [], history: Array(24).fill(0) };
}

function chooseUrl() {
  return GITHUB_REPO ? `https://github.com/${GITHUB_REPO}/issues/new/choose` : 'https://github.com';
}

function reportUrl(svc) {
  if (!GITHUB_REPO) return 'https://github.com';
  const title = encodeURIComponent(`[${svc.name}] outage report`);
  const body = encodeURIComponent(`**Service:** ${svc.name}\n**When:** ${new Date().toUTCString()}\n\n**What's happening?**\n\n`);
  return `https://github.com/${GITHUB_REPO}/issues/new?template=outage-report.yml&title=${title}&labels=${encodeURIComponent(svc.label)}`;
}

function statusFrom(n) {
  if (!n) return 'ok';
  if (n <= 3) return 'issues';
  return 'down';
}

function digest(svc, raw) {
  const open = raw.filter(i => i.state === 'open');

  const titles = open.slice(0, 4).map(i => {
    const t = i.title.replace(/^\[.+?\]\s*/, '');
    return t.length > 65 ? t.slice(0, 62) + '…' : t;
  });

  // bucket into hourly slots for the sparkline
  const now = Date.now();
  const hist = Array(24).fill(0);
  raw.forEach(i => {
    const age = (now - new Date(i.created_at).getTime()) / 3_600_000;
    if (age < 24) hist[23 - Math.min(23, Math.floor(age))]++;
  });

  const status = statusFrom(open.length);
  return { ...svc, status, reports: open.length, issues: titles, history: hist };
}

function card(svc) {
  const open = expanded === svc.id;
  const ready = !!GITHUB_REPO;
  const peak = Math.max(...svc.history, 1);

  const sparks = svc.history.map(v => {
    const h = Math.max(3, Math.round((v / peak) * 26));
    return `<div class="spark-bar" style="height:${h}px;background:${dim(v, svc.status)};"></div>`;
  }).join('');

  const lines = svc.issues.length
    ? svc.issues.map(t => `<div class="report-line"><span class="report-dot" style="background:${dc(svc.status)};"></span>${t}</div>`).join('')
    : `<div class="report-line muted">nothing filed yet</div>`;

  const tl = svc.history.map(v => {
    const c = !v ? '#639922' : v <= 2 ? '#BA7517' : '#E24B4A';
    return `<div class="tl-seg" style="background:${c};"></div>`;
  }).join('');

  const sub = !ready
    ? '<span class="muted">—</span>'
    : svc.reports === 0
      ? '<span class="muted">no reports</span>'
      : `${fmt(svc.reports)} report${svc.reports === 1 ? '' : 's'}`;

  const ghlink = ready
    ? `<a class="gh-link" href="https://github.com/${GITHUB_REPO}/issues?q=label%3A${encodeURIComponent(svc.label)}" target="_blank" rel="noopener">all reports on GitHub ↗</a>`
    : '';

  // TODO: show "X hours ago" on each report line
  return `<div class="card${open ? ' open' : ''}" id="c${svc.id}">
    <div class="card-top" onclick="toggle(${svc.id})">
      <div class="svc-icon" style="background:${svc.color}1a;color:${svc.color};">${svc.icon}</div>
      <div class="svc-meta">
        <div class="svc-name">${svc.name}</div>
        <div class="svc-sub">${sub}</div>
      </div>
      <div class="card-right">
        <span class="badge ${CLASSES[svc.status] || 's-ok'}">${LABELS[svc.status] || svc.status}</span>
        <span class="chevron${open ? ' flip' : ''}">›</span>
      </div>
    </div>
    <div class="sparks">${sparks}<span class="spark-label">24h</span></div>
    <div class="detail${open ? ' visible' : ''}">
      <div class="detail-cols">
        <div>
          <div class="col-head">open reports</div>
          ${lines}
        </div>
        <div>
          <div class="col-head">seen something?</div>
          <p class="hint">Files a GitHub issue, shows up here automatically.</p>
          <div class="btn-row">
            <button class="report-btn primary" onclick="go(event,'${reportUrl(svc)}')">↑ report outage</button>
            <button class="report-btn" onclick="go(event,'${chooseUrl()}')">+ other</button>
          </div>
          ${ghlink}
        </div>
      </div>
      <div class="tl-wrap">
        <div class="col-head">last 24h</div>
        <div class="tl">${tl}</div>
        <div class="tl-ends"><span>24h ago</span><span>now</span></div>
      </div>
    </div>
  </div>`;
}

function render() {
  const ready = !!GITHUB_REPO;

  const visible = live.filter(s => {
    const fm = filter === 'all' || filter === s.category || filter === s.status;
    return fm && s.name.toLowerCase().includes(query);
  });

  visible.sort((a, b) => {
    const r = { down: 0, issues: 1, investigating: 2, ok: 3 };
    return r[a.status] - r[b.status];
  });

  document.getElementById('s-ok').textContent = ready ? live.filter(s => s.status === 'ok').length : '—';
  document.getElementById('s-issues').textContent = ready ? live.filter(s => s.status !== 'ok').length : '—';
  document.getElementById('s-reports').textContent = ready ? live.reduce((n, s) => n + s.reports, 0).toLocaleString() : '—';

  const list = document.getElementById('service-list');
  list.innerHTML = visible.length ? visible.map(card).join('') : '<div class="empty">nothing matches</div>';
}

function toggle(id) { expanded = expanded === id ? null : id; render(); }
function go(e, url) { e.stopPropagation(); window.open(url, '_blank', 'noopener'); }

function openReportPicker() {
  window.open(chooseUrl(), '_blank', 'noopener');
}

function openAbout() {
  document.getElementById('about-repo-link').href = GITHUB_REPO
    ? `https://github.com/${GITHUB_REPO}`
    : 'https://github.com';
  document.getElementById('about-modal').classList.add('open');
}

function closeAbout(e) {
  if (e instanceof Event && e.target !== document.getElementById('about-modal')) return;
  document.getElementById('about-modal').classList.remove('open');
}

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

function setBanner(msg, type) {
  let el = document.getElementById('banner');
  if (!el) {
    el = document.createElement('div');
    el.id = 'banner';
    document.getElementById('filters').insertAdjacentElement('beforebegin', el);
  }
  el.className = `banner banner-${type}`;
  el.innerHTML = msg;
}
const clearBanner = () => document.getElementById('banner')?.remove();

async function boot() {
  document.getElementById('suggest-link').href = chooseUrl();

  if (!GITHUB_REPO) {
    setBanner('Set <code>GITHUB_REPO</code> in services.js to enable live reports.', 'info');
    render();
    return;
  }

  setBanner('Loading…', 'loading');

  try {
    // github api is CORS-safe on public repos, no proxy or backend needed
    // free tier rate limit: 60 req/hr per IP, way more than enough
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/issues?state=all&per_page=100&sort=created&direction=desc`,
      { headers: { Accept: 'application/vnd.github.v3+json' } }
    );

    if (res.status === 404) throw new Error(`"${GITHUB_REPO}" not found — is the repo public?`);
    if (!res.ok) throw new Error(`github returned ${res.status}`);

    const all = await res.json();

    live = SERVICES.map(svc => {
      const mine = all.filter(i => i.labels.some(l => l.name === svc.label));
      return digest(svc, mine);
    });

    clearBanner();
  } catch (err) {
    console.warn('[netpulse] could not load issues:', err.message);
    setBanner(`couldn't load reports: ${err.message}`, 'error');
    live = SERVICES.map(blank);
  }

  render();
  tick();
}

function tick() {
  const el = document.getElementById('last-updated');
  if (!el) return;
  const mins = Math.floor((Date.now() - t0) / 60_000);
  el.textContent = mins < 1 ? 'just now' : `${mins}m ago`;
  setTimeout(tick, 30_000);
}
