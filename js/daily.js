/* 아를의 나날 — 날짜별 타임라인 렌더링
   원칙: 편집자가 확정한 날짜와 추정한 날짜를 시각적으로 구분한다.
        편지가 끊긴 구간(침묵)도 숨기지 않고 그대로 드러낸다. */
(function () {
  "use strict";

  var DATA = null, EPILOGUE = null;
  var state = { filter: "all", q: "" };

  var MONTH_KO = ["1월", "2월", "3월", "4월", "5월", "6월",
                  "7월", "8월", "9월", "10월", "11월", "12월"];
  var MONTH_EN = ["January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"];

  function lang() {
    return document.documentElement.getAttribute("data-lang") === "en" ? "en" : "ko";
  }
  function t(ko, en) { return lang() === "en" ? en : ko; }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function monthLabel(m) {
    var p = m.split("-"), y = p[0], i = parseInt(p[1], 10) - 1;
    return lang() === "en" ? MONTH_EN[i] + " " + y : y + "년 " + MONTH_KO[i];
  }
  /* 영어로 볼 때는 편집자가 쓴 원래 날짜 표기를 그대로 보여준다 */
  function dateLabel(e) {
    if (lang() === "ko") return e.ko;
    var s = e.date_raw_en || e.ko;
    return e.precision === "exact" && e.date
      ? new Date(e.date + "T00:00:00Z").toLocaleDateString("en-GB",
          { weekday: "short", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
      : s;
  }
  function days(a, b) {
    return Math.round((new Date(b) - new Date(a)) / 86400000);
  }

  /* ---------- 필터 ---------- */
  function match(e) {
    if (state.filter === "exact" && e.precision !== "exact") return false;
    if (state.filter === "works" && !e.works.some(function (w) { return w.rel === "working"; })) return false;
    if (state.q) {
      var hay = [e.ko, e.to, e.summary, e.themes.map(function (x) { return x.name; }).join(" "),
                 e.people.map(function (p) { return p.name; }).join(" "),
                 e.works.map(function (w) { return w.f + " " + w.title; }).join(" ")]
                .join(" ").toLowerCase();
      if (hay.indexOf(state.q) === -1) return false;
    }
    return true;
  }

  /* ---------- 조각 ---------- */
  function works(e) {
    if (!e.works.length) return "";
    var shown = e.works.slice(0, 6).map(function (w) {
      var tag = w.rel === "working" ? "<b>" + t("이 무렵 작업", "at work") + "</b> · " : "";
      return '<figure class="' + (w.rel === "working" ? "w-working" : "") + '">' +
        '<a href="gallery.html#' + esc(w.f) + '" title="' + esc(w.title) + '">' +
        '<img src="../' + esc(w.thumb) + '" alt="' + esc(w.title) + '" loading="lazy">' +
        "</a><figcaption>" + tag + esc(w.f) + " " + esc(w.title) + "</figcaption></figure>";
    }).join("");
    var rest = e.work_total - Math.min(6, e.works.length);
    if (rest > 0) shown += '<span class="dy-more">+' + rest + "</span>";
    return '<div class="dy-works">' + shown + "</div>";
  }

  function facts(e) {
    if (!e.facts.length) return "";
    var items = e.facts.map(function (f) {
      return '<div class="dy-fact"><p class="dy-said">“' + esc(f.said) + '”</p>' +
        '<p class="dy-note">' + esc(f.note) + "</p></div>";
    }).join("");
    return '<details class="dy-facts"><summary>' +
      t("그가 쓴 말과, 학자들이 밝혀낸 사실 " + e.facts.length + "가지",
        "What he wrote, and what the editors established (" + e.facts.length + ")") +
      "</summary>" + items + "</details>";
  }

  /* 편지에 이름이 나온다고 그날 만난 것은 아니다.
     이미 세상을 떠난 화가·작가를 이야기한 경우가 많아 따로 묶는다. */
  function people(e) {
    if (!e.people.length) return "";
    function render(list) {
      return list.map(function (p) {
        var nm = esc(p.name);
        return p.wiki
          ? '<a href="../wiki/' + encodeURIComponent(p.wiki) + '/" title="' + esc(p.note) + '">' + nm + "</a>"
          : '<span title="' + esc(p.note) + '">' + nm + "</span>";
      }).join(", ");
    }
    var living = e.people.filter(function (p) { return p.alive !== false; }).slice(0, 8);
    var gone = e.people.filter(function (p) { return p.alive === false; }).slice(0, 6);
    var out = "";
    if (living.length) {
      out += '<p class="dy-people">' + t("편지에 등장", "Mentioned") + ": " + render(living) + "</p>";
    }
    if (gone.length) {
      out += '<p class="dy-people dy-gone">' +
        t("이야기한 고인", "Spoken of, already dead") + ": " + render(gone) + "</p>";
    }
    return out;
  }

  function why(e) {
    if (e.precision === "exact" || !e.why) return "";
    return '<p class="dy-why"><b>' + t("날짜를 이렇게 본 이유", "Why this date") + "</b> — " +
      esc(e.why) + "</p>";
  }

  function card(e) {
    return '<article class="dy-day" data-p="' + esc(e.precision) + '" id="' + esc(e.id) + '">' +
      '<div class="dy-when"><p class="dy-date">' + esc(dateLabel(e)) + "</p>" +
      '<p class="dy-to">' + esc(e.outgoing ? t(e.to + "에게", "to " + e.to_en)
                                           : t(e.to + "에게서", "from " + e.to_en)) + "</p>" +
      '<p class="dy-id">' + esc(e.id) + "</p></div>" +
      '<div class="dy-body">' +
        '<p class="dy-sum">' + esc(e.summary) + "</p>" +
        (e.themes.length
          ? '<div class="dy-themes">' + e.themes.map(function (th) {
              return '<a href="../wiki/' + encodeURIComponent(th.wiki) + '/">' +
                esc(th.name) + "</a>"; }).join("") + "</div>"
          : "") +
        works(e) + people(e) + facts(e) + why(e) +
        '<p class="dy-links">' +
          '<a href="../wiki/' + encodeURIComponent(e.wiki) + '/">' +
            t("편지 전문 읽기", "Read the letter") + "</a>" +
          '<a href="http://vangoghletters.org/orig/let' + esc(e.id.slice(1)) +
            '" target="_blank" rel="noopener">' + t("원문 (vangoghletters.org)", "Original") + "</a>" +
        "</p>" +
      "</div></article>";
  }

  function silence(gap, from, to) {
    return '<div class="dy-silence"><div class="dy-when"></div>' +
      '<p class="dy-silence-txt"><b>' +
      t(gap + "일간 편지가 없습니다", gap + " days without a letter") + "</b> — " +
      t(from.ko + " " + from.id + " 이후, 다음 편지까지.",
        "between " + from.id + " and " + to.id + ".") +
      "</p></div>";
  }

  /* 침묵은 반드시 날짜순으로 재야 한다.
     화면에서는 월 안에서 확정 날짜를 먼저 놓기 때문에, 그 순서로 간격을 재면 틀린다. */
  function silenceMap(list) {
    var dated = list.filter(function (e) { return e.date; })
                    .sort(function (a, b) { return a.date.localeCompare(b.date) || a.id.localeCompare(b.id); });
    var map = {};
    for (var i = 1; i < dated.length; i++) {
      var g = days(dated[i - 1].date, dated[i].date) - 1;
      if (g >= 7) map[dated[i].id] = { gap: g, from: dated[i - 1], to: dated[i] };
    }
    return map;
  }

  /* ---------- 렌더 ---------- */
  function render() {
    var stream = document.getElementById("dyStream");
    var rail = document.getElementById("dyRail");
    var list = DATA.entries.filter(match);

    if (state.filter === "silence") return renderSilences(stream, rail);

    if (!list.length) {
      stream.innerHTML = '<p class="dy-empty">' +
        t("해당하는 날이 없습니다.", "No days match.") + "</p>";
      rail.innerHTML = "";
      return;
    }

    /* 그가 아를을 떠난 뒤 아를 사람들이 보낸 편지는 타임라인이 아니라 에필로그다 */
    var dep = DATA.period.departure;
    var after = list.filter(function (e) { return e.date && e.date > dep; });
    list = list.filter(function (e) { return !(e.date && e.date > dep); });

    /* 월별로 묶되, 월 안에서는 확정 날짜를 먼저 놓는다 */
    var months = [], byMonth = {};
    list.forEach(function (e) {
      var m = e.month || "unknown";
      if (!byMonth[m]) { byMonth[m] = []; months.push(m); }
      byMonth[m].push(e);
    });
    months.sort();

    var gaps = (state.filter === "all" && !state.q) ? silenceMap(list) : {};
    var html = "", railHtml = "";
    months.forEach(function (m) {
      var items = byMonth[m].slice().sort(function (a, b) {
        if ((a.precision === "exact") !== (b.precision === "exact")) return a.precision === "exact" ? -1 : 1;
        return (a.date || "").localeCompare(b.date || "");
      });
      // 같은 그림이 여러 편지에 걸리므로 '연결 건수'가 아니라 '작품 수'를 센다
      var seen = {}, painted = 0;
      items.forEach(function (e) {
        e.works.forEach(function (w) {
          if (w.rel !== "working" || !w.f || seen[w.f]) return;
          seen[w.f] = 1; painted += 1;
        });
      });

      railHtml += '<a href="#m-' + m + '" data-m="' + m + '">' + monthLabel(m) +
                  "<i>" + items.length + "</i></a>";

      html += '<section class="dy-month" id="m-' + m + '">' +
        '<div class="dy-month-head"><h2>' + monthLabel(m) + "</h2><em>" +
        t("편지 " + items.length + "편", items.length + " letters") +
        (painted ? " · " + t("그림 " + painted + "점", painted + " works") : "") +
        "</em></div>";

      items.forEach(function (e) {
        var g = gaps[e.id];
        if (g) html += silence(g.gap, g.from, g.to);
        html += card(e);
      });
      html += "</section>";
    });

    if (after.length) {
      railHtml += '<a href="#m-after" data-m="after">' + t("그 뒤", "After") +
                  "<i>" + after.length + "</i></a>";
      html += '<section class="dy-month" id="m-after">' +
        '<div class="dy-month-head"><h2>' +
        t("그가 떠난 뒤", "After he left") + "</h2><em>" +
        t("편지 " + after.length + "편", after.length + " letters") + "</em></div>" +
        '<p class="dy-epilogue">' +
        t("빈센트는 1889년 5월 8일 생레미로 떠났습니다. 그 뒤에도 아를 사람들은 그에게 편지를 썼습니다.",
          "Vincent left for Saint-Rémy on 8 May 1889. The people of Arles went on writing to him.") +
        "</p>" +
        after.sort(function (a, b) { return a.date.localeCompare(b.date); }).map(card).join("") +
        "</section>";
    }

    if (EPILOGUE) {
      railHtml += '<a href="#m-last" data-m="last">' + t("마지막 편지", "Last letters") + "<i>2</i></a>";
      html += epilogue();
    }

    stream.innerHTML = html;
    rail.innerHTML = railHtml;
    watchMonths();
  }

  /* 에필로그 — 1890년 7월 23일, 같은 날 두 번 쓴 편지.
     아를 밖(오베르)의 편지라 타임라인 본문과 섞지 않고 끝에 따로 둔다.
     그 뒤로 편지가 없다는 사실만 적는다. 이 자료로 말할 수 있는 것은 거기까지다. */
  function epilogue() {
    var e = EPILOGUE;
    var cards = e.letters.map(function (l) {
      var quotes = l.quotes.map(function (q) {
        return '<blockquote class="ep-q"><p class="ep-en">“' + esc(q.en) + '”</p>' +
          '<p class="ep-ko">' + esc(q.ko) + "</p></blockquote>";
      }).join("");
      return '<article class="ep-card" data-kind="' + (l.id === "RM25" ? "unsent" : "sent") + '">' +
        '<header><h3>' + esc(lang() === "en" ? l.label_en : l.label) + "</h3>" +
        '<p class="ep-status">' + esc(lang() === "en" ? l.status_en : l.status) + "</p></header>" +
        '<p class="ep-sum">' + esc(l.summary) + "</p>" +
        quotes +
        '<p class="ep-ends">' + esc(lang() === "en" ? l.ends_en : l.ends) + "</p>" +
        '<details class="dy-facts"><summary>' +
          t("전문 읽기 (영어 번역 " + l.paras.length + "단락)",
            "Read it in full (" + l.paras.length + " paragraphs)") + "</summary>" +
          l.paras.map(function (p) { return '<p class="ep-para">' + esc(p) + "</p>"; }).join("") +
          '<p class="ep-src">' + esc(l.source) + ' · <a href="' + esc(l.orig) +
          '" target="_blank" rel="noopener">vangoghletters.org</a></p>' +
        "</details></article>";
    }).join("");

    var rows = e.contrast.map(function (c) {
      return "<tr><th>" + esc(lang() === "en" ? c.topic_en : c.topic) + "</th>" +
        "<td>" + esc(lang() === "en" ? c.unsent_en : c.unsent) + "</td>" +
        "<td>" + esc(lang() === "en" ? c.sent_en : c.sent) + "</td></tr>";
    }).join("");

    return '<section class="dy-month ep" id="m-last">' +
      '<div class="dy-month-head"><h2>' + t("마지막 편지", "The Last Letters") + "</h2><em>" +
      t("1890년 7월 23일 · 오베르쉬르우아즈", "23 July 1890 · Auvers-sur-Oise") + "</em></div>" +
      '<p class="dy-epilogue">' +
      t("아를을 떠난 지 1년 2개월 뒤. 빈센트는 같은 날 테오에게 두 통의 편지를 썼고, 그 중에서 한 통만 보냈습니다.",
        "One year and two months after he left Arles. Vincent wrote Theo two letters that day, and sent only one of them.") +
      "</p>" +
      '<div class="ep-pair">' + cards + "</div>" +
      '<div class="ep-diff"><h3>' + t("무엇을 덜어냈는가", "What he took out") + "</h3>" +
      "<table><thead><tr><th></th><th>" + t("부치지 않은 편지", "Never sent") +
      "</th><th>" + t("부친 편지", "Sent") + "</th></tr></thead><tbody>" + rows + "</tbody></table></div>" +
      '<p class="ep-silence">' +
      t("이 뒤로 편지가 없습니다.", "There are no further letters.") + "</p>" +
      "</section>";
  }

  /* 침묵만 모아 보기 — 사건이 일어난 자리는 대개 편지가 끊긴 자리다 */
  function renderSilences(stream, rail) {
    rail.innerHTML = "";
    /* 아를을 떠난 뒤의 공백은 침묵이 아니라 부재다 — 체류 기간 안에서만 잰다 */
    var dep = DATA.period.departure;
    var map = silenceMap(DATA.entries.filter(function (e) { return e.date && e.date <= dep; }));
    var rows = Object.keys(map).map(function (k) {
      return { gap: map[k].gap, a: map[k].from, b: map[k].to };
    });
    rows.sort(function (x, y) { return y.gap - x.gap; });

    stream.innerHTML = '<section class="dy-month"><div class="dy-month-head"><h2>' +
      t("편지가 끊긴 구간", "The silences") + "</h2><em>" +
      t(rows.length + "구간 · 7일 이상", rows.length + " gaps of 7+ days") + "</em></div>" +
      rows.map(function (r) {
        return '<article class="dy-day" data-p="' + esc(r.a.precision) + '">' +
          '<div class="dy-when"><p class="dy-date">' +
          t(r.gap + "일", r.gap + " days") + "</p>" +
          '<p class="dy-to">' + esc(r.a.date) + " → " + esc(r.b.date) + "</p></div>" +
          '<div class="dy-body"><p class="dy-sum">' +
          t("마지막 편지는 " + r.a.ko + " " + r.a.id + ", 다음 편지는 " + r.b.ko + " " + r.b.id + "입니다.",
            "The last letter is " + r.a.id + ", the next is " + r.b.id + ".") +
          "</p>" +
          '<p class="dy-links"><a href="#' + esc(r.a.id) + '">' +
          t("앞 편지로", "Before") + '</a><a href="#' + esc(r.b.id) + '">' +
          t("뒤 편지로", "After") + "</a></p></div></article>";
      }).join("") + "</section>";
  }

  /* 레일에 현재 위치 표시 — 화면보다 긴 섹션도 잡히도록 threshold 는 0 으로 둔다 */
  function watchMonths() {
    var links = {};
    document.querySelectorAll(".dy-rail a").forEach(function (a) { links[a.dataset.m] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        var a = links[en.target.id.replace(/^m-/, "")];
        if (a && en.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove("on"); });
          a.classList.add("on");
        }
      });
    }, { threshold: 0, rootMargin: "-86px 0px -70% 0px" });
    document.querySelectorAll(".dy-month").forEach(function (s) { io.observe(s); });
  }

  function stats() {
    var c = DATA.counts, p = DATA.period;
    var rows = [
      [p.span, t("아를에서 보낸 날", "days in Arles")],
      [c.letters, t("이 아카이브가 다룬 편지", "letters in this archive")],
      [c.days, t("날짜가 확정된 날", "days precisely dated")],
      [c.work_titles, t("아를에서 작업 중이라 말한 그림", "works under way in Arles")],
    ];
    document.getElementById("dyStats").innerHTML = rows.map(function (r) {
      return "<div><b>" + r[0] + "</b><span>" + r[1] + "</span></div>";
    }).join("");
  }

  function bind() {
    document.querySelectorAll(".dy-filters button").forEach(function (b) {
      b.addEventListener("click", function () {
        document.querySelectorAll(".dy-filters button").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        state.filter = b.dataset.filter;
        render();
      });
    });
    var s = document.getElementById("dySearch"), tm;
    s.addEventListener("input", function () {
      clearTimeout(tm);
      tm = setTimeout(function () { state.q = s.value.trim().toLowerCase(); render(); }, 180);
    });
    /* 언어 전환 뒤에는 동적으로 만든 문구도 다시 그려야 한다 */
    document.querySelectorAll("[data-setlang]").forEach(function (b) {
      b.addEventListener("click", function () { setTimeout(function () { stats(); render(); }, 0); });
    });
  }

  Promise.all([
    fetch("../data/daily.json", { cache: "no-cache" }).then(function (r) { return r.json(); }),
    fetch("../data/epilogue.json", { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; }),
  ])
    .then(function (both) {
      DATA = both[0];
      EPILOGUE = both[1];
      stats();
      bind();
      render();
      if (location.hash) {
        var el = document.querySelector(location.hash);
        if (el) el.scrollIntoView();
      }
    })
    .catch(function (err) {
      document.getElementById("dyStream").innerHTML =
        '<p class="dy-empty">데이터를 불러오지 못했습니다. (' + esc(err.message) + ")</p>";
    });
})();
