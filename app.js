/* KI-Strukturmodell-Labor v0.8.2
   Schlanke GitHub-Pages-Webapp mit 3Dmol.js und datengetriebener Struktur.
   v0.8.2: MBP-Unterschiede als Domänenbewegung. */

const APP_VERSION = "0.8.2";
let examplesData = null;
let currentExample = null;
let currentView = "overlay";
let viewer = null;
let loadedModels = {};
let uploadedPdb = null;
let lastDiffResidues = [];
let lastAlignmentStats = null;
let viewerBackgroundMode = "light";
let representationMode = "cartoon";
let selectedPredictionVariant = "best";
let viewerExpanded = false;
const afdbCache = new Map();

const els = {
  cards: document.getElementById("exampleCards"),
  info: document.getElementById("exampleInfo"),
  viewerShell: document.getElementById("viewerShell"),
  viewer: document.getElementById("viewer"),
  status: document.getElementById("status"),
  viewerHint: document.getElementById("viewerHint"),
  reloadBtn: document.getElementById("reloadBtn"),
  expandViewerBtn: document.getElementById("expandViewerBtn"),
  questions: document.getElementById("questions"),
  takeaway: document.getElementById("takeaway"),
  taskObserve: document.getElementById("taskObserve"),
  taskCompare: document.getElementById("taskCompare"),
  taskLimit: document.getElementById("taskLimit"),
  showPrediction: document.getElementById("showPrediction"),
  showExperiment: document.getElementById("showExperiment"),
  showDifferenceResidues: document.getElementById("showDifferenceResidues"),
  showHetero: document.getElementById("showHetero"),
  showPocket: document.getElementById("showPocket"),
  showPocketLabel: document.getElementById("showPocketLabel"),
  viewerBackground: document.getElementById("viewerBackground"),
  representationMode: document.getElementById("representationMode"),
  predictionModelRow: document.getElementById("predictionModelRow"),
  viewExperimentBtn: document.getElementById("viewExperimentBtn"),
  viewPredictionBtn: document.getElementById("viewPredictionBtn"),
  viewOverlayBtn: document.getElementById("viewOverlayBtn"),
  viewDifferencesBtn: document.getElementById("viewDifferencesBtn"),
  showExperimentLabel: document.getElementById("showExperimentLabel"),
  showPredictionLabel: document.getElementById("showPredictionLabel"),
  predictionModelSelect: document.getElementById("predictionModelSelect"),
  predictionModelNote: document.getElementById("predictionModelNote"),
  modelInterpretation: document.getElementById("modelInterpretation"),
  pdbUpload: document.getElementById("pdbUpload"),
  clearUploadBtn: document.getElementById("clearUploadBtn"),
  observationPrompts: document.getElementById("observationPrompts"),
  modelLimit: document.getElementById("modelLimit"),
  generateProtocolBtn: document.getElementById("generateProtocolBtn"),
  copyProtocolBtn: document.getElementById("copyProtocolBtn"),
  protocolOutput: document.getElementById("protocolOutput")
};

init();

async function init() {
  try {
    setStatus("Lade Beispiele …");
    const response = await fetch(`data/examples.json?v=${APP_VERSION}&t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`examples.json konnte nicht geladen werden (${response.status})`);
    examplesData = await response.json();
    renderCards(examplesData.examples || []);
    wireEvents();
    if (examplesData.examples?.length) selectExample(examplesData.examples[0].id);
  } catch (err) {
    setStatus(`Fehler beim Start: ${err.message}\n\nTipp: lokal bitte über einen kleinen Webserver starten, z. B. python -m http.server 8000`, "warn");
  }
}

function wireEvents() {
  if (els.viewerBackground) els.viewerBackground.value = viewerBackgroundMode;
  document.querySelectorAll(".viewBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentView = btn.dataset.view;
      document.querySelectorAll(".viewBtn").forEach(b => b.classList.toggle("active", b === btn));
      updateCheckboxesForView();
      loadCurrentExample();
    });
  });
  [els.showPrediction, els.showExperiment, els.showDifferenceResidues, els.showHetero, els.showPocket].filter(Boolean).forEach(el => {
    el.addEventListener("change", () => loadCurrentExample());
  });
  els.viewerBackground.addEventListener("change", () => {
    viewerBackgroundMode = els.viewerBackground.value;
    applyViewerBackground();
    loadCurrentExample(true);
  });
  els.representationMode.addEventListener("change", () => {
    representationMode = els.representationMode.value;
    loadCurrentExample();
  });
  els.predictionModelSelect?.addEventListener("change", () => {
    selectedPredictionVariant = els.predictionModelSelect.value;
    updatePredictionModelNote();
    loadCurrentExample(true);
  });
  els.reloadBtn.addEventListener("click", () => loadCurrentExample(true));
  els.expandViewerBtn?.addEventListener("click", toggleViewerExpanded);
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && viewerExpanded) toggleViewerExpanded(false);
  });
  els.pdbUpload.addEventListener("change", handleUpload);
  els.clearUploadBtn.addEventListener("click", () => {
    uploadedPdb = null;
    els.pdbUpload.value = "";
    loadCurrentExample();
  });
  els.generateProtocolBtn?.addEventListener("click", generateProtocolText);
  els.copyProtocolBtn?.addEventListener("click", copyProtocolText);
}

function renderCards(examples) {
  els.cards.innerHTML = "";
  for (const ex of examples) {
    const card = document.createElement("button");
    card.className = "card";
    card.type = "button";
    card.dataset.id = ex.id;
    card.innerHTML = `
      <h3>${escapeHtml(ex.title)}</h3>
      <p class="subtitle">${escapeHtml(ex.subtitle || "")}</p>
      <span class="badge">${escapeHtml(ex.level || "")}</span>
      <span class="badge status-badge">${escapeHtml(ex.status || "")}</span>
    `;
    card.addEventListener("click", () => selectExample(ex.id));
    els.cards.appendChild(card);
  }
}

function selectExample(id) {
  currentExample = examplesData.examples.find(e => e.id === id);
  selectedPredictionVariant = getDefaultPredictionVariant(currentExample);
  setCurrentView(currentExample.defaultView || "overlay");
  updateViewLabels(currentExample);
  uploadedPdb = null;
  els.pdbUpload.value = "";
  document.querySelectorAll(".card").forEach(c => c.classList.toggle("active", c.dataset.id === id));
  renderExampleInfo(currentExample);
  renderQuestions(currentExample);
  renderTasks(currentExample);
  renderGuidance(currentExample);
  renderPredictionSelector(currentExample);
  if (els.showHetero) els.showHetero.checked = !!currentExample.showHeteroDefault;
  if (els.showPocket) els.showPocket.checked = !!currentExample.showPocketDefault;
  updatePocketToggleVisibility(currentExample);
  if (els.protocolOutput) els.protocolOutput.value = "";
  setCurrentView(currentExample.defaultView || (currentExample.views?.overlay ? "overlay" : "experiment"));
  updateCheckboxesForView();
  loadCurrentExample(true);
}

function renderExampleInfo(ex) {
  const sources = (ex.sources || []).map(s => `<li><a href="${escapeAttr(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.label)}</a></li>`).join("");
  const localNote = ex.local_note ? `<p class="soft-note">${escapeHtml(ex.local_note)}</p>` : "";
  const colabLink = ex.colab_url ? `<p class="tool-link-row"><a class="tool-link" href="${escapeAttr(ex.colab_url)}" target="_blank" rel="noopener">ColabFold-Workflow öffnen</a><span class="tool-link-note">extern falten · PDB herunterladen · im Webtool testen · optional ins Repo übernehmen</span></p>` : "";
  els.info.innerHTML = `
    <h2>2. Leitfrage: ${escapeHtml(ex.title)}</h2>
    <p>${escapeHtml(ex.intro || "")}</p>
    <p class="core">${escapeHtml(ex.core_message || "")}</p>
    ${ex.sequence ? `<p><strong>Sequenz:</strong> <code>${escapeHtml(ex.sequence)}</code></p>` : ""}
    ${colabLink}
    ${localNote}
    ${sources ? `<details><summary>Quellen / Struktur-IDs</summary><ul>${sources}</ul></details>` : ""}
  `;
}

function renderQuestions(ex) {
  els.questions.innerHTML = "";
  (ex.questions || []).forEach(q => {
    const li = document.createElement("li");
    li.textContent = q;
    els.questions.appendChild(li);
  });
  els.takeaway.textContent = ex.takeaway || "";
}

function renderTasks(ex) {
  const tasks = ex.tasks || {};
  if (els.taskObserve) els.taskObserve.textContent = tasks.observe || "Beschreibe zuerst die sichtbare Gesamtform, ohne sofort zu bewerten.";
  if (els.taskCompare) els.taskCompare.textContent = tasks.compare || "Vergleiche Experiment und Modell im Overlay und suche die auffälligsten Abweichungen.";
  if (els.taskLimit) els.taskLimit.textContent = tasks.limit || "Formuliere, welche Modellgrenze dieses Beispiel sichtbar macht.";
}

function renderGuidance(ex) {
  if (!els.observationPrompts || !els.modelLimit) return;
  els.observationPrompts.innerHTML = "";
  const prompts = ex.observation_prompts || [
    "Betrachte zuerst die Gesamtform der Struktur.",
    "Wechsle zwischen Bänder- und Detaildarstellung und beschreibe, welche Information zusätzlich sichtbar wird.",
    "Formuliere eine Modellgrenze: Was zeigt diese Struktur gut, was nicht?"
  ];
  prompts.forEach(prompt => {
    const li = document.createElement("li");
    li.textContent = prompt;
    els.observationPrompts.appendChild(li);
  });
  els.modelLimit.textContent = ex.model_limit || "Für dieses Beispiel ist noch keine eigene Modellgrenze hinterlegt.";
}

function generateProtocolText() {
  if (!currentExample || !els.protocolOutput) return;
  const activeStructures = Object.values(loadedModels).map(entry => entry.struct?.label || "geladene Struktur");
  const viewLabel = {
    prediction: "Modell / Vergleich",
    experiment: "Experiment",
    overlay: "Overlay",
    differences: "Unterschiede"
  }[currentView] || currentView;
  const prompts = (currentExample.observation_prompts || []).map((p, i) => `${i + 1}. ${p}`).join("\n");
  const tasks = currentExample.tasks || {};
  const taskText = [
    tasks.observe ? `1. Beobachte: ${tasks.observe}` : null,
    tasks.compare ? `2. Vergleiche: ${tasks.compare}` : null,
    tasks.limit ? `3. Modellgrenze: ${tasks.limit}` : null
  ].filter(Boolean).join("\n");
  const questions = (currentExample.questions || []).map((q, i) => `${i + 1}. ${q}`).join("\n");
  const alignment = lastAlignmentStats
    ? `\nÜberlagerung: ${lastAlignmentStats.pairCount} gemeinsame Cα-Paare; RMSD ca. ${lastAlignmentStats.rmsd.toFixed(2)} Å.\nAuffällige Bereiche: ${lastDiffResidues.length ? lastDiffResidues.join(", ") : "keine oberhalb der eingestellten Schwelle"}.`
    : "";

  const selectedPred = getSelectedPredictionStruct();
  const selectedPredVariant = selectedPred ? (selectedPred.variant || selectedPred.id) : "";
  const selectedPredKind = selectedPredVariant === "closed_maltose" ? "Gewählter geschlossener Zustand" : (selectedPredVariant === "decoy" ? "Gewähltes Vergleichsmodell" : "Gewähltes KI-Modell");
  const selectedPredLine = selectedPred ? `\n${selectedPredKind}: ${selectedPred.label || selectedPred.shortLabel || ""}\n` : "";

  els.protocolOutput.value = `KI-Strukturmodell-Labor – Protokollhilfe\n\nBeispiel: ${currentExample.title}\nNiveau: ${currentExample.level || ""}\nKernaussage: ${currentExample.core_message || ""}${selectedPredLine}${currentExample.model_limit ? "\nModellgrenze: " + currentExample.model_limit + "\n" : ""}\nSequenz:\n${currentExample.sequence || "nicht hinterlegt"}\n\nAktuelle Ansicht: ${viewLabel}\nGeladene Struktur(en): ${activeStructures.length ? activeStructures.join(" | ") : "keine"}${alignment}\n\nAufgabenmodus:\n${taskText || "keine Aufgaben hinterlegt"}\n\nBeobachtungsauftrag:\n${prompts || "keine Beobachtungsaufträge hinterlegt"}\n\nLeitfragen:\n${questions || "keine Leitfragen hinterlegt"}\n\nModellgrenze:\n${currentExample.model_limit || "noch nicht hinterlegt"}\n\nEigene Beobachtung:\n- \n\nBegründete Aussage:\nDieses Beispiel zeigt, dass ...\n\nMerksatz / Takeaway:\n${currentExample.takeaway || currentExample.protocol_focus || ""}\n`;
}

async function copyProtocolText() {
  if (!els.protocolOutput) return;
  if (!els.protocolOutput.value.trim()) generateProtocolText();
  try {
    await navigator.clipboard.writeText(els.protocolOutput.value);
    setStatus("Protokolltext in die Zwischenablage kopiert.", "ok");
  } catch (err) {
    els.protocolOutput.focus();
    els.protocolOutput.select();
    setStatus("Kopieren per Browser nicht erlaubt. Der Protokolltext ist markiert und kann mit Strg+C kopiert werden.", "warn");
  }
}


function getPredictionStructures(ex = currentExample) {
  return (ex?.structures || []).filter(s => (s.role === "prediction" || s.role === "comparison") && !s.disabled);
}

function getDefaultPredictionVariant(ex = currentExample) {
  const predictions = getPredictionStructures(ex);
  const preferred = predictions.find(s => s.variant === "best" || s.visibleByDefault);
  return (preferred?.variant || preferred?.id || predictions[0]?.variant || predictions[0]?.id || "best");
}

function getSelectedPredictionStruct(ex = currentExample) {
  const predictions = getPredictionStructures(ex);
  if (!predictions.length) return null;
  return predictions.find(s => (s.variant || s.id) === selectedPredictionVariant) || predictions[0];
}

function hasComparisonStructures(ex = currentExample) {
  return !!(ex?.structures || []).some(s => s.role === "comparison" && !s.disabled);
}

function isStatePairExample(ex = currentExample) {
  return !!ex?.statePairMode;
}

function setCurrentView(view) {
  currentView = view;
  document.querySelectorAll(".viewBtn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.view === currentView);
  });
}

function updateViewLabels(ex = currentExample) {
  const statePair = isStatePairExample(ex);
  if (els.viewExperimentBtn) els.viewExperimentBtn.textContent = statePair ? "offen" : "Experiment";
  if (els.viewPredictionBtn) els.viewPredictionBtn.textContent = statePair ? "geschlossen" : "Modell / Vergleich";
  if (els.viewOverlayBtn) els.viewOverlayBtn.textContent = statePair ? "offen + geschlossen" : "Overlay";
  if (els.viewDifferencesBtn) els.viewDifferencesBtn.textContent = "Unterschiede";

  if (els.showExperimentLabel) {
    const input = els.showExperiment;
    els.showExperimentLabel.textContent = "";
    els.showExperimentLabel.appendChild(input);
    els.showExperimentLabel.appendChild(document.createTextNode(statePair ? " offener Zustand anzeigen" : " Experiment anzeigen"));
  }
  if (els.showPredictionLabel) {
    const input = els.showPrediction;
    els.showPredictionLabel.textContent = "";
    els.showPredictionLabel.appendChild(input);
    els.showPredictionLabel.appendChild(document.createTextNode(statePair ? " geschlossenen Zustand anzeigen" : " KI-/Vergleichsmodell anzeigen"));
  }

  document.querySelector(".viewer-panel")?.classList.toggle("state-pair-mode", statePair);
}

function updatePocketToggleVisibility(ex = currentExample) {
  const enabled = !!(ex?.bindingSite?.enabled);
  if (!els.showPocketLabel || !els.showPocket) return;
  els.showPocketLabel.classList.toggle("hidden", !enabled);
  els.showPocket.disabled = !enabled;
  if (!enabled) els.showPocket.checked = false;
}

function renderPredictionSelector(ex = currentExample) {
  const predictions = getPredictionStructures(ex);
  if (!els.predictionModelRow || !els.predictionModelSelect) return;

  if (isStatePairExample(ex)) {
    els.predictionModelRow.style.display = "none";
    selectedPredictionVariant = getDefaultPredictionVariant(ex);
    updatePredictionModelNote();
    return;
  }

  const label = els.predictionModelRow.querySelector("label strong");

  els.predictionModelRow.classList.toggle("comparison-mode", hasComparisonStructures(ex));
  if (label) label.textContent = hasComparisonStructures(ex) ? `${ex.comparisonLabel || "Vergleichszustand"}:` : "KI-/Vergleichsmodell:";

  if (!predictions.length) {
    els.predictionModelRow.style.display = "none";
    return;
  }
  els.predictionModelRow.style.display = "flex";

  els.predictionModelSelect.innerHTML = "";
  predictions.forEach(struct => {
    const option = document.createElement("option");
    option.value = struct.variant || struct.id;
    option.textContent = struct.shortLabel || struct.label || option.value;
    els.predictionModelSelect.appendChild(option);
  });

  if (!predictions.some(s => (s.variant || s.id) === selectedPredictionVariant)) {
    selectedPredictionVariant = getDefaultPredictionVariant(ex);
  }
  els.predictionModelSelect.value = selectedPredictionVariant;
  els.predictionModelSelect.disabled = predictions.length <= 1;
  updatePredictionModelNote();
}

function updatePredictionModelNote() {
  if (!els.predictionModelNote && !els.modelInterpretation) return;
  const struct = getSelectedPredictionStruct();
  if (!struct) {
    if (els.predictionModelNote) els.predictionModelNote.textContent = "Für dieses Beispiel ist noch kein KI-/Vergleichsmodell hinterlegt.";
    if (els.modelInterpretation) els.modelInterpretation.textContent = "";
    return;
  }

  const variant = struct.variant || struct.id;
  let shortNote = struct.note || "";
  let interpretation = struct.note || "";

  if (variant === "best") {
    shortNote = "Standard: bestbewertetes ColabFold/AF2-Modell.";
    interpretation =
      "ColabFold/AF2 best: aus der Aminosäuresequenz berechnet. " +
      "Dieses Modell zeigt, was ein starkes Sequenzmodell leistet, wenn der konkrete biologische Kontext nicht vollständig als Eingabe vorgegeben wird.";
  } else if (variant === "alternative") {
    shortNote = "Vergleichsmodell: weiteres ColabFold/AF2-Modell zur Diskussion von Modellqualität.";
    interpretation =
      "ColabFold/AF2 Vergleichsmodell: ein weiteres geranktes Modell aus dem gleichen oder einem vergleichbaren Lauf. " +
      "Es ist nicht automatisch falsch; oft zeigt es nur, wie stabil oder variabel die Vorhersage ist.";
  } else if (variant === "afdb") {
    shortNote = "AlphaFold-DB: öffentliches AF2-Modell AF-P0DP23-F1.";
    interpretation =
      "AlphaFold-DB P0DP23: öffentliches AF2-Referenzmodell für humanes Calmodulin. " +
      "Es ist gut als Vergleichspartner, enthält aber kein explizit vorgegebenes Ca²⁺. " +
      "Für den Vergleich mit 1CLL blendet die App das zusätzliche Start-Methionin aus und verschiebt die Nummerierung.";
  } else if (variant === "af3_ca") {
    shortNote = "AF3 mit Ca²⁺: AlphaFold-Server-Modell mit vier explizit vorgegebenen Calcium-Ionen.";
    interpretation =
      "AF3 mit Ca²⁺: hier wird der Cofaktor-Kontext ausdrücklich mitgegeben. " +
      "Gerade deshalb ist der Vergleich mit 1CLL didaktisch interessant: bessere Kontextinformation bedeutet nicht automatisch Identität mit der experimentellen Struktur.";
  } else if (variant === "closed_maltose") {
    shortNote = "Geschlossener Zustand: 1ANF mit Maltose. Über die Schaltflächen offen · geschlossen · offen + geschlossen vergleichen.";
    interpretation =
      "MBP geschlossen mit Maltose: Dies ist kein KI-Modell, sondern eine zweite experimentelle Struktur. " +
      "Der Vergleich mit der offenen ligandfreien Struktur zeigt die Domänenbewegung: Die Bindetasche schließt sich um Maltose. " +
      "Damit wird sichtbar, warum das starre Schlüssel-Schloss-Modell für viele Proteine nur eine erste Näherung ist.";
  } else if (variant === "decoy") {
    shortNote = "Didaktisches Störmodell: optionales, klar gekennzeichnetes Vergleichsmodell.";
    interpretation =
      "Didaktisches Störmodell: kein AlphaFold/ColabFold-Ergebnis. " +
      "Es soll noch proteinartig aussehen, aber deutlicher abweichen. Nur verwenden, wenn es die Beobachtung wirklich klarer macht.";
  }

  if (els.predictionModelNote) els.predictionModelNote.textContent = shortNote;
  if (els.modelInterpretation) els.modelInterpretation.textContent = interpretation;
}

function updateCheckboxesForView() {
  if (!currentExample) return;
  const supportsPrediction = !!getSelectedPredictionStruct();
  const supportsExperiment = !!(currentExample?.structures || []).find(s => s.role === "experiment" && !s.disabled);

  if (isStatePairExample(currentExample)) {
    if (currentView === "experiment") {
      els.showExperiment.checked = true;
      els.showPrediction.checked = false;
    } else if (currentView === "prediction") {
      els.showExperiment.checked = false;
      els.showPrediction.checked = true;
    } else {
      els.showExperiment.checked = true;
      els.showPrediction.checked = true;
    }
  } else {
    els.showPrediction.checked = currentView !== "experiment" && supportsPrediction;
    els.showExperiment.checked = currentView !== "prediction" && supportsExperiment;
  }

  els.showPrediction.disabled = !supportsPrediction || currentView === "experiment";
  els.showExperiment.disabled = !supportsExperiment || currentView === "prediction";
  if (currentView === "overlay" || currentView === "differences") {
    els.showPrediction.disabled = !supportsPrediction;
    els.showExperiment.disabled = !supportsExperiment;
  }
}

function ensureBindingLigandPresent(pdb, statusLines = []) {
  if (!currentExample?.bindingSite?.enabled) return pdb;
  const cfg = currentExample.bindingSite || {};
  const ligandAtoms = getLigandAtoms(pdb, cfg.ligandNames || [], !!cfg.fallbackToAnyHetero);
  if (ligandAtoms.length) return pdb;

  const fallback = String(cfg.fallbackLigandPdb || "").trim();
  if (!fallback) return pdb;

  statusLines.push("Lokale geschlossene 1ANF-Datei enthält keinen HETATM-Liganden; eingebettete Maltose-Koordinaten aus RCSB 1ANF wurden ergänzt.");
  return `${pdb.replace(/\s*END\s*$/m, "").trim()}\n${fallback}\n`;
}

function rescueLigandFromRawPdb(processedPdb, rawPdb, statusLines = []) {
  if (!currentExample?.bindingSite?.enabled) return processedPdb;

  const cfg = currentExample.bindingSite || {};
  if (!cfg.rescueLigandFromRawPdb) return processedPdb;

  const processedLigands = getLigandAtoms(processedPdb, cfg.ligandNames || [], !!cfg.fallbackToAnyHetero);
  if (processedLigands.length) {
    statusLines.push(`Ligandendiagnose: ${processedLigands.length} HETATM-Atome nach Vorverarbeitung vorhanden.`);
    return processedPdb;
  }

  const rawLigands = getLigandAtoms(rawPdb, cfg.ligandNames || [], !!cfg.fallbackToAnyHetero);
  const rawNames = Array.from(new Set(parseAtoms(rawPdb).filter(a => a.line.trimStart().startsWith("HETATM")).map(a => a.resn))).sort();

  if (!rawLigands.length) {
    statusLines.push(`Ligandendiagnose: Rohdatei enthält keine nutzbaren HETATM-Liganden. HETATM-Namen roh: ${rawNames.length ? rawNames.join(", ") : "keine"}.`);
    return processedPdb;
  }

  const rescuePdb = pdbFromAtomLines(rawLigands.map(a => a.line), "rescued ligand from raw PDB");
  statusLines.push(`Ligandendiagnose: ${rawLigands.length} HETATM-Atome aus der Roh-PDB übernommen (${Array.from(new Set(rawLigands.map(a => a.resn))).join("/")}).`);
  return `${processedPdb.replace(/\s*END\s*$/m, "").trim()}\n${rescuePdb}\n`;
}

function countPdbRecords(pdb) {
  const lines = String(pdb || "").split(/\r?\n/);
  const stats = { atom: 0, hetatm: 0, names: [] };
  const names = new Set();
  for (const line of lines) {
    const s = line.trimStart();
    if (s.startsWith("ATOM")) stats.atom += 1;
    if (s.startsWith("HETATM")) {
      stats.hetatm += 1;
      names.add(line.slice(17, 20).trim() || "?");
    }
  }
  stats.names = Array.from(names).sort();
  return stats;
}

function formatPdbStats(label, pdb) {
  const s = countPdbRecords(pdb);
  return `${label}: ATOM ${s.atom}, HETATM ${s.hetatm}${s.names.length ? " (" + s.names.join(", ") + ")" : ""}`;
}

function forceFallbackLigandIfNeeded(pdb, statusLines = []) {
  const cfg = currentExample?.bindingSite || {};
  if (!cfg.forceFallbackIfNoFinalLigand) return pdb;
  const finalLigands = getLigandAtoms(pdb, cfg.ligandNames || [], !!cfg.fallbackToAnyHetero);
  if (finalLigands.length) return pdb;

  const fallback = String(cfg.fallbackLigandPdb || "").trim();
  if (!fallback) return pdb;

  statusLines.push("Finaldiagnose: Noch immer kein Ligand im verarbeiteten PDB; eingebettete Maltose-Reserve wird erzwungen.");
  return `${pdb.replace(/\s*END\s*$/m, "").trim()}\n${fallback}\n`;
}

async function loadCurrentExample(force = false) {
  if (!currentExample) return;
  if (force && viewer) {
    viewer = null;
    resetViewerDom();
  }
  ensureViewer();
  viewer.clear();
  loadedModels = {};
  lastDiffResidues = [];
  lastAlignmentStats = null;

  const statusLines = [];
  const warnLines = [];
  const structures = currentExample.structures || [];
  const expStruct = structures.find(s => s.role === "experiment" && !s.disabled);
  const predStruct = getSelectedPredictionStruct();

  let expPdb = null;
  let predPdb = null;

  if (els.showExperiment.checked && expStruct) {
    try {
      expPdb = await loadStructureText(expStruct);
      expPdb = preprocessPdb(expPdb, expStruct);
      const expModel = viewer.addModel(expPdb, "pdb");
      applyModelStyle(expModel, expStruct, "experiment");
      loadedModels.experiment = { model: expModel, pdb: expPdb, struct: expStruct };
      statusLines.push(`${isStatePairExample(currentExample) ? (expStruct.statusLabel || "Offener Zustand") : "Experiment"} geladen: ${expStruct.label} (grün).`);
      if (currentExample.hetero_note && els.showHetero?.checked) statusLines.push(currentExample.hetero_note);
    } catch (err) {
      warnLines.push(`Experiment nicht geladen: ${err.message}`);
    }
  }

  // Einzelansicht von KI-/Vergleichsmodellen:
  // Bei normalen KI-Modellen kann intern die experimentelle Referenz geladen werden,
  // damit die Einzelansicht schon wie im Overlay orientiert ist.
  // Beim MBP-Zustandspaar ist das didaktisch störend: "geschlossen" soll zuerst
  // wirklich als einzelner experimenteller Zustand erscheinen.
  const shouldUseHiddenReference =
    !isStatePairExample(currentExample) &&
    !expPdb &&
    els.showPrediction.checked &&
    predStruct?.alignTo &&
    expStruct;

  if (shouldUseHiddenReference) {
    try {
      let refOnly = await loadStructureText(expStruct);
      expPdb = preprocessPdb(refOnly, expStruct);
      statusLines.push("Experimentelle Referenz intern zur Ausrichtung geladen.");
    } catch (err) {
      warnLines.push(`Ausrichtung an der experimentellen Referenz nicht möglich: ${err.message}`);
    }
  }

  if (els.showPrediction.checked && predStruct) {
    try {
      const predRawPdb = await loadStructureText(predStruct);
      predPdb = preprocessPdb(predRawPdb, predStruct);

      if (currentExample?.bindingSite?.enabled && predStruct.requireLigandForBindingSite) {
        const showDiagnostics = !!currentExample.bindingSite.showDiagnostics;
        const diagLines = showDiagnostics ? statusLines : [];
        if (showDiagnostics) {
          statusLines.push(`PDB-Diagnose ${APP_VERSION}: geladen aus ${predStruct.file || predStruct.url || "unbekannter Quelle"}`);
          statusLines.push(formatPdbStats("Roh-PDB", predRawPdb));
          statusLines.push(formatPdbStats("nach Vorverarbeitung", predPdb));
        }
        predPdb = rescueLigandFromRawPdb(predPdb, predRawPdb, diagLines);
        predPdb = ensureBindingLigandPresent(predPdb, diagLines);
        predPdb = forceFallbackLigandIfNeeded(predPdb, diagLines);
        if (showDiagnostics) statusLines.push(formatPdbStats("final für Viewer", predPdb));
      }

      const shouldAlignPrediction =
        !!expPdb &&
        !!predStruct.alignTo &&
        (!isStatePairExample(currentExample) || currentView === "overlay" || currentView === "differences");

      if (shouldAlignPrediction) {
        const useMbpDomainMotion = isMbpDomainMotionMode();
        const motionCfg = currentExample.domainMotion || {};
        const anchorResidues = useMbpDomainMotion ? expandResidueRanges(motionCfg.anchorRanges) : null;
        const alignment = useMbpDomainMotion
          ? alignMobileToReferenceByResidues(predPdb, expPdb, currentExample.differenceThreshold || 2.0, anchorResidues)
          : alignMobileToReference(predPdb, expPdb, currentExample.differenceThreshold || 2.0);
        predPdb = alignment.pdb;
        lastDiffResidues = alignment.diffResidues;
        lastAlignmentStats = alignment;

        if (useMbpDomainMotion) {
          statusLines.push(`MBP-Unterschiedsmodus: geschlossene Form über ${alignment.fitPairCount || alignment.pairCount} Cα-Paare der Ankerdomäne ausgerichtet.`);
        } else {
          statusLines.push(`Overlay berechnet: ${alignment.pairCount} gemeinsame Cα-Paare; RMSD ≈ ${alignment.rmsd.toFixed(2)} Å.`);
          if (isStatePairExample(currentExample)) {
            statusLines.push(`Abweichungsmarkierung: ${lastDiffResidues.length ? lastDiffResidues.length + " Bereiche oberhalb der Schwelle" : "keine Bereiche > " + (currentExample.differenceThreshold || 2.0) + " Å"}.`);
          } else {
            statusLines.push(`Abweichungsmarkierung: ${lastDiffResidues.length ? lastDiffResidues.length + " Bereiche oberhalb der Schwelle (" + lastDiffResidues.join(", ") + ")" : "keine Bereiche > " + (currentExample.differenceThreshold || 2.0) + " Å"}.`);
          }
        }
      }
      const predModel = viewer.addModel(predPdb, "pdb");
      applyModelStyle(predModel, predStruct, "prediction");
      loadedModels.prediction = { model: predModel, pdb: predPdb, struct: predStruct };
      const predLabel = predStruct.shortLabel ? `${predStruct.label} – ${predStruct.shortLabel}` : predStruct.label;
      const predVariant = predStruct.variant || predStruct.id;
      const predKind =
        predVariant === "decoy" ? "Didaktisches Störmodell" :
        predVariant === "closed_maltose" || predStruct.role === "comparison" ? "Geschlossener Zustand" :
        "KI-Modell";
      statusLines.push(`${predKind} geladen: ${predLabel} (${predStruct.color || "#EF6C00"}).`);
      if (predVariant === "decoy") {
        statusLines.push("Hinweis: Dieses Modell ist nicht als AlphaFold/ColabFold-Ergebnis gekennzeichnet, sondern dient als didaktisches Vergleichsmodell.");
      } else if (predVariant === "closed_maltose") {
        statusLines.push(currentView === "prediction"
          ? "MBP geschlossen: Maltose hellblau, Bindetasche orange markiert."
          : "MBP-Vergleich: offen grün, geschlossen orange, Maltose hellblau; Bindetaschen violett/orange.");
      } else if (predVariant === "afdb") {
        statusLines.push("Hinweis: AlphaFold-DB P0DP23 enthält ein zusätzliches Start-Methionin; für den Vergleich mit 1CLL wird es in der App ausgeblendet und die Residuen werden umnummeriert.");
      } else if (predVariant === "af3_ca") {
        statusLines.push("Hinweis: AF3 wurde mit explizit vorgegebenen Calcium-Ionen berechnet; Abweichungen zum Experiment sind daher besonders gut für die Diskussion von Zustand und Modellgrenzen geeignet.");
      }
    } catch (err) {
      const predVariant = predStruct.variant || predStruct.id;
      const predKind =
        predVariant === "decoy" ? "Didaktisches Störmodell" :
        predVariant === "closed_maltose" || predStruct.role === "comparison" ? "Geschlossener Zustand" :
        "KI-Modell";
      warnLines.push(`${predKind} nicht geladen: ${err.message}`);
      if (predStruct.note) warnLines.push(predStruct.note);
    }
  }

  if (els.showPrediction.checked && uploadedPdb) {
    try {
      let own = uploadedPdb;
      if (expPdb) {
        const alignment = alignMobileToReference(own, expPdb, currentExample.differenceThreshold || 2.0);
        own = alignment.pdb;
        statusLines.push(`Eigenes PDB importiert und überlagert: ${alignment.pairCount} Cα-Paare; RMSD ≈ ${alignment.rmsd.toFixed(2)} Å. Dieses Modell wird nur temporär angezeigt und nicht ins Repo gespeichert.`);
      }
      const ownModel = viewer.addModel(own, "pdb");
      ownModel.setStyle({}, buildRepresentationStyle("#7B1FA2", 0.82));
      loadedModels.upload = { model: ownModel, pdb: own, struct: { label: "Eigenes PDB" } };
    } catch (err) {
      warnLines.push(`Eigenes PDB konnte nicht geladen/überlagert werden: ${err.message}`);
    }
  }

  if (isMbpDomainMotionMode()) {
    const mbpMotionInfo = highlightMbpDomainMotion();
    if (mbpMotionInfo?.message) statusLines.push(mbpMotionInfo.message);
  } else if ((currentView === "differences" || currentView === "overlay") && els.showDifferenceResidues.checked) {
    highlightDifferences();
    if (currentView === "differences" && !isStatePairExample(currentExample)) {
      const diffSummary = getDifferenceSummaryText();
      if (diffSummary) statusLines.push(diffSummary);
    }
  }

  if (currentExample?.bindingSite?.enabled && els.showPocket?.checked) {
    const pocketInfo = highlightBindingSite();
    if (pocketInfo?.message) {
      (pocketInfo.ok ? statusLines : warnLines).push(pocketInfo.message);
    }
    if (currentExample.bindingSite?.note && pocketInfo?.ok) statusLines.push(currentExample.bindingSite.note);
  }

  if (!Object.keys(loadedModels).length) {
    showEmptyViewerNotice();
    const disabledPred = structures.find(s => (s.role === "prediction" || s.role === "comparison") && s.disabled);
    if (disabledPred) warnLines.push(disabledPred.note);
  } else {
    if (typeof viewer.resize === "function") viewer.resize();
    viewer.zoomTo();
    viewer.render();
  }

  els.viewerHint.textContent = `${currentExample.title}: ${currentExample.core_message}`;
  updateViewSpecificInterpretation();
  const msg = [...statusLines, ...warnLines].join("\n") || "Bereit.";
  setStatus(msg, warnLines.length ? "warn" : "ok");
}

function resetViewerDom() {
  cleanupStray3DmolNodes();
  els.viewerShell.innerHTML = '<div id="viewer" class="mol-viewer-target"></div>';
  els.viewer = document.getElementById("viewer");
}

function ensureViewer() {
  if (!els.viewer || !els.viewerShell.contains(els.viewer)) resetViewerDom();
  normalizeViewerDom();
  if (!viewer) {
    cleanupStray3DmolNodes();
    els.viewer.innerHTML = "";
    const target = window.jQuery ? window.jQuery(els.viewer) : els.viewer;
    viewer = $3Dmol.createViewer(target, { backgroundColor: getViewerBackgroundColor() });
    normalizeViewerDom();
  }
  normalizeViewerDom();
  applyViewerBackground();
  if (viewer && typeof viewer.resize === "function") viewer.resize();
}

function getViewerBackgroundColor() {
  return viewerBackgroundMode === "light" ? "#e5e7eb" : "#111827";
}

function applyViewerBackground() {
  const color = getViewerBackgroundColor();
  if (els.viewerShell) {
    els.viewerShell.style.backgroundColor = color;
    els.viewerShell.classList.toggle("viewer-light", viewerBackgroundMode === "light");
  }
  if (els.viewer) els.viewer.style.backgroundColor = color;
  if (viewer && typeof viewer.setBackgroundColor === "function") {
    viewer.setBackgroundColor(color);
  }
}

function normalizeViewerDom() {
  if (!els.viewerShell || !els.viewer) return;
  Object.assign(els.viewerShell.style, {
    position: "relative",
    overflow: "hidden",
    isolation: "isolate"
  });
  Object.assign(els.viewer.style, {
    position: "absolute",
    left: "0px",
    top: "0px",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    backgroundColor: getViewerBackgroundColor()
  });
  els.viewer.querySelectorAll("div, canvas").forEach(node => {
    Object.assign(node.style, {
      position: "absolute",
      left: "0px",
      top: "0px",
      width: "100%",
      height: "100%",
      maxWidth: "none",
      maxHeight: "none"
    });
  });
}

function cleanupStray3DmolNodes() {
  const shell = document.getElementById("viewerShell");
  if (!shell) return;
  document.querySelectorAll("body > div, body > canvas").forEach(node => {
    if (shell.contains(node)) return;
    const hasCanvas = node.tagName === "CANVAS" || node.querySelector?.("canvas");
    if (!hasCanvas) return;
    const style = window.getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    const looksLikeFloatingViewer =
      (style.position === "absolute" || style.position === "fixed") &&
      rect.width > 250 && rect.height > 180;
    if (looksLikeFloatingViewer) node.remove();
  });
}

function showEmptyViewerNotice() {
  ensureViewer();
  viewer.clear();
  viewer.addLabel("Keine Struktur für diese Ansicht geladen", {
    position: { x: 0, y: 0, z: 0 },
    backgroundColor: "white",
    fontColor: "black",
    fontSize: 18,
    borderThickness: 1
  });
  if (typeof viewer.resize === "function") viewer.resize();
  viewer.zoomTo();
  viewer.render();
}

async function loadStructureText(struct) {
  if (struct.source === "placeholder") throw new Error(struct.note || "Struktur noch nicht hinterlegt.");

  if (struct.source === "local_optional") {
    try {
      return await fetchTextWithFallback([struct.file, struct.fallbackFile].filter(Boolean));
    } catch (err) {
      throw new Error(struct.missingFileHint || `${struct.file || "Lokale Datei"} nicht gefunden. Erzeuge die PDB-Datei extern und lege sie im Repo ab.`);
    }
  }

  if (struct.source === "local") {
    return await fetchTextWithFallback([struct.file, struct.fallbackFile, struct.url, struct.fallbackUrl].filter(Boolean));
  }

  if (struct.source === "alphafold_api") {
    const url = await resolveAlphaFoldPdbUrl(struct.uniprot, struct.entryId);
    return await fetchTextWithFallback([url, struct.url, struct.fallbackUrl].filter(Boolean));
  }

  return await fetchTextWithFallback([struct.url, struct.fallbackUrl].filter(Boolean));
}

function withCacheBuster(url) {
  if (!url) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${encodeURIComponent(APP_VERSION)}&t=${Date.now()}`;
}

function looksLikePdb(text) {
  if (!text) return false;
  return /(^|\n)(ATOM  |HETATM|MODEL |HEADER|TITLE )/.test(text);
}

async function fetchTextWithFallback(urls) {
  let lastErr = null;
  for (const originalUrl of urls) {
    if (!originalUrl) continue;
    const url = withCacheBuster(originalUrl);
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`${originalUrl} (${res.status})`);
      const text = await res.text();
      if (!looksLikePdb(text)) {
        throw new Error(`${originalUrl} wurde geladen, enthält aber keine erkennbaren PDB-Zeilen (ATOM/HETATM/MODEL).`);
      }
      return text;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error("Keine Struktur-URL angegeben.");
}

async function resolveAlphaFoldPdbUrl(uniprot, preferredEntryId = null) {
  if (!uniprot) throw new Error("AlphaFold-DB-Zugriff ohne UniProt-ID.");
  const cacheKey = `${uniprot}|${preferredEntryId || ""}`;
  if (afdbCache.has(cacheKey)) return afdbCache.get(cacheKey);

  const endpoints = [
    `https://alphafold.ebi.ac.uk/api/prediction/${encodeURIComponent(uniprot)}`,
    `https://www.alphafold.ebi.ac.uk/api/prediction/${encodeURIComponent(uniprot)}`
  ];

  let data = null;
  let lastErr = null;
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, { cache: "no-store" });
      if (!res.ok) throw new Error(`${endpoint} (${res.status})`);
      data = await res.json();
      break;
    } catch (err) {
      lastErr = err;
    }
  }
  if (!data) throw lastErr || new Error(`AlphaFold-DB-API für ${uniprot} nicht erreichbar.`);

  const records = Array.isArray(data) ? data : (data.results || data.predictions || [data]);
  if (!records.length) throw new Error(`AlphaFold-DB-API liefert keinen Eintrag für ${uniprot}.`);

  let rec = records[0];
  if (preferredEntryId) {
    rec = records.find(r => r.entryId === preferredEntryId || r.modelId === preferredEntryId || r.alphafoldAccession === preferredEntryId) || rec;
  }

  const url = rec.pdbUrl || rec.pdb_url || rec.pdb || rec.structureUrl || rec.structure_url;
  if (!url) {
    throw new Error(`AlphaFold-DB-API liefert für ${uniprot} keinen direkt nutzbaren PDB-Link. Später lokales PDB verwenden.`);
  }
  afdbCache.set(cacheKey, url);
  return url;
}

function preprocessPdb(pdb, struct) {
  let lines = pdb.split(/\r?\n/);

  if (struct.modelNumber) {
    lines = extractModel(lines, struct.modelNumber);
  }
  if (struct.chain) {
    lines = filterChain(lines, struct.chain, !!struct.keepHeteroAcrossChains, struct.keepHetero || []);
  }
  if (struct.residueRange) {
    lines = filterResidueRange(lines, struct.residueRange[0], struct.residueRange[1]);
  }
  if (Number.isFinite(struct.residueNumberOffset) && struct.residueNumberOffset !== 0) {
    lines = shiftResidueNumbers(lines, struct.residueNumberOffset);
  }

  // Kristallwasser stört in diesem didaktischen Viewer meist mehr, als es hilft.
  // Es erscheint sonst als viele einzelne Kugeln im Bändermodell.
  if (struct.stripWater !== false) {
    lines = filterWater(lines);
  }
  if (Array.isArray(struct.keepHetero) && struct.keepHetero.length) {
    lines = filterHeteroNames(lines, struct.keepHetero);
  }
  return lines.join("\n") + "\n";
}

function filterHeteroNames(lines, keepNames) {
  const keep = new Set(keepNames.map(x => String(x).trim().toUpperCase()));
  return lines.filter(line => {
    if (!line.startsWith("HETATM")) return true;
    const resn = line.slice(17, 20).trim().toUpperCase();
    return keep.has(resn);
  });
}

function filterWater(lines) {
  const waterNames = new Set(["HOH", "WAT", "H2O", "DOD", "SOL"]);
  return lines.filter(line => {
    if (!line.startsWith("HETATM")) return true;
    const resn = line.slice(17, 20).trim().toUpperCase();
    return !waterNames.has(resn);
  });
}

function extractModel(lines, modelNumber) {
  let active = false;
  let inModels = false;
  const out = [];
  for (const line of lines) {
    if (line.startsWith("MODEL")) {
      inModels = true;
      const n = parseInt(line.slice(10).trim(), 10);
      active = n === modelNumber;
      if (active) out.push(line);
      continue;
    }
    if (line.startsWith("ENDMDL")) {
      if (active) out.push(line);
      active = false;
      continue;
    }
    if (!inModels || active || line.startsWith("HEADER") || line.startsWith("TITLE") || line.startsWith("REMARK")) out.push(line);
  }
  return out;
}

function filterChain(lines, chain, keepHeteroAcrossChains = false, keepHetero = []) {
  const keep = new Set((keepHetero || []).map(x => String(x).trim().toUpperCase()));
  return lines.filter(line => {
    if (!isAtomLine(line)) return true;

    // Für Liganden ist die Chain-ID in PDB-Dateien nicht immer identisch mit der Protein-Kette.
    // Bei MBP würde die Maltose sonst schon hier entfernt, bevor sie hervorgehoben werden kann.
    if (keepHeteroAcrossChains && line.startsWith("HETATM")) {
      const resn = line.slice(17, 20).trim().toUpperCase();
      return !keep.size || keep.has(resn);
    }

    return line[21] === chain;
  });
}

function filterResidueRange(lines, start, end) {
  return lines.filter(line => {
    if (!isAtomLine(line)) return true;
    const resi = parseInt(line.slice(22, 26).trim(), 10);
    return resi >= start && resi <= end;
  });
}

function shiftResidueNumbers(lines, offset) {
  return lines.map(line => {
    if (!isAtomLine(line)) return line;
    const resi = parseInt(line.slice(22, 26).trim(), 10);
    if (!Number.isFinite(resi)) return line;
    const shifted = String(resi + offset).padStart(4, " ").slice(-4);
    return line.slice(0, 22) + shifted + line.slice(26);
  });
}

function isAtomLine(line) { const s = String(line || "").trimStart(); return s.startsWith("ATOM") || s.startsWith("HETATM"); }

function isMbpDomainMotionMode() {
  return currentView === "differences" &&
    currentExample?.id === "mbp" &&
    !!currentExample?.domainMotion?.enabled;
}

function expandResidueRanges(ranges) {
  const out = [];
  for (const r of ranges || []) {
    const start = Array.isArray(r) ? Number(r[0]) : Number(r.start);
    const end = Array.isArray(r) ? Number(r[1]) : Number(r.end);
    if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
    const a = Math.min(start, end);
    const b = Math.max(start, end);
    for (let n = a; n <= b; n++) out.push(n);
  }
  return Array.from(new Set(out)).sort((a, b) => a - b);
}

function residueSelectorFromRanges(ranges) {
  return expandResidueRanges(ranges);
}

function atomsForResidues(pdb, residues, atomName = null) {
  const wanted = new Set((residues || []).map(Number));
  return parseAtoms(pdb).filter(a =>
    a.line.trimStart().startsWith("ATOM") &&
    wanted.has(Number(a.resi)) &&
    (!atomName || a.atom === atomName)
  );
}

function applyModelStyle(model, struct, role) {
  const color = struct.color || (role === "experiment" ? "#2E7D32" : "#EF6C00");
  let opacity = role === "experiment" ? 0.82 : 0.9;

  // Im allgemeinen Unterschiede-Modus werden die Gesamtmodelle bewusst
  // blasser dargestellt; die hervorgehobenen Abweichungen treten dadurch
  // klarer hervor. MBP bekommt später eine eigene Domänenbewegungslogik.
  if (isMbpDomainMotionMode()) {
    const cfg = currentExample.domainMotion || {};
    opacity = role === "experiment" ? Number(cfg.baseOpenOpacity || 0.20) : Number(cfg.baseClosedOpacity || 0.24);
  } else if (currentView === "differences" && !isStatePairExample(currentExample)) {
    opacity = role === "experiment" ? 0.32 : 0.42;
  }

  // Standardmäßig wird nur das Protein selbst dargestellt. HETATM-Datensätze
  // enthalten in Kristallstrukturen oft viele Wassermoleküle; diese würden im
  // Bändermodell als verstreute Kugeln erscheinen und didaktisch verwirren.
  if (representationMode === "backbone_stick") {
    model.setStyle({ hetflag: false, atom: ["N", "CA", "C", "O"] }, buildRepresentationStyle(color, opacity));
  } else {
    model.setStyle({ hetflag: false }, buildRepresentationStyle(color, opacity));
  }

  if (els.showHetero?.checked) {
    model.setStyle({ hetflag: true }, buildHeteroStyle(color));
  }
}

function buildRepresentationStyle(color, opacity) {
  // Für Gesamtvergleiche bleiben Cartoon/Bänder in Modellfarben
  // (Experiment/KI-Modell) gut unterscheidbar. Atomnahe Darstellungen
  // verwenden dagegen gebräuchliche Elementfarben nach Jmol/CPK-Schema:
  // C grau, O rot, N blau, S gelb/orange usw.
  const atomStick = { colorscheme: "Jmol", radius: 0.14, opacity };
  const atomLine = { colorscheme: "Jmol", opacity };
  const atomSphere = { colorscheme: "Jmol", scale: 0.92, opacity };

  switch (representationMode) {
    case "cartoon_stick":
      return {
        cartoon: { color, opacity },
        stick: { colorscheme: "Jmol", radius: 0.10, opacity: Math.min(1, opacity + 0.08) }
      };
    case "backbone_stick":
      return { stick: { colorscheme: "Jmol", radius: 0.16, opacity } };
    case "stick":
      return { stick: atomStick };
    case "line":
      return { line: atomLine };
    case "sphere":
      return { sphere: atomSphere };
    case "cartoon":
    default:
      return { cartoon: { color, opacity } };
  }
}

function buildHeteroStyle(color) {
  return {
    stick: { colorscheme: "Jmol", radius: 0.18, opacity: 0.88 },
    sphere: { colorscheme: "Jmol", scale: 0.52, opacity: 0.92 }
  };
}

function formatResidueRanges(residues, maxRanges = 8) {
  const nums = Array.from(new Set((residues || []).map(Number).filter(Number.isFinite))).sort((a, b) => a - b);
  if (!nums.length) return "keine";
  const ranges = [];
  let start = nums[0];
  let prev = nums[0];
  for (let i = 1; i < nums.length; i++) {
    const n = nums[i];
    if (n === prev + 1) {
      prev = n;
    } else {
      ranges.push(start === prev ? String(start) : `${start}–${prev}`);
      start = prev = n;
    }
  }
  ranges.push(start === prev ? String(start) : `${start}–${prev}`);
  const shown = ranges.slice(0, maxRanges).join(", ");
  return ranges.length > maxRanges ? `${shown}, …` : shown;
}

function getDifferenceSummaryText() {
  if (!lastAlignmentStats) return "";
  const threshold = currentExample?.differenceThreshold || 2.0;
  if (!lastDiffResidues.length) {
    return `Unterschiede: RMSD ≈ ${lastAlignmentStats.rmsd.toFixed(2)} Å; keine Cα-Bereiche oberhalb von ${threshold} Å.`;
  }
  return `Unterschiede: ${lastDiffResidues.length} Residuen/Bereiche oberhalb von ${threshold} Å hervorgehoben (${formatResidueRanges(lastDiffResidues)}).`;
}

function updateViewSpecificInterpretation() {
  if (!els.predictionModelNote && !els.modelInterpretation) return;

  if (isMbpDomainMotionMode()) {
    const cfg = currentExample.domainMotion || {};
    if (els.predictionModelNote) {
      els.predictionModelNote.textContent = "MBP-Unterschiede: Domänenbewegung / induced fit.";
    }
    if (els.modelInterpretation) {
      els.modelInterpretation.textContent =
        "In dieser Ansicht wird die geschlossene MBP-Struktur über eine Ankerdomäne auf die offene Struktur ausgerichtet. " +
        "Dadurch bleibt ein Teil des Proteins als Bezugspunkt stehen, während die bewegte Domäne deutlich hervortritt. " +
        "Die Maltose ist hellblau dargestellt; die Bindetaschen zeigen, wie sich das Protein um den Liganden schließt. " +
        "Die Darstellung ist keine Animation und zeigt keinen realen Bewegungsweg, sondern die beiden experimentellen Endzustände.";
    }
    return;
  }

  if (currentView === "differences" && !isStatePairExample(currentExample) && lastAlignmentStats) {
    const threshold = currentExample?.differenceThreshold || 2.0;
    if (els.predictionModelNote) {
      els.predictionModelNote.textContent = lastDiffResidues.length
        ? `Unterschiede-Modus: ${lastDiffResidues.length} abweichende Residuen/Bereiche hervorgehoben.`
        : "Unterschiede-Modus: keine deutlichen Cα-Abweichungen oberhalb der eingestellten Schwelle.";
    }
    if (els.modelInterpretation) {
      els.modelInterpretation.textContent = lastDiffResidues.length
        ? `In dieser Ansicht werden die Gesamtmodelle bewusst blasser dargestellt. Rot-orange markierte Abschnitte zeigen die Bereiche, in denen Modell und Experiment nach der Überlagerung am stärksten auseinanderliegen. Angezeigt werden Cα-Abweichungen oberhalb von ${threshold} Å (${formatResidueRanges(lastDiffResidues)}). Das ist kein „richtig/falsch“-Urteil, sondern ein Hinweis darauf, welche Strukturabschnitte genauer diskutiert werden sollten.`
        : `In dieser Ansicht werden die Gesamtmodelle bewusst blasser dargestellt. Da keine Cα-Abweichungen oberhalb von ${threshold} Å gefunden wurden, ist das Modell in der betrachteten Gesamtfaltung sehr ähnlich zur Vergleichsstruktur. Kleine lokale Unterschiede können trotzdem vorhanden sein.`;
    }
  } else {
    updatePredictionModelNote();
  }
}

function styleDomain(model, residues, color, opacity = 0.88, thickness = 0.72) {
  if (!model || !residues?.length) return;
  const style = {
    cartoon: { color, opacity, thickness, arrows: true },
    stick: { color, radius: 0.08, opacity: Math.min(1, opacity + 0.08) }
  };
  if (typeof model.addStyle === "function") {
    model.addStyle({ hetflag: false, resi: residues }, style);
  } else {
    model.setStyle({ hetflag: false, resi: residues }, style);
  }
}

function highlightMbpDomainMotion() {
  if (!isMbpDomainMotionMode()) return null;
  const cfg = currentExample.domainMotion || {};
  const open = loadedModels.experiment;
  const closed = loadedModels.prediction;
  if (!open?.model || !closed?.model) {
    return { ok: false, message: "MBP-Unterschiedsmodus: offene und geschlossene Struktur müssen geladen sein." };
  }

  const movingResidues = residueSelectorFromRanges(cfg.movingRanges);
  const hingeResidues = residueSelectorFromRanges(cfg.hingeRanges);
  const openMovingColor = cfg.openMovingColor || "#B388FF";
  const closedMovingColor = cfg.closedMovingColor || "#FB923C";
  const hingeColor = cfg.hingeColor || "#FDE047";

  styleDomain(open.model, movingResidues, openMovingColor, 0.88, 0.74);
  styleDomain(closed.model, movingResidues, closedMovingColor, 0.94, 0.78);
  styleDomain(open.model, hingeResidues, hingeColor, 0.98, 0.86);
  styleDomain(closed.model, hingeResidues, hingeColor, 0.98, 0.86);

  if (cfg.showHingeMarkers !== false) {
    addPocketCaMarkers(open.pdb, hingeResidues, hingeColor, 0.50, 0.85);
    addPocketCaMarkers(closed.pdb, hingeResidues, hingeColor, 0.50, 0.85);
  }

  return {
    ok: true,
    message: "MBP-Domänenbewegung hervorgehoben: bewegte Domäne offen violett, geschlossen orange; Hinge-Bereiche gelb."
  };
}

function highlightDifferences() {
  if (!lastDiffResidues.length || !loadedModels.prediction) return;

  const pred = loadedModels.prediction.model;

  // Keine Kugelmarker mehr: Die abweichenden Abschnitte werden als farbige
  // Cartoon-/Rückgratsegmente über die bestehende Banddarstellung gelegt.
  // Dadurch bleibt das Gesamtbild des Overlays deutlich ruhiger.
  const diffRibbon = {
    cartoon: {
      color: "#D84315",
      opacity: 0.96,
      thickness: 0.72,
      arrows: true
    }
  };

  const diffBackbone = {
    stick: {
      color: "#BF360C",
      radius: 0.10,
      opacity: 0.70
    }
  };

  if (typeof pred.addStyle === "function") {
    pred.addStyle({ hetflag: false, resi: lastDiffResidues }, diffRibbon);
    pred.addStyle({ hetflag: false, atom: "CA", resi: lastDiffResidues }, diffBackbone);
  } else {
    pred.setStyle({ hetflag: false, resi: lastDiffResidues }, diffRibbon);
  }

  if (currentView === "differences" && !isStatePairExample(currentExample) && loadedModels.prediction?.pdb) {
    const caAtoms = parseAtoms(loadedModels.prediction.pdb)
      .filter(a => a.line.trimStart().startsWith("ATOM") && a.atom === "CA" && lastDiffResidues.includes(a.resi));

    // Bei sehr vielen Abweichungen nicht jeden Cα-Punkt markieren, sonst wird
    // die Darstellung wieder unübersichtlich.
    const step = caAtoms.length > 40 ? Math.ceil(caAtoms.length / 40) : 1;
    caAtoms.forEach((a, index) => {
      if (index % step === 0) addSphereMarker({ x: a.x, y: a.y, z: a.z }, 0.38, "#FF7043", 0.82);
    });
  }
}

function toggleViewerExpanded(forceState = null) {
  viewerExpanded = typeof forceState === "boolean" ? forceState : !viewerExpanded;
  const panel = document.querySelector(".viewer-panel");
  panel?.classList.toggle("viewer-expanded", viewerExpanded);
  document.body.classList.toggle("viewer-expanded-active", viewerExpanded);
  if (els.expandViewerBtn) els.expandViewerBtn.textContent = viewerExpanded ? "Viewer verkleinern" : "Viewer vergrößern";
  setTimeout(() => {
    if (viewer && typeof viewer.resize === "function") viewer.resize();
    if (viewer) viewer.render();
  }, 80);
}

function addResidueLabels(pdb, residues, color = "#D32F2F") {
  if (!viewer || !residues?.length) return;
  const coords = getCaCoordsForResidues(pdb, residues);
  for (const item of coords) {
    viewer.addLabel(String(item.resi), {
      position: { x: item.x, y: item.y, z: item.z },
      backgroundColor: "white",
      fontColor: color,
      fontSize: 11,
      borderThickness: 1,
      borderColor: color,
      inFront: true
    });
  }
}

function getCaCoordsForResidues(pdb, residues) {
  const wanted = new Set(residues.map(Number));
  const out = [];
  for (const a of parseAtoms(pdb)) {
    if (a.atom === "CA" && wanted.has(a.resi) && Number.isFinite(a.x)) out.push(a);
  }
  return out;
}

function getLigandAtoms(pdb, ligandNames = [], fallbackToAnyHetero = false) {
  const keep = new Set((ligandNames || []).map(x => String(x).trim().toUpperCase()));
  const allHetero = parseAtoms(pdb).filter(a => a.line.trimStart().startsWith("HETATM"));
  const selected = allHetero.filter(a => !keep.size || keep.has(a.resn.toUpperCase()));
  if (selected.length || !fallbackToAnyHetero) return selected;
  return allHetero;
}

function getPocketResiduesNearLigand(pdb, ligandNames = [], radius = 4.5) {
  const ligAtoms = getLigandAtoms(pdb, ligandNames, !!currentExample?.bindingSite?.fallbackToAnyHetero);
  if (!ligAtoms.length) return { residues: [], ligandAtoms: [] };

  const proteinAtoms = parseAtoms(pdb).filter(a => a.line.trimStart().startsWith("ATOM"));
  const resMap = new Map();

  for (const p of proteinAtoms) {
    for (const l of ligAtoms) {
      const dx = p.x - l.x;
      const dy = p.y - l.y;
      const dz = p.z - l.z;
      const d2 = dx*dx + dy*dy + dz*dz;
      if (d2 <= radius * radius) {
        if (!resMap.has(p.resi)) resMap.set(p.resi, { resi: p.resi, resn: p.resn });
        break;
      }
    }
  }

  return {
    residues: Array.from(resMap.values()).sort((a,b) => a.resi - b.resi),
    ligandAtoms: ligAtoms
  };
}

function pdbFromAtomLines(atomLines, remark = "selection") {
  const lines = atomLines.filter(Boolean);
  if (!lines.length) return "";
  return `REMARK ${remark}\n${lines.join("\n")}\nEND\n`;
}

function addCentroidLabel(atoms, text, color = "#C2185B") {
  if (!viewer || !atoms?.length) return;
  let sx = 0, sy = 0, sz = 0, n = 0;
  for (const a of atoms) {
    if (![a.x, a.y, a.z].every(Number.isFinite)) continue;
    sx += a.x; sy += a.y; sz += a.z; n += 1;
  }
  if (!n) return;
  viewer.addLabel(text, {
    position: { x: sx / n, y: sy / n, z: sz / n },
    backgroundColor: "white",
    fontColor: color,
    fontSize: 14,
    borderThickness: 1,
    borderColor: color,
    inFront: true
  });
}

function addResidueNameLabels(pdb, residueItems, color = "#D84315") {
  if (!viewer || !residueItems?.length) return;
  const residueMap = new Map(residueItems.map(r => [Number(r.resi), String(r.resn || "").trim()]));
  for (const a of parseAtoms(pdb)) {
    if (a.atom !== "CA") continue;
    const resi = Number(a.resi);
    if (!residueMap.has(resi) || !Number.isFinite(a.x)) continue;
    const labelText = `${residueMap.get(resi)} ${resi}`;
    viewer.addLabel(labelText, {
      position: { x: a.x, y: a.y, z: a.z },
      backgroundColor: "white",
      fontColor: color,
      fontSize: 11,
      borderThickness: 1,
      borderColor: color,
      inFront: true
    });
  }
}

function centroidOfAtoms(atoms) {
  let sx = 0, sy = 0, sz = 0, n = 0;
  for (const a of atoms || []) {
    if (![a.x, a.y, a.z].every(Number.isFinite)) continue;
    sx += a.x; sy += a.y; sz += a.z; n += 1;
  }
  return n ? { x: sx / n, y: sy / n, z: sz / n } : null;
}

function addSphereMarker(center, radius, color, opacity = 0.75) {
  if (!viewer || !center || typeof viewer.addSphere !== "function") return;
  viewer.addSphere({
    center,
    radius,
    color,
    opacity
  });
}

function addPocketCaMarkers(pdb, residueNumbers, color, radius = 0.55, opacity = 0.80) {
  if (!viewer || !pdb || !residueNumbers?.length || typeof viewer.addSphere !== "function") return;
  const wanted = new Set(residueNumbers.map(Number));
  for (const a of parseAtoms(pdb)) {
    if (a.atom !== "CA" || !wanted.has(Number(a.resi))) continue;
    addSphereMarker({ x: a.x, y: a.y, z: a.z }, radius, color, opacity);
  }
}

function getReferencePocketResidues(cfg, pdb) {
  const refs = Array.isArray(cfg?.referenceResidues) ? cfg.referenceResidues.map(Number).filter(Number.isFinite) : [];
  if (!refs.length || !pdb) return [];
  const atoms = parseAtoms(pdb).filter(a => a.line.trimStart().startsWith("ATOM") && refs.includes(a.resi));
  const residueMap = new Map();
  for (const a of atoms) {
    const key = `${a.chain}|${a.resi}`;
    if (!residueMap.has(key)) residueMap.set(key, { chain: a.chain, resi: a.resi, resn: a.resn });
  }
  return Array.from(residueMap.values()).sort((a, b) => a.resi - b.resi);
}

function highlightBindingSite() {
  if (!currentExample?.bindingSite?.enabled || !els.showPocket?.checked) return null;

  const cfg = currentExample.bindingSite || {};
  const closed = loadedModels.prediction;
  const open = loadedModels.experiment;
  const ligandNames = cfg.ligandNames || [];
  const radius = Number(cfg.radius || 4.5);
  const ligandStickColor = cfg.ligandStickColor || "#29B6F6";
  const ligandSphereColor = cfg.ligandSphereColor || "#81D4FA";
  const ligandLabelColor = cfg.ligandLabelColor || "#0277BD";
  const closedPocketColor = cfg.closedPocketColor || "#F9A825";
  const openPocketColor = cfg.openPocketColor || "#26A69A";

  // Offene Einzelansicht: Der geschlossene Ligand ist nicht geladen.
  // Wir markieren daher die korrespondierenden Taschenreste aus der bekannten 1ANF-Bindetasche.
  if ((!closed?.model || !closed?.pdb) && open?.pdb && cfg.showOnOpenState) {
    const openPocketResidues = getReferencePocketResidues(cfg, open.pdb);
    if (!openPocketResidues.length) {
      return { ok: false, message: "Bindetasche: offener Zustand geladen, aber keine Referenzreste für die offene Form gefunden." };
    }
    const openResidueNumbers = openPocketResidues.map(r => r.resi);

    if (cfg.useVisibleMarkers) {
      addPocketCaMarkers(open.pdb, openResidueNumbers, openPocketColor, 0.58, 0.78);
    }

    const openPocketAtoms = parseAtoms(open.pdb)
      .filter(a => a.line.trimStart().startsWith("ATOM") && openResidueNumbers.includes(a.resi));
    const openPocketPdb = pdbFromAtomLines(openPocketAtoms.map(a => a.line), "MBP open binding pocket residues");
    if (openPocketPdb) {
      const openPocketModel = viewer.addModel(openPocketPdb, "pdb");
      openPocketModel.setStyle({}, { stick: { color: openPocketColor, radius: 0.22, opacity: 0.96 } });
      loadedModels.bindingPocketOpen = { model: openPocketModel, pdb: openPocketPdb, struct: { label: "Bindetasche offen" } };
    }

    return {
      ok: true,
      message: `Bindetasche offen hervorgehoben: ${openPocketResidues.length} Referenzreste hellviolett markiert.`
    };
  }

  if (!closed?.model || !closed?.pdb) {
    return { ok: false, message: "Bindetasche: geschlossener Zustand ist nicht geladen. Bitte „geschlossen“ oder „offen + geschlossen“ wählen." };
  }
  const result = getPocketResiduesNearLigand(closed.pdb, ligandNames, radius);
  const pocketResidues = result.residues;
  const ligandAtoms = result.ligandAtoms;

  const heteroNames = Array.from(new Set(parseAtoms(closed.pdb)
    .filter(a => a.line.trimStart().startsWith("HETATM"))
    .map(a => a.resn))).sort();

  if (!ligandAtoms.length) {
    return {
      ok: false,
      message: `Bindetasche: Kein HETATM-Ligand gefunden. Vorhandene HETATM-Namen: ${heteroNames.length ? heteroNames.join(", ") : "keine"}.`
    };
  }
  if (!pocketResidues.length) {
    return {
      ok: false,
      message: `Bindetasche: Ligand gefunden (${ligandAtoms.length} Atome; ${Array.from(new Set(ligandAtoms.map(a => a.resn))).join("/")}), aber keine Proteinreste im Umkreis von ${radius} Å.`
    };
  }

  const residueNumbers = pocketResidues.map(r => r.resi);
  const ligandResnames = Array.from(new Set(ligandAtoms.map(a => a.resn))).join("/") || "Ligand";

  if (cfg.useVisibleMarkers) {
    const ligandCenter = centroidOfAtoms(ligandAtoms);
    addSphereMarker(ligandCenter, 2.0, ligandLabelColor, 0.72);
    if (cfg.labelLigand) addCentroidLabel(ligandAtoms, "Maltose / Ligand", ligandLabelColor);
    addPocketCaMarkers(closed.pdb, residueNumbers, closedPocketColor, 0.62, 0.86);
    if (cfg.showOnOpenState && loadedModels.experiment?.pdb) {
      addPocketCaMarkers(loadedModels.experiment.pdb, residueNumbers, openPocketColor, 0.56, 0.74);
    }
  }

  // Robuster als addStyle auf dem Hauptmodell: Ligand und Bindetasche werden
  // als eigene Zusatzmodelle über die Cartoon-Darstellung gelegt.
  const ligandPdb = pdbFromAtomLines(ligandAtoms.map(a => a.line), "MBP ligand");
  if (ligandPdb) {
    const ligandModel = viewer.addModel(ligandPdb, "pdb");
    ligandModel.setStyle({}, {
      stick: { color: ligandStickColor, radius: 0.36, opacity: 1.0 },
      sphere: { color: ligandSphereColor, scale: 0.72, opacity: 0.98 }
    });
    loadedModels.bindingLigand = { model: ligandModel, pdb: ligandPdb, struct: { label: "Maltose / Ligand" } };
  }

  const closedPocketAtoms = parseAtoms(closed.pdb)
    .filter(a => a.line.trimStart().startsWith("ATOM") && residueNumbers.includes(a.resi));
  const closedPocketPdb = pdbFromAtomLines(closedPocketAtoms.map(a => a.line), "MBP closed binding pocket");
  if (closedPocketPdb) {
    const closedPocketModel = viewer.addModel(closedPocketPdb, "pdb");
    closedPocketModel.setStyle({}, {
      stick: { color: closedPocketColor, radius: 0.20, opacity: 0.98 }
    });
    loadedModels.bindingPocketClosed = { model: closedPocketModel, pdb: closedPocketPdb, struct: { label: "Bindetasche geschlossen" } };
  }

  if (cfg.showOnOpenState && loadedModels.experiment?.pdb) {
    const openPocketAtoms = parseAtoms(loadedModels.experiment.pdb)
      .filter(a => a.line.trimStart().startsWith("ATOM") && residueNumbers.includes(a.resi));
    const openPocketPdb = pdbFromAtomLines(openPocketAtoms.map(a => a.line), "MBP open binding pocket residues");
    if (openPocketPdb) {
      const openPocketModel = viewer.addModel(openPocketPdb, "pdb");
      openPocketModel.setStyle({}, {
        stick: { color: openPocketColor, radius: 0.20, opacity: 0.95 }
      });
      loadedModels.bindingPocketOpen = { model: openPocketModel, pdb: openPocketPdb, struct: { label: "Bindetasche offen" } };
    }
  }

  if (cfg.labelResidues) addResidueNameLabels(closed.pdb, pocketResidues, "#C2410C");

  return {
    ok: true,
    message: `Bindetasche hervorgehoben: Maltose ${ligandResnames} hellblau; ${pocketResidues.length} Taschenreste markiert.`
  };
}


function handleUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    uploadedPdb = String(reader.result || "");
    currentView = "overlay";
    document.querySelectorAll(".viewBtn").forEach(btn => btn.classList.toggle("active", btn.dataset.view === currentView));
    updateCheckboxesForView();
    loadCurrentExample();
  };
  reader.readAsText(file);
}

function parseAtoms(pdb) {
  const atoms = [];
  const lines = pdb.split(/\r?\n/);
  for (const line of lines) {
    if (!isAtomLine(line)) continue;
    atoms.push({
      line,
      atom: line.slice(12, 16).trim(),
      resn: line.slice(17, 20).trim(),
      chain: line[21],
      resi: parseInt(line.slice(22, 26).trim(), 10),
      x: parseFloat(line.slice(30, 38)),
      y: parseFloat(line.slice(38, 46)),
      z: parseFloat(line.slice(46, 54))
    });
  }
  return atoms;
}

function caMap(pdb) {
  const map = new Map();
  for (const a of parseAtoms(pdb)) {
    if (a.atom === "CA" && Number.isFinite(a.x)) {
      map.set(a.resi, [a.x, a.y, a.z]);
    }
  }
  return map;
}

function alignMobileToReferenceByResidues(mobilePdb, refPdb, threshold = 2.0, fitResidues = null) {
  const mobileMap = caMap(mobilePdb);
  const refMap = caMap(refPdb);
  const allPairs = [];
  for (const [resi, m] of mobileMap.entries()) {
    if (refMap.has(resi)) allPairs.push({ resi, mobile: m, ref: refMap.get(resi) });
  }
  if (allPairs.length < 4) throw new Error("Zu wenige gemeinsame Cα-Atome für eine Überlagerung.");

  const fitSet = fitResidues?.length ? new Set(fitResidues.map(Number)) : null;
  const fitPairs = fitSet ? allPairs.filter(p => fitSet.has(Number(p.resi))) : allPairs;
  if (fitPairs.length < 4) throw new Error("Zu wenige gemeinsame Cα-Atome in der gewählten Ankerdomäne.");

  const cm = centroid(fitPairs.map(p => p.mobile));
  const cr = centroid(fitPairs.map(p => p.ref));
  const H = [[0,0,0],[0,0,0],[0,0,0]];
  for (const p of fitPairs) {
    const a = sub(p.mobile, cm);
    const b = sub(p.ref, cr);
    for (let i=0;i<3;i++) for (let j=0;j<3;j++) H[i][j] += a[i] * b[j];
  }
  const q = largestQuaternion(H);
  const R = quatToRot(q);

  const transformed = transformPdb(mobilePdb, R, cm, cr);

  const diffResidues = [];
  let sumSq = 0;
  for (const p of allPairs) {
    const tm = add(matVec(R, sub(p.mobile, cm)), cr);
    const d = dist(tm, p.ref);
    sumSq += d * d;
    if (d > threshold) diffResidues.push(p.resi);
  }
  const rmsd = Math.sqrt(sumSq / allPairs.length);

  return { pdb: transformed, pairCount: allPairs.length, fitPairCount: fitPairs.length, diffResidues, rmsd };
}

function alignMobileToReference(mobilePdb, refPdb, threshold = 2.0) {
  const mobileMap = caMap(mobilePdb);
  const refMap = caMap(refPdb);
  const pairs = [];
  for (const [resi, m] of mobileMap.entries()) {
    if (refMap.has(resi)) pairs.push({ resi, mobile: m, ref: refMap.get(resi) });
  }
  if (pairs.length < 4) throw new Error("Zu wenige gemeinsame Cα-Atome für eine Überlagerung.");

  const cm = centroid(pairs.map(p => p.mobile));
  const cr = centroid(pairs.map(p => p.ref));
  const H = [[0,0,0],[0,0,0],[0,0,0]];
  for (const p of pairs) {
    const a = sub(p.mobile, cm);
    const b = sub(p.ref, cr);
    for (let i=0;i<3;i++) for (let j=0;j<3;j++) H[i][j] += a[i] * b[j];
  }
  const q = largestQuaternion(H);
  const R = quatToRot(q);

  const transformed = transformPdb(mobilePdb, R, cm, cr);

  const diffResidues = [];
  let sumSq = 0;
  for (const p of pairs) {
    const tm = add(matVec(R, sub(p.mobile, cm)), cr);
    const d = dist(tm, p.ref);
    sumSq += d * d;
    if (d > threshold) diffResidues.push(p.resi);
  }
  const rmsd = Math.sqrt(sumSq / pairs.length);

  return { pdb: transformed, pairCount: pairs.length, diffResidues, rmsd };
}

function centroid(points) {
  const c = [0,0,0];
  for (const p of points) { c[0]+=p[0]; c[1]+=p[1]; c[2]+=p[2]; }
  return c.map(x => x / points.length);
}
function sub(a,b) { return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]; }
function add(a,b) { return [a[0]+b[0], a[1]+b[1], a[2]+b[2]]; }
function dist(a,b) { const d=sub(a,b); return Math.hypot(d[0], d[1], d[2]); }
function matVec(M, v) { return [M[0][0]*v[0]+M[0][1]*v[1]+M[0][2]*v[2], M[1][0]*v[0]+M[1][1]*v[1]+M[1][2]*v[2], M[2][0]*v[0]+M[2][1]*v[1]+M[2][2]*v[2]]; }

function largestQuaternion(S) {
  const [Sxx,Sxy,Sxz] = S[0];
  const [Syx,Syy,Syz] = S[1];
  const [Szx,Szy,Szz] = S[2];
  const K = [
    [Sxx+Syy+Szz, Syz-Szy,       Szx-Sxz,       Sxy-Syx],
    [Syz-Szy,       Sxx-Syy-Szz, Sxy+Syx,       Szx+Sxz],
    [Szx-Sxz,       Sxy+Syx,      -Sxx+Syy-Szz, Syz+Szy],
    [Sxy-Syx,       Szx+Sxz,       Syz+Szy,     -Sxx-Syy+Szz]
  ];
  let q = [1,0,0,0];
  for (let iter=0; iter<80; iter++) {
    const nq = [0,0,0,0];
    for (let i=0;i<4;i++) for (let j=0;j<4;j++) nq[i] += K[i][j]*q[j];
    const norm = Math.hypot(nq[0],nq[1],nq[2],nq[3]) || 1;
    q = nq.map(x => x / norm);
  }
  return q;
}

function quatToRot(q) {
  let [w,x,y,z] = q;
  const n = Math.hypot(w,x,y,z) || 1;
  w/=n; x/=n; y/=n; z/=n;
  return [
    [1-2*y*y-2*z*z, 2*x*y-2*z*w,   2*x*z+2*y*w],
    [2*x*y+2*z*w,   1-2*x*x-2*z*z, 2*y*z-2*x*w],
    [2*x*z-2*y*w,   2*y*z+2*x*w,   1-2*x*x-2*y*y]
  ];
}

function transformPdb(pdb, R, cMobile, cRef) {
  return pdb.split(/\r?\n/).map(line => {
    if (!isAtomLine(line)) return line;
    const x = parseFloat(line.slice(30, 38));
    const y = parseFloat(line.slice(38, 46));
    const z = parseFloat(line.slice(46, 54));
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return line;
    const p = add(matVec(R, sub([x,y,z], cMobile)), cRef);
    return line.slice(0,30) + fmtCoord(p[0]) + fmtCoord(p[1]) + fmtCoord(p[2]) + line.slice(54);
  }).join("\n");
}

function fmtCoord(x) {
  return x.toFixed(3).toString().padStart(8, " ");
}

function setStatus(msg, kind = "") {
  els.status.textContent = msg;
  els.status.className = `status ${kind}`.trim();
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
}
function escapeAttr(s) { return escapeHtml(s).replace(/`/g, "&#96;"); }
