const resizeModal = document.getElementById('resize-modal');
const openResizeModalButton = document.getElementById('resize');
const closeResizeModalButton = document.getElementById('close-modal');
const resizeButton = document.getElementById('resize-btn');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const aspectRatioCheckbox = document.getElementById('lock-aspect-ratio');

// Переменная для хранения исходного соотношения сторон
let originalAspectRatio = 1;

// Открыть модальное окно
openResizeModalButton.addEventListener('click', function () {
    // Получаем активный объект на canvas
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'image') {
        // Сохраняем исходное соотношение сторон
        originalAspectRatio = activeObject.width / activeObject.height;
        widthInput.value = Math.round(activeObject.width);
        heightInput.value = Math.round(activeObject.height);
        resizeModal.style.display = 'block';
    } else {
        alert("Пожалуйста, выберите изображение для изменения размера.");
    }
});

// Закрыть модальное окно
closeResizeModalButton.addEventListener('click', function () {
    resizeModal.style.display = 'none';
});

// Закрытие при клике вне модального окна
window.addEventListener('click', function (event) {
    if (event.target == resizeModal) {
        resizeModal.style.display = 'none';
    }
});

// Обработка изменения размеров
resizeButton.addEventListener('click', function () {
    const newWidth = parseInt(widthInput.value, 10);
    let newHeight = parseInt(heightInput.value, 10);
    
    // Проверка валидности введенных значений
    if (!isNaN(newWidth) && !isNaN(newHeight)) {
        if (aspectRatioCheckbox.checked) {
            // Если выбран флажок "сохранить соотношение сторон", вычисляем новый размер
            if (document.activeElement === widthInput) {
                newHeight = Math.round(newWidth / originalAspectRatio);
                heightInput.value = newHeight;
            } else if (document.activeElement === heightInput) {
                newWidth = Math.round(newHeight * originalAspectRatio);
                widthInput.value = newWidth;
            }
        }
        
        // Изменяем размер изображения
        resizeImage(newWidth, newHeight);
        resizeModal.style.display = 'none';
    } else {
        alert("Пожалуйста, введите допустимые размеры.");
    }
});

