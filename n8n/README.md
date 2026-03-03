# n8n setup voor MOC portal

## 1) Workflow importeren
1. Open n8n.
2. Kies **Import from File**.
3. Selecteer `n8n/MOC_Workflow_Webhooks.json`.
4. Sla de workflow op en activeer na controle.

## 2) Webhook paden
Deze workflow verwacht exact deze paden:
- `POST /webhook/moc-save-draft`
- `POST /webhook/moc-submit-full`
- `POST /webhook/moc-state-click`
- `POST /webhook/moc-kpi-sync`

## 3) Front-end koppelen
Zet in `app.js` de echte base-URL van jouw n8n instance:

```js
const WEBHOOKS = {
  saveDraft: "https://<jouw-n8n>/webhook/moc-save-draft",
  submitForm: "https://<jouw-n8n>/webhook/moc-submit-full",
  stateClick: "https://<jouw-n8n>/webhook/moc-state-click",
  syncKpi: "https://<jouw-n8n>/webhook/moc-kpi-sync",
};
```

## 4) Wat de workflow nu doet
- `moc-save-draft`: valideert minimale draft payload en geeft bevestiging terug.
- `moc-submit-full`: bepaalt `mocId`, routeert teamrollen op basis van MOC type, zet status op valide/niet-valide en berekent 4-weken evaluatiedatum.
- `moc-state-click`: logt state-event.
- `moc-kpi-sync`: levert placeholder KPI-antwoord.
- Dagelijkse trigger (`08:00`) maakt reminder-job aan voor evaluatiechecks.

## 5) Volgende uitbreidingen (aanbevolen)
- Koppel database (PostgreSQL/MySQL/Notion/Sheets) om dossiers op te slaan.
- Voeg notificaties toe (Microsoft Teams/Outlook/e-mail) op basis van `teamAssignments`.
- Voeg filtering toe in reminder-flow: stuur alleen reminders als `dueDate === vandaag`.
