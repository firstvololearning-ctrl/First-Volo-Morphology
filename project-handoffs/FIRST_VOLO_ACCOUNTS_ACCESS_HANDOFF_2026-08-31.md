# First Volo Accounts & Access Handoff

## DONE

The shared Supabase account/access foundation is already created:

* educator_profiles
* students
* classes
* class_memberships
* product_entitlements
* access_codes
* access_code_redemptions

RLS is enabled and hardened.

Educators can manage only their own educator profile, students, classes, and memberships.

Educators can read their own entitlements and redemption history but cannot grant or alter their own entitlements.

access_codes is server-only and must not be exposed directly to browser clients.

Existing learner_profiles, learning_state, and story_builder_stories were not altered by this foundation work.

Public product access remains unchanged because entitlement checks have not yet been connected to the apps.

Migrations already created:

* shared_account_foundation_phase1
* tighten_shared_account_table_grants
* harden_shared_account_foundation

## ARCHITECTURE RULES

1. learner_profiles remains product-scoped.

Do not turn learner_profiles into the universal student table.

Use shared students as the cross-product identity above Morphology/Primo product-specific learner profiles.

2. Story Builder data remains educator-owned.

Later it may receive a nullable student_id link.

3. Entitlements remain independent of payment method.

Recommended product keys:

* first-volo-story-builder
* first-volo-morphology
* primo-volo

Application access should ultimately depend on active entitlement dates/status, not whether access came from a manual code, complimentary access, or payment.

4. Educators may read entitlements but may not grant or extend them themselves.

5. Access-code redemption stays server-side.

6. Student-code validation stays server-side.

Do not treat a short student PIN as a Supabase Auth login.

7. Establish shared student identity first; link product-specific learner data later.

## NEXT STEPS

1. Create/link the intended educator profile.
2. Give that educator a one-year complimentary Story Builder test entitlement.
3. Test cross-educator RLS/security boundaries.
4. Build secure server-side access-code redemption.
5. Build My First Volo:

   * sign in/create account
   * product access status
   * expiration dates
   * redeem access code
   * manage students
   * manage classes/groups
6. Protect full Story Builder first while keeping the free sample public.
7. Later add shared student_id linkage and student class-code/student-code sign-in.

## SECURITY BEFORE LAUNCH

Before public password-based educator signup or paid access:

* enable Supabase Leaked Password Protection
* rerun the Supabase security advisor
* recheck RLS
* recheck browser grants
* verify educators cannot create/extend their own entitlements
* verify access-code redemption is server-side only
* verify student-code validation is server-side only
* test two educator accounts for complete cross-account isolation
* ensure missing/expired/inactive entitlements fail closed
* keep the free Story Builder sample publicly accessible

## CURRENT ACCESS IMPACT

None.

At this checkpoint:

* no product is newly locked
* entitlement checks are not yet connected to the apps
* no access code system is active in the interface
* existing public product URLs continue to behave as before
