# Social Features Implementation Roadmap

**Project:** StrapiPress Social Platform Enhancement
**Version:** 1.0
**Last Updated:** 2025-11-25
**Estimated Timeline:** 26-40 weeks (6-9 months)

---

## Executive Summary

This document outlines the implementation plan for 10 advanced social features that will transform StrapiPress from a basic blog platform into a comprehensive social content platform. Features are organized into 4 phases based on dependencies, complexity, and user value.

**Key Metrics to Track:**
- User Engagement: Daily active users, session duration
- Content Discovery: Search usage, tag follows, trending tag views
- Social Interactions: Notifications sent, comment threads, reading list usage
- Platform Health: System performance, search latency, notification delivery time

---

## Phase 1: Foundation (4-6 weeks)

**Goal:** Establish analytics and basic social infrastructure
**Priority:** HIGH | **Risk:** LOW | **Dependencies:** None

### 1.1 User Followers Count

**Complexity:** SIMPLE | **Timeline:** 1 week | **Value:** HIGH

#### Problem Statement
Currently, users can follow each other, but follower/following counts aren't displayed. This reduces social proof and makes it hard to identify influential users.

#### Solution Overview
Add denormalized counter fields to User model and update via Follow lifecycle hooks.

#### Database Schema Changes

```sql
-- Add to up_users table
ALTER TABLE up_users ADD COLUMN followers_count INTEGER DEFAULT 0;
ALTER TABLE up_users ADD COLUMN following_count INTEGER DEFAULT 0;

-- Backfill existing data
UPDATE up_users u SET
  followers_count = (SELECT COUNT(*) FROM follows WHERE following_id = u.id),
  following_count = (SELECT COUNT(*) FROM follows WHERE follower_id = u.id);
```

#### Implementation Details

**1. User Schema Extension** (`apps/strapi/src/extensions/users-permissions/content-types/user/schema.json`)
```json
{
  "attributes": {
    "followersCount": {
      "type": "integer",
      "default": 0,
      "required": false
    },
    "followingCount": {
      "type": "integer",
      "default": 0,
      "required": false
    }
  }
}
```

**2. Follow Lifecycle Hooks** (`apps/strapi/src/api/follow/content-types/follow/lifecycles.ts`)
```typescript
export default {
  async afterCreate(event) {
    const { result } = event;

    // Increment follower's following_count
    await strapi.db.query('plugin::users-permissions.user').update({
      where: { id: result.follower.id },
      data: { followingCount: { $increment: 1 } }
    });

    // Increment following's followers_count
    await strapi.db.query('plugin::users-permissions.user').update({
      where: { id: result.following.id },
      data: { followersCount: { $increment: 1 } }
    });
  },

  async afterDelete(event) {
    const { result } = event;

    // Decrement counts
    await strapi.db.query('plugin::users-permissions.user').update({
      where: { id: result.follower.id },
      data: { followingCount: { $decrement: 1 } }
    });

    await strapi.db.query('plugin::users-permissions.user').update({
      where: { id: result.following.id },
      data: { followersCount: { $decrement: 1 } }
    });
  }
};
```

#### API Changes
- No new endpoints required
- User GET responses now include `followersCount` and `followingCount`

#### Testing Requirements
- ✅ Counter increments on follow
- ✅ Counter decrements on unfollow
- ✅ Backfill script populates existing data correctly
- ✅ Concurrent follows don't cause race conditions

#### Performance Considerations
- Counters denormalized for O(1) read performance
- Use database-level atomic operations to prevent drift
- Consider queue for high-volume follow scenarios

---

### 1.2 Article Views Tracking

**Complexity:** SIMPLE-MODERATE | **Timeline:** 2 weeks | **Value:** HIGH

#### Problem Statement
No way to track article popularity or measure content performance. Essential for trending algorithms and content recommendations.

#### Solution Overview
Create ArticleView content type to track individual views with deduplication. Add `viewsCount` to Article for performance.

#### Database Schema

```sql
-- New content type
CREATE TABLE article_views (
  id SERIAL PRIMARY KEY,
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id INTEGER NULL REFERENCES up_users(id) ON DELETE SET NULL,
  ip_address VARCHAR(45) NOT NULL,  -- Support IPv6
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Unique constraint: 1 view per article per user/IP per day
CREATE UNIQUE INDEX idx_article_views_unique ON article_views(
  article_id,
  COALESCE(user_id, 0),
  ip_address,
  DATE(created_at)
);

-- Fast lookups
CREATE INDEX idx_article_views_article ON article_views(article_id, created_at DESC);
CREATE INDEX idx_article_views_user ON article_views(user_id, created_at DESC);

-- Denormalized counter on Article
ALTER TABLE articles ADD COLUMN views_count INTEGER DEFAULT 0;
CREATE INDEX idx_articles_views_count ON articles(views_count DESC);
```

#### Content Type Schema

**File:** `apps/strapi/src/api/article-view/content-types/article-view/schema.json`

```json
{
  "kind": "collectionType",
  "collectionName": "article_views",
  "info": {
    "singularName": "article-view",
    "pluralName": "article-views",
    "displayName": "Article View"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "article": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::article.article",
      "inversedBy": "views"
    },
    "user": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "plugin::users-permissions.user"
    },
    "ipAddress": {
      "type": "string",
      "required": true,
      "maxLength": 45
    },
    "userAgent": {
      "type": "text"
    },
    "referrer": {
      "type": "text"
    }
  }
}
```

#### Custom Controller

**File:** `apps/strapi/src/api/article-view/controllers/article-view.ts`

```typescript
export default factories.createCoreController('api::article-view.article-view', ({ strapi }) => ({
  async create(ctx) {
    const { articleId } = ctx.request.body.data;
    const userId = ctx.state.user?.id || null;
    const ipAddress = ctx.request.ip;
    const userAgent = ctx.request.headers['user-agent'];
    const referrer = ctx.request.headers['referer'] || ctx.request.headers['referrer'];

    // Check if view already exists today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingView = await strapi.db.query('api::article-view.article-view').findOne({
      where: {
        article: { id: articleId },
        $or: userId ? [
          { user: { id: userId } },
          { ipAddress, user: null }
        ] : [
          { ipAddress, user: null }
        ],
        createdAt: { $gte: today }
      }
    });

    if (existingView) {
      return ctx.send({ data: existingView, message: 'View already recorded today' });
    }

    // Create new view
    const view = await strapi.db.query('api::article-view.article-view').create({
      data: {
        article: articleId,
        user: userId,
        ipAddress,
        userAgent,
        referrer,
        publishedAt: new Date()
      }
    });

    // Increment article views_count atomically
    await strapi.db.query('api::article.article').update({
      where: { id: articleId },
      data: { viewsCount: { $increment: 1 } }
    });

    return ctx.send({ data: view });
  },

  // Get view statistics for an article
  async stats(ctx) {
    const { id } = ctx.params;

    const stats = await strapi.db.connection.raw(`
      SELECT
        COUNT(*) as total_views,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT ip_address) as unique_ips,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as views_last_7_days,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as views_last_30_days
      FROM article_views
      WHERE article_id = ?
    `, [id]);

    return ctx.send({ data: stats.rows[0] });
  }
}));
```

#### API Endpoints

```
POST   /api/article-views              Track article view (public)
GET    /api/article-views/stats/:id    Get view statistics (public)
```

#### Frontend Integration

**Track View on Article Page:**
```typescript
// apps/web/app/[locale]/blog/[slug]/page.tsx
'use client';

import { useEffect } from 'react';
import { useTrackArticleView } from '@repo/strapi-client/hooks';

export function ArticleViewTracker({ articleId }: { articleId: number }) {
  const { mutate: trackView } = useTrackArticleView();

  useEffect(() => {
    // Track view after 3 seconds (engagement threshold)
    const timer = setTimeout(() => {
      trackView({ articleId });
    }, 3000);

    return () => clearTimeout(timer);
  }, [articleId, trackView]);

  return null;
}
```

#### Testing Requirements
- ✅ Deduplication works (same user/IP can't inflate views)
- ✅ Anonymous and authenticated views both tracked
- ✅ Counter updates atomically
- ✅ Performance: Can handle 1000+ concurrent views
- ✅ Privacy: IP addresses hashed or anonymized (GDPR compliance)

#### Performance Optimizations
- Queue view tracking (async processing)
- Batch counter updates (every 5 minutes instead of real-time)
- Partition table by date for faster queries
- Implement view aggregation table for analytics

---

### 1.3 Tag Following

**Complexity:** SIMPLE | **Timeline:** 1-2 weeks | **Value:** MEDIUM-HIGH

#### Problem Statement
Users can follow other users but not topics/tags they're interested in. This limits content personalization and discovery.

#### Solution Overview
Reuse Follow pattern but for Tag relations. Add personalized feed based on followed tags.

#### Database Schema

```sql
CREATE TABLE tag_follows (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES up_users(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_tag_follows_unique ON tag_follows(user_id, tag_id);
CREATE INDEX idx_tag_follows_user ON tag_follows(user_id);
CREATE INDEX idx_tag_follows_tag ON tag_follows(tag_id);

-- Add counter to tags
ALTER TABLE tags ADD COLUMN followers_count INTEGER DEFAULT 0;
CREATE INDEX idx_tags_followers_count ON tags(followers_count DESC);
```

#### Content Type Schema

Similar to Follow but with tag relation:

```json
{
  "kind": "collectionType",
  "collectionName": "tag_follows",
  "attributes": {
    "user": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "plugin::users-permissions.user"
    },
    "tag": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::tag.tag"
    }
  }
}
```

#### Custom Controller

**File:** `apps/strapi/src/api/tag-follow/controllers/tag-follow.ts`

```typescript
export default factories.createCoreController('api::tag-follow.tag-follow', ({ strapi }) => ({
  async create(ctx) {
    const userId = ctx.state.user.id;
    const { tagId } = ctx.request.body.data;

    // Check if already following
    const existing = await strapi.db.query('api::tag-follow.tag-follow').findOne({
      where: { user: { id: userId }, tag: { id: tagId } }
    });

    if (existing) {
      return ctx.badRequest('Already following this tag');
    }

    // Create tag follow
    const tagFollow = await strapi.entityService.create('api::tag-follow.tag-follow', {
      data: {
        user: userId,
        tag: tagId,
        publishedAt: new Date()
      }
    });

    // Increment tag followers_count
    await strapi.db.query('api::tag.tag').update({
      where: { id: tagId },
      data: { followersCount: { $increment: 1 } }
    });

    return ctx.send({ data: tagFollow });
  },

  // Get personalized feed based on followed tags
  async feed(ctx) {
    const userId = ctx.state.user.id;
    const { page = 1, pageSize = 20 } = ctx.query;

    // Get user's followed tags
    const followedTags = await strapi.db.query('api::tag-follow.tag-follow').findMany({
      where: { user: { id: userId } },
      select: ['tag.id']
    });

    const tagIds = followedTags.map(tf => tf.tag.id);

    if (tagIds.length === 0) {
      return ctx.send({ data: [], meta: { pagination: { page, pageSize, total: 0 } } });
    }

    // Get articles with any of the followed tags
    const articles = await strapi.entityService.findMany('api::article.article', {
      filters: {
        tags: { id: { $in: tagIds } },
        publishedAt: { $notNull: true }
      },
      sort: 'publishedAt:desc',
      populate: ['author', 'category', 'tags', 'cover'],
      start: (page - 1) * pageSize,
      limit: pageSize
    });

    return ctx.send({ data: articles });
  }
}));
```

#### API Endpoints

```
POST   /api/tag-follows              Follow tag (Edit role)
DELETE /api/tag-follows/:id          Unfollow tag (Edit role)
GET    /api/tag-follows/feed         Get personalized feed (Edit role)
GET    /api/tag-follows?filters[user][id][$eq]=:userId    User's followed tags
GET    /api/tag-follows?filters[tag][id][$eq]=:tagId      Tag's followers
```

#### Frontend Components

**Tag Follow Button:**
```typescript
// packages/design-system/components/tag-follow-button.tsx
'use client';

import { useTagFollow, useTagUnfollow, useIsFollowingTag } from '@repo/strapi-client/hooks';

export function TagFollowButton({ tagId, tagName }: { tagId: number; tagName: string }) {
  const { data: isFollowing, isLoading } = useIsFollowingTag(tagId);
  const { mutate: follow } = useTagFollow();
  const { mutate: unfollow } = useTagUnfollow();

  const handleClick = () => {
    if (isFollowing) {
      unfollow(isFollowing.id);
    } else {
      follow({ tagId });
    }
  };

  return (
    <button onClick={handleClick} disabled={isLoading}>
      {isFollowing ? 'Following' : 'Follow'} #{tagName}
    </button>
  );
}
```

**Personalized Feed:**
```typescript
// apps/web/app/[locale]/feed/page.tsx
import { useTagFollowFeed } from '@repo/strapi-client/hooks';

export function PersonalizedFeed() {
  const { data: articles, isLoading } = useTagFollowFeed({ page: 1, pageSize: 20 });

  if (isLoading) return <ArticlesSkeleton />;
  if (!articles || articles.length === 0) {
    return <EmptyState message="Follow some tags to see personalized content" />;
  }

  return <ArticleList articles={articles} />;
}
```

#### Testing Requirements
- ✅ Can follow/unfollow tags
- ✅ Duplicate follows prevented
- ✅ Follower count updates correctly
- ✅ Personalized feed shows articles from followed tags
- ✅ Feed sorted by recency
- ✅ Performance: Feed query <200ms with 100+ followed tags

---

## Phase 2: Engagement (6-12 weeks)

**Goal:** Build notification infrastructure and deepen user engagement
**Priority:** HIGH | **Risk:** MEDIUM | **Dependencies:** Phase 1 complete

### 2.1 Notifications System

**Complexity:** COMPLEX | **Timeline:** 4-6 weeks | **Value:** CRITICAL

#### Problem Statement
Users don't know when others interact with their content (likes, comments, follows). This reduces engagement and makes the platform feel less social.

#### Solution Overview
Build event-driven notification system with preferences, real-time delivery, and graceful degradation.

#### Architecture Decision

**Option A: Strapi Built-in Notifications**
- Pros: Simple, integrated
- Cons: Limited features, no real-time, basic UI

**Option B: Custom System + WebSockets (Recommended)**
- Pros: Full control, real-time, extensible
- Cons: More complex, requires infrastructure

**Option C: Third-party (OneSignal, Pusher)**
- Pros: Managed, scalable, cross-platform
- Cons: Costly, vendor lock-in

**Selected: Option B (Custom + Socket.io)**

#### Database Schema

```sql
CREATE TYPE notification_type AS ENUM (
  'article_like',
  'article_comment',
  'comment_reply',
  'user_follow',
  'tag_follow_article',  -- New article in followed tag
  'article_bookmark'     -- Optional: someone bookmarked your article
);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  recipient_id INTEGER NOT NULL REFERENCES up_users(id) ON DELETE CASCADE,
  actor_id INTEGER NULL REFERENCES up_users(id) ON DELETE SET NULL,  -- Who triggered it
  type notification_type NOT NULL,
  entity_type VARCHAR(50),  -- article, comment, user
  entity_id INTEGER,
  message TEXT,  -- Precomputed message for performance
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_recipient_unread ON notifications(recipient_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_recipient_read ON notifications(recipient_id, created_at DESC) WHERE is_read = TRUE;
CREATE INDEX idx_notifications_actor ON notifications(actor_id);

-- User preferences
CREATE TABLE notification_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES up_users(id) ON DELETE CASCADE,
  article_likes BOOLEAN DEFAULT TRUE,
  article_comments BOOLEAN DEFAULT TRUE,
  comment_replies BOOLEAN DEFAULT TRUE,
  user_follows BOOLEAN DEFAULT TRUE,
  tag_follow_articles BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT FALSE,
  push_notifications BOOLEAN DEFAULT FALSE
);

-- Add unread counter to users
ALTER TABLE up_users ADD COLUMN unread_notifications_count INTEGER DEFAULT 0;
```

#### Implementation Strategy

**1. Notification Service** (`apps/strapi/src/services/notification.ts`)

```typescript
export default ({ strapi }) => ({
  async create({ recipientId, actorId, type, entityType, entityId }) {
    // Check user preferences
    const prefs = await strapi.db.query('api::notification-preference.notification-preference').findOne({
      where: { user: { id: recipientId } }
    });

    if (prefs && !prefs[type.replace('_', '')]) {
      return null; // User disabled this notification type
    }

    // Don't notify users about their own actions
    if (recipientId === actorId) {
      return null;
    }

    // Generate message
    const message = await this.generateMessage(type, actorId, entityType, entityId);

    // Create notification
    const notification = await strapi.entityService.create('api::notification.notification', {
      data: {
        recipient: recipientId,
        actor: actorId,
        type,
        entityType,
        entityId,
        message,
        isRead: false,
        publishedAt: new Date()
      },
      populate: ['actor']
    });

    // Increment unread counter
    await strapi.db.query('plugin::users-permissions.user').update({
      where: { id: recipientId },
      data: { unreadNotificationsCount: { $increment: 1 } }
    });

    // Send real-time notification via WebSocket
    strapi.io.to(`user:${recipientId}`).emit('notification', notification);

    return notification;
  },

  async generateMessage(type, actorId, entityType, entityId) {
    const actor = await strapi.entityService.findOne('plugin::users-permissions.user', actorId, {
      fields: ['username', 'displayName']
    });

    const actorName = actor.displayName || actor.username;

    switch (type) {
      case 'article_like':
        return `${actorName} liked your article`;
      case 'article_comment':
        return `${actorName} commented on your article`;
      case 'comment_reply':
        return `${actorName} replied to your comment`;
      case 'user_follow':
        return `${actorName} started following you`;
      case 'tag_follow_article':
        return `New article in a tag you follow`;
      default:
        return 'You have a new notification';
    }
  },

  async markAsRead(notificationId, userId) {
    const notification = await strapi.db.query('api::notification.notification').findOne({
      where: { id: notificationId, recipient: { id: userId } }
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (!notification.isRead) {
      await strapi.db.query('api::notification.notification').update({
        where: { id: notificationId },
        data: { isRead: true }
      });

      await strapi.db.query('plugin::users-permissions.user').update({
        where: { id: userId },
        data: { unreadNotificationsCount: { $decrement: 1 } }
      });
    }
  },

  async markAllAsRead(userId) {
    await strapi.db.query('api::notification.notification').updateMany({
      where: { recipient: { id: userId }, isRead: false },
      data: { isRead: true }
    });

    await strapi.db.query('plugin::users-permissions.user').update({
      where: { id: userId },
      data: { unreadNotificationsCount: 0 }
    });
  }
});
```

**2. Lifecycle Hooks Integration**

Update existing lifecycle hooks to trigger notifications:

```typescript
// apps/strapi/src/api/like/content-types/like/lifecycles.ts
export default {
  async afterCreate(event) {
    const { result } = event;

    // ... existing counter logic ...

    // Get article author
    const article = await strapi.entityService.findOne('api::article.article', result.article.id, {
      fields: ['author']
    });

    // Send notification to article author
    await strapi.service('plugin::notifications.notification').create({
      recipientId: article.author.id,
      actorId: result.user.id,
      type: 'article_like',
      entityType: 'article',
      entityId: result.article.id
    });
  }
};
```

**3. WebSocket Integration** (`apps/strapi/src/index.ts`)

```typescript
export default {
  register({ strapi }) {
    const io = require('socket.io')(strapi.server.httpServer, {
      cors: { origin: process.env.FRONTEND_URL, credentials: true }
    });

    // Authenticate socket connections
    io.use(async (socket, next) => {
      const token = socket.handshake.auth.token;

      try {
        const decoded = await strapi.plugins['users-permissions'].services.jwt.verify(token);
        socket.userId = decoded.id;
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    });

    io.on('connection', (socket) => {
      // Join user's personal room
      socket.join(`user:${socket.userId}`);

      socket.on('disconnect', () => {
        socket.leave(`user:${socket.userId}`);
      });
    });

    strapi.io = io;
  }
};
```

#### API Endpoints

```
GET    /api/notifications                          Get user notifications (paginated)
GET    /api/notifications/unread                   Get unread count
PUT    /api/notifications/:id/read                 Mark as read
PUT    /api/notifications/read-all                 Mark all as read
DELETE /api/notifications/:id                      Delete notification
GET    /api/notification-preferences               Get user preferences
PUT    /api/notification-preferences               Update preferences
```

#### Frontend Integration

**Real-time Connection:**
```typescript
// packages/strapi-client/websocket/notification-client.ts
import { io } from 'socket.io-client';

export class NotificationClient {
  private socket;

  connect(token: string) {
    this.socket = io(process.env.NEXT_PUBLIC_STRAPI_URL, {
      auth: { token }
    });

    this.socket.on('notification', (notification) => {
      // Update React Query cache
      queryClient.setQueryData(['notifications', 'unread'], (old) => old + 1);

      // Show toast notification
      toast.notification(notification.message);
    });
  }

  disconnect() {
    this.socket?.disconnect();
  }
}
```

**Notification Bell Component:**
```typescript
// packages/design-system/components/notification-bell.tsx
'use client';

import { useNotifications, useUnreadCount } from '@repo/strapi-client/hooks';

export function NotificationBell() {
  const { data: unreadCount } = useUnreadCount();
  const { data: notifications } = useNotifications({ limit: 10 });
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </PopoverTrigger>
      <PopoverContent>
        <NotificationList notifications={notifications} />
      </PopoverContent>
    </Popover>
  );
}
```

#### Testing Requirements
- ✅ Notifications created for all trigger events
- ✅ Real-time delivery via WebSocket
- ✅ User preferences honored
- ✅ No self-notifications
- ✅ Unread counter accurate
- ✅ Mark as read decrements counter
- ✅ Performance: <100ms notification creation
- ✅ Load test: 1000 concurrent notifications
- ✅ Graceful degradation if WebSocket fails

#### Performance Optimizations
- Queue notification creation (async processing)
- Batch notifications (group similar events)
- Pagination with cursor-based (not offset)
- Cache unread count in Redis
- Archive old notifications (>90 days)

---

### 2.2 Reply to Comments (Nested Comments)

**Complexity:** MODERATE | **Timeline:** 2-3 weeks | **Value:** HIGH

#### Problem Statement
Current comment system is flat - users can't reply to specific comments, making it hard to have threaded discussions.

#### Solution Overview
Add self-referential parent relation to Comment content type. Limit nesting depth to prevent performance issues.

#### Database Schema Changes

```sql
ALTER TABLE comments ADD COLUMN parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE NULL;
ALTER TABLE comments ADD COLUMN reply_count INTEGER DEFAULT 0;
ALTER TABLE comments ADD COLUMN depth INTEGER DEFAULT 0;

CREATE INDEX idx_comments_parent ON comments(parent_id, created_at);
CREATE INDEX idx_comments_depth ON comments(depth);

-- Constraint: Max depth of 3 (0=top-level, 1=reply, 2=nested reply, 3=max)
ALTER TABLE comments ADD CONSTRAINT check_depth CHECK (depth <= 3);
```

#### Updated Comment Schema

```json
{
  "attributes": {
    "content": { "type": "text", "required": true },
    "user": { "type": "relation", "relation": "manyToOne", "target": "plugin::users-permissions.user" },
    "article": { "type": "relation", "relation": "manyToOne", "target": "api::article.article" },
    "parent": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::comment.comment",
      "inversedBy": "replies"
    },
    "replies": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::comment.comment",
      "mappedBy": "parent"
    },
    "replyCount": { "type": "integer", "default": 0 },
    "depth": { "type": "integer", "default": 0 }
  }
}
```

#### Custom Controller Updates

```typescript
export default factories.createCoreController('api::comment.comment', ({ strapi }) => ({
  async create(ctx) {
    const userId = ctx.state.user.id;
    const { content, articleId, parentId } = ctx.request.body.data;

    let depth = 0;
    let article = articleId;

    // If replying to a comment
    if (parentId) {
      const parentComment = await strapi.entityService.findOne('api::comment.comment', parentId, {
        fields: ['depth', 'article']
      });

      if (!parentComment) {
        return ctx.badRequest('Parent comment not found');
      }

      depth = parentComment.depth + 1;
      article = parentComment.article.id;

      // Enforce max depth
      if (depth > 3) {
        return ctx.badRequest('Maximum nesting depth reached');
      }
    }

    // Create comment
    const comment = await strapi.entityService.create('api::comment.comment', {
      data: {
        content,
        user: userId,
        article,
        parent: parentId || null,
        depth,
        publishedAt: new Date()
      },
      populate: ['user', 'parent']
    });

    // Update parent reply count
    if (parentId) {
      await strapi.db.query('api::comment.comment').update({
        where: { id: parentId },
        data: { replyCount: { $increment: 1 } }
      });

      // Send notification to parent comment author
      const parentComment = await strapi.entityService.findOne('api::comment.comment', parentId, {
        fields: ['user']
      });

      await strapi.service('plugin::notifications.notification').create({
        recipientId: parentComment.user.id,
        actorId: userId,
        type: 'comment_reply',
        entityType: 'comment',
        entityId: parentId
      });
    }

    // Update article comment count (only for top-level comments)
    if (depth === 0) {
      await strapi.db.query('api::article.article').update({
        where: { id: article },
        data: { commentsCount: { $increment: 1 } }
      });
    }

    return ctx.send({ data: comment });
  },

  // Get comment thread (parent + all replies)
  async thread(ctx) {
    const { id } = ctx.params;

    // Get comment tree recursively
    const thread = await strapi.db.connection.raw(`
      WITH RECURSIVE comment_tree AS (
        SELECT *, 0 as level FROM comments WHERE id = ?
        UNION ALL
        SELECT c.*, ct.level + 1
        FROM comments c
        INNER JOIN comment_tree ct ON c.parent_id = ct.id
      )
      SELECT * FROM comment_tree ORDER BY level, created_at
    `, [id]);

    return ctx.send({ data: thread.rows });
  }
}));
```

#### API Updates

```
POST   /api/comments                Create comment (with optional parentId)
GET    /api/comments/thread/:id     Get full comment thread
GET    /api/comments?filters[parent][id][$eq]=:parentId    Get direct replies
```

#### Frontend Components

**Nested Comment Component:**
```typescript
// packages/design-system/components/comment-thread.tsx
'use client';

function Comment({ comment, depth = 0 }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const canReply = depth < 3;  // Max depth limit

  return (
    <div className={`comment depth-${depth}`}>
      <CommentHeader user={comment.user} createdAt={comment.createdAt} />
      <CommentContent content={comment.content} />
      <CommentActions
        onReply={canReply ? () => setShowReplyForm(true) : undefined}
        replyCount={comment.replyCount}
      />

      {showReplyForm && (
        <ReplyForm
          parentId={comment.id}
          onCancel={() => setShowReplyForm(false)}
          depth={depth}
        />
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="replies">
          {comment.replies.map(reply => (
            <Comment key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentThread({ articleId }) {
  const { data: comments } = useComments({ articleId, parentId: null });

  return (
    <div className="comment-thread">
      {comments?.map(comment => (
        <Comment key={comment.id} comment={comment} depth={0} />
      ))}
    </div>
  );
}
```

#### Testing Requirements
- ✅ Can reply to comments up to depth 3
- ✅ Cannot reply beyond max depth
- ✅ Reply count increments correctly
- ✅ Comment thread loads entire tree
- ✅ Notifications sent for replies
- ✅ Article comment count only counts top-level
- ✅ Deleting parent doesn't orphan replies (CASCADE)
- ✅ Performance: Thread with 100+ comments loads <500ms

---

### 2.3 Reading List (Enhanced Bookmarks)

**Complexity:** SIMPLE-MODERATE | **Timeline:** 1-2 weeks | **Value:** MEDIUM

#### Problem Statement
Current bookmark system is binary (saved or not). Users want to track reading progress and organize saved articles by reading status.

#### Solution Overview
Extend Bookmark content type with reading status and progress tracking.

#### Database Schema Changes

```sql
ALTER TABLE bookmarks ADD COLUMN reading_status VARCHAR(20) DEFAULT 'unread';
ALTER TABLE bookmarks ADD COLUMN reading_progress INTEGER DEFAULT 0;  -- percentage 0-100
ALTER TABLE bookmarks ADD COLUMN started_reading_at TIMESTAMP NULL;
ALTER TABLE bookmarks ADD COLUMN completed_reading_at TIMESTAMP NULL;
ALTER TABLE bookmarks ADD COLUMN notes TEXT NULL;  -- Personal notes on article

CREATE INDEX idx_bookmarks_status ON bookmarks(user_id, reading_status);
CREATE INDEX idx_bookmarks_completed ON bookmarks(user_id, completed_reading_at DESC);

-- Add enum constraint
ALTER TABLE bookmarks ADD CONSTRAINT check_reading_status
  CHECK (reading_status IN ('unread', 'reading', 'completed'));
```

#### Updated Bookmark Schema

```json
{
  "attributes": {
    "user": { "type": "relation", "relation": "manyToOne", "target": "plugin::users-permissions.user" },
    "article": { "type": "relation", "relation": "manyToOne", "target": "api::article.article" },
    "readingStatus": {
      "type": "enumeration",
      "enum": ["unread", "reading", "completed"],
      "default": "unread"
    },
    "readingProgress": {
      "type": "integer",
      "min": 0,
      "max": 100,
      "default": 0
    },
    "startedReadingAt": { "type": "datetime" },
    "completedReadingAt": { "type": "datetime" },
    "notes": { "type": "text" }
  }
}
```

#### Custom Controller Updates

```typescript
export default factories.createCoreController('api::bookmark.bookmark', ({ strapi }) => ({
  async updateProgress(ctx) {
    const userId = ctx.state.user.id;
    const { id } = ctx.params;
    const { progress } = ctx.request.body;

    const bookmark = await strapi.db.query('api::bookmark.bookmark').findOne({
      where: { id, user: { id: userId } }
    });

    if (!bookmark) {
      return ctx.notFound('Bookmark not found');
    }

    const updates: any = {
      readingProgress: progress
    };

    // Auto-update status based on progress
    if (progress > 0 && bookmark.readingStatus === 'unread') {
      updates.readingStatus = 'reading';
      updates.startedReadingAt = new Date();
    }

    if (progress === 100 && bookmark.readingStatus !== 'completed') {
      updates.readingStatus = 'completed';
      updates.completedReadingAt = new Date();
    }

    const updated = await strapi.db.query('api::bookmark.bookmark').update({
      where: { id },
      data: updates
    });

    return ctx.send({ data: updated });
  },

  async statistics(ctx) {
    const userId = ctx.state.user.id;

    const stats = await strapi.db.connection.raw(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE reading_status = 'unread') as unread,
        COUNT(*) FILTER (WHERE reading_status = 'reading') as in_progress,
        COUNT(*) FILTER (WHERE reading_status = 'completed') as completed,
        AVG(reading_progress) as avg_progress
      FROM bookmarks
      WHERE user_id = ?
    `, [userId]);

    return ctx.send({ data: stats.rows[0] });
  }
}));
```

#### API Updates

```
PUT    /api/bookmarks/:id/progress  Update reading progress
GET    /api/bookmarks/stats         Get reading statistics
GET    /api/bookmarks?filters[readingStatus][$eq]=reading    Filter by status
```

#### Frontend Integration

**Reading Progress Tracker:**
```typescript
// apps/web/components/reading-progress-tracker.tsx
'use client';

import { useEffect } from 'react';
import { useUpdateReadingProgress } from '@repo/strapi-client/hooks';

export function ReadingProgressTracker({ bookmarkId }: { bookmarkId: number }) {
  const { mutate: updateProgress } = useUpdateReadingProgress();

  useEffect(() => {
    const calculateProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;

      const progress = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);
      return Math.min(progress, 100);
    };

    const handleScroll = () => {
      const progress = calculateProgress();
      updateProgress({ id: bookmarkId, progress });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [bookmarkId, updateProgress]);

  return null;
}
```

**Reading List Dashboard:**
```typescript
// apps/web/app/[locale]/reading-list/page.tsx
export function ReadingListPage() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'reading' | 'completed'>('all');
  const { data: bookmarks } = useBookmarks({ status: filter !== 'all' ? filter : undefined });
  const { data: stats } = useReadingStats();

  return (
    <div>
      <ReadingStats stats={stats} />
      <FilterTabs value={filter} onChange={setFilter} />
      <BookmarkList bookmarks={bookmarks} />
    </div>
  );
}
```

#### Testing Requirements
- ✅ Progress updates correctly (0-100)
- ✅ Status auto-transitions (unread → reading → completed)
- ✅ Timestamps set appropriately
- ✅ Statistics accurate
- ✅ Filter by reading status works
- ✅ Notes saved and retrieved
- ✅ Performance: Progress updates batched (max 1 per 5 seconds)

---

## Phase 3: Content Discovery (12-16 weeks)

**Goal:** Enable powerful content discovery through search and analytics
**Priority:** MEDIUM-HIGH | **Risk:** HIGH | **Dependencies:** Phase 1 + 2

### 3.1 Full-Text Search

**Complexity:** VERY COMPLEX | **Timeline:** 8-10 weeks | **Value:** CRITICAL

#### Problem Statement
Users can only browse articles by category or tags. No way to search for specific content, making it hard to find relevant articles.

#### Solution Architecture

**Selected: Meilisearch** (Fast, open-source, typo-tolerant search)

**Alternatives Considered:**
- PostgreSQL Full-Text: Limited features, poor UX
- Elasticsearch: Overkill, expensive, complex
- Algolia: Expensive at scale, vendor lock-in

#### Infrastructure Setup

**1. Meilisearch Installation**

```yaml
# docker-compose.yml
services:
  meilisearch:
    image: getmeili/meilisearch:v1.5
    environment:
      MEILI_MASTER_KEY: ${MEILI_MASTER_KEY}
      MEILI_ENV: production
    ports:
      - "7700:7700"
    volumes:
      - ./meilisearch_data:/meili_data
```

**2. Index Configuration**

```typescript
// apps/strapi/src/services/search.ts
import { MeiliSearch } from 'meilisearch';

const client = new MeiliSearch({
  host: process.env.MEILI_HOST,
  apiKey: process.env.MEILI_MASTER_KEY
});

export async function setupIndexes() {
  // Articles index
  const articlesIndex = client.index('articles');
  await articlesIndex.updateSettings({
    searchableAttributes: [
      'title',
      'description',
      'content',
      'author.displayName',
      'author.username',
      'category.name',
      'tags.name'
    ],
    filterableAttributes: [
      'category.id',
      'tags.id',
      'author.id',
      'publishedAt'
    ],
    sortableAttributes: [
      'publishedAt',
      'viewsCount',
      'likesCount'
    ],
    rankingRules: [
      'words',
      'typo',
      'proximity',
      'attribute',
      'sort',
      'exactness'
    ]
  });

  // Users index
  const usersIndex = client.index('users');
  await usersIndex.updateSettings({
    searchableAttributes: ['username', 'displayName', 'bio'],
    sortableAttributes: ['followersCount']
  });

  // Tags index
  const tagsIndex = client.index('tags');
  await tagsIndex.updateSettings({
    searchableAttributes: ['name', 'description'],
    sortableAttributes: ['usageCount', 'followersCount']
  });
}
```

**3. Indexing Service**

```typescript
// apps/strapi/src/services/search-indexer.ts
export default ({ strapi }) => ({
  async indexArticle(articleId) {
    const article = await strapi.entityService.findOne('api::article.article', articleId, {
      populate: {
        author: { fields: ['id', 'username', 'displayName'] },
        category: { fields: ['id', 'name'] },
        tags: { fields: ['id', 'name'] },
        cover: { fields: ['url'] }
      }
    });

    if (!article || !article.publishedAt) {
      return; // Don't index unpublished articles
    }

    // Extract text content from blocks
    const content = this.extractContent(article.blocks);

    const searchDocument = {
      id: article.id,
      title: article.title,
      description: article.description,
      content,
      slug: article.slug,
      cover: article.cover?.url,
      author: {
        id: article.author.id,
        username: article.author.username,
        displayName: article.author.displayName
      },
      category: article.category ? {
        id: article.category.id,
        name: article.category.name
      } : null,
      tags: article.tags.map(tag => ({
        id: tag.id,
        name: tag.name
      })),
      viewsCount: article.viewsCount || 0,
      likesCount: article.likesCount || 0,
      commentsCount: article.commentsCount || 0,
      publishedAt: new Date(article.publishedAt).getTime()
    };

    const index = client.index('articles');
    await index.addDocuments([searchDocument]);
  },

  extractContent(blocks) {
    if (!blocks) return '';

    return blocks.map(block => {
      switch (block.__component) {
        case 'shared.rich-text':
          return this.stripHtml(block.body);
        case 'shared.quote':
          return block.quote;
        default:
          return '';
      }
    }).join(' ').substring(0, 10000); // Limit content size
  },

  stripHtml(html) {
    return html?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || '';
  },

  async deleteArticle(articleId) {
    const index = client.index('articles');
    await index.deleteDocument(articleId);
  },

  async bulkIndexArticles() {
    let page = 1;
    const pageSize = 100;

    while (true) {
      const articles = await strapi.entityService.findMany('api::article.article', {
        filters: { publishedAt: { $notNull: true } },
        start: (page - 1) * pageSize,
        limit: pageSize
      });

      if (articles.length === 0) break;

      await Promise.all(articles.map(article => this.indexArticle(article.id)));

      page++;
    }
  }
});
```

**4. Lifecycle Hooks Integration**

```typescript
// apps/strapi/src/api/article/content-types/article/lifecycles.ts
export default {
  async afterCreate(event) {
    const { result } = event;
    if (result.publishedAt) {
      await strapi.service('plugin::search.search-indexer').indexArticle(result.id);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    if (result.publishedAt) {
      await strapi.service('plugin::search.search-indexer').indexArticle(result.id);
    } else {
      // Unpublished - remove from index
      await strapi.service('plugin::search.search-indexer').deleteArticle(result.id);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    await strapi.service('plugin::search.search-indexer').deleteArticle(result.id);
  }
};
```

**5. Search API Controller**

```typescript
// apps/strapi/src/api/search/controllers/search.ts
export default {
  async search(ctx) {
    const {
      q,  // Query string
      index = 'articles',  // articles, users, tags, or 'all'
      filters,  // { categoryId, tagIds, authorId, dateRange }
      sort = 'relevance',  // relevance, date, views, likes
      page = 1,
      pageSize = 20
    } = ctx.query;

    if (index === 'all') {
      // Multi-index search
      const [articles, users, tags] = await Promise.all([
        client.index('articles').search(q, { limit: 10 }),
        client.index('users').search(q, { limit: 5 }),
        client.index('tags').search(q, { limit: 5 })
      ]);

      return ctx.send({
        data: { articles: articles.hits, users: users.hits, tags: tags.hits }
      });
    }

    // Single index search
    const searchIndex = client.index(index);

    const filterArray = [];
    if (filters?.categoryId) {
      filterArray.push(`category.id = ${filters.categoryId}`);
    }
    if (filters?.tagIds) {
      filterArray.push(`tags.id IN [${filters.tagIds.join(',')}]`);
    }
    if (filters?.authorId) {
      filterArray.push(`author.id = ${filters.authorId}`);
    }

    const sortBy = sort === 'date' ? 'publishedAt:desc' :
                   sort === 'views' ? 'viewsCount:desc' :
                   sort === 'likes' ? 'likesCount:desc' : undefined;

    const results = await searchIndex.search(q, {
      filter: filterArray.length > 0 ? filterArray : undefined,
      sort: sortBy ? [sortBy] : undefined,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      attributesToHighlight: ['title', 'description', 'content'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>'
    });

    return ctx.send({
      data: results.hits,
      meta: {
        pagination: {
          page,
          pageSize,
          total: results.estimatedTotalHits
        }
      }
    });
  },

  async suggest(ctx) {
    const { q } = ctx.query;

    const results = await client.index('articles').search(q, {
      limit: 5,
      attributesToRetrieve: ['title', 'slug']
    });

    return ctx.send({ data: results.hits });
  }
};
```

#### API Endpoints

```
GET    /api/search?q=query&index=articles&page=1     Search
GET    /api/search/suggest?q=part                    Autocomplete suggestions
POST   /api/search/reindex                           Force reindex (admin only)
```

#### Frontend Integration

**Search Component:**
```typescript
// packages/design-system/components/search-bar.tsx
'use client';

import { useSearch, useSearchSuggestions } from '@repo/strapi-client/hooks';
import { Command, CommandInput, CommandList, CommandItem } from './ui/command';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { data: suggestions } = useSearchSuggestions(query, { enabled: query.length > 2 });

  return (
    <Command shouldFilter={false}>
      <CommandInput
        value={query}
        onValueChange={setQuery}
        placeholder="Search articles, users, tags..."
      />
      {isOpen && suggestions && (
        <CommandList>
          {suggestions.map(item => (
            <CommandItem key={item.id} value={item.slug}>
              {item.title}
            </CommandItem>
          ))}
        </CommandList>
      )}
    </Command>
  );
}
```

**Search Results Page:**
```typescript
// apps/web/app/[locale]/search/page.tsx
export function SearchPage({ searchParams }) {
  const { q, categoryId, sort } = searchParams;
  const { data: results, isLoading } = useSearch({
    query: q,
    filters: { categoryId },
    sort
  });

  return (
    <div>
      <SearchFilters />
      <SearchResults results={results} isLoading={isLoading} />
    </div>
  );
}
```

#### Testing Requirements
- ✅ Typo tolerance (2 typos max)
- ✅ Relevance ranking accurate
- ✅ Filters work correctly
- ✅ Sorting by date/views/likes works
- ✅ Highlighting shows matched terms
- ✅ Multi-index search returns all types
- ✅ Autocomplete responds <100ms
- ✅ Full search <200ms for 10K articles
- ✅ Index updates within 1 second of content change

#### Performance Benchmarks
- 10K articles: <100ms search
- 100K articles: <200ms search
- 1M articles: <500ms search
- Index size: ~10MB per 1K articles

---

### 3.2 Trending Tags

**Complexity:** MODERATE-COMPLEX | **Timeline:** 2-3 weeks | **Value:** MEDIUM

#### Problem Statement
No way to discover popular or trending topics. Users want to see what's currently popular on the platform.

#### Solution Overview
Calculate trending score based on recent article views and usage, with time decay. Use materialized view for performance.

#### Database Schema

```sql
-- Materialized view refreshed hourly
CREATE MATERIALIZED VIEW trending_tags AS
SELECT
  t.id,
  t.name,
  t.slug,
  t.usage_count,
  t.followers_count,

  -- Count recent articles (last 7 days)
  COUNT(DISTINCT CASE WHEN a.published_at > NOW() - INTERVAL '7 days' THEN a.id END) as recent_articles,

  -- Sum recent views
  SUM(CASE WHEN a.published_at > NOW() - INTERVAL '7 days' THEN a.views_count ELSE 0 END) as recent_views,

  -- Time-weighted trending score
  -- More recent = higher weight using exponential decay
  SUM(
    a.views_count *
    EXP(-EXTRACT(EPOCH FROM (NOW() - a.published_at)) / 604800)  -- 7-day half-life
  ) as trending_score,

  -- Growth rate (views this week vs last week)
  (
    SUM(CASE WHEN a.published_at > NOW() - INTERVAL '7 days' THEN a.views_count ELSE 0 END)::FLOAT /
    NULLIF(SUM(CASE WHEN a.published_at BETWEEN NOW() - INTERVAL '14 days' AND NOW() - INTERVAL '7 days' THEN a.views_count ELSE 0 END), 0)
  ) as growth_rate

FROM tags t
LEFT JOIN articles_tags_links atl ON t.id = atl.tag_id
LEFT JOIN articles a ON atl.article_id = a.id AND a.published_at IS NOT NULL
WHERE a.published_at > NOW() - INTERVAL '30 days'  -- Only consider last 30 days
GROUP BY t.id
HAVING COUNT(DISTINCT a.id) >= 3  -- Minimum 3 articles to be considered trending
ORDER BY trending_score DESC;

-- Index for fast access
CREATE INDEX idx_trending_tags_score ON trending_tags(trending_score DESC);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_trending_tags()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY trending_tags;
END;
$$ LANGUAGE plpgsql;

-- Cron job (using pg_cron extension)
SELECT cron.schedule('refresh-trending-tags', '0 * * * *', 'SELECT refresh_trending_tags()');  -- Hourly
```

#### API Controller

```typescript
// apps/strapi/src/api/tag/controllers/tag.ts
export default factories.createCoreController('api::tag.tag', ({ strapi }) => ({
  async trending(ctx) {
    const { limit = 10, timeframe = '7d' } = ctx.query;

    // Query materialized view
    const trending = await strapi.db.connection.raw(`
      SELECT
        id, name, slug, usage_count, followers_count,
        recent_articles, recent_views, trending_score, growth_rate
      FROM trending_tags
      ORDER BY trending_score DESC
      LIMIT ?
    `, [limit]);

    return ctx.send({ data: trending.rows });
  },

  async trendingChart(ctx) {
    const { tagId, days = 30 } = ctx.query;

    // Get daily view counts for tag's articles
    const chart = await strapi.db.connection.raw(`
      SELECT
        DATE(av.created_at) as date,
        COUNT(*) as views
      FROM article_views av
      JOIN articles_tags_links atl ON av.article_id = atl.article_id
      WHERE atl.tag_id = ?
        AND av.created_at > NOW() - INTERVAL '? days'
      GROUP BY DATE(av.created_at)
      ORDER BY date
    `, [tagId, days]);

    return ctx.send({ data: chart.rows });
  }
}));
```

#### API Endpoints

```
GET    /api/tags/trending?limit=10&timeframe=7d    Get trending tags
GET    /api/tags/:id/trending-chart?days=30       Get tag trend chart
```

#### Frontend Components

**Trending Tags Widget:**
```typescript
// packages/design-system/components/trending-tags.tsx
'use client';

import { useTrendingTags } from '@repo/strapi-client/hooks';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function TrendingTags({ limit = 10 }: { limit?: number }) {
  const { data: tags, isLoading } = useTrendingTags({ limit });

  if (isLoading) return <TrendingTagsSkeleton />;

  return (
    <div className="trending-tags">
      <h2>Trending Topics</h2>
      <div className="tags-list">
        {tags?.map((tag, index) => (
          <div key={tag.id} className="trending-tag">
            <span className="rank">#{index + 1}</span>
            <Link href={`/tags/${tag.slug}`}>
              <span className="tag-name">#{tag.name}</span>
            </Link>
            <div className="stats">
              <span>{tag.recentArticles} articles</span>
              <span>{tag.recentViews} views</span>
              {tag.growthRate > 1 && (
                <span className="growth">
                  <TrendingUp className="w-3 h-3" />
                  {Math.round((tag.growthRate - 1) * 100)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Trending Chart:**
```typescript
// packages/design-system/components/trending-chart.tsx
import { Line } from 'recharts';

export function TrendingChart({ tagId }: { tagId: number }) {
  const { data: chartData } = useTrendingChart({ tagId, days: 30 });

  return (
    <Line data={chartData} dataKey="views" stroke="#3b82f6" />
  );
}
```

#### Testing Requirements
- ✅ Trending score calculation accurate
- ✅ Time decay applies correctly (recent > old)
- ✅ Minimum article threshold enforced
- ✅ Growth rate calculated correctly
- ✅ Materialized view refreshes hourly
- ✅ Query performance <50ms
- ✅ Handles edge cases (new tags, zero views)

#### Caching Strategy
- Cache trending tags in Redis for 1 hour
- Invalidate on materialized view refresh
- Fallback to database if Redis unavailable

---

### 3.3 Tag Moderation

**Complexity:** MODERATE | **Timeline:** 2-3 weeks | **Value:** MEDIUM

#### Problem Statement
User-created tags can lead to duplicates (JS vs JavaScript), spam tags, and inconsistent naming. Need admin tools to manage tag quality.

#### Solution Overview
Admin panel for tag management with merge, delete, and approval workflows.

#### Database Schema

```sql
-- Tag suggestions (approval workflow)
CREATE TABLE tag_suggestions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(30) NOT NULL,
  slug VARCHAR(50) NOT NULL,
  suggested_by INTEGER REFERENCES up_users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending',  -- pending, approved, rejected
  reviewed_by INTEGER REFERENCES admin_users(id) NULL,
  rejection_reason TEXT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP NULL
);

CREATE INDEX idx_tag_suggestions_status ON tag_suggestions(status, created_at DESC);

-- Tag merge history
CREATE TABLE tag_merges (
  id SERIAL PRIMARY KEY,
  source_tag_id INTEGER,  -- Don't cascade, keep for history
  source_tag_name VARCHAR(30),
  target_tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  merged_by INTEGER REFERENCES admin_users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tag_merges_target ON tag_merges(target_tag_id);

-- Tag moderation log
CREATE TABLE tag_moderation_log (
  id SERIAL PRIMARY KEY,
  tag_id INTEGER,
  action VARCHAR(50),  -- created, merged, deleted, renamed
  admin_id INTEGER REFERENCES admin_users(id),
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Admin Service

```typescript
// apps/strapi/src/api/tag/services/tag-admin.ts
export default ({ strapi }) => ({
  async mergeTags(sourceTagId, targetTagId, adminId) {
    const sourceTag = await strapi.entityService.findOne('api::tag.tag', sourceTagId);
    const targetTag = await strapi.entityService.findOne('api::tag.tag', targetTagId);

    if (!sourceTag || !targetTag) {
      throw new Error('Tag not found');
    }

    // Move all article associations from source to target
    await strapi.db.connection.raw(`
      UPDATE articles_tags_links
      SET tag_id = ?
      WHERE tag_id = ?
      ON CONFLICT DO NOTHING
    `, [targetTagId, sourceTagId]);

    // Move tag follows
    await strapi.db.connection.raw(`
      UPDATE tag_follows
      SET tag_id = ?
      WHERE tag_id = ?
      ON CONFLICT DO NOTHING
    `, [targetTagId, sourceTagId]);

    // Update target tag counters
    const updatedCounts = await strapi.db.connection.raw(`
      SELECT
        COUNT(DISTINCT atl.article_id) as usage_count,
        COUNT(DISTINCT tf.user_id) as followers_count
      FROM tags t
      LEFT JOIN articles_tags_links atl ON t.id = atl.tag_id
      LEFT JOIN tag_follows tf ON t.id = tf.tag_id
      WHERE t.id = ?
    `, [targetTagId]);

    await strapi.db.query('api::tag.tag').update({
      where: { id: targetTagId },
      data: {
        usageCount: updatedCounts.rows[0].usage_count,
        followersCount: updatedCounts.rows[0].followers_count
      }
    });

    // Record merge
    await strapi.db.connection('tag_merges').insert({
      source_tag_id: sourceTagId,
      source_tag_name: sourceTag.name,
      target_tag_id: targetTagId,
      merged_by: adminId
    });

    // Delete source tag
    await strapi.entityService.delete('api::tag.tag', sourceTagId);

    // Log action
    await strapi.db.connection('tag_moderation_log').insert({
      tag_id: targetTagId,
      action: 'merged',
      admin_id: adminId,
      details: { sourceTagName: sourceTag.name, targetTagName: targetTag.name }
    });

    return targetTag;
  },

  async findDuplicates() {
    // Find similar tag names using Levenshtein distance
    const duplicates = await strapi.db.connection.raw(`
      SELECT
        t1.id as id1, t1.name as name1,
        t2.id as id2, t2.name as name2,
        levenshtein(LOWER(t1.name), LOWER(t2.name)) as distance
      FROM tags t1
      JOIN tags t2 ON t1.id < t2.id
      WHERE levenshtein(LOWER(t1.name), LOWER(t2.name)) <= 2
        OR LOWER(t1.name) = LOWER(t2.name)
      ORDER BY distance
    `);

    return duplicates.rows;
  },

  async suggestMerges() {
    const duplicates = await this.findDuplicates();

    return duplicates.map(dup => ({
      source: { id: dup.id2, name: dup.name2 },
      target: { id: dup.id1, name: dup.name1 },
      similarity: 1 - (dup.distance / Math.max(dup.name1.length, dup.name2.length))
    }));
  }
});
```

#### Admin API Controller

```typescript
// apps/strapi/src/api/tag/controllers/tag-admin.ts
export default {
  async mergeTags(ctx) {
    const { sourceTagId, targetTagId } = ctx.request.body;
    const adminId = ctx.state.admin.id;

    const result = await strapi.service('api::tag.tag-admin').mergeTags(
      sourceTagId,
      targetTagId,
      adminId
    );

    return ctx.send({ data: result });
  },

  async findDuplicates(ctx) {
    const duplicates = await strapi.service('api::tag.tag-admin').findDuplicates();
    return ctx.send({ data: duplicates });
  },

  async getMergeSuggestions(ctx) {
    const suggestions = await strapi.service('api::tag.tag-admin').suggestMerges();
    return ctx.send({ data: suggestions });
  },

  async getModerationLog(ctx) {
    const { page = 1, pageSize = 50 } = ctx.query;

    const log = await strapi.db.connection('tag_moderation_log')
      .orderBy('created_at', 'desc')
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return ctx.send({ data: log });
  }
};
```

#### Admin Panel UI

```typescript
// apps/strapi/src/admin/app.tsx - Register custom page
import TagModerationPage from './pages/TagModeration';

export default {
  config: {
    menu: [
      {
        to: '/plugins/tag-moderation',
        icon: Tags,
        intlLabel: { id: 'tag-moderation.title', defaultMessage: 'Tag Moderation' },
        Component: TagModerationPage
      }
    ]
  }
};

// apps/strapi/src/admin/pages/TagModeration.tsx
export function TagModerationPage() {
  const { data: duplicates } = useGetDuplicates();
  const { data: suggestions } = useGetMergeSuggestions();
  const { mutate: mergeTags } = useMergeTags();

  return (
    <div>
      <h1>Tag Moderation</h1>

      <section>
        <h2>Suggested Merges</h2>
        {suggestions?.map(sugg => (
          <div key={`${sugg.source.id}-${sugg.target.id}`}>
            <span>{sugg.source.name} → {sugg.target.name}</span>
            <span>Similarity: {Math.round(sugg.similarity * 100)}%</span>
            <button onClick={() => mergeTags({
              sourceTagId: sugg.source.id,
              targetTagId: sugg.target.id
            })}>
              Merge
            </button>
          </div>
        ))}
      </section>

      <section>
        <h2>All Duplicates</h2>
        <DuplicatesTable duplicates={duplicates} onMerge={mergeTags} />
      </section>

      <section>
        <h2>Moderation Log</h2>
        <ModerationLogTable />
      </section>
    </div>
  );
}
```

#### API Endpoints (Admin Only)

```
POST   /admin/tags/merge                Tag merge operation
GET    /admin/tags/duplicates            Find duplicate tags
GET    /admin/tags/merge-suggestions    AI-suggested merges
GET    /admin/tags/moderation-log        Get moderation history
```

#### Testing Requirements
- ✅ Tag merge moves all associations
- ✅ Counters updated correctly after merge
- ✅ Source tag deleted, target preserved
- ✅ Merge logged in history
- ✅ Duplicate detection accurate
- ✅ Levenshtein distance <2 catches typos
- ✅ No data loss during merge
- ✅ Admin-only access enforced

---

## Phase 4: Optimization (4-6 weeks)

**Goal:** Advanced features and performance tuning
**Priority:** LOW-MEDIUM | **Risk:** MEDIUM | **Dependencies:** Phase 3 complete

### 4.1 Tag Synonyms

**Complexity:** MODERATE-COMPLEX | **Timeline:** 2-3 weeks | **Value:** LOW-MEDIUM

#### Problem Statement
Even with tag merging, users search for different terms (JS vs JavaScript, ML vs Machine Learning). Need automatic query rewriting for better search results.

#### Solution Overview
Create bidirectional synonym relationships that auto-expand search queries.

#### Database Schema

```sql
CREATE TABLE tag_synonyms (
  id SERIAL PRIMARY KEY,
  canonical_tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  synonym_tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_by INTEGER REFERENCES admin_users(id),
  auto_detected BOOLEAN DEFAULT FALSE,  -- AI-suggested vs admin-created
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT synonym_not_self CHECK (canonical_tag_id != synonym_tag_id)
);

CREATE UNIQUE INDEX idx_tag_synonyms_unique ON tag_synonyms(synonym_tag_id);
CREATE INDEX idx_tag_synonyms_canonical ON tag_synonyms(canonical_tag_id);

-- Example data
INSERT INTO tag_synonyms (canonical_tag_id, synonym_tag_id, created_by) VALUES
  ((SELECT id FROM tags WHERE name = 'JavaScript'), (SELECT id FROM tags WHERE name = 'JS'), 1),
  ((SELECT id FROM tags WHERE name = 'Machine Learning'), (SELECT id FROM tags WHERE name = 'ML'), 1);
```

#### Synonym Service

```typescript
// apps/strapi/src/api/tag/services/tag-synonym.ts
export default ({ strapi }) => ({
  async createSynonym(canonicalTagId, synonymTagId, adminId) {
    // Validate tags exist
    const canonical = await strapi.entityService.findOne('api::tag.tag', canonicalTagId);
    const synonym = await strapi.entityService.findOne('api::tag.tag', synonymTagId);

    if (!canonical || !synonym) {
      throw new Error('Tag not found');
    }

    // Check if synonym already points elsewhere
    const existing = await strapi.db.query('api::tag-synonym.tag-synonym').findOne({
      where: { synonym_tag_id: synonymTagId }
    });

    if (existing) {
      throw new Error('Synonym already exists');
    }

    // Create synonym relationship
    const synonymRelation = await strapi.db.connection('tag_synonyms').insert({
      canonical_tag_id: canonicalTagId,
      synonym_tag_id: synonymTagId,
      created_by: adminId
    }).returning('*');

    return synonymRelation[0];
  },

  async expandQuery(tagIds) {
    // For each tag ID, include its canonical form and all its synonyms
    const expanded = await strapi.db.connection.raw(`
      WITH RECURSIVE tag_expansion AS (
        -- Base case: original tags
        SELECT id FROM unnest(?::int[]) AS id

        UNION

        -- If tag is a synonym, include canonical
        SELECT ts.canonical_tag_id
        FROM tag_synonyms ts
        WHERE ts.synonym_tag_id IN (SELECT id FROM unnest(?::int[]) AS id)

        UNION

        -- If tag is canonical, include all synonyms
        SELECT ts.synonym_tag_id
        FROM tag_synonyms ts
        WHERE ts.canonical_tag_id IN (SELECT id FROM unnest(?::int[]) AS id)
      )
      SELECT DISTINCT id FROM tag_expansion
    `, [tagIds, tagIds, tagIds]);

    return expanded.rows.map(row => row.id);
  },

  async autoDetectSynonyms() {
    // Use OpenAI or local NLP to detect semantic similarity
    // This is a simplified version - real implementation would use embeddings

    const tags = await strapi.entityService.findMany('api::tag.tag', {
      filters: { usageCount: { $gte: 10 } },  // Only popular tags
      fields: ['id', 'name', 'description']
    });

    const suggestions = [];

    // Simple heuristic: check common abbreviations
    const abbreviations = {
      'JavaScript': ['JS', 'ECMAScript'],
      'TypeScript': ['TS'],
      'Machine Learning': ['ML'],
      'Artificial Intelligence': ['AI'],
      'React': ['ReactJS'],
      'Next.js': ['NextJS']
    };

    for (const [full, abbrevs] of Object.entries(abbreviations)) {
      const fullTag = tags.find(t => t.name.toLowerCase() === full.toLowerCase());
      if (!fullTag) continue;

      for (const abbrev of abbrevs) {
        const abbrevTag = tags.find(t => t.name.toLowerCase() === abbrev.toLowerCase());
        if (abbrevTag) {
          suggestions.push({
            canonical: fullTag,
            synonym: abbrevTag,
            confidence: 0.9
          });
        }
      }
    }

    return suggestions;
  }
});
```

#### Search Integration

Update search to automatically expand tags:

```typescript
// apps/strapi/src/api/search/controllers/search.ts (update)
async search(ctx) {
  // ... existing code ...

  // Expand tag filters
  if (filters?.tagIds) {
    const expandedTagIds = await strapi.service('api::tag.tag-synonym').expandQuery(filters.tagIds);
    filters.tagIds = expandedTagIds;
  }

  // ... rest of search logic ...
}
```

#### Admin UI

```typescript
// apps/strapi/src/admin/pages/TagSynonyms.tsx
export function TagSynonymsPage() {
  const { data: suggestions } = useAutoDetectSynonyms();
  const { mutate: createSynonym } = useCreateSynonym();

  return (
    <div>
      <h1>Tag Synonyms</h1>

      <section>
        <h2>Auto-Detected Synonyms</h2>
        {suggestions?.map(sugg => (
          <div key={`${sugg.canonical.id}-${sugg.synonym.id}`}>
            <span>{sugg.synonym.name} → {sugg.canonical.name}</span>
            <span>Confidence: {Math.round(sugg.confidence * 100)}%</span>
            <button onClick={() => createSynonym({
              canonicalTagId: sugg.canonical.id,
              synonymTagId: sugg.synonym.id
            })}>
              Create Synonym
            </button>
          </div>
        ))}
      </section>

      <section>
        <h2>Manual Synonym Creation</h2>
        <SynonymForm onSubmit={createSynonym} />
      </section>

      <section>
        <h2>Existing Synonyms</h2>
        <SynonymsList />
      </section>
    </div>
  );
}
```

#### API Endpoints

```
POST   /admin/tag-synonyms                  Create synonym
DELETE /admin/tag-synonyms/:id              Delete synonym
GET    /admin/tag-synonyms/auto-detect      Get auto-detected suggestions
GET    /api/tag-synonyms?canonicalId=:id    Get synonyms for tag (public)
```

#### Testing Requirements
- ✅ Synonym creation prevents cycles
- ✅ Query expansion includes all related tags
- ✅ Search results include synonym matches
- ✅ Auto-detection finds common abbreviations
- ✅ Cannot create conflicting synonyms
- ✅ Deleting canonical removes synonyms
- ✅ Performance: Query expansion <50ms

---

## Implementation Timeline & Resource Planning

### Timeline Summary

| Phase | Duration | Features | Priority |
|-------|----------|----------|----------|
| Phase 1: Foundation | 4-6 weeks | User Followers Count, Article Views, Tag Following | HIGH |
| Phase 2: Engagement | 6-12 weeks | Notifications, Comment Replies, Reading List | HIGH |
| Phase 3: Discovery | 12-16 weeks | Search, Trending Tags, Tag Moderation | MEDIUM-HIGH |
| Phase 4: Optimization | 4-6 weeks | Tag Synonyms, Performance Tuning | LOW-MEDIUM |
| **Total** | **26-40 weeks** | **10 features** | **Mixed** |

### Resource Requirements

**Team Size Options:**

**1 Developer (Full-time):**
- Timeline: 26-40 weeks (6-9 months)
- Pros: Consistent codebase, single vision
- Cons: Slowest delivery, single point of failure
- Best for: Side projects, MVP development

**2 Developers (Full-time):**
- Timeline: 16-24 weeks (4-6 months)
- Parallel: Phase 1 + Phase 2 concurrent
- Pros: Balanced speed and coordination
- Cons: Requires coordination overhead
- Best for: Startup rapid development

**3+ Developers (Full-time):**
- Timeline: 12-18 weeks (3-4.5 months)
- Parallel: All phases concurrent
- Pros: Fastest delivery
- Cons: High coordination cost, potential conflicts
- Best for: Enterprise rollout, deadline-driven

### Budget Estimation

**Infrastructure Costs (Monthly):**
- Meilisearch (2GB RAM): $0 (self-hosted) or $50 (cloud)
- PostgreSQL upgrade: $0 (if existing) or $50 (larger instance)
- Redis cache: $0 (included) or $30 (managed)
- Monitoring (optional): $0-$100 (Sentry, DataDog)
- **Total: $0-$230/month**

**Development Costs:**
- Junior Developer: $50-75/hour
- Mid-Level Developer: $75-125/hour
- Senior Developer: $125-200/hour
- Estimated Total (1 senior): $100k-200k

### Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Search performance issues | Medium | High | Load testing, caching, index optimization |
| Notification spam | High | Medium | Rate limiting, user preferences, AI filtering |
| Tag quality degradation | Medium | Medium | Moderation tools, auto-cleanup, admin review |
| Database race conditions | Medium | High | Atomic operations, transactions, queues |
| Third-party service downtime | Low | High | Graceful degradation, fallback mechanisms |
| Scope creep | High | High | Strict phase gating, MVP focus |

### Success Metrics

**Phase 1:**
- [ ] Article views tracked with <1% error rate
- [ ] Follower counts accurate to 100%
- [ ] Tag follow feed shows relevant content

**Phase 2:**
- [ ] Notification delivery <3 seconds 95th percentile
- [ ] Comment threads load <500ms
- [ ] Reading list adoption >20% of bookmarkers

**Phase 3:**
- [ ] Search returns results <200ms
- [ ] Trending tags updated hourly
- [ ] Tag duplicates reduced by 80%

**Phase 4:**
- [ ] Synonym expansion improves search results by 15%
- [ ] Performance tuning reduces server costs by 20%

---

## Conclusion

This roadmap provides a comprehensive plan for transforming StrapiPress into a fully-featured social content platform. By following the phased approach and prioritizing foundation before advanced features, we ensure a stable, scalable system that delivers user value incrementally.

**Recommended Next Steps:**
1. ✅ Review and approve this roadmap
2. ⏳ Secure budget and resources
3. ⏳ Begin Phase 1 implementation
4. ⏳ Set up monitoring and analytics
5. ⏳ Plan user testing for each phase

**Questions or Adjustments?** This plan is flexible - features can be re-prioritized based on user feedback and business needs.
