package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jinzhu/copier"
	"github.com/samber/do"
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

type AssetsApi struct {
	repo *r.AssetRepository
}

func AssetsApiProvider(i *do.Injector) (*AssetsApi, error) {
	repo := do.MustInvoke[*r.AssetRepository](i)
	api := AssetsApi{repo}
	return &api, nil
}

func (api *AssetsApi) Get(ctx *gin.Context) {
	var err error
	check := GetCheck(ctx)

	var params AssetUri
	err = ctx.BindUri(&params)
	check(err)

	user, err := GetUser(ctx)
	check(err)

	asset, err := api.repo.Get(params.AssetId, params.PortfolioId, user)
	check(err)

	ctx.JSON(http.StatusOK, asset)
}

func (api *AssetsApi) Delete(ctx *gin.Context) {
	var err error
	check := GetCheck(ctx)

	var params AssetUri
	err = ctx.BindUri(&params)
	check(err)

	user, err := GetUser(ctx)
	check(err)

	err = api.repo.Delete(params.AssetId, params.PortfolioId, user)
	check(err)

	ctx.JSON(http.StatusOK, true)
}

func (api *AssetsApi) GetMany(ctx *gin.Context) {
	var err error
	check := GetCheck(ctx)

	var params PortfolioUri
	err = ctx.BindUri(&params)
	check(err)

	user, err := GetUser(ctx)
	check(err)

	paging := r.NewDefaultPaging()

	assets, err := api.repo.GetMany(&paging, params.PortfolioId, user)
	check(err)

	ctx.JSON(http.StatusOK, assets)
}

func (api *AssetsApi) New(ctx *gin.Context) {
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

	var asset r.Asset
	err = copier.Copy(&asset, assetPost)
	check(err)

	nAsset, err := api.repo.New(&asset, params.PortfolioId, user)
	check(err)

	ctx.JSON(http.StatusCreated, nAsset)
}
