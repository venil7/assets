package repository

import (
	"github.com/jmoiron/sqlx"
)

type Database interface {
	Db() *sqlx.DB
}

type SqliteDatabase struct {
	db *sqlx.DB
}

func (db *SqliteDatabase) Db() *sqlx.DB {
	return db.db
}

func New(path string) (Database, error) {
	db, err := sqlx.Open("sqlite3", path)
	return &SqliteDatabase{db}, err
}
