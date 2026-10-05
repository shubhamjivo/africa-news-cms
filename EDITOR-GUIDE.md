# Editor guide

Where each part of the website is edited in the CMS. Everything goes live when you press **Publish**, usually within a few seconds.

## Pages and sections

Every page of the website is an entry in **Page**, found by its **URL** (slug): `home`, `news`, `projects`, `companies`, `countries`, `insights`, `learning-center`, `technology`, `reports`, `opinion`, `interviews`, `events`, `about`. Each page has **SEO & sharing** for its search title, description and image.

**Sections** hold only content with picks or longer text; headings, intros and links are part of the website design. Each section has a **Section slug** the website uses to find it, so keep slugs as they are.

| Page | Sections |
|---|---|
| **home** | `lead-story` (first article is the big story), `what-matters-today` (article picks), `africa-times` (four desks of article picks), `news` (the 8-card News grid), `insights` (first insight is featured). Empty picks show the newest content. |
| **about** | `intro` (two text columns), `coverage`, `bureaus`, `newsroom` (team). |

Lists of articles, projects, events and so on come from the collection types below, not from sections.

## Content Manager → Single types

| Entry | Controls |
|---|---|
| **Site Settings** | Site name, tagline, newsletter box text and button, footer links, social links, copyright line, and the item shown in the Insights drop-down menu. Shared by every page. |

## Content Manager → Collection types

| Type | Appears on |
|---|---|
| **Article** | `/news`, home page news sections, article pages `/news/<url>`. Set a *Topic*, a *Summary* and a *Main image* on every article. *More photos* turns the main image into a slideshow. |
| **Category** | The topic label above headlines and the topic filters on `/news`. |
| **Energy Brief** | The scrolling ticker on the home page. Untick *Show in the brief* to hide an item. |
| **Insight** | `/insights` and its sub-pages. The *Section* field chooses the sub-page (Learning Center, Technology, Reports, Opinion, Interviews). Each insight also gets its own page at `/insights/<url>`. |
| **Project** | `/projects` and Project Watch on the home page. The filters are built from the technologies in use. |
| **Company** | `/companies`. Tick *Company spotlight* on one company to feature it at the top of the page. |
| **Deal** | Energy Investment Watch on the home page and Recent deals on `/companies`, newest first. |
| **Country** | `/countries`. Tick *Priority market* to show a country on the page; those with a map shape also get a marker. |
| **Event** | `/events`. An event stays listed until its end date has passed. Tick *Featured event* to show it at the top of the page. |
| **Video** | *Reel*: the home page Reels strip (needs a YouTube link). *Video*: Watch & Listen and the replays on `/events`. |

## Tips

- **Drafts:** *Save* keeps a draft. Only **Publish** makes it visible.
- **Read time** is filled in automatically from the text if you leave it empty.
- **SEO & sharing** is optional. Without it, the title, summary and main image are used.
- **Images:** landscape, at least 1600 px wide for main images.

## For developers

- Field labels, help text and list columns live in `src/admin-layout.ts`. Bump `LAYOUT_VERSION` to re-apply them; this overwrites manual changes made under "Configure the view".
- `npm run seed:dummy` loads the reference site's dummy articles and story picks (https://jivo-energy-news-development.vercel.app). For development only.
- `npm run seed` creates example content for empty content types. It is safe to re-run: it only creates missing entries and fills empty fields on Page entries.
- Publishing calls the website's `/api/revalidate` (`WEBSITE_REVALIDATE_URL` / `WEBSITE_REVALIDATE_SECRET` in `.env`).
