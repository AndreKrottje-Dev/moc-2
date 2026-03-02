# MOC Portal (Mobacc)

Klikbare landingspagina voor het Management of Change proces, met n8n-ready webhook hooks.

## Bestanden
- `index.html` — frontview en interactieve flow
- `styles.css` — Mobacc huisstijl (rood/antraciet/wit)
- `app.js` — fase-interacties, demo data, webhook-calls
- `vercel.json` — route `/` naar `index.html`

## n8n koppelen
Vervang in `app.js` de `WEBHOOKS` placeholders:
- `createRequest`
- `logPhaseClick`
- `syncKpi`

## Deploy
De repo is geschikt voor directe deploy op Vercel als statische site.
