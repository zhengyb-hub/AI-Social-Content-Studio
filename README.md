# EchoFlow AI Solution Marketing Studio

EchoFlow is an AI-assisted B2B/B2G solution-marketing prototype for Digital Zhengzhou Technology Co., Ltd. It turns structured smart-city and digital-government solution information into stakeholder-specific marketing and sales-support content, then tracks human review, approval, reuse and workflow efficiency.

> Data boundary: every included solution, asset and benchmark row is fictional demonstration/evaluation data. The repository does not contain Digital Zhengzhou internal product data, government databases, real clients or procurement-system records.

## Business problem

Complex government and enterprise solutions must be explained differently to executives, procurement teams, enterprise clients, technical decision makers and ecosystem partners. Rewriting every brief, proposal section, event message or sales-support asset is slow, while ungrounded AI generation introduces factual and reputational risk.

## Solution

EchoFlow standardises the workflow:

`Solution → Stakeholder → Messaging Strategy → AI Content Generation → Human Review → Approval → Reuse → Export`

The user selects a structured solution record and stakeholder profile, reviews an editable messaging strategy, generates an evidence-conscious draft, records the review outcome, and tracks later reuse. Analytics are recalculated from the underlying workspace records.

## Target users

- Solution Marketing Teams
- B2B/B2G Marketing Teams
- Sales Enablement Teams
- Product Marketing Teams

## Features

- **Dashboard:** managed solutions, stakeholder coverage, asset volume, approval rate, efficiency and content-performance summaries.
- **Solution Library:** complete solution records with business problem, capabilities, value, technical highlights, context and source reference.
- **Stakeholder segmentation:** five reusable profiles covering goals, pain points, information needs, messaging priority, technical depth, tone, CTA and risk concerns.
- **Messaging Strategy:** editable value proposition, three key messages, proof points, tone, CTA and content angle before generation.
- **AI content generation:** inputs are limited to solution data, stakeholder profile, reviewed strategy and content type. The prompt forbids invented statistics, partnerships, cases and capabilities.
- **Demo Mode:** deterministic content generation works without an API key. API mode automatically falls back to Demo Mode if the key or request is unavailable.
- **Human review:** Draft/In review → Approve or Reject → Edit or Regenerate → Final, with event timestamps, first-pass state, edit count and review time.
- **Reuse tracking:** approved/final assets can be marked as reused for Proposal, Event, Sales Deck, Corporate Social or Client Brief contexts.
- **Analytics:** all KPIs are calculated from content, review, reuse and benchmark records at runtime.
- **Workflow Benchmark:** compares manual adaptation with generation + review + editing, not model speed alone.
- **Export:** `solutions.csv`, `content_assets.csv`, `reviews.csv`, `benchmarks.csv`, `analytics_summary.csv` and the complete JSON workspace.

## Architecture

```text
app/page.tsx                 React product interface and workflow actions
app/lib/echoflow.ts          Domain model, demo evaluator, KPI formulas, CSV export
app/api/generate/route.ts    Guarded API generation with no-key demo fallback
app/api/state/route.ts       Versioned workspace persistence boundary
db/schema.ts                 Drizzle schema for D1 workspace state
drizzle/                     Cloudflare D1 migration
worker/index.ts              Existing vinext Cloudflare Worker entry
tests/echoflow.test.mjs      Domain and workflow behaviour tests
```

The application deliberately retains the original Next.js/React/vinext/Cloudflare D1 architecture. The versioned workspace object is persisted under `workspace_state.key = 'solution-marketing-workspace'`. This provides durable hosted state without replacing the already-working persistence boundary.

## Analytics

| KPI | Calculation |
|---|---|
| Total Solutions | count of solution records |
| Stakeholder Segments | count of stakeholder profiles |
| Content Assets Generated | count of content assets |
| Approved Assets | assets with `approved` or `final` status |
| First-Pass Approval Rate | `approved_first_pass = true` ÷ reviewed assets |
| Average Edit Count | total asset edit count ÷ all assets |
| Content Reuse Rate | approved/final assets with `reuse_count > 0` ÷ approved/final assets |
| Average Generation Time | mean `generation_seconds` |
| Average Review Time | mean `review_time_minutes` for reviewed assets |

## Benchmark method

Each row records `manual_minutes`, `ai_generation_minutes`, `ai_review_minutes` and `ai_edit_minutes` for the same solution/stakeholder/content-type task.

```text
total_ai_minutes = ai_generation_minutes + ai_review_minutes + ai_edit_minutes
time_saved_minutes = manual_minutes - total_ai_minutes
time_reduction_percentage = time_saved_minutes / manual_minutes × 100
```

The bundled rows are deterministic prototype-evaluation observations for reproducibility; they are not employee time studies. Replace or extend them through the Benchmark screen with stopwatch observations before making workplace productivity claims.

## Demo dataset and current evaluation

Resetting the workspace materialises ordinary system records for 12 fictional solutions × 5 stakeholder profiles × 2 content variants = 120 assets. The following values are calculated from those records—not stored as KPI constants:

| Metric | Current reproducible result | Source sample |
|---|---:|---:|
| Solutions | 12 | 12 solution records |
| Stakeholders | 5 | 5 profiles |
| Content assets | 120 | 120 asset records |
| Approved assets | 91 | 120 asset records |
| First-pass approval rate | 63.6% | 107 reviewed assets |
| Content reuse rate | 74.7% | 91 approved/final assets |
| Average edit count | 0.39 | 120 assets |
| Average generation time | 15.7 seconds | 120 assets |
| Average review time | 10.9 minutes | 107 reviewed assets |
| Average manual adaptation | 46.4 minutes | 120 benchmark rows |
| Average EchoFlow adaptation | 12.3 minutes | 120 benchmark rows |
| Average time reduction | 72.8% | 120 benchmark rows |

## Tech stack

- Next.js 16 and React 19
- TypeScript
- vinext / Vite for Cloudflare Workers
- Cloudflare D1
- Drizzle ORM
- Node.js 22.13 or newer

## Setup

```bash
npm install
npm run dev
```

Production validation:

```bash
npm run build
npm test
```

On Windows, ensure a Node.js 22+ installation is first on `PATH`.

## Demo Mode and optional API mode

Demo Mode is the default and requires no secret. To enable server-side API generation, configure hosted runtime values (never commit them):

```text
OPENAI_API_KEY=<secret>
OPENAI_MODEL=gpt-5.6-luna   # optional override
```

Then choose **API Mode** in Settings. The server uses the Responses API and returns to deterministic Demo Mode on a missing key, unavailable endpoint, invalid response or request error. This keeps the prototype usable offline and prevents credentials reaching the browser.

## Limitations

- The seeded approval, edit, reuse and timing outcomes are reproducible evaluation fixtures, not evidence of live employee or client usage.
- API-generated text still requires human evidence review.
- The D1 record is workspace-scoped; the prototype does not yet implement multi-tenant identity or row-level ownership.
- No CRM integration, automated publishing, government database integration, production procurement integration or real Digital Zhengzhou data is implemented.

## Future integration pathway

After governance and security review, the current boundaries could support approved solution catalogues, enterprise identity, CRM references, content-approval policies and controlled publishing connectors. These are future pathways, not completed features.
