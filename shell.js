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
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(done);
      }
    });
  }
  var book = document.getElementById("book");
  if (!book) return;
  var hint = document.getElementById("hint");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var gone = false;
  function enter() {
    if (gone) return;
    gone = true;
    location.href = "/contents/";
  }
  book.addEventListener("click", function () {
    if (reduce) { enter(); return; }
    if (book.classList.contains("is-open")) return;
    book.classList.add("is-open");
    if (hint) hint.textContent = "Turning the cover";
    book.addEventListener("transitionend", function (event) {
      if (event.propertyName === "transform") enter();
    });
    window.setTimeout(enter, 1300);
  });
})();
