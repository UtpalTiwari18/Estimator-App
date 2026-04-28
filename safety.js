document.addEventListener("DOMContentLoaded", () => {

  // Accordion (only if exists)
  document.querySelectorAll(".accordion-header").forEach(button => {
    button.addEventListener("click", () => {
      button.parentElement.classList.toggle("open");
    });
  });

  // Form (only if exists)
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