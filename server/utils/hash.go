package utils

import (
	"crypto/sha256"
	"encoding/hex"
	"io"
	"mime/multipart"
)

func CalculateFileHash(file multipart.File) (string, error) {
	hash := sha256.New()
	_, err := io.Copy(hash, file)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(hash.Sum(nil)), nil
}
