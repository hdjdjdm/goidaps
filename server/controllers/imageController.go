package controllers

import (
	"goidaps/services"
	"net/http"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func UploadImageController(c *gin.Context) {
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "не удалось получить файл"})
		return
	}

	allowedExtensions := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
	}

	ext := filepath.Ext(file.Filename)
	if !allowedExtensions[ext] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "недопустимый тип файла"})
		return
	}

	const maxSize = 5 * 1024 * 1024
	if file.Size > maxSize {
		c.JSON(http.StatusBadRequest, gin.H{"error": "файл слишком большой"})
		return
	}

	imageID, err := services.UploadImage(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "изображение загружено", "id": imageID})
}

func GetImageController(c *gin.Context) {
	idParam := c.Param("id")
	id, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "недопустимый ID"})
		return
	}

	image, err := services.GetImageByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "изображение не найдено"})
		return
	}

	c.Header("Content-Type", image.Type)
	c.File(image.Path)
}
