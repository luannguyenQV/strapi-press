/**
 * Permission and Role Configuration Seed Script
 *
 * CRITICAL - MANDATORY for system operation
 *
 * This script configures the essential permissions and roles for the social blogging platform.
 * It should be run in ALL environments (development, staging, production).
 *
 * Configured Roles:
 * - Public Role: Read-only access (articles, categories, tags, comments, users)
 * - Authenticated Role: Full CRUD on own content with ownership validation
 * - Default Role: Authenticated (for new user registrations)
 *
 * Features:
 * - Idempotent (safe to run multiple times)
 * - No sample data creation
 * - Production-ready
 * - Fast execution (<5 seconds)
 *
 * Usage:
 *   pnpm seed:permissions              # Run permission configuration
 *   FORCE_RESEED=true pnpm seed:permissions  # Force reconfiguration
 */

const FORCE_RESEED = process.env.FORCE_RESEED === 'true';
const ENABLE_LOGGING = process.env.QUIET !== 'true';

/**
 * Main execution function
 */
async function seedPermissions() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  // Initialize Strapi instance
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  app.log.level = 'error';

  try {
    logSection('🔐 Permission & Role Configuration');
    console.log('Critical system setup for social blogging platform\n');

    // Check if permissions have already been configured
    const shouldSeed = await checkFirstRun();
    if (!shouldSeed && !FORCE_RESEED) {
      console.log('✅ Permissions already configured.');
      console.log('   Use FORCE_RESEED=true to reconfigure.\n');
      return;
    }

    if (FORCE_RESEED) {
      console.log(
        '⚠️  Force reseed enabled - clearing existing permissions...\n'
      );
      await clearExistingPermissions();
    }

    // Configure permissions
    await setPublicPermissions();
    await setAuthenticatedPermissions();
    await setDefaultRole();

    // Mark as complete AFTER all operations succeed
    await markPermissionsComplete();

    logSection('✅ Configuration Complete');
    console.log('🎉 Permissions and roles configured successfully!\n');
    console.log('📍 Configured roles:');
    console.log('   ✓ Public: Read-only access to public content');
    console.log('   ✓ Authenticated: Full CRUD on own content');
    console.log('   ✓ Default: Authenticated (for new registrations)\n');
    console.log('📍 Next steps:');
    console.log('   1. For testing: Run "pnpm seed:social" to add sample data');
    console.log('   2. For production: Your system is ready to use\n');
  } catch (error) {
    console.error(
      '\n❌ Fatal error during permission configuration:',
      error.message
    );
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
 * Check if this is the first run (does NOT set the flag - that happens after success)
 */
async function checkFirstRun() {
  const pluginStore = strapi.store({
    environment: strapi.config.environment,
    type: 'type',
    name: 'setup',
  });
  const permissionsSeedHasRun = await pluginStore.get({
    key: 'permissionsSeedHasRun',
  });
  return !permissionsSeedHasRun;
}

/**
 * Mark permissions as successfully configured (called AFTER completion)
 */
async function markPermissionsComplete() {
  const pluginStore = strapi.store({
    environment: strapi.config.environment,
    type: 'type',
    name: 'setup',
  });
  await pluginStore.set({ key: 'permissionsSeedHasRun', value: true });
}

/**
 * Clear existing permissions (for force reseed)
 */
async function clearExistingPermissions() {
  log('🧹 Clearing existing permissions...');

  const publicRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });

  const authenticatedRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'authenticated' } });

  // Delete all permissions for both roles
  if (publicRole) {
    await strapi.db.query('plugin::users-permissions.permission').deleteMany({
      where: { role: publicRole.id },
    });
  }

  if (authenticatedRole) {
    await strapi.db.query('plugin::users-permissions.permission').deleteMany({
      where: { role: authenticatedRole.id },
    });
  }

  console.log('   ✅ Existing permissions cleared\n');
}

/**
 * Set public permissions for API access (read-only)
 */
async function setPublicPermissions() {
  log('🔐 Setting public permissions...');

  const publicRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({
      where: { type: 'public' },
    });

  const permissions = {
    // Collection types
    article: ['find', 'findOne'],
    category: ['find', 'findOne'],
    tag: ['find', 'findOne'],
    comment: ['find', 'findOne'],
    // Single types (singletons)
    about: ['find'],
    global: ['find'],
    footer: ['find'],
    // Like, Bookmark, Follow require authentication
  };

  const allPermissionsToCreate = [];
  Object.keys(permissions).forEach((controller) => {
    const actions = permissions[controller];
    actions.forEach((action) => {
      allPermissionsToCreate.push(
        strapi.query('plugin::users-permissions.permission').create({
          data: {
            action: `api::${controller}.${controller}.${action}`,
            role: publicRole.id,
          },
        })
      );
    });
  });

  // Add users-permissions user permissions (for viewing profiles)
  allPermissionsToCreate.push(
    strapi.query('plugin::users-permissions.permission').create({
      data: {
        action: 'plugin::users-permissions.user.find',
        role: publicRole.id,
      },
    }),
    strapi.query('plugin::users-permissions.permission').create({
      data: {
        action: 'plugin::users-permissions.user.findOne',
        role: publicRole.id,
      },
    })
  );

  await Promise.all(allPermissionsToCreate);
  console.log('   ✅ Public permissions configured\n');
}

/**
 * Set authenticated user permissions (full CRUD on own content)
 */
async function setAuthenticatedPermissions() {
  log('🔐 Setting authenticated permissions...');

  const authenticatedRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({
      where: { type: 'authenticated' },
    });

  // Content types and their allowed actions
  const permissions = {
    // Collection types - full CRUD for own content
    article: ['find', 'findOne', 'create', 'update', 'delete'],
    category: ['find', 'findOne'],
    tag: ['find', 'findOne', 'create'],
    comment: ['find', 'findOne', 'create', 'update', 'delete'],
    like: ['find', 'findOne', 'create', 'delete'],
    bookmark: ['find', 'findOne', 'create', 'delete'],
    follow: ['find', 'findOne', 'create', 'delete'],
    // Single types (singletons) - read only
    about: ['find'],
    global: ['find'],
    footer: ['find'],
  };

  const allPermissionsToCreate = [];
  Object.keys(permissions).forEach((controller) => {
    const actions = permissions[controller];
    actions.forEach((action) => {
      allPermissionsToCreate.push(
        strapi.query('plugin::users-permissions.permission').create({
          data: {
            action: `api::${controller}.${controller}.${action}`,
            role: authenticatedRole.id,
          },
        })
      );
    });
  });

  // Add users-permissions user permissions
  allPermissionsToCreate.push(
    strapi.query('plugin::users-permissions.permission').create({
      data: {
        action: 'plugin::users-permissions.user.find',
        role: authenticatedRole.id,
      },
    }),
    strapi.query('plugin::users-permissions.permission').create({
      data: {
        action: 'plugin::users-permissions.user.findOne',
        role: authenticatedRole.id,
      },
    }),
    strapi.query('plugin::users-permissions.permission').create({
      data: {
        action: 'plugin::users-permissions.user.me',
        role: authenticatedRole.id,
      },
    })
  );

  await Promise.all(allPermissionsToCreate);
  console.log('   ✅ Authenticated permissions configured\n');
}

/**
 * Set default role for new user registrations
 */
async function setDefaultRole() {
  log('🔐 Setting default role...');

  const authenticatedRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({
      where: { type: 'authenticated' },
    });

  // Get the plugin store for users-permissions
  const pluginStore = strapi.store({
    type: 'plugin',
    name: 'users-permissions',
  });

  // Set authenticated as default role
  await pluginStore.set({
    key: 'advanced',
    value: {
      unique_email: true,
      allow_register: true,
      email_confirmation: false,
      email_reset_password: null,
      email_confirmation_redirection: null,
      default_role: authenticatedRole.id,
    },
  });

  console.log('   ✅ Default role set to Authenticated\n');
}

// ============================================================================
// Utility Functions
// ============================================================================

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

seedPermissions().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
