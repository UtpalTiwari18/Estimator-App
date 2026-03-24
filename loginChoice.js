(function () {
  const menuButton = document.getElementById("menuButton");
  const menuArea = document.getElementById("menuArea");

  const customerLoginCard = document.getElementById("customerLoginCard");
  const businessLoginCard = document.getElementById("businessLoginCard");

  if (menuButton && menuArea) {
    menuButton.addEventListener("click", function () {
      menuArea.classList.toggle("active");
    });
  }

  if (customerLoginCard) {
    customerLoginCard.addEventListener("click", function () {
      window.location.href = "customerLogin.html";
    });
  }

  if (businessLoginCard) {
    businessLoginCard.addEventListener("click", function () {
      window.location.href = "businessLogin.html";
    });
  }
})();