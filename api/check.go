package api

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	r "github.com/venil7/assets-service/repository"
)

func GetCheck(ctx *gin.Context) func(error) {
	return func(err error) {
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			panic(err.Error())
		}
	}
}

func GetUser(ctx *gin.Context) (user *r.User, err error) {
	userObj, ok := ctx.Get(IDENITY_KEY)
	user = userObj.(*r.User)
	if !ok {
		err = errors.New("failed to get user")
		return
	}
	return
}
