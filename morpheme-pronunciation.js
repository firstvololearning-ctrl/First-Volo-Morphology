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
  const VERIFIED_TARGETS = Object.freeze({
    chron: ["/krɑn/", "HUMAN PEDAGOGICAL DECISION", "short-o citation pronunciation; dialect-equivalent short-o realization allowed"],
    ject: ["/dʒɛkt/", "HUMAN PEDAGOGICAL DECISION", "final /kt/ must be clearly present"],
    rupt: ["/rʌpt/", "HUMAN PEDAGOGICAL DECISION", "final /pt/ must be clearly present"],
    spect: ["/spɛkt/", "HUMAN PEDAGOGICAL DECISION", "final /kt/ must be clearly present"],
    struct: ["/strʌkt/", "HUMAN PEDAGOGICAL DECISION", "final /kt/ must be clearly present"],
    tract: ["/trækt/", "HUMAN PEDAGOGICAL DECISION", "final /kt/ must be clearly present"],
    act: ["/ækt/", "HUMAN PEDAGOGICAL DECISION", "final /kt/ must be clearly present"],
    dict: ["/dɪkt/", "HUMAN PEDAGOGICAL DECISION", "final /kt/ must be clearly present"],
    ize: ["/aɪz/", "HUMAN PEDAGOGICAL DECISION", "citation pronunciation is eyes; visible form remains -ize"],
    tion: ["/ʃən/", "HUMAN PEDAGOGICAL DECISION", "suffix citation pronunciation"],
    ic: ["/ɪk/", "HUMAN PEDAGOGICAL DECISION", "human cue: ick"],
    ify: ["/ɪfaɪ/", "HUMAN PEDAGOGICAL DECISION", "suffix pronunciation represented in clarify, simplify, beautify"],
    ance: ["/æns/", "HUMAN PEDAGOGICAL DECISION / USER-PROVIDED PRONUNCIATION REFERENCE", "examples: performance, importance, acceptance"],
    ence: ["/ɛns/", "HUMAN PEDAGOGICAL DECISION / USER-PROVIDED PRONUNCIATION REFERENCE", "examples: difference, existence, evidence"],
    ment: ["/mənt/", "HUMAN PEDAGOGICAL DECISION / USER-PROVIDED PRONUNCIATION REFERENCE", "final /t/ must be clearly audible; examples: movement, development, enjoyment"],
    un: ["/ʌn/", "HUMAN PEDAGOGICAL DECISION", "ordinary English prefix citation pronunciation; not French-like une"],
    in: ["/ɪn/", "HUMAN PEDAGOGICAL DECISION", "negative in- family member; retain as a separate controlled clip"],
    im: ["/ɪm/", "HUMAN PEDAGOGICAL DECISION", "negative im- family member; retain as a separate controlled clip"],
    il: ["/ɪl/", "HUMAN PEDAGOGICAL DECISION", "negative il- family member; retain as a separate controlled clip"],
    ir: ["/ɪr/", "HUMAN PEDAGOGICAL DECISION", "negative ir- family member; retain as a separate controlled clip"],
    ad: ["/æd/", "HUMAN PEDAGOGICAL DECISION", "short-a ad, like add; cue includes advent"],
    ab: ["/æb/", "HUMAN PEDAGOGICAL DECISION", "short-a ab, like abs; cue includes absent"],
    a: ["/ə/", "HUMAN PEDAGOGICAL DECISION + SOURCE DISTINCTION", "First Volo a- in the a-, ad- to/toward family; reduced citation uh. Greek negative a- /eɪ/ is a different morpheme."],
    duce: ["/duːs/", "HUMAN PEDAGOGICAL DECISION", "Cue: the sound in reduce, produce, and introduce; not Italian Duce."],
    duct: ["/dʌkt/", "HUMAN PEDAGOGICAL DECISION", "Complete final /kt/ cluster must be audible."],
    pos: ["/poʊz/", "HUMAN PEDAGOGICAL DECISION", "American-English citation pose; do not use reduced position vowel."],
    put: ["/pjuːt/", "HUMAN PEDAGOGICAL DECISION", "Citation pute; compute/dispute are clearest evidence."],
    scrib: ["/skrɪb/", "HUMAN PEDAGOGICAL DECISION", "Intended scrib pronunciation was fine."],
    script: ["/skrɪpt/", "HUMAN PEDAGOGICAL DECISION", "Complete final /pt/ cluster must be audible."],
    sequ: ["/sɛkw/", "HUMAN PEDAGOGICAL DECISION", "Cue sekw; not letter names or /siːkw/."],
    derm: ["existing intended citation pronunciation", "HUMAN PEDAGOGICAL DECISION", "Intended pronunciation was fine; preserve vowel and stress."],
    dermat: ["existing intended citation pronunciation + clearly audible final /t/", "HUMAN PEDAGOGICAL DECISION", "Preserve vowel and stress; do not add a syllable or drop final /t/."],
    ven: ["/vɛn/", "HUMAN PEDAGOGICAL DECISION", "Cue ven rhyming with hen/men; example intervene."],
    vent: ["/vɛnt/", "HUMAN PEDAGOGICAL DECISION", "Ordinary English word vent; examples prevent and convention."],
    voc: ["/vɑk/", "HUMAN PEDAGOGICAL DECISION", "American-English short-o citation vok."],
    aud: ["/ɔd/", "HUMAN PEDAGOGICAL DECISION", "Cue awd; examples audio, audible, audience."],
    geo: ["/ˈdʒiːoʊ/", "HUMAN PEDAGOGICAL DECISION", "Cue JEE-oh; source-supported by canonical examples."],
    terr: ["/tɛr/", "HUMAN PEDAGOGICAL DECISION", "Cue beginning of terrain/terrier; First Volo American-English citation."],
    al: ["/əl/", "HUMAN PEDAGOGICAL DECISION", "Unstressed uhl."],
    ist: ["/ɪst/", "HUMAN PEDAGOGICAL DECISION", "Short-i ist."],
    able: ["/əbəl/", "HUMAN PEDAGOGICAL DECISION", "Unstressed suffix uh-bull; not standalone able."],
    ion: ["/ʃən/", "HUMAN PEDAGOGICAL DECISION + SOURCE SUPPORT", "First Volo pedagogical citation shun; example action; distinct written form from tion."],
    sion: ["/ʒən/", "HUMAN PEDAGOGICAL DECISION + SOURCE SUPPORT", "Citation based on decision; contextual /ʃən/ variation also documented."],
    ous: ["/əs/", "HUMAN PEDAGOGICAL DECISION", "Unstressed us."],
    ant: ["/ənt/", "HUMAN PEDAGOGICAL DECISION", "Unstressed uhnt; not standalone insect ant."],
    ent: ["/ənt/", "HUMAN PEDAGOGICAL DECISION", "Unstressed uhnt."],
    s: [null, "HUMAN PEDAGOGICAL DECISION", "Context-dependent allomorphs /s/, /z/, /ɪz/; no universal IPA."],
    es: [null, "HUMAN PEDAGOGICAL DECISION", "Context-dependent allomorphs /s/, /z/, /ɪz/; boxes is /ɪz/ but spelling is not universal."],
    semi: ["/ˈsɛmi/", "HUMAN PEDAGOGICAL DECISION", "First Volo citation pronunciation: SEM-ee"]
  });
  const FAMILY_SPEAKING_RULES = Object.freeze({ "negative-in-family": "in or im or il or ir", "a-ad": "uh or ad", "s-es": "s or z or iz" });
  const EXAMPLE_EVIDENCE = Object.freeze({
    un: ["unhappy", "unfair", "untie"], in: ["inactive"], im: ["impossible"], il: ["illegal"], ir: ["irregular"], semi: ["semicircle", "semicolon", "semifinal", "semisweet"], ab: ["abduct", "absent", "abnormal"], a: ["adhere"], ad: ["advance", "adjoin"], chron: ["chronology", "chronological", "synchronize"], duct: ["conduct"], duce: ["introduce", "produce"], ject: ["reject", "project", "eject"], pos: ["position", "deposit", "compose"], put: ["compute", "dispute", "reputation"], rupt: ["rupture", "interrupt", "disrupt"], scrib: ["describe"], script: ["scripted", "manuscript"], sequ: ["sequence", "consequence", "subsequent"], spect: ["inspect", "spectator", "respect"], struct: ["construct", "structure", "instruct"], tract: ["attract", "tractor", "extract"], ven: ["intervene"], vent: ["prevent", "convention"], voc: ["vocal", "vocation", "vocabulary"], act: ["active", "activity", "inactive"], aud: ["audio", "audible", "audience"], dict: ["predict", "dictionary", "contradict"], derm: ["epidermis"], dermat: ["dermatology", "dermatologist"], geo: ["geology", "geography", "geothermal"], terr: ["terrain", "territory", "subterranean"], al: ["natural", "musical", "regional"], ance: ["performance", "importance", "acceptance"], ence: ["difference", "existence", "evidence"], ic: ["poetic", "scientific", "historic"], ist: ["artist", "scientist", "pianist"], ize: ["realize", "modernize", "organize"], ify: ["clarify", "simplify", "beautify"], able: ["portable", "readable"], ion: ["action"], tion: ["construction"], sion: ["decision"], ment: ["movement", "development", "enjoyment"], ous: ["joyous", "dangerous", "famous"], ant: ["assistant", "resistant"], ent: ["dependent"], s: ["books", "dogs"], es: ["boxes"]
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
  const PREFIX_TARGET_SOURCING = Object.freeze({
    un: ["ordinary English prefix sound at the beginning of unhappy", "/ʌn/", "SOURCE NEEDED", "Must not be French-like une; citation form is separate from word context."],
    in: ["individual negative in- allomorph", "/ɪn/", "SOURCE NEEDED", "Keep distinct from im-, il-, and ir-."],
    im: ["individual negative im- allomorph", "/ɪm/", "SOURCE NEEDED", "Keep distinct from in-, il-, and ir-."],
    il: ["individual negative il- allomorph", "/ɪl/", "SOURCE NEEDED", "Keep distinct from in-, im-, and ir-."],
    ir: ["individual negative ir- allomorph", "/ɪr/", "SOURCE NEEDED", "Keep distinct from in-, im-, and il-."],
    semi: ["SEM-ee or SEM-eye are both reported possibilities", "/ˈsɛmi/ or /ˈsɛmaɪ/", "SOURCE NEEDED", "Determine the educational/dictionary form and select one consistently for First Volo."],
    ab: ["ab- prefix citation form", null, "SOURCE NEEDED", "Do not infer isolated citation from abduct, absent, or abnormal."],
    a: ["a- prefix citation form", null, "SOURCE NEEDED", "Adhere is not sufficient proof that isolated a- is the letter-name A."],
    ad: ["ad- prefix citation form", null, "SOURCE NEEDED", "Advance and adjoin provide context but do not by themselves settle citation form." ]
  });
  const addManifestForm = (audioKey, id, variantId = null) => {
    const targetRecord = VERIFIED_TARGETS[audioKey] || null;
    const target = targetRecord?.[0] || null;
    const citation = CITATION_METADATA[audioKey] || ["yes", "no", "STABLE", "No contextual variation identified in the current examples."];
    const sourcing = PREFIX_TARGET_SOURCING[audioKey] || null;
    const targetVerified = Boolean(targetRecord);
    const extension = CONTROLLED_REVIEW_AUDIO_KEYS.includes(audioKey) ? PILOT_AUDIO_EXTENSION : "mp3";
    const item = controlledManifest[audioKey] ||= { audioKey, visibleForm: audioKey, canonicalIds: [], variantIds: [], proposedFilename: `audio/morphemes/${audioKey}.${extension}`, pronunciationTarget: target ?? sourcing?.[1] ?? null, pronunciationSource: targetRecord?.[1] || null, sourceStatus: targetVerified ? "TARGET VERIFIED" : "TARGET NEEDS SOURCE", candidateCitationPronunciation: sourcing?.[0] || null, ipaTarget: sourcing?.[1] || null, targetSourceStatus: sourcing?.[2] || (targetVerified ? "TARGET VERIFIED" : "TARGET NEEDS SOURCE"), FirstVoloExamples: EXAMPLE_EVIDENCE[audioKey] || [], exampleSource: "word-inventory.js: currentExamples", exampleEvidenceValid: citation[0], contextualVariation: citation[1], citationPronunciationStatus: citation[2], contextNotes: sourcing?.[3] || citation[3], notes: targetRecord?.[2] || "", clipStatus: "not created" };
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
  const PILOT_AUDIO_KEYS = Object.freeze(["chron", "duce", "duct", "sequ", "geo", "able", "sion", "dermat"]);
  const PREFIX_AUDIO_KEYS = Object.freeze(["un", "in", "im", "il", "ir", "semi", "ab", "a", "ad"]);
  const ROOTS_BATCH1_AUDIO_KEYS = Object.freeze(["ject", "pos", "put", "rupt", "scrib", "script", "spect", "struct", "tract"]);
  const ROOTS_BATCH2_AUDIO_KEYS = Object.freeze(["ven", "vent", "voc", "act", "aud", "dict", "derm", "terr"]);
  const SUFFIXES_BATCH1_AUDIO_KEYS = Object.freeze(["al", "ance", "ence", "ic", "ist", "ize", "ify"]);
  const SUFFIXES_BATCH2_AUDIO_KEYS = Object.freeze(["ion", "tion", "ment", "ous", "ant", "ent"]);
  const S_ES_REALIZATIONS = Object.freeze([
    { audioKey: "s-es-s", visibleForm: "/s/", proposedFilename: "audio/morphemes/s-es-s.m4a", pronunciationTarget: "/s/", notes: "Voiceless surface realization only; do not record the letter name ess.", FirstVoloExamples: ["books"] },
    { audioKey: "s-es-z", visibleForm: "/z/", proposedFilename: "audio/morphemes/s-es-z.m4a", pronunciationTarget: "/z/", notes: "Voiced surface realization only; do not record the letter name zee.", FirstVoloExamples: ["dogs"] },
    { audioKey: "s-es-iz", visibleForm: "/ɪz/", proposedFilename: "audio/morphemes/s-es-iz.m4a", pronunciationTarget: "/ɪz/", notes: "Short iz syllable surface realization.", FirstVoloExamples: ["boxes"] }
  ]);
  const S_ES_REALIZATION_AUDIO_KEYS = Object.freeze(S_ES_REALIZATIONS.map((item) => item.audioKey));
  const CONTROLLED_CLIP_AUDIO_KEYS = Object.freeze([...PILOT_AUDIO_KEYS, ...PREFIX_AUDIO_KEYS, ...ROOTS_BATCH1_AUDIO_KEYS, ...ROOTS_BATCH2_AUDIO_KEYS, ...SUFFIXES_BATCH1_AUDIO_KEYS, ...SUFFIXES_BATCH2_AUDIO_KEYS, ...S_ES_REALIZATION_AUDIO_KEYS]);
  const CONTROLLED_REVIEW_AUDIO_KEYS = Object.freeze([...CONTROLLED_CLIP_AUDIO_KEYS, ...ROOTS_BATCH2_AUDIO_KEYS, ...SUFFIXES_BATCH1_AUDIO_KEYS, ...SUFFIXES_BATCH2_AUDIO_KEYS, ...S_ES_REALIZATION_AUDIO_KEYS]);
  const CONTROLLED_AUDIO_REVIEW_BATCHES = Object.freeze({ pilot: PILOT_AUDIO_KEYS, prefixes: PREFIX_AUDIO_KEYS, "roots-1": ROOTS_BATCH1_AUDIO_KEYS, "roots-2": ROOTS_BATCH2_AUDIO_KEYS, "suffixes-1": SUFFIXES_BATCH1_AUDIO_KEYS, "suffixes-2": SUFFIXES_BATCH2_AUDIO_KEYS, "s-es": S_ES_REALIZATION_AUDIO_KEYS, "final-redos": Object.freeze(["s-es-s", "tion"]) });
  const PILOT_AUDIO_EXTENSION = "m4a";
  Object.entries(controlledById).forEach(([id, keys]) => keys.forEach((key) => addManifestForm(key, id)));
  Object.entries(controlledByVariant).forEach(([label, key]) => addManifestForm(key, null, `variant:${label}`));

  function getMorphemeSpeechText(id) {
    const entry = byId.get(id);
    return entry?.strategy === "controlled" ? null : entry?.speechText || id;
  }

  function resolveMorphemeAudio(id) {
    if (id === "s" || id === "es") {
      return { strategy: "controlled", audioKey: id, audioSrc: null, status: "AUDIO NEEDED" };
    }
    if (CONTROLLED_CLIP_AUDIO_KEYS.includes(id)) {
      return { strategy: "controlled", audioKey: id, audioSrc: controlledClipPath(id), status: "CLIP INSTALLED" };
    }
    const entry = byId.get(id);
    if (!entry) return { strategy: "tts", speechText: id };
    if (entry.strategy === "controlled") {
      const audioKey = controlledById[id]?.[0] || id;
      const audioSrc = CONTROLLED_CLIP_AUDIO_KEYS.includes(audioKey) ? controlledClipPath(audioKey) : null;
      return { strategy: "controlled", audioKey, audioSrc, status: audioSrc ? "CLIP INSTALLED" : "AUDIO NEEDED" };
    }
    return { strategy: "tts", speechText: entry.speechText };
  }

  function controlledClipPath(audioKey) {
    return `audio/morphemes/${CONTROLLED_REVIEW_AUDIO_KEYS.includes(audioKey) ? `${audioKey}.${PILOT_AUDIO_EXTENSION}` : `${audioKey}.mp3`}`;
  }

  async function isControlledClipInstalled(audioKey) {
    if (typeof fetch !== "function") return false;
    try {
      const response = await fetch(controlledClipPath(audioKey), { method: "HEAD", cache: "no-store" });
      return response.ok;
    } catch (_) {
      return false;
    }
  }

  function playControlledClip(audioKey, cacheBust = "") {
    const baseSrc = controlledClipPath(audioKey);
    const src = cacheBust ? `${baseSrc}?qa=${encodeURIComponent(cacheBust)}` : baseSrc;
    if (typeof root.Audio !== "function") return Promise.reject(new Error("Audio playback is unavailable"));
    return isControlledClipInstalled(audioKey).then((installed) => {
      if (!installed) throw new Error(`Controlled clip is missing: ${src}`);
      return new Promise((resolve, reject) => {
        const audio = new root.Audio(src);
        audio.addEventListener("ended", resolve, { once: true });
        audio.addEventListener("error", () => reject(new Error(`Unable to play controlled clip: ${src}`)), { once: true });
        audio.play().catch(reject);
      });
    });
  }

  function downloadRecording(blob, filename) {
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  function recordingExtension(mimeType) {
    const mime = String(mimeType || "").toLowerCase();
    if (mime.includes("mp4")) return "m4a";
    if (mime.includes("webm")) return "webm";
    if (mime.includes("ogg")) return "ogg";
    return "bin";
  }

  function preferredRecordingMimeType() {
    const candidates = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm"];
    return candidates.find((type) => root.MediaRecorder?.isTypeSupported?.(type)) || "";
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
    pilotAudioKeys: PILOT_AUDIO_KEYS,
    controlledAudioRealizations: S_ES_REALIZATIONS,
    controlledAudioReviewBatches: CONTROLLED_AUDIO_REVIEW_BATCHES,
    controlledClipPath,
    isControlledClipInstalled,
    playControlledClip,
    familySpeakingRules: FAMILY_SPEAKING_RULES,
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

  function setupPilotReview() {
    if (!root.location || !["localhost", "127.0.0.1", "::1", ""].includes(root.location.hostname)
      || !CONTROLLED_AUDIO_REVIEW_BATCHES[new URLSearchParams(root.location.search).get("controlledAudioReview")]) return;
    const reviewBatch = new URLSearchParams(root.location.search).get("controlledAudioReview");
    const reviewKeys = CONTROLLED_AUDIO_REVIEW_BATCHES[reviewBatch];
    const manifestByKey = new Map(controlledManifest && Object.values(controlledManifest).map((item) => [item.audioKey, item]));
    const reviewItems = reviewBatch === "s-es"
      ? S_ES_REALIZATIONS
      : reviewBatch === "final-redos"
        ? reviewKeys.map((key) => S_ES_REALIZATIONS.find((item) => item.audioKey === key) || manifestByKey.get(key)).filter(Boolean)
        : reviewKeys.map((key) => manifestByKey.get(key)).filter(Boolean);
    const stored = (() => { try { return JSON.parse(root.localStorage?.getItem("firstVoloControlledAudioPilotReview:v1") || "{}"); } catch (_) { return {}; } })();
    const panel = document.createElement("section");
    panel.className = "controlled-audio-pilot-review";
    panel.innerHTML = `<header><div><small>Local QA only · no learner progress</small><h2>Controlled-audio ${reviewBatch === "prefixes" ? "prefix" : "pilot"}</h2><p>Human-recorded clips are reviewed here; files are never auto-approved.</p></div><button type="button" aria-label="Close controlled audio review">Close</button></header><div class="controlled-audio-pilot-list"></div>`;
    const list = panel.querySelector(".controlled-audio-pilot-list");
    reviewItems.forEach((item) => {
      const key = item.audioKey;
      const row = document.createElement("article");
      row.className = "controlled-audio-pilot-row";
      row.innerHTML = `<div><strong>${item.visibleForm}</strong><small>Target: ${item.pronunciationTarget || "see notes"}</small><small>${item.notes || item.contextNotes || ""}</small><small>Examples: ${(item.FirstVoloExamples || []).join(" · ")}</small><small class="controlled-audio-file">Checking ${item.proposedFilename}…</small><audio class="controlled-audio-native" controls preload="none" aria-label="Native temporary recording diagnostic"></audio></div><div class="controlled-audio-pilot-actions"><button type="button" class="controlled-audio-saved" disabled>▶ Play saved clip</button><button type="button" class="controlled-audio-record">🎙 Record</button><button type="button" class="controlled-audio-stop" disabled>■ Stop</button><button type="button" class="controlled-audio-preview" disabled>▶ Play recording</button><button type="button" class="controlled-audio-redo" disabled>↻ Redo</button><button type="button" class="controlled-audio-save" disabled>Save recording</button><select aria-label="Review status for ${item.visibleForm}"><option>Pending review</option><option>Approved</option><option>Needs redo</option></select></div>`;
      const play = row.querySelector(".controlled-audio-saved");
      const select = row.querySelector("select");
      const record = row.querySelector(".controlled-audio-record"), stop = row.querySelector(".controlled-audio-stop"), preview = row.querySelector(".controlled-audio-preview"), redo = row.querySelector(".controlled-audio-redo"), save = row.querySelector(".controlled-audio-save"), nativeAudio = row.querySelector(".controlled-audio-native");
      let recorder = null, chunks = [], temporaryRecording = null, recordingAudio = null;
      const debug = (event, details = {}) => { const payload = { key, event, ...details, at: new Date().toISOString() }; root.__firstVoloPilotRecordingDebug = root.__firstVoloPilotRecordingDebug || []; root.__firstVoloPilotRecordingDebug.push(payload); console.debug("[controlled-audio-pilot]", payload); };
      nativeAudio.addEventListener("error", () => debug("native-audio-error", { readyState: nativeAudio.readyState, networkState: nativeAudio.networkState, mediaError: nativeAudio.error?.code || null }));
      record.addEventListener("click", async () => { try { recordingAudio?.pause(); if (temporaryRecording?.url) URL.revokeObjectURL(temporaryRecording.url); temporaryRecording = null; nativeAudio.removeAttribute("src"); nativeAudio.load(); preview.disabled = true; redo.disabled = true; save.disabled = true; const stream = await root.navigator.mediaDevices.getUserMedia({ audio: true }); const requestedMimeType = preferredRecordingMimeType(); recorder = requestedMimeType ? new root.MediaRecorder(stream, { mimeType: requestedMimeType }) : new root.MediaRecorder(stream); chunks = []; debug("media-recorder-created", { requestedMimeType: requestedMimeType || "browser default", recorderMimeType: recorder.mimeType }); recorder.addEventListener("dataavailable", (event) => { if (event.data.size) chunks.push(event.data); debug("dataavailable", { chunkCount: chunks.length, chunkBytes: event.data.size, chunkType: event.data.type }); }); recorder.addEventListener("stop", async () => { stream.getTracks().forEach((track) => track.stop()); const actualMimeType = recorder.mimeType || chunks[0]?.type || "application/octet-stream"; const sourceBlob = new Blob(chunks, { type: actualMimeType }); const url = URL.createObjectURL(sourceBlob); temporaryRecording = { blob: sourceBlob, url, mimeType: sourceBlob.type, size: sourceBlob.size }; nativeAudio.src = url; nativeAudio.load(); debug("temporary-recording-created", { requestedMimeType: requestedMimeType || "browser default", recorderMimeType: recorder.mimeType, chunkCount: chunks.length, chunkTypes: chunks.map((chunk) => chunk.type), blobSize: sourceBlob.size, blobType: sourceBlob.type, url, canPlayType: nativeAudio.canPlayType(sourceBlob.type) }); const validRecording = sourceBlob.size > 0 && Boolean(url) && recorder.state === "inactive"; preview.disabled = !validRecording; redo.disabled = !validRecording; save.disabled = !validRecording; row.querySelector(".controlled-audio-file").textContent = `Recording ready · ${sourceBlob.size} bytes · ${sourceBlob.type}`; }); recorder.start(); debug("recording-started"); record.disabled = true; stop.disabled = false; row.classList.add("is-recording"); row.querySelector(".controlled-audio-file").textContent = "Recording…"; } catch (error) { debug("microphone-error", { message: error.message }); row.querySelector(".controlled-audio-file").textContent = `Microphone unavailable: ${error.message}`; } });
      stop.addEventListener("click", () => { if (recorder && recorder.state !== "inactive") recorder.stop(); record.disabled = false; stop.disabled = true; row.classList.remove("is-recording"); });
      preview.addEventListener("click", () => { if (!temporaryRecording?.url) { debug("play-click-without-recording"); return; } debug("play-click", { url: temporaryRecording.url, blobSize: temporaryRecording.size, mimeType: temporaryRecording.mimeType }); recordingAudio?.pause(); if (!recordingAudio) recordingAudio = new root.Audio(); recordingAudio.src = temporaryRecording.url; recordingAudio.load(); recordingAudio.currentTime = 0; const promise = recordingAudio.play(); promise?.then(() => debug("play-started", { readyState: recordingAudio.readyState, networkState: recordingAudio.networkState })).catch((error) => { debug("play-rejected", { message: error.message, readyState: recordingAudio.readyState, networkState: recordingAudio.networkState, mediaError: recordingAudio.error?.code || null }); row.querySelector(".controlled-audio-file").textContent = `Playback error: ${error.message}`; }); });
      redo.addEventListener("click", () => { recordingAudio?.pause(); if (temporaryRecording?.url) { debug("redo-revoke", { url: temporaryRecording.url }); URL.revokeObjectURL(temporaryRecording.url); } temporaryRecording = null; nativeAudio.removeAttribute("src"); nativeAudio.load(); preview.disabled = true; redo.disabled = true; save.disabled = true; row.querySelector(".controlled-audio-file").textContent = `Ready to record · Save as ${item.proposedFilename}`; });
      save.addEventListener("click", () => { if (temporaryRecording?.blob && temporaryRecording.size > 0 && temporaryRecording.url) { const filename = `${key}.${recordingExtension(temporaryRecording.mimeType)}`; downloadRecording(temporaryRecording.blob, filename); row.querySelector(".controlled-audio-file").textContent = `Saved/downloaded: ${filename} · place in audio/morphemes/${filename}`; } });
      select.value = reviewBatch === "final-redos" ? "Approved" : (stored[key] || "Pending review");
      select.addEventListener("change", () => { stored[key] = select.value; try { root.localStorage?.setItem("firstVoloControlledAudioPilotReview:v1", JSON.stringify(stored)); } catch (_) {} });
      row.querySelector(".controlled-audio-file").textContent = "Checking " + item.proposedFilename + "…";
      isControlledClipInstalled(key).then((installed) => {
        row.querySelector(".controlled-audio-file").textContent = installed ? "Installed" : "Missing";
        play.disabled = !installed;
        if (installed) play.addEventListener("click", () => playControlledClip(key, `${reviewBatch}-${Date.now()}`).catch((error) => { row.querySelector(".controlled-audio-file").textContent = error.message; }));
      });
      list.append(row);
    });
    panel.querySelector("header button").addEventListener("click", () => panel.remove());
    const style = document.createElement("style");
    style.textContent = `.controlled-audio-pilot-review{position:fixed;inset:5vh 7vw;z-index:9100;overflow:hidden;border:3px solid #bcd9ee;border-radius:22px;background:#f8fbfe;box-shadow:0 20px 70px #1b304c99;font-family:inherit;color:#284967}.controlled-audio-pilot-review header{display:flex;justify-content:space-between;gap:18px;padding:16px 20px;background:linear-gradient(135deg,#426f9a,#86b9d3);color:#fff}.controlled-audio-pilot-review h2{margin:3px 0;font-size:1.3rem}.controlled-audio-pilot-review p{margin:3px 0;font-size:.82rem}.controlled-audio-pilot-review header button{align-self:start;padding:8px 13px;border:1px solid #fff;border-radius:999px;background:#ffffff22;color:#fff;font:inherit;font-weight:800}.controlled-audio-pilot-list{display:grid;gap:8px;overflow:auto;height:calc(100% - 106px);padding:14px}.controlled-audio-pilot-row{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:12px 14px;border:1px solid #c5d7e5;border-radius:12px;background:#fff}.controlled-audio-pilot-row>div:first-child{display:grid;gap:3px}.controlled-audio-pilot-row strong{font-size:1.05rem}.controlled-audio-pilot-row small{color:#5b7190}.controlled-audio-pilot-actions{display:flex;align-items:center;gap:8px;flex:none}.controlled-audio-pilot-actions button{padding:8px 12px;border:0;border-radius:999px;background:#7150a5;color:#fff;font:inherit;font-weight:800}.controlled-audio-pilot-actions button:disabled{opacity:.45}.controlled-audio-pilot-actions select{padding:8px;border:1px solid #b8cad9;border-radius:8px;background:#fff;font:inherit}@media(max-width:700px){.controlled-audio-pilot-review{inset:2vh 2vw}.controlled-audio-pilot-row{align-items:stretch;flex-direction:column}.controlled-audio-pilot-actions{justify-content:space-between}}`;
    document.head.append(style);
    document.body.append(panel);
  }
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => { setupReview(); setupPilotReview(); }, { once: true });
    else { setupReview(); setupPilotReview(); }
  }
})(typeof window !== "undefined" ? window : globalThis);
