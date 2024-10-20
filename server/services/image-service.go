package services

import (
	"context"
	"fmt"
	"image"
	"io"
	"math/rand"
	"mime/multipart"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"goidaps/db"
	"goidaps/models"
	"goidaps/utils"

	"github.com/disintegration/imaging"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func UploadImage(file *multipart.FileHeader) (primitive.ObjectID, error) {
	now := time.Now()
	year := now.Year()
	month := int(now.Month())

	rand.Seed(time.Now().UnixNano())
	randomString := fmt.Sprintf("%02d%02d", rand.Intn(100), rand.Intn(100))

	dirPath := filepath.Join("uploads", "images", strconv.Itoa(year), strconv.Itoa(month), randomString)
	err := os.MkdirAll(dirPath, os.ModePerm)
	if err != nil {
		return primitive.ObjectID{}, fmt.Errorf("не удалось создать директорию: %v", err)
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

	collection := db.GetCollection()
	var existingImage models.Image
	err = collection.FindOne(context.TODO(), bson.M{"name": fileName, "hash": hash}).Decode(&existingImage)
	if err == nil {
		return existingImage.ID, nil
	} else if err != mongo.ErrNoDocuments {
		return primitive.ObjectID{}, fmt.Errorf("не удалось проверить существование изображения: %v", err)
	}

	if _, err := src.Seek(0, 0); err != nil {
		return primitive.ObjectID{}, fmt.Errorf("не удалось сбросить указатель файла: %v", err)
	}

	out, err := os.Create(filePath)
	if err != nil {
		return primitive.ObjectID{}, fmt.Errorf("не удалось создать файл: %v", err)
	}
	defer out.Close()

	_, err = io.Copy(out, src)
	if err != nil {
		return primitive.ObjectID{}, fmt.Errorf("не удалось записать файл: %v", err)
	}

	image := models.Image{
		Name: fileName,
		Path: filePath,
		Size: file.Size,
		Type: file.Header.Get("Content-Type"),
		Hash: hash,
	}

	insertResult, err := collection.InsertOne(context.TODO(), image)
	if err != nil {
		return primitive.ObjectID{}, fmt.Errorf("не удалось сохранить данные в БД: %v", err)
	}

	imageID := insertResult.InsertedID.(primitive.ObjectID)

	return imageID, nil
}

func GetImageByID(id primitive.ObjectID) (*models.Image, error) {
	collection := db.GetCollection()
	var image models.Image
	err := collection.FindOne(context.TODO(), bson.M{"_id": id}).Decode(&image)
	if err != nil {
		return nil, err
	}
	return &image, nil
}

func FlipImage(id primitive.ObjectID, direction string) (bool, error) {
	collection := db.GetCollection()
	var imageRecord models.Image
	err := collection.FindOne(context.TODO(), bson.M{"_id": id}).Decode(&imageRecord)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return false, fmt.Errorf("изображение с таким ID не найдено")
		}
		return false, fmt.Errorf("не удалось получить изображение: %v", err)
	}

	imgFile, err := os.Open(imageRecord.Path)
	if err != nil {
		return false, fmt.Errorf("не удалось открыть файл изображения: %v", err)
	}
	defer imgFile.Close()

	img, err := imaging.Decode(imgFile)
	if err != nil {
		return false, fmt.Errorf("не удалось декодировать изображение: %v", err)
	}

	var flippedImg image.Image
	if direction == "x" {
		flippedImg = imaging.FlipH(img)
	} else if direction == "y" {
		flippedImg = imaging.FlipV(img)
	} else {
		return false, fmt.Errorf("неизвестное направление отзеркаливания: %s", direction)
	}

	outFile, err := os.Create(imageRecord.Path)
	if err != nil {
		return false, fmt.Errorf("не удалось создать файл для сохранения: %v", err)
	}
	defer outFile.Close()

	err = imaging.Encode(outFile, flippedImg, imaging.PNG)
	if err != nil {
		return false, fmt.Errorf("не удалось сохранить отзеркаленное изображение: %v", err)
	}

	newImgFile, err := os.Open(imageRecord.Path)
	if err != nil {
		return false, fmt.Errorf("не удалось открыть файл для расчета хеша: %v", err)
	}
	defer newImgFile.Close()

	newHash, err := utils.CalculateFileHash(newImgFile)
	if err != nil {
		return false, fmt.Errorf("не удалось рассчитать хеш файла: %v", err)
	}

	update := bson.M{
		"$set": bson.M{
			"size": utils.FileSize(imageRecord.Path),
			"hash": newHash,
		},
	}

	_, err = collection.UpdateOne(context.TODO(), bson.M{"_id": id}, update)
	if err != nil {
		return false, fmt.Errorf("не удалось обновить данные изображения в БД: %v", err)
	}

	return true, nil
}

func RotateImage(id primitive.ObjectID, direction string) (bool, error) {
	collection := db.GetCollection()
	var imageRecord models.Image
	err := collection.FindOne(context.TODO(), bson.M{"_id": id}).Decode(&imageRecord)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return false, fmt.Errorf("изображение с таким ID не найдено")
		}
		return false, fmt.Errorf("не удалось получить изображение: %v", err)
	}

	imgFile, err := os.Open(imageRecord.Path)
	if err != nil {
		return false, fmt.Errorf("не удалось открыть файл изображения: %v", err)
	}
	defer imgFile.Close()

	img, err := imaging.Decode(imgFile)
	if err != nil {
		return false, fmt.Errorf("не удалось декодировать изображение: %v", err)
	}

	var rotatedImg image.Image
	if direction == "left" {
		rotatedImg = imaging.Rotate90(img)
	} else if direction == "right" {
		rotatedImg = imaging.Rotate270(img)
	} else {
		return false, fmt.Errorf("неизвестное направление для поворота: %v", direction)
	}

	outFile, err := os.Create(imageRecord.Path)
	if err != nil {
		return false, fmt.Errorf("не удалось создать файл для сохранения: %v", err)
	}
	defer outFile.Close()

	err = imaging.Encode(outFile, rotatedImg, imaging.PNG)
	if err != nil {
		return false, fmt.Errorf("не удалось сохранить повернутое изображение: %v", err)
	}

	newImgFile, err := os.Open(imageRecord.Path)
	if err != nil {
		return false, fmt.Errorf("не удалось открыть файл для рачета хеша: %v", err)
	}
	defer newImgFile.Close()

	newHash, err := utils.CalculateFileHash(newImgFile)
	if err != nil {
		return false, fmt.Errorf("не удалось расчитать хеш файла: %v", err)
	}

	update := bson.M{
		"$set": bson.M{
			"size": utils.FileSize(imageRecord.Path),
			"hash": newHash,
		},
	}

	_, err = collection.UpdateOne(context.TODO(), bson.M{"_id": id}, update)
	if err != nil {
		return false, fmt.Errorf("не удалось обновить данные изображения в БД: %v", err)
	}

	return true, nil
}
