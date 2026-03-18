export function initExperienceFocus() {
    const section = document.getElementById("experience");
    if (!section) {
        return;
    }

    const state = window.__experienceFocusState || { ticking: false };
    window.__experienceFocusState = state;

    function updateExperienceFocus() {
        const items = section.querySelectorAll(".experience-item");
        const centerY = window.innerHeight * 0.45;
        const threshold = window.innerHeight * 0.2;

        items.forEach((item) => {
            const rect = item.getBoundingClientRect();
            const itemCenterY = rect.top + rect.height / 2;
            item.classList.toggle("is-center", Math.abs(centerY - itemCenterY) < threshold);
        });
    }

    function onExperienceScroll() {
        if (state.ticking) {
            return;
        }
        state.ticking = true;
        requestAnimationFrame(() => {
            updateExperienceFocus();
            state.ticking = false;
        });
    }

    const root = document.documentElement;
    if (root.dataset.experienceFocusBound !== "true") {
        root.dataset.experienceFocusBound = "true";
        window.addEventListener("scroll", onExperienceScroll, { passive: true });
        window.addEventListener("resize", onExperienceScroll, { passive: true });
    }

    updateExperienceFocus();
    setTimeout(updateExperienceFocus, 80);
}

