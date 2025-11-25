# Content Type Implementation Plan Review

## Overview

I have reviewed `docs/plan/content-type.todo.md` against the architectural requirements in `docs/content-type.md` and the current codebase state.

**Verdict:** ✅ **Approved / Ready for Execution**

The plan is comprehensive, logically ordered, and actionable. It correctly identifies all necessary steps to transition from the current `Author`-based architecture to the new `User`-centric social architecture.

## Strengths

1.  **Phased Approach:** The breakdown into 7 phases is excellent. It isolates risks (e.g., doing the User extension first) and allows for incremental testing.
2.  **Migration Strategy:** Phase 5 correctly addresses the critical data migration path (Backup -> Delete -> Cleanup -> Seed).
3.  **Frontend Awareness:** The plan includes specific tasks for updating UI components (`AuthorCard`) and creating new ones (`SocialStats`, `LikeButton`), which are often overlooked in backend-focused plans.
4.  **Testing:** Phase 6 covers both backend API testing and frontend integration testing.

## Minor Suggestions / Refinements

1.  **Phase 1 (User Extension):**
    *   *Suggestion:* Add a step to explicitly check for any existing `User` customizations that might conflict. (Checked: `strapi-server.ts` does not exist yet, so this is safe).

2.  **Phase 3 (Business Logic):**
    *   *Suggestion:* When implementing `is-owner` policy, ensure it handles both `api::article` (where owner is `author`) and social types (where owner is `user` or `follower`) correctly, as the field names might differ slightly (though the plan implies standardizing on `user` for social types).

3.  **Phase 4 (Frontend):**
    *   *Suggestion:* The plan mentions `useComments(articleId)`. Ensure this hook handles pagination or "load more" functionality, as comments can be numerous.

## Execution Recommendation

I recommend starting immediately with **Phase 1: Backend Foundation**.

1.  Create the `users-permissions` extension.
2.  Add the `displayName`, `bio`, `avatar` fields to the User schema.
3.  Verify the "Edit" role creation.

This will pave the way for linking Articles to Users in Phase 2.
