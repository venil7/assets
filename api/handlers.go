package api

import (
	"log"

	jwt "github.com/appleboy/gin-jwt/v2"
	"github.com/gin-gonic/gin"
	r "github.com/venil7/assets-service/repository"
)

func HelloHandler(c *gin.Context) {
	claims := jwt.ExtractClaims(c)
	user, _ := c.Get(IDENITY_KEY)
	c.JSON(200, gin.H{
		"userID":   claims[IDENITY_KEY],
		"userName": user.(*r.User).Username,
	})
}

func NoRouteHandler(c *gin.Context) {
	claims := jwt.ExtractClaims(c)
	log.Printf("NoRoute claims: %#v\n", claims)
	c.JSON(404, gin.H{"code": "PAGE_NOT_FOUND", "message": "Page not found"})
}
