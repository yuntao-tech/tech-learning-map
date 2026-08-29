/* ============================================================
   可选维护脚本：为 data/syllabus.js 中尚无 index.html 的章节生成骨架页
   —— 只创建缺失文件，绝不覆盖已有内容。
   用法： node tools/gen-chapter-index.mjs
   站点本身不依赖此脚本，纯静态即可运行。
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
globalThis.window = {};
new Function(fs.readFileSync(path.join(root, "data/syllabus.js"), "utf8"))();
const S = globalThis.window.SYLLABUS;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

function page(ch) {
  const isPlain = ch.isExt || ch.isAppendix;
  const kicker = isPlain ? ch.title : `第 ${ch.num} 章`;
  const pct = ch.questions ? Math.round((ch.questions / 40) * 100) : 0;

  const stats = ch.questions
    ? `    <div class="stats">
      <div class="stat"><div class="stat__v">${ch.questions}</div><div class="stat__k">本章最多题数</div></div>
      <div class="stat"><div class="stat__v">${pct}%</div><div class="stat__k">占全卷比重</div></div>
      <div class="stat"><div class="stat__v">${ch.sections.length}</div><div class="stat__k">小节数</div></div>
    </div>

    <div class="src-note">题数来源：DOFD v3.4 Examination Requirements（2022-05）。v3.6 未公开重新发布权重表，详见首页「来源与准确性纪律」。</div>
`
    : "";

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(isPlain ? ch.title : `第 ${ch.num} 章 ${ch.title}`)} · DevOps Foundation 学习站</title>
<meta name="description" content="${esc(ch.desc)}">
<script>try{var t=localStorage.getItem('dofd:theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}</script>
<link rel="stylesheet" href="../../assets/css/tokens.css">
<link rel="stylesheet" href="../../assets/css/base.css">
<link rel="stylesheet" href="../../assets/css/components.css">
<link rel="stylesheet" href="../../assets/css/print.css">
<script>window.SITE_BASE="../../"; window.PAGE={ch:"${ch.id}"};</script>
</head>
<body>

<header class="topbar">
  <button class="topbar__btn menu-toggle" id="menuToggle" aria-label="切换目录">☰</button>
  <a class="topbar__brand" href="../../index.html">
    <svg class="topbar__mark" viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="14" class="s-1" stroke-width="2" fill="none"/>
      <path d="M16 4a12 12 0 0 1 0 24" class="s-2" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="16" cy="16" r="4.5" class="f-1"/>
    </svg>
    <span>DevOps Foundation 学习站</span>
    <span class="topbar__ver">DOFD v3.6</span>
  </a>
  <span class="topbar__spacer"></span>
  <button class="topbar__btn" id="themeToggle" aria-label="切换主题">◑</button>
</header>

<div class="layout">
  <nav class="sidebar" id="sidebar" aria-label="目录"></nav>
  <main class="main">
  <div class="page">

    <div class="crumbs" id="crumbs"></div>

    <div class="page-head">
      <div class="page-head__kicker">${esc(kicker)}</div>
      <h1 class="page-head__title">${esc(ch.title)}</h1>
      <div class="page-head__en">${esc(ch.titleEn)}</div>
      <p class="page-head__lede">${esc(ch.desc)}</p>
    </div>

${stats}
    <h2>本章小节</h2>
    <ul id="chSections"></ul>

    <div class="callout callout--info no-print">
      <div class="callout__title">📖 本章进度</div>
      <p class="mb-0" id="chProgress">正在读取考纲数据…</p>
    </div>

    <div id="pager" class="pager"></div>
  </div>
  </main>
</div>

<script src="../../data/syllabus.js"></script>
<script src="../../assets/js/nav.js"></script>
<script src="../../assets/js/progress.js"></script>
</body>
</html>
`;
}

let created = 0, skipped = 0;
for (const ch of S.chapters) {
  const dir = path.join(root, "content", ch.slug);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "index.html");
  if (fs.existsSync(file)) { skipped++; continue; }
  fs.writeFileSync(file, page(ch), "utf8");
  created++;
}
console.log(`章节骨架页：新建 ${created} 个，跳过已存在 ${skipped} 个`);
