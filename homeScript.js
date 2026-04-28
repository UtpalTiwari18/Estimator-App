document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "http://localhost:5000";

  const menuButton = document.getElementById("menuButton");
  const menuArea = document.getElementById("menuArea");
  const servicesMenu = document.getElementById("servicesMenu");
  const servicesLink = document.getElementById("servicesLink");

  const megaCategories = document.querySelectorAll(".megaCategory");
  const megaPanels = document.querySelectorAll(".megaPanel");

  const heroSearchForm = document.getElementById("heroSearchForm");
  const keywordInput = document.getElementById("keywordInput");
  const zipInput = document.getElementById("zipInput");
  const suggestionsBox = document.getElementById("suggestionsBox");
  const searchResultsSection = document.getElementById("searchResultsSection");
  const searchResultsList = document.getElementById("searchResultsList");
  const searchResultsText = document.getElementById("searchResultsText");

  const popularServicesTrack = document.getElementById("popularServicesTrack");
  const servicePrevButton = document.getElementById("servicePrevButton");
  const serviceNextButton = document.getElementById("serviceNextButton");
  const serviceDots = document.getElementById("serviceDots");

  const sliderTrack = document.getElementById("sliderTrack");
  const testimonialSlider = document.getElementById("testimonialSlider");
  const prevButton = document.getElementById("prevButton");
  const nextButton = document.getElementById("nextButton");
  const sliderDots = document.getElementById("sliderDots");

  let serviceIndex = 0;
  let currentSlide = 0;
  let testimonialCards = [];
  let autoplayInterval = null;
  const autoplayDelay = 4000;

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function showPanel(panelId) {
    megaPanels.forEach((panel) => panel.classList.remove("isVisible"));
    megaCategories.forEach((category) => category.classList.remove("isActive"));

    const activePanel = document.getElementById(panelId);
    const activeCategory = document.querySelector(`.megaCategory[data-panel="${panelId}"]`);

    if (activePanel) activePanel.classList.add("isVisible");
    if (activeCategory) activeCategory.classList.add("isActive");
  }

  megaCategories.forEach((category) => {
    category.addEventListener("mouseenter", () => {
      const panelId = category.getAttribute("data-panel");
      showPanel(panelId);
    });

    category.addEventListener("click", () => {
      const panelId = category.getAttribute("data-panel");
      showPanel(panelId);
    });
  });

  if (menuButton && menuArea) {
    menuButton.addEventListener("click", () => {
      menuArea.classList.toggle("isOpen");
      menuArea.classList.toggle("active");
    });
  }

  if (servicesLink && servicesMenu) {
    servicesLink.addEventListener("click", (event) => {
      const isMobile = window.matchMedia("(max-width: 900px)").matches;
      if (!isMobile) return;

      event.preventDefault();
      servicesMenu.classList.toggle("isOpen");
      servicesMenu.classList.toggle("open");
    });
  }

  async function loadCustomerCount() {
    try {
      const res = await fetch(`${API_BASE}/api/customers/count`);
      const data = await res.json();

      if (!data.success) return;

      const numberEl = document.getElementById("customerCountNumber");
      if (!numberEl) return;

      numberEl.textContent = data.total;
      numberEl.style.color = "#c40000";
      numberEl.style.fontWeight = "800";
    } catch (error) {
      console.error("Failed to load customer count:", error);
    }
  }

  async function fillZipCodeFromLocation() {
    if (!zipInput) return;
    if (!("geolocation" in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      async function (position) {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`;

          const response = await fetch(url, {
            headers: { Accept: "application/json" }
          });

          if (!response.ok) {
            throw new Error("Failed to fetch address data.");
          }

          const data = await response.json();
          const postcode = data?.address?.postcode;

          if (postcode) {
            const zipCode = postcode.match(/\d{5}/)?.[0] || "";
            if (zipCode) {
              zipInput.value = zipCode;
            }
          }
        } catch (error) {
          console.error("Error getting ZIP code from location:", error);
        }
      },
      function (error) {
        console.log("Location permission denied or unavailable:", error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }

  const serviceSuggestions = [
    "Oil Change",
    "Brake Repair",
    "Brake Service",
    "Battery Replacement",
    "Tire Replacement",
    "Tire Rotation",
    "Wheel Alignment",
    "Engine Diagnostics",
    "Car Wash",
    "Full Detailing",
    "Interior Detailing",
    "Seat Cleaning",
    "Carpet Shampoo",
    "Dashboard Restoration",
    "Odor Removal",
    "AC Sanitization",
    "Paint Correction",
    "Ceramic Coating",
    "Wax & Polish",
    "Scratch Removal",
    "Headlight Restoration",
    "Windshield Repair",
    "Suspension Repair",
    "Transmission Service",
    "Cooling System Repair",
    "ECU Diagnostics",
    "Sensor Replacement",
    "Wiring Repair",
    "Alternator Service",
    "Starter Repair",
    "Lighting Installation",
    "Rim Repair",
    "Audio Installation",
    "Reverse Camera Setup",
    "Window Tinting",
    "Performance Tuning",
    "Body Kit Installation"
  ];

  function showSuggestions(matches) {
    if (!suggestionsBox) return;

    suggestionsBox.innerHTML = "";

    if (!matches.length) {
      suggestionsBox.style.display = "none";
      return;
    }

    matches.forEach((item) => {
      const div = document.createElement("div");
      div.className = "suggestionItem";
      div.textContent = item;

      div.addEventListener("click", function () {
        if (keywordInput) keywordInput.value = item;
        suggestionsBox.innerHTML = "";
        suggestionsBox.style.display = "none";
      });

      suggestionsBox.appendChild(div);
    });

    suggestionsBox.style.display = "block";
  }

  if (keywordInput) {
    keywordInput.addEventListener("input", function () {
      const value = this.value.trim().toLowerCase();

      if (!value) {
        if (suggestionsBox) {
          suggestionsBox.innerHTML = "";
          suggestionsBox.style.display = "none";
        }
        return;
      }

      const matches = serviceSuggestions
        .filter((service) => service.toLowerCase().includes(value))
        .slice(0, 8);

      showSuggestions(matches);
    });
  }

  document.addEventListener("click", function (e) {
    if (!suggestionsBox || !keywordInput) return;

    if (!suggestionsBox.contains(e.target) && e.target !== keywordInput) {
      suggestionsBox.style.display = "none";
    }
  });

  function renderBusinesses(businesses, keyword, zip) {
    if (!searchResultsSection || !searchResultsList || !searchResultsText) return;

    searchResultsSection.classList.add("showResults");
    searchResultsSection.style.display = "block";
    searchResultsList.innerHTML = "";

    const zipText = zip ? ` in ${zip}` : "";

    if (!businesses || !businesses.length) {
      searchResultsText.textContent = `No businesses found for "${keyword}"${zipText}.`;
      searchResultsList.innerHTML = `
        <div class="noResultsMessage">
          No matching businesses were found. Try another service${zip ? " or another zip code" : ""}.
        </div>
      `;

      searchResultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    searchResultsText.textContent = `${businesses.length} business(es) found for "${keyword}"${zipText}.`;

    businesses.forEach((business) => {
      const card = document.createElement("div");
      card.className = "businessCard";

      card.innerHTML = `
        <h3>${escapeHtml(business.businessName || "Business Name")}</h3>

        <div class="businessMeta">
          ${escapeHtml(business.businessType || "Automotive Service")} •
          ${escapeHtml(business.city || "")}, ${escapeHtml(business.state || "")} ${escapeHtml(business.zip || "")}
        </div>

        <div class="businessMeta">
          ${escapeHtml(business.phone || "No phone")}
          ${business.website ? ` • <a href="${escapeHtml(business.website)}" target="_blank" rel="noopener noreferrer">Website</a>` : ""}
        </div>

        <div class="businessMeta">
          ${business.email || business.businessEmail ? `Email: ${escapeHtml(business.email || business.businessEmail)}` : "Email: Not available"}
        </div>

        <div class="businessServices">
          <strong>Services:</strong> ${escapeHtml(business.services || "Not listed")}
        </div>

        <div class="businessActions guestActions">
          <button class="saveBtn guestDisabledBtn" type="button" disabled aria-disabled="true">Save</button>
          <button class="compareBtn guestDisabledBtn" type="button" disabled aria-disabled="true">Compare</button>
          <button class="messageBtn guestDisabledBtn" type="button" disabled aria-disabled="true">Message</button>
        </div>

        <button class="guestExploreText guestSignupBtn" type="button">
          Sign Up to explore more
        </button>
      `;

      searchResultsList.appendChild(card);
    });

    searchResultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.addEventListener("click", function (e) {
    const signupButton = e.target.closest(".guestSignupBtn");
    if (!signupButton) return;

    window.location.href = "customerSignUp.html";
  });

  if (heroSearchForm) {
    heroSearchForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const keyword = keywordInput?.value.trim() || "";
      const zip = zipInput?.value.trim() || "";

      if (!keyword) {
        alert("Please enter a service.");
        return;
      }

      if (zip && !/^\d{5}$/.test(zip)) {
        alert("Zip must be 5 digits or leave it blank.");
        return;
      }

      try {
        let url = `${API_BASE}/api/search-businesses?keyword=${encodeURIComponent(keyword)}`;

        if (zip) {
          url += `&zip=${encodeURIComponent(zip)}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (data.success) {
          renderBusinesses(data.businesses, keyword, zip);
        } else {
          alert(data.message || "Search failed.");
        }
      } catch (err) {
        console.error("Search error:", err);
        alert("Server error while searching businesses.");
      }
    });
  }

  function getServiceCardsPerView() {
    if (window.innerWidth <= 640) return 1;
    if (window.innerWidth <= 992) return 2;
    return 3;
  }

  function updateServiceSlider() {
    if (!popularServicesTrack) return;

    const cards = popularServicesTrack.querySelectorAll(".popularServiceCard");
    if (!cards.length) return;

    const perView = getServiceCardsPerView();
    const maxIndex = Math.max(0, cards.length - perView);

    if (serviceIndex > maxIndex) {
      serviceIndex = maxIndex;
    }

    const gap = parseFloat(window.getComputedStyle(popularServicesTrack).gap) || 22;
    const cardWidth = cards[0].getBoundingClientRect().width;
    const moveX = serviceIndex * (cardWidth + gap);

    popularServicesTrack.style.transform = `translateX(-${moveX}px)`;

    if (serviceDots) {
      serviceDots.innerHTML = "";

      for (let i = 0; i <= maxIndex; i++) {
        const dot = document.createElement("button");
        dot.type = "button";

        if (i === serviceIndex) {
          dot.classList.add("active");
        }

        dot.addEventListener("click", function () {
          serviceIndex = i;
          updateServiceSlider();
        });

        serviceDots.appendChild(dot);
      }
    }
  }

  if (servicePrevButton) {
    servicePrevButton.addEventListener("click", function () {
      serviceIndex = Math.max(0, serviceIndex - 1);
      updateServiceSlider();
    });
  }

  if (serviceNextButton) {
    serviceNextButton.addEventListener("click", function () {
      const cards = popularServicesTrack?.querySelectorAll(".popularServiceCard") || [];
      const perView = getServiceCardsPerView();
      const maxIndex = Math.max(0, cards.length - perView);

      serviceIndex = Math.min(maxIndex, serviceIndex + 1);
      updateServiceSlider();
    });
  }

  function getStars(rating) {
    const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));
    return "★".repeat(safeRating) + "☆".repeat(5 - safeRating);
  }

  function getInitial(name) {
    return String(name || "U").trim().charAt(0).toUpperCase() || "U";
  }

  function updateSliderPosition() {
    if (!sliderTrack || testimonialCards.length === 0) return;

    sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    updateDots();
  }

  function updateDots() {
    if (!sliderDots) return;

    const dots = sliderDots.querySelectorAll(".dotButton");

    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentSlide);
    });
  }

  function createDots() {
    if (!sliderDots) return;

    sliderDots.innerHTML = "";

    testimonialCards.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = `dotButton ${index === currentSlide ? "active" : ""}`;
      dot.setAttribute("aria-label", `Go to testimonial ${index + 1}`);

      dot.addEventListener("click", () => {
        currentSlide = index;
        updateSliderPosition();
        restartAutoplay();
      });

      sliderDots.appendChild(dot);
    });
  }

  function goToNextSlide() {
    if (!testimonialCards.length) return;

    currentSlide = (currentSlide + 1) % testimonialCards.length;
    updateSliderPosition();
  }

  function goToPrevSlide() {
    if (!testimonialCards.length) return;

    currentSlide = (currentSlide - 1 + testimonialCards.length) % testimonialCards.length;
    updateSliderPosition();
  }

  function startAutoplay() {
    stopAutoplay();

    if (testimonialCards.length <= 1) return;

    autoplayInterval = setInterval(() => {
      goToNextSlide();
    }, autoplayDelay);
  }

  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  function setupTestimonialSlider() {
    testimonialCards = Array.from(document.querySelectorAll(".testimonialCard"));
    currentSlide = 0;
    createDots();
    updateSliderPosition();
    startAutoplay();
  }

  if (prevButton) {
    prevButton.addEventListener("click", () => {
      goToPrevSlide();
      restartAutoplay();
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      goToNextSlide();
      restartAutoplay();
    });
  }

  if (testimonialSlider) {
    testimonialSlider.addEventListener("mouseenter", stopAutoplay);
    testimonialSlider.addEventListener("mouseleave", startAutoplay);
  }

  function renderTestimonials(testimonials) {
    if (!sliderTrack) return;

    sliderTrack.innerHTML = "";

    if (!testimonials || !testimonials.length) {
      sliderTrack.innerHTML = `
        <div class="testimonialCard">
          <div class="cardTop">
            <div class="starRating">★★★★★</div>
            <span class="verifyBadge">Verified</span>
          </div>

          <p class="testimonialQuote">
            No testimonials yet. Be the first to leave a review on Estimator.
          </p>

          <div class="userInfo">
            <div class="userAvatar">E</div>
            <div>
              <div class="userName">Estimator User</div>
              <div class="userMeta">Community • First Review</div>
            </div>
          </div>
        </div>
      `;

      setupTestimonialSlider();
      return;
    }

    testimonials.forEach((item) => {
      const customerName = item.customer_name || "Estimator User";
      const reviewText = item.review_text || "Great experience using Estimator.";
      const serviceUsed = item.service_used || "Service";
      const zipCode = item.zip_code || "Local User";
      const rating = Number(item.overall_rating) || 5;

      const card = document.createElement("div");
      card.className = "testimonialCard";

      card.innerHTML = `
        <div class="cardTop">
          <div class="starRating">${getStars(rating)}</div>
          <span class="verifyBadge">Verified</span>
        </div>

        <p class="testimonialQuote">
          ${escapeHtml(reviewText)}
        </p>

        <div class="userInfo">
          <div class="userAvatar">${escapeHtml(getInitial(customerName))}</div>
          <div>
            <div class="userName">${escapeHtml(customerName)}</div>
            <div class="userMeta">
              ${escapeHtml(zipCode)} • ${escapeHtml(serviceUsed)}
            </div>
          </div>
        </div>
      `;

      sliderTrack.appendChild(card);
    });

    setupTestimonialSlider();
  }

  async function loadTestimonials() {
    try {
      const res = await fetch(`${API_BASE}/api/home-testimonials`);
      const data = await res.json();

      if (!data.success) {
        renderTestimonials([]);
        return;
      }

      renderTestimonials(data.testimonials || []);
    } catch (error) {
      console.error("Failed to load testimonials:", error);
      renderTestimonials([]);
    }
  }

  loadCustomerCount();
  fillZipCodeFromLocation();
  updateServiceSlider();
  loadTestimonials();

  window.addEventListener("resize", function () {
    updateServiceSlider();
    updateSliderPosition();
  });
});