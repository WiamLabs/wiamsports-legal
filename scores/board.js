/* Football Scores / Table / Odds from stored matches. NEW1 board CSS. No invented boards. */
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
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Africa/Accra",
      });
    } catch (e) {
      return iso;
    }
  }

  function dayLabel(iso) {
    var t = Date.parse(iso || "");
    if (!t) return "Fixtures";
    try {
      return new Date(t).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "Africa/Accra",
      });
    } catch (e) {
      return "Fixtures";
    }
  }

  function crest(url, name) {
    var letter = esc((name || "?").slice(0, 1));
    if (!url) return '<span class="crest-fallback">' + letter + "</span>";
    return (
      '<img class="crest" src="' +
      esc(url) +
      '" alt="" data-letter="' +
      letter +
      '" onerror="this.replaceWith(Object.assign(document.createElement(\'span\'),{className:\'crest-fallback\',textContent:this.getAttribute(\'data-letter\')||\'?\'}))">'
    );
  }

  function scoreCell(val, state) {
    if (state === "up") return "";
    var n = val == null || val === "" ? "0" : String(val);
    return '<span class="score">' + esc(n) + "</span>";
  }

  function getJson(path) {
    return fetch(api() + path).then(function (r) {
      return r.json();
    });
  }

  function paintPicker(root, prefix, title, copy) {
    getJson("/v1/public/catalog").then(function (data) {
      var html = "<h1>" + esc(title) + "</h1>";
      html += '<p class="subtitle">' + esc(copy) + "</p>";
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

  function matchState(m) {
    var st = String(m.status || "").toLowerCase();
    if (st.indexOf("live") >= 0 || st === "in play" || st === "1h" || st === "2h" || st === "ht") return "live";
    if (st === "ft" || st.indexOf("full") >= 0 || st === "finished") return "ft";
    return "up";
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
      var groups = [];
      var seen = {};
      rows.forEach(function (m) {
        var label = dayLabel(m.kickoff);
        if (!seen[label]) {
          seen[label] = groups.length;
          groups.push({ label: label, rows: [] });
        }
        groups[seen[label]].rows.push(m);
      });
      groups.forEach(function (g) {
        html += '<div class="match-group"><h3>' + esc(g.label) + "</h3>";
        g.rows.forEach(function (m) {
          var state = matchState(m);
          var klass = "match-row" + (state === "live" ? " is-live" : state === "ft" ? " is-ft" : "");
          var homeScore = scoreCell(m.home_score, state);
          var awayScore = scoreCell(m.away_score, state);
          var when = state === "live" ? "LIVE" : state === "ft" ? "FT" : esc(kick(m.kickoff));
          html +=
            '<div class="' + klass + '"><div class="clubs">' +
            '<div class="club-line"><span class="name">' + crest(m.home_crest, m.home) + "<span>" + esc(m.home) + "</span></span>" + homeScore + "</div>" +
            '<div class="club-line"><span class="name">' + crest(m.away_crest, m.away) + "<span>" + esc(m.away) + "</span></span>" + awayScore + "</div>" +
            '</div><div class="kickoff">' + when + "</div></div>";
        });
        html += "</div>";
      });
      root.innerHTML = html;
      if (rows.some(function (m) { return matchState(m) === "live"; })) {
        window.clearTimeout(window._wiamScoreTimer);
        window._wiamScoreTimer = window.setTimeout(function () {
          paintScores(root, s);
        }, 12000);
      }
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
        html += '<div class="table-wrap"><table class="standings-table"><thead><tr><th class="num">#</th><th>Team</th><th class="num">Pld</th><th class="num">W</th><th class="num">D</th><th class="num">L</th><th class="num">GD</th><th class="num">Pts</th></tr></thead><tbody>';
        (table.rows || []).forEach(function (r) {
          var pos = Number(r.position || 0);
          html +=
            '<tr class="' + (pos && pos <= 4 ? "zone-top" : "") + '"><td class="num">' +
            esc(r.position) + '</td><td class="team">' + esc(r.team) +
            '</td><td class="num">' + esc(r.played) + '</td><td class="num">' + esc(r.won) +
            '</td><td class="num">' + esc(r.drawn) + '</td><td class="num">' + esc(r.lost) +
            '</td><td class="num">' + esc(r.gd) + '</td><td class="num"><strong>' +
            esc(r.points) + "</strong></td></tr>";
        });
        html += "</tbody></table></div>";
        html += '<p style="font-size:12px;color:var(--label);margin-top:14px;">Green edge = current top four.</p>';
      });
      root.innerHTML = html;
    }).catch(function () {
      root.innerHTML = "<p>Please try again shortly.</p>";
    });
  }

  function paintOdds(root, s) {
    getJson("/v1/public/odds/" + encodeURIComponent(s)).then(function (data) {
      var html = "<h1>" + esc(data.name || "Odds") + "</h1>";
      html += '<div class="odds-disclaimer">Entertainment only. WiamArena is not a bookmaker and these are not betting advice. 18+. Bet responsibly.</div>';
      var rows = data.matches || [];
      if (!rows.length) {
        html += "<p>No odds for upcoming matches in this competition.</p>";
        root.innerHTML = html;
        return;
      }
      rows.forEach(function (m) {
        html +=
          '<div class="odds-row"><p class="fixture">' +
          esc(m.home) + " vs " + esc(m.away) +
          ' <span class="when">' + esc(kick(m.kickoff)) + "</span></p>" +
          '<div class="odds-grid">' +
          '<div class="odds-pill"><p class="k">Home</p><p class="v">' + esc(Number(m.home_odds).toFixed(2)) + "</p></div>" +
          '<div class="odds-pill"><p class="k">Draw</p><p class="v">' + esc(Number(m.draw_odds).toFixed(2)) + "</p></div>" +
          '<div class="odds-pill"><p class="k">Away</p><p class="v">' + esc(Number(m.away_odds).toFixed(2)) + "</p></div>" +
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

  function paintFollowGate(root) {
    root.innerHTML =
      "<h1>Follow</h1>" +
      '<p class="subtitle">Follow a club you care about. Sign in to save it on this account.</p>' +
      '<div class="gate-card"><h2>Sign in to follow</h2>' +
      "<p>Following a club saves it to your account, so it is here every time you sign in — on any device.</p>" +
      '<a class="btn btn-primary" href="/login/?next=' + encodeURIComponent("/follow/") + '">Sign in</a>' +
      '<p style="margin-top:10px;font-size:13px;">New here? <a href="/register/?next=' + encodeURIComponent("/follow/") + '">Create an account</a>.</p></div>' +
      "<section><h2>Clubs you can follow</h2>" +
      '<p class="subtitle">Preview — tap Sign in, then these names become live buttons.</p>' +
      '<div id="follow-preview" class="club-grid" aria-hidden="true"></div></section>';
    getJson("/v1/public/catalog").then(function (data) {
      var comps = data.competitions || [];
      var first = comps[0];
      if (!first) return;
      getJson("/v1/public/teams/" + encodeURIComponent(first.slug)).then(function (pack) {
        var box = document.getElementById("follow-preview");
        if (!box) return;
        var list = (pack.teams || []).slice(0, 12);
        box.innerHTML = list.map(function (name) {
          return '<div class="club-pick"><div class="crest"></div><p class="name">' + esc(name) + "</p></div>";
        }).join("") || "<p>Clubs appear here after the next scores sync.</p>";
      });
    }).catch(function () {});
  }

  function paintFollow(root) {
    if (!window.WiamAuth || !window.WiamAuth.session()) {
      paintFollowGate(root);
      return;
    }
    Promise.all([
      fetch(api() + "/v1/public/follow", { headers: headers() }).then(function (r) { return r.json(); }),
      getJson("/v1/public/catalog"),
    ]).then(function (pair) {
      var mine = pair[0].teams || [];
      var comps = pair[1].competitions || [];
      var html = "<h1>Follow</h1>";
      html += '<p class="subtitle">Follow a club you care about.</p>';
      if (mine.length) {
        html += "<h2>Following</h2><ul class='follow-mine'>";
        mine.forEach(function (row) {
          html +=
            "<li><span>" + esc(row.team) + "</span>" +
            "<button type='button' class='btn' data-off='" + esc(row.league) + "' data-team='" + esc(row.team) + "'>Remove</button></li>";
        });
        html += "</ul>";
      }
      html += "<h2>Add a club</h2>";
      html += '<label class="follow-label">Competition <select id="follow-lg">';
      comps.forEach(function (c, i) {
        html += '<option value="' + esc(c.slug) + '"' + (i === 0 ? " selected" : "") + ">" + esc(c.name) + "</option>";
      });
      html += '</select></label><div id="follow-teams" class="club-grid"></div>';
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
          var followed = {};
          mine.forEach(function (row) {
            followed[(row.team || "").toLowerCase()] = 1;
          });
          box.innerHTML = list
            .map(function (name) {
              var on = followed[String(name).toLowerCase()] ? " picked" : "";
              return (
                '<button type="button" class="club-pick' + on + '" data-lg="' + esc(s) + '" data-team="' + esc(name) + '">' +
                '<div class="crest"></div><p class="name">' + esc(name) + "</p></button>"
              );
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
        if (!t) return;
        if (t.closest) t = t.closest("[data-team]") || t;
        if (!t.getAttribute) return;
        if (t.classList.contains("club-pick") && t.getAttribute("data-lg")) {
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
    document.querySelectorAll(".board-tabs a, .news-boards a").forEach(function (a) {
      var href = (a.getAttribute("href") || "").replace(/\/+$/, "") || "/";
      var here = (location.pathname || "/").replace(/\/+$/, "") || "/";
      var on = href === "/" || href === "/news" ? here === "/" || here === "/news" : href !== "/" && here.indexOf(href) === 0;
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
      var title = k === "table" ? "Table" : k === "odds" ? "Odds" : "Scores";
      return paintPicker(root, prefix, title, copy);
    }
    if (k === "table") return paintTable(root, s);
    if (k === "odds") return paintOdds(root, s);
    return paintScores(root, s);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      var board = document.getElementById("board");
      if (board && !board.hidden) boot();
    });
  } else {
    var board = document.getElementById("board");
    if (board && !board.hidden) boot();
  }

  return { paint: boot };
})();
