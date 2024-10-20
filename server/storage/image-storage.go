package storage

import (
	"context"
	"fmt"
	"goidaps/db"
	"goidaps/models"
	"goidaps/utils"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func GetImageByID(id primitive.ObjectID) (models.Image, error) {
	collection := db.GetCollection()
	var imageRecord models.Image
	err := collection.FindOne(context.TODO(), bson.M{"_id": id}).Decode(&imageRecord)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return imageRecord, fmt.Errorf("изображение с таким ID не найдено")
		}
		return imageRecord, fmt.Errorf("не удалось получить изображение: %v", err)
	}

	return imageRecord, nil
}

func UpdateImageRecord(id primitive.ObjectID, imagePath, hash string) error {
	collection := db.GetCollection()

	update := bson.M{
		"$set": bson.M{
			"size": utils.FileSize(imagePath),
			"hash": hash,
		},
	}

	_, err := collection.UpdateOne(context.TODO(), bson.M{"_id": id}, update)
	if err != nil {
		return fmt.Errorf("не удалось обновить данные изображения в БД: %v", err)
	}

	return nil
}

func FindExistingImage(fileName string, hash string) (models.Image, bool, error) {
	collection := db.GetCollection()
	var existingImage models.Image
	err := collection.FindOne(context.TODO(), bson.M{"name": fileName, "hash": hash}).Decode(&existingImage)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return existingImage, false, nil
		}
		return existingImage, false, fmt.Errorf("не удалось проверить существование изображения: %v", err)
	}
	return existingImage, true, nil
}

func InsertImage(image models.Image) (primitive.ObjectID, error) {
	collection := db.GetCollection()
	insertResult, err := collection.InsertOne(context.TODO(), image)
	if err != nil {
		return primitive.ObjectID{}, fmt.Errorf("не удалось сохранить данные в БД: %v", err)
	}
	return insertResult.InsertedID.(primitive.ObjectID), nil
}
