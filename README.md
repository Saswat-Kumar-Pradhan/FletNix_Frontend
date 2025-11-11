# FletNix: What to Watch

FletNix is a Netflix-inspired web application that helps users discover movies and TV shows, see IMDb ratings, read reviews, and explore recommendations. It includes user authentication, search, filters, and age-restricted content.

---

## 🚀 Live Demo

[View the live app](https://fletnixsaswat.vercel.app/)

---

## 📂 Features

### User Authentication
- Register and login with email and password (securely hashed)
- Age validation during registration
- Logout functionality

### Shows & Movies
- Browse all shows with pagination (15 items per page)
- Filter by type: Movies or TV Shows
- Age restriction: users under 18 cannot view "R" rated titles
- Search by title or cast
- Show details with description, director, cast, and IMDb rating

### Recommendations
- Genre-based recommendations displayed in a beautiful modal
- Poster images fetched dynamically from OMDb API
- Default poster shown if not available

### UI/UX
- Modern, Netflix-inspired dark theme
- Beautiful login/register modals
- Search bar and genre bubbles styled for easy navigation

---

## 🛠 Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** FastAPI (Python)
- **Database:** MongoDB
- **External API:** OMDb API for movie details and reviews
- **Hosting:** Vercel

---

## 🔗 API Endpoints

- **GET /** - Health check
- **GET /shows** - List all shows (supports search, pagination, filters, age restriction)
- **GET /shows/{show_id}** - Get show details + IMDb rating + recommendations
- **POST /auth/register** - Register a new user
- **POST /auth/login** - Login existing user

---
