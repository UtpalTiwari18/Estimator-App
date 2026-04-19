document.addEventListener("DOMContentLoaded", function () {
  const API_BASE = "http://localhost:5000";

  const userButton = document.getElementById("userButton");
  const userMenu = document.getElementById("userMenu");
  const logoutBtn = document.getElementById("logoutBtn");
  const userName = document.getElementById("userName");
  const menuButton = document.getElementById("menuButton");
  const menuArea = document.getElementById("menuArea");

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

  const savedCustomer = JSON.parse(localStorage.getItem("estimatorCustomerAuth"));

  function clearCustomerSession() {
  localStorage.removeItem("estimatorCustomerAuth");
  localStorage.removeItem("user");
  localStorage.removeItem("compareBusinesses");
  localStorage.removeItem("estimatorCompareBusinesses");
  sessionStorage.removeItem("estimatorCustomerAuth");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("compareBusinesses");
  sessionStorage.removeItem("estimatorCompareBusinesses");
}

  if (!savedCustomer) {
    window.location.href = "customerLogin.html";
    return;
  }

  if (savedCustomer.firstName && userName) {
    userName.textContent = savedCustomer.firstName;
  } else if (savedCustomer.first_name && userName) {
    userName.textContent = savedCustomer.first_name;
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

  if (menuButton && menuArea) {
    menuButton.addEventListener("click", function (e) {
      e.stopPropagation();
      menuArea.classList.toggle("active");
    });

    document.addEventListener("click", function (e) {
      if (!menuArea.contains(e.target) && !menuButton.contains(e.target)) {
        menuArea.classList.remove("active");
      }
    });
  }

if (logoutBtn) {
  logoutBtn.addEventListener("click", function (e) {
    e.preventDefault();
    clearCustomerSession();
    window.location.href = "home.html";
  });
}

  function getLoggedInCustomer() {
    try {
      return JSON.parse(localStorage.getItem("estimatorCustomerAuth"));
    } catch (error) {
      return null;
    }
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

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
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

    messageBusinessId.value = String(business.id || "");
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
    const zipInput = document.getElementById("zipInput");

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

  const servicesMenu = document.getElementById("servicesMenu");
  const servicesLink = document.getElementById("servicesLink");
  const megaCategories = document.querySelectorAll(".megaCategory");
  const megaPanels = document.querySelectorAll(".megaPanel");

  function showMegaPanel(panelId) {
    megaCategories.forEach((btn) => btn.classList.remove("isActive"));
    megaPanels.forEach((panel) => panel.classList.remove("isVisible"));

    const activeButton = document.querySelector(`.megaCategory[data-panel="${panelId}"]`);
    const targetPanel = document.getElementById(panelId);

    if (activeButton) activeButton.classList.add("isActive");
    if (targetPanel) targetPanel.classList.add("isVisible");
  }

  megaCategories.forEach((button) => {
    button.addEventListener("mouseenter", function () {
      const panelId = this.getAttribute("data-panel");
      showMegaPanel(panelId);
    });

    button.addEventListener("focus", function () {
      const panelId = this.getAttribute("data-panel");
      showMegaPanel(panelId);
    });
  });

  if (servicesMenu) {
    servicesMenu.addEventListener("mouseleave", function () {
      showMegaPanel("interiorPanel");
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

  const popularServicesTrack = document.getElementById("popularServicesTrack");
  const servicePrevButton = document.getElementById("servicePrevButton");
  const serviceNextButton = document.getElementById("serviceNextButton");
  const serviceDots = document.getElementById("serviceDots");

  let serviceIndex = 0;

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
        if (i === serviceIndex) dot.classList.add("active");
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

  const sliderTrack = document.getElementById("sliderTrack");
  const prevButton = document.getElementById("prevButton");
  const nextButton = document.getElementById("nextButton");
  const sliderDots = document.getElementById("sliderDots");

  let testimonialIndex = 0;

  function updateTestimonialSlider() {
    if (!sliderTrack) return;

    const cards = sliderTrack.querySelectorAll(".testimonialCard");
    if (!cards.length) return;

    sliderTrack.style.transform = `translateX(-${testimonialIndex * 100}%)`;

    if (sliderDots) {
      sliderDots.innerHTML = "";
      cards.forEach((_, index) => {
        const dot = document.createElement("button");
        dot.className = "dotButton";
        if (index === testimonialIndex) dot.classList.add("active");
        dot.addEventListener("click", function () {
          testimonialIndex = index;
          updateTestimonialSlider();
        });
        sliderDots.appendChild(dot);
      });
    }
  }

  if (prevButton) {
    prevButton.addEventListener("click", function () {
      const cards = sliderTrack?.querySelectorAll(".testimonialCard") || [];
      if (!cards.length) return;
      testimonialIndex = (testimonialIndex - 1 + cards.length) % cards.length;
      updateTestimonialSlider();
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", function () {
      const cards = sliderTrack?.querySelectorAll(".testimonialCard") || [];
      if (!cards.length) return;
      testimonialIndex = (testimonialIndex + 1) % cards.length;
      updateTestimonialSlider();
    });
  }

  const heroSearchForm = document.getElementById("heroSearchForm");
  const keywordInput = document.getElementById("keywordInput");
  const zipInputField = document.getElementById("zipInput");
  const suggestionsBox = document.getElementById("suggestionsBox");
  const searchResultsSection = document.getElementById("searchResultsSection");
  const searchResultsList = document.getElementById("searchResultsList");
  const searchResultsText = document.getElementById("searchResultsText");

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
          ${business.website ? `• <a href="${escapeHtml(business.website)}" target="_blank" rel="noopener noreferrer">Website</a>` : ""}
        </div>
        <div class="businessMeta">
          ${business.email || business.businessEmail ? `Email: ${escapeHtml(business.email || business.businessEmail)}` : "Email: Not available"}
        </div>
        <div class="businessServices">
          <strong>Services:</strong> ${escapeHtml(business.services || "Not listed")}
        </div>
        <div class="businessActions">
          <button class="saveBtn" data-business-id="${escapeHtml(business.id)}">Save</button>
          <button class="compareBtn" data-business-id="${escapeHtml(business.id)}">Compare</button>
          <button class="messageBtn" data-business-id="${escapeHtml(business.id)}">Message</button>
        </div>
      `;

      card.businessData = business;
      searchResultsList.appendChild(card);
    });

    attachBusinessActionEvents();
    searchResultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function attachBusinessActionEvents() {
    document.querySelectorAll(".saveBtn").forEach((button) => {
      button.addEventListener("click", async function () {
        const customer = getLoggedInCustomer();

        if (!customer) {
          alert("Please log in first to save businesses.");
          window.location.href = "customerLogin.html";
          return;
        }

        const businessId = this.getAttribute("data-business-id");
        const customerId = customer.id || customer.customerId;

        if (!customerId || !businessId) {
          alert("Customer ID or Business ID is missing.");
          return;
        }

        try {
          const response = await fetch(`${API_BASE}/api/save-business`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              customer_id: Number(customerId),
              business_id: Number(businessId)
            })
          });

          const data = await response.json();

          if (data.success) {
            alert(data.message || "Business saved successfully.");
          } else {
            alert(data.message || "Could not save business.");
          }
        } catch (error) {
          console.error("Save business error:", error);
          alert("Server error while saving business.");
        }
      });
    });

    document.querySelectorAll(".compareBtn").forEach((button) => {
      button.addEventListener("click", function () {
        const customer = getLoggedInCustomer();

        if (!customer) {
          alert("Please log in first to compare businesses.");
          window.location.href = "customerLogin.html";
          return;
        }

        const businessId = this.getAttribute("data-business-id");
        let compareList = JSON.parse(localStorage.getItem("compareBusinesses")) || [];

        if (compareList.includes(businessId)) {
          alert("This business is already in compare list.");
          return;
        }

        if (compareList.length >= 2) {
          alert("You can compare only 2 businesses at a time.");
          return;
        }

        compareList.push(businessId);
        localStorage.setItem("compareBusinesses", JSON.stringify(compareList));
        alert("Business added to compare list.");
      });
    });

    document.querySelectorAll(".messageBtn").forEach((button) => {
      button.addEventListener("click", function () {
        const customer = getLoggedInCustomer();

        if (!customer) {
          alert("Please log in first to message businesses.");
          window.location.href = "customerLogin.html";
          return;
        }

        const card = this.closest(".businessCard");
        const business = card?.businessData;

        if (!business) {
          alert("Business details could not be found.");
          return;
        }

        openMessageModal(business);
      });
    });
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

  if (heroSearchForm) {
    heroSearchForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const keyword = keywordInput.value.trim();
      const zip = zipInputField.value.trim();

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
          alert(data.message);
        }
      } catch (err) {
        console.error(err);
        alert("Server error");
      }
    });
  }

  loadCustomerCount();
  fillZipCodeFromLocation();
  updateServiceSlider();
  updateTestimonialSlider();

  window.addEventListener("resize", function () {
    updateServiceSlider();
  });
});