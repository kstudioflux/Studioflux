// Editorial components: staggered reveal for .stat-block / .feature-list li,
// count-up on the first stat only, closing-cta as a single clickable block.
(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Staggered reveal for stat blocks and index-list rows ----------
  var staggerGroups = document.querySelectorAll(".stat-stack, .feature-list, .bento-grid");
  if (staggerGroups.length && window.IntersectionObserver) {
    staggerGroups.forEach(function (group) {
      var items = group.querySelectorAll(".stat-block, li, .bento-card");
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var index = Array.prototype.indexOf.call(items, entry.target);
              entry.target.style.transitionDelay = reduceMotion ? "0s" : Math.min(index, 6) * 0.12 + "s";
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
      );
      items.forEach(function (item) {
        observer.observe(item);
      });
    });
  } else {
    staggerGroups.forEach(function (group) {
      group.querySelectorAll(".stat-block, li, .bento-card").forEach(function (item) {
        item.classList.add("is-visible");
      });
    });
  }

  // ---------- Price hero: reveal + count-up + ember border ----------
  // The border activates the moment the price scrolls into view (or on load,
  // if it's already in view) — no interaction required. A separate observer
  // keeps it paused whenever the element is off screen, hover/hookless: one
  // continuous linear loop, no fast-then-slow handoff, so there's no visible
  // seam or stutter at the start.
  var priceHeroes = document.querySelectorAll(".price-hero");
  if (priceHeroes.length) {
    priceHeroes.forEach(function (el) {
      var ring = el.querySelector(".price-hero-ring");
      var numEl = el.querySelector(".price-hero-num[data-count-to]");

      var activate = function () {
        el.classList.add("is-visible");
        if (ring) el.classList.add("is-looping");
        if (numEl) {
          var target = parseInt(numEl.getAttribute("data-count-to"), 10);
          if (!reduceMotion && window.gsap) {
            var obj = { val: 0 };
            gsap.to(obj, {
              val: target,
              duration: 1.5,
              ease: "power2.out",
              delay: 0.15,
              onUpdate: function () {
                numEl.textContent = Math.round(obj.val).toLocaleString("da-DK");
              },
            });
          } else {
            numEl.textContent = target.toLocaleString("da-DK");
          }
        }
      };

      if (window.IntersectionObserver) {
        var revealObserver = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                activate();
                revealObserver.unobserve(el);
              }
            });
          },
          { threshold: 0.3 }
        );
        revealObserver.observe(el);

        if (ring) {
          var visObserver = new IntersectionObserver(
            function (entries) {
              entries.forEach(function (entry) {
                el.classList.toggle("is-in-view", entry.isIntersecting);
              });
            },
            { threshold: 0 }
          );
          visObserver.observe(el);
        }
      } else {
        activate();
      }
    });
  }

  // ---------- Price hero: jagged lightning-bolt overlay ----------
  // Procedural, not hand-drawn: a rounded-rect perimeter is subdivided into
  // points, each point gets randomized radial jitter (occasionally a big
  // spike), and a couple of forked branches jut out from random points along
  // it. Redrawn on an interval rather than every frame — real lightning
  // flickers in discrete jumps, it doesn't glide.
  var boltHosts = document.querySelectorAll(".price-hero-bolt");
  if (boltHosts.length && !reduceMotion) {
    boltHosts.forEach(function (svg) {
      // [data-level] is the shared "tier-colored container" contract —
      // matches both .price-hero (tier pages) and .pricing-card (homepage).
      var heroEl = svg.closest("[data-level]");
      var NS = "http://www.w3.org/2000/svg";

      function makePath(cls) {
        var p = document.createElementNS(NS, "path");
        p.setAttribute("class", cls);
        svg.appendChild(p);
        return p;
      }
      var glowA = makePath("bolt-glow-a");
      var hotA = makePath("bolt-hot-a");
      var glowB = makePath("bolt-glow-b");
      var hotB = makePath("bolt-hot-b");
      var spikeEls = [];
      for (var i = 0; i < 8; i++) spikeEls.push(makePath("bolt-spike"));

      var w = 0, h = 0;
      function measure() {
        var r = svg.getBoundingClientRect();
        if (r.width && r.height) {
          w = r.width;
          h = r.height;
          svg.setAttribute("viewBox", "0 0 " + w + " " + h);
        }
      }
      measure();
      if (window.ResizeObserver) {
        new ResizeObserver(measure).observe(svg);
      } else {
        window.addEventListener("resize", measure);
      }

      function baseVertices() {
        var c = Math.min(40, w * 0.06, h * 0.1);
        var corners = [
          [c, 0], [w - c, 0],
          [w, c], [w, h - c],
          [w - c, h], [c, h],
          [0, h - c], [0, c],
        ];
        var pts = [];
        var SUB = 5;
        for (var ci = 0; ci < corners.length; ci++) {
          var a = corners[ci];
          var b = corners[(ci + 1) % corners.length];
          for (var s = 0; s < SUB; s++) {
            var t = s / SUB;
            pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
          }
        }
        return pts;
      }

      function jitterPath(pts, jitterAmt, spikeChance) {
        var out = pts.map(function (p) {
          var amt = Math.random() < spikeChance ? jitterAmt * 4.5 : jitterAmt;
          var ang = Math.random() * Math.PI * 2;
          return [p[0] + Math.cos(ang) * amt * Math.random(), p[1] + Math.sin(ang) * amt * Math.random()];
        });
        var d = "M " + out[0][0].toFixed(1) + " " + out[0][1].toFixed(1);
        for (var i2 = 1; i2 < out.length; i2++) {
          d += " L " + out[i2][0].toFixed(1) + " " + out[i2][1].toFixed(1);
        }
        return d + " Z";
      }

      function drawSpikes(pts) {
        var cx = w / 2, cy = h / 2;
        spikeEls.forEach(function (spike) {
          if (Math.random() < 0.35) {
            spike.classList.remove("is-lit");
            return;
          }
          var p = pts[Math.floor(Math.random() * pts.length)];
          var outAng = Math.atan2(p[1] - cy, p[0] - cx);
          var len1 = 12 + Math.random() * 22;
          var midX = p[0] + Math.cos(outAng + (Math.random() - 0.5) * 0.9) * len1;
          var midY = p[1] + Math.sin(outAng + (Math.random() - 0.5) * 0.9) * len1;
          var len2 = 8 + Math.random() * 18;
          var endX = midX + Math.cos(outAng + (Math.random() - 0.5) * 1.1) * len2;
          var endY = midY + Math.sin(outAng + (Math.random() - 0.5) * 1.1) * len2;
          spike.setAttribute(
            "d",
            "M " + p[0].toFixed(1) + " " + p[1].toFixed(1) +
              " L " + midX.toFixed(1) + " " + midY.toFixed(1) +
              " L " + endX.toFixed(1) + " " + endY.toFixed(1)
          );
          spike.classList.add("is-lit");
        });
      }

      function redraw() {
        if (!w || !heroEl.classList.contains("is-in-view")) return;
        var pts = baseVertices();
        var dA = jitterPath(pts, 6, 0.1);
        var dB = jitterPath(pts, 4.5, 0.08);
        glowA.setAttribute("d", dA);
        hotA.setAttribute("d", dA);
        glowB.setAttribute("d", dB);
        hotB.setAttribute("d", dB);
        drawSpikes(pts);
      }

      redraw();
      setInterval(redraw, 200);
    });
  }

  // ---------- Count-up on the first stat in each .stat-stack only ----------
  var firstStats = document.querySelectorAll(".stat-stack .stat-block:first-child .stat-number[data-count-to]");
  if (firstStats.length && window.IntersectionObserver) {
    var animateCount = function (el) {
      var target = parseFloat(el.getAttribute("data-count-to"));
      var prefix = el.getAttribute("data-prefix") || "";
      var suffix = el.getAttribute("data-suffix") || "";
      var decimals = el.getAttribute("data-decimals") ? parseInt(el.getAttribute("data-decimals"), 10) : 0;

      if (reduceMotion || !window.gsap) {
        el.textContent = prefix + target.toFixed(decimals).replace(".", ",") + suffix;
        return;
      }

      var obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 1.6,
        ease: "power2.out",
        delay: 0.2,
        onUpdate: function () {
          el.textContent = prefix + obj.val.toFixed(decimals).replace(".", ",") + suffix;
        },
      });
    };

    var statObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            statObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    firstStats.forEach(function (el) {
      statObserver.observe(el);
    });
  }
})();
