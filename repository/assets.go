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

type AssetContributions struct {
	AssetHodlings
	PortfolioContribution *float64 `db:"portfolio_contribution" json:"portfolio_contribution"`
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

func (repo *AssetRepository) New(asset *Asset, portfolioId int64, user *User) (ass AssetContributions, err error) {
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

func (repo *AssetRepository) Get(id int64, portfolioId int64, user *User) (asset AssetContributions, err error) {
	err = (*repo.repo).Db().Get(&asset, `
			SELECT id,portfolio_id,name,ticker,created,modified,holdings,invested,avg_price,portfolio_contribution
			FROM assets_contributions A
			WHERE A.id=? AND A.portfolio_id=? AND A.user_id=?
			LIMIT 1;
		`, id, portfolioId, user.Id)
	return asset, err
}

func (repo *AssetRepository) GetMany(paging *Paging, portfolioId int64, user *User) (assets []AssetContributions, err error) {
	assets = make([]AssetContributions, 0)
	err = (*repo.repo).Db().Select(&assets, `
			SELECT id,portfolio_id,name,ticker,created,modified,holdings,invested,avg_price,portfolio_contribution
			FROM assets_contributions A
			WHERE A.portfolio_id=? AND A.user_id=?
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
				WHERE P.id=? AND P.user_id=?
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
