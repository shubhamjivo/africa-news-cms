import type { Core } from '@strapi/strapi';

const ARTICLE_UID = 'api::article.article';

export default {
  /**
   * Publishes draft articles whose "Schedule publish date and time" has
   * passed. Runs every minute.
   */
  publishScheduledArticles: {
    task: async ({ strapi }: { strapi: Core.Strapi }) => {
      const due = await strapi.documents(ARTICLE_UID).findMany({
        status: 'draft',
        filters: { scheduled_publish_at: { $lte: new Date().toISOString() } },
        fields: ['title', 'scheduled_publish_at'],
      });

      for (const article of due) {
        const { documentId } = article;
        try {
          // Clear the schedule first so the published copy matches the draft
          // and the article is not picked up again on the next run.
          await strapi.documents(ARTICLE_UID).update({
            documentId,
            // The generated types don't allow null, which is how a field is emptied.
            data: { scheduled_publish_at: null as unknown as undefined },
          });
          await strapi.documents(ARTICLE_UID).publish({ documentId });
          strapi.log.info(`Published scheduled article "${article.title}" (${documentId})`);
        } catch (error) {
          strapi.log.error(
            `Could not publish scheduled article "${article.title}" (${documentId}): ${(error as Error).message}`,
          );
        }
      }
    },
    options: {
      rule: '* * * * *',
    },
  },
};
