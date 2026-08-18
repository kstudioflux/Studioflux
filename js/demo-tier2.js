// Studio Nord Hair — Tier 2 / Signature demo behaviour.
(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  if (!window.gsap || reduceMotion) {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.style.opacity = 1;
      el.style.transform = "none";
    });
  } else {
    gsap.utils.toArray(".reveal").forEach(function (el, i) {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        delay: (i % 4) * 0.08,
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });
  }

  // Before / after drag slider
  var slider = document.getElementById("baSlider");
  var before = document.getElementById("baBefore");
  var handle = document.getElementById("baHandle");
  if (slider && before && handle) {
    var setPos = function (pct) {
      pct = Math.max(0, Math.min(100, pct));
      before.style.clipPath = "inset(0 " + (100 - pct) + "% 0 0)";
      handle.style.left = pct + "%";
      handle.setAttribute("aria-valuenow", Math.round(pct));
    };

    var dragging = false;
    var updateFromX = function (clientX) {
      var rect = slider.getBoundingClientRect();
      var pct = ((clientX - rect.left) / rect.width) * 100;
      setPos(pct);
    };

    handle.addEventListener("pointerdown", function (e) {
      dragging = true;
      handle.setPointerCapture(e.pointerId);
    });
    slider.addEventListener("pointerdown", function (e) {
      dragging = true;
      updateFromX(e.clientX);
    });
    window.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      updateFromX(e.clientX);
    });
    window.addEventListener("pointerup", function () { dragging = false; });

    handle.addEventListener("keydown", function (e) {
      var current = parseFloat(handle.style.left) || 50;
      if (e.key === "ArrowLeft") { setPos(current - 5); e.preventDefault(); }
      if (e.key === "ArrowRight") { setPos(current + 5); e.preventDefault(); }
    });

    setPos(50);
  }

  // Booking form: demo only, no real submission
  var form = document.querySelector(".sn-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector("button");
      btn.textContent = "Anmodning sendt, vi bekræfter telefonisk";
      btn.disabled = true;
    });
  }
})();
