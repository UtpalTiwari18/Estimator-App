// ===============================
// USER DROPDOWN + NAME
// ===============================
const userButton = document.getElementById("userButton");
const userMenu = document.getElementById("userMenu");
const logoutBtn = document.getElementById("logoutBtn");
const userName = document.getElementById("userName");

const savedCustomer = JSON.parse(localStorage.getItem("estimatorCustomerAuth"));
const apiBaseUrl = "http://127.0.0.1:5000";

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

// ===============================
// MOBILE MENU
// ===============================
const menuButton = document.getElementById("menuButton");
const menuArea = document.getElementById("menuArea");

if (menuButton && menuArea) {
  menuButton.addEventListener("click", function () {
    menuArea.classList.toggle("active");
  });
}

// ===============================
// MEGA DROPDOWN PANELS
// ===============================
const megaCategoryButtons = document.querySelectorAll(".megaCategory");
const megaPanels = document.querySelectorAll(".megaPanel");

megaCategoryButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const targetPanelId = button.getAttribute("data-panel");

    megaCategoryButtons.forEach(function (btn) {
      btn.classList.remove("isActive");
    });

    megaPanels.forEach(function (panel) {
      panel.classList.remove("isVisible");
    });

    button.classList.add("isActive");

    const targetPanel = document.getElementById(targetPanelId);
    if (targetPanel) {
      targetPanel.classList.add("isVisible");
    }
  });
});

// ===============================
// REQUEST FORM ELEMENTS
// ===============================
const submitRequestForm = document.getElementById("submitRequestForm");
const requestFormMessage = document.getElementById("requestFormMessage");
const resetRequestForm = document.getElementById("resetRequestForm");

const savedVehicleBlock = document.getElementById("savedVehicleBlock");
const savedVehicleSelect = document.getElementById("savedVehicleSelect");

const vehicleMake = document.getElementById("vehicleMake");
const vehicleModel = document.getElementById("vehicleModel");
const vehicleYear = document.getElementById("vehicleYear");
const vehicleColor = document.getElementById("vehicleColor");
const vehicleLicensePlate = document.getElementById("vehicleLicensePlate");
const vehicleVin = document.getElementById("vehicleVin");
const vehicleMileage = document.getElementById("vehicleMileage");

const vehicleSourceRadios = document.querySelectorAll('input[name="vehicleSource"]');

let customerVehicles = [];

// ===============================
// HELPERS
// ===============================
function showRequestMessage(type, text) {
  if (!requestFormMessage) return;

  if (!type) {
    requestFormMessage.className = "requestFormMessage";
    requestFormMessage.textContent = "";
    return;
  }

  requestFormMessage.className = "requestFormMessage " + type;
  requestFormMessage.textContent = text;
}

function getCustomerId() {
  return savedCustomer?.customerId || savedCustomer?.id || null;
}

function getSelectedVehicleSource() {
  return document.querySelector('input[name="vehicleSource"]:checked')?.value || "saved";
}

function fillVehicleFields(vehicle) {
  if (!vehicle) return;

  vehicleMake.value = vehicle.make || "";
  vehicleModel.value = vehicle.model || "";
  vehicleYear.value = vehicle.year || "";
  vehicleColor.value = vehicle.color || "";
  vehicleLicensePlate.value = vehicle.license_plate || "";
  vehicleVin.value = vehicle.vin || "";
  vehicleMileage.value = vehicle.mileage || "";
}

function clearVehicleFields() {
  vehicleMake.value = "";
  vehicleModel.value = "";
  vehicleYear.value = "";
  vehicleColor.value = "";
  vehicleLicensePlate.value = "";
  vehicleVin.value = "";
  vehicleMileage.value = "";
}

function setVehicleFieldsReadOnly(isReadOnly) {
  vehicleMake.readOnly = isReadOnly;
  vehicleModel.readOnly = isReadOnly;
  vehicleYear.readOnly = isReadOnly;
  vehicleColor.readOnly = isReadOnly;
  vehicleLicensePlate.readOnly = isReadOnly;
  vehicleVin.readOnly = isReadOnly;
  vehicleMileage.readOnly = isReadOnly;

  if (isReadOnly) {
    vehicleMake.classList.add("vehicleReadonly");
    vehicleModel.classList.add("vehicleReadonly");
    vehicleYear.classList.add("vehicleReadonly");
    vehicleColor.classList.add("vehicleReadonly");
    vehicleLicensePlate.classList.add("vehicleReadonly");
    vehicleVin.classList.add("vehicleReadonly");
    vehicleMileage.classList.add("vehicleReadonly");
  } else {
    vehicleMake.classList.remove("vehicleReadonly");
    vehicleModel.classList.remove("vehicleReadonly");
    vehicleYear.classList.remove("vehicleReadonly");
    vehicleColor.classList.remove("vehicleReadonly");
    vehicleLicensePlate.classList.remove("vehicleReadonly");
    vehicleVin.classList.remove("vehicleReadonly");
    vehicleMileage.classList.remove("vehicleReadonly");
  }
}

function populateSavedVehicleDropdown(vehicles) {
  if (!savedVehicleSelect) return;

  savedVehicleSelect.innerHTML = `<option value="">Select one of your vehicles</option>`;

  vehicles.forEach(function (vehicle) {
    const option = document.createElement("option");
    option.value = vehicle.id;
    option.textContent = [
      vehicle.year || "",
      vehicle.make || "",
      vehicle.model || "",
      vehicle.color ? `(${vehicle.color})` : ""
    ]
      .filter(Boolean)
      .join(" ");
    savedVehicleSelect.appendChild(option);
  });
}

function applyVehicleSourceState() {
  const vehicleSource = getSelectedVehicleSource();

  if (vehicleSource === "saved") {
    savedVehicleBlock.style.display = "block";

    if (customerVehicles.length > 0) {
      setVehicleFieldsReadOnly(true);

      const selectedVehicleId = savedVehicleSelect.value;
      if (selectedVehicleId) {
        const vehicle = customerVehicles.find(function (item) {
          return String(item.id) === String(selectedVehicleId);
        });

        if (vehicle) {
          fillVehicleFields(vehicle);
        }
      } else {
        clearVehicleFields();
      }
    } else {
      setVehicleFieldsReadOnly(false);
      clearVehicleFields();
      showRequestMessage("error", "No saved vehicles found. Please use another car or add a vehicle first.");
    }
  } else {
    savedVehicleBlock.style.display = "none";
    savedVehicleSelect.value = "";
    setVehicleFieldsReadOnly(false);
    clearVehicleFields();
  }
}

// ===============================
// LOAD VEHICLES FROM DATABASE
// ===============================
async function loadCustomerVehicles() {
  const customerId = getCustomerId();

  if (!customerId) {
    showRequestMessage("error", "Customer ID not found. Please log in again.");
    return;
  }

  try {
    const res = await fetch(`${apiBaseUrl}/api/vehicles/${customerId}`);
    const data = await res.json();

    if (!res.ok || !data.success) {
      showRequestMessage("error", data.message || "Failed to load vehicles.");
      return;
    }

    customerVehicles = Array.isArray(data.vehicles) ? data.vehicles : [];
    populateSavedVehicleDropdown(customerVehicles);

    if (customerVehicles.length > 0) {
      savedVehicleSelect.value = String(customerVehicles[0].id);
      fillVehicleFields(customerVehicles[0]);
      setVehicleFieldsReadOnly(true);
    } else {
      clearVehicleFields();
      setVehicleFieldsReadOnly(false);
      showRequestMessage("error", "No saved vehicles found. Please add one in My Vehicle.");
    }

    applyVehicleSourceState();
  } catch (error) {
    console.error("Load vehicles error:", error);
    showRequestMessage("error", "Could not load your saved vehicles.");
  }
}

// ===============================
// VEHICLE SELECT CHANGE
// ===============================
if (savedVehicleSelect) {
  savedVehicleSelect.addEventListener("change", function () {
    const selectedVehicleId = savedVehicleSelect.value;

    if (!selectedVehicleId) {
      clearVehicleFields();
      return;
    }

    const vehicle = customerVehicles.find(function (item) {
      return String(item.id) === String(selectedVehicleId);
    });

    if (vehicle) {
      fillVehicleFields(vehicle);
    }
  });
}

// ===============================
// VEHICLE SOURCE CHANGE
// ===============================
vehicleSourceRadios.forEach(function (radio) {
  radio.addEventListener("change", function () {
    applyVehicleSourceState();
  });
});

// ===============================
// SUBMIT REQUEST
// ===============================
if (submitRequestForm) {
  submitRequestForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const vehicleSource = getSelectedVehicleSource();

    const payload = {
      customerId: getCustomerId(),
      customerName: `${savedCustomer?.firstName || ""} ${savedCustomer?.lastName || ""}`.trim(),
      customerEmail: savedCustomer?.email || "",
      zipCode: document.getElementById("zipCode")?.value.trim() || "",
      serviceCategory: document.getElementById("serviceCategory")?.value || "",
      serviceNeeded: document.getElementById("serviceNeeded")?.value.trim() || "",
      problemDescription: document.getElementById("problemDescription")?.value.trim() || "",
      preferredDate: document.getElementById("preferredDate")?.value || "",
      preferredTime: document.getElementById("preferredTime")?.value.trim() || "",
      budget: document.getElementById("budget")?.value.trim() || "",
      vehicleSource: vehicleSource,
      savedVehicleId: vehicleSource === "saved" ? savedVehicleSelect.value || null : null,
      vehicleMake: vehicleMake.value.trim(),
      vehicleModel: vehicleModel.value.trim(),
      vehicleYear: vehicleYear.value.trim(),
      vehicleColor: vehicleColor.value.trim(),
      vehicleLicensePlate: vehicleLicensePlate.value.trim(),
      vehicleVin: vehicleVin.value.trim(),
      vehicleMileage: vehicleMileage.value.trim()
    };

    if (
      !payload.customerId ||
      !payload.zipCode ||
      !payload.serviceCategory ||
      !payload.serviceNeeded ||
      !payload.problemDescription ||
      !payload.vehicleMake ||
      !payload.vehicleModel
    ) {
      showRequestMessage("error", "Please fill in all required fields.");
      return;
    }

    if (vehicleSource === "saved" && !payload.savedVehicleId) {
      showRequestMessage("error", "Please select one of your saved vehicles.");
      return;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/api/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        showRequestMessage("error", data.message || "Failed to submit request.");
        return;
      }

      showRequestMessage("success", "Your request has been submitted successfully.");
      submitRequestForm.reset();

      if (customerVehicles.length > 0) {
        savedVehicleSelect.value = String(customerVehicles[0].id);
        fillVehicleFields(customerVehicles[0]);
      } else {
        clearVehicleFields();
      }

      document.querySelector('input[name="vehicleSource"][value="saved"]').checked = true;
      applyVehicleSourceState();
    } catch (error) {
      console.error("Submit request error:", error);
      showRequestMessage("error", "Server not reachable.");
    }
  });
}

if (resetRequestForm) {
  resetRequestForm.addEventListener("click", function () {
    setTimeout(function () {
      showRequestMessage("", "");
      if (customerVehicles.length > 0) {
        savedVehicleSelect.value = String(customerVehicles[0].id);
        fillVehicleFields(customerVehicles[0]);
      } else {
        clearVehicleFields();
      }

      document.querySelector('input[name="vehicleSource"][value="saved"]').checked = true;
      applyVehicleSourceState();
    }, 0);
  });
}

// ===============================
// INIT
// ===============================
window.addEventListener("DOMContentLoaded", function () {
  loadCustomerVehicles();
});