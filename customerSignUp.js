(function () {
      const form = document.getElementById("customerSignupForm");
      const msg = document.getElementById("customerSignupMessage");

      function showMsg(type, text) {
        if (!msg) return;
        msg.className = "formMessage " + type;
        msg.textContent = text;
      }

      if (!form) return;

      form.addEventListener("submit", function (e) {
        e.preventDefault();

        const firstName = (document.getElementById("csFirstName") || {}).value?.trim?.() || "";
        const lastName = (document.getElementById("csLastName") || {}).value?.trim?.() || "";
        const email = (document.getElementById("csEmail") || {}).value?.trim?.() || "";
        const phone = (document.getElementById("csPhone") || {}).value?.trim?.() || "";
        const zip = (document.getElementById("csZip") || {}).value?.trim?.() || "";
        const pass = (document.getElementById("csPassword") || {}).value || "";
        const confirm = (document.getElementById("csConfirm") || {}).value || "";
        const terms = (document.getElementById("csTerms") || {}).checked || false;

        if (!firstName || !lastName || !email || !pass || !confirm) {
          showMsg("err", "Please fill in all required fields.");
          return;
        }

        if (!/^\S+@\S+\.\S+$/.test(email)) {
          showMsg("err", "Please enter a valid email address.");
          return;
        }

        if (pass.length < 8) {
          showMsg("err", "Password must be at least 8 characters.");
          return;
        }

        if (pass !== confirm) {
          showMsg("err", "Passwords do not match.");
          return;
        }

        if (!terms) {
          showMsg("err", "Please accept the Terms and Privacy Policy.");
          return;
        }

        // Demo only (until backend is connected)
        const customer = { firstName, lastName, email, phone, zip, createdAt: new Date().toISOString() };
        localStorage.setItem("estimator_customer_signup_demo", JSON.stringify(customer));

        showMsg("ok", "Account created (demo). Next step: connect this to your database.");
        form.reset();
      });
    })();