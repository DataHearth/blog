import * as pagefind from "/pagefind/pagefind.js";

pagefind.init();

/**
  @type {HTMLInputElement | null}
*/
const searchInput = document.getElementById("search");
if (!searchInput) throw new Error("Search input not found");

const searchList = document.getElementById("search-list");
if (!searchList) throw new Error("Search list not found");

searchInput.addEventListener("focusin", () => {
  if (searchList.children.length === 0) return;
  searchList.classList.remove("hidden");
});
searchInput.addEventListener("focusout", () => {
  searchList.classList.add("hidden");
});

searchInput.addEventListener("keyup", async (ev) => {
  searchList.textContent = "";

  const { results } = await pagefind.search(ev.target.value);
  for (const result of results) {
    const oneResult = await result.data();
    const link = document.createElement("a");
    link.href = oneResult.url;
    link.textContent = oneResult.meta.title;
    link.className = "block px-4 py-2 text-sm";
    link.role = "menuitem";
    link.tabIndex = -1;

    searchList.appendChild(link);
  }

  if (searchList.children.length === 0) {
    if (!searchList.classList.contains("hidden"))
      searchList.classList.add("hidden");
    return;
  }
  if (searchList.classList.contains("hidden"))
    searchList.classList.remove("hidden");
});
