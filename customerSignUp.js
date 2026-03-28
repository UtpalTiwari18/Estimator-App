(function () {
  const form = document.getElementById("customerSignupForm");
  const msg = document.getElementById("customerSignupMessage");

  function showMsg(type, text) {
    if (!msg) return;
    msg.className = "formMessage " + type;
    msg.textContent = text;
  }

  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const firstName = document.getElementById("csFirstName")?.value.trim() || "";
    const lastName = document.getElementById("csLastName")?.value.trim() || "";
    const email = document.getElementById("csEmail")?.value.trim() || "";
    const phone = document.getElementById("csPhone")?.value.trim() || "";
    const zip = document.getElementById("csZip")?.value.trim() || "";
    const password = document.getElementById("csPassword")?.value || "";
    const confirm = document.getElementById("csConfirm")?.value || "";
    const terms = document.getElementById("csTerms")?.checked || false;

    if (!firstName || !lastName || !email || !password || !confirm) {
      showMsg("err", "Please fill in all required fields.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      showMsg("err", "Enter a valid email.");
      return;
    }

    if (password.length < 8) {
      showMsg("err", "Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      showMsg("err", "Passwords do not match.");
      return;
    }

    if (!terms) {
      showMsg("err", "Accept terms to continue.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/customers/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
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

      showMsg("ok", "Account created successfully 🎉");
      form.reset();

    } catch (err) {
      console.error(err);
      showMsg("err", "Server not reachable");
    }
  });
})();