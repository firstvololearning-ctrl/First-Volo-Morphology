"use strict";

/*
  First Volo Morphology
  Teacher Word Extensions v1

  DATA ONLY.
  Target-specific records and approved surface aliases live here.
  The selector decides whether a word is eligible for an objective/stage.
*/

(function initializeFirstVoloTeacherWordExtensions() {
  const CANDIDATES_BY_TARGET =
      Object.freeze({
        mot: Object.freeze([
          Object.freeze({
            word: "remove",
            freshnessFamily: "remove",
            morphemes: Object.freeze([
              "mot/mov"
            ]),
            definition: "to move something away or take it away",
            practiceBand: "4-5",
            vocabLevel: "familiar",
            transparency: "medium",
            reviewCaution:
              "Use to notice the mot/mov/move family or the move meaning. Do not teach remove as productive re- + move or score it as a full word-part analysis.",
            activities: Object.freeze([
              "find",
              "hunt",
              "meaning",
              "morpheme",
              "use"
            ])
          }),

          Object.freeze({
            word: "movement",
            segmentation: "move + -ment ; move + ment",
            morphemes: Object.freeze([
              "mot/mov",
              "-ment"
            ]),
            definition: "the act of changing position or place",
            practiceBand: "4-5",
            accessibilityBand: "2-3",
            vocabLevel: "familiar",
            transparency: "high",
            activities: Object.freeze([
              "find",
              "hunt",
              "meaning",
              "morpheme",
              "break",
              "infer",
              "use",
              "change"
            ]),
            freshnessFamily: "movement",
            wordFormation: Object.freeze({
              baseForm: "move",
              suffix: "-ment",
              wordSum: "move + -ment → movement",
              spellingChange: "keep-final-e",
              teachingNote:
                "The base is move. In movement, the final e stays before -ment."
            })
          }),

          Object.freeze({
            word: "movements",
            freshnessFamily: "movement",
            wordFormation: Object.freeze({
              baseForm: "move",
              suffix: "-ment + -s",
              wordSum: "move + -ment + -s → movements",
              spellingChange: "keep-final-e",
              teachingNote:
                "The base is move. The final e stays when -ment is added; -s then marks the plural."
            }),
            segmentation: "move + -ment + -s",
            morphemes: Object.freeze([
              "mot/mov",
              "-ment",
              "-s"
            ]),
            definition: "acts or instances of moving",
            practiceBand: "4-5",
            vocabLevel: "familiar",
            transparency: "high",
            activities: Object.freeze([
              "find",
              "hunt",
              "meaning",
              "morpheme",
              "break",
              "infer",
              "use",
              "change"
            ])
          }),

          Object.freeze({
            word: "removes",
            freshnessFamily: "remove",
            morphemes: Object.freeze([
              "mot/mov",
              "-s"
            ]),
            definition: "moves or takes something away",
            practiceBand: "4-5",
            vocabLevel: "familiar",
            transparency: "medium",
            reviewCaution:
              "Use to notice the mot/mov/move family and, when useful, final -s. Do not teach removes as productive re- + move + -s or score it as a full word-part analysis.",
            activities: Object.freeze([
              "find",
              "hunt",
              "meaning",
              "morpheme",
              "use"
            ])
          }),

          Object.freeze({
            word: "promotion",
            segmentation: "pro- + mot + -ion",
            morphemes: Object.freeze([
              "pro-",
              "mot/mov",
              "-ion"
            ]),
            definition: "an act of moving someone or something forward or to a higher level",
            practiceBand: "4-5",
            vocabLevel: "academic",
            transparency: "medium",
            activities: Object.freeze([
              "find",
              "hunt",
              "meaning",
              "morpheme",
              "break",
              "infer",
              "use",
              "change"
            ])
          }),

          Object.freeze({
            word: "moving",
            freshnessFamily: "move",
            wordFormation: Object.freeze({
              baseForm: "move",
              suffix: "-ing",
              wordSum: "move + -ing → moving",
              spellingChange: "drop-final-e",
              teachingNote:
                "The base is move. When -ing is added, the final e drops, so mov is visible in moving."
            }),
            morphemes: Object.freeze([
              "mot/mov"
            ]),
            definition: "changing position or place",
            practiceBand: "4-5",
            vocabLevel: "familiar",
            transparency: "high",
            reviewCaution:
              "Use for family/form instruction. The accurate word sum is move + -ing → moving; do not score as mov + -ing.",
            activities: Object.freeze([
              "find",
              "hunt",
              "meaning",
              "morpheme",
              "infer",
              "use",
              "change"
            ])
          }),

          Object.freeze({
            word: "movable",
            freshnessFamily: "move",
            wordFormation: Object.freeze({
              baseForm: "move",
              suffix: "-able",
              wordSum: "move + -able → movable",
              spellingChange: "drop-final-e",
              teachingNote:
                "The base is move. When -able is added, the final e drops, so mov is visible in movable."
            }),
            morphemes: Object.freeze([
              "mot/mov"
            ]),
            definition: "able to be moved",
            practiceBand: "4-5",
            vocabLevel: "familiar",
            transparency: "high",
            reviewCaution:
              "Use for family/form instruction. The accurate word sum is move + -able → movable; do not score as mov + -able.",
            activities: Object.freeze([
              "find",
              "hunt",
              "meaning",
              "morpheme",
              "infer",
              "use",
              "change"
            ])
          }),

          Object.freeze({
            word: "removable",
            morphemes: Object.freeze([
              "mot/mov",
              "-able"
            ]),
            definition: "able to be moved or taken away",
            practiceBand: "4-5",
            vocabLevel: "academic",
            transparency: "medium",
            reviewCaution:
              "Use for family/form instruction. Treat remove as the lexical base; do not teach the initial re- here as productive re- = again.",
            activities: Object.freeze([
              "find",
              "hunt",
              "meaning",
              "morpheme",
              "use"
            ])
          })

        ]),

        /* FIRST_VOLO_TEACHER_LED_OUTSIDE_POOL_SUPPORT_V1
           Teacher-led words may extend beyond the online practice pool.
           Non-target information may be supplied after the independent
           attempt when doing so preserves the target reasoning.
        */
        "er-more": Object.freeze([
          Object.freeze({
            word: "longer",
            targetSenseIds: Object.freeze(["er-more"]),
            segmentation: "long + -er",
            morphemes: Object.freeze(["-er"]),
            literal: "more long",
            definition: "having more length than something else",
            studentFriendlyDefinition: "having more length than something else",
            practiceBand: "2-3",
            accessibilityBand: "2-3",
            vocabLevel: "familiar",
            transparency: "high",
            teacherLedOnly: true,
            instructionalSource: "teacher-word-extension",
            semanticBridgeQuality: "high",
            changeTask: Object.freeze({
              expectedWord: "longer",
              prompt: "Start with long. Complete the sentence with the comparative form: ‘The blue ribbon is ____ than the red ribbon.’ Then explain what -er adds and why that form fits.",
              contextSentence: "The blue ribbon is ____ than the red ribbon.",
              expectedMeaning: "having more length than something else",
              changeExplanation: "long → longer; comparative -er adds the meaning ‘more’ and marks a comparison"
            }),
            activities: Object.freeze(["learn", "find", "hunt", "meaning", "morpheme", "infer", "use", "change"])
          }),
          Object.freeze({
            word: "shorter",
            targetSenseIds: Object.freeze(["er-more"]),
            segmentation: "short + -er",
            morphemes: Object.freeze(["-er"]),
            literal: "more short",
            definition: "having less length or height than something else",
            studentFriendlyDefinition: "not as long or tall as something else",
            practiceBand: "2-3",
            accessibilityBand: "2-3",
            vocabLevel: "familiar",
            transparency: "high",
            teacherLedOnly: true,
            instructionalSource: "teacher-word-extension",
            semanticBridgeQuality: "high",
            changeTask: Object.freeze({
              expectedWord: "shorter",
              prompt: "Start with short. Complete the sentence with the comparative form: ‘The pencil is ____ than the marker.’ Then explain what -er adds and why that form fits.",
              contextSentence: "The pencil is ____ than the marker.",
              expectedMeaning: "not as long or tall as something else",
              changeExplanation: "short → shorter; comparative -er adds the meaning ‘more’ and marks a comparison"
            }),
            activities: Object.freeze(["learn", "find", "hunt", "meaning", "morpheme", "infer", "use", "change"])
          }),
          Object.freeze({
            word: "smaller",
            targetSenseIds: Object.freeze(["er-more"]),
            segmentation: "small + -er",
            morphemes: Object.freeze(["-er"]),
            literal: "more small",
            definition: "less large than something else",
            studentFriendlyDefinition: "not as big as something else",
            practiceBand: "2-3",
            accessibilityBand: "2-3",
            vocabLevel: "familiar",
            transparency: "high",
            teacherLedOnly: true,
            instructionalSource: "teacher-word-extension",
            semanticBridgeQuality: "high",
            changeTask: Object.freeze({
              expectedWord: "smaller",
              prompt: "Start with small. Complete the sentence with the comparative form: ‘The kitten is ____ than the adult cat.’ Then explain what -er adds and why that form fits.",
              contextSentence: "The kitten is ____ than the adult cat.",
              expectedMeaning: "not as big as something else",
              changeExplanation: "small → smaller; comparative -er adds the meaning ‘more’ and marks a comparison"
            }),
            activities: Object.freeze(["learn", "find", "hunt", "meaning", "morpheme", "infer", "use", "change"])
          }),
          Object.freeze({
            word: "taller",
            targetSenseIds: Object.freeze(["er-more"]),
            segmentation: "tall + -er",
            morphemes: Object.freeze(["-er"]),
            literal: "more tall",
            definition: "having more height than something else",
            studentFriendlyDefinition: "higher in height than something else",
            practiceBand: "2-3",
            accessibilityBand: "2-3",
            vocabLevel: "familiar",
            transparency: "high",
            teacherLedOnly: true,
            instructionalSource: "teacher-word-extension",
            semanticBridgeQuality: "high",
            changeTask: Object.freeze({
              expectedWord: "taller",
              prompt: "Start with tall. Complete the sentence with the comparative form: ‘The sunflower is ____ than the daisy.’ Then explain what -er adds and why that form fits.",
              contextSentence: "The sunflower is ____ than the daisy.",
              expectedMeaning: "having more height than something else",
              changeExplanation: "tall → taller; comparative -er adds the meaning ‘more’ and marks a comparison"
            }),
            activities: Object.freeze(["learn", "find", "hunt", "meaning", "morpheme", "infer", "use", "change"])
          }),
          Object.freeze({
            word: "faster",
            targetSenseIds: Object.freeze(["er-more"]),
            segmentation: "fast + -er",
            morphemes: Object.freeze(["-er"]),
            literal: "more fast",
            definition: "moving or happening at a greater speed",
            studentFriendlyDefinition: "moving more quickly than something else",
            practiceBand: "2-3",
            accessibilityBand: "2-3",
            vocabLevel: "familiar",
            transparency: "high",
            teacherLedOnly: true,
            instructionalSource: "teacher-word-extension",
            semanticBridgeQuality: "high",
            changeTask: Object.freeze({
              expectedWord: "faster",
              prompt: "Start with fast. Complete the sentence with the comparative form: ‘The train is ____ than the bicycle.’ Then explain what -er adds and why that form fits.",
              contextSentence: "The train is ____ than the bicycle.",
              expectedMeaning: "moving more quickly than something else",
              changeExplanation: "fast → faster; comparative -er adds the meaning ‘more’ and marks a comparison"
            }),
            activities: Object.freeze(["learn", "find", "hunt", "meaning", "morpheme", "infer", "use", "change"])
          }),
          Object.freeze({
            word: "stronger",
            targetSenseIds: Object.freeze(["er-more"]),
            segmentation: "strong + -er",
            morphemes: Object.freeze(["-er"]),
            literal: "more strong",
            definition: "having more strength than something else",
            studentFriendlyDefinition: "having more strength than something else",
            practiceBand: "2-3",
            accessibilityBand: "2-3",
            vocabLevel: "familiar",
            transparency: "high",
            teacherLedOnly: true,
            instructionalSource: "teacher-word-extension",
            semanticBridgeQuality: "high",
            changeTask: Object.freeze({
              expectedWord: "stronger",
              prompt: "Start with strong. Complete the sentence with the comparative form: ‘The thick rope is ____ than the thin string.’ Then explain what -er adds and why that form fits.",
              contextSentence: "The thick rope is ____ than the thin string.",
              expectedMeaning: "having more strength than something else",
              changeExplanation: "strong → stronger; comparative -er adds the meaning ‘more’ and marks a comparison"
            }),
            activities: Object.freeze(["learn", "find", "hunt", "meaning", "morpheme", "infer", "use", "change"])
          })
        ]),

        dis: Object.freeze([
          Object.freeze({
            word: "dishonest",
            segmentation: "dis- + honest",
            morphemes: Object.freeze(["dis-"]),
            literal: "not honest",
            definition: "not truthful or honest",
            studentFriendlyDefinition: "not truthful or honest",
            teachingContext: "It would be dishonest to say you finished work that you did not do.",
            practiceBand: "4-5",
            accessibilityBand: "4-5",
            vocabLevel: "familiar",
            transparency: "high",
            teacherLedOnly: true,
            instructionalSource: "teacher-word-extension",
            semanticBridgeQuality: "high",
            changeTask: Object.freeze({
              expectedWord: "smaller",
              prompt: "Start with small. Complete the sentence with the comparative form: ‘The kitten is ____ than the adult cat.’ Then explain what -er adds and why that form fits.",
              contextSentence: "The kitten is ____ than the adult cat.",
              expectedMeaning: "not as big as something else",
              changeExplanation: "small → smaller; comparative -er adds the meaning ‘more’ and marks a comparison"
            }),
            freshnessFamily: "dishonest",
            nonTargetSupports: Object.freeze([
              Object.freeze({ part: "honest", meaning: "truthful", role: "lexical base", timing: "before-target-question-when-needed" })
            ]),
            activities: Object.freeze(["learn", "find", "hunt", "meaning", "morpheme", "infer", "build", "use"])
          }),
          Object.freeze({
            word: "disconnect",
            segmentation: "dis- + connect",
            morphemes: Object.freeze(["dis-"]),
            literal: "apart from being connected",
            definition: "to separate things that were connected",
            studentFriendlyDefinition: "to separate things that were connected",
            teachingContext: "Disconnect the charger by separating it from the tablet.",
            practiceBand: "4-5",
            accessibilityBand: "2-3",
            vocabLevel: "familiar",
            transparency: "high",
            teacherLedOnly: true,
            instructionalSource: "teacher-word-extension",
            semanticBridgeQuality: "high",
            freshnessFamily: "disconnect",
            nonTargetSupports: Object.freeze([
              Object.freeze({ part: "connect", meaning: "join or link together", role: "lexical base", timing: "before-target-question-when-needed" })
            ]),
            activities: Object.freeze(["learn", "find", "hunt", "meaning", "morpheme", "infer", "build", "use"])
          }),
          Object.freeze({
            word: "disobey",
            segmentation: "dis- + obey",
            morphemes: Object.freeze(["dis-"]),
            literal: "not obey",
            definition: "to refuse or fail to obey",
            studentFriendlyDefinition: "to not follow a rule or direction",
            teachingContext: "If a student disobeys a rule, the student does not follow it.",
            practiceBand: "4-5",
            accessibilityBand: "2-3",
            vocabLevel: "familiar",
            transparency: "high",
            teacherLedOnly: true,
            instructionalSource: "teacher-word-extension",
            semanticBridgeQuality: "high",
            freshnessFamily: "disobey",
            nonTargetSupports: Object.freeze([
              Object.freeze({ part: "obey", meaning: "follow a rule or direction", role: "lexical base", timing: "before-target-question-when-needed" })
            ]),
            activities: Object.freeze(["learn", "find", "hunt", "meaning", "morpheme", "infer", "build", "use"])
          }),
          Object.freeze({
            word: "disapprove",
            segmentation: "dis- + approve",
            morphemes: Object.freeze(["dis-"]),
            literal: "not approve",
            definition: "to think something is wrong or not good",
            studentFriendlyDefinition: "to think something is wrong or not good",
            teachingContext: "Her parents disapproved of the unsafe plan because they thought it was a bad idea.",
            practiceBand: "4-5",
            accessibilityBand: "4-5",
            vocabLevel: "familiar",
            transparency: "high",
            teacherLedOnly: true,
            instructionalSource: "teacher-word-extension",
            semanticBridgeQuality: "high",
            freshnessFamily: "disapprove",
            nonTargetSupports: Object.freeze([
              Object.freeze({ part: "approve", meaning: "think something is good or acceptable", role: "lexical base", timing: "before-target-question-when-needed" })
            ]),
            activities: Object.freeze(["learn", "find", "hunt", "meaning", "morpheme", "infer", "build", "use"])
          })
        ]),

        anti: Object.freeze([
          Object.freeze({
            word: "antibacterial",
            segmentation: "anti- + bacterial",
            morphemes: Object.freeze(["anti-"]),
            literal: "against bacteria",
            definition: "made to fight or stop bacteria",
            studentFriendlyDefinition: "made to fight or stop bacteria",
            teachingContext: "Antibacterial soap is made to fight or stop bacteria.",
            practiceBand: "4-5",
            accessibilityBand: "4-5",
            vocabLevel: "academic",
            transparency: "high",
            teacherLedOnly: true,
            instructionalSource: "teacher-word-extension",
            semanticBridgeQuality: "high",
            nonTargetSupports: Object.freeze([
              Object.freeze({
                part: "bacterial",
                meaning: "related to bacteria",
                role: "lexical base",
                timing: "before-target-question-when-needed",
                purpose: "Supply this incidental meaning so the student can focus on anti- = against."
              })
            ]),
            activities: Object.freeze(["learn", "find", "hunt", "meaning", "morpheme", "infer", "build", "use"])
          }),
          Object.freeze({
            word: "antifungal",
            segmentation: "anti- + fungal",
            morphemes: Object.freeze(["anti-"]),
            literal: "against fungus",
            definition: "made to fight or stop fungus",
            studentFriendlyDefinition: "made to fight or stop fungus",
            teachingContext: "The doctor recommended an antifungal cream to fight the fungus.",
            practiceBand: "4-5",
            accessibilityBand: "4-5",
            vocabLevel: "academic",
            transparency: "high",
            teacherLedOnly: true,
            instructionalSource: "teacher-word-extension",
            semanticBridgeQuality: "high",
            nonTargetSupports: Object.freeze([
              Object.freeze({
                part: "fungal",
                meaning: "related to fungus",
                role: "lexical base",
                timing: "before-target-question-when-needed"
              })
            ]),
            activities: Object.freeze(["learn", "find", "hunt", "meaning", "morpheme", "infer", "build", "use"])
          }),
          Object.freeze({
            word: "antivirus",
            segmentation: "anti- + virus",
            morphemes: Object.freeze(["anti-"]),
            literal: "against a virus",
            definition: "made to find, block, or remove computer viruses",
            studentFriendlyDefinition: "made to find, block, or remove computer viruses",
            teachingContext: "Antivirus software helps block harmful computer viruses.",
            practiceBand: "4-5",
            accessibilityBand: "4-5",
            vocabLevel: "academic",
            transparency: "high",
            teacherLedOnly: true,
            instructionalSource: "teacher-word-extension",
            semanticBridgeQuality: "high",
            nonTargetSupports: Object.freeze([
              Object.freeze({ part: "virus", meaning: "a harmful computer program", role: "lexical base", timing: "before-target-question-when-needed" })
            ]),
            activities: Object.freeze(["learn", "find", "hunt", "meaning", "morpheme", "infer", "build", "use"])
          }),
          Object.freeze({
            word: "antifreeze",
            segmentation: "anti- + freeze",
            morphemes: Object.freeze(["anti-"]),
            literal: "against freezing",
            definition: "a liquid that helps keep engine fluid from freezing",
            studentFriendlyDefinition: "a liquid that helps keep engine fluid from freezing",
            teachingContext: "Antifreeze helps keep the liquid in a car engine from freezing.",
            practiceBand: "4-5",
            accessibilityBand: "4-5",
            vocabLevel: "academic",
            transparency: "high",
            teacherLedOnly: true,
            instructionalSource: "teacher-word-extension",
            semanticBridgeQuality: "high",
            nonTargetSupports: Object.freeze([
              Object.freeze({ part: "freeze", meaning: "become ice", role: "lexical base", timing: "before-target-question-when-needed" })
            ]),
            activities: Object.freeze(["learn", "find", "hunt", "meaning", "morpheme", "infer", "build", "use"])
          })
        ]),

        bio: Object.freeze([
          Object.freeze({
            word: "biodiversity",
            segmentation: "bio + diversity",
            morphemes: Object.freeze(["bio"]),
            literal: "variety of life",
            definition: "the variety of living things in an area",
            studentFriendlyDefinition: "the variety of living things in an area",
            teachingContext: "A rainforest has high biodiversity because many different kinds of living things live there.",
            clozeSupport: "The rainforest has a lot of biodiversity because ____.",
            practiceBand: "6-8",
            accessibilityBand: "6-8",
            vocabLevel: "academic",
            transparency: "high",
            teacherLedOnly: true,
            instructionalSource: "teacher-word-extension",
            semanticBridgeQuality: "high",
            nonTargetSupports: Object.freeze([
              Object.freeze({ part: "diversity", meaning: "variety", role: "lexical base", timing: "before-context-use-when-needed" })
            ]),
            activities: Object.freeze(["learn", "find", "hunt", "meaning", "morpheme", "infer", "build", "use"])
          })
        ]),

        duct: Object.freeze([
          Object.freeze({
            word: "conduct",
            morphemes: Object.freeze(["duct/duce"]),
            definition: "to lead or direct an activity",
            studentFriendlyDefinition: "to lead or direct an activity",
            practiceBand: "6-8",
            accessibilityBand: "6-8",
            vocabLevel: "familiar",
            transparency: "medium",
            teacherLedOnly: true,
            instructionalSource: "teacher-word-extension",
            changeTask: Object.freeze({
              expectedWord: "conductor",
              prompt: "Start with conduct. Complete the sentence with a related word: ‘The orchestra followed the ____ as she raised her baton.’ Then explain what changed in the word and why that form fits.",
              contextSentence: "The orchestra followed the ____ as she raised her baton.",
              expectedMeaning: "a person who leads an orchestra",
              changeExplanation: "conduct → conductor; -or makes a word for a person or thing that does the action"
            }),
            activities: Object.freeze(["learn", "find", "hunt", "meaning", "morpheme", "infer", "use", "change"]),
            semanticBridgeQuality: "avoid"
          }),
          Object.freeze({
            word: "introduce",
            morphemes: Object.freeze(["duct/duce"]),
            definition: "to present someone or something for the first time",
            studentFriendlyDefinition: "to present someone or something for the first time",
            practiceBand: "6-8",
            accessibilityBand: "6-8",
            vocabLevel: "familiar",
            transparency: "medium",
            teacherLedOnly: true,
            instructionalSource: "teacher-word-extension",
            changeTask: Object.freeze({
              expectedWord: "introduction",
              prompt: "Start with introduce. Complete the sentence with a related word: ‘Her ____ explained who the new speaker was.’ Then explain what changed in the word and why that form fits.",
              contextSentence: "Her ____ explained who the new speaker was.",
              expectedMeaning: "the act or words used to introduce someone or something",
              changeExplanation: "introduce → introduction; the form changes from a verb to a noun"
            }),
            activities: Object.freeze(["learn", "find", "hunt", "meaning", "morpheme", "infer", "use", "change"]),
            semanticBridgeQuality: "avoid"
          }),
          Object.freeze({
            word: "deduction",
            segmentation: "de- + duct + -ion",
            morphemes: Object.freeze(["duct/duce", "de-", "-ion"]),
            definition: "an amount taken away from a total",
            studentFriendlyDefinition: "an amount taken away from a total",
            practiceBand: "6-8",
            accessibilityBand: "6-8",
            vocabLevel: "academic",
            transparency: "medium",
            teacherLedOnly: true,
            instructionalSource: "teacher-word-extension",
            changeTask: Object.freeze({
              expectedWord: "deduct",
              prompt: "Start with deduction. Complete the sentence with a related word: ‘The store will ____ the coupon amount from the total.’ Then explain what changed in the word and why that form fits.",
              contextSentence: "The store will ____ the coupon amount from the total.",
              expectedMeaning: "to take an amount away from a total",
              changeExplanation: "deduction → deduct; the form changes from a noun to a verb"
            }),
            activities: Object.freeze(["change"]),
            semanticBridgeQuality: "avoid"
          }),
          Object.freeze({
            word: "production",
            segmentation: "pro- + duct + -ion",
            morphemes: Object.freeze(["duct/duce", "pro-", "-ion"]),
            definition: "the process of making or producing something",
            studentFriendlyDefinition: "the process of making something",
            practiceBand: "6-8",
            accessibilityBand: "6-8",
            vocabLevel: "familiar",
            transparency: "medium",
            teacherLedOnly: true,
            instructionalSource: "teacher-word-extension",
            changeTask: Object.freeze({
              expectedWord: "produce",
              prompt: "Start with production. Complete the sentence with a related word: ‘The factory can ____ hundreds of boxes each day.’ Then explain what changed in the word and why that form fits.",
              contextSentence: "The factory can ____ hundreds of boxes each day.",
              expectedMeaning: "to make something",
              changeExplanation: "production → produce; the form changes from a noun to a verb"
            }),
            activities: Object.freeze(["change"]),
            semanticBridgeQuality: "avoid"
          })
        ]),

        ject: Object.freeze([
          Object.freeze({
            word: "interject",
            segmentation: "inter- + ject",
            morphemes: Object.freeze([
              "inter-",
              "ject"
            ]),
            definition: "to put a remark into a conversation while another person is speaking",
            studentFriendlyDefinition: "to add a comment while someone else is speaking",
            teachingContext: "Nia interjected a quick question while the group was talking.",
            literal: "throw between",
            practiceBand: "6-8",
            accessibilityBand: "6-8",
            vocabLevel: "academic",
            transparency: "medium",
            teacherLedOnly: true,
            instructionalSource: "teacher-word-extension",
            nonTargetSupports: Object.freeze([
              Object.freeze({
                part: "inter-",
                meaning: "between; among",
                role: "prefix",
                timing: "after-independent-attempt",
                purpose:
                  "If inter- is unfamiliar, supply inter- = between/among after the student's first attempt. Keep ject = throw as the student's target reasoning."
              })
            ]),
            activities: Object.freeze([
              "learn",
              "find",
              "hunt",
              "meaning",
              "morpheme",
              "break",
              "infer",
              "build",
              "use"
            ]),
            reviewCaution:
              "For ject instruction, inter- = between/among may be supplied after the student's first attempt. Do not require independent knowledge of inter- and do not treat the supplied prefix meaning as evidence that ject was known."
          })
        ])
      });

  const TARGET_FORM_ALIASES =
    Object.freeze({
      mot: Object.freeze([
        "move"
      ]),

      derma: Object.freeze([
        "derm"
      ])
    });

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[‐‑‒–—−]/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function key(target) {
    return normalize(
      target?.id ||
      target?.targetId ||
      ""
    );
  }

  function forTarget(target) {
    return (
      CANDIDATES_BY_TARGET[
        key(target)
      ] ||
      []
    ).slice();
  }

  function aliasesForTarget(target) {
    return (
      TARGET_FORM_ALIASES[
        key(target)
      ] ||
      []
    ).slice();
  }

  window.FirstVoloTeacherWordExtensions =
    Object.freeze({
      version:
        "teacher-word-extensions-v1",
      candidatesByTarget:
        CANDIDATES_BY_TARGET,
      targetFormAliases:
        TARGET_FORM_ALIASES,
      forTarget,
      aliasesForTarget
    });
})();
