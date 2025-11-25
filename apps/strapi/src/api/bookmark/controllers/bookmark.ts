/**
 * bookmark controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::bookmark.bookmark', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to bookmark');
    }

    const { article } = ctx.request.body.data;

    // Check if user already bookmarked this article
    const existingBookmark = await strapi.db.query('api::bookmark.bookmark').findOne({
      where: {
        user: user.id,
        article: article,
      },
    });

    if (existingBookmark) {
      return ctx.badRequest('You have already bookmarked this article');
    }

    // Auto-set user
    ctx.request.body.data = {
      ...ctx.request.body.data,
      user: user.id,
    };

    // Create the bookmark
    const response = await super.create(ctx);

    // Increment article bookmarksCount
    if (article) {
      await strapi.db.connection.raw(`
        UPDATE articles
        SET bookmarks_count = bookmarks_count + 1
        WHERE id = ?
      `, [article]);
    }

    return response;
  },

  async delete(ctx) {
    const { id } = ctx.params;

    // Get the bookmark to find the article
    const bookmark = await strapi.db.query('api::bookmark.bookmark').findOne({
      where: { id },
      populate: ['article'],
    });

    if (!bookmark) {
      return ctx.notFound('Bookmark not found');
    }

    // Delete the bookmark
    const response = await super.delete(ctx);

    // Decrement article bookmarksCount
    if (bookmark.article?.id) {
      await strapi.db.connection.raw(`
        UPDATE articles
        SET bookmarks_count = GREATEST(bookmarks_count - 1, 0)
        WHERE id = ?
      `, [bookmark.article.id]);
    }

    return response;
  },
}));
