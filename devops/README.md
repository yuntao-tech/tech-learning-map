# DevOps Foundation (DOFD v3.6) 体系化学习站

面向 **DevOps Institute / PeopleCert 的 DevOps Foundation® (DOFD) v3.6** 认证的中文学习资料。
目标不是背题，而是建立一张能自我解释的 DevOps 知识地图。

## 在线访问

**<https://yuntao-tech.github.io/tech-learning-map/devops/>**

打开即用，无需下载。本仓库还收录了其他技术体系，总索引见
<https://yuntao-tech.github.io/tech-learning-map/>。

## 快速开始

```bash
open index.html
```

零依赖、零构建、无 CDN。双击 `index.html` 即可使用，`file://` 下全部功能正常。

需要本地服务器时（可选）：

```bash
python3 -m http.server 8000
```

## 认证基准（本项目的唯一考纲依据）

| 项 | 内容 |
|---|---|
| 认证 | DevOps Foundation® (DOFD) |
| 发证 | DevOps Institute / PeopleCert |
| 现行版本 | **v3.6**（2024-10 大更新；2025-02-03 小修订，将考试形式更正为开卷） |
| 题量 / 时长 | 40 道单选 / 60 分钟 |
| 及格 | 65%（26 / 40） |
| 开卷 | **是**，但仅限官方 Learner Workbook 与 Quick Reference Guide |
| 认知层级 | Bloom 1–2（记忆与理解） |
| 前置 | 无正式前置，官方建议 16 学时 |
| 有效期 | 3 年，需 60 CPD 分续证 |

### ⚠️ 开卷提醒

本站**不能带进考场**。考试只允许携带官方教材。本站的作用是把考纲背后的因果关系讲透，
让你在考场上不需要翻书；如果你购买了官方 Learner Workbook，本站还可作为它的理解补充与练习平台。

### 知识域与题数分布

| # | 知识域 | 最多题数 |
|---|---|---|
| 1 | Exploring DevOps 认识 DevOps | 5 |
| 2 | Core DevOps Principles 核心原则 | 4 |
| 3 | Key DevOps Practices 关键实践 | 7 |
| 4 | Business & Technology Frameworks 业务与技术框架 | 7 |
| 5 | Culture, Behaviors & Operating Models 文化、行为与运营模型 | 6 |
| 6 | Automation & Architecting DevOps Toolchains 自动化与工具链 | 5 |
| 7 | Measurement, Metrics & Reporting 度量、指标与报告 | 2 |
| 8 | Sharing, Shadowing & Evolving 分享、跟随与演进 | 4 |
| | **合计** | **40** |

> **来源与版本说明**：上表出自 DevOps Institute《DevOps Foundation® Exam Study Guide》**v3.4**（2022-05）的
> Examination Requirements —— “Exam Topic Areas and Question Weighting”。
> **v3.6 未公开重新发布权重表**；但 v3.6 的模块结构与 PeopleCert 现行产品页公布的八条学习目标一一对应，
> 说明结构未变，因此沿用该分布，并在全站标注版本来源。
>
> 另需澄清：PeopleCert 官网可下载的 “Certification Blueprint” 是**一页概览海报**
> （CALMS / Three Ways / Related Frameworks / Benefits），**不是**带权重的考试大纲。

## 来源与准确性纪律

本项目对「什么是官方、什么是补充」保持严格区分：

| 标注 | 含义 |
|---|---|
| ⭐ 考纲核心 | v3.4 官方文件明确列出的术语或学习目标 |
| 🆕 v3.6 新增 | PeopleCert 现行页面新增、v3.4 未有：可观测性、平台工程、VSM、生成式 AI、AIOps |
| 🧭 延伸 · 非考纲 | 真实工程实践，考试不涉及（GitOps、Kubernetes、Terraform 等） |
| ⚠️ 易混淆 | 有专门的对比条目 |
| 📌 高频 | 官方样题中反复出现的考点 |

四条硬规则：

1. **推断必须写成推断**，绝不包装成官方口径。
2. **权重表永远带版本标注**。
3. **不复制官方样题原文**。DevOps Institute 的官方样题受版权保护，仅用于校准命题风格与难度分布；
   本站所有题目自主命制，并标注「仿真题，非官方真题」。
4. **延伸内容不混入考纲正文**，一律带 🧭 徽章单独成章。

## 目录结构

```
.
├── index.html              # 首页：全局知识地图 · 权重 · 学习路径
├── assets/
│   ├── css/                # tokens(设计令牌) / base(排版骨架) / components(组件) / print(打印)
│   ├── js/                 # nav(导航) / progress(进度) / quiz / wrongbook / exam
│   └── vendor/             # 本地化第三方库（Mermaid，按需）
├── content/
│   ├── ch00-overview/ … ch08-sharing/    # 八大知识域 + 导论
│   ├── ext/                # 延伸工程实践（非考纲）
│   └── appendix/           # 术语表 · 考纲映射 · 错题本 · 模拟考试
├── data/
│   ├── syllabus.js         # 考纲结构（导航与组卷的唯一数据源）
│   └── questions/          # 题库
├── tools/                  # 可选维护脚本（站点不依赖）
└── docs/00-项目规划/       # 阶段计划与内容规范
```

## 如何扩充

1. **加一个小节**：在 `data/syllabus.js` 对应章节的 `sections` 里加一条，
   再在 `content/<章目录>/` 下新建同名 `.html`（复制任一已完成小节作模板），
   把该条的 `status` 改成 `"done"`。侧栏、上下页、进度统计会自动生效。
2. **加一章**：在 `data/syllabus.js` 的 `chapters` 里加一项，然后运行
   `node tools/gen-chapter-index.mjs` 生成章骨架页（该脚本只创建缺失文件，不覆盖已有内容）。
3. **改配色 / 字号**：只改 `assets/css/tokens.css`，全站生效，明暗两套主题都已定义。
4. **加题目**：在 `data/questions/` 下按章添加，格式见 P2 阶段交付的说明。

## 建设进度

**66 / 75 节完成（88%）· 考纲八章全部交付 · 考试权重覆盖 40/40 题**

- [x] **P0** 骨架与设计系统
- [x] **P1** 内容主干：导论 + 考纲八章（58 节）
- [x] **P3a** 附录 A1–A4：术语表（官方 67 条）、缩略语、考纲映射表、官方来源
- [ ] **P3b** 延伸 ext E1–E7：GitOps / Kubernetes / IaC 工具 / 可观测性技术栈 / 供应链安全 / Team Topologies / FinOps
- [ ] **P2** 练习系统：分章题库、练习引擎、错题本（附录 A5）
- [ ] **P4** 模拟考试：按 5/4/7/7/6/5/2/4 组卷、计时、按域拆分成绩（附录 A6）

| 章 | 知识点 | 知识面 | 自制 SVG | 中文正文 |
|---|---|---|---|---|
| 导论 | 0 | 0 | 9 | 16,710 |
| 第 1 章 认识 DevOps | 12 | 72 | 16 | 35,786 |
| 第 2 章 核心原则 | 21 | 126 | 25 | 45,620 |
| 第 3 章 关键实践 | 29 | 174 | 34 | 78,708 |
| 第 4 章 业务与技术框架 | 21 | 126 | 25 | 61,896 |
| 第 5 章 文化、行为与运营模型 | 15 | 90 | 22 | 49,854 |
| 第 6 章 自动化与工具链架构 | 18 | 108 | 22 | 57,691 |
| 第 7 章 度量、指标与报告 | 18 | 108 | 21 | 57,888 |
| 第 8 章 分享、跟随与演进 | 15 | 90 | 19 | 48,426 |
| 附录 A1–A4 | 0 | 0 | 5 | 15,385 |
| **合计** | **149** | **894** | **198** | **467,964** |

全站机械审计 0 问题（六面完整性、SVG 硬编码色、标签配平、死链、徽章合法性、图号格式等）。
SVG 文字在明暗两主题下对比度均 ≥ 4.5:1（WCAG AA）。

> **当前尚不可用**：练习题、错题本、模拟考试（侧栏标「建设中」）。
> 自测替代方案：各章总结页的「⭐ 一分钟回忆清单」与「易混淆汇总表」。

进度详情、剩余工作与开工须知见 [docs/00-项目规划/06-进度与交接.md](docs/00-项目规划/06-进度与交接.md)。

## 免责声明

本项目是个人学习资料，与 DevOps Institute、PeopleCert 无任何隶属或背书关系。
DevOps Foundation® 是 DevOps Institute / PeopleCert 的注册商标。
考试形式、权重与内容请以官方最新发布为准。
