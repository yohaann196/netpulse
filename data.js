// data.js
// uses github issues as a makeshift database — each service has a label,
// users file issues, we count them. no backend, no database, just vibes.
//
// setup:
//   1. make a public github repo
//   2. set GITHUB_REPO below ("you/netpulse")
//   3. create labels in your repo matching the `label` fields below
//   4. deploy to github pages, done

const GITHUB_REPO = ''; // e.g. 'alice/netpulse'

const SERVICES = [
  { id: 1,  name: 'Discord',    icon: '◈', color: '#5865F2', category: 'social', label: 'discord' },
  { id: 2,  name: 'GitHub',     icon: '◉', color: '#24292f', category: 'cloud',  label: 'github' },
  { id: 3,  name: 'Cloudflare', icon: '☁', color: '#F48120', category: 'cloud',  label: 'cloudflare' },
  { id: 4,  name: 'AWS',        icon: '⬢', color: '#FF9900', category: 'cloud',  label: 'aws' },
  { id: 5,  name: 'Notion',     icon: '▣', color: '#6B6B6B', category: 'cloud',  label: 'notion' },
  { id: 6,  name: 'Linear',     icon: '◎', color: '#5E6AD2', category: 'cloud',  label: 'linear' },
  { id: 7,  name: 'Vercel',     icon: '▲', color: '#171717', category: 'cloud',  label: 'vercel' },
  { id: 8,  name: 'Stripe',     icon: '⬡', color: '#635BFF', category: 'cloud',  label: 'stripe' },
  { id: 9,  name: 'Shopify',    icon: '◧', color: '#96BF48', category: 'cloud',  label: 'shopify' },
  { id: 10, name: 'Twilio',     icon: '⊕', color: '#F22F46', category: 'social', label: 'twilio' },
];

let services = makeBlank();

function makeBlank() {
  return SERVICES.map(s => ({
    ...s,
    status: 'ok',
    reports: 0,
    uptime: 99.9,
    issues: [],
    history: Array(24).fill(0),
    issueUrl: issueUrl(s),
  }));
}

function issueUrl(svc) {
  if (!GITHUB_REPO) return 'https://github.com';
  const t = encodeURIComponent(`[${svc.name}] issue report`);
  const b = encodeURIComponent(
    `**Service:** ${svc.name}\n**When:** ${new Date().toUTCString()}\n\n**What's happening:**\n\n`
  );
  return `https://github.com/${GITHUB_REPO}/issues/new?title=${t}&body=${b}&labels=${svc.label}`;
}

function toStatus(n) {
  if (n === 0) return 'ok';
  if (n <= 3)  return 'issues';
  return 'down';
}

function processIssues(svc, raw) {
  const open = raw.filter(i => i.state === 'open');

  const titles = open.slice(0, 4).map(i => {
    // strip "[ServiceName]" prefix if someone followed the template
    const t = i.title.replace(/^\[.+?\]\s*/, '');
    return t.length > 60 ? t.slice(0, 57) + '…' : t;
  });

  // bucket issues into 24 hourly slots for the sparkline
  const now = Date.now();
  const hist = Array(24).fill(0);
  raw.forEach(i => {
    const hrs = (now - new Date(i.created_at).getTime()) / 3_600_000;
    if (hrs < 24) hist[23 - Math.min(23, Math.floor(hrs))]++;
  });

  const status = toStatus(open.length);

  return {
    ...svc,
    status,
    reports: open.length,
    uptime: status === 'ok' ? 99.9 : status === 'issues' ? 97.0 : 89.0,
    issues: titles,
    history: hist,
    issueUrl: issueUrl(svc),
  };
}

function showBanner(msg, type) {
  let el = document.getElementById('np-banner');
  if (!el) {
    el = document.createElement('div');
    el.id = 'np-banner';
    document.querySelector('.app').insertBefore(el, document.getElementById('filters'));
  }
  const styles = {
    loading: 'background:var(--bg-secondary);border-color:var(--border-light);color:var(--text-secondary)',
    error:   'background:#FCEBEB;border-color:#F7C1C1;color:#A32D2D',
    info:    'background:#E6F1FB;border-color:#B5D4F4;color:#185FA5',
  };
  el.style.cssText = `padding:10px 14px;border-radius:8px;font-size:13px;margin-bottom:1rem;border:0.5px solid;${styles[type]}`;
  el.innerHTML = msg;
}

function hideBanner() {
  document.getElementById('np-banner')?.remove();
}

async function loadLiveData() {
  if (!GITHUB_REPO) {
    showBanner('Set <code>GITHUB_REPO</code> in data.js to pull live reports from GitHub.', 'info');
    render();
    return;
  }

  showBanner('Loading…', 'loading');

  try {
    // github's api sends CORS headers on public repos, so this just works
    // unauthenticated limit is 60 req/hr per IP — fine for a status page
    const url = `https://api.github.com/repos/${GITHUB_REPO}/issues?state=all&per_page=100&sort=created&direction=desc`;
    const res = await fetch(url, { headers: { Accept: 'application/vnd.github.v3+json' } });

    if (res.status === 404) throw new Error(`repo not found — is "${GITHUB_REPO}" public?`);
    if (!res.ok) throw new Error(`GitHub returned ${res.status}`);

    const all = await res.json();
    console.log(`[netpulse] got ${all.length} issues from github`); // FIXME: remove before prod

    services = SERVICES.map(svc => {
      const mine = all.filter(i => i.labels.some(l => l.name === svc.label));
      return processIssues(svc, mine);
    });

    hideBanner();
    render();
  } catch (err) {
    console.error('[netpulse] fetch failed', err);
    showBanner(`couldn't load data: ${err.message}`, 'error');
    services = makeBlank();
    render();
  }
}
