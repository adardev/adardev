export const socialLinks = [
    { link: "https://github.com/adardev", iconSrc: "/icons/github_logo.svg", label: "/adardev" },
    { link: "https://www.linkedin.com/in/adardev", iconSrc: "/icons/linkedin_logo.svg", label: "/in/adardev" },
    { link: "https://www.youtube.com/@adardev1", iconSrc: "/icons/youtube_logo.svg", label: "/@adardev1" },
    { link: "https://maps.app.goo.gl/jgDoBZpe1rsiSNm7", iconSrc: "/icons/map_icon.svg", label: "Guadalajara, México" },
    { link: "tel:+523330362181", iconSrc: "/icons/phone_icon.svg", label: "33 3036 2181" },
];
export const experiences = [
    {
        year: "2022", title: "Freelance", titleKey: "experienceFreelance",
        subtitle: "Desarrollo Web y Móvil", subtitleKey: "experienceFreelanceSubtitle",
        description: "Proyectos escolares y personales enfocados en el desarrollo de habilidades integrales en programación web y móvil.",
        descriptionKey: "experienceFreelanceDescription",
    },
    {
        year: "2025", title: "SANYULNET Soluciones Tecnológicas", titleKey: "experienceSanyulnet",
        subtitle: "Área Técnica y Servicios Digitales · 6 meses", subtitleKey: "experienceSanyulnetSubtitle",
        description: "Responsable del área técnica y de servicios digitales: diagnósticos y reparaciones de hardware en celulares, pantallas, impresoras y dispositivos electrónicos. Gestión de la atención en el ciber facilitando trámites administrativos, proyectos de impresión y trabajos creativos, brindando soporte técnico inmediato.",
        descriptionKey: "experienceSanyulnetDescription",
    },
];
export const projects = [
    {
        title: "Bytemana", titleKey: "projectBytemanaTitle",
        description: "Sistema integral para la gestión de inventarios y recursos en minisúper.",
        descKey: "projectBytemanaDesc", imagePath: "../assets/demos/tekkure_demo.jpg", logo: "/logos/adardev_logo.svg",
        category: "Systems & Desktop",
        categoryKey: "categorySystems",
        platform: "/logos/windows_logo.svg",
        tech: [
            { name: "PHP", icon: "/logos/php_logo.svg", role: "Backend & lógica central" },
            { name: "Electron", icon: "/logos/electron_logo.svg", role: "App de escritorio" },
            { name: "SQL", icon: "/logos/sql_logo.svg", role: "Base de datos relacional" },
        ],
        metrics: ["500+ productos", "Módulo de ventas", "Reportes PDF"],
        metricsKeys: ["projectBytemanaMetric1", "projectBytemanaMetric2", "projectBytemanaMetric3"],
        github: "https://github.com/adardev", live: "#",
    },
    {
        title: "Densora", titleKey: "projectDensoraTitle",
        description: "Plataforma de gestión dental inteligente: App móvil Flutter, Portal Web Astro/React y Chatbot Python para citas por WhatsApp, respaldado por Firebase.",
        descKey: "projectDensoraDesc", imagePath: "../assets/demos/densora_demo.png", logo: "/logos/adardev_logo.svg",
        category: "Full Stack & AI",
        categoryKey: "categoryFullStack",
        platform: null,
        tech: [
            { name: "Astro", icon: "/logos/astro_logo.svg", role: "Portal web & SEO" },
            { name: "Flutter", icon: "/logos/flutter_logo.svg", role: "App móvil multiplataforma" },
            { name: "Firebase", icon: "/logos/firebase_logo.svg", role: "Base de datos en tiempo real" },
            { name: "Python", icon: "/logos/python_logo.svg", role: "Chatbot de citas por WhatsApp" },
        ],
        metrics: ["En desarrollo", "3 plataformas", "WhatsApp automatizado"],
        metricsKeys: ["projectDensoraMetric1", "projectDensoraMetric2", "projectDensoraMetric3"],
        github: "https://github.com/adardev", live: "https://adardev.com",
    },
    {
        title: "Tekkure", titleKey: "projectTekkureTitle",
        description: "Experiencia musical inmersiva con enfoque minimalista.",
        descKey: "projectTekkureDesc", imagePath: "../assets/demos/tekkure_demo.jpg", logo: "/logos/adardev_logo.svg",
        category: "UX/UI & Desktop",
        categoryKey: "categoryUXUI",
        platform: null,
        tech: [
            { name: "Electron", icon: "/logos/electron_logo.svg", role: "App de escritorio cross-platform" },
            { name: "Astro", icon: "/logos/astro_logo.svg", role: "Interfaz y estructura web" },
            { name: "Tailwind", icon: "/logos/tailwind_logo.svg", role: "Diseño y estilos premium" },
        ],
        metrics: ["Reproductor nativo", "UI minimalista", "Electron + Astro"],
        metricsKeys: ["projectTekkureMetric1", "projectTekkureMetric2", "projectTekkureMetric3"],
        github: "https://github.com/adardev", live: "#",
    },
];
export const skillCategories = [
    {
        title: "Front", i18nTitle: "skillsFront",
        skills: [
            { name: "HTML5", icon: "/logos/html5_logo.svg", i18nExp: "skillHtmlExp" },
            { name: "CSS3", icon: "/logos/css3_logo.svg", i18nExp: "skillCssExp" },
            { name: "JavaScript", icon: "/logos/js_logo.svg", i18nExp: "skillJsExp" },
            { name: "React", icon: "/logos/react_logo.svg", i18nExp: "skillReactExp" },
            { name: "Astro", icon: "/logos/astro_logo.svg", i18nExp: "skillAstroExp" },
            { name: "Tailwind", icon: "/logos/tailwind_logo.svg", i18nExp: "skillTailwindExp" },
            { name: "Bootstrap", icon: "/logos/bootstrap_logo.svg", i18nExp: "skillBootstrapExp" },
        ],
    },
    {
        title: "Back", i18nTitle: "skillsBack",
        skills: [
            { name: "Node.js", icon: "/logos/nodejs_logo.svg", i18nExp: "skillNodejsExp" },
            { name: "PHP", icon: "/logos/php_logo.svg", i18nExp: "skillPhpExp" },
            { name: "Python", icon: "/logos/python_logo.svg", i18nExp: "skillPythonExp" },
            { name: "Django", icon: "/logos/django_logo.svg", i18nExp: "skillDjangoExp" },
            { name: "Flutter", icon: "/logos/flutter_logo.svg", i18nExp: "skillFlutterExp" },
            { name: "Dart", icon: "/logos/dart_logo.svg", i18nExp: "skillDartExp" },
            { name: "Electron", icon: "/logos/electron_logo.svg", i18nExp: "skillElectronExp" },
            { name: "C++", icon: "/logos/cpp_logo.svg", i18nExp: "skillCppExp" },
            { name: "C#", icon: "/logos/csharp_logo.svg", i18nExp: "skillCsharpExp" },
            { name: "Java", icon: "/logos/java_logo.svg", i18nExp: "skillJavaExp" },
            { name: "Kotlin", icon: "/logos/kotlin_logo.svg", i18nExp: "skillKotlinExp" },
        ],
    },
    {
        title: "BD", i18nTitle: "skillsBD",
        skills: [
            { name: "SQL", icon: "/logos/sql_logo.svg", i18nExp: "skillSqlExp" },
            { name: "Supabase", icon: "/logos/supabase_logo.svg", i18nExp: "skillSupabaseExp" },
            { name: "Firebase", icon: "/logos/firebase_logo.svg", i18nExp: "skillFirebaseExp" },
            { name: "MongoDB", icon: "/logos/mongodb_logo.svg", i18nExp: "skillMongodbExp" },
        ],
    },
    {
        title: "Herramientas", i18nTitle: "skillsHerramientas",
        skills: [
            { name: "Git", icon: "/logos/git_logo.svg", i18nExp: "skillGitExp" },
            { name: "Docker", icon: "/logos/docker_logo.svg", i18nExp: "skillDockerExp" },
            { name: "Notion", icon: "/logos/notion_logo.svg", i18nExp: "skillNotionExp" },
        ],
    },
    {
        title: "Diseño", i18nTitle: "skillsDesign",
        skills: [
            { name: "Figma", icon: "/logos/figma_logo.svg", i18nExp: "skillFigmaExp" },
            { name: "MockFlow", icon: "/logos/mockflow_logo.svg", i18nExp: "skillMockflowExp" },
            { name: "Photoshop", icon: "/logos/photoshop_logo.svg", i18nExp: "skillPhotoshopExp" },
            { name: "Illustrator", icon: "/logos/ilustrator_logo.svg", i18nExp: "skillIllustratorExp" },
            { name: "Adobe XD", icon: "/logos/xd_logo.svg", i18nExp: "skillXdExp" },
        ],
    },
];
