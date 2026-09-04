/* 术语弹层
   正文里的 <span class="en"> 命中 window.GLOSSARY 后变为可点，弹出该术语的
   「中文名 / 一句话定义 / 徽章 / 去哪一节学」。日常义与词源属于英语层，
   本站学的是知识体系，所以折进「更多」，默认收起。
   纯 DOM，无 fetch，双击 index.html 直接可用。 */
(function () {
  "use strict";
  var G = window.GLOSSARY;
  if (!G) return;

  var BASE = window.SITE_BASE || "";
  var PAGE = window.PAGE || {};
  var BADGE = {
    core: "⭐ 考纲核心", hot: "📌 高频",
    warn: "⚠️ 易混淆", "new": "🆕 v3.6 新增",
    ext: "🧭 延伸 · 非考纲",
    note: "📝 教学整理", plain: "📘 官方模块子项"
  };
  var BADGE_CLS = {
    core: "badge--core", hot: "badge--hot", warn: "badge--warn",
    "new": "badge--new", ext: "badge--ext", note: "badge--note", plain: "badge--plain"
  };

  function norm(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }

  /* 先整串匹配；不中再按 / 和 · 拆开逐段试——知识点标题常把几个术语并列写在一行 */
  function lookup(text) {
    var k = norm(text);
    if (G[k]) return G[k];
    var parts = text.split(/\s*\/\s*|\s*·\s*/);
    for (var i = 0; i < parts.length; i++) {
      var e = G[norm(parts[i])];
      if (e) return e;
    }
    return null;
  }

  var pop = null, current = null;

  function close() {
    if (pop) pop.hidden = true;
    if (current) { current.setAttribute("aria-expanded", "false"); current = null; }
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function row(k, v, italic) {
    var r = el("div", "gloss__row");
    r.appendChild(el("span", "gloss__k", k));
    r.appendChild(el("span", "gloss__v" + (italic ? " gloss__ex" : ""), v));
    return r;
  }

  function build(entry, trigger) {
    pop.textContent = "";

    var x = el("button", "gloss__close", "×");
    x.setAttribute("aria-label", "关闭");
    x.addEventListener("click", close);
    pop.appendChild(x);

    var head = el("div", "gloss__head");
    head.appendChild(el("span", "gloss__zh", entry.zh || entry.en));
    if (entry.en && entry.en !== entry.zh) head.appendChild(el("span", "gloss__en", entry.en));
    if (entry.abbr && entry.abbr !== entry.en) head.appendChild(el("span", "gloss__abbr", entry.abbr));
    pop.appendChild(head);

    if (entry.badges && entry.badges.length) {
      var br = el("div", "gloss__badges badge-row");
      entry.badges.forEach(function (b) {
        if (!BADGE[b]) return;
        br.appendChild(el("span", "badge " + BADGE_CLS[b], BADGE[b]));
      });
      if (br.childNodes.length) pop.appendChild(br);
    }

    if (entry.definition) pop.appendChild(el("p", "gloss__def", entry.definition));
    else if (entry.expansion) pop.appendChild(el("p", "gloss__def", entry.expansion));

    /* 英语层：日常义 / 字面 / 词源 / 易错点。次要内容，默认收起 */
    var m = entry.more;
    if (m && (m.dailyZh || m.literal || m.etymology || m.pitfall)) {
      var btn = el("button", "gloss__more-btn", "日常英语里的它");
      btn.setAttribute("aria-expanded", "false");
      var box = el("div", "gloss__more");
      box.hidden = true;

      if (m.dailyZh) box.appendChild(row("日常义", m.dailyZh));
      if (m.dailyEx) {
        box.appendChild(row("例", m.dailyEx + (m.dailyExZh ? "　" + m.dailyExZh : ""), true));
      }
      if (m.literal) box.appendChild(row("字面", m.literal.replace(/^字面：|^本义：/, "")));
      if (m.etymology) box.appendChild(row("词源", m.etymology));
      if (m.pitfall) box.appendChild(row("易错", m.pitfall));

      btn.addEventListener("click", function () {
        var open = box.hidden;
        box.hidden = !open;
        btn.setAttribute("aria-expanded", String(open));
        place(trigger);
      });
      pop.appendChild(btn);
      pop.appendChild(box);
    }

    /* 去哪一节学。指向本页自己就不显示——原地打转没意义 */
    if (entry.href) {
      var here = PAGE.sec && entry.href.indexOf(PAGE.sec + ".html") >= 0;
      if (!here) {
        var a = el("a", "gloss__go", "去这一节学 →");
        a.href = BASE + entry.href + (entry.kp ? "#" + entry.kp : "");
        pop.appendChild(a);
      }
    }
  }

  function place(trigger) {
    /* 窄屏走贴底抽屉，交给 CSS。必须清掉上一次桌面定位留下的内联样式，
       否则内联的 left/top 会盖住样式表里的 left:0;right:0;bottom:0。 */
    if (window.matchMedia("(max-width: 640px)").matches) {
      pop.style.left = ""; pop.style.top = "";
      return;
    }
    var r = trigger.getBoundingClientRect();
    var sx = window.pageXOffset, sy = window.pageYOffset;
    pop.style.top = "0px"; pop.style.left = "0px";
    var w = pop.offsetWidth, h = pop.offsetHeight;
    var left = r.left + sx;
    var max = sx + document.documentElement.clientWidth - w - 12;
    if (left > max) left = max;
    if (left < sx + 12) left = sx + 12;
    /* 下方放不下就翻到上方 */
    var top = (r.bottom + h + 16 > document.documentElement.clientHeight && r.top > h + 16)
      ? r.top + sy - h - 8 : r.bottom + sy + 8;
    pop.style.left = left + "px";
    pop.style.top = top + "px";
  }

  function open(trigger, entry) {
    if (current === trigger && !pop.hidden) { close(); return; }
    close();
    build(entry, trigger);
    pop.hidden = false;
    place(trigger);
    current = trigger;
    trigger.setAttribute("aria-expanded", "true");
  }

  function init() {
    /* 附录 A1/A2 本身就是术语表，再给每格加弹层是噪音 */
    if (PAGE.ch === "appendix") return;

    var scope = document.querySelector(".main") || document.body;
    var spans = scope.querySelectorAll("span.en");
    var n = 0;

    for (var i = 0; i < spans.length; i++) {
      var s = spans[i];
      if (s.closest("a")) continue;               /* 已经是链接，不抢点击 */
      var entry = lookup(s.textContent || "");
      if (!entry) continue;
      if (!entry.definition && !entry.expansion && !entry.more) continue;

      s.classList.add("en--term");
      s.setAttribute("tabindex", "0");
      s.setAttribute("role", "button");
      s.setAttribute("aria-expanded", "false");
      s.setAttribute("title", (entry.zh || "") + "　点击查看");
      (function (node, e) {
        node.addEventListener("click", function (ev) { ev.stopPropagation(); open(node, e); });
        node.addEventListener("keydown", function (ev) {
          if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); ev.stopPropagation(); open(node, e); }
        });
      })(s, entry);
      n++;
    }

    if (!n) return;

    pop = el("div", "gloss");
    pop.hidden = true;
    pop.setAttribute("role", "dialog");
    pop.setAttribute("aria-label", "术语释义");
    pop.addEventListener("click", function (ev) { ev.stopPropagation(); });
    document.body.appendChild(pop);

    document.addEventListener("click", close);
    document.addEventListener("keydown", function (ev) { if (ev.key === "Escape") close(); });
    window.addEventListener("resize", close);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
