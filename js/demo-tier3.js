// KAFFE VÆRK — Tier 3 / Immersive demo choreography.
(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isPreview = !!window.__isPreview;

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  if (!isPreview && !reduceMotion && window.Lenis) {
    var lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on("scroll", function () {
      if (window.ScrollTrigger) ScrollTrigger.update();
    });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }

  // Split [data-kinetic] text into word spans for staggered reveal.
  document.querySelectorAll("[data-kinetic]").forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words
      .map(function (w) { return '<span class="kw-word">' + w + "</span>"; })
      .join(" ");
  });

  if (!window.gsap || !window.ScrollTrigger || reduceMotion) {
    document.querySelectorAll(".kw-word, .kw-tagline, .kw-badge, .kw-menu-list li, .kw-gallery-heading")
      .forEach(function (el) { el.style.opacity = 1; el.style.transform = "none"; });
    document.querySelectorAll("[data-l]").forEach(function (el) { el.style.transform = "none"; el.style.opacity = 1; });
    return;
  }

  // ---------- Scene 1: logotype assembly ----------
  var letters = gsap.utils.toArray("[data-l]");
  var scatter = [
    [-160, -70, -34], [130, -120, 26], [-90, 110, -22], [150, 90, 28], [-120, -50, 16], [100, 130, -20],
  ];
  letters.forEach(function (l, i) {
    var s = scatter[i % scatter.length];
    gsap.set(l, { x: s[0], y: s[1], rotation: s[2], scale: 1.6, opacity: 0.35, filter: "blur(3px)" });
  });
  gsap.set(".kw-hero-video", { opacity: 0.22 });

  var heroTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".kw-hero",
      start: "top top",
      end: "+=130%",
      scrub: 0.6,
      pin: ".kw-hero-pin",
      pinType: "transform",
      anticipatePin: 1,
    },
  });

  heroTl
    .to(letters, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, filter: "blur(0px)", stagger: 0.045, ease: "none" }, 0)
    .to(".kw-hero-video", { opacity: 0.55, scale: 1.08, ease: "none" }, 0)
    .to(".kw-layer-back", { y: -60, scale: 1.3, ease: "none" }, 0)
    .to(".kw-badge", { opacity: 1, y: 0, ease: "none" }, 0.42)
    .to(".kw-tagline", { opacity: 1, y: 0, ease: "none" }, 0.55)
    .to(".kw-scroll-cue", { opacity: 0, ease: "none" }, 0.05)
    // Handoff into the screw scene: the hero settles into a darker, tighter
    // frame right before it releases, so the Three.js scene fades up into a
    // matching dark tone instead of cutting to black.
    .to(".kw-hero-video", { opacity: 0.16, scale: 1.22, ease: "none" }, 0.86)
    .to(".kw-logotype, .kw-tagline, .kw-badge", { y: -60, opacity: 0, ease: "none" }, 0.86);

  // Scene 3 (ring gallery) is set up in demo-tier3-screw.js, *after* the
  // screw scene's own ScrollTrigger/pin-spacer is created — it has to run
  // in that order, because creating it here (before the screw scene's
  // pin-spacer exists) made GSAP cache the wrong "top top" scroll position
  // for it, cutting the gallery's pin window short by roughly the screw
  // scene's own pin distance.

  // ---------- Scene 4: menu ----------
  gsap.utils.toArray(".kw-menu-list li").forEach(function (li, i) {
    gsap.to(li, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      delay: i * 0.05,
      ease: "power3.out",
      scrollTrigger: { trigger: li, start: "top 90%" },
    });
  });

  // ---------- Scene 5: visit ----------
  gsap.to(".kw-visit .kw-word", {
    opacity: 1,
    y: 0,
    stagger: 0.04,
    ease: "none",
    scrollTrigger: { trigger: ".kw-visit", start: "top 75%", end: "top 30%", scrub: true },
  });

  gsap.from(".kw-visit-grid > div", {
    opacity: 0,
    y: 24,
    stagger: 0.1,
    duration: 0.7,
    ease: "power3.out",
    scrollTrigger: { trigger: ".kw-visit-grid", start: "top 88%" },
  });

  gsap.from(".kw-map", {
    opacity: 0,
    y: 30,
    duration: 0.8,
    ease: "power3.out",
    scrollTrigger: { trigger: ".kw-map", start: "top 90%" },
  });
})();
