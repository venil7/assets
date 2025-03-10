package repository

import (
	"time"

	_ "github.com/mattn/go-sqlite3"
	"github.com/samber/do"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	Id       int64     `db:"id"`
	Username string    `db:"username"`
	Admin    bool      `db:"admin"`
	Phash    string    `db:"phash"`
	Psalt    string    `db:"psalt"`
	Created  time.Time `db:"created"`
	Modified time.Time `db:"modified"`
}

func (user *User) Check(suppliedPwd string) (bool, error) {
	err := bcrypt.CompareHashAndPassword([]byte(user.Phash), []byte(suppliedPwd+user.Psalt))
	if err != nil {
		if err == bcrypt.ErrMismatchedHashAndPassword {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

type UserRepository struct {
	repo *Database
}

func NewUserRepo(repo *Database) UserRepository {
	return UserRepository{repo}
}

func (userRepo *UserRepository) GetUser(username string) (User, error) {
	var user User
	err := (*userRepo.repo).Db().Get(&user,
		`
		SELECT *
		FROM users
		WHERE username=?
		LIMIT 1;
		`,
		username)
	return user, err
}

func UserRepoProvider(i *do.Injector) (*UserRepository, error) {
	db := do.MustInvoke[*Database](i)
	repo := NewUserRepo(db)
	return &repo, nil
}
