export const socialLinks = [
    { link: "https://github.com/adardev", iconSrc: "/icons/github_logo.svg", label: "/adardev" },
    { link: "https://www.linkedin.com/in/adardev", iconSrc: "/icons/linkedin_logo.svg", label: "/in/adardev" },
    { link: "https://www.youtube.com/@adardev1", iconSrc: "/icons/youtube_logo.svg", label: "/@adardev1" },
    { link: "https://maps.app.goo.gl/jgDoBZpe1rsiSNm7", iconSrc: "/icons/map_icon.svg", label: "Guadalajara, México" },
    { link: "tel:+", iconSrc: "/icons/phone_icon.svg", label: "+52 56 6588 6939" },
];
export const experiences = [
    {
        year: "2022", title: "Freelance", titleKey: "experienceFreelance",
        subtitle: "Desarrollo Web y movil", subtitleKey: "experienceFreelanceSubtitle",
        description: "Proyectos escolares y personales para el desarrollo de habilidades integrales.",
        descriptionKey: "experienceFreelanceDescription",
    },
    {
        year: "2025", title: "EPAM Systems", subtitle: "JS Internship", logo: "/logos/epam_logo.svg",
        description: "Responsable de componentes y utilidades web. Mejora del 30% en entrega de software.",
    },
    {
        year: "2025", title: "SANYULNET", titleKey: "experienceSanyulnet",
        subtitle: "Soporte técnico y servicios digitales", subtitleKey: "experienceSanyulnetSubtitle",
        description: "Diagnóstico de hardware y gestión de servicios digitales.",
        descriptionKey: "experienceSanyulnetDescription",
    },
];
export const projects = [
    {
        title: "Bytemana", titleKey: "projectBytemanaTitle",
        description: "Sistema integral para la gestión de inventarios y recursos en minisúper.",
        descKey: "projectBytemanaDesc", imagePath: "../assets/demos/tekkure_demo.jpg", logo: "/logos/adardev_logo.svg",
        platform: "/logos/windows_logo.svg", tech: ["/logos/php_logo.svg", "/logos/electron_logo.svg", "/logos/sql_logo.svg"],
        github: "https://github.com/adardev", live: "#",
    },
    {
        title: "Densora", titleKey: "projectDensoraTitle",
        description: "Plataforma de portafolio personal diseñada con un enfoque premium.",
        descKey: "projectDensoraDesc", imagePath: "../assets/demos/densora_demo.png", logo: "/logos/adardev_logo.svg",
        platform: null, tech: ["/logos/astro_logo.svg", "/logos/tailwind_logo.svg"],
        github: "https://github.com/adardev", live: "https://adardev.com",
    },
    {
        title: "Tekkure", titleKey: "projectTekkureTitle",
        description: "Experiencia musical inmersiva con enfoque minimalista.",
        descKey: "projectTekkureDesc", imagePath: "../assets/demos/tekkure_demo.jpg", logo: "/logos/adardev_logo.svg",
        platform: null, tech: ["/logos/electron_logo.svg", "/logos/astro_logo.svg", "/logos/tailwind_logo.svg"],
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
