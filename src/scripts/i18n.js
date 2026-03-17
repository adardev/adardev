export function initI18n() {
    if (window.__i18nInitialized) {
        return;
    }
    window.__i18nInitialized = true;

    const setLanguage = async (lang) => {
        const elements = document.querySelectorAll("[data-i18n], [data-i18n-aria-label]");

        elements.forEach((el) => el.classList.add("i18n-animate"));
        elements.forEach((el) => el.classList.add("i18n-loading"));

        await new Promise((resolve) => setTimeout(resolve, 140));

        try {
            const response = await fetch(`/locales/${lang}.json`);
            const data = await response.json();
            window.i18nData = data;

            document.documentElement.lang = lang;

            document.querySelectorAll("[data-i18n]").forEach((el) => {
                const key = el.getAttribute("data-i18n");
                if (data[key]) {
                    el.innerText = data[key];
                }
            });

            document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
                const key = el.getAttribute("data-i18n-aria-label");
                if (data[key]) {
                    el.setAttribute("aria-label", data[key]);
                }
            });

            const event = new CustomEvent("languageUpdated", { detail: { language: lang } });
            window.dispatchEvent(event);

        } catch (error) {
            console.error("Error loading language file:", error);
        } finally {
            requestAnimationFrame(() => {
                elements.forEach((el) => el.classList.remove("i18n-loading"));
            });
        }
    };

    const initialLang = localStorage.getItem("language") || "es";
    setLanguage(initialLang);

    window.addEventListener("languageChanged", (e) => setLanguage(e.detail.language));
}
