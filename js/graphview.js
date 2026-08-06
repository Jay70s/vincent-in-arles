/* 옵시디언식 지식 그래프 뷰 — D3 force simulation */
(async () => {
  const svgEl = document.getElementById("gv");
  const data = await (await fetch("../data/graph.json")).json();

  // 색약 접근성 검증을 통과한 3색 (dark surface #0d1b2e 기준):
  // 명도 밴드·채도·CVD 분리·정상시야·대비 전 항목 PASS
  const KIND = {
    letter: { color: "#bf8b0a", r: 3.2, label: "편지" },
    person: { color: "#3a72cc", r: 3.0, label: "인물" },
    theme:  { color: "#a9628c", r: 5.0, label: "주제" },
    other:  { color: "#8a8577", r: 2.6, label: "기타" },
  };
  const kindOf = (n) => KIND[n.kind] ? n.kind : "other";

  // 카운트
  const counts = { letter: 0, person: 0, theme: 0 };
  data.nodes.forEach(n => { if (counts[n.kind] !== undefined) counts[n.kind]++; });
  document.getElementById("cLetter").textContent = counts.letter;
  document.getElementById("cPerson").textContent = counts.person;
  document.getElementById("cTheme").textContent = counts.theme;
  document.getElementById("gvMeta").textContent =
    `전체 ${data.nodes.length}개 노드 · ${data.links.length}개 연결`;

  const svg = d3.select(svgEl);
  let W = svgEl.clientWidth, H = svgEl.clientHeight;
  svg.attr("viewBox", [0, 0, W, H]);

  const root = svg.append("g");
  const gLink = root.append("g").attr("class", "links");
  const gNode = root.append("g").attr("class", "nodes");
  const gLabel = root.append("g").attr("class", "labels");

  const zoom = d3.zoom().scaleExtent([0.15, 6])
    .on("zoom", (e) => {
      root.attr("transform", e.transform);
      gLabel.style("display", e.transform.k < 0.55 ? "none" : null);
    });
  svg.call(zoom);
  // 초기/리셋 시점: 살짝 축소해 전체 별자리가 화면에 들어오도록
  const homeView = () => d3.zoomIdentity
    .translate(W / 2, H / 2).scale(0.62).translate(-W / 2, -H / 2);
  document.getElementById("gvReset").onclick = () =>
    svg.transition().duration(600).call(zoom.transform, homeView());
  svg.call(zoom.transform, homeView());

  // 상태 (초기값은 HTML의 슬라이더 기본값과 일치시킬 것)
  // deg 분포: 최소 3 · 중앙값 14 · 최대 629 → 기본 12로 두어야 실제로 솎아진다
  const state = { minDeg: 12, kinds: new Set(["letter", "person", "theme"]), q: "" };
  document.getElementById("degFilter").value = state.minDeg;
  document.getElementById("degVal").textContent = state.minDeg;

  const nodesAll = data.nodes.map(d => ({ ...d, kind: kindOf(d) }));
  const byId = new Map(nodesAll.map(n => [n.id, n]));
  const linksAll = data.links.map(l => ({ source: l.s, target: l.t, w: l.w }));

  const sim = d3.forceSimulation()
    // 중앙 뭉침을 막기 위해 반발력·링크 거리·충돌 반경을 넉넉히
    .force("charge", d3.forceManyBody().strength(-165).distanceMax(520))
    .force("link", d3.forceLink().id(d => d.id).distance(70).strength(0.16))
    .force("center", d3.forceCenter(W / 2, H / 2))
    .force("collide", d3.forceCollide().radius(d => radius(d) + 7).iterations(2))
    .force("x", d3.forceX(W / 2).strength(0.02))
    .force("y", d3.forceY(H / 2).strength(0.02));

  function radius(d) {
    return KIND[d.kind].r + Math.sqrt(d.deg) * 0.85;
  }

  let nodeSel, linkSel, labelSel, neighbors = new Map();

  function apply() {
    const visible = nodesAll.filter(n =>
      state.kinds.has(n.kind) && n.deg >= state.minDeg);
    const vis = new Set(visible.map(n => n.id));
    const links = linksAll.filter(l => {
      const s = l.source.id ?? l.source, t = l.target.id ?? l.target;
      return vis.has(s) && vis.has(t);
    });

    neighbors = new Map(visible.map(n => [n.id, new Set()]));
    links.forEach(l => {
      const s = l.source.id ?? l.source, t = l.target.id ?? l.target;
      neighbors.get(s).add(t); neighbors.get(t).add(s);
    });

    linkSel = gLink.selectAll("line").data(links, d =>
      (d.source.id ?? d.source) + "|" + (d.target.id ?? d.target))
      .join("line")
      .attr("stroke", "rgba(246,240,226,.13)")
      .attr("stroke-width", d => Math.min(1.6, 0.35 + d.w * 0.12));

    nodeSel = gNode.selectAll("circle").data(visible, d => d.id)
      .join("circle")
      .attr("r", radius)
      .attr("fill", d => KIND[d.kind].color)
      .attr("stroke", "#081120").attr("stroke-width", .8)
      .style("cursor", "pointer")
      .call(d3.drag()
        .on("start", (e, d) => { if (!e.active) sim.alphaTarget(.25).restart(); d.fx = d.x; d.fy = d.y; })
        .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on("end", (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }))
      .on("mouseenter", (e, d) => hover(d, e))
      .on("mouseleave", () => hover(null))
      .on("click", (e, d) => { if (d.slug) location.href = `../wiki/${encodeURIComponent(d.slug)}/`; });

    // 라벨은 주제 전체 + 아주 굵은 노드만 (겹침 방지). 배경 halo로 가독성 확보
    labelSel = gLabel.selectAll("text").data(
      visible.filter(d => d.kind === "theme" || d.deg >= 100), d => d.id)
      .join("text")
      .text(d => d.label.length > 22 ? d.label.slice(0, 21) + "…" : d.label)
      .attr("font-size", d => d.kind === "theme" ? 11.5 : 10)
      .attr("font-weight", d => d.kind === "theme" ? 600 : 400)
      .attr("fill", d => d.kind === "theme" ? "#f0d9a8" : "rgba(246,240,226,.85)")
      .attr("stroke", "#0d1b2e").attr("stroke-width", 3.2)
      .attr("paint-order", "stroke")
      .attr("text-anchor", "middle")
      .attr("pointer-events", "none");

    sim.nodes(visible);
    sim.force("link").links(links);
    sim.alpha(.7).restart();

    document.getElementById("gvMeta").textContent =
      `표시 중 ${visible.length}개 노드 · ${links.length}개 연결`;
    highlight();
  }

  sim.on("tick", () => {
    linkSel && linkSel
      .attr("x1", d => d.source.x).attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
    nodeSel && nodeSel.attr("cx", d => d.x).attr("cy", d => d.y);
    labelSel && labelSel.attr("x", d => d.x).attr("y", d => d.y - radius(d) - 4);
  });

  // hover
  const tip = document.getElementById("gvTip");
  const info = document.getElementById("gvInfo");
  function hover(d, e) {
    if (!d) {
      tip.hidden = true;
      nodeSel && nodeSel.attr("opacity", 1);
      linkSel && linkSel.attr("stroke", "rgba(246,240,226,.13)");
      highlight();
      return;
    }
    tip.hidden = false;
    tip.innerHTML = `<b>${d.label}</b><span>${KIND[d.kind].label} · 연결 ${d.deg}</span>`;
    const stage = document.querySelector(".gv-stage").getBoundingClientRect();
    tip.style.left = (e.clientX - stage.left + 14) + "px";
    tip.style.top = (e.clientY - stage.top + 14) + "px";

    const nb = neighbors.get(d.id) || new Set();
    nodeSel.attr("opacity", n => (n.id === d.id || nb.has(n.id)) ? 1 : .12);
    linkSel.attr("stroke", l => {
      const s = l.source.id ?? l.source, t = l.target.id ?? l.target;
      return (s === d.id || t === d.id) ? "rgba(244,196,48,.7)" : "rgba(246,240,226,.05)";
    });

    const conn = [...nb].map(id => byId.get(id)).filter(Boolean)
      .sort((a, b) => b.deg - a.deg).slice(0, 8);
    info.innerHTML = `
      <p class="gv-inode"><b>${d.label}</b></p>
      <p class="gv-ikind">${KIND[d.kind].label} · 연결 ${d.deg}</p>
      <p class="gv-iconn">${conn.map(c => `<span>${c.label}</span>`).join("")}</p>
      <p class="gv-igo">클릭하면 문서로 이동 →</p>`;
  }

  // 검색 강조
  function highlight() {
    if (!nodeSel) return;
    const q = state.q.trim().toLowerCase();
    if (!q) { nodeSel.attr("stroke", "#081120").attr("stroke-width", .8); return; }
    nodeSel
      .attr("stroke", d => d.label.toLowerCase().includes(q) ? "#fff" : "#081120")
      .attr("stroke-width", d => d.label.toLowerCase().includes(q) ? 2.4 : .8)
      .attr("opacity", d => d.label.toLowerCase().includes(q) ? 1 : .2);
  }

  // 컨트롤
  document.getElementById("degFilter").addEventListener("input", (e) => {
    state.minDeg = +e.target.value;
    document.getElementById("degVal").textContent = state.minDeg;
    apply();
  });
  document.querySelectorAll(".gv-legend input").forEach(cb => {
    cb.addEventListener("change", () => {
      cb.checked ? state.kinds.add(cb.dataset.kind) : state.kinds.delete(cb.dataset.kind);
      apply();
    });
  });
  document.getElementById("gvSearch").addEventListener("input", (e) => {
    state.q = e.target.value;
    if (!state.q) { nodeSel && nodeSel.attr("opacity", 1); }
    highlight();
  });

  addEventListener("resize", () => {
    W = svgEl.clientWidth; H = svgEl.clientHeight;
    svg.attr("viewBox", [0, 0, W, H]);
    sim.force("center", d3.forceCenter(W / 2, H / 2)).alpha(.3).restart();
  });

  apply();
})();
