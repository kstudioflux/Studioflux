// Homepage — "Sådan foregår det" video timeline.
// Four short clips (generated via Higgsfield) play back to back in a loop,
// one per process step; the step label/copy already in the markup is
// toggled in sync with whichever clip is currently playing. The video
// plays forward on its own rather than being scrubbed — matching the
// pattern already proven reliable elsewhere on the site — and only runs
// while the section is actually on screen.
(function () {
  var video = document.getElementById("processVideo");
  if (!video) return;

  var CLIPS = [
    "img/process-1-snak.mp4",
    "img/process-2-design.mp4",
    "img/process-3-byg.mp4",
    "img/process-4-lancering.mp4",
  ];

  var steps = document.querySelectorAll(".process-step");
  var bars = document.querySelectorAll(".process-progress-bar");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setActive(idx) {
    steps.forEach(function (s, i) { s.classList.toggle("is-active", i === idx); });
    bars.forEach(function (b, i) {
      b.classList.toggle("is-active", i === idx);
      b.classList.toggle("is-done", i < idx);
      b.setAttribute("aria-selected", i === idx ? "true" : "false");
    });
  }

  function degrade(reason) {
    if (reason) console.error("[process-video] falling back to static text:", reason);
    video.style.display = "none";
    document.querySelectorAll(".process-step").forEach(function (s) { s.classList.add("is-active"); });
    var wrap = document.querySelector(".process-video-wrap");
    if (wrap) wrap.classList.add("is-static");
  }

  video.addEventListener("error", function () { degrade("clip failed to load"); });
  if (video.error || video.networkState === video.NETWORK_NO_SOURCE) {
    degrade("video already in an error state on script init");
    return;
  }

  if (reduceMotion) {
    setActive(0);
    video.src = CLIPS[0];
    video.load();
    return;
  }

  var current = 0;

  function playClip(i) {
    current = i;
    video.src = CLIPS[current];
    video.load();
    setActive(current);
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  }

  video.addEventListener("ended", function () {
    playClip((current + 1) % CLIPS.length);
  });

  var started = false;

  // Click a step directly to jump to it — the loop just continues from
  // there once that clip ends.
  bars.forEach(function (bar, i) {
    bar.addEventListener("click", function () {
      started = true;
      playClip(i);
    });
  });

  if (window.IntersectionObserver) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (!started) { started = true; playClip(0); }
          else video.play().catch(function () {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.3 }).observe(video);
  } else {
    playClip(0);
  }
})();
