/* Puf website — language switching (TR / DE / EN), mobile menu and small helpers.
   All three languages are in the HTML; this only picks which one is visible. */
(function () {
  "use strict";

  // Paste the app's App Store link here once it is live; every "App Store" button uses it.
  var APP_STORE_URL = "https://apps.apple.com/app/puf";

  var LANGS = ["tr", "de", "en"];
  var STORAGE_KEY = "puf.lang";
  var root = document.documentElement;

  function pickLanguage() {
    var fromUrl = new URLSearchParams(location.search).get("lang");
    if (fromUrl && LANGS.indexOf(fromUrl) >= 0) return fromUrl;
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved && LANGS.indexOf(saved) >= 0) return saved;
    } catch (e) { /* storage blocked */ }
    var browser = (navigator.languages || [navigator.language || ""]);
    for (var i = 0; i < browser.length; i++) {
      var code = String(browser[i]).slice(0, 2).toLowerCase();
      if (LANGS.indexOf(code) >= 0) return code;
    }
    return "en";
  }

  function applyLanguage(lang, remember) {
    root.lang = lang;

    // Title and description per language: <html data-title-tr="…" data-desc-tr="…">
    var title = root.getAttribute("data-title-" + lang);
    if (title) document.title = title;
    var desc = root.getAttribute("data-desc-" + lang);
    var meta = document.querySelector('meta[name="description"]');
    if (desc && meta) meta.setAttribute("content", desc);

    document.querySelectorAll(".lang-switch button").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.setLang === lang));
    });

    // Keep the chosen language when moving between pages.
    document.querySelectorAll("a[data-keep-lang]").forEach(function (link) {
      var url = new URL(link.getAttribute("href"), location.href);
      url.searchParams.set("lang", lang);
      link.href = url.pathname.split("/").pop() + url.search + url.hash;
    });

    if (remember) {
      try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* storage blocked */ }
      var url = new URL(location.href);
      url.searchParams.set("lang", lang);
      history.replaceState(null, "", url.pathname + url.search + url.hash);
    }
  }

  applyLanguage(pickLanguage(), false);

  document.addEventListener("click", function (event) {
    var button = event.target.closest(".lang-switch button");
    if (button) applyLanguage(button.dataset.setLang, true);
  });

  // App Store buttons
  document.querySelectorAll("[data-app-store]").forEach(function (link) {
    link.href = APP_STORE_URL;
    link.rel = "noopener";
  });

  // Mobile menu
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Copy buttons (privacy contact)
  document.querySelectorAll("[data-copy]").forEach(function (button) {
    var label = button.textContent;
    button.addEventListener("click", function () {
      var target = document.getElementById(button.dataset.copy);
      if (!target) return;
      function done() {
        button.textContent = button.dataset.done || label;
        setTimeout(function () { button.textContent = label; }, 1600);
      }
      function select() {
        var range = document.createRange();
        range.selectNodeContents(target);
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
      try { navigator.clipboard.writeText(target.textContent.trim()).then(done, select); }
      catch (e) { select(); }
    });
  });

  // Footer year
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
