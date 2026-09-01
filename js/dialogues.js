/* ============================================================
   ITALIAN B2 BOOST — dialogues.js
   Arbres de dialogue à embranchements (mission "Dialogo") +
   banque de questions du simulateur d'entretien consolare.

   Un dialogue est un arbre : chaque nœud a un texte (posé par
   l'agent), une liste de mots-clés attendus dans la réponse
   (pour la détection légère, sans IA), et des branches vers
   les nœuds suivants selon ce que contient la réponse.
   ============================================================ */

const DIALOGUE_TREES = {
  1: {
    start: "presentazione",
    nodes: {
      presentazione: {
        agent: "Buongiorno. Può presentarsi brevemente?",
        expectKeywords: ["mi chiamo", "sono", "vengo da", "studio"],
        next: "percorso",
      },
      percorso: {
        agent: "Molto bene. Mi parli un po' del suo percorso di studi.",
        expectKeywords: ["studio", "laurea", "università", "anni"],
        next: "motivazione",
      },
      motivazione: {
        agent: "E cosa la motiva a proseguire gli studi in questo modo?",
        expectKeywords: ["perché", "voglio", "obiettivo", "passione"],
        next: null, // fin de l'arbre pour le jour 1
      },
    },
  },

  4: {
    start: "settore",
    nodes: {
      settore: {
        agent: "Mi dica: cosa studia esattamente in questo momento?",
        expectKeywords: ["informatica", "studio", "corso", "laurea"],
        branches: [
          { ifKeywords: ["informatica", "cybersicurezza", "sicurezza"], next: "perche_informatica" },
        ],
        next: "perche_informatica",
      },
      perche_informatica: {
        agent: "Interessante. Perché ha scelto proprio questo settore?",
        expectKeywords: ["perché", "passione", "interesse", "sempre"],
        next: "competenze",
      },
      competenze: {
        agent: "Quali competenze pensa di aver già acquisito finora?",
        expectKeywords: ["competenze", "so", "ho imparato", "capace"],
        next: null,
      },
    },
  },

  6: {
    start: "perche_italia",
    nodes: {
      perche_italia: {
        agent: "Perché ha scelto l'Italia invece di un altro paese?",
        expectKeywords: ["italia", "perché", "sistema", "università"],
        next: "conoscenza_italia",
      },
      conoscenza_italia: {
        agent: "Cosa sa della cultura o della storia italiana?",
        expectKeywords: ["cultura", "storia", "so", "conosco"],
        next: "citta",
      },
      citta: {
        agent: "Ha già un'idea di quale città italiana la attira di più?",
        expectKeywords: ["città", "torino", "milano", "roma", "bologna", "penso"],
        next: null,
      },
    },
  },

  10: {
    start: "presentazione_formale",
    nodes: {
      presentazione_formale: {
        agent: "Buongiorno, si accomodi pure. Può presentarsi in modo formale, per favore?",
        expectKeywords: ["mi chiamo", "sono", "vengo da"],
        next: "motivo_visita",
      },
      motivo_visita: {
        agent: "Qual è il motivo della sua richiesta di visto?",
        expectKeywords: ["studiare", "studi", "università", "italia"],
        next: "perche_visto",
      },
      perche_visto: {
        agent: "Perché dovremmo concederle questo visto, secondo lei?",
        expectKeywords: ["progetto", "serio", "preparato", "motivato"],
        next: null,
      },
    },
  },
};

/* ---------------------------------------------------------
   Banque de questions pour le SIMULATEUR D'ENTRETIEN
   (mode libre, utilisé aux jours 10 à 14). Organisée par
   catégorie pour permettre un tirage varié et réaliste.
   --------------------------------------------------------- */

const INTERVIEW_BANK = {
  identita: [
    "Si presenti, per favore.",
    "Mi parli un po' di lei.",
    "Da dove viene esattamente?",
    "Dove vive attualmente?",
    "Mi parli della sua famiglia.",
  ],
  studi: [
    "Qual è il suo percorso di studi?",
    "Cosa ha studiato finora?",
    "Perché ha scelto questo settore di studi?",
    "Perché vuole continuare i suoi studi?",
    "Quali sono state le sue materie preferite?",
  ],
  italia: [
    "Perché vuole studiare in Italia?",
    "Perché ha scelto questa università?",
    "Perché ha scelto questa città?",
    "Qual è il suo programma di studi in Italia?",
    "Cosa sa del corso che vuole frequentare?",
    "Perché non ha scelto un altro paese?",
  ],
  professionale: [
    "Quali sono i suoi obiettivi professionali?",
    "Cosa vuole fare dopo gli studi?",
    "Come pensa di utilizzare questa formazione?",
    "Ha già un'idea del settore in cui vuole lavorare?",
  ],
  finanziamento: [
    "Chi finanzierà i suoi studi?",
    "Come saranno finanziati i suoi studi?",
    "Chi è il suo garante?",
    "Cosa sa della situazione finanziaria del suo garante?",
    "Ha previsto una borsa di studio o altre risorse?",
  ],
  soggiorno: [
    "Dove alloggerà una volta in Italia?",
    "Conosce già la città in cui andrà?",
    "Come pensa di organizzare la sua vita in Italia?",
    "Conosce qualcuno che vive già in Italia?",
  ],
  imprevisti: [
    "Cosa farebbe se non ottenesse il visto questa volta?",
    "Cosa farebbe se il suo progetto in Italia non andasse come previsto?",
    "Ha un piano alternativo?",
    "Qual è, secondo lei, il suo punto debole in questo progetto?",
    "Perché dovremmo credere che lei tornerà nel suo paese dopo gli studi?",
  ],
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* Construit une séquence de simulation d'entretien de longueur donnée,
   en piochant dans toutes les catégories pour varier les thèmes. */
function buildInterviewSequence(length = 8) {
  const categories = Object.keys(INTERVIEW_BANK);
  const sequence = [];
  const usedPerCategory = {};
  for (let i = 0; i < length; i++) {
    const cat = categories[i % categories.length];
    const pool = INTERVIEW_BANK[cat].filter(
      (q) => !(usedPerCategory[cat] || []).includes(q)
    );
    const question = pool.length ? pickRandom(pool) : pickRandom(INTERVIEW_BANK[cat]);
    usedPerCategory[cat] = [...(usedPerCategory[cat] || []), question];
    sequence.push({ category: cat, question });
  }
  return sequence;
}
