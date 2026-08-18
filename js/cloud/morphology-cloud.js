(function () {
  "use strict";

  const SUPABASE_URL =
    "https://apkvvspubolyxlqtlkto.supabase.co";

  /*
    Publishable browser key.
    This is not a secret key.
    Row Level Security protects user data.
  */
  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_0O4rNLfhuW18xYRZSPkLpw_xyXR9d3n";

  const PRODUCT_KEY =
    "first-volo-morphology";

  const STORE_KEY =
    "scored-progress";

  const LOCAL_PROGRESS_KEY =
    "firstVoloMorphologyProgressV1";

  if (
    !window.supabase ||
    typeof window.supabase.createClient !== "function"
  ) {
    console.warn(
      "First Volo Morphology Cloud: Supabase client unavailable."
    );
    return;
  }

  const client =
    window.supabase.createClient(
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

  let currentUser = null;
  let syncTimer = null;
  let syncing = false;

  let cloudButton = null;
  let cloudModal = null;
  let cloudMessage = null;
  let cloudEmail = null;
  let signOutButton = null;
  let syncButton = null;

  function readLocalProgress() {
    try {
      const value =
        JSON.parse(
          localStorage.getItem(
            LOCAL_PROGRESS_KEY
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

  function updateUI(message) {
    if (!cloudButton) {
      return;
    }

    if (currentUser) {
      cloudButton.textContent =
        "☁️ Cloud Backup ✓";

      cloudButton.title =
        "Morphology cloud backup is on";
    } else {
      cloudButton.textContent =
        "☁️ Cloud Backup";

      cloudButton.title =
        "Sign in to back up progress online";
    }

    const signInForm =
      cloudModal?.querySelector(
        "#morphologyCloudForm"
      );

    if (signInForm) {
      signInForm.hidden =
        Boolean(currentUser);
    }

    if (signOutButton) {
      signOutButton.hidden =
        !currentUser;
    }

    if (syncButton) {
      syncButton.hidden =
        !currentUser;
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
          ? `Signed in as ${currentUser.email}. Local progress will also be backed up online.`
          : "Signed in. Local progress will also be backed up online.";
    } else {
      cloudMessage.textContent =
        "Progress still saves locally exactly as before. Sign in to also keep a cloud backup.";
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
      !currentUser ||
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

            local_profile_id:
              student.id,

            display_name:
              student.name,

            updated_at:
              now
          },
          {
            onConflict:
              "owner_user_id,local_profile_id"
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

              createdAt:
                student.createdAt ||
                null,

              sessions:
                Array.isArray(
                  student.sessions
                )
                  ? student.sessions
                  : [],

              voloTokens:
                student.voloTokens ||
                {},

              voloGoals:
                Array.isArray(
                  student.voloGoals
                )
                  ? student.voloGoals
                  : []
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

  async function restoreCloudOnlyLearners() {
    if (!currentUser) {
      return {
        restored: 0
      };
    }

    /*
      Step 1 restore rule:

      Only restore a learner when that learner ID
      does NOT already exist on this device.

      Existing local learners are left completely
      untouched until the later merge/conflict step.
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
      !Array.isArray(cloudStates) ||
      !cloudStates.length
    ) {
      return {
        restored: 0
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

    const localIds =
      new Set(
        progress.students
          .map(
            student =>
              student?.id
          )
          .filter(Boolean)
      );

    let restored = 0;

    for (
      const learner
      of (
        Array.isArray(cloudLearners)
          ? cloudLearners
          : []
      )
    ) {
      const studentId =
        learner.local_profile_id;

      /*
        Matching is by the original student ID.

        If this ID already exists locally,
        Step 1 does NOTHING to it.
      */
      if (
        !studentId ||
        localIds.has(studentId)
      ) {
        continue;
      }

      const state =
        stateByLearnerId.get(
          learner.id
        );

      /*
        learner_profiles is shared across
        First Volo products.

        Only restore this learner into Morphology
        when a Morphology scored-progress state
        actually exists.
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

      progress.students.push({
        id:
          studentId,

        name,

        createdAt:
          cloudStudent.createdAt ||
          learner.created_at ||
          new Date().toISOString(),

        sessions:
          Array.isArray(
            cloudStudent.sessions
          )
            ? cloudStudent.sessions
            : [],

        voloTokens,

        voloGoals:
          Array.isArray(
            cloudStudent.voloGoals
          )
            ? cloudStudent.voloGoals
            : []
      });

      localIds.add(
        studentId
      );

      restored += 1;
    }

    if (restored > 0) {
      localStorage.setItem(
        LOCAL_PROGRESS_KEY,
        JSON.stringify(
          progress
        )
      );
    }

    return {
      restored
    };
  }


  async function syncNow() {
    if (
      !currentUser ||
      syncing
    ) {
      return;
    }

    syncing = true;

    updateUI(
      "Backing up Morphology progress…"
    );

    try {
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
    if (!currentUser) {
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
          <h2>☁️ First Volo Cloud Backup</h2>

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
            Email me a sign-in link
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
          Local browser saving remains active.
          When you sign in, Morphology learners
          saved in your First Volo account can
          be restored to this device. Existing
          local learner records are not merged
          or overwritten yet.
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
    restoreCloudOnly:
      restoreCloudOnlyLearners,
    getUser() {
      return currentUser;
    }
  };

  client.auth.onAuthStateChange(
    (event, session) => {
      currentUser =
        session?.user || null;

      updateUI();

      if (
        currentUser &&
        (
          event === "INITIAL_SESSION" ||
          event === "SIGNED_IN"
        )
      ) {
        setTimeout(
          async () => {
            try {
              const result =
                await restoreCloudOnlyLearners();

              if (
                result.restored > 0
              ) {
                updateUI(
                  `Restored ${result.restored} Morphology learner${result.restored === 1 ? "" : "s"} from the cloud. Reloading…`
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
