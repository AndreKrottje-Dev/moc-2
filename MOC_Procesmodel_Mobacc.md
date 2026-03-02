# MOC Digitaal Procesmodel (Mobacc)

## 1) Doel en uitgangspunt
- Dit model digitaliseert het huidige formulier `MHB12-3-4-1F1_R` naar een beheersbaar workflow-proces.
- Scope: van aanvraag tot evaluatie en afsluiting.
- Principe: safety-first, compliance-first, traceerbaar per stap.

## 2) Mobacc huisstijl (voor UI)
- Primair accent (header, primaire CTA): `#FF1721` (Mobacc rood)
- Secundair (tekst, secundaire knoppen): `#63757D` (antraciet)
- Achtergrond/cards: `#FFFFFF`
- Tone of voice: zakelijk, technisch, kort, feitelijk.
- CTA labels: “Valideren”, “Goedkeuren”, “Doorzetten”, “Afsluiten”.

## 3) Rollen
- **Aanvrager**: maakt MOC-aanvraag aan, levert toelichtingen en sluit evaluatie af.
- **MOC-team**: voert toetsing en gevaaridentificatie uit.
- **Eindverantwoordelijke**: formele goedkeuring en vrijgave uitvoering.
- **Manager HSE**: HSE-goedkeuring en evaluatie.
- **Technical Engineer**: technische toetsing en goedkeuring.
- **Plantmanagement**: archivering na afronding.

## 4) Statusmodel
1. `Draft` – aanvraag in opbouw
2. `Submitted` – aanvraag ingediend
3. `Intake_Validated` – MOC vereist bevestigd
4. `Team_Assessment` – toetsing door MOC-team
5. `Hazard_Analysis` – gevaaridentificatie + risicobeoordeling
6. `Action_Plan` – benodigde acties vastgesteld
7. `Pending_Approvals` – autorisaties open
8. `Approved_For_Execution` – uitvoering toegestaan
9. `Execution_Checked` – uitvoering gecontroleerd
10. `Evaluation` – effectiviteit en afronding beoordeeld
11. `Closed` – MOC afgesloten en gearchiveerd
12. `Rejected` – afgewezen

## 5) Beslisgates (procesflow)
### Gate A — Is het identieke vervanging?
- **Ja** → `Rejected` met reden: “Geen MOC vereist”.
- **Nee** → door naar `Intake_Validated`.

### Gate B — Type wijziging
- **Blijvend** → standaardflow.
- **Tijdelijk** → extra verplichte velden: einddatum, eigenaar ongedaanmaking.
- **Noodmaatregel** → extra verplichte velden: reden noodmaatregel, aanvullende voorzorgen, melding binnen 24 uur.

### Gate C — MOC-team toetsing
- Regel uit formulier: als minimaal 1 toetsingsitem = **Ja**, aanvraag is valide en gevarenidentificatie is verplicht.
- Als alle items **Nee**: route naar `Rejected` of terug naar `Draft` (afhankelijk van governance-keuze).

### Gate D — Gevaaridentificatie compleet?
- Voor elk item met **Ja** is toelichting verplicht.
- Risicobeoordeling met risicomatrix (MHB12.3.1W1) verplicht bij elk **Ja**.
- Pas na compleetheid door naar `Action_Plan`.

### Gate E — Acties + autorisaties
- Alle verplichte acties krijgen eigenaar + deadline + status.
- Goedkeuring vereist van minimaal: Eindverantwoordelijke, Manager HSE, Technical Engineer.
- Na volledige goedkeuring: `Approved_For_Execution`.

### Gate F — Evaluatie en afsluiting
- Vragen:
  - Heeft de wijziging het beoogde effect?
  - Zijn alle acties afgerond?
- Alleen bij beide **Ja** → `Closed`.
- Anders: terug naar `Action_Plan` of nieuwe MOC starten.

## 6) Verplichte velden per fase
## Intake (`Draft`/`Submitted`)
- Datum aanvraag
- Type wijziging
- Installatieonderdeel
- Volledige omschrijving wijziging
- Justificatie
- Naam aanvrager

## Tijdelijke wijziging (conditioneel)
- Duur/einddatum tijdelijke wijziging
- Wie maakt wijziging ongedaan

## Noodmaatregel (conditioneel)
- Waarom noodmaatregel
- Aanvullende voorzorgen
- Tijdstip melding (SLA: binnen 24 uur)

## Team assessment
- Ja/Nee per categorie (technisch, chemisch, instrumenteel, procedureel, beveiliging, organisatorisch, inkoop, extern, milieu)
- Opmerking per categorie (optioneel, maar aanbevolen)

## Gevaaridentificatie
- Ja/Nee per item
- Verplichte toelichting voor elk Ja
- Risicomatrix-score per Ja

## Actielijst
- Actietype (P&ID, HAZOP, C&E, PSSR, training, vergunningen, MAR/BRD, etc.)
- Ja/Nee/N.v.t.
- Toelichting
- Eigenaar
- Deadline
- Gereedmelding

## Autorisatie
- Digitale akkoordregistratie (naam, rol, datum/tijd)
- Eventueel opmerkingenveld

## Evaluatie
- Beoogd effect behaald (Ja/Nee)
- Alle acties afgerond (Ja/Nee)
- Toelichting/opmerkingen

## 7) Bedrijfsregels (implementatie)
- `MOC-nummer` automatisch genereren bij eerste submit (niet handmatig invoeren).
- Geen doorgang naar volgende fase bij open verplichte velden.
- Geen sluiting (`Closed`) zolang er open acties bestaan.
- Audit trail verplicht op elke veldwijziging en statusovergang.
- Bij `Noodmaatregel`: automatische HSE-notificatie direct na submit.
- Bij `Tijdelijke wijziging`: automatische reminder voor ongedaanmaken op einddatum.

## 8) Notificaties
- Bij submit: notificatie naar MOC-team.
- Bij pending approvals: notificatie per fiatteur.
- Bij goedkeuring: notificatie naar uitvoerder(s) + aanvrager.
- Bij naderende deadlines: herinnering T-7 en T-1 dagen.
- Bij overschrijding deadline: escalatie naar Eindverantwoordelijke en Manager HSE.

## 9) Dashboard KPI’s
- Aantal open MOC’s per fase
- Doorlooptijd per fase en totaal
- % noodmaatregelen
- % tijdelijke wijzigingen op tijd ongedaan gemaakt
- Aantal overdue acties
- Afwijsredenen top-5

## 10) MVP volgorde (aanbevolen)
1. Intake + Gate A/B
2. Team assessment + Gate C
3. Gevaaridentificatie + Gate D
4. Actielijst + autorisaties + Gate E
5. Evaluatie + Gate F + dashboard

