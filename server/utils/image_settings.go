package utils

import (
	"image"

	"github.com/disintegration/imaging"
)

func Brightness(img image.Image, brightness float64) image.Image {
	newImg := imaging.AdjustBrightness(img, brightness)
	return newImg
}

func Contrast(img image.Image, brightness float64) image.Image {
	newImg := imaging.AdjustContrast(img, brightness)
	return newImg
}

func Gamma(img image.Image, gamma float64) image.Image {
	newImg := imaging.AdjustGamma(img, gamma)
	return newImg
}

func Blur(img image.Image, blur float64) image.Image {
	newImg := imaging.Blur(img, blur)
	return newImg
}
