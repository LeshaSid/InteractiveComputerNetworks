/* Интерактивная модель OSI: 7 слоёв, PDU, протоколы, данные-инкапсуляция */
(function () {
  var LAYERS = [
    {
      n: 7, name: "Прикладной", en: "Application",
      pdu: "Данные",
      desc: "Обеспечивает приложениям доступ к сетевым сервисам. Сам слой данных не передаёт — это точка, где приложение «касается» сети.",
      proto: ["HTTP", "HTTPS", "FTP", "SMTP", "DNS", "DHCP", "SSH", "SNMP", "Telnet"],
      device: "—",
      example: "Браузер запрашивает страницу: формируется HTTP-запрос GET /index.html"
    },
    {
      n: 6, name: "Представления", en: "Presentation",
      pdu: "Данные",
      desc: "Переводит форматы данных: шифрование/дешифрование, сжатие, сериализация (JSON, XML), перекодировка (UTF-8, ASCII).",
      proto: ["SSL/TLS", "JPEG", "GIF", "MPEG", "ASCII", "UTF-8"],
      device: "—",
      example: "TLS шифрует HTTP-трафик → HTTPS; JPEG кодирует изображение перед отправкой"
    },
    {
      n: 5, name: "Сеансовый", en: "Session",
      pdu: "Данные",
      desc: "Устанавливает, поддерживает и завершает сеансы между приложениями. Синхронизация диалога, checkpoints при передаче больших файлов.",
      proto: ["RPC", "NetBIOS", "PPTP", "SIP", "SMB"],
      device: "—",
      example: "Протокол SMB открывает файловую сессию с сетевым диском и ставит checkpoint при копировании"
    },
    {
      n: 4, name: "Транспортный", en: "Transport",
      pdu: "Сегмент (TCP) / Дейтаграмма (UDP)",
      desc: "Межпроцессорная доставка на хосте. Порты, сегментация/сборка, контроль потока (TCP) или «best effort» без подтверждений (UDP).",
      proto: ["TCP", "UDP", "SCTP"],
      device: "Брандмауэр / L4-балансировщик (часто)",
      example: "TCP: трёхстороннее рукопожатие SYN → SYN-ACK → ACK; UDP: DNS-запрос уходит без установления соединения"
    },
    {
      n: 3, name: "Сетевой", en: "Network",
      pdu: "Пакет",
      desc: "Логическая адресация (IP) и маршрутизация между сетями. Определяет лучший путь через коммутаторы/маршрутизаторы.",
      proto: ["IPv4", "IPv6", "ICMP", "IPSec", "OSPF", "BGP", "ARP*"],
      device: "Маршрутизатор (router) / L3-коммутатор",
      example: "Пакет с src 192.168.1.10 → dst 8.8.8.8 идёт через шлюз 192.168.1.1, маршрутизатор решает, через какой порт отправить дальше"
    },
    {
      n: 2, name: "Канальный", en: "Data Link",
      pdu: "Кадр (frame)",
      desc: "Доставка по локальной сети по MAC-адресам. Делится на LLC (управление логическими линиями) и MAC (доступ к среде, кадрирование, адресация).",
      proto: ["Ethernet (802.3)", "Wi-Fi (802.11)", "PPP", "Frame Relay", "STP", "VLAN (802.1Q)"],
      device: "Коммутатор (switch) / мост",
      example: "Кадр Ethernet: [dst MAC][src MAC][type][payload][FCS] — коммутатор читает dst MAC и выводит кадр из нужного порта"
    },
    {
      n: 1, name: "Физический", en: "Physical",
      pdu: "Биты",
      desc: "Передача сырых битов по среде: электрические сигналы (медь), импульсы света (оптика), радиоволны. Разъёмы, уровни сигналов, кодирование, топология.",
      proto: ["Ethernet PHY", "1000BASE-T", "RS-232", "Bluetooth PHY", "802.11 radio"],
      device: "Хаб / репитер / конвертер / кабель / точка доступа",
      example: "Бит 1 на медной паре T568B = напряжение на контактах 1-2; оптика передаёт импульсы света по моду"
    }
  ];

  function render() {
    var wrap = Renderer.el('<div class="osi"></div>');
    wrap.appendChild(Renderer.el(
      '<div class="osi-intro"><p>Нажмите на слой — появится описание, протоколы и пример. Кнопка <strong>«Отправить данные ↓»</strong> показывает инкапсуляцию: как данные «одеваются» в заголовки, спускаясь по слоям, и раздеваются приёмником.</p></div>'
    ));

    var stack = Renderer.el('<div class="osi-stack"></div>');
    var detail = Renderer.el('<div class="osi-detail"><div class="osi-placeholder">Выберите слой, чтобы увидеть детали ↓</div></div>');
    LAYERS.forEach(function (L, idx) {
      var layer = Renderer.el(
        '<button class="osi-layer" data-n="' + L.n + '">' +
        '<span class="ol-n">L' + L.n + "</span>" +
        '<span class="ol-name">' + L.name + "</span>" +
        '<span class="ol-en">' + L.en + "</span>" +
        '<span class="ol-pdu">' + L.pdu + "</span>" +
        '<span class="ol-arrow">↓</span>' +
        "</button>"
      );
      layer.addEventListener("click", function () {
        stack.querySelectorAll(".osi-layer").forEach(function (x) { x.classList.remove("sel"); });
        layer.classList.add("sel");
        showDetail(L);
      });
      stack.appendChild(layer);
    });

    function showDetail(L) {
      detail.innerHTML = "";
      detail.appendChild(Renderer.el(
        '<div class="osi-card">' +
        '<div class="oc-head"><span class="oc-n">L' + L.n + "</span>" +
        "<div><div class=\"oc-name\">" + L.name + " · " + L.en + "</div>" +
        '<div class="oc-pdu">PDU: <code>' + L.pdu + "</code></div></div></div>" +
        '<p class="oc-desc">' + Renderer.inline(L.desc) + "</p>" +
        '<div class="oc-row"><div class="oc-label">Протоколы / стандарты</div><div class="oc-tags">' +
        L.proto.map(function (p) { return "<span>" + Renderer.esc(p) + "</span>"; }).join("") +
        "</div></div>" +
        '<div class="oc-row"><div class="oc-label">Оборудование</div><div class="oc-val">' + Renderer.esc(L.device) + "</div></div>" +
        '<div class="oc-row"><div class="oc-label">Пример</div><div class="oc-val">' + Renderer.inline(L.example) + "</div></div>" +
        "</div>"
      ));
    }

    /* --- демонстрация инкапсуляции --- */
    var demo = Renderer.el('<div class="osi-demo"></div>');
    var demoBtn = Renderer.el('<button class="btn btn-primary">⬇ Отправить данные (инкапсуляция)</button>');
    var demoStage = Renderer.el('<div class="osi-demo-stage"><div class="osi-demo-empty">Пакет «HTTP: GET /index.html» отправлен с ноутбука на сервер</div></div>');
    demo.appendChild(demoBtn); demo.appendChild(demoStage);
    var animating = false;
    demoBtn.addEventListener("click", function () {
      if (animating) return;
      animating = true;
      runDemo();
    });

    var STEPS = [
      { n: 7, label: "Данные приложения", payload: "HTTP: GET /index.html" },
      { n: 6, label: "После Presentation", payload: "GET /index.html (UTF-8)" },
      { n: 5, label: "После Session", payload: "[SESS 0x4A1F] GET /index.html" },
      { n: 4, label: "После Transport (TCP)", payload: "[TCP 1234→80, seq=1] GET /index.html" },
      { n: 3, label: "После Network (IP)", payload: "[IP 192.168.1.10→93.184.216.34][TCP…] GET /index.html" },
      { n: 2, label: "После Data Link (кадр)", payload: "[MAC aa:bb..→cc:dd..][IP…] FCS" },
      { n: 1, label: "По проводу — биты", payload: "10110011 1010… (сигналы на паре T568B)" }
    ];

    function runDemo() {
      demoStage.innerHTML = "";
      var list = Renderer.el('<div class="osi-demo-list"></div>');
      demoStage.appendChild(list);
      var i = 0;
      function step() {
        if (i >= STEPS.length) {
          /* приёмник «раздевает» заголовки */
          var back = Renderer.el('<div class="osi-demo-back"></div>');
          for (var j = STEPS.length - 1; j >= 0; j--) {
            (function (jj, delay) {
              setTimeout(function () {
                back.appendChild(Renderer.el(
                  '<div class="osi-demo-row up"><span class="odr-n">L' + STEPS[jj].n + "</span>" +
                  '<span class="odr-txt">↑ снимаем заголовок — ' + Renderer.esc(STEPS[jj].label) + "</span></div>"
                ));
                if (jj === 0) {
                  back.appendChild(Renderer.el('<div class="osi-demo-done">✅ Сервер получил данные: <code>GET /index.html</code></div>'));
                  animating = false;
                }
              }, (STEPS.length - jj) * 260);
            })(j);
          }
          list.appendChild(back);
          return;
        }
        var s = STEPS[i];
        var row = Renderer.el(
          '<div class="osi-demo-row"><span class="odr-n">L' + s.n + "</span>" +
          '<span class="odr-txt"><b>' + Renderer.esc(s.label) + "</b><br><code>" + Renderer.esc(s.payload) + "</code></span></div>"
        );
        list.appendChild(row);
        var target = stack.querySelector('.osi-layer[data-n="' + s.n + '"]');
        if (target) {
          stack.querySelectorAll(".osi-layer").forEach(function (x) { x.classList.remove("pulse"); });
          target.classList.add("pulse");
        }
        i++;
        setTimeout(step, 420);
      }
      step();
    }

    wrap.appendChild(stack);
    wrap.appendChild(demo);
    wrap.appendChild(detail);
    return wrap;
  }

  Renderer.register("osi", { render: render });
})();
