(function () {
  "use strict";

  const SUPABASE_URL =
    "https://apkvvspubolyxlqtlkto.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_0O4rNLfhuW18xYRZSPkLpw_xyXR9d3n";
  const PRODUCT_KEY = "first-volo-morphology";
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
    const gate = document.getElementById("morphologyAccessGate");
    if (!gate) return;

    if (next.status === "authorized" && !wrongRole) {
      gate.hidden = true;
      return;
    }

    gate.hidden = false;
    gate.innerHTML = next.status === "loading"
      ? '<div><h1>Checking First Volo access…</h1><p>Please wait.</p></div>'
      : '<div><h1>Morphology is locked</h1><p>This account does not have access to this page.</p><button type="button" id="morphologyAccessSignIn">Educator sign in</button></div>';
    gate.querySelector("#morphologyAccessSignIn")?.addEventListener("click", () => {
      document.getElementById("morphologyCloudButton")?.click();
    });
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
      return accessContext.mode === "student"
        ? `firstVoloMorphologyProgressV1:student:${accessContext.studentId}`
        : "firstVoloMorphologyProgressV1";
    }
  };

  client.auth.onAuthStateChange((_event, session) => {
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
