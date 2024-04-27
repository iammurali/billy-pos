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

CREATE TABLE bills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_amount REAL NOT NULL
  invoice_number TEXT UNIQUE
);

CREATE TABLE bill_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bill_id INTEGER NOT NULL,
  menu_item_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  amount REAL NOT NULL,
  FOREIGN KEY (bill_id) REFERENCES bills (id),
  FOREIGN KEY (menu_item_id) REFERENCES menu_item (id)
);