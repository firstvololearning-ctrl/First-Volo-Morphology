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
