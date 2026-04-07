# PokéGrade ReGrader

A web application that analyzes PSA 9 graded Pokémon cards to determine their potential for receiving a PSA 10 grade.

## Team
**CIS 444 – Web Programming | Spring 2026 | Final Group 14**
- Kaden Campbell
- Camilo Ocampo
- Timothy Tran

## Features
- **Regrade**: Upload a card image or enter a PSA certification number to analyze centering, corners, edges, and surface
- **Snipe**: Search eBay for PSA 9 cards with regrade potential
- **Suggested Cards**: Browse cards with the highest PSA 9→10 price difference

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js + Express |
| Database | MySQL |
| External APIs | PSA API, eBay API |

## Getting Started

### Prerequisites
- Node.js v18+
- MySQL 8+

### Installation
```bash
git clone https://github.com/YOUR_USERNAME/pokegrade.git
cd pokegrade
npm install
cp backend/config/.env.example backend/config/.env
# Fill in your API keys and DB credentials in .env
npm run dev
```

## Project Structure
```
pokegrade/
├── frontend/
│   ├── index.html          # Home page
│   ├── pages/
│   │   ├── regrade.html    # Card regrading tool
│   │   └── snipe.html      # eBay card sniper
│   ├── css/style.css
│   └── js/
│       ├── regrade.js
│       └── snipe.js
├── backend/
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── config/
└── database/
    └── schema.sql
```
