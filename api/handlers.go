package api

import (
	"github.com/gin-gonic/gin"
)

// func HelloHandler(c *gin.Context) {
// 	claims := jwt.ExtractClaims(c)
// 	user, _ := c.Get(IDENITY_KEY)
// 	c.JSON(200, gin.H{
// 		"id":       claims[IDENITY_KEY],
// 		"username": user.(*r.User).Username,
// 	})
// }

func NoRouteHandler(c *gin.Context) {
	c.JSON(404, gin.H{"code": "NOT_FOUND", "message": "Not found"})
}
