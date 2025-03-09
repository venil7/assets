package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jinzhu/copier"
	"github.com/samber/do"
	r "github.com/venil7/assets-service/repository"
)

type PostPortfolio struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description" binding:"required"`
}

type PortfolioUri struct {
	PortfolioId int64 `uri:"portfolio_id" binding:"required"`
}

type PortfolioApi struct {
	repo *r.PortfolioRepo
}

func PortfolioApiProvider(i *do.Injector) (*PortfolioApi, error) {
	repo := do.MustInvoke[*r.PortfolioRepo](i)
	api := PortfolioApi{repo}
	return &api, nil
}

func (api *PortfolioApi) Get(ctx *gin.Context) {
	var err error
	check := GetCheck(ctx)

	var params PortfolioUri
	err = ctx.BindUri(&params)
	check(err)

	user, err := GetUser(ctx)
	check(err)

	portfolio, err := api.repo.Portfolio(params.PortfolioId, user)
	check(err)

	ctx.JSON(http.StatusOK, portfolio)
}

func (api *PortfolioApi) Delete(ctx *gin.Context) {
	var err error
	check := GetCheck(ctx)

	var params PortfolioUri
	err = ctx.BindUri(&params)
	check(err)

	user, err := GetUser(ctx)
	check(err)

	err = api.repo.Delete(params.PortfolioId, user)
	check(err)

	ctx.JSON(http.StatusOK, true)
}

func (api *PortfolioApi) GetMany(ctx *gin.Context) {
	var err error
	check := GetCheck(ctx)

	user, err := GetUser(ctx)
	check(err)

	paging := r.NewDefaultPaging()
	portfolios, err := api.repo.Portfolios(&paging, user)
	check(err)

	ctx.JSON(http.StatusOK, portfolios)
}

func (api *PortfolioApi) New(ctx *gin.Context) {
	var err error
	var postPortfolio PostPortfolio
	check := GetCheck(ctx)

	err = ctx.ShouldBind(&postPortfolio)
	check(err)

	user, err := GetUser(ctx)
	check(err)

	var portfolio r.Portfolio
	err = copier.Copy(&portfolio, postPortfolio)
	check(err)

	newPortfolio, err := api.repo.NewPortfolio(&portfolio, user)
	check(err)

	ctx.JSON(http.StatusCreated, newPortfolio)
}
