/**
 * Comment lifecycles
 * Manages article.commentsCount denormalized counter
 */

export default {
  async afterCreate(event) {
    const { result } = event;

    if (result && result.article?.id) {
      const articleId = result.article.id;

      // Increment commentsCount
      await strapi.db.connection.raw(`
        UPDATE articles
        SET comments_count = comments_count + 1
        WHERE id = ?
      `, [articleId]);
    }
  },

  async afterDelete(event) {
    const { result } = event;

    if (result && result.article?.id) {
      const articleId = result.article.id;

      // Decrement commentsCount
      await strapi.db.connection.raw(`
        UPDATE articles
        SET comments_count = GREATEST(comments_count - 1, 0)
        WHERE id = ?
      `, [articleId]);
    }
  },
};
