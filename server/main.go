package main

import (
	"goidaps/db"
	"goidaps/routes"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	db.Connect() // Подключение к бд

	router := gin.Default() // Инициализация роутера

	router.Static("/static", "../client/dist") // Статические файлы

	routes.SetupRoutes(router) // Установка путей

	// Запуск сервера на указанном хосте и порте
	// if err := router.Run("195.133.76.13:8080"); err != nil {
	// 	log.Fatalf("Ошибка запуска сервера: %v", err)
	// }

	if err := router.Run("localhost:8080"); err != nil {
		log.Fatalf("Ошибка запуска сервера: %v", err)
	}
}
