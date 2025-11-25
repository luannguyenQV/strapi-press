/**
 * like controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::like.like', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to like');
    }

    const { article } = ctx.request.body.data;

    // Check if user already liked this article
    const existingLike = await strapi.db.query('api::like.like').findOne({
      where: {
        user: user.id,
        article: article,
      },
    });

    if (existingLike) {
      return ctx.badRequest('You have already liked this article');
    }

    // Auto-set user
    ctx.request.body.data = {
      ...ctx.request.body.data,
      user: user.id,
    };

    // Create the like
    const response = await super.create(ctx);

    // Increment article likesCount
    if (article) {
      await strapi.db.connection.raw(`
        UPDATE articles
        SET likes_count = likes_count + 1
        WHERE id = ?
      `, [article]);
    }

    return response;
  },

  async delete(ctx) {
    const { id } = ctx.params;

    // Get the like to find the article
    const like = await strapi.db.query('api::like.like').findOne({
      where: { id },
      populate: ['article'],
    });

    if (!like) {
      return ctx.notFound('Like not found');
    }

    // Delete the like
    const response = await super.delete(ctx);

    // Decrement article likesCount
    if (like.article?.id) {
      await strapi.db.connection.raw(`
        UPDATE articles
        SET likes_count = GREATEST(likes_count - 1, 0)
        WHERE id = ?
      `, [like.article.id]);
    }

    return response;
  },
}));
