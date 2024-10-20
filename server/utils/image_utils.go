package utils

import (
	"fmt"
	"goidaps/models"
	"image"
	"io"
	"math/rand"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/disintegration/imaging"
)

func OpenImage(path string) (image.Image, error) {
	imgFile, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("не удалось открыть файл изображения: %v", err)
	}
	defer imgFile.Close()

	img, err := imaging.Decode(imgFile)
	if err != nil {
		return nil, fmt.Errorf("не удалось декодировать изображение: %v", err)
	}
	return img, nil
}

func SaveImage(path string, img image.Image, imageType string) error {
	outFile, err := os.Create(path)
	if err != nil {
		return fmt.Errorf("не удалось создать файл для сохранения: %v", err)
	}
	defer outFile.Close()

	var encodeErr error
	switch imageType {
	case "image/jpg":
		encodeErr = imaging.Encode(outFile, img, imaging.JPEG)
	case "image/jpeg":
		encodeErr = imaging.Encode(outFile, img, imaging.JPEG)
	case "image/png":
		encodeErr = imaging.Encode(outFile, img, imaging.PNG)
	default:
		return fmt.Errorf("неподдерживаемый формат изображения: %s", imageType)
	}

	if encodeErr != nil {
		return fmt.Errorf("не удалось сохранить изображение: %v", encodeErr)
	}

	return nil
}

func CreateImageDir() (string, error) {
	now := time.Now()
	year := now.Year()
	month := int(now.Month())

	randomGenerator := rand.New(rand.NewSource(time.Now().UnixNano()))
	randomString := fmt.Sprintf("%02d%02d", randomGenerator.Intn(100), randomGenerator.Intn(100))

	dirPath := filepath.Join("uploads", "images", strconv.Itoa(year), strconv.Itoa(month), randomString)
	err := os.MkdirAll(dirPath, os.ModePerm)
	if err != nil {
		return "", fmt.Errorf("не удалось создать директорию: %v", err)
	}

	return dirPath, nil
}

func SaveFile(filePath string, src io.Reader) error {
	out, err := os.Create(filePath)
	if err != nil {
		return fmt.Errorf("не удалось создать файл: %v", err)
	}
	defer out.Close()

	_, err = io.Copy(out, src)
	if err != nil {
		return fmt.Errorf("не удалось записать файл: %v", err)
	}
	return nil
}

func FileSize(path string) int64 {
	fileInfo, err := os.Stat(path)
	if err != nil {
		return 0
	}
	return fileInfo.Size()
}

func CalculateImageHash(imageRecord models.Image) (string, error) {
	imgFile, err := os.Open(imageRecord.Path)
	if err != nil {
		return "", fmt.Errorf("не удалось открыть файл для расчета хеша: %v", err)
	}
	defer imgFile.Close()

	newHash, err := CalculateFileHash(imgFile)
	if err != nil {
		return "", fmt.Errorf("не удалось рассчитать хеш файла: %v", err)
	}

	return newHash, nil
}
