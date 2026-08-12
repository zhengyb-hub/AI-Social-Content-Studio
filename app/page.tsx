"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Analytics,
  BrandProfile,
  Campaign,
  CampaignStatus,
  CHANNELS,
  CONTENT_TYPES,
  ContentAsset,
  MARKETING_OBJECTIVES,
  MessagingStrategy,
  REUSE_CONTEXTS,
  ReviewStatus,
  Solution,
  Workspace,
  applyContentEdit,
  applyReuse,
  applyReviewDecision,
  advanceCampaign,
  buildDemoWorkspace,
  calculateAnalytics,
  createStrategy,
  exportFiles,
  generateDemoCopy,
  groupCount,
  normaliseWorkspace,
  scoreContent,
} from "./lib/echoflow";

type Page = "overview" | "knowledge" | "campaigns" | "studio" | "review" | "assets" | "insights" | "governance";

const NAV: Array<{ page: Page; label: string; icon: string }> = [
  { page: "overview", label: "运营总览", icon: "总" },
  { page: "knowledge", label: "方案知识库", icon: "知" },
  { page: "campaigns", label: "活动中心", icon: "战" },
  { page: "studio", label: "AI 创作", icon: "创" },
  { page: "review", label: "审核中心", icon: "审" },
  { page: "assets", label: "内容资产", icon: "库" },
  { page: "insights", label: "数据洞察", icon: "析" },
  { page: "governance", label: "品牌与治理", icon: "治" },
];

const STATUS_LABELS: Record<ReviewStatus, string> = { draft: "草稿", in_review: "待审核", approved: "已批准", rejected: "已退回", final: "已定稿" };
const CAMPAIGN_LABELS: Record<CampaignStatus, string> = { planning: "策划中", active: "进行中", review: "审核中", complete: "已完成" };
const formatDate = (value: string) => new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric" }).format(new Date(value));
const percent = (value: number) => `${value.toFixed(1)}%`;

function download(name: string, body: string, type = "text/csv;charset=utf-8") {
  const url = URL.createObjectURL(new Blob(["\ufeff", body], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function Header({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <header className="page-header"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action && <div className="header-action">{action}</div>}</header>;
}

function Metric({ label, value, note, tone = "indigo" }: { label: string; value: string | number; note: string; tone?: string }) {
  return <article className={`metric-card ${tone}`}><div className="metric-top"><span>{label}</span><i>↗</i></div><strong>{value}</strong><small>{note}</small></article>;
}

function Progress({ value, tone = "indigo" }: { value: number; tone?: string }) {
  return <div className="progress"><i className={tone} style={{ width: `${Math.max(3, Math.min(100, value))}%` }} /></div>;
}

function Overview({ workspace, analytics, go }: { workspace: Workspace; analytics: Analytics; go: (page: Page) => void }) {
  const activeCampaigns = workspace.campaigns.filter((item) => item.status === "active" || item.status === "review");
  const pending = workspace.assets.filter((item) => item.review_status === "in_review" || item.review_status === "rejected").slice(0, 4);
  const recent = workspace.reviews.slice(0, 5);
  const statusCounts = groupCount(workspace.assets, (asset) => STATUS_LABELS[asset.review_status]);
  return <>
    <section className="command-hero">
      <div className="hero-copy"><span className="live-pill"><i /> 内容运营中枢已就绪</span><h1>从可信知识到<br/><em>可发布内容</em>，一站协同。</h1><p>将方案知识、品牌规则、AI 创作与人工审核连接为可追溯的企业内容工作流。</p><div className="hero-actions"><button className="primary large" onClick={() => go("studio")}>＋ 创建内容</button><button className="ghost large" onClick={() => go("campaigns")}>查看活动中心 <span>→</span></button></div></div>
      <div className="hero-console"><div className="console-head"><span>本周内容运行</span><b>实时</b></div><div className="console-score"><strong>{analytics.average_quality_score}</strong><span>平均质量分</span><Progress value={analytics.average_quality_score}/></div><div className="console-grid"><div><b>{analytics.pending_review_count}</b><span>待审核</span></div><div><b>{analytics.active_campaign_count}</b><span>活跃活动</span></div><div><b>{percent(analytics.compliance_pass_rate)}</b><span>合规通过</span></div></div><div className="console-note"><i>✓</i><span>品牌与事实护栏已应用于全部生成任务</span></div></div>
    </section>
    <section className="metrics four"><Metric label="活跃营销活动" value={analytics.active_campaign_count} note={`共 ${workspace.campaigns.length} 个活动空间`}/><Metric label="待审核内容" value={analytics.pending_review_count} note="需要人工判断" tone="amber"/><Metric label="首次通过率" value={percent(analytics.first_pass_approval_rate)} note={`${analytics.reviewed_asset_count} 条已审核资产`} tone="teal"/><Metric label="内容复用率" value={percent(analytics.content_reuse_rate)} note="已批准内容跨渠道复用" tone="violet"/></section>
    <section className="overview-grid">
      <article className="surface span-two"><div className="section-head"><div><span>活动进展</span><h2>正在推进的内容计划</h2></div><button className="text-action" onClick={() => go("campaigns")}>管理全部 →</button></div><div className="campaign-list">{activeCampaigns.map((campaign) => { const count = workspace.assets.filter((asset) => asset.campaign_id === campaign.campaign_id).length; const approved = workspace.assets.filter((asset) => asset.campaign_id === campaign.campaign_id && ["approved", "final"].includes(asset.review_status)).length; const completion = count ? Math.round(approved / count * 100) : 0; return <button key={campaign.campaign_id} onClick={() => go("campaigns")}><div className="campaign-avatar">{campaign.campaign_name.slice(0, 1)}</div><div className="campaign-copy"><strong>{campaign.campaign_name}</strong><span>{campaign.channels.join(" · ")} · {count} 条资产</span><Progress value={completion} tone={campaign.status === "review" ? "amber" : "indigo"}/></div><div className="campaign-end"><span className={`campaign-status ${campaign.status}`}>{CAMPAIGN_LABELS[campaign.status]}</span><small>{completion}%</small></div></button>; })}</div></article>
      <article className="surface"><div className="section-head"><div><span>审核队列</span><h2>需要你的判断</h2></div><button className="text-action" onClick={() => go("review")}>进入审核 →</button></div><div className="compact-list">{pending.map((asset) => <button key={asset.draft_id} onClick={() => go("review")}><span className="doc-icon">文</span><div><strong>{asset.title}</strong><small>{asset.channel} · 质量 {asset.quality_score}</small></div><b>›</b></button>)}</div></article>
      <article className="surface"><div className="section-head"><div><span>工作流分布</span><h2>内容生命周期</h2></div></div><div className="distribution">{statusCounts.map((item, index) => <div key={item.label}><span><i className={`dot d${index}`}/>{item.label}</span><b>{item.value}</b><Progress value={item.value / workspace.assets.length * 100} tone={`d${index}`}/></div>)}</div></article>
      <article className="surface span-two"><div className="section-head"><div><span>最近动态</span><h2>团队活动轨迹</h2></div></div><div className="activity-feed">{recent.map((event) => { const asset = workspace.assets.find((item) => item.draft_id === event.draft_id); return <div key={event.review_id}><span className="activity-mark">{event.action === "approved" ? "✓" : event.action === "rejected" ? "↩" : "✦"}</span><div><strong>{asset?.title ?? event.draft_id}</strong><p>{event.note}</p></div><time>{formatDate(event.occurred_at)}</time></div>; })}</div></article>
    </section>
  </>;
}

function Knowledge({ workspace, update }: { workspace: Workspace; update: (fn: (value: Workspace) => Workspace, message: string) => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(workspace.solutions[0]?.solution_id ?? "");
  const [creating, setCreating] = useState(false);
  const filtered = workspace.solutions.filter((item) => `${item.solution_name}${item.solution_category}${item.short_description}`.toLowerCase().includes(query.toLowerCase()));
  const active = workspace.solutions.find((item) => item.solution_id === selected) ?? filtered[0];
  function addSolution(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); const now = new Date().toISOString();
    const record: Solution = { solution_id: `SOL-${Date.now()}`, solution_name: String(data.get("name") ?? "").trim(), solution_category: String(data.get("category") ?? "").trim(), short_description: String(data.get("description") ?? "").trim(), business_problem: String(data.get("problem") ?? "").trim(), key_capabilities: String(data.get("capabilities") ?? "").split("\n").filter(Boolean), target_users: String(data.get("users") ?? "").split("\n").filter(Boolean), business_value: String(data.get("value") ?? "").split("\n").filter(Boolean), technical_highlights: String(data.get("technical") ?? "").split("\n").filter(Boolean), implementation_context: String(data.get("context") ?? "").trim(), source_reference: String(data.get("source") ?? "").trim() || "用户提供的方案资料", created_at: now, updated_at: now };
    if (!record.solution_name || !record.solution_category || !record.short_description || !record.business_problem) return;
    update((value) => ({ ...value, solutions: [record, ...value.solutions] }), "方案知识已保存。"); setSelected(record.solution_id); setCreating(false);
  }
  return <><Header eyebrow="企业知识底座" title="方案知识库" description="统一管理经过确认的方案事实，为 AI 创作提供可信、可追溯的上下文。" action={<><label className="search-box"><span>⌕</span><input aria-label="搜索方案" placeholder="搜索方案、分类或能力" value={query} onChange={(event) => setQuery(event.target.value)}/></label><button className="primary" onClick={() => setCreating(true)}>＋ 新建方案</button></>}/><section className="knowledge-layout"><aside className="knowledge-list"><div className="list-summary"><b>{filtered.length}</b><span>条方案知识</span></div>{filtered.map((item) => <button key={item.solution_id} className={active?.solution_id === item.solution_id ? "active" : ""} onClick={() => setSelected(item.solution_id)}><span>{item.solution_category.slice(0, 2)}</span><div><strong>{item.solution_name}</strong><small>{item.solution_category}</small></div><b>›</b></button>)}</aside>{active && <article className="knowledge-detail"><div className="knowledge-title"><div><span className="category-tag">{active.solution_category}</span><h2>{active.solution_name}</h2><p>{active.short_description}</p></div><div className="trust-badge"><i>✓</i><span>可信来源<small>演示数据已标注</small></span></div></div><div className="knowledge-stats"><div><span>核心能力</span><b>{active.key_capabilities.length}</b></div><div><span>目标用户</span><b>{active.target_users.length}</b></div><div><span>最近更新</span><b>{formatDate(active.updated_at)}</b></div></div><div className="detail-block"><span>业务问题</span><p>{active.business_problem}</p></div><div className="detail-columns"><div className="detail-block"><span>核心能力</span><ul>{active.key_capabilities.map((item) => <li key={item}>✓ {item}</li>)}</ul></div><div className="detail-block"><span>业务价值</span><ul>{active.business_value.map((item) => <li key={item}>↗ {item}</li>)}</ul></div></div><div className="detail-columns"><div className="detail-block"><span>技术亮点</span><ul>{active.technical_highlights.map((item) => <li key={item}>◇ {item}</li>)}</ul></div><div className="detail-block"><span>目标用户</span><ul>{active.target_users.map((item) => <li key={item}>○ {item}</li>)}</ul></div></div><footer className="source-box"><span>来源与实施场景</span><p>{active.source_reference}</p><small>{active.implementation_context}</small></footer></article>}</section>{creating && <div className="modal-backdrop" onMouseDown={() => setCreating(false)}><form className="modal" onSubmit={addSolution} onMouseDown={(event) => event.stopPropagation()}><div className="modal-head"><div><span>知识录入</span><h2>新建方案事实卡</h2></div><button type="button" onClick={() => setCreating(false)}>×</button></div><div className="form-grid"><label>方案名称<input name="name" required/></label><label>方案分类<input name="category" required/></label><label className="wide">一句话说明<textarea name="description" required/></label><label className="wide">业务问题<textarea name="problem" required/></label><label>核心能力（每行一项）<textarea name="capabilities"/></label><label>业务价值（每行一项）<textarea name="value"/></label><label>目标用户<textarea name="users"/></label><label>技术亮点<textarea name="technical"/></label><label className="wide">实施场景<textarea name="context"/></label><label className="wide">来源说明<input name="source"/></label></div><div className="modal-actions"><button type="button" className="ghost" onClick={() => setCreating(false)}>取消</button><button className="primary">保存方案知识</button></div></form></div>}</>;
}

function Campaigns({ workspace, update, go }: { workspace: Workspace; update: (fn: (value: Workspace) => Workspace, message: string) => void; go: (page: Page) => void }) {
  const [filter, setFilter] = useState<"all" | CampaignStatus>("all");
  const [creating, setCreating] = useState(false);
  const campaigns = workspace.campaigns.filter((item) => filter === "all" || item.status === filter);
  function addCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const channels = data.getAll("channels").map(String);
    if (!channels.length) return;
    const campaign: Campaign = { campaign_id: `CMP-${Date.now()}`, campaign_name: String(data.get("name")), solution_id: String(data.get("solution")), objective: String(data.get("objective")), channels, owner: String(data.get("owner")), status: "planning", due_date: String(data.get("due")), created_at: new Date().toISOString() };
    update((value) => ({ ...value, campaigns: [campaign, ...value.campaigns] }), "新活动空间已创建。");
    setCreating(false);
  }
  function advance(campaign: Campaign) {
    update((value) => advanceCampaign(value, campaign.campaign_id), campaign.status === "review" ? "活动已完成归档。" : "活动已推进到下一阶段。");
  }
  return <>
    <Header eyebrow="Campaign Workspace" title="活动中心" description="以活动为单位编排受众、渠道、内容资产与审核进度。" action={<button className="primary" onClick={() => setCreating(true)}>＋ 创建活动</button>}/>
    <div className="tab-row">{(["all", "planning", "active", "review", "complete"] as const).map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item === "all" ? "全部" : CAMPAIGN_LABELS[item]} <b>{item === "all" ? workspace.campaigns.length : workspace.campaigns.filter((campaign) => campaign.status === item).length}</b></button>)}</div>
    <section className="campaign-grid">{campaigns.map((campaign) => {
      const assets = workspace.assets.filter((asset) => asset.campaign_id === campaign.campaign_id);
      const ready = assets.filter((asset) => ["approved", "final"].includes(asset.review_status)).length;
      const completion = assets.length ? Math.round(ready / assets.length * 100) : 0;
      const solution = workspace.solutions.find((item) => item.solution_id === campaign.solution_id);
      const nextLabel = campaign.status === "planning" ? "启动活动" : campaign.status === "active" ? "提交审核" : campaign.status === "review" ? "完成归档" : "已完成";
      return <article key={campaign.campaign_id} className="campaign-card"><div className="campaign-card-head"><span className={`campaign-status ${campaign.status}`}>{CAMPAIGN_LABELS[campaign.status]}</span><span className="campaign-id">{campaign.campaign_id}</span></div><h2>{campaign.campaign_name}</h2><p>{solution?.solution_name}</p><div className="channel-chips">{campaign.channels.map((channel) => <span key={channel}>{channel}</span>)}</div><div className="campaign-meta"><span><small>负责人</small><b>{campaign.owner}</b></span><span><small>截止日期</small><b>{campaign.due_date}</b></span></div><div className="campaign-progress"><div><span>内容就绪</span><b>{ready}/{assets.length}</b></div><Progress value={completion}/></div><footer><button className="ghost" onClick={() => go("assets")}>查看资产</button><button className="primary" disabled={campaign.status === "complete"} onClick={() => advance(campaign)}>{nextLabel}</button></footer></article>;
    })}</section>
    {creating && <div className="modal-backdrop" onMouseDown={() => setCreating(false)}><form className="modal compact" onSubmit={addCampaign} onMouseDown={(event) => event.stopPropagation()}><div className="modal-head"><div><span>内容活动</span><h2>创建活动空间</h2></div><button type="button" onClick={() => setCreating(false)}>×</button></div><label>活动名称<input name="name" required placeholder="例如：智慧城市行业峰会传播"/></label><label>关联方案<select name="solution">{workspace.solutions.map((item) => <option key={item.solution_id} value={item.solution_id}>{item.solution_name}</option>)}</select></label><label>营销目标<select name="objective">{MARKETING_OBJECTIVES.map((item) => <option key={item}>{item}</option>)}</select></label><div className="checkbox-group"><span>输出渠道（至少选择一项）</span>{CHANNELS.map((item) => <label key={item}><input type="checkbox" name="channels" value={item}/>{item}</label>)}</div><div className="field-pair"><label>负责人<input name="owner" required defaultValue="解决方案营销组"/></label><label>截止日期<input name="due" type="date" required/></label></div><div className="modal-actions"><button type="button" className="ghost" onClick={() => setCreating(false)}>取消</button><button className="primary">创建活动</button></div></form></div>}
  </>;
}

function Studio({ workspace, update, go }: { workspace: Workspace; update: (fn: (value: Workspace) => Workspace, message: string) => void; go: (page: Page) => void }) {
  const [campaignId, setCampaignId] = useState(workspace.campaigns[0]?.campaign_id ?? ""); const campaign = workspace.campaigns.find((item) => item.campaign_id === campaignId) ?? workspace.campaigns[0];
  const [solutionId, setSolutionId] = useState(campaign?.solution_id ?? workspace.solutions[0]?.solution_id ?? ""); const [stakeholderId, setStakeholderId] = useState(workspace.stakeholders[0]?.stakeholder_id ?? ""); const [objective, setObjective] = useState(MARKETING_OBJECTIVES[0] as string); const [contentType, setContentType] = useState(CONTENT_TYPES[0] as string); const [channel, setChannel] = useState(CHANNELS[0] as string); const [busy, setBusy] = useState(false);
  const solution = workspace.solutions.find((item) => item.solution_id === solutionId); const stakeholder = workspace.stakeholders.find((item) => item.stakeholder_id === stakeholderId); const [strategy, setStrategy] = useState<MessagingStrategy | null>(() => solution && stakeholder ? createStrategy(solution, stakeholder, objective, contentType) : null); const preview = solution && stakeholder && strategy ? generateDemoCopy(solution, stakeholder, strategy, workspace.brand, channel) : null;
  useEffect(() => { const next = solution && stakeholder ? createStrategy(solution, stakeholder, objective, contentType) : null; queueMicrotask(() => setStrategy(next)); }, [solution, stakeholder, objective, contentType]);
  function edit(field: keyof MessagingStrategy, value: string) { setStrategy((current) => current ? { ...current, [field]: value } : current); }
  async function generate() { if (!solution || !stakeholder || !strategy || !campaign) return; setBusy(true); const started = performance.now(); let result = generateDemoCopy(solution, stakeholder, strategy, workspace.brand, channel); let mode: "demo" | "api" = "demo"; try { const response = await fetch("/api/generate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ solution, stakeholder, strategy, brand: workspace.brand, campaign, channel, requestedMode: workspace.settings.generation_mode }) }); if (response.ok) { const payload = await response.json() as { title: string; content: string; mode: "demo" | "api" }; result = payload; mode = payload.mode; } } catch { /* deterministic fallback */ } const now = new Date().toISOString(); const scores = scoreContent(result.content, workspace.brand); const needsReview = workspace.settings.default_review_required; const asset: ContentAsset = { draft_id: `AST-${Date.now()}`, campaign_id: campaign.campaign_id, solution_id: solution.solution_id, stakeholder_id: stakeholder.stakeholder_id, content_type: contentType, marketing_objective: objective, title: result.title, content: result.content, generated_at: now, generation_seconds: Number(Math.max((performance.now() - started) / 1000, .1).toFixed(1)), generation_mode: mode, review_status: needsReview ? "in_review" : "draft", approved_first_pass: null, edit_count: 0, review_time_minutes: 0, finalised_at: null, reuse_count: 0, reuse_context: [], version: 1, channel, ...scores }; update((value) => ({ ...value, strategies: [strategy, ...value.strategies], assets: [asset, ...value.assets], reviews: [{ review_id: `REV-${Date.now()}`, draft_id: asset.draft_id, action: "submitted", occurred_at: now, duration_minutes: 0, note: needsReview ? "AI 初稿已提交人工审核。" : "AI 初稿已保存为草稿。" }, ...value.reviews] }), `${mode === "api" ? "API" : "演示"}初稿已生成并${needsReview ? "进入审核" : "保存为草稿"}。`); setBusy(false); go(needsReview ? "review" : "assets"); }
  return <><Header eyebrow="AI Content Studio" title="AI 创作工作台" description="选择业务上下文，校准信息策略，生成符合品牌与事实边界的内容。"/><section className="studio-shell"><aside className="studio-steps"><span className="active"><b>1</b><i/><div><strong>定义内容任务</strong><small>活动、受众与渠道</small></div></span><span><b>2</b><i/><div><strong>校准信息策略</strong><small>价值、证据与语气</small></div></span><span><b>3</b><div><strong>生成并送审</strong><small>质量检查与人工审核</small></div></span><div className="brand-applied"><i>✓</i><div><strong>{workspace.brand.brand_name} 品牌规则</strong><small>{workspace.brand.voice_traits.slice(0, 2).join(" · ")}</small></div></div></aside><div className="studio-form"><section className="surface"><div className="step-title"><b>01</b><div><h2>定义内容任务</h2><p>AI 将仅使用选定上下文生成内容。</p></div></div><div className="form-grid"><label className="wide">所属活动<select value={campaignId} onChange={(event) => { const id = event.target.value; setCampaignId(id); const next = workspace.campaigns.find((item) => item.campaign_id === id); if (next) setSolutionId(next.solution_id); }}>{workspace.campaigns.map((item) => <option key={item.campaign_id} value={item.campaign_id}>{item.campaign_name}</option>)}</select></label><label>解决方案<select value={solutionId} onChange={(event) => setSolutionId(event.target.value)}>{workspace.solutions.map((item) => <option key={item.solution_id} value={item.solution_id}>{item.solution_name}</option>)}</select></label><label>目标受众<select value={stakeholderId} onChange={(event) => setStakeholderId(event.target.value)}>{workspace.stakeholders.map((item) => <option key={item.stakeholder_id} value={item.stakeholder_id}>{item.name}</option>)}</select></label><label>营销目标<select value={objective} onChange={(event) => setObjective(event.target.value)}>{MARKETING_OBJECTIVES.map((item) => <option key={item}>{item}</option>)}</select></label><label>内容类型<select value={contentType} onChange={(event) => setContentType(event.target.value)}>{CONTENT_TYPES.map((item) => <option key={item}>{item}</option>)}</select></label><label className="wide">发布渠道<select value={channel} onChange={(event) => setChannel(event.target.value)}>{CHANNELS.map((item) => <option key={item}>{item}</option>)}</select></label></div></section><section className="surface"><div className="step-title"><b>02</b><div><h2>校准信息策略</h2><p>生成前可以调整全部关键信息。</p></div><span>可编辑</span></div>{strategy && <div className="strategy-grid"><label>核心价值主张<textarea value={strategy.core_value_proposition} onChange={(event) => edit("core_value_proposition", event.target.value)}/></label><label>关键信息<textarea value={strategy.key_messages.join("\n")} onChange={(event) => setStrategy({ ...strategy, key_messages: event.target.value.split("\n").filter(Boolean) })}/></label><label>支持依据<textarea value={strategy.supporting_proof_points.join("\n")} onChange={(event) => setStrategy({ ...strategy, supporting_proof_points: event.target.value.split("\n").filter(Boolean) })}/></label><div className="field-pair"><label>品牌语气<input value={strategy.recommended_tone} onChange={(event) => edit("recommended_tone", event.target.value)}/></label><label>行动引导<input value={strategy.cta} onChange={(event) => edit("cta", event.target.value)}/></label></div></div>}</section></div><aside className="preview-panel"><div className="preview-head"><span>内容预览</span><b>{channel}</b></div>{preview ? <><span className="preview-type">{contentType}</span><h2>{preview.title}</h2><div className="preview-copy">{preview.content.split("\n").filter(Boolean).slice(0, 4).map((line) => <p key={line}>{line}</p>)}</div><div className="quality-checks"><div><span>品牌一致性</span><b>通过</b></div><Progress value={94} tone="teal"/><div><span>事实依据完整度</span><b>92</b></div><Progress value={92}/></div><div className="guardrail"><i>✓</i><span>已应用品牌术语、禁用词和事实声明规则</span></div></> : <div className="empty-state">请选择完整的内容上下文</div>}<button className="generate-button" disabled={busy || !strategy} onClick={generate}><span>✦</span><div><strong>{busy ? "正在生成并检查…" : "生成内容并送审"}</strong><small>{workspace.settings.generation_mode === "demo" ? "演示模式 · 无需 API 密钥" : "API 模式 · 自动安全回退"}</small></div><b>→</b></button></aside></section></>;
}

function Review({ workspace, update }: { workspace: Workspace; update: (fn: (value: Workspace) => Workspace, message: string) => void }) {
  const queue = useMemo(() => workspace.assets.filter((item) => item.review_status === "in_review" || item.review_status === "rejected"), [workspace.assets]); const [selected, setSelected] = useState(queue[0]?.draft_id ?? ""); const asset = workspace.assets.find((item) => item.draft_id === selected) ?? queue[0]; const [title, setTitle] = useState(asset?.title ?? ""); const [content, setContent] = useState(asset?.content ?? ""); const [note, setNote] = useState("");
  useEffect(() => { const next = workspace.assets.find((item) => item.draft_id === selected) ?? queue[0]; queueMicrotask(() => { setTitle(next?.title ?? ""); setContent(next?.content ?? ""); setNote(""); }); }, [selected, workspace.assets, queue]);
  if (!asset) return <><Header eyebrow="Human-in-the-loop" title="审核中心" description="所有对外内容在发布前都经过人工判断。"/><div className="empty-state large">当前没有待审核内容</div></>;
  const solution = workspace.solutions.find((item) => item.solution_id === asset.solution_id); const stakeholder = workspace.stakeholders.find((item) => item.stakeholder_id === asset.stakeholder_id); const scores = scoreContent(content, workspace.brand);
  function decide(decision: "approved" | "rejected" | "finalised") { if (decision === "rejected" && !note.trim()) return; update((value) => applyReviewDecision(value, asset.draft_id, decision, new Date().toISOString(), note), decision === "approved" ? "内容已批准。" : decision === "rejected" ? "内容已退回修改。" : "内容已定稿。"); const next = queue.find((item) => item.draft_id !== asset.draft_id); if (next) setSelected(next.draft_id); }
  function save() { update((value) => applyContentEdit(value, asset.draft_id, title, content), "修改已保存并重新进入审核。"); }
  return <><Header eyebrow="Human-in-the-loop" title="审核中心" description="集中完成内容校对、品牌检查、事实核验与批准。" action={<span className="queue-pill">{queue.length} 条待处理</span>}/><section className="review-shell"><aside className="review-queue"><div className="queue-head"><span>审核队列</span><b>{queue.length}</b></div>{queue.map((item) => <button key={item.draft_id} className={asset.draft_id === item.draft_id ? "active" : ""} onClick={() => setSelected(item.draft_id)}><span className="doc-icon">文</span><div><strong>{item.title}</strong><small>{item.channel} · {STATUS_LABELS[item.review_status]}</small></div><b>{item.quality_score}</b></button>)}</aside><article className="review-editor"><div className="editor-toolbar"><div><span className={`status ${asset.review_status}`}>{STATUS_LABELS[asset.review_status]}</span><small>{solution?.solution_name} · {stakeholder?.name} · V{asset.version}</small></div><div><button className="ghost" onClick={save}>保存修改</button><button className="danger" disabled={!note.trim()} title={!note.trim() ? "退回前请填写审核意见" : undefined} onClick={() => decide("rejected")}>退回</button><button className="primary" onClick={() => decide("approved")}>批准内容</button></div></div><label className="title-input"><span>标题</span><input value={title} onChange={(event) => setTitle(event.target.value)}/></label><label className="content-editor"><span>正文</span><textarea value={content} onChange={(event) => setContent(event.target.value)}/></label></article><aside className="review-inspector"><div className="inspector-head"><span>质量与治理</span><b>{Math.round((scores.quality_score + scores.compliance_score) / 2)}</b></div><div className="score-card"><div><span>内容质量</span><b>{scores.quality_score}</b></div><Progress value={scores.quality_score}/><small>结构、完整度与可读性</small></div><div className="score-card"><div><span>合规检查</span><b>{scores.compliance_score}</b></div><Progress value={scores.compliance_score} tone="teal"/><small>禁用词、事实声明与证据边界</small></div><label className="review-note"><span>审核意见</span><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="批准时可选；退回时必须说明修改要求。"/></label><div className="check-list"><span>自动检查</span><p><i>✓</i> 未发现品牌禁用词</p><p><i>✓</i> 包含事实边界说明</p><p><i>✓</i> 已关联可信方案来源</p><p><i>✓</i> 行动引导与受众匹配</p></div><div className="evidence-box"><span>引用依据</span>{workspace.strategies.find((item) => item.solution_id === asset.solution_id && item.stakeholder_id === asset.stakeholder_id)?.supporting_proof_points.slice(0, 3).map((item) => <p key={item}>◇ {item}</p>)}</div></aside></section></>;
}

function Assets({ workspace, update }: { workspace: Workspace; update: (fn: (value: Workspace) => Workspace, message: string) => void }) {
  const [query, setQuery] = useState(""); const [status, setStatus] = useState("all"); const [channel, setChannel] = useState("all"); const [reuseId, setReuseId] = useState<string | null>(null); const [reuseContext, setReuseContext] = useState(REUSE_CONTEXTS[0] as string);
  const assets = workspace.assets.filter((item) => (status === "all" || item.review_status === status) && (channel === "all" || item.channel === channel) && `${item.title}${item.content_type}`.toLowerCase().includes(query.toLowerCase())).slice(0, 60);
  function confirmReuse() { if (!reuseId) return; update((value) => applyReuse(value, reuseId, reuseContext), `内容已复用于“${reuseContext}”。`); setReuseId(null); }
  return <><Header eyebrow="Digital Asset Library" title="内容资产库" description="检索、筛选和复用经过治理的企业内容资产。" action={<button className="primary" onClick={() => download("content_assets.csv", exportFiles(workspace)["content_assets.csv"])}>导出资产</button>}/><div className="filter-bar"><label className="search-box grow"><span>⌕</span><input placeholder="搜索标题或内容类型" value={query} onChange={(event) => setQuery(event.target.value)}/></label><select aria-label="状态筛选" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">全部状态</option>{Object.entries(STATUS_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select><select aria-label="渠道筛选" value={channel} onChange={(event) => setChannel(event.target.value)}><option value="all">全部渠道</option>{CHANNELS.map((item) => <option key={item}>{item}</option>)}</select><span>{assets.length} 条结果</span></div><div className="asset-table"><table><thead><tr><th>内容资产</th><th>活动 / 方案</th><th>渠道</th><th>状态</th><th>质量</th><th>复用</th><th>更新</th><th>操作</th></tr></thead><tbody>{assets.map((asset) => { const campaign = workspace.campaigns.find((item) => item.campaign_id === asset.campaign_id); const solution = workspace.solutions.find((item) => item.solution_id === asset.solution_id); const reusable = ["approved", "final"].includes(asset.review_status); return <tr key={asset.draft_id}><td><strong>{asset.title}</strong><small>{asset.content_type} · V{asset.version}</small></td><td><span>{campaign?.campaign_name}</span><small>{solution?.solution_name}</small></td><td><span className="channel-tag">{asset.channel}</span></td><td><span className={`status ${asset.review_status}`}>{STATUS_LABELS[asset.review_status]}</span></td><td><b className={asset.quality_score >= 85 ? "score-good" : "score-warn"}>{asset.quality_score}</b></td><td>{asset.reuse_count}<small>{asset.reuse_context.slice(-1)[0]}</small></td><td>{formatDate(asset.generated_at)}</td><td><button className="row-action" disabled={!reusable} onClick={() => setReuseId(asset.draft_id)}>复用</button></td></tr>; })}</tbody></table></div>{reuseId && <div className="modal-backdrop" onMouseDown={() => setReuseId(null)}><div className="modal compact" onMouseDown={(event) => event.stopPropagation()}><div className="modal-head"><div><span>资产复用</span><h2>登记新的使用场景</h2></div><button onClick={() => setReuseId(null)}>×</button></div><label>复用场景<select value={reuseContext} onChange={(event) => setReuseContext(event.target.value)}>{REUSE_CONTEXTS.map((item) => <option key={item}>{item}</option>)}</select></label><p className="muted-copy">系统会保留复用次数、场景和审计记录，原始内容不会被改写。</p><div className="modal-actions"><button className="ghost" onClick={() => setReuseId(null)}>取消</button><button className="primary" onClick={confirmReuse}>确认复用</button></div></div></div>}</>;
}

function Insights({ workspace, analytics }: { workspace: Workspace; analytics: Analytics }) {
  const types = groupCount(workspace.assets, (item) => item.content_type); const channels = groupCount(workspace.assets, (item) => item.channel); const max = Math.max(...types.map((item) => item.value), 1);
  return <><Header eyebrow="Operational Intelligence" title="数据洞察" description="从内容产能、质量、审核与复用记录中识别运营改进机会。" action={<button className="primary" onClick={() => download("analytics_summary.csv", exportFiles(workspace)["analytics_summary.csv"])}>导出分析</button>}/><div className="insight-banner"><div><span>本期运营健康度</span><strong>优秀</strong></div><p>内容质量稳定，合规通过率保持高位；建议优先处理审核队列并扩大高质量资产复用。</p><b>{Math.round((analytics.average_quality_score + analytics.compliance_pass_rate) / 2)}</b></div><section className="metrics four"><Metric label="平均内容质量" value={analytics.average_quality_score} note="全量资产质量评分"/><Metric label="合规通过率" value={percent(analytics.compliance_pass_rate)} note="合规分 ≥ 90" tone="teal"/><Metric label="平均审核耗时" value={`${analytics.average_review_time_minutes} 分钟`} note="从生成到审核完成" tone="amber"/><Metric label="平均节时率" value={percent(analytics.time_reduction_rate)} note="包含生成、审核与编辑" tone="violet"/></section><section className="insights-grid"><article className="surface"><div className="section-head"><div><span>内容组合</span><h2>按内容类型分布</h2></div></div><div className="bar-list">{types.map((item) => <div key={item.label}><div><span>{item.label}</span><b>{item.value}</b></div><Progress value={item.value / max * 100}/></div>)}</div></article><article className="surface"><div className="section-head"><div><span>渠道覆盖</span><h2>跨渠道资产分布</h2></div></div><div className="donut-layout"><div className="donut" style={{ "--value": `${Math.round(channels[0]?.value / workspace.assets.length * 100)}%` } as React.CSSProperties}><strong>{channels.length}</strong><span>覆盖渠道</span></div><div className="legend-list">{channels.map((item, index) => <div key={item.label}><span><i className={`dot d${index}`}/>{item.label}</span><b>{item.value}</b></div>)}</div></div></article><article className="surface span-two"><div className="section-head"><div><span>效率评测</span><h2>人工与 EchoFlow 完整工作流对比</h2></div></div><div className="efficiency-compare"><div><span>传统人工适配</span><b>{analytics.manual_adaptation_time} 分钟</b><Progress value={100} tone="muted"/></div><div><span>EchoFlow 辅助工作流</span><b>{analytics.ai_adaptation_time} 分钟</b><Progress value={analytics.ai_adaptation_time / analytics.manual_adaptation_time * 100}/></div><aside><strong>{percent(analytics.time_reduction_rate)}</strong><span>平均时间节省</span><small>数据来自 {workspace.benchmarks.length} 条完整流程评测记录</small></aside></div></article></section></>;
}

function Governance({ workspace, update, persistence }: { workspace: Workspace; update: (fn: (value: Workspace) => Workspace, message: string) => void; persistence: string }) {
  const [brand, setBrand] = useState<BrandProfile>(workspace.brand);
  function save() { update((value) => ({ ...value, brand: { ...brand, updated_at: new Date().toISOString() } }), "品牌与治理规则已更新。"); }
  function exportAll() { const files = exportFiles(workspace); Object.entries(files).forEach(([name, body], index) => setTimeout(() => download(name, body), index * 120)); download("echoflow_workspace.json", JSON.stringify(workspace, null, 2), "application/json"); }
  return <><Header eyebrow="Brand & Governance" title="品牌与治理" description="让每一次生成都遵循统一的品牌语气、术语和事实边界。" action={<button className="primary" onClick={save}>保存规则</button>}/><section className="governance-grid"><article className="surface span-two"><div className="section-head"><div><span>品牌档案</span><h2>全局品牌表达</h2></div><span className="saved-state">✓ 已应用</span></div><div className="form-grid"><label>品牌名称<input value={brand.brand_name} onChange={(event) => setBrand({ ...brand, brand_name: event.target.value })}/></label><label>品牌定位<input value={brand.positioning} onChange={(event) => setBrand({ ...brand, positioning: event.target.value })}/></label><label className="wide">品牌语气（每行一项）<textarea value={brand.voice_traits.join("\n")} onChange={(event) => setBrand({ ...brand, voice_traits: event.target.value.split("\n").filter(Boolean) })}/></label></div><div className="rule-columns"><label><span>推荐术语</span><textarea value={brand.preferred_terms.join("\n")} onChange={(event) => setBrand({ ...brand, preferred_terms: event.target.value.split("\n").filter(Boolean) })}/></label><label><span>禁用表达</span><textarea value={brand.blocked_terms.join("\n")} onChange={(event) => setBrand({ ...brand, blocked_terms: event.target.value.split("\n").filter(Boolean) })}/></label></div><label className="full-label">必要声明<textarea value={brand.required_disclaimer} onChange={(event) => setBrand({ ...brand, required_disclaimer: event.target.value })}/></label></article><article className="surface"><div className="section-head"><div><span>AI 生成</span><h2>模型与审核策略</h2></div></div><label className="radio-card"><input type="radio" checked={workspace.settings.generation_mode === "demo"} onChange={() => update((value) => ({ ...value, settings: { ...value.settings, generation_mode: "demo" } }), "已启用演示模式。")}/><span><strong>演示模式</strong><small>确定性生成，无需密钥，适合本地演示。</small></span></label><label className="radio-card"><input type="radio" checked={workspace.settings.generation_mode === "api"} onChange={() => update((value) => ({ ...value, settings: { ...value.settings, generation_mode: "api" } }), "已选择 API 模式。")}/><span><strong>API 模式</strong><small>使用服务端密钥，不可用时自动安全回退。</small></span></label><label className="switch-row"><span><strong>默认强制人工审核</strong><small>所有 AI 内容生成后进入审核队列</small></span><input type="checkbox" checked={workspace.settings.default_review_required} onChange={(event) => update((value) => ({ ...value, settings: { ...value.settings, default_review_required: event.target.checked } }), "审核策略已更新。")}/></label><div className="connection-row"><span><i className={persistence.includes("云端") ? "ok" : ""}/><strong>工作区持久化</strong></span><small>{persistence}</small></div></article><article className="surface"><div className="section-head"><div><span>数据治理</span><h2>导出与恢复</h2></div></div><p className="muted-copy">下载活动、品牌、方案、内容、审核和分析记录，用于内部留档或进一步分析。</p><button className="primary full" onClick={exportAll}>导出完整证据包</button><div className="export-list">{Object.keys(exportFiles(workspace)).slice(0, 5).map((name) => <span key={name}><i>CSV</i>{name}</span>)}</div><div className="boundary-note"><strong>演示数据边界</strong><p>当前方案、内容和评测记录均为虚构演示数据，不包含真实客户、政府合作或生产数据。</p></div></article></section></>;
}

export default function Home() {
  const [page, setPage] = useState<Page>("overview");
  const [workspace, setWorkspace] = useState<Workspace>(() => buildDemoWorkspace());
  const [toast, setToast] = useState("");
  const [persistence, setPersistence] = useState("正在连接工作区…");
  const [conflict, setConflict] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState("");
  const [popover, setPopover] = useState<"help" | "notifications" | null>(null);
  const revisionRef = useRef<string | null>(null);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const analytics = useMemo(() => calculateAnalytics(workspace), [workspace]);
  const searchResults = useMemo(() => {
    const query = globalQuery.trim().toLowerCase();
    if (!query) return [];
    return [
      ...workspace.campaigns.map((item) => ({ id: item.campaign_id, title: item.campaign_name, meta: `活动 · ${CAMPAIGN_LABELS[item.status]}`, page: "campaigns" as Page })),
      ...workspace.solutions.map((item) => ({ id: item.solution_id, title: item.solution_name, meta: `方案 · ${item.solution_category}`, page: "knowledge" as Page })),
      ...workspace.assets.map((item) => ({ id: item.draft_id, title: item.title, meta: `内容 · ${item.channel} · ${STATUS_LABELS[item.review_status]}`, page: "assets" as Page })),
    ].filter((item) => `${item.title}${item.meta}`.toLowerCase().includes(query)).slice(0, 12);
  }, [globalQuery, workspace]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/state?key=solution-marketing-workspace").then(async (response) => {
      if (!response.ok) throw new Error();
      const payload = await response.json() as { value: unknown; updatedAt: string | null };
      const loaded = normaliseWorkspace(payload.value);
      if (!cancelled && loaded) setWorkspace(loaded);
      if (!cancelled) { revisionRef.current = payload.updatedAt; setPersistence("云端工作区已连接"); }
    }).catch(() => { if (!cancelled) setPersistence("本地演示会话 · 未绑定云端数据库"); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    function shortcut(event: KeyboardEvent) { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setSearchOpen(true); } if (event.key === "Escape") { setSearchOpen(false); setPopover(null); } }
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);

  function notify(message: string) { setToast(message); window.setTimeout(() => setToast(""), 2800); }
  function persist(next: Workspace) {
    setPersistence("正在同步变更…");
    saveQueueRef.current = saveQueueRef.current.catch(() => undefined).then(async () => {
      const response = await fetch("/api/state", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ key: "solution-marketing-workspace", value: next, expectedUpdatedAt: revisionRef.current }) });
      const payload = await response.json() as { updatedAt?: string; error?: string };
      if (response.status === 409) { setConflict(true); setPersistence("存在其他会话的更新"); return; }
      if (!response.ok) throw new Error(payload.error || "同步失败");
      revisionRef.current = payload.updatedAt ?? null;
      setConflict(false);
      setPersistence("云端工作区已同步");
    }).catch(() => setPersistence("本地变更尚未同步云端"));
  }
  function update(fn: (value: Workspace) => Workspace, message: string) { setWorkspace((current) => { const next = fn(current); persist(next); return next; }); notify(message); }
  async function reloadWorkspace() {
    setPersistence("正在重新加载…");
    try { const response = await fetch("/api/state?key=solution-marketing-workspace"); const payload = await response.json() as { value: unknown; updatedAt: string | null }; const loaded = normaliseWorkspace(payload.value); if (loaded) setWorkspace(loaded); revisionRef.current = payload.updatedAt; setConflict(false); setPersistence("已加载最新云端版本"); }
    catch { setPersistence("重新加载失败，请稍后重试"); }
  }
  function navigate(target: Page) { setPage(target); setSearchOpen(false); setPopover(null); }

  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><div className="brand-mark">E</div><div><strong>EchoFlow</strong><span>可信内容运营平台</span></div></div><div className="workspace-switch"><span>当前工作区</span><button aria-label="当前工作区：数字郑州"><i>DZ</i><div><strong>数字郑州</strong><small>解决方案营销组</small></div><b>单工作区</b></button></div><nav aria-label="主导航">{NAV.map((item) => <button key={item.page} className={page === item.page ? "active" : ""} onClick={() => navigate(item.page)}><i>{item.icon}</i><span>{item.label}</span>{item.page === "review" && analytics.pending_review_count > 0 && <b>{analytics.pending_review_count}</b>}</button>)}</nav><div className="sidebar-bottom"><div className="governance-mini"><div><i>✓</i><span><strong>品牌治理已启用</strong><small>{percent(analytics.compliance_pass_rate)} 内容通过检查</small></span></div><Progress value={analytics.compliance_pass_rate} tone="teal"/></div><button className="user-card" onClick={() => navigate("governance")}><span>郑</span><div><strong>内容运营员</strong><small>营销技术项目</small></div><b>设置</b></button></div></aside>
    <main><div className="topbar"><div className="breadcrumbs"><span>数字郑州</span><b>/</b><strong>{NAV.find((item) => item.page === page)?.label}</strong></div><div className="top-actions"><button aria-label="全局搜索" title="全局搜索 Ctrl/⌘ K" onClick={() => setSearchOpen(true)}>⌕</button><button aria-label="帮助" onClick={() => setPopover(popover === "help" ? null : "help")}>?</button><button aria-label="通知" className="notification" onClick={() => setPopover(popover === "notifications" ? null : "notifications")}>♢{analytics.pending_review_count > 0 && <i/>}</button><span className="sync-state"><i className={persistence.includes("同步") || persistence.includes("连接") || persistence.includes("加载最新") ? "ok" : ""}/>{persistence}</span>{popover === "help" && <div className="top-popover"><strong>快速开始</strong><p>从活动中心创建内容计划，在 AI 创作中生成初稿，再进入审核中心完成批准。</p><small>快捷键：Ctrl / ⌘ + K 全局搜索</small></div>}{popover === "notifications" && <div className="top-popover notifications-panel"><strong>最近通知</strong>{workspace.reviews.slice(0, 4).map((event) => <button key={event.review_id} onClick={() => navigate("review")}><span>{event.note}</span><small>{formatDate(event.occurred_at)}</small></button>)}</div>}</div></div>
      {conflict && <div className="conflict-banner"><span><b>检测到其他会话已更新此工作区。</b> 为避免覆盖他人修改，请加载最新版本。</span><button onClick={reloadWorkspace}>加载最新版本</button></div>}
      <div className="page-content">{page === "overview" && <Overview workspace={workspace} analytics={analytics} go={navigate}/>} {page === "knowledge" && <Knowledge workspace={workspace} update={update}/>} {page === "campaigns" && <Campaigns workspace={workspace} update={update} go={navigate}/>} {page === "studio" && <Studio workspace={workspace} update={update} go={navigate}/>} {page === "review" && <Review workspace={workspace} update={update}/>} {page === "assets" && <Assets workspace={workspace} update={update}/>} {page === "insights" && <Insights workspace={workspace} analytics={analytics}/>} {page === "governance" && <Governance workspace={workspace} update={update} persistence={persistence}/>}</div>
    </main>
    {searchOpen && <div className="modal-backdrop search-backdrop" onMouseDown={() => setSearchOpen(false)}><section className="global-search" onMouseDown={(event) => event.stopPropagation()}><div className="global-search-input"><span>⌕</span><input autoFocus aria-label="全局搜索" placeholder="搜索活动、方案或内容资产…" value={globalQuery} onChange={(event) => setGlobalQuery(event.target.value)}/><kbd>ESC</kbd></div><div className="global-results">{globalQuery && !searchResults.length && <div className="empty-state">没有找到匹配结果</div>}{searchResults.map((item) => <button key={`${item.page}-${item.id}`} onClick={() => navigate(item.page)}><span>{item.title.slice(0, 1)}</span><div><strong>{item.title}</strong><small>{item.meta}</small></div><b>↵</b></button>)}{!globalQuery && <div className="search-hint"><span>可搜索全部活动、方案知识和内容资产</span><small>输入关键词开始查找</small></div>}</div></section></div>}
    {toast && <div className="toast"><span>✓</span>{toast}</div>}
  </div>;
}
