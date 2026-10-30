(function () {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);
  const RM = matchMedia("(prefers-reduced-motion:reduce)").matches;
  const root = document.documentElement;

  /* ---------- Theme Toggle ---------- */
  function setTheme(t) {
    root.setAttribute("data-bs-theme", t);
    try {
      localStorage.setItem("theme", t);
    } catch (e) {}
    const b = $("#themeToggle");
    if (b) {
      b.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
    }
  }

  setTheme(root.getAttribute("data-bs-theme") || "dark");

  const themeBtn = $("#themeToggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      setTheme(root.getAttribute("data-bs-theme") === "dark" ? "light" : "dark");
    });
  }

  /* ---------- Footer Year ---------- */
  const yrEl = $("#yr");
  if (yrEl) yrEl.textContent = new Date().getFullYear();

  /* ---------- Hero Word Animation ---------- */
  (function () {
    if (RM) return;
    const heroTitle = $("#h1");
    if (!heroTitle) return;

    let i = 0;
    const wrap = (n) => {
      if (n.nodeType === 3) {
        const f = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((t) => {
          if (!t.trim()) {
            f.append(t);
            return;
          }
          const s = document.createElement("span");
          s.className = "w";
          s.textContent = t;
          s.style.animationDelay = 0.15 + i++ * 0.07 + "s";
          f.append(s);
        });
        n.replaceWith(f);
      } else {
        [...n.childNodes].forEach(wrap);
      }
    };
    wrap(heroTitle);
  })();

  /* ---------- Page Loader ---------- */
  addEventListener("load", () => setTimeout(() => $("#load")?.classList.add("h"), 250));
  setTimeout(() => $("#load")?.classList.add("h"), 2000);

  /* ---------- Smooth Navigation Link Scroll & Active State ---------- */
  const navLinks = $$("#mainNav .nav-link");
  
  navLinks.forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (!targetId || !targetId.startsWith("#")) return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const navHeight = $("#nav") ? $("#nav").offsetHeight : 70;
        const targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth"
        });

        // Set active class immediately on click
        navLinks.forEach((l) => l.classList.remove("active"));
        this.classList.add("active");

        // Close mobile collapse if open
        const menu = $("#navMenu");
        if (menu && menu.classList.contains("show")) {
          const bsCollapse = bootstrap.Collapse.getInstance(menu);
          if (bsCollapse) bsCollapse.hide();
        }
      }
    });
  });

  /* ---------- Scroll Progress, Nav State & Active Link Highlighting ---------- */
  const nav = $("#nav");
  const toTop = $("#top");
  const sections = $$("header[id], section[id]");

  function updateNavOnScroll() {
    const scrollPos = window.pageYOffset + 180;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("active");
          }
        });
      }
    });
  }

  function prog() {
    const tl = $("#tl");
    if (tl) {
      const t = tl.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.6 - t.top) / t.height));
      const fill = $("#fill");
      if (fill) fill.style.height = p * 100 + "%";
    }

    const stepsEl = $("#steps");
    if (stepsEl) {
      const sp = stepsEl.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (innerHeight * 0.85 - sp.top) / (innerHeight * 0.5)));
      $$(".step").forEach((s, i) => s.classList.toggle("on", ratio > i / 5 + 0.05));
    }
  }

  addEventListener("scroll", () => {
    if (nav) nav.classList.toggle("s", scrollY > 20);
    if (toTop) toTop.classList.toggle("v", scrollY > 700);
    prog();
    updateNavOnScroll();
  }, { passive: true });

  prog();
  updateNavOnScroll();

  if (toTop) {
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ---------- Intersection Observer (Reveal Elements) ---------- */
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- Mouse & Pointer Effects (Desktop Only) ---------- */
  if (matchMedia("(hover:hover) and (pointer:fine)").matches && !RM) {
    const g = $("#glow");
    if (g) {
      addEventListener("mousemove", (e) => {
        g.style.left = e.clientX + "px";
        g.style.top = e.clientY + "px";
      });
    }

    document.addEventListener("mousemove", (e) => {
      const c = e.target.closest && e.target.closest(".app-card");
      if (c) {
        const r = c.getBoundingClientRect();
        c.style.setProperty("--mx", e.clientX - r.left + "px");
        c.style.setProperty("--my", e.clientY - r.top + "px");
      }
    });

    $$(".mag").forEach((b) => {
      b.addEventListener("mousemove", (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      b.addEventListener("mouseleave", () => (b.style.transform = ""));
    });
  }

  /* ---------- WhatsApp Contact Form Handler ---------- */
  const form = $("#f");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const n = $("#fn"), m = $("#fe"), g = $("#fg"), s = $("#st");
      if ($("#hp") && $("#hp").value) return; // Honeypot validation

      const checks = [
        [n, n.value.trim().length < 2],
        [m, !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.value)],
        [g, g.value.trim().length < 10]
      ];

      let ok = true;
      checks.forEach(([el, bad]) => {
        if (el) {
          el.classList.toggle("is-invalid", bad);
          if (bad) ok = false;
        }
      });

      if (!ok) {
        if (s) {
          s.className = "mt-3 mb-0 small bad";
          s.textContent = "Please fix the highlighted fields.";
        }
        return;
      }

      const marketplaceSelect = $("#fm") ? $("#fm").value : "General Inquiry";
      const messageText = `Hello Malik, I’m ${n.value.trim()} (${m.value.trim()}). Marketplace: ${marketplaceSelect}.\n\n${g.value.trim()}`;

      if (s) {
        s.className = "mt-3 mb-0 small ok";
        s.textContent = "Thank you! Opening WhatsApp to send your message…";
      }

      window.open("https://wa.me/923024006267?text=" + encodeURIComponent(messageText), "_blank", "noopener");
      e.target.reset();
      checks.forEach(([el]) => el && el.classList.remove("is-invalid"));
    });
  }
})();