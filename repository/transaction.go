package repository

import (
	"fmt"
	"time"

	_ "github.com/mattn/go-sqlite3"
	"github.com/samber/do"
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

func TxRepoProvider(i *do.Injector) (*TxRepo, error) {
	db := do.MustInvoke[*Database](i)
	repo := NewTxRepo(db)
	return &repo, nil
}

func (repo *TxRepo) New(transaction *Transaction, assetId int64, user *User) (trans Transaction, err error) {
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
	trans, err = repo.Get(transactionId, assetId, user)
	if err != nil {
		return trans, fmt.Errorf("failed to retrieve transaction: %w", err)
	}
	return trans, nil
}

func (repo *TxRepo) Get(id int64, assetId int64, user *User) (transaction Transaction, err error) {
	err = (*repo.repo).Db().Get(&transaction,
		`
		SELECT id, asset_id, type, quantity, price, date, created, modified
		FROM asset_transactions AT
		WHERE AT.id=? AND AT.asset_id=? AND AT.user_id=?
		LIMIT 1;
		`, id, assetId, user.Id)
	return transaction, err
}

func (repo *TxRepo) GetMany(paging *Paging, assetId int64, user *User) (transactions []Transaction, err error) {
	transactions = make([]Transaction, 0)
	err = (*repo.repo).Db().Select(&transactions,
		`
		SELECT id, asset_id, type, quantity, price, date, created, modified
		FROM asset_transactions AT
		WHERE AT.asset_id=? AND AT.user_id=?
		ORDER BY AT.date DESC
		LIMIT ? OFFSET ?;
		`, assetId, user.Id, paging.pageSize, paging.Offset())
	return transactions, err
}

func (repo *TxRepo) Delete(id int64, assetId int64, user *User) (err error) {
	result, err := (*repo.repo).Db().Exec(
		`
		DELETE FROM transactions
		WHERE id IN (
				SELECT AT.id
				FROM asset_transactions AT
				WHERE AT.id=? AND AT.user_id=?
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
