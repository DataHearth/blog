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
  // * Fixes the children length being 0 when the search input is focused
  // * due to initial value (DOM loading) being empty
  const searchList = document.getElementById("search-list");

  if (searchList.children.length === 0) return;
  searchList.classList.remove("hidden");
});
searchInput.addEventListener("focusout", (ev) => {
  /**
   * @type {HTMLElement | null}
   */
  const target = ev.relatedTarget;
  if (target && target.closest(`#${searchList.id}`) === searchList) return;

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
