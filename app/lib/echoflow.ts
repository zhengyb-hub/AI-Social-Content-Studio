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
  technical_depth: "低" | "中" | "高";
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
  schema_version: 3;
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
  "解决方案简报",
  "高管摘要",
  "建议书文案",
  "销售赋能文案",
  "案例摘要",
  "活动 / 会议传播文案",
  "企业社交媒体内容",
  "解决方案介绍",
  "关键角色邮件",
  "整合营销文案",
] as const;

export const MARKETING_OBJECTIVES = [
  "提升方案认知",
  "促进关键角色共识",
  "支持销售沟通",
  "说明实施价值",
  "支持建议书编制",
] as const;

export const REUSE_CONTEXTS = ["项目建议书", "行业活动", "销售演示", "企业社交媒体", "客户简报"] as const;

const iso = (day: number, hour = 9) => `2026-07-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:00:00.000Z`;
const round = (value: number, digits = 1) => Number(value.toFixed(digits));
const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const list = (value: string) => value.split("|");

const solutionSeeds = [
  ["智慧城市运行协同中心", "智慧城市运营", "面向城市服务事件与跨部门响应的一体化运行视图。", "城市运行团队往往需要在分散系统与不同汇报链路之间协调事件处置。", "统一运行看板|事件协同工作台|可配置服务流程", "城市运行中心|城市服务团队", "提升运行可视性|加强跨团队协同", "面向 API 的集成模式|基于角色的信息视图", "用于市级运行协同场景的虚构演示方案。"],
  ["城市数据共享平台", "城市数据平台", "面向可复用城市数据产品的规范化数据共享基础。", "各部门需要在保留数据权属、质量控制与可追溯性的前提下开展数据共享。", "数据目录|访问申请流程|质量监测", "大数据管理部门|部门数据专员", "降低数据查找成本|提升数据治理一致性", "元数据驱动目录|可审计访问控制", "用于跨部门数据共享的虚构参考架构。"],
  ["一站式政务服务平台", "数字政务服务", "简化公共服务事项查找与办理流程的服务编排方案。", "公众可能面对服务入口分散、信息重复提交等问题。", "服务旅程设计|统一进度视图|智能服务导引", "政务服务中心|服务设计团队", "简化办事流程|提升服务进度透明度", "可组合服务模块|无障碍 Web 界面", "虚构演示方案，未连接任何真实政务服务。"],
  ["城市交通协同平台", "智慧交通", "用于分析交通运行信号并协调交通响应的共享运营层。", "交通管理与运营单位需要统一查看拥堵、事件和运力情况。", "交通运行监测|事件处置流程|规划分析看板", "交通主管部门|交通运营单位", "加快协同响应|支持数据驱动规划", "流式数据架构|地理空间分析界面", "用于产品演示的虚构智慧交通场景。"],
  ["智慧社区协同工作台", "智慧社区", "连接居民诉求、公共设施和社区运营的基层服务工作台。", "社区团队常通过分散渠道与人工台账管理服务诉求。", "诉求受理|服务分派|社区运营看板", "社区运营人员|物业服务团队", "明确服务责任|提升响应效率", "可配置工作流|移动端响应式任务视图", "虚构的社区运营演示方案。"],
  ["城市治理指挥视图", "城市治理", "支持治理案件优先级判断与处置跟踪的决策视图。", "管理人员需要简明、可追溯的治理视图，减少对人工汇总报告的依赖。", "案件优先级管理|处置结果跟踪|领导驾驶舱", "城市治理部门|区县运行团队", "提升治理监督效率|加强处置闭环", "事件驱动案件模型|可配置指标", "虚构治理流程，页面指标仅为演示记录。"],
  ["企业服务数字化工具包", "企业数字化", "用于数字化改造重复性企业服务流程的模块化工具包。", "成长型企业常依赖表格和相互割裂的审批流程。", "流程模板|审批路由|运营报表", "企业运营部门|共享服务团队", "减少人工协调|提升流程透明度", "模块化流程引擎|标准化接口", "用于演示的虚构企业转型方案。"],
  ["可信数据治理工作台", "数据治理", "连接数据权责、质量规则与问题整改的数据治理工作台。", "数据团队需要将治理制度落实到日常问题处置中的实用工具。", "权责登记|质量规则|问题整改流程", "数据治理部门|数据工程团队", "明确数据责任|提升运营数据可靠性", "制度到控制点映射|支持血缘的元数据模型", "虚构数据治理方案。"],
  ["普惠公共服务门户", "公共服务数字化", "面向公共信息查询与辅助服务导引的无障碍数字入口。", "公众需要在不同设备与无障碍需求下获得一致的服务信息。", "无障碍内容|引导式导航|服务目录", "公共服务主管部门|公众联络团队", "提升服务可发现性|扩大普惠服务覆盖", "无障碍优先组件体系|结构化内容模型", "虚构公共服务门户演示方案。"],
  ["政务服务智能助手", "AI 辅助政务服务", "基于已审核知识、由人工监督的政务服务答复起草助手。", "服务人员需要花费时间查找已批准信息并组织常规答复。", "基于知识的答复起草|来源引用|人工审核队列", "政务服务人员|知识管理人员", "加快答复起草|提升信息使用一致性", "检索增强生成模式|审核与审计轨迹", "虚构 AI 助手方案，不包含真实政务知识或公民数据。"],
  ["项目交付管控中心", "数字政务服务", "用于监测里程碑、依赖关系和交付风险的项目组合视图。", "多方参与的数字化项目需要共享进度并提前上报风险。", "里程碑跟踪|依赖关系图|风险处置流程", "项目管理办公室|交付合作伙伴", "提前识别风险|明确交付责任", "项目组合数据模型|可配置治理关口", "虚构项目交付管理演示方案。"],
  ["城市资产智能台账", "智慧城市运营", "用于查询资产、维护场景和权属信息的规范化城市资产台账。", "资产信息可能分散于不同系统，存在重复且难以核对的问题。", "资产目录|权属映射|维护信息管理", "资产管理人员|城市运行团队", "提升资产可见性|加强维护计划协同", "可扩展资产数据模型|集成就绪标识体系", "用于演示的虚构城市资产管理方案。"],
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
  source_reference: "EchoFlow 虚构演示数据集 v2——并非数字郑州内部产品数据",
  created_at: iso(1),
  updated_at: iso(1),
}));

export const DEMO_STAKEHOLDERS: Stakeholder[] = [
  { stakeholder_id: "STK-GOV", name: "政府决策者", goals: ["体现公共价值", "提升治理成效"], pain_points: ["监督信息分散", "实施可行性不明确"], information_needs: ["公共价值", "可实施性", "治理影响"], messaging_priority: ["治理成效", "运行效率", "实施信心"], technical_depth: "低", preferred_tone: "战略清晰、责任明确、结果导向", cta: "预约管理层方案汇报", risk_concerns: ["交付风险", "公共责任", "缺乏依据的表述"] },
  { stakeholder_id: "STK-PROC", name: "采购 / 项目负责人", goals: ["形成可评估的项目范围", "控制交付风险"], pain_points: ["需求边界模糊", "供应商依赖"], information_needs: ["项目范围", "实施阶段", "验收方式"], messaging_priority: ["交付成果", "项目治理", "落地路径"], technical_depth: "中", preferred_tone: "精准、结构化、关注实施", cta: "申请项目范围梳理工作坊", risk_concerns: ["合规性", "预算控制", "业务连续性"] },
  { stakeholder_id: "STK-ENT", name: "企业客户", goals: ["改善运营效率", "建立可信商业论证"], pain_points: ["人工协调成本高", "应用价值不明确"], information_needs: ["运营影响", "投入产出逻辑", "应用推广路径"], messaging_priority: ["业务价值", "价值实现速度", "用户采纳"], technical_depth: "中", preferred_tone: "商业化、务实、价值导向", cta: "开展业务场景评估", risk_concerns: ["用户采纳", "集成成本", "价值兑现"] },
  { stakeholder_id: "STK-TECH", name: "技术决策者", goals: ["保障架构完整性", "确保可扩展交付"], pain_points: ["遗留系统集成", "数据与安全风险"], information_needs: ["系统架构", "集成方式", "扩展能力", "数据治理"], messaging_priority: ["技术适配", "安全保障", "互操作性"], technical_depth: "高", preferred_tone: "基于证据、具体严谨、技术清晰", cta: "评审参考架构", risk_concerns: ["安全性", "可维护性", "供应商锁定"] },
  { stakeholder_id: "STK-PART", name: "行业 / 生态合作伙伴", goals: ["识别互补价值", "明确交付分工"], pain_points: ["接口边界不清", "职责范围重叠"], information_needs: ["合作模式", "集成边界", "联合价值"], messaging_priority: ["生态适配", "协作模式", "共同成果"], technical_depth: "中", preferred_tone: "协作、可信、机会导向", cta: "讨论联合方案工作坊", risk_concerns: ["角色分工", "数据边界", "商业协同"] },
];

export function createStrategy(solution: Solution, stakeholder: Stakeholder, objective: string, contentType: string, id = `STR-${Date.now()}`): MessagingStrategy {
  return {
    strategy_id: id,
    solution_id: solution.solution_id,
    stakeholder_id: stakeholder.stakeholder_id,
    marketing_objective: objective,
    content_type: contentType,
    core_value_proposition: `${solution.solution_name}为${stakeholder.name}提供结构化路径，帮助解决“${solution.business_problem}”这一业务问题。`,
    key_messages: [solution.business_value[0], solution.key_capabilities[0], `围绕${stakeholder.messaging_priority[0]}与${stakeholder.messaging_priority[1]}组织信息表达。`],
    supporting_proof_points: [`已提供的方案能力：${solution.key_capabilities[0]}`, `已提供的技术亮点：${solution.technical_highlights[0]}`, `实施场景：${solution.implementation_context}`],
    recommended_tone: stakeholder.preferred_tone,
    cta: stakeholder.cta,
    content_angle: `围绕${stakeholder.messaging_priority.slice(0, 2).join("与")}实现“${objective}”`,
    updated_at: new Date().toISOString(),
  };
}

export function generateDemoCopy(solution: Solution, stakeholder: Stakeholder, strategy: MessagingStrategy) {
  const title = `${solution.solution_name}：${strategy.key_messages[0]}`;
  const content = `${solution.short_description}\n\n对于${stakeholder.name}，重点应放在${stakeholder.messaging_priority.slice(0, 2).join("与")}。EchoFlow 仅使用已提供的方案记录生成内容：该方案包含${solution.key_capabilities.slice(0, 3).join("、")}，已记录的业务价值为${solution.business_value.join("与")}。\n\n实施场景：${solution.implementation_context}\n\n建议下一步：${strategy.cta}。\n\n事实说明：本初稿根据虚构演示记录生成。对外使用前必须核验所有表述；系统没有推断或虚构统计数据、客户案例、政府合作关系或生产环境能力。`;
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
    reviews: [{ review_id: `REV-${Date.now()}`, draft_id: draftId, action: decision, occurred_at: occurredAt, duration_minutes: duration, note: `人工审核已将内容更新为${nextStatus === "approved" ? "已批准" : nextStatus === "rejected" ? "已驳回" : "已定稿"}状态。` }, ...workspace.reviews],
  };
}

export function applyContentEdit(workspace: Workspace, draftId: string, title: string, content: string, occurredAt = new Date().toISOString()): Workspace {
  if (!title.trim() || !content.trim() || !workspace.assets.some((asset) => asset.draft_id === draftId)) return workspace;
  return {
    ...workspace,
    assets: workspace.assets.map((asset) => asset.draft_id === draftId ? { ...asset, title: title.trim(), content: content.trim(), edit_count: asset.edit_count + 1, version: asset.version + 1, review_status: "in_review", approved_first_pass: asset.approved_first_pass ?? false } : asset),
    reviews: [{ review_id: `REV-${Date.now()}`, draft_id: draftId, action: "edited", occurred_at: occurredAt, duration_minutes: 3, note: "内容已在人工审核环节完成编辑。" }, ...workspace.reviews],
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
          reviews.push({ review_id: `REV-${String(assetIndex).padStart(4, "0")}`, draft_id: draftId, action: approved ? "approved" : "rejected", occurred_at: iso(3 + (assetIndex % 23), 14), duration_minutes: 5 + (assetIndex % 13), note: firstPass ? "评估中未修改即通过。" : approved ? "调整证据表述后通过。" : "因表述缺少依据或不够清晰而退回。" });
        }
        const manual = 34 + (assetIndex % 27);
        benchmarks.push(makeBenchmark({ benchmark_id: `BM-${String(assetIndex).padStart(4, "0")}`, solution_id: solution.solution_id, stakeholder_id: stakeholder.stakeholder_id, content_type: contentType, manual_minutes: manual, ai_generation_minutes: round((7 + (assetIndex % 19)) / 60, 2), ai_review_minutes: reviewed ? 5 + (assetIndex % 13) : 8, ai_edit_minutes: editCount * (3 + (assetIndex % 4)), timestamp: generatedAt }));
      }
    }
  }

  return { schema_version: 3, solutions: DEMO_SOLUTIONS, stakeholders: DEMO_STAKEHOLDERS, strategies, assets, reviews, benchmarks, settings: { generation_mode: "demo", model: "gpt-5.6-luna" } };
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
  return candidate.schema_version === 3 && Array.isArray(candidate.solutions) && Array.isArray(candidate.stakeholders) && Array.isArray(candidate.assets) && Array.isArray(candidate.reviews) && Array.isArray(candidate.benchmarks);
}
