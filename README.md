# Netpulse

A clean, fast, ad-free service status monitor — a better Downdetector.

![Status: Operational](https://img.shields.io/badge/status-operational-brightgreen)

## Features

- **Live status dashboard** — see which services are up, degraded, or down at a glance
- **Severity sorting** — outages bubble to the top automatically
- **Spark charts** — 24-hour report history per service rendered inline
- **Expandable detail panels** — regional breakdown, known issues, and a status timeline
- **Search + filter** — by category (Social, Gaming, Streaming, Cloud) or by status
- **Dark mode** — follows your system preference automatically
- **No backend required** — pure HTML/CSS/JS, works as a static site

## Getting Started

1. Clone or download this repo
2. Open `index.html` in your browser — no build step, no dependencies

```bash
git clone https://github.com/your-username/netpulse.git
cd netpulse
open index.html   # macOS
# or just drag index.html into your browser
```

## Deploying to GitHub Pages

1. Push the repo to GitHub
2. Go to **Settings → Pages**
3. Set source to **Deploy from a branch → main → / (root)**
4. Your site will be live at `https://your-username.github.io/netpulse`

## Adding or Editing Services

All service data lives in `data.js`. Each service looks like this:

```js
{
  id: 11,
  name: 'Twitch',
  icon: '◈',
  color: '#9146FF',
  status: 'ok',            // 'ok' | 'issues' | 'down' | 'investigating'
  category: 'streaming',   // 'social' | 'gaming' | 'streaming' | 'cloud'
  reports: 54,
  uptime: 99.7,
  regions: [
    { r: 'North America', pct: 1 },
    { r: 'Europe',        pct: 1 },
  ],
  issues: [],
  history: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
},
```

Copy any existing entry, update the fields, and the UI picks it up automatically.

## Project Structure

```
netpulse/
├── index.html   — markup and layout
├── style.css    — all styles (light + dark mode)
├── data.js      — service definitions (edit this to add services)
├── app.js       — rendering and interaction logic
└── README.md
```

## Roadmap

- [ ] Real-time data via a backend API or scraping
- [ ] User report submission ("I'm having issues too")
- [ ] Email / webhook alerts for status changes
- [ ] Uptime history graphs (Chart.js)
- [ ] PWA / installable app

## License

MIT — do whatever you want with it.
