const userButton = document.getElementById("userButton");
const userMenu = document.getElementById("userMenu");
const logoutBtn = document.getElementById("logoutBtn");
const userName = document.getElementById("userName");

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
    localStorage.removeItem("user");
    window.location.href = "loginChoice.html";
  });
}

const savedCustomer = JSON.parse(localStorage.getItem("estimatorCustomerAuth"));

if (!savedCustomer) {
  window.location.href = "customerLogin.html";
}

if (savedCustomer && savedCustomer.firstName && userName) {
  userName.textContent = savedCustomer.firstName;
} else if (userName) {
  userName.textContent = "Guest";
}



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

        console.log("Latitude:", latitude);
        console.log("Longitude:", longitude);

        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`;

        const response = await fetch(url, {
          headers: {
            Accept: "application/json"
          }
        });

        console.log("Fetch status:", response.status);

        if (!response.ok) {
          throw new Error("Failed to fetch address data.");
        }

        const data = await response.json();
        console.log("Reverse geocode response:", data);

        const postcode = data?.address?.postcode;

        if (postcode) {
          const zipCode = postcode.match(/\d{5}/)?.[0] || "";
          zipInput.value = zipCode;
          console.log("ZIP filled:", zipCode);
        } else {
          console.log("ZIP code not found in response.");
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

window.addEventListener("DOMContentLoaded", function () {
  fillZipCodeFromLocation();
});