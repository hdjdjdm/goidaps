package routes

import (
	"goidaps/controllers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	api := router.Group("/api")
	{
		api.POST("/images/upload", controllers.UploadImageController)
		api.GET("/images/:id", controllers.GetImageController)
		api.POST("/images/flip/:id/:direction", controllers.FlipImageController)
	}
}
