/* 术语弹层 + 悬浮检索
   ① 正文里的 <span class="en"> 命中 window.GLOSSARY 后变为可点，弹出术语卡片。
   ② 右下角悬浮检索：输入中文名 / 英文 / 缩写都能联想，选中后弹同一张卡片。
   卡片含音标与朗读按钮——发音是学的一部分，读音不能只靠猜。
   日常义与词源属于英语层，本站学的是知识体系，折进「更多」默认收起。
   纯 DOM，无 fetch，双击 index.html 直接可用。 */
(function () {
  "use strict";
  var G = window.GLOSSARY;
  var GW = window.GLOSSARY_WORDS || {};
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

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* ── 朗读 ────────────────────────────────────────────────
     Web Speech API 是浏览器内置的，不联网、无依赖、file:// 下也能用。
     声音列表在部分浏览器里是异步加载的，所以每次读之前重新取一遍。 */
  var TTS = window.speechSynthesis || null;
  var voice = null;

  /* macOS 的英语声音列表开头全是玩具音（Albert、Bad News、Boing、Bubbles…），
     直接取第一个会拿到 Albert——学发音的人跟着它读就毁了。所以先按名字白名单挑，
     再退回系统默认声音，最后才是「排除玩具音后的任意一个」。 */
  var GOOD_VOICES = ["samantha", "alex", "ava", "allison", "susan", "aaron", "nicky",
                     "google us english", "microsoft aria", "microsoft jenny",
                     "microsoft guy", "microsoft zira", "microsoft david"];
  var NOVELTY = /albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|junior|kathy|organ|princess|ralph|superstar|trinoids|whisper|wobble|zarvox|fred|grandma|grandpa|rocko|shelley/i;

  function pickVoice() {
    if (!TTS) return null;
    var vs = TTS.getVoices() || [];
    var en = [];
    for (var i = 0; i < vs.length; i++) if (/^en/i.test(vs[i].lang)) en.push(vs[i]);
    if (!en.length) return null;

    for (var g = 0; g < GOOD_VOICES.length; g++) {
      for (var j = 0; j < en.length; j++) {
        if (en[j].name.toLowerCase().indexOf(GOOD_VOICES[g]) >= 0) return en[j];
      }
    }
    var clean = [];
    for (var k = 0; k < en.length; k++) if (!NOVELTY.test(en[k].name)) clean.push(en[k]);
    for (var d = 0; d < clean.length; d++) if (clean[d]["default"]) return clean[d];
    for (var u = 0; u < clean.length; u++) if (/^en[-_]US/i.test(clean[u].lang)) return clean[u];
    return clean[0] || null;
  }

  /* 复合标题（「A · B」「A / B」）只读第一个术语，整串读出来没意义 */
  function speakable(en) {
    return String(en || "").split(/\s*·\s*|\s*\/\s*|\s*→\s*/)[0].replace(/\s*[（(].*$/, "").trim();
  }

  function speak(text, btn) {
    if (!TTS) return;
    try {
      TTS.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 0.85;              /* 放慢一点，便于跟读 */
      if (!voice) voice = pickVoice();
      if (voice) u.voice = voice;
      if (btn) {
        btn.classList.add("is-speaking");
        u.onend = u.onerror = function () { btn.classList.remove("is-speaking"); };
      }
      TTS.speak(u);
    } catch (e) { /* 浏览器不支持就静默跳过，音标仍在 */ }
  }

  /* ── 卡片 ────────────────────────────────────────────────── */
  var pop = null, current = null;

  function close() {
    if (pop) pop.hidden = true;
    if (current) { current.setAttribute("aria-expanded", "false"); current = null; }
    if (TTS) { try { TTS.cancel(); } catch (e) {} }
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

    /* 发音：音标只有能查证的才给（约三成），朗读按钮则始终可用 */
    var say = speakable(entry.en);
    if (entry.ipa || (TTS && say)) {
      var pr = el("div", "gloss__pron");
      if (entry.ipa) pr.appendChild(el("span", "gloss__ipa", entry.ipa));
      if (TTS && say) {
        var sp = el("button", "gloss__say", "🔊");
        sp.type = "button";
        sp.title = "朗读 " + say;
        sp.setAttribute("aria-label", "朗读 " + say);
        sp.addEventListener("click", function (ev) { ev.stopPropagation(); speak(say, sp); });
        pr.appendChild(sp);
        if (!entry.ipa) pr.appendChild(el("span", "gloss__pron-note", "点喇叭听读音"));
      }
      pop.appendChild(pr);
    }

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

    /* 英文母语者写的释义。中文说「是什么」，英文让你看见母语者怎么描述它 */
    if (entry.defEn) pop.appendChild(el("p", "gloss__defen", entry.defEn));

    /* 组合词逐词拆解：每个成分词的读音 + 中文义 + 英文释义。
       这是组合词最该给的东西——读者认得每个词，却不知道它们各自在这儿是什么意思。 */
    var ps = entry.parts || [];
    if (ps.length >= 2) {
      var pbtn = el("button", "gloss__more-btn", "逐词看（" + ps.length + "）");
      pbtn.type = "button";
      pbtn.setAttribute("aria-expanded", "false");
      var pbox = el("div", "gloss__parts");
      pbox.hidden = true;

      ps.forEach(function (key) {
        var w = GW[key];
        if (!w) return;
        var item = el("div", "gloss__part");
        var h = el("div", "gloss__part-head");
        h.appendChild(el("span", "gloss__part-w", key));
        if (w.lemma) h.appendChild(el("span", "gloss__part-lemma", "→ " + w.lemma));
        if (w.ipa) h.appendChild(el("span", "gloss__ipa", w.ipa));
        if (TTS) {
          var b = el("button", "gloss__say gloss__say--sm", "🔊");
          b.type = "button";
          b.title = "朗读 " + key;
          b.setAttribute("aria-label", "朗读 " + key);
          b.addEventListener("click", function (ev) { ev.stopPropagation(); speak(key, b); });
          h.appendChild(b);
        }
        item.appendChild(h);
        if (w.zh) item.appendChild(el("div", "gloss__part-zh", w.zh));
        if (w.en) item.appendChild(el("div", "gloss__part-en", w.en));
        pbox.appendChild(item);
      });

      if (pbox.childNodes.length) {
        pbtn.addEventListener("click", function (ev) {
          ev.stopPropagation();
          var isOpen = pbox.hidden;
          pbox.hidden = !isOpen;
          pbtn.setAttribute("aria-expanded", String(isOpen));
          place(trigger);
        });
        pop.appendChild(pbtn);
        pop.appendChild(pbox);
      }
    }

    /* 英语层：日常义 / 字面 / 词源 / 易错点。次要内容，默认收起 */
    var m = entry.more;
    if (m && (m.dailyZh || m.literal || m.etymology || m.pitfall)) {
      var btn = el("button", "gloss__more-btn", "日常英语里的它");
      btn.type = "button";
      btn.setAttribute("aria-expanded", "false");
      var box = el("div", "gloss__more");
      box.hidden = true;

      if (m.dailyZh) box.appendChild(row("日常义", m.dailyZh));
      if (m.dailyEx) box.appendChild(row("例", m.dailyEx + (m.dailyExZh ? "　" + m.dailyExZh : ""), true));
      if (m.literal) box.appendChild(row("字面", m.literal.replace(/^字面：|^本义：/, "")));
      if (m.etymology) box.appendChild(row("词源", m.etymology));
      if (m.pitfall) box.appendChild(row("易错", m.pitfall));

      btn.addEventListener("click", function (ev) {
        ev.stopPropagation();
        var isOpen = box.hidden;
        box.hidden = !isOpen;
        btn.setAttribute("aria-expanded", String(isOpen));
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
      pop.classList.remove("gloss--center");
      return;
    }
    /* 从检索框打开时没有触发元素，居中显示 */
    if (!trigger) {
      pop.classList.add("gloss--center");
      pop.style.left = ""; pop.style.top = "";
      return;
    }
    pop.classList.remove("gloss--center");
    var r = trigger.getBoundingClientRect();
    var sx = window.pageXOffset, sy = window.pageYOffset;
    pop.style.top = "0px"; pop.style.left = "0px";
    var w = pop.offsetWidth, h = pop.offsetHeight;
    var left = r.left + sx;
    var max = sx + document.documentElement.clientWidth - w - 12;
    if (left > max) left = max;
    if (left < sx + 12) left = sx + 12;
    /* 优先放下方；下方放不下且上方放得下就翻上去；两边都放不下（展开「逐词看」
       和「更多」之后卡片可能有 600 多像素高）就贴着视口夹住，别让它跑出屏幕。 */
    var vh = document.documentElement.clientHeight;
    var top;
    if (r.bottom + h + 16 <= vh) top = r.bottom + sy + 8;
    else if (r.top - h - 16 >= 0) top = r.top + sy - h - 8;
    else top = sy + Math.max(8, (vh - h) / 2);
    var minTop = sy + 8, maxTop = sy + vh - h - 8;
    if (maxTop < minTop) maxTop = minTop;
    if (top < minTop) top = minTop;
    if (top > maxTop) top = maxTop;
    pop.style.left = left + "px";
    pop.style.top = top + "px";
  }

  function ensurePop() {
    if (pop) return;
    pop = el("div", "gloss");
    pop.hidden = true;
    pop.setAttribute("role", "dialog");
    pop.setAttribute("aria-label", "术语释义");
    pop.addEventListener("click", function (ev) { ev.stopPropagation(); });
    document.body.appendChild(pop);
  }

  function openCard(trigger, entry) {
    ensurePop();
    if (trigger && current === trigger && !pop.hidden) { close(); return; }
    close();
    build(entry, trigger);
    pop.hidden = false;
    place(trigger);
    if (trigger) { current = trigger; trigger.setAttribute("aria-expanded", "true"); }
  }

  /* ── 悬浮检索 ────────────────────────────────────────────── */
  var SEARCH = [];
  function buildIndex() {
    /* 同一个概念常常被索引好几次：A1 收「Continuous delivery」、A2 收缩写「CD」、
       知识点标题又收一次。检索结果里连出三条一模一样的东西是噪音，按
       「中文名 + 落点」去重，保留信息最全的那条。 */
    var seen = {};
    for (var k in G) {
      if (!Object.prototype.hasOwnProperty.call(G, k)) continue;
      var e = G[k];
      /* 只要能给出中文名，并且点开有内容可看（释义或落点），就该能被搜到 */
      if (!(e.zh || e.en)) continue;
      if (!e.definition && !e.expansion && !e.more && !e.href) continue;

      var id = (e.zh || e.en) + "|" + (e.href || "");
      var score = (e.definition ? 4 : 0) + (e.more ? 2 : 0) + (e.ipa ? 1 : 0);
      var prev = seen[id];
      if (prev && (prev.score > score ||
                   (prev.score === score && prev.en.length <= (e.en || "").length))) continue;
      seen[id] = {
        e: e, score: score,
        en: (e.en || "").toLowerCase(),
        zh: e.zh || "",
        abbr: (e.abbr || "").toLowerCase()
      };
    }
    for (var id2 in seen) if (Object.prototype.hasOwnProperty.call(seen, id2)) SEARCH.push(seen[id2]);
    /* 短的排前面：Kanban 应该排在「Kanban 与 Scrum 的分界」之前 */
    SEARCH.sort(function (a, b) { return a.en.length - b.en.length; });
  }

  function match(q) {
    q = q.trim().toLowerCase();
    if (!q) return [];
    var pre = [], sub = [];
    for (var i = 0; i < SEARCH.length; i++) {
      var it = SEARCH[i];
      var hay = it.en + " " + it.abbr;
      if (hay.indexOf(q) === 0 || it.abbr === q || it.zh.indexOf(q) === 0) pre.push(it);
      else if (hay.indexOf(q) >= 0 || it.zh.indexOf(q) >= 0) sub.push(it);
      if (pre.length >= 12) break;
    }
    return pre.concat(sub).slice(0, 12);
  }

  function buildSearch() {
    var fab = el("button", "gloss-fab", "🔍");
    fab.type = "button";
    fab.title = "查术语（按 / 唤起）";
    fab.setAttribute("aria-label", "查术语");

    var panel = el("div", "gloss-search");
    panel.hidden = true;
    var input = el("input", "gloss-search__input");
    input.type = "text";
    input.setAttribute("placeholder", "输入中文、英文或缩写…");
    input.setAttribute("aria-label", "术语检索");
    var list = el("ul", "gloss-search__list");
    var hint = el("div", "gloss-search__hint", "↑↓ 选择 · Enter 打开 · Esc 关闭");
    panel.appendChild(input); panel.appendChild(list); panel.appendChild(hint);

    var items = [], sel = -1;

    function render(q) {
      list.textContent = "";
      items = match(q);
      sel = items.length ? 0 : -1;
      if (!q.trim()) { hint.textContent = "共 " + SEARCH.length + " 条术语 · ↑↓ 选择 · Enter 打开"; return; }
      if (!items.length) { hint.textContent = "没找到「" + q + "」"; return; }
      hint.textContent = "↑↓ 选择 · Enter 打开 · Esc 关闭";
      items.forEach(function (it, i) {
        var li = el("li", "gloss-search__item" + (i === 0 ? " is-sel" : ""));
        li.appendChild(el("span", "gloss-search__zh", it.e.zh || it.e.en));
        li.appendChild(el("span", "gloss-search__en", it.e.en));
        if (it.e.abbr) li.appendChild(el("span", "gloss__abbr", it.e.abbr));
        li.addEventListener("mousedown", function (ev) { ev.preventDefault(); choose(i); });
        list.appendChild(li);
      });
    }

    function mark() {
      var ls = list.children;
      for (var i = 0; i < ls.length; i++) ls[i].className = "gloss-search__item" + (i === sel ? " is-sel" : "");
      if (sel >= 0 && ls[sel] && ls[sel].scrollIntoView) ls[sel].scrollIntoView({ block: "nearest" });
    }

    function choose(i) {
      if (i < 0 || !items[i]) return;
      closeSearch();
      openCard(null, items[i].e);
    }

    function openSearch() {
      panel.hidden = false;
      fab.classList.add("is-open");
      input.value = "";
      render("");
      input.focus();
    }
    function closeSearch() {
      panel.hidden = true;
      fab.classList.remove("is-open");
    }

    fab.addEventListener("click", function (ev) {
      ev.stopPropagation();
      if (panel.hidden) openSearch(); else closeSearch();
    });
    panel.addEventListener("click", function (ev) { ev.stopPropagation(); });
    input.addEventListener("input", function () { render(input.value); });
    input.addEventListener("keydown", function (ev) {
      if (ev.key === "ArrowDown") { ev.preventDefault(); if (items.length) { sel = (sel + 1) % items.length; mark(); } }
      else if (ev.key === "ArrowUp") { ev.preventDefault(); if (items.length) { sel = (sel - 1 + items.length) % items.length; mark(); } }
      else if (ev.key === "Enter") { ev.preventDefault(); choose(sel); }
      else if (ev.key === "Escape") { ev.preventDefault(); closeSearch(); }
    });

    document.addEventListener("click", closeSearch);
    document.addEventListener("keydown", function (ev) {
      var tag = (ev.target && ev.target.tagName) || "";
      var typing = tag === "INPUT" || tag === "TEXTAREA" || (ev.target && ev.target.isContentEditable);
      if (!typing && (ev.key === "/" || ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "k"))) {
        ev.preventDefault(); close(); openSearch();
      }
    });

    document.body.appendChild(fab);
    document.body.appendChild(panel);
  }

  /* ── 启动 ────────────────────────────────────────────────── */
  function lookup(text) {
    var k = norm(text);
    if (G[k]) return G[k];
    /* 只拆有空格的分隔符，理由同生成器：Repair/Recover 是一个词的两种写法 */
    var parts = text.split(/\s+\/\s+|\s*·\s*/);
    for (var i = 0; i < parts.length; i++) {
      var e = G[norm(parts[i])];
      if (e) return e;
    }
    return null;
  }

  function init() {
    /* 附录 A1/A2 本身就是术语表，正文不加弹层；但检索框仍然给，方便随时查 */
    var isGlossaryPage = PAGE.ch === "appendix";

    if (!isGlossaryPage) {
      var scope = document.querySelector(".main") || document.body;
      var spans = scope.querySelectorAll("span.en");
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
          node.addEventListener("click", function (ev) { ev.stopPropagation(); openCard(node, e); });
          node.addEventListener("keydown", function (ev) {
            if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); ev.stopPropagation(); openCard(node, e); }
          });
        })(s, entry);
      }
    }

    buildIndex();
    if (!SEARCH.length) return;
    ensurePop();
    buildSearch();

    document.addEventListener("click", close);
    document.addEventListener("keydown", function (ev) { if (ev.key === "Escape") close(); });
    window.addEventListener("resize", close);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
