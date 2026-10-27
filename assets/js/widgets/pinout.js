/* Тренажёр распиновки RJ-45: T568A / T568B.
   Режимы: справка (визуальная схема), тест (4 типа вопросов), статистика сессии. */
(function () {
  /* color: base + striped (белая с полоской) */
  var C = {
    WG: { name: "белый/зелёный", short: "б/з", base: "#22c55e", stripe: "#ffffff", striped: true },
    G:  { name: "зелёный", short: "з", base: "#16a34a", stripe: "#16a34a", striped: false },
    WO: { name: "белый/оранжевый", short: "б/о", base: "#f97316", stripe: "#ffffff", striped: true },
    O:  { name: "оранжевый", short: "о", base: "#ea580c", stripe: "#ea580c", striped: false },
    WB: { name: "белый/синий", short: "б/с", base: "#3b82f6", stripe: "#ffffff", striped: true },
    B:  { name: "синий", short: "с", base: "#2563eb", stripe: "#2563eb", striped: false },
    WBr:{ name: "белый/коричневый", short: "б/к", base: "#92400e", stripe: "#ffffff", striped: true },
    Br: { name: "коричневый", short: "к", base: "#78350f", stripe: "#78350f", striped: false }
  };

  /* порядок проводов 1..8 */
  var A = ["WG", "G", "WO", "B", "WB", "O", "WBr", "Br"];
  var B = ["WO", "O", "WG", "B", "WB", "G", "WBr", "Br"];

  var COLOR_KEYS = ["WG", "G", "WO", "O", "WB", "B", "WBr", "Br"];

  var stats = { right: 0, wrong: 0, streak: 0, bestStreak: 0 };

  function pinColor(std, n) {
    var arr = std === "A" ? A : B;
    return C[arr[n - 1]];
  }

  /* ---------- визуальная схема одного коннектора ---------- */
  function connectorHTML(std, highlightPin) {
    var arr = std === "A" ? A : B;
    var rows = "";
    for (var i = 1; i <= 8; i++) {
      var c = C[arr[i - 1]];
      var hi = highlightPin === i ? " hi" : "";
      var swatch = c.striped
        ? "background:linear-gradient(90deg," + c.stripe + " 0 45%," + c.base + " 45% 55%," + c.stripe + " 55% 100%)"
        : "background:" + c.base;
      rows +=
        '<div class="po-pin' + hi + '" data-pin="' + i + '">' +
        '<span class="po-num">' + i + "</span>" +
        '<span class="po-wire" style="' + swatch + '"></span>' +
        '<span class="po-cname">' + c.name + "</span>" +
        "</div>";
    }
    return (
      '<div class="po-conn" data-std="' + std + '">' +
      '<div class="po-conn-head"><b>T568' + std + "</b><span>RJ-45 · пины 1→8</span></div>" +
      '<div class="po-jack" aria-hidden="true"><span class="po-notch"></span></div>' +
      '<div class="po-pins">' + rows + "</div>" +
      "</div>"
    );
  }

  function diffHTML() {
    var items = "";
    for (var i = 1; i <= 8; i++) {
      var a = C[A[i - 1]], b = C[B[i - 1]];
      var same = A[i - 1] === B[i - 1];
      items +=
        '<tr class="' + (same ? "" : "po-diff") + '">' +
        "<td>" + i + "</td>" +
        "<td>" + a.name + "</td>" +
        "<td>" + b.name + "</td>" +
        "<td>" + (same ? "—" : "★ меняется") + "</td>" +
        "</tr>";
    }
    return (
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Пин</th><th>T568A</th><th>T568B</th><th></th></tr></thead>' +
      "<tbody>" + items + "</tbody></table></div>"
    );
  }

  /* ---------- генератор вопросов ---------- */
  function makeQuestion() {
    var type = ["pin-color", "color-pin", "which-std", "diff-pins"][Math.floor(Math.random() * 4)];
    var std = Math.random() < 0.5 ? "A" : "B";
    var pin = 1 + Math.floor(Math.random() * 8);

    if (type === "pin-color") {
      var correctKey = (std === "A" ? A : B)[pin - 1];
      return {
        q: "Пин <b>" + pin + "</b> в стандарте <b>T568" + std + "</b> — какой цвет?",
        pin: pin, std: std,
        options: shuffle(COLOR_KEYS.map(function (k) { return { key: k, label: C[k].name }; })),
        correctKey: correctKey,
        explain: "T568" + std + ", пин " + pin + " → " + C[correctKey].name + "."
      };
    }

    if (type === "color-pin") {
      var key = (std === "A" ? A : B)[pin - 1];
      var askPin = Math.random() < 0.5;
      if (askPin) {
        var opts = [];
        for (var p = 1; p <= 8; p++) opts.push({ key: String(p), label: "Пин " + p });
        return {
          q: "В <b>T568" + std + "</b> какой пин имеет цвет <b>«" + C[key].name + "»</b>?",
          pin: pin, std: std,
          options: shuffle(opts),
          correctKey: String(pin),
          explain: "T568" + std + ": " + C[key].name + " — это пин " + pin + "."
        };
      }
      return makePinToStd(pin, key);
    }

    if (type === "which-std") {
      /* показываем цвет пина — угадать стандарт */
      var k = (Math.random() < 0.5 ? A : B)[pin - 1];
      /* подбираем пин, где A≠B, чтобы вопрос имел смысл */
      var tryN = 0;
      while (A[pin - 1] === B[pin - 1] && tryN < 20) {
        pin = 1 + Math.floor(Math.random() * 8);
        k = (std === "A" ? A : B)[pin - 1];
        tryN++;
      }
      /* если все совпали (не бывает), просто берём любой */
      k = (std === "A" ? A : B)[pin - 1];
      if (A[pin - 1] === B[pin - 1]) {
        /* pins 4,5,7,8 same — pick 2 or 3 or 1 or 6 */
        pin = [1, 2, 3, 6][Math.floor(Math.random() * 4)];
        std = Math.random() < 0.5 ? "A" : "B";
        k = (std === "A" ? A : B)[pin - 1];
      }
      return {
        q: "Пин <b>" + pin + "</b> — цвет <b>«" + C[k].name + "»</b>. Это какой стандарт?",
        pin: pin, std: null,
        options: [
          { key: "A", label: "T568A" },
          { key: "B", label: "T568B" },
          { key: "X", label: "Оба одинаковы" }
        ],
        correctKey: (A[pin - 1] === B[pin - 1] ? "X" : std),
        explain: A[pin - 1] === B[pin - 1]
          ? "Пин " + pin + " одинаков в T568A и T568B: " + C[k].name + "."
          : "T568" + std + ", пин " + pin + " → " + C[k].name + ". (В T568" + (std === "A" ? "B" : "A") + " там " + C[(std === "A" ? B : A)[pin - 1]].name + ".)"
      };
    }

    /* diff-pins: какие пины отличаются */
    return {
      q: "Какие пины <b>отличаются</b> между T568A и T568B?",
      pin: null, std: null,
      options: [
        { key: "123", label: "Пины 1, 2 и 3" },
        { key: "1236", label: "Пины 1, 2, 3 и 6" },
        { key: "4578", label: "Пины 4, 5, 7 и 8" },
        { key: "all", label: "Все 8 пинов" }
      ],
      correctKey: "1236",
      explain: "Меняются местами оранжевая и зелёная пары: пины 1, 2, 3 и 6. Пины 4, 5, 7, 8 одинаковы."
    };
  }

  function makePinToStd(pin, key) {
    return {
      q: "Пин <b>" + pin + "</b> — <b>«" + C[key].name + "»</b>. Какой стандарт?",
      pin: pin, std: null,
      options: [
        { key: "A", label: "T568A" },
        { key: "B", label: "T568B" },
        { key: "X", label: "Оба одинаковы" }
      ],
      correctKey: A[pin - 1] === B[pin - 1] ? "X" : (A[pin - 1] === key ? "A" : "B"),
      explain: "T568" + (A[pin - 1] === key ? "A" : B[pin - 1] === key ? "B" : "?") + ", пин " + pin + " → " + C[key].name + "."
    };
  }

  function shuffle(a) {
    var r = a.slice();
    for (var i = r.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = r[i]; r[i] = r[j]; r[j] = t;
    }
    return r;
  }

  /* ---------- рендер ---------- */
  function render() {
    var wrap = Renderer.el('<div class="po"></div>');
    var tabs = Renderer.el(
      '<div class="tab-bar po-tabs">' +
      '<button class="tab-btn active" data-tab="study">📐 Схема</button>' +
      '<button class="tab-btn" data-tab="quiz">🎯 Тренажёр</button>' +
      "</div>"
    );
    var studyPane = Renderer.el('<div class="tab-pane active po-study"></div>');
    var quizPane = Renderer.el('<div class="tab-pane po-quiz"></div>');
    wrap.appendChild(tabs);
    wrap.appendChild(studyPane);
    wrap.appendChild(quizPane);

    /* --- схема --- */
    studyPane.innerHTML =
      '<p class="blk-p">Запомните порядок проводов. <b>T568B</b> — стандарт де-факто (Cisco, большинство организаций). <b>T568A</b> отличается только парой 2/3 (оранжевый ↔ зелёный). Кабель <b>crossover</b> — A на одном конце, B на другом; <b>straight-through</b> — одинаковый стандарт на обоих.</p>' +
      '<div class="po-diagrams">' + connectorHTML("A") + connectorHTML("B") + "</div>" +
      '<h3 class="blk-h3">Сравнение по пинам</h3>' +
      diffHTML() +
      '<div class="callout tip"><div class="co-title">💡 Шпаргалка</div><p>Запоминаем <b>T568B</b>: «<b>О-О-з-С-с-з-к-к</b>» (оранж, оранж, зелёный, синий, синий, зелёный, коричневый, коричневый) — для T568A просто поменяйте местами первую оранжевую и первую зелёную (пины 1↔3, 2↔6).</p></div>';

    /* --- тренажёр --- */
    quizPane.innerHTML = "";
    startQuiz(quizPane);

    tabs.querySelectorAll(".tab-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        tabs.querySelectorAll(".tab-btn").forEach(function (x) { x.classList.remove("active"); });
        studyPane.classList.remove("active");
        quizPane.classList.remove("active");
        btn.classList.add("active");
        var pane = btn.dataset.tab === "study" ? studyPane : quizPane;
        pane.classList.add("active");
      });
    });

    return wrap;
  }

  function startQuiz(pane) {
    var q = makeQuestion();
    pane.innerHTML = "";

    var head = Renderer.el(
      '<div class="po-stat">' +
      '<span>✔ ' + stats.right + "</span>" +
      '<span class="po-wr">✘ ' + stats.wrong + "</span>" +
      '<span>🔥 серия: ' + stats.streak + "</span>" +
      (stats.bestStreak ? "<span>рекорд: " + stats.bestStreak + "</span>" : "") +
      "</div>"
    );
    pane.appendChild(head);

    /* визуал: подсвечиваем пин, если есть */
    if (q.pin != null) {
      var vis = Renderer.el(
        '<div class="po-diagrams po-quiz-vis">' +
        connectorHTML("A", q.pin) +
        connectorHTML("B", q.pin) +
        "</div>"
      );
      pane.appendChild(vis);
    }

    var card = Renderer.el('<div class="quiz-card po-card"><div class="quiz-q">' + q.q + "</div></div>");
    var opts = Renderer.el('<div class="quiz-opts"></div>');

    q.options.forEach(function (opt) {
      var isColor = !!C[opt.key];
      var btn = Renderer.el(
        '<button class="quiz-opt">' +
        (isColor
          ? '<span class="po-swatch" style="background:' + swatchCSS(C[opt.key]) + '"></span>'
          : '<span class="q-key">' + Renderer.esc(opt.label.slice(0, 1)) + "</span>") +
        "<span>" + Renderer.esc(opt.label) + "</span></button>"
      );
      btn.addEventListener("click", function () {
        if (card.classList.contains("done")) return;
        card.classList.add("done");
        var right = opt.key === q.correctKey;
        if (right) { stats.right++; stats.streak++; if (stats.streak > stats.bestStreak) stats.bestStreak = stats.streak; }
        else { stats.wrong++; stats.streak = 0; }
        opts.querySelectorAll(".quiz-opt").forEach(function (b) {
          b.disabled = true;
        });
        btn.classList.add(right ? "right" : "wrong");
        /* подсветить правильный */
        q.options.forEach(function (o, oi) {
          if (o.key === q.correctKey) opts.querySelectorAll(".quiz-opt")[oi].classList.add("right");
        });
        card.appendChild(Renderer.el(
          '<div class="quiz-explain ' + (right ? "ok" : "no") + '">' +
          (right ? "✅ Верно! " : "❌ Неверно. ") + Renderer.inline(q.explain) + "</div>"
        ));
        nav.style.display = "flex";
      });
      opts.appendChild(btn);
    });
    card.appendChild(opts);

    var nav = Renderer.el('<div class="quiz-nav" style="display:none"></div>');
    var next = Renderer.el('<button class="btn btn-primary">Следующий вопрос →</button>');
    next.addEventListener("click", function () { startQuiz(pane); });
    nav.appendChild(next);
    card.appendChild(nav);
    pane.appendChild(card);
  }

  function swatchCSS(c) {
    return c.striped
      ? "linear-gradient(90deg," + c.stripe + " 0 45%," + c.base + " 45% 55%," + c.stripe + " 55% 100%)"
      : c.base;
  }

  Renderer.register("pinout", { render: render });
})();
