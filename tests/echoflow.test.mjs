import assert from "node:assert/strict";
import test from "node:test";
import {
  applyContentEdit,
  advanceCampaign,
  applyReuse,
  applyReviewDecision,
  buildDemoWorkspace,
  calculateAnalytics,
  can,
  createStrategy,
  currentMember,
  exportFiles,
  generateDemoCopy,
  isWorkspace,
  makeBenchmark,
  normaliseWorkspace,
  scoreContent,
} from "../app/lib/echoflow.ts";
import { demoFallbackReason, isGenerationRequest } from "../app/lib/generation.ts";

test("creates a reproducible, non-claimed evaluation dataset", () => {
  const workspace = buildDemoWorkspace();
  assert.equal(workspace.solutions.length, 12);
  assert.equal(workspace.stakeholders.length, 5);
  assert.equal(workspace.assets.length, 120);
  assert.equal(workspace.campaigns.length, 4);
  assert.equal(workspace.schema_version, 6);
  assert.equal(workspace.benchmarks.length, workspace.assets.length);
  assert.equal(workspace.generation_runs.length, workspace.assets.length);
  assert.equal(workspace.versions.length, workspace.assets.length);
  assert.ok(workspace.assets.every((asset) => asset.source_references.length > 0));
  assert.ok(workspace.assets.every((asset) => asset.derivatives.video_script.duration_seconds >= 30));
  assert.ok(workspace.assets.every((asset) => asset.derivatives.social_card.format === "4:5"));
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
  workspace.current_member_id = "MEM-REVIEWER";
  workspace = applyReviewDecision(workspace, draft.draft_id, "approved", "2026-08-01T10:00:00.000Z");
  assert.equal(workspace.assets.find((asset) => asset.draft_id === draft.draft_id).review_status, "approved");
  assert.equal(workspace.assets.find((asset) => asset.draft_id === draft.draft_id).approved_first_pass, true);
  workspace.current_member_id = "MEM-CREATOR";
  workspace = applyReuse(workspace, draft.draft_id, "项目建议书");
  assert.equal(workspace.assets.find((asset) => asset.draft_id === draft.draft_id).reuse_count, 1);
  assert.equal(workspace.reviews[0].action, "reused");
  workspace = applyContentEdit(workspace, draft.draft_id, "已编辑标题", "已编辑并完成证据核验的内容。");
  const edited = workspace.assets.find((asset) => asset.draft_id === draft.draft_id);
  assert.equal(edited.review_status, "in_review");
  assert.ok(edited.edit_count > 0);
  assert.equal(workspace.versions.find((version) => version.draft_id === draft.draft_id).version, edited.version);
  workspace.current_member_id = "MEM-REVIEWER";
  workspace = applyReviewDecision(workspace, draft.draft_id, "rejected");
  assert.equal(workspace.assets.find((asset) => asset.draft_id === draft.draft_id).review_status, "rejected");
});

test("captures reviewer notes and advances campaign lifecycle", () => {
  let workspace = buildDemoWorkspace();
  workspace.current_member_id = "MEM-REVIEWER";
  const rejected = workspace.assets.find((asset) => asset.review_status === "rejected");
  assert.ok(rejected);
  workspace = applyReviewDecision(workspace, rejected.draft_id, "rejected", "2026-08-12T10:00:00.000Z", "请补充实施依据。" );
  assert.equal(workspace.reviews[0].note, "请补充实施依据。");
  assert.equal(workspace.reviews[0].actor, "演示审核员");
  const planning = workspace.campaigns.find((campaign) => campaign.status === "planning");
  assert.ok(planning);
  workspace = advanceCampaign(workspace, planning.campaign_id);
  assert.equal(workspace.campaigns.find((campaign) => campaign.campaign_id === planning.campaign_id).status, "active");
});

test("migrates legacy workspaces without discarding content", () => {
  const current = buildDemoWorkspace();
  const legacy = structuredClone(current);
  legacy.schema_version = 3;
  delete legacy.brand;
  delete legacy.campaigns;
  delete legacy.settings.default_review_required;
  delete legacy.settings.prompt_version;
  delete legacy.members;
  delete legacy.current_member_id;
  delete legacy.generation_runs;
  delete legacy.versions;
  legacy.assets.forEach((asset) => { delete asset.campaign_id; delete asset.channel; delete asset.quality_score; delete asset.compliance_score; delete asset.source_references; delete asset.derivatives; });
  const migrated = normaliseWorkspace(legacy);
  assert.ok(migrated);
  assert.equal(migrated.schema_version, 6);
  assert.equal(migrated.assets.length, current.assets.length);
  assert.ok(migrated.assets.every((asset) => asset.campaign_id && asset.channel && asset.source_references.length && asset.derivatives.video_script.scenes.length));
  assert.equal(migrated.generation_runs.length, migrated.assets.length);
  assert.equal(migrated.versions.length, migrated.assets.length);
});

test("validates state and exports all evidence files", () => {
  const workspace = buildDemoWorkspace();
  assert.equal(isWorkspace(workspace), true);
  assert.equal(isWorkspace({ schema_version: 2 }), false);
  const files = exportFiles(workspace);
  assert.deepEqual(Object.keys(files), ["campaigns.csv", "brand_profile.csv", "solutions.csv", "content_assets.csv", "reviews.csv", "benchmarks.csv", "generation_runs.csv", "content_versions.csv", "workspace_members.csv", "content_packages.csv", "analytics_summary.csv"]);
  assert.match(files["benchmarks.csv"], /total_ai_minutes/);
  assert.match(files["analytics_summary.csv"], /first_pass_approval_rate/);
  assert.match(files["generation_runs.csv"], /prompt_version/);
  assert.match(files["content_versions.csv"], /created_by/);
  assert.match(files["content_packages.csv"], /video_duration_seconds/);
});

test("enforces demo role permissions without claiming production authentication", () => {
  const workspace = buildDemoWorkspace();
  assert.equal(currentMember(workspace).role, "creator");
  assert.equal(can(workspace, "generate_content"), true);
  assert.equal(can(workspace, "review_content"), false);
  workspace.current_member_id = "MEM-REVIEWER";
  assert.equal(can(workspace, "generate_content"), false);
  assert.equal(can(workspace, "review_content"), true);
  workspace.current_member_id = "MEM-ADMIN";
  assert.equal(can(workspace, "manage_governance"), true);
});

test("keeps the persisted demo workspace below the state API payload limit", () => {
  const bytes = Buffer.byteLength(JSON.stringify(buildDemoWorkspace()), "utf8");
  assert.ok(bytes < 1_000_000, `workspace payload is ${bytes} bytes`);
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
