/**
 * follow controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::follow.follow', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to follow users');
    }

    const { following } = ctx.request.body.data;

    // Prevent self-follow
    if (user.id === following) {
      return ctx.badRequest('You cannot follow yourself');
    }

    // Check if already following
    const existingFollow = await strapi.db.query('api::follow.follow').findOne({
      where: {
        follower: user.id,
        following: following,
      },
    });

    if (existingFollow) {
      return ctx.badRequest('You are already following this user');
    }

    // Auto-set follower to authenticated user
    ctx.request.body.data = {
      ...ctx.request.body.data,
      follower: user.id,
    };

    const response = await super.create(ctx);
    return response;
  },

  async delete(ctx) {
    // Ownership validation handled by is-owner policy
    const response = await super.delete(ctx);
    return response;
  },
}));
