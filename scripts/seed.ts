/**
 * Seeds the CMS with the content the website used to hard-code, so every
 * section has data and editors have examples to follow.
 *
 * Safe to re-run: entries are matched by slug/title and only created when
 * missing. Existing entries are left alone, except Pages with no sections,
 * which get the default sections.
 *
 *   npm run seed
 *
 * SEED_IMAGES_DIR points at the website's public/images folder
 * (default: ../africa-energy-news/public/images).
 */
import fs from 'node:fs';
import path from 'node:path';
import { compileStrapi, createStrapi } from '@strapi/strapi';
import type { Core, UID } from '@strapi/strapi';

const IMAGES_DIR = path.resolve(
  process.env.SEED_IMAGES_DIR ?? path.join(__dirname, '..', '..', 'africa-energy-news', 'public', 'images')
);

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

let strapi: Core.Strapi;
const created: Record<string, number> = {};

async function uploadImage(fileName: string, alt: string) {
  const existing = await strapi.db.query('plugin::upload.file').findOne({ where: { name: fileName } });
  if (existing) return existing.id as number;

  const filepath = path.join(IMAGES_DIR, fileName);
  if (!fs.existsSync(filepath)) {
    strapi.log.warn(`seed: image not found, skipped: ${filepath}`);
    return null;
  }
  const [file] = await strapi
    .plugin('upload')
    .service('upload')
    .upload({
      data: { fileInfo: { name: fileName, alternativeText: alt, caption: alt } },
      files: {
        filepath,
        originalFilename: fileName,
        mimetype: MIME[path.extname(fileName).toLowerCase()] ?? 'application/octet-stream',
        size: fs.statSync(filepath).size,
      },
    });
  created.images = (created.images ?? 0) + 1;
  return file.id as number;
}

async function findOne(uid: UID.ContentType, filters: Record<string, unknown>, populate: string[] = []) {
  return strapi.documents(uid as any).findFirst({ filters, status: 'draft', populate } as any);
}

async function ensure(
  uid: UID.ContentType,
  match: Record<string, unknown>,
  data: Record<string, unknown>,
  publish = true
) {
  const existing = await findOne(uid, match);
  if (existing) return existing.documentId as string;
  const doc = await strapi
    .documents(uid as any)
    .create({ data, ...(publish ? { status: 'published' } : {}) } as any)
    .catch((error: { details?: unknown }) => {
      throw new Error(`Could not create ${uid} ${JSON.stringify(match)}: ${JSON.stringify(error.details ?? error)}`);
    });
  const key = uid.split('.').pop()!;
  created[key] = (created[key] ?? 0) + 1;
  return doc.documentId as string;
}

async function ensureSingle(uid: UID.ContentType, data: Record<string, unknown>) {
  const existing = await strapi.documents(uid as any).findFirst({} as any);
  if (existing) return;
  await strapi.documents(uid as any).create({ data } as any);
  created[uid.split('.').pop()!] = 1;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// ---------------------------------------------------------------- content

const COUNTRIES = [
  {
    slug: 'south-africa', name: 'South Africa', region: 'Southern Africa', summary: '6,240 MW operating · 118 projects',
    image: 'project-1.png', market_label: 'Renewable Energy Market', installed_capacity: '6,240 MW',
    tracked_projects: 118, active_companies: 210, pipeline_projects: 115,
    energy_mix: [['Solar', 58], ['Wind', 34], ['Storage', 21], ['Hydrogen', 2]],
    latest_news: 'Battery Energy Storage bid window 3 results announced, adding 615 MW.',
    latest_investment: 'REIPPPP round attracts record independent power producer bids.',
    latest_policy: 'Grid code amendment accelerates private wheeling approvals.',
  },
  {
    slug: 'kenya', name: 'Kenya', region: 'East Africa', summary: '3,120 MW operating · 64 projects',
    image: 'latest-grid.png', market_label: 'Geothermal and wind market', installed_capacity: '3,120 MW',
    tracked_projects: 64, active_companies: 86, pipeline_projects: 41,
    energy_mix: [['Geothermal', 22], ['Wind', 18], ['Solar', 16], ['Hydro', 8]],
    latest_news: 'New transmission capacity is unlocking a backlog of shovel-ready wind and solar.',
    latest_investment: 'KenGen lines up the next Rift Valley geothermal increment.',
    latest_policy: 'Grid-code changes are pulling hybrid projects into the evening peak.',
  },
  {
    slug: 'nigeria', name: 'Nigeria', region: 'West Africa', summary: '2,410 MW operating · 51 projects',
    image: 'latest-solar.png', market_label: 'Solar and storage market', installed_capacity: '2,410 MW',
    tracked_projects: 51, active_companies: 74, pipeline_projects: 63,
    energy_mix: [['Solar', 29], ['Gas', 11], ['Storage', 8], ['Hydro', 3]],
    latest_news: 'Industrial offtakers are clustering projects around new substations.',
    latest_investment: 'A regional solar vehicle closed with storage written into the PPA.',
    latest_policy: 'Corporate PPAs are filling the gap where sovereign offtake is slow.',
  },
  {
    slug: 'egypt', name: 'Egypt', region: 'North Africa', summary: '8,900 MW operating · 72 projects',
    image: 'project-7.png', market_label: 'Wind, solar and hydrogen market', installed_capacity: '8,900 MW',
    tracked_projects: 72, active_companies: 64, pipeline_projects: 48,
    energy_mix: [['Solar', 24], ['Wind', 27], ['Hydrogen', 14], ['Storage', 7]],
    latest_news: 'A sovereign-backed vehicle is targeting hybrid solar and storage on the Red Sea coast.',
    latest_investment: 'Hydrogen offtake talks are moving hubs toward front-end engineering.',
    latest_policy: 'Land and grid allocation is the constraint, not the auction price.',
  },
  {
    slug: 'namibia', name: 'Namibia', region: 'Southern Africa', summary: 'Hydrogen hub · 11 projects',
    image: 'project-6.png', market_label: 'Green hydrogen market', installed_capacity: '880 MW',
    tracked_projects: 11, active_companies: 19, pipeline_projects: 9,
    energy_mix: [['Hydrogen', 6], ['Solar', 3], ['Wind', 2]],
    latest_news: 'Tsau Khaeb offtake negotiations are the test of whether the hub can reach FID.',
    latest_investment: 'Export-linked hydrogen is being paired with dedicated renewables.',
    latest_policy: 'Port and water rights now sit on the same timetable as generation.',
  },
  {
    slug: 'ethiopia', name: 'Ethiopia', region: 'East Africa', summary: 'Hydro + wind · 29 projects',
    image: 'video-3.png', market_label: 'Hydro and wind market', installed_capacity: '5,450 MW',
    tracked_projects: 29, active_companies: 22, pipeline_projects: 17,
    energy_mix: [['Hydro', 12], ['Wind', 11], ['Solar', 6]],
    latest_news: 'The Aysha wind corridor is in permitting as new lines are sequenced.',
    latest_investment: 'A concessional facility is aimed at transmission, not another plant.',
    latest_policy: 'Currency convertibility remains the open question for private sponsors.',
  },
  {
    slug: 'morocco', name: 'Morocco', region: 'North Africa', summary: '4,180 MW operating · 38 projects',
    image: 'project-2.png', market_label: 'Solar and wind market', installed_capacity: '4,180 MW',
    tracked_projects: 38, active_companies: 41, pipeline_projects: 22,
    energy_mix: [['Solar', 16], ['Wind', 15], ['Storage', 7]],
    latest_news: 'Hybrid solar-wind sites are being sized for evening export windows.',
    latest_investment: 'European offtake is back in term sheets for the next bid round.',
    latest_policy: 'Interconnector timing is now written into project schedules.',
  },
  {
    slug: 'ghana', name: 'Ghana', region: 'West Africa', summary: 'Solar + storage · 22 projects',
    image: 'project-3.png', market_label: 'Solar and storage market', installed_capacity: '1,160 MW',
    tracked_projects: 22, active_companies: 28, pipeline_projects: 19,
    energy_mix: [['Solar', 12], ['Storage', 7], ['Gas', 3]],
    latest_news: 'A first bid window requires storage as a condition of dispatch.',
    latest_investment: 'Sovereign-backed co-investment is pairing coastal PV with four-hour batteries.',
    latest_policy: 'Evening-peak offtake is what unlocked lender appetite.',
  },
  // Markets referenced by projects but without a map marker.
  { slug: 'tanzania', name: 'Tanzania', region: 'East Africa', priority_market: false },
  { slug: 'zambia', name: 'Zambia', region: 'Southern Africa', priority_market: false },
];

const COMPANIES = [
  { name: 'Scatec', company_type: 'IPP', headquarters: 'Oslo / Cape Town', highlight: '2.4 GW Africa', image: 'latest-wind.png' },
  { name: 'Globeleq', company_type: 'IPP', headquarters: 'London / Johannesburg', highlight: '1.8 GW', image: 'project-1.png' },
  { name: 'KenGen', company_type: 'Utility', headquarters: 'Nairobi', highlight: '1.8 GW geothermal led', image: 'latest-grid.png' },
  { name: 'Eskom', company_type: 'Utility', headquarters: 'Johannesburg', highlight: 'Grid & generation', image: 'video-3.png' },
  { name: 'African Development Bank', company_type: 'DFI', headquarters: 'Abidjan', highlight: 'Mission 300 partner', image: 'project-3.png' },
  { name: 'World Bank / IFC', company_type: 'DFI', headquarters: 'Washington / Nairobi', highlight: 'Concessional', image: 'project-7.png' },
  { name: 'TotalEnergies', company_type: 'Major', headquarters: 'Paris / Luanda', highlight: 'Oil-to-electrons', image: 'project-6.png' },
  { name: 'CrossBoundary Energy', company_type: 'Offtaker', headquarters: 'Nairobi', highlight: 'Corporate offtake', image: 'latest-solar.png' },
  {
    name: 'AMEA Power', company_type: 'IPP', headquarters: 'Dubai / Cairo / Johannesburg', highlight: '6.2 GW operating / UC',
    image: 'project-2.png', is_spotlight: true,
    description:
      'The pan-African IPP is stacking solar, storage and green-hydrogen offtake across Egypt, Morocco and West Africa, with more than 6 GW in operation or under construction.',
    spotlight_stats: [['6.2 GW', 'Operating / UC'], ['14', 'African markets'], ['$4.1bn', 'Capital deployed']],
  },
];

const PROJECTS = [
  { name: 'Dodoma Solar PV', country: 'tanzania', technology: 'Solar', capacity: '150 MW', project_status: 'Construction', developer: 'Scatec', image: 'project-1.png' },
  { name: 'Karoo Wind Extension', country: 'south-africa', technology: 'Wind', capacity: '240 MW', project_status: 'Operational', developer: 'Enel Green Power', image: 'project-2.png' },
  { name: 'Lagos Grid Storage I', country: 'nigeria', technology: 'Battery Storage', capacity: '80 MW / 320 MWh', project_status: 'Financial close', developer: 'AMEA Power', image: 'project-3.png' },
  { name: 'Suez Hydrogen Hub', country: 'egypt', technology: 'Hydrogen', capacity: '1.5 GW', project_status: 'Development', developer: 'Fertiglobe consortium', image: 'project-4.png' },
  { name: 'Rift Valley Expansion', country: 'kenya', technology: 'Geothermal', capacity: '70 MW', project_status: 'Construction', developer: 'KenGen', image: 'project-5.png' },
  { name: 'Copperbelt Solar Park', country: 'zambia', technology: 'Solar', capacity: '200 MW', project_status: 'Tender', developer: 'Globeleq', image: 'latest-solar.png' },
  { name: 'Tsau Khaeb Green H2', country: 'namibia', technology: 'Hydrogen', capacity: '3 GW', project_status: 'Pre-FID', developer: 'Hyphen Hydrogen', image: 'project-6.png' },
  { name: 'Aysha Wind Corridor', country: 'ethiopia', technology: 'Wind', capacity: '120 MW', project_status: 'Permitting', developer: 'Ethiopian Electric Power', image: 'project-7.png' },
];

const DEALS = [
  { title: 'West African solar consortium reaches $340M financial close', deal_type: 'Financial close', value: '$340M', markets: 'Nigeria · Ghana · Senegal', deal_date: '2026-09-28' },
  { title: 'Climate fund approves concessional facility for Ethiopian transmission', deal_type: 'Development finance', value: '$210M', markets: 'Ethiopia', deal_date: '2026-09-24' },
  { title: 'Pan-African IPP acquires majority stake in Southern African storage developer', deal_type: 'M&A', value: '$95M', markets: 'South Africa · Zambia', deal_date: '2026-09-18' },
  { title: 'Corporate offtaker signs 15-year solar PPA for East African manufacturing hub', deal_type: 'PPA', value: '120 MW', markets: 'Kenya', deal_date: '2026-09-15' },
];

const EVENTS = [
  { title: 'West Africa solar offtake workshop', event_type: 'Workshop', start_date: '2026-10-07', city: 'Lagos', attendance: 'In person' },
  { title: 'Green hydrogen offtakers summit', event_type: 'Summit', start_date: '2026-11-18', city: 'Walvis Bay', attendance: 'In person' },
  { title: 'Year-ahead investment outlook', event_type: 'Webinar', start_date: '2026-12-03', attendance: 'Virtual' },
  {
    title: 'Africa Energy Forum 2027', event_type: 'Forum', start_date: '2027-06-16', end_date: '2027-06-19',
    city: 'Cape Town', venue: 'Cape Town International Convention Centre', attendance: 'In person', is_featured: true,
    image: 'project-2.png',
    description:
      "The continent's principal gathering of ministers, DFIs, IPPs and offtakers. Africa Energy will host a briefing desk and daily dispatch from the floor.",
    highlights: [['3,400+', 'Delegates'], ['80', 'Countries'], ['4', 'Days']],
  },
  { title: 'Africa Energy Briefing: Storage tenders', event_type: 'Briefing', start_date: '2027-09-09', city: 'Johannesburg', attendance: 'Hybrid' },
  { title: 'Mission 300 capital roundtable', event_type: 'Roundtable', start_date: '2027-09-22', city: 'Nairobi', attendance: 'Invite only' },
];

type InsightSeed = {
  title: string;
  tag: string;
  label?: string;
  summary: string;
  cover?: string;
  author?: string;
  read_time?: number;
  pull_quote?: string;
};

const INSIGHTS: InsightSeed[] = [
  {
    title: 'What is renewable energy—and how does it work?', tag: 'learning-center', label: 'LEARNING CENTER',
    summary: 'A practical guide to power from sunlight, wind, water and heat—and why these sources naturally replenish.',
    cover: 'insight-cover.jpeg', author: 'Editorial Team', read_time: 7,
  },
  { title: 'How solar panels turn sunlight into usable electricity', tag: 'learning-center', label: 'SOLAR BASICS', summary: 'A simple look at photovoltaic cells, wiring and inverters.', cover: 'insight-1.png' },
  { title: 'How batteries keep solar energy available after sunset', tag: 'technology', label: 'BATTERY', summary: 'Stored daytime power supports lights and appliances at night.', cover: 'insight-2.png' },
  { title: 'How smart grids balance changing renewable power', tag: 'technology', label: 'SMART GRID', summary: 'Forecasting and flexible demand keep supply and use in step.', cover: 'insight-3.png' },
  { title: 'Solar panels explained: cells, modules and inverters', tag: 'learning-center', summary: 'Learn how individual photovoltaic cells are combined into panels and connected through an inverter.', read_time: 5 },
  { title: 'How home batteries extend solar use into the night', tag: 'learning-center', summary: 'A battery saves surplus daytime electricity so lights and appliances can run after the sun goes down.', read_time: 6 },
  { title: 'What happens to solar generation on cloudy days?', tag: 'learning-center', summary: 'Panels still generate electricity in diffuse light, though output changes with cloud cover and system design.', read_time: 4 },
  { title: 'Can wind and solar power a grid around the clock?', tag: 'learning-center', summary: 'A reliable renewable grid combines diverse locations, storage, transmission and flexible demand.', read_time: 7 },
  { title: 'Africa Solar Market Outlook', tag: 'reports', label: 'REPORT', summary: 'Pipelines, tenders and financing across Africa’s solar markets.', cover: 'report-1.png' },
  { title: 'Africa Battery Storage Outlook 2026', tag: 'reports', label: 'FEATURED REPORT', summary: 'Deployment pipelines, procurement models and financing structures across ten priority markets.', cover: 'report-2.png' },
  { title: 'Africa Renewable Energy Investment Report', tag: 'reports', label: 'REPORT', summary: 'Where capital is flowing across Africa’s renewable energy sector.', cover: 'report-3.png' },
  { title: 'Africa Green Hydrogen Outlook', tag: 'reports', label: 'REPORT', summary: 'Hubs, offtake and export routes for Africa’s green hydrogen projects.', cover: 'report-4.png' },
  {
    title: 'Mission 300 is a capital stack, not a slogan', tag: 'opinion', label: 'POLICY NOTE', cover: 'latest-grid.png',
    summary: 'Concessional money is being layered against private offtake in four markets. The test is whether utilities can still sign bankable PPAs.',
  },
  {
    title: 'Why transmission, not generation, is the 2026 bottleneck', tag: 'analysis', label: 'DATA', cover: 'video-3.png',
    summary: 'Our project file shows 41 GW of shovel-ready renewables waiting on a line. The bid windows will not clear without it.',
  },
  {
    title: 'West Africa’s solar close is a template, not an outlier', tag: 'analysis', label: 'MARKETS', cover: 'latest-solar.png',
    summary: 'Pooling DFI capital with regional IPPs solved a currency and offtake problem that single-country auctions could not.',
  },
  {
    title: 'What Africa’s Grid Bottleneck Means for the Next Decade of Renewables', tag: 'analysis', label: 'THE GREAT READ',
    cover: 'insight-featured.png', author: 'Naledi Mokoena', read_time: 8,
    pull_quote: 'Storage will become central to Africa’s renewable-energy growth over the next five years.',
    summary:
      'Without transmission and four-hour storage, a decade of solar and wind auctions will stall at the substation gate. Naledi Mokoena traces the money now moving into wires and batteries.',
  },
];

const VIDEOS = [
  { title: 'How South Africa is curbing energy poverty with solar', video_type: 'Reel', duration: '02:42', youtube: '_OOuBxky5f8', source: 'DW News' },
  { title: 'Solar charging stations electrifying Kenya', video_type: 'Reel', duration: '01:54', youtube: '2YdSDPI-Vkw', source: 'The Earthshot Prize' },
  { title: "Africa's untapped renewable potential", video_type: 'Reel', duration: '00:45', youtube: 'B6YHe4ZAo6o', source: 'Modo Energy' },
  { title: 'Solar ambulance brings hope to remote Kenya', video_type: 'Reel', duration: '03:00', youtube: 'Nld1mQSRVQ8', source: 'News Central TV' },
  { title: "Can Nigeria become Africa's renewable energy hub?", video_type: 'Reel', duration: '02:27', youtube: 'Xu2KQncWr7c', source: 'NTA Network' },
  { title: 'Inside Solar & Storage Live Africa in Johannesburg', video_type: 'Reel', duration: '00:31', youtube: 'RFlspIcvfGc', source: 'JA Solar Africa' },
  { title: "Inside Africa's largest battery storage facility", video_type: 'Video', thumbnail: 'video-1.png' },
  { title: 'The financing gap: talking storage with regional lenders', video_type: 'Video', thumbnail: 'video-2.png' },
  { title: 'This week in Africa energy: five stories explained', video_type: 'Video', thumbnail: 'video-3.png' },
];

// Tags: the first four are the Africa Times columns on the home page; the
// rest are the Insights pages an insight appears on.
const TAGS = [
  'Trending', 'Missed It', 'Most Read', 'The Brief',
  'Learning Center', 'Technology', 'Reports', 'Opinion', 'Interviews', 'Analysis',
];

// Pages: one entry per site page, found by slug. Only content with picks or
// longer text lives in "sections"; headings and intros are part of the site's
// design. The website looks each section up by its slug.
const PAGES: { slug: string; title: string; sections: (insights: Map<string, string>) => Record<string, unknown>[] }[] = [
  {
    slug: 'home',
    title: 'Africa Energy News',
    sections: (insights) => [
      { __component: 'sections.article-list', slug: 'lead-story', articles: [] },
      { __component: 'sections.article-list', slug: 'what-matters-today', articles: [] },
      {
        __component: 'sections.insight-list', slug: 'insights',
        insights: [insights.get('What is renewable energy—and how does it work?')].filter(Boolean),
      },
    ],
  },
  ...[
    ['news', 'News'], ['projects', 'Projects'], ['companies', 'Companies'], ['countries', 'Countries'],
    ['insights', 'Insights'], ['learning-center', 'Learning Center'], ['technology', 'Technology'],
    ['reports', 'Reports'], ['opinion', 'Opinion'], ['interviews', 'Interviews'], ['events', 'Events'],
  ].map(([slug, title]) => ({ slug, title, sections: () => [] })),
  {
    slug: 'about', title: 'About',
    sections: () => [
      {
        __component: 'sections.text-columns', slug: 'intro', title: 'Energy intelligence, Africa-first.',
        left: 'Africa Energy is an independent newsroom covering the continent’s energy transition — from utility-scale solar and storage to transmission, hydrogen, offtake and the capital that makes projects bankable.\n\nWe report from Johannesburg, Lagos and Nairobi, and we write for the people who close deals: developers, DFIs, utilities, ministers and offtakers.',
        right: 'We do not treat Africa as a single market. Each dispatch is tagged to the country, the technology and the money. The project file, the company directory and the country pages are how readers navigate that complexity.',
        note: 'Founded 2024 · Independent · Subscriber-supported',
      },
      {
        __component: 'sections.item-grid', slug: 'coverage', title: 'What we cover',
        items: [
          { title: 'Solar & wind', text: 'Utility-scale generation, hybrid parks, auctions and PPAs.' },
          { title: 'Storage', text: 'Batteries, pumped hydro and the tenders that firm variable power.' },
          { title: 'Grid', text: 'Transmission, interconnectors and the utilities that operate them.' },
          { title: 'Hydrogen', text: 'Export hubs, offtake and the path from announcement to FID.' },
          { title: 'Capital', text: 'DFIs, commercial banks, M&A and the Mission 300 stack.' },
          { title: 'Policy', text: 'Tenders, regulation and the politics of energy access.' },
        ],
      },
      {
        __component: 'sections.item-grid', slug: 'bureaus', title: 'Bureaus',
        items: [
          { title: 'Johannesburg', text: 'Southern Africa desk · Projects, storage, Eskom and the SAPP.' },
          { title: 'Lagos', text: 'West Africa desk · Solar closes, offtake and regional capital.' },
          { title: 'Nairobi', text: 'East Africa desk · Geothermal, wind, grids and Mission 300.' },
        ],
      },
      {
        __component: 'sections.people', slug: 'newsroom', title: 'The newsroom',
        people: [
          { name: 'Amara Chukwu', role: 'West Africa correspondent · Lagos', initials: 'AC' },
          { name: 'Naledi Mokoena', role: 'Southern Africa editor · Johannesburg', initials: 'NM' },
          { name: 'Wanjiku Kariuki', role: 'East Africa correspondent · Nairobi', initials: 'WK', highlight: true },
          { name: 'Daniel Bekele', role: 'Projects & data · Addis / Nairobi', initials: 'DB' },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------- run

async function seed() {
  const countryIds = new Map<string, string>();
  for (const [index, country] of COUNTRIES.entries()) {
    const { image, energy_mix, ...fields } = country as typeof country & { image?: string; energy_mix?: [string, number][] };
    const id = await ensure('api::country.country', { slug: country.slug }, {
      ...fields,
      sort_order: index,
      image: image ? await uploadImage(image, country.name) : null,
      energy_mix: (energy_mix ?? []).map(([technology, projects]) => ({ technology, projects })),
    });
    countryIds.set(country.slug, id);
  }

  for (const company of COMPANIES) {
    const { image, spotlight_stats, ...fields } = company as typeof company & { spotlight_stats?: [string, string][] };
    await ensure('api::company.company', { name: company.name }, {
      ...fields,
      slug: slugify(company.name),
      image: await uploadImage(image, company.name),
      spotlight_stats: (spotlight_stats ?? []).map(([value, label]) => ({ value, label })),
    });
  }

  for (const project of PROJECTS) {
    const { image, country, ...fields } = project;
    await ensure('api::project.project', { name: project.name }, {
      ...fields,
      slug: slugify(project.name),
      country: countryIds.get(country) ?? null,
      image: await uploadImage(image, project.name),
    });
  }

  for (const deal of DEALS) {
    await ensure('api::deal.deal', { title: deal.title }, deal);
  }

  for (const event of EVENTS) {
    const { image, highlights, ...fields } = event as typeof event & { image?: string; highlights?: [string, string][] };
    await ensure('api::event.event', { title: event.title }, {
      ...fields,
      slug: slugify(event.title),
      image: image ? await uploadImage(image, event.title) : null,
      highlights: (highlights ?? []).map(([value, label]) => ({ value, label })),
    });
  }

  const tagIds = new Map<string, string>();
  for (const [index, title] of TAGS.entries()) {
    const slug = slugify(title);
    tagIds.set(slug, await ensure('api::tag.tag', { slug }, { title, slug, sort_order: index }, false));
  }

  const insightIds = new Map<string, string>();
  for (const insight of INSIGHTS) {
    const { cover, tag, ...fields } = insight;
    const id = await ensure('api::insight.insight', { title: insight.title }, {
      ...fields,
      slug: slugify(insight.title),
      tags: [tagIds.get(tag)].filter(Boolean),
      content: `<p>${insight.summary}</p>`,
      cover: cover ? await uploadImage(cover, insight.title) : null,
    });
    insightIds.set(insight.title, id);
  }

  for (const video of VIDEOS) {
    const { youtube, thumbnail, ...fields } = video as typeof video & { youtube?: string; thumbnail?: string };
    await ensure('api::video.video', { title: video.title }, {
      ...fields,
      youtube_url: youtube ? `https://www.youtube.com/watch?v=${youtube}` : null,
      thumbnail: thumbnail ? await uploadImage(thumbnail, video.title) : null,
    });
  }

  // Pages are matched by slug. A page that exists without sections (e.g. one
  // an editor created by hand) gets the default sections; others are left alone.
  for (const page of PAGES) {
    const sections = page.sections(insightIds);
    const existing = await findOne('api::page.page', { slug: page.slug }, ['sections']);
    if (!existing) {
      await ensure('api::page.page', { slug: page.slug }, { slug: page.slug, title: page.title, sections });
    } else if (sections.length > 0 && !(existing.sections as unknown[] | undefined)?.length) {
      await strapi.documents('api::page.page').update({
        documentId: existing.documentId,
        data: { sections },
        status: 'published',
      } as any);
      created.pageSections = (created.pageSections ?? 0) + 1;
    }
  }

  await ensureSingle('api::site-setting.site-setting', {
    site_name: 'Africa Energy News',
    tagline: 'Energy intelligence, Africa-first',
    site_description:
      'Africa-first energy intelligence covering solar, wind, storage, hydrogen, grid investment, policy, and capital across African markets.',
    newsletter_heading: 'The 5 energy stories you need to know today.',
    newsletter_text: 'Africa Energy Brief — intelligence from Johannesburg, Lagos and Nairobi.',
    menu_featured_insight: insightIds.get('Africa Battery Storage Outlook 2026'),
    copyright_text: '© 2026 Africa Energy. All rights reserved.',
    footer_columns: [
      { heading: 'NEWS', links: [{ label: 'Latest', url: '/news' }, { label: 'Trending', url: '/#africa-times' }, { label: 'Africa Energy Brief', url: '/#brief' }] },
      { heading: 'INTELLIGENCE', links: [{ label: 'Projects', url: '/projects' }, { label: 'Companies', url: '/companies' }, { label: 'Countries', url: '/countries' }] },
      { heading: 'MORE', links: [{ label: 'Insights', url: '/insights' }, { label: 'Events', url: '/events' }, { label: 'About', url: '/about' }] },
    ],
  });
}

(async () => {
  strapi = await createStrapi(await compileStrapi()).load();
  try {
    await seed();
    console.log('Seed complete. Created:', Object.keys(created).length ? created : 'nothing (already seeded)');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  } finally {
    await strapi.destroy();
    process.exit();
  }
})();
