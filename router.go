package main

import (
	"log"
	"log/slog"

	jwt "github.com/appleboy/gin-jwt/v2"
	"github.com/gin-gonic/gin"
)

var db = make(map[string]string)

func setupRouter(appConfig *AppConfig) *gin.Engine {
	auth, err := jwt.New(initParams(appConfig))
	if err != nil {
		log.Fatal("JWT Error:" + err.Error())
	}

	slog.Info("router", "auth", auth)

	r := gin.Default()

	r.POST("/login", auth.LoginHandler)
	r.POST("/logout", auth.LoginHandler)
	r.NoRoute(auth.MiddlewareFunc(), NoRouteHandler)

	authGroup := r.Group("/auth", auth.MiddlewareFunc())
	authGroup.GET("/refresh_token", auth.RefreshHandler)
	authGroup.GET("/hello", HelloHandler)

	// // Parse JSON
	// var json struct {
	// 	Value string `json:"value" binding:"required"`
	// }

	// if c.Bind(&json) == nil {
	// 	db[user] = json.Value
	// 	c.JSON(http.StatusOK, gin.H{"status": "ok"})
	// }

	return r
}
