document.addEventListener("DOMContentLoaded", function () {
  const API_BASE = "http://localhost:5000";

  const userMenu = document.getElementById("userMenu");
  const userButton = document.getElementById("userButton");
  const logoutBtn = document.getElementById("logoutBtn");
  const managerName = document.getElementById("managerName");
  const menuButton = document.getElementById("menuButton");
  const menuArea = document.getElementById("menuArea");

  const incomingRequestsList = document.getElementById("incomingRequestsList");
  const incomingRequestsTotal = document.getElementById("incomingRequestsTotal");
  const acceptedJobsList = document.getElementById("acceptedJobsList");
  const acceptedJobsTotal = document.getElementById("acceptedJobsTotal");

  let savedBusiness = null;

  try {
    const rawBusiness = localStorage.getItem("estimatorBusinessAuth");
    if (rawBusiness) savedBusiness = JSON.parse(rawBusiness);
  } catch (error) {
    console.error("Error reading business auth:", error);
  }

  if (!savedBusiness) {
    window.location.href = "businessLogin.html";
    return;
  }

  if (managerName) {
    managerName.textContent = savedBusiness.ownerName
      ? `Mg. ${savedBusiness.ownerName}`
      : "Mg.";
  }

  if (userButton && userMenu) {
    userButton.addEventListener("click", function (e) {
      e.stopPropagation();
      userMenu.classList.toggle("active");
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
      localStorage.removeItem("estimatorBusinessAuth");
      window.location.href = "home.html";
    });
  }

  if (menuButton && menuArea) {
    menuButton.addEventListener("click", function () {
      menuArea.classList.toggle("open");
    });
  }

  loadIncomingRequestsPage();

  async function loadIncomingRequestsPage() {
    try {
      const zip = String(savedBusiness.zip || "").trim();
      const businessId = Number(savedBusiness.id);

      if (!zip || !businessId) {
        incomingRequestsList.innerHTML = `<div class="emptyState">Business ZIP or business ID not found in login session.</div>`;
        acceptedJobsList.innerHTML = `<div class="emptyState">Business ZIP or business ID not found in login session.</div>`;
        incomingRequestsTotal.textContent = "0 Requests";
        acceptedJobsTotal.textContent = "0 Jobs";
        return;
      }

      const response = await fetch(
        `${API_BASE}/api/business/requests?zip=${encodeURIComponent(zip)}&business_id=${encodeURIComponent(businessId)}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load requests.");
      }

      const allRequests = Array.isArray(data.requests) ? data.requests : [];

      const pendingRequests = allRequests.filter((item) => {
        return normalizeStatus(item.status) === "Pending";
      });

      const acceptedJobs = allRequests.filter((item) => {
        return normalizeStatus(item.my_action_status) === "Accepted";
      });

      incomingRequestsTotal.textContent = `${pendingRequests.length} Request${pendingRequests.length === 1 ? "" : "s"}`;
      acceptedJobsTotal.textContent = `${acceptedJobs.length} Job${acceptedJobs.length === 1 ? "" : "s"}`;

      renderPendingRequests(pendingRequests);
      renderAcceptedJobs(acceptedJobs);
    } catch (error) {
      console.error("Incoming requests load error:", error);
      incomingRequestsList.innerHTML = `<div class="emptyState">Unable to load incoming requests.</div>`;
      acceptedJobsList.innerHTML = `<div class="emptyState">Unable to load accepted jobs.</div>`;
      incomingRequestsTotal.textContent = "0 Requests";
      acceptedJobsTotal.textContent = "0 Jobs";
    }
  }

  function renderPendingRequests(requests) {
    if (!requests.length) {
      incomingRequestsList.innerHTML = `<div class="emptyState">No incoming requests in your ZIP yet.</div>`;
      return;
    }

    incomingRequestsList.innerHTML = requests.map((request) => {
      const vehicleText = `${request.vehicle_year || ""} ${request.vehicle_make || ""} ${request.vehicle_model || ""}`.trim();

      return `
        <div class="requestCard">
          <h3>${escapeHtml(request.service_needed || "Service Request")}</h3>

          <div class="requestMeta">
            <p><strong>Category:</strong> ${escapeHtml(request.service_category || "Not provided")}</p>
            <p><strong>Customer:</strong> ${escapeHtml(request.customer_name || "Customer")}</p>
            <p><strong>Email:</strong> ${escapeHtml(request.customer_email || "Not provided")}</p>
            <p><strong>ZIP:</strong> ${escapeHtml(request.zip_code || "")}</p>
            <p><strong>Preferred Date:</strong> ${escapeHtml(formatDate(request.preferred_date))}</p>
            <p><strong>Preferred Time:</strong> ${escapeHtml(request.preferred_time || "Not provided")}</p>
            <p><strong>Budget:</strong> ${escapeHtml(request.budget || "Not provided")}</p>
            <p><strong>Status:</strong> <span class="statusBadge pending">${escapeHtml(request.status || "Pending")}</span></p>
            <p><strong>Vehicle:</strong> ${escapeHtml(vehicleText || "Not provided")}</p>
            <p><strong>License Plate:</strong> ${escapeHtml(request.vehicle_license_plate || "Not provided")}</p>
            <p><strong>VIN:</strong> ${escapeHtml(request.vehicle_vin || "Not provided")}</p>
            <p><strong>Mileage:</strong> ${escapeHtml(request.vehicle_mileage || "Not provided")}</p>
          </div>

          <p class="requestDescription">
            <strong>Description:</strong> ${escapeHtml(request.problem_description || "No description provided.")}
          </p>

          <div class="requestActions">
            <button class="requestBtn acceptBtn" data-request-id="${request.id}" data-status="Accepted">Accept</button>
            <button class="requestBtn declineBtn" data-request-id="${request.id}" data-status="Declined">Reject</button>
          </div>
        </div>
      `;
    }).join("");

    attachPendingActionEvents();
  }

  function renderAcceptedJobs(jobs) {
    if (!jobs.length) {
      acceptedJobsList.innerHTML = `<div class="emptyState">No accepted jobs yet.</div>`;
      return;
    }

    acceptedJobsList.innerHTML = jobs.map((job) => {
      const vehicleText = `${job.vehicle_year || ""} ${job.vehicle_make || ""} ${job.vehicle_model || ""}`.trim();

      return `
        <div class="requestCard">
          <h3>${escapeHtml(job.service_needed || "Accepted Job")}</h3>

          <div class="requestMeta">
            <p><strong>Category:</strong> ${escapeHtml(job.service_category || "Not provided")}</p>
            <p><strong>Customer:</strong> ${escapeHtml(job.customer_name || "Customer")}</p>
            <p><strong>Email:</strong> ${escapeHtml(job.customer_email || "Not provided")}</p>
            <p><strong>ZIP:</strong> ${escapeHtml(job.zip_code || "")}</p>
            <p><strong>Preferred Date:</strong> ${escapeHtml(formatDate(job.preferred_date))}</p>
            <p><strong>Preferred Time:</strong> ${escapeHtml(job.preferred_time || "Not provided")}</p>
            <p><strong>Budget:</strong> ${escapeHtml(job.budget || "Not provided")}</p>
            <p><strong>Status:</strong> <span class="statusBadge accepted">Accepted</span></p>
            <p><strong>Vehicle:</strong> ${escapeHtml(vehicleText || "Not provided")}</p>
            <p><strong>License Plate:</strong> ${escapeHtml(job.vehicle_license_plate || "Not provided")}</p>
            <p><strong>VIN:</strong> ${escapeHtml(job.vehicle_vin || "Not provided")}</p>
            <p><strong>Mileage:</strong> ${escapeHtml(job.vehicle_mileage || "Not provided")}</p>
          </div>

          <p class="requestDescription">
            <strong>Description:</strong> ${escapeHtml(job.problem_description || "No description provided.")}
          </p>

          <div class="requestActions">
            <button class="requestBtn startBtn" data-request-id="${job.id}" data-status="Work in progress">Start Job</button>
          </div>
        </div>
      `;
    }).join("");

    attachAcceptedActionEvents();
  }

  function attachPendingActionEvents() {
    const buttons = incomingRequestsList.querySelectorAll(".requestBtn");

    buttons.forEach((button) => {
      button.addEventListener("click", async function () {
        const requestId = this.dataset.requestId;
        const status = this.dataset.status;
        const businessId = Number(savedBusiness.id);

        if (!requestId || !status || !businessId) return;

        try {
          const response = await fetch(
            `${API_BASE}/api/business/requests/${encodeURIComponent(requestId)}/status`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                status,
                businessId
              })
            }
          );

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.message || "Failed to update request.");
          }

          await loadIncomingRequestsPage();
        } catch (error) {
          console.error("Update request error:", error);
          alert(error.message || "Unable to update request.");
        }
      });
    });
  }

  function attachAcceptedActionEvents() {
    const buttons = acceptedJobsList.querySelectorAll(".requestBtn");

    buttons.forEach((button) => {
      button.addEventListener("click", async function () {
        const requestId = this.dataset.requestId;
        const status = this.dataset.status;
        const businessId = Number(savedBusiness.id);

        if (!requestId || !status || !businessId) return;

        this.disabled = true;
        this.textContent = "Starting...";

        try {
          const response = await fetch(
            `${API_BASE}/api/business/requests/${encodeURIComponent(requestId)}/status`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                status,
                businessId
              })
            }
          );

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.message || "Failed to start job.");
          }

          alert("Job Started");
          await loadIncomingRequestsPage();
        } catch (error) {
          console.error("Start job error:", error);
          alert(error.message || "Unable to start job.");
          this.disabled = false;
          this.textContent = "Start Job";
        }
      });
    });
  }

  function normalizeStatus(status) {
    const value = String(status || "").trim().toLowerCase();

    if (value === "accepted") return "Accepted";
    if (value === "completed" || value === "done") return "Completed";
    if (value === "work in progress" || value === "in progress" || value === "inprogress") {
      return "Work in progress";
    }
    if (value === "declined" || value === "rejected") return "Declined";
    return "Pending";
  }

  function formatDate(dateValue) {
    if (!dateValue) return "Not provided";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "Not provided";
    return date.toLocaleDateString();
  }

  function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value == null ? "" : String(value);
    return div.innerHTML;
  }
}); 