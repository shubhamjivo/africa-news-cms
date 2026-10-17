/**
 * Imports the Learning Center insights from insight_data/ as drafts:
 * the CSV gives title, slug and SEO, the Markdown file gives the content,
 * and image/<n>/ gives the pictures for the n-th article (one cover, two
 * in the content).
 *
 * Safe to re-run: insights are matched by slug and skipped when they exist.
 * Uploaded files land in public/uploads and are also copied to
 * insight_data/server-uploads so they can be put on the server.
 *
 *   npx tsx scripts/import-insights.ts            # import
 *   DRY_RUN=1 npx tsx scripts/import-insights.ts  # parse and report only
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
// @ts-ignore -- markdown-it ships without types
import MarkdownIt from 'markdown-it';
import { compileStrapi, createStrapi } from '@strapi/strapi';
import type { Core } from '@strapi/strapi';

const DATA_DIR = path.resolve(process.env.INSIGHT_DATA_DIR ?? path.join(__dirname, '..', '..', 'insight_data'));
const CSV_FILE = path.join(DATA_DIR, 'Africa Energy News Blogs - Sheet1.csv');
const MD_FILE = path.join(DATA_DIR, 'Africa Energy Blogs (Monika).md');
const IMAGE_DIR = path.join(DATA_DIR, 'image');
const RESIZED_DIR = path.join(DATA_DIR, '.resized');
const SERVER_UPLOADS_DIR = path.join(DATA_DIR, 'server-uploads');
const DRY_RUN = Boolean(process.env.DRY_RUN);

const SLUG_FIXES: Record<string, string> = { 'what-is-demand-responase': 'what-is-demand-response' };

let strapi: Core.Strapi;
const md = new MarkdownIt({ html: false, linkify: true, typographer: false });

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const clean = (s = '') => s.replace(/\s+/g, ' ').trim();
const plain = (s: string) =>
  clean(s.replace(/\[[^\]]*\]\([^)]*\)/g, '').replace(/[*_\\#]/g, '')).toLowerCase();

// Small seeded RNG so re-runs pick the same images.
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

function altFromFile(file: string) {
  const base = path.basename(file, path.extname(file))
    .replace(/\s*\(\d+\)$/, '')
    .replace(/-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}-utc$/, '')
    .replace(/-/g, ' ');
  return base.charAt(0).toUpperCase() + base.slice(1);
}

type Article = {
  index: number;
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  bodyMd: string;
  faqs: { question: string; answer: string }[];
  images: string[];
};

function loadArticles(): Article[] {
  const rows = parseCsv(fs.readFileSync(CSV_FILE, 'utf8'));
  const header = rows.findIndex((r) => r[0]?.trim() === 'Deadline');
  // Only the first block of the sheet (Monika's articles); the block after
  // the blank rows belongs to a different Markdown file.
  const rest = rows.slice(header + 1);
  const blank = rest.findIndex((r) => !clean(r[2]));
  const entries = blank < 0 ? rest : rest.slice(0, blank);
  const lines = fs.readFileSync(MD_FILE, 'utf8').split('\n');

  // Each article starts at the H3 whose text matches the CSV topic.
  const starts = entries.map((r) => {
    const topic = plain(r[2]);
    const at = lines.findIndex((l) => l.startsWith('### ') && plain(l.slice(4)) === topic);
    if (at < 0) throw new Error(`No heading in the Markdown for "${r[2]}"`);
    return at;
  });

  return entries.map((r, i) => {
    const index = i + 1;
    const end = i + 1 < starts.length ? starts[i + 1] : lines.length;
    const body = lines.slice(starts[i] + 1, end);
    const faqAt = body.findIndex((l) => /^###\s.*Frequently Asked Questions/i.test(l));
    const bodyLines = faqAt >= 0 ? body.slice(0, faqAt) : body;
    const bodyMd = bodyLines.join('\n').replace(/\n\s*---\s*$/m, '').replace(/(\n\s*---\s*)+\s*$/, '').trim();

    const faqs: { question: string; answer: string }[] = [];
    if (faqAt >= 0) {
      const blocks = body.slice(faqAt + 1).join('\n').split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
      for (const block of blocks) {
        const m = block.match(/^\*\*(.+?)\*\*\s*(?:\\)?\n([\s\S]+)$/);
        if (!m) { if (block !== '---') console.warn(`  [${index}] unparsed FAQ block: ${block.slice(0, 60)}`); continue; }
        faqs.push({ question: clean(m[1]), answer: clean(m[2].replace(/\\(.)/g, '$1')) });
      }
    }

    let slug = clean(r[7]).replace(/^\/+/, '').replace(/\/+$/, '');
    slug = SLUG_FIXES[slug] ?? slug;

    const dir = path.join(IMAGE_DIR, String(index));
    const images = fs.existsSync(dir)
      ? fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort().map((f) => path.join(dir, f))
      : [];

    return {
      index,
      title: clean(r[5]),
      slug,
      metaTitle: clean(r[8]),
      metaDescription: clean(r[10]),
      keywords: [clean(r[3]), clean(r[4])].filter(Boolean).join(', '),
      bodyMd,
      faqs,
      images,
    };
  });
}

function pickImages(article: Article) {
  const pool = [...article.images];
  const rand = rng(article.index * 7919);
  const picked: string[] = [];
  while (picked.length < 3 && pool.length) picked.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
  return picked;
}

function resize(file: string, index: number) {
  fs.mkdirSync(RESIZED_DIR, { recursive: true });
  const base = altFromFile(file).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const out = path.join(RESIZED_DIR, `insight-${index}-${base}.jpg`);
  if (!fs.existsSync(out)) {
    execFileSync('vipsthumbnail', [file, '--size', '1920x', '-o', `${out}[Q=82,strip]`]);
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

const figure = (file: { url: string; alternativeText?: string; width?: number; height?: number }) =>
  `<figure class="image"><img src="${file.url}" alt="${(file.alternativeText ?? '').replace(/"/g, '&quot;')}"` +
  `${file.width ? ` width="${file.width}" height="${file.height}"` : ''}></figure>`;

// Turns the Markdown into HTML (### -> h2) and places the images before the
// section headings closest to one third and two thirds of the way through.
function buildContent(bodyMd: string, images: { url: string }[]) {
  const html = md.render(bodyMd.replace(/^###\s+/gm, '## ').replace(/^(##\s+)\*\*(.+)\*\*\s*$/gm, '$1$2'));
  const parts = html.split(/(?=<h2>)/);
  if (!images.length || parts.length < 2) return html + images.map(figure).join('');
  const targets = images.map((_, i) => Math.max(1, Math.round(((i + 1) * parts.length) / (images.length + 1))));
  const used = new Set<number>();
  targets.forEach((t, i) => {
    while (used.has(t) && t < parts.length - 1) t++;
    used.add(t);
    parts[t] = figure(images[i] as any) + '\n' + parts[t];
  });
  return parts.join('');
}

const readTime = (text: string) => Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 200));

async function run() {
  const articles = loadArticles();
  console.log(`Parsed ${articles.length} articles.`);
  for (const a of articles) {
    const issues = [
      a.metaTitle.length < 30 || a.metaTitle.length > 70 ? `metaTitle ${a.metaTitle.length} chars` : '',
      a.metaDescription.length < 120 || a.metaDescription.length > 200 ? `metaDescription ${a.metaDescription.length} chars` : '',
      a.images.length ? '' : 'no images',
    ].filter(Boolean);
    console.log(`  ${a.index}. ${a.slug} | ${a.faqs.length} FAQs | ${a.bodyMd.split(/\s+/).length} words${issues.length ? ' | ' + issues.join(', ') : ''}`);
  }
  if (DRY_RUN) return;

  strapi = await createStrapi(await compileStrapi()).load();
  try {
    let tag = await strapi.documents('api::tag.tag').findFirst({ filters: { slug: 'learning-center' } });
    if (!tag) tag = await strapi.documents('api::tag.tag').create({ data: { title: 'Learning Center', slug: 'learning-center' } });

    for (const a of articles) {
      const existing = await strapi.documents('api::insight.insight').findFirst({ filters: { slug: a.slug }, status: 'draft' });
      if (existing) { console.log(`  skip ${a.slug} (exists)`); continue; }

      const files = [];
      for (const img of pickImages(a)) files.push(await uploadImage(resize(img, a.index), altFromFile(img)));
      const [cover, ...inline] = files;
      const seo: Record<string, unknown> = { keywords: a.keywords, metaImage: cover?.id ?? null };
      if (a.metaTitle.length >= 30 && a.metaTitle.length <= 70) seo.metaTitle = a.metaTitle;
      if (a.metaDescription.length >= 120 && a.metaDescription.length <= 200) seo.metaDescription = a.metaDescription;

      await strapi.documents('api::insight.insight').create({
        data: {
          title: a.title,
          slug: a.slug,
          summary: a.metaDescription,
          cover: cover?.id ?? null,
          content: buildContent(a.bodyMd, inline),
          faqs: a.faqs,
          read_time: readTime(a.bodyMd),
          tags: [tag.documentId],
          seo,
        } as any,
      });
      console.log(`  created ${a.slug} (${files.length} images)`);
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
