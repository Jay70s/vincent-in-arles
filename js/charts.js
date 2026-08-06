/* 데이터로 보는 15개월 — 차트 렌더러
   원칙: 단일 hue(#bf8b0a, 검증 통과), 4px 라운드 데이터엔드, 2px 표면 간격,
        전 차트 hover 툴팁 + 표 보기(접근성). */
(async () => {
  const S = await (await fetch("../data/stats.json")).json();
  const GOLD = "#bf8b0a";
  const tip = document.getElementById("chTip");

  const showTip = (e, title, val) => {
    tip.hidden = false;
    tip.innerHTML = `<b>${title}</b><span>${val}</span>`;
    tip.style.left = Math.min(e.clientX + 14, innerWidth - 220) + "px";
    tip.style.top = (e.clientY + 14) + "px";
  };
  const hideTip = () => { tip.hidden = true; };

  const plot = (id) => d3.select(`#${id} .plot`);
  const label = (ym) => {
    const [y, m] = ym.split("-");
    return (m === "01" ? `${y.slice(2)}년 ` : "") + `${+m}월`;
  };

  // 표 보기(접근성) 추가
  function addTable(figId, cols, rows) {
    const d = d3.select(`#${figId}`).append("details").attr("class", "tbl-toggle");
    d.append("summary").text("표로 보기");
    const t = d.append("table");
    t.append("thead").append("tr").selectAll("th").data(cols).join("th").text(d => d);
    t.append("tbody").selectAll("tr").data(rows).join("tr")
      .selectAll("td").data(r => r).join("td").text(d => d);
  }

  /* ---------- 1. 월별 편지 (수직 바) ---------- */
  {
    const data = S.timeline;
    const W = 880, H = 300, M = { t: 14, r: 10, b: 34, l: 34 };
    const x = d3.scaleBand().domain(data.map(d => d.ym))
      .range([M.l, W - M.r]).padding(0.28);          // 2px+ 표면 간격
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.n)]).nice()
      .range([H - M.b, M.t]);
    const svg = plot("figTimeline").append("svg").attr("viewBox", [0, 0, W, H]);

    svg.append("g").attr("class", "grid")
      .selectAll("line").data(y.ticks(5)).join("line")
      .attr("x1", M.l).attr("x2", W - M.r)
      .attr("y1", y).attr("y2", y);

    svg.selectAll(".bar").data(data).join("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.ym)).attr("width", x.bandwidth())
      .attr("y", d => y(d.n)).attr("height", d => y(0) - y(d.n))
      .attr("rx", 4).attr("ry", 4)                   // 4px 라운드 데이터엔드
      .on("mousemove", (e, d) => showTip(e, label(d.ym), `${d.n}편`))
      .on("mouseleave", hideTip);

    // 선택적 직접 라벨 (최대/최소만)
    const mx = d3.max(data, d => d.n);
    svg.selectAll(".vlab").data(data.filter(d => d.n === mx)).join("text")
      .attr("class", "vlab").attr("text-anchor", "middle")
      .attr("x", d => x(d.ym) + x.bandwidth() / 2)
      .attr("y", d => y(d.n) - 5).text(d => d.n);

    svg.append("g").attr("class", "axis")
      .attr("transform", `translate(0,${H - M.b})`)
      .call(d3.axisBottom(x).tickFormat(label).tickSizeOuter(0))
      .selectAll("text").attr("transform", "rotate(-38)")
      .attr("text-anchor", "end").attr("dx", -4).attr("dy", 6);
    svg.append("g").attr("class", "axis")
      .attr("transform", `translate(${M.l},0)`)
      .call(d3.axisLeft(y).ticks(5).tickSizeOuter(0));

    addTable("figTimeline", ["월", "편지 수"], data.map(d => [label(d.ym), d.n]));
  }

  /* ---------- 수평 바 공통 ---------- */
  function hbar(figId, rows, opts = {}) {
    const labelW = opts.labelW || 190;
    const rowH = opts.rowH || 22;
    const W = 880, M = { t: 6, r: 46, b: 6, l: labelW };
    const H = M.t + M.b + rows.length * rowH;
    const x = d3.scaleLinear().domain([0, d3.max(rows, d => d.n)])
      .range([M.l, W - M.r]);
    const y = d3.scaleBand().domain(rows.map(d => d.name))
      .range([M.t, H - M.b]).padding(0.24);
    const svg = plot(figId).append("svg").attr("viewBox", [0, 0, W, H]);

    svg.selectAll(".blab").data(rows).join("text")
      .attr("class", "blab").attr("x", M.l - 8)
      .attr("y", d => y(d.name) + y.bandwidth() / 2)
      .attr("dy", ".35em").attr("text-anchor", "end")
      .text(d => d.name.length > 26 ? d.name.slice(0, 25) + "…" : d.name);

    svg.selectAll(".bar").data(rows).join("rect")
      .attr("class", "bar")
      .attr("x", M.l).attr("y", d => y(d.name))
      .attr("height", y.bandwidth())
      .attr("width", d => x(d.n) - M.l)
      .attr("rx", 4).attr("ry", 4)
      .style("cursor", d => d.slug ? "pointer" : null)
      .on("mousemove", (e, d) => showTip(e, d.name, `${d.n}편`))
      .on("mouseleave", hideTip)
      .on("click", (e, d) => {
        if (d.slug) location.href = `../wiki/${encodeURIComponent(d.slug)}/`;
      });

    svg.selectAll(".vlab").data(rows).join("text")
      .attr("class", "vlab").attr("x", d => x(d.n) + 6)
      .attr("y", d => y(d.name) + y.bandwidth() / 2)
      .attr("dy", ".35em").text(d => d.n);

    addTable(figId, ["이름", "편지 수"], rows.map(d => [d.name, d.n]));
  }

  hbar("figThemes", S.themes);
  hbar("figAddr", S.addressees.filter(d => d.n > 0), { labelW: 130 });
  hbar("figPeople", S.people.slice(0, 20), { labelW: 230 });

  /* ---------- 주제 흐름 small multiples ---------- */
  {
    const months = S.flow.months;
    const maxV = d3.max(S.flow.series, s => d3.max(s.values));
    const host = plot("figFlow");
    S.flow.series.forEach(s => {
      const cell = host.append("div").attr("class", "sm-cell");
      cell.append("h3").text(s.name);
      cell.append("p").attr("class", "sm-n").text(`최대 ${d3.max(s.values)}편/월`);
      const W = 220, H = 84, M = { t: 6, r: 4, b: 16, l: 4 };
      const x = d3.scalePoint().domain(months).range([M.l, W - M.r]);
      const y = d3.scaleLinear().domain([0, maxV]).range([H - M.b, M.t]);
      const svg = cell.append("svg").attr("viewBox", [0, 0, W, H]);

      svg.append("path")
        .attr("fill", "rgba(191,139,10,.22)")
        .attr("d", d3.area().x((_, i) => x(months[i])).y0(y(0)).y1(v => y(v))
          .curve(d3.curveMonotoneX)(s.values));
      svg.append("path")
        .attr("fill", "none").attr("stroke", GOLD).attr("stroke-width", 2)
        .attr("d", d3.line().x((_, i) => x(months[i])).y(v => y(v))
          .curve(d3.curveMonotoneX)(s.values));

      // hover: 최근접 월
      svg.append("rect").attr("x", 0).attr("y", 0).attr("width", W).attr("height", H)
        .attr("fill", "transparent")
        .on("mousemove", function (e) {
          const [mx] = d3.pointer(e, this);
          let bi = 0, bd = Infinity;
          months.forEach((m, i) => {
            const d = Math.abs(x(m) - mx); if (d < bd) { bd = d; bi = i; }
          });
          showTip(e, `${s.name} · ${label(months[bi])}`, `${s.values[bi]}편`);
        })
        .on("mouseleave", hideTip);

      svg.append("g").attr("class", "axis")
        .attr("transform", `translate(0,${H - M.b})`)
        .call(d3.axisBottom(x).tickValues([months[0], months[months.length - 1]])
          .tickFormat(label).tickSizeOuter(0));
    });
    addTable("figFlow", ["주제", ...months.map(label)],
      S.flow.series.map(s => [s.name, ...s.values]));
  }

  /* ---------- 동시출현 히트맵 (sequential 단일 hue) ---------- */
  {
    const top = S.themes.slice(0, 8).map(t => t.name);
    const m = new Map();
    S.cooccur.forEach(c => {
      m.set(c.a + "|" + c.b, c.n); m.set(c.b + "|" + c.a, c.n);
    });
    const cells = [];
    top.forEach(a => top.forEach(b => {
      if (a !== b) cells.push({ a, b, n: m.get(a + "|" + b) || 0 });
    }));
    const W = 880, M = { t: 10, r: 10, b: 96, l: 150 };
    // 셀이 지나치게 커져 세로로 길어지는 것을 막는다
    const cs = Math.min((W - M.l - M.r) / top.length, 64);
    const H = M.t + M.b + cs * top.length;
    const x = d3.scaleBand().domain(top).range([M.l, W - M.r]);
    const y = d3.scaleBand().domain(top).range([M.t, M.t + cs * top.length]);
    const color = d3.scaleSequential()
      .domain([0, d3.max(cells, d => d.n)])
      .interpolator(d3.interpolateRgb("#1b2740", GOLD));   // 한 hue, 밝기만
    const svg = plot("figCo").append("svg").attr("viewBox", [0, 0, W, H]);

    svg.selectAll(".hm-cell").data(cells).join("rect")
      .attr("class", "hm-cell")
      .attr("x", d => x(d.a)).attr("y", d => y(d.b))
      .attr("width", cs).attr("height", cs)
      .attr("rx", 3)
      .attr("fill", d => d.n ? color(d.n) : "rgba(246,240,226,.03)")
      .on("mousemove", (e, d) => showTip(e, `${d.a} × ${d.b}`, `같은 편지 ${d.n}회`))
      .on("mouseleave", hideTip);

    svg.selectAll(".hm-v").data(cells.filter(d => d.n >= 20)).join("text")
      .attr("class", "vlab").attr("text-anchor", "middle")
      .attr("x", d => x(d.a) + cs / 2).attr("y", d => y(d.b) + cs / 2 + 3)
      .text(d => d.n);

    svg.append("g").attr("class", "axis")
      .attr("transform", `translate(${M.l},0)`)
      .call(d3.axisLeft(y).tickSizeOuter(0));
    svg.append("g").attr("class", "axis")
      .attr("transform", `translate(0,${M.t + cs * top.length})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .selectAll("text").attr("transform", "rotate(-42)")
      .attr("text-anchor", "end").attr("dx", -4).attr("dy", 6);

    addTable("figCo", ["주제 A", "주제 B", "동시 출현"],
      S.cooccur.slice(0, 20).map(c => [c.a, c.b, c.n]));
  }

  /* ---------- 편지 길이 (연대순 바) ---------- */
  {
    const rows = S.letters.filter(l => l.ym).map((l, i) => ({ ...l, i }));
    const W = 880, H = 220, M = { t: 12, r: 10, b: 26, l: 44 };
    const x = d3.scaleBand().domain(rows.map(d => d.t))
      .range([M.l, W - M.r]).padding(0.18);
    const y = d3.scaleLinear().domain([0, d3.max(rows, d => d.len)]).nice()
      .range([H - M.b, M.t]);
    const svg = plot("figLen").append("svg").attr("viewBox", [0, 0, W, H]);

    svg.append("g").attr("class", "grid")
      .selectAll("line").data(y.ticks(4)).join("line")
      .attr("x1", M.l).attr("x2", W - M.r).attr("y1", y).attr("y2", y);

    svg.selectAll(".bar").data(rows).join("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.t)).attr("width", x.bandwidth())
      .attr("y", d => y(d.len)).attr("height", d => y(0) - y(d.len))
      .attr("rx", 2).attr("ry", 2)
      .style("cursor", "pointer")
      .on("mousemove", (e, d) =>
        showTip(e, d.t, `${d.len.toLocaleString()}자 · ${label(d.ym)}`))
      .on("mouseleave", hideTip)
      .on("click", (e, d) => location.href = `../wiki/${encodeURIComponent(d.slug)}/`);

    svg.append("g").attr("class", "axis")
      .attr("transform", `translate(${M.l},0)`)
      .call(d3.axisLeft(y).ticks(4).tickFormat(d => d / 1000 + "k").tickSizeOuter(0));
    svg.append("g").attr("class", "axis")
      .attr("transform", `translate(0,${H - M.b})`)
      .call(d3.axisBottom(x).tickValues([]).tickSizeOuter(0));
    svg.append("text").attr("class", "blab")
      .attr("x", M.l).attr("y", H - 8).text("1888년 2월");
    svg.append("text").attr("class", "blab")
      .attr("x", W - M.r).attr("y", H - 8).attr("text-anchor", "end").text("1889년 5월");

    const longest = [...rows].sort((a, b) => b.len - a.len).slice(0, 10);
    addTable("figLen", ["편지", "글자 수"], longest.map(d => [d.t, d.len.toLocaleString()]));
  }
})();
