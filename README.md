# MOC Portal (Mobacc)

Klikbare frontview met een digitaal 8-pagina MOC-formulier, gebaseerd op het bestaande document `MHB12-3-4-1F1_R`.

## Inhoud
- `index.html` — 8-pagina formulier + workflow sectie
- `styles.css` — Mobacc huisstijl (`#FF1721`, `#63757D`, wit)
- `app.js` — formulierlogica, checklistrendering, workflowevents en webhookcalls
- `vercel.json` — route `/` naar `index.html`

## Functioneel
- Pagina 1 digitaal gelijkwaardig aan het bestaande aanvraagformulier
- Installatieonderdeel via selectielijst of nieuw invoerveld
- Aanvrager-veld voorbereid op koppeling met Windows-profiel/SSO
- Pagina 3 leidende toetsingslijst: minimaal 1x `Ja` => aanvraag valide
- Pagina 4 gevarenidentificatie met `Ja/Nee` én toelichting per item
- Pagina 5 conclusie (met optionele AI-analyse)
- Pagina 6 actielijst (HSE-beheer)
- Pagina 8 evaluatie met reminderlogica (4 weken na uitvoeringsdatum)

## n8n koppelen
Vervang in `app.js` de `WEBHOOKS` placeholders:
- `saveDraft`
- `submitForm`
- `stateClick`
- `syncKpi`

## Deploy
De repo is geschikt voor directe deploy op Vercel als statische site.
