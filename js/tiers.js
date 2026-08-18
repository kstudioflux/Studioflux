// Scenes 2–4: door reveals, trade strip drag-scroll, process reveal, proof count-up.
(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = window.gsap && window.ScrollTrigger;

  if (hasGsap && !reduceMotion) {
    gsap.utils.toArray(".door").forEach(function (door, i) {
      gsap.fromTo(
        door,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          delay: i * 0.08,
          scrollTrigger: { trigger: door, start: "top 88%" },
        }
      );
    });

    gsap.utils.toArray(".trade-card").forEach(function (card, i) {
      gsap.fromTo(
        card,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          delay: (i % 6) * 0.06,
          scrollTrigger: { trigger: card, start: "top 92%" },
        }
      );
    });

    gsap.utils.toArray(".process-list li").forEach(function (li, i) {
      gsap.fromTo(
        li,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          delay: i * 0.1,
          scrollTrigger: { trigger: li, start: "top 90%" },
        }
      );
    });

    gsap.utils.toArray(".proof-number").forEach(function (el) {
      var raw = el.textContent.trim();
      var num = parseFloat(raw.replace(",", ".").replace(/[^0-9.]/g, ""));
      if (isNaN(num)) return;
      var suffix = raw.replace(/^[0-9.,]+/, "");
      var obj = { val: 0 };
      gsap.to(obj, {
        val: num,
        duration: 1.4,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%" },
        onUpdate: function () {
          var precision = num % 1 !== 0 ? 1 : 0;
          el.textContent = obj.val.toFixed(precision).replace(".", ",") + suffix;
        },
      });
    });
  } else {
    document.querySelectorAll(".door, .trade-card, .process-list li").forEach(function (el) {
      el.style.opacity = 1;
      el.style.transform = "none";
    });
  }

  // Trade strip: click-drag horizontal scroll on desktop
  var strip = document.getElementById("tradeStrip");
  if (strip) {
    var isDown = false, startX, scrollLeft;
    strip.addEventListener("pointerdown", function (e) {
      isDown = true;
      strip.classList.add("dragging");
      startX = e.pageX - strip.offsetLeft;
      scrollLeft = strip.scrollLeft;
    });
    ["pointerup", "pointerleave"].forEach(function (evt) {
      strip.addEventListener(evt, function () {
        isDown = false;
        strip.classList.remove("dragging");
      });
    });
    strip.addEventListener("pointermove", function (e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - strip.offsetLeft;
      strip.scrollLeft = scrollLeft - (x - startX) * 1.2;
    });
  }
})();
