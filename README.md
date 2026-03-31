# Netpulse

A clean service status monitor powered by **GitHub Issues as a database**.

- Users click "Report issue" → lands on a pre-filled GitHub Issue
- The GitHub API (CORS-safe, no proxy needed) counts open issues per service
- Report counts update live on every page load
- Zero backend. Zero database. Zero cost.

---

## Setup (2 minutes)

### 1. Fork or create the repo

Push the `netpulse/` folder to a **public** GitHub repo.

### 2. Set your repo name in `data.js`

```js
const GITHUB_REPO = 'your-username/netpulse';
```

### 3. Create the issue labels

Go to your repo → **Issues → Labels → New label** and create one label for each service:

```
discord  github  cloudflare  aws  notion  linear  vercel  stripe  shopify  twilio
```

Or run this in your terminal (replace `you/netpulse` and add a GitHub token):

```bash
REPO="you/netpulse"
TOKEN="ghp_yourtoken"
for label in discord github cloudflare aws notion linear vercel stripe shopify twilio; do
  curl -s -X POST "https://api.github.com/repos/$REPO/labels" \
    -H "Authorization: token $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$label\",\"color\":\"0075ca\"}"
done
```

### 4. Deploy to GitHub Pages

**Settings → Pages → Deploy from branch → main → / (root)**

Your site goes live at `https://your-username.github.io/netpulse`.

---

## How it works

```
User clicks "Report issue"
        ↓
Pre-filled GitHub Issue opens (label applied automatically)
        ↓
Issue count fetched via GitHub API on next page load
        ↓
Report counts update, status badge changes
```

The GitHub REST API returns open issues from public repos with full CORS headers — no worker, no server, no proxy required. The page fetches `https://api.github.com/repos/{owner}/{repo}/issues` directly from the browser.

**Status thresholds:**
- 0 reports → Operational
- 1–3 reports → Degraded
- 4+ reports → Major Outage

---

## Adding services

Edit the `SERVICE_DEFS` array in `data.js`:

```js
{ id:11, name:'Twitch', icon:'◈', color:'#9146FF', category:'streaming', label:'twitch' },
```

Then create the matching `twitch` label in your GitHub repo.

---

## Project structure

```
netpulse/
├── index.html   markup
├── style.css    styles (light + dark mode)
├── data.js      GitHub API fetcher — set GITHUB_REPO here
├── app.js       rendering and interaction
└── README.md
```

---

## License

MIT
