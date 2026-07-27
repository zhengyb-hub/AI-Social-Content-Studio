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
      setIsGenerating(false);
      showToast("已生成 3 个平台的内容方案");
    }, 1200);
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
            <span className="eyebrow">内容工作台</span>
            <h1>早上好，Yubo <span aria-hidden="true">👋</span></h1>
          </div>
          <div className="top-actions">
            <span className="sync-status"><i /> 标签已同步 · 2分钟前</span>
            <button className="icon-button" aria-label="通知">●</button>
            <button className="primary-button" onClick={generateContent} disabled={isGenerating}>
              <SparkIcon /> {isGenerating ? "正在生成…" : "生成本周内容"}
            </button>
          </div>
        </header>

        <section className="hero-card">
          <div className="hero-copy">
            <span className="hero-kicker"><SparkIcon /> 标签驱动 · 自动生成 · 可控审核</span>
            <h2>把标签变成内容，<br />把内容变成增长。</h2>
            <p>系统已识别 4 个重点人群，预计可生成 12 条适配内容。</p>
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
            <div><strong>486</strong><span>已同步用户</span></div>
            <div><strong>4</strong><span>重点人群</span></div>
            <div><strong>{averageScore}</strong><span>平均质量分</span></div>
          </div>
        </section>

        <section className="workflow-strip" aria-label="自动化流程">
          {[
            ["01", "标签同步", "486条已就绪"],
            ["02", "策略匹配", "4个人群"],
            ["03", "内容生成", "3个平台"],
            ["04", "智能质检", "1条需复核"],
            ["05", "审核发布", `${approved}/3 已通过`],
          ].map(([step, title, detail], index) => (
            <div className="workflow-step" key={step}>
              <span className={`step-number ${index < 4 ? "done" : ""}`}>{index < 4 ? "✓" : step}</span>
              <span><strong>{title}</strong><small>{detail}</small></span>
              {index < 4 && <b aria-hidden="true">→</b>}
            </div>
          ))}
        </section>

        <div className="content-grid">
          <section className="panel strategy-panel">
            <div className="panel-heading">
              <div>
                <span className="section-label">输入与策略</span>
                <h3>本周自动化任务</h3>
              </div>
              <button className="ghost-button" onClick={() => showToast("自动化规则已启用")}>编辑规则</button>
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
              <em>已同步</em>
            </button>

            <div className="rule-block">
              <div className="rule-title">
                <span className="rule-icon purple" aria-hidden="true">◎</span>
                <span><strong>目标人群</strong><small>由标签规则自动聚类</small></span>
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
                <span><strong>营销目标</strong><small>促成首次咨询</small></span>
              </div>
              <span className="rule-value">领取试听资料</span>
            </div>

            <div className="rule-row">
              <div className="rule-title">
                <span className="rule-icon blue" aria-hidden="true">◫</span>
                <span><strong>发布平台</strong><small>按平台特性改写</small></span>
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
              <span><strong>{isGenerating ? "正在生成并质检…" : "智能生成内容"}</strong><small>预计生成 12 条 · 约 20 秒</small></span>
              <b aria-hidden="true">→</b>
            </button>
          </section>

          <section className="panel review-panel">
            <div className="panel-heading review-heading">
              <div>
                <span className="section-label">审核队列</span>
                <h3>待处理内容 <sup>{items.filter((item) => item.status === "待审核").length}</sup></h3>
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

      {toast && <div className="toast" role="status"><span>✓</span>{toast}</div>}
    </div>
  );
}
