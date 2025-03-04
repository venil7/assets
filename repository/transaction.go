package repository

import (
	"fmt"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

type Transaction struct {
	Id       int64     `db:"id" json:"id"`
	AssetId  int64     `db:"asset_id" json:"asset_id"`
	Type     string    `db:"type" json:"type"`
	Quantity float64   `db:"quantity" json:"quantity"`
	Price    float64   `db:"price" json:"price"`
	Date     time.Time `db:"date" json:"date"`
	Created  time.Time `db:"created" json:"created"`
	Modified time.Time `db:"modified" json:"modified"`
}

type TxRepo struct {
	repo *Database
}

func NewTxRepo(repo *Database) TxRepo {
	return TxRepo{repo}
}

func (repo *TxRepo) NewTransaction(transaction *Transaction, assetId int64, user *User) (trans Transaction, err error) {
	transaction.AssetId = assetId
	result, err := (*repo.repo).Db().NamedExec(`
			INSERT INTO transactions (asset_id, type, quantity, price, date)
			VALUES (:asset_id, :type, :quantity, :price, :date)
	`, transaction)
	if err != nil {
		return trans, fmt.Errorf("failed to insert transaction: %w", err)
	}
	transactionId, err := result.LastInsertId()
	if err != nil {
		return trans, fmt.Errorf("failed to get last insert id: %w", err)
	}
	trans, err = repo.Transaction(transactionId, assetId, user)
	if err != nil {
		return trans, fmt.Errorf("failed to retrieve transaction: %w", err)
	}
	return trans, nil
}

func (repo *TxRepo) Transaction(id int64, assetId int64, user *User) (transaction Transaction, err error) {
	err = (*repo.repo).Db().Get(&transaction,
		`
					SELECT T.*
					FROM transactions T
					INNER JOIN assets A ON A.id = T.asset_id
					INNER JOIN portfolios P ON P.id = A.portfolio_id
					INNER JOIN users U ON U.id = P.user_id
					WHERE T.id=? AND A.id=? AND U.id=?
					LIMIT 1;
			`, id, assetId, user.Id)
	return transaction, err
}

func (repo *TxRepo) AssetTransactions(paging *Paging, assetId int64, user *User) (transactions []Transaction, err error) {
	transactions = make([]Transaction, 0)
	err = (*repo.repo).Db().Select(&transactions,
		`
					SELECT T.*
					FROM transactions T
					INNER JOIN assets A ON A.id = T.asset_id
					INNER JOIN portfolios P ON P.id = A.portfolio_id
					INNER JOIN users U ON U.id = P.user_id
					WHERE T.asset_id=? AND P.id IN (SELECT portfolio_id FROM assets WHERE id=?) AND U.id=?
					ORDER BY T.date DESC
					LIMIT ? OFFSET ?;
			`, assetId, assetId, user.Id, paging.pageSize, paging.Offset())
	return transactions, err
}

func (repo *TxRepo) Delete(id int64, assetId int64, user *User) (err error) {
	result, err := (*repo.repo).Db().Exec(
		`
					DELETE FROM transactions
					WHERE id IN (
							SELECT T.id
							FROM transactions T
							INNER JOIN assets A ON A.id = T.asset_id
							INNER JOIN portfolios P ON P.id = A.portfolio_id
							INNER JOIN users U ON U.id = P.user_id
							WHERE T.id=? AND A.id=? AND P.id IN (SELECT portfolio_id FROM assets WHERE id=?) AND U.id=?
							LIMIT 1
					);
			`, id, assetId, assetId, user.Id)
	if err != nil {
		return err
	}
	if rows, err := result.RowsAffected(); rows < 1 || err != nil {
		return err
	}
	return nil
}
