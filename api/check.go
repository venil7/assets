package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetCheck(ctx *gin.Context) func(error) {
	return func(err error) {
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			panic(err.Error())
		}
	}
}
