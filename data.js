/**
 * data.js — Service definitions for Netpulse
 *
 * Each service object has:
 *   id        {number}  Unique identifier
 *   name      {string}  Display name
 *   icon      {string}  Unicode symbol used as the icon
 *   color     {string}  Brand hex color (used for icon bg tint)
 *   status    {string}  'ok' | 'issues' | 'down' | 'investigating'
 *   category  {string}  'social' | 'gaming' | 'streaming' | 'cloud'
 *   reports   {number}  Number of user reports in the last 2 hours
 *   uptime    {number}  Uptime percentage (last 30 days)
 *   regions   {Array}   [{r: string, pct: number}] — % of reports per region
 *   issues    {Array}   Known issue strings
 *   history   {Array}   24 hourly report buckets (0 = none, 10 = high)
 *
 * To add a new service, copy an existing entry and update the fields.
 * The UI will pick it up automatically on next render.
 */

const services = [
  {
    id: 1,
    name: 'YouTube',
    icon: '▶',
    color: '#FF0000',
    status: 'ok',
    category: 'streaming',
    reports: 142,
    uptime: 99.8,
    regions: [
      { r: 'North America', pct: 2 },
      { r: 'Europe',        pct: 1 },
      { r: 'Asia',          pct: 3 },
      { r: 'South America', pct: 1 },
    ],
    issues: ['Occasional buffering on 4K streams', 'Studio upload latency +200ms'],
    history: [0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  },
  {
    id: 2,
    name: 'Discord',
    icon: '◈',
    color: '#5865F2',
    status: 'issues',
    category: 'social',
    reports: 4821,
    uptime: 94.1,
    regions: [
      { r: 'North America', pct: 18 },
      { r: 'Europe',        pct: 22 },
      { r: 'Asia',          pct: 12 },
      { r: 'South America', pct: 8  },
    ],
    issues: [
      'Voice connections dropping in large servers',
      'Message delivery delays 3–12s',
      'File uploads failing intermittently',
    ],
    history: [0,0,0,0,0,0,0,1,2,3,4,3,4,5,4,4,3,3,2,2,1,1,1,2],
  },
  {
    id: 3,
    name: 'GitHub',
    icon: '◉',
    color: '#24292f',
    status: 'ok',
    category: 'cloud',
    reports: 89,
    uptime: 99.95,
    regions: [
      { r: 'North America', pct: 1 },
      { r: 'Europe',        pct: 1 },
      { r: 'Asia',          pct: 2 },
      { r: 'South America', pct: 1 },
    ],
    issues: ['Minor CI/CD queue delays'],
    history: [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
  },
  {
    id: 4,
    name: 'Roblox',
    icon: '◧',
    color: '#E8081B',
    status: 'down',
    category: 'gaming',
    reports: 38402,
    uptime: 61.2,
    regions: [
      { r: 'North America', pct: 72 },
      { r: 'Europe',        pct: 68 },
      { r: 'Asia',          pct: 45 },
      { r: 'South America', pct: 80 },
    ],
    issues: [
      'Login servers offline',
      'Game servers unresponsive',
      'Marketplace inaccessible',
      'Avatar editor not loading',
    ],
    history: [0,0,0,0,0,1,2,4,6,8,9,10,10,9,9,8,8,7,7,8,8,9,9,10],
  },
  {
    id: 5,
    name: 'Instagram',
    icon: '⬡',
    color: '#E1306C',
    status: 'ok',
    category: 'social',
    reports: 311,
    uptime: 99.3,
    regions: [
      { r: 'North America', pct: 3 },
      { r: 'Europe',        pct: 2 },
      { r: 'Asia',          pct: 4 },
      { r: 'South America', pct: 5 },
    ],
    issues: ['Story views occasionally not updating'],
    history: [0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],
  },
  {
    id: 6,
    name: 'Netflix',
    icon: '▣',
    color: '#E50914',
    status: 'ok',
    category: 'streaming',
    reports: 204,
    uptime: 99.6,
    regions: [
      { r: 'North America', pct: 2 },
      { r: 'Europe',        pct: 3 },
      { r: 'Asia',          pct: 2 },
      { r: 'South America', pct: 4 },
    ],
    issues: ['Subtitle sync issues on select titles'],
    history: [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0],
  },
  {
    id: 7,
    name: 'AWS',
    icon: '⬢',
    color: '#FF9900',
    status: 'issues',
    category: 'cloud',
    reports: 1238,
    uptime: 97.8,
    regions: [
      { r: 'us-east-1',        pct: 15 },
      { r: 'eu-west-1',        pct: 8  },
      { r: 'ap-southeast-1',   pct: 5  },
      { r: 'us-west-2',        pct: 3  },
    ],
    issues: [
      'EC2 instance launch failures in us-east-1',
      'RDS connection timeouts elevated',
      'S3 PUT latency +400ms in us-east-1',
    ],
    history: [0,0,0,0,0,0,0,0,0,1,2,3,4,4,3,3,2,2,2,1,1,1,1,1],
  },
  {
    id: 8,
    name: 'Steam',
    icon: '⊕',
    color: '#1b2838',
    status: 'ok',
    category: 'gaming',
    reports: 178,
    uptime: 99.4,
    regions: [
      { r: 'North America', pct: 2 },
      { r: 'Europe',        pct: 2 },
      { r: 'Asia',          pct: 3 },
      { r: 'South America', pct: 2 },
    ],
    issues: ['Store page load times slightly elevated'],
    history: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
  },
  {
    id: 9,
    name: 'Spotify',
    icon: '◎',
    color: '#1DB954',
    status: 'ok',
    category: 'streaming',
    reports: 95,
    uptime: 99.9,
    regions: [
      { r: 'North America', pct: 1 },
      { r: 'Europe',        pct: 1 },
      { r: 'Asia',          pct: 1 },
      { r: 'South America', pct: 2 },
    ],
    issues: [],
    history: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  },
  {
    id: 10,
    name: 'Cloudflare',
    icon: '☁',
    color: '#F48120',
    status: 'investigating',
    category: 'cloud',
    reports: 657,
    uptime: 98.9,
    regions: [
      { r: 'North America', pct: 5 },
      { r: 'Europe',        pct: 7 },
      { r: 'Asia',          pct: 6 },
      { r: 'South America', pct: 4 },
    ],
    issues: [
      'Investigating elevated error rates on proxy',
      'Some DDoS mitigation delays reported',
    ],
    history: [0,0,0,0,0,0,0,0,0,0,1,2,2,2,2,1,1,1,1,1,1,1,1,1],
  },
];
