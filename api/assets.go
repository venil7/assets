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
}

type AssetUri struct {
	AssetId     int64 `uri:"asset_id" binding:"required"`
	PortfolioId int64 `uri:"portfolio_id" binding:"required"`
}

func Asset(ctx *gin.Context) {
	var err error
	check := GetCheck(ctx)

	var params AssetUri
	err = ctx.BindUri(&params)
	check(err)

	user, err := GetUser(ctx)
	check(err)

	db, err := r.GetDb(ctx)
	check(err)

	repo := r.NewAssetRepo(db)
	asset, err := repo.Asset(params.AssetId, params.PortfolioId, user)
	check(err)

	ctx.JSON(http.StatusOK, asset)
}

func DeleteAsset(ctx *gin.Context) {
	var err error
	check := GetCheck(ctx)

	var params AssetUri
	err = ctx.BindUri(&params)
	check(err)

	user, err := GetUser(ctx)
	check(err)

	db, err := r.GetDb(ctx)
	check(err)

	repo := r.NewAssetRepo(db)
	err = repo.Delete(params.AssetId, params.PortfolioId, user)
	check(err)

	ctx.JSON(http.StatusOK, true)
}

func Assets(ctx *gin.Context) {
	var err error
	check := GetCheck(ctx)

	var params PortfolioUri
	err = ctx.BindUri(&params)
	check(err)

	user, err := GetUser(ctx)
	check(err)

	db, err := r.GetDb(ctx)
	check(err)

	assetsRepo := r.NewAssetRepo(db)
	paging := r.NewDefaultPaging()
	assets, err := assetsRepo.Assets(&paging, params.PortfolioId, user)
	check(err)

	ctx.JSON(http.StatusOK, assets)
}

func NewAsset(ctx *gin.Context) {
	var err error
	var assetPost PostAsset
	check := GetCheck(ctx)

	var params PortfolioUri
	err = ctx.BindUri(&params)
	check(err)

	err = ctx.ShouldBind(&assetPost)
	check(err)

	user, err := GetUser(ctx)
	check(err)

	db, err := r.GetDb(ctx)
	check(err)

	repo := r.NewAssetRepo(db)
	var asset r.Asset
	err = copier.Copy(&asset, assetPost)
	check(err)

	nAsset, err := repo.NewUserAsset(&asset, params.PortfolioId, user)
	check(err)

	ctx.JSON(http.StatusCreated, nAsset)
}
