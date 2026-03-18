export const projects = [
    {
        title: "Densora", titleKey: "projectDensoraTitle",
        description: "Plataforma de portafolio personal diseñada con un enfoque premium.",
        descKey: "projectDensoraDesc", imagePath: "../assets/demos/densora_demo.png", logo: "/logos/densora_logo.svg",
        platform: null,
        metrics: ["projectDensoraMetric1", "projectDensoraMetric2", "projectDensoraMetric3"],
        tech: [
            { icon: "/logos/astro_logo.svg", name: "Astro", role: "Framework" },
            { icon: "/logos/flutter_logo.svg", name: "Flutter", role: "Mobile App" },
            { icon: "/logos/firebase_logo.svg", name: "Firebase", role: "Backend/DB" }
        ],
        github: "https://github.com/adardev", live: "https://adardev.com",
    },
    {
        title: "Tekkure", titleKey: "projectTekkureTitle",
        description: "Soporte técnico, servicios de IT y desarrollo de software a medida.",
        descKey: "projectTekkureDesc", imagePath: "../assets/demos/tekkure_demo.png", logo: "/logos/tekkure_light.svg",
        platform: null,
        metrics: ["projectTekkureMetric1", "projectTekkureMetric2", "projectTekkureMetric3"],
        tech: [
            { icon: "/logos/astro_logo.svg", name: "Astro", role: "Framework" },
            { icon: "/logos/tailwind_logo.svg", name: "Tailwind", role: "UI Design" }
        ],
        github: "https://github.com/adardev", live: "#",
    },
];