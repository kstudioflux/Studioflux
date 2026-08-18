// Scene 1 — the hero "upgrades itself" as the visitor scrolls.
// Entirely scroll-scrubbed (no autoplay). Reduced-motion gets a static end-state.
(function () {
  var hero = document.getElementById("hero");
  if (!hero) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var heroPin = hero.querySelector(".hero-pin");
  var tierTick = hero.querySelector(".tier-tick");
  var tierNameTick = hero.querySelector(".tier-name-tick");

  var TIERS = [
    ["NIVEAU 0", "Skabelon"],
    ["CURRENT", "Rent og troværdigt"],
    ["SURGE", "En brandoplevelse"],
    ["FLUX", "Uforglemmelig"],
  ];

  if (reduceMotion || !window.gsap || !window.ScrollTrigger) {
    hero.classList.add("is-upgraded", "motion-static");
    if (tierTick) tierTick.textContent = TIERS[3][0];
    if (tierNameTick) tierNameTick.textContent = TIERS[3][1];
    return;
  }

  var currentTierIdx = -1;

  var tl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "+=140%",
      scrub: 0.6,
      pin: heroPin,
      pinType: "transform",
      anticipatePin: 1,
      onUpdate: function (self) {
        var idx = Math.min(3, Math.floor(self.progress * 4));
        if (idx !== currentTierIdx) {
          currentTierIdx = idx;
          if (tierTick) tierTick.textContent = TIERS[idx][0];
          if (tierNameTick) tierNameTick.textContent = TIERS[idx][1];
        }
        hero.classList.toggle("is-upgraded", self.progress >= 0.5);
      },
    },
  });

  tl.to(".hero-bg-plain", { opacity: 0, ease: "none" }, 0)
    .to(".hero-bg-cinematic", { opacity: 1, ease: "none" }, 0)
    .to(".hero-glow", { opacity: 1, ease: "none" }, 0.1)
    .to(".ghost-box", {
      opacity: 0,
      y: function (i) { return [-60, 50, -30][i]; },
      x: function (i) { return [40, -50, 60][i]; },
      rotation: function (i) { return [8, -6, 10][i]; },
      stagger: 0.05,
      ease: "none",
    }, 0)
    .to(".scroll-cue", { opacity: 0, y: 10, ease: "none" }, 0)
    .to(".hero-kicker", { opacity: 1, y: 0, ease: "none" }, 0.05)
    .to("#heroH1", { color: "#D1E4FA", ease: "none" }, 0)
    .to(".h1-line", { scale: 1.04, ease: "none" }, 0)
    .to(".h1-accent", { color: "#FFFFFF", ease: "none" }, 0.3)
    .to("#heroSub", { color: "#C7D3EA", ease: "none" }, 0)
    .to("#heroBtn", {
      backgroundColor: "#D1E4FA",
      color: "#05060F",
      borderRadius: "999px",
      ease: "none",
    }, 0.2)
    .to(".hero-tier-label", { opacity: 1, ease: "none" }, 0.05);
})();
