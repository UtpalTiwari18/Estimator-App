document.addEventListener("DOMContentLoaded", function () {
  const API_BASE = "http://localhost:5000";

  const userMenu = document.getElementById("userMenu");
  const userButton = document.getElementById("userButton");
  const logoutBtn = document.getElementById("logoutBtn");
  const managerName = document.getElementById("managerName");
  const menuButton = document.getElementById("menuButton");
  const menuArea = document.getElementById("menuArea");

  const incomingRequestCount = document.getElementById("incomingRequestCount");
  const activeJobCount = document.getElementById("activeJobCount");
  const completedJobCount = document.getElementById("completedJobCount");
  const averageRating = document.getElementById("averageRating");

  const dashboardIncomingRequests = document.getElementById("dashboardIncomingRequests");
  const dashboardActiveJobs = document.getElementById("dashboardActiveJobs");
  const dashboardRecentReviews = document.getElementById("dashboardRecentReviews");

  function clearBusinessSession() {
    localStorage.removeItem("estimatorBusinessAuth");
    sessionStorage.removeItem("estimatorBusinessAuth");
  }

  let savedBusiness = null;

  try {
    const rawBusiness = localStorage.getItem("estimatorBusinessAuth");
    if (rawBusiness) {
      savedBusiness = JSON.parse(rawBusiness);
    }
  } catch (error) {
    console.error("Error reading business auth from localStorage:", error);
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
      clearBusinessSession();
      window.location.href = "home.html";
    });
  }

  if (menuButton && menuArea) {
    menuButton.addEventListener("click", function () {
      menuArea.classList.toggle("open");
    });
  }

  loadDashboardData();

  async function loadDashboardData() {
    try {
      const zip = String(savedBusiness.zip || "").trim();
      const businessId = Number(savedBusiness.id || savedBusiness.businessId);

      if (!zip) {
        renderErrorState("Business ZIP not found in login session.");
        return;
      }

      if (!businessId) {
        renderErrorState("Business ID not found in login session.");
        return;
      }

      const [requestsResponse, reviewsResponse] = await Promise.all([
        fetch(
          `${API_BASE}/api/business/requests?zip=${encodeURIComponent(zip)}&business_id=${encodeURIComponent(businessId)}`
        ),
        fetch(`${API_BASE}/api/reviews/business/${encodeURIComponent(businessId)}`)
      ]);

      const requestsData = await requestsResponse.json();
      const reviewsData = await reviewsResponse.json();

      if (!requestsResponse.ok || !requestsData.success) {
        throw new Error(requestsData.message || "Failed to load requests.");
      }

      if (!reviewsResponse.ok || !reviewsData.success) {
        throw new Error(reviewsData.message || "Failed to load reviews.");
      }

      const allRequests = Array.isArray(requestsData.requests) ? requestsData.requests : [];
      const allReviews = Array.isArray(reviewsData.reviews) ? reviewsData.reviews : [];

      const pendingRequests = allRequests.filter((item) => {
        return normalizeStatus(item.status) === "Pending";
      });

      const activeJobs = allRequests.filter((item) => {
        return normalizeStatus(item.my_action_status) === "Work in progress";
      });

      const completedJobs = allRequests.filter((item) => {
        return normalizeStatus(item.my_action_status) === "Completed";
      });

      if (incomingRequestCount) incomingRequestCount.textContent = pendingRequests.length;
      if (activeJobCount) activeJobCount.textContent = activeJobs.length;
      if (completedJobCount) completedJobCount.textContent = completedJobs.length;

      const avgRating = calculateAverageRating(allReviews);
      if (averageRating) averageRating.textContent = `${avgRating.toFixed(1)} ★`;

      renderIncomingRequests(pendingRequests);
      renderActiveJobs(activeJobs);
      renderRecentReviews(allReviews);
    } catch (error) {
      console.error("Dashboard load error:", error);
      renderErrorState(error.message || "Unable to load dashboard data.");
    }
  }

  function renderIncomingRequests(requests) {
    if (!dashboardIncomingRequests) return;

    if (!requests.length) {
      dashboardIncomingRequests.innerHTML =
        `<div class="emptyState">No incoming requests in your ZIP yet.</div>`;
      return;
    }

    const recentRequests = requests.slice(0, 3);

    dashboardIncomingRequests.innerHTML = recentRequests.map((request) => {
      const vehicleText =
        `${request.vehicle_year || ""} ${request.vehicle_make || ""} ${request.vehicle_model || ""}`.trim();

      return `
        <div class="requestItem">
          <h3>${escapeHtml(request.service_needed || "Service Request")}</h3>
          <p><strong>Category:</strong> ${escapeHtml(request.service_category || "Not provided")}</p>
          <p><strong>Customer:</strong> ${escapeHtml(request.customer_name || "Customer")}</p>
          <p><strong>ZIP:</strong> ${escapeHtml(request.zip_code || "")}</p>
          <p><strong>Vehicle:</strong> ${escapeHtml(vehicleText || "Not provided")}</p>
          <p><strong>Description:</strong> ${escapeHtml(request.problem_description || "No description provided.")}</p>
        </div>
      `;
    }).join("");
  }

  function renderActiveJobs(jobs) {
    if (!dashboardActiveJobs) return;

    if (!jobs.length) {
      dashboardActiveJobs.innerHTML =
        `<div class="emptyState">No active jobs right now.</div>`;
      return;
    }

    const recentJobs = jobs.slice(0, 3);

    dashboardActiveJobs.innerHTML = recentJobs.map((job) => {
      const vehicleText =
        `${job.vehicle_year || ""} ${job.vehicle_make || ""} ${job.vehicle_model || ""}`.trim();

      return `
        <div class="jobItem">
          <h3>${escapeHtml(job.service_needed || "Active Job")}</h3>
          <p><strong>Customer:</strong> ${escapeHtml(job.customer_name || "Customer")}</p>
          <p><strong>ZIP:</strong> ${escapeHtml(job.zip_code || "")}</p>
          <p><strong>Vehicle:</strong> ${escapeHtml(vehicleText || "Not provided")}</p>
          <p><strong>Status:</strong> ${escapeHtml(job.my_action_status || "Work in progress")}</p>
        </div>
      `;
    }).join("");
  }

  function renderRecentReviews(reviews) {
    if (!dashboardRecentReviews) return;

    if (!reviews.length) {
      dashboardRecentReviews.innerHTML =
        `<div class="emptyState">No reviews yet for this business.</div>`;
      return;
    }

    const recentReviews = reviews.slice(0, 3);

    dashboardRecentReviews.innerHTML = recentReviews.map((review) => {
      const rating = Number(review.overall_rating || 0);
      const safeRating = Math.max(0, Math.min(5, rating));
      const stars = "★".repeat(safeRating) + "☆".repeat(5 - safeRating);

      return `
        <div class="reviewItem">
          <strong>${stars}</strong>
          <p><strong>${escapeHtml(review.review_title || "Review")}</strong></p>
          <p>“${escapeHtml(review.review_text || "No review text provided.")}”</p>
          <span>- ${escapeHtml(review.customer_name || "Customer")}</span>
        </div>
      `;
    }).join("");
  }

  function calculateAverageRating(reviews) {
    if (!reviews.length) return 0;

    const total = reviews.reduce((sum, review) => {
      return sum + Number(review.overall_rating || 0);
    }, 0);

    return total / reviews.length;
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

  function renderErrorState(message) {
    if (dashboardIncomingRequests) {
      dashboardIncomingRequests.innerHTML = `<div class="emptyState">${escapeHtml(message)}</div>`;
    }
    if (dashboardActiveJobs) {
      dashboardActiveJobs.innerHTML = `<div class="emptyState">${escapeHtml(message)}</div>`;
    }
    if (dashboardRecentReviews) {
      dashboardRecentReviews.innerHTML = `<div class="emptyState">${escapeHtml(message)}</div>`;
    }

    if (incomingRequestCount) incomingRequestCount.textContent = "0";
    if (activeJobCount) activeJobCount.textContent = "0";
    if (completedJobCount) completedJobCount.textContent = "0";
    if (averageRating) averageRating.textContent = "0.0 ★";
  }

  function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value == null ? "" : String(value);
    return div.innerHTML;
  }
});