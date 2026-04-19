document.addEventListener("DOMContentLoaded", function () {
  const API_BASE =
    window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://estimator-app-icmp.onrender.com";

  const userMenu = document.getElementById("userMenu");
  const userButton = document.getElementById("userButton");
  const logoutBtn = document.getElementById("logoutBtn");
  const managerName = document.getElementById("managerName");
  const menuButton = document.getElementById("menuButton");
  const menuArea = document.getElementById("menuArea");

  const reviewCount = document.getElementById("reviewCount");
  const averageRating = document.getElementById("averageRating");
  const reviewsSummaryText = document.getElementById("reviewsSummaryText");
  const businessReviewsList = document.getElementById("businessReviewsList");

  let savedBusiness = null;

  try {
    const rawBusiness = localStorage.getItem("estimatorBusinessAuth");
    if (rawBusiness) {
      savedBusiness = JSON.parse(rawBusiness);
      if (savedBusiness && savedBusiness.business) {
        savedBusiness = savedBusiness.business;
      }
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

  loadBusinessReviews();

  async function loadBusinessReviews() {
    try {
      const businessId = savedBusiness.id || savedBusiness.businessId;

      if (!businessId) {
        renderErrorState("Business ID not found in login session.");
        return;
      }

      const response = await fetch(
        `${API_BASE}/api/reviews/business/${encodeURIComponent(businessId)}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load reviews.");
      }

      const reviews = Array.isArray(data.reviews) ? data.reviews : [];
      const totalReviews = reviews.length;
      const avgRating = calculateAverageRating(reviews);

      if (reviewCount) {
        reviewCount.textContent = totalReviews;
      }

      if (averageRating) {
        averageRating.textContent = `${avgRating.toFixed(1)} ★`;
      }

      if (reviewsSummaryText) {
        reviewsSummaryText.textContent = `${totalReviews} Review${totalReviews === 1 ? "" : "s"}`;
      }

      renderReviews(reviews);
      attachReplyEvents();
    } catch (error) {
      console.error("Load business reviews error:", error);
      renderErrorState("Unable to load reviews.");
    }
  }

  function renderReviews(reviews) {
    if (!reviews.length) {
      businessReviewsList.innerHTML = `<div class="emptyState">No reviews yet for this business.</div>`;
      return;
    }

    businessReviewsList.innerHTML = reviews.map((review) => {
      const rating = Number(review.overall_rating || 0);
      const safeRating = Math.max(0, Math.min(5, rating));
      const stars = "★".repeat(safeRating) + "☆".repeat(5 - safeRating);

      return `
        <div class="reviewCard" data-review-id="${escapeHtml(review.id)}">
          <div class="reviewCardTop">
            <div class="reviewTitleWrap">
              <h3>${escapeHtml(review.review_title || "Customer Review")}</h3>
              <p class="reviewMetaLine">
                By ${escapeHtml(review.customer_name || "Customer")} · ${escapeHtml(formatDate(review.created_at))}
              </p>
            </div>

            <div class="reviewStars">${escapeHtml(stars)}</div>
          </div>

          <div class="reviewGrid">
            <p><strong>Service Used:</strong> ${escapeHtml(review.service_used || "Not provided")}</p>
            <p><strong>Service Date:</strong> ${escapeHtml(formatDate(review.service_date))}</p>
            <p><strong>Location:</strong> ${escapeHtml(review.service_location || "Not provided")}</p>
            <p><strong>State:</strong> ${escapeHtml(review.service_state || "Not provided")}</p>
            <p><strong>Would Recommend:</strong> ${escapeHtml(review.would_recommend || "Not provided")}</p>
            <p><strong>Value for Money:</strong> ${escapeHtml(String(review.value_for_money || "Not provided"))}</p>
          </div>

          <div class="reviewBody">
            <strong>Review:</strong> ${escapeHtml(review.review_text || "No review text provided.")}
          </div>

          ${renderReplySection(review)}
        </div>
      `;
    }).join("");
  }

  function renderReplySection(review) {
    const hasReply = review.business_reply_text && String(review.business_reply_text).trim() !== "";

    if (hasReply) {
      return `
        <div class="replySection">
          <div class="businessReplyCard">
            <div class="businessReplyHeader">
              <p class="businessReplyTitle">Business Reply</p>
              <p class="businessReplyMeta">
                ${escapeHtml(review.business_replied_by || "Business Owner")} · ${escapeHtml(formatDate(review.business_replied_at))}
              </p>
            </div>

            <p class="businessReplyText">${escapeHtml(review.business_reply_text)}</p>

            <div class="replyActions" style="margin-top: 12px;">
              <button
                type="button"
                class="replyEditButton replyButton openReplyEditorButton"
                data-review-id="${escapeHtml(review.id)}"
                data-existing-reply="${escapeAttribute(review.business_reply_text)}"
              >
                Edit Reply
              </button>
            </div>

            <div class="replyFormContainer"></div>
          </div>
        </div>
      `;
    }

    return `
      <div class="replySection">
        <button
          type="button"
          class="replyButton openReplyEditorButton"
          data-review-id="${escapeHtml(review.id)}"
          data-existing-reply=""
        >
          Reply
        </button>

        <div class="replyFormContainer"></div>
      </div>
    `;
  }

  function attachReplyEvents() {
    const openButtons = document.querySelectorAll(".openReplyEditorButton");

    openButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const reviewCard = button.closest(".reviewCard");
        const replySection = button.closest(".replySection");
        const existingReply = button.getAttribute("data-existing-reply") || "";

        closeAllReplyEditors();

        const existingReplyCard = replySection.querySelector(".businessReplyCard");
        if (existingReplyCard) {
          existingReplyCard.style.display = "none";
        }

        const container = replySection.querySelector(".replyFormContainer");

        container.innerHTML = `
          <div class="replyForm">
            <textarea class="replyTextarea" placeholder="Write your reply here..."></textarea>
            <div class="replyActions">
              <button type="button" class="replySubmitButton">Post Reply</button>
              <button type="button" class="replyCancelButton">Cancel</button>
            </div>
            <div class="replyStatusText" style="display:none;"></div>
          </div>
        `;

        if (!existingReplyCard) {
          button.style.display = "none";
        }

        const textarea = container.querySelector(".replyTextarea");
        const submitBtn = container.querySelector(".replySubmitButton");
        const cancelBtn = container.querySelector(".replyCancelButton");
        const statusText = container.querySelector(".replyStatusText");

        textarea.value = existingReply;
        textarea.focus();

        submitBtn.addEventListener("click", async function () {
          const replyText = textarea.value.trim();
          const reviewId = reviewCard.getAttribute("data-review-id");
          const businessId = savedBusiness.id || savedBusiness.businessId;
          const repliedBy =
            savedBusiness.ownerName || savedBusiness.businessName || "Business Owner";

          if (!replyText) {
            showReplyStatus(statusText, "error", "Please enter a reply.");
            return;
          }

          submitBtn.disabled = true;
          submitBtn.textContent = "Posting...";

          try {
            const response = await fetch(
              `${API_BASE}/api/reviews/${encodeURIComponent(reviewId)}/reply`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  businessId,
                  replyText,
                  repliedBy
                })
              }
            );

            const contentType = response.headers.get("content-type") || "";
            let data;

            if (contentType.includes("application/json")) {
              data = await response.json();
            } else {
              const text = await response.text();
              console.error("Non-JSON response:", text);
              throw new Error("Server did not return JSON. Check the backend route.");
            }

            if (!response.ok || !data.success) {
              throw new Error(data.message || "Failed to post reply.");
            }

            showReplyStatus(statusText, "success", data.message || "Reply posted successfully.");

            setTimeout(function () {
              loadBusinessReviews();
            }, 500);
          } catch (error) {
            console.error("Post reply error:", error);
            showReplyStatus(statusText, "error", error.message || "Unable to post reply.");
            submitBtn.disabled = false;
            submitBtn.textContent = "Post Reply";
          }
        });

        cancelBtn.addEventListener("click", function () {
          container.innerHTML = "";

          if (existingReplyCard) {
            existingReplyCard.style.display = "";
          } else {
            button.style.display = "";
          }
        });
      });
    });
  }

  function closeAllReplyEditors() {
    document.querySelectorAll(".replyFormContainer").forEach((container) => {
      container.innerHTML = "";
    });

    document.querySelectorAll(".openReplyEditorButton").forEach((button) => {
      button.style.display = "";
    });

    document.querySelectorAll(".businessReplyCard").forEach((card) => {
      card.style.display = "";
    });
  }

  function showReplyStatus(element, type, message) {
    if (!element) return;
    element.style.display = "block";
    element.className = `replyStatusText ${type}`;
    element.textContent = message;
  }

  function calculateAverageRating(reviews) {
    if (!reviews.length) return 0;

    const total = reviews.reduce((sum, review) => {
      return sum + Number(review.overall_rating || 0);
    }, 0);

    return total / reviews.length;
  }

  function renderErrorState(message) {
    if (reviewCount) reviewCount.textContent = "0";
    if (averageRating) averageRating.textContent = "0.0 ★";
    if (reviewsSummaryText) reviewsSummaryText.textContent = "0 Reviews";
    if (businessReviewsList) {
      businessReviewsList.innerHTML = `<div class="emptyState">${escapeHtml(message)}</div>`;
    }
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
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
});