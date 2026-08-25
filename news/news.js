/* WiamSports News — live desk. Stories come from Studio, not sample copy. */
window.WiamNews = (function () {
  var SPORTS = {
    foreign: [
      ["football", "Football"],
      ["basketball", "Basketball"],
      ["tennis", "Tennis"],
      ["athletics", "Athletics"],
      ["boxing", "Boxing"],
    ],
    local: [
      ["football", "Football"],
      ["basketball", "Basketball"],
      ["tennis", "Tennis"],
      ["athletics", "Athletics"],
      ["boxing", "Boxing"],
    ],
  };

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

  function parsePath() {
    var p = (location.pathname || "/").replace(/\/+$/, "") || "/";
    var parts = p.split("/").filter(Boolean);
    if (parts[0] === "news" && parts[1] === "story" && parts[2]) {
      return { mode: "story", slug: decodeURIComponent(parts[2]) };
    }
    if (parts[0] === "news" && parts[1] && parts[2]) {
      var desk = parts[1] === "local" ? "local" : "foreign";
      var allowed = SPORTS[desk].map(function (row) { return row[0]; });
      var sport = allowed.indexOf(parts[2]) >= 0 ? parts[2] : "football";
      return { mode: "feed", desk: desk, sport: sport };
    }
    if (parts[0] === "search" || (parts[0] === "news" && parts[1] === "search")) {
      return { mode: "search", q: new URLSearchParams(location.search).get("q") || "" };
    }
    if (parts[0] === "news") return { mode: "home" };
    return { mode: "none" };
  }

  function href(desk, sport) {
    return "/news/" + desk + "/" + sport + "/";
  }

  function storyHref(slug) {
    return "/news/story/" + encodeURIComponent(slug) + "/";
  }

  function sportLabel(desk, sport) {
    var rows = SPORTS[desk] || [];
    for (var i = 0; i < rows.length; i++) {
      if (rows[i][0] === sport) return rows[i][1];
    }
    return sport;
  }

  function meta(story, live) {
    var mark = live ? '<span class="cat">Live</span> · ' : "";
    return (
      '<p class="meta-line">' +
      mark +
      '<span class="cat">' +
      esc(story.sport_label || sportLabel(story.desk, story.sport)) +
      "</span> · " +
      esc(ago(story.published_at)) +
      "</p>"
    );
  }

  function storyCard(story, kind, live) {
    var img = photoSrc(story.photo);
    var pic = img
      ? '<img src="' + esc(img) + '" alt="">'
      : '<div class="thumb-empty"></div>';
    if (kind === "hero") {
      return (
        '<a class="hero" href="' + esc(storyHref(story.slug)) + '">' +
        '<div class="hero-frame">' + pic + "</div>" +
        '<p class="hero-kicker">' + esc(story.desk_label || "") + "</p>" +
        "<h1>" + esc(story.title) + "</h1>" +
        '<p class="dek">' + esc(story.summary || "") + "</p>" +
        meta(story, live) +
        "</a>"
      );
    }
    if (kind === "grid") {
      return (
        '<a class="card-story" href="' + esc(storyHref(story.slug)) + '">' +
        '<div class="thumb">' + pic + "</div>" +
        "<h3>" + esc(story.title) + "</h3>" +
        meta(story, false) +
        "</a>"
      );
    }
    if (kind === "trend") {
      return (
        '<a class="trend-item" href="' + esc(storyHref(story.slug)) + '">' +
        '<span class="trend-n">' + esc(live || "") + "</span>" +
        "<div><h3>" + esc(story.title) + "</h3>" + meta(story, false) + "</div>" +
        "</a>"
      );
    }
    return (
      '<a class="story-row" href="' + esc(storyHref(story.slug)) + '">' +
      pic +
      "<div><h3>" + esc(story.title) + "</h3>" + meta(story, false) + "</div>" +
      "</a>"
    );
  }

  function emptyDesk(title, copy) {
    return (
      "<h1>" + esc(title) + "</h1>" +
      '<p class="dek">' + esc(copy) + "</p>"
    );
  }

  function paintChrome(p) {
    var desks = document.getElementById("desks");
    var sports = document.getElementById("sports");
    var menu = document.getElementById("menu");
    var desk = (p && p.desk) || "foreign";
    var sport = (p && p.sport) || "football";
    if (desks) {
      desks.innerHTML =
        '<a class="' + (desk === "foreign" ? "active" : "") + '" href="' + href("foreign", "football") + '">Foreign Sports</a>' +
        '<a class="' + (desk === "local" ? "active" : "") + '" href="' + href("local", "football") + '">Local Sports</a>';
    }
    function sportLinks(into) {
      if (!into) return;
      into.innerHTML = SPORTS[desk]
        .map(function (row) {
          var on = row[0] === sport ? "active" : "";
          return '<a class="' + on + '" href="' + href(desk, row[0]) + '">' + row[1] + "</a>";
        })
        .join("");
    }
    sportLinks(sports);
    sportLinks(menu);
    document.querySelectorAll(".news-boards a").forEach(function (a) {
      var href = (a.getAttribute("href") || "").replace(/\/+$/, "") || "/";
      var here = (location.pathname || "/").replace(/\/+$/, "") || "/";
      var on = false;
      if (href === "/news" && here === "/news") on = true;
      if (href !== "/news" && here.indexOf(href) === 0) on = true;
      a.classList.toggle("active", on);
    });
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

  function paintFeedList(root, stories, title, liveSlug) {
    if (!stories.length) {
      root.innerHTML = emptyDesk(
        title,
        "Nothing on this desk yet."
      );
      return;
    }
    var hero = stories[0];
    var rest = stories.slice(1);
    var grid = rest.slice(0, 2);
    var list = rest.slice(2);
    var html = "";
    html += storyCard(hero, "hero", liveSlug ? hero.slug === liveSlug : true);
    if (grid.length) {
      html += "<h2>More</h2><div class=\"grid-2\">";
      grid.forEach(function (s) {
        html += storyCard(s, "grid", false);
      });
      html += "</div>";
    }
    list.forEach(function (s) {
      html += storyCard(s, "row", false);
    });
    root.innerHTML = html;
  }

  function paintHome() {
    var root = document.getElementById("feed");
    if (!root) return;
    paintChrome({ desk: "foreign", sport: "football" });
    getJson("/v1/public/news/home")
      .then(function (data) {
        var live = data.live;
        var feed = data.feed || [];
        var trending = data.trending || [];
        if (!trending.length) {
          trending = (live ? [live] : []).concat(feed).slice(0, 8);
        }
        if (!live && !feed.length && !trending.length) {
          root.innerHTML = emptyDesk(
            "WiamSports News",
            "The latest stories will show here."
          );
          return;
        }
        var html = "";
        if (live) html += storyCard(live, "hero", true);
        if (trending.length) {
          html += '<section class="trending"><h2>Trending</h2>';
          trending.forEach(function (s, i) {
            html += storyCard(s, "trend", String(i + 1));
          });
          html += "</section>";
        }
        if (feed.length) {
          html += "<h2>Latest</h2>";
          var grid = feed.slice(0, 2);
          var list = feed.slice(2);
          if (grid.length) {
            html += '<div class="grid-2">';
            grid.forEach(function (s) {
              html += storyCard(s, "grid", false);
            });
            html += "</div>";
          }
          list.forEach(function (s) {
            html += storyCard(s, "row", false);
          });
        }
        root.innerHTML = html;
      })
      .catch(function () {
        root.innerHTML = emptyDesk("WiamSports News", "Please try again shortly.");
      });
  }

  function paintFeed() {
    var root = document.getElementById("feed");
    if (!root) return;
    var p = parsePath();
    paintChrome(p);
    var title = (p.desk === "local" ? "Local Sports" : "Foreign Sports") + " · " + sportLabel(p.desk, p.sport);
    getJson("/v1/public/news/feed?desk=" + encodeURIComponent(p.desk) + "&sport=" + encodeURIComponent(p.sport))
      .then(function (data) {
        paintFeedList(root, data.stories || [], title, null);
      })
      .catch(function () {
        root.innerHTML = emptyDesk(title, "Please try again shortly.");
      });
  }

  function paintStory() {
    var root = document.getElementById("article");
    if (!root) return;
    var p = parsePath();
    var slug = p.slug || "";
    getJson("/v1/public/news/story/" + encodeURIComponent(slug))
      .then(function (data) {
        var story = data.story;
        if (!story) {
          root.innerHTML = emptyDesk("Story", "This story is not available.");
          return;
        }
        paintChrome({ desk: story.desk, sport: story.sport });
        var img = photoSrc(story.photo);
        root.innerHTML =
          '<p class="mock-note"><a href="' + href(story.desk, story.sport) + '">← ' +
          esc(story.desk_label) + " · " + esc(story.sport_label) + "</a></p>" +
          '<p class="hero-kicker">' + esc(story.desk_label) + "</p>" +
          "<h1>" + esc(story.title) + "</h1>" +
          meta(story, false) +
          (img ? '<div class="frame"><img src="' + esc(img) + '" alt=""></div>' : "") +
          '<p class="dek">' + esc(story.summary || "") + "</p>" +
          '<p class="body">' + esc(story.body || "").replace(/\n/g, "</p><p class=\"body\">") + "</p>" +
          '<div id="story-trending"></div>';
        fetch(api() + "/v1/public/news/view/" + encodeURIComponent(story.slug), { method: "POST" }).catch(function () {});
        getJson("/v1/public/news/trending").then(function (pack) {
          var box = document.getElementById("story-trending");
          if (!box) return;
          var rows = (pack.stories || []).filter(function (s) {
            return s.slug !== story.slug;
          });
          if (!rows.length) return;
          var html = '<section class="trending"><h2>Trending</h2>';
          rows.forEach(function (s, i) {
            html += storyCard(s, "trend", String(i + 1));
          });
          html += "</section>";
          box.innerHTML = html;
        }).catch(function () {});
      })
      .catch(function () {
        root.innerHTML = emptyDesk("Story", "Please try again shortly.");
      });
  }

  function paintSearch() {
    var root = document.getElementById("feed") || document.getElementById("article");
    if (!root) return;
    var q = new URLSearchParams(location.search).get("q") || "";
    paintChrome({ desk: "foreign", sport: "football" });
    if (q.length < 2) {
      root.innerHTML = emptyDesk("Search", "Type at least two letters.");
      return;
    }
    getJson("/v1/public/news/search?q=" + encodeURIComponent(q))
      .then(function (data) {
        var rows = data.stories || [];
        if (!rows.length) {
          root.innerHTML = emptyDesk("Search", "No stories matched that search.");
          return;
        }
        var html = "<h1>Search</h1>";
        rows.forEach(function (s) {
          html += storyCard(s, "row", false);
        });
        root.innerHTML = html;
      })
      .catch(function () {
        root.innerHTML = emptyDesk("Search", "Please try again shortly.");
      });
  }

  function redirectLegacyQuery() {
    var q = new URLSearchParams(location.search);
    var desk = q.get("desk");
    var sport = q.get("sport");
    var id = q.get("id");
    if (id && location.pathname.indexOf("/news/story") === 0) return false;
    if (desk || sport) {
      location.replace(href(desk === "local" ? "local" : "foreign", sport || "football"));
      return true;
    }
    return false;
  }

  function boot() {
    if (redirectLegacyQuery()) return;
    bindMenu();
    var p = parsePath();
    if (p.mode === "none") return;
    if (p.mode === "story") paintStory();
    else if (p.mode === "feed") paintFeed();
    else if (p.mode === "search") paintSearch();
    else paintHome();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  return { parsePath: parsePath, href: href };
})();
