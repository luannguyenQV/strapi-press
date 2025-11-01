'use strict';

/**
 * Bulk Article Seed Script for Strapi
 *
 * Generates realistic blog articles with:
 * - Unique titles and slugs (timestamp-based uniqueness)
 * - Random author and category assignment
 * - Rich text content blocks
 * - Batch processing for optimal performance
 * - Comprehensive error handling and progress tracking
 *
 * Usage:
 *   pnpm seed:bulk              # Generate 1000 articles (default)
 *   TOTAL_ARTICLES=100 pnpm seed:bulk    # Generate custom amount
 *   BATCH_SIZE=25 pnpm seed:bulk         # Custom batch size
 */

const { faker } = require('@faker-js/faker');

// Configuration - Can be overridden via environment variables
const TOTAL_ARTICLES = parseInt(process.env.TOTAL_ARTICLES) || 1000;
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE) || 50;
const ENABLE_LOGGING = process.env.QUIET !== 'true';

/**
 * Main execution function
 */
async function generateBulkArticles() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  // Initialize Strapi instance
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  app.log.level = 'error';

  try {
    logSection('Bulk Article Seed Script');
    console.log(`📊 Target: ${TOTAL_ARTICLES} articles`);
    console.log(`📦 Batch size: ${BATCH_SIZE} articles/batch\n`);

    // Step 1: Validate prerequisites
    await validatePrerequisites();

    // Step 2: Fetch existing data
    const { categories, authors } = await fetchExistingData();

    // Step 3: Generate and import articles in batches
    const metrics = await processBatches(categories, authors);

    // Step 4: Display results
    displayResults(metrics);

  } catch (error) {
    console.error('\n❌ Fatal error during bulk import:', error.message);
    console.error(error.stack);
    process.exitCode = 1;
  } finally {
    try {
      // Give database connections time to finish pending operations
      await new Promise(resolve => setTimeout(resolve, 100));

      // Attempt graceful shutdown
      await app.destroy();
    } catch (destroyError) {
      // Suppress expected tarn connection pool cleanup error
      if (destroyError.message !== 'aborted') {
        console.error('⚠️  Cleanup warning:', destroyError.message);
      }
    }

    // Exit with appropriate code
    process.exit(process.exitCode || 0);
  }
}

/**
 * Validate that required data exists
 */
async function validatePrerequisites() {
  log('🔍 Validating prerequisites...');

  const categories = await strapi.documents('api::category.category').findMany();
  const authors = await strapi.documents('api::author.author').findMany();

  if (!categories || categories.length === 0) {
    throw new Error(
      '❌ No categories found! Please run: pnpm seed:example\n' +
      'Categories are required for article creation.'
    );
  }

  if (!authors || authors.length === 0) {
    throw new Error(
      '❌ No authors found! Please run: pnpm seed:example\n' +
      'Authors are required for article creation.'
    );
  }

  console.log(`   ✅ Found ${categories.length} categories`);
  console.log(`   ✅ Found ${authors.length} authors\n`);
}

/**
 * Fetch existing categories and authors
 */
async function fetchExistingData() {
  const categories = await strapi.documents('api::category.category').findMany();
  const authors = await strapi.documents('api::author.author').findMany();

  return { categories, authors };
}

/**
 * Process articles in batches
 */
async function processBatches(categories, authors) {
  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  const totalBatches = Math.ceil(TOTAL_ARTICLES / BATCH_SIZE);

  logSection('Processing Batches');

  for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
    const batchStart = batchNum * BATCH_SIZE;
    const batchEnd = Math.min((batchNum + 1) * BATCH_SIZE, TOTAL_ARTICLES);
    const batchSize = batchEnd - batchStart;

    if (ENABLE_LOGGING) {
      process.stdout.write(
        `📦 Batch ${batchNum + 1}/${totalBatches}: ` +
        `Articles ${batchStart + 1}-${batchEnd}... `
      );
    }

    try {
      // Generate articles for this batch
      const articles = generateArticleBatch(batchStart, batchSize, categories, authors);

      // Import batch in parallel with explicit publish status
      const results = await Promise.allSettled(
        articles.map(article =>
          strapi.documents('api::article.article').create({
            data: article,
            status: 'published', // Explicitly set to published
          })
        )
      );

      // Count successes and failures
      const batchSuccesses = results.filter(r => r.status === 'fulfilled').length;
      const batchFailures = results.filter(r => r.status === 'rejected').length;

      successCount += batchSuccesses;
      errorCount += batchFailures;

      // Collect errors
      results.forEach((result, idx) => {
        if (result.status === 'rejected') {
          errors.push({
            batch: batchNum + 1,
            article: batchStart + idx + 1,
            error: result.reason?.message || 'Unknown error'
          });
        }
      });

      if (ENABLE_LOGGING) {
        const percentage = ((batchEnd / TOTAL_ARTICLES) * 100).toFixed(1);
        console.log(`✅ ${batchSuccesses} created, ${batchFailures} failed (${percentage}%)`);
      }

    } catch (error) {
      console.error(`\n   ❌ Batch ${batchNum + 1} failed:`, error.message);
      errorCount += batchSize;
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  return {
    successCount,
    errorCount,
    duration,
    errors,
    total: TOTAL_ARTICLES
  };
}

/**
 * Generate a batch of articles
 */
function generateArticleBatch(startIndex, batchSize, categories, authors) {
  return Array.from({ length: batchSize }, (_, i) => {
    const articleNumber = startIndex + i + 1;
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomAuthor = authors[Math.floor(Math.random() * authors.length)];
    const isFeatured = Math.random() < 0.1; // 10% chance of being featured

    return {
      title: generateTitle(articleNumber),
      description: generateDescription(),
      slug: generateUniqueSlug(articleNumber),

      // Required relationships (use documentId for Strapi 5)
      category: randomCategory.documentId,
      author: randomAuthor.documentId,

      // Optional fields
      featured: isFeatured,
      cover: null, // Skip cover images for performance

      // Content blocks
      blocks: generateContentBlocks(),

      // Published state (required for articles to appear)
      publishedAt: generateRandomDate(),
    };
  });
}

/**
 * Generate realistic article title
 */
function generateTitle(number) {
  const topics = [
    'React Development',
    'TypeScript',
    'Next.js',
    'Node.js',
    'Web Performance',
    'UI/UX Design',
    'Database Design',
    'API Development',
    'Cloud Computing',
    'DevOps',
    'Microservices',
    'Testing Strategies',
    'Security Best Practices',
    'Agile Methodology',
    'Software Architecture',
    'Machine Learning',
    'Data Science',
    'Mobile Development',
    'System Design',
    'Code Quality'
  ];

  const templates = [
    () => `The Ultimate Guide to ${pickRandom(topics)}`,
    () => `10 Things You Should Know About ${pickRandom(topics)}`,
    () => `How to Master ${pickRandom(topics)} in ${new Date().getFullYear()}`,
    () => `${pickRandom(topics)}: A Comprehensive Overview`,
    () => `Why ${pickRandom(topics)} Matters for Your Success`,
    () => `Understanding ${pickRandom(topics)}: Best Practices and Tips`,
    () => `${pickRandom(topics)} Explained: Everything You Need to Know`,
    () => `Mastering ${pickRandom(topics)}: Advanced Techniques`,
    () => `Getting Started with ${pickRandom(topics)}: A Beginner's Guide`,
    () => `${pickRandom(topics)}: Common Mistakes and How to Avoid Them`
  ];

  return pickRandom(templates)();
}

/**
 * Generate article description (max 150 chars)
 */
function generateDescription() {
  const descriptions = [
    'Learn the essential concepts and best practices that every developer should know.',
    'Discover practical tips and strategies to improve your development workflow.',
    'A comprehensive guide covering everything from basics to advanced techniques.',
    'Explore real-world examples and proven approaches used by industry experts.',
    'Master the fundamentals and unlock your full potential as a developer.',
    'Deep dive into key concepts with hands-on examples and practical insights.',
    'Step-by-step tutorial to help you build production-ready applications.',
    'Industry best practices and patterns for modern software development.',
  ];

  return pickRandom(descriptions);
}

/**
 * Generate unique slug with timestamp and random suffix
 */
function generateUniqueSlug(articleNumber) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `article-${articleNumber}-${timestamp}-${random}`;
}

/**
 * Generate content blocks for article
 */
function generateContentBlocks() {
  const numSections = 3 + Math.floor(Math.random() * 3); // 3-5 sections
  const blocks = [];

  // Introduction
  blocks.push({
    __component: 'shared.rich-text',
    body: `<h2>Introduction</h2>\n<p>${faker.lorem.paragraphs(2)}</p>`
  });

  // Main content sections
  for (let i = 0; i < numSections; i++) {
    const sectionTitle = faker.lorem.sentence().replace('.', '');
    blocks.push({
      __component: 'shared.rich-text',
      body: `<h2>${sectionTitle}</h2>\n<p>${faker.lorem.paragraphs(2)}</p>`
    });
  }

  // Occasionally add a quote (20% chance)
  if (Math.random() < 0.2) {
    blocks.push({
      __component: 'shared.quote',
      title: faker.person.fullName(),
      body: faker.lorem.sentence()
    });
  }

  // Conclusion
  blocks.push({
    __component: 'shared.rich-text',
    body: `<h2>Conclusion</h2>\n<p>${faker.lorem.paragraph()}</p>`
  });

  return blocks;
}

/**
 * Generate random publish date within last year
 */
function generateRandomDate() {
  const now = Date.now();
  const yearAgo = now - (365 * 24 * 60 * 60 * 1000);
  return new Date(yearAgo + Math.random() * (now - yearAgo));
}

/**
 * Display final results
 */
function displayResults(metrics) {
  const { successCount, errorCount, duration, errors, total } = metrics;

  logSection('Results');
  console.log(`✅ Success: ${successCount}/${total} articles created`);
  console.log(`❌ Errors: ${errorCount}/${total} articles failed`);
  console.log(`⏱️  Duration: ${duration}s`);
  console.log(`⚡ Rate: ${(successCount / duration).toFixed(1)} articles/sec`);

  if (errorCount > 0 && errors.length > 0) {
    console.log(`\n⚠️  Error Summary (first 10):`);
    errors.slice(0, 10).forEach(err => {
      console.log(`   Batch ${err.batch}, Article ${err.article}: ${err.error}`);
    });
    if (errors.length > 10) {
      console.log(`   ... and ${errors.length - 10} more errors`);
    }
  }

  console.log('');
}

// ============================================================================
// Utility Functions
// ============================================================================

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function log(message) {
  if (ENABLE_LOGGING) {
    console.log(message);
  }
}

function logSection(title) {
  if (ENABLE_LOGGING) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`  ${title}`);
    console.log(`${'='.repeat(50)}\n`);
  }
}

// ============================================================================
// Execute
// ============================================================================

generateBulkArticles().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
