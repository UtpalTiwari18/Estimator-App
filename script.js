const menuButton = document.getElementById("menuButton");
const menuArea = document.getElementById("menuArea");

const servicesMenu = document.getElementById("servicesMenu");
const servicesLink = document.getElementById("servicesLink");

const megaCategories = document.querySelectorAll(".megaCategory");
const megaPanels = document.querySelectorAll(".megaPanel");

function showPanel(panelId) {
  megaPanels.forEach(panel => panel.classList.remove("isVisible"));
  const activePanel = document.getElementById(panelId);
  if (activePanel) activePanel.classList.add("isVisible");
}

megaCategories.forEach(category => {
  category.addEventListener("mouseenter", () => {
    const panelId = category.getAttribute("data-panel");
    megaCategories.forEach(c => c.classList.remove("isActive"));
    category.classList.add("isActive");
    showPanel(panelId);
  });

  category.addEventListener("click", () => {
    const panelId = category.getAttribute("data-panel");
    megaCategories.forEach(c => c.classList.remove("isActive"));
    category.classList.add("isActive");
    showPanel(panelId);
  });
});

menuButton.addEventListener("click", () => {
  menuArea.classList.toggle("isOpen");
});

/* Mobile: tap Our Services to open/close mega dropdown */
servicesLink.addEventListener("click", (event) => {
  const isMobile = window.matchMedia("(max-width: 900px)").matches;
  if (!isMobile) return; // desktop uses hover
  event.preventDefault();
  servicesMenu.classList.toggle("isOpen");
});