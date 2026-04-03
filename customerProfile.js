const userButton = document.getElementById("userButton");
const userMenu = document.getElementById("userMenu");
const logoutBtn = document.getElementById("logoutBtn");
const userName = document.getElementById("userName");

const menuButton = document.getElementById("menuButton");
const menuArea = document.getElementById("menuArea");

const megaCategoryButtons = document.querySelectorAll(".megaCategory");
const megaPanels = document.querySelectorAll(".megaPanel");

const profileFullName = document.getElementById("profileFullName");
const profileAvatar = document.getElementById("profileAvatar");

const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const zipCodeInput = document.getElementById("zipCode");

const editProfileButton = document.getElementById("editProfileButton");
const cancelButton = document.getElementById("cancelButton");
const profileForm = document.getElementById("profileForm");
const formActions = document.getElementById("formActions");
const summaryZip = document.getElementById("summaryZip");

const apiBaseUrl = "http://127.0.0.1:5000";

const savedCustomer = JSON.parse(localStorage.getItem("estimatorCustomerAuth"));

let originalProfileData = null;
let isEditMode = false;

if (!savedCustomer) {
  window.location.href = "customerLogin.html";
}

if (savedCustomer && savedCustomer.firstName && userName) {
  userName.textContent = savedCustomer.firstName;
} else if (userName) {
  userName.textContent = "Guest";
}

if (userButton && userMenu) {
  userButton.addEventListener("click", function (e) {
    e.stopPropagation();
    userMenu.classList.toggle("active");
  });

  document.querySelectorAll(".userDropdown a").forEach(function (link) {
    link.addEventListener("click", function () {
      userMenu.classList.remove("active");
    });
  });

  document.addEventListener("click", function (e) {
    if (!userMenu.contains(e.target)) {
      userMenu.classList.remove("active");
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", function (e) {
    e.preventDefault();
    localStorage.removeItem("estimatorCustomerAuth");
    window.location.href = "home.html";
  });
}

if (menuButton && menuArea) {
  menuButton.addEventListener("click", function () {
    menuArea.classList.toggle("active");
  });
}

megaCategoryButtons.forEach(function (button) {
  button.addEventListener("mouseenter", function () {
    const panelId = button.getAttribute("data-panel");

    megaCategoryButtons.forEach(function (item) {
      item.classList.remove("isActive");
    });

    megaPanels.forEach(function (panel) {
      panel.classList.remove("isVisible");
    });

    button.classList.add("isActive");

    const targetPanel = document.getElementById(panelId);
    if (targetPanel) {
      targetPanel.classList.add("isVisible");
    }
  });

  button.addEventListener("click", function () {
    const panelId = button.getAttribute("data-panel");

    megaCategoryButtons.forEach(function (item) {
      item.classList.remove("isActive");
    });

    megaPanels.forEach(function (panel) {
      panel.classList.remove("isVisible");
    });

    button.classList.add("isActive");

    const targetPanel = document.getElementById(panelId);
    if (targetPanel) {
      targetPanel.classList.add("isVisible");
    }
  });
});

async function loadProfileData() {
  try {
    if (!savedCustomer || !savedCustomer.id) {
      alert("Customer ID not found. Please log in again.");
      window.location.href = "customerLogin.html";
      return;
    }

    const response = await fetch(`${apiBaseUrl}/api/customers/profile/${savedCustomer.id}`);
    const data = await response.json();

    if (!data.success) {
      alert(data.message || "Failed to load profile.");
      return;
    }

    const customer = data.customer;

    firstNameInput.value = customer.first_name || "";
    lastNameInput.value = customer.last_name || "";
    emailInput.value = customer.email || "";
    phoneInput.value = customer.phone || "";
    zipCodeInput.value = customer.zip_code || "";

    const fullName = `${customer.first_name || ""} ${customer.last_name || ""}`.trim();
    profileFullName.textContent = fullName || "Your Profile";
    summaryZip.textContent = customer.zip_code || "—";

    if (profileAvatar) {
      profileAvatar.textContent = customer.first_name
        ? customer.first_name.charAt(0).toUpperCase()
        : "U";
    }

    originalProfileData = {
      firstName: customer.first_name || "",
      lastName: customer.last_name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      zipCode: customer.zip_code || ""
    };

    localStorage.setItem("estimatorCustomerAuth", JSON.stringify({
      ...savedCustomer,
      firstName: customer.first_name || "",
      lastName: customer.last_name || "",
      email: customer.email || ""
    }));

    if (userName) {
      userName.textContent = customer.first_name || "Guest";
    }
  } catch (error) {
    console.error("Error loading profile:", error);
    alert("Something went wrong while loading profile.");
  }
}

function setEditMode(enabled) {
  isEditMode = enabled;

  firstNameInput.disabled = !enabled;
  lastNameInput.disabled = !enabled;
  phoneInput.disabled = !enabled;
  zipCodeInput.disabled = !enabled;
  emailInput.disabled = true;

  formActions.style.display = enabled ? "flex" : "none";
  editProfileButton.textContent = enabled ? "Editing..." : "Edit Profile";

  if (!enabled && originalProfileData) {
    firstNameInput.value = originalProfileData.firstName;
    lastNameInput.value = originalProfileData.lastName;
    emailInput.value = originalProfileData.email;
    phoneInput.value = originalProfileData.phone;
    zipCodeInput.value = originalProfileData.zipCode;
  }
}

if (editProfileButton) {
  editProfileButton.addEventListener("click", function () {
    if (!isEditMode) {
      setEditMode(true);
    }
  });
}

if (cancelButton) {
  cancelButton.addEventListener("click", function () {
    setEditMode(false);
  });
}

if (profileForm) {
  profileForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    try {
      const updatedCustomer = {
        firstName: firstNameInput.value.trim(),
        lastName: lastNameInput.value.trim(),
        phone: phoneInput.value.trim(),
        zipCode: zipCodeInput.value.trim()
      };

      const response = await fetch(`${apiBaseUrl}/api/customers/profile/${savedCustomer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedCustomer)
      });

      const data = await response.json();

      if (!data.success) {
        alert(data.message || "Failed to update profile.");
        return;
      }

      alert("Profile updated successfully.");
      setEditMode(false);
      await loadProfileData();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Something went wrong while updating profile.");
    }
  });
}

window.addEventListener("DOMContentLoaded", function () {
  loadProfileData();
});