// Compare page — drag/tap slider that wipes between three tier renderings
// of the same fictional business (Kaffe Værk). Always settles cleanly into
// one of the three tier states — dragging never leaves it stuck mid-blend.
(function () {
  var stage = document.getElementById("compareStage");
  var handle = document.getElementById("compareHandle");
  var t2 = document.querySelector(".cl-t2");
  var t3 = document.querySelector(".cl-t3");
  var tabs = document.querySelectorAll(".compare-tab");
  var caption = document.getElementById("compareCaption");
  var priceNum = document.getElementById("comparePriceNum");
  var priceHero = document.getElementById("comparePriceHero");
  if (!stage || !handle) return;

  var STOPS = [0, 50, 100];
  var CAPTIONS = [
    "Current: rent, hurtigt, troværdigt.",
    "Surge: et brand folk lægger mærke til.",
    "Flux: en hjemmeside folk husker.",
  ];
  var PRICES = [3000, 6000, 10000];

  function apply(pos) {
    pos = Math.max(0, Math.min(100, pos));
    handle.style.left = pos + "%";
    handle.setAttribute("aria-valuenow", Math.round(pos));

    var t2Reveal = Math.min(100, (pos / 50) * 100);
    var t3Reveal = pos <= 50 ? 0 : ((pos - 50) / 50) * 100;

    t2.style.clipPath = "inset(0 " + (100 - t2Reveal) + "% 0 0)";
    t3.style.clipPath = "inset(0 " + (100 - t3Reveal) + "% 0 0)";

    var nearest = pos < 25 ? 0 : pos < 75 ? 1 : 2;
    caption.textContent = CAPTIONS[nearest];
    if (priceNum) priceNum.textContent = PRICES[nearest].toLocaleString("da-DK");
    if (priceHero) priceHero.setAttribute("data-level", nearest + 1);
    tabs.forEach(function (tab, i) {
      tab.setAttribute("aria-selected", i === nearest ? "true" : "false");
    });
    return nearest;
  }

  var snapTimeout = null;
  function snapTo(pos) {
    stage.classList.add("snapping");
    apply(pos);
    if (snapTimeout) clearTimeout(snapTimeout);
    snapTimeout = setTimeout(function () {
      stage.classList.remove("snapping");
    }, 520);
  }

  function snapToNearest() {
    var current = parseFloat(handle.style.left) || 0;
    var nearestStop = STOPS.reduce(function (a, b) {
      return Math.abs(b - current) < Math.abs(a - current) ? b : a;
    });
    snapTo(nearestStop);
  }

  function updateFromX(clientX) {
    var rect = stage.getBoundingClientRect();
    var pct = ((clientX - rect.left) / rect.width) * 100;
    apply(pct);
  }

  var dragging = false;
  handle.addEventListener("pointerdown", function (e) {
    stage.classList.remove("snapping");
    dragging = true;
    handle.setPointerCapture(e.pointerId);
  });
  stage.addEventListener("pointerdown", function (e) {
    stage.classList.remove("snapping");
    dragging = true;
    updateFromX(e.clientX);
  });
  window.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    updateFromX(e.clientX);
  });
  window.addEventListener("pointerup", function () {
    if (!dragging) return;
    dragging = false;
    snapToNearest();
  });

  handle.addEventListener("keydown", function (e) {
    var current = parseFloat(handle.style.left) || 0;
    if (e.key === "ArrowLeft") { snapTo(Math.max(0, current - 50)); e.preventDefault(); }
    if (e.key === "ArrowRight") { snapTo(Math.min(100, current + 50)); e.preventDefault(); }
    if (e.key === "Home") { snapTo(0); e.preventDefault(); }
    if (e.key === "End") { snapTo(100); e.preventDefault(); }
  });

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      snapTo(parseFloat(tab.dataset.pos));
    });
  });

  apply(0);
})();
