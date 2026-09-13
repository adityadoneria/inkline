# Inkline — Full Product & Build Specification
*(Datawrapper-style tool: data → chart → publish/embed)*
*(v3 — Merged spec + tech stack, frontend-only architecture, full chart catalog, Datawrapper-parity line/area chart behavior)*

> Name note: "Inkline" collides with an existing Vue.js UI library at `github.com/inkline`. Going with it anyway — just don't expect the plain `inkline` npm package name or GitHub org to be free.

---

## 1. Product Overview

**What it is:** A browser-based, **frontend-only** tool where a user uploads/pastes data, picks a chart or map type, styles it, and gets a static, embeddable, responsive, accessible visualization — no code, no server required to use it.

**Core loop:** `Upload data → Visualize → Annotate/style → Export/Embed`

**Target users:** journalists, analysts, students, internal teams needing quick, polished charts — running entirely in-browser, deployable as a static site.

**Why frontend-only:** everything that makes the *editor and renderer* useful (data grid, chart engine, styling, annotations, export) can run client-side. This spec deliberately drops server/backend features (accounts, teams, hosted short links, live data refresh, DB storage) so the whole thing can be built and shipped as a static app — see §9 for what's cut and why.

---

## 2. High-Level Functional Modules

1. Data Input & Management
2. Chart Type Engine (full catalog)
3. Line & Area Chart Deep Feature Set (Datawrapper-parity)
4. Visual Styling & Theming
5. Annotation Tools & Context Overlays
6. Export
7. Embedding & Distribution (static/serverless-friendly)
8. Local Library & Project Management (in-browser, no account)
9. Accessibility & Responsiveness
10. Localization
11. Keyboard Shortcuts & Power-User Tools
12. What Was Removed (backend features) & Why

---

## 3. Data Input & Management
- Paste data directly into a spreadsheet-like grid (Excel-style copy-paste support)
- Upload CSV / XLSX (parsed entirely client-side — e.g. PapaParse / SheetJS)
- Manual grid editing: add/remove rows & columns, sort, type detection (number, date, string, %)
- Column-level settings: type override, number formatting (currency, %, decimals, thousands separator style), date parsing format
- Data transforms: transpose, pivot/unpivot, filter rows, remove duplicates
- Validation warnings: missing values, mixed types, non-numeric values in numeric columns
- "Locked data" mode — chart renders but underlying data isn't shown/downloadable in the exported/embedded version
- Undo/redo within the data grid
- Bundled sample datasets so a new user can try any chart type instantly
- Optional: user can paste a public URL to a raw CSV and fetch it **once at build/export time** (no live auto-refresh — that needs a backend, see §12)

---

## 4. Chart Type Engine — Full Catalog

**Matching Datawrapper's own 23-chart lineup, organized by family (build these as reusable D3/Vega-Lite renderer components):**

**Bar & Column family**
- Bar Chart (horizontal)
- Split Bars (population-pyramid style, two-sided)
- Stacked Bars
- Grouped Bars
- Bullet Bars (progress-vs-target bars)
- Dot Plot
- Range Plot (dumbbell — show a range/change between two values per category)
- Arrow Plot (before → after per category, arrow-style)
- Column Chart (vertical bar)
- Grouped Column Chart
- Stacked Column Chart

**Line & Area family**
- Line Chart
- Multiple Lines (small multiples)
- Area Chart
- (see §5 for the full feature set these need — this is where most of the polish lives)

**Pie & Donut family**
- Pie Chart
- Donut Chart
- Multiple Pies (small multiples)
- Multiple Donuts (small multiples)

**Point/Correlation**
- Scatter Plot (with optional bubble sizing by a third variable)
- Election Donut (parliament/seat-share chart)

**Table**
- Table (styled data table — inline bars-in-cells, sparklines, colored cells, icons)

**Maps**
- Choropleth Map (region-shaded)
- Symbol Map (sized/colored point markers)
- Locator Map (pins on a base map, custom zoom/pan/labels)

**Extra chart types beyond Datawrapper's set (useful additions):**
- Histogram / distribution chart
- Box plot
- Heatmap / matrix chart
- Combo chart (bars + line, dual axis)
- Waterfall chart (good for financial breakdowns)
- Radar/spider chart
- Gauge / single "big number" KPI card with sparkline
- Sankey/flow diagram (stretch — heavier to implement well)

**Auto-suggestion:** infer likely chart type from data shape (1 category + 1 number → bar; time series → line; two numeric columns → scatter; category + sub-category + number → stacked/grouped).

---

## 5. Line & Area Chart Deep Feature Set (Datawrapper-parity)

Since line charts are the most-used and most detail-sensitive type, matching Datawrapper's actual behavior closely means implementing all of the following — not just "draw a line through points":

**Rendering & interaction**
- Smooth vs. straight interpolation toggle
- Optional area fill (turns a line chart into an area chart with one toggle, adjustable opacity/gradient)
- Line chart symbols — dots on each data point, toggleable, adjustable size
- Tooltips on hover — shows exact value + series name + formatted date/number, follows cursor
- Color legend — auto-generated from series; on small/mobile screens, automatically collapses into **direct end-of-line labels acting as the legend** (this is a signature Datawrapper behavior — labels move to sit next to each line's endpoint instead of a separate legend box when space allows, and fall back to a traditional legend on narrow screens)

**Axes**
- **Date axis auto-detection** — if a column parses as dates, the x-axis automatically becomes a proper date/time axis (correct spacing for uneven intervals, smart tick formatting: days/months/years chosen based on range)
- Logarithmic scale toggle for the y-axis (for exponential-growth data)
- Custom min/max, manual tick interval override
- Units — attach a unit string (%, $, kg, etc.) that appears on axis ticks, tooltips, and direct labels consistently

**Labeling & highlighting**
- **Highlight start, end, and peak values** with auto-placed labels that use collision detection so labels never visually overlap each other (this is a specific Datawrapper polish feature — worth replicating with a label-placement algorithm, e.g. simulated annealing or greedy offset resolution)
- Direct data labels at line endpoints (name + last value)
- Per-series color override, and a "highlight one series, grey out the rest" mode for emphasis storytelling

**Annotations on line/area charts specifically**
- Text annotations anchored to a specific point or date — with automatic reflow: on mobile, annotations that would overlap the chart move to a caption list *below* the chart instead of cluttering it
- Highlight + label a specific data point (circle it, draw a leader line, attach a text label)
- Shaded range / timespan highlight (e.g., shade "2020–2021" to mark a recession or event window) — works as a background band behind the lines

**Context overlays (bar/column charts too, but especially relevant here)**
- Overlay lines/bands for extra context (e.g., a target line, an average line)
- Background columns/bands as a comparison reference (e.g., faint bars showing "last year" behind this year's line)
- Confidence intervals / error bars — shaded band around a line showing uncertainty, or vertical error bars on points

**Localization on charts**
- Number and date formatting respects a selected output locale independent of UI language (e.g., chart labeled in French/European number format while the editor UI is in English)
- Replace ISO country codes with flag icons automatically where relevant (for line charts comparing countries)

---

## 6. Visual Styling & Theming
- Preset color palettes + custom palette builder, colorblind-safe check
- Font selection (safe web-font set; local font-file upload)
- Legend: position, on/off, custom labels
- Title, subtitle, source/attribution line, footer notes — editable text fields
- Responsive width vs fixed pixel size
- Save a style as a **local reusable theme** (stored in-browser — brand colors, fonts, default footer) — importable/exportable as a JSON theme file to share with teammates manually (since there's no shared backend, sharing a theme = sharing a file)
- Dark mode variant per chart

---

## 7. Annotation Tools & Context Overlays
(Consolidated with §5 for line/area — this section covers annotation tools generically across all chart types)
- Text labels anchored to data points, with leader lines/arrows
- Reference lines (horizontal/vertical — average, target, threshold)
- Shaded background ranges
- Custom rich tooltips per point
- Toggle: direct value labels always visible vs. hover-only

---

## 8. Export
Confirmed core formats — **PNG and PDF are both included**, alongside the rest, all generated **client-side**:
- **PNG** — selectable resolution (1x/2x/3x/custom px), transparent-background toggle. Achievable client-side via canvas rendering of the SVG.
- **SVG** — vector, directly downloadable from the DOM, no conversion needed
- **JPEG** — smaller file size, flattened white background
- **PDF** — single chart export via a client-side SVG→PDF library (e.g. `jsPDF` + SVG rendering, or `svg2pdf.js`); batch/multi-chart PDF (e.g. combine all charts in the current session into one PDF) is also achievable fully client-side by rendering each chart to a canvas and assembling pages
- **Interactive HTML** — self-contained single file (inlines the JS renderer + data), works offline, drag-and-drop shareable
- **Data export** — cleaned dataset as CSV/XLSX/JSON, generated client-side
- **Copy to clipboard** — copy rendered chart as an image (Clipboard API) for pasting into Slack/Docs/PowerPoint
- **Copy as code** — raw SVG markup or a ready-to-paste embeddable `<iframe>`/HTML snippet
- **Export presets** — save named export configs locally (e.g. "Instagram square PNG @2x", "Print PDF A4")
- **Size presets** — social media dimensions, print sizes (A4/Letter) with DPI, custom px/in/cm

All of the above are achievable with zero server involvement — this is one of the strongest "frontend-only is enough" cases in the whole product.

---

## 9. Embedding & Distribution (static/serverless-friendly)
- Auto-generated self-contained `<iframe srcdoc="...">` or static HTML file embed — no server needed to host the embed itself, since the exported HTML file *is* the chart
- Copy-paste embed snippet the user hosts themselves (on their own CMS/site/static host)
- Responsive auto-resize script bundled into the exported embed (postMessage-based, no external dependency)
- Note: a **short, stable public link** (`yoursite.com/chart/abc123`) genuinely requires *someone's* server to mint and redirect — this one piece can't be fully frontend-only. Workaround: user exports the static HTML and hosts it themselves anywhere (Netlify/Vercel/GitHub Pages/S3) — still no custom backend for *this app* to build or maintain.

---

## 10. Local Library & Project Management (no account needed)
- In-browser storage (IndexedDB) of all charts created in that browser — acts as the "dashboard"
- Manual export/import of a chart project file (JSON containing data + config) to move between devices or share with a teammate
- Duplicate, rename, delete, folder/tag organization — all local
- "Recently edited" list
- Templates: save any chart as a reusable local template

---

## 11. Accessibility & Responsiveness
- Auto-generated alt text / "view as data table" fallback
- Keyboard-navigable tooltips/legend toggles
- WCAG-contrast-checked default palettes
- Fully responsive exported embeds, including the mobile legend-collapse behavior described in §5
- "View as data table" toggle on every chart type

---

## 12. Localization
- Editor UI available in multiple languages (i18n framework from the start)
- Per-chart output locale independent of editor UI language (see §5)
- RTL layout support for both editor and exported charts

---

## 13. Keyboard Shortcuts & Power-User Tools
- `Cmd/Ctrl+S` — save project locally
- `Cmd/Ctrl+D` — duplicate chart
- `Cmd/Ctrl+Z` / `Shift+Z` — undo/redo
- `Cmd/Ctrl+K` — command palette (quick navigation/actions: "New chart", "Export as PNG", "Switch chart type")
- Arrow keys — nudge a selected annotation
- Browser extension (optional, later): right-click a table on any webpage → "Open in [Tool]" to instantly chart it (this is a browser-extension, still frontend-only, no app backend)

---

## 14. What Was Removed (Backend-Dependent Features) & Why

These were in the earlier draft and are **cut from this frontend-only version** — listed here so the reasoning is explicit and they can be revisited later if you ever add a thin backend:

| Removed feature | Why it needs a backend |
|---|---|
| Accounts, teams, roles/permissions | Auth + shared state across devices needs a server + database |
| Cross-device chart library / "my charts" dashboard | Needs persistent storage reachable from anywhere, not just one browser |
| Short, stable public share links (`/chart/abc123`) | Someone has to host the redirect/config lookup |
| Live/auto-refreshing linked data sources (Google Sheets, scheduled URL fetch) | Requires a scheduled job running server-side |
| Comments, @mentions, real-time collaboration/presence | Needs a live server + shared session state |
| Notifications (in-app/email/webhook) | Needs a server to detect events and dispatch them |
| REST API / webhooks for external tools | By definition a server endpoint |
| Admin panel, instance-wide settings, audit logs | Only meaningful with multi-user server-side state |
| 2FA/SSO, API key scopes, server-side rate limiting | All authentication/authorization concerns — need a backend |
| Database connections, server-rendered thumbnails, headless-browser PDF batch service | Needs server compute |

**If/when a backend gets added later**, the cleanest path is a *thin* one: just chart-config storage + short-link resolution + optional scheduled data refresh — not a full rebuild, since the entire editor/renderer/export engine above stays exactly as-is and simply gets a save-to-server button bolted on.

---

## 15. Tech Stack (Confirmed Choices)

### Frontend
- **Framework:** SvelteKit + TypeScript — matches Datawrapper's own current stack (they fully migrated off PHP in Feb 2023, entire app now SvelteKit end-to-end, TS-first for new code)
- **Chart rendering:** D3.js, with a direct study/port of `@datawrapper/chart-core`'s `Visualization.svelte` where the underlying implementation is genuinely open (see `chart-core` audit notes in the main spec, §18)
  - Note: `chart-core` itself still pins **Svelte 2** internally for legacy reasons — expect friction porting into a fresh SvelteKit 2 / Svelte 5 project; treat it as a reference, not a drop-in dependency
- **Data parsing:** PapaParse (CSV), SheetJS/xlsx (Excel) — both client-side, no upload to a server needed
- **Local persistence:** IndexedDB via Dexie.js (acts as the "my charts" library)
- **Maps:** TopoJSON + D3-geo, static basemap assets bundled with the app
- **Styling:** Tailwind CSS (or `@emotion/css` if following chart-core's own convention more closely)
- **i18n:** `i18next` or `svelte-i18n`

### Export Pipeline (all client-side)
- **PNG/JPEG:** canvas rendering of the SVG output
- **SVG:** direct DOM serialization, no conversion needed
- **PDF:** `jsPDF` + `svg2pdf.js` (single chart or assembled multi-page batch)
- **Interactive HTML:** self-contained single-file export (inlined JS + data)
- **Data (CSV/XLSX/JSON):** generated client-side from the cleaned dataset

### Reused / Referenced Open-Source Code
- `@datawrapper/shared` — confirmed MIT-licensed utility functions (number/date formatting, contrast checks) — safe to vendor directly
- `@datawrapper/chart-core` — study `lib/Visualization.svelte` as the rendering-architecture reference; verify its own LICENSE file before vendoring actual code (don't assume MIT applies uniformly across the org)

### Deployment
- Static hosting only (any of: GitHub Pages, Netlify, Vercel, Cloudflare Pages, S3+CloudFront)
- No CI/CD complexity beyond a standard build-and-deploy-static-assets pipeline

---

## 16. Suggested Build Phases

**Phase 1 — MVP**
CSV upload → Bar/Column/Line chart → basic style panel → PNG/SVG export → static HTML embed.

**Phase 2 — Chart Breadth**
Add the rest of the bar/pie/scatter/table family + the full line/area feature set in §5 (this is the highest-effort, highest-payoff phase — it's what makes charts feel "Datawrapper-grade" rather than generic).

**Phase 3 — Polish & Local Library**
Annotations, themes, local IndexedDB library, keyboard shortcuts/command palette, accessibility pass, localization.

**Phase 4 — Maps & Advanced Export**
Choropleth/symbol/locator maps, PDF batch export, export presets, browser extension.

**Phase 5 (optional, later) — Thin Backend**
Only if/when persistence across devices or short share-links become worth the added complexity — see §14.

---

## 17. Stretch / "Nice to Have"
- AI-assisted chart-type suggestion + auto-written alt text/summary (can run via a client-side call to an LLM API, still no app-owned backend)
- Animated/GIF export of time-series charts
- Plugin system for custom chart types
- PowerPoint export (Datawrapper has this — worth studying their approach)

---

## 18. Appendix — Build Reference: Datawrapper's Own Open-Source Code

**This section exists specifically so a build agent (human or AI) has a concrete starting point instead of building the renderer from zero.** Datawrapper itself is partially open source, under the GitHub org `github.com/datawrapper`. Use this as the first thing to clone and inspect before writing new rendering code.

### 18.1 Relevant repositories

| Repo | What it is | Relevance to this build |
|---|---|---|
| `datawrapper/datawrapper` | The **fully retired** original PHP-era monorepo (MySQL + PHP/Slim + Twig + jQuery, dating to 2012) | **Dead code, confirmed via Datawrapper's own engineering blog** — the last lines of PHP were deleted in Feb 2023 after a 5+ year migration. Do not use as a base for anything; it's history, not a live reference. |
| `datawrapper/chart-core` | **The library that renders all Datawrapper visualizations.** Published as npm package `@datawrapper/chart-core`. Svelte-based, bundled via **Rollup**. | **This is the single most valuable repo for this project** — the actual rendering engine turning chart config + data into visual output. |
| `datawrapper/api` | Their v3 REST API — **now fully Node.js/SvelteKit-era**, TypeScript-first for new code | Backend reference only — not needed for the frontend-only build (see §14). Useful later only if a thin backend gets added. |
| `datawrapper/frontend` | Their frontend server — as of late 2023, **their entire web app is served by SvelteKit** end-to-end (this replaced a homegrown SSR solution) | Reference for how they structure the editor around chart-core — worth reading, not necessarily reusing wholesale. |
| `datawrapper/shared` | Utility functions used across the platform, MIT-licensed, plain JavaScript | Small, low-risk to vendor directly — grab useful formatting/date/number utilities from here instead of rewriting. |
| `datawrapper/orm` | Their internal database models | Backend/DB reference only — irrelevant to the frontend-only build. |

### 18.2 `chart-core` structure (from its own README)

```
chart-core/
├── main.mjs        — entry point for Rollup to bundle Visualization.svelte (used by datawrapper/api)
├── lib/            — source files, including the core Visualization.svelte component (used by datawrapper/frontend)
├── dist/           — bundled files with global dependencies needed for chart rendering (used by api & frontend)
└── vendor/         — vendor source files copied into dist/ at publish time
```

Only `lib/` and `dist/` are what actually get packaged and published to npm. `Visualization.svelte` in `lib/` is the core renderer component to study first.

**Confirmed dependencies (from `chart-core`'s actual `package.json`):** `@datawrapper/expr-eval`, `@datawrapper/shared`, `@datawrapper/polyfills`, `@emotion/css` (styling), `core-js` (polyfills), `svelte-extras`, `underscore`. Note it currently pins an **older Svelte 2** (`svelte2: npm:svelte@^2.16.1`) for legacy compatibility reasons rather than the modern Svelte used by the rest of the current app — factor this version mismatch in before assuming drop-in compatibility with a fresh SvelteKit project.

### 18.2b Current company-wide stack (as of their own late-2023/2024 engineering posts — confirmed, not inferred)
- **Entire web app now runs on SvelteKit end-to-end** (frontend + SSR), replacing a homegrown server-rendering solution
- **TypeScript-first** for all newly written modules (migrating steadily off plain JavaScript since Oct 2022)
- **PHP is completely gone** — fully retired, not merely legacy/being-phased-out
- Practical implication for this build: a fresh **SvelteKit + TypeScript** frontend is the closest match to how Datawrapper itself is built today, reinforcing the §18.3 step 7 recommendation to prefer Svelte/SvelteKit over React if maximizing alignment with their real, current codebase matters.

### 18.3 Concrete plan for the build agent

1. **Clone `datawrapper/chart-core`** and read `lib/Visualization.svelte` end-to-end before writing any new chart-rendering code. This shows exactly how Datawrapper structures a chart config → rendered output.
2. **Audit which chart types are actually implemented in the open repo vs. gated behind closed plugins.** The repo's own README states: *"Most of the functionality in Datawrapper is provided by plugins, some of which are open source but the majority is not."* This means chart-core likely provides the rendering shell/framework, but not every one of the 23 chart types in §4 may have a fully open implementation. Do this audit by grepping the repo for each chart type ID from the table below before assuming a type is "free" to copy:

   `d3-bars`, `d3-bars-split`, `d3-bars-stacked`, `d3-bars-bullet`, `d3-dot-plot`, `d3-range-plot`, `d3-arrow-plot`, `column-chart`, `grouped-column-chart`, `stacked-column-chart`, `d3-area`, `d3-lines`, `multiple-lines`, `d3-pies`, `d3-donuts`, `d3-multiple-pies`, `d3-multiple-donuts`, `d3-scatter-plot`, `election-donut-chart`, `tables`, `d3-maps-choropleth`, `d3-maps-symbols`, `locator-map`

3. **Check the actual LICENSE file in each repo individually** before vendoring code. `datawrapper/shared` is confirmed MIT. Don't assume `chart-core` carries the same license without checking its own LICENSE file directly — verify per-repo, not org-wide.
4. **Decide vendor vs. rewrite per chart type**, based on step 2's audit:
   - If a chart type's rendering logic is genuinely open in `chart-core` → adapt/port it directly (fastest path to true Datawrapper-parity output, especially for the line/area feature set in §5 — e.g. their actual collision-avoidance label algorithm, date-axis tick logic, and mobile legend-collapse behavior).
   - If a chart type is plugin-gated/closed → build it from scratch using the §5 behavioral spec as the functional target, implemented in D3 independently.
5. **Reuse `datawrapper/shared`'s utility functions** (number formatting, date parsing, color/contrast helpers) instead of rewriting them — this is low-risk since it's explicitly MIT-licensed plain JS.
6. **Don't port `datawrapper/api`, `datawrapper/orm`, or the PHP-era `datawrapper/datawrapper` repo** — none of these are needed for the frontend-only architecture in this spec (see §14), and porting them would reintroduce the backend/database dependency this build is deliberately avoiding.
7. **Tech-stack implication:** since `chart-core` is Svelte-based, consider building the new frontend editor in **Svelte/SvelteKit rather than React** if the goal is maximum code reuse from the real Datawrapper renderer — swap this in for the React/Vite option in §15 if going this route.

### 18.4 Caveats to flag back to the user (or resolve before deep implementation)

- The exact split between "open chart-core rendering" and "closed plugin" per chart type isn't fully confirmed from documentation alone — it needs a direct read of the repo's source tree (step 2 above) rather than being assumed from this spec.
- License terms must be re-verified at implementation time (licenses can change between when this was researched and when building happens).
- Even fully-reused rendering code still needs a new data-grid, styling panel, export pipeline, and local-library UI wrapped around it per §§3, 6–11 — `chart-core` gives you the rendering engine, not the whole editor product.
