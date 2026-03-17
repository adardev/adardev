export function initI18n() {
    const setLanguage = async (lang) => {
        document.documentElement.lang = lang;

        // Cache management: only fetch if not already loaded
        if (!window.i18nData) window.i18nData = {};

        if (!window.i18nData[lang]) {
            try {
                const response = await fetch(`/locales/${lang}.json`);
                window.i18nData[lang] = await response.json();
            } catch (error) {
                console.error(`Failed to load translations for ${lang}:`, error);
                return;
            }
        }

        const data = window.i18nData[lang];

        // Smooth transition: fade out, swap content, fade in
        document.body.classList.add("switching-language");

        setTimeout(() => {
            document.querySelectorAll("[data-i18n]").forEach((el) => {
                const key = el.getAttribute("data-i18n");
                if (data[key]) el.innerText = data[key];
            });

            document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
                const key = el.getAttribute("data-i18n-aria-label");
                if (data[key]) el.setAttribute("aria-label", data[key]);
            });

            document.body.classList.remove("switching-language");
        }, 450);
    };

    const initialLang = localStorage.getItem("language") || "es";
    setLanguage(initialLang);

    window.addEventListener("languageChanged", (e) => setLanguage(e.detail.language));
}
