package api

import (
	"github.com/gin-gonic/gin"
)

func NoRouteHandler(c *gin.Context) {
	c.JSON(404, gin.H{"code": "NOT_FOUND", "message": "Not found"})
}
