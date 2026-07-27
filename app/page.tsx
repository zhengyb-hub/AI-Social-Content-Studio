"use client";

import { ChangeEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";

type ContentItem = {
  id: number;
  platform: "小红书" | "朋友圈" | "公众号" | "抖音" | "视频号" | "微博";
  platformKey: "red" | "green" | "blue" | "black" | "teal" | "orange";
  title: string;
  body: string;
  audience: string;
  quality: number;
  risk: "低风险" | "需复核";
  status: "待审核" | "已通过";
  version: number;
};

type CopyDepth = "精简" | "标准" | "深度";

const copyLibrary: Record<ContentItem["platform"], Record<CopyDepth, { title: string; body: string }>> = {
  小红书: {
    精简: {
      title: "每天少加1小时班，我用AI重做了工作流",
      body: "不是工作太多，而是重复动作太多。我把会议纪要、日报整理和资料归纳交给AI后，每天稳定省下约1小时。先挑一个最耗时间的任务，固定输入模板，再人工复核结果，就能开始。想要我正在用的工作流清单，评论区留「效率」。\n\n#AI办公 #职场效率 #工作流",
    },
    标准: {
      title: "每天少加1小时班：我的AI工作流改造清单",
      body: "以前我每天最累的，不是做难题，而是在会议纪要、日报和资料整理之间来回切换。后来我没有继续收集更多AI工具，而是先重做了3个高频流程：\n\n① 会后把录音整理成「结论—负责人—截止时间」；\n② 下班前让AI按固定模板汇总日报；\n③ 阅读长资料时先提取事实、风险和待确认项。\n\n真正有用的不是“一键生成”，而是把输入标准化、把检查点留下来。现在这3件事每天能帮我省下约1小时。需要同款工作流模板，评论区留「效率」，我把清单发给你。\n\n#AI办公 #职场成长 #效率工具 #工作流",
    },
    深度: {
      title: "每天少加1小时班，我把这3个重复任务交给了AI",
      body: "刚入职时，我以为加班是因为自己不够熟练。后来才发现，真正吞掉时间的并不是难题，而是会议纪要、日报汇总和资料整理这些每天重复、又不能不做的小事。\n\n我没有一下子换掉所有工具，而是先改造了3个最稳定的场景：\n\n01｜会议结束后\n把录音和零散笔记交给AI，要求固定输出「核心结论、待办事项、负责人、截止时间」。我只需要核对事实，不再从头整理结构。\n\n02｜下班写日报时\n把当天的聊天记录和任务进度放进统一模板，让AI按「完成事项—结果数据—阻塞问题—明日计划」归纳，避免每天重新组织语言。\n\n03｜阅读长资料时\n先让AI提取关键事实、风险点和需要人工确认的内容，再回到原文复核。这样不是少看，而是带着问题看。\n\n这套方法最关键的地方只有两个：输入格式要固定，最终结果必须人工检查。坚持一周后，我每天大约能省下1小时，也不再被琐事拖到很晚。\n\n如果你也想从一个高频任务开始，我整理了一份可直接照着搭建的「AI办公工作流清单」。评论区留「效率」，我发给你。\n\n#AI办公 #职场效率 #工作流改造 #打工人成长 #效率工具",
    },
  },
  朋友圈: {
    精简: {
      title: "让工具替你加班，而不是让自己硬撑",
      body: "这周把邮件、表格和汇报三个高频任务重新做成了AI工作流。不是追求炫技，而是每天真实少做一点重复劳动。\n\n我把入门清单和示例模板整理成了试听资料，想试试的朋友回复「AI」，发你。",
    },
    标准: {
      title: "真正有效的AI办公，是让重复工作自动往前走",
      body: "最近帮几位朋友梳理工作流程，发现大家缺的往往不是更多AI工具，而是一套能直接落地的方法。\n\n我们把邮件回复、表格分析、会议纪要和汇报输出拆成固定步骤：什么交给AI，什么必须人工判断，最后怎样检查。这样做以后，工具才不是“偶尔玩一下”，而是真的进入每天的工作。\n\n本周开放一份AI办公试听资料，包含3个常用场景和可复制模板。想先看看是否适合自己，回复我「AI」即可领取。",
    },
    深度: {
      title: "让工具替你加班，而不是让自己一直硬撑",
      body: "这段时间和不少职场朋友交流，大家对AI办公最常见的困惑不是“不会用”，而是：试过很多工具，却依然没有省下时间。\n\n问题通常出在，我们只学了零散指令，没有把它放进真实工作流程。\n\n一套能落地的方法，应该先找到每天重复出现的任务，再明确三件事：哪些材料要输入、希望得到什么格式、哪些信息必须由人复核。比如邮件不只是让AI“帮我写”，而是先判断对象和目的；表格不只是“分析一下”，而是固定输出结论、异常和下一步；汇报也不是堆漂亮句子，而是让事实和行动建议对应起来。\n\n当这些步骤固定下来，AI才会从一个新鲜工具，变成稳定的工作搭档。\n\n我把邮件、表格、会议纪要和汇报四个场景整理成了一份试听资料，里面有可直接套用的模板和检查清单。本周开放领取，想先体验的朋友回复我「AI」，我单独发你。",
    },
  },
  公众号: {
    精简: {
      title: "AI办公不是学工具，而是重构你的工作方式",
      body: "真正决定AI能否提升效率的，不是你收藏了多少工具，而是有没有把它放进稳定的工作流程。先找出高频重复任务，定义输入与输出，再设置人工复核点。本文从邮件、资料分析和汇报三个场景，给出一套可以从今天开始实践的方法。",
    },
    标准: {
      title: "AI办公不是学会一个工具，而是重构一条工作流",
      body: "很多人已经会用AI写邮件、做摘要，却仍然感觉工作没有明显变轻。原因是我们把AI当成临时助手，而不是流程中的稳定环节。\n\n01 找到重复任务\n优先选择频率高、规则明确、耗时稳定的工作，例如会议纪要、资料归纳和日报整理。\n\n02 定义标准结果\n给出固定的输入材料、输出结构和判断标准，让每次生成都可复用、可比较。\n\n03 保留人工复核\n事实、数字、承诺和敏感表达必须回到原始资料检查。效率提升不等于放弃判断。\n\n从一条流程开始连续使用一周，比一次学十个工具更容易看到改变。文末附有AI办公场景清单，可用于梳理你的第一个自动化任务。",
    },
    深度: {
      title: "AI办公不是学工具，而是重构你的工作方式",
      body: "很多人已经会让AI写邮件、做摘要、改文案，但忙碌感并没有真正下降。问题往往不在工具能力，而在使用方式：我们把AI当成随用随开的聊天窗口，却没有让它进入稳定的工作流程。\n\n真正有效的AI办公，至少要完成三次转变。\n\n01｜从“想到才用”变成识别高频任务\n先回看一个真实工作日：哪些动作每周都会出现，规则相对固定，又持续消耗时间？会议纪要、资料归纳、日报汇总、初步数据分析，通常比复杂决策更适合作为起点。不要一次改造所有工作，先选一个能明确衡量前后差异的场景。\n\n02｜从“帮我生成”变成定义输入与输出\n一条可靠流程需要说明材料来源、目标对象、输出格式和检查标准。例如处理会议内容时，不只要求“总结”，而是固定输出核心结论、待办事项、负责人、截止时间和待确认信息。标准越清楚，结果越稳定，也越容易交给团队复用。\n\n03｜从“相信结果”变成人机协作复核\nAI可以加速整理和表达，但事实、数字、对外承诺与敏感信息仍需人工确认。把复核点设计在流程里，才能同时获得效率和安全，而不是用新的返工替代旧的重复劳动。\n\n一套工作流是否有效，可以用三个问题检验：是否减少了重复输入？输出是否能直接进入下一环节？出现错误时能否快速定位？如果答案都是“是”，AI才真正成为生产力的一部分。\n\n我们整理了邮件、表格、会议纪要和汇报输出四类常见场景的模板与检查清单。想从自己的第一个高频任务开始，可领取试听资料，按清单完成一次工作流改造。",
    },
  },
  抖音: {
    精简: {
      title: "3个AI动作，每天少忙1小时",
      body: "【3秒开场】你每天加班，可能不是工作难，而是重复动作太多。\n\n会议结束让AI提取待办，写日报按固定模板汇总，看长资料先抓事实和风险。先改一个高频任务，坚持7天，你会明显感觉工作轻了。\n\n想要完整模板，评论区打「效率」。",
    },
    标准: {
      title: "别再乱学AI了，先改掉这3个低效动作",
      body: "【开场】收藏了很多AI工具，为什么还是天天加班？因为你学的是功能，不是工作流。\n\n【镜头一】会议结束，把录音交给AI，固定输出结论、负责人和截止时间。\n\n【镜头二】下班写日报，把当天任务按完成、阻塞、明日计划自动归纳。\n\n【镜头三】看长资料，先提取关键事实和风险点，再回原文核对。\n\n记住：输入格式固定，关键内容人工复核。先连续用一周，再决定要不要学更多工具。\n\n需要这3套提示词模板，评论区打「效率」，我整理给你。",
    },
    深度: {
      title: "为什么你用了AI，还是每天加班？",
      body: "【0—3秒｜正面近景】\n为什么你用了AI，还是每天加班？因为你只是偶尔问它问题，没有把它放进工作流程。\n\n【4—12秒｜会议画面】\n第一个场景：会议纪要。别再从头听录音，固定让AI输出核心结论、待办事项、负责人和截止时间，你只负责核对事实。\n\n【13—22秒｜电脑操作】\n第二个场景：日报汇总。把当天聊天记录和任务进度放进同一个模板，按完成事项、结果数据、阻塞问题和明日计划整理。\n\n【23—32秒｜资料翻页】\n第三个场景：长资料阅读。先提取事实、风险和待确认项，再带着问题回看原文，不是少看，而是看得更准。\n\n【33—42秒｜总结字幕】\n真正有效的AI办公只有两条原则：输入格式要固定，重要结果必须人工检查。先选一个每天重复的任务，坚持使用7天，比一次学10个工具更有效。\n\n【结尾行动】\n我把这3套工作流做成了可直接套用的模板。评论区打「效率」，领取完整清单。\n\n#AI办公 #职场效率 #打工人 #工作流",
    },
  },
  视频号: {
    精简: {
      title: "AI办公的关键，不是会提问",
      body: "会让AI写一封邮件，不等于真正提高效率。先找到重复任务，再固定输入、输出和人工复核点，工具才能稳定进入工作。想领取常见办公场景模板，留言「工作流」。",
    },
    标准: {
      title: "AI办公真正的分水岭：有没有形成工作流",
      body: "很多人已经尝试用AI写邮件、做总结，但工作量并没有明显减少。关键区别在于：你是在临时使用一个工具，还是已经建立了一条可重复的流程。\n\n先从会议纪要、日报整理或资料分析中选择一个高频任务，明确输入材料、输出格式和复核标准，连续实践一周。只要结果能直接进入下一环节，效率提升才算真正发生。\n\n我们整理了4类办公场景模板，留言「工作流」即可领取。",
    },
    深度: {
      title: "学会AI工具之后，为什么工作还是没有变轻？",
      body: "很多职场人已经会用AI写邮件、做总结、整理表格，但使用一段时间后，工作量并没有明显减少。原因是我们把AI当成了临时助手，而没有把它设计成流程中的稳定环节。\n\n判断一条AI工作流是否有效，可以看三个标准。\n\n第一，输入是否固定。每次都临时解释背景，效率很难稳定。应该明确材料来源、目标对象和必要上下文。\n\n第二，输出是否可直接使用。会议内容要形成结论、负责人和截止时间；资料分析要给出事实、风险和下一步，而不只是泛泛总结。\n\n第三，是否保留人工复核。数字、事实、承诺和敏感表达必须回到原始材料确认，效率不能以失去判断为代价。\n\n建议从一个每天都会出现的任务开始，连续执行7天，记录前后用时和返工次数。能减少重复输入、顺畅进入下一环节，才是真正的生产力提升。\n\n我们把会议、邮件、表格和汇报4类场景整理成了模板与检查清单。需要的朋友留言「工作流」，从第一条流程开始实践。",
    },
  },
  微博: {
    精简: {
      title: "用了AI还加班？问题可能不在工具",
      body: "真正省时间的不是再收藏一个AI工具，而是把高频任务变成固定流程：明确输入、规定输出、保留复核。先从会议纪要或日报开始，坚持一周再看变化。想要模板，评论留「效率」。#AI办公# #职场效率#",
    },
    标准: {
      title: "为什么用了AI，工作却没有明显变轻？",
      body: "不少人会用AI写邮件、做摘要，但依然忙得停不下来。原因往往是“偶尔使用”，没有形成可重复的工作流。\n\n我更建议先改造3件事：\n1. 会议纪要固定输出结论、负责人、截止时间；\n2. 日报按完成、阻塞、计划统一归纳；\n3. 长资料先抓事实和风险，再回原文核对。\n\n输入标准化，关键结果人工复核。先跑通一个场景，比同时学10个工具更有效。需要工作流清单，评论留「效率」。\n\n#AI办公# #职场成长# #效率工具#",
    },
    深度: {
      title: "热议｜为什么很多人用了AI，还是没有准时下班？",
      body: "【为什么用了AI，工作还是没有明显变轻？】\n\n最近和不少职场人交流，发现一个很普遍的现象：大家会让AI写邮件、做摘要、改文案，甚至收藏了几十个提示词，但真正忙起来时，依然回到原来的工作方式。\n\n问题不是工具不够强，而是AI没有进入稳定流程。\n\n一条能长期使用的工作流，至少需要三部分：固定的输入材料、明确的输出格式、必须人工检查的关键点。比如会议纪要不只要“总结一下”，而要形成结论、待办、负责人和截止时间；日报不只是润色，而要对齐完成事项、结果数据、阻塞和下一步。\n\n更重要的是，事实、数字和对外承诺必须回到原始材料复核。AI负责加速，人负责判断。\n\n不妨从一个每天重复的任务开始，坚持7天，记录节省的时间和返工次数。跑通一条流程，比一次学会10个新工具更有价值。\n\n我整理了一份AI办公工作流清单，需要的朋友评论留「效率」。\n\n#AI办公# #职场效率# #工作流# #打工人成长#",
    },
  },
};

function buildCopy(platform: ContentItem["platform"], depth: CopyDepth) {
  return copyLibrary[platform][depth];
}

const initialItems: ContentItem[] = [
  {
    id: 1,
    platform: "小红书",
    platformKey: "red",
    title: "每天少加1小时班，我用AI重做了工作流",
    body: copyLibrary.小红书.深度.body,
    audience: "效率敏感型职场新人",
    quality: 96,
    risk: "低风险",
    status: "待审核",
    version: 2,
  },
  {
    id: 2,
    platform: "朋友圈",
    platformKey: "green",
    title: "让工具替你加班，而不是让自己硬撑",
    body: copyLibrary.朋友圈.深度.body,
    audience: "AI课程高意向新用户",
    quality: 93,
    risk: "低风险",
    status: "待审核",
    version: 2,
  },
  {
    id: 3,
    platform: "公众号",
    platformKey: "blue",
    title: "AI办公不是学工具，而是重构你的工作方式",
    body: copyLibrary.公众号.深度.body,
    audience: "成长驱动型职场人",
    quality: 88,
    risk: "需复核",
    status: "待审核",
    version: 2,
  },
  {
    id: 4,
    platform: "抖音",
    platformKey: "black",
    title: copyLibrary.抖音.深度.title,
    body: copyLibrary.抖音.深度.body,
    audience: "短视频效率内容用户",
    quality: 95,
    risk: "低风险",
    status: "待审核",
    version: 1,
  },
  {
    id: 5,
    platform: "视频号",
    platformKey: "teal",
    title: copyLibrary.视频号.深度.title,
    body: copyLibrary.视频号.深度.body,
    audience: "管理者与成熟职场人",
    quality: 92,
    risk: "低风险",
    status: "待审核",
    version: 1,
  },
  {
    id: 6,
    platform: "微博",
    platformKey: "orange",
    title: copyLibrary.微博.深度.title,
    body: copyLibrary.微博.深度.body,
    audience: "热点与效率话题用户",
    quality: 90,
    risk: "需复核",
    status: "待审核",
    version: 1,
  },
];

const platformStyles = {
  red: { icon: "书", label: "小红书" },
  green: { icon: "圈", label: "朋友圈" },
  blue: { icon: "号", label: "公众号" },
  black: { icon: "抖", label: "抖音" },
  teal: { icon: "视", label: "视频号" },
  orange: { icon: "博", label: "微博" },
};

function SparkIcon() {
  return <span className="spark" aria-hidden="true">✦</span>;
}

type Notify = (message: string) => void;

function useDurableState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [status, setStatus] = useState<"loading" | "saved" | "error">("loading");
  const loaded = useRef(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/state?key=${encodeURIComponent(key)}`)
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load state");
        return response.json() as Promise<{ value: T | null }>;
      })
      .then((payload) => {
        if (!active) return;
        if (payload.value !== null) setValue(payload.value);
        loaded.current = true;
        setStatus("saved");
      })
      .catch(() => {
        if (!active) return;
        loaded.current = true;
        setStatus("error");
      });
    return () => { active = false; };
  }, [key]);

  useEffect(() => {
    if (!loaded.current) return;
    setStatus("loading");
    const timer = window.setTimeout(() => {
      fetch("/api/state", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key, value }),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Unable to save state");
          setStatus("saved");
        })
        .catch(() => setStatus("error"));
    }, 450);
    return () => window.clearTimeout(timer);
  }, [key, value]);

  return [value, setValue, status] as const;
}

function ModuleHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="module-header">
      <div>
        <span className="section-label">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  );
}

function AudienceView({ notify }: { notify: Notify }) {
  const [segments, setSegments, saveStatus] = useDurableState("audience-segments", [
    { id: 1, name: "AI课程高意向新用户", count: 124, growth: "+18%", color: "violet", tags: ["新用户", "AI兴趣", "高意向"], goal: "领取试听资料" },
    { id: 2, name: "效率敏感型职场新人", count: 186, growth: "+12%", color: "blue", tags: ["职场新人", "效率工具", "活跃"], goal: "关注课程内容" },
    { id: 3, name: "成长驱动型职场人", count: 96, growth: "+7%", color: "mint", tags: ["职业成长", "内容活跃", "中意向"], goal: "预约课程咨询" },
    { id: 4, name: "沉默待唤醒用户", count: 80, growth: "-3%", color: "amber", tags: ["30天未访问", "历史活跃", "低意向"], goal: "重新激活" },
  ]);
  const [selectedId, setSelectedId] = useState(1);
  const [showBuilder, setShowBuilder] = useState(false);
  const [newName, setNewName] = useState("");
  const selected = segments.find((segment) => segment.id === selectedId) ?? segments[0];

  function addSegment() {
    if (!newName.trim()) {
      notify("请先填写人群名称");
      return;
    }
    const segment = {
      id: Date.now(),
      name: newName.trim(),
      count: 0,
      growth: "新建",
      color: "violet",
      tags: ["待计算", "自定义规则"],
      goal: "待设置",
    };
    setSegments((current) => [...current, segment]);
    setSelectedId(segment.id);
    setNewName("");
    setShowBuilder(false);
    notify("新的人群规则已创建");
  }

  return (
    <section className="module-page">
      <ModuleHeader
        eyebrow="Audience strategy"
        title="人群策略"
        description="把标签相似的用户组合成人群，再为每个人群匹配不同的营销目标和内容。"
        action={<button className="module-primary" onClick={() => setShowBuilder(true)}>＋ 新建人群</button>}
      />
      <div className={`save-indicator ${saveStatus}`}>{saveStatus === "saved" ? "✓ 人群策略已保存" : saveStatus === "error" ? "! 暂时无法保存" : "正在保存…"}</div>

      <div className="module-kpis">
        <div><span>已覆盖用户</span><strong>486</strong><small>覆盖率 100%</small></div>
        <div><span>有效人群</span><strong>{segments.length}</strong><small>1 个需要关注</small></div>
        <div><span>平均标签数</span><strong>6.4</strong><small>较上周 +0.8</small></div>
        <div><span>高意向用户</span><strong>124</strong><small>占比 25.5%</small></div>
      </div>

      <div className="audience-layout">
        <div className="module-card segment-list-card">
          <div className="module-card-head"><div><span>人群列表</span><strong>点击查看规则与策略</strong></div><button onClick={() => notify("人群数量已重新计算")}>重新计算</button></div>
          <div className="segment-list">
            {segments.map((segment) => (
              <button key={segment.id} className={`segment-item ${selectedId === segment.id ? "selected" : ""}`} onClick={() => setSelectedId(segment.id)}>
                <span className={`segment-mark ${segment.color}`} />
                <span className="segment-main"><strong>{segment.name}</strong><small>{segment.tags.join(" · ")}</small></span>
                <span className="segment-size"><strong>{segment.count}</strong><small className={segment.growth.startsWith("-") ? "down" : ""}>{segment.growth}</small></span>
              </button>
            ))}
          </div>
        </div>

        <div className="module-card segment-detail">
          <div className="detail-title">
            <div><span className={`segment-mark ${selected.color}`} /><span><small>当前人群</small><h3>{selected.name}</h3></span></div>
            <button onClick={() => notify("规则编辑器已进入可编辑状态")}>编辑规则</button>
          </div>

          <div className="logic-box">
            <span>满足以下全部条件</span>
            <div className="logic-row"><b>生命周期</b><em>等于</em><strong>新用户</strong><button>×</button></div>
            <div className="logic-row"><b>兴趣标签</b><em>包含</em><strong>AI / 效率工具</strong><button>×</button></div>
            <div className="logic-row"><b>意向等级</b><em>等于</em><strong>高</strong><button>×</button></div>
            <button className="add-condition" onClick={() => notify("已添加一个空白条件")}>＋ 添加条件</button>
          </div>

          <div className="strategy-summary">
            <span>匹配的内容策略</span>
            <div><small>营销目标</small><strong>{selected.goal}</strong></div>
            <div><small>推荐语气</small><strong>专业、轻松、避免焦虑</strong></div>
            <div><small>首选平台</small><strong>小红书 · 朋友圈</strong></div>
          </div>
          <button className="full-action" onClick={() => notify(`已为“${selected.name}”创建内容任务`)}>为这个人群生成内容 →</button>
        </div>
      </div>

      {showBuilder && (
        <div className="mini-modal-backdrop" onMouseDown={() => setShowBuilder(false)}>
          <div className="mini-modal" onMouseDown={(event) => event.stopPropagation()}>
            <button className="guide-close" onClick={() => setShowBuilder(false)}>×</button>
            <span className="section-label">New audience</span>
            <h2>新建自定义人群</h2>
            <label>人群名称<input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="例如：高意向企业客户" autoFocus /></label>
            <label>初始规则<select defaultValue="intent"><option value="intent">意向等级等于“高”</option><option value="active">最近7天有访问</option><option value="new">生命周期等于“新用户”</option></select></label>
            <button className="module-primary wide" onClick={addSegment}>创建并计算人数</button>
          </div>
        </div>
      )}
    </section>
  );
}

function AutomationView({ notify }: { notify: Notify }) {
  const [tasks, setTasks, taskSaveStatus] = useDurableState("automation-tasks", [
    { id: 1, name: "每天同步用户标签", schedule: "每天 09:00", next: "明天 09:00", enabled: true, icon: "↻", color: "violet" },
    { id: 2, name: "生成每周内容计划", schedule: "每周一 10:00", next: "下周一 10:00", enabled: true, icon: "✦", color: "blue" },
    { id: 3, name: "发布后效果快报", schedule: "发布 24 小时后", next: "今天 18:30", enabled: true, icon: "↗", color: "mint" },
    { id: 4, name: "沉默用户唤醒任务", schedule: "每月 1 日", next: "8月1日 09:30", enabled: false, icon: "◎", color: "amber" },
  ]);
  const [runningId, setRunningId] = useState<number | null>(null);
  const [logs, setLogs] = useDurableState("automation-logs", [
    ["10:02", "每周内容计划", "生成 12 条内容，1 条需复核", "成功"],
    ["09:00", "用户标签同步", "新增 18 条，更新 64 条", "成功"],
    ["昨天 18:30", "效果快报", "已汇总 6 个平台数据", "成功"],
  ]);

  function toggleTask(id: number) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, enabled: !task.enabled } : task));
    notify("自动任务状态已更新");
  }

  function runTask(id: number, name: string) {
    setRunningId(id);
    window.setTimeout(() => {
      setRunningId(null);
      setLogs((current) => [["刚刚", name, "手动执行完成", "成功"], ...current]);
      notify(`${name}执行完成`);
    }, 900);
  }

  return (
    <section className="module-page">
      <ModuleHeader
        eyebrow="Automation"
        title="自动化"
        description="让标签同步、内容生成和效果报告按计划自动执行，也可以随时手动运行。"
        action={<button className="module-primary" onClick={() => notify("新建任务向导已准备好")}>＋ 新建自动任务</button>}
      />
      <div className={`save-indicator ${taskSaveStatus}`}>{taskSaveStatus === "saved" ? "✓ 自动任务已保存" : taskSaveStatus === "error" ? "! 暂时无法保存" : "正在保存…"}</div>

      <div className="automation-summary">
        <div><span className="pulse-dot" /><span><strong>{tasks.filter((task) => task.enabled).length} 个任务正在运行</strong><small>最近一次执行成功 · 今天 10:02</small></span></div>
        <div><span>本月自动执行</span><strong>28 次</strong></div>
        <div><span>节省人工时间</span><strong>约 14.5 小时</strong></div>
      </div>

      <div className="task-grid">
        {tasks.map((task) => (
          <article className={`task-card ${task.enabled ? "" : "disabled"}`} key={task.id}>
            <div className="task-top">
              <span className={`task-icon ${task.color}`}>{task.icon}</span>
              <button className={`switch ${task.enabled ? "on" : ""}`} onClick={() => toggleTask(task.id)} aria-label={`${task.enabled ? "关闭" : "开启"}${task.name}`}><i /></button>
            </div>
            <h3>{task.name}</h3>
            <p>{task.schedule}</p>
            <div className="task-next"><span>下次执行</span><strong>{task.enabled ? task.next : "已暂停"}</strong></div>
            <button className="run-task" onClick={() => runTask(task.id, task.name)} disabled={runningId === task.id}>{runningId === task.id ? "执行中…" : "立即运行"}</button>
          </article>
        ))}
      </div>

      <div className="module-card run-log">
        <div className="module-card-head"><div><span>运行记录</span><strong>最近的自动化结果</strong></div><button onClick={() => notify("已刷新运行记录")}>刷新</button></div>
        <div className="log-table">
          <div className="log-row log-head"><span>时间</span><span>任务</span><span>结果</span><span>状态</span></div>
          {logs.map((log, index) => <div className="log-row" key={`${log[0]}-${index}`}><span>{log[0]}</span><strong>{log[1]}</strong><span>{log[2]}</span><em>✓ {log[3]}</em></div>)}
        </div>
      </div>
    </section>
  );
}

function KnowledgeView({ notify }: { notify: Notify }) {
  const [tab, setTab] = useState<"语气" | "资料" | "合规">("语气");
  const [tones, setTones, knowledgeSaveStatus] = useDurableState("brand-tones", ["专业但不说教", "轻松有温度", "简洁直接", "避免焦虑营销"]);
  const [newTone, setNewTone] = useState("");
  const [forbidden, setForbidden] = useDurableState("forbidden-words", ["保证学会", "月薪翻倍", "全网最低", "最后名额", "绝对有效"]);
  const [newWord, setNewWord] = useState("");
  const [documents, setDocuments] = useDurableState("knowledge-documents", [
    ["AI办公训练营_产品手册.pdf", "产品资料", "2.4 MB", "已解析"],
    ["品牌语气与文案规范.docx", "品牌规范", "860 KB", "已解析"],
    ["2026暑期活动说明.pdf", "活动规则", "1.2 MB", "已解析"],
  ]);

  function addTone() {
    if (!newTone.trim()) return;
    setTones((current) => [...current, newTone.trim()]);
    setNewTone("");
    notify("品牌语气规则已添加");
  }

  function addWord() {
    if (!newWord.trim()) return;
    setForbidden((current) => [...current, newWord.trim()]);
    setNewWord("");
    notify("禁用词已加入合规检查");
  }

  function uploadDocument(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setDocuments((current) => [[file.name, "新资料", `${Math.max(file.size / 1024, 1).toFixed(0)} KB`, "已解析"], ...current]);
    notify("资料已加入知识库");
  }

  return (
    <section className="module-page">
      <ModuleHeader
        eyebrow="Brand knowledge"
        title="品牌知识库"
        description="告诉系统你的品牌怎么说、产品事实是什么，以及哪些表达绝对不能出现。"
        action={<label className="module-primary file-action">↑ 上传资料<input type="file" accept=".pdf,.doc,.docx,.txt" onChange={uploadDocument} /></label>}
      />
      <div className={`save-indicator ${knowledgeSaveStatus}`}>{knowledgeSaveStatus === "saved" ? "✓ 品牌规则已保存" : knowledgeSaveStatus === "error" ? "! 暂时无法保存" : "正在保存…"}</div>

      <div className="knowledge-tabs">
        {(["语气", "资料", "合规"] as const).map((item) => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item === "语气" ? "品牌语气" : item === "资料" ? "产品资料" : "合规词库"}</button>)}
      </div>

      {tab === "语气" && (
        <div className="knowledge-grid">
          <div className="module-card knowledge-card">
            <span className="section-label">Voice rules</span><h3>品牌应该怎么说话</h3><p>生成内容时，系统会同时遵守下面所有语气要求。</p>
            <div className="tone-list">{tones.map((tone) => <span key={tone}>{tone}<button onClick={() => setTones((current) => current.filter((item) => item !== tone))}>×</button></span>)}</div>
            <div className="inline-add"><input value={newTone} onChange={(event) => setNewTone(event.target.value)} placeholder="添加一条语气要求" /><button onClick={addTone}>添加</button></div>
          </div>
          <div className="module-card knowledge-card">
            <span className="section-label">Reference copy</span><h3>参考文案</h3><p>用一段你认可的文案，帮助系统理解品牌风格。</p>
            <textarea defaultValue="我们相信，好的工具不是让工作变复杂，而是让每个人都能把时间留给真正重要的事情。用清楚的方法，解决具体的问题。" />
            <button className="full-action" onClick={() => notify("参考文案已保存")}>保存品牌语气</button>
          </div>
        </div>
      )}

      {tab === "资料" && (
        <div className="module-card document-card">
          <div className="module-card-head"><div><span>知识文件</span><strong>{documents.length} 份资料可供生成时引用</strong></div><label className="small-upload">＋ 添加文件<input type="file" onChange={uploadDocument} /></label></div>
          <div className="document-list">
            {documents.map((doc) => <div key={doc[0]}><span className="doc-icon">文</span><span><strong>{doc[0]}</strong><small>{doc[1]} · {doc[2]}</small></span><em>✓ {doc[3]}</em><button onClick={() => setDocuments((current) => current.filter((item) => item[0] !== doc[0]))}>删除</button></div>)}
          </div>
        </div>
      )}

      {tab === "合规" && (
        <div className="knowledge-grid">
          <div className="module-card knowledge-card">
            <span className="section-label">Forbidden words</span><h3>禁用表达</h3><p>出现这些表达时，系统会阻止内容进入发布队列。</p>
            <div className="forbidden-list">{forbidden.map((word) => <span key={word}>! {word}<button onClick={() => setForbidden((current) => current.filter((item) => item !== word))}>×</button></span>)}</div>
            <div className="inline-add"><input value={newWord} onChange={(event) => setNewWord(event.target.value)} placeholder="输入新的禁用词" /><button onClick={addWord}>加入</button></div>
          </div>
          <div className="module-card compliance-card">
            <span className="shield">✓</span><h3>合规检查运行正常</h3><p>当前启用 {forbidden.length} 个自定义禁用词，并检查夸大承诺、隐私信息和活动有效期。</p>
            <div><span>隐私信息检查</span><strong>已开启</strong></div><div><span>事实依据检查</span><strong>已开启</strong></div><div><span>平台敏感词</span><strong>已开启</strong></div>
          </div>
        </div>
      )}
    </section>
  );
}

function InsightsView({ notify }: { notify: Notify }) {
  const [period, setPeriod] = useState<"7天" | "30天" | "90天">("30天");
  const multiplier = period === "7天" ? 0.3 : period === "90天" ? 2.6 : 1;
  const number = (value: number) => Math.round(value * multiplier).toLocaleString("zh-CN");

  return (
    <section className="module-page">
      <ModuleHeader
        eyebrow="Performance insights"
        title="效果洞察"
        description="比较不同平台、人群和文案的表现，找出下一批内容应该继续采用的策略。"
        action={<div className="period-filter">{(["7天", "30天", "90天"] as const).map((item) => <button key={item} className={period === item ? "active" : ""} onClick={() => setPeriod(item)}>{item}</button>)}</div>}
      />

      <div className="insight-kpis">
        <div><span>总曝光</span><strong>{number(286400)}</strong><small>↗ 18.6%</small></div>
        <div><span>内容点击</span><strong>{number(18420)}</strong><small>↗ 12.4%</small></div>
        <div><span>咨询转化</span><strong>{number(846)}</strong><small>↗ 9.8%</small></div>
        <div><span>平均点击率</span><strong>6.43%</strong><small>↗ 0.7%</small></div>
      </div>

      <div className="insight-grid">
        <div className="module-card chart-card">
          <div className="module-card-head"><div><span>平台表现</span><strong>点击率与转化率</strong></div><button onClick={() => notify("洞察数据已刷新")}>刷新</button></div>
          <div className="bar-chart">
            {[["小红书", 84, "7.8%", "red"], ["朋友圈", 66, "6.1%", "green"], ["公众号", 52, "4.9%", "blue"]].map(([name, width, value, color]) => (
              <div className="bar-row" key={name}><span>{name}</span><div><i className={String(color)} style={{ width: `${width}%` }} /></div><strong>{value}</strong></div>
            ))}
          </div>
          <div className="chart-insight"><SparkIcon /><p><strong>小红书是当前最有效的平台</strong>，点击率高于公众号 2.9 个百分点，建议下一批增加场景型标题。</p></div>
        </div>

        <div className="module-card donut-card">
          <div className="module-card-head"><div><span>转化来源</span><strong>按重点人群划分</strong></div></div>
          <div className="donut-wrap"><div className="donut"><span><strong>846</strong><small>总咨询</small></span></div><div className="donut-legend"><span><i className="violet" />高意向新用户 <b>42%</b></span><span><i className="blue" />职场新人 <b>31%</b></span><span><i className="mint" />成长型用户 <b>19%</b></span><span><i className="gray" />其他 <b>8%</b></span></div></div>
        </div>
      </div>

      <div className="module-card ranking-card">
        <div className="module-card-head"><div><span>高表现内容</span><strong>本周期综合排名</strong></div><button onClick={() => notify("完整报告将在下一步提供下载")}>下载报告</button></div>
        <div className="ranking-table">
          <div className="rank-row rank-head"><span>排名</span><span>内容</span><span>平台</span><span>目标人群</span><span>点击率</span><span>咨询</span></div>
          {[
            ["01", "每天少加1小时班，我用AI重做了工作流", "小红书", "职场新人", "9.2%", "286"],
            ["02", "让工具替你加班，而不是让自己硬撑", "朋友圈", "高意向新用户", "8.4%", "214"],
            ["03", "AI办公不是学工具，而是重构工作方式", "公众号", "成长型用户", "6.8%", "148"],
          ].map((row) => <div className="rank-row" key={row[0]}><b>{row[0]}</b><strong>{row[1]}</strong><span>{row[2]}</span><span>{row[3]}</span><em>{row[4]}</em><span>{row[5]}</span></div>)}
        </div>
      </div>
    </section>
  );
}

function ConnectionsView({ notify }: { notify: Notify }) {
  const [testValue, setTestValue, saveStatus] = useDurableState("connection-test", {
    checks: 0,
    lastChecked: "尚未测试",
  });

  function testDatabase() {
    const now = new Date().toLocaleString("zh-CN", { hour12: false });
    setTestValue({ checks: testValue.checks + 1, lastChecked: now });
    notify("已发送数据库保存测试");
  }

  return (
    <section className="module-page">
      <ModuleHeader
        eyebrow="Connections"
        title="数据与模型连接"
        description="集中查看这个工具真正连接了哪些服务，避免把演示功能误认为已经接入生产系统。"
      />

      <div className="connection-banner">
        <span className="connection-shield">✓</span>
        <span><strong>云端保存已启用</strong><small>人群、自动任务、品牌规则和审核结果会在刷新后保留。</small></span>
        <em className={saveStatus}>{saveStatus === "saved" ? "运行正常" : saveStatus === "error" ? "连接异常" : "检查中"}</em>
      </div>

      <div className="connection-grid">
        <article className="connection-card connected">
          <div><span className="connector-icon">库</span><em>已连接</em></div>
          <h3>云端数据库</h3>
          <p>保存人群、任务、知识库规则和内容审核状态。</p>
          <dl><div><dt>保存范围</dt><dd>整个私有工作区</dd></div><div><dt>上次测试</dt><dd>{testValue.lastChecked}</dd></div></dl>
          <button onClick={testDatabase}>测试保存能力</button>
        </article>

        <article className="connection-card partial">
          <div><span className="connector-icon">表</span><em>可用</em></div>
          <h3>CSV 标签数据</h3>
          <p>支持手动导入标签表；自动读取 CRM 尚未配置。</p>
          <dl><div><dt>当前方式</dt><dd>手动上传 CSV</dd></div><div><dt>数据映射</dt><dd>6 个标准字段</dd></div></dl>
          <button onClick={() => notify("请回到内容工作台上传 CSV 文件")}>前往导入标签</button>
        </article>

        <article className="connection-card waiting">
          <div><span className="connector-icon">AI</span><em>待连接</em></div>
          <h3>大模型生成服务</h3>
          <p>当前仍使用内置规则演示；需要配置服务端密钥后才能生成真实新文案。</p>
          <dl><div><dt>推荐模型</dt><dd>OpenAI GPT 系列</dd></div><div><dt>密钥位置</dt><dd>仅保存在服务器</dd></div></dl>
          <button onClick={() => notify("模型密钥需要在服务器端安全配置")}>查看接入要求</button>
        </article>

        <article className="connection-card waiting">
          <div><span className="connector-icon">发</span><em>待连接</em></div>
          <h3>社交媒体发布</h3>
          <p>当前可导出审核结果，尚未直接连接平台发布接口。</p>
          <dl><div><dt>当前方式</dt><dd>导出 CSV</dd></div><div><dt>建议顺序</dt><dd>先审批，再排期</dd></div></dl>
          <button onClick={() => notify("发布接口将在模型接入后继续开发")}>查看发布计划</button>
        </article>
      </div>

      <div className="module-card readiness-card">
        <div className="module-card-head"><div><span>产品就绪度</span><strong>从演示版到真实运营工具</strong></div><b>62%</b></div>
        <div className="readiness-body">
          <div className="readiness-track"><i style={{ width: "62%" }} /></div>
          <div className="readiness-steps">
            <span className="done">✓ 完整操作界面</span>
            <span className="done">✓ 云端状态保存</span>
            <span>3 接入真实大模型</span>
            <span>4 连接 CRM 与发布平台</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [items, setItems, contentSaveStatus] = useDurableState("content-items-six-platform-v1", initialItems);
  const [activeNav, setActiveNav] = useState("内容工作台");
  const [filter, setFilter] = useState<"全部" | "待审核" | "已通过">("全部");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyDepth, setCopyDepth] = useState<CopyDepth>("深度");
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
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
        current.map((item, index) => {
          const generated = buildCopy(item.platform, copyDepth);
          return {
            ...item,
            ...generated,
            quality: Math.min(98, 94 + index),
            risk: item.platform === "公众号" || item.platform === "微博" ? "需复核" : "低风险",
            version: item.version + 1,
            status: "待审核",
          };
        }),
      );
      setExpandedIds([]);
      setHasGenerated(true);
      setIsGenerating(false);
      showToast(`已生成 6 个平台的${copyDepth}文案`);
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
              ...buildCopy(item.platform, copyDepth),
              version: item.version + 1,
              quality: Math.min(99, item.quality + 2),
              risk: "低风险",
              status: "待审核",
            }
          : item,
      ),
    );
    setExpandedIds((current) => current.includes(id) ? current : [...current, id]);
    showToast(`已按品牌语气重写为${copyDepth}版本`);
  }

  function toggleExpanded(id: number) {
    setExpandedIds((current) =>
      current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id],
    );
  }

  function saveEditedItem() {
    if (!editingItem) return;
    if (!editingItem.title.trim() || !editingItem.body.trim()) {
      showToast("标题和正文不能为空");
      return;
    }
    setItems((current) =>
      current.map((item) =>
        item.id === editingItem.id
          ? { ...editingItem, version: item.version + 1, status: "待审核" }
          : item,
      ),
    );
    setExpandedIds((current) =>
      current.includes(editingItem.id) ? current : [...current, editingItem.id],
    );
    setEditingItem(null);
    showToast("修改已保存");
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

  const navItems = ["内容工作台", "人群策略", "自动化", "品牌知识库", "数据连接", "效果洞察"];
  const navCounts: Record<string, string> = {
    "内容工作台": "12",
    "人群策略": "4",
    "自动化": "3",
    "品牌知识库": "8",
    "数据连接": "2",
  };

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
              onClick={() => setActiveNav(item)}
            >
              <span className="nav-icon" aria-hidden="true">
                {["◫", "◎", "↯", "◇", "⌁", "↗"][index]}
              </span>
              {item}
              {navCounts[item] && <span className="nav-count">{navCounts[item]}</span>}
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
        {activeNav === "内容工作台" ? (
        <>
        <header className="topbar">
          <div>
            <div className="title-line">
              <span className="eyebrow">内容工作台</span>
              <span className="demo-badge">功能演示版</span>
            </div>
            <h1>把用户标签变成社交媒体文案</h1>
          </div>
          <div className="top-actions">
            <span className={`compact-save ${contentSaveStatus}`}>{contentSaveStatus === "saved" ? "✓ 已保存" : contentSaveStatus === "error" ? "! 保存失败" : "保存中…"}</span>
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
                <span className="red">书</span>
                <span className="green">圈</span>
                <span className="blue">号</span>
                <span className="black">抖</span>
                <span className="teal">视</span>
                <span className="orange">博</span>
              </div>
            </div>

            <div className="depth-selector">
              <div className="rule-title">
                <span className="rule-icon violet" aria-hidden="true">≡</span>
                <span><strong>文案要写到什么深度？</strong><small>篇幅、结构和信息密度会同步变化</small></span>
              </div>
              <div className="depth-options" role="group" aria-label="文案深度">
                {(["精简", "标准", "深度"] as const).map((depth) => (
                  <button
                    key={depth}
                    className={copyDepth === depth ? "active" : ""}
                    onClick={() => setCopyDepth(depth)}
                  >
                    {depth}
                  </button>
                ))}
              </div>
            </div>

            <div className="guardrail">
              <span aria-hidden="true">✓</span>
              <div><strong>品牌与合规规则已启用</strong><small>已加载 24 条禁用词、8 条品牌语气规则</small></div>
            </div>

            <button className="generate-button" onClick={generateContent} disabled={isGenerating}>
              <SparkIcon />
              <span><strong>{isGenerating ? "正在生成并质检…" : "第 3 步：生成多平台成稿"}</strong><small>当前：{copyDepth}模式 · 自动匹配平台结构、段落和行动引导</small></span>
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
                const isExpanded = expandedIds.includes(item.id);
                return (
                  <article className={`content-card ${item.status === "已通过" ? "approved" : ""} ${isExpanded ? "expanded" : ""}`} key={item.id}>
                    <div className={`platform-icon ${item.platformKey}`}>{platform.icon}</div>
                    <div className="content-body">
                      <div className="content-meta">
                        <span>{platform.label}</span>
                        <i>·</i>
                        <span>{item.audience}</span>
                        <span className="version">V{item.version}</span>
                      </div>
                      <h4>{item.title}</h4>
                      <p className="copy-text">{item.body}</p>
                      <button className="expand-copy" onClick={() => toggleExpanded(item.id)}>
                        {isExpanded ? "收起正文 ↑" : `展开全文 · ${item.body.length} 字 ↓`}
                      </button>
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
                      <button className="edit-copy" onClick={() => setEditingItem(item)}>编辑</button>
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
        </>
        ) : activeNav === "人群策略" ? (
          <AudienceView notify={showToast} />
        ) : activeNav === "自动化" ? (
          <AutomationView notify={showToast} />
        ) : activeNav === "品牌知识库" ? (
          <KnowledgeView notify={showToast} />
        ) : activeNav === "数据连接" ? (
          <ConnectionsView notify={showToast} />
        ) : (
          <InsightsView notify={showToast} />
        )}
      </main>

      {showGuide && activeNav === "内容工作台" && (
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
                <strong>6 个平台文案</strong>
                <div><i>小红书</i><i>朋友圈</i><i>公众号</i><i>抖音</i><i>视频号</i><i>微博</i></div>
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

      {editingItem && (
        <div className="copy-editor-backdrop" role="presentation" onMouseDown={() => setEditingItem(null)}>
          <section
            className="copy-editor"
            role="dialog"
            aria-modal="true"
            aria-labelledby="copy-editor-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="copy-editor-heading">
              <div>
                <span>{editingItem.platform} · V{editingItem.version}</span>
                <h2 id="copy-editor-title">编辑宣传文案</h2>
              </div>
              <button onClick={() => setEditingItem(null)} aria-label="关闭编辑器">×</button>
            </div>
            <label>
              <span>标题</span>
              <input
                value={editingItem.title}
                onChange={(event) => setEditingItem({ ...editingItem, title: event.target.value })}
              />
            </label>
            <label>
              <span>正文</span>
              <textarea
                value={editingItem.body}
                onChange={(event) => setEditingItem({ ...editingItem, body: event.target.value })}
              />
            </label>
            <div className="copy-editor-meta">
              <span>{editingItem.body.length} 字</span>
              <span>保存后自动进入待审核</span>
            </div>
            <div className="copy-editor-actions">
              <button className="editor-cancel" onClick={() => setEditingItem(null)}>取消</button>
              <button className="editor-save" onClick={saveEditedItem}>保存修改</button>
            </div>
          </section>
        </div>
      )}

      {toast && <div className="toast" role="status"><span>✓</span>{toast}</div>}
    </div>
  );
}
