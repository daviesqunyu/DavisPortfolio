(function () {
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
  var book = document.getElementById("book");
  if (!book) return;
  var hint = document.getElementById("hint");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var shots = book.querySelectorAll(".shot");
  var bar = document.getElementById("film-bar");
  var playBtn = document.getElementById("play");
  var playLabel = document.getElementById("play-label");
  var scene = 0;
  var timer = 0;
  var playing = false;
  function showScene(n) {
    scene = n;
    for (var i = 0; i < shots.length; i++) shots[i].classList.toggle("is-on", i === n);
    if (bar) bar.style.width = ((n + 1) / shots.length * 100) + "%";
  }
  function setPlaying(on) {
    playing = on;
    if (playBtn) playBtn.classList.toggle("is-on", on);
    if (playLabel) playLabel.textContent = on ? "Pause" : "Play";
    if (playBtn) playBtn.setAttribute("aria-label", on ? "Pause the book" : "Play the book");
  }
  function startFilm() {
    if (reduce) {
      var opened = book.classList.contains("is-open");
      book.classList.add("is-open");
      showScene(opened ? (scene + 1) % shots.length : 0);
      setPlaying(false);
      if (hint) hint.textContent = "Scene " + (scene + 1);
      return;
    }
    if (playing) {
      window.clearInterval(timer);
      setPlaying(false);
      if (hint) hint.textContent = "Paused";
      return;
    }
    book.classList.add("is-open");
    setPlaying(true);
    if (hint) hint.textContent = "Now showing";
    showScene(scene);
    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showScene((scene + 1) % shots.length);
    }, 3400);
  }
  book.addEventListener("click", startFilm);
  if (playBtn) playBtn.addEventListener("click", startFilm);
})();
