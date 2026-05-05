// data access for cards table
// rows use snake_case columns, controllers normalize to camelCase

const db = require('../config/db');

const Card = {
  // returns every row, currently unused outside ad-hoc debugging
  getAll: async () => {
    const result = await db.query('SELECT * FROM cards');
    return result.rows;
  },

  // returns priced cards sorted by psa9 -> psa10 upside, descending
  // skips rows where either price is null (e.g. psa-cached lookups without price data)
  // COALESCE keeps query robust if pricing schema changes
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

  // cache lookup keyed on cert_number
  // returns null if no row exists
  findByCert: async (certNumber) => {
    const result = await db.query(
      'SELECT * FROM cards WHERE cert_number = $1',
      [certNumber]
    );

    return result.rows[0] || null;
  },

  // upsert keyed on cert_number
  // ON CONFLICT keeps psa lookups idempotent across repeat queries
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
