package main

import (
	"log/slog"

	_ "github.com/caarlos0/env/v11"
	_ "github.com/gin-gonic/gin"
	_ "github.com/joho/godotenv"
)

func main() {
	appConfig, err := GetConfig()
	if err != nil {
		slog.Error("main", "app-config", err)
		panic("failed to obtain app-config")
	}
	slog.Info("main", "config", &appConfig)
	r := setupRouter(&appConfig)
	r.Run(appConfig.BindAddress)
}
