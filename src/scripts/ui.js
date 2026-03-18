export function initUI() {
    const state = window.__uiState || {
        initialized: false,
        ticking: false,
        sections: [],
        navItems: [],
        experienceItems: [],
        heroLinks: null,
        skillCards: [],
        skillObserver: null,
        flagEs: null,
        flagEn: null,
        langToggle: null,
    };
    window.__uiState = state;

    const refreshRefs = () => {
        state.sections = Array.from(document.querySelectorAll("section[id]"));
        state.navItems = Array.from(document.querySelectorAll("#navbar-container .nav-item"));
        state.experienceItems = Array.from(document.querySelectorAll("#experience .experience-item"));
        state.heroLinks = document.getElementById("hero-links");
        state.skillCards = Array.from(document.querySelectorAll(".skill-card-container"));
        state.flagEs = document.getElementById("flag-es");
        state.flagEn = document.getElementById("flag-en");
        state.langToggle = document.getElementById("language-toggle");
    };

    const updateLanguageUI = () => {
        const lang = localStorage.getItem("language") || "es";
        if (lang === "es") {
            state.flagEs?.classList.replace("hidden", "block");
            state.flagEn?.classList.replace("block", "hidden");
        } else {
            state.flagEs?.classList.replace("block", "hidden");
            state.flagEn?.classList.replace("hidden", "block");
        }
    };

    const toggleLanguage = () => {
        const currentLang = localStorage.getItem("language") || "es";
        const nextLang = currentLang === "es" ? "en" : "es";
        localStorage.setItem("language", nextLang);
        window.dispatchEvent(new CustomEvent("languageChanged", { detail: { language: nextLang } }));
    };

    const updateActiveLink = () => {
        let current = "";
        const scrollY = window.scrollY;

        state.sections.forEach((section) => {
            if (scrollY >= section.offsetTop - section.clientHeight / 3) {
                current = section.getAttribute("id") || "";
            }
        });

        state.navItems.forEach((item) => {
            const isActive = item.getAttribute("href") === `#${current}` || (current === "" && item.getAttribute("href") === "/");
            item.classList.toggle("is-active", isActive);
            item.classList.toggle("bg-accent", isActive);
            item.classList.toggle("text-bg-dark", isActive);
            item.classList.toggle("shadow-[0_4px_12px_rgba(24,205,169,0.3)]", isActive);

            item.classList.toggle("text-body", !isActive);
            item.classList.toggle("hover:bg-bg-card-hover", !isActive);
            item.classList.toggle("hover:text-accent", !isActive);
        });
    };

    const updateHeroLinksState = () => {
        if (!state.heroLinks) {
            return;
        }
        const isMobile = window.matchMedia("(max-width: 639px)").matches;
        if (!isMobile) {
            state.heroLinks.classList.remove("is-center");
            return;
        }
        state.heroLinks.classList.toggle("is-center", window.scrollY < 24);
    };

    const updateExperienceFocus = () => {
        const centerY = window.innerHeight * 0.45;
        const threshold = window.innerHeight * 0.2;

        state.experienceItems.forEach((item) => {
            const rect = item.getBoundingClientRect();
            const itemCenterY = rect.top + rect.height / 2;
            item.classList.toggle("is-center", Math.abs(centerY - itemCenterY) < threshold);
        });
    };

    const updateSkillFocus = () => {
        if (state.skillCards.length === 0) {
            return;
        }
        const centerY = window.innerHeight / 2;
        const threshold = window.innerHeight * 0.25;

        state.skillCards.forEach((card) => {
            const rect = card.getBoundingClientRect();
            const cardCenterY = rect.top + rect.height / 2;
            card.classList.toggle("is-center", Math.abs(centerY - cardCenterY) < threshold);
        });
    };

    const setupSkillObserver = () => {
        if (!state.skillObserver) {
            state.skillObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting) {
                            return;
                        }
                        const delay = Math.random() * 180;
                        setTimeout(() => {
                            entry.target.classList.remove("opacity-0", "scale-90");
                            entry.target.classList.add("opacity-100", "scale-100");
                        }, delay);
                    });
                },
                { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
            );
        }

        state.skillCards.forEach((card) => state.skillObserver.observe(card));
    };

    const render = () => {
        updateActiveLink();
        updateHeroLinksState();
        updateExperienceFocus();
        updateSkillFocus();
    };

    const onScrollOrResize = () => {
        if (state.ticking) {
            return;
        }
        state.ticking = true;
        requestAnimationFrame(() => {
            render();
            state.ticking = false;
        });
    };

    refreshRefs();
    setupSkillObserver();

    if (!state.initialized) {
        state.initialized = true;
        window.addEventListener("scroll", onScrollOrResize, { passive: true });
        window.addEventListener("resize", onScrollOrResize, { passive: true });
        window.addEventListener("languageChanged", updateLanguageUI);
    }

    if (state.langToggle && state.langToggle.dataset.uiBound !== "true") {
        state.langToggle.addEventListener("click", toggleLanguage);
        state.langToggle.dataset.uiBound = "true";
    }

    updateLanguageUI();
    render();
    setTimeout(render, 120);
}


