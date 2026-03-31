# Netpulse

A clean service status monitor powered by **GitHub Issues as a database**.

- Users click "Report issue" → lands on a pre-filled GitHub Issue
- The GitHub API (CORS-safe, no proxy needed) counts open issues per service
- Report counts update live on every page load
- Zero backend. Zero database. Zero cost.

---

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

