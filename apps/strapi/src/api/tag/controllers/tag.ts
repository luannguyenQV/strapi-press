/**
 * tag controller
 */

import { factories } from '@strapi/strapi';

// Helper function to normalize tag name
function normalizeTagName(name: string): string {
  return name.trim().toLowerCase();
}

// Helper function to sanitize tag name
function sanitizeTagName(name: string): string {
  // Remove extra spaces, keep only alphanumeric, spaces, and hyphens
  return name
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
    .substring(0, 30); // Max 30 characters
}

export default factories.createCoreController('api::tag.tag', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to create tags');
    }

    let { name, description, color } = ctx.request.body.data;

    if (!name) {
      return ctx.badRequest('Tag name is required');
    }

    // Sanitize and normalize
    const sanitizedName = sanitizeTagName(name);
    const normalizedName = normalizeTagName(sanitizedName);

    if (!sanitizedName || sanitizedName.length < 1) {
      return ctx.badRequest('Tag name must be at least 1 character');
    }

    // Check for existing tag (case-insensitive)
    const existingTag = await strapi.db.query('api::tag.tag').findOne({
      where: {
        name: {
          $eqi: normalizedName, // Case-insensitive equals
        },
      },
    });

    if (existingTag) {
      // Return existing tag instead of creating duplicate
      return { data: existingTag };
    }

    // Validate color format if provided
    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return ctx.badRequest('Color must be a valid hex color (#RRGGBB)');
    }

    // Create new tag with sanitized name
    ctx.request.body.data = {
      name: sanitizedName,
      description: description || null,
      color: color || null,
      usageCount: 0,
    };

    const response = await super.create(ctx);
    return response;
  },

  // Prevent tag updates and deletes via API
  async update(ctx) {
    return ctx.forbidden('Tags cannot be updated via API');
  },

  async delete(ctx) {
    return ctx.forbidden('Tags cannot be deleted via API');
  },
}));
