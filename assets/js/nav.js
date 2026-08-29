/* ============================================================
   导航 · 侧栏 / 面包屑 / 上下页 / 主题切换 / 移动端抽屉
   依赖：data/syllabus.js，页面需先声明 window.SITE_BASE 与 window.PAGE
   ============================================================ */
(function () {
  "use strict";

  var BASE = window.SITE_BASE || "";
  var PAGE = window.PAGE || {};
  var S = window.SYLLABUS;
  if (!S) { console.error("[nav] 未找到 window.SYLLABUS"); return; }

  /* ---------- 路径工具 ---------- */
  function chHref(ch) { return BASE + "content/" + ch.slug + "/index.html"; }
  function secHref(ch, sec) { return BASE + "content/" + ch.slug + "/" + sec.slug + ".html"; }

  /* ---------- 扁平页面序列（供上下页使用） ---------- */
  var flat = [{ href: BASE + "index.html", label: "首页", sub: "全局知识地图", key: "home" }];
  S.chapters.forEach(function (ch) {
    flat.push({ href: chHref(ch), label: "第 " + ch.num + " 章 · " + ch.title, sub: ch.titleEn, key: ch.id });
    ch.sections.forEach(function (sec) {
      flat.push({
        href: secHref(ch, sec),
        label: sec.n + " " + sec.title,
        sub: "第 " + ch.num + " 章",
        key: ch.id + "/" + sec.slug,
        status: sec.status
      });
    });
  });

  function currentKey() {
    if (PAGE.home) return "home";
    if (PAGE.ch && PAGE.sec) return PAGE.ch + "/" + PAGE.sec;
    if (PAGE.ch) return PAGE.ch;
    return "home";
  }
  var CUR = currentKey();

  /* ---------- 侧栏 ---------- */
  function renderSidebar() {
    var host = document.getElementById("sidebar");
    if (!host) return;
    var html = '<div class="sidebar__title">DOFD ' + S.meta.version + " 考纲</div>";

    html += '<div class="nav-ch"><a class="nav-ch__link' + (CUR === "home" ? " is-active" : "") +
            '" href="' + BASE + 'index.html"><span class="nav-ch__num">◎</span><span>全局知识地图</span></a></div>';

    S.chapters.forEach(function (ch, i) {
      if (ch.isExt) html += '<div class="sidebar__title">考纲之外</div>';
      if (ch.isAppendix) html += '<div class="sidebar__title">附录与复习</div>';

      var chActive = CUR === ch.id;
      var inChapter = CUR.indexOf(ch.id + "/") === 0 || chActive;
      html += '<div class="nav-ch"><a class="nav-ch__link' + (chActive ? " is-active" : "") +
              '" href="' + chHref(ch) + '"><span class="nav-ch__num">' + ch.num +
              '</span><span>' + ch.title + "</span></a>";
      html += '<ul class="nav-sec">';
      ch.sections.forEach(function (sec) {
        var key = ch.id + "/" + sec.slug;
        var label = '<span class="nav-sec__n">' + sec.n + "</span> " + sec.title;
        if (sec.status === "todo") {
          html += "<li><span class=\"is-todo\">" + label + "</span></li>";
        } else {
          html += '<li><a class="' + (CUR === key ? "is-active" : "") + '" href="' +
                  secHref(ch, sec) + '">' + label + "</a></li>";
        }
      });
      html += "</ul></div>";
      // 展开策略：全部展开（Foundation 体量不大，全展开比折叠更好用）
      void inChapter; void i;
    });

    host.innerHTML = html;
    // 仅当激活项不在侧栏可视区内时才滚动，且只滚侧栏自身，不影响页面滚动位置
    var active = host.querySelector(".is-active");
    if (active) {
      var aTop = active.offsetTop, aBot = aTop + active.offsetHeight;
      if (aTop < host.scrollTop || aBot > host.scrollTop + host.clientHeight) {
        host.scrollTop = Math.max(0, aTop - host.clientHeight / 2);
      }
    }
  }

  /* ---------- 上下页 ---------- */
  function renderPager() {
    var host = document.getElementById("pager");
    if (!host) return;
    // 只在已完成的页面之间跳转
    var usable = flat.filter(function (p) { return p.status !== "todo"; });
    var idx = -1;
    usable.forEach(function (p, i) { if (p.key === CUR) idx = i; });
    if (idx < 0) return;
    var prev = usable[idx - 1], next = usable[idx + 1];
    var html = "";
    if (prev) html += '<a class="pager--prev" href="' + prev.href + '"><span class="pager__dir">← 上一节</span><span class="pager__name">' + prev.label + "</span></a>";
    if (next) html += '<a class="pager--next" href="' + next.href + '"><span class="pager__dir">下一节 →</span><span class="pager__name">' + next.label + "</span></a>";
    host.innerHTML = html;
  }

  /* ---------- 章节页：小节列表（运行时渲染，避免静态列表与考纲数据脱节） ---------- */
  function renderChapterSections() {
    var host = document.getElementById("chSections");
    if (!host || !PAGE.ch || PAGE.sec) return;
    var ch = S.chapters.filter(function (c) { return c.id === PAGE.ch; })[0];
    if (!ch) return;
    host.innerHTML = ch.sections.map(function (sec) {
      var tag = sec.tag === "new" ? ' <span class="badge badge--new">🆕 v3.6 新增</span>' : "";
      if (sec.status === "done") {
        return '<li><a href="' + sec.slug + '.html"><strong>' + sec.n + "</strong> " + sec.title + "</a>" + tag + "</li>";
      }
      return '<li class="muted"><strong>' + sec.n + "</strong> " + sec.title + tag +
             ' <span class="badge badge--plain">建设中</span></li>';
    }).join("");

    // 本章完成度提示
    var done = ch.sections.filter(function (s2) { return s2.status === "done"; }).length;
    var note = document.getElementById("chProgress");
    if (note) {
      note.textContent = done === 0
        ? "本章内容建设中，骨架与考纲权重已就位。"
        : "本章已完成 " + done + " / " + ch.sections.length + " 节。";
    }
  }

  /* ---------- 面包屑 ---------- */
  function renderCrumbs() {
    var host = document.getElementById("crumbs");
    if (!host || PAGE.home) return;
    var ch = S.chapters.filter(function (c) { return c.id === PAGE.ch; })[0];
    if (!ch) return;
    var html = '<a href="' + BASE + 'index.html">首页</a><span>/</span>';
    if (PAGE.sec) {
      html += '<a href="' + chHref(ch) + '">' + (ch.isExt || ch.isAppendix ? ch.title : "第 " + ch.num + " 章 " + ch.title) + "</a>";
    } else {
      html += (ch.isExt || ch.isAppendix ? ch.title : "第 " + ch.num + " 章 " + ch.title);
    }
    host.innerHTML = html;
  }

  /* ---------- 主题 ---------- */
  function initTheme() {
    var btn = document.getElementById("themeToggle");
    if (!btn) return;
    function label() {
      var t = document.documentElement.getAttribute("data-theme");
      btn.textContent = t === "dark" ? "☀︎ 亮色" : t === "light" ? "☾ 暗色" : "◑ 跟随系统";
    }
    label();
    btn.addEventListener("click", function () {
      var order = ["", "light", "dark"];
      var cur = document.documentElement.getAttribute("data-theme") || "";
      var next = order[(order.indexOf(cur) + 1) % order.length];
      if (next) {
        document.documentElement.setAttribute("data-theme", next);
        try { localStorage.setItem("dofd:theme", next); } catch (e) { /* noop */ }
      } else {
        document.documentElement.removeAttribute("data-theme");
        try { localStorage.removeItem("dofd:theme"); } catch (e) { /* noop */ }
      }
      label();
    });
  }

  /* ---------- 移动端抽屉 ---------- */
  function initDrawer() {
    var btn = document.getElementById("menuToggle");
    var sb = document.getElementById("sidebar");
    if (!btn || !sb) return;
    btn.addEventListener("click", function () { sb.classList.toggle("is-open"); });
    document.addEventListener("click", function (e) {
      if (window.innerWidth > 1040) return;
      if (sb.contains(e.target) || btn.contains(e.target)) return;
      sb.classList.remove("is-open");
    });
  }

  function boot() {
    renderSidebar(); renderChapterSections(); renderPager(); renderCrumbs(); initTheme(); initDrawer();
    document.dispatchEvent(new CustomEvent("nav:ready"));
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
