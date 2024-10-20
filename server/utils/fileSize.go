package utils

import "os"

func FileSize(path string) int64 {
	fileInfo, err := os.Stat(path)
	if err != nil {
		return 0
	}
	return fileInfo.Size()
}
