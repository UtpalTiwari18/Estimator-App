document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.querySelector(".menu-btn");
  const navLinks = document.querySelector(".nav-links");

  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
      navLinks.classList.toggle("show");
    });
  }

  document.querySelectorAll(".accordion-header").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.parentElement;
      const isOpen = item.classList.toggle("open");
      button.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  });

  const form = document.querySelector("#supportForm");
  const notice = document.querySelector("#formNotice");

  if (form && notice) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      notice.style.display = "block";
      notice.textContent = "Your request has been submitted for demo purposes.";
      form.reset();
    });
  }
});