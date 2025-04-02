document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.querySelectorAll(".shortcut-item");
  navbar.forEach((item) => {
    const url = item.getAttribute("href");
    if (!url) {
      console.warn("No URL found for shortcut item");
      return;
    }

    const shortcut = item.textContent.trim().charAt(0).toLowerCase();
    document.addEventListener("keyup", (e) => {
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.isContentEditable
      ) {
        return;
      }

      if (e.key === shortcut) {
        window.location.href = url;
      } else if (e.key === "i") {
        document.getElementById("search").focus();
      }
    });
  });
});
