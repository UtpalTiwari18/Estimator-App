(function () {
  const form = document.getElementById("businessSignupForm");
  const msg = document.getElementById("businessSignupMessage");

  function showMsg(type, text) {
    if (!msg) return;
    msg.className = "formMessage " + type;
    msg.textContent = text;
  }

  function isValidEmail(emailValue) {
    return /^\S+@\S+\.\S+$/.test(emailValue);
  }

  function isValidPhone(phoneValue) {
    const digitsOnly = phoneValue.replace(/\D/g, "");
    return digitsOnly.length >= 10;
  }

  function isValidZip(zipValue) {
    return /^\d{5}$/.test(zipValue);
  }

  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const businessName = document.getElementById("bsBusinessName")?.value.trim() || "";
    const ownerName = document.getElementById("bsOwnerName")?.value.trim() || "";
    const businessType = document.getElementById("bsBusinessType")?.value.trim() || "";
    const email = document.getElementById("bsEmail")?.value.trim() || "";
    const phone = document.getElementById("bsPhone")?.value.trim() || "";
    const website = document.getElementById("bsWebsite")?.value.trim() || "";
    const services = document.getElementById("bsServices")?.value.trim() || "";
    const addressLine1 = document.getElementById("bsAddressLine1")?.value.trim() || "";
    const addressLine2 = document.getElementById("bsAddressLine2")?.value.trim() || "";
    const city = document.getElementById("bsCity")?.value.trim() || "";
    const state = document.getElementById("bsState")?.value.trim() || "";
    const zip = document.getElementById("bsZip")?.value.trim() || "";
    const password = document.getElementById("bsPassword")?.value || "";
    const confirmPassword = document.getElementById("bsConfirm")?.value || "";
    const terms = document.getElementById("bsTerms")?.checked || false;

    if (
      !businessName ||
      !ownerName ||
      !businessType ||
      !email ||
      !phone ||
      !services ||
      !addressLine1 ||
      !city ||
      !state ||
      !zip ||
      !password ||
      !confirmPassword
    ) {
      showMsg("err", "Please fill in all required fields.");
      return;
    }

    if (!isValidEmail(email)) {
      showMsg("err", "Please enter a valid business email address.");
      return;
    }

    if (!isValidPhone(phone)) {
      showMsg("err", "Please enter a valid phone number.");
      return;
    }

    if (!isValidZip(zip)) {
      showMsg("err", "Please enter a valid 5-digit zip code.");
      return;
    }

    if (password.length < 8) {
      showMsg("err", "Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      showMsg("err", "Passwords do not match.");
      return;
    }

    if (!terms) {
      showMsg("err", "Please accept the Terms of Service and Privacy Policy.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/business/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          businessName,
          ownerName,
          businessType,
          email,
          phone,
          website,
          services,
          addressLine1,
          addressLine2,
          city,
          state,
          zip,
          password,
          terms
        })
      });

      const data = await res.json();

      if (!res.ok) {
        showMsg("err", data.message || "Something went wrong");
        return;
      }

      showMsg("ok", "Business account created successfully 🎉");
      form.reset();
    } catch (err) {
      console.error(err);
      showMsg("err", "Server not reachable");
    }
  });
})();