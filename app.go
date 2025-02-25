package main

import (
	"log"
	"log/slog"

	jwt "github.com/appleboy/gin-jwt/v2"
	"github.com/gin-gonic/gin"
	"github.com/venil7/assets-service/api"
	"github.com/venil7/assets-service/repository"
)

func setupRouter(appConfig *AppConfig) *gin.Engine {
	authMiddleware, err := jwt.New(api.JwtConfig())
	if err != nil {
		log.Fatal("JWT Error:" + err.Error())
	}
	slog.Debug("router", "auth", authMiddleware)

	db, err := repository.New(appConfig.Database)

	if err != nil {
		log.Fatal("Database:" + err.Error())
	}
	slog.Debug("router", "db", db)

	r := gin.Default()
	r.Use(repository.WithDb(&db))

	r.POST("/login", authMiddleware.LoginHandler)
	r.NoRoute(authMiddleware.MiddlewareFunc(), api.NoRouteHandler)

	apiGroup := r.Group("/api/v1", authMiddleware.MiddlewareFunc())
	assetsGroup := apiGroup.Group("/assets")
	assetsGroup.POST("/", api.NewAsset)

	authGroup := r.Group("/auth", authMiddleware.MiddlewareFunc())
	authGroup.GET("/refresh_token", authMiddleware.RefreshHandler)
	authGroup.GET("/hello", api.HelloHandler)

	return r
}

type App struct {
	config AppConfig
	router *gin.Engine
}

func NewApp() *App {
	appConfig, err := GetAppConfig()
	if err != nil {
		panic("Failed to obtain config")
	}
	slog.Info("App", "app-config", appConfig)
	router := setupRouter(&appConfig)
	return &App{appConfig, router}
}

func (app *App) Run() (err error) {
	slog.Info("App", "listening", app.config.BindAddress)
	return app.router.Run(app.config.BindAddress)
}
