"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";

type ContentItem = {
  id: number;
  platform: "小红书" | "朋友圈" | "公众号";
  platformKey: "red" | "green" | "blue";
  title: string;
  body: string;
  audience: string;
  quality: number;
  risk: "低风险" | "需复核";
  status: "待审核" | "已通过";
  version: number;
};

const initialItems: ContentItem[] = [
  {
    id: 1,
    platform: "小红书",
    platformKey: "red",
    title: "每天少加1小时班，我用AI重做了工作流",
    body: "刚入职时，我也曾被日报、会议纪要和重复表格困住。后来把最常见的3个任务交给AI，工作节奏终于不再失控……",
    audience: "效率敏感型职场新人",
    quality: 96,
    risk: "低风险",
    status: "待审核",
    version: 1,
  },
  {
    id: 2,
    platform: "朋友圈",
    platformKey: "green",
    title: "让工具替你加班，而不是让自己硬撑",
    body: "一套真正能落地的AI办公方法，从邮件、表格到汇报都能直接套用。本周开放试听资料，想提效的朋友可以来领取。",
    audience: "AI课程高意向新用户",
    quality: 93,
    risk: "低风险",
    status: "待审核",
    version: 1,
  },
  {
    id: 3,
    platform: "公众号",
    platformKey: "blue",
    title: "AI办公不是学工具，而是重构你的工作方式",
    body: "从一个真实的职场工作日出发，我们拆解邮件处理、资料分析和汇报输出三个高频场景，看看AI如何真正进入工作流。",
    audience: "成长驱动型职场人",
    quality: 88,
    risk: "需复核",
    status: "待审核",
    version: 1,
  },
];

const platformStyles = {
  red: { icon: "书", label: "小红书" },
  green: { icon: "圈", label: "朋友圈" },
  blue: { icon: "号", label: "公众号" },
};

function SparkIcon() {
  return <span className="spark" aria-hidden="true">✦</span>;
}

export default function Home() {
  const [items, setItems] = useState(initialItems);
  const [activeNav, setActiveNav] = useState("内容工作台");
  const [filter, setFilter] = useState<"全部" | "待审核" | "已通过">("全部");
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedRows, setUploadedRows] = useState(486);
  const [fileName, setFileName] = useState("用户标签_0727.csv");
  const [hasCustomData, setHasCustomData] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [toast, setToast] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const filteredItems = useMemo(
    () => items.filter((item) => filter === "全部" || item.status === filter),
    [items, filter],
  );

  const approved = items.filter((item) => item.status === "已通过").length;
  const averageScore = Math.round(
    items.reduce((total, item) => total + item.quality, 0) / items.length,
  );

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const lines = text.split(/\r?\n/).filter((line) => line.trim());
      const rowCount = Math.max(lines.length - 1, 0);
      setUploadedRows(rowCount);
      setFileName(file.name);
      setHasCustomData(true);
      showToast(`已读取 ${rowCount} 条标签记录`);
    };
    reader.readAsText(file);
  }

  function generateContent() {
    setIsGenerating(true);
    window.setTimeout(() => {
      setItems((current) =>
        current.map((item, index) => ({
          ...item,
          quality: Math.min(98, item.quality + (index % 2)),
          version: item.version + 1,
          status: "待审核",
        })),
      );
      setHasGenerated(true);
      setIsGenerating(false);
      showToast("已生成 3 个平台的内容方案");
    }, 1200);
  }

  function downloadTemplate() {
    const template = [
      ["user_id", "audience_tag", "interest", "lifecycle", "intent_level", "recommended_product"],
      ["U001", "职场新人", "AI与效率工具", "新用户", "高", "AI办公训练营"],
      ["U002", "小企业主", "获客增长", "活跃用户", "中", "营销自动化服务"],
    ];
    const csv = template.map((row) => row.join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "EchoFlow_用户标签模板.csv";
    link.click();
    URL.revokeObjectURL(url);
    showToast("标签模板已下载");
  }

  function approveItem(id: number) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "已通过" ? "待审核" : "已通过" }
          : item,
      ),
    );
  }

  function rewriteItem(id: number) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              version: item.version + 1,
              quality: Math.min(99, item.quality + 2),
              body: `${item.body.replace(/……$/, "")} 现在就从一个高频任务开始，让改变看得见。`,
              risk: "低风险",
            }
          : item,
      ),
    );
    showToast("已按品牌语气完成重写");
  }

  function approveAll() {
    setItems((current) => current.map((item) => ({ ...item, status: "已通过" })));
    showToast("全部内容已通过审核");
  }

  function exportCsv() {
    const header = ["平台", "目标人群", "标题", "正文", "质量分", "风险", "状态"];
    const rows = items.map((item) => [
      item.platform,
      item.audience,
      item.title,
      item.body,
      String(item.quality),
      item.risk,
      item.status,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "EchoFlow_内容审核结果.csv";
    link.click();
    URL.revokeObjectURL(url);
    showToast("审核结果已导出");
  }

  const navItems = ["内容工作台", "人群策略", "自动化", "品牌知识库", "效果洞察"];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><SparkIcon /></div>
          <div>
            <strong>EchoFlow</strong>
            <span>AI 内容运营台</span>
          </div>
        </div>

        <nav aria-label="主导航">
          <p className="nav-label">工作空间</p>
          {navItems.map((item, index) => (
            <button
              key={item}
              className={`nav-item ${activeNav === item ? "active" : ""}`}
              onClick={() => {
                setActiveNav(item);
                if (item !== "内容工作台") showToast(`${item}将在下一版本开放`);
              }}
            >
              <span className="nav-icon" aria-hidden="true">
                {["◫", "◎", "↯", "◇", "↗"][index]}
              </span>
              {item}
              {item === "内容工作台" && <span className="nav-count">12</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="plan-card">
            <span className="plan-badge">本月用量</span>
            <strong>2,460 / 5,000</strong>
            <div className="usage-track"><span /></div>
            <small>还可生成 2,540 条内容</small>
          </div>
          <button className="profile">
            <span className="avatar">YZ</span>
            <span><strong>Yubo Zheng</strong><small>管理员</small></span>
            <span aria-hidden="true">•••</span>
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <div className="title-line">
              <span className="eyebrow">内容工作台</span>
              <span className="demo-badge">功能演示版</span>
            </div>
            <h1>把用户标签变成社交媒体文案</h1>
          </div>
          <div className="top-actions">
            <span className="sync-status"><i /> 标签已同步 · 2分钟前</span>
            <button className="help-button" onClick={() => setShowGuide(true)}>？ 使用说明</button>
            <button className="primary-button" onClick={generateContent} disabled={isGenerating}>
              <SparkIcon /> {isGenerating ? "正在生成…" : "生成本周内容"}
            </button>
          </div>
        </header>

        <section className="hero-card guide-hero">
          <div className="hero-copy">
            <span className="hero-kicker"><SparkIcon /> 第一次使用？照着下面 3 步操作</span>
            <h2>上传标签 → 自动生成 → 审核导出</h2>
            <p>不用写提示词。准备一份用户标签表，系统会按人群和平台生成不同文案。</p>
            <div className="hero-buttons">
              <button className="hero-primary" onClick={() => fileRef.current?.click()}>
                {hasCustomData ? "更换标签文件" : "第 1 步：上传标签 CSV"} <span>→</span>
              </button>
              <button className="hero-secondary" onClick={downloadTemplate}>下载标签模板</button>
            </div>
          </div>
          <div className="hero-orbit" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="orbit-core"><SparkIcon /></div>
            <span className="float-tag tag-one">职场新人</span>
            <span className="float-tag tag-two">高意向</span>
            <span className="float-tag tag-three">效率工具</span>
          </div>
          <div className="hero-stats">
            <div><strong>{uploadedRows}</strong><span>{hasCustomData ? "你的用户记录" : "示例用户"}</span></div>
            <div><strong>4</strong><span>重点人群</span></div>
            <div><strong>{averageScore}</strong><span>平均质量分</span></div>
          </div>
        </section>

        <section className="workflow-strip clearer" aria-label="三步操作流程">
          {[
            ["1", "上传标签表", hasCustomData ? `${uploadedRows} 条已读取` : "可先使用示例数据", hasCustomData],
            ["2", "确认生成策略", "目标、平台与品牌语气", true],
            ["3", "生成并审核", hasGenerated ? "内容已生成" : "点击按钮自动生成", hasGenerated],
            ["4", "导出结果", approved > 0 ? `${approved} 条已通过` : "审核通过后导出", approved > 0],
          ].map(([step, title, detail, done], index) => (
            <div className={`workflow-step ${done ? "completed" : ""}`} key={String(step)}>
              <span className={`step-number ${done ? "done" : ""}`}>{done ? "✓" : step}</span>
              <span><strong>{title}</strong><small>{String(detail)}</small></span>
              {index < 3 && <b aria-hidden="true">→</b>}
            </div>
          ))}
        </section>

        <div className="content-grid">
          <section className="panel strategy-panel">
            <div className="panel-heading">
              <div>
                <span className="section-label">第 1～2 步</span>
                <h3>准备标签与生成规则</h3>
              </div>
              <button className="ghost-button" onClick={() => setShowGuide(true)}>看示例</button>
            </div>

            <div className="explain-box">
              <strong>你需要准备什么？</strong>
              <p>每行代表一个用户，至少包含“用户ID”和“人群标签”。兴趣、生命周期、意向等级越完整，文案越准确。</p>
              <div><code>user_id</code><code>audience_tag</code><code>interest</code><code>intent_level</code></div>
            </div>

            <button className="upload-card" onClick={() => fileRef.current?.click()}>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleUpload}
                tabIndex={-1}
                aria-label="上传用户标签 CSV"
              />
              <span className="upload-icon" aria-hidden="true">↑</span>
              <span>
                <strong>{fileName}</strong>
                <small>{uploadedRows} 条记录 · 点击替换 CSV</small>
              </span>
              <em>{hasCustomData ? "你的数据" : "示例数据"}</em>
            </button>

            <div className="rule-block">
              <div className="rule-title">
                <span className="rule-icon purple" aria-hidden="true">◎</span>
                <span><strong>系统会先把相似用户分组</strong><small>避免给每个用户机械地生成一条文案</small></span>
              </div>
              <div className="chips">
                <span>职场新人 <b>186</b></span>
                <span>AI课程高意向 <b>124</b></span>
                <span>成长驱动型 <b>96</b></span>
                <span>效率敏感型 <b>80</b></span>
              </div>
            </div>

            <div className="rule-row">
              <div className="rule-title">
                <span className="rule-icon amber" aria-hidden="true">↗</span>
                <span><strong>这批内容要实现什么目标？</strong><small>当前选择：促成首次咨询</small></span>
              </div>
              <span className="rule-value">领取试听资料</span>
            </div>

            <div className="rule-row">
              <div className="rule-title">
                <span className="rule-icon blue" aria-hidden="true">◫</span>
                <span><strong>准备发布到哪里？</strong><small>同一卖点会按平台特性改写</small></span>
              </div>
              <div className="platform-dots">
                <span className="red">书</span><span className="green">圈</span><span className="blue">号</span>
              </div>
            </div>

            <div className="guardrail">
              <span aria-hidden="true">✓</span>
              <div><strong>品牌与合规规则已启用</strong><small>已加载 24 条禁用词、8 条品牌语气规则</small></div>
            </div>

            <button className="generate-button" onClick={generateContent} disabled={isGenerating}>
              <SparkIcon />
              <span><strong>{isGenerating ? "正在生成并质检…" : "第 3 步：生成多平台文案"}</strong><small>当前演示会生成 3 条 · 接入模型后可批量生成</small></span>
              <b aria-hidden="true">→</b>
            </button>
          </section>

          <section className="panel review-panel">
            <div className="panel-heading review-heading">
              <div>
                <span className="section-label">第 4 步</span>
                <h3>检查并通过文案 <sup>{items.filter((item) => item.status === "待审核").length}</sup></h3>
                <p className="heading-help">检查标题、正文和风险提示；满意后点击“通过”，最后导出。</p>
              </div>
              <div className="review-actions">
                <button className="ghost-button" onClick={exportCsv}>导出</button>
                <button className="approve-all" onClick={approveAll}>全部通过</button>
              </div>
            </div>

            <div className="filter-row" role="group" aria-label="内容状态筛选">
              {(["全部", "待审核", "已通过"] as const).map((item) => (
                <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>
                  {item}
                </button>
              ))}
              <span />
              <button className="sort-button">质量分 ↓</button>
            </div>

            <div className="content-list">
              {filteredItems.map((item) => {
                const platform = platformStyles[item.platformKey];
                return (
                  <article className={`content-card ${item.status === "已通过" ? "approved" : ""}`} key={item.id}>
                    <div className={`platform-icon ${item.platformKey}`}>{platform.icon}</div>
                    <div className="content-body">
                      <div className="content-meta">
                        <span>{platform.label}</span>
                        <i>·</i>
                        <span>{item.audience}</span>
                        <span className="version">V{item.version}</span>
                      </div>
                      <h4>{item.title}</h4>
                      <p>{item.body}</p>
                      <div className="content-footer">
                        <span className={`score ${item.quality >= 92 ? "high" : ""}`}>
                          <i /> 质量分 {item.quality}
                        </span>
                        <span className={item.risk === "低风险" ? "safe" : "warning"}>
                          {item.risk === "低风险" ? "✓" : "!"} {item.risk}
                        </span>
                        <span className="char-count">{item.body.length}字</span>
                      </div>
                    </div>
                    <div className="card-actions">
                      <button className="rewrite" onClick={() => rewriteItem(item.id)} aria-label={`重写${item.platform}内容`}>↻</button>
                      <button className={`approve ${item.status === "已通过" ? "is-approved" : ""}`} onClick={() => approveItem(item.id)}>
                        {item.status === "已通过" ? "已通过" : "通过"}
                      </button>
                    </div>
                  </article>
                );
              })}
              {filteredItems.length === 0 && (
                <div className="empty-state"><SparkIcon /><strong>这里还没有内容</strong><span>切换筛选条件查看其他状态</span></div>
              )}
            </div>
          </section>
        </div>

        <footer className="footer-note">
          <span><i /> 自动化任务运行正常</span>
          <span>下一次标签同步：明天 09:00</span>
        </footer>
      </main>

      {showGuide && (
        <div className="guide-backdrop" role="presentation" onMouseDown={() => setShowGuide(false)}>
          <section
            className="guide-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="guide-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="guide-close" onClick={() => setShowGuide(false)} aria-label="关闭使用说明">×</button>
            <span className="guide-kicker"><SparkIcon /> 60 秒看懂 EchoFlow</span>
            <h2 id="guide-title">这个工具到底做什么？</h2>
            <p className="guide-lead">它把你的用户标签表，自动变成针对不同人群、适合不同平台的宣传文案。</p>

            <div className="example-flow">
              <div className="example-card input-example">
                <span>你提供的标签</span>
                <strong>职场新人</strong>
                <div><i>兴趣：AI效率</i><i>阶段：新用户</i><i>意向：高</i></div>
              </div>
              <span className="flow-arrow" aria-hidden="true">→</span>
              <div className="example-card strategy-example">
                <span>系统自动判断</span>
                <strong>推广 AI 办公课程</strong>
                <div><i>目标：领取试听</i><i>语气：专业轻松</i></div>
              </div>
              <span className="flow-arrow" aria-hidden="true">→</span>
              <div className="example-card output-example">
                <span>你得到的结果</span>
                <strong>3 个平台文案</strong>
                <div><i>小红书</i><i>朋友圈</i><i>公众号</i></div>
              </div>
            </div>

            <div className="guide-steps">
              <div><b>1</b><span><strong>上传 CSV 标签表</strong><small>不知道格式可下载模板</small></span></div>
              <div><b>2</b><span><strong>确认目标和平台</strong><small>系统已提供默认策略</small></span></div>
              <div><b>3</b><span><strong>生成、审核、导出</strong><small>逐条通过后导出 CSV</small></span></div>
            </div>

            <div className="demo-notice">
              <span>i</span>
              <p><strong>当前是功能演示版</strong>：页面使用示例数据和内置生成逻辑。接入大模型 API 后，才会根据你每次上传的标签真正生成新文案。</p>
            </div>

            <div className="guide-actions">
              <button className="guide-template" onClick={downloadTemplate}>先下载标签模板</button>
              <button className="guide-start" onClick={() => setShowGuide(false)}>用示例数据开始体验 →</button>
            </div>
          </section>
        </div>
      )}

      {toast && <div className="toast" role="status"><span>✓</span>{toast}</div>}
    </div>
  );
}
