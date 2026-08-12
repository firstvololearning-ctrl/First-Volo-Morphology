"use strict";

/*
  First Volo Morphology — Volo Token Engine

  Tokens are derived from scored first-attempt evidence
  already stored in student progress sessions.

  Knowledge:
    Meaning
    Word Part
    Find
    Word Hunt

  Application:
    Break It Apart
    Figure It Out
    Build
    Use It
    Change It

  Once a token is earned, it remains earned unless the
  educator explicitly clears that student's progress.
*/

(function () {

  const RULE_VERSION = "v1";

  const KNOWLEDGE_SKILLS = new Set([
    "meaning",
    "morpheme",
    "find",
    "hunt"
  ]);

  const APPLICATION_SKILLS = new Set([
    "break",
    "infer",
    "build",
    "use",
    "change"
  ]);

  const RULES = Object.freeze({
    knowledgeAccuracy: 0.80,
    applicationAccuracy: 0.75,
    knowledgeActivityTypes: 2,
    applicationActivityTypes: 2,
    sessions: 2
  });


  /* ========================================
     BASIC HELPERS
     ======================================== */

  function getTokenSets() {
    return (
      window.FIRST_VOLO_TOKEN_SETS || []
    );
  }


  function getMorphemeInventory() {
    return (
      window.FIRST_VOLO_MORPHEME_INVENTORY || []
    );
  }


  function getValidMorphemeIds() {
    return new Set(
      getMorphemeInventory().map(
        (item) => item.id
      )
    );
  }


  function unique(values) {
    return [
      ...new Set(
        (values || []).filter(Boolean)
      )
    ];
  }


  function countCorrect(records) {
    return records.filter(
      (record) => record.correct
    ).length;
  }


  function accuracy(records) {
    if (!records.length) {
      return 0;
    }

    return (
      countCorrect(records) /
      records.length
    );
  }


  function getResponseSkill(
    response,
    session
  ) {
    return (
      response?.skill ||
      session?.activity ||
      ""
    );
  }


  function getDirectTargetId(
    response,
    validIds
  ) {
    const candidates = [
      response?.primaryTargetId,
      response?.itemId
    ];

    return (
      candidates.find(
        (id) => id && validIds.has(id)
      ) || null
    );
  }


  function getApplicationTargetIds(
    response,
    validIds
  ) {
    const direct =
      getDirectTargetId(
        response,
        validIds
      );

    const supporting =
      Array.isArray(
        response?.supportingTargetIds
      )
        ? response.supportingTargetIds
        : [];

    return unique([
      direct,
      ...supporting
    ]).filter(
      (id) => validIds.has(id)
    );
  }


  /* ========================================
     COLLECT STUDENT EVIDENCE
     ======================================== */

  function collectStudentEvidence(student) {
    const validIds =
      getValidMorphemeIds();

    const evidence = new Map();

    function ensureEntry(id) {
      if (!evidence.has(id)) {
        evidence.set(id, {
          knowledge: [],
          application: []
        });
      }

      return evidence.get(id);
    }

    const sessions =
      Array.isArray(student?.sessions)
        ? student.sessions
        : [];

    sessions.forEach(
      (session, sessionIndex) => {

        const responses =
          Array.isArray(session.responses)
            ? session.responses
            : [];

        const sessionDate =
          session.completedAt ||
          session.startedAt ||
          "";

        const parsedTime =
          Date.parse(sessionDate);

        const sessionTime =
          Number.isFinite(parsedTime)
            ? parsedTime
            : sessionIndex;

        responses.forEach(
          (response, responseIndex) => {

            const skill =
              getResponseSkill(
                response,
                session
              );

            const record = {
              correct:
                Boolean(response.correct),

              skill,

              sessionId:
                session.id ||
                `session-${sessionIndex}`,

              sessionDate,

              order:
                sessionTime * 1000 +
                responseIndex
            };

            if (
              KNOWLEDGE_SKILLS.has(skill)
            ) {
              const id =
                getDirectTargetId(
                  response,
                  validIds
                );

              if (!id) {
                return;
              }

              ensureEntry(id)
                .knowledge
                .push(record);

              return;
            }

            if (
              APPLICATION_SKILLS.has(skill)
            ) {
              const ids =
                getApplicationTargetIds(
                  response,
                  validIds
                );

              ids.forEach((id) => {
                ensureEntry(id)
                  .application
                  .push(record);
              });
            }
          }
        );
      }
    );

    evidence.forEach((entry) => {
      entry.knowledge.sort(
        (a, b) => a.order - b.order
      );

      entry.application.sort(
        (a, b) => a.order - b.order
      );
    });

    return evidence;
  }


  /* ========================================
     MORPHEME RULES
     ======================================== */

  function getMorphemeRule(id) {

    if (id === "put") {
      return {
        profile: "recognition-only",

        knowledgeNeeded: 4,
        knowledgeCorrectNeeded: 3,
        knowledgeTypesNeeded: 3,

        applicationNeeded: 0,
        applicationCorrectNeeded: 0
      };
    }


    if (id === "a-ad") {
      return {
        profile: "limited-application",

        knowledgeNeeded: 4,
        knowledgeCorrectNeeded: 3,
        knowledgeTypesNeeded: 3,

        applicationNeeded: 1,
        applicationCorrectNeeded: 1
      };
    }


    return {
      profile: "standard",

      knowledgeNeeded: 3,
      knowledgeCorrectNeeded: 2,
      knowledgeTypesNeeded: 0,

      applicationNeeded: 2,
      applicationCorrectNeeded: 1
    };
  }


  function evaluateMorpheme(
    id,
    evidence
  ) {
    const rule =
      getMorphemeRule(id);

    const entry =
      evidence.get(id) || {
        knowledge: [],
        application: []
      };

    const knowledgeWindow =
      entry.knowledge.slice(
        -rule.knowledgeNeeded
      );

    const knowledgeCorrect =
      countCorrect(
        knowledgeWindow
      );

    const knowledgeTypes =
      new Set(
        knowledgeWindow.map(
          (record) => record.skill
        )
      );

    const knowledgeReady =
      knowledgeWindow.length >=
        rule.knowledgeNeeded &&

      knowledgeCorrect >=
        rule.knowledgeCorrectNeeded &&

      knowledgeTypes.size >=
        rule.knowledgeTypesNeeded;


    const applicationCorrect =
      countCorrect(
        entry.application
      );

    const applicationReady =
      rule.profile ===
        "recognition-only"

        ? true

        : (
          entry.application.length >=
            rule.applicationNeeded &&

          applicationCorrect >=
            rule.applicationCorrectNeeded
        );


    return {
      id,
      profile: rule.profile,

      knowledgeReady,
      knowledgeWindow,
      knowledgeCorrect,
      knowledgeTypes:
        [...knowledgeTypes],

      applicationReady,
      applicationEvidence:
        entry.application,
      applicationCorrect
    };
  }


  /* ========================================
     TOKEN-SET EVALUATION
     ======================================== */

  function evaluateTokenSet(
    set,
    evidence
  ) {
    const morphemes =
      set.morphemeIds.map(
        (id) =>
          evaluateMorpheme(
            id,
            evidence
          )
      );


    const allKnowledgeReady =
      morphemes.every(
        (item) =>
          item.knowledgeReady
      );


    const allApplicationReady =
      morphemes.every(
        (item) =>
          item.applicationReady
      );


    const knowledgeRecords =
      morphemes.flatMap(
        (item) =>
          item.knowledgeWindow
      );


    /*
      Recognition-only morphemes do not
      contribute to the Application
      denominator.
    */
    const applicationRecords =
      morphemes.flatMap(
        (item) =>
          item.profile ===
            "recognition-only"
            ? []
            : item.applicationEvidence
      );


    const knowledgeAccuracy =
      accuracy(
        knowledgeRecords
      );


    const hasApplicationRequirement =
      morphemes.some(
        (item) =>
          item.profile !==
          "recognition-only"
      );


    const applicationAccuracy =
      applicationRecords.length
        ? accuracy(
            applicationRecords
          )
        : hasApplicationRequirement
          ? 0
          : 1;


    const knowledgeTypes =
      new Set(
        knowledgeRecords.map(
          (record) => record.skill
        )
      );


    const applicationTypes =
      new Set(
        applicationRecords.map(
          (record) => record.skill
        )
      );


    const relevantRecords = [
      ...knowledgeRecords,
      ...applicationRecords
    ];


    const sessionIds =
      new Set(
        relevantRecords
          .map(
            (record) =>
              record.sessionId
          )
          .filter(Boolean)
      );


    const ready =
      allKnowledgeReady &&

      allApplicationReady &&

      knowledgeAccuracy >=
        RULES.knowledgeAccuracy &&

      (
        !hasApplicationRequirement ||
        applicationAccuracy >=
          RULES.applicationAccuracy
      ) &&

      knowledgeTypes.size >=
        RULES.knowledgeActivityTypes &&

      (
        !hasApplicationRequirement ||
        applicationTypes.size >=
          RULES.applicationActivityTypes
      ) &&

      sessionIds.size >=
        RULES.sessions;


    return {
      setId: set.id,
      collection: set.collection,
      label: set.label,
      introBand: set.introBand,
      type: set.type,

      ready,

      allKnowledgeReady,
      allApplicationReady,

      knowledgeAccuracy,
      applicationAccuracy,

      knowledgeTypes:
        [...knowledgeTypes],

      applicationTypes:
        [...applicationTypes],

      sessionCount:
        sessionIds.size,

      morphemes
    };
  }


  /* ========================================
     STUDENT TOKEN STATUS
     ======================================== */

  function evaluateStudent(student) {
    const evidence =
      collectStudentEvidence(
        student
      );

    return getTokenSets().map(
      (set) =>
        evaluateTokenSet(
          set,
          evidence
        )
    );
  }


  function ensureTokenStore(student) {
    if (
      !student.voloTokens ||
      typeof student.voloTokens !==
        "object" ||
      Array.isArray(
        student.voloTokens
      )
    ) {
      student.voloTokens = {};
    }

    return student.voloTokens;
  }


  function updateEarnedTokens(data) {
    const newlyEarned = [];

    let changed = false;

    const students =
      Array.isArray(data?.students)
        ? data.students
        : [];

    students.forEach((student) => {

      const store =
        ensureTokenStore(student);

      const statuses =
        evaluateStudent(student);

      statuses.forEach((status) => {

        if (
          !status.ready ||
          store[status.setId]
        ) {
          return;
        }

        const earned = {
          setId: status.setId,
          label: status.label,
          collection:
            status.collection,
          earnedAt:
            new Date().toISOString(),
          ruleVersion:
            RULE_VERSION
        };

        store[status.setId] =
          earned;

        newlyEarned.push({
          studentId: student.id,
          ...earned
        });

        changed = true;
      });
    });

    return {
      changed,
      newlyEarned
    };
  }


  function isTokenEarned(
    student,
    setId
  ) {
    return Boolean(
      student?.voloTokens?.[setId]
    );
  }


  window.FirstVoloTokens = {
    RULE_VERSION,
    RULES,

    knowledgeSkills:
      [...KNOWLEDGE_SKILLS],

    applicationSkills:
      [...APPLICATION_SKILLS],

    collectEvidence:
      collectStudentEvidence,

    evaluateMorpheme,
    evaluateTokenSet,
    evaluateStudent,

    updateEarnedTokens,
    isTokenEarned
  };

})();
