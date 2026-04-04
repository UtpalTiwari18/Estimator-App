// ===============================
// USER DROPDOWN + NAME
// ===============================
const userButton = document.getElementById("userButton");
const userMenu = document.getElementById("userMenu");
const logoutBtn = document.getElementById("logoutBtn");
const userName = document.getElementById("userName");

const savedCustomer = JSON.parse(localStorage.getItem("estimatorCustomerAuth"));

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
// REVIEW SECTION TOGGLE
// ===============================
const businessReviewSection = document.getElementById("businessReviewSection");
const appReviewSection = document.getElementById("appReviewSection");

const openBusinessReviewBtn = document.getElementById("openBusinessReviewBtn");
const openAppReviewBtn = document.getElementById("openAppReviewBtn");

const closeBusinessReviewBtn = document.getElementById("closeBusinessReviewBtn");
const closeAppReviewBtn = document.getElementById("closeAppReviewBtn");

function openSection(sectionToOpen) {
  if (businessReviewSection) {
    businessReviewSection.classList.add("hidden");
  }

  if (appReviewSection) {
    appReviewSection.classList.add("hidden");
  }

  if (sectionToOpen) {
    sectionToOpen.classList.remove("hidden");
    sectionToOpen.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

if (openBusinessReviewBtn) {
  openBusinessReviewBtn.addEventListener("click", function () {
    openSection(businessReviewSection);
  });
}

if (openAppReviewBtn) {
  openAppReviewBtn.addEventListener("click", function () {
    openSection(appReviewSection);
  });
}

if (closeBusinessReviewBtn) {
  closeBusinessReviewBtn.addEventListener("click", function () {
    businessReviewSection.classList.add("hidden");
  });
}

if (closeAppReviewBtn) {
  closeAppReviewBtn.addEventListener("click", function () {
    appReviewSection.classList.add("hidden");
  });
}

// ===============================
// HELPERS
// ===============================
const apiBaseUrl = "http://localhost:5000";

function showFormMessage(messageElement, type, text) {
  if (!messageElement) return;
  messageElement.className = "reviewMessage " + type;
  messageElement.textContent = text;
}

function splitServices(servicesValue) {
  if (!servicesValue) return [];

  return servicesValue
    .split(",")
    .map(function (service) {
      return service.trim();
    })
    .filter(function (service) {
      return service.length > 0;
    });
}

// ===============================
// BUSINESS SEARCH + SELECTION
// ===============================
const searchBusinessBtn = document.getElementById("searchBusinessBtn");
const searchBusinessName = document.getElementById("searchBusinessName");
const searchBusinessZip = document.getElementById("searchBusinessZip");
const businessSearchMessage = document.getElementById("businessSearchMessage");
const businessResultsList = document.getElementById("businessResultsList");
const businessReviewForm = document.getElementById("businessReviewForm");

const selectedBusinessCard = document.getElementById("selectedBusinessCard");
const selectedBusinessText = document.getElementById("selectedBusinessText");
const selectedBusinessName = document.getElementById("selectedBusinessName");
const selectedBusinessZip = document.getElementById("selectedBusinessZip");
const businessServiceUsed = document.getElementById("businessServiceUsed");

let selectedBusinessData = null;

function renderBusinessResults(businesses) {
  if (!businessResultsList) return;

  businessResultsList.innerHTML = "";

  if (!businesses || businesses.length === 0) {
    businessResultsList.classList.add("hidden");
    showFormMessage(businessSearchMessage, "error", "No businesses found with that name and zip code.");
    return;
  }

  showFormMessage(businessSearchMessage, "success", businesses.length + " business(es) found.");
  businessResultsList.classList.remove("hidden");

  businesses.forEach(function (business) {
    const servicesArray = splitServices(business.services);

    const card = document.createElement("div");
    card.className = "businessResultCard";

    const serviceTags = servicesArray.length
      ? servicesArray
          .map(function (service) {
            return '<span class="businessServiceTag">' + service + "</span>";
          })
          .join("")
      : '<span class="businessServiceTag">No services listed</span>';

    card.innerHTML = `
      <div class="businessResultInfo">
        <h4>${business.businessName}</h4>
        <p><strong>Owner:</strong> ${business.ownerName || "-"}</p>
        <p><strong>Type:</strong> ${business.businessType || "-"}</p>
        <p><strong>Location:</strong> ${business.city || ""}, ${business.state || ""} ${business.zip || ""}</p>
        <div class="businessServiceTags">${serviceTags}</div>
      </div>
      <div>
        <button class="selectBusinessButton" type="button">Select</button>
      </div>
    `;

    const selectBtn = card.querySelector(".selectBusinessButton");
    selectBtn.addEventListener("click", function () {
      selectBusiness(business);
    });

    businessResultsList.appendChild(card);
  });
}

function populateBusinessServiceOptions(servicesArray) {
  if (!businessServiceUsed) return;

  businessServiceUsed.innerHTML = '<option value="">Select service used</option>';

  servicesArray.forEach(function (service) {
    const option = document.createElement("option");
    option.value = service;
    option.textContent = service;
    businessServiceUsed.appendChild(option);
  });
}

function selectBusiness(business) {
  selectedBusinessData = business;

  const servicesArray = splitServices(business.services);

  if (selectedBusinessName) {
    selectedBusinessName.value = business.businessName || "";
  }

  if (selectedBusinessZip) {
    selectedBusinessZip.value = business.zip || "";
  }

  if (selectedBusinessText) {
    selectedBusinessText.textContent =
      (business.businessName || "") +
      " • " +
      (business.city || "") +
      ", " +
      (business.state || "") +
      " " +
      (business.zip || "");
  }

  populateBusinessServiceOptions(servicesArray);

  if (businessReviewForm) {
    businessReviewForm.classList.remove("hidden");
    businessReviewForm.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

if (searchBusinessBtn) {
  searchBusinessBtn.addEventListener("click", async function () {
    const businessNameValue = searchBusinessName ? searchBusinessName.value.trim() : "";
    const zipValue = searchBusinessZip ? searchBusinessZip.value.trim() : "";

    if (!businessNameValue || !zipValue) {
      showFormMessage(businessSearchMessage, "error", "Please enter both business name and zip code.");
      return;
    }

    try {
      showFormMessage(businessSearchMessage, "success", "Searching businesses...");

      const response = await fetch(
        `${apiBaseUrl}/api/business-users/search?businessName=${encodeURIComponent(businessNameValue)}&zip=${encodeURIComponent(zipValue)}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        showFormMessage(
          businessSearchMessage,
          "error",
          data.message || "Could not search businesses right now."
        );
        return;
      }

      renderBusinessResults(data.businesses || []);
    } catch (error) {
      console.error("Business search error:", error);
      showFormMessage(businessSearchMessage, "error", "Server not reachable.");
    }
  });
}

// ===============================
// BUSINESS REVIEW SUBMIT
// ===============================
const businessReviewMessage = document.getElementById("businessReviewMessage");

if (businessReviewForm) {
  businessReviewForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!selectedBusinessData) {
      showFormMessage(businessReviewMessage, "error", "Please search and select a business first.");
      return;
    }

    const payload = {
      customerId: savedCustomer?.id || null,
      customerName: savedCustomer
        ? `${savedCustomer.firstName || ""} ${savedCustomer.lastName || ""}`.trim()
        : "Guest",
      customerEmail: savedCustomer?.email || "",
      businessId: selectedBusinessData.id,
      businessName: selectedBusinessData.businessName || "",
      businessZip: selectedBusinessData.zip || "",
      serviceUsed: document.getElementById("businessServiceUsed")?.value || "",
      overallRating: document.getElementById("businessRating")?.value || "",
      serviceLocation: document.getElementById("serviceLocation")?.value.trim() || "",
      serviceState: document.getElementById("serviceState")?.value.trim() || "",
      reviewTitle: document.getElementById("reviewTitle")?.value.trim() || "",
      wouldRecommend: document.getElementById("wouldRecommend")?.value || "",
      serviceDate: document.getElementById("businessReviewDate")?.value || "",
      valueForMoney: document.getElementById("businessPriceRating")?.value || "",
      reviewText: document.getElementById("businessReviewText")?.value.trim() || "",
      reviewType: "business"
    };

    if (
      !payload.serviceUsed ||
      !payload.overallRating ||
      !payload.serviceLocation ||
      !payload.serviceState ||
      !payload.reviewTitle ||
      !payload.wouldRecommend ||
      !payload.serviceDate ||
      !payload.valueForMoney ||
      !payload.reviewText
    ) {
      showFormMessage(businessReviewMessage, "error", "Please fill in all business review fields.");
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/reviews/business`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        showFormMessage(
          businessReviewMessage,
          "error",
          data.message || "Could not submit business review."
        );
        return;
      }

      showFormMessage(
        businessReviewMessage,
        "success",
        "Your business review has been submitted successfully."
      );

      businessReviewForm.reset();
      populateBusinessServiceOptions(splitServices(selectedBusinessData.services));
    } catch (error) {
      console.error("Business review submit error:", error);
      showFormMessage(businessReviewMessage, "error", "Server not reachable.");
    }
  });
}

// ===============================
// APP REVIEW SUBMIT
// ===============================
const appReviewForm = document.getElementById("appReviewForm");
const appReviewMessage = document.getElementById("appReviewMessage");

if (appReviewForm) {
  appReviewForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const payload = {
      customerId: savedCustomer?.id || null,
      customerName: savedCustomer
        ? `${savedCustomer.firstName || ""} ${savedCustomer.lastName || ""}`.trim()
        : "Guest",
      customerEmail: savedCustomer?.email || "",
      overallRating: document.getElementById("appRating")?.value || "",
      serviceUsed: document.getElementById("appServiceUsed")?.value.trim() || "",
      address: document.getElementById("appAddress")?.value.trim() || "",
      zipCode: document.getElementById("appZipCode")?.value.trim() || "",
      easeOfUse: document.getElementById("appEaseOfUse")?.value || "",
      businessMatchQuality: document.getElementById("appBusinessMatchQuality")?.value || "",
      reviewTitle: document.getElementById("appReviewTitle")?.value.trim() || "",
      wouldRecommend: document.getElementById("appWouldRecommend")?.value || "",
      improvementSuggestion: document.getElementById("appImprovementSuggestion")?.value.trim() || "",
      reviewText: document.getElementById("appReviewText")?.value.trim() || "",
      reviewType: "app"
    };

    if (
      !payload.overallRating ||
      !payload.serviceUsed ||
      !payload.address ||
      !payload.zipCode ||
      !payload.easeOfUse ||
      !payload.businessMatchQuality ||
      !payload.reviewTitle ||
      !payload.wouldRecommend ||
      !payload.improvementSuggestion ||
      !payload.reviewText
    ) {
      showFormMessage(appReviewMessage, "error", "Please fill in all app review fields.");
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/reviews/app`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        showFormMessage(
          appReviewMessage,
          "error",
          data.message || "Could not submit app review."
        );
        return;
      }

      showFormMessage(
        appReviewMessage,
        "success",
        "Your Estimator app review has been submitted successfully."
      );

      appReviewForm.reset();
    } catch (error) {
      console.error("App review submit error:", error);
      showFormMessage(appReviewMessage, "error", "Server not reachable.");
    }
  });
}