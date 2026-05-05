# PokéGrade ReGrader

A web application that analyzes PSA 9 graded Pokémon cards to determine their potential for receiving a PSA 10 grade.

## Team
**CIS 444 - Web Programming | Spring 2026 | Final Group 14**
- Kaden Campbell
- Camilo Ocampo
- Timothy Tran

## Features
- **Regrade**: enter a PSA certification number to fetch card details and image, then use the canvas-based centering checker to drag 8 guide lines and get a PSA 10 likelihood verdict. Manual image upload also supported.
- **Snipe**: browse a curated set of PSA 9 listings, filterable by card name, with one-click handoff to the regrade analyzer.
- **Suggested Cards**: homepage grid of cards with the biggest PSA 9 to PSA 10 price upside, click any card to jump straight into a regrade analysis.

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, vanilla JavaScript |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| External APIs | PSA Public API |

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL 14+
- A PSA Public API token (free, register at https://www.psacard.com/publicapi)

### 1. Clone and install dependencies
```bash
git clone https://github.com/campb247/cis444-pokegrade.git
cd cis444-pokegrade
npm install
```

### 2. Install PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**Windows:**
- Download the installer from https://www.postgresql.org/download/windows/
- Run it and set a password for the `postgres` superuser when prompted (write it down)
- Add `C:\Program Files\PostgreSQL\16\bin` to your PATH so `psql` works in any terminal

### 3. Create the database and load the schema
```bash
createdb pokegrade
psql pokegrade -f database/schema.sql
psql pokegrade -f database/seed.sql
```

On Windows, prefix with `-U postgres` and enter the password you set:
```bash
psql -U postgres -c "CREATE DATABASE pokegrade;"
psql -U postgres -d pokegrade -f database/schema.sql
psql -U postgres -d pokegrade -f database/seed.sql
```

### 4. Configure environment variables
```bash
cp backend/config/.env.example backend/config/.env
```

Edit `backend/config/.env` with your values:
- **macOS Homebrew Postgres**: `DB_USER` is your system username, leave `DB_PASSWORD` blank
- **Windows Postgres**: `DB_USER=postgres`, `DB_PASSWORD` is the one you set during install
- **PSA_ACCESS_TOKEN**: your personal token from PSA's developer portal (do not share with teammates, each person should generate their own)

### 5. Run the dev server
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Troubleshooting
- **`permission denied` on `npm run dev`**: delete and reinstall dependencies with `rm -rf node_modules && npm install`
- **`EADDRINUSE` on port 3000**: another process is already on the port, find it with `lsof -i :3000` and kill it, or change `PORT` in your `.env`
- **`Card not found` on every PSA lookup**: check that `PSA_ACCESS_TOKEN` is set correctly and not expired

## Project Structure
```
cis444-pokegrade/
├── frontend/
│   ├── index.html              # homepage with hero + suggested cards grid
│   ├── pages/
│   │   ├── regrade.html        # cert lookup + centering checker
│   │   └── snipe.html          # listings browser
│   ├── css/style.css
│   └── js/
│       ├── regrade.js          # cert lookup, canvas centering tool, ?cert= handoff
│       └── snipe.js            # listing fetch and render
├── backend/
│   ├── server.js               # express entry, mounts routes and static files
│   ├── routes/                 # one router per resource (cards, regrade, snipe)
│   ├── controllers/            # request handlers
│   ├── services/               # external api wrappers (PSA)
│   ├── models/                 # postgres data access
│   └── config/
│       ├── db.js               # pg connection pool
│       └── .env.example        # template for local .env
└── database/
    ├── schema.sql              # cards table definition
    └── seed.sql                # 8 popular cards with sample prices
```
