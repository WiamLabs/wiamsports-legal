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
    if (p[0] === "goals") return "goals";
    if (p[0] === "live") return "live";
    if (p[0] === "match") return "match";
    if (p[0] === "club") return "club";
    return "scores";
  }

  function slug() {
    var p = parts();
    return p[1] || "";
  }

  function boardSide() {
    return new URLSearchParams(location.search).get("side") === "women" ? "women" : "men";
  }

  function genderNav() {
    var base = (location.pathname || "/").replace(/\/+$/, "") + "/";
    var side = boardSide();
    return (
      '<nav class="gender-switch" aria-label="Men and women">' +
      '<a href="' + esc(base) + '"' + (side === "women" ? "" : ' class="on"') + ">Men</a>" +
      '<a href="' + esc(base + "?side=women") + '"' + (side === "women" ? ' class="on"' : "") + ">Women</a>" +
      "</nav>"
    );
  }

  function freshLine() {
    return "<p>Updated just now.</p><p>Scores can take a short time to update.</p>";
  }

  var BOARD_SPORTS = [
    ["football", "Football"],
    ["basketball", "Basketball"],
    ["tennis", "Tennis"],
    ["athletics", "Athletics"],
    ["boxing", "Boxing"],
    ["wrestling", "Wrestling"],
  ];

  function boardSport() {
    var picked = new URLSearchParams(location.search).get("sport") || "football";
    var known = false;
    BOARD_SPORTS.forEach(function (row) {
      if (row[0] === picked) known = true;
    });
    return known ? picked : "football";
  }

  function sportNav() {
    var base = (location.pathname || "/").replace(/\/+$/, "") + "/";
    var sport = boardSport();
    var html = '<nav class="desk-chips" aria-label="Sports">';
    BOARD_SPORTS.forEach(function (row) {
      var href = row[0] === "football" ? base : base + "?sport=" + row[0];
      html += '<a href="' + esc(href) + '"' + (row[0] === sport ? ' class="on"' : "") + ">" + esc(row[1]) + "</a>";
    });
    return html + "</nav>";
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

  function teamKey(name) {
    var s = String(name || "").toLowerCase().replace(/\s+/g, " ").trim();
    return s.replace(/\s+(fc|cf|afc|sc)$/i, "").trim();
  }

  function matchKey(m) {
    return teamKey(m.home) + "|" + teamKey(m.away) + "|" + String(m.kickoff || "").slice(0, 16);
  }

  function uniqueMatches(rows) {
    var seen = {};
    var out = [];
    (rows || []).forEach(function (m) {
      var key = matchKey(m);
      if (!key || seen[key]) return;
      seen[key] = true;
      out.push(m);
    });
    return out;
  }

  function crest(url) {
    if (!url) return '<span class="crest-fallback" aria-hidden="true"></span>';
    return (
      '<img class="crest" src="' +
      esc(url) +
      '" alt="" onerror="var s=document.createElement(\'span\');s.className=\'crest-fallback\';this.replaceWith(s);">'
    );
  }

  function ghanaKey(iso) {
    var t = Date.parse(iso || "");
    if (!t) return "";
    try {
      return new Date(t).toLocaleDateString("en-CA", { timeZone: "Africa/Accra" });
    } catch (e) {
      return String(iso).slice(0, 10);
    }
  }

  function boardDay() {
    return new URLSearchParams(location.search).get("day") || "";
  }

  function withDay(day) {
    var q = new URLSearchParams(location.search);
    if (day) q.set("day", day);
    else q.delete("day");
    var base = (location.pathname || "/").replace(/\/+$/, "") + "/";
    var text = q.toString();
    return base + (text ? "?" + text : "");
  }

  function dateNav(rows) {
    var seen = {};
    var days = [];
    rows.forEach(function (m) {
      var key = ghanaKey(m.kickoff);
      if (!key || seen[key]) return;
      seen[key] = m.kickoff;
      days.push(key);
    });
    days.sort();
    var picked = boardDay();
    var html = '<nav class="desk-chips" aria-label="Dates">';
    days.forEach(function (key) {
      html +=
        '<a href="' + esc(withDay(key)) + '"' + (key === picked ? ' class="on"' : "") + ">" +
        esc(dayLabel(seen[key])) + "</a>";
    });
    html += "</nav><p>Other days are not in this window.</p>";
    return html;
  }

  function clubHref(name, comp) {
    return "/club/?n=" + encodeURIComponent(name || "") + (comp ? "&c=" + encodeURIComponent(comp) : "");
  }

  function scoreCell(val, state) {
    if (state === "up") return '<span class="score is-empty"></span>';
    var n = val == null || val === "" ? "0" : String(val);
    return '<span class="score">' + esc(n) + "</span>";
  }

  function matchState(m) {
    var st = String(m.status || "").toLowerCase();
    if (st === "ht" || st === "paused" || st === "half") return "ht";
    if (st.indexOf("live") >= 0 || st === "in play" || st === "1h" || st === "2h") return "live";
    if (st === "ft" || st.indexOf("full") >= 0 || st === "finished") return "ft";
    return "up";
  }

  function liveStamp(m, state) {
    if (state === "ht") return '<span class="live-stamp is-ht">HT</span>';
    if (state !== "live") return state === "ft" ? "FT" : esc(kick(m.kickoff));
    var min = m.minute;
    var label = "LIVE";
    if (min != null && min !== "") label += " " + esc(String(min)) + "'";
    return '<span class="live-stamp">' + label + "</span>";
  }

  function isFollowed(m, mine) {
    if (!mine || !mine.length) return false;
    var home = teamKey(m.home);
    var away = teamKey(m.away);
    return mine.some(function (row) {
      var t = teamKey(row.team);
      return t && (t === home || t === away);
    });
  }

  function matchRowHtml(m, mine, extraClass) {
    var state = matchState(m);
    var followed = isFollowed(m, mine);
    var klass =
      "match-row" +
      (state === "live" ? " is-live" : state === "ht" ? " is-live is-ht" : state === "ft" ? " is-ft" : "") +
      (followed ? " is-followed" : "") +
      (extraClass ? " " + extraClass : "");
    var comp = m.competition
      ? '<p class="match-comp">' + esc(m.competition) + "</p>"
      : "";
    var liveId =
      state === "live" || state === "ht"
        ? ' id="m-' + esc(matchKey(m).replace(/[^a-z0-9]+/gi, "-")) + '"'
        : "";
    return (
      '<div class="' +
      klass +
      '" data-match="' +
      esc(matchKey(m)) +
      '"' +
      liveId +
      ">" +
      '<div class="clubs">' +
      comp +
      '<div class="club-line"><span class="name">' +
      crest(m.home_crest, m.home) +
      '<a class="club-name" href="' + esc(clubHref(m.home, m.slug)) + '">' +
      esc(m.home) +
      "</a></span>" +
      scoreCell(m.home_score, state) +
      "</div>" +
      '<div class="club-line"><span class="name">' +
      crest(m.away_crest, m.away) +
      '<a class="club-name" href="' + esc(clubHref(m.away, m.slug)) + '">' +
      esc(m.away) +
      "</a></span>" +
      scoreCell(m.away_score, state) +
      "</div></div>" +
      '<div class="kickoff">' +
      liveStamp(m, state) +
      '<a class="match-open" href="/match/?k=' + encodeURIComponent(matchKey(m)) + '">Match</a>' +
      "</div></div>"
    );
  }

  function loadFollowed() {
    if (!window.WiamAuth || !window.WiamAuth.session()) {
      return Promise.resolve([]);
    }
    return fetch(api() + "/v1/public/follow", { headers: headers() })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        return data.teams || [];
      })
      .catch(function () {
        return [];
      });
  }

  function clearScoreTimer() {
    if (window._wiamScoreTimer) {
      window.clearTimeout(window._wiamScoreTimer);
      window._wiamScoreTimer = 0;
    }
  }

  function scheduleScoreRefresh(fn, rows) {
    clearScoreTimer();
    var live = (rows || []).some(function (m) {
      var st = matchState(m);
      return st === "live" || st === "ht";
    });
    if (!live) return;
    window._wiamScoreTimer = window.setTimeout(fn, 12000);
  }

  function keepScroll(run) {
    var painted = rootHasScores();
    var y = window.scrollY || 0;
    run();
    if (painted) {
      window.scrollTo(0, y);
      return;
    }
    if (location.hash === "#live-now") {
      var jump = document.getElementById("live-now");
      if (jump) jump.scrollIntoView({ block: "start" });
    }
  }

  function rootHasScores() {
    var root = document.getElementById("board");
    return !!(root && (root.querySelector(".scores-hub") || root.querySelector(".scores-board")));
  }

  function getJson(path) {
    return fetch(api() + path).then(function (r) {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    });
  }

  function paintPicker(root, prefix, title, copy) {
    var html = "<h1>" + esc(title) + "</h1>";
    html += '<p class="subtitle">' + esc(copy) + "</p>";
    if (prefix === "/table/") {
      html += sportNav();
      if (boardSport() !== "football") {
        html += "<p>No table here yet.</p>";
        root.innerHTML = html;
        return;
      }
      html += genderNav();
      if (boardSide() === "women") {
        html += "<p>No table here yet.</p>";
        root.innerHTML = html;
        return;
      }
    }
    getJson("/v1/public/catalog").then(function (data) {
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

  function loadHub() {
    return getJson("/v1/public/scores/hub")
      .then(function (data) {
        if (data && data.ok) return data;
        throw new Error("hub");
      })
      .catch(function () {
        return Promise.all([
          getJson("/v1/public/catalog"),
          getJson("/v1/public/scores/live"),
        ]).then(function (pair) {
          var live = pair[1].matches || [];
          var counts = {};
          live.forEach(function (m) {
            if (m.slug) counts[m.slug] = (counts[m.slug] || 0) + 1;
          });
          return {
            live: live,
            today: [],
            competitions: (pair[0].competitions || []).map(function (row) {
              return {
                slug: row.slug,
                name: row.name,
                live: counts[row.slug] || 0,
                next: "",
              };
            }),
          };
        });
      });
  }

  function paintScoresHub(root) {
    root.hidden = false;
    if (!root.innerHTML) root.innerHTML = "<h1>Scores</h1><p>Loading scores…</p>";
    Promise.all([loadHub(), loadFollowed()]).then(function (pair) {
      var data = pair[0];
      var mine = pair[1];
      var live = uniqueMatches(data.live || []);
      var today = uniqueMatches(data.today || []);
      var comps = data.competitions || [];
      var html = '<div class="scores-hub">';
      var liveOnly = kind() === "live";
      html += "<h1>" + (liveOnly ? "Live" : "Scores") + "</h1>";
      html += '<p class="subtitle">' + (liveOnly ? "Matches in play." : "Fixtures and results.") + "</p>";
      html += sportNav();
      if (boardSport() !== "football") {
        html += "<p>No matches here yet.</p></div>";
        keepScroll(function () { root.innerHTML = html; });
        return;
      }
      html += genderNav();
      html += freshLine();
      if (liveOnly) html += "<p>This board checks again on its own.</p>";
      if (boardSide() === "women") {
        html += "<p>No matches here yet.</p></div>";
        keepScroll(function () { root.innerHTML = html; });
        return;
      }
      if (!liveOnly) {
        html += dateNav(today);
        var pickedDay = boardDay();
        if (pickedDay) {
          today = today.filter(function (m) { return ghanaKey(m.kickoff) === pickedDay; });
        }
      }
      if (liveOnly) {
        html += '<section class="scores-block" id="live-now">';
        html += "<h2>Live now</h2>";
        if (!live.length) {
          html += "<p>No matches live right now.</p>";
          var nextKick = "";
          today.forEach(function (m) {
            var st = matchState(m);
            if (st === "live" || st === "ht" || st === "ft") return;
            var label = kick(m.kickoff);
            if (label && !nextKick) nextKick = label;
          });
          if (nextKick) html += "<p>Next kick-off " + esc(nextKick) + ".</p>";
        } else {
          live.forEach(function (m) {
            html += matchRowHtml(m, mine, "is-link");
          });
        }
        html += "</section>";
      }
      if (!liveOnly) {
        var buckets = { today: [], upcoming: [], finished: [] };
        var nowMs = Date.now();
        today.forEach(function (m) {
          var st = matchState(m);
          var when = Date.parse(m.kickoff || "");
          if (st === "ft" || (when && when < nowMs - 3 * 60 * 60 * 1000 && st !== "live" && st !== "ht")) buckets.finished.push(m);
          else if (st === "up" && when && when > nowMs + 60 * 60 * 1000) buckets.upcoming.push(m);
          else buckets.today.push(m);
        });
        [
          ["today", "Today", "No matches today."],
          ["upcoming", "Upcoming", "No upcoming matches in this window."],
          ["finished", "Finished", "No finished matches in this window."],
        ].forEach(function (spec) {
          var rows = buckets[spec[0]];
          html += '<section class="scores-block"><h2>' + spec[1] + "</h2>";
          if (!rows.length) {
            html += "<p>" + spec[2] + "</p></section>";
            return;
          }
          var byComp = [];
          var seen = {};
          rows.forEach(function (m) {
            var label = m.competition || "Fixtures";
            if (seen[label] == null) {
              seen[label] = byComp.length;
              byComp.push({ label: label, slug: m.slug, rows: [] });
            }
            byComp[seen[label]].rows.push(m);
          });
          byComp.forEach(function (g) {
          html += '<div class="match-group">';
          html +=
            "<h3>" +
            (g.slug
              ? '<a href="/scores/' + esc(g.slug) + '/">' + esc(g.label) + "</a>"
              : esc(g.label)) +
            "</h3>";
          g.rows.forEach(function (m) {
            html += matchRowHtml(m, mine, "is-link");
          });
          html += "</div>";
        });
        html += "</section>";
        });
      }
      if (!liveOnly) {
      html += '<section class="scores-block"><h2>Leagues</h2>';
      html += '<div class="scores-leagues">';
      comps.forEach(function (row) {
        var meta = row.live
          ? row.live === 1
            ? "1 live"
            : row.live + " live"
          : row.next
            ? row.next
            : "";
        html +=
          '<a class="scores-league" href="/scores/' +
          esc(row.slug) +
          '/"><span class="league-name">' +
          esc(row.name) +
          "</span>" +
          (meta
            ? '<span class="league-meta' +
              (row.live ? " is-live" : "") +
              '">' +
              esc(String(meta)) +
              "</span>"
            : "") +
          "</a>";
      });
      html += "</div></section>";
      }
      html += "</div>";
      keepScroll(function () {
        root.innerHTML = html;
      });
      root.querySelectorAll(".match-row.is-link").forEach(function (el) {
        el.addEventListener("click", function (ev) {
          var node = ev.target;
          while (node && node !== el) {
            if (node.tagName === "A") return;
            node = node.parentNode;
          }
          var key = el.getAttribute("data-match") || "";
          if (key) location.href = "/match/?k=" + encodeURIComponent(key);
        });
      });
      scheduleScoreRefresh(function () {
        paintScoresHub(root);
      }, live);
    }).catch(function () {
      root.innerHTML = "<h1>Scores</h1><p>Please try again shortly.</p>";
    });
  }

  function paintScores(root, s) {
    root.hidden = false;
    Promise.all([
      getJson("/v1/public/scores/" + encodeURIComponent(s)),
      loadFollowed(),
    ]).then(function (pair) {
      var data = pair[0];
      var mine = pair[1];
      var rows = uniqueMatches(data.matches || []);
      var html = '<div class="scores-board">';
      html += "<h1>" + esc(data.name || "Scores") + "</h1>";
      html += genderNav();
      html += freshLine();
      html += '<p><a href="/goals/' + esc(s) + '/">Goals</a></p>';
      if (boardSide() === "women") {
        html += "<p>No matches here yet.</p></div>";
        root.innerHTML = html;
        return;
      }
      html += dateNav(rows);
      var pickedDay = boardDay();
      if (pickedDay) {
        rows = rows.filter(function (m) { return ghanaKey(m.kickoff) === pickedDay; });
      }
      var liveRows = rows.filter(function (m) {
        var st = matchState(m);
        return st === "live" || st === "ht";
      });
      if (liveRows.length) {
        html +=
          '<a class="jump-live" href="#live-now">Jump to live</a>';
      }
      if (!rows.length) {
        html += "<p>No matches in this window.</p></div>";
        root.innerHTML = html;
        return;
      }
      var groups = [];
      var seen = {};
      var livePlaced = false;
      rows.forEach(function (m) {
        var label = dayLabel(m.kickoff);
        if (!seen[label]) {
          seen[label] = groups.length;
          groups.push({ label: label, rows: [] });
        }
        groups[seen[label]].rows.push(m);
      });
      groups.forEach(function (g) {
        var hasLive = g.rows.some(function (m) {
          var st = matchState(m);
          return st === "live" || st === "ht";
        });
        html +=
          '<div class="match-group"' +
          (hasLive && !livePlaced ? ' id="live-now"' : "") +
          "><h3>" +
          esc(g.label) +
          "</h3>";
        if (hasLive) livePlaced = true;
        g.rows.forEach(function (m) {
          html += matchRowHtml(m, mine);
        });
        html += "</div>";
      });
      html += "</div>";
      keepScroll(function () {
        root.innerHTML = html;
      });
      scheduleScoreRefresh(function () {
        paintScores(root, s);
      }, rows);
    }).catch(function () {
      root.innerHTML = "<p>Please try again shortly.</p>";
    });
  }

  function paintTable(root, s) {
    getJson("/v1/public/table/" + encodeURIComponent(s)).then(function (data) {
      var html = "<h1>" + esc(data.name || "Table") + "</h1>";
      html += genderNav();
      if (boardSide() === "women") {
        html += "<p>No table here yet.</p>";
        root.innerHTML = html;
        return;
      }
      var tables = data.tables || [];
      if (!tables.length) {
        html += "<p>No table for this competition right now.</p>";
        root.innerHTML = html;
        return;
      }
      html += '<p><button type="button" id="comp-follow">Follow this competition</button></p><p id="comp-follow-note"></p>';
      tables.forEach(function (table) {
        if (table.group) html += "<h2>" + esc(table.group) + "</h2>";
        html += '<div class="table-wrap"><table class="standings-table"><thead><tr><th class="num">#</th><th>Team</th><th class="num">Pld</th><th class="num">W</th><th class="num">D</th><th class="num">L</th><th class="num">GD</th><th class="num">Pts</th></tr></thead><tbody>';
        (table.rows || []).forEach(function (r) {
          var pos = Number(r.position || 0);
          html +=
            '<tr class="' + (pos && pos <= 4 ? "zone-top" : "") + '"><td class="num">' +
            esc(r.position) + '</td><td class="team">' + crest(r.crest) + '<a href="' + esc(clubHref(r.team, s)) + '">' + esc(r.team) + "</a>" +
            '</td><td class="num">' + esc(r.played) + '</td><td class="num">' + esc(r.won) +
            '</td><td class="num">' + esc(r.drawn) + '</td><td class="num">' + esc(r.lost) +
            '</td><td class="num">' + esc(r.gd) + '</td><td class="num"><strong>' +
            esc(r.points) + "</strong></td></tr>";
        });
        html += "</tbody></table></div>";
        html += '<p style="font-size:12px;color:var(--label);margin-top:14px;">Green edge = current top four.</p>';
      });
      var hasForm = false;
      tables.forEach(function (table) {
        (table.rows || []).forEach(function (r) {
          if (String(r.form || "").trim()) hasForm = true;
        });
      });
      if (!hasForm) html += "<p>Form is not on this table yet.</p>";
      html += "<p>Earlier seasons are not in yet.</p>";
      root.innerHTML = html;
      bindCompFollow(data.name || "This competition", s);
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

  function paintGoalsHub(root) {
    root.hidden = false;
    var html = '<div class="scores-hub"><h1>Goals</h1>';
    html += '<p class="subtitle">Scorers and goal statistics.</p>';
    html += genderNav();
    html += '<p><a href="/scores/">Scores</a></p>';
    if (boardSide() === "women") {
      html += "<p>No scorers here yet.</p></div>";
      root.innerHTML = html;
      return;
    }
    root.innerHTML = html + "<p>Loading scorers…</p></div>";
    getJson("/v1/public/goals").then(function (data) {
      var comps = (data && data.competitions) || [];
      var list = html + '<div class="scores-leagues">';
      comps.forEach(function (row) {
        list += '<a class="scores-league" href="/goals/' + esc(row.slug) + '/"><span class="league-name">' + esc(row.name) + "</span></a>";
      });
      list += "</div></div>";
      root.innerHTML = list;
    }).catch(function () {
      root.innerHTML = html + "<p>Scorers are not on the board yet.</p></div>";
    });
  }

  function paintGoals(root, s) {
    root.hidden = false;
    var html = '<div class="scores-board"><h1>Goals</h1>';
    html += genderNav();
    html += '<p><a href="/goals/">All competitions</a></p>';
    if (boardSide() === "women") {
      html += "<p>No scorers here yet.</p></div>";
      root.innerHTML = html;
      return;
    }
    root.innerHTML = html + "<p>Loading scorers…</p></div>";
    getJson("/v1/public/goals/" + encodeURIComponent(s)).then(function (data) {
      var rows = (data && data.scorers) || [];
      var body = '<div class="scores-board"><h1>' + esc((data && data.name) || "Goals") + "</h1>";
      body += genderNav();
      body += '<p><a href="/goals/">All competitions</a></p>';
      if (!rows.length) {
        body += "<p>Scorers for this competition are not in yet.</p></div>";
        root.innerHTML = body;
        return;
      }
      body += "<ol>";
      rows.forEach(function (row) {
        body += "<li><strong>" + esc(row.player) + "</strong> " + esc(row.team || "") + " — " + esc(String(row.goals || 0)) + "</li>";
      });
      body += "</ol></div>";
      root.innerHTML = body;
    }).catch(function () {
      root.innerHTML = html + "<p>Scorers are not on the board yet.</p></div>";
    });
  }

  function paintMatch(root) {
    var key = new URLSearchParams(location.search).get("k") || "";
    root.hidden = false;
    if (!key) {
      root.innerHTML = "<h1>Match</h1><p>Choose a match from Scores or Live.</p>";
      return;
    }
    Promise.all([
      getJson("/v1/public/scores/live").catch(function () { return { matches: [] }; }),
      getJson("/v1/public/scores/hub").catch(function () { return {}; }),
    ]).then(function (pair) {
      var rows = (pair[0].matches || []).concat((pair[1] && pair[1].today) || []);
      var found = null;
      rows.forEach(function (m) {
        if (!found && matchKey(m) === key) found = m;
      });
      if (!found) {
        root.innerHTML = "<h1>Match</h1><p>This match is not on the board yet.</p>";
        return;
      }
      var state = matchState(found);
      var html = '<div class="scores-board">';
      html +=
        "<h1><a href=\"" + esc(clubHref(found.home, found.slug)) + "\">" + esc(found.home || "Home") +
        "</a> v <a href=\"" + esc(clubHref(found.away, found.slug)) + "\">" + esc(found.away || "Away") + "</a></h1>";
      if (found.competition) html += "<p>" + esc(found.competition) + "</p>";
      html += "<p>" + liveStamp(found, state) + "</p>";
      html += matchRowHtml(found, []);
      html += "<h2>Preview</h2><p>The preview is not in yet.</p>";
      html += "<h2>Pitch</h2><p>The pitch appears when the lineup is in.</p>";
      html += "<h2>Lineups</h2><p>Lineups appear here when the match sheet is in.</p>";
      html += "<h2>Stats</h2><p>Match stats appear here when they are in.</p>";
      html += "<h2>Head to head</h2><p>Head to head is not in yet.</p>";
      html += "<h2>Form</h2><p>Form is not in yet.</p>";
      if (found.slug) html += '<p><a href="/scores/' + esc(found.slug) + '/">Competition scores</a></p>';
      if (found.slug) html += '<p><a href="/table/' + esc(found.slug) + '/">Competition table</a></p>';
      html += "</div>";
      root.innerHTML = html;
    }).catch(function () {
      root.innerHTML = "<h1>Match</h1><p>Please try again shortly.</p>";
    });
  }

  function bindCompFollow(name, slug) {
    var btn = document.getElementById("comp-follow");
    var note = document.getElementById("comp-follow-note");
    if (!btn) return;
    function say(text) {
      if (note) note.textContent = text;
    }
    if (!window.WiamAuth || !window.WiamAuth.session()) {
      btn.addEventListener("click", function () {
        location.href = "/login/?next=" + encodeURIComponent(location.pathname + location.search);
      });
      say("Sign in to follow this.");
      return;
    }
    fetch(api() + "/v1/public/follow", { headers: headers() })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var mine = (data.teams || []).some(function (row) {
          return String(row.team || "").toLowerCase() === name.toLowerCase();
        });
        btn.textContent = mine ? "Following" : "Follow this competition";
      })
      .catch(function () {});
    btn.addEventListener("click", function () {
      var on = btn.textContent !== "Following";
      var path = on ? "/v1/public/follow" : "/v1/public/follow/remove";
      fetch(api() + path, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ slug: slug, team: name }),
      })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (pack) {
          if (!pack.ok) {
            say((pack.d && pack.d.message) || "Could not follow that. Please try again.");
            return;
          }
          btn.textContent = on ? "Following" : "Follow this competition";
          say(on ? "Following. It is on your Follow page." : "Removed from your Follow page.");
        })
        .catch(function () {
          say("Could not follow that. Please try again.");
        });
    });
  }

  function bindClubFollow(name, comp) {
    var btn = document.getElementById("club-follow");
    var note = document.getElementById("club-follow-note");
    if (!btn) return;
    function say(text) {
      if (note) note.textContent = text;
    }
    if (!window.WiamAuth || !window.WiamAuth.session()) {
      btn.addEventListener("click", function () {
        location.href = "/login/?next=" + encodeURIComponent(location.pathname + location.search);
      });
      say("Sign in to follow this.");
      return;
    }
    fetch(api() + "/v1/public/follow", { headers: headers() })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var mine = (data.teams || []).some(function (row) {
          return String(row.team || "").toLowerCase() === name.toLowerCase();
        });
        btn.textContent = mine ? "Following" : "Follow";
      })
      .catch(function () {});
    btn.addEventListener("click", function () {
      var on = btn.textContent !== "Following";
      var path = on ? "/v1/public/follow" : "/v1/public/follow/remove";
      var body = comp ? { slug: comp, team: name } : { league: "CLUB", team: name };
      fetch(api() + path, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(body),
      })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (pack) {
          if (!pack.ok) {
            say((pack.d && pack.d.message) || "Could not follow that. Please try again.");
            return;
          }
          btn.textContent = on ? "Following" : "Follow";
          say(on ? "Following. It is on your Follow page." : "Removed from your Follow page.");
        })
        .catch(function () {
          say("Could not follow that. Please try again.");
        });
    });
  }

  function paintClub(root) {
    var params = new URLSearchParams(location.search);
    var name = params.get("n") || "";
    var comp = params.get("c") || "";
    root.hidden = false;
    if (!name) {
      root.innerHTML = "<h1>Club</h1><p>Choose a club from a table.</p>";
      return;
    }
    document.title = name + " — WiamArena";
    var html = "<h1>" + esc(name) + "</h1>";
    html += '<p id="club-crest">' + crest("") + "</p>";
    html += '<p id="club-place">League position is not in yet.</p>';
    html += '<div class="player-photos" aria-hidden="true"><span class="player-silhouette"></span><span class="player-silhouette"></span><span class="player-silhouette"></span></div>';
    html += "<p>Player photos are not in yet.</p>";
    html += '<p><button type="button" id="club-follow">Follow</button></p><p id="club-follow-note"></p>';
    html += "<h2>Today</h2><div id=\"club-today\"><p>Loading…</p></div>";
    html += "<h2>Squad</h2><p>Squad not available yet.</p>";
    if (comp) html += '<p><a href="/table/' + esc(comp) + '/">Competition table</a></p>';
    root.innerHTML = html;
    bindClubFollow(name, comp);
    if (comp) {
      getJson("/v1/public/table/" + encodeURIComponent(comp)).then(function (data) {
        var found = null;
        (data.tables || []).forEach(function (table) {
          (table.rows || []).forEach(function (r) {
            if (!found && String(r.team || "").toLowerCase() === name.toLowerCase()) found = r;
          });
        });
        var slot = document.getElementById("club-crest");
        if (slot) slot.innerHTML = crest(found && found.crest);
        var place = document.getElementById("club-place");
        if (place) {
          if (found && found.position != null && String(found.position) !== "") {
            var pts = found.points == null || String(found.points) === "" ? "" : ". " + String(found.points) + " points";
            place.textContent = "Position " + String(found.position) + pts + ".";
          } else {
            place.textContent = "League position is not in yet.";
          }
        }
      }).catch(function () {});
    }
    getJson("/v1/public/scores/hub")
      .then(function (data) {
        var rows = ((data && data.today) || []).concat((data && data.live) || []);
        var mine = rows.filter(function (m) {
          var want = name.toLowerCase();
          return String(m.home || "").toLowerCase() === want || String(m.away || "").toLowerCase() === want;
        });
        var box = document.getElementById("club-today");
        if (!box) return;
        if (!mine.length) {
          box.innerHTML = "<p>No fixture in this window.</p>";
          return;
        }
        var list = "";
        mine.forEach(function (m) { list += matchRowHtml(m, [], "is-link"); });
        box.innerHTML = list;
      })
      .catch(function () {
        var box = document.getElementById("club-today");
        if (box) box.innerHTML = "<p>Please try again shortly.</p>";
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
    if (k === "match") return paintMatch(root);
    if (k === "club") return paintClub(root);
    if (k === "goals") return s ? paintGoals(root, s) : paintGoalsHub(root);
    if (k === "live") return paintScoresHub(root);
    if (!s) {
      if (k === "scores") return paintScoresHub(root);
      var prefix = k === "table" ? "/table/" : "/odds/";
      var title = k === "table" ? "Table" : "Odds";
      return paintPicker(root, prefix, title, copy);
    }
    if (k === "table") return paintTable(root, s);
    if (k === "odds") return paintOdds(root, s);
    return paintScores(root, s);
  }

  function stopScoresOnLeave() {
    clearScoreTimer();
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      clearScoreTimer();
      return;
    }
    if (kind() === "scores") boot();
  });
  window.addEventListener("pagehide", stopScoresOnLeave);

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
