/* ============================================================
   考纲结构 · 全站导航与组卷的唯一数据源
   基准：DevOps Foundation® (DOFD) v3.6 — DevOps Institute / PeopleCert
   题数分布来源：DOFD v3.4 Examination Requirements (2022-05)
                 —— v3.6 未公开重新发布权重表，见 README「来源与纪律」
   status: 'done' 已完成 | 'todo' 待建设
   ============================================================ */
window.SYLLABUS = {
  meta: {
    cert: "DevOps Foundation®",
    code: "DOFD",
    body: "DevOps Institute / PeopleCert",
    version: "v3.6",
    exam: {
      questions: 40,
      minutes: 60,
      passText: "65%（26 / 40）",
      passRatio: 0.65,
      openBook: true,
      openBookNote: "仅限官方 Learner Workbook 与 Quick Reference Guide",
      bloom: "Bloom 1–2（记忆与理解）",
      delivery: "线上 web proctored，24/7",
      prereq: "无正式前置，建议 16 学时",
      validity: "3 年，需 60 CPD 分续证"
    },
    weightSource:
      "DOFD v3.4 Examination Requirements（2022-05）。v3.6（2024-10 更新，2025-02 修订）未公开重新发布权重表，本站沿用 v3.4 分布并全程标注。"
  },

  chapters: [
    {
      id: "ch00", slug: "ch00-overview", num: "0",
      title: "导论", titleEn: "Orientation",
      questions: null,
      desc: "先搞清楚考什么、怎么考、这套资料怎么用，再进入知识本身。",
      sections: [
        { n: "0.1", slug: "0.1-how-to-use", title: "如何使用本资料", status: "todo" },
        { n: "0.2", slug: "0.2-exam-facts", title: "DOFD v3.6 考试全解", status: "todo" },
        { n: "0.3", slug: "0.3-map-guide", title: "全局知识地图导读", status: "todo" },
        { n: "0.4", slug: "0.4-learning-path", title: "三个月学习路径", status: "todo" }
      ]
    },
    {
      id: "ch01", slug: "ch01-exploring-devops", num: "1",
      title: "认识 DevOps", titleEn: "Exploring DevOps",
      questions: 5,
      desc: "DevOps 是什么、为什么会出现、它对业务和 IT 各自意味着什么。整套知识体系的地基。",
      sections: [
        { n: "1.1", slug: "1.1-defining-devops", title: "定义 DevOps", status: "done" },
        { n: "1.2", slug: "1.2-why-it-matters", title: "DevOps 为什么重要", status: "done" },
        { n: "1.3", slug: "1.3-business-it-perspective", title: "商业视角与 IT 视角", status: "done" },
        { n: "1.4", slug: "1.4-values-goals-stakeholders", title: "价值、目标与干系人", status: "done" },
        { n: "1.5", slug: "summary", title: "本章总结与练习", status: "done" }
      ]
    },
    {
      id: "ch02", slug: "ch02-core-principles", num: "2",
      title: "核心原则", titleEn: "Core DevOps Principles",
      questions: 4,
      desc: "三步工作法是整个 DevOps 的因果主轴。约束理论解释瓶颈，混沌工程与学习型组织支撑第三步。",
      sections: [
        { n: "2.1", slug: "2.1-three-ways", title: "三步工作法总览", status: "done" },
        { n: "2.2", slug: "2.2-first-way-flow", title: "第一步：流动", status: "done" },
        { n: "2.3", slug: "2.3-theory-of-constraints", title: "约束理论", status: "done" },
        { n: "2.4", slug: "2.4-second-way-feedback", title: "第二步：反馈", status: "done" },
        { n: "2.5", slug: "2.5-third-way-learning", title: "第三步：持续学习与实验", status: "done" },
        { n: "2.6", slug: "2.6-chaos-engineering", title: "混沌工程", status: "done" },
        { n: "2.7", slug: "2.7-learning-organizations", title: "学习型组织", status: "done" },
        { n: "2.8", slug: "summary", title: "本章总结与练习", status: "done" }
      ]
    },
    {
      id: "ch03", slug: "ch03-key-practices", num: "3",
      title: "关键实践", titleEn: "Key DevOps Practices",
      questions: 7,
      desc: "考纲权重并列最高。CI/CD 家族最容易混淆，可观测性、VSM、平台工程是 v3.6 新增。",
      sections: [
        { n: "3.1", slug: "3.1-continuous-testing", title: "持续测试", status: "done" },
        { n: "3.2", slug: "3.2-continuous-integration", title: "持续集成", status: "done" },
        { n: "3.3", slug: "3.3-delivery-vs-deployment", title: "持续交付 vs 持续部署", status: "done" },
        { n: "3.4", slug: "3.4-sre-resilience", title: "SRE 与韧性工程", status: "done" },
        { n: "3.5", slug: "3.5-devsecops", title: "DevSecOps", status: "done" },
        { n: "3.6", slug: "3.6-chatops", title: "ChatOps", status: "done" },
        { n: "3.7", slug: "3.7-kanban", title: "看板方法", status: "done" },
        { n: "3.8", slug: "3.8-observability", title: "监控与可观测性", status: "done", tag: "new" },
        { n: "3.9", slug: "3.9-vsm", title: "价值流管理", status: "done", tag: "new" },
        { n: "3.10", slug: "3.10-platform-engineering", title: "平台工程", status: "done", tag: "new" },
        { n: "3.11", slug: "summary", title: "本章总结与练习", status: "done" }
      ]
    },
    {
      id: "ch04", slug: "ch04-frameworks", num: "4",
      title: "业务与技术框架", titleEn: "Business & Technology Frameworks",
      questions: 7,
      desc: "考纲权重并列最高，也是最容易被低估的一章。考的是「DevOps 与 Agile / Lean / ITSM 的关系」，而不是各框架本身。",
      sections: [
        { n: "4.1", slug: "4.1-framework-landscape", title: "框架全景与彼此关系", status: "done" },
        { n: "4.2", slug: "4.2-agile-scrum", title: "Agile 与 Scrum", status: "done" },
        { n: "4.3", slug: "4.3-lean", title: "Lean 与七种浪费", status: "done" },
        { n: "4.4", slug: "4.4-itsm-itil", title: "ITSM 与 ITIL", status: "done" },
        { n: "4.5", slug: "4.5-safety-culture", title: "安全文化与学习型组织", status: "done" },
        { n: "4.6", slug: "4.6-value-stream-mapping", title: "价值流映射", status: "done" },
        { n: "4.7", slug: "4.7-continuous-funding", title: "持续资金", status: "done" },
        { n: "4.8", slug: "summary", title: "本章总结与练习", status: "done" }
      ]
    },
    {
      id: "ch05", slug: "ch05-culture", num: "5",
      title: "文化、行为与运营模型", titleEn: "Culture, Behaviors & Operating Models",
      questions: 6,
      desc: "DevOps 失败几乎都失败在这里。文化债、行为模型、成熟度模型是本章三根支柱。",
      sections: [
        { n: "5.1", slug: "5.1-defining-culture", title: "什么是组织文化", status: "done" },
        { n: "5.2", slug: "5.2-cultural-debt", title: "文化债", status: "done" },
        { n: "5.3", slug: "5.3-behavioral-models", title: "行为模型", status: "done" },
        { n: "5.4", slug: "5.4-maturity-models", title: "组织成熟度模型", status: "done" },
        { n: "5.5", slug: "5.5-operating-models", title: "运营模型与团队结构", status: "done" },
        { n: "5.6", slug: "summary", title: "本章总结与练习", status: "done" }
      ]
    },
    {
      id: "ch06", slug: "ch06-automation", num: "6",
      title: "自动化与工具链架构", titleEn: "Automation & Architecting DevOps Toolchains",
      questions: 5,
      desc: "部署流水线是主干，IaC、云原生、工具链是支撑。VSM 平台与生成式 AI 用例是 v3.6 新增。",
      sections: [
        { n: "6.1", slug: "6.1-why-automate", title: "自动化的价值与边界", status: "todo" },
        { n: "6.2", slug: "6.2-deployment-pipeline", title: "部署流水线", status: "todo" },
        { n: "6.3", slug: "6.3-iac", title: "基础设施即代码", status: "todo" },
        { n: "6.4", slug: "6.4-cloud-containers-microservices", title: "云、容器与微服务", status: "todo" },
        { n: "6.5", slug: "6.5-toolchain-architecture", title: "DevOps 工具链架构", status: "todo" },
        { n: "6.6", slug: "6.6-vsm-platform-genai", title: "VSM 平台与生成式 AI 用例", status: "todo", tag: "new" },
        { n: "6.7", slug: "summary", title: "本章总结与练习", status: "todo" }
      ]
    },
    {
      id: "ch07", slug: "ch07-metrics", num: "7",
      title: "度量、指标与报告", titleEn: "Measurement, Metrics & Reporting",
      questions: 2,
      desc: "考试只出 2 题，但 DORA 指标是理解整条因果链的枢纽 —— 按理解重要性学，按考试权重分配时间。",
      sections: [
        { n: "7.1", slug: "7.1-why-measure", title: "为什么必须度量", status: "todo" },
        { n: "7.2", slug: "7.2-dora-metrics", title: "DORA 四大指标", status: "todo" },
        { n: "7.3", slug: "7.3-four-metric-families", title: "速度 / 质量 / 稳定性 / 文化", status: "todo" },
        { n: "7.4", slug: "7.4-lead-vs-cycle-time", title: "前置时间 vs 周期时间", status: "todo" },
        { n: "7.5", slug: "7.5-value-driven-metrics", title: "价值驱动指标与看板", status: "todo" },
        { n: "7.6", slug: "7.6-aiops", title: "AIOps", status: "todo", tag: "new" },
        { n: "7.7", slug: "summary", title: "本章总结与练习", status: "todo" }
      ]
    },
    {
      id: "ch08", slug: "ch08-sharing", num: "8",
      title: "分享、跟随与演进", titleEn: "Sharing, Shadowing & Evolving",
      questions: 4,
      desc: "从「团队做 DevOps」到「组织做 DevOps」。角色、领导力、起步方式与关键成功因素。",
      sections: [
        { n: "8.1", slug: "8.1-devops-in-enterprise", title: "企业中的 DevOps", status: "todo" },
        { n: "8.2", slug: "8.2-roles-teams", title: "角色与团队", status: "todo" },
        { n: "8.3", slug: "8.3-leadership", title: "DevOps 领导力", status: "todo" },
        { n: "8.4", slug: "8.4-getting-started", title: "组织考量与如何起步", status: "todo" },
        { n: "8.5", slug: "8.5-challenges-csf", title: "挑战、风险与关键成功因素", status: "todo" },
        { n: "8.6", slug: "summary", title: "本章总结与练习", status: "todo" }
      ]
    },
    {
      id: "ext", slug: "ext", num: "延伸",
      title: "延伸工程实践", titleEn: "Beyond the Syllabus",
      questions: 0,
      isExt: true,
      desc: "真实工程里绕不开、但 DOFD 考纲不覆盖的内容。概念层展开，全部标注「非考纲」。",
      sections: [
        { n: "E1", slug: "e1-gitops", title: "GitOps", status: "todo" },
        { n: "E2", slug: "e2-kubernetes", title: "Kubernetes 与容器编排", status: "todo" },
        { n: "E3", slug: "e3-iac-tools", title: "IaC 工具生态", status: "todo" },
        { n: "E4", slug: "e4-observability-stack", title: "可观测性技术栈", status: "todo" },
        { n: "E5", slug: "e5-supply-chain-security", title: "软件供应链安全", status: "todo" },
        { n: "E6", slug: "e6-team-topologies", title: "Team Topologies", status: "todo" },
        { n: "E7", slug: "e7-finops", title: "FinOps 与平台经济性", status: "todo" }
      ]
    },
    {
      id: "appendix", slug: "appendix", num: "附录",
      title: "附录与复习工具", titleEn: "Appendix & Review",
      questions: 0,
      isAppendix: true,
      desc: "术语表、考纲映射、错题本与模拟考试。",
      sections: [
        { n: "A1", slug: "a1-glossary", title: "术语表（中英对照）", status: "todo" },
        { n: "A2", slug: "a2-acronyms", title: "缩略语速查", status: "todo" },
        { n: "A3", slug: "a3-syllabus-map", title: "考纲映射表", status: "todo" },
        { n: "A4", slug: "a4-sources", title: "官方来源与参考文献", status: "todo" },
        { n: "A5", slug: "a5-wrongbook", title: "错题本", status: "todo" },
        { n: "A6", slug: "a6-mock-exam", title: "模拟考试", status: "todo" }
      ]
    }
  ]
};

/* 派生：考纲章节（参与组卷与权重统计的 8 章） */
window.SYLLABUS.examChapters = window.SYLLABUS.chapters.filter(
  function (c) { return typeof c.questions === "number" && c.questions > 0; }
);
