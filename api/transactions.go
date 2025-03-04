package api

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jinzhu/copier"
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

func Transaction(ctx *gin.Context) {
	var err error
	check := GetCheck(ctx)

	var params TransactionUri
	err = ctx.BindUri(&params)
	check(err)

	user, err := GetUser(ctx)
	check(err)

	db, err := r.GetDb(ctx)
	check(err)

	repo := r.NewTxRepo(db)
	transaction, err := repo.Transaction(params.TransactionId, params.AssetId, user)
	check(err)

	ctx.JSON(http.StatusOK, transaction)
}

func DeleteTransaction(ctx *gin.Context) {
	var err error
	check := GetCheck(ctx)

	var params TransactionUri
	err = ctx.BindUri(&params)
	check(err)

	user, err := GetUser(ctx)
	check(err)

	db, err := r.GetDb(ctx)
	check(err)

	repo := r.NewTxRepo(db)
	err = repo.Delete(params.TransactionId, params.AssetId, user)
	check(err)

	ctx.JSON(http.StatusOK, true)
}

func AssetTransactions(ctx *gin.Context) {
	var err error
	check := GetCheck(ctx)

	var params AssetOnlyUri
	err = ctx.BindUri(&params)
	check(err)

	user, err := GetUser(ctx)
	check(err)

	db, err := r.GetDb(ctx)
	check(err)

	transactionsRepo := r.NewTxRepo(db)
	paging := r.NewDefaultPaging()
	transactions, err := transactionsRepo.AssetTransactions(&paging, params.AssetId, user)
	check(err)

	ctx.JSON(http.StatusOK, transactions)
}

func NewTransaction(ctx *gin.Context) {
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

	db, err := r.GetDb(ctx)
	check(err)

	repo := r.NewTxRepo(db)
	var transaction r.Transaction

	err = copier.Copy(&transaction, transactionPost)
	transaction.Date, err = time.Parse(time.DateOnly, transactionPost.Date)
	check(err)

	nTransaction, err := repo.NewTransaction(&transaction, params.AssetId, user)
	check(err)

	ctx.JSON(http.StatusCreated, nTransaction)
}
