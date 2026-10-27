/* Packet Tracer–симулятор: UI — рабочая область, панели, анимация пакетов.
   Виджет регистрируется как блок { type: "pt" }. */
(function () {
  function render(opts) {
    opts = opts || {};
    var topo = (window.Site && Site.ptTopologies && Site.ptTopologies[opts.topology]) || PT.defaultTopology();
    var sess = PT.createSession(topo);
    var selId = null;
    var pingSrc = null;
    var animTimer = null;
    var pendingSteps = [];

    var wrap = Renderer.el('<div class="pt"></div>');
    wrap.appendChild(Renderer.el(
      '<div class="pt-note">🧪 <b>Учебный Packet Tracer</b> — упрощённый симулятор для лаб. 1: топология, IP Configuration, ARP, <code>ping</code>, журнал кадров (Wireshark-like) и физическая панель модулей. Не заменяет полный Cisco PT, но закрывает теорию и подготовку к заданиям 1.1–1.6.</div>'
    ));

    /* --- toolbar --- */
    var toolbar = Renderer.el('<div class="pt-toolbar"></div>');
    var modeBox = Renderer.el(
      '<div class="pt-mode">' +
      '<button data-mode="realtime" class="active">Realtime</button>' +
      '<button data-mode="simulation">Simulation</button>' +
      "</div>"
    );
    toolbar.appendChild(modeBox);
    toolbar.appendChild(btn("🎯 Ping: выберите источник", "pt-ping-btn", function () {
      pingSrc = null;
      selId = null;
      updateDevices();
      setStatus("Кликните устройство-источник, затем назначение.", "");
      this.textContent = "🎯 Ping: ждём источник…";
      this.classList.add("btn-primary");
    }));
    toolbar.appendChild(btn("🧹 Очистить журнал", "", function () {
      sess.capture = [];
      renderCapture();
      renderPdu(null);
    }));
    toolbar.appendChild(btn("↺ Сброс", "", function () {
      sess = PT.createSession(topo);
      selId = null; pingSrc = null;
      pendingSteps = [];
      if (animTimer) { clearTimeout(animTimer); animTimer = null; }
      workspace.querySelectorAll(".pt-pkt").forEach(function (p) { p.remove(); });
      updateDevices(); renderPanel(); renderCapture(); renderPdu(null);
      setStatus("Сессия сброшена.", "");
    }));
    toolbar.appendChild(Renderer.el('<span class="pt-hint">Режим Simulation — пакеты анимируются пошагово</span>'));
    wrap.appendChild(toolbar);

    /* --- workspace --- */
    var workspace = Renderer.el('<div class="pt-workspace"></div>');
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "pt-links");
    svg.setAttribute("preserveAspectRatio", "none");
    workspace.appendChild(svg);
    wrap.appendChild(workspace);

    /* --- main: capture + panel --- */
    var main = Renderer.el('<div class="pt-main"></div>');
    var left = Renderer.el('<div></div>');
    var capWrap = Renderer.el('<div class="pt-capture-wrap"><table class="pt-capture"><thead><tr>' +
      "<th>No</th><th>Time</th><th>Source</th><th>Destination</th><th>Protocol</th><th>Info</th>" +
      "</tr></thead><tbody></tbody></table></div>");
    var pduBox = Renderer.el('<div class="pt-pdu" hidden></div>');
    var statusEl = Renderer.el('<div class="pt-status"></div>');
    left.appendChild(capWrap);
    left.appendChild(pduBox);
    left.appendChild(statusEl);

    var panel = Renderer.el('<div class="pt-panel"><div class="pt-empty">Выберите устройство на топологии…</div></div>');
    main.appendChild(left);
    main.appendChild(panel);
    wrap.appendChild(main);

    function btn(label, extra, fn) {
      var b = Renderer.el('<button class="btn ' + (extra || "") + '">' + label + "</button>");
      b.addEventListener("click", fn);
      return b;
    }

    function setStatus(msg, cls) {
      statusEl.textContent = msg;
      statusEl.className = "pt-status " + (cls || "");
    }

    /* --- отрисовка линков --- */
    function drawLinks() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var rect = workspace.getBoundingClientRect();
      svg.setAttribute("viewBox", "0 0 " + rect.width + " " + rect.height);
      sess.topology.links.forEach(function (l) {
        var a = sess.byId[l.a], b = sess.byId[l.b];
        if (!a || !b) return;
        var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", (a.x / 100) * rect.width);
        line.setAttribute("y1", (a.y / 100) * rect.height);
        line.setAttribute("x2", (b.x / 100) * rect.width);
        line.setAttribute("y2", (b.y / 100) * rect.height);
        if (l.kind === "wan") line.setAttribute("class", "wan");
        svg.appendChild(line);
      });
    }

    /* --- устройства --- */
    function deviceLabel(d) {
      var t = PT.deviceTypes[d.type] || {};
      var ip = d.ip || (d.ifaces && d.ifaces[0] && d.ifaces[0].ip) || "";
      return '<span class="pt-ico">' + (t.icon || "?") + "</span>" +
        '<span class="pt-name">' + Renderer.esc(d.name) + "</span>" +
        (ip ? '<span class="pt-ip">' + Renderer.esc(ip) + "</span>" : "");
    }

    function updateDevices() {
      workspace.querySelectorAll(".pt-dev").forEach(function (n) { n.remove(); });
      sess.devices.forEach(function (d) {
        var el = Renderer.el('<div class="pt-dev" data-id="' + d.id + '">' + deviceLabel(d) + "</div>");
        el.style.left = d.x + "%";
        el.style.top = d.y + "%";
        if (selId === d.id) el.classList.add("selected");
        if (pingSrc === d.id) el.classList.add("ping-src");
        el.addEventListener("click", function () { onDeviceClick(d.id); });
        workspace.appendChild(el);
      });
      drawLinks();
    }

    function onDeviceClick(id) {
      if (pingSrc && pingSrc !== id) {
        doPing(pingSrc, id);
        pingSrc = null;
        var pb = toolbar.querySelector(".pt-ping-btn");
        if (pb) { pb.textContent = "🎯 Ping: выберите источник"; pb.classList.remove("btn-primary"); }
        updateDevices();
        return;
      }
      if (pingSrc === id) {
        pingSrc = null;
        setStatus("Ping отменён.", "");
        updateDevices();
        return;
      }
      selId = id;
      updateDevices();
      renderPanel();
    }

    /* --- панель устройства --- */
    function renderPanel() {
      if (!selId) {
        panel.innerHTML = '<div class="pt-empty">Выберите устройство на топологии…</div>';
        return;
      }
      var d = sess.byId[selId];
      var t = PT.deviceTypes[d.type] || {};
      panel.innerHTML = "";

      var head = Renderer.el('<h4>' + (t.icon || "") + " " + Renderer.esc(d.name) +
        ' <span style="color:var(--text-3);font-weight:400;font-size:13px">(' + Renderer.esc(t.label || d.type) + ")</span></h4>");
      panel.appendChild(head);

      /* IP config для end devices */
      if (t.canConfigIp) {
        panel.appendChild(Renderer.el('<div style="font-size:12.5px;font-weight:650;color:var(--text-2);margin-bottom:6px">IP Configuration</div>'));
        [["IP Address", "ip"], ["Subnet Mask", "mask"], ["Default Gateway", "gw"]].forEach(function (f) {
          var field = Renderer.el(
            '<div class="pt-field"><label>' + f[0] + '</label><input data-f="' + f[1] + '" value="' + Renderer.esc(d[f[1]] || "") + '"></div>'
          );
          field.querySelector("input").addEventListener("change", function (e) {
            d[f[1]] = e.target.value.trim();
            updateDevices();
            setStatus(d.name + "." + f[1] + " = " + d[f[1]], "ok");
          });
          panel.appendChild(field);
        });
        panel.appendChild(Renderer.el('<div style="font-size:11.5px;color:var(--text-3);margin-bottom:8px">MAC: <code>' + Renderer.esc(d.mac || "—") + "</code></div>"));
      }

      /* Router: интерфейсы */
      if (d.ifaces) {
        panel.appendChild(Renderer.el('<div style="font-size:12.5px;font-weight:650;color:var(--text-2);margin:8px 0 6px">Интерфейсы</div>'));
        var rows = d.ifaces.map(function (f) {
          return "<tr><td>" + Renderer.esc(f.id) + "</td><td>" + Renderer.esc(f.ip || "unassigned") +
            "</td><td>" + Renderer.esc(f.status) + "</td></tr>";
        }).join("");
        panel.appendChild(Renderer.el(
          '<table class="pt-arp-table"><thead><tr><th>Interface</th><th>IP</th><th>Status</th></tr></thead><tbody>' +
          rows + "</tbody></table>"
        ));
      }

      /* ARP table */
      var arpKeys = Object.keys(d.arp || {});
      panel.appendChild(Renderer.el('<div style="font-size:12.5px;font-weight:650;color:var(--text-2);margin:10px 0 6px">ARP Table (' + arpKeys.length + ")</div>"));
      if (!arpKeys.length) {
        panel.appendChild(Renderer.el('<div class="pt-empty" style="font-size:12.5px">Пусто — выполните ping</div>'));
      } else {
        var arows = arpKeys.map(function (ip) {
          var e = d.arp[ip];
          return "<tr><td>" + Renderer.esc(ip) + "</td><td>" + Renderer.esc(e.mac) + "</td></tr>";
        }).join("");
        panel.appendChild(Renderer.el(
          '<table class="pt-arp-table"><thead><tr><th>Internet Address</th><th>Physical Address</th></tr></thead><tbody>' +
          arows + "</tbody></table>"
        ));
      }

      /* Switch: MAC table */
      if (d.type === "switch") {
        panel.appendChild(Renderer.el('<div style="font-size:12.5px;font-weight:650;color:var(--text-2);margin:10px 0 6px">MAC Address Table</div>'));
        var mt = d.macTable || [];
        if (!mt.length) panel.appendChild(Renderer.el('<div class="pt-empty" style="font-size:12.5px">Пока пусто</div>'));
        else {
          var mrows = mt.map(function (m) {
            return "<tr><td>" + Renderer.esc(m.mac) + "</td><td>" + Renderer.esc(m.port) + "</td><td>" + m.type + "</td></tr>";
          }).join("");
          panel.appendChild(Renderer.el(
            '<table class="pt-arp-table"><thead><tr><th>MAC</th><th>Port</th><th>Type</th></tr></thead><tbody>' +
            mrows + "</tbody></table>"
          ));
        }
      }

      /* Физическая панель: слоты и модули (лаб. 1.6) */
      if (d.slots) {
        panel.appendChild(Renderer.el('<div style="font-size:12.5px;font-weight:650;color:var(--text-2);margin:12px 0 6px">Physical — слоты расширения</div>'));
        var slotsEl = Renderer.el('<div class="pt-slots"></div>');
        d.slots.forEach(function (sl) {
          var filled = !!sl.mod;
          var row = Renderer.el(
            '<div class="pt-slot' + (filled ? " filled" : "") + '">' +
            "<span>" + Renderer.esc(sl.label) + ": " + (filled ? Renderer.esc(sl.mod) : "пусто") + "</span>" +
            (filled ? '<span class="rm" title="Извлечь">✕</span>' : "") +
            "</div>"
          );
          if (filled) {
            row.querySelector(".rm").addEventListener("click", function () {
              removeModule(d, sl);
              renderPanel();
              setStatus("Модуль извлечён из " + sl.label, "");
            });
          }
          slotsEl.appendChild(row);
        });
        panel.appendChild(slotsEl);

        panel.appendChild(Renderer.el('<div style="font-size:12px;color:var(--text-2);margin-top:8px">Доступные модули:</div>'));
        var modsEl = Renderer.el('<div class="pt-mods"></div>');
        Object.keys(PT.modules).forEach(function (mk) {
          var m = PT.modules[mk];
          var used = d.slots.some(function (s) { return s.mod === m.name; });
          var b = Renderer.el('<button class="pt-mod"' + (used ? " disabled" : "") + ' title="' + Renderer.esc(m.desc) + '">' + Renderer.esc(m.name) + "</button>");
          b.addEventListener("click", function () {
            installModule(d, m);
            renderPanel();
            setStatus("Установлен " + m.name + " → " + (d.ifaces ? d.ifaces.slice(-m.addIfaces.length).map(function (i) { return i.id; }).join(", ") : ""), "ok");
          });
          modsEl.appendChild(b);
        });
        panel.appendChild(modsEl);

        /* show ip interface brief */
        if (d.ifaces) {
          panel.appendChild(btn("⌨️ show ip interface brief", "", function () {
            var lines = d.ifaces.map(function (f) {
              return f.id.padEnd(12) + (f.ip || "unassigned").padEnd(16) + "YES unset  " + f.status.padEnd(10) + f.status;
            });
            setStatus("", "");
            pduBox.hidden = false;
            pduBox.textContent = "Interface              IP-Address      OK? Method Status                Protocol\n" + lines.join("\n");
          }));
        }
      }

      /* CLI hint */
      if (t.hasCli) {
        panel.appendChild(Renderer.el(
          '<div class="callout info" style="margin-top:12px;font-size:13px"><div class="co-title">CLI</div>' +
          '<p>Команды — в виджете <b>Симулятор Cisco IOS</b> ниже на странице (для ' +
          (t.cliKind === "router" ? "маршрутизатора выберите режим router" : "коммутатора") + ").</p></div>"
        ));
      }
    }

    function installModule(dev, mod) {
      var slot = dev.slots.find(function (s) { return !s.mod; });
      if (!slot) { setStatus("Нет свободных слотов", "err"); return; }
      slot.mod = mod.name;
      if (dev.ifaces && mod.addIfaces) {
        mod.addIfaces.forEach(function (id) {
          if (!dev.ifaces.some(function (f) { return f.id === id; })) {
            dev.ifaces.push({ id: id, ip: null, mask: null, status: "up" });
          }
        });
      }
      if (dev.type === "switch" && mod.addIfaces) {
        /* ports count only */
        dev.ports = (dev.ports || 24) + mod.addIfaces.length;
      }
      PT.emit("module", { dev: dev.id, mod: mod.name, slot: slot.id });
    }

    function removeModule(dev, slot) {
      if (!slot.mod) return;
      var mod = PT.modules[slot.mod];
      slot.mod = null;
      if (dev.ifaces && mod) {
        dev.ifaces = dev.ifaces.filter(function (f) {
          return mod.addIfaces.indexOf(f.id) === -1;
        });
      }
      PT.emit("module-removed", { dev: dev.id, slot: slot.id });
    }

    /* --- capture --- */
    function renderCapture() {
      var tbody = capWrap.querySelector("tbody");
      tbody.innerHTML = "";
      sess.capture.slice(-80).forEach(function (e, idx) {
        var fullIdx = sess.capture.length - Math.min(sess.capture.length, 80) + idx;
        var tr = Renderer.el(
          "<tr><td>" + e.no + "</td><td>" + e.time.toFixed(3) + "</td>" +
          "<td>" + Renderer.esc(e.src) + "</td><td>" + Renderer.esc(e.dst) + "</td>" +
          '<td class="c-proto c-' + Renderer.esc(String(e.proto).toLowerCase()) + '">' + Renderer.esc(e.proto) + "</td>" +
          "<td>" + Renderer.esc(e.info) + "</td></tr>"
        );
        tr.addEventListener("click", function () {
          capWrap.querySelectorAll("tr").forEach(function (x) { x.classList.remove("sel"); });
          tr.classList.add("sel");
          renderPdu(e);
        });
        tbody.appendChild(tr);
      });
      capWrap.scrollTop = capWrap.scrollHeight;
    }

    function renderPdu(e) {
      if (!e) { pduBox.hidden = true; return; }
      pduBox.hidden = false;
      var html = "<b>PDU #" + e.no + " · " + Renderer.esc(e.proto) + "</b>\n" + Renderer.esc(e.info) + "\n";
      if (e.raw) html += "\n" + Renderer.esc(e.raw);
      pduBox.textContent = "";
      pduBox.appendChild(Renderer.el("<b>PDU #" + e.no + " · " + Renderer.esc(e.proto) + "</b>"));
      pduBox.appendChild(Renderer.el("<div>" + Renderer.esc(e.info) + "</div>"));
      if (e.layers && e.layers.length) {
        var layers = Renderer.el('<div class="pt-layers"></div>');
        e.layers.forEach(function (L) {
          layers.appendChild(Renderer.el(
            '<div class="pt-layer ' + Renderer.esc(L.cls || "") + '"><b>' + Renderer.esc(L.layer) + "</b><br>" +
            Renderer.esc(L.text) + "</div>"
          ));
        });
        pduBox.appendChild(layers);
      }
      if (e.raw) pduBox.appendChild(Renderer.el('<div style="margin-top:8px;white-space:pre-wrap">' + Renderer.esc(e.raw) + "</div>"));
    }

    /* --- ping + анимация --- */
    function doPing(srcId, dstId) {
      if (animTimer) { clearTimeout(animTimer); animTimer = null; }
      workspace.querySelectorAll(".pt-pkt").forEach(function (p) { p.remove(); });

      var res = PTSim.ping(sess, srcId, dstId);
      renderCapture();
      updateDevices();
      renderPanel();

      if (!res.ok) {
        setStatus("✕ Ping failed: " + (res.error || "unknown"), "err");
        return;
      }

      /* фильтруем анимируемые шаги */
      pendingSteps = res.steps.filter(function (s) {
        return s.kind === "frame" || (s.kind === "arp" && s.phase !== "cache");
      });

      if (sess.mode === "simulation") {
        animateSteps(0);
        setStatus("Simulation: " + pendingSteps.length + " шагов… " + res.summary, "ok");
      } else {
        /* realtime: одна вспышка в конце + сразу статус */
        flashPath(res.path);
        setStatus("✓ " + res.summary, "ok");
      }
    }

    function flashPath(path) {
      if (!path || path.length < 2) return;
      var rect = workspace.getBoundingClientRect();
      var dot = Renderer.el('<div class="pt-pkt icmp"></div>');
      var a = sess.byId[path[0]];
      dot.style.left = a.x + "%";
      dot.style.top = a.y + "%";
      workspace.appendChild(dot);
      var i = 0;
      function hop() {
        i++;
        if (i >= path.length) { dot.remove(); return; }
        var d = sess.byId[path[i]];
        dot.style.left = d.x + "%";
        dot.style.top = d.y + "%";
        animTimer = setTimeout(hop, 350);
      }
      animTimer = setTimeout(hop, 50);
    }

    function animateSteps(idx) {
      if (idx >= pendingSteps.length) {
        animTimer = null;
        return;
      }
      var s = pendingSteps[idx];
      if (s.kind === "frame" || s.kind === "arp") {
        var fromId = s.from;
        var toIds = Array.isArray(s.to) ? s.to : (s.to ? [s.to] : []);
        if (fromId && toIds.length && sess.byId[fromId]) {
          var from = sess.byId[fromId];
          var dot = Renderer.el('<div class="pt-pkt ' + (s.kind === "arp" ? "arp" : "icmp") + '"></div>');
          dot.style.left = from.x + "%";
          dot.style.top = from.y + "%";
          workspace.appendChild(dot);
          /* к первому соседу (broadcast — к первому) */
          var target = sess.byId[toIds[0]];
          if (target) {
            requestAnimationFrame(function () {
              dot.style.left = target.x + "%";
              dot.style.top = target.y + "%";
            });
          }
          setTimeout(function () { dot.remove(); }, 400);
        }
      }
      animTimer = setTimeout(function () { animateSteps(idx + 1); }, sess.mode === "simulation" ? 450 : 200);
    }

    /* --- mode --- */
    modeBox.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () {
        modeBox.querySelectorAll("button").forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        sess.mode = b.dataset.mode;
        setStatus("Режим: " + b.textContent, "");
      });
    });

    PT.on("capture", function () { /* уже рендерим в doPing */ });

    /* --- init --- */
    setTimeout(function () {
      updateDevices();
      renderPanel();
      renderCapture();
      drawLinks();
    }, 0);
    window.addEventListener("resize", drawLinks);

    setStatus("Кликните устройство, чтобы открыть конфигурацию. Кнопка Ping → источник → назначение.", "");
    return wrap;
  }

  Renderer.register("pt", { render: render });
})();
