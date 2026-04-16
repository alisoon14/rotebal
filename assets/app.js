const tools = [
  { name: "Bosch GBH 2-26", price: 1200, deposit: 6000, category: "drill", available: true, popularity: 90, image: "./assets/images/Bosch_GBH_2-26jpg.jpg"},
  { name: "Makita BO6050J", price: 900, deposit: 4500, category: "grind", available: false, popularity: 84, image: "./assets/images/Makita_BO6050J.jpg"},
  { name: "STIHL MS 180", price: 1100, deposit: 5000, category: "garden", available: false, popularity: 79, image: "./assets/images/STIHL_MS_180.jpg" },
  { name: "DeWALT DWD024", price: 800, deposit: 3500, category: "drill", available: true, popularity: 73, image:"./assets/images/DeWALT_DWD024.jpg" },
  { name: "Makita GA5030", price: 700, deposit: 3000, category: "cut", available: false, popularity: 68,image:"./assets/images/makita_ga5030.jpg" },
  { name: "Husqvarna 135 Mark II", price: 1300, deposit: 6200, category: "garden", available: true, popularity: 81,image: "./assets/images/Husqvarna_135.jpg" }
];

const FAVORITES_KEY = "webrent:favorites";
const THEME_KEY = "webrent:theme";
const ORDERS_KEY = "webrent:orders";

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
      <img
        class="tool-image"
        src="${tool.image || "./assets/images/placeholder.svg"}"
        alt="Фото инструмента ${tool.name}"
      />
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
        <img
          class="tool-image"
          src="${tool.image || "./assets/images/placeholder.svg"}"
          alt="Фото инструмента ${tool.name}"
        />
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
  const thankYouScreen = document.getElementById("thankYouScreen");
  const startDateInput = form.querySelector('input[name="startDate"]');
  const endDateInput = form.querySelector('input[name="endDate"]');
  const qtyInput = form.querySelector('input[name="qty"]');
  const toolInput = form.querySelector('input[name="tool"]');
  const phoneInput = form.querySelector('input[name="phone"]');
  const dailyPriceText = document.getElementById("dailyPriceText");
  const depositText = document.getElementById("depositText");
  const rentalDaysText = document.getElementById("rentalDaysText");
  const totalCostText = document.getElementById("totalCostText");

  function normalizeDate(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function diffDays(startDate, endDate) {
    const millisPerDay = 1000 * 60 * 60 * 24;
    return Math.floor((endDate - startDate) / millisPerDay) + 1;
  }

  function getSelectedTool() {
    const byName = tools.find((item) => item.name === toolInput.value.trim());
    return byName || tools[0];
  }

  function formatCurrency(value) {
    return `${Math.max(0, value).toLocaleString("ru-RU")} руб`;
  }

  function isDateRangeValid() {
    if (!startDateInput.value || !endDateInput.value) return false;
    const start = normalizeDate(startDateInput.value);
    const end = normalizeDate(endDateInput.value);
    return end >= start;
  }

  function getRentalDays() {
    if (!isDateRangeValid()) return 0;
    return diffDays(normalizeDate(startDateInput.value), normalizeDate(endDateInput.value));
  }

  function updateCostSummary() {
    const currentTool = getSelectedTool();
    const qty = Math.max(1, Number(qtyInput.value) || 1);
    const days = getRentalDays();
    const baseCost = days * currentTool.price * qty;
    const total = baseCost + currentTool.deposit;

    dailyPriceText.textContent = formatCurrency(currentTool.price);
    depositText.textContent = formatCurrency(currentTool.deposit);
    rentalDaysText.textContent = `${days} ${days === 1 ? "сутки" : "суток"}`;
    totalCostText.textContent = formatCurrency(total);
  }

  function setFieldError(input, message) {
    input.setCustomValidity(message);
    if (message) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  }

  function applyPhoneMask(value) {
    const digits = value.replace(/\D/g, "").replace(/^8/, "7");
    const normalized = digits.startsWith("7") ? digits : `7${digits}`;
    const limited = normalized.slice(0, 11);

    let result = "+7";
    if (limited.length > 1) result += ` (${limited.slice(1, 4)}`;
    if (limited.length >= 4) result += ")";
    if (limited.length > 4) result += ` ${limited.slice(4, 7)}`;
    if (limited.length > 7) result += `-${limited.slice(7, 9)}`;
    if (limited.length > 9) result += `-${limited.slice(9, 11)}`;
    return result;
  }

  function isPhoneValid(value) {
    return /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(value);
  }

  function validateDates() {
    const hasStart = Boolean(startDateInput.value);
    const hasEnd = Boolean(endDateInput.value);
    if (!hasStart || !hasEnd) {
      setFieldError(endDateInput, "");
      return;
    }
    if (!isDateRangeValid()) {
      setFieldError(endDateInput, "Дата окончания не может быть раньше даты начала.");
    } else {
      setFieldError(endDateInput, "");
    }
  }

  function saveOrderLocal(order) {
    try {
      const existing = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
      existing.push(order);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(existing));
    } catch {
      status.textContent = "Не удалось сохранить заявку локально.";
    }
  }

  [startDateInput, endDateInput, qtyInput, toolInput].forEach((input) => {
    input.addEventListener("input", () => {
      validateDates();
      updateCostSummary();
    });
    input.addEventListener("change", () => {
      validateDates();
      updateCostSummary();
    });
  });

  phoneInput.addEventListener("input", () => {
    phoneInput.value = applyPhoneMask(phoneInput.value);
    setFieldError(phoneInput, isPhoneValid(phoneInput.value) ? "" : "Введите номер в формате +7 (999) 123-45-67.");
  });

  updateCostSummary();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    validateDates();
    updateCostSummary();

    if (!isPhoneValid(phoneInput.value)) {
      setFieldError(phoneInput, "Введите номер в формате +7 (999) 123-45-67.");
    } else {
      setFieldError(phoneInput, "");
    }

    if (!form.reportValidity()) return;

    const tool = getSelectedTool();
    const rentalDays = getRentalDays();
    const qty = Math.max(1, Number(qtyInput.value) || 1);
    const selectedFulfillment = form.querySelector('input[name="fulfillment"]:checked')?.value || "pickup";
    const orderPayload = {
      toolName: tool.name,
      startDate: startDateInput.value,
      endDate: endDateInput.value,
      quantity: qty,
      customerName: form.querySelector('input[name="name"]').value.trim(),
      phone: phoneInput.value,
      comment: form.querySelector('textarea[name="comment"]').value.trim(),
      fulfillment: selectedFulfillment,
      totalCost: rentalDays * tool.price * qty + tool.deposit
    };

    saveOrderLocal({ id: Date.now(), ...orderPayload });
    status.textContent = "Заявка принята. Мы свяжемся с вами в ближайшее время.";

    form.hidden = true;
    thankYouScreen.hidden = false;
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
