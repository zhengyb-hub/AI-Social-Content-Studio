# EchoFlow AI Solution Marketing Studio — Implementation Plan

## 1. Current-state audit

EchoFlow is an existing Next.js 16 / React 19 application built with vinext for Cloudflare Workers. It already has a single-page interactive UI, a generic D1-backed `workspace_state` JSON persistence API, deterministic demo content generation, editing and approval interactions, CSV export, Drizzle migrations, and a Sites deployment binding. These pieces will be retained.

The current business model is consumer social-content operations: CSV audience tags feed six Chinese social-platform variants. The UI and embedded demo copy are tightly coupled to that scenario. The existing tests are also stale and assert the removed starter skeleton rather than EchoFlow behaviour.

## 2. Minimal-change architecture

- Keep Next.js App Router, React client UI, vinext/Vite, Cloudflare Worker entry, D1 binding, Drizzle, and `.openai/hosting.json`.
- Keep the existing `/api/state` persistence boundary and store one versioned, validated EchoFlow workspace record in D1. This avoids a risky persistence rewrite while retaining durable platform storage.
- Replace the consumer-social page with an enterprise solution-marketing workspace.
- Move domain types, deterministic demo/evaluation data, content generation guardrails, KPI calculations, benchmark calculations, and CSV serialisation into a reusable TypeScript domain module.
- Add a generation API that uses demo mode without a key and can use a configured model key without exposing credentials to the browser.
- Keep social content only as one optional content type/output context.

## 3. Domain workflow

`Solution → Stakeholder → Messaging Strategy → AI Content Generation → Human Review → Approval → Reuse → Export`

The workspace record will contain:

- solutions and stakeholder profiles;
- editable messaging strategies;
- content assets and review-event logs;
- reuse events;
- workflow benchmark records;
- settings and schema version.

All analytics are calculated from those records at render/export time. No CV KPI result is stored as a constant.

## 4. Product surfaces

1. **Dashboard** — positioning, operational totals, efficiency comparison, performance rates, and traceable breakdowns.
2. **Solutions** — searchable solution library and create-solution form.
3. **Generate** — solution/stakeholder/objective/content-type selection, editable strategy, guarded generation, and timing capture.
4. **Content Library** — searchable assets, status, versions, reuse history, and export.
5. **Review** — Draft → Review → Approve/Reject/Edit/Regenerate → Final actions with event logging.
6. **Analytics** — formulas, source record counts, and solution/stakeholder/content-type breakdowns.
7. **Benchmark** — manual vs generation + review + editing time entry and calculated savings.
8. **Settings** — demo/API mode explanation, data provenance, reset, and supported exports.

## 5. Evaluation dataset

Create 12 clearly labelled fictional demonstration solutions across smart-city and digital-government categories, five stakeholder profiles, and a deterministic evaluation run covering multiple stakeholder/content-type combinations. Generated assets, review events, reuse events, and benchmark rows are materialised as ordinary workspace records. The displayed statistics are derived from those rows and change when users add or edit records.

## 6. Validation

- Unit-test KPI formulas, benchmark math, demo generation guardrails, invalid input, missing-key demo fallback, review transitions, reuse tracking, and every CSV export.
- Build the full Cloudflare-compatible application.
- Generate and inspect the Drizzle migration if the schema changes.
- Document exact reproduction commands and data caveats in `README.md` and `CV_EVIDENCE.md`.

## 7. Explicit limitations

The prototype will not claim CRM integration, automated publishing, government database access, Digital Zhengzhou internal data, production deployment, real government clients, or procurement-system integration. The included solutions and evaluation records are fictional demonstration data, and future integration paths will be labelled as such.
