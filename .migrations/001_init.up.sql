CREATE TABLE users (
    id varchar(96) PRIMARY KEY,
    username TEXT NOT NULL,
    phash TEXT NOT NULL,
    psalt TEXT NOT NULL,
    admin BOOL NOT NULL,
    created DATETIME NOT NULL,
    modified DATETIME NOT NULL
);

INSERT INTO users (id, username, phash, psalt, admin, created, modified)
VALUES ('33b5a237-eb21-4668-9c2d-2e570e3e6c96', 'admin', '$2a$12$UlhYekwyyrFuwSgrT74ZluHb893OB9Pf9UfY15l71DFBTmCIyhqbW', '123', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

CREATE TABLE tokens (
    id varchar(96) PRIMARY KEY,
    token TEXT NOT NULL,
    secret TEXT NOT NULL,
    enabled BOOLEAN NOT NULL,
    created DATETIME NOT NULL,
    modified DATETIME NOT NULL
);

CREATE TABLE assets (
    id varchar(96) PRIMARY KEY,
    name TEXT NOT NULL,
    ticker TEXT UNIQUE NOT NULL,
    isin TEXT UNIQUE NOT NULL
);
