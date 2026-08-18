// Contact page: Cal.com inline booking widget.
// Official Cal.com embed bootstrap (https://cal.com/docs/embed) — kept as an
// external file rather than inline so it stays inside the site's
// script-src CSP (no 'unsafe-inline').
(function (C, A, L) {
  var p = function (a, ar) { a.q.push(ar); };
  var d = C.document;
  C.Cal = C.Cal || function () {
    var cal = C.Cal;
    var ar = arguments;
    if (!cal.loaded) {
      cal.ns = {};
      cal.q = cal.q || [];
      d.head.appendChild(d.createElement("script")).src = A;
      cal.loaded = true;
    }
    if (ar[0] === L) {
      var api = function () { p(api, arguments); };
      var namespace = ar[1];
      api.q = api.q || [];
      if (typeof namespace === "string") {
        cal.ns[namespace] = cal.ns[namespace] || api;
        p(cal.ns[namespace], ar);
        p(cal, ["initNamespace", namespace]);
      } else {
        p(cal, ar);
      }
      return;
    }
    p(cal, ar);
  };
})(window, "https://app.cal.com/embed/embed.js", "init");

Cal("init", "15min", { origin: "https://cal.com" });

Cal.ns["15min"]("inline", {
  elementOrSelector: "#cal-inline",
  calLink: "kenneth-hco7ei/15min",
  config: { layout: "month_view", theme: "dark" },
});

Cal.ns["15min"]("ui", {
  theme: "dark",
  cssVarsPerTheme: {
    light: { "cal-brand": "#D1E4FA" },
    dark: { "cal-brand": "#FFFFFF" },
  },
  hideEventTypeDetails: false,
  layout: "month_view",
});
