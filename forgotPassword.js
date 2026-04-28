(function () {
  const forgotPasswordForm = document.getElementById("forgotPasswordForm");
  const emailInput = document.getElementById("emailInput");
  const newPasswordInput = document.getElementById("newPasswordInput");
  const confirmPasswordInput = document.getElementById("confirmPasswordInput");
  const formMessage = document.getElementById("formMessage");
  const submitButton = forgotPasswordForm.querySelector(".submitButton");
  const userTypeInputs = document.querySelectorAll('input[name="userType"]');

  const API_BASE =
    window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://estimator-app-icmp.onrender.com";

  function showMessage(messageType, messageText) {
    formMessage.className = "formMessage " + messageType;
    formMessage.textContent = messageText;
  }

  function isValidEmail(emailValue) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
  }

  function getSelectedUserType() {
    const selected = document.querySelector('input[name="userType"]:checked');
    return selected ? selected.value : "";
  }

  forgotPasswordForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const emailValue = emailInput.value.trim();
    const newPasswordValue = newPasswordInput.value.trim();
    const confirmPasswordValue = confirmPasswordInput.value.trim();
    const userType = getSelectedUserType();

    if (!userType) {
      showMessage("error", "Please choose Customer or Business Owner.");
      return;
    }

    if (!emailValue) {
      showMessage("error", "Please enter your email address.");
      return;
    }

    if (!isValidEmail(emailValue)) {
      showMessage("error", "Please enter a valid email address.");
      return;
    }

    if (!newPasswordValue) {
      showMessage("error", "Please enter your new password.");
      return;
    }

    if (newPasswordValue.length < 6) {
      showMessage("error", "Password must be at least 6 characters long.");
      return;
    }

    if (!confirmPasswordValue) {
      showMessage("error", "Please confirm your new password.");
      return;
    }

    if (newPasswordValue !== confirmPasswordValue) {
      showMessage("error", "Passwords do not match.");
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Resetting...";

    try {
      const response = await fetch(`${API_BASE}/api/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userType: userType,
          email: emailValue,
          newPassword: newPasswordValue
        })
      });

      const data = await response.json();

      if (!response.ok) {
        showMessage("error", data.message || "Unable to reset password.");
        submitButton.disabled = false;
        submitButton.textContent = "Reset Password";
        return;
      }

      localStorage.setItem(
        "estimatorForgotPasswordEmail",
        JSON.stringify({
          email: emailValue,
          userType: userType,
          requestedAt: new Date().toISOString()
        })
      );

      showMessage("success", data.message || "Password reset successful.");

      forgotPasswordForm.reset();

      const defaultCustomer = document.querySelector(
        'input[name="userType"][value="customer"]'
      );
      if (defaultCustomer) {
        defaultCustomer.checked = true;
      }

      submitButton.disabled = false;
      submitButton.textContent = "Reset Password";

      setTimeout(function () {
        if (userType === "customer") {
          window.location.href = "customerLogin.html";
        } else {
          window.location.href = "businessLogin.html";
        }
      }, 1400);
    } catch (error) {
      console.error("Reset password error:", error);
      showMessage("error", "Server error. Please try again later.");
      submitButton.disabled = false;
      submitButton.textContent = "Reset Password";
    }
  });
})();