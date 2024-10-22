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

func Colorize(img image.Image, param1, param2, param3 float32) image.Image {
	if param1 < 0 {
		param1 = 0
	} else if param1 > 360 {
		param1 = 360
	}

	if param2 < 0 {
		param2 = 0
	} else if param2 > 100 {
		param2 = 100
	}

	if param3 < 0 {
		param3 = 0
	} else if param3 > 100 {
		param3 = 100
	}

	g := gift.New(gift.Colorize(param1, param2, param3))
	newImg := image.NewNRGBA(g.Bounds(img.Bounds()))
	g.Draw(newImg, img)
	return newImg
}

func Pixelate(img image.Image, param1 float32) image.Image {
	if param1 < 0 {
		param1 = 0
	} else if param1 > 100 {
		param1 = 100
	}

	g := gift.New(gift.Pixelate(int(param1)))
	newImg := image.NewNRGBA(g.Bounds(img.Bounds()))
	g.Draw(newImg, img)
	return newImg
}

func Sepia(img image.Image, param1 float32) image.Image {
	if param1 < 0 {
		param1 = 0
	} else if param1 > 100 {
		param1 = 100
	}

	g := gift.New(gift.Sepia(param1))
	newImg := image.NewNRGBA(g.Bounds(img.Bounds()))
	g.Draw(newImg, img)
	return newImg
}

func Sigmoid(img image.Image, param1, param2 float32) image.Image {
	if param1 < 0 {
		param1 = 0
	} else if param1 > 1 {
		param1 = 1
	}

	if param2 < -10 {
		param2 = -10
	} else if param2 > 10 {
		param2 = 10
	}

	g := gift.New(gift.Sigmoid(param1, param2))
	newImg := image.NewNRGBA(g.Bounds(img.Bounds()))
	g.Draw(newImg, img)
	return newImg
}

func ColorBalance(img image.Image, param1, param2, param3 float32) image.Image {
	if param1 < -100 {
		param1 = -100
	} else if param1 > 500 {
		param1 = 500
	}

	if param2 < -100 {
		param2 = -100
	} else if param2 > 500 {
		param2 = 500
	}

	if param3 < -100 {
		param3 = -100
	} else if param3 > 500 {
		param3 = 500
	}

	g := gift.New(gift.ColorBalance(param1, param2, param3))
	newImg := image.NewNRGBA(g.Bounds(img.Bounds()))
	g.Draw(newImg, img)
	return newImg
}
