# Content Type Architecture

This document describes the Strapi content type structure for the social blogging platform.

## Overview

The platform uses a **User-centric architecture** where all content and social features relate directly to the built-in Strapi User model, eliminating the need for a separate Author content type.

## Authentication & Roles

### Frontend Users (Users & Permissions Plugin)

**System:** `plugin::users-permissions`
**Database Table:** `up_users`
**Authentication:** Frontend API (`/api/auth/local/register`, `/api/auth/local`)

#### Public and Edit Roles

1. **Public** (built-in)
   - **Access:** Unauthenticated users
   - **Permissions:** Read-only access to published articles and comments
   - **Cannot:** Create, update, or delete any content

2. **Edit** (custom role)
   - **Access:** Authenticated users who register via API
   - **Permissions:**
     - **Articles:** Create, read, update (own), delete (own)
     - **Comments:** Create, read, update (own), delete (own)
     - **Likes:** Create, read, delete (own)
     - **Bookmarks:** Create, read (own), delete (own)
     - **Follows:** Create, read, delete (own)
     - **User Profile:** Read all, update (own)
   - **Auto-assigned:** Yes, on registration via custom controller
   - **Cannot:** Access Strapi admin panel

### Admin Panel Users (Admin System)

**System:** Strapi Admin
**Database Table:** `admin_users`
**Authentication:** Admin panel (`/admin`)

#### Admin Roles

1. **Moderator/Admin**
   - **Access:** Content management via admin panel
   - **Permissions:** Manage all content, users, and settings
   - **Note:** Completely separate from frontend user accounts

## Content Types

### 1. User (Extended Built-in)

**API ID:** `plugin::users-permissions.user`
**Collection:** `up_users`
**Type:** Plugin extension (not custom content type)

#### Schema Extensions

```typescript
{
  // Built-in fields (from users-permissions plugin)
  username: string;        // Required, unique, for login
  email: string;          // Required, unique, private
  password: string;       // Hashed, private
  confirmed: boolean;     // Email confirmation status
  blocked: boolean;       // Admin can block users
  provider: string;       // 'local', 'google', 'facebook', etc.
  role: Relation;         // Link to role (Public/Edit)

  // Extended fields (custom additions)
  displayName: string;    // Required, public name shown on content
  bio: text;             // Optional, user biography (max 500 chars)
  avatar: Media;         // Optional, profile picture
  website: string;       // Optional, personal website URL

  // Computed relations (via inverse relations)
  articles: Article[];       // Articles authored by user
  comments: Comment[];       // Comments created by user
  likes: Like[];            // Articles liked by user
  bookmarks: Bookmark[];    // Articles bookmarked by user
  followers: Follow[];      // Users following this user
  following: Follow[];      // Users this user follows
}
```

#### Extension Location

**File:** `apps/strapi/src/extensions/users-permissions/strapi-server.ts`

#### Security Notes

- **Private fields:** `email`, `password`, `blocked`, `confirmed`
- **Public fields:** `username`, `displayName`, `bio`, `avatar`, `website`
- Email should never be exposed in public API responses
- Password is automatically hashed by Strapi

---

### 2. Article

**API ID:** `api::article.article`
**Collection:** `articles`
**Draft & Publish:** Enabled

#### Schema

```typescript
{
  title: string;              // Required
  description: text;          // Required
  slug: string;              // Required, unique
  cover: Media;              // Required, featured image
  author: Relation;          // manyToOne � User (changed from Author)
  category: Relation;        // manyToOne � Category
  blocks: DynamicZone;       // Article content blocks

  // Counter fields (denormalized for performance)
  likesCount: integer;       // Default: 0
  commentsCount: integer;    // Default: 0
  bookmarksCount: integer;   // Default: 0

  // Auto-generated
  createdAt: datetime;
  updatedAt: datetime;
  publishedAt: datetime;
}
```

#### Relations

- **author:** `manyToOne` � `plugin::users-permissions.user`
- **category:** `manyToOne` � `api::category.category`
- **comments:** `oneToMany` � `api::comment.comment`
- **likes:** `oneToMany` � `api::like.like`
- **bookmarks:** `oneToMany` � `api::bookmark.bookmark`

#### Permissions

**Public Role:**
-  find, findOne, count (published articles only)

**Edit Role:**
-  find, findOne, count
-  create (author auto-set to current user)
-  update (own articles only, verified by is-owner policy)
-  delete (own articles only, verified by is-owner policy)

---

### 3. Comment

**API ID:** `api::comment.comment`
**Collection:** `comments`
**Draft & Publish:** No

#### Schema

```typescript
{
  content: text;             // Required, comment text
  user: Relation;            // manyToOne � User (comment author)
  article: Relation;         // manyToOne � Article

  // Auto-generated
  createdAt: datetime;
  updatedAt: datetime;
}
```

#### Relations

- **user:** `manyToOne` � `plugin::users-permissions.user`
- **article:** `manyToOne` � `api::article.article`

#### Permissions

**Public Role:**
-  find, findOne, count

**Edit Role:**
-  find, findOne, count
-  create (user auto-set to current user)
-  update (own comments only, verified by is-owner policy)
-  delete (own comments only, verified by is-owner policy)

#### Lifecycle Hooks

- **afterCreate:** Increment `article.commentsCount`
- **afterDelete:** Decrement `article.commentsCount`

---

### 4. Like

**API ID:** `api::like.like`
**Collection:** `likes`
**Draft & Publish:** No

#### Schema

```typescript
{
  user: Relation;            // manyToOne � User (required)
  article: Relation;         // manyToOne � Article (required)

  // Auto-generated
  createdAt: datetime;
  updatedAt: datetime;
}
```

#### Relations

- **user:** `manyToOne` � `plugin::users-permissions.user`
- **article:** `manyToOne` � `api::article.article`

#### Unique Constraint

- Composite unique: `(user_id, article_id)` - prevents duplicate likes
- Enforced in custom controller via validation check

#### Permissions

**Public Role:**
-  count (to show like counts)

**Edit Role:**
-  find, findOne, count
-  create (custom controller prevents duplicates)
-  delete (own likes only)

#### Custom Controller Logic

- **create:** Validates no existing like, increments `article.likesCount`
- **delete:** Validates ownership, decrements `article.likesCount`

---

### 5. Bookmark

**API ID:** `api::bookmark.bookmark`
**Collection:** `bookmarks`
**Draft & Publish:** No

#### Schema

```typescript
{
  user: Relation;            // manyToOne � User (required)
  article: Relation;         // manyToOne � Article (required)

  // Auto-generated
  createdAt: datetime;
  updatedAt: datetime;
}
```

#### Relations

- **user:** `manyToOne` � `plugin::users-permissions.user`
- **article:** `manyToOne` � `api::article.article`

#### Unique Constraint

- Composite unique: `(user_id, article_id)` - prevents duplicate bookmarks
- Enforced in custom controller via validation check

#### Permissions

**Edit Role:**
-  find (own bookmarks only)
-  create (custom controller prevents duplicates)
-  delete (own bookmarks only)

**Note:** Bookmarks are private - only the user can see their own bookmarks

#### Custom Controller Logic

- **create:** Validates no existing bookmark, increments `article.bookmarksCount`
- **delete:** Validates ownership, decrements `article.bookmarksCount`

---

### 6. Follow

**API ID:** `api::follow.follow`
**Collection:** `follows`
**Draft & Publish:** No

#### Schema

```typescript
{
  follower: Relation;        // manyToOne � User (who follows)
  following: Relation;       // manyToOne � User (who is followed)

  // Auto-generated
  createdAt: datetime;
  updatedAt: datetime;
}
```

#### Relations

- **follower:** `manyToOne` � `plugin::users-permissions.user`
- **following:** `manyToOne` � `plugin::users-permissions.user`

#### Unique Constraint

- Composite unique: `(follower_id, following_id)` - prevents duplicate follows
- Enforced in custom controller via validation check

#### Permissions

**Edit Role:**
-  find, findOne, count
-  create (custom controller prevents duplicates, self-follows)
-  delete (own follows only)

#### Custom Controller Logic

- **create:**
  - Validates no existing follow
  - Prevents self-follow (`follower !== following`)
- **delete:** Validates ownership

---

### 7. Category

**API ID:** `api::category.category`
**Collection:** `categories`
**Draft & Publish:** Enabled

#### Schema

```typescript
{
  name: string;              // Required, unique
  slug: string;              // Required, unique
  description: text;         // Optional
  articles: Relation;        // oneToMany � Article

  // Auto-generated
  createdAt: datetime;
  updatedAt: datetime;
  publishedAt: datetime;
}
```

#### Permissions

**Public Role:**
-  find, findOne, count

**Edit Role:**
-  find, findOne, count
- L Cannot create/update/delete (admin-managed only)

---

## Deleted Content Types

### L Author (Removed)

**Reason:** Redundant with User model. Previously used for article attribution, now replaced by direct User relation.

**Migration:** Existing Author records should be migrated to User accounts or deleted during the transition.

---

## API Endpoints

### Authentication

```
POST   /api/auth/local/register    Register new user (auto-assigned Edit role)
POST   /api/auth/local             Login (returns JWT token)
GET    /api/auth/forgot-password   Request password reset
POST   /api/auth/reset-password    Reset password with token
```

### Users

```
GET    /api/users                  List users (public profiles)
GET    /api/users/:id              Get user profile (public)
GET    /api/users/me               Get current user (authenticated)
PUT    /api/users/:id              Update own profile (Edit role)
```

### Articles

```
GET    /api/articles               List articles (public)
GET    /api/articles/:id           Get single article (public)
POST   /api/articles               Create article (Edit role)
PUT    /api/articles/:id           Update own article (Edit role)
DELETE /api/articles/:id           Delete own article (Edit role)
```

### Comments

```
GET    /api/comments?filters[article][id][$eq]=:articleId    Get article comments
POST   /api/comments               Create comment (Edit role)
PUT    /api/comments/:id           Update own comment (Edit role)
DELETE /api/comments/:id           Delete own comment (Edit role)
```

### Likes

```
GET    /api/likes?filters[article][id][$eq]=:articleId       Check if liked
POST   /api/likes                  Like article (Edit role)
DELETE /api/likes/:id              Unlike article (Edit role)
```

### Bookmarks

```
GET    /api/bookmarks?filters[user][id][$eq]=:userId         Get user bookmarks (own only)
POST   /api/bookmarks              Bookmark article (Edit role)
DELETE /api/bookmarks/:id          Remove bookmark (Edit role)
```

### Follows

```
GET    /api/follows?filters[follower][id][$eq]=:userId       Who user follows
GET    /api/follows?filters[following][id][$eq]=:userId      User's followers
POST   /api/follows                Follow user (Edit role)
DELETE /api/follows/:id            Unfollow user (Edit role)
```

### Categories

```
GET    /api/categories             List categories (public)
GET    /api/categories/:id         Get single category (public)
```

---

## Security & Policies

### Ownership Policy

**File:** `apps/strapi/src/policies/is-owner.ts`

**Purpose:** Validates that authenticated user owns the resource they're trying to modify

**Applied to:**
- Article: update, delete
- Comment: update, delete
- Like: delete
- Bookmark: delete
- Follow: delete
- User: update (own profile)

### Custom Controllers

**Required for:**
- **Like:** Prevent duplicates, manage counters
- **Bookmark:** Prevent duplicates, manage counters
- **Follow:** Prevent duplicates, prevent self-follows
- **Comment:** Manage counters
- **Article:** Auto-set author, validate ownership

---

## Database Performance

### Indexes

Recommended indexes for performance:

```sql
-- Likes
CREATE UNIQUE INDEX idx_likes_user_article ON likes(user_id, article_id);
CREATE INDEX idx_likes_article ON likes(article_id);

-- Bookmarks
CREATE UNIQUE INDEX idx_bookmarks_user_article ON bookmarks(user_id, article_id);
CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);

-- Follows
CREATE UNIQUE INDEX idx_follows_follower_following ON follows(follower_id, following_id);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-- Comments
CREATE INDEX idx_comments_article ON comments(article_id);
CREATE INDEX idx_comments_user ON comments(user_id);
```

### Counter Fields

**Denormalized counters** on Article for performance:
- `likesCount` - Updated via Like lifecycle hooks
- `commentsCount` - Updated via Comment lifecycle hooks
- `bookmarksCount` - Updated via Bookmark lifecycle hooks

**Trade-off:** Slight complexity in controllers for better read performance

---

## Implementation Checklist

### Phase 1: User Extension
- [ ] Create `apps/strapi/src/extensions/users-permissions/strapi-server.ts`
- [ ] Add profile fields to User schema
- [ ] Override registration controller for auto Edit role assignment
- [ ] Test user registration

### Phase 2: Edit Role
- [ ] Create "Edit" role via Strapi Admin
- [ ] Configure permissions for Edit role
- [ ] Test role assignment on registration

### Phase 3: Article Schema Update
- [ ] Update Article schema (author: Author � User)
- [ ] Add counter fields (likesCount, commentsCount, bookmarksCount)
- [ ] Run `pnpm strapi ts:generate-types`

### Phase 4: Social Content Types
- [ ] Create Comment content type
- [ ] Create Like content type
- [ ] Create Bookmark content type
- [ ] Create Follow content type
- [ ] Run `pnpm strapi ts:generate-types`

### Phase 5: Controllers & Policies
- [ ] Create is-owner policy
- [ ] Create Like custom controller
- [ ] Create Bookmark custom controller
- [ ] Create Follow custom controller
- [ ] Create Comment custom controller
- [ ] Create Article custom controller

### Phase 6: Permissions
- [ ] Configure Public role permissions
- [ ] Configure Edit role permissions
- [ ] Test permission restrictions

### Phase 7: Frontend Integration
- [ ] Update `@repo/strapi-client` types
- [ ] Create social feature hooks
- [ ] Update Article hooks for User population
- [ ] Test API integration

### Phase 8: Cleanup
- [ ] Delete Author content type
- [ ] Migrate/delete existing Author data
- [ ] Update seed scripts for test data

---

## Migration Notes

### From Author to User

**Before:**
```typescript
Article {
  author: Author {
    name: "John Doe"
    email: "john@example.com"
    avatar: Media
  }
}
```

**After:**
```typescript
Article {
  author: User {
    username: "johndoe"
    displayName: "John Doe"
    email: "john@example.com" // private, not exposed in API
    avatar: Media
  }
}
```

### Breaking Changes

1. **Author content type deleted** - All Author records will be removed
2. **Article.author relation changed** - Points to User instead of Author
3. **Frontend components** - Must adapt to User entity instead of Author
4. **API responses** - Author data structure changes

### Recommended Migration Steps

1. **Backup production data** if applicable
2. **Development environment:**
   - Delete Author content type
   - Update Article schema
   - Recreate test content with Users
3. **Production (if needed):**
   - Create migration script to convert Authors to Users
   - Update Article relations
   - Deploy changes

---

## Future Enhancements

Potential additions to consider:

- **Notifications:** Alert users for likes, comments, follows
- **Reply to Comments:** Nested comment structure
- **Article Tags:** Additional categorization beyond categories
- **User Followers Count:** Denormalized counter on User
- **Reading List:** Similar to bookmarks but with read/unread status
- **Article Views:** Track article view counts
- **Search:** Full-text search across articles and users
