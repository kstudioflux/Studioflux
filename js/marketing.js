// Marketing page: path toggle, phone feed reveal, count-up stats, drag compare.
(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Path gate: only the chosen path's section is shown ----------
  var toggle = document.getElementById("pathToggle");
  var pathSections = [document.getElementById("path-social"), document.getElementById("path-motion")];
  var pathTriggers = document.querySelectorAll(".path-panel, .path-toggle-btn");

  // Hide both paths at runtime (not in the stylesheet), so the content still
  // shows if JS fails to load.
  pathSections.forEach(function (section) {
    if (section) section.classList.add("is-hidden");
  });

  var showPath = function (id) {
    pathSections.forEach(function (section) {
      if (section) section.classList.toggle("is-hidden", section.id !== id);
    });
    pathTriggers.forEach(function (btn) {
      var isActive = btn.getAttribute("data-target") === id;
      btn.classList.toggle("is-active", isActive);
      if (btn.classList.contains("path-toggle-btn")) {
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
      }
    });
    if (toggle) toggle.classList.add("is-visible");
  };

  pathTriggers.forEach(function (btn) {
    btn.addEventListener("click", function (evt) {
      evt.preventDefault();
      var id = btn.getAttribute("data-target");
      showPath(id);
      var target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      }
    });
  });

  // ---------- Phone feed reveal ----------
  var phoneFeed = document.getElementById("phoneFeed");
  if (phoneFeed && window.IntersectionObserver) {
    var feedObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            phoneFeed.classList.add("is-visible");
            feedObserver.unobserve(phoneFeed);
          }
        });
      },
      { threshold: 0.4 }
    );
    feedObserver.observe(phoneFeed);
  } else if (phoneFeed) {
    phoneFeed.classList.add("is-visible");
  }

  // Stat count-up moved to js/editorial.js (.stat-stack component) — only
  // the first stat counts up now, the rest just fade in on stagger.

  // ---------- Motion pairs: <video autoplay> ignores prefers-reduced-motion,
  // so stop the clips ourselves when the user has asked for less motion. ----------
  if (reduceMotion) {
    document.querySelectorAll(".motion-pair-media video").forEach(function (v) {
      v.pause();
      v.removeAttribute("autoplay");
    });
  }
})();
