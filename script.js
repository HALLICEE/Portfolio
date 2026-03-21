function initializePortfolioHomePage() {
    if (
        document.body &&
        document.body.dataset &&
        document.body.dataset.projectDetailPage !== undefined
    ) {
        return;
    }

    const portfolioProjects = window.PortfolioProjects;

    if (!portfolioProjects) {
        return;
    }

    portfolioProjects.setupFilters(portfolioProjects.filterProjects);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePortfolioHomePage, { once: true });
} else {
    initializePortfolioHomePage();
}
