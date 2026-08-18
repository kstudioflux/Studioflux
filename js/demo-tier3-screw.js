// MADSEN & SØN — Scene 2 (drill/screw) and Scene 3 (ring gallery).
//
// Scene 2 is a pinned sequence built on a pre-rendered video (generated via
// Higgsfield) instead of a live WebGL scene: hero handoff -> the video plays
// (restarting every time the visitor enters this zone, from either
// direction) -> fades out and releases straight into Scene 3. Drilling
// only — no reveal/unlock transition.
//
// Scene 3 is a 3D ring of photos that spins continuously (time-based, not
// scroll-tied) and is pinned for a beat so there's dedicated time to watch
// it and browse via hover.
//
// Scene 3's ScrollTrigger/pin is deliberately created *after* Scene 2's —
// creating it earlier (e.g. from demo-tier3.js, which runs before this
// file) made GSAP cache Scene 3's "top top" position against a layout that
// didn't yet include Scene 2's pin-spacer, cutting its pin window short by
// roughly Scene 2's own pin distance and leaving a dead scroll stretch.
(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = window.innerWidth < 768;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  var galleryHeading = document.querySelector(".kw-gallery-heading");

  function clamp01(v) { return Math.max(0, Math.min(1, v)); }
  function mapRange(v, a, b) { return clamp01((v - a) / (b - a)); }

  function setupScrewScene() {
    var section = document.getElementById("kw-screw-scene");
    var video = document.getElementById("kwScrewVideo");
    var pin = section ? section.querySelector(".kw-screw-pin") : null;
    var fallback = document.getElementById("kwScrewFallback");
    var quoteEl = section ? section.querySelector(".kw-screw-quote") : null;
    if (!section || !video || !pin) return;

    var quoteWords = quoteEl ? Array.prototype.slice.call(quoteEl.querySelectorAll(".kw-word")) : [];

    // If the video can't play (unsupported format, 404, blocked), fall back
    // to a static gradient panel with just the quote rather than a void.
    function degrade(reason) {
      if (reason) console.error("[kw-screw-scene] falling back to static section:", reason);
      section.style.minHeight = "";
      video.style.display = "none";
      if (fallback) fallback.style.display = "block";
      pin.style.position = "relative";
      pin.style.height = "auto";
      pin.style.minHeight = "70vh";
      pin.style.display = "flex";
      pin.style.alignItems = "center";
      pin.style.justifyContent = "center";
      if (quoteEl) {
        quoteEl.style.position = "static";
        quoteEl.style.transform = "none";
        quoteWords.forEach(function (w) { w.style.opacity = 1; w.style.transform = "none"; });
      }
      if (galleryHeading) { galleryHeading.style.opacity = 1; galleryHeading.style.transform = "none"; }
    }

    video.addEventListener("error", function () { degrade("video failed to load"); });
    // The <video src> starts fetching during HTML parsing, before this
    // script runs — if it already failed (e.g. 404) by the time we get
    // here, the "error" event fired too early for the listener above.
    if (video.error || video.networkState === video.NETWORK_NO_SOURCE) {
      degrade("video already in an error state on script init");
      return;
    }

    var zoneActive = false;

    function updateScene(p) {
      var handoffT = mapRange(p, 0, 0.15);

      // Restarts the video from the beginning every time the visitor
      // enters this zone, from either direction — scrolling down into it
      // from the hero, or back up into it from the gallery — instead of
      // only ever playing once per page load.
      var inZone = p > 0.05 && p < 0.95;
      if (inZone && !zoneActive) {
        zoneActive = true;
        video.currentTime = 0;
        video.play().catch(function () {});
      } else if (!inZone && zoneActive) {
        zoneActive = false;
        video.pause();
      }

      // Quote: word-by-word reveal, gone well before the section releases
      // into the gallery — this is drilling only now, no reveal/unlock.
      var quoteInT = mapRange(p, 0.28, 0.55);
      var quoteOutT = mapRange(p, 0.65, 0.85);
      for (var i = 0; i < quoteWords.length; i++) {
        var stagger = i * 0.055;
        var localIn = clamp01((quoteInT - stagger) / (1 - stagger || 1));
        var op = localIn * (1 - quoteOutT);
        quoteWords[i].style.opacity = op;
        quoteWords[i].style.transform = "translateY(" + (1 - localIn) * 14 + "px)";
      }

      var fadeOutT = mapRange(p, 0.88, 1.0);
      video.style.opacity = Math.min(handoffT, 1 - fadeOutT);
    }

    // ---------- reduced motion / no-GSAP fallback: one static frame ----------
    if (reduceMotion || !hasGsap) {
      section.style.minHeight = "";
      video.style.opacity = 1;
      video.addEventListener("loadedmetadata", function () {
        video.currentTime = video.duration * 0.75;
      });
      quoteWords.forEach(function (w) { w.style.opacity = 1; w.style.transform = "none"; });
      if (galleryHeading) { galleryHeading.style.opacity = 1; galleryHeading.style.transform = "none"; }
      return;
    }

    try {
      // Matches the synchronous placeholder min-height set inline in the
      // HTML (same formula, same window.innerHeight basis) so the real
      // pin-spacer takes over with zero jump.
      var pinDistancePx = (isMobile ? 0.9 : 1.5) * window.innerHeight;

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=" + pinDistancePx,
        scrub: 0.35,
        pin: pin,
        pinType: "transform",
        anticipatePin: 1,
        onUpdate: function (self) { updateScene(self.progress); },
      });

      // The real pin-spacer now reserves the scroll distance; drop the
      // synchronous placeholder so the two don't stack.
      section.style.minHeight = "";

      window.addEventListener("load", function () { ScrollTrigger.refresh(); });
      updateScene(0);
    } catch (err) {
      degrade(err);
    }
  }

  function setupRingGallery() {
    if (!hasGsap || reduceMotion) {
      if (galleryHeading) { galleryHeading.style.opacity = 1; galleryHeading.style.transform = "none"; }
      return;
    }

    try {
      gsap.to(".kw-gallery-heading", {
        opacity: 1,
        x: 0,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: { trigger: ".kw-gallery-scene", start: "top 98%" },
      });

      var ringGroup = document.getElementById("kwRingGroup");
      if (!ringGroup) return;

      var ringItems = gsap.utils.toArray(".kw-ring-item");
      var RING_COUNT = ringItems.length;
      var RING_STEP = 360 / RING_COUNT;
      var RING_RADIUS = "clamp(280px, 24vw, 420px)";
      var ROTATE_SPEED = 14; // degrees per second, continuous idle spin

      // Not pinned — the section scrolls past normally while the wheel
      // keeps spinning on its own (time-based, not scroll-tied), so the
      // page never freezes here.
      var rotation = -26; // already mid-turn the instant the section appears
      var hoveredIndex = -1;
      var scales = ringItems.map(function () { return 1; });
      var running = false;
      var lastT = null;

      function frame(now) {
        if (!running) return;
        if (lastT === null) lastT = now;
        var dt = Math.min((now - lastT) / 1000, 0.1);
        lastT = now;
        if (hoveredIndex === -1) rotation += ROTATE_SPEED * dt;

        ringItems.forEach(function (item, i) {
          var isHovered = i === hoveredIndex;
          var targetScale = isHovered ? 1.28 : 1;
          scales[i] += (targetScale - scales[i]) * Math.min(dt * 8, 1);

          var worldAngle = ((i * RING_STEP + rotation) % 360 + 360) % 360;
          var normalized = worldAngle > 180 ? 360 - worldAngle : worldAngle; // 0 front, 180 back
          var t = 1 - normalized / 180;

          item.style.transform =
            "translate(-50%, -50%) rotateY(" + worldAngle.toFixed(2) + "deg) translateZ(" + RING_RADIUS + ") scale(" + scales[i].toFixed(3) + ")";
          item.style.opacity = isHovered ? 1 : (0.32 + 0.68 * t).toFixed(3);
          item.style.filter = isHovered ? "brightness(1.18)" : "blur(" + (2.2 * (1 - t)).toFixed(2) + "px)";
          item.style.zIndex = isHovered ? 20 : Math.round(t * 10);
        });

        requestAnimationFrame(frame);
      }

      function start() {
        if (running) return;
        running = true;
        lastT = null;
        requestAnimationFrame(frame);
      }
      function stop() { running = false; }

      ringItems.forEach(function (item, i) {
        item.style.cursor = "pointer";
        item.addEventListener("mouseenter", function () { hoveredIndex = i; });
        item.addEventListener("mouseleave", function () { hoveredIndex = -1; });
      });

      // Only spin while the section is actually on screen.
      if (window.IntersectionObserver) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) start();
            else stop();
          });
        }, { threshold: 0.05 }).observe(document.querySelector(".kw-gallery-pin"));
      } else {
        start();
      }
    } catch (ringErr) {
      console.error("[kw-ring-gallery] setup failed:", ringErr);
      if (galleryHeading) { galleryHeading.style.opacity = 1; galleryHeading.style.transform = "none"; }
    }
  }

  setupScrewScene();
  setupRingGallery();
})();
