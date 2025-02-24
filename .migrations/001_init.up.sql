CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    phash TEXT NOT NULL,
    psalt TEXT NOT NULL,
    admin BOOL NOT NULL,
    created DATETIME DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    portfolio_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    ticker TEXT NOT NULL,
    created DATETIME DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id),
    UNIQUE (ticker, portfolio_id)
);

CREATE TABLE portfolios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created DATETIME DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('buy', 'sell')),
    quantity REAL NOT NULL,
    price REAL NOT NULL,
    date DATETIME NOT NULL,
    created DATETIME DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id)
);

INSERT INTO users (username, phash, psalt, admin)
VALUES ('admin', '$2a$12$UlhYekwyyrFuwSgrT74ZluHb893OB9Pf9UfY15l71DFBTmCIyhqbW', '123', TRUE);