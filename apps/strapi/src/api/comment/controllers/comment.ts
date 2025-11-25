/**
 * comment controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::comment.comment', ({ strapi }) => ({
  async create(ctx) {
    // Auto-set user to authenticated user
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to comment');
    }

    // Ensure user is set to the authenticated user
    ctx.request.body.data = {
      ...ctx.request.body.data,
      user: user.id,
    };

    const response = await super.create(ctx);
    return response;
  },

  async update(ctx) {
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
