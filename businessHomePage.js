document.addEventListener("DOMContentLoaded", function () {
  const userMenu = document.getElementById("userMenu");
  const userButton = document.getElementById("userButton");
  const logoutBtn = document.getElementById("logoutBtn");
  const managerName = document.getElementById("managerName");
  const menuButton = document.getElementById("menuButton");
  const menuArea = document.getElementById("menuArea");

  let savedBusiness = null;

  try {
    const rawBusiness = localStorage.getItem("estimatorBusinessAuth");
    if (rawBusiness) {
      savedBusiness = JSON.parse(rawBusiness);
    }
  } catch (error) {
    console.error("Error reading business auth from localStorage:", error);
  }

  if (managerName) {
    const actualManagerName =
      savedBusiness?.managerFirstName ||
      savedBusiness?.managerName ||
      savedBusiness?.ownerName ||
      savedBusiness?.owner_name ||
      "";

    managerName.textContent = actualManagerName
      ? `Mg. ${actualManagerName}`
      : "Mg.";
  }

  if (userButton && userMenu) {
    userButton.addEventListener("click", function (e) {
      e.stopPropagation();
      userMenu.classList.toggle("active");
    });

    document.addEventListener("click", function (e) {
      if (!userMenu.contains(e.target)) {
        userMenu.classList.remove("active");
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem("estimatorBusinessAuth");
      window.location.href = "businessLogin.html";
    });
  }

  if (menuButton && menuArea) {
    menuButton.addEventListener("click", function () {
      menuArea.classList.toggle("open");
    });
  }
});