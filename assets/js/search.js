/* Поиск по курсу: собирает индекс из Site (теория, задания, вопросы, шпаргалка) при загрузке */
window.Search = (function () {
  var index = [];

  function strip(md) {
    return String(md).replace(/[*`#]/g, "");
  }

  function add(title, path, text) {
    if (!text) return;
    index.push({ title: title, path: path, text: strip(text).slice(0, 800), lower: (title + " " + strip(text)).toLowerCase() });
  }

  function build() {
    index = [];
    var S = window.Site || {};

    (S.theory || []).forEach(function (sec) {
      var buf = [];
      (sec.blocks || []).forEach(function (b) {
        if (b.text) buf.push(b.text);
        if (b.items) buf.push(b.items.join(" "));
        if (b.q) buf.push(b.q + " " + (b.a || ""));
        if (b.rows) buf.push(b.rows.map(function (r) { return r.join(" "); }).join(" "));
        if (b.head) buf.push(b.head.join(" "));
      });
      add(sec.title, "#/theory#" + sec.id, buf.join(" "));
    });

    (S.registry.labs || []).forEach(function (labMeta) {
      var lab = S.labs[labMeta.id];
      if (!lab) return;
      add(lab.title, "#/lab/" + lab.id, lab.short + " " + lab.goal);

      var theory = (S.labTheory || {})[lab.id] || [];
      var tb = [];
      theory.forEach(function (b) {
        if (b.text) tb.push(b.text);
        if (b.items) tb.push(b.items.join(" "));
      });
      if (tb.length) add("Теория: " + lab.short, "#/lab/" + lab.id + "/theory", tb.join(" "));

      var tasks = (S.labTasks || {})[lab.id] || [];
      tasks.forEach(function (t) {
        var buf = [];
        (t.blocks || []).forEach(function (b) {
          if (b.text) buf.push(b.text);
          if (b.items) buf.push(b.items.join(" "));
          if (b.q) buf.push(b.q + " " + (b.a || ""));
          if (b.rows) buf.push(b.rows.map(function (r) { return r.join(" "); }).join(" "));
          if (b.head) buf.push(b.head.join(" "));
        });
        add("Задание " + t.num + ": " + t.title, "#/lab/" + lab.id + "/task/" + t.id, (t.intro || "") + " " + buf.join(" "));
      });
    });

    (S.questions || []).forEach(function (q, i) {
      add(strip(q.q), "#/questions", (q.a || []).join(" "));
    });

    (S.cheatsheet || []).forEach(function (g) {
      add("Шпаргалка: " + g.title, "#/cheatsheet", g.rows.map(function (r) { return r.join(" "); }).join(" "));
    });

    /* флеш-карточки */
    Object.keys(S.decks || {}).forEach(function (deckId) {
      var deck = S.decks[deckId] || [];
      deck.forEach(function (c, i) {
        var labPath = "#/lab/" + deckId.replace(/-cards$/, "") + "/flashcards";
        add(c.term, labPath, c.def);
      });
      if (deck.length) {
        add("Флеш-карточки: " + deckId, deckId.indexOf("lab") === 0
          ? "#/lab/" + deckId.replace(/-cards$/, "") + "/flashcards"
          : "#/",
          deck.map(function (c) { return c.term + " " + c.def; }).join(" "));
      }
    });

    /* вопросы квизов */
    Object.keys(S.quizzes || {}).forEach(function (quizId) {
      var quiz = S.quizzes[quizId] || [];
      quiz.forEach(function (q) {
        var path = quizId.indexOf("lab") === 0
          ? "#/lab/" + quizId.replace(/-quiz$/, "") + "/quiz"
          : "#/";
        add(q.q, path, (q.options || []).join(" ") + " " + (q.explain || ""));
      });
    });

    return index.length;
  }

  function query(q) {
    q = String(q || "").trim().toLowerCase();
    if (q.length < 2) return [];
    var terms = q.split(/\s+/);
    return index
      .map(function (item) {
        var score = 0;
        terms.forEach(function (t) {
          if (item.lower.indexOf(t) !== -1) score += 1;
          if (item.title.toLowerCase().indexOf(t) !== -1) score += 2;
        });
        return { item: item, score: score };
      })
      .filter(function (r) { return r.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 12)
      .map(function (r) { return r.item; });
  }

  function highlight(text, q) {
    var terms = String(q || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
    var out = Renderer.esc(text);
    terms.forEach(function (t) {
      if (t.length < 2) return;
      var re = new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
      out = out.replace(re, "<mark>$1</mark>");
    });
    return out;
  }

  function snippet(item, q) {
    var terms = String(q || "").toLowerCase().split(/\s+/).filter(Boolean);
    var pos = -1;
    for (var i = 0; i < terms.length; i++) {
      pos = item.text.toLowerCase().indexOf(terms[i]);
      if (pos !== -1) break;
    }
    if (pos === -1) pos = 0;
    var start = Math.max(0, pos - 40);
    var frag = item.text.slice(start, start + 160);
    return (start > 0 ? "…" : "") + highlight(frag, q) + (start + 160 < item.text.length ? "…" : "");
  }

  return { build: build, query: query, highlight: highlight, snippet: snippet };
})();
