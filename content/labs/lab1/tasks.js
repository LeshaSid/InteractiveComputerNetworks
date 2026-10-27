/* Задания лабораторной 1: вопросы из методички + ответы из отчётов */
window.Site.labTasks = window.Site.labTasks || {};
window.Site.labTasks.lab1 = [

  /* ================= ЗАДАНИЕ 1.1 ================= */
  {
    id: "t1",
    num: "1.1",
    title: "Представление сети (Packet Tracer)",
    intro: "Знакомство с интерфейсом Packet Tracer, режимами Realtime/Simulation, логическим и физическим представлением сети, а также компонентами LAN, WAN и Интернет в учебной топологии.",
    blocks: [
      { type: "h2", text: "Часть 1. Обзор программы Packet Tracer" },
      { type: "img", src: "assets/img/lab1/reports/lab1_1-img6.jpg", wide: true, caption: "Интерфейс Packet Tracer: логическая рабочая область, панель инструментов, режимы Realtime/Simulation (из отчёта)" },
      { type: "p", text: "Доступ к справке: знак **?** в правом верхнем углу или меню **Help → Contents**. Учебные видеоролики — **Help → Tutorials** (Interface Overview, Simulation Environment)." },
      { type: "qa", q: "В окне «IP Configuration» (Desktop → IP Configuration) что можно настроить?", a: "Настройки DHCP/Static: IP-адрес, маска подсети, шлюз по умолчанию, DNS-сервер; при DHCP — автоматическое получение параметров." },
      { type: "img", src: "assets/img/lab1/reports/lab1_1-img1.jpg", caption: "Окно IP Configuration в Packet Tracer (пример из отчёта)" },
      { type: "h3", text: "Режимы Realtime и Simulation" },
      { type: "p", text: "В правом нижнем углу — переключатель **Realtime / Simulation**. В Simulation-режиме нажмите **Auto capture/Play** — пакеты (конвертики) начнут двигаться между устройствами. Щёлкните конвертик на промежуточном устройстве — откроются вкладки OSI Model, Inbound PDU Details, Outbound PDU Details." },
      { type: "qa", q: "На вкладке OSI Model — сколько уровней In Layers и Out Layers содержат информацию (для OSPF-пакета на маршрутизаторе)?", a: "В реальной модели обычно **In Layers = 3** (Physical, Data Link, Network — пакет входит сюда) и **Out Layers = 3** (Network, Data Link, Physical — выходит). Для пакетов маршрутизации (OSPF Hello) уровни выше сетевого не участвуют." },
      { type: "qa", q: "Что является заголовками основных разделов на вкладках Inbound/Outbound PDU Details?", a: "Разделы соответствуют заголовкам протоколов, через которые проходит пакет: **Ethernet II** (кадр L2), **IP** (пакет L3), **OSPF Hello** (пакет L3 маршрутизационного протокола)." },
      { type: "qa", q: "Изменились ли данные между Inbound и Outbound PDU Details? Если да — как?", a: "Да. В **Outbound PDU Details добавилось внизу** — при выходе пакета из устройства к нему добавляется/обновляется служебная информация (например, новый Ethernet-заголовок с MAC-адресом следующего hop'а на выходном интерфейсе)." },
      { type: "img", src: "assets/img/lab1/reports/lab1_1-img2.jpg", caption: "PDU Information — OSI Model и детали PDU (из отчёта)" },
      { type: "img", src: "assets/img/lab1/reports/lab1_1-img3.jpg", caption: "Inbound/Outbound PDU Details: заголовки Ethernet II → IP → OSPF (из отчёта)" },
      { type: "img", src: "assets/img/lab1/reports/lab1_1-img4.jpg", caption: "Содержимое конвертика на промежуточном устройстве: OSPF Hello, NEIGHBOR 64.100.200.2 (из отчёта)" },
      { type: "h3", text: "Logical и Physical" },
      { type: "p", text: "В левом верхнем углу переключатель **Logical / Physical**. Logical — рабочая область, где вы строите топологию. Physical — показывает физические размеры/размещение (например, этаж здания с серверной). В CCNA физическая область используется время от времени." },

      { type: "h2", text: "Часть 2. Изучение LAN, WAN и Интернет" },
      { type: "p", text: "В учебной топологии — упрощённая сеть среднего бизнеса: несколько LAN (Central, Branch, Home Office), WAN-связи и облака Интранет/Интернет." },
      { type: "img", src: "assets/img/lab1/reports/lab1_1-img5.jpg", caption: "Центральная часть топологии Packet Tracer (из отчёта)" },
      { type: "img", src: "assets/img/lab1/reports/lab1_1-img7.jpg", wide: true, caption: "Учебная топология целиком: LAN Central, Branch, Home Office, WAN и облака Интернет/Интранет (из отчёта)" },
      { type: "qa", q: "Категории промежуточных устройств в панели инструментов?", a: "**Routers, Switches, Hubs, Wireless Devices** — плюс в топологии промежуточными могут служить и End Devices (например, IP-телефон). Категория Connections (⚡) — сетевые носители." },
      { type: "qa", q: "Сколько оконечных устройств (не учитывая облака Интернет/Интранет)?", a: "**13 оконечных устройств**." },
      { type: "qa", q: "Сколько промежуточных устройств (не учитывая два облака)?", a: "**12 промежуточных устройств**." },
      { type: "qa", q: "Сколько из них — маршрутизаторы? (учтите Linksys)", a: "**R2, R4 и WRS (Linksys)** — всего **3 маршрутизатора**." },
      { type: "qa", q: "Сколько оконечных устройств НЕ являются настольными компьютерами?", a: "**6 устройств** (серверы, IP-телефон, ноутбук и т.п. — всё, кроме desktop-ПК)." },
      { type: "qa", q: "Сколько типов соединений используется в топологии?", a: "**4 типа**: Copper Straight-Through (витая пара), Serial DTE (последовательное соединение WAN), беспроводное соединение, коаксиальный кабель." },
      { type: "qa", q: "Почему в категории «Connections» нет значка соединения для беспроводной сети?", a: "Потому что **нет физического кабеля**: беспроводные устройства **сопрягаются автоматически** при совпадении их параметров (SSID, частота, пароль)." },
      { type: "qa", q: "Packet Tracer: Server-PT может быть сервером, а настольные ПК — нет. Справедливо ли в реальном мире? Опишите модель «клиент-сервер».", a: "Нет, **в реальном мире** настольный/портативный ПК тоже может быть сервером, если установлено серверное ПО. Модель «клиент-сервер»: **клиент** создаёт и отправляет запросы, когда пользователю что-то нужно; **сервер** ожидает запросов, хранит ресурсы и отдаёт информацию только по запросу." },
      { type: "qa", q: "Назовите минимум два промежуточных устройства из топологии.", a: "**HWIC-2** (роутер-модуль), **PT-MODEM-NM-1CE** (модем), **WRT300N** (домашний беспроводной роутер)." },
      { type: "qa", q: "Минимум два критерия выбора типа среды передачи данных?", a: "**1) Пропускная способность и скорость**; **2) Дальность передачи**; 3) Помехозащищённость; 4) Стоимость и сложность монтажа." },
      { type: "qa", q: "Чем отличаются LAN и WAN? Примеры. Сколько в модели LAN и WAN?", a: "**LAN** — малый масштаб (обычно ≤ одного здания), принадлежит организации/частному лицу, в основном витая пара. **WAN** — большой масштаб, принадлежит провайдерам, используются оптоволокно, спутник, радиосвязь. В модели Packet Tracer: **2 глобальные сети** (Интранет и Интернет) и **3 локальные сети** (Central, Branch, Home Office)." },
      { type: "qa", q: "Кратко опишите сеть Интернет.", a: "**Интернет** — глобальная всемирная сеть, связывающая миллиарды компьютеров, серверов, локальных и региональных сетей." },
      { type: "qa", q: "Распространённые способы подключения домашних пользователей к Интернету? Пользователей организаций в вашем регионе?", a: "**Дома**: оптоволокно, витая пара, беспроводная сеть, спутниковый интернет. **Организации**: выделенный волоконно-оптический канал, беспроводной канал (обычно как резервный)." },
      { type: "checklist", id: "lab1-t1", items: [
        "Открыл(-а) справку Packet Tracer (Help → Contents)",
        "Посмотрел(-а) учебный ролик Interface Overview",
        "Переключился(-ась) в режим Simulation и рассмотрел(-а) конвертик на маршрутизаторе",
        "Переключился(-ась) в Physical и обратно в Logical",
        "Ответил(-а) на все вопросы части 2"
      ]},
      { type: "callout", kind: "tip", title: "Баллы", text: "Часть 1 — 10 баллов, Часть 2 — 90 баллов. Оценка PT автоматическая + ваши письменные ответы." }
    ]
  },

  /* ================= ЗАДАНИЕ 1.2 ================= */
  {
    id: "t2",
    num: "1.2",
    title: "Навигация по Cisco IOS",
    intro: "Консольное подключение к коммутатору, режимы IOS (user EXEC, privileged EXEC, global configuration), контекстная справка, автодополнение TAB, настройка часов и типичные сообщения об ошибках.",
    blocks: [
      { type: "h2", text: "Часть 1. Подключение и справка" },
      { type: "ol", items: [
        "В панели **Connections** (⚡) выберите **светло-голубой консольный кабель**.",
        "Щёлкните **PC1** → подключение к **RS-232**.",
        "Второй конец — коммутатор **S1** → выберите порт **Console**.",
        "На PC1: вкладка **Desktop → Terminal**. Параметры по умолчанию: **9600 бод**, 8 бит данных, без проверки чётности. Нажмите OK.",
        "Появится `Press RETURN to get started!` — нажмите Enter."
      ]},
      { type: "img", src: "assets/img/lab1/reports/lab1_2-img1.jpg", caption: "Окно настройки Terminal в Packet Tracer (9600 бод)" },
      { type: "p", text: "Полезно сразу выполнить `show version` — в выводе видны модель (WS-C2960-24TT), версия IOS (12.2/15.0), объём памяти и MAC-адрес устройства:" },
      { type: "img", src: "assets/img/lab1/reports/lab1_2-img2.jpg", wide: true, caption: "Вывод show version: модель, версия ПО, память, серийный номер (из отчёта)" },
      { type: "qa", q: "Какое значение параметра в битах/с (скорость передачи) в Terminal?", a: "**9600** бод — стандартная скорость консольного порта Cisco." },
      { type: "qa", q: "Какое приглашение показано на экране?", a: "`Switch>` — **пользовательский режим (user EXEC)**. Приглашение имеет вид `ИМЯ>`, т.к. имя ещё не задано." },
      { type: "h3", text: "Контекстная справка «?»" },
      { type: "cmd", title: "сессия на коммутаторе S1", lines: [
        { cmd: "S1> ?" },
        { out: "connect     Open tty connections" },
        { hl: "connect — единственная команда на букву «c»" },
        { cmd: "S1> t?" },
        { out: "telnet  terminal  traceroute" },
        { cmd: "S1> te?" },
        { out: "telnet  terminal" }
      ]},
      { type: "qa", q: "Какая команда начинается с буквы «c» (user EXEC)?", a: "**connect**." },
      { type: "qa", q: "Что показывает `t?` и `te?`?", a: "`t?` → **telnet, terminal, traceroute**. `te?` → **telnet, terminal**. Это и есть **контекстная справка** — при расширении префикса IOS показывает, что можно ввести дальше." },

      { type: "h2", text: "Часть 2. Режимы ввода" },
      { type: "cmd", title: "переход между режимами", lines: [
        { cmd: "S1> ?" },
        { hl: "enable — Turn on privileged commands (включить привилегированные команды)" },
        { cmd: "S1> en<TAB>" },
        { out: "→ команда дополнилась до: enable" },
        { cmt: "! te<TAB> ничего не сделает — telnet/terminal неоднозначны; tel<TAB> → telnet" },
        { cmd: "S1> enable" },
        { hl: "S1#" },
        { cmd: "S1# ?" },
        { out: "clear  clock  configure  connect  copy  … (команд намного больше, чем в user EXEC)" },
        { cmd: "S1# configure" },
        { out: "Configuring from terminal, memory, or network [terminal]?" },
        { cmd: "S1# <Enter>  (принять [terminal] по умолчанию)" },
        { hl: "S1(config)#  — режим глобальной конфигурации" },
        { out: "Enter configuration commands, one per line. End with CNTL/Z." },
        { cmd: "S1(config)# exit   (или end, или Ctrl-Z)" },
        { hl: "S1#" }
      ]},
      { type: "qa", q: "Что отображается после нажатия TAB на `en`?", a: "Команда **дополнилась до `enable`** — автодополнение работает, если введённых символов достаточно для **уникального** определения команды." },
      { type: "qa", q: "Что будет при вводе `te<TAB>`? А `tel<TAB>`?", a: "`te<TAB>` — **ничего** (несколько кандидатов: telnet, terminal). `tel<TAB>` → **telnet**." },
      { type: "qa", q: "Как изменилась строка приглашения после enable?", a: "`S1>` → **`S1#`** — привилегированный режим EXEC (privileged EXEC)." },
      { type: "qa", q: "Сколько команд на «c» доступно в privileged EXEC (введите `c?`)?", a: "**clear, clock, configure, connect, copy** — в privileged EXEC команд существенно больше, чем в user EXEC (где была только connect)." },
      { type: "qa", q: "Какое сообщение выдал `configure`? Как принять терминал по умолчанию?", a: "`Configuring from terminal, memory, or network [terminal]?` — просто нажать **Enter**, приняв параметр в квадратных скобках [terminal]." },
      { type: "qa", q: "Как вернуться из config в privileged EXEC?", a: "`exit`, `end` или сочетание **Ctrl-Z**." },

      { type: "h2", text: "Часть 3. Настройка часов" },
      { type: "cmd", title: "команда clock", lines: [
        { cmd: "S1# show clock" },
        { out: "*0:4:3.463 UTC Mon Mar 1 1993   (дата по умолчанию «родная» для образа IOS)" },
        { cmd: "S1# clock" },
        { err: "% Incomplete command." },
        { cmd: "S1# clock ?" },
        { out: "set  Set the time and date" },
        { cmd: "S1# clock set ?" },
        { out: "hh:mm:ss  Current Time" },
        { cmd: "S1# clock set 15:00:00 ?" },
        { out: "<1-31>  Day of the month" },
        { out: "MONTH   Month of the year" },
        { cmd: "S1# clock set 15:00:00 31 Jan 2035" },
        { cmd: "S1# show clock" },
        { hl: "*15:0:4.869 UTC Tue Jan 31 2035" }
      ]},
      { type: "qa", q: "Что отображает `show clock` до настройки?", a: "`*0:4:3.463 UTC Mon Mar 1 1993` — **1993 год** (заводская дата образа)." },
      { type: "qa", q: "Что показывает просто `clock` без параметров?", a: "**% Incomplete command.** — IOS требует обязательные параметры (`set hh:mm:ss day month`)." },
      { type: "h3", text: "Типичные сообщения об ошибках" },
      { type: "cmd", title: "разбор ошибок", lines: [
        { cmd: "S1# cl" },
        { err: '% Ambiguous command: "cl"  — несколько кандидатов (clear, clock, …)' },
        { cmd: "S1# clock" },
        { err: "% Incomplete command.  — не хватает обязательных параметров" },
        { cmd: "S1# clock set 25:00:00" },
        { err: "% Invalid input detected at '^' marker.  — 25 часов недопустимо (часы 0–23)" },
        { cmd: "S1# clock set 15:00:00 32" },
        { err: "% Invalid input detected at '^' marker.  — 32-го дня месяца не бывает" }
      ]},
      { type: "checklist", id: "lab1-t2", items: [
        "Подключил(-а) PC1 к S1 консольным кабелем",
        "Открыл(-а) Terminal (9600 бод) и увидел приглашение Switch>",
        "Отработал(-а) контекстную справку: `?`, `t?`, `te?`",
        "Перешёл(-а) в enable → configure terminal → exit",
        "Пополнил(-а) команду через TAB",
        "Установил(-а) часы `clock set …` и проверил через `show clock`",
        "Увидел(-а) и разобрал(-а) ошибки Ambiguous / Incomplete / Invalid input"
      ]}
    ]
  },

  /* ================= ЗАДАНИЕ 1.3 ================= */
  {
    id: "t3",
    num: "1.3",
    title: "Первоначальные настройки коммутатора",
    intro: "Безопасность CLI: hostname, пароль консоли, enable password и enable secret, шифрование паролей, баннер MOTD, сохранение конфигурации в NVRAM. Настройка двух коммутаторов S1 и S2.",
    blocks: [
      { type: "h2", text: "Часть 1. Проверка конфигурации по умолчанию" },
      { type: "cmd", title: "осмотр running-config", lines: [
        { cmd: "Switch> enable" },
        { hl: "Switch#" },
        { cmd: "Switch# show running-config" },
        { out: "Building configuration..." },
        { out: "Current configuration : 1048 bytes" },
        { out: "!" },
        { out: "version 15.0" },
        { hl: "interface FastEthernet0/1  … 0/24   (24 FastEthernet)" },
        { hl: "interface GigabitEthernet0/1  0/2    (2 Gigabit)" },
        { out: "!" },
        { out: "line con 0" },
        { out: "line vty 0 4" },
        { out: "line vty 5 15" }
      ]},
      { type: "qa", q: "Сколько у коммутатора интерфейсов FastEthernet? GigabitEthernet?", a: "**24 FastEthernet** и **2 GigabitEthernet** (стандарт C2960-24TT)." },
      { type: "qa", q: "Какой диапазон значений в vty-линиях?", a: "**0 4 и 5 15** — для удалённого доступа (telnet/ssh)." },
      { type: "qa", q: "Какая команда показывает содержимое NVRAM?", a: "**show startup-config**." },
      { type: "qa", q: "Почему `startup-config is not present`?", a: "Потому что **конфигурация ещё ни разу не сохранялась** в NVRAM (`copy running-config startup-config` не выполнялся)." },

      { type: "h2", text: "Часть 2. Основные параметры безопасности" },
      { type: "cmd", title: "настройка S1 (по шагам методички)", lines: [
        { cmt: "! Шаг 1 — имя устройства:" },
        { cmd: "Switch# configure terminal" },
        { cmd: "Switch(config)# hostname S1" },
        { cmd: "S1(config)# exit" },
        { cmt: "! Шаг 2 — пароль консоли:" },
        { cmd: "S1# configure terminal" },
        { cmd: "S1(config)# line console 0" },
        { cmd: "S1(config-line)# password letmein" },
        { cmd: "S1(config-line)# login" },
        { cmd: "S1(config-line)# exit" },
        { cmd: "S1(config)# exit" },
        { out: "%SYS-5-CONFIG_I: Configured from console by console" },
        { cmt: "! Шаг 4 — пароль enable (плоский текст):" },
        { cmd: "S1> enable" },
        { cmd: "S1# configure terminal" },
        { cmd: "S1(config)# enable password c1$c0" },
        { cmt: "! (0 в c1$c0 — это ЦИФРА НОЛЬ, не буква O!)" },
        { cmt: "! Шаг 6 — зашифрованный пароль enable secret:" },
        { cmd: "S1(config)# enable secret itsasecret" },
        { cmt: "! Шаг 8 — зашифровать ВСЕ открытые пароли:" },
        { cmd: "S1(config)# service password-encryption" },
        { cmd: "S1(config)# exit" }
      ]},
      { type: "img", src: "assets/img/lab1/reports/lab1_3-img2.jpg", caption: "line console 0 / password letmein / login (из отчёта)" },
      { type: "img", src: "assets/img/lab1/reports/lab1_3-img3.jpg", caption: "enable password и enable secret (из отчёта)" },
      { type: "img", src: "assets/img/lab1/reports/lab1_3-img1.jpg", caption: "Переход в config-режим и смена hostname (из отчёта)" },
      { type: "qa", q: "Для чего нужна команда `login`?", a: "**Активировать проверку установленного пароля** при подключении к консоли. Без `login` пароль спрашиваться не будет (частая ошибка)." },
      { type: "qa", q: "Что отображается при выводе `enable secret` в show run?", a: "`enable secret 5 $1$mERr$ILwq/b7kc.7X/ejA4Aosn0` — **5** означает тип шифрования MD5, пароль хранится в **зашифрованном виде**." },
      { type: "qa", q: "Почему `enable secret` показывается не в открытом виде?", a: "Потому что он **был зашифрован** (команда secret шифрует сразу при записи, тип 5 = MD5)." },
      { type: "qa", q: "Если добавить новые пароли после `service password-encryption` — будут ли они шифроваться?", a: "Если задавать через **`enable secret`** — да, они **сразу шифруются** (MD5, тип 5). Если через **`enable password`** или пароль линии — IOS **зашифрует их «на лету»** (типы 7) при вводе, пока сервис активен. В целом: `service password-encryption` шифрует все открытые пароли в конфигурации в слабый тип 7; для настоящей защиты предпочтительнее `enable secret`." },
      { type: "img", src: "assets/img/lab1/reports/lab1_3-img5.jpg", caption: "service password-encryption (из отчёта)" },
      { type: "p", text: "После шифрования в `show running-config` открытые пароли отображаются с префиксом типа 7, а `enable secret` — с типом 5 (MD5):" },
      { type: "img", src: "assets/img/lab1/reports/lab1_3-img6.jpg", caption: "show run: enable secret 5 $1$… и enable password 7 08221D0A0A49 (из отчёта)" },
      { type: "img", src: "assets/img/lab1/reports/lab1_3-img7.jpg", caption: "Зашифрованный пароль линии: password 7 082D495A041C0C19 + login (из отчёта)" },
      { type: "callout", kind: "warn", title: "enable secret vs enable password", text: "**Secret переопределяет password.** Если заданы оба, для входа в privileged EXEC потребуется вводить пароль **enable secret**. `enable password` устарел и хранит пароль слабее (или вообще открытым) — используйте только `enable secret`." },

      { type: "h2", text: "Часть 3. Баннер MOTD" },
      { type: "cmd", title: "сообщение дня", lines: [
        { cmd: "S1# config t" },
        { cmd: "S1(config)# banner motd \"This is a secure system. Authorized Access Only!\"" },
        { cmd: "S1(config)# exit" },
        { out: "%SYS-5-CONFIG_I: Configured from console by console" }
      ]},
      { type: "img", src: "assets/img/lab1/reports/lab1_3-img4.jpg", caption: "Настройка баннера MOTD на S2: \"Authorized access only. …\" (из отчёта)" },
      { type: "qa", q: "В каких случаях отображается баннер MOTD?", a: "**При входе в систему** (до запроса пароля) — любой, кто подключается к консоли/telnet, увидит его первым." },
      { type: "qa", q: "Зачем настраивать баннер MOTD на всех коммутаторах?", a: "1) **Юридическая защита** — предупреждение о запрете несанкционированного доступа («prosecuted to the full extent of the law»). 2) **Полезная информация** для администратора (местоположение устройства, contact-данные). В задании 1.5 требуется баннер со словом **warning**." },

      { type: "h2", text: "Часть 4. Сохранение в NVRAM" },
      { type: "cmd", title: "сохранение конфигурации", lines: [
        { cmd: "S1# show run" },
        { cmt: "! проверить конфигурацию перед сохранением" },
        { cmd: "S1# copy running-config startup-config" },
        { out: "Destination filename [startup-config]?" },
        { cmd: "<Enter>" },
        { out: "Building configuration..." },
        { hl: "[OK]" },
        { cmd: "S1# show startup-config" },
        { out: "Building configuration..." },
        { out: "(содержимое идентично running-config — все изменения записаны)" }
      ]},
      { type: "qa", q: "Самая короткая версия `copy running-config startup-config`?", a: "**`copy run start`**. Также часто используется **`write`** (или `wr`). Все три варианта делают одно и то же: копируют конфиг из RAM в NVRAM." },
      { type: "qa", q: "Какая команда показывает содержимое NVRAM? Все ли изменения записаны?", a: "**show startup-config**. Да — **все внесённые изменения записаны** в файл (после успешного copy)." },

      { type: "h2", text: "Часть 5. Настройка коммутатора S2 (самостоятельно)" },
      { type: "p", text: "Повторите для **S2** все те же шаги, что и для S1:" },
      { type: "table", head: ["Параметр", "Значение"], rows: [
        ["Имя устройства", "`S2`"],
        ["Пароль консоли (line console 0)", "`letmein` + `login`"],
        ["Пароль privileged EXEC", "`enable password c1$c0`"],
        ["Зашифрованный пароль enable", "`enable secret itsasecret`"],
        ["Баннер MOTD", "Authorized access only. Unauthorized access is prohibited and violators will be prosecuted to the full extent of the law."],
        ["Шифрование всех паролей", "`service password-encryption`"],
        ["Сохранение", "`copy running-config startup-config` (или `copy run start`)"]
      ]},
      { type: "img", src: "assets/img/lab1/reports/lab1_3-img8.jpg", caption: "copy running-config startup-config → [OK] (из отчёта)" },
      { type: "cli", title: "switch" },
      { type: "checklist", id: "lab1-t3", items: [
        "Задал(-а) hostname S1",
        "Настроил(-а) line console 0: password letmein + login",
        "Задал(-а) enable password c1$c0",
        "Задал(-а) enable secret itsasecret",
        "Включил(-а) service password-encryption",
        "Настроил(-а) баннер MOTD",
        "Сохранил(-а) конфиг: copy run start",
        "Повторил(-а) всё для S2",
        "Проверил(-а) show run и show startup-config после сохранения"
      ]}
    ]
  },

  /* ================= ЗАДАНИЕ 1.4 ================= */
  {
    id: "t4",
    num: "1.4",
    title: "ARP и Wireshark",
    intro: "Просмотр и очистка ARP-кэша в Windows/Linux, захват ARP-обмена в Wireshark, заполнение таблиц полей первого и второго ARP-пакетов, анализ задержек сети.",
    blocks: [
      { type: "h2", text: "Часть 1. ARP-кэш в командной строке" },
      { type: "cmd", title: "Windows / Linux", lines: [
        { cmd: "C:\\> arp -a" },
        { out: "Интерфейс: 10.184.247.77 --- 0x3" },
        { hl: "  10.184.247.143    14-ac-60-32-88-b5     dynamic" },
        { cmd: "C:\\> arp -d *" },
        { cmt: "! удалить ВСЕ записи (Windows)" },
        { cmd: "C:\\> arp -a" },
        { out: "(кэш пуст)" },
        { cmd: "$ arp -d 192.168.1.11   # Linux: удалить запись для конкретного IP" },
        { cmd: "$ ip neigh show        # Linux: аналог arp -a" }
      ]},
      { type: "img", src: "assets/img/lab1/reports/wireshark-img1.jpg", caption: "arp -a: запись о шлюзе 46:e8:07:91:fc:57 (из отчёта)" },
      { type: "img", src: "assets/img/lab1/reports/wireshark-img2.jpg", caption: "Linux: arp -a — строка _gateway (10.184.247.77) on wlan0 (из отчёта)" },
      { type: "qa", q: "Какая команда отобразит все записи ARP-кэша?", a: "**`arp -a`** (Windows). В Linux — **`ip neigh show`** или `arp -n`." },
      { type: "qa", q: "Как удалить ВСЕ записи ARP-кэша? (и почему `sudo arp -d *` в Linux не сработает)", a: "В **Windows**: **`arp -d *`** (с правами администратора). В **Linux** `arp -d *` **не поддерживает маску `*`** — удаляйте по одной (`arp -d <ip>`) или через `ip neigh flush all`." },
      { type: "qa", q: "Как удалить запись только для 192.168.1.11?", a: "**`arp -d 192.168.1.11`** — удаляет конкретную запись. После этого при следующем обращении хост снова выполнит ARP-обмен." },
      { type: "img", src: "assets/img/lab1/reports/wireshark-img4.jpg", caption: "Linux: попытка arp -d с sudo возвращает SIOCDARP(dontpub): Network is unreachable — удаляйте без sudo или через ip neigh flush (из отчёта)" },
      { type: "img", src: "assets/img/lab1/reports/wireshark-img3.jpg", wide: true, caption: "Очистка всех записей в цикле (Linux): для каждого IP из arp -n выполнить sudo arp -d (из отчёта)" },

      { type: "h2", text: "Часть 2. Анализ ARP в Wireshark" },
      { type: "ol", items: [
        "Запустите Wireshark, выберите интерфейс для захвата, начните Capture.",
        "Фильтром `arp` покажите только ARP-пакеты.",
        "Очистите кэш: `arp -d *`.",
        "Выполните `ping 192.168.1.1` (шлюз по умолчанию) — пинг «пробудит» ARP.",
        "Остановите захват и разберите пакеты: какой был первым? вторым?"
      ]},
      { type: "img", src: "assets/img/lab1/reports/wireshark-img5.jpg", caption: "Захват ARP в Wireshark (из отчёта)" },
      { type: "img", src: "assets/img/lab1/reports/wireshark-img6.jpg", wide: true, caption: "Wireshark: панель пакетов ARP и разбор Ethernet II / Address Resolution Protocol в нижних панелях (из отчёта)" },
      { type: "qa", q: "Какой пакет ARP был первым?", a: "**ARP-запрос (Request)** — broadcast: «У кого IP-адрес 10.184.247.143? Скажите 10.184.247.77»." },
      { type: "table", head: ["Поле", "Значение (1-й пакет — Request)"], rows: [
        ["MAC-адрес отправителя", "`46:e8:07:91:fc:57`"],
        ["IP-адрес отправителя", "`10.184.247.77`"],
        ["MAC-адрес назначения", "`00:00:00:00:00:00` (в запросе MAC ещё неизвестен — нули)"],
        ["IP-адрес назначения", "`10.184.247.143`"]
      ]},
      { type: "qa", q: "Какой пакет ARP был вторым?", a: "**ARP-ответ (Reply)** — unicast: «10.184.247.143 — у меня, вот мой MAC»." },
      { type: "table", head: ["Поле", "Значение (2-й пакет — Reply)"], rows: [
        ["MAC-адрес отправителя", "`14:ac:60:32:88:b5`"],
        ["IP-адрес отправителя", "`10.184.247.143`"],
        ["MAC-адрес назначения", "`46:e8:07:91:fc:57`"],
        ["IP-адрес назначения", "`10.184.247.77`"]
      ]},
      { type: "callout", kind: "deep", title: "Почему в Request MAC назначения = нули?", text: "В момент запроса отправитель **ещё не знает** MAC адресата — для этого и выполняет запрос! Поле Target MAC в запросе заполнено нулями. В ответе наоборот: отправитель уже знает оба MAC и указывает их явно." },

      { type: "h2", text: "Часть 3. Анализ задержек, вызванных ARP" },
      { type: "p", text: "Повторите захват: очистите ARP, выполните `ping` на шлюз и на ПК другого пользователя, затем фильтром `arp or icmp` изучите последовательность. Первый ICMP-пакет может подождать, пока ARP-обмен завершится — это и есть «компромисс производительности»: при отсутствии кэша ARP вынужден рассылать broadcast каждый раз, добавляя задержку и нагрузку на сеть." },
      { type: "img", src: "assets/img/lab1/reports/wireshark-img7.jpg", caption: "ping с замером времени отклика (из отчёта)" },
      { type: "img", src: "assets/img/lab1/reports/wireshark-img8.jpg", caption: "Linux ping -c 4: 0% packet loss, min/avg/max = 129/153/183 ms — заметьте заметный min из-за ARP-обмена (из отчёта)" },
      { type: "h3", text: "Вопросы на закрепление (из методички)" },
      { type: "qa", q: "Как и когда удаляются статические записи ARP?", a: "**Удаляются вручную администратором** (командой `arp -d <ip>`). **Автоматически не удаляются** — в отличие от динамических записей, у которых есть TTL." },
      { type: "qa", q: "Зачем добавлять статические записи ARP в кэш?", a: "1) **Безопасность** — защита от ARP-спуфинга (злоумышленник не подменит MAC шлюза, если запись статическая). 2) **Исключение задержек** при обращении к критически важным узлам — не нужно ждать ARP-обмена." },
      { type: "qa", q: "Если ARP-запросы вызывают задержки, почему не рекомендуется снимать ограничения на время ожидания отклика (TTL) для записей ARP?", a: "Если запись **будет висеть вечно**, то при **смене оборудования или IP-адреса** компьютер будет отправлять данные на **старый MAC** и связь прервётся. Нужен **баланс** между производительностью (длинный TTL = меньше запросов) и актуальностью (короткий TTL = быстрая реакция на изменения)." },
      { type: "callout", kind: "tip", title: "Связь с теорией", text: "Всё это — работа **канального уровня (L2)** при обслуживании **сетевого (L3)**: ARP «переводит» IP в MAC. Именно поэтому ARP-запрос — это broadcast-кадр Ethernet, который **не проходит через маршрутизатор** (L3 разделяет broadcast-домены)." },
      { type: "checklist", id: "lab1-t4", items: [
        "Выполнил(-а) arp -a и увидел(-а) записи (шлюз, соседи)",
        "Очистил(-а) кэш: arp -d * (Windows) / поштучно (Linux)",
        "Захватил(-а) ARP в Wireshark (фильтр arp)",
        "Заполнил(-а) таблицы полей 1-го (Request) и 2-го (Reply) пакетов",
        "Сделал(-а) ping с очищенным кэшем и сравнил(-а) задержки",
        "Ответил(-а) на 3 вопроса на закрепление"
      ]}
    ]
  },

  /* ================= ЗАДАНИЕ 1.5 ================= */
  {
    id: "t5",
    num: "1.5",
    title: "Комплексная отработка навыков (Skills Integration)",
    intro: "Два коммутатора и два ПК: имена, пароли, шифрование, баннер MOTD, IP-адресация VLAN1, проверка связности. Гайд по командам и таблица адресации.",
    blocks: [
      { type: "h2", text: "Сценарий и требования" },
      { type: "p", text: "Менеджер просит демонстрацию навыков: настройте **два коммутатора** (Room-145, Room-146) и **два узла** (Manager, Reception) так, чтобы конечные устройства видели друг друга." },
      { type: "table", head: ["Устройство", "Интерфейс", "IP-адрес", "Маска подсети"], rows: [
        ["Room-145", "VLAN 1", "`10.10.10.100`", "`255.255.255.0`"],
        ["Room-146", "VLAN 1", "`10.10.10.150`", "`255.255.255.0`"],
        ["Manager", "Сетевой адаптер", "`10.10.10.4`", "`255.255.255.0`"],
        ["Reception", "Сетевой адаптер", "`10.10.10.5`", "`255.255.255.0`"]
      ]},
      { type: "p", text: "Требования: консольный доступ к каждому коммутатору; имена **Room-145** и **Room-146**; пароль **8ubRu** для всех строк; пароль с шифрованием **C9WrE**; зашифровать все открытые пароли; слово **warning** в MOTD; адресация по таблице; сохранить настройки; проверить связь." },

      { type: "h2", text: "Гайд по командам (для каждого коммутатора)" },
      { type: "cmd", title: "конфигурация Room-145 (для Room-146 — замените имя и IP)", lines: [
        { cmd: "Switch> enable" },
        { cmd: "Switch# configure terminal" },
        { cmd: "Switch(config)# hostname Room-145" },
        { hl: "Room-145(config)# enable secret C9WrE" },
        { out: "! защищает вход в enable зашифрованным паролем" },
        { cmd: "Room-145(config)# service password-encryption" },
        { out: "! шифрует все открытые текстовые пароли в конфигурации" },
        { cmd: "Room-145(config)# banner motd \"warning\"" },
        { out: "! выводит текст при подключении к устройству" },
        { cmd: "Room-145(config)# line console 0" },
        { cmd: "Room-145(config-line)# password 8ubRu" },
        { cmd: "Room-145(config-line)# login" },
        { cmd: "Room-145(config-line)# exit" },
        { cmd: "Room-145(config)# line vty 0 15" },
        { out: "! ВСЕ виртуальные линии (с 0 по 15) — для удалённого доступа" },
        { cmd: "Room-145(config-line)# password 8ubRu" },
        { cmd: "Room-145(config-line)# login" },
        { cmd: "Room-145(config-line)# exit" },
        { cmd: "Room-145(config)# interface vlan 1" },
        { cmd: "Room-145(config-if)# ip address 10.10.10.100 255.255.255.0" },
        { hl: "Room-145(config-if)# no shutdown" },
        { out: "! ВСЕГДА включайте интерфейс этой командой (иначе VLAN1 в down)" },
        { cmd: "Room-145(config-if)# exit" },
        { cmd: "Room-145(config)# exit" },
        { cmd: "Room-145# copy running-config startup-config" },
        { cmt: "! или: write memory / wr" }
      ]},
      { type: "callout", kind: "info", title: "Почему interface vlan 1?", text: "На коммутаторе L2 для управления по IP используется **SVI (Switch Virtual Interface)** — виртуальный интерфейс VLAN. `interface vlan 1` + `ip address` + `no shutdown` даёт коммутатору «управляющий IP» в сети VLAN 1. Без `no shutdown` интерфейс остаётся в состоянии administratively down." },

      { type: "h2", text: "Настройка ПК (Desktop → IP Configuration)" },
      { type: "ol", items: [
        "Manager: Static, IP `10.10.10.4`, маска `255.255.255.0`, шлюз пуст (все в одной подсети).",
        "Reception: Static, IP `10.10.10.5`, маска `255.255.255.0`.",
        "Проверка: с Manager выполнить `ping 10.10.10.5` — должен быть 100% success rate.",
        "При проблемах: проверьте, что VLAN1 на обоих коммутаторах UP (`show ip interface brief`), IP совпадают с таблицей, маски одинаковые."
      ]},
      { type: "callout", kind: "tip", title: "Check Results", text: "В Packet Tracer кнопка **Check Results** покажет, какие пункты зачтены. **Reset Activity** создаёт новый набор требований (все конфигурации при этом стираются!) — не нажимайте её случайно перед сдачей." },
      { type: "checklist", id: "lab1-t5", items: [
        "Настроил(-а) Room-145: hostname, enable secret C9WrE, 8ubRu на console и vty 0–15, MOTD warning, service password-encryption",
        "Настроил(-а) Room-146 аналогично (IP .150)",
        "Задал(-а) IP-адреса Manager (.4) и Reception (.5)",
        "Проверил(-а) связность: ping Manager ↔ Reception — 100%",
        "Сохранил(-а) конфигурации (copy run start) на обоих коммутаторах"
      ]}
    ]
  },

  /* ================= ЗАДАНИЕ 1.6 ================= */
  {
    id: "t6",
    num: "1.6",
    title: "Изучение межсетевых устройств",
    intro: "Порты управления маршрутизатора, интерфейсы LAN/WAN, модули расширения, физическое подключение устройств по таблице (кабели, интерфейсы).",
    blocks: [
      { type: "h2", text: "Часть 1. Физические характеристики" },
      { type: "qa", q: "Какие порты управления доступны на маршрутизаторе East (вкладка Physical)?", a: "**CONSOLE (RJ-45)**, **USB CONSOLE (Type-B)** и **AUX (RJ-45)** — служебные порты для настройки/восстановления устройства." },
      { type: "img", src: "assets/img/lab1/reports/lab1_5-img1.jpg", caption: "Панель маршрутизатора с портами (из отчёта)" },
      { type: "img", src: "assets/img/lab1/reports/lab1_5-img2.jpg", wide: true, caption: "Маршрутизатор East: слева — блок питания, в центре — интерфейсы, справа — порты управления (выделены красным) (из отчёта)" },
      { type: "img", src: "assets/img/lab1/reports/lab1_5-img6.jpg", wide: true, caption: "Задняя панель маршрутизатора: консольные и USB-порты, слоты расширения (из отчёта)" },
      { type: "qa", q: "Какие LAN/WAN-интерфейсы на East и сколько их?", a: "**Встроенные LAN**: 2 порта Gigabit Ethernet. **Модульные WAN-слоты**: 2 слота EHWIC (Enhanced High-Speed WAN Interface Card) — пока пустые." },
      { type: "cmd", title: "CLI маршрутизатора East", lines: [
        { cmd: "East> show ip interface brief" },
        { out: "Interface              IP-Address      OK? Method Status                Protocol" },
        { hl: "GigabitEthernet0/0     unassigned      YES unset  up                    up" },
        { hl: "GigabitEthernet0/1     unassigned      YES unset  up                    up" },
        { out: "Serial0/0/0            unassigned      YES unset  down                  down" },
        { out: "Serial0/0/1            unassigned      YES unset  down                  down" },
        { out: "Vlan1                  unassigned      YES NVRAM  administratively down down" },
        { cmd: "East> show interface gigabitethernet 0/0" },
        { out: "… 1000000 Kbit/sec, DLY 10 usec  — 1 Гбит/с" },
        { cmd: "East> show interface serial 0/0/0" },
        { out: "… 1544 Kbit/sec, DLY 20000 usec  — 1.544 Мбит/с (T1)" }
      ]},
      { type: "qa", q: "Сколько физических интерфейсов перечисляет show ip interface brief?", a: "**4 физических** (2× GigabitEthernet + 2× Serial). VLAN1 — **виртуальный**, существует только в ПО." },
      { type: "qa", q: "Пропускная способность GigabitEthernet 0/0 по умолчанию? Serial 0/0/0?", a: "**Gig0/0: 1 000 000 Kbit/s (1 Гбит/с)**. **Serial0/0/0: 1544 Kbit/s** (T1). На последовательных интерфейсах это значение использует **маршрутизация** для выбора лучшего пути — оно не всегда отражает реальную пропускную способность канала (её согласуют с провайдером)." },
      { type: "img", src: "assets/img/lab1/reports/lab1_5-img3.jpg", caption: "show ip interface brief маршрутизатора (из отчёта)" },
      { type: "img", src: "assets/img/lab1/reports/lab1_5-img9.jpg", wide: true, caption: "show ip interface brief на West: 2 GigabitEthernet + 2 Serial (после установки модуля) + виртуальный Vlan1 (из отчёта)" },
      { type: "qa", q: "Сколько слотов расширения у East? А у Switch2/Switch3?", a: "**East: 2 свободных слота** (EHWIC). **Switch2 и Switch3: 10 портов всего, из них 5 свободных** для модулей." },

      { type: "h2", text: "Часть 2. Выбор модулей" },
      { type: "qa", q: "Каким модулем подключить ПК1–3 к East (без покупки коммутатора)? Сколько узлов он добавит?", a: "**HWIC-4ESW** — 4-портовый Ethernet-коммутатор в виде карты расширения. Подключает **4 узла**; вместе со встроенными портами маршрутизатора получается **до 6**." },
      { type: "qa", q: "Какой модуль для оптоволоконного Gigabit-подключения между Switch2 и Switch3?", a: "**PT-SWITCH-NM-1FGE** — одномодульный гигабитный оптический NM для коммутатора." },
      { type: "h3", text: "Установка модуля (важные нюансы)" },
      { type: "ol", items: [
        "В Packet Tracer: **Physical → Modules** — щёлкните модуль, посмотрите описание.",
        "Попытка вставить при включенном питании → ошибка `Cannot add a module when the power is on` — **горячей замены нет**, сначала выключите питание.",
        "Выключите устройство (клик по выключателю справа от логотипа Cisco), перетащите модуль в слот, включите снова.",
        "Проверьте через `show ip interface brief`, в какой слот попал модуль. **East: слот 0, субпорт 1** (Fa0/1/0 …). **Switch2/3: слот 5**."
      ]},
      { type: "img", src: "assets/img/lab1/reports/lab1_5-img4.jpg", caption: "Вкладка Physical коммутатора с модулями (из отчёта)" },
      { type: "img", src: "assets/img/lab1/reports/lab1_5-img5.jpg", caption: "Отдельный модуль расширения крупным планом (из отчёта)" },
      { type: "img", src: "assets/img/lab1/reports/lab1_5-img7.jpg", wide: true, caption: "Коммутатор: порты RJ-45 и свободные слоты под модули (из отчёта)" },
      { type: "img", src: "assets/img/lab1/reports/lab1_5-img8.jpg", wide: true, caption: "Маршрутизатор после установки модуля расширения (из отчёта)" },
      { type: "callout", kind: "warn", title: "Удаление модуля", text: "Если вставили не тот модуль — перетащите его изображение вниз, на своё фото в правом нижнем углу, и отпустите кнопку мыши." },

      { type: "h2", text: "Часть 3. Подключение устройств (таблица)" },
      { type: "p", text: "Выберите тип кабеля, щёлкните первое устройство → интерфейс, затем второе устройство → интерфейс. Если подключение верное — оценка увеличится." },
      { type: "table", head: ["Устройство", "Интерфейс", "Кабель", "Устройство", "Интерфейс"], rows: [
        ["East", "GigabitEthernet0/0", "Прямой медный", "Коммутатор1", "GigabitEthernet0/1"],
        ["East", "GigabitEthernet0/1", "Прямой медный", "Коммутатор4", "GigabitEthernet0/1"],
        ["East", "FastEthernet0/1/0", "Прямой медный", "ПК1", "FastEthernet0"],
        ["East", "FastEthernet0/1/1", "Прямой медный", "ПК2", "FastEthernet0"],
        ["East", "FastEthernet0/1/2", "Прямой медный", "ПК3", "FastEthernet0"],
        ["Коммутатор1", "FastEthernet0/1", "Прямой медный", "ПК4", "FastEthernet0"],
        ["Коммутатор1", "FastEthernet0/2", "Прямой медный", "ПК5", "FastEthernet0"],
        ["Коммутатор1", "FastEthernet0/3", "Прямой медный", "ПК6", "FastEthernet0"],
        ["Коммутатор4", "GigabitEthernet0/2", "Перевёрнутый (crossover)", "Коммутатор3", "GigabitEthernet3/1"],
        ["Коммутатор3", "GigabitEthernet5/1", "Оптоволоконный", "Коммутатор2", "GigabitEthernet5/1"],
        ["Коммутатор2", "FastEthernet0/1", "Прямой медный", "ПК7", "FastEthernet0"],
        ["Коммутатор2", "FastEthernet1/1", "Прямой медный", "ПК8", "FastEthernet0"],
        ["Коммутатор2", "FastEthernet2/1", "Прямой медный", "ПК9", "FastEthernet0"],
        ["East", "Serial0/0/0", "Последовательный DCE (сначала к East)", "West", "Serial0/0/0"]
      ]},
      { type: "callout", kind: "deep", title: "Почему crossover между Sw4 и Sw3?", text: "Коммутатор↔коммутатор — **однотипные** устройства, поэтому между их Ethernet-портами нужен **crossover** (перевёрнутая пара: TX↔RX). Современные устройства часто умеют **Auto-MDI/MDIX** и определяют это автоматически — но в Packet Tracer для оценки требуется указать правильный тип кабеля. Последовательный канал East↔West — **DCE-конец** подключается первым к East (он «задаёт тактовую частоту»).", }
    ]
  }
];
