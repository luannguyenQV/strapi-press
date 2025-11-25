/**
 * is-owner policy
 *
 * Validates that the authenticated user owns the resource they're trying to modify.
 * Applied to: Article (author), Comment, Like, Bookmark, Follow
 */

export default (policyContext, config, { strapi }) => {
  const { params } = policyContext;
  const user = policyContext.state.user;

  // User must be authenticated
  if (!user) {
    return false;
  }

  // For create operations, ownership is handled in the controller
  // This policy is for update/delete operations
  if (!params.id) {
    return true;
  }

  return {
    async beforeEvaluate() {
      // Fetch the resource being accessed
      const { id } = params;
      const resourceId = policyContext.request.route.info.apiName;
      const contentType = `api::${resourceId}.${resourceId}`;

      try {
        const entity = await strapi.entityService.findOne(contentType, id as string, {
          fields: ['id'],
          populate: {
            user: { fields: ['id'] },
            author: { fields: ['id'] },
            follower: { fields: ['id'] },
          },
        });

        if (!entity) {
          return false;
        }

        // Check ownership based on content type
        // Article uses 'author', others use 'user', Follow uses 'follower'
        const ownerId = entity.author?.id || entity.user?.id || entity.follower?.id;

        return ownerId === user.id;
      } catch (error) {
        strapi.log.error('is-owner policy error:', error);
        return false;
      }
    },
  };
};
