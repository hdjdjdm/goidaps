import { settingImage } from "../tools/edit";

export function createImageSettingsModal() {
    const modalHtml = `
        <div id="image-settings-modal" class="modal">
            <div class="modal-content">
                <h2>Настройки изображения</h2>
                <ul class="settings">
                    <li>
                        <label for="brightness">Яркость</label>
                        <input type="range" id="brightness" name="brightness" min="-100" max="100" value="0">
                        <input type="number" id="brightness-value" min="-100" max="100" value="0">
                    </li>
                    <li>
                        <label for="contrast">Контраст</label>
                        <input type="range" id="contrast" name="contrast" min="-100" max="100" value="0">
                        <input type="number" id="contrast-value" min="-100" max="100" value="0">
                    </li>
                    <li>
                        <label for="gamma">Гамма</label>
                        <input type="range" id="gamma" name="gamma" min="0" max="10" value="1">
                        <input type="number" id="gamma-value" min="0" max="10" value="1">
                    </li>
                    <li>
                        <label for="saturation">Насыщенность</label>
                        <input type="range" id="saturation" name="saturation" min="-100" max="100" value="0">
                        <input type="number" id="saturation-value" min="-100" max="100" value="0">
                    </li>
                    <li>
                        <label for="blur">Размытие</label>
                        <input type="range" id="blur" name="blur" min="0" max="10" value="0">
                        <input type="number" id="blur-value" min="0" max="10" value="0">
                    </li>
                </ul>
                <button id="apply-settings-btn">Применить</button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = document.getElementById('image-settings-modal');
    const applyBtn = document.getElementById('apply-settings-btn');

    const brightnessRange = document.getElementById('brightness');
    const brightnessValue = document.getElementById('brightness-value');
    const contrastRange = document.getElementById('contrast');
    const contrastValue = document.getElementById('contrast-value');
    const gammaRange = document.getElementById('gamma');
    const gammaValue = document.getElementById('gamma-value');
    const saturationRange = document.getElementById('saturation');
    const saturationValue = document.getElementById('saturation-value');
    const blurRange = document.getElementById('blur');
    const blurValue = document.getElementById('blur-value');

    brightnessRange.value = 0;
    brightnessValue.value = 0;
    contrastRange.value = 0;
    contrastValue.value = 0;
    gammaRange.value = 1;
    gammaValue.value = 1;
    saturationRange.value = 0;
    saturationValue.value = 0;
    blurRange.value = 0;
    blurValue.value = 0;

    function validateNumberInput(input, rangeInput, min, max) {
        let value = parseFloat(input.value);
        if (value < min) value = min;
        if (value > max) value = max;
        input.value = value;
        rangeInput.value = value;
    }

    brightnessRange.addEventListener('input', () => brightnessValue.value = brightnessRange.value);
    brightnessValue.addEventListener('input', () => {
        validateNumberInput(brightnessValue, brightnessRange, -100, 100);
    });

    contrastRange.addEventListener('input', () => contrastValue.value = contrastRange.value);
    contrastValue.addEventListener('input', () => {
        validateNumberInput(contrastValue, contrastRange, -100, 100);
    });

    gammaRange.addEventListener('input', () => gammaValue.value = gammaRange.value);
    gammaValue.addEventListener('input', () => {
        validateNumberInput(gammaValue, gammaRange, 0, 10);
    });

    saturationRange.addEventListener('input', () => saturationValue.value = saturationRange.value);
    saturationValue.addEventListener('input', () => {
        validateNumberInput(saturationValue, saturationRange, -100, 100);
    });

    blurRange.addEventListener('input', () => blurValue.value = blurRange.value);
    blurValue.addEventListener('input', () => {
        validateNumberInput(blurValue, blurRange, 0, 10);
    });

    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    applyBtn.onclick = function () {
        const filters = {
            brightness: parseInt(brightnessRange.value),
            contrast: parseInt(contrastRange.value),
            gamma: parseFloat(gammaRange.value),
            saturation: parseFloat(saturationRange.value),
            blur: parseInt(blurRange.value)
        };
        settingImage(filters);
        modal.style.display = 'none';
    };

    modal.style.display = 'block';
}

document.getElementById('image_settings').addEventListener('click', function () {
    createImageSettingsModal();
});
