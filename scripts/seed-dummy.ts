/**
 * Loads the reference site's dummy content (https://jivo-energy-news-development.vercel.app)
 * so every section renders the same stories, images and order.
 *
 *   npm run seed:dummy
 *
 * - Creates the reference articles, with topic, summary, countries, images and
 *   "x min ago" publish times. Articles that already exist (matched by title)
 *   only get their empty fields filled, plus the reference's publish time.
 * - Fills empty story picks on the "home" Page.
 * - Orders the seeded insights, videos, projects and companies like the
 *   reference by setting their publish times.
 *
 * Run `npm run seed` first. Not meant for production.
 */
import fs from 'node:fs';
import path from 'node:path';
import { compileStrapi, createStrapi } from '@strapi/strapi';
import type { Core } from '@strapi/strapi';
import * as REF from './reference-content';

const IMAGES_DIR = path.resolve(
  process.env.SEED_IMAGES_DIR ?? path.join(__dirname, '..', '..', 'africa-energy-news', 'public', 'images')
);
const MIME: Record<string, string> = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };
const ARTICLE = 'api::article.article';

let strapi: Core.Strapi;
const log: Record<string, number> = {};
const count = (key: string) => (log[key] = (log[key] ?? 0) + 1);

const slugify = (value: string) =>
  value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);

async function uploadImage(src: string, alt: string) {
  const rel = src.replace(/^\/images\//, '');
  const name = path.basename(rel);
  const existing = await strapi.db.query('plugin::upload.file').findOne({ where: { name } });
  if (existing) return existing.id as number;
  const filepath = path.join(IMAGES_DIR, rel);
  if (!fs.existsSync(filepath)) return null;
  const [file] = await strapi.plugin('upload').service('upload').upload({
    data: { fileInfo: { name, alternativeText: alt, caption: alt } },
    files: {
      filepath,
      originalFilename: name,
      mimetype: MIME[path.extname(name).toLowerCase()] ?? 'application/octet-stream',
      size: fs.statSync(filepath).size,
    },
  });
  count('images');
  return file.id as number;
}

// ------------------------------------------------------------- article specs

type Spec = {
  title: string;
  kicker?: string;
  dek?: string;
  markets?: string;
  author?: string;
  minutesAgo?: number;
  banner?: string;
  thumbnail?: string;
};

const AUTHORS = ['Amara Chukwu', 'Naledi Mokoena', 'Wanjiku Kariuki', 'Daniel Bekele'];

function parseAgo(text: string) {
  const m = text.match(/(\d+)\s*(min|hr)/);
  if (m) return Number(m[1]) * (m[2] === 'hr' ? 60 : 1);
  if (/yesterday/i.test(text)) return 26 * 60;
  const d = text.match(/(\d+)\s*days?/);
  return d ? Number(d[1]) * 24 * 60 : undefined;
}

// "42 min ago · Egypt" or "By Name · 6 hr ago · Nigeria · Ghana"
function parseMeta(meta: string) {
  const parts = meta.split(' · ').map((part) => part.trim());
  const author = parts[0]?.startsWith('By ') ? parts.shift()!.slice(3) : undefined;
  const ago = parts.length ? parseAgo(parts[0]) : undefined;
  if (ago !== undefined) parts.shift();
  return { author, minutesAgo: ago, markets: parts.join(' · ') || undefined };
}

const specs = new Map<string, Spec>();
function add(spec: Spec) {
  const current = specs.get(spec.title) ?? { title: spec.title };
  for (const [key, value] of Object.entries(spec)) {
    if (value !== undefined && value !== '' && (current as any)[key] === undefined) (current as any)[key] = value;
  }
  specs.set(spec.title, current);
}

const LEAD = REF.LEAD_STORY;
add({
  title: LEAD.title, kicker: 'SOLAR', dek: LEAD.dek, markets: LEAD.markets, author: LEAD.author,
  minutesAgo: 18, banner: LEAD.image, thumbnail: LEAD.image,
});
for (const s of REF.LATEST_STORIES) add({ title: s.title, kicker: s.kicker, thumbnail: s.image, ...parseMeta(s.meta) });
for (const s of REF.RELATED_NEWS) add({ title: s.title, kicker: s.kicker, dek: s.dek, thumbnail: s.image });
for (const s of REF.WHAT_MATTERS) add({ title: s.title, kicker: s.kicker, dek: s.dek, banner: s.image });
for (const s of REF.NEWS_RELATED) add({ title: s.title, kicker: s.kicker, thumbnail: s.image, ...parseMeta(s.meta) });
for (const s of REF.NEWS_LATEST) add({ title: s.title, kicker: s.kicker, dek: s.dek, banner: s.image, ...parseMeta(s.byline) });
for (const s of REF.NEWS_CARDS) add({ title: s.title, kicker: s.kicker, dek: s.dek, banner: s.image });
for (const desk of REF.AFRICA_TIMES) for (const s of desk.stories) add({ title: s.title, thumbnail: s.image });

// Every article gets a category. Brief items are titled "Topic: …"; the rest
// without a kicker in the reference get one here.
const EXTRA_KICKERS: Record<string, string> = {
  'Corporate offtaker signs 15-year solar PPA for East African hub': 'OFFTAKE',
};
for (const spec of specs.values()) {
  if (spec.kicker) continue;
  const prefix = spec.title.match(/^(\w+):\s/)?.[1];
  spec.kicker = EXTRA_KICKERS[spec.title] ?? (prefix ? prefix.toUpperCase() : undefined);
}

function body(spec: Spec) {
  if (spec.title === LEAD.title) {
    return REF.ARTICLE_BODY.map((block) => `<${block.type}>${block.text}</${block.type}>`).join('\n');
  }
  const where = spec.markets ? ` across ${spec.markets.replace(/ · /g, ', ')}` : ' across African markets';
  return [
    `<p>${spec.dek ?? spec.title + '.'}</p>`,
    `<p>Developers, lenders and policymakers${where} say the move reflects a broader shift from announcements to execution, as financing structures mature and offtakers commit to longer contracts.</p>`,
    '<h2>What happens next</h2>',
    '<p>Sponsors expect further milestones over the coming quarters, with grid access, currency risk and offtaker credit still the main variables for timelines. Africa Energy will follow the story as it develops.</p>',
  ].join('\n');
}

// --------------------------------------------------------------------- run

async function categoryId(title: string | undefined, cache: Map<string, string>) {
  if (!title) return null;
  const key = title.toUpperCase();
  if (cache.has(key)) return cache.get(key)!;
  const docs = strapi.documents('api::category.category' as any);
  let doc: any = await docs.findFirst({ filters: { title: { $eqi: key } }, status: 'draft' } as any);
  if (!doc) {
    doc = await docs.create({ data: { title: key, slug: slugify(key) }, status: 'published' } as any);
    count('categories');
  }
  cache.set(key, doc.documentId);
  return doc.documentId as string;
}

async function setPublishedAt(uid: string, documentId: string, minutesAgo: number) {
  const at = new Date(Date.now() - minutesAgo * 60_000);
  await strapi.db
    .query(uid as any)
    .updateMany({ where: { documentId, publishedAt: { $notNull: true } }, data: { publishedAt: at } });
}

async function seedArticles() {
  const categories = new Map<string, string>();
  const ids = new Map<string, string>();
  const docs = strapi.documents(ARTICLE as any);
  let fallbackAge = 3 * 24 * 60;

  for (const spec of specs.values()) {
    const existing: any = await docs.findFirst({
      filters: { title: { $eq: spec.title } },
      status: 'draft',
      populate: ['banner', 'thumbnail', 'gallery', 'category', 'related_articles'],
    } as any);
    const banner = spec.banner ?? spec.thumbnail;
    const thumbnail = spec.thumbnail ?? spec.banner;

    if (existing) {
      // A real article with this title: only fill what is empty.
      const data: Record<string, unknown> = {};
      if (!existing.short_content && spec.dek) data.short_content = spec.dek;
      if (!existing.markets && spec.markets) data.markets = spec.markets;
      if (!existing.author) data.author = spec.author ?? AUTHORS[ids.size % AUTHORS.length];
      if (!existing.read_time && existing.content) {
        const words = String(existing.content).replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
        data.read_time = Math.max(1, Math.ceil(words / 200));
      }
      if (!existing.category && spec.kicker) data.category = await categoryId(spec.kicker, categories);
      if (!existing.banner && banner) data.banner = await uploadImage(banner, spec.title);
      if (!existing.thumbnail && thumbnail) data.thumbnail = await uploadImage(thumbnail, spec.title);
      if (spec.title === LEAD.title && !existing.gallery?.length) {
        data.gallery = (
          await Promise.all(LEAD.gallery.slice(1).map((g) => uploadImage(g.src, g.alt)))
        ).filter(Boolean);
      }
      if (Object.keys(data).length) {
        // Saving republishes; keep the original publish time unless the
        // reference gives one below.
        const published: any = await docs.findFirst({ filters: { documentId: existing.documentId }, status: 'published' } as any);
        await docs.update({ documentId: existing.documentId, data, status: 'published' } as any);
        if (published?.publishedAt && spec.minutesAgo === undefined) {
          await strapi.db.query(ARTICLE as any).updateMany({
            where: { documentId: existing.documentId, publishedAt: { $notNull: true } },
            data: { publishedAt: published.publishedAt },
          });
        }
        count('articlesFilled');
      }
      // Same story as the reference: use the reference's publish time too.
      if (spec.minutesAgo !== undefined) await setPublishedAt(ARTICLE, existing.documentId, spec.minutesAgo);
      ids.set(spec.title, existing.documentId);
      continue;
    }

    const doc: any = await docs.create({
      data: {
        title: spec.title,
        slug: slugify(spec.title),
        short_content: spec.dek ?? null,
        markets: spec.markets ?? null,
        author: spec.author ?? AUTHORS[ids.size % AUTHORS.length],
        category: await categoryId(spec.kicker, categories),
        banner: banner ? await uploadImage(banner, spec.title) : null,
        thumbnail: thumbnail ? await uploadImage(thumbnail, spec.title) : null,
        gallery:
          spec.title === LEAD.title
            ? (await Promise.all(LEAD.gallery.slice(1).map((g) => uploadImage(g.src, g.alt)))).filter(Boolean)
            : [],
        content: body(spec),
        read_time: spec.title === LEAD.title ? 6 : null,
      },
      status: 'published',
    } as any);
    await setPublishedAt(ARTICLE, doc.documentId, spec.minutesAgo ?? (fallbackAge += 90));
    ids.set(spec.title, doc.documentId);
    count('articles');
  }

  // Related stories on the lead, as in the reference's Related News rail.
  const lead: any = await docs.findFirst({
    filters: { title: { $eq: LEAD.title } }, status: 'draft', populate: ['related_articles'],
  } as any);
  if (lead && !lead.related_articles?.length) {
    const related = [...new Set(REF.RELATED_NEWS.map((s) => ids.get(s.title)).filter(Boolean))];
    await docs.update({ documentId: lead.documentId, data: { related_articles: related }, status: 'published' } as any);
    count('leadRelated');
  }
  return ids;
}

async function seedHomePicks(ids: Map<string, string>) {
  const pages = strapi.documents('api::page.page' as any);
  const home: any = await pages.findFirst({
    filters: { slug: 'home' },
    status: 'draft',
    populate: {
      sections: {
        on: {
          'sections.article-list': { populate: ['articles'] },
          'sections.desk-group': { populate: { desks: { populate: ['articles'] } } },
          'sections.insight-list': { populate: ['insights'] },
        },
      },
    },
  } as any);
  if (!home) return;
  const pick = (titles: readonly { title: string }[]) =>
    [...new Set(titles.map((s) => ids.get(s.title)).filter(Boolean))] as string[];
  const wanted: Record<string, string[]> = {
    'lead-story': pick([LEAD]),
    'what-matters-today': pick(REF.WHAT_MATTERS),
    news: pick(REF.NEWS_CARDS),
  };
  const desks = REF.AFRICA_TIMES.map((desk) => ({ title: desk.title, articles: pick(desk.stories) }));

  let changed = false;
  const sections = (home.sections ?? []).map((section: any) => {
    const out: any = { __component: section.__component, slug: section.slug };
    if (section.__component === 'sections.article-list') {
      const current = (section.articles ?? []).map((a: any) => a.documentId);
      out.articles = current.length ? current : (wanted[section.slug] ?? []);
      if (!current.length && wanted[section.slug]?.length) changed = true;
    } else if (section.__component === 'sections.desk-group') {
      const empty = (section.desks ?? []).every((d: any) => !d.articles?.length);
      out.desks = empty
        ? desks
        : section.desks.map((d: any) => ({ title: d.title, articles: (d.articles ?? []).map((a: any) => a.documentId) }));
      if (empty) changed = true;
    } else if (section.__component === 'sections.insight-list') {
      out.insights = (section.insights ?? []).map((i: any) => i.documentId);
    }
    return out;
  });
  if (!sections.some((s: any) => s.slug === 'news')) {
    sections.splice(3, 0, { __component: 'sections.article-list', slug: 'news', articles: wanted.news });
    changed = true;
  }
  if (changed) {
    await pages.update({ documentId: home.documentId, data: { sections }, status: 'published' } as any);
    count('homePicks');
  }
}

// Newest first = first in the reference's lists.
async function orderByTitle(uid: string, field: string, titles: string[], startMinutes = 60) {
  for (const [index, title] of titles.entries()) {
    const doc: any = await strapi.documents(uid as any).findFirst({ filters: { [field]: { $eq: title } } } as any);
    if (doc) {
      await setPublishedAt(uid, doc.documentId, startMinutes + index * 60);
      count(`ordered:${uid.split('.').pop()}`);
    }
  }
}

async function seedOrder() {
  await orderByTitle('api::insight.insight', 'title', [
    'How solar panels turn sunlight into usable electricity',
    'How batteries keep solar energy available after sunset',
    'How smart grids balance changing renewable power',
    'Solar panels explained: cells, modules and inverters',
    'How home batteries extend solar use into the night',
    'What happens to solar generation on cloudy days?',
    'Can wind and solar power a grid around the clock?',
    'Africa Solar Market Outlook',
    'Africa Battery Storage Outlook 2026',
    'Africa Renewable Energy Investment Report',
    'Africa Green Hydrogen Outlook',
    'Mission 300 is a capital stack, not a slogan',
    'Why transmission, not generation, is the 2026 bottleneck',
    'West Africa’s solar close is a template, not an outlier',
  ]);
  await orderByTitle('api::video.video', 'title', [
    ...REF.REELS.map((r) => r.title),
    ...REF.VIDEOS.map((v) => v.title),
  ]);
  await orderByTitle('api::project.project', 'name', [
    'Dodoma Solar PV', 'Karoo Wind Extension', 'Lagos Grid Storage I', 'Suez Hydrogen Hub',
    'Rift Valley Expansion', 'Copperbelt Solar Park', 'Tsau Khaeb Green H2', 'Aysha Wind Corridor',
  ]);
  await orderByTitle('api::company.company', 'name', [
    'Scatec', 'Globeleq', 'KenGen', 'Eskom', 'African Development Bank', 'World Bank / IFC',
    'TotalEnergies', 'CrossBoundary Energy',
  ]);
  // "Updated" column on Projects, as in the reference.
  const updated: Record<string, number> = {
    'Dodoma Solar PV': 2, 'Karoo Wind Extension': 1, 'Lagos Grid Storage I': 1, 'Suez Hydrogen Hub': 3,
    'Rift Valley Expansion': 4, 'Copperbelt Solar Park': 5, 'Tsau Khaeb Green H2': 7, 'Aysha Wind Corridor': 7,
  };
  for (const [name, days] of Object.entries(updated)) {
    await strapi.db.query('api::project.project' as any).updateMany({
      where: { name }, data: { updatedAt: new Date(Date.now() - days * 86_400_000) },
    });
  }
}

(async () => {
  strapi = await createStrapi(await compileStrapi()).load();
  try {
    const ids = await seedArticles();
    await seedHomePicks(ids);
    await seedOrder();
    console.log('Dummy data loaded:', log);
  } catch (error: any) {
    console.error('Dummy seed failed:', error?.details ? JSON.stringify(error.details) : error);
    process.exitCode = 1;
  } finally {
    await strapi.destroy();
    process.exit();
  }
})();
