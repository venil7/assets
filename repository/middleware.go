package repository

import (
	"errors"

	"github.com/gin-gonic/gin"
)

const dbKey string = "__db"

func WithDb(db *Database) func(ctx *gin.Context) {
	return func(ctx *gin.Context) {
		(*ctx).Set(dbKey, db)
		(*ctx).Next()
	}
}

func GetDb(ctx *gin.Context) (*Database, error) {
	db, ok := (*ctx).Value(dbKey).(*Database)
	if !ok {
		return nil, errors.New("database connection not found in context")
	}
	return db, nil
}
