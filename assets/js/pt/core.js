/* Packet Tracer–симулятор: ядро — типы устройств, топология, шина событий.
   Задел на развитие:
     PT.registerDeviceType("ap", {...})  — новые типы устройств
     PT.on("packet", fn) / PT.on("arp", fn) — подписка на события симуляции
     Site.ptTopologies["lab1"] = {...}   — дополнительные топологии из content/ */
window.PT = (function () {
  var deviceTypes = {};
  var listeners = {};
  var uid = 0;

  function emit(evt, payload) {
    (listeners[evt] || []).forEach(function (fn) {
      try { fn(payload); } catch (e) { console.warn("PT listener", evt, e); }
    });
  }

  function on(evt, fn) {
    (listeners[evt] = listeners[evt] || []).push(fn);
  }

  function registerDeviceType(key, def) {
    deviceTypes[key] = def;
  }

  function nextId(prefix) { return (prefix || "d") + (++uid); }

  /* --- MAC/IP утилиты --- */
  function randomMac() {
    var h = "0123456789ABCDEF", s = "";
    for (var i = 0; i < 6; i++) {
      if (i) s += ":";
      s += h[Math.floor(Math.random() * 16)] + h[Math.floor(Math.random() * 16)];
    }
    return s;
  }

  function ipToInt(ip) {
    var p = String(ip).split(".");
    if (p.length !== 4) return 0;
    return ((+p[0] << 24) >>> 0) + ((+p[1] << 16) >>> 0) + ((+p[2] << 8) >>> 0) + (+p[3] >>> 0);
  }

  function sameSubnet(a, b, mask) {
    var m = ipToInt(mask);
    return (ipToInt(a) & m) === (ipToInt(b) & m);
  }

  function maskToCidr(mask) {
    var n = ipToInt(mask), c = 0;
    for (var i = 31; i >= 0; i--) {
      if ((n >>> i) & 1) c++;
      else break;
    }
    return c;
  }

  /* --- дефолтная топология (упрощённая учебная, лаб. 1) --- */
  function defaultTopology() {
    return {
      id: "lab1",
      title: "Учебная топология (аналог вводной PT)",
      devices: [
        { id: "pc1", type: "pc", name: "PC1", x: 12, y: 72,
          ip: "192.168.1.10", mask: "255.255.255.0", gw: "192.168.1.1", mac: randomMac() },
        { id: "pc2", type: "pc", name: "PC2", x: 12, y: 28,
          ip: "192.168.1.11", mask: "255.255.255.0", gw: "192.168.1.1", mac: randomMac() },
        { id: "s1", type: "switch", name: "S1", x: 38, y: 50,
          mac: randomMac(), ports: 24,
          slots: [{ id: "slot0", label: "Слот 0 (NM)", mod: null }, { id: "slot1", label: "Слот 1 (NM)", mod: null }],
          macTable: [] },
        { id: "r1", type: "router", name: "R1", x: 62, y: 50,
          mac: randomMac(),
          ifaces: [
            { id: "Gig0/0", ip: "192.168.1.1", mask: "255.255.255.0", status: "up" },
            { id: "Gig0/1", ip: "10.0.0.1", mask: "255.255.255.252", status: "up" }
          ],
          slots: [
            { id: "ehwic0", label: "EHWIC 0", mod: null },
            { id: "ehwic1", label: "EHWIC 1", mod: null }
          ] },
        { id: "srv", type: "server", name: "Server", x: 88, y: 28,
          ip: "10.0.0.2", mask: "255.255.255.252", gw: "10.0.0.1", mac: randomMac() },
        { id: "cloud", type: "cloud", name: "Internet", x: 88, y: 72,
          ip: null, mask: null, gw: null, mac: null }
      ],
      links: [
        { a: "pc1", b: "s1", kind: "lan" },
        { a: "pc2", b: "s1", kind: "lan" },
        { a: "s1", b: "r1", kind: "lan" },
        { a: "r1", b: "srv", kind: "wan" },
        { a: "r1", b: "cloud", kind: "wan" }
      ]
    };
  }

  /* --- контейнер состояния --- */
  function createSession(topo) {
    var t = topo || defaultTopology();
    var devices = t.devices.map(function (d) {
      var copy = JSON.parse(JSON.stringify(d));
      copy.arp = {};       /* ip -> {mac, at} */
      copy.alive = true;
      if (copy.type === "pc" || copy.type === "server") {
        if (!copy.mac) copy.mac = randomMac();
      }
      return copy;
    });
    var byId = {};
    devices.forEach(function (d) { byId[d.id] = d; });

    return {
      topology: { id: t.id, title: t.title, links: t.links },
      devices: devices,
      byId: byId,
      capture: [],        /* журнал кадров */
      seq: 0,
      mode: "realtime",   /* realtime | simulation */
      stats: { pingOk: 0, pingFail: 0, arpReqs: 0 }
    };
  }

  /* доступные модули для физ. панели (лаб. 1.6) */
  var modules = {
    "HWIC-4ESW": { name: "HWIC-4ESW", desc: "4× FastEthernet", addIfaces: ["Fa0/0/0", "Fa0/0/1", "Fa0/0/2", "Fa0/0/3"] },
    "PT-SWITCH-NM-1FGE": { name: "PT-SWITCH-NM-1FGE", desc: "1× Gigabit Ethernet (NM)", addIfaces: ["Gig1/0"] },
    "EHWIC-4T": { name: "EHWIC-4T", desc: "4× Serial WAN", addIfaces: ["Se0/0/0", "Se0/0/1", "Se0/0/2", "Se0/0/3"] }
  };

  /* --- типы устройств (расширяемый реестр) --- */
  registerDeviceType("pc", {
    icon: "🖥️", label: "ПК",
    canConfigIp: true, hasCli: false,
    defaults: function () { return { ip: "", mask: "255.255.255.0", gw: "" }; }
  });
  registerDeviceType("server", {
    icon: "🗄️", label: "Сервер",
    canConfigIp: true, hasCli: false,
    defaults: function () { return { ip: "", mask: "255.255.255.0", gw: "" }; }
  });
  registerDeviceType("switch", {
    icon: "🔀", label: "Коммутатор",
    canConfigIp: false, hasCli: true, cliKind: "switch",
    defaults: function () { return {}; }
  });
  registerDeviceType("router", {
    icon: "📡", label: "Маршрутизатор",
    canConfigIp: false, hasCli: true, cliKind: "router",
    defaults: function () { return {}; }
  });
  /* задел: registerDeviceType("ap", {...}), ("firewall", {...}) и т.д. */
  registerDeviceType("cloud", {
    icon: "☁️", label: "Облако / Интернет",
    canConfigIp: false, hasCli: false,
    defaults: function () { return {}; }
  });

  return {
    deviceTypes: deviceTypes,
    registerDeviceType: registerDeviceType,
    modules: modules,
    defaultTopology: defaultTopology,
    createSession: createSession,
    on: on,
    emit: emit,
    randomMac: randomMac,
    ipToInt: ipToInt,
    sameSubnet: sameSubnet,
    maskToCidr: maskToCidr,
    nextId: nextId
  };
})();
