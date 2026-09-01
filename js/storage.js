/* ============================================================
   ITALIAN B2 BOOST — storage.js
   Toute la persistance locale (localStorage). Aucune donnée
   ne quitte le navigateur.
   ============================================================ */

const STORAGE_KEY = "italianB2Boost.state.v1";

const DEFAULT_STATE = {
  onboarded: false,
  profile: {
    goal: null,          // "revise" | "colloquio" | "fluidita" | "vocabolario"
    timeAvailable: 45,    // 30 | 45 | 60
    mode: "normale",      // "normale" | "intensiva"
    name: "",             // facultatif, saisi par l'utilisateur
    destinationCity: "",  // facultatif
    fieldOfStudy: "",     // facultatif
  },
  progress: {
    currentDay: 1,
    completedDays: [],       // [1,2,3...]
    dayScores: {},            // { "1": {orale, comprensione, vocabolario, grammatica, spontaneita} }
    xp: 0,
    streak: 0,
    lastActiveDate: null,     // ISO date string (yyyy-mm-dd)
    todayMinutes: 0,
    todayDateForMinutes: null,
  },
  skills: {
    orale: 50,
    comprensione: 50,
    vocabolario: 50,
    grammatica: 50,
    spontaneita: 50,
  },
  vocab: {
    // word -> { status: "new"|"review1"|"review3"|"mastered", nextReview: isoDate, timesSeen, timesCorrect }
  },
  mistakes: [
    // { id, category, text, day, date }
  ],
  badges: [],       // ["prima_sessione", "3_giorni", ...]
  interviewResults: [], // { day, date, scores:{...}, transcript:[...] }
  finalExam: null,
};

function deepMerge(base, incoming) {
  if (Array.isArray(base)) return incoming ?? base;
  if (typeof base === "object" && base !== null) {
    const out = { ...base };
    for (const k of Object.keys(base)) {
      out[k] = deepMerge(base[k], incoming ? incoming[k] : undefined);
    }
    return out;
  }
  return incoming !== undefined ? incoming : base;
}

const Storage = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
      const parsed = JSON.parse(raw);
      return deepMerge(DEFAULT_STATE, parsed);
    } catch (e) {
      console.error("Storage load error", e);
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  },

  save(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      console.error("Storage save error", e);
      return false;
    }
  },

  reset() {
    localStorage.removeItem(STORAGE_KEY);
  },

  todayISO() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  },
};

/* Petit gestionnaire d'état global, avec autosauvegarde */
const AppState = {
  state: Storage.load(),

  get() {
    return this.state;
  },

  set(mutatorFn) {
    mutatorFn(this.state);
    Storage.save(this.state);
    document.dispatchEvent(new CustomEvent("state:changed", { detail: this.state }));
  },

  addXP(amount) {
    this.set((s) => {
      s.progress.xp += amount;
    });
  },

  addMinutesToday(minutes) {
    this.set((s) => {
      const today = Storage.todayISO();
      if (s.progress.todayDateForMinutes !== today) {
        s.progress.todayDateForMinutes = today;
        s.progress.todayMinutes = 0;
      }
      s.progress.todayMinutes += minutes;
    });
  },

  touchStreak() {
    this.set((s) => {
      const today = Storage.todayISO();
      if (s.progress.lastActiveDate === today) return; // déjà compté aujourd'hui
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (s.progress.lastActiveDate === yesterday) {
        s.progress.streak += 1;
      } else {
        s.progress.streak = 1;
      }
      s.progress.lastActiveDate = today;
    });
  },

  updateSkill(skillKey, delta) {
    this.set((s) => {
      const cur = s.skills[skillKey] ?? 50;
      s.skills[skillKey] = Math.max(0, Math.min(100, Math.round(cur + delta)));
    });
  },

  recordMistake(category, text, day) {
    this.set((s) => {
      s.mistakes.push({
        id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        category, // "grammatica" | "vocabolario" | "struttura"
        text,
        day,
        date: Storage.todayISO(),
      });
    });
  },

  addVocab(word, correct) {
    this.set((s) => {
      const entry = s.vocab[word] || { status: "new", timesSeen: 0, timesCorrect: 0, nextReview: Storage.todayISO() };
      entry.timesSeen += 1;
      if (correct) entry.timesCorrect += 1;
      // progression simple de répétition espacée
      if (correct) {
        if (entry.status === "new") entry.status = "review3";
        else if (entry.status === "review3") entry.status = "mastered";
      } else {
        entry.status = "review1";
      }
      const days = entry.status === "review1" ? 1 : entry.status === "review3" ? 3 : 7;
      const next = new Date(Date.now() + days * 86400000);
      entry.nextReview = next.toISOString().slice(0, 10);
      s.vocab[word] = entry;
    });
  },

  completeDay(dayNumber, scores) {
    this.set((s) => {
      if (!s.progress.completedDays.includes(dayNumber)) {
        s.progress.completedDays.push(dayNumber);
      }
      s.progress.dayScores[String(dayNumber)] = scores;
      if (s.progress.currentDay === dayNumber && dayNumber < 14) {
        s.progress.currentDay = dayNumber + 1;
      }
    });
    this.touchStreak();
    this.maybeAwardBadges();
  },

  awardBadge(id) {
    this.set((s) => {
      if (!s.badges.includes(id)) s.badges.push(id);
    });
  },

  maybeAwardBadges() {
    const s = this.state;
    if (s.progress.completedDays.length >= 1) this.awardBadge("prima_sessione");
    if (s.progress.streak >= 3) this.awardBadge("3_giorni");
    if (Object.keys(s.vocab).length >= 100) this.awardBadge("100_parole");
    if (s.interviewResults.length >= 1) this.awardBadge("prima_simulazione");
    if (s.progress.completedDays.includes(14)) this.awardBadge("colloquio_completato");
  },
};
