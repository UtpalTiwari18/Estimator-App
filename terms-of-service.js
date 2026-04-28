document.addEventListener("DOMContentLoaded", () => {


  document.querySelectorAll(".accordion-header").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.parentElement.classList.toggle("open");
    });
  });

  
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