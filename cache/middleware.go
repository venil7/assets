package cache

import (
	"errors"

	"github.com/gin-gonic/gin"
)

const dbKey string = "__cache"

func WithCache(db *Cache) func(ctx *gin.Context) {
	return func(ctx *gin.Context) {
		(*ctx).Set(dbKey, db)
		(*ctx).Next()
	}
}

func GetCache(ctx *gin.Context) (*Cache, error) {
	db, ok := (*ctx).Value(dbKey).(*Cache)
	if !ok {
		return nil, errors.New("database connection not found in context")
	}
	return db, nil
}
