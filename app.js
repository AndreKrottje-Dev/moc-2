const phases = [
  {
    id: "Draft",
    title: "1. Draft",
    owner: "Aanvrager",
    rule: "Basisvelden invullen, nog niet ingediend.",
    event: "moc.draft.saved",
  },
  {
    id: "Submitted",
    title: "2. Submitted",
    owner: "Aanvrager",
    rule: "Aanvraag definitief ingediend.",
    event: "moc.submitted",
  },
  {
    id: "Intake_Validated",
    title: "3. Intake Validated",
    owner: "MOC-team",
    rule: "Identieke vervanging? Ja = stop, Nee = door.",
    event: "moc.intake.validated",
  },
  {
    id: "Team_Assessment",
    title: "4. Team Assessment",
    owner: "MOC-team",
    rule: "Minimaal 1x Ja in toetsing => gevarenidentificatie verplicht.",
    event: "moc.team.assessment.completed",
  },
  {
    id: "Hazard_Analysis",
    title: "5. Hazard Analysis",
    owner: "MOC-team + HSE",
    rule: "Bij elk Ja: toelichting + risicobeoordeling verplicht.",
    event: "moc.hazard.analysis.completed",
  },
  {
    id: "Action_Plan",
    title: "6. Action Plan",
    owner: "Engineering + HSE",
    rule: "Acties met eigenaar, deadline, status.",
    event: "moc.action.plan.updated",
  },
  {
    id: "Pending_Approvals",
    title: "7. Pending Approvals",
    owner: "EV + HSE + Technical Engineer",
    rule: "Alle verplichte goedkeuringen benodigd.",
    event: "moc.approvals.pending",
  },
  {
    id: "Approved_For_Execution",
    title: "8. Approved",
    owner: "Eindverantwoordelijke",
    rule: "Wijziging vrijgegeven voor uitvoering.",
    event: "moc.execution.approved",
  },
  {
    id: "Execution_Checked",
    title: "9. Execution Checked",
    owner: "EV + Aanvrager",
    rule: "Uitvoering gecontroleerd en vastgelegd.",
    event: "moc.execution.checked",
  },
  {
    id: "Evaluation",
    title: "10. Evaluation",
    owner: "HSE + Aanvrager",
    rule: "Beoogd effect + afronding acties toetsen.",
    event: "moc.evaluation.completed",
  },
  {
    id: "Closed",
    title: "11. Closed",
    owner: "Plantmanagement",
    rule: "Alle criteria voldaan, dossier gearchiveerd.",
    event: "moc.closed",
  },
];

const sampleCases = [
  { number: "MOC-2026-014", type: "Blijvend", status: "Pending_Approvals" },
  { number: "MOC-2026-015", type: "Tijdelijk", status: "Action_Plan" },
  { number: "MOC-2026-016", type: "Noodmaatregel", status: "Hazard_Analysis" },
];

const WEBHOOKS = {
  createRequest: "https://YOUR-N8N/webhook/moc-create",
  logPhaseClick: "https://YOUR-N8N/webhook/moc-phase-click",
  syncKpi: "https://YOUR-N8N/webhook/moc-kpi-sync",
};

const flowGrid = document.getElementById("flow-grid");
const detail = document.getElementById("phase-detail");
const table = document.getElementById("cases-table");
const toast = document.getElementById("toast");
const modal = document.getElementById("request-modal");
const openRequestButton = document.getElementById("open-request");
const startNowButton = document.getElementById("start-now");
const requestForm = document.getElementById("request-form");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

function renderPhases() {
  flowGrid.innerHTML = "";
  phases.forEach((phase) => {
    const button = document.createElement("button");
    button.className = "phase";
    button.type = "button";
    button.dataset.phase = phase.id;
    button.innerHTML = `<strong>${phase.title}</strong><small>${phase.owner}</small>`;
    button.addEventListener("click", () => selectPhase(phase.id, button));
    flowGrid.appendChild(button);
  });
}

function renderCases() {
  table.innerHTML = "";
  sampleCases.forEach((item) => {
    const row = document.createElement("tr");
    const ok = item.status === "Closed";
    row.innerHTML = `
      <td>${item.number}</td>
      <td>${item.type}</td>
      <td><span class="status ${ok ? "ok" : ""}">${item.status}</span></td>
      <td><button class="btn btn-secondary" type="button">Open</button></td>
    `;
    table.appendChild(row);
  });
}

function updateKpis() {
  document.getElementById("kpi-open").textContent = sampleCases.length;
  document.getElementById("kpi-approvals").textContent = sampleCases.filter(
    (item) => item.status === "Pending_Approvals",
  ).length;
  document.getElementById("kpi-overdue").textContent = 1;
  document.getElementById("kpi-emergency").textContent = sampleCases.filter(
    (item) => item.type === "Noodmaatregel",
  ).length;
}

async function postWebhook(url, payload) {
  if (url.includes("YOUR-N8N")) {
    showToast("Webhook placeholder: vervang URL in app.js");
    return;
  }

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

async function selectPhase(phaseId, button) {
  const phase = phases.find((item) => item.id === phaseId);
  if (!phase) {
    return;
  }

  document.querySelectorAll(".phase").forEach((element) => {
    element.classList.remove("active");
  });
  button.classList.add("active");

  detail.innerHTML = `
    <h2>${phase.title}</h2>
    <p><strong>Verantwoordelijke:</strong> ${phase.owner}</p>
    <p><strong>Validatieregel:</strong> ${phase.rule}</p>
    <p><strong>n8n event:</strong> <code>${phase.event}</code></p>
    <button class="btn btn-primary" id="send-phase">Stuur fase-event</button>
  `;

  document.getElementById("send-phase").addEventListener("click", async () => {
    await postWebhook(WEBHOOKS.logPhaseClick, {
      phaseId: phase.id,
      event: phase.event,
      timestamp: new Date().toISOString(),
    });
    showToast(`Event verzonden: ${phase.event}`);
  });
}

function openModal() {
  if (typeof modal.showModal === "function") {
    modal.showModal();
  }
}

openRequestButton.addEventListener("click", openModal);
startNowButton.addEventListener("click", openModal);

requestForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(requestForm);
  const payload = {
    changeType: formData.get("changeType"),
    asset: formData.get("asset"),
    description: formData.get("description"),
    source: "landingpage",
    timestamp: new Date().toISOString(),
  };

  await postWebhook(WEBHOOKS.createRequest, payload);
  showToast("Aanvraag ontvangen en verstuurd naar workflow");
  modal.close();
  requestForm.reset();
});

document.getElementById("sync-kpi").addEventListener("click", async () => {
  await postWebhook(WEBHOOKS.syncKpi, {
    action: "sync_kpi",
    timestamp: new Date().toISOString(),
  });
  showToast("KPI sync getriggerd");
});

document.querySelectorAll("[data-scroll]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.querySelector(button.dataset.scroll);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

renderPhases();
renderCases();
updateKpis();
