/* ============================================================
   ITALIAN B2 BOOST — app.js
   Moteur applicatif : navigation entre écrans, rendu du
   dashboard, moteur de missions, simulateur d'entretien.
   ============================================================ */

let currentMissionDay = null;
let currentMissionIndex = 0; // 0=warmup 1=vocab 2=comprensione 3=dialogo 4=sfida 5=quiz
let missionSessionMinutesStart = null;
let currentDialogueNodeId = null;
let currentInterviewSequence = [];
let currentInterviewIndex = 0;
let interviewTranscript = [];
let interviewIsFinalExam = false;

const MISSION_STEPS = ["Riscaldamento", "Vocabolario", "Comprensione", "Dialogo", "Sfida orale", "Quiz"];

/* ---------------------- Navigation ---------------------- */

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  document.getElementById(id)?.classList.add("active");
  document.getElementById("tabbar").style.display =
    ["screen-dashboard", "screen-revisioni", "screen-badges"].includes(id) ? "flex" : "none";
}

function goto(target) {
  if (target === "dashboard") { renderDashboard(); showScreen("screen-dashboard"); setActiveTab("dashboard"); }
  else if (target === "revisioni") { renderRevisioni(); showScreen("screen-revisioni"); setActiveTab("revisioni"); }
  else if (target === "badges") { renderBadges(); showScreen("screen-badges"); setActiveTab("badges"); }
  else if (target === "interview-menu") { startInterviewMenu(); showScreen("screen-interview"); setActiveTab("interview"); }
}

function setActiveTab(tab) {
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
}

document.addEventListener("click", (e) => {
  const gotoBtn = e.target.closest("[data-goto]");
  if (gotoBtn) goto(gotoBtn.dataset.goto);
});

/* ---------------------- Onboarding ---------------------- */

let onboardingDraft = { goal: null, timeAvailable: null, mode: null };

function initOnboarding() {
  document.querySelectorAll("#onboard-step-1 .choice-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      onboardingDraft.goal = btn.dataset.value;
      goToOnboardStep(2);
    });
  });
  document.querySelectorAll("#onboard-step-2 .choice-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      onboardingDraft.timeAvailable = parseInt(btn.dataset.value, 10);
      goToOnboardStep(3);
    });
  });
  document.querySelectorAll("#onboard-step-3 .choice-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      onboardingDraft.mode = btn.dataset.value;
      goToOnboardStep(4);
    });
  });
  document.getElementById("btn-finish-onboarding").addEventListener("click", () => {
    AppState.set((s) => {
      s.onboarded = true;
      s.profile.goal = onboardingDraft.goal;
      s.profile.timeAvailable = onboardingDraft.timeAvailable;
      s.profile.mode = onboardingDraft.mode;
      s.profile.name = document.getElementById("input-name").value.trim();
      s.profile.fieldOfStudy = document.getElementById("input-field").value.trim();
      s.profile.destinationCity = document.getElementById("input-city").value.trim();
    });
    goto("dashboard");
  });
}

function goToOnboardStep(n) {
  document.querySelectorAll(".onboard-step").forEach((s) => s.classList.remove("active"));
  document.getElementById(`onboard-step-${n}`).classList.add("active");
}

/* ---------------------- Dashboard ---------------------- */

function renderDashboard() {
  const s = AppState.get();
  const day = s.progress.currentDay;
  const completed = s.progress.completedDays.length;
  const percent = Math.round((completed / 14) * 100);

  document.getElementById("dash-greeting").textContent = s.profile.name
    ? `Bentornato/a, ${s.profile.name}`
    : "Bentornato/a";
  document.getElementById("dash-day-label").textContent = `Giorno ${day} / 14`;
  document.getElementById("dash-percent").textContent = `${percent}%`;
  document.getElementById("dash-progress-fill").style.width = `${percent}%`;

  document.getElementById("stat-streak").textContent = `🔥 ${s.progress.streak}`;
  document.getElementById("stat-xp").textContent = `⭐ ${s.progress.xp}`;
  const todayMin = s.progress.todayDateForMinutes === Storage.todayISO() ? s.progress.todayMinutes : 0;
  document.getElementById("stat-time").textContent = `${todayMin} min`;

  const meta = getLessonMeta(day);
  document.getElementById("cta-day-label").textContent = `Giorno ${day}`;
  document.getElementById("cta-title").textContent = meta
    ? `${meta.icon} ${meta.title}`
    : "Percorso completato!";
  const startBtn = document.getElementById("btn-start-mission");
  startBtn.onclick = () => startMission(day);
  startBtn.textContent = isDayCompleted(day, s) ? "↻ Ripeti il giorno" : "▶ Comincia";

  renderSkills(s);
  renderTrail(s);
}

function renderSkills(s) {
  const labels = { orale: "Orale", comprensione: "Comprensione", vocabolario: "Vocabolario", grammatica: "Grammatica", spontaneita: "Spontaneità" };
  const el = document.getElementById("skills-list");
  el.innerHTML = Object.entries(labels).map(([key, label]) => {
    const val = s.skills[key];
    return `
      <div class="skill-row">
        <div class="skill-top"><span>${label}</span><span>${val}%</span></div>
        <div class="skill-bar-track"><div class="skill-bar-fill" style="width:${val}%"></div></div>
      </div>`;
  }).join("");
}

function renderTrail(s) {
  const el = document.getElementById("trail-list");
  el.innerHTML = LESSONS.map((l) => {
    const done = isDayCompleted(l.day, s);
    const unlocked = isDayUnlocked(l.day, s);
    const isCurrent = l.day === s.progress.currentDay && !done;
    let cls = "trail-item";
    if (done) cls += " done";
    else if (isCurrent) cls += " current";
    else if (!unlocked) cls += " locked";
    const nodeContent = done ? "✓" : unlocked ? l.icon : "🔒";
    return `
      <button class="${cls}" ${unlocked ? `onclick="startMission(${l.day})"` : "disabled"}>
        <div class="trail-node">${nodeContent}</div>
        <div class="trail-info">
          <div class="trail-day-label">GIORNO ${l.day}</div>
          <div class="trail-title">${l.title}</div>
          <div class="trail-theme">${l.theme}</div>
        </div>
      </button>`;
  }).join("");
}

/* ---------------------- Mission engine ---------------------- */

function startMission(day) {
  currentMissionDay = day;
  currentMissionIndex = 0;
  missionSessionMinutesStart = Date.now();
  const meta = getLessonMeta(day);
  document.getElementById("mission-day-title").textContent = `Giorno ${day}`;
  showScreen("screen-mission");
  renderMissionNav();
  renderMissionStep();
}

function renderMissionNav() {
  const el = document.getElementById("mission-nav");
  el.innerHTML = MISSION_STEPS.map((_, i) => {
    let cls = "mission-dot";
    if (i < currentMissionIndex) cls += " done";
    if (i === currentMissionIndex) cls += " active";
    return `<div class="${cls}"></div>`;
  }).join("");
}

function nextMissionStep() {
  currentMissionIndex++;
  if (currentMissionIndex >= MISSION_STEPS.length) {
    finishMission();
    return;
  }
  renderMissionNav();
  renderMissionStep();
}

function renderMissionStep() {
  const day = currentMissionDay;
  const data = EXERCISES[day];
  const stepName = MISSION_STEPS[currentMissionIndex];
  document.getElementById("mission-step-label").textContent = `Missione ${currentMissionIndex + 1} — ${stepName}`;
  document.getElementById("mission-title").textContent = stepName;
  const container = document.getElementById("mission-content");

  if (stepName === "Riscaldamento") renderWarmup(container, data);
  else if (stepName === "Vocabolario") renderVocab(container, data);
  else if (stepName === "Comprensione") renderComprehension(container, data);
  else if (stepName === "Dialogo") renderDialogo(container, day);
  else if (stepName === "Sfida orale") renderSfidaOrale(container, data);
  else if (stepName === "Quiz") renderQuiz(container, data, day);
}

/* --- Riscaldamento --- */
function renderWarmup(container, data) {
  container.innerHTML = `
    <div class="card">
      <p class="small-muted">Rispondi con calma a queste domande, a voce alta o per iscritto. Non c'è una risposta "giusta": è solo per riattivare l'italiano.</p>
      <div id="warmup-questions"></div>
    </div>
    <div class="bottom-actions">
      <button class="btn-primary btn-block" onclick="nextMissionStep()">Continua →</button>
    </div>`;
  const qEl = document.getElementById("warmup-questions");
  qEl.innerHTML = data.warmup.map((q, i) => `
    <div style="margin-bottom:16px;">
      <p class="prompt-text" style="font-size:1rem;">${q}</p>
      <div class="listen-row">
        <button class="icon-btn" onclick="Speech.speak('${escapeJs(q)}', 1)">🔊 Ascolta</button>
        <button class="icon-btn" onclick="Speech.speak('${escapeJs(q)}', 0.6)">🐢 Lento</button>
      </div>
      <textarea rows="2" placeholder="La tua risposta in italiano..." data-warmup-index="${i}"></textarea>
    </div>`).join("");
}

/* --- Vocabolario --- */
function renderVocab(container, data) {
  container.innerHTML = `
    <div class="card">
      <p class="small-muted">Ecco ${data.vocab.length} parole/espressioni utili per oggi. Prova a costruire una frase con almeno tre di esse.</p>
      <div id="vocab-list"></div>
    </div>
    <div class="card">
      <p style="font-weight:600;margin-bottom:8px;">✍️ La tua frase</p>
      <textarea rows="3" id="vocab-sentence" placeholder="Scrivi una frase usando almeno 2-3 parole qui sopra..."></textarea>
    </div>
    <div class="bottom-actions">
      <button class="btn-primary btn-block" onclick="submitVocab()">Continua →</button>
    </div>`;
  document.getElementById("vocab-list").innerHTML = data.vocab.map((v) => `
    <div class="vocab-item">
      <div class="vocab-it">${v.it} <button class="icon-btn" style="padding:3px 8px;font-size:0.72rem;" onclick="Speech.speak('${escapeJs(v.it)}')">🔊</button></div>
      <div class="vocab-fr">${v.fr}</div>
      <div class="vocab-example">« ${v.example} »</div>
    </div>`).join("");
}

function submitVocab() {
  const data = EXERCISES[currentMissionDay];
  const sentence = document.getElementById("vocab-sentence").value.toLowerCase();
  let usedCount = 0;
  data.vocab.forEach((v) => {
    const used = sentence.includes(v.it.split(" ")[0].toLowerCase().replace(/[()]/g, ""));
    AppState.addVocab(v.it, used);
    if (used) usedCount++;
  });
  AppState.addXP(10 + usedCount * 5);
  AppState.updateSkill("vocabolario", usedCount >= 2 ? 2 : 0.5);
  nextMissionStep();
}

/* --- Comprensione --- */
function renderComprehension(container, data) {
  const c = data.comprehension;
  container.innerHTML = `
    <div class="card">
      <p style="font-weight:600;margin-bottom:10px;">👂 Ascolta (o leggi) il testo</p>
      <div class="listen-row">
        <button class="icon-btn" onclick="Speech.speak(\`${escapeJs(c.audioText)}\`, 1)">🔊 Ascolta</button>
        <button class="icon-btn" onclick="Speech.speak(\`${escapeJs(c.audioText)}\`, 0.65)">🐢 Lento</button>
        <button class="icon-btn" id="toggle-transcript-btn" onclick="toggleTranscript()">👁 Mostra testo</button>
      </div>
      <div class="transcript-box" id="comprehension-transcript" style="display:none;">${c.audioText}</div>
    </div>
    <div class="card">
      <div id="comprehension-questions"></div>
    </div>
    <div class="bottom-actions">
      <button class="btn-primary btn-block" onclick="submitComprehension()">Verifica →</button>
    </div>`;
  document.getElementById("comprehension-questions").innerHTML = c.questions.map((q, qi) => `
    <div style="margin-bottom:16px;">
      <p style="font-weight:600;margin-bottom:8px;">${qi + 1}. ${q.q}</p>
      ${q.options.map((opt, oi) => `
        <button class="quiz-option" data-q="${qi}" data-o="${oi}" onclick="selectComprehensionOption(${qi},${oi})">${opt}</button>
      `).join("")}
    </div>`).join("");
}

function toggleTranscript() {
  const el = document.getElementById("comprehension-transcript");
  const btn = document.getElementById("toggle-transcript-btn");
  const show = el.style.display === "none";
  el.style.display = show ? "block" : "none";
  btn.textContent = show ? "🙈 Nascondi testo" : "👁 Mostra testo";
}

let comprehensionAnswers = {};
function selectComprehensionOption(qi, oi) {
  comprehensionAnswers[qi] = oi;
  document.querySelectorAll(`.quiz-option[data-q="${qi}"]`).forEach((btn) => {
    btn.classList.toggle("selected-temp", parseInt(btn.dataset.o) === oi);
    btn.style.borderColor = parseInt(btn.dataset.o) === oi ? "var(--olive)" : "var(--line)";
  });
}

function submitComprehension() {
  const data = EXERCISES[currentMissionDay].comprehension;
  let correctCount = 0;
  data.questions.forEach((q, qi) => {
    const chosen = comprehensionAnswers[qi];
    const btns = document.querySelectorAll(`.quiz-option[data-q="${qi}"]`);
    btns.forEach((btn) => {
      const oi = parseInt(btn.dataset.o);
      if (oi === q.correct) btn.classList.add("correct");
      else if (oi === chosen) btn.classList.add("incorrect");
    });
    if (chosen === q.correct) correctCount++;
  });
  const ratio = correctCount / data.questions.length;
  AppState.updateSkill("comprensione", (ratio - 0.5) * 8);
  AppState.addXP(Math.round(ratio * 20));
  comprehensionAnswers = {};
  setTimeout(() => nextMissionStep(), 900);
}

/* --- Dialogo interattivo (arbre à embranchements) --- */
function renderDialogo(container, day) {
  const tree = DIALOGUE_TREES[day];
  container.innerHTML = `<div class="card"><div class="chat-log" id="dialogo-log"></div><div id="dialogo-input-area"></div></div>
    <div class="bottom-actions" id="dialogo-actions" style="display:none;">
      <button class="btn-primary btn-block" onclick="nextMissionStep()">Continua →</button>
    </div>`;
  if (!tree) {
    // Pas d'arbre dédié pour ce jour -> mini dialogue générique basé sur speakingChallenge
    renderGenericDialogo(container, day);
    return;
  }
  currentDialogueNodeId = tree.start;
  appendDialogoAgentMessage(tree.nodes[tree.start].agent);
  renderDialogoInput(tree, day);
}

function renderGenericDialogo(container, day) {
  const data = EXERCISES[day];
  const q = data.warmup[Math.floor(Math.random() * data.warmup.length)];
  document.getElementById("dialogo-log").innerHTML = "";
  appendDialogoAgentMessage("Facciamo un breve scambio. Rispondi con naturalezza.");
  appendDialogoAgentMessage(q);
  const inputArea = document.getElementById("dialogo-input-area");
  inputArea.innerHTML = buildMicOrTextInput("generic-dialogo");
  wireMicOrTextInput("generic-dialogo", (text) => {
    appendDialogoUserMessage(text);
    const analysis = analyzeResponse(text, []);
    renderInlineFeedback(inputArea, analysis);
    document.getElementById("dialogo-actions").style.display = "flex";
  });
}

function appendDialogoAgentMessage(text) {
  const log = document.getElementById("dialogo-log");
  log.innerHTML += `<div class="chat-bubble agent">🇮🇹 ${text} <button class="icon-btn" style="padding:2px 6px;font-size:0.68rem;margin-left:4px;" onclick="Speech.speak('${escapeJs(text)}')">🔊</button></div>`;
}
function appendDialogoUserMessage(text) {
  const log = document.getElementById("dialogo-log");
  log.innerHTML += `<div class="chat-bubble user">${text}</div>`;
}

function renderDialogoInput(tree, day) {
  const inputArea = document.getElementById("dialogo-input-area");
  inputArea.innerHTML = buildMicOrTextInput("tree-dialogo");
  wireMicOrTextInput("tree-dialogo", (text) => {
    appendDialogoUserMessage(text);
    const node = tree.nodes[currentDialogueNodeId];
    const analysis = analyzeResponse(text, node.expectKeywords || []);
    renderInlineFeedback(inputArea, analysis);

    let nextId = node.next;
    if (node.branches) {
      for (const b of node.branches) {
        if (b.ifKeywords.some((k) => text.toLowerCase().includes(k))) { nextId = b.next; break; }
      }
    }
    if (nextId && tree.nodes[nextId]) {
      currentDialogueNodeId = nextId;
      setTimeout(() => {
        appendDialogoAgentMessage(tree.nodes[nextId].agent);
        renderDialogoInput(tree, day);
      }, 700);
    } else {
      document.getElementById("dialogo-actions").style.display = "flex";
    }
    AppState.addXP(8);
    AppState.updateSkill("orale", 1);
  });
}

/* --- Sfida orale --- */
function renderSfidaOrale(container, data) {
  container.innerHTML = `
    <div class="card">
      <p class="prompt-text">${data.speakingChallenge}</p>
      <p class="small-muted">Parla per 1-2 minuti, senza fermarti troppo. Poi guarda il feedback.</p>
      <div id="sfida-input-area"></div>
      <div id="sfida-feedback"></div>
    </div>
    <div class="bottom-actions">
      <button class="btn-primary btn-block" onclick="nextMissionStep()">Continua →</button>
    </div>`;
  const area = document.getElementById("sfida-input-area");
  area.innerHTML = buildMicOrTextInput("sfida");
  wireMicOrTextInput("sfida", (text) => {
    const analysis = analyzeResponse(text, []);
    renderScoreBlock(document.getElementById("sfida-feedback"), analysis);
    AppState.addXP(25);
    AppState.updateSkill("orale", 2);
    AppState.updateSkill("spontaneita", 2);
    analysis.pitfalls.importantIssues.forEach((p) => AppState.recordMistake("grammatica", p.message, currentMissionDay));
  });
}

/* --- Quiz --- */
function renderQuiz(container, data, day) {
  container.innerHTML = `<div class="card" id="quiz-card"></div>
    <div class="bottom-actions"><button class="btn-primary btn-block" id="quiz-finish-btn" style="display:none" onclick="finishMission()">Termina la missione ✓</button></div>`;
  const quizAnswers = {};
  const card = document.getElementById("quiz-card");
  card.innerHTML = data.quiz.map((q, qi) => `
    <div style="margin-bottom:18px;">
      <p style="font-weight:600;margin-bottom:8px;">${qi + 1}. ${q.q}</p>
      ${q.options.map((opt, oi) => `<button class="quiz-option" data-q="${qi}" data-o="${oi}" onclick="answerQuiz(${qi},${oi},${q.correct})">${opt}</button>`).join("")}
    </div>`).join("") + `<div id="quiz-result" style="display:none;margin-top:10px;font-weight:600;"></div>`;
}

let quizCorrectCount = 0;
let quizAnswered = 0;
function answerQuiz(qi, oi, correctIdx) {
  const btns = document.querySelectorAll(`.quiz-option[data-q="${qi}"]`);
  if (btns[0].disabled) return;
  btns.forEach((b) => { b.disabled = true; if (parseInt(b.dataset.o) === correctIdx) b.classList.add("correct"); });
  if (oi !== correctIdx) btns[oi].classList.add("incorrect");
  else { quizCorrectCount++; AppState.addXP(10); }
  quizAnswered++;
  const total = EXERCISES[currentMissionDay].quiz.length;
  if (quizAnswered >= total) {
    document.getElementById("quiz-finish-btn").style.display = "block";
    document.getElementById("quiz-result").style.display = "block";
    document.getElementById("quiz-result").textContent = `Hai risposto correttamente a ${quizCorrectCount}/${total} domande.`;
    AppState.updateSkill("grammatica", (quizCorrectCount / total - 0.5) * 6);
  }
}

/* --- Helpers: mic/text input --- */
function buildMicOrTextInput(id) {
  if (Speech.recognitionSupported) {
    return `
      <div class="mic-row">
        <button class="mic-btn" id="mic-${id}">🎤</button>
        <span class="mic-status" id="mic-status-${id}">Tocca per parlare</span>
      </div>
      <div class="transcript-box" id="transcript-${id}" style="display:none;"></div>
      <textarea rows="2" id="fallback-${id}" placeholder="...oppure scrivi qui la tua risposta" style="margin-top:8px;"></textarea>
      <button class="btn-secondary" style="margin-top:8px;" id="send-${id}">Invia risposta</button>`;
  }
  return `
    <textarea rows="3" id="fallback-${id}" placeholder="Il riconoscimento vocale non è disponibile: scrivi qui la tua risposta in italiano."></textarea>
    <button class="btn-primary" style="margin-top:8px;" id="send-${id}">Invia risposta</button>`;
}

function wireMicOrTextInput(id, onSubmit) {
  const sendBtn = document.getElementById(`send-${id}`);
  const fallback = document.getElementById(`fallback-${id}`);
  if (sendBtn) {
    sendBtn.addEventListener("click", () => {
      const text = fallback.value.trim();
      if (!text) return;
      onSubmit(text);
      sendBtn.disabled = true;
      fallback.disabled = true;
    });
  }
  const micBtn = document.getElementById(`mic-${id}`);
  if (micBtn) {
    let listening = false;
    micBtn.addEventListener("click", () => {
      if (listening) { Speech.stopListening(); return; }
      listening = true;
      micBtn.classList.add("listening");
      document.getElementById(`mic-status-${id}`).textContent = "Ti ascolto...";
      const transcriptBox = document.getElementById(`transcript-${id}`);
      transcriptBox.style.display = "block";
      Speech.startListening({
        onInterim: (t) => { transcriptBox.textContent = t; },
        onFinal: (t) => { transcriptBox.textContent = t; fallback.value = t; },
        onEnd: () => {
          listening = false;
          micBtn.classList.remove("listening");
          document.getElementById(`mic-status-${id}`).textContent = "Tocca per riprovare";
          if (fallback.value.trim()) {
            onSubmit(fallback.value.trim());
            micBtn.disabled = true; sendBtn && (sendBtn.disabled = true);
          }
        },
        onError: () => {
          listening = false;
          micBtn.classList.remove("listening");
          document.getElementById(`mic-status-${id}`).textContent = "Errore — prova a scrivere qui sotto";
        },
      });
    });
  }
}

function renderInlineFeedback(container, analysis) {
  const box = document.createElement("div");
  const lines = renderFeedback(analysis);
  box.innerHTML = `<ul class="feedback-list">${lines.map((l) => `<li>${l}</li>`).join("")}</ul>`;
  container.appendChild(box);
}

function renderScoreBlock(container, analysis) {
  const lines = renderFeedback(analysis);
  container.innerHTML = `
    <ul class="feedback-list">${lines.map((l) => `<li>${l}</li>`).join("")}</ul>
    <div class="score-grid">
      <div class="score-pill"><span>Fluidità</span><b>${analysis.scores.fluidita}/10</b></div>
      <div class="score-pill"><span>Grammatica</span><b>${analysis.scores.grammatica}/10</b></div>
      <div class="score-pill"><span>Vocabolario</span><b>${analysis.scores.vocabolario}/10</b></div>
      <div class="score-pill"><span>Spontaneità</span><b>${analysis.scores.spontaneita}/10</b></div>
    </div>`;
}

function escapeJs(str) {
  return String(str).replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/`/g, "\\`").replace(/\n/g, " ");
}

/* --- Fin de mission --- */
function finishMission() {
  const day = currentMissionDay;
  const minutesSpent = Math.max(1, Math.round((Date.now() - missionSessionMinutesStart) / 60000));
  AppState.addMinutesToday(minutesSpent);
  const s = AppState.get();
  const scores = {
    orale: s.skills.orale, comprensione: s.skills.comprensione,
    vocabolario: s.skills.vocabolario, grammatica: s.skills.grammatica,
    spontaneita: s.skills.spontaneita,
  };
  AppState.completeDay(day, scores);
  AppState.addXP(30); // bonus de complétion

  if (day === 14) {
    launchFinalExam();
    return;
  }

  quizCorrectCount = 0; quizAnswered = 0;
  goto("dashboard");
  showMissionCompleteToast(day);
}

function showMissionCompleteToast(day) {
  // Petit retour visuel simple sans bloquer la navigation
  const el = document.getElementById("cta-title");
  if (el) {
    const original = el.textContent;
    el.textContent = "✓ Giorno completato! Ottimo lavoro.";
    setTimeout(() => { el.textContent = original; }, 2200);
  }
}

/* ---------------------- Simulateur d'entretien ---------------------- */

function startInterviewMenu() {
  const s = AppState.get();
  const unlocked = s.progress.currentDay >= 8 || s.progress.completedDays.length >= 7;
  const content = document.getElementById("interview-content");
  if (!unlocked) {
    content.innerHTML = `
      <div class="empty-state">
        <h3>🔒 Simulatore non ancora disponibile</h3>
        <p class="small-muted">Il simulatore di colloquio completo si sblocca a partire dal Giorno 8. Continua il tuo percorso per accedervi.</p>
      </div>`;
    return;
  }
  content.innerHTML = `
    <div class="card">
      <h3>🎙️ Simulazione colloquio consolare</h3>
      <p class="small-muted">Scegli la lunghezza della simulazione. L'agente ti farà domande, a volte inaspettate, su identità, studi, progetto in Italia, finanziamento e soggiorno.</p>
      <button class="btn-primary btn-block" style="margin-bottom:10px;" onclick="launchInterview(6)">Simulazione breve (6 domande)</button>
      <button class="btn-secondary btn-block" onclick="launchInterview(10)">Simulazione completa (10 domande)</button>
    </div>`;
}

function launchInterview(length) {
  currentInterviewSequence = buildInterviewSequence(length);
  currentInterviewIndex = 0;
  interviewTranscript = [];
  interviewIsFinalExam = false;
  renderInterviewStep();
}

function launchFinalExam() {
  currentInterviewSequence = buildInterviewSequence(10);
  currentInterviewIndex = 0;
  interviewTranscript = [];
  interviewIsFinalExam = true;
  showScreen("screen-interview");
  setActiveTab("interview");
  renderInterviewStep();
}

function renderInterviewStep() {
  const content = document.getElementById("interview-content");
  if (currentInterviewIndex >= currentInterviewSequence.length) {
    finishInterview();
    return;
  }
  const item = currentInterviewSequence[currentInterviewIndex];
  content.innerHTML = `
    <div class="card">
      <div class="mission-badge">Domanda ${currentInterviewIndex + 1} / ${currentInterviewSequence.length}</div>
      <p class="prompt-text">🇮🇹 AGENTE CONSOLARE<br>${item.question}</p>
      <div class="listen-row">
        <button class="icon-btn" onclick="Speech.speak('${escapeJs(item.question)}')">🔊 Ascolta</button>
      </div>
      <div id="interview-input-area"></div>
      <div id="interview-feedback"></div>
    </div>
    <div class="bottom-actions" id="interview-next-actions" style="display:none;">
      <button class="btn-primary btn-block" onclick="advanceInterview()">Prossima domanda →</button>
    </div>`;
  const area = document.getElementById("interview-input-area");
  area.innerHTML = buildMicOrTextInput("interview");
  wireMicOrTextInput("interview", (text) => {
    const analysis = analyzeResponse(text, []);
    interviewTranscript.push({ question: item.question, answer: text, scores: analysis.scores });
    renderScoreBlock(document.getElementById("interview-feedback"), analysis);
    document.getElementById("interview-next-actions").style.display = "flex";
  });
}

function advanceInterview() {
  currentInterviewIndex++;
  renderInterviewStep();
}

function finishInterview() {
  const avg = (key) => {
    const vals = interviewTranscript.map((t) => t.scores[key]).filter((v) => v !== undefined);
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10 : 5;
  };
  const scores = {
    comprensione: avg("fluidita"), // proxy simple
    fluidita: avg("fluidita"),
    grammatica: avg("grammatica"),
    vocabolario: avg("vocabolario"),
    spontaneita: avg("spontaneita"),
  };
  const globalScore = Math.round(
    ((scores.fluidita + scores.grammatica + scores.vocabolario + scores.spontaneita + scores.comprensione) / 5) * 10
  );

  AppState.set((s) => {
    s.interviewResults.push({
      day: currentMissionDay || s.progress.currentDay,
      date: Storage.todayISO(),
      scores, transcript: interviewTranscript,
    });
    if (interviewIsFinalExam) s.finalExam = { scores, globalScore, date: Storage.todayISO() };
  });
  AppState.maybeAwardBadges();
  AppState.addXP(50);

  if (interviewIsFinalExam) {
    renderFinalResult(scores, globalScore);
    showScreen("screen-result");
    return;
  }

  const content = document.getElementById("interview-content");
  content.innerHTML = `
    <div class="card">
      <h3>📊 Valutazione della simulazione</h3>
      <div class="score-grid">
        <div class="score-pill"><span>Fluidità</span><b>${scores.fluidita}/10</b></div>
        <div class="score-pill"><span>Grammatica</span><b>${scores.grammatica}/10</b></div>
        <div class="score-pill"><span>Vocabolario</span><b>${scores.vocabolario}/10</b></div>
        <div class="score-pill"><span>Spontaneità</span><b>${scores.spontaneita}/10</b></div>
      </div>
      <p style="margin-top:14px;" class="small-muted">Continua il tuo percorso per sbloccare simulazioni più lunghe e complesse.</p>
      <button class="btn-primary btn-block" style="margin-top:10px;" data-goto="dashboard">Torna alla Home</button>
    </div>`;
}

function renderFinalResult(scores, globalScore) {
  const verdict = globalScore >= 75 ? "ready" : globalScore >= 55 ? "almost" : "needs-work";
  const verdictLabel = { ready: "🟢 PRONTO", almost: "🟠 QUASI PRONTO", "needs-work": "🔴 ANCORA DA MIGLIORARE" }[verdict];
  const s = AppState.get();
  const weakest = Object.entries(s.skills).sort((a, b) => a[1] - b[1]).slice(0, 3).map(([k]) => k);
  const labels = { orale: "Espressione orale", comprensione: "Comprensione", vocabolario: "Vocabolario", grammatica: "Grammatica", spontaneita: "Spontaneità" };

  document.getElementById("result-content").innerHTML = `
    <div class="card">
      <h3 style="text-align:center;">🎓 RISULTATO FINALE</h3>
      <div class="result-score">${globalScore}/100</div>
      <div class="result-verdict ${verdict}">${verdictLabel}</div>
      <div class="score-grid">
        <div class="score-pill"><span>Comprensione</span><b>${scores.comprensione}/10</b></div>
        <div class="score-pill"><span>Fluidità</span><b>${scores.fluidita}/10</b></div>
        <div class="score-pill"><span>Grammatica</span><b>${scores.grammatica}/10</b></div>
        <div class="score-pill"><span>Vocabolario</span><b>${scores.vocabolario}/10</b></div>
        <div class="score-pill"><span>Spontaneità</span><b>${scores.spontaneita}/10</b></div>
      </div>
    </div>
    <div class="card">
      <h3>⚠️ 5 aree principali da migliorare</h3>
      <ul class="feedback-list">
        ${weakest.map((k) => `<li>${labels[k]} — ${s.skills[k]}%</li>`).join("")}
        <li>Ripassa regolarmente il vocabolario acquisito nella sezione Revisioni</li>
      </ul>
    </div>
    <div class="card">
      <h3>💡 Raccomandazioni</h3>
      <ul class="feedback-list">
        <li>Continua a esercitarti a voce alta, anche dopo il colloquio reale</li>
        <li>Ripeti le simulazioni per le domande dove hai avuto punteggi più bassi</li>
        <li>Guarda contenuti italiani autentici (video, podcast) per mantenere l'orecchio allenato</li>
      </ul>
    </div>
    <div class="bottom-actions">
      <button class="btn-primary btn-block" data-goto="dashboard">Torna alla Home</button>
    </div>`;
}

/* ---------------------- Revisioni ---------------------- */

function renderRevisioni() {
  const s = AppState.get();
  const content = document.getElementById("revisioni-content");
  const vocabEntries = Object.entries(s.vocab);
  const today = Storage.todayISO();
  const dueToday = vocabEntries.filter(([, v]) => v.nextReview <= today && v.status !== "mastered");
  const mastered = vocabEntries.filter(([, v]) => v.status === "mastered");

  const mistakesHtml = s.mistakes.slice(-10).reverse().map((m) => `
    <li>🔴 <b>Giorno ${m.day}</b> — ${m.text}</li>`).join("") || `<li class="small-muted">Nessun errore registrato per ora — continua così!</li>`;

  content.innerHTML = `
    <div class="card">
      <h3>🔴 Da ripassare oggi (${dueToday.length})</h3>
      ${dueToday.length ? `<div>${dueToday.map(([w, v]) => `
        <div class="vocab-item">
          <div class="vocab-it">${w} <button class="icon-btn" style="padding:3px 8px;font-size:0.72rem;" onclick="Speech.speak('${escapeJs(w)}')">🔊</button></div>
          <div class="vocab-fr small-muted">Visto ${v.timesSeen} volte · corretto ${v.timesCorrect} volte</div>
        </div>`).join("")}</div>` : `<p class="small-muted">Niente da ripassare oggi. Ottimo lavoro!</p>`}
    </div>
    <div class="card">
      <h3>🟢 Vocabolario maîtrisé (${mastered.length})</h3>
      <p class="small-muted">${mastered.length ? mastered.map(([w]) => w).join(" · ") : "Ancora nessuna parola completamente padroneggiata — è normale a inizio percorso."}</p>
    </div>
    <div class="card">
      <h3>⚠️ Errori recenti</h3>
      <ul class="feedback-list">${mistakesHtml}</ul>
    </div>`;
}

/* ---------------------- Badges ---------------------- */

const BADGE_DEFS = [
  { id: "prima_sessione", icon: "🎬", name: "Prima sessione" },
  { id: "3_giorni", icon: "🔥", name: "3 giorni consecutivi" },
  { id: "100_parole", icon: "📚", name: "100 parole" },
  { id: "prima_simulazione", icon: "🎙️", name: "Prima simulazione" },
  { id: "colloquio_completato", icon: "🏆", name: "Colloquio completato" },
];

function renderBadges() {
  const s = AppState.get();
  const el = document.getElementById("badge-grid");
  el.innerHTML = BADGE_DEFS.map((b) => `
    <div class="badge-tile ${s.badges.includes(b.id) ? "earned" : ""}">
      <span class="badge-icon">${b.icon}</span>
      <span class="badge-name">${b.name}</span>
    </div>`).join("");
}

/* ---------------------- Boot ---------------------- */

function boot() {
  initOnboarding();
  const s = AppState.get();
  if (s.onboarded) {
    goto("dashboard");
  } else {
    showScreen("screen-onboarding");
    document.getElementById("tabbar").style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", boot);

/* Enregistrement du service worker (PWA) */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {
      /* silencieux si le SW échoue (ex: ouverture en file://) */
    });
  });
}
