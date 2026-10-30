/**
 * Imports news articles from article_data/ as drafts: the Markdown file
 * holds one story per heading (with Date, Location and Source lines), and the
 * image folder holds its pictures, in a folder named after the story's
 * position (1, 2, ...) or its project (a random one is the banner and
 * thumbnail, the rest go in the content).
 *
 * Safe to re-run: articles are matched by slug and skipped when they exist.
 * Uploaded files land in public/uploads and are also copied to the
 * server-uploads folder so they can be put on the server.
 *
 *   npx tsx scripts/import-articles.ts            # import
 *   DRY_RUN=1 npx tsx scripts/import-articles.ts  # parse and report only
 *
 *   ARTICLE_MD=Africa_Energy_article_new.md ARTICLE_IMAGES=new_articles_image \
 *   ARTICLE_UPLOADS=news_server_uploads npx tsx scripts/import-articles.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
// @ts-ignore -- markdown-it ships without types
import MarkdownIt from 'markdown-it';
import { compileStrapi, createStrapi } from '@strapi/strapi';
import type { Core } from '@strapi/strapi';

const DATA_DIR = path.resolve(process.env.ARTICLE_DATA_DIR ?? path.join(__dirname, '..', '..', 'article_data'));
const MD_FILE = path.join(DATA_DIR, process.env.ARTICLE_MD ?? 'Africa_Energy_Articles.md');
const IMAGE_DIR = path.join(DATA_DIR, process.env.ARTICLE_IMAGES ?? 'africa_energy_article_image/Articles');
const RESIZED_DIR = path.join(DATA_DIR, '.resized');
const SERVER_UPLOADS_DIR = path.join(DATA_DIR, process.env.ARTICLE_UPLOADS ?? 'server-uploads');
const DRY_RUN = Boolean(process.env.DRY_RUN);

// Title keyword -> [category slug, image folder]. A folder named after the
// story's position wins over the one named here.
const STORIES: [RegExp, string, string][] = [
  [/Noor Midelt/, 'solar', 'Noor Midelt I'],
  [/Maamba/, 'solar', 'Maamba Solar Project'],
  [/Ituka/, 'solar', 'Ituka Solar Project'],
  [/Comoros/, 'solar', 'Comoros'],
  [/Poro Solar/, 'investment', 'Côte d’Ivoire'],
  [/Tunisia/, 'solar', 'Tunisia'],
  [/Shukeir/, 'wind', 'Shukeir Wind Project'],
  [/Boujmil/, 'wind', 'Boujmil Wind Farm'],
  [/Masaiti/, 'wind', 'Masaiti Wind Project'],
  [/Plaine-des-Roches/, 'wind', 'Plaine-des-Roches'],
  [/Benguerir/, 'battery-storage', 'Battery Storage System at Benguerir Mine'],
  [/Hydra/, 'battery-storage', 'Hydra Hybrid Project'],
  [/Kamoa/, 'solar', 'Kamoa Copper'],
  [/eSAF/, 'green-hydrogen', 'eSAF Project'],
  [/Coega/, 'green-hydrogen', 'Coega Green Ammonia Project '],
  [/Saldanha/, 'green-hydrogen', 'Saldanha Hydrogen DRI Project'],
  [/Continental Electricity Market/, 'policy', ''],
  [/EnDev/, 'policy', ''],
  [/Kafue/, 'solar', ''],
  [/Tenders for 200 MWp Solar/, 'solar', ''],
  [/Niger State/, 'solar', ''],
  [/ECOWAS/, 'policy', ''],
  [/Green Hydrogen Projects Across/, 'green-hydrogen', ''],
  [/25-Year PPA for (Planned )?500 MW/, 'offtake', ''],
  [/Djibouti/, 'solar', ''],
  [/Electricity Pricing/, 'policy', ''],
  [/Power Sector Reforms/, 'policy', ''],
  [/Eskom/, 'policy', ''],
  [/Exergy/, 'investment', ''],
  [/Gassi/, 'investment', ''],
];

// Countries created (and published) when a story needs one the CMS lacks.
const NEW_COUNTRY_REGIONS: Record<string, string> = {
  Djibouti: 'East Africa',
  Chad: 'Central Africa',
};

let strapi: Core.Strapi;
const md = new MarkdownIt({ html: false, linkify: false, typographer: false });

const clean = (s = '') => s.replace(/\s+/g, ' ').trim();
const unescape = (s: string) => s.replace(/\\(.)/g, '$1');
const stripMd = (s: string) => clean(unescape(s).replace(/\*\*/g, '').replace(/^#+\s*/, ''));
const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

type Story = {
  index: number;
  title: string;
  slug: string;
  date: string;
  location: string;
  country: string;
  category: string;
  bodyMd: string;
  sources: { url: string; label: string }[];
  images: string[];
};

function loadStories(): Story[] {
  const lines = fs.readFileSync(MD_FILE, 'utf8').split('\n');
  // A story starts at a heading followed by its Date or Location line; other
  // headings are subheadings inside the story.
  const starts = lines
    .map((l, i) => (/^#{1,3}\s/.test(l) && lines.slice(i + 1, i + 5).some((n) => /^\s*\*\*(Date|Location):?\*\*/.test(n)) ? i : -1))
    .filter((i) => i >= 0);

  return starts.map((start, i) => {
    const title = stripMd(lines[start]);
    const block = lines.slice(start + 1, starts[i + 1] ?? lines.length);
    const field = (name: string) => {
      const line = block.find((l) => new RegExp(`^\\*\\*${name}:?\\*\\*`).test(l.trim()));
      return line ? stripMd(line.replace(new RegExp(`^\\s*\\*\\*${name}:?\\*\\*:?`), '')) : '';
    };
    // Sources start at a "Source:" label (sometimes misspelt) or, when there
    // is none, at the first line that is only a link.
    const sourceAt = block.findIndex((l) => /^(\*\*)?sou?r?ces?:/i.test(l.trim()) || /^\*\*sou?r?ce/i.test(l.trim()) || /^\[(\*\*)?https?\\?:/.test(l.trim()));
    const sources = new Map<string, string>();
    for (const m of block.slice(sourceAt < 0 ? block.length : sourceAt).join('\n').matchAll(/\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g)) {
      const url = cleanUrl(m[2]);
      if (!sources.has(url)) sources.set(url, sourceLabel(m[1], url));
    }
    const bodyMd = block
      .slice(0, sourceAt < 0 ? block.length : sourceAt)
      .filter((l) => !/^\s*\*\*(Date|Location):?\*\*/.test(l))
      .join('\n')
      .trim();

    const story = STORIES.find(([re]) => re.test(title));
    if (!story) throw new Error(`No category/image mapping for "${title}"`);
    const numbered = path.join(IMAGE_DIR, String(i + 1));
    const dir = fs.existsSync(numbered) ? numbered : path.join(IMAGE_DIR, story[2]);
    const images = fs.existsSync(dir)
      ? fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f)).sort().map((f) => path.join(dir, f))
      : [];
    const location = field('Location');

    return {
      index: i + 1,
      title,
      slug: slugify(title),
      date: field('Date'),
      location,
      country: clean(location.split(',').pop()).replace(/^northern\s+/i, ''),
      category: story[1],
      bodyMd,
      sources: [...sources].map(([url, label]) => ({ url, label })),
      images,
    };
  });
}

// Drops tracking parameters and unwraps links pasted as Google searches.
function cleanUrl(raw: string) {
  const url = new URL(raw.replace(/\\/g, ''));
  const wrapped = url.hostname.endsWith('google.com') && url.pathname === '/search' && url.searchParams.get('q');
  if (wrapped && /^https?:\/\//.test(wrapped)) return cleanUrl(wrapped);
  for (const key of [...url.searchParams.keys()]) if (/^utm_/.test(key)) url.searchParams.delete(key);
  return url.toString();
}

// The link text when it names the source, otherwise the site's domain.
function sourceLabel(text: string, url: string) {
  const label = stripMd(text);
  return label && !/^https?:/.test(label) ? label : new URL(url).hostname.replace(/^www\./, '');
}

function altFromFile(file: string, title: string) {
  const base = path.basename(file).replace(/(\.[a-z]+)+$/i, '');
  // Camera/CDN names say nothing; fall back to the headline.
  if (/^[\d_\-]+(EDT_image_\d+|_n)?$|^(DSC|Screenshot|Web-Images|Website-blog|cover-image|viber-image)/i.test(base)) return title;
  const text = base.replace(/[-_]+/g, ' ').replace(/\s+\d+$/, '').trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Small seeded RNG so re-runs pick the same banner.
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

// A random image becomes the banner; all the others go in the content.
function shuffleImages(story: Story) {
  const pool = [...story.images];
  const rand = rng(story.index * 7919);
  const picked: string[] = [];
  while (pool.length) picked.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
  return picked;
}

function resize(file: string, slug: string, n: number) {
  fs.mkdirSync(RESIZED_DIR, { recursive: true });
  const out = path.join(RESIZED_DIR, `${slug.slice(0, 60)}-${n}.jpg`);
  if (!fs.existsSync(out)) {
    try {
      execFileSync('vipsthumbnail', [file, '--size', '1920x>', '-o', `${out}[Q=82,strip]`], { stdio: 'ignore' });
    } catch {
      // vips cannot read every AVIF; ImageMagick can.
      execFileSync('magick', [file, '-resize', '1920x>', '-quality', '82', '-strip', out], { stdio: 'ignore' });
    }
  }
  return out;
}

async function uploadImage(file: string, alt: string) {
  const name = path.basename(file);
  const existing = await strapi.db.query('plugin::upload.file').findOne({ where: { name } });
  if (existing) return existing;
  const [uploaded] = await strapi.plugin('upload').service('upload').upload({
    data: { fileInfo: { name, alternativeText: alt, caption: '' } },
    files: { filepath: file, originalFilename: name, mimetype: 'image/jpeg', size: fs.statSync(file).size },
  });
  // Copy the original and every generated size for the server.
  fs.mkdirSync(SERVER_UPLOADS_DIR, { recursive: true });
  const urls = [uploaded.url, ...Object.values(uploaded.formats ?? {}).map((f: any) => f.url)];
  for (const url of urls) {
    const src = path.join(strapi.dirs.static.public, url);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(SERVER_UPLOADS_DIR, path.basename(url)));
  }
  return uploaded;
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

const figure = (file: { url: string; alternativeText?: string; width?: number; height?: number }) =>
  `<figure class="image"><img src="${file.url}" alt="${escapeHtml(file.alternativeText ?? '')}"` +
  `${file.width ? ` width="${file.width}" height="${file.height}"` : ''}></figure>`;

// Images go after the paragraphs about one third and two thirds of the way
// through. Sources are parsed only to cut them from the body, not shown.
function buildContent(story: Story, images: { url: string }[]) {
  const paragraphs = md.render(unescape(story.bodyMd).replace(/^#{1,4}\s+(.+)$/gm, (_l, h: string) => `## ${h.replace(/\*\*/g, '')}`)).split(/(?<=<\/p>)\n?/).filter((p: string) => p.trim());
  const slots = images.map((_, i) => Math.max(1, Math.round(((i + 1) * paragraphs.length) / (images.length + 1))));
  for (let i = images.length - 1; i >= 0; i--) paragraphs.splice(slots[i], 0, figure(images[i] as any));
  return paragraphs.join('\n');
}

const firstParagraph = (bodyMd: string) => clean(unescape(bodyMd.split(/\n\s*\n/)[0]).replace(/\*\*/g, ''));
const readTime = (text: string) => Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 200));

async function run() {
  const stories = loadStories();
  console.log(`Parsed ${stories.length} stories.`);
  for (const s of stories) {
    console.log(`  ${s.index}. ${s.slug} | ${s.category} | ${s.country} | ${s.date} | ${s.images.length} images | ${s.sources.length} sources`);
  }
  if (DRY_RUN) return;

  strapi = await createStrapi(await compileStrapi()).load();
  try {
    const categories = new Map<string, string>();
    for (const c of await strapi.documents('api::category.category').findMany({ limit: 100 } as any)) {
      categories.set(c.slug as string, c.documentId);
    }
    const countryKey = (name: string) => name.toLowerCase().replace(/[’‘]/g, "'");
    const countries = new Map<string, string>();
    for (const c of await strapi.documents('api::country.country').findMany({ limit: 200, status: 'draft' } as any)) {
      countries.set(countryKey((c as any).name), c.documentId);
    }
    for (const name of new Set(stories.map((s) => s.country))) {
      const region = NEW_COUNTRY_REGIONS[name];
      if (countries.has(countryKey(name)) || !region) continue;
      const c = await strapi.documents('api::country.country').create({ data: { name, slug: slugify(name), region }, status: 'published' } as any);
      countries.set(countryKey(name), c.documentId);
      console.log(`  created country ${name} (${region})`);
    }

    for (const s of stories) {
      const existing = await strapi.documents('api::article.article').findFirst({ filters: { slug: s.slug }, status: 'draft' });
      if (existing) { console.log(`  skip ${s.slug} (exists)`); continue; }

      const files = [];
      for (const [n, img] of shuffleImages(s).entries()) {
        files.push(await uploadImage(resize(img, s.slug, n + 1), altFromFile(img, s.title)));
      }
      const [banner, ...inline] = files;
      const country = countries.get(countryKey(s.country));

      await strapi.documents('api::article.article').create({
        data: {
          title: s.title,
          slug: s.slug,
          short_content: firstParagraph(s.bodyMd),
          content: buildContent(s, inline),
          banner: banner?.id ?? null,
          thumbnail: banner?.id ?? null,
          read_time: readTime(s.bodyMd),
          markets: s.country,
          category: categories.get(s.category) ?? null,
          country: country ?? null,
          faqs: [],
        } as any,
      });
      console.log(`  created ${s.slug} (${files.length} images${country ? '' : `, no country "${s.country}" in CMS`})`);
    }
  } finally {
    await strapi.destroy();
  }
}

run()
  .catch((error) => {
    console.error('Import failed:', error?.details ? JSON.stringify(error.details) : error);
    process.exitCode = 1;
  })
  .finally(() => process.exit());
