package repository

import (
	"time"

	_ "github.com/mattn/go-sqlite3"
)

type Portfolio struct {
	Id          int64     `db:"id" json:"id"`
	UserId      int64     `db:"user_id" json:"user_id"`
	Name        string    `db:"name" json:"name"`
	Description *string   `db:"description" json:"description"`
	Created     time.Time `db:"created" json:"created"`
	Modified    time.Time `db:"modified" json:"modified"`
}

type PortfolioRepo struct {
	repo *Database
}

func NewPortfolioRepo(repo *Database) PortfolioRepo {
	return PortfolioRepo{repo}
}

func (r *PortfolioRepo) NewPortfolio(portfolio *Portfolio, user *User) (port Portfolio, err error) {
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
	return r.Portfolio(portfolioId, user)
}

func (r *PortfolioRepo) Portfolio(id int64, user *User) (asset Portfolio, err error) {
	err = (*r.repo).Db().Get(&asset,
		`
			SELECT P.*
			FROM portfolios P
			INNER JOIN users U on U.id = P.user_id
			WHERE P.id=? AND U.id=?
			LIMIT 1;
		`, id, user.Id)
	return asset, err
}

func (r *PortfolioRepo) Portfolios(paging *Paging, user *User) (portfolios []Portfolio, err error) {
	portfolios = make([]Portfolio, 0)
	err = (*r.repo).Db().Select(&portfolios,
		`
			SELECT P.*
			FROM portfolios P
			INNER JOIN users U on U.id = P.user_id
			WHERE U.id=?
			LIMIT ? OFFSET ?;
		`, user.Id, paging.pageSize, paging.Offset())
	return portfolios, err
}

func (repo *PortfolioRepo) Delete(id int64, user *User) (err error) {
	result, err := (*repo.repo).Db().Exec(
		`
			DELETE FROM portfolios
			WHERE id = (
				SELECT P.id
				FROM portfolios P
				INNER JOIN users U ON U.id = P.user_id
				WHERE P.id=? AND U.id=?
				LIMIT 1
			);
		`, id, user.Id)
	if err != nil {
		return err
	}
	if rows, err := result.RowsAffected(); rows < 1 {
		return err
	}
	return nil
}
