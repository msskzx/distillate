/* ==========================================================================
   Ticket Crafter Architecture — shared quiz widget
   Declarative: author a <div class="quiz" data-quiz> block, this wires it up.
   Also powers .reveal answer blocks, which need no JavaScript at all.
   ========================================================================== */

(function () {
  "use strict";

  function wireQuiz(root) {
    if (root.dataset.quizWired === "1") return;
    root.dataset.quizWired = "1";

    var questionEl = root.querySelector(".q");
    var optionsEl = root.querySelector(".options");
    if (!optionsEl) return;

    var options = Array.prototype.slice.call(optionsEl.querySelectorAll("button.opt"));
    if (!options.length) return;

    options.forEach(function (btn) {
      btn.type = "button";
      btn.setAttribute("aria-pressed", "false");

      btn.addEventListener("click", function () {
        if (optionsEl.dataset.answered === "1") return;
        optionsEl.dataset.answered = "1";

        var correctValue = root.dataset.correct;
        var chosenValue = btn.dataset.value;
        var isRight = chosenValue === correctValue;

        options.forEach(function (o) {
          o.disabled = true;
          o.setAttribute("aria-pressed", "false");
          if (o.dataset.value === correctValue) o.classList.add("correct");
        });

        if (isRight) {
          btn.classList.add("correct");
          btn.setAttribute("aria-pressed", "true");
        } else {
          btn.classList.add("wrong");
        }

        // Let the author attach a message to the picked option, or to the
        // quiz as a whole. Per-option wins.
        var specific = btn.querySelector(".why");
        var feedbackText = specific
          ? specific.textContent
          : root.dataset.why || "";

        var fb = document.createElement("div");
        fb.className = "feedback show " + (isRight ? "ok" : "no");
        fb.setAttribute("role", "status");
        fb.setAttribute("aria-live", "polite");

        var head = document.createElement("b");
        head.textContent = isRight ? "Correct." : "Not quite.";
        fb.appendChild(head);

        if (feedbackText) {
          var p = document.createElement("p");
          p.textContent = feedbackText.trim();
          fb.appendChild(p);
        }

        if (!isRight) {
          var right = document.createElement("p");
          right.innerHTML =
            "<b>The answer:</b> " +
            (questionEl ? questionEl.getAttribute("data-answer") || "" : "");
          fb.appendChild(right);
        }

        root.appendChild(fb);
      });
    });
  }

  function init() {
    document.querySelectorAll(".quiz").forEach(wireQuiz);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
