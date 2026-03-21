// Edit this category tree when you want to change the filter list at the top.
const projectFilters = {
    Apps: {
        Games: {
            PvP: {},
            Idle: {},
            Comfy: {}
        },
        Trackers: {
            Habit: {},
            Finance: {},
            Study: {}
        },
    },
    Websites: {
        Services: {
            Booking: {
                Beauty: {},
                Restaurants: {},
            }
        },
    }
};


const projectData = [
    {
        id: "theflourjar",
        title: "The Flour Jar",
        categories: ["Websites", "Services", "Booking", "Restaurants"],
        date: "2026-03-20",
        summary: "No booking feature. Neighborhood bakery site with a croissant menu, featured pastry, reviews, and visit info.",
        metaDescription: "Project details for The Flour Jar, a neighborhood bakery site concept with a featured pastry, category menu, reviews, and bakery visit information.",
        thumbnailPath: "./assets/thumbnails/Flourjarthumbnail.jpeg",
        thumbnailAlt: "Preview of The Flour Jar bakery site",
        projectLink: "https://hallicee.github.io/TheFlourJar/",
        buttonLabel: "Test Now",
        overview: "This project is a bakery website concept and does not include a booking flow. It is built around a croissant-focused menu, a featured signature pastry, playful review moments, and clear bakery visit details.",
        testSteps: [
            "Use the top navigation to jump between Menu, Star Treat, and Visit.",
            "Scroll through the hero, featured pastry, reviews, and bakery info sections to check the reveal animations.",
            "In the menu section, click All, Classic, Filled, and Specialty to confirm the pastry cards filter correctly.",
            "Check that the featured pastry section and the review cards display as expected.",
            "Open the Visit section and confirm the address, hours, contact details, and bakery note are all visible."
        ]
    },
    {
        id: "nailsbyt",
        title: "NailsbyT",
        categories: ["Websites", "Services", "Booking", "Beauty"],
        date: "2026-03-17",
        summary: "Booking site with an owner dashboard for appointment management.",
        metaDescription: "Project details for NailsbyT, a boutique nail studio booking site with an owner dashboard for appointment management.",
        thumbnailPath: "./assets/thumbnails/NailsbyT Thumbnail.001.jpeg",
        thumbnailAlt: "Preview of the NailsbyT booking site",
        projectLink: "https://hallicee.github.io/NailsByT/",
        buttonLabel: "Test Now",
        overview: "This project showcases an appointment booking system. Visitors can explore services, browse a styled gallery, and submit a booking request with inspo uploads and scheduling details. On the admin side, the owner can review requests, assign appointment times, prepare deposit communication, confirm final bookings, and manage cancellations from the dashboard calendar.",
        testSteps: [
            "Use the public navigation to move through Services, Gallery, Booking, and Contact.",
            "Open the booking form and submit a request with a date, a service selection, and at least one inspo image.",
            "Try an invalid path as well, such as skipping the inspo upload or choosing an out-of-hours request without notes, to see the validation messaging.",
            "Inside, open Owner Login at the bottom of the site and sign in with the password Password123.",
            "In the dashboard, review the booking, assign a time, trigger the deposit stage, mark the deposit as paid, and confirm the appointment.",
            "Click the booked date on the owner calendar, open the saved appointment, start the cancellation flow, and confirm the cancellation to remove it.",
            "After confirming a booking, revisit the form and check that confirmed standard slots are greyed out and unavailable."
        ]
    }
];

const projectDefaults = {
    buttonLabel: "Test Now",
    metaDescription: "Project details",
    summary: "",
    overview: "",
    testSteps: []
};

const normalizedProjectData = projectData.map((project) => {
    return {
        ...projectDefaults,
        ...project
    };
});

const projectLookup = new Map(normalizedProjectData.map((project) => [project.id, project]));

function matchesSelectedPath(projectCategories, selectedPath) {
    if (selectedPath.length === 0) return true;
    if (projectCategories.length < selectedPath.length) return false;

    return selectedPath.every((selectedCategory, index) => {
        return projectCategories[index] === selectedCategory;
    });
}

function getRepoBasePath() {
    return window.location.pathname.includes("/card-elements/") ? "../../" : "../";
}

function toRepoPath(path) {
    if (!path) return "";
    if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith("mailto:") || path.startsWith("#")) {
        return path;
    }

    return `${getRepoBasePath()}${path}`;
}

function getContent() {
    return document.querySelector(".content");
}

function createProjectThumbnail(project) {
    const thumbnail = document.createElement("div");
    thumbnail.className = "project-thumbnail";

    if (project.thumbnailPath) {
        const image = document.createElement("img");
        image.className = "project-thumbnail-image";
        image.src = toRepoPath(project.thumbnailPath);
        image.alt = project.thumbnailAlt || `Preview of ${project.title}`;
        thumbnail.append(image);
        return thumbnail;
    }

    thumbnail.classList.add("is-placeholder");

    const label = document.createElement("span");
    label.className = "project-thumbnail-label";
    label.textContent = "Thumbnail coming soon";
    thumbnail.append(label);

    return thumbnail;
}

function createProjectCard(project) {
    const card = document.createElement("div");
    card.className = "project-card project-card-featured";
    card.id = project.id;

    const link = document.createElement("a");
    link.className = "project-card-link";
    link.href = `card-elements/project.html?id=${encodeURIComponent(project.id)}`;
    link.setAttribute("aria-label", `View ${project.title} project details`);

    const summary = document.createElement("div");
    summary.className = "project-card-summary";

    const title = document.createElement("h2");
    title.textContent = project.title;

    const caption = document.createElement("p");
    caption.className = "project-caption";
    caption.textContent = project.summary;

    summary.append(title, caption);
    link.append(createProjectThumbnail(project), summary);
    card.append(link);

    return card;
}

function createEmptyState(selectedPath) {
    const emptyState = document.createElement("article");
    emptyState.className = "project-empty-state";

    const title = document.createElement("h2");
    title.textContent = "No cards match that filter yet";

    const description = document.createElement("p");
    description.textContent = selectedPath.length === 0
        ? "Add a project in scripts/projects.js and it will show up here automatically."
        : `Try a different filter path than ${selectedPath.join(" > ")}.`;

    emptyState.append(title, description);
    return emptyState;
}

function filterProjects(selectedPath = []) {
    const content = getContent();

    if (!content) return;

    const matchingProjects = normalizedProjectData.filter((project) => {
        return matchesSelectedPath(project.categories, selectedPath);
    });

    if (matchingProjects.length === 0) {
        content.replaceChildren(createEmptyState(selectedPath));
        return;
    }

    const cards = matchingProjects.map(createProjectCard);
    content.replaceChildren(...cards);
}

function getProjectById(projectId) {
    return projectLookup.get(projectId) || null;
}

function renderDetailPreview(project) {
    const preview = document.querySelector("[data-project-preview]");

    if (!preview) return;

    preview.replaceChildren();

    if (project.thumbnailPath) {
        const image = document.createElement("img");
        image.className = "detail-preview-image";
        image.src = toRepoPath(project.thumbnailPath);
        image.alt = project.thumbnailAlt || `Preview of ${project.title}`;
        preview.append(image);
        return;
    }

    const placeholder = document.createElement("span");
    placeholder.className = "detail-preview-placeholder";
    placeholder.textContent = "Thumbnail coming soon";
    preview.append(placeholder);
}

function setProjectMeta(project) {
    document.title = `${project.title} | Project Details`;

    const description = document.querySelector('meta[name="description"]');

    if (description) {
        description.setAttribute("content", project.metaDescription);
    }
}

function renderNotFoundState(requestedId) {
    const fallbackProject = {
        ...projectDefaults,
        id: "missing-project",
        title: "Project not found",
        metaDescription: "The requested project could not be found.",
        overview: `No project matched the id "${requestedId || "missing"}".`,
        testSteps: [
            "Go back to the portfolio page.",
            "Check the project id in the URL.",
            "Make sure the project was added to scripts/projects.js."
        ]
    };

    renderProjectDetailPageContent(fallbackProject, false);
}

function renderProjectDetailPageContent(project, showProjectLink = true) {
    const title = document.querySelector("[data-project-title]");
    const overview = document.querySelector("[data-project-overview]");
    const steps = document.querySelector("[data-project-steps]");
    const projectLink = document.querySelector("[data-project-link]");

    if (!title || !overview || !steps || !projectLink) return;

    setProjectMeta(project);
    renderDetailPreview(project);

    title.textContent = project.title;
    overview.textContent = project.overview;

    const stepItems = project.testSteps.map((step) => {
        const item = document.createElement("li");
        item.textContent = step;
        return item;
    });

    steps.replaceChildren(...stepItems);

    if (showProjectLink && project.projectLink) {
        projectLink.hidden = false;
        projectLink.textContent = project.buttonLabel;
        projectLink.href = toRepoPath(project.projectLink);
    } else {
        projectLink.hidden = true;
        projectLink.removeAttribute("href");
    }
}

function renderProjectDetailPage(projectId) {
    const project = getProjectById(projectId);

    if (!project) {
        renderNotFoundState(projectId);
        return;
    }

    renderProjectDetailPageContent(project);
}

function initializeProjectDetailPage() {
    const projectId = new URLSearchParams(window.location.search).get("id");
    renderProjectDetailPage(projectId);
}

function setupFilters(filterProjects) {
    const filterBtn = document.querySelector(".filter-btn");
    const filterMenu = document.querySelector(".filter-menu");
    const filterDropdown = document.querySelector(".filter-dropdown");
    const filterSeparator = document.querySelector(".filter-separator");
    const crumbSelected = document.querySelector(".crumb-selected");
    const homeLink = document.querySelector(".crumb-home");

    if (!filterBtn || !filterMenu || !filterDropdown || !filterSeparator || !crumbSelected || !homeLink) {
        return;
    }

    let selectedPath = [];
    let menuOpen = false;

    filterMenu.style.display = "none";
    filterDropdown.style.position = "relative";

    function getCurrentLevel() {
        let currentLevel = projectFilters;

        for (const item of selectedPath) {
            if (!currentLevel[item]) return {};
            currentLevel = currentLevel[item];
        }

        return currentLevel;
    }

    function renderBreadcrumb() {
        crumbSelected.innerHTML = "";

        selectedPath.forEach((item, index) => {
            const separator = document.createElement("span");
            separator.className = "crumb-separator";
            separator.textContent = ">";
            crumbSelected.appendChild(separator);

            const crumb = document.createElement("button");
            crumb.textContent = item;
            crumb.type = "button";

            crumb.addEventListener("click", () => {
                selectedPath = selectedPath.slice(0, index + 1);
                menuOpen = true;
                renderBreadcrumb();
                renderFilterMenu();
                filterProjects(selectedPath);
            });

            crumbSelected.appendChild(crumb);
        });

        const currentLevel = getCurrentLevel();
        const hasChildren = Object.keys(currentLevel).length > 0;

        if (hasChildren) {
            filterBtn.style.display = "inline-block";
            filterSeparator.style.display = "inline";
        } else {
            filterBtn.style.display = "none";
            filterMenu.style.display = "none";
            menuOpen = false;
            filterSeparator.style.display = "none";
        }
    }

    function renderFilterMenu() {
        filterMenu.innerHTML = "";

        const currentLevel = getCurrentLevel();
        const options = Object.keys(currentLevel);

        if (!menuOpen || options.length === 0) {
            filterMenu.style.display = "none";
            return;
        }

        options.forEach((option) => {
            const optionButton = document.createElement("button");
            optionButton.className = "filter-option";
            optionButton.textContent = option;
            optionButton.type = "button";

            optionButton.addEventListener("click", (event) => {
                event.stopPropagation();
                selectedPath.push(option);
                menuOpen = true;
                renderBreadcrumb();
                renderFilterMenu();
                filterProjects(selectedPath);
            });

            filterMenu.appendChild(optionButton);
        });

        filterMenu.style.display = "block";
    }

    filterBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        menuOpen = !menuOpen;
        renderFilterMenu();
    });

    homeLink.addEventListener("click", (event) => {
        event.preventDefault();
        selectedPath = [];
        menuOpen = true;
        renderBreadcrumb();
        renderFilterMenu();
        filterProjects(selectedPath);
    });

    document.addEventListener("click", (event) => {
        if (!filterBtn.contains(event.target) && !filterMenu.contains(event.target)) {
            menuOpen = false;
            renderFilterMenu();
        }
    });

    renderBreadcrumb();
    renderFilterMenu();
    filterProjects(selectedPath);
}

const PortfolioProjects = {
    filterProjects,
    getProjectById,
    projectData,
    projectFilters,
    renderProjectDetailPage,
    setupFilters
};

export default PortfolioProjects;

if (
    typeof document !== "undefined" &&
    document.body &&
    document.body.dataset &&
    document.body.dataset.projectDetailPage !== undefined
) {
    initializeProjectDetailPage();
}
