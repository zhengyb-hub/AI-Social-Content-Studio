import assert from "node:assert/strict";
import test from "node:test";
import {
  applyContentEdit,
  applyReuse,
  applyReviewDecision,
  buildDemoWorkspace,
  calculateAnalytics,
  createStrategy,
  exportFiles,
  generateDemoCopy,
  isWorkspace,
  makeBenchmark,
  scoreContent,
} from "../app/lib/echoflow.ts";
import { demoFallbackReason, isGenerationRequest } from "../app/lib/generation.ts";

test("creates a reproducible, non-claimed evaluation dataset", () => {
  const workspace = buildDemoWorkspace();
  assert.equal(workspace.solutions.length, 12);
  assert.equal(workspace.stakeholders.length, 5);
  assert.equal(workspace.assets.length, 120);
  assert.equal(workspace.campaigns.length, 4);
  assert.equal(workspace.schema_version, 4);
  assert.equal(workspace.benchmarks.length, workspace.assets.length);
  assert.ok(workspace.solutions.every((solution) => solution.source_reference.includes("虚构演示")));
});

test("calculates KPI values from records", () => {
  const workspace = buildDemoWorkspace();
  const analytics = calculateAnalytics(workspace);
  const reviewed = workspace.assets.filter((asset) => asset.approved_first_pass !== null);
  const approved = workspace.assets.filter((asset) => ["approved", "final"].includes(asset.review_status));
  assert.equal(analytics.content_asset_count, workspace.assets.length);
  assert.equal(analytics.first_pass_approval_rate, Number((reviewed.filter((asset) => asset.approved_first_pass).length / reviewed.length * 100).toFixed(1)));
  assert.equal(analytics.content_reuse_rate, Number((approved.filter((asset) => asset.reuse_count > 0).length / approved.length * 100).toFixed(1)));
});

test("uses complete AI workflow time in benchmark calculations", () => {
  const row = makeBenchmark({ benchmark_id: "BM-TEST", solution_id: "SOL-001", stakeholder_id: "STK-GOV", content_type: "解决方案简报", manual_minutes: 60, ai_generation_minutes: 2, ai_review_minutes: 10, ai_edit_minutes: 8, timestamp: new Date().toISOString() });
  assert.equal(row.total_ai_minutes, 20);
  assert.equal(row.time_saved_minutes, 40);
  assert.equal(row.time_reduction_percentage, 66.7);
});

test("generates stakeholder-specific demo content without unsupported claims", () => {
  const workspace = buildDemoWorkspace();
  const solution = workspace.solutions[0];
  const government = workspace.stakeholders[0];
  const technical = workspace.stakeholders[3];
  const govCopy = generateDemoCopy(solution, government, createStrategy(solution, government, "建立认知", "高管摘要"));
  const techCopy = generateDemoCopy(solution, technical, createStrategy(solution, technical, "建立认知", "解决方案简报"));
  assert.notEqual(govCopy.content, techCopy.content);
  assert.match(govCopy.content, /没有推断或虚构统计数据、客户案例、政府合作关系或生产环境能力/);
  assert.match(techCopy.content, /架构|技术|安全/);
});

test("records approve, reject, edit and reuse workflow actions", () => {
  let workspace = buildDemoWorkspace();
  const draft = workspace.assets.find((asset) => asset.review_status === "draft");
  assert.ok(draft);
  workspace = applyReviewDecision(workspace, draft.draft_id, "approved", "2026-08-01T10:00:00.000Z");
  assert.equal(workspace.assets.find((asset) => asset.draft_id === draft.draft_id).review_status, "approved");
  assert.equal(workspace.assets.find((asset) => asset.draft_id === draft.draft_id).approved_first_pass, true);
  workspace = applyReuse(workspace, draft.draft_id, "项目建议书");
  assert.equal(workspace.assets.find((asset) => asset.draft_id === draft.draft_id).reuse_count, 1);
  workspace = applyContentEdit(workspace, draft.draft_id, "已编辑标题", "已编辑并完成证据核验的内容。");
  const edited = workspace.assets.find((asset) => asset.draft_id === draft.draft_id);
  assert.equal(edited.review_status, "in_review");
  assert.ok(edited.edit_count > 0);
  workspace = applyReviewDecision(workspace, draft.draft_id, "rejected");
  assert.equal(workspace.assets.find((asset) => asset.draft_id === draft.draft_id).review_status, "rejected");
});

test("validates state and exports all evidence files", () => {
  const workspace = buildDemoWorkspace();
  assert.equal(isWorkspace(workspace), true);
  assert.equal(isWorkspace({ schema_version: 2 }), false);
  const files = exportFiles(workspace);
  assert.deepEqual(Object.keys(files), ["campaigns.csv", "brand_profile.csv", "solutions.csv", "content_assets.csv", "reviews.csv", "benchmarks.csv", "analytics_summary.csv"]);
  assert.match(files["benchmarks.csv"], /total_ai_minutes/);
  assert.match(files["analytics_summary.csv"], /first_pass_approval_rate/);
});

test("generation input validation and missing-key fallback remain safe", () => {
  assert.equal(isGenerationRequest({}), false);
  const workspace = buildDemoWorkspace();
  const solution = workspace.solutions[0];
  const stakeholder = workspace.stakeholders[0];
  const strategy = createStrategy(solution, stakeholder, "建立认知", "解决方案简报");
  const campaign = workspace.campaigns[0];
  assert.equal(isGenerationRequest({ solution, stakeholder, strategy, brand: workspace.brand, campaign, channel: "客户简报", requestedMode: "api" }), true);
  assert.equal(isGenerationRequest({ solution, stakeholder, strategy, brand: workspace.brand, campaign, channel: "" }), false);
  assert.equal(demoFallbackReason("api", undefined), "missing_api_key");
  assert.equal(demoFallbackReason("api", "configured"), null);
  assert.equal(demoFallbackReason("demo", "configured"), "demo_requested");
});

test("brand governance scores blocked terms and required disclosure", () => {
  const workspace = buildDemoWorkspace();
  const safe = scoreContent(`专业内容。${workspace.brand.required_disclaimer}`, workspace.brand);
  const risky = scoreContent("这是绝对领先且零风险的方案。", workspace.brand);
  assert.ok(safe.compliance_score > risky.compliance_score);
  assert.ok(safe.quality_score >= risky.quality_score);
});
