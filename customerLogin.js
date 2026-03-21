(function () {
  const form = document.getElementById("customerLoginForm");
  const msg = document.getElementById("customerLoginMessage");

  function showMsg(type, text) {
    msg.className = "formMessage " + type;
    msg.textContent = text;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("clEmail").value.trim();
    const password = document.getElementById("clPassword").value;
    const remember = document.getElementById("clRemember").checked;

    if (!email || !password) {
      showMsg("err", "Please enter your email and password.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      showMsg("err", "Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      showMsg("err", "Password must be at least 8 characters.");
      return;
    }

    localStorage.setItem("estimator_customer_login_demo", JSON.stringify({
      email,
      remember,
      loggedInAt: new Date().toISOString()
    }));

    showMsg("ok", "Login successful (demo).");
  });
})();