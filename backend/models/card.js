const db = require('../config/db');

const Card = {
  getAll: async () => {
    const result = await db.query('SELECT * FROM cards');
    return result.rows;
  },

  getSuggested: async () => {
    const result = await db.query(`
      SELECT *,
             (COALESCE(psa10_price, 0) - COALESCE(psa9_price, 0)) AS price_diff
      FROM cards
      WHERE psa9_price IS NOT NULL AND psa10_price IS NOT NULL
      ORDER BY price_diff DESC
    `);

    return result.rows;
  },

  findByCert: async (certNumber) => {
    const result = await db.query(
      'SELECT * FROM cards WHERE cert_number = $1',
      [certNumber]
    );

    return result.rows[0] || null;
  },

  createOrUpdate: async ({
    certNumber,
    cardName,
    setName,
    cardNumber,
    currentGrade,
    psa9Price,
    psa10Price,
    imageUrl
  }) => {
    const result = await db.query(
      `
      INSERT INTO cards
        (cert_number, card_name, card_set, card_number, current_grade, psa9_price, psa10_price, image_url)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (cert_number)
      DO UPDATE SET
        card_name = EXCLUDED.card_name,
        card_set = EXCLUDED.card_set,
        card_number = EXCLUDED.card_number,
        current_grade = EXCLUDED.current_grade,
        psa9_price = EXCLUDED.psa9_price,
        psa10_price = EXCLUDED.psa10_price,
        image_url = EXCLUDED.image_url,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
      `,
      [
        certNumber,
        cardName,
        setName,
        cardNumber,
        currentGrade,
        psa9Price,
        psa10Price,
        imageUrl
      ]
    );

    return result.rows[0];
  }
};

module.exports = Card;