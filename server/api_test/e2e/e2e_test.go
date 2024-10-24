package e2e

import (
	"bytes"
	"encoding/json"
	"goidaps/db"
	"goidaps/routes"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

type UploadResponse struct {
	ID      string `json:"id"`
	Message string `json:"message"`
	Type    string `json:"type"`
}

var currentImageID string
var currentImageType string

func TestMain(m *testing.M) {
	gin.SetMode(gin.TestMode)
	db.Connect()
	code := m.Run()
	os.Exit(code)
}

func TestUploadResizeAndGetImageE2E(t *testing.T) {

	router := gin.Default()
	routes.SetupRoutes(router)

	// Загрузка
	filePath := "../testdata/test_image.jpg"
	body := new(bytes.Buffer)
	writer := multipart.NewWriter(body)
	file, err := os.Open(filePath)
	assert.NoError(t, err)
	defer file.Close()
	part, err := writer.CreateFormFile("image", filepath.Base(filePath))
	assert.NoError(t, err)
	_, err = io.Copy(part, file)
	assert.NoError(t, err)
	writer.Close()

	req, _ := http.NewRequest("POST", "/api/images/upload", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var uploadResponse UploadResponse
	err = json.Unmarshal(w.Body.Bytes(), &uploadResponse)
	assert.NoError(t, err)

	// Изменение размера загруженного изображения
	resizeBody := `{"width": 1000, "height": 600}`
	req, _ = http.NewRequest("POST", "/api/images/resize/"+uploadResponse.ID, bytes.NewBuffer([]byte(resizeBody)))
	req.Header.Set("Content-Type", "application/json")

	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "размер изображения успешно изменен")

	// Получение изображения
	req, _ = http.NewRequest("GET", "/api/images/"+uploadResponse.ID, nil)

	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Equal(t, uploadResponse.Type, w.Header().Get("Content-Type"))
}

func TestUploadAndAdjustBrightnessE2E(t *testing.T) {

	router := gin.Default()
	routes.SetupRoutes(router)

	// Загрузка
	filePath := "../testdata/test_image.jpg"
	body := new(bytes.Buffer)
	writer := multipart.NewWriter(body)
	file, err := os.Open(filePath)
	assert.NoError(t, err)
	defer file.Close()
	part, err := writer.CreateFormFile("image", filepath.Base(filePath))
	assert.NoError(t, err)
	_, err = io.Copy(part, file)
	assert.NoError(t, err)
	writer.Close()

	req, _ := http.NewRequest("POST", "/api/images/upload", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var uploadResponse UploadResponse
	err = json.Unmarshal(w.Body.Bytes(), &uploadResponse)
	assert.NoError(t, err)

	// Изменение яркости
	settingBody := `{"brightness": 10}`
	req, _ = http.NewRequest("POST", "/api/images/"+uploadResponse.ID+"/settings", bytes.NewBuffer([]byte(settingBody)))
	req.Header.Set("Content-Type", "application/json")

	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "изображение успешно обработано")
}

func TestProcessImageE2E(t *testing.T) {

	router := gin.Default()
	routes.SetupRoutes(router)

	// Загрузка
	filePath := "../testdata/test_image.jpg"
	body := new(bytes.Buffer)
	writer := multipart.NewWriter(body)
	file, err := os.Open(filePath)
	assert.NoError(t, err)
	defer file.Close()
	part, err := writer.CreateFormFile("image", filepath.Base(filePath))
	assert.NoError(t, err)
	_, err = io.Copy(part, file)
	assert.NoError(t, err)
	writer.Close()

	req, _ := http.NewRequest("POST", "/api/images/upload", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var uploadResponse UploadResponse
	err = json.Unmarshal(w.Body.Bytes(), &uploadResponse)
	assert.NoError(t, err)

	// Настройка изображения
	settingBody := `{"brightness": -10, "contrast": -20, "gamma": 3, "saturation": 4}`
	req, _ = http.NewRequest("POST", "/api/images/"+uploadResponse.ID+"/settings", bytes.NewBuffer([]byte(settingBody)))
	req.Header.Set("Content-Type", "application/json")

	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "изображение успешно обработано")

	// Обрезка изображения
	cropBody := `{"x0": 100, "y0": 100, "x1": 500, "y1": 500}`
	req, _ = http.NewRequest("POST", "/api/images/crop/"+uploadResponse.ID, bytes.NewBuffer([]byte(cropBody)))
	req.Header.Set("Content-Type", "application/json")

	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "изображение обрезалось успешно")

	// Переворачивание изображения
	req, _ = http.NewRequest("POST", "/api/images/rotate/"+uploadResponse.ID+"/right", bytes.NewBuffer([]byte(cropBody)))
	req.Header.Set("Content-Type", "application/json")

	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "изображение успешно перевернуто")
}
