const works = window.CONTEMPORARTE_WORKS;
const whatsappBase = "https://wa.me/5522997414490";

const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => [...document.querySelectorAll(selector)];

const grid = qs("#works-grid");
const exhibitionGrid = qs("#exhibition-grid");
const wall = qs("#virtual-wall");
const modal = qs("#work-modal");
const loadMore = qs("#load-more");
const filterState = {
  series: "todas",
  type: "todas",
  period: "todas"
};
let currentWorks = [];
let visibleCount = 24;

function imageFileName(src) {
  return src.split("/").pop();
}

function imageCandidates(src) {
  const file = imageFileName(src);
  return [
    `assets/img/pablo/${file}`,
    `./assets/img/pablo/${file}`,
    `../assets/img/pablo/${file}`,
    `galeria-contemporarte-local-v2/assets/img/pablo/${file}`
  ];
}

function attachImageFallback(img, src) {
  const candidates = imageCandidates(src);
  let attempt = 0;
  img.onerror = () => {
    attempt += 1;
    if (attempt < candidates.length) {
      img.src = candidates[attempt];
      return;
    }
    img.onerror = null;
  };
  img.src = candidates[attempt];
}

function interestLink(work) {
  const message = `Olá, vim pelo site da Galeria Contemporarte e tenho interesse na obra "${work.title}", de ${work.artist}.`;
  return `${whatsappBase}?text=${encodeURIComponent(message)}`;
}

function periodFor(work) {
  const year = Number.parseInt(work.year, 10);
  if (Number.isNaN(year)) return "sem-data";
  if (year >= 2020) return "2020";
  if (year >= 2015) return "2015";
  return "antes-2015";
}

function sortYear(work) {
  if (work.sortOrder) return work.sortOrder;
  const matches = String(work.year).match(/\d{4}/g);
  if (!matches) return 0;
  return Math.max(...matches.map((year) => Number.parseInt(year, 10)));
}

function workPriority(work) {
  if (work.series === "GENOMA" && work.category === "pintura") return 3;
  if (["pintura", "desenho", "jardim"].includes(work.category)) return 2;
  if (["fotoarte", "efemera"].includes(work.category)) return 0;
  return 1;
}

function uniqueSorted(items) {
  return [...new Set(items.filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function fillSelect(select, items) {
  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.value;
    option.textContent = item.label;
    select.appendChild(option);
  });
}

function categoryLabel(category) {
  const labels = {
    acervo: "Acervo",
    ceramica: "Cerâmica",
    desenho: "Desenho",
    efemera: "Arte efêmera",
    escultura: "Escultura / objeto",
    fotoarte: "Fotoarte",
    objeto: "Objeto / escultura",
    pintura: "Pintura",
    jardim: "Obra para jardim"
  };
  return labels[category] || category;
}

function workCard(work) {
  const card = document.createElement("article");
  card.className = "work-card";
  card.dataset.category = work.category;
  card.innerHTML = `
    <button class="work-button" type="button" aria-label="Abrir ${work.title}">
      <span class="work-frame">
        <span class="work-mat">
          <img alt="${work.title}" loading="lazy" decoding="async" />
        </span>
      </span>
      <span class="work-info">
        <span class="work-label">${work.label} · ${work.year}</span>
        <strong>${work.title}</strong>
        <span>${work.series}</span>
      </span>
    </button>
  `;
  attachImageFallback(card.querySelector("img"), work.image);
  card.querySelector("button").addEventListener("click", () => openWork(work));
  return card;
}

function wallFrame(work, index) {
  const item = document.createElement("button");
  item.className = `wall-frame wall-frame-${index + 1}`;
  item.type = "button";
  item.innerHTML = `<img alt="${work.title}" loading="lazy" decoding="async" /><span>${work.title}</span>`;
  attachImageFallback(item.querySelector("img"), work.image);
  item.addEventListener("click", () => openWork(work));
  return item;
}

function renderWorks() {
  grid.innerHTML = "";
  const artWorks = works.filter((work) => work.category !== "exposicao");
  currentWorks = artWorks.filter((work) => {
    const matchesSeries = filterState.series === "todas" || work.series === filterState.series;
    const matchesType = filterState.type === "todas" || work.category === filterState.type;
    const matchesPeriod = filterState.period === "todas" || periodFor(work) === filterState.period;
    return matchesSeries && matchesType && matchesPeriod;
  }).sort((a, b) => workPriority(b) - workPriority(a) || sortYear(b) - sortYear(a));
  visibleCount = 24;
  renderVisibleWorks();
}

function renderVisibleWorks() {
  grid.innerHTML = "";
  currentWorks.slice(0, visibleCount).forEach((work) => grid.appendChild(workCard(work)));
  loadMore.hidden = visibleCount >= currentWorks.length;
  if (!currentWorks.length) {
    grid.innerHTML = `<p class="empty-state">Nenhuma obra encontrada com estes filtros.</p>`;
  }
}

function renderExhibitions() {
  exhibitionGrid.innerHTML = "";
  const exhibitionWorks = works
    .filter((work) => work.category === "exposicao")
    .sort((a, b) => sortYear(a) - sortYear(b));
  if (!exhibitionWorks.length) {
    exhibitionGrid.innerHTML = `
      <article class="exhibition-note">
        <h3>Registros a inserir</h3>
        <p>As fotos corretas da exposição Genoma no Centro Cultural dos Correios e da fachada da rua Ipiranga serão adicionadas aqui quando forem separadas do acervo.</p>
      </article>
    `;
    return;
  }
  exhibitionWorks.forEach((work) => exhibitionGrid.appendChild(workCard(work)));
  [
    {
      title: "MAM-RJ",
      subtitle: "Novas Aquisições 2012/2014 - Coleção Gilberto Chateaubriand",
      note: "Em breve as obras"
    },
    {
      title: "Carrousel du Louvre",
      subtitle: "2014 - Heloiza Azevedo / Heclectik-Art Galerie",
      note: "Em breve as obras"
    }
  ].forEach((item) => {
    const card = document.createElement("article");
    card.className = "upcoming-exhibition";
    card.innerHTML = `
      <span>Outras exposições</span>
      <h3>${item.title}</h3>
      <p>${item.subtitle}</p>
      <strong>${item.note}</strong>
    `;
    exhibitionGrid.appendChild(card);
  });
}

function renderWall() {
  wall.innerHTML = "";
  const featured = works
    .filter((work) => work.series === "GENOMA" && work.category === "pintura")
    .sort((a, b) => sortYear(b) - sortYear(a));
  featured.slice(0, 10).forEach((work, index) => wall.appendChild(wallFrame(work, index)));
}

function openWork(work) {
  const modalImage = qs("#modal-image");
  modalImage.alt = work.title;
  attachImageFallback(modalImage, work.image);
  qs("#modal-title").textContent = work.title;
  qs("#modal-category").textContent = `${work.artist} · ${work.label}`;
  qs("#modal-description").textContent = work.description;
  qs("#modal-whatsapp").href = interestLink(work);
  qs("#modal-meta").innerHTML = `
    <div><dt>Ano</dt><dd>${work.year}</dd></div>
    <div><dt>Técnica</dt><dd>${work.technique}</dd></div>
    <div><dt>Dimensões</dt><dd>${work.dimensions}</dd></div>
    <div><dt>Status</dt><dd>${work.status}</dd></div>
    <div><dt>Valor</dt><dd>${work.price}</dd></div>
  `;
  modal.showModal();
}

function setupFilters() {
  const artWorks = works.filter((work) => work.category !== "exposicao");
  const seriesSelect = qs("#series-filter");
  const typeSelect = qs("#type-filter");
  const periodSelect = qs("#period-filter");
  const clearButton = qs("#clear-filters");

  fillSelect(seriesSelect, uniqueSorted(artWorks.map((work) => work.series)).map((series) => ({ value: series, label: series })));
  fillSelect(typeSelect, uniqueSorted(artWorks.map((work) => work.category)).map((category) => ({ value: category, label: categoryLabel(category) })));

  [
    [seriesSelect, "series"],
    [typeSelect, "type"],
    [periodSelect, "period"]
  ].forEach(([select, key]) => {
    select.addEventListener("change", () => {
      filterState[key] = select.value;
      renderWorks();
    });
  });

  clearButton.addEventListener("click", () => {
    filterState.series = "todas";
    filterState.type = "todas";
    filterState.period = "todas";
    seriesSelect.value = "todas";
    typeSelect.value = "todas";
    periodSelect.value = "todas";
    renderWorks();
  });
}

function setupLoadMore() {
  loadMore.addEventListener("click", () => {
    visibleCount += 24;
    renderVisibleWorks();
  });
}

function setupModal() {
  qs(".modal-close").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.close();
  });
}

function setupMenu() {
  const toggle = qs(".menu-toggle");
  const menu = qs("#main-menu");
  const closeMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    menu.classList.remove("open");
  };

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    menu.classList.toggle("open", !expanded);
  });

  qsa("#main-menu a").forEach((link) => link.addEventListener("click", closeMenu));
}

function setupHeader() {
  const header = qs(".site-header");
  const update = () => header.dataset.scrolled = String(window.scrollY > 20);
  update();
  window.addEventListener("scroll", update, { passive: true });
}

function setupTheme() {
  const toggle = qs(".theme-toggle");
  const saved = localStorage.getItem("contemporarte-theme") || "light";
  document.body.dataset.theme = saved;
  toggle.addEventListener("click", () => {
    const next = document.body.dataset.theme === "dark" ? "light" : "dark";
    document.body.dataset.theme = next;
    localStorage.setItem("contemporarte-theme", next);
  });
}

function setupHeroSlideshow() {
  const heroImage = qs("#hero-image");
  const slides = [
    "assets/img/pablo/12.1.png",
    "assets/img/pablo/5.1.png",
    "assets/img/pablo/7.1.png",
    "assets/img/pablo/10.1.png",
    "assets/img/pablo/33.png"
  ];
  let index = 0;
  attachImageFallback(heroImage, slides[index]);
  setInterval(() => {
    index = (index + 1) % slides.length;
    heroImage.classList.add("fade-out");
    window.setTimeout(() => {
      attachImageFallback(heroImage, slides[index]);
      heroImage.classList.remove("fade-out");
    }, 260);
  }, 3800);
}

renderWorks();
renderExhibitions();
renderWall();
setupFilters();
setupLoadMore();
setupModal();
setupMenu();
setupHeader();
setupTheme();
setupHeroSlideshow();
