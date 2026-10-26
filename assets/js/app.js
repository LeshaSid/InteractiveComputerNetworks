/* Главное приложение: роутер (hash), навигация, страницы, поиск, тема */
(function () {
  var content = document.getElementById("content");
  var nav = document.getElementById("nav");
  var sidebar = document.getElementById("sidebar");
  var overlay = document.getElementById("overlay");
  var burger = document.getElementById("burger");
  var sidebarClose = document.getElementById("sidebarClose");
  var themeToggle = document.getElementById("themeToggle");
  var searchInput = document.getElementById("searchInput");
  var searchResults = document.getElementById("searchResults");
  var topbarProgress = document.getElementById("topbarProgress");

  /* ---------- Тема ---------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var icon = themeToggle.querySelector(".theme-icon");
    var label = themeToggle.querySelector(".theme-label");
    if (theme === "dark") { icon.textContent = "🌙"; label.textContent = "Тёмная тема"; }
    else { icon.textContent = "☀️"; label.textContent = "Светлая тема"; }
    try { localStorage.setItem("cn-theme", theme); } catch (e) {}
  }
  var savedTheme = null;
  try { savedTheme = localStorage.getItem("cn-theme"); } catch (e) {}
  if (!savedTheme) {
    savedTheme = (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) ? "light" : "dark";
  }
  applyTheme(savedTheme);
  themeToggle.addEventListener("click", function () {
    var cur = document.documentElement.getAttribute("data-theme");
    applyTheme(cur === "dark" ? "light" : "dark");
  });

  /* ---------- Боковое меню ---------- */
  function openSidebar() { sidebar.classList.add("open"); overlay.classList.add("show"); }
  function closeSidebar() { sidebar.classList.remove("open"); overlay.classList.remove("show"); }
  burger.addEventListener("click", openSidebar);
  sidebarClose.addEventListener("click", closeSidebar);
  overlay.addEventListener("click", closeSidebar);

  /* ---------- Навигация ---------- */
  function buildNav() {
    nav.innerHTML = "";
    var S = window.Site;

    nav.appendChild(group("Обзор", [
      item("#/", "🏠", "Главная"),
      item("#/theory", "📚", "Общая теория")
    ]));

    S.registry.labs.forEach(function (labMeta) {
      var lab = S.labs[labMeta.id];
      var links = [
        item("#/lab/" + labMeta.id, labMeta.icon, "Обзор лабораторной"),
        item("#/lab/" + labMeta.id + "/theory", "📖", "Теория работы")
      ];
      ((S.labTasks || {})[labMeta.id] || []).forEach(function (t) {
        links.push(item("#/lab/" + labMeta.id + "/task/" + t.id, "📄", "Задание " + t.num + ". " + t.title));
      });
      links.push(item("#/lab/" + labMeta.id + "/quiz", "✅", "Тест"));
      links.push(item("#/lab/" + labMeta.id + "/flashcards", "🃏", "Флеш-карточки"));
      nav.appendChild(group("Лабораторная " + labMeta.num, links, labMeta.id));
    });

    nav.appendChild(group("Помощники", [
      item("#/questions", "❓", "Контрольные вопросы"),
      item("#/cheatsheet", "⌨️", "Шпаргалка по IOS"),
      item("#/about", "ℹ️", "О проекте")
    ]));

    /* восстановить свёрнутые группы */
    try {
      var collapsed = JSON.parse(localStorage.getItem("cn-nav-collapsed") || "[]");
      nav.querySelectorAll(".nav-group").forEach(function (g) {
        if (collapsed.indexOf(g.dataset.lab || g.querySelector(".nav-group-title").textContent) !== -1) {
          g.classList.add("collapsed");
        }
      });
    } catch (e) {}
  }

  function group(title, links, labKey) {
    var g = document.createElement("div");
    g.className = "nav-group";
    if (labKey) g.dataset.lab = labKey;
    var btn = document.createElement("button");
    btn.className = "nav-group-title";
    btn.innerHTML = "<span>" + Renderer.esc(title) + "</span><span class='chev'>▼</span>";
    btn.addEventListener("click", function () {
      g.classList.toggle("collapsed");
      try {
        var key = labKey || title;
        var collapsed = JSON.parse(localStorage.getItem("cn-nav-collapsed") || "[]");
        var idx = collapsed.indexOf(key);
        if (g.classList.contains("collapsed")) { if (idx === -1) collapsed.push(key); }
        else if (idx !== -1) collapsed.splice(idx, 1);
        localStorage.setItem("cn-nav-collapsed", JSON.stringify(collapsed));
      } catch (e) {}
    });
    var ul = document.createElement("ul");
    ul.className = "nav-items";
    links.forEach(function (l) { ul.appendChild(l); });
    g.appendChild(btn); g.appendChild(ul);
    return g;
  }

  function item(href, ico, text) {
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.className = "nav-link";
    a.href = href;
    a.innerHTML = "<span class='ico'>" + ico + "</span><span>" + Renderer.esc(text) + "</span>";
    li.appendChild(a);
    return li;
  }

  function setActiveNav(hash) {
    var base = hash.split("#")[0] || hash;
    nav.querySelectorAll(".nav-link").forEach(function (a) {
      a.classList.remove("active");
      var href = a.getAttribute("href");
      if (href === hash || (hash.indexOf(href) === 0 && href !== "#/")) {
        a.classList.add("active");
        /* раскрыть группу */
        var g = a.closest(".nav-group");
        if (g) g.classList.remove("collapsed");
      }
    });
  }

  /* ---------- Прогресс ---------- */
  function updateTopbarProgress() {
    var p = Math.round(Progress.totalProgress() * 100);
    topbarProgress.style.setProperty("--p", p + "%");
    topbarProgress.title = "Общий прогресс: " + p + "%";
  }
  App_onProgressChange = updateTopbarProgress;
  window.App = window.App || {};
  App.onProgressChange = updateTopbarProgress;

  /* ---------- Роутер ---------- */
  function parseHash() {
    var h = location.hash.replace(/^#/, "") || "/";
    var qIdx = h.indexOf("?");
    var query = "";
    if (qIdx !== -1) { query = h.slice(qIdx + 1); h = h.slice(0, qIdx); }
    var anchor = "";
    var aIdx = h.indexOf("#");
    if (aIdx !== -1) { anchor = h.slice(aIdx + 1); h = h.slice(0, aIdx); }
    var parts = h.split("/").filter(Boolean);
    return { parts: parts, query: query, anchor: anchor };
  }

  function navigate() {
    var r = parseHash();
    var parts = r.parts;
    closeSidebar();
    content.innerHTML = "";
    window.scrollTo(0, 0);

    if (parts.length === 0) return pageHome();
    if (parts[0] === "theory") return pageTheory();
    if (parts[0] === "questions") return pageQuestions();
    if (parts[0] === "cheatsheet") return pageCheatsheet();
    if (parts[0] === "about") return pageAbout();
    if (parts[0] === "search") return;
    if (parts[0] === "lab" && parts[1]) {
      var labId = parts[1];
      var lab = (window.Site.labs || {})[labId];
      if (!lab) return pageNotFound("Лабораторная не найдена: " + labId);
      if (!parts[2]) return pageLabOverview(lab);
      if (parts[2] === "theory") return pageLabTheory(lab);
      if (parts[2] === "task" && parts[3]) return pageTask(lab, parts[3]);
      if (parts[2] === "quiz") return pageLabQuiz(lab);
      if (parts[2] === "flashcards") return pageLabFlashcards(lab);
      return pageNotFound("Страница не найдена");
    }
    return pageNotFound("Страница не найдена");
  }

  /* ---------- Экраны ---------- */
  function crumbs(items) {
    var c = document.createElement("div");
    c.className = "crumbs";
    items.forEach(function (it, i) {
      if (i) c.appendChild(Renderer.el('<span class="sep">/</span>'));
      if (it.href) {
        var a = Renderer.el('<a href="' + it.href + '">' + Renderer.esc(it.text) + "</a>");
        c.appendChild(a);
      } else {
        c.appendChild(Renderer.el("<span>" + Renderer.esc(it.text) + "</span>"));
      }
    });
    content.appendChild(c);
  }

  function renderBlocks(blocks) {
    var wrap = document.createElement("div");
    Renderer.render(blocks, wrap);
    while (wrap.firstChild) content.appendChild(wrap.firstChild);
  }

  function pager(prev, next) {
    var p = document.createElement("div");
    p.className = "pager";
    if (prev) {
      p.appendChild(Renderer.el('<a href="' + prev.href + '"><div class="p-dir">← Назад</div><div class="p-title">' + Renderer.esc(prev.title) + "</div></a>"));
    } else p.appendChild(Renderer.el("<div></div>"));
    if (next) {
      p.appendChild(Renderer.el('<a class="next" href="' + next.href + '"><div class="p-dir">Далее →</div><div class="p-title">' + Renderer.esc(next.title) + "</div></a>"));
    }
    content.appendChild(p);
  }

  function pageHome() {
    document.title = "Компьютерные сети — интерактивный курс";
    content.appendChild(Renderer.el('<h1 class="page-title">🌐 Компьютерные сети</h1>'));
    content.appendChild(Renderer.el('<p class="page-sub">Интерактивный курс: теория, лабораторные работы, тесты и симулятор Cisco IOS. Прогресс сохраняется в браузере — можно учиться с телефона и с ПК.</p>'));

    var p = Math.round(Progress.totalProgress() * 100);
    content.appendChild(Renderer.el(
      '<div class="progress-row"><span class="pr-label">Общий прогресс</span>' +
      '<div class="pr-track"><i style="width:' + p + '%"></i></div><span class="pr-val">' + p + "%</span></div>"
    ));

    var grid = document.createElement("div");
    grid.className = "card-grid";
    grid.appendChild(card("#/theory", "📚", "Общая теория", "OSI и TCP/IP, физический и канальный уровни, ARP, Cisco IOS, топологии", ""));

    (Site.registry.labs || []).forEach(function (m) {
      var lab = Site.labs[m.id];
      var prog = Math.round(Progress.labProgress(lab) * 100);
      grid.appendChild(card("#/lab/" + m.id, m.icon, "Лабораторная " + m.num, m.desc, prog + "% пройдено", prog));
    });

    grid.appendChild(card("#/questions", "❓", "Контрольные вопросы", "7 вопросов из методички с развёрнутыми ответами", ""));
    grid.appendChild(card("#/cheatsheet", "⌨️", "Шпаргалка по IOS", "Команды Cisco IOS: режимы, show, настройка, ошибки", ""));
    content.appendChild(grid);

    /* свежие задания */
    content.appendChild(Renderer.el('<h2 class="blk-h2">Задания лабораторной 1</h2>'));
    var lab1 = Site.labs.lab1;
    var list = document.createElement("div");
    list.className = "card-grid";
    (Site.labTasks.lab1 || []).forEach(function (t) {
      var done = Progress.isTaskDone("lab1", t.id);
      var c = card("#/lab/lab1/task/" + t.id, done ? "✅" : "📄", "Задание " + t.num, t.title, done ? "выполнено" : "");
      list.appendChild(c);
    });
    content.appendChild(list);
  }

  function card(href, ico, title, desc, meta, prog) {
    var a = Renderer.el(
      '<a class="card" href="' + href + '">' +
      '<span class="c-ico">' + ico + "</span>" +
      '<div class="c-title">' + Renderer.esc(title) + "</div>" +
      '<div class="c-desc">' + Renderer.esc(desc) + "</div>" +
      (meta ? '<div class="c-meta"><span>' + Renderer.esc(meta) + "</span></div>" : "") +
      (prog != null && prog !== "" ? '<div class="c-bar"><i style="width:' + prog + '%"></i></div>' : "") +
      "</a>"
    );
    return a;
  }

  function pageTheory() {
    document.title = "Общая теория — Компьютерные сети";
    crumbs([{ text: "Главная", href: "#/" }, { text: "Общая теория" }]);
    content.appendChild(Renderer.el('<h1 class="page-title">📚 Общая теория</h1>'));
    content.appendChild(Renderer.el('<p class="page-sub">Базовые темы курса: модели OSI/TCP-IP, физический и канальный уровни, протокол ARP, Cisco IOS и топологии сетей.</p>'));

    var toc = document.createElement("div");
    toc.className = "card-grid";
    Site.theory.forEach(function (sec) {
      toc.appendChild(card("#/theory#" + sec.id, sec.icon, sec.title, "", ""));
    });
    content.appendChild(toc);

    Site.theory.forEach(function (sec) {
      renderBlocks(sec.blocks);
    });

    /* глубина: сюда можно добавлять новые темы через content/theory.js */
  }

  function pageLabOverview(lab) {
    document.title = "Лабораторная " + lab.num + " — " + lab.short;
    crumbs([{ text: "Главная", href: "#/" }, { text: "Лабораторная " + lab.num }]);
    content.appendChild(Renderer.el('<h1 class="page-title">' + lab.icon + " Лабораторная №" + lab.num + "</h1>"));
    content.appendChild(Renderer.el('<p class="page-sub">' + Renderer.esc(lab.title) + "</p>"));

    var prog = Math.round(Progress.labProgress(lab) * 100);
    content.appendChild(Renderer.el(
      '<div class="progress-row"><span class="pr-label">Прогресс работы</span>' +
      '<div class="pr-track"><i style="width:' + prog + '%"></i></div><span class="pr-val">' + prog + "%</span></div>"
    ));

    renderBlocks([
      { type: "h2", text: "Цель работы" },
      { type: "p", text: lab.goal },
      { type: "h2", text: "Файлы Packet Tracer" },
      { type: "ul", items: lab.pkaFiles },
      { type: "h2", text: "Чек-лист подготовки" }
    ]);

    (lab.checklists || []).forEach(function (cl) {
      renderBlocks([{ type: "checklist", id: cl.id, items: cl.items }]);
    });

    renderBlocks([{ type: "h2", text: "Содержание" }]);
    var grid = document.createElement("div");
    grid.className = "card-grid";
    grid.appendChild(card("#/lab/" + lab.id + "/theory", "📖", "Теория работы", "Краткий обзор перед стартом", ""));
    (Site.labTasks[lab.id] || []).forEach(function (t) {
      var done = Progress.isTaskDone(lab.id, t.id);
      grid.appendChild(card("#/lab/" + lab.id + "/task/" + t.id, done ? "✅" : "📄", "Задание " + t.num, t.title, done ? "выполнено" : ""));
    });
    grid.appendChild(card("#/lab/" + lab.id + "/quiz", "✅", "Тест", lab.quizTotal + " вопросов", ""));
    grid.appendChild(card("#/lab/" + lab.id + "/flashcards", "🃏", "Флеш-карточки", lab.flashTotal + " карточек", ""));
    content.appendChild(grid);

    pager(null, { href: "#/lab/" + lab.id + "/theory", title: "Теория работы" });
  }

  function pageLabTheory(lab) {
    document.title = "Теория — Лабораторная " + lab.num;
    crumbs([{ text: "Главная", href: "#/" }, { text: "Лаб. " + lab.num, href: "#/lab/" + lab.id }, { text: "Теория" }]);
    content.appendChild(Renderer.el('<h1 class="page-title">📖 Теория лабораторной ' + lab.num + "</h1>"));
    content.appendChild(Renderer.el('<p class="page-sub">' + Renderer.esc(lab.short) + "</p>"));

    var blocks = (window.Site.labTheory || {})[lab.id] || [];
    renderBlocks(blocks);

    var tasks = Site.labTasks[lab.id] || [];
    pager(
      { href: "#/lab/" + lab.id, title: "Обзор лабораторной" },
      tasks[0] ? { href: "#/lab/" + lab.id + "/task/" + tasks[0].id, title: "Задание " + tasks[0].num + ". " + tasks[0].title } : null
    );
  }

  function pageTask(lab, taskId) {
    var tasks = Site.labTasks[lab.id] || [];
    var idx = -1;
    tasks.forEach(function (t, i) { if (t.id === taskId) idx = i; });
    if (idx === -1) return pageNotFound("Задание не найдено");
    var t = tasks[idx];
    document.title = "Задание " + t.num + " — " + t.title;

    crumbs([
      { text: "Главная", href: "#/" },
      { text: "Лаб. " + lab.num, href: "#/lab/" + lab.id },
      { text: "Задание " + t.num }
    ]);
    content.appendChild(Renderer.el('<h1 class="page-title">Задание ' + Renderer.esc(t.num) + ". " + Renderer.esc(t.title) + "</h1>"));
    content.appendChild(Renderer.el('<p class="page-sub">' + Renderer.esc(t.intro || "") + "</p>"));

    if (t.file) content.appendChild(Renderer.el('<div class="callout info"><div class="co-title">📦 Файл задания</div><p>' + Renderer.esc(t.file) + "</p></div>"));

    renderBlocks(t.blocks);

    /* кнопка «задание выполнено» */
    var done = Progress.isTaskDone(lab.id, t.id);
    var btn = Renderer.el('<button class="btn ' + (done ? "" : "btn-primary") + '" style="margin-top:30px">' +
      (done ? "✓ Задание отмечено выполненным" : "Отметить задание выполненным") + "</button>");
    btn.addEventListener("click", function () {
      Progress.setTaskDone(lab.id, t.id, !Progress.isTaskDone(lab.id, t.id));
      navigate();
    });
    content.appendChild(btn);

    var prev = idx > 0 ? { href: "#/lab/" + lab.id + "/task/" + tasks[idx - 1].id, title: "Задание " + tasks[idx - 1].num + ". " + tasks[idx - 1].title } : { href: "#/lab/" + lab.id, title: "Обзор лабораторной" };
    var next = idx < tasks.length - 1 ? { href: "#/lab/" + lab.id + "/task/" + tasks[idx + 1].id, title: "Задание " + tasks[idx + 1].num + ". " + tasks[idx + 1].title } : { href: "#/lab/" + lab.id + "/quiz", title: "Тест по лабораторной" };
    pager(prev, next);
  }

  function pageLabQuiz(lab) {
    document.title = "Тест — Лабораторная " + lab.num;
    crumbs([{ text: "Главная", href: "#/" }, { text: "Лаб. " + lab.num, href: "#/lab/" + lab.id }, { text: "Тест" }]);
    content.appendChild(Renderer.el('<h1 class="page-title">✅ Тест по лабораторной ' + lab.num + "</h1>"));
    content.appendChild(Renderer.el('<p class="page-sub">Проверьте знания. Лучший результат сохраняется.</p>'));
    renderBlocks([{ type: "quiz", id: lab.quizId }]);
    pager(
      { href: "#/lab/" + lab.id + "/task/" + ((Site.labTasks[lab.id] || []).slice(-1)[0] || {}).id, title: "Последнее задание" },
      { href: "#/lab/" + lab.id + "/flashcards", title: "Флеш-карточки" }
    );
  }

  function pageLabFlashcards(lab) {
    document.title = "Флеш-карточки — Лабораторная " + lab.num;
    crumbs([{ text: "Главная", href: "#/" }, { text: "Лаб. " + lab.num, href: "#/lab/" + lab.id }, { text: "Флеш-карточки" }]);
    content.appendChild(Renderer.el('<h1 class="page-title">🃏 Флеш-карточки</h1>'));
    content.appendChild(Renderer.el('<p class="page-sub">Учите термины и определения. Карточки листаются свайпом или кнопками.</p>'));
    renderBlocks([{ type: "flashcards", id: lab.flashId, title: "Термины лабораторной " + lab.num }]);
    pager(
      { href: "#/lab/" + lab.id + "/quiz", title: "Тест" },
      { href: "#/lab/" + lab.id, title: "Обзор лабораторной" }
    );
  }

  function pageQuestions() {
    document.title = "Контрольные вопросы";
    crumbs([{ text: "Главная", href: "#/" }, { text: "Контрольные вопросы" }]);
    content.appendChild(Renderer.el('<h1 class="page-title">❓ Контрольные вопросы</h1>'));
    content.appendChild(Renderer.el('<p class="page-sub">7 вопросов из методички по лабораторной №1. Сначала попробуйте ответить сами, затем откройте ответ.</p>'));
    renderBlocks((Site.questions || []).map(function (q) {
      return { type: "qa", q: q.q, a: q.a };
    }));
  }

  function pageCheatsheet() {
    document.title = "Шпаргалка по Cisco IOS";
    crumbs([{ text: "Главная", href: "#/" }, { text: "Шпаргалка" }]);
    content.appendChild(Renderer.el('<h1 class="page-title">⌨️ Шпаргалка по Cisco IOS</h1>'));
    content.appendChild(Renderer.el('<p class="page-sub">Команды и их назначение — краткая справка для работы в CLI и на лабораторных.</p>'));
    var blocks = [];
    (Site.cheatsheet || []).forEach(function (g) {
      blocks.push({ type: "h2", text: g.title });
      blocks.push({ type: "table", head: ["Команда", "Назначение"], rows: g.rows });
    });
    renderBlocks(blocks);
  }

  function pageAbout() {
    document.title = "О проекте";
    crumbs([{ text: "Главная", href: "#/" }, { text: "О проекте" }]);
    content.appendChild(Renderer.el('<h1 class="page-title">ℹ️ О проекте</h1>'));
    content.appendChild(Renderer.el(
      '<p class="page-sub">Интерактивный курс по компьютерным сетям, созданный для подготовки к лабораторным работам и теоретическим занятиям.</p>'
    ));
    renderBlocks([
      { type: "h2", text: "Что внутри" },
      { type: "ul", items: [
        "**Общая теория** — модели OSI/TCP-IP, физический и канальный уровни, ARP, Cisco IOS, топологии.",
        "**Лабораторные работы** — разбор каждого задания: шаги, вопросы из методички, ответы, скриншоты.",
        "**Тесты** — проверка знаний по темам лабораторных.",
        "**Флеш-карточки** — термины и определения.",
        "**Симулятор IOS CLI** — отработка команд прямо в браузере (без Packet Tracer).",
        "**Интерактивная модель OSI** — слои, PDU, инкапсуляция.",
        "**Поиск** — по всему курсу.",
        "**Прогресс** — сохраняется локально в браузере (localStorage)."
      ]},
      { type: "h2", text: "Как это работает технически" },
      { type: "p", text: "Чистый HTML/CSS/JavaScript без сборки и фреймворков. Контент лежит в JS-файлах (легко редактировать), скрипты подключены обычными тегами — сайт работает даже при открытии `index.html` через `file://`. Прогресс хранится только в вашем браузере, никаких серверов." },
      { type: "h2", text: "Как добавить новую лабораторную" },
      { type: "ol", items: [
        "Создайте папку `content/labs/lab2/` с файлами `meta.js`, `theory.js`, `tasks.js`, `quiz.js`, `flashcards.js` (можно скопировать из `lab1` и отредактировать).",
        "Добавьте строку в `content/registry.js` (массив `Site.registry.labs`).",
        "Подключите новые файлы в `index.html` (как подключены файлы lab1).",
        "Фотографии/скриншоты положите в `assets/img/lab2/…` и укажите относительные пути в блоках `{type:\"img\", src:\"…\"}`.",
        "Откройте сайт — новая лабораторная появится в меню автоматически."
      ]},
      { type: "callout", kind: "tip", title: "Размещение", text: "Сайт можно разместить бесплатно на GitHub Pages (рекомендуется приватный репозиторий + Pages). Инструкция — в `README.md`." }
    ]);
  }

  function pageNotFound(msg) {
    content.appendChild(Renderer.el('<h1 class="page-title">404</h1>'));
    content.appendChild(Renderer.el('<p class="page-sub">' + Renderer.esc(msg || "Страница не найдена") + '</p>'));
    content.appendChild(Renderer.el('<a class="btn btn-primary" href="#/">На главную</a>'));
  }

  /* ---------- Поиск ---------- */
  function initSearch() {
    Search.build();
    var selIdx = -1;
    function hide() { searchResults.hidden = true; searchResults.innerHTML = ""; selIdx = -1; }
    function show() {
      var q = searchInput.value;
      if (q.trim().length < 2) { hide(); return; }
      var res = Search.query(q);
      searchResults.innerHTML = "";
      if (!res.length) {
        searchResults.innerHTML = '<div class="search-empty">Ничего не найдено</div>';
      } else {
        res.forEach(function (r) {
          var a = Renderer.el(
            '<a class="search-item" href="' + r.path + '">' +
            '<div class="s-title">' + Search.highlight(r.title, q) + "</div>" +
            '<div class="s-path">' + Renderer.esc(r.path) + "</div>" +
            '<div class="s-snippet">' + Search.snippet(r, q) + "</div>" +
            "</a>"
          );
          a.addEventListener("click", function () { setTimeout(hide, 10); });
          searchResults.appendChild(a);
        });
      }
      searchResults.hidden = false;
    }
    searchInput.addEventListener("input", show);
    searchInput.addEventListener("focus", function () { if (searchInput.value.trim().length >= 2) show(); });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".search-box")) hide();
    });
    searchInput.addEventListener("keydown", function (e) {
      var items = searchResults.querySelectorAll(".search-item");
      if (e.key === "Escape") { hide(); searchInput.blur(); }
      else if (e.key === "ArrowDown") { e.preventDefault(); if (selIdx < items.length - 1) { selIdx++; items.forEach(function (x) { x.classList.remove("sel"); }); items[selIdx].classList.add("sel"); } }
      else if (e.key === "ArrowUp") { e.preventDefault(); if (selIdx > 0) { selIdx--; items.forEach(function (x) { x.classList.remove("sel"); }); items[selIdx].classList.add("sel"); } }
      else if (e.key === "Enter") {
        if (selIdx >= 0 && items[selIdx]) { location.hash = items[selIdx].getAttribute("href"); hide(); searchInput.blur(); }
        else if (items[0]) { location.hash = items[0].getAttribute("href"); hide(); searchInput.blur(); }
      }
    });
  }

  /* ---------- Прокрутка к якорю ---------- */
  function scrollToAnchor(anchor) {
    if (!anchor) return;
    function jump() {
      var el = document.getElementById(anchor);
      if (!el) return false;
      var y = el.getBoundingClientRect().top + window.pageYOffset - 70;
      window.scrollTo(0, y);
      return true;
    }
    /* первый прыжок сразу, повторы — на случай подгрузки картинок, сдвигающих раскладку */
    if (!jump()) return;
    setTimeout(jump, 300);
    setTimeout(jump, 900);
  }

  /* ---------- Запуск ---------- */
  function onRoute() {
    var r = parseHash();
    navigate();
    setActiveNav("#/" + r.parts.join("/") + (r.anchor ? "#" + r.anchor : ""));
    updateTopbarProgress();
    if (r.anchor) scrollToAnchor(r.anchor);
    /* для theory-страниц якоря вида #/theory#sec */
  }

  window.addEventListener("hashchange", onRoute);

  buildNav();
  initSearch();
  onRoute();
})();
