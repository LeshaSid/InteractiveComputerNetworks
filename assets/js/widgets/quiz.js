/* Виджет квиза (тест с выбором ответа) */
(function () {
  function render(quizId) {
    var quiz = (window.Site && Site.quizzes && Site.quizzes[quizId]) || [];
    var wrap = Renderer.el('<div class="quiz" data-quiz="' + Renderer.esc(quizId) + '"></div>');
    if (!quiz.length) {
      wrap.appendChild(Renderer.el('<div class="callout warn"><p>Тест не найден: ' + Renderer.esc(quizId) + "</p></div>"));
      return wrap;
    }

    var state = { i: 0, answered: 0, correct: 0, wrong: [], isRetry: false, fullTotal: quiz.length };
    var head = Renderer.el('<div class="quiz-head"></div>');
    var qBox = Renderer.el('<div class="quiz-body"></div>');
    var foot = Renderer.el('<div class="quiz-foot"></div>');
    wrap.appendChild(head); wrap.appendChild(qBox); wrap.appendChild(foot);

    function resetState(isRetry, fullTotal) {
      state = {
        i: 0, answered: 0, correct: 0, wrong: [],
        isRetry: !!isRetry,
        fullTotal: fullTotal || quiz.length
      };
    }

    function renderHead() {
      head.innerHTML = "";
      var best = Progress.quizBest(quizId);
      var total = state.isRetry ? quiz.length : state.fullTotal;
      var pct = total ? Math.round(state.correct / total * 100) : 0;
      head.appendChild(Renderer.el(
        '<div class="quiz-meta"><span>Вопрос ' + (state.i + 1) + " из " + quiz.length + (state.isRetry ? " (повтор ошибок)" : "") + "</span>" +
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
          else state.wrong.push({ qi: state.i, chosen: oi });
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
      var total = state.isRetry ? quiz.length : state.fullTotal;
      var pct = total ? Math.round(state.correct / total * 100) : 0;
      /* лучший результат — только для полного теста */
      if (!state.isRetry) Progress.quizSave(quizId, state.correct, total);
      var msg = pct >= 90 ? "Отличный результат! 🎉" : pct >= 70 ? "Хорошо, но можно лучше 👍" : "Стоит повторить материал 📚";
      qBox.innerHTML = "";

      var card = Renderer.el(
        '<div class="quiz-card quiz-result">' +
        '<div class="qr-num">' + state.correct + " / " + total + "</div>" +
        '<div class="qr-pct">' + pct + "%</div>" +
        '<div class="qr-msg">' + msg + (state.isRetry ? " (повтор ошибок)" : "") + "</div>" +
        "</div>"
      );

      /* список ошибок с разбором */
      if (state.wrong.length) {
        var list = Renderer.el('<div class="quiz-wrong"><div class="qw-title">Ошибки (' + state.wrong.length + ")</div></div>");
        state.wrong.forEach(function (w) {
          var q = quiz[w.qi];
          var chosen = (q.options || [])[w.chosen];
          var rightOpt = (q.options || [])[q.correct];
          list.appendChild(Renderer.el(
            '<div class="qw-item">' +
            '<div class="qw-q">' + Renderer.inline(q.q) + "</div>" +
            '<div class="qw-your">Ваш ответ: <s>' + Renderer.inline(chosen || "?") + "</s></div>" +
            '<div class="qw-right">Верно: <b>' + Renderer.inline(rightOpt || "?") + "</b></div>" +
            (q.explain ? '<div class="qw-ex">' + Renderer.inline(q.explain) + "</div>" : "") +
            "</div>"
          ));
        });
        card.appendChild(list);
      }

      var nav = Renderer.el('<div class="quiz-nav" style="justify-content:center"></div>');
      if (state.wrong.length) {
        var retryWrong = Renderer.el('<button class="btn">Повторить ошибки (' + state.wrong.length + ")</button>");
        retryWrong.addEventListener("click", function () {
          var wrongIdx = state.wrong.map(function (w) { return w.qi; });
          var subset = wrongIdx.map(function (i) { return quiz[i]; });
          startRound(subset, true, total);
        });
        nav.appendChild(retryWrong);
      }
      var again = Renderer.el('<button class="btn btn-primary">Пройти заново</button>');
      again.addEventListener("click", function () { startRound(fullQuiz.slice(), false, fullQuiz.length); });
      nav.appendChild(again);
      card.appendChild(nav);

      qBox.appendChild(card);
      renderHead();
    }

    /* запуск раунда: весь тест или только подмножество (повтор ошибок) */
    function startRound(roundQuiz, isRetry, fullTotal) {
      quiz = roundQuiz;
      resetState(isRetry, fullTotal);
      renderHead();
      renderQ();
    }

    var fullQuiz = quiz.slice();
    renderHead(); renderQ();
    return wrap;
  }

  Renderer.register("quiz", { render: render });
})();
