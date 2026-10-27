/* Теория лабораторной 2 — ШАБЛОН */
window.Site.labTheory = window.Site.labTheory || {};
window.Site.labTheory.lab2 = [
  { type: "h2", text: "О чём эта лабораторная" },
  { type: "p", text: "Кратко: что делаем и зачем (2–4 предложения)." },
  { type: "h2", text: "Ключевые понятия" },
  { type: "table", head: ["Понятие", "Коротко"], rows: [
    ["Пример", "описание"]
  ]},
  { type: "h2", text: "Порядок действий" },
  { type: "ol", items: [
    "**Задание 2.1** — …",
    "**Задание 2.2** — …"
  ]},
  { type: "callout", kind: "tip", title: "Совет", text: "Проверьте теорию перед стартом." },
  /* виджеты по желанию: { type: "cli" }, { type: "pt" }, { type: "osi" }, { type: "pinout" } */
  { type: "cli" }
];
