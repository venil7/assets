package api

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jinzhu/copier"
	"github.com/samber/do"
	r "github.com/venil7/assets-service/repository"
)

type PostTransaction struct {
	Type     string  `json:"type" binding:"required"`
	Quantity float64 `json:"quantity" binding:"required"`
	Price    float64 `json:"price" binding:"required"`
	Date     string  `json:"date" binding:"required"`
}

type AssetOnlyUri struct {
	AssetId int64 `uri:"asset_id" binding:"required"`
}

type TransactionUri struct {
	AssetOnlyUri
	TransactionId int64 `uri:"transaction_id" binding:"required"`
}

type TxApi struct {
	repo *r.TxRepo
}

func TxApiProvider(i *do.Injector) (*TxApi, error) {
	repo := do.MustInvoke[*r.TxRepo](i)
	api := TxApi{repo}
	return &api, nil
}

func (api *TxApi) Get(ctx *gin.Context) {
	var err error
	check := GetCheck(ctx)

	var params TransactionUri
	err = ctx.BindUri(&params)
	check(err)

	user, err := GetUser(ctx)
	check(err)

	transaction, err := api.repo.Transaction(params.TransactionId, params.AssetId, user)
	check(err)

	ctx.JSON(http.StatusOK, transaction)
}

func (api *TxApi) Delete(ctx *gin.Context) {
	var err error
	check := GetCheck(ctx)

	var params TransactionUri
	err = ctx.BindUri(&params)
	check(err)

	user, err := GetUser(ctx)
	check(err)

	err = api.repo.Delete(params.TransactionId, params.AssetId, user)
	check(err)

	ctx.JSON(http.StatusOK, true)
}

func (api *TxApi) GetMany(ctx *gin.Context) {
	var err error
	check := GetCheck(ctx)

	var params AssetOnlyUri
	err = ctx.BindUri(&params)
	check(err)

	user, err := GetUser(ctx)
	check(err)

	paging := r.NewDefaultPaging()
	transactions, err := api.repo.AssetTransactions(&paging, params.AssetId, user)
	check(err)

	ctx.JSON(http.StatusOK, transactions)
}

func (api *TxApi) New(ctx *gin.Context) {
	var err error
	var transactionPost PostTransaction
	check := GetCheck(ctx)

	var params AssetOnlyUri
	err = ctx.BindUri(&params)
	check(err)

	err = ctx.ShouldBind(&transactionPost)
	check(err)

	user, err := GetUser(ctx)
	check(err)

	var transaction r.Transaction

	err = copier.Copy(&transaction, transactionPost)
	transaction.Date, err = time.Parse(time.DateOnly, transactionPost.Date)
	check(err)

	nTransaction, err := api.repo.NewTransaction(&transaction, params.AssetId, user)
	check(err)

	ctx.JSON(http.StatusCreated, nTransaction)
}
