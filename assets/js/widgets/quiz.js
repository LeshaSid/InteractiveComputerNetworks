/* Виджет квиза (тест с выбором ответа) */
(function () {
  function render(quizId) {
    var quiz = (window.Site && Site.quizzes && Site.quizzes[quizId]) || [];
    var wrap = Renderer.el('<div class="quiz" data-quiz="' + Renderer.esc(quizId) + '"></div>');
    if (!quiz.length) {
      wrap.appendChild(Renderer.el('<div class="callout warn"><p>Тест не найден: ' + Renderer.esc(quizId) + "</p></div>"));
      return wrap;
    }

    var state = { i: 0, answered: 0, correct: 0 };
    var head = Renderer.el('<div class="quiz-head"></div>');
    var qBox = Renderer.el('<div class="quiz-body"></div>');
    var foot = Renderer.el('<div class="quiz-foot"></div>');
    wrap.appendChild(head); wrap.appendChild(qBox); wrap.appendChild(foot);

    function renderHead() {
      head.innerHTML = "";
      var best = Progress.quizBest(quizId);
      var pct = quiz.length ? Math.round(state.correct / quiz.length * 100) : 0;
      head.appendChild(Renderer.el(
        '<div class="quiz-meta"><span>Вопрос ' + (state.i + 1) + " из " + quiz.length + "</span>" +
        '<span class="quiz-score">Верно: ' + state.correct + "</span>" +
        (best ? '<span class="quiz-best">Лучший: ' + best.score + "/" + best.total + "</span>" : "") +
        "</div>"
      ));
      var bar = Renderer.el('<div class="quiz-bar"><i style="width:' + pct + '%"></i></div>');
      head.appendChild(bar);
    }

    function renderQ() {
      qBox.innerHTML = "";
      if (state.i >= quiz.length) { renderResult(); return; }
      var q = quiz[state.i];
      var card = Renderer.el('<div class="quiz-card"></div>');
      card.appendChild(Renderer.el('<div class="quiz-q">' + Renderer.inline(q.q) + "</div>"));
      var opts = Renderer.el('<div class="quiz-opts"></div>');
      (q.options || []).forEach(function (opt, oi) {
        var btn = Renderer.el('<button class="quiz-opt"><span class="q-key">' +
          "АБВГДЕ"[oi] + "</span><span>" + Renderer.inline(opt) + "</span></button>");
        btn.addEventListener("click", function () {
          if (card.classList.contains("done")) return;
          card.classList.add("done");
          state.answered++;
          var right = oi === q.correct;
          if (right) state.correct++;
          opts.querySelectorAll(".quiz-opt").forEach(function (b, bi) {
            b.disabled = true;
            if (bi === q.correct) b.classList.add("right");
            if (bi === oi && !right) b.classList.add("wrong");
            if (bi === oi && right) b.classList.add("right");
          });
          card.appendChild(Renderer.el(
            '<div class="quiz-explain ' + (right ? "ok" : "no") + '">' +
            (right ? "✅ Верно! " : "❌ Неверно. ") + Renderer.inline(q.explain || "") + "</div>"
          ));
          nav.style.display = "flex";
        });
        opts.appendChild(btn);
      });
      card.appendChild(opts);
      var nav = Renderer.el('<div class="quiz-nav" style="display:none"></div>');
      var next = Renderer.el('<button class="btn btn-primary">' +
        (state.i === quiz.length - 1 ? "Показать результат" : "Дальше →") + "</button>");
      next.addEventListener("click", function () { state.i++; renderHead(); renderQ(); });
      nav.appendChild(next);
      card.appendChild(nav);
      qBox.appendChild(card);
    }

    function renderResult() {
      var pct = Math.round(state.correct / quiz.length * 100);
      Progress.quizSave(quizId, state.correct, quiz.length);
      var msg = pct >= 90 ? "Отличный результат! 🎉" : pct >= 70 ? "Хорошо, но можно лучше 👍" : "Стоит повторить материал 📚";
      qBox.innerHTML = "";
      var card = Renderer.el(
        '<div class="quiz-card quiz-result">' +
        '<div class="qr-num">' + state.correct + " / " + quiz.length + "</div>" +
        '<div class="qr-pct">' + pct + "%</div>" +
        '<div class="qr-msg">' + msg + "</div>" +
        '<div class="quiz-nav"><button class="btn btn-primary">Пройти заново</button></div>' +
        "</div>"
      );
      card.querySelector("button").addEventListener("click", function () {
        state = { i: 0, answered: 0, correct: 0 };
        renderHead(); renderQ();
      });
      qBox.appendChild(card);
      renderHead();
    }

    renderHead(); renderQ();
    return wrap;
  }

  Renderer.register("quiz", { render: render });
})();
