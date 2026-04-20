document.addEventListener("DOMContentLoaded", function () {
  const API_BASE = "http://localhost:5000";

  const userMenu = document.getElementById("userMenu");
  const userButton = document.getElementById("userButton");
  const logoutBtn = document.getElementById("logoutBtn");
  const managerName = document.getElementById("managerName");
  const menuButton = document.getElementById("menuButton");
  const menuArea = document.getElementById("menuArea");

  const activeJobsList = document.getElementById("activeJobsList");
  const activeJobsTotal = document.getElementById("activeJobsTotal");

  const messageModalOverlay = document.getElementById("messageModalOverlay");
  const closeMessageModal = document.getElementById("closeMessageModal");
  const cancelMessageBtn = document.getElementById("cancelMessageBtn");
  const messageCustomerForm = document.getElementById("messageCustomerForm");
  const messageCustomerName = document.getElementById("messageCustomerName");
  const messageCustomerEmail = document.getElementById("messageCustomerEmail");
  const messageSubject = document.getElementById("messageSubject");
  const messageBody = document.getElementById("messageBody");
  const messageFormNote = document.getElementById("messageFormNote");

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

  if (closeMessageModal) {
    closeMessageModal.addEventListener("click", closeMessagePopup);
  }

  if (cancelMessageBtn) {
    cancelMessageBtn.addEventListener("click", closeMessagePopup);
  }

  if (messageModalOverlay) {
    messageModalOverlay.addEventListener("click", function (e) {
      if (e.target === messageModalOverlay) {
        closeMessagePopup();
      }
    });
  }

  if (messageCustomerForm) {
    messageCustomerForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const subjectValue = messageSubject.value.trim();
      const bodyValue = messageBody.value.trim();

      if (!subjectValue || !bodyValue) {
        messageFormNote.textContent = "Please enter both subject and message.";
        messageFormNote.style.color = "#b10000";
        return;
      }

      messageFormNote.textContent = "Email popup ready. Email sending will be connected later.";
      messageFormNote.style.color = "#18733b";

      setTimeout(() => {
        closeMessagePopup();
        alert("Message popup ready for customer email.");
      }, 700);
    });
  }

  loadActiveJobs();

  async function loadActiveJobs() {
    try {
      const zip = String(savedBusiness.zip || "").trim();
      const businessId = Number(savedBusiness.id);

      if (!zip || !businessId) {
        activeJobsList.innerHTML = `<div class="emptyState">Business ZIP or business ID not found in login session.</div>`;
        activeJobsTotal.textContent = "0 Jobs";
        return;
      }

      const response = await fetch(
        `${API_BASE}/api/business/requests?zip=${encodeURIComponent(zip)}&business_id=${encodeURIComponent(businessId)}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load active jobs.");
      }

      const allRequests = Array.isArray(data.requests) ? data.requests : [];
      const activeJobs = allRequests.filter(
        (item) => normalizeStatus(item.my_action_status) === "Work in progress");

      activeJobsTotal.textContent = `${activeJobs.length} Job${activeJobs.length === 1 ? "" : "s"}`;

      renderActiveJobs(activeJobs);
    } catch (error) {
      console.error("Load active jobs error:", error);
      activeJobsList.innerHTML = `<div class="emptyState">Unable to load active jobs.</div>`;
      activeJobsTotal.textContent = "0 Jobs";
    }
  }

  function renderActiveJobs(jobs) {
    if (!jobs.length) {
      activeJobsList.innerHTML = `<div class="emptyState">No active jobs right now.</div>`;
      return;
    }

    activeJobsList.innerHTML = jobs.map((job) => {
      const vehicleText =
        `${job.vehicle_year || ""} ${job.vehicle_make || ""} ${job.vehicle_model || ""}`.trim();

      return `
        <div class="activeJobCard">
          <h3>${escapeHtml(job.service_needed || "Active Job")}</h3>

          <div class="activeJobMeta">
            <p><strong>Category:</strong> ${escapeHtml(job.service_category || "Not provided")}</p>
            <p><strong>Customer:</strong> ${escapeHtml(job.customer_name || "Customer")}</p>
            <p><strong>Email:</strong> ${escapeHtml(job.customer_email || "Not provided")}</p>
            <p><strong>ZIP:</strong> ${escapeHtml(job.zip_code || "")}</p>
            <p><strong>Preferred Date:</strong> ${escapeHtml(formatDate(job.preferred_date))}</p>
            <p><strong>Preferred Time:</strong> ${escapeHtml(job.preferred_time || "Not provided")}</p>
            <p><strong>Budget:</strong> ${escapeHtml(job.budget || "Not provided")}</p>
            <p><strong>Status:</strong> <span class="statusBadge inprogress">${escapeHtml(job.status || "Work in progress")}</span></p>
            <p><strong>Vehicle:</strong> ${escapeHtml(vehicleText || "Not provided")}</p>
            <p><strong>License Plate:</strong> ${escapeHtml(job.vehicle_license_plate || "Not provided")}</p>
            <p><strong>VIN:</strong> ${escapeHtml(job.vehicle_vin || "Not provided")}</p>
            <p><strong>Mileage:</strong> ${escapeHtml(job.vehicle_mileage || "Not provided")}</p>
          </div>

          <p class="activeJobDescription">
            <strong>Description:</strong> ${escapeHtml(job.problem_description || "No description provided.")}
          </p>

          <div class="activeJobActions">
            <button
              class="activeJobBtn messageBtn"
              data-customer-name="${escapeAttribute(job.customer_name || "Customer")}"
              data-customer-email="${escapeAttribute(job.customer_email || "")}">
              Message Customer
            </button>

            <button class="activeJobBtn completeBtn" data-request-id="${job.id}" data-status="Completed">
              Mark as Completed
            </button>
          </div>
        </div>
      `;
    }).join("");

    attachCompleteEvents();
    attachMessageEvents();
  }

  function attachCompleteEvents() {
    const buttons = activeJobsList.querySelectorAll(".completeBtn");

    buttons.forEach((button) => {
      button.addEventListener("click", async function () {
        const requestId = this.dataset.requestId;
        const status = this.dataset.status;
        const businessId = Number(savedBusiness.id);

        if (!requestId || !status || !businessId) return;

        this.disabled = true;
        this.textContent = "Updating...";

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
            throw new Error(data.message || "Failed to complete job.");
          }

          alert("Job Completed");
          await loadActiveJobs();
        } catch (error) {
          console.error("Complete job error:", error);
          alert(error.message || "Unable to update job.");
          this.disabled = false;
          this.textContent = "Mark as Completed";
        }
      });
    });
  }

  function attachMessageEvents() {
    const buttons = activeJobsList.querySelectorAll(".messageBtn");

    buttons.forEach((button) => {
      button.addEventListener("click", function () {
        const customerName = this.dataset.customerName || "Customer";
        const customerEmail = this.dataset.customerEmail || "";

        openMessagePopup({
          name: customerName,
          email: customerEmail
        });
      });
    });
  }

  function openMessagePopup(customer) {
    if (!messageModalOverlay) return;

    if (messageCustomerName) {
      messageCustomerName.value = customer.name || "Customer";
    }

    if (messageCustomerEmail) {
      messageCustomerEmail.value = customer.email || "";
    }

    if (messageSubject) {
      messageSubject.value = "";
    }

    if (messageBody) {
      messageBody.value = "";
    }

    if (messageFormNote) {
      messageFormNote.textContent = "";
    }

    messageModalOverlay.classList.add("show");
  }

  function closeMessagePopup() {
    if (!messageModalOverlay) return;

    messageModalOverlay.classList.remove("show");

    if (messageCustomerName) {
      messageCustomerName.value = "";
    }

    if (messageCustomerEmail) {
      messageCustomerEmail.value = "";
    }

    if (messageSubject) {
      messageSubject.value = "";
    }

    if (messageBody) {
      messageBody.value = "";
    }

    if (messageFormNote) {
      messageFormNote.textContent = "";
    }
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

  function escapeAttribute(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
});