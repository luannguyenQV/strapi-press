/**
 * Social Blogging Platform Sample Data Seed Script
 *
 * OPTIONAL - For testing and development only
 *
 * Generates realistic sample data for social blogging features:
 * - Users (via users-permissions plugin)
 * - Categories
 * - Tags (with auto-deduplication)
 * - Articles (with tags, category, author)
 * - Comments (on articles)
 * - Likes (user → article)
 * - Bookmarks (user → article)
 * - Follows (user → user)
 *
 * Prerequisites:
 *   Run "pnpm seed:permissions" first to configure permissions and roles
 *
 * Usage:
 *   pnpm seed:social              # Generate default amounts
 *   USERS=20 ARTICLES=50 pnpm seed:social    # Custom amounts
 *
 * Note: This script is for development/testing only. Do NOT use in production.
 */

const { faker } = require('@faker-js/faker');

// Configuration - Can be overridden via environment variables
const NUM_USERS = Number.parseInt(process.env.USERS) || 10;
const NUM_CATEGORIES = Number.parseInt(process.env.CATEGORIES) || 5;
const NUM_ARTICLES = Number.parseInt(process.env.ARTICLES) || 30;
const NUM_TAGS = Number.parseInt(process.env.TAGS) || 20;
const ENABLE_LOGGING = process.env.QUIET !== 'true';

/**
 * Main execution function
 */
async function seedSocialData() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  // Initialize Strapi instance
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  app.log.level = 'error';

  try {
    logSection('Sample Data Generation (Testing/Development)');
    console.log('⚠️  This script is for testing/development only\n');
    console.log(`👥 Users: ${NUM_USERS}`);
    console.log(`📁 Categories: ${NUM_CATEGORIES}`);
    console.log(`🏷️  Tags: ${NUM_TAGS}`);
    console.log(`📝 Articles: ${NUM_ARTICLES}`);
    console.log(
      `💬 Comments, ❤️ Likes, 🔖 Bookmarks, 👤 Follows: Auto-generated\n`
    );

    // Check prerequisites
    const permissionsConfigured = await checkPermissionsConfigured();
    if (!permissionsConfigured) {
      console.error('❌ Permissions not configured!');
      console.error('   Please run "pnpm seed:permissions" first.\n');
      process.exitCode = 1;
      return;
    }
    console.log('✅ Prerequisites: Permissions configured\n');

    // Check if seed has already run
    const shouldSeed = await checkFirstRun();
    if (!shouldSeed) {
      console.log(
        '⚠️  Sample data already imported. Clear database to re-seed.\n'
      );
      return;
    }

    // Step 1: Create users
    const users = await createUsers();

    // Step 2: Create categories
    const categories = await createCategories();

    // Step 3: Create tags
    const tags = await createTags();

    // Step 4: Create articles
    const articles = await createArticles(users, categories, tags);

    // Step 5: Create social interactions
    await createComments(users, articles);
    await createLikes(users, articles);
    await createBookmarks(users, articles);
    await createFollows(users);

    // Step 6: Update denormalized counts
    await updateArticleCounts(articles);
    await updateTagCounts(tags);

    // Mark as complete AFTER all operations succeed
    await markSeedComplete();

    logSection('✅ Sample Data Created');
    console.log('🎉 Social blogging sample data generated successfully!\n');
    console.log('📊 Generated:');
    console.log(`   ✓ ${users.length} users`);
    console.log(`   ✓ ${categories.length} categories`);
    console.log(`   ✓ ${tags.length} tags`);
    console.log(`   ✓ ${articles.length} articles`);
    console.log('   ✓ Comments, likes, bookmarks, and follows\n');
    console.log('📍 Next steps:');
    console.log('   1. Start Strapi: pnpm dev:strapi');
    console.log('   2. Test API: curl http://localhost:1337/api/articles');
    console.log('   3. Seeded users can authenticate via /api/auth/local');
    console.log('      (email: <user>@example.com, password: "password123")');
    console.log('   4. For admin panel: pnpm strapi admin:create-user\n');
  } catch (error) {
    console.error('\n❌ Fatal error during seed:', error.message);
    console.error(error.stack);
    process.exitCode = 1;
  } finally {
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      await app.destroy();
    } catch (destroyError) {
      if (destroyError.message !== 'aborted') {
        console.error('⚠️  Cleanup warning:', destroyError.message);
      }
    }
    process.exit(process.exitCode || 0);
  }
}

/**
 * Check if permissions have been configured
 */
async function checkPermissionsConfigured() {
  const pluginStore = strapi.store({
    environment: strapi.config.environment,
    type: 'type',
    name: 'setup',
  });
  const permissionsSeedHasRun = await pluginStore.get({
    key: 'permissionsSeedHasRun',
  });
  return !!permissionsSeedHasRun;
}

/**
 * Check if this is the first run (does NOT set the flag - that happens after success)
 */
async function checkFirstRun() {
  const pluginStore = strapi.store({
    environment: strapi.config.environment,
    type: 'type',
    name: 'setup',
  });
  const seedHasRun = await pluginStore.get({ key: 'socialSeedHasRun' });
  return !seedHasRun;
}

/**
 * Mark social seed as successfully completed (called AFTER completion)
 */
async function markSeedComplete() {
  const pluginStore = strapi.store({
    environment: strapi.config.environment,
    type: 'type',
    name: 'setup',
  });
  await pluginStore.set({ key: 'socialSeedHasRun', value: true });
}

/**
 * Create users via users-permissions plugin
 */
async function createUsers() {
  log('👥 Creating users...');
  const users = [];

  // Get the authenticated role to assign to users
  const authenticatedRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'authenticated' } });

  if (!authenticatedRole) {
    console.error('   ❌ Authenticated role not found!');
    return users;
  }

  for (let i = 0; i < NUM_USERS; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = faker.internet
      .userName({ firstName, lastName })
      .toLowerCase();

    try {
      const user = await strapi.query('plugin::users-permissions.user').create({
        data: {
          username,
          email: faker.internet.email({ firstName, lastName }).toLowerCase(),
          password:
            '$2a$10$X7wE2qVNWFjVjJxZZj8zbuLLZjVMj4bT4kx5vF.8RZvxQxY3H6ZC2', // "password123"
          confirmed: true,
          blocked: false,
          provider: 'local',
          role: authenticatedRole.id, // Explicitly assign authenticated role
        },
      });
      users.push(user);
    } catch (error) {
      console.error(`   ⚠️  Failed to create user ${username}:`, error.message);
    }
  }

  console.log(`   ✅ Created ${users.length} users\n`);
  return users;
}

/**
 * Create categories
 */
async function createCategories() {
  log('📁 Creating categories...');
  const categories = [];

  const categoryNames = [
    'Technology',
    'Design',
    'Business',
    'Development',
    'Marketing',
    'Product',
    'Engineering',
    'Data Science',
  ];

  const descriptions = [
    'Latest trends and insights in the tech world',
    'Creative design patterns and UI/UX best practices',
    'Business strategy and growth tactics',
    'Software development tutorials and guides',
    'Marketing strategies and growth hacking',
    'Product management and development',
    'Engineering best practices and architecture',
    'Data analysis and machine learning',
  ];

  for (let i = 0; i < Math.min(NUM_CATEGORIES, categoryNames.length); i++) {
    try {
      const category = await strapi.documents('api::category.category').create({
        data: {
          name: categoryNames[i],
          slug: categoryNames[i].toLowerCase().replace(/\s+/g, '-'),
          description: descriptions[i],
          publishedAt: new Date(),
        },
      });
      categories.push(category);
    } catch (error) {
      console.error(
        `   ⚠️  Failed to create category ${categoryNames[i]}:`,
        error.message
      );
    }
  }

  console.log(`   ✅ Created ${categories.length} categories\n`);
  return categories;
}

/**
 * Create tags using Documents API with case-insensitive deduplication
 */
async function createTags() {
  log('🏷️  Creating tags...');
  const tags = [];

  const tagNames = [
    'React',
    'TypeScript',
    'Next.js',
    'Node.js',
    'JavaScript',
    'CSS',
    'Tailwind',
    'UI/UX',
    'Performance',
    'Security',
    'Testing',
    'DevOps',
    'API',
    'Database',
    'Cloud',
    'Mobile',
    'Web',
    'AI',
    'Machine Learning',
    'Productivity',
    'Tutorial',
    'Best Practices',
    'Architecture',
    'Tools',
    'Tips',
  ];

  const colors = [
    '#3b82f6',
    '#ef4444',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#84cc16',
    '#f97316',
    '#6366f1',
  ];

  for (let i = 0; i < Math.min(NUM_TAGS, tagNames.length); i++) {
    try {
      const tagName = tagNames[i];
      const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      // Check for existing tag (case-insensitive) using raw query
      const existingTags = await strapi.db.query('api::tag.tag').findMany({
        where: {
          $or: [{ name: { $eqi: tagName } }, { slug: { $eqi: slug } }],
        },
      });

      if (existingTags.length > 0) {
        // Use existing tag
        tags.push(existingTags[0]);
        continue;
      }

      // Create new tag using Documents API
      const tag = await strapi.documents('api::tag.tag').create({
        data: {
          name: tagName,
          slug,
          description: `Articles about ${tagName}`,
          color: colors[i % colors.length],
          publishedAt: new Date(),
        },
      });

      tags.push(tag);
    } catch (error) {
      console.error(
        `   ⚠️  Failed to create tag ${tagNames[i]}:`,
        error.message
      );
    }
  }

  console.log(`   ✅ Created ${tags.length} tags\n`);
  return tags;
}

/**
 * Create articles with relations
 */
async function createArticles(users, categories, tags) {
  log('📝 Creating articles...');
  const articles = [];

  for (let i = 0; i < NUM_ARTICLES; i++) {
    const author = pickRandom(users);
    const category = pickRandom(categories);
    const articleTags = pickRandomSubset(
      tags,
      Math.min(5, Math.floor(Math.random() * 3) + 1)
    );

    try {
      const title = generateTitle();
      const slug = `${faker.lorem.slug()}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      const article = await strapi.documents('api::article.article').create({
        data: {
          title,
          slug,
          description: faker.lorem.sentence(),
          content: generateContent(),
          author: author.id, // users-permissions uses numeric id
          category: category.documentId, // content types use documentId
          tags: articleTags.map((t) => t.documentId), // content types use documentId
          featured: Math.random() < 0.2, // 20% featured
          publishedAt: generateRandomDate(),
        },
      });

      articles.push(article);
    } catch (error) {
      console.error(`   ⚠️  Failed to create article ${i + 1}:`, error.message);
    }
  }

  console.log(`   ✅ Created ${articles.length} articles\n`);
  return articles;
}

/**
 * Create comments on articles
 */
async function createComments(users, articles) {
  log('💬 Creating comments...');
  let commentCount = 0;

  // Each article gets 0-5 comments
  for (const article of articles) {
    const numComments = Math.floor(Math.random() * 6);

    for (let i = 0; i < numComments; i++) {
      const user = pickRandom(users);

      try {
        await strapi.documents('api::comment.comment').create({
          data: {
            content: faker.lorem.paragraph(),
            user: user.id,
            article: article.documentId,
            publishedAt: new Date(),
          },
        });
        commentCount++;
      } catch (error) {
        // Silent fail for comments
      }
    }
  }

  console.log(`   ✅ Created ${commentCount} comments\n`);
}

/**
 * Create likes on articles
 */
async function createLikes(users, articles) {
  log('❤️  Creating likes...');
  let likeCount = 0;

  // Each user likes 20-50% of articles
  for (const user of users) {
    const likedArticles = pickRandomSubset(
      articles,
      Math.floor(articles.length * (0.2 + Math.random() * 0.3))
    );

    for (const article of likedArticles) {
      try {
        await strapi.documents('api::like.like').create({
          data: {
            user: user.id,
            article: article.documentId,
            publishedAt: new Date(),
          },
        });
        likeCount++;
      } catch (error) {
        // Silent fail for duplicates
      }
    }
  }

  console.log(`   ✅ Created ${likeCount} likes\n`);
}

/**
 * Create bookmarks on articles
 */
async function createBookmarks(users, articles) {
  log('🔖 Creating bookmarks...');
  let bookmarkCount = 0;

  // Each user bookmarks 10-30% of articles
  for (const user of users) {
    const bookmarkedArticles = pickRandomSubset(
      articles,
      Math.floor(articles.length * (0.1 + Math.random() * 0.2))
    );

    for (const article of bookmarkedArticles) {
      try {
        await strapi.documents('api::bookmark.bookmark').create({
          data: {
            user: user.id,
            article: article.documentId,
            publishedAt: new Date(),
          },
        });
        bookmarkCount++;
      } catch (error) {
        // Silent fail for duplicates
      }
    }
  }

  console.log(`   ✅ Created ${bookmarkCount} bookmarks\n`);
}

/**
 * Create follow relationships between users
 */
async function createFollows(users) {
  log('👤 Creating follows...');
  let followCount = 0;

  // Each user follows 20-50% of other users
  for (const follower of users) {
    const otherUsers = users.filter((u) => u.id !== follower.id);
    const followedUsers = pickRandomSubset(
      otherUsers,
      Math.floor(otherUsers.length * (0.2 + Math.random() * 0.3))
    );

    for (const following of followedUsers) {
      try {
        await strapi.documents('api::follow.follow').create({
          data: {
            follower: follower.id,
            following: following.id,
            publishedAt: new Date(),
          },
        });
        followCount++;
      } catch (error) {
        // Silent fail for duplicates
      }
    }
  }

  console.log(`   ✅ Created ${followCount} follows\n`);
}

/**
 * Update denormalized count fields on articles
 */
async function updateArticleCounts(articles) {
  log('📊 Updating article counts...');

  for (const article of articles) {
    try {
      // Count related entities
      const [likesCount, commentsCount, bookmarksCount] = await Promise.all([
        strapi.db.query('api::like.like').count({
          where: { article: { documentId: article.documentId } },
        }),
        strapi.db.query('api::comment.comment').count({
          where: { article: { documentId: article.documentId } },
        }),
        strapi.db.query('api::bookmark.bookmark').count({
          where: { article: { documentId: article.documentId } },
        }),
      ]);

      // Update article with counts
      await strapi.documents('api::article.article').update({
        documentId: article.documentId,
        data: {
          likesCount,
          commentsCount,
          bookmarksCount,
        },
      });
    } catch (error) {
      // Silent fail for count updates
    }
  }

  console.log(`   ✅ Updated counts for ${articles.length} articles\n`);
}

/**
 * Update denormalized usage count on tags
 */
async function updateTagCounts(tags) {
  log('📊 Updating tag usage counts...');

  for (const tag of tags) {
    try {
      // Count articles using this tag
      const usageCount = await strapi.db
        .query('api::article.article')
        .count({
          where: {
            tags: {
              documentId: tag.documentId,
            },
          },
        });

      // Update tag with count
      await strapi.documents('api::tag.tag').update({
        documentId: tag.documentId,
        data: {
          usageCount,
        },
      });
    } catch (error) {
      // Silent fail for count updates
    }
  }

  console.log(`   ✅ Updated usage counts for ${tags.length} tags\n`);
}

// ============================================================================
// Utility Functions
// ============================================================================

function generateTitle() {
  const templates = [
    () => `The Ultimate Guide to ${faker.hacker.noun()}`,
    () => `10 Things About ${faker.hacker.ingverb()} ${faker.hacker.noun()}`,
    () =>
      `How to Master ${faker.hacker.ingverb()} in ${new Date().getFullYear()}`,
    () => `${faker.hacker.noun()} Best Practices for Developers`,
    () => `Understanding ${faker.hacker.adjective()} ${faker.hacker.noun()}`,
  ];
  return pickRandom(templates)();
}

function generateContent() {
  return (
    `<h2>Introduction</h2>\n<p>${faker.lorem.paragraphs(2)}</p>\n` +
    `<h2>${faker.lorem.words(3)}</h2>\n<p>${faker.lorem.paragraphs(2)}</p>\n` +
    `<h2>Conclusion</h2>\n<p>${faker.lorem.paragraph()}</p>`
  );
}

function generateRandomDate() {
  const now = Date.now();
  const yearAgo = now - 365 * 24 * 60 * 60 * 1000;
  return new Date(yearAgo + Math.random() * (now - yearAgo));
}

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function pickRandomSubset(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

function log(message) {
  if (ENABLE_LOGGING) {
    console.log(message);
  }
}

function logSection(title) {
  if (ENABLE_LOGGING) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`  ${title}`);
    console.log(`${'='.repeat(60)}\n`);
  }
}

// ============================================================================
// Execute
// ============================================================================

seedSocialData().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
