/* Packet Tracer–симулятор: движок — маршрутизация, ARP, ICMP, журнал кадров.
   Путь ищем по links; ARP learning; ping с пошаговыми событиями для анимации. */
window.PTSim = (function () {

  function neighbors(sess, id) {
    var out = [];
    sess.topology.links.forEach(function (l) {
      if (l.a === id) out.push({ id: l.b, kind: l.kind });
      else if (l.b === id) out.push({ id: l.a, kind: l.kind });
    });
    return out;
  }

  /* BFS: кратчайший путь устройств (по хопам) */
  function findPath(sess, from, to) {
    if (from === to) return [from];
    var prev = {}, q = [from], seen = {};
    seen[from] = true;
    while (q.length) {
      var cur = q.shift();
      var ns = neighbors(sess, cur);
      for (var i = 0; i < ns.length; i++) {
        var n = ns[i].id;
        if (seen[n]) continue;
        seen[n] = true;
        prev[n] = cur;
        if (n === to) {
          var path = [to];
          var p = to;
          while (prev[p]) { p = prev[p]; path.unshift(p); }
          return path;
        }
        q.push(n);
      }
    }
    return null;
  }

  function logCapture(sess, entry) {
    sess.seq++;
    var e = {
      no: sess.seq,
      time: (Date.now() % 1000000) / 1000,
      src: entry.src,
      dst: entry.dst,
      proto: entry.proto,
      info: entry.info,
      layers: entry.layers || null,
      raw: entry.raw || null
    };
    sess.capture.push(e);
    if (sess.capture.length > 200) sess.capture.shift();
    PT.emit("capture", e);
    return e;
  }

  function ethFrame(srcMac, dstMac, type, payload) {
    return {
      dst: dstMac, src: srcMac, type: type, payload: payload
    };
  }

  function arpFrame(op, senderMac, senderIp, targetMac, targetIp) {
    return {
      op: op, /* request | reply */
      sha: senderMac, spa: senderIp,
      tha: targetMac, tpa: targetIp
    };
  }

  function icmpFrame(type, id, seq, data) {
    return { type: type, id: id, seq: seq, data: data || "ping payload" };
  }

  function learnArp(dev, ip, mac) {
    if (!dev || !ip) return;
    dev.arp[ip] = { mac: mac, at: Date.now() };
    PT.emit("arp", { dev: dev.id, ip: ip, mac: mac });
  }

  /* узел, у которого есть IP в данной подсети (или endpoint) */
  function findIpHolder(sess, ip) {
    for (var i = 0; i < sess.devices.length; i++) {
      var d = sess.devices[i];
      if (d.ip === ip) return d;
      if (d.ifaces) {
        for (var j = 0; j < d.ifaces.length; j++) {
          if (d.ifaces[j].ip === ip) return d;
        }
      }
    }
    return null;
  }

  function ifaceForIp(dev, ip) {
    if (!dev) return null;
    if (dev.ip === ip) return { ip: dev.ip, mask: dev.mask };
    if (dev.ifaces) {
      for (var i = 0; i < dev.ifaces.length; i++) {
        if (dev.ifaces[i].ip === ip) return dev.ifaces[i];
      }
    }
    return null;
  }

  /* next-hop: если in subnet — dst, иначе gw (только для pc/server) */
  function nextHopFor(srcDev, dstIp) {
    if (srcDev.type === "pc" || srcDev.type === "server") {
      if (PT.sameSubnet(srcDev.ip, dstIp, srcDev.mask)) return dstIp;
      return srcDev.gw || dstIp;
    }
    if (srcDev.ifaces) {
      for (var i = 0; i < srcDev.ifaces.length; i++) {
        var f = srcDev.ifaces[i];
        if (f.status !== "up") continue;
        if (PT.sameSubnet(f.ip, dstIp, f.mask)) return dstIp;
      }
      /* fallback: первый up */
      for (var j = 0; j < srcDev.ifaces.length; j++) {
        if (srcDev.ifaces[j].status === "up") return dstIp;
      }
    }
    return dstIp;
  }

  function macOf(sess, devId) {
    var d = sess.byId[devId];
    if (!d) return null;
    if (d.mac) return d.mac;
    if (d.ifaces && d.ifaces[0]) return d.mac || PT.randomMac();
    return null;
  }

  /* ARP-обмен между двумя устройствами (обмен кадрами по соседям) */
  function arpExchange(sess, fromId, targetIp, steps) {
    var from = sess.byId[fromId];
    if (!from) return null;
    var targetMac = null;

    /* уже в кэше? */
    if (from.arp[targetIp]) {
      steps.push({
        kind: "arp", phase: "cache",
        from: fromId, to: fromId, ip: targetIp, mac: from.arp[targetIp].mac,
        note: "ARP cache hit " + targetIp + " → " + from.arp[targetIp].mac
      });
      return from.arp[targetIp].mac;
    }

    sess.stats.arpReqs++;
    var req = arpFrame("request", from.mac || PT.randomMac(), from.ip || (ifaceForIp(from, targetIp) || {}).ip || "0.0.0.0", "00:00:00:00:00:00", targetIp);

    /* broadcast по всем соседям */
    var ns = neighbors(sess, fromId);
    steps.push({
      kind: "arp", phase: "request",
      from: fromId, to: ns.map(function (n) { return n.id; }),
      ip: targetIp, frame: req,
      note: "Who has " + targetIp + "? Tell " + (req.spa || "?")
    });

    /* кто владеет IP — отвечает (если это напрямую сосед или есть путь) */
    var owner = findIpHolder(sess, targetIp);
    if (owner) {
      var ownerMac = owner.mac || PT.randomMac();
      if (!owner.mac) owner.mac = ownerMac;
      steps.push({
        kind: "arp", phase: "reply",
        from: owner.id, to: fromId,
        ip: targetIp, mac: ownerMac,
        frame: arpFrame("reply", ownerMac, targetIp, req.sha, req.spa),
        note: targetIp + " is at " + ownerMac
      });
      learnArp(from, targetIp, ownerMac);
      /* зеркально учим владельца, если у нас есть его IP */
      if (from.ip) learnArp(owner, from.ip, from.mac || req.sha);
      targetMac = ownerMac;
    } else {
      steps.push({
        kind: "arp", phase: "fail",
        from: fromId, to: null,
        ip: targetIp,
        note: "No ARP reply for " + targetIp + " (unreachable)"
      });
    }
    return targetMac;
  }

  /* Прокладка кадра по path (массив id). Для L3-хопов — ARP на next-hop. */
  function frameAlongPath(sess, path, proto, buildPayload, steps) {
    if (!path || path.length < 2) return false;
    for (var i = 0; i < path.length - 1; i++) {
      var cur = sess.byId[path[i]];
      var nxt = sess.byId[path[i + 1]];
      if (!cur || !nxt) return false;

      /* на L3-устройстве (router) может смениться L2-адрес назначения */
      var dstMac;
      if (i === path.length - 2) {
        /* последний хоп: MAC конечной точки (или её интерфейса) */
        dstMac = nxt.mac || macOf(sess, nxt.id);
        if (!dstMac) dstMac = PT.randomMac();
        /* пробуем ARP, если есть IP у текущего */
        var targetIp = nxt.ip || (nxt.ifaces && nxt.ifaces[0] && nxt.ifaces[0].ip);
        if (targetIp && cur.type !== "switch") {
          var m = arpExchange(sess, cur.id, targetIp, steps);
          if (m) dstMac = m;
        }
      } else {
        dstMac = nxt.mac || macOf(sess, nxt.id);
        if (!dstMac) dstMac = PT.randomMac();
        /* межсетевой next-hop */
        var hopIp = ipOfDeviceForPath(sess, path[i + 1], path[i + 2]);
        if (hopIp && cur.ifaces) {
          var mm = arpExchange(sess, cur.id, hopIp, steps);
          if (mm) dstMac = mm;
        }
      }

      var frame = ethFrame(cur.mac || PT.randomMac(), dstMac, proto, buildPayload(cur, nxt));
      steps.push({
        kind: "frame", proto: proto,
        from: cur.id, to: nxt.id,
        frame: frame,
        note: proto + " " + (cur.name || cur.id) + " → " + (nxt.name || nxt.id)
      });

      /* свитч учит MAC */
      if (cur.type === "switch" || nxt.type === "switch") {
        var sw = cur.type === "switch" ? cur : nxt;
        var port = cur.type === "switch" ? nxt.id : cur.id;
        upsertMacTable(sw, frame.src, port);
      }
    }
    return true;
  }

  function ipOfDeviceForPath(sess, devId, afterId) {
    var d = sess.byId[devId];
    if (!d) return null;
    if (d.ip) return d.ip;
    if (d.ifaces) {
      /* интерфейс, смотрящий в сторону afterId — берём первый up (упрощение) */
      for (var i = 0; i < d.ifaces.length; i++) {
        if (d.ifaces[i].status === "up") return d.ifaces[i].ip;
      }
    }
    return null;
  }

  function upsertMacTable(sw, mac, port) {
    if (!sw.macTable) sw.macTable = [];
    for (var i = 0; i < sw.macTable.length; i++) {
      if (sw.macTable[i].mac === mac) {
        sw.macTable[i].port = port;
        sw.macTable[i].at = Date.now();
        return;
      }
    }
    sw.macTable.push({ mac: mac, port: port, type: "DYNAMIC", at: Date.now() });
    if (sw.macTable.length > 50) sw.macTable.shift();
  }

  /* --- Ping: полный цикл с ARP + ICMP echo/reply --- */
  function ping(sess, srcId, dstId, opts) {
    opts = opts || {};
    var src = sess.byId[srcId], dst = sess.byId[dstId];
    var steps = [];
    if (!src || !dst) return { ok: false, steps: steps, error: "device?" };
    if (!src.ip || !dst.ip) {
      /* у маршрутизатора IP в ifaces */
      var sip = src.ip || (src.ifaces && src.ifaces[0] && src.ifaces[0].ip);
      var dip = dst.ip || (dst.ifaces && dst.ifaces[0] && dst.ifaces[0].ip);
      if (!sip || !dip) {
        return { ok: false, steps: steps, error: "У source/dest нет IP — настройте IP Configuration" };
      }
    }

    var path = findPath(sess, srcId, dstId);
    if (!path) {
      steps.push({ kind: "error", note: "Нет пути между " + srcId + " и " + dstId });
      return { ok: false, steps: steps, error: "No path" };
    }

    var dstIp = dst.ip || (dst.ifaces && dst.ifaces.find(function (f) { return f.status === "up"; }) || {}).ip;
    var srcIp = src.ip || (src.ifaces && src.ifaces.find(function (f) { return f.status === "up"; }) || {}).ip;

    /* next-hop ARP для исходного узла */
    var nh = nextHopFor(src, dstIp);
    var nhMac = arpExchange(sess, srcId, nh, steps);
    if (!nhMac) {
      logCapture(sess, {
        src: src.name || srcId, dst: dst.name || dstId,
        proto: "ARP",
        info: "Who has " + nh + "? — no reply",
        layers: null
      });
      sess.stats.pingFail++;
      return { ok: false, steps: steps, error: "ARP failed for " + nh };
    }

    var icmpId = 1000 + Math.floor(Math.random() * 2000);
    var icmpSeq = 1;
    var rtt = [];

    /* echo request вперёд */
    var fwdOk = frameAlongPath(sess, path, "IPv4", function (a, b) {
      return {
        ip: { src: srcIp, dst: dstIp, ttl: 64, proto: "ICMP" },
        icmp: icmpFrame("echo-request", icmpId, icmpSeq)
      };
    }, steps);

    if (!fwdOk) {
      sess.stats.pingFail++;
      return { ok: false, steps: steps, error: "Path failed" };
    }

    /* reply назад по обратному пути */
    var rev = path.slice().reverse();
    var revOk = frameAlongPath(sess, rev, "IPv4", function (a, b) {
      return {
        ip: { src: dstIp, dst: srcIp, ttl: 64, proto: "ICMP" },
        icmp: icmpFrame("echo-reply", icmpId, icmpSeq)
      };
    }, steps);

    if (!revOk) {
      sess.stats.pingFail++;
      logCapture(sess, {
        src: src.name || srcId, dst: dst.name || dstId,
        proto: "ICMP",
        info: "Echo request to " + dstIp + " — no reply (timeout)",
        layers: buildIcmpLayers(srcIp, dstIp, "echo-request", icmpId, icmpSeq, path)
      });
      return { ok: false, steps: steps, error: "No reply" };
    }

    var ms = 1 + Math.floor(Math.random() * 4);
    rtt.push(ms);
    sess.stats.pingOk++;

    /* журнал ICMP */
    logCapture(sess, {
      src: src.name || srcId, dst: dst.name || dstId,
      proto: "ICMP",
      info: "Echo (ping) request  id=" + icmpId + " seq=" + icmpSeq,
      layers: buildIcmpLayers(srcIp, dstIp, "echo-request", icmpId, icmpSeq, path),
      raw: "IP src=" + srcIp + " dst=" + dstIp + " ttl=64\nICMP type=8 code=0 id=" + icmpId + " seq=" + icmpSeq
    });
    logCapture(sess, {
      src: dst.name || dstId, dst: src.name || srcId,
      proto: "ICMP",
      info: "Echo (ping) reply  id=" + icmpId + " seq=" + icmpSeq + "  rtt=" + ms + "ms",
      layers: buildIcmpLayers(dstIp, srcIp, "echo-reply", icmpId, icmpSeq, path.slice().reverse()),
      raw: "IP src=" + dstIp + " dst=" + srcIp + " ttl=64\nICMP type=0 code=0 id=" + icmpId + " seq=" + icmpSeq
    });

    return {
      ok: true,
      steps: steps,
      path: path,
      rtt: ms,
      summary: "Success rate is 100 percent (1/1), round-trip min/avg/max = " + ms + "/" + ms + "/" + ms + " ms"
    };
  }

  function buildIcmpLayers(srcIp, dstIp, type, id, seq, path) {
    return [
      { layer: "L2 Ethernet", cls: "l2",
        text: "dst=" + (path && path.length ? "…next-hop MAC" : "?") + "  src=…  type=IPv4 (0x0800)" },
      { layer: "L3 IPv4", cls: "l3",
        text: "src=" + srcIp + "  dst=" + dstIp + "  ttl=64  proto=ICMP (1)" },
      { layer: "L4 ICMP", cls: "l4",
        text: (type === "echo-request" ? "type=8 (Echo request)" : "type=0 (Echo reply)") +
          "  code=0  id=" + id + "  seq=" + seq }
    ];
  }

  /* --- Журнал: разбор ARP-кадров в capture при arpExchange --- */
  function recordArpCapture(sess, step) {
    if (step.kind !== "arp") return;
    var srcName = step.from ? (sess.byId[step.from] || {}).name || step.from : "?";
    var dstName = step.to
      ? (Array.isArray(step.to)
        ? step.to.map(function (t) { return (sess.byId[t] || {}).name || t; }).join(", ")
        : (sess.byId[step.to] || {}).name || step.to)
      : "Broadcast";
    if (step.phase === "request") {
      logCapture(sess, {
        src: srcName, dst: "Broadcast", proto: "ARP",
        info: "Who has " + step.ip + "? Tell " + ((step.frame && step.frame.spa) || "?"),
        layers: [
          { layer: "L2 Ethernet", cls: "l2", text: "dst=ff:ff:ff:ff:ff:ff  type=ARP (0x0806)" },
          { layer: "ARP", cls: "l3",
            text: "opcode=1 (request)  spa=" + ((step.frame && step.frame.spa) || "?") +
              "  sha=" + ((step.frame && step.frame.sha) || "?") +
              "  tpa=" + step.ip }
        ],
        raw: "Hardware type=Ethernet  Protocol type=IPv4  Opcode=request\n" +
          "SHA=" + ((step.frame && step.frame.sha) || "?") + "  SPA=" + ((step.frame && step.frame.spa) || "?") + "\n" +
          "THA=00:00:00:00:00:00  TPA=" + step.ip
      });
    } else if (step.phase === "reply") {
      logCapture(sess, {
        src: srcName, dst: dstName, proto: "ARP",
        info: step.ip + " is at " + step.mac,
        layers: [
          { layer: "L2 Ethernet", cls: "l2", text: "dst=…  type=ARP (0x0806)" },
          { layer: "ARP", cls: "l3",
            text: "opcode=2 (reply)  spa=" + step.ip + "  sha=" + step.mac +
              "  tpa=" + ((step.frame && step.frame.tpa) || "?") }
        ],
        raw: "Opcode=reply\nSHA=" + step.mac + "  SPA=" + step.ip + "\n" +
          "THA=" + ((step.frame && step.frame.tha) || "?") + "  TPA=" + ((step.frame && step.frame.tpa) || "?")
      });
    }
  }

  /* обёртка: выполняет ping и пишет ARP в capture */
  function runPing(sess, srcId, dstId) {
    var before = sess.capture.length;
    var res = ping(sess, srcId, dstId);
    /* дописываем ARP-шаги, которые не попали через logCapture внутри */
    res.steps.forEach(function (s) {
      if (s.kind === "arp" && (s.phase === "request" || s.phase === "reply")) {
        /* проверяем, не дублируем ли — ping уже может логировать; логируем всегда для наглядности */
        recordArpCapture(sess, s);
      }
    });
    return res;
  }

  return {
    findPath: findPath,
    ping: runPing,
    neighbors: neighbors,
    learnArp: learnArp,
    upsertMacTable: upsertMacTable,
    logCapture: logCapture
  };
})();
