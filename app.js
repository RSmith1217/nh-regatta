const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw8ODeoHIgss_rHIJAeGeRooXDmZKF7qbI2Cyqm631uUZPITYKJoMds6TBWxVWvVlQp/exec";

const races = [
  {
    heat: 1,
    boats: [
      { id: "michael-jackson", name: "Michael Jackson", crew: ["Eric Loskant", "Allison Reilly"], color: "#d31818" },
      { id: "artemis-3", name: "Artemis 3", crew: ["Bhargave Choudhary", "Mazin Eltahan"], color: "#244f91" }
    ]
  },
  {
    heat: 2,
    boats: [
      { id: "minecraft", name: "Minecraft", crew: ["Matty Jin", "Patrick O'Dea"], color: "#10c52a" },
      { id: "top-gun", name: "TOP GUN", crew: ["Silas Haperni", "Matt Russo"], color: "#1229ff" }
    ]
  },
  {
    heat: 3,
    boats: [
      { id: "star-wars", name: "STAR WARS", crew: ["Chase Gundersen", "Jack Fein"], color: "#098516" },
      { id: "bucees", name: "Buc'ees", crew: ["JBJ", "Alex Millian"], color: "#ff9100" }
    ]
  },
  {
    heat: 4,
    boats: [
      { id: "world-cup", name: "WORLD CUP", crew: ["Nina Mahle", "Mary Brusselback"], color: "#ff9100" },
      { id: "octonauts", name: "OCTONAUTS", crew: ["Abby Backos", "Genevieve Henry"], color: "#2d2d2d" }
    ]
  },
  {
    heat: 5,
    boats: [
      { id: "penn-state", name: "PENN STATE", crew: ["Mika Ferrales", "Quinn Sureda"], color: "#1027ff" },
      { id: "burger-king", name: "BURGER KING", crew: ["Matt Barantes", "Levi Stringham"], color: "#bd8b00" }
    ]
  },
  {
    heat: 6,
    boats: [
      { id: "edmund-fitzgerald", name: "Edmund Fitzgerald", crew: ["Auggie Ratner", "Mark Ruffolo"], color: "#d31818" },
      { id: "ocean-corals", name: "Ocean Corals", crew: ["Sammy Apostolou", "Luke Gurkovic"], color: "#f4ad6c" }
    ]
  }
];

const demoBets = [
  { name: "Commissioner Al", boatId: "minecraft", heat: 2, wager: 50, note: "Blocky hull. Questionable hydrodynamics." },
  { name: "Dockside Analyst", boatId: "artemis-3", heat: 1, wager: 35, note: "Space program budget advantage." },
  { name: "Retirement Desk", boatId: "top-gun", heat: 2, wager: 20, note: "Feels aerodynamic." },
  { name: "Pool Reporter", boatId: "ocean-corals", heat: 6, wager: 45, note: "Name suggests water experience." }
];

const storeKeys = {
  bets: "regatta-alpha-bets",
  results: "regatta-alpha-results"
};

const byId = (id) => document.getElementById(id);
const allBoats = races.flatMap((race) => race.boats.map((boat) => ({ ...boat, heat: race.heat })));

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getBets() {
  const bets = readJson(storeKeys.bets, null);
  if (bets) return bets;
  writeJson(storeKeys.bets, demoBets);
  return demoBets;
}

function getResults() {
  return readJson(storeKeys.results, {});
}

function getBoat(boatId) {
  return allBoats.find((boat) => boat.id === boatId);
}

function getTotals() {
  const totals = new Map(allBoats.map((boat) => [boat.id, { picks: 0, wager: 0 }]));
  getBets().forEach((bet) => {
    const current = totals.get(bet.boatId);
    if (!current) return;
    current.picks += 1;
    current.wager += Number(bet.wager) || 0;
  });
  return totals;
}

function impliedOdds(boatId) {
  const totals = getTotals();
  const boatTotal = totals.get(boatId)?.wager || 0;
  const heat = allBoats.find((boat) => boat.id === boatId)?.heat;
  const heatTotal = allBoats
    .filter((boat) => boat.heat === heat)
    .reduce((sum, boat) => sum + (totals.get(boat.id)?.wager || 0), 0);
  if (!heatTotal || !boatTotal) return "+100";
  const share = boatTotal / heatTotal;
  if (share >= 0.5) return `-${Math.round(100 * (share / (1 - share || 0.01)))}`;
  return `+${Math.round(100 * ((1 - share) / share))}`;
}

function renderRaceBoard(filter = "all") {
  const board = byId("race-board-list");
  const template = byId("race-card-template");
  const boatTemplate = byId("boat-template");
  const results = getResults();
  board.innerHTML = "";

  races
    .filter((race) => {
      const decided = Boolean(results[race.heat]);
      return filter === "all" || (filter === "decided" ? decided : !decided);
    })
    .forEach((race) => {
      const card = template.content.firstElementChild.cloneNode(true);
      const label = card.querySelector(".heat-label");
      const matchup = card.querySelector(".matchup");
      const result = results[race.heat];
      label.innerHTML = `<span>Heat ${race.heat}</span>${result ? `<span class="result-pill">Winner: ${getBoat(result.winner)?.name || "Posted"}</span>` : "<span>Open</span>"}`;

      race.boats.forEach((boat) => {
        const boatCard = boatTemplate.content.firstElementChild.cloneNode(true);
        boatCard.dataset.boatId = boat.id;
        boatCard.querySelector(".boat-meta").textContent = `Heat ${race.heat}`;
        boatCard.querySelector(".boat-name").textContent = boat.name;
        boatCard.querySelector(".boat-name").style.color = boat.color;
        boatCard.querySelector(".crew").textContent = boat.crew.join(" / ");
        boatCard.querySelector(".odds").textContent = `Fake odds ${impliedOdds(boat.id)}`;
        boatCard.addEventListener("click", () => selectBoat(boat.id));
        matchup.appendChild(boatCard);
      });

      board.appendChild(card);
    });
}

function populateBoatSelect() {
  const select = byId("boat-pick");
  select.innerHTML = '<option value="">Choose a boat</option>';
  allBoats.forEach((boat) => {
    const option = document.createElement("option");
    option.value = boat.id;
    option.textContent = `Heat ${boat.heat}: ${boat.name}`;
    select.appendChild(option);
  });
}

function selectBoat(boatId) {
  byId("boat-pick").value = boatId;
  document.querySelectorAll(".boat-card").forEach((card) => {
    card.classList.toggle("selected", card.dataset.boatId === boatId);
  });
  byId("slip").scrollIntoView({ behavior: "smooth", block: "center" });
}

async function submitToSheet(bet) {
  if (!GOOGLE_APPS_SCRIPT_URL) return false;

  await fetch(GOOGLE_APPS_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(bet)
  });
  return true;
}

function renderLeaderboard() {
  const container = byId("leaderboard-list");
  const totals = getTotals();
  container.innerHTML = "";

  allBoats
    .map((boat) => ({ ...boat, ...totals.get(boat.id) }))
    .sort((a, b) => b.wager - a.wager || b.picks - a.picks)
    .forEach((boat) => {
      const card = document.createElement("article");
      card.className = "leader-card";
      card.innerHTML = `
        <span class="boat-meta">Heat ${boat.heat}</span>
        <strong style="color:${boat.color}">${boat.name}</strong>
        <span class="leader-stat">${boat.picks} fake pick${boat.picks === 1 ? "" : "s"}</span>
        <span class="leader-stat">${boat.wager} Al Bucks wagered</span>
      `;
      container.appendChild(card);
    });
}

function populateResultsForm() {
  const heatSelect = byId("result-heat");
  heatSelect.innerHTML = "";
  races.forEach((race) => {
    const option = document.createElement("option");
    option.value = String(race.heat);
    option.textContent = `Heat ${race.heat}`;
    heatSelect.appendChild(option);
  });

  heatSelect.addEventListener("change", updateWinnerOptions);
  updateWinnerOptions();
}

function updateWinnerOptions() {
  const heat = Number(byId("result-heat").value);
  const winnerSelect = byId("result-winner");
  const race = races.find((item) => item.heat === heat);
  winnerSelect.innerHTML = "";
  race.boats.forEach((boat) => {
    const option = document.createElement("option");
    option.value = boat.id;
    option.textContent = boat.name;
    winnerSelect.appendChild(option);
  });
}

function renderResults() {
  const results = getResults();
  const container = byId("results-list");
  const entries = Object.entries(results).sort(([a], [b]) => Number(a) - Number(b));

  if (!entries.length) {
    container.innerHTML = "<p class=\"form-note\">No results posted yet. Use this console during the event, or keep results in Google Sheets for the live version.</p>";
    return;
  }

  container.innerHTML = entries.map(([heat, result]) => {
    const boat = getBoat(result.winner);
    const winningBets = getBets().filter((bet) => bet.boatId === result.winner);
    return `
      <div class="result-row">
        <strong>Heat ${heat}: ${boat?.name || "Winner posted"}</strong>
        <span class="leader-stat">Official time: ${result.time || "Not recorded"}</span>
        <span class="leader-stat">${winningBets.length} correct fake pick${winningBets.length === 1 ? "" : "s"}</span>
      </div>
    `;
  }).join("");
}

function bindEvents() {
  byId("bet-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const boat = getBoat(byId("boat-pick").value);
    if (!boat) return;

    const bet = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      name: byId("bettor-name").value.trim(),
      heat: boat.heat,
      boatId: boat.id,
      boatName: boat.name,
      wager: Number(byId("wager").value),
      note: byId("note").value.trim()
    };

    const bets = [bet, ...getBets()];
    writeJson(storeKeys.bets, bets);
    renderLeaderboard();
    renderRaceBoard(document.querySelector(".tool-button.active")?.dataset.filter || "all");

    const posted = await submitToSheet(bet);
    byId("sheet-status").textContent = posted
      ? "Pick saved locally and sent to the Google Sheet."
      : "Pick saved locally for alpha feedback. Google Sheet posting is not configured yet.";
    event.target.reset();
  });

  byId("clear-slip").addEventListener("click", () => {
    byId("bet-form").reset();
    document.querySelectorAll(".boat-card").forEach((card) => card.classList.remove("selected"));
  });

  document.querySelectorAll(".tool-button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".tool-button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderRaceBoard(button.dataset.filter);
    });
  });

  byId("reset-demo").addEventListener("click", () => {
    writeJson(storeKeys.bets, demoBets);
    writeJson(storeKeys.results, {});
    renderRaceBoard();
    renderLeaderboard();
    renderResults();
  });

  byId("result-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const results = getResults();
    const heat = byId("result-heat").value;
    results[heat] = {
      winner: byId("result-winner").value,
      time: byId("result-time").value.trim(),
      postedAt: new Date().toISOString()
    };
    writeJson(storeKeys.results, results);
    byId("result-time").value = "";
    renderResults();
    renderRaceBoard(document.querySelector(".tool-button.active")?.dataset.filter || "all");
  });
}

function init() {
  populateBoatSelect();
  populateResultsForm();
  bindEvents();
  renderRaceBoard();
  renderLeaderboard();
  renderResults();
}

init();
