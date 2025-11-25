/**
 *  article controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::article.article', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to create articles');
    }

    // Validate tags limit (max 5)
    const { tags } = ctx.request.body.data;
    if (tags && Array.isArray(tags) && tags.length > 5) {
      return ctx.badRequest('Maximum 5 tags allowed per article');
    }

    // Auto-set author to authenticated user
    ctx.request.body.data = {
      ...ctx.request.body.data,
      author: user.id,
    };

    const response = await super.create(ctx);
    return response;
  },

  async update(ctx) {
    // Validate tags limit (max 5)
    const { tags } = ctx.request.body.data;
    if (tags && Array.isArray(tags) && tags.length > 5) {
      return ctx.badRequest('Maximum 5 tags allowed per article');
    }

    // Ownership validation handled by is-owner policy
    const response = await super.update(ctx);
    return response;
  },

  async delete(ctx) {
    // Ownership validation handled by is-owner policy
    const response = await super.delete(ctx);
    return response;
  },
}));
