/* Задания лабораторной 2 — ШАБЛОН */
window.Site.labTasks = window.Site.labTasks || {};
window.Site.labTasks.lab2 = [
  {
    id: "t1",
    num: "2.1",
    title: "Название задания 1",
    intro: "Что нужно сделать (1–2 предложения).",
    blocks: [
      { type: "h2", text: "Шаги" },
      { type: "ol", items: ["Шаг 1", "Шаг 2"] },
      { type: "cmd", title: "Пример", lines: [
        { cmd: "enable" },
        { cmd: "configure terminal" }
      ]},
      { type: "img", src: "assets/img/lab2/screenshot1.jpg", caption: "Скриншот (положите файл)" },
      { type: "qa", q: "Вопрос из методички?", a: "Ответ." },
      { type: "callout", kind: "warn", title: "Внимание", text: "Частая ошибка." }
    ]
  },
  {
    id: "t2",
    num: "2.2",
    title: "Название задания 2",
    intro: "…",
    blocks: [
      { type: "h2", text: "Шаги" },
      { type: "ul", items: ["Пункт"] },
      { type: "qa", q: "Вопрос?", a: "Ответ." }
    ]
  }
];
