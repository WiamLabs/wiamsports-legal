/* WiamSports News v2 — live desk. Stories come from Studio, not sample copy. */
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
    live: "Minute-by-minute coverage while it is happening.",
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

  function sportLabel(id) {
    for (var i = 0; i < SPORTS.length; i++) if (SPORTS[i][0] === id) return SPORTS[i][1];
    return id || "";
  }

  function parsePath() {
    var p = (location.pathname || "/").replace(/\/+$/, "") || "/";
    var parts = p.split("/").filter(Boolean);
    if (parts[0] === "news" && parts[1] === "story" && parts[2]) {
      return { mode: "story", slug: decodeURIComponent(parts[2]) };
    }
    if (parts[0] === "news" && (parts[1] === "foreign" || parts[1] === "local") && parts[2] === "football") {
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
    return { mode: "none" };
  }

  function href(desk, sport) {
    if (sport === "football") return "/news/football/";
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

  function paintSportNav(active) {
    var desks = document.getElementById("desks");
    if (!desks) return;
    var html = '<a href="/news/"' + (active === "home" ? ' class="active"' : "") + ">Home</a>";
    html += '<a href="/news/football/"' + (active === "football" || active === "category" ? ' class="active"' : "") + ">Football</a>";
    OTHER.forEach(function (sid) {
      html += '<a href="' + href("foreign", sid) + '"' + (active === sid ? ' class="active"' : "") + ">" + esc(sportLabel(sid)) + "</a>";
    });
    html += '<a href="/news/trending/"' + (active === "trending" ? ' class="active"' : "") + ">Trending</a>";
    desks.innerHTML = html;
  }

  function deskParam() {
    var desk = new URLSearchParams(location.search).get("desk") || "";
    return desk === "local" || desk === "foreign" ? desk : "";
  }

  function withDesk(href, desk) {
    if (!desk) return href;
    return href + (href.indexOf("?") >= 0 ? "&" : "?") + "desk=" + encodeURIComponent(desk);
  }

  function paintFootballNav(activeCat) {
    var sports = document.getElementById("sports");
    var menu = document.getElementById("menu");
    var desk = deskParam();
    function links(into) {
      if (!into) return;
      var html =
        '<a href="/news/football/"' + (!activeCat && !desk ? ' class="active"' : "") + ">Football Home</a>" +
        '<a href="' + withDesk("/news/football/", "foreign") + '"' + (!activeCat && desk === "foreign" ? ' class="active"' : "") + ">Foreign Sports</a>" +
        '<a href="' + withDesk("/news/football/", "local") + '"' + (!activeCat && desk === "local" ? ' class="active"' : "") + ">Local Sports</a>";
      CATS.forEach(function (row) {
        html +=
          '<a href="' +
          withDesk(catHref(row[0]), desk) +
          '"' +
          (activeCat === row[0] ? ' class="active"' : "") +
          ">" +
          esc(row[1]) +
          "</a>";
      });
      into.innerHTML = html;
    }
    links(sports);
    links(menu);
  }

  function paintOtherNav(desk, sport) {
    var sports = document.getElementById("sports");
    var menu = document.getElementById("menu");
    function links(into) {
      if (!into) return;
      into.innerHTML =
        '<a class="' + (desk === "foreign" ? "active" : "") + '" href="' + href("foreign", sport) + '">Foreign Sports</a>' +
        '<a class="' + (desk === "local" ? "active" : "") + '" href="' + href("local", sport) + '">Local Sports</a>';
    }
    links(sports);
    links(menu);
  }

  function bindMenu() {
    var btn = document.getElementById("menu-btn");
    var menu = document.getElementById("menu");
    if (!btn || !menu) return;
    btn.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function getJson(path) {
    return fetch(api() + path).then(function (r) {
      return r.json();
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
      '<p class="crumb"><a href="/news/">News</a><span class="sep">/</span><a href="/news/football/">Football</a><span class="sep">/</span><span class="here">' +
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
    getJson("/v1/public/news/home").then(function (data) {
      var live = data.live;
      var feed = data.feed || [];
      var trending = data.trending || [];
      var all = (live ? [live] : []).concat(feed);
      if (!all.length) {
        root.innerHTML = emptyDesk("WiamSports News", "The latest stories will show here.");
        return;
      }
      if (!trending.length) trending = all.slice(0, 8);
      var football = all.filter(function (s) { return s.sport === "football"; });
      var others = all.filter(function (s) { return s.sport !== "football"; });
      var html = "";
      if (live) html += storyCard(live, "hero");
      html += rail("Football", "Most Coverage", "/news/football/", football.slice(live && live.sport === "football" ? 1 : 0));
      html += rail("Around the World", "Other Sports", "", others);
      html += trendingBlock(trending);
      root.innerHTML = html;
    }).catch(function () {
      root.innerHTML = emptyDesk("WiamSports News", "Please try again shortly.");
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
      if (!stories.length) {
        root.innerHTML = emptyDesk("Football", "Nothing on this desk yet.");
        return;
      }
      var html = storyCard(stories[0], "hero");
      CATS.forEach(function (row) {
        var slice = stories.filter(function (s) { return s.category === row[0]; }).slice(0, 4);
        html += rail(row[1], "", catHref(row[0]), slice);
      });
      getJson("/v1/public/news/trending").then(function (pack) {
        html += trendingBlock(pack.stories || [], "Trending in Football");
        root.innerHTML = html;
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
    var head = sectionHead("Football", title, CAT_DEK[cat] || "") + legend(cat);
    var desk = deskParam();
    var q = "/v1/public/news/feed?sport=football&category=" + encodeURIComponent(cat);
    if (desk) q += "&desk=" + encodeURIComponent(desk);
    getJson(q).then(function (data) {
      var stories = data.stories || [];
      if (cat === "live") {
        var html = head;
        if (!stories.length) html += '<p class="dek">Nothing on this desk yet.</p>';
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
        return;
      }
      paintStandardList(root, stories, head);
    }).catch(function () {
      root.innerHTML = emptyDesk(title, "Please try again shortly.");
    });
  }

  function paintFeed() {
    var root = document.getElementById("feed");
    if (!root) return;
    var p = parsePath();
    paintSportNav(p.sport);
    paintOtherNav(p.desk, p.sport);
    var title = (p.desk === "local" ? "Local Sports" : "Foreign Sports") + " · " + sportLabel(p.sport);
    getJson("/v1/public/news/feed?desk=" + encodeURIComponent(p.desk) + "&sport=" + encodeURIComponent(p.sport))
      .then(function (data) {
        paintStandardList(root, data.stories || [], "<h1>" + esc(title) + "</h1>");
      })
      .catch(function () {
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
        '<p class="crumb"><a href="/news/">News</a><span class="sep">/</span><span class="here">Trending</span></p>' +
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

  function renderBody(body) {
    var chunks = String(body || "").trim().split(/\n{2,}/);
    var html = "";
    chunks.forEach(function (chunk) {
      var m = chunk.match(/^##\s+(.+)\n?([\s\S]*)$/);
      if (m) {
        html += "<h2>" + esc(m[1].trim()) + "</h2>";
        if (m[2].trim()) html += '<p class="body">' + esc(m[2].trim()).replace(/\n/g, "<br>") + "</p>";
      } else if (chunk.trim()) {
        html += '<p class="body">' + esc(chunk.trim()).replace(/\n/g, "<br>") + "</p>";
      }
    });
    return html || '<p class="body"></p>';
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
    var copyBtn = document.getElementById("copy-link");
    var wa = document.getElementById("share-wa");
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
    if (wa) {
      wa.addEventListener("click", function (ev) {
        if (navigator.share) {
          ev.preventDefault();
          shareBoth().catch(function () {
            location.href = "https://wa.me/?text=" + encodeURIComponent(title + " " + url);
          });
        }
      });
    }
    if (copyBtn) {
      copyBtn.addEventListener("click", function (ev) {
        ev.preventDefault();
        shareBoth()
          .then(function () {
            mark(copyBtn, "Copied");
          })
          .catch(function () {
            if (navigator.clipboard) navigator.clipboard.writeText(url);
            mark(copyBtn, "Link copied");
          });
      });
    }
  }

  function paintStory() {
    var root = document.getElementById("article") || document.getElementById("feed");
    if (!root) return;
    var p = parsePath();
    var slug = p.slug || "";
    getJson("/v1/public/news/story/" + encodeURIComponent(slug)).then(function (data) {
      var story = data.story;
      if (!story) {
        root.innerHTML = emptyDesk("Story", "This story is not available.");
        return;
      }
      paintSportNav(story.sport === "football" ? "football" : story.sport);
      if (story.sport === "football") paintFootballNav(story.category || "");
      else paintOtherNav(story.desk, story.sport);
      var crumb = '<p class="crumb"><a href="/news/">News</a><span class="sep">/</span>';
      if (story.sport === "football") {
        crumb += '<a href="/news/football/">Football</a>';
        if (story.category) crumb += '<span class="sep">/</span><a href="' + catHref(story.category) + '">' + esc(story.category_label) + "</a>";
      } else {
        crumb += '<a href="' + href(story.desk, story.sport) + '">' + esc(story.sport_label) + "</a>";
      }
      crumb += '<span class="sep">/</span><span class="here">' + esc(story.title) + "</span></p>";
      var img = photoSrc(story.photo);
      var share = location.href;
      root.innerHTML =
        crumb +
        badgeHtml(story) +
        '<p class="hero-kicker">' + esc(story.category_label || story.sport_label) + "</p>" +
        "<h1>" + esc(story.title) + "</h1>" +
        '<div class="byline"><p class="who">' + esc(story.byline || "By WiamSports Staff") + "</p>" +
        (story.published_display ? '<p class="when">' + esc(story.published_display) + "</p>" : "") +
        "</div>" +
        (story.subtitle ? '<p class="dek">' + esc(story.subtitle) + "</p>" : "") +
        (img ? '<div class="frame"><img src="' + esc(img) + '" alt=""></div>' : "") +
        renderBody(story.body) +
        '<div class="share-row share-bottom">' +
        '<a id="share-wa" href="https://wa.me/?text=' + encodeURIComponent((story.title || "") + " " + share) + '">WhatsApp</a>' +
        '<a href="#" id="copy-link">Copy link</a></div>' +
        '<div id="story-trending"></div>';
      bindStoryShare(story, img);
      fetch(api() + "/v1/public/news/view/" + encodeURIComponent(story.slug), { method: "POST" }).catch(function () {});
      getJson("/v1/public/news/trending").then(function (pack) {
        var box = document.getElementById("story-trending");
        if (!box) return;
        var rows = (pack.stories || []).filter(function (s) { return s.slug !== story.slug; });
        if (!rows.length) return;
        var html = '<section class="trending"><h2>Trending</h2>';
        rows.forEach(function (s, i) { html += trendRow(s, i + 1); });
        html += "</section>";
        box.innerHTML = html;
      }).catch(function () {});
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

  function boot() {
    bindMenu();
    var p = parsePath();
    if (p.mode === "redirect") {
      location.replace(p.to);
      return;
    }
    if (p.mode === "none") return;
    if (p.mode === "story") paintStory();
    else if (p.mode === "feed") paintFeed();
    else if (p.mode === "search") paintSearch();
    else if (p.mode === "trending") paintTrending();
    else if (p.mode === "football") paintFootball();
    else if (p.mode === "category") paintCategory(p.category);
    else paintHome();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  return { parsePath: parsePath, href: href };
})();
