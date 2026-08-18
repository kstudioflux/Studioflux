// Pricing showcase: reveal-on-scroll (outer cards first, featured card
// settles in last), then all three cards share the same continuous ember
// border loop as the tier-page price-hero (css/editorial.css, js/editorial.js)
// — one continuous animation from the start, no ignite-then-settle handoff.
(function () {
  var section = document.querySelector(".pricing-showcase-section");
  if (!section) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cards = section.querySelectorAll(".pricing-card");
  var featuredWrap = section.querySelector(".pricing-card-featured-wrap");
  var featuredCard = featuredWrap ? featuredWrap.querySelector(".pricing-card") : null;

  if (reduceMotion) {
    cards.forEach(function (c) {
      c.classList.add("is-revealed", "is-looping", "is-in-view");
    });
    if (featuredWrap) featuredWrap.classList.add("is-looping");
    section.classList.add("is-in-view");
    return;
  }

  // One-shot reveal + ignition, the first time the section scrolls in.
  if (window.IntersectionObserver) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        cards.forEach(function (c) {
          if (c !== featuredCard) {
            c.classList.add("is-revealed", "is-looping");
          }
        });
        setTimeout(function () {
          if (featuredCard) featuredCard.classList.add("is-revealed", "is-looping");
          if (featuredWrap) featuredWrap.classList.add("is-looping");
        }, 320);
        revealObserver.unobserve(section);
      });
    }, { threshold: 0.2 });
    revealObserver.observe(section);

    // Continuous pause/resume while the section scrolls in and out of view
    // — toggled on the section (legacy pause hooks) and on each card
    // individually, since the shared bolt system checks its own host.
    var viewObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        section.classList.toggle("is-in-view", entry.isIntersecting);
        cards.forEach(function (c) {
          c.classList.toggle("is-in-view", entry.isIntersecting);
        });
      });
    }, { threshold: 0 });
    viewObserver.observe(section);
  } else {
    cards.forEach(function (c) {
      c.classList.add("is-revealed", "is-looping", "is-in-view");
    });
    if (featuredWrap) featuredWrap.classList.add("is-looping");
    section.classList.add("is-in-view");
  }
})();
