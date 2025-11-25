/**
 * Database Migration: Performance Indexes for Strapi 5
 *
 * IMPORTANT: Strapi 5 uses LINK TABLES for relations!
 * - Main tables: likes, bookmarks, follows, comments, articles
 * - Link tables: likes_user_lnk, likes_article_lnk, etc.
 *
 * This migration creates indexes on:
 * 1. Link tables (for relation queries)
 * 2. Main table columns (for sorting/filtering)
 */

async function up(knex) {
  // Detect database type - check multiple possible values
  const clientName = knex.client.config.client || knex.client.dialect || '';
  const isPostgres = ['postgres', 'pg', 'postgresql'].includes(clientName.toLowerCase());
  const isSqlite = ['sqlite', 'sqlite3', 'better-sqlite3'].includes(clientName.toLowerCase());

  console.log(`📊 Adding Strapi 5 performance indexes (${clientName})...`);

  // Helper: Check if table exists
  const tableExists = async (tableName) => {
    return knex.schema.hasTable(tableName);
  };

  // Helper: Check if column exists in table
  const columnExists = async (tableName, columnName) => {
    const exists = await tableExists(tableName);
    if (!exists) return false;

    try {
      const hasColumn = await knex.schema.hasColumn(tableName, columnName);
      return hasColumn;
    } catch {
      // Fallback to raw queries if hasColumn fails
      if (isPostgres) {
        const result = await knex.raw(`
          SELECT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = ?
            AND column_name = ?
          )
        `, [tableName, columnName]);
        return result.rows[0].exists;
      }
      if (isSqlite) {
        const columns = await knex.raw(`PRAGMA table_info(${tableName})`);
        return columns.some(col => col.name === columnName);
      }
      return false;
    }
  };

  // Helper: Check if index exists
  const indexExists = async (indexName) => {
    try {
      if (isPostgres) {
        const result = await knex.raw(`
          SELECT EXISTS (
            SELECT 1 FROM pg_indexes WHERE indexname = ?
          )
        `, [indexName]);
        return result.rows[0].exists;
      }
      if (isSqlite) {
        const result = await knex.raw(`
          SELECT name FROM sqlite_master WHERE type='index' AND name=?
        `, [indexName]);
        return result.length > 0;
      }
      // For other databases, assume index doesn't exist (will try to create)
      return false;
    } catch {
      // If check fails, assume index doesn't exist
      return false;
    }
  };

  // Helper: Create index safely
  const createIndex = async (tableName, indexName, columns) => {
    if (await indexExists(indexName)) {
      console.log(`  ⏭️  Index exists: ${indexName}`);
      return;
    }
    if (!(await tableExists(tableName))) {
      console.log(`  ⚠️  Table missing: ${tableName}`);
      return;
    }
    // Verify all columns exist
    for (const col of columns) {
      if (!(await columnExists(tableName, col))) {
        console.log(`  ⚠️  Column missing: ${tableName}.${col}`);
        return;
      }
    }
    await knex.schema.alterTable(tableName, (table) => {
      table.index(columns, indexName);
    });
    console.log(`  ✅ Created: ${indexName}`);
  };

  // ===========================================
  // STRAPI 5 LINK TABLE INDEXES
  // ===========================================
  console.log('\n📎 Link Table Indexes (Relations):');

  // LIKES link tables
  await createIndex('likes_user_lnk', 'idx_likes_user_lnk_user', ['user_id']);
  await createIndex('likes_user_lnk', 'idx_likes_user_lnk_like', ['like_id']);
  await createIndex('likes_article_lnk', 'idx_likes_article_lnk_article', ['article_id']);
  await createIndex('likes_article_lnk', 'idx_likes_article_lnk_like', ['like_id']);

  // BOOKMARKS link tables
  await createIndex('bookmarks_user_lnk', 'idx_bookmarks_user_lnk_user', ['user_id']);
  await createIndex('bookmarks_user_lnk', 'idx_bookmarks_user_lnk_bookmark', ['bookmark_id']);
  await createIndex('bookmarks_article_lnk', 'idx_bookmarks_article_lnk_article', ['article_id']);
  await createIndex('bookmarks_article_lnk', 'idx_bookmarks_article_lnk_bookmark', ['bookmark_id']);

  // FOLLOWS link tables
  await createIndex('follows_follower_lnk', 'idx_follows_follower_lnk_user', ['user_id']);
  await createIndex('follows_follower_lnk', 'idx_follows_follower_lnk_follow', ['follow_id']);
  await createIndex('follows_following_lnk', 'idx_follows_following_lnk_user', ['user_id']);
  await createIndex('follows_following_lnk', 'idx_follows_following_lnk_follow', ['follow_id']);

  // COMMENTS link tables
  await createIndex('comments_user_lnk', 'idx_comments_user_lnk_user', ['user_id']);
  await createIndex('comments_user_lnk', 'idx_comments_user_lnk_comment', ['comment_id']);
  await createIndex('comments_article_lnk', 'idx_comments_article_lnk_article', ['article_id']);
  await createIndex('comments_article_lnk', 'idx_comments_article_lnk_comment', ['comment_id']);

  // ARTICLES link tables
  await createIndex('articles_author_lnk', 'idx_articles_author_lnk_user', ['user_id']);
  await createIndex('articles_author_lnk', 'idx_articles_author_lnk_article', ['article_id']);
  await createIndex('articles_category_lnk', 'idx_articles_category_lnk_category', ['category_id']);
  await createIndex('articles_category_lnk', 'idx_articles_category_lnk_article', ['article_id']);

  // ARTICLES-TAGS many-to-many link table
  await createIndex('articles_tags_lnk', 'idx_articles_tags_lnk_article', ['article_id']);
  await createIndex('articles_tags_lnk', 'idx_articles_tags_lnk_tag', ['tag_id']);

  // ===========================================
  // MAIN TABLE INDEXES (Non-Relation Columns)
  // ===========================================
  console.log('\n📋 Main Table Indexes:');

  // ARTICLES - sorting and filtering
  await createIndex('articles', 'idx_articles_created_at', ['created_at']);
  await createIndex('articles', 'idx_articles_published_at', ['published_at']);
  await createIndex('articles', 'idx_articles_slug', ['slug']);
  await createIndex('articles', 'idx_articles_featured', ['featured']);
  await createIndex('articles', 'idx_articles_document_id', ['document_id']);

  // CATEGORIES
  await createIndex('categories', 'idx_categories_slug', ['slug']);
  await createIndex('categories', 'idx_categories_document_id', ['document_id']);

  // TAGS
  await createIndex('tags', 'idx_tags_slug', ['slug']);
  await createIndex('tags', 'idx_tags_document_id', ['document_id']);

  // COMMENTS - sorting
  await createIndex('comments', 'idx_comments_created_at', ['created_at']);
  await createIndex('comments', 'idx_comments_document_id', ['document_id']);

  // LIKES, BOOKMARKS, FOLLOWS - document_id for lookups
  await createIndex('likes', 'idx_likes_document_id', ['document_id']);
  await createIndex('bookmarks', 'idx_bookmarks_document_id', ['document_id']);
  await createIndex('follows', 'idx_follows_document_id', ['document_id']);

  console.log('\n📊 Performance indexes migration complete!');
}

async function down(knex) {
  console.log('📊 Removing performance indexes...');

  const dropIndex = async (tableName, indexName) => {
    try {
      await knex.schema.alterTable(tableName, (table) => {
        table.dropIndex([], indexName);
      });
      console.log(`  ✅ Dropped: ${indexName}`);
    } catch {
      console.log(`  ⏭️  Not found: ${indexName}`);
    }
  };

  // Link table indexes
  await dropIndex('likes_user_lnk', 'idx_likes_user_lnk_user');
  await dropIndex('likes_user_lnk', 'idx_likes_user_lnk_like');
  await dropIndex('likes_article_lnk', 'idx_likes_article_lnk_article');
  await dropIndex('likes_article_lnk', 'idx_likes_article_lnk_like');
  await dropIndex('bookmarks_user_lnk', 'idx_bookmarks_user_lnk_user');
  await dropIndex('bookmarks_user_lnk', 'idx_bookmarks_user_lnk_bookmark');
  await dropIndex('bookmarks_article_lnk', 'idx_bookmarks_article_lnk_article');
  await dropIndex('bookmarks_article_lnk', 'idx_bookmarks_article_lnk_bookmark');
  await dropIndex('follows_follower_lnk', 'idx_follows_follower_lnk_user');
  await dropIndex('follows_follower_lnk', 'idx_follows_follower_lnk_follow');
  await dropIndex('follows_following_lnk', 'idx_follows_following_lnk_user');
  await dropIndex('follows_following_lnk', 'idx_follows_following_lnk_follow');
  await dropIndex('comments_user_lnk', 'idx_comments_user_lnk_user');
  await dropIndex('comments_user_lnk', 'idx_comments_user_lnk_comment');
  await dropIndex('comments_article_lnk', 'idx_comments_article_lnk_article');
  await dropIndex('comments_article_lnk', 'idx_comments_article_lnk_comment');
  await dropIndex('articles_author_lnk', 'idx_articles_author_lnk_user');
  await dropIndex('articles_author_lnk', 'idx_articles_author_lnk_article');
  await dropIndex('articles_category_lnk', 'idx_articles_category_lnk_category');
  await dropIndex('articles_category_lnk', 'idx_articles_category_lnk_article');
  await dropIndex('articles_tags_lnk', 'idx_articles_tags_lnk_article');
  await dropIndex('articles_tags_lnk', 'idx_articles_tags_lnk_tag');

  // Main table indexes
  await dropIndex('articles', 'idx_articles_created_at');
  await dropIndex('articles', 'idx_articles_published_at');
  await dropIndex('articles', 'idx_articles_slug');
  await dropIndex('articles', 'idx_articles_featured');
  await dropIndex('articles', 'idx_articles_document_id');
  await dropIndex('categories', 'idx_categories_slug');
  await dropIndex('categories', 'idx_categories_document_id');
  await dropIndex('tags', 'idx_tags_slug');
  await dropIndex('tags', 'idx_tags_document_id');
  await dropIndex('comments', 'idx_comments_created_at');
  await dropIndex('comments', 'idx_comments_document_id');
  await dropIndex('likes', 'idx_likes_document_id');
  await dropIndex('bookmarks', 'idx_bookmarks_document_id');
  await dropIndex('follows', 'idx_follows_document_id');

  console.log('📊 Indexes removed!');
}

module.exports = { up, down };
