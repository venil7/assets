package main

import (
	_ "log"
	"log/slog"

	_ "github.com/caarlos0/env/v11"
	_ "github.com/joho/godotenv"
)

func main() {
	config, err := GetConfig()
	if err != nil {
		slog.Error("main", "config", err)
		panic("failed to obtain config")
	}
	slog.Info("main", "config", config)
}
