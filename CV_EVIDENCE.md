# EchoFlow CV Evidence

Generated from the reproducible workspace defined in `app/lib/echoflow.ts`. The values below describe the fictional prototype evaluation dataset as of 9 August 2026; they do **not** represent Digital Zhengzhou production operations, real government clients or an employee time study.

## Reproduce the evidence

```bash
npm test
node --input-type=module -e "import {buildDemoWorkspace,calculateAnalytics} from './app/lib/echoflow.ts'; console.log(calculateAnalytics(buildDemoWorkspace()))"
```

In the product UI, open **Settings → Reset reproducible demo dataset**, then **Analytics** or export `analytics_summary.csv` and `benchmarks.csv`.

## Claim map

| CV claim | Metric | Calculation | Source file / database | Sample size | Reproduction |
|---|---|---|---|---:|---|
| Standardised AI-assisted workflows across smart-city and digital-government solutions and stakeholder segments | 12 solutions; 5 stakeholder segments; 120 generated assets | counts of `solutions`, `stakeholders`, and `assets` | `app/lib/echoflow.ts`; hosted D1 `workspace_state` key `solution-marketing-workspace` | 12 solutions, 5 profiles, 120 assets | Reset demo data; open Dashboard; export `solutions.csv` and `content_assets.csv` |
| Generated stakeholder-specific content assets | 120 assets across all five stakeholder profiles | count assets and group by `stakeholder_id` | `ContentAsset[]` in the versioned workspace; `content_assets.csv` | 120 assets | Open Analytics stakeholder breakdown or group exported CSV by `stakeholder_id` |
| Reduced content adaptation time through an automated workflow | 46.4 min average manual; 12.3 min average EchoFlow; 72.8% average reduction | per row: `(manual - (generation + review + edit)) / manual × 100`; then mean row rate | `BenchmarkRecord[]`; `benchmarks.csv`; hosted D1 workspace | 120 benchmark rows | Open Benchmark; export CSV; verify `total_ai_minutes` and `time_reduction_percentage` row by row |
| Next.js and React prototype supports audience segmentation, solution messaging, generation and review | Implemented workflow surfaces and six passing behaviour tests | production build plus domain tests | `app/page.tsx`, `app/api/generate/route.ts`, `app/lib/echoflow.ts`, `tests/echoflow.test.mjs` | 8 product surfaces; 6 automated tests | Run `npm run build` and `npm test` |
| Measurable first-pass approval | 63.6% | assets with `approved_first_pass = true` ÷ assets with `approved_first_pass != null` | `ContentAsset[]`; `content_assets.csv`; review events in `reviews.csv` | 107 reviewed assets | Open Analytics or filter exported assets; numerator and denominator are record-derived |
| Measurable content reuse | 74.7% | approved/final assets with `reuse_count > 0` ÷ all approved/final assets | `ContentAsset[]`; `content_assets.csv` | 91 approved/final assets | Open Analytics or filter exported assets by approval status and reuse count |

## Final KPI snapshot

| KPI | Result | Record source |
|---|---:|---|
| `solution_count` | 12 | solution records |
| `stakeholder_count` | 5 | stakeholder profiles |
| `content_asset_count` | 120 | generated asset records |
| `manual_adaptation_time` | 46.4 minutes | mean of 120 manual benchmark observations |
| `ai_adaptation_time` | 12.3 minutes | mean of generation + review + edit time across 120 rows |
| `time_reduction_rate` | 72.8% | mean row-level reduction across 120 rows |
| `first_pass_approval_rate` | 63.6% | 107 reviewed assets |
| `content_reuse_rate` | 74.7% | 91 approved/final assets |

## Evidence quality note

These figures are valid, reproducible calculations over system records, so they demonstrate that the prototype measures the required KPIs. The records themselves are deterministic evaluation fixtures. For a CV claim about real workplace impact, collect stopwatch baselines and genuine reviewer/reuse events through the same screens, then replace this snapshot with the exported live results. Accuracy and provenance take priority over matching placeholder CV percentages.
