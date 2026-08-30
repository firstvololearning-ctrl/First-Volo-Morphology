"use strict";

/* One speech-only layer. Visible inventory labels and meanings stay canonical. */
(function (root) {
  const APPROVED_CANONICAL_IDS = new Set(["re", "dis", "en-em", "non", "location-in-family", "over", "mis", "sub", "pre", "inter", "fore", "de", "trans", "super", "anti", "mid", "under", "con-com", "e-ex", "pro", "retro", "circum", "bio", "fer", "mit", "pel", "pend", "port", "ten", "val", "vert", "cred", "form", "graph", "mot", "vis", "micro", "tele", "auto", "biblio", "phon", "scop", "metr", "therm", "ity", "ive", "ness", "ology", "ed", "er-or", "er-more", "est", "ful", "ing", "less", "ly-adverb", "ly-adjective"]);
  const CONTROLLED_AUDIO_IDS = new Set(["un-negation", "un-reversative", "negative-in-family", "semi", "ab", "a-ad", "chron", "duct", "ject", "pos", "put", "rupt", "scrib", "sequ", "spect", "struct", "tract", "ven", "voc", "act", "aud", "dict", "derm", "geo", "terr", "al", "ance", "ence", "ic", "ist", "ize", "ify", "able-ible", "ion", "ment", "ous", "ant-ent-agent", "ant-ent-adjective", "s-es"]);
  const CONTROLLED_VARIANT_LABELS = new Set(["-tion", "-sion", "-able", "-ance", "-ence", "-ion"]);
  const SPEECH_BY_ID = Object.freeze({
    "un-negation":"un", "un-reversative":"un", re:"ree", "negative-in-family":"in, im, il, or ir", dis:"dis", "en-em":"en or em", non:"non", "location-in-family":"in or im", over:"over", mis:"mis", sub:"sub", pre:"pree", inter:"inter", fore:"fore", de:"dee", trans:"trans", super:"super", semi:"semi", anti:"anti", mid:"mid", under:"under", ab:"ab", "a-ad":"a or ad", "con-com":"con or com", "e-ex":"e or ex", pro:"pro", retro:"retro", circum:"circum",
    bio:"bio", chron:"chron", duct:"duct or duce", fer:"fer", ject:"ject", mit:"mit", pel:"pel", pend:"pend or pens", port:"port", pos:"pos", put:"put", rupt:"rupt", scrib:"scrib or script", sequ:"sequ", spect:"spect", struct:"struct", ten:"ten", tract:"tract", val:"val", ven:"ven or vent", vert:"vert", voc:"voke", act:"act", aud:"aud", cred:"cred", dict:"dict", form:"form", graph:"graph", mot:"moat or move", vis:"vis or vid", micro:"micro", tele:"tele", auto:"auto", biblio:"biblio", derm:"derm or dermat", phon:"phon or phone", scop:"scop or scope", metr:"metr or meter", therm:"therm", geo:"geo", terr:"terr",
    al:"al", ance:"ance", ence:"ence", ic:"ic", ity:"ity", ive:"ive", ist:"ist", ize:"ize", ify:"ify", ness:"ness", ology:"ology", "able-ible":"able or ible", ed:"ed", "er-or":"er or or", "er-more":"er", est:"est", ful:"ful", ing:"ing", ion:"ion, tion, or sion", less:"less", "ly-adverb":"lee", "ly-adjective":"lee", ment:"ment", ous:"us", "ant-ent-agent":"ant or ent", "ant-ent-adjective":"ant or ent", "s-es":"s or es"
  });

  const VARIANT_SPEECH_BY_LABEL = Object.freeze({
    "-ion": "ion", "-tion": "tion", "-sion": "sion",
    "-able": "able", "-ible": "ible", "-ance": "ance", "-ence": "ence"
  });

  const inventory = root.FIRST_VOLO_MORPHEME_INVENTORY || [];
  const entries = Object.freeze(inventory.map((item) => Object.freeze({
    id: item.id,
    type: item.type,
    visibleLabel: item.label,
    speechText: SPEECH_BY_ID[item.id] || item.label,
    strategy: CONTROLLED_AUDIO_IDS.has(item.id) ? "controlled" : "tts",
    hearingStatus: CONTROLLED_AUDIO_IDS.has(item.id) ? "AUDIO NEEDED" : "approved"
  })));
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  const byLabel = entries.slice().sort((a, b) => b.visibleLabel.length - a.visibleLabel.length);
  const variantLabels = Object.entries(VARIANT_SPEECH_BY_LABEL)
    .sort((a, b) => b[0].length - a[0].length);
  const variantEntries = Object.freeze(variantLabels.map(([visibleLabel, speechText]) => Object.freeze({
    id: `variant:${visibleLabel}`,
    type: "variant",
    visibleLabel,
    speechText
  })));
  const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const controlledManifest = Object.create(null);
  const EXAMPLE_EVIDENCE = Object.freeze({
    un: ["unhappy", "unfair", "untie"], in: ["inactive"], im: ["impossible"], il: ["illegal"], ir: ["irregular"], semi: ["semicircle", "semicolon", "semifinal", "semisweet"], ab: ["abduct", "absent", "abnormal"], a: ["adhere"], ad: ["advance", "adjoin"], chron: ["chronology", "chronological", "synchronize"], duct: ["conduct"], duce: ["introduce", "produce"], ject: ["reject", "project", "eject"], pos: ["position", "deposit", "compose"], put: ["compute", "dispute", "reputation"], rupt: ["rupture", "interrupt", "disrupt"], scrib: ["describe"], script: ["scripted", "manuscript"], sequ: ["sequence", "consequence", "subsequent"], spect: ["inspect", "spectator", "respect"], struct: ["construct", "structure", "instruct"], tract: ["attract", "tractor", "extract"], ven: ["prevent"], vent: ["convention", "intervene"], voc: ["vocal", "vocation", "vocabulary"], act: ["active", "activity", "inactive"], aud: ["audio", "audible", "audience"], dict: ["predict", "dictionary", "contradict"], derm: ["epidermis"], dermat: ["dermatology", "dermatologist"], geo: ["geology", "geography", "geothermal"], terr: ["terrain", "territory", "subterranean"], al: ["natural", "musical", "regional"], ance: ["performance", "importance", "acceptance"], ence: ["difference", "existence", "evidence"], ic: ["poetic", "scientific", "historic"], ist: ["artist", "scientist", "pianist"], ize: ["realize", "modernize", "organize"], ify: ["clarify", "simplify", "beautify"], able: ["portable", "readable"], ion: ["action"], tion: ["construction"], sion: ["decision"], ment: ["movement", "development", "enjoyment"], ous: ["joyous", "dangerous", "famous"], ant: ["assistant", "resistant"], ent: ["dependent"], s: ["books", "dogs"], es: ["boxes"]
  });
  const AMBIGUITY_NOTES = Object.freeze({ "negative-in-family": "Allomorphs are represented by separate atomic forms.", "a-ad": "Examples support separate a/ad forms; verify pronunciation by form.", duct: "duct and duce are distinct written forms.", scrib: "scrib and script are distinct written forms.", ven: "ven and vent are distinct written forms.", derm: "derm and dermat are distinct written forms.", ion: "ion, tion, and sion are distinct written forms.", "ant-ent-agent": "ant and ent occur in different examples.", "ant-ent-adjective": "ant and ent occur in different examples.", "s-es": "s and es are distinct plural allomorphs." });
  const CITATION_METADATA = Object.freeze({
    un: ["yes", "no", "NEEDS DECISION", "controlled-audio citation form is not established by these word examples"], in: ["yes", "yes", "NEEDS DECISION", "negative prefix allomorph citation form"], im: ["yes", "yes", "NEEDS DECISION", "negative prefix allomorph citation form"], il: ["yes", "yes", "NEEDS DECISION", "negative prefix allomorph citation form"], ir: ["yes", "yes", "NEEDS DECISION", "negative prefix allomorph citation form"],
    semi: ["yes", "no", "NEEDS DECISION", "pedagogical citation form must be chosen; do not infer from spelling"], ab: ["yes", "no", "NEEDS DECISION", "prefix citation form should not be inferred from abduct/absent/abnormal"], a: ["partial", "yes", "NEEDS DECISION", "adhere is evidence for the form but not a standalone citation"], ad: ["yes", "no", "NEEDS DECISION", "confirm citation form separately from contextual words"],
    duct: ["yes", "yes", "NEEDS DECISION", "duct/duce spelling and realization differ"], duce: ["yes", "yes", "NEEDS DECISION", "duct/duce spelling and realization differ"], scrib: ["yes", "yes", "NEEDS DECISION", "scrib/script family requires citation decision"], script: ["yes", "yes", "NEEDS DECISION", "scrib/script family requires citation decision"], sequ: ["yes", "no", "NEEDS DECISION", "isolated citation must not be inferred from sequence"],
    ven: ["yes", "yes", "NEEDS DECISION", "ven/vent family requires citation decision"], vent: ["yes", "yes", "NEEDS DECISION", "ven/vent family requires citation decision"], derm: ["yes", "yes", "NEEDS DECISION", "derm/dermat family requires citation decision"], dermat: ["yes", "yes", "NEEDS DECISION", "derm/dermat family requires citation decision"],
    ion: ["yes", "yes", "NEEDS DECISION", "ion/tion/sion have distinct contextual forms"], tion: ["yes", "yes", "NEEDS DECISION", "ion/tion/sion have distinct contextual forms"], sion: ["yes", "yes", "NEEDS DECISION", "ion/tion/sion have distinct contextual forms"], ant: ["yes", "yes", "NEEDS DECISION", "ant/ent allomorph family"], ent: ["yes", "yes", "NEEDS DECISION", "ant/ent allomorph family"],
    al: ["yes", "yes", "NEEDS DECISION", "suffix citation versus reduced word realization"], ance: ["yes", "yes", "NEEDS DECISION", "suffix citation versus unstressed word realization"], ence: ["yes", "yes", "NEEDS DECISION", "suffix citation versus unstressed word realization"], able: ["yes", "yes", "NEEDS DECISION", "suffix citation versus reduced word realization"], ous: ["yes", "yes", "NEEDS DECISION", "suffix citation versus reduced word realization"], s: ["partial", "yes", "NEEDS DECISION", "books/dogs demonstrate contextual /s/ and /z/"], es: ["partial", "yes", "NEEDS DECISION", "boxes demonstrates a contextual allomorph; citation form unresolved"]
  });
  const addManifestForm = (audioKey, id, variantId = null) => {
    const target = audioKey === "tion" ? "/ʃən/" : null;
    const citation = CITATION_METADATA[audioKey] || ["yes", "no", "STABLE", "No contextual variation identified in the current examples."];
    const item = controlledManifest[audioKey] ||= { audioKey, visibleForm: audioKey, canonicalIds: [], variantIds: [], proposedFilename: `audio/morphemes/${audioKey}.mp3`, pronunciationTarget: target, pronunciationSource: target ? "User-provided authoritative target; reference verification still required" : null, sourceStatus: target ? "TARGET VERIFIED" : "TARGET NEEDS SOURCE", FirstVoloExamples: EXAMPLE_EVIDENCE[audioKey] || [], exampleSource: "word-inventory.js: currentExamples", exampleEvidenceValid: citation[0], contextualVariation: citation[1], citationPronunciationStatus: citation[2], contextNotes: citation[3], notes: "", clipStatus: "not created" };
    if (variantId) item.variantIds.push(variantId);
    else if (!item.canonicalIds.includes(id)) {
      item.canonicalIds.push(id);
      const sourceItem = inventory.find((entry) => entry.id === id);
      item.exampleWord ||= String(sourceItem?.currentExamples || sourceItem?.examples?.[0] || "").split(/[ ·,]/)[0] || null;
      item.notes ||= AMBIGUITY_NOTES[id] || "";
    }
  };
  const controlledById = {
    "un-negation": ["un"], "un-reversative": ["un"], "negative-in-family": ["in", "im", "il", "ir"], semi: ["semi"], ab: ["ab"], "a-ad": ["a", "ad"], chron: ["chron"], duct: ["duct", "duce"], ject: ["ject"], pos: ["pos"], put: ["put"], rupt: ["rupt"], scrib: ["scrib", "script"], sequ: ["sequ"], spect: ["spect"], struct: ["struct"], tract: ["tract"], ven: ["ven", "vent"], voc: ["voc"], act: ["act"], aud: ["aud"], dict: ["dict"], derm: ["derm", "dermat"], geo: ["geo"], terr: ["terr"], al: ["al"], ance: ["ance"], ence: ["ence"], ic: ["ic"], ist: ["ist"], ize: ["ize"], ify: ["ify"], "able-ible": ["able"], ion: ["ion", "tion", "sion"], ment: ["ment"], ous: ["ous"], "ant-ent-agent": ["ant", "ent"], "ant-ent-adjective": ["ant", "ent"], "s-es": ["s", "es"]
  };
  const controlledByVariant = { "-tion": "tion", "-sion": "sion", "-able": "able", "-ance": "ance", "-ence": "ence", "-ion": "ion" };
  Object.entries(controlledById).forEach(([id, keys]) => keys.forEach((key) => addManifestForm(key, id)));
  Object.entries(controlledByVariant).forEach(([label, key]) => addManifestForm(key, null, `variant:${label}`));

  function getMorphemeSpeechText(id) {
    const entry = byId.get(id);
    return entry?.strategy === "controlled" ? null : entry?.speechText || id;
  }

  function resolveMorphemeAudio(id) {
    const entry = byId.get(id);
    if (!entry) return { strategy: "tts", speechText: id };
    if (entry.strategy === "controlled") {
      return { strategy: "controlled", audioKey: controlledById[id]?.[0] || id, audioSrc: null, status: "AUDIO NEEDED" };
    }
    return { strategy: "tts", speechText: entry.speechText };
  }

  function containsControlledMorpheme(value) {
    const text = String(value || "");
    return entries.some((entry) => {
      if (!CONTROLLED_AUDIO_IDS.has(entry.id)) return false;
      const label = escape(entry.visibleLabel);
      const boundary = /^[A-Za-z]/.test(entry.visibleLabel) ? "(?<![A-Za-z])" : "";
      const end = /[A-Za-z]$/.test(entry.visibleLabel) ? "(?![A-Za-z])" : "";
      return new RegExp(`${boundary}${label}${end}`, "i").test(text);
    });
  }

  function replaceMorphemeLabels(value) {
    let result = String(value || "");
    byLabel.forEach((entry) => {
      const label = escape(entry.visibleLabel);
      const boundary = /^[A-Za-z]/.test(entry.visibleLabel) ? "(?<![A-Za-z])" : "";
      const end = /[A-Za-z]$/.test(entry.visibleLabel) ? "(?![A-Za-z])" : "";
      const speech = getMorphemeSpeechText(entry.id);
      result = result.replace(new RegExp(`${boundary}${label}${end}`, "gi"), speech || "");
    });
    variantLabels.forEach(([label, speech]) => {
      result = result.replace(new RegExp(escape(label), "gi"), CONTROLLED_VARIANT_LABELS.has(label) ? "" : speech);
    });
    return result;
  }

  root.FirstVoloMorphemePronunciation = Object.freeze({
    entries,
    variantEntries,
    approvedCanonicalIds: Object.freeze([...APPROVED_CANONICAL_IDS]),
    controlledAudioIds: Object.freeze([...CONTROLLED_AUDIO_IDS]),
    controlledAudioManifest: Object.freeze(Object.values(controlledManifest).map((item) => Object.freeze({ ...item, canonicalIds: Object.freeze(item.canonicalIds), variantIds: Object.freeze(item.variantIds) }))),
    resolveMorphemeAudio,
    containsControlledMorpheme,
    getMorphemeSpeechText,
    replaceMorphemeLabels
  });

  /* Localhost-only hearing QA; never shipped as a learner control. */
  function setupReview() {
    if (!root.location || !["localhost", "127.0.0.1", "::1", ""].includes(root.location.hostname)
      || !new URLSearchParams(root.location.search).has("pronunciationReview")) return;
    const focusedIds = new Set(["un-negation", "un-reversative", "inter", "semi", "en-em", "re", "ject", "scrib", "tract", "dict", "act", "rupt", "struct", "chron", "sequ", "voc", "mot", "derm", "ven", "ist", "ment", "ic", "ize", "able-ible", "ify", "ity", "ance", "ence", "ion"]);
    const focused = new URLSearchParams(root.location.search).get("pronunciationReview") === "focused";
    const reviewEntries = focused
      ? [...entries.filter((entry) => focusedIds.has(entry.id)), ...variantEntries]
      : [...entries, ...variantEntries];
    const panel = document.createElement("section");
    panel.className = "morpheme-pronunciation-review";
    panel.innerHTML = `<header><div><small>Local QA only</small><h2>Morpheme pronunciation review</h2><p>Visible label and speech-only representation stay separate.</p></div><button type="button" aria-label="Close pronunciation review">Close</button></header><div class="morpheme-pronunciation-list"></div>`;
    const list = panel.querySelector(".morpheme-pronunciation-list");
    reviewEntries.forEach((entry) => {
      const row = document.createElement("div");
      const isControlledVariant = entry.type === "variant" && CONTROLLED_VARIANT_LABELS.has(entry.visibleLabel);
      const speech = entry.type === "variant" ? (isControlledVariant ? null : entry.speechText) : getMorphemeSpeechText(entry.id);
      const strategy = entry.type === "variant" ? (isControlledVariant ? "controlled" : "tts") : (entry.strategy || "tts");
      const status = entry.type === "variant" ? (isControlledVariant ? "AUDIO NEEDED" : "approved") : entry.hearingStatus;
      row.innerHTML = `<span><b>${entry.id}</b><strong>${entry.visibleLabel}</strong><small>${strategy} · ${speech || "controlled clip not installed"}</small><small class="morpheme-pronunciation-status">${status}</small></span><button type="button" ${status === "AUDIO NEEDED" ? "disabled aria-label=Controlled audio needed" : ""}>🔊 Hear</button>`;
      if (status !== "AUDIO NEEDED") row.querySelector("button").addEventListener("click", () => {
        root.FirstVoloInstructionalAudio?.speak?.(speech) || root.speechSynthesis?.speak?.(new root.SpeechSynthesisUtterance(speech));
      });
      list.append(row);
    });
    panel.querySelector("header button").addEventListener("click", () => panel.remove());
    const style = document.createElement("style");
    style.textContent = `.morpheme-pronunciation-review{position:fixed;inset:4vh 5vw;z-index:9000;overflow:hidden;border:3px solid #bcd9ee;border-radius:22px;background:#f8fbfe;box-shadow:0 20px 70px #1b304c99;font-family:inherit;color:#284967}.morpheme-pronunciation-review header{display:flex;justify-content:space-between;gap:18px;padding:16px 20px;background:linear-gradient(135deg,#426f9a,#86b9d3);color:#fff}.morpheme-pronunciation-review h2{margin:3px 0;font-size:1.3rem}.morpheme-pronunciation-review p{margin:3px 0;font-size:.82rem}.morpheme-pronunciation-review header button{align-self:start;padding:8px 13px;border:1px solid #fff;border-radius:999px;background:#ffffff22;color:#fff;font:inherit;font-weight:800}.morpheme-pronunciation-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:7px;overflow:auto;height:calc(100% - 106px);padding:14px}.morpheme-pronunciation-list>div{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border:1px solid #c5d7e5;border-radius:10px;background:#fff}.morpheme-pronunciation-list span{display:grid;gap:1px;min-width:0}.morpheme-pronunciation-list b{font-size:.7rem;color:#60788f}.morpheme-pronunciation-list strong{font-size:.95rem}.morpheme-pronunciation-list small{color:#5b7190;font-size:.8rem}.morpheme-pronunciation-list button{flex:none;padding:7px 9px;border:0;border-radius:999px;background:#7150a5;color:#fff;font:inherit;font-weight:800}@media(max-width:650px){.morpheme-pronunciation-review{inset:2vh 2vw}.morpheme-pronunciation-review header{padding:13px}.morpheme-pronunciation-list{grid-template-columns:1fr}}`;
    document.head.append(style);
    document.body.append(panel);
  }
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setupReview, { once: true });
    else setupReview();
  }
})(typeof window !== "undefined" ? window : globalThis);
