package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Image struct {
	ID   primitive.ObjectID `bson:"_id,omitempty"`
	Name string             `bson:"name"`
	Path string             `bson:"path"`
	Size int64              `bson:"size"`
	Type string             `bson:"type"`
	Hash string             `bson:"hash"`
}
