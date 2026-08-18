// Turns a demo page into an auto-playing miniature when embedded with ?preview=1
// (used inside the homepage device-frame iframes). Native scroll only — no Lenis,
// no user interaction (the parent iframe is pointer-events:none).
(function () {
  var params = new URLSearchParams(location.search);
  if (params.get("preview") !== "1") return;

  document.documentElement.classList.add("is-preview");
  window.__isPreview = true;

  var y = 0;
  var speed = 0.9;
  var pause = 0;

  function tick() {
    var max = document.body.scrollHeight - window.innerHeight;
    if (max > 0) {
      if (pause > 0) {
        pause--;
      } else {
        y += speed;
        if (y >= max) {
          pause = 90;
          y = 0;
        }
        window.scrollTo(0, y);
      }
    }
    requestAnimationFrame(tick);
  }

  window.addEventListener("load", function () {
    setTimeout(function () {
      requestAnimationFrame(tick);
    }, 400);
  });
})();
