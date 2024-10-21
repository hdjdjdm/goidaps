package services

import (
	"context"
	"fmt"
	"image"
	"mime/multipart"
	"path/filepath"

	"goidaps/db"
	"goidaps/models"
	"goidaps/storage"
	"goidaps/utils"

	"github.com/disintegration/imaging"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func UploadImage(file *multipart.FileHeader) (primitive.ObjectID, error) {
	dirPath, err := utils.CreateImageDir()
	if err != nil {
		return primitive.ObjectID{}, err
	}

	fileName := filepath.Base(file.Filename)
	filePath := filepath.Join(dirPath, fileName)

	src, err := file.Open()
	if err != nil {
		return primitive.ObjectID{}, fmt.Errorf("не удалось открыть файл: %v", err)
	}
	defer src.Close()

	hash, err := utils.CalculateFileHash(src)
	if err != nil {
		return primitive.ObjectID{}, fmt.Errorf("не удалось вычислить хэш: %v", err)
	}

	existingImage, found, err := storage.FindExistingImage(fileName, hash)
	if err != nil {
		return primitive.ObjectID{}, err
	}
	if found {
		return existingImage.ID, nil
	}

	if _, err := src.Seek(0, 0); err != nil {
		return primitive.ObjectID{}, fmt.Errorf("не удалось сбросить указатель файла: %v", err)
	}

	if err := utils.SaveFile(filePath, src); err != nil {
		return primitive.ObjectID{}, err
	}

	image := models.Image{
		Name: fileName,
		Path: filePath,
		Size: file.Size,
		Type: file.Header.Get("Content-Type"),
		Hash: hash,
	}

	imageID, err := storage.InsertImage(image)
	if err != nil {
		return primitive.ObjectID{}, err
	}

	return imageID, nil
}

func GetImageByID(id primitive.ObjectID) (*models.Image, error) {
	collection := db.GetCollection()

	// time.Sleep(1 * time.Second)

	var image models.Image
	err := collection.FindOne(context.TODO(), bson.M{"_id": id}).Decode(&image)
	if err != nil {
		return nil, err
	}
	return &image, nil
}

func FlipImage(id primitive.ObjectID, direction string) (bool, error) {
	imageRecord, err := storage.GetImageByID(id)
	if err != nil {
		return false, err
	}

	img, err := utils.OpenImage(imageRecord.Path)
	if err != nil {
		return false, err
	}

	var flippedImg image.Image
	switch direction {
	case "x":
		flippedImg = imaging.FlipH(img)
	case "y":
		flippedImg = imaging.FlipV(img)
	default:
		return false, fmt.Errorf("неизвестное направление отзеркаливания: %s", direction)
	}

	err = utils.SaveImage(imageRecord.Path, flippedImg, imageRecord.Type)
	if err != nil {
		return false, err
	}

	newHash, err := utils.CalculateImageHash(imageRecord)
	if err != nil {
		return false, err
	}

	err = storage.UpdateImageRecord(id, imageRecord.Path, newHash)
	if err != nil {
		return false, err
	}

	return true, nil
}

func RotateImage(id primitive.ObjectID, direction string) (bool, error) {
	imageRecord, err := storage.GetImageByID(id)
	if err != nil {
		return false, err
	}

	img, err := utils.OpenImage(imageRecord.Path)
	if err != nil {
		return false, err
	}

	var rotatedImg image.Image
	switch direction {
	case "left":
		rotatedImg = imaging.Rotate90(img)
	case "right":
		rotatedImg = imaging.Rotate270(img)
	default:
		return false, fmt.Errorf("неизвестное направление для поворота: %v", direction)
	}

	err = utils.SaveImage(imageRecord.Path, rotatedImg, imageRecord.Type)
	if err != nil {
		return false, err
	}

	newHash, err := utils.CalculateImageHash(imageRecord)
	if err != nil {
		return false, err
	}

	err = storage.UpdateImageRecord(id, imageRecord.Path, newHash)
	if err != nil {
		return false, err
	}

	return true, nil
}

func ResizeImage(id primitive.ObjectID, width, heigth int) (bool, error) {
	imageRecord, err := storage.GetImageByID(id)
	if err != nil {
		return false, err
	}

	img, err := utils.OpenImage(imageRecord.Path)
	if err != nil {
		return false, err
	}

	newImg := imaging.Resize(img, width, heigth, imaging.Lanczos)

	err = utils.SaveImage(imageRecord.Path, newImg, imageRecord.Type)
	if err != nil {
		return false, err
	}

	newHash, err := utils.CalculateImageHash(imageRecord)
	if err != nil {
		return false, err
	}

	err = storage.UpdateImageRecord(id, imageRecord.Path, newHash)
	if err != nil {
		return false, err
	}

	return true, nil
}

func CropImage(id primitive.ObjectID, x0, y0, x1, y1 int) (bool, error) {
	imageRecord, err := storage.GetImageByID(id)
	if err != nil {
		return false, err
	}

	img, err := utils.OpenImage(imageRecord.Path)
	if err != nil {
		return false, err
	}

	newImg := imaging.Crop(img, image.Rect(x0, y0, x1, y1))

	err = utils.SaveImage(imageRecord.Path, newImg, imageRecord.Type)
	if err != nil {
		return false, err
	}

	newHash, err := utils.CalculateImageHash(imageRecord)
	if err != nil {
		return false, err
	}

	err = storage.UpdateImageRecord(id, imageRecord.Path, newHash)
	if err != nil {
		return false, err
	}

	return true, nil
}

func SettingsImage(id primitive.ObjectID, params models.SettingsImageParams) (bool, error) {
	imageRecord, err := storage.GetImageByID(id)
	if err != nil {
		return false, err
	}

	img, err := utils.OpenImage(imageRecord.Path)
	if err != nil {
		return false, err
	}

	var newImg image.Image = img

	if params.Brightness != nil {
		brightness := *params.Brightness
		newImg = utils.Brightness(newImg, brightness)
	}

	if params.Contrast != nil {
		contrast := *params.Contrast
		newImg = utils.Contrast(newImg, contrast)
	}

	if params.Gamma != nil {
		gamma := *params.Gamma
		newImg = utils.Gamma(newImg, gamma)
	}

	if params.Blur != nil {
		blur := *params.Blur
		newImg = utils.Blur(newImg, blur)
	}

	// if params.Grayscale != nil && *params.Grayscale {
	// 	// Логика применения черно-белого фильтра
	// 	newImg = applyGrayscale(newImg)
	// }

	err = utils.SaveImage(imageRecord.Path, newImg, imageRecord.Type)
	if err != nil {
		return false, err
	}

	newHash, err := utils.CalculateImageHash(imageRecord)
	if err != nil {
		return false, err
	}

	err = storage.UpdateImageRecord(id, imageRecord.Path, newHash)
	if err != nil {
		return false, err
	}

	return true, nil
}
