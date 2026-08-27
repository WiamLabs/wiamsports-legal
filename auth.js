/* Session for WiamArena accounts. Never put Telegram here. */
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
      var links = [
        ["/", "News", "news"],
        ["/product/", "Product", "product"],
        ["/pricing/", "Pricing", "pricing"],
      ];
      if (signed) links.push(["/account/", "Account", "account"]);
      else {
        links.push(["/register/", "Register", "register"]);
        links.push(["/login/", "Sign in", "login"]);
      }
      var path = (location.pathname || "/").replace(/\/+$/, "") || "/";
      nav.innerHTML = links
        .map(function (row) {
          var on = here === row[2] || here === row[0];
          if (here === "docs" && row[2] === "account") on = true;
          if (row[2] === "product" && (path === "/engines" || here === "engines")) on = true;
          if (
            row[2] === "news" &&
            (path === "/" ||
              path.indexOf("/news") === 0 ||
              path.indexOf("/scores") === 0 ||
              path.indexOf("/table") === 0 ||
              path.indexOf("/odds") === 0 ||
              path.indexOf("/follow") === 0 ||
              path.indexOf("/search") === 0)
          ) {
            on = true;
          }
          if (row[2] === "account" && path.indexOf("/account") === 0) on = true;
          return "<a" + (on ? ' class="active"' : "") + ' href="' + row[0] + '">' + row[1] + "</a>";
        })
        .join("");
      nav.classList.remove("open");
      var head = nav.closest(".site-head, .news-top-inner, header") || nav.parentElement;
      if (!head) return;
      var btn = head.querySelector(".nav-toggle");
      if (!btn) {
        btn = document.createElement("button");
        btn.className = "nav-toggle";
        btn.type = "button";
        btn.setAttribute("aria-label", "Menu");
        btn.innerHTML = "<span></span><span></span><span></span>";
        nav.parentNode.insertBefore(btn, nav);
        btn.addEventListener("click", function () {
          var open = !nav.classList.contains("open");
          nav.classList.toggle("open", open);
          btn.classList.toggle("open", open);
          btn.setAttribute("aria-expanded", open ? "true" : "false");
        });
      }
    });
  },
};

(function () {
  function ensureIcons() {
    if (document.querySelector('link[rel="icon"][sizes="48x48"]')) return;
    var tags = [
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", href: "/favicon-48.png", type: "image/png", sizes: "48x48" },
      { rel: "icon", href: "/favicon-96.png", type: "image/png", sizes: "96x96" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ];
    tags.forEach(function (row) {
      var el = document.createElement("link");
      Object.keys(row).forEach(function (k) {
        el.setAttribute(k, row[k]);
      });
      document.head.appendChild(el);
    });
  }
  function go() {
    ensureIcons();
    if (window.WiamAuth) window.WiamAuth.paintNav();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", go);
  } else {
    go();
  }
})();
