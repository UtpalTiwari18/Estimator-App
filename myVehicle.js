const apiBaseUrl = "http://127.0.0.1:5000";

const savedCustomer = JSON.parse(localStorage.getItem("estimatorCustomerAuth"));

if (!savedCustomer || (!savedCustomer.id && !savedCustomer.customerId)) {
  window.location.href = "customerLogin.html";
}

const currentCustomerId = savedCustomer.id || savedCustomer.customerId;

const userButton = document.getElementById("userButton");
const userMenu = document.getElementById("userMenu");
const logoutBtn = document.getElementById("logoutBtn");
const userName = document.getElementById("userName");

const menuButton = document.getElementById("menuButton");
const menuArea = document.getElementById("menuArea");

const megaCategoryButtons = document.querySelectorAll(".megaCategory");
const megaPanels = document.querySelectorAll(".megaPanel");

const vehicleList = document.getElementById("vehicleList");
const vehicleEmptyState = document.getElementById("vehicleEmptyState");
const vehicleCount = document.getElementById("vehicleCount");

const vehicleModal = document.getElementById("vehicleModal");
const addVehicleBtn = document.getElementById("addVehicleBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalCloseIcon = document.getElementById("modalCloseIcon");
const modalTitle = document.getElementById("modalTitle");
const vehicleForm = document.getElementById("vehicleForm");
const vehicleFormMessage = document.getElementById("vehicleFormMessage");

const makeInput = document.getElementById("make");
const modelInput = document.getElementById("model");
const yearInput = document.getElementById("year");
const colorInput = document.getElementById("color");
const licensePlateInput = document.getElementById("licensePlate");
const vinInput = document.getElementById("vin");
const mileageInput = document.getElementById("mileage");

let editingVehicleId = null;
let allVehicles = [];

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

function showFormMessage(type, text) {
  vehicleFormMessage.className = "vehicleFormMessage " + type;
  vehicleFormMessage.textContent = text;
}

function clearFormMessage() {
  vehicleFormMessage.className = "vehicleFormMessage";
  vehicleFormMessage.textContent = "";
}

function resetVehicleForm() {
  vehicleForm.reset();
  editingVehicleId = null;
  modalTitle.textContent = "Add Vehicle";
  clearFormMessage();
}

function openVehicleModal() {
  vehicleModal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeVehicleModal() {
  vehicleModal.classList.remove("show");
  document.body.style.overflow = "";
  resetVehicleForm();
}

function getVehicleIcon(make) {
  const text = (make || "").trim();
  return text ? text.charAt(0).toUpperCase() : "V";
}

function formatVehicleSub(vehicle) {
  const parts = [];

  if (vehicle.year) parts.push(vehicle.year);
  if (vehicle.color) parts.push(vehicle.color);

  return parts.length ? parts.join(" • ") : "Vehicle details";
}

function renderVehicles() {
  vehicleList.innerHTML = "";

  vehicleCount.textContent = allVehicles.length;

  if (!allVehicles.length) {
    vehicleEmptyState.style.display = "block";
    vehicleList.style.display = "none";
    return;
  }

  vehicleEmptyState.style.display = "none";
  vehicleList.style.display = "grid";

  allVehicles.forEach(function (vehicle) {
    const card = document.createElement("div");
    card.className = "vehicleCard";

    card.innerHTML = `
      <div class="vehicleCardTop">
        <div style="display:flex; gap:16px; align-items:flex-start;">
          <div class="vehicleBadge">${getVehicleIcon(vehicle.make)}</div>
          <div class="vehicleCardTitleWrap">
            <h3>${vehicle.make || ""} ${vehicle.model || ""}</h3>
            <div class="vehicleCardSub">${formatVehicleSub(vehicle)}</div>
          </div>
        </div>
      </div>

      <div class="vehicleDetailGrid">
        <div class="vehicleDetailItem">
          <span class="vehicleDetailLabel">License Plate</span>
          <span class="vehicleDetailValue">${vehicle.license_plate || "—"}</span>
        </div>

        <div class="vehicleDetailItem">
          <span class="vehicleDetailLabel">Mileage</span>
          <span class="vehicleDetailValue">${vehicle.mileage || "—"}</span>
        </div>

        <div class="vehicleDetailItem">
          <span class="vehicleDetailLabel">VIN</span>
          <span class="vehicleDetailValue">${vehicle.vin || "—"}</span>
        </div>

        <div class="vehicleDetailItem">
          <span class="vehicleDetailLabel">Saved For</span>
          <span class="vehicleDetailValue">Future service requests</span>
        </div>
      </div>

      <div class="vehicleCardActions">
        <button class="editVehicleButton" type="button" data-id="${vehicle.id}">Edit</button>
        <button class="deleteVehicleButton" type="button" data-id="${vehicle.id}">Delete</button>
      </div>
    `;

    const editButton = card.querySelector(".editVehicleButton");
    const deleteButton = card.querySelector(".deleteVehicleButton");

    editButton.addEventListener("click", function () {
      startEditVehicle(vehicle.id);
    });

    deleteButton.addEventListener("click", function () {
      deleteVehicle(vehicle.id);
    });

    vehicleList.appendChild(card);
  });
}

async function loadVehicles() {
  try {
    const response = await fetch(`${apiBaseUrl}/api/vehicles/${currentCustomerId}`);
    const data = await response.json();

    console.log("Load vehicles response:", data);

    if (!data.success) {
      allVehicles = [];
      renderVehicles();
      return;
    }

    allVehicles = Array.isArray(data.vehicles) ? data.vehicles : [];
    renderVehicles();
  } catch (error) {
    console.error("Load vehicles error:", error);
    allVehicles = [];
    renderVehicles();
  }
}

function startEditVehicle(vehicleId) {
  const vehicle = allVehicles.find(function (item) {
    return Number(item.id) === Number(vehicleId);
  });

  if (!vehicle) return;

  editingVehicleId = vehicle.id;
  modalTitle.textContent = "Edit Vehicle";

  makeInput.value = vehicle.make || "";
  modelInput.value = vehicle.model || "";
  yearInput.value = vehicle.year || "";
  colorInput.value = vehicle.color || "";
  licensePlateInput.value = vehicle.license_plate || "";
  vinInput.value = vehicle.vin || "";
  mileageInput.value = vehicle.mileage || "";

  clearFormMessage();
  openVehicleModal();
}

async function deleteVehicle(vehicleId) {
  const confirmed = window.confirm("Are you sure you want to delete this vehicle?");
  if (!confirmed) return;

  try {
    const response = await fetch(`${apiBaseUrl}/api/vehicles/${vehicleId}`, {
      method: "DELETE"
    });

    const data = await response.json();
    console.log("Delete vehicle response:", data);

    if (!data.success) {
      alert(data.message || "Failed to delete vehicle.");
      return;
    }

    await loadVehicles();
  } catch (error) {
    console.error("Delete vehicle error:", error);
    alert("Something went wrong while deleting the vehicle.");
  }
}

if (addVehicleBtn) {
  addVehicleBtn.addEventListener("click", function () {
    resetVehicleForm();
    openVehicleModal();
  });
}

if (closeModalBtn) {
  closeModalBtn.addEventListener("click", closeVehicleModal);
}

if (modalCloseIcon) {
  modalCloseIcon.addEventListener("click", closeVehicleModal);
}

if (vehicleModal) {
  vehicleModal.addEventListener("click", function (e) {
    if (e.target === vehicleModal) {
      closeVehicleModal();
    }
  });
}

if (vehicleForm) {
  vehicleForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    clearFormMessage();

    const payload = {
      customerId: currentCustomerId,
      make: makeInput.value.trim(),
      model: modelInput.value.trim(),
      year: yearInput.value ? Number(yearInput.value) : null,
      color: colorInput.value.trim(),
      licensePlate: licensePlateInput.value.trim(),
      vin: vinInput.value.trim(),
      mileage: mileageInput.value ? Number(mileageInput.value) : null
    };

    if (!payload.make || !payload.model) {
      showFormMessage("error", "Make and model are required.");
      return;
    }

    try {
      let response;

      if (editingVehicleId) {
        response = await fetch(`${apiBaseUrl}/api/vehicles/${editingVehicleId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`${apiBaseUrl}/api/vehicles`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await response.json();
      console.log("Save vehicle response:", data);

      if (!response.ok || !data.success) {
        showFormMessage("error", data.message || "Failed to save vehicle.");
        return;
      }

      closeVehicleModal();
      await loadVehicles();
    } catch (error) {
      console.error("Save vehicle error:", error);
      showFormMessage("error", "Could not connect to the server.");
    }
  });
}

window.addEventListener("DOMContentLoaded", function () {
  loadVehicles();
});