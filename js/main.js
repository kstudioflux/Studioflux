// Shared: nav toggle, Lenis smooth scroll (sales site only), GSAP registration.
(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Smooth scroll — sales site only, never on the Tier 1 demo.
  if (!reduceMotion && window.Lenis) {
    var lenis = new Lenis({
      duration: 1.1,
      easing: function (t) { return 1 - Math.pow(1 - t, 3); },
      smoothWheel: true,
    });
    lenis.on("scroll", function () {
      if (window.ScrollTrigger) ScrollTrigger.update();
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    window.__lenis = lenis;
  }

  // Mobile nav toggle
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Nav: transparent over the hero, gains a blurred surface + hairline once scrolled
  var siteNav = document.querySelector(".site-nav");
  if (siteNav) {
    var onNavScroll = function () {
      siteNav.classList.toggle("is-scrolled", window.scrollY > 40);
    };
    onNavScroll();
    window.addEventListener("scroll", onNavScroll, { passive: true });
  }

  // Section numerals: small margin numbers (01, 02, 03...) prefixed onto the
  // eyebrow of every major content section, tying the page together like a
  // table of contents. Sections without an eyebrow (hero, closing CTA) are
  // skipped rather than numbered.
  var numberedSections = document.querySelectorAll("main .section");
  var sectionCount = 1;
  numberedSections.forEach(function (sec) {
    var eyebrow = sec.querySelector(".eyebrow");
    if (!eyebrow) return;
    var numeral = document.createElement("span");
    numeral.className = "section-numeral";
    numeral.textContent = String(sectionCount).padStart(2, "0");
    eyebrow.insertBefore(numeral, eyebrow.firstChild);
    sectionCount++;
  });

  // Mark active nav link
  var here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach(function (a) {
    if (a.getAttribute("href").endsWith(here)) a.classList.add("active");
  });

  // Liquid glass materialize: blur+scale settle instead of a plain fade,
  // the first time each glass surface scrolls into view.
  var glassEls = document.querySelectorAll(".btn-primary, .path-panel, .cal-frame");
  if (glassEls.length && window.IntersectionObserver) {
    if (reduceMotion) {
      glassEls.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      var glassObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            glassObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      glassEls.forEach(function (el) { glassObserver.observe(el); });
    }
  }

  // Instagram badge: spin fast 5 times, once, the first time it scrolls
  // into view — then it sits still.
  var igBadge = document.querySelector(".ig-badge");
  if (igBadge && !reduceMotion && window.IntersectionObserver) {
    var spun = false;
    var igObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !spun) {
          spun = true;
          igBadge.classList.add("is-spinning");
          igObserver.unobserve(igBadge);
        }
      });
    }, { threshold: 0.5 });
    igObserver.observe(igBadge);
  }
})();
