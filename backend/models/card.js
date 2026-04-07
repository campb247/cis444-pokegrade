const db = require('../config/db');

const Card = {
  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM cards');
    return rows;
  },

  findByCert: async (certNumber) => {
    const [rows] = await db.query('SELECT * FROM cards WHERE cert_number = ?', [certNumber]);
    return rows[0] || null;
  },

  create: async ({ certNumber, cardName, psa9Price, psa10Price, imageUrl }) => {
    const [result] = await db.query(
      'INSERT INTO cards (cert_number, card_name, psa9_price, psa10_price, image_url) VALUES (?, ?, ?, ?, ?)',
      [certNumber, cardName, psa9Price, psa10Price, imageUrl]
    );
    return result.insertId;
  }
};

module.exports = Card;
