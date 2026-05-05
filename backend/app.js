// backend/app.js

const express = require('express');
const cors = require('cors');

// Load env for local development.
// In AWS Lambda, environment variables come from the Lambda console.
require('dotenv').config({ path: './backend/config/.env' });

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// API routers
const regradeRoutes = require('./routes/regrade');
const snipeRoutes = require('./routes/snipe');
const cardsRoutes = require('./routes/cards');

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'PokéGrade API is running'
  });
});

app.use('/api/regrade', regradeRoutes);
app.use('/api/snipe', snipeRoutes);
app.use('/api/cards', cardsRoutes);

module.exports = app;