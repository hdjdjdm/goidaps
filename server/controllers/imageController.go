package controllers

import (
	"goidaps/models"
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

func FlipImageController(c *gin.Context) {
	idParam := c.Param("id")
	id, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "недопустимый ID"})
		return
	}

	direction := c.Param("direction")
	if direction != "y" {
		direction = "x"
	}

	ok, err := services.FlipImage(id, direction)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "не удалось отзеркалить изображение"})
		return
	}

	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "изображение не найдено"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "изображение успешно отзеркалено"})
}

func RotateImageController(c *gin.Context) {
	idParam := c.Param("id")
	id, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "недопустимый id"})
		return
	}

	direction := c.Param("direction")
	if direction != "left" {
		direction = "right"
	}

	ok, err := services.RotateImage(id, direction)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "не удалось перевернуть изображение"})
		return
	}

	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "изображение не найдено"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "изображение успешно перевернуто"})
}

func ResizeImageController(c *gin.Context) {
	idParam := c.Param("id")
	id, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "недопустимый id"})
		return
	}

	var resizeRequest struct {
		Width  int `json:"width" binding:"required"`
		Height int `json:"height" binding:"required"`
	}

	if err := c.ShouldBindJSON(&resizeRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "недопустимые параметры для изменения размера"})
		return
	}

	if resizeRequest.Width <= 0 || resizeRequest.Height <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ширина и высота должны быть положительными значениями"})
		return
	}

	ok, err := services.ResizeImage(id, resizeRequest.Width, resizeRequest.Height)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "не удалось изменить размер изображение"})
		return
	}

	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "изображение не найдено"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "размер изображения успешно изменено"})
}

func CropImageController(c *gin.Context) {
	idParam := c.Param("id")
	id, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "недопустимый id"})
		return
	}

	var cropRequest struct {
		X0 int `json:"x0" binding:"required"`
		Y0 int `json:"y0" binding:"required"`
		X1 int `json:"x1" binding:"required"`
		Y1 int `json:"y1" binding:"required"`
	}

	if err := c.ShouldBindJSON(&cropRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "недопустимые параметры для обрезки"})
		return
	}

	if cropRequest.X0 < 0 || cropRequest.Y0 < 0 || cropRequest.X1 < 0 || cropRequest.Y1 < 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "координаты должны быть положительными значениями"})
		return
	}

	ok, err := services.CropImage(id, cropRequest.X0, cropRequest.Y0, cropRequest.X1, cropRequest.Y1)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "не удалось обрезать изображение"})
		return
	}

	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "изображение не найдено"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "изображение обрезалось успешно изменено"})
}

func SettingsImageController(c *gin.Context) {
	idParam := c.Param("id")
	id, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "недопустимый id"})
		return
	}

	var params models.SettingsImageParams
	if err := c.BindJSON(&params); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "недопустимые параметры фильтра"})
		return
	}

	ok, err := services.SettingsImage(id, params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "не удалось обработать изображение"})
		return
	}

	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "изображение не найдено"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "изображение успешно обработано"})
}
