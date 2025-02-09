CREATE TABLE assets (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    ticker TEXT UNIQUE NOT NULL,
    metadata TEXT
);
