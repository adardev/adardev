export function initHeroLinks() {
    const heroLinks = document.getElementById("hero-links");
    if (!heroLinks) {
        return;
    }

    const state = window.__heroLinksState || { ticking: false };
    window.__heroLinksState = state;

    function updateHeroLinksState() {
        const isMobile = window.matchMedia("(max-width: 639px)").matches;
        if (!isMobile) {
            heroLinks.classList.remove("is-center");
            return;
        }

        // Expanded on load; compresses as soon as user starts scrolling.
        heroLinks.classList.toggle("is-center", window.scrollY < 24);
    }

    function onHeroLinksScroll() {
        if (state.ticking) {
            return;
        }
        state.ticking = true;
        requestAnimationFrame(() => {
            updateHeroLinksState();
            state.ticking = false;
        });
    }

    const root = document.documentElement;
    if (root.dataset.heroLinksBound !== "true") {
        root.dataset.heroLinksBound = "true";
        window.addEventListener("scroll", onHeroLinksScroll, { passive: true });
        window.addEventListener("resize", onHeroLinksScroll, { passive: true });
    }

    updateHeroLinksState();
    setTimeout(updateHeroLinksState, 80);
}

