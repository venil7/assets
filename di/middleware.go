package di

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/samber/do"
)

func SetToContext[T any](key string) func(val T) func(*gin.Context) {
	return func(val T) func(*gin.Context) {
		return func(ctx *gin.Context) {
			(*ctx).Set(key, val)
			(*ctx).Next()
		}
	}
}

func GetFromContext[T any](key string) func(ctx *gin.Context) (T, error) {
	return func(ctx *gin.Context) (T, error) {
		duplex, ok := (*ctx).Value(key).(T)
		if !ok {
			return *new(T), errors.New(fmt.Sprintf("failed to get context: %s", key))
		}
		return duplex, nil
	}
}

const key = "injector"

var WithInjector = SetToContext[*do.Injector](key)
var GetInjector = GetFromContext[*do.Injector](key)

func Get[T any](ctx *gin.Context) (T, error) {
	inj, err := GetInjector(ctx)
	if err != nil {
		return *new(T), err
	}
	return do.MustInvoke[T](inj), nil
}
