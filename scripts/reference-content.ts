// Static content of the approved site (africa-energy-news commit 1f2a329),
// used by seed-dummy.ts to recreate the reference site's dummy data.


export const UTILITY_LINKS = [
  { href: "/#latest", label: "Latest" },
  { href: "/#africa-times", label: "Africa Times" },
  { href: "/#brief", label: "Africa Energy Brief" },
  { href: "/#project-watch", label: "Project Watch" },
  { href: "/#newsletter", label: "Newsletter" },
] as const;

export const DATE_LINE = "Thu, Aug 27, 2026 · 10:46 UTC";

export const MOBILE_DATE = "Thu, Aug 27, 2026";
export const MOBILE_TIME = "10:46 UTC";

export const LATEST_STORIES = [
  {
    kicker: "SOLAR",
    title: "Egypt advances new solar-plus-storage investment programme",
    meta: "42 min ago · Egypt",
    image: "/images/latest-solar.png",
  },
  {
    kicker: "BATTERY STORAGE",
    title: "Utility-scale battery deployment accelerates across Southern Africa",
    meta: "1 hr ago · South Africa · Zambia",
    image: "/images/latest-battery.png",
  },
  {
    kicker: "WIND",
    title: "New wind development pipeline expands in East Africa",
    meta: "3 hr ago · Kenya · Ethiopia",
    image: "/images/latest-wind.png",
  },
  {
    kicker: "GREEN HYDROGEN",
    title: "Green hydrogen projects move from announcements toward execution",
    meta: "5 hr ago · Namibia · Mauritania",
    image: "/images/latest-hydrogen.png",
  },
  {
    kicker: "GRID",
    title: "Kenya accelerates solar and wind development as grid investment grows",
    meta: "2 hr ago · Kenya",
    image: "/images/latest-grid.png",
  },
  {
    kicker: "INVESTMENT",
    title: "West African solar consortium reaches $340M financial close",
    meta: "6 hr ago · Nigeria · Ghana · Senegal",
    image: "/images/latest-investment.png",
  },
] as const;

export const LEAD_STORY = {
  slug: "africas-renewable-energy-investment-pipeline-enters-a-new-phase",
  href: "/news/africas-renewable-energy-investment-pipeline-enters-a-new-phase",
  image: "/images/lead-featured.png",
  caption: "1 / 4 · Utility-scale solar array at sunrise — West Africa",
  kicker: "SOLAR · INVESTMENT",
  markets: "NIGERIA · GHANA · SENEGAL",
  title: "Africa's Renewable Energy Investment Pipeline Enters a New Phase",
  dek: "A wave of financial closes across West Africa signals growing confidence from development finance institutions and private capital in utility-scale solar and storage.",
  byline: "By Amara Chukwu · 18 min ago · 6 min read",
  author: "Amara Chukwu",
  publishedAt: "2026-08-27T10:28:00.000Z",
  gallery: [
    {
      src: "/images/lead-featured.png",
      alt: "Utility-scale solar array at sunrise — West Africa",
      caption: "Utility-scale solar array at sunrise — West Africa",
    },
    {
      src: "/images/news-image/rooftop.png",
      alt: "Rooftop solar module on a hybrid mounting frame",
      caption: "Rooftop solar module on a hybrid mounting frame",
    },
    {
      src: "/images/news-image/module.png",
      alt: "Utility-scale module on a tracker mount",
      caption: "Utility-scale module on a tracker mount",
    },
    {
      src: "/images/news-image/junction.png",
      alt: "Junction box and DC cabling on a 400W module",
      caption: "Junction box and DC cabling on a 400W module",
    },
  ],
} as const;

export const ARTICLE_BODY: { type: "p" | "h2"; text: string }[] = [
  {
    type: "p",
    text: "LAGOS — A cluster of financial closes across Nigeria, Ghana and Senegal has shifted West Africa's utility-scale solar pipeline from announcement to execution. Developers, development finance institutions and commercial lenders say the deals are the first clear sign that hybrid solar-plus-storage projects can be banked at scale in the region — not only as demonstration assets, but as the core of new generation programmes.",
  },
  {
    type: "p",
    text: "The latest close, a $340 million regional vehicle pooling DFI capital with independent power producers, is the largest of four transactions completed since June. Together they cover more than 1.1 GW of solar and roughly 400 MWh of four-hour battery storage. Sponsors say the storage tranche was the condition that unlocked evening-peak offtake, rather than an optional extra.",
  },
  {
    type: "p",
    text: "\"For years the pipeline was a slide deck,\" said a Lagos-based project-finance banker who worked on two of the closes. \"What changed is that offtakers will now pay for firm power in the evening window, and lenders will underwrite that as a contracted product. That is a different market from selling midday megawatts into a congested grid.\"",
  },
  {
    type: "h2",
    text: "Storage is now part of the deal",
  },
  {
    type: "p",
    text: "Battery costs have fallen far enough that four-hour systems are being written into power-purchase agreements rather than parked in later phases. In Ghana, a sovereign-backed co-investment structure pairs desert and coastal PV with storage sized to the evening ramp. In Senegal, a first-of-kind bid window requires storage as a condition of dispatch, not a later upgrade.",
  },
  {
    type: "p",
    text: "That shift is also changing how risk is allocated. Lenders are asking for grid-code compliance, curtailment protection and offtaker payment security before they will fund the battery. Where those pieces are in place — typically a blend of DFI guarantees, liquidity facilities and take-or-pay offtake — closes are moving in months rather than years.",
  },
  {
    type: "p",
    text: "Nigeria remains the largest of the three markets by pipeline, but also the most sensitive to grid constraints. Sponsors there are clustering projects around new substations and industrial offtakers rather than relying solely on the bulk supplier. Corporate PPAs, still a small share of the book, are being used to firm revenue where sovereign offtake is slow to credit-enhance.",
  },
  {
    type: "h2",
    text: "What the pipeline still needs",
  },
  {
    type: "p",
    text: "Transmission, not turbines or panels, is the binding constraint. Several shovel-ready plants in Nigeria and Ghana are waiting on line upgrades that sit outside the generation close. Mission 300 concessional facilities are being stacked against those gaps, but developers say the sequencing is still wrong: generation reaches financial close while evacuation remains a public-works timetable.",
  },
  {
    type: "p",
    text: "Currency and convertibility remain the other unfinished piece. The recent closes used a mix of hard-currency offtake, local-currency tranches with DFI hedges, and escrowed dollar receivables from industrial buyers. That structure works for a handful of well-advised sponsors. It does not yet work as a template for the next 5 GW sitting in West African permitting queues.",
  },
  {
    type: "p",
    text: "Even so, the signal to private capital is clearer than it was a year ago. Funds that sat out earlier bid rounds are returning with term sheets that assume storage, not just solar. If the next two quarters deliver the same pace of closes — and if grid investment keeps up — West Africa's pipeline will look less like a list of memorandums and more like a construction programme.",
  },
];

export function getArticleBySlug(slug: string) {
  if (slug !== LEAD_STORY.slug) return undefined;
  return { ...LEAD_STORY, body: ARTICLE_BODY };
}

export function getArticleSlugs() {
  return [LEAD_STORY.slug];
}

export type Article = NonNullable<ReturnType<typeof getArticleBySlug>>;

export const RELATED_NEWS = [
  {
    kicker: "HYDROGEN",
    title: "Green hydrogen projects move from announcements toward execution",
    dek: "Namibia and Mauritania advance offtake talks as hubs near FID.",
    image: "/images/related-hydrogen.png",
  },
  {
    kicker: "POLICY",
    title: "Mission 300 financing framework reaches new milestones",
    dek: "Concessional capital is stacked against private offtake in four markets.",
    image: "/images/related-policy.png",
  },
  {
    kicker: "POLICY",
    title: "Mission 300 financing framework reaches new milestones",
    dek: "Concessional capital is stacked against private offtake in four markets.",
    image: "/images/related-policy.png",
  },
  {
    kicker: "STORAGE",
    title: "Malawi advances utility-scale battery storage deployment",
    dek: "A first-of-kind bid window is designed to firm hydro in the dry season.",
    image: "/images/related-storage.png",
  },
] as const;

export const WHAT_MATTERS = [
  {
    kicker: "GRID",
    title: "Kenya accelerates solar and wind as grid investment grows",
    dek: "New transmission is unlocking a backlog of shovel-ready projects.",
    image: "/images/matters-grid.png",
  },
  {
    kicker: "POLICY",
    title: "Mission 300 financing framework reaches new milestones",
    dek: "Concessional capital is stacked against private offtake in four markets.",
    image: "/images/matters-policy.png",
  },
  {
    kicker: "STORAGE",
    title: "Malawi advances utility-scale battery storage deployment",
    dek: "A first-of-kind bid window is designed to firm hydro in the dry season.",
    image: "/images/matters-storage.png",
  },
  {
    kicker: "HYDROGEN",
    title: "Green hydrogen projects move from announcements toward execution",
    dek: "Namibia and Mauritania advance offtake talks as hubs near FID.",
    image: "/images/matters-hydrogen.png",
  },
  {
    kicker: "SOLAR",
    title: "Egypt advances new solar-plus-storage investment programme",
    dek: "Cairo is pairing desert PV with four-hour batteries to firm evening peak.",
    image: "/images/matters-solar.png",
  },
  {
    kicker: "WIND",
    title: "New wind development pipeline expands in East Africa",
    dek: "Developers are stacking hybrid configurations as grid codes tighten around variability.",
    image: "/images/matters-wind.png",
  },
  {
    kicker: "INVESTMENT",
    title: "West African solar consortium reaches $340M financial close",
    dek: "A regional vehicle pools DFI capital with independent power producers across four markets.",
    image: "/images/matters-investment.png",
  },
  {
    kicker: "COMPANIES",
    title: "Pan-African IPP acquires majority stake in Southern African storage developer",
    dek: "The deal consolidates a pipeline of utility-scale batteries in South Africa and Zambia.",
    image: "/images/matters-companies.png",
  },
] as const;

export const AFRICA_TIMES = [
  {
    title: "Trending",
    stories: [
      { title: "Egypt advances new solar-plus-storage investment programme", image: "/images/times-1.png" },
      { title: "Mission 300 financing framework reaches new milestone", image: "/images/times-2.png" },
      { title: "Malawi advances utility-scale battery storage deployment", image: "/images/times-3.png" },
      { title: "Kenya accelerates solar and wind as grid investment grows", image: "/images/times-4.png" },
    ],
  },
  {
    title: "Missed It",
    stories: [
      { title: "Climate fund approves concessional facility for Ethiopian transmission", image: "/images/times-3.png" },
      { title: "Pan-African IPP acquires majority stake in Southern African storage developer", image: "/images/times-5.png" },
      { title: "Corporate offtaker signs 15-year solar PPA for East African hub", image: "/images/times-6.png" },
      { title: "West African solar consortium reaches $340M financial close", image: "/images/times-2.png" },
    ],
  },
  {
    title: "Most Read",
    stories: [
      { title: "Kenya accelerates solar and wind development as grid investment grows", image: "/images/times-4.png" },
      { title: "Egypt advances new solar-plus-storage investment programme", image: "/images/times-1.png" },
      { title: "Mission 300 financing framework reaches new milestones", image: "/images/times-2.png" },
      { title: "Green hydrogen projects move from announcements toward execution", image: "/images/times-7.png" },
    ],
  },
  {
    title: "The Brief",
    stories: [
      { title: "Solar: new utility-scale projects announced across four markets", image: "/images/times-2.png" },
      { title: "Storage: battery deployments accelerate as tender pipelines grow", image: "/images/times-8.png" },
      { title: "Grid: transmission investment becomes the sector's top priority", image: "/images/times-9.png" },
      { title: "Policy: new renewable-energy frameworks emerge in West Africa", image: "/images/times-2.png" },
    ],
  },
] as const;

export const ENERGY_BRIEF = [
  { kicker: "Solar", text: "New utility-scale projects announced across four markets" },
  { kicker: "Storage", text: "Battery deployments accelerate as tender pipelines grow" },
  { kicker: "Policy", text: "New renewable-energy frameworks emerge in West Africa" },
  { kicker: "Grid", text: "Kenya accelerates solar and wind as grid investment grows" },
  { kicker: "Deals", text: "West African solar consortium reaches $340M financial close" },
  { kicker: "Hydrogen", text: "Namibia and Mauritania advance offtake talks as hubs near FID" },
] as const;

export const NEWS_FILTERS = [
  "All",
  "Solar",
  "Wind",
  "Battery",
  "Hydrogen",
  "Grid",
  "Policy",
  "Offtake",
  "Companies",
  "Investment",
] as const;

export const NEWS_RELATED = [
  {
    kicker: "GRID",
    title: "Kenya accelerates solar and wind development as grid investment grows",
    meta: "2 hr ago · Kenya",
    image: "/images/latest-grid.png",
  },
  {
    kicker: "POLICY",
    title: "Mission 300 financing framework reaches new milestone",
    meta: "8 hr ago · Continent",
    image: "/images/related-policy.png",
  },
  {
    kicker: "STORAGE",
    title: "Malawi advances utility-scale battery storage deployment",
    meta: "11 hr ago · Malawi",
    image: "/images/related-storage.png",
  },
  {
    kicker: "HYDROGEN",
    title: "Green hydrogen projects move from announcements toward execution",
    meta: "5 hr ago · Namibia · Mauritania",
    image: "/images/related-hydrogen.png",
  },
] as const;

export const NEWS_LATEST = [
  {
    kicker: "SOLAR",
    title: "West African solar consortium reaches $340M financial close",
    dek: "A regional vehicle pools DFI capital with independent power producers across four markets.",
    byline: "By Naledi Mokoena · 6 hr ago · Nigeria · Ghana · Senegal",
    image: "/images/news-1.png",
  },
  {
    kicker: "GRID",
    title: "Climate fund approves concessional facility for Ethiopian transmission",
    dek: "New lines are designed to unlock a backlog of highland wind and solar.",
    byline: "By Daniel Bekele · 9 hr ago · Ethiopia",
    image: "/images/news-2.png",
  },
  {
    kicker: "COMPANIES",
    title: "Pan-African IPP acquires majority stake in Southern African storage developer",
    dek: "The deal consolidates a pipeline of utility-scale batteries in South Africa and Zambia.",
    byline: "By Amara Chukwu · 12 hr ago · South Africa · Zambia",
    image: "/images/news-3.png",
  },
  {
    kicker: "OFFTAKE",
    title: "Corporate offtaker signs 15-year solar PPA for East African manufacturing hub",
    dek: "Industrial demand is becoming a bankable counterpart to sovereign tenders.",
    byline: "By Wanjiku Kariuki · Yesterday · Kenya",
    image: "/images/news-4.png",
  },
  {
    kicker: "WIND",
    title: "New wind development pipeline expands in East Africa",
    dek: "Developers are stacking hybrid configurations as grid codes tighten around variability.",
    byline: "By Daniel Bekele · Yesterday · Kenya · Ethiopia",
    image: "/images/news-7.png",
  },
  {
    kicker: "BATTERY STORAGE",
    title: "Utility-scale battery deployment accelerates across Southern Africa",
    dek: "Tender pipelines in South Africa and Zambia point to a multi-gigawatt storage decade.",
    byline: "By Naledi Mokoena · Yesterday · South Africa · Zambia",
    image: "/images/latest-battery.png",
  },
  {
    kicker: "SOLAR",
    title: "Egypt advances new solar-plus-storage investment programme",
    dek: "Cairo is pairing desert PV with four-hour batteries to firm evening peak.",
    byline: "By Layla Hassan · 2 days ago · Egypt",
    image: "/images/news-5.png",
  },
  {
    kicker: "INVESTMENT",
    title: "Transmission investment becomes the sector's top priority",
    dek: "Without wires, a decade of generation auctions will stall at the substation gate.",
    byline: "By Editorial · 2 days ago · Continent",
    image: "/images/matters-grid.png",
  },
] as const;

export const NEWS_CARDS = [
  {
    kicker: "SOLAR",
    accent: true,
    title: "West African solar consortium reaches $340M financial close",
    dek: "A regional vehicle pools DFI capital with independent power producers across four markets.",
    image: "/images/news-1.png",
  },
  {
    kicker: "GRID",
    title: "Climate fund approves concessional facility for Ethiopian transmission",
    dek: "New lines are designed to unlock a backlog of highland wind and solar.",
    image: "/images/news-2.png",
  },
  {
    kicker: "COMPANIES",
    title: "Pan-African IPP acquires majority stake in Southern African storage developer",
    dek: "The deal consolidates a pipeline of utility-scale batteries in South Africa and Zambia.",
    image: "/images/news-3.png",
  },
  {
    kicker: "OFFTAKE",
    title: "Corporate offtaker signs 15-year solar PPA for East African manufacturing hub",
    dek: "Industrial demand is becoming a bankable counterpart to sovereign tenders.",
    image: "/images/news-4.png",
  },
  {
    kicker: "SOLAR",
    title: "Egypt advances new solar-plus-storage investment programme",
    dek: "Cairo is pairing desert PV with four-hour batteries to firm evening peak.",
    image: "/images/news-5.png",
  },
  {
    kicker: "GRID",
    title: "Kenya accelerates solar and wind as grid investment grows",
    dek: "New transmission capacity is unlocking a backlog of shovel-ready projects.",
    image: "/images/news-6.png",
  },
  {
    kicker: "WIND",
    title: "New wind development pipeline expands in East Africa",
    dek: "Developers are stacking hybrid configurations as grid codes tighten.",
    image: "/images/news-7.png",
  },
  {
    kicker: "HYDROGEN",
    title: "Green hydrogen projects move from announcements toward execution",
    dek: "Namibia and Mauritania advance offtake talks as hubs near FID.",
    image: "/images/news-8.png",
  },
] as const;

export const REELS = [
  {
    title: "How South Africa is curbing energy poverty with solar",
    duration: "02:42",
    youtubeId: "_OOuBxky5f8",
    source: "DW News",
  },
  {
    title: "Solar charging stations electrifying Kenya",
    duration: "01:54",
    youtubeId: "2YdSDPI-Vkw",
    source: "The Earthshot Prize",
  },
  {
    title: "Africa's untapped renewable potential",
    duration: "00:45",
    youtubeId: "B6YHe4ZAo6o",
    source: "Modo Energy",
  },
  {
    title: "Solar ambulance brings hope to remote Kenya",
    duration: "03:00",
    youtubeId: "Nld1mQSRVQ8",
    source: "News Central TV",
  },
  {
    title: "Can Nigeria become Africa's renewable energy hub?",
    duration: "02:27",
    youtubeId: "Xu2KQncWr7c",
    source: "NTA Network",
  },
  {
    title: "Inside Solar & Storage Live Africa in Johannesburg",
    duration: "00:31",
    youtubeId: "RFlspIcvfGc",
    source: "JA Solar Africa",
  },
] as const;

export const PROJECT_FILTERS = [
  "All",
  "Solar",
  "Wind",
  "Battery",
  "Hydrogen",
  "Hydro",
  "Geothermal",
] as const;

export const PROJECTS = [
  {
    kicker: "TANZANIA · SOLAR PV",
    title: "Dodoma Solar PV",
    meta: "Meridian Power Partners  ·  Updated 2 days ago",
    image: "/images/project-1.png",
    filter: "Solar",
  },
  {
    kicker: "SOUTH AFRICA · WIND",
    title: "Karoo Wind Extension",
    meta: "Highveld Renewables  ·  Updated 5 days ago",
    image: "/images/project-2.png",
    filter: "Wind",
  },
  {
    kicker: "NIGERIA · BATTERY STORAGE",
    title: "Lagos Grid Storage I",
    meta: "Delta Energy Systems  ·  Updated 1 day ago",
    image: "/images/project-3.png",
    filter: "Battery",
  },
  {
    kicker: "EGYPT · GREEN HYDROGEN",
    title: "Suez Hydrogen Hub",
    meta: "NorthStar H2  ·  Updated 3 days ago",
    image: "/images/project-4.png",
    filter: "Hydrogen",
  },
  {
    kicker: "KENYA · GEOTHERMAL",
    title: "Rift Valley Expansion",
    meta: "KenGen  ·  Updated 4 days ago",
    image: "/images/project-5.png",
    filter: "Geothermal",
  },
  {
    kicker: "ZAMBIA · SOLAR",
    title: "Copperbelt Solar Park",
    meta: "Globeleq  ·  Updated 5 days ago",
    image: "/images/project-1.png",
    filter: "Solar",
  },
  {
    kicker: "NAMIBIA · HYDROGEN",
    title: "Tsau Khaeb Green H2",
    meta: "Hyphen Hydrogen  ·  Updated 1 week ago",
    image: "/images/project-6.png",
    filter: "Hydrogen",
  },
  {
    kicker: "ETHIOPIA · WIND",
    title: "Aysha Wind Corridor",
    meta: "Ethiopian Electric Power  ·  Updated 1 week ago",
    image: "/images/project-7.png",
    filter: "Wind",
  },
] as const;

export const INSIGHT_FEATURED = {
  title: "What is renewable energy—and how does it work?",
  dek: "A practical guide to power from sunlight, wind, water and heat—and why these sources naturally replenish.",
  read: "7 min read",
  byline: "By Editorial Team",
  image: "/images/insight-cover.jpeg"
} as const;

export const INSIGHT_CARDS = [
  {
    kicker: "SOLAR BASICS",
    title: "How solar panels turn sunlight into usable electricity",
    dek: "A simple look at photovoltaic cells, wiring and inverters.",
    image: "/images/insight-1.png",
  },
  {
    kicker: "BATTERY",
    title: "How batteries keep solar energy available after sunset",
    dek: "Stored daytime power supports lights and appliances at night.",
    image: "/images/insight-2.png",
  },
  {
    kicker: "SMART GRID",
    title: "How smart grids balance changing renewable power",
    dek: "Forecasting and flexible demand keep supply and use in step.",
    image: "/images/insight-3.png",
  },
] as const;

export const INSIGHT_SIDEBAR = [
  {
    title: "Solar panels explained: cells, modules and inverters",
    dek: "Learn how individual photovoltaic cells are combined into panels and connected through an inverter.",
    read: "5 min read",
  },
  {
    title: "How home batteries extend solar use into the night",
    dek: "A battery saves surplus daytime electricity so lights and appliances can run after the sun goes down.",
    read: "6 min read",
  },
  {
    title: "What happens to solar generation on cloudy days?",
    dek: "Panels still generate electricity in diffuse light, though output changes with cloud cover and system design.",
    read: "4 min read",
  },
  {
    title: "Can wind and solar power a grid around the clock?",
    dek: "A reliable renewable grid combines diverse locations, storage, transmission and flexible demand.",
    read: "7 min read",
  },
  // {
  //   title: "how does wind and power a grid around the clock?",
  //   dek: "A reliable renewable grid combines diverse locations, storage, transmission and flexible demand.",
  //   read: "7 min read",
  // },
] as const;

export const INVESTMENTS = [
  {
    kicker: "FINANCIAL CLOSE",
    title: "West African solar consortium reaches $340M financial close",
    value: "$340M",
  },
  {
    kicker: "DEVELOPMENT FINANCE",
    title: "Climate fund approves concessional facility for Ethiopian transmission",
    value: "$210M",
  },
  {
    kicker: "M&A",
    title: "Pan-African IPP acquires majority stake in Southern African storage developer",
    value: "$95M",
  },
  {
    kicker: "PPA",
    title: "Corporate offtaker signs 15-year solar PPA for East African manufacturing hub",
    value: "120 MW",
  },
] as const;

export const VIDEOS = [
  {
    title: "Inside Africa's largest battery storage facility",
    image: "/images/video-1.png",
  },
  {
    title: "The financing gap: talking storage with regional lenders",
    image: "/images/video-2.png",
  },
  {
    title: "This week in Africa energy: five stories explained",
    image: "/images/video-3.png",
  },
] as const;

export const REPORTS = [
  { title: "Africa Solar Market Outlook", image: "/images/report-1.png" },
  { title: "Africa Battery Storage Outlook", image: "/images/report-2.png" },
  { title: "Africa Renewable Energy Investment Report", image: "/images/report-3.png" },
  { title: "Africa Green Hydrogen Outlook", image: "/images/report-4.png" },
] as const;

export const FOOTER_COLUMNS = [
  {
    heading: "NEWS",
    links: [
      { href: "/news", label: "Latest" },
      { href: "/#africa-times", label: "Trending" },
      { href: "/#brief", label: "Africa Energy Brief" },
    ],
  },
  {
    heading: "INTELLIGENCE",
    links: [
      { href: "/projects", label: "Projects" },
      { href: "/companies", label: "Companies" },
      { href: "/countries", label: "Countries" },
    ],
  },
  {
    heading: "MORE",
    links: [
      { href: "/insights", label: "Insights" },
      { href: "/events", label: "Events" },
      { href: "/about", label: "About" },
    ],
  },
] as const;
