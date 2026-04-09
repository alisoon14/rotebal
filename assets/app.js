const tools = [
  { name: "Bosch GBH 2-26", price: 1200, category: "drill", available: true, popularity: 90 },
  { name: "Makita BO6050J", price: 900, category: "grind", available: true, popularity: 84 },
  { name: "STIHL MS 180", price: 1100, category: "garden", available: false, popularity: 79 },
  { name: "DeWALT DWD024", price: 800, category: "drill", available: true, popularity: 73 },
  { name: "Makita GA5030", price: 700, category: "cut", available: true, popularity: 68 },
  { name: "Husqvarna 135 Mark II", price: 1300, category: "garden", available: true, popularity: 81 }
];

function toolCard(tool) {
  return `
    <article class="tool-card">
      <div class="tool-image">${tool.category}</div>
      <h3>${tool.name}</h3>
      <p>${tool.price.toLocaleString("ru-RU")} руб/сутки</p>
      <p>${tool.available ? "В наличии" : "Нет в наличии"}</p>
      <a class="btn btn-sm" href="./tool.html">Подробнее</a>
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

  function render() {
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

    count.textContent = `Найдено инструментов: ${filtered.length}`;
    grid.innerHTML = filtered.map(toolCard).join("");
  }

  [searchInput, categoryFilter, availabilityFilter, sortFilter].forEach((el) => {
    el.addEventListener("input", render);
    el.addEventListener("change", render);
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

initCatalogPage();
initCheckoutPage();
