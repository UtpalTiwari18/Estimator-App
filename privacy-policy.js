document.addEventListener("DOMContentLoaded", () => {

  // Accordion (only runs if exists)
  document.querySelectorAll(".accordion-header").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.parentElement.classList.toggle("open");
    });
  });

  // Form (only runs if exists)
  const form = document.querySelector("#supportForm");
  const notice = document.querySelector("#formNotice");

  if (form && notice) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      notice.style.display = "block";
      notice.textContent = "Your request has been submitted.";
      form.reset();
    });
  }

});