document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "http://localhost:5000";

  const contactForm = document.getElementById("contactForm");
  const notice = document.getElementById("formNotice");

  function showNotice(message, isError = false) {
    if (!notice) return;

    notice.className = isError ? "contactNotice error" : "contactNotice";
    notice.style.display = "block";
    notice.textContent = message;
  }

  if (contactForm && notice) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fullName = document.getElementById("fullName")?.value.trim() || "";
      const email = document.getElementById("email")?.value.trim() || "";
      const topic = document.getElementById("topic")?.value.trim() || "";
      const message = document.getElementById("message")?.value.trim() || "";

      if (!fullName || !email || !topic || !message) {
        showNotice("Please fill in all required fields before submitting.", true);
        return;
      }

      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton ? submitButton.textContent : "Send Message";

      try {
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = "Sending...";
        }

        const response = await fetch(`${API_BASE}/api/contact`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            fullName,
            email,
            topic,
            message
          })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          showNotice(data.message || "Failed to send message.", true);
          return;
        }

        showNotice("Thanks! Your message has been sent successfully.");
        contactForm.reset();
      } catch (error) {
        console.error("Contact form error:", error);
        showNotice("Server error while sending your message.", true);
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
      }
    });
  }

  document.querySelectorAll(".contactAccordionHeader").forEach((button) => {
    button.addEventListener("click", () => {
      button.parentElement.classList.toggle("open");
    });
  });
});