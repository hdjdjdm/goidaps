package services

import (
	"context"
	"fmt"
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
