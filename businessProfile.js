const API_BASE =
  window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://estimator-app-icmp.onrender.com";

document.addEventListener("DOMContentLoaded", function () {
  const userMenu = document.getElementById("userMenu");
  const userButton = document.getElementById("userButton");
  const logoutBtn = document.getElementById("logoutBtn");
  const managerName = document.getElementById("managerName");
  const menuButton = document.getElementById("menuButton");
  const menuArea = document.getElementById("menuArea");

  let savedBusiness = null;

  try {
    const rawBusiness =
      localStorage.getItem("estimatorBusinessAuth") ||
      localStorage.getItem("businessUser") ||
      localStorage.getItem("business");

    if (rawBusiness) {
      savedBusiness = JSON.parse(rawBusiness);
    }
  } catch (error) {
    console.error("Error reading business auth:", error);
  }

  if (!savedBusiness) {
    window.location.href = "businessLogin.html";
    return;
  }

  const businessInfo = savedBusiness.business ? savedBusiness.business : savedBusiness;
  const businessId = businessInfo.id;

  if (managerName) {
    managerName.textContent = businessInfo.ownerName
      ? `Mg. ${businessInfo.ownerName}`
      : "Mg.";
  }

  if (userButton && userMenu) {
    userButton.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      userMenu.classList.toggle("active");
    });

    document.addEventListener("click", function (e) {
      if (!userMenu.contains(e.target)) {
        userMenu.classList.remove("active");
      }
    });
  }

  if (menuButton && menuArea) {
    menuButton.addEventListener("click", function () {
      menuArea.classList.toggle("open");
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();

      localStorage.removeItem("estimatorBusinessAuth");
      localStorage.removeItem("businessUser");
      localStorage.removeItem("business");
      localStorage.removeItem("estimatorCustomerAuth");
      localStorage.removeItem("user");

      window.location.href = "home.html";
    });
  }

  loadBusinessProfile(businessId);
  setupProfileSubmit(businessId);
});

async function loadBusinessProfile(businessId) {
  try {
    const response = await fetch(`${API_BASE}/api/business/profile/${businessId}`);
    const data = await response.json();

    if (!response.ok || !data.business) {
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
      email: data.business.email,
      zip: data.business.zip
    };

    localStorage.setItem("estimatorBusinessAuth", JSON.stringify(updatedAuth));

    const managerName = document.getElementById("managerName");
    if (managerName) {
      managerName.textContent = data.business.ownerName
        ? `Mg. ${data.business.ownerName}`
        : "Mg.";
    }
  } catch (error) {
    console.error("Load business profile error:", error);
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

  form.addEventListener("submit", async function (e) {
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

    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = "Saving...";
    }

    try {
      const response = await fetch(`${API_BASE}/api/business/profile/${businessId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.business) {
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
        email: data.business.email,
        zip: data.business.zip
      };

      localStorage.setItem("estimatorBusinessAuth", JSON.stringify(updatedAuth));

      const managerName = document.getElementById("managerName");
      if (managerName) {
        managerName.textContent = data.business.ownerName
          ? `Mg. ${data.business.ownerName}`
          : "Mg.";
      }

      showMessage("Business profile updated successfully.", "success");
    } catch (error) {
      console.error("Update business profile error:", error);
      showMessage(error.message || "Failed to update profile.", "error");
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = "Save Changes";
      }
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