document.addEventListener("DOMContentLoaded", function () {
  const apiBaseUrl =
    window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
      ? "http://127.0.0.1:5000"
      : "https://estimator-app-icmp.onrender.com";

  let savedCustomer = null;

  try {
    savedCustomer =
      JSON.parse(localStorage.getItem("estimatorCustomerAuth")) ||
      JSON.parse(localStorage.getItem("user"));
  } catch (error) {
    console.error("Error reading saved customer:", error);
  }

  if (!savedCustomer || (!savedCustomer.id && !savedCustomer.customerId && !savedCustomer.customer_id)) {
    window.location.href = "customerLogin.html";
    return;
  }

  const currentCustomerId =
    savedCustomer.id || savedCustomer.customerId || savedCustomer.customer_id || "";

  const userButton = document.getElementById("userButton");
  const userMenu = document.getElementById("userMenu");
  const userDropdown = document.getElementById("userDropdown");
  const logoutBtn = document.getElementById("logoutBtn");
  const userName = document.getElementById("userName");

  const menuButton = document.getElementById("menuButton");
  const menuArea = document.getElementById("menuArea");

  const servicesMenu = document.getElementById("servicesMenu");
  const servicesLink = document.getElementById("servicesLink");
  const megaDropdown = document.getElementById("megaDropdown");
  const megaCategoryButtons = document.querySelectorAll(".megaCategory");
  const megaPanels = document.querySelectorAll(".megaPanel");

  const myRequestsContainer = document.getElementById("myRequestsContainer");
  const requestCount = document.getElementById("requestCount");
  const myRequestsMessage = document.getElementById("myRequestsMessage");
  const requestStatusFilter = document.getElementById("requestStatusFilter");

  if (userName) {
    userName.textContent =
      savedCustomer.first_name ||
      savedCustomer.firstName ||
      savedCustomer.name ||
      "John";
  }

  if (userButton && userMenu) {
    userButton.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      userMenu.classList.toggle("open");
      userMenu.classList.toggle("active");

      if (userDropdown) {
        userDropdown.classList.toggle("open");
        userDropdown.classList.toggle("active");
      }
    });

    document.querySelectorAll(".userDropdown a").forEach(function (link) {
      link.addEventListener("click", function () {
        userMenu.classList.remove("open");
        userMenu.classList.remove("active");

        if (userDropdown) {
          userDropdown.classList.remove("open");
          userDropdown.classList.remove("active");
        }
      });
    });

    if (userDropdown) {
      userDropdown.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    }

    document.addEventListener("click", function (e) {
      if (!userMenu.contains(e.target)) {
        userMenu.classList.remove("open");
        userMenu.classList.remove("active");

        if (userDropdown) {
          userDropdown.classList.remove("open");
          userDropdown.classList.remove("active");
        }
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem("estimatorCustomerAuth");
      localStorage.removeItem("user");
      window.location.href = "home.html";
    });
  }

  if (menuButton && menuArea) {
    menuButton.addEventListener("click", function () {
      menuArea.classList.toggle("open");
      menuArea.classList.toggle("active");
      menuButton.classList.toggle("open");
    });
  }

  if (servicesMenu && servicesLink) {
    servicesLink.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      servicesMenu.classList.toggle("open");
      servicesMenu.classList.toggle("active");
    });

    if (megaDropdown) {
      megaDropdown.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    }

    document.addEventListener("click", function (e) {
      if (!servicesMenu.contains(e.target)) {
        servicesMenu.classList.remove("open");
        servicesMenu.classList.remove("active");
      }
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

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return escapeHtml(value);
    return date.toLocaleDateString();
  }

  function normalizeStatus(status) {
    const value = String(status || "").trim().toLowerCase();

    if (value === "rejected" || value === "declined") return "Rejected";
    if (value === "accepted") return "Accepted";
    if (
      value === "business starts working" ||
      value === "work in progress" ||
      value === "in progress" ||
      value === "in-progress" ||
      value === "inprogress"
    ) {
      return "In-Progress";
    }
    if (value === "completed" || value === "complete" || value === "done") {
      return "Done";
    }

    return "Pending";
  }

  function statusClassName(status) {
    const value = normalizeStatus(status);

    if (value === "Rejected") return "status-rejected";
    if (value === "Accepted") return "status-accepted";
    if (value === "In-Progress") return "status-inprogress";
    if (value === "Done") return "status-done";
    return "status-pending";
  }

  async function parseApiResponse(response) {
    const contentType = response.headers.get("content-type") || "";
    const rawText = await response.text();

    if (!contentType.includes("application/json")) {
      if (
        rawText.trim().startsWith("<!DOCTYPE") ||
        rawText.trim().startsWith("<html")
      ) {
        throw new Error("Server returned HTML instead of JSON.");
      }
      throw new Error(rawText || "Server did not return valid JSON.");
    }

    return JSON.parse(rawText);
  }

  function showRequestsMessage(type, text) {
    if (!myRequestsMessage) return;
    myRequestsMessage.className = type
      ? `myRequestsMessage ${type}`
      : "myRequestsMessage";
    myRequestsMessage.textContent = text || "";
  }

  function createRequestCardHtml(request) {
    const requestId = request.id ?? "";
    const serviceNeeded = request.service_needed || "";
    const serviceCategory = request.service_category || "";
    const zipCode = request.zip_code || "";
    const preferredDate = request.preferred_date || "";
    const preferredTime = request.preferred_time || "";
    const budget = request.budget || "";
    const vehicleMake = request.vehicle_make || "";
    const vehicleModel = request.vehicle_model || "";
    const vehicleYear = request.vehicle_year || "";
    const vehicleColor = request.vehicle_color || "";
    const problemDescription = request.problem_description || "";
    const rawStatus = request.status || "Pending";
    const status = normalizeStatus(rawStatus);
    const createdAt = request.created_at || "";

    const vehicleText = [vehicleYear, vehicleMake, vehicleModel, vehicleColor]
      .filter(Boolean)
      .join(" ");

    const canDelete = status !== "Done";

    return `
      <div class="requestItemCard" data-request-id="${escapeHtml(requestId)}" data-status="${escapeHtml(status)}">
        <div class="requestItemTop">
          <div>
            <h3>${escapeHtml(serviceNeeded || "Service Request")}</h3>
            <div class="requestMeta">
              Category: ${escapeHtml(serviceCategory || "Not specified")}<br>
              Submitted: ${escapeHtml(formatDate(createdAt) || "Not available")}
            </div>
          </div>

          <div class="requestStatusArea">
            <div class="requestStatusBadge ${statusClassName(status)}">
              ${escapeHtml(status)}
            </div>
          </div>
        </div>

        <div class="requestGrid">
          <div class="requestField">
            <span class="requestFieldLabel">ZIP Code</span>
            <input class="requestInput" type="text" value="${escapeHtml(zipCode)}" disabled>
          </div>

          <div class="requestField">
            <span class="requestFieldLabel">Preferred Date</span>
            <input class="requestInput" type="text" value="${escapeHtml(formatDate(preferredDate) || "Not specified")}" disabled>
          </div>

          <div class="requestField">
            <span class="requestFieldLabel">Preferred Time</span>
            <input class="requestInput" type="text" value="${escapeHtml(preferredTime || "Not specified")}" disabled>
          </div>

          <div class="requestField">
            <span class="requestFieldLabel">Budget</span>
            <input class="requestInput" type="text" value="${escapeHtml(budget || "Not specified")}" disabled>
          </div>

          <div class="requestField">
            <span class="requestFieldLabel">Vehicle</span>
            <input class="requestInput" type="text" value="${escapeHtml(vehicleText || "Not specified")}" disabled>
          </div>

          <div class="requestField">
            <span class="requestFieldLabel">Status</span>
            <input class="requestInput" type="text" value="${escapeHtml(status)}" disabled>
          </div>
        </div>

        <div class="requestDescriptionBlock">
          <h4>Problem Description</h4>
          <textarea class="requestTextarea" disabled>${escapeHtml(problemDescription)}</textarea>
        </div>

        <div class="requestActionsRow">
          ${
            canDelete
              ? `<button class="deleteRequestButton" type="button" data-request-id="${escapeHtml(requestId)}">
                   Delete Request
                 </button>`
              : `<button class="deleteRequestButton disabledDeleteButton" type="button" disabled>
                   Completed Request
                 </button>`
          }
        </div>
      </div>
    `;
  }

  function applyStatusFilter() {
    if (!myRequestsContainer) return;

    const selectedStatus = requestStatusFilter ? requestStatusFilter.value : "all";
    const cards = myRequestsContainer.querySelectorAll(".requestItemCard");

    cards.forEach(function (card) {
      const cardStatus = card.getAttribute("data-status") || "Pending";

      if (selectedStatus === "all" || cardStatus === selectedStatus) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });

    const visibleCards = Array.from(cards).filter(function (card) {
      return card.style.display !== "none";
    });

    const existingEmptyFilterState = myRequestsContainer.querySelector(".emptyFilterState");
    if (existingEmptyFilterState) {
      existingEmptyFilterState.remove();
    }

    if (cards.length > 0 && visibleCards.length === 0) {
      const emptyFilterState = document.createElement("div");
      emptyFilterState.className = "emptyRequestsState emptyFilterState";
      emptyFilterState.innerHTML = `
        <h3>No matching requests</h3>
        <p>No requests were found for the selected status.</p>
      `;
      myRequestsContainer.appendChild(emptyFilterState);
    }
  }

  async function loadMyRequests() {
    if (!myRequestsContainer) return;

    try {
      showRequestsMessage("", "");
      myRequestsContainer.innerHTML = `
        <div class="emptyRequestsState">
          <h3>Loading requests...</h3>
          <p>Please wait a moment.</p>
        </div>
      `;

      const email = savedCustomer.email || "";

      const response = await fetch(
        `${apiBaseUrl}/api/requests/my-requests?customer_id=${encodeURIComponent(currentCustomerId)}&email=${encodeURIComponent(email)}`
      );

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Could not load requests.");
      }

      const requests = Array.isArray(data.requests) ? data.requests : [];

      if (requestCount) {
        requestCount.textContent = requests.length;
      }

      if (!requests.length) {
        myRequestsContainer.innerHTML = `
          <div class="emptyRequestsState">
            <h3>No requests yet</h3>
            <p>You have not submitted any requests yet.</p>
          </div>
        `;
        return;
      }

      myRequestsContainer.innerHTML = requests.map(createRequestCardHtml).join("");
      attachDeleteEvents();
      applyStatusFilter();
    } catch (error) {
      console.error("Load requests error:", error);

      if (requestCount) {
        requestCount.textContent = "0";
      }

      showRequestsMessage("error", error.message || "Something went wrong.");

      myRequestsContainer.innerHTML = `
        <div class="emptyRequestsState">
          <h3>Could not load requests</h3>
          <p>${escapeHtml(error.message || "Something went wrong.")}</p>
        </div>
      `;
    }
  }

  function attachDeleteEvents() {
    const deleteButtons = document.querySelectorAll(".deleteRequestButton[data-request-id]");

    deleteButtons.forEach(function (button) {
      button.addEventListener("click", async function () {
        const requestId = button.getAttribute("data-request-id");
        if (!requestId) return;

        const confirmed = window.confirm("Are you sure you want to delete this request?");
        if (!confirmed) return;

        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = "Deleting...";

        try {
          const response = await fetch(
            `${apiBaseUrl}/api/requests/delete-request/${encodeURIComponent(requestId)}`,
            { method: "DELETE" }
          );

          const data = await parseApiResponse(response);

          if (!response.ok) {
            throw new Error(data.message || "Could not delete request.");
          }

          await loadMyRequests();
        } catch (error) {
          console.error("Delete request error:", error);
          alert(error.message || "Something went wrong while deleting the request.");
          button.disabled = false;
          button.textContent = originalText;
        }
      });
    });
  }

  if (requestStatusFilter) {
    requestStatusFilter.addEventListener("change", function () {
      applyStatusFilter();
    });
  }

  loadMyRequests();
});