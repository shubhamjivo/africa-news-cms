/**
 * Editor-facing labels, help text, list columns and form layout for the
 * Content Manager. Applied on startup when LAYOUT_VERSION changes, so tweaks
 * made later in "Configure the view" are kept until the next version bump.
 */
import type { Core } from '@strapi/strapi';

type FieldDoc = {
  label?: string;
  description?: string;
  placeholder?: string;
  /** Width out of 12 in the edit form (resizable fields only). */
  size?: number;
};

type ViewDoc = {
  mainField?: string;
  defaultSortBy?: string;
  defaultSortOrder?: 'ASC' | 'DESC';
  /** Columns in the list view. */
  list?: string[];
  /** Edit form rows, top to bottom. Fields left out keep their place below. */
  edit?: string[][];
  fields: Record<string, FieldDoc>;
};

export const LAYOUT_VERSION = 8;

const seoField: FieldDoc = {
  label: 'SEO & sharing',
  description: 'Optional. Leave empty to use the title, summary and main image.',
};

export const CONTENT_TYPES: Record<string, ViewDoc> = {
  'api::article.article': {
    mainField: 'title',
    defaultSortBy: 'updatedAt',
    defaultSortOrder: 'DESC',
    list: ['title', 'category', 'author', 'updatedAt'],
    edit: [
      ['title', 'slug'],
      ['short_content'],
      ['category', 'markets'],
      ['banner', 'thumbnail'],
      ['gallery'],
      ['content'],
      ['author', 'co_author'],
      ['source', 'read_time'],
      ['related_articles', 'ticker'],
      ['seo'],
    ],
    fields: {
      title: { label: 'Headline', placeholder: 'Kenya accelerates solar and wind as grid investment grows' },
      slug: { label: 'URL', description: 'The page address: /news/<url>. Generated from the headline.' },
      short_content: {
        label: 'Summary',
        description: 'One or two sentences shown under the headline on cards and at the top of the article.',
      },
      category: { label: 'Topic', description: 'Shown above the headline and used for the /news filters.' },
      markets: { label: 'Countries', placeholder: 'Nigeria · Ghana · Senegal', description: 'Countries the story covers.' },
      banner: { label: 'Main image', description: 'Large image at the top of the article. Landscape, at least 1600px wide.' },
      thumbnail: { label: 'Card image', description: 'Optional smaller image for lists. Uses the main image if empty.' },
      gallery: { label: 'More photos', description: 'Optional. Shown as a slideshow after the main image.' },
      content: { label: 'Article text' },
      author: { label: 'Author' },
      co_author: { label: 'Co-authors', placeholder: 'Name, Name' },
      source: { label: 'Source', description: 'Optional, e.g. Reuters.' },
      read_time: { label: 'Read time (minutes)', description: 'Calculated automatically from the text if left empty.' },
      related_articles: {
        label: 'Related stories',
        description: 'Shown in the Related News list and loaded next when a reader scrolls past the article.',
      },
      ticker: { label: 'Energy Brief item', description: 'Set from the Energy Brief entry that links here.' },
      seo: seoField,
    },
  },

  'api::category.category': {
    mainField: 'title',
    list: ['title', 'slug'],
    fields: {
      title: { label: 'Topic name', placeholder: 'Solar' },
      slug: { label: 'URL', description: 'Used in /news?topic=<url>.' },
      articles: { label: 'Articles' },
    },
  },

  'api::ticker.ticker': {
    mainField: 'headline',
    list: ['label', 'headline', 'is_active'],
    edit: [['label', 'is_active'], ['headline'], ['article']],
    fields: {
      label: { label: 'Label', placeholder: 'Solar', description: 'Short coloured word before the headline.' },
      headline: { label: 'Headline', placeholder: 'New utility-scale projects announced across four markets' },
      is_active: { label: 'Show in the brief', description: 'Turn off to hide without deleting.' },
      article: { label: 'Links to article', description: 'Optional.' },
    },
  },

  'api::page.page': {
    mainField: 'title',
    list: ['title', 'slug', 'updatedAt'],
    edit: [['title', 'slug'], ['sections'], ['seo']],
    fields: {
      title: { label: 'Page name', description: 'Used for the browser tab and search results.' },
      slug: {
        label: 'URL',
        description:
          'The page address: home, news, projects, companies, countries, insights, learning-center, technology, reports, opinion, interviews, events, about.',
      },
      sections: {
        label: 'Sections',
        description:
          'Content blocks with picks or longer text. The website finds each block by its slug, so keep the slugs as they are.',
      },
      seo: seoField,
    },
  },

  'api::country.country': {
    mainField: 'name',
    defaultSortBy: 'sort_order',
    defaultSortOrder: 'ASC',
    list: ['name', 'region', 'priority_market', 'sort_order'],
    edit: [
      ['name', 'slug'],
      ['region', 'priority_market'],
      ['market_label'],
      ['summary', 'image'],
      ['installed_capacity', 'tracked_projects', 'active_companies'],
      ['pipeline_projects', 'sort_order'],
      ['energy_mix'],
      ['latest_news'],
      ['latest_investment'],
      ['latest_policy'],
      ['projects'],
    ],
    fields: {
      name: { label: 'Country' },
      slug: {
        label: 'URL',
        description:
          'Map markers exist for south-africa, kenya, nigeria, egypt, namibia, ethiopia, morocco and ghana.',
      },
      region: { label: 'Region' },
      priority_market: {
        label: 'Priority market',
        description: 'Show on the Countries page (map and Priority markets). Untick for countries only used by projects.',
      },
      market_label: { label: 'Market description', placeholder: 'Solar and storage market' },
      summary: { label: 'Card line', placeholder: '6,240 MW operating · 118 projects' },
      image: { label: 'Card image' },
      installed_capacity: { label: 'Installed capacity', placeholder: '6,240 MW' },
      tracked_projects: { label: 'Tracked projects' },
      active_companies: { label: 'Active companies' },
      pipeline_projects: { label: 'Projects in pipeline' },
      energy_mix: { label: 'Energy mix', description: 'Number of projects per technology. The first is highlighted.' },
      latest_news: { label: 'Latest news line' },
      latest_investment: { label: 'Latest investment line' },
      latest_policy: { label: 'Latest policy line' },
      sort_order: { label: 'Order', description: 'Lower numbers come first.' },
      projects: { label: 'Projects in this country' },
    },
  },

  'api::company.company': {
    mainField: 'name',
    defaultSortBy: 'name',
    defaultSortOrder: 'ASC',
    list: ['name', 'company_type', 'headquarters', 'is_spotlight'],
    edit: [
      ['name', 'slug'],
      ['company_type', 'headquarters'],
      ['highlight', 'website'],
      ['image'],
      ['description'],
      ['is_spotlight'],
      ['spotlight_stats'],
    ],
    fields: {
      name: { label: 'Company name' },
      slug: { label: 'URL' },
      company_type: { label: 'Type', description: 'Used for the filters on the Companies page.' },
      headquarters: { label: 'Headquarters', placeholder: 'Nairobi' },
      highlight: { label: 'Key fact', placeholder: '1.8 GW geothermal led', description: 'Short line under the name.' },
      website: { label: 'Website', placeholder: 'https://' },
      image: { label: 'Image' },
      description: { label: 'About', description: 'Shown when the company is the spotlight.' },
      is_spotlight: { label: 'Company spotlight', description: 'Feature this company at the top of the Companies page.' },
      spotlight_stats: { label: 'Spotlight figures', description: 'Up to three figures shown in the spotlight.' },
    },
  },

  'api::project.project': {
    mainField: 'name',
    defaultSortBy: 'updatedAt',
    defaultSortOrder: 'DESC',
    list: ['name', 'technology', 'country', 'project_status'],
    edit: [
      ['name', 'slug'],
      ['technology', 'project_status'],
      ['country', 'developer'],
      ['capacity', 'image'],
      ['summary'],
    ],
    fields: {
      name: { label: 'Project name' },
      slug: { label: 'URL' },
      technology: { label: 'Technology' },
      project_status: { label: 'Stage' },
      country: { label: 'Country' },
      developer: { label: 'Developer / sponsor', placeholder: 'Globeleq' },
      capacity: { label: 'Capacity', placeholder: '80 MW / 320 MWh' },
      image: { label: 'Image' },
      summary: { label: 'Summary', description: 'Optional notes about the project.' },
    },
  },

  'api::deal.deal': {
    mainField: 'title',
    defaultSortBy: 'deal_date',
    defaultSortOrder: 'DESC',
    list: ['title', 'deal_type', 'value', 'deal_date'],
    edit: [['title'], ['deal_type', 'value'], ['markets', 'deal_date'], ['article']],
    fields: {
      title: { label: 'Headline' },
      deal_type: { label: 'Deal type' },
      value: { label: 'Value', placeholder: '$340M or 120 MW' },
      markets: { label: 'Countries', placeholder: 'Nigeria · Ghana · Senegal' },
      deal_date: { label: 'Date', description: 'Newest deals are shown first.' },
      article: { label: 'Story', description: 'Optional article the deal links to.' },
    },
  },

  'api::event.event': {
    mainField: 'title',
    defaultSortBy: 'start_date',
    defaultSortOrder: 'ASC',
    list: ['title', 'event_type', 'start_date', 'city'],
    edit: [
      ['title', 'slug'],
      ['event_type', 'attendance'],
      ['start_date', 'end_date'],
      ['city', 'venue'],
      ['description'],
      ['image', 'registration_url'],
      ['is_featured'],
      ['highlights'],
    ],
    fields: {
      title: { label: 'Event name' },
      slug: { label: 'URL' },
      event_type: { label: 'Type' },
      attendance: { label: 'Format' },
      start_date: { label: 'Start date' },
      end_date: { label: 'End date', description: 'Leave empty for one-day events.' },
      city: { label: 'City' },
      venue: { label: 'Venue' },
      description: { label: 'Description' },
      image: { label: 'Image' },
      registration_url: { label: 'Registration link', placeholder: 'https://' },
      is_featured: { label: 'Featured event', description: 'Show this event at the top of the Events page.' },
      highlights: { label: 'Featured figures', placeholder: '3,400+ / Delegates', description: 'Up to three figures.' },
    },
  },

  'api::insight.insight': {
    mainField: 'title',
    defaultSortBy: 'updatedAt',
    defaultSortOrder: 'DESC',
    list: ['title', 'insight_type', 'author', 'updatedAt'],
    edit: [
      ['title', 'slug'],
      ['insight_type', 'label'],
      ['summary'],
      ['pull_quote'],
      ['cover', 'report_file'],
      ['content'],
      ['author', 'read_time'],
      ['seo'],
    ],
    fields: {
      title: { label: 'Title' },
      slug: { label: 'URL', description: 'The page address: /insights/<url>.' },
      insight_type: { label: 'Section', description: 'Which Insights page this appears on.' },
      label: { label: 'Label', placeholder: 'SOLAR BASICS', description: 'Short label above the title.' },
      summary: { label: 'Summary' },
      pull_quote: { label: 'Pull quote', description: 'Optional quote shown when this is the featured read.' },
      cover: { label: 'Cover image' },
      report_file: { label: 'Report PDF', description: 'For reports: the downloadable file.' },
      content: { label: 'Text' },
      author: { label: 'Author', placeholder: 'Editorial Team' },
      read_time: { label: 'Read time (minutes)', description: 'Calculated automatically from the text if left empty.' },
      seo: seoField,
    },
  },

  'api::video.video': {
    mainField: 'title',
    defaultSortBy: 'updatedAt',
    defaultSortOrder: 'DESC',
    list: ['title', 'video_type', 'source', 'duration'],
    edit: [['title'], ['video_type', 'youtube_url'], ['source', 'duration'], ['thumbnail']],
    fields: {
      title: { label: 'Title' },
      video_type: { label: 'Where it shows', description: 'Reel: home page Reels strip. Video: Watch & Listen.' },
      youtube_url: {
        label: 'YouTube link',
        placeholder: 'https://www.youtube.com/watch?v=...',
        description: 'Required for reels. Videos without a link show the thumbnail only.',
      },
      source: { label: 'Source / channel', placeholder: 'DW News' },
      duration: { label: 'Length', placeholder: '02:42' },
      thumbnail: { label: 'Thumbnail', description: "Optional. Uses YouTube's thumbnail if empty." },
    },
  },

  'api::site-setting.site-setting': {
    edit: [
      ['site_name', 'tagline'],
      ['site_description'],
      ['default_share_image'],
      ['newsletter_heading', 'newsletter_button'],
      ['newsletter_text'],
      ['menu_featured_insight'],
      ['footer_columns'],
      ['social_links'],
      ['copyright_text'],
    ],
    fields: {
      site_name: { label: 'Site name' },
      tagline: { label: 'Tagline', description: 'Shown in the footer.' },
      site_description: { label: 'Site description', description: 'Used by search engines for the home page.' },
      default_share_image: { label: 'Default share image', description: 'Used when a page has no image of its own.' },
      newsletter_heading: { label: 'Newsletter heading' },
      newsletter_text: { label: 'Newsletter text' },
      newsletter_button: { label: 'Newsletter button', placeholder: 'Subscribe to the Brief' },
      menu_featured_insight: { label: 'Insights menu feature', description: 'Shown in the Insights drop-down menu.' },
      footer_columns: { label: 'Footer links' },
      social_links: { label: 'Social links' },
      copyright_text: { label: 'Copyright line', placeholder: '© 2026 Africa Energy. All rights reserved.' },
    },
  },
};

const SECTION_SLUG: FieldDoc = {
  label: 'Section slug',
  description: 'How the website finds this section. Do not change it on existing sections.',
};

export const COMPONENTS: Record<string, ViewDoc> = {
  'sections.article-list': {
    mainField: 'slug',
    edit: [['slug'], ['articles']],
    fields: {
      slug: SECTION_SLUG,
      articles: {
        label: 'Articles',
        description: 'Drag to reorder. Empty shows the newest articles. For the lead story, the first article is used.',
      },
    },
  },
  'sections.desk-group': {
    mainField: 'slug',
    edit: [['slug'], ['desks']],
    fields: {
      slug: SECTION_SLUG,
      desks: { label: 'Desks', description: 'One column each. A desk without articles shows the newest stories.' },
    },
  },
  'sections.insight-list': {
    mainField: 'slug',
    edit: [['slug'], ['insights']],
    fields: {
      slug: SECTION_SLUG,
      insights: { label: 'Insights', description: 'The first one is featured. Empty shows the newest guides.' },
    },
  },
  'sections.item-grid': {
    mainField: 'slug',
    edit: [['slug', 'title'], ['items']],
    fields: { slug: SECTION_SLUG, title: { label: 'Heading' }, items: { label: 'Items' } },
  },
  'sections.people': {
    mainField: 'slug',
    edit: [['slug', 'title'], ['people']],
    fields: { slug: SECTION_SLUG, title: { label: 'Heading' }, people: { label: 'People' } },
  },
  'sections.desk': {
    mainField: 'title',
    fields: { title: { label: 'Desk name', placeholder: 'Trending' }, articles: { label: 'Articles', description: 'Four stories.' } },
  },
  'sections.text-columns': {
    mainField: 'slug',
    edit: [['slug', 'title'], ['left', 'right'], ['note']],
    fields: {
      slug: SECTION_SLUG,
      title: { label: 'Heading' },
      left: { label: 'Left column', description: 'Leave a blank line between paragraphs.' },
      right: { label: 'Right column' },
      note: { label: 'Small line under the text' },
    },
  },
  'shared.text-item': {
    mainField: 'title',
    fields: { title: { label: 'Heading' }, text: { label: 'Text' } },
  },
  'shared.person': {
    mainField: 'name',
    edit: [['name', 'initials'], ['role', 'highlight']],
    fields: {
      name: { label: 'Name' },
      initials: { label: 'Initials', placeholder: 'AC', description: 'Shown on the tile. Defaults to the first letters of the name.' },
      role: { label: 'Role', placeholder: 'West Africa correspondent · Lagos' },
      highlight: { label: 'Highlight', description: 'Green tile instead of navy.' },
    },
  },
  'shared.stat': {
    mainField: 'value',
    fields: { value: { label: 'Figure', placeholder: '6.2 GW' }, label: { label: 'Label', placeholder: 'Operating' } },
  },
  'shared.link': {
    mainField: 'label',
    fields: { label: { label: 'Text' }, url: { label: 'Link', placeholder: '/news or https://...' } },
  },
  'shared.energy-mix': {
    mainField: 'technology',
    fields: { technology: { label: 'Technology', placeholder: 'Solar' }, projects: { label: 'Projects' } },
  },
  'shared.footer-column': {
    mainField: 'heading',
    fields: { heading: { label: 'Column heading', placeholder: 'NEWS' }, links: { label: 'Links' } },
  },
  'shared.seo': {
    mainField: 'metaTitle',
    edit: [['metaTitle'], ['metaDescription'], ['metaImage'], ['keywords'], ['canonicalURL', 'metaRobots']],
    fields: {
      metaTitle: { label: 'Search title', description: 'Up to 60 characters.' },
      metaDescription: { label: 'Search description', description: 'Up to 160 characters.' },
      metaImage: { label: 'Share image' },
      keywords: { label: 'Keywords', placeholder: 'solar, Nigeria, financing' },
      canonicalURL: { label: 'Canonical URL', description: 'Advanced. Only if this content first appeared elsewhere.' },
      metaRobots: { label: 'Robots', placeholder: 'noindex', description: 'Advanced. Leave empty to allow indexing.' },
      metaSocial: { label: 'Social overrides', description: 'Advanced.' },
      structuredData: { label: 'Structured data (JSON)', description: 'Advanced.' },
      metaViewport: { label: 'Viewport', description: 'Advanced. Leave empty.' },
    },
  },
};

type EditCell = { name: string; size: number };
type Configuration = {
  settings: Record<string, unknown>;
  metadatas: Record<string, { edit: Record<string, unknown>; list: Record<string, unknown> }>;
  layouts: { list: string[]; edit: EditCell[][] };
};

const MAX_ROW = 12;

function applyDoc(config: Configuration, doc: ViewDoc): Configuration {
  const next: Configuration = structuredClone(config);
  const has = (name: string) => Boolean(next.metadatas[name]);

  if (doc.mainField && has(doc.mainField)) next.settings.mainField = doc.mainField;
  if (doc.defaultSortBy && has(doc.defaultSortBy)) {
    next.settings.defaultSortBy = doc.defaultSortBy;
    next.settings.defaultSortOrder = doc.defaultSortOrder ?? 'ASC';
  }

  for (const [name, field] of Object.entries(doc.fields)) {
    const meta = next.metadatas[name];
    if (!meta) continue;
    if (field.label) {
      meta.edit.label = field.label;
      meta.list.label = field.label;
    }
    if (field.description !== undefined) meta.edit.description = field.description;
    if (field.placeholder !== undefined) meta.edit.placeholder = field.placeholder;
  }

  if (doc.list) next.layouts.list = doc.list.filter(has);

  if (doc.edit) {
    const sizes = new Map<string, number>();
    for (const cell of next.layouts.edit.flat()) sizes.set(cell.name, cell.size);
    const placed = new Set<string>();
    const rows: EditCell[][] = [];

    for (const row of doc.edit) {
      let current: EditCell[] = [];
      for (const name of row) {
        if (!has(name)) continue;
        // Fields hidden from the stored layout come back at the default width.
        const original = sizes.get(name) ?? 6;
        // Full-width-only fields (components, rich text) keep their size.
        const size = original === MAX_ROW ? MAX_ROW : Math.min(doc.fields[name]?.size ?? original, MAX_ROW);
        if (current.reduce((sum, cell) => sum + cell.size, 0) + size > MAX_ROW) {
          rows.push(current);
          current = [];
        }
        current.push({ name, size });
        placed.add(name);
      }
      if (current.length > 0) rows.push(current);
    }

    for (const row of next.layouts.edit) {
      const rest = row.filter((cell) => !placed.has(cell.name));
      if (rest.length > 0) rows.push(rest);
    }
    next.layouts.edit = rows;
  }

  return next;
}

export async function applyAdminLayout(strapi: Core.Strapi) {
  const store = strapi.store({ type: 'plugin', name: 'africa-energy', key: 'admin-layout-version' });
  if ((await store.get()) === LAYOUT_VERSION) return;

  const contentManager = strapi.plugin('content-manager');
  const targets: ['content-types' | 'components', Record<string, ViewDoc>][] = [
    ['content-types', CONTENT_TYPES],
    ['components', COMPONENTS],
  ];

  for (const [serviceName, docs] of targets) {
    const service = contentManager.service(serviceName);
    for (const [uid, doc] of Object.entries(docs)) {
      const models = (serviceName === 'content-types' ? strapi.contentTypes : strapi.components) as unknown as Record<
        string,
        unknown
      >;
      const exists = models[uid];
      if (!exists) continue;
      const { uid: _uid, category: _category, ...config } = await service.findConfiguration(exists);
      await service.updateConfiguration(exists, applyDoc(config as Configuration, doc));
    }
  }

  await store.set({ value: LAYOUT_VERSION });
  strapi.log.info(`Applied admin layout v${LAYOUT_VERSION}`);
}
