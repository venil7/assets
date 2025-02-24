package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jinzhu/copier"
	r "github.com/venil7/assets-service/repository"
)

type PostAsset struct {
	Name   string `json:"name" binding:"required"`
	Ticker string `json:"ticker" binding:"required"`
	ISIN   string `json:"isin"`
}

func NewAsset(ctx *gin.Context) {
	var err error
	var assetPost PostAsset
	check := GetCheck(ctx)

	err = ctx.ShouldBind(&assetPost)
	check(err)

	user, gotUser := ctx.Get(IDENITY_KEY)
	if !gotUser {
		ctx.JSON(http.StatusExpectationFailed, gin.H{"error": "not got user"})
		return
	}

	db, err := r.GetDb(ctx)
	check(err)

	assetsRepo := r.NewAssetRepo(db)
	var asset r.Asset
	err = copier.Copy(&asset, assetPost)
	check(err)

	nAsset, err := assetsRepo.NewUserAsset(&asset, user.(*r.User))
	check(err)

	ctx.JSON(http.StatusCreated, nAsset)
}
