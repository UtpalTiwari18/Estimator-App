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

  loginForm.addEventListener("submit", function (event) {
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

    showMessage("Login form looks good. Ready to connect to backend.", "ok");
  });

  emailInput.addEventListener("input", clearMessage);
  passwordInput.addEventListener("input", clearMessage);
});