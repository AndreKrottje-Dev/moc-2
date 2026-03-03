const workflowStates = [
  {
    id: "Draft",
    title: "1. Draft",
    owner: "Aanvrager",
    rule: "Pagina 1 volledig invullen.",
    event: "moc.draft.saved",
  },
  {
    id: "Team_Routing",
    title: "2. Team Routing",
    owner: "n8n",
    rule: "Routering naar functionarissen op basis van MOC type.",
    event: "moc.team.routing",
  },
  {
    id: "Assessment_P3",
    title: "3. Toetsing",
    owner: "MOC-team",
    rule: "Minimaal 1x Ja op pagina 3 => aanvraag valide.",
    event: "moc.page3.assessed",
  },
  {
    id: "Hazard_P4",
    title: "4. Gevaaridentificatie",
    owner: "Functionarissen",
    rule: "Ja/Nee + toelichting per item, per functionaris.",
    event: "moc.page4.completed",
  },
  {
    id: "Conclusion_P5",
    title: "5. Conclusie",
    owner: "Aanvrager",
    rule: "Consolidatie + eventuele AI analyse.",
    event: "moc.page5.concluded",
  },
  {
    id: "Actions_P6",
    title: "6. Actielijst",
    owner: "Aanvrager + HSE",
    rule: "Benodigde acties vastleggen en beheren.",
    event: "moc.page6.actions",
  },
  {
    id: "Execution_P7",
    title: "7. Uitvoering",
    owner: "Team",
    rule: "Uitvoering controleren en vastleggen.",
    event: "moc.page7.execution",
  },
  {
    id: "Evaluation_P8",
    title: "8. Evaluatie",
    owner: "Team",
    rule: "4 weken na uitvoeringsdatum reminder + evaluatie.",
    event: "moc.page8.evaluation",
  },
  {
    id: "Closed",
    title: "9. Closed",
    owner: "Plantmanagement",
    rule: "Afgerond en archivering.",
    event: "moc.closed",
  },
];

const WEBHOOKS = {
  saveDraft: "https://YOUR-N8N/webhook/moc-save-draft",
  submitForm: "https://YOUR-N8N/webhook/moc-submit-full",
  stateClick: "https://YOUR-N8N/webhook/moc-state-click",
  syncKpi: "https://YOUR-N8N/webhook/moc-kpi-sync",
};

const pageCaption = document.getElementById("page-caption");
const pageNav = document.getElementById("page-nav");
const pages = Array.from(document.querySelectorAll(".form-page"));
const form = document.getElementById("moc-form");
const toast = document.getElementById("toast");
const flowGrid = document.getElementById("flow-grid");
const phaseDetail = document.getElementById("phase-detail");

let currentPage = 1;

const installatieOnderdelen = [
  "Vullijn 1",
  "Vullijn 2",
  "Menginstallatie A",
  "Menginstallatie B",
  "Afvulstation Noord",
  "Ketelruimte",
  "Persluchtvoorziening",
  "PLC Hoofdkast",
];

const p3Toetsing = {
  "Technische wijzigingen gebouwen of installaties": [
    "Productie-installaties",
    "Utiliteiten",
    "Grondstofsystemen",
    "Hoog- en laagspanningssystemen",
    "Ketels, leidingen en vaten",
    "Lines of Defence",
    "Apparatuur verwijderen/toevoegen",
    "Niet identieke vervanging",
    "Wijziging ontwerpspecificaties",
    "Tijdelijke aansluitingen in productieprocessen",
    "Significante aanpassingen in gebouwen",
  ],
  "Chemische wijzigingen": [
    "Chemische wijziging productieproces",
    "Nieuwe (toepassing) chemicaliën",
    "Wijziging in bereiding recept (apparatuur)",
  ],
  "Instrumentele wijzigingen": [
    "Proces hardware",
    "Software en gerelateerde instrumentatie",
    "Tijdelijk buiten ingestelde limieten werken",
  ],
  "Procedurele wijzigingen": ["Procedurele wijzigingen met gevolg voor veiligheid/arbo/milieu"],
  "Wijziging beveiligingssystemen": [
    "Veiligheidssysteem / PBM toevoegen/wijzigen",
    "Overbrugging (w.o. arbo)",
    "Veranderen van afstelling",
    "Milieu",
  ],
  "Organisatorische wijzigingen": [
    "Significante wijziging in personele bezetting",
    "Significante wijzigingen in functieomschrijving",
    "Significante wijziging in organisatiestructuur",
    "Vervanging met effect voor veiligheid",
  ],
  "Wijzigingen in de markt/inkoop": [
    "Invloed op gebruikers van eindproducten",
    "Wijziging van leverancier of buitenfirma",
  ],
  "Externe wijzigingen": ["Wijzigingen bestemmingsplannen", "Wijzigingen binnen risicocontouren"],
  Milieu: [
    "Bodem/lucht/emissie/geluid/afval/hinder",
    "Vergunningen inclusief omgevingsvergunning",
    "Naamswijziging organisatie - vergunning",
    "Aspecten activiteitenbesluit/regeling",
  ],
};

const p4Gevaar = {
  "Invloed op proces": ["Temperatuur", "Druk", "Doorzet", "Niveau", "Anders"],
  "Effect op ARBO veiligheid": [
    "RI&E",
    "Fysieke belasting",
    "ARBO",
    "BRZO/PBZO",
    "Scenario’s (ARIE/bedrijfsnoodplan)",
    "Brandmelding of -bestrijding",
    "Statische elektriciteit",
    "Aarding of bliksemafleiding",
    "Zone indeling (ATEX 153)",
    "Anders",
  ],
  "Invloed op chemie": [
    "Samenstelling",
    "Giftigheid (H)",
    "Brandbaarheid (F)",
    "Reactiviteit (R)",
    "Reactiekinetiek",
    "Receptuur",
    "Warmte ontwikkeling (run-away)",
    "Foute volgorde/combinaties",
    "Veilige grenzen",
    "Anders",
  ],
  "Effect op milieu": [
    "Geluid",
    "Lekkages (spills)",
    "Emissies",
    "Afvalstromen",
    "Afvalwater",
    "Bodemverontreiniging",
    "Omgevingsvergunning milieu (WABO)",
    "Milieuaspectenregister",
    "Anders",
  ],
  "Effect op ontwerp": [
    "Ontwerp druk",
    "Ontwerp temperatuur",
    "Ontwerp doorzet",
    "Constructie materialen",
    "(Tijdelijk) aanpassing/nieuw leidingwerk",
    "Brandbaarheid & Giftigheid index",
    "Anders",
  ],
  "Gevolgen voor procedures": [
    "Lijst actieve documenten",
    "Handleidingen",
    "Inspecties",
    "Noodprocedures",
    "Start-up procedure",
    "Training en onderricht",
    "Bedrijfsnoodorganisatie preparatie",
    "Bedrijfsnoodorganisatie repressie",
    "Anders",
  ],
  "Gebouw / bijgebouw": ["Nieuw/wijziging omgevingsvergunning", "Anders"],
  "Invloed op alarmeringen/beveiligingen": [
    "Instrument ranges/instellingen",
    "Lokale alarm",
    "Trip/alarm instellingen",
    "Hardware matige trips",
    "PLC software",
    "Process control software",
    "Anders",
  ],
  "Effect op kwaliteit": [
    "Product kwaliteit",
    "Product specificaties",
    "Analyse methodes",
    "Voedselveiligheid (BRC/HACCP)",
    "Medische hulpmiddelen/cosmetica",
    "Anders",
  ],
};

const p172Checklist1 = [
  "Storing in aanvoer processtoffen",
  "Storing in afvoer processtoffen",
  "Storing in elektriciteitsvoorziening",
  "Storing in koel-/warmwatervoorziening",
  "Storing in proceswatervoorziening",
  "Storing in luchtvoorziening",
  "Storing in stoomvoorziening",
  "Storing in inert gasvoorziening",
  "Storing in brandstofvoorziening",
  "Explosie of brand in omgeving",
  "Extreem hoge buiten temperatuur",
  "Extreem lage buiten temperatuur",
  "Overstroming",
  "Grondverzakking",
  "Blikseminslag",
  "Mechanische belasting",
  "Ongevallen casuïstiek",
  "Emissies van beveiligingen",
];

const p172Checklist2 = [
  "Overschrijding veilige grenzen",
  "Inwendige corrosie",
  "Uitwendige corrosie",
  "Erosie",
  "Trillingen",
  "Mechanische spanningen/vermoeiing",
  "Overdruk door vervuiling of verstopping",
  "Onderdruk",
  "Thermische expansie",
  "Contractie",
  "Ontmenging en/of stratificatie",
  "Falen van afdichtingen",
  "Onjuiste monstername",
  "Bedieningsfouten",
  "Brand in beschouwde installatiedeel",
  "Onderhoud/vervanging/wijziging",
];

const actieLijst = [
  "PFD",
  "P&ID",
  "Leidinglijsten/appendages",
  "HAZOP (risicoanalyse)",
  "E-schema’s",
  "Cause & Effect matrix + interlocks",
  "Invloed op installatiescenario’s",
  "TDO / onderhoud",
  "Handleidingen",
  "Training / onderricht / werkinstructies",
  "PSSR (Pre-Safety-Startup-Review)",
  "IQ (Installation Qualification)",
  "Wijzigingslocatie afschermen (GMP/Food/ATEX/Arbo)",
  "Activiteitenbesluit/regeling geraadpleegd",
  "Veiligheidsrapport",
  "UPD (sprinkler)",
  "Milieu Aspecten Register",
  "Bodem Risico Document",
];

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2400);
}

function setRequesterFromProfile() {
  const savedProfile = localStorage.getItem("moc_windows_profile") || "Windows gebruiker (te koppelen via SSO)";
  document.getElementById("requester-field").value = savedProfile;
}

function loadInstallatieOnderdelen() {
  const select = document.getElementById("asset-select");
  installatieOnderdelen.forEach((item) => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    select.appendChild(option);
  });
}

function renderChecklist(containerId, groupMap, prefix) {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }
  container.innerHTML = "";

  Object.entries(groupMap).forEach(([groupTitle, items]) => {
    const block = document.createElement("div");
    block.className = "matrix-block";
    const title = document.createElement("h4");
    title.textContent = groupTitle;
    block.appendChild(title);

    items.forEach((item, index) => {
      const key = `${prefix}_${groupTitle}_${index}`.replace(/[^a-zA-Z0-9_]/g, "_");
      const row = document.createElement("div");
      row.className = "matrix-row";
      row.innerHTML = `
        <div class="matrix-item">${item}</div>
        <div class="matrix-yn">
          <label><input type="radio" name="${key}_yn" value="Ja" /> Ja</label>
          <label><input type="radio" name="${key}_yn" value="Nee" /> Nee</label>
        </div>
        <label class="matrix-note">
          <span>Toelichting</span>
          <textarea name="${key}_toelichting" rows="2"></textarea>
        </label>
      `;
      block.appendChild(row);
    });

    container.appendChild(block);
  });
}

function renderFlatChecklist(containerId, items, prefix) {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }
  container.innerHTML = "";

  items.forEach((item, index) => {
    const key = `${prefix}_${index}`;
    const row = document.createElement("div");
    row.className = "matrix-row";
    row.innerHTML = `
      <div class="matrix-item">${item}</div>
      <div class="matrix-yn">
        <label><input type="radio" name="${key}_yn" value="Ja" /> Ja</label>
        <label><input type="radio" name="${key}_yn" value="Nee" /> Nee</label>
      </div>
      <label class="matrix-note">
        <span>Toelichting</span>
        <textarea name="${key}_toelichting" rows="2"></textarea>
      </label>
    `;
    container.appendChild(row);
  });
}

function countYesAnswers(prefix) {
  const data = formToObject(form);
  return Object.entries(data).filter(([key, value]) => key.startsWith(prefix) && key.endsWith("_yn") && value === "Ja").length;
}

function renderActieLijst() {
  const container = document.getElementById("p6-actielijst");
  if (!container) {
    return;
  }
  container.innerHTML = "";

  actieLijst.forEach((item, index) => {
    const key = `p6_action_${index}`;
    const row = document.createElement("div");
    row.className = "action-row";
    row.innerHTML = `
      <div class="action-name">${item}</div>
      <select name="${key}_status">
        <option value="">Kies</option>
        <option value="Ja">Ja</option>
        <option value="Nee">Nee</option>
        <option value="Nvt">N.v.t.</option>
      </select>
      <input type="text" name="${key}_owner" placeholder="Eigenaar" />
      <input type="date" name="${key}_deadline" />
      <textarea name="${key}_note" rows="2" placeholder="Toelichting"></textarea>
    `;
    container.appendChild(row);
  });
}

function renderPageNav() {
  pageNav.innerHTML = "";
  pages.forEach((_, index) => {
    const pageNumber = index + 1;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `page-chip ${pageNumber === currentPage ? "active" : ""}`;
    button.textContent = `P${pageNumber}`;
    button.addEventListener("click", () => goToPage(pageNumber));
    pageNav.appendChild(button);
  });
}

function goToPage(pageNumber) {
  currentPage = Math.min(8, Math.max(1, pageNumber));
  pages.forEach((page) => {
    page.hidden = Number(page.dataset.page) !== currentPage;
  });

  pageCaption.textContent = `Pagina ${currentPage} van 8`;
  renderPageNav();
}

function formToObject(formElement) {
  const formData = new FormData(formElement);
  const object = {};

  formData.forEach((value, key) => {
    if (object[key] !== undefined) {
      if (!Array.isArray(object[key])) {
        object[key] = [object[key]];
      }
      object[key].push(value);
    } else {
      object[key] = value;
    }
  });

  return object;
}

async function postWebhook(url, payload) {
  if (url.includes("YOUR-N8N")) {
    showToast("Webhook placeholder actief. Vervang URL in app.js.");
    return;
  }

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function validateGateFromPage3() {
  const yesFound = countYesAnswers("p3") > 0;
  return yesFound;
}

function renderWorkflowStates() {
  flowGrid.innerHTML = "";

  workflowStates.forEach((state) => {
    const node = document.createElement("button");
    node.className = "phase";
    node.type = "button";
    node.innerHTML = `<strong>${state.title}</strong><small>${state.owner}</small>`;

    node.addEventListener("click", async () => {
      document.querySelectorAll(".phase").forEach((item) => item.classList.remove("active"));
      node.classList.add("active");

      phaseDetail.innerHTML = `
        <h2>${state.title}</h2>
        <p><strong>Verantwoordelijke:</strong> ${state.owner}</p>
        <p><strong>Regel:</strong> ${state.rule}</p>
        <p><strong>n8n event:</strong> <code>${state.event}</code></p>
        <button class="btn btn-primary" id="trigger-state">Stuur state event</button>
      `;

      document.getElementById("trigger-state").addEventListener("click", async () => {
        await postWebhook(WEBHOOKS.stateClick, {
          stateId: state.id,
          event: state.event,
          timestamp: new Date().toISOString(),
        });
        showToast(`State-event verstuurd: ${state.event}`);
      });
    });

    flowGrid.appendChild(node);
  });
}

function updateKpis() {
  document.getElementById("kpi-open").textContent = "7";
  const valid = validateGateFromPage3();
  document.getElementById("kpi-valid").textContent = valid ? "1" : "0";
  document.getElementById("kpi-approvals").textContent = "3";
  document.getElementById("kpi-reminders").textContent = "2";
}

function attachButtons() {
  document.getElementById("prev-page").addEventListener("click", () => goToPage(currentPage - 1));
  document.getElementById("next-page").addEventListener("click", () => goToPage(currentPage + 1));

  document.getElementById("save-draft").addEventListener("click", async () => {
    const payload = {
      status: "Draft",
      page: currentPage,
      requester: document.getElementById("requester-field").value,
      data: formToObject(form),
      timestamp: new Date().toISOString(),
    };
    await postWebhook(WEBHOOKS.saveDraft, payload);
    localStorage.setItem("moc_last_draft", JSON.stringify(payload));
    showToast("Concept opgeslagen.");
  });

  document.getElementById("save-draft-top").addEventListener("click", () => {
    document.getElementById("save-draft").click();
  });

  document.getElementById("sync-kpi").addEventListener("click", async () => {
    await postWebhook(WEBHOOKS.syncKpi, { action: "kpi_sync", timestamp: new Date().toISOString() });
    showToast("KPI sync getriggerd.");
  });

  document.querySelectorAll("[data-scroll]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.querySelector(button.dataset.scroll);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function validateInstallatieOnderdeel() {
  const select = document.getElementById("asset-select");
  const input = document.getElementById("asset-new");
  const hasSelection = Boolean(select.value);
  const hasNewValue = Boolean(input.value.trim());
  return hasSelection || hasNewValue;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateInstallatieOnderdeel()) {
    showToast("Kies een installatieonderdeel of voeg nieuw onderdeel toe.");
    goToPage(1);
    return;
  }

  const data = formToObject(form);
  const aanvraagValide = validateGateFromPage3();

  const payload = {
    status: "Submitted",
    aanvraagValide,
    requiresHazardIdentification: aanvraagValide,
    routingRoles: {
      aanvrager: data.p2_role_aanvrager || "Aanvrager",
      technicalEngineer: data.p2_role_td || "Technical Engineer / Hoofd TD",
      directieHR: data.p2_role_hr || "Directie / HR",
      plantmanagerDirectie: data.p2_role_plant || "Plantmanager / Directie",
      itManagerDirectie: data.p2_role_it || "IT manager / directie",
    },
    reminders: {
      evaluationAfterWeeks: 4,
      basedOnExecutionDate: data.p3_datum_uitvoering || null,
      reminderEvent: "moc.evaluation.reminder.4weeks",
    },
    analytics: {
      page3YesCount: countYesAnswers("p3"),
      page4YesCount: countYesAnswers("p4"),
      checklist1YesCount: countYesAnswers("p4_check1"),
      checklist2YesCount: countYesAnswers("p4_check2"),
    },
    submittedAt: new Date().toISOString(),
    data,
  };

  await postWebhook(WEBHOOKS.submitForm, payload);
  showToast("MOC formulier verzonden naar workflow.");
  updateKpis();
});

function init() {
  setRequesterFromProfile();
  loadInstallatieOnderdelen();
  renderChecklist("p3-toetsing-groepen", p3Toetsing, "p3");
  renderChecklist("p4-gevaar-groepen", p4Gevaar, "p4");
  renderFlatChecklist("p4-check1", p172Checklist1, "p4_check1");
  renderFlatChecklist("p4-check2", p172Checklist2, "p4_check2");
  renderActieLijst();
  renderWorkflowStates();
  attachButtons();
  goToPage(1);
  updateKpis();
}

init();
