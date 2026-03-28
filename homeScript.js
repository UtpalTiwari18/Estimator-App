const menuButton = document.getElementById("menuButton");
const menuArea = document.getElementById("menuArea");

const servicesMenu = document.getElementById("servicesMenu");
const servicesLink = document.getElementById("servicesLink");

const megaCategories = document.querySelectorAll(".megaCategory");
const megaPanels = document.querySelectorAll(".megaPanel");

function showPanel(panelId) {
  megaPanels.forEach(panel => panel.classList.remove("isVisible"));
  const activePanel = document.getElementById(panelId);
  if (activePanel) activePanel.classList.add("isVisible");
}

megaCategories.forEach(category => {
  category.addEventListener("mouseenter", () => {
    const panelId = category.getAttribute("data-panel");
    megaCategories.forEach(c => c.classList.remove("isActive"));
    category.classList.add("isActive");
    showPanel(panelId);
  });

  category.addEventListener("click", () => {
    const panelId = category.getAttribute("data-panel");
    megaCategories.forEach(c => c.classList.remove("isActive"));
    category.classList.add("isActive");
    showPanel(panelId);
  });
});

menuButton.addEventListener("click", () => {
  menuArea.classList.toggle("isOpen");
});

/* Mobile: tap Our Services to open/close mega dropdown */
servicesLink.addEventListener("click", (event) => {
  const isMobile = window.matchMedia("(max-width: 900px)").matches;
  if (!isMobile) return; // desktop uses hover
  event.preventDefault();
  servicesMenu.classList.toggle("isOpen");
});


/* ===========================
   Testimonials Slider (Home)
   IDs in your home.html:
   #testimonialSlider, #sliderTrack, #sliderDots,
   #prevButton, #nextButton
=========================== */

const testimonialSlider = document.getElementById("testimonialSlider");
const sliderTrack = document.getElementById("sliderTrack");
const sliderDots = document.getElementById("sliderDots");

const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");

if (testimonialSlider && sliderTrack && sliderDots) {
  const slides = Array.from(sliderTrack.children);

  let currentIndex = 0;
  let sliderTimer = null;
  const intervalMs = 4500;

  // Build dots
  sliderDots.innerHTML = "";
  slides.forEach((_, i) => {
    const dotButton = document.createElement("button");
    dotButton.className = "dotButton";
    dotButton.type = "button";
    dotButton.setAttribute("aria-label", `Go to testimonial ${i + 1}`);
    dotButton.addEventListener("click", () => goToSlide(i, true));
    sliderDots.appendChild(dotButton);
  });

  const dotButtons = Array.from(sliderDots.children);

  function renderSlider() {
    sliderTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
    dotButtons.forEach((dot, i) => dot.classList.toggle("active", i === currentIndex));
  }

  function goToSlide(index, userInitiated = false) {
    currentIndex = (index + slides.length) % slides.length;
    renderSlider();
    if (userInitiated) restartAutoSlide();
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  function startAutoSlide() {
    stopAutoSlide();
    sliderTimer = setInterval(nextSlide, intervalMs);
  }

  function stopAutoSlide() {
    if (sliderTimer) clearInterval(sliderTimer);
    sliderTimer = null;
  }

  function restartAutoSlide() {
    stopAutoSlide();
    startAutoSlide();
  }

  // Buttons
  if (prevButton) {
    prevButton.addEventListener("click", () => {
      prevSlide();
      restartAutoSlide();
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      nextSlide();
      restartAutoSlide();
    });
  }

  // Pause on hover/focus
  testimonialSlider.addEventListener("mouseenter", stopAutoSlide);
  testimonialSlider.addEventListener("mouseleave", startAutoSlide);
  testimonialSlider.addEventListener("focusin", stopAutoSlide);
  testimonialSlider.addEventListener("focusout", startAutoSlide);

  // Optional: swipe on mobile
  let startX = 0;
  let endX = 0;

  testimonialSlider.addEventListener("touchstart", (e) => {
    startX = e.changedTouches[0].screenX;
  }, { passive: true });

  testimonialSlider.addEventListener("touchend", (e) => {
    endX = e.changedTouches[0].screenX;
    const diff = endX - startX;

    if (Math.abs(diff) > 50) {
      if (diff < 0) nextSlide();
      else prevSlide();
      restartAutoSlide();
    }
  }, { passive: true });

  // Init
  renderSlider();
  startAutoSlide();
}

/* ===============================
   POPULAR SERVICES SLIDER
================================ */
(function () {
  const track = document.getElementById("popularServicesTrack");
  const prevBtn = document.getElementById("servicePrevButton");
  const nextBtn = document.getElementById("serviceNextButton");
  const dotsWrap = document.getElementById("serviceDots");

  if (!track || !prevBtn || !nextBtn || !dotsWrap) return;

  const cards = Array.from(track.children);
  let index = 0;
  let cardsPerView = getCardsPerView();

  function getCardsPerView() {
    if (window.innerWidth <= 640) return 1;
    if (window.innerWidth <= 992) return 2;
    return 3;
  }

  function getMaxIndex() {
    return Math.max(0, cards.length - cardsPerView);
  }

  function updateSlider() {
    cardsPerView = getCardsPerView();

    const cardStyle = window.getComputedStyle(cards[0]);
    const cardWidth = cards[0].offsetWidth;
    const gap = parseInt(window.getComputedStyle(track).gap) || 0;
    const moveX = index * (cardWidth + gap);

    track.style.transform = `translateX(-${moveX}px)`;

    updateDots();
  }

  function createDots() {
    dotsWrap.innerHTML = "";
    const totalDots = getMaxIndex() + 1;

    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement("button");
      if (i === index) dot.classList.add("active");

      dot.addEventListener("click", function () {
        index = i;
        updateSlider();
      });

      dotsWrap.appendChild(dot);
    }
  }

  function updateDots() {
    const dots = dotsWrap.querySelectorAll("button");
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });
  }

  prevBtn.addEventListener("click", function () {
    if (index > 0) {
      index--;
      updateSlider();
    }
  });

  nextBtn.addEventListener("click", function () {
    if (index < getMaxIndex()) {
      index++;
      updateSlider();
    }
  });

  window.addEventListener("resize", function () {
    cardsPerView = getCardsPerView();
    if (index > getMaxIndex()) index = getMaxIndex();
    createDots();
    updateSlider();
  });

  createDots();
  updateSlider();
})();

async function loadCustomerCount() {
  try {
    const res = await fetch("http://localhost:5000/api/customers/count");
    const data = await res.json();

    if (data.success) {
      document.getElementById("customerCountNumber").textContent = data.total;
    }
  } catch (error) {
    console.error("Failed to load customer count:", error);
  }
}

document.addEventListener("DOMContentLoaded", loadCustomerCount);

async function loadCustomerCount() {
  try {
    const res = await fetch("http://localhost:5000/api/customers/count");
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

document.addEventListener("DOMContentLoaded", loadCustomerCount);