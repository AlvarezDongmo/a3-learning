/* ============================================================
   ITALIAN B2 BOOST — speech.js
   Reconnaissance vocale (STT) et synthèse (TTS) natives du
   navigateur. Fallback texte si non disponible.
   ============================================================ */

const Speech = {
  recognitionSupported: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
  synthesisSupported: "speechSynthesis" in window,
  _recognition: null,
  _italianVoice: null,

  init() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      this._recognition = new SR();
      this._recognition.lang = "it-IT";
      this._recognition.interimResults = true;
      this._recognition.maxAlternatives = 1;
    }
    if (this.synthesisSupported) {
      const setVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        this._italianVoice = voices.find((v) => v.lang && v.lang.startsWith("it")) || null;
      };
      setVoice();
      window.speechSynthesis.onvoiceschanged = setVoice;
    }
  },

  /* Démarre l'écoute. callbacks: onInterim(text), onFinal(text), onError(err) */
  startListening({ onInterim, onFinal, onError, onEnd }) {
    if (!this._recognition) {
      onError && onError(new Error("recognition-unsupported"));
      return false;
    }
    let finalTranscript = "";
    this._recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }
      if (interim) onInterim && onInterim(interim);
      if (finalTranscript) onFinal && onFinal(finalTranscript.trim());
    };
    this._recognition.onerror = (e) => onError && onError(e);
    this._recognition.onend = () => onEnd && onEnd();
    try {
      this._recognition.start();
      return true;
    } catch (e) {
      onError && onError(e);
      return false;
    }
  },

  stopListening() {
    if (this._recognition) {
      try { this._recognition.stop(); } catch (e) { /* noop */ }
    }
  },

  /* Lit un texte italien à voix haute. rate: 1 = normal, 0.6 = lent */
  speak(text, rate = 1) {
    if (!this.synthesisSupported) return false;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "it-IT";
    utter.rate = rate;
    if (this._italianVoice) utter.voice = this._italianVoice;
    window.speechSynthesis.speak(utter);
    return true;
  },
};

document.addEventListener("DOMContentLoaded", () => Speech.init());
