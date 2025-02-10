package main

import "github.com/caarlos0/env/v11"

type Config struct {
	Database    string `env:"DATABASE" envDefault:"./assets.db"`
	BindAddress string `env:"BIND_ADDRESS" envDefault:"0.0.0.0:8080"`
}

func GetConfig() (Config, error) {
	return env.ParseAs[Config]()
}
