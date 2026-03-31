# netpulse

crowdsourced service status tracker for 100+ popular services. users report outages by filing github issues — no backend, no database, no scraping.

## how it works

each service has a github label. when someone reports an outage, they file an issue with that label applied. the page fetches open issues from the github api on load, counts them by label, and updates the status badge in real time. closed issues don't count.

users can also suggest new services via a separate issue template. those get reviewed and added manually.

## stack

static html/css/js — no framework, no build step. deployed on github pages. data comes entirely from the github issues api, which allows cors on public repos so no proxy is needed.

## status thresholds

| open reports | status shown |
|---|---|
| 0 | Operational |
| 1–3 | Degraded |
| 4+ | Major Outage |
