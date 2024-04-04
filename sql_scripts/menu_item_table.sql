CREATE TABLE menu_item (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  description TEXT,
  category TEXT,
  price DECIMAL(10,2),
  isActive TEXT DEFAULT 'true' CHECK(isActive IN ('true', 'false')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT NULL,
  category_id INTEGER,
  short_code TEXT
);
