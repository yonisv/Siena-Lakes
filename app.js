// Siena Lakes — Landscape Enhancement Tour
// Single-page app. Hash routes: #/, #/zone/<id>, #/conclusion

const root = document.getElementById("app");
const TOUR_SECONDS = 9; // seconds per zone while Tour Mode auto-advances

let state = {
  tourMode: false,
  tourTimer: null,
  tourStart: null,
  tourRAF: null,
};

function zoneById(id) {
  return ZONES.find((z) => z.id === id);
}

function totalPlantCount() {
  return ZONES.reduce((sum, z) => sum + z.plants.length, 0);
}

// ---------- Routing ----------
function parseRoute() {
  const hash = location.hash.replace(/^#\/?/, "");
  if (hash.startsWith("zone/")) {
    const id = parseInt(hash.split("/")[1], 10);
    return { name: "zone", id };
  }
  if (hash === "conclusion") return { name: "conclusion" };
  return { name: "home" };
}

function navigate(hash) {
  location.hash = hash;
}

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", render);

// ---------- Tour mode control ----------
function startTour() {
  state.tourMode = true;
  navigate("/zone/1");
}

function stopTour() {
  state.tourMode = false;
  clearTourTimer();
  render();
}

function clearTourTimer() {
  if (state.tourTimer) { clearTimeout(state.tourTimer); state.tourTimer = null; }
  if (state.tourRAF) { cancelAnimationFrame(state.tourRAF); state.tourRAF = null; }
}

function armTourAdvance(currentZoneId) {
  clearTourTimer();
  state.tourStart = performance.now();
  const fill = document.getElementById("tourBarFill");

  function tick() {
    const elapsed = (performance.now() - state.tourStart) / 1000;
    const pct = Math.min(100, (elapsed / TOUR_SECONDS) * 100);
    if (fill) fill.style.width = pct + "%";
    if (elapsed >= TOUR_SECONDS) {
      const next = currentZoneId + 1;
      if (next <= ZONES.length) navigate("/zone/" + next);
      else navigate("/conclusion");
      return;
    }
    state.tourRAF = requestAnimationFrame(tick);
  }
  state.tourRAF = requestAnimationFrame(tick);
}

// ---------- Render: Home ----------
function renderHome() {
  const zoneCards = ZONES.map(
    (z) => `
    <button class="zone-card" data-nav="/zone/${z.id}">
      <span class="zone-num">ZONE ${z.id} OF ${ZONES.length}</span>
      <h3>${z.name}</h3>
      <p>${z.blurb}</p>
      <span class="zone-count">${z.plants.length} plants →</span>
    </button>`
  ).join("");

  root.innerHTML = `
    <div class="app">
      ${topbar()}
      <div class="view">
        <div class="home-hero">
          <h1>Explore the Plan, Zone by Zone</h1>
          <p>A property-wide planting vision for Siena Lakes — ${totalPlantCount()} plants across six areas of the community. Click any zone to explore, or start the guided tour.</p>
          <div class="tour-cta">
            <button class="btn btn-primary" data-action="start-tour">▶ Start Tour</button>
            <button class="btn btn-secondary" data-nav="/zone/1">Browse Zone 1</button>
          </div>
        </div>
        <div class="zone-grid">${zoneCards}</div>
      </div>
      ${footer()}
    </div>`;
  bindNav();
}

// ---------- Render: Zone ----------
function renderZone(id) {
  const zone = zoneById(id);
  if (!zone) { navigate("/"); return; }

  const cards = zone.plants
    .map(
      (p, i) => `
    <div class="plant-card" data-plant-zone="${zone.id}" data-plant-index="${i}">
      <div class="plant-photo-wrap"><img src="images/${p.img}" alt="${p.common}" loading="lazy"></div>
      <div class="plant-card-body">
        <h4>${p.common}</h4>
        <p class="sci">${p.sci}</p>
        <p class="spec">${p.spec}</p>
        <p class="hi">${p.hi}</p>
      </div>
    </div>`
    )
    .join("");

  const isLast = zone.id === ZONES.length;
  const nextLabel = isLast ? "See Conclusion →" : `Zone ${zone.id + 1}: ${zoneById(zone.id + 1).name} →`;
  const nextHash = isLast ? "/conclusion" : `/zone/${zone.id + 1}`;
  const prevDisabled = zone.id === 1;

  root.innerHTML = `
    <div class="app">
      ${topbar()}
      ${state.tourMode ? tourBanner() : ""}
      <div class="view">
        <div class="zone-header">
          <div class="zone-header-left">
            <span class="zone-tag">Zone ${zone.id} of ${ZONES.length}</span>
            <h2>${zone.name}</h2>
            <p>${zone.blurb}</p>
          </div>
          <button class="back-link" data-nav="/">← All Zones</button>
        </div>
        <div class="plant-grid">${cards}</div>
        <div class="zone-nav">
          <button class="btn btn-secondary" ${prevDisabled ? "disabled style='opacity:0.4;cursor:default;'" : `data-nav="/zone/${zone.id - 1}"`}>← Previous</button>
          <span class="progress">Zone ${zone.id} of ${ZONES.length}</span>
          <button class="btn btn-primary" data-nav="${nextHash}">${nextLabel}</button>
        </div>
      </div>
      ${footer()}
    </div>`;
  bindNav();
  bindPlantCards(zone);

  if (state.tourMode) armTourAdvance(zone.id);
}

// ---------- Render: Conclusion ----------
function renderConclusion() {
  clearTourTimer();
  const recap = ZONES.map(
    (z) => `
    <div class="recap-card" data-nav="/zone/${z.id}">
      <div class="num">ZONE ${z.id}</div>
      <div class="label">${z.name.split(" & ")[0].split(" ").slice(0, 2).join(" ")}</div>
    </div>`
  ).join("");

  root.innerHTML = `
    <div class="app">
      ${topbar()}
      <div class="view">
        <div class="conclusion">
          <span class="tag">The Big Picture</span>
          <h2>One Cohesive Vision for Siena Lakes</h2>
          <p>Several of these plants are intentionally repeated across multiple areas of the property. That repetition is by design — it ties the entrance, the lake, the courtyards, the pool deck, and the perimeter together into one unified look, rather than a disconnected patchwork. The result is a community that feels deliberately and beautifully designed from every vantage point.</p>
          <div class="recap-grid">${recap}</div>
          <div class="conclusion-actions">
            <button class="btn btn-primary" data-nav="/">← Back to All Zones</button>
            <button class="btn btn-secondary" data-action="start-tour">↻ Restart Tour</button>
          </div>
        </div>
      </div>
      ${footer()}
    </div>`;
  bindNav();
  state.tourMode = false;
}

// ---------- Shared chrome ----------
function topbar() {
  return `
    <div class="topbar">
      <div class="topbar-inner">
        <div>
          <div class="brand-label">Yellowstone Landscape</div>
          <div class="brand-title">Siena Lakes Enhancement Tour</div>
        </div>
        <div class="brand-sub">Naples North · Naples, Florida</div>
      </div>
    </div>`;
}

function tourBanner() {
  return `
    <div class="tour-banner">
      <span>▶ TOUR MODE — auto-advancing</span>
      <div class="bar-track"><div class="bar-fill" id="tourBarFill"></div></div>
      <button data-action="stop-tour">Exit Tour</button>
    </div>`;
}

function footer() {
  return `<div class="site-footer">Yellowstone Landscape · Naples North</div>`;
}

// ---------- Event binding ----------
function bindNav() {
  root.querySelectorAll("[data-nav]").forEach((el) => {
    el.addEventListener("click", () => navigate(el.getAttribute("data-nav")));
  });
  root.querySelectorAll('[data-action="start-tour"]').forEach((el) => {
    el.addEventListener("click", startTour);
  });
  root.querySelectorAll('[data-action="stop-tour"]').forEach((el) => {
    el.addEventListener("click", stopTour);
  });
}

function bindPlantCards(zone) {
  root.querySelectorAll("[data-plant-zone]").forEach((el) => {
    el.addEventListener("click", () => {
      const idx = parseInt(el.getAttribute("data-plant-index"), 10);
      openModal(zone.plants[idx]);
    });
  });
}

// ---------- Modal ----------
function openModal(plant) {
  const wasTour = state.tourMode;
  if (wasTour) clearTourTimer(); // pause auto-advance while reading detail

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-card">
      <div class="modal-photo"><img src="${plant.img}" alt="${plant.common}"></div>
      <div class="modal-body">
        <button class="modal-close" data-close>✕</button>
        <h3>${plant.common}</h3>
        <p class="sci">${plant.sci}</p>
        <div class="spec">${plant.spec}</div>
        <p class="hi">${plant.hi}</p>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  function close() {
    overlay.remove();
    if (wasTour && state.tourMode) {
      const r = parseRoute();
      if (r.name === "zone") armTourAdvance(r.id);
    }
  }
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay || e.target.hasAttribute("data-close")) close();
  });
  document.addEventListener(
    "keydown",
    function escHandler(e) {
      if (e.key === "Escape") { close(); document.removeEventListener("keydown", escHandler); }
    }
  );
}

// ---------- Main render dispatch ----------
function render() {
  const route = parseRoute();
  clearTourTimer();
  if (route.name === "zone") renderZone(route.id);
  else if (route.name === "conclusion") renderConclusion();
  else { state.tourMode = false; renderHome(); }
  window.scrollTo(0, 0);
}
