/* Рендерер блоков контента.
   Блок — объект {type: "...", ...}. Поддерживаемые типы:
   h2, h3, p, ul, ol, table, img, cmd, callout, qa, checklist, tabs,
   hr, quiz, flashcards, osi, cli, pager(обычный роутер), raw
*/
window.Renderer = (function () {

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* Инлайн-разметка: **bold**, *italic*, `code`, [text](href) */
  function inline(s) {
    s = esc(s);
    s = s.replace(/`([^`]+)`/g, function (_, c) { return "<code>" + c + "</code>"; });
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (_, t, h) {
      return '<a href="' + esc(h) + '">' + t + "</a>";
    });
    return s;
  }

  function slug(s) {
    return String(s).toLowerCase()
      .replace(/[^\wа-яё]+/gi, "-")
      .replace(/^-+|-+$/g, "").slice(0, 60);
  }

  var widgets = {}; /* регистрируются виджетами в window.Widgets */

  function el(html) {
    var d = document.createElement("div");
    d.innerHTML = html;
    return d.firstElementChild;
  }

  function renderBlock(b) {
    var t = b.type, out = "";
    switch (t) {
      case "h2":
        var id = b.id || slug(b.text);
        return el('<h2 class="blk-h2" id="' + id + '">' + inline(b.text) + "</h2>");

      case "h3":
        var id3 = b.id || slug(b.text);
        return el('<h3 class="blk-h3" id="' + id3 + '">' + inline(b.text) + "</h3>");

      case "p":
        return el('<p class="blk-p">' + inline(b.text) + "</p>");

      case "ul":
        return el('<ul class="blk-ul">' + (b.items || []).map(function (i) {
          return "<li>" + inline(i) + "</li>";
        }).join("") + "</ul>");

      case "ol":
        return el('<ol class="blk-ol">' + (b.items || []).map(function (i) {
          return "<li>" + inline(i) + "</li>";
        }).join("") + "</ol>");

      case "table": {
        var head = b.head || [];
        var rows = b.rows || [];
        var html = '<div class="tbl-wrap"><table class="tbl"><thead><tr>';
        head.forEach(function (h) { html += "<th>" + inline(h) + "</th>"; });
        html += "</tr></thead><tbody>";
        rows.forEach(function (r) {
          html += "<tr>";
          r.forEach(function (c) { html += "<td>" + inline(c) + "</td>"; });
          html += "</tr>";
        });
        html += "</tbody></table></div>";
        return el(html);
      }

      case "img": {
        var img = '<div class="blk-img' + (b.wide ? " wide" : "") + '">' +
          '<span class="frame"><img src="' + esc(b.src) + '" alt="' + esc(b.caption || "рисунок") + '" loading="lazy" decoding="async">' +
          "</span>" +
          (b.caption ? '<span class="cap">' + inline(b.caption) + "</span>" : "") +
          "</div>";
        return el(img);
      }

      case "cmd": {
        var lines = (b.lines || []).map(function (ln) {
          if (typeof ln === "string") {
            var cls = "c-cmd";
            if (ln.indexOf("!") === 0) cls = "c-cmt";
            else if (/^(%|Error|Invalid|Ambiguous|Incomplete)/.test(ln)) cls = "c-err";
            else if (/^[A-Za-z0-9._/-]+$/.test(ln) === false && /^(show|ping|traceroute|enable|configure|copy|write|dir|debug|telnet|ssh|sudo|ip |arp )/.test(ln) === false) cls = "c-out";
            return '<span class="' + cls + '">' + esc(ln) + "</span>";
          }
          /* {cmd:"..."} или {out:"..."} или {hl:"..."} */
          if (ln.cmd != null) return '<span class="c-cmd">' + esc(ln.cmd) + "</span>";
          if (ln.hl != null) return '<span class="c-hl">' + esc(ln.hl) + "</span>";
          if (ln.err != null) return '<span class="c-err">' + esc(ln.err) + "</span>";
          if (ln.cmt != null) return '<span class="c-cmt">' + esc(ln.cmt) + "</span>";
          return '<span class="c-out">' + esc(ln.out != null ? ln.out : "") + "</span>";
        }).join("\n");
        var rawText = (b.lines || []).map(function (ln) {
          if (typeof ln === "string") return ln;
          return ln.cmd != null ? ln.cmd : ln.hl != null ? ln.hl : ln.err != null ? ln.err : ln.cmt != null ? ln.cmt : (ln.out != null ? ln.out : "");
        }).join("\n");
        return el(
          '<div class="cmd">' +
          '<div class="cmd-head"><span>' + esc(b.title || "terminal") + "</span>" +
          '<button class="cmd-copy" data-copy="' + esc(rawText) + '">копировать</button></div>' +
          '<div class="cmd-body">' + lines + "</div></div>"
        );
      }

      case "callout": {
        var icons = { info: "ℹ️", warn: "⚠️", danger: "⛔", tip: "💡", deep: "🔬" };
        var kind = b.kind || "info";
        return el(
          '<div class="callout ' + kind + '">' +
          '<div class="co-title">' + (icons[kind] || "") + " " + esc(b.title || "") + "</div>" +
          "<p>" + inline(b.text) + "</p></div>"
        );
      }

      case "qa": {
        var qa = el(
          '<div class="qa"><button class="qa-q"><span class="qa-mark">+</span><span>' +
          inline(b.q) + '</span></button><div class="qa-a">' +
          (Array.isArray(b.a) ? b.a.map(function (p) { return "<p>" + inline(p) + "</p>"; }).join("") : "<p>" + inline(b.a) + "</p>") +
          "</div></div>"
        );
        qa.querySelector(".qa-q").addEventListener("click", function () {
          qa.classList.toggle("open");
        });
        return qa;
      }

      case "checklist": {
        var cl = el('<div class="checklist" data-cl="' + esc(b.id) + '"></div>');
        (b.items || []).forEach(function (item, i) {
          var checked = Progress.isChecked(b.id, i);
          var label = el(
            '<label class="check-item"><input type="checkbox" ' + (checked ? "checked" : "") + ">" +
            '<span class="box">✓</span><span class="txt">' + inline(item) + "</span></label>"
          );
          label.querySelector("input").addEventListener("change", function (e) {
            Progress.toggleCheck(b.id, i, e.target.checked);
          });
          cl.appendChild(label);
        });
        return cl;
      }

      case "tabs": {
        var tabsEl = el('<div class="tabs"></div>');
        var bar = el('<div class="tab-bar"></div>');
        var panes = [];
        (b.tabs || []).forEach(function (tb, i) {
          var btn = el('<button class="tab-btn' + (i === 0 ? " active" : "") + '">' + esc(tb.title) + "</button>");
          var pane = el('<div class="tab-pane' + (i === 0 ? " active" : "") + '"></div>');
          (tb.blocks || []).forEach(function (blk) {
            var n = renderBlock(blk);
            if (n) pane.appendChild(n);
          });
          btn.addEventListener("click", function () {
            tabsEl.querySelectorAll(".tab-btn").forEach(function (x) { x.classList.remove("active"); });
            tabsEl.querySelectorAll(".tab-pane").forEach(function (x) { x.classList.remove("active"); });
            btn.classList.add("active");
            pane.classList.add("active");
          });
          bar.appendChild(btn);
          panes.push(pane);
        });
        tabsEl.appendChild(bar);
        panes.forEach(function (p) { tabsEl.appendChild(p); });
        return tabsEl;
      }

      case "hr":
        return el('<hr class="blk-hr">');

      case "raw":
        return el(b.html);

      /* --- виджеты --- */
      case "quiz":
        return widgets.quiz ? widgets.quiz.render(b.id) : null;
      case "flashcards":
        return widgets.flashcards ? widgets.flashcards.render(b.id, b.title) : null;
      case "osi":
        return widgets.osi ? widgets.osi.render() : null;
      case "cli":
        return widgets.cli ? widgets.cli.render(b.device) : null;
      case "pinout":
        return widgets.pinout ? widgets.pinout.render() : null;
      case "pt":
        return widgets.pt ? widgets.pt.render(b) : null;

      default:
        console.warn("Renderer: неизвестный тип блока:", t);
        return null;
    }
  }

  function render(blocks, container) {
    container.innerHTML = "";
    (blocks || []).forEach(function (b) {
      var node = renderBlock(b);
      if (node) container.appendChild(node);
    });
    /* кнопки «копировать» */
    container.querySelectorAll(".cmd-copy").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var text = btn.getAttribute("data-copy");
        var done = function () {
          var old = btn.textContent;
          btn.textContent = "скопировано ✓";
          setTimeout(function () { btn.textContent = old; }, 1400);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, done);
        } else {
          var ta = document.createElement("textarea");
          ta.value = text; document.body.appendChild(ta); ta.select();
          try { document.execCommand("copy"); } catch (e) {}
          document.body.removeChild(ta); done();
        }
      });
    });
    return container;
  }

  /* --- регистрируемые виджеты --- */
  function register(name, api) { widgets[name] = api; }

  return { render: render, renderBlock: renderBlock, register: register, inline: inline, esc: esc, el: el };
})();
