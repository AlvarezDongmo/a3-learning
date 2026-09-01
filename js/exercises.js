/* ============================================================
   ITALIAN B2 BOOST — exercises.js
   Contenu pédagogique détaillé pour chaque jour : riscaldamento,
   vocabolario, comprensione, quiz. Les dialogues et simulations
   vivent dans dialogues.js.
   ============================================================ */

const EXERCISES = {

  // ---------------------------------------------------------
  1: {
    warmup: [
      "Come stai oggi? Raccontami brevemente com'è andata la tua giornata.",
      "Come ti chiami e cosa fai nella vita?",
      "Di dove sei esattamente? Descrivi la tua città in due frasi.",
      "Cosa hai fatto questo weekend?",
    ],
    vocab: [
      { it: "presentarsi", fr: "se présenter", example: "È importante sapersi presentare bene durante un colloquio." },
      { it: "il percorso", fr: "le parcours", example: "Il mio percorso di studi è stato piuttosto lineare." },
      { it: "svolgere (un'attività)", fr: "exercer / mener (une activité)", example: "Attualmente svolgo i miei studi in informatica." },
      { it: "attualmente", fr: "actuellement", example: "Attualmente vivo a Yaoundé." },
      { it: "originario/a di", fr: "originaire de", example: "Sono originario del Camerun." },
      { it: "un traguardo", fr: "un objectif atteint / une étape franchie", example: "Ottenere il B2 è stato un traguardo importante." },
      { it: "la formazione", fr: "la formation", example: "Ho seguito una formazione in ingegneria informatica." },
    ],
    comprehension: {
      audioText: "Buongiorno, mi chiamo Marco. Sono nato a Torino ma vivo a Milano da cinque anni per motivi di studio. Ho appena terminato una laurea in economia e ora vorrei specializzarmi all'estero.",
      questions: [
        { q: "Dove è nato Marco?", options: ["Milano", "Torino", "Roma"], correct: 1 },
        { q: "Da quanto tempo vive a Milano?", options: ["Due anni", "Cinque anni", "Dieci anni"], correct: 1 },
        { q: "Cosa vuole fare adesso?", options: ["Cambiare lavoro", "Specializzarsi all'estero", "Tornare a Torino"], correct: 1 },
      ],
    },
    speakingChallenge: "Parlami di te: chi sei, cosa fai, e da dove vieni. Parla per almeno 1 minuto, senza fermarti troppo a pensare.",
    quiz: [
      { q: "Comment dit-on « je suis originaire de » ?", options: ["sono di", "sono originario/a di", "vengo da"], correct: 1 },
      { q: "« Attualmente » signifie :", options: ["Actuellement", "Généralement", "Rarement"], correct: 0 },
    ],
  },

  // ---------------------------------------------------------
  2: {
    warmup: [
      "A che ora ti svegli di solito e cosa fai appena sveglio/a?",
      "Descrivi una tua giornata tipo, dal mattino alla sera.",
      "Cosa fai di solito nel tempo libero?",
      "Qual è la tua parte preferita della giornata? Perché?",
    ],
    vocab: [
      { it: "la routine quotidiana", fr: "la routine quotidienne", example: "La mia routine quotidiana comincia sempre con un caffè." },
      { it: "svegliarsi", fr: "se réveiller", example: "Mi sveglio verso le sette ogni mattina." },
      { it: "abituarsi a", fr: "s'habituer à", example: "Mi sono abituato a lavorare la sera." },
      { it: "gestire il tempo", fr: "gérer son temps", example: "Devo imparare a gestire meglio il mio tempo." },
      { it: "quotidianamente", fr: "quotidiennement", example: "Studio l'italiano quotidianamente, anche solo dieci minuti." },
      { it: "rilassarsi", fr: "se détendre", example: "La sera mi piace rilassarmi guardando un film." },
      { it: "impegnato/a", fr: "occupé(e)", example: "Questa settimana sono molto impegnato con gli esami." },
    ],
    comprehension: {
      audioText: "Di solito mi sveglio presto, verso le sei e mezza, perché preferisco studiare al mattino quando ho la mente più lucida. Faccio colazione velocemente e poi mi metto al computer fino a mezzogiorno. Nel pomeriggio ho spesso lezioni o riunioni, e la sera cerco di rilassarmi un po' prima di dormire.",
      questions: [
        { q: "A che ora si sveglia la persona?", options: ["Alle sei e mezza", "Alle otto", "Alle dieci"], correct: 0 },
        { q: "Perché preferisce studiare al mattino?", options: ["Ha più tempo", "Ha la mente più lucida", "Non ha lezioni"], correct: 1 },
        { q: "Cosa fa la sera?", options: ["Studia ancora", "Cerca di rilassarsi", "Esce con gli amici"], correct: 1 },
      ],
    },
    speakingChallenge: "Descrivi la tua giornata tipo, dal momento in cui ti svegli fino a quando vai a dormire. Usa connettori come 'prima', 'poi', 'infine'.",
    quiz: [
      { q: "« Abituarsi a » se traduit par :", options: ["S'habituer à", "S'ennuyer de", "Se souvenir de"], correct: 0 },
      { q: "Complète : « Studio l'italiano ___ » (quotidiennement)", options: ["quotidianamente", "quotidianoso", "quotidiante"], correct: 0 },
    ],
  },

  // ---------------------------------------------------------
  3: {
    warmup: [
      "Parlami della tua famiglia: quante persone siete?",
      "C'è qualcuno nella tua famiglia che ti ha ispirato particolarmente? Perché?",
      "Come descriveresti il tuo carattere in tre parole?",
      "Qual è stato un momento importante del tuo percorso personale?",
    ],
    vocab: [
      { it: "il/la maggiore", fr: "l'aîné(e)", example: "Sono il maggiore di tre fratelli." },
      { it: "sostenere (qualcuno)", fr: "soutenir (quelqu'un)", example: "I miei genitori mi hanno sempre sostenuto negli studi." },
      { it: "il sostegno", fr: "le soutien", example: "Ho bisogno del sostegno della mia famiglia per questo progetto." },
      { it: "crescere", fr: "grandir", example: "Sono cresciuto in una famiglia numerosa." },
      { it: "un legame", fr: "un lien", example: "Ho un legame molto forte con mio fratello." },
      { it: "affrontare (una sfida)", fr: "affronter (un défi)", example: "Ho dovuto affrontare molte sfide durante gli studi." },
      { it: "determinato/a", fr: "déterminé(e)", example: "Sono una persona determinata e curiosa." },
    ],
    comprehension: {
      audioText: "Vengo da una famiglia di quattro persone: i miei genitori, mia sorella maggiore e io. Mio padre lavora nel settore agricolo, mentre mia madre è insegnante. Sono cresciuto in un ambiente dove lo studio era molto valorizzato, e questo mi ha spinto a impegnarmi molto a scuola.",
      questions: [
        { q: "Quante persone ci sono in famiglia?", options: ["Tre", "Quattro", "Cinque"], correct: 1 },
        { q: "Cosa fa la madre?", options: ["Insegnante", "Agricoltrice", "Medico"], correct: 0 },
        { q: "Cosa era valorizzato in famiglia?", options: ["Lo sport", "Il lavoro manuale", "Lo studio"], correct: 2 },
      ],
    },
    speakingChallenge: "Parlami della tua famiglia e di come ti ha sostenuto nel tuo percorso di studi. Parla per 1-2 minuti.",
    quiz: [
      { q: "« Sostenere qualcuno » veut dire :", options: ["Critiquer quelqu'un", "Soutenir quelqu'un", "Éviter quelqu'un"], correct: 1 },
      { q: "« Sono cresciuto in... » = ", options: ["J'ai grandi dans...", "Je grandis dans...", "J'avais grandi dans..."], correct: 0 },
    ],
  },

  // ---------------------------------------------------------
  4: {
    warmup: [
      "Qual è il tuo percorso di studi fino ad oggi?",
      "Cosa stai studiando attualmente, esattamente?",
      "Qual è stata la materia che ti è piaciuta di più? Perché?",
      "C'è stato un momento in cui hai dubitato della tua scelta di studi?",
    ],
    vocab: [
      { it: "conseguire (un diploma)", fr: "obtenir (un diplôme)", example: "Ho conseguito la laurea in informatica lo scorso anno." },
      { it: "la materia", fr: "la matière (scolaire)", example: "La mia materia preferita è la sicurezza informatica." },
      { it: "approfondire", fr: "approfondir", example: "Vorrei approfondire le mie conoscenze in cybersicurezza." },
      { it: "un ambito", fr: "un domaine", example: "Lavoro nell'ambito dello sviluppo web." },
      { it: "la specializzazione", fr: "la spécialisation", example: "La mia specializzazione riguarda le tecnologie per lo sviluppo." },
      { it: "acquisire competenze", fr: "acquérir des compétences", example: "Ho acquisito competenze pratiche grazie ai progetti universitari." },
      { it: "un tirocinio", fr: "un stage", example: "Ho svolto un tirocinio in un'azienda di sviluppo software." },
    ],
    comprehension: {
      audioText: "Ho iniziato i miei studi in informatica tre anni fa, dopo aver conseguito il diploma di scuola superiore. All'inizio ero interessato soprattutto allo sviluppo web, ma con il tempo ho scoperto una vera passione per la cybersicurezza. Oggi vorrei approfondire questo ambito con una formazione più specialistica.",
      questions: [
        { q: "Quando ha iniziato gli studi in informatica?", options: ["Un anno fa", "Tre anni fa", "Cinque anni fa"], correct: 1 },
        { q: "Cosa lo interessava all'inizio?", options: ["La cybersicurezza", "Lo sviluppo web", "Il marketing"], correct: 1 },
        { q: "Cosa vuole fare ora?", options: ["Cambiare settore", "Approfondire la cybersicurezza", "Smettere di studiare"], correct: 1 },
      ],
    },
    speakingChallenge: "Parlami del tuo percorso di studi e spiegami perché hai scelto questo settore. Parla per 1-2 minuti, in modo naturale.",
    quiz: [
      { q: "« Conseguire un diploma » = ", options: ["Rater un diplôme", "Obtenir un diplôme", "Refuser un diplôme"], correct: 1 },
      { q: "« Un ambito » se traduit par :", options: ["Un domaine", "Une ambition", "Un doute"], correct: 0 },
    ],
  },

  // ---------------------------------------------------------
  5: {
    warmup: [
      "Cosa vuoi fare esattamente dopo gli studi?",
      "Come immagini la tua vita professionale tra cinque anni?",
      "Quali competenze pensi di dover ancora sviluppare?",
      "C'è un lavoro o un settore che ti fa particolarmente sognare?",
    ],
    vocab: [
      { it: "l'obiettivo professionale", fr: "l'objectif professionnel", example: "Il mio obiettivo professionale è lavorare nella sicurezza informatica." },
      { it: "mettere in pratica", fr: "mettre en pratique", example: "Voglio mettere in pratica quello che imparerò in Italia." },
      { it: "uno sbocco professionale", fr: "un débouché professionnel", example: "Questo master offre ottimi sbocchi professionali." },
      { it: "una carriera", fr: "une carrière", example: "Voglio costruire una carriera solida nel settore tech." },
      { it: "contribuire a", fr: "contribuer à", example: "Vorrei contribuire allo sviluppo digitale del mio paese." },
      { it: "far fruttare (una formazione)", fr: "faire fructifier (une formation)", example: "Voglio far fruttare questa formazione tornando a lavorare qui." },
      { it: "un progetto imprenditoriale", fr: "un projet entrepreneurial", example: "A lungo termine ho anche un progetto imprenditoriale in mente." },
    ],
    comprehension: {
      audioText: "Dopo la mia formazione in Italia, il mio obiettivo è tornare nel mio paese e contribuire allo sviluppo del settore digitale, in particolare nella cybersicurezza. A lungo termine, vorrei anche lanciare un piccolo progetto imprenditoriale legato alla sicurezza informatica per le piccole imprese.",
      questions: [
        { q: "Cosa vuole fare dopo la formazione?", options: ["Restare in Italia", "Tornare nel suo paese", "Andare in un altro paese"], correct: 1 },
        { q: "In quale settore vuole contribuire?", options: ["Il turismo", "Il digitale", "L'agricoltura"], correct: 1 },
        { q: "Cosa vuole fare a lungo termine?", options: ["Un progetto imprenditoriale", "Un dottorato", "Cambiare settore"], correct: 0 },
      ],
    },
    speakingChallenge: "Quali sono i tuoi obiettivi professionali e come pensi di utilizzare la formazione che riceverai in Italia? Parla per 1-2 minuti.",
    quiz: [
      { q: "« Contribuire a » signifie :", options: ["Contribuer à", "Contredire", "Continuer à"], correct: 0 },
      { q: "« Uno sbocco professionale » = ", options: ["Un obstacle professionnel", "Un débouché professionnel", "Un échec professionnel"], correct: 1 },
    ],
  },

  // ---------------------------------------------------------
  6: {
    warmup: [
      "Perché hai scelto l'Italia e non un altro paese?",
      "Cosa sai della cultura italiana?",
      "Conosci alcune città italiane? Quali ti attirano di più?",
      "Hai già viaggiato in Italia o hai contatti con persone italiane?",
    ],
    vocab: [
      { it: "attirare (qualcuno)", fr: "attirer (quelqu'un)", example: "L'eccellenza accademica italiana mi ha sempre attirato." },
      { it: "il sistema universitario", fr: "le système universitaire", example: "Il sistema universitario italiano è molto rinomato in ingegneria." },
      { it: "il patrimonio culturale", fr: "le patrimoine culturel", example: "L'Italia ha un patrimonio culturale straordinario." },
      { it: "convincere", fr: "convaincre", example: "Diversi fattori mi hanno convinto a scegliere l'Italia." },
      { it: "informarsi su", fr: "se renseigner sur", example: "Mi sono informato a lungo sulle università italiane." },
      { it: "un'eccellenza", fr: "une excellence", example: "Il Politecnico di Torino è un'eccellenza nel settore tecnologico." },
      { it: "d'altronde", fr: "d'ailleurs", example: "D'altronde, l'Italia offre anche una qualità di vita notevole." },
    ],
    comprehension: {
      audioText: "Ho scelto l'Italia per diverse ragioni. Prima di tutto, il sistema universitario italiano è molto rispettato nel mio settore, l'informatica. Poi, mi sono sempre interessato alla cultura italiana, alla lingua e alla storia del paese. Infine, ho già alcuni contatti che vivono lì, il che mi rassicura per l'integrazione.",
      questions: [
        { q: "Qual è la prima ragione citata?", options: ["Il clima", "Il sistema universitario", "Il costo della vita"], correct: 1 },
        { q: "Cosa lo interessa oltre agli studi?", options: ["Lo sport italiano", "La cultura e la lingua", "La cucina"], correct: 1 },
        { q: "Cosa lo rassicura per l'integrazione?", options: ["La lingua", "Avere già dei contatti", "Il clima"], correct: 1 },
      ],
    },
    speakingChallenge: "Perché hai scelto proprio l'Italia per continuare i tuoi studi? Dammi almeno tre ragioni concrete, parlando per 1-2 minuti.",
    quiz: [
      { q: "« Il patrimonio culturale » = ", options: ["Le patrimoine culturel", "Le pouvoir culturel", "Le partenaire culturel"], correct: 0 },
      { q: "« Informarsi su » veut dire :", options: ["S'informer sur", "S'inspirer de", "S'inscrire à"], correct: 0 },
    ],
  },

  // ---------------------------------------------------------
  7: {
    warmup: [
      "Qual è l'università che hai scelto? Perché proprio questa?",
      "Conosci già la città in cui andrai a vivere?",
      "Cosa sai del corso di laurea che vuoi frequentare?",
      "Hai già cercato informazioni sulla vita da studente in quella città?",
    ],
    vocab: [
      { it: "iscriversi a", fr: "s'inscrire à", example: "Vorrei iscrivermi a un master in cybersicurezza." },
      { it: "il corso di laurea", fr: "le cursus / la filière", example: "Il corso di laurea dura due anni." },
      { it: "il piano di studi", fr: "le plan d'études", example: "Ho già consultato il piano di studi online." },
      { it: "un ateneo", fr: "une université (terme soutenu)", example: "È un ateneo molto conosciuto nel settore tecnico." },
      { it: "la sede", fr: "le site / le campus", example: "La sede principale si trova nel centro città." },
      { it: "documentarsi", fr: "se documenter", example: "Mi sono documentato molto su questa città prima di scegliere." },
      { it: "il costo della vita", fr: "le coût de la vie", example: "Il costo della vita in questa città è ragionevole." },
    ],
    comprehension: {
      audioText: "Ho scelto il Politecnico di Torino perché offre un master specifico in sicurezza informatica, con laboratori molto moderni. Mi sono documentato sulla città: Torino è una città universitaria, con molti studenti internazionali, e il costo della vita è più accessibile rispetto a Milano.",
      questions: [
        { q: "Quale università ha scelto?", options: ["Il Politecnico di Torino", "L'Università di Milano", "La Bocconi"], correct: 0 },
        { q: "Cosa offre in particolare?", options: ["Un master in marketing", "Un master in sicurezza informatica", "Un master in economia"], correct: 1 },
        { q: "Come descrive il costo della vita a Torino?", options: ["Molto alto", "Più accessibile che a Milano", "Uguale a Milano"], correct: 1 },
      ],
    },
    speakingChallenge: "Presenta l'università e la città che hai scelto per i tuoi studi in Italia, e spiega perché ti sembrano adatte al tuo progetto.",
    quiz: [
      { q: "« Il piano di studi » = ", options: ["Le plan d'études", "Le plan de la ville", "Le plan de financement"], correct: 0 },
      { q: "« Documentarsi su » veut dire :", options: ["Se documenter sur", "Se déplacer vers", "Se décider pour"], correct: 0 },
    ],
  },
};
