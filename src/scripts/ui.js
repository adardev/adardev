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



    const setupFocusObservers = () => {

        if (state.focusObserver) return;

        // Observer for "is-center" focus effect (30% to 70% of viewport)
        state.focusObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    entry.target.classList.toggle("is-center", entry.isIntersecting);
                });
            },
            {
                rootMargin: "-30% 0px -30% 0px",
                threshold: 0,
            },
        );

        state.experienceItems.forEach((item) => state.focusObserver.observe(item));
        state.skillCards.forEach((card) => state.focusObserver.observe(card));
    };

    const setupNavObserver = () => {
        if (state.navObserver) return;

        state.navObserver = new IntersectionObserver(
            (entries) => {
                // Find the section that is most visible
                const visibleSection = entries.find((e) => e.isIntersecting);
                if (visibleSection) {
                    const id = visibleSection.target.getAttribute("id");
                    updateNavUI(id);
                }
            },
            {
                rootMargin: "-20% 0px -70% 0px", // Trigger when top of section is in upper part
                threshold: 0,
            },
        );

        state.sections.forEach((section) => state.navObserver.observe(section));
    };

    const updateNavUI = (currentId) => {
        state.navItems.forEach((item) => {
            const isActive = item.getAttribute("href") === `#${currentId}` || (currentId === "" && item.getAttribute("href") === "/");
            item.classList.toggle("is-active", isActive);
            item.classList.toggle("bg-accent", isActive);
            item.classList.toggle("text-bg-dark", isActive);
            item.classList.toggle("shadow-[0_4px_12px_rgba(24,205,169,0.3)]", isActive);

            item.classList.toggle("text-body", !isActive);
            item.classList.toggle("sm:hover:bg-bg-card-hover", !isActive);
            item.classList.toggle("sm:hover:text-accent", !isActive);
        });
    };

    refreshRefs();
    setupFocusObservers();
    setupNavObserver();

    if (!state.initialized) {
        state.initialized = true;
        window.addEventListener("languageChanged", updateLanguageUI);
    }

    if (state.langToggle && state.langToggle.dataset.uiBound !== "true") {
        state.langToggle.addEventListener("click", toggleLanguage);
        state.langToggle.dataset.uiBound = "true";
    }

    updateLanguageUI();

    // Set first nav item as active by default on load
    if (state.navItems.length > 0) {
        const firstHref = state.navItems[0].getAttribute("href");
        if (firstHref && firstHref.startsWith("#")) {
            updateNavUI(firstHref.substring(1));
        }
    }
}


