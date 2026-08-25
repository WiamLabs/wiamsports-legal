/* Football Scores / Table / Odds from stored matches. No invented boards. */
window.WiamBoard = (function () {
  function api() {
    return window.WIAM_ENGINES_API || "";
  }

  function esc(s) {
    return String(s || "").replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function parts() {
    return (location.pathname || "/").replace(/\/+$/, "").split("/").filter(Boolean);
  }

  function kind() {
    var p = parts();
    if (p[0] === "table") return "table";
    if (p[0] === "odds") return "odds";
    if (p[0] === "follow") return "follow";
    return "scores";
  }

  function slug() {
    var p = parts();
    return p[1] || "";
  }

  function kick(iso) {
    var t = Date.parse(iso || "");
    if (!t) return "";
    try {
      return new Date(t).toLocaleString("en-GB", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Africa/Accra",
      });
    } catch (e) {
      return iso;
    }
  }

  function crest(url, name) {
    if (!url) return '<span class="crest-fallback">' + esc((name || "?").slice(0, 1)) + "</span>";
    return '<img class="crest" src="' + esc(url) + '" alt="">';
  }

  function getJson(path) {
    return fetch(api() + path).then(function (r) {
      return r.json();
    });
  }

  function paintPicker(root, prefix, title, copy) {
    getJson("/v1/public/catalog").then(function (data) {
      var html = "<h1>" + esc(title) + "</h1>";
      html += '<p class="dek">' + esc(copy) + "</p>";
      html += '<div class="league-list">';
      (data.competitions || []).forEach(function (row) {
        html += '<a href="' + prefix + row.slug + '/">' + esc(row.name) + "</a>";
      });
      html += "</div>";
      root.innerHTML = html;
    }).catch(function () {
      root.innerHTML = "<h1>" + esc(title) + "</h1><p>Please try again shortly.</p>";
    });
  }

  function paintScores(root, s) {
    getJson("/v1/public/scores/" + encodeURIComponent(s)).then(function (data) {
      var html = "<h1>" + esc(data.name || "Scores") + "</h1>";
      var rows = data.matches || [];
      if (!rows.length) {
        html += "<p>No matches in this window.</p>";
        root.innerHTML = html;
        return;
      }
      rows.forEach(function (m) {
        var score =
          m.status === "Upcoming" || m.home_score == null
            ? esc(m.status || "")
            : esc(String(m.home_score)) + "–" + esc(String(m.away_score));
        html +=
          '<div class="score-row">' +
          '<div class="side">' + crest(m.home_crest, m.home) + "<span>" + esc(m.home) + "</span></div>" +
          '<div class="score-mid"><strong>' + score + "</strong><span>" + esc(kick(m.kickoff)) + "</span></div>" +
          '<div class="side away">' + "<span>" + esc(m.away) + "</span>" + crest(m.away_crest, m.away) + "</div>" +
          "</div>";
      });
      root.innerHTML = html;
    }).catch(function () {
      root.innerHTML = "<p>Please try again shortly.</p>";
    });
  }

  function paintTable(root, s) {
    getJson("/v1/public/table/" + encodeURIComponent(s)).then(function (data) {
      var html = "<h1>" + esc(data.name || "Table") + "</h1>";
      var tables = data.tables || [];
      if (!tables.length) {
        html += "<p>No table for this competition right now.</p>";
        root.innerHTML = html;
        return;
      }
      tables.forEach(function (table) {
        if (table.group) html += "<h2>" + esc(table.group) + "</h2>";
        html += '<div class="table-wrap"><table><thead><tr><th>#</th><th>Club</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr></thead><tbody>';
        (table.rows || []).forEach(function (r) {
          html +=
            "<tr><td>" + esc(r.position) + "</td><td>" + esc(r.team) + "</td><td>" +
            esc(r.played) + "</td><td>" + esc(r.won) + "</td><td>" + esc(r.drawn) +
            "</td><td>" + esc(r.lost) + "</td><td>" + esc(r.gd) + "</td><td>" +
            esc(r.points) + "</td></tr>";
        });
        html += "</tbody></table></div>";
      });
      root.innerHTML = html;
    }).catch(function () {
      root.innerHTML = "<p>Please try again shortly.</p>";
    });
  }

  function paintOdds(root, s) {
    getJson("/v1/public/odds/" + encodeURIComponent(s)).then(function (data) {
      var html = "<h1>" + esc(data.name || "Odds") + "</h1>";
      var rows = data.matches || [];
      if (!rows.length) {
        html += "<p>No odds for upcoming matches in this competition.</p>";
        root.innerHTML = html;
        return;
      }
      rows.forEach(function (m) {
        html +=
          '<div class="odds-row">' +
          "<h3>" + esc(m.home) + " vs " + esc(m.away) + "</h3>" +
          '<p class="meta-line">' + esc(kick(m.kickoff)) + "</p>" +
          '<div class="odds-three">' +
          "<span>Home " + esc(Number(m.home_odds).toFixed(2)) + "</span>" +
          "<span>Draw " + esc(Number(m.draw_odds).toFixed(2)) + "</span>" +
          "<span>Away " + esc(Number(m.away_odds).toFixed(2)) + "</span>" +
          "</div></div>";
      });
      root.innerHTML = html;
    }).catch(function () {
      root.innerHTML = "<p>Please try again shortly.</p>";
    });
  }

  function headers() {
    return window.WiamAuth ? window.WiamAuth.headers() : { "Content-Type": "application/json" };
  }

  function paintFollow(root) {
    if (!window.WiamAuth || !window.WiamAuth.requireSession({ next: "/follow/" })) return;
    Promise.all([
      fetch(api() + "/v1/public/follow", { headers: headers() }).then(function (r) { return r.json(); }),
      getJson("/v1/public/catalog"),
    ]).then(function (pair) {
      var mine = (pair[0].teams || []);
      var comps = pair[1].competitions || [];
      var html = "<h1>Follow your team</h1>";
      html += '<p class="dek">Follow a club you care about.</p>';
      if (mine.length) {
        html += "<h2>Following</h2><ul class='follow-mine'>";
        mine.forEach(function (row) {
          html += "<li>" + esc(row.team) + " <button type='button' data-off='" + esc(row.league) + "' data-team='" + esc(row.team) + "'>Remove</button></li>";
        });
        html += "</ul>";
      }
      html += "<h2>Add a club</h2>";
      html += '<label class="follow-label">Competition <select id="follow-lg">';
      comps.forEach(function (c, i) {
        html += '<option value="' + esc(c.slug) + '"' + (i === 0 ? " selected" : "") + ">" + esc(c.name) + "</option>";
      });
      html += '</select></label><div id="follow-teams"></div>';
      root.innerHTML = html;
      var sel = document.getElementById("follow-lg");
      function loadTeams() {
        var s = sel.value;
        getJson("/v1/public/teams/" + encodeURIComponent(s)).then(function (data) {
          var box = document.getElementById("follow-teams");
          if (!box) return;
          var list = data.teams || [];
          if (!list.length) {
            box.innerHTML = "<p>No clubs in this competition yet.</p>";
            return;
          }
          box.innerHTML = list
            .map(function (name) {
              return '<button type="button" class="follow-add" data-lg="' + esc(s) + '" data-team="' + esc(name) + '">' + esc(name) + "</button>";
            })
            .join("");
        });
      }
      if (sel) {
        sel.addEventListener("change", loadTeams);
        loadTeams();
      }
      root.addEventListener("click", function (ev) {
        var t = ev.target;
        if (!t || !t.getAttribute) return;
        if (t.classList.contains("follow-add")) {
          fetch(api() + "/v1/public/follow", {
            method: "POST",
            headers: headers(),
            body: JSON.stringify({ slug: t.getAttribute("data-lg"), team: t.getAttribute("data-team") }),
          }).then(function () { paintFollow(root); });
        }
        if (t.getAttribute("data-off")) {
          fetch(api() + "/v1/public/follow/remove", {
            method: "POST",
            headers: headers(),
            body: JSON.stringify({ league: t.getAttribute("data-off"), team: t.getAttribute("data-team") }),
          }).then(function () { paintFollow(root); });
        }
      });
    }).catch(function () {
      root.innerHTML = "<p>Please try again shortly.</p>";
    });
  }

  function boot() {
    document.querySelectorAll(".news-boards a").forEach(function (a) {
      var href = (a.getAttribute("href") || "").replace(/\/+$/, "") || "/";
      var here = (location.pathname || "/").replace(/\/+$/, "") || "/";
      var on = href !== "/news" && here.indexOf(href) === 0;
      a.classList.toggle("active", on);
    });
    var root = document.getElementById("board");
    if (!root) return;
    var k = kind();
    var s = slug();
    var copy =
      k === "table"
        ? "How the league stands."
        : k === "odds"
          ? "Home, draw and away."
          : "Live scores and upcoming kick-offs.";
    if (k === "follow") return paintFollow(root);
    if (!s) {
      var prefix = k === "table" ? "/table/" : k === "odds" ? "/odds/" : "/scores/";
      var title = k === "table" ? "Table" : k === "odds" ? "Odds" : "Scores & fixtures";
      return paintPicker(root, prefix, title, copy);
    }
    if (k === "table") return paintTable(root, s);
    if (k === "odds") return paintOdds(root, s);
    return paintScores(root, s);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
