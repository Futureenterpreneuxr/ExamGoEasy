/* ===== ExamGoEasy landing page script (v2 premium) ===== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     SETTINGS
     Launch: 15 Feb 2027, 00:00 IST (= 14 Feb 2027, 18:30 UTC)
  ------------------------------------------------------------------ */
  var LAUNCH_UTC_MS = Date.UTC(2027, 1, 14, 18, 30, 0);
  var RESYNC_EVERY_MS = 2 * 60 * 1000;
  var RETRY_EVERY_MS = 10 * 1000;

  // Put a form link here (Formspree, Google Apps Script, your API) to collect real emails.
  var FORM_ENDPOINT = "";

  // Set a real number here later to show "X people are on the list". 0 = hidden.
  var WAITLIST_COUNT = 0;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover)").matches;

  /* ------------------------------------------------------------------
     COUNTDOWN WITH ITS OWN CLOCK
     Reads real UTC time from internet servers once, then counts using
     performance.now(), which ignores changes to the device date/time.
     Date.now() is never used for the countdown.
  ------------------------------------------------------------------ */
  var els = {
    d: document.getElementById("cd-days"),
    h: document.getElementById("cd-hours"),
    m: document.getElementById("cd-mins"),
    s: document.getElementById("cd-secs"),
    note: document.getElementById("cd-note")
  };
  var baseServerMs = null, basePerf = null;
  var lastShown = { d: "", h: "", m: "", s: "" };

  var sources = [
    { url: "https://worldtimeapi.org/api/timezone/Etc/UTC", parse: function (j) { return j.unixtime * 1000; } },
    { url: "https://timeapi.io/api/time/current/zone?timeZone=UTC", parse: function (j) { return Date.parse(String(j.dateTime).slice(0, 23) + "Z"); } },
    { url: "https://worldclockapi.com/api/json/utc/now", parse: function (j) { return j.currentFileTime / 10000 - 11644473600000; } }
  ];

  function fetchJson(url, ms) {
    var ctrl = new AbortController();
    var t = setTimeout(function () { ctrl.abort(); }, ms);
    return fetch(url, { cache: "no-store", signal: ctrl.signal })
      .then(function (r) { clearTimeout(t); if (!r.ok) throw new Error("bad status"); return r.json(); })
      .catch(function (e) { clearTimeout(t); throw e; });
  }

  function syncTime() {
    var i = 0;
    function next() {
      if (i >= sources.length) return Promise.reject(new Error("all sources failed"));
      var src = sources[i++];
      var t0 = performance.now();
      return fetchJson(src.url, 6000).then(function (json) {
        var t1 = performance.now();
        var serverMs = src.parse(json);
        if (!isFinite(serverMs) || serverMs < 1.7e12) throw new Error("bad time");
        baseServerMs = serverMs + (t1 - t0) / 2; // add half the network delay
        basePerf = t1;
      }).catch(next);
    }
    return next();
  }

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  function setBox(key, el, value) {
    if (lastShown[key] === value) return;
    el.textContent = value;
    lastShown[key] = value;
    if (!reduce) { el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick"); }
  }

  function render() {
    if (baseServerMs === null) return;
    var diff = LAUNCH_UTC_MS - (baseServerMs + (performance.now() - basePerf));
    if (diff <= 0) {
      setBox("d", els.d, "00"); setBox("h", els.h, "00"); setBox("m", els.m, "00"); setBox("s", els.s, "00");
      els.note.textContent = "We are live! Welcome to ExamGoEasy.";
      return;
    }
    var total = Math.floor(diff / 1000);
    var days = Math.floor(total / 86400);
    setBox("d", els.d, days < 10 ? pad(days) : String(days));
    setBox("h", els.h, pad(Math.floor((total % 86400) / 3600)));
    setBox("m", els.m, pad(Math.floor((total % 3600) / 60)));
    setBox("s", els.s, pad(total % 60));
  }

  function startCountdown() {
    function attempt() {
      syncTime().then(function () {
        els.note.textContent = "Launch: 15 February 2027, 12:00 AM IST. Synced with internet time.";
        els.note.classList.add("ok");
        render();
        setTimeout(attempt, RESYNC_EVERY_MS);
      }).catch(function () {
        if (baseServerMs === null) {
          els.note.classList.remove("ok");
          els.note.textContent = "Could not get internet time. Retrying...";
        }
        setTimeout(attempt, RETRY_EVERY_MS);
      });
    }
    attempt();
    setInterval(render, 250);
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) syncTime().then(render).catch(function () {});
    });
  }
  startCountdown();

  /* ------------------------------------------------------------------
     SCROLL: progress bar, nav background, product tilt (one rAF loop)
  ------------------------------------------------------------------ */
  var nav = document.getElementById("nav");
  var progress = document.getElementById("progress");
  var product = document.getElementById("product-card");
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || 0;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle("scrolled", y > 20);
    progress.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
    if (product && !reduce) {
      var rect = product.parentElement.getBoundingClientRect();
      // 0 when the preview is low on screen, 1 when it is near the middle
      var p = 1 - Math.max(0, Math.min(1, (rect.top - window.innerHeight * 0.25) / (window.innerHeight * 0.6)));
      product.style.setProperty("--p", p.toFixed(3));
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ------------------------------------------------------------------
     SCROLL REVEAL
  ------------------------------------------------------------------ */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) {
      // small stagger for siblings
      var idx = Array.prototype.indexOf.call(el.parentElement.children, el);
      if (!el.closest(".hero")) el.style.transitionDelay = Math.min(idx, 5) * 0.07 + "s";
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ------------------------------------------------------------------
     HOVER EFFECTS (desktop only): tile spotlight, magnetic buttons, cursor glow
  ------------------------------------------------------------------ */
  if (canHover && !reduce) {
    document.querySelectorAll(".tile").forEach(function (tile) {
      tile.addEventListener("pointermove", function (e) {
        var r = tile.getBoundingClientRect();
        tile.style.setProperty("--mx", (e.clientX - r.left) + "px");
        tile.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });

    document.querySelectorAll("[data-magnetic]").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - (r.left + r.width / 2)) * 0.18;
        var y = (e.clientY - (r.top + r.height / 2)) * 0.28;
        btn.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
      });
      btn.addEventListener("pointerleave", function () { btn.style.transform = ""; });
    });

    var glow = document.getElementById("glow");
    var gx = 0, gy = 0, gTick = false;
    window.addEventListener("pointermove", function (e) {
      gx = e.clientX; gy = e.clientY;
      if (!gTick) {
        gTick = true;
        requestAnimationFrame(function () {
          glow.style.transform = "translate3d(" + gx + "px," + gy + "px,0)";
          glow.classList.add("on");
          gTick = false;
        });
      }
    }, { passive: true });
    document.addEventListener("pointerleave", function () { glow.classList.remove("on"); });
  }

  /* ------------------------------------------------------------------
     DECORATIVE MOCK TIMER in the product preview (counts down, loops)
  ------------------------------------------------------------------ */
  var mock = document.getElementById("mock-timer");
  if (mock && !reduce) {
    var secs = 42 * 60 + 18;
    setInterval(function () {
      if (document.hidden) return;
      secs = secs > 0 ? secs - 1 : 45 * 60;
      mock.textContent = pad(Math.floor(secs / 60)) + ":" + pad(secs % 60);
    }, 1000);
  }

  /* ------------------------------------------------------------------
     EMAIL FORMS (hero + join section)
  ------------------------------------------------------------------ */
  document.querySelectorAll(".js-form").forEach(function (form) {
    var msg = form.parentElement.querySelector(".js-msg");
    var input = form.querySelector("input[type=email]");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = input.value.trim();
      msg.classList.remove("ok");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { msg.textContent = "Please enter a valid email address."; return; }

      function done() {
        msg.textContent = "You are on the list. We will email you at launch.";
        msg.classList.add("ok");
        form.reset();
      }
      if (FORM_ENDPOINT) {
        fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({ email: email, source: "examgoeasy-landing" })
        }).then(function (r) { if (!r.ok) throw new Error(); done(); })
          .catch(function () { msg.textContent = "Something went wrong. Please try again."; });
      } else {
        try {
          var list = JSON.parse(localStorage.getItem("ege_waitlist") || "[]");
          list.push({ email: email, at: new Date().toISOString() });
          localStorage.setItem("ege_waitlist", JSON.stringify(list));
        } catch (err) { /* storage blocked: ignore */ }
        done();
      }
    });
  });

  /* waitlist counter (hidden until WAITLIST_COUNT is set) */
  var countEl = document.getElementById("waitlist-count");
  if (countEl && WAITLIST_COUNT > 0) {
    countEl.textContent = WAITLIST_COUNT.toLocaleString("en-IN") + " people are already on the list.";
    countEl.hidden = false;
  }

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
