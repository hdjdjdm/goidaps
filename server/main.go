package main

import (
	"goidaps/db"
	"goidaps/routes"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	db.Connect() // Подключение к бд

	router := gin.Default() // Инициализация роутера

	// Настройка для CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:8081"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	router.Static("/static", "../client/dist") // Статические файлы

	routes.SetupRoutes(router) // Установка путей

	// Запуск сервера на указанном хосте и порте
	if err := router.Run("localhost:8080"); err != nil {
		log.Fatalf("Ошибка запуска сервера: %v", err)
	}
}
