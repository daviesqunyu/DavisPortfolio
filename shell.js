(function () {
  var LIVE_SITES = {
    ndakaru: "https://ndakaru.co.ke",
    bridandesignbuild: "https://buildwithbridan.com",
    "d-v-technologies.xyz": "https://dvtechnologies.xyz"
  };
  window.repoLiveUrl = function (repo) {
    if (!repo) return "";
    var key = (repo.name || "").toLowerCase();
    if (LIVE_SITES[key]) return LIVE_SITES[key];
    var home = (repo.homepage || "").trim();
    if (home.indexOf("https://") !== 0 && home.indexOf("http://") !== 0) return "";
    if (/vercel\.app/i.test(home) && LIVE_SITES[key]) return LIVE_SITES[key];
    return home;
  };

  var path = location.pathname.replace(/\/index\.html$/, "/");
  if (path.length > 1 && !path.endsWith("/")) path += "/";
  var links = document.querySelectorAll(".top nav a, .foot a");
  for (var i = 0; i < links.length; i++) {
    if (links[i].getAttribute("href") === path) links[i].classList.add("on");
  }
  var button = document.querySelector(".menu");
  var nav = document.querySelector(".top nav");
  if (button && nav) {
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
      button.textContent = open ? "Close" : "Menu";
    });
  }
  var clock = document.getElementById("nbo-clock");
  function tick() {
    if (!clock) return;
    var time = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Nairobi",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    }).format(new Date());
    clock.textContent = "NBO " + time;
    clock.setAttribute("datetime", new Date().toISOString());
  }
  tick();
  window.setInterval(tick, 1000);
  var copies = document.querySelectorAll("[data-copy]");
  for (var c = 0; c < copies.length; c++) {
    copies[c].addEventListener("click", function () {
      var el = this;
      var value = el.getAttribute("data-copy");
      var done = function () {
        var previous = el.textContent;
        el.textContent = "Copied";
        window.setTimeout(function () { el.textContent = previous; }, 1400);
      };
      var fallback = function () {
        var area = document.createElement("textarea");
        area.value = value;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.left = "-999px";
        document.body.appendChild(area);
        area.select();
        try { document.execCommand("copy"); done(); } catch (err) {}
        area.remove();
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(done).catch(fallback);
      } else {
        fallback();
      }
    });
  }

  function previewShotUrl(url) {
    return "https://s.wordpress.com/mshots/v1/" + encodeURIComponent(url) + "?w=520";
  }

  window.attachSitePeek = function (root) {
    if (!root || root.getAttribute("data-peek-ready")) return;
    root.setAttribute("data-peek-ready", "1");
    var peek = document.createElement("div");
    peek.className = "peek";
    peek.hidden = true;
    var peekHost = document.createElement("p");
    var frameWrap = document.createElement("div");
    frameWrap.className = "peek-frame";
    var device = document.createElement("div");
    device.className = "peek-device";
    var shot = document.createElement("img");
    shot.className = "peek-shot";
    shot.alt = "";
    shot.decoding = "async";
    var openLink = document.createElement("a");
    openLink.className = "peek-open";
    openLink.target = "_blank";
    openLink.rel = "noopener";
    openLink.textContent = "Open site";
    device.appendChild(shot);
    frameWrap.appendChild(device);
    peek.appendChild(peekHost);
    peek.appendChild(frameWrap);
    peek.appendChild(openLink);
    document.body.appendChild(peek);
    var activeUrl = "";
    var loadToken = 0;
    function place(e) {
      var w = peek.offsetWidth || 320;
      var h = peek.offsetHeight || 380;
      var x = e.clientX + 20;
      var y = e.clientY + 20;
      if (x + w > window.innerWidth - 8) x = Math.max(8, e.clientX - w - 16);
      if (y + h > window.innerHeight - 8) y = Math.max(8, e.clientY - h - 16);
      peek.style.left = x + "px";
      peek.style.top = y + "px";
    }
    function show(url, e) {
      if (!url) {
        peek.hidden = true;
        return;
      }
      try { peekHost.textContent = new URL(url).host.replace(/^www\./, ""); } catch (err) { peekHost.textContent = url; }
      openLink.href = url;
      if (activeUrl !== url) {
        activeUrl = url;
        loadToken += 1;
        var token = loadToken;
        frameWrap.classList.remove("ready");
        shot.removeAttribute("src");
        shot.onload = function () {
          if (token === loadToken) frameWrap.classList.add("ready");
        };
        shot.onerror = function () {
          if (token === loadToken) frameWrap.classList.add("ready");
        };
        shot.src = previewShotUrl(url);
      }
      peek.hidden = false;
      place(e);
    }
    root.addEventListener("pointerover", function (e) {
      var row = e.target.closest("[data-preview]");
      if (!row || !root.contains(row)) return;
      show(row.getAttribute("data-preview"), e);
    });
    root.addEventListener("pointermove", function (e) {
      if (peek.hidden) return;
      var row = e.target.closest("[data-preview]");
      if (!row || !root.contains(row)) return;
      show(row.getAttribute("data-preview"), e);
    });
    root.addEventListener("pointerleave", function () {
      peek.hidden = true;
      activeUrl = "";
    });
  };

  var book = document.getElementById("book");
  if (!book) return;
  var hint = document.getElementById("hint");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var shots = book.querySelectorAll(".shot");
  var bar = document.getElementById("film-bar");
  var playBtn = document.getElementById("play");
  var playLabel = document.getElementById("play-label");
  var closeBtn = document.getElementById("book-close");
  var synopsis = document.getElementById("book-synopsis");
  var sceneNav = document.getElementById("scene-nav");
  var reel = document.getElementById("reel");
  var scene = 0;
  var timer = 0;
  var playing = false;
  var open = false;
  var dwell = reduce ? 8000 : 4200;

  function sceneTitle(n) {
    var title = shots[n] && shots[n].querySelector(".line strong");
    return title ? title.textContent : "Scene " + (n + 1);
  }

  function showSynopsis(on) {
    if (!synopsis) return;
    if (on) {
      synopsis.hidden = false;
      if (reel) reel.classList.add("is-synopsis");
    } else {
      synopsis.hidden = true;
      if (reel) reel.classList.remove("is-synopsis");
    }
  }

  function showScene(n, opts) {
    opts = opts || {};
    scene = n;
    for (var i = 0; i < shots.length; i++) shots[i].classList.toggle("is-on", i === n);
    if (bar) bar.style.width = ((n + 1) / shots.length * 100) + "%";
    if (sceneNav) {
      var tabs = sceneNav.querySelectorAll("button");
      for (var t = 0; t < tabs.length; t++) {
        tabs[t].classList.toggle("is-on", t === n);
        tabs[t].setAttribute("aria-selected", t === n ? "true" : "false");
      }
    }
    if (hint) hint.textContent = (playing ? "Playing · " : "") + sceneTitle(n) + " (" + (n + 1) + "/" + shots.length + ")";
    if (opts.fromUser && open) showSynopsis(false);
  }

  function setPlaying(on) {
    playing = on;
    if (playBtn) playBtn.classList.toggle("is-on", on);
    if (playLabel) playLabel.textContent = on ? "Pause" : "Play";
    if (playBtn) playBtn.setAttribute("aria-label", on ? "Pause the reel" : "Play the reel");
    showScene(scene);
  }

  function stopTimer() {
    window.clearInterval(timer);
    timer = 0;
  }

  function openBook() {
    if (open) return;
    open = true;
    book.classList.add("is-open");
    showSynopsis(true);
    showScene(0);
    if (playBtn) playBtn.disabled = false;
    if (closeBtn) closeBtn.hidden = false;
    if (hint) hint.textContent = "Synopsis · pick a scene or press Play";
  }

  function closeBook() {
    open = false;
    stopTimer();
    setPlaying(false);
    book.classList.remove("is-open");
    showSynopsis(false);
    if (playBtn) {
      playBtn.disabled = true;
    }
    if (closeBtn) closeBtn.hidden = true;
    if (hint) hint.textContent = "Open Tech Words";
  }

  function togglePlay() {
    if (!open) {
      openBook();
    }
    showSynopsis(false);
    if (playing) {
      stopTimer();
      setPlaying(false);
      if (hint) hint.textContent = "Paused · " + sceneTitle(scene);
      return;
    }
    setPlaying(true);
    stopTimer();
    timer = window.setInterval(function () {
      showScene((scene + 1) % shots.length);
    }, dwell);
  }

  var synopsisList = document.getElementById("synopsis-scenes");
  if (synopsisList && shots.length) {
    synopsisList.textContent = "";
    for (var si = 0; si < shots.length; si++) {
      var shotEl = shots[si];
      var li = document.createElement("li");
      var t = shotEl.getAttribute("data-scene-title") || sceneTitle(si);
      var blurb = shotEl.getAttribute("data-scene-blurb") || "";
      var strong = document.createElement("strong");
      strong.textContent = (si + 1) + ". " + t;
      li.appendChild(strong);
      if (blurb) {
        li.appendChild(document.createTextNode(" — " + blurb));
      }
      synopsisList.appendChild(li);
    }
  }

  if (sceneNav && shots.length) {
    sceneNav.textContent = "";
    for (var s = 0; s < shots.length; s++) {
      (function (idx) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.setAttribute("role", "tab");
        btn.textContent = String(idx + 1);
        btn.title = sceneTitle(idx);
        btn.addEventListener("click", function (ev) {
          ev.stopPropagation();
          if (!open) openBook();
          stopTimer();
          setPlaying(false);
          showScene(idx, { fromUser: true });
        });
        sceneNav.appendChild(btn);
      })(s);
    }
  }

  book.addEventListener("click", function (e) {
    if (e.target.closest(".scene-nav") || e.target.closest(".synopsis") || e.target.closest("button")) return;
    if (e.target.closest(".volume-cover") || !open) {
      if (!open) openBook();
      return;
    }
    if (!playing) {
      showSynopsis(false);
      showScene((scene + 1) % shots.length, { fromUser: true });
    }
  });

  book.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      if (e.target !== book) return;
      e.preventDefault();
      if (!open) openBook();
    }
  });

  if (playBtn) playBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    togglePlay();
  });

  if (closeBtn) closeBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    closeBook();
  });

  document.addEventListener("keydown", function (e) {
    if (!open) return;
    if (e.key === "Escape") {
      closeBook();
      return;
    }
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      stopTimer();
      setPlaying(false);
      showSynopsis(false);
      showScene((scene + 1) % shots.length, { fromUser: true });
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      stopTimer();
      setPlaying(false);
      showSynopsis(false);
      showScene((scene - 1 + shots.length) % shots.length, { fromUser: true });
    }
    if (e.key === " " && e.target === document.body) {
      e.preventDefault();
      togglePlay();
    }
  });
})();
