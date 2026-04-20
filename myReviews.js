const API_BASE_URL =
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "localhost"
    ? "http://127.0.0.1:5000"
    : "https://estimator-app-icmp.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  setupHeaderMenu();
  setupUserDropdown();
  loadUserName();
  setupReviewTabs();
  loadMyReviews();
});

function setupHeaderMenu() {
  const menuButton = document.getElementById("menuButton");
  const menuArea = document.getElementById("menuArea");
  const servicesMenu = document.getElementById("servicesMenu");
  const servicesLink = document.getElementById("servicesLink");
  const megaDropdown = document.getElementById("megaDropdown");
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
      e.stopPropagation();
      servicesMenu.classList.toggle("open");
      servicesMenu.classList.toggle("active");
    });

    if (megaDropdown) {
      megaDropdown.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }

    document.addEventListener("click", (e) => {
      if (!servicesMenu.contains(e.target)) {
        servicesMenu.classList.remove("open");
        servicesMenu.classList.remove("active");
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
  const userDropdown = document.getElementById("userDropdown");
  const logoutBtn = document.getElementById("logoutBtn");

  if (userMenu && userButton) {
    userButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      userMenu.classList.toggle("open");
      userMenu.classList.toggle("active");

      if (userDropdown) {
        userDropdown.classList.toggle("open");
        userDropdown.classList.toggle("active");
      }
    });

    if (userDropdown) {
      userDropdown.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }

    document.addEventListener("click", (e) => {
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
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("estimatorCustomerAuth");
      localStorage.removeItem("user");
      window.location.href = "home.html";
    });
  }
}

function getLoggedInCustomer() {
  try {
    return (
      JSON.parse(localStorage.getItem("estimatorCustomerAuth")) ||
      JSON.parse(localStorage.getItem("user"))
    );
  } catch (error) {
    console.error("Error reading customer session:", error);
    return null;
  }
}

function loadUserName() {
  const userNameEl = document.getElementById("userName");
  const savedCustomer = getLoggedInCustomer();

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

function setupReviewTabs() {
  const showBusinessReviewsBtn = document.getElementById("showBusinessReviewsBtn");
  const showAppReviewsBtn = document.getElementById("showAppReviewsBtn");
  const businessReviewsContainer = document.getElementById("businessReviewsContainer");
  const appReviewsContainer = document.getElementById("appReviewsContainer");

  if (!showBusinessReviewsBtn || !showAppReviewsBtn || !businessReviewsContainer || !appReviewsContainer) {
    return;
  }

  showBusinessReviewsBtn.addEventListener("click", () => {
    showBusinessReviewsBtn.classList.add("active");
    showAppReviewsBtn.classList.remove("active");
    businessReviewsContainer.classList.remove("hidden");
    appReviewsContainer.classList.add("hidden");
  });

  showAppReviewsBtn.addEventListener("click", () => {
    showAppReviewsBtn.classList.add("active");
    showBusinessReviewsBtn.classList.remove("active");
    appReviewsContainer.classList.remove("hidden");
    businessReviewsContainer.classList.add("hidden");
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(value) {
  if (!value) return "Not provided";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not provided";
  return date.toLocaleDateString();
}

async function parseApiResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const rawText = await response.text();

  if (!contentType.includes("application/json")) {
    if (rawText.trim().startsWith("<!DOCTYPE") || rawText.trim().startsWith("<html")) {
      throw new Error("Server returned HTML instead of JSON.");
    }
    throw new Error(rawText || "Server did not return valid JSON.");
  }

  return JSON.parse(rawText);
}

async function loadMyReviews() {
  const customer = getLoggedInCustomer();
  const businessReviewsContainer = document.getElementById("businessReviewsContainer");
  const appReviewsContainer = document.getElementById("appReviewsContainer");
  const pageMessage = document.getElementById("reviewPageMessage");
  const businessReviewCount = document.getElementById("businessReviewCount");
  const appReviewCount = document.getElementById("appReviewCount");
  const totalReviewCount = document.getElementById("totalReviewCount");

  if (!customer) {
    window.location.href = "customerLogin.html";
    return;
  }

  const customerId = customer.id || customer.customer_id || customer.customerId || "";

  if (!customerId) {
    if (pageMessage) {
      pageMessage.className = "pageMessage error";
      pageMessage.textContent = "Customer session not found.";
    }
    return;
  }

  try {
    if (pageMessage) {
      pageMessage.className = "pageMessage";
      pageMessage.textContent = "Loading your reviews...";
    }

    const [businessResponse, appResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/api/reviews/business/customer/${encodeURIComponent(customerId)}`),
      fetch(`${API_BASE_URL}/api/reviews/app/customer/${encodeURIComponent(customerId)}`)
    ]);

    const businessData = await parseApiResponse(businessResponse);
    const appData = await parseApiResponse(appResponse);

    if (!businessResponse.ok) {
      throw new Error(businessData.message || "Could not load business reviews.");
    }

    if (!appResponse.ok) {
      throw new Error(appData.message || "Could not load app reviews.");
    }

    const businessReviews = Array.isArray(businessData.reviews) ? businessData.reviews : [];
    const appReviews = Array.isArray(appData.reviews) ? appData.reviews : [];

    if (businessReviewCount) businessReviewCount.textContent = businessReviews.length;
    if (appReviewCount) appReviewCount.textContent = appReviews.length;
    if (totalReviewCount) totalReviewCount.textContent = businessReviews.length + appReviews.length;

    renderBusinessReviews(businessReviews);
    renderAppReviews(appReviews);

    if (pageMessage) {
      pageMessage.className = "pageMessage success";
      pageMessage.textContent = "Your reviews loaded successfully.";
    }
  } catch (error) {
    console.error("Load my reviews error:", error);

    if (businessReviewCount) businessReviewCount.textContent = "0";
    if (appReviewCount) appReviewCount.textContent = "0";
    if (totalReviewCount) totalReviewCount.textContent = "0";

    if (businessReviewsContainer) {
      businessReviewsContainer.innerHTML = `
        <div class="emptyState">
          <h3>Could not load business reviews</h3>
          <p>${escapeHtml(error.message || "Something went wrong.")}</p>
        </div>
      `;
    }

    if (appReviewsContainer) {
      appReviewsContainer.innerHTML = `
        <div class="emptyState">
          <h3>Could not load app reviews</h3>
          <p>${escapeHtml(error.message || "Something went wrong.")}</p>
        </div>
      `;
    }

    if (pageMessage) {
      pageMessage.className = "pageMessage error";
      pageMessage.textContent = error.message || "Could not load your reviews.";
    }
  }
}

function renderBusinessReviews(reviews) {
  const container = document.getElementById("businessReviewsContainer");
  if (!container) return;

  if (!reviews.length) {
    container.innerHTML = `
      <div class="emptyState">
        <h3>No business reviews yet</h3>
        <p>You have not submitted any business reviews yet.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = reviews.map((review) => {
    const rating = Number(review.overall_rating ?? review.overallRating ?? 0);
    const safeRating = Math.max(0, Math.min(5, rating));
    const stars = "★".repeat(safeRating) + "☆".repeat(5 - safeRating);

    const reviewTitle = review.review_title ?? review.reviewTitle ?? "Business Review";
    const businessName = review.business_name ?? review.businessName ?? "Business";
    const createdAt = review.created_at ?? review.createdAt ?? "";

    const serviceUsed = review.service_used ?? review.serviceUsed ?? "Not provided";
    const serviceDate = review.service_date ?? review.serviceDate ?? "";
    const serviceLocation = review.service_location ?? review.serviceLocation ?? "Not provided";
    const serviceState = review.service_state ?? review.serviceState ?? "Not provided";
    const wouldRecommend = review.would_recommend ?? review.wouldRecommend ?? "Not provided";
    const valueForMoney = review.value_for_money ?? review.valueForMoney ?? "Not provided";
    const reviewText = review.review_text ?? review.reviewText ?? "No review text provided.";

    const replyText = review.business_reply_text ?? review.businessReplyText ?? "";
    const repliedAt = review.business_replied_at ?? review.businessRepliedAt ?? "";
    const repliedBy = review.business_replied_by ?? review.businessRepliedBy ?? "Business Owner";
    const hasBusinessReply = String(replyText).trim() !== "";

    return `
      <div class="reviewCard">
        <div class="reviewCardTop">
          <div class="reviewCardTitleWrap">
            <h3>${escapeHtml(reviewTitle)}</h3>
            <p class="reviewCardMeta">
              For ${escapeHtml(businessName)} · ${escapeHtml(formatDate(createdAt))}
            </p>
          </div>

          <div class="reviewBadge">${escapeHtml(stars)}</div>
        </div>

        <div class="reviewGrid">
          <div class="reviewField">
            <span class="reviewFieldLabel">Service Used</span>
            <div class="reviewFieldValue">${escapeHtml(serviceUsed)}</div>
          </div>

          <div class="reviewField">
            <span class="reviewFieldLabel">Service Date</span>
            <div class="reviewFieldValue">${escapeHtml(formatDate(serviceDate))}</div>
          </div>

          <div class="reviewField">
            <span class="reviewFieldLabel">Location</span>
            <div class="reviewFieldValue">${escapeHtml(serviceLocation)}</div>
          </div>

          <div class="reviewField">
            <span class="reviewFieldLabel">State</span>
            <div class="reviewFieldValue">${escapeHtml(serviceState)}</div>
          </div>

          <div class="reviewField">
            <span class="reviewFieldLabel">Would Recommend</span>
            <div class="reviewFieldValue">${escapeHtml(wouldRecommend)}</div>
          </div>

          <div class="reviewField">
            <span class="reviewFieldLabel">Value for Money</span>
            <div class="reviewFieldValue">${escapeHtml(String(valueForMoney))}</div>
          </div>
        </div>

        <div class="reviewTextBlock">
          <h4>Your Review</h4>
          <p>${escapeHtml(reviewText)}</p>
        </div>

        ${hasBusinessReply ? `
          <div class="businessReplyBlock">
            <div class="businessReplyHeader">
              <h4>Business Owner Reply</h4>
              <div class="businessReplyMeta">
                ${escapeHtml(repliedBy)} · ${escapeHtml(formatDate(repliedAt))}
              </div>
            </div>
            <div class="businessReplyText">${escapeHtml(replyText)}</div>
          </div>
        ` : ""}
      </div>
    `;
  }).join("");
}

function renderAppReviews(reviews) {
  const container = document.getElementById("appReviewsContainer");
  if (!container) return;

  if (!reviews.length) {
    container.innerHTML = `
      <div class="emptyState">
        <h3>No Estimator reviews yet</h3>
        <p>You have not submitted any app reviews yet.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = reviews.map((review) => {
    const rating = Number(review.overall_rating ?? review.overallRating ?? 0);
    const safeRating = Math.max(0, Math.min(5, rating));
    const stars = "★".repeat(safeRating) + "☆".repeat(5 - safeRating);

    return `
      <div class="reviewCard">
        <div class="reviewCardTop">
          <div class="reviewCardTitleWrap">
            <h3>${escapeHtml(review.review_title ?? review.reviewTitle ?? "Estimator Review")}</h3>
            <p class="reviewCardMeta">
              Estimator App · ${escapeHtml(formatDate(review.created_at ?? review.createdAt))}
            </p>
          </div>

          <div class="reviewBadge">${escapeHtml(stars)}</div>
        </div>

        <div class="reviewGrid">
          <div class="reviewField">
            <span class="reviewFieldLabel">Service Used</span>
            <div class="reviewFieldValue">${escapeHtml(review.service_used ?? review.serviceUsed ?? "Not provided")}</div>
          </div>

          <div class="reviewField">
            <span class="reviewFieldLabel">Address</span>
            <div class="reviewFieldValue">${escapeHtml(review.address ?? "Not provided")}</div>
          </div>

          <div class="reviewField">
            <span class="reviewFieldLabel">ZIP Code</span>
            <div class="reviewFieldValue">${escapeHtml(review.zip_code ?? review.zipCode ?? "Not provided")}</div>
          </div>

          <div class="reviewField">
            <span class="reviewFieldLabel">Ease of Use</span>
            <div class="reviewFieldValue">${escapeHtml(String(review.ease_of_use ?? review.easeOfUse ?? "Not provided"))}</div>
          </div>

          <div class="reviewField">
            <span class="reviewFieldLabel">Business Match Quality</span>
            <div class="reviewFieldValue">${escapeHtml(String(review.business_match_quality ?? review.businessMatchQuality ?? "Not provided"))}</div>
          </div>

          <div class="reviewField">
            <span class="reviewFieldLabel">Would Recommend</span>
            <div class="reviewFieldValue">${escapeHtml(review.would_recommend ?? review.wouldRecommend ?? "Not provided")}</div>
          </div>
        </div>

        <div class="reviewTextBlock" style="margin-bottom: 14px;">
          <h4>Your Review</h4>
          <p>${escapeHtml(review.review_text ?? review.reviewText ?? "No review text provided.")}</p>
        </div>

        <div class="reviewTextBlock">
          <h4>Improvement Suggestion</h4>
          <p>${escapeHtml(review.improvement_suggestion ?? review.improvementSuggestion ?? "No suggestion provided.")}</p>
        </div>
      </div>
    `;
  }).join("");
}