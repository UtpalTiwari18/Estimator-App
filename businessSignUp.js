(function () {
  const form = document.getElementById("businessSignupForm");
  const messageBox = document.getElementById("businessSignupMessage");

  if (!form || !messageBox) {
    return;
  }

  function showMessage(type, text) {
    messageBox.className = "formMessage " + type;
    messageBox.textContent = text;
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

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const businessName = document.getElementById("bsBusinessName").value.trim();
    const ownerName = document.getElementById("bsOwnerName").value.trim();
    const businessType = document.getElementById("bsBusinessType").value.trim();
    const email = document.getElementById("bsEmail").value.trim();
    const phone = document.getElementById("bsPhone").value.trim();
    const website = document.getElementById("bsWebsite").value.trim();
    const services = document.getElementById("bsServices").value.trim();

    const addressLine1 = document.getElementById("bsAddressLine1").value.trim();
    const addressLine2 = document.getElementById("bsAddressLine2").value.trim();
    const city = document.getElementById("bsCity").value.trim();
    const state = document.getElementById("bsState").value.trim();
    const zip = document.getElementById("bsZip").value.trim();

    const password = document.getElementById("bsPassword").value;
    const confirmPassword = document.getElementById("bsConfirm").value;
    const termsAccepted = document.getElementById("bsTerms").checked;

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
      showMessage("err", "Please fill in all required fields.");
      return;
    }

    if (!isValidEmail(email)) {
      showMessage("err", "Please enter a valid business email address.");
      return;
    }

    if (!isValidPhone(phone)) {
      showMessage("err", "Please enter a valid phone number.");
      return;
    }

    if (!isValidZip(zip)) {
      showMessage("err", "Please enter a valid 5-digit zip code.");
      return;
    }

    if (password.length < 8) {
      showMessage("err", "Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      showMessage("err", "Passwords do not match.");
      return;
    }

    if (!termsAccepted) {
      showMessage("err", "Please accept the Terms of Service and Privacy Policy.");
      return;
    }

    const businessData = {
      businessName: businessName,
      ownerName: ownerName,
      businessType: businessType,
      email: email,
      phone: phone,
      website: website,
      services: services,
      address: {
        addressLine1: addressLine1,
        addressLine2: addressLine2,
        city: city,
        state: state,
        zip: zip
      },
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(
      "estimator_business_signup_demo",
      JSON.stringify(businessData)
    );

    showMessage("ok", "Business account created successfully.");
    form.reset();
  });
})();