/* ============================================================
   学习进度 · localStorage
   key: dofd:progress -> { "ch01/1.1-defining-devops": 1, ... }
   ============================================================ */
(function () {
  "use strict";
  var KEY = "dofd:progress";

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; }
    catch (e) { return {}; }
  }
  function write(o) {
    try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* 隐私模式等，静默降级 */ }
  }

  var API = {
    read: read,
    isDone: function (k) { return !!read()[k]; },
    mark: function (k, v) { var o = read(); if (v) o[k] = 1; else delete o[k]; write(o); return o; },
    /** 返回 { done, total, pct } —— 只统计 syllabus 中 status==='done' 的小节 */
    stats: function () {
      var S = window.SYLLABUS, o = read(), done = 0, total = 0;
      if (!S) return { done: 0, total: 0, pct: 0 };
      S.chapters.forEach(function (c) {
        c.sections.forEach(function (s) {
          if (s.status !== "done") return;
          total++;
          if (o[c.id + "/" + s.slug]) done++;
        });
      });
      return { done: done, total: total, pct: total ? Math.round((done / total) * 100) : 0 };
    },
    reset: function () { write({}); }
  };

  window.Progress = API;

  /* 小节页自动挂一个「学完了」开关 */
  document.addEventListener("DOMContentLoaded", function () {
    var host = document.getElementById("markDone");
    var P = window.PAGE || {};
    if (!host || !P.ch || !P.sec) return;
    var key = P.ch + "/" + P.sec;
    function paint() {
      var on = API.isDone(key);
      host.textContent = on ? "✓ 已学完" : "标记为学完";
      host.setAttribute("aria-pressed", on ? "true" : "false");
      host.style.color = on ? "var(--hot-fg)" : "";
      host.style.borderColor = on ? "var(--hot-line)" : "";
    }
    host.addEventListener("click", function () { API.mark(key, !API.isDone(key)); paint(); });
    paint();
  });
})();
