# Content Type Implementation Checklist

This document tracks the implementation progress for migrating from Author to User-centric architecture with social features.

## Overview

**Goal:** Transform the blog platform from admin-managed authors to user-generated content with social features (like, comment, bookmark, follow).

**Key Changes:**
- Delete Author content type ’ Use User model directly
- Auto-assign "Edit" role on registration
- Add social features: Comment, Like, Bookmark, Follow

---

## Phase 1: Backend Foundation

### User Model Extension

- [ ] **Create extension file** `apps/strapi/src/extensions/users-permissions/strapi-server.ts`
  - [ ] Add `displayName` field (string, required, 2-50 chars)
  - [ ] Add `bio` field (text, optional, max 500 chars)
  - [ ] Add `avatar` field (media, single image)
  - [ ] Add `website` field (string, optional, max 200 chars)

### Edit Role Configuration

- [ ] **Create "Edit" role via Strapi Admin**
  - [ ] Navigate to Settings ’ Users & Permissions ’ Roles
  - [ ] Create new role named "Edit"
  - [ ] Add description: "Authenticated users who can create content"

- [ ] **Override registration controller**
  - [ ] In `strapi-server.ts`, override `auth.register` method
  - [ ] Find "Edit" role by type
  - [ ] Auto-assign Edit role to new users
  - [ ] Set `confirmed: true` for auto-confirmation
  - [ ] Return JWT and user data on successful registration

- [ ] **Test registration flow**
  - [ ] Register new user via API: `POST /api/auth/local/register`
  - [ ] Verify user gets Edit role automatically
  - [ ] Verify JWT token is returned
  - [ ] Verify `displayName` is required field

---

## Phase 2: Content Type Schema Updates

### Article Schema Update

- [ ] **Modify Article schema** `apps/strapi/src/api/article/content-types/article/schema.json`
  - [ ] Change `author` relation from `api::author.author` to `plugin::users-permissions.user`
  - [ ] Add `likesCount` field (integer, default: 0)
  - [ ] Add `commentsCount` field (integer, default: 0)
  - [ ] Add `bookmarksCount` field (integer, default: 0)
  - [ ] Update `inversedBy` to link back to User's articles

- [ ] **Regenerate TypeScript types**
  - [ ] Run: `cd apps/strapi && pnpm strapi ts:generate-types`
  - [ ] Verify types in `apps/strapi/types/generated/contentTypes.d.ts`

### Create Social Content Types

- [ ] **Comment Content Type**
  - [ ] Run: `cd apps/strapi && pnpm strapi generate`
  - [ ] Choose: API, name: comment
  - [ ] Schema fields:
    - [ ] `content` (text, required)
    - [ ] `user` (relation: manyToOne ’ User)
    - [ ] `article` (relation: manyToOne ’ Article)
  - [ ] Set `draftAndPublish: false`

- [ ] **Like Content Type**
  - [ ] Run: `cd apps/strapi && pnpm strapi generate`
  - [ ] Choose: API, name: like
  - [ ] Schema fields:
    - [ ] `user` (relation: manyToOne ’ User, required)
    - [ ] `article` (relation: manyToOne ’ Article, required)
  - [ ] Set `draftAndPublish: false`

- [ ] **Bookmark Content Type**
  - [ ] Run: `cd apps/strapi && pnpm strapi generate`
  - [ ] Choose: API, name: bookmark
  - [ ] Schema fields:
    - [ ] `user` (relation: manyToOne ’ User, required)
    - [ ] `article` (relation: manyToOne ’ Article, required)
  - [ ] Set `draftAndPublish: false`

- [ ] **Follow Content Type**
  - [ ] Run: `cd apps/strapi && pnpm strapi generate`
  - [ ] Choose: API, name: follow
  - [ ] Schema fields:
    - [ ] `follower` (relation: manyToOne ’ User, required)
    - [ ] `following` (relation: manyToOne ’ User, required)
  - [ ] Set `draftAndPublish: false`

- [ ] **Regenerate types after all content types created**
  - [ ] Run: `cd apps/strapi && pnpm strapi ts:generate-types`

---

## Phase 3: Business Logic & Security

### Ownership Policy

- [ ] **Create policy file** `apps/strapi/src/policies/is-owner.ts`
  - [ ] Extract user ID from context: `ctx.state.user.id`
  - [ ] Extract entity ID from params: `ctx.params.id`
  - [ ] Query entity with user field populated
  - [ ] Compare entity's user ID with current user ID
  - [ ] Return boolean for ownership validation

### Custom Controllers

- [ ] **Like Controller** `apps/strapi/src/api/like/controllers/like.ts`
  - [ ] Override `create` method:
    - [ ] Check for existing like (user + article)
    - [ ] Return error if duplicate found
    - [ ] Create like with current user ID
    - [ ] Increment `article.likesCount`
  - [ ] Override `delete` method:
    - [ ] Verify ownership
    - [ ] Delete like
    - [ ] Decrement `article.likesCount`

- [ ] **Bookmark Controller** `apps/strapi/src/api/bookmark/controllers/bookmark.ts`
  - [ ] Override `create` method:
    - [ ] Check for existing bookmark
    - [ ] Return error if duplicate
    - [ ] Create bookmark with current user ID
    - [ ] Increment `article.bookmarksCount`
  - [ ] Override `delete` method:
    - [ ] Verify ownership
    - [ ] Delete bookmark
    - [ ] Decrement `article.bookmarksCount`

- [ ] **Follow Controller** `apps/strapi/src/api/follow/controllers/follow.ts`
  - [ ] Override `create` method:
    - [ ] Prevent self-follow (follower === following)
    - [ ] Check for existing follow
    - [ ] Return error if duplicate
    - [ ] Create follow
  - [ ] Override `delete` method:
    - [ ] Verify ownership
    - [ ] Delete follow

- [ ] **Comment Controller** `apps/strapi/src/api/comment/controllers/comment.ts`
  - [ ] Override `create` method:
    - [ ] Auto-set user to current user
    - [ ] Create comment
  - [ ] Add lifecycle hooks:
    - [ ] `afterCreate`: Increment `article.commentsCount`
    - [ ] `afterDelete`: Decrement `article.commentsCount`

- [ ] **Article Controller** `apps/strapi/src/api/article/controllers/article.ts`
  - [ ] Override `create` method:
    - [ ] Auto-set author to current user
    - [ ] Create article
  - [ ] Override `update` method:
    - [ ] Apply is-owner policy
    - [ ] Update article
  - [ ] Override `delete` method:
    - [ ] Apply is-owner policy
    - [ ] Delete article

### Permissions Configuration

- [ ] **Public Role Permissions** (via Strapi Admin)
  - [ ] Article: find, findOne, count 
  - [ ] Comment: find, findOne, count 
  - [ ] Like: count 
  - [ ] Category: find, findOne, count 
  - [ ] User: find, findOne  (public profiles only)

- [ ] **Edit Role Permissions** (via Strapi Admin)
  - [ ] Article:
    - [ ] find, findOne, count 
    - [ ] create 
    - [ ] update  (with is-owner policy)
    - [ ] delete  (with is-owner policy)
  - [ ] Comment:
    - [ ] find, findOne, count 
    - [ ] create 
    - [ ] update  (with is-owner policy)
    - [ ] delete  (with is-owner policy)
  - [ ] Like:
    - [ ] find, findOne, count 
    - [ ] create 
    - [ ] delete  (own only)
  - [ ] Bookmark:
    - [ ] find  (own only)
    - [ ] create 
    - [ ] delete  (own only)
  - [ ] Follow:
    - [ ] find, findOne, count 
    - [ ] create 
    - [ ] delete  (own only)
  - [ ] User:
    - [ ] find, findOne 
    - [ ] update  (own profile only with policy)

---

## Phase 4: Frontend Integration

### Strapi Client Types

- [ ] **Update types** `packages/strapi-client/types.ts`
  - [ ] Change Article author from `AuthorEntity` to `UserPublicProfile`
  - [ ] Create `UserPublicProfile` type:
    - [ ] Include: id, username, displayName, bio, avatar, website
    - [ ] Exclude: email, password, blocked, confirmed
  - [ ] Add counter fields to Article type:
    - [ ] likesCount, commentsCount, bookmarksCount

- [ ] **Create social types**
  - [ ] Export `Comment` type
  - [ ] Export `Like` type
  - [ ] Export `Bookmark` type
  - [ ] Export `Follow` type

### Strapi Client Hooks

- [ ] **Update Article hooks** `packages/strapi-client/hooks/articles.ts`
  - [ ] Update populate to include `author` (User) instead of author (Author)
  - [ ] Include author.avatar in populate
  - [ ] Test SSR prefetching with new schema

- [ ] **Create social hooks** `packages/strapi-client/hooks/social.ts` (new file)
  - [ ] `useComments(articleId)` - Fetch article comments
  - [ ] `useCreateComment()` - Create comment mutation
  - [ ] `useUpdateComment()` - Update comment mutation
  - [ ] `useDeleteComment()` - Delete comment mutation
  - [ ] `useLikeArticle()` - Like article mutation
  - [ ] `useUnlikeArticle()` - Unlike article mutation
  - [ ] `useBookmarkArticle()` - Bookmark mutation
  - [ ] `useUnbookmarkArticle()` - Unbookmark mutation
  - [ ] `useFollowUser()` - Follow user mutation
  - [ ] `useUnfollowUser()` - Unfollow user mutation
  - [ ] `useUserFollowers(userId)` - Get followers
  - [ ] `useUserFollowing(userId)` - Get following

### UI Components

- [ ] **Update AuthorCard** `packages/design-system/components/molecules/author-card.tsx`
  - [ ] Change props to accept `User` instead of `Author`
  - [ ] Update field references (Author.name ’ User.displayName)
  - [ ] Hide email (use User.username or displayName only)

- [ ] **Create social components** (new files in `packages/design-system/components/`)
  - [ ] `CommentList.tsx` - Display article comments
  - [ ] `CommentForm.tsx` - Create/edit comment
  - [ ] `LikeButton.tsx` - Like/unlike with counter
  - [ ] `BookmarkButton.tsx` - Bookmark/unbookmark
  - [ ] `FollowButton.tsx` - Follow/unfollow user
  - [ ] `UserProfileCard.tsx` - User profile display
  - [ ] `SocialStats.tsx` - Show likes, comments, bookmarks counts

---

## Phase 5: Migration & Cleanup

### Delete Author Content Type

- [ ] **Backup existing data** (if production)
  - [ ] Export Author records via Strapi admin
  - [ ] Export Article records (for relation mapping)

- [ ] **Delete Author via Strapi Admin**
  - [ ] Navigate to Content-Type Builder
  - [ ] Find Author content type
  - [ ] Click Delete
  - [ ] Confirm deletion

- [ ] **Clean up frontend references**
  - [ ] Search codebase for `Author` type references
  - [ ] Replace with `User` or `UserPublicProfile`
  - [ ] Remove unused author-related code

### Seed Data Update

- [ ] **Update seed script** `apps/strapi/scripts/seed.js`
  - [ ] Remove Author seeding logic
  - [ ] Create test User accounts with Edit role
  - [ ] Link Articles to User accounts
  - [ ] Add sample comments, likes, bookmarks
  - [ ] Test seeding: `cd apps/strapi && pnpm seed:example`

---

## Phase 6: Testing & Validation

### Backend API Testing

- [ ] **Registration & Authentication**
  - [ ] Test user registration with displayName
  - [ ] Verify Edit role auto-assignment
  - [ ] Test login and JWT token
  - [ ] Test profile update (own profile only)

- [ ] **Article Operations**
  - [ ] Test article creation (author auto-set)
  - [ ] Test article update (own only)
  - [ ] Test article delete (own only)
  - [ ] Verify counter fields update correctly

- [ ] **Social Features**
  - [ ] Test comment CRUD operations
  - [ ] Test like/unlike (duplicate prevention)
  - [ ] Test bookmark/unbookmark (duplicate prevention)
  - [ ] Test follow/unfollow (duplicate & self-follow prevention)
  - [ ] Verify counter fields increment/decrement

### Frontend Integration Testing

- [ ] **Article Display**
  - [ ] Articles show User data instead of Author
  - [ ] User avatars display correctly
  - [ ] displayName shows on articles

- [ ] **Social UI**
  - [ ] Like button works and shows count
  - [ ] Bookmark button saves articles
  - [ ] Comment form posts comments
  - [ ] Follow button toggles state
  - [ ] Counters update in real-time

### Security Testing

- [ ] **Ownership Validation**
  - [ ] Non-owners cannot update others' articles
  - [ ] Non-owners cannot delete others' comments
  - [ ] Users can only see their own bookmarks

- [ ] **Permissions**
  - [ ] Public users can only read
  - [ ] Edit role users can create content
  - [ ] Email field not exposed in API responses

---

## Phase 7: Documentation & Deployment

### Documentation Updates

- [ ] **Update README.md** with new architecture
- [ ] **Document API endpoints** in docs/api.md
- [ ] **Create migration guide** for production deployments
- [ ] **Update CLAUDE.md** with content type changes

### Production Deployment

- [ ] **Database migration** (if production data exists)
  - [ ] Create migration script for Author ’ User
  - [ ] Test migration in staging environment
  - [ ] Run migration in production

- [ ] **Deploy backend changes**
  - [ ] Push Strapi changes
  - [ ] Run migrations
  - [ ] Restart Strapi server

- [ ] **Deploy frontend changes**
  - [ ] Update strapi-client package
  - [ ] Deploy Next.js app
  - [ ] Verify production functionality

---

## Progress Summary

### Completion Status

- [ ] **Phase 1:** Backend Foundation (0/4 tasks)
- [ ] **Phase 2:** Content Type Schemas (0/6 tasks)
- [ ] **Phase 3:** Business Logic & Security (0/11 tasks)
- [ ] **Phase 4:** Frontend Integration (0/8 tasks)
- [ ] **Phase 5:** Migration & Cleanup (0/4 tasks)
- [ ] **Phase 6:** Testing & Validation (0/11 tasks)
- [ ] **Phase 7:** Documentation & Deployment (0/6 tasks)

**Total Progress:** 0/50 tasks completed

---

## Notes & Considerations

### Breaking Changes

- Author content type will be completely deleted
- Article.author relation changes from Author to User
- Frontend components must adapt to User entity
- API response structure changes for author data

### Performance Optimizations

- Denormalized counter fields (likesCount, commentsCount, bookmarksCount)
- Database indexes needed for Like, Bookmark, Follow queries
- Consider pagination for comments and followers

### Future Enhancements

- Notifications for likes, comments, follows
- Nested comment replies
- Article tags for better categorization
- User follower/following counts
- Reading list with read/unread status
- Article view tracking
- Full-text search across articles and users

### Security Reminders

- Never expose email in public API responses
- Always validate ownership before update/delete
- Prevent duplicate likes/bookmarks/follows
- Prevent self-follows
- Rate limiting on social actions (like, comment, follow)

---

## Quick Reference

### Key Commands

```bash
# Strapi development
cd apps/strapi
pnpm develop

# Generate content type
pnpm strapi generate

# Regenerate types
pnpm strapi ts:generate-types

# Seed database
pnpm seed:example

# Run tests
cd ../..
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint
```

### Important Files

```
apps/strapi/
   src/
      extensions/users-permissions/strapi-server.ts  (User extension)
      policies/is-owner.ts                           (Ownership policy)
      api/
          article/
             content-types/article/schema.json      (Updated schema)
             controllers/article.ts                 (Custom controller)
          comment/                                   (New content type)
          like/                                      (New content type)
          bookmark/                                  (New content type)
          follow/                                    (New content type)
   scripts/seed.js                                    (Updated seed data)

packages/strapi-client/
   types.ts                                           (Updated types)
   hooks/
       articles.ts                                    (Updated hooks)
       social.ts                                      (New social hooks)

packages/design-system/components/
   molecules/author-card.tsx                          (Updated component)
   social/                                            (New social components)
```

---

**Last Updated:** 2025-11-25
**Status:** Planning Phase - Ready for Implementation
