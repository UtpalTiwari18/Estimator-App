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
  const megaDropdown = document.getElementById("megaDropdown");
  const megaCategories = document.querySelectorAll(".megaCategory");
  const megaPanels = document.querySelectorAll(".megaPanel");

  if (servicesMenu && servicesLink && megaDropdown) {
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

  const contactForm = document.getElementById("contactForm");
  const notice = document.getElementById("formNotice");
  const submitInterestBtn = document.getElementById("submitInterestBtn");

  if (contactForm && notice) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const businessName = document.getElementById("businessName").value.trim();
      const ownerName = document.getElementById("ownerName").value.trim();
      const email = document.getElementById("email").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const serviceType = document.getElementById("serviceType").value.trim();
      const city = document.getElementById("city").value.trim();
      const message = document.getElementById("message").value.trim();

      if (!businessName || !ownerName || !email || !phone || !serviceType || !city || !message) {
        notice.className = "notice error";
        notice.style.display = "block";
        notice.textContent = "Please fill in all required fields before submitting.";
        return;
      }

      submitInterestBtn.disabled = true;
      submitInterestBtn.textContent = "Submitting...";

      try {
        const response = await fetch(`${API_BASE}/api/business-interest`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            businessName,
            ownerName,
            email,
            phone,
            serviceType,
            city,
            message
          })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to submit form.");
        }

        notice.className = "notice success";
        notice.style.display = "block";
        notice.textContent = "Your business interest form was submitted successfully.";

        contactForm.reset();
      } catch (error) {
        console.error("Business interest form error:", error);
        notice.className = "notice error";
        notice.style.display = "block";
        notice.textContent = error.message || "Unable to submit the form right now.";
      } finally {
        submitInterestBtn.disabled = false;
        submitInterestBtn.textContent = "Submit Interest";
      }
    });
  }
});