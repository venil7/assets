package repository

import (
	"time"

	_ "github.com/mattn/go-sqlite3"
)

type Asset struct {
	Id       int64     `db:"id" json:"id"`
	Name     string    `db:"name" json:"name"`
	Ticker   string    `db:"ticker" json:"ticker"`
	UserId   string    `db:"user_id" json:"user_id"`
	Created  time.Time `db:"created" json:"created"`
	Modified time.Time `db:"modified" json:"modified"`
}

type AssetRepository struct {
	repo *Database
}

func NewAssetRepo(repo *Database) AssetRepository {
	return AssetRepository{repo}
}

func (assetRepo *AssetRepository) NewUserAsset(asset *Asset, user *User) (ass Asset, err error) {
	_, err = (*assetRepo.repo).Db().NamedExec(`
		INSERT INTO assets (name, ticker, isin, user_id, created, modified)
		VALUES (:name, :ticker, :isin, :user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
	`, asset)
	if err != nil {
		return
	}
	return assetRepo.Asset(asset.Id)
}

func (assetRepo *AssetRepository) Asset(id int64) (Asset, error) {
	var asset Asset
	err := (*assetRepo.repo).Db().Get(&asset,
		"SELECT * FROM `assets` WHERE `id`=? LIMIT 1;", id)
	return asset, err
}
