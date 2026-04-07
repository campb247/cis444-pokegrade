const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: './backend/config/.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
const regradeRoutes = require('./routes/regrade');
const snipeRoutes = require('./routes/snipe');
const cardsRoutes = require('./routes/cards');

app.use('/api/regrade', regradeRoutes);
app.use('/api/snipe', snipeRoutes);
app.use('/api/cards', cardsRoutes);

// Serve frontend for any unmatched route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`PokéGrade server running on http://localhost:${PORT}`);
});
