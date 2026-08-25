/* WiamSports News mock data. Sample stories only. */
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
    ],
  };

  var STORIES = [
    {
      id: "ff1",
      desk: "foreign",
      sport: "football",
      live: true,
      title: "Night kick-off: a late winner splits a tight European tie",
      summary: "One image from the desk. Floodlights, a packed stand, and a finish that decided the tie in added time.",
      body: "This is a layout sample. When News is live, the desk will send the story from Telegram with one photograph. The site will show that picture, the headline, and the sport — nothing extra invented around it.",
      image: "/news/img/news-foreign-football-hero.png",
      time: "12 min",
    },
    {
      id: "ff2",
      desk: "foreign",
      sport: "football",
      title: "Midfield duel: two sides refuse to give the air",
      summary: "A set-piece afternoon that turned on the second ball.",
      body: "Sample copy for the football desk. Live stories will arrive from Telegram, one photograph each.",
      image: "/news/img/news-foreign-football-2.png",
      time: "1 h",
    },
    {
      id: "ff3",
      desk: "foreign",
      sport: "football",
      title: "What the second half changed — and what it did not",
      summary: "Shape held. The finish did not.",
      body: "Sample copy for the football desk.",
      image: "/news/img/news-foreign-football-2.png",
      time: "3 h",
    },
    {
      id: "fb1",
      desk: "foreign",
      sport: "basketball",
      title: "Last possession: the rim decides it",
      summary: "A packed arena, one trip to the line, and a finish at the horn.",
      body: "Sample basketball story. One photograph from the desk.",
      image: "/news/img/news-basketball.png",
      time: "40 min",
    },
    {
      id: "fb2",
      desk: "foreign",
      sport: "basketball",
      title: "Inside the paint: why this side keeps winning ugly",
      summary: "Rebounds first. The rest follows.",
      body: "Sample basketball story.",
      image: "/news/img/news-basketball.png",
      time: "5 h",
    },
    {
      id: "ft1",
      desk: "foreign",
      sport: "tennis",
      title: "Grass-court afternoon: a hold that would not break",
      summary: "Long games, short points, and a tie-break that ran long.",
      body: "Sample tennis story. One photograph from the desk.",
      image: "/news/img/news-tennis.png",
      time: "2 h",
    },
    {
      id: "ft2",
      desk: "foreign",
      sport: "tennis",
      title: "The return that flipped the set",
      summary: "One swing from the baseline changed the afternoon.",
      body: "Sample tennis story.",
      image: "/news/img/news-tennis.png",
      time: "6 h",
    },
    {
      id: "fa1",
      desk: "foreign",
      sport: "athletics",
      title: "Out of the blocks: a championship 100m that stayed bunched",
      summary: "Eight lanes, one dip, and a photo that the desk will run as the story.",
      body: "Sample athletics story. One photograph from the desk.",
      image: "/news/img/news-athletics.png",
      time: "25 min",
    },
    {
      id: "fa2",
      desk: "foreign",
      sport: "athletics",
      title: "Lap times, not noise: what the 800m actually showed",
      summary: "The kick came off the last bend.",
      body: "Sample athletics story.",
      image: "/news/img/news-athletics.png",
      time: "4 h",
    },
    {
      id: "fx1",
      desk: "foreign",
      sport: "boxing",
      title: "Under the lights: a clinch, then the round that mattered",
      summary: "The ring photograph is the story. The desk will not dress it with extra graphics.",
      body: "Sample boxing story. Boxing sits on Foreign Sports only in this mock.",
      image: "/news/img/news-boxing.png",
      time: "18 min",
    },
    {
      id: "fx2",
      desk: "foreign",
      sport: "boxing",
      title: "Judges’ cards and the round people will argue",
      summary: "Close. Honest. One picture from ringside.",
      body: "Sample boxing story.",
      image: "/news/img/news-boxing.png",
      time: "8 h",
    },
    {
      id: "lf1",
      desk: "local",
      sport: "football",
      title: "Local derby afternoon: the stand was the story before kick-off",
      summary: "Ghana football on the local desk. One photograph, one headline.",
      body: "Sample local football story. Live posts will come from Telegram with one image. This page is the arrangement — not a live score feed.",
      image: "/news/img/news-local-football.png",
      time: "9 min",
    },
    {
      id: "lf2",
      desk: "local",
      sport: "football",
      title: "Black Stars week: who is in, who is waiting",
      summary: "A camp photograph and a clean list. Nothing more until the desk files.",
      body: "Sample local football story.",
      image: "/news/img/news-local-football.png",
      time: "2 h",
    },
    {
      id: "lf3",
      desk: "local",
      sport: "football",
      title: "League Saturday: three matches, three pictures",
      summary: "The local desk files one image per match story.",
      body: "Sample local football story.",
      image: "/news/img/news-local-football.png",
      time: "7 h",
    },
    {
      id: "lb1",
      desk: "local",
      sport: "basketball",
      title: "Accra court: the run that closed the fourth",
      summary: "Local basketball, one photograph, no extra collage.",
      body: "Sample local basketball story.",
      image: "/news/img/news-local-basketball.png",
      time: "33 min",
    },
    {
      id: "lb2",
      desk: "local",
      sport: "basketball",
      title: "Youth side by side with the senior sheet",
      summary: "Same court. Different hour.",
      body: "Sample local basketball story.",
      image: "/news/img/news-local-basketball.png",
      time: "1 d",
    },
    {
      id: "lt1",
      desk: "local",
      sport: "tennis",
      title: "Home hard court: a junior final that ran long",
      summary: "Local tennis on the same white feed as the foreign desk.",
      body: "Sample local tennis story.",
      image: "/news/img/news-tennis.png",
      time: "4 h",
    },
    {
      id: "la1",
      desk: "local",
      sport: "athletics",
      title: "National trials: the 400m that the stand came to see",
      summary: "Athletics on the local desk. Boxing is not on this tap.",
      body: "Sample local athletics story. Local Sports in this mock is Football, Basketball, Tennis, and Athletics.",
      image: "/news/img/news-athletics.png",
      time: "55 min",
    },
    {
      id: "la2",
      desk: "local",
      sport: "athletics",
      title: "Field events before the lights",
      summary: "One photograph from the pit. The desk keeps it that way.",
      body: "Sample local athletics story.",
      image: "/news/img/news-athletics.png",
      time: "11 h",
    },
  ];

  function params() {
    var q = new URLSearchParams(location.search);
    var fromStory = byId(q.get("id") || "");
    if (fromStory) return { desk: fromStory.desk, sport: fromStory.sport };
    var desk = q.get("desk") === "local" ? "local" : "foreign";
    var allowed = SPORTS[desk].map(function (row) { return row[0]; });
    var sport = q.get("sport") || allowed[0];
    if (allowed.indexOf(sport) === -1) sport = allowed[0];
    return { desk: desk, sport: sport };
  }

  function href(desk, sport) {
    return "/news/?desk=" + desk + "&sport=" + sport;
  }

  function storyHref(id) {
    return "/news/story/?id=" + encodeURIComponent(id);
  }

  function filtered(desk, sport) {
    return STORIES.filter(function (s) {
      return s.desk === desk && s.sport === sport;
    });
  }

  function byId(id) {
    for (var i = 0; i < STORIES.length; i++) {
      if (STORIES[i].id === id) return STORIES[i];
    }
    return null;
  }

  function sportLabel(desk, sport) {
    var rows = SPORTS[desk] || [];
    for (var i = 0; i < rows.length; i++) {
      if (rows[i][0] === sport) return rows[i][1];
    }
    return sport;
  }

  function meta(story) {
    var live = story.live
      ? '<span class="cat">Live</span> · '
      : "";
    return (
      '<p class="meta-line">' +
      live +
      '<span class="cat">' +
      sportLabel(story.desk, story.sport) +
      "</span> · " +
      story.time +
      "</p>"
    );
  }

  function paintChrome() {
    var p = params();
    var desks = document.getElementById("desks");
    var sports = document.getElementById("sports");
    var menu = document.getElementById("menu");
    if (desks) {
      desks.innerHTML =
        '<a class="' + (p.desk === "foreign" ? "active" : "") + '" href="' + href("foreign", "football") + '">Foreign Sports</a>' +
        '<a class="' + (p.desk === "local" ? "active" : "") + '" href="' + href("local", "football") + '">Local Sports</a>';
    }
    function sportLinks(into) {
      into.innerHTML = SPORTS[p.desk]
        .map(function (row) {
          var on = row[0] === p.sport ? "active" : "";
          return '<a class="' + on + '" href="' + href(p.desk, row[0]) + '">' + row[1] + "</a>";
        })
        .join("");
    }
    if (sports) sportLinks(sports);
    if (menu) sportLinks(menu);
  }

  function paintFeed() {
    var root = document.getElementById("feed");
    if (!root) return;
    var p = params();
    var rows = filtered(p.desk, p.sport);
    var deskName = p.desk === "local" ? "Local Sports" : "Foreign Sports";
    var label = sportLabel(p.desk, p.sport);
    if (!rows.length) {
      root.innerHTML =
        '<p class="mock-note">Sample layout — not live news. The desk has not filed this sport yet.</p>' +
        "<h1>" + deskName + " · " + label + "</h1>" +
        "<p>Stories will appear here when the news desk files them from Telegram — one image each.</p>";
      return;
    }
    var hero = rows[0];
    var rest = rows.slice(1);
    var grid = rest.slice(0, 2);
    var list = rest.slice(2);
    var html = "";
    html += '<p class="mock-note">Sample layout — not live news. One image per story, the way the desk will file from Telegram.</p>';
    html += '<a class="hero" href="' + storyHref(hero.id) + '">';
    html += '<div class="hero-frame"><img src="' + hero.image + '" alt=""></div>';
    html += '<p class="hero-kicker">' + deskName + "</p>";
    html += "<h1>" + hero.title + "</h1>";
    html += '<p class="dek">' + hero.summary + "</p>";
    html += meta(hero);
    html += "</a>";
    if (grid.length) {
      html += "<h2>More " + label + "</h2>";
      html += '<div class="grid-2">';
      grid.forEach(function (s) {
        html += '<a class="card-story" href="' + storyHref(s.id) + '">';
        html += '<div class="thumb"><img src="' + s.image + '" alt=""></div>';
        html += "<h3>" + s.title + "</h3>";
        html += meta(s);
        html += "</a>";
      });
      html += "</div>";
    }
    list.forEach(function (s) {
      html += '<a class="story-row" href="' + storyHref(s.id) + '">';
      html += '<img src="' + s.image + '" alt="">';
      html += "<div><h3>" + s.title + "</h3>" + meta(s) + "</div>";
      html += "</a>";
    });
    root.innerHTML = html;
  }

  function paintStory() {
    var root = document.getElementById("article");
    if (!root) return;
    var id = new URLSearchParams(location.search).get("id") || "";
    var story = byId(id) || STORIES[0];
    var deskName = story.desk === "local" ? "Local Sports" : "Foreign Sports";
    root.innerHTML =
      '<p class="mock-note"><a href="' + href(story.desk, story.sport) + '">← ' + deskName + " · " + sportLabel(story.desk, story.sport) + "</a></p>" +
      '<p class="hero-kicker">' + deskName + "</p>" +
      "<h1>" + story.title + "</h1>" +
      meta(story) +
      '<div class="frame"><img src="' + story.image + '" alt=""></div>' +
      '<p class="dek">' + story.summary + "</p>" +
      '<p class="body">' + story.body + "</p>" +
      '<p class="body">WiamSports News will stay on this white page so the photograph is the picture, not a decoration on a dark card. The green and gold stay in the bars above.</p>';
  }

  function bindMenu() {
    var btn = document.getElementById("menu-btn");
    var menu = document.getElementById("menu");
    if (!btn || !menu) return;
    btn.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function boot() {
    paintChrome();
    paintFeed();
    paintStory();
    bindMenu();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  return { params: params, byId: byId };
})();
