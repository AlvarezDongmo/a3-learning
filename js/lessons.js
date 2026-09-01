/* ============================================================
   ITALIAN B2 BOOST — lessons.js
   Métadonnées des 14 jours. Le contenu détaillé de chaque
   mission vit dans exercises.js / dialogues.js pour rester lisible.
   ============================================================ */

const LESSONS = [
  { day: 1,  title: "Presentarsi",                    theme: "Réactivation générale",       icon: "🇮🇹" },
  { day: 2,  title: "La vita quotidiana",              theme: "Réactivation générale",       icon: "☀️" },
  { day: 3,  title: "La famiglia e il percorso",        theme: "Réactivation générale",       icon: "👨‍👩‍👧" },
  { day: 4,  title: "Gli studi",                        theme: "Études et projet",            icon: "🎓" },
  { day: 5,  title: "Il progetto professionale",        theme: "Études et projet",            icon: "💼" },
  { day: 6,  title: "Perché l'Italia?",                 theme: "Études et projet",            icon: "🗺️" },
  { day: 7,  title: "L'università e la città",          theme: "Italie et projet concret",    icon: "🏛️" },
  { day: 8,  title: "Il finanziamento",                 theme: "Italie et projet concret",    icon: "💶" },
  { day: 9,  title: "Il soggiorno in Italia",            theme: "Italie et projet concret",    icon: "🏠" },
  { day: 10, title: "Colloquio consolare — le basi",     theme: "Entretien intensif",          icon: "🎙️" },
  { day: 11, title: "Domande impreviste",                theme: "Entretien intensif",          icon: "❓" },
  { day: 12, title: "Simulazione 1",                     theme: "Simulation complète",          icon: "🎭" },
  { day: 13, title: "Simulazione 2",                     theme: "Simulation complète",          icon: "🎭" },
  { day: 14, title: "ESAME FINALE",                      theme: "Examen final",                icon: "🏆" },
];

function getLessonMeta(day) {
  return LESSONS.find((l) => l.day === day);
}

function isDayUnlocked(day, state) {
  if (day === 1) return true;
  return state.progress.completedDays.includes(day - 1) || state.progress.completedDays.includes(day);
}

function isDayCompleted(day, state) {
  return state.progress.completedDays.includes(day);
}
