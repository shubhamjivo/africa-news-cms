/**
 * Replaces every Event and Project with the rows of africa_data/Events.csv
 * and africa_data/projects.csv, published, with the banners that
 * africa_data/fetch_banners.py downloaded from each row's link.
 *
 * Deletes ALL existing events and projects first (articles keep existing but
 * lose their project link). Back up the database before running. Countries
 * the projects need are created when missing, as non-priority markets.
 *
 * Uploaded files land in public/uploads and are also copied to
 * africa_data/server-uploads so they can be put on the server.
 *
 *   python3 ../africa_data/fetch_banners.py           # banners first
 *   DRY_RUN=1 npx tsx scripts/import-africa-data.ts   # parse and report only
 *   npx tsx scripts/import-africa-data.ts             # replace the data
 */
import fs from 'node:fs';
import path from 'node:path';
import { compileStrapi, createStrapi } from '@strapi/strapi';
import type { Core } from '@strapi/strapi';

const DATA_DIR = path.resolve(process.env.AFRICA_DATA_DIR ?? path.join(__dirname, '..', '..', 'africa_data'));
const BANNERS = path.join(DATA_DIR, 'banners');
const SERVER_UPLOADS_DIR = path.join(DATA_DIR, 'server-uploads');
const DRY_RUN = Boolean(process.env.DRY_RUN);

let strapi: Core.Strapi;

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

function readCsv(file: string) {
  const [header, ...rows] = parseCsv(fs.readFileSync(path.join(DATA_DIR, file), 'utf8').replace(/^﻿/, ''));
  return rows
    .filter((r) => r.some((v) => v.trim()))
    .map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}

const clean = (s = '') => s.replace(/\s+/g, ' ').trim();
const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// The sheet's links end in a stray "?".
const link = (s = '') => (/^https?:\/\//.test(s) ? s.replace(/\?$/, '') : '');
// fetch_banners.py names banner files with Python's slug rule (80 chars max).
const bannerSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);

// ------------------------------------------------------------------ dates

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

// "Sep 15, 2026" or "Feb 2027" (month only: its first day).
function parseDate(text: string, fallbackYear?: number) {
  const m = text.match(/([A-Za-z]{3})[a-z]*\.?\s+(?:(\d{1,2})(?!\d),?\s*)?(\d{4})?/);
  if (!m) return null;
  const month = MONTHS.indexOf(m[1].toLowerCase());
  const year = m[3] ? Number(m[3]) : fallbackYear;
  if (month < 0 || !year) return null;
  return iso(year, month, m[2] ? Number(m[2]) : 1);
}

function parseEventDates(raw: string) {
  const text = clean(raw);
  const deadline = text.match(/Deadline:\s*([^|]+)/i)?.[1].trim();
  if (deadline) {
    // Awards: the ceremony (or publication) date, else the entry deadline.
    const after = text.match(/(?:Gala|Pub|Winners):\s*([^|]+)/i)?.[1].trim() ?? '';
    const start = parseDate(after) ?? parseDate(deadline);
    return { start, end: null, deadline };
  }
  const [from, to] = text.split(/\s+to\s+/i);
  const end = to ? parseDate(to) : null;
  const start = parseDate(from, end ? Number(end.slice(0, 4)) : undefined);
  return { start, end, deadline: null };
}

// ------------------------------------------------------------------ events

const EVENT_TYPES = ['Award', 'Exhibition', 'Expo', 'Conference', 'Summit', 'Forum', 'Webinar', 'Workshop'];

// The first type named in "Exhibition & Conference", "Investment Forum", ...
function eventType(raw: string) {
  const hits = EVENT_TYPES
    .map((type) => ({ type, at: raw.toLowerCase().indexOf(type.toLowerCase()) }))
    .filter((hit) => hit.at >= 0)
    .sort((a, b) => a.at - b.at);
  const type = hits[0]?.type ?? 'Conference';
  return type === 'Expo' ? 'Exhibition' : type;
}

const VENUE = /centre|center|hotel|villas|grounds|landmark|cticc|expo/i;

function place(raw: string) {
  const parts = clean(raw).split(/\s*,\s*/).filter(Boolean);
  if (parts.length >= 3) return { venue: parts.slice(0, -2).join(', '), city: parts.slice(-2).join(', ') };
  if (parts.length === 2 && VENUE.test(parts[0])) return { venue: parts[0], city: parts[1] };
  return { venue: '', city: parts.join(', ') };
}

const stat = (value: string, label: string) => (value && value.length <= 20 ? [{ value, label }] : []);

function loadEvents() {
  return readCsv('Events.csv').map((r) => {
    const title = clean(r['EVENT / AWARD NAME']);
    const type = eventType(r['EVENT TYPE']);
    const { start, end, deadline } = parseEventDates(r['DATE']);
    if (!start) throw new Error(`No date for event "${title}": ${r['DATE']}`);
    const theme = clean(r['THEME OF EVENT']).replace(/\.$/, '');
    const organizer = clean(r['Organizer']);
    const description = [
      type === 'Award' ? `Categories include ${theme}.` : `${theme}.`,
      deadline ? `Entries close ${deadline}.` : '',
      organizer ? `Organised by ${organizer}.` : '',
    ].filter(Boolean).join(' ');
    return {
      title,
      slug: slugify(title),
      event_type: type,
      start_date: start,
      end_date: end && end !== start ? end : null,
      ...place(r['LOCATION']),
      description,
      registration_url: link(r['LINK']),
      highlights: [
        ...(deadline ? stat(deadline, 'Entry deadline') : stat(clean(r['Frequency']) === 'Yearly' ? 'Annual' : '', 'Edition')),
        ...stat(organizer, 'Organiser'),
      ],
      banner: path.join(BANNERS, 'events', `${bannerSlug(r['EVENT / AWARD NAME'])}.jpg`),
    };
  });
}

// ------------------------------------------------------------------ projects

// Clearer names where the sheet gives only a place or a generic label.
const PROJECT_NAMES: Record<string, string> = {
  Ituka: 'Ituka Solar PV',
  Aysha: 'Aysha Wind',
  'Kom Ombo': 'Kom Ombo Solar PV',
  'Doornhoek, South Africa': 'Doornhoek Solar PV',
  'Sheikh Mohammed Bin Zayed': 'Sheikh Mohammed Bin Zayed Solar PV',
  'Zina Solar, Burkina Faso': 'Zina Solar',
  'Mauritania, Solar': 'Mauritania Solar',
  'Mauritania, Green Hydrogen': 'Mauritania Green Hydrogen',
  Dialakoro: 'Dialakoro Solar PV',
  Bondoukou: 'Bondoukou Solar PV',
  Korhogo: 'Korhogo Solar PV',
  Gaoui: 'Gaoui Solar PV',
  'Angola, Solar': 'Angola Solar',
  'Angola, Water desalination': 'Angola Water Desalination',
  '7 Mini Grids Project': 'Ethiopia Mini-Grids (7 Sites)',
  '39 Health Facilities': 'Liberia Health Facilities Solar (39 Sites)',
  'Solar PV & Storage Project, Sierra Leone': 'Moyamba Solar PV & Storage',
  '32 Public Health Centres': 'Cabo Verde Health Centres Solar (32 Sites)',
  'Solar PV Plant': 'Diapaga Solar PV',
  'Grid-forming BESS Project': 'Lilongwe Grid-Forming BESS',
};

const PROJECT_COUNTRIES: Record<string, string> = {
  Ituka: 'Uganda', Aysha: 'Ethiopia', 'Kom Ombo': 'Egypt', 'Doornhoek, South Africa': 'South Africa',
  'Sheikh Mohammed Bin Zayed': 'Togo', 'Zina Solar, Burkina Faso': 'Burkina Faso',
  'Mauritania, Solar': 'Mauritania', 'Mauritania, Green Hydrogen': 'Mauritania', Dialakoro: 'Mali',
  Bondoukou: "Côte d'Ivoire", Korhogo: "Côte d'Ivoire", Gaoui: 'Chad', 'Angola, Solar': 'Angola',
  'Angola, Water desalination': 'Angola', 'Malawi Solar': 'Malawi', 'Mozambique Solar': 'Mozambique',
  'Angola Solar Project': 'Angola', 'Solar Cabin Pilot Project for NDPHC': 'Nigeria',
  '7 Mini Grids Project': 'Ethiopia', '39 Health Facilities': 'Liberia',
  'Santo Amaro Solar Power Plant': 'São Tomé and Príncipe',
  'Solar PV & Storage Project, Sierra Leone': 'Sierra Leone', '32 Public Health Centres': 'Cabo Verde',
  'Solar PV Plant': 'Burkina Faso', 'Grid-forming BESS Project': 'Malawi',
  'Karuma Hydropower Station': 'Uganda', 'Isimba Hydropower Station': 'Uganda',
  'Nyagak III Small Hydropower Plant': 'Uganda', 'Nyamwamba I HPP': 'Uganda', 'Nyamwamba II HPP': 'Uganda',
};

// Countries not in the CMS yet; created as non-priority markets.
const NEW_COUNTRIES: Record<string, string> = {
  Togo: 'West Africa', 'Burkina Faso': 'West Africa', Mauritania: 'West Africa', Mali: 'West Africa',
  Angola: 'Southern Africa', Malawi: 'Southern Africa', Mozambique: 'Southern Africa',
  Liberia: 'West Africa', 'São Tomé and Príncipe': 'Central Africa', 'Sierra Leone': 'West Africa',
  'Cabo Verde': 'West Africa',
};

const DEVELOPERS: [RegExp, string][] = [
  [/ameapower\.com/, 'AMEA Power'],
  [/sunafrica\.com/, 'SunAfrica'],
  [/jivoenergy\.com/, 'JIVO Energy'],
];

function technology(raw: string) {
  const t = raw.toLowerCase();
  if (!t || t.includes('mini grid') || t.includes('+') || t === 'hybrid') return 'Hybrid';
  if (t.includes('desalination')) return 'Desalination';
  if (t.includes('hydrogen')) return 'Hydrogen';
  if (t.includes('hydro')) return 'Hydro';
  if (t.includes('bess') || t.includes('battery')) return 'Battery Storage';
  if (t.includes('wind')) return 'Wind';
  if (t.includes('solar')) return 'Solar';
  throw new Error(`Unknown technology "${raw}"`);
}

function projectStatus(raw: string) {
  const s = raw.toLowerCase();
  if (s.includes('construction')) return 'Construction';
  if (s.includes('operational') || s.includes('completed')) return 'Operational';
  if (s.includes('financing')) return 'Pre-FID';
  if (s.includes('development')) return 'Development';
  throw new Error(`Unknown status "${raw}"`);
}

function loadProjects() {
  return readCsv('projects.csv').map((r) => {
    const sheetName = clean(r['Name of the Project']);
    // One row has Technology and Status swapped.
    let [tech, status] = [r['Technology'], r['Status']];
    if (/construction|operational|development/i.test(tech) && /solar|wind|hydro/i.test(status)) [tech, status] = [status, tech];

    const country = PROJECT_COUNTRIES[sheetName];
    if (!country) throw new Error(`No country for project "${sheetName}"`);
    const listedDeveloper = clean(r['Developer']);
    const developer = listedDeveloper || DEVELOPERS.find(([re]) => re.test(r['Reference']))?.[1] || '';
    const capacity = r['Capacity'].split(/\n/).map(clean).filter(Boolean).join('; ')
      .replace(/\b(\d[\d.,]*)\s*(mwp?|kwp?|gw|mwh|kwh)s?\b/gi, (_, n: string, unit: string) =>
        `${n} ${unit.replace(/^k/i, 'k').replace(/^(m|g)/i, (c) => c.toUpperCase()).replace(/w/i, 'W').replace(/h$/i, 'h').replace(/p$/i, 'p')}`);
    const location = clean(r['Location']);
    const cod = r['COD'].split(/\n/).map(clean).filter(Boolean).join('; ');
    const offtaker = clean(r['Offtaker']);
    const remarks = clean(r['Remarks']);

    const summary = [
      `${capacity ? `${capacity} ` : ''}${clean(tech) || 'solar and storage'} project${location && location !== country ? ` in ${location}` : ''}, ${country}.`,
      developer ? `Developer: ${developer}.` : '',
      offtaker ? `Offtaker: ${offtaker}.` : '',
      cod ? `Commercial operation: ${cod}.` : '',
      // On the developer-listed rows Remarks names the owner; on the rest it
      // is a stage note such as "Advanced Development Stage".
      remarks ? (listedDeveloper ? `Owner: ${remarks}.` : `${remarks.charAt(0)}${remarks.slice(1).toLowerCase()}.`) : '',
    ].filter(Boolean).join(' ');

    const name = PROJECT_NAMES[sheetName] ?? sheetName;
    return {
      name,
      slug: slugify(name),
      technology: technology(tech),
      project_status: projectStatus(status),
      country,
      developer,
      capacity,
      summary,
      banner: path.join(BANNERS, 'projects', `${bannerSlug(sheetName)}.jpg`),
    };
  });
}

// ------------------------------------------------------------------ import

async function uploadImage(file: string, alt: string) {
  const name = `${path.basename(path.dirname(file))}-${path.basename(file)}`;
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

async function deleteAll(uid: 'api::event.event' | 'api::project.project') {
  const docs = await strapi.documents(uid).findMany({ status: 'draft', fields: ['documentId'], limit: 10000 } as any);
  for (const doc of docs) await strapi.documents(uid).delete({ documentId: doc.documentId });
  return docs.length;
}

async function run() {
  const events = loadEvents();
  const projects = loadProjects();

  console.log(`Events (${events.length}):`);
  for (const e of events) {
    console.log(`  ${e.start_date}${e.end_date ? `..${e.end_date}` : ''} | ${e.event_type} | ${e.title} | ${[e.venue, e.city].filter(Boolean).join(' / ')}${fs.existsSync(e.banner) ? '' : ' | no banner'}`);
  }
  console.log(`Projects (${projects.length}):`);
  for (const p of projects) {
    console.log(`  ${p.name} | ${p.country} | ${p.technology} | ${p.project_status} | ${p.capacity} | ${p.developer}${fs.existsSync(p.banner) ? '' : ' | no banner'}`);
  }
  for (const list of [events.map((e) => e.slug), projects.map((p) => p.slug)]) {
    const dupes = list.filter((s, i) => list.indexOf(s) !== i);
    if (dupes.length) throw new Error(`Duplicate slugs: ${dupes.join(', ')}`);
  }
  if (DRY_RUN) return;

  strapi = await createStrapi(await compileStrapi()).load();
  try {
    console.log(`Deleted ${await deleteAll('api::event.event')} events and ${await deleteAll('api::project.project')} projects.`);

    const countries = new Map<string, string>();
    for (const name of new Set(projects.map((p) => p.country))) {
      let country = await strapi.documents('api::country.country').findFirst({ filters: { name }, status: 'draft' } as any);
      if (!country) {
        const region = NEW_COUNTRIES[name];
        if (!region) throw new Error(`Country "${name}" is missing and has no region`);
        country = await strapi.documents('api::country.country').create({
          data: { name, slug: slugify(name), region, priority_market: false },
          status: 'published',
        } as any);
        console.log(`  created country ${name}`);
      }
      countries.set(name, country.documentId);
    }

    for (const { banner, ...e } of events) {
      const image = fs.existsSync(banner) ? await uploadImage(banner, e.title) : null;
      await strapi.documents('api::event.event').create({
        data: { ...e, attendance: 'In person', is_featured: false, image: image?.id ?? null },
        status: 'published',
      } as any);
    }

    // The next event with a banner that is not an award leads the Events page.
    const today = new Date().toISOString().slice(0, 10);
    const lead = events
      .filter((e) => e.event_type !== 'Award' && e.start_date >= today && fs.existsSync(e.banner))
      .sort((a, b) => a.start_date.localeCompare(b.start_date))[0];
    if (lead) {
      const doc = await strapi.documents('api::event.event').findFirst({ filters: { slug: lead.slug } } as any);
      await strapi.documents('api::event.event').update({ documentId: doc!.documentId, data: { is_featured: true }, status: 'published' } as any);
      console.log(`  featured event: ${lead.title}`);
    }

    for (const { banner, country, ...p } of projects) {
      const image = fs.existsSync(banner) ? await uploadImage(banner, p.name) : null;
      await strapi.documents('api::project.project').create({
        data: { ...p, country: countries.get(country), image: image?.id ?? null },
        status: 'published',
      } as any);
    }
    console.log(`Imported ${events.length} events and ${projects.length} projects.`);
  } finally {
    // Let the website revalidation calls fired by the writes finish first.
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await strapi.destroy();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
