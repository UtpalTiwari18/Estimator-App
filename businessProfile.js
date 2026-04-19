const API_BASE =
  window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://estimator-app-icmp.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  setupMobileMenu();
  setupUserDropdown();
  setupLogout();

  const auth =
    JSON.parse(localStorage.getItem("estimatorBusinessAuth")) ||
    JSON.parse(localStorage.getItem("businessUser")) ||
    JSON.parse(localStorage.getItem("business")) ||
    null;

  if (!auth || !auth.id) {
    window.location.href = "businessLogin.html";
    return;
  }

  const managerNameEl = document.getElementById("managerName");
  if (managerNameEl) {
    managerNameEl.textContent = auth.ownerName || auth.businessName || "Business";
  }

  loadBusinessProfile(auth.id);
  setupProfileSubmit(auth.id);
});

function setupMobileMenu() {
  const menuButton = document.getElementById("menuButton");
  const menuArea = document.getElementById("menuArea");

  if (menuButton && menuArea) {
    menuButton.addEventListener("click", () => {
      menuArea.classList.toggle("showMenu");
    });
  }
}

function setupUserDropdown() {
  const userButton = document.getElementById("userButton");
  const userDropdown = document.getElementById("userDropdown");
  const userMenu = document.getElementById("userMenu");

  if (!userButton || !userDropdown || !userMenu) return;

  userButton.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    userDropdown.classList.toggle("show");
  });

  document.addEventListener("click", (e) => {
    if (!userMenu.contains(e.target)) {
      userDropdown.classList.remove("show");
    }
  });
}

function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();

    localStorage.removeItem("estimatorBusinessAuth");
    localStorage.removeItem("businessUser");
    localStorage.removeItem("business");
    localStorage.removeItem("estimatorCustomerAuth");
    localStorage.removeItem("user");

    window.location.href = "home.html";
  });
}

async function loadBusinessProfile(businessId) {
  try {
    const response = await fetch(`${API_BASE}/api/business/profile/${businessId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to load business profile.");
    }

    fillProfileForm(data.business);
    fillProfileSummary(data.business);

    const currentAuth =
      JSON.parse(localStorage.getItem("estimatorBusinessAuth")) ||
      JSON.parse(localStorage.getItem("businessUser")) ||
      JSON.parse(localStorage.getItem("business")) ||
      {};

    const updatedAuth = {
      ...currentAuth,
      id: data.business.id,
      businessName: data.business.businessName,
      ownerName: data.business.ownerName,
      email: data.business.email
    };

    localStorage.setItem("estimatorBusinessAuth", JSON.stringify(updatedAuth));
  } catch (error) {
    showMessage(error.message || "Failed to load business profile.", "error");
  }
}

function fillProfileForm(business) {
  document.getElementById("businessName").value = business.businessName || "";
  document.getElementById("ownerName").value = business.ownerName || "";
  document.getElementById("businessType").value = business.businessType || "";
  document.getElementById("email").value = business.email || "";
  document.getElementById("phone").value = business.phone || "";
  document.getElementById("website").value = business.website || "";
  document.getElementById("services").value = business.services || "";
  document.getElementById("addressLine1").value = business.addressLine1 || "";
  document.getElementById("addressLine2").value = business.addressLine2 || "";
  document.getElementById("city").value = business.city || "";
  document.getElementById("state").value = business.state || "";
  document.getElementById("zip").value = business.zip || "";
}

function fillProfileSummary(business) {
  const avatar = document.getElementById("profileAvatar");
  const businessName = business.businessName || "Business";

  if (avatar) {
    avatar.textContent = businessName.charAt(0).toUpperCase();
  }

  document.getElementById("summaryBusinessName").textContent = businessName;
  document.getElementById("summaryOwnerName").textContent = business.ownerName || "-";
  document.getElementById("summaryBusinessType").textContent = business.businessType || "Business";
  document.getElementById("summaryEmail").textContent = business.email || "-";
  document.getElementById("summaryPhone").textContent = business.phone || "-";
  document.getElementById("summaryWebsite").textContent = business.website || "-";
  document.getElementById("summaryZip").textContent = business.zip || "-";
}

function setupProfileSubmit(businessId) {
  const form = document.getElementById("businessProfileForm");
  const saveBtn = document.getElementById("saveProfileBtn");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      businessName: document.getElementById("businessName").value.trim(),
      ownerName: document.getElementById("ownerName").value.trim(),
      businessType: document.getElementById("businessType").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      website: document.getElementById("website").value.trim(),
      services: document.getElementById("services").value.trim(),
      addressLine1: document.getElementById("addressLine1").value.trim(),
      addressLine2: document.getElementById("addressLine2").value.trim(),
      city: document.getElementById("city").value.trim(),
      state: document.getElementById("state").value.trim(),
      zip: document.getElementById("zip").value.trim()
    };

    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    try {
      const response = await fetch(`${API_BASE}/api/business/profile/${businessId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update profile.");
      }

      fillProfileSummary(data.business);

      const currentAuth =
        JSON.parse(localStorage.getItem("estimatorBusinessAuth")) ||
        JSON.parse(localStorage.getItem("businessUser")) ||
        JSON.parse(localStorage.getItem("business")) ||
        {};

      const updatedAuth = {
        ...currentAuth,
        id: data.business.id,
        businessName: data.business.businessName,
        ownerName: data.business.ownerName,
        email: data.business.email
      };

      localStorage.setItem("estimatorBusinessAuth", JSON.stringify(updatedAuth));

      const managerNameEl = document.getElementById("managerName");
      if (managerNameEl) {
        managerNameEl.textContent = data.business.ownerName || data.business.businessName || "Business";
      }

      showMessage("Business profile updated successfully.", "success");
    } catch (error) {
      showMessage(error.message || "Failed to update profile.", "error");
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save Changes";
    }
  });
}

function showMessage(message, type) {
  const messageBox = document.getElementById("profileMessage");
  if (!messageBox) return;

  messageBox.textContent = message;
  messageBox.className = `profileMessage ${type}`;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}