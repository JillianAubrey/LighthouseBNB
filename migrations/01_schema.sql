DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id       SERIAL PRIMARY KEY,
  name     VARCHAR(255),
  email    VARCHAR(255),
  password VARCHAR(255)
);

DROP TABLE IF EXISTS properties CASCADE;

CREATE TABLE properties (
  id                  SERIAL PRIMARY KEY,
  owner_id            INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title               VARCHAR(255),
  description         TEXT,
  thumbnail_photo_url VARCHAR(255),
  cover_photo_url     VARCHAR(255),
  cost_per_night      INTEGER,
  parking_spaces      INTEGER,
  number_of_bathrooms INTEGER,
  number_of_bedrooms  INTEGER,
  country             VARCHAR(255),
  street              VARCHAR(255),
  city                VARCHAR(255),
  province            VARCHAR(255),
  post_code           VARCHAR(255),
  active              BOOLEAN
);

DROP TABLE IF EXISTS reservations CASCADE;

CREATE TABLE reservations (
  id          SERIAL PRIMARY KEY,
  start_date  DATE,
  end_date    DATE,
  guest_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE
);
