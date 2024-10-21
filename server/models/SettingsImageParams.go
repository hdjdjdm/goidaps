package models

type SettingsImageParams struct {
	Brightness *float64 `json:"brightness,omitempty"`
	Contrast   *float64 `json:"contrast,omitempty"`
	Gamma      *float64 `json:"gamma,omitempty"`
	Saturation *float64 `json:"saturation,omitempty"`
	Blur       *float64 `json:"blur,omitempty"`
}
