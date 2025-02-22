package main

import "github.com/caarlos0/env/v11"

type AppConfig struct {
	Database    string `env:"ASSETS_DB" envDefault:"./assets.db"`
	BindAddress string `env:"ASSETS_BIND" envDefault:"0.0.0.0:8080"`
}

func GetAppConfig() (AppConfig, error) {
	return env.ParseAs[AppConfig]()
}
