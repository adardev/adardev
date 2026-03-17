export function initNav() {
    if (window.__navInitialized) {
        return;
    }
    window.__navInitialized = true;

    const sections = document.querySelectorAll("section");
    const navItems = document.querySelectorAll("#navbar-container .nav-item");
    const flagEs = document.getElementById("flag-es");
    const flagEn = document.getElementById("flag-en");
    const langToggle = document.getElementById("language-toggle");

    function updateLanguageUI() {
        const lang = localStorage.getItem("language") || "es";
        if (lang === "es") {
            flagEs?.classList.replace("hidden", "block");
            flagEn?.classList.replace("block", "hidden");
        } else {
            flagEs?.classList.replace("block", "hidden");
            flagEn?.classList.replace("hidden", "block");
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
        sections.forEach((section) => {
            if (scrollY >= section.offsetTop - section.clientHeight / 3) {
                current = section.getAttribute("id") || "";
            }
        });
        navItems.forEach((item) => {
            item.classList.toggle("nav-active", item.getAttribute("href") === `#${current}` || (current === "" && item.getAttribute("href") === "/"));
        });
    }

    langToggle?.addEventListener("click", toggleLanguage);
    window.addEventListener("scroll", updateActiveLink);
    window.addEventListener("languageChanged", updateLanguageUI);

    updateLanguageUI();
    updateActiveLink();
}
