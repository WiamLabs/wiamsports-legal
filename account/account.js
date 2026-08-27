/* Account shell — one WiamArena login, many pages. */
window.WiamAccount = (function () {
  var LINKS = [
    ["/account/", "Home", "home"],
    ["/account/profile/", "Profile", "profile"],
    ["/account/follows/", "Follows", "follows"],
    ["/account/saved/", "Saved", "saved"],
    ["/account/api/", "API", "api"],
    ["/account/channels/", "Channels", "channels"],
    ["/account/affiliate/", "Affiliate", "affiliate"],
    ["/account/settings/", "Settings", "settings"],
  ];

  function paintNav(active) {
    var nav = document.getElementById("acct-nav");
    if (!nav) return;
    nav.innerHTML = LINKS.map(function (row) {
      var on = active === row[2] || (location.pathname || "").replace(/\/+$/, "") === row[0].replace(/\/+$/, "");
      return "<a" + (on ? ' class="active"' : "") + ' href="' + row[0] + '">' + row[1] + "</a>";
    }).join("");
  }

  function load() {
    if (!window.WiamAuth || !WiamAuth.session()) {
      location.replace("/login/?next=" + encodeURIComponent(location.pathname + location.search));
      return Promise.reject(new Error("auth"));
    }
    return fetch(WiamAuth.api() + "/v1/account/me", { headers: WiamAuth.headers() }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          WiamAuth.clear();
          location.replace("/login/");
          throw new Error("auth");
        }
        return data;
      });
    });
  }

  function needVerified(data, sub) {
    if (data.email_verified) return true;
    if (sub) sub.textContent = "Confirm your email first. Open the link we sent, then come back here.";
    var nav = document.getElementById("acct-nav");
    if (nav) nav.hidden = true;
    var main = document.getElementById("acct-main");
    if (main) main.hidden = true;
    return false;
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value == null || value === "" ? "—" : String(value);
  }

  return { paintNav: paintNav, load: load, needVerified: needVerified, setText: setText };
})();
