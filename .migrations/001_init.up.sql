--tables
CREATE TABLE
    users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        phash TEXT NOT NULL,
        psalt TEXT NOT NULL,
        admin BOOL NOT NULL,
        created DATETIME DEFAULT CURRENT_TIMESTAMP,
        modified DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (username)
    );

CREATE TABLE
    assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        portfolio_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        ticker TEXT NOT NULL,
        created DATETIME DEFAULT CURRENT_TIMESTAMP,
        modified DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (portfolio_id) REFERENCES portfolios (id),
        UNIQUE (ticker, portfolio_id)
    );

CREATE TABLE
    portfolios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        created DATETIME DEFAULT CURRENT_TIMESTAMP,
        modified DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE (user_id, name)
    );

CREATE TABLE
    transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_id INTEGER NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
        quantity REAL NOT NULL,
        price REAL NOT NULL,
        date DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created DATETIME DEFAULT CURRENT_TIMESTAMP,
        modified DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (asset_id) REFERENCES assets (id)
    );

-- views
drop view if exists asset_transactions;

create view
    asset_transactions as
SELECT
    T.*,
    A.name,
    A.ticker,
    P.name as portfolio_name,
    P.description as portfolio_description,
    P.user_id
FROM
    transactions T
    INNER JOIN assets A ON A.id = T.asset_id
    INNER JOIN portfolios P ON P.id = A.portfolio_id;

DROP VIEW IF EXISTS asset_holdings;

CREATE VIEW IF NOT EXISTS
    asset_holdings AS
SELECT
    SUB.*,
    CASE
        WHEN SUB.holdings = 0 THEN NULL
        ELSE SUB.invested / SUB.holdings
    END AS avg_price
FROM
    (
        SELECT
            A.*,
            U.id as user_id,
            COALESCE(
                SUM(
                    CASE
                        WHEN t.type = 'buy' THEN t.quantity
                        ELSE - t.quantity
                    END
                ),
                0
            ) AS holdings,
            COALESCE(
                SUM(
                    CASE
                        WHEN t.type = 'buy' THEN t.quantity * t.price
                        ELSE - t.quantity * t.price
                    END
                ),
                0
            ) AS invested,
            COUNT(T.id) AS num_tx
        FROM
            assets A
            INNER JOIN portfolios P ON P.id = A.portfolio_id
            LEFT JOIN transactions T on T.asset_id = A.id
            INNER JOIN users U ON U.id = P.user_id
        GROUP BY
            A.id,
            A.name
    ) AS SUB;

-- triggers
DROP TRIGGER IF EXISTS check_holdings_before_sell;

CREATE TRIGGER check_holdings_before_sell BEFORE INSERT ON transactions FOR EACH ROW WHEN NEW.type = 'sell' BEGIN
SELECT
    CASE
        WHEN (
            SELECT
                holdings
            FROM
                asset_holdings A
            WHERE
                id = NEW.asset_id
        ) < NEW.quantity THEN RAISE (ABORT, 'Insufficient holdings')
    END;

END;

-- seed
INSERT INTO
    users (username, phash, psalt, admin)
VALUES
    (
        'admin',
        '$2a$12$UlhYekwyyrFuwSgrT74ZluHb893OB9Pf9UfY15l71DFBTmCIyhqbW',
        '123',
        TRUE
    );