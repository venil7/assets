package main

import (
	"log"
	"log/slog"

	jwt "github.com/appleboy/gin-jwt/v2"
	"github.com/gin-gonic/gin"
	"github.com/samber/do"
	"github.com/venil7/assets-service/api"
	"github.com/venil7/assets-service/di"
	"github.com/venil7/assets-service/repository"
)

func diInitialize(db *repository.Database) *do.Injector {
	inj := do.New()
	do.ProvideValue(inj, db)
	do.Provide(inj, repository.UserRepoProvider)
	do.Provide(inj, repository.AssetRepoProvider)
	do.Provide(inj, repository.PortfolioRepoProvider)
	do.Provide(inj, repository.TxRepoProvider)
	do.Provide(inj, repository.YahooServiceProvider)
	do.Provide(inj, api.AssetsApiProvider)
	do.Provide(inj, api.PortfolioApiProvider)
	do.Provide(inj, api.TxApiProvider)
	do.Provide(inj, api.YahooApiProvider)
	return inj
}

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

	inj := diInitialize(&db)

	router := gin.Default()
	router.Use(di.WithInjector(inj))
	router.NoRoute(api.NoRouteHandler)

	router.POST("/login", authMiddleware.LoginHandler)

	apiGroup := router.Group("/api/v1", authMiddleware.MiddlewareFunc())

	// AUTH
	authGroup := apiGroup.Group("/auth")
	authGroup.GET("/refresh_token", authMiddleware.RefreshHandler)

	// PORTFOLIOS & ASSETS & TX
	portfolioGroup := apiGroup.Group("/portfolio")

	PortfolioApi := do.MustInvoke[*api.PortfolioApi](inj)

	portfolioGroup.POST("/", PortfolioApi.New)
	portfolioGroup.GET("/", PortfolioApi.GetMany)
	portfolioGroup.GET("/:portfolio_id", PortfolioApi.Get)
	portfolioGroup.DELETE("/:portfolio_id", PortfolioApi.Delete)

	AssetsApi := do.MustInvoke[*api.AssetsApi](inj)

	portfolioGroup.POST("/:portfolio_id/assets", AssetsApi.New)
	portfolioGroup.GET("/:portfolio_id/assets/:asset_id", AssetsApi.Get)
	portfolioGroup.GET("/:portfolio_id/assets", AssetsApi.GetMany)
	portfolioGroup.DELETE("/:portfolio_id/assets/:asset_id", AssetsApi.Delete)

	TxApi := do.MustInvoke[*api.TxApi](inj)

	portfolioGroup.POST("/assets/:asset_id/transactions", TxApi.New)
	portfolioGroup.GET("/assets/:asset_id/transactions", TxApi.GetMany)
	portfolioGroup.GET("/assets/:asset_id/transactions/:transaction_id", TxApi.Get)
	portfolioGroup.DELETE("/assets/:asset_id/transactions/:transaction_id", TxApi.Delete)

	// YAHOO
	YahooApi := do.MustInvoke[*api.YahooApi](inj)

	lookupGroup := apiGroup.Group("/lookup")
	lookupGroup.GET("/ticker", YahooApi.LookupTicker)

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
