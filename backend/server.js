// pokegrade express entry point
// serves api endpoints under /api/* and static frontend at /
// run: npm run dev (nodemon) or npm start (plain node)

const express = require('express');
const cors = require('cors');
const path = require('path');

// load env before requiring db.js or psaService.js, both read process.env at import time
// path is relative to where node is launched (project root via npm scripts)
require('dotenv').config({ path: './backend/config/.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// cors enabled wide-open for class scope
// json parser handles api request bodies
// static serves frontend/ at root, css/js/img all relative to that
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// api routers, one per resource
const regradeRoutes = require('./routes/regrade');
const snipeRoutes = require('./routes/snipe');
const cardsRoutes = require('./routes/cards');

app.use('/api/regrade', regradeRoutes);
app.use('/api/snipe', snipeRoutes);
app.use('/api/cards', cardsRoutes);

// SPA-style fallback so deep links into pages/* resolve to index.html
// must come after api routes so /api/* still routes to controllers
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`PokéGrade server running on http://localhost:${PORT}`);
});
