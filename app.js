/* Bloch Genesis-4 Developer Portal — vanilla JS, no external requests. */
(function () {
  "use strict";

  var root = document.documentElement;

  /* ---------- theme toggle (persisted; prefers-color-scheme fallback) ---------- */
  function storedTheme() {
    try { return localStorage.getItem("bloch-theme"); } catch (e) { return null; }
  }
  function storeTheme(t) {
    try {
      if (t) localStorage.setItem("bloch-theme", t);
      else localStorage.removeItem("bloch-theme");
    } catch (e) { /* storage unavailable — theme just won't persist */ }
  }
  function effectiveTheme() {
    var t = root.getAttribute("data-theme");
    if (t === "dark" || t === "light") return t;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  var themeBtn = document.getElementById("theme-toggle");
  function refreshThemeBtn() {
    if (!themeBtn) return;
    var next = effectiveTheme() === "dark" ? "light" : "dark";
    themeBtn.textContent = next === "dark" ? "Dark mode" : "Light mode";
    themeBtn.setAttribute("aria-label", "Switch to " + next + " mode");
  }
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = effectiveTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      storeTheme(next);
      refreshThemeBtn();
    });
    if (window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", refreshThemeBtn);
    }
    refreshThemeBtn();
  }

  /* ---------- copy buttons on every code block ---------- */
  function flash(btn, label, cls) {
    btn.textContent = label;
    if (cls) btn.classList.add(cls);
    setTimeout(function () {
      btn.textContent = "Copy";
      btn.classList.remove("done");
    }, 1600);
  }
  function copyText(text, btn) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { flash(btn, "Copied", "done"); },
        function () { legacyCopy(text, btn); }
      );
    } else {
      legacyCopy(text, btn);
    }
  }
  function legacyCopy(text, btn) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    flash(btn, ok ? "Copied" : "Select + copy", ok ? "done" : null);
  }
  Array.prototype.forEach.call(document.querySelectorAll("pre"), function (pre) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-btn";
    btn.textContent = "Copy";
    btn.setAttribute("aria-label", "Copy code block");
    btn.addEventListener("click", function () {
      var code = pre.querySelector("code");
      copyText((code || pre).innerText.replace(/\n$/, ""), btn);
    });
    pre.appendChild(btn);
  });

  /* ---------- anchor links on headings ---------- */
  Array.prototype.forEach.call(
    document.querySelectorAll("main h2[id], main h3[id], main .method h3"),
    function (h) {
      var wrap = h.closest(".method") || h.closest("section");
      var target = h.id || (wrap && wrap.id);
      if (!target) return;
      var a = document.createElement("a");
      a.className = "hanchor";
      a.href = "#" + target;
      a.textContent = "#";
      a.setAttribute("aria-label", "Permalink to this section");
      h.appendChild(a);
    }
  );

  /* ---------- mobile nav ---------- */
  var navToggle = document.getElementById("nav-toggle");
  var overlay = document.querySelector(".nav-overlay");
  function closeNav() { document.body.classList.remove("nav-open"); }
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
    });
  }
  if (overlay) overlay.addEventListener("click", closeNav);
  Array.prototype.forEach.call(document.querySelectorAll(".sidenav a"), function (a) {
    a.addEventListener("click", closeNav);
  });

  /* ---------- scrollspy ---------- */
  var navLinks = {};
  Array.prototype.forEach.call(document.querySelectorAll(".sidenav a[href^='#']"), function (a) {
    navLinks[a.getAttribute("href").slice(1)] = a;
  });
  var spied = Object.keys(navLinks)
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  var activeLink = null;
  function setActive(id) {
    var link = navLinks[id];
    if (!link || link === activeLink) return;
    if (activeLink) activeLink.classList.remove("active");
    link.classList.add("active");
    activeLink = link;
    /* keep the active item visible inside the nav */
    var nav = link.closest(".sidenav");
    if (nav) {
      var lt = link.offsetTop;
      if (lt < nav.scrollTop + 40 || lt > nav.scrollTop + nav.clientHeight - 60) {
        nav.scrollTop = lt - nav.clientHeight / 2;
      }
    }
  }
  function spy() {
    var probe = window.scrollY + 110;
    var current = spied.length ? spied[0].id : null;
    for (var i = 0; i < spied.length; i++) {
      if (spied[i].offsetTop <= probe) current = spied[i].id;
      else break;
    }
    if (current) setActive(current);
  }
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { spy(); ticking = false; });
  }, { passive: true });
  window.addEventListener("resize", spy);
  spy();
})();
