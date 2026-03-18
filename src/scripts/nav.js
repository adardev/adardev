export function initNav() {
    const state = window.__navState || {
        initialized: false,
        ticking: false,
        sections: [],
        navItems: [],
        flagEs: null,
        flagEn: null,
        langToggle: null,
    };
    window.__navState = state;

    function refreshRefs() {
        state.sections = Array.from(document.querySelectorAll("section"));
        state.navItems = Array.from(document.querySelectorAll("#navbar-container .nav-item"));
        state.flagEs = document.getElementById("flag-es");
        state.flagEn = document.getElementById("flag-en");
        state.langToggle = document.getElementById("language-toggle");
    }

    function updateLanguageUI() {
        const lang = localStorage.getItem("language") || "es";
        if (lang === "es") {
            state.flagEs?.classList.replace("hidden", "block");
            state.flagEn?.classList.replace("block", "hidden");
        } else {
            state.flagEs?.classList.replace("block", "hidden");
            state.flagEn?.classList.replace("hidden", "block");
        }
    }

    function toggleLanguage() {
        const currentLang = localStorage.getItem("language") || "es";
        const newLang = currentLang === "es" ? "en" : "es";
        localStorage.setItem("language", newLang);

        const event = new CustomEvent("languageChanged", { detail: { language: newLang } });
        window.dispatchEvent(event);
    }

    function updateActiveLink() {
        let current = "";
        const scrollY = window.scrollY;
        state.sections.forEach((section) => {
            if (scrollY >= section.offsetTop - section.clientHeight / 3) {
                current = section.getAttribute("id") || "";
            }
        });
        state.navItems.forEach((item) => {
            item.classList.toggle("nav-active", item.getAttribute("href") === `#${current}` || (current === "" && item.getAttribute("href") === "/"));
        });
    }

    function onScroll() {
        if (state.ticking) {
            return;
        }
        state.ticking = true;
        requestAnimationFrame(() => {
            updateActiveLink();
            state.ticking = false;
        });
    }

    refreshRefs();

    if (!state.initialized) {
        state.initialized = true;
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("languageChanged", updateLanguageUI);
    }

    if (state.langToggle && !state.langToggle.dataset.navBound) {
        state.langToggle.addEventListener("click", toggleLanguage);
        state.langToggle.dataset.navBound = "true";
    }

    updateLanguageUI();
    updateActiveLink();
}
