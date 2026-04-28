// ===============================
// CONFIG / AUTH
// ===============================
const apiBaseUrl = "http://127.0.0.1:5000";

function getStoredCustomerAuth() {
  const possibleKeys = [
    "estimatorCustomerAuth",
    "customerAuth",
    "user",
    "estimatorUser"
  ];

  for (const key of possibleKeys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      if (parsed) return parsed;
    } catch (error) {
      console.warn(`Could not parse localStorage key: ${key}`, error);
    }
  }

  return null;
}

function normalizeCustomer(auth) {
  if (!auth) return null;

  return {
    id:
      auth.customerId ||
      auth.id ||
      auth.customer_id ||
      auth.userId ||
      null,
    firstName:
      auth.firstName ||
      auth.first_name ||
      auth.firstname ||
      "",
    lastName:
      auth.lastName ||
      auth.last_name ||
      auth.lastname ||
      "",
    email:
      auth.email ||
      auth.customerEmail ||
      ""
  };
}

const rawCustomerAuth = getStoredCustomerAuth();
const savedCustomer = normalizeCustomer(rawCustomerAuth);

if (!savedCustomer || !savedCustomer.id) {
  window.location.href = "customerLogin.html";
}

// ===============================
// USER DROPDOWN + NAME
// ===============================
const userButton = document.getElementById("userButton");
const userMenu = document.getElementById("userMenu");
const logoutBtn = document.getElementById("logoutBtn");
const userName = document.getElementById("userName");

if (userName) {
  userName.textContent = savedCustomer.firstName || "Customer";
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
    localStorage.removeItem("customerAuth");
    localStorage.removeItem("user");
    localStorage.removeItem("estimatorUser");
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

const zipCodeInput = document.getElementById("zipCode");
const serviceCategoryInput = document.getElementById("serviceCategory");
const serviceNeededInput = document.getElementById("serviceNeeded");
const problemDescriptionInput = document.getElementById("problemDescription");
const preferredDateInput = document.getElementById("preferredDate");
const preferredTimeInput = document.getElementById("preferredTime");
const budgetInput = document.getElementById("budget");

const vehicleSourceRadios = document.querySelectorAll('input[name="vehicleSource"]');
const savedVehicleRadio = document.querySelector('input[name="vehicleSource"][value="saved"]');
const customVehicleRadio = document.querySelector('input[name="vehicleSource"][value="custom"]');

let customerVehicles = [];

// ===============================
// HELPERS
// ===============================
function showRequestMessage(type, text) {
  if (!requestFormMessage) return;

  if (!type) {
    requestFormMessage.className = "requestFormMessage";
    requestFormMessage.textContent = "";
    requestFormMessage.style.display = "none";
    return;
  }

  requestFormMessage.className = `requestFormMessage ${type}`;
  requestFormMessage.textContent = text;
  requestFormMessage.style.display = "block";
}

function showBottomSuccessMessage(text) {
  showRequestMessage("success", text);
  if (requestFormMessage) {
    requestFormMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  setTimeout(function () {
    showRequestMessage("", "");
  }, 4000);
}

function getCustomerId() {
  return savedCustomer?.id || null;
}

function getSelectedVehicleSource() {
  return document.querySelector('input[name="vehicleSource"]:checked')?.value || "custom";
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
  [
    vehicleMake,
    vehicleModel,
    vehicleYear,
    vehicleColor,
    vehicleLicensePlate,
    vehicleVin,
    vehicleMileage
  ].forEach(function (field) {
    field.readOnly = isReadOnly;
    field.classList.toggle("vehicleReadonly", isReadOnly);
  });
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

function disableSavedVehicleOption() {
  if (savedVehicleRadio) {
    savedVehicleRadio.disabled = true;
    savedVehicleRadio.checked = false;
  }

  if (savedVehicleBlock) {
    savedVehicleBlock.style.display = "none";
  }

  if (savedVehicleSelect) {
    savedVehicleSelect.value = "";
  }
}

function enableSavedVehicleOption() {
  if (savedVehicleRadio) {
    savedVehicleRadio.disabled = false;
  }
}

function switchToSavedVehicleMode() {
  if (!customerVehicles.length) {
    switchToCustomVehicleMode(true, true);
    return;
  }

  enableSavedVehicleOption();

  if (savedVehicleRadio) {
    savedVehicleRadio.checked = true;
  }

  if (savedVehicleBlock) {
    savedVehicleBlock.style.display = "block";
  }

  setVehicleFieldsReadOnly(true);

  const selectedVehicleId = savedVehicleSelect.value || String(customerVehicles[0].id);
  savedVehicleSelect.value = selectedVehicleId;

  const selectedVehicle = customerVehicles.find(function (vehicle) {
    return String(vehicle.id) === String(selectedVehicleId);
  });

  if (selectedVehicle) {
    fillVehicleFields(selectedVehicle);
  }

  showRequestMessage("", "");
}

function switchToCustomVehicleMode(clearFields = true, showNoVehicleMessage = false) {
  if (customVehicleRadio) {
    customVehicleRadio.checked = true;
  }

  if (savedVehicleBlock) {
    savedVehicleBlock.style.display = "none";
  }

  if (savedVehicleSelect) {
    savedVehicleSelect.value = "";
  }

  setVehicleFieldsReadOnly(false);

  if (clearFields) {
    clearVehicleFields();
  }

  if (showNoVehicleMessage) {
    showRequestMessage("error", "No saved vehicles found. Please use another car.");
  } else {
    showRequestMessage("", "");
  }
}

function applyVehicleSourceState() {
  const source = getSelectedVehicleSource();

  if (source === "saved") {
    if (customerVehicles.length === 0) {
      disableSavedVehicleOption();
      switchToCustomVehicleMode(true, true);
      return;
    }

    switchToSavedVehicleMode();
    return;
  }

  if (customerVehicles.length > 0) {
    enableSavedVehicleOption();
  } else {
    disableSavedVehicleOption();
  }

  // Important: custom mode should be blank, not autofilled
  switchToCustomVehicleMode(true, false);
}

// ===============================
// LOAD CUSTOMER VEHICLES
// ===============================
async function loadCustomerVehicles() {
  const customerId = getCustomerId();

  if (!customerId) {
    showRequestMessage("error", "Customer not found. Please log in again.");
    return;
  }

  try {
    const res = await fetch(`${apiBaseUrl}/api/vehicles/${customerId}`);
    const data = await res.json();

    if (!res.ok || !data.success) {
      customerVehicles = [];
      populateSavedVehicleDropdown([]);
      disableSavedVehicleOption();
      switchToCustomVehicleMode(true, true);
      return;
    }

    customerVehicles = Array.isArray(data.vehicles) ? data.vehicles : [];
    populateSavedVehicleDropdown(customerVehicles);

    if (customerVehicles.length > 0) {
      enableSavedVehicleOption();
      savedVehicleSelect.value = String(customerVehicles[0].id);
      switchToSavedVehicleMode();
    } else {
      disableSavedVehicleOption();
      switchToCustomVehicleMode(true, true);
    }
  } catch (error) {
    console.error("Load vehicles error:", error);
    customerVehicles = [];
    populateSavedVehicleDropdown([]);
    disableSavedVehicleOption();
    switchToCustomVehicleMode(true, true);
  }
}

// ===============================
// VEHICLE DROPDOWN CHANGE
// ===============================
if (savedVehicleSelect) {
  savedVehicleSelect.addEventListener("change", function () {
    const selectedVehicleId = savedVehicleSelect.value;

    if (!selectedVehicleId) {
      clearVehicleFields();
      return;
    }

    const selectedVehicle = customerVehicles.find(function (vehicle) {
      return String(vehicle.id) === String(selectedVehicleId);
    });

    if (selectedVehicle) {
      fillVehicleFields(selectedVehicle);
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

    const customerId = getCustomerId();
    let vehicleSource = getSelectedVehicleSource();

    if (!customerId) {
      showRequestMessage("error", "Customer not found. Please log in again.");
      return;
    }

    if (customerVehicles.length === 0) {
      vehicleSource = "custom";
    }

    const payload = {
      customerId: customerId,
      customerName: `${savedCustomer.firstName || ""} ${savedCustomer.lastName || ""}`.trim(),
      customerEmail: savedCustomer.email || "",
      zipCode: zipCodeInput?.value.trim() || "",
      serviceCategory: serviceCategoryInput?.value || "",
      serviceNeeded: serviceNeededInput?.value.trim() || "",
      problemDescription: problemDescriptionInput?.value.trim() || "",
      preferredDate: preferredDateInput?.value || "",
      preferredTime: preferredTimeInput?.value.trim() || "",
      budget: budgetInput?.value.trim() || "",
      vehicleSource: vehicleSource,
      savedVehicleId:
        vehicleSource === "saved" && customerVehicles.length > 0
          ? savedVehicleSelect?.value || null
          : null,
      vehicleMake: vehicleMake.value.trim(),
      vehicleModel: vehicleModel.value.trim(),
      vehicleYear: vehicleYear.value.trim(),
      vehicleColor: vehicleColor.value.trim(),
      vehicleLicensePlate: vehicleLicensePlate.value.trim(),
      vehicleVin: vehicleVin.value.trim(),
      vehicleMileage: vehicleMileage.value.trim()
    };

    if (
      !payload.zipCode ||
      !payload.serviceCategory ||
      !payload.serviceNeeded ||
      !payload.problemDescription ||
      !payload.vehicleMake ||
      !payload.vehicleModel
    ) {
      showRequestMessage("error", "Please fill in all required fields.");
      if (requestFormMessage) {
        requestFormMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      return;
    }

    if (vehicleSource === "saved" && !payload.savedVehicleId) {
      showRequestMessage("error", "Please select one of your saved vehicles.");
      if (requestFormMessage) {
        requestFormMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
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
        if (requestFormMessage) {
          requestFormMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
        return;
      }

      submitRequestForm.reset();

      if (customerVehicles.length > 0) {
        savedVehicleSelect.value = String(customerVehicles[0].id);
        switchToSavedVehicleMode();
      } else {
        switchToCustomVehicleMode(true, false);
      }

      showBottomSuccessMessage("✅ Your request has been submitted successfully.");
    } catch (error) {
      console.error("Submit request error:", error);
      showRequestMessage("error", "Server not reachable.");
      if (requestFormMessage) {
        requestFormMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  });
}

// ===============================
// RESET
// ===============================
if (resetRequestForm) {
  resetRequestForm.addEventListener("click", function () {
    setTimeout(function () {
      showRequestMessage("", "");

      if (customerVehicles.length > 0) {
        savedVehicleSelect.value = String(customerVehicles[0].id);
        switchToSavedVehicleMode();
      } else {
        switchToCustomVehicleMode(true, false);
      }
    }, 0);
  });
}

// ===============================
// INIT
// ===============================
window.addEventListener("DOMContentLoaded", function () {
  loadCustomerVehicles();
});