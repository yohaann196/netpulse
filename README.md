# netpulse

crowdsourced service status. users file github issues, page counts them.

---

## setup

1. create a public github repo
2. set `GITHUB_REPO` in `services.js` — e.g. `'alice/netpulse'`
3. create github labels for every service (see label-setup below)
4. deploy to github pages: settings → pages → main → / (root)

---

## adding a service

add an entry to `SERVICES` in `services.js`:

```js
{ id: 101, name: 'Cloudinary', icon: '◈', color: '#3448C5', category: 'developer', label: 'cloudinary' },
```

then create the matching label in the repo. use `add-service.html` locally to generate both the snippet and the curl command without touching code.

---

## creating labels (one-time setup)

replace `you/netpulse` and add a token with `repo` scope:

```bash
REPO="you/netpulse"
TOKEN="ghp_..."

for label in discord slack twitter-x instagram facebook whatsapp telegram reddit linkedin snapchat tiktok pinterest mastodon twitch zoom teams youtube netflix spotify disney-plus apple-music soundcloud hulu hbo-max amazon-prime apple-tv peacock deezer plex steam playstation xbox roblox epic-games riot-games battle-net ea-origin nintendo minecraft ubisoft gog aws google-cloud azure cloudflare vercel netlify heroku digitalocean fastly akamai render fly-io railway github gitlab bitbucket npm pypi docker-hub sentry datadog pagerduty jira confluence linear notion figma supabase firebase mongodb-atlas planetscale neon postman openai anthropic google-gemini midjourney hugging-face replicate perplexity cursor stripe paypal shopify square coinbase plaid braintree adyen google-workspace dropbox onedrive twilio sendgrid mailchimp intercom zendesk hubspot salesforce service-request; do
  curl -s -X POST "https://api.github.com/repos/$REPO/labels" \
    -H "Authorization: token $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$label\",\"color\":\"0075ca\"}" > /dev/null
  echo "created: $label"
done
```

---

## managing reports

- close spam/invalid issues on github — closed issues don't count
- `service-request` labeled issues = someone wants a new service added
- all other issues are outage reports and count toward report totals

---

## how status thresholds work

| open reports | status shown |
|---|---|
| 0 | Operational |
| 1–3 | Degraded |
| 4+ | Major Outage |

adjust `toStatus()` in `app.js` if needed.
