/* Vincent in Arles — renderer */

/* ---------- hero stars (deterministic, his palette) ---------- */
(function stars() {
  const box = document.getElementById("stars");
  let seed = 18880929; // the night he painted the Rhône
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 90; i++) {
    const s = document.createElement("i");
    const size = rand() * 2.2 + .6;
    s.style.width = s.style.height = size + "px";
    s.style.left = rand() * 100 + "%";
    s.style.top = rand() * 72 + "%";
    s.style.animationDelay = rand() * 4 + "s";
    s.style.animationDuration = 2.5 + rand() * 3 + "s";
    if (i % 11 === 0) s.className = "g";      // green sparkle
    else if (i % 13 === 0) s.className = "p"; // pink sparkle
    box.appendChild(s);
  }
})();

/* ---------- hero sound (원곡 풀버전, 영상 루프와 독립) ---------- */
(function sound() {
  const btn = document.getElementById("soundBtn");
  const audio = document.getElementById("heroAudio");
  if (!btn || !audio) return;
  btn.addEventListener("click", () => {
    if (audio.paused) {
      audio.volume = 0.85;
      audio.play().then(() => {
        btn.classList.add("on");
        btn.setAttribute("aria-pressed", "true");
        btn.innerHTML = "♪ &nbsp;Sound&nbsp;·&nbsp;on";
      }).catch(() => {});
    } else {
      audio.pause();
      btn.classList.remove("on");
      btn.setAttribute("aria-pressed", "false");
      btn.innerHTML = "♪ &nbsp;Sound&nbsp;·&nbsp;off";
    }
  });
})();

/* ---------- hero video: 화면 밖이면 재생 정지 (배터리 절약) ---------- */
(function heroVideoPerf() {
  const v = document.getElementById("heroVideo");
  if (!v) return;
  // HTML muted 속성만으로는 일부 크로미움에서 자동재생이 막힌다 — JS로 명시
  v.muted = true;
  v.play().catch(() => {});
  // 로드 레이스로 첫 play()가 중단될 수 있다 — 디코딩 준비되면 재시도
  v.addEventListener("canplay", () => v.play().catch(() => {}), { once: true });
  new IntersectionObserver(es => {
    es.forEach(e => { e.isIntersecting ? v.play().catch(() => {}) : v.pause(); });
  }, { threshold: 0 }).observe(v);
})();

/* ---------- progress spine ---------- */
const spineFill = document.getElementById("spineFill");
addEventListener("scroll", () => {
  const h = document.documentElement;
  spineFill.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + "%";
}, { passive: true });

/* ---------- chapters ---------- */
const P = "assets/paintings/";
const tl = document.getElementById("timeline");
CHAPTERS.forEach(ch => {
  const sec = document.createElement("section");
  sec.className = "chapter";
  sec.id = ch.id;
  sec.innerHTML = `
    <figure class="ch-fig">
      <img src="${P + ch.painting}" alt="${ch.paintingTitle}" loading="lazy">
      <figcaption>${ch.paintingTitle}</figcaption>
    </figure>
    <div class="ch-body">
      <p class="ch-kicker">${ch.kicker}</p>
      <h2 class="ch-title">${ch.title}</h2>
      <div class="ch-text">${ch.text.map(t => `<p>${t}</p>`).join("")}</div>
      <div class="ch-quote">
        <blockquote>“${ch.quote}”</blockquote>
        <cite>${ch.quoteSource}</cite>
      </div>
    </div>`;
  tl.appendChild(sec);
});

/* ---------- colours ---------- */
document.getElementById("colorsIntro").textContent = COLOR_STORY.intro;
document.getElementById("colorsImg").src = P + COLOR_STORY.painting;
document.getElementById("colorsCaption").textContent = COLOR_STORY.paintingTitle;
document.getElementById("colorsSource").textContent = "Every phrase above is Vincent's own — " + COLOR_STORY.quoteSource + ".";
const chips = document.getElementById("chips");
COLOR_STORY.chips.forEach((c, i) => {
  const el = document.createElement("div");
  el.className = "chip";
  el.style.transitionDelay = (i * 70) + "ms";
  el.innerHTML = `
    <span class="chip-swatch" style="background:${c.hex}"></span>
    <span class="chip-label">“${c.label}”</span>
    <span class="chip-hex">${c.hex}</span>`;
  el.addEventListener("click", () => {
    navigator.clipboard && navigator.clipboard.writeText(c.hex);
    el.classList.add("copied");
    const hexEl = el.querySelector(".chip-hex");
    const old = hexEl.textContent;
    hexEl.textContent = "copied";
    setTimeout(() => { hexEl.textContent = old; el.classList.remove("copied"); }, 1100);
  });
  chips.appendChild(el);
});

/* ---------- protagonist ---------- */
document.getElementById("protImg").src = P + VINCENT.img;
document.getElementById("protImgTitle").textContent = VINCENT.imgTitle;
document.getElementById("protName").textContent = VINCENT.name;
document.getElementById("protDates").textContent = VINCENT.dates;
document.getElementById("protText").innerHTML = VINCENT.paras.map(t => `<p>${t}</p>`).join("");
document.getElementById("protQuote").textContent = "“" + VINCENT.quote + "”";
document.getElementById("protQuoteSource").textContent = VINCENT.quoteSource;

/* ---------- people ---------- */
const grid = document.getElementById("peopleGrid");
PEOPLE.forEach((p, i) => {
  const el = document.createElement("article");
  el.className = "person";
  el.style.transitionDelay = (i * 90) + "ms";
  el.innerHTML = `
    <div class="person-media">
      <img src="${P + p.img}" alt="${p.name}" loading="lazy">
      ${p.imgNote ? `<span class="person-imgnote">${p.imgNote}</span>` : ""}
    </div>
    <div class="person-body">
      <h4>${p.name}</h4>
      <p class="person-role">${p.role}</p>
      <p>${p.note}</p>
    </div>`;
  grid.appendChild(el);
});

/* ---------- reveal on scroll ---------- */
/* threshold는 0이어야 한다 — 긴 섹션(People 등)은 화면 대비 비율이
   0.18에 영영 도달하지 못해 영원히 투명하게 남는다 */
const io = new IntersectionObserver(es => {
  es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
}, { threshold: 0, rootMargin: "0px 0px -6% 0px" });
document.querySelectorAll(".chapter, .colors, .people, .protagonist").forEach(el => io.observe(el));

/* ---------- map ---------- */
const map = L.map("leafletMap", { scrollWheelZoom: false }).setView(MAP_CENTER, 14);
L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
  maxZoom: 18
}).addTo(map);

const sunIcon = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:50%;
    background:#f4c430;border:2.5px solid #0d1b2e;
    box-shadow:0 0 0 3px rgba(244,196,48,.35), 0 2px 8px rgba(0,0,0,.4);"></div>`,
  iconSize: [18, 18], iconAnchor: [9, 9], popupAnchor: [0, -10]
});

PLACES.forEach(pl => {
  const img = pl.painting ? `<img src="${P + pl.painting}" alt="${pl.name}">` : "";
  L.marker(pl.coords, { icon: sunIcon })
    .addTo(map)
    .bindPopup(`<div class="popup">${img}
      <h4>${pl.name}</h4>
      <div class="sub">${pl.sub}</div>
      <p>${pl.note}</p></div>`, { maxWidth: 260 });
});
