/* Session for WiamSports accounts. Never put Telegram here. */
window.WiamAuth = {
  key: "wiam_sess",
  api: function () {
    return window.WIAM_ENGINES_API || "";
  },
  session: function () {
    return localStorage.getItem(this.key) || "";
  },
  setSession: function (token) {
    if (token) localStorage.setItem(this.key, token);
  },
  clear: function () {
    localStorage.removeItem(this.key);
  },
  headers: function (extra) {
    var headers = { "Content-Type": "application/json" };
    var session = this.session();
    if (session) headers["X-Wiam-Session"] = session;
    if (extra) Object.assign(headers, extra);
    return headers;
  },
  safeNext: function (raw) {
    var v = String(raw || "").trim();
    if (!v || v.charAt(0) !== "/" || v.charAt(1) === "/" || v.indexOf("\\") !== -1) {
      return "/account/";
    }
    if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return "/account/";
    return v;
  },
  requireSession: function (opts) {
    if (this.session()) return true;
    var next = (opts && opts.next) || (location.pathname + location.search + location.hash) || "/account/";
    location.replace("/login/?next=" + encodeURIComponent(this.safeNext(next)));
    return false;
  },
  paintNav: function (activeOverride) {
    var signed = !!this.session();
    document.querySelectorAll("[data-nav]").forEach(function (nav) {
      var here = activeOverride || nav.getAttribute("data-nav") || "";
      var links = signed
        ? [
            ["/", "Home", "home"],
            ["/news/", "News", "news"],
            ["/engines/", "Product", "product"],
            ["/pricing/", "Pricing", "pricing"],
            ["/account/", "Dashboard", "account"],
            ["/legal/", "Legal", "legal"],
          ]
        : [
            ["/", "Home", "home"],
            ["/news/", "News", "news"],
            ["/engines/", "Product", "product"],
            ["/pricing/", "Pricing", "pricing"],
            ["/register/", "Register", "register"],
            ["/login/", "Sign in", "login"],
            ["/legal/", "Legal", "legal"],
          ];
      nav.innerHTML = links
        .map(function (row) {
          var on = here === row[2] || here === row[0];
          if (here === "docs" && row[2] === "account") on = true;
          return "<a" + (on ? ' class="active"' : "") + ' href="' + row[0] + '">' + row[1] + "</a>";
        })
        .join("");
    });
  },
};

(function () {
  function go() {
    if (window.WiamAuth) window.WiamAuth.paintNav();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", go);
  } else {
    go();
  }
})();
