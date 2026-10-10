/**
 * subscriber controller
 */

import { timingSafeEqual } from 'node:crypto';
import { factories } from '@strapi/strapi';

const UID = 'api::subscriber.subscriber';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function secretMatches(given: unknown) {
  // The secret the CMS and the website already share for revalidation.
  const secret = process.env.WEBSITE_REVALIDATE_SECRET;
  if (!secret || typeof given !== 'string') return false;
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export default factories.createCoreController(UID, ({ strapi }) => ({
  // Called by the website's server when a reader submits the Subscribe pop-up.
  // Signing up twice is not an error, and nothing about the list is returned.
  async subscribe(ctx) {
    if (!secretMatches(ctx.request.headers['x-website-secret'])) {
      return ctx.forbidden();
    }

    const body = (ctx.request.body ?? {}) as { email?: unknown; source?: unknown };
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const source = typeof body.source === 'string' ? body.source.trim().slice(0, 60) : '';
    if (email.length > 254 || !EMAIL.test(email)) {
      return ctx.badRequest('A valid email address is required.');
    }

    const existing = await strapi.documents(UID).findFirst({ filters: { email } });
    if (!existing) {
      await strapi.documents(UID).create({ data: { email, source } });
    }
    ctx.body = { ok: true };
  },
}));
