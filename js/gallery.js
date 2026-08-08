/* 아를의 그림 — 갤러리 + 라이트박스 */
(async () => {
  const data = await (await fetch("../data/art.json")).json();
  const works = data.works.filter(w => w.thumb);   // 이미지 확보된 작품만
  const grid = document.getElementById("galGrid");
  const empty = document.getElementById("galEmpty");

  const KO = () => document.documentElement.getAttribute("data-lang") !== "en";
  const paintings = works.filter(w => !w.drawing).length;
  const linked = works.filter(w => w.letters.length).length;

  const stats = document.getElementById("galStats");
  stats.innerHTML = `
    <span><b>${works.length}</b> <i data-en="works">점</i></span>
    <span><b>${paintings}</b> <i data-en="paintings">회화</i></span>
    <span><b>${works.length - paintings}</b> <i data-en="drawings">드로잉</i></span>
    <span><b>${linked}</b> <i data-en="mentioned in letters">편지에 언급</i></span>`;

  let filter = "all", q = "";

  function visible() {
    const needle = q.trim().toLowerCase();
    return works.filter(w => {
      if (filter === "painting" && w.drawing) return false;
      if (filter === "drawing" && !w.drawing) return false;
      if (filter === "letters" && !w.letters.length) return false;
      if (!needle) return true;
      return (w.title + " " + w.f + " " + w.jh).toLowerCase().includes(needle);
    });
  }

  let shown = [];

  function render() {
    shown = visible();
    grid.innerHTML = shown.map((w, i) => `
      <figure class="gal-card" data-i="${i}" tabindex="0">
        <div class="gal-thumb">
          <img src="../${w.thumb}" alt="${esc(w.title)}" loading="lazy">
          ${w.letters.length
            ? `<span class="gal-badge" title="언급한 편지 수">✉ ${w.letters.length}</span>` : ""}
          ${w.drawing ? `<span class="gal-tag" data-en="drawing">드로잉</span>` : ""}
        </div>
        <figcaption>
          <strong>${esc(w.title)}</strong>
          <span class="gal-f">${esc(w.f)}${w.date ? " · " + esc(w.date) : ""}</span>
        </figcaption>
      </figure>`).join("");
    empty.hidden = shown.length > 0;
  }

  // build_wiki.py 의 slugify 와 동일 규칙
  const slugify = s => (s || "").normalize("NFC").trim()
    .replace(/·/g, "-")
    .replace(/[\s/\\:*?"<>|#\[\]()]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");

  const esc = s => (s || "").replace(/[&<>"]/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- lightbox ---------- */
  const lb = document.getElementById("lb");
  const lbImg = document.getElementById("lbImg");
  let cur = -1;

  function open(i) {
    cur = (i + shown.length) % shown.length;
    const w = shown[cur];
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    lbImg.src = "../" + w.thumb;           // 즉시 표시(썸네일)
    lbImg.alt = w.title;
    const hi = new Image();                 // 고해상도로 교체
    hi.onload = () => { if (cur >= 0 && shown[cur] === w) lbImg.src = hi.src; };
    hi.src = w.full;

    document.getElementById("lbTitle").textContent = w.title;
    const bits = [w.drawing ? (KO() ? "드로잉" : "Drawing") : (KO() ? "회화" : "Painting")];
    if (w.f) bits.push(w.f);
    if (w.jh) bits.push(w.jh);
    if (w.date) bits.push(w.date);
    document.getElementById("lbMeta").textContent = bits.join(" · ");

    const box = document.getElementById("lbLetters");
    if (w.letters.length) {
      const head = KO() ? `이 그림을 언급한 편지 ${w.letters.length}편`
                        : `Mentioned in ${w.letters.length} letters`;
      // 편지 칩 → 해당 편지의 위키 문서로 이동
      box.innerHTML = `<p class="lb-lh">${head}</p>` + w.letters.map(l => {
        const slug = (w.letterSlugs && w.letterSlugs[l]) || "";
        const href = slug ? "../wiki/" + encodeURIComponent(slugify(slug)) + "/" : "#";
        return `<a href="${href}" class="lb-lchip" title="${esc(slug)}">${l}</a>`;
      }).join("");
    } else {
      box.innerHTML = `<p class="lb-lh">${KO() ? "아를 편지에서 직접 언급되지 않은 작품입니다."
                                              : "Not directly mentioned in the Arles letters."}</p>`;
    }
    document.getElementById("lbLinks").innerHTML =
      `<a href="../wiki/${encodeURIComponent(slugify(w.note))}/">${KO() ? "위키 문서" : "Wiki page"} →</a>
       <a href="${w.commons}" target="_blank" rel="noopener">Wikimedia Commons ↗</a>`;
  }

  function close() {
    lb.hidden = true; cur = -1;
    document.body.style.overflow = "";
  }

  grid.addEventListener("click", e => {
    const card = e.target.closest(".gal-card");
    if (card) open(+card.dataset.i);
  });
  grid.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const card = e.target.closest(".gal-card");
      if (card) open(+card.dataset.i);
    }
  });
  document.getElementById("lbClose").onclick = close;
  document.getElementById("lbPrev").onclick = () => open(cur - 1);
  document.getElementById("lbNext").onclick = () => open(cur + 1);
  lb.addEventListener("click", e => { if (e.target === lb) close(); });
  addEventListener("keydown", e => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") open(cur - 1);
    if (e.key === "ArrowRight") open(cur + 1);
  });

  /* ---------- controls ---------- */
  document.getElementById("galSearch").addEventListener("input", e => {
    q = e.target.value; render();
  });
  document.querySelectorAll(".gal-filters button").forEach(b =>
    b.addEventListener("click", () => {
      document.querySelectorAll(".gal-filters button").forEach(x => x.classList.remove("on"));
      b.classList.add("on"); filter = b.dataset.filter; render();
    }));

  render();
})();
