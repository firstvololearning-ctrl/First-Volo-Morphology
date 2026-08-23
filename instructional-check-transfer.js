"use strict";

/*
  First Volo Morphology — Program-Wide Protected Check Transfer

  This bank covers every currently taught prefix, root, and suffix
  target in the student program, plus the current COOK and VIEW
  family base targets used by teacher-led materials.

  Rules:
  - exact target match;
  - whole transfer word is reserved from ordinary practice;
  - no formal Pre/Post or Migration Challenge overlap;
  - previously encountered whole words are skipped;
  - first attempt has no morphology cue;
  - morpheme recognition and whole-word inference are recorded separately.
*/

(function initializeFirstVoloCheckTransfer() {

  const CORE_TARGET_IDS = Object.freeze([
    "un",
    "re",
    "negative-in-family",
    "dis",
    "en-em",
    "non",
    "location-in-family",
    "over",
    "mis",
    "sub",
    "pre",
    "inter",
    "fore",
    "de",
    "trans",
    "super",
    "semi",
    "anti",
    "mid",
    "under",
    "ab",
    "a-ad",
    "con-com",
    "e-ex",
    "pro",
    "retro",
    "circum",
    "bio",
    "chron",
    "duct",
    "fer",
    "ject",
    "mit",
    "pel",
    "pend",
    "port",
    "pos",
    "put",
    "rupt",
    "scrib",
    "sequ",
    "spect",
    "struct",
    "ten",
    "tract",
    "val",
    "ven",
    "vert",
    "voc",
    "act",
    "aud",
    "cred",
    "dict",
    "form",
    "graph",
    "mot",
    "vis",
    "micro",
    "tele",
    "auto",
    "biblio",
    "derma",
    "phon",
    "scop",
    "metr",
    "therm",
    "geo",
    "terr",
    "al",
    "ance",
    "ence",
    "ic",
    "ity",
    "ive",
    "ist",
    "ize",
    "ify",
    "ness",
    "ology",
    "able-ible",
    "ed",
    "er-or",
    "er-more",
    "est",
    "ful",
    "ing",
    "ion",
    "less",
    "ly",
    "ment",
    "ous",
    "ant-ent",
    "s-es",
    "cook",
    "view",
  ]);

  const BANK = Object.freeze({
    "un": Object.freeze({
      targetIds: Object.freeze(["un"]),
      targetLabels: Object.freeze(["un-"]),
      gradeBands: Object.freeze(["2-3", "4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-un-01",
          word: "unfasten",
          sentence: "Before packing the tent, Leo had to unfasten the straps and release them.",
          expectedMeaning: "undo a fastening; make no longer fastened"
        }),
        Object.freeze({
          id: "ct-un-02",
          word: "untangle",
          sentence: "Mina worked slowly to untangle the string until none of the knots were left.",
          expectedMeaning: "remove tangles; make no longer tangled"
        }),
      ])
    }),
    "re": Object.freeze({
      targetIds: Object.freeze(["re"]),
      targetLabels: Object.freeze(["re-"]),
      gradeBands: Object.freeze(["2-3", "4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-re-01",
          word: "repaint",
          sentence: "The first coat was too light, so we decided to repaint the sign.",
          expectedMeaning: "paint again"
        }),
        Object.freeze({
          id: "ct-re-02",
          word: "recheck",
          sentence: "Before turning in the answer, Luis stopped to recheck his work.",
          expectedMeaning: "check again"
        }),
      ])
    }),
    "negative-in-family": Object.freeze({
      targetIds: Object.freeze(["negative-in-family"]),
      targetLabels: Object.freeze(["in-, im-, il-, ir-"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-negative-in-family-01",
          word: "incomplete",
          sentence: "The model was incomplete because two important pieces were still missing.",
          expectedMeaning: "not complete"
        }),
        Object.freeze({
          id: "ct-negative-in-family-02",
          word: "impatient",
          sentence: "After waiting a long time, the impatient crowd became restless.",
          expectedMeaning: "not patient"
        }),
      ])
    }),
    "dis": Object.freeze({
      targetIds: Object.freeze(["dis"]),
      targetLabels: Object.freeze(["dis-"]),
      gradeBands: Object.freeze(["2-3", "4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-dis-01",
          word: "disassemble",
          sentence: "We had to disassemble the shelf before moving it to the other room.",
          expectedMeaning: "take apart"
        }),
        Object.freeze({
          id: "ct-dis-02",
          word: "distrust",
          sentence: "After the website was wrong twice, Nia began to distrust it.",
          expectedMeaning: "not trust"
        }),
      ])
    }),
    "en-em": Object.freeze({
      targetIds: Object.freeze(["en-em"]),
      targetLabels: Object.freeze(["en-, em-"]),
      gradeBands: Object.freeze(["2-3", "4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-en-em-01",
          word: "encase",
          sentence: "The museum will encase the fragile fossil in glass so it is protected inside.",
          expectedMeaning: "put into or surround with a case"
        }),
        Object.freeze({
          id: "ct-en-em-02",
          word: "embolden",
          sentence: "The first small success seemed to embolden the team and make them more confident.",
          expectedMeaning: "cause to become bolder"
        }),
      ])
    }),
    "non": Object.freeze({
      targetIds: Object.freeze(["non"]),
      targetLabels: Object.freeze(["non-"]),
      gradeBands: Object.freeze(["2-3", "4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-non-01",
          word: "nonrenewable",
          sentence: "Coal is called nonrenewable because it cannot be replaced quickly after it is used.",
          expectedMeaning: "not renewable"
        }),
        Object.freeze({
          id: "ct-non-02",
          word: "nonslip",
          sentence: "The tray has a nonslip surface so the cups do not slide.",
          expectedMeaning: "not likely to slip"
        }),
      ])
    }),
    "location-in-family": Object.freeze({
      targetIds: Object.freeze(["location-in-family"]),
      targetLabels: Object.freeze(["in-, im-"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-location-in-family-01",
          word: "inject",
          sentence: "The machine can inject dye into the water so the flow is easier to see.",
          expectedMeaning: "put or send into"
        }),
        Object.freeze({
          id: "ct-location-in-family-02",
          word: "implant",
          sentence: "The doctor used a tiny implant during the procedure.",
          expectedMeaning: "put or place into or inside"
        }),
      ])
    }),
    "over": Object.freeze({
      targetIds: Object.freeze(["over"]),
      targetLabels: Object.freeze(["over-"]),
      gradeBands: Object.freeze(["2-3", "4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-over-01",
          word: "overfill",
          sentence: "Maya stopped pouring so she would not overfill the cup.",
          expectedMeaning: "fill too much"
        }),
        Object.freeze({
          id: "ct-over-02",
          word: "overwater",
          sentence: "If you overwater the plant every day, its roots may begin to rot.",
          expectedMeaning: "give too much water"
        }),
      ])
    }),
    "mis": Object.freeze({
      targetIds: Object.freeze(["mis"]),
      targetLabels: Object.freeze(["mis-"]),
      gradeBands: Object.freeze(["2-3", "4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-mis-01",
          word: "miscalculate",
          sentence: "If you miscalculate the total, your answer may be off by several dollars.",
          expectedMeaning: "calculate incorrectly"
        }),
        Object.freeze({
          id: "ct-mis-02",
          word: "mispronounce",
          sentence: "Tariq asked for help because he did not want to mispronounce the unfamiliar name.",
          expectedMeaning: "pronounce incorrectly"
        }),
      ])
    }),
    "sub": Object.freeze({
      targetIds: Object.freeze(["sub", "sup"]),
      targetLabels: Object.freeze(["sub-"]),
      gradeBands: Object.freeze(["2-3", "4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-sub-01",
          word: "subfloor",
          sentence: "Workers repaired the subfloor before installing the wood boards.",
          expectedMeaning: "a floor or layer underneath another floor"
        }),
        Object.freeze({
          id: "ct-sub-02",
          word: "subzero",
          sentence: "The hikers wore extra layers during the subzero morning.",
          expectedMeaning: "below zero"
        }),
      ])
    }),
    "pre": Object.freeze({
      targetIds: Object.freeze(["pre"]),
      targetLabels: Object.freeze(["pre-"]),
      gradeBands: Object.freeze(["2-3", "4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-pre-01",
          word: "prewrite",
          sentence: "Maya used a prewrite page for her essay.",
          expectedMeaning: "write or plan before the main writing"
        }),
        Object.freeze({
          id: "ct-pre-02",
          word: "prepack",
          sentence: "The class will prepack the art supplies the day before the field trip.",
          expectedMeaning: "pack ahead of time"
        }),
      ])
    }),
    "inter": Object.freeze({
      targetIds: Object.freeze(["inter"]),
      targetLabels: Object.freeze(["inter-"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-inter-01",
          word: "interconnect",
          sentence: "New walkways interconnect the three school buildings.",
          expectedMeaning: "connect between or among"
        }),
        Object.freeze({
          id: "ct-inter-02",
          word: "intermix",
          sentence: "The artist chose to intermix blue and green pieces throughout the mosaic.",
          expectedMeaning: "mix among one another"
        }),
      ])
    }),
    "fore": Object.freeze({
      targetIds: Object.freeze(["fore"]),
      targetLabels: Object.freeze(["fore-"]),
      gradeBands: Object.freeze(["2-3", "4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-fore-01",
          word: "foreword",
          sentence: "Maya read the foreword on the first pages of the book.",
          expectedMeaning: "a section placed before the main text"
        }),
        Object.freeze({
          id: "ct-fore-02",
          word: "forewarn",
          sentence: "The weather service tried to forewarn residents before the storm arrived.",
          expectedMeaning: "warn beforehand"
        }),
      ])
    }),
    "de": Object.freeze({
      targetIds: Object.freeze(["de"]),
      targetLabels: Object.freeze(["de-"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-de-01",
          word: "dehydrate",
          sentence: "The fruit became lighter after the machine dehydrated it.",
          expectedMeaning: "remove water or moisture from"
        }),
        Object.freeze({
          id: "ct-de-02",
          word: "devalue",
          sentence: "A deep scratch can devalue a rare coin by making it worth less.",
          expectedMeaning: "lower the value of"
        }),
      ])
    }),
    "trans": Object.freeze({
      targetIds: Object.freeze(["trans"]),
      targetLabels: Object.freeze(["trans-"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-trans-01",
          word: "transcontinental",
          sentence: "The family took a transcontinental train trip from New York to California.",
          expectedMeaning: "across a continent"
        }),
        Object.freeze({
          id: "ct-trans-02",
          word: "transpacific",
          sentence: "The plane began a transpacific flight from California to Japan.",
          expectedMeaning: "across the Pacific Ocean"
        }),
      ])
    }),
    "super": Object.freeze({
      targetIds: Object.freeze(["super"]),
      targetLabels: Object.freeze(["super-"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-super-01",
          word: "superimpose",
          sentence: "The designer used software to superimpose two images.",
          expectedMeaning: "place one thing over another"
        }),
        Object.freeze({
          id: "ct-super-02",
          word: "superheat",
          sentence: "The class watched the teacher superheat the liquid in a safe container.",
          expectedMeaning: "heat beyond the usual level"
        }),
      ])
    }),
    "semi": Object.freeze({
      targetIds: Object.freeze(["semi"]),
      targetLabels: Object.freeze(["semi-"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-semi-01",
          word: "semitransparent",
          sentence: "The curtain was semitransparent, so some light passed through but the view was not clear.",
          expectedMeaning: "partly transparent"
        }),
        Object.freeze({
          id: "ct-semi-02",
          word: "semiconscious",
          sentence: "After waking from the procedure, he was semiconscious and answered only a few questions.",
          expectedMeaning: "partly conscious"
        }),
      ])
    }),
    "anti": Object.freeze({
      targetIds: Object.freeze(["anti"]),
      targetLabels: Object.freeze(["anti-"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-anti-01",
          word: "antiviral",
          sentence: "The doctor prescribed an antiviral medicine during the illness.",
          expectedMeaning: "against viruses"
        }),
        Object.freeze({
          id: "ct-anti-02",
          word: "antiwar",
          sentence: "The group organized an antiwar march because its members opposed the war.",
          expectedMeaning: "against war"
        }),
      ])
    }),
    "mid": Object.freeze({
      targetIds: Object.freeze(["mid"]),
      targetLabels: Object.freeze(["mid-"]),
      gradeBands: Object.freeze(["2-3", "4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-mid-01",
          word: "midsummer",
          sentence: "By midsummer, the garden was full of tomatoes and sunflowers.",
          expectedMeaning: "the middle of summer"
        }),
        Object.freeze({
          id: "ct-mid-02",
          word: "midair",
          sentence: "The bird caught the insect in midair before either reached the ground.",
          expectedMeaning: "in the middle of the air"
        }),
      ])
    }),
    "under": Object.freeze({
      targetIds: Object.freeze(["under"]),
      targetLabels: Object.freeze(["under-"]),
      gradeBands: Object.freeze(["2-3", "4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-under-01",
          word: "underfill",
          sentence: "If the machine underfills the bottle, there will not be enough juice inside.",
          expectedMeaning: "fill too little"
        }),
        Object.freeze({
          id: "ct-under-02",
          word: "underpay",
          sentence: "The company discovered it had underpaid the worker and sent the missing money.",
          expectedMeaning: "pay too little"
        }),
      ])
    }),
    "ab": Object.freeze({
      targetIds: Object.freeze(["ab"]),
      targetLabels: Object.freeze(["ab-"]),
      gradeBands: Object.freeze(["6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-ab-01",
          word: "abstain",
          sentence: "During the vote, one member chose to abstain.",
          expectedMeaning: "hold oneself away from an action"
        }),
        Object.freeze({
          id: "ct-ab-02",
          word: "abscond",
          sentence: "In the story, the thief tried to abscond before the police arrived.",
          expectedMeaning: "go away or escape"
        }),
      ])
    }),
    "a-ad": Object.freeze({
      targetIds: Object.freeze(["a-ad", "ad"]),
      targetLabels: Object.freeze(["a-, ad-"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-a-ad-01",
          word: "attach",
          sentence: "Please attach the name tag to the folder.",
          expectedMeaning: "join or fasten to"
        }),
        Object.freeze({
          id: "ct-a-ad-02",
          word: "approach",
          sentence: "As the hikers approach the cabin, they can see the porch more clearly.",
          expectedMeaning: "move toward"
        }),
      ])
    }),
    "con-com": Object.freeze({
      targetIds: Object.freeze(["con-com"]),
      targetLabels: Object.freeze(["con-, com-"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-con-com-01",
          word: "compress",
          sentence: "The machine will compress the foam so it fits in the box.",
          expectedMeaning: "press together"
        }),
        Object.freeze({
          id: "ct-con-com-02",
          word: "converge",
          sentence: "The two paths converge near the river.",
          expectedMeaning: "come together"
        }),
      ])
    }),
    "e-ex": Object.freeze({
      targetIds: Object.freeze(["e-ex", "ex"]),
      targetLabels: Object.freeze(["e-, ex-"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-e-ex-01",
          word: "exhale",
          sentence: "After taking a deep breath in, Jonah began to exhale slowly until the air was out.",
          expectedMeaning: "breathe out"
        }),
        Object.freeze({
          id: "ct-e-ex-02",
          word: "expel",
          sentence: "The filter is designed to expel trapped air from the tube.",
          expectedMeaning: "push or send out"
        }),
      ])
    }),
    "pro": Object.freeze({
      targetIds: Object.freeze(["pro"]),
      targetLabels: Object.freeze(["pro-"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-pro-01",
          word: "protrude",
          sentence: "A branch began to protrude from the side of the hedge.",
          expectedMeaning: "stick or extend forward"
        }),
        Object.freeze({
          id: "ct-pro-02",
          word: "proceeding",
          sentence: "After the signal changed, the train was proceeding along the track.",
          expectedMeaning: "moving forward"
        }),
      ])
    }),
    "retro": Object.freeze({
      targetIds: Object.freeze(["retro"]),
      targetLabels: Object.freeze(["retro-"]),
      gradeBands: Object.freeze(["6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-retro-01",
          word: "retrograde",
          sentence: "The diagram showed retrograde motion during part of the orbit.",
          expectedMeaning: "moving backward"
        }),
        Object.freeze({
          id: "ct-retro-02",
          word: "retroreflective",
          sentence: "The runner wore a vest with retroreflective strips at night.",
          expectedMeaning: "reflecting light back"
        }),
      ])
    }),
    "circum": Object.freeze({
      targetIds: Object.freeze(["circum"]),
      targetLabels: Object.freeze(["circum-"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-circum-01",
          word: "circumpolar",
          sentence: "The class used a star map to find circumpolar stars near the North Star.",
          expectedMeaning: "around a pole"
        }),
        Object.freeze({
          id: "ct-circum-02",
          word: "circumstellar",
          sentence: "The telescope detected a circumstellar disk near a distant star.",
          expectedMeaning: "around a star"
        }),
      ])
    }),
    "bio": Object.freeze({
      targetIds: Object.freeze(["bio"]),
      targetLabels: Object.freeze(["bio"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-bio-01",
          word: "biosphere",
          sentence: "The class discussed how pollution affects the biosphere.",
          expectedMeaning: "the region of life or living things"
        }),
        Object.freeze({
          id: "ct-bio-02",
          word: "bioluminescent",
          sentence: "The divers saw a bioluminescent jellyfish in the dark water.",
          expectedMeaning: "producing light through a living organism"
        }),
      ])
    }),
    "chron": Object.freeze({
      targetIds: Object.freeze(["chron"]),
      targetLabels: Object.freeze(["chron"]),
      gradeBands: Object.freeze(["6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-chron-01",
          word: "chronometer",
          sentence: "The sailor checked a chronometer before recording the ship's position.",
          expectedMeaning: "a device that measures time"
        }),
        Object.freeze({
          id: "ct-chron-02",
          word: "chronograph",
          sentence: "The athlete checked a chronograph after the race.",
          expectedMeaning: "an instrument that records time"
        }),
      ])
    }),
    "duct": Object.freeze({
      targetIds: Object.freeze(["duct"]),
      targetLabels: Object.freeze(["duct/duce"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-duct-01",
          word: "aqueduct",
          sentence: "The old aqueduct stretched from the hills to the city.",
          expectedMeaning: "a structure that leads or carries water"
        }),
        Object.freeze({
          id: "ct-duct-02",
          word: "ductwork",
          sentence: "Workers repaired the ductwork above the ceiling.",
          expectedMeaning: "a system of passages that leads air"
        }),
      ])
    }),
    "fer": Object.freeze({
      targetIds: Object.freeze(["fer"]),
      targetLabels: Object.freeze(["fer"]),
      gradeBands: Object.freeze(["6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-fer-01",
          word: "transferable",
          sentence: "The ticket is transferable if another person needs to use it.",
          expectedMeaning: "able to be transferred or carried from one to another"
        }),
        Object.freeze({
          id: "ct-fer-02",
          word: "transferral",
          sentence: "The transferral of the records took place between two offices.",
          expectedMeaning: "the act of transferring or carrying from one place to another"
        }),
      ])
    }),
    "ject": Object.freeze({
      targetIds: Object.freeze(["ject"]),
      targetLabels: Object.freeze(["ject"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-ject-01",
          word: "projectile",
          sentence: "The small foam projectile landed on the floor after it left the launcher.",
          expectedMeaning: "an object that is thrown or sent forward",
          nonTargetSupports: Object.freeze([
            Object.freeze({
              part: "pro-",
              meaning: "forward",
              role: "prefix",
              timing: "after-independent-attempt"
            })
          ])
        }),
        Object.freeze({
          id: "ct-ject-02",
          word: "injector",
          sentence: "The injector sat beside the tube before the liquid test began.",
          expectedMeaning: "a device that sends something into",
          nonTargetSupports: Object.freeze([
            Object.freeze({
              part: "in-",
              meaning: "in; into",
              role: "prefix",
              timing: "after-independent-attempt"
            }),
            Object.freeze({
              part: "-or",
              meaning: "a person or thing that does something",
              role: "suffix",
              timing: "after-independent-attempt"
            })
          ])
        }),
      ])
    }),
    "mit": Object.freeze({
      targetIds: Object.freeze(["mit"]),
      targetLabels: Object.freeze(["mit"]),
      gradeBands: Object.freeze(["6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-mit-01",
          word: "transmitter",
          sentence: "The radio transmitter sat on top of the tower.",
          expectedMeaning: "a device that sends"
        }),
        Object.freeze({
          id: "ct-mit-02",
          word: "emission",
          sentence: "The sensor measured the lamp's emission during the test.",
          expectedMeaning: "something sent out"
        }),
      ])
    }),
    "pel": Object.freeze({
      targetIds: Object.freeze(["pel"]),
      targetLabels: Object.freeze(["pel"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-pel-01",
          word: "propeller",
          sentence: "The boat's propeller spun faster as it left the dock.",
          expectedMeaning: "a device that pushes or drives"
        }),
        Object.freeze({
          id: "ct-pel-02",
          word: "repellent",
          sentence: "The campers used a repellent before walking into the woods.",
          expectedMeaning: "something that drives away"
        }),
      ])
    }),
    "pend": Object.freeze({
      targetIds: Object.freeze(["pend"]),
      targetLabels: Object.freeze(["pend/pens"]),
      gradeBands: Object.freeze(["6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-pend-01",
          word: "pendulous",
          sentence: "The tree had long pendulous branches.",
          expectedMeaning: "hanging downward"
        }),
        Object.freeze({
          id: "ct-pend-02",
          word: "suspension",
          sentence: "Workers checked the bridge's suspension cables.",
          expectedMeaning: "a system or state of hanging and holding"
        }),
      ])
    }),
    "port": Object.freeze({
      targetIds: Object.freeze(["port"]),
      targetLabels: Object.freeze(["port"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-port-01",
          word: "portage",
          sentence: "The canoeists began a portage between two lakes.",
          expectedMeaning: "the act of carrying over land"
        }),
        Object.freeze({
          id: "ct-port-02",
          word: "portability",
          sentence: "The laptop's portability was useful during the trip.",
          expectedMeaning: "the quality of being easy to carry"
        }),
      ])
    }),
    "pos": Object.freeze({
      targetIds: Object.freeze(["pos"]),
      targetLabels: Object.freeze(["pos"]),
      gradeBands: Object.freeze(["6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-pos-01",
          word: "juxtaposition",
          sentence: "The artist used juxtaposition in a display of old and new photographs.",
          expectedMeaning: "the act of placing things side by side"
        }),
        Object.freeze({
          id: "ct-pos-02",
          word: "deposition",
          sentence: "The river's deposition changed the shape of the bank.",
          expectedMeaning: "the placing down of material"
        }),
      ])
    }),
    "put": Object.freeze({
      targetIds: Object.freeze(["put"]),
      targetLabels: Object.freeze(["put"]),
      gradeBands: Object.freeze(["6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-put-01",
          word: "computable",
          sentence: "The answer is computable with the information in the table.",
          expectedMeaning: "able to be calculated"
        }),
        Object.freeze({
          id: "ct-put-02",
          word: "recomputation",
          sentence: "A recomputation of the total gave a different answer.",
          expectedMeaning: "the act of calculating again"
        }),
      ])
    }),
    "rupt": Object.freeze({
      targetIds: Object.freeze(["rupt"]),
      targetLabels: Object.freeze(["rupt"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-rupt-01",
          word: "ruptured",
          sentence: "The pipe ruptured during the storm.",
          expectedMeaning: "broke open"
        }),
        Object.freeze({
          id: "ct-rupt-02",
          word: "disruptive",
          sentence: "The disruptive noise made it hard for the class to work.",
          expectedMeaning: "causing an interruption or break"
        }),
      ])
    }),
    "scrib": Object.freeze({
      targetIds: Object.freeze(["scrib"]),
      targetLabels: Object.freeze(["scrib/script"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-scrib-01",
          word: "inscription",
          sentence: "The inscription was carved into the stone.",
          expectedMeaning: "writing placed on or in something"
        }),
        Object.freeze({
          id: "ct-scrib-02",
          word: "transcription",
          sentence: "The student made a transcription by writing down the exact spoken words.",
          expectedMeaning: "a written copy or record"
        }),
      ])
    }),
    "sequ": Object.freeze({
      targetIds: Object.freeze(["sequ"]),
      targetLabels: Object.freeze(["sequ"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-sequ-01",
          word: "sequel",
          sentence: "Maya borrowed the sequel after finishing the first book.",
          expectedMeaning: "something that follows"
        }),
        Object.freeze({
          id: "ct-sequ-02",
          word: "sequential",
          sentence: "The teacher numbered the sequential steps from 1 to 6.",
          expectedMeaning: "following in order"
        }),
      ])
    }),
    "spect": Object.freeze({
      targetIds: Object.freeze(["spect"]),
      targetLabels: Object.freeze(["spect"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-spect-01",
          word: "spectate",
          sentence: "Families gathered beside the field to spectate during the race.",
          expectedMeaning: "watch"
        }),
        Object.freeze({
          id: "ct-spect-02",
          word: "spectacle",
          sentence: "The fireworks created a bright spectacle over the park.",
          expectedMeaning: "something striking to look at"
        }),
      ])
    }),
    "struct": Object.freeze({
      targetIds: Object.freeze(["struct"]),
      targetLabels: Object.freeze(["struct"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-struct-01",
          word: "structural",
          sentence: "Workers checked the structural beams under the bridge.",
          expectedMeaning: "related to the structure or build of something"
        }),
        Object.freeze({
          id: "ct-struct-02",
          word: "deconstruct",
          sentence: "The class will deconstruct the model during science.",
          expectedMeaning: "take apart something that was built"
        }),
      ])
    }),
    "ten": Object.freeze({
      targetIds: Object.freeze(["ten"]),
      targetLabels: Object.freeze(["ten"]),
      gradeBands: Object.freeze(["6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-ten-01",
          word: "tenacity",
          sentence: "Her tenacity helped her keep working when the task was difficult.",
          expectedMeaning: "the quality of holding on firmly"
        }),
        Object.freeze({
          id: "ct-ten-02",
          word: "retentive",
          sentence: "The soil stayed moist because it was retentive.",
          expectedMeaning: "able to hold or retain"
        }),
      ])
    }),
    "tract": Object.freeze({
      targetIds: Object.freeze(["tract"]),
      targetLabels: Object.freeze(["tract"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-tract-01",
          word: "traction",
          sentence: "The rough tires gave the bicycle better traction on the wet road.",
          expectedMeaning: "grip or pulling force"
        }),
        Object.freeze({
          id: "ct-tract-02",
          word: "retraction",
          sentence: "The turtle's retraction of its head happened when it heard a loud sound.",
          expectedMeaning: "the act of pulling back"
        }),
      ])
    }),
    "val": Object.freeze({
      targetIds: Object.freeze(["val"]),
      targetLabels: Object.freeze(["val"]),
      gradeBands: Object.freeze(["6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-val-01",
          word: "valuation",
          sentence: "The expert completed a valuation before the painting was sold.",
          expectedMeaning: "an estimate of worth or value"
        }),
        Object.freeze({
          id: "ct-val-02",
          word: "validity",
          sentence: "The team questioned the validity of the claim and whether it was strong enough to trust.",
          expectedMeaning: "the quality of being sound or worthy of acceptance"
        }),
      ])
    }),
    "ven": Object.freeze({
      targetIds: Object.freeze(["ven"]),
      targetLabels: Object.freeze(["ven/vent"]),
      gradeBands: Object.freeze(["6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-ven-01",
          word: "advent",
          sentence: "People noticed longer days near the advent of spring.",
          expectedMeaning: "the coming or arrival of something"
        }),
        Object.freeze({
          id: "ct-ven-02",
          word: "convene",
          sentence: "The committee will convene in the library at noon.",
          expectedMeaning: "come together"
        }),
      ])
    }),
    "vert": Object.freeze({
      targetIds: Object.freeze(["vert"]),
      targetLabels: Object.freeze(["vert"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-vert-01",
          word: "converted",
          sentence: "The old factory was converted into apartments last year.",
          expectedMeaning: "turned or changed into another form"
        }),
        Object.freeze({
          id: "ct-vert-02",
          word: "diverting",
          sentence: "Workers are diverting traffic near the closed road.",
          expectedMeaning: "turning away"
        }),
      ])
    }),
    "voc": Object.freeze({
      targetIds: Object.freeze(["voc"]),
      targetLabels: Object.freeze(["voc"]),
      gradeBands: Object.freeze(["6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-voc-01",
          word: "vocation",
          sentence: "Teaching became her vocation after she finished college.",
          expectedMeaning: "a calling or type of work one feels called to"
        }),
        Object.freeze({
          id: "ct-voc-02",
          word: "invocation",
          sentence: "The ceremony began with an invocation led by the principal.",
          expectedMeaning: "a calling upon or appeal"
        }),
      ])
    }),
    "act": Object.freeze({
      targetIds: Object.freeze(["act"]),
      targetLabels: Object.freeze(["act"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-act-01",
          word: "enactment",
          sentence: "The enactment of the new rule happened on Monday.",
          expectedMeaning: "the act of putting something into action"
        }),
        Object.freeze({
          id: "ct-act-02",
          word: "actionable",
          sentence: "The team wanted actionable advice before making a decision.",
          expectedMeaning: "able to be acted on"
        }),
      ])
    }),
    "aud": Object.freeze({
      targetIds: Object.freeze(["aud"]),
      targetLabels: Object.freeze(["aud"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-aud-01",
          word: "audition",
          sentence: "During the audition, the judges listened carefully to each singer.",
          expectedMeaning: "a tryout in which someone is heard"
        }),
        Object.freeze({
          id: "ct-aud-02",
          word: "auditory",
          sentence: "The lesson included an auditory clue along with a picture.",
          expectedMeaning: "related to hearing"
        }),
      ])
    }),
    "cred": Object.freeze({
      targetIds: Object.freeze(["cred"]),
      targetLabels: Object.freeze(["cred"]),
      gradeBands: Object.freeze(["6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-cred-01",
          word: "credibility",
          sentence: "The scientist's careful evidence increased the credibility of the explanation.",
          expectedMeaning: "the quality of being believable or trustworthy"
        }),
        Object.freeze({
          id: "ct-cred-02",
          word: "credential",
          sentence: "The visitor showed a credential at the front desk.",
          expectedMeaning: "evidence that helps establish trust or qualification"
        }),
      ])
    }),
    "dict": Object.freeze({
      targetIds: Object.freeze(["dict"]),
      targetLabels: Object.freeze(["dict"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-dict-01",
          word: "dictate",
          sentence: "The teacher will dictate the sentence while students write.",
          expectedMeaning: "say or tell aloud"
        }),
        Object.freeze({
          id: "ct-dict-02",
          word: "dictation",
          sentence: "During dictation, the students listened and wrote in their notebooks.",
          expectedMeaning: "spoken words that are said for someone to write"
        }),
      ])
    }),
    "form": Object.freeze({
      targetIds: Object.freeze(["form"]),
      targetLabels: Object.freeze(["form"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-form-01",
          word: "formative",
          sentence: "The early sketch was formative for the final design.",
          expectedMeaning: "helping shape or form something"
        }),
        Object.freeze({
          id: "ct-form-02",
          word: "deformable",
          sentence: "The engineer tested the deformable material by pressing it.",
          expectedMeaning: "able to have its shape changed"
        }),
      ])
    }),
    "graph": Object.freeze({
      targetIds: Object.freeze(["graph"]),
      targetLabels: Object.freeze(["graph"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-graph-01",
          word: "seismograph",
          sentence: "The seismograph was running when the ground shook.",
          expectedMeaning: "an instrument that records earthquake motion"
        }),
        Object.freeze({
          id: "ct-graph-02",
          word: "photographic",
          sentence: "The museum displayed a photographic poster from the event.",
          expectedMeaning: "related to recording with photographs"
        }),
      ])
    }),
    "mot": Object.freeze({
      targetIds: Object.freeze(["mot"]),
      targetLabels: Object.freeze(["mot/mov"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-mot-01",
          word: "locomotive",
          sentence: "The conductor inspected the locomotive before the train left the station.",
          expectedMeaning: "a machine that moves a train"
        }),
        Object.freeze({
          id: "ct-mot-02",
          word: "motility",
          sentence: "The scientist watched the cells' motility under a microscope.",
          expectedMeaning: "ability to move"
        }),
      ])
    }),
    "vis": Object.freeze({
      targetIds: Object.freeze(["vis"]),
      targetLabels: Object.freeze(["vis/vid"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-vis-01",
          word: "visibility",
          sentence: "Fog reduced visibility, making it difficult to see the road ahead.",
          expectedMeaning: "the condition of being able to see"
        }),
        Object.freeze({
          id: "ct-vis-02",
          word: "visualization",
          sentence: "The diagram was a visualization that helped students see the data in a new way.",
          expectedMeaning: "a visual representation that makes something seen"
        }),
      ])
    }),
    "micro": Object.freeze({
      targetIds: Object.freeze(["micro"]),
      targetLabels: Object.freeze(["micro"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-micro-01",
          word: "microplastic",
          sentence: "The class found a microplastic in a sample of ocean water.",
          expectedMeaning: "a very small piece of plastic"
        }),
        Object.freeze({
          id: "ct-micro-02",
          word: "microclimate",
          sentence: "The shaded garden had a microclimate that was cooler than the sunny yard.",
          expectedMeaning: "the climate of a small local area"
        }),
      ])
    }),
    "tele": Object.freeze({
      targetIds: Object.freeze(["tele"]),
      targetLabels: Object.freeze(["tele"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-tele-01",
          word: "teleconference",
          sentence: "The two classes held a teleconference so students in distant cities could meet.",
          expectedMeaning: "a conference held across a distance"
        }),
        Object.freeze({
          id: "ct-tele-02",
          word: "telemetry",
          sentence: "The spacecraft used telemetry during the mission.",
          expectedMeaning: "measurement or data sent from far away"
        }),
      ])
    }),
    "auto": Object.freeze({
      targetIds: Object.freeze(["auto"]),
      targetLabels: Object.freeze(["auto"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-auto-01",
          word: "autopilot",
          sentence: "The aircraft used autopilot during part of the flight.",
          expectedMeaning: "a system that controls itself automatically"
        }),
        Object.freeze({
          id: "ct-auto-02",
          word: "autoimmune",
          sentence: "The doctor discussed an autoimmune condition with the family.",
          expectedMeaning: "involving the body's system acting against itself"
        }),
      ])
    }),
    "biblio": Object.freeze({
      targetIds: Object.freeze(["biblio"]),
      targetLabels: Object.freeze(["biblio"]),
      gradeBands: Object.freeze(["6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-biblio-01",
          word: "bibliotherapy",
          sentence: "The counselor suggested bibliotherapy during a weekly group.",
          expectedMeaning: "the use of books as a form of support or therapy"
        }),
        Object.freeze({
          id: "ct-biblio-02",
          word: "bibliometrics",
          sentence: "The librarian used bibliometrics during a research project.",
          expectedMeaning: "measurement and study of books or publications"
        }),
      ])
    }),
    "derma": Object.freeze({
      targetIds: Object.freeze(["derma"]),
      targetLabels: Object.freeze(["derma"]),
      gradeBands: Object.freeze(["6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-derma-01",
          word: "dermatitis",
          sentence: "The doctor examined the dermatitis on Maya's arm.",
          expectedMeaning: "a condition involving inflamed skin"
        }),
        Object.freeze({
          id: "ct-derma-02",
          word: "dermatological",
          sentence: "She made a dermatological appointment at the clinic.",
          expectedMeaning: "related to the skin"
        }),
      ])
    }),
    "phon": Object.freeze({
      targetIds: Object.freeze(["phon"]),
      targetLabels: Object.freeze(["phon/phone"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-phon-01",
          word: "phonetic",
          sentence: "The teacher wrote a phonetic spelling beside the new word.",
          expectedMeaning: "related to speech sounds"
        }),
        Object.freeze({
          id: "ct-phon-02",
          word: "phonology",
          sentence: "The class compared phonology in English and Spanish during a language lesson.",
          expectedMeaning: "the study or system of language sounds"
        }),
      ])
    }),
    "scop": Object.freeze({
      targetIds: Object.freeze(["scop"]),
      targetLabels: Object.freeze(["scop/scope"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-scop-01",
          word: "endoscope",
          sentence: "The doctor prepared an endoscope before the procedure.",
          expectedMeaning: "an instrument used to look inside"
        }),
        Object.freeze({
          id: "ct-scop-02",
          word: "arthroscope",
          sentence: "An arthroscope lets a surgeon look inside a joint through a tiny opening.",
          expectedMeaning: "an instrument used to examine a joint"
        }),
      ])
    }),
    "metr": Object.freeze({
      targetIds: Object.freeze(["metr"]),
      targetLabels: Object.freeze(["metr/meter"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-metr-01",
          word: "barometer",
          sentence: "The class checked the barometer before going outside.",
          expectedMeaning: "an instrument that measures air pressure"
        }),
        Object.freeze({
          id: "ct-metr-02",
          word: "odometer",
          sentence: "The driver checked the odometer before starting the trip.",
          expectedMeaning: "an instrument that measures distance traveled"
        }),
      ])
    }),
    "therm": Object.freeze({
      targetIds: Object.freeze(["therm"]),
      targetLabels: Object.freeze(["therm"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-therm-01",
          word: "thermoregulation",
          sentence: "The coach talked about thermoregulation during practice on a hot day.",
          expectedMeaning: "regulation of heat or temperature"
        }),
        Object.freeze({
          id: "ct-therm-02",
          word: "thermodynamic",
          sentence: "The class observed a thermodynamic change during the lab.",
          expectedMeaning: "related to heat and energy"
        }),
      ])
    }),
    "geo": Object.freeze({
      targetIds: Object.freeze(["geo"]),
      targetLabels: Object.freeze(["geo"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-geo-01",
          word: "geosphere",
          sentence: "The class labeled the geosphere on a science diagram.",
          expectedMeaning: "the solid earth"
        }),
        Object.freeze({
          id: "ct-geo-02",
          word: "geocentric",
          sentence: "The class drew a geocentric model during science.",
          expectedMeaning: "centered on Earth"
        }),
      ])
    }),
    "terr": Object.freeze({
      targetIds: Object.freeze(["terr"]),
      targetLabels: Object.freeze(["terr"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-terr-01",
          word: "terrestrial",
          sentence: "The rover was designed for terrestrial travel instead of ocean travel.",
          expectedMeaning: "related to land or Earth"
        }),
        Object.freeze({
          id: "ct-terr-02",
          word: "terrarium",
          sentence: "The class placed a terrarium near the window.",
          expectedMeaning: "a container for land plants or animals"
        }),
      ])
    }),
    "al": Object.freeze({
      targetIds: Object.freeze(["al"]),
      targetLabels: Object.freeze(["-al"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-al-01",
          word: "tidal",
          sentence: "The class recorded tidal changes at the beach.",
          expectedMeaning: "related to tides"
        }),
        Object.freeze({
          id: "ct-al-02",
          word: "orbital",
          sentence: "The diagram shows orbital motion related to an object's path around another body.",
          expectedMeaning: "related to an orbit"
        }),
      ])
    }),
    "ance": Object.freeze({
      targetIds: Object.freeze(["ance"]),
      targetLabels: Object.freeze(["-ance"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-ance-01",
          word: "reliance",
          sentence: "The hikers' reliance on the map showed how much they depended on it.",
          expectedMeaning: "the state of relying or depending"
        }),
        Object.freeze({
          id: "ct-ance-02",
          word: "avoidance",
          sentence: "Her avoidance of the muddy path meant she kept away from it.",
          expectedMeaning: "the act of avoiding"
        }),
      ])
    }),
    "ence": Object.freeze({
      targetIds: Object.freeze(["ence"]),
      targetLabels: Object.freeze(["-ence"]),
      gradeBands: Object.freeze(["6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-ence-01",
          word: "emergence",
          sentence: "The butterfly's emergence happened while the class was watching.",
          expectedMeaning: "the act or process of emerging"
        }),
        Object.freeze({
          id: "ct-ence-02",
          word: "coherence",
          sentence: "The paragraph's coherence made it easy to read from beginning to end.",
          expectedMeaning: "the quality of holding together clearly"
        }),
      ])
    }),
    "ic": Object.freeze({
      targetIds: Object.freeze(["ic"]),
      targetLabels: Object.freeze(["-ic"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-ic-01",
          word: "aquatic",
          sentence: "The aquarium has several aquatic plants.",
          expectedMeaning: "related to water"
        }),
        Object.freeze({
          id: "ct-ic-02",
          word: "volcanic",
          sentence: "The island contains volcanic rock near the mountain.",
          expectedMeaning: "related to a volcano"
        }),
      ])
    }),
    "ity": Object.freeze({
      targetIds: Object.freeze(["ity"]),
      targetLabels: Object.freeze(["-ity"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-ity-01",
          word: "flexibility",
          sentence: "The material's flexibility allows it to bend without breaking.",
          expectedMeaning: "the quality of being flexible"
        }),
        Object.freeze({
          id: "ct-ity-02",
          word: "stability",
          sentence: "The wide base gives the tower stability and helps it stay steady.",
          expectedMeaning: "the state or quality of being stable"
        }),
      ])
    }),
    "ive": Object.freeze({
      targetIds: Object.freeze(["ive"]),
      targetLabels: Object.freeze(["-ive"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-ive-01",
          word: "protective",
          sentence: "The protective cover kept the tablet safe when it fell.",
          expectedMeaning: "having the quality or purpose of protecting"
        }),
        Object.freeze({
          id: "ct-ive-02",
          word: "persuasive",
          sentence: "Her persuasive explanation was able to convince the group.",
          expectedMeaning: "having the quality of persuading"
        }),
      ])
    }),
    "ist": Object.freeze({
      targetIds: Object.freeze(["ist"]),
      targetLabels: Object.freeze(["-ist"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-ist-01",
          word: "geologist",
          sentence: "The geologist collected rocks near the hill.",
          expectedMeaning: "a person who studies geology"
        }),
        Object.freeze({
          id: "ct-ist-02",
          word: "violinist",
          sentence: "The violinist walked onto the stage before the concert.",
          expectedMeaning: "a person who plays the violin"
        }),
      ])
    }),
    "ize": Object.freeze({
      targetIds: Object.freeze(["ize"]),
      targetLabels: Object.freeze(["-ize"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-ize-01",
          word: "sterilize",
          sentence: "The lab will sterilize the tools before the experiment.",
          expectedMeaning: "make sterile"
        }),
        Object.freeze({
          id: "ct-ize-02",
          word: "digitize",
          sentence: "The library will digitize the old photographs this summer.",
          expectedMeaning: "make digital"
        }),
      ])
    }),
    "ify": Object.freeze({
      targetIds: Object.freeze(["ify"]),
      targetLabels: Object.freeze(["-ify"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-ify-01",
          word: "solidify",
          sentence: "The mixture began to solidify after it was left on the table.",
          expectedMeaning: "make or become solid"
        }),
        Object.freeze({
          id: "ct-ify-02",
          word: "electrify",
          sentence: "The system can electrify the fence by causing it to carry electricity.",
          expectedMeaning: "cause to become electrically charged"
        }),
      ])
    }),
    "ness": Object.freeze({
      targetIds: Object.freeze(["ness"]),
      targetLabels: Object.freeze(["-ness"]),
      gradeBands: Object.freeze(["2-3", "4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-ness-01",
          word: "brightness",
          sentence: "The room's brightness made it easy to read the tiny print.",
          expectedMeaning: "the state or quality of being bright"
        }),
        Object.freeze({
          id: "ct-ness-02",
          word: "readiness",
          sentence: "The team's readiness impressed the coach before the game.",
          expectedMeaning: "the state of being ready"
        }),
      ])
    }),
    "ology": Object.freeze({
      targetIds: Object.freeze(["ology"]),
      targetLabels: Object.freeze(["-ology"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-ology-01",
          word: "meteorology",
          sentence: "Ana chose meteorology for her project about weather.",
          expectedMeaning: "the study of weather"
        }),
        Object.freeze({
          id: "ct-ology-02",
          word: "criminology",
          sentence: "Jamal chose criminology for his project about crime.",
          expectedMeaning: "the study of crime"
        }),
      ])
    }),
    "able-ible": Object.freeze({
      targetIds: Object.freeze(["able-ible", "able"]),
      targetLabels: Object.freeze(["-able, -ible"]),
      gradeBands: Object.freeze(["2-3", "4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-able-ible-01",
          word: "adjustable",
          sentence: "The adjustable strap can be changed to fit different sizes.",
          expectedMeaning: "able to be adjusted"
        }),
        Object.freeze({
          id: "ct-able-ible-02",
          word: "washable",
          sentence: "The teacher chose washable paint for art class.",
          expectedMeaning: "able to be washed"
        }),
      ])
    }),
    "ed": Object.freeze({
      targetIds: Object.freeze(["ed"]),
      targetLabels: Object.freeze(["-ed"]),
      gradeBands: Object.freeze(["2-3", "4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-ed-01",
          word: "whispered",
          sentence: "During the play, Maya whispered the line quietly so only her partner heard it.",
          expectedMeaning: "an action that already happened"
        }),
        Object.freeze({
          id: "ct-ed-02",
          word: "glimmered",
          sentence: "The distant light glimmered for a moment before it disappeared.",
          expectedMeaning: "an action that already happened"
        }),
      ])
    }),
    "er-or": Object.freeze({
      targetIds: Object.freeze(["er-or", "er", "or"]),
      targetLabels: Object.freeze(["-er, -or"]),
      gradeBands: Object.freeze(["2-3", "4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-er-or-01",
          word: "translator",
          sentence: "The translator listened during a meeting with English and Spanish speakers.",
          expectedMeaning: "a person who translates"
        }),
        Object.freeze({
          id: "ct-er-or-02",
          word: "excavator",
          sentence: "The excavator worked beside a deep hole near the road.",
          expectedMeaning: "a thing that excavates or digs"
        }),
      ])
    }),
    "er-more": Object.freeze({
      targetIds: Object.freeze(["er-more"]),
      targetLabels: Object.freeze(["-er"]),
      gradeBands: Object.freeze(["2-3", "4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-er-more-01",
          word: "narrower",
          sentence: "This hallway is narrower than the one downstairs.",
          expectedMeaning: "more narrow"
        }),
        Object.freeze({
          id: "ct-er-more-02",
          word: "brighter",
          sentence: "The second bulb is brighter than the first one.",
          expectedMeaning: "more bright"
        }),
      ])
    }),
    "est": Object.freeze({
      targetIds: Object.freeze(["est"]),
      targetLabels: Object.freeze(["-est"]),
      gradeBands: Object.freeze(["2-3", "4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-est-01",
          word: "narrowest",
          sentence: "Three paths led to the lake; Maya chose the narrowest.",
          expectedMeaning: "the most narrow"
        }),
        Object.freeze({
          id: "ct-est-02",
          word: "brightest",
          sentence: "Several stars were visible, but Venus looked brightest.",
          expectedMeaning: "the most bright"
        }),
      ])
    }),
    "ful": Object.freeze({
      targetIds: Object.freeze(["ful"]),
      targetLabels: Object.freeze(["-ful"]),
      gradeBands: Object.freeze(["2-3", "4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-ful-01",
          word: "resourceful",
          sentence: "The resourceful student was chosen to help with the class project.",
          expectedMeaning: "full of resourcefulness or useful ideas"
        }),
        Object.freeze({
          id: "ct-ful-02",
          word: "colorful",
          sentence: "The colorful mural covered the wall.",
          expectedMeaning: "full of color"
        }),
      ])
    }),
    "ing": Object.freeze({
      targetIds: Object.freeze(["ing"]),
      targetLabels: Object.freeze(["-ing"]),
      gradeBands: Object.freeze(["2-3", "4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-ing-01",
          word: "shimmering",
          sentence: "The water is shimmering in the sunlight right now.",
          expectedMeaning: "an action happening or in progress"
        }),
        Object.freeze({
          id: "ct-ing-02",
          word: "drifting",
          sentence: "The clouds are drifting slowly across the sky.",
          expectedMeaning: "an action happening or in progress"
        }),
      ])
    }),
    "ion": Object.freeze({
      targetIds: Object.freeze(["ion"]),
      targetLabels: Object.freeze(["-ion, -tion, -sion"]),
      gradeBands: Object.freeze(["2-3", "4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-ion-01",
          word: "evaporation",
          sentence: "The class watched evaporation during the water experiment.",
          expectedMeaning: "an action or process"
        }),
        Object.freeze({
          id: "ct-ion-02",
          word: "expansion",
          sentence: "The balloon's expansion surprised the class.",
          expectedMeaning: "an action, process, or result"
        }),
      ])
    }),
    "less": Object.freeze({
      targetIds: Object.freeze(["less"]),
      targetLabels: Object.freeze(["-less"]),
      gradeBands: Object.freeze(["2-3", "4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-less-01",
          word: "motionless",
          sentence: "The rabbit stayed motionless while the dog walked past.",
          expectedMeaning: "without motion"
        }),
        Object.freeze({
          id: "ct-less-02",
          word: "odorless",
          sentence: "The cleaner was odorless even after the bottle was opened.",
          expectedMeaning: "without odor"
        }),
      ])
    }),
    "ly": Object.freeze({
      targetIds: Object.freeze(["ly"]),
      targetLabels: Object.freeze(["-ly"]),
      gradeBands: Object.freeze(["2-3", "4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-ly-01",
          word: "cautiously",
          sentence: "The hiker stepped cautiously across the wet rocks.",
          expectedMeaning: "in a cautious way; how the action was done"
        }),
        Object.freeze({
          id: "ct-ly-02",
          word: "steadily",
          sentence: "The machine worked steadily without sudden changes in speed.",
          expectedMeaning: "in a steady way; how the action was done"
        }),
      ])
    }),
    "ment": Object.freeze({
      targetIds: Object.freeze(["ment"]),
      targetLabels: Object.freeze(["-ment"]),
      gradeBands: Object.freeze(["2-3", "4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-ment-01",
          word: "adjustment",
          sentence: "After a small adjustment, the mirror pointed toward the window.",
          expectedMeaning: "the act or result of adjusting"
        }),
        Object.freeze({
          id: "ct-ment-02",
          word: "measurement",
          sentence: "The student wrote the measurement beside a drawing of the table.",
          expectedMeaning: "the result or process of measuring"
        }),
      ])
    }),
    "ous": Object.freeze({
      targetIds: Object.freeze(["ous"]),
      targetLabels: Object.freeze(["-ous"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-ous-01",
          word: "porous",
          sentence: "Water moved slowly through the porous rock.",
          expectedMeaning: "having many pores or holes"
        }),
        Object.freeze({
          id: "ct-ous-02",
          word: "hazardous",
          sentence: "Students wore gloves while handling the hazardous material.",
          expectedMeaning: "having a dangerous quality"
        }),
      ])
    }),
    "ant-ent": Object.freeze({
      targetIds: Object.freeze(["ant-ent", "ant"]),
      targetLabels: Object.freeze(["-ant, -ent"]),
      gradeBands: Object.freeze(["4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-ant-ent-01",
          word: "observant",
          sentence: "The observant student noticed small details that others missed.",
          expectedMeaning: "having the quality of observing carefully"
        }),
        Object.freeze({
          id: "ct-ant-ent-02",
          word: "absorbent",
          sentence: "The absorbent towel was kept beside the sink.",
          expectedMeaning: "having the quality of absorbing"
        }),
      ])
    }),
    "s-es": Object.freeze({
      targetIds: Object.freeze(["s-es", "s"]),
      targetLabels: Object.freeze(["-s, -es"]),
      gradeBands: Object.freeze(["2-3", "4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-s-es-01",
          word: "lanterns",
          sentence: "Lanterns glowed along both sides of the path after sunset.",
          expectedMeaning: "more than one lantern"
        }),
        Object.freeze({
          id: "ct-s-es-02",
          word: "glaciers",
          sentence: "The map shows several glaciers in the mountain range.",
          expectedMeaning: "more than one glacier"
        }),
      ])
    }),
    "cook": Object.freeze({
      targetIds: Object.freeze(["cook"]),
      targetLabels: Object.freeze(["cook"]),
      gradeBands: Object.freeze(["2-3", "4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-cook-01",
          word: "cookware",
          sentence: "Maya put the cookware in the kitchen cabinet.",
          expectedMeaning: "tools or equipment used for cooking"
        }),
        Object.freeze({
          id: "ct-cook-02",
          word: "cookbook",
          sentence: "Maya opened the cookbook to choose a recipe.",
          expectedMeaning: "a book about cooking"
        }),
      ])
    }),
    "view": Object.freeze({
      targetIds: Object.freeze(["view"]),
      targetLabels: Object.freeze(["view"]),
      gradeBands: Object.freeze(["2-3", "4-5", "6-8"]),
      items: Object.freeze([
        Object.freeze({
          id: "ct-view-01",
          word: "viewpoint",
          sentence: "From the hilltop viewpoint, visitors can see the entire valley.",
          expectedMeaning: "a place or position from which something is viewed"
        }),
        Object.freeze({
          id: "ct-view-02",
          word: "viewfinder",
          sentence: "Maya checked the viewfinder before taking the picture.",
          expectedMeaning: "a part of a camera used to view the scene"
        }),
      ])
    }),
  });

  const ITEMS = Object.freeze(
    Object.entries(BANK).flatMap(([targetId, config]) =>
      config.items.map((item) => Object.freeze({
        ...item,
        canonicalTargetId: targetId,
        targetIds: config.targetIds,
        targetLabels: config.targetLabels,
        gradeBands: config.gradeBands
      }))
    )
  );

  function asArray(value) {
    return Array.isArray(value)
      ? value
      : [];
  }


  function normalizeWord(value) {
    return String(value || "")
      .trim()
      .toLowerCase();
  }


  function normalizeTarget(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[‐-‒–—−]/g, "-")
      .replace(/\s+/g, " ");
  }

  function getCoverageReport() {
    const covered = new Set(
      ITEMS.flatMap((item) =>
        asArray(item.targetIds).map(normalizeTarget)
      )
    );

    const missing = CORE_TARGET_IDS.filter(
      (targetId) => !covered.has(normalizeTarget(targetId))
    );

    return {
      requiredTargetCount: CORE_TARGET_IDS.length,
      reservedWordCount: new Set(
        ITEMS.map((item) => normalizeWord(item.word))
      ).size,
      missingTargets: missing,
      complete: missing.length === 0
    };
  }


  function assertProgramWideCoverage() {
    const report = getCoverageReport();

    if (!report.complete) {
      throw new Error(
        `Check Transfer is missing program targets: ${report.missingTargets.join(", ")}`
      );
    }

    return report;
  }



  function makeId(prefix) {
    if (
      window.crypto &&
      typeof window.crypto.randomUUID === "function"
    ) {
      return `${prefix}-${window.crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }


  function protectedRegistry() {
    return (
      window.FirstVoloInstructionalProtection ||
      null
    );
  }


  function poolWords() {
    return [
      ...new Set(
        ITEMS.map(
          item => normalizeWord(item.word)
        )
      )
    ];
  }


  function installProtectedPool() {
    const registry =
      protectedRegistry();

    if (!registry) {
      throw new Error(
        "First Volo instructional protection registry must load before Check Transfer."
      );
    }

    const words =
      poolWords();

    registry.connectedTextTransfer =
      words;

    registry.checkTransferItems =
      ITEMS;

    const formal =
      asArray(
        registry.formalPrePost
      ).map(normalizeWord);

    const migration =
      asArray(
        registry.migrationChallenge
      ).map(normalizeWord);

    const overlap =
      words.filter(
        word =>
          formal.includes(word) ||
          migration.includes(word)
      );

    if (overlap.length) {
      throw new Error(
        `Check Transfer pool overlaps another protected pool: ${overlap.join(", ")}`
      );
    }

    registry.version =
      "instructional-protection-v2-check-transfer";

    registry.principle =
      "Formal assessment targets, Migration Challenge words, and Session Guide Check Transfer words remain separate from one another and from ordinary instructional materials.";

    registry.protectionReason =
      function protectionReason(word) {
        const wanted =
          normalizeWord(word);

        if (!wanted) {
          return null;
        }

        if (formal.includes(wanted)) {
          return "formal-pre-post";
        }

        if (migration.includes(wanted)) {
          return "migration-challenge";
        }

        if (words.includes(wanted)) {
          return "check-transfer";
        }

        return null;
      };

    registry.isProtectedWord =
      function isProtectedWord(word) {
        return Boolean(
          registry.protectionReason(word)
        );
      };

    return registry;
  }


  function broadenOrdinaryPracticeProtection(
    registry
  ) {
    const migrationApi =
      window.FirstVoloTransferChallenge;

    if (
      !migrationApi ||
      typeof migrationApi.isReservedWord !== "function" ||
      migrationApi.isMigrationReservedWord
    ) {
      return;
    }

    const migrationOnly =
      migrationApi.isReservedWord.bind(
        migrationApi
      );

    migrationApi.isMigrationReservedWord =
      migrationOnly;

    migrationApi.isReservedWord =
      function isAnyProtectedInstructionalWord(word) {
        return Boolean(
          migrationOnly(word) ||
          registry.isProtectedWord(word)
        );
      };
  }


  function itemMatchesExactTarget(
    item,
    target
  ) {
    if (!target) {
      return false;
    }

    const targetId =
      normalizeTarget(target.id);

    if (targetId) {
      return asArray(
        item.targetIds
      ).some(
        value =>
          normalizeTarget(value) ===
          targetId
      );
    }

    const targetLabel =
      normalizeTarget(
        target.label
      );

    if (!targetLabel) {
      return false;
    }

    const labelMatches =
      ITEMS.filter(
        candidate =>
          asArray(
            candidate.targetLabels
          ).some(
            value =>
              normalizeTarget(value) ===
              targetLabel
          )
      );

    const possibleTargetIds =
      new Set(
        labelMatches.flatMap(
          candidate =>
            asArray(
              candidate.targetIds
            ).map(normalizeTarget)
        )
      );

    /*
      Label-only matching is allowed only when it resolves to one
      unambiguous target family. IN- is intentionally fail-closed because
      it can mean NOT or IN/INTO.
    */
    if (possibleTargetIds.size !== 1) {
      return false;
    }

    return asArray(
      item.targetLabels
    ).some(
      value =>
        normalizeTarget(value) ===
        targetLabel
    );
  }


  function latestGradeBand(
    student,
    plan
  ) {
    const direct =
      plan?.lastWork?.gradeBand ||
      null;

    if (direct) {
      return direct;
    }

    const sessions =
      asArray(
        student?.sessions
      )
        .slice()
        .sort(
          (a, b) =>
            String(
              b?.completedAt ||
              b?.startedAt ||
              ""
            ).localeCompare(
              String(
                a?.completedAt ||
                a?.startedAt ||
                ""
              )
            )
        );

    return (
      sessions.find(
        session =>
          session?.gradeBand
      )?.gradeBand ||
      null
    );
  }


  function collectSeenWords(
    student
  ) {
    const seen =
      new Set();

    for (
      const session
      of asArray(
        student?.sessions
      )
    ) {
      for (
        const response
        of asArray(
          session?.responses
        )
      ) {
        if (response?.word) {
          seen.add(
            normalizeWord(
              response.word
            )
          );
        }
      }

      const transferItems =
        asArray(
          session?.checkTransfer?.items
        );

      for (
        const item
        of transferItems
      ) {
        if (item?.word) {
          seen.add(
            normalizeWord(
              item.word
            )
          );
        }
      }
    }

    return seen;
  }


  function transferItemCount(
    sessionMinutes
  ) {
    return Number(sessionMinutes) === 30
      ? 2
      : 1;
  }


  function selectItems({
    student = null,
    plan = null
  } = {}) {
    const target =
      plan?.targetResolution?.primary ||
      plan?.nextWork?.target ||
      plan?.lastWork?.target ||
      null;

    if (!target?.id && !target?.label) {
      return {
        target,
        gradeBand: null,
        items: [],
        materialStatus:
          "protected-check-transfer-target-unresolved"
      };
    }

    const gradeBand =
      latestGradeBand(
        student,
        plan
      );

    const seen =
      collectSeenWords(
        student
      );

    const exactTargetItems =
      ITEMS.filter(
        item =>
          itemMatchesExactTarget(
            item,
            target
          )
      );

    const gradeEligible =
      exactTargetItems.filter(
        item =>
          !gradeBand ||
          gradeBand === "all" ||
          asArray(
            item.gradeBands
          ).includes(
            gradeBand
          )
      );

    const unused =
      gradeEligible.filter(
        item =>
          !seen.has(
            normalizeWord(
              item.word
            )
          )
      );

    const count =
      transferItemCount(
        plan?.sessionMinutes
      );

    const selected =
      unused
        .slice(
          0,
          count
        )
        .map(
          item => ({
            id: item.id,
            word: item.word,
            targetIds: [
              ...item.targetIds
            ],
            targetLabels: [
              ...item.targetLabels
            ],
            gradeBands: [
              ...item.gradeBands
            ],
            sentence: item.sentence,
            expectedMeaning:
              item.expectedMeaning,
            nonTargetSupports:
              asArray(
                item.nonTargetSupports
              ).map(
                support => ({
                  ...support
                })
              ),
            prompt:
              `${item.sentence} What do you think “${item.word}” means here?`,
            firstAttemptPrompt:
              `What do you think “${item.word}” means here?`,
            afterAttemptRecognitionPrompt:
              "What part do you recognize?",
            source:
              "protected-check-transfer-bank"
          }));

    let status =
      "ready-protected-check-transfer";

    if (!exactTargetItems.length) {
      status =
        "protected-check-transfer-target-not-configured";
    } else if (!gradeEligible.length) {
      status =
        "protected-check-transfer-no-grade-eligible-item";
    } else if (!unused.length) {
      status =
        "protected-check-transfer-pool-exhausted";
    } else if (selected.length < count) {
      status =
        "protected-check-transfer-partial-pool";
    }

    return {
      target,
      gradeBand,
      requestedCount: count,
      availableUnusedCount:
        unused.length,
      items: selected,
      materialStatus: status
    };
  }


  function buildProtectedTransfer({
    student = null,
    plan = null
  } = {}) {
    const selection =
      selectItems({
        student,
        plan
      });

    const target =
      selection.target;

    return {
      ...(plan?.transfer || {}),

      target,

      gradeBand:
        selection.gradeBand ||
        null,

      protected:
        true,

      itemCount:
        selection.items.length,

      requestedItemCount:
        selection.requestedCount,

      items:
        selection.items,

      materialStatus:
        selection.materialStatus,

      educatorDoes:
        "Present the protected transfer word in context without preteaching it or identifying the morpheme. Record the first attempt before adding a morphology cue. If support is needed, begin with “What part do you recognize?” and increase support only after that attempt.",

      studentDoes:
        target?.label
          ? `Attempts an unfamiliar whole word, then identifies whether ${target.label} is recognized and uses known morphology plus context to infer the word.`
          : "Attempts an unfamiliar whole word, recognizes a known meaningful part, and uses morphology plus context to infer the word.",

      firstAttemptRule:
        "No morphology cue, highlighting, target label, meaning choice, or preteaching before the first whole-word inference attempt.",

      interpretation: {
        recognizeKnownPart:
          "Record whether the student recognized the known target morpheme.",

        inferWholeWord:
          "Record whole-word inference separately from recognition of the known target morpheme."
      },

      separationRule:
        "Check Transfer uses only this protected pool. It never substitutes formal Pre/Post, Migration Challenge, or ordinary practice words."
    };
  }


  function updateTransferManifest(
    plan
  ) {
    const entry =
      asArray(
        plan?.materialsManifest
      ).find(
        item =>
          item?.section ===
          "transfer"
      );

    if (!entry) {
      return;
    }

    entry.status =
      plan.transfer
        .materialStatus;

    entry.itemCount =
      plan.transfer
        .items.length;
  }


  function wrapPlanner() {
    const planner =
      window.FirstVoloInstructionalSessionPlanner;

    if (
      !planner ||
      typeof planner.buildPlan !== "function" ||
      planner.__checkTransferWrapped
    ) {
      return;
    }

    const originalBuildPlan =
      planner.buildPlan.bind(
        planner
      );

    planner.buildPlan =
      function buildPlanWithProtectedCheckTransfer(
        options = {}
      ) {
        const plan =
          originalBuildPlan(
            options
          );

        plan.transfer =
          buildProtectedTransfer({
            student:
              options.student ||
              null,
            plan
          });

        updateTransferManifest(
          plan
        );

        api.lastSelection = {
          id:
            makeId(
              "check-transfer-selection"
            ),
          generatedAt:
            plan.generatedAt ||
            new Date()
              .toISOString(),
          studentId:
            options.student?.id ||
            null,
          studentName:
            options.student?.name ||
            null,
          sessionMinutes:
            plan.sessionMinutes,
          gradeBand:
            plan.transfer
              .gradeBand ||
            plan.lastWork
              ?.gradeBand ||
            null,
          studyMode:
            plan.lastWork
              ?.studyMode ||
            null,
          vocabLevel:
            plan.lastWork
              ?.vocabLevel ||
            null,
          target:
            plan.transfer.target ||
            null,
          transfer:
            plan.transfer,
          applyWord:
            plan.apply?.item?.word ||
            null
        };

        return plan;
      };

    planner.__checkTransferWrapped =
      true;
  }


  const registry =
    installProtectedPool();

  broadenOrdinaryPracticeProtection(
    registry
  );


  const api = {
    version:
      "protected-check-transfer-v2-program-wide",
    items:
      ITEMS,
    coreTargetIds:
      CORE_TARGET_IDS,
    getCoverageReport,
    coverage:
      assertProgramWideCoverage(),
    getReservedWords:
      poolWords,
    collectSeenWords,
    selectItems,
    buildProtectedTransfer,
    lastSelection:
      null
  };


  window.FirstVoloCheckTransfer =
    api;

  wrapPlanner();

})();
