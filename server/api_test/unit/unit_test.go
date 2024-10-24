package unit

import (
	"bytes"
	"encoding/json"
	"goidaps/controllers"
	"goidaps/db"
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

func TestUploadImageRoute(t *testing.T) {
	router := gin.Default()
	router.POST("/api/images/upload", controllers.UploadImageController)

	filePath := "../testdata/test_image.jpg"
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		t.Fatalf("File does not exist: %v", err)
	}

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

	var response UploadResponse
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)

	assert.Equal(t, "изображение загружено", response.Message)

	currentImageID = response.ID
	currentImageType = response.Type
}

func TestGetImageRoute(t *testing.T) {
	router := gin.Default()
	router.GET("/api/images/:id", controllers.GetImageController)

	if currentImageID == "" {
		t.Fatal("currentImageID не должен быть пустым")
	}

	req, _ := http.NewRequest("GET", "/api/images/"+currentImageID, nil)

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	assert.Equal(t, currentImageType, w.Header().Get("Content-Type"))
}

func TestFlipImageRoute(t *testing.T) {
	router := gin.Default()
	router.POST("/api/images/flip/:id/:direction", controllers.FlipImageController)

	if currentImageID == "" {
		t.Fatal("currentImageID не должен быть пустым")
	}

	req, _ := http.NewRequest("POST", "/api/images/flip/"+currentImageID+"/x", nil)

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	assert.Contains(t, w.Body.String(), "изображение успешно отзеркалено")
}

func TestRotateImageRoute(t *testing.T) {
	router := gin.Default()
	router.POST("/api/images/rotate/:id/:direction", controllers.RotateImageController)

	if currentImageID == "" {
		t.Fatal("currentImageID не должен быть пустым")
	}

	req, _ := http.NewRequest("POST", "/api/images/rotate/"+currentImageID+"/right", nil)

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	assert.Contains(t, w.Body.String(), "изображение успешно перевернуто")
}

func TestResizeImageRoute(t *testing.T) {
	router := gin.Default()
	router.POST("/api/images/resize/:id", controllers.ResizeImageController)

	if currentImageID == "" {
		t.Fatal("currentImageID не должен быть пустым")
	}

	resizeRequest := struct {
		Width  int `json:"width" binding:"required"`
		Height int `json:"height" binding:"required"`
	}{
		Width:  800,
		Height: 600,
	}

	body, err := json.Marshal(resizeRequest)
	assert.NoError(t, err)

	req, err := http.NewRequest("POST", "/api/images/resize/"+currentImageID, bytes.NewBuffer(body))
	assert.NoError(t, err)
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	assert.Contains(t, w.Body.String(), "размер изображения успешно изменен")
}

func TestCropImageRoute(t *testing.T) {
	router := gin.Default()
	router.POST("/api/images/crop/:id", controllers.CropImageController)

	if currentImageID == "" {
		t.Fatal("currentImageID не должен быть пустым")
	}

	cropRequest := struct {
		X0 int `json:"x0"`
		Y0 int `json:"y0"`
		X1 int `json:"x1"`
		Y1 int `json:"y1" `
	}{
		X0: 100,
		Y0: 100,
		X1: 700,
		Y1: 700,
	}

	body, err := json.Marshal(cropRequest)
	assert.NoError(t, err)

	req, err := http.NewRequest("POST", "/api/images/crop/"+currentImageID, bytes.NewBuffer(body))
	assert.NoError(t, err)
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	assert.Contains(t, w.Body.String(), "изображение обрезалось успешно")
}

func TestFilterImageRoute(t *testing.T) {
	router := gin.Default()
	router.POST("/api/images/:id/filters/:filter", controllers.FilterImageController)

	if currentImageID == "" {
		t.Fatal("currentImageID не должен быть пустым")
	}

	filterRequest := struct {
		Param1 float32 `json:"param1"`
		Param2 float32 `json:"param2"`
		Param3 float32 `json:"param3"`
	}{
		Param1: 50,
		Param2: 100,
		Param3: 200,
	}

	body, err := json.Marshal(filterRequest)
	assert.NoError(t, err)

	req, err := http.NewRequest("POST", "/api/images/"+currentImageID+"/filters/ColorBalance", bytes.NewBuffer(body))
	assert.NoError(t, err)
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	assert.Contains(t, w.Body.String(), "изображение успешно обработано")
}

func TestSettingImageRoute(t *testing.T) {
	router := gin.Default()
	router.POST("/api/images/:id/settings", controllers.SettingsImageController)

	if currentImageID == "" {
		t.Fatal("currentImageID не должен быть пустым")
	}

	settingRequest := struct {
		Brightness float64 `json:"brightness"`
		Contrast   float64 `json:"contrast"`
		Gamma      float64 `json:"gamma"`
		Saturation float64 `json:"saturation"`
		Blur       float64 `json:"blur"`
	}{
		Brightness: 10,
		Contrast:   10,
		Gamma:      5,
		Saturation: 20,
		Blur:       1,
	}

	body, err := json.Marshal(settingRequest)
	assert.NoError(t, err)

	req, err := http.NewRequest("POST", "/api/images/"+currentImageID+"/settings", bytes.NewBuffer(body))
	assert.NoError(t, err)
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	assert.Contains(t, w.Body.String(), "изображение успешно обработано")
}
