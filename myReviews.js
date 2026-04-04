// ===============================
// USER DROPDOWN + NAME
// ===============================
const userButton = document.getElementById("userButton");
const userMenu = document.getElementById("userMenu");
const logoutBtn = document.getElementById("logoutBtn");
const userName = document.getElementById("userName");

const savedCustomer = JSON.parse(localStorage.getItem("estimatorCustomerAuth"));
const apiBaseUrl = "http://localhost:5000";

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
// PAGE ELEMENTS
// ===============================
const reviewPageMessage = document.getElementById("reviewPageMessage");
const businessReviewsContainer = document.getElementById("businessReviewsContainer");
const appReviewsContainer = document.getElementById("appReviewsContainer");

const businessReviewCount = document.getElementById("businessReviewCount");
const appReviewCount = document.getElementById("appReviewCount");
const totalReviewCount = document.getElementById("totalReviewCount");

const showBusinessReviewsBtn = document.getElementById("showBusinessReviewsBtn");
const showAppReviewsBtn = document.getElementById("showAppReviewsBtn");

// ===============================
// HELPERS
// ===============================
function showPageMessage(type, text) {
  if (!reviewPageMessage) return;
  reviewPageMessage.className = "pageMessage " + type;
  reviewPageMessage.textContent = text;
}

function setCounts(businessCount, appCount) {
  if (businessReviewCount) {
    businessReviewCount.textContent = businessCount;
  }

  if (appReviewCount) {
    appReviewCount.textContent = appCount;
  }

  if (totalReviewCount) {
    totalReviewCount.textContent = businessCount + appCount;
  }
}

function formatDate(dateValue) {
  if (!dateValue) return "-";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;

  return date.toLocaleDateString();
}

function createField(label, value) {
  return `
    <div class="reviewField">
      <span class="reviewFieldLabel">${label}</span>
      <div class="reviewFieldValue">${value || "-"}</div>
    </div>
  `;
}

function renderBusinessReviews(reviews) {
  if (!businessReviewsContainer) return;

  if (!reviews || reviews.length === 0) {
    businessReviewsContainer.innerHTML = `
      <div class="emptyState">
        <h3>No business reviews yet</h3>
        <p>You have not submitted any business reviews yet.</p>
      </div>
    `;
    return;
  }

  businessReviewsContainer.innerHTML = reviews.map(function (review) {
    return `
      <div class="reviewCard">
        <div class="reviewCardTop">
          <div class="reviewCardTitleWrap">
            <h3>${review.review_title}</h3>
            <div class="reviewCardMeta">
              ${review.business_name} • Submitted on ${formatDate(review.created_at)}
            </div>
          </div>
          <div class="reviewBadge">Business Review</div>
        </div>

        <div class="reviewGrid">
          ${createField("Business Name", review.business_name)}
          ${createField("Business Zip", review.business_zip)}
          ${createField("Service Used", review.service_used)}
          ${createField("Overall Rating", review.overall_rating + " / 5")}
          ${createField("Value for Money", review.value_for_money + " / 5")}
          ${createField("Would Recommend", review.would_recommend)}
          ${createField("Service Date", formatDate(review.service_date))}
          ${createField("Service State", review.service_state)}
          ${createField("Service Location", review.service_location)}
        </div>

        <div class="reviewTextBlock">
          <h4>Your Review</h4>
          <p>${review.review_text}</p>
        </div>
      </div>
    `;
  }).join("");
}

function renderAppReviews(reviews) {
  if (!appReviewsContainer) return;

  if (!reviews || reviews.length === 0) {
    appReviewsContainer.innerHTML = `
      <div class="emptyState">
        <h3>No Estimator reviews yet</h3>
        <p>You have not submitted any Estimator app reviews yet.</p>
      </div>
    `;
    return;
  }

  appReviewsContainer.innerHTML = reviews.map(function (review) {
    return `
      <div class="reviewCard">
        <div class="reviewCardTop">
          <div class="reviewCardTitleWrap">
            <h3>${review.review_title}</h3>
            <div class="reviewCardMeta">
              Estimator App • Submitted on ${formatDate(review.created_at)}
            </div>
          </div>
          <div class="reviewBadge">Estimator Review</div>
        </div>

        <div class="reviewGrid">
          ${createField("Service Used", review.service_used)}
          ${createField("Overall Rating", review.overall_rating + " / 5")}
          ${createField("Ease of Use", review.ease_of_use + " / 5")}
          ${createField("Business Match Quality", review.business_match_quality + " / 5")}
          ${createField("Would Recommend", review.would_recommend)}
          ${createField("Zip Code", review.zip_code)}
          ${createField("Address", review.address)}
          ${createField("Improvement Suggestion", review.improvement_suggestion)}
        </div>

        <div class="reviewTextBlock">
          <h4>Your Review</h4>
          <p>${review.review_text}</p>
        </div>
      </div>
    `;
  }).join("");
}

function showBusinessTab() {
  if (businessReviewsContainer) {
    businessReviewsContainer.classList.remove("hidden");
  }

  if (appReviewsContainer) {
    appReviewsContainer.classList.add("hidden");
  }

  if (showBusinessReviewsBtn) {
    showBusinessReviewsBtn.classList.add("active");
  }

  if (showAppReviewsBtn) {
    showAppReviewsBtn.classList.remove("active");
  }
}

function showAppTab() {
  if (appReviewsContainer) {
    appReviewsContainer.classList.remove("hidden");
  }

  if (businessReviewsContainer) {
    businessReviewsContainer.classList.add("hidden");
  }

  if (showAppReviewsBtn) {
    showAppReviewsBtn.classList.add("active");
  }

  if (showBusinessReviewsBtn) {
    showBusinessReviewsBtn.classList.remove("active");
  }
}

// ===============================
// LOAD REVIEWS
// ===============================
async function loadMyReviews() {
  try {
    showPageMessage("success", "Loading your reviews...");

    const customerId = savedCustomer?.customerId || savedCustomer?.id;

    if (!customerId) {
      showPageMessage("error", "Customer ID not found. Please log in again.");
      return;
    }

    const [businessResponse, appResponse] = await Promise.all([
      fetch(`${apiBaseUrl}/api/reviews/business/customer/${customerId}`),
      fetch(`${apiBaseUrl}/api/reviews/app/customer/${customerId}`)
    ]);

    const businessData = await businessResponse.json();
    const appData = await appResponse.json();

    if (!businessResponse.ok || !businessData.success) {
      throw new Error(businessData.message || "Failed to load business reviews.");
    }

    if (!appResponse.ok || !appData.success) {
      throw new Error(appData.message || "Failed to load app reviews.");
    }

    const businessReviews = businessData.reviews || [];
    const appReviews = appData.reviews || [];

    renderBusinessReviews(businessReviews);
    renderAppReviews(appReviews);
    setCounts(businessReviews.length, appReviews.length);

    showPageMessage("success", "Your reviews were loaded successfully.");
  } catch (error) {
    console.error("Load my reviews error:", error);
    showPageMessage("error", "Could not load your reviews. Please try again.");
  }
}

// ===============================
// TAB EVENTS
// ===============================
if (showBusinessReviewsBtn) {
  showBusinessReviewsBtn.addEventListener("click", showBusinessTab);
}

if (showAppReviewsBtn) {
  showAppReviewsBtn.addEventListener("click", showAppTab);
}

// ===============================
// INIT
// ===============================
window.addEventListener("DOMContentLoaded", function () {
  loadMyReviews();
});