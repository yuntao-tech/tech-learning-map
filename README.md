# DevOps Foundation (DOFD v3.6) 体系化学习站

面向 **DevOps Institute / PeopleCert 的 DevOps Foundation® (DOFD) v3.6** 认证的中文学习资料。
目标不是背题，而是建立一张能自我解释的 DevOps 知识地图。

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

- [x] **P0** 骨架与设计系统：设计令牌、组件库、站点框架、考纲数据、全局知识地图
- [ ] **P1** 内容主干：ch00 + ch01–ch08 的知识点正文与图表 —— **进行中，已完成 8 / 75 节**
      - [x] **第 2 章 核心原则 全章完成**（2.1–2.8，21 个知识点 · 126 个知识面 · 19 张自制 SVG）
- [ ] **P2** 练习系统：分章题库、练习引擎、错题本
- [ ] **P3** 延伸章节与附录：术语表、考纲映射表
- [ ] **P4** 模拟考试与复习闭环

## 免责声明

本项目是个人学习资料，与 DevOps Institute、PeopleCert 无任何隶属或背书关系。
DevOps Foundation® 是 DevOps Institute / PeopleCert 的注册商标。
考试形式、权重与内容请以官方最新发布为准。
