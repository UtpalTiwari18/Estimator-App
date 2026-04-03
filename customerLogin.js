(function () {
  const form = document.getElementById("customerLoginForm");
  const msg = document.getElementById("customerLoginMessage");

  const apiBaseUrl = "http://127.0.0.1:5000";

  function showMsg(type, text) {
    if (!msg) return;
    msg.className = "formMessage " + type;
    msg.textContent = text;
  }

  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("clEmail")?.value.trim() || "";
    const password = document.getElementById("clPassword")?.value || "";
    const remember = document.getElementById("clRemember")?.checked || false;

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

    try {
      const res = await fetch(`${apiBaseUrl}/api/customers/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password,
          remember
        })
      });

      const data = await res.json();

      if (!res.ok) {
        showMsg("err", data.message || "Login failed.");
        return;
      }

      localStorage.setItem(
        "estimatorCustomerAuth",
        JSON.stringify({
          id: data.customerId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          remember: remember,
          loggedInAt: new Date().toISOString()
        })
      );

      showMsg("ok", data.message || "Login successful.");

      setTimeout(function () {
        window.location.href = "customerHomePage.html";
      }, 500);
    } catch (error) {
      console.error("Customer login error:", error);
      showMsg("err", "Server not reachable.");
    }
  });
})();