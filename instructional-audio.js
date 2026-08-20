"use strict";

(function initializeFirstVoloInstructionalAudio() {

  function available() {
    return (
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      typeof window.SpeechSynthesisUtterance ===
        "function"
    );
  }


  function prepareSpeechText(value) {
    return String(value || "")
      .replace(
        /_{2,}/g,
        " blank "
      )
      .replace(
        /\s*(?:->|→)\s*/g,
        " changes to "
      )
      .replace(
        /\b([A-Za-z]+)-(?=\W|$)/g,
        "$1"
      )
      .replace(
        /-([A-Za-z]+)\b/g,
        "$1"
      )
      .replace(
        /\s*\/\s*/g,
        " or "
      )
      .replace(
        /\s*\+\s*/g,
        " plus "
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim();
  }


  function rateForGradeBand(
    gradeBand
  ) {
    if (
      gradeBand === "2-3"
    ) {
      return 0.82;
    }

    if (
      gradeBand === "4-5"
    ) {
      return 0.88;
    }

    return 0.92;
  }


  function rateForText(
    text,
    gradeBand
  ) {
    const words =
      String(text || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    /*
      Isolated morphemes and short answer choices
      sound distorted when spoken at the slower
      Flight A sentence-reading rate.

      Keep longer directions/sentences slower,
      but pronounce short labels more naturally.
    */
    if (words.length <= 2) {
      return 0.98;
    }

    if (words.length <= 4) {
      return 0.92;
    }

    return rateForGradeBand(
      gradeBand
    );
  }


  function chooseVoice() {
    if (!available()) {
      return null;
    }

    const voices =
      window.speechSynthesis
        .getVoices();

    /*
      Prefer natural macOS English voices instead
      of simply taking the first en-US voice.
      Safari may return novelty or low-quality
      voices first.
    */
    const preferredNames = [
      "Samantha",
      "Ava",
      "Allison",
      "Susan",
      "Tom",
      "Daniel"
    ];

    for (const name of preferredNames) {
      const match =
        voices.find(
          voice =>
            voice.name === name &&
            String(
              voice.lang || ""
            ).startsWith("en")
        );

      if (match) {
        return match;
      }
    }

    return (
      voices.find(
        voice =>
          voice.lang === "en-US" &&
          !/whisper|zarvox|boing|bubbles|bells|bad news|good news|cellos|pipe organ|trinoids/i.test(
            voice.name || ""
          )
      ) ||
      voices.find(
        voice =>
          String(
            voice.lang || ""
          ).startsWith("en") &&
          !/whisper|zarvox|boing|bubbles|bells|bad news|good news|cellos|pipe organ|trinoids/i.test(
            voice.name || ""
          )
      ) ||
      null
    );
  }

  function speak(
    text,
    {
      gradeBand = null,
      rate = null
    } = {}
  ) {
    if (!available()) {
      return false;
    }

    const prepared =
      prepareSpeechText(
        text
      );

    if (!prepared) {
      return false;
    }

    window.speechSynthesis
      .cancel();

    const utterance =
      new window
        .SpeechSynthesisUtterance(
          prepared
        );

    utterance.lang =
      "en-US";

    utterance.rate =
      rate ||
      rateForText(
        prepared,
        gradeBand
      );

    const voice =
      chooseVoice();

    if (voice) {
      utterance.voice =
        voice;
    }

    window.speechSynthesis
      .speak(
        utterance
      );

    return true;
  }


  function stop() {
    if (available()) {
      window.speechSynthesis
        .cancel();
    }
  }


  window.FirstVoloInstructionalAudio = {
    available,
    prepareSpeechText,
    rateForGradeBand,
    speak,
    stop
  };

})();
