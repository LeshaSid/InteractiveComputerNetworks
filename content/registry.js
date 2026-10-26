/* Реестр курса: лабораторные работы и разделы.
   Чтобы добавить новую лабораторную: создайте папку content/labs/labN/ с файлами
   meta.js, theory.js, tasks.js, quiz.js, flashcards.js — и добавьте одну строку сюда.
*/
window.Site = window.Site || {};

Site.registry = {
  labs: [
    {
      id: "lab1",
      num: 1,
      title: "Введение в сети, модели OSI и Cisco IOS",
      icon: "🌐",
      desc: "Знакомство с Packet Tracer, навигация по Cisco IOS, первичная настройка коммутатора, ARP и анализ трафика в Wireshark.",
      tasksCount: 6,
      contentDir: "content/labs/lab1/"
    }
    /* Пример добавления Lab 2:
    ,{
      id: "lab2",
      num: 2,
      title: "Настройка VLAN и trunk",
      icon: "🔀",
      desc: "...",
      tasksCount: 5,
      contentDir: "content/labs/lab2/"
    }
    */
  ]
};

Site.labs = Site.labs || {};
Site.quizzes = Site.quizzes || {};
Site.decks = Site.decks || {};
