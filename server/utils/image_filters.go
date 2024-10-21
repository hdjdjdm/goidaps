package utils

import (
	"image"

	"github.com/disintegration/gift"
	"github.com/disintegration/imaging"
)

func Grayscale(img image.Image) image.Image {
	newImg := imaging.Grayscale(img)
	return newImg
}

func Invert(img image.Image) image.Image {
	newImg := imaging.Invert(img)
	return newImg
}

func Colorize(img image.Image) image.Image {
	g := gift.New(gift.Colorize(240, 50, 100))
	newImg := image.NewNRGBA(g.Bounds(img.Bounds()))
	g.Draw(newImg, img)
	return newImg
}
