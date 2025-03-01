package repository

import (
	"time"

	_ "github.com/mattn/go-sqlite3"
)

type Asset struct {
	Id         int64     `db:"id" json:"id"`
	PorfolioId int64     `db:"portfolio_id" json:"portfolio_id"`
	Name       string    `db:"name" json:"name"`
	Ticker     string    `db:"ticker" json:"ticker"`
	Created    time.Time `db:"created" json:"created"`
	Modified   time.Time `db:"modified" json:"modified"`
}

type AssetRepository struct {
	repo *Database
}

func NewAssetRepo(repo *Database) AssetRepository {
	return AssetRepository{repo}
}

func (repo *AssetRepository) NewUserAsset(asset *Asset, portfolioId int64, user *User) (ass Asset, err error) {
	asset.PorfolioId = portfolioId
	result, err := (*repo.repo).Db().NamedExec(`
		INSERT INTO assets (name, ticker, portfolio_id)
		VALUES (:name, :ticker, :portfolio_id)
	`, asset)
	if err != nil {
		return
	}
	assetId, err := result.LastInsertId()
	if err != nil {
		return
	}
	return repo.Asset(assetId, portfolioId, user)
}

func (repo *AssetRepository) Asset(id int64, portfolioId int64, user *User) (asset Asset, err error) {
	err = (*repo.repo).Db().Get(&asset,
		`
			SELECT A.*
			FROM assets A
			INNER JOIN portfolios P ON P.id = A.portfolio_id
			INNER JOIN users U ON U.id = P.user_id
			WHERE A.id=? AND P.id=? AND U.id=?
			LIMIT 1;
		`, id, portfolioId, user.Id)
	return asset, err
}

func (repo *AssetRepository) Assets(paging *Paging, portfolioId int64, user *User) (assets []Asset, err error) {
	assets = make([]Asset, 0)
	err = (*repo.repo).Db().Select(&assets,
		`
			SELECT A.*
			FROM assets A
			INNER JOIN portfolios P ON P.id = A.portfolio_id
			INNER JOIN users U ON U.id = P.user_id
			WHERE P.id=? AND U.id=?
			LIMIT ? OFFSET ?;
		`, portfolioId, user.Id, paging.pageSize, paging.Offset())
	return assets, err
}

func (repo *AssetRepository) Delete(id int64, portfolioId int64, user *User) (err error) {
	result, err := (*repo.repo).Db().Exec(
		`
			DELETE FROM assets
			WHERE id IN (
				SELECT A.id
				FROM assets A
				INNER JOIN portfolios P ON P.id = A.portfolio_id
				INNER JOIN users U ON U.id = P.user_id
				WHERE P.id=? AND U.id=?
				LIMIT 1
			);
		`, id, portfolioId, user.Id)
	if err != nil {
		return err
	}
	if rows, err := result.RowsAffected(); rows < 1 {
		return err
	}
	return nil
}
