/* Прогресс пользователя в localStorage */
window.Progress = (function () {
  var KEY = "cn-progress-v1";
  var state = load();

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || { tasks: {}, quiz: {}, cards: {}, checks: {} };
    } catch (e) {
      return { tasks: {}, quiz: {}, cards: {}, checks: {} };
    }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
    if (window.App && App.onProgressChange) App.onProgressChange();
  }
  function clamp(n) { return Math.max(0, Math.min(1, n)); }

  return {
    /* --- задания лабораторной --- */
    isTaskDone: function (labId, taskId) { return !!state.tasks[labId + ":" + taskId]; },
    setTaskDone: function (labId, taskId, done) {
      state.tasks[labId + ":" + taskId] = !!done;
      save();
    },
    labTasksDone: function (labId) {
      var n = 0;
      for (var k in state.tasks) if (state.tasks[k] && k.indexOf(labId + ":") === 0) n++;
      return n;
    },
    /* --- квизы --- */
    quizBest: function (id) { return state.quiz[id] || null; },
    quizSave: function (id, score, total) {
      var prev = state.quiz[id];
      if (!prev || score / total > prev.score / prev.total) {
        state.quiz[id] = { score: score, total: total, at: Date.now() };
        save();
      }
    },
    /* --- флеш-карточки --- */
    cardSeen: function (id, idx) {
      var k = id + ":" + idx;
      if (!state.cards[k]) { state.cards[k] = 1; save(); }
    },
    isCardSeen: function (id, idx) { return !!state.cards[id + ":" + idx]; },
    cardsSeenCount: function (id) {
      var n = 0;
      for (var k in state.cards) if (state.cards[k] && k.indexOf(id + ":") === 0) n++;
      return n;
    },
    /* --- чек-листы --- */
    isChecked: function (id, idx) { return !!state.checks[id + ":" + idx]; },
    toggleCheck: function (id, idx, val) {
      state.checks[id + ":" + idx] = !!val;
      save();
    },
    /* --- общий прогресс по лабораторной --- */
    labProgress: function (lab, extra) {
      /* lab: {id, quizId, quizTotal, flashId, flashTotal, checklists}
         Задания берём из Site.labTasks (единственный источник правды),
         fallback — lab.tasks из meta.js. */
      var parts = [];
      var done = this.labTasksDone(lab.id);
      var taskList = (window.Site && Site.labTasks && Site.labTasks[lab.id]) || lab.tasks || [];
      parts.push([done, taskList.length]);

      if (lab.quizId) {
        var q = this.quizBest(lab.quizId);
        parts.push([q ? q.score : 0, lab.quizTotal || (q ? q.total : 1)]);
      }
      if (lab.flashId) {
        parts.push([this.cardsSeenCount(lab.flashId), lab.flashTotal || 1]);
      }
      (lab.checklists || []).forEach(function (cl) {
        var c = 0;
        cl.items.forEach(function (_, i) { if (window.Progress.isChecked(cl.id, i)) c++; });
        parts.push([c, cl.items.length]);
      });
      if (extra) extra.forEach(function (e) { parts.push([e[0], e[1]]); });

      var a = 0, b = 0;
      parts.forEach(function (p) { a += p[0]; b += p[1]; });
      return b ? clamp(a / b) : 0;
    },
    totalProgress: function () {
      var labs = (window.Site && Site.labs) ? Object.keys(Site.labs) : [];
      if (!labs.length) return 0;
      var sum = 0;
      var self = this;
      labs.forEach(function (id) { sum += self.labProgress(Site.labs[id]); });
      return clamp(sum / labs.length);
    },
    reset: function () {
      state = { tasks: {}, quiz: {}, cards: {}, checks: {} };
      save();
    },
    /* --- экспорт / импорт (синхронизация ПК ↔ телефон) --- */
    exportJSON: function () {
      return JSON.stringify({ v: 1, at: Date.now(), state: state }, null, 2);
    },
    importJSON: function (json) {
      var data = JSON.parse(json);
      var st = data && data.state ? data.state : data;
      if (!st || typeof st !== "object") throw new Error("bad format");
      state = {
        tasks: st.tasks || {},
        quiz: st.quiz || {},
        cards: st.cards || {},
        checks: st.checks || {}
      };
      save();
      return true;
    }
  };
})();
