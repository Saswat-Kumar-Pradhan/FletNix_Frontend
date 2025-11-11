const API_BASE = "https://flet-nix-red.vercel.app"; // Change to your deployed FastAPI URL
const OMDB_KEY = "c581aa41";
let currentPage = 1;
let user = null;

// DOM elements
const showsContainer = document.getElementById("showsContainer");
const pageInfo = document.getElementById("pageInfo");
const prevPage = document.getElementById("prevPage");
const nextPage = document.getElementById("nextPage");
const searchInput = document.getElementById("searchInput");
const typeFilter = document.getElementById("typeFilter");
const searchBtn = document.getElementById("searchBtn");
const authSection = document.getElementById("authSection");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const logoutBtn = document.getElementById("logoutBtn");
const closeAuth = document.getElementById("closeAuth");
const authTitle = document.getElementById("authTitle");
const authSubmit = document.getElementById("authSubmit");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const ageInput = document.getElementById("age");

let isRegister = false;

// 🧩 Fetch and display shows
async function loadShows() {
    const search = searchInput.value.trim();
    const type = typeFilter.value;
    const age = user?.age || 25;

    let url = `${API_BASE}/shows?page=${currentPage}&age=${age}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (type) url += `&type=${type}`;

    const res = await fetch(url);
    const data = await res.json();

    showsContainer.innerHTML = "";
    data.results.forEach(async (show) => {
        const card = document.createElement("div");
        card.className = "show-card";

        // Fetch poster from OMDb
        let posterUrl = "https://www.rockettstgeorge.co.uk/cdn/shop/products/no_selection_10186714-2331-4aff-8cb3-ba304bf72172.jpg?v=1683648945";
        try {
            const omdbRes = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(show.title)}&apikey=${OMDB_KEY}`);
            const omdbData = await omdbRes.json();
            if (omdbData.Poster && omdbData.Poster !== "N/A") {
                posterUrl = omdbData.Poster;
            }
        } catch { }

        card.innerHTML = `
    <img src="${posterUrl}" alt="${show.title}">
    <div class="show-info">
      <div class="show-title">${show.title}</div>
      <div class="show-meta">
        ${show.type} • ${show.release_year} • ${show.rating || "NR"}
      </div>
      <div class="show-desc">${show.description || "No description available."}</div>
    </div>
  `;

        // Click to open modal
        card.addEventListener("click", () => openShowModal(show._id));

        showsContainer.appendChild(card);
    });



    pageInfo.textContent = `Page ${data.page}`;
}

// Pagination
prevPage.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        loadShows();
    }
});
nextPage.addEventListener("click", () => {
    currentPage++;
    loadShows();
});

// Search
searchBtn.addEventListener("click", () => {
    currentPage = 1;
    loadShows();
});

// 🧠 Auth modal toggle
loginBtn.addEventListener("click", () => openAuth(false));
registerBtn.addEventListener("click", () => openAuth(true));
logoutBtn.addEventListener("click", logoutUser);
closeAuth.addEventListener("click", () => authSection.classList.add("hidden"));

function openAuth(registerMode) {
    isRegister = registerMode;
    authTitle.textContent = registerMode ? "Register" : "Login";
    ageInput.classList.toggle("hidden", !registerMode);
    authSection.classList.remove("hidden");
}

// 🧾 Login/Register
authSubmit.addEventListener("click", async () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    const age = parseInt(ageInput.value) || null;

    const endpoint = isRegister ? "/auth/register" : "/auth/login";

    let body = { email, password };
    if (isRegister) {
        if (!age) {
            alert("Please enter your age.");
            return;
        }
        body.age = age;
    }

    const query = new URLSearchParams(body).toString();

    const res = await fetch(`${API_BASE}${endpoint}?${query}`, {
        method: "POST",
        headers: { "Accept": "application/json" }
    });

    if (!res.ok) {
        try {
            const errData = await res.json();
            // If FastAPI returns {"detail": "Some message"}
            if (errData.detail) {
                alert(errData.detail);
            } else {
                alert("Authentication failed!");
            }
        } catch (e) {
            alert("Authentication failed!");
        }
        return;
    }


    user = await res.json();
    authSection.classList.add("hidden");
    loginBtn.style.display = "none";
    registerBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    loadShows();
});

// 🚪 Logout
function logoutUser() {
    user = null;
    loginBtn.style.display = "inline-block";
    registerBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    loadShows();
}

// === MODAL HANDLING ===
const showModal = document.getElementById("showModal");
const closeModal = document.getElementById("closeModal");
const modalDetails = document.getElementById("modalDetails");

closeModal.addEventListener("click", () => showModal.classList.add("hidden"));
window.addEventListener("click", (e) => {
    if (e.target === showModal) showModal.classList.add("hidden");
});

async function openShowModal(showId) {
    modalDetails.innerHTML = `
  <div class="modal-loading">
    <div class="spinner"></div>
    <p>Loading show details...</p>
  </div>
`;
    showModal.classList.remove("hidden");

    try {
        const res = await fetch(`${API_BASE}/shows/${showId}`);
        const show = await res.json();

        // 🎬 Fetch poster again from OMDb for better accuracy
        let posterUrl = "https://www.rockettstgeorge.co.uk/cdn/shop/products/no_selection_10186714-2331-4aff-8cb3-ba304bf72172.jpg?v=1683648945";
        try {
            const omdbRes = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(show.title)}&apikey=${OMDB_KEY}`);
            const omdbData = await omdbRes.json();
            if (omdbData.Poster && omdbData.Poster !== "N/A") {
                posterUrl = omdbData.Poster;
            }
            show.imdb_rating = omdbData.imdbRating || "N/A";
        } catch { }

        const recsHTML = show.recommendations?.length
            ? show.recommendations.map(r => `
          <div class="rec-card" data-id="${r._id}">
            <span>${r.title}</span>
          </div>
        `).join("")
            : "<p class='no-recs'>No recommendations available.</p>";

        modalDetails.innerHTML = `
      <div class="modal-header">
        <img src="${posterUrl}" alt="${show.title}">
        <div class="modal-info">
          <h2>${show.title}</h2>
          <div class="modal-meta">${show.type} • ${show.release_year} • ${show.rating || "NR"}</div>
            <p><strong>Genre:</strong></p>
            <div class="genre-bubbles">
            ${show.listed_in
                ? show.listed_in.split(",").map(g => `<span class="genre-tag">${g.trim()}</span>`).join("")
                : `<span class="genre-tag">Unknown</span>`}
            </div> 
          <p><strong>Director:</strong> ${show.director || "N/A"}</p>
          <p><strong>Cast:</strong> ${show.cast || "N/A"}</p>
          <p><strong>IMDb Rating:</strong> ⭐ ${show.imdb_rating}</p>
        </div>
      </div>
      <p class="modal-description">${show.description}</p>
      <div class="recommendations">
        <h3>More like this</h3>
        <div class="recommendations-list">${recsHTML}</div>
      </div>
    `;

        // 🎯 Make recommendations clickable
        document.querySelectorAll(".rec-card").forEach(card => {
            card.addEventListener("click", e => {
                const newId = e.currentTarget.getAttribute("data-id");
                openShowModal(newId);
            });
        });
    } catch (err) {
        modalDetails.innerHTML = `<p>Failed to load details.</p>`;
    }
}


// Initial load
loadShows();
