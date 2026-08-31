"use strict";

(function initializeFirstVoloInstructionalAudio() {
  let playbackGeneration = 0;

  function available() {
    return (
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      typeof window.SpeechSynthesisUtterance ===
        "function"
    );
  }


  function prepareSpeechText(value) {
    const pronunciation =
      window.FirstVoloMorphemePronunciation;

    return (pronunciation?.replaceMorphemeLabels?.(value) || String(value || ""))
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
      .replace(
        /\s+([?.!,])/g,
        "$1"
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
    playbackGeneration += 1;
    if (available()) {
      window.speechSynthesis
        .cancel();
    }
    window.FirstVoloMorphemePronunciation?.stopControlledClips?.();
  }

  function speakSegments(segments = []) {
    const pronunciation = window.FirstVoloMorphemePronunciation;
    const speakText = (value) => new Promise((resolve, reject) => {
      if (!available()) { resolve(false); return; }
      const prepared = prepareSpeechText(value);
      if (!prepared) { resolve(true); return; }
      if (/^[\W_]+$/.test(prepared)) { resolve(true); return; }
      window.speechSynthesis.cancel();
      const utterance = new window.SpeechSynthesisUtterance(prepared);
      utterance.lang = "en-US";
      utterance.rate = rateForText(prepared, null);
      const voice = chooseVoice();
      if (voice) utterance.voice = voice;
      utterance.addEventListener("end", () => resolve(true), { once: true });
      utterance.addEventListener("error", (event) => reject(event.error || new Error("Speech playback failed")), { once: true });
      window.speechSynthesis.speak(utterance);
    });
    const generation = playbackGeneration;
    return segments.reduce((promise, segment) => promise.then(() => {
      if (generation !== playbackGeneration) return false;
      if (segment?.type === "controlled") return pronunciation?.playControlledClip?.(segment.audioKey);
      if (segment?.type !== "tts") return false;
      return speakText(segment?.text || "");
    }), Promise.resolve());
  }

  function speakWithControlledMorphemes(text, descriptors = [], options = {}) {
    const source = String(text || "");
    const pronunciation = window.FirstVoloMorphemePronunciation;
    const items = (Array.isArray(descriptors) ? descriptors : [descriptors])
      .map((item) => typeof item === "string" ? { id: item, token: item } : item)
      .filter((item) => item?.id && item?.token)
      .map((item) => ({ ...item, token: String(item.token) }))
      .filter((item) => pronunciation?.resolveMorphemeAudio?.(item.id)?.strategy === "controlled")
      .sort((a, b) => b.token.length - a.token.length);
    if (!items.length) return speak(source, options);
    const escaped = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = items.map((item) => escaped(item.token)).join("|");
    const matches = [];
    const matcher = new RegExp(`(?<![A-Za-z])(${pattern})(?![A-Za-z])`, "gi");
    let match;
    while ((match = matcher.exec(source))) matches.push({ start: match.index, end: match.index + match[0].length, token: match[0] });
    if (!matches.length) return speak(source, options);
    const segments = [];
    let cursor = 0;
    matches.forEach((match) => {
      if (match.start > cursor) segments.push({ type: "tts", text: source.slice(cursor, match.start) });
      const descriptor = items.find((item) => item.token.toLowerCase() === match.token.toLowerCase());
      const keys = descriptor?.audioKey
        ? [descriptor.audioKey]
        : (pronunciation?.controlledAudioKeysForId?.(descriptor?.id) || []);
      if (keys.length) {
        keys.forEach((audioKey, index) => {
          if (index) segments.push({ type: "tts", text: "or" });
          segments.push({ type: "controlled", audioKey });
        });
      }
      cursor = match.end;
    });
    if (cursor < source.length) segments.push({ type: "tts", text: source.slice(cursor) });
    return speakSegments(segments);
  }


  window.FirstVoloInstructionalAudio = {
    available,
    prepareSpeechText,
    rateForGradeBand,
    speak,
    speakSegments,
    speakWithControlledMorphemes,
    stop
  };

})();
