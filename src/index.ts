import type { Core } from '@strapi/strapi';

const ARTICLE_UID = 'api::article.article';

// Content types the website renders; a change to any of them refreshes its cache.
const WEBSITE_UIDS = new Set<string>([ARTICLE_UID, 'api::category.category', 'api::ticker.ticker']);

const WRITE_ACTIONS = new Set<string>([
  'create',
  'update',
  'delete',
  'publish',
  'unpublish',
  'discardDraft',
]);

const WORDS_PER_MINUTE = 200;

function estimateReadTime(html: string) {
  const words = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

async function notifyWebsite(strapi: Core.Strapi) {
  const url = process.env.WEBSITE_REVALIDATE_URL;
  const secret = process.env.WEBSITE_REVALIDATE_SECRET;
  if (!url || !secret) return;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'x-revalidate-secret': secret },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      strapi.log.warn(`Website revalidation failed (${response.status})`);
    }
  } catch (error) {
    strapi.log.warn(`Website revalidation failed: ${(error as Error).message}`);
  }
}

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    strapi.documents.use(async (context, next) => {
      if (!WEBSITE_UIDS.has(context.uid) || !WRITE_ACTIONS.has(context.action)) {
        return next();
      }

      const data = (context.params as { data?: Record<string, unknown> }).data;
      if (
        context.uid === ARTICLE_UID &&
        data &&
        typeof data.content === 'string' &&
        (data.read_time === undefined || data.read_time === null)
      ) {
        data.read_time = estimateReadTime(data.content);
      }

      const result = await next();
      // Don't hold up the editor's save on the website's response.
      void notifyWebsite(strapi);
      return result;
    });
  },

  bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {},
};
