(function () {
  "use strict";

  const PRODUCT_KEY =
    "first-volo-morphology";

  const STORE_KEY =
    "scored-progress";

  const LOCAL_PROGRESS_KEY =
    "firstVoloMorphologyProgressV1";

  const access =
    window.FirstVoloMorphologyAccess;

  if (!access?.client) {
    console.warn(
      "First Volo Morphology Cloud: Supabase client unavailable."
    );
    return;
  }

  const client = access.client;

  let currentUser = null;
  let syncTimer = null;
  let syncing = false;
  let accessGeneration = 0;
  let studentSyncTimer = null;
  let studentSyncing = false;
  let studentSyncQueued = false;
  let studentCloudReadyKey = null;
  let studentReadAbortController = null;
  let studentSaveAbortController = null;

  let cloudButton = null;
  let cloudModal = null;
  let cloudMessage = null;
  let cloudEmail = null;
  let signOutButton = null;
  let syncButton = null;

  function readLocalProgress(
    storageKey = LOCAL_PROGRESS_KEY
  ) {
    try {
      const value =
        JSON.parse(
          localStorage.getItem(
            storageKey
          ) || "null"
        );

      if (
        value &&
        Array.isArray(value.students)
      ) {
        return value;
      }
    } catch (error) {
      console.warn(
        "Morphology cloud could not read local progress.",
        error
      );
    }

    return {
      students: [],
      activeStudentId: null
    };
  }

  function educatorCloudAuthorized() {
    const context = access.getContext();
    return context.status === "authorized" &&
      context.mode === "educator" &&
      context.userId === currentUser?.id;
  }

  function updateUI(message) {
    if (!cloudButton) {
      return;
    }

    const context = access.getContext();
    const studentMode =
      context.status === "authorized" &&
      context.mode === "student";

    cloudButton.hidden = studentMode;
    if (studentMode && cloudModal) {
      cloudModal.hidden = true;
    }

    if (educatorCloudAuthorized()) {
      cloudButton.textContent =
        "☁️ Saved Across Devices ✓";

      cloudButton.title =
        "First Volo cloud saving is on";
    } else {
      cloudButton.textContent =
        "☁️ Save Across Devices";

      cloudButton.title =
        "Optional sign-in for saving across devices";
    }

    const signInForm =
      cloudModal?.querySelector(
        "#morphologyCloudForm"
      );

    if (signInForm) {
      signInForm.hidden =
        educatorCloudAuthorized();
    }

    if (signOutButton) {
      signOutButton.hidden =
        !educatorCloudAuthorized();
    }

    if (syncButton) {
      syncButton.hidden =
        !educatorCloudAuthorized();
    }

    if (!cloudMessage) {
      return;
    }

    if (message) {
      cloudMessage.textContent =
        message;
      return;
    }

    if (currentUser) {
      cloudMessage.textContent =
        currentUser.email
          ? `Signed in as ${currentUser.email}. Your local Morphology data can now sync across devices.`
          : "Signed in. Your local Morphology data can now sync across devices.";
    } else {
      cloudMessage.textContent =
        "Sign in if you want your learners and Morphology progress to be available on another device. Local saving continues whether or not you sign in.";
    }

    if (signOutButton) {
      signOutButton.hidden =
        !currentUser;
    }

    if (syncButton) {
      syncButton.hidden =
        !currentUser;
    }
  }

  async function ensureLearner(student) {
    if (
      !educatorCloudAuthorized() ||
      !student?.id ||
      !student?.name
    ) {
      return null;
    }

    const now =
      new Date().toISOString();

    const {
      data,
      error
    } =
      await client
        .from("learner_profiles")
        .upsert(
          {
            owner_user_id:
              currentUser.id,

            product_key:
              PRODUCT_KEY,

            local_profile_id:
              student.id,

            display_name:
              student.name,

            updated_at:
              now
          },
          {
            onConflict:
              "owner_user_id,product_key,local_profile_id"
          }
        )
        .select("id")
        .single();

    if (error) {
      console.warn(
        "Morphology learner backup failed.",
        error
      );
      return null;
    }

    return data;
  }

  async function backupStudent(
    student
  ) {
    const learner =
      await ensureLearner(
        student
      );

    if (!learner?.id) {
      return false;
    }

    const now =
      new Date().toISOString();

    const {
      error
    } =
      await client
        .from("learning_state")
        .upsert(
          {
            learner_profile_id:
              learner.id,

            product_key:
              PRODUCT_KEY,

            store_key:
              STORE_KEY,

            data: {
              id:
                student.id,

              name:
                student.name,

              nameUpdatedAt:
                student.nameUpdatedAt ||
                null,

              createdAt:
                student.createdAt ||
                null,

              sessions:
                Array.isArray(
                  student.sessions
                )
                  ? student.sessions
                  : [],

              paperPractice:
                Array.isArray(
                  student.paperPractice
                )
                  ? student.paperPractice
                  : [],

              voloTokens:
                student.voloTokens ||
                {},

              voloGoals:
                Array.isArray(
                  student.voloGoals
                )
                  ? student.voloGoals
                  : [],

              voloGoalsUpdatedAt:
                student.voloGoalsUpdatedAt ||
                null,

              progressClearedAt:
                student.progressClearedAt ||
                null
            },

            client_updated_at:
              now,

            updated_at:
              now
          },
          {
            onConflict:
              "learner_profile_id,product_key,store_key"
          }
        );

    if (error) {
      console.warn(
        `Morphology backup failed for ${student.name}.`,
        error
      );
      return false;
    }

    return true;
  }

  function getSessionKey(
    session
  ) {
    if (
      session &&
      typeof session ===
        "object" &&
      session.id
    ) {
      return `id:${session.id}`;
    }

    /*
      Very old/legacy sessions should normally
      have IDs too. If one does not, use its
      exact saved content as a stable fallback
      so an identical legacy session is not
      duplicated on every sync.
    */
    try {
      return `legacy:${JSON.stringify(session)}`;
    } catch {
      return null;
    }
  }


  function getSessionResponseCount(
    session
  ) {
    return Array.isArray(
      session?.responses
    )
      ? session.responses.length
      : 0;
  }


  function chooseRicherSession(
    localSession,
    cloudSession
  ) {
    if (!localSession) {
      return cloudSession;
    }

    if (!cloudSession) {
      return localSession;
    }

    const localComplete =
      Boolean(
        localSession.completedAt
      );

    const cloudComplete =
      Boolean(
        cloudSession.completedAt
      );

    /*
      A completed copy of the same session
      is safer than an older in-progress copy.
    */
    if (
      localComplete !==
      cloudComplete
    ) {
      return cloudComplete
        ? cloudSession
        : localSession;
    }

    const localResponses =
      getSessionResponseCount(
        localSession
      );

    const cloudResponses =
      getSessionResponseCount(
        cloudSession
      );

    /*
      If both are at the same completion state,
      keep whichever contains more recorded
      responses.
    */
    if (
      localResponses !==
      cloudResponses
    ) {
      return cloudResponses >
        localResponses
        ? cloudSession
        : localSession;
    }

    /*
      Fill missing metadata from the other
      copy while keeping the local version as
      the stable tie-breaker.

      This avoids a session bouncing back and
      forth between two equally complete copies.
    */
    return {
      ...cloudSession,
      ...localSession,

      responses:
        Array.isArray(
          localSession.responses
        )
          ? localSession.responses
          : (
              Array.isArray(
                cloudSession.responses
              )
                ? cloudSession.responses
                : []
            )
    };
  }


  function mergeMorphologySessions(
    localSessions,
    cloudSessions
  ) {
    const local =
      Array.isArray(
        localSessions
      )
        ? localSessions
        : [];

    const cloud =
      Array.isArray(
        cloudSessions
      )
        ? cloudSessions
        : [];

    const merged = [];
    const indexByKey =
      new Map();

    let addedFromCloud = 0;
    let updatedFromCloud = 0;

    function addInitialSession(
      session
    ) {
      const key =
        getSessionKey(
          session
        );

      if (
        !key ||
        !indexByKey.has(key)
      ) {
        if (key) {
          indexByKey.set(
            key,
            merged.length
          );
        }

        merged.push(
          session
        );

        return;
      }

      /*
        Also clean up an accidental duplicate
        already present on the local device.
      */
      const index =
        indexByKey.get(key);

      merged[index] =
        chooseRicherSession(
          merged[index],
          session
        );
    }

    local.forEach(
      addInitialSession
    );

    for (
      const cloudSession
      of cloud
    ) {
      const key =
        getSessionKey(
          cloudSession
        );

      if (
        !key ||
        !indexByKey.has(key)
      ) {
        if (key) {
          indexByKey.set(
            key,
            merged.length
          );
        }

        merged.push(
          cloudSession
        );

        addedFromCloud += 1;

        continue;
      }

      const index =
        indexByKey.get(key);

      const existing =
        merged[index];

      const preferred =
        chooseRicherSession(
          existing,
          cloudSession
        );

      if (
        JSON.stringify(
          preferred
        ) !==
        JSON.stringify(
          existing
        )
      ) {
        merged[index] =
          preferred;

        updatedFromCloud += 1;
      }
    }

    const changed =
      JSON.stringify(
        merged
      ) !==
      JSON.stringify(
        local
      );

    return {
      sessions:
        merged,

      changed,

      addedFromCloud,

      updatedFromCloud
    };
  }


  function getPaperPracticeKey(
    entry
  ) {
    if (
      entry &&
      typeof entry === "object" &&
      entry.id
    ) {
      return `id:${entry.id}`;
    }

    if (
      entry?.resourceId &&
      entry?.practicedAt
    ) {
      return (
        `legacy:${entry.resourceId}:` +
        `${entry.practicedAt}`
      );
    }

    return null;
  }


  function chooseNewestPaperPracticeEntry(
    localEntry,
    cloudEntry
  ) {
    if (!localEntry) {
      return cloudEntry;
    }

    if (!cloudEntry) {
      return localEntry;
    }

    const localTime =
      parseCloudTime(
        localEntry.updatedAt ||
        localEntry.practicedAt
      );

    const cloudTime =
      parseCloudTime(
        cloudEntry.updatedAt ||
        cloudEntry.practicedAt
      );

    if (
      cloudTime !== null &&
      (
        localTime === null ||
        cloudTime > localTime
      )
    ) {
      return cloudEntry;
    }

    return localEntry;
  }


  function mergePaperPracticeLogs(
    localLogs,
    cloudLogs
  ) {
    const local =
      Array.isArray(localLogs)
        ? localLogs
        : [];

    const cloud =
      Array.isArray(cloudLogs)
        ? cloudLogs
        : [];

    const mergedByKey =
      new Map();

    for (
      const entry
      of local
    ) {
      const key =
        getPaperPracticeKey(
          entry
        );

      if (!key) {
        continue;
      }

      mergedByKey.set(
        key,
        entry
      );
    }

    for (
      const entry
      of cloud
    ) {
      const key =
        getPaperPracticeKey(
          entry
        );

      if (!key) {
        continue;
      }

      mergedByKey.set(
        key,
        chooseNewestPaperPracticeEntry(
          mergedByKey.get(key),
          entry
        )
      );
    }

    const merged =
      Array.from(
        mergedByKey.values()
      );

    merged.sort(
      (a, b) =>
        String(
          a?.practicedAt || ""
        ).localeCompare(
          String(
            b?.practicedAt || ""
          )
        )
    );

    return {
      logs:
        merged,

      changed:
        JSON.stringify(
          merged
        ) !==
        JSON.stringify(
          local
        )
    };
  }


  function filterPaperPracticeAfterClear(
    logs,
    clearAt
  ) {
    const list =
      Array.isArray(logs)
        ? logs
        : [];

    const clearTime =
      parseCloudTime(
        clearAt
      );

    if (
      clearTime === null
    ) {
      return list;
    }

    return list.filter(
      entry => {
        const practiceTime =
          parseCloudTime(
            entry?.practicedAt
          );

        return (
          practiceTime !== null &&
          practiceTime >
            clearTime
        );
      }
    );
  }


  const VOLO_GOAL_LEVELS = [
    "Foundation",
    "Expansion",
    "Advanced"
  ];


  function normalizeVoloGoals(
    goals
  ) {
    const selected =
      new Set(
        Array.isArray(goals)
          ? goals
          : []
      );

    return VOLO_GOAL_LEVELS.filter(
      level =>
        selected.has(level)
    );
  }


  function parseCloudTime(
    value
  ) {
    const parsed =
      Date.parse(
        value || ""
      );

    return Number.isFinite(parsed)
      ? parsed
      : null;
  }


  function normalizeLearnerName(
    value
  ) {
    return String(
      value || ""
    ).trim();
  }


  function mergeLearnerName(
    localStudent,
    cloudStudent
  ) {
    const localName =
      normalizeLearnerName(
        localStudent?.name
      );

    const cloudName =
      normalizeLearnerName(
        cloudStudent?.name
      );

    const localTime =
      parseCloudTime(
        localStudent
          ?.nameUpdatedAt
      );

    const cloudTime =
      parseCloudTime(
        cloudStudent
          ?.nameUpdatedAt
      );

    /*
      Once a Rename timestamp exists,
      the newest intentional rename wins.
    */
    if (
      localTime !== null ||
      cloudTime !== null
    ) {
      if (
        cloudTime !== null &&
        (
          localTime === null ||
          cloudTime > localTime
        )
      ) {
        return {
          name:
            cloudName ||
            localName ||
            "Learner",

          updatedAt:
            cloudStudent
              .nameUpdatedAt,

          changed:
            (
              cloudName &&
              cloudName !== localName
            ) ||
            localStudent
              .nameUpdatedAt !==
              cloudStudent
                .nameUpdatedAt
        };
      }

      return {
        name:
          localName ||
          cloudName ||
          "Learner",

        updatedAt:
          localStudent
            .nameUpdatedAt ||
          null,

        changed: false
      };
    }

    /*
      Legacy records have no Rename timestamp.

      Keep the local name unless it is missing;
      the first intentional rename creates the
      timestamp used from then on.
    */
    if (
      !localName &&
      cloudName
    ) {
      return {
        name:
          cloudName,

        updatedAt:
          null,

        changed: true
      };
    }

    return {
      name:
        localName ||
        cloudName ||
        "Learner",

      updatedAt:
        null,

      changed: false
    };
  }


  function mergeVoloGoals(
    localStudent,
    cloudStudent
  ) {
    const localGoals =
      normalizeVoloGoals(
        localStudent?.voloGoals
      );

    const cloudGoals =
      normalizeVoloGoals(
        cloudStudent?.voloGoals
      );

    const localTime =
      parseCloudTime(
        localStudent
          ?.voloGoalsUpdatedAt
      );

    const cloudTime =
      parseCloudTime(
        cloudStudent
          ?.voloGoalsUpdatedAt
      );

    /*
      Once timestamps exist, the newest
      intentional Goal selection wins.

      This supports both checking AND
      unchecking a Goal.
    */
    if (
      localTime !== null ||
      cloudTime !== null
    ) {
      if (
        cloudTime !== null &&
        (
          localTime === null ||
          cloudTime > localTime
        )
      ) {
        return {
          goals:
            cloudGoals,

          updatedAt:
            cloudStudent
              .voloGoalsUpdatedAt,

          changed:
            JSON.stringify(
              localGoals
            ) !==
              JSON.stringify(
                cloudGoals
              ) ||
            localStudent
              .voloGoalsUpdatedAt !==
              cloudStudent
                .voloGoalsUpdatedAt
        };
      }

      return {
        goals:
          localGoals,

        updatedAt:
          localStudent
            .voloGoalsUpdatedAt ||
          null,

        changed: false
      };
    }

    /*
      Older saved records have no Goal
      timestamp yet.

      Until one device makes an intentional
      Goal change, preserve all selected Goals
      rather than silently removing one.
    */
    const union =
      VOLO_GOAL_LEVELS.filter(
        level =>
          localGoals.includes(level) ||
          cloudGoals.includes(level)
      );

    return {
      goals:
        union,

      updatedAt:
        null,

      changed:
        JSON.stringify(
          union
        ) !==
        JSON.stringify(
          localGoals
        )
    };
  }


  function validTokenStore(
    value
  ) {
    return (
      value &&
      typeof value ===
        "object" &&
      !Array.isArray(value)
    )
      ? value
      : {};
  }


  function chooseEarnedToken(
    localToken,
    cloudToken
  ) {
    if (!localToken) {
      return cloudToken;
    }

    if (!cloudToken) {
      return localToken;
    }

    if (
      typeof localToken !==
        "object" ||
      typeof cloudToken !==
        "object"
    ) {
      return localToken;
    }

    const localEarned =
      parseCloudTime(
        localToken.earnedAt
      );

    const cloudEarned =
      parseCloudTime(
        cloudToken.earnedAt
      );

    let earnedAt =
      localToken.earnedAt ||
      cloudToken.earnedAt ||
      null;

    /*
      If both devices know the Token was
      earned, preserve the earliest known
      earning time.
    */
    if (
      localEarned !== null &&
      cloudEarned !== null
    ) {
      earnedAt =
        localEarned <=
        cloudEarned
          ? localToken.earnedAt
          : cloudToken.earnedAt;
    }

    return {
      ...cloudToken,
      ...localToken,
      earnedAt
    };
  }


  function mergeVoloTokens(
    localTokens,
    cloudTokens
  ) {
    const local =
      validTokenStore(
        localTokens
      );

    const cloud =
      validTokenStore(
        cloudTokens
      );

    const merged = {
      ...local
    };

    /*
      Tokens are sticky evidence.

      If either device has already earned
      a Token, keep it.

      Clear Progress will later receive its
      own explicit cloud behavior.
    */
    for (
      const [
        setId,
        cloudToken
      ]
      of Object.entries(cloud)
    ) {
      merged[setId] =
        chooseEarnedToken(
          local[setId],
          cloudToken
        );
    }

    return {
      tokens:
        merged,

      changed:
        JSON.stringify(
          merged
        ) !==
        JSON.stringify(
          local
        )
    };
  }


  function studentContextKey(
    context
  ) {
    if (
      context?.status !== "authorized" ||
      context.mode !== "student" ||
      !context.userId ||
      !context.studentId ||
      !context.classId ||
      !context.educatorId
    ) {
      return null;
    }

    return [
      context.userId,
      context.studentId,
      context.classId,
      context.educatorId
    ].join(":");
  }


  function currentStudentContext(
    expectedKey,
    expectedGeneration
  ) {
    const context = access.getContext();

    if (
      expectedGeneration !== accessGeneration ||
      studentContextKey(context) !== expectedKey
    ) {
      return null;
    }

    return context;
  }


  async function recheckStudentAccess(
    expectedKey,
    expectedGeneration
  ) {
    if (!currentStudentContext(
      expectedKey,
      expectedGeneration
    )) {
      return;
    }

    const { data } = await client.auth.getSession();

    if (currentStudentContext(
      expectedKey,
      expectedGeneration
    )) {
      access.resolveForSession(
        data?.session || null
      );
    }
  }


  function cleanStudentRecord(
    context,
    source = {}
  ) {
    return {
      id: context.studentId,
      name: context.studentName || "Student",
      createdAt:
        source.createdAt ||
        new Date().toISOString(),
      sessions:
        Array.isArray(source.sessions)
          ? source.sessions
          : [],
      paperPractice:
        Array.isArray(source.paperPractice)
          ? source.paperPractice
          : [],
      voloTokens:
        validTokenStore(source.voloTokens),
      voloGoals:
        Array.isArray(source.voloGoals)
          ? source.voloGoals
          : [],
      voloGoalsUpdatedAt:
        source.voloGoalsUpdatedAt ||
        null
    };
  }


  function localStudentForContext(
    context
  ) {
    const storageKey =
      access.localProgressKey(context);
    const progress = readLocalProgress(storageKey);
    const existing = progress.students.find(
      student => student?.id === context.studentId
    );

    return cleanStudentRecord(
      context,
      existing || {}
    );
  }


  function mergeAuthorizedStudent(
    context,
    localStudent,
    cloudStudent
  ) {
    const local = cleanStudentRecord(
      context,
      localStudent
    );
    const cloud = cleanStudentRecord(
      context,
      cloudStudent
    );
    const sessionMerge = mergeMorphologySessions(
      local.sessions,
      cloud.sessions
    );
    const paperMerge = mergePaperPracticeLogs(
      local.paperPractice,
      cloud.paperPractice
    );
    const tokenMerge = mergeVoloTokens(
      local.voloTokens,
      cloud.voloTokens
    );
    const goalMerge = mergeVoloGoals(
      local,
      cloud
    );
    const merged = {
      id: context.studentId,
      name:
        cloudStudent?.name ||
        context.studentName ||
        "Student",
      createdAt:
        cloudStudent?.createdAt ||
        local.createdAt,
      sessions: sessionMerge.sessions,
      paperPractice: paperMerge.logs,
      voloTokens: tokenMerge.tokens,
      voloGoals: goalMerge.goals,
      voloGoalsUpdatedAt:
        goalMerge.updatedAt
    };

    window.FirstVoloTokens
      ?.updateEarnedTokens?.({
        students: [merged]
      });

    return merged;
  }


  function hasStudentEvidence(
    student
  ) {
    return Boolean(
      student?.sessions?.length ||
      student?.paperPractice?.length ||
      student?.voloGoals?.length ||
      Object.keys(
        validTokenStore(student?.voloTokens)
      ).length
    );
  }


  function writeAuthorizedStudent(
    context,
    student
  ) {
    const storageKey =
      access.localProgressKey(context);

    if (!storageKey) {
      return;
    }

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        students: [student],
        activeStudentId: context.studentId
      })
    );

    window.dispatchEvent(
      new CustomEvent(
        "firstvolomorphologystudentstate",
        { detail: { studentId: context.studentId } }
      )
    );
  }


  async function restoreStudentState(
    context,
    expectedKey,
    expectedGeneration
  ) {
    const localStudent =
      localStudentForContext(context);
    const controller = new AbortController();
    studentReadAbortController = controller;
    const { data, error } = await client
      .rpc("get_morphology_student_state")
      .abortSignal(controller.signal);

    if (studentReadAbortController === controller) {
      studentReadAbortController = null;
    }

    const current = currentStudentContext(
      expectedKey,
      expectedGeneration
    );

    if (!current) {
      return;
    }

    if (error) {
      console.warn(
        "Morphology student cloud restore failed.",
        error
      );
      await recheckStudentAccess(
        expectedKey,
        expectedGeneration
      );
      return;
    }

    const rows = Array.isArray(data) ? data : [];
    const row = rows.length === 1 ? rows[0] : null;
    const hasCloudState = Boolean(
      row?.learner_profile_id &&
      row.data &&
      typeof row.data === "object" &&
      !Array.isArray(row.data) &&
      Object.keys(row.data).length
    );
    const merged = hasCloudState
      ? mergeAuthorizedStudent(
          current,
          localStudent,
          row.data
        )
      : cleanStudentRecord(
          current,
          localStudent
        );

    writeAuthorizedStudent(current, merged);
    studentCloudReadyKey = expectedKey;

    if (
      hasStudentEvidence(merged) &&
      (!hasCloudState ||
       JSON.stringify(merged) !== JSON.stringify(row.data))
    ) {
      queueStudentSync();
    }
  }


  async function saveStudentNow() {
    const expectedGeneration = accessGeneration;
    const context = access.getContext();
    const expectedKey = studentContextKey(context);

    if (
      !expectedKey ||
      studentCloudReadyKey !== expectedKey
    ) {
      return;
    }

    if (studentSyncing) {
      studentSyncQueued = true;
      return;
    }

    studentSyncing = true;
    studentSyncQueued = false;

    try {
      const student = localStudentForContext(context);
      const clientUpdatedAt = new Date().toISOString();
      const controller = new AbortController();
      studentSaveAbortController = controller;
      const { data, error } = await client
        .rpc(
          "save_morphology_student_state",
          {
            p_data: student,
            p_client_updated_at: clientUpdatedAt
          }
        )
        .abortSignal(controller.signal);

      if (studentSaveAbortController === controller) {
        studentSaveAbortController = null;
      }
      const current = currentStudentContext(
        expectedKey,
        expectedGeneration
      );

      if (!current) {
        return;
      }

      if (error) {
        console.warn(
          "Morphology student cloud save failed.",
          error
        );
        await recheckStudentAccess(
          expectedKey,
          expectedGeneration
        );
        return;
      }

      const rows = Array.isArray(data) ? data : [];
      const result = rows.length === 1 ? rows[0] : null;

      if (!result?.data ||
          typeof result.data !== "object" ||
          Array.isArray(result.data)) {
        return;
      }

      /*
        A false result means the server already held an equal/newer
        authoritative revision. Adopt its evidence locally and do not
        immediately enqueue another write.
      */
      if (result.write_applied === false) {
        writeAuthorizedStudent(
          current,
          mergeAuthorizedStudent(
            current,
            student,
            result.data
          )
        );
        return;
      }

      writeAuthorizedStudent(
        current,
        mergeAuthorizedStudent(
          current,
          student,
          result.data
        )
      );
    } finally {
      studentSyncing = false;

      if (studentSyncQueued) {
        studentSyncQueued = false;
        queueStudentSync();
      }
    }
  }


  function queueStudentSync() {
    const context = access.getContext();
    const expectedKey = studentContextKey(context);

    if (
      !expectedKey ||
      studentCloudReadyKey !== expectedKey
    ) {
      return;
    }

    clearTimeout(studentSyncTimer);
    studentSyncTimer = setTimeout(
      saveStudentNow,
      700
    );
  }


  function newestProgressClear(
    localClearAt,
    cloudClearAt
  ) {
    const localTime =
      parseCloudTime(
        localClearAt
      );

    const cloudTime =
      parseCloudTime(
        cloudClearAt
      );

    if (
      localTime === null &&
      cloudTime === null
    ) {
      return null;
    }

    if (
      cloudTime !== null &&
      (
        localTime === null ||
        cloudTime > localTime
      )
    ) {
      return cloudClearAt;
    }

    return (
      localClearAt ||
      cloudClearAt ||
      null
    );
  }


  function filterSessionsAfterClear(
    sessions,
    clearAt
  ) {
    const list =
      Array.isArray(sessions)
        ? sessions
        : [];

    const clearTime =
      parseCloudTime(
        clearAt
      );

    if (clearTime === null) {
      return list;
    }

    return list.filter(
      session => {
        /*
          startedAt is the stable origin
          of a session.

          A legacy session without a usable
          timestamp is treated as old when
          an explicit Clear Progress exists.
        */
        const sessionTime =
          parseCloudTime(
            session?.startedAt ||
            session?.completedAt
          );

        return (
          sessionTime !== null &&
          sessionTime > clearTime
        );
      }
    );
  }


  function filterTokensAfterClear(
    tokens,
    clearAt
  ) {
    const store =
      validTokenStore(
        tokens
      );

    const clearTime =
      parseCloudTime(
        clearAt
      );

    if (clearTime === null) {
      return store;
    }

    const filtered = {};

    for (
      const [
        setId,
        token
      ]
      of Object.entries(store)
    ) {
      const earnedTime =
        parseCloudTime(
          token?.earnedAt
        );

      /*
        Only a Token earned after the clear
        belongs to the new progress history.
      */
      if (
        earnedTime !== null &&
        earnedTime > clearTime
      ) {
        filtered[setId] =
          token;
      }
    }

    return filtered;
  }


  function validDeletionMap(
    value
  ) {
    return (
      value &&
      typeof value ===
        "object" &&
      !Array.isArray(value)
    )
      ? value
      : {};
  }


  function newestMorphologyDeletion(
    localDeletedAt,
    cloudDeletedAt
  ) {
    const localTime =
      parseCloudTime(
        localDeletedAt
      );

    const cloudTime =
      parseCloudTime(
        cloudDeletedAt
      );

    if (
      localTime === null &&
      cloudTime === null
    ) {
      return null;
    }

    if (
      cloudTime !== null &&
      (
        localTime === null ||
        cloudTime > localTime
      )
    ) {
      return cloudDeletedAt;
    }

    return (
      localDeletedAt ||
      cloudDeletedAt ||
      null
    );
  }


  async function syncLocalDeletionTombstones(
    progress
  ) {
    if (!educatorCloudAuthorized()) {
      return 0;
    }

    const deletions =
      validDeletionMap(
        progress
          ?.deletedMorphologyLearners
      );

    let synced = 0;

    for (
      const [
        studentId,
        deletedAt
      ]
      of Object.entries(deletions)
    ) {
      if (
        !studentId ||
        parseCloudTime(
          deletedAt
        ) === null
      ) {
        continue;
      }

      /*
        Find the existing shared learner
        profile. Do NOT delete it and do
        not create a new profile solely
        because Morphology was deleted.
      */
      const {
        data: learners,
        error: learnerError
      } =
        await client
          .from("learner_profiles")
          .select("id")
          .eq(
            "owner_user_id",
            currentUser.id
          )
          .eq(
            "product_key",
            PRODUCT_KEY
          )
          .eq(
            "local_profile_id",
            studentId
          )
          .limit(1);

      if (learnerError) {
        throw learnerError;
      }

      const learner =
        Array.isArray(learners)
          ? learners[0]
          : null;

      if (!learner?.id) {
        continue;
      }

      const now =
        new Date().toISOString();

      /*
        Replace only this product's
        learning_state with a tombstone.

        learner_profiles stays intact for
        Primo Volo and other First Volo
        products.
      */
      const {
        error: stateError
      } =
        await client
          .from("learning_state")
          .upsert(
            {
              learner_profile_id:
                learner.id,

              product_key:
                PRODUCT_KEY,

              store_key:
                STORE_KEY,

              data: {
                id:
                  studentId,

                deletedAt
              },

              client_updated_at:
                now,

              updated_at:
                now
            },
            {
              onConflict:
                "learner_profile_id,product_key,store_key"
            }
          );

      if (stateError) {
        throw stateError;
      }

      synced += 1;
    }

    return synced;
  }


  async function restoreAndMergeLearners() {
    if (!educatorCloudAuthorized()) {
      return {
        restored: 0,
        mergedLearners: 0,
        deletedLearners: 0,
        sessionsAdded: 0,
        sessionsUpdated: 0
      };
    }

    /*
      Step 1:
      Restore learners that do not exist
      on this device.

      Step 2A through 2E:
      Restore and safely synchronize Morphology
      sessions, paper/hands-on practice, Volo Goals,
      earned Volo Tokens, Clear Progress, Rename, and Morphology-
      specific Delete tombstones.
    */

    const {
      data: cloudStates,
      error: stateError
    } =
      await client
        .from("learning_state")
        .select(
          "learner_profile_id, data"
        )
        .eq(
          "product_key",
          PRODUCT_KEY
        )
        .eq(
          "store_key",
          STORE_KEY
        );

    if (stateError) {
      throw stateError;
    }

    if (
      !Array.isArray(
        cloudStates
      ) ||
      !cloudStates.length
    ) {
      return {
        restored: 0,
        mergedLearners: 0,
        deletedLearners: 0,
        sessionsAdded: 0,
        sessionsUpdated: 0
      };
    }

    const {
      data: cloudLearners,
      error: learnerError
    } =
      await client
        .from("learner_profiles")
        .select(
          "id, local_profile_id, display_name, created_at"
        )
        .eq(
          "owner_user_id",
          currentUser.id
        )
        .eq(
          "product_key",
          PRODUCT_KEY
        );

    if (learnerError) {
      throw learnerError;
    }

    const stateByLearnerId =
      new Map(
        cloudStates.map(
          state => [
            state.learner_profile_id,
            state
          ]
        )
      );

    const progress =
      readLocalProgress();

    if (
      !progress.deletedMorphologyLearners ||
      typeof progress.deletedMorphologyLearners !==
        "object" ||
      Array.isArray(
        progress.deletedMorphologyLearners
      )
    ) {
      progress.deletedMorphologyLearners = {};
    }

    const localStudentById =
      new Map(
        progress.students
          .filter(
            student =>
              student?.id
          )
          .map(
            student => [
              student.id,
              student
            ]
          )
      );

    let restored = 0;
    let mergedLearners = 0;
    let deletedLearners = 0;
    let sessionsAdded = 0;
    let sessionsUpdated = 0;

    for (
      const learner
      of (
        Array.isArray(
          cloudLearners
        )
          ? cloudLearners
          : []
      )
    ) {
      const studentId =
        learner.local_profile_id;

      if (!studentId) {
        continue;
      }

      const state =
        stateByLearnerId.get(
          learner.id
        );

      /*
        learner_profiles is shared among
        First Volo products.

        Only use this learner here when
        Morphology scored-progress data exists.
      */
      if (
        !state ||
        !state.data ||
        typeof state.data !==
          "object"
      ) {
        continue;
      }

      const cloudStudent =
        state.data;

      const localStudent =
        localStudentById.get(
          studentId
        );

      const localDeletedAt =
        progress
          .deletedMorphologyLearners[
            studentId
          ] ||
        null;

      const cloudDeletedAt =
        cloudStudent.deletedAt ||
        null;

      const newestDeletedAt =
        newestMorphologyDeletion(
          localDeletedAt,
          cloudDeletedAt
        );

      /*
        STEP 2E:
        A Morphology deletion wins over
        older saved Morphology state.

        The shared learner_profiles row is
        intentionally left untouched.
      */
      if (newestDeletedAt) {
        let deletionChanged = false;

        if (
          progress
            .deletedMorphologyLearners[
              studentId
            ] !== newestDeletedAt
        ) {
          progress
            .deletedMorphologyLearners[
              studentId
            ] = newestDeletedAt;

          deletionChanged = true;
        }

        if (localStudent) {
          progress.students =
            progress.students.filter(
              student =>
                student.id !== studentId
            );

          localStudentById.delete(
            studentId
          );

          if (
            progress.activeStudentId ===
            studentId
          ) {
            progress.activeStudentId =
              null;
          }

          deletionChanged = true;
        }

        if (deletionChanged) {
          deletedLearners += 1;
        }

        continue;
      }

      /*
        STEP 2A + 2B + 2C + 2D + 2E:
        Same learner exists locally and
        in Supabase.

        - merge sessions by session ID
        - preserve earned Volo Tokens
        - use newest intentional Goal state
        - honor newest Clear Progress cutoff
        - use newest intentional Rename

        Delete is intentionally not handled yet.
      */
      if (localStudent) {
        let learnerChanged = false;

        const nameMerge =
          mergeLearnerName(
            localStudent,
            cloudStudent
          );

        if (
          nameMerge.changed
        ) {
          localStudent.name =
            nameMerge.name;

          localStudent.nameUpdatedAt =
            nameMerge.updatedAt;

          learnerChanged = true;
        }

        const localClearAt =
          localStudent.progressClearedAt ||
          null;

        const cloudClearAt =
          cloudStudent.progressClearedAt ||
          null;

        const newestClearAt =
          newestProgressClear(
            localClearAt,
            cloudClearAt
          );

        const originalLocalSessions =
          Array.isArray(
            localStudent.sessions
          )
            ? localStudent.sessions
            : [];

        const sessionMerge =
          mergeMorphologySessions(
            filterSessionsAfterClear(
              localStudent.sessions,
              newestClearAt
            ),
            filterSessionsAfterClear(
              cloudStudent.sessions,
              newestClearAt
            )
          );

        const sessionsChanged =
          JSON.stringify(
            sessionMerge.sessions
          ) !==
          JSON.stringify(
            originalLocalSessions
          );

        if (
          sessionsChanged
        ) {
          localStudent.sessions =
            sessionMerge.sessions;

          learnerChanged = true;

          sessionsAdded +=
            sessionMerge
              .addedFromCloud;

          sessionsUpdated +=
            sessionMerge
              .updatedFromCloud;
        }

        const originalLocalPaperPractice =
          Array.isArray(
            localStudent.paperPractice
          )
            ? localStudent.paperPractice
            : [];

        const paperPracticeMerge =
          mergePaperPracticeLogs(
            filterPaperPracticeAfterClear(
              localStudent.paperPractice,
              newestClearAt
            ),
            filterPaperPracticeAfterClear(
              cloudStudent.paperPractice,
              newestClearAt
            )
          );

        if (
          JSON.stringify(
            paperPracticeMerge.logs
          ) !==
          JSON.stringify(
            originalLocalPaperPractice
          )
        ) {
          localStudent.paperPractice =
            paperPracticeMerge.logs;

          learnerChanged = true;
        }

        const originalLocalTokens =
          validTokenStore(
            localStudent.voloTokens
          );

        const tokenMerge =
          mergeVoloTokens(
            filterTokensAfterClear(
              localStudent.voloTokens,
              newestClearAt
            ),
            filterTokensAfterClear(
              cloudStudent.voloTokens,
              newestClearAt
            )
          );

        const tokensChanged =
          JSON.stringify(
            tokenMerge.tokens
          ) !==
          JSON.stringify(
            originalLocalTokens
          );

        if (
          tokensChanged
        ) {
          localStudent.voloTokens =
            tokenMerge.tokens;

          learnerChanged = true;
        }

        if (
          newestClearAt &&
          localStudent.progressClearedAt !==
            newestClearAt
        ) {
          localStudent.progressClearedAt =
            newestClearAt;

          learnerChanged = true;
        }

        const goalMerge =
          mergeVoloGoals(
            localStudent,
            cloudStudent
          );

        if (
          goalMerge.changed
        ) {
          localStudent.voloGoals =
            goalMerge.goals;

          localStudent.voloGoalsUpdatedAt =
            goalMerge.updatedAt;

          learnerChanged = true;
        }

        /*
          Sessions from both devices may,
          together, satisfy a Token rule.

          Re-evaluate the combined evidence.
        */
        const tokenUpdate =
          window.FirstVoloTokens
            ?.updateEarnedTokens?.({
              students: [
                localStudent
              ]
            });

        if (
          tokenUpdate?.changed
        ) {
          learnerChanged = true;
        }

        if (learnerChanged) {
          mergedLearners += 1;
        }

        continue;
      }

      /*
        STEP 1:
        Learner exists in Morphology cloud
        data but not on this device.
      */
      const name =
        String(
          cloudStudent.name ||
          learner.display_name ||
          "Learner"
        ).trim() ||
        "Learner";

      const voloTokens =
        cloudStudent.voloTokens &&
        typeof cloudStudent.voloTokens ===
          "object" &&
        !Array.isArray(
          cloudStudent.voloTokens
        )
          ? cloudStudent.voloTokens
          : {};

      const progressClearedAt =
        cloudStudent.progressClearedAt ||
        null;

      const restoredStudent = {
        id:
          studentId,

        name,

        nameUpdatedAt:
          cloudStudent.nameUpdatedAt ||
          null,

        createdAt:
          cloudStudent.createdAt ||
          learner.created_at ||
          new Date().toISOString(),

        sessions:
          filterSessionsAfterClear(
            cloudStudent.sessions,
            progressClearedAt
          ),

        paperPractice:
          filterPaperPracticeAfterClear(
            cloudStudent.paperPractice,
            progressClearedAt
          ),

        voloTokens:
          filterTokensAfterClear(
            voloTokens,
            progressClearedAt
          ),

        voloGoals:
          Array.isArray(
            cloudStudent.voloGoals
          )
            ? cloudStudent.voloGoals
            : [],

        voloGoalsUpdatedAt:
          cloudStudent.voloGoalsUpdatedAt ||
          null,

        progressClearedAt
      };

      /*
        A restored learner may already have
        enough saved evidence for additional
        sticky Tokens under the current rules.
      */
      window.FirstVoloTokens
        ?.updateEarnedTokens?.({
          students: [
            restoredStudent
          ]
        });

      progress.students.push(
        restoredStudent
      );

      localStudentById.set(
        studentId,
        restoredStudent
      );

      restored += 1;
    }

    if (
      restored > 0 ||
      mergedLearners > 0 ||
      deletedLearners > 0
    ) {
      localStorage.setItem(
        LOCAL_PROGRESS_KEY,
        JSON.stringify(
          progress
        )
      );
    }

    return {
      restored,
      mergedLearners,
      deletedLearners,
      sessionsAdded,
      sessionsUpdated
    };
  }


  async function syncNow() {
    if (
      !educatorCloudAuthorized() ||
      syncing
    ) {
      return;
    }

    syncing = true;

    updateUI(
      "Backing up Morphology progress…"
    );

    try {
      /*
        Push Morphology Delete tombstones FIRST.

        Otherwise the normal restore pass could
        bring back a learner that was just
        intentionally deleted on this device.
      */
      const beforeRestoreProgress =
        readLocalProgress();

      await syncLocalDeletionTombstones(
        beforeRestoreProgress
      );

      /*
        Then pull and combine the remaining
        Morphology state normally.
      */
      await restoreAndMergeLearners();

      const progress =
        readLocalProgress();

      let saved = 0;

      for (
        const student
        of progress.students
      ) {
        const success =
          await backupStudent(
            student
          );

        if (success) {
          saved += 1;
        }
      }

      updateUI(
        saved
          ? `Cloud backup complete for ${saved} learner${saved === 1 ? "" : "s"}.`
          : "Cloud backup is on. There are no saved learners to back up yet."
      );
    } catch (error) {
      console.warn(
        "Morphology cloud backup failed.",
        error
      );

      updateUI(
        "Cloud backup could not complete. Your local progress is still saved."
      );
    } finally {
      syncing = false;
    }
  }

  function queueSync() {
    const context = access.getContext();

    if (
      context.status === "authorized" &&
      context.mode === "student"
    ) {
      queueStudentSync();
      return;
    }

    if (!educatorCloudAuthorized()) {
      return;
    }

    clearTimeout(
      syncTimer
    );

    syncTimer =
      setTimeout(
        syncNow,
        700
      );
  }

  function closeModal() {
    if (cloudModal) {
      cloudModal.hidden =
        true;
    }
  }

  function buildUI() {
    if (
      document.getElementById(
        "morphologyCloudButton"
      )
    ) {
      return;
    }

    const headerActions =
      document.querySelector(
        ".header-actions"
      );

    if (!headerActions) {
      return;
    }

    const style =
      document.createElement(
        "style"
      );

    style.textContent = `
      .fv-cloud-modal[hidden] {
        display: none;
      }

      .fv-cloud-modal {
        position: fixed;
        inset: 0;
        z-index: 100000;
        display: grid;
        place-items: center;
        padding: 18px;
        background: rgba(20, 35, 55, .48);
      }

      .fv-cloud-card {
        width: min(470px, 100%);
        padding: 24px;
        border-radius: 22px;
        background: white;
        box-shadow: 0 20px 55px rgba(0,0,0,.22);
      }

      .fv-cloud-heading {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 14px;
      }

      .fv-cloud-heading h2 {
        margin: 0;
      }

      .fv-cloud-close {
        border: 0;
        background: transparent;
        cursor: pointer;
        font-size: 1.5rem;
      }

      .fv-cloud-message {
        line-height: 1.45;
      }

      .fv-cloud-form {
        display: grid;
        gap: 9px;
        margin-top: 18px;
      }

      .fv-cloud-form input {
        box-sizing: border-box;
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #c8d3df;
        border-radius: 10px;
        font: inherit;
      }

      .fv-cloud-card .header-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 42px;
        padding: 9px 14px;
        border: 1px solid #bfd0e4;
        border-radius: 10px;
        background: #eef5fc;
        color: #173a64;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
      }

      .fv-cloud-form .header-link {
        width: 100%;
      }

      .fv-cloud-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 14px;
      }

      .fv-cloud-note {
        margin-top: 18px;
        padding-top: 14px;
        border-top: 1px solid #e3e8ee;
        font-size: .84rem;
        line-height: 1.45;
        opacity: .8;
      }
    `;

    document.head.appendChild(
      style
    );

    cloudButton =
      document.createElement(
        "button"
      );

    cloudButton.id =
      "morphologyCloudButton";

    cloudButton.type =
      "button";

    cloudButton.className =
      "header-link";

    headerActions.appendChild(
      cloudButton
    );

    cloudModal =
      document.createElement(
        "div"
      );

    cloudModal.className =
      "fv-cloud-modal";

    cloudModal.hidden =
      true;

    cloudModal.setAttribute(
      "role",
      "dialog"
    );

    cloudModal.setAttribute(
      "aria-modal",
      "true"
    );

    cloudModal.innerHTML = `
      <div class="fv-cloud-card">

        <div class="fv-cloud-heading">
          <h2>☁️ Save Across Devices</h2>

          <button
            type="button"
            class="fv-cloud-close"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <p
          id="morphologyCloudMessage"
          class="fv-cloud-message"
        ></p>

        <p>
          Use an adult email to receive a secure
          sign-in link. Learners do not need email
          accounts or passwords.
        </p>

        <form
          id="morphologyCloudForm"
          class="fv-cloud-form"
        >
          <label for="morphologyCloudEmail">
            Adult email
          </label>

          <input
            id="morphologyCloudEmail"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
            required
          >

          <button
            class="header-link"
            type="submit"
          >
            Send sign-in link
          </button>
        </form>

        <div class="fv-cloud-actions">

          <button
            id="morphologyCloudSync"
            class="header-link"
            type="button"
            hidden
          >
            Back up now
          </button>

          <button
            id="morphologyCloudSignOut"
            class="header-link"
            type="button"
            hidden
          >
            Sign out
          </button>

        </div>

        <p class="fv-cloud-note">
          <strong>Local saving always remains active.</strong>
          When you sign in, learner profiles and
          Morphology progress are also saved to your
          First Volo Cloud account so they can sync
          across your devices. Signing out does not
          erase data already saved in this browser.
          Deleting a learner from Morphology removes
          that learner's Morphology data but does not
          delete the shared First Volo learner profile
          used by other First Volo products.
        </p>

      </div>
    `;

    document.body.appendChild(
      cloudModal
    );

    cloudMessage =
      cloudModal.querySelector(
        "#morphologyCloudMessage"
      );

    cloudEmail =
      cloudModal.querySelector(
        "#morphologyCloudEmail"
      );

    signOutButton =
      cloudModal.querySelector(
        "#morphologyCloudSignOut"
      );

    syncButton =
      cloudModal.querySelector(
        "#morphologyCloudSync"
      );

    const form =
      cloudModal.querySelector(
        "#morphologyCloudForm"
      );

    cloudButton.addEventListener(
      "click",
      () => {
        cloudModal.hidden =
          false;

        updateUI();

        if (!currentUser) {
          setTimeout(
            () =>
              cloudEmail?.focus(),
            0
          );
        }
      }
    );

    cloudModal
      .querySelector(
        ".fv-cloud-close"
      )
      .addEventListener(
        "click",
        closeModal
      );

    cloudModal.addEventListener(
      "click",
      event => {
        if (
          event.target ===
          cloudModal
        ) {
          closeModal();
        }
      }
    );

    document.addEventListener(
      "keydown",
      event => {
        if (
          event.key === "Escape" &&
          !cloudModal.hidden
        ) {
          closeModal();
        }
      }
    );

    form.addEventListener(
      "submit",
      async event => {
        event.preventDefault();

        const email =
          String(
            cloudEmail?.value ||
            ""
          ).trim();

        if (!email) {
          return;
        }

        updateUI(
          "Sending sign-in email…"
        );

        const redirectTo =
          window.location.origin +
          window.location.pathname;

        const {
          error
        } =
          await client.auth
            .signInWithOtp({
              email,
              options: {
                emailRedirectTo:
                  redirectTo,

                shouldCreateUser:
                  true
              }
            });

        if (error) {
          console.warn(
            "Morphology sign-in email failed.",
            error
          );

          updateUI(
            "The sign-in email could not be sent."
          );

          return;
        }

        updateUI(
          "Check your email and open the First Volo sign-in link."
        );
      }
    );

    syncButton.addEventListener(
      "click",
      syncNow
    );

    signOutButton.addEventListener(
      "click",
      async () => {
        await client.auth.signOut();
      }
    );

    updateUI();
  }

  window.FirstVoloMorphologyCloud = {
    queueSync,
    syncNow,
    /*
      Keep the Step 1 alias for compatibility,
      while exposing the more accurate Step 2A
      method name too.
    */
    restoreCloudOnly:
      restoreAndMergeLearners,

    restoreAndMerge:
      restoreAndMergeLearners,
    getUser() {
      return currentUser;
    },
    pendingSyncTimer() {
      const timer = syncTimer;
      clearTimeout(syncTimer);
      syncTimer = null;
      return timer;
    }
  };

  access.subscribe(
    async context => {
      accessGeneration += 1;
      const expectedGeneration = accessGeneration;

      clearTimeout(syncTimer);
      syncTimer = null;
      clearTimeout(studentSyncTimer);
      studentSyncTimer = null;
      studentReadAbortController?.abort();
      studentReadAbortController = null;
      studentSaveAbortController?.abort();
      studentSaveAbortController = null;
      studentSyncQueued = false;
      studentCloudReadyKey = null;
      currentUser = context.status === "authorized"
        ? access.getUser()
        : null;


      updateUI();

      if (context.status !== "authorized") {
        return;
      }


      if (context.mode === "student") {
        const expectedKey = studentContextKey(context);

        if (expectedKey) {
          restoreStudentState(
            context,
            expectedKey,
            expectedGeneration
          );
        }
        return;
      }

      if (
        context.mode === "educator"
      ) {
        setTimeout(
          async () => {
            try {
              const result =
                await restoreAndMergeLearners();

              const changedLearners =
                result.restored +
                result.mergedLearners +
                result.deletedLearners;

              if (
                changedLearners > 0
              ) {
                updateUI(
                  `Cloud sync updated ${changedLearners} Morphology learner${changedLearners === 1 ? "" : "s"}. Reloading…`
                );

                /*
                  Reload once so activity-progress.js
                  and progress-tracker.js read the newly
                  restored localStorage record normally.

                  On the reload, the IDs now exist locally,
                  so they will NOT be restored a second time.
                */
                setTimeout(
                  () => {
                    window.location.reload();
                  },
                  300
                );

                return;
              }

              /*
                Nothing cloud-only needed restoring.
                Continue the existing backup behavior.
              */
              syncNow();
            } catch (error) {
              console.warn(
                "Morphology cloud restore failed.",
                error
              );

              updateUI(
                "Cloud restore could not complete. Existing local progress was not changed."
              );
            }
          },
          0
        );
      }
    }
  );

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      buildUI
    );
  } else {
    buildUI();
  }
})();
