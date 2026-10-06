/* ==========================================================================
   Ticket Crafter Architecture — shared lesson sidebar
   Generates the left-hand lesson list from assets/curriculum.js and handles
   show/hide. Progressive enhancement: the <nav> is built at load time, so a
   lesson stays readable and centred if this file never runs.

   Markup contract (both optional, all handled):
     <nav data-sidebar></nav>            the column itself
     <button data-sidebar-toggle>        show (wide) / open drawer (narrow)
     <button data-sidebar-close>         hide; injected into the nav head

   The collapsed state is persisted so the pane stays where you left it.
   Applied at parse time, before DOMContentLoaded, to avoid a flash.
   ========================================================================== */

(function () {
  "use strict";

  var root = document.documentElement;
  var KEY = "ticket-crafter-sidebar";
  var WIDE = "(min-width: 60.001rem)";

  /* ---- state ----------------------------------------------------------- */

  function stored() {
    try {
      return localStorage.getItem(KEY);
    } catch (error) {
      return null; // private mode, disabled storage: fall back to default
    }
  }

  function remember(value) {
    try {
      localStorage.setItem(KEY, value);
    } catch (error) {
      /* not fatal — the pane still toggles for this page view */
    }
  }

  // Matches the CSS media query that decides drawer vs docked.
  function isWide() {
    return window.matchMedia(WIDE).matches;
  }

  function isHidden() {
    return root.classList.contains("sidebar-hidden");
  }

  /* ---- visibility ------------------------------------------------------ */

  function applyHidden(hidden) {
    root.classList.toggle("sidebar-hidden", hidden);
    syncControls();
  }

  function applyDrawer(open) {
    root.classList.toggle("sidebar-open", open);
    var toggle = document.querySelector("[data-sidebar-toggle]");
    if (toggle) toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function show() {
    if (isWide()) {
      root.classList.remove("sidebar-hidden");
      remember("open");
    } else {
      applyDrawer(true);
    }
    syncControls();
  }

  function hide() {
    if (isWide()) {
      root.classList.add("sidebar-hidden");
      applyDrawer(false);
      remember("closed");
    } else {
      applyDrawer(false);
    }
    syncControls();
  }

  // One place that decides what each control's label and state should be, so
  // the two buttons can never disagree.
  function syncControls() {
    var toggle = document.querySelector("[data-sidebar-toggle]");
    var close = document.querySelector("[data-sidebar-close]");

    if (toggle) {
      var wide = isWide();
      var expanded = wide ? !isHidden() : root.classList.contains("sidebar-open");
      toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
      toggle.setAttribute(
        "aria-label",
        wide
          ? isHidden()
            ? "Show lesson list"
            : "Lesson list shown. Activate to hide."
          : expanded
            ? "Lesson list open. Activate to close."
            : "Show lesson list"
      );
    }

    if (close) {
      var visible = isWide() ? !isHidden() : root.classList.contains("sidebar-open");
      close.hidden = !visible;
    }
  }

  /* ---- build ----------------------------------------------------------- */

  function manifest() {
    return window.TICKET_CRAFTER_CURRICULUM || [];
  }

  // Compare on the path only: query and hash are not identity. Keep the last
  // two segments so one manifest works from any depth, and drop empty
  // segments so a trailing slash cannot defeat the match.
  function currentPath() {
    var link = document.querySelector("link[rel='canonical']");
    if (link && link.getAttribute("href")) return normalise(link.getAttribute("href"));
    return normalise(location.pathname.split("/").filter(Boolean).slice(-2).join("/"));
  }

  function normalise(value) {
    return String(value || "").replace(/^\.?\//, "").replace(/\\/g, "/");
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function head() {
    return (
      '<div class="sb-head">' +
      '<a class="sb-brand" href="../index.html">Distillate</a>' +
      '<p class="sb-tagline">Engineering lessons for builders & agents.</p>' +
      '<button type="button" class="sb-close" data-sidebar-close>' +
      '<span aria-hidden="true">&#215;</span>' +
      '<span class="sb-close-text">Hide</span>' +
      "</button>" +
      "</div>"
    );
  }

  function build() {
    var nav = document.querySelector("[data-sidebar]");
    if (!nav) return;
    var groups = manifest();

    if (!groups.length) {
      nav.hidden = true;
      root.classList.remove("has-sidebar");
      return;
    }

    var here = currentPath();
    var html = head();

    groups.forEach(function (group) {
      html += '<div class="sb-group">';
      html += '<p class="sb-group-name">' + escapeHtml(group.group) + "</p>";
      html += '<ul class="sb-list">';

      group.items.forEach(function (item) {
        var isCurrent = normalise(item.file) === here;
        // Unwritten lessons show as dimmed and inert, so the shape of the
        // course is visible without offering a dead link.
        var available = item.status !== "planned";
        var cls = "sb-item" + (isCurrent ? " is-current" : "");
        if (!available) cls += " is-planned";

        var id = '<span class="sb-id">' + escapeHtml(item.id) + "</span>";
        var title = '<span class="sb-title">' + escapeHtml(item.title) + "</span>";

        html += '<li class="' + cls + '">';
        if (available) {
          var targetHref = here.indexOf("lessons/") === 0 || window.location.pathname.indexOf("/lessons/") !== -1
            ? (item.file.indexOf("lessons/") === 0 ? item.file.replace(/^lessons\//, "") : "../" + item.file)
            : item.file;
          html +=
            '<a href="' + targetHref + '"' +
            (isCurrent ? ' aria-current="page"' : "") + ">" + id + title + "</a>";
        } else {
          html += '<span aria-disabled="true">' + id + title + "</span>";
        }
        if (item.blurb) {
          html += '<span class="sb-blurb">' + escapeHtml(item.blurb) + "</span>";
        }
        if (item.architecture) {
          html += '<span class="sb-snapshot">' + escapeHtml(item.architecture) + " architecture</span>";
        }
        html += "</li>";
      });

      html += "</ul></div>";
    });

    nav.innerHTML = html;
    root.classList.add("has-sidebar");
  }

  /* ---- wiring ---------------------------------------------------------- */

  function wire() {
    var toggle = document.querySelector("[data-sidebar-toggle]");
    var close = document.querySelector("[data-sidebar-close]");
    var media = window.matchMedia(WIDE);

    if (toggle) {
      toggle.addEventListener("click", function () {
        if (isWide()) {
          isHidden() ? show() : hide();
        } else {
          root.classList.contains("sidebar-open") ? hide() : show();
        }
      });
    }

    // The close control lives inside the generated nav, so bind by delegation
    // rather than by reference.
    document.addEventListener("click", function (event) {
      if (event.target.closest && event.target.closest("[data-sidebar-close]")) {
        hide();
        var t = document.querySelector("[data-sidebar-toggle]");
        if (t) t.focus();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      if (isWide()) {
        if (!isHidden()) hide();
      } else if (root.classList.contains("sidebar-open")) {
        applyDrawer(false);
        syncControls();
      }
    });

    // Crossing the breakpoint must not leave contradictory state behind.
    var onChange = function () {
      if (isWide()) applyDrawer(false);
      syncControls();
    };
    if (media.addEventListener) media.addEventListener("change", onChange);
    else if (media.addListener) media.addListener(onChange);

    syncControls();
  }

  function init() {
    // Restore before building, so a reload never flashes the pane open first.
    if (stored() === "closed") applyHidden(true);
    build();
    wire();
  }

  // Apply the persisted state as early as possible, then finish on DOM ready.
  if (stored() === "closed") applyHidden(true);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
