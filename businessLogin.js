document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("businessLoginForm");
  const emailInput = document.getElementById("blEmail");
  const passwordInput = document.getElementById("blPassword");
  const messageBox = document.getElementById("businessLoginMessage");

  if (!loginForm || !emailInput || !passwordInput || !messageBox) return;

  function showMessage(message, type) {
    messageBox.textContent = message;
    messageBox.className = "formMessage " + type;
  }

  function clearMessage() {
    messageBox.textContent = "";
    messageBox.className = "formMessage";
  }

  function isValidEmail(emailValue) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
  }

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();

    clearMessage();

    if (!emailValue || !passwordValue) {
      showMessage("Please fill in both email and password.", "err");
      return;
    }

    if (!isValidEmail(emailValue)) {
      showMessage("Please enter a valid business email address.", "err");
      return;
    }

    if (passwordValue.length < 6) {
      showMessage("Password must be at least 6 characters.", "err");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/business/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: emailValue,
          password: passwordValue
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        showMessage(data.message || "Login failed.", "err");
        return;
      }

      const businessData = {
        id: data.business.id,
        businessName: data.business.businessName,
        ownerName: data.business.ownerName,
        email: data.business.email,
        zip: data.business.zip
      };

      localStorage.setItem("estimatorBusinessAuth", JSON.stringify(businessData));

      showMessage("Login successful. Redirecting...", "ok");

      setTimeout(function () {
        window.location.href = "businessHomePage.html";
      }, 500);
    } catch (error) {
      console.error("Business login error:", error);
      showMessage("Server error. Please try again.", "err");
    }
  });

  emailInput.addEventListener("input", clearMessage);
  passwordInput.addEventListener("input", clearMessage);
});