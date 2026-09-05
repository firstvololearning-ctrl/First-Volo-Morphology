(function () {
  "use strict";

  const SUPABASE_URL =
    "https://apkvvspubolyxlqtlkto.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_0O4rNLfhuW18xYRZSPkLpw_xyXR9d3n";
  const PRODUCT_KEY = "first-volo-morphology";
  const EDUCATOR_SELECTED_PROGRESS_PREFIX =
    "firstVoloMorphologyProgressV1:educator-selected:";
  const FIRST_VOLO_URL =
    "https://firstvololearning-ctrl.github.io/First-Volo-Account/";
  const EDUCATOR_SIGN_IN_URL =
    `${FIRST_VOLO_URL}?returnTo=morphology`;
  const STUDENT_SIGN_IN_URL =
    `${FIRST_VOLO_URL}student-login.html?returnTo=morphology`;
  const CANONICAL_UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const EDUCATOR_ONLY_PAGES = new Set([
    "program-progress.html",
    "session-materials.html",
    "session-guide.html",
    "educator-resources.html",
    "progress-monitoring.html",
    "flight-a-assessment.html",
    "flight-b-assessment.html",
    "flight-c-assessment.html",
    "curriculum-map.html",
    "extend-learning.html",
    "printables.html",
    "quick-start.html",
    "research.html",
    "research-evidence-new.html"
  ]);

  const LOCKED_CONTEXT = Object.freeze({
    status: "locked",
    mode: null,
    userId: null,
    studentId: null,
    classId: null,
    educatorId: null
  });

  if (!window.supabase?.createClient) {
    window.FirstVoloMorphologyAccess = {
      client: null,
      getContext: () => LOCKED_CONTEXT,
      whenReady: () => Promise.resolve(LOCKED_CONTEXT),
      subscribe(listener) {
        listener(LOCKED_CONTEXT);
        return () => {};
      }
    };
    return;
  }

  const client = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );

  let generation = 0;
  let currentUser = null;
  let context = Object.freeze({
    ...LOCKED_CONTEXT,
    status: "loading"
  });
  let readyPromise = Promise.resolve(context);
  let selectedReadAbortController = null;
  const listeners = new Set();

  function installAccessShell() {
    const build = () => {
      if (document.getElementById("morphologyAccessGate")) return;
      const gate = document.createElement("main");
      gate.id = "morphologyAccessGate";
      gate.innerHTML = '<div><h1>Checking First Volo access…</h1><p>Please wait.</p></div>';
      document.body.prepend(gate);
    };
    document.readyState === "loading"
      ? document.addEventListener("DOMContentLoaded", build, { once: true })
      : build();
  }

  function currentPageName() {
    return window.location.pathname.split("/").pop() || "index.html";
  }

  function requestedStudentTarget() {
    const values = new URLSearchParams(
      window.location.search
    ).getAll("studentId");

    if (values.length === 0) {
      return { present: false, studentId: null, valid: true };
    }

    const studentId = values.length === 1
      ? values[0].trim()
      : "";

    return {
      present: true,
      studentId,
      valid:
        values.length === 1 &&
        CANONICAL_UUID_PATTERN.test(studentId)
    };
  }

  function preserveSelectedStudentNavigation(next) {
    if (
      next.status !== "authorized" ||
      next.mode !== "educator-selected" ||
      !next.studentId
    ) {
      return;
    }

    const pagePath = window.location.pathname;
    const appBasePath = pagePath.slice(
      0,
      pagePath.lastIndexOf("/") + 1
    );
    const links = document.querySelectorAll?.("a[href]") || [];

    links.forEach((link) => {
      const href = link.getAttribute("href");

      if (!href || href.startsWith("#")) {
        return;
      }

      let url;
      try {
        url = new URL(href, window.location.href);
      } catch (_error) {
        return;
      }

      const isInternalPage =
        url.origin === window.location.origin &&
        url.pathname.startsWith(appBasePath) &&
        (url.pathname.endsWith("/") ||
          url.pathname.endsWith(".html"));

      if (!isInternalPage) {
        return;
      }

      url.searchParams.set("studentId", next.studentId);
      link.setAttribute("href", url.href);
    });
  }

  function applyAccessUI(next) {
    const wrongRole = next.mode === "student" &&
      EDUCATOR_ONLY_PAGES.has(currentPageName());
    document.documentElement.dataset.morphologyPageAllowed =
      String(next.status === "authorized" && !wrongRole);
    const studentIdentity = document.getElementById(
      "morphologyStudentIdentity"
    );
    if (studentIdentity) {
      const showStudentIdentity =
        next.status === "authorized" && next.mode === "student";
      studentIdentity.textContent = showStudentIdentity
        ? `Student: ${next.studentName || "Student"}`
        : "";
      studentIdentity.hidden = !showStudentIdentity;
    }
    const educatorSelectedIdentity = document.getElementById(
      "morphologyEducatorSelectedIdentity"
    );
    if (educatorSelectedIdentity) {
      const showSelectedIdentity =
        next.status === "authorized" &&
        next.mode === "educator-selected";
      educatorSelectedIdentity.textContent = showSelectedIdentity
        ? `${/\/program-progress\.html$/.test(window.location.pathname) ? "Looking at" : "Working with"} ${next.studentName || "Student"}`
        : "";
      educatorSelectedIdentity.hidden = !showSelectedIdentity;
    }
    preserveSelectedStudentNavigation(next);
    const gate = document.getElementById("morphologyAccessGate");
    if (!gate) return;

    if (next.status === "authorized" && !wrongRole) {
      gate.hidden = true;
      return;
    }

    gate.hidden = false;
    if (next.status === "loading") {
      gate.innerHTML = '<div><h1>Checking First Volo access…</h1><p>Please wait.</p></div>';
    } else if (next.status === "selected-error") {
      gate.innerHTML = `<div><h1>Student access unavailable</h1><p>This student could not be opened in Morphology. Return to My First Volo and choose a student you can access.</p><a class="morphology-access-return" href="${FIRST_VOLO_URL}">Return to My First Volo</a></div>`;
    } else {
      gate.innerHTML = `<div><h1>Morphology is locked</h1><p>Sign in through My First Volo to continue.</p><div class="morphology-access-actions"><a class="morphology-access-sign-in morphology-access-sign-in-primary" href="${EDUCATOR_SIGN_IN_URL}">Educator sign in</a><a class="morphology-access-sign-in" href="${STUDENT_SIGN_IN_URL}">Student sign in</a></div></div>`;
    }
  }

  installAccessShell();

  function isAnonymous(user) {
    return user?.is_anonymous === true;
  }

  function sameEffectiveContext(left, right) {
    return [
      "status",
      "mode",
      "userId",
      "studentId",
      "classId",
      "educatorId"
    ].every((key) => (left?.[key] ?? null) === (right?.[key] ?? null));
  }

  function publish(next, expectedGeneration) {
    if (expectedGeneration !== generation) {
      return context;
    }

    const pageRestricted =
      next.status === "authorized" &&
      next.mode === "student" &&
      EDUCATOR_ONLY_PAGES.has(currentPageName());

    const nextContext =
      pageRestricted
        ? { ...LOCKED_CONTEXT, userId: next.userId }
        : next;

    if (sameEffectiveContext(context, nextContext)) {
      return context;
    }

    context = Object.freeze(nextContext);
    document.documentElement.dataset.morphologyAccessStatus =
      context.status;
    document.documentElement.dataset.morphologyMode =
      context.mode || "locked";
    applyAccessUI(context);
    listeners.forEach((listener) => listener(context));
    window.dispatchEvent(new CustomEvent(
      "firstvolomorphologyaccesschange",
      { detail: context }
    ));
    return context;
  }

  async function authorizeUser(user, expectedGeneration) {
    const { data, error } = await client.rpc(
      "get_morphology_access_context"
    );
    const rows = Array.isArray(data) ? data : [];
    const accessRow = rows.length === 1 ? rows[0] : null;
    const expectedMode = isAnonymous(user) ? "student" : "educator";

    if (error || accessRow?.access_mode !== expectedMode) {
      return publish({ ...LOCKED_CONTEXT, userId: user.id }, expectedGeneration);
    }

    if (expectedMode === "educator") {
      const target = requestedStudentTarget();

      if (target.present && !target.valid) {
        return publish({
          ...LOCKED_CONTEXT,
          status: "selected-error",
          mode: "educator-selected",
          userId: user.id,
          educatorId: accessRow.educator_id || user.id
        }, expectedGeneration);
      }

      if (target.present) {
        const controller = new AbortController();
        selectedReadAbortController = controller;
        const { data: selectedData, error: selectedError } = await client
          .rpc(
            "get_morphology_student_state_for_educator",
            { p_student_id: target.studentId }
          )
          .abortSignal(controller.signal);

        if (selectedReadAbortController === controller) {
          selectedReadAbortController = null;
        }

        if (expectedGeneration !== generation) {
          return context;
        }

        const selectedRows = Array.isArray(selectedData)
          ? selectedData
          : [];
        const selected = selectedRows.length === 1
          ? selectedRows[0]
          : null;

        if (selectedError || !selected?.student_id) {
          return publish({
            ...LOCKED_CONTEXT,
            status: "selected-error",
            mode: "educator-selected",
            userId: user.id,
            educatorId: accessRow.educator_id || user.id
          }, expectedGeneration);
        }

        return publish({
          status: "authorized",
          mode: "educator-selected",
          userId: user.id,
          studentId: selected.student_id,
          studentName: selected.student_display_name || "Student",
          learnerProfileId: selected.learner_profile_id || null,
          hasState: selected.has_state === true,
          stateData: selected.data,
          clientUpdatedAt: selected.client_updated_at || null,
          updatedAt: selected.updated_at || null,
          classId: null,
          educatorId: selected.educator_user_id || accessRow.educator_id || user.id
        }, expectedGeneration);
      }

      return publish({
        status: "authorized",
        mode: "educator",
        userId: user.id,
        studentId: null,
        classId: null,
        educatorId: accessRow.educator_id || user.id
      }, expectedGeneration);
    }

    if (!accessRow.student_id || !accessRow.class_id ||
        !accessRow.educator_id) {
      return publish({ ...LOCKED_CONTEXT, userId: user.id }, expectedGeneration);
    }

    return publish({
      status: "authorized",
      mode: "student",
      userId: user.id,
      studentId: accessRow.student_id,
      studentName: accessRow.display_name || "Student",
      classId: accessRow.class_id,
      className: accessRow.class_name || "",
      educatorId: accessRow.educator_id
    }, expectedGeneration);
  }

  function resolveForSession(session) {
    const expectedGeneration = ++generation;
    selectedReadAbortController?.abort();
    selectedReadAbortController = null;
    const user = session?.user || null;
    const principalChanged =
      currentUser?.id !== user?.id ||
      isAnonymous(currentUser) !== isAnonymous(user);
    currentUser = user;

    if (principalChanged) {
      clearTimeout(window.FirstVoloMorphologyCloud?.pendingSyncTimer?.());
      publish({
        ...LOCKED_CONTEXT,
        status: "loading",
        userId: user?.id || null
      }, expectedGeneration);
    }

    readyPromise = (async () => {
      if (!user) {
        return publish(LOCKED_CONTEXT, expectedGeneration);
      }
      try {
        return await authorizeUser(user, expectedGeneration);
      } catch (error) {
        console.warn("Morphology access authorization failed.", error);
        return publish({ ...LOCKED_CONTEXT, userId: user.id }, expectedGeneration);
      }
    })();

    return readyPromise;
  }

  window.FirstVoloMorphologyAccess = {
    client,
    PRODUCT_KEY,
    getContext: () => context,
    getUser: () => currentUser,
    whenReady: () => readyPromise,
    resolveForSession,
    subscribe(listener) {
      listeners.add(listener);
      listener(context);
      return () => listeners.delete(listener);
    },
    localProgressKey(accessContext = context) {
      if (accessContext.status !== "authorized") {
        return null;
      }
      if (accessContext.mode === "student") {
        return `firstVoloMorphologyProgressV1:student:${accessContext.studentId}`;
      }
      if (accessContext.mode === "educator-selected") {
        return `${EDUCATOR_SELECTED_PROGRESS_PREFIX}${accessContext.studentId}`;
      }
      return accessContext.userId
        ? `firstVoloMorphologyProgressV1:educator:${accessContext.userId}`
        : null;
    }
  };

  client.auth.onAuthStateChange((event, session) => {
    if (event === "INITIAL_SESSION" && generation > 0) {
      return;
    }
    resolveForSession(session);
  });

  client.auth.getSession().then(({ data, error }) => {
    if (error) {
      if (generation === 0) {
        resolveForSession(null);
      }
      return;
    }

    const session = data?.session || null;
    const sessionUser = session?.user || null;
    const unresolvedInitialSession = generation === 0;
    const restoredPrincipalMissed =
      sessionUser && currentUser?.id !== sessionUser.id;

    if (unresolvedInitialSession || restoredPrincipalMissed) {
      resolveForSession(session);
    }
  });

  document.addEventListener("DOMContentLoaded", () => applyAccessUI(context));
})();
