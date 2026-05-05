-- cards table: cache for psa lookups and source for "suggested cards" homepage grid
-- run: psql pokegrade -f database/schema.sql

CREATE TABLE IF NOT EXISTS cards (
	-- internal surrogate key
	id SERIAL PRIMARY KEY,
	-- psa cert number, unique business key
	-- VARCHAR not INT because psa pads some certs and may use letters in future
	cert_number VARCHAR(32) UNIQUE NOT NULL,
	-- card subject from psa response
	card_name VARCHAR(255) NOT NULL,
	-- set / brand from psa
	card_set VARCHAR(255),
	-- printed card number, can be alphanumeric (e.g. "GG44", "218/203")
	card_number VARCHAR(64),
	-- psa grade label (e.g. "MINT 9", "GEM MT 10")
	current_grade VARCHAR(32),
	-- usd prices, NULL until populated by seed or future price scraper
	psa9_price NUMERIC(10,2),
	psa10_price NUMERIC(10,2),
	-- front-image url, may be psa cdn or pokemontcg.io for seeded rows
	image_url TEXT,
	-- audit timestamps, updated_at set by upsert in card model
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
