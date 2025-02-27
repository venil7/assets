package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jinzhu/copier"
	r "github.com/venil7/assets-service/repository"
)

type PostPortfolio struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description" binding:"required"`
}

func Portfolio(ctx *gin.Context) {
	var err error
	check := GetCheck(ctx)

	var params struct {
		Id int64 `uri:"portfolio_id" binding:"required"`
	}

	err = ctx.BindUri(&params)
	check(err)

	user, err := GetUser(ctx)
	check(err)

	db, err := r.GetDb(ctx)
	check(err)

	repo := r.NewPortfolioRepo(db)
	portfolio, err := repo.Portfolio(params.Id, user)
	check(err)

	ctx.JSON(http.StatusOK, portfolio)
}

func Portfolios(ctx *gin.Context) {
	var err error
	check := GetCheck(ctx)

	user, err := GetUser(ctx)
	check(err)

	db, err := r.GetDb(ctx)
	check(err)

	repo := r.NewPortfolioRepo(db)
	paging := r.NewDefaultPaging()
	portfolios, err := repo.Portfolios(&paging, user)
	check(err)

	ctx.JSON(http.StatusOK, portfolios)
}

func NewPortfolio(ctx *gin.Context) {
	var err error
	var postPortfolio PostPortfolio
	check := GetCheck(ctx)

	err = ctx.ShouldBind(&postPortfolio)
	check(err)

	user, err := GetUser(ctx)
	check(err)

	db, err := r.GetDb(ctx)
	check(err)

	portfolioRepo := r.NewPortfolioRepo(db)
	var portfolio r.Portfolio
	err = copier.Copy(&portfolio, postPortfolio)
	check(err)

	newPortfolio, err := portfolioRepo.NewPortfolio(&portfolio, user)
	check(err)

	ctx.JSON(http.StatusCreated, newPortfolio)
}
