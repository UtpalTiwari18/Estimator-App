<<<<<<< HEAD
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
=======
document.addEventListener("DOMContentLoaded", () => { const m = document.querySelector(".menu-btn"), n = document.querySelector(".nav-links"); if (m && n) { m.addEventListener("click", () => n.classList.toggle("show")); } document.querySelectorAll(".accordion-header").forEach(b => b.addEventListener("click", () => b.parentElement.classList.toggle("open"))); const f = document.querySelector("#supportForm"), o = document.querySelector("#formNotice"); if (f && o) { f.addEventListener("submit", e => { e.preventDefault(); o.style.display = "block"; o.textContent = "Your request has been submitted for demo purposes."; f.reset(); }); } });
>>>>>>> 99863f68e0ecc49c3b65a73b754e376e6b1637f7
