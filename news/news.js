/* WiamArena News v2 — live desk. Stories come from Studio, not sample copy. */
window.WiamNews = (function () {
  var SPORTS = [
    ["football", "Football"],
    ["basketball", "Basketball"],
    ["tennis", "Tennis"],
    ["athletics", "Athletics"],
    ["boxing", "Boxing"],
  ];
  var OTHER = ["basketball", "tennis", "athletics", "boxing"];
  var CATS = [
    ["transfers", "Transfers"],
    ["rumours", "Rumours"],
    ["previews", "Match Previews"],
    ["reports", "Match Reports"],
    ["live", "Live"],
    ["analysis", "Analysis"],
    ["rankings", "Rankings"],
    ["interviews", "Interviews"],
    ["club-news", "Club News"],
    ["league-news", "League News"],
    ["player-news", "Player News"],
    ["manager-news", "Manager News"],
    ["controversy", "Controversy"],
  ];
  var CAT_DEK = {
    transfers: "Every confirmed signing and deal in talks, labelled by how solid the information is.",
    rumours: "What clubs and agents are talking about — labelled, not treated as fact.",
    previews: "What is at stake before kick-off.",
    reports: "What happened after full time.",
    live: "Matches in play right now, plus live coverage filed from the desk.",
    analysis: "The longer read on tactics, form and decisions.",
    rankings: "Ordered lists, from the newsroom.",
    interviews: "Players, managers and the people around the game.",
    "club-news": "From inside the clubs.",
    "league-news": "From the competitions.",
    "player-news": "The people on the pitch.",
    "manager-news": "The people in the dugout.",
    controversy: "Disputes, bans and cases — labelled, not treated as settled.",
  };
  var BADGE_CATS = { transfers: 1, rumours: 1, controversy: 1 };

  function api() {
    return window.WIAM_ENGINES_API || "";
  }

  function esc(s) {
    return String(s || "").replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function photoSrc(path) {
    if (!path) return "";
    if (/^https?:/i.test(path)) return path;
    return api() + path;
  }

  function ago(iso) {
    var t = Date.parse(iso || "");
    if (!t) return "";
    var m = Math.round((Date.now() - t) / 60000);
    if (m < 1) return "now";
    if (m < 60) return m + " min";
    var h = Math.round(m / 60);
    if (h < 48) return h + " h";
    return Math.round(h / 24) + " d";
  }

  function catLabel(id) {
    for (var i = 0; i < CATS.length; i++) if (CATS[i][0] === id) return CATS[i][1];
    return id || "";
  }

  var SUBDESKS = {
    football: CATS,
    basketball: [
      ["trades", "Trades & Signings"],
      ["rumours", "Rumours"],
      ["game-previews", "Game Previews"],
      ["game-reports", "Game Reports"],
      ["live", "Live"],
      ["analysis", "Analysis"],
      ["rankings", "Rankings"],
      ["interviews", "Interviews"],
      ["team-news", "Team News"],
      ["league-news", "League News"],
      ["player-news", "Player News"],
      ["coach-news", "Coach News"],
      ["controversy", "Controversy"],
    ],
    tennis: [
      ["tournament-previews", "Tournament Previews"],
      ["match-reports", "Match Reports"],
      ["live", "Live"],
      ["draws-results", "Draws & Results"],
      ["analysis", "Analysis"],
      ["rankings", "Rankings"],
      ["interviews", "Interviews"],
      ["player-news", "Player News"],
      ["tournament-news", "Tournament News"],
      ["controversy", "Controversy"],
    ],
    athletics: [
      ["meet-previews", "Meet Previews"],
      ["meet-results", "Meet Results"],
      ["live", "Live"],
      ["records", "Records"],
      ["analysis", "Analysis"],
      ["rankings", "Rankings"],
      ["interviews", "Interviews"],
      ["athlete-news", "Athlete News"],
      ["federation-news", "Federation News"],
      ["controversy", "Controversy"],
    ],
    boxing: [
      ["fight-previews", "Fight Previews"],
      ["fight-reports", "Fight Reports"],
      ["live", "Live"],
      ["fight-announcements", "Fight Announcements"],
      ["analysis", "Analysis"],
      ["rankings", "Rankings"],
      ["interviews", "Interviews"],
      ["boxer-news", "Boxer News"],
      ["promoter-news", "Promoter & Camp News"],
      ["controversy", "Controversy"],
    ],
    wrestling: [
      ["event-previews", "Event Previews"],
      ["results", "Results"],
      ["live", "Live"],
      ["records", "Records"],
      ["analysis", "Analysis"],
      ["rankings", "Rankings"],
      ["interviews", "Interviews"],
      ["wrestler-news", "Wrestler News"],
      ["federation-news", "Federation News"],
      ["controversy", "Controversy"],
    ],
  };

  function sportLabel(id) {
    if (id === "all") return "All";
    if (id === "wrestling") return "Wrestling";
    for (var i = 0; i < SPORTS.length; i++) if (SPORTS[i][0] === id) return SPORTS[i][1];
    return id || "";
  }

  function parsePath() {
    var p = (location.pathname || "/").replace(/\/+$/, "") || "/";
    var parts = p.split("/").filter(Boolean);
    if (parts[0] === "news" && parts[1] === "tag") return { mode: "tag" };
    if (parts[0] === "news" && parts[1] === "story" && parts[2]) {
      return { mode: "story", slug: decodeURIComponent(parts[2]) };
    }
    if (parts[0] === "news" && (parts[1] === "local" || parts[1] === "foreign") && !parts[2]) {
      return { mode: "feed", desk: parts[1], sport: "all" };
    }
    if (parts[0] === "news" && (parts[1] === "local" || parts[1] === "foreign") && parts[2] === "wrestling") {
      return { mode: "feed", desk: parts[1], sport: "wrestling" };
    }
    if (parts[0] === "news" && (parts[1] === "foreign" || parts[1] === "local") && parts[2] === "football") {
      if (ghanaPage() && parts[1] === "local") return { mode: "feed", desk: "local", sport: "football" };
      if (internationalPage() && parts[1] === "foreign") return { mode: "feed", desk: "foreign", sport: "football" };
      return { mode: "redirect", to: "/news/football/" };
    }
    if (parts[0] === "news" && parts[1] === "football" && parts[2]) {
      var known = CATS.map(function (r) { return r[0]; });
      var cat = known.indexOf(parts[2]) >= 0 ? parts[2] : "";
      return cat ? { mode: "category", category: cat } : { mode: "football" };
    }
    if (parts[0] === "news" && parts[1] === "football") return { mode: "football" };
    if (parts[0] === "news" && parts[1] === "trending") return { mode: "trending" };
    if (parts[0] === "search" || (parts[0] === "news" && parts[1] === "search")) {
      return { mode: "search", q: new URLSearchParams(location.search).get("q") || "" };
    }
    if (parts[0] === "news" && parts[1] && parts[2]) {
      var desk = parts[1] === "local" ? "local" : "foreign";
      var sport = OTHER.indexOf(parts[2]) >= 0 ? parts[2] : "basketball";
      return { mode: "feed", desk: desk, sport: sport };
    }
    if (parts[0] === "news") return { mode: "home" };
    if (!parts.length) return { mode: "home" };
    return { mode: "none" };
  }

  function href(desk, sport) {
    if (sport === "all") return "/news/" + desk + "/";
    if (sport === "football") {
      if ((ghanaPage() || internationalPage()) && (desk === "local" || desk === "foreign")) {
        return "/news/" + desk + "/football/";
      }
      return "/news/football/";
    }
    return "/news/" + desk + "/" + sport + "/";
  }

  function storyHref(slug) {
    return "/news/story/" + encodeURIComponent(slug) + "/";
  }

  function catHref(cat) {
    return "/news/football/" + cat + "/";
  }

  function badgeHtml(story) {
    if (!story.status) return "";
    return '<span class="status-badge status-' + esc(story.status) + '">' + esc(story.status_label || story.status) + "</span>";
  }

  function meta(story) {
    var cat = story.category_label || sportLabel(story.sport);
    return (
      '<p class="meta-line"><span class="cat">' +
      esc(cat) +
      "</span> · " +
      esc(ago(story.published_at) || story.published_display || "") +
      "</p>"
    );
  }

  function pic(story, emptyClass) {
    var src = photoSrc(story.photo);
    if (src) return '<img src="' + esc(src) + '" alt="">';
    return '<div class="' + (emptyClass || "thumb-empty") + '"></div>';
  }

  function storyCard(story, kind) {
    var img = pic(story);
    if (kind === "hero") {
      return (
        '<a class="hero" href="' + esc(storyHref(story.slug)) + '">' +
        '<div class="hero-frame">' + img + "</div>" +
        badgeHtml(story) +
        '<p class="hero-kicker">' + esc(story.category_label || sportLabel(story.sport)) + "</p>" +
        "<h1>" + esc(story.title) + "</h1>" +
        '<p class="dek">' + esc(story.subtitle || story.summary || "") + "</p>" +
        '<span class="read-more">Read more</span>' +
        meta(story) +
        "</a>"
      );
    }
    if (kind === "grid") {
      return (
        '<a class="card-story" href="' + esc(storyHref(story.slug)) + '">' +
        '<div class="thumb">' + img + "</div>" +
        badgeHtml(story) +
        "<h3>" + esc(story.title) + "</h3>" +
        meta(story) +
        "</a>"
      );
    }
    if (kind === "trend") {
      return (
        '<a class="trend-item" href="' + esc(storyHref(story.slug)) + '">' +
        '<span class="trend-n">' + esc(kind === "trend" ? arguments[2] || "" : "") + "</span>" +
        "<div>" + badgeHtml(story) + "<h3>" + esc(story.title) + "</h3>" + meta(story) + "</div>" +
        "</a>"
      );
    }
    return (
      '<a class="story-row" href="' + esc(storyHref(story.slug)) + '">' +
      pic(story) +
      "<div>" + badgeHtml(story) + "<h3>" + esc(story.title) + "</h3>" + meta(story) + "</div>" +
      "</a>"
    );
  }

  function trendRow(story, n) {
    return (
      '<a class="trend-item" href="' + esc(storyHref(story.slug)) + '">' +
      '<span class="trend-n">' + esc(String(n)) + "</span>" +
      "<div>" + badgeHtml(story) + "<h3>" + esc(story.title) + "</h3>" + meta(story) + "</div>" +
      "</a>"
    );
  }

  function emptyDesk(title, copy) {
    return "<h1>" + esc(title) + "</h1>" + '<p class="dek">' + esc(copy) + "</p>";
  }

  function ghanaPage() {
    return document.body && document.body.classList.contains("page-ghana");
  }

  function internationalPage() {
    return document.body && document.body.classList.contains("page-international");
  }

  function deskPage() {
    return ghanaPage() || internationalPage();
  }

  function paintGhanaBar(active) {
    var desks = document.getElementById("desks");
    if (!desks) return;
    var pathDesk = deskParam();
    var bits = (location.pathname || "").split("/").filter(Boolean);
    if (bits[0] === "news" && (bits[1] === "local" || bits[1] === "foreign")) pathDesk = bits[1];
    var here = (location.pathname || "/").replace(/\/+$/, "") || "/";
    var html = '<a href="/"' + (here === "/" || here === "/news" ? ' class="active"' : "") + ">Home</a>";
    html += '<a href="/news/foreign/"' + (pathDesk === "foreign" ? ' class="active"' : "") + ">International</a>";
    html += '<a href="/news/local/"' + (pathDesk === "local" ? ' class="active"' : "") + ">Ghana</a>";
    html += '<a href="/live/"' + (here === "/live" ? ' class="active"' : "") + ">Live</a>";
    html += '<a href="/scores/"' + (here.indexOf("/scores") === 0 ? ' class="active"' : "") + ">Scores</a>";
    html += '<a href="/table/"' + (here.indexOf("/table") === 0 ? ' class="active"' : "") + ">Table</a>";
    html += '<a href="/goals/"' + (here.indexOf("/goals") === 0 ? ' class="active"' : "") + ">Goals</a>";
    html += '<a href="/odds/"' + (here.indexOf("/odds") === 0 ? ' class="active"' : "") + ">Odds</a>";
    html += '<a href="/follow/"' + (here.indexOf("/follow") === 0 ? ' class="active"' : "") + ">Follow</a>";
    desks.innerHTML = html;
    paintGhanaMenu();
  }

  function paintGhanaMenu() {
    var menu = document.getElementById("menu");
    if (!menu) return;
    menu.innerHTML =
      '<a href="/">Home</a>' +
      '<a href="/news/foreign/">International</a>' +
      '<a href="/news/local/">Ghana</a>' +
      '<a href="/live/">Live</a>' +
      '<a href="/scores/">Scores</a>' +
      '<a href="/table/">Table</a>' +
      '<a href="/goals/">Goals</a>' +
      '<a href="/odds/">Odds</a>' +
      '<a href="/follow/">Follow</a>' +
      '<p class="menu-label">Account</p>' +
      '<a href="/product/">Product</a><a href="/pricing/">Pricing</a>' +
      '<a href="/login/">Sign in</a><a href="/register/">Create account</a>';
  }

  var LEGACY_DESK_NAMES = ["Foreign Sports", "Local Sports"];

  function paintSportNav(active) {
    paintGhanaBar(active);
  }

  function deskParam() {
    var desk = new URLSearchParams(location.search).get("desk") || "";
    return desk === "local" || desk === "foreign" ? desk : "";
  }

  function withDesk(href, desk) {
    if (!desk) return href;
    return href + (href.indexOf("?") >= 0 ? "&" : "?") + "desk=" + encodeURIComponent(desk);
  }

  function clearLegacyStrip() {
    var sports = document.getElementById("sports");
    var cats = document.getElementById("cats");
    if (!cats && sports && sports.parentNode) {
      cats = document.createElement("nav");
      cats.id = "cats";
      cats.className = "news-cats news-shell";
      cats.hidden = true;
      sports.parentNode.insertBefore(cats, sports.nextSibling);
    }
    if (sports) sports.innerHTML = "";
    if (cats) {
      cats.className = "news-cats news-shell";
      cats.hidden = true;
      cats.innerHTML = "";
    }
    void LEGACY_DESK_NAMES;
  }

  function paintFootballNav(activeCat) {
    clearLegacyStrip();
    void activeCat;
  }

  function paintOtherNav(desk, sport) {
    clearLegacyStrip();
    void desk;
    void sport;
  }

  function bindMenu() {
    var btn = document.getElementById("menu-btn");
    var menu = document.getElementById("menu");
    if (btn && menu) {
      btn.addEventListener("click", function () {
        menu.classList.toggle("open");
        var accountMenu = document.getElementById("account-menu");
        var accountBtn = document.getElementById("account-btn");
        if (accountMenu) accountMenu.hidden = true;
        if (accountBtn) accountBtn.setAttribute("aria-expanded", "false");
      });
    }
    var tools = document.querySelector(".ghana-tools");
    var accountBtn = document.getElementById("account-btn");
    if (!accountBtn && tools) {
      var link = tools.querySelector("a.account-link");
      if (link) {
        accountBtn = document.createElement("button");
        accountBtn.className = "account-link";
        accountBtn.type = "button";
        accountBtn.id = "account-btn";
        accountBtn.textContent = "Account";
        link.replaceWith(accountBtn);
      }
    }
    var accountMenu = document.getElementById("account-menu");
    if (!accountMenu && accountBtn) {
      accountMenu = document.createElement("div");
      accountMenu.className = "account-menu";
      accountMenu.id = "account-menu";
      accountMenu.hidden = true;
      accountMenu.innerHTML =
        '<a href="/product/">Product</a><a href="/pricing/">Pricing</a><a href="/login/">Sign in</a><a href="/register/">Create account</a>';
      var header = document.querySelector(".ghana-top");
      if (header) header.appendChild(accountMenu);
    }
    if (accountBtn && accountMenu) {
      accountBtn.addEventListener("click", function (ev) {
        ev.stopPropagation();
        accountMenu.hidden = !accountMenu.hidden;
        accountBtn.setAttribute("aria-expanded", accountMenu.hidden ? "false" : "true");
        if (menu) menu.classList.remove("open");
      });
      document.addEventListener("click", function () {
        accountMenu.hidden = true;
        accountBtn.setAttribute("aria-expanded", "false");
      });
    }
  }

  var _cache = {};

  function getJson(path, fresh) {
    if (!fresh && _cache[path]) return Promise.resolve(_cache[path]);
    var opts = {};
    if (signedIn()) opts.headers = sessionHeaders();
    return fetch(api() + path, opts).then(function (r) {
      return r.json();
    }).then(function (data) {
      if (!fresh) _cache[path] = data;
      return data;
    });
  }

  function rail(title, eyebrow, seeHref, stories) {
    if (!stories.length) return "";
    var html = '<section class="rail"><div class="rail-head"><div>';
    if (eyebrow) html += '<span class="eyebrow">' + esc(eyebrow) + "</span>";
    html += "<h2>" + esc(title) + "</h2></div>";
    if (seeHref) html += '<a class="see-all" href="' + esc(seeHref) + '">See all →</a>';
    html += '</div><div class="rail-track">';
    stories.slice(0, 6).forEach(function (s) {
      html += storyCard(s, "grid");
    });
    html += "</div></section>";
    return html;
  }

  function trendingBlock(rows, title) {
    if (!rows.length) return "";
    var html = '<section class="trending"><h2>' + esc(title || "Trending") + "</h2>";
    rows.slice(0, 8).forEach(function (s, i) {
      html += trendRow(s, i + 1);
    });
    html += '<a class="trend-item" href="/news/trending/"><span class="trend-n">→</span><div><h3>See all trending stories</h3></div></a>';
    html += "</section>";
    return html;
  }

  function followTopicBtn() {
    if (!signedIn()) {
      return '<p class="follow-topic"><a href="/login/?next=' + encodeURIComponent(location.pathname + location.search) + '">Sign in to follow this desk</a></p>';
    }
    return '<p class="follow-topic"><button type="button" class="react-btn" id="follow-topic">Follow this desk</button></p>';
  }

  function bindFollowTopic(desk, sport, category) {
    var btn = document.getElementById("follow-topic");
    if (!btn || !signedIn()) return;
    desk = desk || "";
    category = category || "";
    getJson("/v1/public/news/reader", true).then(function (data) {
      function isOn() {
        return (data.topics || []).some(function (t) {
          return (t.desk || "") === desk && t.sport === sport && (t.category || "") === category;
        });
      }
      function paint() {
        var on = isOn();
        btn.textContent = on ? "Following" : "Follow this desk";
        btn.classList.toggle("on", on);
      }
      paint();
      btn.onclick = function () {
        var on = !isOn();
        fetch(api() + "/v1/public/news/topics", {
          method: "POST",
          headers: sessionHeaders(),
          body: JSON.stringify({ desk: desk, sport: sport, category: category, on: on }),
        })
          .then(function (r) { return r.json(); })
          .then(function (d) {
            if (!d || !d.ok) return;
            data.topics = d.topics || [];
            paint();
          });
      };
    }).catch(function () {});
  }

  function paintStandardList(root, stories, headHtml) {
    var html = headHtml || "";
    if (!stories.length) {
      html += '<p class="dek">Nothing on this desk yet.</p>';
      root.innerHTML = html;
      return;
    }
    html += storyCard(stories[0], "hero");
    var rest = stories.slice(1);
    var grid = rest.slice(0, 2);
    var list = rest.slice(2);
    if (grid.length) {
      html += '<div class="grid-2">';
      grid.forEach(function (s) {
        html += storyCard(s, "grid");
      });
      html += "</div>";
    }
    list.forEach(function (s) {
      html += storyCard(s, "row");
    });
    root.innerHTML = html;
  }

  function sectionHead(eyebrow, title, dek) {
    return (
      '<p class="crumb"><a href="/">News</a><span class="sep">/</span><a href="/news/football/">Football</a><span class="sep">/</span><span class="here">' +
      esc(title) +
      "</span></p>" +
      '<div class="section-head"><span class="eyebrow">' +
      esc(eyebrow) +
      "</span><h1>" +
      esc(title) +
      "</h1><p>" +
      esc(dek) +
      "</p></div>"
    );
  }

  function legend(cat) {
    if (!BADGE_CATS[cat]) return "";
    if (cat === "controversy") {
      return (
        '<div class="status-legend">' +
        '<span><span class="status-badge status-official">Official</span> confirmed</span>' +
        '<span><span class="status-badge status-under-review">Under Review</span> in process</span>' +
        '<span><span class="status-badge status-reported">Reported</span> unconfirmed</span>' +
        '<span><span class="status-badge status-denied">Denied</span> denied</span>' +
        "</div>"
      );
    }
    return (
      '<div class="status-legend">' +
      '<span><span class="status-badge status-official">Official</span> confirmed</span>' +
      '<span><span class="status-badge status-talks">In Talks</span> negotiations ongoing</span>' +
      '<span><span class="status-badge status-reported">Reported</span> single-source, unconfirmed</span>' +
      '<span><span class="status-badge status-rumoured">Rumoured</span> speculation</span>' +
      '<span><span class="status-badge status-denied">Denied</span> denied by club</span>' +
      "</div>"
    );
  }

  function paintHome() {
    var root = document.getElementById("feed");
    if (!root) return;
    paintSportNav("home");
    Promise.all([
      getJson("/v1/public/news/home"),
      signedIn() ? getJson("/v1/public/news/reader", true).catch(function () { return {}; }) : Promise.resolve({}),
    ]).then(function (pack) {
      var data = pack[0] || {};
      var reader = pack[1] || {};
      var live = data.live;
      var feed = data.feed || [];
      var trending = data.trending || [];
      var breaking = data.breaking;
      var all = (live ? [live] : []).concat(feed);
      if (!all.length) {
        root.innerHTML = emptyDesk("WiamArena News", "The latest stories will show here.");
        return;
      }
      if (!trending.length) trending = all.slice(0, 8);
      var topics = reader.topics || [];
      function topicHit(s) {
        return topics.some(function (t) {
          if (t.sport && t.sport !== s.sport) return false;
          if (t.desk && t.desk !== s.desk) return false;
          if (t.category && t.category !== s.category) return false;
          return true;
        });
      }
      if (topics.length) {
        all = all.slice().sort(function (a, b) {
          return (topicHit(b) ? 1 : 0) - (topicHit(a) ? 1 : 0);
        });
        live = all[0];
      }
      var football = all.filter(function (s) { return s.sport === "football"; });
      var local = all.filter(function (s) { return s.desk === "local"; });
      var others = all.filter(function (s) { return s.sport !== "football"; });
      var html = "";
      if (breaking && breaking.slug && isBreaking(breaking) && (!live || breaking.slug !== live.slug)) {
        html +=
          '<a class="breaking-strip" href="' +
          esc(storyHref(breaking.slug)) +
          '"><span>Breaking</span> ' +
          esc(breaking.title) +
          "</a>";
      } else if (breaking && live && breaking.slug === live.slug) {
        html += '<p class="breaking-kicker">Live</p>';
      }
      html += storyCard(live || all[0], "hero");
      var rest = football.filter(function (s) { return live && s.slug === live.slug ? false : true; });
      var grid = rest.slice(0, 2);
      if (grid.length) {
        html += '<div class="grid-2 magazine-support">';
        grid.forEach(function (s) {
          html += storyCard(s, "grid");
        });
        html += "</div>";
      }
      html += rail("Football", "Most coverage", "/news/football/", rest.slice(2));
      html += rail("Local Sports", "Ghana desk", "/news/football/?desk=local", local.filter(function (s) { return s.slug !== (live && live.slug); }));
      html += rail("Around the World", "Other sports", "", others);
      html += trendingBlock(trending);
      root.innerHTML = html;
    }).catch(function () {
      root.innerHTML = emptyDesk("WiamArena News", "Please try again shortly.");
    });
  }

  function paintFootball() {
    var root = document.getElementById("feed");
    if (!root) return;
    paintSportNav("football");
    paintFootballNav("");
    var desk = deskParam();
    var q = "/v1/public/news/feed?sport=football";
    if (desk) q += "&desk=" + encodeURIComponent(desk);
    getJson(q).then(function (data) {
      var stories = data.stories || [];
      if (desk === "local" || desk === "foreign") {
        paintDesk(root, desk, "football", stories);
        bindFollowTopic(desk, "football", "");
        return;
      }
      if (!stories.length) {
        root.innerHTML = emptyDesk("Football", "Nothing on this desk yet.");
        return;
      }
      var html = followTopicBtn() + storyCard(stories[0], "hero");
      CATS.forEach(function (row) {
        var slice = stories.filter(function (s) { return s.category === row[0]; }).slice(0, 4);
        html += rail(row[1], "", catHref(row[0]), slice);
      });
      getJson("/v1/public/news/trending").then(function (pack) {
        html += trendingBlock(pack.stories || [], "Trending in Football");
        root.innerHTML = html;
        bindFollowTopic(desk, "football", "");
      }).catch(function () {
        root.innerHTML = html;
      });
    }).catch(function () {
      root.innerHTML = emptyDesk("Football", "Please try again shortly.");
    });
  }

  function paintCategory(cat) {
    var root = document.getElementById("feed");
    if (!root) return;
    paintSportNav("category");
    paintFootballNav(cat);
    var title = catLabel(cat);
    var head = sectionHead("Football", title, CAT_DEK[cat] || "") + legend(cat) + followTopicBtn();
    var desk = deskParam();
    var q = "/v1/public/news/feed?sport=football&category=" + encodeURIComponent(cat);
    if (desk) q += "&desk=" + encodeURIComponent(desk);
    getJson(q).then(function (data) {
      var stories = data.stories || [];
      if (cat === "live") {
        getJson("/v1/public/scores/live", true).then(function (live) {
          var matches = (live && live.matches) || [];
          var html = head;
          html += "<h2>Matches in play</h2>";
          if (!matches.length) {
            html += '<p class="dek">No matches in play right now. When a fixture kicks off, it shows here automatically.</p>';
          }
          matches.forEach(function (m) {
            html +=
              '<a class="match-row is-live" href="/scores/' + esc(m.slug || "") + '/">' +
              '<div class="clubs">' +
              '<div class="club-line"><span class="name">' +
              (m.home_crest ? '<img class="crest" src="' + esc(m.home_crest) + '" alt="">' : "") +
              "<span>" + esc(m.home) + "</span></span>" +
              (m.home_score == null ? "" : '<span class="score">' + esc(String(m.home_score)) + "</span>") +
              "</div>" +
              '<div class="club-line"><span class="name">' +
              (m.away_crest ? '<img class="crest" src="' + esc(m.away_crest) + '" alt="">' : "") +
              "<span>" + esc(m.away) + "</span></span>" +
              (m.away_score == null ? "" : '<span class="score">' + esc(String(m.away_score)) + "</span>") +
              "</div></div>" +
              '<div class="kickoff">LIVE</div></a>';
          });
          html += "<h2>Live coverage</h2>";
          if (!stories.length) html += '<p class="dek">No live reports filed yet.</p>';
          stories.forEach(function (s) {
            html +=
              '<a class="live-row" href="' + esc(storyHref(s.slug)) + '">' +
              '<span class="live-pill live-now">Live</span><div><h3>' +
              esc(s.title) +
              "</h3>" +
              meta(s) +
              "</div></a>";
          });
          root.innerHTML = html;
          bindFollowTopic(desk, "football", cat);
        }).catch(function () {
          root.innerHTML = emptyDesk(title, "Please try again shortly.");
        });
        return;
      }
      if (cat === "rankings") {
        var html = head;
        if (!stories.length) html += '<p class="dek">Nothing on this desk yet.</p>';
        stories.forEach(function (s, i) {
          html +=
            '<a class="list-item" href="' + esc(storyHref(s.slug)) + '">' +
            '<span class="list-n">' +
            (i + 1) +
            "</span><div><h3>" +
            esc(s.title) +
            "</h3>" +
            meta(s) +
            "</div></a>";
        });
        root.innerHTML = html;
        bindFollowTopic(desk, "football", cat);
        return;
      }
      if (cat === "interviews") {
        var html = head;
        if (!stories.length) html += '<p class="dek">Nothing on this desk yet.</p>';
        stories.forEach(function (s, i) {
          html +=
            '<a class="feature-card' + (i === 0 ? " feature-lead" : "") + '" href="' + esc(storyHref(s.slug)) + '">' +
            '<div class="feature-frame">' +
            pic(s) +
            '</div><div class="feature-body"><h3>' +
            esc(s.title) +
            "</h3>" +
            meta(s) +
            "</div></a>";
        });
        root.innerHTML = html;
        bindFollowTopic(desk, "football", cat);
        return;
      }
      paintStandardList(root, stories, head);
      bindFollowTopic(desk, "football", cat);
    }).catch(function () {
      root.innerHTML = emptyDesk(title, "Please try again shortly.");
    });
  }

  var TOP_LEAGUES = [
    ["premier-league", "Premier League"],
    ["la-liga", "La Liga"],
    ["champions-league", "Champions League"],
    ["serie-a", "Serie A"],
    ["bundesliga", "Bundesliga"],
  ];

  function deskBanner(desk) {
    if (desk === "local") {
      return (
        '<header class="desk-banner ghana">' +
        '<p class="flag-star" aria-hidden="true">★</p>' +
        "<div><h1>Ghana Sports</h1><p>Local teams. Local stories. Our game.</p></div></header>"
      );
    }
    return (
      '<header class="desk-banner international">' +
      "<div><h1>International Sports</h1><p>Global games. Big stories. All in one place.</p></div></header>"
    );
  }

  function deskChips(desk, active) {
    var tabs = [["all", "All"]].concat(SPORTS, [["wrestling", "Wrestling"]]);
    var html = '<nav class="desk-chips" aria-label="Sports">';
    tabs.forEach(function (row) {
      html +=
        '<a href="' +
        href(desk, row[0]) +
        '"' +
        (row[0] === active ? ' class="on"' : "") +
        ">" +
        esc(row[1]) +
        "</a>";
    });
    html += "</nav>";
    return html;
  }

  function deskSubs(desk, sport, activeCat) {
    var rows = SUBDESKS[sport];
    if (!rows || sport === "all") return "";
    var html = '<nav class="desk-subs" aria-label="Desks">';
    rows.forEach(function (row) {
      html +=
        '<a href="' +
        href(desk, sport) +
        "?category=" +
        encodeURIComponent(row[0]) +
        '"' +
        (row[0] === activeCat ? ' class="on"' : "") +
        ">" +
        esc(row[1]) +
        "</a>";
    });
    html += "</nav>";
    return html;
  }

  function textStory(story) {
    var label = story.category_label || sportLabel(story.sport) || "";
    var copy = story.summary || story.subtitle || "";
    return (
      '<a class="text-story" href="' +
      esc(storyHref(story.slug)) +
      '"><p class="kicker">' +
      esc(label) +
      "</p><h2>" +
      esc(story.title) +
      "</h2>" +
      (copy ? "<p>" + esc(copy) + "</p>" : "") +
      meta(story) +
      "</a>"
    );
  }

  function imageStory(story, lead) {
    var src = photoSrc(story.photo);
    var copy = story.summary || story.subtitle || "";
    return (
      '<a class="' +
      (lead ? "lead-card" : "side-card") +
      (src ? "" : " no-photo") +
      '" href="' +
      esc(storyHref(story.slug)) +
      '">' +
      (src ? '<img src="' + esc(src) + '" alt="">' : "") +
      '<div><p class="kicker">' +
      esc(story.category_label || sportLabel(story.sport) || "") +
      "</p>" +
      (lead ? "<h2>" : "<h3>") +
      esc(story.title) +
      (lead ? "</h2>" : "</h3>") +
      (copy ? "<p>" + esc(copy) + "</p>" : "") +
      meta(story) +
      "</div></a>"
    );
  }

  function leagueLinks() {
    var html = "";
    TOP_LEAGUES.forEach(function (row) {
      html += '<a class="league-link" href="/table/' + esc(row[0]) + '/">' + esc(row[1]) + "</a>";
    });
    return html;
  }

  function fillScores(box, matches) {
    if (!box) return;
    if (!matches.length) {
      box.innerHTML = '<p class="desk-empty">No scores in yet.</p>';
      return;
    }
    var html = "";
    matches.slice(0, 5).forEach(function (m) {
      var hrefScore = m.slug ? "/scores/" + esc(m.slug) + "/" : "/scores/";
      html +=
        '<a class="score-line" href="' +
        hrefScore +
        '"><span>' +
        esc(m.home || "") +
        "</span><b>" +
        (m.home_score == null ? "–" : esc(String(m.home_score))) +
        "</b><span>" +
        esc(m.away || "") +
        "</span><b>" +
        (m.away_score == null ? "–" : esc(String(m.away_score))) +
        "</b><em>" +
        esc(m.status || "") +
        "</em></a>";
    });
    box.innerHTML = html;
  }

  function paintDesk(root, desk, sport, stories, activeCat) {
    var ghana = desk === "local";
    var main = "";
    var shown = stories;
    if (activeCat) {
      shown = stories.filter(function (s) {
        return (s.category || "") === activeCat;
      });
    }
    main = breakingStrip(shown);
    if (!shown.length) {
      main += '<p class="dek">No stories here yet.</p>';
    } else if (ghana) {
      shown.forEach(function (s) {
        main += textStory(s);
      });
    } else {
      main += imageStory(shown[0], true);
      shown.slice(1).forEach(function (s) {
        main += imageStory(s, false);
      });
    }
    main += '<section class="desk-panel desk-trend"><h2>Trending</h2><div id="desk-trending"></div></section>';
    var popular = "";
    stories.slice(0, 5).forEach(function (s) {
      popular +=
        '<a class="popular-line" href="' +
        esc(storyHref(s.slug)) +
        '"><strong>' +
        esc(s.title) +
        "</strong>" +
        meta(s) +
        "</a>";
    });
    if (!popular) popular = '<p class="desk-empty">Stories will show here as they are filed.</p>';
    var side = ghana
      ? '<section class="desk-panel"><div class="panel-head"><h2>Latest scores</h2><a href="/scores/">View all</a></div><div id="desk-scores"></div></section>' +
        '<section class="desk-panel"><div class="panel-head"><h2>Ghana Premier League</h2><a href="/table/">View all</a></div><p class="desk-empty">The table shows here when that competition is on the board.</p></section>' +
        '<section class="desk-panel"><h2>Quick links</h2><a class="league-link" href="/scores/">Match results</a><a class="league-link" href="/scores/">Fixtures</a><a class="league-link" href="/table/">League table</a></section>'
      : '<section class="desk-panel"><div class="panel-head"><h2>Live scores</h2><a href="/scores/">View all</a></div><div id="desk-scores"></div></section>' +
        '<section class="desk-panel"><div class="panel-head"><h2>Top leagues</h2><a href="/table/">View all</a></div>' +
        leagueLinks() +
        "</section>" +
        '<section class="desk-panel"><h2>Popular</h2>' +
        popular +
        "</section>";
    var brand = ghana
      ? '<aside class="ghana-brand"><img src="/logo.png" alt=""><div><strong>WiamArena</strong><p>Your Home for Ghana Sports</p></div></aside>'
      : '<aside class="ghana-brand"><img src="/logo.png" alt=""><div><strong>WiamArena</strong><p>Global games. Big stories. All in one place.</p></div></aside>';
    root.innerHTML =
      deskBanner(desk) +
      '<div class="desk-wrap">' +
      deskChips(desk, sport) +
      deskSubs(desk, sport, activeCat || "") +
      followTopicBtn() +
      '<div class="desk-layout"><div class="desk-main">' +
      main +
      brand +
      '</div><aside class="desk-side">' +
      side +
      "</aside></div></div>";
    var current = root.querySelector(".desk-chips a.on, .desk-subs a.on");
    if (current && current.scrollIntoView) current.scrollIntoView({ inline: "center", block: "nearest" });
    getJson("/v1/public/scores/live", true)
      .then(function (live) {
        fillScores(document.getElementById("desk-scores"), (live && live.matches) || []);
      })
      .catch(function () {
        var box = document.getElementById("desk-scores");
        if (box) box.innerHTML = '<p class="desk-empty">Scores are not available right now.</p>';
      });
    getJson("/v1/public/news/trending?limit=5")
      .then(function (data) {
        var box = document.getElementById("desk-trending");
        if (!box) return;
        var rows = (data && data.stories) || [];
        if (!rows.length) {
          box.innerHTML = '<p class="desk-empty">Nothing is trending yet.</p>';
          return;
        }
        var html = "";
        rows.forEach(function (s) {
          html +=
            '<a class="popular-line" href="' +
            esc(storyHref(s.slug)) +
            '"><strong>' +
            esc(s.title) +
            "</strong></a>";
        });
        box.innerHTML = html;
      })
      .catch(function () {
        var box = document.getElementById("desk-trending");
        if (box) box.innerHTML = '<p class="desk-empty">Nothing is trending yet.</p>';
      });
  }

  function paintFeed() {
    var root = document.getElementById("feed");
    if (!root) return;
    var p = parsePath();
    paintSportNav(p.sport);
    paintOtherNav(p.desk, p.sport);
    var title = (p.desk === "local" ? "Ghana Sports" : "International Sports") + " · " + sportLabel(p.sport);
    var cat = new URLSearchParams(location.search).get("category") || "";
    if (p.sport === "wrestling") {
      paintDesk(root, p.desk, p.sport, [], cat);
      return;
    }
    var loads = p.sport === "all" ? SPORTS.map(function (row) { return row[0]; }) : [p.sport];
    Promise.all(loads.map(function (sport) {
      var q = "/v1/public/news/feed?desk=" + encodeURIComponent(p.desk) + "&sport=" + encodeURIComponent(sport);
      if (cat && sport === "football") q += "&category=" + encodeURIComponent(cat);
      return getJson(q).then(function (data) { return (data && data.stories) || []; });
    })).then(function (groups) {
      var stories = [];
      groups.forEach(function (rows) { stories = stories.concat(rows); });
      paintDesk(root, p.desk, p.sport, stories, cat);
      if (p.sport !== "all") bindFollowTopic(p.desk, p.sport, cat);
    }).catch(function () {
      root.innerHTML = emptyDesk(title, "Please try again shortly.");
    });
  }

  function paintTrending() {
    var root = document.getElementById("feed");
    if (!root) return;
    paintSportNav("trending");
    getJson("/v1/public/news/trending?limit=20").then(function (data) {
      var rows = data.stories || [];
      var html =
        '<p class="crumb"><a href="/">News</a><span class="sep">/</span><span class="here">Trending</span></p>' +
        '<div class="section-head"><span class="eyebrow">Right Now</span><h1>Trending</h1>' +
        "<p>The most-read stories across every sport we cover.</p></div>";
      if (!rows.length) html += '<p class="dek">Nothing on this desk yet.</p>';
      rows.forEach(function (s, i) {
        html += trendRow(s, i + 1);
      });
      root.innerHTML = html;
    }).catch(function () {
      root.innerHTML = emptyDesk("Trending", "Please try again shortly.");
    });
  }

  function renderBody(body, insertHtml) {
    var chunks = String(body || "").trim().split(/\n{2,}/);
    var blocks = [];
    chunks.forEach(function (chunk) {
      var m = chunk.match(/^##\s+(.+)\n?([\s\S]*)$/);
      if (m) {
        blocks.push("<h2>" + esc(m[1].trim()) + "</h2>");
        if (m[2].trim()) blocks.push('<p class="body">' + esc(m[2].trim()).replace(/\n/g, "<br>") + "</p>");
      } else if (chunk.trim()) {
        blocks.push('<p class="body">' + esc(chunk.trim()).replace(/\n/g, "<br>") + "</p>");
      }
    });
    if (!blocks.length) blocks.push('<p class="body"></p>');
    var html = "";
    var mid = Math.max(1, Math.floor(blocks.length / 2));
    blocks.forEach(function (block, i) {
      html += block;
      if (i === mid - 1) {
        html += '<span id="read-mark" class="read-mark" aria-hidden="true"></span>';
        if (insertHtml) html += insertHtml;
      }
    });
    return html;
  }

  function inlineTrend(story) {
    if (!story) return "";
    var src = photoSrc(story.photo);
    return (
      '<a class="inline-story" href="' +
      esc(storyHref(story.slug)) +
      '">' +
      (src ? '<img src="' + esc(src) + '" alt="">' : "") +
      '<span><span class="inline-kicker">Trending</span><span class="inline-title">' +
      esc(story.title) +
      "</span></span></a>"
    );
  }

  function photoFile(src) {
    if (!src) return Promise.resolve(null);
    return fetch(src).then(function (r) {
      return r.blob();
    }).then(function (blob) {
      var type = blob.type || "image/jpeg";
      var name = type.indexOf("png") >= 0 ? "photo.png" : "photo.jpg";
      return new File([blob], name, { type: type });
    }).catch(function () {
      return null;
    });
  }

  function bindStoryShare(story, img) {
    var url = location.href;
    var title = story.title || "";
    function mark(el, label) {
      if (el) el.textContent = label;
    }
    function shareBoth() {
      return photoFile(img).then(function (file) {
        var payload = { title: title, text: title + "\n" + url, url: url };
        if (file && navigator.canShare) {
          try {
            if (navigator.canShare({ files: [file] })) payload.files = [file];
          } catch (e) {}
        }
        if (navigator.share) return navigator.share(payload);
        if (payload.files && navigator.clipboard && window.ClipboardItem) {
          var items = { "text/plain": new Blob([url], { type: "text/plain" }) };
          items[file.type] = file;
          return navigator.clipboard.write([new ClipboardItem(items)]);
        }
        if (navigator.clipboard) return navigator.clipboard.writeText(url);
      });
    }
    document.querySelectorAll("#share-native").forEach(function (link) {
      link.addEventListener("click", function (ev) {
        ev.preventDefault();
        shareBoth().catch(function () {
          if (navigator.clipboard) navigator.clipboard.writeText(url);
          mark(link, "Link copied");
        });
      });
    });
    document.querySelectorAll(".copy-link").forEach(function (link) {
      link.addEventListener("click", function (ev) {
        ev.preventDefault();
        shareBoth()
          .then(function () {
            mark(link, "Copied");
          })
          .catch(function () {
            if (navigator.clipboard) navigator.clipboard.writeText(url);
            mark(link, "Link copied");
          });
      });
    });
  }

  function lockViewport() {
    var content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";
    var vp = document.querySelector('meta[name="viewport"]');
    if (vp) vp.setAttribute("content", content);
    else {
      vp = document.createElement("meta");
      vp.setAttribute("name", "viewport");
      vp.setAttribute("content", content);
      document.head.appendChild(vp);
    }
    document.documentElement.style.touchAction = "pan-x pan-y";
    document.body.style.touchAction = "manipulation";
    function blockZoom(ev) {
      if (ev.touches && ev.touches.length > 1) ev.preventDefault();
    }
    document.addEventListener("gesturestart", function (ev) { ev.preventDefault(); }, { passive: false });
    document.addEventListener("touchmove", blockZoom, { passive: false });
  }

  function copyBlocked(node) {
    if (!node || !node.closest) return false;
    if (node.closest("input, textarea, .comments, .share-row, .react-row, .action-bar")) return false;
    return !!node.closest(".story-lock, .article");
  }

  function bindCopyBlock() {
    if (bindCopyBlock.done) return;
    bindCopyBlock.done = true;
    ["copy", "cut", "contextmenu", "selectstart", "dragstart"].forEach(function (evt) {
      document.addEventListener(evt, function (ev) {
        if (copyBlocked(ev.target)) ev.preventDefault();
      });
    });
  }

  var _readOff = null;

  function bindReadTracker(slug, reads) {
    if (_readOff) {
      _readOff();
      _readOff = null;
    }
    var el = document.getElementById("read-count");
    function show(n) {
      var count = Math.max(0, parseInt(n, 10) || 0);
      if (el) el.textContent = count === 1 ? "1 read" : count + " reads";
    }
    show(reads || 0);
    var sent = false;
    var started = Date.now();
    var seenMid = false;
    var mark = document.getElementById("read-mark");
    var obs = null;
    if (mark && window.IntersectionObserver) {
      obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) seenMid = true;
        });
      }, { threshold: 0.35 });
      obs.observe(mark);
    } else {
      seenMid = true;
    }
    function maybe() {
      if (sent) return;
      if (!seenMid) return;
      if (Date.now() - started < 12000) return;
      sent = true;
      fetch(api() + "/v1/public/news/read/" + encodeURIComponent(slug), { method: "POST" })
        .then(function (r) { return r.json(); })
        .then(function (d) { if (d && d.reads != null) show(d.reads); })
        .catch(function () {});
    }
    document.addEventListener("scroll", maybe, { passive: true });
    var tick = setInterval(maybe, 2000);
    _readOff = function () {
      sent = true;
      if (obs) obs.disconnect();
      document.removeEventListener("scroll", maybe);
      clearInterval(tick);
    };
  }

  function pickInline(rows, slug) {
    var pool = (rows || []).filter(function (s) { return s && s.slug && s.slug !== slug; });
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function sessionHeaders() {
    if (window.WiamAuth && window.WiamAuth.headers) return window.WiamAuth.headers();
    var headers = { "Content-Type": "application/json" };
    try {
      var token = localStorage.getItem("wiam_sess") || "";
      if (token) headers["X-Wiam-Session"] = token;
    } catch (e) {}
    return headers;
  }

  function signedIn() {
    if (window.WiamAuth && window.WiamAuth.session) return !!window.WiamAuth.session();
    try { return !!localStorage.getItem("wiam_sess"); } catch (e) { return false; }
  }

  function commentRow(row) {
    var when = row.at ? ago(row.at) : "";
    return (
      '<div class="comment">' +
      "<strong>" + esc(row.name || "Reader") + "</strong>" +
      (when ? '<span class="comment-time">' + esc(when) + "</span>" : "") +
      "<p>" + esc(row.text || "") + "</p>" +
      "</div>"
    );
  }

  function voteButtons(story, login) {
    var likes = story.likes || 0;
    var unlikes = story.unlikes || 0;
    var mine = story.mine || "";
    var saved = !!story.saved;
    return (
      '<div class="action-bar">' +
      '<div class="react-row" id="react-row">' +
      '<button type="button" class="react-btn' + (mine === "like" ? " on" : "") + '" id="btn-like" aria-pressed="' + (mine === "like" ? "true" : "false") + '">Like <span id="like-n">' + likes + "</span></button>" +
      '<button type="button" class="react-btn' + (mine === "unlike" ? " on" : "") + '" id="btn-unlike" aria-pressed="' + (mine === "unlike" ? "true" : "false") + '">Unlike <span id="unlike-n">' + unlikes + "</span></button>" +
      (signedIn()
        ? '<button type="button" class="react-btn' + (saved ? " on" : "") + '" id="btn-save">' + (saved ? "Saved" : "Save") + "</button>"
        : '<a class="react-login" href="' + login + '">Sign in to react</a>') +
      "</div>" +
      '<div class="share-row share-bottom">' +
      '<a href="#" id="share-native">Share this story</a>' +
      '<a class="copy-link" href="#">Copy link</a></div></div>'
    );
  }

  function paintVotes(data) {
    var likeN = document.getElementById("like-n");
    var unlikeN = document.getElementById("unlike-n");
    var likeBtn = document.getElementById("btn-like");
    var unlikeBtn = document.getElementById("btn-unlike");
    if (likeN) likeN.textContent = String(data.likes || 0);
    if (unlikeN) unlikeN.textContent = String(data.unlikes || 0);
    if (likeBtn) {
      likeBtn.classList.toggle("on", data.mine === "like");
      likeBtn.setAttribute("aria-pressed", data.mine === "like" ? "true" : "false");
    }
    if (unlikeBtn) {
      unlikeBtn.classList.toggle("on", data.mine === "unlike");
      unlikeBtn.setAttribute("aria-pressed", data.mine === "unlike" ? "true" : "false");
    }
  }

  function bindReactions(slug, story) {
    paintVotes(story || {});
    function send(vote) {
      if (!signedIn()) {
        location.href = "/login/?next=" + encodeURIComponent(location.pathname + location.search);
        return;
      }
      var next = vote;
      if (story && story.mine === vote) next = "clear";
      fetch(api() + "/v1/public/news/likes/" + encodeURIComponent(slug), {
        method: "POST",
        headers: sessionHeaders(),
        body: JSON.stringify({ vote: next }),
      })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (!d || !d.ok) return;
          if (story) story.mine = d.mine;
          paintVotes(d);
        })
        .catch(function () {});
    }
    var likeBtn = document.getElementById("btn-like");
    var unlikeBtn = document.getElementById("btn-unlike");
    if (likeBtn) likeBtn.addEventListener("click", function () { send("like"); });
    if (unlikeBtn) unlikeBtn.addEventListener("click", function () { send("unlike"); });
    var saveBtn = document.getElementById("btn-save");
    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        if (!signedIn()) {
          location.href = "/login/?next=" + encodeURIComponent(location.pathname + location.search);
          return;
        }
        var on = saveBtn.textContent !== "Saved";
        fetch(api() + "/v1/public/news/saved/" + encodeURIComponent(slug), {
          method: "POST",
          headers: sessionHeaders(),
          body: JSON.stringify({ on: on }),
        })
          .then(function (r) { return r.json(); })
          .then(function (d) {
            if (!d || !d.ok) return;
            saveBtn.textContent = on ? "Saved" : "Save";
            saveBtn.classList.toggle("on", on);
            if (story) story.saved = on;
          })
          .catch(function () {});
      });
    }
  }

  function bindComments(slug) {
    var list = document.getElementById("comment-list");
    var form = document.getElementById("comment-form");
    var note = document.getElementById("comment-note");
    function paint(rows) {
      if (!list) return;
      if (!rows || !rows.length) {
        list.innerHTML = '<p class="comment-empty">No comments yet.</p>';
        return;
      }
      list.innerHTML = rows.map(commentRow).join("");
    }
    getJson("/v1/public/news/comments/" + encodeURIComponent(slug), true).then(function (data) {
      paint(data.comments || []);
    }).catch(function () {});
    if (!form) return;
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (!signedIn()) {
        location.href = "/login/?next=" + encodeURIComponent(location.pathname + location.search);
        return;
      }
      var field = document.getElementById("comment-text");
      var text = field ? String(field.value || "").trim() : "";
      if (text.length < 2) {
        if (note) note.textContent = "Write a short comment first.";
        return;
      }
      fetch(api() + "/v1/public/news/comments/" + encodeURIComponent(slug), {
        method: "POST",
        headers: sessionHeaders(),
        body: JSON.stringify({ text: text }),
      })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (pack) {
          if (!pack.ok) {
            if (note) note.textContent = (pack.d && pack.d.message) || "Could not post.";
            return;
          }
          if (field) field.value = "";
          if (note) note.textContent = "";
          getJson("/v1/public/news/comments/" + encodeURIComponent(slug), true).then(function (data) {
            paint(data.comments || []);
          });
        })
        .catch(function () {
          if (note) note.textContent = "Could not post.";
        });
    });
  }

  function regionName(story) {
    return story.desk === "local" ? "Ghana" : "International";
  }

  function regionHref(story) {
    return story.desk === "local" ? "/news/local/" : "/news/foreign/";
  }

  function sportCrumb(story) {
    if (story.sport === "football") {
      if (story.desk === "local") return { href: "/news/local/football/", label: "Football" };
      if (story.desk === "foreign") return { href: "/news/foreign/football/", label: "Football" };
      return { href: "/news/football/", label: "Football" };
    }
    return { href: href(story.desk || "foreign", story.sport), label: story.sport_label || "Sport" };
  }

  function breakingFresh(story) {
    var t = Date.parse(story && story.published_at || "");
    if (!t) return true;
    return Date.now() - t < 6 * 60 * 60 * 1000;
  }

  function isBreaking(story) {
    var label = String((story && (story.status_label || story.status)) || "").toLowerCase();
    return label.indexOf("break") >= 0 && breakingFresh(story);
  }

  function breakingStrip(stories) {
    var row = null;
    (stories || []).forEach(function (story) {
      if (!row && isBreaking(story)) row = story;
    });
    if (!row) return "";
    return '<a class="breaking-strip" href="' + esc(storyHref(row.slug)) + '"><span>Breaking</span> ' + esc(row.title) + "</a>";
  }

  function breakingMark(story) {
    if (!isBreaking(story)) return "";
    return '<span class="breaking-badge">Breaking</span>';
  }

  function sourcesBox(story) {
    var rows = story.sources || [];
    var line = rows.length
      ? "This story was checked before it was published."
      : "Sources appear here once they are confirmed.";
    return '<section class="sources"><h2>Sources</h2><p>' + line + "</p></section>";
  }

  function storyTags(story) {
    if (story.tags && story.tags.length) return story.tags;
    var tags = [];
    if (story.category_label) {
      var slug = String(story.category_label).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      if (slug) tags.push({ type: "topic", label: story.category_label, slug: slug });
    }
    return tags;
  }

  function tagsBox(story) {
    var tags = storyTags(story);
    if (!tags.length) return "";
    var html = '<p class="tag-row">';
    tags.forEach(function (tag) {
      var slug = tag.slug || "";
      if (!slug) return;
      html += '<a class="tag-chip" href="/news/tag/?t=' + encodeURIComponent(slug) + '">' + esc(tag.label || slug) + "</a>";
    });
    return html + "</p>";
  }

  function paintTag() {
    var root = document.getElementById("article") || document.getElementById("feed");
    if (!root) return;
    paintSportNav("");
    showMode("story");
    var slug = String(new URLSearchParams(location.search).get("t") || "").toLowerCase();
    if (!slug) {
      root.innerHTML = emptyDesk("Tags", "Choose a tag from a story.");
      return;
    }
    getJson("/v1/public/news/feed").then(function (data) {
      var rows = (data.stories || []).filter(function (story) {
        return storyTags(story).some(function (tag) { return String(tag.slug || "") === slug; });
      });
      var label = slug.replace(/-/g, " ");
      if (rows.length) {
        var hit = storyTags(rows[0]).filter(function (tag) { return tag.slug === slug; })[0];
        if (hit && hit.label) label = hit.label;
      }
      document.title = (label || "Tag") + " — WiamArena";
      var html = "<h1>" + esc(label || "Tag") + "</h1>";
      html += '<p class="dek">Stories filed under this tag.</p>';
      if (!rows.length) {
        html += '<p class="dek">No stories with this tag yet.</p>';
      } else {
        rows.forEach(function (story) { html += storyCard(story, "row"); });
      }
      root.innerHTML = html;
    }).catch(function () {
      root.innerHTML = emptyDesk("Tags", "Please try again shortly.");
    });
  }

  function paintStory() {
    var root = document.getElementById("article") || document.getElementById("feed");
    if (!root) return;
    var p = parsePath();
    var slug = p.slug || "";
    Promise.all([
      getJson("/v1/public/news/story/" + encodeURIComponent(slug)),
      getJson("/v1/public/news/trending").catch(function () { return { stories: [] }; }),
    ]).then(function (pack) {
      var data = pack[0];
      var trendPack = pack[1] || {};
      var story = data.story;
      if (!story) {
        root.innerHTML = emptyDesk("Story", "This story is not available.");
        return;
      }
      paintSportNav(story.sport === "football" ? "football" : story.sport);
      if (story.sport === "football") paintFootballNav(story.category || "");
      else paintOtherNav(story.desk, story.sport);
      var sportBit = sportCrumb(story);
      var crumb = '<p class="crumb"><a href="' + regionHref(story) + '">' + esc(regionName(story)) + "</a>";
      crumb += '<span class="sep">/</span><a href="' + sportBit.href + '">' + esc(sportBit.label) + "</a>";
      if (story.sport === "football" && story.category && story.category_label) {
        crumb += '<span class="sep">/</span><a href="' + catHref(story.category) + '">' + esc(story.category_label) + "</a>";
      }
      crumb += "</p>";
      var img = photoSrc(story.photo);
      var related = (data.related || []).filter(function (row) { return row.slug !== story.slug; }).slice(0, 4);
      var share = location.href;
      var mid = pickInline(trendPack.stories || [], story.slug);
      var login = "/login/?next=" + encodeURIComponent(location.pathname + location.search);
      document.title = (story.title || "Story") + " — WiamArena";
      var desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute("content", (story.subtitle || story.summary || story.title || "").slice(0, 160));
      var canon = document.querySelector('link[rel="canonical"]');
      if (!canon) {
        canon = document.createElement("link");
        canon.rel = "canonical";
        document.head.appendChild(canon);
      }
      canon.href = "https://wiamarena.com" + storyHref(story.slug);
      root.innerHTML =
        crumb +
        '<p class="story-chips">' + breakingMark(story) +
        (story.category_label ? '<span class="hero-kicker">' + esc(story.category_label) + "</span>" : "") +
        "</p>" +
        "<h1>" + esc(story.title) + "</h1>" +
        (story.subtitle || story.summary ? '<p class="dek">' + esc(story.subtitle || story.summary) + "</p>" : "") +
        '<p class="share-row"><a href="#" id="share-native">Share this story</a>' +
        '<a class="copy-link" id="copy-link" href="#">Copy link</a></p>' +
        (img ? '<div class="frame"><img src="' + esc(img) + '" alt=""></div>' : "") +
        '<div class="byline"><p class="who">WiamArena Newsroom</p>' +
        (story.published_display ? '<p class="when">' + esc(story.published_display) + "</p>" : "") +
        (story.updated_display ? '<p class="when">Updated ' + esc(story.updated_display) + "</p>" : "") +
        "</div>" +
        '<div class="story-lock">' + renderBody(story.body, inlineTrend(mid)) + "</div>" +
        sourcesBox(story) +
        tagsBox(story) +
        voteButtons(story, login) +
        '<p class="read-count" id="read-count"></p>' +
        '<section class="comments" id="comments">' +
        "<h2>Comments</h2>" +
        '<div id="comment-list"></div>' +
        (signedIn()
          ? '<form id="comment-form"><textarea id="comment-text" maxlength="400" placeholder="Write a comment" rows="3"></textarea><button type="submit">Post</button></form><p class="comment-note" id="comment-note"></p>'
          : '<p class="comment-login"><a href="' + login + '">Sign in to comment</a></p>') +
        "</section>" +
        '<div id="story-related"></div>' +
        '<div id="story-trending"></div>' +
        '</div><aside class="story-side" id="story-side">' +
        "<h2>Live scores</h2><div id=\"story-live\"><p>Loading scores…</p></div>" +
        "<h2>Table</h2><p>The table for a competition opens on its own page.</p><p><a href=\"/table/\">Tables</a></p>" +
        "<h2>Popular</h2><div id=\"story-popular\"></div>" +
        "</aside></div>";
      root.innerHTML = '<div class="story-layout"><div class="story-main">' + root.innerHTML;
      bindStoryShare(story, img);
      bindReadTracker(story.slug, story.reads);
      bindReactions(story.slug, story);
      bindComments(story.slug);
      showMode("story");
      var relBox = document.getElementById("story-related");
      if (relBox && related.length) {
        var relHtml = '<section class="related"><h2>More like this</h2>';
        related.forEach(function (s) { relHtml += storyCard(s, "row"); });
        relHtml += "</section>";
        relBox.innerHTML = relHtml;
      }
      var rows = (trendPack.stories || []).filter(function (s) { return s.slug !== story.slug; });
      var box = document.getElementById("story-trending");
      if (box && rows.length) {
        var html = '<section class="trending"><h2>Trending</h2>';
        rows.forEach(function (s, i) { html += trendRow(s, i + 1); });
        html += "</section>";
        box.innerHTML = html;
      }
      var popular = document.getElementById("story-popular");
      if (popular) {
        if (!rows.length) {
          popular.innerHTML = "<p>Popular stories show here from real reading.</p>";
        } else {
          var pop = "";
          rows.slice(0, 4).forEach(function (s) {
            pop += '<p><a href="' + esc(storyHref(s.slug)) + '">' + esc(s.title) + "</a></p>";
          });
          popular.innerHTML = pop;
        }
      }
      getJson("/v1/public/scores/live", true).then(function (live) {
        var liveBox = document.getElementById("story-live");
        if (!liveBox) return;
        var matches = (live && live.matches) || [];
        if (!matches.length) {
          liveBox.innerHTML = "<p>No matches live right now.</p>";
          return;
        }
        var list = "";
        matches.slice(0, 4).forEach(function (m) {
          list += "<p>" + esc(m.home || "") + " " + esc(m.home_score == null ? "" : m.home_score) + " – " + esc(m.away_score == null ? "" : m.away_score) + " " + esc(m.away || "") + "</p>";
        });
        liveBox.innerHTML = list;
      }).catch(function () {
        var liveBox = document.getElementById("story-live");
        if (liveBox) liveBox.innerHTML = "<p>Scores are not available right now.</p>";
      });
    }).catch(function () {
      root.innerHTML = emptyDesk("Story", "Please try again shortly.");
    });
  }

  function paintSearch() {
    var root = document.getElementById("feed") || document.getElementById("article");
    if (!root) return;
    paintSportNav("home");
    var q = new URLSearchParams(location.search).get("q") || "";
    if (q.length < 2) {
      root.innerHTML = emptyDesk("Search", "Type at least two letters.");
      return;
    }
    getJson("/v1/public/news/search?q=" + encodeURIComponent(q)).then(function (data) {
      var rows = data.stories || [];
      if (!rows.length) {
        root.innerHTML = emptyDesk("Search", "No stories matched that search.");
        return;
      }
      var html = "<h1>Search</h1>";
      rows.forEach(function (s) { html += storyCard(s, "row"); });
      root.innerHTML = html;
    }).catch(function () {
      root.innerHTML = emptyDesk("Search", "Please try again shortly.");
    });
  }

  function isBoardPath(path) {
    return /^\/(scores|table|odds|follow|live|goals|match)(\/|$)/.test(path || "/");
  }

  function markBoards() {
    var path = (location.pathname || "/").replace(/\/+$/, "") || "/";
    document.querySelectorAll(".news-boards a").forEach(function (a) {
      var href = (a.getAttribute("href") || "").replace(/\/+$/, "") || "/";
      var on = href === "/" || href === "/news" ? path === "/" || path === "/news" : path.indexOf(href) === 0;
      a.classList.toggle("active", on);
    });
  }

  function ensureBoards() {
    if (document.querySelector(".news-boards")) {
      markBoards();
      return;
    }
    var bar = document.querySelector(".news-brandbar");
    if (!bar) return;
    var nav = document.createElement("nav");
    nav.className = "news-boards news-shell";
    nav.setAttribute("aria-label", "News home and boards");
    nav.innerHTML =
      '<a href="/">Home</a>' +
      '<a href="/scores/">Scores</a>' +
      '<a href="/table/">Table</a>' +
      '<a href="/odds/">Odds</a>' +
      '<a href="/follow/">Follow</a>';
    bar.after(nav);
    markBoards();
  }

  function ensureShell() {
    ensureBoards();
    if (!document.getElementById("boards-css")) {
      var link = document.createElement("link");
      link.id = "boards-css";
      link.rel = "stylesheet";
      link.href = "/boards.css?v=57";
      document.head.appendChild(link);
    }
    var head = document.querySelector("header.news-top");
    var feed = document.getElementById("feed");
    if (!feed) {
      feed = document.createElement("main");
      feed.id = "feed";
      feed.className = "news-feed";
      if (head && head.parentNode) head.parentNode.insertBefore(feed, head.nextSibling);
      else document.body.appendChild(feed);
    }
    var article = document.getElementById("article");
    if (!article) {
      article = document.createElement("article");
      article.id = "article";
      article.className = "article";
      feed.parentNode.insertBefore(article, feed.nextSibling);
    }
    var board = document.getElementById("board");
    if (!board) {
      board = document.createElement("main");
      board.id = "board";
      board.className = "news-feed news-board";
      article.parentNode.insertBefore(board, article.nextSibling);
    }
  }

  function showMode(mode) {
    var feed = document.getElementById("feed");
    var article = document.getElementById("article");
    var board = document.getElementById("board");
    if (feed) feed.hidden = mode !== "feed";
    if (article) article.hidden = mode !== "story";
    if (board) board.hidden = mode !== "board";
  }

  function loadBoard() {
    showMode("board");
    function run() {
      if (window.WiamBoard && window.WiamBoard.paint) window.WiamBoard.paint();
    }
    if (window.WiamBoard) {
      run();
      return;
    }
    var existing = document.querySelector('script[src*="board.js"]');
    if (existing) {
      existing.addEventListener("load", run);
      setTimeout(run, 40);
      return;
    }
    var s = document.createElement("script");
        s.src = "/scores/board.js?v=57";
    s.onload = run;
    document.body.appendChild(s);
  }

  function route() {
    ensureShell();
    markBoards();
    if (isBoardPath(location.pathname || "/")) {
      paintGhanaBar("");
      loadBoard();
      return;
    }
    var p = parsePath();
    if (p.mode === "redirect") {
      history.replaceState({}, "", p.to);
      p = parsePath();
    }
    if (p.mode === "none") return;
    if (p.mode === "story") {
      paintStory();
      return;
    }
    if (p.mode === "tag") {
      paintTag();
      return;
    }
    showMode("feed");
    if (p.mode === "feed") paintFeed();
    else if (p.mode === "search") paintSearch();
    else if (p.mode === "trending") paintTrending();
    else if (p.mode === "football") paintFootball();
    else if (p.mode === "category") paintCategory(p.category);
    else paintHome();
  }

  function go(href, push) {
    var url = new URL(href, location.origin);
    if (push) history.pushState({}, "", url.pathname + url.search);
    route();
  }

  function bindSpa() {
    if (bindSpa.done) return;
    bindSpa.done = true;
    document.addEventListener("click", function (ev) {
      if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
      var a = ev.target.closest("a");
      if (!a) return;
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#" || a.getAttribute("target") === "_blank") return;
      var url;
      try {
        url = new URL(href, location.origin);
      } catch (e) {
        return;
      }
      if (url.origin !== location.origin) return;
      if (/^\/news\/(local|foreign)(\/|$)/.test(url.pathname)) return;
      if (!/^\/$|^\/(news|search|scores|table|odds|follow)(\/|$)/.test(url.pathname)) return;
      ev.preventDefault();
      go(url.pathname + url.search, true);
    });
    document.addEventListener("submit", function (ev) {
      var form = ev.target;
      if (!form || (form.method && form.method.toLowerCase() !== "get")) return;
      var action = form.getAttribute("action") || "";
      if (action.indexOf("/news/search") !== 0 && action.indexOf("/search") !== 0) return;
      ev.preventDefault();
      var field = form.querySelector("[name=q]");
      var q = field ? field.value || "" : "";
      go("/news/search/?q=" + encodeURIComponent(q), true);
    });
    window.addEventListener("popstate", function () {
      route();
    });
  }

  function boot() {
    lockViewport();
    bindCopyBlock();
    bindMenu();
    bindSpa();
    route();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  return { parsePath: parsePath, href: href, go: go };
})();
