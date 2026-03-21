(function () {
  const forgotPasswordForm = document.getElementById("forgotPasswordForm");
  const emailInput = document.getElementById("emailInput");
  const formMessage = document.getElementById("formMessage");
  const submitButton = forgotPasswordForm.querySelector(".submitButton");

  function showMessage(messageType, messageText) {
    formMessage.className = "formMessage " + messageType;
    formMessage.textContent = messageText;
  }

  function isValidEmail(emailValue) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
  }

  forgotPasswordForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const emailValue = emailInput.value.trim();

    if (!emailValue) {
      showMessage("error", "Please enter your email address.");
      return;
    }

    if (!isValidEmail(emailValue)) {
      showMessage("error", "Please enter a valid email address.");
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    setTimeout(function () {
      localStorage.setItem(
        "estimatorForgotPasswordEmail",
        JSON.stringify({
          email: emailValue,
          requestedAt: new Date().toISOString()
        })
      );

      showMessage(
        "success",
        "Reset link sent successfully. Please check your email."
      );

      forgotPasswordForm.reset();
      submitButton.disabled = false;
      submitButton.textContent = "Reset Password";
    }, 1200);
  });
})();