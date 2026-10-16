"use client";

import { useState } from "react";
import type {
  BrandProfile,
  Campaign,
  ContentAsset,
  GenerationRun,
  Solution,
  Stakeholder,
} from "../lib/echoflow";

type PackageTab = "social" | "video" | "copy" | "case";

type Props = {
  asset: ContentAsset;
  brand: BrandProfile;
  campaign?: Campaign;
  generationRun?: GenerationRun;
  solution?: Solution;
  stakeholder?: Stakeholder;
  onClose: () => void;
};

const TAB_LABELS: Array<{ id: PackageTab; label: string }> = [
  { id: "social", label: "社交成品图" },
  { id: "video", label: "短视频脚本" },
  { id: "copy", label: "多渠道文案" },
  { id: "case", label: "案例链路" },
];

function saveBlob(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function safeName(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, "-").slice(0, 48);
}

function wrapCanvasText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const lines: string[] = [];
  let line = "";
  for (const character of Array.from(text)) {
    const next = line + character;
    if (line && context.measureText(next).width > maxWidth) {
      lines.push(line.trim());
      line = character;
    } else {
      line = next;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

function packageMarkdown({
  asset,
  brand,
  campaign,
  generationRun,
  solution,
  stakeholder,
}: Omit<Props, "onClose">) {
  const derivatives = asset.derivatives;
  const scenes = derivatives.video_script.scenes
    .map(
      (scene) =>
        `### ${scene.scene_id}. ${scene.phase}（${scene.duration_seconds}s）\n\n- 画面：${scene.visual}\n- 旁白：${scene.voiceover}\n- 屏幕文字：${scene.on_screen_text}`,
    )
    .join("\n\n");
  return `# ${asset.title}

## 内容上下文

- 品牌：${brand.brand_name}
- 活动：${campaign?.campaign_name ?? "未关联"}
- 解决方案：${solution?.solution_name ?? asset.solution_id}
- 目标受众：${stakeholder?.name ?? asset.stakeholder_id}
- 渠道：${asset.channel}
- 状态：${asset.review_status}
- 模型：${generationRun?.model ?? "历史生成器"}
- 提示词版本：${generationRun?.prompt_version ?? "未记录"}

## 长文案

${asset.content}

## 社交媒体短文案

${derivatives.short_copy}

${derivatives.hashtags.join(" ")}

## 社交成品图文字

- 主题：${derivatives.social_card.headline}
- 副标题：${derivatives.social_card.subheadline}
- 行动引导：${derivatives.social_card.cta}
- 画布：4:5（1200 × 1500）

## ${derivatives.video_script.title}

- 开场钩子：${derivatives.video_script.hook}
- 总时长：${derivatives.video_script.duration_seconds} 秒

${scenes}

## 来源依据

${asset.source_references.map((source) => `- ${source}`).join("\n")}
`;
}

export default function ContentPackageModal(props: Props) {
  const {
    asset,
    brand,
    campaign,
    generationRun,
    solution,
    stakeholder,
    onClose,
  } = props;
  const [tab, setTab] = useState<PackageTab>("social");
  const derivatives = asset.derivatives;
  const social = derivatives.social_card;

  async function downloadSocialCard() {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1500;
    const context = canvas.getContext("2d");
    if (!context) return;

    const palette = {
      indigo: { accent: "#7082ff", accent2: "#24c6ad" },
      teal: { accent: "#24c6ad", accent2: "#7082ff" },
      amber: { accent: "#f4b65f", accent2: "#24c6ad" },
    }[social.theme];
    const background = context.createLinearGradient(0, 0, 1200, 1500);
    background.addColorStop(0, "#081426");
    background.addColorStop(0.58, "#0b1a32");
    background.addColorStop(1, "#101f3d");
    context.fillStyle = background;
    context.fillRect(0, 0, 1200, 1500);

    context.strokeStyle = "rgba(115, 144, 210, 0.11)";
    context.lineWidth = 1;
    for (let x = 80; x < 1200; x += 80) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, 1500);
      context.stroke();
    }
    for (let y = 60; y < 1500; y += 80) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(1200, y);
      context.stroke();
    }

    context.lineWidth = 5;
    [0, 1, 2].forEach((index) => {
      context.strokeStyle = index === 1 ? palette.accent2 : palette.accent;
      context.globalAlpha = 0.5 - index * 0.1;
      context.beginPath();
      context.moveTo(-60, 1180 + index * 55);
      context.bezierCurveTo(260, 940, 500, 1420, 820, 1110 + index * 45);
      context.bezierCurveTo(1010, 930, 1090, 1020, 1280, 850 + index * 40);
      context.stroke();
    });
    context.globalAlpha = 1;

    context.fillStyle = palette.accent;
    context.fillRect(82, 92, 86, 8);
    context.font = "600 30px 'Microsoft YaHei', sans-serif";
    context.fillText(brand.brand_name, 82, 160);
    context.fillStyle = "#8fa1bd";
    context.font = "500 25px 'Microsoft YaHei', sans-serif";
    context.fillText(social.kicker, 82, 220);

    context.fillStyle = "#f6f8fc";
    context.font = "800 76px 'Microsoft YaHei', sans-serif";
    const headlineLines = wrapCanvasText(context, social.headline, 1000).slice(0, 5);
    headlineLines.forEach((line, index) => {
      context.fillText(line, 82, 390 + index * 105);
    });

    const subtitleY = 390 + headlineLines.length * 105 + 60;
    context.fillStyle = "#b9c4d8";
    context.font = "500 38px 'Microsoft YaHei', sans-serif";
    wrapCanvasText(context, social.subheadline, 920)
      .slice(0, 3)
      .forEach((line, index) => context.fillText(line, 82, subtitleY + index * 58));

    context.fillStyle = "rgba(255,255,255,0.08)";
    context.beginPath();
    context.roundRect(82, 1250, 1036, 134, 28);
    context.fill();
    context.fillStyle = palette.accent2;
    context.beginPath();
    context.arc(140, 1317, 18, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#f5f7fb";
    context.font = "700 34px 'Microsoft YaHei', sans-serif";
    context.fillText(social.cta, 186, 1330);
    context.fillStyle = "#71819d";
    context.font = "500 22px 'Microsoft YaHei', sans-serif";
    context.fillText("AI 生成 · 人工审核 · 来源可追溯", 82, 1440);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png", 0.96),
    );
    if (blob) saveBlob(`${safeName(asset.title)}-social-card.png`, blob);
  }

  function downloadMarkdown() {
    saveBlob(
      `${safeName(asset.title)}-content-package.md`,
      new Blob([packageMarkdown(props)], { type: "text/markdown;charset=utf-8" }),
    );
  }

  function downloadJson() {
    saveBlob(
      `${safeName(asset.title)}-content-package.json`,
      new Blob(
        [
          JSON.stringify(
            {
              asset,
              campaign,
              solution,
              stakeholder,
              generation_run: generationRun,
            },
            null,
            2,
          ),
        ],
        { type: "application/json;charset=utf-8" },
      ),
    );
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        className="modal content-package-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${asset.title} 内容包`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="package-header">
          <div>
            <span>AI 内容交付包</span>
            <h2>{asset.title}</h2>
            <p>
              长文案、社交图片、短视频分镜和来源证据由同一业务上下文生成。
            </p>
          </div>
          <button aria-label="关闭内容包" onClick={onClose}>×</button>
        </header>

        <nav className="package-tabs" aria-label="内容包视图">
          {TAB_LABELS.map((item) => (
            <button
              key={item.id}
              className={tab === item.id ? "active" : ""}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {tab === "social" && (
          <div className="package-social-layout">
            <div className={`social-artboard ${social.theme}`}>
              <div className="artboard-grid" />
              <div className="artboard-brand">
                <i />
                <strong>{brand.brand_name}</strong>
                <span>{social.kicker}</span>
              </div>
              <h3>{social.headline}</h3>
              <p>{social.subheadline}</p>
              <div className="artboard-flow"><i /><i /><i /></div>
              <div className="artboard-cta"><i />{social.cta}</div>
              <small>AI 生成 · 人工审核 · 来源可追溯</small>
            </div>
            <aside className="package-specs">
              <span>成品规格</span>
              <h3>社交媒体 4:5 竖版视觉</h3>
              <dl>
                <div><dt>尺寸</dt><dd>1200 × 1500 PNG</dd></div>
                <div><dt>受众</dt><dd>{stakeholder?.name ?? "目标受众"}</dd></div>
                <div><dt>渠道</dt><dd>{asset.channel}</dd></div>
                <div><dt>来源</dt><dd>{asset.source_references.length} 条已记录依据</dd></div>
              </dl>
              <p>图片在浏览器本地绘制，不会把内容发送给第三方服务。</p>
              <button className="primary full" onClick={downloadSocialCard}>
                下载 PNG 成品图
              </button>
            </aside>
          </div>
        )}

        {tab === "video" && (
          <div className="video-package">
            <div className="video-summary">
              <div><span>总时长</span><strong>{derivatives.video_script.duration_seconds}s</strong></div>
              <div><span>分镜</span><strong>{derivatives.video_script.scenes.length}</strong></div>
              <div><span>比例建议</span><strong>9:16</strong></div>
              <p>{derivatives.video_script.hook}</p>
            </div>
            <div className="storyboard">
              {derivatives.video_script.scenes.map((scene) => (
                <article key={scene.scene_id}>
                  <div className={`scene-frame ${scene.phase}`}>
                    <span>{String(scene.scene_id).padStart(2, "0")}</span>
                    <strong>{scene.on_screen_text}</strong>
                    <small>{scene.duration_seconds}s</small>
                  </div>
                  <div>
                    <span>{scene.phase}</span>
                    <h3>{scene.visual}</h3>
                    <p>{scene.voiceover}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {tab === "copy" && (
          <div className="copy-package">
            <article>
              <span>社交媒体短文案</span>
              <pre>{derivatives.short_copy}</pre>
              <p className="hashtag-row">{derivatives.hashtags.join(" ")}</p>
            </article>
            <article>
              <span>完整长文案</span>
              <pre>{asset.content}</pre>
            </article>
          </div>
        )}

        {tab === "case" && (
          <div className="case-chain">
            <div className="case-before">
              <span>输入</span>
              <h3>结构化业务上下文</h3>
              <p>{solution?.business_problem ?? "已记录的业务问题"}</p>
              <ul>
                <li>{solution?.key_capabilities[0] ?? "方案能力"}</li>
                <li>{stakeholder?.name ?? "目标受众"}</li>
                <li>{campaign?.objective ?? asset.marketing_objective}</li>
              </ul>
            </div>
            <i className="case-arrow">→</i>
            <div className="case-engine">
              <span>自动化</span>
              <h3>同源生成与改编</h3>
              <p>{generationRun?.model ?? "AI 生成器"}</p>
              <small>{generationRun?.prompt_version ?? "提示词版本未记录"}</small>
            </div>
            <i className="case-arrow">→</i>
            <div className="case-after">
              <span>输出</span>
              <h3>可审核内容资产</h3>
              <div><b>1</b><small>长文案</small></div>
              <div><b>1</b><small>社交图</small></div>
              <div><b>{derivatives.video_script.scenes.length}</b><small>视频分镜</small></div>
              <div><b>{asset.source_references.length}</b><small>来源依据</small></div>
            </div>
            <footer>
              <span>人工审核</span><i />
              <span>版本记录</span><i />
              <span>多渠道复用</span>
            </footer>
          </div>
        )}

        <footer className="package-actions">
          <span>内容包版本 V{asset.version} · {asset.review_status}</span>
          <div>
            <button className="ghost" onClick={downloadJson}>下载 JSON</button>
            <button className="primary" onClick={downloadMarkdown}>导出完整内容包</button>
          </div>
        </footer>
      </section>
    </div>
  );
}
