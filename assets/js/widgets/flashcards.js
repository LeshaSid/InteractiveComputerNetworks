/* Виджет флеш-карточек (термин ↔ определение) */
(function () {
  function render(deckId, title) {
    var deck = (window.Site && Site.decks && Site.decks[deckId]) || [];
    var wrap = Renderer.el('<div class="flash" data-deck="' + Renderer.esc(deckId) + '"></div>');
    if (!deck.length) {
      wrap.appendChild(Renderer.el('<div class="callout warn"><p>Колода не найдена: ' + Renderer.esc(deckId) + "</p></div>"));
      return wrap;
    }

    var state = { i: 0, flipped: false };
    if (title) wrap.appendChild(Renderer.el('<h3 class="blk-h3">' + Renderer.esc(title) + "</h3>"));

    var head = Renderer.el('<div class="flash-head"><span class="flash-count"></span><span class="flash-seen"></span></div>');
    var stage = Renderer.el('<div class="flash-stage"></div>');
    var nav = Renderer.el('<div class="flash-nav"></div>');
    wrap.appendChild(head); wrap.appendChild(stage); wrap.appendChild(nav);

    function updHead() {
      head.querySelector(".flash-count").textContent = "Карточка " + (state.i + 1) + " из " + deck.length;
      var seen = Progress.cardsSeenCount(deckId);
      head.querySelector(".flash-seen").textContent = "изучено: " + Math.min(seen, deck.length) + "/" + deck.length;
    }

    function show() {
      state.flipped = false;
      Progress.cardSeen(deckId, state.i);
      var c = deck[state.i];
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
    }

    function go(d) {
      state.i = (state.i + d + deck.length) % deck.length;
      show();
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
