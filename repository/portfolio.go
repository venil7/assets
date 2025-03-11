package repository

import (
	"time"

	_ "github.com/mattn/go-sqlite3"
	"github.com/samber/do"
)

type Portfolio struct {
	Id          int64     `db:"id" json:"id"`
	UserId      int64     `db:"user_id" json:"user_id"`
	Name        string    `db:"name" json:"name"`
	Description string    `db:"description" json:"description"`
	Created     time.Time `db:"created" json:"created"`
	Modified    time.Time `db:"modified" json:"modified"`
}
type PortfolioExt struct {
	Portfolio
	TotalInvested float64 `db:"total_invested" json:"total_invested"`
	NumAssets     float64 `db:"num_assets" json:"num_assets"`
}

type PortfolioRepo struct {
	repo *Database
}

func NewPortfolioRepo(repo *Database) PortfolioRepo {
	return PortfolioRepo{repo}
}

func PortfolioRepoProvider(i *do.Injector) (*PortfolioRepo, error) {
	db := do.MustInvoke[*Database](i)
	repo := NewPortfolioRepo(db)
	return &repo, nil
}

func (r *PortfolioRepo) New(portfolio *Portfolio, user *User) (port PortfolioExt, err error) {
	portfolio.UserId = user.Id

	result, err := (*r.repo).Db().NamedExec(`
		INSERT INTO portfolios(name, description, user_id)
		VALUES(:name, :description, :user_id)
	`, portfolio)
	if err != nil {
		return
	}
	portfolioId, err := result.LastInsertId()
	if err != nil {
		return
	}
	return r.Get(portfolioId, user)
}

func (r *PortfolioRepo) Get(id int64, user *User) (asset PortfolioExt, err error) {
	err = (*r.repo).Db().Get(&asset,
		`
			SELECT P.*
			FROM portfolios_ext P
			WHERE P.id=? AND P.user_id=?
			LIMIT 1;
		`, id, user.Id)
	return asset, err
}

func (r *PortfolioRepo) GetMany(paging *Paging, user *User) (portfolios []PortfolioExt, err error) {
	portfolios = make([]PortfolioExt, 0)
	err = (*r.repo).Db().Select(&portfolios,
		`
			SELECT P.*
			FROM portfolios_ext P
			WHERE P.user_id=?
			LIMIT ? OFFSET ?;
		`, user.Id, paging.pageSize, paging.Offset())
	return portfolios, err
}

func (repo *PortfolioRepo) Delete(id int64, user *User) (err error) {
	result, err := (*repo.repo).Db().Exec(
		`
			DELETE FROM portfolios
			WHERE id=? AND user_id=?;
		`, id, user.Id)
	if err != nil {
		return err
	}
	if rows, err := result.RowsAffected(); rows < 1 {
		return err
	}
	return nil
}
