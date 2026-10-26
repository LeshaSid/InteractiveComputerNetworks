/* Симулятор Cisco IOS CLI (учебный, в браузере).
   Подмножество команд: режимы, show, enable/configure/exit, ?, ping, help.
*/
(function () {
  var DEVICES = {
    switch: {
      name: "S1",
      hostname: "S1",
      prompt: "S1>",
      enablePrompt: "S1#",
      mode: "user", /* user | enable | config */
      saved: false,
      configs: { hostname: "S1", consolePass: null, enablePass: null, enableSecret: null, banner: null, encrypt: false },
      macTable: [
        { mac: "00E0.F9DC.1A2B", port: "Fa0/1", type: "DYNAMIC" },
        { mac: "00E0.F9DC.7C3D", port: "Fa0/2", type: "DYNAMIC" },
        { mac: "001A.2B3C.4D5E", port: "Fa0/5", type: "DYNAMIC" }
      ],
      ports: [
        { id: "Fa0/1", status: "up", proto: "up" },
        { id: "Fa0/2", status: "up", proto: "up" },
        { id: "Fa0/3", status: "down", proto: "down" },
        { id: "Fa0/4", status: "down", proto: "down" },
        { id: "Fa0/5", status: "up", proto: "up" },
        { id: "Gig0/1", status: "up", proto: "up" }
      ]
    }
  };

  function render(deviceKey) {
    var dev = DEVICES[deviceKey || "switch"] || DEVICES.switch;
    var wrap = Renderer.el('<div class="cli"></div>');
    wrap.appendChild(Renderer.el(
      '<div class="cli-note">🎓 Учебный симулятор подмножества Cisco IOS (Switch). Поддерживаются режимы, <code>?</code>, TAB, <code>show</code>, настройка паролей/баннера/hostname. Реальный коммутатор работает так же.</div>'
    ));
    var term = Renderer.el('<div class="cli-term"><div class="cli-out"></div><div class="cli-line"><span class="cli-prompt"></span><input class="cli-in" autocomplete="off" autocapitalize="off" spellcheck="false"></div></div>');
    var out = term.querySelector(".cli-out");
    var promptEl = term.querySelector(".cli-prompt");
    var input = term.querySelector(".cli-in");
    wrap.appendChild(term);
    wrap.appendChild(Renderer.el('<div class="cli-hint">Попробуйте: <code>enable</code>, <code>configure terminal</code>, <code>hostname SW-1</code>, <code>show mac address-table</code>, <code>show interfaces status</code>, <code>?</code></div>'));

    var hist = [], histIdx = -1, lastCmd = "";

    function prompt() {
      if (dev.mode === "config") return "(config)#";
      if (dev.mode === "enable") return "#";
      return ">";
    }
    function updPrompt() { promptEl.textContent = dev.configs.hostname + prompt(); }

    function print(text, cls) {
      var span = Renderer.el('<span class="cli-line-out' + (cls ? " " + cls : "") + '"></span>');
      span.textContent = text;
      out.appendChild(span);
      term.scrollTop = term.scrollHeight;
    }
    function printHtml(html) {
      var div = Renderer.el('<div class="cli-block"></div>');
      div.innerHTML = html;
      out.appendChild(div);
      term.scrollTop = term.scrollHeight;
    }

    /* --- стартовый экран --- */
    printHtml(
      '<div class="cli-banner">Cisco IOS Software, C2960 Software (C2960-LANBASEK9-M), Version 15.0(2)SE4<br>' +
      "Copyright (c) 1986-2013 by Cisco Systems, Inc.<br>" +
      "<span class=\"dim\">--- Учебный симулятор ---</span></div>"
    );
    print("Type \"help\" for help. Пустая строка — пропуск.");
    updPrompt();

    /* --- парсер --- */
    function handle(raw) {
      var line = raw.trim();
      print(dev.configs.hostname + prompt() + " " + raw);
      if (!line) return;
      hist.push(line); histIdx = hist.length;
      var parts = line.split(/\s+/);
      var cmd = parts[0].toLowerCase();
      var rest = parts.slice(1);

      /* --- контекстная помощь --- */
      if (line === "?") { ctxHelp(""); return; }
      if (line.indexOf("?") !== -1 && !line.match(/\?$/)) { /* частичный ? не реализуем, упрощаем */ }

      /* --- exit / end --- */
      if (cmd === "exit") {
        if (dev.mode === "config") { dev.mode = "enable"; }
        else if (dev.mode === "enable") { dev.mode = "user"; }
        else print("% This command has no effect"); /* ничего */
        updPrompt(); return;
      }
      if (cmd === "end") {
        if (dev.mode !== "user") dev.mode = "enable";
        updPrompt(); return;
      }
      if (cmd === "disable") { dev.mode = "user"; updPrompt(); return; }

      /* --- enable / configure / help --- */
      if (cmd === "enable") {
        if (dev.configs.enableSecret || dev.configs.enablePass) {
          /* упрощённо — принимаем любой пароль */
          print("Password:");
          print("(в симуляторе пароль принимается автоматически — на реальном коммутаторе потребуется ввод)");
        }
        dev.mode = "enable"; updPrompt(); return;
      }
      if (cmd === "configure") {
        if (dev.mode !== "enable") { print("% Enter enable EXEC mode first (enable)", "err"); return; }
        if (rest[0] === "terminal" || !rest.length) { dev.mode = "config"; updPrompt(); return; }
        print("% Invalid input → configure terminal", "err"); return;
      }
      if (cmd === "conf" && rest[0] && rest[0].indexOf("t") === 0) {
        if (dev.mode !== "enable") { print("% Enter enable mode first", "err"); return; }
        dev.mode = "config"; updPrompt(); return;
      }
      if (cmd === "help" || (cmd === "?" )) { printHelp(); return; }

      /* --- ping --- */
      if (cmd === "ping") {
        var ip = rest[0];
        if (!ip) { print("Protocol [ip]:"); print("% Incomplete command."); return; }
        print("Type escape sequence to abort.");
        print("Sending 5, 100-byte ICMP Echos to " + ip + ", timeout is 2 seconds:");
        print("!!!!!");
        print("Success rate is 100 percent (5/5), round-trip min/avg/max = 1/2/4 ms");
        return;
      }
      if (cmd === "traceroute" || cmd === "tracert") {
        print("% traceroute не реализован в симуляторе — используйте Ping Traceroute PDU в Packet Tracer");
        return;
      }

      /* --- show --- */
      if (cmd === "show") { doShow(rest, line); return; }

      /* --- configure commands --- */
      if (dev.mode === "config") { doConfig(cmd, rest, line); return; }

      /* --- неизвестно --- */
      var guess = {
        user: ["enable", "ping <ip>", "show running-config", "help"],
        enable: ["configure terminal", "show running-config", "show mac address-table", "show interfaces status", "copy running-config startup-config", "ping <ip>"],
        config: ["hostname <name>", "line console 0", "banner motd #...#", "enable secret <pass>", "service password-encryption", "end"]
      }[dev.mode];
      print("% Ambiguous command: \"" + line + "\"? (попробуйте: " + guess.join(" | ") + ")", "err");
    }

    function printHelp() {
      printHtml(
        '<div class="cli-help">Команды симулятора (упрощённо):<br>' +
        "&nbsp; enable / disable / exit / end — переход между режимами<br>" +
        "&nbsp; configure terminal — глобальный режим конфигурации<br>" +
        "&nbsp; hostname &lt;name&gt; — сменить имя<br>" +
        "&nbsp; line console 0 → password &lt;p&gt; → login — пароль консоли<br>" +
        "&nbsp; enable secret &lt;p&gt; / enable password &lt;p&gt; — пароль enable<br>" +
        "&nbsp; banner motd #текст# — баннер MOTD<br>" +
        "&nbsp; service password-encryption — шифровать пароли<br>" +
        "&nbsp; show running-config / startup-config / version / mac address-table / interfaces status / ip interface brief<br>" +
        "&nbsp; copy running-config startup-config (write) — сохранить<br>" +
        "&nbsp; ping &lt;ip&gt; — ICMP-проверка<br>" +
        "&nbsp; help — эта справка</div>"
      );
    }

    function ctxHelp(partial) {
      var pool;
      if (dev.mode === "user") pool = ["enable", "disable", "exit", "ping", "show", "help", "?"];
      else if (dev.mode === "enable") pool = ["configure", "show", "copy", "write", "ping", "traceroute", "exit", "end", "disable", "help"];
      else pool = ["hostname", "line", "banner", "enable", "service", "interface", "end", "exit", "help"];
      var hits = pool.filter(function (c) { return c.indexOf(partial.toLowerCase()) === 0; });
      printHtml('<div class="cli-help">Possible commands:<br>' + hits.map(function (h) { return "&nbsp;" + Renderer.esc(h); }).join("<br>") + "</div>");
    }

    function doShow(rest, line) {
      var sub = (rest[0] || "").toLowerCase();
      if (dev.mode === "user" ) { print("% Please login first / use enable", "err"); return; }

      if (sub === "version" || (sub.startsWith("ver"))) {
        printHtml(
          '<div class="cli-block">Cisco IOS Software, C2960 Software (C2960-LANBASEK9-M), Version 15.0(2)SE4<br>' +
          "Technical Support: http://www.cisco.com/techsupport<br>" +
          "Copyright (c) 1986-2013 by Cisco Systems, Inc.<br><br>" +
          "cisco WS-C2960-24TT-L (PowerPC405) processor with 65536K bytes of memory.<br>" +
          "Processor board ID FOC1234X5YZ<br>" +
          "24 FastEthernet interfaces<br>" +
          "2 Gigabit Ethernet interfaces<br>" +
          "The password-recovery mechanism is enabled.<br><br>" +
          "64K bytes of flash-simulated non-volatile configuration memory.<br><br>" +
          "Base ethernet MAC Address       : 00:E0:F9:DC:1A:00<br>" +
          "Motherboard assembly number     : 73-10390-04<br>" +
          "System serial number            : FOC1234X5YZ</div>"
        );
        return;
      }
      if (sub === "running-config" || sub.startsWith("run")) {
        var c = dev.configs;
        var lines = ["Building configuration...", "", "Current configuration : 1048 bytes", "!", "version 15.0", "no service pad", "service timestamps debug datetime msec", "service timestamps log datetime msec", "service password-encryption", "!", "hostname " + c.hostname, "!"];
        lines.push(c.enableSecret ? ("enable secret 5 " + hashish(c.enableSecret)) : (c.enablePass ? ("enable password 7 " + hashish(c.enablePass)) : "no enable password"));
        if (c.consolePass) {
          lines.push("!", "line console 0", " password 7 " + hashish(c.consolePass), " login", "line vty 0 4", " login", "line vty 5 15", " login");
        }
        lines.push("!", "end");
        printHtml('<div class="cli-block">' + lines.map(Renderer.esc).join("<br>") + "</div>");
        return;
      }
      if (sub === "startup-config" || sub.startsWith("start")) {
        if (!dev.saved) { print("% Startup config is not present (не сохранено — выполните copy running-config startup-config)", "err"); return; }
        print("Building configuration..."); print("(идентична running-config после сохранения)"); return;
      }
      if (sub === "mac" && (rest[1] || "").toLowerCase().indexOf("add") === 0) {
        print("          Mac Address Table\n-------------------------------------------\nVlan    Mac Address       Type        Ports\n----    -----------       -----        ------");
        dev.macTable.forEach(function (m) {
          print("   1    " + m.mac + "   " + m.type + "   " + m.port);
        });
        print("Total Mac Addresses for this criterion: " + dev.macTable.length);
        return;
      }
      if (sub === "interfaces" && (rest[1] || "").toLowerCase().indexOf("sta") === 0) {
        print("Port      Name               Status       Vlan       Duplex  Speed Type");
        dev.ports.forEach(function (p) {
          print(p.id.padEnd(10) + " " + " ".repeat(17) + p.status.padEnd(13) + "1         " + (p.status === "up" ? "auto  auto" : "auto  auto") + " 10/100BaseTX");
        });
        return;
      }
      if (sub === "ip" && (rest[1] || "").toLowerCase().indexOf("int") === 0) {
        print("Interface              IP-Address      OK? Method Status                Protocol");
        print("Vlan1                  " + (dev.saved ? "192.168.1.10" : "unassigned").padEnd(16) + "YES NVRAM  up                    up");
        dev.ports.slice(0, 4).forEach(function (p) {
          print(p.id.padEnd(22) + "unassigned".padEnd(16) + "YES unset  " + (p.status === "up" ? "up                    up" : "down                  down"));
        });
        return;
      }
      if (!sub) { print("% Incomplete command.", "err"); ctxHelp("show"); return; }
      print("% Ambiguous command: \"" + line + "\"", "err");
      print("Поддерживается: show version | running-config | startup-config | mac address-table | interfaces status | ip interface brief");
    }

    function doConfig(cmd, rest, line) {
      if (cmd === "hostname") {
        if (!rest[0]) { print("% Incomplete command.", "err"); return; }
        dev.configs.hostname = rest[0];
        updPrompt(); return;
      }
      if (cmd === "line") {
        if ((rest[0] || "").toLowerCase() === "console" && rest[1] === "0") {
          dev._ctx = "console";
          print("Entering configuration line mode — введите: password <пароль>, затем login, затем exit");
          return;
        }
        print("% Unsupported line: line console 0 only (в симуляторе)"); return;
      }
      if (dev._ctx === "console") {
        if (cmd === "password") { dev.configs.consolePass = rest[0] || null; print("Сохранено: пароль консоли = " + rest[0]); return; }
        if (cmd === "login") { print("Login check enabled"); return; }
        if (cmd === "exit") { dev._ctx = null; updPrompt(); return; }
      }
      if (cmd === "enable") {
        if ((rest[0] || "").toLowerCase() === "secret") { dev.configs.enableSecret = rest[1] || null; print("Сохранено: enable secret = " + rest[1]); return; }
        if ((rest[0] || "").toLowerCase() === "password") { dev.configs.enablePass = rest[1] || null; print("Сохранено: enable password = " + rest[1]); return; }
        print("% Incomplete command — enable secret <pass>", "err"); return;
      }
      if (cmd === "banner") {
        if ((rest[0] || "").toLowerCase() === "motd") {
          var m = line.match(/motd\s+(\S)(.*)\1\s*$/);
          if (m) { dev.configs.banner = m[2]; print("Banner motd: " + m[2]); return; }
          print("Введите в виде: banner motd #Текст баннера#"); return;
        }
        print("% Unsupported — используйте banner motd #...#"); return;
      }
      if (cmd === "service") {
        if ((rest[0] || "").toLowerCase() === "password-encryption") {
          dev.configs.encrypt = true;
          print("Сервис шифрования паролей включён (service password-encryption)"); return;
        }
        print("% Unsupported service command"); return;
      }
      if (cmd === "interface") { print("% Интерфейсы не настраиваются в этом симуляторе (см. Lab 1_5)"); return; }
      if (cmd === "no") { print("% no-команды не реализованы в симуляторе"); return; }
      print("% Ambiguous/Invalid: \"" + line + "\"", "err");
      print("В режиме config поддерживаются: hostname, line console 0, enable secret, enable password, banner motd, service password-encryption, end");
    }

    function hashish(s) {
      var h = 0;
      for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
      return ("00000000" + h.toString(16)).slice(-8);
    }

    /* --- copy running-config startup-config / write --- */
    var origHandle = handle;
    handle = function (raw) {
      var line = raw.trim().toLowerCase();
      if (line === "copy running-config startup-config" || line === "write" || line === "wr") {
        print(dev.configs.hostname + prompt() + " " + raw.trim());
        print("Destination filename [startup-config]?");
        print("Building configuration...");
        print("[OK]");
        dev.saved = true;
        return;
      }
      origHandle(raw);
    };

    /* --- ввод --- */
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var v = input.value;
        input.value = "";
        handle(v);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (histIdx > 0) { histIdx--; input.value = hist[histIdx] || ""; }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (histIdx < hist.length - 1) { histIdx++; input.value = hist[histIdx] || ""; }
        else { histIdx = hist.length; input.value = ""; }
      } else if (e.key === "Tab") {
        e.preventDefault();
        var v = input.value;
        if (!v) return;
        var head = v.split(/\s+/)[0].toLowerCase();
        var pool = dev.mode === "config"
          ? ["hostname", "line", "banner", "enable", "service"]
          : dev.mode === "enable"
            ? ["configure", "show", "copy", "write", "ping", "end", "exit"]
            : ["enable", "show", "ping", "exit", "help"];
        var m = pool.filter(function (c) { return c.indexOf(head) === 0; });
        if (m.length === 1) {
          var parts = v.split(/\s+/); parts[0] = m[0];
          input.value = parts.join(" ") + (m[0] === "show" || m[0] === "configure" ? " " : "");
        } else if (m.length > 1) {
          print(m.join("  "));
        }
      } else if (e.key === "?" && !input.value) {
        e.preventDefault();
        handle("?");
      } else if (e.key === "?" ) {
        e.preventDefault();
        var v2 = input.value.trim().replace(/\?$/, "");
        if (v2.toLowerCase() === "show" || v2.toLowerCase().startsWith("show ")) {
          var subs = ["version", "running-config", "startup-config", "mac address-table", "interfaces status", "ip interface brief"];
          var pref = v2.split(/\s+/)[1] ? v2.split(/\s+/)[1].toLowerCase() : "";
          print(subs.filter(function (s) { return s.indexOf(pref) === 0; }).map(function (s) { return " " + s; }).join("\n"));
        } else {
          handle("?");
        }
      }
    });

    term.addEventListener("click", function () { input.focus(); });
    setTimeout(function () { input.focus(); }, 60);
    return wrap;
  }

  Renderer.register("cli", { render: render });
})();
