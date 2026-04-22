/**
 * Fullscreen intro gate — click to enter (session remembered).
 */
(function initSiteGate() {
  const KEY = "ltGateEntered";
  const gate = document.getElementById("site-gate");
  const btn = gate?.querySelector(".site-gate-enter");
  const skip = document.querySelector(".skip");
  if (!gate || !btn) return;

  let dismissing = false;

  const motionReduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const focusAfterGate = () => {
    window.setTimeout(() => {
      const hash = (location.hash || "").replace("#", "");
      const mainEl = document.getElementById("main");
      const target =
        hash === "main" && mainEl ? mainEl : document.querySelector(".hero-title");
      if (target) target.focus({ preventScroll: hash !== "main" });
    }, 0);
  };

  const completeDismiss = () => {
    gate.setAttribute("hidden", "");
    gate.setAttribute("aria-hidden", "true");
    gate.classList.remove("is-leaving");
    document.body.style.overflow = "";
  };

  const dismissGate = () => {
    if (dismissing || gate.hasAttribute("hidden")) return;
    dismissing = true;
    sessionStorage.setItem(KEY, "1");
    document.body.classList.add("gate-done");

    if (motionReduced()) {
      completeDismiss();
      focusAfterGate();
      return;
    }

    gate.classList.add("is-leaving");
    window.setTimeout(() => {
      completeDismiss();
      focusAfterGate();
    }, 480);
  };

  if (sessionStorage.getItem(KEY) === "1") {
    document.body.classList.add("gate-done");
    gate.setAttribute("hidden", "");
    gate.setAttribute("aria-hidden", "true");
  } else {
    gate.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    queueMicrotask(() => btn.focus());
  }

  btn.addEventListener("click", dismissGate);
  gate.addEventListener("keydown", (e) => {
    if (e.key === "Escape") dismissGate();
  });
  skip?.addEventListener("click", dismissGate);
})();

/**
 * Highlight nav link for the section most visible in viewport.
 */
(function () {
  const sections = [
    { id: "about", bodyClass: "nav-highlight-about" },
    { id: "projects", bodyClass: "nav-highlight-projects" },
    { id: "showcase", bodyClass: "nav-highlight-showcase" },
    { id: "contact", bodyClass: "nav-highlight-contact" },
  ];

  const clear = () => {
    sections.forEach((s) => document.body.classList.remove(s.bodyClass));
  };

  const setActive = (bodyClass) => {
    clear();
    document.body.classList.add(bodyClass);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const id = visible.target.getAttribute("id");
      const hit = sections.find((s) => s.id === id);
      if (hit) setActive(hit.bodyClass);
    },
    { rootMargin: "-42% 0px -42% 0px", threshold: [0, 0.12, 0.25, 0.5] }
  );

  sections.forEach((s) => {
    const el = document.getElementById(s.id);
    if (el) observer.observe(el);
  });

  window.addEventListener("hashchange", () => {
    const h = (location.hash || "#about").slice(1);
    const hit = sections.find((s) => s.id === h);
    if (hit) setActive(hit.bodyClass);
  });

  const applyHash = () => {
    const h = (location.hash || "#about").replace("#", "");
    const hit = sections.find((s) => s.id === h);
    if (hit) setActive(hit.bodyClass);
    else setActive("nav-highlight-about");
  };

  applyHash();
})();

/** Showcase category filters */
(function () {
  const bar = document.querySelector(".filter-bar");
  const grid = document.getElementById("showcase-grid");
  if (!bar || !grid) return;

  const cards = Array.from(grid.querySelectorAll(".showcase-card"));
  const buttons = Array.from(bar.querySelectorAll(".filter-pill"));

  const apply = (filter) => {
    cards.forEach((card) => {
      const cats = (card.getAttribute("data-category") || "").split(/\s+/).filter(Boolean);
      const show = filter === "all" || cats.includes(filter);
      card.classList.toggle("is-hidden", !show);
    });
    buttons.forEach((btn) => {
      const on = btn.getAttribute("data-filter") === filter;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  };

  bar.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    const btn = t.closest(".filter-pill");
    if (!btn || !bar.contains(btn)) return;
    const f = btn.getAttribute("data-filter") || "all";
    apply(f);
  });

  buttons.forEach((btn) => btn.setAttribute("aria-pressed", btn.classList.contains("is-active") ? "true" : "false"));
  apply("all");
})();
