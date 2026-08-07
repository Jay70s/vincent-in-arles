/* 위키 KOR/ENG 전환.
   원리: 요소에 data-en 이 있으면 영어 텍스트로 교체(원문은 첫 전환 때 data-ko 에 보관).
        번역이 없는 한국어 서술은 .ko-only 로 표시해 ENG에서 감춘다. */
(() => {
  const KEY = "vwiki-lang";
  const root = document.documentElement;

  const SEARCH_TXT = {
    ko: { placeholder: "위키 검색…", zero_results: "'[SEARCH_TERM]' 검색 결과가 없습니다" },
    en: { placeholder: "Search the wiki…", zero_results: "No results for '[SEARCH_TERM]'" },
  };

  function apply(lang) {
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang === "en" ? "en" : "ko");

    document.querySelectorAll("[data-en]").forEach(el => {
      if (!el.hasAttribute("data-ko")) el.setAttribute("data-ko", el.innerHTML);
      el.innerHTML = lang === "en" ? el.getAttribute("data-en") : el.getAttribute("data-ko");
    });

    document.querySelectorAll("[data-setlang]").forEach(b =>
      b.setAttribute("aria-pressed", String(b.dataset.setlang === lang)));

    // 문서 제목도 함께
    const h1 = document.querySelector(".wdoc h1");
    if (h1) document.title = h1.textContent.trim() + " — Vincent Wiki";

    buildSearch(lang);
    try { localStorage.setItem(KEY, lang); } catch (e) {}
  }

  // 검색 UI는 여기서만 만든다(언어별 문구 반영 + 중복 생성 방지)
  function buildSearch(lang) {
    const host = document.getElementById("searchHost");
    if (!host || !window.PagefindUI) return;
    host.innerHTML = "";
    new window.PagefindUI({
      element: "#searchHost", showImages: false, pageSize: 8,
      translations: SEARCH_TXT[lang],
    });
  }

  function initial() {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "ko" || saved === "en") return saved;
    } catch (e) {}
    return (navigator.language || "").toLowerCase().startsWith("ko") ? "ko" : "en";
  }

  window.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-setlang]").forEach(btn =>
      btn.addEventListener("click", () => apply(btn.dataset.setlang)));
    apply(initial());   // 항상 호출 — 검색 UI 생성도 여기서 이뤄진다
  });
})();
