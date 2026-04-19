document.addEventListener("DOMContentLoaded", () => {
  // ===============================
  // HOMEPAGE-STYLE MOBILE MENU
  // ===============================
  const menuButton = document.getElementById("menuButton");
  const menuArea = document.getElementById("menuArea");

  if (menuButton && menuArea) {
    menuButton.addEventListener("click", (e) => {
      e.stopPropagation();
      menuArea.classList.toggle("active");
    });

    document.addEventListener("click", (e) => {
      if (!menuArea.contains(e.target) && !menuButton.contains(e.target)) {
        menuArea.classList.remove("active");
      }
    });
  }

  // ===============================
  // HOMEPAGE-STYLE MEGA MENU
  // ===============================
  const servicesMenu = document.getElementById("servicesMenu");
  const megaCategories = document.querySelectorAll(".megaCategory");
  const megaPanels = document.querySelectorAll(".megaPanel");

  function showMegaPanel(panelId) {
    megaCategories.forEach((btn) => btn.classList.remove("isActive"));
    megaPanels.forEach((panel) => panel.classList.remove("isVisible"));

    const activeButton = document.querySelector(`.megaCategory[data-panel="${panelId}"]`);
    const activePanel = document.getElementById(panelId);

    if (activeButton) activeButton.classList.add("isActive");
    if (activePanel) activePanel.classList.add("isVisible");
  }

  megaCategories.forEach((button) => {
    button.addEventListener("mouseenter", function () {
      const panelId = this.getAttribute("data-panel");
      showMegaPanel(panelId);
    });

    button.addEventListener("focus", function () {
      const panelId = this.getAttribute("data-panel");
      showMegaPanel(panelId);
    });
  });

  if (servicesMenu) {
    servicesMenu.addEventListener("mouseleave", function () {
      showMegaPanel("interiorPanel");
    });
  }

  // ===============================
  // ACCORDION
  // ===============================
  document.querySelectorAll(".accordion-header").forEach((button) => {
    button.addEventListener("click", () => {
      button.parentElement.classList.toggle("open");
    });
  });

  // ===============================
  // CONTACT FORM
  // ===============================
  const contactForm = document.querySelector("#contactForm");
  const notice = document.querySelector("#formNotice");

  if (contactForm && notice) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const requiredFields = contactForm.querySelectorAll("[required]");
      let valid = true;

      requiredFields.forEach((field) => {
        if (!field.value.trim()) {
          valid = false;
        }
      });

      if (!valid) {
        notice.className = "notice error";
        notice.style.display = "block";
        notice.textContent = "Please fill in all required fields before submitting.";
        return;
      }

      notice.className = "notice";
      notice.style.display = "block";
      notice.textContent = "Thanks! Your message has been captured for demo purposes.";
      contactForm.reset();
    });
  }
});