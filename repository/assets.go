package repository

import (
	"time"

	_ "github.com/mattn/go-sqlite3"
	"github.com/samber/do"
)

type Asset struct {
	Id         int64     `db:"id" json:"id"`
	PorfolioId int64     `db:"portfolio_id" json:"portfolio_id"`
	Name       string    `db:"name" json:"name"`
	Ticker     string    `db:"ticker" json:"ticker"`
	Created    time.Time `db:"created" json:"created"`
	Modified   time.Time `db:"modified" json:"modified"`
}

type AssetHodlings struct {
	Asset
	Holdings float64  `db:"holdings" json:"holdings"`
	Invested float64  `db:"invested" json:"invested"`
	AvgPrice *float64 `db:"avg_price" json:"avg_price"`
}

type AssetRepository struct {
	repo *Database
}

func NewAssetRepo(repo *Database) AssetRepository {
	return AssetRepository{repo}
}

func AssetRepoProvider(i *do.Injector) (*AssetRepository, error) {
	db := do.MustInvoke[*Database](i)
	repo := NewAssetRepo(db)
	return &repo, nil
}

func (repo *AssetRepository) New(asset *Asset, portfolioId int64, user *User) (ass AssetHodlings, err error) {
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
	return repo.Get(assetId, portfolioId, user)
}

func (repo *AssetRepository) Get(id int64, portfolioId int64, user *User) (asset AssetHodlings, err error) {
	err = (*repo.repo).Db().Get(&asset, `
			SELECT
				SUB.*,
       	CASE WHEN SUB.holdings = 0 THEN NULL ELSE SUB.invested/SUB.holdings END AS avg_price
			FROM
			(SELECT A.*,
		    COALESCE(SUM(CASE WHEN t.type = 'buy' THEN t.quantity ELSE -t.quantity END),0) AS holdings,
    		COALESCE(SUM(CASE WHEN t.type = 'buy' THEN t.quantity * t.price ELSE -t.quantity * t.price END),0) AS invested
			FROM assets A
				INNER JOIN portfolios P ON P.id = A.portfolio_id
				LEFT JOIN transactions T on T.asset_id = A.id
				INNER JOIN users U ON U.id = P.user_id
			WHERE A.id=? AND P.id=? AND U.id=?
			GROUP BY A.id, A.name) AS SUB
			LIMIT 1;
		`, id, portfolioId, user.Id)
	return asset, err
}

func (repo *AssetRepository) GetMany(paging *Paging, portfolioId int64, user *User) (assets []AssetHodlings, err error) {
	assets = make([]AssetHodlings, 0)
	err = (*repo.repo).Db().Select(&assets, `
			SELECT
				SUB.*,
       	CASE WHEN SUB.holdings = 0 THEN NULL ELSE SUB.invested/SUB.holdings END AS avg_price
			FROM
			(SELECT A.*,
		    COALESCE(SUM(CASE WHEN t.type = 'buy' THEN t.quantity ELSE -t.quantity END),0) AS holdings,
    		COALESCE(SUM(CASE WHEN t.type = 'buy' THEN t.quantity * t.price ELSE -t.quantity * t.price END),0) AS invested
			FROM assets A
				INNER JOIN portfolios P ON P.id = A.portfolio_id
				LEFT JOIN transactions T on T.asset_id = A.id
				INNER JOIN users U ON U.id = P.user_id
			WHERE P.id=? AND U.id=?
			GROUP BY A.id, A.name) AS SUB
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
