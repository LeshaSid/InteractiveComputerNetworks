/* Метаданные лабораторной работы 1 */
window.Site.labs.lab1 = {
  id: "lab1",
  num: 1,
  title: "Основы компьютерных сетей. Физический и канальный уровень OSI/ISO. Знакомство с Cisco Packet Tracer",
  short: "Введение в сети, OSI и Cisco IOS",
  icon: "🌐",
  goal: "Изучить задачи физического и канального уровней модели OSI/ISO, ознакомиться с видами топологий, средами передачи данных и другими сетевыми моделями, научиться пользоваться основными командами Cisco IOS.",
  pkaFiles: [
    "1.4.2 Packet Tracer - Representing the Network.pka",
    "2.2.1.2 Packet Tracer - Navigating the IOS.pka",
    "2.2.3.3 Packet Tracer - Configuring Initial Switch Settings.pka",
    "2.4.1.2 Packet Tracer - Skills Integration Challenge.pka",
    "6.3.1.10 Packet Tracer - Exploring Internetworking Devices.pka"
  ],
  tasks: [
    { id: "t1", num: "1.1", title: "Представление сети (Packet Tracer)", file: "1.4.2 … Representing the Network.pka" },
    { id: "t2", num: "1.2", title: "Навигация по Cisco IOS", file: "2.2.1.2 … Navigating the IOS.pka" },
    { id: "t3", num: "1.3", title: "Первоначальные настройки коммутатора", file: "2.2.3.3 … Configuring Initial Switch Settings.pka" },
    { id: "t4", num: "1.4", title: "ARP и Wireshark", file: "задание wireshark.docx" },
    { id: "t5", num: "1.5", title: "Комплексная отработка навыков", file: "2.4.1.2 … Skills Integration Challenge.pka" },
    { id: "t6", num: "1.6", title: "Изучение межсетевых устройств", file: "6.3.1.10 … Exploring Internetworking Devices.pka" }
  ],
  quizId: "lab1-quiz",
  quizTotal: 12,
  flashId: "lab1-cards",
  flashTotal: 14,
  checklists: [
    {
      id: "lab1-setup",
      title: "Подготовка окружения",
      items: [
        "Скачан и установлен Cisco Packet Tracer",
        "Установлен Wireshark (для задания 1.4)",
        "Файлы .pka заданий скачаны и открываются в Packet Tracer",
        "Сделан бэкап конфигураций перед перезагрузкой любых устройств"
      ]
    }
  ]
};
