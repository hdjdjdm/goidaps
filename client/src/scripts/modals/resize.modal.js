import { canvas } from '../preview';
import { resizeImage } from '../tools/edit'

const resizeModal = document.createElement('div');
resizeModal.id = 'resize-modal';
resizeModal.className = 'modal';
resizeModal.innerHTML = `
    <div class="modal-content">
        <form id="resize-form">
            <label for="width">Ширина:</label>
            <input type="number" id="width" placeholder="Введите ширину" />
    
            <label for="height">Высота:</label>
            <input type="number" id="height" placeholder="Введите высоту" />
    
            <div>
                <label for="lock-aspect-ratio" class="custom-checkbox">
                    <input type="checkbox" id="lock-aspect-ratio" checked />
                    <span class="checkbox-icon"></span>
                    Сохранить соотношение сторон
                </label>
            </div>
    
            <div class="buttons">
                <button type="button" id="resize-btn">Изменить размер</button>
                <button type="button" id="close-modal">Закрыть</button>
            </div>
        </form>
    </div>
`;

document.body.appendChild(resizeModal);

const openResizeModalButton = document.getElementById('resize');
const closeResizeModalButton = document.getElementById('close-modal');
const resizeButton = document.getElementById('resize-btn');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const aspectRatioCheckbox = document.getElementById('lock-aspect-ratio');

let originalAspectRatio = 1;

openResizeModalButton.addEventListener('click', function () {
    const activeObject = canvas.getObjects('image')[0];
    
    if (activeObject) {
        originalAspectRatio = activeObject.width / activeObject.height;
        widthInput.value = Math.round(activeObject.width);
        heightInput.value = Math.round(activeObject.height);
        resizeModal.style.display = 'block';
    } else {
        alert("Пожалуйста, загрузите изображение для изменения размера.");
    }
});

closeResizeModalButton.addEventListener('click', function () {
    resizeModal.style.display = 'none';
});

window.addEventListener('click', function (event) {
    if (event.target == resizeModal) {
        resizeModal.style.display = 'none';
    }
});

resizeButton.addEventListener('click', function () {
    const newWidth = parseInt(widthInput.value, 10);
    let newHeight = parseInt(heightInput.value, 10);
    
    if (!isNaN(newWidth) && !isNaN(newHeight)) {
        resizeImage(newWidth, newHeight);
        resizeModal.style.display = 'none';
    } else {
        alert("Пожалуйста, введите допустимые размеры.");
    }
});

widthInput.addEventListener('input', function () {
    if (aspectRatioCheckbox.checked) {
        const newWidth = parseInt(widthInput.value, 10);
        if (!isNaN(newWidth)) {
            const newHeight = Math.round(newWidth / originalAspectRatio);
            heightInput.value = newHeight;
        }
    }
});

heightInput.addEventListener('input', function () {
    if (aspectRatioCheckbox.checked) {
        const newHeight = parseInt(heightInput.value, 10);
        if (!isNaN(newHeight)) {
            const newWidth = Math.round(newHeight * originalAspectRatio);
            widthInput.value = newWidth;
        }
    }
});

function handleEnterKey(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        resizeButton.click();
    }
}

widthInput.addEventListener('keydown', handleEnterKey);
heightInput.addEventListener('keydown', handleEnterKey);
