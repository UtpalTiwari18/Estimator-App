const API_BASE = "http://localhost:5000";

const userButton = document.getElementById("userButton");
const userMenu = document.getElementById("userMenu");
const logoutBtn = document.getElementById("logoutBtn");
const userName = document.getElementById("userName");
const menuButton = document.getElementById("menuButton");
const menuArea = document.getElementById("menuArea");
const servicesMenu = document.getElementById("servicesMenu");
const servicesLink = document.getElementById("servicesLink");

const savedBusinessesList = document.getElementById("savedBusinessesList");
const savedCountText = document.getElementById("savedCountText");

const comparePanel = document.getElementById("comparePanel");
const compareStatusText = document.getElementById("compareStatusText");
const clearCompareBtn = document.getElementById("clearCompareBtn");

const messageModalOverlay = document.getElementById("messageModalOverlay");
const messageModalClose = document.getElementById("messageModalClose");
const messageCancelBtn = document.getElementById("messageCancelBtn");
const messageForm = document.getElementById("messageForm");
const messageBusinessId = document.getElementById("messageBusinessId");
const messageModalTitle = document.getElementById("messageModalTitle");
const messageModalSubtitle = document.getElementById("messageModalSubtitle");
const messageFrom = document.getElementById("messageFrom");
const messageTo = document.getElementById("messageTo");
const messageSubject = document.getElementById("messageSubject");
const messageBody = document.getElementById("messageBody");
const messageSendBtn = document.getElementById("messageSendBtn");

let savedBusinessesCache = [];
let compareBusinessesCache = [];

function getLoggedInCustomer() {
  try {
    return JSON.parse(localStorage.getItem("estimatorCustomerAuth"));
  } catch (error) {
    return null;
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getBusinessId(business) {
  return String(business?.id ?? "");
}

function getCompareIds() {
  try {
    const ids = JSON.parse(localStorage.getItem("compareBusinesses")) || [];
    return Array.isArray(ids) ? ids.map(String) : [];
  } catch (error) {
    return [];
  }
}

function setCompareIds(ids) {
  localStorage.setItem("compareBusinesses", JSON.stringify(ids.map(String)));
}

function isLoggedIn() {
  return !!getLoggedInCustomer();
}

function getCustomerDisplayName(customer) {
  if (!customer) return "Estimator Customer";

  const fullName = [
    customer.firstName || customer.first_name || "",
    customer.lastName || customer.last_name || ""
  ].filter(Boolean).join(" ").trim();

  return fullName || "Estimator Customer";
}

function formatServices(services) {
  if (!services) return "Not listed";
  if (Array.isArray(services)) return services.join(", ");
  return String(services);
}

function closeMessageModal() {
  if (!messageModalOverlay) return;

  messageModalOverlay.classList.remove("active");
  document.body.style.overflow = "";

  if (messageForm) {
    messageForm.reset();
  }

  if (messageBusinessId) {
    messageBusinessId.value = "";
  }
}

function openMessageModal(business) {
  const customer = getLoggedInCustomer();

  if (!customer) {
    alert("Please log in to message a business.");
    window.location.href = "customerLogin.html";
    return;
  }

  if (!business) {
    alert("Business details could not be found.");
    return;
  }

  const businessEmail = business.email || business.businessEmail || "";
  if (!businessEmail) {
    alert("This business does not have an email address available.");
    return;
  }

  if (
    !messageModalOverlay ||
    !messageBusinessId ||
    !messageModalTitle ||
    !messageModalSubtitle ||
    !messageFrom ||
    !messageTo ||
    !messageSubject ||
    !messageBody
  ) {
    alert("Message modal is missing from the page.");
    return;
  }

  const customerName = getCustomerDisplayName(customer);
  const customerEmail = customer.email || "";
  const businessName = business.businessName || "Business";

  messageBusinessId.value = String(getBusinessId(business));
  messageModalTitle.textContent = `Message ${businessName}`;
  messageModalSubtitle.textContent = "Send a message directly from Estimator.";
  messageFrom.value = customerEmail;
  messageTo.value = businessEmail;
  messageSubject.value = `Service inquiry from ${customerName}`;
  messageBody.value =
`Hello ${businessName},

I found your business on Estimator and would like to learn more about your services.

Thank you.`;

  messageModalOverlay.classList.add("active");
  document.body.style.overflow = "hidden";

  setTimeout(() => {
    messageSubject.focus();
    messageSubject.setSelectionRange(
      messageSubject.value.length,
      messageSubject.value.length
    );
  }, 0);
}

const savedCustomer = getLoggedInCustomer();

if (!savedCustomer) {
  window.location.href = "customerLogin.html";
}

if (savedCustomer && savedCustomer.firstName && userName) {
  userName.textContent = savedCustomer.firstName;
} else if (savedCustomer && savedCustomer.first_name && userName) {
  userName.textContent = savedCustomer.first_name;
} else if (userName) {
  userName.textContent = "Guest";
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

if (menuButton && menuArea) {
  menuButton.addEventListener("click", function () {
    menuArea.classList.toggle("active");
  });
}

if (servicesLink && servicesMenu) {
  servicesLink.addEventListener("click", function (e) {
    const isMobile = window.matchMedia("(max-width: 900px)").matches;
    if (!isMobile) return;
    e.preventDefault();
    servicesMenu.classList.toggle("open");
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", function (e) {
    e.preventDefault();
    localStorage.removeItem("estimatorCustomerAuth");
    localStorage.removeItem("compareBusinesses");
    window.location.href = "home.html";
  });
}

if (clearCompareBtn) {
  clearCompareBtn.addEventListener("click", function () {
    localStorage.removeItem("compareBusinesses");
    compareBusinessesCache = [];
    updateComparePanel();
    renderSavedBusinesses(savedBusinessesCache);
  });
}

if (messageModalClose) {
  messageModalClose.addEventListener("click", closeMessageModal);
}

if (messageCancelBtn) {
  messageCancelBtn.addEventListener("click", closeMessageModal);
}

if (messageModalOverlay) {
  messageModalOverlay.addEventListener("click", function (e) {
    if (e.target === messageModalOverlay) {
      closeMessageModal();
    }
  });
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && messageModalOverlay?.classList.contains("active")) {
    closeMessageModal();
  }
});

function renderEmptyState() {
  savedCountText.textContent = "0 saved businesses";
  savedBusinessesList.innerHTML = `
    <div class="emptyState">
      <h3>No saved businesses yet</h3>
      <p>Search for shops and click Save to keep them here for later.</p>
    </div>
  `;
}

function renderSavedBusinesses(businesses) {
  if (!businesses || !businesses.length) {
    renderEmptyState();
    updateComparePanel();
    return;
  }

  const compareIds = getCompareIds();
  savedCountText.textContent = `${businesses.length} saved business(es)`;

  savedBusinessesList.innerHTML = businesses.map((business) => {
    const businessId = getBusinessId(business);
    const isSelectedForCompare = compareIds.includes(businessId);

    return `
      <div class="savedBusinessCard">
        <h3>${escapeHtml(business.businessName || "Business Name")}</h3>

        <div class="savedMeta">
          ${escapeHtml(business.businessType || "Automotive Service")} •
          ${escapeHtml(business.city || "")}, ${escapeHtml(business.state || "")} ${escapeHtml(business.zip || "")}
        </div>

        <div class="savedMeta">
          ${escapeHtml(business.phone || "No phone")}
          ${business.website ? `• <a href="${escapeHtml(business.website)}" target="_blank" rel="noopener noreferrer">Website</a>` : ""}
        </div>

        <div class="savedMeta">
          ${business.email || business.businessEmail ? `Email: ${escapeHtml(business.email || business.businessEmail)}` : "Email: Not available"}
        </div>

        <div class="savedServices">
          <strong>Services:</strong> ${escapeHtml(formatServices(business.services))}
        </div>

        <div class="savedActions">
          ${business.website ? `<a class="visitBtn" href="${escapeHtml(business.website)}" target="_blank" rel="noopener noreferrer">Visit Website</a>` : ""}
          <button class="removeBtn" data-business-id="${escapeHtml(businessId)}">Remove</button>
          <button class="compareBtn" data-business-id="${escapeHtml(businessId)}">
            ${isSelectedForCompare ? "Selected for Compare" : "Compare"}
          </button>
          <button class="messageBtn" data-business-id="${escapeHtml(businessId)}">
            Message
          </button>
        </div>
      </div>
    `;
  }).join("");

  attachSavedBusinessEvents();
  updateComparePanel();
}

function attachSavedBusinessEvents() {
  document.querySelectorAll(".removeBtn").forEach((button) => {
    button.addEventListener("click", async function () {
      const customer = getLoggedInCustomer();
      const customerId = customer?.id || customer?.customerId;
      const businessId = this.getAttribute("data-business-id");

      if (!customerId || !businessId) {
        alert("Customer ID or Business ID is missing.");
        return;
      }

      const confirmed = confirm("Remove this business from saved list?");
      if (!confirmed) return;

      try {
        const response = await fetch(`${API_BASE}/api/save-business/${customerId}/${businessId}`, {
          method: "DELETE"
        });

        const data = await response.json();

        if (data.success) {
          const compareIds = getCompareIds().filter((id) => id !== String(businessId));
          setCompareIds(compareIds);

          alert(data.message || "Business removed successfully.");
          loadSavedBusinesses();
        } else {
          alert(data.message || "Could not remove business.");
        }
      } catch (error) {
        console.error("Remove saved business error:", error);
        alert("Server error while removing business.");
      }
    });
  });

  document.querySelectorAll(".compareBtn").forEach((button) => {
    button.addEventListener("click", function () {
      if (!isLoggedIn()) {
        alert("Please log in to compare businesses.");
        window.location.href = "customerLogin.html";
        return;
      }

      const businessId = String(this.getAttribute("data-business-id"));
      let compareIds = getCompareIds();

      if (compareIds.includes(businessId)) {
        compareIds = compareIds.filter((id) => id !== businessId);
        setCompareIds(compareIds);
        renderSavedBusinesses(savedBusinessesCache);
        return;
      }

      if (compareIds.length >= 2) {
        alert("You can compare only 2 businesses at a time.");
        return;
      }

      compareIds.push(businessId);
      setCompareIds(compareIds);
      renderSavedBusinesses(savedBusinessesCache);
    });
  });

  document.querySelectorAll(".messageBtn").forEach((button) => {
    button.addEventListener("click", function () {
      if (!isLoggedIn()) {
        alert("Please log in to message a business.");
        window.location.href = "customerLogin.html";
        return;
      }

      const businessId = String(this.getAttribute("data-business-id"));
      const business = savedBusinessesCache.find((item) => getBusinessId(item) === businessId);

      if (!business) {
        alert("Business details could not be found.");
        return;
      }

      openMessageModal(business);
    });
  });
}

function updateComparePanel() {
  const compareIds = getCompareIds();
  compareBusinessesCache = savedBusinessesCache.filter((business) =>
    compareIds.includes(getBusinessId(business))
  );

  if (!compareStatusText || !comparePanel) return;

  if (compareBusinessesCache.length === 0) {
    compareStatusText.textContent = "Select up to 2 businesses to compare them here.";
    comparePanel.className = "comparePanel comparePanelEmpty";
    comparePanel.innerHTML = `
      <div class="compareEmptyState">
        Choose 2 businesses to compare services, location, contact, and website side by side.
      </div>
    `;
    return;
  }

  if (compareBusinessesCache.length === 1) {
    compareStatusText.textContent = "1 business selected. Select 1 more to compare.";
  } else {
    compareStatusText.textContent = "2 businesses selected. Review the comparison below.";
  }

  comparePanel.className = "comparePanel";
  comparePanel.innerHTML = `
    <div class="compareGrid">
      ${compareBusinessesCache.map((business) => {
        return `
          <div class="compareCard">
            <h3>${escapeHtml(business.businessName || "Business Name")}</h3>

            <div class="compareRow">
              <span class="compareLabel">Type:</span>
              ${escapeHtml(business.businessType || "Automotive Service")}
            </div>

            <div class="compareRow">
              <span class="compareLabel">Location:</span>
              ${escapeHtml(business.city || "")}, ${escapeHtml(business.state || "")} ${escapeHtml(business.zip || "")}
            </div>

            <div class="compareRow">
              <span class="compareLabel">Phone:</span>
              ${escapeHtml(business.phone || "Not available")}
            </div>

            <div class="compareRow">
              <span class="compareLabel">Email:</span>
              ${escapeHtml(business.email || business.businessEmail || "Not available")}
            </div>

            <div class="compareRow">
              <span class="compareLabel">Services:</span>
              ${escapeHtml(formatServices(business.services))}
            </div>

            <div class="compareRow">
              <span class="compareLabel">Website:</span>
              ${
                business.website
                  ? `<a href="${escapeHtml(business.website)}" target="_blank" rel="noopener noreferrer">Visit Website</a>`
                  : "Not available"
              }
            </div>

            <div class="compareCardActions">
              ${
                business.website
                  ? `<a class="visitBtn" href="${escapeHtml(business.website)}" target="_blank" rel="noopener noreferrer">Visit Website</a>`
                  : ""
              }
              <button class="messageBtn compareMessageBtn" data-business-id="${escapeHtml(getBusinessId(business))}">
                Message
              </button>
              <button class="removeBtn compareRemoveBtn" data-business-id="${escapeHtml(getBusinessId(business))}">
                Remove From Compare
              </button>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;

  attachComparePanelEvents();
}

function attachComparePanelEvents() {
  document.querySelectorAll(".compareRemoveBtn").forEach((button) => {
    button.addEventListener("click", function () {
      const businessId = String(this.getAttribute("data-business-id"));
      const compareIds = getCompareIds().filter((id) => id !== businessId);
      setCompareIds(compareIds);
      renderSavedBusinesses(savedBusinessesCache);
    });
  });

  document.querySelectorAll(".compareMessageBtn").forEach((button) => {
    button.addEventListener("click", function () {
      if (!isLoggedIn()) {
        alert("Please log in to message a business.");
        window.location.href = "customerLogin.html";
        return;
      }

      const businessId = String(this.getAttribute("data-business-id"));
      const business = savedBusinessesCache.find((item) => getBusinessId(item) === businessId);

      if (!business) {
        alert("Business details could not be found.");
        return;
      }

      openMessageModal(business);
    });
  });
}

async function loadSavedBusinesses() {
  const customer = getLoggedInCustomer();
  const customerId = customer?.id || customer?.customerId;

  if (!customerId) {
    renderEmptyState();
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/saved-businesses/${customerId}`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      savedBusinessesCache = [];
      renderEmptyState();
      return;
    }

    savedBusinessesCache = Array.isArray(data.businesses) ? data.businesses : [];
    renderSavedBusinesses(savedBusinessesCache);
  } catch (error) {
    console.error("Load saved businesses error:", error);
    savedBusinessesCache = [];
    savedCountText.textContent = "Could not load saved businesses";
    savedBusinessesList.innerHTML = `
      <div class="emptyState">
        <h3>Unable to load saved businesses</h3>
        <p>Please try again later.</p>
      </div>
    `;
  }
}

if (messageForm) {
  messageForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const customer = getLoggedInCustomer();
    const customerId = customer?.id || customer?.customerId;
    const businessId = messageBusinessId?.value.trim() || "";
    const fromEmail = messageFrom?.value.trim() || "";
    const subject = messageSubject?.value.trim() || "";
    const message = messageBody?.value.trim() || "";

    if (!customerId) {
      alert("You must be logged in to send a message.");
      window.location.href = "customerLogin.html";
      return;
    }

    if (!fromEmail) {
      alert("Please enter your email.");
      return;
    }

    if (!businessId || !subject || !message) {
      alert("Please complete subject and message.");
      return;
    }

    const originalButtonText = messageSendBtn ? messageSendBtn.textContent : "Send Message";

    if (messageSendBtn) {
      messageSendBtn.disabled = true;
      messageSendBtn.textContent = "Sending...";
    }

    try {
      const response = await fetch(`${API_BASE}/api/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customerId: Number(customerId),
          businessId: Number(businessId),
          fromEmail,
          subject,
          message
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Failed to send message.");
        return;
      }

      alert("Message sent successfully.");
      closeMessageModal();
    } catch (error) {
      console.error("Send message error:", error);
      alert("Server error while sending message.");
    } finally {
      if (messageSendBtn) {
        messageSendBtn.disabled = false;
        messageSendBtn.textContent = originalButtonText;
      }
    }
  });
}

loadSavedBusinesses();