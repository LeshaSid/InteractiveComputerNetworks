/* Метаданные лабораторной работы 2 — ШАБЛОН.
   Замените поля на реальные. Затем:
   1) зарегистрируйте в content/registry.js
   2) подключите 5 скриптов в index.html (см. README) */
window.Site.labs.lab2 = {
  id: "lab2",
  num: 2,
  title: "Название лабораторной работы из методички",
  short: "Короткое название для хлебных крошек",
  icon: "🔀",
  goal: "Цель работы — одна строка из методички.",
  pkaFiles: [
    "N.N.N Packet Tracer - Example.pka"
  ],
  tasks: [
    { id: "t1", num: "2.1", title: "Название задания 1", file: "файл.pka" },
    { id: "t2", num: "2.2", title: "Название задания 2", file: "файл.pka" }
  ],
  quizId: "lab2-quiz",
  quizTotal: 8,
  flashId: "lab2-cards",
  flashTotal: 10,
  checklists: [
    {
      id: "lab2-setup",
      title: "Подготовка",
      items: [
        "Файлы .pka скачаны",
        "Открываются в Packet Tracer"
      ]
    }
  ]
};
