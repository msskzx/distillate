/* Shared theme control for the standalone learning artifacts. */
(function () {
  "use strict";

  var key = "ticket-crafter-lesson-theme";
  var themes = ["auto", "light", "dark"];

  function apply(theme) {
    if (theme === "auto") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.dataset.theme = theme;
    }
  }

  function current() {
    var saved = localStorage.getItem(key);
    return themes.indexOf(saved) === -1 ? "auto" : saved;
  }

  function label(button, theme) {
    button.textContent = "Theme: " + theme[0].toUpperCase() + theme.slice(1);
    button.setAttribute("aria-label", "Color theme: " + theme + ". Activate to change.");
  }

  apply(current());

  document.addEventListener("DOMContentLoaded", function () {
    var button = document.querySelector("[data-theme-toggle]");
    if (!button) return;

    label(button, current());
    button.addEventListener("click", function () {
      var theme = themes[(themes.indexOf(current()) + 1) % themes.length];
      localStorage.setItem(key, theme);
      apply(theme);
      label(button, theme);
    });
  });
})();
