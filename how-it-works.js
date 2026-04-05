
document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.querySelector('.menu-btn');
  const navLinks = document.querySelector('.nav-links');

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('show');
    });
  }

  document.querySelectorAll('.accordion-header').forEach(button => {
    button.addEventListener('click', () => {
      button.parentElement.classList.toggle('open');
    });
  });

  const contactForm = document.querySelector('#contactForm');
  const notice = document.querySelector('#formNotice');

  if (contactForm && notice) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const requiredFields = contactForm.querySelectorAll('[required]');
      let valid = true;

      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          valid = false;
        }
      });

      if (!valid) {
        notice.className = 'notice error';
        notice.style.display = 'block';
        notice.textContent = 'Please fill in all required fields before submitting.';
        return;
      }

      notice.className = 'notice';
      notice.style.display = 'block';
      notice.textContent = 'Thanks! Your message has been captured for demo purposes.';
      contactForm.reset();
    });
  }
});
