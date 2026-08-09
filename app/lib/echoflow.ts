export type ReviewStatus = "draft" | "in_review" | "approved" | "rejected" | "final";

export type Solution = {
  solution_id: string;
  solution_name: string;
  solution_category: string;
  short_description: string;
  business_problem: string;
  key_capabilities: string[];
  target_users: string[];
  business_value: string[];
  technical_highlights: string[];
  implementation_context: string;
  source_reference: string;
  created_at: string;
  updated_at: string;
};

export type Stakeholder = {
  stakeholder_id: string;
  name: string;
  goals: string[];
  pain_points: string[];
  information_needs: string[];
  messaging_priority: string[];
  technical_depth: "Low" | "Medium" | "High";
  preferred_tone: string;
  cta: string;
  risk_concerns: string[];
};

export type MessagingStrategy = {
  strategy_id: string;
  solution_id: string;
  stakeholder_id: string;
  marketing_objective: string;
  content_type: string;
  core_value_proposition: string;
  key_messages: string[];
  supporting_proof_points: string[];
  recommended_tone: string;
  cta: string;
  content_angle: string;
  updated_at: string;
};

export type ContentAsset = {
  draft_id: string;
  solution_id: string;
  stakeholder_id: string;
  content_type: string;
  marketing_objective: string;
  title: string;
  content: string;
  generated_at: string;
  generation_seconds: number;
  generation_mode: "demo" | "api";
  review_status: ReviewStatus;
  approved_first_pass: boolean | null;
  edit_count: number;
  review_time_minutes: number;
  finalised_at: string | null;
  reuse_count: number;
  reuse_context: string[];
  version: number;
};

export type ReviewEvent = {
  review_id: string;
  draft_id: string;
  action: "submitted" | "approved" | "rejected" | "edited" | "regenerated" | "finalised";
  occurred_at: string;
  duration_minutes: number;
  note: string;
};

export type BenchmarkRecord = {
  benchmark_id: string;
  solution_id: string;
  stakeholder_id: string;
  content_type: string;
  manual_minutes: number;
  ai_generation_minutes: number;
  ai_review_minutes: number;
  ai_edit_minutes: number;
  total_ai_minutes: number;
  time_saved_minutes: number;
  time_reduction_percentage: number;
  timestamp: string;
};

export type Workspace = {
  schema_version: 2;
  solutions: Solution[];
  stakeholders: Stakeholder[];
  strategies: MessagingStrategy[];
  assets: ContentAsset[];
  reviews: ReviewEvent[];
  benchmarks: BenchmarkRecord[];
  settings: { generation_mode: "demo" | "api"; model: string };
};

export type Analytics = {
  solution_count: number;
  stakeholder_count: number;
  content_asset_count: number;
  approved_asset_count: number;
  reviewed_asset_count: number;
  first_pass_approval_rate: number;
  average_edit_count: number;
  content_reuse_rate: number;
  average_generation_time_seconds: number;
  average_review_time_minutes: number;
  manual_adaptation_time: number;
  ai_adaptation_time: number;
  time_reduction_rate: number;
};

export const CONTENT_TYPES = [
  "Solution Brief",
  "Executive Summary",
  "Proposal Copy",
  "Sales Enablement Copy",
  "Case Study Summary",
  "Event / Conference Messaging",
  "Corporate Social Content",
  "Solution Introduction",
  "Stakeholder Email",
  "Campaign Copy",
] as const;

export const MARKETING_OBJECTIVES = [
  "Build awareness",
  "Support stakeholder alignment",
  "Enable a sales conversation",
  "Explain implementation value",
  "Support proposal development",
] as const;

export const REUSE_CONTEXTS = ["Proposal", "Event", "Sales Deck", "Corporate Social", "Client Brief"] as const;

const iso = (day: number, hour = 9) => `2026-07-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:00:00.000Z`;
const round = (value: number, digits = 1) => Number(value.toFixed(digits));
const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const list = (value: string) => value.split("|");

const solutionSeeds = [
  ["Smart City Operations Hub", "Smart City Operations", "A unified operational view for coordinating urban service incidents and cross-department response.", "Urban teams often coordinate incidents across fragmented systems and reporting lines.", "Unified operational dashboard|Incident coordination workspace|Configurable service workflows", "Operations centres|Urban service teams", "Faster operational visibility|Clearer cross-team coordination", "API-oriented integration pattern|Role-based information views", "Designed as a fictional demonstration concept for a municipal operations coordination scenario."],
  ["Urban Data Exchange", "Urban Data Platform", "A governed data-sharing foundation for reusable urban information products.", "Departments need to share data while preserving ownership, quality controls and traceability.", "Data catalogue|Access workflow|Quality monitoring", "Data offices|Department data stewards", "Reduced discovery effort|More consistent data governance", "Metadata-led catalogue|Auditable access controls", "Fictional reference architecture for governed inter-department data exchange."],
  ["One-Stop Citizen Service", "Digital Government Services", "A service-orchestration concept that simplifies discovery and completion of public-service journeys.", "Citizens can face fragmented service entry points and repeated information requests.", "Service journey design|Unified status view|Assisted service routing", "Public-service centres|Service design teams", "Simpler journeys|More transparent service progress", "Composable service modules|Accessible web interfaces", "Fictional demonstration solution; not connected to a live government service."],
  ["Mobility Coordination Platform", "Smart Transportation", "A shared operational layer for analysing mobility signals and coordinating transport responses.", "Transport operators need a consistent view across congestion, incidents and service capacity.", "Mobility monitoring|Incident workflow|Planning dashboards", "Transport authorities|Mobility operators", "Quicker coordination|Evidence-led planning", "Streaming-data ready architecture|Geospatial analysis interface", "Fictional smart-transport scenario for product demonstration."],
  ["Connected Community Workspace", "Smart Community", "A neighbourhood service workspace connecting requests, facilities and community operations.", "Community teams manage service requests across disconnected channels and manual registers.", "Request intake|Service routing|Community dashboard", "Community operators|Property service teams", "Clearer service ownership|More responsive operations", "Configurable workflows|Mobile-responsive task views", "Fictional community-operations demonstration concept."],
  ["Urban Governance Command View", "Urban Governance", "A decision-support view for prioritising urban governance cases and monitoring resolution.", "Leaders need concise, traceable oversight without relying on manually consolidated reports.", "Case prioritisation|Outcome tracking|Leadership briefings", "Governance offices|District operations teams", "Better oversight|More consistent follow-through", "Event-driven case model|Configurable indicators", "Fictional governance workflow; metrics shown are demonstration records only."],
  ["Enterprise Service Digitisation Kit", "Enterprise Digitalisation", "A modular workflow toolkit for digitising repeatable enterprise service processes.", "Growing organisations often rely on spreadsheets and disconnected approval processes.", "Workflow templates|Approval routing|Operational reporting", "Enterprise operations|Shared-service teams", "Reduced manual coordination|Improved process visibility", "Modular workflow engine|Standards-based interfaces", "Fictional enterprise transformation package for demonstration."],
  ["Trusted Data Governance Console", "Data Governance", "A governance workspace for data ownership, quality rules and issue remediation.", "Data teams need practical controls that connect policies to daily issue resolution.", "Ownership register|Quality rules|Issue workflow", "Data governance offices|Data engineering teams", "Clear accountability|More reliable operational data", "Policy-to-control mapping|Lineage-ready metadata model", "Fictional data-governance solution concept."],
  ["Inclusive Public Service Portal", "Public-Service Digitalisation", "An accessible digital front door for public information and assisted service navigation.", "People need consistent access to service information across devices and accessibility needs.", "Accessible content|Guided navigation|Service directory", "Service owners|Public contact teams", "Improved discoverability|More inclusive access", "Accessibility-first component system|Structured content model", "Fictional public-service portal demonstration."],
  ["Government Service Copilot", "AI-assisted Government Services", "A human-supervised assistant for drafting service responses from approved knowledge.", "Service teams spend time locating approved information and structuring routine responses.", "Grounded answer drafting|Source references|Human approval queue", "Service agents|Knowledge managers", "Faster drafting|More consistent information use", "Retrieval-grounded generation pattern|Review and audit trail", "Fictional AI assistant concept; no live government knowledge or citizen data is included."],
  ["Project Delivery Control Tower", "Digital Government Services", "A portfolio view for monitoring milestones, dependencies and delivery risks.", "Multi-party digital projects need shared progress visibility and early risk escalation.", "Milestone tracking|Dependency map|Risk workflow", "Programme offices|Delivery partners", "Earlier risk visibility|Clearer delivery accountability", "Portfolio data model|Configurable governance gates", "Fictional project-delivery demonstration solution."],
  ["City Asset Intelligence Register", "Smart City Operations", "A governed register for discovering assets, maintenance context and ownership.", "Asset information can be duplicated across systems and difficult to reconcile.", "Asset catalogue|Ownership mapping|Maintenance context", "Asset managers|Operations teams", "Improved asset visibility|More coordinated maintenance planning", "Extensible asset schema|Integration-ready identifiers", "Fictional city-asset management concept for demonstration."],
] as const;

export const DEMO_SOLUTIONS: Solution[] = solutionSeeds.map((seed, index) => ({
  solution_id: `SOL-${String(index + 1).padStart(3, "0")}`,
  solution_name: seed[0],
  solution_category: seed[1],
  short_description: seed[2],
  business_problem: seed[3],
  key_capabilities: list(seed[4]),
  target_users: list(seed[5]),
  business_value: list(seed[6]),
  technical_highlights: list(seed[7]),
  implementation_context: seed[8],
  source_reference: "EchoFlow fictional demo dataset v2 — not Digital Zhengzhou internal product data",
  created_at: iso(1),
  updated_at: iso(1),
}));

export const DEMO_STAKEHOLDERS: Stakeholder[] = [
  { stakeholder_id: "STK-GOV", name: "Government Decision Maker", goals: ["Demonstrate public value", "Improve governance outcomes"], pain_points: ["Fragmented oversight", "Implementation uncertainty"], information_needs: ["Public value", "Feasibility", "Governance impact"], messaging_priority: ["Outcomes", "Efficiency", "Implementation confidence"], technical_depth: "Low", preferred_tone: "Strategic, accountable and outcome-led", cta: "Schedule an executive solution briefing", risk_concerns: ["Delivery risk", "Public accountability", "Unsupported claims"] },
  { stakeholder_id: "STK-PROC", name: "Procurement / Project Stakeholder", goals: ["Define an evaluable scope", "Control delivery risk"], pain_points: ["Ambiguous requirements", "Supplier dependency"], information_needs: ["Scope", "Implementation stages", "Acceptance approach"], messaging_priority: ["Deliverables", "Governance", "Practical rollout"], technical_depth: "Medium", preferred_tone: "Precise, structured and implementation-aware", cta: "Request a scoped discovery workshop", risk_concerns: ["Compliance", "Budget control", "Operational continuity"] },
  { stakeholder_id: "STK-ENT", name: "Enterprise Client", goals: ["Improve operations", "Build a credible business case"], pain_points: ["Manual coordination", "Unclear adoption value"], information_needs: ["Operational impact", "ROI logic", "Adoption pathway"], messaging_priority: ["Business value", "Time to value", "User adoption"], technical_depth: "Medium", preferred_tone: "Commercial, practical and benefit-led", cta: "Explore a use-case assessment", risk_concerns: ["Adoption", "Integration effort", "Value realisation"] },
  { stakeholder_id: "STK-TECH", name: "Technical Decision Maker", goals: ["Protect architectural integrity", "Ensure scalable delivery"], pain_points: ["Legacy integration", "Data and security risk"], information_needs: ["Architecture", "Integration", "Scalability", "Data governance"], messaging_priority: ["Technical fit", "Security", "Interoperability"], technical_depth: "High", preferred_tone: "Evidence-led, specific and technically rigorous", cta: "Review the reference architecture", risk_concerns: ["Security", "Maintainability", "Vendor lock-in"] },
  { stakeholder_id: "STK-PART", name: "Industry / Ecosystem Partner", goals: ["Identify complementary value", "Clarify delivery roles"], pain_points: ["Unclear interfaces", "Overlapping responsibilities"], information_needs: ["Partner model", "Integration boundaries", "Joint value"], messaging_priority: ["Ecosystem fit", "Collaboration model", "Shared outcomes"], technical_depth: "Medium", preferred_tone: "Collaborative, credible and opportunity-led", cta: "Discuss a joint solution workshop", risk_concerns: ["Role clarity", "Data boundaries", "Commercial alignment"] },
];

export function createStrategy(solution: Solution, stakeholder: Stakeholder, objective: string, contentType: string, id = `STR-${Date.now()}`): MessagingStrategy {
  return {
    strategy_id: id,
    solution_id: solution.solution_id,
    stakeholder_id: stakeholder.stakeholder_id,
    marketing_objective: objective,
    content_type: contentType,
    core_value_proposition: `${solution.solution_name} gives ${stakeholder.name.toLowerCase()} a structured way to address ${solution.business_problem.toLowerCase()}`,
    key_messages: [solution.business_value[0], solution.key_capabilities[0], `Designed around ${stakeholder.messaging_priority[0].toLowerCase()} and ${stakeholder.messaging_priority[1].toLowerCase()}.`],
    supporting_proof_points: [`Supplied capability: ${solution.key_capabilities[0]}`, `Supplied technical highlight: ${solution.technical_highlights[0]}`, `Implementation context: ${solution.implementation_context}`],
    recommended_tone: stakeholder.preferred_tone,
    cta: stakeholder.cta,
    content_angle: `${objective} through ${stakeholder.messaging_priority.slice(0, 2).join(" and ").toLowerCase()}`,
    updated_at: new Date().toISOString(),
  };
}

export function generateDemoCopy(solution: Solution, stakeholder: Stakeholder, strategy: MessagingStrategy) {
  const title = `${solution.solution_name}: ${strategy.key_messages[0]}`;
  const content = `${solution.short_description}\n\nFor ${stakeholder.name.toLowerCase()} teams, the priority is ${stakeholder.messaging_priority.slice(0, 2).join(" and ").toLowerCase()}. EchoFlow uses only the supplied solution record: the concept includes ${solution.key_capabilities.slice(0, 3).join(", ").toLowerCase()}. Its stated business value is ${solution.business_value.join(" and ").toLowerCase()}.\n\nImplementation context: ${solution.implementation_context}\n\nRecommended next step: ${strategy.cta}.\n\nEvidence note: This draft is generated from a fictional demonstration record. Validate every external claim before use; no statistics, clients, government partnerships or production capabilities have been inferred.`;
  return { title, content };
}

export function makeBenchmark(input: Omit<BenchmarkRecord, "total_ai_minutes" | "time_saved_minutes" | "time_reduction_percentage">): BenchmarkRecord {
  const total = input.ai_generation_minutes + input.ai_review_minutes + input.ai_edit_minutes;
  const saved = input.manual_minutes - total;
  return {
    ...input,
    total_ai_minutes: round(total, 2),
    time_saved_minutes: round(saved, 2),
    time_reduction_percentage: input.manual_minutes > 0 ? round((saved / input.manual_minutes) * 100, 1) : 0,
  };
}

export function calculateAnalytics(workspace: Workspace): Analytics {
  const approved = workspace.assets.filter((asset) => asset.review_status === "approved" || asset.review_status === "final");
  const reviewed = workspace.assets.filter((asset) => asset.approved_first_pass !== null);
  return {
    solution_count: workspace.solutions.length,
    stakeholder_count: workspace.stakeholders.length,
    content_asset_count: workspace.assets.length,
    approved_asset_count: approved.length,
    reviewed_asset_count: reviewed.length,
    first_pass_approval_rate: round((reviewed.filter((asset) => asset.approved_first_pass).length / Math.max(reviewed.length, 1)) * 100, 1),
    average_edit_count: round(average(workspace.assets.map((asset) => asset.edit_count)), 2),
    content_reuse_rate: round((approved.filter((asset) => asset.reuse_count > 0).length / Math.max(approved.length, 1)) * 100, 1),
    average_generation_time_seconds: round(average(workspace.assets.map((asset) => asset.generation_seconds)), 1),
    average_review_time_minutes: round(average(reviewed.map((asset) => asset.review_time_minutes)), 1),
    manual_adaptation_time: round(average(workspace.benchmarks.map((benchmark) => benchmark.manual_minutes)), 1),
    ai_adaptation_time: round(average(workspace.benchmarks.map((benchmark) => benchmark.total_ai_minutes)), 1),
    time_reduction_rate: round(average(workspace.benchmarks.map((benchmark) => benchmark.time_reduction_percentage)), 1),
  };
}

export function applyReviewDecision(workspace: Workspace, draftId: string, decision: "approved" | "rejected" | "finalised", occurredAt = new Date().toISOString()): Workspace {
  const current = workspace.assets.find((asset) => asset.draft_id === draftId);
  if (!current) return workspace;
  const nextStatus: ReviewStatus = decision === "finalised" ? "final" : decision;
  const duration = current.review_time_minutes || Math.max(1, Math.round((new Date(occurredAt).getTime() - new Date(current.generated_at).getTime()) / 60000));
  return {
    ...workspace,
    assets: workspace.assets.map((asset) => asset.draft_id === draftId ? { ...asset, review_status: nextStatus, approved_first_pass: asset.approved_first_pass ?? (decision === "approved" && asset.edit_count === 0), review_time_minutes: duration, finalised_at: nextStatus === "final" ? occurredAt : asset.finalised_at } : asset),
    reviews: [{ review_id: `REV-${Date.now()}`, draft_id: draftId, action: decision, occurred_at: occurredAt, duration_minutes: duration, note: `${nextStatus} through human review.` }, ...workspace.reviews],
  };
}

export function applyContentEdit(workspace: Workspace, draftId: string, title: string, content: string, occurredAt = new Date().toISOString()): Workspace {
  if (!title.trim() || !content.trim() || !workspace.assets.some((asset) => asset.draft_id === draftId)) return workspace;
  return {
    ...workspace,
    assets: workspace.assets.map((asset) => asset.draft_id === draftId ? { ...asset, title: title.trim(), content: content.trim(), edit_count: asset.edit_count + 1, version: asset.version + 1, review_status: "in_review", approved_first_pass: asset.approved_first_pass ?? false } : asset),
    reviews: [{ review_id: `REV-${Date.now()}`, draft_id: draftId, action: "edited", occurred_at: occurredAt, duration_minutes: 3, note: "Content edited during human review." }, ...workspace.reviews],
  };
}

export function applyReuse(workspace: Workspace, draftId: string, context: string): Workspace {
  if (!context.trim()) return workspace;
  return { ...workspace, assets: workspace.assets.map((asset) => asset.draft_id === draftId && (asset.review_status === "approved" || asset.review_status === "final") ? { ...asset, reuse_count: asset.reuse_count + 1, reuse_context: [...asset.reuse_context, context] } : asset) };
}

export function buildDemoWorkspace(): Workspace {
  const strategies: MessagingStrategy[] = [];
  const assets: ContentAsset[] = [];
  const reviews: ReviewEvent[] = [];
  const benchmarks: BenchmarkRecord[] = [];
  let assetIndex = 0;

  for (const [solutionIndex, solution] of DEMO_SOLUTIONS.entries()) {
    for (const [stakeholderIndex, stakeholder] of DEMO_STAKEHOLDERS.entries()) {
      for (let variant = 0; variant < 2; variant += 1) {
        assetIndex += 1;
        const contentType = CONTENT_TYPES[(solutionIndex * 2 + stakeholderIndex + variant) % CONTENT_TYPES.length];
        const objective = MARKETING_OBJECTIVES[(solutionIndex + stakeholderIndex + variant) % MARKETING_OBJECTIVES.length];
        const strategy = createStrategy(solution, stakeholder, objective, contentType, `STR-${String(assetIndex).padStart(4, "0")}`);
        const copy = generateDemoCopy(solution, stakeholder, strategy);
        const reviewed = assetIndex % 9 !== 0;
        const approved = reviewed && assetIndex % 7 !== 0;
        const firstPass = approved && assetIndex % 4 !== 0;
        const editCount = reviewed ? (firstPass ? 0 : 1 + (assetIndex % 2)) : 0;
        const status: ReviewStatus = !reviewed ? "draft" : approved ? (assetIndex % 3 === 0 ? "final" : "approved") : "rejected";
        const reused = approved && assetIndex % 3 !== 0;
        const generatedAt = iso(2 + (assetIndex % 24), 8 + (assetIndex % 9));
        const draftId = `AST-${String(assetIndex).padStart(4, "0")}`;
        strategies.push(strategy);
        assets.push({
          draft_id: draftId,
          solution_id: solution.solution_id,
          stakeholder_id: stakeholder.stakeholder_id,
          content_type: contentType,
          marketing_objective: objective,
          title: copy.title,
          content: copy.content,
          generated_at: generatedAt,
          generation_seconds: 7 + (assetIndex % 19),
          generation_mode: "demo",
          review_status: status,
          approved_first_pass: reviewed ? firstPass : null,
          edit_count: editCount,
          review_time_minutes: reviewed ? 5 + (assetIndex % 13) : 0,
          finalised_at: status === "final" ? iso(3 + (assetIndex % 23), 15) : null,
          reuse_count: reused ? 1 + (assetIndex % 3) : 0,
          reuse_context: reused ? [REUSE_CONTEXTS[assetIndex % REUSE_CONTEXTS.length]] : [],
          version: 1 + editCount,
        });
        if (reviewed) {
          reviews.push({ review_id: `REV-${String(assetIndex).padStart(4, "0")}`, draft_id: draftId, action: approved ? "approved" : "rejected", occurred_at: iso(3 + (assetIndex % 23), 14), duration_minutes: 5 + (assetIndex % 13), note: firstPass ? "Approved without edits in evaluation run." : approved ? "Approved after evidence-language edit." : "Returned for unsupported or unclear wording." });
        }
        const manual = 34 + (assetIndex % 27);
        benchmarks.push(makeBenchmark({ benchmark_id: `BM-${String(assetIndex).padStart(4, "0")}`, solution_id: solution.solution_id, stakeholder_id: stakeholder.stakeholder_id, content_type: contentType, manual_minutes: manual, ai_generation_minutes: round((7 + (assetIndex % 19)) / 60, 2), ai_review_minutes: reviewed ? 5 + (assetIndex % 13) : 8, ai_edit_minutes: editCount * (3 + (assetIndex % 4)), timestamp: generatedAt }));
      }
    }
  }

  return { schema_version: 2, solutions: DEMO_SOLUTIONS, stakeholders: DEMO_STAKEHOLDERS, strategies, assets, reviews, benchmarks, settings: { generation_mode: "demo", model: "gpt-5.6-luna" } };
}

export function groupCount<T>(items: T[], getKey: (item: T) => string) {
  const counts = new Map<string, number>();
  items.forEach((item) => counts.set(getKey(item), (counts.get(getKey(item)) ?? 0) + 1));
  return [...counts.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

const csvCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const csv = (headers: string[], rows: unknown[][]) => [headers.map(csvCell).join(","), ...rows.map((row) => row.map(csvCell).join(","))].join("\n");

export function exportFiles(workspace: Workspace) {
  const analytics = calculateAnalytics(workspace);
  return {
    "solutions.csv": csv(Object.keys(workspace.solutions[0]) as string[], workspace.solutions.map((item) => Object.values(item).map((value) => Array.isArray(value) ? value.join(" | ") : value))),
    "content_assets.csv": csv(Object.keys(workspace.assets[0]) as string[], workspace.assets.map((item) => Object.values(item).map((value) => Array.isArray(value) ? value.join(" | ") : value))),
    "reviews.csv": csv(Object.keys(workspace.reviews[0]) as string[], workspace.reviews.map(Object.values)),
    "benchmarks.csv": csv(Object.keys(workspace.benchmarks[0]) as string[], workspace.benchmarks.map(Object.values)),
    "analytics_summary.csv": csv(["metric", "value", "calculation_source"], Object.entries(analytics).map(([key, value]) => [key, value, key.includes("time") ? "benchmarks/content assets" : "workspace content/review/reuse records"])),
  };
}

export function isWorkspace(value: unknown): value is Workspace {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<Workspace>;
  return candidate.schema_version === 2 && Array.isArray(candidate.solutions) && Array.isArray(candidate.stakeholders) && Array.isArray(candidate.assets) && Array.isArray(candidate.reviews) && Array.isArray(candidate.benchmarks);
}
