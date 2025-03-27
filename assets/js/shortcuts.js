document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.querySelectorAll(".shortcut-item");
  navbar.forEach((item) => {
    const url = item.getAttribute("href");
    if (!url) {
      console.warn("No URL found for shortcut item");
      return;
    }

    const shortcut = item.textContent.trim().charAt(0).toLowerCase();
    document.addEventListener("keypress", (e) => {
      if (e.key === shortcut) {
        window.location.href = url;
      } else if (e.key === "i") {
        document.getElementById("search").focus();
      }
    });
  });
});
