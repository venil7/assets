package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	r "github.com/venil7/assets-service/repository"
)

func LookupTicker(ctx *gin.Context) {
	var err error
	check := GetCheck(ctx)

	term := ctx.Query("term")
	if term == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "term is required"})
		return
	}

	result, err := r.LookupTicker(term)
	check(err)

	ctx.JSON(http.StatusOK, result)
}
