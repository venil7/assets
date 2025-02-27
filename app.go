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

	router := gin.Default()
	router.Use(repository.WithDb(&db))
	router.NoRoute(api.NoRouteHandler)

	router.POST("/login", authMiddleware.LoginHandler)

	apiGroup := router.Group("/api/v1", authMiddleware.MiddlewareFunc())

	// AUTH
	authGroup := apiGroup.Group("/auth")
	authGroup.GET("/refresh_token", authMiddleware.RefreshHandler)

	// PORTFOLIOS & ASSETS
	portfolioGroup := apiGroup.Group("/portfolio")
	portfolioGroup.POST("/", api.NewPortfolio)
	portfolioGroup.GET("/", api.Portfolios)
	portfolioGroup.GET("/:portfolio_id", api.Portfolio)
	portfolioGroup.GET("/:portfolio_id/assets/:asset_id", api.Asset)
	portfolioGroup.GET("/:portfolio_id/assets", api.Assets)
	portfolioGroup.POST("/:portfolio_id/assets", api.NewAsset)

	return router
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
