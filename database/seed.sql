-- Seed data: popular Pokemon cards with PSA 9 -> PSA 10 price differences.
-- Idempotent via ON CONFLICT, safe to re-run.

INSERT INTO cards (cert_number, card_name, card_set, card_number, current_grade, psa9_price, psa10_price, image_url) VALUES
  ('11223344', 'Charizard Holo 1st Edition Shadowless', 'Base Set (1999)',           '4/102',  'MINT 9',     7000.00,  40000.00, 'https://images.pokemontcg.io/base1/4_hires.png'),
  ('22334455', 'Charizard Holo Shadowless',              'Base Set (1999)',           '4/102',  'MINT 9',     1500.00,  8000.00,  'https://images.pokemontcg.io/base1/4_hires.png'),
  ('33445566', 'Lugia 1st Edition Holo',                 'Neo Genesis (2000)',        '9/111',  'MINT 9',     1800.00,  12000.00, 'https://images.pokemontcg.io/neo1/9_hires.png'),
  ('44556677', 'Umbreon Gold Star',                      'POP Series 5 (2007)',       '17/17',  'MINT 9',     2500.00,  15000.00, 'https://images.pokemontcg.io/pop5/17_hires.png'),
  ('55667788', 'Charizard VMAX Rainbow Rare',            'Champion''s Path (2020)',   '74/73',  'MINT 9',     200.00,   700.00,   'https://images.pokemontcg.io/swsh35/74_hires.png'),
  ('66778899', 'Charizard V Alt Art',                    'Brilliant Stars (2022)',    '154/172','MINT 9',     250.00,   900.00,   'https://images.pokemontcg.io/swsh9/154_hires.png'),
  ('77889900', 'Rayquaza VMAX Alt Art',                  'Evolving Skies (2021)',     '218/203','MINT 9',     700.00,   3000.00,  'https://images.pokemontcg.io/swsh7/218_hires.png'),
  ('88990011', 'Giratina V Alt Art',                     'Lost Origin (2022)',        '186/196','MINT 9',     300.00,   1100.00,  'https://images.pokemontcg.io/swsh11/186_hires.png')
ON CONFLICT (cert_number) DO UPDATE SET
  card_name     = EXCLUDED.card_name,
  card_set      = EXCLUDED.card_set,
  card_number   = EXCLUDED.card_number,
  current_grade = EXCLUDED.current_grade,
  psa9_price    = EXCLUDED.psa9_price,
  psa10_price   = EXCLUDED.psa10_price,
  image_url     = EXCLUDED.image_url,
  updated_at    = CURRENT_TIMESTAMP;
