/* Виджет флеш-карточек (термин ↔ определение) */
(function () {
  function render(deckId, title) {
    var deck = (window.Site && Site.decks && Site.decks[deckId]) || [];
    var wrap = Renderer.el('<div class="flash" data-deck="' + Renderer.esc(deckId) + '"></div>');
    if (!deck.length) {
      wrap.appendChild(Renderer.el('<div class="callout warn"><p>Колода не найдена: ' + Renderer.esc(deckId) + "</p></div>"));
      return wrap;
    }

    var state = { i: 0, flipped: false, order: null, unseenOnly: false };
    if (title) wrap.appendChild(Renderer.el('<h3 class="blk-h3">' + Renderer.esc(title) + "</h3>"));

    var head = Renderer.el('<div class="flash-head"><span class="flash-count"></span><span class="flash-seen"></span></div>');
    var stage = Renderer.el('<div class="flash-stage"></div>');
    var tools = Renderer.el('<div class="flash-tools"></div>');
    var nav = Renderer.el('<div class="flash-nav"></div>');
    wrap.appendChild(head); wrap.appendChild(stage); wrap.appendChild(tools); wrap.appendChild(nav);

    function fullOrder() {
      return deck.map(function (_, i) { return i; });
    }

    function currentOrder() {
      if (state.unseenOnly) {
        var unseen = [];
        deck.forEach(function (_, i) {
          if (!Progress.isCardSeen(deckId, i)) unseen.push(i);
        });
        return unseen.length ? unseen : fullOrder();
      }
      return state.order || fullOrder();
    }

    function posInDeck() {
      var ord = currentOrder();
      return ord[state.i % Math.max(ord.length, 1)];
    }

    function updHead() {
      var ord = currentOrder();
      head.querySelector(".flash-count").textContent = "Карточка " + ((state.i % Math.max(ord.length, 1)) + 1) + " из " + ord.length +
        (state.unseenOnly ? " (только новые)" : "");
      var seen = Progress.cardsSeenCount(deckId);
      head.querySelector(".flash-seen").textContent = "изучено: " + Math.min(seen, deck.length) + "/" + deck.length;
    }

    function show() {
      state.flipped = false;
      var ord = currentOrder();
      if (!ord.length) return;
      if (state.i >= ord.length) state.i = 0;
      var di = ord[state.i];
      Progress.cardSeen(deckId, di);
      var c = deck[di];
      stage.innerHTML = "";
      var card = Renderer.el(
        '<button class="flash-card"><div class="fc-inner">' +
        '<div class="fc-face fc-front"><span class="fc-label">Термин</span><span class="fc-text">' + Renderer.inline(c.term) + '</span><span class="fc-hint">нажмите, чтобы перевернуть</span></div>' +
        '<div class="fc-face fc-back"><span class="fc-label">Определение</span><span class="fc-text">' + Renderer.inline(c.def) + "</span></div>" +
        "</div></button>"
      );
      card.addEventListener("click", function () {
        state.flipped = !state.flipped;
        card.classList.toggle("flipped", state.flipped);
      });
      stage.appendChild(card);
      updHead();
      updTools();
    }

    function go(d) {
      var ord = currentOrder();
      if (!ord.length) return;
      state.i = (state.i + d + ord.length) % ord.length;
      show();
    }

    function shuffleArr(a) {
      var r = a.slice();
      for (var i = r.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = r[i]; r[i] = r[j]; r[j] = t;
      }
      return r;
    }

    function updTools() {
      tools.innerHTML = "";
      var sh = mkTool("🔀 Перемешать", function () {
        state.order = shuffleArr(fullOrder());
        state.unseenOnly = false;
        state.i = 0;
        show();
      });
      var un = mkTool(state.unseenOnly ? "📚 Показать все" : "🆕 Только новые", function () {
        state.unseenOnly = !state.unseenOnly;
        state.i = 0;
        show();
      });
      if (state.unseenOnly) un.classList.add("active");
      tools.appendChild(sh);
      tools.appendChild(un);
    }

    function mkTool(label, fn) {
      var b = Renderer.el('<button class="flash-tool">' + label + "</button>");
      b.addEventListener("click", fn);
      return b;
    }

    nav.appendChild(mkBtn("← Назад", function () { go(-1); }));
    nav.appendChild(mkBtn("Перевернуть ↻", function () {
      var card = stage.querySelector(".flash-card");
      if (card) { state.flipped = !state.flipped; card.classList.toggle("flipped", state.flipped); }
    }, "btn-wide"));
    nav.appendChild(mkBtn("Далее →", function () { go(1); }));

    function mkBtn(label, fn, extra) {
      var b = Renderer.el('<button class="btn ' + (extra || "") + '">' + label + "</button>");
      b.addEventListener("click", fn);
      return b;
    }

    /* свайпы на мобильных */
    var x0 = null;
    stage.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      if (x0 == null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      x0 = null;
    });

    show();
    return wrap;
  }

  Renderer.register("flashcards", { render: render });
})();
