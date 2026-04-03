// ===============================
// USER DROPDOWN + NAME
// ===============================
const userButton = document.getElementById("userButton");
const userMenu = document.getElementById("userMenu");
const logoutBtn = document.getElementById("logoutBtn");
const userName = document.getElementById("userName");

// Get logged-in customer
const savedCustomer = JSON.parse(localStorage.getItem("estimatorCustomerAuth"));

// 🔒 Protect page (must be logged in)
if (!savedCustomer) {
  window.location.href = "customerLogin.html";
}

// Set user name
if (savedCustomer && savedCustomer.firstName && userName) {
  userName.textContent = savedCustomer.firstName;
} else if (userName) {
  userName.textContent = "Guest";
}

// Dropdown toggle
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

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", function (e) {
    e.preventDefault();
    localStorage.removeItem("estimatorCustomerAuth");
    window.location.href = "home.html";
  });
}


// ===============================
// CUSTOMER COUNT (🔥 SAME AS HOME)
// ===============================
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


// ===============================
// ZIP AUTO-FILL
// ===============================
async function fillZipCodeFromLocation() {
  const zipInput = document.getElementById("zipInput");

  if (!zipInput) {
    console.log("zipInput not found");
    return;
  }

  if (!("geolocation" in navigator)) {
    console.log("Geolocation is not supported by this browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async function (position) {
      try {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`;

        const response = await fetch(url, {
          headers: {
            Accept: "application/json"
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch address data.");
        }

        const data = await response.json();
        const postcode = data?.address?.postcode;

        if (postcode) {
          const zipCode = postcode.match(/\d{5}/)?.[0] || "";
          zipInput.value = zipCode;
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


// ===============================
// RUN ON PAGE LOAD
// ===============================
window.addEventListener("DOMContentLoaded", function () {
  loadCustomerCount();
  fillZipCodeFromLocation();
});