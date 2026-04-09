const tools = [
  { name: "Bosch GBH 2-26", price: 1200, category: "drill", available: true, popularity: 90 },
  { name: "Makita BO6050J", price: 900, category: "grind", available: false, popularity: 84 },
  { name: "STIHL MS 180", price: 1100, category: "garden", available: false, popularity: 79 },
  { name: "DeWALT DWD024", price: 800, category: "drill", available: true, popularity: 73 },
  { name: "Makita GA5030", price: 700, category: "cut", available: false, popularity: 68 },
  { name: "Husqvarna 135 Mark II", price: 1300, category: "garden", available: true, popularity: 81 }
];

const FAVORITES_KEY = "webrent:favorites";
const THEME_KEY = "webrent:theme";

function loadFavorites() {
  try {
    return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

let favorites = loadFavorites();

function saveFavorites() {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
}

function toolCard(tool) {
  const isFavorite = favorites.has(tool.name);
  return `
    <article class="tool-card">
      <button
        class="favorite-btn ${isFavorite ? "is-active" : ""}"
        type="button"
        data-favorite="${tool.name}"
        aria-label="${isFavorite ? "Убрать из избранного" : "Добавить в избранное"}"
        title="${isFavorite ? "Убрать из избранного" : "Добавить в избранное"}"
      >
        ${isFavorite ? "★" : "☆"}
      </button>
      <img class="tool-image" src="./assets/images/placeholder.svg" alt="Заглушка изображения: ${tool.name}" />
      <h3>${tool.name}</h3>
      <p>${tool.price.toLocaleString("ru-RU")} руб/сутки</p>
      <p>${tool.available ? "В наличии" : "Нет в наличии"}</p>
      <div class="card-actions">
        <button class="btn btn-sm btn-ghost quick-view-btn" type="button" data-quick-view="${tool.name}">Быстрый просмотр</button>
        <a class="btn btn-sm" href="./tool.html">Подробнее</a>
      </div>
    </article>
  `;
}

function initCatalogPage() {
  const grid = document.getElementById("catalogGrid");
  if (!grid) return;

  const count = document.getElementById("catalogCount");
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const availabilityFilter = document.getElementById("availabilityFilter");
  const sortFilter = document.getElementById("sortFilter");
  const resultWrap = grid.parentElement;
  const status = document.createElement("div");
  status.id = "catalogStatus";
  status.className = "catalog-status";
  resultWrap.insertBefore(status, grid);

  function setLoadingState() {
    status.innerHTML = '<span class="loader-dot" aria-hidden="true"></span> Загружаем инструменты...';
    grid.innerHTML = "";
  }

  function setEmptyState() {
    status.textContent = "Ничего не найдено. Попробуйте изменить фильтры или поиск.";
    grid.innerHTML = "";
  }

  function closeQuickView() {
    const modal = document.getElementById("quickViewModal");
    if (modal) modal.remove();
  }

  function openQuickView(tool) {
    closeQuickView();
    const modal = document.createElement("div");
    modal.id = "quickViewModal";
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal-card" role="dialog" aria-modal="true" aria-label="Быстрый просмотр">
        <button type="button" class="modal-close" data-close-modal aria-label="Закрыть">×</button>
        <img class="tool-image" src="./assets/images/placeholder.svg" alt="Заглушка изображения: ${tool.name}" />
        <h3>${tool.name}</h3>
        <p><strong>Цена:</strong> ${tool.price.toLocaleString("ru-RU")} руб/сутки</p>
        <p><strong>Статус:</strong> ${tool.available ? "В наличии" : "Нет в наличии"}</p>
        <p><strong>Категория:</strong> ${tool.category}</p>
        <a class="btn btn-sm" href="./tool.html">Перейти на страницу инструмента</a>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener("click", (event) => {
      if (event.target === modal || event.target.closest("[data-close-modal]")) {
        closeQuickView();
      }
    });
  }

  function render() {
    setLoadingState();
    const search = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;
    const availability = availabilityFilter.value;
    const sort = sortFilter.value;

    let filtered = tools.filter((tool) => {
      const bySearch = tool.name.toLowerCase().includes(search);
      const byCategory = category === "all" ? true : tool.category === category;
      const byAvailability = availability === "all" ? true : tool.available;
      return bySearch && byCategory && byAvailability;
    });

    if (sort === "priceAsc") {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sort === "priceDesc") {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    } else {
      filtered = [...filtered].sort((a, b) => b.popularity - a.popularity);
    }

    setTimeout(() => {
      count.textContent = `Найдено инструментов: ${filtered.length}`;
      if (!filtered.length) {
        setEmptyState();
        return;
      }
      status.textContent = "";
      grid.innerHTML = filtered.map(toolCard).join("");
    }, 250);
  }

  [searchInput, categoryFilter, availabilityFilter, sortFilter].forEach((el) => {
    el.addEventListener("input", render);
    el.addEventListener("change", render);
  });

  grid.addEventListener("click", (event) => {
    const favoriteButton = event.target.closest("[data-favorite]");
    if (favoriteButton) {
      const name = favoriteButton.getAttribute("data-favorite");
      if (favorites.has(name)) {
        favorites.delete(name);
      } else {
        favorites.add(name);
      }
      saveFavorites();
      render();
      return;
    }

    const quickViewButton = event.target.closest("[data-quick-view]");
    if (quickViewButton) {
      const name = quickViewButton.getAttribute("data-quick-view");
      const tool = tools.find((item) => item.name === name);
      if (tool) openQuickView(tool);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeQuickView();
  });

  render();
}

function initCheckoutPage() {
  const form = document.getElementById("checkoutForm");
  if (!form) return;

  const status = document.getElementById("checkoutStatus");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.textContent = "Заявка принята. Мы свяжемся с вами в ближайшее время.";
    form.reset();
  });
}

function initGlobalUi() {
  const body = document.body;
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "light") {
    body.classList.add("theme-light");
  }

  const headerRow = document.querySelector(".header-row");
  if (headerRow) {
    const themeBtn = document.createElement("button");
    themeBtn.type = "button";
    themeBtn.className = "btn btn-sm btn-ghost theme-toggle-btn";
    const setThemeLabel = () => {
      themeBtn.textContent = body.classList.contains("theme-light") ? "Темная тема" : "Светлая тема";
    };
    setThemeLabel();
    themeBtn.addEventListener("click", () => {
      body.classList.toggle("theme-light");
      localStorage.setItem(THEME_KEY, body.classList.contains("theme-light") ? "light" : "dark");
      setThemeLabel();
    });
    headerRow.appendChild(themeBtn);
  }

  const backToTopBtn = document.createElement("button");
  backToTopBtn.type = "button";
  backToTopBtn.className = "back-to-top";
  backToTopBtn.textContent = "⬆";
  backToTopBtn.setAttribute("aria-label", "Прокрутить наверх");
  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  document.body.appendChild(backToTopBtn);

  const toggleBackToTopVisibility = () => {
    backToTopBtn.classList.toggle("is-visible", window.scrollY > 300);
  };
  window.addEventListener("scroll", toggleBackToTopVisibility);
  toggleBackToTopVisibility();
}

initGlobalUi();
initCatalogPage();
initCheckoutPage();
