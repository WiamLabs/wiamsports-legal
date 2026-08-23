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
};
