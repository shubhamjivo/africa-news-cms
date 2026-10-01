# Editor guide

Where each part of the website is edited in the CMS. Everything goes live when you press **Publish**, usually within a few seconds.

## Content Manager → Single types

| Entry | Controls |
|---|---|
| **Home Page** | **Page sections:** the home page sections from top to bottom. Drag to reorder, tick *Hidden* to hide one, and edit a section's headings and link. **Story picks:** Lead story, What Matters Today, the four Africa Times desks and the featured Insight. If a pick is left empty, the newest stories are shown. |
| **Site Settings** | Site name, tagline, newsletter box text and button, footer links, social links, copyright line, and the item shown in the Insights drop-down menu. |

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
| **Country** | `/countries`. Countries with a map shape get a marker on the map; all of them appear under Priority markets. |
| **Event** | `/events`. An event stays listed until its end date has passed. Tick *Featured event* to show it at the top of the page. |
| **Video** | *Reel*: the home page Reels strip (needs a YouTube link). *Video*: Watch & Listen and the replays on `/events`. |
| **Page** | The small heading, page heading, intro text and SEO for fixed pages (News, Projects, Companies…). *Headline figures* adds the row of numbers on Projects. |

## Tips

- **Drafts:** *Save* keeps a draft. Only **Publish** makes it visible.
- **Read time** is filled in automatically from the text if you leave it empty.
- **SEO & sharing** is optional. Without it, the title, summary and main image are used.
- **Images:** landscape, at least 1600 px wide for main images.

## For developers

- Field labels, help text and list columns live in `src/admin-layout.ts`. Bump `LAYOUT_VERSION` to re-apply them; this overwrites manual changes made under "Configure the view".
- `npm run seed` creates example content for empty content types. It is safe to re-run: it only creates missing entries and fills empty fields on Page entries.
- Publishing calls the website's `/api/revalidate` (`WEBSITE_REVALIDATE_URL` / `WEBSITE_REVALIDATE_SECRET` in `.env`).
