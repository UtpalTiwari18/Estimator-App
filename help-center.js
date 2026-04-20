document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "http://localhost:5000";

  const menuButton = document.getElementById("menuButton");
  const menuArea = document.getElementById("menuArea");

  if (menuButton && menuArea) {
    menuButton.addEventListener("click", () => {
      menuArea.classList.toggle("open");
    });
  }

  const servicesMenu = document.getElementById("servicesMenu");
  const servicesLink = document.getElementById("servicesLink");
  const megaCategories = document.querySelectorAll(".megaCategory");
  const megaPanels = document.querySelectorAll(".megaPanel");

  if (servicesMenu && servicesLink) {
    servicesLink.addEventListener("click", (e) => {
      e.preventDefault();
      servicesMenu.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
      if (!servicesMenu.contains(e.target)) {
        servicesMenu.classList.remove("open");
      }
    });
  }

  megaCategories.forEach((button) => {
    button.addEventListener("click", () => {
      const targetPanel = button.dataset.panel;

      megaCategories.forEach((btn) => btn.classList.remove("isActive"));
      megaPanels.forEach((panel) => panel.classList.remove("isVisible"));

      button.classList.add("isActive");

      const panelToShow = document.getElementById(targetPanel);
      if (panelToShow) {
        panelToShow.classList.add("isVisible");
      }
    });
  });

  document.querySelectorAll(".accordion-header").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.parentElement;
      const isOpen = item.classList.contains("open");

      document.querySelectorAll(".accordion-item").forEach((accordionItem) => {
        accordionItem.classList.remove("open");
        const header = accordionItem.querySelector(".accordion-header");
        if (header) header.setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        item.classList.add("open");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });

  const supportForm = document.getElementById("supportForm");
  const notice = document.getElementById("formNotice");
  const submitButton = supportForm ? supportForm.querySelector('button[type="submit"]') : null;

  if (supportForm && notice) {
    supportForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("supportName").value.trim();
      const email = document.getElementById("supportEmail").value.trim();
      const message = document.getElementById("supportMessage").value.trim();

      if (!name || !email || !message) {
        notice.className = "notice error";
        notice.style.display = "block";
        notice.textContent = "Please fill in all required fields before submitting.";
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";
      }

      try {
        const response = await fetch(`${API_BASE}/api/help-support`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name,
            email,
            message
          })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to submit support request.");
        }

        notice.className = "notice success";
        notice.style.display = "block";
        notice.textContent = "Your support request was submitted successfully.";

        supportForm.reset();
      } catch (error) {
        console.error("Support request error:", error);
        notice.className = "notice error";
        notice.style.display = "block";
        notice.textContent = error.message || "Unable to submit your request right now.";
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Submit Request";
        }
      }
    });
  }
});