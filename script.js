import PortfolioProjects from './projects.js';

PortfolioProjects.filterProjects();
console.log(PortfolioProjects.projectData);

const portfolioProjects = window.PortfolioProjects;

if (portfolioProjects) {
    portfolioProjects.setupFilters(portfolioProjects.filterProjects);
}
