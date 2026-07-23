CREATE TABLE IF NOT EXISTS park_location_enrichments (
  dataset_id TEXT NOT NULL,
  park_name TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  address TEXT,
  latitude REAL,
  longitude REAL,
  source_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('enriched', 'unresolved')),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (dataset_id, park_name, city, district)
);
