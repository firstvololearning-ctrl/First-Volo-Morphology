/* Learn-only additions. Placement bands are editorial recommendations;
   assessment banks and the master word inventory are not modified. */
(function () {
  "use strict";
  const additions = {
    "re": ["rewash", "retell"],
    "mis": ["misspell"],
    "un-reversative": ["unpack", "unroll"],
    "ly-adjective": ["friendly", "brotherly", "motherly"],
    "ant-ent-agent": ["contestant", "claimant", "resident"],
    "ant-ent-adjective": ["tolerant", "persistent"]
  };
  const metadata = {};
  for (const [id, words] of Object.entries(additions)) {
    for (const word of words) metadata[word] = {
      practiceBand: id.startsWith("ant-ent") ? "6-8" : "2-3",
      vocabLevel: id.startsWith("ant-ent") ? "academic" : "familiar"
    };
  }
  const worked = {
    "un-reversative": { word: "unpack", parts: "un- + pack → unpack", explanation: "Here un- reverses an action. When you unpack, you take out what was packed.", sentence: "After the trip, I unpack my bag.", question: "What does un- tell you here?", choices: ["Reverse the packing", "Pack again"], answer: 0 },
    "ly-adjective": { word: "friendly", parts: "friend + -ly → friendly", explanation: "Here -ly helps make a describing word. Friendly describes someone who acts in a kind, welcoming way.", sentence: "The friendly neighbor waved to us.", question: "What does friendly describe in this sentence?", choices: ["How someone waved", "The neighbor"], answer: 1 },
    "ant-ent-agent": { word: "contestant", parts: "Word family: contest ↔ contestant", explanation: "A contestant is a person who takes part in a contest. Notice -ant in this noun. This word family helps us understand the meaning; it is not a rule for adding -ant to any verb.", sentence: "Each contestant answered a question.", question: "What does contestant name?", choices: ["A person taking part", "A quality of a question"], answer: 0 },
    "ant-ent-adjective": { word: "persistent", parts: "Word family: persist ↔ persistent", explanation: "Persist means to keep going. In this sentence, persistent describes someone who keeps trying. Notice -ent in this adjective; we cannot add it to just any verb.", sentence: "The persistent climber tried the route again.", question: "What does persistent tell us about the climber?", choices: ["The climber stopped trying", "The climber kept trying"], answer: 1 },
    "tele": { word: "telescope", parts: "Word parts: tele- (far) · -scope (viewing instrument)", explanation: "Tele means far. A telescope is an instrument for looking at things that are far away.", sentence: "We used a telescope to look at the moon.", question: "Which meaning does tele contribute?", choices: ["Far away", "Very small"], answer: 0 },
    "micro": { word: "microscope", parts: "Word parts: micro- (small) · -scope (viewing instrument)", explanation: "Micro means small. A microscope helps us see things too small to see clearly with just our eyes.", sentence: "We looked at a leaf through a microscope.", question: "Which meaning does micro contribute?", choices: ["Far away", "Small"], answer: 1 },
    "geo": { word: "geology", parts: "Word parts: geo- (earth) · -logy (study)", explanation: "Geo- means earth. In geology, -logy names a field of study. Geology studies Earth, including its rocks.", sentence: "In geology class, we examined rocks.", question: "What does geo help us understand?", choices: ["The study is about Earth", "The study is about sound"], answer: 0 },
    "struct": { word: "structure", parts: "Root focus: struct in structure", explanation: "Struct carries the meaning build. A structure can be something that has been built, such as a bridge.", sentence: "The bridge is a strong structure.", question: "What meaning does struct contribute?", choices: ["Hear", "Build"], answer: 1 },
    "ness": { word: "darkness", parts: "dark + -ness → darkness", explanation: "Dark is a describing word. Adding -ness makes a noun that names the state of being dark.", sentence: "We turned on a lamp in the darkness.", question: "What does darkness name?", choices: ["The state of being dark", "Someone who makes lamps"], answer: 0 },
    "er-more": { word: "taller", parts: "tall + -er → taller", explanation: "Here -er compares height: taller means greater in height. It does not name a person who does an action.", sentence: "This plant is taller than that one.", question: "What is -er doing in taller?", choices: ["Naming a person", "Comparing height"], answer: 1 },
    "er-or": { word: "writer", parts: "write + -er → writer", explanation: "Here -er names a person who writes. Drop the final e in write before adding -er.", sentence: "The writer finished a story.", question: "What does writer name?", choices: ["A person who writes", "Something greater in height"], answer: 0 },
    "ly-adverb": { word: "slowly", parts: "slow + -ly → slowly", explanation: "Here -ly helps make a word that tells how an action happens. Slowly means in a slow way.", sentence: "The turtle moved slowly.", question: "What does slowly tell us?", choices: ["What the turtle is called", "How the turtle moved"], answer: 1 }
  };
  // Source-reviewed starter lessons: model first, then apply in a new sentence.
  const additionalWorked = {
    "un-reversative": [{ word: "unroll", parts: "un- + roll → unroll", explanation: "Here un- reverses rolling. To unroll something, open it out from its rolled-up shape.", sentence: "We unroll the rug so it lies flat.", question: "What happens when we unroll the rug?", choices: ["We open the rolled rug out", "We roll the rug up"], answer: 0 }]
  };
  const practice = {
    unpack: { sentence: "After lunch, I unpack the picnic basket.", question: "What am I doing to the basket?", choices: ["Putting things into it", "Taking its contents out"], answer: 1, feedback: ["That would be packing the basket. Un- reverses the packing action.", "Unpacking the basket means taking out what was packed inside."] },
    unroll: { sentence: "We unroll the poster before hanging it on the wall.", question: "What does unroll mean here?", choices: ["Open the poster out from a roll", "Put the poster into a roll"], answer: 0, feedback: ["The poster was rolled up. Unrolling opens it out so we can hang it.", "That would be rolling it up. Un- tells us to reverse that action."] },
    friendly: { sentence: "The friendly guide welcomed us.", question: "What does friendly describe here?", choices: ["The way we moved", "What the guide was like"], answer: 1, feedback: ["Look for the person described as friendly. Here it describes the guide, not an action.", "Friendly describes the guide as kind and welcoming. Here -ly helps form an adjective."] }
  };
  function lessons(item) {
    return [worked[item.id], ...(additionalWorked[item.id] || [])].filter(Boolean);
  }
  const roundGroups = {
    prefixes: [["un-negation", "un-reversative", "re"], ["pre", "mis", "sub"], ["dis", "non", "over"]],
    roots: [
      ["struct", "dict", "form"], ["tele", "micro", "geo"],
      ["scrib", "graph", "vis"], ["pel", "tract", "vert"],
      ["pend", "fer", "ven"], ["cred", "voc", "terr"]
    ],
    suffixes: [
      ["ed", "ing", "s-es"], ["ness", "ful", "less"],
      ["er-or", "er-more", "est"], ["al", "ic", "ous"],
      ["ist", "ity", "ment"], ["ant-ent-agent", "ant-ent-adjective", "ly-adjective"]
    ]
  };
  const sortContexts = {
  "rewash": "The plate is still dirty, so I rewash it.",
  "retell": "After hearing the story, I retell it to my sister.",
  "misspell": "I misspell the name, so I check the letters and try again.",
  "unsafe": "The broken step is unsafe to stand on.",
  "unclear": "The smudged message is unclear, so I cannot read it.",
  "untie": "Please untie the knot in the ribbon.",
  "unpack": "I unpack my bag and put my clothes away.",
  "unroll": "We unroll the rug so it lies flat.",
  "return": "Please return the pencil by bringing it back.",
  "preschool": "At preschool, young children learn before they begin school.",
  "misread": "I misread the time and arrived an hour early.",
  "misfire": "The engine may misfire when a spark fails.",
  "submarine": "A submarine can travel under the sea.",
  "subsoil": "The subsoil lies beneath the top layer of soil.",
  "submerge": "We submerge the stone by placing it under water.",
  "disconnect": "Disconnect the cable by pulling the plug out.",
  "disobey": "To disobey a rule is not to follow it.",
  "nonverbal": "A nod is a nonverbal message without words.",
  "nonfiction": "This nonfiction book gives facts about birds.",
  "nonstop": "The bus made a nonstop trip without any stops.",
  "overhead": "A kite flew overhead, above us.",
  "overuse": "We overuse paper when we use more than we need.",
  "construct": "We construct a shelter by building it from branches.",
  "structure": "The bridge is a structure built across the river.",
  "predict": "I predict rain: I say what I think will happen.",
  "dictionary": "A dictionary explains the meanings of words.",
  "contradict": "To contradict an idea is to say something against it.",
  "transform": "We transform the clay by changing its shape.",
  "reform": "We reform the clay by shaping it again.",
  "formation": "The formation of ice changes the shape of the puddle.",
  "telegraph": "A telegraph sends messages over a long distance.",
  "telescope": "A telescope helps us see faraway objects.",
  "television": "Television can show pictures sent from far away.",
  "microscope": "A microscope helps us see very small things.",
  "microscopic": "A microscopic speck is too small to see clearly without magnification.",
  "microorganism": "A microorganism is a very small living thing.",
  "geology": "Geology is the study of Earth and its rocks.",
  "geography": "Geography studies places on Earth.",
  "geothermal": "Geothermal heat comes from inside Earth.",
  "describe": "I describe the scene by writing what it looks like.",
  "scripted": "The scripted speech was written before it was spoken.",
  "biography": "A biography is a written account of a life.",
  "autograph": "She wrote her autograph, signing her own name.",
  "graphic": "The graphic shows the rainfall in a drawn chart.",
  "vision": "My vision lets me see the road.",
  "video": "We watch a video to see what happened.",
  "repel": "These magnets repel each other: they push apart.",
  "compel": "The strong evidence may compel us to change our minds.",
  "propel": "The motor can propel the boat forward.",
  "attract": "A magnet can attract a metal pin and pull it closer.",
  "tractor": "The tractor pulls a plow through the field.",
  "extract": "We extract the splinter by pulling it out.",
  "convert": "We convert the shed, turning it into a studio.",
  "divert": "We divert the stream by turning its flow away from the path.",
  "invert": "Invert the cup by turning it upside down.",
  "suspend": "We suspend the lantern from a hook so it hangs above us.",
  "pendant": "A pendant hangs from a necklace.",
  "pendulum": "The pendulum hangs from a fixed point and swings.",
  "transfer": "We transfer the water, carrying it from one bucket to another.",
  "convention": "At the convention, people come together for a meeting.",
  "credible": "A credible account is one we can believe.",
  "credit": "I credit her account: I believe what she says.",
  "incredible": "The incredible story was hard to believe.",
  "vocal": "The singer used her vocal skills to control her voice.",
  "vocalize": "To vocalize is to make sounds with the voice.",
  "vocalist": "The vocalist sings with the band.",
  "terrain": "The rough terrain made the land hard to cross.",
  "territory": "The map shows the territory, or area of land.",
  "subterranean": "The subterranean cave lies beneath the land.",
  "walked": "Yesterday, I walked to the park.",
  "jumped": "Yesterday, the cat jumped onto the chair.",
  "helped": "Yesterday, we helped with the chores.",
  "running": "The child is running along the path.",
  "writing": "I am writing a note now.",
  "sleeping": "The dog is sleeping now.",
  "books": "There are three books on the shelf.",
  "dogs": "Two dogs are playing outside.",
  "boxes": "We stacked four boxes.",
  "darkness": "The room was in darkness with the lights off.",
  "happiness": "Her smile showed her happiness.",
  "careful": "A careful cook pays close attention to each step.",
  "cloudless": "The cloudless sky had no clouds.",
  "writer": "The writer wrote a story.",
  "narrator": "The narrator tells the story.",
  "taller": "This tree is taller than that one.",
  "faster": "This train is faster than that train.",
  "stronger": "This rope is stronger than the old one.",
  "tallest": "Of the three trees, this one is the tallest.",
  "fastest": "Of the three trains, this one is the fastest.",
  "strongest": "Of the three ropes, this one is the strongest.",
  "natural": "The natural materials came from nature.",
  "musical": "The musical instrument makes music.",
  "regional": "The regional map shows one region.",
  "scientific": "The scientific study uses methods from science.",
  "historic": "This historic event is important in history.",
  "joyous": "The joyous crowd was full of joy.",
  "dangerous": "The dangerous path had many hazards.",
  "famous": "The famous singer is known by many people.",
  "artist": "The artist creates art.",
  "scientist": "The scientist studies the natural world.",
  "pianist": "The pianist plays the piano.",
  "activity": "The room was full of activity as everyone worked.",
  "clarity": "The clarity of the water made the bottom easy to see.",
  "security": "The lock gives us a sense of security.",
  "movement": "The movement of the flag showed that the wind was blowing.",
  "development": "We watched the development of the seedlings as they grew.",
  "enjoyment": "Playing the game gave us enjoyment.",
  "contestant": "The contestant took part in the contest.",
  "claimant": "The claimant said that the lost bag belonged to her.",
  "resident": "The resident has lived in this town for years.",
  "resistant": "The resistant material does not tear easily.",
  "tolerant": "The tolerant neighbor accepts that people have different opinions.",
  "persistent": "The persistent runner kept trying after a setback.",
  "friendly": "The friendly neighbor greeted us warmly.",
  "brotherly": "He showed brotherly concern for his sister.",
  "motherly": "She gave the child a motherly hug."
};
  Object.assign(sortContexts, {
  "preschool": "The child goes to preschool before starting school.",
  "precook": "We precook the rice before adding it to the soup.",
  "undercook": "If we undercook the rice, it will still be hard.",
  "underpaid": "The worker was underpaid for the work she did.",
  "phonics": "In phonics, we connect letters with speech sounds.",
  "telephone": "We heard our friend speaking on the telephone.",
  "thermal": "Thermal energy moved from the hot mug to my hands.",
  "geothermal": "Geothermal heat comes from inside Earth.",
  "microscope": "We looked at a leaf through a microscope.",
  "telescope": "We looked at the moon through a telescope.",
  "metric": "The metric ruler measures length in centimeters.",
  "diameter": "We measured the diameter of the round plate through its center.",
  "audio": "We listened to the audio recording.",
  "audience": "The audience listened to the musicians.",
  "dermal": "The nurse explained that dermal tissue is skin tissue.",
  "dermatology": "The dermatology clinic treats skin conditions."
});
  const sortHints = { compel: "Pel carries the idea of driving or pushing. Here the pressure is figurative: the evidence strongly pushes us toward a decision.", convention: "Ven/vent comes from a root meaning come. A meeting brings people together.", credit: "Cred carries a historical connection to belief and trust. In this sentence, credit is a verb meaning believe." };
  function examples(item) {
    return [...new Set([...(item.examples || []), ...(additions[item.id] || [])])];
  }
  function segment(word, item) {
    const variants = item.label.split(/[,/]/).map(s => s.trim().replace(/^-|-$/g, ""));
    for (const part of variants.sort((a, b) => b.length - a.length)) {
      const at = item.type === "suffix" ? (word.endsWith(part) ? word.length - part.length : -1) : (item.type === "prefix" ? (word.startsWith(part) ? 0 : -1) : word.indexOf(part));
      if (at >= 0) return { before: word.slice(0, at), target: part, after: word.slice(at + part.length) };
    }
    return null;
  }
  // Meaning contrasts are curated separately: a word such as geography would
  // fit both geo and graph, so it must not be assigned a single destination.
  const meaningSorts = [{
    id: "earth-writing", mode: "roots",
    title: "Does the word have to do with Earth or writing?",
    groups: [
      { id: "geo", heading: "Have to do with Earth", cards: [
        { word: "geology", explanation: "Geo means Earth. Geology is the study of Earth, including its rocks." },
        { word: "geothermal", explanation: "Geo means Earth. Geothermal describes heat from within Earth." }
      ] },
      { id: "graph", heading: "Have to do with writing", cards: [
        { word: "autograph", explanation: "Graph carries the meaning write. An autograph is a person's own written signature." },
        { word: "biography", explanation: "Graph carries the meaning write. A biography is a written account of someone's life." }
      ] }
    ],
    teachingNote: "Geo means Earth. Graph carries the meaning write. Read each sentence and notice how the word part helps explain the word.",
    completion: "You explored how geo connects words with Earth and graph connects words with writing.",
    excludedWords: ["geography"]
  }];
  meaningSorts.push({
    id: "again-undo-not", mode: "prefixes",
    title: "Again, undo an action, or not?",
    teachingNote: "Re- can mean again. Un- can undo an action, or it can mean not. The whole word and sentence help us choose the meaning.",
    completion: "You explored three meanings: again, undo an action, and not.",
    groups: [
      { id: "re", heading: "Do again", cards: [
        { word: "rewash", explanation: "Here re- means again. To rewash the plate is to wash it another time." },
        { word: "retell", explanation: "Here re- means again. To retell a story is to tell it another time." }
      ] },
      { id: "un-reversative", heading: "Undo an action", cards: [
        { word: "untie", explanation: "Here un- reverses tying. To untie a knot is to undo it." },
        { word: "unpack", explanation: "Here un- reverses packing. To unpack a bag is to take out what was packed inside." }
      ] },
      { id: "un-negation", heading: "Not", cards: [
        { word: "unsafe", explanation: "Here un- means not. Unsafe means not safe; it does not name an action to undo." },
        { word: "unclear", explanation: "Here un- means not. Unclear means not clear." }
      ] }
    ], excludedWords: []
  }, {
    id: "wrongly-again", mode: "prefixes",
    title: "Doing it wrongly or doing it again?",
    teachingNote: "Mis- means wrongly or incorrectly. Here re- means again. Use the word part to notice which meaning the word expresses.",
    completion: "You explored how mis- means wrongly and re- can mean again.",
    groups: [
      { id: "mis", heading: "Do wrongly", cards: [
        { word: "misread", explanation: "Mis- means wrongly. If you misread the time, you read it incorrectly." },
        { word: "misspell", explanation: "Mis- means wrongly. To misspell a word is to spell it incorrectly." }
      ] },
      { id: "re", heading: "Do again", cards: [
        { word: "rewash", explanation: "Here re- means again. Rewash tells us to wash another time; it does not mean wash incorrectly." },
        { word: "retell", explanation: "Here re- means again. Retell tells us to tell the story another time; it does not mean tell it incorrectly." }
      ] }
    ], excludedWords: []
  });
  meaningSorts.push(...[
  {
    "id": "before-too-little",
    "mode": "prefixes",
    "title": "Before or too little?",
    "teachingNote": "Pre- means before. Under- can mean too little. In this round, look at when something happens or whether enough was done.",
    "completion": "You explored pre- meaning before and under- meaning too little.",
    "groups": [
      {
        "id": "pre",
        "heading": "Before",
        "cards": [
          {
            "word": "preschool",
            "explanation": "Pre- means before. Preschool is for children before they begin school."
          },
          {
            "word": "precook",
            "explanation": "Pre- means before. To precook the rice is to cook it before a later step."
          }
        ]
      },
      {
        "id": "under",
        "heading": "Too little",
        "cards": [
          {
            "word": "undercook",
            "explanation": "Here under- means too little. If you undercook the rice, you have not cooked it enough."
          },
          {
            "word": "underpaid",
            "explanation": "Here under- means too little. An underpaid worker receives less pay than the work deserves."
          }
        ]
      }
    ],
    "excludedWords": []
  },
  {
    "id": "sound-heat",
    "mode": "roots",
    "title": "Sound or heat?",
    "teachingNote": "Phon connects words with sound. Therm connects words with heat. Use the pictures, meanings and sentences to explore the connection.",
    "completion": "You explored phon meaning sound and therm meaning heat.",
    "groups": [
      {
        "id": "phon",
        "heading": "Have to do with sound",
        "cards": [
          {
            "word": "phonics",
            "explanation": "Phon means sound. Phonics connects letters and letter groups with the sounds they represent."
          },
          {
            "word": "telephone",
            "explanation": "Phon means sound. A telephone carries the sound of voices so people can speak across a distance."
          }
        ]
      },
      {
        "id": "therm",
        "heading": "Have to do with heat",
        "cards": [
          {
            "word": "thermal",
            "explanation": "Therm means heat. Thermal describes something connected with heat."
          },
          {
            "word": "geothermal",
            "explanation": "Therm means heat. Geothermal describes heat from within Earth."
          }
        ]
      }
    ],
    "excludedWords": []
  },
  {
    "id": "looking-measuring",
    "mode": "roots",
    "title": "Looking or measuring?",
    "teachingNote": "Scop/scope connects words with looking or examining. Metr/meter connects words with measuring.",
    "completion": "You explored word parts connected with looking and measuring.",
    "groups": [
      {
        "id": "scop",
        "heading": "Have to do with looking",
        "cards": [
          {
            "word": "microscope",
            "explanation": "Scope connects with looking or examining. A microscope helps us look at things too small to see clearly with our eyes alone."
          },
          {
            "word": "telescope",
            "explanation": "Scope connects with looking. A telescope helps us look at faraway things."
          }
        ]
      },
      {
        "id": "metr",
        "heading": "Have to do with measuring",
        "cards": [
          {
            "word": "metric",
            "explanation": "Metr means measure. Metric describes a system of measurement that uses units such as meters and grams."
          },
          {
            "word": "diameter",
            "explanation": "Meter connects with measuring. A diameter measures across a circle through its center."
          }
        ]
      }
    ],
    "excludedWords": []
  },
  {
    "id": "hearing-skin",
    "mode": "roots",
    "title": "Hearing or skin?",
    "teachingNote": "Aud connects words with hearing. Derm connects words with skin. Read the sentence to explore each meaning.",
    "completion": "You explored aud meaning hear and derm meaning skin.",
    "groups": [
      {
        "id": "aud",
        "heading": "Have to do with hearing",
        "cards": [
          {
            "word": "audio",
            "explanation": "Aud means hear. Audio is sound that people can listen to."
          },
          {
            "word": "audience",
            "explanation": "Aud connects with hearing. In this sentence, the audience is the group listening to the performance."
          }
        ]
      },
      {
        "id": "derm",
        "heading": "Have to do with skin",
        "cards": [
          {
            "word": "dermal",
            "explanation": "Derm means skin. Dermal describes something connected with skin."
          },
          {
            "word": "dermatology",
            "explanation": "Derm means skin. Dermatology is the branch of medicine concerned with skin."
          }
        ]
      }
    ],
    "excludedWords": []
  }
]);
  // Additional supported contrasts; existing placements and protection rules remain authoritative.
  Object.assign(sortContexts, {
  "forecast": "The forecast tells us what weather may come tomorrow.",
  "forehead": "She wore a headband across her forehead, above her eyes.",
  "midday": "At midday, we stopped for lunch.",
  "midfield": "The ball stopped at midfield, halfway along the field.",
  "motion": "The wheel stayed in motion, turning steadily.",
  "movement": "The movement of the flag showed that the wind was blowing.",
  "construct": "We construct a shelter by building it from branches.",
  "structure": "The bridge is a structure built across the river.",
  "illegal": "Parking here is illegal: the law does not allow it.",
  "irregular": "The irregular pattern did not repeat in an even way.",
  "inbound": "The inbound train was coming into the city.",
  "immerse": "We immerse the cloth by putting it completely into the water.",
  "creative": "The creative child thought of a new way to build the tower.",
  "sensitive": "The sensitive instrument detected a tiny change in temperature.",
  "artist": "The artist creates art.",
  "pianist": "The pianist plays the piano.",
  "geology": "Geology is the study of Earth and its rocks.",
  "psychology": "Psychology is the study of the mind and behavior.",
  "scientist": "The scientist studies the natural world.",
  "chronological": "We placed the events in chronological order, from earliest to latest.",
  "synchronize": "We synchronize our clocks so they show the same time.",
  "dermal": "The nurse explained that dermal tissue is skin tissue.",
  "dermatology": "The dermatology clinic treats skin conditions.",
  "sequence": "In this sequence, each number follows the one before it.",
  "consequence": "The wet floor was a consequence of the spilled water.",
  "detention": "During detention, the student had to remain at school after lessons.",
  "retention": "The soil has good water retention: it holds water well.",
  "biography": "A biography is a written account of a life.",
  "biologist": "The biologist studies living things, including plants and animals.",
  "thermal": "Thermal energy moved from the hot mug to my hands.",
  "geothermal": "Geothermal heat comes from inside Earth."
});
  meaningSorts.push(...[
  {
    "id": "front-middle",
    "mode": "prefixes",
    "title": "Before or in front, or in the middle?",
    "teachingNote": "Fore- connects with before or in front. Mid- connects with the middle. A sentence helps us choose the intended sense.",
    "completion": "You explored before or in front, or in the middle.",
    "groups": [
      {
        "id": "fore",
        "heading": "Before or in front",
        "cards": [
          {
            "word": "forecast",
            "explanation": "Fore- connects with before. A forecast tells what is expected before it happens."
          },
          {
            "word": "forehead",
            "explanation": "Fore- connects with the front. Your forehead is at the front of your head, above your eyes."
          }
        ]
      },
      {
        "id": "mid",
        "heading": "In the middle",
        "cards": [
          {
            "word": "midday",
            "explanation": "Mid- means middle. Midday is the middle of the day."
          },
          {
            "word": "midfield",
            "explanation": "Mid- means middle. Midfield is the middle area of the playing field."
          }
        ]
      }
    ],
    "excludedWords": []
  },
  {
    "id": "moving-building",
    "mode": "roots",
    "title": "Moving or building?",
    "teachingNote": "Mot/mov connects with moving. Struct connects with building. Look at the pictures and read the sentence clues.",
    "completion": "You explored moving or building.",
    "groups": [
      {
        "id": "mot",
        "heading": "Have to do with moving",
        "cards": [
          {
            "word": "motion",
            "explanation": "Mot connects with moving. Motion is movement."
          },
          {
            "word": "movement",
            "explanation": "Mov connects with moving. Movement names the action of moving."
          }
        ]
      },
      {
        "id": "struct",
        "heading": "Have to do with building",
        "cards": [
          {
            "word": "construct",
            "explanation": "Struct connects with building. To construct a shelter is to build it."
          },
          {
            "word": "structure",
            "explanation": "Struct connects with building. Here, a structure is something that has been built."
          }
        ]
      }
    ],
    "excludedWords": []
  },
  {
    "id": "not-into",
    "mode": "prefixes",
    "title": "Not, or in and into?",
    "teachingNote": "The spellings in- and im- can belong to different meaning families. Il- and ir- can also mean not. Use the whole word and sentence, not just its first letters.",
    "completion": "You explored not, or in and into.",
    "groups": [
      {
        "id": "negative-in-family",
        "heading": "Not",
        "cards": [
          {
            "word": "illegal",
            "explanation": "Il- means not in illegal. Illegal means not allowed by law."
          },
          {
            "word": "irregular",
            "explanation": "Ir- means not in irregular. Here, irregular describes a pattern that is not regular or even."
          }
        ]
      },
      {
        "id": "location-in-family",
        "heading": "In or into",
        "cards": [
          {
            "word": "inbound",
            "explanation": "In- means in or into in inbound. The train is traveling inward toward its destination."
          },
          {
            "word": "immerse",
            "explanation": "Im- connects with into in immerse. To immerse the cloth is to put it fully into the water."
          }
        ]
      }
    ],
    "excludedWords": []
  },
  {
    "id": "quality-person",
    "mode": "suffixes",
    "title": "Describing a quality or naming a person?",
    "teachingNote": "In these words, -ive makes adjectives that describe a quality. The ending -ist makes nouns naming people connected with an activity.",
    "completion": "You explored describing a quality or naming a person.",
    "groups": [
      {
        "id": "ive",
        "heading": "Describes a quality",
        "cards": [
          {
            "word": "creative",
            "explanation": "Creative describes someone who can produce new ideas. Here, -ive helps make a describing word, an adjective."
          },
          {
            "word": "sensitive",
            "explanation": "Sensitive describes something that responds to small changes. Here, -ive helps make an adjective."
          }
        ]
      },
      {
        "id": "ist",
        "heading": "Names a person",
        "cards": [
          {
            "word": "artist",
            "explanation": "An artist is a person who creates art. Here, -ist helps name a person."
          },
          {
            "word": "pianist",
            "explanation": "A pianist is a person who plays the piano. Here, -ist helps name a person."
          }
        ]
      }
    ],
    "excludedWords": []
  },
  {
    "id": "study-person",
    "mode": "suffixes",
    "title": "A field of study or a person?",
    "teachingNote": "The ending -ology connects with a field of study. In these words, -ist names a person. The person need not work in one of the fields shown here.",
    "completion": "You explored a field of study or a person.",
    "groups": [
      {
        "id": "ology",
        "heading": "Names a field of study",
        "cards": [
          {
            "word": "geology",
            "explanation": "Geology names a field of study about Earth. The ending -ology helps us recognize the study word."
          },
          {
            "word": "psychology",
            "explanation": "Psychology names a field of study about the mind and behavior. The ending -ology helps identify the field of study."
          }
        ]
      },
      {
        "id": "ist",
        "heading": "Names a person",
        "cards": [
          {
            "word": "scientist",
            "explanation": "A scientist is a person who does scientific work. Here, -ist helps name a person."
          },
          {
            "word": "artist",
            "explanation": "An artist is a person who creates art. The word names a person, not a field of study."
          }
        ]
      }
    ],
    "excludedWords": []
  },
  {
    "id": "time-skin",
    "mode": "roots",
    "title": "Time or skin?",
    "teachingNote": "Chron connects with time. Derm/dermat connects with skin. The explanation shows how the root connects with each whole word.",
    "completion": "You explored time or skin.",
    "groups": [
      {
        "id": "chron",
        "heading": "Have to do with time",
        "cards": [
          {
            "word": "chronological",
            "explanation": "Chron means time. Chronological order arranges events by when they happened."
          },
          {
            "word": "synchronize",
            "explanation": "Chron connects with time. To synchronize these clocks is to make them show the same time."
          }
        ]
      },
      {
        "id": "derm",
        "heading": "Have to do with skin",
        "cards": [
          {
            "word": "dermal",
            "explanation": "Derm means skin. Dermal describes something connected with skin."
          },
          {
            "word": "dermatology",
            "explanation": "Dermat means skin. Dermatology is the branch of medicine concerned with skin."
          }
        ]
      }
    ],
    "excludedWords": []
  },
  {
    "id": "following-holding",
    "mode": "roots",
    "title": "Following or holding and keeping?",
    "teachingNote": "Sequ connects with following. Ten connects with holding or keeping. These historical root meanings help explain the word families; read each sentence for the whole meaning.",
    "completion": "You explored following or holding and keeping.",
    "groups": [
      {
        "id": "sequ",
        "heading": "Have to do with following",
        "cards": [
          {
            "word": "sequence",
            "explanation": "Sequ connects with following. A sequence is an ordered series in which one thing follows another."
          },
          {
            "word": "consequence",
            "explanation": "Sequ connects with following. A consequence is a result that follows from something that happened."
          }
        ]
      },
      {
        "id": "ten",
        "heading": "Have to do with holding or keeping",
        "cards": [
          {
            "word": "detention",
            "explanation": "Ten connects with holding. In this sentence, detention means being required to stay at school."
          },
          {
            "word": "retention",
            "explanation": "Ten connects with holding. Water retention means keeping or holding water."
          }
        ]
      }
    ],
    "excludedWords": []
  },
  {
    "id": "life-heat",
    "mode": "roots",
    "title": "Life or heat?",
    "teachingNote": "Bio connects with life. Therm connects with heat. A life can be the life of one person or the subject of scientific study.",
    "completion": "You explored life or heat.",
    "groups": [
      {
        "id": "bio",
        "heading": "Have to do with life",
        "cards": [
          {
            "word": "biography",
            "explanation": "Bio means life. A biography tells about the life of a person."
          },
          {
            "word": "biologist",
            "explanation": "Bio means life. A biologist is a scientist who studies living things."
          }
        ]
      },
      {
        "id": "therm",
        "heading": "Have to do with heat",
        "cards": [
          {
            "word": "thermal",
            "explanation": "Therm means heat. Thermal describes something connected with heat."
          },
          {
            "word": "geothermal",
            "explanation": "Therm means heat. Geothermal describes heat from within Earth."
          }
        ]
      }
    ],
    "excludedWords": []
  }
]);
  Object.assign(sortContexts, {
  "performance": "The performance of the play lasted one hour.",
  "importance": "The guide explained the importance of clean water.",
  "contestant": "The contestant took part in the contest.",
  "claimant": "The claimant said that the lost bag belonged to her.",
  "existence": "The discovery proved the existence of the ancient village.",
  "persistence": "Her persistence helped her keep trying after several setbacks.",
  "clarify": "Please clarify the instructions so their meaning is clear.",
  "simplify": "We simplify the directions to make them easier to follow.",
  "artist": "The artist creates art.",
  "pianist": "The pianist plays the piano.",
  "interact": "The two groups interact, sharing ideas with each other.",
  "interstate": "The interstate bus travels between two states.",
  "superhero": "In the story, the superhero has extraordinary powers.",
  "superhuman": "The story gives the character superhuman strength.",
  "defrost": "We defrost the freezer to remove the built-up ice.",
  "detach": "We detach the trailer by taking it off the hitch.",
  "insert": "We insert the card by putting it into the slot.",
  "immerse": "We immerse the cloth by putting it completely into the water."
});
  meaningSorts.push(...[
  {
    "id": "ance-person",
    "mode": "suffixes",
    "title": "An action or quality, or a person?",
    "teachingNote": "In these words, -ance makes nouns naming an action or quality. In contestant and claimant, -ant names a person.",
    "completion": "You explored these word meanings and jobs.",
    "groups": [
      {
        "id": "ance",
        "heading": "Names an action or quality",
        "cards": [
          {
            "word": "performance",
            "explanation": "Performance names the act of performing, not the person performing. Here, -ance helps make the action noun."
          },
          {
            "word": "importance",
            "explanation": "Importance names the quality of being important. Here, -ance makes a noun naming a quality."
          }
        ]
      },
      {
        "id": "ant-ent-agent",
        "heading": "Names a person",
        "cards": [
          {
            "word": "contestant",
            "explanation": "A contestant is a person taking part in a contest. In this word, -ant helps name a person."
          },
          {
            "word": "claimant",
            "explanation": "A claimant is a person who makes a claim. In this word, -ant helps name a person."
          }
        ]
      }
    ],
    "excludedWords": []
  },
  {
    "id": "ence-person",
    "mode": "suffixes",
    "title": "A state, or a person?",
    "teachingNote": "In these words, -ence makes nouns naming states. In contestant and claimant, -ant names a person. The endings -ance and -ence can have similar jobs.",
    "completion": "You explored these word meanings and jobs.",
    "groups": [
      {
        "id": "ence",
        "heading": "Names a state",
        "cards": [
          {
            "word": "existence",
            "explanation": "Existence names the state of existing or being real. Here, -ence helps make a noun naming a state."
          },
          {
            "word": "persistence",
            "explanation": "Persistence names continuing to try or carry on. Here, -ence helps name that state, not a person."
          }
        ]
      },
      {
        "id": "ant-ent-agent",
        "heading": "Names a person",
        "cards": [
          {
            "word": "contestant",
            "explanation": "A contestant is a person taking part in a contest. In this word, -ant helps name a person."
          },
          {
            "word": "claimant",
            "explanation": "A claimant is a person who makes a claim. In this word, -ant helps name a person."
          }
        ]
      }
    ],
    "excludedWords": []
  },
  {
    "id": "make-person",
    "mode": "suffixes",
    "title": "Making something change, or naming a person?",
    "teachingNote": "In these verbs, -ify connects with making something become a certain way. In the other group, -ist names a person.",
    "completion": "You explored these word meanings and jobs.",
    "groups": [
      {
        "id": "ify",
        "heading": "Make something become",
        "cards": [
          {
            "word": "clarify",
            "explanation": "To clarify is to make clear. Here, -ify helps make a verb about causing a change."
          },
          {
            "word": "simplify",
            "explanation": "To simplify is to make simpler. Here, -ify helps make a verb about causing a change."
          }
        ]
      },
      {
        "id": "ist",
        "heading": "Names a person",
        "cards": [
          {
            "word": "artist",
            "explanation": "An artist is a person who creates art. Here, -ist helps name a person."
          },
          {
            "word": "pianist",
            "explanation": "A pianist is a person who plays the piano. Here, -ist helps name a person."
          }
        ]
      }
    ],
    "excludedWords": []
  },
  {
    "id": "between-beyond",
    "mode": "prefixes",
    "title": "Between, or beyond the usual?",
    "teachingNote": "Inter- connects with between or among. In these story words, super- connects with abilities beyond the usual.",
    "completion": "You explored these word meanings and jobs.",
    "groups": [
      {
        "id": "inter",
        "heading": "Between or among",
        "cards": [
          {
            "word": "interact",
            "explanation": "Inter- connects with between. When groups interact, their actions or communication pass between them."
          },
          {
            "word": "interstate",
            "explanation": "Inter- means between in interstate. This bus travels between states."
          }
        ]
      },
      {
        "id": "super",
        "heading": "Beyond the usual",
        "cards": [
          {
            "word": "superhero",
            "explanation": "Super- connects with beyond the usual. This superhero has powers beyond those of an ordinary person."
          },
          {
            "word": "superhuman",
            "explanation": "Super- connects with beyond. Superhuman strength is greater than an ordinary human has."
          }
        ]
      }
    ],
    "excludedWords": []
  },
  {
    "id": "remove-into",
    "mode": "prefixes",
    "title": "Taking away or putting in?",
    "teachingNote": "In these words, de- connects with taking away or off. The location family in-/im- connects with in or into.",
    "completion": "You explored these word meanings and jobs.",
    "groups": [
      {
        "id": "de",
        "heading": "Take away or off",
        "cards": [
          {
            "word": "defrost",
            "explanation": "De- connects with removal here. To defrost the freezer is to remove its frost or ice."
          },
          {
            "word": "detach",
            "explanation": "De- connects with taking off or away. To detach is to separate something that was attached."
          }
        ]
      },
      {
        "id": "location-in-family",
        "heading": "Put in or into",
        "cards": [
          {
            "word": "insert",
            "explanation": "In- means into in insert. To insert the card is to put it into something."
          },
          {
            "word": "immerse",
            "explanation": "Im- connects with into in immerse. To immerse the cloth is to put it fully into the water."
          }
        ]
      }
    ],
    "excludedWords": []
  }
]);
  function buildMeaningRounds(mode, items, eligibleItem, eligibleWord) {
    return meaningSorts.filter(spec => spec.mode === mode).map(spec => {
      const targets = spec.groups.map(group => {
        const item = items.find(item => item.id === group.id);
        return item && eligibleItem(item) ? { ...item, heading: group.heading } : null;
      });
      // Keep every meaning and at least two examples of each after filtering.
      if (targets.some(target => !target)) return null;
      const candidates = spec.groups.flatMap(group => group.cards);
      const cards = spec.groups.flatMap(group => group.cards
        .filter(card => eligibleWord(card.word) && !spec.excludedWords.includes(card.word)
          && candidates.filter(other => other.word === card.word).length === 1)
        .map(card => ({ ...card, targetId: group.id,
          ...segment(card.word, targets.find(target => target.id === group.id)),
          context: sortContexts[card.word], cardId: `${spec.id}-${card.word}` })));
      if (targets.some(target => cards.filter(card => card.targetId === target.id).length < 2)) return null;
      return {
        id: spec.id, type: "meaning-sort", kicker: "Learn · Sort by meaning",
        title: spec.title,
        instructions: "Use the word-part pictures and meanings to help you. Choose a word, then the meaning it connects with.",
        teachingNote: spec.teachingNote,
        targets, cards,
        completion: spec.completion
      };
    }).filter(Boolean);
  }
  function buildRounds(mode, items, eligibleItem, eligibleWord) {
    const kind = mode === "roots" ? "root" : mode === "prefixes" ? "prefix" : "suffix";
    const label = kind.charAt(0).toUpperCase() + kind.slice(1) + (kind === "root" ? "s" : "es");
    const familyRounds = (roundGroups[mode] || []).map((ids) => {
      const targets = ids.map(id => items.find(item => item.id === id)).filter(item => item && eligibleItem(item));
      const candidates = targets.flatMap(item => examples(item).filter(word => sortContexts[word] && eligibleWord(word)).map(word => ({ word, context: sortContexts[word], hint: sortHints[word] || "", targetId: item.id, ...segment(word, item) })).filter(card => card.target));
      // Do not ask for one answer when the same word belongs in two shown families.
      const counts = new Map();
      for (const card of candidates) counts.set(card.word, (counts.get(card.word) || 0) + 1);
      const cards = targets.flatMap(item => candidates.filter(card => card.targetId === item.id && counts.get(card.word) === 1).slice(0, 3));
      const active = targets.filter(item => cards.some(card => card.targetId === item.id));
      if (active.length < 2 || cards.length < 4) return null;
      return {
        type: `${kind}-family`,
        kicker: `Sort It · ${label}`,
        title: `Which ${kind} meaning or job fits this word?`,
        instructions: `Choose a word, then its ${kind} group. Read the sentence to choose the meaning or word job used here.`,
        teachingNote: mode === "prefixes" ? "A prefix comes before a base and adds to or changes its meaning." : mode === "roots" ? "Roots connect words through meaning and history. Use the sentence clues; a whole word can mean more than its parts." : "The same ending can have different jobs. For example, -er can name a person or compare two things.",
        targets: active,
        cards: cards.map((card, i) => ({...card, cardId: `${mode}-${card.targetId}-${i}`})),
        completion: `You sorted ${cards.length} words into ${active.length} ${kind} families.`
      };
    }).filter(Boolean);
    return [...buildMeaningRounds(mode, items, eligibleItem, eligibleWord), ...familyRounds];
  }

  // September 28 coverage expansion: Learn-only, with existing inventory taking precedence.
  Object.assign(additions, {
  "en-em": [
    "enlarge",
    "endanger"
  ],
  "pre": [
    "precook"
  ],
  "trans": [
    "transform",
    "transplant"
  ],
  "ab": [
    "ablate"
  ],
  "e-ex": [
    "exclude"
  ],
  "retro": [
    "retro-rocket",
    "retrofire"
  ],
  "con-com": [
    "construct"
  ],
  "bio": [
    "biologist"
  ],
  "port": [
    "support"
  ],
  "rupt": [
    "eruption"
  ],
  "ful": [
    "playful"
  ],
  "less": [
    "harmless",
    "endless"
  ],
  "able-ible": [
    "lovable",
    "enjoyable"
  ]
});
  Object.assign(metadata, {
  "enlarge": {
    "practiceBand": "2-3",
    "vocabLevel": "familiar",
    "placementStatus": "Editorial recommendation; not norm-verified",
    "source": "https://www.merriam-webster.com/dictionary/enlarge"
  },
  "endanger": {
    "practiceBand": "2-3",
    "vocabLevel": "familiar",
    "placementStatus": "Editorial recommendation; not norm-verified",
    "source": "https://www.merriam-webster.com/dictionary/endanger"
  },
  "lovable": {
    "practiceBand": "2-3",
    "vocabLevel": "familiar",
    "placementStatus": "Editorial recommendation; not norm-verified",
    "source": "https://www.merriam-webster.com/dictionary/lovable"
  },
  "enjoyable": {
    "practiceBand": "2-3",
    "vocabLevel": "familiar",
    "placementStatus": "Editorial recommendation; not norm-verified",
    "source": "https://www.merriam-webster.com/dictionary/enjoyable"
  },
  "transplant": {
    "practiceBand": "4-5",
    "vocabLevel": "academic",
    "placementStatus": "Editorial recommendation; not norm-verified",
    "source": "https://www.merriam-webster.com/dictionary/transplant"
  },
  "exclude": {
    "practiceBand": "4-5",
    "vocabLevel": "academic",
    "placementStatus": "Editorial recommendation; not norm-verified",
    "source": "https://www.merriam-webster.com/dictionary/exclude"
  },
  "ablate": {
    "practiceBand": "6-8",
    "vocabLevel": "academic",
    "placementStatus": "Editorial recommendation; not norm-verified",
    "source": "https://www.merriam-webster.com/dictionary/ablate"
  },
  "retro-rocket": {
    "practiceBand": "6-8",
    "vocabLevel": "academic",
    "placementStatus": "Editorial recommendation; not norm-verified",
    "source": "https://www.merriam-webster.com/dictionary/retro-rocket"
  },
  "retrofire": {
    "practiceBand": "6-8",
    "vocabLevel": "academic",
    "placementStatus": "Editorial recommendation; not norm-verified",
    "source": "https://www.merriam-webster.com/dictionary/retrofire"
  }
});
  Object.assign(worked, {
  "en-em": {
    "word": "enlarge",
    "parts": "en- + large → enlarge",
    "explanation": "En- can mean make. Enlarge means make larger. This pattern does not work with every describing word.",
    "sentence": "We enlarge the map to see the streets.",
    "question": "What changes when we enlarge the map?",
    "choices": [
      "It becomes larger",
      "It becomes smaller"
    ],
    "answer": 0
  },
  "trans": {
    "word": "transplant",
    "parts": "trans- + plant → transplant",
    "explanation": "Trans- can mean across or from one place to another. To transplant a plant is to move it and plant it in a new place.",
    "sentence": "We transplant the seedling from its pot to the garden.",
    "question": "What does trans- contribute here?",
    "choices": [
      "A plant that stays in its pot",
      "A move to another place"
    ],
    "answer": 1
  },
  "semi": {
    "word": "semisweet",
    "parts": "semi- + sweet → semisweet",
    "explanation": "Semi- can mean partly, as well as half. Semisweet chocolate is somewhat sweet; the word does not give an exact half-measure.",
    "sentence": "We used semisweet chocolate in the cookies.",
    "question": "How sweet is the chocolate?",
    "choices": [
      "Somewhat sweet",
      "Exactly half a chocolate bar"
    ],
    "answer": 0
  },
  "anti": {
    "word": "antifreeze",
    "parts": "anti- + freeze → antifreeze",
    "explanation": "Anti- can mean against. Antifreeze is a substance used to help prevent a liquid from freezing.",
    "sentence": "The mechanic checks the antifreeze before winter.",
    "question": "What is antifreeze used to help prevent?",
    "choices": [
      "Melting",
      "Freezing"
    ],
    "answer": 1
  },
  "ab": {
    "word": "absent",
    "parts": "Historical prefix focus: ab- in absent",
    "explanation": "Ab- carries the idea away. Someone absent from a meeting is not there. The rest of absent is not the English word sent.",
    "sentence": "One team member was absent from the meeting.",
    "question": "Where was that team member?",
    "choices": [
      "Not at the meeting",
      "At the meeting early"
    ],
    "answer": 0
  },
  "a-ad": {
    "word": "adhere",
    "parts": "Historical prefix focus: ad- in adhere",
    "explanation": "Ad- can carry the idea to or toward. Adhere means stick to something. Here the connection is physical; in other contexts people adhere to rules.",
    "sentence": "The label must adhere to the jar.",
    "question": "What must the label do?",
    "choices": [
      "Fall away from the jar",
      "Stick to the jar"
    ],
    "answer": 1
  },
  "con-com": {
    "word": "connect",
    "parts": "Historical prefix focus: con- in connect",
    "explanation": "Con- can mean together. To connect two things is to join them. Not every word starting con has this prefix.",
    "sentence": "We connect the two tracks.",
    "question": "What happens to the tracks?",
    "choices": [
      "They join together",
      "They move apart"
    ],
    "answer": 0
  },
  "e-ex": {
    "word": "exclude",
    "parts": "Historical prefix focus: ex- in exclude",
    "explanation": "Ex- can mean out. Exclude means keep out or leave out. The meaning of the whole word and its sentence help us understand this older word family.",
    "sentence": "We exclude broken pieces from the model.",
    "question": "Which pieces stay out?",
    "choices": [
      "All the unbroken pieces",
      "The broken pieces"
    ],
    "answer": 1
  },
  "pro": {
    "word": "proceed",
    "parts": "Historical prefix focus: pro- in proceed",
    "explanation": "Pro- can mean forward. Proceed means go forward or continue. The whole word matters: pro does not have this meaning in every word.",
    "sentence": "After the stop, we proceed along the path.",
    "question": "What do we do?",
    "choices": [
      "Continue forward",
      "Stay stopped"
    ],
    "answer": 0
  },
  "retro": {
    "word": "retro-rocket",
    "parts": "retro- (backward) + rocket",
    "explanation": "A retro-rocket slows a spacecraft by producing thrust against its motion. Retro- helps connect this word to backward or opposing movement; the spacecraft need not travel backward.",
    "sentence": "The retro-rocket slows the spacecraft.",
    "question": "What is the rocket doing here?",
    "choices": [
      "Making it travel faster in the same direction",
      "Slowing the spacecraft"
    ],
    "answer": 1
  },
  "circum": {
    "word": "circumference",
    "parts": "Prefix focus: circum- in circumference",
    "explanation": "Circum- means around. Circumference is the distance around a circle. It is different from the distance straight across its center.",
    "sentence": "We measure the circumference of the round lid.",
    "question": "Where do we measure?",
    "choices": [
      "Around the edge",
      "Straight across the center"
    ],
    "answer": 0
  },
  "duct": {
    "word": "conduct",
    "parts": "Root focus: duct in conduct",
    "explanation": "Duct/duce carries the idea lead. Here conduct is a verb meaning lead or direct. The noun conduct can mean behavior, so use the sentence to choose the sense.",
    "sentence": "The musician will conduct the orchestra.",
    "question": "What will the musician do?",
    "choices": [
      "Describe their behavior",
      "Lead the players"
    ],
    "answer": 1
  },
  "ject": {
    "word": "project",
    "parts": "pro- (forward) + ject (throw)",
    "explanation": "Ject has a historical meaning throw. Here project is a verb: send or cast an image forward onto a surface. A school project uses a different sense.",
    "sentence": "The device can project an image onto the wall.",
    "question": "What is being sent onto the wall?",
    "choices": [
      "An image",
      "A school assignment"
    ],
    "answer": 0
  },
  "mit": {
    "word": "submit",
    "parts": "Root focus: mit in submit",
    "explanation": "Mit/miss carries the idea send. In this sentence submit means send or hand in for someone to consider. Other senses, such as giving in, need their own context.",
    "sentence": "Please submit your story to the editor.",
    "question": "What should you do with the story?",
    "choices": [
      "Keep it hidden",
      "Send it for consideration"
    ],
    "answer": 1
  },
  "port": {
    "word": "porter",
    "parts": "Root focus: port in porter",
    "explanation": "Port carries the idea carry. A porter is a person whose work can include carrying bags. This root is different from port meaning a harbor.",
    "sentence": "The porter carried our bags to the room.",
    "question": "What work is the porter doing?",
    "choices": [
      "Carrying bags",
      "Steering a ship into a harbor"
    ],
    "answer": 0
  },
  "pos": {
    "word": "deposit",
    "parts": "Root focus: posit in deposit",
    "explanation": "Pos/posit carries the idea place or put. As a verb, deposit can mean put something somewhere. A noun deposit names something placed or left.",
    "sentence": "The river can deposit sand on its banks.",
    "question": "What does the river do with the sand?",
    "choices": [
      "Makes it disappear",
      "Leaves it in a place"
    ],
    "answer": 1
  },
  "put": {
    "word": "compute",
    "parts": "Root focus: put in compute",
    "explanation": "This Latin root carries the idea think or reckon. Compute means calculate. It is not the everyday English word put meaning place.",
    "sentence": "We compute the total cost of the tickets.",
    "question": "What are we doing?",
    "choices": [
      "Calculating the cost",
      "Putting tickets in a box"
    ],
    "answer": 0
  },
  "rupt": {
    "word": "rupture",
    "parts": "Root focus: rupt in rupture",
    "explanation": "Rupt carries the idea break or burst. Here rupture is a verb meaning break open. It can also be a noun naming a break.",
    "sentence": "Too much pressure can rupture the pipe.",
    "question": "What can happen to the pipe?",
    "choices": [
      "It can grow longer",
      "It can break open"
    ],
    "answer": 1
  },
  "spect": {
    "word": "perspective",
    "parts": "Root focus: spect in perspective",
    "explanation": "Spect has a historical connection to looking. Perspective can mean a way of viewing or thinking about something. Here the looking is figurative.",
    "sentence": "We heard the story from the coach’s perspective.",
    "question": "Whose way of seeing the event did we hear?",
    "choices": [
      "The coach’s",
      "Every person’s at once"
    ],
    "answer": 0
  },
  "val": {
    "word": "valid",
    "parts": "Root focus: val in valid",
    "explanation": "Val has a historical connection to strength or worth. A valid reason is sound: it supports the claim. It does not mean a physically strong reason.",
    "sentence": "She gave a valid reason for changing the plan.",
    "question": "What kind of reason did she give?",
    "choices": [
      "A reason about lifting heavy things",
      "A sound reason that supports the change"
    ],
    "answer": 1
  },
  "act": {
    "word": "active",
    "parts": "Word family: act ↔ active",
    "explanation": "Act connects with doing. Active describes someone or something doing things or taking part. Here it describes a person.",
    "sentence": "The active child ran and played.",
    "question": "What does active tell us?",
    "choices": [
      "The child was doing things",
      "The child was completely still"
    ],
    "answer": 0
  },
  "auto": {
    "word": "autobiography",
    "parts": "auto- (self) + biography (life account)",
    "explanation": "Auto- means self. An autobiography is an account of a person’s life written by that person. A biography may be written by someone else.",
    "sentence": "The athlete wrote an autobiography.",
    "question": "Whose life did the athlete write about?",
    "choices": [
      "Only the coach’s life",
      "The athlete’s own life"
    ],
    "answer": 1
  },
  "biblio": {
    "word": "bibliography",
    "parts": "Root focus: biblio- in bibliography",
    "explanation": "Biblio- connects with books. A bibliography lists books or other sources used for a piece of work. Today it can include websites, too.",
    "sentence": "Our report ends with a bibliography.",
    "question": "What should we find there?",
    "choices": [
      "A list of the sources used",
      "Only a story about a library"
    ],
    "answer": 0
  },
  "ize": {
    "word": "organize",
    "parts": "Suffix focus: -ize in organize",
    "explanation": "-Ize often helps form verbs. Organize means arrange or put in order. This established word cannot be explained by treating organ as an ordinary base to which any ending can be added.",
    "sentence": "We organize the books by subject.",
    "question": "What are we doing?",
    "choices": [
      "Describing how tall the books are",
      "Arranging the books"
    ],
    "answer": 1
  },
  "able-ible": {
    "word": "enjoyable",
    "parts": "enjoy + -able → enjoyable",
    "explanation": "-Able helps form an adjective. Enjoyable describes something that gives pleasure or can be enjoyed. Not every adjective can take this ending.",
    "sentence": "The game was enjoyable.",
    "question": "What does enjoyable describe?",
    "choices": [
      "What the game was like",
      "A person who makes games"
    ],
    "answer": 0
  },
  "ion": {
    "word": "action",
    "parts": "act + -ion → action",
    "explanation": "-Ion can help form a noun naming an act or process. Action names doing something. Related endings may involve spelling changes; do not attach them to every verb.",
    "sentence": "Helping the lost child was a kind action.",
    "question": "What does action name?",
    "choices": [
      "A word describing the child’s height",
      "Something done"
    ],
    "answer": 1
  },
  "ment": {
    "word": "enjoyment",
    "parts": "enjoy + -ment → enjoyment",
    "explanation": "-Ment can help form a noun. Enjoyment names the pleasure of enjoying something. We cannot add -ment to every verb.",
    "sentence": "The music gave us enjoyment.",
    "question": "What does enjoyment name?",
    "choices": [
      "The pleasure we felt",
      "The person playing music"
    ],
    "answer": 0
  }
});
  Object.assign(practice, {
  "enlarge": {
    "sentence": "Please enlarge the tiny photo.",
    "question": "What should happen to the photo?",
    "choices": [
      "It should be put inside a box",
      "It should become easier to see because it is larger"
    ],
    "answer": 1,
    "feedback": [
      "Use the sentence clue: It should become easier to see because it is larger. En- can mean make. Enlarge means make larger. This pattern does not work with every describing word.",
      "It should become easier to see because it is larger. En- can mean make. Enlarge means make larger. This pattern does not work with every describing word."
    ]
  },
  "transplant": {
    "sentence": "We transplant the rose to a sunnier spot.",
    "question": "Which action fits?",
    "choices": [
      "Dig it up and plant it in the new spot",
      "Water it without moving it"
    ],
    "answer": 0,
    "feedback": [
      "Dig it up and plant it in the new spot. Trans- can mean across or from one place to another. To transplant a plant is to move it and plant it in a new place.",
      "Use the sentence clue: Dig it up and plant it in the new spot. Trans- can mean across or from one place to another. To transplant a plant is to move it and plant it in a new place."
    ]
  },
  "semisweet": {
    "sentence": "The recipe calls for semisweet chocolate.",
    "question": "Which clue does semi- give?",
    "choices": [
      "Always exactly fifty percent sugar",
      "Partly sweet"
    ],
    "answer": 1,
    "feedback": [
      "Use the sentence clue: Partly sweet. Semi- can mean partly, as well as half. Semisweet chocolate is somewhat sweet; the word does not give an exact half-measure.",
      "Partly sweet. Semi- can mean partly, as well as half. Semisweet chocolate is somewhat sweet; the word does not give an exact half-measure."
    ]
  },
  "antifreeze": {
    "sentence": "Antifreeze helps the engine liquid stay liquid in cold weather.",
    "question": "Which meaning of anti- fits?",
    "choices": [
      "Against freezing",
      "Freezing again"
    ],
    "answer": 0,
    "feedback": [
      "Against freezing. Anti- can mean against. Antifreeze is a substance used to help prevent a liquid from freezing.",
      "Use the sentence clue: Against freezing. Anti- can mean against. Antifreeze is a substance used to help prevent a liquid from freezing."
    ]
  },
  "absent": {
    "sentence": "The teacher marked Lee absent from class.",
    "question": "What does absent tell us?",
    "choices": [
      "Lee was sitting at the front",
      "Lee was not there"
    ],
    "answer": 1,
    "feedback": [
      "Use the sentence clue: Lee was not there. Ab- carries the idea away. Someone absent from a meeting is not there. The rest of absent is not the English word sent.",
      "Lee was not there. Ab- carries the idea away. Someone absent from a meeting is not there. The rest of absent is not the English word sent."
    ]
  },
  "adhere": {
    "sentence": "The tape will adhere to the cardboard.",
    "question": "Which result fits adhere?",
    "choices": [
      "The tape stays attached",
      "The tape slips off"
    ],
    "answer": 0,
    "feedback": [
      "The tape stays attached. Ad- can carry the idea to or toward. Adhere means stick to something. Here the connection is physical; in other contexts people adhere to rules.",
      "Use the sentence clue: The tape stays attached. Ad- can carry the idea to or toward. Adhere means stick to something. Here the connection is physical; in other contexts people adhere to rules."
    ]
  },
  "connect": {
    "sentence": "Connect the dots to make a shape.",
    "question": "What should you do?",
    "choices": [
      "Erase all the dots",
      "Join the dots with lines"
    ],
    "answer": 1,
    "feedback": [
      "Use the sentence clue: Join the dots with lines. Con- can mean together. To connect two things is to join them. Not every word starting con has this prefix.",
      "Join the dots with lines. Con- can mean together. To connect two things is to join them. Not every word starting con has this prefix."
    ]
  },
  "exclude": {
    "sentence": "Exclude the blank pages when counting the written pages.",
    "question": "Which pages should you leave out?",
    "choices": [
      "The blank pages",
      "The pages with writing"
    ],
    "answer": 0,
    "feedback": [
      "The blank pages. Ex- can mean out. Exclude means keep out or leave out. The meaning of the whole word and its sentence help us understand this older word family.",
      "Use the sentence clue: The blank pages. Ex- can mean out. Exclude means keep out or leave out. The meaning of the whole word and its sentence help us understand this older word family."
    ]
  },
  "proceed": {
    "sentence": "When the light changes, the walkers proceed.",
    "question": "What happens next?",
    "choices": [
      "They remain still",
      "They continue walking"
    ],
    "answer": 1,
    "feedback": [
      "Use the sentence clue: They continue walking. Pro- can mean forward. Proceed means go forward or continue. The whole word matters: pro does not have this meaning in every word.",
      "They continue walking. Pro- can mean forward. Proceed means go forward or continue. The whole word matters: pro does not have this meaning in every word."
    ]
  },
  "retro-rocket": {
    "sentence": "The capsule uses a retro-rocket before landing.",
    "question": "Which purpose fits?",
    "choices": [
      "Reduce its forward speed",
      "Increase its forward speed"
    ],
    "answer": 0,
    "feedback": [
      "Reduce its forward speed. A retro-rocket slows a spacecraft by producing thrust against its motion. Retro- helps connect this word to backward or opposing movement; the spacecraft need not travel backward.",
      "Use the sentence clue: Reduce its forward speed. A retro-rocket slows a spacecraft by producing thrust against its motion. Retro- helps connect this word to backward or opposing movement; the spacecraft need not travel backward."
    ]
  },
  "circumference": {
    "sentence": "Wrap a string around a wheel to find its circumference.",
    "question": "Which part does the string follow?",
    "choices": [
      "A straight line through the middle",
      "The outside edge"
    ],
    "answer": 1,
    "feedback": [
      "Use the sentence clue: The outside edge. Circum- means around. Circumference is the distance around a circle. It is different from the distance straight across its center.",
      "The outside edge. Circum- means around. Circumference is the distance around a circle. It is different from the distance straight across its center."
    ]
  },
  "conduct": {
    "sentence": "Rae will conduct the meeting.",
    "question": "What will Rae do?",
    "choices": [
      "Lead the meeting",
      "Leave before it starts"
    ],
    "answer": 0,
    "feedback": [
      "Lead the meeting. Duct/duce carries the idea lead. Here conduct is a verb meaning lead or direct. The noun conduct can mean behavior, so use the sentence to choose the sense.",
      "Use the sentence clue: Lead the meeting. Duct/duce carries the idea lead. Here conduct is a verb meaning lead or direct. The noun conduct can mean behavior, so use the sentence to choose the sense."
    ]
  },
  "project": {
    "sentence": "We project a map onto the screen.",
    "question": "Which meaning fits project here?",
    "choices": [
      "Complete a homework assignment",
      "Show the map by sending its image onto the screen"
    ],
    "answer": 1,
    "feedback": [
      "Use the sentence clue: Show the map by sending its image onto the screen. Ject has a historical meaning throw. Here project is a verb: send or cast an image forward onto a surface. A school project uses a different sense.",
      "Show the map by sending its image onto the screen. Ject has a historical meaning throw. Here project is a verb: send or cast an image forward onto a surface. A school project uses a different sense."
    ]
  },
  "submit": {
    "sentence": "We submit our design to the judges.",
    "question": "What happens to the design?",
    "choices": [
      "It is handed in for judging",
      "It is erased before anyone sees it"
    ],
    "answer": 0,
    "feedback": [
      "It is handed in for judging. Mit/miss carries the idea send. In this sentence submit means send or hand in for someone to consider. Other senses, such as giving in, need their own context.",
      "Use the sentence clue: It is handed in for judging. Mit/miss carries the idea send. In this sentence submit means send or hand in for someone to consider. Other senses, such as giving in, need their own context."
    ]
  },
  "porter": {
    "sentence": "A porter helped move the heavy luggage.",
    "question": "Which root meaning fits?",
    "choices": [
      "Write",
      "Carry"
    ],
    "answer": 1,
    "feedback": [
      "Use the sentence clue: Carry. Port carries the idea carry. A porter is a person whose work can include carrying bags. This root is different from port meaning a harbor.",
      "Carry. Port carries the idea carry. A porter is a person whose work can include carrying bags. This root is different from port meaning a harbor."
    ]
  },
  "deposit": {
    "sentence": "Please deposit the form in the box.",
    "question": "What should you do?",
    "choices": [
      "Put the form in the box",
      "Read it without putting it anywhere"
    ],
    "answer": 0,
    "feedback": [
      "Put the form in the box. Pos/posit carries the idea place or put. As a verb, deposit can mean put something somewhere. A noun deposit names something placed or left.",
      "Use the sentence clue: Put the form in the box. Pos/posit carries the idea place or put. As a verb, deposit can mean put something somewhere. A noun deposit names something placed or left."
    ]
  },
  "compute": {
    "sentence": "Compute the distance traveled in two days.",
    "question": "What does compute ask you to do?",
    "choices": [
      "Choose a place to stand",
      "Calculate the distance"
    ],
    "answer": 1,
    "feedback": [
      "Use the sentence clue: Calculate the distance. This Latin root carries the idea think or reckon. Compute means calculate. It is not the everyday English word put meaning place.",
      "Calculate the distance. This Latin root carries the idea think or reckon. Compute means calculate. It is not the everyday English word put meaning place."
    ]
  },
  "rupture": {
    "sentence": "A sharp stone can rupture the thin bag.",
    "question": "Which result fits?",
    "choices": [
      "The bag breaks open",
      "The bag becomes stronger"
    ],
    "answer": 0,
    "feedback": [
      "The bag breaks open. Rupt carries the idea break or burst. Here rupture is a verb meaning break open. It can also be a noun naming a break.",
      "Use the sentence clue: The bag breaks open. Rupt carries the idea break or burst. Here rupture is a verb meaning break open. It can also be a noun naming a break."
    ]
  },
  "perspective": {
    "sentence": "The letter helps us understand the writer’s perspective.",
    "question": "What does the letter help us understand?",
    "choices": [
      "Only the writer’s eyesight",
      "The writer’s point of view"
    ],
    "answer": 1,
    "feedback": [
      "Use the sentence clue: The writer’s point of view. Spect has a historical connection to looking. Perspective can mean a way of viewing or thinking about something. Here the looking is figurative.",
      "The writer’s point of view. Spect has a historical connection to looking. Perspective can mean a way of viewing or thinking about something. Here the looking is figurative."
    ]
  },
  "valid": {
    "sentence": "The evidence supports a valid conclusion.",
    "question": "What does valid mean here?",
    "choices": [
      "Well supported by the evidence",
      "Written in very large letters"
    ],
    "answer": 0,
    "feedback": [
      "Well supported by the evidence. Val has a historical connection to strength or worth. A valid reason is sound: it supports the claim. It does not mean a physically strong reason.",
      "Use the sentence clue: Well supported by the evidence. Val has a historical connection to strength or worth. A valid reason is sound: it supports the claim. It does not mean a physically strong reason."
    ]
  },
  "active": {
    "sentence": "An active club member helps with events.",
    "question": "What does active tell us here?",
    "choices": [
      "The member never joins in",
      "The member takes part"
    ],
    "answer": 1,
    "feedback": [
      "Use the sentence clue: The member takes part. Act connects with doing. Active describes someone or something doing things or taking part. Here it describes a person.",
      "The member takes part. Act connects with doing. Active describes someone or something doing things or taking part. Here it describes a person."
    ]
  },
  "autobiography": {
    "sentence": "I read an autobiography written by a dancer.",
    "question": "Who is telling their own life story?",
    "choices": [
      "The dancer",
      "An unrelated historian"
    ],
    "answer": 0,
    "feedback": [
      "The dancer. Auto- means self. An autobiography is an account of a person’s life written by that person. A biography may be written by someone else.",
      "Use the sentence clue: The dancer. Auto- means self. An autobiography is an account of a person’s life written by that person. A biography may be written by someone else."
    ]
  },
  "bibliography": {
    "sentence": "Check the bibliography to find the book behind that fact.",
    "question": "How can the bibliography help?",
    "choices": [
      "It proves every fact is correct by itself",
      "It identifies the source"
    ],
    "answer": 1,
    "feedback": [
      "Use the sentence clue: It identifies the source. Biblio- connects with books. A bibliography lists books or other sources used for a piece of work. Today it can include websites, too.",
      "It identifies the source. Biblio- connects with books. A bibliography lists books or other sources used for a piece of work. Today it can include websites, too."
    ]
  },
  "organize": {
    "sentence": "Organize the supplies before the lesson.",
    "question": "What should you do?",
    "choices": [
      "Put the supplies in order",
      "Mix the supplies randomly"
    ],
    "answer": 0,
    "feedback": [
      "Put the supplies in order. -Ize often helps form verbs. Organize means arrange or put in order. This established word cannot be explained by treating organ as an ordinary base to which any ending can be added.",
      "Use the sentence clue: Put the supplies in order. -Ize often helps form verbs. Organize means arrange or put in order. This established word cannot be explained by treating organ as an ordinary base to which any ending can be added."
    ]
  },
  "enjoyable": {
    "sentence": "We had an enjoyable afternoon together.",
    "question": "What kind of afternoon was it?",
    "choices": [
      "One that could not be enjoyed",
      "One that gave us pleasure"
    ],
    "answer": 1,
    "feedback": [
      "Use the sentence clue: One that gave us pleasure. -Able helps form an adjective. Enjoyable describes something that gives pleasure or can be enjoyed. Not every adjective can take this ending.",
      "One that gave us pleasure. -Able helps form an adjective. Enjoyable describes something that gives pleasure or can be enjoyed. Not every adjective can take this ending."
    ]
  },
  "action": {
    "sentence": "The team took action to clean the park.",
    "question": "What does action mean here?",
    "choices": [
      "Doing something to help",
      "Only thinking without doing anything"
    ],
    "answer": 0,
    "feedback": [
      "Doing something to help. -Ion can help form a noun naming an act or process. Action names doing something. Related endings may involve spelling changes; do not attach them to every verb.",
      "Use the sentence clue: Doing something to help. -Ion can help form a noun naming an act or process. Action names doing something. Related endings may involve spelling changes; do not attach them to every verb."
    ]
  },
  "enjoyment": {
    "sentence": "Reading brings Mira enjoyment.",
    "question": "What does reading bring?",
    "choices": [
      "A command to read faster",
      "Pleasure"
    ],
    "answer": 1,
    "feedback": [
      "Use the sentence clue: Pleasure. -Ment can help form a noun. Enjoyment names the pleasure of enjoying something. We cannot add -ment to every verb.",
      "Pleasure. -Ment can help form a noun. Enjoyment names the pleasure of enjoying something. We cannot add -ment to every verb."
    ]
  },
  "contestant": {
    "sentence": "The contestant stepped onto the quiz stage.",
    "question": "Who is the contestant?",
    "choices": [
      "The person taking part in the quiz",
      "The quality of being on stage"
    ],
    "answer": 0,
    "feedback": [
      "-Ant forms a noun naming the person taking part.",
      "-Ant forms a noun naming the person taking part."
    ]
  },
  "persistent": {
    "sentence": "The persistent gardener tried again after the seeds failed.",
    "question": "What does persistent describe?",
    "choices": [
      "Someone who gives up at once",
      "Someone who keeps trying"
    ],
    "answer": 1,
    "feedback": [
      "Here -ent helps form an adjective describing continued effort.",
      "Here -ent helps form an adjective describing continued effort."
    ]
  },
  "telescope": {
    "sentence": "A telescope helped us see a distant planet.",
    "question": "Why was a telescope useful?",
    "choices": [
      "The planet was far away",
      "The planet was a tiny nearby cell"
    ],
    "answer": 0,
    "feedback": [
      "Tele- contributes far; this instrument helps with viewing distant objects.",
      "Tele- contributes far; this instrument helps with viewing distant objects."
    ]
  },
  "microscope": {
    "sentence": "We used a microscope to see details in a drop of pond water.",
    "question": "What clue does micro- give?",
    "choices": [
      "The water is far away",
      "The details are very small"
    ],
    "answer": 1,
    "feedback": [
      "Micro- contributes small; the instrument reveals very small details.",
      "Micro- contributes small; the instrument reveals very small details."
    ]
  },
  "geology": {
    "sentence": "The geology exhibit explains how rocks form.",
    "question": "Why do the rocks belong in this exhibit?",
    "choices": [
      "Geology studies Earth",
      "Geology studies only handwriting"
    ],
    "answer": 0,
    "feedback": [
      "Geo- connects this field of study with Earth.",
      "Geo- connects this field of study with Earth."
    ]
  },
  "structure": {
    "sentence": "The old tower is a stone structure.",
    "question": "Which meaning of struct fits?",
    "choices": [
      "Speak",
      "Build"
    ],
    "answer": 1,
    "feedback": [
      "A structure is something built; struct connects with building.",
      "A structure is something built; struct connects with building."
    ]
  },
  "darkness": {
    "sentence": "At sunset, darkness spread across the field.",
    "question": "What does -ness help name?",
    "choices": [
      "The state of being dark",
      "A person who turns off lights"
    ],
    "answer": 0,
    "feedback": [
      "-Ness makes a noun naming a state or quality.",
      "-Ness makes a noun naming a state or quality."
    ]
  },
  "taller": {
    "sentence": "The sunflower is taller than the rose.",
    "question": "What does -er do here?",
    "choices": [
      "Name a person who grows flowers",
      "Compare their heights"
    ],
    "answer": 1,
    "feedback": [
      "Here -er compares: the sunflower has greater height.",
      "Here -er compares: the sunflower has greater height."
    ]
  },
  "writer": {
    "sentence": "The writer revised the final chapter.",
    "question": "What does -er do in writer?",
    "choices": [
      "Name the person who writes",
      "Compare two chapters"
    ],
    "answer": 0,
    "feedback": [
      "Here -er names a person; it does not compare.",
      "Here -er names a person; it does not compare."
    ]
  },
  "slowly": {
    "sentence": "The line moved slowly through the doorway.",
    "question": "What does slowly tell us?",
    "choices": [
      "What the doorway was called",
      "How the line moved"
    ],
    "answer": 1,
    "feedback": [
      "Here -ly helps make an adverb telling how an action happens.",
      "Here -ly helps make an adverb telling how an action happens."
    ]
  }
});
  Object.assign(sortContexts, {
  "absent": "A member who is absent from a meeting is away from it.",
  "ablate": "Intense heat can ablate material, wearing it away from the surface.",
  "retro-rocket": "A retro-rocket provides opposing thrust to slow the spacecraft.",
  "retrofire": "The crew will retrofire the small rocket to slow the capsule."
});
  meaningSorts.push({
  "id": "away-backward",
  "mode": "prefixes",
  "title": "Away or backward?",
  "teachingNote": "Ab- connects with away. Retro- connects with backward. The space words need the sentence: opposing thrust slows motion; the craft need not go backward.",
  "excludedWords": [],
  "groups": [
    {
      "id": "ab",
      "heading": "ab- · away",
      "cards": [
        {
          "word": "absent",
          "explanation": "Absent connects with being away: the member is not at the meeting."
        },
        {
          "word": "ablate",
          "explanation": "Ablate connects with removal: material wears away from a surface."
        }
      ]
    },
    {
      "id": "retro",
      "heading": "retro- · backward",
      "cards": [
        {
          "word": "retro-rocket",
          "explanation": "The rocket acts against forward motion to slow the craft."
        },
        {
          "word": "retrofire",
          "explanation": "To retrofire is to ignite a retro-rocket. Here its opposing thrust slows the capsule."
        }
      ]
    }
  ],
  "completion": "You used the sentence meanings to distinguish away from backward or opposing motion."
});
  window.FirstVoloLearnContent = { meaningSorts, buildMeaningRounds, additions, metadata, worked, additionalWorked, practice, lessons, roundGroups, sortContexts, examples, buildRounds };
})();
