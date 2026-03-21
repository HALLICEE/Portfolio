function getProjectsScriptPath() {
    return window.location.pathname.includes("/card-elements/")
        ? "../scripts/projects.js"
        : "./scripts/projects.js";
}

function initializePortfolioHomePage() {
    const portfolioProjects = window.PortfolioProjects;

    if (!portfolioProjects) {
        return;
    }

    if (document.body?.dataset?.projectDetailPage !== undefined) {
        return;
    }

    portfolioProjects.setupFilters(portfolioProjects.filterProjects);
}

function loadProjectsScript() {
    if (window.PortfolioProjects) {
        initializePortfolioHomePage();
        return;
    }

    const projectsScript = document.createElement("script");
    projectsScript.src = getProjectsScriptPath();
    projectsScript.dataset.portfolioProjects = "true";
    projectsScript.addEventListener("load", initializePortfolioHomePage, { once: true });
    document.head.append(projectsScript);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadProjectsScript, { once: true });
} else {
    loadProjectsScript();
}
