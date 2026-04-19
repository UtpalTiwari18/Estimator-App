document.addEventListener("DOMContentLoaded", function () {
  const API_BASE = "http://localhost:5000";

  const userMenu = document.getElementById("userMenu");
  const userButton = document.getElementById("userButton");
  const logoutBtn = document.getElementById("logoutBtn");
  const managerName = document.getElementById("managerName");
  const menuButton = document.getElementById("menuButton");
  const menuArea = document.getElementById("menuArea");

  const completedJobsList = document.getElementById("completedJobsList");
  const completedJobsTotal = document.getElementById("completedJobsTotal");

  let savedBusiness = null;

  try {
    const rawBusiness = localStorage.getItem("estimatorBusinessAuth");
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

  loadCompletedJobs();

  async function loadCompletedJobs() {
    try {
      const zip = String(savedBusiness.zip || "").trim();

      if (!zip) {
        completedJobsList.innerHTML = `<div class="emptyState">Business ZIP not found in login session.</div>`;
        completedJobsTotal.textContent = "0 Jobs";
        return;
      }

      const response = await fetch(
        `${API_BASE}/api/business/requests?zip=${encodeURIComponent(zip)}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load completed jobs.");
      }

      const allRequests = Array.isArray(data.requests) ? data.requests : [];
      const completedJobs = allRequests.filter(
        (item) => normalizeStatus(item.status) === "Completed"
      );

      completedJobsTotal.textContent = `${completedJobs.length} Job${completedJobs.length === 1 ? "" : "s"}`;

      renderCompletedJobs(completedJobs);
    } catch (error) {
      console.error("Load completed jobs error:", error);
      completedJobsList.innerHTML = `<div class="emptyState">Unable to load completed jobs.</div>`;
      completedJobsTotal.textContent = "0 Jobs";
    }
  }

  function renderCompletedJobs(jobs) {
    if (!jobs.length) {
      completedJobsList.innerHTML = `<div class="emptyState">No completed jobs yet.</div>`;
      return;
    }

    completedJobsList.innerHTML = jobs.map((job) => {
      const vehicleText =
        `${job.vehicle_year || ""} ${job.vehicle_make || ""} ${job.vehicle_model || ""}`.trim();

      return `
        <div class="completedJobCard">
          <h3>${escapeHtml(job.service_needed || "Completed Job")}</h3>
          <p class="completedDateTop"><strong>Completed Date:</strong> ${escapeHtml(formatDateTime(job.completed_at))}</p>

          <div class="completedJobMeta">
            <p><strong>Category:</strong> ${escapeHtml(job.service_category || "Not provided")}</p>
            <p><strong>Customer:</strong> ${escapeHtml(job.customer_name || "Customer")}</p>
            <p><strong>Email:</strong> ${escapeHtml(job.customer_email || "Not provided")}</p>
            <p><strong>ZIP:</strong> ${escapeHtml(job.zip_code || "")}</p>
            <p><strong>Preferred Date:</strong> ${escapeHtml(formatDate(job.preferred_date))}</p>
            <p><strong>Preferred Time:</strong> ${escapeHtml(job.preferred_time || "Not provided")}</p>
            <p><strong>Budget:</strong> ${escapeHtml(job.budget || "Not provided")}</p>
            <p><strong>Status:</strong> <span class="statusBadge completed">${escapeHtml(job.status || "Completed")}</span></p>
            <p><strong>Vehicle:</strong> ${escapeHtml(vehicleText || "Not provided")}</p>
            <p><strong>License Plate:</strong> ${escapeHtml(job.vehicle_license_plate || "Not provided")}</p>
            <p><strong>VIN:</strong> ${escapeHtml(job.vehicle_vin || "Not provided")}</p>
            <p><strong>Mileage:</strong> ${escapeHtml(job.vehicle_mileage || "Not provided")}</p>
          </div>

          <p class="completedJobDescription">
            <strong>Description:</strong> ${escapeHtml(job.problem_description || "No description provided.")}
          </p>
        </div>
      `;
    }).join("");
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

  function formatDateTime(dateValue) {
    if (!dateValue) return "Not available";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "Not available";
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value == null ? "" : String(value);
    return div.innerHTML;
  }
});