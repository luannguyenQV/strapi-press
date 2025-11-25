/**
 * Users & Permissions Plugin Extension
 *
 * Extends the default users-permissions plugin with:
 * - User sanitization (hide private fields)
 * - Auto-assign Edit role on registration
 * - Custom validation for username and displayName
 */

export default (plugin) => {
  // ============================================================================
  // USER SANITIZATION - Hide Private Fields
  // ============================================================================

  /**
   * Sanitize user data by removing private fields
   * Critical for security: email, password, tokens must never be exposed
   */
  const sanitizeUser = (user) => {
    if (!user) return user;

    // Remove private fields
    const sanitized = { ...user };
    delete sanitized.password;
    delete sanitized.resetPasswordToken;
    delete sanitized.confirmationToken;
    delete sanitized.email; // ⚠️ CRITICAL: Never expose email in public API
    delete sanitized.confirmed;
    delete sanitized.blocked;
    delete sanitized.provider;
    delete sanitized.role; // Role is private, but we can expose role.type if needed

    return sanitized;
  };

  // Override the default sanitizeUser method
  const originalSanitizeUser = plugin.services.user.sanitizeUser;
  plugin.services.user.sanitizeUser = (user) => {
    // Call original sanitization first (handles password hashing, etc.)
    const sanitized = originalSanitizeUser ? originalSanitizeUser(user) : user;
    // Then apply our custom sanitization
    return sanitizeUser(sanitized);
  };

  // ============================================================================
  // CUSTOM REGISTRATION CONTROLLER
  // ============================================================================

  const originalRegister = plugin.controllers.auth.register;

  plugin.controllers.auth.register = async (ctx) => {
    const { username, email, password, displayName } = ctx.request.body;

    // Custom validation
    if (!displayName || displayName.trim().length === 0) {
      return ctx.badRequest('Display name is required');
    }

    if (displayName.length > 50) {
      return ctx.badRequest('Display name must be less than 50 characters');
    }

    if (username.length < 3) {
      return ctx.badRequest('Username must be at least 3 characters');
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return ctx.badRequest('Username can only contain letters, numbers, hyphens, and underscores');
    }

    // Find the "Edit" role
    const editRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'edit' } });

    if (!editRole) {
      return ctx.badRequest('Edit role not found. Please create it in admin panel first.');
    }

    // Create user with Edit role
    try {
      const user = await strapi.plugins['users-permissions'].services.user.add({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password,
        displayName: displayName.trim(),
        role: editRole.id,
        confirmed: false, // Require email confirmation
        blocked: false,
        provider: 'local'
      });

      // Generate JWT token
      const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id
      });

      // Send confirmation email (if configured)
      if (strapi.config.get('plugin.users-permissions.email.confirmation.enabled')) {
        await strapi
          .plugin('users-permissions')
          .service('user')
          .sendConfirmationEmail(user);
      }

      // Return sanitized user with token
      ctx.send({
        jwt,
        user: sanitizeUser(user)
      });
    } catch (error) {
      if (error.message.includes('username')) {
        return ctx.badRequest('Username already taken');
      }
      if (error.message.includes('email')) {
        return ctx.badRequest('Email already registered');
      }
      throw error;
    }
  };

  // ============================================================================
  // CUSTOM USER UPDATE CONTROLLER
  // ============================================================================

  const originalUpdate = plugin.controllers.user.update;

  plugin.controllers.user.update = async (ctx) => {
    const { id } = ctx.params;
    const authenticatedUserId = ctx.state.user?.id;

    // Ensure user can only update their own profile
    if (Number(id) !== authenticatedUserId) {
      return ctx.forbidden('You can only update your own profile');
    }

    const { displayName, bio, website, avatar } = ctx.request.body;

    // Validate displayName if provided
    if (displayName !== undefined) {
      if (!displayName || displayName.trim().length === 0) {
        return ctx.badRequest('Display name cannot be empty');
      }
      if (displayName.length > 50) {
        return ctx.badRequest('Display name must be less than 50 characters');
      }
    }

    // Validate bio if provided
    if (bio !== undefined && bio.length > 500) {
      return ctx.badRequest('Bio must be less than 500 characters');
    }

    // Validate website URL if provided
    if (website !== undefined && website.length > 0) {
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(website)) {
        return ctx.badRequest('Website must be a valid URL starting with http:// or https://');
      }
    }

    // Only allow updating specific fields (prevent role/permission escalation)
    const allowedFields = {
      ...(displayName !== undefined && { displayName: displayName.trim() }),
      ...(bio !== undefined && { bio }),
      ...(website !== undefined && { website }),
      ...(avatar !== undefined && { avatar })
    };

    try {
      const updatedUser = await strapi
        .query('plugin::users-permissions.user')
        .update({
          where: { id },
          data: allowedFields
        });

      ctx.send({ user: sanitizeUser(updatedUser) });
    } catch (error) {
      ctx.badRequest('Failed to update profile');
    }
  };

  // ============================================================================
  // ME ENDPOINT - Get Current User
  // ============================================================================

  const originalMe = plugin.controllers.user.me;

  plugin.controllers.user.me = async (ctx) => {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized();
    }

    // Fetch full user data with relations
    const userData = await strapi
      .query('plugin::users-permissions.user')
      .findOne({
        where: { id: user.id },
        populate: ['avatar']
      });

    // For /me endpoint, we can include email since it's the user's own data
    ctx.send({
      id: userData.id,
      username: userData.username,
      email: userData.email, // OK to show email on /me endpoint
      displayName: userData.displayName,
      bio: userData.bio,
      website: userData.website,
      avatar: userData.avatar,
      confirmed: userData.confirmed
    });
  };

  // ============================================================================
  // FIND USERS - Public Profile Listing
  // ============================================================================

  const originalFind = plugin.controllers.user.find;

  plugin.controllers.user.find = async (ctx) => {
    // Call original find
    await originalFind(ctx);

    // Sanitize all users in response
    if (Array.isArray(ctx.body)) {
      ctx.body = ctx.body.map(sanitizeUser);
    }
  };

  // ============================================================================
  // FIND ONE USER - Public Profile
  // ============================================================================

  const originalFindOne = plugin.controllers.user.findOne;

  plugin.controllers.user.findOne = async (ctx) => {
    const { id } = ctx.params;

    const user = await strapi
      .query('plugin::users-permissions.user')
      .findOne({
        where: { id },
        populate: ['avatar']
      });

    if (!user) {
      return ctx.notFound('User not found');
    }

    // Always sanitize (never expose email on public profile)
    ctx.send(sanitizeUser(user));
  };

  return plugin;
};
