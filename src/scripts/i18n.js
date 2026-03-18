export function initI18n() {
    if (window.__i18nInitialized) {
        return;
    }
    window.__i18nInitialized = true;
    let activeRequest = 0;
    const localeCache = new Map();

    const getI18nNodes = () => ({
        textElements: document.querySelectorAll("[data-i18n]"),
        ariaElements: document.querySelectorAll("[data-i18n-aria-label]"),
    });

    const triggerTextAnimation = (textElements) => {
        textElements.forEach((el) => {
            el.classList.remove("opacity-0", "translate-y-1");
            // Force reflow so the loading transition can replay on every language change.
            void el.offsetWidth;
            el.classList.add("opacity-0", "translate-y-1");
        });
    };

    const setLanguage = async (lang) => {
        const requestId = ++activeRequest;
        const { textElements, ariaElements } = getI18nNodes();

        triggerTextAnimation(textElements);

        await new Promise((resolve) => setTimeout(resolve, 140));

        try {
            let data = localeCache.get(lang);
            if (!data) {
                const response = await fetch(`/locales/${lang}.json`, { cache: "no-store" });
                data = await response.json();
                localeCache.set(lang, data);
            }
            if (requestId !== activeRequest) {
                return;
            }
            window.i18nData = data;

            document.documentElement.lang = lang;

            textElements.forEach((el) => {
                const key = el.getAttribute("data-i18n");
                if (data[key]) {
                    el.textContent = data[key];
                }
            });

            ariaElements.forEach((el) => {
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
                textElements.forEach((el) => el.classList.remove("opacity-0", "translate-y-1"));
            });
        }
    };

    const initialLang = localStorage.getItem("language") || "es";
    setLanguage(initialLang);

    window.addEventListener("languageChanged", (e) => setLanguage(e.detail.language));
    window.addEventListener("astro:page-load", () => {
        const lang = localStorage.getItem("language") || initialLang;
        setLanguage(lang);
    });
}
