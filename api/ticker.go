package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/samber/do"
	r "github.com/venil7/assets-service/repository"
)

type YahooApi struct {
	service *r.YahooService
}

func YahooApiProvider(i *do.Injector) (*YahooApi, error) {
	repo := do.MustInvoke[*r.YahooService](i)
	api := YahooApi{repo}
	return &api, nil
}

func (api *YahooApi) LookupTicker(ctx *gin.Context) {
	var err error
	check := GetCheck(ctx)

	term := ctx.Query("term")
	if term == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "term is required"})
		return
	}

	result, err := api.service.LookupTicker(term)
	check(err)

	ctx.JSON(http.StatusOK, result)
}
