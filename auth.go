package main

import (
	"log/slog"
	"time"

	jwt "github.com/appleboy/gin-jwt/v2"
	"github.com/caarlos0/env/v11"
	"github.com/gin-gonic/gin"

	"github.com/venil7/assets-service/repository"
	r "github.com/venil7/assets-service/repository"
)

type SecurityConfig struct {
	Realm string `env:"ASSETS_SECURITY_REALM" envDefault:"assets"`
	Key   string `env:"ASSETS_SECURITY_KEY" envDefault:"secret"`
}

func securityConfig() (SecurityConfig, error) {
	return env.ParseAs[SecurityConfig]()
}

type login struct {
	Username string `form:"username" json:"username" binding:"required"`
	Password string `form:"password" json:"password" binding:"required"`
}

const IDENITY_KEY = "id"
const ADMIN_KEY = "admin"

func NewJwtMiddleware() *jwt.GinJWTMiddleware {
	conf, err := securityConfig()
	if err != nil {
		slog.Error("JWT", "failed to get config", err)
		panic("Failed to get jwt config")
	}

	return &jwt.GinJWTMiddleware{
		Realm:       conf.Realm,
		Key:         []byte(conf.Key),
		Timeout:     time.Hour,
		MaxRefresh:  time.Hour,
		IdentityKey: IDENITY_KEY,
		PayloadFunc: payloadFunc,

		IdentityHandler: identityHandler,
		Authenticator:   authenticate,
		Authorizator:    authorize,
		Unauthorized:    unauthorized,
		TokenLookup:     "header: Authorization, query: token, cookie: jwt",
		// TokenLookup: "query:token",
		// TokenLookup: "cookie:token",
		TokenHeadName: "Bearer",
		TimeFunc:      time.Now,
	}
}

func payloadFunc(data any) jwt.MapClaims {
	if user, ok := data.(r.User); ok {
		return jwt.MapClaims{
			ADMIN_KEY:   user.Admin,
			IDENITY_KEY: user.Username,
		}
	}
	return jwt.MapClaims{}
}

func identityHandler(ctx *gin.Context) any {
	claims := jwt.ExtractClaims(ctx)
	return &r.User{
		Admin:    claims[ADMIN_KEY].(bool),
		Username: claims[IDENITY_KEY].(string),
	}
}

func authenticate(ctx *gin.Context) (any, error) {
	var loginVals login
	if err := ctx.ShouldBind(&loginVals); err != nil {
		return nil, jwt.ErrMissingLoginValues
	}
	slog.Debug("authenticator", "login", loginVals.Username)

	db, err := r.GetDb(ctx)
	if err != nil {
		slog.Error("authenticator", "db", err)
		return nil, err
	}
	slog.Debug("authenticator", "db", db)
	userRepo := repository.NewUserRepository(db)
	user, err := userRepo.GetUser(loginVals.Username)
	if valid, err := user.Check(loginVals.Password); !valid || err != nil {
		return nil, jwt.ErrFailedAuthentication
	}

	return user, nil
}

func authorize(data any, c *gin.Context) bool {
	if v, ok := data.(*r.User); ok && v.Admin {
		return true
	}
	return false
}

func unauthorized(c *gin.Context, code int, message string) {
	c.JSON(code, gin.H{
		"code":    code,
		"message": message,
	})
}
