const API_BASE_URL = "http://localhost:5000";

document.addEventListener("DOMContentLoaded", () => {
  setupHeaderMenu();
  setupUserDropdown();
  loadUserName();
  loadMyRequests();
});

function setupHeaderMenu() {
  const menuButton = document.getElementById("menuButton");
  const menuArea = document.getElementById("menuArea");
  const servicesMenu = document.getElementById("servicesMenu");
  const servicesLink = document.getElementById("servicesLink");
  const categories = document.querySelectorAll(".megaCategory");

  if (menuButton && menuArea) {
    menuButton.addEventListener("click", () => {
      menuArea.classList.toggle("open");
      menuButton.classList.toggle("open");
    });
  }

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

  categories.forEach((btn) => {
    btn.addEventListener("click", () => {
      categories.forEach((item) => item.classList.remove("isActive"));
      btn.classList.add("isActive");

      const panelId = btn.getAttribute("data-panel");
      document.querySelectorAll(".megaPanel").forEach((panel) => {
        panel.classList.remove("isVisible");
      });

      const selectedPanel = document.getElementById(panelId);
      if (selectedPanel) {
        selectedPanel.classList.add("isVisible");
      }
    });
  });
}

function setupUserDropdown() {
  const userMenu = document.getElementById("userMenu");
  const userButton = document.getElementById("userButton");
  const logoutBtn = document.getElementById("logoutBtn");

  if (userMenu && userButton) {
    userButton.addEventListener("click", (e) => {
      e.stopPropagation();
      userMenu.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
      if (!userMenu.contains(e.target)) {
        userMenu.classList.remove("open");
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("estimatorCustomerAuth");
      localStorage.removeItem("user");
      window.location.href = "home.html";
    });
  }
}

function loadUserName() {
  const userNameEl = document.getElementById("userName");
  const savedCustomer =
    JSON.parse(localStorage.getItem("estimatorCustomerAuth")) ||
    JSON.parse(localStorage.getItem("user"));

  if (!savedCustomer) {
    window.location.href = "customerLogin.html";
    return;
  }

  if (userNameEl) {
    userNameEl.textContent =
      savedCustomer.first_name ||
      savedCustomer.firstName ||
      savedCustomer.name ||
      "John";
  }
}

function getLoggedInCustomer() {
  return (
    JSON.parse(localStorage.getItem("estimatorCustomerAuth")) ||
    JSON.parse(localStorage.getItem("user"))
  );
}

function showMessage(type, text) {
  const messageBox = document.getElementById("myRequestsMessage");
  if (!messageBox) return;

  messageBox.className = `myRequestsMessage ${type}`;
  messageBox.textContent = text;

  setTimeout(() => {
    if (messageBox.textContent === text) {
      messageBox.className = "myRequestsMessage";
      messageBox.textContent = "";
    }
  }, 4000);
}

function normalizeStatus(status) {
  const value = String(status || "").trim().toLowerCase();

  if (value === "done" || value === "completed" || value === "complete") {
    return "done";
  }

  if (
    value === "in progress" ||
    value === "inprogress" ||
    value === "processing"
  ) {
    return "in progress";
  }

  return "pending";
}

function statusClassName(status) {
  const value = normalizeStatus(status);

  if (value === "done") return "status-done";
  if (value === "in progress") return "status-inprogress";
  return "status-pending";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function parseApiResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const rawText = await response.text();

  if (!contentType.includes("application/json")) {
    if (rawText.trim().startsWith("<!DOCTYPE") || rawText.trim().startsWith("<html")) {
      throw new Error("Server returned HTML instead of JSON. Your backend route is missing or not responding correctly.");
    }
    throw new Error(rawText || "Server did not return valid JSON.");
  }

  try {
    return JSON.parse(rawText);
  } catch {
    throw new Error("Invalid JSON returned from server.");
  }
}

async function loadMyRequests() {
  const container = document.getElementById("myRequestsContainer");
  const countEl = document.getElementById("requestCount");
  const customer = getLoggedInCustomer();

  if (!container) return;

  if (!customer) {
    window.location.href = "customerLogin.html";
    return;
  }

  const customerId = customer.id || customer.customer_id || customer.customerId || "";
  const email = customer.email || "";

  try {
    container.innerHTML = `
      <div class="emptyRequestsState">
        <h3>Loading requests...</h3>
        <p>Please wait a moment.</p>
      </div>
    `;

    const response = await fetch(
      `${API_BASE_URL}/api/requests/my-requests?customer_id=${encodeURIComponent(customerId)}&email=${encodeURIComponent(email)}`
    );

    const data = await parseApiResponse(response);

    if (!response.ok) {
      throw new Error(data.message || "Could not load requests.");
    }

    const requests = Array.isArray(data.requests) ? data.requests : [];

    if (countEl) {
      countEl.textContent = requests.length;
    }

    if (!requests.length) {
      container.innerHTML = `
        <div class="emptyRequestsState">
          <h3>No requests yet</h3>
          <p>You have not submitted any requests yet.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = requests.map(createRequestCardHtml).join("");
    attachCardEvents();
  } catch (error) {
    console.error("Load requests error:", error);

    if (countEl) {
      countEl.textContent = "0";
    }

    container.innerHTML = `
      <div class="emptyRequestsState">
        <h3>Could not load requests</h3>
        <p>${escapeHtml(error.message || "Something went wrong.")}</p>
      </div>
    `;
  }
}