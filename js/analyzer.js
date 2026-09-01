/* ============================================================
   ITALIAN B2 BOOST — analyzer.js
   Analyse par règles des réponses de l'utilisateur : pas d'API
   IA requise. Détecte mots-clés attendus, longueur, et une
   liste de pièges fréquents (B2 français -> italien).
   ============================================================ */

/* Pièges fréquents pour un francophone en italien, avec la
   correction et une explication courte. Détection par regex simple. */
const COMMON_PITFALLS = [
  {
    pattern: /\bio sono d'accordo con\b/i,
    level: "perfezionamento",
    message: "Plus naturel : « sono d'accordo con » (le pronom « io » est souvent superflu en italien).",
  },
  {
    pattern: /\bdopo que\b/i,
    level: "importante",
    message: "« Dopo que » n'existe pas en italien : dites « dopo che » + indicatif, ou « dopo » + infinitif passé.",
  },
  {
    pattern: /\bpiù bon\b|\bpiù buono\b/i,
    level: "importante",
    message: "Le comparatif de « buono » est irrégulier : on dit « migliore », pas « più buono ».",
  },
  {
    pattern: /\bse io fossi\b/i,
    level: "perfezionamento",
    message: "Correct, mais plus naturel sans « io » : « se fossi ».",
  },
  {
    pattern: /\bpensa che\b(?!.{0,20}(sia|abbia|possa|debba|venga|faccia))/i,
    level: "da_migliorare",
    message: "Après « penso che » à l'affirmative, le congiuntivo est attendu (ex : « penso che sia importante »).",
  },
  {
    pattern: /\bin italia per studiare\b/i,
    level: "perfezionamento",
    message: "Les deux ordres sont possibles ; « per studiare in Italia » est légèrement plus fluide à l'oral.",
  },
];

/* Vocabulaire "riche" B2+ qui, s'il apparaît, mérite un bonus de score */
const B2_MARKERS = [
  "tuttavia", "d'altronde", "inoltre", "perciò", "affinché", "nonostante",
  "quindi", "pertanto", "a mio avviso", "per quanto riguarda", "in effetti",
];

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function detectKeywords(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.filter((k) => lower.includes(k.toLowerCase()));
}

function detectPitfalls(text) {
  const found = [];
  for (const p of COMMON_PITFALLS) {
    if (p.pattern.test(text)) found.push(p);
  }
  return found;
}

function detectB2Markers(text) {
  const lower = text.toLowerCase();
  return B2_MARKERS.filter((m) => lower.includes(m));
}

/* Analyse principale d'une réponse orale/écrite.
   Retourne un objet avec scores (0-10) par critère + retours qualitatifs. */
function analyzeResponse(text, expectKeywords = []) {
  const wordCount = countWords(text);
  const matchedKeywords = detectKeywords(text, expectKeywords);
  const pitfalls = detectPitfalls(text);
  const markers = detectB2Markers(text);

  // Fluidité : basée sur la longueur et l'absence de répétitions grossières
  let fluidita = 5;
  if (wordCount >= 15) fluidita += 2;
  if (wordCount >= 30) fluidita += 1;
  if (/\b(\w+)\b(?:\s+\S+){0,2}\s+\1\b/i.test(text)) fluidita -= 1; // répétition proche
  fluidita = Math.max(2, Math.min(10, fluidita));

  // Vocabulaire : mots-clés attendus trouvés + marqueurs B2
  let vocabolario = expectKeywords.length
    ? Math.round((matchedKeywords.length / expectKeywords.length) * 7) + 2
    : 6;
  vocabolario += markers.length;
  vocabolario = Math.max(2, Math.min(10, vocabolario));

  // Grammatica : pénalise les pièges "importante", tolère "perfezionamento"
  let grammatica = 9;
  for (const p of pitfalls) {
    if (p.level === "importante") grammatica -= 3;
    else if (p.level === "da_migliorare") grammatica -= 1.5;
    else grammatica -= 0.5;
  }
  grammatica = Math.max(2, Math.min(10, Math.round(grammatica)));

  // Spontaneità : proxy simple basé sur la longueur ET la présence de connecteurs
  let spontaneita = wordCount >= 20 ? 7 : wordCount >= 10 ? 5 : 3;
  if (markers.length > 0) spontaneita += 1;
  spontaneita = Math.max(2, Math.min(10, spontaneita));

  const feedbackLines = [];
  const importantIssues = pitfalls.filter((p) => p.level === "importante");
  const improveIssues = pitfalls.filter((p) => p.level === "da_migliorare");
  const refineIssues = pitfalls.filter((p) => p.level === "perfezionamento");

  return {
    wordCount,
    matchedKeywords,
    missingKeywords: expectKeywords.filter((k) => !matchedKeywords.includes(k)),
    scores: { fluidita, vocabolario, grammatica, spontaneita },
    pitfalls: { importantIssues, improveIssues, refineIssues },
    markers,
  };
}

/* Construit un feedback texte lisible à partir d'une analyse,
   en respectant la hiérarchie : 🔴 importante, 🟠 à améliorer, 🟢 perfectionnement */
function renderFeedback(analysis) {
  const parts = [];
  if (analysis.pitfalls.importantIssues.length === 0
      && analysis.pitfalls.improveIssues.length === 0) {
    parts.push("🔴 Nessun errore importante rilevato — ottimo!");
  } else {
    for (const p of analysis.pitfalls.importantIssues) {
      parts.push(`🔴 ${p.message}`);
    }
    for (const p of analysis.pitfalls.improveIssues) {
      parts.push(`🟠 ${p.message}`);
    }
  }
  for (const p of analysis.pitfalls.refineIssues) {
    parts.push(`🟢 ${p.message}`);
  }
  if (analysis.missingKeywords.length > 0 && analysis.missingKeywords.length < 4) {
    parts.push(`💡 Prova a includere anche: ${analysis.missingKeywords.join(", ")}.`);
  }
  return parts;
}
