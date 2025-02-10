CREATE TABLE users (
    id varchar(96) PRIMARY KEY,
    username TEXT NOT NULL,
    created DATETIME NOT NULL,
    modified DATETIME NOT NULL
);

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
