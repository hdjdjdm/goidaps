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
		api.POST("/images/rotate/:id/:direction", controllers.RotateImageController)
		api.POST("/images/resize/:id", controllers.ResizeImageController)
		api.POST("/images/crop/:id", controllers.CropImageController)

		// api.POST("/images/:id/filters/:filter", controllers.FilterImageController)
		api.POST("/images/:id/settings", controllers.SettingsImageController)

	}
}
