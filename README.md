# tech-learning-map

一张持续生长的技术学习地图。每个技术体系（认证、框架、工具链）独占一个顶层目录，
内部是一套零依赖、可离线打开的静态学习站：讲透因果关系，而不是罗列考点。

## 🌐 在线访问

**<https://yuntao-tech.github.io/tech-learning-map/>**

打开即用，无需下载。手机、平板、桌面都适配，跟随系统深浅色主题。

## 课程体系

| 目录 | 体系 | 基准 | 在线地址 | 状态 |
|---|---|---|---|---|
| [`devops/`](devops/) | DevOps Foundation® | DOFD v3.6（DevOps Institute / PeopleCert） | [进入学习站](https://yuntao-tech.github.io/tech-learning-map/devops/) | 考纲八章 + 导论 + 附录 A1–A4 已交付 |

后续可扩展的方向：Kubernetes、SRE、ITIL 4、云厂商认证等，各自新建一个顶层目录即可。

## 功能

- **术语弹层**：正文里的英文术语可点。卡片给出中文名、音标、🔊 朗读、中文定义、
  英文母语者释义；组合词还能「逐词看」——每个成分词的读音与中英释义。
  「逐词看」按日常含义 / 词源 / 到了计算机里 / 常见误读 / 同源词分区，
  另有「词源与推导」给出字面拆解、词素拆解与编号推导链。默认收起
  —— 本站学的是知识体系，不是英语。
- **悬浮检索**：右下角 🔍，或按 `/` / `Ctrl+K` 唤起。中文、英文、缩写都能联想，
  ↑↓ 选择、Enter 打开同一张卡片。

## 本地使用

各体系都是纯静态站点，零依赖、零构建、无 CDN，`file://` 下功能完整。
克隆或下载后双击即可，**断网也能用**：

```bash
open devops/index.html
```

需要本地服务器时（可选，在仓库根目录执行后访问 <http://localhost:8000/>）：

```bash
python3 -m http.server 8000
```

## 目录约定

新增一个技术体系时，在根目录建同名目录，内部结构保持一致：

```
tech-learning-map/
├── index.html      # 全站落地页：课程体系索引
├── .nojekyll       # 关闭 GitHub Pages 的 Jekyll 处理，静态文件原样发布
└── <体系目录>/
    ├── index.html  # 该体系的首页：知识地图 · 权重 · 学习路径
    ├── assets/     # css / js / vendor，仅供本体系使用
    ├── content/    # 章节正文，按章分目录
    ├── data/       # 考纲结构、题库等唯一数据源
    ├── tools/      # 可选维护脚本（站点本身不依赖）
    ├── docs/       # 项目规划、写作规范、进度与交接
    └── README.md   # 该体系的说明与认证基准
```

各体系互不共享资源，可以独立复制、独立演进。规划与写作规范放在各自的 `docs/` 下，
不上提到根目录 —— 不同体系的写作契约不一定通用。

新增体系后记得两处登记：根 `index.html` 的卡片列表、以及上面的课程体系表格。

## 发布说明

推送到 `main` 分支后 GitHub Pages 自动发布，通常一到两分钟生效。
根目录的 `.nojekyll` 让 Pages 跳过 Jekyll 构建，直接按原样提供静态文件 ——
站点是手写 HTML，不需要 Jekyll，跳过它也避免了正文里出现 `{{` `{%` 等
模板语法时被误解析导致构建失败。

## 参与贡献

欢迎勘误、补写延伸章节、出练习题，或者新增一个技术体系。流程和写作规范见
[CONTRIBUTING.md](CONTRIBUTING.md)：小改动直接提 PR，大改动请先开 issue 商量。

## 许可

- **内容**（正文、自制配图、题目与数据）：© 2026 yuntao-tech，以 [CC BY 4.0](LICENSE) 发布。
  可以自由转载、改编、商用，按许可要求署名即可。
- **代码**（各体系目录下 `assets/` 中的 JS 与 CSS、`tools/` 中的脚本）：[MIT](LICENSE-CODE)。
- **第三方数据**：术语弹层的部分音标与中文释义取自 ECDICT（MIT），见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
- **官方材料**：站内引用的官方原文、术语与考纲条目，版权归 DevOps Institute / PeopleCert 所有，
  不在上述许可范围内。DevOps Foundation® 是 DevOps Institute / PeopleCert 的注册商标。
